export const FPS = 30;
export const W = 1080;
export const H = 1920;

// 150 BPM: un battito = 12 frame esatti, ogni taglio cade su un battito
export const BF = 12;
export const BEATS = 38;
export const DURATION_F = BEATS * BF;

export const GOLD = '#E2B13C';
export const GOLD_HI = '#FFD978';
export const INK = '#04060C';
export const WHITE = '#F7F7F5';

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eO3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const eO5 = (x: number) => 1 - Math.pow(1 - x, 5);
export const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const rnd = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// timeline: clip, battito d'inizio, durata in battiti, punto d'ingresso nel clip (s)
export type Shot = {clip: string; b: number; n: number; at: number; fx?: 'drop' | 'stutter' | 'dark' | 'hero'};
export const SHOTS: Shot[] = [
  {clip: 'c9238', b: 0, n: 3, at: 0.0},
  {clip: 'c9239', b: 3, n: 2, at: 0.3},
  {clip: 'c9240', b: 5, n: 3, at: 0.5},
  {clip: 'c9248', b: 8, n: 2, at: 1.2},
  {clip: 'c9250', b: 10, n: 2, at: 0.8},
  {clip: 'c9247', b: 12, n: 2, at: 0.6},
  {clip: 'c9245', b: 14, n: 2, at: 0.0, fx: 'dark'},
  {clip: 'c9244', b: 16, n: 2, at: 0.3, fx: 'drop'},
  {clip: 'c9241', b: 18, n: 3, at: 0.0},
  {clip: 'c9239', b: 21, n: 1, at: 1.1, fx: 'stutter'},
  {clip: 'c9240', b: 22, n: 1, at: 1.9, fx: 'stutter'},
  {clip: 'c9248', b: 23, n: 1, at: 2.4, fx: 'stutter'},
  {clip: 'c9250', b: 24, n: 1, at: 2.2, fx: 'stutter'},
  {clip: 'c9249', b: 25, n: 6, at: 0.9, fx: 'hero'},
];
export const END_B = 31;
