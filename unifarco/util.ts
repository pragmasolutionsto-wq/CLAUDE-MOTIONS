import T from './timeline.json';
import SE from './sents.json';
import WORDS from './words.json';
import FACE from './face_out.json';

export const FPS = T.fps;
export const W = 1080;
export const H = 1920;
export const SEGS = T.segs as {in: number; out: number; k: number}[];
export const SEG_START: number[] = [];
let acc = 0;
for (const s of SEGS) {
  SEG_START.push(acc);
  acc += s.out - s.in;
}
export const SPEECH_END = acc;
export const DURATION = acc + T.tail;
export const SENTS = SE as {t: number; end: number; txt: string}[];
export const sT = (k: number) => SENTS[k].t;
export const sE = (k: number) => SENTS[k].end;
export const segOf = (t: number) => {
  let k = 0;
  while (k + 1 < SEGS.length && t >= SEG_START[k + 1]) k++;
  return k;
};

// punch-in alternato a ogni stacco del parlato (i tagli delle pause diventano ritmo), centrato sul viso
const ZOOMS = [1.0, 1.1, 1.03, 1.12];
export const zoomAt = (t: number) => {
  const k = segOf(Math.min(t, SPEECH_END - 0.001));
  return ZOOMS[k % ZOOMS.length] * (1 + 0.01 * (t - SEG_START[k]));
};
const rawFace = (t: number) => {
  const B = FACE.box as number[][];
  return B[Math.min(B.length - 1, Math.max(0, Math.round(t / FACE.dt)))];
};
// centro dello zoom: il viso della ripresa (fisso per segmento, così lo zoom non "nuota")
export const zoomOrigin = (t: number): [number, number] => {
  const k = segOf(Math.min(t, SPEECH_END - 0.001));
  const b = rawFace(SEG_START[k] + 0.2);
  return [((b[0] + b[2]) / 2) * W, ((b[1] + b[3]) / 2) * H];
};
// box del viso in pixel di uscita (con lo zoom applicato): [x0, y0, x1, y1], mento incluso
export const faceAt = (t: number): [number, number, number, number] => {
  const [a, b, c, d] = rawFace(t);
  const z = zoomAt(t), [ox, oy] = zoomOrigin(t);
  const tx = (x: number) => ox + (x * W - ox) * z;
  const ty = (y: number) => oy + (y * H - oy) * z;
  return [tx(a), ty(b - 0.04), tx(c), ty(d + (d - b) * 0.22)];
};
// zona libera per le grafiche in [a,b]: sotto il mento se c'è spazio, altrimenti in alto
export const SUB_TOP = 1490;
export const safeZone = (a: number, b: number, need = 260): {y: number; top: boolean} => {
  let lo = 0, hi = H;
  for (let t = a; t <= b; t += 0.1) {
    const f = faceAt(t);
    lo = Math.max(lo, f[3]);
    hi = Math.min(hi, f[1]);
  }
  if (SUB_TOP - lo - 30 >= need) return {y: Math.round(lo + 30), top: false};
  return {y: 170, top: true};
};

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
