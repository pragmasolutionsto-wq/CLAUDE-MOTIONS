import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import S from './shots.json';
import {Logo3D, Mode, Text3D} from './three';
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

// checklist che si spunta voce per voce (resta uguale tra le due clip dei piedi)
const Checklist: React.FC<{t: number; y: number}> = ({t, y}) => {
  const items: [string, number][] = [['controllo quotidiano', K.controlla - 0.2], ['asciuga bene', K.asciuga - 0.2], ['emolliente', K.idrata - 0.1]];
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: y, display: 'flex', flexDirection: 'column', gap: 14}}>
      {items.map(([tx, at], i) => {
        const p = prog(t, at, at + 0.5);
        if (p <= 0) return null;
        const s = spring(p * 1.8);
        const ck = eBack(prog(t, at + 0.25, at + 0.6), 1.8);
        const note = i === 2 ? eO3(prog(t, K.dita2 - 0.6, K.dita2 - 0.2)) : 0;
        return (
          <div key={tx} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '12px 30px 12px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.96)', boxShadow: '0 14px 34px rgba(22,58,28,0.3)',
            transform: `translateX(${(1 - s) * -300}px)`, opacity: clamp(p * 3), alignSelf: 'flex-start'}}>
            <div style={{width: 70, height: 70, borderRadius: 99, background: GRAD_G, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(0.4, 1, ck)})`}}><Icon name="check" c={CREAM} s={46} /></div>
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 46, color: GREEN_D, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{tx}</div>
            {i === 2 && <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: ROSE, whiteSpace: 'nowrap', opacity: note, transform: `translateX(${(1 - note) * 20}px)`}}>non tra le dita</div>}
          </div>
        );
      })}
    </div>
  );
};

const ShArm: React.FC<{t: number}> = ({t}) => (
  <Clip name="arm" t={t} z0={1.0} dz={0.03} shade={0.55}>
    <Stack y={1040} gap={14}>
      <Chip t={t} a={K.secca0 - 0.25} text="pelle secca" icon="drop" size={48} />
      <Chip t={t} a={K.occhi0 - 0.2} text="occhi che bruciano" icon="eye" size={48} tone="pink" from="right" />
      <Chip t={t} a={K.intimi0 - 0.3} text="fastidi intimi" icon="heart" size={48} />
    </Stack>
  </Clip>
);

const ShHook: React.FC<{t: number}> = ({t}) => {
  const a = sh('hook').a;
  return (
    <>
      <Forest t={t} />
      <T3 t={t} a={K.diabete0 - 0.3} text="DIABETE" y={300} h={360} size={1.25} mode="pink" />
      <Stack y={720} gap={6}>
        <Line t={t} a={a + 0.15} text="non sono solo" size={76} serif color={PINK_HI} />
        <Line t={t} a={K.piccoli0 - 0.3} text="piccoli fastidi" size={104} box="white" />
      </Stack>
    </>
  );
};

const ShLayers: React.FC<{t: number}> = ({t}) => (
  <Clip name="layers" t={t} dz={0.02} shade={0.45}>
    <Stack y={180} gap={10}>
      <Chip t={t} a={K.glicemia1 - 0.3} text="glicemia alta" icon="up" size={52} tone="pink" />
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 80, color: GREEN, opacity: prog(t, K.disidrata - 0.5, K.disidrata - 0.2)}}>↓</div>
      <Line t={t} a={K.disidrata - 0.35} text="meno idratazione" size={72} box="green" />
    </Stack>
  </Clip>
);

// gambe stilizzate con le linee dei nervi che si spengono
const ShNerves: React.FC<{t: number}> = ({t}) => {
  const a = sh('nerves').a;
  const fade = eIO(prog(t, K.sudorazione - 0.3, K.gambe + 0.6));
  const glow = 1 - fade * 0.8;
  const leg = (x: number, flip: number) => `M ${x} 420 C ${x - 10 * flip} 620, ${x + 15 * flip} 760, ${x + 5 * flip} 980 C ${x} 1060, ${x - 5 * flip} 1100, ${x + 70 * flip} 1150 L ${x + 120 * flip} 1170 C ${x + 140 * flip} 1190, ${x + 60 * flip} 1210, ${x - 30 * flip} 1190 C ${x - 60 * flip} 1150, ${x - 70 * flip} 1060, ${x - 75 * flip} 980 C ${x - 85 * flip} 760, ${x - 80 * flip} 620, ${x - 90 * flip} 420 Z`;
  const nerve = (x: number, flip: number, k: number) => `M ${x - 40 * flip} 440 C ${x - 30 * flip + k * 8} 620, ${x - 20 * flip - k * 6} 800, ${x - 30 * flip + k * 4} 1000 S ${x + 20 * flip} 1150, ${x + 80 * flip + k * 10} 1165`;
  const inn = eO3(prog(t, a, a + 0.6));
  return (
    <>
      <Cream t={t} strands={0} />
      <Stack y={180}><Line t={t} a={K.nervi - 0.3} text="nel tempo i nervi" size={64} /></Stack>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: inn}}>
        {[[420, -1], [660, 1]].map(([x, f], i) => (
          <g key={i}>
            <path d={leg(x, f)} fill={PINK_HI} stroke={MAUVE} strokeWidth={6} />
            {[0, 1, 2].map((k) => (
              <path key={k} d={nerve(x, f, k)} fill="none" stroke="#5fb6e0" strokeWidth={5} strokeLinecap="round" opacity={glow * (0.9 - k * 0.2)} strokeDasharray="22 14" strokeDashoffset={-t * 60} style={{filter: `drop-shadow(0 0 ${10 * glow}px #5fb6e0)`}} />
            ))}
            {Array.from({length: 4}, (_, j) => {
              const yy = 700 + j * 110 - ((t * 60) % 110);
              return <circle key={j} cx={x - 20 * f + Math.sin(t * 2 + j) * 14} cy={yy} r={8} fill="#7cc7ea" opacity={(1 - fade) * 0.8} />;
            })}
          </g>
        ))}
      </svg>
      <Stack y={1260} gap={6}>
        <Line t={t} a={K.sudorazione - 0.3} text="meno sudorazione" size={80} box="pink" />
        <Line t={t} a={K.gambe - 0.2} text="di gambe e piedi" size={70} serif color={GREEN} />
      </Stack>
    </>
  );
};

const ShHeel: React.FC<{t: number}> = ({t}) => (
  <Clip name="heel" t={t} dz={0.025} shade={0.5}>
    <Stack y={170} gap={14}>
      <Chip t={t} a={K.secca2 - 0.25} text="secca" icon="drop" size={52} />
      <Chip t={t} a={K.prude - 0.2} text="prude" icon="spark" size={52} tone="pink" from="right" />
      <Chip t={t} a={K.screpola - 0.25} text="si screpola" icon="alert" size={52} tone="green" />
    </Stack>
  </Clip>
);

// una crepa che si allarga in una linea rossa morbida
const ShWarn: React.FC<{t: number}> = ({t}) => {
  const c = eIO(prog(t, K.crepa - 0.2, K.ferita2 + 0.3));
  const r = eO3(prog(t, K.ferita2 - 0.1, K.ferita2 + 0.6));
  return (
    <>
      <Cream t={t} strands={0} />
      <Stack y={200} gap={4}>
        <Line t={t} a={sh('warn').a + 0.05} text="sul piede" size={70} serif color={ROSE} />
        <Line t={t} a={K.crepa - 0.3} text="una piccola crepa" size={80} box="white" />
      </Stack>
      <svg width={W} height={700} style={{position: 'absolute', left: 0, top: 480}}>
        <ellipse cx={540} cy={350} rx={330} ry={260} fill={PINK_HI} stroke={MAUVE} strokeWidth={6} />
        <path d="M 400 260 L 450 300 L 430 340 L 500 370 L 480 410 L 560 440" fill="none" stroke={MAUVE} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="600" strokeDashoffset={600 * (1 - c)} />
        <circle cx={540} cy={420} r={40 + r * 90} fill="none" stroke={HOT} strokeWidth={8} opacity={r * (1 - prog(t, K.notare, K.notare + 0.8)) + 0.3 * r} />
      </svg>
      <Stack y={1190} gap={4}>
        <Line t={t} a={K.ferita2 - 0.3} text="può diventare una ferita" size={52} box="green" />
        <Line t={t} a={K.notare - 0.4} text="difficile da notare" size={72} serif color={GREEN} />
      </Stack>
    </>
  );
};

const ShMirror: React.FC<{t: number}> = ({t}) => (
  <Clip name="mirror" t={t} dz={0.02} shade={0.5}>
    <Stack y={170}><Line t={t} a={sh('mirror').a + 0.05} text="ogni giorno, anche tra le dita" size={42} box="white" /></Stack>
    <Checklist t={t} y={1050} />
  </Clip>
);

const ShCream: React.FC<{t: number}> = ({t}) => (
  <Clip name="cream" t={t} dz={0.02} shade={0.5}>
    <Checklist t={t} y={1050} />
  </Clip>
);

const ShEye: React.FC<{t: number}> = ({t}) => (
  <Clip name="eye" t={t} dz={0.025} shade={0.5}>
    <Stack y={170} gap={14}>
      <Chip t={t} a={K.bruciore4 - 0.25} text="bruciore" icon="flame" size={50} tone="pink" />
      <Chip t={t} a={K.estraneo - 0.4} text="corpo estraneo" icon="eye" size={50} from="right" />
    </Stack>
  </Clip>
);

const ShEyecheck: React.FC<{t: number}> = ({t}) => {
  const a = sh('eyecheck').a;
  const blink = Math.abs(Math.sin(t * 1.3)) > 0.97 ? 0.15 : 1;
  return (
    <>
      <Forest t={t} />
      <Stack y={200} gap={4}>
        <Line t={t} a={a + 0.02} text="parlane" size={90} serif color={PINK_HI} />
        <Line t={t} a={K.noi4 - 0.3} text="con noi" size={120} box="white" />
      </Stack>
      <svg width={W} height={500} style={{position: 'absolute', left: 0, top: 560, opacity: prog(t, a + 0.3, a + 0.8)}}>
        <g transform={`translate(540 250) scale(1 ${blink})`}>
          <path d="M -300 0 Q 0 -230 300 0 Q 0 230 -300 0 Z" fill={WHITE} stroke={PINK_HI} strokeWidth={10} />
          <circle r={110} fill={GREEN} /><circle r={52} fill={GREEN_DD} /><circle cx={-35} cy={-35} r={22} fill={WHITE} opacity={0.9} />
        </g>
      </svg>
      <Stack y={1130}><Line t={t} a={K.attenzione - 0.6} text="controlli oculari regolari" size={50} box="pink" /></Stack>
    </>
  );
};

const ShPetal: React.FC<{t: number}> = ({t}) => (
  <Clip name="petal" t={t} dz={0.02} shade={0.5}>
    <Stack y={170} gap={4}>
      <Line t={t} a={K.donne - 0.3} text="e nelle donne" size={70} serif color={WHITE} />
      <Line t={t} a={K.secchezza - 0.25} text="secchezza e bruciore intimi" size={48} box="white" />
    </Stack>
  </Clip>
);

const ShTaboo: React.FC<{t: number}> = ({t}) => {
  const a = sh('taboo').a;
  return (
    <>
      <Cream t={t} strands={0} />
      <Stack y={560} gap={10}>
        <Line t={t} a={a + 0.02} text="non è un tabù." size={88} box="green" />
        <Line t={t} a={K.parla - 0.35} text="se ne parla." size={110} serif color={ROSE} />
      </Stack>
    </>
  );
};

const ShHelps: React.FC<{t: number}> = ({t}) => {
  const a = sh('helps').a;
  return (
    <>
      <Forest t={t} />
      <Stack y={600}><Line t={t} a={a + 0.02} text="cosa aiuta?" size={130} serif color={PINK_HI} /></Stack>
    </>
  );
};

// le 5 abitudini come icone che entrano in sequenza
const ShFlatlay: React.FC<{t: number}> = ({t}) => {
  const items: [string, string, number][] = [['doccia tiepida', 'shower', K.doccia - 0.2], ['detergente delicato', 'bottle', K.detergenti - 0.2], ['emolliente senza profumo', 'drop', K.emollienti - 0.2], ['occhi idratati', 'eye', K.occhi6 - 0.2]];
  return (
    <Clip name="flatlay" t={t} dz={0.015} shade={0.35}>
      <div style={{position: 'absolute', left: 70, right: 70, top: 330, display: 'flex', flexDirection: 'column', gap: 26}}>
        {items.map(([tx, ic, at], i) => {
          const p = prog(t, at, at + 0.5);
          const s = spring(p * 1.8);
          return (
            <div key={tx} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '16px 34px 16px 16px', borderRadius: 999, background: i % 2 ? GRAD : 'rgba(255,255,255,0.97)', boxShadow: '0 18px 40px rgba(22,58,28,0.28)',
              transform: `translateX(${(1 - s) * (i % 2 ? 300 : -300)}px) scale(${lerp(0.7, 1, s)})`, opacity: clamp(p * 3), alignSelf: i % 2 ? 'flex-end' : 'flex-start'}}>
              <div style={{width: 100, height: 100, borderRadius: 99, background: GRAD_G, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} c={CREAM} s={62} /></div>
              <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 44, color: GREEN_DD, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{tx}</div>
            </div>
          );
        })}
      </div>
    </Clip>
  );
};

// acqua a piccoli sorsi: bicchiere che si riempie a piccoli scatti
const ShWater: React.FC<{t: number}> = ({t}) => {
  const a = sh('water').a;
  const steps = [K.acqua, K.acqua + 0.45, K.sorsi];
  const lvl = steps.reduce((s, at) => s + eO3(prog(t, at - 0.1, at + 0.3)) / steps.length, 0);
  const gx = 390, gy = 360, gw = 300, gh = 460;
  return (
    <>
      <Cream t={t} strands={0} />
      <svg width={W} height={900} style={{position: 'absolute', left: 0, top: 0}}>
        <defs><clipPath id="glass"><path d={`M ${gx} ${gy} L ${gx + gw} ${gy} L ${gx + gw - 30} ${gy + gh} L ${gx + 30} ${gy + gh} Z`} /></clipPath></defs>
        <g clipPath="url(#glass)">
          <rect x={gx} y={gy + gh * (1 - lvl * 0.85)} width={gw} height={gh} fill="#9fd3e8" opacity={0.85} />
          <path d={`M ${gx} ${gy + gh * (1 - lvl * 0.85)} q 75 ${-14 * Math.sin(t * 5)} 150 0 t 150 0`} fill="none" stroke={WHITE} strokeWidth={6} opacity={0.8} />
        </g>
        <path d={`M ${gx} ${gy} L ${gx + gw} ${gy} L ${gx + gw - 30} ${gy + gh} L ${gx + 30} ${gy + gh} Z`} fill="none" stroke={GREEN_D} strokeWidth={10} strokeLinejoin="round" />
      </svg>
      <Stack y={880} gap={6}>
        <Line t={t} a={K.acqua - 0.25} text="acqua a piccoli sorsi" size={68} box="white" />
        <Line t={t} a={K.glicemia6 - 0.25} text="e glicemia" size={80} serif color={ROSE} />
        <Line t={t} a={K.controllo6 - 0.35} text="sotto controllo" size={80} box="green" />
      </Stack>
    </>
  );
};

const ShTalk: React.FC<{t: number}> = ({t}) => {
  const a = sh('talk').a;
  return (
    <>
      <Cream t={t} strands={0} />
      <div style={{position: 'absolute', left: 0, top: 160, width: W, height: 440}}><Logo3D lt={t - a} w={W} h={440} /></div>
      <Stack y={640} gap={14}>
        <Line t={t} a={K.aiutiamo - 0.25} text="ti aiutiamo a scegliere" size={62} />
        <Chip t={t} a={K.prodotti - 0.3} text="i prodotti giusti" icon="bottle" size={50} tone="green" />
        <Chip t={t} a={K.ricordare - 0.3} text="a ricordare i controlli" icon="calendar" size={50} tone="pink" from="right" />
      </Stack>
    </>
  );
};

const ShWound: React.FC<{t: number}> = ({t}) => {
  const a = sh('wound').a;
  return (
    <>
      <Forest t={t} glow={HOT} />
      <Stack y={260} gap={10}>
        <Line t={t} a={a + 0.02} text="ferita, rossore o crepa" size={64} color={CREAM} />
        <Line t={t} a={K.guarisce - 0.35} text="che non guarisce?" size={74} box="white" />
      </Stack>
      <Stack y={720} gap={6}>
        <Line t={t} a={K.subito - 0.5} text="parlane" size={100} serif color={PINK_HI} />
        <Line t={t} a={K.subito - 0.2} text="subito con noi" size={90} box="pink" />
      </Stack>
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
      <Stack y={840} gap={6}>
        <Line t={t} a={a + 0.2} text="diabete: pelle, occhi e piedi" size={44} box="green" />
        <Line t={t} a={a + 0.5} text="hanno bisogno di attenzione" size={70} serif color={ROSE} />
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
  arm: ShArm, hook: ShHook, layers: ShLayers, nerves: ShNerves, heel: ShHeel, warn: ShWarn, mirror: ShMirror, cream: ShCream, eye: ShEye, eyecheck: ShEyecheck,
  petal: ShPetal, taboo: ShTaboo, helps: ShHelps, flatlay: ShFlatlay, water: ShWater, talk: ShTalk, wound: ShWound, end: ShEnd,
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
