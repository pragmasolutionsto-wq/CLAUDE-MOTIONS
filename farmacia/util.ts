import T from './timeline.json';

export const FPS = T.fps;
export const W = 1080;
export const H = 1920;

// palette presa dal logo
export const BLUE = '#1383B5';
export const BLUE_D = '#0B5E86';
export const TEAL = '#3DAAA7';
export const TEAL_HI = '#7FD6D2';
export const SAGE = '#5CA7A0';
export const NAVY = '#0A2740';
export const INK = '#061826';
export const ICE = '#EEF7F8';
export const WHITE = '#FFFFFF';
export const GOLD = '#E9C77B';
export const CORAL = '#E8705A';

// timeline: ogni segmento è un pezzo di clip; i cue sono [segmento, secondo nella clip sorgente]
export const SEGS = T.segs;
export const SEG_START: number[] = [];
let acc = 0;
for (const s of SEGS) {
  SEG_START.push(acc);
  acc += s.out - s.in;
}
export const SPEECH_END = acc;
export const DURATION = acc + T.tail;
export const segOf = (t: number) => {
  let k = 0;
  while (k + 1 < SEGS.length && t >= SEG_START[k + 1]) k++;
  return k;
};
type CueName = keyof typeof T.cues;
export const cue = (name: CueName) => {
  const [k, at] = T.cues[name];
  return SEG_START[k] + (at - SEGS[k].in);
};
export const segT = (k: number) => SEG_START[k];
export const segEnd = (k: number) => (k + 1 < SEGS.length ? SEG_START[k + 1] : SPEECH_END);

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eO3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const eO5 = (x: number) => 1 - Math.pow(1 - x, 5);
export const eI3 = (x: number) => x * x * x;
export const eBack = (x: number, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
export const eExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
// molla smorzata 0→1 (overshoot)
export const spring = (x: number, k = 7, d = 4.2) => (x <= 0 ? 0 : 1 - Math.exp(-d * x) * Math.cos(k * x));
// visibilità con entrata/uscita: 0..1
export const life = (t: number, a: number, b: number, fi = 0.25, fo = 0.2) => Math.min(prog(t, a, a + fi), 1 - prog(t, b - fo, b));
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
