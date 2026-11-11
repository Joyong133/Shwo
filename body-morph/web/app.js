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
  var basePos = new Float32Array(NV * 3);
  for (var i = 0; i < NV; i++) { basePos[i * 3] = base[i * STRIDE]; basePos[i * 3 + 1] = base[i * STRIDE + 1]; basePos[i * 3 + 2] = base[i * STRIDE + 2]; }

  // ───────────── state ─────────────
  var w = { S: 0, F: 0, M: 0 };                    // 0 = male average, 1 = female average
  var view = { yaw: -0.42, pitch: 0.10, zoom: 1, panY: 0 };
  var HOME = { yaw: -0.42, pitch: 0.10, zoom: 1, panY: 0 };
  var ui = { guides: true, spin: false, playing: false, dir: 1, hold: 0, topic: null };
  var dirtyShape = true, dirtyView = true, raf = 0, lastT = 0, insetTop = 0;

  var mean = function () { return (w.S + w.F + w.M) / 3; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  function mixMetric(key) {
    var m = D.metrics, b = m.base[key], dS = m.S[key] - b, dF = m.F[key] - b, dM = m.M[key] - b;
    return b + w.S * dS + w.F * dF + w.M * dM + w.S * w.F * w.M * (m.full[key] - b - dS - dF - dM);
  }

  // ───────────── WebGL ─────────────
  var gl = null, prog = null, floorProg = null, vbo = null, ibo = null, bbo = null, fbo = null;
  var VS = [
    'attribute vec3 aPos; attribute vec3 aNrm; attribute float aAo; attribute vec3 aBase;',
    'uniform mat4 uVP;',
    'varying vec3 vP; varying vec3 vN; varying float vAo; varying vec3 vB;',
    'void main(){ vP=aPos; vN=aNrm; vAo=aAo; vB=vec3(abs(aBase.x),aBase.yz); gl_Position=uVP*vec4(aPos,1.0); }'
  ].join('\n');
  var FS = [
    'precision highp float;',
    'varying vec3 vP; varying vec3 vN; varying float vAo; varying vec3 vB;',
    'uniform vec3 uEye, uKey, uFill, uBack, uRim, uTint;',
    'uniform vec3 uHiC[3]; uniform vec3 uHiR[3]; uniform float uHi;',
    'void main(){',
    '  vec3 n=normalize(vN), v=normalize(uEye-vP);',
    '  float ao=vAo;',
    '  vec3 albedo=vec3(0.73,0.735,0.76);',
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
    '  col+=vec3(1.0,0.97,0.93)*pow(max(dot(n,hv),0.0),30.0)*0.07*kd;',
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
      body: '남성은 평균적으로 눈썹 위 뼈가 도드라지고 아래턱이 넓고 각지며 턱끝이 큽니다. 여성은 이마가 더 수직에 가깝고 턱선이 둥급니다.',
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
  function blend() {
    var wS = w.S, wF = w.F, wM = w.M, wR = wS * wF * wM;
    var dS = deltas[0], dF = deltas[1], dM = deltas[2], dR = deltas[3];
    for (var i = 0, n = NV * STRIDE; i < n; i++) cur[i] = base[i] + wS * dS[i] + wF * dF[i] + wM * dM[i] + wR * dR[i];
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferSubData(gl.ARRAY_BUFFER, 0, cur);
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
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    var aP = loc('aPos'), aN = loc('aNrm'), aA = loc('aAo'), aB = loc('aBase');
    gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, STRIDE * 4, 0);
    gl.enableVertexAttribArray(aN); gl.vertexAttribPointer(aN, 3, gl.FLOAT, false, STRIDE * 4, 12);
    gl.enableVertexAttribArray(aA); gl.vertexAttribPointer(aA, 1, gl.FLOAT, false, STRIDE * 4, 24);
    gl.bindBuffer(gl.ARRAY_BUFFER, bbo);
    gl.enableVertexAttribArray(aB); gl.vertexAttribPointer(aB, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

    // lights ride with the camera so the figure reads the same from every side
    var cy = Math.cos(view.yaw), sy = Math.sin(view.yaw);
    var rot = function (v) { var l = Math.hypot(v[0], v[1], v[2]); return [(v[0] * cy + v[2] * sy) / l, v[1] / l, (-v[0] * sy + v[2] * cy) / l]; };
    var u = prog.u;
    gl.uniformMatrix4fv(u.uVP, false, VP);
    gl.uniform3fv(u.uEye, eye);
    gl.uniform3fv(u.uKey, rot([-0.52, 0.62, 0.60]));
    gl.uniform3fv(u.uFill, rot([0.80, 0.10, 0.45]));
    gl.uniform3fv(u.uBack, rot([0.55, 0.30, -0.78]));
    gl.uniform3f(u.uRim, lerp(A_COL[0], B_COL[0], m) / 255 * 0.9, lerp(A_COL[1], B_COL[1], m) / 255 * 0.9, lerp(A_COL[2], B_COL[2], m) / 255 * 0.9);
    gl.uniform3f(u.uTint, 1.0, 0.62, 0.20);
    gl.uniform3fv(u.uHiC, hiC); gl.uniform3fv(u.uHiR, hiR); gl.uniform1f(u.uHi, hiAmt);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    for (var a = 0; a < 4; a++) gl.disableVertexAttribArray(a);
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
    ['whr', '허리 ÷ 엉덩이', '', 2, function () { return mixMetric('waist') / mixMetric('hip'); }, function (m) { return m.waist / m.hip; }],
    ['shr', '어깨 ÷ 엉덩이 너비', '', 2, function () { return mixMetric('shoulder') / mixMetric('hipW'); }, function (m) { return m.shoulder / m.hipW; }]
  ];
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
    var st = $('state').lastElementChild, same = Math.abs(w.S - w.F) < 0.002 && Math.abs(w.S - w.M) < 0.002;
    st.textContent = !same ? '요인별 조합' : m < 0.002 ? '남성 평균' : m > 0.998 ? '여성 평균' : '중간 ' + Math.round(m * 100) + '%';
    $('master').value = Math.round(m * 1000);
    [['S', 'fS', 'oS'], ['F', 'fF', 'oF'], ['M', 'fM', 'oM']].forEach(function (k) {
      $(k[1]).value = Math.round(w[k[0]] * 1000); $(k[2]).textContent = Math.round(w[k[0]] * 100) + '%';
    });
  }
  function setAll(v) { w.S = w.F = w.M = Math.max(0, Math.min(1, v)); dirtyShape = true; kick(); }
  function setPlaying(on) {
    ui.playing = on; $('btnPlay').classList.toggle('on', on);
    $('btnPlay').setAttribute('aria-label', on ? '일시정지' : '변화 재생');
    if (on) { var m = mean(); setAll(m); ui.dir = m > 0.995 ? -1 : 1; ui.hold = 0; }
    kick();
  }

  function bind() {
    $('master').addEventListener('input', function (e) { setPlaying(false); setAll(e.target.value / 1000); });
    [['S', 'fS'], ['F', 'fF'], ['M', 'fM']].forEach(function (k) {
      $(k[1]).addEventListener('input', function (e) { setPlaying(false); w[k[0]] = e.target.value / 1000; dirtyShape = true; kick(); });
    });
    $('btnPlay').addEventListener('click', function () { setPlaying(!ui.playing); });
    $('btnGuides').addEventListener('click', function (e) { ui.guides = !ui.guides; e.currentTarget.setAttribute('aria-pressed', String(ui.guides)); dirtyView = true; kick(); });
    $('btnSpin').addEventListener('click', function (e) { ui.spin = !ui.spin; e.currentTarget.setAttribute('aria-pressed', String(ui.spin)); kick(); });
    $('btnFront').addEventListener('click', function () { ui.spin = false; $('btnSpin').setAttribute('aria-pressed', 'false'); view.yaw = 0; view.pitch = 0.04; view.zoom = 1; view.panY = 0; dirtyView = true; kick(); });

    var tabs = ['metrics', 'factors', 'learn'];
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
    window.__back = function () { if (about.hidden) return false; closeAbout(); return true; };   // Android back key

    // orbit: one finger turns, two fingers zoom and slide
    var pts = {}, lastTap = 0, pinch = null;
    var count = function () { return Object.keys(pts).length; };
    glCanvas.addEventListener('pointerdown', function (e) {
      glCanvas.setPointerCapture(e.pointerId);
      pts[e.pointerId] = [e.clientX, e.clientY];
      pinch = null;
      if (count() === 1) {
        var now = performance.now();
        if (now - lastTap < 300) { view.yaw = HOME.yaw; view.pitch = HOME.pitch; view.zoom = 1; view.panY = 0; dirtyView = true; kick(); }
        lastTap = now;
      }
    });
    glCanvas.addEventListener('pointermove', function (e) {
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
          view.zoom = Math.max(0.8, Math.min(3, view.zoom * dist / pinch[0]));
          var pxPerM = Math.min((cssH - 88 - insetTop) / 1.76, cssW / 1.34) * view.zoom;
          view.panY = Math.max(-0.8, Math.min(0.8, view.panY + (midY - pinch[1]) / pxPerM));
        }
        pinch = [dist, midY];
      }
      dirtyView = true; kick();
    });
    var up = function (e) { delete pts[e.pointerId]; pinch = null; };
    glCanvas.addEventListener('pointerup', up); glCanvas.addEventListener('pointercancel', up);
    glCanvas.addEventListener('wheel', function (e) { e.preventDefault(); view.zoom = Math.max(0.8, Math.min(3, view.zoom * Math.exp(-e.deltaY * 0.0012))); dirtyView = true; kick(); }, { passive: false });

    glCanvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); gl = null; });
    glCanvas.addEventListener('webglcontextrestored', function () { if (initGL()) kick(); });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
  }

  // ───────────── loop ─────────────
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    var dt = Math.min(0.05, lastT ? (now - lastT) / 1000 : 0.016); lastT = now;
    var again = false;

    if (ui.playing) {
      if (ui.hold > 0) { ui.hold -= dt; }
      else {
        var v = mean();
        v += ui.dir * dt * 0.2535 * (0.25 + 3 * v * (1 - v));     // eases in and out, about six seconds per pass
        if (v >= 1) { v = 1; ui.dir = -1; ui.hold = 1.1; } else if (v <= 0) { v = 0; ui.dir = 1; ui.hold = 1.1; }
        w.S = w.F = w.M = v; dirtyShape = true;
      }
      again = true;
    }
    if (ui.spin) { view.yaw += dt * 0.45; dirtyView = true; again = true; }
    if (Math.abs(hiAmt - hiTarget) > 0.004) { hiAmt += (hiTarget - hiAmt) * Math.min(1, dt * 9); dirtyView = true; again = true; } else if (hiAmt !== hiTarget) { hiAmt = hiTarget; dirtyView = true; }

    if (gl && (dirtyShape || dirtyView)) {
      if (dirtyShape) { blend(); syncUI(); }
      updateCamera(); drawGL(); drawOverlay();
      dirtyShape = dirtyView = false;
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
      if (o.t != null) { w.S = w.F = w.M = o.t; }
      ['S', 'F', 'M'].forEach(function (k) { if (o[k] != null) w[k] = o[k]; });
      ['yaw', 'pitch', 'zoom', 'panY'].forEach(function (k) { if (o[k] != null) view[k] = o[k]; });
      if (o.guides != null) ui.guides = o.guides;
      dirtyShape = dirtyView = true; kick();
    },
    topic: setTopic,
    get: function () { return { w: { S: w.S, F: w.F, M: w.M }, view: { yaw: view.yaw, pitch: view.pitch, zoom: view.zoom }, playing: ui.playing, guides: ui.guides, spin: ui.spin, topic: ui.topic }; }
  };
})();
