// 부산 버스: (1) 3D 지도 위 도로·광안대교를 달리는 시내버스와 2층 시티투어버스
//           (2) 1인칭 탑승 — 시내버스 실내 / 지붕 없는 2층 오픈탑 버스
//               하차벨(3D 버튼)을 누르면 "삐~" 부저 + 불빛 + ko-KR 안내방송 후 다음 명소에 하차
import * as THREE from 'three';
import { BUS_ROUTES, spotById } from './busanData.js';
import { LAND_Y, mapCurve } from './proceduralScenes.js';
import {
  Batch, solidMaterial, glowMaterial, facadeMaterial, makeSky, makeStars, makeSea, makeLights, makeSign, mulberry32, skyPreset,
  addPerson, addTree, addPine, addPalm, addRailing, addLamp, addSuspensionBridge, disposeTree,
} from './kit3d.js';
import { UIPanel } from './vrMenu.js';
import { Scroller, LedDisplay, ease } from './rideKit.js';

const RC = -5.25; // 도로 중심 x (버스는 x=0 바깥 차로를 달린다)
const MOD = 40; // 도로 모듈 길이
const SEA_Y = -30;
const BRIDGE_LEN = 400;
const APPROACH = 100; // 교량 진입 전 거리
const ACC = 2.0;
const DEC = 2.4;

export class BusSystem {
  /**
   * @param {{audio:import('./audioEngine.js').AudioEngine, ix:import('./vrMenu.js').Interactions, blink:(fn:Function)=>Promise<void>}} o
   */
  constructor(o) {
    this.audio = o.audio;
    this.ix = o.ix;
    this.blink = o.blink || (async (fn) => fn());
    this.buses = [];
    this.env = null;
    this.variants = {};
    this.active = false;
    this.spawn = { x: 0, z: 0.9, yaw: 0 };
    this.fog = { color: new THREE.Color(0xc4e0f2), near: 90, far: 480 };
    this.teleportSurfaces = [];
    this.onStatus = null;
    this.group = new THREE.Group();
    this.group.name = 'bus-ride';
  }

  // ───────────────────────── 지도 레이어 ─────────────────────────
  buildMapLayer() {
    const g = new THREE.Group();
    g.name = 'bus-map';
    const marks = new Batch();
    for (const route of BUS_ROUTES) {
      const curve = mapCurve(route.path, LAND_Y + 0.035);
      const roadColor = new THREE.Color(route.color).lerp(new THREE.Color(0xffffff), 0.62);
      const road = new THREE.Mesh(
        new THREE.TubeGeometry(curve, route.path.length * 8, 0.035, 5, false),
        new THREE.MeshBasicMaterial({ color: roadColor, toneMapped: false }),
      );
      g.add(road);
      for (const id of route.stops) {
        const s = spotById(id);
        let best = null;
        let bestD = Infinity;
        for (let i = 0; i <= 200; i++) {
          const p = curve.getPointAt(i / 200);
          const ref = mapCurve([[s.lon, s.lat], [s.lon + 1e-6, s.lat]], 0).getPoint(0);
          const d = (p.x - ref.x) ** 2 + (p.z - ref.z) ** 2;
          if (d < bestD) {
            bestD = d;
            best = p;
          }
        }
        marks.cyl(0.012, 0.012, 0.28, best.x + 0.1, best.y, best.z, 0xdfe5ea, 5);
        marks.cyl(0.07, 0.07, 0.02, best.x + 0.1, best.y + 0.28, best.z, route.color, 10, Math.PI / 2);
      }
      const length = curve.getLength();
      for (let k = 0; k < 2; k++) {
        const bus = new THREE.Group();
        const tour = route.type === 'citytour';
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.15, tour ? 0.13 : 0.12, 0.32), new THREE.MeshLambertMaterial({ color: route.color }));
        body.position.y = tour ? 0.085 : 0.08;
        bus.add(body);
        if (tour) {
          // 2층 오픈탑: 낮은 난간 + 좌석
          const rim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.33), new THREE.MeshLambertMaterial({ color: 0xfff3d0 }));
          rim.position.y = 0.168;
          const seats = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.24), new THREE.MeshLambertMaterial({ color: 0x2a2f3a }));
          seats.position.y = 0.2;
          bus.add(rim, seats);
        } else {
          const roof = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.3), new THREE.MeshLambertMaterial({ color: 0xf4f6f8 }));
          roof.position.y = 0.15;
          bus.add(roof);
        }
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.04, 0.27), new THREE.MeshBasicMaterial({ color: 0x1c2a3a }));
        win.position.y = 0.105;
        bus.add(win);
        g.add(bus);
        this.buses.push({ curve, length, bus, phase: k + route.path.length * 0.13, speed: tour ? 0.5 : 0.62 });
      }
    }
    g.add(marks.build(solidMaterial()));
    this.mapLayer = g;
    return g;
  }

  updateMap(t) {
    const p = new THREE.Vector3();
    const tan = new THREE.Vector3();
    for (const b of this.buses) {
      const cycle = ((t * b.speed) / b.length + b.phase) % 2;
      const u = THREE.MathUtils.clamp(cycle < 1 ? cycle : 2 - cycle, 0.001, 0.999);
      b.curve.getPointAt(u, p);
      b.curve.getTangentAt(u, tan);
      if (cycle >= 1) tan.negate();
      b.bus.position.copy(p);
      b.bus.rotation.y = Math.atan2(tan.x, tan.z);
      b.bus.rotation.x = -Math.asin(THREE.MathUtils.clamp(tan.y, -1, 1));
    }
  }

  // ───────────────────────── 바깥 풍경 ─────────────────────────
  _buildEnv() {
    const env = new THREE.Group();
    const mat = { solid: solidMaterial(), bld: facadeMaterial(true), glow: glowMaterial({ fog: true }) };
    const pal = [0xe8e4da, 0xd9dfe6, 0xcfd6c9, 0xf0e6d6, 0xc7d3e0, 0xe3d7c9, 0xb9c4d0];
    const neon = [0xff4fa0, 0x4fd6ff, 0xffe04f, 0x7dff8a, 0xff7a4f, 0xffffff];

    const makeModule = (i) => {
      const g = new THREE.Group();
      const rand = mulberry32(300 + i * 31);
      const rb = new Batch();
      rb.box(14.3, 0.2, MOD, RC, -0.2, 0, 0x3a3d42);
      for (const lx of [-1.75, -8.85]) for (let z = -18; z < 20; z += 8) rb.box(0.15, 0.012, 3, lx, 0, z, 0xf2f2f2);
      rb.box(0.12, 0.012, MOD, -5.13, 0, 0, 0xf2c230);
      rb.box(0.12, 0.012, MOD, -5.37, 0, 0, 0xf2c230);
      rb.box(0.14, 0.012, MOD, 1.72, 0, 0, 0xf2f2f2);
      rb.box(0.14, 0.012, MOD, -12.22, 0, 0, 0xf2f2f2);
      g.add(rb.build(mat.solid));
      const biomes = {};

      // ── 도심 ──
      {
        const s = new Batch();
        const bl = new Batch();
        const gl = new Batch();
        s.box(560, 0.2, MOD, RC, -0.3, 0, 0x6c7075);
        s.box(3.5, 0.18, MOD, 3.65, 0, 0, 0xb9bdc2);
        s.box(3.5, 0.18, MOD, -14.15, 0, 0, 0xb9bdc2);
        for (const side of [1, -1]) {
          let z = -20;
          while (z < 19) {
            const w = Math.min(8 + rand() * 10, 20 - z);
            if (w < 5) break;
            const h = 9 + rand() ** 2 * 58;
            const d = 10 + rand() * 8;
            const setback = rand() * 2;
            const x = side > 0 ? 5.6 + d / 2 + setback : -16.1 - d / 2 - setback;
            bl.building(d, h, w, x, 0, z + w / 2, pal[Math.floor(rand() * pal.length)]);
            const face = side > 0 ? 5.5 + setback : -16.0 - setback;
            gl.box(0.14, 0.75, w * 0.62, face, 3.1, z + w / 2, neon[Math.floor(rand() * neon.length)]);
            if (h > 30) gl.box(0.14, 1.4, 1.4, face, h * 0.55, z + w / 2, neon[Math.floor(rand() * neon.length)]);
            z += w + 0.5 + rand() * 2.5;
          }
        }
        for (let z = -15; z < 20; z += 10) {
          addTree(s, 2.75, 0.18, z + rand() * 2, 4.5, 0x4f8a45);
          addTree(s, -13.3, 0.18, z + 4 + rand() * 2, 4.5, 0x5d9a4f);
        }
        addLamp(s, gl, -12.75, 0.18, -8, 7);
        addLamp(s, gl, -12.75, 0.18, 12, 7);
        for (const lz of [-18, 2]) {
          s.cyl(0.07, 0.1, 6.5, 2.2, 0.18, lz, 0x59616b, 6);
          gl.box(0.3, 0.14, 0.5, 2.0, 6.6, lz, 0xfff0c2);
        }
        for (let k = 0; k < 4; k++) addPerson(s, 3.2 + rand() * 1.6, 0.18, -18 + rand() * 36, 1.55 + rand() * 0.25, [0x3b4a6b, 0x8a3b4a, 0x4a6b3b, 0x6b5a3b][k]);
        biomes.city = this._biomeGroup(s, bl, gl, mat);
      }
      // ── 해안도로 ──
      {
        const s = new Batch();
        const gl = new Batch();
        s.box(26, 0.2, MOD, RC, -0.3, 0, 0x6c7075);
        s.box(3.5, 0.18, MOD, 3.65, 0, 0, 0xcbc4b4);
        addRailing(s, 5.35, -20, 5.35, 20, 0.18, 1.0, 0xf2f4f6, 2.5);
        s.add(new THREE.BoxGeometry(54, 1, MOD), 0x6f8160, 28.2, -14.9, 0, 0, 0, -0.56);
        for (let k = 0; k < 6; k++) {
          const x = 8 + rand() * 32;
          s.rock(1.4 + rand() * 2.4, x, -(x - 5.4) * 0.627 + 0.3, -18 + rand() * 36, [0x8a8478, 0x7a756b, 0x9a9486][k % 3], 1, 0.7, 1, rand() * 3);
        }
        for (let k = 0; k < 3; k++) {
          const x = 7 + rand() * 9;
          addPine(s, x, -(x - 5.4) * 0.627, -18 + rand() * 36, 6 + rand() * 3, rand);
        }
        for (const pz of [-14, 0, 14]) addPalm(s, 4.5, 0.18, pz + rand() * 2, 5.5 + rand());
        s.box(0.5, 2.4, MOD, -16.4, 0, 0, 0xa8a59a);
        s.box(3.5, 0.18, MOD, -14.15, 0, 0, 0xb9bdc2);
        s.add(new THREE.BoxGeometry(130, 1, MOD), 0x5f8a55, -16.6 - 62, 2.2 + 19.2, 0, 0, 0, -0.3);
        for (let k = 0; k < 7; k++) {
          const x = -19 - rand() * 60;
          addPine(s, x, 2.3 + (-16.6 - x) * 0.309, -19 + rand() * 38, 6 + rand() * 4, rand);
        }
        for (let k = 0; k < 2; k++) {
          const x = -22 - rand() * 26;
          const y = 2.3 + (-16.6 - x) * 0.309;
          const hz = -14 + rand() * 28;
          s.box(6, 3.4, 5, x, y - 0.4, hz, [0xfff1dc, 0xcfe8ff, 0xffd9d0, 0xe2f5d8][Math.floor(rand() * 4)]);
          s.gable(6.6, 1.6, 5.6, x, y + 3.0, hz, [0xd9482e, 0x3b6ea8, 0x4a4f57][Math.floor(rand() * 3)], Math.PI / 2);
        }
        addLamp(s, gl, -12.75, 0.18, 5, 7);
        s.cyl(0.07, 0.1, 6.5, 2.2, 0.18, -10, 0x59616b, 6);
        gl.box(0.3, 0.14, 0.5, 2.0, 6.6, -10, 0xfff0c2);
        biomes.coast = this._biomeGroup(s, null, gl, mat);
      }
      // ── 교량 상판 ──
      {
        const s = new Batch();
        const gl = new Batch();
        s.box(0.45, 0.95, MOD, 2.4, 0, 0, 0xd4d9df);
        s.box(0.45, 0.95, MOD, -12.9, 0, 0, 0xd4d9df);
        s.box(16.2, 1.5, MOD, RC, -1.72, 0, 0xcfd6de);
        for (const lx of [2.4, -12.9]) {
          s.cyl(0.08, 0.11, 7, lx, 0.95, 0, 0x7f8790, 6);
          s.beam(lx, 7.9, 0, lx + (lx > 0 ? -1.6 : 1.6), 8.2, 0, 0.1, 0x7f8790);
          gl.box(0.6, 0.12, 0.3, lx + (lx > 0 ? -1.5 : 1.5), 8.05, 0, 0xfff0c2);
        }
        biomes.bridge = this._biomeGroup(s, null, gl, mat);
      }
      for (const key of Object.keys(biomes)) {
        biomes[key].visible = false;
        g.add(biomes[key]);
      }
      g.userData.biomes = biomes;
      return g;
    };

    const road = new Scroller({
      length: MOD, count: 12, behind: 60, make: makeModule,
      onWrap: (m) => this._setBiome(m, this._biomeAt(m.serial)),
    });
    env.add(road.group);

    // 현수교 세트 (주탑 2개 + 주케이블 + 행어)
    const bridge = new THREE.Group();
    {
      const bb = new Batch();
      const bg = new Batch();
      bb.setTransform(RC, SEA_Y - 0.3, 0, Math.PI / 2, 1);
      bg.setTransform(RC, SEA_Y - 0.3, 0, Math.PI / 2, 1);
      addSuspensionBridge(bb, bg, { length: BRIDGE_LEN, span: 200, towerH: 56, deckY: -SEA_Y, deckW: 18, lights: true, hangerStep: 10, lightSize: 0.5 });
      bridge.add(bb.build(mat.solid), bg.build(mat.glow));
    }
    bridge.visible = false;
    env.add(bridge);
    const bridgeSign = new THREE.Group();
    bridge.add(bridgeSign);

    // 마주 오는 차량
    const cars = [];
    const carColors = [0xf4f4f4, 0x2a2f3a, 0xb91c1c, 0x1d4ed8, 0xf59e0b, 0x9ca3af];
    for (let k = 0; k < 6; k++) {
      const cb = new Batch();
      cb.box(1.8, 0.75, 4.3, 0, 0.35, 0, carColors[k]);
      cb.box(1.6, 0.6, 2.2, 0, 1.1, 0.2, 0x1c2430);
      for (const wx of [-0.9, 0.9]) for (const wz of [-1.4, 1.4]) cb.cyl(0.33, 0.33, 0.22, wx, 0.33, wz, 0x111111, 10, 0, Math.PI / 2);
      const car = new THREE.Group();
      car.add(cb.build(mat.solid));
      const cg = new Batch();
      cg.box(0.3, 0.14, 0.05, -0.6, 0.7, 2.16, 0xfff6d0);
      cg.box(0.3, 0.14, 0.05, 0.6, 0.7, 2.16, 0xfff6d0);
      car.add(cg.build(mat.glow));
      car.position.set(k % 2 ? -7.1 : -10.6, 0, -40 - k * 70);
      env.add(car);
      cars.push({ car, speed: 10 + (k % 3) * 2 });
    }

    // 정류장 쉘터
    const stop = new THREE.Group();
    {
      const sb = new Batch();
      sb.box(1.7, 0.1, 4.4, 3.5, 2.55, 0, 0x3b82f6);
      sb.box(0.08, 2.55, 0.08, 4.2, 0.18, -2.0, 0x8d949c);
      sb.box(0.08, 2.55, 0.08, 4.2, 0.18, 2.0, 0x8d949c);
      sb.box(0.05, 1.5, 4.0, 4.25, 0.7, 0, 0xcfe6f2);
      sb.box(0.4, 0.08, 2.6, 3.9, 0.62, 0, 0x8a6a4a);
      sb.box(0.06, 0.45, 0.06, 3.9, 0.18, -1.1, 0x59616b);
      sb.box(0.06, 0.45, 0.06, 3.9, 0.18, 1.1, 0x59616b);
      sb.cyl(0.04, 0.04, 2.9, 2.5, 0.18, -3.2, 0x59616b, 6);
      sb.cyl(0.36, 0.36, 0.05, 2.5, 3.0, -3.2, 0x2563eb, 16, 0, Math.PI / 2);
      addPerson(sb, 3.4, 0.18, 0.9, 1.68, 0x8a3b4a);
      addPerson(sb, 3.7, 0.18, -0.6, 1.6, 0x3b4a6b);
      stop.add(sb.build(mat.solid));
    }
    const stopSign = new THREE.Group();
    stop.add(stopSign);
    env.add(stop);

    // 먼 배경 (정지): 산 능선 + 해안 스카이라인
    const far = new Batch();
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2 + 0.2;
      far.dome(210 + (k % 3) * 70, 70 + (k % 4) * 30, Math.cos(a) * 900 - 250, SEA_Y, Math.sin(a) * 900, [0x55805a, 0x4a7350, 0x638c62][k % 3]);
    }
    const farMesh = far.build(new THREE.MeshLambertMaterial({ vertexColors: true }));
    env.add(farMesh);
    const sky = new THREE.Group();
    env.add(sky);

    this.env = { group: env, road, bridge, bridgeSign, cars, stop, stopSign, mat, sky, skyName: null, sea: null, lights: null };
    this.group.add(env);
  }

  _biomeGroup(solid, bld, glow, mat) {
    const g = new THREE.Group();
    if (solid && !solid.empty) g.add(solid.build(mat.solid));
    if (bld && !bld.empty) g.add(bld.build(mat.bld));
    if (glow && !glow.empty) g.add(glow.build(mat.glow));
    return g;
  }

  _setBiome(m, name) {
    const biomes = m.obj.userData.biomes;
    for (const key of Object.keys(biomes)) biomes[key].visible = key === name;
  }

  /** 구간 내 모듈 순번(serial) → 풍경 종류. 교량 구간은 APPROACH ~ APPROACH+BRIDGE_LEN */
  _biomeAt(serial) {
    const leg = this.leg;
    if (!leg) return 'city';
    if (leg.bridge) {
      const zNear = 60 - serial * MOD; // 모듈 뒤쪽 끝(구간 시작 시점 기준)
      const zFar = zNear - MOD;
      if (zNear <= -APPROACH + 1 && zFar >= -APPROACH - BRIDGE_LEN - 1) return 'bridge';
    }
    return leg.biome || 'city';
  }

  _setSky(name) {
    const e = this.env;
    if (e.skyName === name) return;
    e.skyName = name;
    for (const child of [...e.sky.children]) {
      e.sky.remove(child);
      disposeTree(child);
    }
    const p = skyPreset(name);
    this.skyDome = makeSky(name, 1500);
    e.sky.add(this.skyDome);
    this.starField = null;
    if (p.stars) {
      this.starField = makeStars();
      e.sky.add(this.starField);
    }
    this.seaMesh = makeSea(name, { y: SEA_Y, size: 3600, segments: 90, amp: 0.5 });
    e.sky.add(this.seaMesh);
    e.sky.add(makeLights(name));
    e.sky.add(new THREE.HemisphereLight(0xffffff, 0x8890a0, p.night ? 0.9 : 0.25)); // 실내 보조광
    e.mat.bld.emissiveIntensity = p.night ? 0.95 : 0;
    e.mat.glow.color.setHex(p.night ? 0xffffff : 0x8a8a8a);
    this.fog.color.setHex(p.fog);
    this.night = p.night;
  }

  // ───────────────────────── 차량 내부 ─────────────────────────
  _makeBell(parent, x, y, z, bellMat, faceX = -1) {
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.11, 0.065), new THREE.MeshLambertMaterial({ color: 0xf2c230 }));
    housing.position.set(x, y, z);
    const btnGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.024, 18);
    btnGeo.rotateZ(Math.PI / 2);
    const btn = new THREE.Mesh(btnGeo, bellMat);
    btn.position.set(x + faceX * 0.045, y, z);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.005, 6, 18), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    ring.rotation.y = Math.PI / 2;
    ring.position.set(x + faceX * 0.04, y, z);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(x + faceX * 0.03, y, z);
    parent.add(housing, btn, ring, hit);
    this.ix.add(hit, {
      onClick: () => this.pressBell(),
      onHover: (over) => btn.scale.setScalar(over ? 1.35 : 1),
    });
  }

  _stopLamp(parent, x, y, z, w) {
    const off = makeSign('STOP 하차', w, { w: 512, h: 128, size: 70, bg: '#1c0b0b', fg: '#4a2020', radius: 18 });
    const on = makeSign('STOP 하차', w, { w: 512, h: 128, size: 70, bg: '#ff2a2a', fg: '#ffffff', radius: 18, glow: '#ffffff' });
    off.position.set(x, y, z);
    on.position.set(x, y, z);
    on.visible = false;
    parent.add(off, on);
    return { off, on };
  }

  _buildCity() {
    const g = new THREE.Group();
    const b = new Batch();
    const glow = new Batch();
    const glass = new Batch();
    const HWb = 1.22;
    const HLb = 5.5;
    const HTb = 2.15;
    const wall = 0xe1e5e9;
    const yellow = 0xf2c230;
    b.box(HWb * 2, 0.08, HLb * 2, 0, -0.08, 0, 0x565b62);
    b.box(HWb * 2 + 0.1, 0.72, HLb * 2 + 0.1, 0, -0.82, 0, 0x23262b);
    b.box(HWb * 2, 0.06, HLb * 2, 0, HTb, 0, 0xeef1f4);
    for (let z = -4; z <= 4; z += 2) glow.box(0.2, 0.02, 1.2, 0, HTb - 0.02, z, 0xfafcff);
    // 왼쪽 벽
    b.box(0.06, 0.85, HLb * 2, -HWb, 0, 0, wall);
    b.box(0.06, 0.35, HLb * 2, -HWb, 1.8, 0, wall);
    glass.box(0.02, 0.95, HLb * 2 - 0.2, -HWb, 0.85, 0, 0xffffff);
    for (let z = -5.4; z <= 5.5; z += 1.55) b.box(0.07, 0.95, 0.09, -HWb, 0.85, z, 0x3a3f46);
    // 오른쪽 벽 (앞문·뒷문 개구부 제외)
    b.box(0.06, 0.35, HLb * 2, HWb, 1.8, 0, wall);
    for (const [z0, z1] of [[-5.5, -5.2], [-4.1, -0.6], [0.7, 5.5]]) {
      b.box(0.06, 0.85, z1 - z0, HWb, 0, (z0 + z1) / 2, wall);
      glass.box(0.02, 0.95, z1 - z0 - 0.1, HWb, 0.85, (z0 + z1) / 2, 0xffffff);
      b.box(0.07, 0.95, 0.09, HWb, 0.85, z0 + 0.05, 0x3a3f46);
      b.box(0.07, 0.95, 0.09, HWb, 0.85, z1 - 0.05, 0x3a3f46);
    }
    glass.box(0.02, 1.8, 1.05, HWb, 0, -4.65, 0xffffff); // 앞문(닫힘)
    // 앞유리·운전석
    glass.box(HWb * 2 - 0.1, 1.15, 0.02, 0, 0.9, -HLb, 0xffffff);
    b.box(HWb * 2, 0.9, 0.5, 0, 0, -HLb + 0.25, 0x2c3036);
    b.box(HWb * 2, 0.22, 0.1, 0, 2.0, -HLb + 0.05, 0x2c3036);
    b.box(0.5, 0.45, 0.5, -0.7, 0, -4.55, 0x2c3036);
    b.box(0.5, 0.1, 0.5, -0.7, 0.45, -4.55, 0x1d4ed8);
    b.box(0.5, 0.7, 0.1, -0.7, 0.55, -4.28, 0x1d4ed8);
    addPerson(b, -0.7, 0.3, -4.55, 1.35, 0x1f3a6b);
    b.add(new THREE.TorusGeometry(0.2, 0.025, 6, 18), 0x15171a, -0.7, 1.05, -4.95, -0.9);
    b.box(0.9, 1.25, 0.04, -0.72, 0, -4.12, 0xbfc7cf);
    b.box(0.3, 1.0, 0.3, 0.25, 0, -4.75, 0x6b7280); // 요금함
    b.box(0.22, 0.14, 0.06, 0.25, 1.05, -4.72, 0x10b981);
    // 뒷벽
    b.box(HWb * 2, 0.95, 0.08, 0, 0, HLb, wall);
    b.box(HWb * 2, 0.35, 0.08, 0, 1.8, HLb, wall);
    glass.box(HWb * 2 - 0.2, 0.85, 0.02, 0, 0.95, HLb, 0xffffff);
    // 좌석 (앞을 보고 앉음)
    const seat = (x, z, color = 0x2f6fd0) => {
      b.box(0.44, 0.42, 0.42, x, 0, z, 0x3a3f46);
      b.box(0.46, 0.08, 0.46, x, 0.42, z, color);
      b.box(0.46, 0.58, 0.08, x, 0.5, z + 0.24, color);
      b.box(0.4, 0.035, 0.035, x, 1.1, z + 0.24, yellow);
    };
    for (const z of [-3.3, -2.4, -1.5, -0.6, 0.3, 1.2, 2.1, 3.0]) seat(-0.9, z, z > 2.5 ? 0xf2a0b8 : 0x2f6fd0);
    for (const z of [-3.3, -2.4, -1.5]) seat(0.9, z);
    for (const z of [1.5, 2.4, 3.3]) {
      seat(0.94, z);
      seat(0.47, z);
    }
    for (const x of [-0.94, -0.47, 0, 0.47, 0.94]) seat(x, 4.6, 0x2f6fd0);
    const riders = [[-0.9, -2.4], [0.9, -1.5], [-0.9, 1.2], [0.47, 2.4], [0, 4.6], [-0.94, 4.6]];
    riders.forEach(([x, z], k) => addPerson(b, x, 0.2, z - 0.02, 1.3, [0x8a3b4a, 0x3b6b5a, 0x6b5a3b, 0x4a4a8a, 0x555c66, 0x9a5a2a][k]));
    // 손잡이 봉·기둥
    const poles = [[0.56, -3.9], [-0.56, -1.95], [0.56, 0.0], [-0.56, 1.7], [0.56, 0.75], [0.56, -0.65]];
    for (const [x, z] of poles) b.cyl(0.018, 0.018, HTb, x, 0, z, yellow, 8);
    for (const x of [-0.5, 0.5]) {
      b.beam(x, 1.95, -3.9, x, 1.95, 4.2, 0.026, yellow);
      for (let z = -3.4; z <= 4; z += 0.62) {
        b.box(0.026, 0.19, 0.008, x, 1.75, z, 0x8d949c);
        b.add(new THREE.TorusGeometry(0.055, 0.011, 6, 14), 0xf4f4f0, x, 1.7, z, 0, Math.PI / 2);
      }
    }
    b.box(0.05, 0.02, 1.3, HWb - 0.2, 0.001, 0.05, yellow);
    g.add(b.build(solidMaterial()), glow.build(glowMaterial()));
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x9fc8dc, transparent: true, opacity: 0.14, depthWrite: false, fog: false });
    g.add(glass.build(glassMat));

    // 하차문 (뒷문, 슬라이딩)
    const doors = [];
    const leafGeo = new THREE.BoxGeometry(0.035, 1.8, 0.65);
    leafGeo.translate(0, 0.9, 0);
    const leafMat = new THREE.MeshBasicMaterial({ color: 0xbfe0f0, transparent: true, opacity: 0.32, depthWrite: false, fog: false });
    for (const side of [-1, 1]) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(HWb, 0, 0.05 + side * 0.325);
      g.add(leaf);
      doors.push({ leaf, baseZ: 0.05 + side * 0.325, side });
    }

    // 하차벨
    const bellMat = new THREE.MeshBasicMaterial({ color: 0x8f1d1d, toneMapped: false });
    this._makeBell(g, 0.56, 1.28, 0.0, bellMat, -1);
    this._makeBell(g, -0.56, 1.28, -1.95, bellMat, 1);
    this._makeBell(g, 0.56, 1.28, -3.9, bellMat, -1);
    this._makeBell(g, -0.56, 1.28, 1.7, bellMat, 1);
    this._makeBell(g, 0.56, 1.28, 0.75, bellMat, -1);

    // 전광판·STOP 표시등
    const led = new LedDisplay(1024, 176);
    const ledMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.29), led.material);
    ledMesh.position.set(0, 1.93, -HLb + 0.13);
    g.add(ledMesh);
    const lamp = this._stopLamp(g, 0.75, 1.62, -HLb + 0.14, 0.62);

    const floorGeo = new THREE.PlaneGeometry(0.9, 8.2);
    floorGeo.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ visible: false }));
    floor.position.set(0, 0.002, 0);
    g.add(floor);

    const panel = new UIPanel({ width: 0.62, onAction: (id) => this._panelAction(id) });
    panel.mesh.position.set(-0.3, 1.5, -1.2);
    panel.mesh.rotation.y = 0.35;
    g.add(panel.mesh);
    this.ix.addPanel(panel);

    return { group: g, doors, bellMat, led, lamp, floor, panel, envY: -0.9, spawn: { x: 0.05, z: 0.95, yaw: 0 }, open: 0 };
  }

  _buildOpenTop() {
    const g = new THREE.Group();
    const b = new Batch();
    const glow = new Batch();
    const HWd = 1.25;
    const HLd = 5.25;
    const yellow = 0xf2c230;
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xc62828 });
    const body = new Batch();
    // 2층 바닥 + 아래 차체 (난간 너머로 내려다보면 버스 몸체가 보인다)
    b.box(HWd * 2, 0.08, HLd * 2, 0, -0.08, 0, 0x6a6f76);
    for (let z = -4.8; z <= 4.8; z += 0.6) b.box(0.5, 0.004, 0.04, 0, 0.001, z, 0x8a9098);
    body.box(HWd * 2 + 0.16, 3.2, HLd * 2 + 0.3, 0, -3.3, 0, 0xffffff);
    for (const s of [-1, 1]) {
      body.box(0.08, 0.95, HLd * 2, s * HWd, 0, 0, 0xffffff);
      for (let z = -5; z <= 5; z += 1.25) b.box(0.05, 0.2, 0.05, s * HWd, 0.95, z, 0xd0d4d8);
      b.beam(s * HWd, 1.15, -HLd, s * HWd, 1.15, HLd, 0.05, 0xd0d4d8);
      b.box(0.1, 0.03, HLd * 2, s * (HWd - 0.02), 0.95, 0, 0xfff3d0);
    }
    body.box(HWd * 2, 0.95, 0.08, 0, 0, -HLd, 0xffffff);
    body.box(HWd * 2, 0.95, 0.08, 0, 0, HLd, 0xffffff);
    body.box(1.25, 1.35, 1.5, -0.6, 0, 4.45, 0xffffff); // 계단실
    b.box(1.3, 0.05, 1.55, -0.6, 1.35, 4.45, 0x3a3f46);
    // 앞 유리 방풍창 + 프레임(전광판)
    for (const s of [-1, 1]) b.box(0.07, 1.95, 0.07, s * 1.12, 0, -HLd + 0.12, 0x3a3f46);
    b.box(2.32, 0.07, 0.07, 0, 1.95, -HLd + 0.12, 0x3a3f46);
    // 좌석 2+2
    const seat = (x, z) => {
      b.box(0.44, 0.4, 0.42, x, 0, z, 0x3a3f46);
      b.box(0.46, 0.08, 0.46, x, 0.4, z, 0x2a2f3a);
      b.box(0.46, 0.55, 0.08, x, 0.48, z + 0.24, 0x2a2f3a);
      b.box(0.46, 0.14, 0.09, x, 1.03, z + 0.24, 0xc62828);
    };
    const rows = [-4.3, -3.4, -2.5, -1.6, -0.7, 1.9, 2.8];
    for (const z of rows) for (const x of [-0.99, -0.52, 0.52, 0.99]) seat(x, z);
    for (const x of [0.52, 0.99]) seat(x, 3.7);
    const riders = [[-0.99, -3.4], [0.52, -3.4], [0.99, -1.6], [-0.52, -2.5], [0.99, 1.9], [-0.99, 2.8], [0.52, 3.7], [-0.52, -4.3]];
    riders.forEach(([x, z], k) => addPerson(b, x, 0.18, z - 0.02, 1.3, [0x8a3b4a, 0x3b6b5a, 0xd9a03b, 0x4a4a8a, 0x2f8fd0, 0x9a5a2a, 0xd94a7a, 0x5a8a3b][k]));
    // 하차벨 기둥
    const poles = [[0.27, 0.05], [-0.27, -1.6], [0.27, -3.4], [-0.27, 1.9]];
    for (const [x, z] of poles) b.cyl(0.02, 0.02, 1.5, x, 0, z, yellow, 8);
    g.add(b.build(solidMaterial()), body.build(bodyMat));
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xbfe0f0, transparent: true, opacity: 0.2, depthWrite: false, fog: false });
    const wind = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.75, 0.02), glassMat);
    wind.position.set(0, 0.95 + 0.375, -HLd + 0.04);
    g.add(wind);
    glow.box(0.3, 0.04, 0.04, 0, 1.99, -HLd + 0.12, 0xfff0c2);
    g.add(glow.build(glowMaterial()));

    const bellMat = new THREE.MeshBasicMaterial({ color: 0x8f1d1d, toneMapped: false });
    this._makeBell(g, 0.27, 1.25, 0.05, bellMat, -1);
    this._makeBell(g, -0.27, 1.25, -1.6, bellMat, 1);
    this._makeBell(g, 0.27, 1.25, -3.4, bellMat, -1);
    this._makeBell(g, -0.27, 1.25, 1.9, bellMat, 1);

    const led = new LedDisplay(1024, 176);
    const ledMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.3), led.material);
    ledMesh.position.set(-0.15, 1.72, -HLd + 0.18);
    const ledBack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.05), new THREE.MeshLambertMaterial({ color: 0x20242a }));
    ledBack.position.set(-0.15, 1.72, -HLd + 0.14);
    g.add(ledMesh, ledBack);
    const lamp = this._stopLamp(g, 0.92, 1.72, -HLd + 0.18, 0.44);

    const floorGeo = new THREE.PlaneGeometry(0.5, 9.2);
    floorGeo.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ visible: false }));
    floor.position.set(0, 0.002, -0.3);
    g.add(floor);

    const panel = new UIPanel({ width: 0.62, onAction: (id) => this._panelAction(id) });
    panel.mesh.position.set(-0.62, 1.42, -0.55);
    panel.mesh.rotation.y = 0.55;
    g.add(panel.mesh);
    this.ix.addPanel(panel);

    return { group: g, doors: [], bellMat, bodyMat, led, lamp, floor, panel, envY: -3.4, spawn: { x: 0, z: 0.95, yaw: 0 }, open: 1 };
  }

  _panelAction(id) {
    if (id === 'bell') this.pressBell();
    else if (id === 'skip') this.skip();
  }

  // ───────────────────────── 탑승 진행 ─────────────────────────
  /**
   * @param {ReturnType<import('./busanData.js').planBusTrip>} plan
   * @param {{onArrive:(spotId:string)=>void}} o
   */
  startRide(plan, o) {
    if (!this.env) this._buildEnv();
    const type = plan.route.type === 'citytour' ? 'opentop' : 'city';
    if (!this.variants[type]) {
      this.variants[type] = type === 'opentop' ? this._buildOpenTop() : this._buildCity();
      this.group.add(this.variants[type].group);
    }
    for (const key of Object.keys(this.variants)) this.variants[key].group.visible = key === type;
    const car = this.variants[type];
    this.car = car;
    if (car.bodyMat) car.bodyMat.color.set(plan.route.color);
    this.plan = plan;
    this.onArrive = o.onArrive;
    this.route = plan.route;
    this.legIndex = 0;
    this.active = true;
    this.t = 0;
    this.v = 0;
    this.vmax = type === 'opentop' ? 14.5 : 13;
    this.spawn = car.spawn;
    this.teleportSurfaces = [car.floor];
    this.env.group.position.y = car.envY;
    const dest = spotById(plan.stops[plan.stops.length - 1]);
    this._setSky(dest.sky === 'dusk' ? 'sunset' : dest.sky);
    this._setBell(false);
    this._setDoor(1);
    this._startLeg(true);
    this.phase = 'board';
    this.pt = 0;
    this.audio.setLoop('bus', 0.8);
    this.audio.setParam('bus', 0, car.open);
    this.audio.hiss(0.5, 0.1);
  }

  get _nextStop() {
    return spotById(this.plan.stops[this.legIndex + 1]);
  }

  get _isFinalLeg() {
    return this.legIndex >= this.plan.stops.length - 2;
  }

  /** 구간 시작: 풍경 배치(도심/해안/교량) + 다음 정류장 쉘터 배치 */
  _startLeg(first) {
    const e = this.env;
    this.leg = this.plan.legs[this.legIndex] || { biome: 'city' };
    this.flags = {};
    this.legDist = this.leg.bridge ? APPROACH + BRIDGE_LEN + 110 : 250;
    this.remaining = this.legDist;
    this.traveled = 0;
    e.road.reset();
    for (const m of e.road.modules) this._setBiome(m, this._biomeAt(m.serial));
    e.bridge.visible = !!this.leg.bridge;
    if (this.leg.bridge) {
      e.bridge.position.z = -APPROACH - BRIDGE_LEN / 2;
      for (const child of [...e.bridgeSign.children]) {
        e.bridgeSign.remove(child);
        disposeTree(child);
      }
      const sign = makeSign(this.leg.bridge, 9, { w: 1024, h: 224, size: 140, bg: '#0f5132', fg: '#ffffff', border: '#ffffff', borderW: 10, radius: 24 });
      sign.position.set(RC, 8.4, BRIDGE_LEN / 2 - 6);
      const gb = new Batch();
      gb.box(0.4, 9.6, 0.4, 2.9, 0, BRIDGE_LEN / 2 - 6.3, 0x7f8790);
      gb.box(0.4, 9.6, 0.4, -13.4, 0, BRIDGE_LEN / 2 - 6.3, 0x7f8790);
      gb.box(16.7, 0.5, 0.4, RC, 9.6, BRIDGE_LEN / 2 - 6.3, 0x7f8790);
      e.bridgeSign.add(sign, gb.build(solidMaterial()));
    }
    // 정류장 쉘터 (현재 구간의 도착 정류장). 첫 구간은 출발 정류장에서 시작.
    this._placeStop(first ? spotById(this.plan.stops[0]) : this._nextStop, first ? 0 : -this.remaining);
    this.stopIsOrigin = first;
    const next = this._nextStop;
    const dest = spotById(this.plan.stops[this.plan.stops.length - 1]);
    this._led(`다음 정류장  ${next.busStop}`, `${this.route.short} · ${dest.busStop} 방면`);
    const left = this.plan.stops.length - 1 - this.legIndex;
    this.car.panel.set({
      badge: this.route.type === 'citytour' ? '🚌 2층 시티투어버스' : '🚌 시내버스',
      accent: this.route.color,
      title: this.route.name,
      body: `다음 정류장: ${next.busStop}\n목적지: ${dest.name} (${left}정거장)`,
      footer: '기둥의 빨간 하차벨을 눌러도 됩니다.',
      buttons: [
        { id: 'bell', label: '🔔 하차벨 누르기', color: '#dc2626' },
        { id: 'skip', label: '⏭ 건너뛰기', color: '#334155' },
      ],
    });
    this.car.panel.show();
  }

  _placeStop(spot, z) {
    const e = this.env;
    for (const child of [...e.stopSign.children]) {
      e.stopSign.remove(child);
      disposeTree(child);
    }
    const sign = makeSign(spot.busStop, 3.6, { w: 768, h: 192, size: 92, bg: '#1e3a8a', fg: '#ffffff', border: '#ffffff', borderW: 8, radius: 22, sub: `${this.route.short} 정류장`, subColor: '#bfdbfe', subSize: 34, doubleSide: true });
    sign.position.set(4.18, 1.75, 0);
    sign.rotation.y = -Math.PI / 2;
    e.stopSign.add(sign);
    e.stop.position.z = z - 0.4;
    e.stop.visible = true;
  }

  _led(line1, line2, extra = {}) {
    this.car.led.draw({ badge: this.route.short, badgeColor: this.route.color, line1, line2, ...extra });
    this.onStatus?.(line2 ? `${line1} · ${line2}` : line1);
  }

  _setBell(on) {
    this.bell = on;
    this.car.bellMat.color.setHex(on ? 0xff3b30 : 0x8f1d1d);
    this.car.lamp.on.visible = on;
    this.car.lamp.off.visible = !on;
  }

  _setDoor(open) {
    const k = ease(open);
    for (const d of this.car.doors) d.leaf.position.z = d.baseZ + d.side * 0.6 * k;
  }

  /** 하차벨: 부저 + 불빛 + 안내방송 → 다음 정류장에 정차 */
  pressBell(auto = false) {
    if (!this.active || this.phase === 'stop' || this.phase === 'done') return;
    if (this.bell) {
      this.audio.click();
      return;
    }
    this._setBell(true);
    this.audio.buzzer();
    const stop = this._nextStop;
    this._led(`STOP  ${stop.busStop}`, auto ? '종점입니다 · 모두 하차해 주세요' : '이번 정류장에 정차합니다', { alert: true, color2: '#ffe27a' });
    const after = this.plan.stops[this.legIndex + 2];
    const tail = auto || !after ? '내리실 분은 안전하게 하차하시기 바랍니다.' : `다음 정류장은 ${spotById(after).busStop}입니다.`;
    setTimeout(() => {
      if (this.active && this.bell) {
        this.audio.busChime();
        this.audio.speak(`이번 정류장은 ${stop.busStop}, ${stop.busStop}입니다. ${tail}`);
      }
    }, 850);
  }

  skip() {
    if (!this.active || this.phase === 'done') return;
    this.audio.click();
    this._arrive(this.plan.stops[this.plan.stops.length - 1]);
  }

  _arrive(spotId) {
    if (this.phase === 'done') return;
    this.phase = 'done';
    this.audio.cancelSpeech();
    this.audio.setLoop('bus', 0);
    const cb = this.onArrive;
    this.onArrive = null;
    cb?.(spotId);
  }

  stop() {
    this.active = false;
    this.phase = 'done';
    this.car?.panel.hide();
    this.audio.setLoop('bus', 0);
  }

  update(dt, cameraWorldPos) {
    if (!this.active || !this.env) return;
    const e = this.env;
    this.t += dt;
    this.pt += dt;
    const once = (key, cond, fn) => {
      if (cond && !this.flags[key]) {
        this.flags[key] = true;
        fn();
      }
    };
    const stopping = this.bell;
    const brakeDist = (this.v * this.v) / (2 * DEC) + 1.5;

    if (this.phase === 'board') {
      once('welcome', this.pt > 0.7, () => {
        this.audio.busChime();
        this.audio.speak(`${this.route.name}입니다. 다음 정류장은 ${this._nextStop.busStop}입니다.`);
      });
      this._setDoor(1 - THREE.MathUtils.clamp((this.pt - 1.6) / 1.0, 0, 1));
      once('door', this.pt > 2.6, () => this.audio.thunk());
      if (this.pt > 3.0) {
        this.phase = 'drive';
        this.pt = 0;
      }
    } else if (this.phase === 'drive') {
      this.v = Math.min(this.vmax, this.v + ACC * dt);
      if (this.leg.bridge) {
        once('bridge', this.traveled > APPROACH - 20, () => {
          this._led(`${this.leg.bridge} 통과 중`, `다음 정류장  ${this._nextStop.busStop}`, { color: '#7fd6ff' });
          if (!this.bell) this.audio.speak(`지금 ${this.leg.bridge}를 건너고 있습니다. 고개를 들어 주탑을 올려다보세요.`);
        });
      }
      if (this._isFinalLeg && !this.bell) {
        once('remind', this.remaining < 150, () => {
          this._led('하차벨을 눌러 주세요!', `이번 정류장  ${this._nextStop.busStop}`, { alert: true, color2: '#ffe27a' });
          this.audio.busChime();
        });
        if (this.remaining < 150) this.car.bellMat.color.setHex(Math.sin(this.t * 9) > 0 ? 0xff6b60 : 0x8f1d1d);
        once('auto', this.remaining < 70, () => this.pressBell(true));
      }
      if (stopping && this.remaining <= brakeDist) {
        this.phase = 'brake';
        this.pt = 0;
      } else if (!stopping && this.remaining <= -6 && !this._isFinalLeg && !this.flags.passing) {
        // 하차벨이 없으면 정류장을 통과하고 다음 구간으로 (짧은 암전 중에 풍경 재배치)
        this.flags.passing = true;
        this.blink(() => {
          if (!this.active || this.phase === 'done') return;
          this.legIndex++;
          this._startLeg(false);
          this.audio.busChime();
          this.audio.speak(`다음 정류장은 ${this._nextStop.busStop}입니다.`);
        });
      }
    } else if (this.phase === 'brake') {
      this.v = Math.max(0, this.v - DEC * dt);
      if (this.v <= 0.02 || this.remaining <= 0) {
        this.v = 0;
        this.phase = 'stop';
        this.pt = 0;
        this.audio.hiss(0.9, 0.2);
      }
    } else if (this.phase === 'stop') {
      this._setDoor(THREE.MathUtils.clamp((this.pt - 0.4) / 1.0, 0, 1));
      once('arrive-led', true, () => this._led(this._nextStop.busStop, `${this._nextStop.name} 하차`, { color2: '#7dff9a' }));
      if (this.pt > 2.6) this._arrive(this.plan.stops[this.legIndex + 1]);
    }

    // 풍경 이동
    const d = this.v * dt;
    if (d > 0) {
      this.remaining -= d;
      this.traveled += d;
      e.road.advance(d);
      if (e.bridge.visible) {
        e.bridge.position.z += d;
        if (e.bridge.position.z > BRIDGE_LEN / 2 + 80) e.bridge.visible = false;
      }
      if (e.stop.visible) {
        e.stop.position.z += d;
        if (e.stop.position.z > 80) {
          if (this.stopIsOrigin) {
            this.stopIsOrigin = false;
            this._placeStop(this._nextStop, -this.remaining);
          } else {
            e.stop.visible = false;
          }
        }
      }
    }
    for (const c of e.cars) {
      c.car.position.z += (this.v + c.speed) * dt;
      if (c.car.position.z > 80) c.car.position.z = -360 - Math.random() * 90;
    }
    this.skyDome.position.set(cameraWorldPos.x, cameraWorldPos.y - e.group.position.y, cameraWorldPos.z);
    if (this.starField) this.starField.position.copy(this.skyDome.position);
    this.seaMesh.userData.tick(this.t);
    this.audio.setParam('bus', this.v / this.vmax, this.car.open);
  }
}
