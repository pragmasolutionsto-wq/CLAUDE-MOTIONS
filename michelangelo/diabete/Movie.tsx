import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Logo3D} from './three';
import {
  ANTON, CREAM, DROP, DURATION, FOREST, FPS, H, LIFT, LIME, LIME_HI, MONT, SAGE, SPEECH_END, TEAL, TEAL_D, UNDER, W, WHITE, FACE_OUT,
  clamp, eBack, eIO, eO3, eO5, lerp, life, prog, segEnd, segT, soft, w,
} from './util';

/* ------------------------------------------------------------------ struttura: inserti a schermo pieno */

const INS = {
  gli: [w('glicemia') - 0.2, segEnd(1)],
  cons: [w('conseguenze') - 0.15, segEnd(2)],
  don: [w('benessere') - 0.1, segEnd(4)],
  pel: [w('secchezza', 2) - 0.15, segEnd(5)],
  pie: [w('controllali') - 0.1, segEnd(6)],
  fer: [w('ferita') - 0.15, w('dolore') + 0.7],
  occ: [w('occhi', 2) - 0.15, w('idratati') + 0.9],
  cur: [w('prendersi') - 0.15, segEnd(9)],
  end: [SPEECH_END, DURATION],
} as const;
type Key = keyof typeof INS;
const KEYS = Object.keys(INS) as Key[];
const CUBE = 0.6; // durata transizione cubo
const PUSH = [segT(2), segT(6), segT(9), segT(11)]; // spinta "card nello spazio" sui cambi di argomento

/* ------------------------------------------------------------------ video girato */

const Video: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden', background: CREAM}}>
    <div style={{position: 'absolute', width: W, height: H, transformOrigin: `${W / 2}px 0px`, transform: `translateY(${-LIFT}px) scale(${DROP})`}}>
      <OffthreadVideo src={staticFile('base.mp4')} muted style={{width: W, height: H}} />
    </div>
  </AbsoluteFill>
);

// il cerchio con il volto durante gli inserti
const Pip: React.FC<{t: number; a: number; b: number; x?: number; y?: number}> = ({t, a, b, x = 44, y = 1120}) => {
  const v = life(t, a + 0.35, b - 0.05, 0.4, 0.2);
  if (v <= 0) return null;
  const D = 350;
  // inquadra tutta la faccia (attaccatura dei capelli → mento) con margine dentro il cerchio
  const [, y0, , y1] = FACE_OUT;
  const top = y0 + 95, chin = y1 + 12; // attaccatura capelli ~95px sotto la cima dei capelli
  const sc = (D * 0.76) / (chin - top);
  const cx = 540, cy = (top + chin) / 2;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: D, height: D, borderRadius: D, overflow: 'hidden', border: `8px solid ${WHITE}`, boxShadow: '0 18px 44px rgba(20,56,46,0.30)', transform: `scale(${eBack(v)})`, opacity: clamp(v * 2), background: CREAM}}>
      <div style={{position: 'absolute', width: W, height: H, left: D / 2 - cx * sc, top: D / 2 - cy * sc, transformOrigin: '0 0', transform: `scale(${sc})`}}>
        <Video />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ stile grafico (brand Michelangelo) */

type Ln = {text: string; hi?: boolean; size?: number};

// titoli condensati maiuscoli, parola chiave in box lime
const Title: React.FC<{t: number; a: number; b: number; lines: Ln[]; y: number; x?: number; stag?: number; align?: 'center' | 'left'}> = ({t, a, b, lines, y, x = 0, stag = 0.14, align = 'center'}) => {
  if (t < a - 0.05 || t > b) return null;
  const out = eO3(prog(t, b - 0.22, b));
  return (
    <div style={{position: 'absolute', left: x, right: align === 'center' ? 0 : undefined, top: y, display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', gap: 10}}>
      {lines.map((l, i) => {
        const p = prog(t, a + i * stag, a + i * stag + 0.6);
        const s = soft(p * 1.6);
        return (
          <div key={i} style={{overflow: 'hidden', padding: '2px 4px', borderRadius: 16}}>
            <div style={{
              fontFamily: ANTON, fontSize: l.size ?? 82, lineHeight: 1.04, textTransform: 'uppercase', letterSpacing: '0.005em',
              color: l.hi ? FOREST : WHITE, background: l.hi ? LIME : TEAL_D, padding: '8px 24px 10px', borderRadius: 14,
              boxShadow: '0 12px 34px rgba(20,56,46,0.25)',
              transform: `translateY(${(1 - s) * 110 + out * -40}%)`, opacity: clamp(p * 3) * (1 - out),
            }}>
              {l.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Icon: React.FC<{name: string; c: string; s?: number}> = ({name, c, s = 40}) => {
  const st = {fill: 'none', stroke: c, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const P: Record<string, React.ReactNode> = {
    drop: <path {...st} d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z" />,
    apple: <path {...st} d="M12 7c-2-2-7-2-7 4 0 5 3 10 7 9 4 1 7-4 7-9 0-6-5-6-7-4zM12 7c0-2 1-4 3-4" />,
    run: <><circle {...st} cx="14.5" cy="4.5" r="2" /><path {...st} d="M9 21l3-6 3 2v5M12 15l-1-5 4-2 3 3 3 1M11 10L7 12" /></>,
    bolt: <path {...st} d="M13 2L4 14h7l-1 8 9-12h-7z" />,
    thermo: <path {...st} d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z" />,
    flame: <path {...st} d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 2-5 5-5 8 0 4 3 7 7 7z" />,
    check: <path {...st} d="M5 12l5 5 9-10" />,
    x: <path {...st} d="M6 6l12 12M18 6L6 18" />,
    eye: <><path {...st} d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle {...st} cx="12" cy="12" r="3" /></>,
    foot: <><path {...st} d="M9 3c3 0 4.5 3 4.5 6s-1.5 4-1.5 7 1 5-2 5-4-3-4-6 0-12 3-12z" /><circle {...st} cx="16" cy="5" r="1.1" /><circle {...st} cx="18.4" cy="8" r="1" /><circle {...st} cx="19" cy="11.5" r="0.9" /></>,
    heart: <path {...st} d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" />,
    shield: <path {...st} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
    sparkle: <path {...st} d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 3v4M17 5h4" />,
    leaf: <path {...st} d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l7-7" />,
    arrow: <path {...st} d="M5 12h14M13 6l6 6-6 6" />,
    phone: <path {...st} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24">{P[name]}</svg>;
};

const Chip: React.FC<{t: number; a: number; b: number; text: string; icon: string; size?: number; hi?: boolean}> = ({t, a, b, text, icon, size = 36, hi}) => {
  if (t < a || t > b) return null;
  const p = prog(t, a, a + 0.5), s = soft(p * 1.6);
  const out = eO3(prog(t, b - 0.2, b));
  const bg = hi ? LIME : WHITE, fg = FOREST;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px 10px 10px', borderRadius: 999, background: bg, boxShadow: '0 10px 28px rgba(20,56,46,0.24)',
      fontFamily: MONT, fontWeight: 800, fontSize: size, color: fg, textTransform: 'uppercase', whiteSpace: 'nowrap',
      transform: `translateY(${(1 - s) * 40 + out * 20}px) scale(${lerp(0.7, 1, s)})`, opacity: clamp(p * 4) * (1 - out)}}>
      <div style={{width: size * 1.5, height: size * 1.5, borderRadius: 99, background: hi ? FOREST : TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={icon} c={WHITE} s={size * 0.95} />
      </div>
      {text}
    </div>
  );
};

const Row: React.FC<{y: number; gap?: number; children: React.ReactNode; wrap?: boolean; x?: number; right?: number}> = ({y, gap = 14, children, wrap, x = 40, right = 40}) => (
  <div style={{position: 'absolute', left: x, right, top: y, display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: 'center', gap}}>{children}</div>
);

// colonna di chip allineata a destra (il cerchio con il volto sta a sinistra)
const Col: React.FC<{y: number; children: React.ReactNode; gap?: number}> = ({y, children, gap = 16}) => (
  <div style={{position: 'absolute', left: 420, right: 40, top: y, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap}}>{children}</div>
);

// CTA a pillola
const Cta: React.FC<{t: number; a: number; b: number; text: string; y: number; size?: number; icon?: string}> = ({t, a, b, text, y, size = 44, icon = 'arrow'}) => {
  if (t < a || t > b) return null;
  const p = prog(t, a, a + 0.6), s = soft(p * 1.6);
  const out = eO3(prog(t, b - 0.2, b));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: clamp(p * 4) * (1 - out)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '18px 18px 18px 40px', borderRadius: 999, background: TEAL_D, boxShadow: '0 18px 40px rgba(20,56,46,0.38)',
        fontFamily: MONT, fontWeight: 700, fontSize: size, color: WHITE, transform: `scale(${lerp(0.75, 1, s)})`}}>
        {text}
        <div style={{width: size * 1.55, height: size * 1.55, borderRadius: 99, background: LIME, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon name={icon} c={FOREST} s={size * 0.9} />
        </div>
      </div>
    </div>
  );
};

// onde teal/lime nella parte bassa
const Waves: React.FC<{t: number; y?: number; o?: number}> = ({t, y = 1500, o = 1}) => {
  const ph = t * 0.6;
  const path = (amp: number, off: number, k: number) => {
    let d = `M 0 ${H}`;
    for (let x = 0; x <= W; x += 30) d += ` L ${x} ${y + off + Math.sin(x / 260 * k + ph * k) * amp}`;
    return d + ` L ${W} ${H} Z`;
  };
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: o}}>
      <path d={path(40, -60, 1)} fill={LIME_HI} opacity={0.55} />
      <path d={path(30, 0, 1.3)} fill={SAGE} opacity={0.6} />
      <path d={path(24, 70, 0.8)} fill={WHITE} opacity={0.9} />
    </svg>
  );
};

const Stage: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, #ffffff 0%, #eaf4e6 45%, ${SAGE} 100%)`}}>
    <Waves t={t} y={1520} />
  </AbsoluteFill>
);

const Corner: React.FC = () => (
  <div style={{position: 'absolute', right: 44, top: 70, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px 10px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.94)', boxShadow: '0 8px 24px rgba(20,56,46,0.14)'}}>
    <Img src={staticFile('logo/mark.png')} style={{width: 56, height: 52}} />
    <Img src={staticFile('logo/wordmark.png')} style={{width: 150, height: 40}} />
  </div>
);

/* ------------------------------------------------------------------ media degli inserti (clip Runway o immagine in movimento) */

const Veil: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(244,241,236,0.78) 0%, rgba(244,241,236,0) 22%, rgba(244,241,236,0) 62%, rgba(244,241,236,0.55) 100%)'}} />
);

// immagine con lento movimento di camera
const Still: React.FC<{name: string; t: number; a: number; b: number; dir?: 1 | -1}> = ({name, t, a, b, dir = 1}) => {
  const p = prog(t, a - CUBE / 2, b + CUBE / 2);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: CREAM}}>
      <Img src={staticFile(`ai/${name}.jpg`)} style={{width: W, height: H, objectFit: 'cover', transform: `scale(${1.06 + p * 0.14}) translate(${dir * (p - 0.5) * 40}px, ${-p * 30}px)`}} />
      <Veil />
    </AbsoluteFill>
  );
};

// clip animata a tutto schermo: parte mezza transizione prima dell'inserto, rallentata per coprirlo
const Clip: React.FC<{name: string; t: number; a: number; b: number; rate?: number}> = ({name, t, a, b, rate}) => {
  const len = 5.04;
  const r = rate ?? clamp(len / (b - a + CUBE), 0.5, 1.25);
  const lt = t - a;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: CREAM}}>
      <Img src={staticFile(`ai/${name}.jpg`)} style={{width: W, height: H, objectFit: 'cover', transform: `scale(${1.12})`}} />
      <Sequence from={Math.round((a - CUBE / 2) * FPS)} layout="none">
        <OffthreadVideo src={staticFile(`ai/${name}.mp4`)} muted playbackRate={r} style={{width: W, height: H, objectFit: 'cover', transform: `scale(${1.03 + lt * 0.004})`}} />
      </Sequence>
      <Veil />
    </AbsoluteFill>
  );
};

// dissolvenza tra due media dentro lo stesso inserto
const Xf: React.FC<{t: number; at: number; d?: number; a: React.ReactNode; b: React.ReactNode}> = ({t, at, d = 0.35, a, b}) => {
  const p = eIO(prog(t, at - d / 2, at + d / 2));
  return (
    <AbsoluteFill>
      {p < 1 && <AbsoluteFill style={{opacity: 1 - p}}>{a}</AbsoluteFill>}
      {p > 0 && <AbsoluteFill style={{opacity: p}}>{b}</AbsoluteFill>}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ inserti */

const InsGli: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.gli;
  return (
    <>
      <Clip name="blood" t={t} a={a} b={b} />
      <Title t={t} a={a + 0.1} b={b + 1} y={150} lines={[{text: 'la glicemia', size: 92}]} />
      <Title t={t} a={w('oscillare') - 0.15} b={b + 1} y={282} lines={[{text: 'può oscillare', hi: true, size: 84}]} />
      <Col y={880}>
        <Chip t={t} a={w('alimentazione') - 0.05} b={b + 1} text="alimentazione" icon="apple" size={34} />
        <Chip t={t} a={w('movimento') - 0.05} b={b + 1} text="movimento" icon="run" size={34} />
        <Chip t={t} a={w('stress') - 0.05} b={b + 1} text="stress" icon="bolt" size={34} />
        <Chip t={t} a={w('malattia') - 0.05} b={b + 1} text="malattia" icon="thermo" size={34} hi />
      </Col>
      <Corner />
    </>
  );
};

const InsCons: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.cons;
  const tp = w('piedi') - 0.1, to = w('occhi') - 0.1;
  const media = (
    <Xf t={t} at={to} a={<Xf t={t} at={tp} a={<Still name="layers" t={t} a={a} b={tp} />} b={<Clip name="heel" t={t} a={tp} b={to} rate={1} />} />} b={<Clip name="eye" t={t} a={to} b={b} rate={1} />} />
  );
  return (
    <>
      {media}
      <Title t={t} a={a + 0.1} b={b + 1} y={150} lines={[{text: 'conseguenze su', size: 80}]} />
      <Title t={t} a={w('pelle') - 0.1} b={tp} y={282} lines={[{text: 'pelle', hi: true, size: 120}]} />
      <Title t={t} a={tp} b={to} y={282} lines={[{text: 'piedi', hi: true, size: 120}]} />
      <Title t={t} a={to} b={b + 1} y={282} lines={[{text: 'occhi', hi: true, size: 120}]} />
      <Corner />
    </>
  );
};

const InsDon: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.don;
  return (
    <>
      <Still name="petal" t={t} a={a} b={b} />
      <Title t={t} a={a + 0.05} b={b + 1} y={150} lines={[{text: 'nelle donne', size: 90}]} />
      <Title t={t} a={a + 0.4} b={b + 1} y={282} lines={[{text: 'benessere intimo', hi: true, size: 76}]} />
      <Col y={900}>
        <Chip t={t} a={w('secchezza') - 0.05} b={b + 1} text="secchezza" icon="drop" size={34} />
        <Chip t={t} a={w('infezioni') - 0.05} b={b + 1} text="infezioni" icon="shield" size={34} />
        <Chip t={t} a={w('sessuale') - 0.3} b={b + 1} text="benessere sessuale" icon="heart" size={30} hi />
      </Col>
      <Corner />
    </>
  );
};

const InsPel: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.pel;
  const tc = w('cosmetici') - 0.2;
  return (
    <>
      <Xf t={t} at={tc} a={<Still name="arm" t={t} a={a} b={tc} dir={-1} />} b={<Still name="flatlay" t={t} a={tc} b={b} />} />
      <Title t={t} a={a + 0.05} b={tc} y={150} lines={[{text: 'pelle secca', size: 96}]} />
      <Title t={t} a={tc + 0.05} b={b + 1} y={150} lines={[{text: 'cosmetici specifici', size: 72}]} />
      <Title t={t} a={w('viso') - 0.1} b={b + 1} y={270} lines={[{text: 'viso e corpo', hi: true, size: 92}]} />
      <Corner />
    </>
  );
};

const InsPie: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.pie;
  return (
    <>
      <Clip name="mirror" t={t} a={a} b={b} rate={0.66} />
      <Title t={t} a={a + 0.05} b={b + 1} y={150} lines={[{text: 'i tuoi piedi', size: 92}]} />
      <Title t={t} a={w('ogni', 1) - 0.1} b={b + 1} y={282} lines={[{text: 'ogni giorno', hi: true, size: 84}]} />
      <Col y={820}>
        <Chip t={t} a={w('controllali') - 0.05} b={b + 1} text="controllali" icon="eye" size={34} />
        <Chip t={t} a={w('asciugali') - 0.05} b={b + 1} text="asciugali bene" icon="drop" size={34} />
        <Chip t={t} a={w('crema') - 0.1} b={b + 1} text="crema emolliente" icon="sparkle" size={34} />
        <Chip t={t} a={w('evitando') - 0.05} b={b + 1} text="non tra le dita" icon="x" size={34} hi />
      </Col>
      <Corner />
    </>
  );
};

const InsFer: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.fer;
  return (
    <>
      <Clip name="heel" t={t} a={a} b={b} rate={0.8} />
      <Title t={t} a={a + 0.05} b={b + 1} y={150} lines={[{text: 'ferita al piede', size: 90}]} />
      <Col y={760}>
        <Chip t={t} a={w('gonfio') - 0.05} b={b + 1} text="piede gonfio" icon="foot" size={34} />
        <Chip t={t} a={w('rosso') - 0.05} b={b + 1} text="rosso" icon="drop" size={34} />
        <Chip t={t} a={w('caldo') - 0.05} b={b + 1} text="caldo" icon="flame" size={34} />
        <Chip t={t} a={w('anche', 3) - 0.05} b={b + 1} text="anche senza dolore" icon="check" size={32} hi />
      </Col>
      <Corner />
    </>
  );
};

const InsOcc: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.occ;
  return (
    <>
      <Clip name="eye" t={t} a={a} b={b} rate={0.9} />
      <Title t={t} a={a + 0.05} b={b + 1} y={150} lines={[{text: 'occhi secchi', size: 92}]} />
      <Title t={t} a={w('idratati') - 0.2} b={b + 1} y={282} lines={[{text: 'sempre idratati', hi: true, size: 80}]} />
      <Corner />
    </>
  );
};

const InsCur: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.cur;
  return (
    <>
      <Clip name="hands" t={t} a={a} b={b} />
      <Title t={t} a={a + 0.05} b={b + 1} y={150} lines={[{text: 'prendersi cura', size: 88}, {text: 'di sé', size: 88}]} stag={0.2} />
      <Title t={t} a={w('con', 2) - 0.1} b={b + 1} y={400} lines={[{text: 'con consapevolezza', hi: true, size: 66}]} />
      <Title t={t} a={w('ogni', 2) - 0.1} b={b + 1} y={510} lines={[{text: 'ogni giorno', size: 82}]} />
      <Corner />
    </>
  );
};

const InsEnd: React.FC<{t: number}> = ({t}) => {
  const [a] = INS.end;
  const lt = t - a;
  const wv = eO5(prog(lt, 0.5, 1.0)), pay = eO5(prog(lt, 0.8, 1.3)), ad = eO5(prog(lt, 1.6, 2.2));
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, #ffffff 0%, ${CREAM} 55%, ${SAGE} 100%)`}} />
      <Waves t={t} y={1580} />
      <div style={{position: 'absolute', left: 0, top: 200, width: W, height: 620}}>
        <Logo3D lt={lt} w={W} h={620} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 850, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
        <Img src={staticFile('logo/wordmark.png')} style={{width: 700, height: 186, opacity: wv, transform: `translateY(${(1 - wv) * 40}px)`}} />
        <div style={{fontFamily: MONT, fontWeight: 600, fontStyle: 'italic', fontSize: 44, color: FOREST, opacity: pay, transform: `translateY(${(1 - pay) * 30}px)`}}>siamo qui per aiutarti</div>
        <div style={{fontFamily: MONT, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: TEAL_D, textAlign: 'center', lineHeight: 1.6, opacity: ad, transform: `translateY(${(1 - ad) * 30}px)`}}>
          VIALE MICHELANGELO 13 · FOGGIA<br />0881 636803
        </div>
      </div>
      <Cta t={t} a={a + 1.2} b={DURATION + 1} text="Vieni a trovarci" y={1250} size={44} />
    </>
  );
};

const INSERT: Record<Key, React.FC<{t: number}>> = {gli: InsGli, cons: InsCons, don: InsDon, pel: InsPel, pie: InsPie, fer: InsFer, occ: InsOcc, cur: InsCur, end: InsEnd};

/* ------------------------------------------------------------------ grafiche sulla persona (sempre sotto il mento) */

const OnFace: React.FC<{t: number}> = ({t}) => {
  const y = UNDER;
  return (
    <>
      {/* hook */}
      <Title t={t} a={w('hai') - 0.1} b={segEnd(0) - 0.15} y={y} lines={[{text: 'hai il diabete?', size: 86}, {text: 'qualcosa di importante', hi: true, size: 64}]} stag={0.5} />

      {/* conseguenze → donne (prima dell'inserto) */}
      <Title t={t} a={w('nelle') - 0.05} b={INS.don[0] + 0.1} y={y} lines={[{text: 'nelle donne', size: 88}]} />

      {/* pelle */}
      <Title t={t} a={w('partiamo') - 0.1} b={INS.pel[0] + 0.1} y={y} lines={[{text: 'partiamo dalla pelle', hi: true, size: 66}]} />

      {/* piedi */}
      <Title t={t} a={w('piedi', 2) - 0.2} b={INS.pie[0] + 0.1} y={y} lines={[{text: 'i piedi', size: 92}]} />
      <Row y={y + 120} x={60} right={60}><Chip t={t} a={w('ridurne') - 0.05} b={INS.pie[0] + 0.1} text="sensibilità ridotta" icon="foot" size={34} /></Row>

      {/* segnale da non sottovalutare */}
      <Title t={t} a={w('segnale') - 0.15} b={INS.fer[0] + 0.1} y={y} lines={[{text: 'un segnale', size: 84}, {text: 'da non sottovalutare', hi: true, size: 64}]} stag={0.25} />
      <Cta t={t} a={w('contattare') - 0.1} b={segEnd(7) + 0.1} text="contatta subito il medico" y={y + 40} size={40} icon="phone" />

      {/* visita oculistica */}
      <Row y={y + 20} x={60} right={60}><Chip t={t} a={w('periodicamente') - 0.1} b={segEnd(8) + 0.1} text="visita oculistica periodica" icon="eye" size={32} hi /></Row>

      {/* prevenire */}
      <Title t={t} a={w('prevenire') - 0.1} b={INS.cur[0] + 0.1} y={y} lines={[{text: 'per prevenire', size: 84}, {text: 'le conseguenze', hi: true, size: 84}]} stag={0.3} />

      {/* soluzioni */}
      <Row y={y} x={60} right={60}><Chip t={t} a={w('soluzioni') - 0.1} b={segEnd(10) + 0.1} text="le soluzioni più adatte" icon="sparkle" size={34} hi /></Row>

      {/* CTA finale */}
      <Cta t={t} a={w('vieni') - 0.1} b={SPEECH_END + 0.2} text="Vieni a trovarci" y={y + 110} size={44} />
      <Title t={t} a={w('vivere') - 0.15} b={SPEECH_END + 0.2} y={y - 30} lines={[{text: 'a vivere meglio', hi: true, size: 72}]} />
    </>
  );
};

/* ------------------------------------------------------------------ transizioni 3D */

// cubo: la faccia A ruota via e la B entra dal lato, come due facce dello stesso solido
const Cube: React.FC<{p: number; dir: 1 | -1; a: React.ReactNode; b: React.ReactNode}> = ({p, dir, a, b}) => {
  const e = eIO(p);
  const face = (rot: number, child: React.ReactNode, shade: number) => (
    <div style={{position: 'absolute', width: W, height: H, overflow: 'hidden', backfaceVisibility: 'hidden', transform: `rotateY(${rot}deg) translateZ(${W / 2}px)`}}>
      {child}
      <AbsoluteFill style={{background: FOREST, opacity: shade * 0.45}} />
    </div>
  );
  const pull = Math.sin(e * Math.PI) * 260;
  return (
    <AbsoluteFill style={{perspective: 1700, background: CREAM}}>
      <Stage t={0} />
      <div style={{position: 'absolute', width: W, height: H, transformStyle: 'preserve-3d', transform: `translateZ(${-W / 2 - pull}px) rotateY(${-90 * e * dir}deg)`}}>
        {face(0, a, e)}
        {face(90 * dir, b, 1 - e)}
      </div>
    </AbsoluteFill>
  );
};

// spinta: il video arretra come una card nello spazio e torna avanti
const pushAt = (t: number) => {
  let m = 0;
  for (const a of PUSH) m = Math.max(m, Math.sin(Math.PI * prog(t, a - 0.32, a + 0.32)));
  return m;
};

/* ------------------------------------------------------------------ montaggio */

export const Movie: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const inside = KEYS.find((k) => t >= INS[k][0] && t < INS[k][1]);
  for (const k of KEYS) {
    const [a, b] = INS[k];
    const C = INSERT[k];
    if (t >= a - CUBE / 2 && t < a + CUBE / 2) {
      return <Cube p={prog(t, a - CUBE / 2, a + CUBE / 2)} dir={1} a={<><Video /><OnFace t={t} /></>} b={<C t={t} />} />;
    }
    if (k !== 'end' && t >= b - CUBE / 2 && t < b + CUBE / 2) {
      return <Cube p={prog(t, b - CUBE / 2, b + CUBE / 2)} dir={1} a={<C t={t} />} b={<><Video /><OnFace t={t} /></>} />;
    }
  }
  if (inside) {
    const C = INSERT[inside];
    return (
      <AbsoluteFill>
        <C t={t} />
        {inside !== 'end' && <Pip t={t} a={INS[inside][0]} b={INS[inside][1]} />}
      </AbsoluteFill>
    );
  }
  const ps = pushAt(t);
  return (
    <AbsoluteFill style={{background: CREAM}}>
      {ps > 0 && <Stage t={t} />}
      <AbsoluteFill style={{perspective: 1600}}>
        <AbsoluteFill style={{transform: `translateZ(${-ps * 420}px) rotateX(${ps * 9}deg) rotateY(${ps * -6}deg)`, borderRadius: ps * 60, overflow: 'hidden', boxShadow: ps > 0 ? `0 ${40 * ps}px ${90 * ps}px rgba(20,56,46,${0.35 * ps})` : 'none'}}>
          <Video />
          <OnFace t={t} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
