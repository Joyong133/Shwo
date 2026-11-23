(() => {
  'use strict';
  const TEAMS = window.TEAMS;
  const STAT_NAMES = ['라인전', '한타', '운영', '피지컬', '챔프폭', '안정감'];
  const STAT_SHORT = ['LAN', 'TMF', 'MAC', 'PHY', 'POL', 'CON'];
  const POS = {
    TOP: { ko: '탑', order: 0 }, JGL: { ko: '정글', order: 1 }, MID: { ko: '미드', order: 2 },
    ADC: { ko: '원딜', order: 3 }, SUP: { ko: '서폿', order: 4 },
  };
  // 포지션별 가중치 [라인전, 한타, 운영, 피지컬, 챔프폭, 안정감]
  const WEIGHTS = {
    TOP: [0.22, 0.18, 0.15, 0.20, 0.12, 0.13],
    JGL: [0.10, 0.20, 0.25, 0.18, 0.12, 0.15],
    MID: [0.22, 0.18, 0.17, 0.20, 0.12, 0.11],
    ADC: [0.20, 0.25, 0.10, 0.22, 0.08, 0.15],
    SUP: [0.15, 0.22, 0.23, 0.12, 0.13, 0.15],
  };
  const STAR_STEPS = [ // [최소 종합, 별]
    [93, 5], [90, 4.5], [87, 4], [84, 3.5], [81, 3], [78, 2.5], [0, 2],
  ];
  const TIERS = [
    { min: 98, key: 'icon', label: 'ICON' },
    { min: 93, key: 'legend', label: 'LEGEND' },
    { min: 87, key: 'epic', label: 'EPIC' },
    { min: 81, key: 'rare', label: 'RARE' },
    { min: 0, key: 'common', label: 'NORMAL' },
  ];
  const STATUS = { active: '현역', former: '전 LCK', retired: '은퇴' };

  // ───── 종합 능력치 · 별 등급 계산 ─────
  function compute(p) {
    const w = WEIGHTS[p.pos];
    const base = p.s.reduce((a, v, i) => a + v * w[i], 0);
    const bonus = Math.min(4, (p.w || 0) * 0.8 + (p.m || 0) * 0.4);
    const ovr = Math.min(99, Math.round(base + bonus));
    const stars = STAR_STEPS.find(([min]) => ovr >= min)[1];
    const tier = TIERS.find((t) => ovr >= t.min);
    return { base: Math.round(base * 10) / 10, bonus: Math.round(bonus * 10) / 10, ovr, stars, tier };
  }
  const META = window.PLAYER_META || {};
  const players = window.PLAYERS.map((p, i) => ({ ...p, ...(META[p.ign] || {}), id: p.ign.toLowerCase().replace(/\s+/g, ''), idx: i, ...compute(p) }));
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));

  // ───── 유틸 ─────
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const team = (p) => TEAMS[p.team] || { name: p.team, color: '#888', color2: '#111' };

  const STAR_PATH = 'M12 1.8l3.1 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.6l-6.4 3.6 1.5-7.1L1.7 9.2l7.2-.8z';
  function starsHtml(n) {
    let h = '';
    for (let i = 1; i <= 5; i++) {
      const pct = n >= i ? 100 : n >= i - 0.5 ? 50 : 0;
      h += `<span class="star"><svg viewBox="0 0 24 24"><path d="${STAR_PATH}"/></svg>` +
        (pct ? `<span class="fill" style="width:${pct}%"><svg viewBox="0 0 24 24"><path d="${STAR_PATH}"/></svg></span>` : '') + '</span>';
    }
    return `<span class="stars" role="img" aria-label="별 ${n}개">${h}</span>`;
  }

  const POS_ICON = {
    TOP: '<path d="M4 4h11l-3 3H7v5l-3 3z"/><path d="M20 20H9l3-3h5v-5l3-3z" opacity=".55"/>',
    JGL: '<path d="M12 2c1 4 4 5 4 9a4 4 0 0 1-8 0c0-4 3-5 4-9z"/><path d="M6 14c-2 1-3 3-3 5h4zM18 14c2 1 3 3 3 5h-4z" opacity=".55"/>',
    MID: '<path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>',
    ADC: '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.5"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5" stroke="currentColor" stroke-width="2"/>',
    SUP: '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>',
  };
  const posIcon = (pos, cls = '') => `<svg class="pos-ico ${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${POS_ICON[pos]}</svg>`;

  // 선수 실루엣 엠블럼 (사진 대신 팀 컬러 + 이니셜)
  function avatar(p) {
    const t = team(p);
    const gid = 'g' + p.id.replace(/[^a-z0-9]/g, '');
    return `<svg class="avatar" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="${gid}" cx="50%" cy="35%" r="70%">
          <stop offset="0" stop-color="${t.color}"/><stop offset="1" stop-color="${t.color2}"/>
        </radialGradient>
        <clipPath id="c${gid}"><circle cx="60" cy="60" r="54"/></clipPath>
      </defs>
      <circle cx="60" cy="60" r="54" fill="url(#${gid})"/>
      <g clip-path="url(#c${gid})">
        <circle cx="60" cy="50" r="20" fill="rgba(255,255,255,.9)"/>
        <path d="M18 122c2-26 19-42 42-42s40 16 42 42z" fill="rgba(255,255,255,.9)"/>
        <path d="M48 80l12 14 12-14" fill="none" stroke="${t.color}" stroke-width="4" stroke-linejoin="round"/>
      </g>
      <circle cx="60" cy="60" r="54" fill="none" class="avatar-ring" stroke-width="3"/>
    </svg>`;
  }

  window.__avatar = (id) => avatar(byId[id]);

  function cardHtml(p, big = false) {
    const t = team(p);
    const stats = p.s.map((v, i) => `<div class="st"><b>${v}</b><span>${STAT_SHORT[i]}</span></div>`).join('');
    return `<article class="card tier-${p.tier.key} ${big ? 'big' : ''}" data-id="${p.id}" style="--tc:${t.color};--tc2:${t.color2}">
      <div class="card-inner">
        <div class="shine"></div>
        <div class="card-top">
          <div class="ovr"><b>${p.ovr}</b><span>${p.pos}</span>${posIcon(p.pos)}</div>
          <div class="tags"><div class="tier-tag">${p.tier.label}</div><div class="status-tag s-${p.status}">${STATUS[p.status]}</div></div>
        </div>
        <div class="avatar-wrap">${p.img
          ? `<img class="photo${p.opaque ? ' opaque' : ''}" src="${p.img}" alt="${esc(p.ign)}" loading="lazy" decoding="async" onerror="this.replaceWith(document.createRange().createContextualFragment(window.__avatar('${p.id}')))">`
          : avatar(p)}</div>
        <div class="card-name">
          <h3>${esc(p.ign)}</h3>
          <p>${esc(p.name || p.nick)} · <span class="team-chip">${esc(t.name)}</span></p>
          ${starsHtml(p.stars)}
        </div>
        <div class="card-stats">${stats}</div>
      </div>
    </article>`;
  }

  // ───── 필터 상태 ─────
  const state = { status: 'all', pos: 'ALL', team: 'ALL', sort: 'ovr', q: '' };
  let list = [];

  function applyFilters() {
    const q = state.q.trim().toLowerCase();
    list = players.filter((p) => {
      if (state.status === 'active' && p.status !== 'active') return false;
      if (state.status === 'legend' && p.status === 'active') return false;
      if (state.pos !== 'ALL' && p.pos !== state.pos) return false;
      if (state.team !== 'ALL' && team(p).name !== state.team) return false;
      if (q) {
        const hay = [p.ign, p.name, p.nick, team(p).name, p.teams, POS[p.pos].ko].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const cmp = {
      ovr: (a, b) => b.ovr - a.ovr || b.base - a.base || a.ign.localeCompare(b.ign),
      name: (a, b) => a.ign.localeCompare(b.ign, 'en', { sensitivity: 'base' }),
      team: (a, b) => team(a).name.localeCompare(team(b).name, 'ko') || POS[a.pos].order - POS[b.pos].order,
      pos: (a, b) => POS[a.pos].order - POS[b.pos].order || b.ovr - a.ovr,
    }[state.sort];
    list.sort(cmp);
    render();
  }

  function render() {
    $('#grid').innerHTML = list.map((p) => cardHtml(p)).join('');
    $('#count').textContent = `${list.length}명의 선수`;
    $('#empty').hidden = list.length > 0;
  }

  // ───── 상세 화면 ─────
  function radar(p) {
    const cx = 110, cy = 110, R = 82, n = 6;
    const pt = (i, r) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    };
    const scale = (v) => (Math.max(50, v) - 50) / 49; // 50~99 → 0~1
    let rings = '';
    [0.25, 0.5, 0.75, 1].forEach((k) => {
      rings += `<polygon points="${[...Array(n)].map((_, i) => pt(i, R * k).join(',')).join(' ')}" class="ring"/>`;
    });
    const axes = [...Array(n)].map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="axis"/>`; }).join('');
    const shape = p.s.map((v, i) => pt(i, R * scale(v)).join(',')).join(' ');
    const labels = p.s.map((v, i) => {
      const [x, y] = pt(i, R + 20);
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="rl">${STAT_NAMES[i]}<tspan x="${x}" dy="13" class="rv">${v}</tspan></text>`;
    }).join('');
    return `<svg class="radar" viewBox="0 0 220 230" role="img" aria-label="능력치 레이더 차트">${rings}${axes}
      <polygon points="${shape}" class="shape"/>${labels}</svg>`;
  }

  function barClass(v) { return v >= 93 ? 'b5' : v >= 88 ? 'b4' : v >= 83 ? 'b3' : v >= 78 ? 'b2' : 'b1'; }

  function detailHtml(p) {
    const t = team(p);
    const w = WEIGHTS[p.pos];
    const bars = p.s.map((v, i) => `<div class="bar-row">
        <span class="bl">${STAT_NAMES[i]}</span>
        <div class="bar"><i class="${barClass(v)}" style="width:${v}%"></i></div>
        <b>${v}</b><span class="bw">×${w[i].toFixed(2)}</span>
      </div>`).join('');
    const rank = [...players].sort((a, b) => b.ovr - a.ovr || b.base - a.base).findIndex((x) => x.id === p.id) + 1;
    const posRank = players.filter((x) => x.pos === p.pos).sort((a, b) => b.ovr - a.ovr || b.base - a.base).findIndex((x) => x.id === p.id) + 1;
    const posTotal = players.filter((x) => x.pos === p.pos).length;
    const best = p.s.indexOf(Math.max(...p.s));
    return `
      <div class="detail-card">${cardHtml(p, true)}</div>
      <section class="panel head-panel">
        <h2>${esc(p.ign)} <small>${esc(p.name)}</small></h2>
        <p class="meta">${posIcon(p.pos, 'inline')} ${POS[p.pos].ko} · <span style="color:${t.color}">${esc(t.name)}</span> · ${STATUS[p.status]}</p>
        <div class="summary">
          <div><b>${p.ovr}</b><span>종합</span></div>
          <div>${starsHtml(p.stars)}<span>${p.stars}성 · ${p.tier.label}</span></div>
          <div><b>${rank}</b><span>전체 ${players.length}명 중</span></div>
          <div><b>${posRank}</b><span>${POS[p.pos].ko} ${posTotal}명 중</span></div>
        </div>
      </section>
      <section class="panel">
        <h3>선수 소개</h3>
        <p class="desc">${esc(p.desc)}</p>
        <p class="tagline">주무기: <b>${STAT_NAMES[best]}</b> · 별명 <b>${esc(p.nick)}</b></p>
      </section>
      <section class="panel">
        <h3>능력치</h3>
        ${radar(p)}
        <div class="bars">${bars}</div>
        <div class="calc">
          <div><span>포지션 가중 평균</span><b>${p.base.toFixed(1)}</b></div>
          <div><span>국제대회 보너스 (롤드컵 ${p.w}회 · MSI ${p.m}회)</span><b>+${p.bonus.toFixed(1)}</b></div>
          <div class="total"><span>종합 능력치</span><b>${p.ovr}</b></div>
        </div>
      </section>
      <section class="panel">
        <h3>주요 경력</h3>
        <ul class="hl">${p.hl.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
        <h3>소속 이력</h3>
        <p class="teams">${esc(p.teams)}</p>
        ${nowLine(p)}
      </section>
      <p class="disclaimer">능력치는 커리어 전성기 기량을 바탕으로 한 팬 메이드 평가입니다.</p>`;
  }

  function nowLine(p) {
    if (!p.now) return '';
    if (p.status === 'retired' && p.now === '소속팀 없음(FA)') return '';
    return `<div class="now"><span>2026년 11월 현재 (2027 이적 시장)</span><b>${esc(p.now)}</b></div>`;
  }

  let current = null;
  let detailList = [];
  let pushed = false;
  function backFromDetail() {
    if (pushed) { pushed = false; history.back(); }
    else { history.replaceState(null, '', location.pathname); closeDetail(); }
  }
  function openDetail(id, push = true) {
    const p = byId[id];
    if (!p) return;
    detailList = list.some((x) => x.id === id) ? list : players;
    current = p;
    const i = detailList.indexOf(p);
    $('#detailIdx').textContent = `${i + 1} / ${detailList.length}`;
    $('#detailBody').innerHTML = detailHtml(p);
    $('#detail').hidden = false;
    $('#detailBody').scrollTop = 0;
    document.body.classList.add('locked');
    const hash = '#p=' + encodeURIComponent(id);
    if (push) { history.pushState({ p: id }, '', hash); pushed = true; }
    else if (location.hash !== hash) history.replaceState({ p: id }, '', hash);
  }
  function closeDetail() {
    $('#detail').hidden = true;
    current = null;
    document.body.classList.remove('locked');
  }
  function step(d) {
    if (!current) return;
    const i = detailList.indexOf(current);
    const n = detailList[(i + d + detailList.length) % detailList.length];
    const body = $('#detailBody');
    body.classList.remove('slide-l', 'slide-r');
    void body.offsetWidth;
    body.classList.add(d > 0 ? 'slide-l' : 'slide-r');
    openDetail(n.id, false);
  }

  // ───── 카드 뽑기 ─────
  let packPick = null;
  function openPack() {
    // 높은 등급일수록 조금 덜 나오게 (가중치)
    const weight = { icon: 1, legend: 2, epic: 4, rare: 6, common: 7 };
    const total = players.reduce((a, p) => a + weight[p.tier.key], 0);
    let r = Math.random() * total;
    packPick = players.find((p) => (r -= weight[p.tier.key]) < 0) || players[0];
    $('#packStage').innerHTML = `<div class="flip">
        <div class="flip-back"><div class="cb-logo">LCK</div><div class="cb-sub">PLAYER CARD</div></div>
        <div class="flip-front">${cardHtml(packPick, true)}</div>
      </div><p class="pack-result tier-text-${packPick.tier.key}">${packPick.tier.label} · ${packPick.stars}성</p>`;
    $('#pack').hidden = false;
    document.body.classList.add('locked');
    requestAnimationFrame(() => setTimeout(() => $('#packStage .flip').classList.add('open'), 700));
  }
  function closePack() { $('#pack').hidden = true; if (!current) document.body.classList.remove('locked'); }

  // ───── 기준표 ─────
  function buildInfo() {
    $('#wtable').innerHTML = `<tr><th></th>${STAT_NAMES.map((s) => `<th>${s}</th>`).join('')}</tr>` +
      Object.entries(WEIGHTS).map(([k, w]) => `<tr><th>${POS[k].ko}</th>${w.map((v) => `<td>${Math.round(v * 100)}%</td>`).join('')}</tr>`).join('');
    const ranges = STAR_STEPS.map(([min, s], i) => {
      const max = i === 0 ? 99 : STAR_STEPS[i - 1][0] - 1;
      const cnt = players.filter((p) => p.stars === s).length;
      return `<tr><td>${starsHtml(s)}</td><td>${min === 0 ? `~${max}` : `${min}~${max}`}</td><td>${cnt}명</td></tr>`;
    });
    $('#stable').innerHTML = `<tr><th>별</th><th>종합</th><th>인원</th></tr>${ranges.join('')}`;
  }

  // ───── 이벤트 ─────
  function initUI() {
    $('#season').textContent = `현역 ${players.filter((p) => p.status === 'active').length}명 · 은퇴/전 LCK ${players.filter((p) => p.status !== 'active').length}명 · ${window.ROSTER_SEASON} 기준`;
    $('#season2').textContent = window.ROSTER_SEASON;
    const teamNames = [...new Set(players.map((p) => team(p).name))];
    $('#teamSel').innerHTML = '<option value="ALL">모든 팀</option>' + teamNames.map((n) => `<option>${esc(n)}</option>`).join('');

    $('#statusTabs').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      state.status = b.dataset.v;
      $('#statusTabs').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      applyFilters();
    });
    $('#posChips').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      state.pos = b.dataset.v;
      $('#posChips').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      applyFilters();
    });
    $('#teamSel').addEventListener('change', (e) => { state.team = e.target.value; applyFilters(); });
    $('#sortSel').addEventListener('change', (e) => { state.sort = e.target.value; applyFilters(); });
    $('#q').addEventListener('input', (e) => { state.q = e.target.value; applyFilters(); });

    $('#grid').addEventListener('click', (e) => {
      const c = e.target.closest('.card'); if (c) openDetail(c.dataset.id);
    });
    $('#closeDetail').addEventListener('click', backFromDetail);
    $('#prevBtn').addEventListener('click', () => step(-1));
    $('#nextBtn').addEventListener('click', () => step(1));

    // 스와이프로 이전/다음 선수
    let sx = 0, sy = 0, st = 0;
    const body = $('#detailBody');
    body.addEventListener('touchstart', (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
    body.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - st < 600) step(dx < 0 ? 1 : -1);
    }, { passive: true });

    window.addEventListener('popstate', syncRoute);
    document.addEventListener('keydown', (e) => {
      if ($('#detail').hidden) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'Escape') backFromDetail();
    });

    $('#packBtn').addEventListener('click', openPack);
    $('#packAgain').addEventListener('click', openPack);
    $('#packClose').addEventListener('click', closePack);
    $('#packView').addEventListener('click', () => { closePack(); if (packPick) openDetail(packPick.id); });

    $('#infoBtn').addEventListener('click', () => { $('#info').hidden = false; });
    $('#closeInfo').addEventListener('click', () => { $('#info').hidden = true; });
    $('#info').addEventListener('click', (e) => { if (e.target.id === 'info') $('#info').hidden = true; });
  }

  function syncRoute() {
    const m = /^#p=(.+)$/.exec(location.hash);
    if (m && byId[decodeURIComponent(m[1])]) openDetail(decodeURIComponent(m[1]), false);
    else { pushed = false; closeDetail(); }
  }

  // 안드로이드 뒤로가기: 열린 창부터 닫고, 처리했으면 true
  window.onAndroidBack = function () {
    if (!$('#info').hidden) { $('#info').hidden = true; return true; }
    if (!$('#pack').hidden) { closePack(); return true; }
    if (!$('#detail').hidden) { backFromDetail(); return true; }
    return false;
  };

  initUI();
  buildInfo();
  applyFilters();
  if (location.hash) syncRoute();
})();
