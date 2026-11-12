// 화면 UI(DOM): 홈, HUD, 상점/캐릭터/미션/설정 시트, 일시정지·부활·결과 창.
import { icon } from './icons.js';
import { CHARACTERS, UPGRADES, ITEMS, POWERUPS, upgradeValue } from './data.js';
import { vibrate } from './audio.js';

const fmt = (n) => Math.floor(n).toLocaleString('en-US');
const CHAR_COLOR = { lumi: '#2f9bff', koko: '#f08a2c', bolt: '#4fc3c9', kage: '#5b6bd6', nova: '#dfe5ee', draco: '#4fbf6a' };
const FX_PILLS = [
  ['magnet', 'magnet', POWERUPS.magnet.color], ['shield', 'shield', POWERUPS.shield.color],
  ['boost', 'bolt', POWERUPS.boost.color], ['double', 'x2', POWERUPS.double.color], ['head', 'rocket', '#b388ff'],
];
const VERSION = '1.0.0';

export class UI {
  constructor(root, save, sound) {
    this.root = root; this.save = save; this.sound = sound; this.game = null;
    this.sheetName = null; this.tab = 'up'; this.preview = null;
    this.modalKind = null;
    this.cache = {};
    this.timers = {};
    root.innerHTML = `
      <div id="hud" class="layer hidden">
        <div class="hud-top">
          <div class="hud-score"><b id="hScore">0</b><span><i id="hDist">0</i>m<em id="hMult"></em></span></div>
          <div class="hud-right">
            <div class="pill coin">${icon('star')}<b id="hCoins">0</b></div>
            <button class="icon-btn" data-act="pause" aria-label="일시정지">${icon('pause')}</button>
          </div>
        </div>
        <div class="fx-list" id="hFx">
          ${FX_PILLS.map(([k, ic, c]) => `<div class="fx hidden" data-fx="${k}" style="--c:${c}">${icon(ic)}<span><i></i></span></div>`).join('')}
        </div>
        <div class="cheat-badge hidden" id="hCheat">${icon('cheat')} 치트 모드</div>
        <button class="head-btn hidden" id="hHead" data-act="headstart">${icon('rocket')}<span>스타트 대시</span><b id="hHeadN"></b></button>
        <div class="hint hidden" id="hint"><div class="hint-arrows"></div><p></p></div>
      </div>
      <div id="home" class="layer hidden">
        <div class="topbar">
          <div class="pill coin">${icon('star')}<b data-bind="coins">0</b></div>
          <button class="icon-btn" data-act="open" data-arg="settings" aria-label="설정">${icon('gear')}</button>
        </div>
        <div class="logo">
          <div class="logo-mark">${icon('star')}</div>
          <h1>별빛 질주</h1>
          <p>STARLIGHT DASH</p>
        </div>
        <div class="home-bottom">
          <div class="best">${icon('trophy')}<span>최고 기록</span><b data-bind="best">0</b></div>
          <button class="btn primary big" data-act="play">${icon('play')}<span>달리기</span></button>
          <div class="row3">
            <button class="btn tile" data-act="open" data-arg="shop">${icon('bag')}<span>상점</span></button>
            <button class="btn tile" data-act="open" data-arg="chars">${icon('user')}<span>캐릭터</span></button>
            <button class="btn tile" data-act="open" data-arg="missions">${icon('flag')}<span>미션</span></button>
          </div>
          <button class="cheat-row" data-act="toggle" data-arg="cheat">
            <span class="cheat-ico">${icon('cheat')}</span>
            <span class="cheat-txt"><b>치트 모드</b><small>쓰러지지 않고 끝없이 달려요</small></span>
            <span class="switch" data-switch="cheat"></span>
          </button>
        </div>
      </div>
      <div id="banner" class="banner"></div>
      <div id="count" class="count hidden"></div>
      <div id="sheet" class="sheet hidden">
        <div class="sheet-head">
          <div class="sheet-title" id="sheetTitle"></div>
          <div class="pill coin small">${icon('star')}<b data-bind="coins">0</b></div>
          <button class="icon-btn" data-act="close" aria-label="닫기">${icon('close')}</button>
        </div>
        <div class="tabs hidden" id="tabs">
          <button data-act="tab" data-arg="up">강화</button>
          <button data-act="tab" data-arg="items">아이템</button>
          <button data-act="tab" data-arg="chars">캐릭터</button>
        </div>
        <div class="sheet-body" id="sheetBody"></div>
      </div>
      <div id="modal" class="modal hidden"><div class="card" id="modalCard"></div></div>
      <div id="toast" class="toast"></div>
      <div id="fade" class="fade"></div>`;
    this.el = {};
    for (const id of ['hud', 'home', 'sheet', 'modal', 'modalCard', 'sheetBody', 'sheetTitle', 'tabs', 'banner', 'count', 'toast', 'fade', 'hScore', 'hDist', 'hMult', 'hCoins', 'hCheat', 'hHead', 'hHeadN', 'hint']) {
      this.el[id] = root.querySelector('#' + id);
    }
    this.fxEls = {};
    for (const e of root.querySelectorAll('[data-fx]')) this.fxEls[e.dataset.fx] = { el: e, bar: e.querySelector('i'), on: false, w: -1 };

    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-act]');
      if (!t || !root.contains(t)) return;
      this.sound.unlock();
      this.act(t.dataset.act, t.dataset.arg);
    });
    this.refresh();
  }

  attach(game) { this.game = game; }

  // ───────── 공통 ─────────
  show(el, on) { el.classList.toggle('hidden', !on); }

  refresh() {
    const d = this.save.data;
    for (const e of this.root.querySelectorAll('[data-bind="coins"]')) e.textContent = fmt(d.coins);
    for (const e of this.root.querySelectorAll('[data-bind="best"]')) e.textContent = fmt(d.best);
    for (const e of this.root.querySelectorAll('[data-switch]')) e.classList.toggle('on', !!d.settings[e.dataset.switch]);
  }

  toast(text) {
    const t = this.el.toast;
    t.textContent = text;
    t.classList.add('on');
    clearTimeout(this.timers.toast);
    this.timers.toast = setTimeout(() => t.classList.remove('on'), 1600);
  }

  banner(text) {
    const b = this.el.banner;
    b.textContent = text;
    b.classList.remove('on');
    void b.offsetWidth; // 애니메이션 다시 시작
    b.classList.add('on');
  }

  hint(kind, text) {
    const h = this.el.hint;
    const arrows = kind === 'both' ? ['left', 'right'] : [kind];
    h.querySelector('.hint-arrows').innerHTML = arrows.map((a) => `<span class="arrow ${a}">${icon('arrow')}</span>`).join('');
    h.querySelector('p').textContent = text;
    this.show(h, true);
    clearTimeout(this.timers.hint);
    this.timers.hint = setTimeout(() => this.show(h, false), 1300);
  }

  fadeThen(fn) {
    const f = this.el.fade;
    f.classList.add('on');
    setTimeout(() => { fn(); requestAnimationFrame(() => f.classList.remove('on')); }, 200);
  }

  countdown(done) {
    this.closeModal();
    const c = this.el.count;
    let n = 3;
    this.show(c, true);
    const tick = () => {
      if (n === 0) { this.show(c, false); done(); return; }
      c.textContent = n;
      c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
      this.sound.sfx('click');
      n--;
      this.timers.count = setTimeout(tick, 420);
    };
    tick();
  }

  // ───────── 화면 전환 ─────────
  showHome() {
    this.closeModal();
    this.closeSheet(true);
    this.show(this.el.hud, false);
    this.show(this.el.home, true);
    this.refresh();
  }

  showHUD(keep) {
    this.closeModal();
    this.closeSheet(true);
    this.show(this.el.home, false);
    this.show(this.el.hud, true);
    this.show(this.el.hint, false);
    if (!keep) this.cache = {};
  }

  updateHUD(run, game) {
    const c = this.cache, el = this.el;
    const score = Math.floor(run.score), dist = Math.floor(run.dist);
    if (c.score !== score) { c.score = score; el.hScore.textContent = fmt(score); }
    if (c.dist !== dist) { c.dist = dist; el.hDist.textContent = fmt(dist); }
    if (c.coins !== run.coins) { c.coins = run.coins; el.hCoins.textContent = fmt(run.coins); }
    const mult = game.mult;
    if (c.mult !== mult) { c.mult = mult; el.hMult.textContent = mult > 1 ? ` · ×${mult}` : ''; }
    const cheat = game.cheat;
    if (c.cheat !== cheat) { c.cheat = cheat; this.show(el.hCheat, cheat); }
    for (const k in this.fxEls) {
      const f = this.fxEls[k];
      const v = k === 'head' ? run.headstart / 600 : run.fx[k] / run.fxMax[k];
      const on = v > 0;
      if (on !== f.on) { f.on = on; this.show(f.el, on); }
      if (on) {
        const w = Math.round(v * 100);
        if (w !== f.w) { f.w = w; f.bar.style.width = w + '%'; }
      }
    }
    const head = run.headOffer > 0 && this.save.data.items.headstart > 0;
    if (c.head !== head) {
      c.head = head;
      this.show(el.hHead, head);
      if (head) el.hHeadN.textContent = '×' + this.save.data.items.headstart;
    }
  }

  // ───────── 시트(상점·캐릭터·미션·설정) ─────────
  openSheet(name) {
    this.sheetName = name;
    if (name === 'shop') this.tab = 'up';
    if (name === 'chars') { this.sheetName = 'shop'; this.tab = 'chars'; }
    this.preview = this.save.data.char;
    this.show(this.el.sheet, true);
    this.el.home.classList.add('dim');
    this.renderSheet();
  }

  closeSheet(silent) {
    if (!this.sheetName) return;
    this.sheetName = null;
    this.show(this.el.sheet, false);
    this.el.home.classList.remove('dim');
    if (this.game && !silent) {
      this.game.setCharacter(this.save.data.char);
      this.game.setCamMode('home');
    }
  }

  renderSheet() {
    const d = this.save.data, name = this.sheetName, el = this.el;
    const titles = { shop: '상점', missions: '미션', settings: '설정' };
    el.sheetTitle.textContent = titles[name];
    this.show(el.tabs, name === 'shop');
    el.sheet.classList.toggle('short', name === 'shop' && this.tab === 'chars');
    let html = '';
    if (name === 'shop') {
      for (const b of el.tabs.children) b.classList.toggle('on', b.dataset.arg === this.tab);
      if (this.game) {
        const showChar = this.tab === 'chars';
        this.game.setCamMode(showChar ? 'show' : 'home');
        this.game.setCharacter(showChar ? this.preview : d.char);
      }
      if (this.tab === 'up') {
        html = UPGRADES.map((u) => {
          const lv = d.up[u.id] || 0, max = lv >= u.costs.length;
          const cur = upgradeValue(u, lv), nxt = upgradeValue(u, lv + 1), cost = u.costs[lv];
          return `<div class="row">
            <div class="ri" style="--c:${u.color}">${icon(u.icon)}</div>
            <div class="rm">
              <div class="rt">${u.name}<span class="tag">Lv.${lv}</span></div>
              <div class="rd">${u.desc}</div>
              <div class="rv">${max ? `${cur}${u.unit} · 최대 단계` : `${cur}${u.unit} → <b>${nxt}${u.unit}</b>`}</div>
              <div class="pips">${u.costs.map((_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</div>
            </div>
            ${max ? `<div class="done">${icon('check')}</div>` : `<button class="buy ${d.coins >= cost ? '' : 'poor'}" data-act="buy-up" data-arg="${u.id}">${icon('star')}${fmt(cost)}</button>`}
          </div>`;
        }).join('');
      } else if (this.tab === 'items') {
        html = ITEMS.map((it) => `<div class="row">
            <div class="ri" style="--c:${it.color}">${icon(it.icon)}</div>
            <div class="rm">
              <div class="rt">${it.name}<span class="tag">보유 ${d.items[it.id] || 0}개</span></div>
              <div class="rd">${it.desc}</div>
            </div>
            <button class="buy ${d.coins >= it.price ? '' : 'poor'}" data-act="buy-item" data-arg="${it.id}">${icon('star')}${fmt(it.price)}</button>
          </div>`).join('') + '<p class="note">부활의 별은 쓰러졌을 때, 스타트 대시는 출발 직후 화면 아래 버튼으로 사용합니다.</p>';
      } else {
        html = CHARACTERS.map((c) => {
          const owned = !!d.owned[c.id], sel = d.char === c.id;
          const btn = sel ? `<div class="done using">${icon('check')}<span>사용 중</span></div>`
            : owned ? `<button class="buy own" data-act="pick" data-arg="${c.id}">선택</button>`
              : `<button class="buy ${d.coins >= c.price ? '' : 'poor'}" data-act="buy-char" data-arg="${c.id}">${icon('star')}${fmt(c.price)}</button>`;
          return `<div class="row char ${this.preview === c.id ? 'viewing' : ''}" data-act="preview" data-arg="${c.id}">
            <div class="ri round" style="--c:${CHAR_COLOR[c.id]}">${icon(owned ? 'user' : 'lock')}</div>
            <div class="rm">
              <div class="rt">${c.name}<span class="tag">${c.title}</span></div>
              <div class="rd">${c.perk}</div>
            </div>
            ${btn}
          </div>`;
        }).join('');
      }
    } else if (name === 'missions') {
      html = this.save.missionView().map((m) => `<div class="row">
          <div class="ri" style="--c:#b388ff">${icon('flag')}</div>
          <div class="rm">
            <div class="rt">${m.text}</div>
            <div class="bar"><i style="width:${Math.round((m.progress / m.target) * 100)}%"></i></div>
            <div class="rd">${fmt(m.progress)} / ${fmt(m.target)}${m.scope === 'run' ? ' · 한 판 최고' : ''}</div>
          </div>
          <div class="reward">${icon('star')}${fmt(m.reward)}</div>
        </div>`).join('') + '<p class="note">미션을 달성하면 달리기가 끝날 때 보상을 받고 새 미션이 나타납니다. 치트 모드로 달린 판은 미션에 반영되지 않습니다.</p>';
    } else if (name === 'settings') {
      const sw = (key, ic, title, sub) => `<button class="row toggle" data-act="toggle" data-arg="${key}">
          <div class="ri" style="--c:#5b6bd6">${icon(ic)}</div>
          <div class="rm"><div class="rt">${title}</div>${sub ? `<div class="rd">${sub}</div>` : ''}</div>
          <span class="switch ${d.settings[key] ? 'on' : ''}" data-switch="${key}"></span>
        </button>`;
      html = sw('sfx', 'sound', '효과음') + sw('music', 'music', '배경 음악') + sw('vibrate', 'vibrate', '진동')
        + sw('cheat', 'cheat', '치트 모드', '쓰러지지 않고 끝없이 달립니다. 코인은 쌓이지만 최고 기록과 미션에는 반영되지 않습니다.')
        + `<div class="help">
            <h3>조작법</h3>
            <ul>
              <li><span class="arrow left">${icon('arrow')}</span><span class="arrow right">${icon('arrow')}</span> 좌우 스와이프 — 차선 바꾸기, 코너에서는 방향 전환</li>
              <li><span class="arrow up">${icon('arrow')}</span> 위로 스와이프 — 점프</li>
              <li><span class="arrow down">${icon('arrow')}</span> 아래로 스와이프 — 슬라이드 (공중에서는 빠르게 착지)</li>
            </ul>
          </div>
          <button class="btn ghost danger" data-act="reset">저장 데이터 초기화</button>
          <p class="note">별빛 질주 v${VERSION}</p>`;
    }
    el.sheetBody.innerHTML = html;
    this.refresh();
  }

  buy(cost, apply) {
    const d = this.save.data;
    if (d.coins < cost) {
      this.sound.sfx('deny');
      this.toast(`별 코인이 ${fmt(cost - d.coins)}개 부족해요`);
      return false;
    }
    d.coins -= cost;
    apply(d);
    this.save.commit();
    this.sound.sfx('buy');
    vibrate(25, d.settings.vibrate);
    return true;
  }

  // ───────── 모달 ─────────
  openModal(kind, html) {
    this.modalKind = kind;
    this.el.modalCard.innerHTML = html;
    this.el.modalCard.className = 'card ' + kind;
    this.show(this.el.modal, true);
  }

  closeModal() {
    clearTimeout(this.timers.revive);
    clearTimeout(this.timers.count);
    this.show(this.el.count, false);
    if (!this.modalKind) return;
    this.modalKind = null;
    this.show(this.el.modal, false);
  }

  showPause() {
    const d = this.save.data;
    const sw = (key, ic, label) => `<button class="mini-toggle ${d.settings[key] ? 'on' : ''}" data-act="toggle" data-arg="${key}">${icon(ic)}<span>${label}</span></button>`;
    this.openModal('pause', `
      <h2>일시정지</h2>
      <div class="mini-toggles">${sw('sfx', 'sound', '효과음')}${sw('music', 'music', '음악')}${sw('cheat', 'cheat', '치트')}</div>
      <button class="btn primary" data-act="resume">${icon('play')}<span>계속 달리기</span></button>
      <button class="btn" data-act="restart">${icon('retry')}<span>처음부터 다시</span></button>
      <button class="btn ghost" data-act="quit">${icon('flag')}<span>그만하고 정산하기</span></button>`);
  }

  showRevive(info, yes, no) {
    this.onRevive = yes; this.onGiveUp = no;
    this.openModal('revive', `
      <div class="big-ico heart">${icon('heart')}</div>
      <h2>다시 일어날까요?</h2>
      <p class="sub">${info.free ? '드라코의 무료 부활을 쓸 수 있어요' : `부활의 별 ${info.count}개 보유`}</p>
      <div class="bar timer"><i></i></div>
      <button class="btn primary" data-act="revive">${icon('heart')}<span>${info.free ? '무료로 부활' : '부활의 별 사용'}</span></button>
      <button class="btn ghost" data-act="giveup">괜찮아요</button>`);
    this.timers.revive = setTimeout(() => { if (this.modalKind === 'revive') this.act('giveup'); }, 5000);
  }

  showResult(r) {
    this.show(this.el.hud, false);
    const missions = r.missions.map((m) => `<li>${icon('check')}<span>${m.text}</span><b>${icon('star')}+${fmt(m.reward)}</b></li>`).join('');
    this.openModal('result', `
      <div class="ribbon ${r.record ? 'rec' : ''}">${r.record ? '신기록!' : r.cheated ? '치트 모드 달리기' : '달리기 끝!'}</div>
      <div class="score"><span>점수</span><b>${fmt(r.score)}</b></div>
      <div class="stats">
        <div><span>거리</span><b>${fmt(r.dist)}m</b></div>
        <div><span>별 코인</span><b class="gold">${icon('star')}+${fmt(r.coins)}</b></div>
        <div><span>최고 기록</span><b>${fmt(r.best)}</b></div>
      </div>
      ${missions ? `<ul class="mdone">${missions}</ul>` : ''}
      ${r.cheated ? '<p class="sub">치트 모드 기록은 최고 점수와 미션에 반영되지 않아요.</p>' : ''}
      <button class="btn primary" data-act="again">${icon('retry')}<span>다시 달리기</span></button>
      <div class="row2">
        <button class="btn" data-act="result-shop">${icon('bag')}<span>상점</span></button>
        <button class="btn" data-act="home">${icon('home')}<span>홈</span></button>
      </div>`);
    this.refresh();
  }

  confirm(text, yesLabel, onYes) {
    this.onConfirm = onYes;
    this.openModal('confirm', `
      <h2>확인</h2>
      <p class="sub">${text}</p>
      <button class="btn danger" data-act="confirm-yes">${yesLabel}</button>
      <button class="btn ghost" data-act="confirm-no">취소</button>`);
  }

  // ───────── 동작 ─────────
  act(name, arg) {
    const g = this.game, d = this.save.data, snd = this.sound;
    switch (name) {
      case 'play': snd.sfx('click'); this.fadeThen(() => g.startRun()); break;
      case 'open': snd.sfx('click'); this.openSheet(arg); break;
      case 'close': snd.sfx('click'); this.closeSheet(); break;
      case 'tab': snd.sfx('click'); this.tab = arg; this.preview = d.char; this.renderSheet(); break;
      case 'toggle': {
        d.settings[arg] = !d.settings[arg];
        this.save.commit();
        snd.sfxOn = d.settings.sfx; snd.musicOn = d.settings.music; snd.refresh();
        snd.sfx('click');
        if (arg === 'cheat') this.toast(d.settings.cheat ? '치트 모드 켜짐 — 끝없이 달려요!' : '치트 모드 꺼짐');
        if (arg === 'vibrate') vibrate(40, d.settings.vibrate);
        if (this.modalKind === 'pause') this.showPause();
        if (this.sheetName === 'settings') this.renderSheet();
        this.refresh();
        break;
      }
      case 'buy-up': {
        const u = UPGRADES.find((x) => x.id === arg), lv = d.up[arg] || 0;
        if (lv < u.costs.length && this.buy(u.costs[lv], (s) => { s.up[arg] = lv + 1; })) { this.toast(`${u.name} Lv.${lv + 1}`); this.renderSheet(); }
        break;
      }
      case 'buy-item': {
        const it = ITEMS.find((x) => x.id === arg);
        if (this.buy(it.price, (s) => { s.items[arg] = (s.items[arg] || 0) + 1; })) { this.toast(`${it.name} +1`); this.renderSheet(); }
        break;
      }
      case 'preview': this.preview = arg; this.renderSheet(); break;
      case 'pick':
        d.char = arg; this.preview = arg; this.save.commit(); snd.sfx('power'); this.renderSheet();
        break;
      case 'buy-char': {
        const c = CHARACTERS.find((x) => x.id === arg);
        this.preview = arg;
        if (this.buy(c.price, (s) => { s.owned[arg] = true; s.char = arg; })) this.toast(`${c.name} 합류!`);
        this.renderSheet();
        break;
      }
      case 'reset':
        this.confirm('코인, 강화, 캐릭터, 기록이 모두 지워집니다.', '모두 지우기', () => {
          this.save.reset();
          snd.sfxOn = true; snd.musicOn = true;
          g.enterHome();
          this.toast('초기화했어요');
        });
        break;
      case 'confirm-yes': { const fn = this.onConfirm; this.closeModal(); if (fn) fn(); break; }
      case 'confirm-no': this.closeModal(); break;
      case 'pause': g.pause(); break;
      case 'resume': snd.sfx('click'); g.resume(); break;
      case 'restart': snd.sfx('click'); this.fadeThen(() => { this.closeModal(); g.restart(); }); break;
      case 'quit': snd.sfx('click'); this.closeModal(); g.quitRun(); break;
      case 'revive': { const fn = this.onRevive; this.closeModal(); if (fn) fn(); break; }
      case 'giveup': { const fn = this.onGiveUp; this.closeModal(); if (fn) fn(); break; }
      case 'again': snd.sfx('click'); this.fadeThen(() => { this.closeModal(); g.startRun(); }); break;
      case 'home': snd.sfx('click'); this.fadeThen(() => { this.closeModal(); g.enterHome(); }); break;
      case 'result-shop': snd.sfx('click'); this.fadeThen(() => { this.closeModal(); g.enterHome(); this.openSheet('shop'); }); break;
      case 'headstart': g.useHeadstart(); break;
      default: break;
    }
  }

  /** 안드로이드 뒤로 가기. 앱을 종료해야 하면 'exit' 를 돌려준다. */
  back() {
    const g = this.game;
    if (this.modalKind === 'confirm') { this.closeModal(); return 'ok'; }
    if (this.sheetName) { this.closeSheet(); return 'ok'; }
    if (g.state === 'play') { g.pause(); return 'ok'; }
    if (g.state === 'paused') { g.resume(); return 'ok'; }
    if (g.state === 'revive') { this.act('giveup'); return 'ok'; }
    if (g.state === 'over') { this.act('home'); return 'ok'; }
    if (g.state === 'dying') return 'ok';
    return 'exit';
  }
}
