import type React from 'react';

export const FPS = 60;
export const W = 1920;
export const H = 1080;

// palette: disco del logo SG + sito Agevolia
export const INK = '#040719';
export const NAVY = '#0A1036';
export const NAVY2 = '#141E5C';
export const BLUE = '#2E3E8C'; // logo, alto
export const BLUE_M = '#2D5FAD'; // logo, centro
export const SKY = '#2A9AD6'; // logo, basso
export const CYAN = '#2CCBEA'; // accento del sito
export const CYAN_HI = '#A5EEFB';
export const CORAL = '#F07563'; // linguetta delle cartelle
export const PAPER = '#F4F2EC';
export const WHITE = '#F5F8FF';
export const MUTED = '#8E98C4';
export const GLASS = 'rgba(120,170,255,0.07)';
export const EDGE = 'rgba(140,200,255,0.22)';

export const RAL = "'Raleway', 'Helvetica Neue', sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, monospace";
export const NUM: React.CSSProperties = {fontVariantNumeric: 'lining-nums tabular-nums'};

// 120 BPM: ogni taglio di scena cade su un battito (vedi score.py)
export const B = 0.5;
export const SCB = [0, 10, 20, 32, 48, 64, 74, 82, 94];
export const SC = SCB.map((n) => n * B);
export const DURATION = SC[SC.length - 1];

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
// proiezione prospettica (stessa convenzione di CSS perspective: camera a +P)
export const proj = (x: number, y: number, z: number, cx: number, cy: number, P = 1400) => {
  const s = P / (P - z);
  return {x: cx + x * s, y: cy + y * s, s};
};
export const it = (n: number) => Math.round(n).toLocaleString('it-IT');
