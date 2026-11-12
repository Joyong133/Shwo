// 파편/반짝임 입자. 인스턴스 메시 하나로 그린다.
import * as THREE from 'three';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

export class Bursts {
  constructor(scene, n = 110) {
    this.n = n;
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), n);
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.items = [];
    _m.makeScale(0, 0, 0);
    for (let i = 0; i < n; i++) {
      this.items.push({ life: 0, max: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 0.1, g: 0, r: 0, rs: 0 });
      this.mesh.setMatrixAt(i, _m);
      this.mesh.setColorAt(i, _c.setHex(0xffffff));
    }
    this.next = 0;
    scene.add(this.mesh);
  }

  spawn(pos, color, count, { speed = 6, life = 0.6, size = 0.16, gravity = -18, up = 3, spread = 0.3 } = {}) {
    _c.setHex(color);
    for (let i = 0; i < count; i++) {
      const it = this.items[this.next];
      const a = Math.random() * Math.PI * 2, sp = speed * (0.4 + Math.random() * 0.6);
      it.x = pos.x + (Math.random() - 0.5) * spread;
      it.y = pos.y + (Math.random() - 0.5) * spread;
      it.z = pos.z + (Math.random() - 0.5) * spread;
      it.vx = Math.cos(a) * sp; it.vz = Math.sin(a) * sp;
      it.vy = up * (0.3 + Math.random());
      it.life = it.max = life * (0.6 + Math.random() * 0.6);
      it.size = size * (0.6 + Math.random() * 0.8);
      it.g = gravity;
      it.r = Math.random() * 6; it.rs = (Math.random() - 0.5) * 14;
      this.mesh.setColorAt(this.next, _c);
      this.next = (this.next + 1) % this.n;
    }
    this.mesh.instanceColor.needsUpdate = true;
  }

  update(dt) {
    let any = false;
    for (let i = 0; i < this.n; i++) {
      const it = this.items[i];
      if (it.life <= 0) continue;
      any = true;
      it.life -= dt;
      if (it.life <= 0) { _m.makeScale(0, 0, 0); this.mesh.setMatrixAt(i, _m); continue; }
      it.vy += it.g * dt;
      it.x += it.vx * dt; it.y += it.vy * dt; it.z += it.vz * dt;
      it.r += it.rs * dt;
      const k = it.size * Math.min(1, (it.life / it.max) * 2);
      _e.set(it.r, it.r * 0.7, 0);
      _m.compose(_p.set(it.x, it.y, it.z), _q.setFromEuler(_e), _s.set(k, k, k));
      this.mesh.setMatrixAt(i, _m);
    }
    if (any) this.mesh.instanceMatrix.needsUpdate = true;
  }
}
