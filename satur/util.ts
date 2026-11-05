import T from './timeline.json';
import WORDS from './words.json';

export const FPS = T.fps;
export const W = 1080;
export const H = 1920;
export const DURATION = T.duration;
export const SENTS = T.sents;
export const sT = (k: number) => SENTS[k].t;
export const sE = (k: number) => SENTS[k].end;

// palette dal logo Farmacia Famiglia Pastore (serpente verde + coppa rosa cipria) + crema caldo
export const GREEN = '#316C39';
export const GREEN_D = '#26562A';
export const GREEN_DD = '#163A1C';
export const SAGE = '#8DB58F';
export const MINT = '#CFE6CD';
export const PINK = '#E6B7AF';
export const PINK_HI = '#F6CFC6';
export const MAUVE = '#C49994';
export const ROSE = '#D9877A';
export const CREAM = '#FBF4EC';
export const CREAM_2 = '#F3E4D6';
export const WHITE = '#FFFFFF';
export const HOT = '#E8703F';
export const GOLD = '#F2B65A';
export const GRAD = `linear-gradient(100deg, ${PINK_HI} 0%, ${PINK} 45%, ${MAUVE} 100%)`;
export const GRAD_G = `linear-gradient(100deg, ${SAGE} 0%, ${GREEN} 55%, ${GREEN_D} 100%)`;
export const MONT = "'Montserrat', 'Helvetica Neue', sans-serif";
export const SERIF = "'Cormorant Garamond', Georgia, serif";

export const WS = WORDS as [number, string, number][];

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eO3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const eO5 = (x: number) => 1 - Math.pow(1 - x, 5);
export const eI3 = (x: number) => x * x * x;
export const eBack = (x: number, s = 1.6) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
// molla con rimbalzo marcato (montaggio catchy)
export const spring = (x: number) => (x <= 0 ? 0 : x >= 1.8 ? 1 : 1 - Math.exp(-4.6 * x) * Math.cos(7.5 * x));
export const life = (t: number, a: number, b: number, fi = 0.3, fo = 0.2) => Math.min(prog(t, a, a + fi), 1 - prog(t, b - fo, b));
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
