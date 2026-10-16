import React from 'react';
import {AbsoluteFill, Sequence, random, useCurrentFrame} from 'remotion';
import {Line, Stage, Tag, prog, sp} from './kit';
import {C, SANS, SERIF} from './theme';

/* ============ Layout comune dei trattamenti ============ */
type TreatProps = {
  n: number;
  name: string[];
  nameSize: number;
  desc: string;
  chip: string;
  bg: string;
  fg: string;
  accent: string;
  children: React.ReactNode;
};

const Treat: React.FC<TreatProps> = ({n, name, nameSize, desc, chip, bg, fg, accent, children}) => {
  const f = useCurrentFrame();
  const g = sp(f, 0, 16, 90, 1);
  const d = prog(f, 44, 22);
  const c = sp(f, 62, 12, 170, 0.6);
  return (
    <Stage bg={bg} fg={fg}>
      <div
        style={{
          position: 'absolute',
          right: 40,
          top: 60,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 480,
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: `3px ${fg}`,
          opacity: 0.16,
          letterSpacing: '-0.05em',
          transform: `translateX(${(1 - prog(f, 0, 24)) * 200}px)`,
        }}
      >
        {String(n).padStart(2, '0')}
      </div>
      <div style={{position: 'absolute', left: 30, top: 90, width: 900, height: 900, transform: `scale(${0.6 + 0.4 * Math.min(g, 1.05)})`, opacity: Math.min(1, g * 1.5)}}>{children}</div>
      <div style={{position: 'absolute', left: 990, top: 230, width: 860}}>
        <Tag text={`TRATTAMENTO ${n}/4`} color={fg === C.navy ? fg : accent} delay={4} />
        <div style={{height: 24}} />
        {name.map((l, i) => (
          <Line key={l} text={l} size={nameSize} color={fg} delay={8 + i * 5} />
        ))}
        <div
          style={{
            marginTop: 28,
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 58,
            lineHeight: 1.12,
            color: fg,
            opacity: d,
            transform: `translateY(${(1 - d) * 30}px)`,
          }}
        >
          {desc}
        </div>
        <div
          style={{
            marginTop: 36,
            display: 'inline-block',
            padding: '16px 34px',
            borderRadius: 100,
            border: `3px solid ${fg}`,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: '0.24em',
            color: fg,
            transform: `scale(${c})`,
          }}
        >
          {chip}
        </div>
      </div>
      {/* indicatore 1-4 */}
      <div style={{position: 'absolute', left: 990, bottom: 74, display: 'flex', gap: 16}}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{width: i === n ? 90 : 24, height: 10, borderRadius: 10, background: fg, opacity: i === n ? 1 : 0.3}} />
        ))}
      </div>
    </Stage>
  );
};

/* ---------- 1. IHHT: respiro ipossia / iperossia ---------- */
const IhhtGfx: React.FC<{fg: string; accent: string}> = ({fg, accent}) => {
  const f = useCurrentFrame();
  const s = 0.5 - 0.5 * Math.cos((f / 60) * Math.PI * 2);
  const r = 120 + 190 * s;
  const high = s > 0.5;
  const off = (f * 5) % 300;
  let d = '';
  for (let k = -2; k < 9; k++) {
    const x0 = k * 150 - off;
    const y = k % 2 === 0 ? 70 : 10;
    const yn = k % 2 === 0 ? 10 : 70;
    d += `${d ? ' L' : 'M'}${x0},${y} L${x0 + 150},${y} L${x0 + 150},${yn}`;
  }
  return (
    <svg width={900} height={900}>
      {new Array(14).fill(0).map((_, i) => {
        const a = (i / 14) * Math.PI * 2 + f * 0.03;
        return <circle key={i} cx={450 + Math.cos(a) * 395} cy={400 + Math.sin(a) * 395} r={high ? 10 : 6} fill={accent} />;
      })}
      <circle cx={450} cy={400} r={r + 40} fill="none" stroke={fg} strokeWidth={3} opacity={0.35} />
      <circle cx={450} cy={400} r={r} fill={accent} />
      <text x={450} y={440} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize={120} fill={C.navy}>
        O₂
      </text>
      <text x={450} y={680} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize={34} letterSpacing={10} fill={fg}>
        {high ? 'IPEROSSIA ▲' : 'IPOSSIA ▼'}
      </text>
      <g transform="translate(0 760)">
        <path d={d} fill="none" stroke={accent} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export const Ihht: React.FC = () => (
  <Treat n={1} name={['IHHT']} nameSize={260} desc="Aria povera e ricca di ossigeno, in alternanza." chip="NON INVASIVA" bg={C.navy} fg={C.ivory} accent={C.champ}>
    <IhhtGfx fg={C.ivory} accent={C.champ} />
  </Treat>
);

/* ---------- 2. Idrogeno molecolare ---------- */
const H2Gfx: React.FC<{fg: string; accent: string}> = ({fg, accent}) => {
  const f = useCurrentFrame();
  const tilt = Math.sin(f / 22) * 22;
  return (
    <svg width={900} height={900}>
      {new Array(18).fill(0).map((_, i) => {
        const sz = 14 + random('bs' + i) * 40;
        const x = 50 + random('bx' + i) * 800 + Math.sin(f / 14 + i) * 14;
        const v = 1.4 + random('bv' + i) * 2.6;
        const y = 960 - ((f * v + random('by' + i) * 1100) % 1100);
        return <circle key={i} cx={x} cy={y} r={sz} fill={accent} fillOpacity={0.45} stroke={fg} strokeWidth={3} />;
      })}
      <g transform={`translate(450 450) rotate(${tilt})`}>
        {[0, 60, 120].map((a, k) => {
          const th = f * 0.09 + k * 2.1;
          return (
            <g key={a} transform={`rotate(${a})`}>
              <ellipse rx={330} ry={120} fill="none" stroke={fg} strokeWidth={3} opacity={0.5} />
              <circle cx={Math.cos(th) * 330} cy={Math.sin(th) * 120} r={14} fill={fg} />
            </g>
          );
        })}
        <circle cx={-98} cy={0} r={112} fill={fg} />
        <circle cx={98} cy={0} r={112} fill={fg} stroke={accent} strokeWidth={5} />
        <text x={-98} y={34} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize={100} fill={C.ivory === fg ? C.navy : C.ivory}>
          H
        </text>
        <text x={98} y={34} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize={100} fill={C.ivory === fg ? C.navy : C.ivory}>
          H
        </text>
      </g>
    </svg>
  );
};

export const H2: React.FC = () => (
  <Treat n={2} name={['IDROGENO', 'MOLECOLARE']} nameSize={112} desc="Inalazione di H₂ e acqua arricchita di idrogeno." chip="INALAZIONE · ACQUA H₂" bg={C.ivory} fg={C.navy} accent={C.champ}>
    <H2Gfx fg={C.navy} accent={C.champ} />
  </Treat>
);

/* ---------- 3. IV Therapy ---------- */
const IvGfx: React.FC<{fg: string; accent: string}> = ({fg, accent}) => {
  const f = useCurrentFrame();
  const t = (f % 48) / 48;
  const fall = Math.min(1, t / 0.5);
  const dy = 600 + fall * fall * 250;
  const rip = (k: number) => Math.max(0, (t - 0.5) * 2 - k * 0.22);
  const drop = 'M0,-38 C16,-12 22,-2 22,12 a22,22 0 1 1 -44,0 C-22,-2 -16,-12 0,-38z';
  return (
    <svg width={900} height={900}>
      <line x1={450} y1={20} x2={450} y2={50} stroke={fg} strokeWidth={8} strokeLinecap="round" />
      <rect x={320} y={50} width={260} height={230} rx={44} fill="none" stroke={fg} strokeWidth={8} />
      <rect x={332} y={140 + Math.sin(f / 10) * 4} width={236} height={128} rx={34} fill={accent} opacity={0.9} />
      <path d="M450 280 V 580" stroke={fg} strokeWidth={8} strokeLinecap="round" strokeDasharray="2 24" strokeDashoffset={-f * 4} />
      <rect x={420} y={520} width={60} height={86} rx={16} fill="none" stroke={fg} strokeWidth={8} />
      {t < 0.5 ? <path d={drop} transform={`translate(450 ${dy}) scale(${0.7 + fall * 0.5})`} fill={accent} /> : null}
      {[0, 1, 2].map((k) => {
        const a = rip(k);
        return a > 0 ? <ellipse key={k} cx={450} cy={870} rx={30 + a * 340} ry={8 + a * 56} fill="none" stroke={accent} strokeWidth={6} opacity={1 - a} /> : null;
      })}
    </svg>
  );
};

export const Iv: React.FC = () => (
  <Treat n={3} name={['IV', 'THERAPY']} nameSize={156} desc="Infusioni personalizzate per energia e recupero." chip="SU MISURA" bg={C.night} fg={C.ivory} accent={C.champ}>
    <IvGfx fg={C.ivory} accent={C.champ} />
  </Treat>
);

/* ---------- 4. Fotobiomodulazione ---------- */
const PbmGfx: React.FC<{fg: string; accent: string}> = ({fg, accent}) => {
  const f = useCurrentFrame();
  return (
    <svg width={900} height={900}>
      {[0, 1, 2].map((k) => {
        const age = ((f + k * 20) % 60) / 60;
        return <circle key={k} cx={450} cy={450} r={190 + age * 260} fill="none" stroke={fg} strokeWidth={5} opacity={1 - age} />;
      })}
      <g transform={`translate(450 450) rotate(${f * 0.9})`}>
        {new Array(24).fill(0).map((_, i) => {
          const L = (i % 2 ? 50 : 105) + 16 * Math.sin(f / 6 + i);
          return <line key={i} x1={0} y1={-205} x2={0} y2={-205 - L} stroke={fg} strokeWidth={10} strokeLinecap="round" transform={`rotate(${i * 15})`} />;
        })}
      </g>
      <circle cx={450} cy={450} r={170} fill={fg} />
      <circle cx={450} cy={450} r={112 + 10 * Math.sin(f / 8)} fill={accent} />
    </svg>
  );
};

export const Pbm: React.FC = () => (
  <Treat n={4} name={['FOTOBIO-', 'MODULAZIONE']} nameSize={106} desc="Luce a bassa intensità per stimolare la rigenerazione dei tessuti." chip="LUCE · RIGENERAZIONE" bg={C.champ} fg={C.navy} accent={C.ivory}>
    <PbmGfx fg={C.navy} accent={C.ivory} />
  </Treat>
);

/* ============ MONTAGE: flash rapidi ============ */
const Squares: React.FC<{color: string}> = ({color}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {[0, 1, 2, 3].map((k) => (
        <div key={k} style={{position: 'absolute', width: 300 + k * 240, height: 300 + k * 240, border: `4px solid ${color}`, opacity: 0.35, transform: `rotate(${f * (k % 2 ? -2.4 : 2.4) + k * 20}deg) scale(${prog(f, k * 2, 12)})`}} />
      ))}
    </AbsoluteFill>
  );
};

const Stripes: React.FC<{color: string}> = ({color}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(10).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', top: -200, left: i * 240 - 100 + f * 8, width: 70, height: 1500, background: color, opacity: 0.25, transform: 'rotate(22deg)'}} />
      ))}
    </AbsoluteFill>
  );
};

const Crosses: React.FC<{color: string}> = ({color}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(40).fill(0).map((_, i) => {
        const x = (i % 8) * 260 + 80;
        const y = Math.floor(i / 8) * 240 + 60;
        const s = prog(f, (i % 8) + Math.floor(i / 8), 10);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, fontFamily: SANS, fontWeight: 800, fontSize: 110, color, opacity: 0.22, transform: `scale(${s}) rotate(${f * 3}deg)`}}>
            +
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Discs: React.FC<{color: string}> = ({color}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: 1400 + k * 90 - 300,
            top: 140 + k * 220,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: color,
            opacity: 0.2 + k * 0.1,
            transform: `scale(${sp(f, k * 3, 14, 120, 0.8)})`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Flash: React.FC<{a: string; b: string; bg: string; fg: string; accent: string; shape: React.ReactNode; bSize?: number; outlineB?: boolean}> = ({a, b, bg, fg, accent, shape, bSize = 200, outlineB}) => (
  <AbsoluteFill style={{background: bg}}>
    {shape}
    <AbsoluteFill style={{justifyContent: 'center', padding: '0 130px'}}>
      <Line text={a} size={210} color={fg} delay={0} />
      <Line text={b} size={bSize} color={accent} delay={4} from="down" stroke={outlineB ? fg : undefined} />
    </AbsoluteFill>
  </AbsoluteFill>
);

export const Montage: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={30}>
      <Flash a="CHECK-UP" b="AVANZATI" bg={C.navy} fg={C.ivory} accent={C.champ} shape={<Squares color={C.champ} />} />
    </Sequence>
    <Sequence from={30} durationInFrames={30}>
      <Flash a="PERCORSI" b="PERSONALIZZATI" bg={C.ivory} fg={C.navy} accent={C.navy} bSize={165} shape={<Stripes color={C.champ} />} />
    </Sequence>
    <Sequence from={60} durationInFrames={30}>
      <Flash a="VISITE" b="A CASA TUA" bg={C.champ} fg={C.navy} accent={C.ivory} outlineB shape={<Crosses color={C.navy} />} />
    </Sequence>
    <Sequence from={90} durationInFrames={45}>
      <Flash a="MEDICINA" b="ESTETICA" bg={C.night} fg={C.ivory} accent={C.champ} shape={<Discs color={C.champ} />} />
    </Sequence>
  </AbsoluteFill>
);

/* ============ CTA ============ */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const info: [string, string][] = [
    ['DOVE', 'Corso De Gasperi 165, Rivoli (TO)'],
    ['TELEFONO', '011 1875 3564'],
    ['MOBILE', '320 379 1544'],
    ['ORARI', 'Lun–Ven · 9:00–19:00'],
  ];
  const pulse = 1 + 0.04 * Math.sin(f / 5);
  return (
    <Stage bg={C.navy} fg={C.ivory}>
      {[0, 1, 2].map((k) => {
        const age = ((f + k * 30) % 90) / 90;
        const r = 120 + age * 640;
        return <div key={k} style={{position: 'absolute', left: 1640 - r, top: 420 - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `3px solid ${C.champ}`, opacity: (1 - age) * 0.55}} />;
      })}
      <div style={{position: 'absolute', left: 130, top: 170}}>
        <Tag text="PRENOTA ORA" color={C.champ} delay={2} />
        <div style={{height: 20}} />
        <Line text="LA TUA VISITA DI" size={104} color={C.ivory} delay={6} from="left" weight={700} />
        <Line text="VALUTAZIONE." size={210} color={C.champ} delay={12} from="right" />
        <div
          style={{
            marginTop: 26,
            display: 'inline-block',
            padding: '20px 56px',
            borderRadius: 100,
            background: C.champ,
            color: C.navy,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 44,
            letterSpacing: '0.2em',
            transform: `scale(${sp(f, 34, 12, 160, 0.6) * pulse})`,
            transformOrigin: 'left center',
          }}
        >
          WWW.LONGEVITAS.IT
        </div>
      </div>
      <div style={{position: 'absolute', left: 130, right: 130, bottom: 96, display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr', gap: 40}}>
        {info.map(([k, v], i) => {
          const p = prog(f, 70 + i * 10, 22);
          return (
            <div key={k} style={{opacity: p, transform: `translateY(${(1 - p) * 36}px)`, borderTop: `3px solid ${C.champ}`, paddingTop: 16}}>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: '0.34em', color: C.champ}}>{k}</div>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.ivory, marginTop: 8}}>{v}</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
