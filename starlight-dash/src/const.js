// 공용 상수.
export const LANE_W = 2.2; // 차선 간격
export const PATH_W = 7.2; // 길 전체 폭
export const HALF_W = PATH_W / 2;
export const LANE_X = [-LANE_W, 0, LANE_W];
export const BASE_Y = -6; // 길 아래 바닥(지면) 높이
export const SLAB_T = 0.9; // 길 두께
export const JUMP_V = 10.5;
export const GRAV = 32;
export const SLIDE_TIME = 0.75;

export function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
export function lerp(a, b, t) { return a + (b - a) * t; }

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 달린 거리에 따른 기본 속도(m/s). */
export function speedAt(dist) { return 13 + 15 * (1 - Math.exp(-dist / 2000)); }
/** 달린 거리에 따른 난이도 0~1. */
export function difficultyAt(dist) { return Math.min(1, dist / 4500); }
