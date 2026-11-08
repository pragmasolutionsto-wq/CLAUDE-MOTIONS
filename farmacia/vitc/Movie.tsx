// Reel animato Vitamina C: clip 3D Runway a tutto schermo, testi nello stile card della farmacia, prodotto reale, voce Runway.
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
  hook: {clip: 'c01', textTop: 240, title: [{text: 'VITAMINA C', box: 'mint', size: 140}, {text: 'QUELLO CHE FORSE NON SAI', box: 'teal', size: 80}]},
  immuni: {clip: 'c02', title: [{text: 'SISTEMA', box: 'mint'}, {text: 'IMMUNITARIO', box: 'teal'}],
    body: 'Contribuisce alla **normale funzione** del sistema immunitario'},
  antiox: {clip: 'c03', title: [{text: 'ANTIOSSIDANTE', box: 'teal'}], body: 'Protegge le cellule dallo **stress ossidativo**'},
  collagene: {clip: 'c04', textTop: 1270, title: [{text: 'COLLAGENE', box: 'teal'}],
    body: 'Partecipa alla sua formazione: importante per **pelle, gengive e vasi sanguigni**'},
  ferro: {clip: 'c05', textTop: 700, title: [{text: 'FERRO DEI VEGETALI', box: 'teal', size: 100}],
    body: 'Aiuta ad assorbirlo: prova **il limone** su legumi e verdure'},
  fabbisogno: {clip: 'c06', textTop: 250, title: [{text: '95–110 MG', box: 'teal', size: 130}, {text: 'AL GIORNO', box: 'mint'}],
    body: 'Più o meno **un’arancia e mezza**'},
  alimenti: {clip: 'c07', textTop: 280, title: [{text: 'DOVE TROVARLA', box: 'teal'}],
    body: 'Agrumi, kiwi, peperoni e fragole: **meglio freschi e poco cotti**'},
  consiglio: {clip: 'c08', title: [{text: 'FUMI O PRENDI', box: 'mint', size: 100}, {text: 'PROTETTORI GASTRICI?', box: 'teal', size: 92}],
    body: 'Il tuo fabbisogno può cambiare: **chiedici consiglio**'},
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
      <OffthreadVideo src={staticFile(`vitc/${c.clip}.mp4`)} muted playbackRate={Math.min(1, 5.0 / D)}
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

// il prodotto vero (due gusti) su fondo brand, con spicchi d'arancia che salgono
const Pack: React.FC<{file: string; top: number; p: number; dx: number}> = ({file, top, p, dx}) => (
  <div style={{position: 'absolute', left: 90, top, width: W - 180, height: 400, borderRadius: 44, background: WHITE, overflow: 'hidden',
    boxShadow: '0 26px 60px rgba(1,63,65,0.22)', border: `5px solid ${MINT}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: clamp(p * 2), transform: `translateX(${(1 - clamp(p, 0, 1.2)) * dx}px) scale(${lerp(0.9, 1, clamp(p, 0, 1.1))})`}}>
    <Img src={staticFile(file)} style={{width: '88%', height: '88%', objectFit: 'contain'}} />
  </div>
);

const ProductScene: React.FC<{D: number}> = ({D}) => {
  const t = useCurrentFrame() / FPS;
  const p1 = eBack(prog(t, 0.15, 0.85), 1.4), p2 = eBack(prog(t, 0.45, 1.15), 1.4);
  const dots = Array.from({length: 14}, (_, i) => {
    const x = 60 + ((i * 137) % 960), sp = 0.1 + (i % 5) * 0.03, ph = (i * 0.37) % 1, r = 16 + (i % 3) * 10;
    const y = 1950 - (((t * sp + ph) % 1) * 2150);
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: '50%',
      background: i % 2 ? 'rgba(240,140,40,0.35)' : 'rgba(92,192,168,0.30)', border: '2px solid rgba(255,255,255,0.7)'}} />;
  });
  const fp = eO3(prog(t, 1.4, 1.9));
  return (
    <AbsoluteFill>
      <Backdrop t={t + 20} />
      {dots}
      <div style={{position: 'absolute', left: 0, top: 250, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Label text="FARMACISTI PREPARATORI" t={t} at={0.0} solid />
        <TitleLine line={{text: 'VIT-C 500 MASTICABILE', box: 'teal', size: 96}} p={prog(t, 0.05, 0.6)} />
      </div>
      <Pack file="vitc/arancia.png" top={560} p={p1} dx={-500} />
      <Pack file="vitc/bosco.png" top={1000} p={p2} dx={500} />
      <div style={{position: 'absolute', left: 0, top: 1440, width: W, display: 'flex', justifyContent: 'center', gap: 18}}>
        {['ARANCIA', 'FRUTTI DI BOSCO'].map((s, i) => {
          const p = eBack(prog(t, 0.9 + i * 0.25, 1.3 + i * 0.25), 2.4);
          return <div key={s} style={{fontFamily: HEAD, fontSize: 54, color: i ? WHITE : TEAL, background: i ? TEAL : WHITE,
            border: `4px solid ${MINT}`, borderRadius: 24, padding: '4px 28px 0', opacity: clamp(p * 2), transform: `scale(${clamp(p, 0, 1.2)})`}}>{s}</div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 90, top: 1600, width: W - 180, textAlign: 'center', fontFamily: BODY, fontWeight: 600, fontSize: 24,
        lineHeight: 1.35, color: TEAL_DEEP, opacity: fp * (1 - prog(t, D - 0.2, D))}}>
        Gli integratori non vanno intesi come sostituti di una dieta varia ed equilibrata e di uno stile di vita sano.
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
      <div style={{position: 'absolute', left: W / 2 - 230, top: 210, width: 460, height: 460, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(92,192,168,0.32) 0%, rgba(92,192,168,0) 70%)', opacity: clamp(pm)}} />
      <Img src={staticFile(MARK.file)} style={{position: 'absolute', left: (W - mw) / 2, top: 290, width: mw, height: mh, transform: `scale(${pm})`}} />
      <Img src={staticFile(LOGO.file)} style={{position: 'absolute', left: (W - lw) / 2, top: 640, width: lw, height: (lw * LOGO.h) / LOGO.w,
        opacity: pl, transform: `translateY(${(1 - pl) * 30}px)`}} />
      <div style={{position: 'absolute', left: 0, top: 925, width: W, textAlign: 'center', fontFamily: HEAD, fontSize: 64, color: TEAL,
        opacity: pl}}>SIAMO QUI PER TE</div>
      <div style={{position: 'absolute', left: 0, top: 1040, width: W, display: 'flex', justifyContent: 'center', opacity: pp,
        transform: `scale(${lerp(0.85, 1, eBack(pp))})`}}>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 42, color: WHITE, background: TEAL, borderRadius: 44, padding: '18px 44px'}}>{PAYOFF}</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 1170, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
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
            {s.id === 'prodotto' ? <ProductScene D={D} /> : s.id === 'end' ? <EndScene /> : <CardScene id={s.id} D={D} />}
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
