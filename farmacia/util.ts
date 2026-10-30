import timeline from './timeline.json';

export const FPS = timeline.fps;
export const DURATION = timeline.duration;
export const SC = timeline.scenes;
export const B = 60 / timeline.bpm;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eO3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const eO4 = (x: number) => 1 - Math.pow(1 - x, 4);
export const eO5 = (x: number) => 1 - Math.pow(1 - x, 5);
export const eExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const eBack = (x: number, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
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
