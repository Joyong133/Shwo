// 명소 id → 절차적 장면 빌더
import { haeundae, marine, yonggungsa, jukseong } from './east.js';
import { gwangalli, oryukdo, igidae } from './suyeong.js';
import { gamcheon, jagalchi, tower, taejongdae, huinnyeoul } from './old.js';
import { seomyeon, sajik, beomeosa } from './north.js';
import { dadaepo, eulsukdo } from './west.js';
import { addPine } from '../kit3d.js';

/** 빌더가 없는 명소(데이터만 추가한 경우)를 위한 기본 장면: 바닷가 전망대 */
function fallback(ctx) {
  ctx.disc(14, 0xcfc8ba, 0);
  ctx.sea({ y: -3 });
  ctx.solid.dome(160, 50, 0, -4, 190, 0x4f8a55);
  for (let i = 0; i < 20; i++) addPine(ctx.solid, -60 + ctx.rand() * 120, 0, 24 + ctx.rand() * 40, 8 + ctx.rand() * 5, ctx.rand);
  ctx.sign(ctx.spot.name, 6, 0, 3, -12, 0, { w: 1024, h: 220, size: 130 });
}

export const SPOT_BUILDERS = {
  haeundae, marine, yonggungsa, jukseong,
  gwangalli, oryukdo, igidae,
  gamcheon, jagalchi, tower, taejongdae, huinnyeoul,
  seomyeon, sajik, beomeosa,
  dadaepo, eulsukdo,
  __default: fallback,
};
