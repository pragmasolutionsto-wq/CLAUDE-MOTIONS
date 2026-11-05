// Reel farmacista "caduta capelli stagionale": stessa pipeline di cambio stagione (base tagliata, sottotitoli Whisper, grafiche, clip Runway).
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BODY, HEAD, LOGO, MARK, MINT, PAYOFF, SAGE, TEAL, TEAL_DEEP, W, WHITE} from '../brand';
import {Backdrop, Line, TitleLine} from '../kit';
import {clamp, eBack, eElastic, eIO, eO3, eO5, lerp, prog} from '../util';
import E from './edit.json';

export const FPS = E.fps;
export const DURATION = E.total;
const SEG = E.segments;
const A = E.a;
const fr = (x: number) => Math.round(x * FPS); // confronti sempre a fotogrammi interi
const END_AT = A.endIn;

/* ------------------------------------------------------------------ girato */

// video base unico già tagliato a fotogramma (build_edit.py): qui solo l'inquadratura per segmento,
// che cambia di netto sul taglio per mascherare il jump cut
const FRAMING: [number, number, number][] = [
  [1.0, 1.04, 0], [1.1, 1.13, -30], [1.0, 1.03, 0], [1.08, 1.12, -30], [1.0, 1.04, 0], [1.12, 1.15, -40], [1.02, 1.06, 0], [1.1, 1.13, -30], [1.0, 1.04, 0],
];

const Footage: React.FC<{T: number}> = ({T}) => {
  const f = Math.round(T * FPS);
  let i = SEG.findIndex((s) => f >= fr(s.start) && f < fr(s.end));
  if (i < 0) i = SEG.length - 1;
  const s = SEG[i];
  const [z0, z1, dy] = FRAMING[i];
  const z = lerp(z0, z1, eIO(prog(T, s.start, s.end)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile('capelli/base.mp4')} muted
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translateY(${dy}px) scale(${z})`, transformOrigin: '50% 38%'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ sottotitoli */

const Captions: React.FC<{T: number; hide: boolean}> = ({T, hide}) => {
  const ph = E.phrases.find((p) => T >= p.s && T < p.e);
  if (!ph || hide) return null;
  const pin = eO5(prog(T, ph.s, ph.s + 0.18));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1530, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 14px',
      transform: `translateY(${(1 - pin) * 24}px) scale(${lerp(0.94, 1, pin)})`, opacity: pin}}>
      {ph.words.map((k) => {
        const w = E.words[k];
        const next = E.words[k + 1];
        const end = next && next.seg === w.seg ? next.s : w.e + 0.3;
        const now = T >= w.s - 0.03 && T < end - 0.03;
        const pop = eBack(prog(T, w.s - 0.04, w.s + 0.1), 2.4);
        const o = '#013F41';
        return (
          <span key={k} style={{
            fontFamily: HEAD, fontSize: 86, lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: 1, display: 'inline-block',
            color: now ? TEAL_DEEP : WHITE, background: now ? MINT : 'transparent', borderRadius: 16, padding: '0 14px',
            transform: `scale(${now ? lerp(0.92, 1.06, clamp(pop)) : 1})`,
            textShadow: now ? 'none' : `0 0 2px ${o}, 3px 3px 0 ${o}, -3px 3px 0 ${o}, 3px -3px 0 ${o}, -3px -3px 0 ${o}, 0 4px 0 ${o}, 0 10px 24px rgba(0,0,0,0.45)`,
            boxShadow: now ? '0 10px 24px rgba(1,40,40,0.35)' : 'none',
          }}>{w.w}</span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ pezzi grafici */

const Title: React.FC<{T: number; at: number; until: number; lines: Line[]; top?: number; stagger?: number}> = ({T, at, until, lines, top = 1150, stagger = 0.14}) => {
  if (T < at || T > until + 0.3) return null;
  const out = eO3(prog(T, until, until + 0.3));
  return (
    <div style={{position: 'absolute', left: 0, top, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: 1 - out, transform: `translateY(${-30 * out}px)`}}>
      {lines.map((l, i) => <TitleLine key={i} line={l} p={prog(T, at + i * stagger, at + i * stagger + 0.55)} />)}
    </div>
  );
};

const Chip: React.FC<{T: number; at: number; until: number; text: string; x?: number; y: number; wobble?: boolean}> = ({T, at, until, text, x, y, wobble}) => {
  if (T < at || T > until + 0.3) return null;
  const t = T - at;
  const out = prog(T, until, until + 0.3);
  const rot = wobble ? Math.sin(t * 7) * 5 * Math.exp(-t * 0.6) : 0;
  return (
    <div style={{position: 'absolute', left: x ?? 0, width: x === undefined ? W : undefined, top: y, display: 'flex', justifyContent: 'center',
      opacity: 1 - out}}>
      <div style={{transform: `scale(${eBack(prog(t, 0, 0.45), 2.4) * (1 - out * 0.2)}) rotate(${rot}deg)`, fontFamily: HEAD, fontSize: 64,
        color: TEAL, background: WHITE, border: `4px solid ${MINT}`, borderRadius: 26, padding: '6px 30px 2px', boxShadow: '0 12px 30px rgba(1,40,40,0.28)',
        opacity: clamp(prog(t, 0, 0.12) * 1.5)}}>
        {text}
      </div>
    </div>
  );
};

// cartello a schermo pieno sopra il girato (entra e esce a tendina dal basso)
const Panel: React.FC<{T: number; at: number; until: number; children: (t: number) => React.ReactNode}> = ({T, at, until, children}) => {
  const f = Math.round(T * FPS);
  if (f < fr(at) || f >= fr(until)) return null;
  const pin = eO5(prog(T, at, at + 0.4));
  const pout = 0; // uscita netta sul taglio
  const y = (1 - pin) * 1920 - pout * 1920;
  return (
    <AbsoluteFill style={{transform: `translateY(${y}px)`, borderRadius: pin < 1 || pout > 0 ? 60 : 0, overflow: 'hidden'}}>
      <Backdrop t={T} />
      {children(T - at)}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ grafica: ciclo del capello */

// follicolo stilizzato: bulbo + fusto che cresce / si ferma / cade
const Hair: React.FC<{phase: number; p: number}> = ({phase, p}) => {
  const len = phase === 0 ? lerp(30, 120, eO3(p)) : 120;
  const drop = phase === 2 ? eIO(p) * 90 : 0;
  const tilt = phase === 2 ? eIO(p) * 35 : 0;
  return (
    <svg viewBox="0 0 160 220" width={200} height={275}>
      <rect x={10} y={150} width={140} height={60} rx={20} fill={SAGE} opacity={0.55} />
      <path d="M10 150 H150" stroke={TEAL} strokeWidth={6} strokeLinecap="round" />
      <g transform={`translate(0 ${drop}) rotate(${tilt} 80 170)`}>
        <ellipse cx={80} cy={176} rx={16} ry={20} fill={phase === 1 ? MINT : TEAL} />
        <path d={`M80 160 Q${86} ${160 - len / 2} 80 ${160 - len}`} fill="none" stroke={TEAL_DEEP} strokeWidth={9} strokeLinecap="round" />
      </g>
      {phase === 1 && <text x={128} y={60} textAnchor="middle" fontFamily={HEAD} fontSize={40} fill={MINT} opacity={p}>Zz</text>}
    </svg>
  );
};

const CycleGfx: React.FC<{t: number; at: number[]}> = ({t, at}) => {
  const steps = ['CRESCE', 'SI FERMA', 'CADE'];
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 330, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TitleLine line={{text: 'IL CICLO', box: 'mint'}} p={prog(t, 0.1, 0.7)} />
        <TitleLine line={{text: 'DEL CAPELLO', box: 'teal'}} p={prog(t, 0.25, 0.85)} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 690, width: W, display: 'flex', justifyContent: 'center', gap: 24}}>
        {steps.map((s, i) => {
          const p = prog(t, at[i], at[i] + 0.5);
          const live = prog(t, at[i], at[i] + 1.4);
          return (
            <div key={s} style={{width: 310, height: 440, borderRadius: 40, background: WHITE, boxShadow: '0 18px 40px rgba(1,63,65,0.16)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: clamp(p * 3),
              transform: `translateY(${(1 - eBack(p, 2)) * 120}px) scale(${lerp(0.7, 1, eBack(p, 2))})`}}>
              <div style={{width: 64, height: 64, borderRadius: 32, background: TEAL, color: WHITE, fontFamily: HEAD, fontSize: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
              <Hair phase={i} p={live} />
              <div style={{fontFamily: HEAD, fontSize: 54, color: TEAL}}>{s}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ grafica: calendario */

const MONTHS = ['GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
const CalendarGfx: React.FC<{t: number; a: {luglio: number; mesi: number; settembre: number; aumenta: number}}> = ({t, a}) => {
  const rest = prog(t, a.luglio, a.luglio + 0.5);
  const arrow = eIO(prog(t, a.mesi, a.mesi + 1.0));
  const fall = prog(t, a.settembre, a.settembre + 0.5);
  const up = eBack(prog(t, a.aumenta, a.aumenta + 0.5), 2.2);
  const cw = 132, gap = 12, x0 = (W - (MONTHS.length * cw + (MONTHS.length - 1) * gap)) / 2;
  const cx = (i: number) => x0 + i * (cw + gap) + cw / 2;
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 330, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TitleLine line={{text: 'PERCHÉ', box: 'mint'}} p={prog(t, 0.1, 0.7)} />
        <TitleLine line={{text: 'IN AUTUNNO?', box: 'teal'}} p={prog(t, 0.25, 0.85)} />
      </div>
      {MONTHS.map((m, i) => {
        const p = prog(t, 0.4 + i * 0.06, 0.8 + i * 0.06);
        const isRest = i === 1 || i === 2, isFall = i >= 3 && i <= 5;
        const hi = isRest ? rest : isFall ? fall : 0;
        return (
          <div key={m} style={{position: 'absolute', left: x0 + i * (cw + gap), top: 760, width: cw, height: 170, borderRadius: 26,
            background: hi > 0 ? (isRest ? MINT : TEAL) : WHITE, boxShadow: '0 12px 28px rgba(1,63,65,0.14)', opacity: clamp(p * 2),
            transform: `translateY(${(1 - eO3(p)) * 60}px) scale(${1 + 0.08 * Math.sin(hi * Math.PI)})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontSize: 48,
            color: hi > 0 ? WHITE : TEAL}}>{m}</div>
        );
      })}
      <div style={{position: 'absolute', left: cx(1) - 60, top: 950, width: cx(2) - cx(1) + 120, textAlign: 'center', fontFamily: BODY, fontWeight: 800,
        fontSize: 34, color: TEAL, opacity: rest}}>RIPOSO</div>
      <svg width={W} height={300} style={{position: 'absolute', left: 0, top: 990, overflow: 'visible'}}>
        <path d={`M ${cx(2)} 20 C ${cx(2)} 140, ${cx(4)} 140, ${cx(4)} 30`} fill="none" stroke={MINT} strokeWidth={12} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arrow} />
        <path d={`M ${cx(4) - 26} 52 L ${cx(4)} 22 L ${cx(4) + 26} 52`} fill="none" stroke={MINT} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round"
          opacity={prog(arrow, 0.9, 1)} />
        <text x={(cx(2) + cx(4)) / 2} y={190} textAnchor="middle" fontFamily={HEAD} fontSize={56} fill={TEAL_DEEP} opacity={prog(arrow, 0.3, 0.7)}>+2-3 MESI</text>
      </svg>
      <div style={{position: 'absolute', left: 0, top: 1240, width: W, display: 'flex', justifyContent: 'center', opacity: clamp(up),
        transform: `scale(${up})`}}>
        <div style={{fontFamily: HEAD, fontSize: 70, color: WHITE, background: TEAL, borderRadius: 26, padding: '6px 34px 0'}}>CADUTA ↑</div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ grafica: tinte, phon, piastra */

const ToolIcon: React.FC<{k: number}> = ({k}) => {
  if (k === 0) return (<g><path d="M30 20 h40 l-6 22 h-28 Z" fill={TEAL} /><rect x={42} y={42} width={16} height={40} rx={6} fill={MINT} /></g>); // tinta (tubetto)
  if (k === 1) return (<g><circle cx={50} cy={50} r={30} fill={MINT} /><path d="M50 26 L56 44 L74 50 L56 56 L50 74 L44 56 L26 50 L44 44 Z" fill={WHITE} /></g>); // schiaritura
  if (k === 2) return (<g><rect x={18} y={28} width={52} height={30} rx={15} fill={TEAL} /><rect x={36} y={52} width={14} height={34} rx={6} fill={TEAL} />
    <path d="M74 36 q8 7 0 14 M84 32 q10 11 0 22" fill="none" stroke={MINT} strokeWidth={5} strokeLinecap="round" /></g>); // phon
  if (k === 3) return (<g><rect x={20} y={20} width={44} height={40} rx={14} fill={TEAL} /><rect x={36} y={56} width={12} height={32} rx={6} fill={TEAL} />
    {[28, 36, 44, 52].map((x) => <line key={x} x1={x} y1={28} x2={x} y2={52} stroke={WHITE} strokeWidth={3} />)}</g>); // spazzola
  return (<g><rect x={26} y={14} width={14} height={72} rx={7} fill={TEAL} transform="rotate(-8 33 50)" /><rect x={50} y={14} width={14} height={72} rx={7} fill={TEAL} transform="rotate(8 57 50)" />
    <path d="M20 40 q-8 -8 0 -16 M80 40 q8 -8 0 -16" fill="none" stroke={MINT} strokeWidth={5} strokeLinecap="round" /></g>); // piastra
};

const ToolsGfx: React.FC<{t: number; at: number[]; frag: number}> = ({t, at, frag}) => {
  const labels = ['TINTE', 'SCHIARITURE', 'PHON', 'SPAZZOLA', 'PIASTRA'];
  const pos = [[0, 0], [1, 0], [0, 1], [1, 1], [0.5, 2]];
  const pf = eBack(prog(t, frag, frag + 0.5), 2.2);
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 330, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TitleLine line={{text: 'ATTENZIONE A', box: 'mint'}} p={prog(t, 0.1, 0.7)} />
      </div>
      {labels.map((l, i) => {
        const p = prog(t, at[i], at[i] + 0.45);
        const [c, r] = pos[i];
        return (
          <div key={l} style={{position: 'absolute', left: 90 + c * 470, top: 520 + r * 250, width: 430, height: 210, borderRadius: 36, background: WHITE,
            boxShadow: '0 16px 36px rgba(1,63,65,0.16)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 26px', opacity: clamp(p * 3),
            transform: `scale(${lerp(0.6, 1, eBack(p, 2.4))}) rotate(${(1 - clamp(p)) * (i % 2 ? 8 : -8)}deg)`}}>
            <svg viewBox="0 0 100 100" width={130} height={130}><ToolIcon k={i} /></svg>
            <div style={{fontFamily: HEAD, fontSize: l.length > 8 ? 46 : 58, color: TEAL}}>{l}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, top: 1290, width: W, display: 'flex', justifyContent: 'center', opacity: clamp(pf), transform: `scale(${pf})`}}>
        <div style={{fontFamily: HEAD, fontSize: 64, color: WHITE, background: TEAL, borderRadius: 26, padding: '6px 34px 0'}}>FRAGILITÀ E ROTTURA</div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ grafica: quando approfondire */

const CheckGfx: React.FC<{t: number; at: number[]}> = ({t, at}) => {
  const items = ['DURA PIÙ DI 3 MESI', 'MALATTIE RECENTI', 'DIETE RESTRITTIVE', 'FORTE STRESS'];
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 330, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TitleLine line={{text: 'QUANDO', box: 'mint'}} p={prog(t, 0.1, 0.7)} />
        <TitleLine line={{text: 'APPROFONDIRE', box: 'teal'}} p={prog(t, 0.25, 0.85)} />
      </div>
      {items.map((l, i) => {
        const p = prog(t, at[i], at[i] + 0.45);
        const tick = eO3(prog(t, at[i] + 0.2, at[i] + 0.6));
        return (
          <div key={l} style={{position: 'absolute', left: 110, top: 690 + i * 165, width: W - 220, height: 135, borderRadius: 34, background: WHITE,
            boxShadow: '0 14px 32px rgba(1,63,65,0.15)', display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px', opacity: clamp(p * 3),
            transform: `translateX(${(1 - eO5(p)) * -200}px)`}}>
            <svg viewBox="0 0 100 100" width={86} height={86}>
              <circle cx={50} cy={50} r={44} fill={TEAL} />
              <path d="M28 52 L44 68 L74 36" fill="none" stroke={WHITE} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round"
                pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} />
            </svg>
            <div style={{fontFamily: HEAD, fontSize: 56, color: TEAL}}>{l}</div>
          </div>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ cartello finale */

const EndCard: React.FC<{T: number}> = ({T}) => {
  const t = T - END_AT;
  if (t < 0) return null;
  const r = eIO(prog(t, 0, 0.55)) * 1300;
  const pm = eElastic(prog(t, 0.15, 1.2));
  const pl = eO3(prog(t, 0.45, 0.95));
  const pp = eO3(prog(t, 0.8, 1.25));
  const pa = eO3(prog(t, 1.1, 1.55));
  const mh = 290, mw = (mh * MARK.w) / MARK.h, lw = 620;
  return (
    <AbsoluteFill style={{clipPath: `circle(${r}px at 50% 50%)`}}>
      <Backdrop t={T} />
      <div style={{position: 'absolute', left: W / 2 - 230, top: 300, width: 460, height: 460, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(92,192,168,0.32) 0%, rgba(92,192,168,0) 70%)', opacity: clamp(pm)}} />
      <Img src={staticFile(MARK.file)} style={{position: 'absolute', left: (W - mw) / 2, top: 380, width: mw, height: mh, transform: `scale(${pm})`}} />
      <Img src={staticFile(LOGO.file)} style={{position: 'absolute', left: (W - lw) / 2, top: 730, width: lw, height: (lw * LOGO.h) / LOGO.w,
        opacity: pl, transform: `translateY(${(1 - pl) * 30}px)`}} />
      <div style={{position: 'absolute', left: 0, top: 1020, width: W, display: 'flex', justifyContent: 'center', opacity: pp,
        transform: `scale(${lerp(0.85, 1, eBack(pp))})`}}>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 42, color: WHITE, background: TEAL, borderRadius: 44, padding: '18px 44px',
          boxShadow: '0 14px 30px rgba(1,63,65,0.25)'}}>{PAYOFF}</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 1150, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        opacity: pa, transform: `translateY(${(1 - pa) * 20}px)`, fontFamily: BODY, color: TEAL_DEEP}}>
        <div style={{fontWeight: 700, fontSize: 38}}>Corso Garibaldi 49 · Brindisi</div>
        <div style={{fontWeight: 800, fontSize: 38, color: TEAL, background: WHITE, border: `3px solid ${MINT}`, borderRadius: 34, padding: '10px 32px'}}>
          WhatsApp 328 837 3357
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ montaggio */

const Clip: React.FC<{src: string; a: number; b: number}> = ({src, a, b}) => (
  <Sequence from={fr(a)} durationInFrames={fr(b) - fr(a)}>
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(src)} muted playbackRate={Math.min(1, 6.08 / (b - a))} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,40,40,0) 50%, rgba(1,40,40,0.5) 100%)'}} />
    </AbsoluteFill>
  </Sequence>
);

export const Movie: React.FC = () => {
  const f = useCurrentFrame();
  const T = f / FPS;
  const logoO = 1 - prog(T, END_AT, END_AT + 0.3);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Footage T={T} />

      {/* clip Runway */}
      <Clip src="capelli/sun.mp4" a={A.sunIn} b={A.sunOut} />
      <Clip src="capelli/care.mp4" a={A.careIn} b={A.careOut} />

      <Panel T={T} at={A.cicloIn} until={A.calIn}>{(t) => <CycleGfx t={t} at={[A.cresce - A.cicloIn, A.ferma - A.cicloIn, A.cade - A.cicloIn]} />}</Panel>
      <Panel T={T} at={A.calIn} until={A.calOut}>{(t) => (
        <CalendarGfx t={t} a={{luglio: A.luglio - A.calIn, mesi: A.mesiDopo - A.calIn, settembre: A.settembre - A.calIn, aumenta: A.aumenta - A.calIn}} />
      )}</Panel>
      <Panel T={T} at={A.toolsIn} until={A.toolsOut}>{(t) => (
        <ToolsGfx t={t} at={[A.tinte, A.schiariture, A.phon, A.spazzola, A.piastra].map((x) => x - A.toolsIn)} frag={A.fragilita - A.toolsIn} />
      )}</Panel>
      <Panel T={T} at={A.checkIn} until={A.checkOut}>{(t) => <CheckGfx t={t} at={[A.treMesi, A.malattie, A.diete, A.stress].map((x) => x - A.checkIn)} />}</Panel>

      {/* titoli e chip: sotto il viso */}
      <Title T={T} at={0.1} until={2.9} lines={[{text: 'PERDI PIÙ', box: 'mint', size: 112}, {text: 'CAPELLI?', box: 'teal', size: 112}]} />
      <Chip T={T} at={A.stagionale} until={A.cicloIn - 0.3} text="CADUTA STAGIONALE" y={1230} />
      <Chip T={T} at={A.uv} until={A.sunOut - 0.3} text="RAGGI UV + CALORE" y={1250} />
      <Chip T={T} at={A.sunOut} until={A.toolsIn - 0.3} text="STRESS OSSIDATIVO" y={1230} />
      <Chip T={T} at={A.temporanea} until={A.dueTre - 0.2} text="TEMPORANEA" y={1230} />
      <Chip T={T} at={A.dueTre} until={A.checkIn - 0.3} text="SI RIDUCE IN 2-3 MESI" y={1230} />
      <Title T={T} at={A.consiglio - 0.1} until={A.careIn - 0.3} lines={[{text: 'COSA FARE', box: 'mint', size: 112}, {text: 'NEL FRATTEMPO', box: 'teal', size: 96}]} />
      <Chip T={T} at={A.detergenti} until={A.menoCalore - 0.2} text="DETERGENTI DELICATI" y={1250} />
      <Chip T={T} at={A.menoCalore} until={A.termo - 0.2} text="MENO CALORE DIRETTO" y={1250} />
      <Chip T={T} at={A.termo} until={A.careOut - 0.3} text="SEMPRE IL TERMOPROTETTORE" y={1250} />
      <Chip T={T} at={A.sostegno} until={A.vieni - 0.3} text="UN SOSTEGNO MIRATO" y={1230} />
      <Title T={T} at={A.vieni - 0.05} until={END_AT - 0.1} lines={[{text: 'PARLANE', box: 'mint', size: 112}, {text: 'CON NOI', box: 'teal', size: 112}]} />

      <Captions T={T} hide={T >= END_AT} />

      <div style={{position: 'absolute', left: 40, top: 70, width: 270, height: 120, borderRadius: 26, background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 10px 30px rgba(1,40,40,0.18)', opacity: logoO, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile(LOGO.file)} style={{width: 230, height: (230 * LOGO.h) / LOGO.w}} />
      </div>

      <EndCard T={T} />
    </AbsoluteFill>
  );
};
