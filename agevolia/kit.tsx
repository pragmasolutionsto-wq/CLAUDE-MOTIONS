import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {
  BLUE, BLUE_M, CYAN, CYAN_HI, CORAL, EDGE, eO3, eO4, eO5, GLASS, H, INK, lerp, MONO, MUTED, NAVY, NAVY2, PAPER, prog,
  RAL, rnd, SKY, W, WHITE,
} from './util';

export const SG = () => staticFile('sg.png');
export const DISC_BG = `linear-gradient(180deg, ${BLUE} 0%, ${BLUE_M} 52%, ${SKY} 88%, #38C6F0 100%)`;

/* ------------------------------------------------------------------ sfondo comune */

export const Dust: React.FC<{t: number; n?: number; seed?: number; color?: string; speed?: number}> = ({
  t, n = 50, seed = 3, color = CYAN, speed = 1,
}) => {
  const r = rnd(seed);
  const items = [];
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, vx = (r() - 0.5) * 30, vy = -(8 + r() * 40), s = 2 + r() * 4, ph = r() * 6.28, d = r();
    const x = (((x0 + vx * t * speed) % W) + W) % W;
    const y = (((y0 + vy * t * speed) % H) + H) % H;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (1 + d * 2) + ph));
    items.push(
      <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: color, opacity: tw * (0.2 + d * 0.45), boxShadow: `0 0 ${s * 3}px ${color}`}} />
    );
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

export const Glow: React.FC<{x?: number; y?: number; r?: number; c?: string; o?: number}> = ({x = 960, y = 540, r = 800, c = CYAN, o = 0.5}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: `radial-gradient(circle, ${c} 0%, transparent 68%)`, opacity: o}} />
);

// pavimento a griglia in prospettiva che scorre: dà profondità a tutto il film
export const Floor: React.FC<{t: number; o?: number; speed?: number}> = ({t, o = 1, speed = 70}) => (
  <AbsoluteFill style={{perspective: 900, perspectiveOrigin: '50% 38%', opacity: o, overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute', left: -1600, top: 600, width: 5120, height: 2600,
        transform: 'rotateX(80deg)', transformOrigin: '50% 0%',
        backgroundImage: `linear-gradient(rgba(44,203,234,0.22) 2px, transparent 2px), linear-gradient(90deg, rgba(44,203,234,0.22) 2px, transparent 2px)`,
        backgroundSize: '140px 140px', backgroundPosition: `0px ${t * speed}px`,
        WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 18%, black 60%, transparent 100%)',
      }}
    />
  </AbsoluteFill>
);

export const Backdrop: React.FC<{t: number; floor?: number}> = ({t, floor = 1}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, ${NAVY2} 0%, ${NAVY} 42%, ${INK} 100%)`}}>
    <Glow x={960 + Math.sin(t * 0.3) * 260} y={380} r={900} c={BLUE_M} o={0.32} />
    <Glow x={300 + Math.cos(t * 0.25) * 120} y={900} r={700} c={SKY} o={0.14} />
    <Glow x={1650} y={150 + Math.sin(t * 0.4) * 80} r={600} c={CYAN} o={0.1} />
    <Floor t={t} o={0.55 * floor} />
    <Dust t={t} n={55} seed={9} />
  </AbsoluteFill>
);

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(2,4,16,0.75) 100%)', pointerEvents: 'none'}} />
);

/* ------------------------------------------------------------------ logo SG estruso in 3D */

export const Disc3D: React.FC<{
  size: number; rx?: number; ry?: number; rz?: number; reveal?: number; shine?: number; glow?: number;
}> = ({size, rx = 0, ry = 0, rz = 0, reveal = 1, shine = -40, glow = 0.6}) => {
  const depth = size * 0.11, N = 18;
  const layers = [];
  for (let i = 1; i < N; i++) {
    const k = i / N;
    layers.push(
      <div key={i} style={{position: 'absolute', inset: 0, borderRadius: '50%', transform: `translateZ(${-k * depth}px)`, background: `linear-gradient(180deg, ${k > 0.5 ? '#1A2766' : '#22317A'} 0%, #1D4D8E 55%, #1B78AE 100%)`, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)'}} />
    );
  }
  const lx = 50 - Math.sin((ry * Math.PI) / 180) * 40;
  const mask = `linear-gradient(105deg, black ${reveal * 130 - 25}%, transparent ${reveal * 130 - 5}%)`;
  return (
    <div style={{width: size, height: size, perspective: size * 6}}>
      <div style={{position: 'relative', width: size, height: size, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`}}>
        {layers}
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', transform: `translateZ(${-depth}px) rotateY(180deg)`, background: DISC_BG}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: DISC_BG, overflow: 'hidden', boxShadow: `0 0 ${size * 0.35}px rgba(44,203,234,${0.45 * glow}), inset 0 0 0 ${size * 0.008}px rgba(255,255,255,0.22)`}}>
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at ${lx}% 22%, rgba(255,255,255,0.38), transparent 55%)`}} />
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${shine - 12}%, rgba(255,255,255,0.32) ${shine}%, transparent ${shine + 12}%)`}} />
        </div>
        <div style={{position: 'absolute', inset: 0, transform: `translateZ(${size * 0.012}px)`, WebkitMaskImage: mask}}>
          <Img src={SG()} style={{width: size, height: size, display: 'block', filter: `drop-shadow(0 ${size * 0.01}px ${size * 0.02}px rgba(5,10,40,0.45))`}} />
          <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${SG()})`, WebkitMaskSize: '100% 100%', background: `linear-gradient(105deg, transparent ${shine - 8}%, ${CYAN_HI} ${shine}%, transparent ${shine + 8}%)`}} />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ foglio di bando 3D */

const DOC_TITLES = [
  'Voucher digitalizzazione', 'Bando PNRR', 'Fondo perduto', "Credito d'imposta", 'Allegato B', 'FAQ ufficiali',
  'Rettifica avviso', 'Transizione 5.0', 'Nuova impresa', 'Internazionalizzazione', 'Efficienza energetica',
  'Decreto attuativo', 'Horizon Europe', 'Bando ISI INAIL', 'Contratti di sviluppo', 'Smart & Start',
];

export const Doc: React.FC<{w?: number; seed?: number; title?: string; tab?: string; hl?: number}> = ({
  w = 220, seed = 1, title, tab = CORAL, hl = 0,
}) => {
  const r = rnd(seed * 7 + 3);
  const h = w * 1.32;
  const lines = [];
  for (let i = 0; i < 9; i++) {
    lines.push(<div key={i} style={{height: w * 0.022, width: `${55 + r() * 40}%`, background: i === 3 && hl ? `rgba(44,203,234,${0.6 * hl})` : '#CFCBC2', borderRadius: 3, marginTop: w * 0.035}} />);
  }
  return (
    <div style={{position: 'relative', width: w, height: h, background: PAPER, borderRadius: w * 0.03, padding: w * 0.08, boxSizing: 'border-box', boxShadow: '0 20px 50px rgba(0,0,20,0.45)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', right: -w * 0.02, top: w * 0.12, width: w * 0.08, height: w * 0.22, background: tab, borderRadius: w * 0.02}} />
      <div style={{width: w * 0.16, height: w * 0.16, borderRadius: '50%', background: DISC_BG, opacity: 0.85}} />
      <div style={{fontFamily: RAL, fontWeight: 700, fontSize: w * 0.075, color: '#1D2550', marginTop: w * 0.06, lineHeight: 1.15}}>{title ?? DOC_TITLES[seed % DOC_TITLES.length]}</div>
      {lines}
    </div>
  );
};

/* ------------------------------------------------------------------ tipografia */

export const Eyebrow: React.FC<{text: string; lt: number; delay?: number; color?: string; style?: React.CSSProperties}> = ({
  text, lt, delay = 0, color = CYAN, style,
}) => {
  const p = eO4(prog(lt, delay, delay + 0.4));
  const chars = Math.round(text.length * prog(lt, delay, delay + 0.5));
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: p, ...style}}>
      <div style={{width: 12 * p, height: 12, background: color, boxShadow: `0 0 14px ${color}`}} />
      <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 20, letterSpacing: '0.24em', color, whiteSpace: 'pre'}}>{text.slice(0, chars)}</div>
    </div>
  );
};

const Words: React.FC<{text: string; lt: number; delay: number; color: string; stag?: number}> = ({text, lt, delay, color, stag = 0.06}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: '0 0.26em', color}}>
    {text.split(' ').map((w, i) => {
      const p = prog(lt, delay + i * stag, delay + i * stag + 0.55);
      return (
        <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em', lineHeight: 1.08}}>
          <span style={{display: 'inline-block', transform: `translateY(${(1 - eO5(p)) * 110}%) rotate(${(1 - eO5(p)) * 6}deg)`, transformOrigin: '0 100%'}}>{w}</span>
        </span>
      );
    })}
  </div>
);

export const Title: React.FC<{
  l1: string; l2?: string; lt: number; delay?: number; size?: number; eyebrow?: string; align?: 'left' | 'center'; style?: React.CSSProperties;
}> = ({l1, l2, lt, delay = 0, size = 78, eyebrow, align = 'left', style}) => (
  <div style={{position: 'absolute', fontFamily: RAL, fontWeight: 400, fontSize: size, letterSpacing: '-0.01em', textShadow: '0 4px 30px rgba(4,7,25,0.7)', ...style}}>
    {eyebrow && <Eyebrow text={eyebrow} lt={lt} delay={delay} style={{marginBottom: size * 0.32, justifyContent: align === 'center' ? 'center' : 'flex-start'}} />}
    <div style={{display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start'}}>
      <Words text={l1} lt={lt} delay={delay + 0.1} color={WHITE} />
      {l2 && <Words text={l2} lt={lt} delay={delay + 0.3} color={CYAN} />}
    </div>
  </div>
);

export const Fade: React.FC<{lt: number; a: number; b?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  lt, a, b = a + 0.45, dy = 26, children, style,
}) => {
  const p = eO4(prog(lt, a, b));
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * dy}px)`, ...style}}>{children}</div>;
};

/* ------------------------------------------------------------------ superfici */

export const glass = (r = 22): React.CSSProperties => ({
  background: `linear-gradient(160deg, rgba(150,190,255,0.13) 0%, ${GLASS} 45%, rgba(20,30,90,0.35) 100%)`,
  border: `1.5px solid ${EDGE}`,
  borderRadius: r,
  boxShadow: '0 30px 80px rgba(0,0,20,0.5), inset 0 1px 0 rgba(255,255,255,0.18)',
});

export const Chip: React.FC<{children: React.ReactNode; c?: string; style?: React.CSSProperties}> = ({children, c = CYAN, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 40, border: `1.5px solid ${c}55`, background: `${c}18`, color: c, fontFamily: MONO, fontSize: 16, letterSpacing: '0.06em', whiteSpace: 'nowrap', ...style}}>
    {children}
  </div>
);

export const Check: React.FC<{p: number; ok?: boolean; s?: number}> = ({p, ok = true, s = 34}) => {
  const c = ok ? CYAN : CORAL;
  const d = eO3(p);
  return (
    <div style={{width: s, height: s, borderRadius: s, border: `2px solid ${c}`, background: `${c}${d > 0.5 ? '30' : '00'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * eO5(p)})`, opacity: p > 0 ? 1 : 0.25, boxShadow: d > 0.9 ? `0 0 16px ${c}88` : 'none'}}>
      <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 20 20">
        {ok ? (
          <path d="M3 10.5 L8 15 L17 5" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - d)} />
        ) : (
          <path d="M4 4 L16 16 M16 4 L4 16" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" strokeDasharray={34} strokeDashoffset={34 * (1 - d)} />
        )}
      </svg>
    </div>
  );
};

export const Ring: React.FC<{v: number; s?: number; c?: string; label?: string}> = ({v, s = 220, c = CYAN, label}) => {
  const r = s / 2 - 12, L = 2 * Math.PI * r;
  return (
    <div style={{position: 'relative', width: s, height: s}}>
      <svg width={s} height={s} style={{position: 'absolute', transform: 'rotate(-90deg)'}}>
        <circle cx={s / 2} cy={s / 2} r={r} stroke="rgba(140,200,255,0.15)" strokeWidth={10} fill="none" />
        <circle cx={s / 2} cy={s / 2} r={r} stroke={c} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - v / 100)} style={{filter: `drop-shadow(0 0 10px ${c})`}} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: RAL, fontWeight: 300, fontSize: s * 0.36, color: WHITE, fontVariantNumeric: 'lining-nums tabular-nums', lineHeight: 1}}>{Math.round(v)}</div>
        {label && <div style={{fontFamily: MONO, fontSize: s * 0.065, letterSpacing: '0.2em', color: MUTED, marginTop: 6}}>{label}</div>}
      </div>
    </div>
  );
};

export const Cursor: React.FC<{x: number; y: number; press?: number}> = ({x, y, press = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.15 * press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))'}}>
    {press > 0 && <div style={{position: 'absolute', left: -40, top: -40, width: 80, height: 80, borderRadius: 80, border: `3px solid ${CYAN}`, opacity: 1 - press, transform: `scale(${0.3 + press * 1.4})`}} />}
    <svg width={34} height={44} viewBox="0 0 34 44">
      <path d="M2 2 L2 34 L10 27 L16 41 L22 38 L16 25 L27 25 Z" fill={WHITE} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  </div>
);

// lampo/streak sul taglio di scena
export const Streaks: React.FC<{lt: number; seed: number}> = ({lt, seed}) => {
  const r = rnd(seed);
  const items = [];
  for (let i = 0; i < 9; i++) {
    const y = r() * H, len = 400 + r() * 900, d = r() * 0.1, th = 2 + r() * 3;
    const p = prog(lt, d, d + 0.3);
    if (p <= 0 || p >= 1) continue;
    const x = lerp(-len, W + len, eO3(p));
    items.push(<div key={i} style={{position: 'absolute', left: x - len / 2, top: y, width: len, height: th, background: `linear-gradient(90deg, transparent, ${i % 3 ? CYAN_HI : SKY}, transparent)`, opacity: 0.85 * (1 - p)}} />);
  }
  return <AbsoluteFill style={{pointerEvents: 'none'}}>{items}</AbsoluteFill>;
};
