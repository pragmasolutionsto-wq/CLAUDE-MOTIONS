import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import S from './shots.json';
import {Logo3D, Text3D} from './three';
import {
  BLUE, BLUE_D, CYAN, CYAN_HI, DURATION, FPS, GRAD, GREEN, H, HOT, LIME, LIME_HI, MONT, NAVY, NAVY_2, SENTS, SKY, W, WHITE, WS, YEL,
  clamp, eBack, eIO, eO3, eO5, faceAt, lerp, life, prog, rnd, safeZone, sE, spring, zoomAt, zoomOrigin,
} from './util';

type Shot = {name: string; kind: string; a: number; b: number; tr: string};
const SHOTS = S.shots as Shot[];
const K = S.k as Record<string, number>;
const sh = (name: string) => SHOTS.find((x) => x.name === name)!;
const PAD = 0.5; // margine delle clip (prep_ai.py)
const TR: Record<string, number> = {cube: 0.6, whip: 0.36, none: 0};

/* ------------------------------------------------------------------ sfondi */

// laboratorio scuro: navy profondo, griglia, particelle nei colori del logo, linea di scansione
const Navy: React.FC<{t: number; hue?: string}> = ({t, hue = CYAN}) => {
  const r = rnd(7);
  const pts = Array.from({length: 46}, () => ({x: r() * W, y: r() * H, s: 2 + r() * 6, v: 14 + r() * 40, c: [CYAN_HI, LIME_HI, YEL, WHITE][Math.floor(r() * 4)], ph: r() * 6}));
  const scan = ((t * 0.45) % 1.3) * H;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, ${NAVY_2} 0%, ${NAVY} 70%)`, overflow: 'hidden'}}>
      <AbsoluteFill style={{opacity: 0.16, backgroundImage: `linear-gradient(${hue} 1px, transparent 1px), linear-gradient(90deg, ${hue} 1px, transparent 1px)`, backgroundSize: '90px 90px', backgroundPosition: `0 ${(t * 30) % 90}px`, maskImage: 'radial-gradient(ellipse at 50% 45%, black 20%, transparent 75%)'}} />
      <div style={{position: 'absolute', left: -200, right: -200, top: 300, height: 900, background: `radial-gradient(ellipse, ${hue}55 0%, transparent 60%)`, filter: 'blur(30px)'}} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {pts.map((p, i) => {
          const y = (((p.y - t * p.v) % H) + H) % H;
          return <circle key={i} cx={p.x + Math.sin(t + p.ph) * 14} cy={y} r={p.s / 2} fill={p.c} opacity={0.35 + 0.35 * Math.sin(t * 2 + p.ph)} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: scan - 120, height: 120, background: `linear-gradient(180deg, transparent, ${hue}30)`, borderBottom: `2px solid ${hue}90`}} />
    </AbsoluteFill>
  );
};

// ciano lucido come le storie della farmacia
const Sky: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `linear-gradient(165deg, #5fd6f2 0%, ${SKY} 38%, #0a86c0 100%)`, overflow: 'hidden'}}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{position: 'absolute', width: 900, height: 900, borderRadius: 999, left: -200 + i * 380 + Math.sin(t * 0.7 + i * 2) * 120, top: 200 + i * 520 + Math.cos(t * 0.5 + i) * 90,
        background: `radial-gradient(circle, rgba(255,255,255,${0.32 - i * 0.07}) 0%, transparent 62%)`}} />
    ))}
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 30%, transparent 70%, rgba(4,40,70,0.35) 100%)'}} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ tipografia */

// riga titolo: Montserrat Black, entra dal basso con molla; box gradiente o bianco
const Line: React.FC<{t: number; a: number; text: string; size?: number; box?: 'grad' | 'white' | 'navy' | 'none'; color?: string; out?: number; delay?: number}> = ({t, a, text, size = 96, box = 'none', color = WHITE, out = 99, delay = 0}) => {
  const p = prog(t, a + delay, a + delay + 0.55);
  if (p <= 0) return null;
  const s = spring(p * 1.8);
  const o = eO3(prog(t, out - 0.2, out));
  const bg = box === 'grad' ? GRAD : box === 'white' ? WHITE : box === 'navy' ? NAVY : 'transparent';
  const fg = box === 'white' ? BLUE : box === 'grad' ? NAVY : color;
  return (
    <div style={{overflow: 'hidden', padding: '6px 10px'}}>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: size, lineHeight: 1.02, textTransform: 'uppercase', letterSpacing: '-0.01em', color: fg, background: bg,
        padding: box === 'none' ? 0 : '10px 28px 14px', borderRadius: 18, boxShadow: box === 'none' ? 'none' : '0 16px 40px rgba(0,20,40,0.35)',
        textShadow: box === 'none' ? '0 6px 24px rgba(0,10,25,0.55)' : 'none',
        transform: `translateY(${(1 - s) * 120 + o * -60}%) rotate(${(1 - s) * 4}deg)`, opacity: clamp(p * 4) * (1 - o)}}>
        {text}
      </div>
    </div>
  );
};

const Stack: React.FC<{y: number; children: React.ReactNode; align?: 'center' | 'flex-start' | 'flex-end'; x?: number; right?: number; gap?: number}> = ({y, children, align = 'center', x = 40, right = 40, gap = 0}) => (
  <div style={{position: 'absolute', left: x, right, top: y, display: 'flex', flexDirection: 'column', alignItems: align, gap}}>{children}</div>
);

const Icon: React.FC<{name: string; c: string; s?: number}> = ({name, c, s = 40}) => {
  const st = {fill: 'none', stroke: c, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const P: Record<string, React.ReactNode> = {
    drop: <path {...st} d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z" />,
    leaf: <path {...st} d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l7-7" />,
    moon: <path {...st} d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z" />,
    sun: <><circle {...st} cx="12" cy="12" r="4" /><path {...st} d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></>,
    sparkle: <path {...st} d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 3v4M17 5h4" />,
    face: <><circle {...st} cx="12" cy="12" r="9" /><path {...st} d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8M9 9.5h.01M15 9.5h.01" /></>,
    check: <path {...st} d="M5 12l5 5 9-10" />,
    up: <path {...st} d="M12 20V5M6 11l6-6 6 6" />,
    flame: <path {...st} d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 2-5 5-5 8 0 4 3 7 7 7z" />,
    virus: <><circle {...st} cx="12" cy="12" r="5" /><path {...st} d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M5 19l3.5-3.5M15.5 8.5L19 5" /></>,
    expand: <path {...st} d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
    alert: <><path {...st} d="M12 3l10 18H2z" /><path {...st} d="M12 10v5M12 18v.5" /></>,
    family: <><circle {...st} cx="8" cy="7" r="3" /><circle {...st} cx="17" cy="9" r="2.4" /><path {...st} d="M3 21v-3a5 5 0 0 1 10 0v3M14 21v-2a3.5 3.5 0 0 1 7 0v2" /></>,
    shield: <path {...st} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
    clock: <><circle {...st} cx="12" cy="12" r="9" /><path {...st} d="M12 7v5l3 3" /></>,
    chart: <path {...st} d="M4 20V4M4 20h16M8 16l4-5 3 3 5-7" />,
    walk: <><circle {...st} cx="13" cy="4" r="2" /><path {...st} d="M10 21l2-6-3-3 1-5 4 3 3 1M9 12l-2 4" /></>,
    pin: <><path {...st} d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z" /><circle {...st} cx="12" cy="10" r="2.5" /></>,
    phone: <path {...st} d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2z" />,
    eye: <><path {...st} d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle {...st} cx="12" cy="12" r="3" /></>,
    list: <path {...st} d="M9 6h11M9 12h11M9 18h11M4 6h.5M4 12h.5M4 18h.5" />,
    hand: <path {...st} d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9a1.5 1.5 0 0 1 3 0v5a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-3-5a1.5 1.5 0 0 1 2.5-1.5L7 13" />,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24">{P[name]}</svg>;
};

const Chip: React.FC<{t: number; a: number; text: string; icon: string; size?: number; hi?: boolean; hot?: boolean; out?: number; from?: 'left' | 'right'}> = ({t, a, text, icon, size = 40, hi, hot, out = 99, from = 'left'}) => {
  const p = prog(t, a, a + 0.5);
  if (p <= 0) return null;
  const s = spring(p * 1.8);
  const o = eO3(prog(t, out - 0.2, out));
  const bg = hot ? HOT : hi ? GRAD : 'rgba(255,255,255,0.96)';
  const fg = hot ? WHITE : hi ? NAVY : BLUE_D;
  const ib = hot ? 'rgba(255,255,255,0.25)' : hi ? NAVY : CYAN;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 28px 10px 10px', borderRadius: 999, background: bg, boxShadow: '0 14px 34px rgba(0,15,35,0.4)',
      fontFamily: MONT, fontWeight: 900, fontSize: size, color: fg, textTransform: 'uppercase', whiteSpace: 'nowrap',
      transform: `translateX(${(1 - s) * (from === 'left' ? -260 : 260)}px) scale(${lerp(0.6, 1, s)})`, opacity: clamp(p * 4) * (1 - o)}}>
      <div style={{width: size * 1.55, height: size * 1.55, borderRadius: 99, background: ib, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={icon} c={WHITE} s={size * 0.95} />
      </div>
      {text}
    </div>
  );
};

// testo 3D estruso in un riquadro
const T3: React.FC<{t: number; a: number; text: string; y: number; h?: number; size?: number; mode?: 'grad' | 'white' | 'cyan'; out?: number; spin?: number; x?: number; w?: number; plate?: number}> = ({t, a, text, y, h = 520, size, mode, out = 99, spin, x = 0, w = W, plate = 0}) => {
  if (t < a - 0.05 || t > out + 0.05) return null;
  return (
    <>
      {plate > 0 && (() => {
        const v = eBack(prog(t, a - 0.05, a + 0.35), 1.2) * (1 - eO3(prog(t, out - 0.25, out)));
        return <div style={{position: 'absolute', left: (W - plate) / 2, top: y + h * 0.12, width: plate, height: h * 0.76, borderRadius: 44, background: 'rgba(4,18,31,0.86)', border: '2px solid rgba(63,208,240,0.55)', boxShadow: '0 20px 50px rgba(0,15,35,0.45)', transform: `scaleX(${v})`, opacity: clamp(v * 2)}} />;
      })()}
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, filter: 'drop-shadow(0 24px 40px rgba(0,10,30,0.55))'}}>
      <Text3D text={text} lt={t - a} w={w} h={h} size={size} mode={mode} spin={spin} out={prog(t, out - 0.3, out)} />
    </div>
    </>
  );
};


/* ------------------------------------------------------------------ elementi ricorrenti */

const Corner: React.FC<{dark?: boolean}> = ({dark}) => (
  <div style={{position: 'absolute', right: 40, top: 64, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px 10px 12px', borderRadius: 999, background: dark ? 'rgba(4,18,31,0.55)' : 'rgba(255,255,255,0.92)', border: dark ? '1.5px solid rgba(63,208,240,0.45)' : 'none', boxShadow: '0 8px 24px rgba(0,20,40,0.2)'}}>
    <Img src={staticFile('logo/mark.png')} style={{height: 46}} />
    <Img src={staticFile(dark ? 'logo/wordmark_w.png' : 'logo/wordmark.png')} style={{height: 40}} />
  </div>
);

// clip 3D (già sulla durata giusta in prep_ai.py): leggera spinta in avanti continua
const Clip: React.FC<{name: string; t: number; z0?: number; dz?: number; y?: number; children?: React.ReactNode; dark?: boolean}> = ({name, t, z0 = 1.04, dz = 0.012, y = 0, children, dark = true}) => {
  const s = sh(name);
  const lt = t - s.a;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: NAVY}}>
      <Sequence from={Math.round((s.a - PAD) * FPS)} layout="none">
        <OffthreadVideo src={staticFile(`ai/${name}.mp4`)} muted style={{width: W, height: H, objectFit: 'cover', transform: `translateY(${y}px) scale(${z0 + lt * dz})`}} />
      </Sequence>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(3,14,26,0.55) 0%, rgba(3,14,26,0) 18%, rgba(3,14,26,0) 62%, rgba(3,14,26,0.6) 100%)'}} />
      {children}
      <Corner dark={dark} />
    </AbsoluteFill>
  );
};

// HUD scientifico: mirino che aggancia un punto
const Target: React.FC<{t: number; a: number; x: number; y: number; r?: number; c?: string; label?: string}> = ({t, a, x, y, r = 120, c = CYAN_HI, label}) => {
  const p = prog(t, a, a + 0.6);
  if (p <= 0) return null;
  const s = eBack(p, 1.2);
  const rot = (t - a) * 40;
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, transform: `scale(${lerp(2.2, 1, s)})`, opacity: clamp(p * 3)}}>
      <svg width={2 * r} height={2 * r} style={{overflow: 'visible', transform: `rotate(${rot}deg)`}}>
        <circle cx={r} cy={r} r={r - 4} fill="none" stroke={c} strokeWidth={4} strokeDasharray="38 22" />
        <circle cx={r} cy={r} r={r * 0.6} fill="none" stroke={c} strokeWidth={2} opacity={0.6} />
      </svg>
      {label && (
        <div style={{position: 'absolute', left: 2 * r + 20, top: r - 30, whiteSpace: 'nowrap', fontFamily: MONT, fontWeight: 900, fontSize: 38, color: NAVY, background: c, padding: '6px 18px', borderRadius: 10,
          transform: `translateX(${(1 - eO3(prog(t, a + 0.3, a + 0.7))) * -30}px)`, opacity: prog(t, a + 0.3, a + 0.5)}}>
          {label}
        </div>
      )}
    </div>
  );
};


const Gauge: React.FC<{t: number; a: number; y: number}> = ({t, a, y}) => {
  const p = prog(t, a, a + 0.5);
  if (p <= 0) return null;
  const v = eIO(prog(t, a + 0.35, a + 1.8)) * 0.86 + Math.sin(t * 18) * 0.008 * prog(t, a + 1.8, a + 2);
  const R = 360, cx = 540, cy = y + 400;
  const ang = Math.PI * (1 - v);
  const arc = (f0: number, f1: number) => {
    const a0 = Math.PI * (1 - f0), a1 = Math.PI * (1 - f1);
    return `M ${cx + R * Math.cos(a0)} ${cy - R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy - R * Math.sin(a1)}`;
  };
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: clamp(p * 3), transform: `scale(${lerp(0.7, 1, eBack(p))})`, transformOrigin: `${cx}px ${cy}px`}}>
      <defs>
        <linearGradient id="gg" x1="0" x2="1">
          <stop offset="0" stopColor={CYAN_HI} /><stop offset="0.45" stopColor={LIME} /><stop offset="0.7" stopColor={YEL} /><stop offset="1" stopColor={HOT} />
        </linearGradient>
      </defs>
      <path d={arc(0, 1)} stroke="rgba(255,255,255,0.12)" strokeWidth={56} fill="none" strokeLinecap="round" />
      <path d={arc(0, 1)} stroke="url(#gg)" strokeWidth={56} fill="none" strokeLinecap="round" strokeDasharray={Math.PI * R} strokeDashoffset={Math.PI * R * (1 - v)} style={{filter: 'drop-shadow(0 0 18px rgba(255,140,60,0.6))'}} />
      {Array.from({length: 11}, (_, i) => {
        const an = Math.PI * (1 - i / 10);
        return <line key={i} x1={cx + (R - 60) * Math.cos(an)} y1={cy - (R - 60) * Math.sin(an)} x2={cx + (R - 84) * Math.cos(an)} y2={cy - (R - 84) * Math.sin(an)} stroke="rgba(255,255,255,0.5)" strokeWidth={4} />;
      })}
      <line x1={cx} y1={cy} x2={cx + (R - 70) * Math.cos(ang)} y2={cy - (R - 70) * Math.sin(ang)} stroke={WHITE} strokeWidth={12} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={30} fill={WHITE} />
      <circle cx={cx} cy={cy} r={14} fill={HOT} />
    </svg>
  );
};

// testo che si scrive con il passaggio dello scanner
const ScanText: React.FC<{t: number; a: number; text: string; y: number; size: number; c?: string}> = ({t, a, text, y, size, c = WHITE}) => {
  const p = prog(t, a, a + 0.7);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>
      <div style={{position: 'relative', fontFamily: MONT, fontWeight: 900, fontSize: size, color: c, textTransform: 'uppercase', textShadow: `0 0 30px ${CYAN}`, clipPath: `inset(0 ${(1 - eO3(p)) * 100}% 0 0)`}}>
        {text}
        <div style={{position: 'absolute', top: -10, bottom: -10, left: `${eO3(p) * 100}%`, width: 8, background: CYAN_HI, boxShadow: `0 0 30px ${CYAN_HI}`, opacity: 1 - prog(t, a + 0.7, a + 0.9)}} />
      </div>
    </div>
  );
};

const Price: React.FC<{t: number; a: number; x: number; y: number; r?: number}> = ({t, a, x, y, r = 135}) => {
  const p = prog(t, a, a + 0.6);
  if (p <= 0) return null;
  const s = spring(p * 1.8);
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: 999, background: GRAD, boxShadow: '0 24px 50px rgba(0,30,60,0.45), inset 0 -10px 20px rgba(0,0,0,0.12)', border: `6px solid ${WHITE}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${s}) rotate(${lerp(-60, -10, s) + Math.sin(t * 2) * 3}deg)`}}>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: r * 0.24, color: NAVY, letterSpacing: '0.04em'}}>TEST PSA</div>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: r * 0.72, color: NAVY, lineHeight: 0.95}}>13€</div>
    </div>
  );
};

// tre card che entrano in profondità, una per passaggio del servizio
const Step: React.FC<{t: number; a: number; n: number; text: string; icon: string; y: number}> = ({t, a, n, text, icon, y}) => {
  const p = prog(t, a, a + 0.6);
  if (p <= 0) return null;
  const s = spring(p * 1.8);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: y, height: 210, perspective: 1200}}>
      <div style={{width: '100%', height: '100%', borderRadius: 34, background: 'rgba(255,255,255,0.96)', boxShadow: '0 26px 60px rgba(0,30,60,0.35)', display: 'flex', alignItems: 'center', gap: 30, padding: '0 36px',
        transform: `rotateX(${(1 - s) * 70}deg) translateZ(${(1 - s) * -300}px)`, transformOrigin: '50% 0%', opacity: clamp(p * 3)}}>
        <div style={{width: 130, height: 130, flex: '0 0 130px', borderRadius: 30, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          <Icon name={icon} c={NAVY} s={78} />
          <div style={{position: 'absolute', top: -16, left: -16, width: 54, height: 54, borderRadius: 99, background: BLUE, color: WHITE, fontFamily: MONT, fontWeight: 900, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${WHITE}`}}>{n}</div>
        </div>
        <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 50, lineHeight: 1.05, color: BLUE_D, textTransform: 'uppercase'}}>{text}</div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ transizioni */

const Cube: React.FC<{p: number; a: React.ReactNode; b: React.ReactNode}> = ({p, a, b}) => {
  const e = eIO(p);
  const face = (rot: number, child: React.ReactNode, shade: number) => (
    <div style={{position: 'absolute', width: W, height: H, overflow: 'hidden', backfaceVisibility: 'hidden', transform: `rotateY(${rot}deg) translateZ(${W / 2}px)`}}>
      {child}
      <AbsoluteFill style={{background: NAVY, opacity: shade * 0.55}} />
    </div>
  );
  const pull = Math.sin(e * Math.PI) * 300;
  return (
    <AbsoluteFill style={{perspective: 1700, background: NAVY}}>
      <div style={{position: 'absolute', width: W, height: H, transformStyle: 'preserve-3d', transform: `translateZ(${-W / 2 - pull}px) rotateY(${-90 * e}deg)`}}>
        {face(0, a, e)}
        {face(90, b, 1 - e)}
      </div>
    </AbsoluteFill>
  );
};

// whip: zoom + motion blur in uscita, rientro da zoom inverso con lampo di luce
const Whip: React.FC<{p: number; a: React.ReactNode; b: React.ReactNode}> = ({p, a, b}) => {
  const out = p < 0.5;
  const q = out ? p / 0.5 : (p - 0.5) / 0.5;
  const sc = out ? lerp(1, 1.35, eO3(q) * q) : lerp(0.78, 1, eO3(q));
  const bl = out ? q * 18 : (1 - q) * 18;
  const fl = 1 - Math.abs(p - 0.5) * 2;
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${sc}) rotate(${out ? q * 3 : (1 - q) * -3}deg)`, filter: `blur(${bl}px) brightness(${1 + fl * 0.6})`}}>{out ? a : b}</AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(63,208,240,0.5) 45%, transparent 75%)`, opacity: fl * fl * 0.8}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ farmacista */

const grade = (_t: number) => 'none';

// la base montata (tempo di uscita = tempo della base), punch-in alternato centrato sul viso
const Video: React.FC<{t: number}> = ({t}) => {
  const z = zoomAt(t), [ox, oy] = zoomOrigin(t);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: NAVY}}>
      <OffthreadVideo src={staticFile('base.mp4')} muted style={{width: W, height: H, transformOrigin: `${ox}px ${oy}px`, transform: `scale(${z})`, filter: grade(t)}} />
    </AbsoluteFill>
  );
};

// cerchio con il volto durante gli inserti, centrato sul viso tracciato
const Pip: React.FC<{t: number; a: number; b: number; x?: number; y?: number; D?: number}> = ({t, a, b, x = 48, y = 1120, D = 340}) => {
  const v = life(t, a + 0.3, b + 0.3, 0.4, 0.01);
  if (v <= 0) return null;
  const [x0, y0, x1, y1] = faceAt(t);
  const fw = x1 - x0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + 10;
  const sc = (D * 0.95) / fw;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: D, height: D, borderRadius: D, overflow: 'hidden', border: `7px solid ${WHITE}`, boxShadow: `0 18px 44px rgba(0,20,40,0.45), 0 0 0 4px ${CYAN}`, transform: `scale(${eBack(v)})`, opacity: clamp(v * 2), background: NAVY}}>
      <div style={{position: 'absolute', width: W, height: H, left: D / 2 - cx * sc, top: D / 2 - cy * sc, transformOrigin: '0 0', transform: `scale(${sc})`}}>
        <Video t={t} />
      </div>
    </div>
  );
};

// inquadratura sul farmacista: grafiche nella zona libera (sotto il mento, o in alto quando il viso è basso)
const Face: React.FC<{t: number; name: string; children: (z: {y: number; top: boolean}) => React.ReactNode}> = ({t, name, children}) => {
  const s = sh(name);
  const z = ZONES[name] ?? (ZONES[name] = safeZone(s.a, s.b, 300));
  return (
    <AbsoluteFill>
      <Video t={t} />
      {z.top && <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,18,31,0.45) 0%, rgba(4,18,31,0) 40%)'}} />}
      {children(z)}
      <Corner />
    </AbsoluteFill>
  );
};
const ZONES: Record<string, {y: number; top: boolean}> = {};

/* ------------------------------------------------------------------ inquadrature */

const FHook: React.FC<{t: number}> = ({t}) => {
  const sw = K.riguarda - 0.3;
  return (
    <Face t={t} name="f_hook">{(z) => (
      <>
        <T3 t={t} a={0.05} text="NOVEMBRE" y={z.y - 30} h={260} size={1.25} plate={720} out={sw} />
        <Stack y={z.y + 200}><Line t={t} a={K.mese - 0.2} text="mese del diabete" size={70} box="grad" out={sw} /></Stack>
        <Stack y={z.y}>
          <Line t={t} a={sw} text="riguarda soprattutto" size={60} box="navy" />
          <Line t={t} a={K.diabete0b - 0.3} text="chi non ce l'ha" size={84} box="white" />
          <Line t={t} a={K.pensa - 0.2} text="o pensa di non averlo" size={54} box="grad" />
        </Stack>
      </>
    )}</Face>
  );
};

const ShGlucose: React.FC<{t: number}> = ({t}) => (
  <Clip name="glucose" t={t} dz={0.02}>
    <Stack y={150}>
      <Line t={t} a={K.tipo - 0.3} text="diabete di tipo 2" size={80} box="white" />
      <Line t={t} a={K.diffuso - 0.3} text="il più diffuso" size={60} box="navy" />
    </Stack>
    <Stack y={1180} align="flex-end" x={400} right={40}><Chip t={t} a={K.silenzio - 0.4} text="cresce in silenzio" icon="clock" size={36} hi from="right" /></Stack>
    <Pip t={t} a={sh('glucose').a} b={sh('glucose').b} />
  </Clip>
);

const FSilent: React.FC<{t: number}> = ({t}) => {
  const sw = K.glicemia2 - 0.5;
  return (
    <Face t={t} name="f_silent">{(z) => (
      <>
        <Stack y={z.y}><Chip t={t} a={K.sintomi - 0.5} text="all'inizio spesso nessun sintomo" icon="alert" size={36} out={sw} /></Stack>
        <Stack y={z.y}>
          <Line t={t} a={sw} text="conosci la tua" size={60} box="navy" />
          <Line t={t} a={sw + 0.2} text="glicemia" size={110} box="grad" />
        </Stack>
        <Stack y={z.y + 250}><Chip t={t} a={K.muoverti - 0.3} text="per muoverti prima" icon="up" size={40} /></Stack>
      </>
    )}</Face>
  );
};

const FTwo: React.FC<{t: number}> = ({t}) => (
  <Face t={t} name="f_two">{(z) => (
    <>
      <T3 t={t} a={K.esami - 0.6} text="2" y={z.y - 30} h={260} size={2.4} plate={230} />
      <Stack y={z.y + 210}><Line t={t} a={K.esami - 0.2} text="esami" size={80} box="white" /></Stack>
    </>
  )}</Face>
);

const ShDrop: React.FC<{t: number}> = ({t}) => (
  <Clip name="drop" t={t} dz={0.025} dark={false}>
    <Stack y={160}>
      <Line t={t} a={K.glicemia3 - 0.15} text="glicemia" size={110} box="grad" />
      <Line t={t} a={K.glucosio - 0.3} text="il glucosio adesso" size={56} box="navy" />
    </Stack>
    <Stack y={1180} align="flex-end" x={400} right={40}><Chip t={t} a={K.fotografia - 0.5} text="una fotografia" icon="eye" size={38} hi from="right" /></Stack>
    <Pip t={t} a={sh('drop').a} b={sh('drop').b} />
  </Clip>
);

const FHba1c: React.FC<{t: number}> = ({t}) => (
  <Face t={t} name="f_hba1c">{(z) => (
    <>
      <Stack y={z.y}>
        <Line t={t} a={sh('f_hba1c').a + 0.05} text="emoglobina" size={70} box="white" />
        <Line t={t} a={sh('f_hba1c').a + 0.3} text="glicata" size={96} box="grad" />
      </Stack>
      <Stack y={z.y + 230} gap={14}>
        <Chip t={t} a={K.media - 0.3} text="media ultimi 2-3 mesi" icon="chart" size={38} />
        <Chip t={t} a={K.filmato - 0.4} text="un filmato" icon="clock" size={38} hi from="right" />
      </Stack>
    </>
  )}</Face>
);

const FTogether: React.FC<{t: number}> = ({t}) => {
  const sw = K.prediabete - 0.4, sw2 = K.ancora - 0.35;
  return (
    <Face t={t} name="f_together">{(z) => (
      <>
        <Stack y={z.y}>
          <Line t={t} a={sh('f_together').a + 0.05} text="insieme" size={64} box="navy" out={sw} />
          <Line t={t} a={K.completo - 0.3} text="quadro completo" size={66} box="white" out={sw} />
        </Stack>
        <Stack y={z.y}><Line t={t} a={sw} text="prediabete" size={110} box="grad" /></Stack>
        <Stack y={z.y + 160} gap={14}>
          <Chip t={t} a={sw2} text="non è ancora diabete" icon="check" size={38} />
          <Chip t={t} a={K.segnale - 0.3} text="un segnale da ascoltare" icon="alert" size={38} hi from="right" />
        </Stack>
      </>
    )}</Face>
  );
};

const ShLife: React.FC<{t: number}> = ({t}) => (
  <Clip name="life" t={t} dz={0.015} dark={false}>
    <div style={{position: 'absolute', left: 40, right: 40, top: 160, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14}}>
      <Chip t={t} a={K.alimentazione - 0.25} text="alimentazione" icon="leaf" size={38} />
      <Chip t={t} a={K.movimento - 0.25} text="movimento" icon="walk" size={38} from="right" />
      <Chip t={t} a={K.peso - 0.25} text="peso" icon="chart" size={38} />
      <Chip t={t} a={K.sonno - 0.25} text="sonno" icon="moon" size={38} from="right" />
    </div>
    <Stack y={1180} align="flex-end" x={400} right={40}><Line t={t} a={K.ridurre - 0.3} text="meno rischio" size={64} box="grad" /></Stack>
    <Pip t={t} a={sh('life').a} b={sh('life').b} />
  </Clip>
);

const FWho: React.FC<{t: number}> = ({t}) => {
  const sw = K.tutti - 0.25;
  return (
    <Face t={t} name="f_who">{(z) => (
      <>
        <Stack y={z.y}>
          <Line t={t} a={K.consigliamo - 0.3} text="a chi lo" size={60} box="navy" out={sw} />
          <Line t={t} a={K.consigliamo} text="consigliamo?" size={90} box="grad" out={sw} />
        </Stack>
        <Stack y={z.y - 10}><Line t={t} a={sw} text="a tutti, dai" size={60} box="white" /></Stack>
        <T3 t={t} a={K.quaranta - 0.35} text="40-45" y={z.y + 70} h={230} size={2.0} mode="cyan" spin={0.5} plate={480} />
        <Stack y={z.y + 300}><Line t={t} a={K.quaranta + 0.6} text="anni" size={56} box="navy" /></Stack>
      </>
    )}</Face>
  );
};

const FRisk: React.FC<{t: number}> = ({t}) => (
  <Face t={t} name="f_risk">{(z) => (
    <>
      <Stack y={z.y}><Line t={t} a={sh('f_risk').a + 0.05} text="soprattutto se" size={56} box="navy" /></Stack>
      <div style={{position: 'absolute', left: 40, right: 40, top: z.y + 95, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12}}>
        <Chip t={t} a={K.familiari - 0.3} text="familiari diabetici" icon="family" size={34} />
        <Chip t={t} a={K.sovrappeso - 0.3} text="sovrappeso" icon="chart" size={34} from="right" />
        <Chip t={t} a={K.muove - 0.3} text="poco movimento" icon="walk" size={34} />
        <Chip t={t} a={K.pressione - 0.3} text="pressione alta" icon="up" size={34} from="right" />
        <Chip t={t} a={K.colesterolo - 0.3} text="colesterolo e trigliceridi" icon="drop" size={34} hi />
      </div>
    </>
  )}</Face>
);

const FWoman: React.FC<{t: number}> = ({t}) => (
  <Face t={t} name="f_woman">{(z) => (
    <>
      <Stack y={z.y}><Line t={t} a={K.donna - 0.4} text="se sei donna" size={74} box="grad" /></Stack>
      <Stack y={z.y + 120} gap={10}>
        <Chip t={t} a={K.gravidanza - 0.5} text="diabete in gravidanza" icon="check" size={32} />
        <Chip t={t} a={K.bambino - 0.4} text="neonato molto grande" icon="check" size={32} from="right" />
        <Chip t={t} a={K.policistico - 0.45} text="ovaio policistico" icon="check" size={32} />
        <Chip t={t} a={K.condizioni - 0.3} text="insulino-resistenza" icon="check" size={32} hi from="right" />
      </Stack>
    </>
  )}</Face>
);

// bollino promo (nessun prezzo inventato: "prezzo promozionale" come detto in video)
const Promo: React.FC<{t: number; a: number; x: number; y: number; r?: number}> = ({t, a, x, y, r = 130}) => {
  const p = prog(t, a, a + 0.6);
  if (p <= 0) return null;
  const s = spring(p * 1.8);
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: 999, background: GRAD, border: `6px solid ${WHITE}`, boxShadow: '0 24px 50px rgba(0,30,60,0.45)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${s}) rotate(${lerp(-60, -10, s) + Math.sin(t * 2) * 3}deg)`}}>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: r * 0.22, color: NAVY}}>PREZZO</div>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: r * 0.42, color: NAVY, lineHeight: 0.95}}>PROMO</div>
      <div style={{fontFamily: MONT, fontWeight: 800, fontSize: r * 0.16, color: NAVY}}>tutto novembre</div>
    </div>
  );
};

const FPromo: React.FC<{t: number}> = ({t}) => (
  <Face t={t} name="f_promo">{(z) => (
    <>
      <Stack y={z.y} align="flex-start" x={50}>
        <Line t={t} a={K.novembre11 - 0.3} text="per tutto novembre" size={52} box="navy" />
        <Line t={t} a={K.pacchetto - 0.3} text="glicemia" size={78} box="white" />
        <Line t={t} a={K.pacchetto + 0.3} text="+ emoglobina glicata" size={56} box="grad" />
      </Stack>
      <Promo t={t} a={K.prezzo - 0.4} x={880} y={z.y + 360} r={125} />
    </>
  )}</Face>
);

const FArea: React.FC<{t: number}> = ({t}) => (
  <Face t={t} name="f_area">{(z) => (
    <>
      <Stack y={z.y}><Line t={t} a={K.controllo - 0.3} text="un controllo semplice" size={54} box="white" /></Stack>
      <Stack y={z.y + 130} gap={14}>
        <Chip t={t} a={K.area - 0.3} text="nella nostra area servizi" icon="check" size={38} />
        <Chip t={t} a={K.tranquillita - 0.3} text="in tranquillità" icon="shield" size={38} hi from="right" />
      </Stack>
    </>
  )}</Face>
);

const FWait: React.FC<{t: number}> = ({t}) => (
  <Face t={t} name="f_wait">{(z) => (
    <Stack y={z.y}>
      <Line t={t} a={K.aspettiamo - 0.3} text="ti aspettiamo" size={96} box="grad" />
      <Line t={t} a={K.sempre13 - 0.3} text="siamo qui per te" size={66} box="white" />
    </Stack>
  )}</Face>
);

const ShEnd: React.FC<{t: number}> = ({t}) => {
  const a = sh('end').a;
  const lt = t - a;
  const wv = eO5(prog(lt, 0.45, 0.95)), pay = eO5(prog(lt, 0.75, 1.25)), inf = eO5(prog(lt, 1.1, 1.6));
  return (
    <>
      <Sky t={t} />
      <div style={{position: 'absolute', left: 0, top: 150, width: W, height: 560}}>
        <Logo3D lt={lt} w={W} h={560} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
        <Img src={staticFile('logo/wordmark_w.png')} style={{width: 720, opacity: wv, transform: `translateY(${(1 - wv) * 40}px)`, filter: 'drop-shadow(0 8px 20px rgba(0,40,70,0.35))'}} />
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 42, color: NAVY, background: WHITE, padding: '12px 30px', borderRadius: 999, opacity: pay, transform: `translateY(${(1 - pay) * 30}px)`, boxShadow: '0 12px 30px rgba(0,30,60,0.25)'}}>
          Le persone di sempre. <span style={{color: BLUE}}>I servizi di oggi.</span>
        </div>
      </div>
      <Stack y={1010}><Line t={t} a={a + 0.9} text="glicemia + emoglobina glicata" size={40} box="grad" /></Stack>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1130, display: 'flex', flexDirection: 'column', gap: 18, opacity: inf, transform: `translateY(${(1 - inf) * 40}px)`}}>
        {[['pin', 'Piazza Plebiscito 1 · Picerno (PZ)'], ['phone', 'Tel. e WhatsApp 0971 991434']].map(([ic, tx]) => (
          <div key={tx} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 28px 14px 14px', borderRadius: 999, background: 'rgba(4,18,31,0.82)', fontFamily: MONT, fontWeight: 800, fontSize: 42, color: WHITE}}>
            <div style={{width: 66, height: 66, borderRadius: 99, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} c={NAVY} s={40} /></div>
            {tx}
          </div>
        ))}
      </div>
    </>
  );
};

const RENDER: Record<string, React.FC<{t: number}>> = {
  f_hook: FHook, glucose: ShGlucose, f_silent: FSilent, f_two: FTwo, drop: ShDrop, f_hba1c: FHba1c, f_together: FTogether, life: ShLife,
  f_who: FWho, f_risk: FRisk, f_woman: FWoman, f_promo: FPromo, f_area: FArea, f_wait: FWait, end: ShEnd,
};

/* ------------------------------------------------------------------ montaggio */

// cambi di ripresa (clip diverse del farmacista)
const TAKES = [1, 3, 4, 7, 10, 11, 12].map((k) => SENTS[k].t);

export const Movie: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const i = Math.max(0, SHOTS.findIndex((s) => t >= s.a && t < s.b));
  const cur = SHOTS[i];
  let view: React.ReactNode = null;
  const nx = SHOTS[i + 1];
  const D1 = TR[cur.tr] ?? 0, D2 = nx ? TR[nx.tr] ?? 0 : 0;
  const C = RENDER[cur.name];
  if (D1 && i > 0 && t < cur.a + D1 / 2) {
    const P = RENDER[SHOTS[i - 1].name];
    const p = prog(t, cur.a - D1 / 2, cur.a + D1 / 2);
    view = cur.tr === 'cube' ? <Cube p={p} a={<P t={t} />} b={<C t={t} />} /> : <Whip p={p} a={<P t={t} />} b={<C t={t} />} />;
  } else if (nx && D2 && t >= nx.a - D2 / 2) {
    const N = RENDER[nx.name];
    const p = prog(t, nx.a - D2 / 2, nx.a + D2 / 2);
    view = nx.tr === 'cube' ? <Cube p={p} a={<C t={t} />} b={<N t={t} />} /> : <Whip p={p} a={<C t={t} />} b={<N t={t} />} />;
  } else view = <C t={t} />;
  let fx = 0;
  for (const c of TAKES) fx = Math.max(fx, Math.sin(Math.PI * prog(t, c - 0.2, c + 0.2)));
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <AbsoluteFill style={{transform: `scale(${1 + fx * 0.14}) rotate(${fx * 1.5}deg)`, filter: fx > 0 ? `blur(${fx * 9}px) brightness(${1 + fx * 0.35})` : 'none'}}>{view}</AbsoluteFill>
      {fx > 0 && <AbsoluteFill style={{background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(63,208,240,0.45) 45%, transparent 75%)', opacity: fx * fx * 0.75}} />}
    </AbsoluteFill>
  );
};

export {DURATION};
