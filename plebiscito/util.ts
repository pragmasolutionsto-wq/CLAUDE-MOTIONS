import T from './timeline.json';
import WORDS from './words.json';

export const FPS = T.fps;
export const W = 1080;
export const H = 1920;
export const DURATION = T.duration;
export const SENTS = T.sents;
export const sT = (k: number) => SENTS[k].t;
export const sE = (k: number) => SENTS[k].end;

// palette dal logo Plebiscito (gradiente giallo → lime → verde → ciano) + sfondi scientifici
export const YEL = '#F2D500';
export const LIME = '#B5C93A';
export const LIME_HI = '#D4E86A';
export const GREEN = '#5CA05C';
export const CYAN = '#0091BE';
export const CYAN_HI = '#3FD0F0';
export const BLUE = '#0B8FB5';
export const BLUE_D = '#075E7E';
export const NAVY = '#04121F';
export const NAVY_2 = '#0A2A40';
export const SKY = '#18B6E0';
export const WHITE = '#FFFFFF';
export const HOT = '#FF6A3D';
export const GRAD = `linear-gradient(90deg, ${YEL} 0%, ${LIME} 35%, ${GREEN} 62%, ${CYAN} 100%)`;
export const MONT = "'Montserrat', 'Helvetica Neue', sans-serif";

export const WS = WORDS as [number, string, number][];
const norm = (s: string) => s.toLowerCase().replace(/[^\wàèéìòóù'€-]/g, '');
// tempo dell'n-esima occorrenza di una parola
export const w = (word: string, n = 1) => {
  let c = 0;
  for (const [t, ww] of WS) if (norm(ww) === word && ++c === n) return t;
  throw new Error('parola non trovata: ' + word);
};

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
