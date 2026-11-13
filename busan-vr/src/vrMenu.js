// VR·모바일 공용 3D UI와 Meta Quest 컨트롤러 조작
//  - UIPanel      : CanvasTexture 고해상도 한글 패널 (버튼 hover/click)
//  - Interactions : 레이캐스트 대상 등록·hover·click (VR 레이저, 마우스, 터치 공용)
//  - VRControls   : 양손 컨트롤러 모델, 레이저 포인터, 포물선 텔레포트, 스냅 턴
import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { FONT, roundRect, wrapText, Batch, solidMaterial } from './kit3d.js';

// ───────────────────────── UIPanel ─────────────────────────
const PX_W = 1024;
const PAD = 52;

export class UIPanel {
  /**
   * @param {{width?:number, onAction?:(id:string)=>void}} o width = 패널 가로(m)
   */
  constructor(o = {}) {
    this.width = o.width ?? 1.0;
    this.onAction = o.onAction || (() => {});
    this.canvas = document.createElement('canvas');
    this.canvas.width = PX_W;
    this.canvas.height = 640;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: this.texture, transparent: true, toneMapped: false, fog: false, side: THREE.DoubleSide }),
    );
    this.mesh.renderOrder = 30;
    this.mesh.visible = false;
    this.content = {};
    this.rects = [];
    this.hoverId = null;
    this.height = 0.6;
  }

  get visible() {
    return this.mesh.visible;
  }

  show() {
    this.mesh.visible = true;
  }

  hide() {
    this.mesh.visible = false;
    this.hoverId = null;
  }

  /**
   * @param {{badge?:string, accent?:string, title?:string, subtitle?:string, body?:string, bullets?:string[],
   *   buttons?:{id:string,label:string,sub?:string,color?:string,wide?:boolean}[], footer?:string}} content
   */
  set(content) {
    this.content = content;
    this.hoverId = null;
    this._draw();
  }

  _layout(ctx) {
    const c = this.content;
    const maxW = PX_W - PAD * 2;
    let y = PAD + 6;
    const items = [];
    if (c.badge) {
      items.push({ type: 'badge', y, text: c.badge });
      y += 62;
    }
    if (c.title) {
      ctx.font = `800 62px ${FONT}`;
      const lines = wrapText(ctx, c.title, maxW);
      for (const line of lines) {
        items.push({ type: 'title', y, text: line });
        y += 76;
      }
    }
    if (c.subtitle) {
      items.push({ type: 'subtitle', y, text: c.subtitle });
      y += 48;
    }
    if (c.body) {
      y += 10;
      ctx.font = `500 34px ${FONT}`;
      for (const line of wrapText(ctx, c.body, maxW)) {
        items.push({ type: 'body', y, text: line });
        y += 48;
      }
    }
    if (c.bullets?.length) {
      y += 8;
      ctx.font = `500 31px ${FONT}`;
      for (const bl of c.bullets) {
        const lines = wrapText(ctx, bl, maxW - 40);
        lines.forEach((line, i) => {
          items.push({ type: 'bullet', y, text: line, first: i === 0 });
          y += 44;
        });
      }
    }
    const rects = [];
    if (c.buttons?.length) {
      y += 22;
      const gap = 18;
      let col = 0;
      for (const btn of c.buttons) {
        const wide = btn.wide !== false;
        const h = btn.sub ? 118 : 96;
        if (wide) {
          if (col === 1) {
            y += h + gap;
            col = 0;
          }
          rects.push({ ...btn, x: PAD, y, w: maxW, h });
          y += h + gap;
        } else {
          const w = (maxW - gap) / 2;
          rects.push({ ...btn, x: PAD + col * (w + gap), y, w, h });
          col++;
          if (col === 2) {
            col = 0;
            y += h + gap;
          }
        }
      }
      if (col === 1) y += 96 + gap;
    }
    if (c.footer) {
      y += 6;
      ctx.font = `500 26px ${FONT}`;
      for (const line of wrapText(ctx, c.footer, maxW)) {
        items.push({ type: 'footer', y, text: line });
        y += 36;
      }
    }
    return { items, rects, height: Math.ceil(y + PAD - 12) };
  }

  _draw() {
    const c = this.content;
    const accent = c.accent || '#4fd6ff';
    const probe = this.ctx;
    const { items, rects, height } = this._layout(probe);
    if (this.canvas.height !== height) {
      this.canvas.height = height;
      this.texture.dispose(); // 크기가 바뀌면 GPU 텍스처 재할당
    }
    const ctx = this.ctx;
    const W = PX_W;
    const Hh = height;
    ctx.clearRect(0, 0, W, Hh);
    // 배경
    roundRect(ctx, 4, 4, W - 8, Hh - 8, 44);
    ctx.fillStyle = 'rgba(9, 16, 38, 0.95)';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = accent;
    ctx.stroke();
    ctx.save();
    roundRect(ctx, 4, 4, W - 8, Hh - 8, 44);
    ctx.clip();
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, W, 16);
    ctx.restore();

    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    for (const it of items) {
      if (it.type === 'badge') {
        ctx.font = `700 30px ${FONT}`;
        const w = ctx.measureText(it.text).width + 40;
        roundRect(ctx, PAD, it.y, w, 46, 23);
        ctx.fillStyle = accent;
        ctx.fill();
        ctx.fillStyle = '#06122b';
        ctx.fillText(it.text, PAD + 20, it.y + 8);
      } else if (it.type === 'title') {
        ctx.font = `800 62px ${FONT}`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(it.text, PAD, it.y);
      } else if (it.type === 'subtitle') {
        ctx.font = `600 32px ${FONT}`;
        ctx.fillStyle = '#9fc4ff';
        ctx.fillText(it.text, PAD, it.y);
      } else if (it.type === 'body') {
        ctx.font = `500 34px ${FONT}`;
        ctx.fillStyle = '#e8eeff';
        ctx.fillText(it.text, PAD, it.y);
      } else if (it.type === 'bullet') {
        ctx.font = `500 31px ${FONT}`;
        ctx.fillStyle = accent;
        if (it.first) ctx.fillText('●', PAD, it.y + 2);
        ctx.fillStyle = '#cfe0ff';
        ctx.fillText(it.text, PAD + 40, it.y);
      } else if (it.type === 'footer') {
        ctx.font = `500 26px ${FONT}`;
        ctx.fillStyle = '#8ea3cf';
        ctx.fillText(it.text, PAD, it.y);
      }
    }
    // 버튼
    ctx.textAlign = 'center';
    for (const r of rects) {
      const hover = this.hoverId === r.id;
      roundRect(ctx, r.x, r.y, r.w, r.h, 26);
      ctx.fillStyle = r.color || '#2563eb';
      ctx.fill();
      if (hover) {
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${r.sub ? 38 : 40}px ${FONT}`;
      let label = r.label;
      while (ctx.measureText(label).width > r.w - 30 && label.length > 4) label = label.slice(0, -2) + '…';
      ctx.fillText(label, r.x + r.w / 2, r.y + (r.sub ? 18 : r.h / 2 - 22));
      if (r.sub) {
        ctx.font = `500 26px ${FONT}`;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        let sub = r.sub;
        while (ctx.measureText(sub).width > r.w - 30 && sub.length > 4) sub = sub.slice(0, -2) + '…';
        ctx.fillText(sub, r.x + r.w / 2, r.y + 70);
      }
    }
    this.rects = rects;
    this.height = this.width * (Hh / W);
    this.mesh.scale.set(this.width, this.height, 1);
    this.texture.needsUpdate = true;
  }

  _hit(uv) {
    const x = uv.x * PX_W;
    const y = (1 - uv.y) * this.canvas.height;
    for (const r of this.rects) {
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r;
    }
    return null;
  }

  pointerMove(uv) {
    const r = uv ? this._hit(uv) : null;
    const id = r ? r.id : null;
    if (id !== this.hoverId) {
      this.hoverId = id;
      this._draw();
    }
    return !!r;
  }

  pointerLeave() {
    if (this.hoverId !== null) {
      this.hoverId = null;
      this._draw();
    }
  }

  click(uv) {
    const r = uv ? this._hit(uv) : null;
    if (r) this.onAction(r.id);
    return !!r;
  }

  /**
   * 사용자의 시선 앞에 패널 배치. 비VR(휴대폰 세로 화면 등)에서는 화면에 다 들어오도록 거리를 자동 조절한다.
   */
  placeInFront(camera, { distance = 1.05, xr = false, side = 0, lift = 0 } = {}) {
    const p = new THREE.Vector3();
    const d = new THREE.Vector3();
    camera.getWorldPosition(p);
    camera.getWorldDirection(d);
    let dist = distance;
    if (xr) {
      d.y = THREE.MathUtils.clamp(d.y, -0.3, 0.15);
      d.normalize();
    } else if (camera.isPerspectiveCamera) {
      const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      dist = Math.max(distance, (this.width / 2 / Math.tan(hHalf)) * 1.08, (this.height / 2 / Math.tan(vHalf)) * 1.12);
    }
    const right = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize();
    this.mesh.position.copy(p).addScaledVector(d, dist).addScaledVector(right, side);
    this.mesh.position.y += lift;
    this.mesh.lookAt(p);
    this.show();
  }
}

// ───────────────────────── Interactions ─────────────────────────
export class Interactions {
  constructor(scene) {
    this.scene = scene;
    this.targets = new Set();
    this.hovered = new Map();
  }

  /**
   * @param {THREE.Object3D} object
   * @param {{onClick?:Function, onHover?:Function, onMove?:Function}} handlers
   */
  add(object, handlers) {
    object.userData.ix = handlers;
    this.targets.add(object);
    return object;
  }

  /** UIPanel 을 레이캐스트 대상으로 등록 */
  addPanel(panel) {
    return this.add(panel.mesh, {
      onMove: (hit) => panel.pointerMove(hit.uv),
      onHover: (over) => {
        if (!over) panel.pointerLeave();
      },
      onClick: (hit) => panel.click(hit.uv),
    });
  }

  remove(object) {
    this.targets.delete(object);
  }

  removeTree(root) {
    for (const t of [...this.targets]) {
      let o = t;
      while (o) {
        if (o === root) {
          this.targets.delete(t);
          break;
        }
        o = o.parent;
      }
    }
  }

  _isLive(o) {
    while (o) {
      if (!o.visible) return false;
      if (o === this.scene) return true;
      o = o.parent;
    }
    return false;
  }

  pick(raycaster) {
    const live = [];
    for (const t of this.targets) if (this._isLive(t)) live.push(t);
    if (!live.length) return null;
    const hits = raycaster.intersectObjects(live, true);
    for (const hit of hits) {
      let o = hit.object;
      while (o && !this.targets.has(o)) o = o.parent;
      if (o) return { target: o, hit };
    }
    return null;
  }

  move(pointerId, raycaster) {
    const res = this.pick(raycaster);
    const prev = this.hovered.get(pointerId) || null;
    const cur = res ? res.target : null;
    if (prev !== cur) {
      if (prev && ![...this.hovered.entries()].some(([id, t]) => id !== pointerId && t === prev)) prev.userData.ix?.onHover?.(false);
      if (cur) cur.userData.ix?.onHover?.(true, res.hit);
      if (cur) this.hovered.set(pointerId, cur);
      else this.hovered.delete(pointerId);
    }
    if (cur) cur.userData.ix?.onMove?.(res.hit);
    return res;
  }

  leave(pointerId) {
    const prev = this.hovered.get(pointerId);
    if (prev) {
      this.hovered.delete(pointerId);
      if (![...this.hovered.values()].includes(prev)) prev.userData.ix?.onHover?.(false);
    }
  }

  click(raycaster) {
    const res = this.pick(raycaster);
    if (!res) return false;
    const handled = res.target.userData.ix?.onClick?.(res.hit);
    return handled !== false;
  }
}

// ───────────────────────── VRControls ─────────────────────────
const UP = new THREE.Vector3(0, 1, 0);
const SNAP_ANGLE = THREE.MathUtils.degToRad(30);
const ARC_STEPS = 48;

export async function isVRSupported() {
  try {
    return !!(navigator.xr && (await navigator.xr.isSessionSupported('immersive-vr')));
  } catch {
    return false;
  }
}

export class VRControls {
  /**
   * @param {{renderer:THREE.WebGLRenderer, scene:THREE.Scene, rig:THREE.Group, camera:THREE.Camera, ix:Interactions,
   *   onMenu?:Function, onInput?:Function, onTeleport?:Function}} o
   */
  constructor(o) {
    this.renderer = o.renderer;
    this.scene = o.scene;
    this.rig = o.rig;
    this.camera = o.camera;
    this.ix = o.ix;
    this.onMenu = o.onMenu || (() => {});
    this.onInput = o.onInput || (() => {});
    this.onTeleport = o.onTeleport || (() => {});
    this.teleportSurfaces = [];
    this.teleportEnabled = true;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 80;
    this._mat = new THREE.Matrix4();
    this._head = new THREE.Vector3();

    const factory = new XRControllerModelFactory();
    factory.setPath(`${import.meta.env.BASE_URL}xr-profiles`); // 로컬에 번들된 Quest 컨트롤러 모델
    this.hands = [0, 1].map((i) => this._makeHand(i, factory));

    // 텔레포트 포물선 + 착지 표시
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((ARC_STEPS + 1) * 3), 3));
    this.arc = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: 0x4fffd0, transparent: true, opacity: 0.95, fog: false, toneMapped: false }));
    this.arc.frustumCulled = false;
    this.arc.visible = false;
    this.arc.renderOrder = 40;
    const ringGeo = new THREE.RingGeometry(0.22, 0.3, 40);
    ringGeo.rotateX(-Math.PI / 2);
    this.marker = new THREE.Group();
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x4fffd0, transparent: true, opacity: 0.95, fog: false, toneMapped: false, side: THREE.DoubleSide }));
    const discGeo = new THREE.CircleGeometry(0.22, 32);
    discGeo.rotateX(-Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, new THREE.MeshBasicMaterial({ color: 0x4fffd0, transparent: true, opacity: 0.28, fog: false, toneMapped: false, side: THREE.DoubleSide }));
    this.marker.add(ring, disc);
    this.marker.visible = false;
    this.marker.renderOrder = 40;
    this.scene.add(this.arc, this.marker);
    this.arcTarget = null;
  }

  get presenting() {
    return this.renderer.xr.isPresenting;
  }

  /** immersive-vr 세션 시작 (Quest: 6DoF local-floor) */
  async enter() {
    const session = await navigator.xr.requestSession('immersive-vr', {
      optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'],
    });
    this.renderer.xr.setReferenceSpaceType('local-floor');
    await this.renderer.xr.setSession(session);
    return session;
  }

  _makeHand(i, factory) {
    const ray = this.renderer.xr.getController(i);
    const grip = this.renderer.xr.getControllerGrip(i);
    this.rig.add(ray, grip);
    const model = factory.createControllerModel(grip);
    grip.add(model);
    // 모델 로딩 전/실패 시 보여줄 기본 컨트롤러 도형
    const fb = new Batch();
    fb.add(new THREE.CylinderGeometry(0.018, 0.022, 0.11, 10), 0x2a2f3a, 0, -0.03, 0.04, Math.PI / 2.6);
    fb.add(new THREE.TorusGeometry(0.045, 0.008, 6, 20), 0xdfe5ee, 0, 0.0, -0.02, Math.PI / 2.4);
    fb.sphere(0.012, 0, 0.012, -0.005, 0x4fd6ff);
    const fallback = fb.build(solidMaterial());
    fallback.matrixAutoUpdate = true;
    grip.add(fallback);

    const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
    const laser = new THREE.Line(laserGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: false, toneMapped: false }));
    laser.frustumCulled = false;
    laser.visible = false;
    laser.renderOrder = 41;
    ray.add(laser);
    const cursor = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), new THREE.MeshBasicMaterial({ color: 0x4fd6ff, fog: false, toneMapped: false, depthTest: false }));
    cursor.visible = false;
    cursor.renderOrder = 42;
    this.scene.add(cursor);

    const hand = {
      index: i, ray, grip, model, fallback, laser, cursor,
      source: null, connected: false, snapReady: true, aiming: false, squeezing: false, prevButtons: [],
    };
    ray.addEventListener('connected', (e) => {
      hand.source = e.data;
      hand.connected = true;
      laser.visible = true;
    });
    ray.addEventListener('disconnected', () => {
      hand.source = null;
      hand.connected = false;
      hand.aiming = false;
      hand.squeezing = false;
      laser.visible = false;
      cursor.visible = false;
      this.ix.leave(`xr${i}`);
    });
    ray.addEventListener('selectstart', () => {
      this.onInput();
      if (hand.aiming || hand.squeezing) return;
      this._setRay(hand);
      if (this.ix.click(this.raycaster)) this._pulse(hand, 0.5, 35);
    });
    ray.addEventListener('squeezestart', () => {
      this.onInput();
      hand.squeezing = true;
    });
    ray.addEventListener('squeezeend', () => {
      if (hand.squeezing) {
        hand.squeezing = false;
        this._commitTeleport(hand);
      }
    });
    return hand;
  }

  _pulse(hand, strength, ms) {
    const gp = hand.source?.gamepad;
    try {
      if (gp?.hapticActuators?.[0]?.pulse) gp.hapticActuators[0].pulse(strength, ms);
      else if (gp?.vibrationActuator?.playEffect) gp.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: strength, weakMagnitude: strength });
    } catch {
      /* 햅틱 미지원 기기 */
    }
  }

  _setRay(hand) {
    hand.ray.updateWorldMatrix(true, false);
    this._mat.identity().extractRotation(hand.ray.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(hand.ray.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this._mat).normalize();
    this.raycaster.far = 80;
  }

  /** 바닥을 향한 포물선 계산 → 착지점 */
  _computeArc(hand) {
    this._setRay(hand);
    const p = this.raycaster.ray.origin.clone();
    const vel = this.raycaster.ray.direction.clone().multiplyScalar(7.5);
    const next = new THREE.Vector3();
    const seg = new THREE.Vector3();
    const pos = this.arc.geometry.attributes.position;
    const dt = 0.045;
    let n = 0;
    let target = null;
    pos.setXYZ(n++, p.x, p.y, p.z);
    const floorY = this.rig.position.y;
    for (let i = 0; i < ARC_STEPS; i++) {
      next.copy(p).addScaledVector(vel, dt);
      vel.y -= 9.8 * dt;
      seg.subVectors(next, p);
      const len = seg.length();
      this.raycaster.set(p, seg.divideScalar(len));
      this.raycaster.far = len;
      const hits = this.teleportSurfaces.length ? this.raycaster.intersectObjects(this.teleportSurfaces, false) : [];
      if (hits.length) {
        target = hits[0].point.clone();
        pos.setXYZ(n++, target.x, target.y, target.z);
        break;
      }
      pos.setXYZ(n++, next.x, next.y, next.z);
      p.copy(next);
      if (p.y < floorY - 6) break;
    }
    this.raycaster.far = 80;
    pos.needsUpdate = true;
    this.arc.geometry.setDrawRange(0, n);
    this.arc.material.color.setHex(target ? 0x4fffd0 : 0xff5a6a);
    this.arc.visible = true;
    this.marker.visible = !!target;
    if (target) this.marker.position.copy(target).setY(target.y + 0.02);
    this.arcTarget = target;
  }

  _commitTeleport(hand) {
    const target = this.arcTarget;
    this.arc.visible = false;
    this.marker.visible = false;
    this.arcTarget = null;
    if (!target || !this.teleportEnabled) return;
    this.camera.getWorldPosition(this._head);
    this.rig.position.x += target.x - this._head.x;
    this.rig.position.z += target.z - this._head.z;
    this.rig.position.y = target.y;
    this._pulse(hand, 0.3, 25);
    this.onTeleport(target);
  }

  /** 머리 위치를 축으로 리그 회전 (스냅 턴) */
  snapTurn(angle) {
    this.camera.getWorldPosition(this._head);
    this.rig.position.sub(this._head).applyAxisAngle(UP, angle).add(this._head);
    this.rig.rotation.y += angle;
  }

  update() {
    if (!this.presenting) {
      if (this.arc.visible) {
        this.arc.visible = false;
        this.marker.visible = false;
      }
      return;
    }
    let anyAiming = false;
    for (const hand of this.hands) {
      if (!hand.connected) continue;
      hand.fallback.visible = hand.model.children.length === 0;
      const gp = hand.source?.gamepad;
      let sx = 0;
      let sy = 0;
      if (gp) {
        const ax = gp.axes;
        if (ax.length >= 4) {
          sx = ax[2];
          sy = ax[3];
        } else if (ax.length >= 2) {
          sx = ax[0];
          sy = ax[1];
        }
        // 스냅 턴 (스틱 좌우)
        if (Math.abs(sx) > 0.65 && Math.abs(sy) < 0.6) {
          if (hand.snapReady) {
            hand.snapReady = false;
            this.snapTurn(sx > 0 ? -SNAP_ANGLE : SNAP_ANGLE);
            this.onInput();
          }
        } else if (Math.abs(sx) < 0.3) {
          hand.snapReady = true;
        }
        // A/X · B/Y 버튼 → 메뉴
        for (const bi of [4, 5]) {
          const pressed = !!gp.buttons[bi]?.pressed;
          if (pressed && !hand.prevButtons[bi]) {
            this.onInput();
            this.onMenu(hand.index);
          }
          hand.prevButtons[bi] = pressed;
        }
      }
      // 텔레포트 조준: 스틱을 앞으로 밀거나 그립을 쥐고 있는 동안
      const stickAim = this.teleportEnabled && sy < -0.6;
      if (stickAim && !hand.aiming) hand.aiming = true;
      const aimingNow = this.teleportEnabled && (hand.aiming || hand.squeezing);
      if (hand.aiming && !stickAim && Math.abs(sy) < 0.35) {
        hand.aiming = false;
        this._commitTeleport(hand);
      }
      if (aimingNow && (hand.aiming || hand.squeezing)) {
        anyAiming = true;
        this._computeArc(hand);
        hand.laser.visible = false;
        hand.cursor.visible = false;
        this.ix.leave(`xr${hand.index}`);
        continue;
      }
      // 레이저 포인터 + hover
      this._setRay(hand);
      const res = this.ix.move(`xr${hand.index}`, this.raycaster);
      const dist = res ? res.hit.distance : 4;
      hand.laser.visible = true;
      hand.laser.scale.z = dist;
      hand.laser.material.color.setHex(res ? 0x4fd6ff : 0xffffff);
      hand.laser.material.opacity = res ? 1 : 0.55;
      hand.cursor.visible = !!res;
      if (res) hand.cursor.position.copy(res.hit.point);
    }
    if (!anyAiming && this.arc.visible) {
      this.arc.visible = false;
      this.marker.visible = false;
    }
  }
}
