// 환경: 하늘, 안개, 조명, 지면, 구름, 별, 공기 중 입자. 바이옴이 바뀌면 부드럽게 섞는다.
import * as THREE from 'three';
import { BASE_Y } from './const.js';

function softDot() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.75)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const PCOUNT = 140;
const BOX = [44, 18, 44];

export class Env {
  constructor(scene) {
    this.scene = scene;
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x666666, 1.6);
    this.sun = new THREE.DirectionalLight(0xffffff, 2.2);
    this.sun.position.set(-0.5, 1.0, 0.6);
    scene.add(this.hemi, this.sun);
    scene.fog = new THREE.Fog(0xffffff, 40, 140);

    // 그라데이션 하늘
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: [
        'uniform vec3 top; uniform vec3 bottom; varying vec3 vDir;',
        'void main(){',
        '  float h = clamp(vDir.y * 1.25 + 0.04, 0.0, 1.0);',
        '  gl_FragColor = vec4(mix(bottom, top, pow(h, 0.65)), 1.0);',
        '  #include <colorspace_fragment>',
        '}',
      ].join('\n'),
      side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(200, 20, 12), this.skyMat);
    this.sky.renderOrder = -10;
    this.sky.frustumCulled = false;
    scene.add(this.sky);

    const dot = softDot();

    // 해(달)
    this.sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xffffff, fog: false, depthWrite: false, depthTest: false, transparent: true, blending: THREE.AdditiveBlending }));
    this.sunSprite.scale.setScalar(34);
    this.sunSprite.renderOrder = -9;
    scene.add(this.sunSprite);

    // 별
    const sp = new Float32Array(260 * 3);
    for (let i = 0; i < 260; i++) {
      const a = Math.random() * Math.PI * 2, e = 0.08 + Math.random() * 1.4;
      sp[i * 3] = Math.cos(a) * Math.cos(e) * 190;
      sp[i * 3 + 1] = Math.sin(e) * 190;
      sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 190;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    this.starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false, depthTest: false });
    this.stars = new THREE.Points(sg, this.starMat);
    this.stars.renderOrder = -8;
    this.stars.frustumCulled = false;
    scene.add(this.stars);

    // 구름
    this.cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, fog: false, depthWrite: false });
    this.clouds = new THREE.Group();
    const cg = new THREE.IcosahedronGeometry(1, 1);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
      const rad = 110 + Math.random() * 60;
      const grp = new THREE.Group();
      grp.position.set(Math.cos(a) * rad, 34 + Math.random() * 36, Math.sin(a) * rad);
      for (let k = 0; k < 3; k++) {
        const m = new THREE.Mesh(cg, this.cloudMat);
        const s = 7 + Math.random() * 7;
        m.scale.set(s * 1.7, s * 0.55, s);
        m.position.set((k - 1) * s * 1.1, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 4);
        grp.add(m);
      }
      grp.lookAt(0, grp.position.y, 0);
      this.clouds.add(grp);
    }
    this.clouds.renderOrder = -7;
    scene.add(this.clouds);

    // 지면
    this.baseMat = new THREE.MeshLambertMaterial({ color: 0x4f9a48, emissive: 0x000000 });
    this.base = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), this.baseMat);
    this.base.rotation.x = -Math.PI / 2;
    this.base.position.y = BASE_Y;
    scene.add(this.base);

    // 공기 중 입자(눈·불티·반딧불 등)
    this.pp = new Float32Array(PCOUNT * 3);
    this.pv = new Float32Array(PCOUNT * 3);
    for (let i = 0; i < PCOUNT; i++) {
      this.pp[i * 3] = (Math.random() - 0.5) * BOX[0];
      this.pp[i * 3 + 1] = Math.random() * BOX[1];
      this.pp[i * 3 + 2] = (Math.random() - 0.5) * BOX[2];
      this.pv[i * 3] = Math.random() - 0.5;
      this.pv[i * 3 + 1] = Math.random() - 0.5;
      this.pv[i * 3 + 2] = Math.random() - 0.5;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(this.pp, 3));
    this.pMat = new THREE.PointsMaterial({ map: dot, color: 0xffffff, size: 0.2, transparent: true, opacity: 0.8, depthWrite: false, fog: false });
    this.points = new THREE.Points(pg, this.pMat);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.pVel = { vx: 0, vy: 0 };

    // 현재 값(보간용)
    this.cur = {
      top: new THREE.Color(), bottom: new THREE.Color(), base: new THREE.Color(), glow: new THREE.Color(),
      sun: new THREE.Color(), hemiSky: new THREE.Color(), hemiGround: new THREE.Color(), part: new THREE.Color(),
      sunI: 2, hemiI: 1.6, fogNear: 40, fogFar: 140, stars: 0, clouds: 1, pSize: 0.2, pOp: 0.8, vx: 0, vy: 0, pCount: 60,
    };
    this.tgt = null;
    this._c = new THREE.Color();
  }

  setBiome(b, instant = false) {
    this.tgt = b;
    if (instant) this.blend(1);
  }

  blend(k) {
    const b = this.tgt, c = this.cur, t = this._c;
    if (!b) return;
    c.top.lerp(t.setHex(b.sky[0]), k);
    c.bottom.lerp(t.setHex(b.sky[1]), k);
    c.base.lerp(t.setHex(b.base), k);
    c.glow.lerp(t.setHex(b.baseGlow), k);
    c.sun.lerp(t.setHex(b.sun), k);
    c.hemiSky.lerp(t.setHex(b.hemiSky), k);
    c.hemiGround.lerp(t.setHex(b.hemiGround), k);
    c.part.lerp(t.setHex(b.particles.color), k);
    c.sunI += (b.sunI - c.sunI) * k;
    c.hemiI += (b.hemiI - c.hemiI) * k;
    c.fogNear += (b.fog[0] - c.fogNear) * k;
    c.fogFar += (b.fog[1] - c.fogFar) * k;
    c.stars += (b.stars - c.stars) * k;
    c.clouds += (b.clouds - c.clouds) * k;
    c.pSize += (b.particles.size - c.pSize) * k;
    c.pOp += (b.particles.opacity - c.pOp) * k;
    c.vx += (b.particles.vx - c.vx) * k;
    c.vy += (b.particles.vy - c.vy) * k;
    c.pCount += (b.particles.count - c.pCount) * k;

    this.skyMat.uniforms.top.value.copy(c.top);
    this.skyMat.uniforms.bottom.value.copy(c.bottom);
    this.scene.fog.color.copy(c.bottom);
    this.scene.fog.near = c.fogNear;
    this.scene.fog.far = c.fogFar;
    this.baseMat.color.copy(c.base);
    this.baseMat.emissive.copy(c.glow);
    this.sun.color.copy(c.sun);
    this.sun.intensity = c.sunI;
    this.hemi.color.copy(c.hemiSky);
    this.hemi.groundColor.copy(c.hemiGround);
    this.hemi.intensity = c.hemiI;
    this.sunSprite.material.color.copy(c.sun);
    this.starMat.opacity = c.stars;
    this.stars.visible = c.stars > 0.02;
    this.cloudMat.opacity = c.clouds * 0.9;
    this.cloudMat.color.copy(c.bottom).lerp(t.setHex(0xffffff), 0.6);
    this.clouds.visible = c.clouds > 0.02;
    this.pMat.color.copy(c.part);
    this.pMat.size = c.pSize;
    this.pMat.opacity = c.pOp;
    this.points.geometry.setDrawRange(0, Math.round(c.pCount));
  }

  update(dt, focus, camera, time) {
    this.blend(1 - Math.exp(-dt * 2.2));
    this.sky.position.copy(camera.position);
    this.stars.position.copy(camera.position);
    this.clouds.position.set(camera.position.x, 0, camera.position.z);
    this.clouds.rotation.y = time * 0.004;
    this.sunSprite.position.set(camera.position.x + 62, camera.position.y + 74, camera.position.z - 150);
    this.base.position.set(Math.round(focus.x / 10) * 10, BASE_Y, Math.round(focus.z / 10) * 10);

    // 입자: 초점 주변 상자 안에서 순환
    const p = this.pp, v = this.pv, c = this.cur;
    const n = Math.round(c.pCount);
    const cy = focus.y + 5;
    for (let i = 0; i < n; i++) {
      const o = i * 3;
      p[o] += (c.vx + v[o] * 0.8) * dt;
      p[o + 1] += (c.vy + v[o + 1] * 0.5) * dt;
      p[o + 2] += v[o + 2] * 0.8 * dt;
      let d = p[o] - focus.x;
      if (d > BOX[0] / 2) p[o] -= BOX[0]; else if (d < -BOX[0] / 2) p[o] += BOX[0];
      d = p[o + 1] - cy;
      if (d > BOX[1] / 2) p[o + 1] -= BOX[1]; else if (d < -BOX[1] / 2) p[o + 1] += BOX[1];
      d = p[o + 2] - focus.z;
      if (d > BOX[2] / 2) p[o + 2] -= BOX[2]; else if (d < -BOX[2] / 2) p[o + 2] += BOX[2];
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}
