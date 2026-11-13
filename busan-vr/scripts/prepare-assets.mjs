// 빌드 전 자동 실행 (predev / prebuild)
// 1) PWA·APK 아이콘 PNG를 코드로 생성 (외부 이미지 파일 없음)
// 2) Meta Quest 컨트롤러 3D 모델(WebXR input profiles)을 public/xr-profiles 로 복사 → 오프라인에서도 컨트롤러 모델 표시
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');

// ───────────────── PNG 인코더 ─────────────────
const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ───────────────── 아이콘 그림: 노을 지는 광안대교 ─────────────────
const mix = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
const mix3 = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const HORIZON = 0.63;
function cableV(u) {
  const d = Math.abs(u - 0.5);
  if (d <= 0.2) return 0.545 - 0.235 * (d / 0.2) ** 2; // 주경간 (가운데가 가장 낮음)
  const s = Math.min(1, (d - 0.2) / 0.24);
  return 0.31 + 0.255 * s ** 1.25; // 측경간
}
function iconColor(u, v, inset) {
  // inset: maskable 아이콘은 안전영역(가운데 80%)에 그림이 들어가도록 축소
  u = 0.5 + (u - 0.5) / inset;
  v = 0.5 + (v - 0.5) / inset;
  let c;
  if (v < HORIZON) {
    c = mix3([11, 27, 58], [52, 70, 140], smooth(0.0, 0.42, v));
    c = mix3(c, [255, 138, 92], smooth(0.36, HORIZON, v));
    const sd = Math.hypot(u - 0.5, (v - 0.585) * 1.0);
    c = mix3(c, [255, 190, 120], (1 - smooth(0.1, 0.34, sd)) * 0.55); // 햇무리
    c = mix3(c, [255, 226, 150], 1 - smooth(0.118, 0.126, sd)); // 해
  } else {
    const t = (v - HORIZON) / (1 - HORIZON);
    c = mix3([40, 84, 150], [8, 24, 58], smooth(0, 1, t));
    const ripple = Math.sin(v * 240 + Math.sin(u * 22) * 2.2) * 0.5 + 0.5;
    const glit = (1 - smooth(0.0, 0.2, Math.abs(u - 0.5))) * (1 - t * 0.7);
    c = mix3(c, [255, 190, 130], ripple * glit * 0.75); // 윤슬
  }
  // 광안대교 실루엣
  const white = [246, 248, 255];
  let b = 0;
  const deck = 0.565;
  b = Math.max(b, 1 - smooth(0.006, 0.009, Math.abs(v - deck))); // 상판
  if (u > 0.03 && u < 0.97) {
    b = Math.max(b, 1 - smooth(0.004, 0.0065, Math.abs(v - cableV(u)))); // 주케이블
    const hang = Math.abs(((u * 40) % 1) - 0.5) * 2; // 행어
    if (hang > 0.9 && v > cableV(u) && v < deck && Math.abs(u - 0.5) < 0.44) b = Math.max(b, 0.55);
  }
  for (const tu of [0.3, 0.7]) {
    if (v > 0.285 && v < HORIZON + 0.03) b = Math.max(b, 1 - smooth(0.012, 0.015, Math.abs(u - tu))); // 주탑
  }
  for (const pu of [0.1, 0.2, 0.4, 0.5, 0.6, 0.8, 0.9]) {
    if (v > deck && v < HORIZON + 0.015) b = Math.max(b, (1 - smooth(0.005, 0.007, Math.abs(u - pu))) * 0.9); // 교각
  }
  return mix3(c, white, b);
}
function renderIcon(size, inset) {
  const rgba = Buffer.alloc(size * size * 4);
  const SS = 3;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, bl = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = iconColor((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size, inset);
          r += c[0]; g += c[1]; bl += c[2];
        }
      }
      const i = (y * size + x) * 4;
      rgba[i] = Math.round(r / (SS * SS));
      rgba[i + 1] = Math.round(g / (SS * SS));
      rgba[i + 2] = Math.round(bl / (SS * SS));
      rgba[i + 3] = 255;
    }
  }
  return encodePng(size, rgba);
}

function writeIcons() {
  const dir = path.join(pub, 'icons');
  fs.mkdirSync(dir, { recursive: true });
  const jobs = [
    ['icon-192.png', 192, 1],
    ['icon-512.png', 512, 1],
    ['maskable-512.png', 512, 0.8],
  ];
  for (const [name, size, inset] of jobs) {
    const file = path.join(dir, name);
    if (fs.existsSync(file)) continue;
    fs.writeFileSync(file, renderIcon(size, inset));
    console.log(`[assets] 아이콘 생성: public/icons/${name}`);
  }
}

// ───────────────── Quest 컨트롤러 모델 복사 ─────────────────
function copyXrProfiles() {
  const src = path.join(root, 'node_modules', '@webxr-input-profiles', 'assets', 'dist', 'profiles');
  const dst = path.join(pub, 'xr-profiles');
  if (!fs.existsSync(src)) {
    console.warn('[assets] @webxr-input-profiles/assets 가 없습니다. (npm install 필요) → 컨트롤러는 기본 도형으로 표시됩니다.');
    return;
  }
  const wanted = [
    'oculus-touch-v2', // Quest 1
    'oculus-touch-v3', // Quest 2
    'meta-quest-touch-plus', // Quest 3 / 3S
    'meta-quest-touch-plus-v2',
    'meta-quest-touch-pro', // Quest Pro
  ];
  fs.mkdirSync(dst, { recursive: true });
  const list = JSON.parse(fs.readFileSync(path.join(src, 'profilesList.json'), 'utf8'));
  const filtered = {};
  for (const [id, entry] of Object.entries(list)) {
    if (wanted.includes(id)) filtered[id] = entry;
  }
  fs.writeFileSync(path.join(dst, 'profilesList.json'), JSON.stringify(filtered, null, 2));
  let copied = 0;
  for (const id of wanted) {
    const from = path.join(src, id);
    if (!fs.existsSync(from)) continue;
    const to = path.join(dst, id);
    if (!fs.existsSync(to)) {
      fs.cpSync(from, to, { recursive: true });
      copied++;
    }
  }
  if (copied) console.log(`[assets] Quest 컨트롤러 모델 ${copied}종 복사: public/xr-profiles/`);
}

writeIcons();
copyXrProfiles();
