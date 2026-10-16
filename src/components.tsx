import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C, SANS, SERIF} from './theme';

export const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const useSpring = (delay = 0, damping = 200, durationInFrames?: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}, durationInFrames});
};

export const fadeIn = (frame: number, start: number, len = 20) =>
  interpolate(frame, [start, start + len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

/* ---------- Sfondo persistente: gradienti vivi, griglia, particelle ---------- */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const blob = (x: number, y: number, r: number, color: string) => (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }}
    />
  );
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      {blob(960 + Math.sin(t * 0.21) * 520, 420 + Math.cos(t * 0.17) * 220, 760, 'rgba(16,72,60,0.85)')}
      {blob(380 + Math.cos(t * 0.13) * 300, 900 + Math.sin(t * 0.19) * 120, 620, 'rgba(95,227,192,0.13)')}
      {blob(1560 + Math.sin(t * 0.11) * 260, 180 + Math.cos(t * 0.23) * 160, 560, 'rgba(216,184,120,0.12)')}
      <Grid />
      <Particles />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  const off = (frame * 0.25) % 120;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${C.faint} 1px, transparent 1px), linear-gradient(90deg, ${C.faint} 1px, transparent 1px)`,
        backgroundSize: '120px 120px',
        backgroundPosition: `${off}px ${off}px`,
        opacity: 0.18,
        maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
      }}
    />
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(70).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 1920;
        const speed = 0.2 + random(`s${i}`) * 0.6;
        const y = (random(`y${i}`) * 1180 - frame * speed) % 1180;
        const yy = y < -50 ? y + 1180 : y;
        const size = 1.5 + random(`r${i}`) * 3.5;
        const gold = random(`c${i}`) > 0.7;
        const tw = 0.25 + 0.75 * Math.abs(Math.sin(frame / 40 + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.sin(frame / 60 + i) * 20,
              top: yy,
              width: size,
              height: size,
              borderRadius: '50%',
              background: gold ? C.gold : C.mint,
              opacity: 0.35 * tw,
              boxShadow: `0 0 ${size * 4}px ${gold ? C.gold : C.mint}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Wrapper scena: fade/scale in-out ---------- */
export const Scene: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const frame = useCurrentFrame();
  const inn = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp', easing: ease});
  const out = interpolate(frame, [dur - 18, dur], [1, 0], {extrapolateLeft: 'clamp'});
  const scale = interpolate(frame, [0, dur], [1.03, 1], {easing: Easing.out(Easing.quad)});
  const blur = interpolate(frame, [dur - 18, dur], [0, 12], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: Math.min(inn, out), transform: `scale(${scale})`, filter: `blur(${blur}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

/* ---------- Testo che sale parola per parola ---------- */
export const Words: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  accent?: string[];
  accentColor?: string;
}> = ({text, delay = 0, stagger = 3, style, accent = [], accentColor = C.mint}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', ...style}}>
      {words.map((w, i) => {
        const p = interpolate(frame - delay - i * stagger, [0, 22], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: ease,
        });
        const clean = w.replace(/[.,!?]/g, '');
        const isAccent = accent.includes(clean);
        return (
          <span key={i} style={{overflow: 'hidden', display: 'inline-block', paddingBottom: '0.08em', marginRight: '0.26em'}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 4}deg)`,
                opacity: p,
                color: isAccent ? accentColor : undefined,
                fontStyle: isAccent && style?.fontFamily === SERIF ? 'italic' : undefined,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Etichetta di sezione ---------- */
export const Kicker: React.FC<{n: string; label: string; delay?: number}> = ({n, label, delay = 0}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 30], [0, 80], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const o = fadeIn(frame, delay + 6);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 22, fontFamily: SANS, fontSize: 22, letterSpacing: 6, textTransform: 'uppercase', color: C.mint}}>
      <span style={{opacity: o, color: C.gold, fontWeight: 600}}>{n}</span>
      <span style={{width: w, height: 1.5, background: `linear-gradient(90deg, ${C.gold}, ${C.mint})`}} />
      <span style={{opacity: o, fontWeight: 500}}>{label}</span>
    </div>
  );
};

/* ---------- Card in vetro ---------- */
export const Glass: React.FC<{style?: React.CSSProperties; children: React.ReactNode; delay?: number; from?: 'up' | 'left' | 'right'}> = ({
  style,
  children,
  delay = 0,
  from = 'up',
}) => {
  const p = useSpring(delay, 22);
  const d = (1 - p) * 60;
  const tr = from === 'up' ? `translateY(${d}px)` : from === 'left' ? `translateX(${-d}px)` : `translateX(${d}px)`;
  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.02))',
        border: `1px solid rgba(244,239,228,0.14)`,
        borderRadius: 28,
        backdropFilter: 'blur(14px)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        opacity: Math.min(1, p * 1.4),
        transform: `${tr} scale(${0.96 + p * 0.04})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Chip: React.FC<{children: React.ReactNode; delay?: number; color?: string}> = ({children, delay = 0, color = C.mint}) => {
  const p = useSpring(delay, 18);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 26px',
        borderRadius: 100,
        border: `1px solid ${color}55`,
        background: `${color}14`,
        color: C.ivory,
        fontFamily: SANS,
        fontSize: 24,
        fontWeight: 500,
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px) scale(${0.9 + p * 0.1})`,
      }}
    >
      <span style={{width: 8, height: 8, borderRadius: 8, background: color, boxShadow: `0 0 12px ${color}`}} />
      {children}
    </div>
  );
};

export const Counter: React.FC<{to: number; delay?: number; dur?: number; style?: React.CSSProperties; suffix?: string}> = ({
  to,
  delay = 0,
  dur = 45,
  style,
  suffix = '',
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame - delay, [0, dur], [0, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return <span style={style}>{Math.round(v)}{suffix}</span>;
};

export const Logo: React.FC<{size?: number; delay?: number}> = ({size = 150, delay = 0}) => {
  const frame = useCurrentFrame();
  const letters = 'LONGEVITAS'.split('');
  const track = interpolate(frame - delay, [0, 60], [0.6, 0.16], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return (
    <div style={{display: 'flex', fontFamily: SERIF, fontWeight: 500, fontSize: size, color: C.ivory, letterSpacing: `${track}em`, marginRight: `-${track}em`}}>
      {letters.map((l, i) => {
        const p = fadeIn(frame, delay + i * 3, 24);
        const isV = i === 5;
        return (
          <span
            key={i}
            style={{
              opacity: p,
              transform: `translateY(${(1 - p) * 30}px)`,
              filter: `blur(${(1 - p) * 10}px)`,
              color: isV ? C.gold : C.ivory,
              textShadow: isV ? `0 0 40px ${C.goldSoft}` : undefined,
            }}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
};

export const Hairline: React.FC<{delay?: number; width?: number}> = ({delay = 0, width = 600}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 40], [0, width], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return <div style={{width: w, height: 1, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`}} />;
};

export const Body: React.FC<{children: React.ReactNode; delay?: number; style?: React.CSSProperties}> = ({children, delay = 0, style}) => {
  const frame = useCurrentFrame();
  const p = fadeIn(frame, delay, 26);
  return (
    <div style={{fontFamily: SANS, fontSize: 30, lineHeight: 1.5, color: C.mute, fontWeight: 400, opacity: p, transform: `translateY(${(1 - p) * 20}px)`, ...style}}>
      {children}
    </div>
  );
};
