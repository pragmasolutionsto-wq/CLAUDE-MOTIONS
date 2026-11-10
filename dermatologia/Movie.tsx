import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {COL, SANS, SERIF} from './config';
import {B, clamp, eBack, eIO, eO3, eO4, eO5, FPS, lerp, prog, rnd, SC} from './util';

type Dim = {W: number; H: number; v: boolean};
const Ctx = createContext<Dim>({W: 1920, H: 1080, v: false});
const useD = () => useContext(Ctx);
const eIn3 = (x: number) => x * x * x;

/* ═════════════ testo ═════════════ */
// parole che salgono da una maschera
const Words: React.FC<{text: string; lt: number; d?: number; stag?: number; style?: React.CSSProperties; italic?: boolean; color?: string}> = ({text, lt, d = 0, stag = 0.07, style, italic, color}) => (
  <span style={{display: 'inline', fontStyle: italic ? 'italic' : 'normal', color}}>
    {text.split(' ').map((w, i) => {
      const p = eO5(prog(lt, d + i * stag, d + i * stag + 0.55));
      return (
        <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.12em', marginBottom: '-0.12em', marginRight: '0.24em', ...style}}>
          <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 6}deg)`, transformOrigin: 'left bottom'}}>{w}</span>
        </span>
      );
    })}
  </span>
);

// lettere che arrivano lateralmente con scia
const Fly: React.FC<{text: string; lt: number; d?: number; stag?: number; from?: number; style?: React.CSSProperties}> = ({text, lt, d = 0, stag = 0.03, from = 1, style}) => (
  <div style={{whiteSpace: 'pre', ...style}}>
    {text.split('').map((ch, i) => {
      const p = eO5(prog(lt, d + i * stag, d + i * stag + 0.5));
      return (
        <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateX(${(1 - p) * 120 * from}px) skewX(${(1 - p) * -18 * from}deg)`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined}}>
          {ch}
        </span>
      );
    })}
  </div>
);

const Kicker: React.FC<{text: string; lt: number; d?: number; color?: string; size?: number; center?: boolean}> = ({text, lt, d = 0, color = COL.goldDeep, size = 22, center}) => {
  const p = eO4(prog(lt, d, d + 0.5));
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, justifyContent: center ? 'center' : 'flex-start', fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: size * 0.22, color, textTransform: 'uppercase'}}>
      <div style={{width: 56 * p, height: 2, background: color}} />
      <div style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>{text}</div>
    </div>
  );
};

/* ═════════════ fx ═════════════ */
const Dust: React.FC<{t: number; n?: number; seed?: number; color?: string; o?: number}> = ({t, n = 40, seed = 3, color = COL.gold, o = 1}) => {
  const {W, H} = useD();
  const r = rnd(seed);
  const items = [];
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, vx = (r() - 0.5) * 40, vy = -(20 + r() * 70), s = 2 + r() * 4, ph = r() * 6.28, dd = r();
    const x = (((x0 + vx * t) % W) + W) % W;
    const y = (((y0 + vy * t) % H) + H) % H;
    const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * (1 + dd * 2) + ph));
    items.push(<div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: color, opacity: tw * (0.2 + dd * 0.5) * o, boxShadow: `0 0 ${s * 3}px ${color}`}} />);
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

const Glow: React.FC<{t: number; color: string; o?: number; x?: number; y?: number; size?: number}> = ({t, color, o = 0.35, x = 0.5, y = 0.5, size = 1.1}) => {
  const {W, H} = useD();
  const s = Math.max(W, H) * size;
  const cx = W * x + Math.sin(t * 0.9) * W * 0.08, cy = H * y + Math.cos(t * 0.7) * H * 0.06;
  return <div style={{position: 'absolute', left: cx - s / 2, top: cy - s / 2, width: s, height: s, borderRadius: s, background: `radial-gradient(circle, ${color} 0%, transparent 60%)`, opacity: o}} />;
};

// anello da dermatoscopio con tacche
const LensRing: React.FC<{r: number; p: number; rot: number; color?: string; ticks?: number; w?: number}> = ({r, p, rot, color = COL.gold, ticks = 72, w = 3}) => {
  const s = r * 2 + 80;
  return (
    <svg width={s} height={s} viewBox={`${-s / 2} ${-s / 2} ${s} ${s}`} style={{position: 'absolute', left: -s / 2, top: -s / 2, overflow: 'visible'}}>
      <circle r={r} fill="none" stroke={color} strokeWidth={w} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} transform="rotate(-90)" />
      <g transform={`rotate(${rot})`}>
        {Array.from({length: ticks}).map((_, i) => {
          const a = (i / ticks) * Math.PI * 2;
          const on = prog(p, i / ticks, i / ticks + 0.05);
          const L = i % 6 === 0 ? 26 : 12;
          return <line key={i} x1={Math.cos(a) * (r + 10)} y1={Math.sin(a) * (r + 10)} x2={Math.cos(a) * (r + 10 + L * on)} y2={Math.sin(a) * (r + 10 + L * on)} stroke={color} strokeWidth={i % 6 === 0 ? 3 : 1.5} opacity={0.85} />;
        })}
      </g>
      {[0, 90, 180, 270].map((a) => (
        <line key={a} x1={0} y1={-(r - 6)} x2={0} y2={-(r - 6 - 30 * p)} stroke={color} strokeWidth={w} transform={`rotate(${a})`} />
      ))}
    </svg>
  );
};

/* ═════════════ transizioni d'ingresso ═════════════ */
type Tr = 'iris' | 'slats' | 'slatsH' | 'diag' | 'none';
const Enter: React.FC<{lt: number; pre: number; type: Tr; cx?: number; cy?: number; bg: string; children: React.ReactNode}> = ({lt, pre, type, cx, cy, bg, children}) => {
  const {W, H} = useD();
  const p = pre > 0 ? eIO(prog(lt, -pre, 0)) : 1;
  const punch = lerp(1.14, 1, eO4(prog(lt, -pre * 0.6, 0.9)));
  let clip: string | undefined;
  let edge: React.ReactNode = null;
  const X = cx ?? W / 2, Y = cy ?? H / 2;
  if (p < 1) {
    if (type === 'iris') {
      const R = Math.hypot(Math.max(X, W - X), Math.max(Y, H - Y)) * p;
      clip = `circle(${R}px at ${X}px ${Y}px)`;
      edge = <div style={{position: 'absolute', left: X - R, top: Y - R, width: R * 2, height: R * 2, borderRadius: R * 2, border: `${lerp(10, 3, p)}px solid ${COL.gold}`}} />;
    } else if (type === 'slats' || type === 'slatsH') {
      const n = 7, hor = type === 'slatsH', L = hor ? H : W, M = hor ? W : H, sw = L / n;
      let d = '';
      for (let i = 0; i < n; i++) {
        const q = eIO(prog(lt, -pre + i * pre * 0.06, -pre * 0.1 + i * pre * 0.06 + 0.001));
        const w = sw * q + 0.5, a = i * sw + (sw - w) / 2;
        d += hor ? `M0 ${a} H${M} V${a + w} H0Z ` : `M${a} 0 H${a + w} V${M} H${a}Z `;
      }
      clip = `path('${d}')`;
    } else if (type === 'diag') {
      const k = H * 0.35, x = lerp(-k, W + k, p);
      clip = `polygon(0 0, ${x + k}px 0, ${x - k}px ${H}px, 0 ${H}px)`;
      edge = <div style={{position: 'absolute', left: x - 6, top: -H * 0.2, width: 12, height: H * 1.4, background: COL.gold, transform: `rotate(${(Math.atan2(2 * k, H) * 180) / Math.PI}deg)`, transformOrigin: 'center'}} />;
    }
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: clip, background: bg}}>
        <AbsoluteFill style={{transform: `scale(${punch})`}}>{children}</AbsoluteFill>
      </AbsoluteFill>
      {edge}
    </AbsoluteFill>
  );
};

/* ═════════════ S0 — HOOK: la tua pelle non è standard ═════════════ */
const S0: React.FC<{lt: number}> = ({lt}) => {
  const {W, H, v} = useD();
  const fs = v ? 132 : 150;
  const lines = v ? [['La tua'], ['pelle non è'], ['standard']] : [['La tua pelle'], ['non è standard']];
  const dotIn = eBack(prog(lt, 1.0, 1.3), 2.2);
  const grow = prog(lt, 1.85, 2.5);
  const dotScale = dotIn * Math.pow(260, eIn3(grow)) * (1 + 0.12 * Math.max(0, Math.sin(((lt - 1.0) / B) * Math.PI * 2)) * (1 - grow));
  const dotCol = grow > 0.35 ? COL.navy : COL.gold;
  const scanY = ((lt * 0.55) % 1) * H;
  return (
    <AbsoluteFill style={{background: COL.ice, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${COL.blueSoft} 1.4px, transparent 1.6px)`, backgroundSize: '34px 34px', backgroundPosition: `${lt * 30}px ${lt * -60}px`, opacity: 0.28}} />
      <div style={{position: 'absolute', left: 0, top: scanY, width: W, height: 2, background: `linear-gradient(90deg, transparent, ${COL.gold}, transparent)`, opacity: 0.8, boxShadow: `0 0 30px ${COL.gold}`}} />
      <div style={{position: 'absolute', top: H * (v ? 0.62 : 0.55), left: 0, whiteSpace: 'nowrap', fontFamily: SERIF, fontStyle: 'italic', fontSize: v ? 520 : 640, color: 'transparent', WebkitTextStroke: `2px ${COL.blueSoft}`, opacity: 0.16, transform: `translateX(${lerp(W * 0.1, -W * 0.5, lt / 2.5)}px)`}}>pelle · pelle · pelle</div>
      <AbsoluteFill style={{justifyContent: 'center', padding: v ? '0 90px' : '0 180px', transform: `scale(${1 + lt * 0.03})`}}>
        <Kicker text="Dermatologia · Rivoli" lt={lt} d={0.05} size={v ? 26 : 22} />
        <div style={{height: 36}} />
        {lines.map((l, i) => (
          <div key={i} style={{fontFamily: SERIF, fontWeight: 500, fontSize: fs, lineHeight: 1.08, color: COL.ink, letterSpacing: -1}}>
            <Words text={l[0]} lt={lt} d={0.15 + i * 0.28} stag={0.1} />
            {i === lines.length - 1 && (
              <span style={{display: 'inline-block', width: fs * 0.2, height: fs * 0.2, borderRadius: fs, background: dotCol, marginLeft: -fs * 0.18, transform: `scale(${dotScale})`, boxShadow: grow < 0.3 ? `0 0 ${30 * dotIn}px ${COL.gold}` : undefined}} />
            )}
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ═════════════ S1 — il controllo nemmeno ═════════════ */
const S1: React.FC<{lt: number}> = ({lt}) => {
  const {W, H, v} = useD();
  const ring = eO4(prog(lt, 1.05, 1.6));
  const out = eIO(prog(lt, 1.45, 2.0));
  return (
    <AbsoluteFill style={{background: COL.navy, overflow: 'hidden'}}>
      <Glow t={lt} color={COL.blue} o={0.55} />
      <Dust t={lt + 3} n={36} seed={8} o={0.8} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${lerp(1, 0.86, out) + lt * 0.02})`, opacity: 1 - out * 0.85}}>
        <Fly text="Il controllo" lt={lt} d={0.0} stag={0.035} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: v ? 120 : 130, color: COL.white}} />
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: v ? 190 : 230, color: COL.gold, lineHeight: 1.05, whiteSpace: 'pre'}}>
          {'nemmeno.'.split('').map((ch, i) => {
            const p = eO5(prog(lt, 0.35 + i * 0.04, 0.35 + i * 0.04 + 0.5));
            return <span key={i} style={{display: 'inline-block', opacity: p, transform: `scale(${lerp(2.2, 1, p)}) translateY(${(1 - p) * -40}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 14}px)` : undefined}}>{ch}</span>;
          })}
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: W / 2, top: H / 2, transform: `scale(${lerp(1, 3.2, eIn3(out))})`, opacity: ring}}>
        <LensRing r={v ? 380 : 330} p={ring} rot={lt * 40} />
      </div>
    </AbsoluteFill>
  );
};

/* ═════════════ S2 — la dottoressa ═════════════ */
const S2: React.FC<{lt: number}> = ({lt}) => {
  const {W, H, v} = useD();
  const pw = v ? 700 : 560, ph = pw * 1.25;
  const px = v ? (W - pw) / 2 : W * 0.56, py = v ? 170 : (H - ph) / 2;
  const fr = eBack(prog(lt, -0.1, 0.45), 1.4);
  const rev = eO5(prog(lt, -0.25, 0.4));
  const drift = lt * 14;
  const chips = ['Clinica', 'Chirurgica', 'Estetica'];
  return (
    <AbsoluteFill style={{background: COL.ice, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: v ? -60 : -80, top: v ? H * 0.84 : H * 0.66, whiteSpace: 'nowrap', fontFamily: SERIF, fontSize: v ? 300 : 360, color: COL.sky, opacity: 0.45, transform: `translateX(${-lt * 70}px)`}}>Ana Júlia Campos</div>
      <div style={{position: 'absolute', left: px + 34 + lerp(-W * 0.6, 0, fr), top: py + 34 - drift * 0.4, width: pw, height: ph, background: COL.gold}} />
      <div style={{position: 'absolute', left: px, top: py - drift, width: pw, height: ph, overflow: 'hidden', clipPath: `inset(${(1 - rev) * 100}% 0 0 0)`, boxShadow: '0 30px 80px rgba(19,37,64,.25)'}}>
        <Img src={staticFile('doc.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${lerp(1.35, 1.06, eO4(prog(lt, -0.25, 1.2))) + lt * 0.01})`}} />
      </div>
      <div style={{position: 'absolute', left: v ? 90 : 150, top: v ? py + ph + 110 : H * 0.3, width: v ? W - 180 : W * 0.47, transform: `translateY(${-drift * 0.6}px)`}}>
        <Kicker text="Nuova specialista" lt={lt} d={0.25} size={v ? 26 : 22} />
        <div style={{height: 24}} />
        <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: v ? 104 : 96, lineHeight: 1.05, color: COL.ink}}>
          <Words text="Dott.ssa" lt={lt} d={0.35} />
          <br />
          <Words text="Ana Júlia Campos" lt={lt} d={0.45} stag={0.08} italic color={COL.blue} />
        </div>
        <div style={{height: 40}} />
        <div style={{display: 'flex', gap: 14, flexWrap: 'wrap'}}>
          {chips.map((c, i) => {
            const p = eBack(prog(lt, 0.9 + i * B / 2, 0.9 + i * B / 2 + 0.35), 2);
            return <div key={c} style={{fontFamily: SANS, fontWeight: 600, fontSize: v ? 26 : 22, letterSpacing: 4, textTransform: 'uppercase', color: COL.navy, border: `2px solid ${COL.navy}`, padding: '12px 22px', transform: `scale(${p})`, opacity: clamp(p)}}>{c}</div>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═════════════ S3 — numeri ═════════════ */
const STATS: [number, string, string, string][] = [
  [23, '+', '', 'anni Longevitas'],
  [2370, '+', '', 'pazienti seguiti'],
  [360, '', '°', 'presa in carico'],
  [1, '', '', 'specialista, un percorso'],
];
const S3: React.FC<{lt: number}> = ({lt}) => {
  const {W, H, v} = useD();
  const cw = v ? W / 2 : W / 4, ch = v ? 520 : 420;
  const ox = 0, oy = v ? (H - ch * 2) / 2 + 60 : (H - ch) / 2 + 40;
  return (
    <AbsoluteFill style={{background: COL.navyDeep, overflow: 'hidden'}}>
      <Glow t={lt * 2} color={COL.blue} o={0.5} x={0.3} />
      <div style={{position: 'absolute', left: W / 2, top: H / 2, opacity: 0.25}}>
        <LensRing r={Math.max(W, H) * 0.42} p={eO4(prog(lt, 0, 1))} rot={lt * -25} ticks={120} w={1.5} />
      </div>
      <div style={{position: 'absolute', top: v ? 260 : 130, width: W}}>
        <Kicker text="Longevitas in numeri" lt={lt} d={0.05} color={COL.gold} center size={v ? 26 : 22} />
      </div>
      {STATS.map(([n, pre, post, lab], i) => {
        const col = v ? i % 2 : i, row = v ? Math.floor(i / 2) : 0;
        const d = 0.05 + i * 0.13;
        const p = eO5(prog(lt, d, d + 0.5));
        const c = eO4(prog(lt, d, d + 1.1));
        const val = Math.round(n * c);
        const line = eO4(prog(lt, d + 0.2, d + 0.7));
        return (
          <div key={i} style={{position: 'absolute', left: ox + col * cw, top: oy + row * ch, width: cw, height: ch, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            {(v ? col === 1 : i > 0) && <div style={{position: 'absolute', left: 0, top: ch * 0.2, width: 1, height: ch * 0.6 * line, background: 'rgba(230,207,122,.4)'}} />}
            <div style={{overflow: 'hidden', paddingBottom: 10}}>
              <div style={{fontFamily: SERIF, fontSize: v ? 170 : 150, color: COL.gold, lineHeight: 1.1, transform: `translateY(${(1 - p) * 110}%)`, fontVariantNumeric: 'tabular-nums'}}>
                {pre}{val}{post}
              </div>
            </div>
            <div style={{width: 60 * line, height: 2, background: COL.gold, margin: '18px 0 22px'}} />
            <div style={{fontFamily: SANS, fontWeight: 500, fontSize: v ? 26 : 20, letterSpacing: 4, textTransform: 'uppercase', color: COL.white, opacity: eO3(prog(lt, d + 0.3, d + 0.7)), textAlign: 'center', maxWidth: cw * 0.8}}>{lab}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ═════════════ S4 — servizi (lista rotante + icone che si disegnano) ═════════════ */
const Icon: React.FC<{k: number; p: number; size: number; color: string}> = ({k, p, size, color}) => {
  const sp = {pathLength: 1, strokeDasharray: '1', strokeDashoffset: 1 - p, fill: 'none', stroke: color, strokeWidth: 4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const sh = [
    <g key="0"><circle cx="45" cy="45" r="25" {...sp} /><circle cx="45" cy="45" r="9" {...sp} /><line x1="63" y1="63" x2="82" y2="82" {...sp} /></g>,
    <g key="1"><path d="M50 14 C50 14 26 46 26 61 A24 24 0 0 0 74 61 C74 46 50 14 50 14Z" {...sp} /><path d="M38 62 A12 12 0 0 0 50 74" {...sp} /></g>,
    <g key="2"><rect x="20" y="20" width="60" height="60" rx="8" {...sp} /><line x1="50" y1="20" x2="50" y2="80" {...sp} /><line x1="20" y1="50" x2="80" y2="50" {...sp} /></g>,
    <g key="3"><circle cx="30" cy="72" r="10" {...sp} /><circle cx="70" cy="72" r="10" {...sp} /><line x1="37" y1="64" x2="74" y2="16" {...sp} /><line x1="63" y1="64" x2="26" y2="16" {...sp} /></g>,
    <g key="4"><path d="M50 86 C18 64 20 30 50 14 C80 30 82 64 50 86Z" {...sp} /><path d="M50 86 V34" {...sp} /><path d="M50 56 L36 44 M50 68 L64 56" {...sp} /></g>,
  ];
  return <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>{sh[k]}</svg>;
};
const SERV = ['Mappatura dei nei', 'Macchie della pelle', 'Malattie della pelle', 'Dermatologia chirurgica', 'Estetica e healthy aging'];
const S4: React.FC<{lt: number}> = ({lt}) => {
  const {W, H, v} = useD();
  const st = (i: number) => 0.3 + i * 0.45;
  let pos = 0;
  for (let i = 0; i < 4; i++) pos += eIO(prog(lt, st(i), st(i) + 0.3));
  const a = Math.round(pos);
  const ia = a === 0 ? 0.0 : st(a - 1) + 0.15;
  const ip = eO4(prog(lt, ia, ia + 0.45));
  const pop = eBack(prog(lt, ia - 0.05, ia + 0.3), 2.2);
  const rowH = v ? 120 : 118;
  const isz = v ? 380 : 400;
  const ix = v ? W / 2 : W * 0.28, iy = v ? H * 0.33 : H / 2;
  const lx = v ? 0 : W * 0.46, ly = v ? H * 0.64 : H / 2;
  return (
    <AbsoluteFill style={{background: COL.white, overflow: 'hidden'}}>
      <div style={{position: 'absolute', right: -80, bottom: v ? H * 0.02 : -120, fontFamily: SERIF, fontStyle: 'italic', fontSize: v ? 420 : 520, color: COL.ice, transform: `translateX(${-lt * 60}px)`}}>cura</div>
      <div style={{position: 'absolute', top: v ? 200 : 110, left: v ? 0 : W * 0.46, width: v ? W : undefined}}>
        <Kicker text="Cosa trattiamo" lt={lt} d={0.05} center={v} size={v ? 26 : 22} />
      </div>
      <div style={{position: 'absolute', left: ix - isz / 2, top: iy - isz / 2, width: isz, height: isz, borderRadius: isz, background: COL.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${clamp(pop, 0, 2) * 0.12 + 0.88}) rotate(${(pos - a) * 40}deg)`, boxShadow: '0 40px 90px rgba(19,37,64,.28)'}}>
        <Icon k={a} p={ip} size={isz * 0.52} color={COL.gold} />
      </div>
      <div style={{position: 'absolute', left: ix - isz / 2 - 30, top: iy - isz / 2 - 30, width: isz + 60, height: isz + 60}}>
        <div style={{position: 'absolute', left: (isz + 60) / 2, top: (isz + 60) / 2}}>
          <LensRing r={isz / 2 + 10} p={eO4(prog(lt, 0, 0.8))} rot={pos * 72} color={COL.goldDeep} ticks={60} w={2} />
        </div>
      </div>
      <div style={{position: 'absolute', left: ix - 60, top: iy + isz / 2 + 56, fontFamily: SERIF, fontSize: 40, color: COL.goldDeep}}>0{a + 1}<span style={{color: COL.mute, fontSize: 24}}> / 05</span></div>
      {SERV.map((s, i) => {
        const dd = i - pos, ad = Math.abs(dd);
        if (ad > 2.6) return null;
        const o = clamp(1 - ad * 0.62, 0, 1) * eO4(prog(lt, 0.05 + i * 0.04, 0.5 + i * 0.04));
        return (
          <div key={s} style={{position: 'absolute', left: lx, top: ly + dd * rowH - rowH / 2, width: v ? W : W * 0.52, height: rowH, display: 'flex', alignItems: 'center', justifyContent: v ? 'center' : 'flex-start', fontFamily: SERIF, fontSize: (v ? 70 : 76) * (1 - Math.min(1, ad) * 0.3), color: ad < 0.5 ? COL.ink : COL.mute, opacity: o, fontStyle: ad < 0.5 ? 'normal' : 'italic', whiteSpace: 'nowrap', filter: ad > 0.6 ? `blur(${(ad - 0.6) * 3}px)` : undefined}}>
            {s}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ═════════════ S5 — ABCDE: il neo che cambia ═════════════ */
const STAGES: [string, string][] = [['A', 'Asimmetria'], ['B', 'Bordi'], ['C', 'Colore'], ['D', 'Dimensione'], ['E', 'Evoluzione']];
const ST0 = [0.35, 1.05, 1.75, 2.45, 3.15];
const blobPath = (R: number, f: (th: number) => number, n = 180) => {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const th = (i / n) * Math.PI * 2, r = R * f(th);
    d += `${i ? 'L' : 'M'}${(Math.cos(th) * r).toFixed(2)} ${(Math.sin(th) * r).toFixed(2)}`;
  }
  return d + 'Z';
};
const S5: React.FC<{lt: number}> = ({lt}) => {
  const {W, H, v} = useD();
  const u = lt;
  const asym = eIO(prog(u, ST0[0], ST0[0] + 0.45));
  const jag = eIO(prog(u, ST0[1], ST0[1] + 0.45));
  const col = eIO(prog(u, ST0[2], ST0[2] + 0.45));
  const dim = eIO(prog(u, ST0[3], ST0[3] + 0.45));
  const evo = prog(u, ST0[4], 4.0);
  const stage = ST0.filter((s) => u >= s).length - 1;
  const Rd = v ? 400 : 360;
  const dx = v ? W / 2 : W * 0.34, dy = v ? H * 0.36 : H / 2;
  const R0 = Rd * 0.3 * (1 + dim * 0.32 + eO3(evo) * 0.18) * eBack(prog(u, 0.0, 0.35), 2);
  const f = (th: number, ph = 0) => 1 + asym * (0.2 * Math.cos(th) + 0.09 * Math.cos(2 * th + 0.8)) + jag * (0.055 * Math.sin(9 * th) + 0.035 * Math.sin(17 * th + 1.3) + 0.025 * Math.sin(29 * th + 2)) + evo * 0.09 * Math.sin(3 * th + u * 4 + ph);
  const path = blobPath(R0, (th) => f(th));
  const r = rnd(11);
  const pores = Array.from({length: 90}).map((_, i) => {
    const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * Rd;
    return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={1 + r() * 2.2} fill="#9C6B52" opacity={0.18} />;
  });
  const flipIn = (i: number) => eO4(prog(u, ST0[i], ST0[i] + 0.3));
  const bx = v ? W / 2 : W * 0.66, by = v ? H * 0.74 : H / 2;
  return (
    <AbsoluteFill style={{background: COL.navyDeep, overflow: 'hidden'}}>
      <Glow t={u} color={COL.blue} o={0.4} x={v ? 0.5 : 0.34} y={v ? 0.36 : 0.5} size={0.9} />
      <Dust t={u + 7} n={30} seed={5} o={0.6} />
      <div style={{position: 'absolute', top: v ? 150 : 90, left: v ? 0 : W * 0.56, width: v ? W : undefined}}>
        <Kicker text="Quando controllare un neo" lt={u} d={0.05} color={COL.gold} center={v} size={v ? 26 : 22} />
      </div>
      <div style={{position: 'absolute', left: dx, top: dy, transform: `scale(${1 + u * 0.02}) rotate(${u * 2}deg)`}}>
        <svg width={Rd * 2} height={Rd * 2} viewBox={`${-Rd} ${-Rd} ${Rd * 2} ${Rd * 2}`} style={{position: 'absolute', left: -Rd, top: -Rd, overflow: 'visible'}}>
          <defs>
            <radialGradient id="skin" cx="40%" cy="35%" r="75%"><stop offset="0" stopColor="#F3D5C0" /><stop offset="0.7" stopColor="#E2B497" /><stop offset="1" stopColor="#C98F72" /></radialGradient>
            <radialGradient id="neoC" cx="58%" cy="45%" r="70%"><stop offset="0" stopColor="#231109" /><stop offset="0.35" stopColor="#5A321F" /><stop offset="0.62" stopColor="#9B5E43" /><stop offset="0.8" stopColor="#3B2116" /><stop offset="1" stopColor="#B07457" /></radialGradient>
            <clipPath id="disc"><circle r={Rd} /></clipPath>
          </defs>
          <circle r={Rd} fill="url(#skin)" />
          <g clipPath="url(#disc)">{pores}</g>
          {evo > 0 && [0.75, 0.55, 0.35].map((k, i) => (
            <path key={i} d={blobPath(R0 * (1 - (i + 1) * 0.1 * eO3(evo)), (th) => f(th, -(i + 1) * 0.9))} fill="none" stroke={COL.gold} strokeWidth={2} strokeDasharray="6 8" opacity={k * eO3(prog(evo, 0, 0.3))} />
          ))}
          <path d={path} fill="#5B3624" />
          <path d={path} fill="url(#neoC)" opacity={col} />
          <path d={path} fill="none" stroke={COL.gold} strokeWidth={4} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - eO4(prog(u, ST0[1], ST0[1] + 0.5))} opacity={1 - prog(u, ST0[2] + 0.2, ST0[2] + 0.6)} />
          {/* A: asse di simmetria */}
          <line x1={-R0 * 0.08} y1={-R0 * 1.6 * eO4(prog(u, ST0[0], ST0[0] + 0.35))} x2={-R0 * 0.08} y2={R0 * 1.6 * eO4(prog(u, ST0[0], ST0[0] + 0.35))} stroke={COL.gold} strokeWidth={3} strokeDasharray="10 10" opacity={1 - prog(u, ST0[1], ST0[1] + 0.3)} />
          {/* D: misura */}
          {(() => {
            const p = eO4(prog(u, ST0[3], ST0[3] + 0.4)), o = 1 - prog(u, ST0[4] + 0.1, ST0[4] + 0.4);
            const L = R0 * 1.15;
            return (
              <g opacity={o * clamp(p * 3)} transform={`translate(0 ${R0 * 1.45})`}>
                <line x1={-L * p} x2={L * p} y1={0} y2={0} stroke={COL.white} strokeWidth={3} />
                <line x1={-L * p} x2={-L * p} y1={-14} y2={14} stroke={COL.white} strokeWidth={3} />
                <line x1={L * p} x2={L * p} y1={-14} y2={14} stroke={COL.white} strokeWidth={3} />
                <text y={-24} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={34} fill={COL.white} letterSpacing={2}>{'> 6 mm'}</text>
              </g>
            );
          })()}
          {/* C: tonalità */}
          {['#231109', '#5A321F', '#9B5E43', '#B07457'].map((c, i) => {
            const p = eBack(prog(u, ST0[2] + 0.1 + i * 0.07, ST0[2] + 0.4 + i * 0.07), 2.5) * (1 - prog(u, ST0[3] + 0.1, ST0[3] + 0.35));
            const a = -0.9 + i * 0.6;
            return <circle key={c} cx={Math.cos(a) * Rd * 0.72} cy={Math.sin(a) * Rd * 0.72} r={26 * clamp(p, 0, 1.3)} fill={c} stroke={COL.gold} strokeWidth={3} />;
          })}
        </svg>
        <LensRing r={Rd + 18} p={eO4(prog(u, -0.3, 0.6))} rot={u * 30 + stage * 18} />
      </div>
      {/* badge lettera + parola */}
      <div style={{position: 'absolute', left: bx, top: by, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: v ? 'center' : 'flex-start', width: v ? W : 620}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 36, flexDirection: v ? 'column' : 'row'}}>
          <div style={{position: 'relative', width: 170, height: 170, perspective: 600}}>
            {STAGES.map(([L], i) => {
              const p = flipIn(i), q = i < 4 ? flipIn(i + 1) : 0;
              if (p <= 0 || q >= 1) return null;
              return <div key={L} style={{position: 'absolute', inset: 0, background: COL.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 120, color: COL.navyDeep, transform: `rotateX(${(1 - p) * -90 + q * 90}deg)`, backfaceVisibility: 'hidden'}}>{L}</div>;
            })}
          </div>
          <div style={{position: 'relative', height: 130, width: v ? W : 520, overflow: 'hidden'}}>
            {STAGES.map(([L, w], i) => {
              const p = flipIn(i), q = i < 4 ? flipIn(i + 1) : 0;
              if (p <= 0 || q >= 1) return null;
              return <div key={L} style={{position: 'absolute', left: 0, right: 0, textAlign: v ? 'center' : 'left', fontFamily: SERIF, fontStyle: 'italic', fontSize: v ? 104 : 96, color: COL.white, lineHeight: '130px', transform: `translateY(${(1 - p) * 100 - q * 100}%)`}}>{w}</div>;
            })}
          </div>
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 50}}>
          {STAGES.map(([L], i) => {
            const on = flipIn(i);
            const show = eO4(prog(u, 0.1 + i * 0.05, 0.4 + i * 0.05));
            return <div key={L} style={{width: 54, height: 54, border: `2px solid ${COL.gold}`, background: on > 0.5 ? COL.gold : 'transparent', color: on > 0.5 ? COL.navyDeep : COL.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 30, opacity: show, transform: `translateY(${(1 - show) * 30}px) scale(${1 + 0.25 * Math.sin(Math.PI * clamp(on))})`}}>{L}</div>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═════════════ S6 — la visita in 3 passi ═════════════ */
const STEPS = ['Ascolto', 'Esame della pelle', 'Piano su misura'];
const S6: React.FC<{lt: number}> = ({lt}) => {
  const {W, H, v} = useD();
  const lp = eIO(prog(lt, -0.1, 0.9));
  const x0 = W * 0.14, x1 = W * 0.86, y0 = H * 0.3, y1 = H * 0.8;
  return (
    <AbsoluteFill style={{background: COL.ice, overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: v ? 170 : 120, width: W}}>
        <Kicker text="La visita, in tre passi" lt={lt} d={0} center size={v ? 26 : 22} />
      </div>
      {v ? (
        <div style={{position: 'absolute', left: 200, top: y0, width: 3, height: (y1 - y0) * lp, background: COL.gold}} />
      ) : (
        <div style={{position: 'absolute', left: x0, top: H * 0.56, width: (x1 - x0) * lp, height: 3, background: COL.gold}} />
      )}
      {STEPS.map((s, i) => {
        const d = 0.05 + i * 0.3;
        const p = eO5(prog(lt, d, d + 0.45));
        const n = eBack(prog(lt, d, d + 0.35), 2.4);
        const cx = v ? 200 : lerp(x0, x1, (i + 0.5) / 3), cy = v ? lerp(y0, y1, (i + 0.4) / 3) : H * 0.56;
        return (
          <React.Fragment key={s}>
            <div style={{position: 'absolute', left: cx - 16, top: cy - 16, width: 32, height: 32, borderRadius: 32, background: COL.navy, border: `5px solid ${COL.gold}`, transform: `scale(${n})`}} />
            <div style={{position: 'absolute', left: v ? cx + 70 : cx - 300, top: v ? cy - 120 : cy - 250, width: v ? W - cx - 100 : 600, textAlign: v ? 'left' : 'center'}}>
              <div style={{overflow: 'hidden'}}>
                <div style={{fontFamily: SERIF, fontSize: v ? 150 : 170, color: COL.gold, lineHeight: 1.05, transform: `translateY(${(1 - p) * 105}%)`}}>0{i + 1}</div>
              </div>
            </div>
            <div style={{position: 'absolute', left: v ? cx + 74 : cx - 300, top: v ? cy + 50 : cy + 50, width: v ? W - cx - 100 : 600, textAlign: v ? 'left' : 'center', fontFamily: SERIF, fontSize: v ? 62 : 54, color: COL.ink, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>{s}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/* ═════════════ S7 — CTA con la landing che scorre nel telefono ═════════════ */
const LANDING_H = 4182 / 900; // altezza/larghezza dell'immagine
const S7: React.FC<{lt: number}> = ({lt}) => {
  const {W, H, v} = useD();
  const fw = v ? 470 : 430, fh = fw * 2.05, bz = 16;
  const sw = fw - bz * 2, sh = fh - bz * 2;
  const fx = v ? W / 2 - fw / 2 : W * 0.2, fy = v ? 150 : (H - fh) / 2;
  const enter = eO5(prog(lt, -0.3, 0.6));
  const sc = eIO(prog(lt, 0.15, 1.7));
  const scrollMax = sw * LANDING_H - sh;
  const back = eIO(prog(lt, 1.7, 2.1));
  const scroll = scrollMax * sc * (1 - back);
  const btn = eBack(prog(lt, 1.1, 1.45), 2);
  const click = prog(lt, 2.05, 2.5);
  const press = 1 - 0.07 * Math.sin(Math.PI * clamp(click * 2.2));
  const cur = eIO(prog(lt, 1.5, 2.0));
  const tx = v ? 0 : W * 0.5, tw = v ? W : W * 0.44, ty = v ? fy + fh + 70 : H * 0.2;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${COL.sky}, ${COL.ice})`, overflow: 'hidden'}}>
      <Dust t={lt} n={24} seed={2} color={COL.blueSoft} o={0.7} />
      <div style={{position: 'absolute', left: fx, top: fy, width: fw, height: fh, borderRadius: 64, background: COL.navyDeep, boxShadow: '0 50px 120px rgba(19,37,64,.35)', transform: `perspective(1600px) translateY(${(1 - enter) * 500}px) rotateY(${(1 - enter) * 28 + Math.sin(lt * 1.4) * 4}deg) rotateZ(${(1 - enter) * -10}deg)`}}>
        <div style={{position: 'absolute', left: bz, top: bz, width: sw, height: sh, borderRadius: 50, overflow: 'hidden', background: COL.white}}>
          <Img src={staticFile('landing.jpg')} style={{width: sw, transform: `translateY(${-scroll}px)`, filter: sc > 0.05 && sc < 0.95 && back === 0 ? `blur(${Math.sin(Math.PI * sc) * 2.2}px)` : undefined}} />
          <div style={{position: 'absolute', top: 18, left: sw / 2 - 55, width: 110, height: 30, borderRadius: 20, background: COL.navyDeep}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: tx, top: ty, width: tw, display: 'flex', flexDirection: 'column', alignItems: v ? 'center' : 'flex-start', textAlign: v ? 'center' : 'left'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16, opacity: eO4(prog(lt, 0.1, 0.5))}}>
          <Fly text="LONGEVITAS" lt={lt} d={0.05} stag={0.03} style={{fontFamily: SERIF, fontSize: v ? 52 : 46, letterSpacing: 8, color: COL.navy}} />
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: v ? 20 : 17, letterSpacing: 5, color: COL.goldDeep}}>DERMATOLOGIA</div>
        </div>
        <div style={{height: v ? 36 : 44}} />
        <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: v ? 96 : 92, lineHeight: 1.06, color: COL.ink}}>
          <Words text="Fissa la tua visita" lt={lt} d={0.35} />
          <br />
          <Words text="dermatologica." lt={lt} d={0.6} italic color={COL.blue} />
        </div>
        <div style={{height: v ? 50 : 56}} />
        <div style={{position: 'relative', transform: `scale(${clamp(btn, 0, 1.3) * press})`, opacity: clamp(btn * 2)}}>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: v ? 30 : 26, letterSpacing: 5, color: COL.white, background: COL.blue, padding: v ? '34px 64px' : '30px 58px', boxShadow: '0 20px 50px rgba(63,103,173,.4)'}}>PRENOTA LA VISITA</div>
          {click > 0 && click < 1 && <div style={{position: 'absolute', left: '50%', top: '50%', width: 600 * eO4(click), height: 600 * eO4(click), marginLeft: -300 * eO4(click), marginTop: -300 * eO4(click), borderRadius: 600, border: `3px solid ${COL.gold}`, opacity: 1 - click}} />}
          <svg width="46" height="46" viewBox="0 0 24 24" style={{position: 'absolute', left: lerp(v ? 460 : 520, v ? 300 : 260, cur), top: lerp(260, 52, cur), opacity: clamp(cur * 4) * (1 - prog(lt, 2.7, 2.95)), filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.3))'}}>
            <path d="M4 2 L4 20 L9 15 L12 22 L15 21 L12 14 L19 14Z" fill={COL.white} stroke={COL.navyDeep} strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{height: 40}} />
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: v ? 28 : 22, letterSpacing: 3, color: COL.navy, opacity: eO4(prog(lt, 1.5, 1.9))}}>Rivoli · Torino &nbsp;—&nbsp; anche su WhatsApp</div>
      </div>
    </AbsoluteFill>
  );
};

/* ═════════════ regia ═════════════ */
const SCENES: {C: React.FC<{lt: number}>; pre: number; tr: Tr; bg: string; at?: (d: Dim) => [number, number]}[] = [
  {C: S0, pre: 0, tr: 'none', bg: COL.ice},
  {C: S1, pre: 0, tr: 'none', bg: COL.navy},
  {C: S2, pre: 0.5, tr: 'iris', bg: COL.ice},
  {C: S3, pre: 0.42, tr: 'slats', bg: COL.navyDeep},
  {C: S4, pre: 0.38, tr: 'diag', bg: COL.white},
  {C: S5, pre: 0.45, tr: 'iris', bg: COL.navyDeep, at: ({W, H, v}) => (v ? [W / 2, H * 0.36] : [W * 0.34, H / 2])},
  {C: S6, pre: 0.36, tr: 'slatsH', bg: COL.ice},
  {C: S7, pre: 0.38, tr: 'diag', bg: COL.sky},
];

export const Movie: React.FC<{width: number; height: number}> = ({width, height}) => {
  const t = useCurrentFrame() / FPS;
  const dim = {W: width, H: height, v: height > width};
  return (
    <Ctx.Provider value={dim}>
      <AbsoluteFill style={{background: COL.navy, overflow: 'hidden'}}>
        {SCENES.map((s, i) => {
          const a = SC[i], b = SC[i + 1];
          if (t < a - s.pre || t >= b) return null;
          const [cx, cy] = s.at ? s.at(dim) : [width / 2, height / 2];
          return (
            <Enter key={i} lt={t - a} pre={s.pre} type={s.tr} cx={cx} cy={cy} bg={s.bg}>
              <s.C lt={t - a} />
            </Enter>
          );
        })}
        <AbsoluteFill style={{background: COL.ice, opacity: 1 - prog(t, 0, 0.15)}} />
      </AbsoluteFill>
    </Ctx.Provider>
  );
};
