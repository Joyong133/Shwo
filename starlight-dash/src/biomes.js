// 지형(바이옴) 정의: 색, 조명, 길가 장식, 장애물 모양.
import { GeoBuilder, tint } from './geo.js';
import { BASE_Y } from './const.js';

const PI = Math.PI;

// ───────────────────────── 길가 장식 ─────────────────────────
// 모든 장식은 (b: 빌더, r: 난수, x, z) 를 받아 지면(BASE_Y) 위에 세운다.

function decoForest(b, r, x, z) {
  const k = r();
  if (k < 0.48) { // 침엽수
    const H = 7 + r() * 6, w = 3.6 + r() * 2;
    b.add('tcyl', x, BASE_Y + H / 2, z, 0.9, H, 0.9, 0x6e4b2a);
    const g = [0x2c8443, 0x35964c, 0x43a858];
    for (let i = 0; i < 3; i++) b.add('cone', x, BASE_Y + H + i * 1.7 - 0.2, z, w - i * 1.0, 3.5, w - i * 1.0, g[i], 0, r() * 3);
  } else if (k < 0.82) { // 둥근 나무
    const H = 6.5 + r() * 5, w = 4.2 + r() * 2.6;
    b.add('tcyl', x, BASE_Y + H / 2, z, 1.0, H, 1.0, 0x7a5230);
    b.add('ico1', x, BASE_Y + H + w * 0.28, z, w, w * 0.85, w, r() < 0.5 ? 0x4caf50 : 0x62bf52, r(), r() * 3);
    b.add('ico', x + w * 0.36, BASE_Y + H - 0.1, z + 0.5, w * 0.56, w * 0.5, w * 0.56, 0x3d9647, r(), r());
  } else if (k < 0.92) { // 바위
    const s = 1.6 + r() * 2.2;
    b.add('ico', x, BASE_Y + s * 0.3, z, s * 1.3, s, s, 0x8f979c, r(), r() * 3);
    b.add('ico', x + s * 0.6, BASE_Y + s * 0.15, z + s * 0.3, s * 0.6, s * 0.5, s * 0.6, 0xa2aab0, r(), r());
  } else { // 덤불과 꽃
    b.add('ico', x, BASE_Y + 0.7, z, 2.4, 1.6, 2.2, 0x55b356, r(), r());
    const fc = [0xff6f91, 0xffd23f, 0xffffff][Math.floor(r() * 3)];
    for (let i = 0; i < 3; i++) b.add('oct', x + (r() - 0.5) * 2.4, BASE_Y + 1.5 + r() * 0.3, z + (r() - 0.5) * 2.2, 0.4, 0.4, 0.4, fc);
  }
}

function decoDesert(b, r, x, z) {
  const k = r();
  if (k < 0.34) { // 기둥 선인장
    const H = 6.5 + r() * 4;
    const c = 0x4f9d58;
    b.add('cyl', x, BASE_Y + H / 2, z, 1.3, H, 1.3, c);
    b.add('ico', x, BASE_Y + H, z, 1.3, 1.1, 1.3, c);
    const ay = BASE_Y + H * 0.5 + r() * 1.2;
    b.add('cyl', x + 1.2, ay, z, 0.8, 1.8, 0.8, c, 0, 0, PI / 2);
    b.add('cyl', x + 1.9, ay + 1.3, z, 0.8, 2.6, 0.8, c);
    b.add('cyl', x - 1.2, ay + 1.0, z, 0.8, 1.8, 0.8, c, 0, 0, PI / 2);
    b.add('cyl', x - 1.9, ay + 2.0, z, 0.8, 2.2, 0.8, c);
  } else if (k < 0.62) { // 사암 언덕
    const w = 6 + r() * 6, H = 5 + r() * 6, d = 5 + r() * 5;
    b.add('cyl6', x, BASE_Y + H / 2, z, w, H, d, 0xc98250, 0, r() * 3);
    b.add('cyl6', x, BASE_Y + H + 0.5, z, w * 0.86, 1.0, d * 0.86, 0xdb9a62, 0, r() * 3);
    if (r() < 0.5) b.add('cyl6', x + w * 0.2, BASE_Y + H + 2.0, z, w * 0.4, 2.2, d * 0.4, 0xc98250, 0, r());
  } else if (k < 0.86) { // 야자수
    const H = 8 + r() * 4;
    const lean = (r() - 0.5) * 0.3;
    b.add('tcyl', x, BASE_Y + H / 2, z, 0.7, H, 0.7, 0x9b7446, 0, 0, lean);
    const tx = x - Math.sin(lean) * H * 0.5, ty = BASE_Y + H;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2 + r() * 0.4;
      b.add('box', tx + Math.cos(a) * 1.7, ty - 0.25, z + Math.sin(a) * 1.7, 3.6, 0.16, 1.0, i % 2 ? 0x4aa55a : 0x3d9450, 0, -a, -0.32);
    }
    b.add('ico', tx, ty, z, 0.9, 0.8, 0.9, 0x7a5a30);
  } else { // 바위 무더기
    const s = 2 + r() * 2;
    b.add('ico', x, BASE_Y + s * 0.3, z, s * 1.4, s, s, 0xd49a63, r(), r() * 3);
    b.add('ico', x - s * 0.7, BASE_Y + s * 0.2, z + 0.4, s * 0.7, s * 0.6, s * 0.7, 0xbf8450, r(), r());
  }
}

function decoSnow(b, r, x, z) {
  const k = r();
  if (k < 0.55) { // 눈 덮인 소나무
    const H = 6.5 + r() * 6, w = 3.8 + r() * 1.8;
    b.add('tcyl', x, BASE_Y + H / 2, z, 0.8, H, 0.8, 0x5a4634);
    for (let i = 0; i < 3; i++) {
      const y = BASE_Y + H + i * 1.8 - 0.4, ww = w - i * 1.0;
      b.add('cone', x, y, z, ww, 3.4, ww, 0x2f6f5b, 0, r() * 3);
      b.add('cone', x, y + 0.75, z, ww * 0.74, 2.2, ww * 0.74, 0xf4f9fd, 0, r() * 3);
    }
  } else if (k < 0.8) { // 얼음 결정
    const H = 3.5 + r() * 5;
    b.add('oct', x, BASE_Y + H * 0.45, z, 1.8 + r(), H, 1.8 + r(), 0x9adcf8, 0, r() * 3, (r() - 0.5) * 0.3);
    b.add('oct', x + 1.3, BASE_Y + H * 0.25, z + 0.6, 1.0, H * 0.55, 1.0, 0xc4ecfd, 0, r() * 3, 0.35);
    b.add('oct', x - 1.1, BASE_Y + H * 0.2, z - 0.5, 0.9, H * 0.45, 0.9, 0x7fcdf4, 0, r() * 3, -0.3);
  } else if (k < 0.93) { // 눈 언덕
    const s = 3 + r() * 4;
    b.add('ico1', x, BASE_Y + s * 0.1, z, s * 1.6, s * 0.7, s * 1.3, 0xfbfdff, 0, r() * 3);
  } else { // 눈사람
    b.add('ico1', x, BASE_Y + 1.1, z, 2.4, 2.2, 2.4, 0xffffff);
    b.add('ico1', x, BASE_Y + 2.7, z, 1.7, 1.6, 1.7, 0xffffff);
    b.add('ico1', x, BASE_Y + 3.9, z, 1.2, 1.2, 1.2, 0xffffff);
    b.add('cone', x, BASE_Y + 3.9, z + 0.8, 0.26, 0.9, 0.26, 0xff8a3d, PI / 2);
    b.add('cyl', x, BASE_Y + 4.7, z, 1.0, 0.7, 1.0, 0x2b3350);
  }
}

function decoVolcano(b, r, x, z) {
  const k = r();
  if (k < 0.5) { // 현무암 첨탑
    const H = 6 + r() * 9, w = 2.4 + r() * 2.4;
    b.add('cone', x, BASE_Y + H / 2, z, w, H, w, 0x3b3338, (r() - 0.5) * 0.16, r() * 3, (r() - 0.5) * 0.16);
    b.add('cone', x + w * 0.6, BASE_Y + H * 0.28, z + 0.4, w * 0.6, H * 0.56, w * 0.6, 0x4a4046, 0, r() * 3, -0.2);
    if (r() < 0.5) b.add('oct', x, BASE_Y + H * 0.99, z, 0.6, 0.9, 0.6, 0xff8a2e);
  } else if (k < 0.75) { // 용암 분출구
    const w = 4 + r() * 3;
    b.add('cyl6', x, BASE_Y + 1.1, z, w, 2.4, w, 0x2f282c, 0, r() * 3);
    b.add('cyl6', x, BASE_Y + 2.32, z, w * 0.62, 0.1, w * 0.62, 0xffa133, 0, r() * 3);
    b.add('oct', x, BASE_Y + 3.4 + r(), z, 0.5, 0.8, 0.5, 0xffc24a);
  } else if (k < 0.92) { // 타 버린 나무
    const H = 5.5 + r() * 4;
    b.add('tcyl', x, BASE_Y + H / 2, z, 0.7, H, 0.7, 0x231c1f);
    b.add('box', x + 0.9, BASE_Y + H * 0.72, z, 2.2, 0.22, 0.22, 0x231c1f, 0, 0, 0.6);
    b.add('box', x - 0.8, BASE_Y + H * 0.56, z, 1.8, 0.2, 0.2, 0x231c1f, 0, 0, -0.7);
    b.add('box', x + 0.2, BASE_Y + H * 0.92, z + 0.5, 0.2, 1.6, 0.2, 0x231c1f, 0.5, 0, 0);
  } else { // 식은 용암 바위
    const s = 2 + r() * 2.4;
    b.add('ico', x, BASE_Y + s * 0.3, z, s * 1.4, s, s * 1.2, 0x40373c, r(), r() * 3);
    b.add('ico', x + 0.3, BASE_Y + s * 0.7, z, s * 0.4, s * 0.3, s * 0.4, 0xff7a2a, r(), r());
  }
}

const NEON = [0x00e5ff, 0xff4fd8, 0xffd23f, 0x7cff6b, 0xb388ff];
function decoNeon(b, r, x, z, side) {
  const k = r();
  if (k < 0.78) { // 빌딩
    const w = 5 + r() * 4.5, d = 5 + r() * 4.5, H = 11 + r() * 20;
    const bx = x + side * w * 0.5; // 길 쪽 모서리가 x에 오도록 바깥으로 민다
    const body = [0x1b2140, 0x232a52, 0x151a33][Math.floor(r() * 3)];
    b.add('box', bx, BASE_Y + H / 2, z, w, H, d, body);
    const wc = r() < 0.6 ? 0xffd98a : NEON[Math.floor(r() * NEON.length)];
    for (let y = BASE_Y + 3.2; y < BASE_Y + H - 1.2; y += 2.4) {
      if (r() < 0.22) continue;
      b.add('box', bx, y, z, w + 0.12, 0.7, d + 0.12, r() < 0.8 ? wc : tint(wc, 0.5));
    }
    b.add('box', bx, BASE_Y + H + 0.15, z, w + 0.5, 0.3, d + 0.5, NEON[Math.floor(r() * NEON.length)]);
    if (r() < 0.5) {
      b.add('box', bx + w * 0.2, BASE_Y + H + 2, z, 0.16, 4, 0.16, 0x3a4270);
      b.add('oct', bx + w * 0.2, BASE_Y + H + 4.1, z, 0.5, 0.5, 0.5, 0xff3b4f);
    }
  } else if (k < 0.92) { // 네온 간판 기둥
    const H = 9 + r() * 4;
    const c = NEON[Math.floor(r() * NEON.length)];
    b.add('box', x, BASE_Y + H / 2, z, 0.4, H, 0.4, 0x2a3160);
    b.add('box', x, BASE_Y + H - 1.2, z, 0.3, 2.6, 3.6, c);
    b.add('box', x, BASE_Y + H - 1.2, z, 0.5, 1.6, 2.6, tint(c, 0.35));
  } else { // 홀로그램 구
    const c = NEON[Math.floor(r() * NEON.length)];
    const H = 8 + r() * 3;
    b.add('box', x, BASE_Y + H / 2, z, 0.3, H, 0.3, 0x2a3160);
    b.add('oct', x, BASE_Y + H + 1.2, z, 2.2, 2.2, 2.2, c, 0, r() * 3);
  }
}

function decoSky(b, r, x, z) {
  const k = r();
  if (k < 0.4) { // 뭉게구름
    const s = 4 + r() * 4;
    const y = BASE_Y + 0.8 + r() * 4.5;
    b.add('ico1', x, y, z, s * 1.5, s * 0.8, s * 1.2, 0xffffff, 0, r() * 3);
    b.add('ico1', x + s * 0.8, y - 0.3, z + 0.6, s, s * 0.6, s, 0xf3f8ff, 0, r() * 3);
    b.add('ico1', x - s * 0.75, y - 0.2, z - 0.5, s * 0.9, s * 0.55, s * 0.9, 0xfafcff, 0, r() * 3);
  } else if (k < 0.72) { // 떠 있는 섬
    const s = 4 + r() * 3.5;
    const y = BASE_Y + 3.5 + r() * 5;
    b.add('cone', x, y - s * 0.55, z, s * 1.3, s * 1.2, s * 1.3, 0x8b6f57, PI, r() * 3);
    b.add('cyl', x, y + 0.2, z, s * 1.36, 0.7, s * 1.36, 0x6cc45c, 0, r() * 3);
    if (r() < 0.75) {
      b.add('tcyl', x, y + 1.9, z, 0.5, 3, 0.5, 0x7a5230);
      b.add('ico1', x, y + 4.1, z, 3, 2.7, 3, r() < 0.5 ? 0xff9ec4 : 0x7dd66a, r(), r());
    } else {
      b.add('cyl', x, y + 2.3, z, 0.8, 3.6, 0.8, 0xf2ede4);
      b.add('box', x, y + 4.3, z, 1.3, 0.4, 1.3, 0xe8b84a);
    }
  } else if (k < 0.9) { // 대리석 기둥
    const H = 7 + r() * 5;
    b.add('cyl', x, BASE_Y + H / 2, z, 1.3, H, 1.3, 0xf2ede4);
    b.add('box', x, BASE_Y + H + 0.25, z, 1.9, 0.5, 1.9, 0xe8b84a);
    b.add('box', x, BASE_Y + 0.4, z, 2.0, 0.8, 2.0, 0xe2dccf);
  } else { // 별 조각상
    const H = 7 + r() * 3;
    b.add('cyl', x, BASE_Y + H / 2, z, 0.5, H, 0.5, 0xe2dccf);
    b.add('oct', x, BASE_Y + H + 1.1, z, 1.8, 2.4, 1.8, 0xffd23f, 0, r() * 3);
  }
}

// ───────────────────────── 장애물 모양 ─────────────────────────
// 원점은 차선 중앙의 바닥. low: 높이 ~0.95(점프), high: 1.3 위쪽을 가로막음(슬라이드), block: 기둥(피하기).

const OB = {
  forest: {
    low(b) {
      b.add('cyl', 0, 0.48, 0, 0.94, 2.06, 0.94, 0x8a5a33, 0, 0, PI / 2);
      b.add('cyl', -1.04, 0.48, 0, 0.8, 0.05, 0.8, 0xdcb680, 0, 0, PI / 2);
      b.add('cyl', 1.04, 0.48, 0, 0.8, 0.05, 0.8, 0xdcb680, 0, 0, PI / 2);
      b.add('ico', 0.5, 0.98, 0.1, 0.5, 0.3, 0.5, 0x58b85a);
    },
    high(b) {
      b.add('box', -0.98, 1.05, 0, 0.26, 2.1, 0.26, 0x6e4b2a);
      b.add('box', 0.98, 1.05, 0, 0.26, 2.1, 0.26, 0x6e4b2a);
      b.add('cyl', 0, 1.72, 0, 0.78, 2.3, 0.78, 0x8a5a33, 0, 0, PI / 2);
      b.add('ico', -0.5, 2.2, 0, 0.9, 0.5, 0.8, 0x4caf50);
      b.add('ico', 0.55, 2.16, 0.1, 0.8, 0.45, 0.7, 0x62bf52);
    },
    block(b) {
      b.add('ico', 0, 1.25, 0, 2.05, 2.7, 1.5, 0x8f979c, 0.3, 0.5);
      b.add('ico', -0.5, 0.5, 0.2, 1.2, 1.1, 1.2, 0x7d858a, 0.6, 1.2);
      b.add('ico', 0.1, 2.5, 0, 1.2, 0.5, 1.0, 0x58b85a, 0, 0.4);
    },
  },
  desert: {
    low(b) {
      b.add('box', 0, 0.4, 0, 2.05, 0.8, 0.85, 0xc98250);
      b.add('box', 0, 0.88, 0, 2.15, 0.16, 0.95, 0xe6b47c);
    },
    high(b) {
      b.add('box', -0.96, 1.05, 0, 0.34, 2.1, 0.6, 0xc98250);
      b.add('box', 0.96, 1.05, 0, 0.34, 2.1, 0.6, 0xc98250);
      b.add('box', 0, 1.74, 0, 2.3, 0.84, 0.7, 0xdb9a62);
      b.add('box', 0, 2.24, 0, 2.5, 0.18, 0.8, 0xe6b47c);
    },
    block(b) {
      b.add('cyl', 0, 1.4, 0, 1.5, 2.8, 1.5, 0x4f9d58);
      b.add('ico', 0, 2.8, 0, 1.5, 1.2, 1.5, 0x4f9d58);
      b.add('cyl', 0.86, 1.6, 0, 0.6, 1.0, 0.6, 0x4f9d58, 0, 0, PI / 2);
      b.add('cyl', -0.86, 1.2, 0, 0.6, 1.0, 0.6, 0x4f9d58, 0, 0, PI / 2);
      b.add('oct', 0, 3.5, 0, 0.5, 0.5, 0.5, 0xff6f91);
    },
  },
  snow: {
    low(b) {
      b.add('box', 0, 0.36, 0, 2.05, 0.72, 0.9, 0x9adcf8);
      b.add('ico1', 0, 0.74, 0, 2.2, 0.56, 1.05, 0xffffff);
    },
    high(b) {
      b.add('oct', -0.98, 1.0, 0, 0.6, 2.3, 0.6, 0x7fcdf4);
      b.add('oct', 0.98, 1.0, 0, 0.6, 2.3, 0.6, 0x7fcdf4);
      b.add('box', 0, 1.72, 0, 2.3, 0.8, 0.6, 0xbfe9fb);
      for (let i = -2; i <= 2; i++) b.add('cone', i * 0.42, 1.2, 0, 0.2, 0.34, 0.2, 0xe8f7ff, PI);
      b.add('ico1', 0, 2.14, 0, 2.3, 0.4, 0.75, 0xffffff);
    },
    block(b) {
      b.add('oct', 0, 1.5, 0, 1.9, 3.3, 1.5, 0x9adcf8, 0, 0.4);
      b.add('oct', -0.55, 0.8, 0.2, 1.0, 1.9, 1.0, 0xc4ecfd, 0, 1, 0.2);
      b.add('oct', 0.6, 0.7, -0.1, 0.9, 1.6, 0.9, 0x7fcdf4, 0, 2, -0.25);
    },
  },
  volcano: {
    low(b) {
      b.add('box', 0, 0.36, 0, 2.05, 0.72, 0.85, 0x3b3338);
      b.add('cone', -0.6, 0.85, 0, 0.7, 0.6, 0.7, 0x4a4046);
      b.add('cone', 0.1, 0.9, 0, 0.8, 0.7, 0.8, 0x3b3338);
      b.add('cone', 0.7, 0.82, 0, 0.6, 0.5, 0.6, 0x4a4046);
      b.add('box', 0, 0.3, 0.44, 1.7, 0.14, 0.04, 0xff8a2e);
    },
    high(b) {
      b.add('box', -0.98, 1.05, 0, 0.34, 2.1, 0.5, 0x3b3338);
      b.add('box', 0.98, 1.05, 0, 0.34, 2.1, 0.5, 0x3b3338);
      b.add('box', 0, 1.74, 0, 2.3, 0.84, 0.62, 0x4a4046);
      b.add('box', 0, 1.5, 0.33, 1.9, 0.12, 0.04, 0xff8a2e);
      for (let i = -2; i <= 2; i++) b.add('cone', i * 0.42, 1.16, 0, 0.24, 0.4, 0.24, 0xff8a2e, PI);
    },
    block(b) {
      b.add('cone', 0, 1.55, 0, 1.9, 3.1, 1.5, 0x3b3338, 0, 0.5);
      b.add('cone', -0.5, 0.8, 0.15, 1.0, 1.7, 1.0, 0x4a4046, 0, 1, 0.15);
      b.add('cone', 0.55, 0.7, 0, 0.9, 1.4, 0.9, 0x2f282c, 0, 2, -0.15);
      b.add('oct', 0, 3.1, 0, 0.36, 0.5, 0.36, 0xff8a2e);
    },
  },
  neon: {
    low(b) {
      b.add('box', 0, 0.44, 0, 2.05, 0.88, 0.6, 0x232a52);
      b.add('box', 0, 0.62, 0.31, 1.9, 0.2, 0.04, 0xff4fd8);
      b.add('box', 0, 0.92, 0, 2.1, 0.1, 0.66, 0xff4fd8);
      b.add('box', 0, 0.26, 0.31, 1.9, 0.12, 0.04, 0xffd23f);
    },
    high(b) {
      b.add('box', -0.98, 1.05, 0, 0.26, 2.1, 0.26, 0x2a3160);
      b.add('box', 0.98, 1.05, 0, 0.26, 2.1, 0.26, 0x2a3160);
      b.add('box', 0, 1.42, 0, 1.9, 0.14, 0.14, 0x00e5ff);
      b.add('box', 0, 1.72, 0, 1.9, 0.14, 0.14, 0x00e5ff);
      b.add('box', 0, 2.02, 0, 1.9, 0.14, 0.14, 0x00e5ff);
      b.add('box', 0, 2.22, 0, 2.3, 0.2, 0.4, 0x2a3160);
    },
    block(b) {
      b.add('box', 0, 0.7, 0, 1.9, 1.4, 1.2, 0x2a3160);
      b.add('box', 0, 2.05, 0, 1.6, 1.3, 1.1, 0x232a52);
      b.add('box', 0, 1.42, 0, 2.0, 0.12, 1.3, 0xffd23f);
      b.add('box', 0, 2.72, 0, 1.7, 0.12, 1.2, 0x00e5ff);
      b.add('box', 0, 0.7, 0.61, 1.2, 0.5, 0.04, 0xff4fd8);
      b.add('box', 0, 2.05, 0.56, 0.9, 0.5, 0.04, 0x7cff6b);
    },
  },
  sky: {
    low(b) {
      b.add('box', 0, 0.2, 0, 2.1, 0.4, 0.8, 0xe2dccf);
      for (let i = -2; i <= 2; i++) b.add('cyl', i * 0.44, 0.58, 0, 0.26, 0.4, 0.26, 0xf2ede4);
      b.add('box', 0, 0.86, 0, 2.15, 0.2, 0.86, 0xe8b84a);
    },
    high(b) {
      b.add('cyl', -0.98, 1.05, 0, 0.36, 2.1, 0.36, 0xf2ede4);
      b.add('cyl', 0.98, 1.05, 0, 0.36, 2.1, 0.36, 0xf2ede4);
      b.add('box', 0, 1.72, 0, 2.4, 0.8, 0.6, 0xf2ede4);
      b.add('box', 0, 2.2, 0, 2.6, 0.2, 0.75, 0xe8b84a);
      b.add('oct', 0, 1.72, 0.32, 0.5, 0.5, 0.2, 0xffd23f);
    },
    block(b) {
      b.add('box', 0, 0.25, 0, 1.9, 0.5, 1.4, 0xe2dccf);
      b.add('cyl', 0, 1.6, 0, 1.4, 2.3, 1.2, 0xf2ede4);
      b.add('box', 0, 2.9, 0, 1.9, 0.4, 1.4, 0xe8b84a);
      b.add('oct', 0, 3.6, 0, 0.8, 1.0, 0.8, 0xffd23f);
    },
  },
};

const obCache = {};
export function obstacleGeo(biome, type) {
  const key = biome.id + ':' + type;
  if (!obCache[key]) {
    const b = new GeoBuilder(600);
    OB[biome.id][type](b);
    obCache[key] = b.build();
  }
  return obCache[key];
}

// ───────────────────────── 바이옴 목록 ─────────────────────────

export const BIOMES = [
  {
    id: 'forest', name: '고요한 숲',
    sky: [0x2f8fe6, 0xcdeefb], fog: [45, 140],
    sun: 0xfff1c9, sunI: 2.3, hemiSky: 0xd6efff, hemiGround: 0x5a7a48, hemiI: 1.7,
    base: 0x4f9a48, baseGlow: 0x000000, stars: 0, clouds: 1,
    pal: { top: 0xd3bd93, top2: 0xc6af84, corner: 0xdcc9a3, side: 0x7b6444, trim: 0x8a6b43, pillar: 0x8d7a5c, wall: 0x7a5d3a, warn: 0xffc21c, smash: 0x8a5a33 },
    particles: { color: 0xeaff9a, size: 0.2, vx: 0.5, vy: 0.25, opacity: 0.75, count: 50 },
    deco: decoForest, decoStep: 4.4, decoProb: 0.82,
  },
  {
    id: 'desert', name: '노을 사막',
    sky: [0xf08a3c, 0xfde2ad], fog: [50, 150],
    sun: 0xffe0b0, sunI: 2.4, hemiSky: 0xffe9c9, hemiGround: 0xb98552, hemiI: 1.6,
    base: 0xe6bd78, baseGlow: 0x000000, stars: 0, clouds: 0.5,
    pal: { top: 0xecd29c, top2: 0xe0c48a, corner: 0xf3dcaa, side: 0xb58d55, trim: 0xc9703f, pillar: 0xc79a62, wall: 0xb5693a, warn: 0x1fb7c9, smash: 0xdb9a62 },
    particles: { color: 0xf3d9a4, size: 0.14, vx: 3.2, vy: 0.1, opacity: 0.55, count: 70 },
    deco: decoDesert, decoStep: 5.2, decoProb: 0.72,
  },
  {
    id: 'snow', name: '얼음 설원',
    sky: [0x6aa6e6, 0xe9f4fc], fog: [40, 130],
    sun: 0xffffff, sunI: 2.0, hemiSky: 0xe8f4ff, hemiGround: 0xa9c4dc, hemiI: 1.9,
    base: 0xeef5fb, baseGlow: 0x000000, stars: 0, clouds: 0.8,
    pal: { top: 0xd4e3ef, top2: 0xc3d6e6, corner: 0xe2eef7, side: 0x8fa9bf, trim: 0x5fb0e4, pillar: 0x9db3c6, wall: 0x6b93b5, warn: 0xff7a3d, smash: 0xbfe9fb },
    particles: { color: 0xffffff, size: 0.2, vx: 0.8, vy: -2.6, opacity: 0.95, count: 120 },
    deco: decoSnow, decoStep: 4.6, decoProb: 0.8,
  },
  {
    id: 'volcano', name: '불의 화산',
    sky: [0x24101c, 0x9a3018], fog: [35, 125],
    sun: 0xffb27a, sunI: 2.0, hemiSky: 0xffb48a, hemiGround: 0xff5a1f, hemiI: 1.5,
    base: 0xff6a1f, baseGlow: 0xd43a00, stars: 0.35, clouds: 0,
    pal: { top: 0x5a5158, top2: 0x4d454b, corner: 0x655b62, side: 0x2a2428, trim: 0xff8a2e, pillar: 0x352e33, wall: 0x2f282c, warn: 0xffd23f, smash: 0x4a4046 },
    particles: { color: 0xffa040, size: 0.16, vx: 0.4, vy: 2.4, opacity: 0.9, count: 90 },
    deco: decoVolcano, decoStep: 4.8, decoProb: 0.78,
  },
  {
    id: 'neon', name: '네온 시티',
    sky: [0x070a20, 0x41206b], fog: [45, 140],
    sun: 0xb9a6ff, sunI: 1.3, hemiSky: 0xcfd6ff, hemiGround: 0x6a4fb0, hemiI: 2.3,
    base: 0x0d1128, baseGlow: 0x000000, stars: 1, clouds: 0,
    pal: { top: 0x39416e, top2: 0x30375f, corner: 0x444d80, side: 0x151a33, trim: 0x00e5ff, pillar: 0x232a52, wall: 0x1b2140, warn: 0xff4fd8, smash: 0x00e5ff },
    particles: { color: 0x7fe9ff, size: 0.12, vx: 0.2, vy: -7, opacity: 0.6, count: 110 },
    deco: decoNeon, decoStep: 7.5, decoProb: 0.86,
  },
  {
    id: 'sky', name: '하늘 정원',
    sky: [0x2f7fe8, 0xcfe8ff], fog: [55, 165],
    sun: 0xfff6dc, sunI: 1.9, hemiSky: 0xe9f5ff, hemiGround: 0xcfd8ee, hemiI: 1.5,
    base: 0xf6faff, baseGlow: 0x000000, stars: 0, clouds: 1,
    pal: { top: 0xe3d8c4, top2: 0xd3c7b0, corner: 0xeee3cf, side: 0xcfc6b8, trim: 0xe8b84a, pillar: 0xe2dccf, wall: 0xd9b565, warn: 0xff5d8f, smash: 0xf2ede4 },
    particles: { color: 0xfff3b0, size: 0.18, vx: 0.3, vy: 0.6, opacity: 0.85, count: 60 },
    deco: decoSky, decoStep: 5.4, decoProb: 0.8,
  },
];
