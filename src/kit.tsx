import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {C, SANS, SERIF} from './theme';

export const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const prog = (f: number, start: number, len: number, e: (t: number) => number = ease) =>
  interpolate(f, [start, start + len], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

/** spring con overshoot (per entrate "slam") */
export const sp = (f: number, delay: number, damping = 13, stiffness = 150, mass = 0.7) =>
  spring({frame: Math.max(0, f - delay), fps: 30, config: {damping, stiffness, mass}});

/* ---------- Riga di testo con maschera: entra con spring ---------- */
type LineProps = {
  text: string;
  delay?: number;
  size: number;
  color: string;
  font?: string;
  weight?: number;
  italic?: boolean;
  spacing?: string;
  from?: 'up' | 'down' | 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
  stroke?: string;
};

export const Line: React.FC<LineProps> = ({
  text,
  delay = 0,
  size,
  color,
  font = SANS,
  weight = 800,
  italic = false,
  spacing = '-0.035em',
  from = 'up',
  align = 'left',
  style,
  stroke,
}) => {
  const f = useCurrentFrame();
  const t = 1 - sp(f, delay);
  const tr =
    from === 'up'
      ? `translateY(${t * 118}%)`
      : from === 'down'
        ? `translateY(${-t * 118}%)`
        : from === 'left'
          ? `translateX(${-t * 108}%)`
          : `translateX(${t * 108}%)`;
  return (
    <div style={{overflow: 'hidden', padding: `${size * 0.07}px ${size * 0.05}px ${size * 0.15}px`, textAlign: align, ...style}}>
      <div
        style={{
          display: 'inline-block',
          transform: tr,
          fontFamily: font,
          fontWeight: weight,
          fontStyle: italic ? 'italic' : 'normal',
          fontSize: size,
          lineHeight: 1,
          color: stroke ? 'transparent' : color,
          WebkitTextStroke: stroke ? `3px ${stroke}` : undefined,
          letterSpacing: spacing,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ---------- Lettere singole con stagger ---------- */
export const Letters: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size: number;
  color: string;
  font?: string;
  weight?: number;
  gap?: number;
  italic?: boolean;
  from?: 'up' | 'down';
}> = ({text, delay = 0, stagger = 2, size, color, font = SANS, weight = 800, gap = 0, italic, from = 'up'}) => (
  <div style={{display: 'flex', gap}}>
    {text.split('').map((ch, i) => (
      <Line
        key={i}
        text={ch === ' ' ? ' ' : ch}
        delay={delay + i * stagger}
        size={size}
        color={color}
        font={font}
        weight={weight}
        spacing="0"
        italic={italic}
        from={from}
      />
    ))}
  </div>
);

/* ---------- Testo che scorre in orizzontale ---------- */
export const Marquee: React.FC<{
  text: string;
  y: number;
  size: number;
  color: string;
  speed?: number;
  dir?: 1 | -1;
  outline?: boolean;
  opacity?: number;
}> = ({text, y, size, color, speed = 5, dir = 1, outline = true, opacity = 1}) => {
  const f = useCurrentFrame();
  const w = text.length * size * 0.74 + size;
  const off = (f * speed) % w;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, height: size * 1.2, overflow: 'hidden', opacity}}>
      <div style={{display: 'flex', transform: `translateX(${dir === 1 ? -off : off - w}px)`}}>
        {new Array(5).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: w,
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              color: outline ? 'transparent' : color,
              WebkitTextStroke: outline ? `2px ${color}` : undefined,
            }}
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- Fondo scena ---------- */
export const Stage: React.FC<{bg: string; fg: string; corner?: boolean; children?: React.ReactNode}> = ({bg, fg, corner = true, children}) => (
  <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${fg} 1.6px, transparent 1.8px)`,
        backgroundSize: '64px 64px',
        opacity: 0.1,
      }}
    />
    {children}
    {corner ? <Corner color={fg} /> : null}
  </AbsoluteFill>
);

export const Corner: React.FC<{color: string}> = ({color}) => (
  <>
    <div style={{position: 'absolute', top: 48, left: 80, fontFamily: SERIF, fontWeight: 600, fontSize: 30, letterSpacing: '0.34em', color}}>LONGEVITAS</div>
    <div style={{position: 'absolute', top: 56, right: 80, fontFamily: SANS, fontWeight: 600, fontSize: 18, letterSpacing: '0.3em', color, opacity: 0.7}}>
      LONGEVITAS.IT
    </div>
  </>
);

export const Tag: React.FC<{text: string; color: string; delay?: number}> = ({text, color, delay = 0}) => {
  const f = useCurrentFrame();
  const w = prog(f, delay, 24) * 90;
  const o = prog(f, delay + 6, 14);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 20, fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: '0.34em', color}}>
      <div style={{width: w, height: 3, background: color}} />
      <span style={{opacity: o}}>{text}</span>
    </div>
  );
};
