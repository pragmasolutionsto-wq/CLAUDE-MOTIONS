import EDL from './public/edl.json';
import TIMING from './public/timing.json';

export const FPS = 60;
export const W = 1080;
export const H = 1920;
export const T_LOGO = TIMING.T_LOGO;
export const END = TIMING.END;
export const BEAT = TIMING.BEAT;

// palette dal logo e dalla copertina
export const MAG = '#B42583';
export const MAG_D = '#8E1A67';
export const TEAL = '#60AEB4';
export const TEAL_D = '#2F8A91';
export const NAVY = '#0F2B48';
export const PLUM = '#1B0A17';
export const WHITE = '#FFFFFF';

export const SERIF = "'Playfair Display', serif";
export const SANS = "'Montserrat', sans-serif";

export type Seg = {clip: number; s: number; e: number; out: number};
export type Word = {w: string; t: number; te: number; cue: number};
export const SEGS = EDL.segs as Seg[];
export const WORDS = EDL.words as Word[];

const norm = (s: string) => s.toLowerCase().replace(/[^a-zàèéìòù0-9’']/g, '');
/** tempo della parola (n-esima occorrenza dopo `after`) */
export const at = (w: string, after = 0, n = 0) => {
  const hits = WORDS.filter((x) => norm(x.w) === norm(w) && x.t >= after);
  if (!hits[n]) throw new Error(`parola non trovata: ${w} dopo ${after}`);
  return hits[n].t;
};

// centro faccia (rilevato con OpenCV, coordinate 1080x1920) per punch-in centrati sul viso
export const FACE: Record<number, [number, number]> = {1: [507, 741], 2: [526, 738]};
// qui l'inquadratura è alta: viso tra y≈180 (capelli) e y≈960 (mento). Sottotitoli subito sotto il mento,
// grafiche in un pannello più in basso, sulla giacca e sulle mani
export const CAP_Y = 1078;
export const PANEL_Y = 1262;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eO3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const eO5 = (x: number) => 1 - Math.pow(1 - x, 5);
export const eI3 = (x: number) => x * x * x;
export const eBack = (x: number, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
export const eExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
/** entra in [a, a+d], esce in [b, b+d2]: 0→1→0 */
export const inout = (t: number, a: number, b: number, d = 0.45, d2 = 0.35) => eO3(prog(t, a, a + d)) * (1 - eIO(prog(t, b, b + d2)));
