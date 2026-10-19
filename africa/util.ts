import T from './timeline.json';
import WORDS from './words.json';
import FACE from './face.json';

export const FPS = T.fps;
export const W = 1080;
export const H = 1920;

// palette dal logo e dalle storie di Africa Orientale
export const PETROL = '#005A52';
export const PETROL_D = '#00413B';
export const FOREST = '#1A6A50';
export const MINT = '#5CC2A9';
export const MINT_HI = '#9FE3D2';
export const SAGE = '#B8D2CA';
export const CREAM = '#F3FBF8';
export const WHITE = '#FFFFFF';
export const WARM = '#F2B544'; // accento estate
export const AUTUMN = '#E58A3A'; // accento autunno
export const ANTON = "'Anton', 'Impact', sans-serif";
export const MONT = "'Montserrat', 'Helvetica Neue', sans-serif";

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
export const segT = (k: number) => SEG_START[k];
export const segEnd = (k: number) => (k + 1 < SEGS.length ? SEG_START[k + 1] : SPEECH_END);

// tempo (in uscita) dell'n-esima occorrenza di una parola
export const w = (word: string, n = 1) => {
  let c = 0;
  for (const [t, ww] of WORDS as [number, string, number][]) if (ww === word && ++c === n) return t;
  throw new Error('parola non trovata: ' + word);
};

// inquadratura: scala dall'alto + risalita, per liberare spazio sotto il mento
export const DROP = 1.08;
export const LIFT = 150;
export const ZOOM = [1.0, 1.05, 1.0, 1.0, 1.0, 1.0, 1.05, 1.0, 1.04, 1.0, 1.05, 1.0, 1.06];
export const ZO: [number, number] = [540, 640];

const srcT = (t: number) => {
  const k = segOf(Math.min(t, SPEECH_END - 0.001));
  return SEGS[k].in + Math.max(0, Math.min(t, SPEECH_END) - SEG_START[k]);
};
export const zoomAt = (t: number) => {
  const k = segOf(Math.min(t, SPEECH_END - 0.001));
  return ZOOM[k] * (1 + 0.012 * (t - SEG_START[k]));
};
// box del viso in coordinate di uscita (px): [x0, y0, x1, y1], mento incluso
export const faceAt = (t: number): [number, number, number, number] => {
  const B = FACE.box as number[][];
  const i = Math.min(B.length - 1, Math.max(0, Math.round(srcT(t) / FACE.dt)));
  const [a, b, c, d] = B[i];
  const z = zoomAt(t);
  const tx = (x: number) => (ZO[0] + (x * W - ZO[0]) * z - W / 2) * DROP + W / 2;
  const ty = (y: number) => (ZO[1] + (y * H - ZO[1]) * z) * DROP - LIFT;
  const chin = (d - b) * 0.22;
  return [tx(a), ty(b - 0.06), tx(c), ty(d + chin)];
};
// primo y libero sotto il viso in un intervallo
export const safeTop = (a: number, b: number, pad = 28) => {
  let m = 0;
  for (let t = a; t <= b; t += 0.1) m = Math.max(m, faceAt(t)[3]);
  return Math.round(Math.min(1330, Math.max(980, m + pad)));
};
export const SUB_TOP = 1490; // da qui in giù: sottotitoli di Meme e UI di Instagram

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eO3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const eO5 = (x: number) => 1 - Math.pow(1 - x, 5);
export const eI3 = (x: number) => x * x * x;
export const eBack = (x: number, s = 1.4) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
// molla morbida (brand calmo): poco overshoot
export const soft = (x: number) => (x <= 0 ? 0 : x >= 1.6 ? 1 : 1 - Math.exp(-5.5 * x) * Math.cos(5.2 * x));
export const life = (t: number, a: number, b: number, fi = 0.35, fo = 0.25) => Math.min(prog(t, a, a + fi), 1 - prog(t, b - fo, b));
export const rnd = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let q = s;
    q = Math.imul(q ^ (q >>> 15), q | 1);
    q ^= q + Math.imul(q ^ (q >>> 7), q | 61);
    return ((q ^ (q >>> 14)) >>> 0) / 4294967296;
  };
};
