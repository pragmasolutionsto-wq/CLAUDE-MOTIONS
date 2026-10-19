import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {Collagen, LED_COLS, LED_ROWS, LedPanel, Logo3D, OfferCoins, UnikaTitle, ledOn} from './three';
import {
  BLUE, BLUE_D, CORAL, DURATION, FPS, GOLD, H, ICE, INK, NAVY, SPEECH_END, TEAL, TEAL_HI, W, WHITE, clamp, cue, eBack,
  eIO, eO3, eO5, lerp, life, prog, rnd, segEnd, segOf, segT, SEG_START, spring,
} from './util';

const MONT = "'Montserrat', 'Helvetica Neue', sans-serif";

/* ------------------------------------------------------------------ finestre a schermo pieno (3D) */

const TAKE = {
  collagen: [segT(1), segEnd(1)],
  led: [segT(10), segEnd(10)],
  offer: [segT(15), segEnd(15)],
  end: [SPEECH_END, DURATION],
} as const;
const inTake = (t: number) => Object.values(TAKE).some(([a, b]) => t >= a && t < b);

/* ------------------------------------------------------------------ video base con punch-in */

// zoom per segmento: alterna i piani per nascondere i jump cut
const ZOOM = [1.0, 1.0, 1.12, 1.0, 1.1, 1.15, 1.0, 1.08, 1.0, 1.12, 1.0, 1.1, 1.0, 1.1, 1.06, 1.0, 1.0, 1.12];
// inquadratura abbassata (scala dall'alto) per liberare la fascia titoli sopra la testa
const DROP = 1.12;
const FACE: [number, number] = [548, 640];

const Base: React.FC<{t: number}> = ({t}) => {
  const k = segOf(t);
  const lt = t - SEG_START[k];
  let z = ZOOM[k] * (1 + 0.018 * lt);
  if (k === 0) z *= lerp(1.38, 1, eO5(prog(t, 0, 0.45)));
  if (k === 5) z = lerp(1.08, 1.15, eO3(prog(lt, 0, 0.5))) * (1 + 0.01 * lt);
  // micro shake sugli accenti
  const sh = (a: number) => Math.exp(-Math.max(0, t - a) * 14) * (t >= a ? 1 : 0);
  const acc = ['tu', 'unika', 'n192', 'omaggio', 'gratuita'] as const;
  const s = acc.reduce((m, n) => m + sh(cue(n)), 0) * 9;
  const jx = Math.sin(t * 91) * s, jy = Math.cos(t * 77) * s;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: INK}}>
      <div style={{position: 'absolute', width: W, height: H, transformOrigin: `${W / 2}px 0px`, transform: `scale(${DROP})`}}>
      <OffthreadVideo
        src={staticFile('base.mp4')}
        muted
        style={{width: W, height: H, transformOrigin: `${FACE[0]}px ${FACE[1]}px`, transform: `translate(${jx}px, ${jy}px) scale(${z})`}}
      />
      </div>
    </AbsoluteFill>
  );
};

const Pip: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
  const v = life(t, a + 0.25, b, 0.35, 0.15);
  if (v <= 0) return null;
  const D = 250, sc = 0.62;
  return (
    <div style={{position: 'absolute', left: 64, top: 1240, width: D, height: D, borderRadius: D, overflow: 'hidden', border: `7px solid ${WHITE}`, boxShadow: '0 18px 50px rgba(0,0,0,0.35)', transform: `scale(${eBack(v)})`, opacity: clamp(v * 2)}}>
      <OffthreadVideo src={staticFile('base.mp4')} muted style={{position: 'absolute', width: W * sc, height: H * sc, left: D / 2 - FACE[0] * sc, top: D / 2 - (FACE[1] - 30) * sc}} />
    </div>
  );
};

/* ------------------------------------------------------------------ tipografia */

type Ln = {text: string; bg?: string; fg?: string; size?: number};

// righe in box colorati che entrano a molla
const Headline: React.FC<{t: number; a: number; b: number; lines: Ln[]; y: number; stag?: number; align?: 'center' | 'left'}> = ({t, a, b, lines, y, stag = 0.12, align = 'center'}) => {
  const out = prog(t, b - 0.18, b);
  if (t < a || t > b) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', paddingLeft: align === 'left' ? 70 : 0, gap: 14}}>
      {lines.map((l, i) => {
        const p = prog(t, a + i * stag, a + i * stag + 0.55);
        const s = spring(p * 1.6, 9, 5.5);
        return (
          <div key={i} style={{
            fontFamily: MONT, fontWeight: 900, fontSize: l.size ?? 74, lineHeight: 1, letterSpacing: '-0.01em', textTransform: 'uppercase',
            color: l.fg ?? WHITE, background: l.bg ?? BLUE, padding: '16px 28px 18px', borderRadius: 18,
            boxShadow: '0 14px 40px rgba(6,24,38,0.28)', transformOrigin: '50% 100%',
            transform: `translateY(${(1 - s) * 50 - out * 30}px) scale(${lerp(0.6, 1, s) * (1 - out * 0.1)}) rotate(${(1 - s) * (i % 2 ? 4 : -4)}deg)`,
            opacity: clamp(p * 4) * (1 - out),
          }}>
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

const Icon: React.FC<{name: string; c: string; s?: number}> = ({name, c, s = 46}) => {
  const st = {fill: 'none', stroke: c, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const paths: Record<string, React.ReactNode> = {
    arm: <path {...st} d="M6 18c3-1 5-4 6-8l2-5 3 1-1 6c3 0 5 2 5 5v3H6z" />,
    belly: <><path {...st} d="M8 3c-1 5-2 9 0 13s1 5 0 5M16 3c1 5 2 9 0 13s-1 5 0 5" /><circle cx="12" cy="12" r="1" fill={c} /></>,
    leg: <path {...st} d="M9 3h6l-1 9 1 9h-3l-1-8-1 8H7l1-9z" />,
    thermo: <><path {...st} d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z" /><path {...st} d="M18 4l2 2M20 4l-2 2M4 8h2M5 7v2" /></>,
    led: <><circle {...st} cx="12" cy="10" r="5" /><path {...st} d="M10 18h4M10 21h4M12 1v2M4 4l1.5 1.5M20 4l-1.5 1.5M2 10h2M20 10h2" /></>,
    bolt: <path {...st} d="M13 2L4 14h7l-1 8 9-12h-7z" />,
    phone: <path {...st} d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2z" />,
    chat: <path {...st} d="M4 5h16v11H9l-5 4z" />,
    pin: <><path {...st} d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" /><circle {...st} cx="12" cy="10" r="2.5" /></>,
    up: <path {...st} d="M12 20V5M6 11l6-6 6 6" />,
    down: <path {...st} d="M12 4v15M6 13l6 6 6-6" />,
    check: <path {...st} d="M5 12l5 5 9-10" />,
    cal: <><rect {...st} x="3" y="5" width="18" height="16" rx="3" /><path {...st} d="M3 10h18M8 3v4M16 3v4" /></>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24">{paths[name]}</svg>;
};

// pill con icona che entra da destra
const Pill: React.FC<{t: number; a: number; b: number; text: string; icon: string; x: number; y: number; bg?: string; fg?: string; size?: number; from?: 1 | -1}> = ({t, a, b, text, icon, x, y, bg = WHITE, fg = BLUE, size = 44, from = 1}) => {
  if (t < a || t > b) return null;
  const p = prog(t, a, a + 0.5);
  const s = spring(p * 1.5, 9, 5);
  const out = eO3(prog(t, b - 0.2, b));
  return (
    <div style={{
      position: 'absolute', ...(x < 0 ? {right: -x} : {left: x}), top: y, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px 16px 18px', borderRadius: 999,
      background: bg, boxShadow: '0 14px 36px rgba(6,24,38,0.3)', fontFamily: MONT, fontWeight: 900, fontSize: size, color: fg, textTransform: 'uppercase',
      transform: `translateX(${(1 - s) * 420 * from + out * 300 * from}px) scale(${lerp(0.7, 1, s)})`, opacity: clamp(p * 5) * (1 - out), whiteSpace: 'nowrap',
    }}>
      <div style={{width: size * 1.45, height: size * 1.45, borderRadius: 999, background: fg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={icon} c={bg} s={size * 0.95} />
      </div>
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ pezzi grafici */

const Badge: React.FC<{t: number}> = ({t}) => {
  const v = eO3(prog(t, 0.3, 0.8)) * (1 - prog(t, SPEECH_END - 0.3, SPEECH_END));
  const hide = inTake(t) ? 0 : 1;
  return (
    <div style={{position: 'absolute', left: 44, top: 70, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px 12px 14px', background: 'rgba(255,255,255,0.94)', borderRadius: 999, boxShadow: '0 10px 30px rgba(6,24,38,0.18)', opacity: v * hide, transform: `translateX(${(1 - v) * -60}px)`}}>
      <Img src={staticFile('logo/mark.png')} style={{width: 54, height: 57}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <Img src={staticFile('logo/farmacia.png')} style={{width: 168, height: 25}} />
        <Img src={staticFile('logo/dottssa.png')} style={{width: 168, height: 13}} />
      </div>
    </div>
  );
};

const Flash: React.FC<{t: number; at: number; c?: string; d?: number}> = ({t, at, c = WHITE, d = 0.22}) => {
  const p = prog(t, at - 0.04, at + d);
  if (p <= 0 || p >= 1) return null;
  return <AbsoluteFill style={{background: c, opacity: (1 - p) * 0.85, mixBlendMode: 'screen'}} />;
};

// tendina diagonale che apre/chiude le finestre 3D
const Wipe: React.FC<{t: number; at: number; c: string; dir?: 1 | -1}> = ({t, at, c, dir = 1}) => {
  const p = prog(t, at - 0.18, at + 0.22);
  if (p <= 0 || p >= 1) return null;
  const x = lerp(-1.4, 1.4, eIO(p)) * W * dir;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x - W * 0.2, top: -400, width: W * 1.4, height: H + 800, background: c, transform: 'rotate(14deg)', boxShadow: `0 0 120px ${TEAL_HI}`}} />
      <div style={{position: 'absolute', left: x - W * 0.3, top: -400, width: 40, height: H + 800, background: TEAL_HI, transform: 'rotate(14deg)'}} />
    </AbsoluteFill>
  );
};

const Streaks: React.FC<{t: number; at: number; seed: number; c?: string}> = ({t, at, seed, c = WHITE}) => {
  const r = rnd(seed);
  const items = [];
  for (let i = 0; i < 9; i++) {
    const y = r() * H, len = 300 + r() * 600, d = r() * 0.12, th = 3 + r() * 5;
    const p = prog(t, at + d, at + d + 0.4);
    if (p <= 0 || p >= 1) continue;
    items.push(<div key={i} style={{position: 'absolute', left: lerp(-len, W + len, eO3(p)) - len / 2, top: y, width: len, height: th, borderRadius: th, background: `linear-gradient(90deg, transparent, ${c}, transparent)`, opacity: 0.8 * (1 - p)}} />);
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

const Burst: React.FC<{t: number; at: number; x: number; y: number; seed?: number; n?: number; cols?: string[]}> = ({t, at, x, y, seed = 3, n = 46, cols = [GOLD, TEAL, BLUE, WHITE]}) => {
  const lt = t - at;
  if (lt < 0 || lt > 1.8) return null;
  const r = rnd(seed);
  return (
    <AbsoluteFill>
      {Array.from({length: n}, (_, i) => {
        const a = r() * Math.PI * 2, v = 500 + r() * 900, s = 12 + r() * 18, rot = r() * 720, c = cols[i % cols.length];
        const px = x + Math.cos(a) * v * eO3(clamp(lt / 1.2)), py = y + Math.sin(a) * v * eO3(clamp(lt / 1.2)) + 600 * lt * lt;
        return <div key={i} style={{position: 'absolute', left: px, top: py, width: s, height: s * 0.5, background: c, borderRadius: 3, transform: `rotate(${rot * lt}deg)`, opacity: 1 - prog(lt, 1.1, 1.8)}} />;
      })}
    </AbsoluteFill>
  );
};

// "come ti vedono gli altri" barrato
const Strike: React.FC<{t: number; a: number; at: number; b: number}> = ({t, a, at, b}) => {
  if (t < a || t > b) return null;
  const p = prog(t, a, a + 0.5), s = spring(p * 1.6, 9, 5.5);
  const sp = eO3(prog(t, at, at + 0.3));
  const dim = lerp(1, 0.75, sp);
  const out = prog(t, b - 0.2, b);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 175, display: 'flex', justifyContent: 'center', opacity: (1 - out) * clamp(p * 4)}}>
      <div style={{position: 'relative', transform: `scale(${lerp(0.6, 1, s) * dim}) translateY(${(1 - s) * 40 - sp * 30}px)`}}>
        <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 60, textTransform: 'uppercase', color: WHITE, background: sp > 0 ? '#5d6f7c' : BLUE, padding: '14px 26px', borderRadius: 18}}>
          come ti vedono gli altri
        </div>
        <div style={{position: 'absolute', left: -14, top: '50%', height: 12, width: `calc(${sp * 100}% + 28px)`, background: CORAL, borderRadius: 8, transform: 'rotate(-3deg)', boxShadow: '0 4px 14px rgba(0,0,0,0.3)'}} />
      </div>
    </div>
  );
};

const Glow: React.FC<{x: number; y: number; r: number; c: string; o?: number}> = ({x, y, r, c, o = 0.5}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: `radial-gradient(circle, ${c} 0%, transparent 68%)`, opacity: o}} />
);

// onda quadra che si disegna
const SquareWave: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
  if (t < a || t > b) return null;
  const v = life(t, a, b, 0.3, 0.25);
  const p = eIO(prog(t, a + 0.05, a + 1.6));
  const w = 900, h = 120, per = 150;
  let d = `M 0 ${h}`;
  for (let x = 0; x < w; x += per) d += ` L ${x} ${h} L ${x} 0 L ${x + per / 2} 0 L ${x + per / 2} ${h} L ${x + per} ${h}`;
  const len = (w / per) * (per + 2 * h);
  const scroll = (t - a) * 160;
  return (
    <div style={{position: 'absolute', left: 90, top: 960, width: w, height: h + 40, opacity: v, transform: `translateY(${(1 - eO3(clamp(v * 2))) * 40}px)`}}>
      <div style={{position: 'absolute', inset: -30, background: 'rgba(6,24,38,0.55)', borderRadius: 28, backdropFilter: 'blur(6px)'}} />
      <svg width={w} height={h + 40} viewBox={`0 -20 ${w} ${h + 40}`} style={{position: 'absolute', overflow: 'hidden'}}>
        <g transform={`translate(${-(scroll % per)} 0)`}>
          <path d={d + ` L ${w + per} ${h}`} fill="none" stroke={TEAL_HI} strokeWidth={9} strokeLinejoin="round" strokeDasharray={len + per * 3} strokeDashoffset={(1 - p) * (len + per * 3)} style={{filter: `drop-shadow(0 0 10px ${TEAL_HI})`}} />
        </g>
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ finestre 3D */

const Window: React.FC<{t: number; a: number; b: number; bg: string; children: (lt: number) => React.ReactNode}> = ({t, a, b, bg, children}) => {
  if (t < a - 0.02 || t >= b) return null;
  return <AbsoluteFill style={{background: bg}}>{children(t - a)}</AbsoluteFill>;
};

const BigText: React.FC<{lt: number; a: number; text: string; size: number; y: number; c?: string; sub?: string; subC?: string; b?: number}> = ({lt, a, text, size, y, c = NAVY, sub, subC = TEAL, b = 99}) => {
  const p = prog(lt, a, a + 0.6), s = spring(p * 1.5, 8, 5);
  const out = prog(lt, b - 0.2, b);
  if (lt < a) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: MONT, transform: `translateY(${(1 - s) * 60}px) scale(${lerp(0.7, 1, s)})`, opacity: clamp(p * 4) * (1 - out)}}>
      <div style={{fontWeight: 900, fontSize: size, lineHeight: 0.95, color: c, letterSpacing: '-0.02em', textTransform: 'uppercase'}}>{text}</div>
      {sub && <div style={{fontWeight: 800, fontSize: size * 0.32, letterSpacing: '0.16em', color: subC, marginTop: 14, textTransform: 'uppercase'}}>{sub}</div>}
    </div>
  );
};

const CollagenWin: React.FC<{lt: number}> = ({lt}) => {
  const a = TAKE.collagen[0];
  const c1 = cue('collagene') - a, c2 = cue('elastina') - a, br = cue('riducono') - a;
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, #ffffff 0%, ${ICE} 55%, #cfe6ea 100%)`}} />
      <Glow x={540} y={900} r={700} c={TEAL_HI} o={0.35} />
      <Collagen lt={lt} brk={br - 0.25} w={W} h={H} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        {[{l: 'collagene', at: c1, c: TEAL}, {l: 'elastina', at: c2, c: BLUE}].map((k, i) => {
          const p = prog(lt, k.at - 0.1, k.at + 0.4), s = spring(p * 1.5, 9, 5);
          const dn = eO3(prog(lt, br - 0.1 + i * 0.12, br + 0.3 + i * 0.12));
          if (lt < k.at - 0.1) return null;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: MONT, fontWeight: 900, fontSize: 80, textTransform: 'uppercase', color: WHITE, background: k.c, padding: '14px 34px 14px 26px', borderRadius: 22, boxShadow: '0 16px 40px rgba(6,24,38,0.25)', transform: `scale(${lerp(0.6, 1, s)}) translateY(${(1 - s) * 40}px)`, opacity: clamp(p * 4)}}>
              {k.l}
              <div style={{width: 74, height: 74, borderRadius: 99, background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${eBack(dn)})`}}>
                <Icon name="down" c={WHITE} s={54} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const LedWin: React.FC<{lt: number}> = ({lt}) => {
  let on = 0;
  for (let i = 0; i < LED_COLS * LED_ROWS; i++) on += ledOn(lt, i) >= 0.5 ? 1 : 0;
  const v = eO3(prog(lt, 0.15, 0.5));
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 55%, #0f3b55 0%, ${NAVY} 45%, ${INK} 100%)`}} />
      <Glow x={540} y={1050} r={800} c={TEAL} o={0.25 + 0.25 * (on / 192)} />
      <LedPanel lt={lt} w={W} h={H} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: MONT, opacity: v, transform: `translateY(${(1 - v) * 50}px)`}}>
        <div style={{fontWeight: 900, fontSize: 250, lineHeight: 0.9, color: WHITE, letterSpacing: '-0.03em', textShadow: `0 0 40px ${TEAL}`}}>{on}</div>
        <div style={{fontWeight: 900, fontSize: 70, letterSpacing: '0.3em', color: TEAL_HI, marginTop: 6}}>LED</div>
      </div>
      <BigText lt={lt} a={1.6} text="ad alta potenza" size={58} y={1560} c={WHITE} />
    </>
  );
};

const OfferWin: React.FC<{lt: number}> = ({lt}) => {
  const a = TAKE.offer[0];
  const om = cue('omaggio') - a;
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 48%, ${TEAL} 0%, ${BLUE} 55%, ${BLUE_D} 100%)`}} />
      <Glow x={540} y={980} r={620} c={om < lt ? GOLD : TEAL_HI} o={0.35 + 0.3 * prog(lt, om, om + 0.4)} />
      <OfferCoins lt={lt} flipAt={om} w={W} h={H} />
      <BigText lt={lt} a={0.25} text="5 trattamenti" size={104} y={230} c={WHITE} sub="percorso unika" subC={'#bff3ef'} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1480, display: 'flex', justifyContent: 'center'}}>
        {lt > om - 0.05 && (() => {
          const p = prog(lt, om - 0.05, om + 0.5), s = spring(p * 1.5, 8, 4.5);
          return (
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 82, textTransform: 'uppercase', color: '#4a3208', background: GOLD, padding: '18px 36px', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.3)', transform: `scale(${lerp(0.4, 1, s)}) rotate(${(1 - s) * -8}deg)`, textAlign: 'center', lineHeight: 1}}>
              1 seduta<br />in omaggio
            </div>
          );
        })()}
      </div>
      <Burst t={lt} at={om + 0.15} x={540} y={960} seed={8} n={60} />
    </>
  );
};

const EndWin: React.FC<{lt: number}> = ({lt}) => {
  const w1 = eO5(prog(lt, 0.55, 1.05)), w2 = eO5(prog(lt, 0.7, 1.2));
  const cta = spring(prog(lt, 0.95, 1.6) * 1.5, 8, 4.5);
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #ffffff 0%, ${ICE} 60%, #d4eaee 100%)`}} />
      <Glow x={540} y={640} r={520} c={TEAL_HI} o={0.45} />
      <div style={{position: 'absolute', left: 0, top: 280, width: W, height: 760}}>
        <Logo3D lt={lt} w={W} h={760} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        <Img src={staticFile('logo/farmacia.png')} style={{width: 720, height: 108, opacity: w1, transform: `translateY(${(1 - w1) * 40}px)`}} />
        <Img src={staticFile('logo/dottssa.png')} style={{width: 560, height: 44, opacity: w2, transform: `translateY(${(1 - w2) * 40}px)`}} />
        <div style={{marginTop: 50, fontFamily: MONT, fontWeight: 900, fontSize: 40, whiteSpace: 'nowrap', textTransform: 'uppercase', color: WHITE, background: BLUE, padding: '22px 40px', borderRadius: 999, boxShadow: '0 18px 44px rgba(19,131,181,0.4)', transform: `scale(${lerp(0.5, 1, cta)})`, opacity: clamp(cta * 3)}}>
          Prenota la consulenza gratuita
        </div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ montaggio */

export const Movie: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const C = cue;
  const L = (k: number) => [segT(k), segEnd(k)] as const;
  const unikaV = life(t, C('unika') - 0.1, segEnd(9), 0.2, 0.25);

  return (
    <AbsoluteFill style={{background: INK}}>
      <Base t={t} />

      {/* hook */}
      <Headline t={t} a={0.12} b={segEnd(0)} y={175} lines={[{text: 'Dopo i 50 anni', size: 76}]} />
      <Headline t={t} a={1.55} b={segEnd(0)} y={285} lines={[{text: 'la pelle cede?', bg: TEAL, size: 76}]} />
      <Pill t={t} a={C('braccia') - 0.08} b={segEnd(0)} text="braccia" icon="arm" x={-40} y={920} />
      <Pill t={t} a={C('addome') - 0.08} b={segEnd(0)} text="addome" icon="belly" x={-40} y={1030} />
      <Pill t={t} a={C('cosce') - 0.08} b={segEnd(0)} text="cosce" icon="leg" x={-40} y={1140} />

      {/* perde sostegno */}
      <Headline t={t} a={segT(2) + 0.25} b={segEnd(2)} y={175} lines={[{text: '− sostegno', size: 64}, {text: '− elasticità', bg: TEAL, size: 64}]} />

      {/* empatia */}
      <Headline t={t} a={C('donne') - 0.15} b={segEnd(3)} y={190} lines={[{text: 'Non sei la sola', bg: WHITE, fg: BLUE, size: 70}]} />
      <Strike t={t} a={C('altri')} at={C('tu')} b={segEnd(5)} />
      <Headline t={t} a={C('tu') + 0.02} b={segEnd(5)} y={280} lines={[{text: 'come ti senti tu', bg: TEAL, size: 76}]} />
      <Flash t={t} at={C('tu')} c={TEAL_HI} d={0.3} />

      {/* UNIKA */}
      {unikaV > 0 && (
        <div style={{position: 'absolute', left: 0, top: 20, width: W, height: 360, opacity: unikaV}}>
          <UnikaTitle lt={t - C('unika') + 0.1} w={W} h={420} />
        </div>
      )}
      <Flash t={t} at={C('unika')} d={0.25} />
      <Headline t={t} a={C('innovativa')} b={segEnd(8)} y={335} lines={[{text: 'tecnologia innovativa', bg: WHITE, fg: BLUE, size: 42}]} />
      <Pill t={t} a={C('shock') - 0.1} b={segEnd(8)} text="shock termico" icon="thermo" x={-40} y={930} size={40} />
      <Pill t={t} a={C('led') - 0.1} b={segEnd(8)} text="LED alta potenza" icon="led" x={-40} y={1035} size={40} />
      <Pill t={t} a={C('elettro') - 0.1} b={segEnd(8)} text="elettrostimolazione" icon="bolt" x={-40} y={1140} size={40} />
      <Headline t={t} a={C('seduta') + 0.1} b={segEnd(9)} y={335} lines={[{text: 'risultati dalla 1ª seduta', bg: TEAL, size: 42}]} />

      {/* dopo i LED */}
      <Pill t={t} a={C('flusso') - 0.1} b={segEnd(11)} text="flusso sanguigno" icon="up" x={70} y={175} bg={BLUE} fg={WHITE} from={-1} />
      <Pill t={t} a={C('collagene2') - 0.1} b={segEnd(11)} text="collagene" icon="up" x={70} y={285} bg={TEAL} fg={WHITE} from={-1} />

      {/* onda quadra */}
      <SquareWave t={t} a={C('onda') - 0.05} b={C('tensore') - 0.1} />
      <Headline t={t} a={C('onda') + 0.1} b={C('tensore') - 0.1} y={190} lines={[{text: 'onda quadra', size: 64}]} />
      <Headline t={t} a={C('tensore')} b={segEnd(12)} y={175} lines={[{text: 'tonifica', bg: TEAL, size: 66}, {text: 'effetto tensore', size: 66}]} />

      {/* consulenza + ottobre */}
      <Headline t={t} a={C('consulenza') + 0.05} b={segEnd(13)} y={175} lines={[{text: 'tutto parte da', bg: WHITE, fg: BLUE, size: 48}, {text: 'una consulenza', size: 66}]} />
      <Pill t={t} a={C('ottobre') + 0.05} b={segEnd(14)} text="promo ottobre" icon="cal" x={220} y={175} bg={GOLD} fg={'#4a3208'} size={56} />
      <Headline t={t} a={C('ottobre') + 0.9} b={segEnd(14)} y={300} lines={[{text: 'prenditi cura di te', bg: TEAL, size: 56}]} />

      {/* CTA */}
      <Headline t={t} a={segT(16) + 0.1} b={segEnd(17)} y={175} lines={[{text: 'consulenza', size: 70}, {text: 'gratuita', bg: GOLD, fg: '#4a3208', size: 78}]} stag={0.0} />
      <Pill t={t} a={C('chiamaci') - 0.1} b={segEnd(17)} text="chiamaci" icon="phone" x={-40} y={920} />
      <Pill t={t} a={C('scrivici') - 0.1} b={segEnd(17)} text="scrivici" icon="chat" x={-40} y={1030} />
      <Pill t={t} a={C('trovarci') - 0.1} b={segEnd(17)} text="vieni in farmacia" icon="pin" x={-40} y={1140} />

      {/* finestre 3D */}
      <Window t={t} a={TAKE.collagen[0]} b={TAKE.collagen[1]} bg={ICE}>{(lt) => <CollagenWin lt={lt} />}</Window>
      <Window t={t} a={TAKE.led[0]} b={TAKE.led[1]} bg={NAVY}>{(lt) => <LedWin lt={lt} />}</Window>
      <Window t={t} a={TAKE.offer[0]} b={TAKE.offer[1]} bg={BLUE}>{(lt) => <OfferWin lt={lt} />}</Window>
      <Window t={t} a={TAKE.end[0]} b={TAKE.end[1]} bg={ICE}>{(lt) => <EndWin lt={lt} />}</Window>
      <Pip t={t} a={TAKE.collagen[0]} b={TAKE.collagen[1]} />
      <Pip t={t} a={TAKE.led[0]} b={TAKE.led[1]} />
      <Pip t={t} a={TAKE.offer[0]} b={TAKE.offer[1]} />

      {/* transizioni */}
      {[TAKE.collagen, TAKE.led, TAKE.offer].map(([a, b], i) => (
        <React.Fragment key={i}>
          <Wipe t={t} at={a} c={i === 1 ? NAVY : i === 2 ? BLUE : WHITE} />
          <Wipe t={t} at={b} c={i === 1 ? NAVY : i === 2 ? BLUE : WHITE} dir={-1} />
          <Streaks t={t} at={a - 0.1} seed={i + 4} c={TEAL_HI} />
        </React.Fragment>
      ))}
      <Wipe t={t} at={TAKE.end[0]} c={WHITE} />
      <Flash t={t} at={0} d={0.3} />
      <Burst t={t} at={C('gratuita') + 0.1} x={540} y={420} seed={12} n={40} />

      <Badge t={t} />
    </AbsoluteFill>
  );
};
