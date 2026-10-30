import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BEBAS, COL, INFO, MONT} from './config';
import {B, clamp, eBack, eExpo, eIO, eO3, eO4, eO5, FPS, lerp, prog, rnd, SC} from './util';

type Dim = {W: number; H: number; v: boolean};
const Ctx = createContext<Dim>({W: 1920, H: 1080, v: false});
const useD = () => useContext(Ctx);

/* ───────────── pezzi comuni ───────────── */

const Glow: React.FC<{x: string; y: string; r: number; c: string; o: number}> = ({x, y, r, c, o}) => (
  <div style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, borderRadius: r, background: `radial-gradient(circle, ${c} 0%, transparent 68%)`, opacity: o}} />
);

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

// lettere che salgono da una maschera (stile Pragma)
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

// croce a 5 quadrati che si assemblano
const Cross: React.FC<{lt: number; size: number; delay?: number; fill?: string; inner?: string; glow?: string; lit?: number}> = ({lt, size, delay = 0, fill = COL.cream, inner = COL.petrol, glow = COL.turq, lit = 1}) => {
  const cells: [number, number, number][] = [
    [1, 1, 0],
    [1, 0, 0.1],
    [0, 1, 0.2],
    [2, 1, 0.3],
    [1, 2, 0.4],
  ];
  const g = size * 0.06;
  return (
    <div style={{position: 'relative', width: size * 3, height: size * 3, filter: `drop-shadow(0 0 ${size * 0.25 * lit}px ${glow})`}}>
      {cells.map(([cx, cy, d], i) => {
        const p = prog(lt, delay + d, delay + d + 0.45);
        const e = eBack(p, 1.6);
        const dx = (cx - 1) * 260, dy = (cy - 1) * 260;
        return (
          <div key={i} style={{position: 'absolute', left: cx * size + g / 2, top: cy * size + g / 2, width: size - g, height: size - g, borderRadius: size * 0.16, background: fill, opacity: clamp(p * 4), transform: `translate(${dx * (1 - e)}px, ${dy * (1 - e)}px) scale(${lerp(0.3, 1, clamp(e, 0, 1.15))})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: '46%', height: '46%', borderRadius: size * 0.08, background: inner}} />
          </div>
        );
      })}
    </div>
  );
};

/* ───────────── icone animate ───────────── */

const Ecg: React.FC<{p: number; w: number; color?: string}> = ({p, w, color = COL.magenta}) => (
  <svg width={w} height={w * 0.42} viewBox="0 -10 260 110" fill="none">
    <path pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} d="M0 50 L45 50 L58 50 L68 24 L78 50 L92 50 L102 92 L116 -6 L130 70 L140 50 L178 50 L194 36 L210 50 L260 50" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Gauge: React.FC<{lt: number; size: number}> = ({lt, size}) => {
  const a = lerp(-100, 28, eBack(prog(lt, 0.1, 0.55), 1.2)) + Math.sin(lt * 18) * 1.5 * (lt > 0.55 ? 1 : 0);
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 200 150">
      <path d="M20 120 A80 80 0 0 1 180 120" stroke={COL.petrol} strokeWidth="16" strokeLinecap="round" fill="none" opacity={0.2} />
      <path d="M20 120 A80 80 0 0 1 180 120" stroke={COL.turq} strokeWidth="16" strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - prog(lt, 0.1, 0.55) * 0.75} />
      <g transform={`rotate(${a} 100 120)`}>
        <rect x="96" y="48" width="8" height="74" rx="4" fill={COL.magenta} />
      </g>
      <circle cx="100" cy="120" r="12" fill={COL.petrol} />
    </svg>
  );
};

const Drop: React.FC<{lt: number; size: number}> = ({lt, size}) => {
  const y = lerp(-90, 0, eBack(prog(lt, 0.05, 0.5), 1.1));
  const s = 1 + 0.06 * Math.sin(lt * 9);
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible'}}>
      <g transform={`translate(0 ${y}) scale(${s})`} style={{transformOrigin: '100px 120px'}}>
        <path d="M100 18 C100 18 40 92 40 130 A60 60 0 0 0 160 130 C160 92 100 18 100 18Z" fill={COL.magenta} />
        <path d="M70 128 A32 32 0 0 0 96 160" stroke="#fff" strokeOpacity=".55" strokeWidth="9" strokeLinecap="round" fill="none" />
      </g>
      <ellipse cx="100" cy="188" rx={lerp(0, 60, prog(lt, 0.45, 0.7)) * (1 - prog(lt, 0.7, 1) * 0.3)} ry="8" fill={COL.petrol} opacity={0.2} />
    </svg>
  );
};

const Mortar: React.FC<{lt: number; size: number}> = ({lt, size}) => {
  const rot = Math.sin(lt * 7) * 10;
  const pop = eBack(prog(lt, 0, 0.45), 1.3);
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible', transform: `scale(${pop})`}}>
      <g transform={`rotate(${rot} 100 110)`}>
        <rect x="88" y="10" width="26" height="110" rx="13" transform="rotate(26 100 100)" fill={COL.magenta} />
      </g>
      <path d="M22 100 H178 C178 150 150 178 100 178 C50 178 22 150 22 100Z" fill={COL.petrol} />
      <rect x="70" y="176" width="60" height="14" rx="7" fill={COL.petrolDark} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={60 + i * 40} cy={84 - Math.abs(Math.sin(lt * 6 + i * 2)) * 24} r="7" fill={COL.turq} opacity={prog(lt, 0.4, 0.6)} />
      ))}
    </svg>
  );
};

const Heart: React.FC<{size: number; beat: number; color?: string}> = ({size, beat, color = COL.magenta}) => (
  <svg width={size} height={size} viewBox="-10 -10 120 110" style={{overflow: 'visible', transform: `scale(${1 + beat * 0.12})`}}>
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
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x="36" y="8" width="28" height="84" rx="8" fill={color} />
    <rect x="8" y="36" width="84" height="28" rx="8" fill={color} />
  </svg>
);

/* ───────────── transizione: pannello che scivola via sul taglio ───────────── */
const Wipe: React.FC<{lt: number; color: string}> = ({lt, color}) => {
  const p = eO4(prog(lt, 0, 0.42));
  if (p >= 1) return null;
  return <div style={{position: 'absolute', inset: 0, background: color, transform: `translateX(${p * 101}%)`}} />;
};

/* ───────────── S1 · DAL 1909 ───────────── */
const S1: React.FC<{lt: number}> = ({lt}) => {
  const {v} = useD();
  const yr = Math.round(lerp(1000, 1909, eExpo(prog(lt, 0.35, 1.25))));
  const lit = prog(lt, 0.7, 0.9);
  const sz = v ? 150 : 170;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 46%, ${COL.petrol} 0%, ${COL.petrolDark} 55%, ${COL.petrolDeep} 100%)`}}>
      <Glow x="50%" y="48%" r={900} c={COL.turq} o={0.25 + 0.3 * lit} />
      <Dust t={lt} seed={9} />
      <AbsoluteFill style={{display: 'flex', flexDirection: v ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: v ? 70 : 130}}>
        <Cross lt={lt} size={sz} lit={lit} />
        <div style={{textAlign: v ? 'center' : 'left'}}>
          <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 44, letterSpacing: 18, color: COL.turqHi, opacity: eO4(prog(lt, 0.2, 0.5))}}>DAL</div>
          <div style={{fontFamily: BEBAS, fontSize: v ? 330 : 360, lineHeight: 0.9, color: COL.white, letterSpacing: 4}}>{yr}</div>
          <div style={{marginTop: 24}}>
            <Tag text="Brindisi · Corso Garibaldi" lt={lt} delay={1.2} size={v ? 30 : 32} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── S2 · servizi, parole cinetiche ───────────── */
const SERV = [
  {w: 'PRESSIONE', tag: 'Senza prenotazione', sub: 'Pochi minuti, strumenti validati', bg: COL.cream, ic: 'gauge'},
  {w: 'ECG', tag: 'Su prenotazione', sub: 'Elettrocardiogramma rapido e indolore', bg: COL.petrol, ic: 'ecg'},
  {w: 'GLICEMIA', tag: 'Analisi rapide', sub: 'Controlli veloci, subito', bg: COL.cream, ic: 'drop'},
  {w: 'GALENICI', tag: 'Farmacisti preparatori', sub: 'Preparazioni su misura', bg: COL.petrol, ic: 'mortar'},
];
const S2: React.FC<{lt: number}> = ({lt}) => {
  const {v} = useD();
  const i = Math.min(3, Math.floor(lt / 0.75));
  const s = SERV[i];
  const l = lt - i * 0.75;
  const dark = s.bg === COL.petrol;
  const txt = dark ? COL.white : COL.petrol;
  const isz = v ? 420 : 380;
  const icon =
    s.ic === 'gauge' ? <Gauge lt={l} size={isz} /> : s.ic === 'ecg' ? <Ecg p={eO3(prog(l, 0.05, 0.6))} w={isz * 1.15} color={COL.turqHi} /> : s.ic === 'drop' ? <Drop lt={l} size={isz * 0.85} /> : <Mortar lt={l} size={isz * 0.9} />;
  const sweep = eO4(prog(l, 0.1, 0.5));
  return (
    <AbsoluteFill style={{background: s.bg}}>
      <Glow x="50%" y="50%" r={800} c={dark ? COL.turq : COL.turqHi} o={dark ? 0.3 : 0.35} />
      <Dust t={lt} seed={20 + i} color={dark ? COL.turqHi : COL.turq} n={30} />
      <AbsoluteFill style={{display: 'flex', flexDirection: v ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: v ? 40 : 90}}>
        <div style={{width: isz, height: v ? isz * 0.8 : isz * 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - eO4(prog(l, 0, 0.35))) * 40}px)`, opacity: prog(l, 0, 0.15)}}>{icon}</div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: v ? 'center' : 'flex-start', gap: 18}}>
          <Tag text={s.tag} lt={l} delay={0.05} bg={COL.magenta} size={v ? 28 : 30} />
          <Letters text={s.w} lt={l} delay={0.02} stag={0.022} size={v ? 250 : 270} color={txt} />
          <div style={{width: `${sweep * 100}%`, height: 14, borderRadius: 7, background: COL.magenta}} />
          <Sub text={s.sub} lt={l} delay={0.2} color={dark ? COL.cream : COL.ink} size={v ? 40 : 46} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── S3 · le tre Rooms ───────────── */
const ROOMS = [
  {n: 'HEALTH', t: 'Salute e prevenzione', c: COL.turq, ic: 'plus'},
  {n: 'WELLNESS', t: 'Equilibrio e benessere', c: COL.green, ic: 'leaf'},
  {n: 'BEAUTY', t: 'Viso, corpo e capelli', c: COL.magenta, ic: 'heart'},
];
const S3: React.FC<{lt: number}> = ({lt}) => {
  const {v} = useD();
  const beat = Math.pow(Math.abs(Math.sin(lt * Math.PI / B)), 6);
  const exit = eIO(prog(lt, 2.75, 3));
  return (
    <AbsoluteFill style={{background: COL.petrolDeep}}>
      <Dust t={lt} seed={31} n={30} />
      <AbsoluteFill style={{display: 'flex', flexDirection: v ? 'column' : 'row'}}>
        {ROOMS.map((r, i) => {
          const p = eO5(prog(lt, 0.1 + i * 0.22, 0.65 + i * 0.22));
          const hold = prog(lt, 0.9 + i * 0.12, 1.3 + i * 0.12);
          return (
            <div key={i} style={{flex: 1, position: 'relative', overflow: 'hidden', transform: v ? `translateX(${(1 - p) * -110 + exit * 110}%)` : `translateY(${(1 - p) * 110 - exit * 110}%)`}}>
              <div style={{position: 'absolute', inset: 0, background: r.c}} />
              <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 38%, rgba(255,255,255,.28), transparent 60%)`}} />
              <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: v ? 14 : 30}}>
                <div style={{transform: `scale(${eBack(hold, 1.5)})`, opacity: hold}}>
                  {r.ic === 'plus' ? <Plus size={v ? 150 : 200} /> : r.ic === 'leaf' ? <Leaf size={v ? 160 : 220} lt={lt} /> : <Heart size={v ? 150 : 200} beat={beat} color={COL.white} />}
                </div>
                <div style={{fontFamily: BEBAS, fontSize: v ? 150 : 150, lineHeight: 0.95, color: COL.white, letterSpacing: 3}}>{r.n}</div>
                <div style={{fontFamily: MONT, fontWeight: 800, fontSize: v ? 34 : 32, letterSpacing: 10, color: COL.white, opacity: 0.9}}>ROOM</div>
                <div style={{fontFamily: MONT, fontWeight: 600, fontSize: v ? 36 : 32, color: COL.white, textAlign: 'center', padding: '0 30px', opacity: hold, transform: `translateY(${(1 - hold) * 18}px)`}}>{r.t}</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── S4 · tre generazioni ───────────── */
const GEN = [
  {y: '1909', t: 'Lorenzo apre in Corso Garibaldi'},
  {y: '1968', t: 'Paolo: una sede più ampia'},
  {y: 'OGGI', t: 'Olga e Francesca tornano alle origini'},
];
const S4: React.FC<{lt: number}> = ({lt}) => {
  const {v} = useD();
  const line = eIO(prog(lt, 0.3, 2.1));
  return (
    <AbsoluteFill style={{background: COL.cream}}>
      <Glow x="50%" y="100%" r={1100} c={COL.turqHi} o={0.5} />
      <Dust t={lt} seed={44} color={COL.turq} n={26} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: v ? 60 : 50}}>
        <div style={{textAlign: 'center'}}>
          <Letters text="TRE GENERAZIONI" lt={lt} size={v ? 150 : 180} color={COL.petrol} stag={0.02} />
          <div style={{marginTop: 10}}>
            <Tag text="Un solo indirizzo" lt={lt} delay={0.35} size={v ? 30 : 32} />
          </div>
        </div>
        <div style={{position: 'relative', width: v ? 760 : 1500, height: v ? 760 : 330, display: 'flex', flexDirection: v ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{position: 'absolute', background: COL.petrol, ...(v ? {left: 38, top: 40, width: 8, height: `${line * 80}%`} : {top: 40, left: 40, height: 8, width: `${line * 94}%`}), borderRadius: 4}} />
          {GEN.map((g, i) => {
            const p = prog(lt, 0.5 + i * 0.6, 0.95 + i * 0.6);
            const e = eBack(p, 1.5);
            const last = i === 2;
            return (
              <div key={i} style={{display: 'flex', flexDirection: v ? 'row' : 'column', alignItems: 'center', gap: v ? 34 : 20, width: v ? '100%' : 460, opacity: clamp(p * 3), transform: `scale(${lerp(0.5, 1, clamp(e, 0, 1.1))})`}}>
                <div style={{width: 84, height: 84, borderRadius: 42, background: last ? COL.magenta : COL.petrol, border: `10px solid ${COL.cream}`, boxShadow: `0 0 0 6px ${last ? COL.magenta : COL.petrol}`, flexShrink: 0, ...(v ? {} : {})}} />
                <div style={{textAlign: v ? 'left' : 'center'}}>
                  <div style={{fontFamily: BEBAS, fontSize: v ? 150 : 160, lineHeight: 0.9, color: last ? COL.magenta : COL.petrol}}>{g.y}</div>
                  <div style={{fontFamily: MONT, fontWeight: 700, fontSize: v ? 38 : 36, color: COL.ink, maxWidth: v ? 620 : 440}}>{g.t}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── S5 · la promessa ───────────── */
const S5: React.FC<{lt: number}> = ({lt}) => {
  const {v} = useD();
  const lines = v ? ['TI DICIAMO', 'COSA POSSIAMO', 'FARE E COSA NO.'] : ['TI DICIAMO COSA POSSIAMO', 'FARE E COSA NO.'];
  const sz = v ? 190 : 210;
  const sempre = eBack(prog(lt, 1.05, 1.4), 1.8);
  return (
    <AbsoluteFill style={{background: COL.magenta}}>
      <Glow x="50%" y="50%" r={1000} c="#FF6FB4" o={0.55} />
      <Dust t={lt} seed={52} color="#FFD3E8" n={40} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
        {lines.map((l, i) => (
          <Letters key={i} text={l} lt={lt} delay={0.1 + i * 0.28} stag={0.018} size={sz} color={COL.white} />
        ))}
        <div style={{marginTop: 40, fontFamily: BEBAS, fontSize: v ? 250 : 270, lineHeight: 0.9, color: COL.petrolDark, transform: `scale(${lerp(0.4, 1, clamp(sempre, 0, 1.15))}) rotate(${(1 - clamp(sempre, 0, 1)) * -6}deg)`, opacity: clamp(sempre * 3)}}>SEMPRE.</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── S6 · chiusura + CTA ───────────── */
const S6: React.FC<{lt: number}> = ({lt}) => {
  const {v} = useD();
  const lit = prog(lt, 0.6, 0.8);
  const cta = eBack(prog(lt, 1.0, 1.35), 1.6);
  const sz = v ? 120 : 130;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 46%, ${COL.petrol} 0%, ${COL.petrolDark} 58%, ${COL.petrolDeep} 100%)`}}>
      <Glow x="50%" y="40%" r={900} c={COL.turq} o={0.35 + 0.25 * lit} />
      <Dust t={lt} seed={63} n={50} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: v ? 56 : 36}}>
        <Cross lt={lt} size={sz} lit={lit} />
        <div style={{textAlign: 'center'}}>
          <Letters text={v ? 'FARMACIA AFRICA' : INFO.name} lt={lt} delay={0.5} stag={0.02} size={v ? 150 : 150} />
          {v ? <Letters text="ORIENTALE" lt={lt} delay={0.7} stag={0.02} size={150} /> : null}
          <div style={{marginTop: 14}}>
            <Sub text={INFO.address} lt={lt} delay={0.95} size={v ? 42 : 40} color={COL.turqHi} weight={700} />
          </div>
        </div>
        <div style={{textAlign: 'center', opacity: clamp(cta * 3), transform: `scale(${lerp(0.7, 1, clamp(cta, 0, 1.1))})`}}>
          <div style={{display: 'inline-block', fontFamily: MONT, fontWeight: 800, fontSize: v ? 44 : 40, letterSpacing: 4, color: COL.white, background: COL.magenta, padding: '24px 56px', borderRadius: 100, boxShadow: `0 0 ${30 + 20 * Math.sin(lt * 8)}px rgba(236,7,119,.55)`}}>{INFO.cta}</div>
          <div style={{fontFamily: BEBAS, fontSize: v ? 96 : 90, color: COL.white, marginTop: 18, letterSpacing: 4}}>{INFO.phone}</div>
        </div>
        <Sub text={INFO.hours} lt={lt} delay={1.35} size={v ? 30 : 28} color={COL.cream} weight={500} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── montaggio ───────────── */
const WIPES = [COL.petrol, COL.turq, COL.magenta, COL.petrol, COL.turq, COL.magenta];
const SCENES = [S1, S2, S3, S4, S5, S6];

export const Movie: React.FC<{vertical: boolean; width: number; height: number}> = ({vertical, width, height}) => {
  const t = useCurrentFrame() / FPS;
  const si = SCENES.findIndex((_, i) => t >= SC[i] && t < SC[i + 1]);
  const i = si < 0 ? SCENES.length - 1 : si;
  const lt = t - SC[i];
  const S = SCENES[i];
  // punch sul taglio: leggero zoom che si assesta
  const punch = 1 + 0.045 * (1 - eO4(prog(lt, 0, 0.3)));
  return (
    <Ctx.Provider value={{W: width, H: height, v: vertical}}>
      <AbsoluteFill style={{background: COL.petrolDeep}}>
        <AbsoluteFill style={{transform: `scale(${punch})`}}>
          <S lt={lt} />
        </AbsoluteFill>
        {i > 0 ? <Wipe lt={lt} color={WIPES[i]} /> : null}
        <div style={{position: 'absolute', inset: 0, background: '#000', opacity: 1 - eO3(prog(t, 0, 0.35))}} />
      </AbsoluteFill>
    </Ctx.Provider>
  );
};
