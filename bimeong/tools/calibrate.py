"""Measures every raw voice and rewrites the trim values in Catalog.kt so all sounds sit at a matched loudness."""
import csv, re, subprocess, sys
raw_dir, catalog = sys.argv[1], sys.argv[2]
target = {  # integrated loudness (LUFS) at full slider
    "rain_drizzle": -22, "rain_eaves": -24, "fire": -21, "waves": -19, "stream": -21, "crickets": -25,
    "frogs": -24, "birds": -24, "purr": -21, "pencil": -23, "fan": -21, "train": -21, "fizz": -24,
}
peak_cap = {  # dBFS at full slider, for sounds made of sparse events
    "thunder": -7, "bowl": -10, "chimes": -11, "clock": -13, "keyboard": -9, "heartbeat": -7, "birds": -9,
    "rain_eaves": -6, "frogs": -8, "crickets": -10,
}
only_peak = {"thunder", "bowl", "chimes", "clock", "keyboard", "heartbeat"}
rows = list(csv.DictReader(open(f"{raw_dir}/stats.csv")))
src = open(catalog).read()
for row in rows:
    sid = row["id"]; scale = float(row["scale"]); raw_peak_db = float(row["raw_peak_db"])
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", f"{raw_dir}/{sid}.wav", "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    lufs_file = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1])
    import math
    raw_lufs = lufs_file - 20 * math.log10(scale)
    gain_db = target.get(sid, -20) - raw_lufs
    cap_db = peak_cap.get(sid, -3) - raw_peak_db
    if sid in only_peak: gain_db = cap_db
    gain_db = min(gain_db, cap_db)
    trim = 10 ** (gain_db / 20)
    print(f"{sid:14s} raw {raw_lufs:6.1f} LUFS  peak {raw_peak_db:6.1f} dB  -> trim {trim:7.4f}  ({raw_lufs + gain_db:6.1f} LUFS, peak {raw_peak_db + gain_db:5.1f})")
    src, n = re.subn(r'(SoundDef\("%s", Category\.\w+, )[\d.]+f' % sid, r"\g<1>%.4ff" % trim, src)
    assert n == 1, sid
open(catalog, "w").write(src)
