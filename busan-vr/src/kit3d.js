// 절차적 3D 제작 도구 모음 (외부 이미지 없이 지오메트리·캔버스 텍스처·셰이더만 사용)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const FONT = '"Noto Sans KR","Noto Sans CJK KR","Apple SD Gothic Neo","Malgun Gothic","NanumGothic",system-ui,sans-serif';

/** 시드 고정 난수 (장면이 매번 같은 모양으로 생성되도록) */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

/**
 * 여러 도형을 정점 색상과 함께 하나의 메시로 합치는 배처.
 * 드로우콜을 장면당 몇 개로 줄여 Quest에서도 72~90fps를 유지한다.
 * box/cyl/cone 의 (x,y,z)는 "밑면 중심" 기준이다.
 */
export class Batch {
  constructor() {
    this.parts = [];
    this.parent = null;
  }

  /** 이후 추가되는 도형에 공통 변환 적용 (구조물 통째로 배치/회전/확대) */
  setTransform(x = 0, y = 0, z = 0, ry = 0, s = 1) {
    this.parent = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)),
      new THREE.Vector3(s, s, s),
    );
    return this;
  }

  resetTransform() {
    this.parent = null;
    return this;
  }

  add(geo, color, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz, 'YXZ')), _s.set(sx, sy, sz));
    if (this.parent) _m.premultiply(this.parent);
    g.applyMatrix4(_m);
    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3);
    _c.set(color);
    for (let i = 0; i < n; i++) {
      col[i * 3] = _c.r;
      col[i * 3 + 1] = _c.g;
      col[i * 3 + 2] = _c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
    if (!g.attributes.normal) g.computeVertexNormals();
    for (const k of Object.keys(g.attributes)) {
      if (k !== 'position' && k !== 'normal' && k !== 'uv' && k !== 'color') g.deleteAttribute(k);
    }
    this.parts.push(g);
    return this;
  }

  box(w, h, d, x, y, z, color, ry = 0, rx = 0, rz = 0) {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    return this.add(g, color, x, y, z, rx, ry, rz);
  }

  /** 건물용 박스: 창문 텍스처가 층/칸 수에 맞게 반복되도록 UV 설정 */
  building(w, h, d, x, y, z, color, ry = 0) {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    const uv = g.attributes.uv;
    const repV = Math.max(1, Math.round(h / 3.4)) / 4;
    for (let i = 0; i < uv.count; i++) {
      const face = Math.floor(i / 4);
      if (face === 2 || face === 3) {
        uv.setXY(i, 0, 0);
      } else {
        const width = face < 2 ? d : w;
        const repU = Math.max(1, Math.round(width / 3.6)) / 4;
        uv.setXY(i, uv.getX(i) * repU, uv.getY(i) * repV);
      }
    }
    return this.add(g, color, x, y, z, 0, ry, 0);
  }

  cyl(rTop, rBot, h, x, y, z, color, seg = 10, rx = 0, rz = 0, ry = 0) {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg, 1);
    g.translate(0, h / 2, 0);
    return this.add(g, color, x, y, z, rx, ry, rz);
  }

  cone(r, h, x, y, z, color, seg = 8) {
    return this.cyl(0, r, h, x, y, z, color, seg);
  }

  sphere(r, x, y, z, color, sx = 1, sy = 1, sz = 1, ws = 12, hs = 8) {
    return this.add(new THREE.SphereGeometry(r, ws, hs), color, x, y, z, 0, 0, 0, sx, sy, sz);
  }

  /** 위쪽 반구(언덕·돔) */
  dome(r, h, x, y, z, color, sz = 1, seg = 16) {
    const g = new THREE.SphereGeometry(1, seg, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    return this.add(g, color, x, y, z, 0, 0, 0, r, h, r * sz);
  }

  /** 각진 바위 */
  rock(r, x, y, z, color, sx = 1, sy = 1, sz = 1, ry = 0, detail = 1) {
    const g = new THREE.IcosahedronGeometry(r, detail);
    g.deleteAttribute('normal');
    return this.add(g, color, x, y, z, 0, ry, 0, sx, sy, sz);
  }

  /** 4면 지붕(모임지붕/사다리꼴). top=윗면 비율(0이면 뾰족) */
  hip(w, h, d, x, y, z, color, top = 0.0, ry = 0) {
    const g = new THREE.CylinderGeometry(Math.SQRT1_2 * Math.max(top, 0.0001), Math.SQRT1_2, h, 4, 1);
    g.rotateY(Math.PI / 4);
    g.translate(0, h / 2, 0);
    g.deleteAttribute('normal');
    return this.add(g, color, x, y, z, 0, ry, 0, w, 1, d);
  }

  /** 박공지붕(삼각기둥). 용마루가 z축 방향 */
  gable(w, h, d, x, y, z, color, ry = 0) {
    const hw = w / 2;
    const hd = d / 2;
    const v = [
      // 왼쪽 경사
      -hw, 0, hd, 0, h, hd, 0, h, -hd, -hw, 0, hd, 0, h, -hd, -hw, 0, -hd,
      // 오른쪽 경사
      hw, 0, hd, hw, 0, -hd, 0, h, -hd, hw, 0, hd, 0, h, -hd, 0, h, hd,
      // 앞 박공
      -hw, 0, hd, hw, 0, hd, 0, h, hd,
      // 뒤 박공
      hw, 0, -hd, -hw, 0, -hd, 0, h, -hd,
      // 바닥
      -hw, 0, -hd, hw, 0, -hd, hw, 0, hd, -hw, 0, -hd, hw, 0, hd, -hw, 0, hd,
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    return this.add(g, color, x, y, z, 0, ry, 0);
  }

  /** 두 점을 잇는 가는 막대 (케이블·난간·기둥) */
  beam(x1, y1, z1, x2, y2, z2, t, color) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-6) return this;
    const g = new THREE.BoxGeometry(t, len, t);
    _q.setFromUnitVectors(_p.set(0, 1, 0), _s.set(dx / len, dy / len, dz / len));
    g.applyQuaternion(_q);
    return this.add(g, color, (x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
  }

  get empty() {
    return this.parts.length === 0;
  }

  build(material) {
    if (!this.parts.length) return new THREE.Group();
    const geo = mergeGeometries(this.parts, false);
    this.parts.length = 0;
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, material);
    mesh.matrixAutoUpdate = false;
    return mesh;
  }
}

// ───────────────────────── 재질 ─────────────────────────
export const solidMaterial = (opts = {}) => new THREE.MeshLambertMaterial({ vertexColors: true, ...opts });
export const glowMaterial = (opts = {}) => new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, fog: false, ...opts });

let _facade = null;
/** 건물 외벽 창문 텍스처 (4x4칸 반복). 야간용 발광맵 포함. */
export function facadeTextures() {
  if (_facade) return _facade;
  const rand = mulberry32(77);
  const make = (draw) => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const ctx = cv.getContext('2d');
    draw(ctx);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.userData.shared = true;
    return tex;
  };
  const lit = [];
  for (let i = 0; i < 16; i++) lit.push(rand());
  const map = make((ctx) => {
    ctx.fillStyle = '#e9e6df';
    ctx.fillRect(0, 0, 256, 256);
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 4; i++) {
        const g = ctx.createLinearGradient(0, j * 64 + 14, 0, j * 64 + 52);
        g.addColorStop(0, '#5f7f9f');
        g.addColorStop(1, '#2f4257');
        ctx.fillStyle = g;
        ctx.fillRect(i * 64 + 10, j * 64 + 14, 44, 38);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(i * 64 + 10, j * 64 + 14, 44, 5);
      }
    }
  });
  const emissive = make((ctx) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 256, 256);
    const warm = ['#ffd98a', '#fff1c4', '#ffc46b', '#d9ecff'];
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 4; i++) {
        const r = lit[j * 4 + i];
        if (r < 0.38) continue;
        ctx.fillStyle = warm[Math.floor(r * 97) % warm.length];
        ctx.globalAlpha = 0.55 + r * 0.45;
        ctx.fillRect(i * 64 + 10, j * 64 + 14, 44, 38);
      }
    }
    ctx.globalAlpha = 1;
  });
  _facade = { map, emissive };
  return _facade;
}

export function facadeMaterial(night = false) {
  const { map, emissive } = facadeTextures();
  return new THREE.MeshLambertMaterial({
    vertexColors: true,
    map,
    emissive: night ? 0xffffff : 0x000000,
    emissiveMap: night ? emissive : null,
    emissiveIntensity: night ? 0.95 : 0,
  });
}

// ───────────────────────── 하늘 · 조명 프리셋 ─────────────────────────
const v3 = (x, y, z) => new THREE.Vector3(x, y, z).normalize();
export const SKY_PRESETS = {
  day: {
    top: 0x2f7fe0, horizon: 0xc4e4fb, bottom: 0x9cc3de, sunDir: v3(0.45, 0.72, 0.35), sunColor: 0xfff3d0, sunSize: 2.6, glow: 0.55,
    fog: 0xc4e0f2, hemi: [0xdcefff, 0x8a8f7a, 1.25], dir: [0xfff2dc, 2.3],
    seaDeep: 0x0f5f93, seaShallow: 0x2fa3b8, clouds: 0xffffff, stars: false, night: false,
  },
  sunset: {
    top: 0x3b4f9c, horizon: 0xff9a55, bottom: 0xc76a4a, sunDir: v3(0.0, 0.07, -1.0), sunColor: 0xffc27a, sunSize: 4.2, glow: 1.0,
    fog: 0xf0a078, hemi: [0xffd2b0, 0x7a6a72, 1.45], dir: [0xffb074, 1.9],
    seaDeep: 0x2a3f78, seaShallow: 0xd9825a, clouds: 0xffc7a8, stars: false, night: false,
  },
  dusk: {
    top: 0x1b2a6b, horizon: 0xf2a0a6, bottom: 0x70578c, sunDir: v3(-0.5, 0.03, -0.86), sunColor: 0xffb7a0, sunSize: 3.2, glow: 0.7,
    fog: 0xa98bb0, hemi: [0xd4c6f2, 0x6a6480, 1.35], dir: [0xffc0a8, 1.2],
    seaDeep: 0x1c2c62, seaShallow: 0x9a7aa8, clouds: 0xe9b0c0, stars: true, night: false,
  },
  night: {
    top: 0x040818, horizon: 0x1a2a55, bottom: 0x0a1028, sunDir: v3(-0.4, 0.55, -0.6), sunColor: 0xcfe0ff, sunSize: 1.7, glow: 0.18,
    fog: 0x0e1a38, hemi: [0x6a82c8, 0x24283c, 1.0], dir: [0x9fb6ff, 0.6],
    seaDeep: 0x030a1c, seaShallow: 0x16305c, clouds: null, stars: true, night: true,
  },
  hub: {
    top: 0x050a1e, horizon: 0x1c2f66, bottom: 0x0b1330, sunDir: v3(0.3, 0.8, 0.4), sunColor: 0xffffff, sunSize: 0.0, glow: 0.0,
    fog: 0x0b1330, hemi: [0xdfe9ff, 0x50586e, 1.5], dir: [0xffffff, 1.7],
    seaDeep: 0x0d5c96, seaShallow: 0x37b1c4, clouds: null, stars: true, night: false,
  },
};

export function skyPreset(name) {
  return SKY_PRESETS[name] || SKY_PRESETS.day;
}

/** 그라데이션 하늘 돔 + 태양/달. 카메라를 따라다니도록 update(camPos) 호출 */
export function makeSky(name, radius = 1500) {
  const p = skyPreset(name);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color(p.top) },
      horizon: { value: new THREE.Color(p.horizon) },
      bottom: { value: new THREE.Color(p.bottom) },
      sunColor: { value: new THREE.Color(p.sunColor) },
      sunDir: { value: p.sunDir.clone() },
      sunCos: { value: Math.cos(THREE.MathUtils.degToRad(Math.max(p.sunSize, 0.01))) },
      sunOn: { value: p.sunSize > 0 ? 1 : 0 },
      glow: { value: p.glow },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 top, horizon, bottom, sunColor, sunDir;
      uniform float sunCos, sunOn, glow;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 c = mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.5));
        c = mix(c, bottom, smoothstep(0.0, -0.3, h));
        float s = max(dot(d, normalize(sunDir)), 0.0);
        c += sunColor * (pow(s, 5.0) * 0.28 + pow(s, 48.0) * 0.5) * glow;
        float disc = smoothstep(sunCos, sunCos + 0.0006, s) * sunOn;
        c = mix(c, sunColor * 1.25, disc);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), mat);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  mesh.userData.follow = true;
  return mesh;
}

export function makeStars(count = 700, radius = 1300) {
  const rand = mulberry32(2024);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const y = 0.06 + rand() * 0.94;
    const r = Math.sqrt(1 - y * y);
    pos[i * 3] = Math.cos(a) * r * radius;
    pos[i * 3 + 1] = y * radius;
    pos[i * 3 + 2] = Math.sin(a) * r * radius;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85, depthWrite: false }));
  pts.frustumCulled = false;
  pts.renderOrder = -9;
  pts.userData.follow = true;
  return pts;
}

export function makeClouds(color = 0xffffff, count = 14, seed = 5) {
  const rand = mulberry32(seed);
  const b = new Batch();
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const dist = 500 + rand() * 600;
    const x = Math.cos(a) * dist;
    const z = Math.sin(a) * dist;
    const y = 190 + rand() * 160;
    const w = 60 + rand() * 90;
    for (let k = 0; k < 4; k++) {
      b.sphere(1, x + (rand() - 0.5) * w * 1.6, y + (rand() - 0.5) * 12, z + (rand() - 0.5) * w * 1.6, color, w * (0.5 + rand() * 0.5), 14 + rand() * 12, w * (0.4 + rand() * 0.4), 14, 9);
    }
  }
  const mesh = b.build(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.78, fog: false, depthWrite: false }));
  mesh.renderOrder = -8;
  return mesh;
}

/** 프리셋에 맞는 조명 세트 */
export function makeLights(name, override = null) {
  const p = { ...skyPreset(name), ...(override || {}) };
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight(p.hemi[0], p.hemi[1], p.hemi[2]));
  const sun = new THREE.DirectionalLight(p.dir[0], p.dir[1]);
  const dir = p.sunDir.clone();
  if (dir.y < 0.25) dir.y = 0.25; // 노을에도 지면이 너무 어둡지 않게
  sun.position.copy(dir.normalize().multiplyScalar(100));
  g.add(sun);
  return g;
}

// ───────────────────────── 바다 (파도 셰이더) ─────────────────────────
export function makeSea(name, opts = {}) {
  const p = skyPreset(name);
  const { size = 3200, segments = 110, y = 0, amp = 0.28, freq = 1, fadeNear = 70, fadeFar = 260, horizonFar = 1500, deep, shallow } = opts;
  const mat = new THREE.ShaderMaterial({
    fog: false,
    uniforms: {
      time: { value: 0 },
      amp: { value: amp },
      freq: { value: freq },
      fade: { value: new THREE.Vector2(fadeNear, fadeFar) },
      horizonFar: { value: horizonFar },
      deep: { value: new THREE.Color(deep ?? p.seaDeep) },
      shallow: { value: new THREE.Color(shallow ?? p.seaShallow) },
      skyCol: { value: new THREE.Color(p.horizon) },
      sunColor: { value: new THREE.Color(p.sunColor) },
      sunDir: { value: p.sunDir.clone() },
      sunPow: { value: p.night ? 0.35 : 1.0 },
    },
    vertexShader: /* glsl */ `
      uniform float time, amp, freq;
      uniform vec2 fade;
      varying vec3 vWorld;
      varying float vWave;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vec2 q = w.xz * freq;
        float wv = sin(q.x * 0.33 + time * 1.1) * 0.5 + sin(q.y * 0.27 - time * 0.9) * 0.5 + sin((q.x + q.y) * 0.17 + time * 0.6) * 0.6;
        float near = 1.0 - smoothstep(fade.x, fade.y, distance(w.xz, cameraPosition.xz));
        w.y += wv * amp * near;
        vWave = wv;
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float time, amp, freq, horizonFar, sunPow;
      uniform vec3 deep, shallow, skyCol, sunColor, sunDir;
      varying vec3 vWorld;
      varying float vWave;
      void main() {
        vec2 q = vWorld.xz * freq;
        float t = time;
        float dx = cos(q.x * 0.33 + t * 1.1) * 0.165 + cos((q.x + q.y) * 0.17 + t * 0.6) * 0.102
                 + cos(q.x * 1.9 + q.y * 1.3 + t * 2.1) * 0.22 + cos(q.x * 4.3 - q.y * 3.1 + t * 3.0) * 0.12;
        float dz = cos(q.y * 0.27 - t * 0.9) * -0.135 + cos((q.x + q.y) * 0.17 + t * 0.6) * 0.102
                 + cos(q.x * 1.9 + q.y * 1.3 + t * 2.1) * 0.15 - cos(q.x * 4.3 - q.y * 3.1 + t * 3.0) * 0.09;
        vec3 n = normalize(vec3(-dx * 0.55, 1.0, -dz * 0.55));
        vec3 v = normalize(cameraPosition - vWorld);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        vec3 c = mix(deep, shallow, clamp(vWave * 0.22 + 0.42, 0.0, 1.0) * 0.65);
        c = mix(c, skyCol, clamp(fres, 0.0, 1.0) * 0.7);
        vec3 r = reflect(-normalize(sunDir), n);
        float spec = pow(max(dot(r, v), 0.0), 70.0);
        c += sunColor * spec * 0.9 * sunPow;
        float foam = smoothstep(1.25, 1.55, vWave + sin(q.x * 2.3 + q.y * 1.7 + t) * 0.25);
        c = mix(c, vec3(0.92, 0.96, 1.0), foam * 0.35 * sunPow);
        float dist = distance(vWorld.xz, cameraPosition.xz);
        c = mix(c, skyCol, smoothstep(horizonFar * 0.25, horizonFar, dist) * 0.92);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);
  // 격자를 반 칸쯤 어긋나게 둔다: 관람자 바로 아래(카메라 평면 위)에 정점 줄이 정확히 놓이면
  // 일부 렌더러에서 w=0 클리핑 오류로 수면이 화면을 덮는 현상이 생긴다.
  const cell = size / segments;
  geo.translate(cell * 0.37, 0, cell * 0.43);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = y;
  mesh.frustumCulled = false;
  mesh.userData.tick = (t) => {
    mat.uniforms.time.value = t;
  };
  return mesh;
}

// ───────────────────────── 글자 (CanvasTexture) ─────────────────────────
export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** 글자 단위 줄바꿈 (한글은 띄어쓰기 없이도 줄바꿈되어야 함) */
export function wrapText(ctx, text, maxWidth) {
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const word of para.split(/(\s+)/)) {
      if (ctx.measureText(line + word).width <= maxWidth) {
        line += word;
        continue;
      }
      if (ctx.measureText(word).width <= maxWidth) {
        if (line.trim()) out.push(line.trimEnd());
        line = word.trimStart();
        continue;
      }
      for (const ch of word) {
        if (ctx.measureText(line + ch).width > maxWidth && line) {
          out.push(line);
          line = ch;
        } else {
          line += ch;
        }
      }
    }
    out.push(line.trimEnd());
  }
  return out;
}

export function makeTextTexture(text, o = {}) {
  const { w = 512, h = 128, bg = '#0b1b3a', fg = '#ffffff', size = 64, weight = 800, radius = 28, border = null, borderW = 6, sub = null, subColor = '#ffd27a', subSize = 30, glow = null } = o;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d');
  if (bg) {
    ctx.fillStyle = bg;
    roundRect(ctx, 0, 0, w, h, radius);
    ctx.fill();
  }
  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = borderW;
    roundRect(ctx, borderW / 2, borderW / 2, w - borderW, h - borderW, Math.max(0, radius - borderW / 2));
    ctx.stroke();
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let fs = size;
  ctx.font = `${weight} ${fs}px ${FONT}`;
  while (ctx.measureText(text).width > w - 36 && fs > 12) {
    fs -= 2;
    ctx.font = `${weight} ${fs}px ${FONT}`;
  }
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = fs * 0.35;
  }
  ctx.fillStyle = fg;
  ctx.fillText(text, w / 2, sub ? h / 2 - subSize * 0.55 : h / 2 + fs * 0.04);
  ctx.shadowBlur = 0;
  if (sub) {
    ctx.font = `600 ${subSize}px ${FONT}`;
    ctx.fillStyle = subColor;
    ctx.fillText(sub, w / 2, h / 2 + fs * 0.55);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** 글자 간판 평면 (width m 기준, 높이는 캔버스 비율) */
export function makeSign(text, width, o = {}) {
  const tex = makeTextTexture(text, o);
  const aspect = tex.image.height / tex.image.width;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, fog: o.fog ?? false, side: o.doubleSide ? THREE.DoubleSide : THREE.FrontSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width * aspect), mat);
  return mesh;
}

/** 항상 카메라를 보는 라벨 */
export function makeLabelSprite(text, width, o = {}) {
  const tex = makeTextTexture(text, o);
  const aspect = tex.image.height / tex.image.width;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: o.depthTest ?? true, toneMapped: false, fog: false }));
  sp.scale.set(width, width * aspect, 1);
  return sp;
}

// ───────────────────────── 자주 쓰는 소품 ─────────────────────────
export function addPine(b, x, y, z, h = 7, rand = Math.random) {
  const lean = (rand() - 0.5) * 0.25;
  b.cyl(h * 0.025, h * 0.045, h * 0.72, x, y, z, 0x6b4a34, 6, 0, lean);
  const cx = x - Math.sin(lean) * h * 0.7;
  const green = [0x2f5d3a, 0x356b3f, 0x27502f][Math.floor(rand() * 3)];
  b.sphere(1, cx, y + h * 0.78, z, green, h * 0.3, h * 0.13, h * 0.3, 8, 6);
  b.sphere(1, cx + h * 0.12, y + h * 0.62, z + h * 0.05, green, h * 0.22, h * 0.09, h * 0.2, 8, 6);
  b.sphere(1, cx - h * 0.1, y + h * 0.9, z - h * 0.04, green, h * 0.18, h * 0.09, h * 0.18, 8, 6);
}

export function addTree(b, x, y, z, h = 5, color = 0x4f8a45) {
  b.cyl(h * 0.035, h * 0.05, h * 0.5, x, y, z, 0x6a4a32, 6);
  b.sphere(h * 0.32, x, y + h * 0.68, z, color, 1, 1.05, 1, 8, 6);
}

export function addPalm(b, x, y, z, h = 6) {
  b.cyl(0.12, 0.2, h, x, y, z, 0x8a6a4a, 6);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.beam(x, y + h, z, x + Math.cos(a) * 1.9, y + h - 0.7, z + Math.sin(a) * 1.9, 0.22, 0x3f8a4a);
  }
}

let _avoid = null;
/** 사람 소품을 놓지 않을 구역 지정 (관람자 바로 앞에 사람이 서지 않도록). null 이면 해제 */
export function setPersonAvoid(zone) {
  _avoid = zone;
}

export function addPerson(b, x, y, z, h = 1.7, color = 0x3b4a6b, skin = 0xe8c4a0) {
  if (_avoid && Math.abs(y) < 2.5 && Math.hypot(x - _avoid.x, z - _avoid.z) < _avoid.r) return;
  b.cyl(h * 0.09, h * 0.11, h * 0.48, x, y, z, 0x2a2f3a, 6);
  b.cyl(h * 0.11, h * 0.1, h * 0.34, x, y + h * 0.48, z, color, 6);
  b.sphere(h * 0.075, x, y + h * 0.91, z, skin, 1, 1.1, 1, 8, 6);
}

export function addBoat(b, x, y, z, len = 8, ry = 0, hull = 0x2f5f8f, cabin = 0xf2f2f2) {
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  b.box(len, len * 0.14, len * 0.3, x, y - len * 0.03, z, hull, ry);
  b.box(len * 0.3, len * 0.16, len * 0.2, x - c * len * 0.15, y + len * 0.11, z + s * len * 0.15, cabin, ry);
  b.cyl(0.05, 0.05, len * 0.35, x + c * len * 0.15, y + len * 0.11, z - s * len * 0.15, 0xdddddd, 5);
}

/** 난간 (기둥 + 손잡이) */
export function addRailing(b, x1, z1, x2, z2, y, h = 1.1, color = 0xd8dde3, step = 2) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const n = Math.max(1, Math.round(len / step));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    b.box(0.07, h, 0.07, x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t, color);
  }
  b.beam(x1, y + h, z1, x2, y + h, z2, 0.08, color);
  b.beam(x1, y + h * 0.5, z1, x2, y + h * 0.5, z2, 0.04, color);
}

/** 한옥/사찰 전각 */
export function addHanok(b, o) {
  const { x = 0, y = 0, z = 0, w = 12, d = 8, h = 4.2, ry = 0, wall = 0x9a3b2e, roof = 0x3b4350, trim = 0x2f7f6f, base = 0xb9b3a6 } = o;
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  const at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  b.box(w + 2.4, 0.7, d + 2.4, x, y, z, base, ry);
  b.box(w, h, d, x, y + 0.7, z, wall, ry);
  // 기둥과 문살
  const cols = Math.max(2, Math.round(w / 3));
  for (let i = 0; i <= cols; i++) {
    const lx = -w / 2 + (w * i) / cols;
    for (const lz of [d / 2 + 0.25, -d / 2 - 0.25]) {
      const [px, pz] = at(lx, lz);
      b.cyl(0.22, 0.24, h, px, y + 0.7, pz, 0x7a2a22, 8);
    }
    if (i < cols) {
      const [dx, dz] = at(lx + w / cols / 2, d / 2 + 0.03);
      b.box((w / cols) * 0.72, h * 0.7, 0.08, dx, y + 0.75, dz, 0x4a6f5a, ry);
    }
  }
  b.box(w + 1.2, 0.55, d + 1.2, x, y + 0.7 + h, z, trim, ry); // 단청 공포
  b.box(w + 3.6, 0.22, d + 3.6, x, y + 1.25 + h, z, 0x2c3138, ry); // 처마
  b.hip(w + 3.4, h * 0.62, d + 3.4, x, y + 1.45 + h, z, roof, 0.42, ry);
  b.box(w * 0.5, 0.4, 0.5, x, y + 1.45 + h * 1.62, z, 0x23272d, ry); // 용마루
  for (const [lx, lz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const [px, pz] = at((lx * (w + 3.6)) / 2, (lz * (d + 3.6)) / 2);
    b.box(0.5, 0.5, 0.5, px, y + 1.3 + h, pz, 0x2c3138, ry + Math.PI / 4, 0.35); // 추녀 끝
  }
}

/** 석탑 */
export function addPagoda(b, x, y, z, levels = 3, w = 2.4, color = 0xb7b2a7) {
  let yy = y;
  b.box(w * 1.5, 0.45, w * 1.5, x, yy, z, color);
  yy += 0.45;
  b.box(w * 1.2, 0.5, w * 1.2, x, yy, z, color);
  yy += 0.5;
  let ww = w;
  for (let i = 0; i < levels; i++) {
    b.box(ww * 0.62, ww * 0.55, ww * 0.62, x, yy, z, color);
    yy += ww * 0.55;
    b.hip(ww * 1.15, ww * 0.26, ww * 1.15, x, yy, z, 0xa8a398, 0.55);
    yy += ww * 0.26;
    ww *= 0.78;
  }
  b.cyl(0.02, 0.14, w * 0.7, x, yy, z, 0x9a958a, 6);
}

/** 석등 */
export function addStoneLantern(b, x, y, z, s = 1, glow = null) {
  b.cyl(0.3 * s, 0.38 * s, 0.25 * s, x, y, z, 0xb0aa9e, 8);
  b.cyl(0.13 * s, 0.15 * s, 0.9 * s, x, y + 0.25 * s, z, 0xb0aa9e, 8);
  b.box(0.5 * s, 0.4 * s, 0.5 * s, x, y + 1.15 * s, z, 0xbdb7aa);
  b.hip(0.85 * s, 0.3 * s, 0.85 * s, x, y + 1.55 * s, z, 0x9d978b, 0.2);
  if (glow) glow.box(0.3 * s, 0.24 * s, 0.52 * s, x, y + 1.23 * s, z, 0xffd27a);
}

/** 가로등 */
export function addLamp(b, glow, x, y, z, h = 6, color = 0x59616b, light = 0xfff0c2) {
  b.cyl(0.07, 0.1, h, x, y, z, color, 6);
  b.box(0.9, 0.08, 0.12, x + 0.4, y + h, z, color);
  if (glow) glow.box(0.5, 0.1, 0.22, x + 0.6, y + h - 0.12, z, light);
}

/** 등대 */
export function addLighthouse(b, glow, x, y, z, h = 14, body = 0xf5f5f5, cap = 0xd43c2f) {
  b.cyl(h * 0.09, h * 0.14, h * 0.78, x, y, z, body, 12);
  b.cyl(h * 0.13, h * 0.13, h * 0.03, x, y + h * 0.78, z, 0x555b63, 12);
  (glow || b).cyl(h * 0.075, h * 0.075, h * 0.1, x, y + h * 0.81, z, 0xfff3b0, 10);
  b.cone(h * 0.1, h * 0.09, x, y + h * 0.91, z, cap, 10);
}

/**
 * 현수교 (광안대교 등). 다리 축은 x 방향, 원점=주경간 중앙 수면.
 * Batch.setTransform 으로 위치/방향/크기를 정해 놓고 호출한다.
 */
export function addSuspensionBridge(b, glow, o = {}) {
  const { length = 900, span = 420, towerH = 78, deckY = 28, deckW = 18, color = 0xdfe5ec, cable = 0xf4f7fb, lights = false, lightColor = 0x7fd6ff, hangerStep = 14 } = o;
  const L = length / 2;
  const S = span / 2;
  const top = deckY + towerH;
  // 상판(복층) + 교각
  b.box(length, 1.8, deckW, 0, deckY - 1.8, 0, color);
  b.box(length, 1.2, deckW * 0.8, 0, deckY - 9, 0, 0xc4ccd6);
  for (let x = -L; x <= L + 1; x += 30) {
    b.beam(x, deckY - 8, deckW * 0.4, x + 15, deckY - 1.8, deckW * 0.45, 0.7, 0xc4ccd6);
    b.beam(x + 15, deckY - 1.8, deckW * 0.45, x + 30, deckY - 8, deckW * 0.4, 0.7, 0xc4ccd6);
    b.beam(x, deckY - 8, -deckW * 0.4, x + 15, deckY - 1.8, -deckW * 0.45, 0.7, 0xc4ccd6);
    b.beam(x + 15, deckY - 1.8, -deckW * 0.45, x + 30, deckY - 8, -deckW * 0.4, 0.7, 0xc4ccd6);
  }
  for (let x = -L; x <= L + 1; x += 75) {
    if (Math.abs(Math.abs(x) - S) < 20 || Math.abs(x) < S - 10) continue;
    b.box(4, deckY - 9, deckW * 0.5, x, 0, 0, 0xb9c1cb);
  }
  // 주탑 (H형)
  for (const tx of [-S, S]) {
    for (const tz of [-deckW / 2 - 1.5, deckW / 2 + 1.5]) {
      b.box(4.5, top, 3.6, tx, 0, tz, color);
    }
    b.box(3.4, 5, deckW + 3, tx, top - 7, 0, color);
    b.box(3.4, 4, deckW + 3, tx, deckY + towerH * 0.52, 0, color);
    b.box(5.5, 6, deckW + 6, tx, deckY - 16, 0, 0xb9c1cb);
    if (glow) {
      glow.box(1.2, 1.2, 1.2, tx, top + 0.3, -deckW / 2 - 1.5, 0xff4040);
      glow.box(1.2, 1.2, 1.2, tx, top + 0.3, deckW / 2 + 1.5, 0xff4040);
    }
  }
  // 주케이블 + 행어
  const cableY = (x) => {
    const ax = Math.abs(x);
    if (ax <= S) return deckY + 5 + (towerH - 5) * (ax / S) ** 2;
    const s = Math.min(1, (ax - S) / (L - S));
    return deckY + 1.5 + (towerH - 1.5) * (1 - s) ** 1.8;
  };
  const N = 56;
  for (const cz of [-deckW / 2 - 1.5, deckW / 2 + 1.5]) {
    for (let i = 0; i < N; i++) {
      const x1 = -L + (length * i) / N;
      const x2 = -L + (length * (i + 1)) / N;
      b.beam(x1, cableY(x1), cz, x2, cableY(x2), cz, 0.75, cable);
      if (lights && glow) glow.box(1.3, 1.3, 1.3, x1, cableY(x1) + 0.3, cz, lightColor);
    }
    for (let x = -L + hangerStep; x < L; x += hangerStep) {
      if (Math.abs(Math.abs(x) - S) < 4) continue;
      const cy = cableY(x);
      if (cy - deckY > 2.5) b.beam(x, deckY, cz, x, cy, cz, 0.22, cable);
    }
    if (lights && glow) {
      for (let x = -L; x <= L; x += 22) glow.box(1.6, 0.5, 0.5, x, deckY + 0.4, cz * 0.96, 0xfff0c2);
    }
  }
}

/** 리소스 해제 (공유 텍스처 제외) */
export function disposeTree(root) {
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      for (const key of ['map', 'emissiveMap', 'alphaMap']) {
        const t = m[key];
        if (t && !t.userData?.shared) t.dispose();
      }
      m.dispose();
    }
  });
}
