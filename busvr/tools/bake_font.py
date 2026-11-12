"""Glyph atlas (Noto Sans CJK KR Bold) holding every character the app can show."""
import glob, os, pickle, struct, zlib, numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "assets")
FONT = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"; PX = 56
chars = set(chr(c) for c in range(32, 127)) | set("↑↗→←↓↖↘·℃▶◀■□○●※~…–—×㎞’‘“”°")
for f in glob.glob(os.path.join(HERE, "..", "src", "*.cpp")) + glob.glob(os.path.join(HERE, "..", "src", "*.h")):
    chars |= set(c for c in open(f, encoding="utf-8").read() if ord(c) > 127)
try:
    R = pickle.load(open("/opt/data/route.pkl", "rb"))
    for _, nm, _ in R["places"]: chars |= set(nm)
    for _, nm in R["regions"]: chars |= set(nm)
except Exception as e: print("no route.pkl:", e)
chars = sorted(c for c in chars if c not in "\n\r\t")
font = ImageFont.truetype(FONT, PX, index=1); ascent, descent = font.getmetrics()
W = 1024; pad = 2; x = y = pad; rowh = 0; glyphs = []; tiles = []
for ch in chars:
    bb = font.getbbox(ch); adv = font.getlength(ch)
    if bb is None or bb[2] <= bb[0] or bb[3] <= bb[1]:
        glyphs.append((ord(ch), 0, 0, 0, 0, 0, 0, int(round(adv)))); continue
    w, h = bb[2] - bb[0] + 2, bb[3] - bb[1] + 2
    im = Image.new("L", (w, h), 0); ImageDraw.Draw(im).text((1 - bb[0], 1 - bb[1]), ch, font=font, fill=255)
    if x + w + pad > W: x = pad; y += rowh + pad; rowh = 0
    tiles.append((x, y, im)); glyphs.append((ord(ch), x, y, w, h, bb[0] - 1, ascent - bb[1] + 1, int(round(adv))))
    x += w + pad; rowh = max(rowh, h)
H = 1
while H < y + rowh + pad: H *= 2
atlas = Image.new("L", (W, H), 0)
for x, y, im in tiles: atlas.paste(im, (x, y))
raw = struct.pack("<IIHHfff", 0x544E4F46, len(glyphs), W, H, float(PX), float(ascent), float(ascent + descent))
for g in glyphs: raw += struct.pack("<IHHHHhhHH", g[0], g[1], g[2], g[3], g[4], g[5], g[6], g[7], 0)
raw += atlas.tobytes()
open(os.path.join(OUT, "font.bin.z"), "wb").write(struct.pack("<I", len(raw)) + zlib.compress(raw, 9))
atlas.save("/tmp/font_atlas.png"); print("glyphs", len(glyphs), "atlas", W, H)
