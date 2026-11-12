// 진입점.
import { Save } from './save.js';
import { Sound } from './audio.js';
import { UI } from './ui.js';
import { Game } from './game.js';
import { initInput } from './input.js';

function boot() {
  const canvas = document.getElementById('gl');
  const save = new Save();
  const sound = new Sound();
  sound.sfxOn = save.data.settings.sfx;
  sound.musicOn = save.data.settings.music;
  const ui = new UI(document.getElementById('ui'), save, sound);
  const game = new Game({ canvas, save, sound, ui });
  ui.attach(game);

  initInput(canvas, (act) => { sound.unlock(); game.input(act); });
  window.addEventListener('pointerdown', () => { sound.unlock(); sound.refresh(); }, { passive: true });

  const params = new URLSearchParams(location.search);
  if (params.has('bot')) game.bot = true;

  game.enterHome();

  const loop = (now) => {
    requestAnimationFrame(loop);
    try { game.frame(now); } catch (e) { console.error(e); showError(e); }
  };
  requestAnimationFrame(loop);

  // 앱이 가려지면 일시정지하고 소리를 끈다
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { game.pause(); sound.suspend(); }
    else { sound.resume(); game.lastT = 0; }
  });

  // 안드로이드 앱에서 호출하는 훅
  window.__onBack = () => ui.back();
  window.__setInsets = (t, r, b, l) => {
    const s = document.documentElement.style;
    s.setProperty('--inset-top', t + 'px');
    s.setProperty('--inset-right', r + 'px');
    s.setProperty('--inset-bottom', b + 'px');
    s.setProperty('--inset-left', l + 'px');
  };
  window.__game = game;

  const bootEl = document.getElementById('boot');
  if (bootEl) bootEl.remove();
}

let errorShown = false;
function showError(e) {
  if (errorShown) return;
  errorShown = true;
  const el = document.createElement('div');
  el.className = 'fatal';
  el.textContent = '문제가 생겼어요: ' + (e && e.message ? e.message : e);
  document.body.appendChild(el);
}

try { boot(); } catch (e) { console.error(e); showError(e); }
