import React from 'react';
import {useCurrentFrame} from 'remotion';
import timeline from './timeline.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION_S = timeline.duration;

// Palette: colori del logo Farmacia Monaco + accenti richiesti (corallo per il cuore, ciano per l'ECG)
export const C = {
  teal: '#3DAAA7',
  tealDeep: '#2A8C89',
  sage: '#5CA7A0',
  blue: '#1383B5',
  blueDeep: '#0F4C6E',
  coral: '#E8504A',
  cyan: '#4FD1D9',
  cyanCore: '#1FA5B0',
  ivory: '#F5EBE0',
  aqua: '#E2EFEC',
  ocra: '#E2B97A',
};

export type Scene = {id: string; start: number; end: number; voiceStart: number; voiceEnd: number; sentences: number[][]};
export const SCENES = timeline.scenes as Scene[];

export const useT = () => useCurrentFrame() / FPS;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const out = (x: number) => 1 - Math.pow(1 - x, 3);
export const outBack = (x: number) => {
  const c = 1.2;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
/** progresso 0..1 su [a,b] con easing (ease-in-out di default) */
export const ip = (t: number, a: number, b: number, e = inOut) => e(clamp((t - a) / (b - a)));
/** 0→1→0 morbido, periodo p */
export const wave = (t: number, p: number) => (1 - Math.cos((2 * Math.PI * t) / p)) / 2;

// generatore deterministico
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Tempo che rallenta fino a fermarsi: velocità continua, zero negli ultimi 2,5 s (hold finale fermo). */
export const settle = (t: number) => {
  const L = 4;
  const t0 = DURATION_S - 2.5 - L;
  if (t < t0) return t;
  const u = clamp((t - t0) / L);
  return t0 + (L / 2) * (1 - (1 - u) * (1 - u));
};

export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

export const Blur: React.FC<{id: string; s: number}> = ({id, s}) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation={s} />
  </filter>
);
