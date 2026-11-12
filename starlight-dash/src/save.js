// 저장 데이터. 안드로이드 앱에서는 네이티브 브리지(SharedPreferences), 브라우저에서는 localStorage.
import { MISSIONS, missionDef, missionTarget, missionReward } from './data.js';

const KEY = 'starlight-dash-save-v1';

function defaults() {
  return {
    v: 1,
    coins: 0,
    best: 0,
    bestDist: 0,
    totalDist: 0,
    runs: 0,
    char: 'lumi',
    owned: { lumi: true },
    up: { magnet: 0, shield: 0, boost: 0, double: 0, mult: 0 },
    items: { revive: 0, headstart: 0 },
    settings: { sfx: true, music: true, vibrate: true, cheat: false },
    missions: [], // [{id, progress}]
    tiers: {}, // 미션 종류별 달성 횟수
    hints: { jump: 0, slide: 0, lane: 0, turn: 0 },
  };
}

function bridge() { return typeof window !== 'undefined' && window.AndroidBridge ? window.AndroidBridge : null; }

export class Save {
  constructor() {
    this.data = defaults();
    this.load();
  }

  load() {
    let raw = null;
    try { const b = bridge(); if (b && b.load) raw = b.load(); } catch (e) { /* 무시 */ }
    if (!raw) { try { raw = localStorage.getItem(KEY); } catch (e) { /* 무시 */ } }
    if (raw) {
      try {
        const d = JSON.parse(raw);
        const base = defaults();
        this.data = {
          ...base, ...d,
          owned: { ...base.owned, ...(d.owned || {}) },
          up: { ...base.up, ...(d.up || {}) },
          items: { ...base.items, ...(d.items || {}) },
          settings: { ...base.settings, ...(d.settings || {}) },
          tiers: { ...(d.tiers || {}) },
          hints: { ...base.hints, ...(d.hints || {}) },
          missions: Array.isArray(d.missions) ? d.missions.filter((m) => m && missionDef(m.id)) : [],
        };
      } catch (e) { this.data = defaults(); }
    }
    this.fillMissions();
  }

  commit() {
    const raw = JSON.stringify(this.data);
    try { const b = bridge(); if (b && b.save) b.save(raw); } catch (e) { /* 무시 */ }
    try { localStorage.setItem(KEY, raw); } catch (e) { /* 무시 */ }
  }

  reset() {
    const settings = this.data.settings;
    this.data = defaults();
    this.data.settings = { ...settings, cheat: false };
    this.fillMissions();
    this.commit();
  }

  /** 진행 중 미션을 3개로 채운다. */
  fillMissions() {
    const d = this.data;
    let guard = 0;
    while (d.missions.length < 3 && guard++ < 50) {
      const pool = MISSIONS.filter((m) => !d.missions.some((x) => x.id === m.id));
      if (!pool.length) break;
      const def = pool[Math.floor(Math.random() * pool.length)];
      d.missions.push({ id: def.id, progress: 0 });
    }
  }

  missionView() {
    return this.data.missions.map((m) => {
      const def = missionDef(m.id);
      const tier = this.data.tiers[m.id] || 0;
      const target = missionTarget(def, tier);
      return { id: m.id, text: def.text(target), target, progress: Math.min(target, Math.floor(m.progress)), reward: missionReward(def, tier), scope: def.scope };
    });
  }

  /** 한 판의 통계를 미션에 반영하고, 완료된 미션 목록을 돌려준다. */
  applyRun(stats) {
    const d = this.data;
    const done = [];
    for (const m of d.missions.slice()) {
      const def = missionDef(m.id);
      const tier = d.tiers[m.id] || 0;
      const target = missionTarget(def, tier);
      const val = stats[def.stat] || 0;
      if (def.scope === 'run') m.progress = Math.max(m.progress, val);
      else m.progress += val;
      if (m.progress >= target) {
        const reward = missionReward(def, tier);
        done.push({ text: def.text(target), reward });
        d.coins += reward;
        d.tiers[m.id] = tier + 1;
        d.missions.splice(d.missions.indexOf(m), 1);
      } else if (def.scope === 'run') {
        m.progress = Math.max(m.progress, val); // 한 판 미션은 최고 기록을 표시
      }
    }
    this.fillMissions();
    return done;
  }
}
