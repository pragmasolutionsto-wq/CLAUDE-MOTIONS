import T from './timeline.json';
import WORDS from './words.json';

export const FPS = T.fps;
export const W = 1080;
export const H = 1920;

// palette dal logo di Farmacia Michelangelo
export const TEAL = '#2D9B76'; // caduceo, "FARMACIA"
export const TEAL_D = '#1B7A5E'; // box titoli
export const FOREST = '#14382E'; // testi scuri
export const LIME = '#9BC84B'; // "MICHELANGELO", ali basse
export const LIME_HI = '#C9E39A';
export const SAGE = '#A8D5A3'; // testa del caduceo
export const CREAM = '#F4F1EC';
export const WHITE = '#FFFFFF';
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
export const segT = (k: number) => SEG_START[k];
export const segEnd = (k: number) => (k + 1 < SEGS.length ? SEG_START[k + 1] : SPEECH_END);

// tempo (in uscita) dell'n-esima occorrenza di una parola
export const w = (word: string, n = 1) => {
  let c = 0;
  for (const [t, ww] of WORDS as [number, string, number][]) if (ww === word && ++c === n) return t;
  throw new Error('parola non trovata: ' + word + ' #' + n);
};

// inquadratura: scala dall'alto + risalita, per liberare spazio sotto il mento
export const DROP = 1.08;
export const LIFT = 150;
// viso (coordinate base, zoom 1) e punto libero sotto il mento dopo DROP/LIFT
export const FACE: [number, number, number, number] = [330, 470, 750, 1110];
export const FACE_OUT: [number, number, number, number] = [
  (FACE[0] - 540) * DROP + 540,
  FACE[1] * DROP - LIFT,
  (FACE[2] - 540) * DROP + 540,
  FACE[3] * DROP - LIFT,
];
export const UNDER = Math.round(FACE_OUT[3] + 36); // ~1085: primo y libero sotto il mento
export const SUB_TOP = 1490; // da qui in giù: sottotitoli di Meme e UI di Instagram

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eO3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const eO5 = (x: number) => 1 - Math.pow(1 - x, 5);
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
