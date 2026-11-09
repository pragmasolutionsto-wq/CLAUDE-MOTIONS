import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Logo3D} from './three';
import WORDS from './words.json';
import {
  ANTON, CREAM, DURATION, EMERALD, FOREST, FPS, H, LIME, LIME_HI, MONT, PANEL, SAGE, SERIF, SPEECH_END, SRC_Y, SUB_TOP, TEAL, TEAL_D, W, WHITE,
  clamp, eBack, eIO, eO3, eO5, lerp, prog, segEnd, segT, soft, w,
} from './util';

/* ------------------------------------------------------------------ modalità: P presenter intero · S split · F insert 3D a tutto schermo */

type Mode = {m: 'P' | 'S' | 'F'; a: number; b: number; clip?: string; still?: boolean; dy?: number};
const E = (i: number) => segEnd(i);
const MODES: Mode[] = [
  {m: 'P', a: 0, b: 5.6},
  {m: 'F', a: 5.6, b: 9.1, clip: 'battery', still: true},
  {m: 'F', a: 9.3, b: 15.0, clip: 'shield'},
  {m: 'P', a: 15.0, b: 27.3},
  {m: 'S', a: 27.3, b: 32.4, clip: 'battery', still: true, dy: -240},
  {m: 'P', a: 32.4, b: 35.4},
  {m: 'S', a: 35.4, b: 43.1, clip: 'causes', still: true},
  {m: 'P', a: 43.1, b: 54.8},
  {m: 'F', a: 54.8, b: SPEECH_END, clip: 'care', still: true},
];
const TR = 0.55;
const modeIdx = (t: number) => {
  let k = 0;
  MODES.forEach((x, i) => { if (t >= x.a) k = i; });
  return k;
};
// 0..1 quanto lo schermo è diviso
const splitAmt = (t: number) => {
  let v = 0;
  MODES.forEach((x) => { if (x.m === 'S') v = Math.max(v, eIO(prog(t, x.a - 0.05, x.a + TR)) * (1 - eIO(prog(t, x.b - TR + 0.05, x.b + 0.05)))); });
  return v;
};
type Lay = {brand: number; chip: number; serif: number; cta: number; sub: number; p: number};
const LAY: Record<string, Lay> = {
  P: {brand: 1100, chip: 1360, serif: 1100, cta: 1380, sub: 1560, p: 1},
  S: {brand: 1640, chip: 1250, serif: 1640, cta: 1640, sub: PANEL - 62, p: 0},
  F: {brand: 210, chip: 1330, serif: 210, cta: 1330, sub: 1560, p: 0},
};
const layAt = (t: number): Lay => {
  const i = modeIdx(t);
  const cur = LAY[MODES[i].m];
  const prev = i > 0 ? LAY[MODES[i - 1].m] : cur;
  const k = eIO(prog(t, MODES[i].a, MODES[i].a + TR));
  const o: any = {};
  (Object.keys(cur) as (keyof Lay)[]).forEach((key) => { o[key] = lerp(prev[key], cur[key], k); });
  return o as Lay;
};

/* ------------------------------------------------------------------ farmacista */

const panelH = (sp: number) => lerp(H + 60, PANEL, sp);
const wavePts = (t: number, sp: number) => {
  const pts: string[] = [];
  const amp = sp;
  for (let x = 0; x <= W; x += 18) pts.push(`${x}px ${panelH(sp) + (Math.sin(x / 150 + t * 0.9) * 14 + Math.sin(x / 63 - t * 1.3) * 5) * amp}px`);
  return pts;
};
const Presenter: React.FC<{t: number; sp: number}> = ({t, sp}) => {
  const pts = wavePts(t, sp);
  const poly = `polygon(0px 0px, ${W}px 0px, ${[...pts].reverse().join(', ')})`;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: panelH(sp) + 40, overflow: 'hidden', background: CREAM, clipPath: poly}}>
      <OffthreadVideo src={staticFile('base.mp4')} muted style={{position: 'absolute', left: 0, top: -SRC_Y * sp, width: W, height: H}} />
    </div>
  );
};

// bordo ondulato tra i due pannelli, con filo smeraldo lucido
const Split: React.FC<{t: number; sp: number}> = ({t, sp}) => {
  if (sp < 0.02) return null;
  const pts = wavePts(t, sp);
  const d = 'M ' + pts.map((p) => p.replace(/px/g, '')).join(' L ');
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', opacity: clamp(sp * 3)}}>
      <defs>
        <linearGradient id="emw" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={TEAL} />
          <stop offset="0.5" stopColor={LIME} />
          <stop offset="1" stopColor={EMERALD} />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="rgba(20,56,46,0.25)" strokeWidth={22} transform="translate(0 8)" />
      <path d={d} fill="none" stroke="url(#emw)" strokeWidth={14} />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={3} transform="translate(0 -3)" />
    </svg>
  );
};

/* ------------------------------------------------------------------ sfondo vetro/smeraldo (stile carosello) */

const Bubble: React.FC<{x: number; y: number; r: number; t: number; ph: number}> = ({x, y, r, t, ph}) => (
  <div style={{position: 'absolute', left: x + Math.sin(t * 0.6 + ph) * 26 - r, top: y + Math.cos(t * 0.5 + ph) * 22 - r, width: r * 2, height: r * 2, borderRadius: '50%',
    background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 22%, rgba(168,213,163,0.22) 60%, rgba(45,155,118,0.22) 100%)',
    boxShadow: 'inset -6px -10px 22px rgba(255,255,255,0.5), 0 10px 30px rgba(20,56,46,0.12)', border: '1.5px solid rgba(255,255,255,0.6)'}} />
);

const GlassBG: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 20%, #ffffff 0%, ${CREAM} 45%, ${SAGE} 100%)`}}>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <path d={`M -100 ${H - 500} C 300 ${H - 760} 700 ${H - 140} 1200 ${H - 520} L 1200 ${H + 100} L -100 ${H + 100} Z`} fill={EMERALD} opacity={0.9} />
      <path d={`M -100 ${H - 380} C 380 ${H - 600} 760 ${H - 60} 1200 ${H - 330} L 1200 ${H + 100} L -100 ${H + 100} Z`} fill={TEAL} opacity={0.5} />
      <path d={`M -100 ${H - 260} C 360 ${H - 440} 780 ${H + 20} 1200 ${H - 200} L 1200 ${H + 100} L -100 ${H + 100} Z`} fill={WHITE} opacity={0.7} />
    </svg>
    <Bubble x={160} y={1350} r={70} t={t} ph={0} />
    <Bubble x={930} y={1250} r={110} t={t} ph={2} />
    <Bubble x={800} y={1640} r={54} t={t} ph={4} />
    <Bubble x={250} y={1700} r={92} t={t} ph={1} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ media 3D (verticali veri, sempre animati) */

const clipRate = (a: number, b: number) => clamp(5.04 / (b - a + 0.3), 0.45, 1.25);

const Drift: React.FC<{t: number}> = ({t}) => (
  <>
    {Array.from({length: 11}).map((_, k) => {
      const r = 16 + ((k * 37) % 46);
      const sp = 40 + (k % 4) * 22;
      const y = 2050 - ((t * sp + k * 230) % 2250);
      const x = 40 + ((k * 173) % 1000) + Math.sin(t * 0.9 + k) * 26;
      return (
        <div key={k} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', opacity: 0.85,
          background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 24%, rgba(168,213,163,0.18) 62%, rgba(45,155,118,0.22) 100%)',
          border: '1.5px solid rgba(255,255,255,0.65)', boxShadow: 'inset -4px -6px 14px rgba(255,255,255,0.45)'}} />
      );
    })}
  </>
);

const MediaLayer: React.FC<{x: Mode; t: number; style: React.CSSProperties; kb?: number}> = ({x, t, style, kb = 0.1}) => {
  const p = prog(t, x.a, x.b);
  const sway = Math.sin(t * 0.5) * 0.7;
  const sweep = ((t * 0.18) % 1.6) - 0.3;
  return (
    <div style={{position: 'absolute', overflow: 'hidden', ...style}}>
      <Img src={staticFile(`ai/${x.clip}.jpg`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + p * kb}) rotate(${sway}deg) translate(${Math.sin(t * 0.35) * 16}px, ${(p - 0.5) * -40}px)`}} />
      {!x.still && (
        <Sequence from={Math.round((x.a - 0.1) * FPS)} layout="none">
          <OffthreadVideo src={staticFile(`ai/${x.clip}.mp4`)} muted playbackRate={clipRate(x.a, x.b)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
        </Sequence>
      )}
      <Drift t={t} />
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0) ${sweep * 100 - 14}%, rgba(255,255,255,0.28) ${sweep * 100}%, rgba(255,255,255,0) ${sweep * 100 + 14}%)`, mixBlendMode: 'soft-light'}} />
    </div>
  );
};

// split: oggetto 3D fluttuante nel pannello basso, bordi sfumati nel fondo vetro
const SMedia: React.FC<{x: Mode; t: number; sp: number}> = ({x, t, sp}) => {
  if (t < x.a - 0.1 || t > x.b + 0.1) return null;
  const top = panelH(sp) - 6;
  const sc = 0.62, iw = W * sc, ih = H * sc;
  const iy = 1450 - ih / 2 + (x.dy ?? 0); // il soggetto sta a y≈1450
  return (
    <div style={{position: 'absolute', left: 0, top, width: W, height: H - top, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: (W - iw) / 2, top: iy - top, width: iw, height: ih,
        WebkitMaskImage: 'radial-gradient(ellipse 52% 50% at 50% 50%, #000 62%, transparent 100%)', maskImage: 'radial-gradient(ellipse 52% 50% at 50% 50%, #000 62%, transparent 100%)'}}>
        <MediaLayer x={x} t={t} style={{inset: 0}} kb={0.08} />
      </div>
    </div>
  );
};

// insert a tutto schermo (verticale), apertura/chiusura a cerchio con anello lime
const FMedia: React.FC<{x: Mode; t: number}> = ({x, t}) => {
  if (t < x.a - 0.12 || t > x.b + 0.12) return null;
  const r = 1750 * Math.min(eIO(prog(t, x.a - 0.1, x.a + TR)), 1 - eIO(prog(t, x.b - TR + 0.1, x.b + 0.1)));
  if (r < 3) return null;
  const cy = 960;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, clipPath: `circle(${r}px at 540px ${cy}px)`}}>
        <MediaLayer x={x} t={t} style={{inset: 0}} kb={0.12} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(244,241,236,0.55) 0%, rgba(244,241,236,0) 22%, rgba(244,241,236,0) 70%, rgba(244,241,236,0.6) 100%)'}} />
      </div>
      {r < 1700 && <div style={{position: 'absolute', left: 540 - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `14px solid ${LIME}`, boxShadow: '0 0 40px rgba(155,200,75,0.7)', boxSizing: 'border-box'}} />}
    </>
  );
};

/* ------------------------------------------------------------------ testi e chip (brand Michelangelo) */

type Ln = {text: string; hi?: boolean; size?: number};

// riga di titolo: parola chiave in box lime, altrimenti smeraldo scuro con testo bianco
const Title: React.FC<{t: number; a: number; b: number; lines: Ln[]; y: number; stag?: number}> = ({t, a, b, lines, y, stag = 0.14}) => {
  if (t < a - 0.05 || t > b) return null;
  const out = eO3(prog(t, b - 0.22, b));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      {lines.map((l, i) => {
        const p = prog(t, a + i * stag, a + i * stag + 0.6);
        const s = soft(p * 1.6);
        return (
          <div key={i} style={{overflow: 'hidden', padding: '2px 4px', borderRadius: 16}}>
            <div style={{
              fontFamily: ANTON, fontSize: l.size ?? 82, lineHeight: 1.04, textTransform: 'uppercase', letterSpacing: '0.005em',
              color: l.hi ? FOREST : WHITE, background: l.hi ? LIME : EMERALD, padding: '8px 24px 10px', borderRadius: 14,
              boxShadow: '0 12px 34px rgba(20,56,46,0.28)',
              transform: `translateY(${(1 - s) * 110 + out * -40}%)`, opacity: clamp(p * 3) * (1 - out),
            }}>
              {l.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// titolo serif scuro (come "Sistema immunitario lavoriamo di squadra" del carosello)
const Serif: React.FC<{t: number; a: number; b: number; lines: Ln[]; y: number; stag?: number; lt?: number}> = ({t, a, b, lines, y, stag = 0.18, lt = 0}) => {
  if (t < a - 0.05 || t > b) return null;
  const out = eO3(prog(t, b - 0.22, b));
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {lines.map((l, i) => {
        const p = prog(t, a + i * stag, a + i * stag + 0.7);
        const s = soft(p * 1.6);
        return (
          <div key={i} style={{overflow: 'hidden', padding: '0 6px'}}>
            <div style={{
              fontFamily: SERIF, fontWeight: 700, fontStyle: l.hi ? 'italic' : 'normal', fontSize: l.size ?? 104, lineHeight: 1.0, letterSpacing: '-0.01em', textTransform: l.hi ? 'none' : 'uppercase',
              color: lt > 0.5 ? (l.hi ? LIME : WHITE) : (l.hi ? EMERALD : FOREST), textShadow: lt > 0.5 ? '0 3px 18px rgba(10,40,30,0.85), 0 0 3px rgba(10,40,30,0.8)' : '0 2px 22px rgba(255,255,255,0.9)', textAlign: 'center',
              transform: `translateY(${(1 - s) * 110 + out * -40}%)`, opacity: clamp(p * 3) * (1 - out),
            }}>
              {l.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Icon: React.FC<{name: string; c: string; s?: number}> = ({name, c, s = 40}) => {
  const st = {fill: 'none', stroke: c, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const P: Record<string, React.ReactNode> = {
    drop: <path {...st} d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z" />,
    sparkle: <path {...st} d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 3v4M17 5h4" />,
    check: <path {...st} d="M5 12l5 5 9-10" />,
    shield: <path {...st} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
    flask: <path {...st} d="M9 3h6M10 3v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3" />,
    mountain: <path {...st} d="M3 20l6-11 4 6 3-4 5 9z" />,
    leaf: <path {...st} d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l7-7" />,
    heart: <path {...st} d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" />,
    user: <><circle {...st} cx="12" cy="8" r="4" /><path {...st} d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
    mix: <path {...st} d="M4 7h4l8 10h4M4 17h4l3-4M13 11l3-4h4M18 5l2 2-2 2M18 15l2 2-2 2" />,
    moon: <path {...st} d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />,
    apple: <path {...st} d="M12 7c-3-2-7 0-7 5 0 4 3 8 5 8 1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 5-4 5-8 0-5-4-7-7-5zM12 7c0-2 1-3 3-4" />,
    arrow: <path {...st} d="M5 12h14M13 6l6 6-6 6" />,
    phone: <path {...st} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
    clock: <><circle {...st} cx="12" cy="12" r="9" /><path {...st} d="M12 7v5l3 3" /></>,
    wallet: <path {...st} d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l12-3v3M17 14h2" />,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24">{P[name]}</svg>;
};

const Chip: React.FC<{t: number; a: number; b: number; text: string; icon: string; size?: number; hi?: boolean}> = ({t, a, b, text, icon, size = 36, hi}) => {
  if (t < a || t > b) return null;
  const p = prog(t, a, a + 0.5), s = soft(p * 1.6);
  const out = eO3(prog(t, b - 0.2, b));
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px 10px 10px', borderRadius: 999, background: hi ? LIME : WHITE, boxShadow: '0 10px 28px rgba(20,56,46,0.26)',
      fontFamily: MONT, fontWeight: 800, fontSize: size, color: FOREST, textTransform: 'uppercase', whiteSpace: 'nowrap',
      transform: `translateY(${(1 - s) * 40 + out * 20}px) scale(${lerp(0.7, 1, s)})`, opacity: clamp(p * 4) * (1 - out)}}>
      <div style={{width: size * 1.5, height: size * 1.5, borderRadius: 99, background: hi ? FOREST : TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={icon} c={WHITE} s={size * 0.95} />
      </div>
      {text}
    </div>
  );
};

// una chip alla volta: resta fino all'arrivo della successiva
const ChipSeq: React.FC<{t: number; end: number; y?: number; items: {a: number; text: string; icon: string; hi?: boolean; size?: number}[]}> = ({t, end, y = 1385, items}) => {
  const k = items.findIndex((x, i) => t >= x.a - 0.05 && t < (items[i + 1] ? items[i + 1].a - 0.05 : end));
  if (k < 0) return null;
  const it = items[k];
  const nxt = items[k + 1] ? items[k + 1].a - 0.05 : end;
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: y, display: 'flex', justifyContent: 'center'}}>
      <Chip t={t} a={it.a - 0.05} b={nxt} text={it.text} icon={it.icon} size={it.size ?? 40} hi={it.hi} />
    </div>
  );
};

const Row: React.FC<{y: number; gap?: number; children: React.ReactNode; wrap?: boolean}> = ({y, gap = 14, children, wrap}) => (
  <div style={{position: 'absolute', left: 40, right: 40, top: y, display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: 'center', gap}}>{children}</div>
);

const Cta: React.FC<{t: number; a: number; b: number; text: string; y: number; size?: number; icon?: string}> = ({t, a, b, text, y, size = 44, icon = 'arrow'}) => {
  if (t < a || t > b) return null;
  const p = prog(t, a, a + 0.6), s = soft(p * 1.6);
  const out = eO3(prog(t, b - 0.2, b));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: clamp(p * 4) * (1 - out)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '18px 18px 18px 40px', borderRadius: 999, background: `linear-gradient(135deg, ${EMERALD}, ${TEAL_D})`, boxShadow: '0 18px 40px rgba(20,56,46,0.38)',
        fontFamily: MONT, fontWeight: 700, fontSize: size, color: WHITE, transform: `scale(${lerp(0.75, 1, s)})`, border: '2px solid rgba(255,255,255,0.35)'}}>
        {text}
        <div style={{width: size * 1.55, height: size * 1.55, borderRadius: 99, background: LIME, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon name={icon} c={FOREST} s={size * 0.9} />
        </div>
      </div>
    </div>
  );
};

const Corner: React.FC = () => (
  <div style={{position: 'absolute', right: 44, top: 70, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px 10px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.94)', boxShadow: '0 8px 24px rgba(20,56,46,0.18)'}}>
    <Img src={staticFile('logo/mark.png')} style={{width: 56, height: 52}} />
    <Img src={staticFile('logo/wordmark.png')} style={{width: 150, height: 40}} />
  </div>
);

// nome brand + soprannome (stile carosello: "MIAMO · LA SOFISTICATA")
const Brand: React.FC<{t: number; a: number; b: number; name: string; nick: string; size?: number; y: number; lt?: number}> = ({t, a, b, name, nick, size = 128, y, lt = 0}) => {
  if (t < a - 0.05 || t > b) return null;
  const p = prog(t, a, a + 0.7), s = soft(p * 1.6);
  const p2 = prog(t, a + 0.25, a + 0.9), s2 = soft(p2 * 1.6);
  const out = eO3(prog(t, b - 0.25, b));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 1 - out, transform: `translateY(${-out * 30}px)`}}>
      <div style={{overflow: 'hidden', padding: '0 12px'}}>
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: size, lineHeight: 1.0, letterSpacing: '-0.02em', color: lt > 0.5 ? WHITE : FOREST, textTransform: 'uppercase', textShadow: lt > 0.5 ? '0 3px 18px rgba(10,40,30,0.85), 0 0 3px rgba(10,40,30,0.8)' : '0 2px 24px rgba(255,255,255,0.95)', transform: `translateY(${(1 - s) * 105}%)`}}>{name}</div>
      </div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 68, lineHeight: 1.0, color: lt > 0.5 ? LIME : EMERALD, textShadow: lt > 0.5 ? '0 3px 18px rgba(10,40,30,0.85)' : '0 2px 22px rgba(255,255,255,0.95)', opacity: clamp(p2 * 3), transform: `translateY(${(1 - s2) * 30}px)`}}>
        {nick}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ sottotitoli parola per parola */

type SW = {t: number; w: string; k: number};
const SUBW: SW[] = (WORDS as [number, string, number][]).map(([t, ww, k]) => ({t, w: ww === '4' ? 'quattro' : ww, k}));
type Chunk = {a: number; b: number; words: SW[]};
const CHUNKS: Chunk[] = (() => {
  const res: Chunk[] = [];
  let cur: SW[] = [];
  const flush = () => {
    if (!cur.length) return;
    res.push({a: cur[0].t - 0.05, b: 0, words: cur});
    cur = [];
  };
  SUBW.forEach((x) => {
    const prev = cur[cur.length - 1];
    const len = cur.reduce((n, y) => n + y.w.length + 1, 0);
    if (prev && (cur.length >= 4 || len + x.w.length > 22 || x.k !== prev.k || x.t - prev.t > 0.9)) flush();
    cur.push(x);
  });
  flush();
  res.forEach((c, i) => {
    const last = c.words[c.words.length - 1];
    const next = res[i + 1];
    c.b = Math.min(last.t + 0.6, next ? next.a + 0.02 : 1e9) + 0.08;
  });
  return res;
})();

const Subs: React.FC<{t: number; y: number}> = ({t, y}) => {
  const c = CHUNKS.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const p = eO3(prog(t, c.a, c.a + 0.1));
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 10px', opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>
      {c.words.map((x, i) => {
        const nxt = c.words[i + 1];
        const on = t >= x.t - 0.02 && (!nxt || t < nxt.t - 0.02);
        return (
          <div key={i} style={{
            fontFamily: ANTON, fontSize: 70, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '0.01em', padding: '6px 20px 9px', borderRadius: 16,
            background: on ? LIME : 'rgba(15,107,78,0.92)', color: on ? FOREST : WHITE, boxShadow: '0 8px 22px rgba(20,56,46,0.28)', transform: `scale(${on ? 1.07 : 1})`,
          }}>
            {x.w}
          </div>
        );
      })}
    </div>
  );
};

/* batteria animata (motion graphic nativo): si scarica sul "senza energie" */
const BatteryChip: React.FC<{t: number; a: number; b: number; y: number}> = ({t, a, b, y}) => {
  if (t < a || t > b) return null;
  const p = prog(t, a, a + 0.5), s = soft(p * 1.6);
  const out = eO3(prog(t, b - 0.25, b));
  const lvl = lerp(0.82, 0.1, eIO(prog(t, a + 0.3, b - 0.4)));
  const warn = lvl < 0.3 && Math.floor(t * 3) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: clamp(p * 4) * (1 - out), transform: `translateY(${(1 - s) * 40}px) scale(${lerp(0.8, 1, s)})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 26px', borderRadius: 999, background: WHITE, boxShadow: '0 10px 28px rgba(20,56,46,0.28)'}}>
        <div style={{position: 'relative', width: 300, height: 74, border: `7px solid ${FOREST}`, borderRadius: 18, padding: 6, boxSizing: 'border-box'}}>
          <div style={{width: `${lvl * 100}%`, height: '100%', borderRadius: 9, background: lvl > 0.3 ? `linear-gradient(90deg, ${TEAL}, ${LIME})` : '#E0A93B', opacity: warn ? 0.45 : 1}} />
          <div style={{position: 'absolute', right: -22, top: 18, width: 12, height: 26, borderRadius: 4, background: FOREST}} />
        </div>
        <div style={{fontFamily: ANTON, fontSize: 52, color: FOREST, width: 110, textAlign: 'right'}}>{Math.round(lvl * 100)}%</div>
      </div>
    </div>
  );
};

const Texts: React.FC<{t: number; L: Lay}> = ({t, L}) => {
  const lt = L.p;
  return (
    <>
      {/* hook */}
      <Serif t={t} a={0.15} b={5.5} y={L.serif} lt={lt} lines={[{text: 'Senza energie', size: 104}, {text: 'a fine giornata?', hi: true, size: 84}]} stag={0.3} />
      <BatteryChip t={t} a={0.6} b={5.55} y={L.chip + 20} />
      {/* stanchezza */}
      <Serif t={t} a={5.7} b={9.1} y={L.serif} lt={lt} lines={[{text: 'Questa stanchezza', size: 84}, {text: 'non è solo tua', hi: true, size: 84}]} stag={0.3} />
      <ChipSeq t={t} y={L.chip} end={9.1} items={[{a: w('anche') - 0.1, text: 'anche il sistema immunitario', icon: 'shield', hi: true, size: 34}]} />
      {/* difese */}
      <Serif t={t} a={9.5} b={14.9} y={L.serif} lt={lt} lines={[{text: 'Il sistema immunitario', size: 76}, {text: 'lavora per proteggerti', hi: true, size: 66}]} stag={0.3} />
      {/* virus */}
      <Serif t={t} a={15.2} b={19.1} y={L.serif} lt={lt} lines={[{text: 'Messo alla prova', size: 92}, {text: 'non solo da virus', hi: true, size: 84}]} stag={0.3} />
      <ChipSeq t={t} y={L.chip} end={19.1} items={[
        {a: w('virus') - 0.1, text: 'virus', icon: 'shield'},
        {a: w('batteri') - 0.1, text: 'batteri', icon: 'flask'},
        {a: w('malanni') - 0.1, text: 'malanni stagionali', icon: 'drop', hi: true},
      ]} />
      {/* stili di vita */}
      <Serif t={t} a={19.5} b={23.0} y={L.serif} lt={lt} lines={[{text: 'Anche le abitudini', size: 84}, {text: 'pesano', hi: true, size: 104}]} stag={0.3} />
      <ChipSeq t={t} y={L.chip} end={27.3} items={[
        {a: w('fumo') - 0.1, text: 'fumo', icon: 'flask'},
        {a: w('alcol') - 0.1, text: 'alcol', icon: 'drop'},
        {a: w('sedentarietà') - 0.1, text: 'sedentarietà', icon: 'clock'},
        {a: w('alimentazione') - 0.1, text: 'alimentazione disordinata', icon: 'apple', hi: true, size: 34},
      ]} />
      {/* difese sotto pressione */}
      <Brand t={t} a={27.5} b={32.4} name="Le difese" nick="sotto pressione" size={104} y={L.brand} lt={lt} />
      <ChipSeq t={t} y={L.chip} end={32.4} items={[{a: w('difese') - 0.1, text: 'difese immunitarie', icon: 'shield', hi: true}]} />
      {/* cambiare */}
      <Serif t={t} a={32.5} b={35.3} y={L.serif} lt={lt} lines={[{text: 'Cambiare stile di vita', size: 70}, {text: 'è difficile', hi: true, size: 96}]} stag={0.3} />
      {/* una cosa per volta */}
      <Brand t={t} a={35.5} b={43.1} name="Un passo" nick="per volta" size={104} y={L.brand} lt={lt} />
      <ChipSeq t={t} y={L.chip} end={43.1} items={[
        {a: w('semplice') - 0.1, text: 'una cosa per volta', icon: 'check'},
        {a: w('sonno') - 0.1, text: 'più sonno', icon: 'moon'},
        {a: w('frutta') - 0.1, text: 'frutta e verdura', icon: 'apple'},
        {a: w('muoversi') - 0.1, text: 'più movimento', icon: 'heart', hi: true},
      ]} />
      {/* un'altra possibilità */}
      <Serif t={t} a={43.4} b={47.9} y={L.serif} lt={lt} lines={[{text: 'C’è anche', size: 92}, {text: 'un’altra possibilità', hi: true, size: 80}]} stag={0.3} />
      <Cta t={t} a={w('puoi') - 0.1} b={w('vieni') - 0.2} text="Passa a trovarci" y={L.cta} size={56} />
      <Serif t={t} a={w('vieni') - 0.1} b={54.7} y={L.serif} lt={lt} lines={[{text: 'Vieni a parlarne', size: 92}, {text: 'con noi', hi: true, size: 104}]} stag={0.3} />
      {/* squadra */}
      <Serif t={t} a={54.9} b={SPEECH_END + 0.3} y={L.serif} lt={lt} lines={[{text: 'Lavoriamo', size: 96}, {text: 'di squadra', hi: true, size: 110}]} stag={0.3} />
      <ChipSeq t={t} y={L.chip} end={SPEECH_END + 0.3} items={[{a: w('aiutare') - 0.1, text: 'il tuo sistema lavora per te', icon: 'heart', hi: true, size: 34}]} />
    </>
  );
};

/* ------------------------------------------------------------------ chiusura */

const End: React.FC<{t: number}> = ({t}) => {
  const lt = t - SPEECH_END;
  const wv = eO5(prog(lt, 0.5, 1.0)), pay = eO5(prog(lt, 0.8, 1.3)), ad = eO5(prog(lt, 1.7, 2.3));
  return (
    <AbsoluteFill>
      <GlassBG t={t} />
      <div style={{position: 'absolute', left: 0, top: 150, width: W, height: 560}}>
        <Logo3D lt={lt} w={W} h={560} />
      </div>
      <Img src={staticFile('logo/wordmark.png')} style={{position: 'absolute', left: 190, top: 720, width: 700, height: 186, opacity: wv, transform: `translateY(${(1 - wv) * 40}px)`}} />
      <div style={{position: 'absolute', left: 30, right: 30, top: 940, textAlign: 'center', opacity: pay, transform: `translateY(${(1 - pay) * 30}px)`}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 78, lineHeight: 1.0, color: FOREST, textTransform: 'uppercase'}}>Sistema immunitario</div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontStyle: 'italic', fontSize: 66, lineHeight: 1.05, color: EMERALD}}>lavoriamo di squadra</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1330, opacity: ad}}>
        <Cta t={SPEECH_END + 99} a={SPEECH_END} b={SPEECH_END + 999} text="Vieni a trovarci" y={0} size={34} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1490, textAlign: 'center', fontFamily: MONT, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: WHITE, lineHeight: 1.6, opacity: ad}}>
        VIALE MICHELANGELO 13 · FOGGIA<br />0881 636803 · WhatsApp 366 871 4028
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ montaggio */

const Scene: React.FC<{t: number}> = ({t}) => {
  if (t >= SPEECH_END - 0.05) return <End t={t} />;
  const sp = splitAmt(t);
  const L = layAt(t);
  return (
    <AbsoluteFill style={{background: CREAM}}>
      <GlassBG t={t} />
      {MODES.filter((x) => x.m === 'S').map((x, i) => <SMedia key={i} x={x} t={t} sp={sp} />)}
      <Presenter t={t} sp={sp} />
      <div style={{position: 'absolute', left: 0, top: 980, width: W, height: 800, background: 'linear-gradient(180deg, rgba(10,40,30,0) 0%, rgba(10,40,30,0.55) 45%, rgba(10,40,30,0.55) 75%, rgba(10,40,30,0) 100%)', opacity: L.p}} />
      <Split t={t} sp={sp} />
      {MODES.filter((x) => x.m === 'F').map((x, i) => <FMedia key={i} x={x} t={t} />)}
      <Texts t={t} L={L} />
      <Corner />
    </AbsoluteFill>
  );
};

export const Movie: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <Scene t={t} />
      {t < SPEECH_END - 0.05 && <Subs t={t} y={layAt(t).sub} />}
    </AbsoluteFill>
  );
};
