/* Body-shape comparison viewer.
   The mesh, its morph deltas and the measurements come from tools/bake.mjs (mesh-data.js). */
(function () {
  'use strict';

  var D = window.BODY_DATA;
  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage'), glCanvas = $('gl'), ovCanvas = $('ov');

  // ───────────── data ─────────────
  function dec(s) {
    var bin = atob(s), n = bin.length, u8 = new Uint8Array(n);
    for (var i = 0; i < n; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  var NV = D.nv, STRIDE = 7;                       // x y z  nx ny nz  ao
  var base = new Float32Array(NV * STRIDE), cur = new Float32Array(NV * STRIDE);
  var indices = new Uint16Array(dec(D.idx).buffer);
  (function () {
    var p = new Uint16Array(dec(D.pos).buffer), n = new Int8Array(dec(D.nrm).buffer), a = dec(D.ao);
    for (var i = 0; i < NV; i++) {
      for (var c = 0; c < 3; c++) {
        base[i * STRIDE + c] = D.bbMin[c] + p[i * 3 + c] / 65535 * (D.bbMax[c] - D.bbMin[c]);
        base[i * STRIDE + 3 + c] = n[i * 3 + c] / 127;
      }
      base[i * STRIDE + 6] = a[i] / 255;
    }
  })();
  var deltas = D.targets.map(function (t) {
    var p = new Int16Array(dec(t.pos).buffer), n = new Int8Array(dec(t.nrm).buffer), a = new Int8Array(dec(t.ao).buffer);
    var out = new Float32Array(NV * STRIDE), ps = t.posScale / 32767, ns = t.nrmScale / 127;
    for (var i = 0; i < NV; i++) {
      for (var c = 0; c < 3; c++) {
        out[i * STRIDE + c] = p[i * 3 + c] * ps;
        out[i * STRIDE + 3 + c] = n[i * 3 + c] * ns;
      }
      out[i * STRIDE + 6] = a[i] / 127;
    }
    return out;
  });
  // sparse targets for individual variation (relative to the female figure)
  var extras = {};
  D.extras.forEach(function (t) {
    var p = new Int16Array(dec(t.pos).buffer), n = new Int8Array(dec(t.nrm).buffer), a = new Int8Array(dec(t.ao).buffer);
    var out = new Float32Array(t.n * STRIDE), ps = t.posScale / 32767, ns = t.nrmScale / 127;
    for (var i = 0; i < t.n; i++) {
      for (var c = 0; c < 3; c++) { out[i * STRIDE + c] = p[i * 3 + c] * ps; out[i * STRIDE + 3 + c] = n[i * 3 + c] * ns; }
      out[i * STRIDE + 6] = a[i] / 127;
    }
    extras[t.key] = { n: t.n, idx: new Uint16Array(dec(t.idx).buffer), d: out };
  });
  // hair: its own mesh; base is the male head with the short style, deltas are skeleton, style and both
  // hair: one mesh per long style (perm, twin tails); base is the male head with the short cut,
  // deltas are skeleton, style and both
  function loadHair(HD) {
    var n = HD.nv, hb = new Float32Array(n * STRIDE);
    var p = new Uint16Array(dec(HD.pos).buffer), nr = new Int8Array(dec(HD.nrm).buffer), a = dec(HD.ao);
    for (var i = 0; i < n; i++) {
      for (var c = 0; c < 3; c++) {
        hb[i * STRIDE + c] = HD.bbMin[c] + p[i * 3 + c] / 65535 * (HD.bbMax[c] - HD.bbMin[c]);
        hb[i * STRIDE + 3 + c] = nr[i * 3 + c] / 127;
      }
      hb[i * STRIDE + 6] = a[i] / 255;
    }
    var deltas = HD.targets.map(function (t) {
      var q = new Int16Array(dec(t.pos).buffer), qn = new Int8Array(dec(t.nrm).buffer), qa = new Int8Array(dec(t.ao).buffer);
      var out = new Float32Array(n * STRIDE), ps = t.posScale / 32767, ns = t.nrmScale / 127;
      for (var i = 0; i < n; i++) {
        for (var c = 0; c < 3; c++) { out[i * STRIDE + c] = q[i * 3 + c] * ps; out[i * STRIDE + 3 + c] = qn[i * 3 + c] * ns; }
        out[i * STRIDE + 6] = qa[i] / 127;
      }
      return out;
    });
    return { nv: n, base: hb, cur: new Float32Array(n * STRIDE), idx: new Uint16Array(dec(HD.idx).buffer), deltas: deltas, vbo: null, ibo: null };
  }
  var hairSets = { perm: loadHair(D.hair), twin: loadHair(D.hairTwin) };

  // where every body vertex sits on the average female figure: underwear is cut to shape there, so it
  // stays on the same part of the body whatever shape the figure takes
  var femPos = new Float32Array(NV * 3);
  for (var fi = 0; fi < NV; fi++) for (var fc = 0; fc < 3; fc++) {
    var fo = fi * STRIDE + fc;
    femPos[fi * 3 + fc] = base[fo] + deltas[0][fo] + deltas[1][fo] + deltas[2][fo] + deltas[3][fo];
  }

  var basePos = new Float32Array(NV * 3);
  for (var i = 0; i < NV; i++) { basePos[i * 3] = base[i * STRIDE]; basePos[i * 3 + 1] = base[i * STRIDE + 1]; basePos[i * 3 + 2] = base[i * STRIDE + 2]; }

  // garment coordinates per body vertex: arm position, arm share, leg position, leg share (see tools/bake.mjs)
  var garU8 = dec(D.gar);
  var LM = D.lm.male, LF = D.lm.female;
  // only the triangles a garment can ever cover are drawn for it
  var shirtIdx = [], pantsIdx = [];
  (function () {
    var yHip = LM.pelvis[1], yWaist = LM.waist[1], yTop = LM.chin[1] + 0.03;
    for (var t = 0; t < indices.length; t += 3) {
      var top = false, bottom = false;
      for (var k = 0; k < 3; k++) {
        var v = indices[t + k], y = basePos[v * 3 + 1];
        var armT = garU8[v * 4] / 255 * 2 - 0.5, armW = garU8[v * 4 + 1] / 255, legT = garU8[v * 4 + 2] / 255 * 2 - 0.5, legW = garU8[v * 4 + 3] / 255;
        if (y > yHip - 0.12 && y < yTop && !(armW > 0.5 && armT > 0.6)) top = true;
        if (y < yWaist + 0.03 && armW < 0.6 && !(legW > 0.5 && legT > 1.03)) bottom = true;
      }
      if (top) shirtIdx.push(indices[t], indices[t + 1], indices[t + 2]);
      if (bottom) pantsIdx.push(indices[t], indices[t + 1], indices[t + 2]);
    }
    shirtIdx = new Uint16Array(shirtIdx); pantsIdx = new Uint16Array(pantsIdx);
  })();

  // skirt: a small mesh rebuilt from the body's current shape (rings from the waist down)
  var SK_SEG = 64, SK_RING = 18, SK_N = SK_RING * (SK_SEG + 1);
  var skirtBuf = new Float32Array(SK_N * STRIDE), skirtEnv = new Float32Array(SK_RING * SK_SEG), skirtR = new Float32Array(SK_RING * SK_SEG);
  var skirtIdx = (function () {
    var out = [];
    for (var i = 0; i < SK_RING - 1; i++) for (var j = 0; j < SK_SEG; j++) {
      var a = i * (SK_SEG + 1) + j, b = a + 1, c = a + SK_SEG + 1, d = c + 1;
      out.push(a, c, b, b, c, d);
    }
    return new Uint16Array(out);
  })();
  var skirtCand = [];                              // body vertices that can hold a skirt out: hips and legs, not the arms
  for (var sv = 0; sv < NV; sv++) {
    var sy = basePos[sv * 3 + 1];
    if (sy > LM.knee[1] - 0.06 && sy < LM.waist[1] + 0.07 && garU8[sv * 4 + 1] < 128) skirtCand.push(sv);
  }
  var skirtOn = false, skirtHem = 0;

  // ───────────── state ─────────────
  var w = { S: 0, F: 0, M: 0, K: 0 };              // 0 = male average, 1 = female average; K is styling: hair and clothes
  var ext = { B: 0, W: 0, H: 0 };                  // individual variation past the female average: bust, waist, hips
  var view = { yaw: -0.42, pitch: 0.10, zoom: 1, panY: 0 };
  var HOME = { yaw: -0.42, pitch: 0.10, zoom: 1, panY: 0 };
  // what the female side wears: hair 'twin' (twin tails) or 'perm'; outfit 'underwear' (bra and briefs) or 'skirt'
  var LOOK_DEFAULT = { hair: 'twin', outfit: 'underwear' };
  var look = (function () {
    var o = { hair: LOOK_DEFAULT.hair, outfit: LOOK_DEFAULT.outfit };
    try {
      var saved = JSON.parse(localStorage.getItem('look') || 'null');
      if (saved && (saved.hair === 'twin' || saved.hair === 'perm')) o.hair = saved.hair;
      if (saved && (saved.outfit === 'underwear' || saved.outfit === 'skirt')) o.outfit = saved.outfit;
    } catch (e) { /* storage unavailable: defaults */ }
    return o;
  })();
  function saveLook() { try { localStorage.setItem('look', JSON.stringify(look)); } catch (e) { /* ignore */ } }
  var ui = { guides: true, hair: true, clothes: true, touch: false, spin: false, playing: false, dir: 1, hold: 0, p: 0, topic: null };
  var dirtyShape = true, dirtyView = true, raf = 0, lastT = 0, insetTop = 0;

  // ───────────── playback settings ─────────────
  // dur: seconds for one pass between the two ends; ease: 'smooth' (slow at both ends) or 'linear';
  // loop: back and forth, or one pass and stop; hold: seconds to rest at each end while looping.
  var PLAY_DEFAULT = { dur: 6, ease: 'smooth', loop: true, hold: 1 };
  var DUR_MIN = 0.5, DUR_MAX = 120;
  var play = (function () {
    var o = { dur: PLAY_DEFAULT.dur, ease: PLAY_DEFAULT.ease, loop: PLAY_DEFAULT.loop, hold: PLAY_DEFAULT.hold };
    try {
      var saved = JSON.parse(localStorage.getItem('playSettings') || 'null');
      if (saved) {
        if (isFinite(saved.dur)) o.dur = clampDur(saved.dur);
        if (saved.ease === 'linear' || saved.ease === 'smooth') o.ease = saved.ease;
        if (typeof saved.loop === 'boolean') o.loop = saved.loop;
        if (isFinite(saved.hold)) o.hold = Math.max(0, Math.min(5, Math.round(saved.hold * 2) / 2));
      }
    } catch (e) { /* storage unavailable: defaults */ }
    return o;
  })();
  function clampDur(d) { return Math.max(DUR_MIN, Math.min(DUR_MAX, Math.round(d * 10) / 10)); }
  function savePlay() { try { localStorage.setItem('playSettings', JSON.stringify(play)); } catch (e) { /* ignore */ } }
  // progress p (0…1, time-linear) → blend value, and back
  function ease(p) { return play.ease === 'linear' ? p : (1 - Math.cos(Math.PI * p)) / 2; }
  function uneased(v) { v = Math.max(0, Math.min(1, v)); return play.ease === 'linear' ? v : Math.acos(1 - 2 * v) / Math.PI; }
  function fmtSec(t) {
    if (t >= 60 && Math.abs(t % 60) < 1e-9) return (t / 60) + '분';
    if (t >= 60) return Math.floor(t / 60) + '분 ' + fmtSec(Math.round((t % 60) * 10) / 10);
    return (Math.abs(t - Math.round(t)) < 1e-9 ? String(Math.round(t)) : t.toFixed(1)) + '초';
  }

  var mean = function () { return (w.S + w.F + w.M) / 3; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  // Variation rides on the fat-distribution factor: none on the male side, full on the female side.
  function extraWeights() { return { BU: ext.B * w.F, WN: ext.W * w.F, HP: ext.H * w.F }; }
  function cupAt(f) {                              // bust minus underbust (m) at bust-slider position f
    var t = D.cupTable, x = Math.max(0, Math.min(1, f)) * (t.length - 1), i = Math.min(Math.floor(x), t.length - 2);
    return t[i] + (t[i + 1] - t[i]) * (x - i);
  }
  var CUPS = ['AA', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  function cupName(diff) { return CUPS[Math.max(0, Math.min(CUPS.length - 1, Math.round((diff * 100 - 7.5) / 2.5)))]; }
  function mixMetric(key) {
    var m = D.metrics, b = m.base[key], dS = m.S[key] - b, dF = m.F[key] - b, dM = m.M[key] - b, e = extraWeights();
    var v = b + w.S * dS + w.F * dF + w.M * dM + w.S * w.F * w.M * (m.full[key] - b - dS - dF - dM);
    v += e.WN * (m.WN[key] - m.full[key]) + e.HP * (m.HP[key] - m.full[key]);
    if (key === 'bust') v += cupAt(e.BU) - D.cupTable[0];
    return v;
  }

  // ───────────── WebGL ─────────────
  var gl = null, prog = null, floorProg = null, vbo = null, ibo = null, bbo = null, fbo = null, gbo = null, sibo = null, pibo = null, kvbo = null, kibo = null, febo = null;
  var VS = [
    'attribute vec3 aPos; attribute vec3 aNrm; attribute float aAo; attribute vec3 aBase; attribute vec4 aGar; attribute vec3 aFem;',
    'uniform mat4 uVP; uniform float uOffset; uniform vec3 uArmA, uArmB, uLegA, uLegB;',
    'varying vec3 vP; varying vec3 vN; varying float vAo; varying vec3 vB; varying vec4 vG; varying vec3 vF;',
    'void main(){',
    '  vec3 p=aPos+aNrm*uOffset; vP=p; vN=aNrm; vAo=aAo; vB=vec3(abs(aBase.x),aBase.yz); vF=vec3(abs(aFem.x),aFem.yz);',
    // garment coordinates: position along the arm and the leg (exact, from the rest pose) and the baked shares
    '  vec3 ab=uArmB-uArmA, lb=uLegB-uLegA;',
    '  vG=vec4(dot(vB-uArmA,ab)/dot(ab,ab), aGar.y, dot(vB-uLegA,lb)/dot(lb,lb), aGar.w);',
    '  gl_Position=uVP*vec4(p,1.0);',
    '}'
  ].join('\n');
  // uMode: 0 body, 1 hair, 2 top, 3 trousers, 4 skirt, 5 bra, 6 briefs. Garments are the body surface pushed
  // out a little and cut to shape, so they follow every body shape without any data of their own.
  // Top and trousers are cut in rest-pose coordinates (vB), the underwear on the average female figure (vF).
  var FS = [
    'precision highp float;',
    'varying vec3 vP; varying vec3 vN; varying float vAo; varying vec3 vB; varying vec4 vG; varying vec3 vF;',
    'uniform vec3 uEye, uKey, uFill, uBack, uRim, uTint, uAlbedo; uniform float uGloss, uMode;',
    'uniform vec3 uBC, uBR;',      // breast centre and radii on the female figure
    'uniform vec4 uBra;',          // band bottom, band top, strap x, strap half-width
    'uniform vec4 uBrief;',        // top at the front, top at the back, lowest edge (crotch), leg opening at the side
    'uniform float uSeamZ;',       // depth of the side seam: the front of the briefs is in front of it
    'uniform vec3 uHead;',         // rest-pose head: top, height (vertex to chin), half breadth
    'uniform float uFace;',        // 0 male … 1 female face
    // The face is painted on the rest-pose head (b = vB, so it stays put whatever shape the head takes):
    // colour and coverage, a little relief for the light to catch, and wetness for the eyes.
    // X: across the face in head half-breadths; Y: down from the crown in head heights.
    'void face(vec3 b, float down, out vec3 fc, out float cov, out float h, out float wet){',
    '  fc=vec3(0.0); cov=0.0; h=0.0; wet=0.0;',
    '  float X=b.x/uHead.z, Y=(uHead.x-b.y)/uHead.y;',
    '  if(b.z<0.04||X>0.92||Y<0.33||Y>0.86) return;',
    // eye: an almond opening (outer corner a little higher), white, brown iris, pupil, shade under the upper lid
    '  float ex=(X-0.402)/0.188, ey=(0.487-Y)/0.0237-0.12*ex;',
    '  float sp=max(0.0,1.0-ex*ex), up=pow(sp,0.62), lo=0.72*pow(sp,0.9);',
    '  float open=smoothstep(-lo-0.08,-lo+0.08,ey)*(1.0-smoothstep(up-0.08,up+0.08,ey))*(1.0-smoothstep(0.96,1.0,abs(ex)));',
    '  if(open>0.0){',
    '    vec2 m=vec2(ex*0.0145,(ey+0.10)*0.0055); float r=length(m);',
    '    vec3 c=vec3(0.80,0.78,0.75)*(0.8+0.2*sp);',
    '    c=mix(c,vec3(0.26,0.16,0.10)*(0.7+0.3*smoothstep(0.0056,0.0025,r)),1.0-smoothstep(0.0052,0.0058,r));',
    '    c=mix(c,vec3(0.03,0.025,0.02),1.0-smoothstep(0.0019,0.0023,r));',
    '    c*=0.55+0.45*smoothstep(up-0.05,up-0.6,ey);',
    '    fc=c; cov=open; wet=open; h=0.0010*sp*open;',
    '  }',
    // lash line along the upper lid (heavier toward the outer corner), a lighter line under the eye
    '  float lw=0.28+0.30*smoothstep(-0.2,1.0,ex);',
    '  float lash=smoothstep(up-0.04,up+0.04,ey)*(1.0-smoothstep(up+lw-0.05,up+lw+0.05,ey))*(1.0-smoothstep(1.0,1.1,abs(ex)));',
    '  float lowl=smoothstep(-lo-0.16,-lo-0.10,ey)*(1.0-smoothstep(-lo-0.02,-lo+0.04,ey))*(1.0-smoothstep(0.85,1.0,abs(ex)));',
    '  fc=mix(fc,vec3(0.09,0.07,0.06),lash); cov=max(cov,lash);',
    '  fc=mix(fc,vec3(0.36,0.27,0.25),lowl*0.6*(1.0-cov)); cov=max(cov,lowl*0.6);',
    // the fold of the upper lid and the crease above it (relief only)
    '  float f1=(ey-up-0.9)/0.55, f2=(ey-up-2.0)/0.35;',
    '  h+=(0.0011*exp(-f1*f1)-0.0008*exp(-f2*f2))*sp;',
    // eyebrow: lower, straighter and thicker on the male face; higher, arched and finer on the female
    '  float bx=(X-0.43)/0.29;',
    '  float yc=mix(0.413,0.398,uFace)-mix(0.006,0.018,uFace)*(1.0-bx*bx);',
    '  float th=mix(0.020,0.012,uFace)*(0.55+0.45*smoothstep(-1.1,-0.6,bx))*(1.0-0.65*smoothstep(0.0,1.0,bx));',
    '  float brow=(1.0-smoothstep(0.25,1.0,abs(Y-yc)/th))*smoothstep(-1.1,-0.85,bx)*(1.0-smoothstep(0.85,1.05,bx));',
    '  brow*=0.85*mix(0.55,1.0,smoothstep(-1.0,-0.55,bx));',
    '  fc=mix(fc,vec3(0.16,0.11,0.08),brow*(1.0-cov)); cov=max(cov,brow); h+=0.0002*brow;',
    // nostrils, on the underside of the nose
    '  vec2 nq=vec2((X-0.095)/0.045,(Y-0.682)/0.011);',
    '  float nost=(1.0-smoothstep(0.55,1.0,length(nq)))*step(0.075,b.z)*smoothstep(-0.2,-0.55,down)*0.8;',
    '  fc=mix(fc,vec3(0.26,0.18,0.17),nost); cov=max(cov,nost); h-=0.0012*nost;',
    // lips: a cupid's bow on the upper lip, a fuller lower lip (fuller still on the female face), the line between
    '  float lx=X/mix(0.31,0.30,uFace);',
    '  if(abs(lx)<1.08){',
    '    float s=max(0.0,1.0-lx*lx), p1=(abs(lx)-0.25)/0.16, p2=lx/0.08;',
    '    float bow=0.010*exp(-p1*p1)-0.004*exp(-p2*p2);',
    '    float top=0.759-(mix(0.022,0.028,uFace)+bow)*pow(s,0.55), bot=0.759+mix(0.030,0.040,uFace)*pow(s,0.75);',
    '    float lip=smoothstep(top-0.004,top+0.003,Y)*(1.0-smoothstep(bot-0.005,bot+0.004,Y))*(1.0-smoothstep(0.9,1.05,abs(lx)));',
    '    vec3 lc=mix(vec3(0.64,0.50,0.48),vec3(0.68,0.48,0.49),uFace)*(0.92+0.08*smoothstep(0.759,bot,Y));',
    '    fc=mix(fc,lc,lip*(1.0-cov)); cov=max(cov,lip);',
    '    float line=(1.0-smoothstep(0.0,0.0028,abs(Y-0.759-0.004*lx*lx)))*(1.0-smoothstep(0.55,0.95,abs(lx)))*0.65;',
    '    fc=mix(fc,vec3(0.32,0.21,0.20),line); cov=max(cov,line);',
    '    h+=lip*0.0007*pow(s,0.5)-line*0.0006;',
    '  }',
    '}',
    'uniform vec3 uHiC[3]; uniform vec3 uHiR[3]; uniform float uHi;',
    'uniform vec4 uNeck;',        // neckline: height, radius, slope, forward tilt
    'uniform vec4 uCut;',         // top hem height, sleeve end, waistband height, trouser-leg end
    'uniform vec2 uSkirt;',       // hem height (world), strength of the shade it casts on the legs
    'void main(){',
    '  vec3 n=normalize(vN), v=normalize(uEye-vP);',
    '  float ao=vAo, band=0.0;',
    '  float armT=vG.x, armW=vG.y, legT=vG.z, legW=vG.w;',
    '  if(uMode>1.5&&uMode<2.5){',
    '    if(armW>0.5){ if(armT>uCut.y) discard; band=step(uCut.y-0.020,armT); }',
    '    else{',
    '      float r=length(vec2(vB.x,vB.z+0.012));',
    '      float lim=uNeck.x+uNeck.z*(r-uNeck.y)-uNeck.w*(vB.z+0.012);',
    '      if(vB.y<uCut.x||vB.y>lim) discard;',
    '      band=max(step(vB.y,uCut.x+0.010),step(lim-0.011,vB.y));',
    '    }',
    '  }else if(uMode>2.5&&uMode<3.5){',
    '    if(armW>0.5) discard;',
    '    if(legW>0.5){ if(legT>uCut.w) discard; band=step(uCut.w-0.014,legT); }',
    '    else{ if(vB.y>uCut.z) discard; band=step(uCut.z-0.024,vB.y); }',
    '  }else if(uMode>5.5){',
    // briefs: low-rise waistband; the leg openings rise from the crotch to the side, higher at the front
    '    if(armW>0.5) discard;',
    '    float fr=smoothstep(uSeamZ-0.025,uSeamZ+0.025,vF.z);',
    '    float top=mix(uBrief.y,uBrief.x,fr);',
    '    float t=clamp((vF.x-0.018)/mix(0.135,0.118,fr),0.0,1.0);',
    '    float edge=uBrief.z+(uBrief.w-uBrief.z)*pow(t,mix(1.35,0.80,fr));',
    '    if(vF.y>top||vF.y<edge) discard;',
    '    band=max(step(top-0.007,vF.y),step(vF.y,edge+0.005));',
    '  }else if(uMode>4.5){',
    // bra: two cups round the breasts with a plunging top edge, centre gore, under-bust band, straps over the shoulders
    '    if(armW>0.5) discard;',
    '    vec2 cu=vec2((vF.x-uBC.x)/uBR.x,(vF.y-uBC.y)/uBR.y);',
    '    float rr=dot(cu,cu), front=step(uBC.z-0.035,vF.z);',
    '    float topLine=0.30+0.62*cu.x;',
    '    float cup=front*step(rr,1.10)*step(cu.y,topLine);',
    '    float side=smoothstep(uBC.x+0.25*uBR.x,uBC.x+0.95*uBR.x,vF.x)*(1.0-smoothstep(-0.015,-0.055,vF.z));',
    // in front the band comes up to the underwire, the lower arc of each cup
    '    float arc=uBC.y-uBR.y*sqrt(max(1.10-cu.x*cu.x,0.0));',
    '    float bandTop=max(uBra.y+0.032*side,front*step(cu.x*cu.x,1.10)*arc);',
    '    float bandM=step(uBra.x,vF.y)*step(vF.y,bandTop);',
    '    float gore=front*step(vF.x,0.022)*step(uBra.x,vF.y)*step(vF.y,uBC.y-0.25*uBR.y);',
    '    float sx=uBra.z-0.012*smoothstep(0.03,-0.06,vF.z);',
    '    float low=mix(bandTop-0.004,uBC.y+0.55*uBR.y,smoothstep(-0.005,0.03,vF.z));',
    '    float strap=step(abs(vF.x-sx),uBra.w)*step(low,vF.y);',
    '    if(cup+bandM+gore+strap<0.5) discard;',
    '    float cupEdge=cup*max(step(1.0,rr),step(topLine-0.10,cu.y));',
    '    float bandEdge=bandM*(1.0-cup)*max(step(vF.y,uBra.x+0.004),step(bandTop-0.004,vF.y));',
    '    band=max(max(cupEdge,bandEdge),strap*(1.0-cup)*0.6);',
    '  }else if(uMode>3.5){',
    '    if(!gl_FrontFacing) n=-n;',
    '    band=step(0.5,vB.x);',
    '  }else if(uMode<0.5&&legW>0.5){',
    '    ao*=1.0-0.45*uSkirt.y*smoothstep(uSkirt.x-0.13,uSkirt.x,vP.y);',
    '  }',
    '  vec3 albedo=uAlbedo*(1.0-0.24*band); float gloss=uGloss;',
    '  if(uMode<0.5){',
    '    vec3 fc; float cov, h, wet;',
    '    float down=n.y;',
    '    face(vB,down,fc,cov,h,wet);',
    '    if(cov>0.0||h!=0.0){',
    '      albedo=mix(albedo,fc,cov); gloss+=0.5*wet;',
    // relief: tilt the normal by the slope of the painted height (finite differences on the rest pose)
    '      vec3 f2; float c2, hx, hy, w2; float e=0.0008;',
    '      face(vB+vec3(e,0.0,0.0),down,f2,c2,hx,w2);',
    '      face(vB+vec3(0.0,e,0.0),down,f2,c2,hy,w2);',
    '      float sx=vP.x<0.0?-1.0:1.0;',
    '      n=normalize(n-vec3(sx*(hx-h)/e,(hy-h)/e,0.0));',
    '    }',
    '  }',
    '  float m=0.0;',
    '  for(int i=0;i<3;i++){ vec3 q=(vB-uHiC[i])/uHiR[i]; m=max(m,1.0-smoothstep(0.50,1.0,length(q))); }',
    '  albedo=mix(albedo,uTint,m*uHi*0.82);',
    '  vec3 amb=mix(vec3(0.10,0.085,0.08),vec3(0.27,0.31,0.38),n.y*0.5+0.5)*mix(0.12,1.0,ao);',
    '  float kd=max((dot(n,uKey)+0.12)/1.12,0.0); kd*=mix(0.40,1.0,ao);',
    '  float fd=max(dot(n,uFill)*0.6+0.4,0.0); fd*=fd*ao;',
    '  float bd=max(dot(n,uBack),0.0);',
    '  vec3 lit=amb+vec3(1.0,0.955,0.90)*kd*0.80+vec3(0.50,0.62,0.86)*fd*0.13;',
    '  vec3 col=albedo*lit;',
    '  vec3 hv=normalize(uKey+v);',
    '  col+=vec3(1.0,0.97,0.93)*pow(max(dot(n,hv),0.0),mix(30.0,90.0,clamp(gloss*2.0-0.2,0.0,1.0)))*gloss*kd;',
    '  float fr=pow(1.0-max(dot(n,v),0.0),3.0);',
    '  col+=uRim*(fr*(0.10+0.50*bd)+bd*bd*0.16)*mix(0.35,1.0,ao);',
    '  gl_FragColor=vec4(pow(col,vec3(0.4545)),1.0);',
    '}'
  ].join('\n');
  var FVS = [
    'attribute vec2 aXZ; uniform mat4 uVP; varying vec2 vXZ;',
    'void main(){ vXZ=aXZ; gl_Position=uVP*vec4(aXZ.x,0.0,aXZ.y,1.0); }'
  ].join('\n');
  var FFS = [
    'precision highp float; varying vec2 vXZ; uniform float uFoot;',
    'float blob(vec2 p, vec2 c, vec2 r){ vec2 q=(p-c)/r; return exp(-dot(q,q)*1.5); }',
    'void main(){',
    '  float r=length(vXZ);',
    '  float disc=0.030*(1.0-smoothstep(0.60,0.62,r));',
    '  float ring=0.10*(1.0-smoothstep(0.0,0.006,abs(r-0.62)));',
    '  float a=disc+ring;',
    '  float s=0.30*blob(vXZ,vec2(0.0,0.0),vec2(0.40,0.27))',
    '         +0.50*blob(vXZ,vec2(uFoot,0.045),vec2(0.062,0.150))',
    '         +0.50*blob(vXZ,vec2(-uFoot,0.045),vec2(0.062,0.150));',
    '  s=min(s,0.80);',
    '  gl_FragColor=vec4(vec3(a)*(1.0-s), s+a*(1.0-s));',
    '}'
  ].join('\n');

  function compile(vs, fs) {
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i), nm = info.name.replace('[0]', ''); u[nm] = gl.getUniformLocation(p, info.name); }
    return { p: p, u: u };
  }

  function initGL() {
    gl = glCanvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
    if (!gl) return false;
    prog = compile(VS, FS); floorProg = compile(FVS, FFS);
    vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, cur.byteLength, gl.DYNAMIC_DRAW);
    bbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bbo); gl.bufferData(gl.ARRAY_BUFFER, basePos, gl.STATIC_DRAW);
    ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    ['perm', 'twin'].forEach(function (k) {
      var h = hairSets[k];
      h.vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, h.vbo); gl.bufferData(gl.ARRAY_BUFFER, h.cur.byteLength, gl.DYNAMIC_DRAW);
      h.ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, h.ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, h.idx, gl.STATIC_DRAW);
    });
    febo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, febo); gl.bufferData(gl.ARRAY_BUFFER, femPos, gl.STATIC_DRAW);
    gbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, gbo); gl.bufferData(gl.ARRAY_BUFFER, garU8, gl.STATIC_DRAW);
    sibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, shirtIdx, gl.STATIC_DRAW);
    pibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pantsIdx, gl.STATIC_DRAW);
    kvbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, kvbo); gl.bufferData(gl.ARRAY_BUFFER, skirtBuf.byteLength, gl.DYNAMIC_DRAW);
    kibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, kibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, skirtIdx, gl.STATIC_DRAW);
    fbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, fbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.8, -0.8, 0.8, -0.8, -0.8, 0.8, 0.8, 0.8]), gl.STATIC_DRAW);
    gl.clearColor(0, 0, 0, 0);
    dirtyShape = dirtyView = true;
    return true;
  }

  // ───────────── camera ─────────────
  var FOV = 26 * Math.PI / 180, VP = new Float32Array(16), eye = [0, 0, 0], cssW = 1, cssH = 1, dpr = 1;
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++)
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return o;
  }
  function updateCamera() {
    var mt = 62 + insetTop, mb = 26;
    var pxPerM = Math.min((cssH - mt - mb) / 1.76, cssW / 1.34) * view.zoom;
    var viewH = cssH / pxPerM, dist = viewH / (2 * Math.tan(FOV / 2));
    var ty = 0.875 + ((mt - mb) / 2) / pxPerM + view.panY;
    var cp = Math.cos(view.pitch), sp = Math.sin(view.pitch), cy = Math.cos(view.yaw), sy = Math.sin(view.yaw);
    eye = [dist * sy * cp, ty + dist * sp, dist * cy * cp];
    var f = [-sy * cp, -sp, -cy * cp];                       // forward
    var r = [cy, 0, -sy];                                    // right
    var u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    var V = new Float32Array([r[0], u[0], -f[0], 0, r[1], u[1], -f[1], 0, r[2], u[2], -f[2], 0,
      -(r[0] * eye[0] + r[1] * eye[1] + r[2] * eye[2]), -(u[0] * eye[0] + u[1] * eye[1] + u[2] * eye[2]), f[0] * eye[0] + f[1] * eye[1] + f[2] * eye[2], 1]);
    var near = Math.max(0.2, dist - 2), far = dist + 3, t = 1 / Math.tan(FOV / 2), asp = cssW / cssH;
    var P = new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0]);
    VP = mul(P, V);
  }
  function toScreen(x, y, z) {
    var cw = VP[3] * x + VP[7] * y + VP[11] * z + VP[15];
    return [(0.5 + 0.5 * (VP[0] * x + VP[4] * y + VP[8] * z + VP[12]) / cw) * cssW,
            (0.5 - 0.5 * (VP[1] * x + VP[5] * y + VP[9] * z + VP[13]) / cw) * cssH];
  }
  function resize() {
    var r = stage.getBoundingClientRect();
    cssW = Math.max(1, r.width); cssH = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    [glCanvas, ovCanvas].forEach(function (c) { c.width = Math.round(cssW * dpr); c.height = Math.round(cssH * dpr); });
    dirtyView = true; kick();
  }

  // ───────────── topics ─────────────
  var L = D.lm.male;
  var TOPICS = [
    { id: 'shoulder', label: '어깨·흉곽', title: '어깨와 흉곽', tag: '골격',
      body: '사춘기에 테스토스테론이 많이 분비되면 쇄골이 길어지고 흉곽이 커져 어깨가 넓어집니다. 그래서 남성은 어깨가 엉덩이보다 넓은 체형, 여성은 어깨와 엉덩이 너비가 비슷한 체형이 되기 쉽습니다.',
      facts: [['어깨너비(어깨뼈 봉우리 사이)', '남 약 40 cm · 여 약 35–36 cm']],
      hi: [[[0, L.shoulder[1] - 0.07, -0.01], [0.30, 0.15, 0.17]]] },
    { id: 'waist', label: '허리', title: '허리와 허리–엉덩이 비율', tag: '골격 · 지방',
      body: '허리둘레를 엉덩이둘레로 나눈 값(WHR)은 체형 차이를 잘 보여 주는 지표입니다. 여성은 흉곽이 작고 골반이 상대적으로 넓어 허리가 더 잘록해 보입니다.',
      facts: [['허리둘레 ÷ 엉덩이둘레', '남 약 0.85–0.95 · 여 약 0.70–0.80']],
      hi: [[[0, L.waist[1], 0], [0.21, 0.085, 0.17]]] },
    { id: 'pelvis', label: '골반', title: '골반', tag: '골격',
      body: '골반은 남녀 차이가 가장 뚜렷한 뼈입니다. 여성의 골반은 출산에 맞게 낮고 넓으며 가운데 통로가 둥글고 큽니다. 엉덩관절 사이가 상대적으로 넓어 넓적다리뼈가 무릎 쪽으로 더 기울어집니다(Q각).',
      facts: [['두덩밑각(치골하각)', '남 약 50–70° · 여 약 80–90°'], ['Q각', '남 약 12–14° · 여 약 15–18°']],
      hi: [[[0, L.pelvis[1] - 0.01, 0], [0.24, 0.105, 0.18]]] },
    { id: 'fat', label: '지방 분포', title: '지방 분포', tag: '지방',
      body: '에스트로겐은 피하지방이 가슴·엉덩이·허벅지에 쌓이게 하고, 남성은 지방이 주로 배에 쌓입니다. 건강한 범위의 체지방률도 여성이 더 높습니다.',
      facts: [['체지방률(건강한 젊은 성인)', '남 약 12–20% · 여 약 20–30%']],
      hi: [[[0.07, L.chest[1] - 0.01, 0.07], [0.10, 0.085, 0.075]], [[0.09, L.pelvis[1] - 0.05, -0.04], [0.15, 0.13, 0.15]], [[0.09, L.thigh[1] - 0.03, 0], [0.11, 0.15, 0.12]]] },
    { id: 'muscle', label: '근육', title: '근육량', tag: '근육',
      body: '테스토스테론은 근육 단백질 합성을 늘립니다. 남성은 평균적으로 근육량이 더 많고, 그 차이는 다리보다 어깨·팔 같은 상체에서 더 큽니다.',
      facts: [['골격근량(체중 대비)', '남 약 38% · 여 약 31%']],
      hi: [[[L.upperArm[0] - 0.02, L.upperArm[1] + 0.06, L.upperArm[2]], [0.10, 0.21, 0.11]], [[0, L.shoulder[1] + 0.035, -0.02], [0.17, 0.065, 0.09]], [[L.foreArm[0], L.foreArm[1], L.foreArm[2]], [0.075, 0.15, 0.085]]] },
    { id: 'neck', label: '목·후두', title: '목과 후두', tag: '골격',
      body: '남성은 사춘기에 후두의 방패연골이 커지며 앞으로 튀어나와 울대뼈(후두융기)가 보이고, 성대가 길고 두꺼워져 목소리가 한 옥타브쯤 낮아집니다.',
      facts: [['말할 때 기본 음높이', '남 약 100–130 Hz · 여 약 190–230 Hz']],
      hi: [[[0, L.larynx[1], 0.0], [0.085, 0.062, 0.085]]] },
    { id: 'height', label: '키·손발', title: '키와 손발', tag: '골격',
      body: '여성은 사춘기가 2년쯤 먼저 시작되고 먼저 끝나 성장판이 일찍 닫힙니다. 남성은 더 오래, 더 빠르게 자라 평균 키가 7–8% 정도 크고 손과 발도 큽니다.',
      facts: [['평균 키(한국 성인, 근사)', '남 약 172 cm · 여 약 160 cm']],
      hi: [[[L.hand[0], L.hand[1], L.hand[2]], [0.07, 0.13, 0.08]], [[L.foot[0], 0.04, L.foot[2]], [0.085, 0.085, 0.17]]] },
    { id: 'face', label: '얼굴형', title: '머리와 얼굴', tag: '골격',
      body: '남성은 평균적으로 눈썹 위 뼈가 도드라지고 아래턱이 넓고 각지며 턱끝이 큽니다. 여성은 이마가 더 수직에 가깝고 턱선이 둥급니다. 눈썹은 남성이 평균적으로 더 굵고 눈에 가깝게 놓이며, 입술은 여성이 상대적으로 도톰한 편입니다.',
      facts: [],
      hi: [[[0, L.top[1] - 0.15, 0.03], [0.10, 0.115, 0.11]]] }
  ];
  var FAR = [[9, 9, 9], [1, 1, 1]], hiAmt = 0, hiTarget = 0, hiC = new Float32Array(9), hiR = new Float32Array(9);
  function setTopic(id) {
    ui.topic = ui.topic === id ? null : id;
    var t = null;
    TOPICS.forEach(function (x) { if (x.id === ui.topic) t = x; });
    Array.prototype.forEach.call($('topics').children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.id === ui.topic)); });
    var card = $('card');
    if (!t) {
      card.innerHTML = '<p class="empty">주제를 고르면 모형에서 해당 부위가 표시되고 설명이 나옵니다.</p>';
      hiTarget = 0;
    } else {
      card.innerHTML = '<h3>' + t.title + '<em>' + t.tag + '</em></h3><p>' + t.body + '</p>' +
        (t.facts.length ? '<div class="facts">' + t.facts.map(function (f) { return '<div><span>' + f[0] + '</span><span>' + f[1] + '</span></div>'; }).join('') + '</div>' : '');
      for (var i = 0; i < 3; i++) { var h = t.hi[i] || FAR; hiC.set(h[0], i * 3); hiR.set(h[1], i * 3); }
      hiTarget = 1;
    }
    card.parentNode.scrollTop = 0;
    kick();
  }

  // ───────────── drawing ─────────────
  var A_COL = [95, 208, 197], B_COL = [242, 166, 94];
  var TOP_A = [0.13, 0.36, 0.37], TOP_B = [0.72, 0.42, 0.20], BOTTOM_COL = [0.085, 0.10, 0.15];   // garment colours (linear)
  var UNDER_COL = [0.60, 0.27, 0.33];              // bra and briefs, a matching set
  // rest: the blended shape; cur: rest plus whatever is being pressed or pulled (what is drawn)
  var rest = new Float32Array(NV * STRIDE);
  function blend() {
    var wS = w.S, wF = w.F, wM = w.M, wR = wS * wF * wM;
    var dS = deltas[0], dF = deltas[1], dM = deltas[2], dR = deltas[3], cur = rest;
    for (var i = 0, n = NV * STRIDE; i < n; i++) cur[i] = base[i] + wS * dS[i] + wF * dF[i] + wM * dM[i] + wR * dR[i];
    var e = extraWeights();
    for (var k in e) {
      var we = e[k], x = extras[k];
      if (we < 1e-4) continue;
      for (var j = 0; j < x.n; j++) {
        var o = x.idx[j] * STRIDE, q = j * STRIDE;
        cur[o] += we * x.d[q]; cur[o + 1] += we * x.d[q + 1]; cur[o + 2] += we * x.d[q + 2];
        cur[o + 3] += we * x.d[q + 3]; cur[o + 4] += we * x.d[q + 4]; cur[o + 5] += we * x.d[q + 5];
        cur[o + 6] += we * x.d[q + 6];
      }
    }
  }

  // ───────────── touch: press, pull, let go ─────────────
  // Each finger on the body holds a "dent": the patch of surface around the touched point, found by walking
  // along the mesh so that pulling the waist does not drag the arm beside it. Held still it presses in (the
  // flesh around it bulges a little), dragged it pulls along (wider and stiffer the further it goes), and
  // let go it springs back with a wobble. Clothes follow, since they are drawn from the body surface.
  var DENT = { radius: 0.055, grow: 0.45, region: 0.26, press: 0.026, pullMax: 0.10, bulge: 0.2, max: 6 };
  var dents = [], dentsDirty = false;
  var adj = (function () {                         // neighbours and surrounding triangles of every vertex
    var nt = indices.length / 3, st = new Int32Array(NV + 1), ts = new Int32Array(NV + 1), t, k;
    for (t = 0; t < nt; t++) for (k = 0; k < 3; k++) { st[indices[t * 3 + k] + 1] += 2; ts[indices[t * 3 + k] + 1] += 1; }
    for (k = 0; k < NV; k++) { st[k + 1] += st[k]; ts[k + 1] += ts[k]; }
    var nb = new Int32Array(st[NV]), tri = new Int32Array(ts[NV]), f1 = st.slice(0, NV), f2 = ts.slice(0, NV);
    for (t = 0; t < nt; t++) {
      var a = indices[t * 3], b = indices[t * 3 + 1], c = indices[t * 3 + 2];
      nb[f1[a]++] = b; nb[f1[a]++] = c; nb[f1[b]++] = a; nb[f1[b]++] = c; nb[f1[c]++] = a; nb[f1[c]++] = b;
      tri[f2[a]++] = t; tri[f2[b]++] = t; tri[f2[c]++] = t;
    }
    return { start: st, nb: nb, tstart: ts, tri: tri };
  })();
  // (double precision: a distance rounded on storing would no longer match the one queued, and the walk would stop early)
  var gdist = new Float64Array(NV).fill(Infinity), stamp = new Int32Array(NV), stampN = 0;

  // surface distance from the touched point to every vertex within maxD (Dijkstra along mesh edges)
  function region(tri, hit, maxD) {
    var hv = [], hd = [], touched = [], k, v, d;
    var push = function (vv, dd) {
      var i = hv.length; hv.push(vv); hd.push(dd);
      while (i > 0) { var p = (i - 1) >> 1; if (hd[p] <= dd) break; hv[i] = hv[p]; hd[i] = hd[p]; i = p; }
      hv[i] = vv; hd[i] = dd;
    };
    var pop = function () {
      v = hv[0]; d = hd[0];
      var lv = hv.pop(), ld = hd.pop(), n = hv.length, i = 0;
      if (!n) return;
      for (;;) {
        var l = 2 * i + 1, r = l + 1, m = -1, md = ld;
        if (l < n && hd[l] < md) { m = l; md = hd[l]; }
        if (r < n && hd[r] < md) { m = r; md = hd[r]; }
        if (m < 0) break;
        hv[i] = hv[m]; hd[i] = hd[m]; i = m;
      }
      hv[i] = lv; hd[i] = ld;
    };
    var len = function (a, b) { var x = rest[a] - rest[b], y = rest[a + 1] - rest[b + 1], z = rest[a + 2] - rest[b + 2]; return Math.sqrt(x * x + y * y + z * z); };
    for (k = 0; k < 3; k++) {
      var sv = indices[tri * 3 + k], o = sv * STRIDE;
      var sd = Math.sqrt((rest[o] - hit[0]) * (rest[o] - hit[0]) + (rest[o + 1] - hit[1]) * (rest[o + 1] - hit[1]) + (rest[o + 2] - hit[2]) * (rest[o + 2] - hit[2]));
      if (sd < gdist[sv]) { if (gdist[sv] === Infinity) touched.push(sv); gdist[sv] = sd; push(sv, sd); }
    }
    while (hv.length) {
      pop();
      if (d > gdist[v]) continue;
      for (k = adj.start[v]; k < adj.start[v + 1]; k++) {
        var u = adj.nb[k], nd = d + len(u * STRIDE, v * STRIDE);
        if (nd < gdist[u] && nd <= maxD) { if (gdist[u] === Infinity) touched.push(u); gdist[u] = nd; push(u, nd); }
      }
    }
    var verts = new Int32Array(touched.length), dist = new Float32Array(touched.length);
    for (k = 0; k < touched.length; k++) { verts[k] = touched[k]; dist[k] = gdist[touched[k]]; gdist[touched[k]] = Infinity; }
    return { verts: verts, dist: dist };
  }

  var INV = new Float32Array(16);
  function invert4(m, out) {
    var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
    var a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11], a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
    var b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return false;
    det = 1 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return true;
  }
  // the ray under a point on the screen (client coordinates), in world space
  function screenRay(cx, cy) {
    var r = glCanvas.getBoundingClientRect(), nx = (cx - r.left) / r.width * 2 - 1, ny = 1 - (cy - r.top) / r.height * 2;
    invert4(VP, INV);
    var at = function (z) {
      var ww = INV[3] * nx + INV[7] * ny + INV[11] * z + INV[15];
      return [(INV[0] * nx + INV[4] * ny + INV[8] * z + INV[12]) / ww, (INV[1] * nx + INV[5] * ny + INV[9] * z + INV[13]) / ww, (INV[2] * nx + INV[6] * ny + INV[10] * z + INV[14]) / ww];
    };
    var a = at(-1), b = at(1), dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], l = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return { o: a, d: [dx / l, dy / l, dz / l] };
  }
  // nearest triangle the ray passes through (Möller–Trumbore)
  function rayHit(ray, pos, idx) {
    var ox = ray.o[0], oy = ray.o[1], oz = ray.o[2], dx = ray.d[0], dy = ray.d[1], dz = ray.d[2], best = Infinity, bt = -1, bu = 0, bv = 0;
    for (var t = 0, n = idx.length; t < n; t += 3) {
      var a = idx[t] * STRIDE, b = idx[t + 1] * STRIDE, c = idx[t + 2] * STRIDE;
      var ax = pos[a], ay = pos[a + 1], az = pos[a + 2];
      var e1x = pos[b] - ax, e1y = pos[b + 1] - ay, e1z = pos[b + 2] - az, e2x = pos[c] - ax, e2y = pos[c + 1] - ay, e2z = pos[c + 2] - az;
      var px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz;
      if (det > -1e-12 && det < 1e-12) continue;
      var inv = 1 / det, tx = ox - ax, ty = oy - ay, tz = oz - az, u = (tx * px + ty * py + tz * pz) * inv;
      if (u < 0 || u > 1) continue;
      var qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, v = (dx * qx + dy * qy + dz * qz) * inv;
      if (v < 0 || u + v > 1) continue;
      var dist = (e2x * qx + e2y * qy + e2z * qz) * inv;
      if (dist > 1e-4 && dist < best) { best = dist; bt = t / 3; bu = u; bv = v; }
    }
    return bt < 0 ? null : { t: best, tri: bt, u: bu, v: bv };
  }
  function haptic() {
    try { if (window.AndroidShell && window.AndroidShell.tick) window.AndroidShell.tick(); else if (navigator.vibrate) navigator.vibrate(10); } catch (e) { /* no haptics */ }
  }
  // put a finger on the body: returns false when the ray misses it (or the hair is in front)
  function grab(id, cx, cy) {
    if (dents.length >= DENT.max) return false;
    var ray = screenRay(cx, cy), hb = rayHit(ray, cur, indices);
    if (!hb) return false;
    if (ui.hair) { var h = hairSets[look.hair], hh = rayHit(ray, h.cur, h.idx); if (hh && hh.t < hb.t - 0.002) return false; }
    var hit = [ray.o[0] + ray.d[0] * hb.t, ray.o[1] + ray.d[1] * hb.t, ray.o[2] + ray.d[2] * hb.t];
    var t3 = hb.tri * 3, bw = [1 - hb.u - hb.v, hb.u, hb.v], ci = bw[0] >= bw[1] && bw[0] >= bw[2] ? 0 : bw[1] >= bw[2] ? 1 : 2;
    var nx = 0, ny = 0, nz = 0;
    for (var k = 0; k < 3; k++) { var o = indices[t3 + k] * STRIDE; nx += bw[k] * rest[o + 3]; ny += bw[k] * rest[o + 4]; nz += bw[k] * rest[o + 5]; }
    var nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1, reg = region(hb.tri, hit, DENT.region);
    dents.push({ id: id, verts: reg.verts, dist: reg.dist, centre: indices[t3 + ci], n0: [nx / nl, ny / nl, nz / nl],
      d: [0, 0, 0], v: [0, 0, 0], held: true, t: 0, moved: false, sx: cx, sy: cy, cx: cx, cy: cy });
    haptic();
    return true;
  }
  function dentOf(id) { for (var i = 0; i < dents.length; i++) if (dents[i].id === id) return dents[i]; return null; }
  function release(id) { var k = dentOf(id); if (k) { k.held = false; k.id = null; } }
  // where a screen point lands on the plane that faces the camera through the dent's centre
  function planePoint(k, cx, cy) {
    var cp = Math.cos(view.pitch), fx = -Math.sin(view.yaw) * cp, fy = -Math.sin(view.pitch), fz = -Math.cos(view.yaw) * cp;
    var o = k.centre * STRIDE, ray = screenRay(cx, cy);
    var t = ((rest[o] - ray.o[0]) * fx + (rest[o + 1] - ray.o[1]) * fy + (rest[o + 2] - ray.o[2]) * fz) / (ray.d[0] * fx + ray.d[1] * fy + ray.d[2] * fz);
    return [ray.o[0] + ray.d[0] * t, ray.o[1] + ray.d[1] * t, ray.o[2] + ray.d[2] * t];
  }
  // springs: firm and well damped while held (it follows the finger), soft and bouncy once let go
  function stepDents(dt) {
    var TAU = Math.PI * 2;
    for (var i = dents.length - 1; i >= 0; i--) {
      var k = dents[i], tg = [0, 0, 0], om, ze, c;
      if (k.held) {
        k.t += dt;
        if (k.moved) {
          var a = planePoint(k, k.sx, k.sy), b = planePoint(k, k.cx, k.cy), px = b[0] - a[0], py = b[1] - a[1], pz = b[2] - a[2];
          var l = Math.sqrt(px * px + py * py + pz * pz);
          if (l > 1e-9) { var sc = DENT.pullMax * Math.tanh(l / DENT.pullMax) / l; tg = [px * sc, py * sc, pz * sc]; }
        } else {
          var depth = DENT.press * (1 - Math.exp(-k.t / 0.16));
          tg = [-k.n0[0] * depth, -k.n0[1] * depth, -k.n0[2] * depth];
        }
        om = TAU * 8; ze = 0.9;
      } else { om = TAU * 3.2; ze = 0.16; }
      var n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
      for (var s = 0; s < n; s++) for (c = 0; c < 3; c++) {
        k.v[c] += (om * om * (tg[c] - k.d[c]) - 2 * ze * om * k.v[c]) * h;
        k.d[c] += k.v[c] * h;
      }
      if (!k.held && Math.abs(k.d[0]) + Math.abs(k.d[1]) + Math.abs(k.d[2]) < 2e-4 && Math.abs(k.v[0]) + Math.abs(k.v[1]) + Math.abs(k.v[2]) < 4e-3) {
        dents.splice(i, 1); dentsDirty = true;
      }
    }
  }
  // the shape that is drawn: rest, moved by every dent, with fresh normals where it moved
  function composeBody() {
    cur.set(rest);
    if (dents.length) {
      var moved = [], i, j, o;
      stampN++;
      for (var di = 0; di < dents.length; di++) {
        var k = dents[di], dx = k.d[0], dy = k.d[1], dz = k.d[2], n0 = k.n0;
        var dn = dx * n0[0] + dy * n0[1] + dz * n0[2], tx = dx - dn * n0[0], ty = dy - dn * n0[1], tz = dz - dn * n0[2];
        var R = DENT.radius + DENT.grow * Math.sqrt(dx * dx + dy * dy + dz * dz), invR = 1 / R, e0 = DENT.region * 0.72, e1 = DENT.region;
        for (j = 0; j < k.verts.length; j++) {
          i = k.verts[j];
          var g = k.dist[j], q2 = g * invR * g * invR, fade = 1;
          if (g > e0) { var f = (g - e0) / (e1 - e0); fade = f >= 1 ? 0 : 1 - f * f * (3 - 2 * f); }
          var wv = Math.exp(-q2) * fade;
          // the part along the surface normal follows each vertex's own normal, so dents stay round on curved
          // surfaces; pressing in pushes a little flesh up around the dent
          var nPart = dn < 0 ? dn * (wv - DENT.bulge * Math.exp(-q2 / 2.56) * q2 * fade) : dn * wv;
          o = i * STRIDE;
          cur[o] += wv * tx + nPart * rest[o + 3]; cur[o + 1] += wv * ty + nPart * rest[o + 4]; cur[o + 2] += wv * tz + nPart * rest[o + 5];
          if (nPart < 0) cur[o + 6] *= 1 - Math.min(0.45, -nPart * 13);   // the bottom of a dent sits in its own shade
          if (stamp[i] !== stampN) { stamp[i] = stampN; moved.push(i); }
        }
      }
      for (j = 0; j < moved.length; j++) {             // normal: rest normal turned by how much the faces around it turned
        i = moved[j];
        var ax = 0, ay = 0, az = 0, bx = 0, by = 0, bz = 0;
        for (var tk = adj.tstart[i]; tk < adj.tstart[i + 1]; tk++) {
          var t3 = adj.tri[tk] * 3, a = indices[t3] * STRIDE, b = indices[t3 + 1] * STRIDE, c2 = indices[t3 + 2] * STRIDE;
          var u1 = cur[b] - cur[a], u2 = cur[b + 1] - cur[a + 1], u3 = cur[b + 2] - cur[a + 2], w1 = cur[c2] - cur[a], w2 = cur[c2 + 1] - cur[a + 1], w3 = cur[c2 + 2] - cur[a + 2];
          ax += u2 * w3 - u3 * w2; ay += u3 * w1 - u1 * w3; az += u1 * w2 - u2 * w1;
          u1 = rest[b] - rest[a]; u2 = rest[b + 1] - rest[a + 1]; u3 = rest[b + 2] - rest[a + 2]; w1 = rest[c2] - rest[a]; w2 = rest[c2 + 1] - rest[a + 1]; w3 = rest[c2 + 2] - rest[a + 2];
          bx += u2 * w3 - u3 * w2; by += u3 * w1 - u1 * w3; bz += u1 * w2 - u2 * w1;
        }
        var la = Math.sqrt(ax * ax + ay * ay + az * az) || 1, lb = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
        o = i * STRIDE;
        var nx = rest[o + 3] + ax / la - bx / lb, ny = rest[o + 4] + ay / la - by / lb, nz = rest[o + 5] + az / la - bz / lb, nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        cur[o + 3] = nx / nl; cur[o + 4] = ny / nl; cur[o + 5] = nz / nl;
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferSubData(gl.ARRAY_BUFFER, 0, cur);
  }

  function blendHair() {                           // only the style being shown
    var h = hairSets[look.hair], wS = w.S, wK = w.K, wR = wS * wK, dS = h.deltas[0], dK = h.deltas[1], dR = h.deltas[2], hb = h.base, hc = h.cur;
    for (var i = 0, n = h.nv * STRIDE; i < n; i++) hc[i] = hb[i] + wS * dS[i] + wK * dK[i] + wR * dR[i];
    gl.bindBuffer(gl.ARRAY_BUFFER, h.vbo); gl.bufferSubData(gl.ARRAY_BUFFER, 0, hc);
  }

  // The skirt hangs from the body as it is right now: fitted from the waist to the fullest part of the
  // hips, then straight down with a slight flare and soft folds. Its length grows with the styling weight.
  function buildSkirt() {
    var c = w.K;
    skirtOn = ui.clothes && look.outfit === 'skirt' && c > 0.03;
    if (!skirtOn) return;
    var yW = mixMetric('waistY'), yH = mixMetric('hipY'), yK = lerp(LM.knee[1], LF.knee[1], w.S);
    var top = yW + 0.016, bot = yW - Math.max(0.02, (yW - yK - 0.025) * c), dy = (top - bot) / (SK_RING - 1);
    var wb = D.bands.waist, zc = 0, i, j, k;
    for (i = 0; i < wb.length; i++) zc += cur[wb[i] * STRIDE + 2];
    zc /= wb.length;
    var env = skirtEnv, R = skirtR, TAU = Math.PI * 2;
    for (i = 0; i < env.length; i++) env[i] = 0;
    for (k = 0; k < skirtCand.length; k++) {                 // how far the body reaches in each direction at each ring
      var o = skirtCand[k] * STRIDE, rf = (top - cur[o + 1]) / dy;
      if (rf < -0.8 || rf > SK_RING - 0.2) continue;
      var x = cur[o], z = cur[o + 2] - zc, rad = Math.sqrt(x * x + z * z);
      j = Math.floor((Math.atan2(x, z) + Math.PI) / TAU * SK_SEG) % SK_SEG;
      var i0 = Math.max(0, Math.floor(rf)), i1 = Math.min(SK_RING - 1, Math.ceil(rf));
      if (rad > env[i0 * SK_SEG + j]) env[i0 * SK_SEG + j] = rad;
      if (rad > env[i1 * SK_SEG + j]) env[i1 * SK_SEG + j] = rad;
    }
    for (j = 0; j < SK_SEG; j++) {                           // fitted above the hip line, hanging straight below it
      var prev = 0;
      for (i = 0; i < SK_RING; i++) {
        var e = env[i * SK_SEG + j], y = top - i * dy;
        if (e === 0 || (y < yH + 0.02 && e < prev)) e = prev;
        R[i * SK_SEG + j] = prev = e;
      }
      for (i = SK_RING - 2; i >= 0; i--) if (R[i * SK_SEG + j] === 0) R[i * SK_SEG + j] = R[(i + 1) * SK_SEG + j];
    }
    for (var pass = 0; pass < 3; pass++) for (i = 0; i < SK_RING; i++) {       // soften around the ring
      var first = R[i * SK_SEG], last = R[i * SK_SEG + SK_SEG - 1], before = last;
      for (j = 0; j < SK_SEG; j++) {
        var here = R[i * SK_SEG + j], next = j === SK_SEG - 1 ? first : R[i * SK_SEG + j + 1];
        R[i * SK_SEG + j] = Math.max(here * 0.5 + (before + next) * 0.25, here - 0.004);
        before = here;
      }
    }
    for (i = 0; i < SK_RING; i++) for (j = 0; j <= SK_SEG; j++) {
      var th = j / SK_SEG * TAU - Math.PI, yy = top - i * dy, d = Math.max(0, yH - yy), q = (i * (SK_SEG + 1) + j) * STRIDE;
      var fold = Math.sin(12 * th + 0.7), rr = R[i * SK_SEG + (j % SK_SEG)] + 0.013 + 0.15 * d + 0.034 * d * fold;
      skirtBuf[q] = rr * Math.sin(th); skirtBuf[q + 1] = yy + (i === SK_RING - 1 ? 0.004 * Math.sin(12 * th + 2.2) : 0); skirtBuf[q + 2] = zc + rr * Math.cos(th);
      skirtBuf[q + 6] = 1 - 0.30 * Math.max(0, -fold) * Math.min(1, d / 0.25);
    }
    for (i = 0; i < SK_RING; i++) for (j = 0; j <= SK_SEG; j++) {              // normals from the neighbouring points
      var jn = j === SK_SEG ? 1 : j + 1, jp = j === 0 ? SK_SEG - 1 : j - 1, iu = Math.max(0, i - 1), id = Math.min(SK_RING - 1, i + 1);
      var a = (i * (SK_SEG + 1) + jp) * STRIDE, b = (i * (SK_SEG + 1) + jn) * STRIDE, u = (iu * (SK_SEG + 1) + j) * STRIDE, dn = (id * (SK_SEG + 1) + j) * STRIDE;
      var tx = skirtBuf[b] - skirtBuf[a], ty = skirtBuf[b + 1] - skirtBuf[a + 1], tz = skirtBuf[b + 2] - skirtBuf[a + 2];
      var sx = skirtBuf[dn] - skirtBuf[u], sy2 = skirtBuf[dn + 1] - skirtBuf[u + 1], sz = skirtBuf[dn + 2] - skirtBuf[u + 2];
      var nx = sy2 * tz - sz * ty, ny = sz * tx - sx * tz, nz = sx * ty - sy2 * tx, l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      var q2 = (i * (SK_SEG + 1) + j) * STRIDE;
      skirtBuf[q2 + 3] = nx / l; skirtBuf[q2 + 4] = ny / l; skirtBuf[q2 + 5] = nz / l;
    }
    skirtHem = bot;
    gl.bindBuffer(gl.ARRAY_BUFFER, kvbo); gl.bufferSubData(gl.ARRAY_BUFFER, 0, skirtBuf);
  }

  function drawGL() {
    var W = glCanvas.width, H = glCanvas.height, m = mean();
    gl.viewport(0, 0, W, H);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // floor: platform ring and soft contact shadows
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(floorProg.p);
    gl.uniformMatrix4fv(floorProg.u.uVP, false, VP);
    gl.uniform1f(floorProg.u.uFoot, lerp(D.lm.male.ankle[0], D.lm.female.ankle[0], w.S));
    gl.bindBuffer(gl.ARRAY_BUFFER, fbo);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // figure
    gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    gl.useProgram(prog.p);
    var loc = function (n) { return gl.getAttribLocation(prog.p, n); };
    var aP = loc('aPos'), aN = loc('aNrm'), aA = loc('aAo'), aB = loc('aBase'), aG = loc('aGar'), aF = loc('aFem');
    var bindMesh = function (buf) {                          // an interleaved position / normal / occlusion buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, STRIDE * 4, 0);
      gl.enableVertexAttribArray(aN); gl.vertexAttribPointer(aN, 3, gl.FLOAT, false, STRIDE * 4, 12);
      gl.enableVertexAttribArray(aA); gl.vertexAttribPointer(aA, 1, gl.FLOAT, false, STRIDE * 4, 24);
      gl.enableVertexAttribArray(aB);
    };
    bindMesh(vbo);
    gl.bindBuffer(gl.ARRAY_BUFFER, bbo); gl.vertexAttribPointer(aB, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, gbo); gl.enableVertexAttribArray(aG); gl.vertexAttribPointer(aG, 4, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, febo); gl.enableVertexAttribArray(aF); gl.vertexAttribPointer(aF, 3, gl.FLOAT, false, 0, 0);

    // lights ride with the camera so the figure reads the same from every side
    var cy = Math.cos(view.yaw), sy = Math.sin(view.yaw);
    var rot = function (v) { var l = Math.hypot(v[0], v[1], v[2]); return [(v[0] * cy + v[2] * sy) / l, v[1] / l, (-v[0] * sy + v[2] * cy) / l]; };
    var u = prog.u, c = w.K;
    gl.uniformMatrix4fv(u.uVP, false, VP);
    gl.uniform3fv(u.uEye, eye);
    gl.uniform3fv(u.uKey, rot([-0.52, 0.62, 0.60]));
    gl.uniform3fv(u.uFill, rot([0.80, 0.10, 0.45]));
    gl.uniform3fv(u.uBack, rot([0.55, 0.30, -0.78]));
    gl.uniform3f(u.uRim, lerp(A_COL[0], B_COL[0], m) / 255 * 0.9, lerp(A_COL[1], B_COL[1], m) / 255 * 0.9, lerp(A_COL[2], B_COL[2], m) / 255 * 0.9);
    gl.uniform3f(u.uTint, 1.0, 0.62, 0.20);
    gl.uniform3fv(u.uHiC, hiC); gl.uniform3fv(u.uHiR, hiR); gl.uniform1f(u.uHi, hiAmt);
    var under = look.outfit === 'underwear';
    var ss = function (e0, e1, x) { var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
    if (under) {
      // T-shirt and long trousers give way to the underwear: sleeves and trouser legs retract, the shirt's hem
      // rises and its neckline drops until it is gone, the trousers' waistband slides down past the hips
      gl.uniform4f(u.uNeck, LM.shoulder[1] + 0.030 - 0.52 * ss(0.38, 1.0, c), 0.080, 1.3, 0.25);
      gl.uniform4f(u.uCut, lerp(LM.pelvis[1] - 0.035, LM.chest[1] - 0.075, ss(0.0, 0.55, c)), lerp(0.34, -0.30, ss(0.0, 0.45, c)),
        lerp(LM.pelvis[1] + 0.075, LM.crotch[1] - 0.14, ss(0.40, 1.0, c)), lerp(0.94, -0.35, ss(0.0, 0.60, c)));
    } else {
      // T-shirt and long trousers → scoop-neck top and a skirt over short shorts
      // (the top's hem rises to just under the waist as the skirt grows, so it sits tucked in)
      gl.uniform4f(u.uNeck, LM.shoulder[1] + 0.030, lerp(0.080, 0.100, c), 1.3, lerp(0.25, 0.50, c));
      gl.uniform4f(u.uCut, lerp(LM.pelvis[1] - 0.035, LM.waist[1] - 0.035, Math.min(1, c * 2.5)), lerp(0.34, 0.22, c), LM.pelvis[1] + 0.075, lerp(0.94, 0.13, c));
    }
    // underwear, placed on the average female figure
    var bc = LF.breast, br = LF.breastRad;
    gl.uniform3f(u.uBC, bc[0], bc[1], bc[2]); gl.uniform3f(u.uBR, br[0], br[1], br[2]);
    gl.uniform4f(u.uBra, bc[1] - br[1] - 0.030, bc[1] - 0.92 * br[1], bc[0] + 0.56 * br[0], 0.0065);
    gl.uniform4f(u.uBrief, LF.pelvis[1] + 0.022, LF.pelvis[1] + 0.034, LF.crotch[1] - 0.035, LF.pelvis[1] - 0.040);
    gl.uniform1f(u.uSeamZ, -0.006);
    gl.uniform3f(u.uHead, LM.top[1], LM.head[2], LM.head[0]);
    gl.uniform1f(u.uFace, 0.5 * (w.S + w.F));
    gl.uniform3fv(u.uArmA, LM.armTop); gl.uniform3fv(u.uArmB, LM.wrist); gl.uniform3fv(u.uLegA, LM.hipJ); gl.uniform3fv(u.uLegB, LM.ankle);
    gl.uniform2f(u.uSkirt, skirtHem, ui.clothes && !ui.topic && skirtOn ? Math.min(1, c * 2) : 0);

    gl.uniform1f(u.uMode, 0); gl.uniform1f(u.uOffset, 0);
    gl.uniform3f(u.uAlbedo, 0.73, 0.735, 0.76); gl.uniform1f(u.uGloss, 0.07);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    var dressed = ui.clothes && !ui.topic;                   // a highlighted topic is shown on the bare figure
    if (dressed && under) {                                  // underwear first: top and trousers sit over it
      gl.uniform1f(u.uGloss, 0.05);
      gl.uniform3f(u.uAlbedo, UNDER_COL[0], UNDER_COL[1], UNDER_COL[2]);
      gl.uniform1f(u.uMode, 6); gl.uniform1f(u.uOffset, 0.0028);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pibo);
      gl.drawElements(gl.TRIANGLES, pantsIdx.length, gl.UNSIGNED_SHORT, 0);
      gl.uniform1f(u.uMode, 5); gl.uniform1f(u.uOffset, 0.0034);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sibo);
      gl.drawElements(gl.TRIANGLES, shirtIdx.length, gl.UNSIGNED_SHORT, 0);
    }
    if (dressed) {
      gl.uniform1f(u.uGloss, 0.025);
      gl.uniform1f(u.uMode, 3); gl.uniform1f(u.uOffset, under ? 0.0052 : 0.004);
      gl.uniform3f(u.uAlbedo, BOTTOM_COL[0], BOTTOM_COL[1], BOTTOM_COL[2]);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pibo);
      gl.drawElements(gl.TRIANGLES, pantsIdx.length, gl.UNSIGNED_SHORT, 0);

      gl.uniform1f(u.uMode, 2); gl.uniform1f(u.uOffset, 0.0075);
      gl.uniform3f(u.uAlbedo, lerp(TOP_A[0], TOP_B[0], c), lerp(TOP_A[1], TOP_B[1], c), lerp(TOP_A[2], TOP_B[2], c));
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sibo);
      gl.drawElements(gl.TRIANGLES, shirtIdx.length, gl.UNSIGNED_SHORT, 0);
    }

    // the skirt and the hair are meshes of their own: no garment coordinates, no highlight
    gl.disableVertexAttribArray(aG); gl.vertexAttrib4f(aG, 0, 0, 0, 0);
    gl.disableVertexAttribArray(aF); gl.vertexAttrib3f(aF, 0, 0, 0);
    gl.uniform1f(u.uOffset, 0); gl.uniform1f(u.uHi, 0);
    if (dressed && skirtOn) {
      bindMesh(kvbo); gl.vertexAttribPointer(aB, 3, gl.FLOAT, false, STRIDE * 4, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, kibo);
      gl.uniform1f(u.uMode, 4); gl.uniform1f(u.uGloss, 0.025);
      gl.uniform3f(u.uAlbedo, BOTTOM_COL[0], BOTTOM_COL[1], BOTTOM_COL[2]);
      gl.disable(gl.CULL_FACE);
      gl.drawElements(gl.TRIANGLES, skirtIdx.length, gl.UNSIGNED_SHORT, 0);
      gl.enable(gl.CULL_FACE);
    }
    if (ui.hair) {
      var hs = hairSets[look.hair];
      bindMesh(hs.vbo); gl.vertexAttribPointer(aB, 3, gl.FLOAT, false, STRIDE * 4, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, hs.ibo);
      gl.uniform1f(u.uMode, 1);
      gl.uniform3f(u.uAlbedo, 0.265, 0.205, 0.165); gl.uniform1f(u.uGloss, 0.16);
      gl.drawElements(gl.TRIANGLES, hs.idx.length, gl.UNSIGNED_SHORT, 0);
    }
    for (var a = 0; a < 6; a++) gl.disableVertexAttribArray(a);
  }

  var ctx = ovCanvas.getContext('2d');
  var FONT = 'system-ui,-apple-system,"Noto Sans KR","Noto Sans CJK KR",sans-serif';
  function bandSpan(list) {
    var lo = 1e9, hi = -1e9, ys = 0;
    for (var i = 0; i < list.length; i++) {
      var o = list[i] * STRIDE, s = toScreen(cur[o], cur[o + 1], cur[o + 2]);
      if (s[0] < lo) lo = s[0]; if (s[0] > hi) hi = s[0]; ys += s[1];
    }
    return [lo, hi, ys / list.length];
  }
  function drawOverlay() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    for (var di = 0; di < dents.length; di++) {
      var dk = dents[di];
      if (!dk.held) continue;
      var co = dk.centre * STRIDE, sp = toScreen(cur[co], cur[co + 1], cur[co + 2]);
      ctx.beginPath(); ctx.arc(sp[0], sp[1], 15, 0, Math.PI * 2);
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,196,107,.9)'; ctx.stroke();
      ctx.beginPath(); ctx.arc(sp[0], sp[1], 3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,196,107,.95)'; ctx.fill();
    }
    if (!ui.guides) return;
    var cy = Math.cos(view.yaw), sy = Math.sin(view.yaw);
    var side = function (off, y) { return toScreen(off * cy, y, -off * sy); };   // a point beside the figure, facing the camera
    var height = mixMetric('height');

    // height ruler
    var rx = Math.max(side(-0.50, 0.9)[0], 22);
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(238,241,244,.30)'; ctx.fillStyle = 'rgba(155,166,179,.95)';
    ctx.font = '500 10px ' + FONT; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.beginPath();
    var y0 = side(-0.50, 0)[1], y1 = side(-0.50, 1.76)[1];
    ctx.moveTo(rx + 0.5, y0); ctx.lineTo(rx + 0.5, y1);
    for (var c = 0; c <= 170; c += 10) {
      var yy = Math.round(side(-0.50, c / 100)[1]) + 0.5, major = c % 50 === 0;
      ctx.moveTo(rx, yy); ctx.lineTo(rx + (major ? 8 : 4), yy);
      if (major && c > 0) ctx.fillText(String(c), rx - 4, yy);
    }
    ctx.stroke();

    // live stature
    var top = toScreen(cur[D.topVert * STRIDE], cur[D.topVert * STRIDE + 1], cur[D.topVert * STRIDE + 2]);
    var hy = Math.round(side(-0.50, height)[1]) + 0.5;
    ctx.strokeStyle = 'rgba(238,241,244,.55)'; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(rx, hy); ctx.lineTo(top[0] - 4, hy); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#eef1f4'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.font = '700 12px ' + FONT;
    ctx.fillText((height * 100).toFixed(1), rx + 11, hy + 4);
    var tw = ctx.measureText((height * 100).toFixed(1)).width;
    ctx.font = '500 10px ' + FONT; ctx.fillStyle = 'rgba(155,166,179,.95)';
    ctx.fillText('cm', rx + 13 + tw, hy + 6);

    // width guides (labels collapse to one line when the stage is short and the rows crowd each other)
    var rows = [['shoulder', '어깨너비', mixMetric('shoulder')], ['waist', '허리둘레', mixMetric('waist')], ['hip', '엉덩이둘레', mixMetric('hip')]];
    var spans = rows.map(function (r) { return bandSpan(D.bands[r[0]]); });
    var tight = Math.abs(spans[2][2] - spans[1][2]) < 31;
    var lx = Math.min(side(0.455, 0.9)[0], cssW - (tight ? 92 : 58));
    rows.forEach(function (r, i) {
      var s = spans[i], y = Math.round(s[2]) + 0.5, val = (r[2] * 100).toFixed(1);
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(s[0], y - 4); ctx.lineTo(s[0], y + 4); ctx.moveTo(s[1], y - 4); ctx.lineTo(s[1], y + 4);
      ctx.moveTo(s[0], y); ctx.lineTo(s[1], y);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(238,241,244,.30)'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(s[1] + 3, y); ctx.lineTo(lx - 5, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign = 'left';
      if (tight) {
        ctx.textBaseline = 'middle';
        ctx.font = '500 10px ' + FONT; ctx.fillStyle = 'rgba(155,166,179,.95)';
        ctx.fillText(r[1], lx, y);
        var nw = ctx.measureText(r[1]).width;
        ctx.font = '700 12px ' + FONT; ctx.fillStyle = '#eef1f4';
        ctx.fillText(val, lx + nw + 4, y);
      } else {
        ctx.textBaseline = 'bottom';
        ctx.font = '500 10px ' + FONT; ctx.fillStyle = 'rgba(155,166,179,.95)';
        ctx.fillText(r[1], lx, y - 1);
        ctx.textBaseline = 'top'; ctx.font = '700 12px ' + FONT; ctx.fillStyle = '#eef1f4';
        ctx.fillText(val, lx, y + 1);
      }
    });
  }

  // ───────────── UI ─────────────
  var METRICS = [
    ['height', '키', 'cm', 1, function () { return mixMetric('height') * 100; }, function (m) { return m.height * 100; }],
    ['shoulder', '어깨너비', 'cm', 1, function () { return mixMetric('shoulder') * 100; }, function (m) { return m.shoulder * 100; }],
    ['waist', '허리둘레', 'cm', 1, function () { return mixMetric('waist') * 100; }, function (m) { return m.waist * 100; }],
    ['hip', '엉덩이둘레', 'cm', 1, function () { return mixMetric('hip') * 100; }, function (m) { return m.hip * 100; }],
    ['whr', '허리 ÷ 엉덩이', '', 2, function () { return mixMetric('waist') / mixMetric('hip'); }, function (m) { return m.waist / m.hip; }]
  ];
  METRICS.splice(2, 0, ['bust', '가슴둘레', 'cm', 1, function () { return mixMetric('bust') * 100; }, function (m) { return m.bust * 100; }]);
  var metricEls = [];
  function buildUI() {
    var box = $('metrics'), dl = document.createElement('dl');
    dl.className = 'metrics';
    METRICS.forEach(function (m) {
      var a = m[5](D.metrics.base), b = m[5](D.metrics.full);
      var d = document.createElement('div'); d.className = 'metric';
      d.innerHTML = '<dt>' + m[1] + '</dt><dd><span></span>' + (m[2] ? '<small>' + m[2] + '</small>' : '') + '</dd>' +
        '<div class="track"><i></i></div><div class="range"><span>남 ' + a.toFixed(m[3]) + '</span><span>여 ' + b.toFixed(m[3]) + '</span></div>';
      dl.appendChild(d);
      metricEls.push({ val: d.querySelector('dd span'), dot: d.querySelector('.track i'), a: a, b: b, m: m });
    });
    box.parentNode.replaceChild(dl, box);

    var tp = $('topics');
    TOPICS.forEach(function (t) {
      var b = document.createElement('button');
      b.textContent = t.label; b.dataset.id = t.id; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { setTopic(t.id); });
      tp.appendChild(b);
    });
    ui.topic = 'x'; setTopic('x');           // renders the empty card
  }
  function syncUI() {
    var m = mean(), root = document.documentElement.style;
    var c = [0, 1, 2].map(function (i) { return Math.round(lerp(A_COL[i], B_COL[i], m)); });
    root.setProperty('--mixc', 'rgb(' + c.join(',') + ')');
    metricEls.forEach(function (e) {
      var v = e.m[4]();
      e.val.textContent = v.toFixed(e.m[3]);
      var t = Math.abs(e.b - e.a) < 1e-9 ? 0 : (v - e.a) / (e.b - e.a);
      e.dot.style.left = Math.max(0, Math.min(1, t)) * 100 + '%';
    });
    var st = $('state').lastElementChild, same = Math.abs(w.S - w.F) < 0.002 && Math.abs(w.S - w.M) < 0.002 && Math.abs(w.S - w.K) < 0.002;
    var varied = (ext.B > 0.005 || ext.W > 0.005 || ext.H > 0.005) && w.F > 0.002;
    st.textContent = !same ? '요인별 조합' : m < 0.002 ? '남성 평균' : m > 0.998 ? (varied ? '여성 · 개인차' : '여성 평균') : '중간 ' + Math.round(m * 100) + '%';
    $('xB').value = Math.round(ext.B * 1000); $('xW').value = Math.round(ext.W * 1000); $('xH').value = Math.round(ext.H * 1000);
    var fm = D.metrics.full;
    $('oB').textContent = cupName(cupAt(ext.B)) + '컵';
    $('oW').textContent = ((fm.waist + ext.W * (D.metrics.WN.waist - fm.waist)) * 100).toFixed(0) + ' cm';
    $('oH').textContent = ((fm.hip + ext.H * (D.metrics.HP.hip - fm.hip)) * 100).toFixed(0) + ' cm';
    $('xReset').disabled = !(ext.B > 0 || ext.W > 0 || ext.H > 0);
    $('master').value = Math.round(m * 1000);
    [['S', 'fS', 'oS'], ['F', 'fF', 'oF'], ['M', 'fM', 'oM'], ['K', 'fK', 'oK']].forEach(function (k) {
      $(k[1]).value = Math.round(w[k[0]] * 1000); $(k[2]).textContent = Math.round(w[k[0]] * 100) + '%';
    });
  }
  function setAll(v) { w.S = w.F = w.M = w.K = Math.max(0, Math.min(1, v)); dirtyShape = true; kick(); }
  function setPlaying(on) {
    ui.playing = on; $('btnPlay').classList.toggle('on', on);
    $('btnPlay').setAttribute('aria-label', on ? '일시정지' : '변화 재생');
    if (on) {
      var m = mean(); setAll(m);
      ui.dir = m > 0.995 ? -1 : 1;                 // from the female end it plays back toward the male end
      ui.p = uneased(m); ui.hold = 0;
      lastT = performance.now();                   // the first frame counts the time since the press
    }
    kick();
  }

  // ───────────── playback-speed sheet ─────────────
  // slider: 0.5 s … 2 min on a log scale, snapped to steps that suit the size of the number
  function rangeToDur(x) { var d = DUR_MIN * Math.pow(DUR_MAX / DUR_MIN, x / 1000); return d < 10 ? Math.round(d * 2) / 2 : d < 60 ? Math.round(d) : Math.round(d / 5) * 5; }
  function durToRange(d) { return Math.round(1000 * Math.log(d / DUR_MIN) / Math.log(DUR_MAX / DUR_MIN)); }
  function stepFor(d, up) { return up ? (d < 10 ? 0.5 : d < 60 ? 1 : 5) : (d <= 10 ? 0.5 : d <= 60 ? 1 : 5); }
  function syncSpeed() {
    $('speedLabel').textContent = fmtSec(play.dur);
    $('btnSpeed').setAttribute('aria-label', '재생 속도: 한 번에 ' + fmtSec(play.dur) + '. 눌러서 바꾸기');
    var inp = $('durInput');
    if (document.activeElement !== inp) inp.value = String(play.dur);
    $('durRange').value = durToRange(play.dur);
    $('durDown').disabled = play.dur <= DUR_MIN; $('durUp').disabled = play.dur >= DUR_MAX;
    Array.prototype.forEach.call($('durPresets').children, function (b) { b.setAttribute('aria-pressed', String(+b.dataset.s === play.dur)); });
    Array.prototype.forEach.call($('easeSeg').children, function (b) { b.setAttribute('aria-checked', String(b.dataset.v === play.ease)); });
    Array.prototype.forEach.call($('loopSeg').children, function (b) { b.setAttribute('aria-checked', String((b.dataset.v === 'loop') === play.loop)); });
    $('holdRange').value = Math.round(play.hold * 2); $('holdOut').textContent = fmtSec(play.hold);
    $('holdField').classList.toggle('off', !play.loop);
    $('speedSummary').textContent = play.loop
      ? '남성 평균 → 여성 평균 ' + fmtSec(play.dur) + ', 다시 남성 평균까지 돌아오는 한 바퀴는 ' + fmtSec(Math.round((2 * play.dur + 2 * play.hold) * 10) / 10) + '입니다.'
      : '재생을 누를 때마다 ' + fmtSec(play.dur) + ' 동안 반대쪽 끝까지 바뀌고 멈춥니다.';
  }
  function setPlay(changes) {
    var easeBefore = play.ease;
    for (var k in changes) play[k] = changes[k];
    play.dur = clampDur(play.dur);
    if (play.ease !== easeBefore) ui.p = uneased(mean());     // keep the figure where it is when the curve changes
    savePlay(); syncSpeed();
  }
  function bindSpeed() {
    var sheet = $('speedSheet'), inp = $('durInput');
    var open = function () { syncSpeed(); sheet.hidden = false; };
    var close = function () { if (document.activeElement === inp) inp.blur(); sheet.hidden = true; };
    $('btnSpeed').addEventListener('click', open);
    $('speedClose').addEventListener('click', close);
    sheet.addEventListener('click', function (e) { if (e.target === sheet) close(); });
    $('speedReset').addEventListener('click', function () { setPlay({ dur: PLAY_DEFAULT.dur, ease: PLAY_DEFAULT.ease, loop: PLAY_DEFAULT.loop, hold: PLAY_DEFAULT.hold }); });
    // typed value: applied as soon as it is a number in range, tidied up when the field is left
    inp.addEventListener('input', function () { var v = parseFloat(inp.value); if (isFinite(v) && v >= DUR_MIN && v <= DUR_MAX) setPlay({ dur: v }); });
    inp.addEventListener('change', function () { var v = parseFloat(inp.value); if (isFinite(v)) setPlay({ dur: v }); inp.value = String(play.dur); });
    inp.addEventListener('blur', function () { inp.value = String(play.dur); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') inp.blur(); });
    $('durDown').addEventListener('click', function () { setPlay({ dur: play.dur - stepFor(play.dur, false) }); });
    $('durUp').addEventListener('click', function () { setPlay({ dur: play.dur + stepFor(play.dur, true) }); });
    $('durRange').addEventListener('input', function (e) { setPlay({ dur: rangeToDur(+e.target.value) }); });
    Array.prototype.forEach.call($('durPresets').children, function (b) { b.addEventListener('click', function () { setPlay({ dur: +b.dataset.s }); }); });
    Array.prototype.forEach.call($('easeSeg').children, function (b) { b.addEventListener('click', function () { setPlay({ ease: b.dataset.v }); }); });
    Array.prototype.forEach.call($('loopSeg').children, function (b) { b.addEventListener('click', function () { setPlay({ loop: b.dataset.v === 'loop' }); }); });
    $('holdRange').addEventListener('input', function (e) { setPlay({ hold: +e.target.value / 2 }); });
    syncSpeed();
    return close;
  }

  function syncLook() {
    Array.prototype.forEach.call($('hairSeg').children, function (b) { b.setAttribute('aria-checked', String(b.dataset.v === look.hair)); });
    Array.prototype.forEach.call($('outfitSeg').children, function (b) { b.setAttribute('aria-checked', String(b.dataset.v === look.outfit)); });
    $('lookTo').textContent = (look.hair === 'twin' ? '트윈테일' : '긴 파마') + '·' + (look.outfit === 'underwear' ? '속옷 세트' : '상의·치마');
  }
  function setLook(changes) {
    for (var k in changes) look[k] = changes[k];
    saveLook(); syncLook(); dirtyShape = true; kick();
  }

  function bind() {
    $('master').addEventListener('input', function (e) { setPlaying(false); setAll(e.target.value / 1000); });
    [['S', 'fS'], ['F', 'fF'], ['M', 'fM'], ['K', 'fK']].forEach(function (k) {
      $(k[1]).addEventListener('input', function (e) { setPlaying(false); w[k[0]] = e.target.value / 1000; dirtyShape = true; kick(); });
    });
    [['B', 'xB'], ['W', 'xW'], ['H', 'xH']].forEach(function (k) {
      $(k[1]).addEventListener('input', function (e) {
        setPlaying(false);
        ext[k[0]] = e.target.value / 1000;
        if (w.F < 0.25) w.S = w.F = w.M = w.K = 1;  // variation only shows on the female side, so go there
        dirtyShape = true; kick();
      });
    });
    $('xReset').addEventListener('click', function () { ext.B = ext.W = ext.H = 0; dirtyShape = true; kick(); });
    $('btnPlay').addEventListener('click', function () { setPlaying(!ui.playing); });
    bindSpeed();
    Array.prototype.forEach.call($('hairSeg').children, function (b) { b.addEventListener('click', function () { setLook({ hair: b.dataset.v }); }); });
    Array.prototype.forEach.call($('outfitSeg').children, function (b) { b.addEventListener('click', function () { setLook({ outfit: b.dataset.v }); }); });
    syncLook();
    $('btnGuides').addEventListener('click', function (e) { ui.guides = !ui.guides; e.currentTarget.setAttribute('aria-pressed', String(ui.guides)); dirtyView = true; kick(); });
    $('btnHair').addEventListener('click', function (e) { ui.hair = !ui.hair; e.currentTarget.setAttribute('aria-pressed', String(ui.hair)); dirtyView = true; kick(); });
    $('btnTouch').addEventListener('click', function (e) {
      ui.touch = !ui.touch; e.currentTarget.setAttribute('aria-pressed', String(ui.touch));
      glCanvas.classList.toggle('touching', ui.touch);
      $('hint').textContent = ui.touch ? '몸을 누르거나 끌어 보세요 · 빈 곳을 끌면 돌아갑니다' : '드래그해서 돌려 보세요';
      $('hint').classList.remove('gone');
    });
    $('btnClothes').addEventListener('click', function (e) { ui.clothes = !ui.clothes; e.currentTarget.setAttribute('aria-pressed', String(ui.clothes)); dirtyShape = true; kick(); });
    $('btnSpin').addEventListener('click', function (e) { ui.spin = !ui.spin; e.currentTarget.setAttribute('aria-pressed', String(ui.spin)); kick(); });
    $('btnFront').addEventListener('click', function () { ui.spin = false; $('btnSpin').setAttribute('aria-pressed', 'false'); view.yaw = 0; view.pitch = 0.04; view.zoom = 1; view.panY = 0; dirtyView = true; kick(); });

    var tabs = ['metrics', 'factors', 'vary', 'style', 'learn'];
    tabs.forEach(function (t) {
      $('tab-' + t).addEventListener('click', function () {
        tabs.forEach(function (o) { $('tab-' + o).setAttribute('aria-selected', String(o === t)); $('pane-' + o).hidden = o !== t; });
      });
    });

    var about = $('about');
    var seen = false;
    try { seen = localStorage.getItem('aboutSeen') === '1'; } catch (e) { /* storage unavailable */ }
    var closeAbout = function () { about.hidden = true; try { localStorage.setItem('aboutSeen', '1'); } catch (e) { /* ignore */ } };
    $('btnAbout').addEventListener('click', function () { about.hidden = false; });
    $('aboutClose').addEventListener('click', closeAbout);
    about.addEventListener('click', function (e) { if (e.target === about) closeAbout(); });
    if (!seen && !/[?&]noabout/.test(location.search)) about.hidden = false;
    window.__back = function () {                  // Android back key: close an open sheet first
      if (!$('speedSheet').hidden) { $('speedClose').click(); return true; }
      if (about.hidden) return false; closeAbout(); return true;
    };

    // orbit: one finger turns, two fingers zoom and slide
    var pts = {}, lastTap = 0, pinch = null;
    var count = function () { return Object.keys(pts).length; };
    glCanvas.addEventListener('pointerdown', function (e) {
      try { glCanvas.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
      if (ui.touch && gl && grab(e.pointerId, e.clientX, e.clientY)) {     // a finger on the body presses and pulls it
        if (ui.spin) { ui.spin = false; $('btnSpin').setAttribute('aria-pressed', 'false'); }
        $('hint').classList.add('gone');
        kick(); return;
      }
      pts[e.pointerId] = [e.clientX, e.clientY];
      pinch = null;
      if (count() === 1) {
        var now = performance.now();
        if (now - lastTap < 300) { view.yaw = HOME.yaw; view.pitch = HOME.pitch; view.zoom = 1; view.panY = 0; dirtyView = true; kick(); }
        lastTap = now;
      }
    });
    glCanvas.addEventListener('pointermove', function (e) {
      var k = dentOf(e.pointerId);
      if (k) {
        k.cx = e.clientX; k.cy = e.clientY;
        if (!k.moved && Math.abs(k.cx - k.sx) + Math.abs(k.cy - k.sy) > 8) k.moved = true;
        kick(); return;
      }
      var p = pts[e.pointerId]; if (!p) return;
      var dx = e.clientX - p[0], dy = e.clientY - p[1];
      p[0] = e.clientX; p[1] = e.clientY;
      var ids = Object.keys(pts);
      if (ids.length === 1) {
        view.yaw -= dx * 0.0085; view.pitch = Math.max(0.02, Math.min(0.75, view.pitch + dy * 0.005));
        if (Math.abs(dx) + Math.abs(dy) > 2) { $('hint').classList.add('gone'); if (ui.spin) { ui.spin = false; $('btnSpin').setAttribute('aria-pressed', 'false'); } }
      } else if (ids.length === 2) {
        var a = pts[ids[0]], b = pts[ids[1]], dist = Math.hypot(a[0] - b[0], a[1] - b[1]), midY = (a[1] + b[1]) / 2;
        if (pinch) {
          view.zoom = Math.max(0.8, Math.min(4.5, view.zoom * dist / pinch[0]));
          var pxPerM = Math.min((cssH - 88 - insetTop) / 1.76, cssW / 1.34) * view.zoom;
          view.panY = Math.max(-0.8, Math.min(0.8, view.panY + (midY - pinch[1]) / pxPerM));
        }
        pinch = [dist, midY];
      }
      dirtyView = true; kick();
    });
    var up = function (e) { release(e.pointerId); delete pts[e.pointerId]; pinch = null; kick(); };
    glCanvas.addEventListener('pointerup', up); glCanvas.addEventListener('pointercancel', up);
    glCanvas.addEventListener('wheel', function (e) { e.preventDefault(); view.zoom = Math.max(0.8, Math.min(4.5, view.zoom * Math.exp(-e.deltaY * 0.0012))); dirtyView = true; kick(); }, { passive: false });

    glCanvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); gl = null; });
    glCanvas.addEventListener('webglcontextrestored', function () { if (initGL()) kick(); });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
    // frames stop while the app is hidden; on return, playback carries on from where it was
    document.addEventListener('visibilitychange', function () { lastT = 0; if (!document.hidden) kick(); });
  }

  // ───────────── loop ─────────────
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    var raw = lastT ? Math.max(0, now - lastT) / 1000 : 0.016; lastT = now;
    var dt = Math.min(0.05, raw);
    // playback follows the clock, so slow frames do not stretch the set time
    // (time spent in the background is skipped: see the visibilitychange handler)
    var pdt = Math.min(raw, 5);
    var again = false;

    if (ui.playing) {
      var t = pdt, stop = false;
      while (t > 0 && !stop) {
        if (ui.hold > 0) { var used = Math.min(ui.hold, t); ui.hold -= used; t -= used; continue; }
        var left = ui.dir > 0 ? 1 - ui.p : ui.p, step = t / play.dur;
        if (step < left) { ui.p += ui.dir * step; t = 0; }
        else {                                     // reached an end within this frame
          ui.p = ui.dir > 0 ? 1 : 0; t -= left * play.dur;
          if (play.loop) { ui.dir = -ui.dir; ui.hold = play.hold; } else stop = true;
        }
      }
      var v = ease(ui.p);
      w.S = w.F = w.M = w.K = v; dirtyShape = true;
      if (stop) { setPlaying(false); ui.dir = -ui.dir; } else again = true;
    }
    if (ui.spin) { view.yaw += dt * 0.45; dirtyView = true; again = true; }
    if (Math.abs(hiAmt - hiTarget) > 0.004) { hiAmt += (hiTarget - hiAmt) * Math.min(1, dt * 9); dirtyView = true; again = true; } else if (hiAmt !== hiTarget) { hiAmt = hiTarget; dirtyView = true; }

    var denting = dents.length > 0;
    if (denting) { stepDents(Math.min(raw, 0.25)); again = true; }   // springs follow the clock too (in small steps)
    if (gl && (dirtyShape || dirtyView || denting || dentsDirty)) {
      if (dirtyShape) { blend(); blendHair(); syncUI(); }
      if (dirtyShape || denting || dentsDirty) { composeBody(); buildSkirt(); }
      updateCamera(); drawGL(); drawOverlay();
      dirtyShape = dirtyView = dentsDirty = false;
    }
    if (again) kick(); else lastT = 0;
  }

  // ───────────── start ─────────────
  buildUI(); bind();
  var ok = false;
  try { ok = initGL(); } catch (err) { ok = false; $('fail').textContent = '3D 화면을 시작하지 못했습니다: ' + err.message; }
  if (!ok) { $('fail').hidden = false; if (!$('fail').textContent) $('fail').textContent = '이 기기에서는 3D 그래픽(WebGL)을 사용할 수 없어 모형을 표시하지 못합니다.'; }
  resize(); syncUI();

  // called by the Android shell with the system-bar insets (CSS px): the page draws edge to edge
  window.__setInsets = function (t, r, b, l) {
    var st = document.documentElement.style;
    st.setProperty('--it', t + 'px'); st.setProperty('--ir', r + 'px'); st.setProperty('--ib', b + 'px'); st.setProperty('--il', l + 'px');
    insetTop = t; resize();
  };

  // small hook for automated screenshots
  window.__body = {
    set: function (o) {
      if (o.t != null) { w.S = w.F = w.M = w.K = o.t; }
      ['S', 'F', 'M', 'K'].forEach(function (k) { if (o[k] != null) w[k] = o[k]; });
      if (o.hair != null) { ui.hair = o.hair; $('btnHair').setAttribute('aria-pressed', String(ui.hair)); }
      if (o.clothes != null) { ui.clothes = o.clothes; $('btnClothes').setAttribute('aria-pressed', String(ui.clothes)); }
      ['B', 'W', 'H'].forEach(function (k) { if (o[k] != null) ext[k] = o[k]; });
      ['yaw', 'pitch', 'zoom', 'panY'].forEach(function (k) { if (o[k] != null) view[k] = o[k]; });
      if (o.guides != null) ui.guides = o.guides;
      dirtyShape = dirtyView = true; kick();
    },
    topic: setTopic,
    play: function (o) { setPlay(o); },
    look: function (o) { setLook(o); },
    touch: {
      on: function (v) { if (ui.touch !== !!v) $('btnTouch').click(); },
      nearest: function (p) {                    // vertex nearest a point, on the shape as drawn
        var bi = 0, bd = Infinity;
        for (var i = 0; i < NV; i++) { var o = i * STRIDE, x = cur[o] - p[0], y = cur[o + 1] - p[1], z = cur[o + 2] - p[2], d = x * x + y * y + z * z; if (d < bd) { bd = d; bi = i; } }
        return bi;
      },
      screen: function (i) { var o = i * STRIDE, s = toScreen(cur[o], cur[o + 1], cur[o + 2]), r = glCanvas.getBoundingClientRect(); return [r.left + s[0], r.top + s[1]]; },
      pos: function (i) { var o = i * STRIDE; return { cur: [cur[o], cur[o + 1], cur[o + 2]], rest: [rest[o], rest[o + 1], rest[o + 2]], n: [rest[o + 3], rest[o + 4], rest[o + 5]] }; },
      count: function () { return dents.length; },
      state: function () { return dents.map(function (k) { return { id: k.id, held: k.held, moved: k.moved, d: k.d.map(function (x) { return +x.toFixed(5); }), v: k.v.map(function (x) { return +x.toFixed(5); }) }; }); },
      timePick: function (cx, cy) { var t0 = performance.now(), r = rayHit(screenRay(cx, cy), cur, indices); return { ms: performance.now() - t0, hit: !!r }; }
    },
    get: function () { return { w: { S: w.S, F: w.F, M: w.M, K: w.K }, hair: ui.hair, clothes: ui.clothes, skirt: skirtOn, ext: { B: ext.B, W: ext.W, H: ext.H }, view: { yaw: view.yaw, pitch: view.pitch, zoom: view.zoom }, playing: ui.playing, p: ui.p, dir: ui.dir, settings: { dur: play.dur, ease: play.ease, loop: play.loop, hold: play.hold }, look: { hair: look.hair, outfit: look.outfit }, guides: ui.guides, spin: ui.spin, topic: ui.topic }; }
  };
})();
