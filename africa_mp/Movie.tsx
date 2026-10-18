import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Logo3D} from './three';
import {
  ANTON, AUTUMN, CREAM, DROP, DURATION, FPS, FOREST, H, LIFT, MINT, MINT_HI, MONT, PETROL, PETROL_D, SAGE, SPEECH_END, SUB_TOP, W, WARM, WHITE, PRODUCT,
  ZO, clamp, eBack, eIO, eO3, eO5, faceAt, lerp, life, prog, rnd, safeTop, segEnd, segT, soft, w, zoomAt,
} from './util';

/* ------------------------------------------------------------------ struttura: inserti fotorealistici a schermo pieno */

const INS = {
  serum: [segT(5), segEnd(5)],
  peptides: [w('formulato') - 0.1, segEnd(8)],
  satin: [segT(9), w('percepibile') + 0.35],
  lab: [segT(10), w('già') - 0.08],
  mixing: [w('oppure') - 0.12, segEnd(13)],
  end: [SPEECH_END, DURATION],
} as const;
type Key = keyof typeof INS;
const KEYS = Object.keys(INS) as Key[];
const CUBE = 0.6; // durata transizione cubo
const PUSH = [segT(3), segT(11), segT(14)];
const inProduct = (a: number, b: number) => a < PRODUCT[1] && b > PRODUCT[0];

/* ------------------------------------------------------------------ video */

const Video: React.FC<{t: number}> = ({t}) => {
  const z = zoomAt(t);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: CREAM}}>
      <div style={{position: 'absolute', width: W, height: H, transformOrigin: `${W / 2}px 0px`, transform: `translateY(${-LIFT}px) scale(${DROP})`}}>
        <OffthreadVideo src={staticFile('base.mp4')} muted style={{width: W, height: H, transformOrigin: `${ZO[0]}px ${ZO[1]}px`, transform: `scale(${z})`}} />
      </div>
    </AbsoluteFill>
  );
};

// il cerchio con il volto durante gli inserti, centrato sul viso tracciato
const Pip: React.FC<{t: number; a: number; b: number; x?: number; y?: number}> = ({t, a, b, x = 48, y = 1110}) => {
  const v = life(t, a + 0.35, b - 0.05, 0.4, 0.2);
  if (v <= 0) return null;
  const D = 350;
  const [x0, y0, x1, y1] = faceAt(t);
  const fw = x1 - x0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + 10;
  const sc = (D * 0.95) / fw;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: D, height: D, borderRadius: D, overflow: 'hidden', border: `7px solid ${WHITE}`, boxShadow: '0 18px 44px rgba(0,65,59,0.28)', transform: `scale(${eBack(v)})`, opacity: clamp(v * 2), background: CREAM}}>
      <div style={{position: 'absolute', width: W, height: H, left: D / 2 - cx * sc, top: D / 2 - cy * sc, transformOrigin: '0 0', transform: `scale(${sc})`}}>
        <Video t={t} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ stile grafico delle storie */

type Ln = {text: string; hi?: boolean; size?: number};

// titoli condensati maiuscoli, parola chiave in box menta
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
              color: l.hi ? PETROL_D : WHITE, background: l.hi ? MINT : PETROL, padding: '8px 24px 10px', borderRadius: 14,
              boxShadow: '0 12px 34px rgba(0,65,59,0.25)',
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
    sun: <><circle {...st} cx="12" cy="12" r="4" /><path {...st} d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></>,
    moon: <path {...st} d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z" />,
    flame: <path {...st} d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 2-5 5-5 8 0 4 3 7 7 7z" />,
    drop: <path {...st} d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z" />,
    sparkle: <path {...st} d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 3v4M17 5h4" />,
    wind: <path {...st} d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8" />,
    brush: <><rect {...st} x="4" y="3" width="16" height="8" rx="3" /><path {...st} d="M7 11v3M10 11v3M13 11v3M16 11v3M12 14v7" /></>,
    iron: <><path {...st} d="M3 7h12l4 4v4H3z" /><path {...st} d="M6 15v3M16 15v3" /></>,
    clock: <><circle {...st} cx="12" cy="12" r="9" /><path {...st} d="M12 7v5l3 3" /></>,
    thermo: <path {...st} d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z" />,
    apple: <path {...st} d="M12 7c-2-2-7-2-7 4 0 5 3 10 7 9 4 1 7-4 7-9 0-6-5-6-7-4zM12 7c0-2 1-4 3-4" />,
    bolt: <path {...st} d="M13 2L4 14h7l-1 8 9-12h-7z" />,
    check: <path {...st} d="M5 12l5 5 9-10" />,
    arrow: <path {...st} d="M5 12h14M13 6l6 6-6 6" />,
    up: <path {...st} d="M12 20V5M6 11l6-6 6 6" />,
    leaf: <path {...st} d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l7-7" />,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24">{P[name]}</svg>;
};

const Chip: React.FC<{t: number; a: number; b: number; text: string; icon: string; size?: number; hi?: boolean}> = ({t, a, b, text, icon, size = 36, hi}) => {
  if (t < a || t > b) return null;
  const p = prog(t, a, a + 0.5), s = soft(p * 1.6);
  const out = eO3(prog(t, b - 0.2, b));
  const bg = hi ? MINT : WHITE, fg = hi ? PETROL_D : PETROL;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px 10px 10px', borderRadius: 999, background: bg, boxShadow: '0 10px 28px rgba(0,65,59,0.22)',
      fontFamily: MONT, fontWeight: 800, fontSize: size, color: fg, textTransform: 'uppercase', whiteSpace: 'nowrap',
      transform: `translateY(${(1 - s) * 40 + out * 20}px) scale(${lerp(0.7, 1, s)})`, opacity: clamp(p * 4) * (1 - out)}}>
      <div style={{width: size * 1.5, height: size * 1.5, borderRadius: 99, background: hi ? PETROL : MINT, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={icon} c={WHITE} s={size * 0.95} />
      </div>
      {text}
    </div>
  );
};

const Row: React.FC<{y: number; gap?: number; children: React.ReactNode; wrap?: boolean; x?: number; right?: number}> = ({y, gap = 14, children, wrap, x = 40, right = 40}) => (
  <div style={{position: 'absolute', left: x, right, top: y, display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: 'center', gap}}>{children}</div>
);

// CTA a pillola come nelle storie
const Cta: React.FC<{t: number; a: number; b: number; text: string; y: number; size?: number}> = ({t, a, b, text, y, size = 44}) => {
  if (t < a || t > b) return null;
  const p = prog(t, a, a + 0.6), s = soft(p * 1.6);
  const out = eO3(prog(t, b - 0.2, b));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: clamp(p * 4) * (1 - out)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '18px 18px 18px 40px', borderRadius: 999, background: PETROL, boxShadow: '0 18px 40px rgba(0,65,59,0.35)',
        fontFamily: MONT, fontWeight: 700, fontSize: size, color: WHITE, transform: `scale(${lerp(0.75, 1, s)})`}}>
        {text}
        <div style={{width: size * 1.55, height: size * 1.55, borderRadius: 99, background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon name="arrow" c={PETROL} s={size * 0.9} />
        </div>
      </div>
    </div>
  );
};

// onde menta/bianche come nella parte bassa delle storie
const Waves: React.FC<{t: number; y?: number; o?: number}> = ({t, y = 1500, o = 1}) => {
  const ph = t * 0.6;
  const path = (amp: number, off: number, k: number) => {
    let d = `M 0 ${H}`;
    for (let x = 0; x <= W; x += 30) d += ` L ${x} ${y + off + Math.sin(x / 260 * k + ph * k) * amp}`;
    return d + ` L ${W} ${H} Z`;
  };
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: o}}>
      <path d={path(40, -60, 1)} fill={MINT_HI} opacity={0.55} />
      <path d={path(30, 0, 1.3)} fill={MINT} opacity={0.5} />
      <path d={path(24, 70, 0.8)} fill={WHITE} opacity={0.9} />
    </svg>
  );
};

const Stage: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, #ffffff 0%, #e6f6f1 40%, #bfe4d8 100%)`}}>
    <Waves t={t} y={1520} />
  </AbsoluteFill>
);

const Corner: React.FC = () => (
  <div style={{position: 'absolute', right: 44, top: 70, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px 10px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 24px rgba(0,65,59,0.12)'}}>
    <Img src={staticFile('logo/mark.png')} style={{width: 30, height: 51}} />
    <Img src={staticFile('logo/wordmark.png')} style={{width: 130, height: 53}} />
  </div>
);

/* ------------------------------------------------------------------ inserti */

// clip fotorealistica a tutto schermo (già ritemporizzata sulla durata dell'inserto in prep_ai.py)
const Clip: React.FC<{name: string; t: number; a: number}> = ({name, t, a}) => {
  const lt = t - a;
  // la clip parte mezza transizione prima dell'inserto (durate in inserts.json)
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: CREAM}}>
      <Sequence from={Math.round((a - CUBE / 2) * FPS)} layout="none">
        <OffthreadVideo src={staticFile(`ai/${name}.mp4`)} muted style={{width: W, height: H, objectFit: 'cover', transform: `scale(${1.04 + lt * 0.006})`}} />
      </Sequence>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(243,251,248,0.75) 0%, rgba(243,251,248,0) 22%, rgba(243,251,248,0) 60%, rgba(243,251,248,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};


const InsSerum: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.serum;
  return (
    <>
      <Clip name="serum" t={t} a={a} />
      <Title t={t} a={a + 0.05} b={b + 1} y={150} lines={[{text: 'trattamento', size: 80}, {text: 'più mirato', hi: true, size: 80}]} stag={0.25} />
      <Row y={1180} x={420} right={40}><Chip t={t} a={w('stravolgere') - 0.1} b={b + 1} text="senza stravolgere il viso" icon="check" size={28} /></Row>
      <Corner />
    </>
  );
};

const InsPeptides: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.peptides;
  return (
    <>
      <Clip name="peptides" t={t} a={a} />
      <Title t={t} a={w('mix') - 0.1} b={b + 1} y={150} lines={[{text: 'mix avanzato', size: 84}, {text: 'di peptidi', hi: true, size: 84}]} stag={0.3} />
      <div style={{position: 'absolute', left: 430, right: 40, top: 1150, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        <Chip t={t} a={w('rughe') - 0.1} b={b + 1} text="rughe d'espressione" icon="sparkle" size={30} />
        <Chip t={t} a={w('linee', 3) - 0.1} b={b + 1} text="linee sottili" icon="sparkle" size={30} hi />
      </div>
      <Corner />
    </>
  );
};

const InsSatin: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.satin;
  return (
    <>
      <Clip name="satin" t={t} a={a} />
      <Title t={t} a={w('distendere') - 0.1} b={w('effetto') - 0.1} y={150} lines={[{text: 'distende', size: 88}, {text: 'la pelle', hi: true, size: 88}]} stag={0.25} />
      <Title t={t} a={w('effetto') - 0.1} b={b + 1} y={150} lines={[{text: 'effetto', size: 88}, {text: 'tensore', hi: true, size: 88}]} stag={0.25} />
      <div style={{position: 'absolute', left: 430, right: 40, top: 1150, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        <Chip t={t} a={w('tono') - 0.1} b={b + 1} text="tono" icon="up" size={30} />
        <Chip t={t} a={w("dell'elasticità") - 0.1} b={b + 1} text="elasticità" icon="up" size={30} hi />
      </div>
      <Corner />
    </>
  );
};

const InsLab: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.lab;
  return (
    <>
      <Clip name="lab" t={t} a={a} />
      <Title t={t} a={a + 0.1} b={b + 1} y={150} lines={[{text: 'test strumentali', size: 82}]} />
      <Row y={270} gap={12}><Chip t={t} a={w('20') - 0.1} b={b + 1} text="su 20 soggetti" icon="check" size={32} hi /></Row>
      <div style={{position: 'absolute', left: 430, right: 40, top: 1150, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        <Chip t={t} a={w('profondità') - 0.1} b={b + 1} text="− profondità rughe" icon="up" size={30} />
        <Chip t={t} a={w('volume') - 0.1} b={b + 1} text="− volume rughe" icon="up" size={30} />
      </div>
      <Corner />
    </>
  );
};

const InsMixing: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.mixing;
  return (
    <>
      <Clip name="mixing" t={t} a={a} />
      <Title t={t} a={w('crema') - 0.15} b={b + 1} y={150} lines={[{text: 'insieme', size: 84}, {text: 'alla tua crema', hi: true, size: 84}]} stag={0.25} />
      <div style={{position: 'absolute', left: 430, right: 40, top: 1150, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        <Chip t={t} a={w('mano') - 0.1} b={b + 1} text="sul palmo della mano" icon="drop" size={30} />
        <Chip t={t} a={w('34') - 0.1} b={b + 1} text="3-4 gocce" icon="drop" size={30} hi />
      </div>
      <Corner />
    </>
  );
};

const InsEnd: React.FC<{t: number}> = ({t}) => {
  const [a] = INS.end;
  const lt = t - a;
  const wv = eO5(prog(lt, 0.5, 1.0)), pay = eO5(prog(lt, 0.8, 1.3));
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, #ffffff 0%, ${CREAM} 55%, #d5eee6 100%)`}} />
      <Waves t={t} y={1580} />
      <div style={{position: 'absolute', left: 0, top: 230, width: W, height: 620}}>
        <Logo3D lt={lt} w={W} h={620} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <Img src={staticFile('logo/wordmark.png')} style={{width: 560, height: 226, opacity: wv, transform: `translateY(${(1 - wv) * 40}px)`}} />
        <div style={{fontFamily: MONT, fontWeight: 600, fontStyle: 'italic', fontSize: 40, color: FOREST, opacity: pay, transform: `translateY(${(1 - pay) * 30}px)`}}>Dal 1909, nel cuore di Brindisi</div>
      </div>
      <Cta t={t} a={a + 1.1} b={DURATION + 1} text="Parlane con noi" y={1250} size={44} />
    </>
  );
};


const INSERT: Record<Key, React.FC<{t: number}>> = {serum: InsSerum, peptides: InsPeptides, satin: InsSatin, lab: InsLab, mixing: InsMixing, end: InsEnd};

/* ------------------------------------------------------------------ grafiche sulla persona (sotto il mento; a sinistra quando mostra il flacone) */

const OnFace: React.FC<{t: number}> = ({t}) => {
  const L = (a: number, b: number) => safeTop(a, b);
  const y0 = L(0, segEnd(0)), y1 = L(segT(1), segEnd(1)), y2 = L(segT(2), segEnd(3)), y4 = L(segT(4), segEnd(4));
  const y6 = L(segT(6), segEnd(7)), y8 = L(segT(8), INS.peptides[0]), y9 = L(INS.satin[1], segEnd(9)), y10 = L(INS.lab[1], segEnd(10));
  const y11 = L(segT(11), segEnd(12)), y13 = L(segT(13), INS.mixing[0]), y14 = L(segT(14), SPEECH_END);
  const left = {x: 50, align: 'left' as const};
  return (
    <>
      {/* hook */}
      <Title t={t} a={0.1} b={w('pelle') - 0.1} y={y0} lines={[{text: 'allo specchio…', size: 78}]} />
      <Title t={t} a={w('pelle') - 0.1} b={segEnd(0)} y={y0} lines={[{text: 'pelle meno', size: 82}, {text: 'distesa?', hi: true, size: 82}]} stag={0.35} />

      {/* linee */}
      <Title t={t} a={w('linee') - 0.1} b={segEnd(1)} y={y1} lines={[{text: 'linee sottili', size: 72}]} />
      <Row y={y1 + 104}>
        <Chip t={t} a={w('occhi') - 0.1} b={segEnd(1)} text="occhi" icon="sparkle" size={32} />
        <Chip t={t} a={w('labbra') - 0.1} b={segEnd(1)} text="labbra" icon="sparkle" size={32} />
        <Chip t={t} a={w('fronte') - 0.1} b={segEnd(1)} text="fronte" icon="sparkle" size={32} />
      </Row>

      {/* rassicurazione */}
      <Title t={t} a={w('normale') - 0.15} b={segEnd(2)} y={y2} lines={[{text: 'è normale', hi: true, size: 90}]} />
      <Title t={t} a={w('cancellare') - 0.2} b={segEnd(3)} y={y2} lines={[{text: 'non sono da cancellare', size: 66}, {text: 'a tutti i costi', hi: true, size: 66}]} stag={0.3} />

      {/* desiderio */}
      <Title t={t} a={w('bisogno') - 0.1} b={segEnd(4)} y={y4} lines={[{text: 'una pelle più…', size: 70}]} />
      <Row y={y4 + 100}>
        <Chip t={t} a={w('tonica') - 0.1} b={segEnd(4)} text="tonica" icon="up" size={32} />
        <Chip t={t} a={w('elastica') - 0.1} b={segEnd(4)} text="elastica" icon="up" size={32} />
        <Chip t={t} a={w('levigata') - 0.1} b={segEnd(4)} text="levigata" icon="up" size={32} hi />
      </Row>

      {/* prodotto: tutto a sinistra, il flacone è a destra */}
      <Row y={y6} x={50} right={500}><Chip t={t} a={w('novità') - 0.1} b={segEnd(6)} text="novità" icon="sparkle" size={32} hi /></Row>
      <Title t={t} a={w('farmacisti') - 0.1} b={segEnd(6)} y={y6 + 96} {...left} lines={[{text: 'farmacisti', size: 62}, {text: 'preparatori', size: 62}]} stag={0.15} />
      <ProductTag t={t} a={w('multipeptide') - 0.2} b={segEnd(7)} y={y6} />
      <Row y={y8} x={50} right={500}><Chip t={t} a={segT(8) + 0.1} b={INS.peptides[0] + 0.1} text="concentrato" icon="drop" size={32} hi /></Row>
      <Title t={t} a={INS.satin[1] - 0.1} b={segEnd(9)} y={y9} {...left} lines={[{text: 'fin dalla prima', size: 62}, {text: 'applicazione', hi: true, size: 62}]} stag={0.2} />

      {/* 15 minuti */}
      <Title t={t} a={w('15') - 0.2} b={segEnd(10)} y={y10} lines={[{text: 'già dopo', size: 64}, {text: '15 minuti', hi: true, size: 96}]} stag={0.2} />
      <Row y={y10 + 230}><Chip t={t} a={w('contornocchi') - 0.1} b={segEnd(10)} text="contorno occhi" icon="check" size={30} /></Row>

      {/* onestà */}
      <Row y={y11}><Chip t={t} a={w('medico') - 0.3} b={segEnd(11)} text="non è un trattamento medico" icon="check" size={30} /></Row>
      <Row y={y11 + 86}><Chip t={t} a={w('persona') - 0.1} b={segEnd(11)} text="risultati da persona a persona" icon="leaf" size={30} hi /></Row>
      <Title t={t} a={w('usa') - 0.3} b={segEnd(12)} y={y11} lines={[{text: 'come si usa?', hi: true, size: 88}]} />

      {/* uso */}
      <Title t={t} a={w('applicare') - 0.1} b={INS.mixing[0] + 0.1} y={y13} lines={[{text: 'sul viso deterso', size: 68}]} />
      <Row y={y13 + 100}>
        <Chip t={t} a={w('23') - 0.1} b={INS.mixing[0] + 0.1} text="2-3 gocce" icon="drop" size={32} hi />
        <Chip t={t} a={w('mattina') - 0.1} b={INS.mixing[0] + 0.1} text="mattina e sera" icon="sun" size={32} />
      </Row>

      {/* CTA */}
      <Cta t={t} a={w('fini') - 0.1} b={SPEECH_END + 0.2} text="Vieni a parlarne con noi" y={y14} size={40} />
      <Title t={t} a={w('esigenze') - 0.6} b={SPEECH_END + 0.2} y={y14 + 120} lines={[{text: 'la tua routine', size: 62}, {text: 'su misura', hi: true, size: 62}]} stag={0.2} />
    </>
  );
};

// cartellino prodotto con freccia verso il flacone che lei tiene a destra
const ProductTag: React.FC<{t: number; a: number; b: number; y: number}> = ({t, a, b, y}) => {
  if (t < a || t > b) return null;
  const p = prog(t, a, a + 0.7), s = soft(p * 1.6);
  const ar = eO3(prog(t, a + 0.4, a + 0.9));
  const out = eO3(prog(t, b - 0.25, b));
  return (
    <div style={{position: 'absolute', left: 50, top: y, opacity: clamp(p * 3) * (1 - out), transform: `translateX(${(1 - s) * -80}px)`}}>
      <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 30, color: PETROL, letterSpacing: '0.08em', background: WHITE, display: 'inline-block', padding: '8px 18px', borderRadius: 12, marginBottom: 10}}>ATTIVO</div>
      <div style={{fontFamily: ANTON, fontSize: 92, lineHeight: 1, color: WHITE, background: PETROL, padding: '10px 26px 12px', borderRadius: 16, boxShadow: '0 14px 36px rgba(0,65,59,0.3)'}}>MULTIPEPTIDE</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 10}}>
        <div style={{fontFamily: ANTON, fontSize: 92, lineHeight: 1, color: PETROL_D, background: MINT, padding: '10px 26px 12px', borderRadius: 16}}>BTX 13%</div>
        <svg width={170} height={80} style={{overflow: 'visible'}}>
          <path d="M 4 40 C 60 40, 100 10, 160 4" fill="none" stroke={WHITE} strokeWidth={7} strokeLinecap="round" strokeDasharray={200} strokeDashoffset={200 * (1 - ar)} style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'}} />
          <circle cx={160} cy={4} r={11 * ar} fill={MINT} stroke={WHITE} strokeWidth={4} />
        </svg>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ transizioni 3D */

// cubo: la faccia A ruota via e la B entra dal lato, come due facce dello stesso solido
const Cube: React.FC<{p: number; dir: 1 | -1; a: React.ReactNode; b: React.ReactNode}> = ({p, dir, a, b}) => {
  const e = eIO(p);
  const face = (rot: number, child: React.ReactNode, shade: number) => (
    <div style={{position: 'absolute', width: W, height: H, overflow: 'hidden', backfaceVisibility: 'hidden', transform: `rotateY(${rot}deg) translateZ(${W / 2}px)`}}>
      {child}
      <AbsoluteFill style={{background: PETROL_D, opacity: shade * 0.45}} />
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
  // transizione in corso?
  for (const k of KEYS) {
    const [a, b] = INS[k];
    const C = INSERT[k];
    if (t >= a - CUBE / 2 && t < a + CUBE / 2) {
      return <Cube p={prog(t, a - CUBE / 2, a + CUBE / 2)} dir={1} a={<Video t={t} />} b={<C t={t} />} />;
    }
    if (k !== 'end' && t >= b - CUBE / 2 && t < b + CUBE / 2) {
      return <Cube p={prog(t, b - CUBE / 2, b + CUBE / 2)} dir={1} a={<C t={t} />} b={<Video t={t} />} />;
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
        <AbsoluteFill style={{transform: `translateZ(${-ps * 420}px) rotateX(${ps * 9}deg) rotateY(${ps * -6}deg)`, borderRadius: ps * 60, overflow: 'hidden', boxShadow: ps > 0 ? `0 ${40 * ps}px ${90 * ps}px rgba(0,65,59,${0.35 * ps})` : 'none'}}>
          <Video t={t} />
          <OnFace t={t} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

