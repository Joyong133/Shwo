// 도심·북부산권: 서면 / 사직야구장 / 범어사·금정산성
import * as THREE from 'three';
import {
  Batch, solidMaterial, glowMaterial, addPine, addTree, addPerson, addLamp, addHanok, addPagoda, addStoneLantern, addRailing,
} from '../kit3d.js';
import { addLanternString } from './common.js';

export function seomyeon(ctx) {
  const { solid: s, bld: b, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 9.6, z: 6, yaw: 0.35 };
  ctx.bounds = 26;
  ctx.fogRange = [60, 520];
  ctx.plane(240, 420, 0, 0, -120, 0x2b2e33, true); // 아스팔트
  // 차선 · 횡단보도 · 인도
  for (let z = -320; z < 60; z += 9) {
    if (Math.abs(z + 2) < 14) continue;
    s.box(0.18, 0.012, 4, 0, 0.001, z, 0xf2c230);
    s.box(0.15, 0.012, 3, -3.6, 0.001, z, 0xe9e9e9);
    s.box(0.15, 0.012, 3, 3.6, 0.001, z, 0xe9e9e9);
  }
  for (let x = -6.6; x <= 6.6; x += 1.2) {
    s.box(0.6, 0.014, 4, x, 0.001, -9, 0xf4f4f4);
    s.box(0.6, 0.014, 4, x, 0.001, 9.5, 0xf4f4f4);
  }
  for (const sx of [-1, 1]) {
    s.box(5.5, 0.2, 300, sx * 10.2, 0, -168, 0x8a8f96);
    s.box(5.5, 0.2, 60, sx * 10.2, 0, 42, 0x8a8f96);
    s.box(110, 0.2, 5.5, sx * 62, 0, -12.5, 0x8a8f96);
    s.box(110, 0.2, 5.5, sx * 62, 0, 9.5, 0x8a8f96);
  }
  // 양쪽 빌딩 + 네온 간판
  const neon = [0xff4fa0, 0x4fd6ff, 0xffe04f, 0x7dff8a, 0xff7a4f, 0xb48aff];
  const words = ['돼지국밥', '밀면', '노래방', '치킨·맥주', 'CAFE', '약국', 'PC방', '영화관', '떡볶이', '서면시장', '지하상가', '포차', '씨앗호떡', '안경', '사진관', '헤어샵'];
  const signColors = ['#e11d48', '#2563eb', '#f59e0b', '#16a34a', '#7c3aed', '#db2777', '#0891b2'];
  let wi = 0;
  for (const sx of [-1, 1]) {
    for (const [z0, z1] of [[-320, -16], [14, 70]]) {
      let z = z0;
      while (z < z1 - 8) {
        const w = Math.min(10 + r() * 14, z1 - z);
        const h = 22 + r() ** 1.5 * 95;
        const d = 16 + r() * 10;
        const x = sx * (13 + d / 2);
        b.building(d, h, w, x, 0, z + w / 2, [0x8c98a8, 0x7c8898, 0x9aa6b4, 0x6f7c8c, 0xa8a094][Math.floor(r() * 5)]);
        const face = sx * 12.9;
        // 세로 네온 + 가게 간판
        g.box(0.2, 5 + r() * 6, 1.3, face, 6 + r() * 10, z + w * (0.2 + r() * 0.6), neon[Math.floor(r() * neon.length)]);
        if (z > -150) {
          const word = words[wi % words.length];
          const col = signColors[wi % signColors.length];
          wi++;
          ctx.sign(word, Math.min(w * 0.8, 6.5), face - sx * 0.12, 3.6 + (wi % 3) * 2.2, z + w / 2, -sx * (Math.PI / 2), { w: 512, h: 128, size: 82, bg: col, fg: '#ffffff', radius: 14, glow: '#ffffff' });
        }
        g.box(0.15, 0.5, w * 0.9, face, 2.75, z + w / 2, 0xfff0c2);
        z += w + 0.4 + r() * 1.6;
      }
    }
    // 교차로 가로 방향 건물
    for (let x = 16; x < 120; x += 16 + r() * 8) {
      for (const sz of [-1, 1]) {
        b.building(15, 20 + r() * 60, 14, sx * (x + 8), 0, sz === -1 ? -23 : 20, [0x8c98a8, 0x7c8898, 0x9aa6b4][Math.floor(r() * 3)]);
        g.box(8, 1.2, 0.2, sx * (x + 8), 4 + r() * 3, sz === -1 ? -15.9 : 12.9, neon[Math.floor(r() * neon.length)]);
      }
    }
  }
  // 대형 전광판 (색이 바뀜)
  const adMat = new THREE.MeshBasicMaterial({ color: 0xff4fa0, toneMapped: false, fog: false });
  const ad = new THREE.Mesh(new THREE.PlaneGeometry(11, 6.5), adMat);
  ad.position.set(-12.8, 17, -30);
  ad.rotation.y = Math.PI / 2;
  ctx.add(ad);
  const adText = ctx.sign('SEOMYEON', 9.5, -12.7, 17, -30, Math.PI / 2, { w: 1024, h: 256, size: 170, bg: null, fg: '#ffffff', glow: '#ffffff' });
  adText.renderOrder = 2;
  const adColor = new THREE.Color();
  ctx.anim((t) => adColor.setHSL((t * 0.08) % 1, 0.8, 0.5) && adMat.color.copy(adColor));
  // 지하철 입구 (1·2호선)
  s.box(3.4, 0.25, 5.4, 10.6, 2.6, 13, 0x3a3f46);
  for (const [px, pz] of [[9, 10.5], [12.2, 10.5], [9, 15.5], [12.2, 15.5]]) s.cyl(0.07, 0.07, 2.6, px, 0.2, pz, 0x8d949c, 6);
  s.box(3.2, 1.0, 0.1, 10.6, 0.2, 15.6, 0xcfe6f2);
  for (let i = 0; i < 6; i++) s.box(2.8, 0.2, 0.5, 10.6, -0.05 - i * 0.2, 11 + i * 0.6, 0x9aa3ad);
  ctx.sign('서면역', 3.0, 10.6, 3.25, 10.3, Math.PI, { w: 512, h: 150, size: 84, bg: '#111827', fg: '#ffffff', sub: '1호선 · 2호선', subColor: '#f59e0b', subSize: 34, radius: 14 });
  g.box(0.5, 0.5, 0.12, 9.4, 3.25, 10.26, 0xf06a00);
  g.box(0.5, 0.5, 0.12, 11.8, 3.25, 10.26, 0x55b331);
  // 포장마차
  s.box(4, 2.3, 2.6, -10.2, 0.2, -22, 0xe8792a);
  g.box(3.6, 0.8, 0.1, -10.2, 1.3, -20.66, 0xffb469);
  s.hip(4.6, 0.7, 3.2, -10.2, 2.5, -22, 0xd9602a, 0.5);
  // 가로등 · 가로수(꼬마전구)
  for (let z = -300; z <= 50; z += 26) {
    if (Math.abs(z) < 16) continue;
    addLamp(s, g, -8.3, 0.2, z, 7, 0x3a3f46, 0xfff0c2);
    addTree(s, 8.4, 0.2, z + 12, 4.6, 0x3f6a45);
    for (let k = 0; k < 7; k++) g.sphere(0.07, 8.4 + (r() - 0.5) * 2.4, 2.6 + r() * 2.4, z + 12 + (r() - 0.5) * 2.4, 0xffe9a8);
  }
  // 달리는 자동차 (전조등·후미등)
  const carColors = [0xf4f4f4, 0x1f2937, 0xb91c1c, 0x1d4ed8, 0xf59e0b, 0x9ca3af, 0x111111, 0xffffff];
  const cars = [];
  const carMat = solidMaterial();
  const carGlow = glowMaterial();
  for (let i = 0; i < 9; i++) {
    const lane = i % 4;
    const dir = lane < 2 ? 1 : -1; // +z 방향(우리 쪽으로) / -z 방향
    const cb = new Batch();
    cb.box(1.8, 0.75, 4.3, 0, 0.3, 0, carColors[i % carColors.length]);
    cb.box(1.6, 0.6, 2.2, 0, 1.05, 0.15, 0x10151c);
    const cg = new Batch();
    cg.box(0.32, 0.14, 0.06, -0.6, 0.72, -2.16, 0xfff6d0);
    cg.box(0.32, 0.14, 0.06, 0.6, 0.72, -2.16, 0xfff6d0);
    cg.box(0.32, 0.12, 0.06, -0.6, 0.72, 2.16, 0xff3030);
    cg.box(0.32, 0.12, 0.06, 0.6, 0.72, 2.16, 0xff3030);
    const car = new THREE.Group();
    car.add(cb.build(carMat), cg.build(carGlow));
    car.position.set([-5.4, -1.8, 1.8, 5.4][lane], 0, -300 + i * 38);
    car.rotation.y = dir > 0 ? Math.PI : 0;
    ctx.add(car);
    cars.push({ car, dir, speed: 9 + (i % 3) * 2.5 });
  }
  ctx.anim((t, dt) => {
    for (const c of cars) {
      // 빨간불: 횡단보도 앞에서 잠깐 멈춤
      const red = t % 24 > 15;
      const stopZ = c.dir > 0 ? -14 : 14;
      const ahead = (stopZ - c.car.position.z) * c.dir;
      const hold = red && ahead > 0 && ahead < 6;
      if (!hold) c.car.position.z += c.dir * c.speed * dt;
      if (c.car.position.z > 60) c.car.position.z = -320;
      if (c.car.position.z < -320) c.car.position.z = 60;
    }
  });
  for (let i = 0; i < 26; i++) {
    const sx = r() > 0.5 ? 1 : -1;
    addPerson(s, sx * (8.4 + r() * 3.8), 0.2, -80 + r() * 120, 1.5 + r() * 0.3, [0x8a3b4a, 0x3b4a6b, 0xd9a03b, 0x4a6b3b, 0x555c66, 0xffffff, 0xd94a7a][i % 7]);
  }
}

export function sajik(ctx) {
  const { solid: s, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 1.2, yaw: 0 };
  ctx.bounds = 8;
  ctx.fogRange = [300, 1400];
  ctx.light = { hemi: [0xffffff, 0x5a6878, 1.75], dir: [0xfff8e8, 1.5] }; // 조명탑이 켜진 야간 경기
  const F = -6; // 그라운드 높이
  const HOME = { x: 0, z: -15 };
  ctx.plane(26, 5.5, 0, 0, 1, 0x4a4f57, true); // 내 좌석 단
  s.box(26, 6, 5.5, 0, F, 1, 0x5a6068);
  addRailing(s, -13, -1.7, 13, -1.7, 0, 0.95, 0x2f6fd0, 2.6);
  // 잔디 · 내야 흙 · 베이스 · 파울라인
  ctx.disc(128, 0x3f8f45, F, 0, -88, false);
  for (let i = 0; i < 9; i++) s.add(new THREE.RingGeometry(20 + i * 11, 25.5 + i * 11, 48, 1, Math.PI * 0.25, Math.PI * 0.5), 0x4a9a50, HOME.x, F + 0.02, HOME.z, -Math.PI / 2);
  s.box(27.4, 0.03, 27.4, HOME.x, F + 0.03, HOME.z - 19.4, 0xb98a5a, Math.PI / 4);
  s.box(23.4, 0.03, 23.4, HOME.x, F + 0.05, HOME.z - 19.4, 0x4a9a50, Math.PI / 4);
  s.cyl(2.75, 2.75, 0.3, HOME.x, F + 0.04, HOME.z - 18.4, 0xb98a5a, 20);
  s.cyl(4, 4, 0.05, HOME.x, F + 0.04, HOME.z, 0xb98a5a, 20);
  const bases = [[0, 0], [19.4, -19.4], [0, -38.8], [-19.4, -19.4]];
  for (const [bx, bz] of bases) s.box(0.5, 0.08, 0.5, HOME.x + bx, F + 0.08, HOME.z + bz, 0xffffff, Math.PI / 4);
  for (const sx of [-1, 1]) {
    s.beam(HOME.x, F + 0.07, HOME.z, HOME.x + sx * 70, F + 0.07, HOME.z - 70, 0.14, 0xffffff);
    s.cyl(0.12, 0.12, 18, HOME.x + sx * 70, F, HOME.z - 70, 0xf2c230, 6);
  }
  // 외야 펜스 + 워닝트랙
  const R = 100;
  for (let i = 0; i < 36; i++) {
    const a1 = -Math.PI / 4 + (i / 36) * (Math.PI / 2);
    const a2 = -Math.PI / 4 + ((i + 1) / 36) * (Math.PI / 2);
    const x1 = HOME.x + Math.sin(a1) * R;
    const z1 = HOME.z - Math.cos(a1) * R;
    const x2 = HOME.x + Math.sin(a2) * R;
    const z2 = HOME.z - Math.cos(a2) * R;
    s.box(Math.hypot(x2 - x1, z2 - z1) + 0.2, 3.2, 0.5, (x1 + x2) / 2, F, (z1 + z2) / 2, i % 6 === 2 ? 0xf97316 : 0x1e3a8a, -(a1 + a2) / 2);
  }
  // 관중석 (3단) + 주황 응원 물결
  const crowdCols = [0xff7a1a, 0xff7a1a, 0xff8f33, 0xffffff, 0x1e3a8a, 0xff7a1a, 0xd94a2a];
  const stand = (a, radius, y, depth, len, crowd = true) => {
    const cx = HOME.x + Math.sin(a) * radius;
    const cz = HOME.z + Math.cos(a) * radius;
    s.add(new THREE.BoxGeometry(len, 1, depth), 0x6a7078, cx, y, cz, -0.42, a, 0);
    s.box(len, 30, 2, HOME.x + Math.sin(a) * (radius + depth * 0.46), y - 26, HOME.z + Math.cos(a) * (radius + depth * 0.46), 0x4f555d, a);
    if (!crowd) return;
    const cs = Math.cos(a);
    const sn = Math.sin(a);
    for (let k = 0; k < len * depth * 0.14; k++) {
      const lx = (r() - 0.5) * len * 0.96;
      const ld = (r() - 0.5) * depth * 0.9;
      const px = cx + lx * cs + ld * sn * 0.91;
      const pz = cz - lx * sn + ld * cs * 0.91;
      const py = y + 0.55 + ld * 0.445;
      s.box(0.55, 0.75, 0.5, px, py, pz, crowdCols[Math.floor(r() * crowdCols.length)], a);
    }
  };
  for (let t = 0; t < 3; t++) {
    const radius = 24 + t * 17;
    const y = -1.5 + t * 7.4;
    const n = 14 + t * 4;
    for (let i = 0; i < n; i++) {
      const a = -2.25 + (i / (n - 1)) * 4.5;
      if (t === 0 && Math.abs(a) < 0.42) continue; // 내가 서 있는 자리
      stand(a, radius, y, 16, ((radius + 8) * 4.5) / (n - 1) + 0.4);
    }
  }
  for (let i = 0; i < 12; i++) {
    const a = Math.PI - 0.72 + (i / 11) * 1.44;
    stand(a, 118, 1, 22, 15.5);
  }
  // 전광판
  s.box(52, 20, 3, 0, 12, HOME.z - 150, 0x15181d);
  s.box(3, 12, 3, -18, 0, HOME.z - 150, 0x3a3f46);
  s.box(3, 12, 3, 18, 0, HOME.z - 150, 0x3a3f46);
  ctx.sign('롯데 5 : 3 원정', 46, 0, 24, HOME.z - 148.4, 0, { w: 1024, h: 320, size: 150, bg: '#0b0f14', fg: '#ffb020', glow: '#ff8a00', sub: '8회말 2아웃 · 부산 갈매기 ♪', subColor: '#7dff9a', subSize: 58, radius: 8 });
  // 조명탑
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.52;
    const x = HOME.x + Math.sin(a) * 140;
    const z = HOME.z - 40 + Math.cos(a) * 140;
    s.cyl(0.9, 1.3, 52, x, F, z, 0x8d949c, 8);
    const ang = Math.atan2(HOME.x - x, HOME.z - 40 - z);
    s.box(16, 9, 1.2, x, 44, z, 0x3a3f46, ang);
    for (let ix = -2; ix <= 2; ix++) for (let iy = 0; iy < 3; iy++) g.box(2.6, 2.4, 0.4, x + Math.cos(ang) * ix * 3.0 + Math.sin(ang) * 0.7, 45 + iy * 2.8, z - Math.sin(ang) * ix * 3.0 + Math.cos(ang) * 0.7, 0xfffbe6, ang);
  }
  // 선수들
  const P = [[0, -18.4, 0xffffff], [0, 1.4, 0x1e3a8a], [-0.9, -0.3, 0xff7a1a], [20, -19, 0xffffff], [8, -33, 0xffffff], [-8, -33, 0xffffff], [-20, -19, 0xffffff], [-48, -62, 0xffffff], [0, -84, 0xffffff], [48, -62, 0xffffff], [19.4, -18, 0xff7a1a]];
  for (const [px, pz, c] of P) addPerson(s, HOME.x + px, F + 0.05, HOME.z + pz, 1.85, c);
  s.beam(HOME.x - 1.2, F + 1.3, HOME.z - 0.3, HOME.x - 1.9, F + 2.2, HOME.z - 0.7, 0.08, 0xc9a066);
  for (const sx of [-1, 1]) {
    s.box(16, 2.6, 4, sx * 24, F, HOME.z + 4, 0x2a2f36, sx * -0.75);
    for (let k = 0; k < 5; k++) addPerson(s, sx * (19 + k * 2), F + 0.3, HOME.z + 1 + k * 1.6, 1.5, sx > 0 ? 0xff7a1a : 0x1e3a8a);
  }
  // 타구
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }));
  ctx.add(ball);
  ctx.anim((t) => {
    const k = (t % 9) / 9;
    if (k < 0.12) {
      const u = k / 0.12;
      ball.position.set(HOME.x, F + 1.6 + Math.sin(u * Math.PI) * 0.3, HOME.z - 18.4 + u * 18);
    } else if (k < 0.55) {
      const u = (k - 0.12) / 0.43;
      ball.position.set(HOME.x + u * 46, F + 1.2 + Math.sin(u * Math.PI) * 34, HOME.z - u * 92);
    } else {
      ball.position.set(0, -100, 0);
    }
  });
  // 앞줄 관중(실루엣) · 응원 깃발
  for (let i = 0; i < 9; i++) {
    const x = -11 + i * 2.7;
    if (Math.abs(x) < 2) continue;
    addPerson(s, x, -1.0, -3.2, 1.5, 0xff7a1a);
  }
  for (const fx of [-9, 9]) {
    s.cyl(0.04, 0.04, 4.5, fx, 0, -0.8, 0xdfe5ea, 5);
    s.box(2.2, 1.3, 0.04, fx + 1.1, 3.2, -0.8, 0xff7a1a);
  }
}

export function beomeosa(ctx) {
  const { solid: s, glow: g, rand: r } = ctx;
  ctx.spawn = { x: 0, z: 9, yaw: 0 };
  ctx.bounds = 17;
  ctx.fogRange = [60, 900];
  ctx.plane(52, 48, 0, 0, -2, 0xd2c9b4, true); // 마당
  ctx.plane(700, 700, 0, -0.05, -40, 0x6f8f5a);
  // 대웅전 (석축 위)
  s.box(36, 1.8, 18, 0, 0, -31, 0xb9b3a6);
  for (let i = 0; i < 5; i++) s.box(7, 0.36, 0.7, 0, i * 0.36, -21.6 - i * 0.7, 0xc4beb1);
  addHanok(s, { x: 0, y: 1.8, z: -32, w: 17, d: 10, h: 5.2 });
  addHanok(s, { x: -21, y: 0, z: -8, w: 13, d: 7, h: 4, ry: Math.PI / 2, wall: 0x8a4a34 });
  addHanok(s, { x: 21, y: 0, z: -8, w: 13, d: 7, h: 4, ry: -Math.PI / 2, wall: 0x8a4a34 });
  // 삼층석탑 · 석등
  addPagoda(s, -6.5, 0, -13, 3, 2.5);
  addStoneLantern(s, 0, 0, -17.5, 1.5, g);
  addStoneLantern(s, 6.5, 0, -13, 1.2, g);
  // 일주문 (돌기둥 4개 위에 지붕)
  for (const px of [-4.6, -1.55, 1.55, 4.6]) s.cyl(0.55, 0.6, 3.3, px, 0, 27, 0xb7b2a7, 10);
  addHanok(s, { x: 0, y: 3.0, z: 27, w: 10.4, d: 2.2, h: 1.2, wall: 0x7a2a22, base: 0x8a3b2e });
  ctx.sign('金井山梵魚寺', 5.2, 0, 4.5, 25.6, Math.PI, { w: 768, h: 150, size: 96, bg: '#1c1c1c', fg: '#f2d27a', radius: 6 });
  s.box(4.2, 0.05, 20, 0, 0.0, 34, 0xc4beb1);
  // 범종루
  s.box(8, 0.6, 8, 16, 0, 10, 0xb9b3a6);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) s.cyl(0.28, 0.3, 4.2, 16 + sx * 3.2, 0.6, 10 + sz * 3.2, 0x7a2a22, 8);
  s.box(8, 0.5, 8, 16, 4.8, 10, 0x2f7f6f);
  s.box(10.4, 0.22, 10.4, 16, 5.3, 10, 0x2c3138);
  s.hip(10.2, 2.6, 10.2, 16, 5.5, 10, 0x3b4350, 0.25);
  s.cyl(1.0, 1.25, 2.2, 14.8, 2.0, 10, 0x6a5a3a, 12);
  s.cyl(1.1, 1.1, 1.6, 17.6, 2.2, 10, 0xb5653a, 14, Math.PI / 2);
  // 연등
  addLanternString(ctx, -18, 3.6, 2, 18, 3.6, 2, 18);
  addLanternString(ctx, -18, 3.6, -6, 18, 3.6, -6, 18);
  addLanternString(ctx, -14, 3.4, -16, -14, 3.4, 12, 14);
  addLanternString(ctx, 12, 3.4, -18, 12, 3.4, 4, 12);
  // 금정산 능선 · 금정산성 성곽 · 북문
  const ridge = [[-300, -300, 250, 150], [-20, -470, 300, 200], [290, -330, 250, 160], [-470, -110, 230, 120], [450, -90, 230, 130], [60, -820, 460, 250]];
  for (const [x, z, rad, h] of ridge) s.dome(rad, h, x, -4, z, [0x4a7f50, 0x55895a, 0x3f7346][Math.floor(r() * 3)]);
  const ridgeY = (x, z) => Math.max(0, ...ridge.map(([cx, cz, rad, h]) => h * Math.sqrt(Math.max(0, 1 - ((x - cx) ** 2 + (z - cz) ** 2) / (rad * rad))))) - 5;
  const wallPts = [];
  for (let i = 0; i <= 26; i++) {
    const u = i / 26;
    const wx = -440 + u * 520;
    const wz = -170 - Math.sin(u * Math.PI) * 60 - u * 110;
    wallPts.push([wx, ridgeY(wx, wz) + 1.5, wz]);
  }
  for (let i = 0; i < 26; i++) {
    const [x1, y1, z1] = wallPts[i];
    const [x2, y2, z2] = wallPts[i + 1];
    s.beam(x1, y1, z1, x2, y2, z2, 3.4, 0xc4beb1);
    s.box(1.6, 1.4, 1.6, (x1 + x2) / 2, Math.max(y1, y2) + 1.6, (z1 + z2) / 2, 0xb3ad9f);
  }
  const [gx, gy, gz] = wallPts[13];
  s.box(20, 9, 8, gx, gy - 2, gz + 3, 0xb9b3a6);
  s.box(5, 6, 8.4, gx, gy - 2, gz + 3, 0x2a2622);
  addHanok(s, { x: gx, y: gy + 7, z: gz + 3, w: 14, d: 5, h: 3.2, wall: 0x7a2a22 });
  // 소나무 숲
  for (let i = 0; i < 90; i++) {
    const a = r() * Math.PI * 2;
    const d = 30 + r() * 80;
    const x = Math.cos(a) * d;
    const z = -6 + Math.sin(a) * d;
    if (Math.abs(x) < 20 && z < -10 && z > -60) continue;
    if (Math.abs(x) < 5 && z > 20) continue;
    addPine(s, x, 0, z, 9 + r() * 7, r);
  }
  for (let i = 0; i < 10; i++) addTree(s, -24 + r() * 48, 0, 16 + r() * 8, 5 + r() * 2, [0xd98a3a, 0xc94a3a, 0xe0b040][i % 3]);
  // 스님과 방문객
  addPerson(s, -3, 0, -6, 1.7, 0x8d8d86, 0xe0c0a0);
  addPerson(s, -2.2, 0, -6.4, 1.66, 0x8d8d86, 0xe0c0a0);
  for (let i = 0; i < 6; i++) addPerson(s, -12 + r() * 24, 0, -14 + r() * 26, 1.55 + r() * 0.25, [0x8a3b4a, 0x3b4a6b, 0xd9a03b, 0x4a6b3b, 0xffffff, 0x555c66][i]);
  // 향로 연기
  s.cyl(0.7, 0.5, 0.9, 0, 0, -12, 0x5a5a52, 10);
  const smoke = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, depthWrite: false }));
    ctx.add(m);
    smoke.push(m);
  }
  ctx.anim((t) => {
    smoke.forEach((m, i) => {
      const k = (t * 0.22 + i / 6) % 1;
      m.position.set(Math.sin(k * 5 + i) * 0.4 * k, 1 + k * 5, -12 + Math.cos(k * 4 + i) * 0.3 * k);
      m.scale.setScalar(0.6 + k * 2.2);
      m.material.opacity = 0.28 * (1 - k);
    });
  });
}
