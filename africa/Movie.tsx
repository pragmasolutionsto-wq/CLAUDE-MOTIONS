import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Logo3D} from './three';
import {
  ANTON, AUTUMN, CREAM, DROP, DURATION, FPS, FOREST, H, LIFT, MINT, MINT_HI, MONT, PETROL, PETROL_D, SAGE, SPEECH_END, SUB_TOP, W, WARM, WHITE,
  ZO, clamp, eBack, eIO, eO3, eO5, faceAt, lerp, life, prog, rnd, safeTop, segEnd, segT, soft, w, zoomAt,
} from './util';

/* ------------------------------------------------------------------ struttura: inserti 3D a schermo pieno */

const INS = {
  cycle: [segT(2), segEnd(3)],
  cal: [segT(5), segEnd(5)],
  strand: [w('che') - 0.05, segEnd(7)],
  tips: [w('sicuramente', 2) - 0.12, segEnd(11)],
  end: [SPEECH_END, DURATION],
} as const;
type Key = keyof typeof INS;
const KEYS = Object.keys(INS) as Key[];
const CUBE = 0.6; // durata transizione cubo
const PUSH = [segT(1), segT(7), segT(9)];

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
const Pip: React.FC<{t: number; a: number; b: number; x?: number; y?: number}> = ({t, a, b, x = 56, y = 1214}) => {
  const v = life(t, a + 0.35, b - 0.05, 0.4, 0.2);
  if (v <= 0) return null;
  const D = 250;
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

const Phase: React.FC<{on: number; text: string; c: string}> = ({on, text, c}) => (
  <div style={{fontFamily: ANTON, fontSize: 58, textTransform: 'uppercase', padding: '6px 22px 8px', borderRadius: 14, color: on > 0.5 ? WHITE : PETROL, background: on > 0.5 ? c : 'rgba(255,255,255,0.85)', boxShadow: on > 0.5 ? `0 12px 30px ${c}66` : 'none', transform: `scale(${1 + on * 0.08})`, transition: 'none'}}>
    {text}
  </div>
);

const InsCycle: React.FC<{t: number}> = ({t}) => {
  const [a] = INS.cycle;
  const lt = t - a;
  const g = w('cresce'), s = w('ferma'), f = w('cade');
  const on = (x: number, y: number) => (t >= x && t < y ? 1 : 0);
  return (
    <>
      <Clip name="cycle" t={t} a={a} />
      <Title t={t} a={a + 0.15} b={INS.cycle[1] + 1} y={150} lines={[{text: 'il ciclo del capello', size: 84}]} />
      <div style={{position: 'absolute', left: 330, right: 30, top: 1250, display: 'flex', gap: 14, justifyContent: 'center', opacity: eO3(prog(t, a + 0.6, a + 1.1))}}>
        <Phase on={on(g - 0.1, s - 0.1)} text="cresce" c={MINT} />
        <Phase on={on(s - 0.1, f - 0.1)} text="si ferma" c={FOREST} />
        <Phase on={on(f - 0.1, 99)} text="cade" c={PETROL} />
      </div>
      <Corner />
    </>
  );
};

const InsCal: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.cal;
  const lt = t - a;
  const at = [0.05, 0.2, w('settembre') - a, w('settembre') - a + 0.3, w('novembre') - a];
  const up = w('aumenta') - a;
  return (
    <>
      <Clip name="autumn" t={t} a={a} />
      <Title t={t} a={a + 0.05} b={b + 1} y={150} lines={[{text: '2-3 mesi dopo', size: 84}]} />
      <Row y={300} gap={14}>
        {['settembre', 'ottobre', 'novembre'].map((m, i) => (
          <Chip key={m} t={t} a={(i === 0 ? at[2] : i === 1 ? at[3] : at[4]) + a - 0.05} b={b + 1} text={m} icon="leaf" size={34} hi={i === 1} />
        ))}
      </Row>
      <div style={{position: 'absolute', left: 330, right: 30, top: 1230}}>
        <Title t={t} a={a + up - 0.1} b={b + 1} y={0} lines={[{text: 'la caduta aumenta', hi: true, size: 66}]} />
      </div>
      <Corner />
    </>
  );
};

const InsStrand: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.strand;
  const fr = w('fragilità'), br = w('rottura');
  return (
    <>
      <Clip name="strand" t={t} a={a} />
      <Title t={t} a={fr - 0.1} b={b + 1} y={160} lines={[{text: 'fragilità', size: 96}]} />
      <Title t={t} a={br - 0.05} b={b + 1} y={290} lines={[{text: 'e rottura', hi: true, size: 96}]} />
      <Corner />
    </>
  );
};

const InsTips: React.FC<{t: number}> = ({t}) => {
  const [a, b] = INS.tips;
  const at = [w('detergenti'), w('meno'), w('termoprotettore'), w('sostegno')];
  const labels = [['detergenti', 'delicati'], ['meno calore', 'diretto'], ['sempre il', 'termoprotettore'], ['un sostegno', 'per i capelli']];
  return (
    <>
      <Clip name="tips" t={t} a={a} />
      <Title t={t} a={a + 0.05} b={b + 1} y={150} lines={[{text: 'nel frattempo', size: 84}]} />
      <div style={{position: 'absolute', left: 340, right: 40, top: 860, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16}}>
        {labels.map((l, i) => (
          <Chip key={i} t={t} a={at[i] - 0.05} b={b + 1} text={l.join(' ')} icon={['drop', 'flame', 'check', 'leaf'][i]} size={30} hi={i === 2} />
        ))}
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

const INSERT: Record<Key, React.FC<{t: number}>> = {cycle: InsCycle, cal: InsCal, strand: InsStrand, tips: InsTips, end: InsEnd};

/* ------------------------------------------------------------------ grafiche sulla persona (sempre sotto il mento) */

const OnFace: React.FC<{t: number}> = ({t}) => {
  const L = (a: number, b: number) => safeTop(a, b);
  const y0 = L(0, segEnd(0)), y1 = L(segT(1), segEnd(1)), y4 = L(segT(4), segEnd(4)), y6 = L(segT(6), segEnd(6));
  const y7 = L(segT(7), INS.strand[0]), y8 = L(segT(8), segEnd(8)), y9 = L(segT(9), segEnd(10)), y11 = L(segT(11), INS.tips[0]), y12 = L(segT(12), SPEECH_END);
  return (
    <>
      {/* hook */}
      <Title t={t} a={w('perdendo') - 0.1} b={segEnd(0)} y={y0} lines={[{text: 'perdi più capelli', size: 78}, {text: 'del solito?', hi: true, size: 78}]} stag={0.55} />

      {/* caduta stagionale */}
      <Row y={y1}><Chip t={t} a={w('tranquilla') - 0.05} b={segEnd(1)} text="tranquilla" icon="leaf" hi /></Row>
      <Title t={t} a={w('normale') - 0.1} b={segEnd(1)} y={y1 + 96} lines={[{text: 'caduta stagionale', size: 78}]} />

      {/* riposo estivo */}
      <Title t={t} a={w('riposo') - 0.15} b={segEnd(4)} y={y4} lines={[{text: 'follicoli', size: 70}, {text: 'a riposo', hi: true, size: 70}]} stag={0.2} />
      <Row y={y4 + 200} x={60} right={60}>
        <Chip t={t} a={w('luglio') - 0.05} b={segEnd(4)} text="luglio" icon="sun" size={32} />
        <Chip t={t} a={w('agosto') - 0.05} b={segEnd(4)} text="agosto" icon="sun" size={32} />
      </Row>

      {/* UV e calore → stress ossidativo */}
      <Title t={t} a={w("un'estate") - 0.1} b={w('stress') - 0.1} y={y6} lines={[{text: "dopo un'estate", size: 66}, {text: 'calda e intensa', hi: true, size: 66}]} stag={0.25} />
      <Title t={t} a={w('stress') - 0.05} b={segEnd(6)} y={y6} lines={[{text: 'stress', size: 74}, {text: 'ossidativo', hi: true, size: 74}]} stag={0.2} />
      <Row y={y6 + 210} x={60} right={60}>
        <Chip t={t} a={w('uv') - 0.05} b={segEnd(6)} text="raggi UV" icon="sun" size={30} />
        <Chip t={t} a={w('calore') - 0.05} b={segEnd(6)} text="calore" icon="flame" size={30} />
      </Row>

      {/* stress meccanico e chimico */}
      <Title t={t} a={segT(7) + 0.1} b={INS.strand[0] + 0.1} y={y7} lines={[{text: 'per non parlare di…', size: 62}]} />
      <Row y={y7 + 100} wrap gap={12}>
        <Chip t={t} a={w('tinte') - 0.05} b={INS.strand[0] + 0.1} text="tinte" icon="drop" size={32} />
        <Chip t={t} a={w('schiariture') - 0.05} b={INS.strand[0] + 0.1} text="schiariture" icon="sparkle" size={32} />
        <Chip t={t} a={w('phon') - 0.05} b={INS.strand[0] + 0.1} text="phon" icon="wind" size={32} />
        <Chip t={t} a={w('spazzole') - 0.05} b={INS.strand[0] + 0.1} text="spazzole" icon="brush" size={32} />
        <Chip t={t} a={w('piastra') - 0.05} b={INS.strand[0] + 0.1} text="piastra" icon="iron" size={32} />
      </Row>

      {/* temporanea */}
      <Row y={y8} x={60} right={60}><Chip t={t} a={w('tranquilla', 2) - 0.1} b={segEnd(8)} text="sei tranquilla" icon="check" hi size={32} /></Row>
      <Title t={t} a={w('temporanea') - 0.15} b={segEnd(8)} y={y8 + 92} lines={[{text: 'è temporanea', size: 80}]} />

      {/* quando approfondire */}
      <Title t={t} a={w('se') - 0.1} b={w('approfondire') - 0.1} y={y9} lines={[{text: 'quando approfondire', size: 64}]} />
      <Row y={y9 + 96} wrap gap={12}>
        <Chip t={t} a={w('dura') - 0.05} b={w('approfondire') - 0.1} text="oltre 3 mesi" icon="clock" size={30} />
        <Chip t={t} a={w('malattie') - 0.05} b={w('approfondire') - 0.1} text="malattie" icon="thermo" size={30} />
        <Chip t={t} a={w('diete') - 0.05} b={w('approfondire') - 0.1} text="diete restrittive" icon="apple" size={30} />
        <Chip t={t} a={w('stress', 2) - 0.05} b={w('approfondire') - 0.1} text="forte stress" icon="bolt" size={30} />
      </Row>
      <Title t={t} a={w('approfondire') - 0.05} b={segEnd(10)} y={y9} lines={[{text: 'bisogna capire', size: 76}, {text: 'cosa è successo', hi: true, size: 76}]} stag={0.9} />

      {/* consiglio */}
      <Title t={t} a={w('consiglio') - 0.25} b={INS.tips[0] + 0.1} y={y11} lines={[{text: 'cosa ti consiglio?', size: 80}]} />

      {/* CTA */}
      <Cta t={t} a={w('vieni') - 0.1} b={SPEECH_END + 0.2} text="Vieni a parlarne con noi" y={y12} size={40} />
      <Title t={t} a={w('aspettiamo') - 0.15} b={SPEECH_END + 0.2} y={y12 + 120} lines={[{text: 'ti aspettiamo!', hi: true, size: 70}]} />
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
        {inside !== 'end' && <Pip t={t} a={INS[inside][0]} b={INS[inside][1]} y={inside === 'tips' ? 1240 : 1214} />}
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

