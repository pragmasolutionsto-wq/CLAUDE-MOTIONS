// Reel farmacista "cambio stagione": girato tagliato + sottotitoli parola per parola + grafiche brand + clip Runway.
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
  [1.0, 1.05, 0], [1.1, 1.13, -40], [1.2, 1.22, -70], [1.0, 1.0, 0], [1.06, 1.09, -30], [1.0, 1.04, 0], [1.12, 1.15, -50],
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
      <OffthreadVideo src={staticFile('cambio/base.mp4')} muted
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
    <div style={{position: 'absolute', left: 60, right: 60, top: 1440, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 14px',
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

const Title: React.FC<{T: number; at: number; until: number; lines: Line[]; top?: number; stagger?: number}> = ({T, at, until, lines, top = 1010, stagger = 0.14}) => {
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

/* ------------------------------------------------------------------ grafica: ora solare */

const ClockGfx: React.FC<{t: number}> = ({t}) => {
  const rew = eIO(prog(t, 0.5, 2.6));
  const hm = lerp(0, -360, rew), hh = lerp(90, 60, rew);
  const arc = (a0: number, a1: number, r: number) => {
    const p = (a: number) => `${200 + r * Math.sin((a * Math.PI) / 180)} ${200 - r * Math.cos((a * Math.PI) / 180)}`;
    return `M ${p(a0)} A ${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 0 ${p(a1)}`;
  };
  const s = eBack(prog(t, 0, 0.6), 1.8);
  return (
    <>
      <div style={{position: 'absolute', left: (W - 640) / 2, top: 330, width: 640, height: 640, transform: `scale(${s})`}}>
        <svg viewBox="0 0 400 400" width="100%" height="100%" style={{overflow: 'visible'}}>
          <circle cx={200} cy={210} r={170} fill={TEAL_DEEP} opacity={0.12} />
          <circle cx={200} cy={200} r={170} fill={MINT} />
          <circle cx={200} cy={200} r={146} fill={WHITE} />
          {rew > 0.02 && <path d={arc(90, lerp(90, 60, rew), 120)} fill="none" stroke={MINT} strokeWidth={34} strokeLinecap="round" opacity={0.55} />}
          {Array.from({length: 12}, (_, i) => (
            <line key={i} x1={200} y1={66} x2={200} y2={i % 3 ? 78 : 88} stroke={i % 3 ? SAGE : TEAL} strokeWidth={i % 3 ? 5 : 8} strokeLinecap="round" transform={`rotate(${i * 30} 200 200)`} />
          ))}
          <line x1={200} y1={200} x2={200} y2={128} stroke={TEAL_DEEP} strokeWidth={13} strokeLinecap="round" transform={`rotate(${hh} 200 200)`} />
          <line x1={200} y1={200} x2={200} y2={92} stroke={TEAL} strokeWidth={8} strokeLinecap="round" transform={`rotate(${hm} 200 200)`} />
          <circle cx={200} cy={200} r={13} fill={TEAL_DEEP} />
          <g transform={`translate(340 330) scale(${eElastic(prog(t, 2.2, 3.2))})`}>
            <circle r={58} fill={TEAL} stroke={WHITE} strokeWidth={8} />
            <text x={0} y={20} textAnchor="middle" fontFamily={HEAD} fontSize={56} fill={WHITE}>-1H</text>
          </g>
        </svg>
      </div>
      <div style={{position: 'absolute', left: 0, top: 1010, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TitleLine line={{text: 'ORA', box: 'mint'}} p={prog(t, 0.2, 0.8)} />
        <TitleLine line={{text: 'SOLARE', box: 'teal'}} p={prog(t, 0.35, 0.95)} />
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ grafica: rimedi naturali */

const Moon = () => <path d="M60 14 A40 40 0 1 0 86 74 A32 32 0 1 1 60 14 Z" fill={TEAL} />;
const Cup = () => (
  <g>
    <path d="M18 44 H78 V62 A28 28 0 0 1 18 62 Z" fill={TEAL} />
    <path d="M78 50 h8 a10 10 0 0 1 0 20 h-10" fill="none" stroke={TEAL} strokeWidth={7} />
    <path d="M36 34 q-6 -10 0 -18 M50 34 q-6 -10 0 -18 M64 34 q-6 -10 0 -18" fill="none" stroke={MINT} strokeWidth={6} strokeLinecap="round" />
  </g>
);
const Smile = () => (
  <g>
    <circle cx={50} cy={50} r={38} fill={TEAL} />
    <circle cx={37} cy={42} r={5} fill={WHITE} /><circle cx={63} cy={42} r={5} fill={WHITE} />
    <path d="M32 58 Q50 76 68 58" fill="none" stroke={WHITE} strokeWidth={7} strokeLinecap="round" />
  </g>
);
const Leaf: React.FC<{p: number}> = ({p}) => (
  <svg viewBox="0 0 100 100" width={170} height={170} style={{transform: `scale(${eBack(p, 2)}) rotate(${lerp(-30, 0, p)}deg)`}}>
    <path d="M18 82 C18 40 46 14 88 14 C88 58 62 84 18 82 Z" fill={MINT} />
    <path d="M22 78 C40 60 56 44 78 26" fill="none" stroke={TEAL} strokeWidth={6} strokeLinecap="round" />
  </svg>
);

const RemedyCard: React.FC<{p: number; label: string; icon: React.ReactNode}> = ({p, label, icon}) => (
  <div style={{width: 290, height: 330, borderRadius: 40, background: WHITE, boxShadow: '0 18px 40px rgba(1,63,65,0.18)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: clamp(p * 3),
    transform: `translateY(${(1 - eBack(p, 2)) * 120}px) scale(${lerp(0.7, 1, eBack(p, 2))})`}}>
    <svg viewBox="0 0 100 100" width={140} height={140}>{icon}</svg>
    <div style={{fontFamily: HEAD, fontSize: 52, color: TEAL}}>{label}</div>
  </div>
);

const RemediesGfx: React.FC<{t: number; at: number[]}> = ({t, at}) => (
  <>
    <div style={{position: 'absolute', left: 0, top: 340, width: W, display: 'flex', justifyContent: 'center'}}>
      <Leaf p={prog(t, 0, 0.6)} />
    </div>
    <div style={{position: 'absolute', left: 0, top: 540, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <TitleLine line={{text: 'RIMEDI', box: 'mint'}} p={prog(t, 0.15, 0.75)} />
      <TitleLine line={{text: 'NATURALI', box: 'teal'}} p={prog(t, 0.3, 0.9)} />
    </div>
    <div style={{position: 'absolute', left: 0, top: 930, width: W, display: 'flex', justifyContent: 'center', gap: 30}}>
      <RemedyCard p={prog(t, at[0], at[0] + 0.55)} label="SONNO" icon={<Moon />} />
      <RemedyCard p={prog(t, at[1], at[1] + 0.55)} label="DIGESTIONE" icon={<Cup />} />
      <RemedyCard p={prog(t, at[2], at[2] + 0.55)} label="UMORE" icon={<Smile />} />
    </div>
  </>
);

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

export const Movie: React.FC = () => {
  const f = useCurrentFrame();
  const T = f / FPS;
  const inYawn = f >= fr(A.yawnIn) && f < fr(A.yawnOut);
  const logoO = 1 - prog(T, END_AT, END_AT + 0.3);
  const yawnRate = 6.08 / (A.yawnOut - A.yawnIn);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Footage T={T} />

      {/* clip Runway: sonnolenza (copre esattamente il segmento, taglio netto in entrata e in uscita) */}
      <Sequence from={fr(A.yawnIn)} durationInFrames={fr(A.yawnOut) - fr(A.yawnIn)}>
        <AbsoluteFill>
          <OffthreadVideo src={staticFile('cambio/yawn.mp4')} muted playbackRate={yawnRate} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
      </Sequence>
      {inYawn && <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,40,40,0) 50%, rgba(1,40,40,0.5) 100%)'}} />}

      <Panel T={T} at={A.clockIn} until={A.clockOut}>{(t) => <ClockGfx t={t} />}</Panel>
      <Panel T={T} at={A.remIn} until={A.remOut}>{(t) => <RemediesGfx t={t} at={[A.sonno - A.remIn, A.digestione - A.remIn, A.tono - A.remIn]} />}</Panel>

      {/* titoli e chip: sempre sotto il viso, mai sopra */}
      <Title T={T} at={0.1} until={SEG[0].start + 2.4} lines={[{text: 'TI SENTI', box: 'mint'}, {text: 'SCARICO?', box: 'teal'}]} />
      <Chip T={T} at={A.cambio} until={A.fuoriFase1 - 0.4} text="CAMBIO DI STAGIONE" y={1060} />
      <Chip T={T} at={A.fuoriFase1} until={SEG[1].end - 0.35} text="FUORI FASE" y={1060} wobble />
      <Title T={T} at={A.yawnIn + 0.02} until={A.yawnOut - 0.35} top={1030} lines={[{text: 'SONNOLENZA!', box: 'teal', size: 140}]} />
      <Chip T={T} at={A.umore} until={A.concentr - 0.3} text="UMORE SU E GIÙ" y={1250} wobble />
      <Chip T={T} at={A.concentr} until={A.yawnOut - 0.35} text="POCA CONCENTRAZIONE" y={1250} />
      <Title T={T} at={A.buona - 0.05} until={SEG[4].end - 0.35} lines={[{text: 'LA BUONA', box: 'mint'}, {text: 'NOTIZIA', box: 'teal'}]} />
      <Chip T={T} at={A.abitudini} until={A.remIn - 0.3} text="SANE ABITUDINI" y={1060} />
      <Chip T={T} at={A.fuoriFase2} until={A.vienici - 0.35} text="FUORI FASE?" y={1060} wobble />
      <Title T={T} at={A.vienici - 0.05} until={END_AT - 0.1} lines={[{text: 'VIENICI', box: 'mint'}, {text: 'A TROVARE', box: 'teal'}]} />

      <Captions T={T} hide={T >= END_AT} />

      <div style={{position: 'absolute', left: (W - 340) / 2, top: 96, width: 340, height: 150, borderRadius: 30, background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 10px 30px rgba(1,40,40,0.18)', opacity: logoO, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile(LOGO.file)} style={{width: 290, height: (290 * LOGO.h) / LOGO.w}} />
      </div>

      <EndCard T={T} />
    </AbsoluteFill>
  );
};
