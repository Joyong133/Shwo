// 명소 장면 공용 소품 (새 떼, 배, 원경 도시 등)
import * as THREE from 'three';
import { Batch, solidMaterial } from '../kit3d.js';

/**
 * 날갯짓하는 새 떼.
 * path 'circle': 중심 주위를 선회 (갈매기) / 'line': V자 편대로 하늘을 가로지름 (철새)
 */
export function addBirds(ctx, o = {}) {
  const { count = 8, cx = 0, cy = 30, cz = -60, radius = 40, speed = 0.25, color = 0xffffff, size = 1, path = 'circle', span = 260 } = o;
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, fog: false });
  const w = 0.95 * size;
  const left = new THREE.PlaneGeometry(w, 0.3 * size);
  left.rotateX(-Math.PI / 2);
  left.translate(-w / 2, 0, 0);
  const right = new THREE.PlaneGeometry(w, 0.3 * size);
  right.rotateX(-Math.PI / 2);
  right.translate(w / 2, 0, 0);
  const birds = [];
  for (let i = 0; i < count; i++) {
    const g = new THREE.Group();
    const wl = new THREE.Mesh(left, mat);
    const wr = new THREE.Mesh(right, mat);
    g.add(wl, wr);
    ctx.add(g);
    birds.push({ g, wl, wr, phase: ctx.rand() * 6.28, r: radius * (0.6 + ctx.rand() * 0.6), h: (ctx.rand() - 0.5) * 8, i });
  }
  ctx.anim((t) => {
    for (const b of birds) {
      const flap = Math.sin(t * (7 + (b.i % 3)) + b.phase) * 0.65;
      b.wl.rotation.z = -flap;
      b.wr.rotation.z = flap;
      if (path === 'circle') {
        const a = t * speed + b.phase;
        b.g.position.set(cx + Math.cos(a) * b.r, cy + b.h + Math.sin(t * 0.7 + b.phase) * 1.5, cz + Math.sin(a) * b.r);
        b.g.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a));
      } else {
        // V자 편대: i=0 선두, 좌우로 번갈아 뒤따름
        const rank = Math.ceil(b.i / 2);
        const side = b.i % 2 === 0 ? 1 : -1;
        const lead = ((t * speed * 20 + span) % (span * 2)) - span;
        b.g.position.set(cx + lead - rank * 2.4 * size, cy + Math.sin(t * 0.5 + b.i) * 0.6, cz + side * rank * 2.2 * size);
        b.g.rotation.y = Math.PI / 2;
      }
    }
  });
}

/** 수평선의 화물선 */
export function addCargoShip(b, x, y, z, len = 60, ry = 0, hull = 0x7a2a22) {
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  b.box(len, len * 0.09, len * 0.16, x, y, z, hull, ry);
  b.box(len * 0.1, len * 0.14, len * 0.14, x - c * len * 0.38, y + len * 0.09, z + s * len * 0.38, 0xf2f2f2, ry);
  const colors = [0xd9482e, 0x2f6fd0, 0xf2c230, 0x3f9a5a, 0xe8e8e8];
  for (let i = 0; i < 5; i++) {
    const off = -len * 0.22 + i * len * 0.115;
    b.box(len * 0.1, len * 0.05, len * 0.13, x + c * off, y + len * 0.09, z - s * off, colors[i % colors.length], ry);
  }
}

/** 물 위에서 흔들리는 작은 배 (개별 메시) */
export function addBobbingBoat(ctx, x, y, z, len = 8, ry = 0, hull = 0x2f5f8f) {
  const b = new Batch();
  b.box(len, len * 0.14, len * 0.3, 0, -len * 0.03, 0, hull);
  b.box(len * 0.3, len * 0.16, len * 0.2, -len * 0.15, len * 0.11, 0, 0xf2f2f2);
  b.cyl(0.05, 0.05, len * 0.38, len * 0.15, len * 0.11, 0, 0xdddddd, 5);
  const mesh = b.build(solidMaterial());
  mesh.matrixAutoUpdate = true;
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  ctx.add(mesh);
  const phase = ctx.rand() * 6.28;
  ctx.anim((t) => {
    mesh.position.y = y + Math.sin(t * 1.1 + phase) * 0.12;
    mesh.rotation.z = Math.sin(t * 0.9 + phase) * 0.05;
    mesh.rotation.x = Math.sin(t * 0.7 + phase * 2) * 0.03;
  });
  return mesh;
}

/** 원경 건물 군집 (창문 텍스처 건물) */
export function addSkyline(ctx, o) {
  const { x = 0, z = -400, y = 0, width = 300, depth = 60, n = 16, hMin = 40, hMax = 160, colors = [0xc9d6e2, 0xb5c4d4, 0xdfe6ee, 0x9fb4c8], wMin = 16, wMax = 34 } = o;
  for (let i = 0; i < n; i++) {
    const w = wMin + ctx.rand() * (wMax - wMin);
    const h = hMin + ctx.rand() ** 1.6 * (hMax - hMin);
    ctx.bld.building(w, h, w * (0.7 + ctx.rand() * 0.5), x + (ctx.rand() - 0.5) * width, y, z + (ctx.rand() - 0.5) * depth, colors[Math.floor(ctx.rand() * colors.length)], ctx.rand() > 0.5 ? 0 : Math.PI / 2);
  }
}

/** 연등 줄 (알록달록 등) */
export function addLanternString(ctx, x1, y1, z1, x2, y2, z2, n = 12) {
  const colors = [0xff5a7a, 0xffd23f, 0x4fd6ff, 0x7dff8a, 0xff9a3f, 0xd98aff];
  ctx.solid.beam(x1, y1 + 0.25, z1, x2, y2 + 0.25, z2, 0.03, 0x333333);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const sag = Math.sin(t * Math.PI) * 0.5;
    ctx.glow.sphere(0.22, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t - sag, z1 + (z2 - z1) * t, colors[i % colors.length], 1, 1.15, 1, 8, 6);
  }
}
