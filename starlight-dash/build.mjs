// src/ → www/ 번들. www/ 가 웹 배포본이자 안드로이드 앱의 assets 이다.
import { build, context } from 'esbuild';
import { cp, mkdir } from 'node:fs/promises';

const watch = process.argv.includes('--watch');
const opts = {
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  target: ['es2018'],
  minify: !watch,
  sourcemap: watch ? 'inline' : false,
  outfile: 'www/game.js',
  legalComments: 'none',
  logLevel: 'info',
};

await mkdir('www', { recursive: true });
await cp('src/index.html', 'www/index.html');
await cp('src/style.css', 'www/style.css');

if (watch) {
  const ctx = await context(opts);
  await ctx.watch();
  console.log('watching…');
} else {
  await build(opts);
}
