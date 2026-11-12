// 단색 아이콘(24x24 path). DOM의 SVG와 캔버스(Path2D) 양쪽에서 같은 모양을 쓴다.

function star(cx, cy, R, r) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rad).toFixed(2) + ' ' + (cy + Math.sin(a) * rad).toFixed(2);
  }
  return d + 'Z';
}

function gear() {
  let d = '';
  const teeth = 8;
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2 - Math.PI / (teeth * 4);
    const rad = i % 4 < 2 ? 10 : 7.6;
    d += (i ? 'L' : 'M') + (12 + Math.cos(a) * rad).toFixed(2) + ' ' + (12 + Math.sin(a) * rad).toFixed(2);
  }
  // 가운데 구멍(evenodd)
  return d + 'Z M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z';
}

export const ICONS = {
  star: star(12, 12.6, 10.4, 4.5),
  magnet: 'M4 3h5v9a3 3 0 0 0 6 0V3h5v9a8 8 0 0 1-16 0zM4 3h5v3H4zM15 3h5v3h-5z',
  shield: 'M12 2l8.5 3v6.2c0 5-3.5 9.2-8.5 10.8C7 20.4 3.5 16.2 3.5 11.2V5z',
  bolt: 'M13.5 1.5L4 14h6.2L8.8 22.5 20 9.5h-6.6z',
  heart: 'M12 21L3.3 11.6A5.3 5.3 0 0 1 12 6.2a5.3 5.3 0 0 1 8.7 5.4z',
  rocket: 'M12 1.5c3.2 2.6 4.8 6.2 4.8 10.2l2.7 3.2v4.3l-4.2-2.1H8.7l-4.2 2.1v-4.3l2.7-3.2c0-4 1.6-7.6 4.8-10.2zM10 19h4l-2 3.5z',
  pause: 'M6 4h4.5v16H6zM13.5 4H18v16h-4.5z',
  play: 'M7 3.5l13.5 8.5L7 20.5z',
  gear: gear(),
  bag: 'M5.5 8h13L20 21.5H4zM8.5 8V6.5a3.5 3.5 0 0 1 7 0V8h-2V6.5a1.5 1.5 0 0 0-3 0V8z',
  user: 'M12 2.5a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4zM3 21.5c0-4.6 4-7.3 9-7.3s9 2.7 9 7.3z',
  flag: 'M5 2h2.4v20H5zM8.5 3H20l-3.2 4.6L20 12.2H8.5z',
  lock: 'M6.8 10V7.2a5.2 5.2 0 0 1 10.4 0V10H19v11.5H5V10zM9.3 10h5.4V7.2a2.7 2.7 0 0 0-5.4 0z',
  check: 'M3.5 12.6l2.6-2.6 3.7 3.7 8.1-8.1 2.6 2.6L9.8 18.9z',
  close: 'M4.6 6.7l2.1-2.1L12 9.9l5.3-5.3 2.1 2.1L14.1 12l5.3 5.3-2.1 2.1L12 14.1l-5.3 5.3-2.1-2.1L9.9 12z',
  home: 'M12 2.5l10 8.8h-2.8v9.7h-5.4v-6.3h-3.6V21H4.8v-9.7H2z',
  retry: 'M12 4.2V1l5.2 4.3L12 9.6V6.4a5.8 5.8 0 1 0 5.8 5.8h2.2A8 8 0 1 1 12 4.2z',
  sound: 'M3 9h4.2L12.5 4.5v15L7.2 15H3zM15 8.2a5 5 0 0 1 0 7.6zM17.2 4.6a9.6 9.6 0 0 1 0 14.8l-1.3-1.6a7.4 7.4 0 0 0 0-11.6z',
  music: 'M9 4.2l11-2.4v13.4a3.2 3.2 0 1 1-2.2-3V6.3L11.2 7.7v9.5a3.2 3.2 0 1 1-2.2-3z',
  vibrate: 'M8 3.5h8v17H8zM4 8h2.2v8H4zM17.8 8H20v8h-2.2zM0.8 10h1.8v4H0.8zM21.4 10h1.8v4h-1.8z',
  arrow: 'M2.5 12L12 2.5v5.7h9.5v7.6H12v5.7z', // 왼쪽 화살표
  trophy: 'M7 2.5h10V5h3.5v2.5c0 2.6-1.8 4.6-4.2 5a5 5 0 0 1-3 2.3V18h3.2v3.5h-9V18h3.2v-3.2a5 5 0 0 1-3-2.3c-2.4-.4-4.2-2.4-4.2-5V5H7zM5.6 7v.5c0 1.2.6 2.2 1.4 2.7V7zM17 7v3.2c.8-.5 1.4-1.5 1.4-2.7V7z',
  cheat: 'M12 1.8l2.2 4.3 4.8-1 -1 4.8 4.3 2.1-4.3 2.2 1 4.8-4.8-1L12 22.2l-2.2-4.2-4.8 1 1-4.8L1.7 12 6 9.9l-1-4.8 4.8 1z',
};

/** DOM용 SVG 문자열. */
export function icon(name, cls = '') {
  if (name === 'x2') return `<span class="ico ico-x2 ${cls}">×2</span>`;
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${ICONS[name]}"/></svg>`;
}

/** 캔버스에 아이콘을 그린다(중심 cx,cy, 크기 size). */
export function drawIcon(ctx, name, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  if (name === 'x2') {
    ctx.font = `900 ${Math.round(size * 0.78)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×2', cx, cy + size * 0.03);
  } else {
    ctx.translate(cx - size / 2, cy - size / 2);
    ctx.scale(size / 24, size / 24);
    ctx.fill(new Path2D(ICONS[name]), 'evenodd');
  }
  ctx.restore();
}
