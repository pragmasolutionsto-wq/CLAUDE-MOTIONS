import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {
  clamp, eBack, eO4, eO5, H, ICE, INK, lerp, NAVY, NAVY2, prog, rnd, TEAL, TEAL_D, TEAL_HI, W, WHITE,
} from './util';

export const ANTON = "'Anton', 'Impact', sans-serif";
export const MAN = "'Manrope', 'Helvetica Neue', sans-serif";
export const LW = 726;
export const LH = 707;
export const LOGO = () => staticFile('logo.png');
export const maskLogo: React.CSSProperties = {
  WebkitMaskImage: `url(${staticFile('logo.png')})`,
  WebkitMaskSize: '100% 100%',
  maskImage: `url(${staticFile('logo.png')})`,
  maskSize: '100% 100%',
};

/* ------------------------------------------------------------------ palette per scena */

export type Pal = {
  bg: string; fg: string; ac: string; onAc: string; panel: string; edge: string; card: string; bar: string; dark: boolean;
};

export const P_INK: Pal = {
  bg: `radial-gradient(ellipse at 50% 30%, #0E2C52 0%, ${INK} 72%)`,
  fg: WHITE, ac: TEAL, onAc: INK, panel: 'rgba(92,202,212,0.14)', edge: 'rgba(166,243,247,0.6)',
  card: 'rgba(255,255,255,0.09)', bar: 'rgba(255,255,255,0.24)', dark: true,
};
export const P_NAVY: Pal = {
  bg: `linear-gradient(170deg, #12306A 0%, ${NAVY} 45%, ${INK} 100%)`,
  fg: WHITE, ac: TEAL_HI, onAc: INK, panel: 'rgba(166,243,247,0.12)', edge: 'rgba(166,243,247,0.6)',
  card: 'rgba(255,255,255,0.1)', bar: 'rgba(255,255,255,0.24)', dark: true,
};
export const P_TEAL: Pal = {
  bg: `linear-gradient(165deg, ${TEAL_HI} 0%, ${TEAL} 50%, #2FA3B2 100%)`,
  fg: INK, ac: NAVY, onAc: WHITE, panel: 'rgba(5,11,28,0.1)', edge: 'rgba(5,11,28,0.5)',
  card: 'rgba(255,255,255,0.72)', bar: 'rgba(5,11,28,0.2)', dark: false,
};
export const P_ICE: Pal = {
  bg: `linear-gradient(165deg, ${ICE} 0%, #CDEBEF 100%)`,
  fg: NAVY, ac: TEAL_D, onAc: WHITE, panel: 'rgba(13,27,70,0.07)', edge: 'rgba(13,27,70,0.35)',
  card: '#FFFFFF', bar: 'rgba(13,27,70,0.16)', dark: false,
};

export type MP = {lt: number; pal: Pal};

/* ------------------------------------------------------------------ pezzi comuni */

export const Dust: React.FC<{t: number; n?: number; seed?: number; color?: string; speed?: number}> = ({
  t, n = 40, seed = 3, color = TEAL, speed = 1,
}) => {
  const r = rnd(seed);
  const items = [];
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, vx = (r() - 0.5) * 30, vy = -(10 + r() * 50), s = 2 + r() * 5, ph = r() * 6.28, d = r();
    const x = (((x0 + vx * t * speed) % W) + W) % W;
    const y = (((y0 + vy * t * speed) % H) + H) % H;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (1 + d * 2) + ph));
    items.push(
      <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: color, opacity: tw * (0.25 + d * 0.5), boxShadow: `0 0 ${s * 3}px ${color}`}} />
    );
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

export const Bokeh: React.FC<{t: number; n?: number; seed?: number; color?: string}> = ({t, n = 10, seed = 11, color = TEAL}) => {
  const r = rnd(seed);
  const items = [];
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * H, s = 80 + r() * 260, vx = (r() - 0.5) * 40, vy = (r() - 0.5) * 30, o = 0.05 + r() * 0.12;
    items.push(
      <div key={i} style={{position: 'absolute', left: x + vx * t - s / 2, top: y + vy * t - s / 2, width: s, height: s, borderRadius: s, background: color, opacity: o, filter: 'blur(14px)'}} />
    );
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

export const Glow: React.FC<{x?: number; y?: number; r?: number; c?: string; o?: number}> = ({x = 540, y = 960, r = 800, c = TEAL, o = 0.5}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: `radial-gradient(circle, ${c} 0%, transparent 68%)`, opacity: o}} />
);

export const Streaks: React.FC<{lt: number; seed: number; color: string}> = ({lt, seed, color}) => {
  const r = rnd(seed);
  const items = [];
  for (let i = 0; i < 10; i++) {
    const y = r() * H, len = 300 + r() * 700, d = r() * 0.12, th = 2 + r() * 4;
    const p = prog(lt, d, d + 0.34);
    if (p <= 0 || p >= 1) continue;
    const x = lerp(-len, W + len, eO4(p)) * (i % 2 ? 1 : -1) + (i % 2 ? 0 : W);
    items.push(<div key={i} style={{position: 'absolute', left: x - len / 2, top: y, width: len, height: th, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.8 * (1 - p)}} />);
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

export const DotGrid: React.FC<{lt: number; color: string; o?: number}> = ({lt, color, o = 0.35}) => (
  <div style={{position: 'absolute', inset: -40, backgroundImage: `radial-gradient(circle, ${color} 2px, transparent 2.5px)`, backgroundSize: '72px 72px', backgroundPosition: `${-lt * 18}px ${lt * 14}px`, opacity: o}} />
);

export const Caption: React.FC<{text: string; lt: number; delay?: number; color?: string; size?: number; style?: React.CSSProperties}> = ({
  text, lt, delay = 0.12, color = WHITE, size = 30, style,
}) => {
  const p = eO4(prog(lt, delay, delay + 0.25));
  return (
    <div style={{fontFamily: MAN, fontWeight: 700, fontSize: size, letterSpacing: '0.28em', textTransform: 'uppercase', color, opacity: p, transform: `translateY(${(1 - p) * 24}px)`, textAlign: 'center', ...style}}>
      {text}
    </div>
  );
};

/** riga di titolo con 5 modalità di entrata */
export const TitleLine: React.FC<{text: string; lt: number; delay: number; mode: number; fs: number; color: string}> = ({
  text, lt, delay, mode, fs, color,
}) => {
  const l = lt - delay;
  const base: React.CSSProperties = {fontFamily: ANTON, fontSize: fs, color, lineHeight: 1.06, textTransform: 'uppercase', whiteSpace: 'pre'};
  const chars = text.split('');
  const nb = (ch: string) => (ch === ' ' ? ' ' : ch);
  switch (((mode % 5) + 5) % 5) {
    case 0:
      return (
        <div style={{...base, display: 'flex'}}>
          {chars.map((ch, i) => {
            const p = prog(l, i * 0.025, i * 0.025 + 0.4);
            return (
              <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em'}}>
                <span style={{display: 'inline-block', transform: `translateY(${(1 - eO5(p)) * 118}%)`}}>{nb(ch)}</span>
              </span>
            );
          })}
        </div>
      );
    case 1:
      return (
        <div style={{...base, display: 'flex', perspective: 1400}}>
          {chars.map((ch, i) => {
            const p = prog(l, i * 0.03, i * 0.03 + 0.38);
            return (
              <span key={i} style={{display: 'inline-block', transform: `rotateX(${(1 - eO4(p)) * -95}deg) translateY(${(1 - eO4(p)) * 36}px)`, opacity: p > 0 ? 1 : 0, transformOrigin: '50% 100%'}}>{nb(ch)}</span>
            );
          })}
        </div>
      );
    case 2: {
      const p = eO4(prog(l, 0, 0.5));
      return (
        <div style={{...base, letterSpacing: `${lerp(0.3, 0, p)}em`, filter: `blur(${(1 - p) * 22}px)`, opacity: clamp(p * 3)}}>{text}</div>
      );
    }
    case 3: {
      const p = eO5(prog(l, 0, 0.5));
      return (
        <div style={{overflow: 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em'}}>
          <div style={{...base, transform: `translateX(${(1 - p) * -1100}px) skewX(${(1 - p) * -22}deg)`}}>{text}</div>
        </div>
      );
    }
    default:
      return (
        <div style={{...base, display: 'flex'}}>
          {chars.map((ch, i) => {
            const p = eBack(prog(l, i * 0.025, i * 0.025 + 0.34), 2.4);
            return (
              <span key={i} style={{display: 'inline-block', transform: `scale(${lerp(0, 1, p)}) rotate(${(1 - p) * -18}deg)`, opacity: prog(l, i * 0.025, i * 0.025 + 0.03)}}>{nb(ch)}</span>
            );
          })}
        </div>
      );
  }
};

export const Check: React.FC<{size: number; p: number; color: string; sw?: number}> = ({size, p, color, sw = 4}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </svg>
);

export const popIn = (lt: number, a: number, d = 0.45, s = 1.9) => eBack(prog(lt, a, a + d), s);
export {eBack, NAVY2};
