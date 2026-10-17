export const FPS = 60;
export const DURATION = 15;
export const W = 1920;
export const H = 1080;

// palette presa dal logo Pragma
export const INK = '#050B1C';
export const NAVY = '#0D1B46';
export const NAVY2 = '#1B3A78';
export const TEAL = '#5CCAD4';
export const TEAL_HI = '#A6F3F7';
export const TEAL_D = '#1E8FA0';
export const ICE = '#EAF7F9';
export const WHITE = '#F6FCFD';

// 144 BPM: 36 battute = 15s esatti, ogni taglio cade su un battito
export const B = 60 / 144;
export const SC = [0, 5, 12, 19, 26, 31, 36].map((n) => n * B);

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eO3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const eO4 = (x: number) => 1 - Math.pow(1 - x, 4);
export const eO5 = (x: number) => 1 - Math.pow(1 - x, 5);
export const eI3 = (x: number) => x * x * x;
export const eBack = (x: number, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
export const eExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
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
export type Pt = [number, number];
export const bez = (p0: Pt, c1: Pt, c2: Pt, p1: Pt, u: number): Pt => {
  const k = 1 - u;
  return [
    k * k * k * p0[0] + 3 * k * k * u * c1[0] + 3 * k * u * u * c2[0] + u * u * u * p1[0],
    k * k * k * p0[1] + 3 * k * k * u * c1[1] + 3 * k * u * u * c2[1] + u * u * u * p1[1],
  ];
};
