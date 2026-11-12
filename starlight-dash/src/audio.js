// 소리: 전부 WebAudio로 합성한다(음원 파일 없음).

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

export class Sound {
  constructor() {
    this.ctx = null;
    this.sfxOn = true;
    this.musicOn = true;
    this.musicMode = 'off'; // 'off' | 'menu' | 'run'
    this.step = 0;
    this.nextTime = 0;
    this.timer = null;
    this.coinStreak = 0;
    this.lastCoin = 0;
  }

  /** 첫 사용자 입력에서 호출해야 소리가 난다. */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.55;
      this.sfxBus.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.0;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2600;
      this.musicBus.connect(lp); lp.connect(this.master);
      // 노이즈 버퍼(1초)
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.timer = setInterval(() => this.schedule(), 60);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  tone(bus, freq, dur, { type = 'sine', vol = 0.3, to = 0, at = 0, attack = 0.005 } = {}) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + at;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  noise(bus, dur, { vol = 0.3, freq = 1200, to = 0, q = 1, type = 'bandpass', at = 0 } = {}) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + at;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf; s.loop = true;
    const f = c.createBiquadFilter();
    f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus);
    s.start(t); s.stop(t + dur + 0.02);
  }

  sfx(name) {
    if (!this.ctx || !this.sfxOn) return;
    const b = this.sfxBus;
    switch (name) {
      case 'coin': {
        const now = this.ctx.currentTime;
        this.coinStreak = now - this.lastCoin < 0.5 ? Math.min(this.coinStreak + 1, 9) : 0;
        this.lastCoin = now;
        const f = midi(84 + [0, 2, 4, 7, 9, 12, 14, 16, 19, 21][this.coinStreak]);
        this.tone(b, f, 0.09, { type: 'triangle', vol: 0.22 });
        this.tone(b, f * 1.5, 0.12, { type: 'sine', vol: 0.16, at: 0.04 });
        break;
      }
      case 'jump': this.tone(b, 280, 0.2, { type: 'sine', vol: 0.25, to: 640 }); break;
      case 'slide': this.noise(b, 0.28, { vol: 0.22, freq: 2400, to: 500, q: 0.8 }); break;
      case 'lane': this.tone(b, 520, 0.05, { type: 'triangle', vol: 0.1, to: 700 }); break;
      case 'turn': this.noise(b, 0.25, { vol: 0.2, freq: 500, to: 2600, q: 1.2 }); break;
      case 'land': this.tone(b, 120, 0.08, { type: 'sine', vol: 0.2, to: 60 }); break;
      case 'crash':
        this.noise(b, 0.45, { vol: 0.5, freq: 900, to: 120, q: 0.6, type: 'lowpass' });
        this.tone(b, 150, 0.4, { type: 'sawtooth', vol: 0.3, to: 40 });
        break;
      case 'fall': this.tone(b, 620, 0.7, { type: 'sine', vol: 0.3, to: 70 }); break;
      case 'smash':
        this.noise(b, 0.2, { vol: 0.35, freq: 1500, to: 300, q: 0.7 });
        this.tone(b, 200, 0.12, { type: 'square', vol: 0.12, to: 90 });
        break;
      case 'power':
        [72, 76, 79, 84].forEach((m, i) => this.tone(b, midi(m), 0.16, { type: 'triangle', vol: 0.22, at: i * 0.06 }));
        break;
      case 'shieldbreak':
        this.tone(b, 1200, 0.3, { type: 'triangle', vol: 0.25, to: 300 });
        this.noise(b, 0.25, { vol: 0.2, freq: 4000, q: 2 });
        break;
      case 'boost':
        this.noise(b, 0.7, { vol: 0.3, freq: 300, to: 3200, q: 1.5 });
        this.tone(b, 180, 0.6, { type: 'sawtooth', vol: 0.15, to: 720 });
        break;
      case 'click': this.tone(b, 660, 0.06, { type: 'triangle', vol: 0.16 }); break;
      case 'buy':
        [79, 84, 88, 91].forEach((m, i) => this.tone(b, midi(m), 0.14, { type: 'triangle', vol: 0.2, at: i * 0.05 }));
        break;
      case 'deny': this.tone(b, 160, 0.18, { type: 'square', vol: 0.14, to: 110 }); break;
      case 'revive':
        [60, 67, 72, 79].forEach((m, i) => this.tone(b, midi(m), 0.25, { type: 'sine', vol: 0.25, at: i * 0.08 }));
        break;
      case 'record':
        [72, 76, 79, 84, 79, 84, 88].forEach((m, i) => this.tone(b, midi(m), 0.2, { type: 'triangle', vol: 0.22, at: i * 0.09 }));
        break;
      case 'mission':
        [76, 79, 84].forEach((m, i) => this.tone(b, midi(m), 0.22, { type: 'triangle', vol: 0.2, at: i * 0.1 }));
        break;
      case 'go': this.tone(b, 880, 0.3, { type: 'triangle', vol: 0.22 }); break;
      default: break;
    }
  }

  setMusic(mode) {
    this.musicMode = mode;
    if (!this.ctx) return;
    const target = !this.musicOn || mode === 'off' ? 0 : mode === 'menu' ? 0.2 : 0.3;
    this.musicBus.gain.setTargetAtTime(target, this.ctx.currentTime, 0.25);
  }

  refresh() { this.setMusic(this.musicMode); }

  // 16분음표 단위 시퀀서. 4마디(코드 4개) 루프.
  schedule() {
    const c = this.ctx;
    if (!c || c.state !== 'running') return;
    if (!this.musicOn || this.musicMode === 'off') { this.nextTime = 0; return; }
    const stepDur = 60 / 124 / 4;
    if (this.nextTime < c.currentTime) this.nextTime = c.currentTime + 0.05;
    const CH = [
      { bass: 41, notes: [65, 69, 72, 77] }, // F
      { bass: 43, notes: [67, 71, 74, 79] }, // G
      { bass: 45, notes: [69, 72, 76, 81] }, // Am
      { bass: 40, notes: [67, 71, 76, 79] }, // Em
    ];
    const ARP = [0, 1, 2, 1, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1, 2, 1];
    while (this.nextTime < c.currentTime + 0.22) {
      const st = this.step % 64;
      const bar = CH[(st >> 4) % 4];
      const s16 = st % 16;
      const at = this.nextTime - c.currentTime;
      const run = this.musicMode === 'run';
      // 아르페지오
      if (run || s16 % 2 === 0) {
        this.tone(this.musicBus, midi(bar.notes[ARP[s16]]), stepDur * 1.7, { type: 'triangle', vol: run ? 0.16 : 0.13, at });
      }
      // 베이스
      if (s16 % 4 === 0 || (run && s16 % 4 === 2)) {
        this.tone(this.musicBus, midi(bar.bass), stepDur * 2.2, { type: 'sawtooth', vol: 0.16, at, attack: 0.01 });
      }
      if (run) {
        if (s16 % 8 === 0) this.tone(this.musicBus, 120, 0.12, { type: 'sine', vol: 0.5, to: 45, at }); // 킥
        if (s16 % 8 === 4) this.noise(this.musicBus, 0.1, { vol: 0.22, freq: 1800, q: 0.8, at }); // 스네어
        if (s16 % 2 === 0) this.noise(this.musicBus, 0.03, { vol: 0.08, freq: 7000, q: 1, type: 'highpass', at }); // 하이햇
      }
      // 마디 끝 멜로디 장식
      if (st % 32 === 28) this.tone(this.musicBus, midi(bar.notes[3] + 12), stepDur * 3, { type: 'sine', vol: 0.1, at });
      this.nextTime += stepDur;
      this.step++;
    }
  }
}

export function vibrate(ms, enabled = true) {
  if (!enabled) return;
  try {
    if (window.AndroidBridge && window.AndroidBridge.vibrate) window.AndroidBridge.vibrate(ms);
    else if (navigator.vibrate) navigator.vibrate(ms);
  } catch (e) { /* 무시 */ }
}
