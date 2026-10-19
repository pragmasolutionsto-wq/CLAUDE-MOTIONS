import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import S from './shots.json';
import {Capsules3D, Follicles3D, Logo3D, Mode, Text3D} from './three';
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

// apertura: i tre posti dove trovi i capelli, i chip si accumulano sui tagli rapidi
const HookChips: React.FC<{t: number}> = ({t}) => (
  <Stack y={1130} gap={14}>
    <Chip t={t} a={K.spazzola - 0.25} text="sulla spazzola" icon="brush" size={44} />
    <Chip t={t} a={K.spalle - 0.2} text="sulle spalle" icon="shoulder" size={44} tone="pink" from="right" />
    <Chip t={t} a={K.lavandino - 0.2} text="nel lavandino" icon="sink" size={44} />
  </Stack>
);

const ShBrush: React.FC<{t: number}> = ({t}) => (
  <Clip name="brush" t={t} z0={1.0} dz={0.04}>
    <T3 t={t} a={0.05} text="CAPELLI" y={150} h={400} size={1.45} mode="green" spin={0.6} />
    <HookChips t={t} />
  </Clip>
);
const ShShoulder: React.FC<{t: number}> = ({t}) => (
  <Clip name="shoulder" t={t} z0={1.06} dz={0.05}>
    <HookChips t={t} />
  </Clip>
);
const ShSink: React.FC<{t: number}> = ({t}) => (
  <Clip name="sink" t={t} z0={1.06} dz={0.05}>
    <HookChips t={t} />
  </Clip>
);

// "ancora di più": la pioggia di capelli aumenta
const ShMore: React.FC<{t: number}> = ({t}) => {
  const a = sh('more').a;
  const rain = prog(t, K.ancora - 0.3, K.ancora + 0.8);
  return (
    <>
      <Cream t={t} strands={6} />
      <Strands t={t} n={Math.round(6 + rain * 26)} o={0.5 * rain} seed={21} speed={1.6} />
      <Stack y={300}><Line t={t} a={a + 0.02} text="quest'anno" size={84} serif color={ROSE} /></Stack>
      <Stack y={420}><Line t={t} a={a + 0.35} text="potresti trovarne" size={66} /></Stack>
      <T3 t={t} a={K.ancora - 0.2} text="DI PIÙ" y={520} h={480} size={1.9} mode="green" />
      <Stack y={1030} gap={8}>
        <Line t={t} a={K.spiego - 0.25} text="e ti spiego" size={78} serif color={GREEN} />
        <Line t={t} a={K.perche - 0.2} text="perché" size={120} box="green" />
      </Stack>
    </>
  );
};

const ShFollicle: React.FC<{t: number}> = ({t}) => (
  <Clip name="follicle" t={t} dz={0.02} shade={0.6}>
    <Stack y={190} gap={4}>
      <Line t={t} a={sh('follicle').a + 0.1} text="il capello segue" size={62} />
      <Line t={t} a={K.ciclo - 0.2} text="un ciclo" size={118} box="green" />
      <Line t={t} a={K.naturale - 0.2} text="naturale" size={90} serif color={ROSE} />
    </Stack>
  </Clip>
);

// i tre follicoli in 3D: cresce, si ferma, cade
const ShCycle: React.FC<{t: number}> = ({t}) => {
  const a = sh('cycle').a;
  const labels: [string, number, string, Box][] = [['cresce', K.cresce, 'up', 'green'], ['si ferma', K.ferma, 'moon', 'white'], ['cade', K.cade, 'leaf', 'pink']];
  return (
    <>
      <Cream t={t} strands={4} />
      <Stack y={200}><Line t={t} a={a + 0.02} text="il ciclo del capello" size={62} box="white" /></Stack>
      <div style={{position: 'absolute', left: 0, top: 300, width: W, height: 900}}>
        <Follicles3D t={t} a={a} cues={[K.cresce, K.ferma, K.cade]} w={W} h={900} />
      </div>
      {[0, 1].map((i) => (
        <div key={i} style={{position: 'absolute', left: 30 + 320 + i * 360 - 6, top: 1190, fontFamily: MONT, fontWeight: 900, fontSize: 54, color: MAUVE, opacity: prog(t, labels[i + 1][1] - 0.3, labels[i + 1][1])}}>→</div>
      ))}
      <div style={{position: 'absolute', left: 30, right: 30, top: 1170, display: 'flex', justifyContent: 'space-between'}}>
        {labels.map(([tx, at, ic, bx], i) => {
          const p = prog(t, at - 0.2, at + 0.3);
          const s = spring(p * 1.8);
          return (
            <div key={tx} style={{width: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: clamp(p * 3), transform: `translateY(${(1 - s) * 80}px) scale(${lerp(0.5, 1, s)})`}}>
              <div style={{width: 86, height: 86, borderRadius: 99, background: bx === 'green' ? GREEN : bx === 'pink' ? PINK : WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(22,58,28,0.25)'}}>
                <Icon name={ic} c={bx === 'green' ? CREAM : GREEN_DD} s={50} />
              </div>
              <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 50, color: GREEN_D, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{tx}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// calendario: luglio e agosto si girano, i follicoli vanno a riposo
const Page: React.FC<{t: number; a: number; m: string; x: number; y: number; hot?: boolean; w?: number; sz?: number}> = ({t, a, m, x, y, hot, w = 400, sz = 64}) => {
  const p = prog(t, a - 0.1, a + 0.6);
  if (p <= 0) return null;
  const s = spring(p * 1.8);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, perspective: 1000}}>
      <div style={{borderRadius: 30, overflow: 'hidden', background: WHITE, boxShadow: '0 30px 60px rgba(10,30,12,0.4)', transform: `rotateX(${(1 - s) * -100}deg)`, transformOrigin: '50% 0%', opacity: clamp(p * 3)}}>
        <div style={{height: 80, background: hot ? `linear-gradient(90deg, ${GOLD}, ${HOT})` : GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60}}>
          {[0, 1].map((i) => <div key={i} style={{width: 22, height: 22, borderRadius: 99, background: 'rgba(255,255,255,0.7)'}} />)}
        </div>
        <div style={{padding: '30px 10px 34px', textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: sz, color: GREEN_D, textTransform: 'uppercase'}}>{m}</div>
      </div>
    </div>
  );
};

const ShSummer: React.FC<{t: number}> = ({t}) => {
  const a = sh('summer').a;
  const zz = prog(t, K.riposo2 - 0.3, K.riposo2 + 0.3);
  return (
    <>
      <Forest t={t} glow={GOLD} />
      <Stack y={180}><Line t={t} a={a + 0.02} text="tra" size={70} serif color={PINK_HI} /></Stack>
      <Page t={t} a={K.luglio} m="luglio" x={90} y={320} hot />
      <Page t={t} a={K.agosto} m="agosto" x={590} y={380} hot />
      <Stack y={800} gap={16}>
        <Chip t={t} a={K.follicoli - 0.3} text="più follicoli" icon="plus" size={48} tone="pink" />
        <Line t={t} a={K.riposo2 - 0.35} text="vanno a riposo" size={96} box="white" />
      </Stack>
      <svg width={W} height={400} style={{position: 'absolute', left: 0, top: 1080, opacity: zz}}>
        {['z', 'z', 'Z'].map((z, i) => (
          <text key={i} x={420 + i * 90} y={300 - i * 70 - ((t * 40) % 30)} fontFamily={MONT} fontWeight={900} fontSize={70 + i * 24} fill={PINK_HI} opacity={0.6 + 0.4 * Math.sin(t * 3 + i)}>{z}</text>
        ))}
      </svg>
    </>
  );
};

const ShMonths: React.FC<{t: number}> = ({t}) => {
  const a = sh('months').a;
  return (
    <>
      <Cream t={t} />
      <Stack y={260}><Line t={t} a={a + 0.05} text="la fase di riposo dura" size={54} /></Stack>
      <T3 t={t} a={K.due - 0.35} text="2-3" y={360} h={520} size={2.6} mode="green" />
      <Stack y={880}><Line t={t} a={K.mesi - 0.25} text="mesi" size={150} box="green" /></Stack>
      <Stack y={1130}><Chip t={t} a={K.mesi + 0.15} text="poi i capelli cadono" icon="leaf" size={40} /></Stack>
    </>
  );
};

const ShLeaves: React.FC<{t: number}> = ({t}) => (
  <Clip name="leaves" t={t} dz={0.02} shade={0.7}>
    <Stack y={180} gap={4}>
      <Line t={t} a={sh('leaves').a + 0.05} text="la caduta" size={96} box="white" />
      <Line t={t} a={K.evidente - 0.3} text="è più evidente" size={80} serif color={WHITE} />
    </Stack>
    <Stack y={820} gap={18}>
      <Chip t={t} a={K.settembre - 0.2} text="settembre" icon="leaf" size={52} tone="pink" />
      <Chip t={t} a={K.ottobre - 0.2} text="ottobre" icon="leaf" size={60} tone="green" from="right" />
      <Chip t={t} a={K.novembre - 0.2} text="novembre" icon="leaf" size={52} tone="pink" />
    </Stack>
  </Clip>
);

const ShSun: React.FC<{t: number}> = ({t}) => (
  <Clip name="sun" t={t} dz={0.03} shade={0.5}>
    <Stack y={560}><Line t={t} a={sh('sun').a + 0.15} text="un'estate" size={84} serif color={WHITE} /></Stack>
    <T3 t={t} a={K.estate - 0.05} text="TANTO" y={640} h={300} size={1.4} mode="green" />
    <Stack y={930}><Line t={t} a={K.calda - 0.25} text="calda" size={150} box="pink" /></Stack>
  </Clip>
);

// calore + UV → stress ossidativo
const ShStress: React.FC<{t: number}> = ({t}) => {
  const a = sh('stress').a;
  const sp = prog(t, K.stress - 0.3, K.stress + 0.2);
  const shake = sp > 0 && sp < 1 ? Math.sin(t * 90) * 10 * (1 - sp) : Math.sin(t * 40) * 1.5 * clamp(t - K.stress);
  return (
    <>
      <Forest t={t} glow={HOT} />
      <div style={{position: 'absolute', left: 140, top: 210, width: 800, height: 800, borderRadius: 999, background: `radial-gradient(circle, ${GOLD}66 0%, ${HOT}22 40%, transparent 70%)`, transform: `scale(${1 + 0.06 * Math.sin(t * 4)})`}} />
      <Stack y={230} gap={18}>
        <Chip t={t} a={K.calore - 0.15} text="calore" icon="flame" size={56} tone="hot" />
        <Chip t={t} a={K.uv - 0.25} text="raggi uv" icon="sun" size={56} tone="white" from="right" />
      </Stack>
      <Stack y={560}><Line t={t} a={K.aumentato - 0.3} text="aumentano lo" size={60} color={PINK_HI} /></Stack>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', transform: `translateX(${shake}px)`}}>
        <Line t={t} a={K.stress - 0.25} text="stress" size={200} color={WHITE} />
      </div>
      <Stack y={880}><Line t={t} a={K.ossidativo - 0.25} text="ossidativo" size={130} serif color={PINK} /></Stack>
      <Stack y={1130}><Chip t={t} a={K.cuoio - 0.25} text="del cuoio capelluto" icon="shoulder" size={42} tone="pink" /></Stack>
    </>
  );
};

const ShRadicals: React.FC<{t: number}> = ({t}) => (
  <Clip name="radicals" t={t} dz={0.02} shade={0.7}>
    <Stack y={190} gap={6}>
      <Line t={t} a={sh('radicals').a + 0.1} text="i tanti" size={74} serif color={WHITE} />
      <Line t={t} a={K.radicali - 0.2} text="radicali liberi" size={92} box="pink" />
    </Stack>
    <Target t={t} a={K.radicali + 0.2} x={250} y={760} r={90} />
    <Target t={t} a={K.radicali + 0.45} x={860} y={980} r={80} />
    <Target t={t} a={K.danneggiato - 0.1} x={560} y={900} r={130} c={PINK_HI} />
    <Stack y={1180}><Chip t={t} a={K.danneggiato - 0.2} text="danneggiano il follicolo" icon="bolt" size={40} tone="hot" /></Stack>
  </Clip>
);

// interruttore crescita → riposo
const ShPhase: React.FC<{t: number}> = ({t}) => {
  const a = sh('phase').a;
  const sw = eIO(prog(t, K.riposo4 - 0.45, K.riposo4 + 0.1));
  const inn = spring(prog(t, K.crescita - 0.6, K.crescita) * 1.8);
  const w = 900, x0 = 90, y0 = 720, hh = 230;
  return (
    <>
      <Cream t={t} />
      <Stack y={240} gap={6}>
        <Line t={t} a={a + 0.02} text="più capelli passano" size={60} />
        <Line t={t} a={a + 0.4} text="prima del tempo" size={80} serif color={ROSE} />
      </Stack>
      <div style={{position: 'absolute', left: x0, top: y0, width: w, height: hh, borderRadius: 999, background: lerp(0, 1, sw) > 0.5 ? CREAM_2 : MINT, boxShadow: 'inset 0 10px 30px rgba(22,58,28,0.18), 0 20px 50px rgba(22,58,28,0.2)', transform: `scale(${lerp(0.6, 1, inn)})`, opacity: clamp(inn * 2)}}>
        <div style={{position: 'absolute', left: 14 + sw * (w / 2 - 14), top: 14, width: w / 2 - 14, height: hh - 28, borderRadius: 999, background: sw > 0.5 ? GRAD : GRAD_G, boxShadow: '0 14px 30px rgba(22,58,28,0.35)'}} />
        {['crescita', 'riposo'].map((tx, i) => (
          <div key={tx} style={{position: 'absolute', left: i * (w / 2), width: w / 2, top: 0, height: hh, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            fontFamily: MONT, fontWeight: 900, fontSize: 56, textTransform: 'uppercase', color: (i === 0 ? sw < 0.5 : sw >= 0.5) ? (i === 0 ? CREAM : GREEN_DD) : 'rgba(38,86,42,0.45)'}}>
            <Icon name={i === 0 ? 'up' : 'moon'} c={(i === 0 ? sw < 0.5 : sw >= 0.5) ? (i === 0 ? CREAM : GREEN_DD) : 'rgba(38,86,42,0.45)'} s={56} />
            {tx}
          </div>
        ))}
      </div>
      <Stack y={1040}><Line t={t} a={K.riposo4 + 0.05} text="più caduta dopo" size={64} box="pink" /></Stack>
    </>
  );
};

// qualche mese dopo... ADESSO
const ShNow: React.FC<{t: number}> = ({t}) => {
  const a = sh('now').a;
  const months = ['luglio', 'agosto', 'settembre', 'ottobre'];
  const k = Math.min(3, Math.floor(prog(t, K.mese - 0.4, K.adesso - 0.2) * 4));
  const flash = Math.exp(-Math.pow((t - K.adesso) / 0.12, 2));
  return (
    <>
      <Forest t={t} />
      <Stack y={220}><Line t={t} a={a + 0.02} text="il risultato si vede" size={58} color={CREAM} /></Stack>
      <Stack y={320}><Line t={t} a={K.mese - 0.3} text="qualche mese dopo" size={86} serif color={PINK_HI} /></Stack>
      {t >= K.mese - 0.4 && <Page t={t} a={K.mese - 0.4 + k * 0.001} m={months[k]} x={290} y={480} w={500} sz={62} hot={k < 2} key={k} />}
      <T3 t={t} a={K.adesso - 0.25} text="ADESSO" y={830} h={360} size={1.35} mode="pink" />
      <AbsoluteFill style={{background: WHITE, opacity: flash * 0.6}} />
    </>
  );
};

const ShAspect: React.FC<{t: number}> = ({t}) => {
  const a = sh('aspect').a;
  return (
    <>
      <Cream t={t} />
      <T3 t={t} a={a + 0.05} text="!" y={200} h={560} size={4.2} mode="green" spin={-1} />
      <Stack y={760} gap={6}>
        <Line t={t} a={a + 0.2} text="c'è un altro" size={80} serif color={ROSE} />
        <Line t={t} a={K.importante - 0.35} text="aspetto importante" size={66} box="green" />
      </Stack>
    </>
  );
};

// tinte, schiariture, decolorazioni: gocce di colore che cadono e si allargano
const ShDyes: React.FC<{t: number}> = ({t}) => {
  const items: [string, number, string][] = [['tinte', K.tinte, '#8b4a3a'], ['schiariture', K.schiariture, GOLD], ['decolorazioni', K.decolorazioni, '#f3efe6']];
  return (
    <>
      <Forest t={t} />
      <Stack y={190}><Line t={t} a={sh('dyes').a + 0.05} text="capelli trattati con" size={58} color={CREAM} /></Stack>
      <svg width={W} height={600} style={{position: 'absolute', left: 0, top: 300}}>
        {items.map(([, at, c], i) => {
          const p = prog(t, at - 0.35, at + 0.15);
          const sp = eO3(prog(t, at + 0.1, at + 0.7));
          const cx = 210 + i * 330;
          return (
            <g key={i}>
              <ellipse cx={cx} cy={430} rx={140 * sp} ry={36 * sp} fill={c} opacity={0.5 * (1 - sp * 0.4)} />
              <path transform={`translate(${cx} ${lerp(-100, 300, eIO(p))}) scale(${1.9})`} d="M0 -50 C 22 -20, 34 0, 34 18 A 34 34 0 0 1 -34 18 C -34 0, -22 -20, 0 -50z" fill={c} stroke={WHITE} strokeWidth={3} opacity={p > 0 ? 1 - sp * 0.7 : 0} />
            </g>
          );
        })}
      </svg>
      <Stack y={840} gap={18}>
        <Chip t={t} a={K.tinte - 0.15} text="tinte" icon="palette" size={52} tone="pink" />
        <Chip t={t} a={K.schiariture - 0.15} text="schiariture" icon="spark" size={52} from="right" />
        <Chip t={t} a={K.decolorazioni - 0.15} text="decolorazioni" icon="drop" size={52} tone="pink" />
      </Stack>
    </>
  );
};

const ShTools: React.FC<{t: number}> = ({t}) => (
  <Clip name="tools" t={t} dz={0.02} shade={0.6}>
    <Stack y={190}><Line t={t} a={K.stressati - 0.2} text="stressati da" size={80} serif color={WHITE} /></Stack>
    <Stack y={1020} gap={16}>
      <Chip t={t} a={K.phon5 - 0.2} text="phon" icon="dryer" size={52} tone="green" />
      <Chip t={t} a={K.spazzola5 - 0.2} text="spazzola" icon="brush" size={52} from="right" />
      <Chip t={t} a={K.piastra5 - 0.2} text="piastra" icon="iron" size={52} tone="pink" />
    </Stack>
  </Clip>
);

const ShBreak: React.FC<{t: number}> = ({t}) => {
  const sp = prog(t, K.spezzarsi - 0.1, K.spezzarsi + 0.3);
  const shake = sp > 0 && sp < 1 ? Math.sin(t * 100) * 14 * (1 - sp) : 0;
  return (
    <Clip name="break" t={t} dz={0.03} shade={0.7}>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}>
        <Stack y={170}><Line t={t} a={sh('break').a + 0.1} text="diventano più" size={66} color={WHITE} /></Stack>
        <T3 t={t} a={K.fragili - 0.3} text="FRAGILI" y={250} h={360} size={1.35} mode="green" />
        <Stack y={1160}><Line t={t} a={K.spezzarsi - 0.25} text="e si spezzano" size={86} box="pink" /></Stack>
      </div>
    </Clip>
  );
};

// la somma delle cause
const ShSum: React.FC<{t: number}> = ({t}) => {
  const a = sh('sum').a;
  const rows: [string, string, number][] = [['ciclo naturale', 'leaf', a + 0.25], ['estate caldissima', 'sun', K.sommano - 0.1], ['trattamenti e calore', 'dryer', K.cause - 0.2]];
  const eq = prog(t, K.caduta6 - 0.35, K.caduta6 + 0.2);
  return (
    <>
      <Cream t={t} />
      <Stack y={190}><Line t={t} a={a + 0.02} text="si sommano più cause" size={58} box="white" /></Stack>
      {rows.map(([tx, ic, at], i) => {
        const p = prog(t, at, at + 0.55);
        const s = spring(p * 1.8);
        return (
          <div key={tx} style={{position: 'absolute', left: 90, right: 90, top: 340 + i * 200, height: 160, borderRadius: 34, background: i === 1 ? GRAD : WHITE, display: 'flex', alignItems: 'center', gap: 26, padding: '0 34px',
            boxShadow: '0 18px 40px rgba(22,58,28,0.2)', transform: `translateY(${(1 - s) * -400}px) rotate(${(1 - s) * (i % 2 ? 8 : -8)}deg)`, opacity: clamp(p * 3)}}>
            <div style={{width: 100, height: 100, borderRadius: 26, background: GRAD_G, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} c={CREAM} s={60} /></div>
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 52, color: GREEN_D, textTransform: 'uppercase'}}>{tx}</div>
            {i > 0 && <div style={{position: 'absolute', left: -6, top: -54, width: 70, height: 70, borderRadius: 99, background: GREEN, color: CREAM, fontFamily: MONT, fontWeight: 900, fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `5px solid ${CREAM}`}}>+</div>}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center', opacity: clamp(eq * 3), transform: `scale(${lerp(1.6, 1, eBack(eq, 1.4))})`}}>
        <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 110, color: CREAM, background: GRAD_G, padding: '14px 44px 20px', borderRadius: 28, textTransform: 'uppercase', boxShadow: '0 24px 50px rgba(22,58,28,0.4)'}}>= più caduta</div>
      </div>
    </>
  );
};

const ShTips: React.FC<{t: number}> = ({t}) => {
  const a = sh('tips').a;
  return (
    <>
      <Forest t={t} />
      <div style={{position: 'absolute', left: 0, top: 820, width: W, height: 700, opacity: 0.9}}><Capsules3D lt={t - a} w={W} h={700} n={7} /></div>
      <Stack y={360}><Line t={t} a={a + 0.02} text="ti do qualche" size={80} serif color={PINK_HI} /></Stack>
      <T3 t={t} a={a + 0.1} text="CONSIGLIO" y={450} h={360} size={1.1} mode="pink" />
    </>
  );
};

const ShShampoo: React.FC<{t: number}> = ({t}) => (
  <Clip name="shampoo" t={t} dz={0.02} shade={0.5}>
    <Tip t={t} a={sh('shampoo').a + 0.05} n={1} text="shampoo delicato" sub="non aggressivo" subA={K.delicato} icon="drop" y={1120} />
  </Clip>
);
const ShProtect: React.FC<{t: number}> = ({t}) => (
  <Clip name="protect" t={t} dz={0.02} shade={0.5}>
    <Tip t={t} a={sh('protect').a + 0.05} n={2} text="limita il calore diretto" sub="+ termoprotettore" subA={K.termo - 0.2} icon="shield" y={1100} />
  </Clip>
);
const ShSupplement: React.FC<{t: number}> = ({t}) => (
  <Clip name="supplement" t={t} dz={0.02} shade={0.5}>
    <Tip t={t} a={sh('supplement').a + 0.05} n={3} text="integratori specifici" sub="per nutrire i capelli" subA={K.integratori} icon="capsule" y={1120} />
  </Clip>
);

const ShTalk: React.FC<{t: number}> = ({t}) => {
  const a = sh('talk').a;
  return (
    <>
      <Cream t={t} />
      <div style={{position: 'absolute', left: 0, top: 170, width: W, height: 470}}><Logo3D lt={t - a} w={W} h={470} /></div>
      <Stack y={660} gap={4}>
        <Line t={t} a={K.vero - 0.25} text="il vero consiglio?" size={84} serif color={ROSE} />
        <Line t={t} a={K.venire - 0.2} text="vieni a parlarne" size={84} />
        <Line t={t} a={K.noi - 0.3} text="con noi" size={140} box="green" />
      </Stack>
    </>
  );
};

const ShHealthy: React.FC<{t: number}> = ({t}) => (
  <Clip name="healthy" t={t} z0={1.02} dz={0.012} shade={0.6}>
    <Stack y={170}><Line t={t} a={K.situazione - 0.3} text="ti aiutiamo a ridare" size={58} color={WHITE} /></Stack>
    <T3 t={t} a={K.vigore - 0.3} text="VIGORE" y={240} h={300} size={1.2} mode="green" />
    <Stack y={1040}><Line t={t} a={K.forza - 0.35} text="e forza" size={120} box="white" /></Stack>
    <Stack y={1220}><Line t={t} a={K.forza + 0.15} text="ai tuoi capelli" size={80} serif color={WHITE} /></Stack>
  </Clip>
);

const ShEnd: React.FC<{t: number}> = ({t}) => {
  const a = sh('end').a;
  const lt = t - a;
  const wv = eO5(prog(lt, 0.45, 0.95)), inf = eO5(prog(lt, 1.2, 1.7)), dis = prog(lt, 1.8, 2.2);
  return (
    <>
      <Cream t={t} strands={4} />
      <div style={{position: 'absolute', left: 0, top: 110, width: W, height: 500}}><Logo3D lt={lt} w={W} h={500} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center'}}>
        <Img src={staticFile('logo/wordmark.png')} style={{width: 640, opacity: wv, transform: `translateY(${(1 - wv) * 40}px)`}} />
      </div>
      <Stack y={840} gap={4}>
        <Line t={t} a={a + 0.15} text="ti aspettiamo" size={96} serif color={ROSE} />
        <Line t={t} a={a + 0.6} text="nella nostra farmacia" size={64} box="green" />
      </Stack>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1130, display: 'flex', flexDirection: 'column', gap: 18, opacity: inf, transform: `translateY(${(1 - inf) * 40}px)`}}>
        {[['pin', 'Via Aceronia 1 · Brienza (PZ)'], ['phone', 'Tel. 0975 381021']].map(([ic, tx]) => (
          <div key={tx} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 28px 14px 14px', borderRadius: 999, background: WHITE, boxShadow: '0 12px 30px rgba(22,58,28,0.18)', fontFamily: MONT, fontWeight: 800, fontSize: 44, color: GREEN_D}}>
            <div style={{width: 68, height: 68, borderRadius: 99, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} c={GREEN_DD} s={40} /></div>
            {tx}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1440, fontFamily: MONT, fontWeight: 700, fontSize: 31, lineHeight: 1.3, color: GREEN_D, opacity: dis * 0.85, textAlign: 'center'}}>
        La caduta resta intensa oltre 3 mesi o noti zone più diradate? Parliamone insieme.
      </div>
    </>
  );
};

const RENDER: Record<string, React.FC<{t: number}>> = {
  brush: ShBrush, shoulder: ShShoulder, sink: ShSink, more: ShMore, follicle: ShFollicle, cycle: ShCycle, summer: ShSummer, months: ShMonths, leaves: ShLeaves,
  sun: ShSun, stress: ShStress, radicals: ShRadicals, phase: ShPhase, now: ShNow, aspect: ShAspect, dyes: ShDyes, tools: ShTools, break: ShBreak, sum: ShSum,
  tips: ShTips, shampoo: ShShampoo, protect: ShProtect, supplement: ShSupplement, talk: ShTalk, healthy: ShHealthy, end: ShEnd,
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
