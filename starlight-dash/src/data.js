// 게임 데이터: 캐릭터, 강화, 아이템, 파워업, 미션 정의.

export const CHARACTERS = [
  { id: 'lumi', name: '루미', title: '별빛 배달부', price: 0, perk: '균형 잡힌 기본 러너' },
  { id: 'koko', name: '코코', title: '숲의 여우', price: 1500, perk: '자석 범위 +40%' },
  { id: 'bolt', name: '볼트', title: '수리 로봇', price: 4000, perk: '보호막을 두른 채 출발' },
  { id: 'kage', name: '카게', title: '그림자 닌자', price: 8000, perk: '점수 배율 +1' },
  { id: 'nova', name: '노바', title: '우주 비행사', price: 15000, perk: '부스터 지속 시간 +40%' },
  { id: 'draco', name: '드라코', title: '꼬마 용', price: 30000, perk: '매 판 무료 부활 1회' },
];

export const POWERUPS = {
  magnet: { name: '자석', color: '#ff4f7b', icon: 'magnet' },
  shield: { name: '보호막', color: '#3fb8ff', icon: 'shield' },
  boost: { name: '부스터', color: '#ff9a2e', icon: 'bolt' },
  double: { name: '더블 코인', color: '#3ddc97', icon: 'x2' },
};

// 강화: level 0~5. 값 = base + per * level
export const UPGRADES = [
  { id: 'magnet', name: '자석', icon: 'magnet', color: '#ff4f7b', desc: '주변의 별 코인을 끌어당깁니다', base: 8, per: 2, unit: '초', costs: [300, 700, 1500, 3000, 6000] },
  { id: 'shield', name: '보호막', icon: 'shield', color: '#3fb8ff', desc: '장애물 충돌을 한 번 막아 줍니다', base: 10, per: 3, unit: '초', costs: [300, 700, 1500, 3000, 6000] },
  { id: 'boost', name: '부스터', icon: 'bolt', color: '#ff9a2e', desc: '무적 상태로 빠르게 질주합니다', base: 4, per: 1, unit: '초', costs: [400, 900, 1800, 3600, 7000] },
  { id: 'double', name: '더블 코인', icon: 'x2', color: '#3ddc97', desc: '별 코인을 두 배로 얻습니다', base: 10, per: 3, unit: '초', costs: [300, 700, 1500, 3000, 6000] },
  { id: 'mult', name: '점수 배율', icon: 'star', color: '#ffd23f', desc: '기본 점수 배율이 올라갑니다', base: 1, per: 1, unit: '배', costs: [1000, 2500, 5000, 10000, 20000] },
];

export const ITEMS = [
  { id: 'revive', name: '부활의 별', icon: 'heart', color: '#ff5d73', desc: '쓰러진 자리에서 다시 일어나 달립니다', price: 800 },
  { id: 'headstart', name: '스타트 대시', icon: 'rocket', color: '#b388ff', desc: '출발하자마자 600m를 단숨에 질주합니다', price: 500 },
];

export function upgradeValue(def, level) { return def.base + def.per * level; }

// 미션: scope 'run' = 한 판 안에서 달성, 'total' = 누적
export const MISSIONS = [
  { id: 'coins_run', scope: 'run', stat: 'coins', text: (n) => `한 판에 별 코인 ${n}개 모으기`, base: 60, step: 40, reward: 300 },
  { id: 'dist_run', scope: 'run', stat: 'dist', text: (n) => `한 판에 ${n}m 달리기`, base: 600, step: 400, reward: 300 },
  { id: 'score_run', scope: 'run', stat: 'score', text: (n) => `한 판에 ${n.toLocaleString()}점 얻기`, base: 2000, step: 2000, reward: 350 },
  { id: 'biomes_run', scope: 'run', stat: 'biomes', text: (n) => `한 판에 지형 ${n}곳 지나기`, base: 2, step: 1, max: 6, reward: 400 },
  { id: 'dist_total', scope: 'total', stat: 'dist', text: (n) => `누적 ${n.toLocaleString()}m 달리기`, base: 2000, step: 1500, reward: 400 },
  { id: 'coins_total', scope: 'total', stat: 'coins', text: (n) => `별 코인 누적 ${n}개 모으기`, base: 250, step: 150, reward: 350 },
  { id: 'jumps', scope: 'total', stat: 'jumps', text: (n) => `점프 ${n}번 하기`, base: 30, step: 20, reward: 250 },
  { id: 'slides', scope: 'total', stat: 'slides', text: (n) => `슬라이드 ${n}번 하기`, base: 20, step: 15, reward: 250 },
  { id: 'powerups', scope: 'total', stat: 'powerups', text: (n) => `파워업 ${n}개 획득하기`, base: 4, step: 3, reward: 300 },
  { id: 'turns', scope: 'total', stat: 'turns', text: (n) => `코너 ${n}번 돌기`, base: 12, step: 8, reward: 250 },
];

export function missionDef(id) { return MISSIONS.find((m) => m.id === id); }
export function missionTarget(def, tier) {
  const t = def.base + def.step * tier;
  return def.max ? Math.min(def.max, t) : t;
}
export function missionReward(def, tier) { return Math.round(def.reward * (1 + 0.4 * tier) / 10) * 10; }
