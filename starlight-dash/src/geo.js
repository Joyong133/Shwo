// 여러 기본 도형을 하나의 버텍스 컬러 지오메트리로 합치는 빌더.
// 세그먼트 하나의 지형·장식을 드로우콜 1번으로 그리기 위해 쓴다.
import * as THREE from 'three';

const prims = {};
function primitive(name) {
  if (prims[name]) return prims[name];
  let g;
  switch (name) {
    case 'box': g = new THREE.BoxGeometry(1, 1, 1); break;
    case 'cyl': g = new THREE.CylinderGeometry(0.5, 0.5, 1, 8); break;
    case 'cyl6': g = new THREE.CylinderGeometry(0.5, 0.5, 1, 6); break;
    case 'tcyl': g = new THREE.CylinderGeometry(0.3, 0.5, 1, 7); break;
    case 'cone': g = new THREE.ConeGeometry(0.5, 1, 7); break;
    case 'cone4': g = new THREE.ConeGeometry(0.5, 1, 4); break;
    case 'ico': g = new THREE.IcosahedronGeometry(0.5, 0); break;
    case 'ico1': g = new THREE.IcosahedronGeometry(0.5, 1); break;
    case 'oct': g = new THREE.OctahedronGeometry(0.5, 0); break;
    default: throw new Error('unknown primitive ' + name);
  }
  const ni = g.index ? g.toNonIndexed() : g;
  return (prims[name] = ni.attributes.position.array);
}

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _e = new THREE.Euler();
const _c = new THREE.Color();

/** 색을 밝게(f>1) 또는 어둡게(f<1). */
export function tint(hex, f) {
  const r = Math.min(255, Math.round(((hex >> 16) & 255) * f));
  const g = Math.min(255, Math.round(((hex >> 8) & 255) * f));
  const b = Math.min(255, Math.round((hex & 255) * f));
  return (r << 16) | (g << 8) | b;
}

export class GeoBuilder {
  constructor(cap = 6000) {
    this.pos = new Float32Array(cap * 3);
    this.col = new Float32Array(cap * 3);
    this.n = 0; // 버텍스 개수
  }

  _grow(extra) {
    const need = (this.n + extra) * 3;
    if (need <= this.pos.length) return;
    let cap = this.pos.length;
    while (cap < need) cap *= 2;
    const np = new Float32Array(cap); np.set(this.pos.subarray(0, this.n * 3)); this.pos = np;
    const nc = new Float32Array(cap); nc.set(this.col.subarray(0, this.n * 3)); this.col = nc;
  }

  /** 도형 추가: 위치(x,y,z), 크기(sx,sy,sz), 색, 회전(rx,ry,rz). */
  add(name, x, y, z, sx, sy, sz, color, rx = 0, ry = 0, rz = 0) {
    const src = primitive(name);
    const cnt = src.length / 3;
    this._grow(cnt);
    _e.set(rx, ry, rz);
    _q.setFromEuler(_e);
    _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz));
    _c.setHex(color);
    const e = _m.elements, P = this.pos, C = this.col;
    let o = this.n * 3;
    for (let i = 0; i < src.length; i += 3, o += 3) {
      const px = src[i], py = src[i + 1], pz = src[i + 2];
      P[o] = e[0] * px + e[4] * py + e[8] * pz + e[12];
      P[o + 1] = e[1] * px + e[5] * py + e[9] * pz + e[13];
      P[o + 2] = e[2] * px + e[6] * py + e[10] * pz + e[14];
      C[o] = _c.r; C[o + 1] = _c.g; C[o + 2] = _c.b;
    }
    this.n += cnt;
    return this;
  }

  /** 사각형(a→b→c→d 반시계 방향이 바깥면). */
  quad(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, color) {
    this._grow(6);
    _c.setHex(color);
    const P = this.pos, C = this.col;
    let o = this.n * 3;
    const put = (x, y, z) => { P[o] = x; P[o + 1] = y; P[o + 2] = z; C[o] = _c.r; C[o + 1] = _c.g; C[o + 2] = _c.b; o += 3; };
    put(ax, ay, az); put(bx, by, bz); put(cx, cy, cz);
    put(ax, ay, az); put(cx, cy, cz); put(dx, dy, dz);
    this.n += 6;
    return this;
  }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos.slice(0, this.n * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col.slice(0, this.n * 3), 3));
    g.computeVertexNormals(); // 인덱스가 없으므로 면 단위(플랫) 노멀이 된다
    g.computeBoundingSphere();
    return g;
  }
}
