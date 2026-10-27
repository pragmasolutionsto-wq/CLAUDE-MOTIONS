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
        <div style={{height: 100, background: GRAD_G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 48, color: CREAM, letterSpacing: '0.08em'}}>{top}</div>
        <div style={{padding: '14px 10px 24px', textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: sz, lineHeight: 1, color: GREEN_D, textTransform: 'uppercase', whiteSpace: 'pre-line'}}>{m}</div>
      </div>
    </div>
  );
};

// buono regalo in 3D (CSS): carta verde con nastro rosa, entra girando
const Voucher: React.FC<{t: number; a: number; x: number; y: number; w?: number; amount?: string; sub?: string}> = ({t, a, x, y, w = 860, amount = '5 €', sub}) => {
  const p = prog(t, a, a + 0.8);
  if (p <= 0) return null;
  const s = spring(p * 1.8);
  const lt = t - a;
  const h = w * 0.58;
  const shine = ((lt * 0.6) % 2) - 0.5;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, perspective: 1600}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden', background: `linear-gradient(135deg, #4f8f55 0%, ${GREEN} 45%, ${GREEN_D} 100%)`,
        boxShadow: '0 40px 80px rgba(10,30,12,0.45), inset 0 2px 0 rgba(255,255,255,0.25)',
        transform: `rotateY(${(1 - s) * 200 + Math.sin(lt * 1.4) * 6}deg) rotateX(${Math.sin(lt * 1.1) * 5}deg) scale(${lerp(0.4, 1, s)})`, opacity: clamp(p * 3)}}>
        <div style={{position: 'absolute', left: w * 0.68, top: 0, bottom: 0, width: 46, background: GRAD}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.62, height: 34, background: GRAD, opacity: 0.9}} />
        <div style={{position: 'absolute', left: 54, top: 44, fontFamily: MONT, fontWeight: 900, fontSize: w * 0.085, color: CREAM, letterSpacing: '0.12em'}}>BUONO</div>
        <div style={{position: 'absolute', left: 46, top: h * 0.2, fontFamily: MONT, fontWeight: 900, fontSize: w * 0.26, lineHeight: 1, color: WHITE, textShadow: '0 10px 30px rgba(0,0,0,0.25)'}}>{amount}</div>
        {sub && <div style={{position: 'absolute', left: 54, top: h * 0.74, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: w * 0.06, color: PINK_HI}}>{sub}</div>}
        <div style={{position: 'absolute', top: -h, bottom: -h, width: w * 0.18, left: shine * w, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)', transform: 'rotate(18deg)'}} />
        <Img src={staticFile('logo/mark.png')} style={{position: 'absolute', right: w * 0.06, top: 36, height: h * 0.3, filter: 'brightness(0) invert(1)', opacity: 0.85}} />
      </div>
    </div>
  );
};

// barra di spesa che si riempie fino alla soglia
const Meter: React.FC<{t: number; a: number; b: number; label: string; y: number}> = ({t, a, b, label, y}) => {
  const p = eIO(prog(t, a, b));
  const inn = eO3(prog(t, a - 0.3, a));
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: y, opacity: inn}}>
      <div style={{height: 96, borderRadius: 999, background: 'rgba(255,255,255,0.95)', boxShadow: 'inset 0 6px 16px rgba(22,58,28,0.15), 0 16px 40px rgba(22,58,28,0.2)', padding: 12}}>
        <div style={{height: '100%', width: `${8 + p * 92}%`, borderRadius: 999, background: GRAD_G, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 22}}>
          <Icon name="bag" c={CREAM} s={46} />
        </div>
      </div>
      <div style={{position: 'absolute', right: -10, top: -110, fontFamily: MONT, fontWeight: 900, fontSize: 92, color: GREEN_D, transform: `scale(${lerp(0.6, 1, eBack(prog(t, b - 0.2, b + 0.3), 1.6))})`, opacity: prog(t, b - 0.25, b)}}>{label}</div>
    </div>
  );
};

const ShVoucher: React.FC<{t: number}> = ({t}) => (
  <Clip name="voucher" t={t} z0={1.0} dz={0.04} shade={0.55}>
    <T3 t={t} a={0.05} text="NOVEMBRE" y={140} h={330} size={1.1} mode="green" />
    <Stack y={1080} gap={6}>
      <Line t={t} a={K.mese - 0.25} text="il mese dei" size={84} serif color={WHITE} />
      <Line t={t} a={K.buoni - 0.25} text="buoni" size={150} box="green" />
    </Stack>
  </Clip>
);

const ShCoins: React.FC<{t: number}> = ({t}) => (
  <Clip name="coins" t={t} dz={0.04} shade={0.55}>
    <Stack y={170} gap={6}>
      <Line t={t} a={K.ogni - 0.3} text="perché ogni" size={70} color={WHITE} />
      <Line t={t} a={K.euro0 - 0.25} text="euro" size={150} box="white" />
      <Line t={t} a={K.conta - 0.25} text="conta" size={110} box="pink" />
    </Stack>
  </Clip>
);

const ShReturns: React.FC<{t: number}> = ({t}) => {
  const sp = eIO(prog(t, K.torna - 0.3, K.te + 0.4));
  return (
    <Clip name="returns" t={t} dz={0.02} shade={0.55}>
      <Stack y={170} gap={6}>
        <Line t={t} a={sh('returns').a + 0.1} text="abbiamo pensato a" size={60} color={WHITE} />
        <Line t={t} a={K.vantaggio - 0.25} text="un vantaggio" size={100} box="green" />
      </Stack>
      <svg width={260} height={260} viewBox="0 0 24 24" style={{position: 'absolute', left: 410, top: 980, transform: `rotate(${sp * 360}deg)`, opacity: prog(t, K.torna - 0.4, K.torna - 0.1)}}>
        <path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" fill="none" stroke={WHITE} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Stack y={1260}><Line t={t} a={K.torna - 0.25} text="che torna a te" size={96} box="pink" /></Stack>
    </Clip>
  );
};

// la meccanica: date + soglia di spesa
const ShMech: React.FC<{t: number}> = ({t}) => {
  const a = sh('mech').a;
  return (
    <>
      <Cream t={t} strands={0} />
      <Stack y={170}><Line t={t} a={a + 0.02} text="dal" size={70} serif color={ROSE} /></Stack>
      <Page t={t} a={K.d2 - 0.15} top="NOV" m="2" x={110} y={270} w={360} sz={170} />
      <div style={{position: 'absolute', left: 490, top: 420, fontFamily: MONT, fontWeight: 900, fontSize: 90, color: MAUVE, opacity: prog(t, K.d30 - 0.3, K.d30)}}>→</div>
      <Page t={t} a={K.d30 - 0.15} top="NOV" m="30" x={610} y={270} w={360} sz={170} />
      <Stack y={720}><Line t={t} a={K.almeno - 0.25} text="con almeno" size={70} /></Stack>
      <Meter t={t} a={K.almeno} b={K.e49} label="49 €" y={980} />
      <Stack y={1130}><Line t={t} a={K.spesa2 - 0.2} text="di spesa" size={70} serif color={GREEN} /></Stack>
    </>
  );
};

const ShProducts: React.FC<{t: number}> = ({t}) => (
  <Clip name="products" t={t} dz={0.02} shade={0.5}>
    <Stack y={170}><Line t={t} a={sh('products').a + 0.05} text="su prodotti" size={70} color={WHITE} /></Stack>
    <Stack y={1020} gap={16}>
      <Chip t={t} a={K.viso - 0.2} text="viso" icon="face" size={54} tone="green" />
      <Chip t={t} a={K.corpo - 0.2} text="corpo" icon="drop" size={54} tone="pink" from="right" />
      <Chip t={t} a={K.capelli - 0.2} text="capelli" icon="brush" size={54} />
    </Stack>
  </Clip>
);

const ShGift: React.FC<{t: number}> = ({t}) => {
  const a = sh('gift').a;
  const burst = eO3(prog(t, K.e5 - 0.1, K.e5 + 0.7));
  return (
    <>
      <Forest t={t} glow={GOLD} />
      <Stack y={230}><Line t={t} a={a + 0.02} text="ricevi un" size={90} serif color={PINK_HI} /></Stack>
      <svg width={W} height={900} style={{position: 'absolute', left: 0, top: 400, opacity: (1 - burst) * prog(t, K.e5 - 0.2, K.e5)}}>
        {Array.from({length: 18}, (_, i) => {
          const an = (i / 18) * Math.PI * 2, r0 = 380 + burst * 60, r1 = r0 + 70 + burst * 40;
          return <line key={i} x1={540 + Math.cos(an) * r0} y1={430 + Math.sin(an) * r0 * 0.7} x2={540 + Math.cos(an) * r1} y2={430 + Math.sin(an) * r1 * 0.7} stroke={GOLD} strokeWidth={12} strokeLinecap="round" />;
        })}
      </svg>
      <Voucher t={t} a={K.buono2 - 0.35} x={110} y={580} w={860} amount="5 €" sub="per te" />
    </>
  );
};

const ShQuestion: React.FC<{t: number}> = ({t}) => {
  const a = sh('question').a;
  return (
    <>
      <Cream t={t} strands={0} />
      <Stack y={220} gap={6}>
        <Line t={t} a={K.quando - 0.2} text="quando" size={120} box="green" />
        <Line t={t} a={K.come - 0.2} text="e come" size={100} serif color={ROSE} />
        <Line t={t} a={K.utilizzare - 0.25} text="lo puoi usare?" size={70} />
      </Stack>
      <T3 t={t} a={a + 0.1} text="?" y={720} h={600} size={3.8} mode="green" spin={-1} />
    </>
  );
};

const ShDec: React.FC<{t: number}> = ({t}) => {
  const a = sh('dec').a;
  return (
    <>
      <Forest t={t} />
      <Stack y={170}><Line t={t} a={a + 0.02} text="usalo dal" size={70} serif color={PINK_HI} /></Stack>
      <Page t={t} a={K.d1 - 0.15} top="DIC" m="1" x={110} y={280} w={360} sz={170} />
      <div style={{position: 'absolute', left: 490, top: 430, fontFamily: MONT, fontWeight: 900, fontSize: 90, color: PINK, opacity: prog(t, K.d31 - 0.3, K.d31)}}>→</div>
      <Page t={t} a={K.d31 - 0.15} top="DIC" m="31" x={610} y={280} w={360} sz={170} />
      <T3 t={t} a={K.anno - 0.3} text="2026" y={720} h={360} size={1.5} mode="pink" />
    </>
  );
};

const ShBag: React.FC<{t: number}> = ({t}) => (
  <Clip name="bag" t={t} dz={0.02} shade={0.55}>
    <Stack y={170} gap={6}>
      <Line t={t} a={sh('bag').a + 0.05} text="su una spesa minima di" size={58} color={WHITE} />
      <Line t={t} a={K.e25 - 0.3} text="25 €" size={150} box="white" />
    </Stack>
    <Stack y={1150} gap={4}>
      <Line t={t} a={K.marchio - 0.45} text="di prodotti" size={70} serif color={WHITE} />
      <Line t={t} a={K.marchio - 0.25} text="marchio farmacia" size={68} box="green" />
    </Stack>
  </Clip>
);

const ShCare: React.FC<{t: number}> = ({t}) => {
  const strike = eO3(prog(t, K.lusso + 0.05, K.lusso + 0.4));
  return (
    <Clip name="care" t={t} dz={0.02} shade={0.55}>
      <Stack y={170} gap={4}>
        <Line t={t} a={sh('care').a + 0.05} text="prendersi cura di sé" size={70} serif color={WHITE} />
        <Line t={t} a={K.bisogno - 0.3} text="è un bisogno" size={100} box="green" />
      </Stack>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1170, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
        <Line t={t} a={K.lusso - 0.5} text="non un" size={80} serif color={WHITE} />
        <div style={{position: 'relative'}}>
          <Line t={t} a={K.lusso - 0.3} text="lusso" size={110} box="white" />
          <div style={{position: 'absolute', left: 24, right: 24, top: '52%', height: 14, background: HOT, borderRadius: 9, transformOrigin: 'left', transform: `scaleX(${strike}) rotate(-4deg)`}} />
        </div>
      </div>
    </Clip>
  );
};

const ShTalk: React.FC<{t: number}> = ({t}) => {
  const a = sh('talk').a;
  return (
    <>
      <Cream t={t} strands={0} />
      <div style={{position: 'absolute', left: 0, top: 170, width: W, height: 470}}><Logo3D lt={t - a} w={W} h={470} /></div>
      <Stack y={680} gap={6}>
        <Line t={t} a={K.noi - 0.25} text="e noi" size={90} serif color={ROSE} />
        <Line t={t} a={K.aiutiamo - 0.2} text="ti aiutiamo" size={110} box="green" />
        <Line t={t} a={K.aspettiamo - 0.3} text="ti aspettiamo!" size={80} serif color={GREEN} />
      </Stack>
    </>
  );
};

const ShEnd: React.FC<{t: number}> = ({t}) => {
  const a = sh('end').a;
  const lt = t - a;
  const inf = eO5(prog(lt, 1.2, 1.7));
  const rows: [string, string][] = [['calendar', 'Dal 2 al 30 novembre'], ['bag', 'Con almeno 49 € viso, corpo e capelli'], ['spark', 'Usalo dal 1° al 31 dicembre 2026']];
  return (
    <>
      <Cream t={t} strands={0} />
      <Stack y={110}><Line t={t} a={a + 0.05} text="novembre: il mese dei buoni" size={52} box="green" /></Stack>
      <Voucher t={t} a={a + 0.15} x={190} y={230} w={700} amount="5 €" sub="un vantaggio che torna a te" />
      <div style={{position: 'absolute', left: 70, right: 70, top: 680, display: 'flex', flexDirection: 'column', gap: 14}}>
        {rows.map(([ic, tx], i) => {
          const p = eO5(prog(lt, 0.5 + i * 0.18, 0.95 + i * 0.18));
          return (
            <div key={tx} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '12px 26px 12px 12px', borderRadius: 999, background: WHITE, boxShadow: '0 12px 30px rgba(22,58,28,0.16)', fontFamily: MONT, fontWeight: 800, fontSize: 38, color: GREEN_D,
              opacity: p, transform: `translateX(${(1 - p) * -80}px)`}}>
              <div style={{width: 62, height: 62, borderRadius: 99, background: GRAD_G, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} c={CREAM} s={36} /></div>
              {tx}
            </div>
          );
        })}
      </div>
      <Stack y={1010}><Line t={t} a={a + 1.0} text="chiedi in farmacia tutti i dettagli" size={50} serif color={ROSE} /></Stack>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1120, display: 'flex', flexDirection: 'column', gap: 16, opacity: inf, transform: `translateY(${(1 - inf) * 40}px)`}}>
        <div style={{display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'center'}}>
          <Img src={staticFile('logo/mark.png')} style={{height: 90}} />
          <Img src={staticFile('logo/wordmark.png')} style={{height: 80}} />
        </div>
        {[['pin', 'Via Aceronia 1 · Brienza (PZ)'], ['phone', 'Tel. 0975 381021']].map(([ic, tx]) => (
          <div key={tx} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '10px 26px 10px 10px', borderRadius: 999, background: WHITE, boxShadow: '0 12px 30px rgba(22,58,28,0.16)', fontFamily: MONT, fontWeight: 800, fontSize: 40, color: GREEN_D}}>
            <div style={{width: 60, height: 60, borderRadius: 99, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} c={GREEN_DD} s={36} /></div>
            {tx}
          </div>
        ))}
      </div>
    </>
  );
};

const RENDER: Record<string, React.FC<{t: number}>> = {
  voucher: ShVoucher, coins: ShCoins, returns: ShReturns, mech: ShMech, products: ShProducts, gift: ShGift, question: ShQuestion, dec: ShDec, bag: ShBag, care: ShCare, talk: ShTalk, end: ShEnd,
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
