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

// pagina di calendario che si gira
const Page: React.FC<{t: number; a: number; m: string; top?: string; x: number; y: number; w?: number; sz?: number}> = ({t, a, m, top, x, y, w = 400, sz = 64}) => {
  const p = prog(t, a - 0.1, a + 0.6);
  if (p <= 0) return null;
  const s = spring(p * 1.8);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, perspective: 1000}}>
      <div style={{borderRadius: 34, overflow: 'hidden', background: WHITE, boxShadow: '0 30px 60px rgba(10,30,12,0.35)', transform: `rotateX(${(1 - s) * -100}deg)`, transformOrigin: '50% 0%', opacity: clamp(p * 3)}}>
        <div style={{height: 110, background: GRAD_G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 52, color: CREAM, letterSpacing: '0.08em'}}>{top}</div>
        <div style={{padding: '10px 10px 24px', textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: sz, lineHeight: 1, color: GREEN_D, textTransform: 'uppercase', whiteSpace: 'pre-line'}}>{m}</div>
      </div>
    </div>
  );
};

const ShCalm: React.FC<{t: number}> = ({t}) => {
  const ok = spring(prog(t, K.bene - 0.15, K.bene + 0.45) * 1.8);
  return (
    <Clip name="calm" t={t} z0={1.0} dz={0.03} shade={0.6}>
      <Stack y={170}><Line t={t} a={0.1} text="non hai il diabete?" size={70} color={WHITE} /></Stack>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1030, display: 'flex', justifyContent: 'center', opacity: clamp(ok * 3)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '16px 46px 16px 18px', borderRadius: 999, background: GRAD_G, boxShadow: '0 20px 50px rgba(22,58,28,0.4)', transform: `scale(${lerp(0.4, 1, ok)})`}}>
          <div style={{width: 110, height: 110, borderRadius: 99, background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="check" c={GREEN} s={80} /></div>
          <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 110, color: CREAM}}>BENE.</div>
        </div>
      </div>
    </Clip>
  );
};

// il dubbio: fondo scuro, ? 3D che arriva con un colpo
const ShDoubt: React.FC<{t: number}> = ({t}) => {
  const a = sh('doubt').a;
  const g = Math.exp(-Math.pow((t - a - 0.12) / 0.08, 2));
  return (
    <>
      <Forest t={t} glow={PINK} />
      <Stack y={260}><Line t={t} a={a + 0.02} text="ma lo sai" size={100} serif color={PINK_HI} /></Stack>
      <T3 t={t} a={K.davvero - 0.35} text="DAVVERO?" y={420} h={380} size={1.15} mode="pink" />
      <T3 t={t} a={a + 0.05} text="?" y={760} h={560} size={3.8} mode="cream" spin={-1} />
      <AbsoluteFill style={{background: WHITE, opacity: g * 0.5}} />
    </>
  );
};

const ShHourglass: React.FC<{t: number}> = ({t}) => {
  const fade = prog(t, K.silenzioso + 0.25, K.silenzioso + 1.1);
  return (
    <Clip name="hourglass" t={t} dz={0.02} shade={0.7}>
      <Stack y={170} gap={10}>
        <Chip t={t} a={K.tipo - 0.25} text="diabete tipo 2" icon="drop" size={50} tone="pink" />
      </Stack>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center', opacity: 1 - fade * 0.75, filter: `blur(${fade * 4}px)`, letterSpacing: `${fade * 0.12}em`}}>
        <Line t={t} a={K.silenzioso - 0.3} text="silenzioso" size={120} serif color={WHITE} />
      </div>
      <Stack y={1180}><Line t={t} a={K.anni - 0.25} text="per anni" size={96} box="white" /></Stack>
    </Clip>
  );
};

const ShBlood: React.FC<{t: number}> = ({t}) => (
  <Clip name="blood" t={t} dz={0.03} shade={0.7}>
    <Stack y={180}><Line t={t} a={K.sintomi - 0.3} text="quando dà sintomi" size={70} color={WHITE} /></Stack>
    <Stack y={1020} gap={6}>
      <Line t={t} a={K.tardi - 0.45} text="a volte è" size={80} serif color={WHITE} />
      <Line t={t} a={K.tardi - 0.2} text="già tardi" size={130} box="pink" />
    </Stack>
  </Clip>
);

// controllo rapido: anello timer che si chiude in un lampo
const ShMeter: React.FC<{t: number}> = ({t}) => {
  const r = eIO(prog(t, K.rapido - 0.6, K.rapido + 0.2));
  const C = 2 * Math.PI * 92;
  return (
    <Clip name="meter" t={t} dz={0.025} shade={0.6}>
      <Stack y={170} gap={4}>
        <Line t={t} a={sh('meter').a + 0.05} text="misurare la glicemia" size={64} color={WHITE} />
        <Line t={t} a={K.farmacia - 0.25} text="in farmacia" size={92} box="white" />
      </Stack>
      <div style={{position: 'absolute', left: 80, top: 1170, display: 'flex', alignItems: 'center', gap: 26, opacity: prog(t, K.controllo - 0.3, K.controllo)}}>
        <svg width={210} height={210} viewBox="0 0 210 210">
          <circle cx={105} cy={105} r={92} fill="rgba(255,255,255,0.92)" stroke={MINT} strokeWidth={16} />
          <circle cx={105} cy={105} r={92} fill="none" stroke={GREEN} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${C * r} ${C}`} transform="rotate(-90 105 105)" />
          <path d="M72 108l22 22 44-48" fill="none" stroke={GREEN} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={prog(r, 0.9, 1)} />
        </svg>
      </div>
      <T3 t={t} a={K.rapido - 0.3} x={290} w={790} text="RAPIDO" y={1090} h={360} size={1.25} mode="pink" />
    </Clip>
  );
};

// nella norma o fattore di rischio: indicatore che oscilla tra verde e rosa (nessun valore)
const ShRange: React.FC<{t: number}> = ({t}) => {
  const a = sh('range').a;
  const cx = 540, cy = 860, R = 330;
  const inn = eO3(prog(t, a, a + 0.6));
  const toN = eIO(prog(t, K.norma - 0.4, K.norma));
  const toR = eIO(prog(t, K.rischio - 0.6, K.rischio));
  const ang = lerp(lerp(-90, -45, toN), 45, toR) + Math.sin(t * 6) * 2;
  const arc = (a0: number, a1: number) => {
    const p = (d: number) => [cx + R * Math.cos(((d - 90) * Math.PI) / 180), cy + R * Math.sin(((d - 90) * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
  };
  return (
    <>
      <Cream t={t} strands={0} />
      <Stack y={200}><Line t={t} a={a + 0.02} text="ti aiuta a capire" size={70} serif color={ROSE} /></Stack>
      <svg width={W} height={1100} style={{position: 'absolute', left: 0, top: 0, opacity: inn}}>
        <path d={arc(-90, -2)} fill="none" stroke={GREEN} strokeWidth={70} strokeLinecap="round" strokeDasharray={`${1100 * inn} 2000`} />
        <path d={arc(2, 90)} fill="none" stroke={PINK} strokeWidth={70} strokeLinecap="round" strokeDasharray={`${1100 * inn} 2000`} />
        <g transform={`rotate(${ang} ${cx} ${cy})`}>
          <path d={`M ${cx - 18} ${cy} L ${cx} ${cy - R + 70} L ${cx + 18} ${cy} Z`} fill={GREEN_DD} />
        </g>
        <circle cx={cx} cy={cy} r={42} fill={GREEN_DD} />
        <circle cx={cx} cy={cy} r={16} fill={CREAM} />
      </svg>
      <div style={{position: 'absolute', left: 50, right: 50, top: 980, display: 'flex', justifyContent: 'space-between'}}>
        <Chip t={t} a={K.norma - 0.3} text="nella norma" icon="check" size={42} tone="green" />
        <Chip t={t} a={K.fattore - 0.25} text="rischio" icon="alert" size={42} tone="pink" from="right" />
      </div>
      <Stack y={1150}><Line t={t} a={K.fattore - 0.1} text="o un fattore di rischio?" size={58} box="white" /></Stack>
    </>
  );
};

// i 4 fattori: card 2x2 che entrano a tempo
const ShRisk: React.FC<{t: number}> = ({t}) => {
  const a = sh('risk').a;
  const cards: [string, string, number][] = [['familiarità', 'family', K.familiarita - 0.25], ['sovrappeso', 'scale', K.sovrappeso - 0.2], ['pressione alta', 'pulse', K.pressione - 0.2], ['over 45', 'cake', K.superato - 0.1]];
  return (
    <>
      <Forest t={t} />
      <Stack y={190}><Line t={t} a={a + 0.02} text="soprattutto se hai" size={72} serif color={PINK_HI} /></Stack>
      {cards.map(([tx, ic, at], i) => {
        const p = prog(t, at, at + 0.55);
        const s = spring(p * 1.8);
        const x = 70 + (i % 2) * 480, y = 380 + Math.floor(i / 2) * 470;
        const last = i === 3;
        return (
          <div key={tx} style={{position: 'absolute', left: x, top: y, width: 460, height: 440, perspective: 1200, opacity: clamp(p * 3)}}>
            <div style={{width: '100%', height: '100%', borderRadius: 40, background: last ? GRAD : WHITE, boxShadow: '0 26px 60px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26,
              transform: `rotateY(${(1 - s) * (i % 2 ? -90 : 90)}deg) scale(${lerp(0.7, 1, s)})`}}>
              {last ? (
                <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 170, lineHeight: 1, color: GREEN_DD}}>45<span style={{fontSize: 110}}>+</span></div>
              ) : (
                <div style={{width: 170, height: 170, borderRadius: 48, background: GRAD_G, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} c={CREAM} s={110} /></div>
              )}
              <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 46, color: GREEN_D, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.05}}>{last ? 'anni' : tx}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

const ShHands: React.FC<{t: number}> = ({t}) => {
  const strike = eO3(prog(t, K.paura + 0.05, K.paura + 0.4));
  return (
    <Clip name="hands" t={t} dz={0.02} shade={0.55}>
      <Stack y={170} gap={4}>
        <Line t={t} a={sh('hands').a + 0.05} text="non serve avere" size={64} color={WHITE} />
        <div style={{position: 'relative'}}>
          <Line t={t} a={K.paura - 0.3} text="paura" size={120} box="white" />
          <div style={{position: 'absolute', left: 10, right: 10, top: '52%', height: 16, background: HOT, borderRadius: 9, transformOrigin: 'left', transform: `scaleX(${strike}) rotate(-4deg)`}} />
        </div>
      </Stack>
      <Stack y={1140} gap={4}>
        <Line t={t} a={K.serve2 - 0.2} text="serve" size={74} serif color={WHITE} />
        <Line t={t} a={K.informarsi - 0.25} text="informarsi" size={120} box="green" />
      </Stack>
    </Clip>
  );
};

const ShGesture: React.FC<{t: number}> = ({t}) => (
  <Clip name="gesture" t={t} dz={0.03} shade={0.55}>
    <Stack y={170}><Line t={t} a={sh('gesture').a + 0.05} text="prevenire inizia da" size={62} color={WHITE} /></Stack>
    <Stack y={270}><Line t={t} a={K.piccolo - 0.3} text="un piccolo" size={96} serif color={WHITE} /></Stack>
    <T3 t={t} a={K.gesto - 0.3} text="GESTO" y={1020} h={340} size={1.5} mode="green" />
  </Clip>
);

// la data: pagina 13 NOV, badge prezzo, bottone prenota
const ShBook: React.FC<{t: number}> = ({t}) => {
  const a = sh('book').a;
  const pr = prog(t, K.euro - 0.45, K.euro + 0.1);
  const burst = eO3(prog(t, K.euro - 0.3, K.euro + 0.5));
  const pulse = 1 + 0.05 * Math.sin(t * 9) * clamp(t - K.prenota);
  return (
    <>
      <Cream t={t} strands={0} />
      <Stack y={170}>
        <div style={{transform: `scale(${pulse})`}}><Line t={t} a={a + 0.02} text="prenota" size={110} box="green" /></div>
      </Stack>
      <Stack y={350}><Line t={t} a={K.misurazione - 0.2} text="la misurazione della glicemia" size={46} /></Stack>
      <Page t={t} a={K.venerdi - 0.2} top="VEN" m={'13\nNOV'} x={150} y={470} w={460} sz={150} />
      <div style={{position: 'absolute', left: 560, top: 640, width: 420, height: 420}}>
        <svg width={420} height={420} style={{position: 'absolute', inset: 0, opacity: (1 - burst) * clamp(pr * 4)}}>
          {Array.from({length: 14}, (_, i) => {
            const an = (i / 14) * Math.PI * 2, r0 = 150 + burst * 40, r1 = r0 + 50 + burst * 30;
            return <line key={i} x1={210 + Math.cos(an) * r0} y1={210 + Math.sin(an) * r0} x2={210 + Math.cos(an) * r1} y2={210 + Math.sin(an) * r1} stroke={GOLD} strokeWidth={10} strokeLinecap="round" />;
          })}
        </svg>
        <div style={{position: 'absolute', left: 60, top: 60, width: 300, height: 300, borderRadius: 999, background: GRAD, boxShadow: '0 26px 60px rgba(22,58,28,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${lerp(0.2, 1, eBack(pr, 1.8))}) rotate(${(1 - pr) * -40 + 8}deg)`, opacity: clamp(pr * 3)}}>
          <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 36, color: GREEN_DD, textTransform: 'uppercase'}}>a soli</div>
          <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 118, lineHeight: 1, color: GREEN_DD}}>€ 5</div>
          <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 40, color: GREEN_DD}}>,00</div>
        </div>
      </div>
      <Stack y={1150}><Chip t={t} a={K.novembre} text="prevenzione diabete" icon="heart" size={44} tone="pink" /></Stack>
    </>
  );
};

const ShEnd: React.FC<{t: number}> = ({t}) => {
  const a = sh('end').a;
  const lt = t - a;
  const wv = eO5(prog(lt, 0.4, 0.9)), inf = eO5(prog(lt, 1.1, 1.6)), dis = prog(lt, 1.7, 2.1);
  return (
    <>
      <Cream t={t} strands={0} />
      <div style={{position: 'absolute', left: 0, top: 100, width: W, height: 440}}><Logo3D lt={lt} w={W} h={440} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, display: 'flex', justifyContent: 'center'}}>
        <Img src={staticFile('logo/wordmark.png')} style={{width: 600, opacity: wv, transform: `translateY(${(1 - wv) * 40}px)`}} />
      </div>
      <Stack y={760} gap={6}>
        <Line t={t} a={a + 0.15} text="prevenzione diabete" size={70} box="green" />
        <Line t={t} a={a + 0.45} text="misurazione glicemia" size={56} />
        <Line t={t} a={a + 0.7} text="venerdì 13 novembre · € 5,00" size={70} serif color={ROSE} />
      </Stack>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1120, display: 'flex', flexDirection: 'column', gap: 18, opacity: inf, transform: `translateY(${(1 - inf) * 40}px)`}}>
        <div style={{alignSelf: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 64, color: CREAM, background: GRAD_G, padding: '14px 60px 18px', borderRadius: 999, boxShadow: '0 18px 40px rgba(22,58,28,0.35)', transform: `scale(${1 + 0.04 * Math.sin(lt * 7)})`}}>PRENOTA</div>
        {[['pin', 'Via Aceronia 1 · Brienza (PZ)'], ['phone', 'Tel. 0975 381021']].map(([ic, tx]) => (
          <div key={tx} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '12px 28px 12px 12px', borderRadius: 999, background: WHITE, boxShadow: '0 12px 30px rgba(22,58,28,0.18)', fontFamily: MONT, fontWeight: 800, fontSize: 42, color: GREEN_D}}>
            <div style={{width: 64, height: 64, borderRadius: 99, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} c={GREEN_DD} s={38} /></div>
            {tx}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1500, fontFamily: MONT, fontWeight: 700, fontSize: 30, lineHeight: 1.3, color: GREEN_D, opacity: dis * 0.85, textAlign: 'center'}}>
        La misurazione non sostituisce il parere del medico.
      </div>
    </>
  );
};

const RENDER: Record<string, React.FC<{t: number}>> = {
  calm: ShCalm, doubt: ShDoubt, hourglass: ShHourglass, blood: ShBlood, meter: ShMeter, range: ShRange, risk: ShRisk, hands: ShHands, gesture: ShGesture, book: ShBook, end: ShEnd,
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
