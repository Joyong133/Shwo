// 동부산권: 해운대 해수욕장 / 마린시티·동백섬 / 해동용궁사 / 기장 죽성성당
import * as THREE from 'three';
import {
  addPine, addPalm, addPerson, addBoat, addRailing, addHanok, addPagoda, addStoneLantern, addLamp, addLighthouse, addSuspensionBridge,
} from '../kit3d.js';
import { addBirds, addBobbingBoat, addCargoShip, addLanternString } from './common.js';

export function haeundae(ctx) {
  const { solid: s, bld: b, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: -4, yaw: 0 };
  ctx.bounds = 26;
  ctx.plane(900, 84, 0, 0, 10, 0xf0dcae, true); // 백사장 (z -32 ~ 52)
  ctx.plane(900, 9, 0, 0.012, -28, 0xd8c090); // 젖은 모래
  ctx.sea({ y: -0.35, amp: 0.22 });
  // 밀려오는 파도 거품
  const foam = ctx.plane(900, 2.2, 0, 0.03, -32, 0xffffff);
  foam.material.transparent = true;
  foam.material.opacity = 0.75;
  ctx.anim((t) => {
    foam.position.z = -31.5 + Math.sin(t * 0.55) * 2.4;
    foam.material.opacity = 0.45 + Math.sin(t * 0.55 + 1.2) * 0.3;
  });
  // 파라솔·선베드
  const colors = [0xff5a4a, 0x3fa7ff, 0xffd23f, 0xffffff, 0x3fd6a0];
  for (const z of [-16, -10]) {
    for (let x = -90; x <= 90; x += 5.5) {
      if (Math.abs(x) < 5) continue;
      const px = x + (r() - 0.5);
      s.cyl(0.035, 0.035, 2.1, px, 0, z, 0xf2f2f2, 5);
      s.cone(1.6, 0.55, px, 2.0, z, colors[Math.floor(r() * colors.length)], 8);
      s.box(0.7, 0.25, 1.9, px + 0.9, 0, z + 0.3, 0xf7f3ea, 0.1);
    }
  }
  for (let i = 0; i < 16; i++) addPerson(s, -40 + r() * 80, 0, -24 + r() * 16, 1.5 + r() * 0.3, [0xff7a59, 0x2f8fd0, 0xf2c230, 0x3fb68a, 0xd94a7a][i % 5]);
  // 인명구조 망루
  for (const sx of [-0.8, 0.8]) for (const sz of [-0.8, 0.8]) s.cyl(0.07, 0.07, 3.2, 14 + sx, 0, -20 + sz, 0xf2c230, 5);
  s.box(2.2, 0.12, 2.2, 14, 3.2, -20, 0xf2c230);
  s.box(2.0, 1.5, 2.0, 14, 3.3, -20, 0xffffff);
  s.hip(2.6, 0.7, 2.6, 14, 4.8, -20, 0xd9482e, 0.1);
  // 부표 줄 · 배
  for (let x = -120; x <= 120; x += 10) s.sphere(0.35, x, -0.25, -75, 0xff7a2a);
  addBobbingBoat(ctx, -60, -0.3, -140, 9, 0.4, 0xd9482e);
  addBobbingBoat(ctx, 75, -0.3, -190, 11, 2.6, 0x2f6fd0);
  addCargoShip(s, 260, -0.35, -900, 90, 0.2);
  // 산책로 · 야자수 · 가로등
  s.box(900, 0.5, 8, 0, 0, 56, 0xc4bcae);
  addRailing(s, -200, 52.2, 200, 52.2, 0.5, 1.0, 0xe6e9ec, 4);
  for (let x = -190; x <= 190; x += 19) {
    addPalm(s, x, 0.5, 54.5, 7 + r() * 2);
    addLamp(s, g, x + 9, 0.5, 57, 6);
  }
  s.box(900, 0.2, 16, 0, 0.1, 68, 0x3f4247);
  // 호텔·고층 빌딩 병풍
  let x = -330;
  while (x < 330) {
    const w = 22 + r() * 22;
    const h = 45 + r() ** 1.5 * 95;
    b.building(w, h, 22 + r() * 10, x + w / 2, 0, 92 + r() * 14, [0xdfe6ee, 0xc9d6e2, 0xf0e9dc, 0xb9c8d8, 0xe9e2d6][Math.floor(r() * 5)]);
    x += w + 3 + r() * 6;
  }
  // 엘시티 (동쪽 끝)
  b.building(34, 300, 34, -400, 0, 120, 0xa9c8de);
  b.building(30, 245, 30, -455, 0, 150, 0xa9c8de);
  b.building(30, 245, 30, -350, 0, 165, 0xa9c8de);
  for (const [tx, th, tz] of [[-400, 300, 120], [-455, 245, 150], [-350, 245, 165]]) s.cone(12, 26, tx, th, tz, 0xcfe3f0, 4);
  // 달맞이 언덕 (왼쪽) · 동백섬과 마린시티 (오른쪽)
  s.dome(230, 70, -640, -2, 40, 0x4f8a55);
  for (let i = 0; i < 14; i++) b.building(18, 20 + r() * 30, 16, -560 - r() * 130, 30 + r() * 20, 30 + (r() - 0.5) * 120, 0xe9e2d6);
  s.dome(140, 38, 520, -2, -30, 0x3f7a48);
  for (let i = 0; i < 12; i++) b.building(30, 170 + r() * 110, 30, 600 + r() * 190, 0, 60 + r() * 120, [0x8fb4d0, 0x9fc0d8, 0x7fa6c4][i % 3]);
  addBirds(ctx, { count: 7, cx: 10, cy: 16, cz: -50, radius: 30, speed: 0.3 });
}

export function marine(ctx) {
  const { solid: s, bld: b, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 0.5, yaw: 0 };
  ctx.bounds = 14;
  ctx.fogRange = [120, 1400];
  ctx.plane(70, 7, 0, 0, 0, 0x6b4e33, true); // 해안 데크 산책로
  for (let x = -34; x <= 34; x += 1.2) s.box(0.05, 0.012, 7, x, 0, 0, 0x4f3a26);
  addRailing(s, -35, -3.4, 35, -3.4, 0, 1.05, 0x8d949c, 2.2);
  for (let x = -30; x <= 30; x += 10) addLamp(s, g, x, 0, 3.1, 3.6, 0x3a3f46, 0xffe2a8);
  ctx.sea({ y: -3, amp: 0.3 });
  // 동백섬 언덕과 해송
  s.dome(90, 30, 0, -4, 62, 0x244a30);
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI - Math.PI;
    const d = 12 + r() * 50;
    addPine(s, Math.cos(a) * d * 1.4, 0.5 + d * 0.22, 14 + Math.abs(Math.sin(a)) * d, 7 + r() * 4, r);
  }
  for (let i = 0; i < 22; i++) s.rock(1.2 + r() * 2, -36 + r() * 72, -3.2, -5 - r() * 5, [0x5a564e, 0x6a655c][i % 2], 1, 0.7, 1, r() * 3);
  // 마린시티 마천루 (바다 건너)
  for (let i = 0; i < 24; i++) {
    const x = -300 + i * 19 + r() * 8;
    const h = 130 + r() ** 1.3 * 190;
    const w = 22 + r() * 12;
    const z = -360 - r() * 90;
    b.building(w, h, w, x, -3, z, [0x5f7f9f, 0x4f6f90, 0x6f8fae, 0x3f5f80][i % 4], r() * 0.6);
    g.box(1.2, 1.2, 1.2, x, h - 2, z, 0xff4040);
    g.box(w * 0.55, 0.05, 70 + h * 0.35, x, -2.85, z + 70 + h * 0.2, [0x4a3d22, 0x3a3a4a, 0x4a4026][i % 3]); // 수면 반사
  }
  // 광안대교 야경 (왼쪽 멀리)
  s.setTransform(-760, -3, -330, 0.55, 1.15);
  g.setTransform(-760, -3, -330, 0.55, 1.15);
  addSuspensionBridge(s, g, { length: 1000, span: 460, towerH: 96, deckY: 32, lights: true, lightColor: 0x7fd6ff });
  s.resetTransform();
  g.resetTransform();
  // 누리마루 APEC하우스
  for (let i = 0; i < 9; i++) s.rock(3 + r() * 3, 40 + r() * 18, -3, -16 - r() * 18, 0x5a564e, 1, 0.8, 1, r() * 3);
  s.cyl(12, 12, 1.2, 50, 0.4, -24, 0xbfc5cc, 20);
  g.cyl(10.5, 10.5, 4.2, 50, 1.6, -24, 0xffdf9e, 20);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    s.cyl(0.3, 0.3, 4.4, 50 + Math.cos(a) * 10.7, 1.6, -24 + Math.sin(a) * 10.7, 0x3a3f46, 6);
  }
  s.dome(13.5, 4.2, 50, 5.8, -24, 0xdfe6ee);
  s.cyl(0.1, 3, 1.2, 50, 9.8, -24, 0xdfe6ee, 12);
  // 등대 · 황옥공주 인어상
  for (let i = 0; i < 6; i++) s.rock(2.5 + r() * 2, -34 + r() * 8, -3, -12 - r() * 8, 0x5a564e, 1, 0.9, 1, r() * 3);
  addLighthouse(s, g, -31, -1, -15, 10);
  s.rock(1.8, 9, -2.6, -11, 0x5a564e, 1.2, 0.8, 1);
  addPerson(s, 9, -1.4, -11, 1.5, 0x4a6a5a, 0x4a6a5a);
  for (let i = 0; i < 5; i++) addPerson(s, -24 + i * 11 + r() * 3, 0, 1 + r() * 1.5, 1.6 + r() * 0.2, [0x8a3b4a, 0x3b4a6b, 0x4a6b3b, 0x6b5a3b, 0x555c66][i]);
  addBoat(s, 120, -3, -180, 16, 0.3, 0x1f2937);
  g.box(1, 0.5, 1, 120, -0.2, -180, 0xfff0c2);
}

export function yonggungsa(ctx) {
  const { solid: s, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 6, yaw: 0 };
  ctx.bounds = 13;
  ctx.plane(38, 30, 0, 0, 0, 0xcbc4b5, true); // 돌마당
  for (let x = -18; x <= 18; x += 3) s.box(0.04, 0.012, 30, x, 0, 0, 0xb3ac9d);
  ctx.sea({ y: -9, amp: 0.55 });
  // 갯바위 절벽
  s.box(38, 9.2, 30, 0, -9.2, 0, 0x7d776b);
  for (let i = 0; i < 46; i++) {
    const side = i % 3;
    const x = side === 0 ? -19 - r() * 16 : side === 1 ? -19 + r() * 50 : 19 + r() * 10;
    const z = side === 0 ? -15 + r() * 40 : side === 1 ? -15 - r() * 20 : -15 + r() * 16;
    s.rock(2.5 + r() * 4, x, -8.5 + r() * 3, z, [0x7d776b, 0x6a655c, 0x8a8478][i % 3], 1, 0.75, 1, r() * 3);
  }
  addRailing(s, -19, -15, 19, -15, 0, 1.0, 0xb7b2a7, 1.6);
  addRailing(s, -19, -15, -19, 15, 0, 1.0, 0xb7b2a7, 1.6);
  // 대웅전 · 석탑 · 석등 · 포대화상
  addHanok(s, { x: 10, y: 0, z: -7, w: 13, d: 8, h: 4.4, ry: -0.5 });
  addHanok(s, { x: 14, y: 0, z: 9, w: 8, d: 5.5, h: 3.4, ry: -Math.PI / 2, wall: 0x8a4a34 });
  addPagoda(s, -6, 0, -8, 3, 2.3);
  addStoneLantern(s, -2.6, 0, -9.5, 1.2);
  addStoneLantern(s, -9.4, 0, -9.5, 1.2);
  s.box(3.4, 1.0, 3.4, -13.5, 0, -2, 0xb7b2a7);
  s.sphere(1.5, -13.5, 2.3, -2, 0xe8c25a, 1, 0.95, 1);
  s.sphere(0.8, -13.5, 4.1, -2, 0xe8c25a);
  // 해수관음대불 (뒤편 언덕)
  s.dome(80, 30, 34, -6, 58, 0x3f7a48);
  s.box(5, 3, 5, 26, 9, 30, 0xcfc9bc);
  s.cyl(1.2, 2.1, 9, 26, 12, 30, 0xf4f2ec, 12);
  s.sphere(1.25, 26, 22.1, 30, 0xf4f2ec);
  s.cyl(1.6, 1.6, 0.2, 26, 23.3, 30, 0xe8c25a, 12);
  for (let i = 0; i < 30; i++) {
    const a = r() * Math.PI * 2;
    const d = 20 + r() * 52;
    addPine(s, 34 + Math.cos(a) * d, Math.max(0, 24 - d * 0.36), 58 + Math.sin(a) * d * 0.8, 7 + r() * 4, r);
  }
  // 돌다리 · 108계단
  s.box(4.2, 0.7, 12, 0, -0.7, 21, 0xb7b2a7);
  addRailing(s, -2.1, 15, -2.1, 27, 0, 1.0, 0xb7b2a7, 1.5);
  addRailing(s, 2.1, 15, 2.1, 27, 0, 1.0, 0xb7b2a7, 1.5);
  for (let i = 0; i < 22; i++) s.box(4.4, 0.4, 0.8, 0, i * 0.4, 27.4 + i * 0.8, 0xbdb7aa);
  // 연등
  addLanternString(ctx, -18, 3.4, -13, 4, 3.4, -13, 14);
  addLanternString(ctx, -18, 3.4, -13, -18, 3.4, 13, 16);
  addLanternString(ctx, -18, 3.2, 13, -3, 3.2, 14.5, 9);
  for (let i = 0; i < 6; i++) addPerson(s, -10 + r() * 16, 0, -4 + r() * 12, 1.55 + r() * 0.25, [0x8a3b4a, 0x3b4a6b, 0x6b6b6b, 0x4a6b3b, 0xd9a03b, 0x555c66][i]);
  // 갯바위에 부서지는 파도
  const sprays = [];
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, fog: false }));
    m.position.set(-16 + i * 8, -8, -19 - (i % 2) * 3);
    ctx.add(m);
    sprays.push(m);
  }
  ctx.anim((t) => {
    sprays.forEach((m, i) => {
      const k = (t * 0.33 + i * 0.23) % 1;
      const up = Math.sin(k * Math.PI);
      m.scale.set(1.5 + up * 2, 0.4 + up * 3.4, 1.5 + up * 2);
      m.position.y = -8.6 + up * 1.4;
      m.material.opacity = 0.65 * up;
    });
  });
  addCargoShip(s, -300, -9, -820, 80, 0.1, 0x1f3a6b);
  addBirds(ctx, { count: 6, cx: -10, cy: 14, cz: -40, radius: 26, speed: 0.28 });
}

export function jukseong(ctx) {
  const { solid: s, glow: g, rand: r } = ctx;
  ctx.spawn = { x: -3, z: 8, yaw: -0.15 };
  ctx.bounds = 14;
  ctx.disc(18, 0x9fa08e, 0);
  ctx.plane(14, 12, 4, 0.02, -2, 0x86a865);
  ctx.sea({ y: -2.4, amp: 0.3 });
  // 갯바위
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2 + r() * 0.2;
    const d = 16.5 + r() * 5;
    if (Math.sin(a) > 0.75) continue;
    s.rock(1.8 + r() * 2.4, Math.cos(a) * d, -2.2 + r() * 0.8, Math.sin(a) * d, [0x6a655c, 0x7d776b, 0x57524a][i % 3], 1, 0.7, 1, r() * 3);
  }
  // 성당: 흰 벽 · 주황 지붕 · 종탑
  const cx = 5;
  const cz = -9;
  s.box(7, 5, 12, cx, 0, cz, 0xf7f3ea);
  s.gable(8.2, 3.9, 12.8, cx, 5, cz, 0xd4532f);
  s.box(3.2, 10, 3.2, cx - 4.4, 0, cz + 4.8, 0xf7f3ea);
  s.hip(3.9, 4.4, 3.9, cx - 4.4, 10, cz + 4.8, 0xd4532f, 0);
  s.box(0.16, 1.5, 0.16, cx - 4.4, 14.3, cz + 4.8, 0x3a3f46);
  s.box(0.9, 0.16, 0.16, cx - 4.4, 15.2, cz + 4.8, 0x3a3f46);
  s.box(1.7, 2.7, 0.12, cx, 0, cz + 6.02, 0x7a4a2a);
  s.cyl(0.8, 0.8, 0.1, cx, 4.2, cz + 6.02, 0x3a4a5a, 14, Math.PI / 2);
  for (const z of [-3.6, 0, 3.6]) {
    s.box(0.12, 2.2, 1.0, cx - 3.52, 1.5, cz + z - 1.5, 0x3a4a5a);
    s.box(0.12, 2.2, 1.0, cx + 3.52, 1.5, cz + z, 0x3a4a5a);
  }
  s.box(1.4, 1.4, 0.12, cx - 4.4, 6.6, cz + 6.42, 0x3a4a5a);
  for (let i = 0; i < 9; i++) s.box(1.6, 0.7, 0.4, -6 + i * 1.9, 0, 3.5, 0xc9c3b6);
  // 방파제와 등대
  s.box(5, 3, 70, -30, -2.4, -45, 0xa8a59a);
  for (let i = 0; i < 26; i++) s.rock(1.6, -33.5 + (i % 2) * 7, -1.8, -12 - i * 2.7, 0x8d8a80, 1, 1, 1, r() * 3, 0);
  addLighthouse(s, g, -30, 0.6, -76, 12);
  s.box(5, 3, 50, 70, -2.4, -90, 0xa8a59a, 0.5);
  addLighthouse(s, g, 82, 0.6, -110, 11, 0xd43c2f, 0xf5f5f5);
  // 어선
  addBobbingBoat(ctx, -14, -2.3, -30, 8, 0.5, 0x2f6fd0);
  addBobbingBoat(ctx, 24, -2.3, -34, 9, 2.2, 0x3f9a5a);
  addBobbingBoat(ctx, -4, -2.3, -52, 7, 1.2, 0xd9482e);
  addBobbingBoat(ctx, 40, -2.3, -60, 10, -0.4, 0xf2c230);
  addCargoShip(s, 200, -2.4, -900, 90, -0.1);
  // 뒤편 마을과 언덕
  ctx.plane(500, 200, 0, -0.1, 118, 0x86a36f);
  s.box(500, 0.12, 8, 0, -0.05, 26, 0x4a4d52);
  for (let i = 0; i < 26; i++) {
    const hx = -120 + r() * 240;
    const hz = 36 + r() * 60;
    s.box(7, 3.4, 6, hx, 0, hz, [0xfff1dc, 0xcfe8ff, 0xffd9d0, 0xe2f5d8, 0xffffff][i % 5]);
    s.gable(7.6, 1.8, 6.6, hx, 3.4, hz, [0xd9482e, 0x3b6ea8, 0x4a4f57, 0x2f7f6f][i % 4], Math.PI / 2);
  }
  s.dome(260, 70, -120, -2, 300, 0x4f8a55);
  s.dome(220, 90, 220, -2, 340, 0x447f4a);
  for (let i = 0; i < 16; i++) addPine(s, -90 + r() * 180, 0, 28 + r() * 10, 6 + r() * 3, r);
  for (let i = 0; i < 4; i++) addPerson(s, -6 + r() * 8, 0, 4.5 + r() * 4, 1.6, [0x8a3b4a, 0x3b4a6b, 0xd9a03b, 0xffffff][i]);
  addBirds(ctx, { count: 8, cx: -6, cy: 13, cz: -30, radius: 28, speed: 0.3 });
}
