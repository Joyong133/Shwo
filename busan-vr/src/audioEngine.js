// Web Audio 합성 사운드 (외부 사운드 파일 없음) + ko-KR 안내방송(Web Speech)
//  - 루프: subway(주행음), bus(엔진·노면), sea(파도), city, forest(바람·새), wind, crowd(야구장)
//  - 원샷: 출입문 차임, 안내 차임, 하차벨 부저, 에어 브레이크, 불꽃 등
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.loops = new Map();
    this.buffers = {};
    this.onSpeak = null; // (text) => void  자막 표시용
    this.speechOK = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
    this._speakToken = 0;
  }

  /** 사용자 제스처(클릭·트리거) 안에서 호출해 오디오 잠금 해제 */
  unlock() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.8;
        const comp = this.ctx.createDynamicsCompressor();
        this.master.connect(comp).connect(this.ctx.destination);
        if (this.speechOK) {
          // 일부 브라우저는 첫 발화가 제스처 안에서 일어나야 이후 발화가 허용된다
          const warm = new SpeechSynthesisUtterance(' ');
          warm.volume = 0;
          warm.lang = 'ko-KR';
          window.speechSynthesis.speak(warm);
        }
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (err) {
      console.warn('[audio] 초기화 실패', err);
    }
  }

  get ready() {
    return !!this.ctx && this.ctx.state === 'running';
  }

  _noise(kind) {
    if (this.buffers[kind]) return this.buffers[kind];
    const ctx = this.ctx;
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'brown') {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      } else {
        d[i] = w;
      }
    }
    this.buffers[kind] = buf;
    return buf;
  }

  _noiseSrc(kind) {
    const src = this.ctx.createBufferSource();
    src.buffer = this._noise(kind);
    src.loop = true;
    src.start();
    return src;
  }

  _filter(type, freq, q = 0.7) {
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    return f;
  }

  _gain(v = 0) {
    const g = this.ctx.createGain();
    g.gain.value = v;
    return g;
  }

  _lfo(freq, depth, target) {
    const o = this.ctx.createOscillator();
    o.frequency.value = freq;
    const g = this._gain(depth);
    o.connect(g).connect(target);
    o.start();
    return o;
  }

  // ───────────── 루프 사운드 ─────────────
  _buildLoop(name, out) {
    const ctx = this.ctx;
    const nodes = [];
    const keep = (...n) => {
      nodes.push(...n);
      return n[0];
    };
    const api = { set() {}, tick() {}, stop: () => nodes.forEach((n) => { try { n.stop?.(); n.disconnect?.(); } catch { /* 이미 정지됨 */ } }) };
    const smooth = (param, v, tc = 0.12) => param.setTargetAtTime(v, ctx.currentTime, tc);

    if (name === 'subway') {
      const rumbleG = this._gain(0);
      keep(this._noiseSrc('brown')).connect(keep(this._filter('lowpass', 240))).connect(rumbleG).connect(out);
      const hissG = this._gain(0);
      keep(this._noiseSrc('white')).connect(keep(this._filter('bandpass', 2300, 0.6))).connect(hissG).connect(out);
      const motor = keep(ctx.createOscillator());
      motor.type = 'sawtooth';
      motor.frequency.value = 70;
      const motorG = this._gain(0);
      motor.connect(keep(this._filter('lowpass', 1100))).connect(motorG).connect(out);
      motor.start();
      let speed = 0;
      let acc = 0;
      api.set = (v) => {
        speed = v;
        smooth(rumbleG.gain, 0.15 + 0.85 * v);
        smooth(hissG.gain, 0.1 * v);
        smooth(motor.frequency, 70 + 460 * v, 0.3);
        smooth(motorG.gain, v > 0.02 ? 0.035 + 0.02 * (1 - v) : 0);
      };
      api.tick = (dt) => {
        if (speed < 0.08) return;
        acc += dt * speed;
        if (acc > 0.62) {
          acc = 0;
          this._clack(out, 0);
          this._clack(out, 0.11);
        }
      };
    } else if (name === 'bus') {
      const o1 = keep(ctx.createOscillator());
      o1.type = 'sawtooth';
      const o2 = keep(ctx.createOscillator());
      o2.type = 'square';
      const engG = this._gain(0.07);
      const lp = keep(this._filter('lowpass', 260));
      o1.connect(lp);
      o2.connect(lp);
      lp.connect(engG).connect(out);
      o1.frequency.value = 44;
      o2.frequency.value = 22;
      o1.start();
      o2.start();
      const roadG = this._gain(0);
      keep(this._noiseSrc('brown')).connect(keep(this._filter('lowpass', 520))).connect(roadG).connect(out);
      const windG = this._gain(0);
      keep(this._noiseSrc('white')).connect(keep(this._filter('bandpass', 900, 0.4))).connect(windG).connect(out);
      api.set = (v, open = 0) => {
        smooth(o1.frequency, 44 + 46 * v, 0.25);
        smooth(o2.frequency, 22 + 23 * v, 0.25);
        smooth(engG.gain, 0.06 + 0.07 * v);
        smooth(roadG.gain, 0.55 * v);
        smooth(windG.gain, open * 0.09 * v);
      };
    } else if (name === 'sea') {
      const g = this._gain(0.26);
      keep(this._noiseSrc('brown')).connect(keep(this._filter('lowpass', 800))).connect(g).connect(out);
      keep(this._lfo(0.11, 0.16, g.gain));
      keep(this._lfo(0.07, 0.08, g.gain));
      const foam = this._gain(0.02);
      keep(this._noiseSrc('white')).connect(keep(this._filter('highpass', 2800))).connect(foam).connect(out);
      keep(this._lfo(0.11, 0.018, foam.gain));
    } else if (name === 'city') {
      const g = this._gain(0.3);
      keep(this._noiseSrc('brown')).connect(keep(this._filter('lowpass', 320))).connect(g).connect(out);
      keep(this._lfo(0.05, 0.08, g.gain));
      const mid = this._gain(0.012);
      keep(this._noiseSrc('white')).connect(keep(this._filter('bandpass', 1200, 0.5))).connect(mid).connect(out);
    } else if (name === 'forest' || name === 'wind') {
      const g = this._gain(0.05);
      keep(this._noiseSrc('white')).connect(keep(this._filter('bandpass', 480, 0.5))).connect(g).connect(out);
      keep(this._lfo(0.09, 0.035, g.gain));
      let wait = 1.5;
      api.tick = (dt) => {
        if (name !== 'forest') return;
        wait -= dt;
        if (wait <= 0) {
          wait = 1.6 + Math.random() * 4;
          this._chirp(out);
        }
      };
    } else if (name === 'crowd') {
      const g = this._gain(0.16);
      keep(this._noiseSrc('white')).connect(keep(this._filter('bandpass', 950, 0.35))).connect(g).connect(out);
      keep(this._lfo(0.13, 0.07, g.gain));
      let beat = 0;
      let step = 0;
      api.tick = (dt) => {
        beat -= dt;
        if (beat <= 0) {
          // 쿵 쿵 짝! 응원 리듬
          const pattern = [0.32, 0.32, 0.64, 1.4];
          if (step % 4 < 2) this._thump(out);
          else if (step % 4 === 2) this._clap(out);
          beat = pattern[step % 4];
          step++;
        }
      };
    }
    return api;
  }

  /** 루프 사운드 켜기/끄기. level 0 이면 페이드아웃 후 정지 */
  setLoop(name, level) {
    if (!this.ctx) return;
    let loop = this.loops.get(name);
    if (!loop && level > 0) {
      const out = this._gain(0);
      out.connect(this.master);
      loop = { out, api: this._buildLoop(name, out) };
      this.loops.set(name, loop);
    }
    if (!loop) return;
    loop.out.gain.setTargetAtTime(level, this.ctx.currentTime, 0.35);
    if (level <= 0) {
      this.loops.delete(name);
      setTimeout(() => {
        loop.api.stop();
        loop.out.disconnect();
      }, 1600);
    }
  }

  /** 루프 파라미터 (지하철/버스 속도 0~1 등) */
  setParam(name, ...args) {
    this.loops.get(name)?.api.set(...args);
  }

  stopLoops(except = []) {
    for (const name of [...this.loops.keys()]) if (!except.includes(name)) this.setLoop(name, 0);
  }

  update(dt) {
    if (!this.ready) return;
    for (const loop of this.loops.values()) loop.api.tick(dt);
  }

  // ───────────── 원샷 ─────────────
  _env(g, t0, attack, hold, release, peak) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.setValueAtTime(peak, t0 + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + hold + release);
  }

  _tone(freq, t0, dur, { type = 'sine', peak = 0.25, out = this.master, attack = 0.008, slideTo = null } = {}) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    const g = ctx.createGain();
    this._env(g, t0, attack, 0.01, dur, peak);
    o.connect(g).connect(out);
    o.start(t0);
    o.stop(t0 + dur + attack + 0.1);
  }

  _burst(t0, dur, { type = 'bandpass', freq = 800, q = 1, peak = 0.3, out = this.master, kind = 'white' } = {}) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this._noise(kind);
    const f = this._filter(type, freq, q);
    const g = ctx.createGain();
    this._env(g, t0, 0.005, 0.0, dur, peak);
    src.connect(f).connect(g).connect(out);
    src.start(t0, Math.random() * 2);
    src.stop(t0 + dur + 0.1);
  }

  _clack(out, delay) {
    const t = this.ctx.currentTime + delay;
    this._burst(t, 0.07, { freq: 620, q: 2.5, peak: 0.5, out });
    this._tone(95, t, 0.06, { peak: 0.25, out });
  }

  _chirp(out) {
    const t = this.ctx.currentTime;
    const base = 2400 + Math.random() * 1400;
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) this._tone(base, t + i * 0.13, 0.09, { peak: 0.05, out, slideTo: base * (1.2 + Math.random() * 0.3) });
  }

  _thump(out) {
    this._tone(110, this.ctx.currentTime, 0.16, { peak: 0.35, out, slideTo: 55 });
  }

  _clap(out) {
    const t = this.ctx.currentTime;
    this._burst(t, 0.09, { freq: 1500, q: 0.8, peak: 0.3, out });
    this._burst(t + 0.02, 0.09, { freq: 1900, q: 0.8, peak: 0.2, out });
  }

  /** 지하철 출입문 차임 "띵동 띵동" */
  doorChime() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      this._tone(988, t + i * 0.62, 0.42, { peak: 0.2 });
      this._tone(988 * 2, t + i * 0.62, 0.3, { peak: 0.05 });
      this._tone(784, t + i * 0.62 + 0.26, 0.5, { peak: 0.2 });
      this._tone(784 * 2, t + i * 0.62 + 0.26, 0.3, { peak: 0.05 });
    }
  }

  /** 안내방송 전 멜로디 차임 */
  announceChime() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this._tone(f, t + i * 0.19, 0.7, { peak: 0.17, type: 'triangle' });
      this._tone(f * 2, t + i * 0.19, 0.4, { peak: 0.04 });
    });
  }

  /** 버스 정류장 안내 "띵동" */
  busChime() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this._tone(880, t, 0.5, { peak: 0.2, type: 'triangle' });
    this._tone(698.46, t + 0.3, 0.7, { peak: 0.2, type: 'triangle' });
  }

  /** 하차벨 부저 "삐~" */
  buzzer() {
    if (!this.ready) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const g = ctx.createGain();
    const lp = this._filter('lowpass', 3200);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
    g.gain.setValueAtTime(0.16, t + 0.62);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    for (const f of [1046, 1052, 2093]) {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = f;
      o.connect(lp);
      o.start(t);
      o.stop(t + 0.75);
    }
    lp.connect(g).connect(this.master);
  }

  /** 에어 브레이크 / 출입문 공기음 */
  hiss(dur = 0.8, peak = 0.18) {
    if (!this.ready) return;
    this._burst(this.ctx.currentTime, dur, { type: 'highpass', freq: 2600, q: 0.5, peak });
  }

  /** 문 닫힘 "쿵" */
  thunk() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this._tone(120, t, 0.14, { peak: 0.4, slideTo: 50 });
    this._burst(t, 0.05, { freq: 900, q: 1, peak: 0.15 });
  }

  /** UI 클릭음 */
  click() {
    if (!this.ready) return;
    this._tone(1320, this.ctx.currentTime, 0.06, { peak: 0.08, type: 'triangle' });
  }

  /** 불꽃놀이 */
  firework() {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this._tone(140, t, 0.5, { peak: 0.35, slideTo: 38 });
    this._burst(t, 0.35, { type: 'lowpass', freq: 500, peak: 0.3, kind: 'brown' });
    for (let i = 0; i < 9; i++) this._burst(t + 0.25 + Math.random() * 0.8, 0.04, { type: 'highpass', freq: 3500, peak: 0.06 });
  }

  // ───────────── 안내방송 (ko-KR TTS) ─────────────
  _voice() {
    const voices = window.speechSynthesis.getVoices() || [];
    return voices.find((v) => /^ko([-_]|$)/i.test(v.lang || '')) || null;
  }

  /**
   * 한국어 안내방송. 음성이 없는 기기(일부 헤드셋 브라우저)에서도 자막(onSpeak)과 대기 시간은 동일하게 동작한다.
   * @returns {Promise<void>} 발화가 끝나면 resolve
   */
  speak(text, { rate = 1.0, pitch = 1.05 } = {}) {
    const token = ++this._speakToken;
    const est = 700 + text.length * 185;
    this.onSpeak?.(text, est);
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          resolve();
        }
      };
      if (!this.speechOK) {
        setTimeout(finish, est);
        return;
      }
      try {
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ko-KR';
        const voice = this._voice();
        if (voice) u.voice = voice;
        u.rate = rate;
        u.pitch = pitch;
        u.onend = finish;
        u.onerror = finish;
        synth.speak(u);
        // 음성 엔진이 없거나 onend 가 오지 않는 브라우저 대비
        setTimeout(() => {
          if (token === this._speakToken || !done) finish();
        }, est * 1.5 + 1200);
        setTimeout(() => {
          if (!synth.speaking && !synth.pending) setTimeout(finish, Math.max(0, est - 400));
        }, 400);
      } catch {
        setTimeout(finish, est);
      }
    });
  }

  cancelSpeech() {
    this._speakToken++;
    try {
      if (this.speechOK) window.speechSynthesis.cancel();
    } catch {
      /* 무시 */
    }
  }
}
