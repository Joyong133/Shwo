// 휴대폰·PC 테스트용 조작 (VR 세션 중에는 자동으로 비활성)
//  - 터치/마우스 드래그 360도 회전, 핀치·휠 줌, 화면 탭 레이캐스팅(핀·하차벨·패널 버튼)
//  - 자이로스코프(DeviceOrientation, iOS 권한 요청 포함)
//  - PC: WASD/방향키 이동, Q/E 회전
//  - MobileHUD: 하단 퀵 HUD (VR 진입 시 자동 숨김)
import * as THREE from 'three';

const DEG = Math.PI / 180;
const _zee = new THREE.Vector3(0, 0, 1);
const _euler = new THREE.Euler();
const _q0 = new THREE.Quaternion();
const _q1 = new THREE.Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2); // 기기 좌표계 → 카메라 좌표계
const _fwd = new THREE.Vector3();
const _yawQ = new THREE.Quaternion();
const _up = new THREE.Vector3(0, 1, 0);

export class MobileControls {
  /**
   * @param {{renderer:THREE.WebGLRenderer, camera:THREE.PerspectiveCamera, rig:THREE.Group, ix:import('./vrMenu.js').Interactions, onInput?:Function}} o
   */
  constructor(o) {
    this.renderer = o.renderer;
    this.camera = o.camera;
    this.rig = o.rig;
    this.ix = o.ix;
    this.onInput = o.onInput || (() => {});
    this.dom = this.renderer.domElement;
    this.yaw = 0;
    this.pitch = 0;
    this.eyeHeight = 1.6;
    this.baseFov = 70;
    this.zoom = 1;
    this.bounds = null; // {x, z, r}
    this.walkEnabled = true;
    this.gyro = { enabled: false, hasData: false, alpha: 0, beta: 0, gamma: 0, yawOffset: 0, needsCalibrate: false };
    this.deviceQ = new THREE.Quaternion();
    this.keys = new Set();
    this.pointers = new Map();
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 80;
    this._ndc = new THREE.Vector2();
    this._pinch = 0;
    this._onOrient = (e) => {
      if (e.alpha === null && e.beta === null) return;
      this.gyro.alpha = (e.alpha || 0) * DEG;
      this.gyro.beta = (e.beta || 0) * DEG;
      this.gyro.gamma = (e.gamma || 0) * DEG;
      this.gyro.hasData = true;
    };
    this._bind();
    this.onResize();
  }

  get active() {
    return !this.renderer.xr.isPresenting;
  }

  _bind() {
    const dom = this.dom;
    dom.style.touchAction = 'none';
    dom.addEventListener('pointerdown', (e) => {
      if (!this.active) return;
      this.onInput();
      dom.setPointerCapture?.(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: 0 });
      if (this.pointers.size === 2) this._pinch = this._pinchDist();
    });
    dom.addEventListener('pointermove', (e) => {
      if (!this.active) return;
      const p = this.pointers.get(e.pointerId);
      if (!p) {
        if (e.pointerType === 'mouse') {
          this._setRay(e.clientX, e.clientY);
          const res = this.ix.move('mouse', this.raycaster);
          dom.style.cursor = res ? 'pointer' : 'grab';
        }
        return;
      }
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      p.moved += Math.abs(dx) + Math.abs(dy);
      if (this.pointers.size >= 2) {
        const d = this._pinchDist();
        if (this._pinch > 0 && d > 0) this.setZoom(this.zoom * (d / this._pinch));
        this._pinch = d;
        return;
      }
      const k = (this.camera.fov * DEG) / Math.max(1, dom.clientHeight);
      if (this.gyro.enabled && this.gyro.hasData) {
        this.gyro.yawOffset += dx * k;
      } else {
        this.yaw += dx * k;
        this.pitch = THREE.MathUtils.clamp(this.pitch + dy * k, -85 * DEG, 85 * DEG);
      }
    });
    const end = (e) => {
      const p = this.pointers.get(e.pointerId);
      if (!p) return;
      this.pointers.delete(e.pointerId);
      this._pinch = 0;
      if (!this.active) return;
      const quick = performance.now() - p.t < 450;
      if (e.type === 'pointerup' && quick && p.moved < 10) {
        // 탭 → 레이캐스트 클릭
        this._setRay(e.clientX, e.clientY);
        this.ix.move(e.pointerType === 'mouse' ? 'mouse' : 'touch', this.raycaster);
        this.ix.click(this.raycaster);
        if (e.pointerType !== 'mouse') this.ix.leave('touch');
      }
    };
    dom.addEventListener('pointerup', end);
    dom.addEventListener('pointercancel', end);
    dom.addEventListener('wheel', (e) => {
      if (!this.active) return;
      e.preventDefault();
      this.setZoom(this.zoom * (e.deltaY > 0 ? 0.92 : 1.08));
    }, { passive: false });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', (e) => {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      this.keys.add(e.code);
      this.onInput();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  _pinchDist() {
    const pts = [...this.pointers.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  _setRay(clientX, clientY) {
    const r = this.dom.getBoundingClientRect();
    this._ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this._ndc, this.camera);
  }

  setZoom(z) {
    this.zoom = THREE.MathUtils.clamp(z, 0.6, 2.6);
    this._applyFov();
  }

  _applyFov() {
    this.camera.fov = THREE.MathUtils.clamp(this.baseFov / this.zoom, 22, 105);
    this.camera.updateProjectionMatrix();
  }

  onResize() {
    // 세로 화면에서는 좌우 시야가 너무 좁아지지 않도록 수직 FOV를 넓힌다
    this.baseFov = this.camera.aspect < 1 ? 88 : 70;
    this._applyFov();
  }

  /** 장면 전환 시 시점 초기화 */
  setView({ yaw = 0, pitch = 0, eyeHeight = 1.6 } = {}) {
    this.yaw = yaw;
    this.pitch = pitch;
    this.eyeHeight = eyeHeight;
    this.zoom = 1;
    this._applyFov();
    this.gyro.needsCalibrate = true;
  }

  /** 자이로 켜기/끄기. 반드시 사용자 제스처(클릭) 안에서 호출해야 iOS 권한 창이 뜬다. */
  async toggleGyro() {
    if (this.gyro.enabled) {
      this._syncFromCamera();
      window.removeEventListener('deviceorientation', this._onOrient);
      this.gyro.enabled = false;
      return 'off';
    }
    if (typeof DeviceOrientationEvent === 'undefined') return 'unsupported';
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') return 'denied';
      } catch {
        return 'denied';
      }
    }
    this.gyro.hasData = false;
    this.gyro.needsCalibrate = true;
    window.addEventListener('deviceorientation', this._onOrient);
    this.gyro.enabled = true;
    await new Promise((r) => setTimeout(r, 900));
    if (!this.gyro.hasData) {
      window.removeEventListener('deviceorientation', this._onOrient);
      this.gyro.enabled = false;
      return 'unsupported';
    }
    return 'on';
  }

  _syncFromCamera() {
    this.camera.getWorldDirection(_fwd);
    _fwd.applyQuaternion(_q0.copy(this.rig.quaternion).invert());
    this.yaw = Math.atan2(-_fwd.x, -_fwd.z);
    this.pitch = Math.asin(THREE.MathUtils.clamp(_fwd.y, -1, 1));
  }

  _deviceQuaternion() {
    const orient = ((screen.orientation && screen.orientation.angle) || window.orientation || 0) * DEG;
    _euler.set(this.gyro.beta, this.gyro.alpha, -this.gyro.gamma, 'YXZ');
    this.deviceQ.setFromEuler(_euler);
    this.deviceQ.multiply(_q1);
    this.deviceQ.multiply(_q0.setFromAxisAngle(_zee, -orient));
    return this.deviceQ;
  }

  update(dt) {
    if (!this.active) return;
    const cam = this.camera;
    // PC 키보드
    const k = this.keys;
    if (k.has('KeyQ')) this._turn(1.6 * dt);
    if (k.has('KeyE')) this._turn(-1.6 * dt);
    let mx = 0;
    let mz = 0;
    if (k.has('KeyW') || k.has('ArrowUp')) mz -= 1;
    if (k.has('KeyS') || k.has('ArrowDown')) mz += 1;
    if (k.has('KeyA')) mx -= 1;
    if (k.has('KeyD')) mx += 1;
    if (k.has('ArrowLeft')) this._turn(1.6 * dt);
    if (k.has('ArrowRight')) this._turn(-1.6 * dt);

    cam.position.set(0, this.eyeHeight, 0);
    if (this.gyro.enabled && this.gyro.hasData) {
      const dq = this._deviceQuaternion();
      if (this.gyro.needsCalibrate) {
        // 자이로를 켠 순간 보고 있던 방향을 유지
        _fwd.set(0, 0, -1).applyQuaternion(dq);
        this.gyro.yawOffset = this.yaw - Math.atan2(-_fwd.x, -_fwd.z);
        this.gyro.needsCalibrate = false;
      }
      cam.quaternion.copy(_yawQ.setFromAxisAngle(_up, this.gyro.yawOffset)).multiply(dq);
    } else {
      cam.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    }

    if ((mx || mz) && this.walkEnabled) {
      cam.getWorldDirection(_fwd);
      _fwd.y = 0;
      if (_fwd.lengthSq() < 1e-6) return;
      _fwd.normalize();
      const speed = (k.has('ShiftLeft') ? 5 : 2.4) * dt;
      const rx = -_fwd.z;
      const rz = _fwd.x;
      this.rig.position.x += (_fwd.x * -mz + rx * mx) * speed;
      this.rig.position.z += (_fwd.z * -mz + rz * mx) * speed;
      if (this.bounds) {
        const dx = this.rig.position.x - this.bounds.x;
        const dz = this.rig.position.z - this.bounds.z;
        const d = Math.hypot(dx, dz);
        if (d > this.bounds.r) {
          this.rig.position.x = this.bounds.x + (dx / d) * this.bounds.r;
          this.rig.position.z = this.bounds.z + (dz / d) * this.bounds.r;
        }
      }
    }
  }

  _turn(a) {
    if (this.gyro.enabled && this.gyro.hasData) this.gyro.yawOffset += a;
    else this.yaw += a;
  }
}

// ───────────────────────── 하단 퀵 HUD (DOM) ─────────────────────────
export class MobileHUD {
  /**
   * @param {{onMap:Function, onSpot:(id:string)=>void, onSubway:Function, onBus:Function, onGyro:Function, onVR:Function, onSkip:Function, onSound?:Function}} actions
   */
  constructor(actions) {
    const $ = (id) => document.getElementById(id);
    this.root = $('hud');
    this.chip = $('hud-chip');
    this.chipTitle = $('hud-chip-title');
    this.chipSub = $('hud-chip-sub');
    this.subtitle = $('hud-subtitle');
    this.toastEl = $('hud-toast');
    this.sheet = $('hud-sheet');
    this.sheetList = $('hud-sheet-list');
    this.btn = {
      map: $('btn-map'), spots: $('btn-spots'), subway: $('btn-subway'), bus: $('btn-bus'),
      gyro: $('btn-gyro'), vr: $('btn-vr'), skip: $('btn-skip'),
    };
    this.actions = actions;
    this._toastTimer = 0;
    this._subTimer = 0;
    this.btn.map.addEventListener('click', () => actions.onMap());
    this.btn.subway.addEventListener('click', () => actions.onSubway());
    this.btn.bus.addEventListener('click', () => actions.onBus());
    this.btn.gyro.addEventListener('click', () => actions.onGyro());
    this.btn.vr.addEventListener('click', () => actions.onVR());
    this.btn.skip.addEventListener('click', () => actions.onSkip());
    this.btn.spots.addEventListener('click', () => this.toggleSheet());
    $('hud-sheet-close').addEventListener('click', () => this.toggleSheet(false));
  }

  setVisible(v) {
    this.root.hidden = !v;
    if (!v) this.toggleSheet(false);
  }

  /** 명소 목록 시트 구성 */
  buildSpotList(spots, regions) {
    this.sheetList.textContent = '';
    for (const region of regions) {
      const h = document.createElement('div');
      h.className = 'sheet-region';
      h.textContent = region.name;
      h.style.color = region.color;
      this.sheetList.appendChild(h);
      for (const spot of spots.filter((s) => s.region === region.id)) {
        const b = document.createElement('button');
        b.className = 'sheet-item';
        b.type = 'button';
        b.textContent = spot.name;
        b.style.borderColor = region.color;
        b.addEventListener('click', () => {
          this.toggleSheet(false);
          this.actions.onSpot(spot.id);
        });
        this.sheetList.appendChild(b);
      }
    }
  }

  toggleSheet(force) {
    const show = force ?? this.sheet.hidden;
    this.sheet.hidden = !show;
  }

  /** @param {'hub'|'spot'|'subway'|'bus'} mode */
  setMode(mode, title = '', sub = '') {
    this.chipTitle.textContent = title;
    this.chipSub.textContent = sub;
    this.chip.hidden = !title;
    const ride = mode === 'subway' || mode === 'bus';
    this.btn.map.hidden = mode === 'hub';
    this.btn.spots.hidden = ride;
    this.btn.subway.hidden = ride;
    this.btn.bus.hidden = ride;
    this.btn.skip.hidden = !ride;
    this.toggleSheet(false);
  }

  setVRAvailable(v) {
    this.btn.vr.hidden = !v;
  }

  setGyro(on) {
    this.btn.gyro.classList.toggle('on', on);
  }

  toast(text, ms = 2600) {
    this.toastEl.textContent = text;
    this.toastEl.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toastEl.classList.remove('show'), ms);
  }

  /** 안내방송 자막 */
  showSubtitle(text, ms = 5000) {
    this.subtitle.textContent = text;
    this.subtitle.classList.add('show');
    clearTimeout(this._subTimer);
    this._subTimer = setTimeout(() => this.subtitle.classList.remove('show'), ms);
  }
}
