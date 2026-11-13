// 수영·남구권: 광안리·광안대교 / 오륙도 스카이워크 / 이기대 해안
import * as THREE from 'three';
import {
  Batch, glowMaterial, addPine, addPalm, addPerson, addRailing, addLamp, addLighthouse, addSuspensionBridge,
} from '../kit3d.js';
import { addBirds, addBobbingBoat, addCargoShip, addSkyline } from './common.js';

export function gwangalli(ctx) {
  const { solid: s, bld: b, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: -2, yaw: 0 };
  ctx.bounds = 24;
  ctx.fogRange = [200, 1800];
  ctx.plane(800, 70, 0, 0, 12, 0xcdb98f, true); // 백사장
  ctx.sea({ y: -0.35, amp: 0.2 });
  const foam = ctx.plane(800, 2, 0, 0.03, -24, 0xdfe9ff);
  foam.material.transparent = true;
  ctx.anim((t) => {
    foam.position.z = -23.5 + Math.sin(t * 0.5) * 2;
    foam.material.opacity = 0.3 + Math.sin(t * 0.5 + 1) * 0.2;
  });
  // 광안대교: 구조물 + LED 경관조명(색이 서서히 바뀜)
  const lights = new Batch();
  s.setTransform(0, -0.35, -560, 0, 1.3);
  lights.setTransform(0, -0.35, -560, 0, 1.3);
  addSuspensionBridge(s, lights, { length: 1150, span: 500, towerH: 102, deckY: 34, lights: true, lightColor: 0xffffff, hangerStep: 16 });
  s.resetTransform();
  for (const side of [-1, 1]) {
    s.box(700, 2.4, 24, side * 1095, 41.5, -560, 0xdfe5ec);
    for (let i = 0; i < 8; i++) s.box(5, 44, 14, side * (790 + i * 85), -0.35, -560, 0xb9c1cb);
    for (let x = 760; x < 1440; x += 28) lights.box(2, 0.7, 0.7, side * x, 45.4, -548, 0xffffff);
  }
  const lightMat = glowMaterial();
  const lightMesh = lights.build(lightMat);
  ctx.add(lightMesh);
  const hue = new THREE.Color();
  ctx.anim((t) => {
    hue.setHSL((t * 0.035) % 1, 0.85, 0.62);
    lightMat.color.copy(hue);
  });
  // 불꽃놀이
  const BURSTS = 4;
  const PER = 110;
  const pos = new Float32Array(BURSTS * PER * 3);
  const col = new Float32Array(BURSTS * PER * 3);
  const vel = new Float32Array(BURSTS * PER * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const fw = new THREE.Points(geo, new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  fw.frustumCulled = false;
  ctx.add(fw);
  const bursts = [];
  for (let k = 0; k < BURSTS; k++) bursts.push({ t0: 1.5 + k * 1.7, origin: new THREE.Vector3(), color: new THREE.Color(), live: false });
  const palette = [0xff5a7a, 0xffd23f, 0x7fd6ff, 0x9dff8a, 0xff9a3f, 0xd98aff, 0xffffff];
  ctx.anim((t) => {
    for (let k = 0; k < BURSTS; k++) {
      const bu = bursts[k];
      let age = t - bu.t0;
      if (bu.live && age > 3.4) {
        // 다 타버린 불꽃 → 잠시 뒤 새 위치에서 다시 터짐
        bu.live = false;
        bu.t0 = t + 0.6 + r() * 2.2;
        col.fill(0, k * PER * 3, (k + 1) * PER * 3);
        continue;
      }
      if (!bu.live) {
        if (age < 0) continue;
        bu.live = true;
        bu.t0 = t;
        age = 0;
        bu.origin.set(-320 + r() * 640, 150 + r() * 120, -520 - r() * 60);
        bu.color.setHex(palette[Math.floor(r() * palette.length)]);
        for (let i = 0; i < PER; i++) {
          const a = r() * Math.PI * 2;
          const z = r() * 2 - 1;
          const sr = Math.sqrt(1 - z * z);
          const sp = 46 + r() * 16;
          vel.set([Math.cos(a) * sr * sp, z * sp, Math.sin(a) * sr * sp * 0.4], (k * PER + i) * 3);
        }
        ctx.sfx('firework');
      }
      if (age < 0) continue;
      const fade = Math.max(0, 1 - age / 3.0);
      const drag = (1 - Math.exp(-age * 1.4)) / 1.4;
      for (let i = 0; i < PER; i++) {
        const j = (k * PER + i) * 3;
        pos[j] = bu.origin.x + vel[j] * drag;
        pos[j + 1] = bu.origin.y + vel[j + 1] * drag - 9 * age * age;
        pos[j + 2] = bu.origin.z + vel[j + 2] * drag;
        const tw = 0.6 + 0.4 * Math.sin(age * 30 + i);
        col[j] = bu.color.r * fade * tw;
        col[j + 1] = bu.color.g * fade * tw;
        col[j + 2] = bu.color.b * fade * tw;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  });
  // 해변 산책로 · 카페거리
  s.box(800, 0.5, 8, 0, 0, 50, 0xb9b3a6);
  for (let x = -180; x <= 180; x += 18) {
    addPalm(s, x, 0.5, 48, 6.5);
    addLamp(s, g, x + 9, 0.5, 50, 5.5, 0x3a3f46, 0xffe2a8);
  }
  s.box(800, 0.2, 14, 0, 0.1, 61, 0x2e3136);
  const neon = [0xff4fa0, 0x4fd6ff, 0xffe04f, 0x7dff8a, 0xff7a4f];
  let x = -300;
  while (x < 300) {
    const w = 16 + r() * 16;
    const h = 16 + r() ** 1.4 * 70;
    b.building(w, h, 18, x + w / 2, 0, 80 + r() * 6, [0x8fa0b4, 0x7f8ea2, 0xa9b4c2, 0x6f8098][Math.floor(r() * 4)]);
    g.box(w * 0.7, 1.3, 0.2, x + w / 2, 4.2, 70.6, neon[Math.floor(r() * neon.length)]);
    if (r() > 0.5) g.box(1.3, 7, 0.2, x + w * 0.2, 9 + r() * 6, 70.6, neon[Math.floor(r() * neon.length)]);
    x += w + 1.5 + r() * 3;
  }
  ctx.sign('광안리 GWANGALLI', 9, -11, 1.5, -9, 0.5, { w: 1024, h: 200, size: 120, bg: 'rgba(8,16,36,0.55)', fg: '#ffffff', glow: '#7fd6ff', radius: 30 });
  for (let i = 0; i < 14; i++) addPerson(s, -30 + r() * 60, 0, -16 + r() * 22, 1.5 + r() * 0.3, [0x8a3b4a, 0x3b4a6b, 0x4a6b3b, 0x6b5a3b, 0x555c66][i % 5]);
  // 좌: 마린시티·해운대 원경 / 우: 이기대 능선
  addSkyline(ctx, { x: -980, z: -330, y: -0.35, width: 320, depth: 120, n: 22, hMin: 140, hMax: 330, colors: [0x5f7f9f, 0x4f6f90, 0x6f8fae], wMin: 26, wMax: 44 });
  s.dome(420, 130, 1050, -2, -260, 0x1f3a2a);
  s.dome(300, 90, 820, -2, -40, 0x244a30);
  addBobbingBoat(ctx, -70, -0.3, -120, 12, 0.2, 0xf2f2f2);
  g.box(1.2, 0.5, 1.2, -70, 2.2, -120, 0xfff0c2);
}

export function oryukdo(ctx) {
  const { solid: s, bld: b, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: -9.5, yaw: 0 };
  ctx.bounds = 16;
  ctx.fogRange = [200, 2000];
  const SEA = -36;
  ctx.sea({ y: SEA, amp: 0.6 });
  ctx.plane(110, 60, 0, 0, 33, 0x7fa56a, true); // 절벽 위 잔디 (z 3 ~ 63)
  // 절벽
  s.box(110, 36, 60, 0, SEA, 33, 0x7a7468);
  for (let i = 0; i < 40; i++) s.rock(4 + r() * 6, -52 + r() * 104, SEA + r() * 30, 1 - r() * 9, [0x7a7468, 0x6a655c, 0x8a8478][i % 3], 1, 1.1, 0.8, r() * 3);
  for (let i = 0; i < 18; i++) s.rock(3 + r() * 5, -50 + r() * 100, SEA + 0.5, -10 - r() * 22, 0x5f5a52, 1, 0.6, 1, r() * 3);
  // U자형 유리 스카이워크
  const glassMat = new THREE.MeshBasicMaterial({ color: 0x9fe6f5, transparent: true, opacity: 0.26, depthWrite: false, side: THREE.DoubleSide });
  const deck = (w, d, x, z) => {
    const geo = new THREE.PlaneGeometry(w, d);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, glassMat);
    m.position.set(x, 0, z);
    ctx.add(m);
    ctx.teleport.push(m);
  };
  deck(2.4, 13, -4, -3.5);
  deck(2.4, 13, 4, -3.5);
  deck(10.4, 2.6, 0, -11.3);
  const steel = 0xf2f4f6;
  const frame = [[-5.2, 3, -5.2, -12.6], [5.2, 3, 5.2, -12.6], [-5.2, -12.6, 5.2, -12.6], [-2.8, 3, -2.8, -10], [2.8, 3, 2.8, -10], [-2.8, -10, 2.8, -10]];
  for (const [x1, z1, x2, z2] of frame) {
    s.beam(x1, -0.12, z1, x2, -0.12, z2, 0.26, steel);
    addRailing(s, x1, z1, x2, z2, 0, 1.25, 0xdfe5ea, 1.3);
  }
  for (let z = 1; z > -12; z -= 1.3) {
    s.beam(-5.2, -0.1, z, -2.8, -0.1, z, 0.1, steel);
    s.beam(5.2, -0.1, z, 2.8, -0.1, z, 0.1, steel);
  }
  for (let x = -5; x <= 5; x += 1.3) s.beam(x, -0.1, -10, x, -0.1, -12.6, 0.1, steel);
  for (const sx of [-4, 4]) {
    s.beam(sx, -0.3, 2, sx, -9, 6, 0.5, 0xc9d0d6);
    s.beam(sx, -0.3, -9, sx, -9, 4, 0.4, 0xc9d0d6);
  }
  const railGlass = new Batch();
  for (const [x1, z1, x2, z2] of frame) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    railGlass.box(Math.abs(x2 - x1) > 0.1 ? len : 0.03, 1.1, Math.abs(x2 - x1) > 0.1 ? 0.03 : len, (x1 + x2) / 2, 0.08, (z1 + z2) / 2, 0xffffff);
  }
  ctx.add(railGlass.build(glassMat));
  // 오륙도 여섯 섬
  const isles = [
    [-26, -150, 30, 24, false], [14, -178, 22, 26, true], [46, -270, 28, 36, false],
    [78, -345, 15, 52, false], [34, -450, 46, 54, true], [96, -565, 30, 30, false],
  ];
  for (const [x, z, rad, h, green] of isles) {
    s.rock(rad, x, SEA + h * 0.2, z, 0x8a8272, 1, h / rad, 0.9, r() * 3);
    s.rock(rad * 0.7, x + rad * 0.5, SEA, z + rad * 0.3, 0x7a7468, 1, 0.6, 1, r() * 3);
    if (green) {
      s.dome(rad * 0.6, h * 0.25, x, SEA + h * 0.95, z, 0x3f7a48);
      for (let i = 0; i < 5; i++) addPine(s, x + (r() - 0.5) * rad * 0.7, SEA + h, z + (r() - 0.5) * rad * 0.6, 7, r);
    }
  }
  addLighthouse(s, g, 96, SEA + 27, -565, 20);
  // 절벽 위: 안내소 · 해맞이공원
  b.building(16, 7, 10, 22, 0, 26, 0xf0e9dc);
  s.box(18, 0.4, 12, 22, 7, 26, 0x3a3f46);
  ctx.sign('오륙도 스카이워크', 7, 22, 4.6, 20.9, 0, { w: 768, h: 160, size: 84, bg: '#0f766e', fg: '#ffffff', radius: 20 });
  s.dome(120, 34, -90, -4, 96, 0x5a9458);
  for (let i = 0; i < 18; i++) addPine(s, -50 + r() * 100, 0, 30 + r() * 30, 6 + r() * 4, r);
  for (let i = 0; i < 6; i++) addPerson(s, -8 + r() * 16, 0, 5 + r() * 9, 1.6, [0x8a3b4a, 0x3b4a6b, 0xd9a03b, 0x4a6b3b, 0xffffff, 0x555c66][i]);
  addPerson(s, 3.6, 0, -11.2, 1.65, 0xd94a7a);
  // 원경: 해운대 마천루(왼쪽) · 화물선
  addSkyline(ctx, { x: -1150, z: -900, y: SEA, width: 420, depth: 100, n: 20, hMin: 120, hMax: 330, wMin: 26, wMax: 44 });
  s.dome(380, 110, -1500, SEA, -700, 0x5f8f6a);
  addCargoShip(s, 420, SEA, -980, 110, 0.15);
  addCargoShip(s, -330, SEA, -1300, 120, -0.1, 0x1f3a6b);
  addBobbingBoat(ctx, -60, SEA + 0.1, -90, 9, 1.0, 0xf2f2f2);
  addBirds(ctx, { count: 9, cx: 0, cy: -6, cz: -40, radius: 34, speed: 0.3 });
}

export function igidae(ctx) {
  const { solid: s, bld: b, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 6, yaw: 0.25 };
  ctx.bounds = 20;
  ctx.fogRange = [200, 1900];
  const SEA = -12;
  ctx.sea({ y: SEA, amp: 0.5 });
  // 해안 데크길 (z 방향) + 구름다리
  ctx.plane(4.6, 44, 0, 0, -2, 0x8a6a48, true);
  for (let z = -24; z <= 20; z += 1.1) s.box(4.6, 0.012, 0.05, 0, 0.001, z, 0x6b4e33);
  addRailing(s, -2.3, -24, -2.3, 20, 0, 1.1, 0x6b4e33, 2);
  for (let z = -22; z <= 20; z += 6) s.cyl(0.14, 0.14, 12, -1.6, SEA, z, 0x5a4630, 6);
  const bridgeDeck = ctx.plane(2.2, 24, 0, 0, -36, 0x7a5a3c, true);
  bridgeDeck.position.y = 0;
  for (const sx of [-1.1, 1.1]) {
    s.box(0.25, 5, 0.25, sx, 0, -24.2, 0xb43a2e);
    s.box(0.25, 5, 0.25, sx, 0, -47.8, 0xb43a2e);
    for (let i = 0; i < 12; i++) {
      const z1 = -24.2 - i * 1.97;
      const z2 = z1 - 1.97;
      const y = (z) => 1.2 + 3.8 * ((z + 36) / 11.8) ** 2;
      s.beam(sx, y(z1), z1, sx, y(z2), z2, 0.08, 0x3a3f46);
      s.beam(sx, 0, z1, sx, y(z1), z1, 0.03, 0x3a3f46);
    }
    s.beam(sx, 1.1, -24.2, sx, 1.1, -47.8, 0.05, 0x3a3f46);
  }
  s.box(2.6, 0.3, 0.3, 0, 5, -24.2, 0xb43a2e);
  s.box(2.6, 0.3, 0.3, 0, 5, -47.8, 0xb43a2e);
  ctx.plane(5, 16, 0, 0, -56, 0x8a6a48, true);
  // 오른쪽: 절벽과 해송 숲
  s.box(60, 40, 110, 33, SEA - 4, -20, 0x6f6a5f);
  for (let i = 0; i < 34; i++) s.rock(3 + r() * 5, 4 + r() * 6, SEA + r() * 26, -70 + r() * 100, [0x7a7468, 0x6a655c, 0x8a8478][i % 3], 1, 1.2, 1, r() * 3);
  s.dome(90, 34, 60, 22, -20, 0x3f6a45, 1.5);
  for (let i = 0; i < 34; i++) addPine(s, 7 + r() * 40, 24 + r() * 4, -70 + r() * 100, 7 + r() * 5, r);
  // 왼쪽 아래: 갯바위 · 낚시꾼
  for (let i = 0; i < 30; i++) s.rock(2.5 + r() * 4, -4 - r() * 22, SEA + r() * 3, -66 + r() * 96, [0x5f5a52, 0x6a655c, 0x7a7468][i % 3], 1, 0.6, 1, r() * 3);
  s.rock(4, -14, SEA + 1.5, -6, 0x6a655c, 1.4, 0.5, 1.2);
  addPerson(s, -14, SEA + 3.3, -6, 1.7, 0x3b4a6b);
  s.beam(-14.3, SEA + 4.4, -6, -18.5, SEA + 6.6, -8, 0.04, 0x222222);
  // 바다 건너: 광안대교 + 마린시티 + 해운대
  s.setTransform(-520, SEA, -640, 0.32, 1.1);
  g.setTransform(-520, SEA, -640, 0.32, 1.1);
  addSuspensionBridge(s, g, { length: 1050, span: 480, towerH: 100, deckY: 34, lights: true, lightColor: 0xffe6a8 });
  s.resetTransform();
  g.resetTransform();
  addSkyline(ctx, { x: -80, z: -900, y: SEA, width: 360, depth: 110, n: 24, hMin: 130, hMax: 320, colors: [0x7f9fbf, 0x6f8fb0, 0x8fafce], wMin: 24, wMax: 40 });
  addSkyline(ctx, { x: 330, z: -1150, y: SEA, width: 300, depth: 100, n: 14, hMin: 100, hMax: 380, colors: [0x8fa9c4, 0x9fb9d4], wMin: 26, wMax: 40 });
  s.dome(520, 150, -1150, SEA, -980, 0x4a5f6a);
  s.dome(420, 170, 760, SEA, -1300, 0x55707a);
  for (const lz of [-18, -6, 6, 18]) {
    s.cyl(0.05, 0.05, 1.0, 2.1, 0, lz, 0x3a3f46, 5);
    g.sphere(0.12, 2.1, 1.05, lz, 0xffe2a8);
  }
  for (let i = 0; i < 3; i++) addPerson(s, -0.8 + r() * 1.8, 0, -14 + i * 9, 1.62, [0x8a3b4a, 0xd9a03b, 0x4a6b3b][i]);
  addCargoShip(s, -200, SEA, -420, 70, 0.4, 0x2a2f3a);
  addBobbingBoat(ctx, -60, SEA + 0.1, -70, 9, 0.8, 0xf2f2f2);
  addBirds(ctx, { count: 6, cx: -30, cy: 6, cz: -40, radius: 30, speed: 0.26 });
}
