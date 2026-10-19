import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import S from './shots.json';
import {Logo3D, Text3D} from './three';
import {
  BLUE, BLUE_D, CYAN, CYAN_HI, DURATION, FPS, GRAD, GREEN, H, HOT, LIME, LIME_HI, MONT, NAVY, NAVY_2, SENTS, SKY, W, WHITE, WS, YEL,
  clamp, eBack, eIO, eO3, eO5, lerp, life, prog, rnd, sE, spring,
} from './util';

type Shot = {name: string; kind: string; a: number; b: number; tr: string};
const SHOTS = S.shots as Shot[];
const K = S.k as Record<string, number>;
const sh = (name: string) => SHOTS.find((x) => x.name === name)!;
const PAD = 0.5; // margine delle clip (prep_ai.py)
const TR: Record<string, number> = {cube: 0.6, whip: 0.36, none: 0};
const SUB_Y = 1530;

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
    calendar: <><rect {...st} x="3" y="5" width="18" height="16" rx="3" /><path {...st} d="M3 10h18M8 3v4M16 3v4M8 15l2.5 2.5L16 13" /></>,
    bolt: <path {...st} d="M13 2L4 14h7l-1 8 9-12h-7z" />,
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
const T3: React.FC<{t: number; a: number; text: string; y: number; h?: number; size?: number; mode?: 'grad' | 'white' | 'cyan'; out?: number; spin?: number; x?: number; w?: number}> = ({t, a, text, y, h = 520, size, mode, out = 99, spin, x = 0, w = W}) => {
  if (t < a - 0.05 || t > out + 0.05) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, filter: 'drop-shadow(0 24px 40px rgba(0,10,30,0.55))'}}>
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
      if (cur.length && len + word.length > 17) flush();
      cur.push([t, word]);
      if (/[,.:?!]$/.test(word)) flush();
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
    <div style={{position: 'absolute', left: 40, right: 40, top: SUB_Y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 30px', transform: `scale(${lerp(0.86, 1, eBack(p))})`, opacity: clamp(p * 3)}}>
      {c.words.map(([wt, word], i) => {
        const on = t >= wt - 0.03;
        const next = c.words[i + 1]?.[0] ?? c.b;
        const act = on && t < next;
        const pp = prog(t, wt - 0.03, wt + 0.12);
        return (
          <span key={i} style={{fontFamily: MONT, fontWeight: 900, fontSize: 66, lineHeight: 1.12, textTransform: 'uppercase', color: act ? LIME_HI : WHITE, opacity: on ? 1 : 0.55,
            WebkitTextStroke: '10px rgba(3,18,32,0.92)', paintOrder: 'stroke fill', textShadow: '0 8px 22px rgba(0,0,0,0.45)',
            display: 'inline-block', transform: `scale(${act ? lerp(1.18, 1.06, pp) : 1})`}}>
            {word.replace(/[,.:]$/, '')}
          </span>
        );
      })}
    </div>
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

/* ------------------------------------------------------------------ inquadrature */

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

// card che entrano in profondità, una per passaggio
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

const ShBody: React.FC<{t: number}> = ({t}) => (
  <Clip name="body" t={t} z0={1.0} dz={0.02}>
    <Stack y={150}><Line t={t} a={0.1} text="il tuo" size={70} color={CYAN_HI} /></Stack>
    <T3 t={t} a={0.25} text="CORPO" y={230} h={400} size={1.7} mode="white" spin={0.6} />
    <Stack y={1180}><Line t={t} a={K.cambiando - 0.15} text="cosa sta cambiando?" size={60} box="grad" /></Stack>
  </Clip>
);

// "peso": la parola si incrina e lascia il posto al messaggio
const ShWeight: React.FC<{t: number}> = ({t}) => {
  const a = sh('weight').a;
  const crack = prog(t, K.racconta - 0.2, K.racconta + 0.4);
  return (
    <>
      <Navy t={t} hue={YEL} />
      <Stack y={480}><Line t={t} a={a + 0.02} text="il peso" size={80} color={CYAN_HI} /></Stack>
      <div style={{position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center', opacity: 1 - crack * 0.45}}>
        <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 210, color: WHITE, letterSpacing: '-0.02em', transform: `scale(${lerp(1.25, 1, eO3(prog(t, a, a + 0.5))) - crack * 0.12})`, textShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>DA SOLO</div>
      </div>
      <Stack y={900}><Line t={t} a={K.racconta - 0.25} text="non racconta tutto" size={78} box="grad" /></Stack>
      <Corner dark />
    </>
  );
};

const ShBia3d: React.FC<{t: number}> = ({t}) => {
  const a = sh('bia3d').a;
  const parts = ['bio', 'impedenzio', 'metria'];
  return (
    <>
      <Navy t={t} hue={LIME} />
      <Stack y={260}><Line t={t} a={a + 0.05} text="può aiutarti la" size={48} color={CYAN_HI} /></Stack>
      <T3 t={t} a={a + 0.1} text="BIA" y={330} h={520} size={2.6} />
      <Stack y={880} gap={6}>
        {parts.map((p, i) => <Line key={p} t={t} a={K.bio - 0.25 + i * 0.22} text={p} size={i === 1 ? 104 : 96} box={i === 1 ? 'white' : 'none'} />)}
      </Stack>
      <Corner dark />
    </>
  );
};

const ShSignal: React.FC<{t: number}> = ({t}) => (
  <Clip name="signal" t={t} dz={0.02}>
    <Stack y={150}><Line t={t} a={sh('signal').a + 0.05} text="un esame" size={74} /></Stack>
    <Stack y={250}><Line t={t} a={K.stima - 0.2} text="che stima" size={100} box="grad" /></Stack>
  </Clip>
);

// composizione corporea: massa grassa + massa magra, e dentro la magra muscoli e acqua
const ShComp: React.FC<{t: number}> = ({t}) => {
  const a = sh('comp').a;
  const cx = 540, cy = 760, R = 270;
  const g = eIO(prog(t, K.grassa - 0.25, K.grassa + 0.5));
  const m = eIO(prog(t, K.magra - 0.25, K.magra + 0.5));
  const inner = eO3(prog(t, K.muscoli1 - 0.2, K.muscoli1 + 0.5));
  const wat = eO3(prog(t, K.acqua - 0.2, K.acqua + 0.5));
  const spin = (t - a) * 6;
  const C = 2 * Math.PI * R, Ci = 2 * Math.PI * (R - 95);
  const FAT = 0.3; // proporzione solo grafica, nessun valore
  return (
    <>
      <Navy t={t} />
      <Stack y={140}><Line t={t} a={a + 0.02} text="composizione corporea" size={58} box="white" /></Stack>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g transform={`rotate(${-90 + spin} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={70} />
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={YEL} strokeWidth={70} strokeDasharray={`${C * FAT * g} ${C}`} style={{filter: `drop-shadow(0 0 16px ${YEL})`}} />
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={GREEN} strokeWidth={70} strokeDasharray={`${C * (1 - FAT) * m} ${C}`} strokeDashoffset={-C * FAT - 6} style={{filter: `drop-shadow(0 0 16px ${GREEN})`}} />
          {/* anello interno: dentro la massa magra */}
          <circle cx={cx} cy={cy} r={R - 95} fill="none" stroke={LIME_HI} strokeWidth={34} strokeDasharray={`${Ci * (1 - FAT) * 0.48 * inner} ${Ci}`} strokeDashoffset={-Ci * FAT - 6} opacity={0.95} />
          <circle cx={cx} cy={cy} r={R - 95} fill="none" stroke={CYAN_HI} strokeWidth={34} strokeDasharray={`${Ci * (1 - FAT) * 0.5 * wat} ${Ci}`} strokeDashoffset={-Ci * FAT - Ci * (1 - FAT) * 0.5 - 6} opacity={0.95} />
        </g>
        <circle cx={cx} cy={cy} r={R - 140} fill={NAVY} opacity={0.6} />
      </svg>
      <div style={{position: 'absolute', left: cx - 120, top: cy - 120, width: 240, height: 240, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${spring(prog(t, a + 0.2, a + 0.8) * 1.8)})`}}>
        <Icon name="walk" c={WHITE} s={130} />
      </div>
      <Stack y={1080} gap={14} x={60} right={60} align="flex-start">
        <Chip t={t} a={K.grassa - 0.25} text="massa grassa" icon="drop" size={38} />
        <Chip t={t} a={K.magra - 0.25} text="massa magra" icon="bolt" size={38} hi />
        <div style={{display: 'flex', gap: 14, marginLeft: 70, alignItems: 'center'}}>
          <div style={{width: 30, height: 70, borderLeft: `5px solid ${LIME_HI}`, borderBottom: `5px solid ${LIME_HI}`, borderBottomLeftRadius: 14, opacity: inner, marginTop: -40}} />
          <Chip t={t} a={K.muscoli1 - 0.2} text="muscoli" icon="walk" size={32} />
          <Chip t={t} a={K.acqua - 0.2} text="acqua" icon="drop" size={32} />
        </div>
      </Stack>
      <Corner dark />
    </>
  );
};

const ShNotOnly: React.FC<{t: number}> = ({t}) => {
  const a = sh('notonly').a;
  const strike = eO3(prog(t, K.dimagrire + 0.15, K.dimagrire + 0.55));
  return (
    <>
      <Sky t={t} />
      <Stack y={560}>
        <Line t={t} a={a + 0.02} text="non serve solo" size={84} />
        <div style={{position: 'relative'}}>
          <Line t={t} a={K.dimagrire - 0.2} text="per dimagrire" size={104} box="white" />
          <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 14, background: HOT, borderRadius: 9, transformOrigin: 'left', transform: `scaleX(${strike}) rotate(-3deg)`}} />
        </div>
      </Stack>
      <Corner />
    </>
  );
};

const ShMuscle: React.FC<{t: number}> = ({t}) => (
  <Clip name="muscle" t={t} dz={0.02}>
    <T3 t={t} a={K.muscoli2 - 0.3} text="MUSCOLI" y={140} h={360} size={1.25} />
    <Stack y={1200}><Chip t={t} a={K.allenarti - 0.25} text="ti aiutano ad allenarti" icon="bolt" size={40} /></Stack>
  </Clip>
);

const ShWalk: React.FC<{t: number}> = ({t}) => (
  <Clip name="walk" t={t} z0={1.0} dz={0.01} y={230}>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,18,31,0.95) 0%, rgba(4,18,31,0.6) 26%, rgba(4,18,31,0) 40%)'}} />
    <Stack y={150} gap={14}>
      <Chip t={t} a={K.muoverti - 0.3} text="movimento" icon="walk" size={42} />
      <Chip t={t} a={K.muoverti + 0.15} text="forza" icon="bolt" size={42} from="right" />
    </Stack>
    <T3 t={t} a={K.autonomia - 0.25} text="AUTONOMIA" y={330} h={300} size={0.95} mode="cyan" />
    <Stack y={1180}><Line t={t} a={K.anni - 0.15} text="negli anni" size={70} box="grad" /></Stack>
  </Clip>
);

const ShWater: React.FC<{t: number}> = ({t}) => (
  <Clip name="water" t={t} dz={0.025} dark={false}>
    <Stack y={170}>
      <Line t={t} a={sh('water').a + 0.1} text="informazioni" size={66} />
      <Line t={t} a={K.idratazione - 0.2} text="idratazione" size={118} box="white" />
    </Stack>
  </Clip>
);

// stesse condizioni → confronto nel tempo (nessun valore inventato: solo punti di controllo)
const ShTime: React.FC<{t: number}> = ({t}) => {
  const a = sh('time').a;
  const line = eIO(prog(t, K.cambiamenti - 0.3, K.tempo + 0.4));
  const pts = [0.08, 0.5, 0.92];
  const x0 = 110, x1 = 970, y = 900;
  const yy = (u: number) => y - Math.sin(u * Math.PI * 1.3 + 0.4) * 60;
  let d = '';
  for (let i = 0; i <= 60; i++) {
    const u = (i / 60) * line;
    d += `${i ? 'L' : 'M'} ${lerp(x0, x1, u)} ${yy(u)} `;
  }
  return (
    <>
      <Navy t={t} hue={LIME} />
      <Stack y={240}><Chip t={t} a={K.condizioni - 0.3} text="in condizioni simili" icon="check" size={42} /></Stack>
      <Stack y={420}>
        <Line t={t} a={K.cambiamenti - 0.3} text="i cambiamenti" size={86} />
        <Line t={t} a={K.tempo - 0.25} text="nel tempo" size={120} box="grad" />
      </Stack>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <line x1={x0} y1={y + 150} x2={x1} y2={y + 150} stroke="rgba(255,255,255,0.25)" strokeWidth={4} />
        <path d={d} fill="none" stroke={CYAN_HI} strokeWidth={10} strokeLinecap="round" style={{filter: `drop-shadow(0 0 14px ${CYAN_HI})`}} />
        {pts.map((u, i) => {
          const v = spring(prog(t, a + 0.4 + i * 0.35, a + 1.0 + i * 0.35) * 1.8) * (line >= u ? 1 : 0.35);
          return (
            <g key={i} transform={`translate(${lerp(x0, x1, u)} ${yy(u)}) scale(${v})`}>
              <circle r={34} fill={NAVY} stroke={[YEL, LIME, CYAN_HI][i]} strokeWidth={8} />
              <circle r={12} fill={[YEL, LIME, CYAN_HI][i]} />
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: x0 - 60, right: W - x1 - 60, top: y + 170, display: 'flex', justifyContent: 'space-between', opacity: prog(t, a + 0.8, a + 1.4)}}>
        {['1° controllo', '2° controllo', '3° controllo'].map((s) => (
          <div key={s} style={{width: 220, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 30, color: WHITE, opacity: 0.85}}>{s}</div>
        ))}
      </div>
      <Corner dark />
    </>
  );
};

const ShScan: React.FC<{t: number}> = ({t}) => (
  <Clip name="scan" t={t} dz={0.02}>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,18,31,0) 50%, rgba(4,18,31,0.7) 78%)'}} />
    <ScanText t={t} a={K.interpretati - 0.3} text="dati da interpretare" y={1060} size={70} c={CYAN_HI} />
    <ScanText t={t} a={K.percorso - 0.3} text="nel tuo percorso" y={1150} size={84} />
  </Clip>
);

const ShService: React.FC<{t: number}> = ({t}) => {
  const a = sh('service').a;
  return (
    <>
      <Sky t={t} />
      <div style={{position: 'absolute', left: 0, top: 180, width: W, height: 420}}>
        <Logo3D lt={t - a} w={W} h={420} />
      </div>
      <Stack y={620}>
        <Line t={t} a={a + 0.1} text="nella nostra" size={70} />
        <Line t={t} a={K.farmacia - 0.15} text="farmacia" size={130} box="white" />
      </Stack>
      <Stack y={1010} gap={16}>
        <Chip t={t} a={K.semplice - 0.2} text="semplice" icon="check" size={44} />
        <Chip t={t} a={K.invasivo - 0.3} text="non invasiva" icon="shield" size={44} hi from="right" />
      </Stack>
      <Corner />
    </>
  );
};

const ShBubble: React.FC<{t: number}> = ({t}) => (
  <Clip name="bubble" t={t} dz={0.015} dark={false}>
    <Stack y={160}>
      <Line t={t} a={sh('bubble').a + 0.1} text="ti spieghiamo" size={92} box="white" />
      <Line t={t} a={K.calma - 0.2} text="con calma" size={110} box="grad" />
    </Stack>
    <Stack y={1230}><Chip t={t} a={K.risultati - 0.5} text="cosa indicano i risultati" icon="eye" size={38} /></Stack>
  </Clip>
);

const ShAsk: React.FC<{t: number}> = ({t}) => {
  const a = sh('ask').a;
  return (
    <>
      <Navy t={t} hue={LIME} />
      <Stack y={260}><Line t={t} a={a + 0.02} text="vuoi capire se" size={70} /></Stack>
      <Stack y={370}><Line t={t} a={a + 0.3} text="può esserti utile" size={84} box="white" /></Stack>
      <T3 t={t} a={K.utile - 0.2} text="?" y={560} h={640} size={3.6} spin={-1} />
      <Corner dark />
    </>
  );
};

const ShSteps: React.FC<{t: number}> = ({t}) => {
  const a = sh('steps').a;
  return (
    <>
      <Sky t={t} />
      <Stack y={170}>
        <Line t={t} a={a + 0.02} text="vieni a parlarne" size={84} />
        <Line t={t} a={a + 0.4} text="con noi" size={110} box="white" />
      </Stack>
      <Step t={t} a={K.ascoltiamo - 0.15} n={1} text="ascoltiamo le tue esigenze" icon="hand" y={560} />
      <Step t={t} a={K.spieghiamo - 0.3} n={2} text="ti spieghiamo come prepararti" icon="list" y={820} />
      <Step t={t} a={K.prenotiamo - 0.3} n={3} text="prenotiamo insieme" icon="calendar" y={1080} />
      <Corner />
    </>
  );
};

const ShEnd: React.FC<{t: number}> = ({t}) => {
  const a = sh('end').a;
  const lt = t - a;
  const wv = eO5(prog(lt, 0.45, 0.95)), pay = eO5(prog(lt, 0.75, 1.25)), inf = eO5(prog(lt, 1.0, 1.5)), dis = prog(lt, 1.5, 1.9);
  return (
    <>
      <Sky t={t} />
      <div style={{position: 'absolute', left: 0, top: 120, width: W, height: 520}}>
        <Logo3D lt={lt} w={W} h={520} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
        <Img src={staticFile('logo/wordmark_w.png')} style={{width: 700, opacity: wv, transform: `translateY(${(1 - wv) * 40}px)`, filter: 'drop-shadow(0 8px 20px rgba(0,40,70,0.35))'}} />
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 42, color: NAVY, background: WHITE, padding: '12px 30px', borderRadius: 999, opacity: pay, transform: `translateY(${(1 - pay) * 30}px)`, boxShadow: '0 12px 30px rgba(0,30,60,0.25)'}}>
          Le persone di sempre. <span style={{color: BLUE}}>I servizi di oggi.</span>
        </div>
      </div>
      <Stack y={960}><Line t={t} a={a + 0.9} text="chiedici consiglio e prenota" size={56} box="grad" /></Stack>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1110, display: 'flex', flexDirection: 'column', gap: 18, opacity: inf, transform: `translateY(${(1 - inf) * 40}px)`}}>
        {[['pin', 'Piazza Plebiscito 1 · Picerno (PZ)'], ['phone', 'Tel. e WhatsApp 0971 991434']].map(([ic, tx]) => (
          <div key={tx} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 28px 14px 14px', borderRadius: 999, background: 'rgba(4,18,31,0.82)', fontFamily: MONT, fontWeight: 800, fontSize: 42, color: WHITE}}>
            <div style={{width: 66, height: 66, borderRadius: 99, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={ic} c={NAVY} s={40} /></div>
            {tx}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1420, fontFamily: MONT, fontWeight: 700, fontSize: 30, lineHeight: 1.3, color: WHITE, opacity: dis, textShadow: '0 2px 10px rgba(0,30,60,0.5)', textAlign: 'center'}}>
        La bioimpedenziometria fornisce stime da interpretare con il professionista: non è una diagnosi.
      </div>
    </>
  );
};

const RENDER: Record<string, React.FC<{t: number}>> = {
  body: ShBody, weight: ShWeight, bia3d: ShBia3d, signal: ShSignal, comp: ShComp, notonly: ShNotOnly, muscle: ShMuscle, walk: ShWalk,
  water: ShWater, time: ShTime, scan: ShScan, service: ShService, bubble: ShBubble, ask: ShAsk, steps: ShSteps, end: ShEnd,
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
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <AbsoluteFill style={{transform: `scale(${hook})`}}>{view}</AbsoluteFill>
      {t < sE(5) + 0.2 && <Subs t={t} />}
      {t < 0.25 && <AbsoluteFill style={{background: WHITE, opacity: 1 - prog(t, 0, 0.25)}} />}
    </AbsoluteFill>
  );
};

export {DURATION};
