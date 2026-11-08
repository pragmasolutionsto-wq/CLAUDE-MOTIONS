// Reel animato Goovi Splash Me Baby: clip 3D Runway a tutto schermo, testi nello stile card della farmacia, prodotti reali, voce Runway.
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BODY, HEAD, LOGO, MARK, MINT, PAYOFF, TEAL, TEAL_DEEP, W, WHITE} from '../brand';
import {Backdrop, Label, Line, TitleLine} from '../kit';
import {clamp, eBack, eElastic, eIO, eO3, eO5, lerp, prog} from '../util';
import TL from './timeline.json';

export const FPS = TL.fps;
export const DURATION = TL.total;
const S = Object.fromEntries(TL.scenes.map((s) => [s.id, s])) as Record<string, (typeof TL.scenes)[number]>;

type Card = {clip?: string; label?: string; title: Line[]; body?: string; note?: boolean; textTop?: number};
const CARDS: Record<string, Card> = {
  hook: {clip: 'c01', title: [{text: 'LA TUA PELLE HA', box: 'mint', size: 100}, {text: 'BISOGNO DI IDRATAZIONE?', box: 'teal', size: 84}]},
  bisogno: {clip: 'c02', title: [{text: 'IN AUTUNNO', box: 'teal'}],
    body: 'Vento, sbalzi di temperatura e riscaldamenti: la pelle chiede **più idratazione**'},
  routine: {clip: 'c03', label: 'GOOVI', title: [{text: 'SPLASH ME BABY', box: 'teal', size: 116}],
    body: '**3 passaggi** per una pelle idratata **fino a 100 ore***', note: true},
  maschera: {clip: 'c04', label: 'STEP 1', title: [{text: 'MASCHERA', box: 'mint'}, {text: 'DETERGENTE', box: 'teal'}],
    body: 'Strucca e idrata: **da gel diventa latte**'},
  tonico: {clip: 'c05', label: 'STEP 2', title: [{text: 'TONICO MIST', box: 'teal'}], body: 'Una **nuvola di freschezza**, anche fuori casa'},
  crema: {clip: 'c06', label: 'STEP 3', title: [{text: 'CREMA VISO', box: 'mint'}, {text: 'IN GEL', box: 'teal'}],
    body: 'Pelle più **rimpolpata e luminosa**, senza appesantire', note: true},
  ingredienti: {clip: 'c07', title: [{text: 'OLTRE IL 98%', box: 'teal', size: 130}, {text: 'ORIGINE NATURALE', box: 'mint', size: 96}],
    body: 'Ingredienti di origine naturale, **nel rispetto della barriera cutanea**'},
  farmacia: {clip: 'c09', title: [{text: 'IN ESCLUSIVA', box: 'mint'}, {text: 'DA NOI A BRINDISI', box: 'teal', size: 104}],
    body: 'Ti aiutiamo a scegliere **la tua routine**'},
};

/* ------------------------------------------------------------------ pezzi */

const Panel: React.FC<{text: string; p: number}> = ({text, p}) => {
  const parts = text.split('**');
  return (
    <div style={{marginTop: 20, maxWidth: 900, padding: '20px 34px', borderRadius: 28, background: 'rgba(255,255,255,0.94)',
      boxShadow: '0 16px 40px rgba(1,40,40,0.25)', fontFamily: BODY, fontWeight: 600, fontSize: 42, lineHeight: 1.3, color: TEAL_DEEP,
      textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${lerp(0.96, 1, p)})`}}>
      {parts.map((s, i) => (i % 2 ? <span key={i} style={{color: TEAL, fontWeight: 800}}>{s}</span> : <span key={i}>{s}</span>))}
    </div>
  );
};

const CardScene: React.FC<{id: string; D: number}> = ({id, D}) => {
  const t = useCurrentFrame() / FPS;
  const c = CARDS[id];
  const base = c.label ? 0.3 : 0.15;
  const textOut = 1 - prog(t, D - 0.2, D);
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(`goovi/${c.clip}.mp4`)} muted playbackRate={Math.min(1, 5.0 / D)}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${lerp(1.0, 1.06, eIO(prog(t, 0, D)))})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,40,40,0.15) 0%, rgba(1,40,40,0) 16%, rgba(1,40,40,0) 52%, rgba(1,40,40,0.45) 100%)'}} />
      <div style={{position: 'absolute', left: 0, top: c.textTop ?? 1120, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: textOut}}>
        {c.label && <Label text={c.label} t={t} at={0.1} solid />}
        {c.title.map((l, i) => <TitleLine key={i} line={l} p={prog(t, base + i * 0.14, base + i * 0.14 + 0.55)} />)}
        {c.body && <Panel text={c.body} p={eO3(prog(t, base + 0.7, base + 1.2))} />}
      </div>
      {c.note && (
        <div style={{position: 'absolute', left: 0, top: 1740, width: W, textAlign: 'center', fontFamily: BODY, fontWeight: 600, fontSize: 24,
          color: WHITE, opacity: prog(t, 1.0, 1.4) * textOut, textShadow: '0 2px 6px rgba(0,0,0,0.5)'}}>*Dato dichiarato dal produttore</div>
      )}
    </AbsoluteFill>
  );
};

// i prodotti veri su fondo brand, con gocce che salgono
const ProductScene: React.FC<{D: number}> = ({D}) => {
  const t = useCurrentFrame() / FPS;
  const pIn = eBack(prog(t, 0.1, 0.8), 1.6);
  const steps = ['1 MASCHERA', '2 TONICO', '3 CREMA'];
  const drops = Array.from({length: 14}, (_, i) => {
    const x = 80 + ((i * 137) % 920), sp = 0.12 + (i % 5) * 0.03, ph = (i * 0.37) % 1;
    const y = 1900 - (((t * sp + ph) % 1) * 2100);
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: 18 + (i % 3) * 8, height: 24 + (i % 3) * 10,
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: 'rgba(92,192,168,0.35)', border: '2px solid rgba(255,255,255,0.7)'}} />;
  });
  return (
    <AbsoluteFill>
      <Backdrop t={t + 20} />
      {drops}
      <div style={{position: 'absolute', left: 0, top: 300, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TitleLine line={{text: 'LA ROUTINE', box: 'mint'}} p={prog(t, 0.05, 0.6)} />
        <TitleLine line={{text: 'COMPLETA', box: 'teal'}} p={prog(t, 0.2, 0.75)} />
      </div>
      <div style={{position: 'absolute', left: 60, top: 640, width: W - 120, height: 640, borderRadius: 50, overflow: 'hidden', background: WHITE,
        boxShadow: '0 30px 70px rgba(1,63,65,0.25)', border: `5px solid ${MINT}`, opacity: clamp(pIn * 2),
        transform: `translateY(${(1 - clamp(pIn, 0, 1.2)) * 200}px) scale(${lerp(0.85, 1, clamp(pIn, 0, 1.1))})`}}>
        <Img src={staticFile('goovi/linea.png')} style={{width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${lerp(1.04, 1.12, eIO(prog(t, 0, D)))})`}} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 1340, width: W, display: 'flex', justifyContent: 'center', gap: 16}}>
        {steps.map((s, i) => {
          const p = eBack(prog(t, 0.6 + i * 0.25, 1.0 + i * 0.25), 2.4);
          return <div key={s} style={{fontFamily: HEAD, fontSize: 52, color: i % 2 ? WHITE : TEAL, background: i % 2 ? TEAL : WHITE,
            border: `4px solid ${MINT}`, borderRadius: 24, padding: '4px 26px 0', opacity: clamp(p * 2), transform: `scale(${clamp(p, 0, 1.2)})`}}>{s}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const EndScene: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const pm = eElastic(prog(t, 0.1, 1.2));
  const pl = eO3(prog(t, 0.5, 1.0));
  const pp = eO3(prog(t, 0.9, 1.4));
  const pa = eO3(prog(t, 1.2, 1.7));
  const mh = 300, mw = (mh * MARK.w) / MARK.h, lw = 620;
  return (
    <AbsoluteFill>
      <Backdrop t={t + 40} />
      <div style={{position: 'absolute', left: W / 2 - 230, top: 300, width: 460, height: 460, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(92,192,168,0.32) 0%, rgba(92,192,168,0) 70%)', opacity: clamp(pm)}} />
      <Img src={staticFile(MARK.file)} style={{position: 'absolute', left: (W - mw) / 2, top: 380, width: mw, height: mh, transform: `scale(${pm})`}} />
      <Img src={staticFile(LOGO.file)} style={{position: 'absolute', left: (W - lw) / 2, top: 730, width: lw, height: (lw * LOGO.h) / LOGO.w,
        opacity: pl, transform: `translateY(${(1 - pl) * 30}px)`}} />
      <div style={{position: 'absolute', left: 0, top: 1020, width: W, display: 'flex', justifyContent: 'center', opacity: pp,
        transform: `scale(${lerp(0.85, 1, eBack(pp))})`}}>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 42, color: WHITE, background: TEAL, borderRadius: 44, padding: '18px 44px'}}>{PAYOFF}</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 1150, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        opacity: pa, fontFamily: BODY, color: TEAL_DEEP}}>
        <div style={{fontWeight: 700, fontSize: 38}}>Corso Garibaldi 49 · Brindisi</div>
        <div style={{fontWeight: 800, fontSize: 38, color: TEAL, background: WHITE, border: `3px solid ${MINT}`, borderRadius: 34, padding: '10px 32px'}}>
          WhatsApp 328 837 3357
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ montaggio: tagli netti a fotogrammi interi */

export const Movie: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  const logoO = 1 - prog(T, S.end.from, S.end.from + 0.3);
  return (
    <AbsoluteFill style={{background: WHITE}}>
      {TL.scenes.map((s) => {
        const from = Math.round(s.from * FPS), dur = Math.round(s.to * FPS) - from, D = s.to - s.from;
        return (
          <Sequence key={s.id} from={from} durationInFrames={dur}>
            {s.id === 'prodotti' ? <ProductScene D={D} /> : s.id === 'end' ? <EndScene /> : <CardScene id={s.id} D={D} />}
          </Sequence>
        );
      })}
      <div style={{position: 'absolute', left: 40, top: 70, width: 270, height: 120, borderRadius: 26, background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 10px 30px rgba(1,40,40,0.18)', opacity: logoO, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile(LOGO.file)} style={{width: 230, height: (230 * LOGO.h) / LOGO.w}} />
      </div>
    </AbsoluteFill>
  );
};
