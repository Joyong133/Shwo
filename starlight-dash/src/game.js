// 게임 본체: 플레이어 이동, 충돌, 파워업, 카메라, 한 판의 흐름.
import * as THREE from 'three';
import { Track } from './track.js';
import { Env } from './env.js';
import { Bursts } from './fx.js';
import { makeCharacter, disposeCharacter, animateCharacter } from './character.js';
import { UPGRADES, POWERUPS, upgradeValue } from './data.js';
import { vibrate } from './audio.js';
import { PATH_W, HALF_W, LANE_X, JUMP_V, GRAV, SLIDE_TIME, clamp, speedAt } from './const.js';

const CAM = {
  play: { back: 6.2, up: 4.0, side: 0, ahead: 12, lookY: 1.6 },
  home: { back: 5.0, up: 2.3, side: 2.3, ahead: 2.5, lookY: 1.9 },
  show: { back: -4.6, up: 1.6, side: 1.7, ahead: 0, lookY: -0.9 },
};
const CAM_KEYS = ['back', 'up', 'side', 'ahead', 'lookY'];
const FX_KEYS = ['magnet', 'shield', 'boost', 'double'];
const HEADSTART_DIST = 600;

const _v = new THREE.Vector3();
const _look = new THREE.Vector3();

export class Game {
  constructor({ canvas, save, sound, ui }) {
    this.save = save; this.sound = sound; this.ui = ui;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.5, 460);
    this.baseFov = 70;
    this.env = new Env(this.scene);
    this.track = new Track(this.scene);
    this.bursts = new Bursts(this.scene);

    // 플레이어 주변 효과
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2;
    this.scene.add(this.shadow);
    this.shield = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 2), new THREE.MeshBasicMaterial({ color: 0x6fd3ff, transparent: true, opacity: 0.3, depthWrite: false }));
    this.shield.visible = false;
    this.scene.add(this.shield);
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.05, 6, 28), new THREE.MeshBasicMaterial({ color: 0xff4f7b, transparent: true, opacity: 0.8 }));
    this.ring.rotation.x = Math.PI / 2;
    this.ring.visible = false;
    this.scene.add(this.ring);

    this.player = {
      seg: null, s: 0, x: 0, lane: 0, y: 0, vy: 0, grounded: true, sliding: 0, slideOnLand: false,
      jumpBuf: 0, coyote: 0, yaw: 0, visYaw: 0, pendingTurn: null, invuln: 0, carry: false, dead: null,
    };
    this.char = null;
    this.charId = null;
    this.pulled = [];
    this.speed = 0;
    this.time = 0;
    this.state = 'home';
    this.camMode = 'home';
    this.camCur = { ...CAM.home };
    this.camYaw = 0;
    this.camGround = 0;
    this.camFocus = new THREE.Vector3();
    this.shake = 0;
    this.fovKick = 0;
    this.run = this.newRun();
    this.bot = false;
    this.botRng = Math.random;
    this.lastT = 0;
    this.slow = 0; this.fast = 0;
    this.needsRender = true;

    this.setCharacter(save.data.char);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  newRun() {
    return {
      score: 0, dist: 0, coins: 0, jumps: 0, slides: 0, powerups: 0, turns: 0, biomes: 1,
      fx: { magnet: 0, shield: 0, boost: 0, double: 0 }, fxMax: { magnet: 1, shield: 1, boost: 1, double: 1 },
      headstart: 0, headOffer: 0, revives: 0, freeUsed: false, cheated: false, smashed: 0,
    };
  }

  get cheat() { return !!this.save.data.settings.cheat; }
  get mult() {
    const d = this.save.data;
    return 1 + d.up.mult + (d.char === 'kage' ? 1 : 0);
  }
  upgradeDur(id) {
    const def = UPGRADES.find((u) => u.id === id);
    let v = upgradeValue(def, this.save.data.up[id] || 0);
    if (id === 'boost' && this.save.data.char === 'nova') v *= 1.4;
    return v;
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    this.camera.aspect = aspect;
    // 세로 화면에서는 가로 시야각을 기준으로 맞춘다
    this.baseFov = aspect < 1 ? Math.min(92, (2 * Math.atan(Math.tan((50 * Math.PI) / 360) / aspect) * 180) / Math.PI) : 62;
    this.camera.fov = this.baseFov;
    this.camera.updateProjectionMatrix();
    this.needsRender = true;
  }

  setCharacter(id) {
    if (this.charId === id) return;
    if (this.char) { this.scene.remove(this.char.root); disposeCharacter(this.char); }
    this.char = makeCharacter(id, this.track.mat);
    this.charId = id;
    this.scene.add(this.char.root);
    this.needsRender = true;
  }

  setCamMode(mode) { this.camMode = mode; }

  // ───────── 흐름 ─────────
  resetPlayer() {
    const p = this.player, seg = this.track.current;
    p.seg = seg; p.s = 3; p.x = 0; p.lane = 0; p.y = seg.heightAt(3); p.vy = 0; p.grounded = true;
    p.sliding = 0; p.slideOnLand = false; p.jumpBuf = 0; p.coyote = 0; p.yaw = 0; p.visYaw = 0;
    p.pendingTurn = null; p.invuln = 0; p.carry = false; p.dead = null;
    this.pulled.length = 0;
    this.camYaw = 0;
    this.shake = 0;
    this.env.setBiome(seg.biome, true);
    this.char.j.pivotX = 0;
    this.char.root.rotation.set(0, 0, 0);
  }

  enterHome() {
    this.track.reset({ attract: true, startBiome: Math.floor(Math.random() * 6) });
    this.resetPlayer();
    this.setCharacter(this.save.data.char);
    this.state = 'home';
    this.camMode = 'home';
    this.speed = 11.5;
    this.updateCamera(0, true);
    this.sound.setMusic('menu');
    this.ui.showHome();
  }

  startRun() {
    this.sound.unlock();
    this.setCharacter(this.save.data.char);
    this.track.reset({ attract: false, startBiome: 0 });
    this.resetPlayer();
    this.run = this.newRun();
    const d = this.save.data;
    if (this.cheat) this.run.cheated = true;
    if (d.char === 'bolt') { this.run.fx.shield = this.run.fxMax.shield = this.upgradeDur('shield'); }
    if (d.items.headstart > 0) this.run.headOffer = 5;
    this.state = 'play';
    this.camMode = 'play';
    this.speed = 9;
    this.updateCamera(0, true);
    this.sound.setMusic('run');
    this.sound.sfx('go');
    this.ui.showHUD();
    this.ui.banner('출발!');
  }

  useHeadstart() {
    const d = this.save.data, run = this.run;
    if (this.state !== 'play' || run.headOffer <= 0 || d.items.headstart <= 0) return;
    d.items.headstart--;
    this.save.commit();
    run.headOffer = 0;
    run.headstart = HEADSTART_DIST;
    this.sound.sfx('boost');
    this.ui.banner('스타트 대시!');
  }

  pause() {
    if (this.state !== 'play') return;
    this.state = 'paused';
    this.sound.setMusic('off');
    this.ui.showPause();
  }

  resume() {
    if (this.state !== 'paused') return;
    this.ui.countdown(() => {
      if (this.state !== 'paused') return;
      this.state = 'play';
      this.lastT = 0;
      this.sound.setMusic('run');
    });
  }

  /** 일시정지 중 "처음부터 다시": 지금까지 모은 코인은 챙겨 준다. */
  restart() {
    if (this.state === 'paused') {
      const d = this.save.data;
      d.coins += this.run.coins;
      d.totalDist += Math.floor(this.run.dist);
      this.save.commit();
    }
    this.startRun();
  }

  quitRun() {
    if (this.state === 'paused' || this.state === 'play' || this.state === 'revive') this.finishRun();
  }

  die(type) {
    if (this.state !== 'play') return;
    const p = this.player;
    p.dead = type;
    this.state = 'dying';
    this.dieT = 0;
    p.sliding = 0;
    this.sound.sfx(type === 'fall' ? 'fall' : 'crash');
    vibrate(type === 'fall' ? 120 : 220, this.save.data.settings.vibrate);
    if (type === 'crash') {
      this.speed = -5;
      this.shake = 0.5;
      p.seg.toWorld(p.s, p.x, p.y + 1, _v);
      this.bursts.spawn(_v, 0xffffff, 14, { speed: 7, life: 0.6, size: 0.16 });
    }
  }

  afterDeath() {
    const run = this.run, d = this.save.data;
    const free = d.char === 'draco' && !run.freeUsed;
    if (run.revives < 2 && (free || d.items.revive > 0)) {
      this.state = 'revive';
      this.ui.showRevive({ free, count: d.items.revive }, () => this.revive(free), () => this.finishRun());
    } else this.finishRun();
  }

  revive(free) {
    const run = this.run, d = this.save.data, p = this.player;
    if (free) run.freeUsed = true; else { d.items.revive = Math.max(0, d.items.revive - 1); this.save.commit(); }
    run.revives++;
    let seg = p.seg;
    p.pendingTurn = null; p.dead = null;
    if (p.s > seg.len - PATH_W - 1) {
      // 코너에서 쓰러졌다면 코너를 돌려 놓는다
      p.s = seg.len - HALF_W; p.x = 0; p.lane = 0;
      this.doTurn(seg.turn === 'T' ? 'L' : seg.turn);
      seg = p.seg;
    }
    p.s = Math.max(p.s, 2);
    for (let g = 0; g < 60 && seg.holeMaskAt(p.s); g++) p.s += 1;
    p.s += 1.2;
    p.x = LANE_X[p.lane + 1];
    p.y = seg.heightAt(p.s); p.vy = 0; p.grounded = true; p.sliding = 0; p.slideOnLand = false; p.jumpBuf = 0;
    p.invuln = 3;
    this.char.j.pivotX = 0;
    this.speed = speedAt(run.dist) * 0.5;
    this.state = 'play';
    this.lastT = 0;
    this.sound.sfx('revive');
    this.sound.setMusic('run');
    this.ui.showHUD(true);
    this.ui.banner('다시 달려요!');
  }

  finishRun() {
    const run = this.run, d = this.save.data;
    this.state = 'over';
    const score = Math.floor(run.score), dist = Math.floor(run.dist);
    let record = false;
    if (!run.cheated) {
      if (score > d.best) { d.best = score; record = d.runs > 0; }
      d.bestDist = Math.max(d.bestDist, dist);
    }
    d.coins += run.coins;
    d.totalDist += dist;
    d.runs++;
    const missions = run.cheated ? [] : this.save.applyRun({
      coins: run.coins, dist, score, biomes: run.biomes, jumps: run.jumps, slides: run.slides, powerups: run.powerups, turns: run.turns,
    });
    this.save.commit();
    this.sound.setMusic('menu');
    this.sound.sfx(record ? 'record' : missions.length ? 'mission' : 'click');
    this.ui.showResult({ score, dist, coins: run.coins, best: d.best, record, cheated: run.cheated, missions });
  }

  // ───────── 입력 ─────────
  input(act) {
    if (act === 'pause') { if (this.state === 'play') this.pause(); else if (this.state === 'paused') this.resume(); return; }
    if (this.state !== 'play') return;
    const p = this.player;
    if (act === 'left' || act === 'right') {
      const dir = act === 'left' ? -1 : 1, want = dir < 0 ? 'L' : 'R', seg = p.seg;
      if (p.s >= seg.turnZoneStart && (seg.turn === 'T' || seg.turn === want)) { p.pendingTurn = want; return; }
      const nl = clamp(p.lane + dir, -1, 1);
      if (nl !== p.lane) { p.lane = nl; this.sound.sfx('lane'); }
    } else if (act === 'up') this.jump();
    else if (act === 'down') this.slide();
  }

  jump() {
    const p = this.player;
    if (p.grounded || p.coyote > 0) {
      p.vy = JUMP_V; p.grounded = false; p.coyote = 0; p.sliding = 0; p.slideOnLand = false; p.jumpBuf = 0;
      this.run.jumps++;
      this.sound.sfx('jump');
    } else p.jumpBuf = 0.14;
  }

  slide() {
    const p = this.player;
    if (p.grounded) {
      p.sliding = SLIDE_TIME;
      this.run.slides++;
      this.sound.sfx('slide');
    } else { p.vy = Math.min(p.vy, -22); p.slideOnLand = true; }
  }

  onLand() {
    const p = this.player;
    if (p.slideOnLand) { p.slideOnLand = false; p.sliding = SLIDE_TIME * 0.8; this.run.slides++; this.sound.sfx('slide'); }
    else this.sound.sfx('land');
    if (p.jumpBuf > 0) this.jump();
  }

  doTurn(dir) {
    const p = this.player, seg = p.seg;
    const child = seg.children[dir] || seg.children.L || seg.children.R;
    const mid = seg.len - HALF_W;
    let ns, nx;
    if (dir === 'R') { ns = p.x + HALF_W; nx = mid - p.s; p.yaw -= Math.PI / 2; }
    else { ns = HALF_W - p.x; nx = p.s - mid; p.yaw += Math.PI / 2; }
    // 끌려오던 코인은 바로 획득 처리
    for (const c of this.pulled) this.collectCoin(c);
    this.pulled.length = 0;
    p.seg = child; p.s = ns; p.x = clamp(nx, -HALF_W + 0.6, HALF_W - 0.6);
    p.lane = clamp(Math.round(p.x / LANE_X[2]), -1, 1);
    p.pendingTurn = null;
    this.track.advance(child);
    if (this.state === 'play') {
      this.run.turns++;
      this.sound.sfx('turn');
      const hints = this.save.data.hints;
      if (hints.turn < 6) hints.turn++;
    }
    if (child.biome !== this.env.tgt) {
      this.env.setBiome(child.biome);
      if (this.state === 'play') { this.run.biomes++; this.ui.banner(child.biome.name); }
    }
  }

  collectCoin(c) {
    if (c.got) return;
    c.got = true;
    if (this.state !== 'play' && this.state !== 'dying') return;
    const run = this.run;
    run.coins += run.fx.double > 0 ? 2 : 1;
    run.score += 5 * this.mult;
    this.sound.sfx('coin');
  }

  givePower(type) {
    const run = this.run;
    const dur = this.upgradeDur(type);
    run.fx[type] = dur; run.fxMax[type] = dur;
    run.powerups++;
    this.sound.sfx(type === 'boost' ? 'boost' : 'power');
    vibrate(30, this.save.data.settings.vibrate);
    this.ui.banner(POWERUPS[type].name + '!');
  }

  smash(o, seg) {
    o.alive = false;
    if (o.mesh) o.mesh.visible = false;
    seg.toWorld(o.s, LANE_X[o.lane], seg.heightAt(o.s) + 1, _v);
    this.bursts.spawn(_v, seg.biome.pal.smash, 12, { speed: 8, life: 0.7, size: 0.3, up: 5 });
    this.sound.sfx('smash');
    this.shake = Math.max(this.shake, 0.18);
  }

  // ───────── 한 스텝(물리) ─────────
  step(dt) {
    const p = this.player, run = this.run;
    const playing = this.state === 'play';
    let seg = p.seg;

    const power = playing && (run.headstart > 0 || run.fx.boost > 0);
    const cheat = playing && this.cheat;
    const prot = !playing || power || cheat || p.invuln > 0;

    // 속도
    let target = 11.5;
    if (playing) {
      target = speedAt(run.dist);
      if (run.headstart > 0) target = 44;
      else if (run.fx.boost > 0) target = Math.max(target * 1.7, 32);
    }
    this.speed += (target - this.speed) * Math.min(1, dt * 3.5);
    const ds = this.speed * dt;
    p.s += ds;
    if (playing) {
      run.dist += ds;
      run.score += ds * this.mult;
      if (run.headstart > 0) { run.headstart -= ds; if (run.headstart <= 0) { run.headstart = 0; p.invuln = Math.max(p.invuln, 1.5); } }
    }

    // 좌우
    const mv = (14 + this.speed * 0.25) * dt;
    p.x += clamp(LANE_X[p.lane + 1] - p.x, -mv, mv);

    // 코너
    const auto = !playing || power || cheat;
    if (auto && !p.pendingTurn && p.s >= seg.len - HALF_W) {
      p.pendingTurn = seg.turn === 'T' ? (Math.random() < 0.5 ? 'L' : 'R') : seg.turn;
    }
    if (p.pendingTurn) {
      const sg = p.pendingTurn === 'R' ? 1 : -1;
      const sExec = Math.max(seg.len - HALF_W - sg * p.x, seg.len - PATH_W + 0.3);
      if (p.s >= sExec) { this.doTurn(p.pendingTurn); seg = p.seg; }
    } else if (p.s >= seg.len - 0.45) {
      p.s = seg.len - 0.45;
      this.die('crash');
      return;
    }

    // 높이
    const g = seg.heightAt(p.s);
    const overHole = seg.holeAt(p.s, p.x);
    if (prot) p.carry = true;
    else if (p.carry && !overHole && p.grounded) p.carry = false;
    const hole = overHole && !(prot || p.carry);
    if (p.grounded) {
      if (hole) { p.grounded = false; p.vy = 0; p.coyote = 0.08; }
      else p.y = g;
    }
    if (!p.grounded) {
      p.vy = Math.max(-42, p.vy - GRAV * dt);
      p.y += p.vy * dt;
      p.coyote -= dt;
      if (!hole && p.y <= g && (p.vy <= 0 || p.y < g - 0.02)) {
        if (p.y >= g - 0.6) { p.y = g; p.vy = 0; p.grounded = true; this.onLand(); }
        else { this.die('fall'); return; }
      } else if (hole && p.y < g - 1.3) { this.die('fall'); return; }
    }
    if (p.sliding > 0) p.sliding -= dt;
    if (p.jumpBuf > 0) p.jumpBuf -= dt;
    if (p.invuln > 0) p.invuln -= dt;

    // 장애물
    const obs = seg.obstacles;
    while (seg.obIdx < obs.length && obs[seg.obIdx].s + 1.2 < p.s) seg.obIdx++;
    for (let i = seg.obIdx; i < obs.length; i++) {
      const o = obs[i];
      if (o.s - o.half - 0.3 > p.s) break;
      if (!o.alive) continue;
      if (Math.abs(p.s - o.s) < o.half + 0.3 && Math.abs(p.x - LANE_X[o.lane]) < 1.0) {
        const rel = p.y - seg.heightAt(o.s);
        const hit = o.type === 'block' || (o.type === 'low' && rel < 0.8) || (o.type === 'high' && rel + (p.sliding > 0 ? 0.75 : 1.7) > 1.25);
        if (!hit) continue;
        if (!playing) continue;
        if (power || cheat || p.invuln > 0) { this.smash(o, seg); run.smashed++; }
        else if (run.fx.shield > 0) {
          this.smash(o, seg);
          run.fx.shield = 0;
          p.invuln = 1.2;
          this.sound.sfx('shieldbreak');
          vibrate(60, this.save.data.settings.vibrate);
        } else { this.die('crash'); return; }
      }
    }

    // 코인
    const magnet = playing && (run.fx.magnet > 0 || power);
    const mr = magnet ? 7 * (this.save.data.char === 'koko' ? 1.4 : 1) : 0;
    const cs = seg.coins;
    while (seg.coinIdx < cs.length && cs[seg.coinIdx].s < p.s - 3) seg.coinIdx++;
    const reach = Math.max(1.2, mr + 1);
    const py = p.y + 0.9;
    for (let i = seg.coinIdx; i < cs.length; i++) {
      const c = cs[i];
      if (c.s - p.s > reach) break;
      if (c.got || c.pull) continue;
      const dsx = c.s - p.s, dx = c.x - p.x, dy = c.y - py;
      if (Math.abs(dsx) < 0.95 && Math.abs(dx) < 1.05 && Math.abs(dy) < 1.3) this.collectCoin(c);
      else if (magnet && dsx * dsx + dx * dx < mr * mr) { c.pull = true; this.pulled.push(c); }
    }
    for (let i = this.pulled.length - 1; i >= 0; i--) {
      const c = this.pulled[i];
      const dx = p.x - c.x, dsx = p.s + 0.3 - c.s, dy = py - c.y;
      const dist = Math.hypot(dx, dsx, dy), stepLen = (this.speed + 24) * dt;
      if (dist < stepLen + 0.5) { this.collectCoin(c); this.pulled.splice(i, 1); }
      else { c.x += (dx / dist) * stepLen; c.s += (dsx / dist) * stepLen; c.y += (dy / dist) * stepLen; }
    }

    // 파워업 아이템
    if (playing) {
      for (const k of seg.pickups) {
        if (k.got || !k.obj) continue;
        if (Math.abs(k.s - p.s) < 1.1 && Math.abs(LANE_X[k.lane] - p.x) < 1.2 && Math.abs(k.y - py) < 1.9) {
          k.got = true;
          k.obj.visible = false;
          this.givePower(k.type);
        }
      }
    }
  }

  // ───────── 프레임 ─────────
  frame(now) {
    const t = now / 1000;
    let dt = this.lastT ? t - this.lastT : 1 / 60;
    this.lastT = t;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    const st = this.state;

    if (st === 'paused' || st === 'over' || st === 'revive') {
      if (this.needsRender) { this.renderer.render(this.scene, this.camera); this.needsRender = false; }
      return;
    }
    this.needsRender = true;
    this.time += dt;
    this.adaptQuality(dt);

    const p = this.player, run = this.run;
    if (st === 'play' || st === 'home') {
      if (this.bot && st === 'play') this.botThink();
      const n = Math.max(1, Math.ceil((dt * Math.max(this.speed, 10)) / 0.35));
      const h = dt / n;
      for (let i = 0; i < n && (this.state === 'play' || this.state === 'home'); i++) this.step(h);
      if (this.state === 'play') this.tickRun(dt);
    } else if (st === 'dying') {
      this.dieT += dt;
      const seg = p.seg;
      if (p.dead === 'crash') {
        this.speed *= Math.exp(-dt * 5);
        p.s += this.speed * dt;
        const g = seg.heightAt(p.s);
        if (p.y > g) { p.vy -= GRAV * dt; p.y = Math.max(g, p.y + p.vy * dt); }
      } else {
        this.speed *= Math.exp(-dt * 2.5);
        p.s += this.speed * dt;
        p.vy = Math.max(-42, p.vy - GRAV * dt);
        p.y += p.vy * dt;
      }
      if (this.dieT > 1.15) this.afterDeath();
    }

    this.track.update(p.s, this.time);
    this.bursts.update(dt);
    this.updateVisuals(dt);
    this.updateCamera(dt, false);
    this.env.update(dt, this.camFocus, this.camera, this.time);
    this.renderer.render(this.scene, this.camera);
    if (this.state === 'play' || this.state === 'dying') this.ui.updateHUD(run, this);
  }

  /** 파워업 시간, 안내 등 프레임 단위 갱신. */
  tickRun(dt) {
    const run = this.run, p = this.player;
    if (this.cheat) run.cheated = true;
    for (const k of FX_KEYS) {
      if (run.fx[k] > 0) {
        run.fx[k] -= dt;
        if (run.fx[k] <= 0) {
          run.fx[k] = 0;
          if (k === 'boost') p.invuln = Math.max(p.invuln, 1.5);
        }
      }
    }
    if (run.headOffer > 0) run.headOffer -= dt;
    this.updateHints();
    // 부스터 중에는 별가루를 뿌린다
    if ((run.fx.boost > 0 || run.headstart > 0) && Math.random() < 0.6) {
      p.seg.toWorld(p.s + 0.4, p.x, p.y + 0.8, _v);
      this.bursts.spawn(_v, 0xffd23f, 1, { speed: 1.2, life: 0.45, size: 0.09, gravity: -2, up: 1, spread: 0.7 });
    }
  }

  updateHints() {
    const h = this.save.data.hints, p = this.player, seg = p.seg;
    if (h.jump >= 3 && h.slide >= 3 && h.lane >= 3 && h.turn >= 4) return;
    if (this.cheat || this.run.headstart > 0 || this.run.fx.boost > 0) return;
    const lookA = this.speed * 0.35, lookB = this.speed * 1.0;
    if (h.turn < 4 && p.s >= seg.turnZoneStart && !p.pendingTurn) {
      this.ui.hint(seg.turn === 'T' ? 'both' : seg.turn === 'L' ? 'left' : 'right', '코너! 옆으로 스와이프');
      return;
    }
    for (const hole of seg.holes) {
      const d = hole.s0 - p.s;
      if (d > lookA && d < lookB && !hole.hinted && hole.mask[p.lane + 1]) {
        if (hole.mask.every(Boolean)) { if (h.jump < 3) { hole.hinted = true; h.jump++; this.ui.hint('up', '위로 스와이프 — 점프'); } }
        else if (h.lane < 3) { hole.hinted = true; h.lane++; this.ui.hint(hole.mask[1] ? (hole.mask[0] ? 'right' : 'left') : (p.lane < 0 ? 'right' : 'left'), '길이 끊겼어요! 옆으로'); }
        return;
      }
    }
    for (let i = seg.obIdx; i < seg.obstacles.length; i++) {
      const o = seg.obstacles[i], d = o.s - p.s;
      if (d > lookB) break;
      if (d < lookA || o.hinted || o.lane !== p.lane + 1) continue;
      o.hinted = true;
      if (o.type === 'low' && h.jump < 3) { h.jump++; this.ui.hint('up', '위로 스와이프 — 점프'); }
      else if (o.type === 'high' && h.slide < 3) { h.slide++; this.ui.hint('down', '아래로 스와이프 — 슬라이드'); }
      else if (o.type === 'block' && h.lane < 3) {
        h.lane++;
        const row = seg.obstacles.filter((q) => q.s === o.s && q.type === 'block').map((q) => q.lane - 1);
        const dir = p.lane >= 1 || (p.lane === 0 && row.includes(1)) ? 'left' : 'right';
        this.ui.hint(dir, '옆으로 스와이프 — 피하기');
      }
      return;
    }
  }

  updateVisuals(dt) {
    const p = this.player, ch = this.char, run = this.run, seg = p.seg;
    seg.toWorld(p.s, p.x, p.y, _v);
    ch.root.position.copy(_v);
    p.visYaw += (p.yaw - p.visYaw) * (1 - Math.exp(-dt * 16));
    ch.root.rotation.y = p.visYaw;
    const leanT = this.state === 'play' || this.state === 'home' ? clamp((LANE_X[p.lane + 1] - p.x) * -0.2, -0.35, 0.35) : 0;
    ch.root.rotation.z += (leanT - ch.root.rotation.z) * (1 - Math.exp(-dt * 14));

    let mode = 'run';
    if (p.dead === 'crash') mode = 'crash';
    else if (p.dead === 'fall') mode = 'fall';
    else if (!p.grounded) mode = p.vy < -3 && p.y < seg.heightAt(p.s) - 0.1 ? 'fall' : 'jump';
    else if (p.sliding > 0) mode = 'slide';
    animateCharacter(ch, dt, { mode, speed: this.speed });
    if (p.dead === 'fall') ch.root.rotation.x += dt * 5; else ch.root.rotation.x = 0;
    // 부활 직후 깜빡임
    ch.root.visible = !(p.invuln > 0 && this.state === 'play' && Math.floor(this.time * 14) % 2 === 0 && !(run.fx.boost > 0 || run.headstart > 0));

    const g = seg.heightAt(p.s);
    const onHole = seg.holeAt(p.s, p.x);
    this.shadow.visible = !onHole && p.y >= g - 0.1;
    if (this.shadow.visible) {
      this.shadow.position.set(_v.x, g + 0.03, _v.z);
      const k = clamp(1 - (p.y - g) * 0.25, 0.4, 1);
      this.shadow.scale.setScalar(k);
    }
    const playing = this.state === 'play';
    this.shield.visible = playing && run.fx.shield > 0;
    if (this.shield.visible) {
      this.shield.position.set(_v.x, _v.y + 0.9, _v.z);
      this.shield.rotation.y = this.time * 1.2;
      const warn = run.fx.shield < 2 ? 0.16 + 0.14 * Math.abs(Math.sin(this.time * 10)) : 0.3;
      this.shield.material.opacity = warn;
    }
    this.ring.visible = playing && run.fx.magnet > 0;
    if (this.ring.visible) {
      this.ring.position.set(_v.x, _v.y + 0.9 + Math.sin(this.time * 5) * 0.25, _v.z);
      this.ring.rotation.z = this.time * 3;
    }
  }

  updateCamera(dt, snap) {
    const p = this.player, m = CAM[this.camMode], c = this.camCur, seg = p.seg;
    const k = snap ? 1 : 1 - Math.exp(-dt * 4);
    for (const key of CAM_KEYS) c[key] += (m[key] - c[key]) * k;
    this.camYaw += (p.yaw - this.camYaw) * (snap ? 1 : 1 - Math.exp(-dt * 8));
    const g = seg.heightAt(p.s);
    this.camGround += (g - this.camGround) * (snap ? 1 : 1 - Math.exp(-dt * 6));
    const fy = this.camGround + Math.max(0, p.y - g) * 0.35;
    seg.toWorld(p.s, p.x * 0.6, fy, _v);
    if (snap) this.camFocus.copy(_v); else this.camFocus.lerp(_v, 1 - Math.exp(-dt * 16));
    const sy = Math.sin(this.camYaw), cy = Math.cos(this.camYaw), f = this.camFocus;
    let side = c.side;
    if (this.camMode === 'home') side += Math.sin(this.time * 0.35) * 0.5;
    this.camera.position.set(f.x + side * cy + c.back * sy, f.y + c.up, f.z - side * sy + c.back * cy);
    _look.set(f.x - c.ahead * sy, f.y + c.lookY, f.z - c.ahead * cy);
    if (this.shake > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * this.shake;
      this.camera.position.y += (Math.random() - 0.5) * this.shake;
      this.shake *= Math.exp(-dt * 7);
    }
    this.camera.lookAt(_look);
    const boosting = this.state === 'play' && (this.run.fx.boost > 0 || this.run.headstart > 0);
    this.fovKick += ((boosting ? 9 : 0) - this.fovKick) * (1 - Math.exp(-dt * 4));
    const fov = Math.min(100, this.baseFov + this.fovKick);
    if (Math.abs(fov - this.camera.fov) > 0.05) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); }
  }

  /** 프레임이 느리면 해상도를 낮춘다. */
  adaptQuality(dt) {
    if (dt > 0.024) this.slow += dt; else this.slow = Math.max(0, this.slow - dt * 0.5);
    if (this.slow > 1.5 && this.pixelRatio > 1) {
      this.pixelRatio = Math.max(1, this.pixelRatio - 0.25);
      this.slow = 0;
      this.resize();
    }
  }

  // ───────── 자동 플레이(테스트용) ─────────
  botThink() {
    const p = this.player, seg = p.seg, v = this.speed;
    if (p.s >= seg.turnZoneStart + 1 && !p.pendingTurn) {
      this.input(seg.turn === 'T' ? (this.botRng() < 0.5 ? 'left' : 'right') : seg.turn === 'L' ? 'left' : 'right');
      return;
    }
    const li = p.lane + 1;
    // 앞쪽에서 차선을 막는 것(기둥·끊긴 길)을 찾아 비킨다
    const horizon = v * 0.75 + 3;
    const blocked = [false, false, false];
    const cost = [0, 0, 0];
    for (let i = seg.obIdx; i < seg.obstacles.length; i++) {
      const o = seg.obstacles[i];
      if (o.s - p.s > horizon) break;
      if (!o.alive || o.s < p.s - 0.8) continue;
      if (o.type === 'block') blocked[o.lane] = true; else cost[o.lane] += 1;
    }
    for (const h of seg.holes) {
      if (h.s1 < p.s || h.s0 - p.s > horizon) continue;
      if (h.mask.every(Boolean)) continue;
      for (let i = 0; i < 3; i++) if (h.mask[i]) blocked[i] = true;
    }
    if (blocked[li]) {
      const cand = [li - 1, li + 1, li - 2, li + 2].filter((i) => i >= 0 && i < 3 && !blocked[i]);
      // 바로 옆 차선이 막혀 있으면 건너갈 수 없으니 인접 차선만
      const adj = cand.filter((i) => Math.abs(i - li) === 1);
      const pick = (adj.length ? adj : cand).sort((a, b) => cost[a] - cost[b])[0];
      if (pick !== undefined) this.input(pick < li ? 'left' : 'right');
    }
    // 현재 차선의 낮은/높은 장애물, 구덩이
    const x = LANE_X[li];
    for (let i = seg.obIdx; i < seg.obstacles.length; i++) {
      const o = seg.obstacles[i];
      const d = o.s - p.s;
      if (d > v * 0.5 + 2) break;
      if (!o.alive || d < -0.5 || Math.abs(LANE_X[o.lane] - x) > 0.1) continue;
      if (o.type === 'low' && d < v * 0.26 + 0.8 && p.grounded) { this.input('up'); break; }
      if (o.type === 'high' && d < v * 0.22 + 0.8) {
        if (!p.grounded) this.input('down');
        else if (p.sliding < 0.35) this.input('down');
        break;
      }
    }
    for (const h of seg.holes) {
      const d = h.s0 - p.s;
      if (h.mask[li] && h.mask.every(Boolean) && d > -0.2 && d < v * 0.1 + 0.7 && p.grounded) this.input('up');
    }
  }
}
