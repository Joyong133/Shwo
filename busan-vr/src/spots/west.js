// 서부산권: 다대포 해수욕장(낙조) / 을숙도
import * as THREE from 'three';
import { addPine, addPerson, addRailing, addLamp } from '../kit3d.js';
import { addBirds, addSkyline } from './common.js';

export function dadaepo(ctx) {
  const { solid: s, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 0, yaw: 0 };
  ctx.bounds = 30;
  ctx.fogRange = [250, 2400];
  ctx.plane(1400, 190, 0, 0, -10, 0xb39678, true); // 넓은 갯벌 모래 (z -105 ~ 85)
  ctx.sea({ y: -0.2, amp: 0.12 });
  // 물이 얇게 고인 갯벌: 노을이 비친다
  const film = new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0.32, depthWrite: false });
  for (let i = 0; i < 26; i++) {
    const geo = new THREE.CircleGeometry(1, 20);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, film);
    m.position.set(-260 + r() * 520, 0.012 + i * 0.0004, -95 + r() * 110);
    m.scale.set(14 + r() * 40, 1, 3 + r() * 8);
    ctx.add(m);
  }
  const foam = ctx.plane(1400, 1.6, 0, 0.02, -104, 0xffe6cf);
  foam.material.transparent = true;
  ctx.anim((t) => {
    foam.position.z = -103 + Math.sin(t * 0.4) * 2.5;
    foam.material.opacity = 0.35 + Math.sin(t * 0.4 + 1) * 0.2;
  });
  // 몰운대 (왼쪽) · 먼 섬들
  s.dome(260, 70, -640, -1, -230, 0x2f4a3a, 1.3);
  for (let i = 0; i < 26; i++) addPine(s, -520 - r() * 220, 30 + r() * 20, -330 + r() * 200, 14 + r() * 8, r);
  s.dome(90, 34, 420, -1, -1300, 0x4a4a5a);
  s.dome(60, 22, 250, -1, -1500, 0x55525f);
  s.dome(520, 120, 1500, -1, -1200, 0x4a4656);
  // 고우니 생태길 (데크) + 갈대
  for (let i = 0; i < 16; i++) {
    const x1 = 34 + i * 9;
    const z1 = 14 - Math.sin(i * 0.4) * 10 - i * 4;
    const x2 = 34 + (i + 1) * 9;
    const z2 = 14 - Math.sin((i + 1) * 0.4) * 10 - (i + 1) * 4;
    s.beam(x1, 1.0, z1, x2, 1.0, z2, 2.4, 0x7a5a3c);
    addRailing(s, x1, z1 - 1.3, x2, z2 - 1.3, 1.1, 1.0, 0x6b4e33, 3);
    s.cyl(0.12, 0.12, 1.1, x1, 0, z1, 0x5a4630, 6);
  }
  for (let i = 0; i < 240; i++) {
    const x = 26 + r() * 190;
    const z = 30 - r() * 110;
    const h = 1.2 + r() * 1.2;
    s.cone(0.1, h, x, 0, z, [0xc9a86a, 0xb89858, 0xd9b87a][i % 3], 4);
    if (i % 3 === 0) s.sphere(0.12, x, h, z, 0xf0d9a8, 1, 2, 1, 6, 4);
  }
  // 낙조를 보는 사람들 · 연
  const dark = [0x2a2430, 0x3a2a30, 0x2f2a3a];
  for (let i = 0; i < 14; i++) {
    const x = -90 + r() * 180;
    const z = -20 - r() * 70;
    addPerson(s, x, 0, z, 1.55 + r() * 0.25, dark[i % 3], 0x4a3a34);
    if (i % 2) addPerson(s, x + 0.6, 0, z + 0.1, 1.5 + r() * 0.2, dark[(i + 1) % 3], 0x4a3a34);
  }
  const kiteC = [0xff5a7a, 0xffd23f, 0x7fd6ff];
  const kites = [];
  for (let i = 0; i < 3; i++) {
    const px = -60 + i * 55;
    const pz = -50 - i * 12;
    addPerson(s, px, 0, pz, 1.6, 0x2a2430, 0x4a3a34);
    const geo = new THREE.PlaneGeometry(2.4, 2.4);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: kiteC[i], side: THREE.DoubleSide, fog: false }));
    m.rotation.z = Math.PI / 4;
    ctx.add(m);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x2a2430, fog: false }));
    line.frustumCulled = false;
    ctx.add(line);
    kites.push({ m, line, px, pz, i });
  }
  ctx.anim((t) => {
    for (const k of kites) {
      const x = k.px + 14 + Math.sin(t * 0.5 + k.i * 2) * 6;
      const y = 26 + k.i * 6 + Math.sin(t * 0.8 + k.i) * 2.5;
      const z = k.pz - 26 + Math.cos(t * 0.4 + k.i) * 4;
      k.m.position.set(x, y, z);
      const p = k.line.geometry.attributes.position;
      p.setXYZ(0, k.px, 1.3, k.pz);
      p.setXYZ(1, x, y, z);
      p.needsUpdate = true;
    }
  });
  // 꿈의 낙조분수 (뒤편 광장): 물줄기가 음악처럼 솟는다
  ctx.disc(34, 0x8a8f96, 0.03, 0, 62, false);
  s.cyl(30, 30, 0.25, 0, 0.03, 62, 0x5f7f9f, 40);
  const jetMats = [0x7fd6ff, 0xff9ad5, 0xfff07a, 0x9dffb0].map((c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.75, fog: false, toneMapped: false }));
  const jetGeo = new THREE.CylinderGeometry(0.08, 0.2, 1, 6);
  jetGeo.translate(0, 0.5, 0);
  const jets = [];
  for (let ring = 0; ring < 3; ring++) {
    const n = 8 + ring * 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const m = new THREE.Mesh(jetGeo, jetMats[(i + ring) % jetMats.length]);
      m.position.set(Math.cos(a) * (6 + ring * 9), 0.3, 62 + Math.sin(a) * (6 + ring * 9));
      ctx.add(m);
      jets.push({ m, ring, a });
    }
  }
  ctx.anim((t) => {
    for (const j of jets) {
      const wave = Math.sin(t * 1.6 - j.ring * 1.1 + j.a * 2) * 0.5 + 0.5;
      j.m.scale.set(1 + wave, 2 + wave * (16 - j.ring * 3.5) + Math.sin(t * 5 + j.a) * 0.4, 1 + wave);
    }
  });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    addLamp(s, g, Math.cos(a) * 36, 0, 62 + Math.sin(a) * 36, 5, 0x3a3f46, 0xffe2a8);
  }
  // 뒤편 아파트 단지와 아미산
  addSkyline(ctx, { x: 0, z: 210, y: 0, width: 620, depth: 90, n: 26, hMin: 50, hMax: 95, colors: [0xb9a79a, 0xa8988c, 0xc9b6a6], wMin: 22, wMax: 40 });
  s.dome(380, 150, 260, -1, 520, 0x3a4f3f);
  s.dome(300, 110, -360, -1, 480, 0x34483a);
  addBirds(ctx, { count: 9, cx: 0, cy: 38, cz: -260, speed: 0.5, path: 'line', color: 0x2a2430, size: 1.6, span: 320 });
}

export function eulsukdo(ctx) {
  const { solid: s, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 10, yaw: 0 };
  ctx.bounds = 26;
  ctx.fogRange = [160, 1700];
  // 탐방 데크 (z 방향)
  ctx.plane(3.6, 100, 0, 0, -26, 0x8a6a48, true);
  for (let z = -76; z <= 24; z += 1.0) s.box(3.6, 0.012, 0.05, 0, 0.001, z, 0x6b4e33);
  addRailing(s, -1.8, -76, -1.8, 24, 0, 1.05, 0x6b4e33, 2.5);
  addRailing(s, 1.8, -76, 1.8, 24, 0, 1.05, 0x6b4e33, 2.5);
  for (let z = -74; z <= 24; z += 7) {
    s.cyl(0.12, 0.12, 1.2, -1.5, -1.1, z, 0x5a4630, 6);
    s.cyl(0.12, 0.12, 1.2, 1.5, -1.1, z, 0x5a4630, 6);
  }
  // 습지: 물길 + 갈대 섬
  ctx.sea({ y: -0.95, amp: 0.05, deep: 0x2a3f55, shallow: 0x7f8fa0 });
  for (let i = 0; i < 70; i++) {
    const x = -260 + r() * 520;
    const z = -250 + r() * 330;
    if (Math.abs(x) < 4) continue;
    s.add(new THREE.CylinderGeometry(1, 1, 0.5, 14), [0x6f7a52, 0x7a8458, 0x5f6a48][i % 3], x, -0.92, z, 0, r() * 3, 0, 8 + r() * 26, 1, 5 + r() * 16);
  }
  // 갈대밭 (탐방로 양옆에 빽빽하게)
  const reed = [0xc9b874, 0xa9a060, 0xd9c890, 0xb8a868];
  for (let i = 0; i < 1100; i++) {
    const side = r() > 0.5 ? 1 : -1;
    const x = side * (2.4 + r() ** 1.7 * 90);
    const z = -110 + r() * 150;
    const h = 1.5 + r() * 1.3;
    s.cone(0.09 + r() * 0.06, h, x, -0.9, z, reed[i % 4], 4);
    if (i % 2 === 0) s.sphere(0.11, x + 0.05, h - 0.95, z, 0xf2e2b8, 1, 2.4, 1, 6, 4);
  }
  // 탐조대
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) s.cyl(0.12, 0.12, 2.6, 7 + sx * 1.6, -0.9, -40 + sz * 1.6, 0x5a4630, 6);
  s.box(4.4, 0.2, 4.4, 7, 1.6, -40, 0x7a5a3c);
  s.box(4.2, 2.2, 4.2, 7, 1.8, -40, 0x8a6a48);
  s.box(4.3, 0.5, 0.1, 7, 2.9, -42.1, 0x1c1c1c);
  s.hip(5.4, 1.4, 5.4, 7, 4.0, -40, 0x4a3a2a, 0.15);
  s.beam(1.8, 0.1, -38, 5, 1.7, -40, 0.9, 0x7a5a3c);
  ctx.sign('을숙도 철새도래지', 2.6, 2.2, 1.5, 2, -Math.PI / 2 + 0.5, { w: 640, h: 150, size: 70, bg: '#14532d', fg: '#ffffff', radius: 14 });
  // 물새들: 백로 · 오리
  for (let i = 0; i < 9; i++) {
    const x = (r() > 0.5 ? 1 : -1) * (8 + r() * 40);
    const z = -70 + r() * 80;
    s.cyl(0.02, 0.02, 0.7, x, -0.95, z, 0x3a3a3a, 4);
    s.sphere(0.2, x, -0.1, z, 0xffffff, 0.8, 1.3, 1.4, 8, 6);
    s.beam(x, 0.05, z - 0.2, x, 0.55, z - 0.42, 0.06, 0xffffff);
    s.sphere(0.09, x, 0.6, z - 0.45, 0xffffff);
    s.beam(x, 0.6, z - 0.5, x, 0.56, z - 0.75, 0.03, 0xf2c230);
  }
  for (let i = 0; i < 26; i++) {
    const x = -70 + r() * 140;
    const z = -150 + r() * 120;
    if (Math.abs(x) < 5) continue;
    s.sphere(0.24, x, -0.82, z, [0x4a3a2a, 0x3a4a3a, 0x5a5a5a][i % 3], 1, 0.7, 1.5, 8, 6);
    s.sphere(0.1, x, -0.62, z - 0.3, 0x1f4a2f);
  }
  addBirds(ctx, { count: 11, cx: -40, cy: 46, cz: -220, speed: 0.55, path: 'line', color: 0x1c1c22, size: 1.8, span: 340 });
  addBirds(ctx, { count: 7, cx: 60, cy: 62, cz: -330, speed: 0.42, path: 'line', color: 0x1c1c22, size: 1.6, span: 380 });
  addBirds(ctx, { count: 6, cx: 20, cy: 12, cz: -50, radius: 30, speed: 0.3, color: 0xffffff });
  // 낙동강 하굿둑
  s.box(900, 7, 16, 0, -0.95, -470, 0xb9b3a6);
  for (let i = 0; i < 11; i++) {
    const x = -300 + i * 60;
    s.box(9, 30, 12, x, 6, -470, 0xc9c3b6);
    s.box(13, 3, 14, x, 36, -470, 0x9aa3ad);
    if (i < 10) s.box(51, 9, 3, x + 30, 6, -470, 0x4f6f8f);
  }
  for (let x = -420; x <= 420; x += 40) {
    s.cyl(0.25, 0.3, 9, x, 6, -462, 0x7f8790, 6);
    g.sphere(0.8, x, 15.4, -462, 0xffe2a8);
  }
  // 하단 아파트 · 승학산 (오른쪽 멀리)
  addSkyline(ctx, { x: 520, z: -620, y: 0, width: 420, depth: 120, n: 22, hMin: 50, hMax: 100, colors: [0x9a93a6, 0x8a8498, 0xaaa2b4], wMin: 22, wMax: 38 });
  s.dome(520, 210, 820, -1, -900, 0x45485a);
  s.dome(420, 130, -900, -1, -820, 0x4a4a5c);
  for (let i = 0; i < 14; i++) addPine(s, 30 + r() * 120, -0.6, 40 + r() * 60, 9 + r() * 5, r);
  s.box(2.2, 0.45, 0.7, 1.0, 0, 6, 0x7a5a3c);
  for (let i = 0; i < 3; i++) addPerson(s, -0.9 + r() * 1.8, 0, -8 - i * 14, 1.6, [0x8a3b4a, 0x3b4a6b, 0xd9a03b][i]);
}
