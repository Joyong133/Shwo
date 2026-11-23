// 랭크 대전: 내 카드로 5인 라인업을 짜서 AI 팀과 3판 2선승제로 싸운다.
// 한 세트는 라인전 → 운영 → 한타 3단계. 단계마다 작전을 고르고, 작전끼리는 가위바위보처럼 상성이 있다.
(() => {
  'use strict';
  const L = window.LOL;
  const $ = (s) => document.querySelector(s);
  const esc = L.esc;
  const POS_LIST = ['TOP', 'JGL', 'MID', 'ADC', 'SUP'];
  const SI = { lane: 0, tf: 1, mac: 2, phy: 3, pool: 4, con: 5 };

  const STAGES = [
    { name: '아마추어 리그', team: '동네 PC방 연합', ovr: 72, reward: 150 },
    { name: '챌린저스 리그', team: '챌린저스 유망주', ovr: 77, reward: 200 },
    { name: 'LCK 중위권', team: '플레이오프 경쟁팀', ovr: 81, reward: 300 },
    { name: 'LCK 상위권', team: '우승 후보', ovr: 85, reward: 400 },
    { name: '국제 대회', team: '세계 최강팀', ovr: 89, reward: 550 },
    { name: '레전드 올스타', team: '역대 올스타', ovr: 93, reward: 800 },
  ];

  // 작전: stat = 쓰는 능력치 비중, w = 포지션별 비중, beats = 이기는 상대 작전
  const PHASES = [
    { name: '라인전', weight: 1.0, choices: [
      { key: 'aggro', name: '공격적 라인전', desc: '라인전·피지컬로 초반부터 압박', stat: { lane: 0.6, phy: 0.4 }, w: { TOP: 1, JGL: 0.6, MID: 1, ADC: 1, SUP: 0.8 }, beats: 'farm' },
      { key: 'roam', name: '로밍 · 갱킹', desc: '정글·미드가 움직여 킬 만들기', stat: { mac: 0.5, phy: 0.5 }, w: { TOP: 0.5, JGL: 1.4, MID: 1.3, ADC: 0.5, SUP: 1 }, beats: 'aggro' },
      { key: 'farm', name: '안정적 성장', desc: '실수 없이 CS와 경험치 챙기기', stat: { con: 0.6, lane: 0.4 }, w: { TOP: 1, JGL: 0.8, MID: 1, ADC: 1.2, SUP: 0.8 }, beats: 'roam' },
    ] },
    { name: '운영', weight: 1.2, choices: [
      { key: 'obj', name: '오브젝트 싸움', desc: '드래곤·전령에 전원 집결', stat: { tf: 0.5, mac: 0.5 }, w: { TOP: 0.9, JGL: 1.3, MID: 1, ADC: 1, SUP: 1 }, beats: 'split' },
      { key: 'split', name: '스플릿 푸시', desc: '탑이 사이드에서 상대를 묶기', stat: { lane: 0.5, phy: 0.5 }, w: { TOP: 1.8, JGL: 0.8, MID: 1, ADC: 0.8, SUP: 0.6 }, beats: 'vision' },
      { key: 'vision', name: '시야 장악', desc: '정글을 장악하고 빈틈 노리기', stat: { mac: 0.6, con: 0.4 }, w: { TOP: 0.7, JGL: 1.3, MID: 1, ADC: 0.7, SUP: 1.4 }, beats: 'obj' },
    ] },
    { name: '한타', weight: 1.6, choices: [
      { key: 'front', name: '정면 한타', desc: '딜러를 믿고 정면 대결', stat: { tf: 0.7, con: 0.3 }, w: { TOP: 0.9, JGL: 0.9, MID: 1.2, ADC: 1.3, SUP: 0.8 }, beats: 'defend' },
      { key: 'engage', name: '기습 이니시', desc: '정글·서폿이 먼저 파고들기', stat: { phy: 0.6, tf: 0.4 }, w: { TOP: 1.1, JGL: 1.3, MID: 0.9, ADC: 0.8, SUP: 1.3 }, beats: 'front' },
      { key: 'defend', name: '수비 후 역습', desc: '받아치고 역으로 몰아치기', stat: { con: 0.5, mac: 0.3, pool: 0.2 }, w: { TOP: 1, JGL: 1, MID: 1, ADC: 1, SUP: 1 }, beats: 'engage' },
    ] },
  ];

  // ───── 저장 ─────
  const KEY = 'lolcards.game.v1';
  let G = null;
  try { G = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { G = null; }
  if (!G) G = { lineup: {}, unlocked: 0, cleared: {}, w: 0, l: 0 };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) { /* 저장 불가 */ } };

  // 빈 자리는 연습생으로 채운다
  const rookie = (pos) => ({ id: 'rookie-' + pos, ign: '연습생', name: '', pos, s: [66, 66, 66, 66, 66, 66], ovr: 66, rookie: true, team: '' });
  function myLineup() {
    return POS_LIST.map((pos) => {
      const id = G.lineup[pos];
      const p = id && L.byId[id];
      return p && L.owned(p) && p.pos === pos ? p : rookie(pos);
    });
  }
  function autoLineup() {
    const mine = L.ownedList();
    POS_LIST.forEach((pos) => {
      const best = mine.filter((p) => p.pos === pos).sort((a, b) => b.ovr - a.ovr)[0];
      if (best) G.lineup[pos] = best.id; else delete G.lineup[pos];
    });
    save();
  }
  // 같은 팀 선수가 모이면 시너지 (+1%/명, 최대 +4%), 같은 리그 5명이면 +2%
  function synergy(lineup) {
    const real = lineup.filter((p) => !p.rookie);
    const byTeam = {};
    real.forEach((p) => { byTeam[p.team] = (byTeam[p.team] || 0) + 1; });
    const teamBonus = Math.min(4, Object.values(byTeam).reduce((a, n) => a + (n >= 2 ? n - 1 : 0), 0));
    const leagueBonus = real.length === 5 && real.every((p) => p.league === real[0].league) ? 2 : 0;
    const best = Object.entries(byTeam).sort((a, b) => b[1] - a[1])[0];
    return { pct: teamBonus + leagueBonus, teamBonus, leagueBonus, bestTeam: best && best[1] >= 2 ? L.team({ team: best[0] }).name + ' ' + best[1] + '명' : '' };
  }
  const avgOvr = (lineup) => Math.round(lineup.reduce((a, p) => a + p.ovr, 0) / lineup.length);
  function power(lineup, choice, syn) {
    let tot = 0, wsum = 0;
    lineup.forEach((p) => {
      const w = choice.w[p.pos] || 1;
      const v = Object.entries(choice.stat).reduce((a, [k, c]) => a + p.s[SI[k]] * c, 0);
      tot += v * w; wsum += w;
    });
    return (tot / wsum) * (1 + syn / 100);
  }
  // 그 작전에서 가장 기여가 큰 선수 (해설용)
  function star(lineup, choice) {
    return lineup.slice().sort((a, b) => {
      const f = (p) => (choice.w[p.pos] || 1) * Object.entries(choice.stat).reduce((x, [k, c]) => x + p.s[SI[k]] * c, 0);
      return f(b) - f(a);
    })[0];
  }

  // 상대 라인업: 단계 목표 종합에 가까운 선수를 포지션마다 무작위로
  function aiLineup(stage) {
    const used = new Set(myLineup().map((p) => p.id));
    return POS_LIST.map((pos) => {
      const pool = L.players.filter((p) => p.pos === pos && !used.has(p.id));
      for (const r of [2, 3, 5, 8, 20]) {
        const c = pool.filter((p) => Math.abs(p.ovr - stage.ovr) <= r);
        if (c.length) return c[Math.floor(Math.random() * c.length)];
      }
      return pool[0];
    });
  }

  // ───── 화면 ─────
  const body = () => $('#gameBody');
  let screen = 'lobby';
  function thumb(p, cls = '') {
    const t = p.rookie ? { color: '#555', color2: '#111' } : L.team(p);
    const art = p.rookie ? `<div class="g-rookie">?</div>` : (p.img ? `<img src="${p.img}" alt="" class="${p.opaque ? 'opaque' : ''}">` : L.avatar(p));
    return `<div class="g-thumb ${cls} ${p.rookie ? 'is-rookie' : 'tier-' + p.tier.key}" style="--tc:${t.color};--tc2:${t.color2}">
      <div class="g-art">${art}</div>
      <div class="g-ovr">${p.ovr}</div>
      <div class="g-name">${esc(p.ign)}</div>
    </div>`;
  }

  function lobby() {
    screen = 'lobby';
    $('#gameTitle').textContent = '랭크 대전';
    const lu = myLineup();
    const syn = synergy(lu);
    const rookies = lu.filter((p) => p.rookie).length;
    const stages = STAGES.map((st, i) => {
      const locked = i > G.unlocked;
      const cleared = G.cleared[i];
      return `<div class="g-stage ${locked ? 'locked' : ''} ${cleared ? 'cleared' : ''}">
        <div class="gs-num">${i + 1}</div>
        <div class="gs-info"><b>${st.name}</b><span>상대 평균 ${st.ovr} · 승리 보상 ${L.fmtGold(st.reward)}골드${cleared ? '' : ' (첫 승리 2배)'}</span></div>
        <button class="gs-btn" data-stage="${i}" ${locked ? 'disabled' : ''}>${locked ? '잠김' : cleared ? '재도전' : '도전'}</button>
      </div>`;
    }).join('');
    body().innerHTML = `
      <section class="g-panel">
        <div class="g-head"><h3>내 라인업</h3><button class="g-small" id="gAuto">최고 라인업 자동 배치</button></div>
        <div class="g-slots">${lu.map((p) => `<button class="g-slot" data-pos="${p.pos}"><span class="g-pos">${L.POS[p.pos].ko}</span>${thumb(p)}</button>`).join('')}</div>
        <div class="g-meta">
          <span>평균 종합 <b>${avgOvr(lu)}</b></span>
          <span>시너지 <b>+${syn.pct}%</b>${syn.bestTeam ? ` (${esc(syn.bestTeam)}${syn.leagueBonus ? ' · 같은 리그' : ''})` : syn.leagueBonus ? ' (같은 리그)' : ''}</span>
          <span>전적 <b>${G.w}승 ${G.l}패</b></span>
        </div>
        ${rookies ? `<p class="g-warn">빈 자리 ${rookies}곳은 연습생(종합 66)이 뜁니다. 슬롯을 눌러 내 카드를 넣거나 뽑기로 선수를 모으세요.</p>` : ''}
      </section>
      <section class="g-panel">
        <h3>도전 단계</h3>
        <div class="g-stages">${stages}</div>
      </section>
      <section class="g-panel g-help">
        <h3>게임 방법</h3>
        <p>3판 2선승제입니다. 한 판은 <b>라인전 → 운영 → 한타</b> 3단계이고, 단계마다 작전 하나를 고릅니다.</p>
        <p>작전끼리는 상성이 있어서, 상대 작전을 이기는 작전을 고르면 그 단계 전력이 10% 올라갑니다. 정찰 보고를 보고 상대 작전을 예측해 보세요.</p>
        <p class="g-rps">라인전: 공격적 › 안정적 › 로밍 › 공격적<br>운영: 오브젝트 › 스플릿 › 시야 › 오브젝트<br>한타: 정면 › 수비 역습 › 기습 › 정면</p>
      </section>`;
    $('#gAuto').onclick = () => { autoLineup(); lobby(); L.toast('내 카드 중 포지션별 최고 선수로 배치했어요'); };
    body().querySelectorAll('.g-slot').forEach((b) => { b.onclick = () => openPicker(b.dataset.pos); });
    body().querySelectorAll('.gs-btn').forEach((b) => { b.onclick = () => startMatch(+b.dataset.stage); });
  }

  // ───── 선수 고르기 ─────
  function openPicker(pos) {
    const mine = L.ownedList().filter((p) => p.pos === pos).sort((a, b) => b.ovr - a.ovr);
    $('#pickerTitle').textContent = `${L.POS[pos].ko} 선수 선택 (${mine.length}명 보유)`;
    const cur = G.lineup[pos];
    $('#pickerList').innerHTML = (mine.length ? mine.map((p) => `
      <button class="pk-row ${p.id === cur ? 'on' : ''}" data-id="${p.id}">
        ${thumb(p, 'sm')}
        <div class="pk-info"><b>${esc(p.ign)}</b><span>${esc(L.team(p).name)} · ${p.league} · ${L.starsHtml(p.stars)}</span></div>
        <div class="pk-ovr">${p.ovr}</div>
      </button>`).join('') : `<p class="pk-empty">이 포지션 카드가 아직 없습니다. 뽑기로 모아 보세요.</p>`) +
      `<button class="pk-row" data-id=""><div class="g-thumb sm is-rookie"><div class="g-art"><div class="g-rookie">?</div></div><div class="g-ovr">66</div></div><div class="pk-info"><b>연습생</b><span>빈 자리로 두기</span></div></button>`;
    $('#pickerList').querySelectorAll('.pk-row').forEach((b) => {
      b.onclick = () => {
        if (b.dataset.id) G.lineup[pos] = b.dataset.id; else delete G.lineup[pos];
        save(); closePicker(); lobby();
      };
    });
    $('#picker').hidden = false;
  }
  function closePicker() { $('#picker').hidden = true; }

  // ───── 경기 ─────
  let M = null;
  function startMatch(stageIdx) {
    const st = STAGES[stageIdx];
    const me = myLineup();
    const ai = aiLineup(st);
    M = { stageIdx, st, me, ai, synMe: synergy(me).pct, synAi: synergy(ai).pct, set: 1, score: [0, 0], phase: 0, adv: 0, log: [], busy: false };
    screen = 'match';
    renderMatch();
  }
  function scout() {
    const ph = PHASES[M.phase];
    const best = ph.choices.slice().sort((a, b) => power(M.ai, b, M.synAi) - power(M.ai, a, M.synAi))[0];
    return best;
  }
  function aiChoose() {
    const ph = PHASES[M.phase];
    if (Math.random() < 0.5) return scout();
    return ph.choices[Math.floor(Math.random() * ph.choices.length)];
  }
  function gauge() {
    const v = Math.max(-40, Math.min(40, M.adv));
    const pct = (v / 40) * 50;
    return `<div class="g-gauge"><span class="g-gl">나</span><div class="g-bar"><i style="left:${pct >= 0 ? 50 : 50 + pct}%;width:${Math.abs(pct)}%" class="${v >= 0 ? 'up' : 'down'}"></i><b></b></div><span class="g-gr">상대</span></div>
      <p class="g-advtxt">${Math.abs(M.adv) < 3 ? '팽팽한 흐름' : M.adv > 0 ? `우리 팀 우세 (+${Math.round(M.adv)})` : `상대 팀 우세 (${Math.round(M.adv)})`}</p>`;
  }
  function renderMatch(result) {
    $('#gameTitle').textContent = `${M.st.name} · ${M.set}세트`;
    const ph = PHASES[M.phase];
    const hint = ph ? scout() : null;
    const choices = ph ? ph.choices.map((c) => `
      <button class="g-choice" data-key="${c.key}" ${M.busy ? 'disabled' : ''}>
        <b>${c.name}</b><span>${c.desc}</span><em>내 전력 ${Math.round(power(M.me, c, M.synMe))}</em>
      </button>`).join('') : '';
    body().innerHTML = `
      <section class="g-board">
        <div class="g-side"><b>내 팀</b><span>평균 ${avgOvr(M.me)}${M.synMe ? ` · 시너지 +${M.synMe}%` : ''}</span></div>
        <div class="g-score"><b>${M.score[0]}</b><i>:</i><b>${M.score[1]}</b></div>
        <div class="g-side r"><b>${esc(M.st.team)}</b><span>평균 ${avgOvr(M.ai)}${M.synAi ? ` · 시너지 +${M.synAi}%` : ''}</span></div>
      </section>
      <div class="g-teams"><div class="g-row">${M.me.map((p) => thumb(p, 'xs')).join('')}</div><div class="g-row">${M.ai.map((p) => thumb(p, 'xs')).join('')}</div></div>
      ${gauge()}
      ${result ? result : `
      <section class="g-panel g-phase">
        <div class="g-steps">${PHASES.map((x, i) => `<span class="${i < M.phase ? 'done' : i === M.phase ? 'now' : ''}">${i + 1}. ${x.name}</span>`).join('')}</div>
        <p class="g-scout">정찰 보고: 상대는 <b>${hint.name}</b>에 강해 보입니다.</p>
        <div class="g-choices">${choices}</div>
      </section>`}
      <section class="g-log" id="gLog">${M.log.map((x) => `<p class="${x.c || ''}">${x.t}</p>`).join('')}</section>`;
    body().querySelectorAll('.g-choice').forEach((b) => { b.onclick = () => play(b.dataset.key); });
    body().querySelectorAll('[data-act]').forEach((b) => { b.onclick = () => act(b.dataset.act); });
    const lg = $('#gLog'); if (lg) lg.scrollTop = lg.scrollHeight;
  }
  const say = (t, c) => M.log.push({ t, c });
  const nm = (p) => `<b>${esc(p.ign)}</b>`;

  function play(key) {
    if (M.busy) return;
    const ph = PHASES[M.phase];
    const mine = ph.choices.find((c) => c.key === key);
    const theirs = aiChoose();
    let my = power(M.me, mine, M.synMe) * (0.96 + Math.random() * 0.08);
    let op = power(M.ai, theirs, M.synAi) * (0.96 + Math.random() * 0.08);
    let rps = '';
    if (mine.beats === theirs.key) { my *= 1.1; rps = 'win'; }
    else if (theirs.beats === mine.key) { op *= 1.1; rps = 'lose'; }
    const delta = ((my - op) / op) * 100 * ph.weight;
    M.adv += delta;
    say(`<span class="g-tag">${ph.name}</span> 나: ${mine.name} vs 상대: ${theirs.name}${rps === 'win' ? ' <em class="good">· 작전 상성 우위!</em>' : rps === 'lose' ? ' <em class="bad">· 작전을 읽혔다!</em>' : ''}`);
    const a = star(M.me, mine), b = star(M.ai, theirs);
    if (delta > 6) say(`${nm(a)} 선수의 활약으로 크게 앞서 나갑니다! (+${Math.round(delta)})`, 'good');
    else if (delta > 0) say(`${nm(a)} 선수가 조금씩 이득을 쌓습니다. (+${Math.round(delta)})`, 'good');
    else if (delta > -6) say(`상대 ${nm(b)} 선수에게 조금 밀립니다. (${Math.round(delta)})`, 'bad');
    else say(`상대 ${nm(b)} 선수가 경기를 흔듭니다! (${Math.round(delta)})`, 'bad');
    M.phase++;
    if (M.phase < PHASES.length) { renderMatch(); return; }
    // 세트 결과: 누적 우세로 승률을 정한다
    const prob = 1 / (1 + Math.exp(-M.adv / 14));
    const won = Math.random() < prob;
    M.score[won ? 0 : 1]++;
    say(won ? `<b>${M.set}세트 승리!</b> 넥서스를 파괴했습니다. (예상 승률 ${Math.round(prob * 100)}%)` : `<b>${M.set}세트 패배.</b> 상대가 넥서스를 파괴했습니다. (예상 승률 ${Math.round(prob * 100)}%)`, won ? 'win' : 'lose');
    if (M.score[0] === 2 || M.score[1] === 2) { finish(); return; }
    M.busy = true;
    renderMatch(`<section class="g-panel g-result"><h3 class="${won ? 'good' : 'bad'}">${M.set}세트 ${won ? '승리' : '패배'}</h3><p>세트 스코어 ${M.score[0]} : ${M.score[1]}</p><button class="primary wide" data-act="next">${M.set + 1}세트 시작</button></section>`);
  }
  function act(a) {
    if (a === 'next') { M.set++; M.phase = 0; M.adv = 0; M.busy = false; say(`── ${M.set}세트 ──`, 'sep'); renderMatch(); }
    if (a === 'again') startMatch(M.stageIdx);
    if (a === 'lobby') lobby();
    if (a === 'nextstage') startMatch(Math.min(M.stageIdx + 1, STAGES.length - 1));
  }
  function finish() {
    const win = M.score[0] === 2;
    const first = win && !G.cleared[M.stageIdx];
    let reward = win ? M.st.reward * (first ? 2 : 1) : Math.round((M.st.reward * 0.3) / 10) * 10;
    if (win) { G.w++; G.cleared[M.stageIdx] = true; G.unlocked = Math.max(G.unlocked, Math.min(M.stageIdx + 1, STAGES.length - 1)); }
    else G.l++;
    save();
    L.addGold(reward);
    M.busy = true;
    const canNext = win && M.stageIdx < STAGES.length - 1;
    renderMatch(`<section class="g-panel g-result final ${win ? 'w' : 'l'}">
      <h2>${win ? '승리!' : '패배'}</h2>
      <p class="g-final">${M.score[0]} : ${M.score[1]}</p>
      <p class="g-reward"><span class="coin"></span> +${L.fmtGold(reward)}골드${first ? ' <small>(첫 승리 2배)</small>' : !win ? ' <small>(참가 보상)</small>' : ''}</p>
      ${win && first && M.stageIdx < STAGES.length - 1 ? `<p class="g-unlock">${M.stageIdx + 2}단계 「${STAGES[M.stageIdx + 1].name}」가 열렸습니다!</p>` : ''}
      <div class="g-btns">
        ${canNext ? '<button class="primary" data-act="nextstage">다음 단계 도전</button>' : ''}
        <button data-act="again">${win ? '같은 단계 다시' : '재도전'}</button>
        <button data-act="lobby">로비로</button>
      </div>
    </section>`);
  }

  // ───── 열기 / 닫기 ─────
  function open() {
    $('#game').hidden = false;
    document.body.classList.add('locked');
    if (!Object.keys(G.lineup).length && L.ownedList().length) autoLineup();
    lobby();
    L.renderGold();
  }
  function close() {
    $('#game').hidden = true;
    closePicker();
    document.body.classList.remove('locked');
    L.applyFilters();
  }
  // 경기 중에는 로비로, 로비에서는 게임 닫기
  function back() {
    if (!$('#picker').hidden) { closePicker(); return true; }
    if ($('#game').hidden) return false;
    if (screen === 'match') { lobby(); return true; }
    close(); return true;
  }
  $('#gameBtn').addEventListener('click', open);
  $('#gameBack').addEventListener('click', back);
  $('#pickerClose').addEventListener('click', closePicker);
  $('#picker').addEventListener('click', (e) => { if (e.target.id === 'picker') closePicker(); });
  window.LOLGame = { onBack: back, open };
})();
