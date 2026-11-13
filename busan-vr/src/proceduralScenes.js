// 절차적 3D 장면: (1) 허브 = 부산 전역 3D 지도 디오라마, (2) 명소별 360도 장면, (3) 파노라마 교체
import * as THREE from 'three';
import {
  MAP, geoToMap, SPOTS, regionById, LAND_POLYGONS, MOUNTAINS, DISTRICTS, GWANGAN_BRIDGE, BUSAN_HARBOR_BRIDGE,
} from './busanData.js';
import {
  Batch, solidMaterial, glowMaterial, facadeMaterial, makeSea, makeSky, makeStars, makeClouds, makeLights, makeLabelSprite,
  makeSign, mulberry32, skyPreset, disposeTree, addHanok, addPagoda, addLighthouse, addBoat,
} from './kit3d.js';
import { SPOT_BUILDERS } from './spots/index.js';

const H = MAP.halfSizeKm;
export const LAND_Y = 0.14; // 지도에서 육지 두께(km)
export const TABLE_Y = 0.8; // 지도 테이블 높이(m)

const clampH = (v) => THREE.MathUtils.clamp(v, -H, H);
/** 경위도 → 지도 로컬 좌표 [x, z] (km, 테이블 범위로 잘라냄) */
export function mapXZ(lon, lat) {
  const p = geoToMap(lon, lat);
  return [clampH(p.x), clampH(p.z)];
}

const LAND_KM = LAND_POLYGONS.map((poly) => poly.map(([lon, lat]) => mapXZ(lon, lat)));
export function isLand(x, z) {
  for (const poly of LAND_KM) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, zi] = poly[i];
      const [xj, zj] = poly[j];
      if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

/** 경위도 경로 → 지도 위 3D 곡선 (km). 세 번째 값은 고가 높이 */
export function mapCurve(path, baseY) {
  const pts = path.map(([lon, lat, elev = 0]) => {
    const [x, z] = mapXZ(lon, lat);
    return new THREE.Vector3(x, baseY + elev, z);
  });
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

// ───────────────────────── 지도 위 미니어처 랜드마크 ─────────────────────────
function addMapBridge(b, glow, path, { towerTop = 1.25, cable = true } = {}) {
  const curve = mapCurve(path, LAND_Y);
  const N = 40;
  const deckY = LAND_Y + (path[1][2] || 0.4);
  const pts = [];
  for (let i = 0; i <= N; i++) pts.push(curve.getPointAt(i / N));
  for (let i = 0; i < N; i++) b.beam(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z, 0.11, 0xf2f5f9);
  for (let i = 3; i < N - 2; i += 4) b.beam(pts[i].x, 0, pts[i].z, pts[i].x, pts[i].y, pts[i].z, 0.06, 0xb9c2cc);
  const uA = 0.3;
  const uB = 0.7;
  const cableY = (u) => {
    const s = Math.abs(u - 0.5) / 0.2;
    if (s <= 1) return deckY + 0.08 + (towerTop - deckY - 0.08) * s * s;
    const k = Math.min(1, (Math.abs(u - 0.5) - 0.2) / 0.26);
    return deckY + (towerTop - deckY) * (1 - k) ** 1.7;
  };
  for (const u of [uA, uB]) {
    const p = curve.getPointAt(u);
    const t = curve.getTangentAt(u);
    const nx = -t.z * 0.1;
    const nz = t.x * 0.1;
    b.beam(p.x + nx, 0, p.z + nz, p.x + nx, towerTop, p.z + nz, 0.07, 0xffffff);
    b.beam(p.x - nx, 0, p.z - nz, p.x - nx, towerTop, p.z - nz, 0.07, 0xffffff);
    b.beam(p.x + nx, towerTop - 0.08, p.z + nz, p.x - nx, towerTop - 0.08, p.z - nz, 0.06, 0xffffff);
    b.beam(p.x + nx, deckY + 0.3, p.z + nz, p.x - nx, deckY + 0.3, p.z - nz, 0.05, 0xffffff);
    glow.box(0.06, 0.06, 0.06, p.x, towerTop, p.z, 0xff5040);
  }
  if (cable) {
    for (let i = 2; i < N - 2; i++) {
      const u1 = i / N;
      const u2 = (i + 1) / N;
      b.beam(pts[i].x, cableY(u1), pts[i].z, pts[i + 1].x, cableY(u2), pts[i + 1].z, 0.035, 0xffffff);
      if (i % 2 === 0) {
        b.beam(pts[i].x, pts[i].y, pts[i].z, pts[i].x, cableY(u1), pts[i].z, 0.014, 0xe6ecf2);
        glow.box(0.045, 0.045, 0.045, pts[i].x, cableY(u1) + 0.03, pts[i].z, 0x8fe3ff);
      }
    }
  } else {
    // 사장교: 주탑 꼭대기에서 상판으로 부채꼴 케이블
    for (const u of [uA, uB]) {
      const p = curve.getPointAt(u);
      for (let k = -4; k <= 4; k++) {
        if (k === 0) continue;
        const q = curve.getPointAt(THREE.MathUtils.clamp(u + k * 0.045, 0.02, 0.98));
        b.beam(p.x, towerTop - 0.05, p.z, q.x, q.y, q.z, 0.014, 0xf0f4f8);
      }
    }
  }
}

function addMapLandmarks(b, glow, rand) {
  const at = (id) => {
    const s = SPOTS.find((sp) => sp.id === id);
    return mapXZ(s.lon, s.lat);
  };
  const Y = LAND_Y;
  // 광안대교 · 부산항대교
  addMapBridge(b, glow, GWANGAN_BRIDGE, { towerTop: 1.3, cable: true });
  addMapBridge(b, glow, BUSAN_HARBOR_BRIDGE, { towerTop: 1.25, cable: false });
  // 남항대교 · 영도대교 · 낙동강하굿둑
  const span = (lon1, lat1, lon2, lat2, y, t, color) => {
    const [x1, z1] = mapXZ(lon1, lat1);
    const [x2, z2] = mapXZ(lon2, lat2);
    b.beam(x1, y, z1, x2, y, z2, t, color);
  };
  span(129.021, 35.079, 129.041, 35.0835, Y + 0.12, 0.08, 0xe9eef3);
  span(129.0362, 35.0958, 129.0376, 35.0932, Y + 0.05, 0.09, 0xd0d7de);
  span(128.9625, 35.1058, 128.9335, 35.1052, Y + 0.05, 0.1, 0xd0d7de);
  for (let i = 0; i < 9; i++) {
    const [gx, gz] = mapXZ(128.9605 - i * 0.0012, 35.1058);
    b.box(0.07, 0.3, 0.1, gx, Y, gz, 0xbac3cd);
  }

  // 부산타워 (용두산)
  {
    const [x, z] = at('tower');
    b.dome(0.32, 0.22, x, Y, z, 0x5d9458);
    b.cyl(0.035, 0.055, 0.95, x, Y + 0.2, z, 0xf7f7f7, 8);
    b.cyl(0.13, 0.08, 0.1, x, Y + 1.15, z, 0xf7f7f7, 10);
    b.cyl(0.1, 0.13, 0.07, x, Y + 1.25, z, 0x4f7fd0, 10);
    b.cone(0.11, 0.2, x, Y + 1.32, z, 0xf7f7f7, 10);
    glow.box(0.03, 0.14, 0.03, x, Y + 1.5, z, 0xff4a4a);
  }
  // 감천문화마을: 비탈을 따라 알록달록 계단식 집
  {
    const [x, z] = at('gamcheon');
    const pastel = [0xff9aa8, 0x8fd3ff, 0xffe27a, 0x9be8c1, 0xffffff, 0xffb37a, 0xb9a6ff, 0x7fc8f0];
    b.dome(0.75, 0.5, x - 0.15, Y, z - 0.1, 0x6f9a62);
    for (let i = 0; i < 46; i++) {
      const a = rand() * Math.PI * 1.3 + 0.2;
      const r = 0.12 + rand() * 0.58;
      const hx = x - 0.15 + Math.cos(a) * r;
      const hz = z - 0.1 + Math.sin(a) * r;
      const hy = Y + Math.max(0, 0.5 * (1 - (r / 0.75) ** 2)) - 0.02;
      const s = 0.07 + rand() * 0.05;
      b.box(s, s * 0.8, s, hx, hy, hz, pastel[Math.floor(rand() * pastel.length)], rand() * 0.5);
    }
  }
  // 자갈치시장: 갈매기 지붕
  {
    const [x, z] = at('jagalchi');
    b.box(0.5, 0.16, 0.2, x, Y, z + 0.08, 0xe9eef2, 0.2);
    for (let i = -1; i <= 1; i++) b.gable(0.2, 0.1, 0.16, x + i * 0.15, Y + 0.16, z + 0.08 - i * 0.03, 0xffffff, 0.2 + Math.PI / 2);
    for (let i = 0; i < 6; i++) b.cone(0.045, 0.05, x - 0.25 + i * 0.1, Y, z + 0.26, [0xff5a4a, 0x3fa7ff, 0xffd23f][i % 3], 6);
  }
  // 사직야구장
  {
    const [x, z] = at('sajik');
    const ring = new THREE.TorusGeometry(0.36, 0.09, 6, 22);
    b.add(ring, 0xd9dde2, x, Y + 0.12, z, Math.PI / 2);
    b.cyl(0.3, 0.3, 0.03, x, Y + 0.01, z, 0x4f9a4a, 20);
    b.cyl(0.11, 0.11, 0.035, x, Y + 0.012, z + 0.1, 0xb98a5a, 4);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.6;
      b.cyl(0.012, 0.012, 0.5, x + Math.cos(a) * 0.45, Y, z + Math.sin(a) * 0.45, 0x9aa3ad, 5);
      glow.box(0.12, 0.06, 0.03, x + Math.cos(a) * 0.45, Y + 0.5, z + Math.sin(a) * 0.45, 0xfff6d0);
    }
  }
  // 범어사 (한옥 전각 + 석탑) · 금정산성 성곽
  {
    const [x, z] = at('beomeosa');
    b.setTransform(x, Y + 0.28, z, 0.2, 0.045);

    glow.setTransform(x, Y + 0.28, z, 0.2, 0.045);
    addHanok(b, { w: 13, d: 8, h: 4 });
    addPagoda(b, 12, 0, 6, 3, 2.2);
    b.resetTransform();
    glow.resetTransform();
    for (let i = 0; i < 14; i++) {
      const [x1, z1] = mapXZ(129.035 + i * 0.0022, 35.283 - Math.sin(i * 0.5) * 0.004);
      const [x2, z2] = mapXZ(129.035 + (i + 1) * 0.0022, 35.283 - Math.sin((i + 1) * 0.5) * 0.004);
      b.beam(x1, Y + 1.25, z1, x2, Y + 1.25, z2, 0.07, 0xbdb7aa);
    }
  }
  // 해동용궁사
  {
    const [x, z] = at('yonggungsa');
    b.setTransform(x - 0.1, Y, z, -0.4, 0.04);

    glow.setTransform(x - 0.1, Y, z, -0.4, 0.04);
    addHanok(b, { w: 12, d: 7, h: 4 });
    addPagoda(b, -11, 0, 5, 3, 2.2);
    b.resetTransform();
    glow.resetTransform();
    b.sphere(0.07, x + 0.2, Y + 0.16, z - 0.15, 0xe8c25a);
    b.cyl(0.05, 0.07, 0.1, x + 0.2, Y, z - 0.15, 0xe8c25a, 8);
  }
  // 기장 죽성성당
  {
    const [x, z] = at('jukseong');
    b.box(0.28, 0.18, 0.18, x, Y, z, 0xffffff, 0.3);
    b.gable(0.2, 0.14, 0.3, x, Y + 0.18, z, 0xd9482e, 0.3 + Math.PI / 2);
    b.box(0.09, 0.34, 0.09, x - 0.16, Y, z + 0.05, 0xffffff, 0.3);
    b.cone(0.075, 0.2, x - 0.16, Y + 0.34, z + 0.05, 0xd9482e, 4);
    b.setTransform(x + 0.32, Y, z - 0.12, 0, 0.03);

    glow.setTransform(x + 0.32, Y, z - 0.12, 0, 0.03);
    addLighthouse(b, glow, 0, 0, 0, 14);
    b.resetTransform();
    glow.resetTransform();
  }
  // 태종대 영도등대
  {
    const [x, z] = at('taejongdae');
    b.setTransform(x + 0.1, Y, z + 0.12, 0, 0.045);

    glow.setTransform(x + 0.1, Y, z + 0.12, 0, 0.045);
    addLighthouse(b, glow, 0, 0, 0, 14);
    b.resetTransform();
    glow.resetTransform();
    for (let i = 0; i < 9; i++) b.cone(0.09, 0.22, x - 0.5 + rand() * 0.7, Y + 0.1, z - 0.5 + rand() * 0.5, 0x2f6a3f, 6);
  }
  // 오륙도 섬 + 스카이워크
  {
    const [x, z] = at('oryukdo');
    const isles = [[0.45, 0.35, 0.2], [0.68, 0.55, 0.16], [0.86, 0.78, 0.2], [1.0, 1.02, 0.14], [1.18, 1.22, 0.18]];
    for (const [dx, dz, r] of isles) b.rock(r, x + dx, 0.08, z + dz, 0x8a8478, 1, 1.3, 1, rand() * 3);
    b.setTransform(x + 1.18, 0.28, z + 1.22, 0, 0.02);

    glow.setTransform(x + 1.18, 0.28, z + 1.22, 0, 0.02);
    addLighthouse(b, glow, 0, 0, 0, 12);
    b.resetTransform();
    glow.resetTransform();
    glow.box(0.2, 0.02, 0.07, x + 0.12, Y + 0.22, z + 0.02, 0x8fe9ff);
  }
  // 이기대: 해송 숲
  {
    const [x, z] = at('igidae');
    for (let i = 0; i < 10; i++) b.cone(0.08, 0.2, x - 0.45 + rand() * 0.5, Y + 0.05, z - 0.4 + rand() * 0.9, 0x2f6a3f, 6);
  }
  // 해운대: 백사장 + 파라솔 + 엘시티
  {
    const [x, z] = at('haeundae');
    b.box(1.5, 0.03, 0.2, x + 0.15, Y - 0.01, z + 0.12, 0xf2deb0, 0.06);
    for (let i = 0; i < 12; i++) b.cone(0.04, 0.045, x - 0.5 + i * 0.12, Y + 0.02, z + 0.12 - i * 0.006, [0xff5a4a, 0x3fa7ff, 0xffd23f, 0xffffff][i % 4], 6);
    const [lx, lz] = mapXZ(129.169, 35.1605);
    b.box(0.16, 2.6, 0.16, lx, Y, lz, 0x9fc4de);
    b.box(0.14, 2.1, 0.14, lx + 0.22, Y, lz - 0.08, 0x9fc4de);
    b.box(0.14, 2.1, 0.14, lx + 0.1, Y, lz - 0.24, 0x9fc4de);
  }
  // 동백섬 누리마루
  {
    const [x, z] = mapXZ(129.1518, 35.1528);
    b.dome(0.3, 0.2, x - 0.05, Y, z - 0.08, 0x3f7a48);
    b.cyl(0.13, 0.13, 0.08, x + 0.05, Y + 0.04, z + 0.12, 0xcfe6f2, 12);
    b.dome(0.15, 0.07, x + 0.05, Y + 0.12, z + 0.12, 0xe9eef2);
  }
  // 광안리 백사장
  {
    const [x, z] = at('gwangalli');
    b.box(1.1, 0.03, 0.16, x + 0.1, Y - 0.01, z + 0.1, 0xf2deb0, -0.25);
  }
  // 흰여울마을
  {
    const [x, z] = at('huinnyeoul');
    for (let i = 0; i < 14; i++) b.box(0.07, 0.06, 0.07, x - 0.02 + (rand() - 0.5) * 0.12 + i * 0.012, Y + rand() * 0.04, z - 0.35 + i * 0.05, i % 5 === 0 ? 0x7fc8f0 : 0xffffff);
  }
  // 다대포: 갯벌 해변 + 낙조분수
  {
    const [x, z] = at('dadaepo');
    b.box(0.9, 0.03, 0.3, x - 0.2, Y - 0.01, z + 0.25, 0xe8d2a0, 0.3);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      glow.cone(0.02, 0.16, x + 0.25 + Math.cos(a) * 0.12, Y, z - 0.15 + Math.sin(a) * 0.12, [0x7fd6ff, 0xff9ad5, 0xfff07a][i % 3], 5);
    }
  }
  // 을숙도 갈대
  {
    const [x, z] = at('eulsukdo');
    for (let i = 0; i < 40; i++) b.cone(0.03, 0.12, x + (rand() - 0.5) * 0.7, Y, z + (rand() - 0.5) * 2.2, rand() > 0.5 ? 0xc9c074 : 0x9fb060, 4);
    b.box(0.2, 0.08, 0.14, x + 0.05, Y, z - 0.2, 0xd9c9a8, 0.4);
  }
  // 서면 네온
  {
    const [x, z] = at('seomyeon');
    const neon = [0xff4fa0, 0x4fd6ff, 0xffe04f, 0x7dff8a, 0xff7a4f];
    for (let i = 0; i < 16; i++) glow.box(0.07, 0.04, 0.07, x + (rand() - 0.5) * 1.4, Y + 0.45 + rand() * 0.5, z + (rand() - 0.5) * 1.4, neon[i % neon.length]);
  }
  // 부산항 컨테이너 크레인 · 김해공항 활주로 · 배
  for (let i = 0; i < 6; i++) {
    const [x, z] = mapXZ(129.052 + i * 0.006, 35.1165 - i * 0.0016);
    b.box(0.05, 0.42, 0.05, x, Y, z, 0xd9482e);
    b.box(0.36, 0.04, 0.05, x + 0.05, Y + 0.42, z + 0.1, 0xd9482e, 1.1);
  }
  {
    const [x1, z1] = mapXZ(128.935, 35.165);
    const [x2, z2] = mapXZ(128.942, 35.195);
    b.beam(x1, Y + 0.02, z1, x2, Y + 0.02, z2, 0.14, 0x4b525c);
  }
  const boats = [[129.075, 35.1, 0.6], [129.15, 35.135, 2.2], [129.03, 35.06, 1.1], [129.2, 35.14, 0.3], [129.11, 35.07, 2.8], [128.99, 35.035, 0.9], [129.245, 35.2, 1.9]];
  for (const [lon, lat, ry] of boats) {
    const [x, z] = mapXZ(lon, lat);
    b.setTransform(x, 0.06, z, ry, 0.05);

    glow.setTransform(x, 0.06, z, ry, 0.05);
    addBoat(b, 0, 0, 0, 9, 0, 0xd9482e + Math.floor(rand() * 3) * 0x001122);
    b.resetTransform();
    glow.resetTransform();
  }
}

/** 명소 핀 (머리+기둥+라벨+보이지 않는 히트 영역) */
function makePin(spot) {
  const region = regionById(spot.region);
  const [x, z] = mapXZ(spot.lon, spot.lat);
  const h = spot.pinHeight ?? 1.3;
  const g = new THREE.Group();
  g.position.set(x, LAND_Y, z);
  const color = new THREE.Color(region.color);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  stem.position.y = h / 2;
  const headMat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), headMat);
  head.position.y = h + 0.12;
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.3, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  const label = makeLabelSprite(spot.name, 2.3, { w: 512, h: 112, size: 58, bg: 'rgba(8,16,36,0.88)', border: region.color, radius: 30, depthTest: false });
  label.position.y = h + 0.72;
  label.renderOrder = 6;
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, h + 1.1, 8), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = (h + 1.1) / 2;
  g.add(stem, head, ring, label, hit);
  const pin = {
    spot, group: g, head, label, hit, ring, hovered: false, selected: false, labelScale: 1,
    setHover(v) {
      pin.hovered = v;
    },
    setSelected(v) {
      pin.selected = v;
    },
    update(t) {
      const target = pin.selected ? 1.7 : pin.hovered ? 1.4 : 1;
      const s = head.scale.x + (target - head.scale.x) * 0.2;
      head.scale.setScalar(s);
      head.position.y = h + 0.12 + (pin.selected ? Math.sin(t * 4) * 0.08 + 0.1 : 0);
      const ls = 2.3 * pin.labelScale * (pin.hovered || pin.selected ? 1.25 : 1);
      label.scale.set(ls, ls * (112 / 512), 1);
      ring.scale.setScalar(1 + (pin.selected ? 0.5 + Math.sin(t * 4) * 0.3 : 0));
    },
  };
  return pin;
}

/** 부산 전역 3D 지도 (테이블 디오라마) */
export function buildBusanMap() {
  const root = new THREE.Group();
  root.name = 'busan-map';
  root.scale.setScalar(MAP.scale);
  root.position.y = TABLE_Y;
  const rand = mulberry32(1876);
  const anims = [];

  // 바다 (파도 셰이더)
  const sea = makeSea('hub', { size: H * 2, segments: 70, y: 0.03, amp: 0.0035, freq: 60, fadeNear: 50, fadeFar: 60, horizonFar: 5000 });
  root.add(sea);
  anims.push(sea.userData.tick);

  // 육지
  const landMat = new THREE.MeshLambertMaterial({ color: 0x8fb97f });
  for (let i = 0; i < LAND_KM.length; i++) {
    const shape = new THREE.Shape(LAND_KM[i].map(([x, z]) => new THREE.Vector2(x, -z)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: LAND_Y, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, i === 2 ? new THREE.MeshLambertMaterial({ color: 0xa9b872 }) : landMat);
    root.add(mesh);
  }

  const b = new Batch();
  const glow = new Batch();
  // 시가지 바닥 + 건물
  const palette = [0xe8ecf0, 0xd5dbe2, 0xc3ccd6, 0xf3efe6, 0xb9c7d8, 0xdfe6ee];
  for (const d of DISTRICTS) {
    const [cx, cz] = mapXZ(d.lon, d.lat);
    b.cyl(d.r * 1.15, d.r * 1.15, 0.012, cx, LAND_Y, cz, 0xc9cfc6, 18);
    for (let i = 0; i < d.n; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * d.r;
      const x = cx + Math.cos(a) * r;
      const z = cz + Math.sin(a) * r;
      if (!isLand(x, z) || Math.abs(x) > H - 0.3 || Math.abs(z) > H - 0.3) continue;
      const w = 0.1 + rand() * 0.14;
      const h = d.hMin + rand() ** 2 * (d.hMax - d.hMin);
      const tall = d.name === '마린시티';
      b.box(w, h, w * (0.7 + rand() * 0.6), x, LAND_Y, z, tall ? 0x86b7d6 : palette[Math.floor(rand() * palette.length)], rand() * Math.PI);
      if (h > 0.7 && rand() > 0.5) glow.box(0.03, 0.03, 0.03, x, LAND_Y + h, z, 0xff5a4a);
    }
  }
  // 산
  for (const m of MOUNTAINS) {
    const [x, z] = mapXZ(m.lon, m.lat);
    const hk = (m.h / 1000) * 2.3;
    const greens = [0x4d8a50, 0x5a9858, 0x447f4a];
    b.cyl(m.r * 0.12, m.r, hk, x, LAND_Y, z, greens[Math.floor(rand() * 3)], 9);
    for (let i = 0; i < 3; i++) {
      const a = rand() * Math.PI * 2;
      const rr = m.r * (0.35 + rand() * 0.3);
      const px = clampH(x + Math.cos(a) * rr);
      const pz = clampH(z + Math.sin(a) * rr);
      if (!isLand(px, pz)) continue;
      b.cyl(m.r * 0.06, m.r * 0.55, hk * (0.45 + rand() * 0.3), px, LAND_Y, pz, greens[Math.floor(rand() * 3)], 8);
    }
  }
  addMapLandmarks(b, glow, rand);
  root.add(b.build(solidMaterial()));
  root.add(glow.build(glowMaterial()));

  // 방위 표시
  const north = makeSign('N ▲', 1.6, { w: 256, h: 128, size: 76, bg: 'rgba(8,16,36,0.75)', border: '#7fd6ff', radius: 30 });
  north.rotation.x = -Math.PI / 2;
  north.position.set(H - 1.6, 0.09, -H + 1.2);
  root.add(north);

  // 핀
  const pins = new Map();
  for (const spot of SPOTS) {
    const pin = makePin(spot);
    pins.set(spot.id, pin);
    root.add(pin.group);
  }

  return {
    root,
    pins,
    /** 화면 모드(비VR)에서는 라벨을 키워 작은 화면에서도 읽히게 한다 */
    setLabelScale(k) {
      for (const pin of pins.values()) pin.labelScale = k;
    },
    update(t) {
      for (const fn of anims) fn(t);
      for (const pin of pins.values()) pin.update(t);
    },
  };
}

/** 허브 공간: 바닥 + 지도 테이블 + 밤하늘 */
export function buildHub() {
  const group = new THREE.Group();
  group.name = 'hub';
  const sky = makeSky('hub', 400);
  const stars = makeStars(900, 380);
  group.add(sky, stars, makeLights('hub'));

  // 바닥 (방사형 그라데이션 + 동심원)
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1024;
  const ctx = cv.getContext('2d');
  const grad = ctx.createRadialGradient(512, 512, 40, 512, 512, 512);
  grad.addColorStop(0, '#22335f');
  grad.addColorStop(0.55, '#121c3a');
  grad.addColorStop(1, '#070b18');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.strokeStyle = 'rgba(127,214,255,0.22)';
  ctx.lineWidth = 3;
  for (let r = 100; r < 512; r += 68) {
    ctx.beginPath();
    ctx.arc(512, 512, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(512 + Math.cos(a) * 100, 512 + Math.sin(a) * 100);
    ctx.lineTo(512 + Math.cos(a) * 512, 512 + Math.sin(a) * 512);
    ctx.stroke();
  }
  const floorTex = new THREE.CanvasTexture(cv);
  floorTex.colorSpace = THREE.SRGBColorSpace;
  floorTex.anisotropy = 8;
  const floorGeo = new THREE.CircleGeometry(11, 64);
  floorGeo.rotateX(-Math.PI / 2);
  const floor = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ map: floorTex }));
  group.add(floor);

  // 지도 테이블
  const size = MAP.halfSizeKm * 2 * MAP.scale;
  const b = new Batch();
  const glow = new Batch();
  b.box(size + 0.16, TABLE_Y - 0.02, size + 0.16, 0, 0, 0, 0x1b2540);
  b.box(size + 0.3, 0.06, size + 0.3, 0, 0, 0, 0x101829);
  for (const s of [-1, 1]) {
    glow.box(size + 0.18, 0.025, 0.025, 0, TABLE_Y - 0.03, (s * (size + 0.17)) / 2, 0x4fd6ff);
    glow.box(0.025, 0.025, size + 0.18, (s * (size + 0.17)) / 2, TABLE_Y - 0.03, 0, 0x4fd6ff);
  }
  group.add(b.build(solidMaterial()), glow.build(glowMaterial()));

  const map = buildBusanMap();
  group.add(map.root);

  return {
    group,
    map,
    floor,
    teleportSurfaces: [floor],
    fog: null,
    update(t, dt, camPos) {
      sky.position.copy(camPos);
      stars.position.copy(camPos);
      map.update(t);
    },
  };
}

// ───────────────────────── 명소 장면 ─────────────────────────
function hashId(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** 명소 장면 제작 도우미: 배치(Batch) 3종 + 지면/바다/간판/애니메이션 등록 */
export class SceneCtx {
  constructor(spot) {
    this.spot = spot;
    this.skyName = spot.sky || 'day';
    this.preset = skyPreset(this.skyName);
    this.night = this.preset.night;
    this.group = new THREE.Group();
    this.solid = new Batch(); // 일반 지형·구조물
    this.bld = new Batch(); // 창문 텍스처 건물
    this.glow = new Batch(); // 스스로 빛나는 것 (조명·네온)
    this.anims = [];
    this.teleport = [];
    this.spawn = { x: 0, z: 0, yaw: 0 };
    this.rand = mulberry32(hashId(spot.id));
    this.fogRange = [90, 1100];
    this.bounds = 12; // PC/모바일 걷기 반경
    this.hooks = {}; // main.js 가 연결: hooks.sfx(name) → 효과음
  }

  /** 장면 효과음 (불꽃 등). 오디오 엔진의 같은 이름 메서드를 호출한다. */
  sfx(name) {
    this.hooks.sfx?.(name);
  }

  add(obj) {
    this.group.add(obj);
    return obj;
  }

  /** 매 프레임 호출: fn(t, dt) */
  anim(fn) {
    this.anims.push(fn);
  }

  /** 원형 지면 (텔레포트 가능) */
  disc(radius, color, y = 0, x = 0, z = 0, teleport = true) {
    const geo = new THREE.CircleGeometry(radius, 40);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
    m.position.set(x, y, z);
    this.group.add(m);
    if (teleport) this.teleport.push(m);
    return m;
  }

  /** 사각 지면 (텔레포트 가능 여부 선택) */
  plane(w, d, x, y, z, color, teleport = false, ry = 0) {
    const geo = new THREE.PlaneGeometry(w, d);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
    m.position.set(x, y, z);
    m.rotation.y = ry;
    this.group.add(m);
    if (teleport) this.teleport.push(m);
    return m;
  }

  sea(opts = {}) {
    const sea = makeSea(this.skyName, opts);
    this.group.add(sea);
    this.anims.push(sea.userData.tick);
    return sea;
  }

  sign(text, width, x, y, z, ry = 0, opts = {}) {
    const s = makeSign(text, width, opts);
    s.position.set(x, y, z);
    s.rotation.y = ry;
    this.group.add(s);
    return s;
  }

  finish() {
    const g = this.group;
    if (!this.solid.empty) g.add(this.solid.build(solidMaterial()));
    if (!this.bld.empty) g.add(this.bld.build(facadeMaterial(this.night)));
    if (!this.glow.empty) g.add(this.glow.build(glowMaterial()));
    this.skyMesh = makeSky(this.skyName);
    g.add(this.skyMesh);
    if (this.preset.stars) {
      this.stars = makeStars();
      g.add(this.stars);
    }
    if (this.preset.clouds) g.add(makeClouds(this.preset.clouds, 14, hashId(this.spot.id) % 97));
    g.add(makeLights(this.skyName));
  }
}

/**
 * 명소 장면 생성. spot.panoramaUrl 이 있으면 360도 이미지를 불러와 절차적 장면을 교체한다.
 * (이미지 로딩 실패 시 절차적 장면이 그대로 유지된다)
 */
export function buildSpotScene(spot) {
  const ctx = new SceneCtx(spot);
  const builder = SPOT_BUILDERS[spot.id] || SPOT_BUILDERS.__default;
  builder(ctx);
  ctx.finish();
  const group = ctx.group;
  group.name = `spot-${spot.id}`;
  let pano = null;

  if (spot.panoramaUrl) {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      spot.panoramaUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const geo = new THREE.SphereGeometry(900, 64, 40);
        geo.scale(-1, 1, 1);
        pano = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, fog: false, toneMapped: false }));
        pano.renderOrder = -5;
        // 절차적 장면은 숨기고(텔레포트용 지면은 레이캐스트에 계속 사용) 파노라마만 표시
        for (const child of group.children) child.visible = false;
        group.add(pano);
        const ringGeo = new THREE.RingGeometry(0.9, 1.0, 48);
        ringGeo.rotateX(-Math.PI / 2);
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x7fd6ff, transparent: true, opacity: 0.5, fog: false }));
        ring.position.y = 0.01;
        group.add(ring);
      },
      undefined,
      () => console.warn(`[busan-vr] 파노라마를 불러오지 못해 절차적 장면을 사용합니다: ${spot.panoramaUrl}`),
    );
  }

  const camPos = new THREE.Vector3();
  return {
    group,
    spot,
    teleportSurfaces: ctx.teleport,
    spawn: ctx.spawn,
    bounds: ctx.bounds,
    hooks: ctx.hooks,
    ambience: spot.ambience || 'sea',
    fog: { color: ctx.preset.fog, near: ctx.fogRange[0], far: ctx.fogRange[1] },
    update(t, dt, cameraWorldPos) {
      camPos.copy(cameraWorldPos);
      ctx.skyMesh.position.copy(camPos);
      if (ctx.stars) ctx.stars.position.copy(camPos);
      if (pano) pano.position.copy(camPos);
      for (const fn of ctx.anims) fn(t, dt);
    },
    dispose() {
      disposeTree(group);
    },
  };
}
