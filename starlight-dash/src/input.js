// 입력: 터치 스와이프 + 키보드. 동작은 'left' | 'right' | 'up' | 'down'.

export function initInput(target, onAction) {
  let sx = 0, sy = 0, id = null;

  const threshold = () => Math.max(18, Math.min(window.innerWidth, window.innerHeight) * 0.045);

  target.addEventListener('pointerdown', (e) => {
    if (id !== null) return;
    id = e.pointerId; sx = e.clientX; sy = e.clientY;
  });

  target.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    const th = threshold();
    if (Math.abs(dx) < th && Math.abs(dy) < th) return;
    if (Math.abs(dx) > Math.abs(dy)) onAction(dx > 0 ? 'right' : 'left');
    else onAction(dy > 0 ? 'down' : 'up');
    // 손가락을 떼지 않고 이어서 스와이프할 수 있게 기준점을 옮긴다
    sx = e.clientX; sy = e.clientY;
  });

  const end = (e) => { if (e.pointerId === id) id = null; };
  target.addEventListener('pointerup', end);
  target.addEventListener('pointercancel', end);

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    switch (e.code) {
      case 'ArrowLeft': case 'KeyA': onAction('left'); break;
      case 'ArrowRight': case 'KeyD': onAction('right'); break;
      case 'ArrowUp': case 'KeyW': case 'Space': onAction('up'); break;
      case 'ArrowDown': case 'KeyS': onAction('down'); break;
      case 'Escape': case 'KeyP': onAction('pause'); break;
      default: return;
    }
    e.preventDefault();
  });
}
