// 트랙: 직선 세그먼트를 90도 코너로 이어 붙여 끝없이 생성한다.
// 세그먼트 로컬 좌표: s = 진행 거리(로컬 -Z), x = 좌우(오른쪽 +), y = 높이.
// 각 세그먼트의 처음 PATH_W 구간은 부모의 코너 광장과 겹치고, 마지막 PATH_W 구간이 자신의 코너 광장이다.
import * as THREE from 'three';
import { GeoBuilder, tint } from './geo.js';
import { BIOMES, obstacleGeo } from './biomes.js';
import { POWERUPS } from './data.js';
import { drawIcon } from './icons.js';
import {
  LANE_W, PATH_W, HALF_W, LANE_X, BASE_Y, SLAB_T, JUMP_V, GRAV,
  clamp, mulberry32, speedAt, difficultyAt,
} from './const.js';

const TILE = 3.6;
const FWD = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const RGT = [[1, 0], [0, 1], [-1, 0], [0, -1]];
export const SEG_PER_BIOME = 4;

const STRIPS = [[-HALF_W, -LANE_W / 2], [-LANE_W / 2, LANE_W / 2], [LANE_W / 2, HALF_W]];
const laneOf = (x) => (x < -LANE_W / 2 ? 0 : x > LANE_W / 2 ? 2 : 1);

/** 길 조각: 윗면 + 양 옆면. (sa→sb 사이에서 높이가 ha→hb로 변한다) */
function slab(b, x0, x1, sa, sb, ha, hb, thick, cTop, cSide) {
  const za = -sa, zb = -sb;
  b.quad(x0, ha, za, x1, ha, za, x1, hb, zb, x0, hb, zb, cTop);
  b.quad(x0, ha, za, x0, hb, zb, x0, hb - thick, zb, x0, ha - thick, za, cSide);
  b.quad(x1, ha, za, x1, ha - thick, za, x1, hb - thick, zb, x1, hb, zb, cSide);
}
/** 길 조각의 앞(다가오는 쪽을 보는 면) / 뒤 마구리. */
function capFront(b, x0, x1, s, h, thick, c) {
  const z = -s;
  b.quad(x0, h, z, x0, h - thick, z, x1, h - thick, z, x1, h, z, c);
}
function capBack(b, x0, x1, s, h, thick, c) {
  const z = -s;
  b.quad(x0, h, z, x1, h, z, x1, h - thick, z, x0, h - thick, z, c);
}

export class Segment {
  constructor(track, o) {
    this.track = track;
    this.ox = o.ox; this.oz = o.oz; this.dir = o.dir; this.h0 = o.h0;
    this.depth = o.depth; this.startDist = o.startDist; this.isRoot = !!o.isRoot;
    this.biomeIndex = o.biomeIndex; this.biome = BIOMES[o.biomeIndex];
    this.children = null;
    this.obstacles = []; this.coins = []; this.pickups = []; this.holes = []; this.ramps = [];
    this.obIdx = 0; this.coinIdx = 0;
    this.built = false; this.queued = false; this.dead = false;
    this.seed = Math.floor(track.rng() * 0x7fffffff);
    this.group = new THREE.Group();
    this.group.position.set(this.ox, 0, this.oz);
    this.group.rotation.y = -this.dir * Math.PI / 2;
    this.generate();
  }

  toWorld(s, x, y, out) {
    const F = FWD[this.dir], R = RGT[this.dir];
    return out.set(this.ox + F[0] * s + R[0] * x, y, this.oz + F[1] * s + R[1] * x);
  }

  heightAt(s) {
    const pr = this.profile;
    for (let i = 1; i < pr.length; i++) {
      if (s <= pr[i][0]) {
        const a = pr[i - 1], c = pr[i];
        return a[1] + (c[1] - a[1]) * ((s - a[0]) / (c[0] - a[0]));
      }
    }
    return pr[pr.length - 1][1];
  }

  /** s 지점에서 사라진 차선 마스크(없으면 null). mask[i] = true 면 그 차선의 바닥이 없다. */
  holeMaskAt(s) {
    for (const h of this.holes) if (s > h.s0 && s < h.s1) return h.mask;
    return null;
  }

  /** (s, x)에 바닥이 없는가. 발 폭만큼 여유를 준다. */
  holeAt(s, x) {
    const m = this.holeMaskAt(s);
    if (!m) return false;
    return m[laneOf(x - 0.3)] && m[laneOf(x + 0.3)];
  }

  onRamp(s, pad = 1.5) {
    for (const r of this.ramps) if (s > r[0] - pad && s < r[1] + pad) return r;
    return null;
  }

  /** s 이후로 need 길이만큼 평평한(경사 없는) 자리. */
  flatSpot(s, need) {
    // 경사 끝에서 점프 도움닫기 거리만큼은 비워 둔다(오르막에서 뛰면 장애물을 못 넘는다)
    const pad = Math.max(3, this.v * 0.45);
    for (let guard = 0; guard < 6; guard++) {
      let moved = false;
      for (const r of this.ramps) {
        if (s + need + 2 > r[0] && s - pad < r[1]) { s = r[1] + pad + 0.5; moved = true; }
      }
      if (!moved) break;
    }
    return s;
  }

  // ───────── 데이터 생성 ─────────
  generate() {
    const T = this.track, rng = T.rng;
    const d = this.d = T.attract ? 0 : difficultyAt(this.startDist);
    const v = this.v = T.attract ? 12 : speedAt(this.startDist);
    const R = (a, b) => a + rng() * (b - a);

    let len = this.dir === 0 ? R(82, 128) : R(68, 104);
    len *= 1 + 0.4 * d;
    if (this.isRoot) len = T.attract ? 96 : 124;
    this.len = Math.round(len);

    if (this.dir === 1) this.turn = 'L';
    else if (this.dir === 3) this.turn = 'R';
    else {
      const r = rng();
      this.turn = this.depth >= 2 && r < 0.22 ? 'T' : r < 0.61 ? 'L' : 'R';
    }
    this.turnZone = Math.max(12, v * 0.75);
    this.turnZoneStart = this.len - PATH_W - this.turnZone;

    const zA = this.isRoot ? 32 : PATH_W + 8 + v * 0.3;
    const zB = this.turnZoneStart - 5;

    // 높이 변화(오르막·내리막)
    this.profile = [[-1e4, this.h0]];
    let h = this.h0;
    if (!this.isRoot && zB - zA > 34 && rng() < 0.72) {
      const n = zB - zA > 78 && rng() < 0.5 ? 2 : 1;
      const span = (zB - zA) / n;
      for (let i = 0; i < n; i++) {
        const rl = R(8, 12);
        const a = zA + i * span + 2 + rng() * Math.max(0, span - rl - 4);
        let dh = R(1.1, 2.4) * (rng() < 0.5 ? -1 : 1);
        if (h + dh < 0) dh = Math.abs(dh);
        if (h + dh > 3.8) dh = -Math.abs(dh);
        this.profile.push([a, h], [a + rl, h + dh]);
        this.ramps.push([a, a + rl]);
        h += dh;
      }
    }
    this.profile.push([1e5, h]);
    this.hEnd = h;

    if (T.attract) {
      // 메뉴 배경용: 코인 줄만 놓는다
      for (let s = zA; s < zB - 12; s += R(16, 26)) this.coinLine(Math.floor(rng() * 3), s, 6);
    } else {
      let s = zA;
      while (s < zB - 2) {
        if (this.startDist + s >= T.nextPowerAt) {
          const types = ['magnet', 'magnet', 'shield', 'shield', 'double', 'double', 'boost'];
          this.pickups.push({ type: types[Math.floor(rng() * types.length)], lane: Math.floor(rng() * 3), s, got: false, obj: null });
          T.nextPowerAt = this.startDist + s + R(240, 420);
          s += Math.max(9, v * 0.55);
          continue;
        }
        const used = this.placePattern(s, zB, d, v);
        s += used + v * (1.2 - 0.45 * d) + R(0, 5);
      }
    }
    this.obstacles.sort((a, b) => a.s - b.s);
    this.coins.sort((a, b) => a.s - b.s);
  }

  addOb(type, lane, s) {
    this.obstacles.push({ type, lane, s, half: type === 'block' ? 0.6 : 0.45, alive: true, mesh: null });
  }

  addCoin(lane, s, yOff = 0.95) {
    this.coins.push({ x: LANE_X[lane], s, y: this.heightAt(s) + yOff, got: false, pull: false, hid: false });
  }

  coinLine(lane, s0, n, yOff = 0.95) {
    for (let i = 0; i < n; i++) this.addCoin(lane, s0 + i * 1.7, yOff);
  }

  /** 점프 궤적을 따라 놓는 코인 아치(중심 sc). */
  coinArc(lane, sc, v) {
    const T = (2 * JUMP_V) / GRAV, H = (JUMP_V * JUMP_V) / (2 * GRAV);
    for (const u of [0.18, 0.34, 0.5, 0.66, 0.82]) {
      this.addCoin(lane, sc + (u - 0.5) * v * T, 0.95 + 4 * H * u * (1 - u) * 0.82);
    }
  }

  makeRow(d) {
    const rng = this.track.rng;
    const RI = (n) => Math.floor(rng() * n);
    const lanes = [null, null, null];
    const simple = d < 0.05;
    const r = rng();
    if (r < 0.2) lanes.fill('low');
    else if (r < 0.38) lanes.fill('high');
    else if (r < 0.62 || simple) {
      const i = RI(3);
      lanes[i] = 'block';
      if (!simple && rng() < 0.3 + d * 0.45) lanes[(i + 1 + RI(2)) % 3] = rng() < 0.5 ? 'low' : 'high';
    } else if (r < 0.84) {
      const free = RI(3);
      for (let i = 0; i < 3; i++) if (i !== free) lanes[i] = 'block';
      if (rng() < d * 0.6) lanes[free] = rng() < 0.5 ? 'low' : 'high';
    } else {
      const kinds = ['low', 'high', 'block'];
      for (let i = 0; i < 3; i++) lanes[i] = kinds[RI(3)];
      if (lanes.every((k) => k === 'block')) lanes[RI(3)] = rng() < 0.5 ? 'low' : 'high';
    }
    return lanes;
  }

  placeRow(s, lanes, v, coinChance = 0.65) {
    const rng = this.track.rng;
    for (let i = 0; i < 3; i++) if (lanes[i]) this.addOb(lanes[i], i, s);
    if (rng() > coinChance) return;
    const free = [0, 1, 2].filter((i) => !lanes[i]);
    if (free.length) { this.coinLine(free[Math.floor(rng() * free.length)], s - 3.4, 5); return; }
    const pass = [0, 1, 2].filter((i) => lanes[i] !== 'block');
    const lane = pass[Math.floor(rng() * pass.length)];
    if (lanes[lane] === 'low') this.coinArc(lane, s, v);
    else this.coinLine(lane, s - 3.4, 5, 0.55);
  }

  placePattern(s, zB, d, v) {
    const rng = this.track.rng;
    const R = (a, b) => a + rng() * (b - a);
    const RI = (n) => Math.floor(rng() * n);
    const room = zB - s;
    const opts = [['coins', 1.5 - d], ['row', 4]];
    if (this.depth >= 1) opts.push(['gap', 1.3]);
    if (this.depth >= 2 && room > 24) opts.push(['narrow', 1.1]);
    if (d > 0.1 && room > v * 0.65 + 6) opts.push(['double', 1 + 3 * d]);
    if (d > 0.28 && room > v * 1.2 + 6) opts.push(['slalom', 0.6 + 2 * d]);
    let total = 0;
    for (const o of opts) total += o[1];
    let pick = rng() * total, kind = 'row';
    for (const o of opts) { pick -= o[1]; if (pick <= 0) { kind = o[0]; break; } }

    if (kind === 'coins') {
      const lane = RI(3);
      if (rng() < 0.35) { // 지그재그
        let l = lane;
        for (let i = 0; i < 3; i++) {
          this.coinLine(l, s + i * 5.1, 3);
          l = clamp(l + (l === 0 ? 1 : l === 2 ? -1 : rng() < 0.5 ? -1 : 1), 0, 2);
        }
        return 15;
      }
      const n = 5 + RI(5);
      this.coinLine(lane, s, n);
      return n * 1.7;
    }

    if (kind === 'gap') {
      const L = clamp(v * 0.2, 3, 5.2);
      const s0 = this.flatSpot(s, L);
      if (s0 + L < zB) {
        this.holes.push({ s0, s1: s0 + L, mask: [true, true, true] });
        if (rng() < 0.75) this.coinArc(RI(3), s0 + L / 2, v);
        return s0 - s + L;
      }
      kind = 'row';
    }

    if (kind === 'narrow') {
      const L = R(10, 15) + v * 0.15;
      const s0 = this.flatSpot(s, L);
      if (s0 + L < zB) {
        const masks = [[true, false, true], [false, true, true], [true, true, false], [true, false, false], [false, false, true]];
        const mask = masks[RI(masks.length)];
        this.holes.push({ s0, s1: s0 + L, mask });
        const open = [0, 1, 2].filter((i) => !mask[i]);
        this.coinLine(open[RI(open.length)], s0 + 1, Math.floor((L - 2) / 1.7));
        return s0 - s + L;
      }
      kind = 'row';
    }

    if (kind === 'double') {
      const gap2 = Math.max(9, v * 0.62);
      const s1 = this.flatSpot(s, 1), s2 = this.flatSpot(s1 + gap2, 1);
      if (s2 < zB) {
        this.placeRow(s1, this.makeRow(d), v, 0.4);
        this.placeRow(s2, this.makeRow(d), v, 0.6);
        return s2 - s + 1;
      }
      kind = 'row';
    }

    if (kind === 'slalom') {
      const step = Math.max(8.5, v * 0.56);
      let cur = s, free = RI(3), last = s;
      for (let k = 0; k < 3; k++) {
        const sk = this.flatSpot(cur, 1);
        if (sk >= zB) break;
        const lanes = ['block', 'block', 'block'];
        lanes[free] = null;
        this.placeRow(sk, lanes, v, 0.8);
        last = sk;
        cur = sk + step;
        free = free === 0 ? 1 : free === 2 ? 1 : rng() < 0.5 ? 0 : 2;
      }
      return last - s + 1;
    }

    // 'row'
    const sr = this.flatSpot(s, 1);
    if (sr < zB) this.placeRow(sr, this.makeRow(d), v);
    return sr - s + 1;
  }

  // ───────── 메시 생성 ─────────
  build() {
    if (this.built || this.dead) return;
    this.built = true;
    const T = this.track;
    const b = new GeoBuilder(9000);
    this.buildFloor(b);
    this.buildCorner(b);
    this.buildPillars(b);
    this.buildDeco(b);
    this.staticMesh = new THREE.Mesh(b.build(), T.mat);
    this.group.add(this.staticMesh);

    for (const o of this.obstacles) {
      const m = new THREE.Mesh(obstacleGeo(this.biome, o.type), T.mat);
      m.position.set(LANE_X[o.lane], this.heightAt(o.s), -o.s);
      this.group.add(m);
      o.mesh = m;
    }
    if (this.coins.length) {
      const im = new THREE.InstancedMesh(T.coinGeo, T.coinMat, this.coins.length);
      im.frustumCulled = false;
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.coinMesh = im;
      this.group.add(im);
      this.updateCoins(0);
    }
    for (const p of this.pickups) {
      p.obj = T.makePickup(p.type);
      p.y = this.heightAt(p.s) + 1.3;
      p.obj.position.set(LANE_X[p.lane], p.y, -p.s);
      this.group.add(p.obj);
    }
    T.scene.add(this.group);
  }

  buildFloor(b) {
    const P = this.biome.pal;
    const sStart = this.isRoot ? -10 : PATH_W, sEnd = this.len - PATH_W;
    const LIP = 0.45;
    const cuts = new Set([sStart, sEnd]);
    for (const [ps] of this.profile) if (ps > sStart && ps < sEnd) cuts.add(ps);
    for (const h of this.holes) { cuts.add(h.s0); cuts.add(h.s1); cuts.add(h.s0 - LIP); cuts.add(h.s1 + LIP); }
    for (let t = Math.ceil(sStart / TILE) * TILE; t < sEnd; t += TILE) cuts.add(Math.round(t * 1000) / 1000);
    const arr = [...cuts].filter((c) => c >= sStart && c <= sEnd).sort((a, c) => a - c);

    const side = P.side, sideDark = tint(P.side, 0.8), trimDark = tint(P.trim, 0.78);
    for (let i = 0; i < arr.length - 1; i++) {
      const a = arr[i], c = arr[i + 1];
      if (c - a < 0.01) continue;
      const mid = (a + c) / 2;
      const ha = this.heightAt(a), hb = this.heightAt(c);
      const mask = this.holeMaskAt(mid);
      const before = this.holeMaskAt(a - 0.05), after = this.holeMaskAt(c + 0.05);
      // 구멍 앞뒤 가장자리는 경고색으로 칠한다
      let warn = null;
      for (const h of this.holes) {
        if ((mid > h.s0 - LIP && mid < h.s0) || (mid > h.s1 && mid < h.s1 + LIP)) warn = h.mask;
      }
      const base = Math.floor(mid / TILE) & 1 ? P.top : P.top2;
      const line = tint(base, 0.84);
      if (!mask && !warn) {
        // 온전한 구간: 차선 3개 + 차선 구분선 2개(겹치지 않게 나눠 그린다)
        const za = -a, zc = -c, lw = 0.05, e = LANE_W / 2;
        const top = (x0, x1, col) => b.quad(x0, ha, za, x1, ha, za, x1, hb, zc, x0, hb, zc, col);
        top(-HALF_W, -e - lw, base); top(-e - lw, -e + lw, line);
        top(-e + lw, e - lw, base); top(e - lw, e + lw, line); top(e + lw, HALF_W, base);
        b.quad(-HALF_W, ha, za, -HALF_W, hb, zc, -HALF_W, hb - SLAB_T, zc, -HALF_W, ha - SLAB_T, za, side);
        b.quad(HALF_W, ha, za, HALF_W, ha - SLAB_T, za, HALF_W, hb - SLAB_T, zc, HALF_W, hb, zc, side);
      } else {
        for (let j = 0; j < 3; j++) {
          if (mask && mask[j]) continue;
          const [x0, x1] = STRIPS[j];
          slab(b, x0, x1, a, c, ha, hb, SLAB_T, warn && warn[j] ? P.warn : base, side);
        }
      }
      for (let j = 0; j < 3; j++) {
        if (mask && mask[j]) continue;
        const [x0, x1] = STRIPS[j];
        if (before && before[j]) capFront(b, x0, x1, a, ha, SLAB_T, sideDark);
        if (after && after[j]) capBack(b, x0, x1, c, hb, SLAB_T, sideDark);
      }
      // 가장자리 턱
      const curb = (x0, x1, j) => {
        if (mask && mask[j]) return;
        slab(b, x0, x1, a, c, ha + 0.2, hb + 0.2, SLAB_T + 0.36, P.trim, trimDark);
        if (before && before[j]) capFront(b, x0, x1, a, ha + 0.2, SLAB_T + 0.36, trimDark);
        if (after && after[j]) capBack(b, x0, x1, c, hb + 0.2, SLAB_T + 0.36, trimDark);
      };
      curb(-HALF_W - 0.12, -HALF_W + 0.26, 0);
      curb(HALF_W - 0.26, HALF_W + 0.12, 2);
    }
    if (this.isRoot) capBack(b, -HALF_W, HALF_W, sStart, this.h0, SLAB_T, sideDark);
  }

  buildCorner(b) {
    const P = this.biome.pal, L = this.len, h = this.hEnd;
    slab(b, -HALF_W, HALF_W, L - PATH_W, L, h, h, SLAB_T, P.corner, P.side);
    const wallH = 1.5;
    const wy = h + (wallH - SLAB_T) / 2;
    // 정면 벽 + 방향 화살표
    b.add('box', 0, wy, -(L + 0.3), PATH_W + 1.2, wallH + SLAB_T, 0.6, P.wall);
    b.add('box', 0, h + wallH + 0.08, -(L + 0.3), PATH_W + 1.4, 0.16, 0.8, P.trim);
    const chev = (cx, dirSign) => {
      const cy = h + 0.78, z = -(L - 0.03);
      b.add('box', cx, cy + 0.24, z, 0.74, 0.2, 0.08, P.warn, 0, 0, -dirSign * Math.PI / 4);
      b.add('box', cx, cy - 0.24, z, 0.74, 0.2, 0.08, P.warn, 0, 0, dirSign * Math.PI / 4);
    };
    if (this.turn === 'T') {
      for (const cx of [-2.7, -1.6]) chev(cx, -1);
      for (const cx of [1.6, 2.7]) chev(cx, 1);
      b.add('oct', 0, h + 0.78, -(L - 0.03), 0.5, 0.5, 0.1, P.warn);
    } else {
      const sg = this.turn === 'R' ? 1 : -1;
      for (const cx of [-2.55, -0.85, 0.85, 2.55]) chev(cx, sg);
      // 막힌 쪽 옆 벽
      const sx = -sg * (HALF_W + 0.3);
      b.add('box', sx, wy, -(L - PATH_W / 2 + 0.3), 0.6, wallH + SLAB_T, PATH_W + 0.6, P.wall);
      b.add('box', sx, h + wallH + 0.08, -(L - PATH_W / 2 + 0.3), 0.8, 0.16, PATH_W + 0.8, P.trim);
    }
  }

  buildPillars(b) {
    const P = this.biome.pal;
    const post = (s, w, dpt) => {
      const h = this.heightAt(s) - SLAB_T;
      b.add('box', 0, (BASE_Y + h) / 2, -s, w, h - BASE_Y, dpt, P.pillar);
      b.add('box', 0, h - 0.3, -s, w + 2.2, 0.6, dpt + 0.7, tint(P.pillar, 1.12));
    };
    for (let s = this.isRoot ? 2 : PATH_W + 9; s < this.len - PATH_W - 6; s += 18) {
      if (this.holeMaskAt(s - 1.6) || this.holeMaskAt(s + 1.6) || this.holeMaskAt(s)) continue;
      post(s, 2.8, 1.6);
    }
    post(this.len - HALF_W, 3.4, 3.4);
  }

  buildDeco(b) {
    const B = this.biome;
    const r = mulberry32(this.seed);
    for (let s = this.isRoot ? -8 : PATH_W + 3; s < this.len - PATH_W - 3; s += B.decoStep) {
      for (const side of [-1, 1]) {
        if (r() > B.decoProb) continue;
        const x = side * (HALF_W + 3.2 + r() * 11);
        B.deco(b, r, x, -(s + (r() - 0.5) * 2), side);
      }
    }
  }

  /** 코인 인스턴스 행렬 갱신(회전·끌려오기·획득 숨김). */
  updateCoins(t) {
    const im = this.coinMesh;
    if (!im) return;
    const a = im.instanceMatrix.array, cs = this.coins;
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i], o = i * 16;
      if (c.got) {
        if (!c.hid) { a.fill(0, o, o + 16); a[o + 15] = 1; c.hid = true; }
        continue;
      }
      const ang = t * 3.2 + c.s * 0.35;
      const co = Math.cos(ang), si = Math.sin(ang);
      a[o] = co; a[o + 1] = 0; a[o + 2] = -si; a[o + 3] = 0;
      a[o + 4] = 0; a[o + 5] = 1; a[o + 6] = 0; a[o + 7] = 0;
      a[o + 8] = si; a[o + 9] = 0; a[o + 10] = co; a[o + 11] = 0;
      a[o + 12] = c.x; a[o + 13] = c.y + (c.pull ? 0 : Math.sin(t * 2.4 + c.s) * 0.08); a[o + 14] = -c.s; a[o + 15] = 1;
    }
    im.instanceMatrix.needsUpdate = true;
  }

  makeChildren() {
    if (this.children) return this.children;
    const T = this.track, ch = {};
    const mk = (turn) => {
      const ndir = turn === 'R' ? (this.dir + 1) % 4 : (this.dir + 3) % 4;
      const sC = this.len - HALF_W, lx = turn === 'R' ? -HALF_W : HALF_W;
      const F = FWD[this.dir], Rt = RGT[this.dir];
      return new Segment(T, {
        ox: this.ox + F[0] * sC + Rt[0] * lx, oz: this.oz + F[1] * sC + Rt[1] * lx,
        dir: ndir, h0: this.hEnd, depth: this.depth + 1,
        startDist: this.startDist + this.len - PATH_W,
        biomeIndex: T.biomeFor(this.depth + 1),
      });
    };
    if (this.turn !== 'R') ch.L = mk('L');
    if (this.turn !== 'L') ch.R = mk('R');
    this.children = ch;
    return ch;
  }

  dispose() {
    this.dead = true;
    if (!this.built) return;
    this.track.scene.remove(this.group);
    this.staticMesh.geometry.dispose();
    if (this.coinMesh) this.coinMesh.dispose();
  }
}

function starGeometry() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? 0.2 : 0.46;
    const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
    if (i) shape.lineTo(x, y); else shape.moveTo(x, y);
  }
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false });
  g.translate(0, 0, -0.07);
  return g;
}

export class Track {
  constructor(scene) {
    this.scene = scene;
    this.mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.coinGeo = starGeometry();
    this.coinMat = new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0x8a5a00 });
    this.pickupMats = {};
    this.bubbleGeo = new THREE.IcosahedronGeometry(0.62, 1);
    this.live = new Set();
    this.queue = [];
    this.trash = [];
    this.rng = Math.random;
    this.current = null;
  }

  makePickup(type) {
    if (!this.pickupMats[type]) {
      const def = POWERUPS[type];
      const cv = document.createElement('canvas');
      cv.width = cv.height = 128;
      const ctx = cv.getContext('2d');
      const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, def.color); g.addColorStop(1, def.color);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(64, 64, 58, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 7; ctx.strokeStyle = '#ffffff'; ctx.stroke();
      drawIcon(ctx, def.icon, 64, 64, 66, '#15203f');
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      this.pickupMats[type] = {
        sprite: new THREE.SpriteMaterial({ map: tex, transparent: true }),
        bubble: new THREE.MeshBasicMaterial({ color: new THREE.Color(def.color), transparent: true, opacity: 0.3, depthWrite: false }),
      };
    }
    const m = this.pickupMats[type];
    const grp = new THREE.Group();
    const sp = new THREE.Sprite(m.sprite);
    sp.scale.set(1.25, 1.25, 1);
    const bubble = new THREE.Mesh(this.bubbleGeo, m.bubble);
    bubble.scale.setScalar(1.5);
    grp.add(bubble, sp);
    return grp;
  }

  biomeFor(depth) { return (this.startBiome + Math.floor(depth / SEG_PER_BIOME)) % BIOMES.length; }

  reset({ attract = false, seed = (Math.random() * 1e9) | 0, startBiome = 0 } = {}) {
    for (const s of this.live) s.dispose();
    this.live.clear();
    this.queue.length = 0;
    this.trash.length = 0;
    this.attract = attract;
    this.rng = mulberry32(seed);
    this.startBiome = startBiome;
    this.nextPowerAt = 150;
    this.root = new Segment(this, { ox: 0, oz: 0, dir: 0, h0: 0, depth: 0, startDist: 0, isRoot: true, biomeIndex: this.biomeFor(0) });
    this.current = this.root;
    this.expand(this.root, 2, true);
  }

  expand(seg, depth, now) {
    if (!seg.built && !seg.queued) {
      this.live.add(seg);
      if (now) seg.build();
      else { seg.queued = true; this.queue.push(seg); }
    }
    if (depth <= 0) return;
    const ch = seg.makeChildren();
    for (const k in ch) this.expand(ch[k], depth - 1, now);
  }

  /** 플레이어가 코너를 돌아 child 로 들어갔다. */
  advance(child) {
    this.flushTrash();
    this.trash.push(this.current);
    this.current = child;
    this.expand(child, 2, false);
  }

  flushTrash() {
    for (const s of this.trash) this.disposeTree(s, this.current);
    this.trash.length = 0;
  }

  disposeTree(seg, keep) {
    if (seg === keep) return;
    if (seg.children) for (const k in seg.children) this.disposeTree(seg.children[k], keep);
    seg.dispose();
    this.live.delete(seg);
  }

  update(playerS, t) {
    if (this.queue.length) {
      const s = this.queue.shift();
      if (!s.dead) s.build();
    }
    if (this.trash.length && playerS > 26) this.flushTrash();
    for (const s of this.live) {
      if (!s.built) continue;
      s.updateCoins(t);
      for (const p of s.pickups) {
        if (p.got || !p.obj) continue;
        p.obj.position.y = p.y + Math.sin(t * 2.6 + p.s) * 0.14;
        p.obj.children[0].rotation.y = t * 1.5;
      }
    }
  }
}
