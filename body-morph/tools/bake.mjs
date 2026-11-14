#!/usr/bin/env node
// Bakes the mannequin used by the app.
//
// The figure is an implicit surface (a smooth union of lofted parts — trunk, arms, legs — with a few
// ellipsoids and tapered capsules) driven by a table of body parameters. Every parameter has a "typical adult male" and "typical adult female"
// value and is attributed to one of three factors: S (skeleton), F (fat distribution), M (muscle).
//
// Output (web/mesh-data.js): one fixed-topology mesh for the male figure plus per-vertex deltas for
// "skeleton only", "fat only", "muscle only" and a small residual that makes all three together land
// exactly on the female figure. The app blends those on the CPU, so any mix of factors is a real shape.
// Three further sparse deltas reach past the female average (bust up to an H cup, a narrower waist,
// fuller hips) for the app's "individual variation" sliders.
//
// Hair is a second mesh, meshed on the long style and carried back to the short one, so the waves
// keep their resolution. It follows two weights: the skeleton (where the head is) and the style.
// There are two long styles, each with its own mesh: permed (perm) and twin tails (twin).
//
//   node tools/bake.mjs            (GRID=0.008 for a quick low-res bake)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'web', 'mesh-data.js');
const GRID = +process.env.GRID || 0.0064;

// ───────────────────────────── body parameters ─────────────────────────────
// name: [male, female, factor]   lengths in metres, f* = fraction of stature.
// A value may be a list (one entry per station of a lofted part, bottom-up or root-to-tip).
// factor: 'S' | 'F' | 'M', or shares { S, F, M } of the male→female difference, optionally with
// add: { S, F, M } — opposing contributions that cancel out (e.g. more fat, less muscle).
const SM = { S: 0.6, M: 0.4 }, HALF = { S: 0.5, M: 0.5 }, MS = { S: 0.3, M: 0.7 };
const T = {
  H:          [1.725, 1.600, 'S'],

  fAnkle:     [0.040, 0.040, 'S'],
  fKnee:      [0.285, 0.283, 'S'],
  fCrotch:    [0.470, 0.468, 'S'],
  fHip:       [0.527, 0.527, 'S'],
  fWaist:     [0.618, 0.628, 'S'],
  fChest:     [0.722, 0.722, 'S'],
  fSh:        [0.815, 0.812, 'S'],

  // trunk, ten stations: crotch, hip, high hip, waist, lower ribs, chest, armpit, shoulder, neck root, inside the neck
  torsoRx:    [[0.100, 0.150, 0.147, 0.144, 0.150, 0.165, 0.170, 0.168, 0.072, 0.036],
               [0.102, 0.154, 0.143, 0.123, 0.125, 0.136, 0.143, 0.146, 0.060, 0.030],
               ['S', { S: 1, add: { S: -0.010, F: 0.012, M: -0.002 } }, { S: 1, add: { S: -0.004, F: 0.006, M: -0.002 } },
                SM, { S: 0.7, M: 0.3 }, SM, SM, 'S', MS, 'S']],
  torsoRz:    [[0.085, 0.098, 0.099, 0.107, 0.108, 0.114, 0.104, 0.070, 0.052, 0.036],
               [0.084, 0.096, 0.094, 0.095, 0.093, 0.095, 0.087, 0.060, 0.045, 0.030],
               ['S', 'S', 'S', HALF, { S: 0.7, M: 0.3 }, SM, SM, 'S', MS, 'S']],
  torsoOz:    [[-0.004, -0.004, 0.000, 0.008, 0.005, 0.000, -0.006, -0.014, -0.020, -0.016],
               [-0.004, -0.005, -0.001, 0.006, 0.003, 0.000, -0.005, -0.012, -0.018, -0.014], 'S'],
  pecR:       [0.088, 0.068, HALF],
  pecD:       [0.060, 0.046, 'M'],
  pecOff:     [-0.068, -0.062, 'M'],  // centre depth, measured from the front of the chest wall
  breastR:    [0.022, 0.054, 'F'],
  breastOff:  [-0.086, -0.039, 'F'],
  gluteR:     [0.080, 0.083, 'F'],
  gluteZ:     [-0.050, -0.051, 'F'],
  hipPadR:    [0.040, 0.056, 'F'],

  // head and neck
  headH:      [0.232, 0.219, 'S'],   // vertex to chin
  headW:      [0.077, 0.073, 'S'],
  headD:      [0.096, 0.090, 'S'],
  jawW:       [0.066, 0.057, 'S'],
  jawD:       [0.075, 0.068, 'S'],
  chinR:      [0.027, 0.019, 'S'],
  noseR:      [0.0105, 0.0092, 'S'],
  sockD:      [0.0055, 0.0045, 'S'],   // depth of the eye socket under the brow
  lipR:       [0.0085, 0.0105, 'F'],   // half height of the lips
  neckR:      [0.057, 0.047, { S: 0.45, M: 0.55 }],
  larynxR:    [0.012, 0.006, 'S'],
  larynxZ:    [0.045, 0.028, 'S'],
  trapR:      [0.036, 0.024, 'M'],

  // arm, eight stations from shoulder to wrist (the fifth is the elbow)
  shX:        [0.180, 0.157, 'S'],   // shoulder joint centre, half distance
  deltR:      [0.053, 0.044, MS],
  armAb:      [17.0, 17.0, 'S'],     // abduction of the hanging arm, degrees
  uArmL:      [0.312, 0.288, 'S'],
  fArmL:      [0.258, 0.234, 'S'],
  armRx:      [[0.046, 0.048, 0.044, 0.038, 0.038, 0.040, 0.031, 0.0215], [0.039, 0.040, 0.037, 0.032, 0.032, 0.034, 0.027, 0.0185],
               [MS, MS, MS, MS, 'S', MS, HALF, 'S']],
  armRz:      [[0.050, 0.052, 0.051, 0.042, 0.040, 0.046, 0.036, 0.0300], [0.042, 0.043, 0.042, 0.035, 0.034, 0.039, 0.031, 0.0260],
               [MS, MS, MS, MS, 'S', MS, HALF, 'S']],
  handL:      [0.188, 0.172, 'S'],
  handW:      [0.042, 0.037, 'S'],

  // leg, eleven stations from inside the pelvis to the ankle (the second is the hip joint, the sixth the knee)
  hipX:       [0.084, 0.089, 'S'],   // hip joint centre, half distance
  ankleX:     [0.094, 0.080, 'S'],
  kneeIn:     [0.000, 0.011, 'S'],   // how far the knee sits inside the hip–ankle line
  legRx:      [[0.058, 0.074, 0.074, 0.070, 0.058, 0.052, 0.049, 0.056, 0.043, 0.033, 0.036],
               [0.058, 0.075, 0.075, 0.069, 0.054, 0.048, 0.045, 0.050, 0.039, 0.030, 0.033],
               ['S', 'S', { S: 1, add: { S: -0.006, F: 0.012, M: -0.006 } }, { S: 1, add: { S: -0.002, F: 0.008, M: -0.006 } }, HALF, 'S', 'S', 'M', HALF, 'S', 'S']],
  legRz:      [[0.064, 0.084, 0.089, 0.083, 0.064, 0.057, 0.054, 0.061, 0.047, 0.037, 0.040],
               [0.063, 0.083, 0.088, 0.080, 0.060, 0.053, 0.050, 0.056, 0.043, 0.034, 0.037],
               ['S', 'S', { S: 1, add: { S: -0.006, F: 0.012, M: -0.006 } }, { S: 1, add: { S: -0.002, F: 0.008, M: -0.006 } }, HALF, 'S', 'S', 'M', HALF, 'S', 'S']],
  footL:      [0.257, 0.236, 'S'],
  footW:      [0.047, 0.043, 'S'],
};

// Individual variation beyond the female average, each 0…1. The bust radius is calibrated further down
// so that 1 measures as an H cup (bust − underbust = 27.5 cm).
const BUST = { R: 0.095, embed: 0.10, drop: 0.030, depth: 1.14 };
function vary(P, ext) {
  const n = ext.waist || 0, h = ext.hip || 0;
  // narrower waist: waist station most, its neighbours a little
  P.torsoRx[3] -= 0.023 * n; P.torsoRz[3] -= 0.015 * n;
  P.torsoRx[4] -= 0.003 * n; P.torsoRz[4] -= 0.002 * n;
  P.torsoRx[2] -= 0.005 * n; P.torsoRz[2] -= 0.003 * n;
  // fuller hips: pelvis width, soft tissue over the hip, buttocks, upper thigh
  P.torsoRx[0] += 0.007 * h; P.torsoRx[1] += 0.022 * h; P.torsoRz[1] += 0.006 * h; P.torsoRx[2] += 0.011 * h;
  P.hipPadR += 0.022 * h; P.gluteR += 0.019 * h; P.gluteZ -= 0.011 * h;
  P.legRx[1] += 0.007 * h; P.legRx[2] += 0.015 * h; P.legRz[2] += 0.015 * h; P.legRx[3] += 0.009 * h; P.legRz[3] += 0.009 * h;
  P.bust = ext.bust || 0; P.noBreast = !!ext.noBreast;
  return P;
}

function resolve(ws, wf, wm, ext = {}) {
  const P = {};
  const one = (m, f, fac) => {
    const fr = typeof fac === 'string' ? { [fac]: 1 } : fac, add = fr.add || {};
    const sum = (add.S || 0) + (add.F || 0) + (add.M || 0);
    if (Math.abs(sum) > 1e-9) throw new Error('opposing contributions must cancel');
    return m + ws * ((f - m) * (fr.S || 0) + (add.S || 0)) + wf * ((f - m) * (fr.F || 0) + (add.F || 0)) + wm * ((f - m) * (fr.M || 0) + (add.M || 0));
  };
  for (const k in T) {
    const [m, f, fac] = T[k];
    P[k] = Array.isArray(m) ? m.map((v, i) => one(v, f[i], Array.isArray(fac) ? fac[i] : fac)) : one(m, f, fac);
  }
  return vary(P, ext);
}

// ───────────────────────────── primitives ─────────────────────────────
const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
};

function frame(axis, hint) {
  const v = V.norm(axis);
  let u = V.sub(hint, V.mul(v, V.dot(hint, v)));
  if (V.len(u) < 1e-6) u = V.sub([0, 0, 1], V.mul(v, v[2]));
  u = V.norm(u);
  let w = V.cross(u, v);
  if (w[2] < 0) w = V.mul(w, -1);
  return { u, v, w };
}

// Every primitive has the same field layout so the evaluator stays monomorphic.
const NTAB = 96;
function prim(t, name, k, o, f, a1, a2, a3, h, opt) {
  const p = {
    t, name, k, mir: opt.mir || 0,
    ox: o[0], oy: o[1], oz: o[2],
    ux: f.u[0], uy: f.u[1], uz: f.u[2],
    vx: f.v[0], vy: f.v[1], vz: f.v[2],
    wx: f.w[0], wy: f.w[1], wz: f.w[2],
    a1, a2, a3, h,           // ell: radii (u,v,w)   cap: ra, rb, -, length   loft: -, -, -, length
    sx: opt.sx || 1, sz: opt.sz || 1,
    ca: 1, cb: 0, smin: 1,
    bx: 0, by: 0, bz: 0, br: 0,
    st: null, tab: null, cap0: 0, cap1: 0, pw: 2,
    sub: opt.sub ? 1 : 0,    // carved out of what came before it instead of added
  };
  if (t === 0) {
    p.bx = p.ox; p.by = p.oy; p.bz = p.oz; p.br = Math.max(a1, a2, a3);
  } else if (t === 1) {
    p.cb = (a1 - a2) / h; p.ca = Math.sqrt(Math.max(1 - p.cb * p.cb, 1e-6));
    p.smin = Math.min(p.sx, p.sz);
    p.bx = p.ox + p.vx * h / 2; p.by = p.oy + p.vy * h / 2; p.bz = p.oz + p.vz * h / 2;
    p.br = h / 2 + Math.max(a1, a2) * Math.max(p.sx, p.sz);
  }
  return p;
}
const ell = (name, c, r, k, opt = {}) =>
  prim(0, name, k, c, frame(opt.axis || [0, 1, 0], opt.hint || [1, 0, 0]), r[0], r[1], r[2], 0, opt);
const cap = (name, a, b, ra, rb, k, opt = {}) =>
  prim(1, name, k, a, frame(V.sub(b, a), opt.hint || [1, 0, 0]), ra, rb, 0, V.len(V.sub(b, a)), opt);

// Lofted part: elliptical sections along a straight axis. st = [[s, rx, rz, ox, oz], …] with s rising
// from 0 at a to 1 at b; sections are joined by a C1 cubic, both ends are closed with a dome.
function hermite(st, col, s) {
  const n = st.length;
  let i = 0;
  while (i < n - 2 && s > st[i + 1][0]) i++;
  const s0 = st[i][0], s1 = st[i + 1][0], d = s1 - s0, t = (s - s0) / d;
  // flat at both ends, so the closing domes join without a crease
  const tan = (j) => (j === 0 || j === n - 1) ? 0 : (st[j + 1][col] - st[j - 1][col]) / (st[j + 1][0] - st[j - 1][0]);
  const t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * st[i][col] + (t3 - 2 * t2 + t) * d * tan(i) + (-2 * t3 + 3 * t2) * st[i + 1][col] + (t3 - t2) * d * tan(i + 1);
}
function loft(name, a, b, st, k, opt = {}) {
  const p = prim(2, name, k, a, frame(V.sub(b, a), opt.hint || [1, 0, 0]), 0, 0, 0, V.len(V.sub(b, a)), opt);
  p.st = st; p.pw = opt.pw || 2;
  p.tab = new Float64Array(NTAB * 4);
  let rmax = 0;
  for (let j = 0; j < NTAB; j++) {
    const s = j / (NTAB - 1);
    for (let c = 0; c < 4; c++) p.tab[j * 4 + c] = hermite(st, c + 1, s);
    rmax = Math.max(rmax, Math.max(p.tab[j * 4], p.tab[j * 4 + 1]) + Math.hypot(p.tab[j * 4 + 2], p.tab[j * 4 + 3]));
  }
  p.cap0 = opt.cap0 || Math.min(st[0][1], st[0][2]);
  p.cap1 = opt.cap1 || Math.min(st[st.length - 1][1], st[st.length - 1][2]);
  p.bx = p.ox + p.vx * p.h / 2; p.by = p.oy + p.vy * p.h / 2; p.bz = p.oz + p.vz * p.h / 2;
  p.br = Math.hypot(p.h / 2 + Math.max(p.cap0, p.cap1), rmax);
  return p;
}
const SEC = new Float64Array(4);       // rx, rz, ox, oz of the last sampled section
function section(p, sc) {
  const fi = sc * (NTAB - 1), i0 = Math.min(fi | 0, NTAB - 2), f = fi - i0, t = p.tab, o = i0 * 4;
  SEC[0] = t[o] + (t[o + 4] - t[o]) * f; SEC[1] = t[o + 1] + (t[o + 5] - t[o + 1]) * f;
  SEC[2] = t[o + 2] + (t[o + 6] - t[o + 2]) * f; SEC[3] = t[o + 3] + (t[o + 7] - t[o + 3]) * f;
}

function evalPrim(p, x, y, z) {
  const dx = x - p.ox, dy = y - p.oy, dz = z - p.oz;
  const lu = dx * p.ux + dy * p.uy + dz * p.uz;
  const lv = dx * p.vx + dy * p.vy + dz * p.vz;
  const lw = dx * p.wx + dy * p.wy + dz * p.wz;
  if (p.t === 0) {
    const ax = lu / p.a1, ay = lv / p.a2, az = lw / p.a3;
    const k0 = Math.sqrt(ax * ax + ay * ay + az * az);
    const bx = ax / p.a1, by = ay / p.a2, bz = az / p.a3;
    const k1 = Math.sqrt(bx * bx + by * by + bz * bz);
    return k1 < 1e-9 ? -Math.min(p.a1, p.a2, p.a3) : k0 * (k0 - 1) / k1;
  }
  if (p.t === 2) {
    const s = lv / p.h, sc = s < 0 ? 0 : s > 1 ? 1 : s;
    section(p, sc);
    const rx = SEC[0], rz = SEC[1];
    const qu = Math.abs(lu - SEC[2]) / rx, qw = Math.abs(lw - SEC[3]) / rz;
    const rad = p.pw === 2 ? Math.sqrt(qu * qu + qw * qw) : Math.pow(Math.pow(qu, p.pw) + Math.pow(qw, p.pw), 1 / p.pw);
    const rm = rx < rz ? rx : rz;
    if (s < 0) { const e = -lv / p.cap0; return (Math.sqrt(rad * rad + e * e) - 1) * rm; }
    if (s > 1) { const e = (lv - p.h) / p.cap1; return (Math.sqrt(rad * rad + e * e) - 1) * rm; }
    return (rad - 1) * rm;
  }
  const qu = lu / p.sx, qw = lw / p.sz;
  const q = Math.sqrt(qu * qu + qw * qw);
  const kk = lv * p.ca - q * p.cb;
  let d;
  if (kk < 0) d = Math.sqrt(q * q + lv * lv) - p.a1;
  else if (kk > p.ca * p.h) d = Math.sqrt(q * q + (lv - p.h) * (lv - p.h)) - p.a2;
  else d = q * p.ca + lv * p.cb - p.a1;
  return d * p.smin;
}

function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
const smax = (a, b, k) => -smin(-a, -b, k);

// ───────────────────────────── the figure ─────────────────────────────
function build(P) {
  const H = P.H, sc = H / 1.725;
  const yAnkle = P.fAnkle * H, yKnee = P.fKnee * H, yCrotch = P.fCrotch * H, yHip = P.fHip * H;
  const yWaist = P.fWaist * H, yChest = P.fChest * H, ySh = P.fSh * H;
  const yChin = H - P.headH;
  const L = [];
  const stations = (ss, rx, rz, ox, oz) => ss.map((s, i) => [s, rx[i], rz[i], ox ? ox[i] : 0, oz ? oz[i] : 0]);

  // trunk
  const ty = [yCrotch + 0.020, yHip - 0.020, yHip + 0.070 * sc, yWaist, yWaist + 0.090 * sc, yChest, ySh - 0.075 * sc, ySh - 0.006, ySh + 0.034, ySh + 0.062];
  const t0 = ty[0], t1 = ty[ty.length - 1];
  L.push(loft('trunk', [0, t0, 0], [0, t1, 0], stations(ty.map((y) => (y - t0) / (t1 - t0)), P.torsoRx, P.torsoRz, null, P.torsoOz), 0.04,
    { pw: 2.35, cap0: 0.034, cap1: 0.020 }));
  // chest muscle and breast sit on the rib cage, so they follow it when only the skeleton changes
  const ribW = P.torsoRx[5], ribFront = P.torsoRz[5];
  L.push(ell('pec', [ribW * 0.436, yChest + 0.040, ribFront + P.pecOff], [P.pecR, P.pecR * 0.78, P.pecD], 0.03, { axis: [0.18, 1, 0] }));
  // a larger bust is deeper, sits lower and is set less far into the chest wall
  const bu = P.bust;
  const bR = P.noBreast ? 0.012 : P.breastR + bu * (BUST.R - 0.054);
  const bOff = P.noBreast ? -0.090 : P.breastOff + bu * (-0.0095 - BUST.embed * BUST.R + 0.039);
  const bC = [ribW * (0.53 + 0.02 * bu), yChest - 0.028 - BUST.drop * bu, ribFront + bOff];
  const bRad = [bR * (1 - 0.10 * bu), bR * (1 - 0.08 * bu), bR * (0.90 + (BUST.depth - 0.90) * bu)];
  L.push(ell('breast', bC, bRad, 0.045));
  // the slope from the upper chest down to the breast; it stays inside the chest until the bust is large
  L.push(cap('breastSlope', [ribW * 0.47, yChest + 0.070, ribFront - 0.052], V.add(bC, [0, bR * 0.10, bR * 0.12 * bu]), 0.020 + 0.010 * bu, bR * (0.50 + 0.24 * bu), 0.045));
  L.push(ell('glute', [0.075, yHip - 0.035, P.gluteZ], [P.gluteR, P.gluteR * 1.12, P.gluteR * 0.97], 0.03, { mir: 0.022 }));
  L.push(ell('hipPad', [0.108, yHip - 0.085, -0.012], [P.hipPadR, P.hipPadR * 1.7, P.hipPadR * 1.15], 0.04));

  // neck and head
  const neckB = [0, ySh + 0.002, -0.022], neckT = [0, yChin + 0.030, 0.004];
  const yLarynx = V.lerp(neckB, neckT, 0.50)[1];
  L.push(cap('trap', [0.030, ySh + 0.044, -0.026], [P.shX - 0.045, ySh + 0.010, -0.018], P.trapR, P.trapR * 0.84, 0.04));
  L.push(cap('neck', neckB, neckT, P.neckR * 1.04, P.neckR * 0.97, 0.03));
  L.push(ell('larynx', [0, yLarynx, P.larynxZ], [P.larynxR, P.larynxR * 1.35, P.larynxR], 0.022));
  const hs = P.headH / 0.232;
  L.push(ell('cranium', [0, H - 0.098 * hs, -0.004], [P.headW, 0.098 * hs, P.headD], 0.03));
  L.push(ell('jaw', [0, H - 0.150 * hs, 0.020], [P.jawW, 0.082 * hs, P.jawD], 0.045));
  L.push(ell('chin', [0, yChin + 0.024, 0.062 * hs], [P.chinR, 0.022, 0.022], 0.035));
  L.push(cap('nose', [0, H - 0.108 * hs, 0.087 * hs], [0, H - 0.149 * hs, 0.102 * hs], P.noseR * 0.58, P.noseR, 0.014));
  L.push(ell('ear', [P.headW + 0.001, H - 0.130 * hs, -0.008], [0.007, 0.029, 0.016], 0.006, { axis: [0.12, 1, -0.2] }));
  // eyes and lips: a shallow socket under the brow and a little fullness at the mouth, placed on the face surface
  // as built so far (the app paints the details: eyes, brows, nostrils, the colour and line of the lips)
  const headSdf = makeSdf({ prims: L.slice() });
  const front = (x, y) => { let lo = 0, hi = 0.25; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (headSdf(x, y, m) < 0) lo = m; else hi = m; } return lo; };
  const eyeX = 0.402 * P.headW, eyeY = H - 0.113 * hs, mouthY = H - 0.176 * hs;
  L.push(ell('socket', [eyeX, eyeY + 0.002, front(eyeX, eyeY) + 0.004], [0.0175 * hs, 0.0125 * hs, P.sockD + 0.004], 0.008, { sub: true }));
  L.push(ell('lips', [0, mouthY, front(0, mouthY) - 0.0075], [0.0235 * hs, P.lipR, 0.009], 0.014));

  // arm (hanging, slightly abducted, palm toward the thigh): one loft from shoulder to wrist
  const ab = P.armAb * Math.PI / 180;
  const S = [P.shX + 0.004, ySh - 0.020, -0.014];
  const dU = V.norm([Math.sin(ab), -Math.cos(ab), 0.03]);
  const E = V.add(S, V.mul(dU, P.uArmL));
  const dF = V.norm([Math.sin(ab - 0.05), -Math.cos(ab - 0.05), 0.16]);
  const W = V.add(E, V.mul(dF, P.fArmL));
  const side = V.norm(V.cross(dF, [0, 0, 1]));            // across the palm's thickness
  const fwd = V.norm(V.cross(side, dF));                  // toward the thumb
  const se = P.uArmL / (P.uArmL + P.fArmL);
  const armS = [0, se * 0.29, se * 0.55, se * 0.84, se, se + (1 - se) * 0.25, se + (1 - se) * 0.65, 1];
  L.push(ell('deltoid', [P.shX - 0.002, ySh - 0.020, -0.014], [P.deltR, P.deltR * 1.25, P.deltR * 1.10], 0.035, { axis: [-0.3, 1, 0] }));
  L.push(loft('arm', S, W, stations(armS, P.armRx, P.armRz, null, [0, 0.001, 0.000, -0.008, -0.013, -0.007, -0.001, 0]), 0.028));
  const hl = P.handL, hw = P.handW;
  L.push(ell('palm', V.add(W, V.mul(dF, hl * 0.26)), [0.0160, hl * 0.29, hw], 0.014, { axis: dF, hint: side }));
  L.push(cap('fingers', V.add(V.add(W, V.mul(dF, hl * 0.44)), V.mul(side, -0.002)), V.add(V.add(W, V.mul(dF, hl * 0.90)), V.mul(side, -0.012)),
    0.0125, 0.0100, 0.012, { hint: side, sz: hw * 0.86 / 0.0125 }));
  L.push(cap('thumb', V.add(V.add(W, V.mul(dF, hl * 0.14)), V.mul(fwd, hw * 0.55)),
    V.add(V.add(W, V.mul(dF, hl * 0.50)), V.mul(fwd, hw * 1.20)), 0.0125, 0.0090, 0.010));

  // leg: one loft from inside the pelvis to the ankle; the knee is a station with a sideways and forward offset
  const hipJ = [P.hipX, yHip - 0.020, 0.000];
  const ankle = [P.ankleX, yAnkle + 0.022, -0.016];
  const legDir = V.norm(V.sub(ankle, hipJ)), legLen = V.len(V.sub(ankle, hipJ));
  const up = 0.075 * sc;                                   // how far the loft reaches up past the hip joint
  const legTop = V.sub(hipJ, V.mul(legDir, up));
  const sh = up / (legLen + up);
  const sk = sh + (1 - sh) * (hipJ[1] - yKnee) / (hipJ[1] - ankle[1]);
  const legS = [0, sh, sh + (sk - sh) * 0.22, sh + (sk - sh) * 0.50, sh + (sk - sh) * 0.80, sk,
    sk + (1 - sk) * 0.12, sk + (1 - sk) * 0.33, sk + (1 - sk) * 0.65, sk + (1 - sk) * 0.92, 1];
  const kb = [0, 0, 0.2, 0.5, 0.86, 1, 0.9, 0.6, 0.25, 0.03, 0];
  const legOx = [-0.012, 0, 0.002, 0.002, 0, 0, 0.001, 0.003, 0.001, 0, 0].map((v, i) => v - P.kneeIn * kb[i]);
  const legOz = [0, 0, 0.006, 0.012, 0.015, 0.017, 0.013, -0.001, -0.004, -0.002, 0];
  const knee = V.add(V.lerp(legTop, ankle, sk), [-P.kneeIn, 0, 0.017]);
  L.push(loft('leg', legTop, ankle, stations(legS, P.legRx, P.legRz, legOx, legOz), 0.04, { mir: 0.012 }));
  L.push(ell('patella', V.add(knee, [0, 0.006, 0.041]), [0.025, 0.032, 0.018], 0.02));
  const fl = P.footL, fw = P.footW, z0 = -0.075;
  L.push(ell('heel', [P.ankleX, 0.034, z0 + 0.042], [fw * 0.66, 0.040, 0.042], 0.02));
  L.push(cap('instep', [P.ankleX, 0.070, -0.008], [P.ankleX + 0.008, 0.026, z0 + fl * 0.70], 0.036, 0.027, 0.02, { sx: fw / 0.036 }));
  L.push(ell('toes', [P.ankleX + 0.010, 0.018, z0 + fl * 0.80], [fw * 1.02, 0.021, fl * 0.19], 0.014));

  // landmarks used by the app for labels and highlights
  const lm = {
    top: [0, H, 0], chin: [0, yChin, 0.07], larynx: [0, yLarynx, 0.05],
    shoulder: [P.shX, ySh, -0.014], chest: [0, yChest, 0.06], waist: [0, yWaist, 0.02],
    pelvis: [0, yHip, 0], glute: [0.08, yHip - 0.03, P.gluteZ],
    thigh: V.lerp(hipJ, knee, 0.4), knee, calf: V.lerp(knee, ankle, 0.33), ankle, hipJ,
    armTop: S, elbow: E, wrist: W, upperArm: V.lerp(S, E, 0.5), foreArm: V.lerp(E, W, 0.4),
    hand: V.add(W, V.mul(dF, hl * 0.5)), foot: [P.ankleX, 0.03, z0 + fl * 0.5],
    breast: bC, breastRad: bRad, crotch: [0, yCrotch, 0], neck: [0, ySh, 0],
    head: [P.headW, P.headD, P.headH],          // half breadth, half length, vertex to chin
  };
  return { prims: L, lm, y: { yAnkle, yKnee, yCrotch, yHip, yWaist, yChest, ySh, yChin }, P };
}

function makeSdf(fig) {
  const L = fig.prims, n = L.length;
  const kind = L.map((p) => (p.name === 'breast' || p.name === 'breastSlope' ? 1 : p.name === 'arm' ? 2 : 0));
  return function sdf(x, y, z) {
    const ax = x < 0 ? -x : x;
    let d = 1e9, dn = 1e9;          // dn: the same union without the breast
    for (let i = 0; i < n; i++) {
      const p = L[i];
      const bx = ax - p.bx, by = y - p.by, bz = z - p.bz;
      if (p.sub) {                    // carved out (eye sockets)
        if (Math.sqrt(bx * bx + by * by + bz * bz) - p.br <= p.k) { const di = evalPrim(p, ax, y, z); d = smax(d, -di, p.k); dn = smax(dn, -di, p.k); }
        continue;
      }
      if (Math.sqrt(bx * bx + by * by + bz * bz) - p.br <= dn + p.k) {
        const di = evalPrim(p, ax, y, z);
        if (kind[i] === 1) d = smin(d, di, p.k);
        else if (kind[i] === 2) { dn = smin(dn, di, p.k); if (dn < d) d = dn; }   // arm meets a large bust with a plain crease
        else { d = smin(d, di, p.k); dn = smin(dn, di, p.k); }
      }
      if (p.mir > 0 && ax < 0.06) { const dm = evalPrim(p, -ax, y, z); d = smin(d, dm, p.mir); dn = smin(dn, dm, p.mir); }
    }
    return d > -y ? d : -y;        // flat soles: cut everything below the floor
  };
}

// ───────────────────────────── meshing (naive surface nets) ─────────────────────────────
function surfaceNets(sdf, min, max, h) {
  const NX = Math.ceil((max[0] - min[0]) / h) + 1, NY = Math.ceil((max[1] - min[1]) / h) + 1, NZ = Math.ceil((max[2] - min[2]) / h) + 1;
  const vals = new Float32Array(NX * NY * NZ);
  // coarse pass so the fine pass only touches nodes near the surface
  const C = 4, far = h * C * 1.8;
  vals.fill(1);
  for (let k = 0; k < NZ; k += C) for (let j = 0; j < NY; j += C) for (let i = 0; i < NX; i += C) {
    const d = sdf(min[0] + (i + C / 2) * h, min[1] + (j + C / 2) * h, min[2] + (k + C / 2) * h);
    const near = Math.abs(d) < far;
    for (let kk = k; kk < Math.min(k + C + 1, NZ); kk++) for (let jj = j; jj < Math.min(j + C + 1, NY); jj++) for (let ii = i; ii < Math.min(i + C + 1, NX); ii++) {
      const id = ii + NX * (jj + NY * kk);
      if (near) vals[id] = NaN; else if (!Number.isNaN(vals[id])) vals[id] = d;
    }
  }
  for (let k = 0; k < NZ; k++) for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const id = i + NX * (j + NY * k);
    if (Number.isNaN(vals[id])) vals[id] = sdf(min[0] + i * h, min[1] + j * h, min[2] + k * h);
  }

  const cellV = new Int32Array((NX - 1) * (NY - 1) * (NZ - 1)).fill(-1);
  const cid = (i, j, k) => i + (NX - 1) * (j + (NY - 1) * k);
  const pos = [];
  const co = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const cv = new Float64Array(8);
  for (let k = 0; k < NZ - 1; k++) for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) {
      cv[c] = vals[(i + co[c][0]) + NX * ((j + co[c][1]) + NY * (k + co[c][2]))];
      if (cv[c] < 0) mask |= 1 << c;
    }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, cnt = 0;
    for (const [a, b] of edges) {
      if ((cv[a] < 0) === (cv[b] < 0)) continue;
      const t = cv[a] / (cv[a] - cv[b]);
      sx += co[a][0] + (co[b][0] - co[a][0]) * t;
      sy += co[a][1] + (co[b][1] - co[a][1]) * t;
      sz += co[a][2] + (co[b][2] - co[a][2]) * t;
      cnt++;
    }
    cellV[cid(i, j, k)] = pos.length / 3;
    pos.push(min[0] + (i + sx / cnt) * h, min[1] + (j + sy / cnt) * h, min[2] + (k + sz / cnt) * h);
  }

  const tris = [];
  const quad = (a, b, c, d) => {
    const P = (q) => [pos[q * 3], pos[q * 3 + 1], pos[q * 3 + 2]];
    const d1 = V.len(V.sub(P(a), P(c))), d2 = V.len(V.sub(P(b), P(d)));
    if (d1 <= d2) tris.push(a, b, c, a, c, d); else tris.push(a, b, d, b, c, d);
  };
  const ax3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let k = 0; k < NZ; k++) for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const n = [i, j, k];
    const v0 = vals[i + NX * (j + NY * k)];
    for (let a = 0; a < 3; a++) {
      const b = (a + 1) % 3, c = (a + 2) % 3;
      if (n[a] + 1 >= [NX, NY, NZ][a]) continue;
      if (n[b] < 1 || n[c] < 1 || n[b] >= [NX, NY, NZ][b] - 1 || n[c] >= [NX, NY, NZ][c] - 1) continue;
      const v1 = vals[(i + ax3[a][0]) + NX * ((j + ax3[a][1]) + NY * (k + ax3[a][2]))];
      if ((v0 < 0) === (v1 < 0)) continue;
      const cell = (db, dc) => {
        const q = [i, j, k]; q[b] += db; q[c] += dc;
        return cellV[cid(q[0], q[1], q[2])];
      };
      const A = cell(-1, -1), B = cell(0, -1), Cc = cell(0, 0), D = cell(-1, 0);
      if (v0 < 0) quad(A, B, Cc, D); else quad(A, D, Cc, B);
    }
  }
  return { pos: new Float64Array(pos), tris: new Uint32Array(tris), dims: [NX, NY, NZ] };
}

// ───────────────────────────── surface helpers ─────────────────────────────
const EPS = 0.0012;
function grad(sdf, x, y, z) {
  return [
    (sdf(x + EPS, y, z) - sdf(x - EPS, y, z)) / (2 * EPS),
    (sdf(x, y + EPS, z) - sdf(x, y - EPS, z)) / (2 * EPS),
    (sdf(x, y, z + EPS) - sdf(x, y, z - EPS)) / (2 * EPS),
  ];
}
// free: the surface is not mirror-symmetric (hair), so a point may cross the mid-plane
function project(sdf, p, iters = 14, free = false) {
  let [x, y, z] = p;
  const sgn = x < 0 ? -1 : 1;
  for (let it = 0; it < iters; it++) {
    const d = sdf(x, y, z);
    if (Math.abs(d) < 2e-6) break;
    const g = grad(sdf, x, y, z);
    const g2 = g[0] * g[0] + g[1] * g[1] + g[2] * g[2] + 1e-9;
    const s = Math.max(-0.02, Math.min(0.02, d)) / g2;
    x -= g[0] * s; y -= g[1] * s; z -= g[2] * s;
    if (!free && x * sgn < 0) x = 0;
    if (y < 0) y = 0;
  }
  return [x, y, z];
}

// Carries a surface point of figure A to the matching place on figure B: every primitive moves the
// point with its own frame and size, and the results are blended by how close the point is to each.
function carry(figA, figB, p) {
  const LA = figA.prims, LB = figB.prims;
  const sgn = p[0] < 0 ? -1 : 1, x = Math.abs(p[0]), y = p[1], z = p[2];
  const SIG = 0.016;
  let best = 1e9;
  const ds = new Float64Array(LA.length);
  for (let i = 0; i < LA.length; i++) { ds[i] = evalPrim(LA[i], x, y, z); if (ds[i] < best) best = ds[i]; }
  let ox = 0, oy = 0, oz = 0, wsum = 0;
  for (let i = 0; i < LA.length; i++) {
    const w = Math.exp(-(ds[i] - best) / SIG);
    if (w < 1e-4) continue;
    const a = LA[i], b = LB[i];
    const dx = x - a.ox, dy = y - a.oy, dz = z - a.oz;
    const lu = dx * a.ux + dy * a.uy + dz * a.uz;
    const lv = dx * a.vx + dy * a.vy + dz * a.vz;
    const lw = dx * a.wx + dy * a.wy + dz * a.wz;
    let nu, nv, nw;
    if (a.t === 0) {
      nu = lu / a.a1 * b.a1; nv = lv / a.a2 * b.a2; nw = lw / a.a3 * b.a3;
    } else if (a.t === 2) {
      const s = lv / a.h, sA = s < 0 ? 0 : s > 1 ? 1 : s;
      let j = 0;
      while (j < a.st.length - 2 && sA > a.st[j + 1][0]) j++;
      const fr = (sA - a.st[j][0]) / (a.st[j + 1][0] - a.st[j][0]);
      const sB = b.st[j][0] + (b.st[j + 1][0] - b.st[j][0]) * fr;
      section(a, sA);
      const qu = (lu - SEC[2]) / SEC[0], qw = (lw - SEC[3]) / SEC[1];
      section(b, sB);
      nu = SEC[2] + qu * SEC[0]; nw = SEC[3] + qw * SEC[1];
      nv = s < 0 ? lv / a.cap0 * b.cap0 : s > 1 ? b.h + (lv - a.h) / a.cap1 * b.cap1 : sB * b.h;
    } else {
      const tc = Math.max(0, Math.min(1, lv / a.h));
      const ra = a.a1 + (a.a2 - a.a1) * tc, rb = b.a1 + (b.a2 - b.a1) * tc;
      nv = tc * b.h + (lv - tc * a.h) / ra * rb;
      nu = lu / (ra * a.sx) * (rb * b.sx);
      nw = lw / (ra * a.sz) * (rb * b.sz);
    }
    ox += w * (b.ox + b.ux * nu + b.vx * nv + b.wx * nw);
    oy += w * (b.oy + b.uy * nu + b.vy * nv + b.wy * nw);
    oz += w * (b.oz + b.uz * nu + b.vz * nv + b.wz * nw);
    wsum += w;
  }
  return [Math.max(ox / wsum, 0) * sgn, Math.max(oy / wsum, 0), oz / wsum];
}

function ambient(sdf, p, n) {
  const hs = [0.008, 0.02, 0.045, 0.09, 0.16], ws = [0.24, 0.24, 0.22, 0.16, 0.14];
  let occ = 0;
  for (let i = 0; i < 5; i++) {
    const h = hs[i];
    const d = sdf(p[0] + n[0] * h, p[1] + n[1] * h, p[2] + n[2] * h);
    occ += ws[i] * Math.max(0, Math.min(1, (h - d) / h));
  }
  return Math.max(0, 1 - occ * 1.5);
}

// ───────────────────────────── measurements ─────────────────────────────
function hull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of pts.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
// tape-measure girth of the trunk at height y (rays from the axis stop at the first surface)
function girth(sdf, y) {
  const pts = [];
  let wmax = 0;
  for (let i = 0; i < 96; i++) {
    const a = i / 96 * Math.PI * 2, cx = Math.cos(a), cz = Math.sin(a);
    let r = 0, prev = 0;
    for (let s = 0; s < 400; s++) {
      const d = sdf(cx * r, y, cz * r);
      if (d >= 0) break;
      prev = r; r += Math.max(-d * 0.7, 0.0015);
    }
    for (let s = 0; s < 24; s++) { const m = (prev + r) / 2; if (sdf(cx * m, y, cz * m) < 0) prev = m; else r = m; }
    pts.push([cx * r, cz * r]);
    wmax = Math.max(wmax, Math.abs(cx * r));
  }
  const hl = hull(pts);
  let per = 0;
  for (let i = 0; i < hl.length; i++) { const a = hl[i], b = hl[(i + 1) % hl.length]; per += Math.hypot(a[0] - b[0], a[1] - b[1]); }
  return { per, width: wmax * 2 };
}
function measure(fig, sdf) {
  const { yWaist, yHip } = fig.y;
  let waist = { per: 1e9 }, hip = { per: 0 };
  for (let y = yWaist - 0.07; y <= yWaist + 0.07; y += 0.004) { const g = girth(sdf, y); if (g.per < waist.per) waist = { ...g, y }; }
  for (let y = yHip - 0.085; y <= yHip + 0.05; y += 0.004) { const g = girth(sdf, y); if (g.per > hip.per) hip = { ...g, y }; }
  // stature: top of the head on the axis
  let lo = fig.P.H - 0.05, hi = fig.P.H + 0.05;
  for (let s = 0; s < 30; s++) { const m = (lo + hi) / 2; if (sdf(0, m, 0) < 0) lo = m; else hi = m; }
  const bust = bustGirth(fig);
  return {
    height: hi,
    shoulder: 2 * (fig.P.shX + 0.019),        // acromion to acromion
    bust: bust.per, bustW: bust.width,
    waist: waist.per, waistY: waist.y, waistW: waist.width,
    hip: hip.per, hipY: hip.y, hipW: hip.width,
  };
}
// The tape passes under the arms, so chest girths are taken on the trunk alone.
const ARM_PARTS = new Set(['deltoid', 'arm', 'palm', 'fingers', 'thumb']);
const trunkSdf = (fig) => makeSdf({ ...fig, prims: fig.prims.filter((p) => !ARM_PARTS.has(p.name)) });
// fullest girth of the chest (tape over the bust)
function bustGirth(fig) {
  const sdf = trunkSdf(fig);
  let best = { per: 0 };
  for (let y = fig.y.yChest - 0.11; y <= fig.y.yChest + 0.012; y += 0.004) { const g = girth(sdf, y); if (g.per > best.per) best = { ...g, y }; }
  return best;
}
// girth of the rib cage just under the bust, taken on the same figure without breasts
function underbust(ws, wf, wm, ext = {}) {
  const fig = build(resolve(ws, wf, wm, { ...ext, bust: 0, noBreast: true }));
  return girth(trunkSdf(fig), fig.y.yChest - 0.080).per;
}

// ───────────────────────────── bake ─────────────────────────────
const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);

const corners = {
  base: build(resolve(0, 0, 0)),
  S: build(resolve(1, 0, 0)),
  F: build(resolve(0, 1, 0)),
  M: build(resolve(0, 0, 1)),
  full: build(resolve(1, 1, 1)),
};
const sdfs = Object.fromEntries(Object.entries(corners).map(([k, f]) => [k, makeSdf(f)]));

const xh = Math.ceil(0.50 / GRID) * GRID;
const mesh = surfaceNets(sdfs.base, [-xh, -2 * GRID, -0.21], [xh, 1.78, 0.27], GRID);
const NV = mesh.pos.length / 3, NT = mesh.tris.length / 3;
log(`grid ${mesh.dims.join('×')}  →  ${NV} vertices, ${NT} triangles`);
if (NV > 65535) throw new Error('too many vertices for 16-bit indices; raise GRID');

// Puts the mesh on a figure: every vertex is carried over from the figure it currently sits on
// (figFrom) and then dropped exactly onto the new surface.
function shape(key, fig, sdf, from, figFrom, iters, free) {
  const nv = from.length / 3;
  const pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3), ao = new Float32Array(nv);
  let maxRes = 0;
  for (let i = 0; i < nv; i++) {
    const p0 = [from[i * 3], from[i * 3 + 1], from[i * 3 + 2]];
    const p = project(sdf, figFrom ? carry(figFrom, fig, p0) : p0, iters || (figFrom ? 14 : 7), free);
    maxRes = Math.max(maxRes, Math.abs(sdf(p[0], p[1], p[2])));
    const n = V.norm(grad(sdf, p[0], p[1], p[2]));
    pos.set(p, i * 3); nrm.set(n, i * 3); ao[i] = ambient(sdf, p, n);
  }
  let off = 0;
  for (let i = 0; i < nv; i++) if (Math.abs(sdf(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])) > 0.0005) off++;
  log(`shape ${key}: max residual ${(maxRes * 1000).toFixed(3)} mm` + (off ? `, ${off} vertices more than 0.5 mm off` : ''));
  return { pos, nrm, ao };
}
const base = shape('base', corners.base, sdfs.base, mesh.pos, null);
const shapes = {};
for (const k of ['S', 'F', 'M', 'full']) shapes[k] = shape(k, corners[k], sdfs[k], base.pos, corners.base);

// individual variation, built on the female figure
{
  const under = underbust(1, 1, 1);
  const cupOf = () => bustGirth(build(resolve(1, 1, 1, { bust: 1 }))).per - under;
  let lo = 0.06, hi = 0.14;
  for (let i = 0; i < 20; i++) { BUST.R = (lo + hi) / 2; if (cupOf() < 0.275) lo = BUST.R; else hi = BUST.R; }
  log(`bust radius for an H cup: ${(BUST.R * 1000).toFixed(1)} mm`);
}
const VARIANTS = { BU: { bust: 1 }, WN: { waist: 1 }, HP: { hip: 1 } };
const vfig = {}, vsdf = {};
for (const k in VARIANTS) {
  vfig[k] = build(resolve(1, 1, 1, VARIANTS[k])); vsdf[k] = makeSdf(vfig[k]);
  shapes[k] = shape(k, vfig[k], vsdf[k], shapes.full.pos, corners.full);
}

// orientation: make triangles counter-clockwise seen from outside
{
  let agree = 0;
  for (let t = 0; t < NT; t++) {
    const [a, b, c] = [mesh.tris[t * 3], mesh.tris[t * 3 + 1], mesh.tris[t * 3 + 2]];
    const P = (q) => [base.pos[q * 3], base.pos[q * 3 + 1], base.pos[q * 3 + 2]];
    const fn = V.cross(V.sub(P(b), P(a)), V.sub(P(c), P(a)));
    agree += V.dot(fn, [base.nrm[a * 3], base.nrm[a * 3 + 1], base.nrm[a * 3 + 2]]) > 0 ? 1 : -1;
  }
  if (agree < 0) for (let t = 0; t < NT; t++) { const s = mesh.tris[t * 3 + 1]; mesh.tris[t * 3 + 1] = mesh.tris[t * 3 + 2]; mesh.tris[t * 3 + 2] = s; }
  log(`winding agreement ${(Math.abs(agree) / NT * 100).toFixed(1)}%`);
}

// flipped-triangle check on every target (a fold would show up as a shading artefact)
for (const [k, s] of Object.entries(shapes)) {
  let bad = 0;
  for (let t = 0; t < NT; t++) {
    const [a, b, c] = [mesh.tris[t * 3], mesh.tris[t * 3 + 1], mesh.tris[t * 3 + 2]];
    const P = (q) => [s.pos[q * 3], s.pos[q * 3 + 1], s.pos[q * 3 + 2]];
    const fn = V.cross(V.sub(P(b), P(a)), V.sub(P(c), P(a)));
    const n = [s.nrm[a * 3] + s.nrm[b * 3] + s.nrm[c * 3], s.nrm[a * 3 + 1] + s.nrm[b * 3 + 1] + s.nrm[c * 3 + 1], s.nrm[a * 3 + 2] + s.nrm[b * 3 + 2] + s.nrm[c * 3 + 2]];
    if (V.dot(fn, n) < 0) bad++;
  }
  log(`target ${k}: ${bad} flipped triangles (${(bad / NT * 100).toFixed(2)}%)`);
}

const metrics = Object.fromEntries(Object.keys(corners).map((k) => [k, measure(corners[k], sdfs[k])]));
const W3 = { base: [0, 0, 0], S: [1, 0, 0], F: [0, 1, 0], M: [0, 0, 1], full: [1, 1, 1] };
for (const k in W3) metrics[k].under = underbust(...W3[k]);
for (const k in VARIANTS) { metrics[k] = measure(vfig[k], vsdf[k]); metrics[k].under = underbust(1, 1, 1, VARIANTS[k]); }
// the waist and hip tapes pass below the bust, so a larger bust leaves them as they were
for (const key of ['waist', 'waistW', 'waistY', 'hip', 'hipW', 'hipY']) metrics.BU[key] = metrics.full[key];
for (const k of ['base', 'full', 'BU', 'WN', 'HP']) {
  const m = metrics[k];
  log(`${k}: height ${(m.height * 100).toFixed(1)}  shoulder ${(m.shoulder * 100).toFixed(1)}  bust ${(m.bust * 100).toFixed(1)} (w ${(m.bustW * 100).toFixed(1)}, under ${(m.under * 100).toFixed(1)})  waist ${(m.waist * 100).toFixed(1)}  hip ${(m.hip * 100).toFixed(1)}  WHR ${(m.waist / m.hip).toFixed(3)}  hipW ${(m.hipW * 100).toFixed(1)}`);
}
// bust − underbust along the bust slider, so the app can name the cup size
const cupTable = [];
for (let i = 0; i <= 16; i++) {
  cupTable.push(bustGirth(build(resolve(1, 1, 1, { bust: i / 16 }))).per - metrics.full.under);
}
log('cup difference (cm) along the slider: ' + cupTable.map((v) => (v * 100).toFixed(1)).join(' '));

// vertex bands the app uses to draw live width guides
function band(yc, xmax) {
  const out = [];
  for (let i = 0; i < NV; i++) if (Math.abs(base.pos[i * 3 + 1] - yc) < GRID * 0.75 && Math.abs(base.pos[i * 3]) < xmax) out.push(i);
  return out;
}
const bm = metrics.base, by = corners.base.y;
const bands = {
  shoulder: band(by.ySh - 0.022, 0.30),
  waist: band(bm.waistY, bm.waistW / 2 + 0.03),
  hip: band(bm.hipY, bm.hipW / 2 + 0.03),
};
let topVert = 0;
for (let i = 0; i < NV; i++) if (base.pos[i * 3 + 1] > base.pos[topVert * 3 + 1]) topVert = i;

// Garment coordinates per vertex, taken on the male figure: how far along the arm (shoulder 0 → wrist 1)
// and the leg (hip joint 0 → ankle 1) a vertex sits, and how much it belongs to each. The app cuts
// sleeves, trouser legs and waistbands with these, so clothes follow every shape the body can take.
const LEG_PARTS = new Set(['leg', 'patella', 'heel', 'instep', 'toes']);
const gar = new Uint8Array(NV * 4);
{
  const L = corners.base.prims, lm = corners.base.lm;
  const along = (p, a, b) => V.dot(V.sub(p, a), V.sub(b, a)) / V.dot(V.sub(b, a), V.sub(b, a));
  const q = (t) => Math.max(0, Math.min(255, Math.round((t + 0.5) / 2 * 255)));      // −0.5 … 1.5 in a byte
  for (let i = 0; i < NV; i++) {
    const p = [Math.abs(base.pos[i * 3]), base.pos[i * 3 + 1], base.pos[i * 3 + 2]];
    let best = 1e9;
    const ds = L.map((pr) => { const d = evalPrim(pr, p[0], p[1], p[2]); if (d < best) best = d; return d; });
    let wa = 0, wl = 0, ws = 0;
    L.forEach((pr, j) => {
      const w = Math.exp(-(ds[j] - best) / 0.016);
      ws += w;
      if (ARM_PARTS.has(pr.name)) wa += w; else if (LEG_PARTS.has(pr.name)) wl += w;
    });
    gar.set([q(along(p, lm.armTop, lm.wrist)), Math.round(wa / ws * 255), q(along(p, lm.hipJ, lm.ankle)), Math.round(wl / ws * 255)], i * 4);
  }
}

// ───────────────────────────── hair ─────────────────────────────
// style 0: an ordinary short cut (the same for both kinds).
// style 1, kind 'perm': longer than shoulder length, permed.
// style 1, kind 'twin': bangs, short face-framing locks, the rest drawn up into two long tails.
// Every style has the same parts; in the short style the hanging parts shrink away inside the cap.
function buildHair(P, st, kind = 'perm') {
  const H = P.H, hs = P.headH / 0.232, W = P.headW, Dp = P.headD, ySh = P.fSh * H, twin = kind === 'twin';
  const mix = (a, b) => a + (b - a) * st, mix3 = (a, b) => [mix(a[0], b[0]), mix(a[1], b[1]), mix(a[2], b[2])];
  const L = [];
  L.push(ell('cap', [0, H - 0.097 * hs, -0.004 - mix(0.001, twin ? 0.004 : 0.007)],
    [W + mix(0.009, twin ? 0.014 : 0.023), 0.098 * hs + mix(0.015, twin ? 0.018 : 0.024), Dp + mix(0.011, twin ? 0.015 : 0.025)], 0.02));
  L.push(ell('fringe', [0, H - mix(0.040, twin ? 0.045 : 0.040) * hs, Dp * mix(0.72, twin ? 0.55 : 0.45)],
    [W * mix(0.78, 0.70), mix(0.024, twin ? 0.020 : 0.018), mix(0.032, twin ? 0.020 : 0.024)], 0.012));
  // hanging hair at the back: long when permed, short when drawn up into tails
  const rx = twin ? [0.050, 0.050, 0.046, 0.040] : [mix(0.050, 0.080), mix(0.050, 0.098), mix(0.046, 0.118), mix(0.040, 0.104)];
  const rz = twin ? [0.030, 0.030, 0.028, 0.024] : [mix(0.030, 0.050), mix(0.030, 0.046), mix(0.028, 0.036), mix(0.024, 0.030)];
  L.push(loft('back', [0, H - 0.110 * hs, -0.045], twin ? [0, H - 0.150 * hs, -0.052] : mix3([0, H - 0.150 * hs, -0.052], [0, ySh - 0.100, -0.086]),
    [0, 0.35, 0.70, 1].map((v, i) => [v, rx[i], rz[i], 0, 0]), 0.025, { cap1: twin ? 0.020 : mix(0.020, 0.030) }));
  // side lock: to the shoulder when permed, a thin face-framing lock to the chin with twin tails
  L.push(cap('lock', mix3([W * 0.6, H - 0.100 * hs, 0], twin ? [W + 0.001, H - 0.098 * hs, 0.030] : [W + 0.004, H - 0.105 * hs, 0.012]),
    mix3([W * 0.6, H - 0.130 * hs, 0], twin ? [W - 0.003, H - 0.215 * hs, 0.046] : [0.092, ySh - 0.075, 0.050]),
    mix(0.020, twin ? 0.011 : 0.034), mix(0.020, twin ? 0.007 : 0.030), 0.02));
  if (twin) {
    // a tail on each side (the field is mirrored): tied high at the side of the head, flaring out and
    // hanging behind the shoulder; in the short style it is a small knot deep inside the cap
    const tieA = mix3([0.035, H - 0.060 * hs, -0.030], [0.068, H - 0.050 * hs, -0.052]);
    const tipB = mix3([0.037, H - 0.066 * hs, -0.032], [0.140, ySh - 0.200, -0.125]);
    const r = (v) => mix(0.003, v);
    L.push(loft('tail', tieA, tipB, [
      [0.00, r(0.013), r(0.013), 0, 0], [0.03, r(0.016), r(0.015), mix(0, 0.004), 0],
      [0.10, r(0.030), r(0.026), mix(0, 0.022), mix(0, -0.004)], [0.25, r(0.040), r(0.032), mix(0, 0.034), mix(0, -0.008)],
      [0.50, r(0.037), r(0.030), mix(0, 0.028), mix(0, -0.006)], [0.75, r(0.029), r(0.024), mix(0, 0.016), mix(0, -0.002)],
      [0.92, r(0.018), r(0.016), mix(0, 0.006), 0], [1.00, r(0.008), r(0.008), 0, 0],
    ], 0.015, { cap0: mix(0.003, 0.012), cap1: mix(0.003, 0.010) }));
    const tailDir = V.norm(V.sub(tipB, tieA));
    L.push(ell('tie', V.add(tieA, V.mul(tailDir, mix(0, 0.014))), [mix(0.002, 0.019), mix(0.002, 0.009), mix(0.002, 0.019)], 0.006, { axis: tailDir }));
  }
  // hairline, as depth below the crown: forehead, above or over the ear, nape
  // (the forehead line is highest in the middle and comes down toward the temples by `arch`;
  //  with twin tails it is cut straight across just above the brows: the bangs)
  const cut = twin ? { f: mix(0.056, 0.092), arch: mix(0.020, 0.012), e: mix(0.100, 0.122), b: mix(0.185, 0.192) }
    : { f: mix(0.056, 0.044), arch: mix(0.020, 0.040), e: mix(0.100, 0.175), b: mix(0.185, 0.200) };
  return { prims: L, st, kind, H, hs, W, cut };
}
function makeHairSdf(fig) {
  const [capP, fringe, back, lock, tail, tie] = fig.prims, { f, arch, e, b } = fig.cut, H = fig.H, hs = fig.hs, W = fig.W, st = fig.st;
  const twin = fig.kind === 'twin';
  const ss = (a, c, x) => { const t = Math.max(0, Math.min(1, (x - a) / (c - a))); return t * t * (3 - 2 * t); };
  const TAU = Math.PI * 2;
  return function sdf(x, y, z) {
    const ax = x < 0 ? -x : x, th = Math.atan2(x, -z), below = H - y;
    let d = evalPrim(capP, ax, y, z);
    // hairline: an arch over the forehead, then round the ear to the nape, with a slightly uneven edge
    const u = Math.min(1, ax / W), front = f + arch * u * u;
    const edge = (Math.sin(26 * th + 1.7) * 0.0030 + Math.sin(41 * th) * 0.0014) * (1 - 0.4 * st);
    const yCut = H - hs * (front + (e - front) * ss(0.065, 0.010, z) + (b - e) * ss(-0.015, -0.075, z)) + edge;
    d = smax(d, (yCut - y) * 0.9, 0.007);
    d = smin(d, evalPrim(fringe, ax, y, z), 0.012);
    d = smin(d, evalPrim(back, ax, y, z), 0.025);
    d = smin(d, evalPrim(lock, ax, y, z), 0.02);
    const fine = (Math.sin(34 * th + 5 * Math.sin(18 * y)) * 0.0008 + Math.sin(57 * th - 31 * y + 2 * Math.sin(9 * th)) * 0.0005) * ss(0.010, 0.045, below);
    if (!twin) {
      // strands: fine, combed from the crown when short; wavy locks that grow stronger away from the crown when permed
      const pm = ss(0.05 * hs, 0.15 * hs, below);
      const perm = (Math.sin(21 * th + 1.5 * Math.sin(TAU * y / 0.055 + 2 * Math.sin(3 * th))) * 0.0038
        + Math.sin(TAU * y / 0.043 + 6 * th + 1) * 0.0022) * pm;
      const part = 0.0035 * Math.exp(-(x * x) / 0.00005) * ss(-0.055, -0.005, z) * (1 - ss(0.075, 0.115, below));   // centre parting
      return d + fine * (1 - st * pm) + (perm + part) * st;
    }
    // twin tails: strands running down each tail with soft curls toward the end, a parting down the back of the head
    const dt = evalPrim(tail, ax, y, z), onTail = ss(0.006, -0.006, dt - d);
    d = smin(d, dt, tail.k);
    d = smin(d, evalPrim(tie, ax, y, z), tie.k);
    const dx = ax - tail.ox, dy = y - tail.oy, dz = z - tail.oz;
    const lu = dx * tail.ux + dy * tail.uy + dz * tail.uz, lv = dx * tail.vx + dy * tail.vy + dz * tail.vz, lw = dx * tail.wx + dy * tail.wy + dz * tail.wz;
    const sc = Math.max(0, Math.min(1, lv / tail.h));
    section(tail, sc);
    const ang = Math.atan2(lw - SEC[3], lu - SEC[2]);
    const strands = (Math.sin(13 * ang + 1.2 * Math.sin(TAU * sc * 2)) * 0.0009 + Math.sin(29 * ang + 1.3) * 0.0004) * ss(0.02, 0.10, sc);
    const curl = Math.sin(TAU * lv / 0.095 + 0.6 * ang) * 0.0020 * ss(0.55, 0.90, sc);
    const part = 0.0030 * Math.exp(-(x * x) / 0.00004) * ss(0.0, -0.045, z) * ss(0.02, 0.06, below);           // back parting
    return d + fine * (1 - onTail) + ((strands + curl) * onTail + part) * st;
  };
}
function orient(tris, sh) {
  const nt = tris.length / 3;
  let agree = 0;
  for (let t = 0; t < nt; t++) {
    const [a, b, c] = [tris[t * 3], tris[t * 3 + 1], tris[t * 3 + 2]];
    const P = (q) => [sh.pos[q * 3], sh.pos[q * 3 + 1], sh.pos[q * 3 + 2]];
    const fn = V.cross(V.sub(P(b), P(a)), V.sub(P(c), P(a)));
    agree += V.dot(fn, [sh.nrm[a * 3], sh.nrm[a * 3 + 1], sh.nrm[a * 3 + 2]]) > 0 ? 1 : -1;
  }
  if (agree < 0) for (let t = 0; t < nt; t++) { const q = tris[t * 3 + 1]; tris[t * 3 + 1] = tris[t * 3 + 2]; tris[t * 3 + 2] = q; }
}

const HGRID = +process.env.HGRID || 0.0052;
const PF = resolve(1, 0, 0), PM = resolve(0, 0, 0);       // hair only depends on the skeleton
// corners: [skeleton, style]; the mesh is made on the female long style and carried to the others
function bakeHair(kind) {
  const fig = { fl: buildHair(PF, 1, kind), ml: buildHair(PM, 1, kind), fs: buildHair(PF, 0, kind), ms: buildHair(PM, 0, kind) };
  const sdf = Object.fromEntries(Object.entries(fig).map(([k, f]) => [k, makeHairSdf(f)]));
  const hxh = Math.ceil(0.22 / HGRID) * HGRID, yMin = PF.fSh * PF.H - (kind === 'twin' ? 0.26 : 0.17);
  const mesh = surfaceNets(sdf.fl, [-hxh, yMin, -0.22], [hxh, PF.H + 0.06, 0.17], HGRID);
  const nv = mesh.pos.length / 3, nt = mesh.tris.length / 3;
  log(`hair ${kind}: grid ${mesh.dims.join('×')}  →  ${nv} vertices, ${nt} triangles`);
  if (nv > 65535) throw new Error('too many hair vertices for 16-bit indices; raise HGRID');
  const sh = { fl: shape(`hair ${kind} fl`, fig.fl, sdf.fl, mesh.pos, null, 40, true) };
  for (const k of ['ml', 'fs', 'ms']) sh[k] = shape(`hair ${kind} ${k}`, fig[k], sdf[k], sh.fl.pos, fig.fl, 40, true);
  orient(mesh.tris, sh.fl);
  return { mesh, sh, nv, nt };
}
const hairBakes = { perm: bakeHair('perm'), twin: bakeHair('twin') };

// ───────────────────────────── pack ─────────────────────────────
const b64 = (ta) => Buffer.from(ta.buffer, ta.byteOffset, ta.byteLength).toString('base64');
const bbMin = [1e9, 1e9, 1e9], bbMax = [-1e9, -1e9, -1e9];
for (let i = 0; i < NV * 3; i++) { bbMin[i % 3] = Math.min(bbMin[i % 3], base.pos[i]); bbMax[i % 3] = Math.max(bbMax[i % 3], base.pos[i]); }
const qPos = new Uint16Array(NV * 3);
for (let i = 0; i < NV * 3; i++) qPos[i] = Math.round((base.pos[i] - bbMin[i % 3]) / (bbMax[i % 3] - bbMin[i % 3]) * 65535);
const q8 = (arr, s) => { const o = new Int8Array(arr.length); for (let i = 0; i < arr.length; i++) o[i] = Math.max(-127, Math.min(127, Math.round(arr[i] * s))); return o; };
const qu8 = (arr) => { const o = new Uint8Array(arr.length); for (let i = 0; i < arr.length; i++) o[i] = Math.max(0, Math.min(255, Math.round(arr[i] * 255))); return o; };

// deltas: S, F, M relative to base, then R = full − (base + S + F + M)
const names = ['S', 'F', 'M', 'R'];
const dPos = {}, dNrm = {}, dAo = {};
for (const k of ['S', 'F', 'M']) {
  dPos[k] = shapes[k].pos.map((v, i) => v - base.pos[i]);
  dNrm[k] = shapes[k].nrm.map((v, i) => v - base.nrm[i]);
  dAo[k] = shapes[k].ao.map((v, i) => v - base.ao[i]);
}
dPos.R = shapes.full.pos.map((v, i) => v - base.pos[i] - dPos.S[i] - dPos.F[i] - dPos.M[i]);
dNrm.R = shapes.full.nrm.map((v, i) => v - base.nrm[i] - dNrm.S[i] - dNrm.F[i] - dNrm.M[i]);
dAo.R = shapes.full.ao.map((v, i) => v - base.ao[i] - dAo.S[i] - dAo.F[i] - dAo.M[i]);

const targets = names.map((k) => {
  let mx = 0; for (const v of dPos[k]) mx = Math.max(mx, Math.abs(v));
  let mn = 0; for (const v of dNrm[k]) mn = Math.max(mn, Math.abs(v));
  const qp = new Int16Array(NV * 3); for (let i = 0; i < NV * 3; i++) qp[i] = Math.round(dPos[k][i] / mx * 32767);
  return { key: k, posScale: mx, pos: b64(qp), nrmScale: mn, nrm: b64(q8(dNrm[k], 127 / mn)), ao: b64(q8(dAo[k], 127)) };
});
log('max vertex travel (mm): ' + targets.map((t) => `${t.key} ${(t.posScale * 1000).toFixed(1)}`).join('  '));

// individual-variation targets touch only part of the body, so they are stored sparsely (relative to the female figure)
const extras = Object.keys(VARIANTS).map((k) => {
  const sh = shapes[k], fu = shapes.full, idx = [];
  for (let i = 0; i < NV; i++) {
    let dp = 0, dn = 0;
    for (let c = 0; c < 3; c++) { dp = Math.max(dp, Math.abs(sh.pos[i * 3 + c] - fu.pos[i * 3 + c])); dn = Math.max(dn, Math.abs(sh.nrm[i * 3 + c] - fu.nrm[i * 3 + c])); }
    if (dp > 4e-5 || dn > 0.012 || Math.abs(sh.ao[i] - fu.ao[i]) > 0.01) idx.push(i);
  }
  const n = idx.length, p = new Float32Array(n * 3), nr = new Float32Array(n * 3), a = new Float32Array(n);
  idx.forEach((v, j) => {
    for (let c = 0; c < 3; c++) { p[j * 3 + c] = sh.pos[v * 3 + c] - fu.pos[v * 3 + c]; nr[j * 3 + c] = sh.nrm[v * 3 + c] - fu.nrm[v * 3 + c]; }
    a[j] = sh.ao[v] - fu.ao[v];
  });
  let mx = 1e-9, mn = 1e-9;
  for (const v of p) mx = Math.max(mx, Math.abs(v));
  for (const v of nr) mn = Math.max(mn, Math.abs(v));
  const qp = new Int16Array(n * 3); for (let i = 0; i < n * 3; i++) qp[i] = Math.round(p[i] / mx * 32767);
  let far = 0; for (let j = 1; j < n; j++) if (Math.hypot(p[j * 3], p[j * 3 + 1], p[j * 3 + 2]) > Math.hypot(p[far * 3], p[far * 3 + 1], p[far * 3 + 2])) far = j;
  const fv = idx[far];
  log(`extra ${k}: ${n} vertices (${(n / NV * 100).toFixed(0)}%), max travel ${(mx * 1000).toFixed(1)} mm at (${[0, 1, 2].map((c) => fu.pos[fv * 3 + c].toFixed(3)).join(', ')})`);
  return { key: k, n, idx: b64(new Uint16Array(idx)), posScale: mx, pos: b64(qp), nrmScale: mn, nrm: b64(q8(nr, 127 / mn)), ao: b64(q8(a, 127)) };
});

// hair: male head with the short style, then deltas for skeleton (S), style (K) and both together (R)
function packHair({ mesh, sh: hair, nv: HNV, nt: HNT }, kind) {
  const b0 = hair.ms, mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (let i = 0; i < HNV * 3; i++) { mn[i % 3] = Math.min(mn[i % 3], b0.pos[i]); mx[i % 3] = Math.max(mx[i % 3], b0.pos[i]); }
  const qp = new Uint16Array(HNV * 3);
  for (let i = 0; i < HNV * 3; i++) qp[i] = Math.round((b0.pos[i] - mn[i % 3]) / (mx[i % 3] - mn[i % 3]) * 65535);
  const sub = (a, b, f) => a[f].map((v, i) => v - b[f][i]);
  const res = (f) => hair.fl[f].map((v, i) => v - hair.ml[f][i] - hair.fs[f][i] + b0[f][i]);
  const defs = { S: (f) => sub(hair.fs, b0, f), K: (f) => sub(hair.ml, b0, f), R: res };
  const targets = Object.keys(defs).map((k) => {
    const dp = defs[k]('pos'), dn = defs[k]('nrm'), da = defs[k]('ao');
    let m1 = 1e-9, m2 = 1e-9;
    for (const v of dp) m1 = Math.max(m1, Math.abs(v));
    for (const v of dn) m2 = Math.max(m2, Math.abs(v));
    const q = new Int16Array(HNV * 3); for (let i = 0; i < HNV * 3; i++) q[i] = Math.round(dp[i] / m1 * 32767);
    return { key: k, posScale: m1, pos: b64(q), nrmScale: m2, nrm: b64(q8(dn, 127 / m2)), ao: b64(q8(da, 127)) };
  });
  log(`hair ${kind} max vertex travel (mm): ` + targets.map((t) => `${t.key} ${(t.posScale * 1000).toFixed(1)}`).join('  '));
  return { nv: HNV, nt: HNT, bbMin: mn, bbMax: mx, pos: b64(qp), nrm: b64(q8(b0.nrm, 127)), ao: b64(qu8(b0.ao)), idx: b64(new Uint16Array(mesh.tris)), targets };
}
const hairPack = packHair(hairBakes.perm, 'perm'), hairTwinPack = packHair(hairBakes.twin, 'twin');

const round = (o) => JSON.parse(JSON.stringify(o, (k, v) => (typeof v === 'number' ? +v.toFixed(5) : v)));
const data = {
  nv: NV, nt: NT, grid: GRID,
  bbMin, bbMax,
  pos: b64(qPos), nrm: b64(q8(base.nrm, 127)), ao: b64(qu8(base.ao)),
  idx: b64(new Uint16Array(mesh.tris)), gar: b64(gar),
  targets, extras, hair: hairPack, hairTwin: hairTwinPack,
  metrics: round(metrics), cupTable: round(cupTable),
  lm: round({ male: corners.base.lm, female: corners.full.lm }),
  bands, topVert,
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, '// Generated by tools/bake.mjs — do not edit.\nwindow.BODY_DATA = ' + JSON.stringify(data) + ';\n');
log(`wrote ${path.relative(process.cwd(), OUT)}  (${(fs.statSync(OUT).size / 1e6).toFixed(2)} MB)`);
