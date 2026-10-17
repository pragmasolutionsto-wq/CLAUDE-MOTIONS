import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {
  B, bez, clamp, eBack, eExpo, eI3, eIO, eO3, eO4, eO5, FPS, H, ICE, INK, lerp, NAVY, NAVY2, Pt, prog, rnd, SC,
  TEAL, TEAL_D, TEAL_HI, W, WHITE,
} from './util';

const ANTON = "'Anton', 'Impact', sans-serif";
const MAN = "'Manrope', 'Helvetica Neue', sans-serif";
const LW = 726;
const LH = 707;
const LOGO = () => staticFile('logo.png');
const maskLogo: React.CSSProperties = {
  WebkitMaskImage: `url(${staticFile('logo.png')})`,
  WebkitMaskSize: '100% 100%',
  maskImage: `url(${staticFile('logo.png')})`,
  maskSize: '100% 100%',
};

/* ------------------------------------------------------------------ pezzi comuni */

const Dust: React.FC<{t: number; n?: number; seed?: number; color?: string; speed?: number}> = ({
  t, n = 50, seed = 3, color = TEAL, speed = 1,
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

const Bokeh: React.FC<{t: number; n?: number; seed?: number}> = ({t, n = 14, seed = 11}) => {
  const r = rnd(seed);
  const items = [];
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * H, s = 60 + r() * 220, vx = (r() - 0.5) * 40, vy = (r() - 0.5) * 30, o = 0.05 + r() * 0.12;
    items.push(
      <div key={i} style={{position: 'absolute', left: x + vx * t - s / 2, top: y + vy * t - s / 2, width: s, height: s, borderRadius: s, background: TEAL, opacity: o, filter: 'blur(14px)'}} />
    );
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

const Glow: React.FC<{x?: number; y?: number; r?: number; c?: string; o?: number}> = ({x = 960, y = 540, r = 800, c = TEAL, o = 0.5}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: `radial-gradient(circle, ${c} 0%, transparent 68%)`, opacity: o}} />
);

const Streaks: React.FC<{lt: number; seed: number; color: string}> = ({lt, seed, color}) => {
  const r = rnd(seed);
  const items = [];
  for (let i = 0; i < 12; i++) {
    const y = r() * H, len = 300 + r() * 900, d = r() * 0.12, th = 2 + r() * 4;
    const p = prog(lt, d, d + 0.34);
    if (p <= 0 || p >= 1) continue;
    const x = lerp(-len, W + len, eO3(p)) * (i % 2 ? 1 : -1) + (i % 2 ? 0 : W);
    items.push(<div key={i} style={{position: 'absolute', left: x - len / 2, top: y, width: len, height: th, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.8 * (1 - p)}} />);
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

const Letters: React.FC<{
  text: string; lt: number; delay?: number; stag?: number; dur?: number; mode: 'rise' | 'flip'; style?: React.CSSProperties;
}> = ({text, lt, delay = 0, stag = 0.03, dur = 0.42, mode, style}) => (
  <div style={{display: 'flex', justifyContent: 'center', whiteSpace: 'pre', perspective: 1400, ...style}}>
    {text.split('').map((ch, i) => {
      const p = prog(lt, delay + i * stag, delay + i * stag + dur);
      if (mode === 'rise') {
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', lineHeight: 1.05, paddingBottom: '0.06em'}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - eO5(p)) * 115}%)`}}>{ch === ' ' ? ' ' : ch}</span>
          </span>
        );
      }
      return (
        <span key={i} style={{display: 'inline-block', transform: `rotateX(${(1 - eO4(p)) * -95}deg) translateY(${(1 - eO4(p)) * 40}px)`, opacity: p > 0 ? 1 : 0, transformOrigin: '50% 100%'}}>
          {ch === ' ' ? ' ' : ch}
        </span>
      );
    })}
  </div>
);

const Caption: React.FC<{text: string; lt: number; delay?: number; color?: string; size?: number; style?: React.CSSProperties}> = ({
  text, lt, delay = 0.12, color = WHITE, size = 34, style,
}) => {
  const p = eO4(prog(lt, delay, delay + 0.25));
  return (
    <div style={{fontFamily: MAN, fontWeight: 700, fontSize: size, letterSpacing: '0.28em', textTransform: 'uppercase', color, opacity: p, transform: `translateY(${(1 - p) * 24}px)`, textAlign: 'center', ...style}}>
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ SCENA 1 — macro logo */

const S1: React.FC<{lt: number}> = ({lt}) => {
  const e = eExpo(prog(lt, 0, 1.9));
  const base = 600 / LH;
  const S = base * Math.exp(Math.log(5.2) * (1 - e));
  const fx = lerp(478, 363, e), fy = lerp(70, 340, e);
  const blur = (1 - prog(lt, 0, 0.55)) * 16;
  const shine = lerp(-30, 125, prog(lt, 0.55, 1.55));
  const glow = 0.35 + 0.35 * prog(lt, 0, 1.8);
  const cx = 960, cy = 505;
  const tag = eO4(prog(lt, 1.25, 1.65));
  const streaks = [0.08, 0.3, 0.52].map((d, i) => {
    const p = prog(lt, d, d + 0.28);
    return p > 0 && p < 1 ? (
      <div key={i} style={{position: 'absolute', left: lerp(-900, W, eO3(p)), top: 220 + i * 290, width: 900, height: 4 - i, background: `linear-gradient(90deg, transparent, ${TEAL_HI}, transparent)`, opacity: 0.9}} />
    ) : null;
  });
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 48%, #0E3A5C 0%, ${NAVY} 45%, ${INK} 100%)`}}>
      <Glow x={960} y={500} r={900} o={glow} />
      <Bokeh t={lt} seed={5} />
      <Dust t={lt} n={70} seed={9} />
      <div style={{position: 'absolute', left: 0, top: 0, width: LW, height: LH, transformOrigin: '0 0', transform: `translate(${cx}px, ${cy}px) scale(${S}) translate(${-fx}px, ${-fy}px)`, filter: `blur(${blur}px) drop-shadow(0 0 40px rgba(92,202,212,0.45))`}}>
        <Img src={LOGO()} style={{width: LW, height: LH, display: 'block'}} />
        <div style={{position: 'absolute', inset: 0, ...maskLogo, background: `linear-gradient(105deg, transparent ${shine - 10}%, rgba(255,255,255,0.95) ${shine}%, transparent ${shine + 10}%)`}} />
      </div>
      {streaks}
      <div style={{position: 'absolute', left: 0, width: W, top: 880, textAlign: 'center', opacity: tag, transform: `translateY(${(1 - tag) * 20}px)`}}>
        <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 40, letterSpacing: '0.55em', color: WHITE, paddingLeft: '0.55em'}}>PRAGMA SOLUTIONS</div>
        <div style={{fontFamily: MAN, fontWeight: 700, fontSize: 22, letterSpacing: '0.5em', color: TEAL, marginTop: 16, paddingLeft: '0.5em'}}>MOTION SHOWREEL · 2026</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ SCENA 2 — parole cinetiche */

const WORDS = [
  {t: 'STRATEGIA', s: 'Posizionamento · Branding · Funnel'},
  {t: 'ADV', s: 'Meta Ads · Google Ads · Creatività che convertono'},
  {t: 'SEO', s: 'Intent · Struttura · Traffico che converte'},
  {t: 'WEB', s: 'Wix Studio · UX/UI · CRO'},
  {t: 'AUTOMATION', s: 'Make · API · Webhook · Bot'},
  {t: 'AI', s: 'Sistemi su misura · Replicabili'},
];
const PAL = [
  {bg: INK, fg: WHITE, ac: TEAL},
  {bg: TEAL, fg: INK, ac: WHITE},
  {bg: NAVY, fg: WHITE, ac: TEAL},
  {bg: ICE, fg: NAVY, ac: TEAL_D},
  {bg: INK, fg: WHITE, ac: TEAL},
  {bg: NAVY, fg: WHITE, ac: TEAL},
];

const S2: React.FC<{lt: number}> = ({lt}) => {
  const k = clamp(Math.floor(lt / B), 0, 5);
  const wl = lt - k * B;
  const w = WORDS[k];
  const pal = PAL[k];
  const fs = Math.min(640, 1560 / (w.t.length * 0.54));
  const common: React.CSSProperties = {fontFamily: ANTON, fontSize: fs, color: pal.fg, lineHeight: 1, textTransform: 'uppercase'};
  let word: React.ReactNode;
  if (k === 0) {
    word = <Letters text={w.t} lt={wl} mode="rise" stag={0.035} dur={0.4} style={common} />;
  } else if (k === 1) {
    const p = eO5(prog(wl, 0, 0.2));
    const sh = Math.sin(wl * 110) * Math.exp(-wl * 26) * 22;
    word = (
      <div style={{...common, textAlign: 'center', transform: `translateX(${sh}px) scale(${lerp(3.6, 1, p)})`, opacity: prog(wl, 0, 0.04), WebkitTextStroke: wl < 0.2 ? `4px ${pal.fg}` : '0', color: wl < 0.2 ? 'transparent' : pal.fg}}>
        {w.t}
      </div>
    );
  } else if (k === 2) {
    word = <Letters text={w.t} lt={wl} mode="flip" stag={0.05} dur={0.38} style={common} />;
  } else if (k === 3) {
    const p = eO5(prog(wl, 0, 0.3));
    const x = (1 - p) * 1500;
    word = (
      <div style={{position: 'relative', ...common, textAlign: 'center'}}>
        <div style={{clipPath: 'inset(0 0 50% 0)', transform: `translateX(${-x}px)`}}>{w.t}</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, clipPath: 'inset(50% 0 0 0)', transform: `translateX(${x}px)`, color: pal.ac}}>{w.t}</div>
      </div>
    );
  } else if (k === 4) {
    const p = eO4(prog(wl, 0, 0.38));
    word = (
      <div style={{...common, textAlign: 'center', letterSpacing: `${lerp(0.25, 0.01, p)}em`, filter: `blur(${(1 - p) * 20}px)`, opacity: clamp(p * 3), paddingLeft: `${lerp(0.25, 0.01, p)}em`}}>
        {w.t}
      </div>
    );
  } else {
    const p = eBack(prog(wl, 0, 0.32), 2.2);
    const o = prog(wl, 0, 0.03);
    word = (
      <div style={{...common, textAlign: 'center', transform: `scale(${lerp(0.1, 1, p)}) rotate(${(1 - p) * -14}deg)`, opacity: o, fontSize: 760}}>
        {w.t}
      </div>
    );
  }
  const rings = k === 5
    ? [0, 0.12, 0.24].map((d, i) => {
        const p = prog(wl, d, d + 0.7);
        return (
          <div key={i} style={{position: 'absolute', left: 960 - 900 * eO4(p), top: 540 - 900 * eO4(p), width: 1800 * eO4(p), height: 1800 * eO4(p), borderRadius: 2000, border: `${14 - i * 4}px solid ${TEAL}`, opacity: (1 - p) * 0.9}} />
        );
      })
    : null;
  const flash = 0.2 * (1 - prog(wl, 0, 0.09)) * (lt < 0 ? 0 : 1);
  const ghostX = lerp(60, -140, prog(wl, 0, 0.5));
  return (
    <AbsoluteFill style={{background: pal.bg}}>
      {k !== 3 && k !== 1 && <Glow x={960} y={560} r={900} c={pal.ac} o={0.18} />}
      <div style={{position: 'absolute', left: ghostX, top: 40, fontFamily: ANTON, fontSize: 560, lineHeight: 1, color: 'transparent', WebkitTextStroke: `2px ${pal.fg}`, opacity: 0.12}}>
        {String(k + 1).padStart(2, '0')}
      </div>
      {k !== 3 && <Dust t={lt} n={30} seed={20 + k} color={pal.ac} />}
      {rings}
      <Streaks lt={wl} seed={100 + k} color={pal.ac} />
      <div style={{position: 'absolute', left: 0, top: 500 - fs * 0.5, width: W, display: 'flex', justifyContent: 'center', alignItems: 'center', height: fs}}>{word}</div>
      <Caption text={w.s} lt={wl} delay={0.14} color={pal.fg} size={32} style={{position: 'absolute', left: 0, width: W, top: 868}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, background: '#fff', opacity: flash, mixBlendMode: 'overlay'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ SCENA 3 — chart isometrico + KPI */

const BAR_VALUES = [0.32, 0.46, 0.4, 0.62, 0.56, 0.8, 1];

const Cuboid: React.FC<{w: number; d: number; h: number}> = ({w, d, h}) => {
  const edge = `1.5px solid ${TEAL_HI}`;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d'}}>
      <div style={{position: 'absolute', left: -w / 2, top: -h, width: w, height: h, transform: `translateZ(${d / 2}px)`, background: `linear-gradient(180deg, rgba(92,202,212,0.95), rgba(27,58,120,0.92))`, border: edge, boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: -d / 2, top: -h, width: d, height: h, transform: `rotateY(90deg) translateZ(${w / 2}px)`, background: `linear-gradient(180deg, rgba(30,143,160,0.95), rgba(13,27,70,0.95))`, border: edge, boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: -w / 2, top: -h - d / 2, width: w, height: d, transform: 'rotateX(90deg)', background: `linear-gradient(135deg, ${TEAL_HI}, ${TEAL})`, border: edge, boxSizing: 'border-box'}} />
    </div>
  );
};

const KpiCard: React.FC<{lt: number; start: number; y: number; label: string; target: number; fmt: (v: number) => string; spark: number[]}> = ({
  lt, start, y, label, target, fmt, spark,
}) => {
  const p = eO4(prog(lt, start, start + 0.45));
  const v = target * eO4(prog(lt, start + 0.1, start + 1.0));
  const dp = prog(lt, start + 0.15, start + 0.9);
  const pts = spark.map((s, i) => `${(i / (spark.length - 1)) * 200},${60 - s * 56}`).join(' ');
  return (
    <div style={{position: 'absolute', left: 1330, top: y, width: 470, height: 200, borderRadius: 28, border: `2px solid rgba(166,243,247,0.55)`, background: 'linear-gradient(135deg, rgba(92,202,212,0.22), rgba(13,27,70,0.55))', backdropFilter: 'blur(10px)', transform: `translateX(${(1 - p) * 420}px)`, opacity: p, boxShadow: '0 20px 60px rgba(0,0,0,0.35), inset 0 0 40px rgba(166,243,247,0.12)', padding: '26px 34px', boxSizing: 'border-box'}}>
      <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 24, letterSpacing: '0.3em', color: TEAL}}>{label}</div>
      <div style={{fontFamily: ANTON, fontSize: 104, color: WHITE, lineHeight: 1.1}}>{fmt(v)}</div>
      <svg width={200} height={64} style={{position: 'absolute', right: 34, bottom: 32}} viewBox="0 0 200 64">
        <polyline points={pts} fill="none" stroke={TEAL_HI} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp} />
      </svg>
    </div>
  );
};

const S3: React.FC<{lt: number}> = ({lt}) => {
  const camZ = -36 + lt * 7;
  const floorGlow = 0.5 + 0.2 * Math.sin(lt * 3);
  const titleP = (a: number) => eO5(prog(lt, a, a + 0.5));
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${INK}, ${NAVY} 70%, #12306A)`}}>
      <Glow x={700} y={640} r={900} o={0.3} />
      <Dust t={lt} n={40} seed={31} />
      <div style={{position: 'absolute', left: 90, top: 80, overflow: 'hidden', height: 150}}>
        <div style={{fontFamily: ANTON, fontSize: 140, color: WHITE, lineHeight: 1.05, transform: `translateY(${(1 - titleP(0.05)) * 150}px)`}}>RISULTATI</div>
      </div>
      <div style={{position: 'absolute', left: 96, top: 232, overflow: 'hidden', height: 60}}>
        <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 30, letterSpacing: '0.35em', color: TEAL, transform: `translateY(${(1 - titleP(0.2)) * 60}px)`}}>CHE SI MISURANO</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, perspective: 2600, perspectiveOrigin: '40% 50%'}}>
        <div style={{position: 'absolute', left: 100, top: 170, width: 1200, height: 800, transformStyle: 'preserve-3d', transform: `rotateX(60deg) rotateZ(${camZ}deg) scale(${lerp(0.7, 0.88, eO3(prog(lt, 0, 1)))})`}}>
          <div style={{position: 'absolute', inset: 0, border: `2px solid ${TEAL}`, background: `repeating-linear-gradient(0deg, rgba(92,202,212,0.35) 0 2px, transparent 2px 80px), repeating-linear-gradient(90deg, rgba(92,202,212,0.35) 0 2px, transparent 2px 80px), rgba(27,58,120,0.28)`, boxShadow: `0 0 120px rgba(92,202,212,${floorGlow})`}} />
          {BAR_VALUES.map((v, i) => {
            const p = eBack(prog(lt, 0.15 + i * 0.1, 0.15 + i * 0.1 + 0.6), 1.9);
            return (
              <div key={i} style={{position: 'absolute', left: 160 + i * 140, top: 420, transformStyle: 'preserve-3d', transform: 'rotateX(-90deg)'}}>
                <Cuboid w={92} d={92} h={Math.max(2, v * 520 * p)} />
              </div>
            );
          })}
        </div>
      </div>
      <KpiCard lt={lt} start={0.5} y={330} label="ROAS" target={4.8} fmt={(v) => v.toFixed(1) + 'x'} spark={[0.15, 0.3, 0.25, 0.5, 0.45, 0.8, 1]} />
      <KpiCard lt={lt} start={0.75} y={560} label="CTR" target={62} fmt={(v) => '+' + Math.round(v) + '%'} spark={[0.2, 0.25, 0.4, 0.35, 0.65, 0.7, 0.95]} />
      <KpiCard lt={lt} start={1.0} y={790} label="CPA" target={38} fmt={(v) => '−' + Math.round(v) + '%'} spark={[1, 0.85, 0.9, 0.6, 0.5, 0.3, 0.2]} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ SCENA 4 — automation flow */

type Node = {x: number; y: number; label: string; icon: 'bolt' | 'flow' | 'ai' | 'crm' | 'bot' | 'mail'};
const NODES: Node[] = [
  {x: 270, y: 700, label: 'TRIGGER', icon: 'bolt'},
  {x: 660, y: 520, label: 'MAKE', icon: 'flow'},
  {x: 1050, y: 700, label: 'AI', icon: 'ai'},
  {x: 1440, y: 520, label: 'CRM', icon: 'crm'},
  {x: 1700, y: 760, label: 'TELEGRAM', icon: 'bot'},
  {x: 1260, y: 900, label: 'EMAIL', icon: 'mail'},
];
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]];
const edgePts = (a: number, b: number): [Pt, Pt, Pt, Pt] => {
  const p0: Pt = [NODES[a].x, NODES[a].y], p1: Pt = [NODES[b].x, NODES[b].y];
  const dx = (p1[0] - p0[0]) * 0.5;
  return [p0, [p0[0] + dx, p0[1]], [p1[0] - dx, p1[1]], p1];
};
const Icon: React.FC<{k: Node['icon']}> = ({k}) => {
  const c = {fill: 'none', stroke: TEAL_HI, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (k) {
    case 'bolt': return <svg width={72} height={72} viewBox="0 0 72 72"><polygon points="40,6 16,40 34,40 30,66 56,30 38,30" {...c} /></svg>;
    case 'flow': return <svg width={72} height={72} viewBox="0 0 72 72"><circle cx={16} cy={36} r={9} {...c} /><circle cx={56} cy={16} r={9} {...c} /><circle cx={56} cy={56} r={9} {...c} /><path d="M25 36 C40 36 40 16 47 16 M25 36 C40 36 40 56 47 56" {...c} /></svg>;
    case 'ai': return <svg width={72} height={72} viewBox="0 0 72 72"><path d="M36 6 C38 24 48 34 66 36 C48 38 38 48 36 66 C34 48 24 38 6 36 C24 34 34 24 36 6Z" {...c} /></svg>;
    case 'crm': return <svg width={72} height={72} viewBox="0 0 72 72"><ellipse cx={36} cy={18} rx={22} ry={9} {...c} /><path d="M14 18 V54 C14 59 24 63 36 63 C48 63 58 59 58 54 V18 M14 36 C14 41 24 45 36 45 C48 45 58 41 58 36" {...c} /></svg>;
    case 'bot': return <svg width={72} height={72} viewBox="0 0 72 72"><path d="M64 10 L8 32 L28 40 L34 62 L44 46 L58 56 Z M28 40 L64 10" {...c} /></svg>;
    default: return <svg width={72} height={72} viewBox="0 0 72 72"><rect x={8} y={16} width={56} height={40} rx={6} {...c} /><path d="M8 20 L36 40 L64 20" {...c} /></svg>;
  }
};

const S4: React.FC<{lt: number}> = ({lt}) => {
  const PK_DUR = 0.3;
  const starts = [0.75, 1.0, 1.25, 1.5, 1.5];
  const waves = [0, 1.15];
  const arrivals: number[][] = NODES.map(() => []);
  EDGES.forEach(([, b], i) => waves.forEach((w) => arrivals[b].push(starts[i] + w + PK_DUR)));
  const edgeEls: React.ReactNode[] = [];
  const packets: React.ReactNode[] = [];
  EDGES.forEach(([a, b], i) => {
    const [p0, c1, c2, p1] = edgePts(a, b);
    const d = `M${p0[0]} ${p0[1]} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p1[0]} ${p1[1]}`;
    const dp = eIO(prog(lt, 0.3 + i * 0.1, 0.8 + i * 0.1));
    edgeEls.push(
      <g key={i}>
        <path d={d} fill="none" stroke="rgba(92,202,212,0.25)" strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp} />
        <path d={d} fill="none" stroke={TEAL} strokeWidth={3} pathLength={1} strokeDasharray="0.012 0.012" strokeDashoffset={1 - dp} opacity={dp > 0 ? 1 : 0} />
      </g>
    );
    waves.forEach((w, wi) => {
      const u = prog(lt, starts[i] + w, starts[i] + w + PK_DUR);
      if (u <= 0 || u >= 1) return;
      for (let tr = 0; tr < 7; tr++) {
        const uu = clamp(eIO(u) - tr * 0.025);
        const [x, y] = bez(p0, c1, c2, p1, uu);
        packets.push(<circle key={`${i}-${wi}-${tr}`} cx={x} cy={y} r={14 - tr * 1.6} fill={tr === 0 ? WHITE : TEAL_HI} opacity={(1 - tr / 7) * 0.95} />);
      }
    });
  });
  const nodeEls = NODES.map((n, i) => {
    const p = eBack(prog(lt, 0.1 + i * 0.1, 0.1 + i * 0.1 + 0.45), 2.2);
    let pulse = 0;
    arrivals[i].forEach((a) => {
      const dt = lt - a;
      if (dt >= 0 && dt < 0.5) pulse = Math.max(pulse, Math.exp(-dt * 7));
    });
    const sc = p * (1 + pulse * 0.14);
    return (
      <div key={i} style={{position: 'absolute', left: n.x - 80, top: n.y - 80, width: 160, height: 160, transform: `scale(${sc})`, opacity: clamp(p * 2)}}>
        <div style={{position: 'absolute', inset: -14 * pulse, borderRadius: 44, border: `3px solid ${TEAL_HI}`, opacity: pulse * 0.9}} />
        <div style={{width: 160, height: 160, borderRadius: 40, border: `2.5px solid ${pulse > 0.2 ? TEAL_HI : 'rgba(166,243,247,0.55)'}`, background: `linear-gradient(145deg, rgba(92,202,212,${0.25 + pulse * 0.35}), rgba(13,27,70,0.8))`, boxShadow: `0 0 ${30 + pulse * 70}px rgba(92,202,212,${0.25 + pulse * 0.5}), inset 0 0 30px rgba(166,243,247,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon k={n.icon} />
        </div>
        <div style={{position: 'absolute', top: 178, left: -40, width: 240, textAlign: 'center', fontFamily: MAN, fontWeight: 800, fontSize: 24, letterSpacing: '0.3em', color: WHITE, paddingLeft: '0.3em'}}>{n.label}</div>
      </div>
    );
  });
  const t1 = eO5(prog(lt, 0.05, 0.55)), t2 = eO5(prog(lt, 0.18, 0.68));
  const done = eO4(prog(lt, 2.0, 2.4));
  return (
    <AbsoluteFill style={{background: `linear-gradient(200deg, ${NAVY}, ${INK})`}}>
      <div style={{position: 'absolute', inset: -40, backgroundImage: `radial-gradient(circle, rgba(92,202,212,0.35) 2px, transparent 2.5px)`, backgroundSize: '64px 64px', backgroundPosition: `${-lt * 20}px ${lt * 12}px`, opacity: 0.55}} />
      <Glow x={1050} y={650} r={1000} o={0.22} />
      <div style={{position: 'absolute', left: 90, top: 70, overflow: 'hidden', height: 125}}>
        <div style={{fontFamily: ANTON, fontSize: 118, color: WHITE, lineHeight: 1.05, transform: `translateY(${(1 - t1) * 125}px)`}}>AUTOMATION</div>
      </div>
      <div style={{position: 'absolute', left: 90, top: 190, overflow: 'hidden', height: 125}}>
        <div style={{fontFamily: ANTON, fontSize: 118, color: TEAL, lineHeight: 1.05, transform: `translateY(${(1 - t2) * 125}px)`}}>× AI SYSTEMS</div>
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {edgeEls}
        {packets}
      </svg>
      {nodeEls}
      <div style={{position: 'absolute', right: 96, top: 110, textAlign: 'right', opacity: done, transform: `translateY(${(1 - done) * 20}px)`}}>
        <div style={{fontFamily: ANTON, fontSize: 150, color: WHITE, lineHeight: 1}}>H24</div>
        <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 24, letterSpacing: '0.3em', color: TEAL}}>ZERO LAVORO MANUALE</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ SCENA 5 — web / CRO */

const CTA_X = 235, CTA_Y = 495;
const CLICK_T = 1.2;

const Browser: React.FC<{lt: number}> = ({lt}) => {
  const rise = (a: number) => eO5(prog(lt, a, a + 0.4));
  const press = prog(lt, CLICK_T - 0.04, CLICK_T);
  const after = prog(lt, CLICK_T, CLICK_T + 0.5);
  const ctaScale = 1 - 0.07 * press * (1 - prog(lt, CLICK_T, CLICK_T + 0.12));
  // cursore
  const cp = eIO(prog(lt, 0.5, CLICK_T - 0.04));
  const [cx, cy] = bez([760, 700], [700, 520], [420, 520], [CTA_X + 90, CTA_Y + 30], cp);
  const ripple = prog(lt, CLICK_T, CLICK_T + 0.45);
  const conf: React.ReactNode[] = [];
  const r = rnd(77);
  for (let i = 0; i < 34; i++) {
    const ang = r() * Math.PI * 2, spd = 200 + r() * 520, tt = lt - CLICK_T, rot = r() * 360, col = [TEAL, TEAL_HI, NAVY, WHITE][i % 4];
    if (tt < 0 || tt > 1.1) continue;
    const x = CTA_X + 190 + Math.cos(ang) * spd * tt, y = CTA_Y + 30 + Math.sin(ang) * spd * tt + 900 * tt * tt;
    conf.push(<div key={i} style={{position: 'absolute', left: x, top: y, width: 14, height: 8, background: col, transform: `rotate(${rot + tt * 500}deg)`, opacity: 1 - prog(tt, 0.6, 1.1)}} />);
  }
  return (
    <div style={{width: 1100, height: 700, borderRadius: 26, background: WHITE, boxShadow: '0 60px 120px rgba(13,27,70,0.35), 0 0 0 2px rgba(13,27,70,0.12)', overflow: 'hidden', position: 'relative', fontFamily: MAN}}>
      <div style={{height: 64, background: '#DCEDF0', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10}}>
        {['#FF6B6B', '#FFC857', '#5CD6A0'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 16, background: c}} />)}
        <div style={{marginLeft: 24, height: 34, width: 460, borderRadius: 17, background: WHITE, color: NAVY, fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', paddingLeft: 18, letterSpacing: '0.04em'}}>pragmarealsolutions.com</div>
      </div>
      <div style={{height: 76, display: 'flex', alignItems: 'center', padding: '0 44px', gap: 22, opacity: rise(0.1), transform: `translateY(${(1 - rise(0.1)) * -24}px)`}}>
        <Img src={LOGO()} style={{height: 50, width: 'auto'}} />
        <div style={{fontFamily: ANTON, fontSize: 26, color: NAVY, letterSpacing: '0.1em'}}>PRAGMA</div>
        <div style={{flex: 1}} />
        {[90, 70, 110, 80].map((w, i) => <div key={i} style={{width: w, height: 12, borderRadius: 6, background: '#C7DDE2'}} />)}
      </div>
      <div style={{position: 'absolute', left: 44, top: 190, width: 600}}>
        <div style={{overflow: 'hidden', height: 98}}><div style={{fontFamily: ANTON, fontSize: 92, lineHeight: 1.06, color: NAVY, transform: `translateY(${(1 - rise(0.2)) * 100}px)`}}>PIÙ LEAD.</div></div>
        <div style={{overflow: 'hidden', height: 98}}><div style={{fontFamily: ANTON, fontSize: 92, lineHeight: 1.06, color: TEAL_D, transform: `translateY(${(1 - rise(0.32)) * 100}px)`}}>MENO CLICK.</div></div>
        {[520, 430].map((w, i) => <div key={i} style={{height: 14, width: w * rise(0.45 + i * 0.08), borderRadius: 7, background: '#C7DDE2', marginTop: 20}} />)}
      </div>
      <div style={{position: 'absolute', left: CTA_X - 190, top: CTA_Y - 5, width: 380, height: 70, borderRadius: 35, transform: `scale(${ctaScale * lerp(0.6, 1, eBack(prog(lt, 0.4, 0.75)))})`, opacity: prog(lt, 0.4, 0.55), background: after > 0.2 ? NAVY : TEAL, color: after > 0.2 ? TEAL_HI : NAVY, fontFamily: MAN, fontWeight: 800, fontSize: 24, letterSpacing: '0.12em', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 14px 40px rgba(30,143,160,${0.5})`}}>
        {after > 0.2 ? '✓ RICHIESTA INVIATA' : "RICHIEDI L'ANALISI"}
      </div>
      <div style={{position: 'absolute', left: 660, top: 170, width: 390, height: 420, borderRadius: 30, background: `linear-gradient(150deg, ${TEAL}, ${NAVY2} 80%)`, transform: `translateX(${(1 - rise(0.3)) * 160}px)`, opacity: rise(0.3), overflow: 'hidden'}}>
        <svg width={390} height={420} viewBox="0 0 390 420">
          {[0.35, 0.55, 0.8].map((v, i) => <rect key={i} x={60 + i * 100} y={400 - 300 * v * eO5(prog(lt, 0.55 + i * 0.1, 1.0 + i * 0.1))} width={64} height={300 * v * eO5(prog(lt, 0.55 + i * 0.1, 1.0 + i * 0.1))} rx={6} fill="rgba(246,252,253,0.88)" />)}
          <ellipse cx={195} cy={380} rx={170} ry={46} fill="none" stroke={TEAL_HI} strokeWidth={9} opacity={0.9} />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 44, right: 44, bottom: 40, display: 'flex', gap: 24}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{flex: 1, height: 96, borderRadius: 22, background: '#E6F3F5', transform: `translateY(${(1 - rise(0.55 + i * 0.1)) * 60}px)`, opacity: rise(0.55 + i * 0.1), padding: 20, boxSizing: 'border-box'}}>
            <div style={{width: 36, height: 36, borderRadius: 12, background: TEAL}} />
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 40, top: 80, padding: '16px 26px', borderRadius: 18, background: NAVY, color: TEAL_HI, fontWeight: 800, fontSize: 22, letterSpacing: '0.12em', transform: `translateX(${(1 - eBack(prog(lt, CLICK_T + 0.2, CLICK_T + 0.5))) * 400}px)`, boxShadow: '0 20px 50px rgba(13,27,70,0.4)'}}>+1 LEAD</div>
      {ripple > 0 && ripple < 1 && <div style={{position: 'absolute', left: cx - 10 - 120 * ripple, top: cy - 10 - 120 * ripple, width: 20 + 240 * ripple, height: 20 + 240 * ripple, borderRadius: 400, border: `4px solid ${TEAL_D}`, opacity: 1 - ripple}} />}
      {conf}
      <svg width={40} height={40} viewBox="0 0 24 24" style={{position: 'absolute', left: cx, top: cy, opacity: prog(lt, 0.45, 0.6), filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))'}}>
        <path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.4 L18 13 Z" fill={NAVY} stroke={WHITE} strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const Phone: React.FC<{lt: number}> = ({lt}) => {
  const rise = (a: number) => eO5(prog(lt, a, a + 0.4));
  return (
    <div style={{width: 330, height: 690, borderRadius: 56, background: NAVY, padding: 14, boxSizing: 'border-box', boxShadow: '0 60px 120px rgba(13,27,70,0.4)', position: 'relative'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 44, background: WHITE, overflow: 'hidden', position: 'relative', fontFamily: MAN}}>
        <div style={{position: 'absolute', left: 105, top: 12, width: 100, height: 26, borderRadius: 14, background: NAVY}} />
        <div style={{position: 'absolute', left: 28, top: 70, display: 'flex', alignItems: 'center', gap: 10, opacity: rise(0.7)}}>
          <Img src={LOGO()} style={{height: 40, width: 'auto'}} />
          <div style={{fontFamily: ANTON, fontSize: 22, color: NAVY, letterSpacing: '0.1em'}}>PRAGMA</div>
        </div>
        <div style={{position: 'absolute', left: 28, top: 150}}>
          <div style={{overflow: 'hidden', height: 62}}><div style={{fontFamily: ANTON, fontSize: 58, lineHeight: 1.06, color: NAVY, transform: `translateY(${(1 - rise(0.8)) * 64}px)`}}>PIÙ LEAD.</div></div>
          <div style={{overflow: 'hidden', height: 62}}><div style={{fontFamily: ANTON, fontSize: 58, lineHeight: 1.06, color: TEAL_D, transform: `translateY(${(1 - rise(0.9)) * 64}px)`}}>MENO CLICK.</div></div>
        </div>
        <div style={{position: 'absolute', left: 28, top: 300, width: 244, height: 190, borderRadius: 26, background: `linear-gradient(150deg, ${TEAL}, ${NAVY2})`, opacity: rise(1.0), transform: `translateY(${(1 - rise(1.0)) * 50}px)`}} />
        <div style={{position: 'absolute', left: 28, top: 520, width: 244, height: 58, borderRadius: 29, background: TEAL, color: NAVY, fontWeight: 800, fontSize: 17, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: rise(1.1), transform: `scale(${lerp(0.7, 1, rise(1.1))})`}}>RICHIEDI L'ANALISI</div>
      </div>
    </div>
  );
};

const S5: React.FC<{lt: number}> = ({lt}) => {
  const t1 = eO5(prog(lt, 0.0, 0.5));
  const bx = lerp(-60, 0, eO4(prog(lt, 0, 0.7)));
  const rotY = lerp(-26, -12, eO4(prog(lt, 0, 1.6))) + lt * 1.2;
  const phoneP = eO5(prog(lt, 0.45, 1.0));
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${ICE}, #CDEBEF)`}}>
      <Glow x={1500} y={300} r={700} c={TEAL} o={0.28} />
      <Dust t={lt} n={30} seed={51} color={TEAL_D} />
      <div style={{position: 'absolute', left: 96, top: 62, overflow: 'hidden', height: 110}}>
        <div style={{fontFamily: ANTON, fontSize: 96, color: NAVY, lineHeight: 1.1, transform: `translateY(${(1 - t1) * 110}px)`}}>LANDING CHE CONVERTONO</div>
      </div>
      <div style={{position: 'absolute', left: 100, top: 168, fontFamily: MAN, fontWeight: 800, fontSize: 24, letterSpacing: '0.35em', color: TEAL_D, opacity: eO4(prog(lt, 0.2, 0.5))}}>WIX STUDIO · UX/UI · CRO · MOBILE FIRST</div>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, perspective: 2800, perspectiveOrigin: '45% 50%'}}>
        <div style={{position: 'absolute', left: 130 + bx, top: 250, transform: `rotateY(${rotY}deg) rotateX(4deg)`, transformOrigin: '30% 50%'}}>
          <Browser lt={lt} />
        </div>
        <div style={{position: 'absolute', left: 1440, top: 290 + (1 - phoneP) * 700, transform: `rotateY(${rotY + 6}deg) rotateZ(${(1 - phoneP) * 8}deg)`}}>
          <Phone lt={lt} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ SCENA 6 — chiusura logo */

const S6: React.FC<{lt: number}> = ({lt}) => {
  const lh = 540;
  const k = lh / LH;
  const lx = 960 - (LW * k) / 2, ly = 60;
  const ringP = eO4(prog(lt, 0.0, 0.8));
  const ang = ringP * 360;
  const barsP = (i: number) => eO5(prog(lt, 0.25 + i * 0.1, 0.25 + i * 0.1 + 0.55));
  const shine = lerp(-30, 125, prog(lt, 0.9, 1.6));
  const boom = prog(lt, 0.8, 1.7);
  const word = 'PRAGMA SOLUTIONS';
  const settle = eO4(prog(lt, 0, 1.2));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, #3E9FB4 0%, #12417A 38%, ${INK} 85%)`}}>
      <Glow x={960} y={330} r={900} c={TEAL_HI} o={0.35 * settle} />
      <Bokeh t={lt} seed={61} n={10} />
      <Dust t={lt} n={60} seed={63} color={TEAL_HI} />
      {[0, 0.12, 0.24].map((d, i) => {
        const p = prog(lt, 0.78 + d, 1.6 + d);
        return p > 0 && p < 1 ? <div key={i} style={{position: 'absolute', left: 960 - 1100 * eO4(p), top: 330 - 1100 * eO4(p), width: 2200 * eO4(p), height: 2200 * eO4(p), borderRadius: 3000, border: `${10 - i * 3}px solid ${TEAL_HI}`, opacity: (1 - p) * 0.8}} /> : null;
      })}
      <div style={{position: 'absolute', left: lx, top: ly, width: LW, height: LH, transformOrigin: '0 0', transform: `scale(${k * (1 + 0.04 * Math.sin(prog(lt, 0.8, 1.2) * Math.PI))})`, filter: `drop-shadow(0 0 ${30 + 40 * Math.sin(boom * Math.PI)}px rgba(166,243,247,0.6))`}}>
        <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `conic-gradient(from 195deg at 50% 63%, #000 ${ang}deg, transparent ${ang + 0.01}deg)`, maskImage: `conic-gradient(from 195deg at 50% 63%, #000 ${ang}deg, transparent ${ang + 0.01}deg)`, opacity: clamp(ringP * 4)}}>
          <Img src={staticFile('ring.png')} style={{width: LW, height: LH, display: 'block'}} />
        </div>
        {[0, 1, 2].map((i) => {
          const x0 = [215, 322, 430][i], x1 = [295, 402, 512][i], p = barsP(i);
          return (
            <div key={i} style={{position: 'absolute', inset: 0, clipPath: `inset(${(1 - p) * 100}% ${100 - (x1 / LW) * 100}% 0 ${(x0 / LW) * 100}%)`}}>
              <Img src={staticFile('bars.png')} style={{width: LW, height: LH, display: 'block'}} />
            </div>
          );
        })}
        <div style={{position: 'absolute', inset: 0, ...maskLogo, background: `linear-gradient(105deg, transparent ${shine - 10}%, rgba(255,255,255,0.95) ${shine}%, transparent ${shine + 10}%)`}} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 665, display: 'flex', justifyContent: 'center', fontFamily: ANTON, fontSize: 150, color: WHITE, letterSpacing: '0.035em', lineHeight: 1}}>
        {word.split('').map((ch, i) => {
          const p = eO5(prog(lt, 0.85 + i * 0.03, 0.85 + i * 0.03 + 0.4));
          return (
            <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.06em'}}>
              <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 115}%)`}}>{ch === ' ' ? ' ' : ch}</span>
            </span>
          );
        })}
      </div>
      <Caption text="Il digitale che funziona" lt={lt} delay={1.5} color={TEAL_HI} size={34} style={{position: 'absolute', left: 0, width: W, top: 850}} />
      <Caption text="pragmarealsolutions.com" lt={lt} delay={1.7} color={WHITE} size={24} style={{position: 'absolute', left: 0, width: W, top: 935, letterSpacing: '0.35em'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ montaggio */

type Sc = {C: React.FC<{lt: number}>; inS?: (p: number) => React.CSSProperties; outS?: (q: number) => React.CSSProperties};

const stripPath = (p: number) => {
  const n = 8, sw = W / n;
  let d = '';
  for (let k = 0; k < n; k++) {
    const h = eIO(clamp(p * 1.55 - (k % 2 ? k : n - 1 - k) * 0.075)) * H;
    const y0 = k % 2 ? H - h : 0;
    d += `M${k * sw} ${y0}H${(k + 1) * sw}V${y0 + h}H${k * sw}Z`;
  }
  return `path('${d}')`;
};

const SCENES: Sc[] = [
  {C: S1, outS: (q) => ({transform: `translateX(${-eO4(q) * 700}px) scale(${1 + eO4(q) * 0.12})`})},
  {C: S2, inS: (p) => ({transform: `translateX(${(1 - eO5(p)) * W}px)`}), outS: (q) => ({transform: `scale(${1 + eIO(q) * 0.12})`})},
  {C: S3, inS: (p) => ({clipPath: `circle(${eIO(p) * 1300}px at 50% 50%)`}), outS: () => ({})},
  {C: S4, inS: (p) => ({clipPath: stripPath(p)}), outS: (q) => ({transform: `scale(${1 + eI3(q) * 2.2})`, opacity: 1 - q * 0.8})},
  {C: S5, inS: (p) => ({transform: `scale(${lerp(0.55, 1, eO4(p))})`, opacity: clamp(p * 1.6)})},
  {C: S6, inS: (p) => ({opacity: p > 0.45 ? 1 : 0})},
];

const HUD: React.FC<{t: number}> = ({t}) => {
  const f = Math.floor(t * 30);
  const tc = `00:${String(Math.floor(f / 30)).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`;
  const idx = SC.findIndex((s, i) => t >= s && t < (SC[i + 1] ?? 99));
  const names = ['INTRO', 'STRATEGIA → AI', 'ADV · SEO', 'AUTOMATION', 'WEB · CRO', 'PRAGMA'];
  const wk = Math.floor((t - SC[1]) / B);
  const light = (idx === 1 && (wk === 1 || wk === 3)) || idx === 4;
  const hc = light ? NAVY : '#fff';
  const txt: React.CSSProperties = {position: 'absolute', fontFamily: MAN, fontWeight: 800, fontSize: 17, letterSpacing: '0.3em', color: hc};
  const br = (s: React.CSSProperties) => <div style={{position: 'absolute', width: 34, height: 34, borderColor: hc, borderStyle: 'solid', borderWidth: 0, ...s}} />;
  return (
    <AbsoluteFill>
      {br({left: 40, top: 40, borderLeftWidth: 3, borderTopWidth: 3})}
      {br({right: 40, top: 40, borderRightWidth: 3, borderTopWidth: 3})}
      {br({left: 40, bottom: 40, borderLeftWidth: 3, borderBottomWidth: 3})}
      {br({right: 40, bottom: 40, borderRightWidth: 3, borderBottomWidth: 3})}
      <div style={{...txt, left: 96, top: 36, opacity: idx === 2 || idx === 4 ? 0 : 1}}>PRAGMA SOLUTIONS</div>
      <div style={{...txt, right: 96, top: 36}}>{tc}</div>
      <div style={{...txt, left: 96, bottom: 34}}>{String(idx + 1).padStart(2, '0')} / 06 — {names[Math.max(0, idx)]}</div>
      <div style={{position: 'absolute', left: 96, right: 96, bottom: 20, height: 3, background: light ? 'rgba(13,27,70,0.18)' : 'rgba(255,255,255,0.18)'}}>
        <div style={{width: `${(t / 15) * 100}%`, height: '100%', background: hc}} />
      </div>
    </AbsoluteFill>
  );
};

export const Movie: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const els: React.ReactNode[] = [];
  SCENES.forEach((sc, i) => {
    const start = SC[i], end = SC[i + 1];
    if (t < start - 0.2 || t > end + 0.2) return;
    const p = i === 0 ? 1 : prog(t, start - 0.2, start + 0.2);
    const q = i === SCENES.length - 1 ? 0 : prog(t, end - 0.2, end + 0.2);
    const style: React.CSSProperties = {};
    if (p < 1 && sc.inS) Object.assign(style, sc.inS(p));
    if (q > 0 && sc.outS) Object.assign(style, sc.outS(q));
    els.push(
      <AbsoluteFill key={i} style={style}>
        <sc.C lt={t - start} />
      </AbsoluteFill>
    );
  });
  // anello di taglio S2 -> S3
  const rp = prog(t, SC[2] - 0.2, SC[2] + 0.2);
  const ringR = eIO(rp) * 1300;
  // flash S5 -> S6
  const fl = Math.max(0, 1 - Math.abs(t - SC[5]) / 0.14);
  return (
    <AbsoluteFill style={{background: INK}}>
      {els}
      {rp > 0 && rp < 1 && (
        <div style={{position: 'absolute', left: 960 - ringR, top: 540 - ringR, width: ringR * 2, height: ringR * 2, borderRadius: ringR * 2, border: `18px solid ${TEAL_HI}`, boxShadow: `0 0 80px ${TEAL}, inset 0 0 80px ${TEAL}`, opacity: 1 - rp * 0.4}} />
      )}
      <HUD t={t} />
      <AbsoluteFill style={{background: `radial-gradient(circle, #fff, ${TEAL_HI})`, opacity: fl * fl * 0.95}} />
    </AbsoluteFill>
  );
};
