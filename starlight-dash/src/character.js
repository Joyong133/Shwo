// 캐릭터: 상자 몇 개로 만든 로우폴리 모델과 달리기/점프/슬라이드 애니메이션. 앞쪽은 로컬 -Z.
import * as THREE from 'three';
import { GeoBuilder } from './geo.js';

const PI = Math.PI;

const SPECS = {
  lumi: { skin: 0xffd2a8, top: 0x2f9bff, belt: 0x1d4f9c, sleeve: 0x2f9bff, hand: 0xffd2a8, pants: 0x2b3a67, shoe: 0xffffff },
  koko: { skin: 0xf08a2c, top: 0xf08a2c, belt: 0x2fa36b, sleeve: 0xf08a2c, hand: 0x5a3320, pants: 0xe07a20, shoe: 0x5a3320 },
  bolt: { skin: 0xc9d3e0, top: 0x4fc3c9, belt: 0x2c3e55, sleeve: 0x8fa0b5, hand: 0x2c3e55, pants: 0x8fa0b5, shoe: 0x2c3e55 },
  kage: { skin: 0xf2c79e, top: 0x20284a, belt: 0xe63946, sleeve: 0x20284a, hand: 0x151b33, pants: 0x1a2140, shoe: 0x0f1428 },
  nova: { skin: 0xf4f6fa, top: 0xf4f6fa, belt: 0xff8a3d, sleeve: 0xf4f6fa, hand: 0xff8a3d, pants: 0xe6eaf2, shoe: 0xff8a3d },
  draco: { skin: 0x4fbf6a, top: 0x4fbf6a, belt: 0x3da058, sleeve: 0x4fbf6a, hand: 0x3da058, pants: 0x45b060, shoe: 0xffe3a3 },
};

function part(mat, fn) {
  const b = new GeoBuilder(500);
  fn(b);
  return new THREE.Mesh(b.build(), mat);
}

function torsoGeo(b, id, c) {
  b.add('box', 0, 0.31, 0, 0.52, 0.62, 0.32, c.top);
  b.add('box', 0, 0.04, 0, 0.54, 0.1, 0.34, c.belt);
  switch (id) {
    case 'lumi':
      b.add('box', 0, 0.36, 0.24, 0.4, 0.46, 0.18, 0xffb02e); // 배낭
      b.add('box', 0, 0.5, 0.34, 0.3, 0.1, 0.04, 0xfff0c2);
      b.add('box', 0, 0.61, 0, 0.56, 0.1, 0.36, 0xffd23f); // 스카프
      b.add('oct', 0, 0.36, -0.17, 0.2, 0.2, 0.05, 0xffd23f);
      break;
    case 'koko':
      b.add('box', 0, 0.28, -0.165, 0.32, 0.44, 0.02, 0xfff3e0);
      b.add('box', 0, 0.61, 0, 0.56, 0.1, 0.36, 0x2fa36b);
      break;
    case 'bolt':
      b.add('box', 0, 0.36, -0.165, 0.32, 0.26, 0.03, 0x1d2b4a);
      b.add('oct', 0, 0.36, -0.19, 0.13, 0.13, 0.04, 0x00e5ff);
      b.add('cyl', -0.29, 0.56, 0, 0.12, 0.08, 0.12, 0x2c3e55, 0, 0, PI / 2);
      b.add('cyl', 0.29, 0.56, 0, 0.12, 0.08, 0.12, 0x2c3e55, 0, 0, PI / 2);
      break;
    case 'kage':
      b.add('box', 0.02, 0.38, 0.2, 0.06, 0.92, 0.06, 0xb9c2d4, 0, 0, 0.62); // 등에 멘 검
      b.add('box', -0.22, 0.68, 0.2, 0.08, 0.2, 0.08, 0xe63946, 0, 0, 0.62);
      b.add('box', 0, 0.3, -0.165, 0.2, 0.5, 0.02, 0x2b3560);
      break;
    case 'nova':
      b.add('box', 0, 0.36, 0.25, 0.44, 0.52, 0.2, 0xdfe5ee); // 산소통
      b.add('box', 0, 0.36, 0.36, 0.3, 0.12, 0.03, 0xff8a3d);
      b.add('box', 0, 0.38, -0.165, 0.26, 0.18, 0.03, 0x2c3e55);
      b.add('box', -0.06, 0.38, -0.185, 0.06, 0.06, 0.02, 0x3ddc97);
      b.add('box', 0.06, 0.38, -0.185, 0.06, 0.06, 0.02, 0xff4f5e);
      b.add('box', 0, 0.61, 0, 0.5, 0.08, 0.36, 0xff8a3d);
      break;
    case 'draco':
      for (let i = 0; i < 3; i++) b.add('box', 0, 0.14 + i * 0.16, -0.165, 0.34 - i * 0.02, 0.13, 0.03, 0xffe3a3);
      for (let i = 0; i < 3; i++) b.add('cone4', 0, 0.2 + i * 0.18, 0.2, 0.12, 0.16, 0.12, 0xff8a3d, PI / 2.6);
      break;
    default: break;
  }
}

function headGeo(b, id, c) {
  const eye = (x, y, z, col = 0x20253a, w = 0.07, h = 0.09) => b.add('box', x, y, z, w, h, 0.02, col);
  switch (id) {
    case 'lumi':
      b.add('box', 0, 0.22, 0, 0.44, 0.42, 0.42, c.skin);
      b.add('box', 0, 0.3, 0.2, 0.48, 0.34, 0.1, 0x5a3825);
      b.add('box', 0, 0.12, 0.3, 0.16, 0.3, 0.12, 0x5a3825, 0.4); // 묶은 머리
      b.add('box', 0, 0.47, 0, 0.5, 0.16, 0.48, 0xff5d5d);
      b.add('box', 0, 0.41, -0.3, 0.44, 0.05, 0.2, 0xe04848);
      b.add('oct', 0, 0.48, -0.245, 0.12, 0.12, 0.03, 0xffd23f);
      eye(-0.1, 0.23, -0.215); eye(0.1, 0.23, -0.215);
      b.add('box', 0, 0.1, -0.215, 0.12, 0.03, 0.02, 0xc97a5a);
      break;
    case 'koko':
      b.add('box', 0, 0.22, 0, 0.48, 0.42, 0.44, c.skin);
      b.add('box', 0, 0.13, -0.27, 0.22, 0.16, 0.14, 0xfff3e0);
      b.add('box', 0, 0.18, -0.345, 0.08, 0.06, 0.03, 0x2a1a12);
      b.add('box', -0.18, 0.1, -0.2, 0.12, 0.16, 0.06, 0xfff3e0);
      b.add('box', 0.18, 0.1, -0.2, 0.12, 0.16, 0.06, 0xfff3e0);
      b.add('cone4', -0.15, 0.56, 0.02, 0.2, 0.3, 0.12, c.skin);
      b.add('cone4', 0.15, 0.56, 0.02, 0.2, 0.3, 0.12, c.skin);
      b.add('cone4', -0.15, 0.6, -0.01, 0.1, 0.16, 0.08, 0x5a3320);
      b.add('cone4', 0.15, 0.6, -0.01, 0.1, 0.16, 0.08, 0x5a3320);
      eye(-0.11, 0.27, -0.225); eye(0.11, 0.27, -0.225);
      break;
    case 'bolt':
      b.add('box', 0, 0.22, 0, 0.48, 0.4, 0.42, c.skin);
      b.add('box', 0, 0.24, -0.215, 0.4, 0.16, 0.02, 0x14203a);
      eye(-0.1, 0.24, -0.228, 0x00e5ff, 0.09, 0.07); eye(0.1, 0.24, -0.228, 0x00e5ff, 0.09, 0.07);
      b.add('box', 0, 0.09, -0.215, 0.2, 0.03, 0.02, 0x8894a8);
      b.add('box', 0, 0.54, 0, 0.04, 0.24, 0.04, 0x8894a8);
      b.add('oct', 0, 0.7, 0, 0.13, 0.13, 0.13, 0xff4f5e);
      b.add('cyl', -0.26, 0.22, 0, 0.16, 0.06, 0.16, 0x4fc3c9, 0, 0, PI / 2);
      b.add('cyl', 0.26, 0.22, 0, 0.16, 0.06, 0.16, 0x4fc3c9, 0, 0, PI / 2);
      break;
    case 'kage':
      b.add('box', 0, 0.22, 0, 0.46, 0.42, 0.44, 0x20284a);
      b.add('box', 0, 0.25, -0.225, 0.36, 0.13, 0.02, c.skin);
      eye(-0.09, 0.25, -0.238, 0x20253a, 0.07, 0.07); eye(0.09, 0.25, -0.238, 0x20253a, 0.07, 0.07);
      b.add('box', 0, 0.37, 0, 0.49, 0.07, 0.47, 0xe63946);
      break;
    case 'nova':
      b.add('box', 0, 0.26, 0, 0.56, 0.52, 0.54, c.skin);
      b.add('box', 0, 0.27, -0.275, 0.42, 0.3, 0.02, 0x1b2a55);
      b.add('box', 0.1, 0.34, -0.288, 0.12, 0.08, 0.02, 0xffc94a);
      b.add('cyl', -0.3, 0.2, 0, 0.14, 0.06, 0.14, 0xff8a3d, 0, 0, PI / 2);
      b.add('cyl', 0.3, 0.2, 0, 0.14, 0.06, 0.14, 0xff8a3d, 0, 0, PI / 2);
      b.add('box', 0.2, 0.62, 0.1, 0.03, 0.2, 0.03, 0x8894a8);
      break;
    case 'draco':
      b.add('box', 0, 0.22, 0, 0.46, 0.4, 0.46, c.skin);
      b.add('box', 0, 0.13, -0.3, 0.3, 0.2, 0.22, 0x63cf7c);
      b.add('box', -0.07, 0.2, -0.415, 0.04, 0.04, 0.02, 0x1f5a30);
      b.add('box', 0.07, 0.2, -0.415, 0.04, 0.04, 0.02, 0x1f5a30);
      b.add('cone4', -0.14, 0.52, 0.1, 0.1, 0.26, 0.1, 0xffe3a3, 0.5);
      b.add('cone4', 0.14, 0.52, 0.1, 0.1, 0.26, 0.1, 0xffe3a3, 0.5);
      eye(-0.12, 0.28, -0.235, 0xffd23f, 0.1, 0.1); eye(0.12, 0.28, -0.235, 0xffd23f, 0.1, 0.1);
      eye(-0.12, 0.28, -0.245, 0x1f2a20, 0.04, 0.08); eye(0.12, 0.28, -0.245, 0x1f2a20, 0.04, 0.08);
      for (let i = 0; i < 2; i++) b.add('cone4', 0, 0.44 - i * 0.16, 0.22, 0.1, 0.14, 0.1, 0xff8a3d, PI / 2.4);
      break;
    default: break;
  }
}

function armGeo(b, c) {
  b.add('box', 0, -0.2, 0, 0.16, 0.44, 0.18, c.sleeve);
  b.add('box', 0, -0.5, 0, 0.15, 0.16, 0.17, c.hand);
}

function legGeo(b, c) {
  b.add('box', 0, -0.26, 0, 0.21, 0.52, 0.23, c.pants);
  b.add('box', 0, -0.66, -0.05, 0.23, 0.18, 0.36, c.shoe);
}

export function makeCharacter(id, mat) {
  const c = SPECS[id] || SPECS.lumi;
  const root = new THREE.Group();
  const pivot = new THREE.Group();
  root.add(pivot);
  const body = new THREE.Group();
  body.position.y = 0.78;
  pivot.add(body);

  body.add(part(mat, (b) => torsoGeo(b, id, c)));
  const head = part(mat, (b) => headGeo(b, id, c));
  head.position.y = 0.64;
  body.add(head);
  const armL = part(mat, (b) => armGeo(b, c)); armL.position.set(-0.35, 0.56, 0); body.add(armL);
  const armR = part(mat, (b) => armGeo(b, c)); armR.position.set(0.35, 0.56, 0); body.add(armR);
  const legL = part(mat, (b) => legGeo(b, c)); legL.position.set(-0.15, 0.02, 0); body.add(legL);
  const legR = part(mat, (b) => legGeo(b, c)); legR.position.set(0.15, 0.02, 0); body.add(legR);

  let tail = null, wingL = null, wingR = null;
  if (id === 'koko') {
    tail = part(mat, (b) => {
      b.add('ico', 0, 0.1, 0.3, 0.26, 0.26, 0.6, 0xf08a2c, -0.5);
      b.add('ico', 0, 0.24, 0.52, 0.2, 0.2, 0.3, 0xfff3e0, -0.5);
    });
    tail.position.set(0, 0.1, 0.14);
    body.add(tail);
  } else if (id === 'draco') {
    tail = part(mat, (b) => {
      b.add('cone', 0, 0, 0.4, 0.28, 0.8, 0.28, 0x4fbf6a, PI / 2);
      b.add('cone4', 0, 0.14, 0.3, 0.1, 0.14, 0.1, 0xff8a3d);
      b.add('cone4', 0, 0.1, 0.52, 0.08, 0.12, 0.08, 0xff8a3d);
    });
    tail.position.set(0, 0.1, 0.14);
    body.add(tail);
    const wing = (sg) => part(mat, (b) => {
      b.add('box', sg * 0.3, 0.12, 0.05, 0.6, 0.42, 0.03, 0xff9f43);
      b.add('box', sg * 0.52, 0.34, 0.05, 0.2, 0.1, 0.035, 0xff8a3d);
      b.add('box', sg * 0.14, 0.34, 0.05, 0.3, 0.06, 0.05, 0x3da058);
    });
    wingL = wing(-1); wingL.position.set(-0.1, 0.42, 0.18); body.add(wingL);
    wingR = wing(1); wingR.position.set(0.1, 0.42, 0.18); body.add(wingR);
  } else if (id === 'kage') {
    tail = part(mat, (b) => {
      b.add('box', -0.05, 0, 0.22, 0.06, 0.04, 0.44, 0xe63946, 0, 0.12);
      b.add('box', 0.06, -0.03, 0.18, 0.06, 0.04, 0.36, 0xc92f3c, 0, -0.14);
    });
    tail.position.set(0, 0.37, 0.22);
    head.add(tail);
  }

  return {
    id, root, pivot, body, head, armL, armR, legL, legR, tail, wingL, wingR,
    phase: 0,
    j: { legL: 0, legR: 0, armL: 0, armR: 0, bodyX: 0, pivotX: 0, pivotY: 0, spread: 0 },
  };
}

export function disposeCharacter(ch) {
  ch.root.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
}

/**
 * 자세 갱신. st = { mode: 'run'|'jump'|'slide'|'crash'|'fall'|'idle', speed, t }
 */
export function animateCharacter(ch, dt, st) {
  const j = ch.j;
  let legL = 0, legR = 0, armL = 0, armR = 0, bodyX = 0, pivotX = 0, pivotY = 0, spread = 0.06;
  let rate = 18;
  switch (st.mode) {
    case 'run': {
      ch.phase += dt * (7.5 + st.speed * 0.42);
      const s = Math.sin(ch.phase);
      legL = s * 1.05; legR = -s * 1.05;
      armL = -s * 0.95; armR = s * 0.95;
      bodyX = -0.2;
      pivotY = Math.abs(Math.cos(ch.phase)) * 0.07;
      rate = 40;
      break;
    }
    case 'jump':
      ch.phase += dt * 6;
      legL = 1.0; legR = -0.5; armL = 2.6; armR = 2.2; bodyX = -0.12; spread = 0.25;
      break;
    case 'slide':
      pivotX = 1.22; legL = 0.2; legR = 0.75; armL = -0.5; armR = -0.3; bodyX = 0.1;
      rate = 24;
      break;
    case 'crash':
      pivotX = 1.5; legL = 0.5; legR = -0.2; armL = -2.4; armR = -2.0; spread = 0.5;
      rate = 9;
      break;
    case 'fall':
      ch.phase += dt * 16;
      legL = Math.sin(ch.phase) * 0.8; legR = -Math.sin(ch.phase) * 0.8;
      armL = 2.8 + Math.sin(ch.phase * 1.3) * 0.4; armR = 2.8 - Math.sin(ch.phase * 1.3) * 0.4; spread = 0.5;
      break;
    default: // idle
      ch.phase += dt * 2;
      armL = Math.sin(ch.phase) * 0.06; armR = -Math.sin(ch.phase) * 0.06;
      pivotY = Math.sin(ch.phase) * 0.012;
      break;
  }
  const k = 1 - Math.exp(-dt * rate);
  j.legL += (legL - j.legL) * k; j.legR += (legR - j.legR) * k;
  j.armL += (armL - j.armL) * k; j.armR += (armR - j.armR) * k;
  j.bodyX += (bodyX - j.bodyX) * k;
  j.pivotX += (pivotX - j.pivotX) * k;
  j.pivotY += (pivotY - j.pivotY) * k;
  j.spread += (spread - j.spread) * k;

  ch.legL.rotation.x = j.legL; ch.legR.rotation.x = j.legR;
  ch.armL.rotation.x = j.armL; ch.armR.rotation.x = j.armR;
  ch.armL.rotation.z = -j.spread; ch.armR.rotation.z = j.spread;
  ch.body.rotation.x = j.bodyX;
  ch.pivot.rotation.x = j.pivotX;
  ch.pivot.position.y = j.pivotY;
  ch.head.rotation.x = -j.bodyX * 0.6;

  const wag = Math.sin(ch.phase * (st.mode === 'run' ? 1 : 0.7));
  if (ch.tail) {
    if (ch.id === 'kage') { ch.tail.rotation.x = -0.15 + wag * 0.2; ch.tail.rotation.y = wag * 0.25; }
    else ch.tail.rotation.y = wag * 0.45;
  }
  if (ch.wingL) {
    const f = Math.sin(ch.phase * 1.5) * (st.mode === 'jump' || st.mode === 'fall' ? 0.9 : 0.35);
    ch.wingL.rotation.y = -0.5 - f; ch.wingR.rotation.y = 0.5 + f;
  }
}
