// 부산 지하철: (1) 3D 지도 위 1~4호선 선로와 미니어처 열차 실시간 운행
//             (2) 1인칭 객차 탑승 → 주행음/차임벨 + 터널·지상 풍경 + ko-KR 안내방송 → 자동 출입문 개방 후 명소 도착
import * as THREE from 'three';
import { SUBWAY_LINES, lineById } from './busanData.js';
import { LAND_Y, mapCurve } from './proceduralScenes.js';
import {
  Batch, solidMaterial, glowMaterial, facadeMaterial, makeSky, makeSign, makeLabelSprite, mulberry32, addPerson, addTree,
} from './kit3d.js';
import { UIPanel } from './vrMenu.js';
import { Scroller, LedDisplay, ease } from './rideKit.js';

const HW = 1.4; // 객차 반폭
const HT = 2.3; // 실내 높이
const HL = 9.5; // 객차 반길이
const DOOR_Z = [-7.2, -2.4, 2.4, 7.2];
const SEGS = [[-9.5, -7.9], [-6.5, -3.1], [-1.7, 1.7], [3.1, 6.5], [7.9, 9.5]];
const VMAX = 17; // m/s
const ACC = 2.2;
const DEC = 2.0;
const STATION_HALF = 32;

export class SubwaySystem {
  /**
   * @param {{audio:import('./audioEngine.js').AudioEngine, ix:import('./vrMenu.js').Interactions}} o
   */
  constructor(o) {
    this.audio = o.audio;
    this.ix = o.ix;
    this.trains = [];
    this.ride = null;
    this.active = false;
    this.spawn = { x: 0, z: 0, yaw: 0 };
    this.fog = { color: new THREE.Color(0x07090d), near: 14, far: 105 };
    this.onStatus = null; // (text) => void : HUD 표시용
  }

  // ───────────────────────── 지도 레이어 ─────────────────────────
  buildMapLayer() {
    const g = new THREE.Group();
    g.name = 'subway-map';
    const count = new Map();
    for (const line of SUBWAY_LINES) for (const s of line.stations) count.set(s.name, (count.get(s.name) || 0) + 1);
    const st = new Batch();
    for (const line of SUBWAY_LINES) {
      const y = LAND_Y + 0.1 + line.id * 0.014;
      const curve = mapCurve(line.stations.map((s) => [s.lon, s.lat]), y);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, line.stations.length * 10, 0.06, 6, false),
        new THREE.MeshBasicMaterial({ color: line.color, toneMapped: false }),
      );
      g.add(tube);
      for (const s of line.stations) {
        const p = curve.getPointAt(this._stationU(curve, s, line));
        const transfer = count.get(s.name) > 1;
        st.cyl(transfer ? 0.17 : 0.105, transfer ? 0.17 : 0.105, 0.05, p.x, y - 0.01, p.z, 0xffffff, 12);
        st.cyl(transfer ? 0.1 : 0.055, transfer ? 0.1 : 0.055, 0.06, p.x, y - 0.01, p.z, transfer ? 0x1c2540 : line.color, 10);
      }
      const head = curve.getPointAt(0);
      const tag = makeLabelSprite(line.name, 1.2, { w: 256, h: 96, size: 54, bg: line.color, fg: '#ffffff', radius: 44, depthTest: false });
      tag.position.set(head.x, y + 0.55, head.z);
      tag.renderOrder = 5;
      g.add(tag);
      // 열차 2편성 (상·하행)
      const length = curve.getLength();
      for (let k = 0; k < 2; k++) {
        const cars = [];
        for (let c = 0; c < 3; c++) {
          const car = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.15, 0.36), new THREE.MeshLambertMaterial({ color: 0xf4f6f8 }));
          body.position.y = 0.09;
          const band = new THREE.Mesh(new THREE.BoxGeometry(0.175, 0.045, 0.365), new THREE.MeshBasicMaterial({ color: line.color, toneMapped: false }));
          band.position.y = 0.07;
          car.add(body, band);
          g.add(car);
          cars.push(car);
        }
        this.trains.push({ curve, length, cars, phase: k + line.id * 0.37, speed: 0.75 + line.id * 0.06, y });
      }
    }
    g.add(st.build(solidMaterial()));
    this.mapLayer = g;
    return g;
  }

  _stationU(curve, station, line) {
    // 역은 곡선의 제어점이므로 인덱스 비율로 근사한 뒤 가까운 지점을 찾는다
    const idx = line.stations.indexOf(station);
    const n = line.stations.length - 1;
    const target = mapCurve([[station.lon, station.lat]].concat([[station.lon + 1e-6, station.lat]]), 0).getPoint(0);
    let best = idx / n;
    let bestD = Infinity;
    for (let i = -12; i <= 12; i++) {
      const u = THREE.MathUtils.clamp(idx / n + i * 0.004, 0, 1);
      const p = curve.getPointAt(u);
      const d = (p.x - target.x) ** 2 + (p.z - target.z) ** 2;
      if (d < bestD) {
        bestD = d;
        best = u;
      }
    }
    return best;
  }

  updateMap(t) {
    const p = new THREE.Vector3();
    const tan = new THREE.Vector3();
    for (const tr of this.trains) {
      const cycle = ((t * tr.speed) / tr.length + tr.phase) % 2;
      const dir = cycle < 1 ? 1 : -1;
      const u = cycle < 1 ? cycle : 2 - cycle;
      const gap = 0.4 / tr.length;
      tr.cars.forEach((car, i) => {
        const cu = THREE.MathUtils.clamp(u - dir * i * gap, 0.0005, 0.9995);
        tr.curve.getPointAt(cu, p);
        tr.curve.getTangentAt(cu, tan);
        car.position.copy(p);
        car.rotation.y = Math.atan2(tan.x, tan.z);
      });
    }
  }

  // ───────────────────────── 객차 내부 ─────────────────────────
  _buildRide() {
    const group = new THREE.Group();
    group.name = 'subway-ride';
    const b = new Batch();
    const glow = new Batch();
    const wall = 0xe4e8ec;
    const steel = 0xc9ced4;
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x9fc8dc, transparent: true, opacity: 0.16, depthWrite: false, fog: false });
    const glass = new Batch();

    // 바닥·천장·끝벽
    b.box(HW * 2, 0.06, HL * 2, 0, -0.06, 0, 0x7c838b);
    b.box(HW * 2, 0.06, HL * 2, 0, HT, 0, 0xeef1f4);
    for (const s of [-1, 1]) {
      b.box(HW * 2, HT, 0.08, 0, 0, s * HL, wall);
      b.box(0.95, 1.95, 0.05, 0, 0, s * (HL - 0.06), 0xaab1ba);
      b.box(0.5, 0.6, 0.02, 0, 1.15, s * (HL - 0.09), 0x26303c);
    }
    for (let z = -8.4; z <= 8.4; z += 2.4) {
      glow.box(0.24, 0.02, 1.5, -0.42, HT - 0.02, z, 0xfafcff);
      glow.box(0.24, 0.02, 1.5, 0.42, HT - 0.02, z, 0xfafcff);
      b.box(0.5, 0.015, 0.9, 0, HT - 0.016, z + 1.2, 0x9aa3ad);
    }
    // 옆벽·창문·좌석·봉
    for (const s of [-1, 1]) {
      const x = s * HW;
      b.box(0.08, 0.42, HL * 2, x, 1.88, 0, wall);
      SEGS.forEach(([z0, z1], si) => {
        const len = z1 - z0;
        const mid = (z0 + z1) / 2;
        b.box(0.08, 0.95, len, x, 0, mid, wall);
        b.box(0.08, 0.93, 0.16, x, 0.95, z0 + 0.08, wall);
        b.box(0.08, 0.93, 0.16, x, 0.95, z1 - 0.08, wall);
        glass.box(0.02, 0.93, len - 0.32, x, 0.95, mid, 0xffffff);
        const priority = si === 0 || si === 4;
        const seat = priority ? 0xf2a0b8 : 0x3f6fb5;
        const bl = len - (priority ? 0.3 : 0.4);
        b.box(0.4, 0.4, bl, x - s * 0.26, 0, mid, 0x596069);
        b.box(0.46, 0.08, bl, x - s * 0.29, 0.4, mid, seat);
        b.box(0.08, 0.44, bl, x - s * 0.09, 0.5, mid, seat);
        for (const ze of [z0 + 0.17, z1 - 0.17]) {
          b.box(0.5, 0.62, 0.03, x - s * 0.29, 0.4, ze, 0xdfe5ea);
          b.cyl(0.018, 0.018, HT - 0.4, x - s * 0.53, 0.4, ze, steel, 8);
        }
      });
      // 손잡이 봉
      b.beam(x - s * 0.62, 1.98, -9.1, x - s * 0.62, 1.98, 9.1, 0.028, steel);
      for (let z = -8.4; z <= 8.4; z += 2.4) b.beam(x - s * 0.62, 1.98, z, x - s * 0.62, HT, z, 0.02, steel);
      // 출입문 앞 노란 안전선
      for (const dz of DOOR_Z) b.box(0.22, 0.004, 1.4, x - s * 0.16, 0.001, dz, 0xf2c230);
    }
    // 왼쪽 출입문(닫힘 고정)
    for (const dz of DOOR_Z) {
      b.box(0.05, 0.95, 1.4, -HW, 0, dz, steel);
      b.box(0.05, 0.93, 0.05, -HW, 0.95, dz, steel);
      glass.box(0.02, 0.93, 1.36, -HW, 0.95, dz, 0xffffff);
    }
    group.add(b.build(solidMaterial()), glow.build(glowMaterial()), glass.build(glassMat));

    // 오른쪽 자동 출입문 (슬라이딩 패널 2장씩)
    const doors = [];
    const panelGeo = new THREE.BoxGeometry(0.05, 0.95, 0.7);
    panelGeo.translate(0, 0.475, 0);
    const frameGeo = new THREE.BoxGeometry(0.05, 0.93, 0.05);
    frameGeo.translate(0, 0.95 + 0.465, 0);
    const paneGeo = new THREE.BoxGeometry(0.02, 0.93, 0.66);
    paneGeo.translate(0, 0.95 + 0.465, 0);
    const steelMat = new THREE.MeshLambertMaterial({ color: steel });
    for (const dz of DOOR_Z) {
      for (const side of [-1, 1]) {
        const panel = new THREE.Group();
        const edge = new THREE.Mesh(frameGeo, steelMat);
        edge.position.z = -side * 0.325;
        panel.add(new THREE.Mesh(panelGeo, steelMat), new THREE.Mesh(paneGeo, glassMat), edge);
        panel.position.set(HW, 0, dz + side * 0.35);
        group.add(panel);
        doors.push({ panel, baseZ: dz + side * 0.35, side });
      }
    }

    // 손잡이 (인스턴스 메시: 주행 중 흔들림)
    const strapPos = [];
    for (const s of [-1, 1]) for (let z = -8.8; z <= 8.8; z += 0.44) strapPos.push([s * (HW - 0.62), z]);
    const strapGeo = new THREE.BoxGeometry(0.028, 0.2, 0.008);
    strapGeo.translate(0, -0.11, 0);
    const ringGeo = new THREE.TorusGeometry(0.058, 0.011, 6, 16);
    ringGeo.rotateY(Math.PI / 2);
    ringGeo.translate(0, -0.27, 0);
    const straps = new THREE.InstancedMesh(strapGeo, new THREE.MeshLambertMaterial({ color: 0x8d949c }), strapPos.length);
    const rings = new THREE.InstancedMesh(ringGeo, new THREE.MeshLambertMaterial({ color: 0xf4f4f0 }), strapPos.length);
    straps.frustumCulled = false;
    rings.frustumCulled = false;
    group.add(straps, rings);

    // 노선 색 띠 + LED 전광판
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf06a00, toneMapped: false });
    for (const s of [-1, 1]) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.05, HL * 2 - 0.2), stripeMat);
      stripe.position.set(s * (HW - 0.045), 1.86, 0);
      group.add(stripe);
    }
    const led = new LedDisplay(1024, 192);
    const hang = new THREE.PlaneGeometry(1.5, 0.28);
    for (const [z, ry] of [[-3.1, 0], [3.1, Math.PI], [-7.9, 0], [7.9, Math.PI]]) {
      const m = new THREE.Mesh(hang, led.material);
      m.position.set(0, 2.1, z);
      m.rotation.y = ry;
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.34, 0.06), new THREE.MeshLambertMaterial({ color: 0x20242a }));
      box.position.set(0, 2.1, z + (ry === 0 ? -0.035 : 0.035));
      group.add(m, box);
    }
    const sideLed = new THREE.PlaneGeometry(1.15, 0.215);
    for (const dz of DOOR_Z) {
      for (const s of [-1, 1]) {
        const m = new THREE.Mesh(sideLed, led.material);
        m.position.set(s * (HW - 0.05), 2.05, dz);
        m.rotation.y = -s * (Math.PI / 2);
        group.add(m);
      }
    }

    // 조명
    group.add(new THREE.HemisphereLight(0xffffff, 0x8d95a6, 1.75));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(0.4, 1, 0.3);
    group.add(key);

    // 텔레포트용 바닥 (보이지 않음)
    const floorGeo = new THREE.PlaneGeometry(HW * 2 - 1.1, HL * 2 - 0.6);
    floorGeo.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ visible: false }));
    floor.position.y = 0.002;
    group.add(floor);

    // ── 바깥 풍경 ──
    const env = new THREE.Group();
    group.add(env);
    const tunnelSolid = solidMaterial();
    const tunnelGlow = glowMaterial({ fog: true });
    const tunnel = new Scroller({
      length: 12, count: 11, behind: 30,
      make: (i) => {
        const tb = new Batch();
        const tg = new Batch();
        tb.box(5.8, 0.3, 12, 0, -1.5, 0, 0x2a2b2e);
        tb.box(0.3, 5.2, 12, -2.8, -1.5, 0, 0x33363b);
        tb.box(0.3, 5.2, 12, 2.8, -1.5, 0, 0x33363b);
        tb.box(5.9, 0.3, 12, 0, 3.45, 0, 0x2b2e32);
        for (const sx of [-1, 1]) {
          tb.box(0.08, 0.12, 12, sx * 0.72, -1.2, 0, 0x8a9098);
          for (const rz of [-4, 0, 4]) tb.box(0.2, 5, 0.45, sx * 2.6, -1.5, rz, 0x4b5058);
          [0x17191c, 0x7a2a22, 0x1f3f7a].forEach((c, k) => tb.beam(sx * 2.58, 0.5 + k * 0.2, -6, sx * 2.58, 0.5 + k * 0.2, 6, 0.05, c));
          tg.box(0.06, 0.16, 0.7, sx * 2.56, 1.75, sx * 2.5, 0xdfeaff);
        }
        for (let z = -5.6; z < 6; z += 0.8) tb.box(2.5, 0.08, 0.24, 0, -1.22, z, 0x47433c);
        if (i % 4 === 0) tg.box(0.05, 0.3, 0.5, 2.56, 0.9, 0, 0x4dff8a);
        const mod = new THREE.Group();
        mod.add(tb.build(tunnelSolid), tg.build(tunnelGlow));
        return mod;
      },
    });
    env.add(tunnel.group);

    const surfSolid = solidMaterial();
    const surfBld = facadeMaterial(false);
    const surface = new Scroller({
      length: 50, count: 8, behind: 75,
      make: (i) => {
        const rand = mulberry32(900 + i * 17);
        const sb = new Batch();
        const bb = new Batch();
        sb.box(420, 0.4, 50, 0, -1.95, 0, i % 2 ? 0x8a9a74 : 0x869672);
        sb.box(7, 0.35, 50, 0, -1.55, 0, 0x7a746a);
        for (const sx of [-1, 1]) {
          sb.box(0.08, 0.12, 50, sx * 0.72, -1.2, 0, 0x8a9098);
          sb.box(0.1, 1.3, 50, sx * 4.4, -1.55, 0, 0xcbd3da);
        }
        for (let z = -24; z < 25; z += 2.5) sb.box(2.5, 0.08, 0.26, 0, -1.22, z, 0x5a554c);
        for (const pz of [-13, 12]) {
          sb.box(0.2, 6.6, 0.2, -3.3, -1.55, pz, 0x6d747c);
          sb.beam(-3.3, 4.7, pz, 0.6, 4.7, pz, 0.1, 0x6d747c);
        }
        sb.box(11, 0.05, 50, -16, -1.72, 0, 0x4a4d52); // 옆 도로
        const palette = [0xe8e4da, 0xd9dfe6, 0xcfd6c9, 0xf0e6d6, 0xc7d3e0, 0xe3d7c9];
        const n = 5 + Math.floor(rand() * 4);
        for (let k = 0; k < n; k++) {
          const sx = rand() > 0.5 ? 1 : -1;
          const w = 10 + rand() * 14;
          const h = 8 + rand() ** 2 * 44;
          bb.building(w, h, 10 + rand() * 10, sx * (26 + rand() * 80), -1.75, (rand() - 0.5) * 44, palette[Math.floor(rand() * palette.length)], rand() > 0.5 ? 0 : Math.PI / 2);
        }
        for (let k = 0; k < 6; k++) {
          const sx = rand() > 0.5 ? 1 : -1;
          addTree(sb, sx * (7 + rand() * 12), -1.75, (rand() - 0.5) * 46, 4 + rand() * 3, [0x4f8a45, 0x5d9a4f, 0x3f7a40][k % 3]);
        }
        const mod = new THREE.Group();
        mod.add(sb.build(surfSolid), bb.build(surfBld));
        return mod;
      },
    });
    const sky = makeSky('day', 1200);
    const hills = new Batch();
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2 + 0.3;
      hills.dome(190 + (k % 3) * 60, 60 + (k % 4) * 28, Math.cos(a) * 640, -6, Math.sin(a) * 640, [0x55805a, 0x4a7350, 0x638c62][k % 3]);
    }
    const hillMesh = hills.build(new THREE.MeshLambertMaterial({ vertexColors: true, fog: false }));
    const surfaceGroup = new THREE.Group();
    surfaceGroup.add(surface.group, sky, hillMesh);
    surfaceGroup.visible = false;
    env.add(surfaceGroup);

    // ── 역 승강장 ──
    const station = new THREE.Group();
    const pb = new Batch();
    const pg = new Batch();
    const pglass = new Batch();
    const SL = STATION_HALF * 2;
    pb.box(5.3, 1.5, SL, 4.17, -1.5, 0, 0xb4b9bf);
    pb.box(5.3, 0.02, SL, 4.17, 0, 0, 0xdadde0);
    pb.box(0.36, 0.024, SL, 1.95, 0, 0, 0xf2c230);
    pb.box(0.3, 3.2, SL, 6.9, 0, 0, 0xece8de);
    pb.box(9.9, 0.25, SL, 2.1, 3.05, 0, 0xdfe3e8);
    pb.box(0.3, 5.2, SL, -2.8, -1.5, 0, 0xc9cdd1);
    pb.box(5.8, 0.3, SL, 0, -1.5, 0, 0x2a2b2e);
    for (const sx of [-1, 1]) pb.box(0.08, 0.12, SL, sx * 0.72, -1.2, 0, 0x8a9098);
    pb.box(0.14, 0.9, SL, 1.62, 2.15, 0, 0x7f8790);
    const rand = mulberry32(31);
    for (let z = -28; z <= 28; z += 8) {
      pb.cyl(0.22, 0.22, 3.05, 5.2, 0, z + 1.2, 0xf3f2ee, 12);
      pg.box(0.26, 0.03, 2.4, 3.1, 3.03, z, 0xfbfdff);
      pg.box(0.26, 0.03, 2.4, 5.6, 3.03, z + 2, 0xfbfdff);
    }
    for (let k = 0; k < 9; k++) {
      addPerson(pb, 3.2 + rand() * 3.2, 0.02, -26 + rand() * 52, 1.55 + rand() * 0.25, [0x3b4a6b, 0x8a3b4a, 0x4a6b3b, 0x6b5a3b, 0x555c66][k % 5]);
    }
    // 스크린도어: 문 사이 고정 유리 + 기둥
    const edges = [-STATION_HALF, ...DOOR_Z.flatMap((d) => [d - 0.72, d + 0.72]), STATION_HALF];
    for (let k = 0; k < edges.length; k += 2) {
      const z0 = edges[k];
      const z1 = edges[k + 1];
      pglass.box(0.03, 2.15, z1 - z0, 1.62, 0, (z0 + z1) / 2, 0xffffff);
      if (k > 0) pb.box(0.1, 2.15, 0.1, 1.62, 0, z0, 0x7f8790);
      if (k < edges.length - 2) pb.box(0.1, 2.15, 0.1, 1.62, 0, z1, 0x7f8790);
    }
    station.add(pb.build(solidMaterial()), pg.build(glowMaterial()), pglass.build(glassMat));
    const psd = [];
    const psdGeo = new THREE.BoxGeometry(0.03, 2.1, 0.72);
    psdGeo.translate(0, 1.05, 0);
    for (const dz of DOOR_Z) {
      for (const side of [-1, 1]) {
        const m = new THREE.Mesh(psdGeo, glassMat);
        m.position.set(1.62, 0, dz + side * 0.36);
        station.add(m);
        psd.push({ panel: m, baseZ: dz + side * 0.36, side });
      }
    }
    const bandMat = new THREE.MeshBasicMaterial({ color: 0xf06a00, toneMapped: false });
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, SL), bandMat);
    band.position.set(6.74, 1.05, 0);
    station.add(band);
    const signs = new THREE.Group();
    station.add(signs);
    env.add(station);

    // 탑승 정보 패널 (건너뛰기 버튼)
    const panel = new UIPanel({ width: 0.78, onAction: (id) => id === 'skip' && this.skip() });
    panel.mesh.position.set(-1.25, 1.42, -1.25);
    panel.mesh.rotation.y = Math.PI / 2.6;
    group.add(panel.mesh);
    this.ix.addPanel(panel);

    this.ride = {
      group, doors, psd, straps, rings, strapPos, stripeMat, bandMat, led, floor, env, tunnel, surface, surfaceGroup, sky, station, signs, panel,
    };
    this.teleportSurfaces = [floor];
    this._setDoors(0);
    this._updateStraps(0, 0, 0);
  }

  _setDoors(open) {
    const r = this.ride;
    const k = ease(open);
    for (const d of r.doors) d.panel.position.z = d.baseZ + d.side * 0.66 * k;
    for (const d of r.psd) d.panel.position.z = d.baseZ + d.side * 0.68 * k;
  }

  _updateStraps(t, speedK, accel) {
    const r = this.ride;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3(1, 1, 1);
    r.strapPos.forEach(([x, z], i) => {
      e.set(-accel * 0.07 + Math.sin(t * 1.9 + i * 1.3) * 0.035 * speedK, 0, Math.sin(t * 2.3 + i * 0.9) * 0.05 * speedK);
      q.setFromEuler(e);
      m.compose(p.set(x, 1.965, z), q, s);
      r.straps.setMatrixAt(i, m);
      r.rings.setMatrixAt(i, m);
    });
    r.straps.instanceMatrix.needsUpdate = true;
    r.rings.instanceMatrix.needsUpdate = true;
  }

  _setStationName(name, line) {
    const r = this.ride;
    for (const child of [...r.signs.children]) {
      child.material.map?.dispose();
      child.material.dispose();
      child.geometry.dispose();
      r.signs.remove(child);
    }
    r.bandMat.color.set(line.color);
    for (const z of [-21, -12, -2.4, 7.2, 17]) {
      const sign = makeSign(name, 2.7, { w: 768, h: 256, size: 120, bg: '#ffffff', fg: '#111827', border: line.color, borderW: 18, radius: 36, sub: `${line.name} · 부산교통공사`, subColor: '#475569', subSize: 40 });
      sign.position.set(6.72, 1.95, z);
      sign.rotation.y = -Math.PI / 2;
      r.signs.add(sign);
    }
  }

  _setSurface(on) {
    if (this.surfaceOn === on) return;
    this.surfaceOn = on;
    const r = this.ride;
    r.surfaceGroup.visible = on;
    r.tunnel.group.visible = !on;
    if (on) {
      this.fog.color.setHex(0xc4e0f2);
      this.fog.near = 70;
      this.fog.far = 420;
    } else {
      this.fog.color.setHex(0x07090d);
      this.fog.near = 14;
      this.fog.far = 105;
    }
  }

  _led(line1, line2, extra = {}) {
    const line = lineById(this.curLine) || SUBWAY_LINES[0];
    this.ride.led.draw({ badge: line.name, badgeColor: line.color, line1, line2, ...extra });
    this.onStatus?.(line2 ? `${line1} · ${line2}` : line1);
  }

  // ───────────────────────── 탑승 진행 ─────────────────────────
  /**
   * @param {ReturnType<import('./busanData.js').planSubwayTrip>} plan
   * @param {{spot:object, onArrive:Function}} o
   */
  startRide(plan, o) {
    if (!this.ride) this._buildRide();
    const r = this.ride;
    this.plan = plan;
    this.spot = o.spot;
    this.onArrive = o.onArrive;
    this.origin = plan.stops[0];
    this.dest = plan.stops[plan.stops.length - 1];
    this.curLine = plan.stops[1]?.line ?? this.origin.line;
    this.active = true;
    this.phase = 'board';
    this.pt = 0;
    this.t = 0;
    this.v = 0;
    this.accel = 0;
    this.hop = 0;
    this.flags = {};
    this.surfaceOn = null;
    this._setSurface(false);
    r.tunnel.reset();
    r.surface.reset();
    r.station.visible = true;
    r.station.position.z = 0;
    const line = lineById(this.curLine);
    r.stripeMat.color.set(line.color);
    this._setStationName(this.origin.name, line);
    this._setDoors(1);
    const cruise = THREE.MathUtils.clamp(2 + plan.hops * 0.9, 3, 9);
    this.runTotal = VMAX / ACC + cruise;
    const via = plan.transfers.length ? ` · ${plan.transfers.map((x) => `${x.at}역 ${x.to}호선 환승`).join(', ')}` : '';
    r.panel.set({
      badge: '🚇 지하철 탑승 중',
      accent: line.color,
      title: `${this.origin.name} → ${this.dest.name}`,
      body: `${line.name}${via}\n목적지: ${this.spot.name}`,
      footer: '도착하면 오른쪽 문이 열립니다.',
      buttons: [{ id: 'skip', label: '⏭ 건너뛰기 (바로 도착)', color: '#e11d48' }],
    });
    r.panel.show();
    this._led(`${this.origin.name} → ${this.dest.name}`, `${plan.hops}개 역 이동 · ${this.spot.name}`);
    this.audio.setLoop('subway', 0.85);
    this.audio.setParam('subway', 0);
    this.audio.doorChime();
  }

  skip() {
    if (!this.active || this.phase === 'done') return;
    this.audio.click();
    this._arrive();
  }

  _arrive() {
    if (this.phase === 'done') return;
    this.phase = 'done';
    this.audio.cancelSpeech();
    this.audio.setLoop('subway', 0);
    const cb = this.onArrive;
    this.onArrive = null;
    cb?.();
  }

  stop() {
    this.active = false;
    this.phase = 'done';
    this.ride?.panel.hide();
    this.audio.setLoop('subway', 0);
  }

  update(dt, cameraWorldPos) {
    if (!this.active || !this.ride) return;
    const r = this.ride;
    this.t += dt;
    this.pt += dt;
    const once = (key, cond, fn) => {
      if (cond && !this.flags[key]) {
        this.flags[key] = true;
        fn();
      }
    };
    const prevV = this.v;

    if (this.phase === 'board') {
      once('close-voice', this.pt > 1.3, () => this.audio.speak('출입문 닫습니다.'));
      const k = THREE.MathUtils.clamp((this.pt - 2.2) / 1.2, 0, 1);
      this._setDoors(1 - k);
      once('thunk', k >= 1, () => this.audio.thunk());
      if (this.pt > 3.7) {
        this.phase = 'run';
        this.pt = 0;
        const next = this.plan.stops[1];
        this._led(`다음 역  ${next.name}`, `${this.dest.name} 방면 · ${this.plan.hops}개 역 남음`);
      }
    } else if (this.phase === 'run') {
      this.v = Math.min(VMAX, this.v + ACC * dt);
      // 중간 역 통과: 전광판·환승·지상 구간 전환
      const hops = this.plan.hops;
      const targetHop = Math.min(hops - 1, Math.floor((this.pt / this.runTotal) * hops));
      while (this.hop < targetHop) {
        this.hop++;
        const here = this.plan.stops[this.hop];
        const next = this.plan.stops[this.hop + 1];
        const tr = this.plan.transfers.find((x) => x.at === here.name);
        if (tr) {
          this.curLine = tr.to;
          r.stripeMat.color.set(lineById(tr.to).color);
          this._led(`환승  ${here.name}`, `${tr.from}호선 → ${tr.to}호선`, { color2: '#ffe27a' });
          this.audio.busChime();
        } else {
          this._led(`다음 역  ${next.name}`, `${this.dest.name} 방면 · ${hops - this.hop}개 역 남음`);
        }
        this._setSurface(!!next.ground);
      }
      once('first-surface', this.pt > 1.5 && this.plan.stops[1].ground, () => this._setSurface(true));
      if (this.pt >= this.runTotal) {
        this.phase = 'brake';
        this.pt = 0;
        const line = lineById(this.dest.line) || lineById(this.curLine);
        this.curLine = line.id;
        r.stripeMat.color.set(line.color);
        this._setStationName(this.dest.name, line);
        this._setSurface(!!this.dest.ground);
        r.station.position.z = -((this.v * this.v) / (2 * DEC));
        r.station.visible = true;
        this._led(`이번 역  ${this.dest.name}`, '내리실 문 ▶ 오른쪽', { color2: '#7dff9a' });
        this.audio.announceChime();
      }
    } else if (this.phase === 'brake') {
      once('announce', this.pt > 1.0, () => {
        this.audio.speak(`이번 역은 ${this.dest.name}, ${this.dest.name}역입니다. 내리실 문은 오른쪽입니다. ${this.spot.name} 방면으로 가실 고객께서는 이번 역에서 내리시기 바랍니다.`);
      });
      this.v = Math.max(0, this.v - DEC * dt);
      if (this.v <= 0.001 || r.station.position.z >= 0) {
        this.v = 0;
        r.station.position.z = 0;
        this.phase = 'dwell';
        this.pt = 0;
        this.audio.hiss(0.9, 0.16);
        this.audio.doorChime();
        this._led(this.dest.name, `${this.spot.name} 하차`, { color2: '#7dff9a' });
      }
    } else if (this.phase === 'dwell') {
      this._setDoors(THREE.MathUtils.clamp((this.pt - 0.3) / 1.2, 0, 1));
      if (this.pt > 3.2) this._arrive();
    }

    // 풍경 이동
    const d = this.v * dt;
    if (d > 0) {
      r.tunnel.advance(d);
      r.surface.advance(d);
      if (r.station.visible && this.phase !== 'dwell') {
        r.station.position.z += d;
        if (r.station.position.z > STATION_HALF + 60) r.station.visible = false;
        if (this.phase === 'brake' && r.station.position.z > 0) r.station.position.z = 0;
      }
    }
    const sz = r.station.position.z;
    for (const m of r.tunnel.modules) m.obj.visible = !(r.station.visible && Math.abs(m.z - sz) < STATION_HALF + 6);
    r.sky.position.copy(cameraWorldPos);

    this.accel += ((this.v - prevV) / Math.max(dt, 1e-4) - this.accel) * Math.min(1, dt * 4);
    this._updateStraps(this.t, this.v / VMAX, this.accel);
    this.audio.setParam('subway', this.v / VMAX);
  }
}
