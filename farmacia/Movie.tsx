import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BEBAS, COL, INFO, MONT} from './config';
import {LOGO_TEXT} from './logoData';
import {B, clamp, eBack, eExpo, eIO, eO3, eO4, eO5, FPS, lerp, prog, rnd, SC} from './util';

type Dim = {W: number; H: number; v: boolean};
const Ctx = createContext<Dim>({W: 1920, H: 1080, v: false});
const useD = () => useContext(Ctx);
const DUR = SC.slice(1).map((s, i) => s - SC[i]);

/* ═════════════ LOGO REALE (ridisegnato in vettoriale, animato) ═════════════ */
const LC = {
  dark: {bowl: '#176A52', liquid: '#B8D2CB', snake: '#5CC2A9', word: '#005850', sub: '#C5DFD8', eye: '#FFFFFF'},
  white: {bowl: '#FFFFFF', liquid: '#8FEAF0', snake: '#5CC2A9', word: '#FFFFFF', sub: '#BFE4E6', eye: '#0A474D'},
};
const Logo: React.FC<{u: number; width: number; white?: boolean; glow?: number; id: string}> = ({u, width, white, glow = 0, id}) => {
  const c = white ? LC.white : LC.dark;
  const ring = eO4(prog(u, 0, 0.65));
  const liq = eO3(prog(u, 0.45, 1.0));
  const stem = eO4(prog(u, 0.5, 0.95));
  const bar = eBack(prog(u, 0.85, 1.1), 1.8);
  const base = eBack(prog(u, 0.75, 1.05), 1.8);
  const lsn = eO3(prog(u, 0.7, 1.3));
  const usn = eO3(prog(u, 0.95, 1.5));
  const head = eBack(prog(u, 1.35, 1.65), 2);
  const fa = prog(u, 1.7, 2.1);
  const line = (key: 'A' | 'O', d0: number, st: number) =>
    LOGO_TEXT[key].map((d, i) => {
      const p = eO5(prog(u, d0 + i * st, d0 + i * st + 0.5));
      return <path key={i} d={d} fill={c.word} transform={`translate(0 ${(1 - p) * 150})`} />;
    });
  return (
    <svg viewBox="0 0 1104 480" width={width} height={width * (480 / 1104)} style={{overflow: 'visible', filter: glow ? `drop-shadow(0 0 ${glow * 36}px ${white ? 'rgba(143,234,240,.65)' : 'rgba(30,167,178,.35)'})` : undefined}}>
      <defs>
        <clipPath id={`${id}lq`}><rect x="0" y={lerp(215, 110, liq)} width="1104" height="200" /></clipPath>
        <clipPath id={`${id}a`}><rect x="260" y="92" width="600" height="130" /></clipPath>
        <clipPath id={`${id}o`}><rect x="220" y="240" width="860" height="125" /></clipPath>
      </defs>
      <g clipPath={`url(#${id}lq)`}>
        <path d="M86 132 Q120 120 152 128 T222 130 C222 172 192 198 154 199 C116 198 86 172 86 132Z" fill={c.liquid} />
      </g>
      <path d="M59 130 A94 94 0 0 0 247 130" fill="none" stroke={c.bowl} strokeWidth="19" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ring} />
      <path d="M160 256 C100 262 110 294 152 298 C196 302 192 342 140 348 C108 352 118 374 170 374" fill="none" stroke={c.snake} strokeWidth="21" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - lsn} />
      <rect x="144" y="226" width="16" height={176 * stem} fill={c.bowl} />
      <g transform={`translate(152 242) scale(${clamp(bar, 0, 1.2)} 1) translate(-152 -242)`}><rect x="122" y="236" width="60" height="13" rx="3" fill={c.bowl} /></g>
      <g transform={`translate(153 418) scale(${clamp(base, 0, 1.2)}) translate(-153 -418)`}><path d="M110 418 C126 394 180 394 196 418Z" fill={c.bowl} /></g>
      <path d="M250 136 C266 98 252 70 220 66 C192 63 170 72 176 90" fill="none" stroke={c.snake} strokeWidth="21" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - usn} />
      <g transform={`translate(204 68) scale(${clamp(head, 0, 1.25)}) translate(-204 -68)`}>
        <ellipse cx="204" cy="68" rx="38" ry="22" transform="rotate(-12 204 68)" fill={c.snake} />
        <circle cx="214" cy="62" r="4.5" fill={c.eye} />
      </g>
      <g clipPath={`url(#${id}a)`}>{line('A', 0.8, 0.05)}</g>
      <g clipPath={`url(#${id}o)`}>{line('O', 1.0, 0.04)}</g>
      <g opacity={fa} transform={`translate(0 ${(1 - fa) * 14})`}>
        {LOGO_TEXT.F.map((d, i) => <path key={i} d={d} fill={c.sub} />)}
      </g>
    </svg>
  );
};

/* ═════════════ effetti ═════════════ */
const Blobs: React.FC<{t: number; colors: string[]; o?: number}> = ({t, colors, o = 0.5}) => {
  const {W, H} = useD();
  return (
    <AbsoluteFill style={{filter: 'blur(60px)', opacity: o}}>
      {colors.map((c, i) => {
        const s = Math.max(W, H) * (0.4 + 0.1 * i);
        const x = W * (0.2 + 0.6 * ((i * 0.37) % 1)) + Math.sin(t * 0.8 + i * 2) * 120;
        const y = H * (0.25 + 0.5 * ((i * 0.61) % 1)) + Math.cos(t * 0.7 + i) * 100;
        return <div key={i} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: s, background: c}} />;
      })}
    </AbsoluteFill>
  );
};

const Dust: React.FC<{t: number; n?: number; seed?: number; color?: string}> = ({t, n = 46, seed = 3, color = COL.turqHi}) => {
  const {W, H} = useD();
  const r = rnd(seed);
  const items = [];
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, vx = (r() - 0.5) * 30, vy = -(10 + r() * 50), s = 2 + r() * 5, ph = r() * 6.28, d = r();
    const x = (((x0 + vx * t) % W) + W) % W;
    const y = (((y0 + vy * t) % H) + H) % H;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (1 + d * 2) + ph));
    items.push(<div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: color, opacity: tw * (0.25 + d * 0.5), boxShadow: `0 0 ${s * 3}px ${color}`}} />);
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

const BURST_COLORS = [COL.magenta, COL.turq, COL.petrol, COL.green, COL.white];
const Burst: React.FC<{lt: number; t0: number; x?: string; y?: string; n?: number; seed?: number; power?: number; colors?: string[]; dur?: number}> = ({lt, t0, x = '50%', y = '50%', n = 28, seed = 1, power = 1, colors = BURST_COLORS, dur = 1.1}) => {
  const u = lt - t0;
  if (u < 0 || u > dur) return null;
  const r = rnd(seed);
  const p = eO4(u / dur);
  const fade = 1 - prog(u, dur * 0.5, dur);
  const items = [];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, sp = (260 + r() * 820) * power, sz = 16 + r() * 34, sh = Math.floor(r() * 4), rot = r() * 360, spin = (r() - 0.5) * 900, col = colors[Math.floor(r() * colors.length)];
    const dx = Math.cos(a) * sp * p, dy = Math.sin(a) * sp * p + 160 * u * u;
    const base: React.CSSProperties = {position: 'absolute', left: dx - sz / 2, top: dy - sz / 2, transform: `rotate(${rot + spin * u}deg) scale(${lerp(0.4, 1, eO3(clamp(u * 6)))})`, opacity: fade};
    items.push(
      sh === 0 ? <svg key={i} width={sz} height={sz} viewBox="0 0 100 100" style={base}><rect x="36" y="4" width="28" height="92" rx="8" fill={col} /><rect x="4" y="36" width="92" height="28" rx="8" fill={col} /></svg> :
      sh === 1 ? <div key={i} style={{...base, width: sz * 2, height: sz, borderRadius: sz, background: `linear-gradient(90deg, ${col} 50%, ${COL.white} 50%)`}} /> :
      sh === 2 ? <div key={i} style={{...base, width: sz * 0.7, height: sz * 0.7, borderRadius: sz, background: col}} /> :
      <div key={i} style={{...base, width: sz, height: sz, borderRadius: sz, border: `${Math.max(4, sz * 0.18)}px solid ${col}`}} />,
    );
  }
  return <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>{items}</div>;
};

const Shock: React.FC<{lt: number; t0: number; x?: string; y?: string; color?: string; size?: number; dur?: number}> = ({lt, t0, x = '50%', y = '50%', color = COL.turq, size = 1500, dur = 0.8}) => {
  const u = prog(lt, t0, t0 + dur);
  if (u <= 0 || u >= 1) return null;
  const s = size * eO4(u);
  return <div style={{position: 'absolute', left: x, top: y, width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, borderRadius: s, border: `${lerp(26, 2, u)}px solid ${color}`, opacity: 1 - u}} />;
};

const Letters: React.FC<{text: string; lt: number; delay?: number; stag?: number; size: number; color?: string; style?: React.CSSProperties}> = ({text, lt, delay = 0, stag = 0.025, size, color = COL.white, style}) => (
  <div style={{display: 'flex', justifyContent: 'center', whiteSpace: 'pre', fontFamily: BEBAS, fontSize: size, lineHeight: 1, color, letterSpacing: size * 0.01, ...style}}>
    {text.split('').map((ch, i) => {
      const p = prog(lt, delay + i * stag, delay + i * stag + 0.4);
      return (
        <span key={i} style={{display: 'inline-block', overflow: 'hidden', lineHeight: 1.04, paddingBottom: size * 0.05}}>
          <span style={{display: 'inline-block', transform: `translateY(${(1 - eO5(p)) * 118}%)`}}>{ch}</span>
        </span>
      );
    })}
  </div>
);

const Tag: React.FC<{text: string; lt: number; delay?: number; bg?: string; color?: string; size?: number}> = ({text, lt, delay = 0.1, bg = COL.magenta, color = COL.white, size = 32}) => {
  const p = eO4(prog(lt, delay, delay + 0.3));
  return (
    <div style={{display: 'inline-block', fontFamily: MONT, fontWeight: 800, fontSize: size, letterSpacing: size * 0.16, textTransform: 'uppercase', color, background: bg, padding: `${size * 0.3}px ${size * 0.8}px`, borderRadius: 100, opacity: p, transform: `translateY(${(1 - p) * 22}px) scale(${lerp(0.9, 1, p)})`}}>
      {text}
    </div>
  );
};

const Sub: React.FC<{text: string; lt: number; delay?: number; color?: string; size?: number; weight?: number}> = ({text, lt, delay = 0.2, color = COL.cream, size = 36, weight = 600}) => {
  const p = eO4(prog(lt, delay, delay + 0.35));
  return <div style={{fontFamily: MONT, fontWeight: weight, fontSize: size, color, opacity: p, transform: `translateY(${(1 - p) * 20}px)`, textAlign: 'center'}}>{text}</div>;
};

// parola gigante in contorno che scorre dietro
const Ghost: React.FC<{text: string; lt: number; y: string; dir?: number; color: string; size?: number; o?: number}> = ({text, lt, y, dir = 1, color, size = 520, o = 0.16}) => {
  const {W} = useD();
  return (
    <div style={{position: 'absolute', top: y, left: 0, whiteSpace: 'nowrap', fontFamily: BEBAS, fontSize: size, lineHeight: 1, color: 'transparent', WebkitTextStroke: `4px ${color}`, opacity: o, transform: `translateX(${dir > 0 ? lerp(-W * 0.3, -W * 0.7, lt / 3) : lerp(-W * 0.8, -W * 0.2, lt / 3)}px)`}}>
      {text} {text} {text}
    </div>
  );
};

/* ═════════════ icone animate ═════════════ */
const Ecg: React.FC<{p: number; w: number; color?: string}> = ({p, w, color = COL.magenta}) => (
  <svg width={w} height={w * 0.42} viewBox="0 -10 260 110" fill="none" style={{overflow: 'visible', filter: `drop-shadow(0 0 14px ${color})`}}>
    <path pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} d="M0 50 L45 50 L58 50 L68 24 L78 50 L92 50 L102 92 L116 -6 L130 70 L140 50 L178 50 L194 36 L210 50 L260 50" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Gauge: React.FC<{lt: number; size: number}> = ({lt, size}) => {
  const a = lerp(-100, 28, eBack(prog(lt, 0.1, 0.55), 1.2)) + Math.sin(lt * 18) * 1.5 * (lt > 0.55 ? 1 : 0);
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 200 150">
      <path d="M20 120 A80 80 0 0 1 180 120" stroke={COL.petrol} strokeWidth="16" strokeLinecap="round" fill="none" opacity={0.2} />
      <path d="M20 120 A80 80 0 0 1 180 120" stroke={COL.turq} strokeWidth="16" strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - prog(lt, 0.1, 0.55) * 0.75} />
      <g transform={`rotate(${a} 100 120)`}><rect x="96" y="48" width="8" height="74" rx="4" fill={COL.magenta} /></g>
      <circle cx="100" cy="120" r="12" fill={COL.petrol} />
    </svg>
  );
};
const Drop: React.FC<{lt: number; size: number}> = ({lt, size}) => {
  const y = lerp(-90, 0, eBack(prog(lt, 0.05, 0.5), 1.1));
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible'}}>
      <g transform={`translate(0 ${y})`}>
        <path d="M100 18 C100 18 40 92 40 130 A60 60 0 0 0 160 130 C160 92 100 18 100 18Z" fill={COL.magenta} />
        <path d="M70 128 A32 32 0 0 0 96 160" stroke="#fff" strokeOpacity=".55" strokeWidth="9" strokeLinecap="round" fill="none" />
      </g>
      <ellipse cx="100" cy="188" rx={lerp(0, 60, prog(lt, 0.45, 0.7))} ry="8" fill={COL.petrol} opacity={0.2} />
    </svg>
  );
};
const Mortar: React.FC<{lt: number; size: number}> = ({lt, size}) => {
  const rot = Math.sin(lt * 7) * 10;
  const pop = eBack(prog(lt, 0, 0.45), 1.3);
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible', transform: `scale(${pop})`}}>
      <g transform={`rotate(${rot} 100 110)`}><rect x="88" y="10" width="26" height="110" rx="13" transform="rotate(26 100 100)" fill={COL.magenta} /></g>
      <path d="M22 100 H178 C178 150 150 178 100 178 C50 178 22 150 22 100Z" fill={COL.turq} />
      <rect x="70" y="176" width="60" height="14" rx="7" fill={COL.white} opacity={0.8} />
      {[0, 1, 2].map((i) => <circle key={i} cx={60 + i * 40} cy={84 - Math.abs(Math.sin(lt * 6 + i * 2)) * 24} r="7" fill={COL.white} opacity={prog(lt, 0.4, 0.6)} />)}
    </svg>
  );
};
const Heart: React.FC<{size: number; beat: number; color?: string}> = ({size, beat, color = COL.magenta}) => (
  <svg width={size} height={size} viewBox="-10 -10 120 110" style={{overflow: 'visible', transform: `scale(${1 + beat * 0.14})`}}>
    <path d="M50 88 C-18 40 14 -4 50 28 C86 -4 118 40 50 88Z" fill={color} />
  </svg>
);
const Leaf: React.FC<{size: number; lt: number}> = ({size, lt}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: 'visible', transform: `rotate(${Math.sin(lt * 2.4) * 6}deg)`}}>
    <path d="M20 100 C10 40 50 10 105 14 C108 70 76 106 20 100Z" fill={COL.white} />
    <path d="M24 98 C50 70 70 50 92 28" stroke={COL.green} strokeWidth="6" strokeLinecap="round" fill="none" />
  </svg>
);
const Plus: React.FC<{size: number; color?: string}> = ({size, color = COL.white}) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><rect x="36" y="8" width="28" height="84" rx="8" fill={color} /><rect x="8" y="36" width="84" height="28" rx="8" fill={color} /></svg>
);

/* ═════════════ S1 · apertura: il logo si costruisce ═════════════ */
const S1: React.FC<{lt: number}> = ({lt}) => {
  const {W, v} = useD();
  const u = lt - 0.2;
  const done = 1.75;
  const yr = Math.round(lerp(1000, 1909, eExpo(prog(lt, 1.6, 2.5))));
  const lw = v ? 980 : 1180;
  const glow = prog(u, done, done + 0.4) * (1 - prog(u, done + 0.5, done + 1.2) * 0.5);
  return (
    <AbsoluteFill style={{background: COL.cream}}>
      <Blobs t={lt} colors={[COL.turqHi, '#FFC2DD', '#CDEBDD', COL.turqHi]} o={0.75} />
      <Dust t={lt} seed={9} color={COL.turq} n={40} />
      <Shock lt={lt} t0={done + 0.2} y={v ? '40%' : '44%'} color={COL.magenta} size={W * 1.3} />
      <Shock lt={lt} t0={done + 0.32} y={v ? '40%' : '44%'} color={COL.turq} size={W * 1.0} />
      <Burst lt={lt} t0={done + 0.2} y={v ? '40%' : '44%'} n={34} seed={7} power={1.15} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: v ? 60 : 36}}>
        <div style={{transform: `scale(${1 + 0.03 * Math.sin(prog(u, done, done + 1) * Math.PI)})`}}>
          <Logo u={u} width={lw} glow={glow} id="s1" />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 30, flexDirection: v ? 'column' : 'row'}}>
          <div style={{fontFamily: BEBAS, fontSize: v ? 190 : 150, lineHeight: 0.9, color: COL.petrol, letterSpacing: 4, opacity: eO4(prog(lt, 1.55, 1.85)), transform: `translateY(${(1 - eO4(prog(lt, 1.55, 1.85))) * 40}px)`}}>
            DAL <span style={{color: COL.magenta}}>{yr}</span>
          </div>
          <Tag text="Nel cuore di Brindisi" lt={lt} delay={2.2} size={v ? 32 : 30} bg={COL.petrol} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ═════════════ S2 · servizi ═════════════ */
const SERV = [
  {w: 'PRESSIONE', tag: 'Senza prenotazione', sub: 'Pochi minuti, strumenti validati', bg: COL.cream, ic: 'gauge', ghost: 'CUORE'},
  {w: 'ECG', tag: 'Su prenotazione', sub: 'Elettrocardiogramma rapido e indolore', bg: COL.petrol, ic: 'ecg', ghost: 'PREVENZIONE'},
  {w: 'GLICEMIA', tag: 'Analisi rapide', sub: 'Controlli veloci, subito', bg: COL.cream, ic: 'drop', ghost: 'SUBITO'},
  {w: 'GALENICI', tag: 'Farmacisti preparatori', sub: 'Preparazioni su misura', bg: COL.petrol, ic: 'mortar', ghost: 'SU MISURA'},
];
const S2: React.FC<{lt: number}> = ({lt}) => {
  const {v} = useD();
  const i = Math.min(3, Math.floor(lt / 0.75));
  const s = SERV[i];
  const l = lt - i * 0.75;
  const dark = s.bg === COL.petrol;
  const txt = dark ? COL.white : COL.petrol;
  const isz = v ? 440 : 400;
  const icon =
    s.ic === 'gauge' ? <Gauge lt={l} size={isz} /> : s.ic === 'ecg' ? <Ecg p={eO3(prog(l, 0.05, 0.6))} w={isz * 1.15} color={COL.turqHi} /> : s.ic === 'drop' ? <Drop lt={l} size={isz * 0.85} /> : <Mortar lt={l} size={isz * 0.9} />;
  return (
    <AbsoluteFill style={{background: s.bg}}>
      <Blobs t={lt} colors={dark ? [COL.turq, COL.petrolDark, COL.turq] : [COL.turqHi, '#FFC2DD', COL.turqHi]} o={dark ? 0.45 : 0.6} />
      <Ghost text={s.ghost} lt={lt} y={v ? '12%' : '2%'} color={dark ? COL.turqHi : COL.turq} dir={i % 2 ? -1 : 1} o={dark ? 0.2 : 0.22} size={v ? 420 : 360} />
      <Ghost text={s.ghost} lt={lt} y={v ? '62%' : '60%'} color={dark ? COL.turqHi : COL.turq} dir={i % 2 ? 1 : -1} o={dark ? 0.14 : 0.16} size={v ? 420 : 360} />
      <Dust t={lt} seed={20 + i} color={dark ? COL.turqHi : COL.turq} n={30} />
      <Shock lt={l} t0={0.02} color={COL.magenta} size={1400} dur={0.6} />
      <Burst lt={l} t0={0.03} n={16} seed={40 + i} power={0.8} dur={0.9} colors={dark ? [COL.magenta, COL.turqHi, COL.white] : [COL.magenta, COL.turq, COL.petrol]} />
      <AbsoluteFill style={{display: 'flex', flexDirection: v ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: v ? 40 : 90}}>
        <div style={{width: isz, height: isz * 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - eO4(prog(l, 0, 0.35))) * 40}px)`, opacity: prog(l, 0, 0.15)}}>{icon}</div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: v ? 'center' : 'flex-start', gap: 18}}>
          <Tag text={s.tag} lt={l} delay={0.05} bg={COL.magenta} size={v ? 28 : 30} />
          <Letters text={s.w} lt={l} delay={0.02} stag={0.022} size={v ? 250 : 270} color={txt} />
          <div style={{width: `${eO4(prog(l, 0.1, 0.5)) * 100}%`, height: 14, borderRadius: 7, background: COL.magenta}} />
          <Sub text={s.sub} lt={l} delay={0.2} color={dark ? COL.cream : COL.ink} size={v ? 40 : 46} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ═════════════ S3 · le tre Rooms ═════════════ */
const ROOMS = [
  {n: 'HEALTH', t: 'Salute e prevenzione', c: COL.turq, ic: 'plus'},
  {n: 'WELLNESS', t: 'Equilibrio e benessere', c: COL.green, ic: 'leaf'},
  {n: 'BEAUTY', t: 'Viso, corpo e capelli', c: COL.magenta, ic: 'heart'},
];
const S3: React.FC<{lt: number}> = ({lt}) => {
  const {v} = useD();
  const beat = Math.pow(Math.abs(Math.sin((lt * Math.PI) / B)), 6);
  const exit = eIO(prog(lt, 2.2, 2.48));
  return (
    <AbsoluteFill style={{background: COL.petrolDeep}}>
      <AbsoluteFill style={{display: 'flex', flexDirection: v ? 'column' : 'row'}}>
        {ROOMS.map((r, i) => {
          const p = eO5(prog(lt, 0.05 + i * 0.18, 0.55 + i * 0.18));
          const hold = prog(lt, 0.6 + i * 0.12, 1.0 + i * 0.12);
          return (
            <div key={i} style={{flex: 1, position: 'relative', overflow: 'hidden', transform: v ? `translateX(${(1 - p) * -110 + exit * 110}%)` : `translateY(${(1 - p) * 110 - exit * 110}%)`}}>
              <div style={{position: 'absolute', inset: 0, background: r.c}} />
              <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 38%, rgba(255,255,255,.32), transparent 60%)`}} />
              <Burst lt={lt} t0={0.5 + i * 0.12} n={14} seed={70 + i} power={0.55} dur={0.9} colors={[COL.white, COL.cream, '#FFFFFFAA']} />
              <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: v ? 14 : 30}}>
                <div style={{transform: `scale(${eBack(hold, 1.5)})`, opacity: hold}}>
                  {r.ic === 'plus' ? <Plus size={v ? 150 : 200} /> : r.ic === 'leaf' ? <Leaf size={v ? 160 : 220} lt={lt} /> : <Heart size={v ? 150 : 200} beat={beat} color={COL.white} />}
                </div>
                <div style={{fontFamily: BEBAS, fontSize: 150, lineHeight: 0.95, color: COL.white, letterSpacing: 3}}>{r.n}</div>
                <div style={{fontFamily: MONT, fontWeight: 800, fontSize: v ? 34 : 32, letterSpacing: 10, color: COL.white, opacity: 0.9}}>ROOM</div>
                <div style={{fontFamily: MONT, fontWeight: 600, fontSize: v ? 38 : 34, color: COL.white, textAlign: 'center', padding: '0 30px', opacity: hold, transform: `translateY(${(1 - hold) * 18}px)`}}>{r.t}</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ═════════════ S4 · tre generazioni ═════════════ */
const GEN = [
  {y: '1909', t: 'Lorenzo apre in Corso Garibaldi'},
  {y: '1968', t: 'Paolo: una sede più ampia'},
  {y: 'OGGI', t: 'Olga e Francesca tornano alle origini'},
];
const S4: React.FC<{lt: number}> = ({lt}) => {
  const {v} = useD();
  const line = eIO(prog(lt, 0.25, 1.7));
  return (
    <AbsoluteFill style={{background: COL.cream}}>
      <Blobs t={lt} colors={[COL.turqHi, '#FFC2DD', '#CDEBDD']} o={0.7} />
      <Ghost text="TRE GENERAZIONI" lt={lt * 1.2} y={v ? '4%' : '58%'} color={COL.turq} o={0.2} dir={-1} size={v ? 380 : 480} />
      <Dust t={lt} seed={44} color={COL.turq} n={26} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: v ? 60 : 50}}>
        <div style={{textAlign: 'center'}}>
          <Letters text="TRE GENERAZIONI" lt={lt} size={v ? 150 : 180} color={COL.petrol} stag={0.02} />
          <div style={{marginTop: 10}}><Tag text="Un solo indirizzo" lt={lt} delay={0.3} size={v ? 30 : 32} /></div>
        </div>
        <div style={{position: 'relative', width: v ? 760 : 1500, height: v ? 760 : 330, display: 'flex', flexDirection: v ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{position: 'absolute', background: COL.petrol, ...(v ? {left: 38, top: 40, width: 8, height: `${line * 80}%`} : {top: 40, left: 40, height: 8, width: `${line * 94}%`}), borderRadius: 4}} />
          {GEN.map((g, i) => {
            const p = prog(lt, 0.4 + i * 0.5, 0.8 + i * 0.5);
            const e = eBack(p, 1.5);
            const last = i === 2;
            return (
              <div key={i} style={{display: 'flex', flexDirection: v ? 'row' : 'column', alignItems: 'center', gap: v ? 34 : 20, width: v ? '100%' : 460, opacity: clamp(p * 3), transform: `scale(${lerp(0.5, 1, clamp(e, 0, 1.1))})`}}>
                <div style={{width: 84, height: 84, borderRadius: 42, background: last ? COL.magenta : COL.petrol, border: `10px solid ${COL.cream}`, boxShadow: `0 0 0 6px ${last ? COL.magenta : COL.petrol}`, flexShrink: 0}} />
                <div style={{textAlign: v ? 'left' : 'center'}}>
                  <div style={{fontFamily: BEBAS, fontSize: v ? 150 : 160, lineHeight: 0.9, color: last ? COL.magenta : COL.petrol}}>{g.y}</div>
                  <div style={{fontFamily: MONT, fontWeight: 700, fontSize: v ? 38 : 36, color: COL.ink, maxWidth: v ? 620 : 440}}>{g.t}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Burst lt={lt} t0={0.4} x={v ? '10%' : '12%'} y={v ? '58%' : '70%'} n={10} seed={81} power={0.5} dur={0.8} />
      <Burst lt={lt} t0={1.4} x={v ? '10%' : '88%'} y={v ? '78%' : '70%'} n={14} seed={82} power={0.6} dur={0.8} />
    </AbsoluteFill>
  );
};

/* ═════════════ S5 · la promessa ═════════════ */
const S5: React.FC<{lt: number}> = ({lt}) => {
  const {v} = useD();
  const lines = v ? ['TI DICIAMO', 'COSA POSSIAMO', 'FARE E COSA NO.'] : ['TI DICIAMO COSA POSSIAMO', 'FARE E COSA NO.'];
  const sz = v ? 190 : 210;
  const s = eBack(prog(lt, 0.7, 1.0), 1.8);
  return (
    <AbsoluteFill style={{background: COL.magenta}}>
      <Blobs t={lt} colors={['#FF6FB4', COL.petrol, '#FF9DCB']} o={0.55} />
      <Dust t={lt} seed={52} color="#FFD3E8" n={40} />
      <Shock lt={lt} t0={0.7} y="62%" color={COL.white} size={1800} dur={0.7} />
      <Burst lt={lt} t0={0.72} y="62%" n={30} seed={91} power={1.2} colors={[COL.white, COL.petrol, COL.turqHi, '#FFD3E8']} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
        {lines.map((l, i) => <Letters key={i} text={l} lt={lt} delay={0.02 + i * 0.18} stag={0.016} size={sz} color={COL.white} />)}
        <div style={{marginTop: 40, fontFamily: BEBAS, fontSize: v ? 260 : 280, lineHeight: 0.9, color: COL.petrolDark, transform: `scale(${lerp(0.4, 1, clamp(s, 0, 1.15))}) rotate(${(1 - clamp(s, 0, 1)) * -6}deg)`, opacity: clamp(s * 3)}}>SEMPRE.</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ═════════════ S6 · chiusura ═════════════ */
const S6: React.FC<{lt: number}> = ({lt}) => {
  const {W, v} = useD();
  const u = lt - 0.05;
  const cta = eBack(prog(lt, 1.35, 1.7), 1.6);
  const glow = prog(u, 1.7, 2.1);
  const shine = lerp(-40, 140, prog(lt, 1.8, 2.4));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, ${COL.petrol} 0%, ${COL.petrolDark} 58%, ${COL.petrolDeep} 100%)`}}>
      <Blobs t={lt} colors={[COL.turq, COL.petrol, COL.turq]} o={0.4} />
      <Dust t={lt} seed={63} n={50} />
      <Shock lt={lt} t0={1.75} y={v ? '34%' : '36%'} color={COL.turqHi} size={W * 1.2} />
      <Burst lt={lt} t0={1.75} y={v ? '34%' : '36%'} n={30} seed={101} power={1.1} colors={[COL.magenta, COL.turqHi, COL.white, COL.turq]} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: v ? 70 : 44}}>
        <Logo u={u} width={v ? 940 : 1000} white glow={glow} id="s6" />
        <div style={{textAlign: 'center', opacity: clamp(cta * 3), transform: `scale(${lerp(0.7, 1, clamp(cta, 0, 1.1))})`}}>
          <div style={{position: 'relative', display: 'inline-block', overflow: 'hidden', fontFamily: MONT, fontWeight: 800, fontSize: v ? 46 : 40, letterSpacing: 4, color: COL.white, background: COL.magenta, padding: '24px 56px', borderRadius: 100, boxShadow: `0 0 ${34 + 22 * Math.sin(lt * 8)}px rgba(236,7,119,.6)`}}>
            {INFO.cta}
            <div style={{position: 'absolute', top: 0, bottom: 0, left: `${shine}%`, width: '22%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent)', transform: 'skewX(-18deg)'}} />
          </div>
          <div style={{fontFamily: BEBAS, fontSize: v ? 104 : 96, color: COL.white, marginTop: 18, letterSpacing: 4}}>{INFO.phone}</div>
          <div style={{marginTop: 4}}><Sub text={INFO.address} lt={lt} delay={1.6} size={v ? 40 : 36} color={COL.turqHi} weight={700} /></div>
          <div style={{marginTop: 8}}><Sub text={INFO.hours} lt={lt} delay={1.75} size={v ? 30 : 27} color={COL.cream} weight={500} /></div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ═════════════ montaggio + transizioni ═════════════ */
const SCENES = [S1, S2, S3, S4, S5, S6];
const TCOL = [COL.petrol, COL.magenta, COL.turq, COL.petrol, COL.magenta, COL.turq];

// scene dispari: barre che si ritirano sfalsate; scene pari: iris circolare (gestito in Movie)
const Bars: React.FC<{i: number; lt: number}> = ({i, lt}) => {
  const col = TCOL[i];
  const n = 7;
  return (
    <AbsoluteFill style={{display: 'flex', flexDirection: 'row'}}>
      {Array.from({length: n}).map((_, k) => {
        const p = eO4(prog(lt, k * 0.035, 0.38 + k * 0.035));
        return <div key={k} style={{flex: 1, background: k % 2 ? col : COL.petrolDeep, transformOrigin: k % 2 ? 'top' : 'bottom', transform: `scaleY(${1 - p})`}} />;
      })}
    </AbsoluteFill>
  );
};

export const Movie: React.FC<{vertical: boolean; width: number; height: number}> = ({vertical, width, height}) => {
  const t = useCurrentFrame() / FPS;
  const si = SCENES.findIndex((_, i) => t >= SC[i] && t < SC[i + 1]);
  const i = si < 0 ? SCENES.length - 1 : si;
  const lt = t - SC[i];
  const S = SCENES[i];
  const R = (Math.hypot(width, height) / 2) * 1.06;
  const iris = i > 0 && i % 2 === 0;
  const irisP = iris ? eO4(prog(lt, 0, 0.55)) : 1;
  const Prev = i > 0 ? SCENES[i - 1] : null;
  const punch = 1 + 0.05 * (1 - eO4(prog(lt, 0, 0.35)));
  return (
    <Ctx.Provider value={{W: width, H: height, v: vertical}}>
      <AbsoluteFill style={{background: COL.petrolDeep}}>
        {irisP < 1 && Prev ? <AbsoluteFill><Prev lt={DUR[i - 1]} /></AbsoluteFill> : null}
        {irisP < 1 ? (
          <div style={{position: 'absolute', left: '50%', top: '50%', width: R * 2 * irisP + 60, height: R * 2 * irisP + 60, marginLeft: -(R * irisP + 30), marginTop: -(R * irisP + 30), borderRadius: '50%', background: TCOL[i]}} />
        ) : null}
        <AbsoluteFill style={{transform: `scale(${punch})`, clipPath: irisP < 1 ? `circle(${R * irisP}px at 50% 50%)` : undefined}}>
          <S lt={lt} />
        </AbsoluteFill>
        {i > 0 && !iris ? <Bars i={i} lt={lt} /> : null}
        <div style={{position: 'absolute', inset: 0, background: COL.cream, opacity: 1 - eO3(prog(t, 0, 0.3))}} />
      </AbsoluteFill>
    </Ctx.Provider>
  );
};
