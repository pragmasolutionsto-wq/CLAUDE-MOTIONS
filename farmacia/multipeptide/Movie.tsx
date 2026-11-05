// Reel farmacista "Attivo Multipeptide BTX 13%": stessa pipeline dei reel precedenti (base tagliata, sottotitoli Whisper, grafiche, clip Runway).
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
const FRAMING: [number, number, number][] = Array.from({length: 40}, (_, i) =>
  (i % 3 === 0 ? [1.0, 1.04, 0] : i % 3 === 1 ? [1.1, 1.13, -30] : [1.05, 1.08, -15]) as [number, number, number]);

const Footage: React.FC<{T: number}> = ({T}) => {
  const f = Math.round(T * FPS);
  let i = SEG.findIndex((s) => f >= fr(s.start) && f < fr(s.end));
  if (i < 0) i = SEG.length - 1;
  const s = SEG[i];
  const [z0, z1, dy] = FRAMING[i];
  const z = lerp(z0, z1, eIO(prog(T, s.start, s.end)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile('multipeptide/base.mp4')} muted
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

/* ------------------------------------------------------------------ grafica: il prodotto */

const Dropper: React.FC<{p: number}> = ({p}) => (
  <svg viewBox="0 0 120 220" width={190} height={348} style={{transform: `translateY(${(1 - eBack(p, 1.8)) * 80}px)`, opacity: clamp(p * 3)}}>
    <rect x={44} y={6} width={32} height={46} rx={12} fill={TEAL_DEEP} />
    <rect x={38} y={48} width={44} height={22} rx={6} fill={TEAL} />
    <rect x={18} y={68} width={84} height={140} rx={26} fill="#B4642A" />
    <rect x={26} y={80} width={14} height={110} rx={7} fill={WHITE} opacity={0.35} />
    <rect x={30} y={112} width={60} height={56} rx={10} fill={WHITE} opacity={0.92} />
    <rect x={40} y={126} width={40} height={8} rx={4} fill={MINT} /><rect x={40} y={142} width={28} height={8} rx={4} fill={SAGE} />
  </svg>
);

const ProductGfx: React.FC<{t: number; btx: number}> = ({t, btx}) => {
  const pc = eO3(prog(t, btx, btx + 1.2));
  const pb = eBack(prog(t, btx, btx + 0.5), 2);
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 330, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TitleLine line={{text: 'NOVITÀ', box: 'mint'}} p={prog(t, 0.1, 0.7)} />
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 38, letterSpacing: 4, color: TEAL, marginTop: 10, opacity: prog(t, 0.4, 0.9)}}>FARMACISTI PREPARATORI</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 560, width: W, display: 'flex', justifyContent: 'center'}}><Dropper p={prog(t, 0.5, 1.3)} /></div>
      <div style={{position: 'absolute', left: 0, top: 960, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: clamp(pb),
        transform: `scale(${lerp(0.8, 1, pb)})`}}>
        <div style={{fontFamily: HEAD, fontSize: 92, color: TEAL, lineHeight: 1.05}}>ATTIVO MULTIPEPTIDE</div>
        <div style={{marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 22, background: TEAL, borderRadius: 30, padding: '8px 40px 2px'}}>
          <span style={{fontFamily: HEAD, fontSize: 110, color: WHITE}}>BTX</span>
          <span style={{fontFamily: HEAD, fontSize: 150, color: MINT}}>{Math.round(13 * pc)}%</span>
        </div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ grafica: peptidi */

const PeptGfx: React.FC<{t: number; at: number[]}> = ({t, at}) => {
  const nodes = [[160, 260], [300, 170], [440, 250], [580, 160], [720, 240], [860, 150]];
  const draw = eIO(prog(t, at[0] - 0.2, at[0] + 1.4));
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 330, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TitleLine line={{text: 'PEPTIDI', box: 'mint'}} p={prog(t, 0.1, 0.7)} />
        <TitleLine line={{text: 'MULTI-AZIONE', box: 'teal'}} p={prog(t, 0.25, 0.85)} />
      </div>
      <svg width={W} height={420} style={{position: 'absolute', left: 0, top: 640}}>
        <polyline points={nodes.map((n) => n.join(',')).join(' ')} fill="none" stroke={SAGE} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        {nodes.map(([x, y], i) => {
          const p = eBack(prog(draw, i / nodes.length, i / nodes.length + 0.2), 2.4);
          return <circle key={i} cx={x} cy={y + Math.sin(t * 2 + i) * 6} r={38 * clamp(p, 0, 1.2)} fill={i % 2 ? TEAL : MINT} stroke={WHITE} strokeWidth={8} />;
        })}
      </svg>
      {['RUGHE D\'ESPRESSIONE', 'LINEE SOTTILI'].map((l, i) => {
        const p = eBack(prog(t, at[i + 1], at[i + 1] + 0.45), 2.4);
        return (
          <div key={l} style={{position: 'absolute', left: 0, top: 1080 + i * 130, width: W, display: 'flex', justifyContent: 'center', opacity: clamp(p * 2)}}>
            <div style={{transform: `scale(${p})`, fontFamily: HEAD, fontSize: 66, color: i ? TEAL : WHITE, background: i ? WHITE : TEAL, border: `4px solid ${MINT}`,
              borderRadius: 26, padding: '6px 34px 0', boxShadow: '0 12px 30px rgba(1,63,65,0.2)'}}>{l}</div>
          </div>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ grafica: più livelli */

const LayersGfx: React.FC<{t: number; at: number[]}> = ({t, at}) => {
  const items = ['DISTENDE LA PELLE', 'TONO ED ELASTICITÀ', 'EFFETTO TENSORE'];
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 330, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TitleLine line={{text: 'AGISCE SU', box: 'mint'}} p={prog(t, 0.1, 0.7)} />
        <TitleLine line={{text: 'PIÙ LIVELLI', box: 'teal'}} p={prog(t, 0.25, 0.85)} />
      </div>
      {items.map((l, i) => {
        const p = prog(t, at[i], at[i] + 0.5);
        return (
          <div key={l} style={{position: 'absolute', left: 120 + i * 30, top: 690 + i * 190, width: W - 240 - i * 60, height: 160, borderRadius: 36,
            background: i === 2 ? TEAL : WHITE, boxShadow: '0 16px 36px rgba(1,63,65,0.18)', display: 'flex', alignItems: 'center', gap: 26, padding: '0 36px',
            opacity: clamp(p * 3), transform: `translateY(${(1 - eBack(p, 1.8)) * 80}px)`}}>
            <div style={{width: 76, height: 76, borderRadius: 38, background: i === 2 ? MINT : TEAL, color: WHITE, fontFamily: HEAD, fontSize: 46,
              display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
            <div style={{fontFamily: HEAD, fontSize: 58, color: i === 2 ? WHITE : TEAL}}>{l}</div>
          </div>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ grafica: test strumentali */

const Stat: React.FC<{p: number; n: number; label: string}> = ({p, n, label}) => (
  <div style={{width: 400, height: 330, borderRadius: 40, background: WHITE, boxShadow: '0 18px 40px rgba(1,63,65,0.16)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', opacity: clamp(p * 3), transform: `scale(${lerp(0.7, 1, eBack(clamp(p), 2))})`}}>
    <div style={{fontFamily: HEAD, fontSize: 170, color: TEAL, lineHeight: 1}}>{Math.round(n * eO3(clamp(p)))}</div>
    <div style={{fontFamily: HEAD, fontSize: 56, color: MINT, marginTop: 6}}>{label}</div>
  </div>
);

const TestGfx: React.FC<{t: number; at: number[]}> = ({t, at}) => {
  const pr = eO3(prog(t, at[1] + 0.6, at[1] + 1.2));
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 330, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TitleLine line={{text: 'TEST', box: 'mint'}} p={prog(t, 0.1, 0.7)} />
        <TitleLine line={{text: 'STRUMENTALI', box: 'teal'}} p={prog(t, 0.25, 0.85)} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 690, width: W, display: 'flex', justifyContent: 'center', gap: 40}}>
        <Stat p={prog(t, at[0], at[0] + 1.0)} n={20} label="SOGGETTI" />
        <Stat p={prog(t, at[1], at[1] + 1.0)} n={15} label="MINUTI" />
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 1070, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 44, color: TEAL_DEEP,
        opacity: pr, transform: `translateY(${(1 - pr) * 20}px)`}}>
        ↓ volume e profondità delle rughe del contorno occhi
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 1200, textAlign: 'center', fontFamily: BODY, fontWeight: 600, fontSize: 28, color: TEAL_DEEP,
        opacity: pr * 0.8}}>Dati dichiarati dal produttore. Effetto cosmetico, risultati variabili.</div>
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

const Clip: React.FC<{src: string; a: number; b: number; len?: number}> = ({src, a, b, len = 5.0}) => (
  <Sequence from={fr(a)} durationInFrames={fr(b) - fr(a)}>
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(src)} muted playbackRate={Math.min(1, len / (b - a))} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,40,40,0) 50%, rgba(1,40,40,0.5) 100%)'}} />
    </AbsoluteFill>
  </Sequence>
);

export const Movie: React.FC = () => {
  const f = useCurrentFrame();
  const T = f / FPS;
  const logoO = 1 - prog(T, END_AT, END_AT + 0.3);
  const t112 = (x: string) => ({text: x, box: 'mint' as const, size: 112});
  const T112 = (x: string) => ({text: x, box: 'teal' as const, size: 112});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Footage T={T} />

      {/* clip Runway */}
      <Clip src="multipeptide/mirror.mp4" a={A.mirrorIn} b={A.mirrorOut} />
      <Clip src="multipeptide/serum.mp4" a={A.careIn} b={A.careOut} />

      <Panel T={T} at={A.prodIn} until={A.prodOut}>{(t) => <ProductGfx t={t} btx={A.btx - A.prodIn} />}</Panel>
      <Panel T={T} at={A.peptIn} until={A.peptOut}>{(t) => <PeptGfx t={t} at={[A.peptidi, A.rughe, A.sottili].map((x) => x - A.peptIn)} />}</Panel>
      <Panel T={T} at={A.layIn} until={A.layOut}>{(t) => <LayersGfx t={t} at={[A.distendere, A.tono, A.tensore].map((x) => x - A.layIn)} />}</Panel>
      <Panel T={T} at={A.testIn} until={A.testOut}>{(t) => <TestGfx t={t} at={[A.venti, A.minuti].map((x) => x - A.testIn)} />}</Panel>

      {/* titoli e chip: sotto il viso */}
      <Title T={T} at={0.1} until={A.mirrorIn - 0.3} lines={[t112('PELLE MENO'), T112('DISTESA?')]} />
      <Chip T={T} at={A.occhi} until={A.labbra - 0.15} text="INTORNO AGLI OCCHI" y={1250} />
      <Chip T={T} at={A.labbra} until={A.fronte - 0.15} text="LABBRA" y={1250} />
      <Chip T={T} at={A.fronte} until={A.mirrorOut - 0.3} text="FRONTE" y={1250} />
      <Chip T={T} at={A.normale} until={A.tonica - 1.5} text="È NORMALE" y={1230} />
      <Chip T={T} at={A.tonica} until={A.elastica - 0.15} text="PIÙ TONICA" y={1230} />
      <Chip T={T} at={A.elastica} until={A.levigata - 0.15} text="PIÙ ELASTICA" y={1230} />
      <Chip T={T} at={A.levigata} until={A.stravolgere - 0.4} text="PIÙ LEVIGATA" y={1230} />
      <Title T={T} at={A.stravolgere - 0.1} until={A.prodIn - 0.3} lines={[t112('SENZA STRAVOLGERE'), T112('IL TUO VISO')]} />
      <Chip T={T} at={A.botox} until={A.medico - 0.25} text="EFFETTO BOTOX-LIKE" y={1230} />
      <Chip T={T} at={A.medico} until={A.come - 0.3} text="NON È UN TRATTAMENTO MEDICO" y={1230} />
      <Title T={T} at={A.come - 0.05} until={A.careIn - 0.3} lines={[t112('COME'), T112('SI USA')]} />
      <Chip T={T} at={A.gocce} until={A.mattina - 0.15} text="2-3 GOCCE · PELLE PULITA" y={1250} />
      <Chip T={T} at={A.mattina} until={A.careOut - 0.3} text="MATTINA E SERA" y={1250} />
      <Chip T={T} at={A.careOut} until={A.vieni - 0.3} text="OPPURE NELLA TUA CREMA" y={1230} />
      <Title T={T} at={A.vieni - 0.05} until={END_AT - 0.1} lines={[t112('PARLANE'), T112('CON NOI')]} />

      <Captions T={T} hide={T >= END_AT} />

      <div style={{position: 'absolute', left: 40, top: 70, width: 270, height: 120, borderRadius: 26, background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 10px 30px rgba(1,40,40,0.18)', opacity: logoO, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile(LOGO.file)} style={{width: 230, height: (230 * LOGO.h) / LOGO.w}} />
      </div>

      <EndCard T={T} />
    </AbsoluteFill>
  );
};
