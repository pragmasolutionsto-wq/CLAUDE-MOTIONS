export const W = 1080;
export const H = 1920;

export const NERO = '#0A0A0A';
export const GRAFITE = '#161514';
export const ORO = '#D7B648';
export const ORO_ACCESO = '#DDB52B';
export const ORO_CHIARO = '#F3DF9A';
export const BIANCO = '#F6F4EE';

export const DISPLAY = "'Archivo Variable', 'Arial Narrow', sans-serif";
export const BODY = "'DM Sans', system-ui, sans-serif";
export const MONO = "'IBM Plex Mono', ui-monospace, monospace";

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eO3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const eO5 = (x: number) => 1 - Math.pow(1 - x, 5);
export const eI3 = (x: number) => x * x * x;
export const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eBack = (x: number, s = 1.9) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
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

/** testo oro estruso in 3D: strati di ombra scalati in profondità */
export const extrude = (depth: number, col = '#6E5512') => {
  const s: string[] = [];
  for (let i = 1; i <= depth; i++) s.push(`0 ${i}px 0 ${col}`);
  s.push(`0 ${depth + 6}px ${depth + 14}px rgba(0,0,0,.65)`);
  return s.join(',');
};

export const goldFill = (sweep: number) => ({
  backgroundImage: `linear-gradient(100deg, #9C7A22 0%, ${ORO} 30%, ${ORO_CHIARO} ${lerp(20, 80, sweep)}%, ${ORO} ${lerp(35, 95, sweep)}%, #8A6A1C 100%)`,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  color: 'transparent',
});
