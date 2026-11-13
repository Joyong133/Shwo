// 원도심·영도권: 감천문화마을 / 자갈치시장·남포동 / 부산타워·용두산공원 / 태종대 / 흰여울문화마을
import * as THREE from 'three';
import {
  Batch, solidMaterial, addPine, addTree, addPerson, addBoat, addRailing, addLamp, addLighthouse, addSuspensionBridge,
} from '../kit3d.js';
import { addBirds, addBobbingBoat, addCargoShip, addSkyline } from './common.js';

/** 부산타워 (k=1 이면 실제 120m 크기) */
export function addBusanTower(s, g, x, y, z, k = 1) {
  s.cyl(9 * k, 10 * k, 7 * k, x, y, z, 0xe9e4da, 16);
  s.cyl(10.6 * k, 10.6 * k, 0.6 * k, x, y + 7 * k, z, 0x3b4350, 16);
  s.cyl(2.5 * k, 3.3 * k, 90 * k, x, y + 7.6 * k, z, 0xf7f7f5, 12);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    s.box(0.5 * k, 90 * k, 0.5 * k, x + Math.cos(a) * 3.05 * k, y + 7.6 * k, z + Math.sin(a) * 3.05 * k, 0xdfe3e8, -a);
  }
  s.cyl(7.6 * k, 4.0 * k, 4 * k, x, y + 97.6 * k, z, 0xf7f7f5, 8);
  s.cyl(7.6 * k, 7.6 * k, 4.2 * k, x, y + 101.6 * k, z, 0x4f7fd0, 8);
  s.cyl(8.7 * k, 8.7 * k, 0.7 * k, x, y + 105.8 * k, z, 0xf7f7f5, 8);
  s.cyl(5.5 * k, 6.5 * k, 3.2 * k, x, y + 106.5 * k, z, 0x6f9fe0, 8);
  s.cyl(7.3 * k, 7.3 * k, 0.6 * k, x, y + 109.7 * k, z, 0xf7f7f5, 8);
  s.cone(6.7 * k, 5.2 * k, x, y + 110.3 * k, z, 0xf7f7f5, 8);
  s.cyl(0.25 * k, 0.5 * k, 9 * k, x, y + 115.5 * k, z, 0xd43c2f, 6);
  if (g) g.sphere(0.9 * k, x, y + 124.8 * k, z, 0xff4040);
}

export function gamcheon(ctx) {
  const { solid: s, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 2, yaw: 0 };
  ctx.bounds = 8;
  ctx.fogRange = [160, 1500];
  // 하늘마루 전망대
  ctx.disc(9.5, 0xcfc8ba, 0);
  s.cyl(9.5, 9.5, 8, 0, -8.02, 0, 0xa8a297, 24);
  for (let i = 0; i < 20; i++) {
    const a1 = Math.PI + (i / 20) * Math.PI;
    const a2 = Math.PI + ((i + 1) / 20) * Math.PI;
    addRailing(s, Math.cos(a1) * 9.2, Math.sin(a1) * 9.2, Math.cos(a2) * 9.2, Math.sin(a2) * 9.2, 0, 1.1, 0xf2f4f6, 3);
  }
  // 골짜기 지형 (그릇 모양) — 바다 쪽(왼쪽 앞)은 트여 있다
  const C = { x: 0, z: -120 };
  const hY = (rho) => -30 + (rho / 170) ** 2 * 48;
  const profile = [];
  for (let rho = 0; rho <= 230; rho += 10) profile.push(new THREE.Vector2(rho, rho <= 170 ? hY(rho) : 18 + (rho - 170) * 0.15));
  const mouthA = THREE.MathUtils.degToRad(205);
  const mouthB = THREE.MathUtils.degToRad(245);
  const bowl = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 56, mouthB, Math.PI * 2 - (mouthB - mouthA)),
    new THREE.MeshLambertMaterial({ color: 0x8f9c7c, side: THREE.DoubleSide }),
  );
  bowl.position.set(C.x, 0, C.z);
  ctx.add(bowl);
  // 계단식 파스텔 집들
  const pastel = [0xff9aa8, 0x8fd3ff, 0xffe27a, 0x9be8c1, 0xffffff, 0xffb37a, 0xb9a6ff, 0x7fc8f0, 0xf7d6e0, 0xbfe6a0];
  const roofs = [0x2f7fc0, 0x3fa58f, 0xd9603f, 0x4a5a6a, 0x2f7fc0, 0x67b0d8];
  for (let rho = 24; rho <= 168; rho += 9.5) {
    const n = Math.floor((Math.PI * 2 * rho) / 9.8);
    for (let i = 0; i < n; i++) {
      const phi = (i / n) * Math.PI * 2 + rho * 0.13;
      const p = ((phi % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      if (p > mouthA - 0.06 && p < mouthB + 0.06) continue;
      const x = C.x + Math.sin(phi) * rho;
      const z = C.z + Math.cos(phi) * rho;
      if (Math.hypot(x, z) < 17) continue;
      if (r() < 0.08) continue;
      const y = hY(rho);
      const w = 5 + r() * 2.6;
      const h = 3 + r() * 2.2;
      const d = 5 + r() * 1.6;
      s.box(w, h + 2.5, d, x, y - 2.5, z, pastel[Math.floor(r() * pastel.length)], phi);
      s.box(w + 0.5, 0.35, d + 0.5, x, y + h, z, roofs[Math.floor(r() * roofs.length)], phi);
      if (r() < 0.3) s.cyl(0.6, 0.6, 1.1, x + 0.8, y + h + 0.35, z + 0.5, 0x2f6fd0, 8);
    }
  }
  // 골목 계단
  for (const phi of [0.5, 1.6, 2.7, 5.2, 5.9]) {
    for (let rho = 30; rho < 165; rho += 3) {
      s.box(1.6, 0.3, 3.1, C.x + Math.sin(phi) * rho, hY(rho) + 0.15, C.z + Math.cos(phi) * rho, 0xe9e6de, phi);
    }
  }
  // 어린왕자와 여우 (난간 위)
  s.box(3.4, 0.9, 0.7, 3.4, 0, -8.4, 0xdcd6c8, -0.38);
  s.cyl(0.2, 0.26, 0.55, 2.9, 0.9, -8.2, 0x4f9a6a, 8);
  s.sphere(0.2, 2.9, 1.62, -8.2, 0xf0d2b0);
  s.sphere(0.21, 2.9, 1.7, -8.16, 0xf2c230, 1, 0.6, 1);
  s.beam(2.9, 1.4, -8.2, 3.3, 1.55, -7.9, 0.07, 0xf2c230);
  s.sphere(0.2, 3.9, 1.12, -8.55, 0xe07a2a, 1.3, 0.9, 0.9);
  s.sphere(0.14, 4.15, 1.3, -8.62, 0xe07a2a);
  s.cone(0.05, 0.13, 4.1, 1.4, -8.62, 0xe07a2a, 4);
  s.cone(0.05, 0.13, 4.2, 1.4, -8.62, 0xe07a2a, 4);
  s.beam(3.65, 1.1, -8.5, 3.4, 1.35, -8.4, 0.09, 0xf0e0c8);
  // 물고기 조형 안내판
  ctx.sign('감천문화마을', 3.4, -5.6, 1.5, -6.6, 0.55, { w: 640, h: 160, size: 86, bg: '#ff7a59', fg: '#ffffff', radius: 80 });
  for (let i = 0; i < 4; i++) addPerson(s, -5 + r() * 9, 0, -3 + r() * 6, 1.6, [0x8a3b4a, 0x3b4a6b, 0xd9a03b, 0x4a6b3b][i]);
  // 능선과 바다(감천항)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.4;
    const p = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (p > mouthA - 0.3 && p < mouthB + 0.3) continue;
    s.dome(150 + (i % 3) * 40, 60 + (i % 2) * 30, C.x + Math.sin(a) * 300, 14, C.z + Math.cos(a) * 300, [0x5a8a55, 0x4f7f4f, 0x669a60][i % 3]);
  }
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2;
    const rho = 178 + r() * 40;
    const p = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (p > mouthA - 0.1 && p < mouthB + 0.1) continue;
    addPine(s, C.x + Math.sin(a) * rho, 18 + (rho - 170) * 0.15, C.z + Math.cos(a) * rho, 9 + r() * 5, r);
  }
  ctx.sea({ y: -31, amp: 0.3 });
  for (let i = 0; i < 6; i++) {
    const cx = -330 - i * 26;
    s.box(4, 34, 4, cx, -31, -330 + i * 14, 0xd9482e);
    s.box(30, 3, 4, cx - 6, 3, -330 + i * 14, 0xd9482e);
  }
  addCargoShip(s, -420, -31, -420, 90, 0.7);
  addBirds(ctx, { count: 5, cx: -10, cy: 14, cz: -60, radius: 30, speed: 0.22, color: 0x333333 });
}

export function jagalchi(ctx) {
  const { solid: s, bld: b, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 4, yaw: 0 };
  ctx.bounds = 18;
  ctx.fogRange = [150, 1400];
  ctx.plane(19, 150, 1, 0, -25, 0xb9b3a6, true); // 물양장 데크 (x -8.5 ~ 10.5)
  for (let z = -98; z <= 48; z += 4) s.box(19, 0.012, 0.08, 1, 0.001, z, 0xa39d90);
  s.box(0.5, 0.5, 150, -8.3, 0, -25, 0xf2c230);
  ctx.sea({ y: -1.8, amp: 0.18 });
  s.box(19.4, 1.9, 150, 1, -1.9, -25, 0x8a857a);
  // 자갈치시장 건물 + 갈매기 지붕
  b.building(30, 22, 62, 26, 0, -36, 0xe9eef2);
  for (const z of [-56, -36, -16]) {
    s.box(17.5, 0.8, 17, 18.5, 22.6, z, 0xffffff, 0, 0, 0.3);
    s.box(17.5, 0.8, 17, 33.5, 22.6, z, 0xffffff, 0, 0, -0.3);
    s.box(1.2, 5, 17, 26, 21.5, z, 0xdfe5ea);
  }
  ctx.sign('자갈치시장', 15, 10.92, 14, -36, -Math.PI / 2, { w: 1024, h: 256, size: 180, bg: '#1d4ed8', fg: '#ffffff', radius: 30 });
  ctx.sign('오이소 · 보이소 · 사이소', 12, 10.92, 9.4, -36, -Math.PI / 2, { w: 1024, h: 140, size: 84, bg: '#ffffff', fg: '#1d4ed8', radius: 20 });
  b.building(26, 30, 30, 26, 0, 22, 0xd9dfe6);
  b.building(28, 18, 30, 27, 0, -95, 0xf0e9dc);
  // 파라솔 좌판
  const parasol = [0xff4a3a, 0x2f8fff, 0xffd23f, 0x3fb86a, 0xff8a2a];
  for (let z = -88; z <= 40; z += 5.2) {
    if (Math.abs(z - 4) < 4) continue;
    const x = 7 + r() * 1.2;
    s.cyl(0.04, 0.04, 2.5, x, 0, z, 0xdfe3e7, 5);
    s.cone(2.1, 0.6, x, 2.4, z, parasol[Math.floor(r() * parasol.length)], 8);
    s.box(2.2, 0.75, 1.3, x, 0, z, 0x6fa8dc);
    for (let k = 0; k < 3; k++) s.cyl(0.36, 0.3, 0.22, x - 0.7 + k * 0.7, 0.75, z, [0xd9482e, 0xb91c1c, 0xe07a2a][k], 10);
    s.box(0.7, 0.3, 0.5, x - 1.6, 0, z + 0.4, 0xf7f7f7);
    addPerson(s, x + 0.2, 0, z - 1.0, 1.5, [0xd94a7a, 0x8a3b8a, 0x2f8f6a, 0xd9482e][Math.floor(r() * 4)]);
  }
  for (let i = 0; i < 10; i++) addPerson(s, -3 + r() * 7, 0, -60 + r() * 90, 1.55 + r() * 0.25, [0x3b4a6b, 0x6b5a3b, 0x555c66, 0x8a3b4a, 0x4a6b3b][i % 5]);
  // 계류 중인 어선
  for (let i = 0; i < 9; i++) addBobbingBoat(ctx, -13 - (i % 2) * 5, -1.7, -80 + i * 13, 9 + (i % 3) * 2, Math.PI / 2 + (r() - 0.5) * 0.2, [0x2f6fd0, 0x3f9a5a, 0xd9482e, 0x1f3a6b][i % 4]);
  // 영도대교 (도개교): 육지 쪽 상판이 들어올려진다
  const BZ = -175;
  s.box(170, 2.2, 14, -110, 7, BZ, 0x8fa0b4);
  for (let x = -180; x <= -30; x += 30) s.box(5, 9, 12, x, -1.8, BZ, 0x9aa3ad);
  s.box(8, 12, 15, 19, -1.8, BZ, 0x9aa3ad);
  s.box(40, 2.2, 14, 44, 7, BZ, 0x8fa0b4);
  const leafB = new Batch();
  leafB.box(42, 2.2, 14, -21, -1.1, 0, 0x7f93aa);
  for (let x = -40; x <= 0; x += 5) {
    leafB.box(0.3, 1.3, 0.3, x, 1.1, 6.6, 0xdfe5ea);
    leafB.box(0.3, 1.3, 0.3, x, 1.1, -6.6, 0xdfe5ea);
  }
  const leaf = leafB.build(solidMaterial());
  leaf.matrixAutoUpdate = true;
  leaf.position.set(17, 9.2, BZ);
  ctx.add(leaf);
  ctx.anim((t) => {
    const k = (t % 40) / 40;
    const up = THREE.MathUtils.smoothstep(k, 0.15, 0.35) * (1 - THREE.MathUtils.smoothstep(k, 0.65, 0.85));
    leaf.rotation.z = -up * 1.05;
  });
  // 영도 (바다 건너) · 용두산 부산타워 (오른쪽 뒤)
  s.dome(420, 120, -620, -2, -200, 0x5a8a5a);
  addSkyline(ctx, { x: -330, z: -120, y: -1.8, width: 160, depth: 300, n: 22, hMin: 14, hMax: 60, colors: [0xe9e2d6, 0xd9dfe6, 0xcfd6c9], wMin: 14, wMax: 26 });
  s.dome(130, 46, 190, -2, 80, 0x5a9458);
  addBusanTower(s, g, 190, 40, 80, 0.9);
  addSkyline(ctx, { x: 120, z: -120, y: 0, width: 150, depth: 260, n: 18, hMin: 20, hMax: 80, wMin: 16, wMax: 28 });
  for (let z = -90; z <= 40; z += 26) addLamp(s, g, -6.8, 0, z, 6);
  addBirds(ctx, { count: 12, cx: -6, cy: 9, cz: -20, radius: 22, speed: 0.34 });
  addCargoShip(s, -160, -1.8, -420, 70, 0.3, 0x1f3a6b);
}

function pavilion(s, x, y, z, w = 7, h = 4) {
  s.box(w + 1.6, 0.6, w + 1.6, x, y, z, 0xb9b3a6);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) s.cyl(0.26, 0.28, h, x + (sx * w) / 2, y + 0.6, z + (sz * w) / 2, 0x7a2a22, 8);
  s.box(w + 0.8, 0.5, w + 0.8, x, y + 0.6 + h, z, 0x2f7f6f);
  s.box(w + 3, 0.22, w + 3, x, y + 1.1 + h, z, 0x2c3138);
  s.hip(w + 2.8, h * 0.6, w + 2.8, x, y + 1.3 + h, z, 0x3b4350, 0.25);
  s.cyl(0.9, 1.1, 2.0, x, y + 1.9, z, 0x6a5a3a, 12); // 종
  s.cyl(0.08, 0.08, 1.4, x, y + 3.9, z, 0x3a3f46, 5);
}

export function tower(ctx) {
  const { solid: s, bld: b, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 10, yaw: 0 };
  ctx.bounds = 22;
  ctx.fogRange = [200, 1700];
  const LOW = -48;
  ctx.disc(27, 0xcfc8ba, 0);
  for (let rr = 6; rr < 27; rr += 5) s.add(new THREE.TorusGeometry(rr, 0.05, 4, 48), 0xb3ac9d, 0, 0.01, 0, Math.PI / 2);
  s.dome(100, 47.5, 0, LOW, 0, 0x5a9458);
  addBusanTower(s, g, 0, 0, -30, 1);
  // 이순신 장군 동상
  s.box(3.4, 6.5, 3.4, -12, 0, -9, 0xbdb7aa);
  s.box(4.4, 0.6, 4.4, -12, 0, -9, 0xa8a297);
  addPerson(s, -12, 6.5, -9, 4.6, 0x4f6a52, 0x4f6a52);
  s.beam(-11.3, 6.6, -8.7, -11.1, 9.4, -8.6, 0.14, 0x3f5a42);
  // 꽃시계 (시곗바늘이 돈다)
  s.cyl(5, 5.6, 0.7, 13, 0, -5, 0x4f9a4a, 24);
  [[4.4, 0xff7ab0], [3.3, 0xffd23f], [2.2, 0xff5a4a], [1.1, 0xffffff]].forEach(([rad, c], i) => s.cyl(rad, rad, 0.06, 13, 0.7 + i * 0.03, -5, c, 24));
  const hands = [];
  for (const [len, wdt, c] of [[3.6, 0.22, 0x1f2937], [2.5, 0.3, 0x1f2937]]) {
    const geo = new THREE.BoxGeometry(wdt, 0.08, len);
    geo.translate(0, 0, -len / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: c }));
    m.position.set(13, 0.95, -5);
    ctx.add(m);
    hands.push(m);
  }
  ctx.anim((t) => {
    hands[0].rotation.y = -t * 0.35;
    hands[1].rotation.y = -t * 0.03 - 1;
  });
  pavilion(s, 17, 0, 9, 6.5, 4);
  // 나무·벤치·가로등·사람
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2;
    const d = 28.5 + r() * 5;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (Math.abs(x) < 13 && z < -20) continue;
    if (x < -10 && z < 14 && z > -30) continue; // 전망 방향은 비워 둔다
    if (i % 2) addPine(s, x, -1.5, z, 8 + r() * 4, r);
    else addTree(s, x, -1.5, z, 6 + r() * 3, [0x4f8a45, 0x5d9a4f, 0xd98aa8][i % 3]);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    addLamp(s, g, Math.cos(a) * 22, 0, Math.sin(a) * 22, 5);
    s.box(2, 0.45, 0.6, Math.cos(a + 0.2) * 20, 0, Math.sin(a + 0.2) * 20, 0x8a6a4a, -a);
  }
  for (let i = 0; i < 18; i++) {
    const a = Math.PI * 0.72 + (i / 18) * Math.PI * 0.62;
    const a2 = Math.PI * 0.72 + ((i + 1) / 18) * Math.PI * 0.62;
    addRailing(s, Math.cos(a) * 26.6, Math.sin(a) * 26.6 * -1, Math.cos(a2) * 26.6, Math.sin(a2) * 26.6 * -1, 0, 1.1, 0xe6e9ec, 3);
  }
  for (let i = 0; i < 10; i++) addPerson(s, -14 + r() * 28, 0, -14 + r() * 26, 1.5 + r() * 0.3, [0x8a3b4a, 0x3b4a6b, 0xd9a03b, 0x4a6b3b, 0x555c66][i % 5]);
  for (let i = 0; i < 12; i++) s.sphere(0.07, -4 + r() * 8, 0.06, -2 + r() * 6, 0x8d949c, 1, 0.9, 1.5);
  // 발아래 원도심 · 부산항 · 영도
  ctx.plane(1900, 1000, 0, LOW, -40, 0x8c9198);
  for (let i = 0; i < 190; i++) {
    const x = -600 + r() * 1200;
    const z = -520 + r() * 640;
    if (Math.hypot(x, z) < 105) continue;
    const near = Math.hypot(x, z) < 260;
    b.building(14 + r() * 20, 10 + r() ** 2 * (near ? 45 : 85), 14 + r() * 16, x, LOW, z, [0xe8e4da, 0xd9dfe6, 0xcfd6c9, 0xf0e6d6, 0xc7d3e0][i % 5], r() > 0.5 ? 0 : Math.PI / 2);
  }
  ctx.sea({ y: LOW - 1.5, amp: 0.3 });
  for (let i = 0; i < 8; i++) {
    const cx = -260 + i * 75;
    s.box(5, 46, 5, cx, LOW, -548, 0xd9482e);
    s.box(40, 4, 5, cx, LOW + 46, -560, 0xd9482e);
  }
  s.dome(520, 150, -820, LOW, -1050, 0x5f8f6a);
  addSkyline(ctx, { x: -560, z: -860, y: LOW, width: 300, depth: 120, n: 16, hMin: 20, hMax: 70, wMin: 18, wMax: 30 });
  s.setTransform(560, LOW - 1.5, -900, 0.35, 1.0);
  g.setTransform(560, LOW - 1.5, -900, 0.35, 1.0);
  addSuspensionBridge(s, g, { length: 1100, span: 500, towerH: 120, deckY: 60 });
  s.resetTransform();
  g.resetTransform();
  addCargoShip(s, 60, LOW - 1.5, -700, 110, 0.1);
  addCargoShip(s, -200, LOW - 1.5, -820, 90, -0.3, 0x1f3a6b);
  s.dome(600, 180, 900, LOW, 300, 0x5a8a5a);
  s.dome(700, 220, -300, LOW, 900, 0x4f7f4f);
  addBirds(ctx, { count: 6, cx: 0, cy: 30, cz: -10, radius: 26, speed: 0.2, color: 0x555555 });
}

export function taejongdae(ctx) {
  const { solid: s, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 3, yaw: 0 };
  ctx.bounds = 10;
  ctx.fogRange = [220, 2200];
  const SEA = -62;
  ctx.disc(11.5, 0xbdb6a8, 0);
  for (let i = 0; i < 16; i++) {
    const a1 = Math.PI + (i / 16) * Math.PI;
    const a2 = Math.PI + ((i + 1) / 16) * Math.PI;
    addRailing(s, Math.cos(a1) * 11.2, Math.sin(a1) * 11.2, Math.cos(a2) * 11.2, Math.sin(a2) * 11.2, 0, 1.15, 0xe6e9ec, 3);
  }
  ctx.sea({ y: SEA, amp: 0.7 });
  // 해안 절벽
  s.box(260, 62, 120, 0, SEA, 60, 0x7a7468);
  s.cyl(11.5, 17, 62, 0, SEA, 0, 0x8a8478, 14);
  for (let i = 0; i < 60; i++) {
    const x = -120 + r() * 240;
    const rad = 6 + r() * 9;
    s.rock(rad, x, Math.min(SEA + r() * 56, -3 - rad * 1.4), 2 - r() * 14 - Math.abs(x) * 0.04, [0x7a7468, 0x6a655c, 0x8a8478, 0x9a9486][i % 4], 1, 1.4, 0.8, r() * 3);
  }
  for (let i = 0; i < 26; i++) s.rock(4 + r() * 6, -110 + r() * 220, SEA + 1, -14 - r() * 30, 0x5f5a52, 1, 0.5, 1, r() * 3);
  // 영도등대 (왼쪽 아래) · 신선바위 · 망부석
  s.rock(22, -52, SEA + 14, -40, 0x8a8478, 1.2, 1.1, 1, 0.4);
  s.box(9, 5, 7, -52, SEA + 36, -38, 0xf5f5f5);
  s.box(10, 0.5, 8, -52, SEA + 41, -38, 0x3b6ea8);
  addLighthouse(s, g, -45, SEA + 36, -44, 26);
  s.box(34, 4, 22, -6, SEA + 6, -62, 0x9a9486, 0.3);
  s.rock(2.2, -2, SEA + 12.5, -64, 0x7a7468, 0.7, 2.2, 0.7);
  for (let i = 0; i < 5; i++) addPerson(s, -14 + i * 5, SEA + 10, -60 + r() * 5, 1.7, [0xd94a7a, 0x3b4a6b, 0xd9a03b, 0xffffff, 0x4a6b3b][i]);
  for (let i = 0; i < 40; i++) s.box(1.6, 0.25, 0.7, -14 - i * 0.9, -0.5 - i * 0.6, -4 - i * 0.95, 0xbdb7aa, 0.75);
  // 뒤편: 해송 숲 · 순환도로 · 다누비 열차 · 전망대 건물
  ctx.plane(260, 110, 0, -0.02, 66, 0x5f8a55);
  s.box(260, 0.06, 7, 0, 0, 20, 0x45484d);
  for (let i = 0; i < 70; i++) {
    const x = -125 + r() * 250;
    const z = 26 + r() * 90;
    addPine(s, x, 0, z, 9 + r() * 6, r);
  }
  for (let i = 0; i < 12; i++) addPine(s, (i % 2 ? 1 : -1) * (14 + r() * 40), 0, 6 + r() * 9, 8 + r() * 4, r);
  s.cyl(9, 9, 3.2, 20, 0, 9, 0xe9e4da, 18);
  s.cyl(9.2, 9.2, 2.6, 20, 3.2, 9, 0x6f9fd0, 18);
  s.cyl(10.4, 10.4, 0.5, 20, 5.8, 9, 0xf2f4f6, 18);
  s.box(1.6, 2.2, 1.6, -8, 0, 6.5, 0xdcd6c8);
  addPerson(s, -8.2, 2.2, 6.5, 2.0, 0xf4f2ec, 0xf4f2ec);
  addPerson(s, -7.5, 2.2, 6.6, 1.2, 0xf4f2ec, 0xf4f2ec);
  const train = new THREE.Group();
  const tb = new Batch();
  const cars = [0x2f6fd0, 0xf2c230, 0xd9482e, 0x3f9a5a];
  cars.forEach((c, i) => {
    const x = -i * 5.4;
    tb.box(4.8, 1.5, 2.2, x, 0.5, 0, c);
    tb.box(5, 0.18, 2.5, x, 2.9, 0, 0xffffff);
    for (const px of [-2.2, 2.2]) for (const pz of [-1, 1]) tb.cyl(0.05, 0.05, 0.9, x + px, 2.0, pz, 0xffffff, 5);
    for (const wx of [-1.6, 1.6]) for (const wz of [-1.1, 1.1]) tb.cyl(0.42, 0.42, 0.25, x + wx, 0.42, wz, 0x1c1c1c, 10, Math.PI / 2);
    if (i === 0) {
      tb.box(1.6, 1.0, 2.0, x + 3.0, 0.5, 0, c);
      tb.cyl(0.25, 0.3, 0.9, x + 3.2, 1.5, 0, 0x2a2a2a, 8);
    } else {
      for (let k = 0; k < 3; k++) addPerson(tb, x - 1.4 + k * 1.4, 1.1, 0.4, 1.25, [0xd94a7a, 0x3b4a6b, 0xffffff][k]);
    }
  });
  const trainMesh = tb.build(solidMaterial());
  train.add(trainMesh);
  train.position.set(0, 0.06, 20);
  ctx.add(train);
  ctx.anim((t) => {
    train.position.x = ((t * 5 + 90) % 220) - 110;
  });
  // 주전자섬 · 먼바다의 배
  s.rock(34, 150, SEA + 6, -520, 0x7a7468, 1.3, 0.8, 1, 0.5);
  s.dome(22, 20, 150, SEA + 22, -520, 0x4f7f4f);
  addCargoShip(s, -380, SEA, -1100, 130, 0.1);
  addCargoShip(s, 260, SEA, -1500, 150, -0.05, 0x1f3a6b);
  addCargoShip(s, 40, SEA, -800, 90, 0.5, 0x2a2f3a);
  addBobbingBoat(ctx, 50, SEA + 0.2, -160, 12, 0.8, 0xf2f2f2);
  for (let i = 0; i < 5; i++) addPerson(s, -6 + r() * 12, 0, -6 + r() * 8, 1.6, [0x8a3b4a, 0x3b4a6b, 0xd9a03b, 0x4a6b3b, 0x555c66][i]);
  addBirds(ctx, { count: 8, cx: 0, cy: -8, cz: -40, radius: 40, speed: 0.25 });
}

export function huinnyeoul(ctx) {
  const { solid: s, bld: b, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 14, yaw: 0.12 };
  ctx.bounds = 26;
  ctx.fogRange = [200, 2000];
  const SEA = -28;
  ctx.plane(3.4, 86, 0, 0, -12, 0xdcd6c8, true); // 흰여울길 (z -55 ~ 31)
  ctx.sea({ y: SEA, amp: 0.4 });
  // 바다 쪽 흰 담장 (파란 띠)
  s.box(0.35, 1.0, 86, -1.85, 0, -12, 0xfaf8f2);
  s.box(0.38, 0.14, 86, -1.85, 1.0, -12, 0x3b8ad0);
  // 절벽 · 절영해안산책로
  s.box(40, 26, 100, -22, SEA - 1, -12, 0x7a7468);
  for (let i = 0; i < 40; i++) s.rock(3 + r() * 5, -6 - r() * 10, SEA + 3 + r() * 15, -60 + r() * 96, [0x7a7468, 0x6a655c, 0x8a8478][i % 3], 1, 1.3, 1, r() * 3);
  s.box(4, 0.6, 110, -15, SEA + 2.6, -12, 0x4f9ad0);
  for (let z = -64; z < 42; z += 6) s.box(4.1, 0.62, 2, -15, SEA + 2.61, z, [0xff5a4a, 0xffd23f, 0x3fb86a, 0x4f9ad0][Math.floor((z + 64) / 6) % 4]);
  for (let i = 0; i < 28; i++) s.rock(2 + r() * 4, -19 - r() * 12, SEA + 0.5, -62 + r() * 100, 0x5f5a52, 1, 0.6, 1, r() * 3);
  // 무지개 계단
  const rainbow = [0xff5a4a, 0xff9a3f, 0xffd23f, 0x3fb86a, 0x4f9ad0, 0x6a5acd, 0xb565d8];
  for (let i = 0; i < 28; i++) s.box(1.8, 0.3, 0.7, -2.9 - i * 0.42, -0.3 - i * 0.82, -30 - i * 0.2, rainbow[i % 7], 0.3);
  // 언덕 쪽 흰 집들 (3단)
  const doorC = [0x3b8ad0, 0x2fa59a, 0xf2c230, 0xff7a59, 0x8a6ad0];
  for (let row = 0; row < 4; row++) {
    const baseX = 2.3 + row * 7.2;
    const y = row * 3.3;
    let z = -56;
    s.box(7.4, 3.3, 92, baseX + 3.5, y - 3.3, -12, 0xcfc9bc);
    while (z < 30) {
      const len = 5 + r() * 3.5;
      const h = 2.7 + r() * 0.9;
      s.box(5.6, h, len, baseX + 2.9, y, z + len / 2, row === 0 && r() < 0.2 ? 0xdff0fa : 0xfaf8f2);
      s.box(5.9, 0.2, len + 0.3, baseX + 2.9, y + h, z + len / 2, [0x4a90c8, 0x9aa3ad, 0x3fa58f, 0xd9603f][Math.floor(r() * 4)]);
      const dc = doorC[Math.floor(r() * doorC.length)];
      s.box(0.08, 1.9, 0.9, baseX + 0.06, y, z + len * 0.3, dc);
      s.box(0.08, 0.9, 1.2, baseX + 0.06, y + 1.1, z + len * 0.7, 0x5f7f9f);
      s.box(0.12, 0.08, 1.4, baseX + 0.02, y + 1.02, z + len * 0.7, dc);
      if (r() < 0.4) s.cyl(0.5, 0.5, 0.9, baseX + 2 + r() * 2, y + h + 0.2, z + len / 2, 0x2f6fd0, 8);
      if (row === 0 && r() < 0.55) {
        s.cyl(0.18, 0.14, 0.3, baseX - 0.25, 0, z + 0.6, 0xb5653a, 8);
        s.sphere(0.26, baseX - 0.25, 0.5, z + 0.6, 0x4f9a4a);
      }
      z += len + 0.5 + r() * 1.4;
    }
  }
  s.dome(160, 70, 110, 8, -10, 0x4f7f4f, 1.6);
  // 카페 간판 · 조명 · 고양이
  ctx.sign('흰여울 카페', 2.2, 2.26, 2.3, 4, -Math.PI / 2, { w: 512, h: 128, size: 76, bg: '#ffffff', fg: '#1d4ed8', border: '#3b8ad0', radius: 20 });
  ctx.sign('바다 전망대 →', 2.0, 2.26, 2.2, -16, -Math.PI / 2, { w: 512, h: 128, size: 66, bg: '#3b8ad0', fg: '#ffffff', radius: 20 });
  for (let z = -50; z <= 28; z += 13) {
    s.cyl(0.04, 0.04, 2.6, 1.9, 0, z, 0x3a3f46, 5);
    g.sphere(0.16, 1.9, 2.7, z, 0xffe2a8);
  }
  const cat = (x, y, z, c) => {
    s.sphere(0.16, x, y + 0.14, z, c, 0.8, 0.8, 1.5);
    s.sphere(0.11, x, y + 0.3, z - 0.22, c);
    s.cone(0.035, 0.09, x - 0.05, y + 0.38, z - 0.22, c, 4);
    s.cone(0.035, 0.09, x + 0.05, y + 0.38, z - 0.22, c, 4);
    s.beam(x, y + 0.14, z + 0.22, x + 0.08, y + 0.4, z + 0.3, 0.035, c);
  };
  cat(-1.85, 1.14, 6.5, 0xf2a03a);
  cat(-1.85, 1.14, -9, 0xffffff);
  cat(-1.85, 1.14, -24, 0x3a3a3a);
  for (let i = 0; i < 5; i++) addPerson(s, -0.8 + r() * 1.8, 0, -44 + i * 13 + r() * 3, 1.6, [0x8a3b4a, 0x3b4a6b, 0xd9a03b, 0xffffff, 0x4a6b3b][i]);
  // 묘박지의 배들 · 남항대교 · 송도
  for (let i = 0; i < 16; i++) {
    addCargoShip(s, -160 - r() * 900, SEA, -700 + r() * 900, 60 + r() * 70, r() * 3, [0x7a2a22, 0x1f3a6b, 0x2a2f3a, 0x8a5a2a][i % 4]);
  }
  s.box(700, 4, 16, -420, SEA + 30, -520, 0xdfe5ec, 0.2);
  for (let i = 0; i < 9; i++) s.box(6, 31, 12, -720 + i * 75, SEA, -458 - i * 15.2, 0xb9c1cb, 0.2);
  s.dome(380, 130, -980, SEA, -620, 0x5a6f7a);
  addSkyline(ctx, { x: -820, z: -560, y: SEA, width: 260, depth: 80, n: 14, hMin: 40, hMax: 150, colors: [0x9fb4c8, 0x8fa4b8], wMin: 20, wMax: 34 });
  for (let i = 0; i < 3; i++) b.building(18, 30 + r() * 20, 16, 60 + i * 30, 18, -70 + r() * 60, 0xe9e2d6);
  addBobbingBoat(ctx, -40, SEA + 0.1, -40, 10, 0.6, 0xf2f2f2);
  addBirds(ctx, { count: 7, cx: -20, cy: -2, cz: -20, radius: 26, speed: 0.27 });
}
