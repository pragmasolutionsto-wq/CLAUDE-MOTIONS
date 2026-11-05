import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import S from './shots.json';
import {Bed3D, Blood3D, Clock3D, Heart3D, Logo3D, Mode, Oximeter3D, Text3D} from './three';
import {
  CREAM, CREAM_2, DURATION, FPS, GOLD, GRAD, GRAD_G, GREEN, GREEN_D, GREEN_DD, H, HOT, MAUVE, MINT, MONT, PINK, PINK_HI, ROSE, SAGE, SENTS, SERIF, W, WHITE, WS,
  clamp, eBack, eIO, eO3, eO5, lerp, prog, rnd, spring,
} from './util';

type Shot = {name: string; kind: string; a: number; b: number; tr: string};
const SHOTS = S.shots as Shot[];
const K = S.k as Record<string, number>;
const sh = (name: string) => SHOTS.find((x) => x.name === name)!;
const PAD = 0.5; // margine delle clip (prep_ai.py)
const TR: Record<string, number> = {cube: 0.6, whip: 0.36, none: 0};
const SUB_Y = 1540;

/* ------------------------------------------------------------------ sfondi */

// capelli che cadono lenti: curve morbide che scendono e ruotano
const Strands: React.FC<{t: number; n?: number; seed?: number; c?: string; o?: number; speed?: number}> = ({t, n = 14, seed = 3, c = '#8a5a3c', o = 0.5, speed = 1}) => {
  const r = rnd(seed);
  const it = Array.from({length: n}, () => ({x: r() * W, y: r() * H, v: (40 + r() * 70) * speed, rot: r() * 360, vr: (r() - 0.5) * 40, s: 0.6 + r() * 0.9, ph: r() * 6}));
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {it.map((p, i) => {
        const y = ((p.y + t * p.v) % (H + 300)) - 150;
        return (
          <g key={i} transform={`translate(${p.x + Math.sin(t * 0.8 + p.ph) * 40} ${y}) rotate(${p.rot + t * p.vr}) scale(${p.s})`} opacity={o}>
            <path d="M0 -90 C 30 -50, -30 -10, 0 30 S 30 80, 8 110" fill="none" stroke={c} strokeWidth={3.2} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};

// crema caldo con bolle rosa e salvia che respirano
const Cream: React.FC<{t: number; strands?: number}> = ({t, strands = 10}) => (
  <AbsoluteFill style={{background: `linear-gradient(170deg, #FFF9F3 0%, ${CREAM} 45%, ${CREAM_2} 100%)`, overflow: 'hidden'}}>
    {[[PINK, -220, 140, 900], [MINT, 520, 820, 800], [PINK_HI, -120, 1300, 1000]].map(([c, x, y, s], i) => (
      <div key={i} style={{position: 'absolute', width: s as number, height: s as number, borderRadius: 999, left: (x as number) + Math.sin(t * 0.5 + i * 2) * 80, top: (y as number) + Math.cos(t * 0.4 + i) * 70,
        background: `radial-gradient(circle, ${c}cc 0%, ${c}00 65%)`}} />
    ))}
    <Strands t={t} n={strands} o={0.28} />
  </AbsoluteFill>
);

// verde bosco profondo, bokeh rosa, foglioline
const Forest: React.FC<{t: number; glow?: string}> = ({t, glow = PINK}) => {
  const r = rnd(9);
  const pts = Array.from({length: 34}, () => ({x: r() * W, y: r() * H, s: 6 + r() * 22, v: 10 + r() * 30, ph: r() * 6, c: [PINK, PINK_HI, SAGE, GOLD][Math.floor(r() * 4)]}));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${GREEN} 0%, ${GREEN_D} 45%, ${GREEN_DD} 100%)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -200, right: -200, top: 380, height: 900, background: `radial-gradient(ellipse, ${glow}55 0%, transparent 60%)`, filter: 'blur(30px)'}} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {pts.map((p, i) => {
          const y = (((p.y - t * p.v) % H) + H) % H;
          return <circle key={i} cx={p.x + Math.sin(t + p.ph) * 18} cy={y} r={p.s / 2} fill={p.c} opacity={0.12 + 0.18 * Math.sin(t * 1.5 + p.ph) ** 2} style={{filter: 'blur(2px)'}} />;
        })}
      </svg>
      <Strands t={t} n={8} c={PINK_HI} o={0.16} seed={5} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ tipografia */

type Box = 'pink' | 'white' | 'green' | 'none';
const Line: React.FC<{t: number; a: number; text: string; size?: number; box?: Box; color?: string; out?: number; delay?: number; serif?: boolean}> = ({t, a, text, size = 96, box = 'none', color = GREEN_D, out = 99, delay = 0, serif}) => {
  const p = prog(t, a + delay, a + delay + 0.55);
  if (p <= 0) return null;
  const s = spring(p * 1.8);
  const o = eO3(prog(t, out - 0.2, out));
  const bg = box === 'pink' ? GRAD : box === 'white' ? WHITE : box === 'green' ? GRAD_G : 'transparent';
  const fg = box === 'pink' ? GREEN_DD : box === 'white' ? GREEN : box === 'green' ? CREAM : color;
  return (
    <div style={{overflow: 'hidden', padding: '6px 12px'}}>
      <div style={{fontFamily: serif ? SERIF : MONT, fontWeight: serif ? 700 : 900, fontStyle: serif ? 'italic' : 'normal', fontSize: serif ? size * 1.15 : size, lineHeight: 1.04,
        textTransform: serif ? 'none' : 'uppercase', letterSpacing: serif ? '0' : '-0.01em', color: fg, background: bg,
        padding: box === 'none' ? 0 : '10px 30px 14px', borderRadius: 22, boxShadow: box === 'none' ? 'none' : '0 16px 40px rgba(38,86,42,0.28)',
        textShadow: box === 'none' && (color === WHITE || color === CREAM || color === PINK_HI) ? '0 6px 24px rgba(10,30,12,0.5)' : 'none',
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
  const st = {fill: 'none', stroke: c, strokeWidth: 2.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const P: Record<string, React.ReactNode> = {
    brush: <><rect {...st} x="8" y="2" width="8" height="10" rx="3" /><path {...st} d="M10 5v4M14 5v4M12 12v9" /></>,
    shoulder: <><circle {...st} cx="12" cy="6" r="3.5" /><path {...st} d="M3 21c0-5 4-8 9-8s9 3 9 8" /></>,
    sink: <><path {...st} d="M3 11h18a9 9 0 0 1-18 0z" /><path {...st} d="M12 11V5a2 2 0 0 1 4 0" /></>,
    sun: <><circle {...st} cx="12" cy="12" r="4.5" /><path {...st} d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>,
    flame: <path {...st} d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 2-5 5-5 8 0 4 3 7 7 7z" />,
    leaf: <><path {...st} d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z" /><path {...st} d="M5 19l8-8" /></>,
    moon: <path {...st} d="M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z" />,
    drop: <path {...st} d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z" />,
    check: <path {...st} d="M5 12l5 5 9-10" />,
    plus: <path {...st} d="M12 5v14M5 12h14" />,
    shield: <path {...st} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
    dryer: <><circle {...st} cx="9" cy="9" r="6" /><circle {...st} cx="9" cy="9" r="2" /><path {...st} d="M15 7h6v4h-6M8 15l-1 7h4l1-6" /></>,
    iron: <><rect {...st} x="4" y="2" width="5" height="20" rx="2" /><rect {...st} x="12" y="2" width="5" height="20" rx="2" /><path {...st} d="M9 6h3" /></>,
    palette: <><path {...st} d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8z" /><circle {...st} cx="7.5" cy="11" r="1" /><circle {...st} cx="10" cy="7" r="1" /><circle {...st} cx="15" cy="7" r="1" /></>,
    spark: <path {...st} d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" />,
    capsule: <><rect {...st} x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-35 12 12)" /><path {...st} d="M10.2 7.4l3.6 9.2" /></>,
    calendar: <><rect {...st} x="3" y="5" width="18" height="16" rx="3" /><path {...st} d="M3 10h18M8 3v4M16 3v4" /></>,
    pin: <><path {...st} d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z" /><circle {...st} cx="12" cy="10" r="2.5" /></>,
    phone: <path {...st} d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2z" />,
    heart: <path {...st} d="M12 20s-7-4.5-9-9a4.5 4.5 0 0 1 9-3 4.5 4.5 0 0 1 9 3c-2 4.5-9 9-9 9z" />,
    chat: <path {...st} d="M4 5h16v11H9l-5 4z" />,
    bolt: <path {...st} d="M13 2L4 14h7l-1 8 9-12h-7z" />,
    up: <path {...st} d="M12 20V5M6 11l6-6 6 6" />,
    bag: <><path {...st} d="M5 8h14l-1 13H6z" /><path {...st} d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    face: <><circle {...st} cx="12" cy="12" r="9" /><path {...st} d="M8.5 14.5a4 4 0 0 0 7 0M9 10h.5M14.5 10h.5" /></>,
    shower: <><path {...st} d="M4 20V8a4 4 0 0 1 8 0M9 8h6a3 3 0 0 1 3 3" /><path {...st} d="M14 15v1M17 15v1M20 15v1M15 18v1M18 18v1" /></>,
    bottle: <><path {...st} d="M10 2h4v3h-4zM9 5h6l1 3v13H8V8z" /><path {...st} d="M8 12h8" /></>,
    eye: <><path {...st} d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle {...st} cx="12" cy="12" r="3" /></>,
    alert: <><path {...st} d="M12 3l10 18H2z" /><path {...st} d="M12 10v5M12 18v.5" /></>,
    family: <><circle {...st} cx="8" cy="7" r="3" /><circle {...st} cx="17" cy="9" r="2.4" /><path {...st} d="M3 21v-3a5 5 0 0 1 10 0v3M14 21v-2a3.5 3.5 0 0 1 7 0v2" /></>,
    scale: <><rect {...st} x="3" y="4" width="18" height="16" rx="4" /><path {...st} d="M8 9a5 5 0 0 1 8 0l-4 3z" /></>,
    pulse: <path {...st} d="M2 12h4l2-5 4 10 2-5h8" />,
    cake: <><path {...st} d="M4 21h16v-8H4zM4 16c2 1.5 4 1.5 6 0s4-1.5 6 0 3 1 4 0" /><path {...st} d="M12 13V9M12 6.5v.5" /></>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24">{P[name]}</svg>;
};

const Chip: React.FC<{t: number; a: number; text: string; icon: string; size?: number; tone?: 'white' | 'pink' | 'green' | 'hot'; out?: number; from?: 'left' | 'right'}> = ({t, a, text, icon, size = 40, tone = 'white', out = 99, from = 'left'}) => {
  const p = prog(t, a, a + 0.5);
  if (p <= 0) return null;
  const s = spring(p * 1.8);
  const o = eO3(prog(t, out - 0.2, out));
  const bg = tone === 'hot' ? HOT : tone === 'pink' ? GRAD : tone === 'green' ? GRAD_G : 'rgba(255,255,255,0.97)';
  const fg = tone === 'hot' || tone === 'green' ? CREAM : GREEN_DD;
  const ib = tone === 'hot' ? 'rgba(255,255,255,0.25)' : tone === 'pink' ? GREEN : tone === 'green' ? 'rgba(255,255,255,0.2)' : PINK;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 30px 10px 10px', borderRadius: 999, background: bg, boxShadow: '0 14px 34px rgba(22,58,28,0.3)',
      fontFamily: MONT, fontWeight: 900, fontSize: size, color: fg, textTransform: 'uppercase', whiteSpace: 'nowrap',
      transform: `translateX(${(1 - s) * (from === 'left' ? -260 : 260)}px) scale(${lerp(0.6, 1, s)})`, opacity: clamp(p * 4) * (1 - o)}}>
      <div style={{width: size * 1.55, height: size * 1.55, borderRadius: 99, background: ib, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={icon} c={tone === 'white' ? GREEN_DD : WHITE} s={size * 0.95} />
      </div>
      {text}
    </div>
  );
};

// testo 3D estruso in un riquadro
const T3: React.FC<{t: number; a: number; text: string; y: number; h?: number; size?: number; mode?: Mode; out?: number; spin?: number; x?: number; w?: number}> = ({t, a, text, y, h = 520, size, mode, out = 99, spin, x = 0, w = W}) => {
  if (t < a - 0.05 || t > out + 0.05) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, filter: 'drop-shadow(0 24px 34px rgba(38,60,30,0.35))'}}>
      <Text3D text={text} lt={t - a} w={w} h={h} size={size} mode={mode} spin={spin} out={prog(t, out - 0.3, out)} />
    </div>
  );
};

/* ------------------------------------------------------------------ sottotitoli parola per parola */

type Chunk = {a: number; b: number; words: [number, string][]};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  SENTS.forEach((st, k) => {
    const ws = WS.filter((x) => x[2] === k);
    let cur: [number, string][] = [];
    const flush = () => {
      if (cur.length) out.push({a: cur[0][0], b: 0, words: cur});
      cur = [];
    };
    ws.forEach(([t, word]) => {
      const len = cur.reduce((n, x) => n + x[1].length + 1, 0);
      if (cur.length && len + word.length > 18) flush();
      cur.push([t, word]);
      if (/[,.:?!…]$/.test(word)) flush();
    });
    flush();
    for (let i = out.length - 1; i >= 0 && out[i].b === 0; i--) out[i].b = i + 1 < out.length && out[i + 1].b !== 0 ? out[i + 1].a : st.end + 0.12;
  });
  for (let i = 0; i + 1 < out.length; i++) if (out[i].b > out[i + 1].a || out[i + 1].a - out[i].b < 0.25) out[i].b = Math.min(out[i].b, out[i + 1].a) || out[i + 1].a;
  return out;
})();

const Subs: React.FC<{t: number}> = ({t}) => {
  const c = CHUNKS.find((x) => t >= x.a - 0.04 && t < x.b);
  if (!c) return null;
  const p = prog(t, c.a - 0.04, c.a + 0.14);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: SUB_Y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 22px', transform: `scale(${lerp(0.86, 1, eBack(p))})`, opacity: clamp(p * 3)}}>
      {c.words.map(([wt, word], i) => {
        const on = t >= wt - 0.03;
        const next = c.words[i + 1]?.[0] ?? c.b;
        const act = on && t < next;
        const pp = prog(t, wt - 0.03, wt + 0.12);
        return (
          <span key={i} style={{fontFamily: MONT, fontWeight: 900, fontSize: 64, lineHeight: 1.12, textTransform: 'uppercase', color: act ? GREEN_DD : WHITE, opacity: on ? 1 : 0.6,
            background: act ? PINK_HI : 'transparent', borderRadius: 14, padding: act ? '0 12px' : '0 0', margin: act ? '0 -12px' : 0,
            WebkitTextStroke: act ? '0px transparent' : '10px rgba(22,58,28,0.94)', paintOrder: 'stroke fill', textShadow: act ? 'none' : '0 8px 22px rgba(0,0,0,0.35)',
            boxShadow: act ? '0 10px 26px rgba(22,58,28,0.4)' : 'none',
            display: 'inline-block', transform: `scale(${act ? lerp(1.16, 1.05, pp) : 1}) rotate(${act ? -2 : 0}deg)`}}>
            {word.replace(/[,.:…]$/, '')}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ elementi ricorrenti */

// logo sempre nello stesso punto (richiesta del cliente)
const Corner: React.FC = () => (
  <div style={{position: 'absolute', right: 36, top: 60, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px 10px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.94)', boxShadow: '0 8px 24px rgba(22,58,28,0.22)'}}>
    <Img src={staticFile('logo/mark.png')} style={{height: 56}} />
    <Img src={staticFile('logo/wordmark.png')} style={{height: 44}} />
  </div>
);

// clip 3D (già sulla durata giusta in prep_ai.py): leggera spinta in avanti continua
const Clip: React.FC<{name: string; t: number; z0?: number; dz?: number; y?: number; children?: React.ReactNode; shade?: number}> = ({name, t, z0 = 1.04, dz = 0.014, y = 0, children, shade = 1}) => {
  const s = sh(name);
  const lt = t - s.a;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: CREAM}}>
      <Sequence from={Math.round((s.a - PAD) * FPS)} layout="none">
        <OffthreadVideo src={staticFile(`ai/${name}.mp4`)} muted style={{width: W, height: H, objectFit: 'cover', transform: `translateY(${y}px) scale(${z0 + lt * dz})`}} />
      </Sequence>
      <AbsoluteFill style={{opacity: shade, background: 'linear-gradient(180deg, rgba(22,58,28,0.42) 0%, rgba(22,58,28,0) 20%, rgba(22,58,28,0) 66%, rgba(22,58,28,0.55) 100%)'}} />
      {children}
    </AbsoluteFill>
  );
};

// mirino morbido che aggancia un punto
const Target: React.FC<{t: number; a: number; x: number; y: number; r?: number; c?: string; label?: string}> = ({t, a, x, y, r = 110, c = WHITE, label}) => {
  const p = prog(t, a, a + 0.6);
  if (p <= 0) return null;
  const s = eBack(p, 1.2);
  const rot = (t - a) * 40;
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, transform: `scale(${lerp(2.2, 1, s)})`, opacity: clamp(p * 3)}}>
      <svg width={2 * r} height={2 * r} style={{overflow: 'visible', transform: `rotate(${rot}deg)`}}>
        <circle cx={r} cy={r} r={r - 4} fill="none" stroke={c} strokeWidth={5} strokeDasharray="34 20" />
        <circle cx={r} cy={r} r={r * 0.58} fill="none" stroke={c} strokeWidth={2.5} opacity={0.7} />
      </svg>
      {label && (
        <div style={{position: 'absolute', left: 2 * r + 16, top: r - 30, whiteSpace: 'nowrap', fontFamily: MONT, fontWeight: 900, fontSize: 36, color: GREEN_DD, background: c, padding: '6px 18px', borderRadius: 12,
          transform: `translateX(${(1 - eO3(prog(t, a + 0.3, a + 0.7))) * -30}px)`, opacity: prog(t, a + 0.3, a + 0.5)}}>
          {label}
        </div>
      )}
    </div>
  );
};

// card consiglio numerata che entra in profondità
const Tip: React.FC<{t: number; a: number; n: number; text: string; sub?: string; subA?: number; icon: string; y?: number}> = ({t, a, n, text, sub, subA = 99, icon, y = 1150}) => {
  const p = prog(t, a, a + 0.6);
  if (p <= 0) return null;
  const s = spring(p * 1.8);
  const q = eBack(prog(t, subA, subA + 0.5), 1.4);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, perspective: 1200}}>
      <div style={{borderRadius: 36, background: 'rgba(255,255,255,0.97)', boxShadow: '0 26px 60px rgba(22,58,28,0.35)', display: 'flex', alignItems: 'center', gap: 28, padding: '26px 34px',
        transform: `rotateX(${(1 - s) * 70}deg) translateZ(${(1 - s) * -300}px)`, transformOrigin: '50% 0%', opacity: clamp(p * 3)}}>
        <div style={{width: 130, height: 130, flex: '0 0 130px', borderRadius: 32, background: GRAD_G, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          <Icon name={icon} c={CREAM} s={76} />
          <div style={{position: 'absolute', top: -18, left: -18, width: 58, height: 58, borderRadius: 99, background: PINK, color: GREEN_DD, fontFamily: MONT, fontWeight: 900, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${WHITE}`}}>{n}</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
          <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 50, lineHeight: 1.04, color: GREEN_D, textTransform: 'uppercase'}}>{text}</div>
          {sub && <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 46, color: ROSE, opacity: clamp(q * 2), transform: `translateY(${(1 - q) * 20}px)`}}>{sub}</div>}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ inquadrature */

// notte: verde notte profondo, stelle che brillano, luna con alone
const Night: React.FC<{t: number; moon?: boolean}> = ({t, moon = true}) => {
  const r = rnd(17);
  const stars = Array.from({length: 70}, () => ({x: r() * W, y: r() * H * 0.75, s: 1.5 + r() * 3.5, ph: r() * 6, sp: 0.8 + r() * 2}));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #0a1a12 0%, #10291b 45%, #163a1c 100%)', overflow: 'hidden'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {stars.map((p, i) => <circle key={i} cx={p.x + Math.sin(t * 0.1 + p.ph) * 6} cy={p.y} r={p.s / 2} fill={i % 7 ? '#fff6e6' : PINK_HI} opacity={0.25 + 0.6 * Math.pow(Math.sin(t * p.sp + p.ph) * 0.5 + 0.5, 2)} />)}
      </svg>
      {moon && (
        <div style={{position: 'absolute', left: 56, top: 56, width: 110, height: 110}}>
          <div style={{position: 'absolute', inset: -120, borderRadius: 999, background: 'radial-gradient(circle, rgba(255,240,210,0.35) 0%, transparent 65%)'}} />
          <div style={{position: 'absolute', inset: 0, borderRadius: 999, background: 'radial-gradient(circle at 35% 35%, #fffaf0 0%, #f3e4c8 70%)', boxShadow: 'inset -26px -10px 0 0 rgba(200,170,120,0.25)'}} />
        </div>
      )}
      <Strands t={t} n={5} c={PINK_HI} o={0.08} seed={7} />
    </AbsoluteFill>
  );
};

// Z che salgono dal dormiente
const Zzz: React.FC<{t: number; x: number; y: number; on?: number}> = ({t, x, y, on = 1}) => (
  <svg width={500} height={500} style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity: on}}>
    {[0, 1, 2, 3].map((i) => {
      const ph = ((t * 0.55 + i * 0.25) % 1);
      return <text key={i} x={40 + ph * 160 + Math.sin(ph * 6 + i) * 20} y={420 - ph * 380} fontFamily={MONT} fontWeight={900} fontSize={60 + ph * 70} fill={i % 2 ? PINK_HI : CREAM} opacity={Math.sin(ph * Math.PI)}>Z</text>;
    })}
  </svg>
);

// linea del respiro: onde regolari, poi piatta (apnea), poi riprende
const BreathLine: React.FC<{t: number; y: number; stops: [number, number][]; c?: string}> = ({t, y, stops, c = '#8fd3f2'}) => {
  const span = 6;
  let d = '';
  for (let i = 0; i <= 220; i++) {
    const u = i / 220;
    const tt = t - span * (1 - u);
    const off = stops.reduce((m, [a, b]) => Math.max(m, prog(tt, a, a + 0.25) * (1 - prog(tt, b - 0.25, b))), 0);
    const amp = 70 * (1 - off);
    d += `${i ? 'L' : 'M'} ${60 + u * 960} ${y - Math.sin(tt * 2.6) * amp} `;
  }
  const flat = stops.some(([a, b]) => t > a + 0.2 && t < b - 0.1);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <path d={d} fill="none" stroke={flat ? HOT : c} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 14px ${flat ? HOT : c})`}} />
      <circle cx={1020} cy={y - Math.sin(t * 2.6) * 70 * (flat ? 0 : 1)} r={16} fill={WHITE} />
    </svg>
  );
};

// grafico della notte: ossigeno e frequenza cardiaca (nessun valore)
const NightChart: React.FC<{t: number; a: number; b: number; y: number; dip?: number; lens?: number}> = ({t, a, b, y, dip = 0, lens = 0}) => {
  const p = eIO(prog(t, a, b));
  const x0 = 110, x1 = 970, hh = 420;
  const o2 = (u: number) => y + 90 + Math.sin(u * 40) * 6 + Math.sin(u * 13) * 8 + (dip ? 70 * Math.exp(-Math.pow((u - 0.62) / 0.035, 2)) * dip : 0);
  const hr = (u: number) => y + 280 + Math.sin(u * 55) * 12 + Math.sin(u * 7) * 18;
  const path = (f: (u: number) => number) => {
    let d = '';
    for (let i = 0; i <= 200; i++) { const u = (i / 200) * p; d += `${i ? 'L' : 'M'} ${lerp(x0, x1, u)} ${f(u)} `; }
    return d;
  };
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <rect x={x0 - 40} y={y - 40} width={x1 - x0 + 80} height={hh + 120} rx={36} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={x0} x2={x1} y1={y + i * 120} y2={y + i * 120} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />)}
      <path d={path(o2)} fill="none" stroke="#8fd3f2" strokeWidth={9} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 10px #8fd3f2)'}} />
      <path d={path(hr)} fill="none" stroke={PINK_HI} strokeWidth={9} strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${PINK_HI})`}} />
      {['22:00', '02:00', '06:00'].map((s, i) => <text key={s} x={lerp(x0, x1, i / 2)} y={y + hh + 60} fill="rgba(255,255,255,0.6)" fontFamily={MONT} fontWeight={800} fontSize={30} textAnchor="middle">{s}</text>)}
      {lens > 0 && (
        <g opacity={lens} transform={`translate(${lerp(x0, x1, 0.62)} ${y + 130}) scale(${lerp(1.6, 1, eBack(lens, 1.4))})`}>
          <circle r={95} fill="rgba(255,255,255,0.12)" stroke={WHITE} strokeWidth={10} />
          <line x1={68} y1={68} x2={140} y2={140} stroke={WHITE} strokeWidth={18} strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

const ShAsk: React.FC<{t: number}> = ({t}) => (
  <>
    <Night t={t} />
    <Stack y={520}><Line t={t} a={0.1} text="ti faccio" size={110} serif color={PINK_HI} /></Stack>
    <Stack y={680}><Line t={t} a={K.domanda - 0.35} text="qualche domanda" size={76} box="white" /></Stack>
    <T3 t={t} a={0.2} text="?" y={880} h={520} size={3.4} mode="pink" spin={-1} />
  </>
);

const ShSnore: React.FC<{t: number}> = ({t}) => {
  const a = sh('snore').a;
  return (
    <>
      <Night t={t} />
      <div style={{position: 'absolute', left: 0, top: 560, width: W, height: 900}}><Bed3D lt={t - a + 1.2} w={W} h={900} /></div>
      <Zzz t={t} x={300} y={420} on={prog(t, a + 0.1, a + 0.5)} />
      <Stack y={190} gap={4}>
        <Line t={t} a={a + 0.02} text="durante la notte" size={60} color={CREAM} />
        <Line t={t} a={K.russi0 - 0.3} text="russi?" size={150} box="pink" />
      </Stack>
    </>
  );
};

const ShClock: React.FC<{t: number}> = ({t}) => {
  const a = sh('clock').a;
  return (
    <>
      <Cream t={t} strands={0} />
      <div style={{position: 'absolute', left: 0, top: 560, width: W, height: 760}}><Clock3D lt={t - a} w={W} h={760} /></div>
      <Stack y={190} gap={4}>
        <Line t={t} a={a + 0.02} text="ti svegli" size={86} serif color={ROSE} />
        <Line t={t} a={K.stanco0 - 0.3} text="già stanco?" size={120} box="green" />
      </Stack>
    </>
  );
};

// di giorno: batteria che si scarica
const ShDay: React.FC<{t: number}> = ({t}) => {
  const a = sh('day').a;
  const lvl = 1 - eIO(prog(t, K.sonnolenza0 - 0.4, K.stanchezza + 0.6)) * 0.85;
  const col = lvl > 0.5 ? GREEN : lvl > 0.3 ? GOLD : HOT;
  return (
    <>
      <Cream t={t} strands={0} />
      <div style={{position: 'absolute', left: 270, top: 520, width: 540, height: 290, borderRadius: 44, border: `16px solid ${GREEN_D}`, padding: 18, transform: `scale(${spring(prog(t, a, a + 0.6) * 1.8)})`}}>
        <div style={{height: '100%', width: `${lvl * 100}%`, borderRadius: 24, background: col, transition: 'none', boxShadow: `0 0 40px ${col}88`}} />
        <div style={{position: 'absolute', right: -52, top: 80, width: 34, height: 100, borderRadius: 10, background: GREEN_D}} />
      </div>
      <Stack y={190}><Line t={t} a={a + 0.02} text="durante il giorno" size={64} /></Stack>
      <Stack y={900} gap={14}>
        <Chip t={t} a={K.sonnolenza0 - 0.3} text="sonnolenza" icon="moon" size={56} tone="pink" />
        <Chip t={t} a={K.stanchezza - 0.3} text="stanchezza" icon="bolt" size={56} tone="green" from="right" />
      </Stack>
    </>
  );
};

// se la risposta è sì: le tre domande si spuntano
const ShSignals: React.FC<{t: number}> = ({t}) => {
  const a = sh('signals').a;
  const items: [string, string][] = [['russi di notte', 'moon'], ['stanco al risveglio', 'calendar'], ['sonnolenza di giorno', 'sun']];
  return (
    <>
      <Forest t={t} />
      <Stack y={200} gap={4}>
        <Line t={t} a={a + 0.02} text="se la risposta è" size={64} color={CREAM} />
        <Line t={t} a={K.si1 - 0.3} text="sì" size={170} box="pink" />
      </Stack>
      <div style={{position: 'absolute', left: 80, right: 80, top: 640, display: 'flex', flexDirection: 'column', gap: 22}}>
        {items.map(([tx, ic], i) => {
          const at = K.si1 + 0.1 + i * 0.35;
          const p = prog(t, a + 0.3 + i * 0.25, a + 0.8 + i * 0.25);
          const ck = eBack(prog(t, at, at + 0.4), 1.8);
          return (
            <div key={tx} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '18px 30px 18px 18px', borderRadius: 999, background: WHITE, boxShadow: '0 18px 40px rgba(0,0,0,0.3)', opacity: clamp(p * 3), transform: `translateX(${(1 - spring(p * 1.8)) * -300}px)`}}>
              <div style={{width: 84, height: 84, borderRadius: 99, background: MINT, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} c={GREEN_D} s={52} /></div>
              <div style={{flex: 1, fontFamily: MONT, fontWeight: 900, fontSize: 44, color: GREEN_D, textTransform: 'uppercase'}}>{tx}</div>
              <div style={{width: 84, height: 84, borderRadius: 99, background: GRAD_G, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${ck})`}}><Icon name="check" c={CREAM} s={56} /></div>
            </div>
          );
        })}
      </div>
      <Stack y={1210}><Line t={t} a={K.sottovalutare - 0.4} text="non sottovalutarli" size={80} serif color={PINK_HI} /></Stack>
    </>
  );
};

// polmoni stilizzati che respirano
const ShResp: React.FC<{t: number}> = ({t}) => {
  const a = sh('resp').a;
  const b = 1 + 0.06 * Math.sin(t * 2.4);
  const lung = (f: number) => `M ${540 + f * 30} 640 C ${540 + f * 250} 600, ${540 + f * 300} 900, ${540 + f * 270} 1060 C ${540 + f * 240} 1150, ${540 + f * 90} 1150, ${540 + f * 50} 1060 C ${540 + f * 30} 950, ${540 + f * 30} 800, ${540 + f * 30} 640 Z`;
  return (
    <>
      <Night t={t} moon={false} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: prog(t, a, a + 0.5)}}>
        <g transform={`translate(540 880) scale(${b}) translate(-540 -880)`}>
          {[-1, 1].map((f) => <path key={f} d={lung(f)} fill={PINK} stroke={PINK_HI} strokeWidth={8} opacity={0.95} />)}
          <path d="M 540 480 L 540 640 M 540 640 L 470 700 M 540 640 L 610 700" stroke={PINK_HI} strokeWidth={22} strokeLinecap="round" fill="none" />
        </g>
      </svg>
      <Stack y={200} gap={4}>
        <Line t={t} a={K.disturbi1 - 0.3} text="disturbi" size={110} box="white" />
        <Line t={t} a={K.respiratori1 - 0.3} text="respiratori" size={110} serif color={PINK_HI} />
      </Stack>
      <Stack y={1250}><Chip t={t} a={K.notte1 - 0.4} text="durante la notte" icon="moon" size={46} tone="green" /></Stack>
    </>
  );
};

const ShApnea: React.FC<{t: number}> = ({t}) => {
  const a = sh('apnea').a;
  return (
    <>
      <Night t={t} />
      <Stack y={420}><Line t={t} a={a + 0.02} text="hai mai sentito parlare di" size={52} color={CREAM} /></Stack>
      <T3 t={t} a={K.apnea - 0.35} text="APNEA" y={520} h={380} size={1.7} mode="pink" />
      <Stack y={900}><Line t={t} a={K.notturna1 - 0.3} text="notturna?" size={120} serif color={CREAM} /></Stack>
    </>
  );
};

// il respiro si interrompe più volte
const ShBreath: React.FC<{t: number}> = ({t}) => {
  const a = sh('breath').a;
  const i0 = K.interrompe - 0.1;
  const stops: [number, number][] = [[i0, i0 + 0.8], [i0 + 1.5, i0 + 2.2], [i0 + 2.9, i0 + 3.5]];
  const holding = stops.some(([x, y]) => t > x + 0.2 && t < y - 0.1);
  return (
    <>
      <Night t={t} />
      <div style={{position: 'absolute', left: 0, top: 840, width: W, height: 760, opacity: 0.95}}><Bed3D lt={t - a + 3} w={W} h={760} breath={() => (holding ? 0 : Math.sin(t * 2.6) * 0.5 + 0.5)} mood={holding ? 0.4 : 0} /></div>
      <BreathLine t={t} y={600} stops={stops} />
      <Stack y={190} gap={4}>
        <Line t={t} a={K.respiro - 0.3} text="il respiro" size={84} serif color={CREAM} />
        <Line t={t} a={K.interrompe - 0.3} text="si interrompe" size={100} box="pink" />
      </Stack>
      {holding && <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center'}}><div style={{fontFamily: MONT, fontWeight: 900, fontSize: 46, color: WHITE, background: HOT, padding: '6px 26px', borderRadius: 999}}>PAUSA</div></div>}
      <Stack y={1340}><Chip t={t} a={K.riposi - 0.3} text="non riposi bene" icon="moon" size={44} /></Stack>
    </>
  );
};

// ossigeno giù, anidride carbonica su
const ShOxygen: React.FC<{t: number}> = ({t}) => {
  const a = sh('oxygen').a;
  const o2 = 1 - eIO(prog(t, K.diminuisca - 0.6, K.diminuisca + 0.8)) * 0.75;
  const co2 = eIO(prog(t, K.aumenti - 0.3, K.anidride + 0.9));
  const Bar: React.FC<{v: number; c: string; label: string; up: boolean; x: number}> = ({v, c, label, up, x}) => (
    <div style={{position: 'absolute', left: x, top: 1000, width: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
      <div style={{width: 120, height: 300, borderRadius: 60, background: 'rgba(255,255,255,0.12)', border: '4px solid rgba(255,255,255,0.3)', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${v * 100}%`, background: c, boxShadow: `0 0 30px ${c}`}} />
      </div>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 52, color: WHITE}}>{label} <span style={{color: up ? HOT : '#8fd3f2'}}>{up ? '↑' : '↓'}</span></div>
    </div>
  );
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #6a1f22 0%, #3a1012 55%, #1e0a0b 100%)'}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1000, opacity: 0.95}}><Blood3D lt={t - a} w={W} h={1000} o2={o2} /></div>
      <Stack y={190} gap={4}>
        <Line t={t} a={K.ossigeno2 - 0.3} text="meno ossigeno" size={92} box="white" />
        <Line t={t} a={K.anidride - 0.3} text="più anidride carbonica" size={58} box="pink" />
      </Stack>
      <Bar v={o2} c="#8fd3f2" label="O₂" up={false} x={110} />
      <Bar v={0.2 + co2 * 0.7} c="#9aa0aa" label="CO₂" up x={610} />
    </>
  );
};

const ShRisk: React.FC<{t: number}> = ({t}) => {
  const a = sh('risk').a;
  return (
    <>
      <Forest t={t} glow={HOT} />
      <div style={{position: 'absolute', left: 0, top: 420, width: W, height: 640}}><Heart3D lt={t - a} w={W} h={640} warn={prog(t, K.rischio - 0.4, K.rischio + 0.3)} /></div>
      <Stack y={200}><Line t={t} a={a + 0.05} text="nel tempo" size={86} serif color={PINK_HI} /></Stack>
      <Stack y={1100} gap={4}>
        <Line t={t} a={K.rischio - 0.35} text="a rischio" size={120} box="white" />
        <Line t={t} a={K.salute - 0.3} text="la tua salute" size={80} serif color={CREAM} />
      </Stack>
    </>
  );
};

const ShHow: React.FC<{t: number}> = ({t}) => {
  const a = sh('how').a;
  return (
    <>
      <Cream t={t} strands={0} />
      <Stack y={220} gap={4}>
        <Line t={t} a={a + 0.02} text="ma come puoi" size={86} serif color={ROSE} />
        <Line t={t} a={K.sapere - 0.3} text="saperlo?" size={130} box="green" />
      </Stack>
      <T3 t={t} a={a + 0.15} text="?" y={660} h={640} size={4} mode="green" spin={-1} />
    </>
  );
};

const ShSatur: React.FC<{t: number}> = ({t}) => {
  const a = sh('satur').a;
  return (
    <>
      <Cream t={t} strands={0} />
      <div style={{position: 'absolute', left: 0, top: 660, width: W, height: 640}}><Oximeter3D lt={t - a} w={W} h={640} /></div>
      <Stack y={180}><Line t={t} a={a + 0.02} text="un primo controllo utile" size={56} /></Stack>
      <Stack y={280}><Line t={t} a={K.saturimetria3 - 0.35} text="saturimetria" size={116} box="green" /></Stack>
      <Stack y={450}><Line t={t} a={K.notturna3 - 0.3} text="notturna" size={110} serif color={ROSE} /></Stack>
    </>
  );
};

const ShFinger: React.FC<{t: number}> = ({t}) => {
  const a = sh('finger').a;
  return (
    <>
      <Night t={t} />
      <div style={{position: 'absolute', left: 0, top: 560, width: W, height: 760}}><Oximeter3D lt={t - a} w={W} h={760} night /></div>
      <Zzz t={t} x={640} y={260} on={0.6} />
      <Stack y={190} gap={4}>
        <Line t={t} a={a + 0.05} text="mentre dormi" size={90} serif color={CREAM} />
        <Line t={t} a={K.sensore - 0.5} text="un piccolo sensore al dito" size={48} box="white" />
      </Stack>
      <Stack y={1320}><Chip t={t} a={K.dormi + 0.3} text="semplice e non invasivo" icon="check" size={42} tone="green" /></Stack>
    </>
  );
};

const ShGraph: React.FC<{t: number}> = ({t}) => {
  const a = sh('graph').a;
  return (
    <>
      <Night t={t} moon={false} />
      <Stack y={190}><Line t={t} a={K.registra - 0.3} text="registra tutta la notte" size={54} box="white" /></Stack>
      <NightChart t={t} a={K.registra} b={sh('graph').b - 0.3} y={520} />
      <Stack y={1130} gap={16}>
        <Chip t={t} a={K.saturazione - 0.3} text="saturazione dell'ossigeno" icon="drop" size={42} />
        <Chip t={t} a={K.frequenza - 0.3} text="frequenza cardiaca" icon="heart" size={42} tone="pink" from="right" />
      </Stack>
    </>
  );
};

const ShData: React.FC<{t: number}> = ({t}) => {
  const a = sh('data').a;
  const lens = eO3(prog(t, K.variazioni - 0.3, K.variazioni + 0.3));
  return (
    <>
      <Night t={t} moon={false} />
      <Stack y={190}><Line t={t} a={a + 0.05} text="i dati ci aiutano a capire" size={58} color={CREAM} /></Stack>
      <NightChart t={t} a={a - 6} b={a - 0.5} y={460} dip={eIO(prog(t, K.variazioni - 0.6, K.variazioni))} lens={lens} />
      <Stack y={1090} gap={6}>
        <Line t={t} a={K.variazioni - 0.3} text="variazioni sospette?" size={62} box="pink" />
        <Line t={t} a={K.approfondire - 0.35} text="approfondiamo" size={92} serif color={PINK_HI} />
      </Stack>
    </>
  );
};

const ShRecap: React.FC<{t: number}> = ({t}) => {
  const a = sh('recap').a;
  return (
    <>
      <Cream t={t} strands={0} />
      <Stack y={240}><Line t={t} a={a + 0.02} text="quindi, se" size={90} serif color={ROSE} /></Stack>
      <Stack y={430} gap={20}>
        <Chip t={t} a={K.russi6 - 0.25} text="russi" icon="moon" size={64} tone="green" />
        <Chip t={t} a={K.stanco6 - 0.3} text="ti svegli stanco" icon="calendar" size={56} tone="pink" from="right" />
        <Chip t={t} a={K.sonnolenza6 - 0.3} text="hai sonnolenza" icon="sun" size={56} />
      </Stack>
    </>
  );
};

const ShTalk: React.FC<{t: number}> = ({t}) => {
  const a = sh('talk').a;
  return (
    <>
      <Cream t={t} strands={0} />
      <div style={{position: 'absolute', left: 0, top: 150, width: W, height: 440}}><Logo3D lt={t - a} w={W} h={440} /></div>
      <Stack y={630} gap={6}>
        <Line t={t} a={K.parlarne - 0.3} text="vieni a parlarne" size={84} />
        <Line t={t} a={K.noi6 - 0.3} text="con noi" size={140} box="green" />
      </Stack>
      <Stack y={1010} gap={14}>
        <Chip t={t} a={K.approfondiremo - 0.3} text="approfondiamo insieme" icon="heart" size={46} tone="pink" />
        <Chip t={t} a={K.saturimetria6 - 0.5} text="valutiamo la saturimetria" icon="check" size={46} from="right" />
      </Stack>
      <Stack y={1290}><Line t={t} a={K.aspettiamo - 0.3} text="ti aspettiamo!" size={90} serif color={ROSE} /></Stack>
    </>
  );
};

const ShEnd: React.FC<{t: number}> = ({t}) => {
  const a = sh('end').a;
  const lt = t - a;
  const wv = eO5(prog(lt, 0.4, 0.9)), inf = eO5(prog(lt, 1.1, 1.6));
  return (
    <>
      <Cream t={t} strands={0} />
      <div style={{position: 'absolute', left: 0, top: 120, width: W, height: 480}}><Logo3D lt={lt} w={W} h={480} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center'}}>
        <Img src={staticFile('logo/wordmark.png')} style={{width: 620, opacity: wv, transform: `translateY(${(1 - wv) * 40}px)`}} />
      </div>
      <Stack y={850} gap={6}>
        <Line t={t} a={a + 0.2} text="saturimetria notturna" size={60} box="green" />
        <Line t={t} a={a + 0.5} text="dormi bene, respira meglio" size={66} serif color={ROSE} />
      </Stack>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1140, display: 'flex', flexDirection: 'column', gap: 18, opacity: inf, transform: `translateY(${(1 - inf) * 40}px)`}}>
        {[['pin', 'Via Aceronia 1 · Brienza (PZ)'], ['phone', 'Tel. 0975 381021']].map(([ic, tx]) => (
          <div key={tx} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '12px 28px 12px 12px', borderRadius: 999, background: WHITE, boxShadow: '0 12px 30px rgba(22,58,28,0.18)', fontFamily: MONT, fontWeight: 800, fontSize: 42, color: GREEN_D}}>
            <div style={{width: 64, height: 64, borderRadius: 99, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} c={GREEN_DD} s={38} /></div>
            {tx}
          </div>
        ))}
      </div>
    </>
  );
};

const RENDER: Record<string, React.FC<{t: number}>> = {
  ask: ShAsk, snore: ShSnore, clock: ShClock, day: ShDay, signals: ShSignals, resp: ShResp, apnea: ShApnea, breath: ShBreath, oxygen: ShOxygen,
  risk: ShRisk, how: ShHow, satur: ShSatur, finger: ShFinger, graph: ShGraph, data: ShData, recap: ShRecap, talk: ShTalk, end: ShEnd,
};

/* ------------------------------------------------------------------ transizioni */

const Cube: React.FC<{p: number; a: React.ReactNode; b: React.ReactNode}> = ({p, a, b}) => {
  const e = eIO(p);
  const face = (rot: number, child: React.ReactNode, shade: number) => (
    <div style={{position: 'absolute', width: W, height: H, overflow: 'hidden', backfaceVisibility: 'hidden', transform: `rotateY(${rot}deg) translateZ(${W / 2}px)`}}>
      {child}
      <AbsoluteFill style={{background: GREEN_DD, opacity: shade * 0.5}} />
    </div>
  );
  const pull = Math.sin(e * Math.PI) * 300;
  return (
    <AbsoluteFill style={{perspective: 1700, background: GREEN_DD}}>
      <div style={{position: 'absolute', width: W, height: H, transformStyle: 'preserve-3d', transform: `translateZ(${-W / 2 - pull}px) rotateY(${-90 * e}deg)`}}>
        {face(0, a, e)}
        {face(90, b, 1 - e)}
      </div>
    </AbsoluteFill>
  );
};

// whip: zoom + motion blur in uscita, rientro da zoom inverso con lampo rosa
const Whip: React.FC<{p: number; a: React.ReactNode; b: React.ReactNode}> = ({p, a, b}) => {
  const out = p < 0.5;
  const q = out ? p / 0.5 : (p - 0.5) / 0.5;
  const sc = out ? lerp(1, 1.35, eO3(q) * q) : lerp(0.78, 1, eO3(q));
  const bl = out ? q * 18 : (1 - q) * 18;
  const fl = 1 - Math.abs(p - 0.5) * 2;
  return (
    <AbsoluteFill style={{background: CREAM, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${sc}) rotate(${out ? q * 3 : (1 - q) * -3}deg)`, filter: `blur(${bl}px) brightness(${1 + fl * 0.4})`}}>{out ? a : b}</AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(246,207,198,0.6) 45%, transparent 75%)`, opacity: fl * fl * 0.8}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ montaggio */

export const Movie: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const i = Math.max(0, SHOTS.findIndex((s) => t >= s.a && t < s.b));
  const cur = SHOTS[i];
  let view: React.ReactNode = null;
  // transizione a cavallo del taglio con l'inquadratura precedente o la successiva
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
  // punch-in d'apertura
  const hook = 1 + 0.12 * (1 - eO3(prog(t, 0, 0.5)));
  const endA = sh('end').a;
  return (
    <AbsoluteFill style={{background: CREAM}}>
      <AbsoluteFill style={{transform: `scale(${hook})`}}>{view}</AbsoluteFill>
      {t < endA + 0.1 && <Corner />}
      {t < SENTS[SENTS.length - 1].end + 0.2 && <Subs t={t} />}
      {t < 0.25 && <AbsoluteFill style={{background: WHITE, opacity: 1 - prog(t, 0, 0.25)}} />}
    </AbsoluteFill>
  );
};

export {DURATION};
