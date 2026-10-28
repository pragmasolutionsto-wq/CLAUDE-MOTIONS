// Versione con voce: fondali 3D Runway (clip animate o keyframe con movimento camera) + grafica brand sopra.
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BODY, LOGO, MARK, PAYOFF, TEAL, TEAL_DEEP, W, WHITE} from '../brand';
import {Backdrop, Label, Line, Steps, TitleLine} from '../kit';
import {clamp, eBack, eElastic, eIO, eO3, lerp, prog} from '../util';
import TL from './timeline_vo.json';

export const FPS_VO = TL.fps;
export const DURATION_VO = TL.total;
const XF = 0.3; // dissolvenza tra scene

type Bg = {img: string; clip?: string; rate?: number; zoom?: [number, number]; pan?: [number, number, number, number]};
type Card = {bg: Bg; label?: string; title: Line[]; body?: string; titleAt?: number[]; bodyAt?: number};

const CARDS: Record<string, Card> = {
  hook: {
    bg: {img: 's01', clip: 'c01'},
    title: [{text: 'PRENDI LA', box: 'mint'}, {text: 'METFORMINA?', box: 'teal'}, {text: '7 CONSIGLI UTILI', box: 'mint', size: 96}],
    titleAt: [0.05, 0.2, 1.65],
  },
  cosa: {
    bg: {img: 's02', zoom: [1.04, 1.13], pan: [0, 0, -20, -30]},
    title: [{text: 'ABBASSA', box: 'mint'}, {text: 'LA GLICEMIA', box: 'teal'}],
    body: 'Uno dei farmaci più usati per controllare **gli zuccheri nel sangue**', titleAt: [1.2, 1.35], bodyAt: 2.4,
  },
  errore: {
    bg: {img: 's03', zoom: [1.1, 1.02], pan: [0, -20, 0, 0]},
    title: [{text: 'SPESSO SI ASSUME', box: 'mint', size: 104}, {text: 'NEL MODO SBAGLIATO', box: 'teal', size: 104}],
  },
  t1: {
    bg: {img: 's04', zoom: [1.03, 1.12], pan: [20, 0, -10, -20]}, label: 'CONSIGLIO 1',
    title: [{text: 'MAI A', box: 'mint'}, {text: 'STOMACO VUOTO', box: 'teal'}],
    body: 'Prendila durante o dopo i pasti: eviti **nausea, crampi e diarrea**', bodyAt: 2.0,
  },
  t2: {
    bg: {img: 's05', zoom: [1.12, 1.03], pan: [0, -30, 0, 10]}, label: 'CONSIGLIO 2',
    title: [{text: 'INTERA,', box: 'mint'}, {text: "CON L'ACQUA", box: 'teal'}],
    body: 'Non masticarla e non frantumarla: **un bicchiere d’acqua**', bodyAt: 2.6,
  },
  t3: {
    bg: {img: 's06', zoom: [1.03, 1.11], pan: [-20, 10, 10, -20]}, label: 'CONSIGLIO 3',
    title: [{text: 'DOSE', box: 'mint'}, {text: 'DIMENTICATA?', box: 'teal'}],
    body: '**Non raddoppiare.** Prendi la successiva all’orario previsto', bodyAt: 1.6,
  },
  t4: {
    bg: {img: 's07', clip: 'c07', rate: 0.95}, label: 'CONSIGLIO 4',
    title: [{text: 'ATTENZIONE', box: 'mint'}, {text: "ALL'ALCOL", box: 'teal'}],
    body: 'Soprattutto a digiuno: aumenta il rischio di **acidosi lattica**', bodyAt: 1.8,
  },
  t5: {
    bg: {img: 's08', zoom: [1.1, 1.02], pan: [10, -10, -10, 10]}, label: 'CONSIGLIO 5',
    title: [{text: 'CONTROLLA', box: 'mint'}, {text: 'LA VITAMINA B12', box: 'teal'}],
    body: 'Nel lungo periodo può abbassarsi: **stanchezza e poca energia**', bodyAt: 2.6,
  },
  t6: {
    bg: {img: 's09', zoom: [1.03, 1.12], pan: [0, 20, 0, -20]}, label: 'CONSIGLIO 6',
    title: [{text: 'ESAMI CON', box: 'mint'}, {text: 'CONTRASTO?', box: 'teal'}],
    body: 'Prima di una TAC **avvisa il medico**: potrebbe sospenderla per un periodo', bodyAt: 2.4,
  },
  t7: {
    bg: {img: 's10', zoom: [1.12, 1.03], pan: [-10, -20, 10, 0]}, label: 'CONSIGLIO 7',
    title: [{text: 'PASTI', box: 'mint'}, {text: 'REGOLARI', box: 'teal'}],
    body: 'Funziona meglio con **un’alimentazione sana ed equilibrata**', bodyAt: 2.4,
  },
  end: {
    bg: {img: 's11', clip: 'c11', rate: 0.82},
    title: [{text: 'HAI DUBBI?', box: 'mint'}, {text: 'CHIEDI A NOI', box: 'teal'}],
    body: 'Rispetta sempre la **posologia prescritta** dal tuo medico', titleAt: [3.2, 4.1], bodyAt: 0.3,
  },
};
const END_CARD_AT = 4.95; // "...alla Farmacia Africa Orientale"
const PAYOFF_AT = 7.3; // "Dal 1909, nel cuore di Brindisi"

/* ------------------------------------------------------------------ fondale */

const Background: React.FC<{bg: Bg; t: number; D: number}> = ({bg, t, D}) => {
  const cover: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'};
  if (bg.clip) {
    return <OffthreadVideo src={staticFile(`metformina/${bg.clip}.mp4`)} muted playbackRate={bg.rate ?? 1} style={cover} />;
  }
  const p = eIO(prog(t, 0, D + XF));
  const [z0, z1] = bg.zoom ?? [1.04, 1.1];
  const [x0, y0, x1, y1] = bg.pan ?? [0, 0, 0, 0];
  return (
    <Img
      src={staticFile(`metformina/${bg.img}.jpg`)}
      style={{...cover, transform: `translate(${lerp(x0, x1, p)}px, ${lerp(y0, y1, p)}px) scale(${lerp(z0, z1, p)})`}}
    />
  );
};

/* ------------------------------------------------------------------ testi */

const Panel: React.FC<{text: string; p: number}> = ({text, p}) => {
  const parts = text.split('**');
  return (
    <div
      style={{
        marginTop: 22, maxWidth: 900, padding: '22px 34px', borderRadius: 28, background: 'rgba(255,255,255,0.93)',
        boxShadow: '0 16px 40px rgba(1,40,40,0.25)', fontFamily: BODY, fontWeight: 600, fontSize: 42, lineHeight: 1.3,
        color: TEAL_DEEP, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${lerp(0.96, 1, p)})`,
      }}
    >
      {parts.map((s, i) => (i % 2 ? <span key={i} style={{color: TEAL, fontWeight: 800}}>{s}</span> : <span key={i}>{s}</span>))}
    </div>
  );
};

const TextBlock: React.FC<{c: Card; t: number}> = ({c, t}) => {
  const base = c.label ? 0.25 : 0.1;
  const at = c.titleAt ?? c.title.map((_, i) => base + i * 0.14);
  return (
    <div style={{position: 'absolute', left: 0, top: 1150, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {c.label && <Label text={c.label} t={t} at={0.08} solid />}
      {c.title.map((l, i) => (
        <TitleLine key={i} line={l} p={prog(t, at[i], at[i] + 0.6)} />
      ))}
      {c.body && <Panel text={c.body} p={eO3(prog(t, c.bodyAt ?? 1.5, (c.bodyAt ?? 1.5) + 0.5))} />}
    </div>
  );
};

/* ------------------------------------------------------------------ scene */

const Scene: React.FC<{id: string; D: number}> = ({id, D}) => {
  const t = useCurrentFrame() / FPS_VO;
  const c = CARDS[id];
  const fadeIn = id === 'hook' ? 1 : eO3(prog(t, 0, XF));
  const textOut = 1 - prog(t, D - 0.15, D + 0.1);
  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <Background bg={c.bg} t={t} D={D} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,40,40,0.18) 0%, rgba(1,40,40,0) 18%, rgba(1,40,40,0) 50%, rgba(1,40,40,0.42) 100%)'}} />
      <AbsoluteFill style={{opacity: textOut}}>
        <TextBlock c={c} t={t} />
      </AbsoluteFill>
      {id === 'end' && <EndCard t={t - END_CARD_AT} />}
    </AbsoluteFill>
  );
};

// cartello finale: si apre a cerchio sopra la clip della farmacia
const EndCard: React.FC<{t: number}> = ({t}) => {
  if (t < 0) return null;
  const r = eIO(prog(t, 0, 0.7)) * 1300;
  const pm = eElastic(prog(t, 0.3, 1.5));
  const pl = eO3(prog(t, 0.9, 1.5));
  const pp = eO3(prog(t, PAYOFF_AT - END_CARD_AT, PAYOFF_AT - END_CARD_AT + 0.5));
  const mh = 300, mw = (mh * MARK.w) / MARK.h, lw = 600;
  return (
    <AbsoluteFill style={{clipPath: `circle(${r}px at 50% 52%)`}}>
      <Backdrop t={t + 40} />
      <div style={{position: 'absolute', left: W / 2 - 220, top: 330, width: 440, height: 440, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(92,192,168,0.30) 0%, rgba(92,192,168,0) 70%)', opacity: clamp(pm)}} />
      <Img src={staticFile(MARK.file)} style={{position: 'absolute', left: (W - mw) / 2, top: 390, width: mw, height: mh, transform: `scale(${pm})`}} />
      <Img src={staticFile(LOGO.file)} style={{position: 'absolute', left: (W - lw) / 2, top: 760, width: lw, height: (lw * LOGO.h) / LOGO.w,
        opacity: pl, transform: `translateY(${(1 - pl) * 30}px)`}} />
      <div style={{position: 'absolute', left: 0, top: 1040, width: W, display: 'flex', justifyContent: 'center', opacity: pp,
        transform: `scale(${lerp(0.9, 1, eBack(pp))})`}}>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 40, color: WHITE, background: TEAL, borderRadius: 40, padding: '16px 40px'}}>{PAYOFF}</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 1150, width: W, textAlign: 'center', fontFamily: BODY, fontWeight: 600, fontSize: 32,
        color: TEAL_DEEP, opacity: pp}}>Corso Garibaldi 49 · Brindisi</div>
      <div style={{position: 'absolute', left: 0, top: 1215, width: W, textAlign: 'center', fontFamily: BODY, fontWeight: 500, fontSize: 24,
        color: TEAL_DEEP, opacity: pp * 0.7}}>Le informazioni non sostituiscono il parere del medico.</div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ montaggio */

export const MovieVO: React.FC = () => {
  const T = useCurrentFrame() / FPS_VO;
  const S = TL.scenes;
  const end = S[S.length - 1];
  const endCard = end.from + END_CARD_AT;
  const tips = S.filter((s) => /^t\d$/.test(s.id));
  const ti = tips.findIndex((s) => T >= s.from && T < s.to);
  const cur = ti >= 0 ? ti : T >= tips[tips.length - 1].to ? 7 : 0;
  const fill = ti >= 0 ? eO3(prog(T, tips[ti].from + 0.1, tips[ti].from + 0.9)) : 0;
  const errore = S.find((s) => s.id === 'errore')!;
  const stepsO = prog(T, errore.from, errore.from + 0.4) * (1 - prog(T, end.from - 0.2, end.from + 0.2));
  const logoO = 1 - prog(T, endCard, endCard + 0.4);
  return (
    <AbsoluteFill style={{background: WHITE}}>
      {S.map((s) => {
        const from = Math.round(s.from * FPS_VO);
        const dur = Math.round((s.to - s.from + XF) * FPS_VO);
        return (
          <Sequence key={s.id} from={from} durationInFrames={dur}>
            <Scene id={s.id} D={s.to - s.from} />
          </Sequence>
        );
      })}
      <div style={{position: 'absolute', left: (W - 340) / 2, top: 96, width: 340, height: 150, borderRadius: 30, background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 10px 30px rgba(1,40,40,0.18)', opacity: logoO, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile(LOGO.file)} style={{width: 290, height: (290 * LOGO.h) / LOGO.w}} />
      </div>
      <div style={{position: 'absolute', left: (W - 800) / 2, top: 268, width: 800, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.85)', opacity: stepsO}} />
      <div style={{position: 'absolute', left: 0, top: -6, width: W, height: 0}}>
        <Steps n={7} cur={cur} fill={fill} o={stepsO} />
      </div>
    </AbsoluteFill>
  );
};
