import React, {createContext, useContext} from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {FPS, H, W, clamp, eIO, eO5, prog, rnd, SAF, CORAL, CREAM, INK} from './util';

export const useT = () => useCurrentFrame() / FPS;
const LTX = createContext(0);
export const useLT = () => useContext(LTX);

export const FONT = {
  ab: "'Archivo Black', sans-serif",
  cg: "'Cormorant Garamond', serif",
  mn: "'Manrope', sans-serif",
};

export type Wipe = {x: number; y: number; dur: number; ring: string};

/** Scena a tutto schermo: appare con un iris (cerchio che si apre) sopra la scena precedente. */
export const Scene: React.FC<{from: number; end: number; bg: string; wipe?: Wipe; children: React.ReactNode}> = ({from, end, bg, wipe, children}) => {
  const t = useT();
  if (t < from || t > end) return null;
  const lt = t - from;
  let clip: string | undefined;
  let ringClip: string | undefined;
  if (wipe) {
    const p = eIO(prog(lt, 0, wipe.dur));
    if (p < 1) {
      const R = Math.hypot(Math.max(wipe.x, W - wipe.x), Math.max(wipe.y, H - wipe.y));
      clip = `circle(${p * R}px at ${wipe.x}px ${wipe.y}px)`;
      ringClip = `circle(${p * R + 90 * Math.sin(p * Math.PI)}px at ${wipe.x}px ${wipe.y}px)`;
    }
  }
  return (
    <LTX.Provider value={lt}>
      {ringClip && <div style={{position: 'absolute', inset: 0, background: wipe!.ring, clipPath: ringClip}} />}
      <div style={{position: 'absolute', inset: 0, background: bg, clipPath: clip, overflow: 'hidden'}}>{children}</div>
    </LTX.Provider>
  );
};

type TxtProps = {
  x: number;
  y: number;
  size: number;
  color: string;
  font?: keyof typeof FONT;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  ls?: number;
  weight?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
};
export const Txt: React.FC<TxtProps> = ({x, y, size, color, font = 'ab', italic, align = 'left', ls = 0, weight, children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      fontFamily: FONT[font],
      fontStyle: italic ? 'italic' : 'normal',
      fontWeight: weight,
      fontSize: size,
      color,
      lineHeight: 1,
      letterSpacing: ls,
      whiteSpace: 'pre',
      transform: `translateX(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'})`,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Testo che sale lettera per lettera da una maschera. */
export const Reveal: React.FC<TxtProps & {t0: number; stag?: number; dur?: number; lt?: number}> = ({t0, stag = 0.035, dur = 0.5, lt: ltOverride, children, ...p}) => {
  const ctx = useLT();
  const lt = ltOverride ?? ctx;
  const s = String(children);
  const pad = Math.round(p.size * 0.14);
  return (
    <Txt {...p} y={p.y - pad} style={{overflow: 'hidden', paddingTop: pad, paddingBottom: pad * 0.7, ...p.style}}>
      <span style={{display: 'inline-flex'}}>
        {s.split('').map((c, i) => {
          const e = eO5(prog(lt, t0 + i * stag, t0 + i * stag + dur));
          return (
            <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - e) * 118}%) rotate(${(1 - e) * 7}deg)`, transformOrigin: '0 100%'}}>
              {c === ' ' ? ' ' : c}
            </span>
          );
        })}
      </span>
    </Txt>
  );
};

/** Immagine centrata in (x,y) con dimensioni w×h e trasformazione libera. */
export const Spr: React.FC<{src: string; x: number; y: number; w: number; h: number; rot?: number; sx?: number; sy?: number; op?: number; z?: number; tf?: string; origin?: string}> = ({
  src,
  x,
  y,
  w,
  h,
  rot = 0,
  sx = 1,
  sy = 1,
  op = 1,
  z,
  tf = '',
  origin,
}) => (
  <Img
    src={staticFile(src)}
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      opacity: op,
      zIndex: z,
      transformOrigin: origin,
      transform: `${tf} rotate(${rot}deg) scale(${sx}, ${sy})`,
    }}
  />
);

export const Shadow: React.FC<{x: number; y: number; w: number; op?: number}> = ({x, y, w, op = 0.5}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - w * 0.06,
      width: w,
      height: w * 0.12,
      borderRadius: '50%',
      background: `radial-gradient(ellipse at center, rgba(0,0,0,${op}) 0%, rgba(0,0,0,${op * 0.55}) 40%, rgba(0,0,0,0) 72%)`,
    }}
  />
);

const PEBBLE_COLORS = ['#8E8A86', '#CFC8BC', '#2B2825', SAF, CORAL, CREAM, '#5C5752'];
export const Burst: React.FC<{t: number; x: number; y: number; n?: number; seed?: number; power?: number; life?: number; colors?: string[]}> = ({t, x, y, n = 38, seed = 3, power = 1, life = 1.5, colors = PEBBLE_COLORS}) => {
  if (t < 0 || t > life) return null;
  const r = rnd(seed);
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const ang = -Math.PI * (0.04 + 0.92 * r());
        const sp = (380 + 950 * r()) * power;
        const sz = 12 + 30 * r();
        const spin = (r() - 0.5) * 900;
        const col = colors[Math.floor(r() * colors.length)];
        const px = x + Math.cos(ang) * sp * t;
        const py = y + Math.sin(ang) * sp * t + 0.5 * 2300 * t * t;
        const k = clamp((life - t) / (life * 0.3));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - sz / 2,
              top: py - sz / 2,
              width: sz * 1.25,
              height: sz,
              borderRadius: '52% 48% 55% 45% / 55% 50% 50% 45%',
              background: col,
              opacity: k,
              transform: `rotate(${spin * t}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

export const Ring: React.FC<{t: number; x: number; y: number; maxR: number; dur: number; color: string; w?: number}> = ({t, x, y, maxR, dur, color, w = 22}) => {
  if (t < 0 || t > dur) return null;
  const p = eO5(t / dur);
  const r = maxR * p;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        border: `${Math.max(1, w * (1 - p))}px solid ${color}`,
        opacity: 1 - p * 0.6,
      }}
    />
  );
};

export const Flash: React.FC<{t: number; dur?: number; color?: string}> = ({t, dur = 0.3, color = '#FFF7E0'}) => {
  if (t < 0 || t > dur) return null;
  return <div style={{position: 'absolute', inset: 0, background: color, opacity: Math.pow(1 - t / dur, 2) * 0.85, zIndex: 50}} />;
};

export const decay = (t: number, k = 8) => (t < 0 ? 0 : Math.exp(-k * t));
export const shake = (t: number, amp = 16) => {
  const d = decay(t, 7);
  return {x: Math.sin(t * 95) * amp * d, y: Math.cos(t * 83) * amp * 0.7 * d};
};
export {INK};
