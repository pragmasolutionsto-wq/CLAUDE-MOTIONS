import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {BODY, MARK, MINT, LOGO, PAYOFF, TEAL, TEAL_DEEP, W} from '../brand';
import {Backdrop, Body, Label, Line, Stage, Steps, Title, TopLogo} from '../kit';
import {clamp, eBack, eElastic, eI3, eO3, lerp, prog} from '../util';
import {IcoBalanced, IcoBattery, IcoClock, IcoDrop, IcoGlass, IcoPill, IcoPlate, IcoScan, IcoWarn, IcoWine} from './icons';
import TL from './timeline.json';

export const FPS = TL.fps;
export const DURATION = TL.scenes[TL.scenes.length - 1].to;

type Card = {icon: React.FC<{t: number}>; label?: string; title: Line[]; body?: string};

const CARDS: Record<string, Card> = {
  hook: {
    icon: IcoPill,
    title: [{text: 'PRENDI LA', box: 'none'}, {text: 'METFORMINA?', box: 'teal'}, {text: '7 CONSIGLI UTILI', box: 'mint', size: 104}],
  },
  cosa: {
    icon: IcoDrop,
    title: [{text: 'ABBASSA', box: 'teal'}, {text: 'LA GLICEMIA', box: 'mint'}],
    body: 'È uno dei farmaci più usati per controllare **i livelli di zucchero nel sangue**',
  },
  errore: {
    icon: IcoWarn,
    title: [{text: 'SPESSO SI ASSUME', box: 'none', size: 112}, {text: 'NEL MODO SBAGLIATO', box: 'teal', size: 112}],
    body: 'Ecco **7 consigli** per farlo nel modo giusto',
  },
  t1: {
    icon: IcoPlate, label: 'CONSIGLIO 1',
    title: [{text: 'MAI A', box: 'none'}, {text: 'STOMACO VUOTO', box: 'teal'}],
    body: 'Prendila durante o dopo i pasti: a digiuno può dare **nausea, crampi e diarrea**',
  },
  t2: {
    icon: IcoGlass, label: 'CONSIGLIO 2',
    title: [{text: 'INTERA,', box: 'none'}, {text: "CON L'ACQUA", box: 'teal'}],
    body: 'Non masticare e non frantumare la compressa: deglutiscila con **un bicchiere d’acqua**',
  },
  t3: {
    icon: IcoClock, label: 'CONSIGLIO 3',
    title: [{text: 'DOSE', box: 'none'}, {text: 'DIMENTICATA?', box: 'teal'}],
    body: '**Non raddoppiare.** Prendi la dose successiva all’orario previsto',
  },
  t4: {
    icon: IcoWine, label: 'CONSIGLIO 4',
    title: [{text: 'ATTENZIONE', box: 'none'}, {text: "ALL'ALCOL", box: 'teal'}],
    body: 'Soprattutto a digiuno: aumenta il rischio di **acidosi lattica**',
  },
  t5: {
    icon: IcoBattery, label: 'CONSIGLIO 5',
    title: [{text: 'CONTROLLA', box: 'none'}, {text: 'LA VITAMINA B12', box: 'teal'}],
    body: 'Nel lungo periodo può abbassarsi: ti senti **stanco e con poca energia**',
  },
  t6: {
    icon: IcoScan, label: 'CONSIGLIO 6',
    title: [{text: 'ESAMI CON', box: 'none'}, {text: 'CONTRASTO?', box: 'teal'}],
    body: 'Prima di una TAC con contrasto **avvisa il medico**: potrebbe sospenderla per un periodo',
  },
  t7: {
    icon: IcoBalanced, label: 'CONSIGLIO 7',
    title: [{text: 'PASTI', box: 'none'}, {text: 'REGOLARI', box: 'teal'}],
    body: 'Non saltarli: funziona meglio con **un’alimentazione sana ed equilibrata**',
  },
};

// uscita comune: sale e svanisce negli ultimi 0.35s della scena
const Exit: React.FC<{t: number; D: number; children: React.ReactNode}> = ({t, D, children}) => {
  const x = eI3(prog(t, D - 0.35, D));
  return <AbsoluteFill style={{opacity: 1 - x, transform: `translateY(${-60 * x}px) scale(${1 - 0.03 * x})`}}>{children}</AbsoluteFill>;
};

const CardScene: React.FC<{c: Card; t: number; D: number}> = ({c, t, D}) => {
  const Ico = c.icon;
  const tAt = c.label ? 0.3 : 0.08;
  return (
    <Exit t={t} D={D}>
      <Stage t={t}><Ico t={t} /></Stage>
      <div style={{position: 'absolute', left: 0, top: 1000, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {c.label && <Label text={c.label} t={t} at={0.12} />}
        <Title lines={c.title} t={t} at={tAt} />
        {c.body && <Body text={c.body} t={t} at={tAt + 0.55} />}
      </div>
    </Exit>
  );
};

const EndScene: React.FC<{t: number; D: number}> = ({t}) => {
  const pm = eElastic(prog(t, 0.05, 1.3));
  const pulse = prog(t, 0.5, 1.6);
  const pl = eO3(prog(t, 1.7, 2.3));
  const pp = eO3(prog(t, 2.1, 2.6));
  const mh = 330, mw = (mh * MARK.w) / MARK.h, lw = 520;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: W / 2 - 230, top: 225, width: 460, height: 460, borderRadius: '50%',
        border: `6px solid ${MINT}`, opacity: (1 - pulse) * 0.8 * clamp(pulse * 8), transform: `scale(${lerp(0.5, 1.35, eO3(pulse))})`}} />
      <div style={{position: 'absolute', left: W / 2 - 200, top: 255, width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(92,192,168,0.28) 0%, rgba(92,192,168,0) 70%)', opacity: clamp(pm)}} />
      <Img src={staticFile(MARK.file)} style={{position: 'absolute', left: (W - mw) / 2, top: 290, width: mw, height: mh,
        transform: `scale(${pm}) rotate(${(1 - clamp(pm)) * -12}deg)`}} />
      <div style={{position: 'absolute', left: 0, top: 680, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Title lines={[{text: 'HAI DUBBI?', box: 'none', size: 120}, {text: 'CHIEDI A NOI', box: 'teal', size: 120}]} t={t} at={0.45} />
        <Body text="Rispetta sempre la **posologia prescritta** dal tuo medico" t={t} at={1.0} size={42} />
      </div>
      <Img src={staticFile(LOGO.file)} style={{position: 'absolute', left: (W - lw) / 2, top: 1185, width: lw, height: (lw * LOGO.h) / LOGO.w,
        opacity: pl, transform: `translateY(${(1 - pl) * 30}px)`}} />
      <div style={{position: 'absolute', left: 0, top: 1415, width: W, textAlign: 'center', fontFamily: BODY, fontWeight: 700,
        fontSize: 38, color: TEAL, opacity: pp, letterSpacing: 1}}>{PAYOFF}</div>
      <div style={{position: 'absolute', left: 0, top: 1480, width: W, textAlign: 'center', fontFamily: BODY, fontWeight: 500,
        fontSize: 24, color: TEAL_DEEP, opacity: pp * 0.7}}>Le informazioni non sostituiscono il parere del medico.</div>
    </AbsoluteFill>
  );
};

export const Movie: React.FC = () => {
  const f = useCurrentFrame();
  const T = f / FPS;
  const tips = TL.scenes.filter((s) => s.id.startsWith('t'));
  const tipIdx = tips.findIndex((s) => T >= s.from && T < s.to);
  const cur = tipIdx >= 0 ? tipIdx : T >= tips[tips.length - 1].to ? 7 : 0;
  const fill = tipIdx >= 0 ? eO3(prog(T, tips[tipIdx].from + 0.2, tips[tipIdx].from + 1.0)) : 0;
  const end = TL.scenes[TL.scenes.length - 1];
  const stepsO = prog(T, 7.7, 8.2) * (1 - prog(T, end.from - 0.35, end.from));
  const logoO = eBack(prog(T, 0.2, 0.7)) * (1 - prog(T, end.from - 0.35, end.from));
  return (
    <AbsoluteFill>
      <Backdrop t={T} />
      <TopLogo o={clamp(logoO)} />
      <Steps n={7} cur={cur} fill={fill} o={stepsO} />
      {TL.scenes.map((s) => {
        if (T < s.from || T >= s.to) return null;
        const t = T - s.from, D = s.to - s.from;
        return s.id === 'end' ? <EndScene key={s.id} t={t} D={D} /> : <CardScene key={s.id} c={CARDS[s.id]} t={t} D={D} />;
      })}
    </AbsoluteFill>
  );
};
