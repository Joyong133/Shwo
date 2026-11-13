// 부산 VR 여행 — 앱 진입점
//  허브(3D 부산 지도) ↔ 지하철/버스 탑승 ↔ 명소 장면 전환, VR(Quest)·휴대폰·PC 입력 통합
import * as THREE from 'three';
import {
  SPOTS, REGIONS, spotById, regionById, lineById, planSubwayTrip, planBusTrip, nextSpotByBus, nextSpotBySubway, HUB_STATION,
} from './busanData.js';
import { buildHub, buildSpotScene } from './proceduralScenes.js';
import { SubwaySystem } from './subwaySystem.js';
import { BusSystem } from './busSystem.js';
import { UIPanel, Interactions, VRControls, isVRSupported } from './vrMenu.js';
import { MobileControls, MobileHUD } from './mobileControls.js';
import { AudioEngine } from './audioEngine.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

// ───────────────────────── 렌더러 · 씬 · 카메라 리그 ─────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
try {
  renderer.xr.setFoveation(1); // Quest 고정 포비티드 렌더링
} catch {
  /* 미지원 브라우저 */
}
$('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050a1e);
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 6000);
const rig = new THREE.Group(); // 플레이어 리그: 텔레포트·스냅턴은 리그를 움직인다
rig.name = 'rig';
rig.add(camera);
scene.add(rig);

// 화면 페이드 (장면 전환 · VR에서도 동작하도록 카메라에 붙인 구)
const fadeMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: THREE.BackSide, fog: false });
const fadeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), fadeMat);
fadeMesh.renderOrder = 1000;
fadeMesh.visible = false;
fadeMesh.frustumCulled = false;
camera.add(fadeMesh);
let fade = null;
function fadeTo(target, duration = 0.45) {
  if (fade) fade.resolve();
  return new Promise((resolve) => {
    fade = { from: fadeMat.opacity, to: target, t: 0, duration, resolve };
    fadeMesh.visible = true;
  });
}
function updateFade(dt) {
  if (!fade) return;
  fade.t += dt;
  const k = Math.min(1, fade.t / fade.duration);
  fadeMat.opacity = fade.from + (fade.to - fade.from) * k;
  if (k >= 1) {
    const done = fade;
    fade = null;
    fadeMesh.visible = fadeMat.opacity > 0.001;
    done.resolve();
  }
}

// ───────────────────────── 시스템 ─────────────────────────
const audio = new AudioEngine();
const ix = new Interactions(scene);
const hub = buildHub();
const subway = new SubwaySystem({ audio, ix });
const bus = new BusSystem({
  audio,
  ix,
  blink: async (fn) => {
    await fadeTo(1, 0.3);
    fn();
    await fadeTo(0, 0.35);
  },
});
hub.map.root.add(subway.buildMapLayer(), bus.buildMapLayer());

const app = {
  mode: 'none', // 'hub' | 'spot' | 'subway' | 'bus'
  busy: false,
  queued: null,
  started: false,
  currentSpot: null, // 지금 있는 명소 id (허브에서는 null)
  selected: null, // 선택한 목적지 id
  scene: null,
  vrSupported: false,
};

const vr = new VRControls({
  renderer, scene, rig, camera, ix,
  onInput: () => audio.unlock(),
  onMenu: () => toggleMenu(),
  onTeleport: () => audio.click(),
});
const mobile = new MobileControls({ renderer, camera, rig, ix, onInput: () => audio.unlock() });
const hud = new MobileHUD({
  onMap: () => goHub(),
  onSpot: (id) => selectSpot(id),
  onSubway: () => quickRide('subway'),
  onBus: () => quickRide('bus'),
  onGyro: async () => {
    const res = await mobile.toggleGyro();
    hud.setGyro(res === 'on');
    hud.toast({ on: '자이로 켜짐 — 휴대폰을 움직여 둘러보세요', off: '자이로 꺼짐', denied: '모션 센서 권한이 거부되었습니다', unsupported: '이 기기는 자이로 센서를 지원하지 않습니다' }[res]);
  },
  onVR: () => enterVR(),
  onSkip: () => (app.mode === 'subway' ? subway.skip() : bus.skip()),
});
hud.buildSpotList(SPOTS, REGIONS);
audio.onSpeak = (text, ms) => hud.showSubtitle(text, ms + 900);
subway.onStatus = (text) => app.mode === 'subway' && hud.setMode('subway', '🚇 지하철 탑승 중', text);
bus.onStatus = (text) => app.mode === 'bus' && hud.setMode('bus', '🚌 버스 탑승 중', text);

// ───────────────────────── 3D 패널 (VR·모바일 공용) ─────────────────────────
const spotPanel = new UIPanel({ width: 0.92, onAction: onSpotAction }); // 목적지 선택
const arrivalPanel = new UIPanel({ width: 0.9, onAction: onArrivalAction }); // 명소 도착 안내
const menuPanel = new UIPanel({ width: 0.7, onAction: onMenuAction }); // A/X 버튼 메뉴
for (const p of [spotPanel, arrivalPanel, menuPanel]) {
  scene.add(p.mesh);
  ix.addPanel(p);
}
const infoPanel = new UIPanel({ width: 2.4 }); // 허브 안내판
infoPanel.set({
  badge: 'BUSAN · WebXR',
  accent: '#4fd6ff',
  title: '부산 VR 여행',
  subtitle: '지도 위 핀을 가리켜(탭하여) 명소를 선택하세요',
  bullets: [
    '지하철 1~4호선 열차와 시내버스 · 2층 시티투어버스가 지도 위를 실시간으로 달립니다',
    'VR: 트리거 = 선택 · 스틱 앞으로/그립 = 텔레포트 · 스틱 좌우 = 회전 · A/X = 메뉴',
    '휴대폰/PC: 드래그 = 둘러보기 · 탭/클릭 = 선택 · 하단 버튼 = 빠른 이동',
  ],
});
infoPanel.mesh.position.set(0, 2.25, -2.9);
infoPanel.mesh.rotation.x = 0.12;
infoPanel.show();
hub.group.add(infoPanel.mesh);

for (const pin of hub.map.pins.values()) {
  ix.add(pin.hit, {
    onHover: (over) => pin.setHover(over),
    onClick: () => selectSpot(pin.spot.id),
  });
}

function originStation() {
  return app.mode === 'spot' && app.currentSpot ? spotById(app.currentSpot).station.name : HUB_STATION;
}

function markSelected(id) {
  app.selected = id;
  for (const pin of hub.map.pins.values()) pin.setSelected(pin.spot.id === id);
}

/** 명소 선택 → 이동 방법 패널 */
function selectSpot(id) {
  if (app.busy || app.mode === 'subway' || app.mode === 'bus') return;
  const spot = spotById(id);
  if (!spot) return;
  audio.unlock();
  audio.click();
  if (app.mode === 'spot' && id === app.currentSpot) {
    hud.toast('지금 계신 곳입니다');
    return;
  }
  markSelected(id);
  menuPanel.hide();
  const region = regionById(spot.region);
  const line = lineById(spot.station.line);
  const trip = planSubwayTrip(originStation(), spot.station.name);
  const busTrip = planBusTrip(app.mode === 'spot' ? app.currentSpot : null, id);
  spotPanel.set({
    badge: region.name,
    accent: region.color,
    title: spot.name,
    subtitle: spot.nameEn,
    body: spot.desc,
    bullets: spot.highlights,
    buttons: [
      { id: 'subway', label: '🚇 지하철 타고 이동', sub: `${line.name} ${spot.station.name}역 하차 · ${trip.hops}개 역`, color: line.color },
      { id: 'bus', label: '🚌 버스 타고 이동', sub: `${busTrip.route.name} · ${spot.busStop} 하차`, color: busTrip.route.color },
      { id: 'warp', label: '⚡ 바로 이동', color: '#475569', wide: false },
      { id: 'close', label: '✕ 닫기', color: '#334155', wide: false },
    ],
  });
  spotPanel.placeInFront(camera, { xr: renderer.xr.isPresenting, distance: 1.0 });
}

function onSpotAction(id) {
  audio.click();
  const target = app.selected;
  if (id === 'close' || !target) {
    spotPanel.hide();
    markSelected(null);
  } else if (id === 'subway') rideSubway(target);
  else if (id === 'bus') rideBus(target);
  else if (id === 'warp') goSpot(target);
}

function onArrivalAction(id) {
  audio.click();
  if (id === 'map') goHub();
  else if (id === 'next-subway') rideSubway(nextSpotBySubway(app.currentSpot));
  else if (id === 'next-bus') rideBus(nextSpotByBus(app.currentSpot));
  else if (id === 'hide') arrivalPanel.hide();
}

/** HUD의 지하철/버스 버튼: 선택한 명소가 있으면 그곳으로, 명소에 있으면 다음 명소로 */
function quickRide(kind) {
  audio.unlock();
  if (app.mode === 'spot' && (!app.selected || app.selected === app.currentSpot)) {
    const next = kind === 'subway' ? nextSpotBySubway(app.currentSpot) : nextSpotByBus(app.currentSpot);
    return kind === 'subway' ? rideSubway(next) : rideBus(next);
  }
  if (!app.selected) {
    hud.toast('먼저 명소를 선택하세요 (지도 핀 또는 📍 명소)');
    hud.toggleSheet(true);
    return undefined;
  }
  return kind === 'subway' ? rideSubway(app.selected) : rideBus(app.selected);
}

// ── VR 메뉴 (A/X·B/Y 버튼) ──
function toggleMenu() {
  if (menuPanel.visible) {
    menuPanel.hide();
    return;
  }
  const buttons = [];
  if (app.mode === 'spot') {
    buttons.push({ id: 'map', label: '🗺 부산 지도로', color: '#2563eb' });
    buttons.push({ id: 'next-subway', label: '🚇 다음 명소', color: '#f06a00', wide: false });
    buttons.push({ id: 'next-bus', label: '🚌 다음 명소', color: '#e53935', wide: false });
  } else if (app.mode === 'bus') {
    buttons.push({ id: 'bell', label: '🔔 하차벨', color: '#dc2626', wide: false });
    buttons.push({ id: 'skip', label: '⏭ 건너뛰기', color: '#475569', wide: false });
  } else if (app.mode === 'subway') {
    buttons.push({ id: 'skip', label: '⏭ 건너뛰기 (바로 도착)', color: '#475569' });
  }
  buttons.push({ id: 'exit-vr', label: 'VR 종료', color: '#334155', wide: false });
  buttons.push({ id: 'close', label: '✕ 닫기', color: '#334155', wide: false });
  menuPanel.set({
    badge: '메뉴',
    accent: '#4fd6ff',
    title: { hub: '부산 전역 지도', spot: spotById(app.currentSpot)?.name || '명소', subway: '지하철 탑승 중', bus: '버스 탑승 중' }[app.mode] || '부산 VR',
    body: app.mode === 'hub' ? '지도 위 핀을 레이저로 가리키고 트리거를 누르세요.\n스틱을 앞으로 밀면 텔레포트, 좌우로 밀면 회전합니다.' : undefined,
    buttons,
  });
  menuPanel.placeInFront(camera, { xr: renderer.xr.isPresenting, distance: 0.85 });
}

function onMenuAction(id) {
  audio.click();
  menuPanel.hide();
  if (id === 'map') goHub();
  else if (id === 'next-subway') rideSubway(nextSpotBySubway(app.currentSpot));
  else if (id === 'next-bus') rideBus(nextSpotByBus(app.currentSpot));
  else if (id === 'bell') bus.pressBell();
  else if (id === 'skip') (app.mode === 'subway' ? subway : bus).skip();
  else if (id === 'exit-vr') renderer.xr.getSession()?.end();
}

// ───────────────────────── 장면 전환 ─────────────────────────
const nextFrame = () => new Promise((r) => setTimeout(r, 30));

async function transition(fn) {
  if (app.busy) {
    app.queued = fn; // 전환 중 요청은 끝난 뒤 이어서 실행
    return;
  }
  app.busy = true;
  try {
    await fadeTo(1, app.mode === 'none' ? 0.01 : 0.4);
    await fn();
    await nextFrame();
    await fadeTo(0, 0.55);
  } catch (err) {
    console.error('[busan-vr] 장면 전환 오류', err);
    await fadeTo(0, 0.2);
  } finally {
    app.busy = false;
  }
  if (app.queued) {
    const q = app.queued;
    app.queued = null;
    await transition(q);
  }
}

function leaveMode() {
  spotPanel.hide();
  arrivalPanel.hide();
  menuPanel.hide();
  audio.cancelSpeech();
  audio.stopLoops();
  for (const pin of hub.map.pins.values()) {
    pin.setHover(false);
    pin.setSelected(false);
  }
  if (app.mode === 'hub') scene.remove(hub.group);
  if (app.mode === 'spot' && app.scene) {
    scene.remove(app.scene.group);
    app.scene.dispose();
    app.scene = null;
  }
  if (app.mode === 'subway') {
    subway.stop();
    scene.remove(subway.ride.group);
  }
  if (app.mode === 'bus') {
    bus.stop();
    scene.remove(bus.group);
  }
  scene.fog = null;
}

function placeRig(x, z, yaw) {
  rig.position.set(x, 0, z);
  rig.rotation.set(0, yaw, 0);
}

/** 허브 시점: VR은 테이블 앞 바닥, 화면 모드는 지도가 한눈에 들어오는 높은 시점 */
function placeHubRig() {
  const xr = renderer.xr.isPresenting;
  placeRig(0, xr ? 2.55 : 2.0, 0);
  hub.map.setLabelScale(xr ? 1 : 1.45);
}

function goHub() {
  return transition(async () => {
    leaveMode();
    scene.add(hub.group);
    app.mode = 'hub';
    app.currentSpot = null;
    app.selected = null;
    placeHubRig();
    vr.teleportSurfaces = hub.teleportSurfaces;
    mobile.setView({ yaw: 0, pitch: -0.84, eyeHeight: 2.65 });
    mobile.bounds = { x: 0, z: 0, r: 9 };
    scene.background.setHex(0x050a1e);
    hud.setMode('hub', '부산 전역 지도', '핀을 눌러 명소를 선택하세요');
  });
}

function goSpot(id) {
  const spot = spotById(id);
  if (!spot) return undefined;
  return transition(async () => {
    leaveMode();
    const sc = buildSpotScene(spot);
    sc.hooks.sfx = (name) => audio[name]?.();
    app.scene = sc;
    scene.add(sc.group);
    app.mode = 'spot';
    app.currentSpot = id;
    app.selected = null;
    placeRig(sc.spawn.x, sc.spawn.z, sc.spawn.yaw);
    vr.teleportSurfaces = sc.teleportSurfaces;
    mobile.setView({ yaw: 0, pitch: 0, eyeHeight: 1.6 });
    mobile.bounds = { x: sc.spawn.x, z: sc.spawn.z, r: sc.bounds };
    scene.fog = new THREE.Fog(sc.fog.color, sc.fog.near, sc.fog.far);
    scene.background.setHex(sc.fog.color);
    audio.setLoop(sc.ambience, 0.7);

    const region = regionById(spot.region);
    const nextS = spotById(nextSpotBySubway(id));
    const nextB = spotById(nextSpotByBus(id));
    const busTrip = planBusTrip(id, nextB.id);
    arrivalPanel.set({
      badge: `${region.name} · 도착`,
      accent: region.color,
      title: spot.name,
      subtitle: spot.nameEn,
      body: spot.desc,
      bullets: spot.highlights,
      buttons: [
        { id: 'next-subway', label: `🚇 지하철 → ${nextS.name}`, sub: `${lineById(nextS.station.line).name} ${nextS.station.name}역`, color: lineById(nextS.station.line).color },
        { id: 'next-bus', label: `🚌 버스 → ${nextB.name}`, sub: busTrip.route.name, color: busTrip.route.color },
        { id: 'map', label: '🗺 부산 지도로', color: '#2563eb', wide: false },
        { id: 'hide', label: '✕ 닫기', color: '#334155', wide: false },
      ],
      footer: spot.panoramaUrl ? '360° 파노라마 이미지 사용 중' : undefined,
    });
    // 시야를 가리지 않도록 왼쪽 앞에 세워 둔다
    const off = new THREE.Vector3(-1.25, 1.45, -1.75).applyAxisAngle(new THREE.Vector3(0, 1, 0), sc.spawn.yaw);
    arrivalPanel.mesh.position.set(sc.spawn.x + off.x, off.y, sc.spawn.z + off.z);
    arrivalPanel.mesh.lookAt(sc.spawn.x, 1.5, sc.spawn.z);
    arrivalPanel.show();
    hud.setMode('spot', spot.name, `${region.name} · ${spot.nameEn}`);
    setTimeout(() => app.mode === 'spot' && app.currentSpot === id && audio.speak(`${spot.name}에 도착했습니다.`), 700);
  });
}

function rideSubway(toId) {
  const spot = spotById(toId);
  if (!spot || app.mode === 'subway' || app.mode === 'bus') return undefined;
  const plan = planSubwayTrip(originStation(), spot.station.name);
  return transition(async () => {
    leaveMode();
    subway.startRide(plan, { spot, onArrive: () => goSpot(toId) });
    scene.add(subway.ride.group);
    app.mode = 'subway';
    placeRig(subway.spawn.x, subway.spawn.z, subway.spawn.yaw);
    vr.teleportSurfaces = subway.teleportSurfaces;
    mobile.setView({ yaw: -0.45, pitch: -0.02, eyeHeight: 1.6 });
    mobile.bounds = { x: 0, z: 0, r: 0.9 };
    scene.fog = new THREE.Fog(subway.fog.color.getHex(), subway.fog.near, subway.fog.far);
    hud.setMode('subway', '🚇 지하철 탑승 중', `${plan.stops[0].name} → ${plan.stops[plan.stops.length - 1].name}`);
  });
}

function rideBus(toId) {
  const spot = spotById(toId);
  if (!spot || app.mode === 'subway' || app.mode === 'bus') return undefined;
  const plan = planBusTrip(app.mode === 'spot' ? app.currentSpot : null, toId);
  return transition(async () => {
    leaveMode();
    bus.startRide(plan, { onArrive: (spotId) => goSpot(spotId) });
    scene.add(bus.group);
    app.mode = 'bus';
    placeRig(bus.spawn.x, bus.spawn.z, bus.spawn.yaw);
    vr.teleportSurfaces = bus.teleportSurfaces;
    mobile.setView({ yaw: 0, pitch: plan.route.type === 'citytour' ? 0.1 : 0, eyeHeight: 1.62 });
    mobile.bounds = { x: bus.spawn.x, z: bus.spawn.z, r: 0.8 };
    scene.fog = new THREE.Fog(bus.fog.color.getHex(), bus.fog.near, bus.fog.far);
    hud.setMode('bus', '🚌 버스 탑승 중', plan.route.name);
  });
}

// ───────────────────────── VR 진입 · 시작 화면 ─────────────────────────
const startEl = $('start');
const statusEl = $('start-status');

function begin() {
  if (app.started) return;
  app.started = true;
  startEl.classList.add('out');
  hud.setVisible(!renderer.xr.isPresenting);
  audio.unlock();
  setTimeout(() => app.mode === 'hub' && audio.speak('부산 VR 여행에 오신 것을 환영합니다. 지도에서 가고 싶은 명소를 선택하세요.'), 600);
}

async function enterVR() {
  audio.unlock();
  if (renderer.xr.isPresenting) return true;
  try {
    await vr.enter();
    begin();
    return true;
  } catch (err) {
    statusEl.textContent = `VR 세션을 시작할 수 없습니다: ${err?.message || err}`;
    hud.toast('VR 세션을 시작할 수 없습니다');
    return false;
  }
}

renderer.xr.addEventListener('sessionstart', () => {
  hud.setVisible(false);
  begin();
  audio.unlock();
  if (app.mode === 'hub') placeHubRig();
});
renderer.xr.addEventListener('sessionend', () => {
  hud.setVisible(app.started);
  menuPanel.hide();
  camera.position.set(0, mobile.eyeHeight, 0);
  camera.scale.set(1, 1, 1);
  onResize();
  if (app.mode === 'hub') placeHubRig();
});

function onResize() {
  if (renderer.xr.isPresenting) return;
  camera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
  renderer.setSize(window.innerWidth, window.innerHeight);
  mobile.onResize();
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', () => setTimeout(onResize, 250));

$('start-2d').addEventListener('click', () => begin());
$('start-vr').addEventListener('click', () => enterVR());

// ───────────────────────── 메인 루프 ─────────────────────────
const clock = new THREE.Clock();
const camPos = new THREE.Vector3();
function applyFog(f) {
  if (!scene.fog) return;
  scene.fog.color.copy(f.color);
  scene.fog.near = f.near;
  scene.fog.far = f.far;
  scene.background.copy(f.color);
}

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;
  updateFade(dt);
  mobile.update(dt);
  vr.update(dt);
  camera.getWorldPosition(camPos);
  if (app.mode === 'hub') {
    hub.update(t, dt, camPos);
    subway.updateMap(t);
    bus.updateMap(t);
  } else if (app.mode === 'spot') {
    app.scene?.update(t, dt, camPos);
  } else if (app.mode === 'subway') {
    subway.update(dt, camPos);
    applyFog(subway.fog);
  } else if (app.mode === 'bus') {
    bus.update(dt, camPos);
    applyFog(bus.fog);
  }
  // 화면 모드(휴대폰·PC)에서는 열린 패널이 시야를 따라다니게 한다 (VR에서는 공간에 고정)
  if (!renderer.xr.isPresenting) {
    if (spotPanel.visible) spotPanel.placeInFront(camera, { distance: 1.0 });
    if (menuPanel.visible) menuPanel.placeInFront(camera, { distance: 0.85 });
  }
  audio.update(dt);
  renderer.render(scene, camera);
});

// ───────────────────────── 시작 ─────────────────────────
async function init() {
  await goHub();
  app.vrSupported = await isVRSupported();
  $('start-vr').hidden = !app.vrSupported;
  hud.setVRAvailable(app.vrSupported);
  statusEl.textContent = app.vrSupported
    ? 'VR 헤드셋이 감지되었습니다. "VR로 시작"을 누르세요.'
    : location.protocol === 'https:' || location.hostname === 'localhost'
      ? '이 기기에서는 화면 모드로 실행됩니다. (Quest 브라우저에서는 VR 버튼이 나타납니다)'
      : 'VR·자이로를 쓰려면 HTTPS 주소로 접속하세요.';

  // Quest APK(몰입형 PWA)로 실행된 경우: 사용자 조작 없이 곧바로 VR 진입 시도
  const fromApk = document.referrer.startsWith('android-app://') || window.matchMedia('(display-mode: standalone)').matches;
  const autoVR = async () => {
    if (!app.vrSupported || renderer.xr.isPresenting) return;
    try {
      await vr.enter();
    } catch {
      /* 사용자 제스처가 필요한 환경 → 시작 화면의 "VR로 시작" 버튼 사용 */
    }
  };
  window.addEventListener('busan-xr-granted', autoVR);
  if (window.__xrGranted || (fromApk && app.vrSupported)) autoVR();

  // 테스트용 딥링크: ?spot=haeundae / ?ride=subway&to=haeundae / ?ride=bus&to=gwangalli / ?autostart=1
  const spot = params.get('spot');
  const ride = params.get('ride');
  const to = params.get('to');
  if (params.has('autostart') || spot || ride) begin();
  if (ride === 'subway' && spotById(to)) await rideSubway(to);
  else if (ride === 'bus' && spotById(to)) await rideBus(to);
  else if (spot && spotById(spot)) await goSpot(spot);
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => undefined));
}

// 디버깅/자동 테스트용 핸들
window.__busan = { app, renderer, scene, camera, rig, hub, subway, bus, vr, mobile, hud, audio, ix, goHub, goSpot, rideSubway, rideBus, selectSpot, toggleMenu };

init().catch((err) => {
  console.error(err);
  statusEl.textContent = `초기화 오류: ${err?.message || err}`;
});
