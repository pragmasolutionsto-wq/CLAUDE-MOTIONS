// Icone animate del reel metformina. viewBox 400x400, t = secondi dall'inizio della scena.
import React from 'react';
import {GREEN, HEAD, MINT, SAGE, TEAL, TEAL_DEEP, WHITE} from '../brand';
import {Badge, Grads} from '../kit';
import {clamp, eBounce, eElastic, eIO, eO3, eO5, lerp, prog} from '../util';

type I = React.FC<{t: number}>;
const Svg: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%" style={{overflow: 'visible'}}>
    <Grads id={id} />
    {children}
  </svg>
);

// compressa ovale bianca con solco centrale
const Tablet: React.FC<{x: number; y: number; r?: number; rot?: number; id: string}> = ({x, y, r = 46, rot = 0, id}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse cx={0} cy={6} rx={r * 1.25} ry={r * 0.85} fill={TEAL_DEEP} opacity={0.14} />
    <ellipse cx={0} cy={0} rx={r * 1.25} ry={r * 0.85} fill={`url(#${id}w)`} stroke={SAGE} strokeWidth={4} />
    <line x1={0} y1={-r * 0.6} x2={0} y2={r * 0.6} stroke={SAGE} strokeWidth={5} strokeLinecap="round" />
    <ellipse cx={-r * 0.5} cy={-r * 0.35} rx={r * 0.38} ry={r * 0.14} fill={WHITE} opacity={0.9} />
  </g>
);

const Sparkle: React.FC<{x: number; y: number; s: number; p: number}> = ({x, y, s, p}) => {
  const k = Math.sin(clamp(p) * Math.PI) * s;
  return <path transform={`translate(${x} ${y}) scale(${k})`} d="M0 -1 Q0.12 -0.12 1 0 Q0.12 0.12 0 1 Q-0.12 0.12 -1 0 Q-0.12 -0.12 0 -1Z" fill={MINT} />;
};

/* 1. gancio: capsula che cade e rimbalza */
export const IcoPill: I = ({t}) => {
  const id = 'pl';
  const p = prog(t, 0.05, 1.0);
  const y = lerp(-420, 0, eBounce(p));
  const rot = lerp(-70, -28, eO3(p)) + Math.sin(t * 1.7) * 3;
  return (
    <Svg id={id}>
      <g transform={`translate(0 ${y}) rotate(${rot} 200 200) translate(200 200) scale(1.3) translate(-200 -200)`}>
        <rect x={86} y={160} width={228} height={104} rx={52} fill={TEAL_DEEP} opacity={0.15} />
        <clipPath id={`${id}c`}><rect x={86} y={148} width={228} height={104} rx={52} /></clipPath>
        <g clipPath={`url(#${id}c)`}>
          <rect x={86} y={148} width={114} height={104} fill={`url(#${id}m)`} />
          <rect x={200} y={148} width={114} height={104} fill={`url(#${id}w)`} />
          <rect x={196} y={148} width={8} height={104} fill={TEAL} opacity={0.25} />
        </g>
        <rect x={86} y={148} width={228} height={104} rx={52} fill="none" stroke={TEAL} strokeOpacity={0.25} strokeWidth={4} />
        <rect x={112} y={164} width={170} height={18} rx={9} fill={WHITE} opacity={0.55} />
      </g>
      <Sparkle x={86} y={104} s={22} p={prog(t, 0.9, 2.0)} />
      <Sparkle x={330} y={120} s={16} p={prog(t, 1.1, 2.2)} />
      <Sparkle x={320} y={300} s={20} p={prog(t, 1.3, 2.5)} />
      <Sparkle x={70} y={290} s={14} p={prog(t, 1.6, 2.8)} />
    </Svg>
  );
};

/* 2. glicemia: goccia con grafico che scende */
export const IcoDrop: I = ({t}) => {
  const id = 'dr';
  const d = eIO(prog(t, 0.5, 1.6));
  return (
    <Svg id={id}>
      <path d="M200 30 C200 30 330 170 330 250 A130 130 0 0 1 70 250 C70 170 200 30 200 30Z" fill={`url(#${id}m)`} />
      <path d="M118 196 C130 150 160 110 186 80" fill="none" stroke={WHITE} strokeWidth={16} strokeLinecap="round" opacity={0.55} />
      <polyline points="112,215 160,248 196,232 240,284 282,300" fill="none" stroke={WHITE} strokeWidth={16}
        strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
      <path d="M262 278 L290 304 L256 316" fill="none" stroke={WHITE} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round"
        opacity={prog(t, 1.5, 1.7)} />
      <Badge x={318} y={110} p={prog(t, 1.4, 1.9)} kind="ok" />
    </Svg>
  );
};

/* 3. errore: cerchio con punto esclamativo che oscilla */
export const IcoWarn: I = ({t}) => {
  const id = 'wr';
  const w = Math.sin(t * 9) * 10 * Math.exp(-t * 1.6);
  const ring = eO5(prog(t, 0.1, 0.9));
  return (
    <Svg id={id}>
      <circle cx={200} cy={200} r={150} fill={`url(#${id}w)`} />
      <circle cx={200} cy={200} r={150} fill="none" stroke={MINT} strokeWidth={22} pathLength={1} strokeDasharray={1}
        strokeDashoffset={1 - ring} transform="rotate(-90 200 200)" strokeLinecap="round" />
      <g transform={`rotate(${w} 200 300)`}>
        <rect x={180} y={95} width={40} height={140} rx={20} fill={`url(#${id}t)`} />
        <circle cx={200} cy={280} r={24} fill={`url(#${id}t)`} />
      </g>
    </Svg>
  );
};

/* consiglio 1: piatto con cibo + compressa accanto */
export const IcoPlate: I = ({t}) => {
  const id = 'p1';
  const px = lerp(520, 0, eO5(prog(t, 0.6, 1.3)));
  return (
    <Svg id={id}>
      <ellipse cx={190} cy={222} rx={150} ry={150} fill={TEAL_DEEP} opacity={0.08} />
      <circle cx={190} cy={210} r={150} fill={`url(#${id}w)`} stroke={SAGE} strokeWidth={6} />
      <circle cx={190} cy={210} r={108} fill="none" stroke={SAGE} strokeWidth={4} opacity={0.7} />
      <path d="M140 200 C150 150 210 140 230 160 C200 170 175 190 140 200Z" fill={`url(#${id}m)`} />
      <path d="M150 196 Q190 172 226 162" stroke={GREEN} strokeWidth={4} fill="none" opacity={0.6} />
      <circle cx={225} cy={238} r={34} fill={SAGE} />
      <circle cx={160} cy={250} r={22} fill={`url(#${id}t)`} />
      <g transform="translate(18 0)">
        <rect x={0} y={90} width={12} height={240} rx={6} fill={SAGE} />
        <rect x={-12} y={90} width={6} height={70} rx={3} fill={SAGE} /><rect x={18} y={90} width={6} height={70} rx={3} fill={SAGE} />
      </g>
      <rect x={364} y={90} width={16} height={240} rx={8} fill={SAGE} />
      <g transform={`translate(${px} 0)`}><Tablet x={318} y={330} r={34} rot={-12} id={id} /></g>
      <Badge x={320} y={86} p={prog(t, 1.3, 1.8)} kind="ok" />
    </Svg>
  );
};

/* consiglio 2: bicchiere che si riempie, compressa intera ok, compressa spezzata no */
export const IcoGlass: I = ({t}) => {
  const id = 'p2';
  const lv = eIO(prog(t, 0.4, 1.6));
  const top = lerp(330, 150, lv);
  let wave = `M 120 ${top}`;
  for (let x = 120; x <= 300; x += 10) wave += ` L ${x} ${top + Math.sin(x * 0.06 + t * 6) * 6 * (0.4 + lv)}`;
  wave += ' L 300 360 L 120 360 Z';
  const split = eO3(prog(t, 1.2, 1.7)) * 16;
  return (
    <Svg id={id}>
      <clipPath id={`${id}g`}><path d="M128 80 L272 80 L258 340 Q256 352 244 352 L156 352 Q144 352 142 340 Z" /></clipPath>
      <path d="M128 80 L272 80 L258 340 Q256 352 244 352 L156 352 Q144 352 142 340 Z" fill={WHITE} opacity={0.7} />
      <g clipPath={`url(#${id}g)`}>
        <path d={wave} fill={`url(#${id}m)`} opacity={0.85} />
        <rect x={150} y={90} width={14} height={240} rx={7} fill={WHITE} opacity={0.6} />
      </g>
      <path d="M128 80 L272 80 L258 340 Q256 352 244 352 L156 352 Q144 352 142 340 Z" fill="none" stroke={TEAL} strokeWidth={9} strokeLinejoin="round" />
      <g opacity={prog(t, 0.2, 0.5)}><Tablet x={330} y={320} r={30} rot={-10} id={id} /></g>
      <Badge x={364} y={268} r={30} p={prog(t, 1.0, 1.4)} kind="ok" />
      <g opacity={prog(t, 0.6, 0.9)} transform="translate(56 300) rotate(14)">
        <g transform={`translate(${-split} 0)`}><path d="M-4 -26 A38 26 0 0 0 -4 26 Z" fill={`url(#${id}w)`} stroke={SAGE} strokeWidth={4} /></g>
        <g transform={`translate(${split} 0)`}><path d="M4 -26 A38 26 0 0 1 4 26 Z" fill={`url(#${id}w)`} stroke={SAGE} strokeWidth={4} /></g>
      </g>
      <Badge x={70} y={238} r={30} p={prog(t, 1.6, 2.0)} kind="no" />
    </Svg>
  );
};

/* consiglio 3: orologio con lancette che girano + "x2" barrato */
export const IcoClock: I = ({t}) => {
  const id = 'p3';
  const spin = eO3(prog(t, 0.2, 1.6));
  const hm = lerp(-360 * 2, 60, spin), hh = lerp(-180, 300, spin);
  const strike = eO3(prog(t, 1.4, 1.8));
  return (
    <Svg id={id}>
      <circle cx={180} cy={196} r={150} fill={`url(#${id}m)`} />
      <circle cx={180} cy={196} r={122} fill={`url(#${id}w)`} />
      {Array.from({length: 12}, (_, i) => (
        <line key={i} x1={180} y1={88} x2={180} y2={i % 3 ? 100 : 110} stroke={i % 3 ? SAGE : TEAL} strokeWidth={i % 3 ? 5 : 8}
          strokeLinecap="round" transform={`rotate(${i * 30} 180 196)`} />
      ))}
      <line x1={180} y1={196} x2={180} y2={128} stroke={TEAL_DEEP} strokeWidth={12} strokeLinecap="round" transform={`rotate(${hh} 180 196)`} />
      <line x1={180} y1={196} x2={180} y2={102} stroke={TEAL} strokeWidth={8} strokeLinecap="round" transform={`rotate(${hm} 180 196)`} />
      <circle cx={180} cy={196} r={12} fill={TEAL_DEEP} />
      <g transform={`translate(312 306) scale(${eElastic(prog(t, 0.9, 1.9))})`}>
        <circle r={62} fill={TEAL_DEEP} stroke={WHITE} strokeWidth={8} />
        <text x={0} y={22} textAnchor="middle" fontFamily={HEAD} fontSize={66} fill={WHITE}>×2</text>
        <line x1={-40} y1={40} x2={40} y2={-40} stroke={MINT} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strike} />
      </g>
    </Svg>
  );
};

/* consiglio 4: calice con divieto che si disegna */
export const IcoWine: I = ({t}) => {
  const id = 'p4';
  const ring = eIO(prog(t, 0.7, 1.4));
  const bar = eIO(prog(t, 1.3, 1.7));
  const tilt = Math.sin(t * 2.4) * 3;
  return (
    <Svg id={id}>
      <g transform={`rotate(${tilt} 200 330)`}>
        <clipPath id={`${id}b`}><path d="M130 70 L270 70 Q276 190 200 222 Q124 190 130 70 Z" /></clipPath>
        <path d="M130 70 L270 70 Q276 190 200 222 Q124 190 130 70 Z" fill={WHITE} opacity={0.75} />
        <g clipPath={`url(#${id}b)`}>
          <path d={`M120 ${132 + Math.sin(t * 4) * 4} Q200 ${120 - Math.sin(t * 4) * 6} 280 ${132 + Math.sin(t * 4) * 4} L280 240 L120 240 Z`} fill="#8E3B52" opacity={0.85} />
        </g>
        <path d="M130 70 L270 70 Q276 190 200 222 Q124 190 130 70 Z" fill="none" stroke={TEAL} strokeWidth={8} strokeLinejoin="round" />
        <rect x={194} y={220} width={12} height={92} fill={TEAL} />
        <ellipse cx={200} cy={318} rx={58} ry={14} fill={TEAL} />
      </g>
      <circle cx={200} cy={196} r={168} fill="none" stroke={TEAL_DEEP} strokeWidth={24} pathLength={1} strokeDasharray={1}
        strokeDashoffset={1 - ring} transform="rotate(-135 200 196)" strokeLinecap="round" />
      <line x1={81} y1={77} x2={319} y2={315} stroke={TEAL_DEEP} strokeWidth={24} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - bar} />
    </Svg>
  );
};

/* consiglio 5: batteria B12 che si scarica */
export const IcoBattery: I = ({t}) => {
  const id = 'p5';
  const lvl = lerp(1, 0.22, eIO(prog(t, 0.6, 2.2)));
  const low = lvl < 0.35;
  const blink = low ? 0.55 + 0.45 * Math.abs(Math.sin(t * 5)) : 1;
  return (
    <Svg id={id}>
      <rect x={50} y={120} width={280} height={160} rx={36} fill={WHITE} opacity={0.8} />
      <rect x={72} y={142} width={236 * lvl} height={116} rx={20} fill={low ? SAGE : `url(#${id}m)`} opacity={blink} />
      <rect x={50} y={120} width={280} height={160} rx={36} fill="none" stroke={TEAL} strokeWidth={14} />
      <rect x={334} y={170} width={26} height={60} rx={10} fill={TEAL} />
      <text x={190} y={232} textAnchor="middle" fontFamily={HEAD} fontSize={92} fill={TEAL_DEEP}>B12</text>
      {[0, 1, 2].map((i) => {
        const p = prog(t, 1.6 + i * 0.25, 2.6 + i * 0.25);
        return (
          <text key={i} x={300 + i * 26} y={110 - i * 30 - p * 30} fontFamily={HEAD} fontSize={36 + i * 8} fill={TEAL} opacity={Math.sin(p * Math.PI)}>z</text>
        );
      })}
    </Svg>
  );
};

/* consiglio 6: TAC con lettino che scorre e avviso */
export const IcoScan: I = ({t}) => {
  const id = 'p6';
  const bx = lerp(-150, 0, eIO(prog(t, 0.4, 1.6)));
  return (
    <Svg id={id}>
      <path d="M200 50 A150 150 0 1 1 199.9 50 Z M200 120 A80 80 0 1 0 200.1 120 Z" fillRule="evenodd" fill={`url(#${id}m)`} />
      <circle cx={200} cy={200} r={80} fill="none" stroke={WHITE} strokeWidth={6} opacity={0.6} />
      <circle cx={200} cy={200} r={128} fill="none" stroke={WHITE} strokeWidth={4} opacity={0.35} strokeDasharray="10 14" transform={`rotate(${t * 40} 200 200)`} />
      <rect x={150} y={330} width={100} height={36} rx={10} fill={SAGE} />
      <g transform={`translate(${bx} 0)`}>
        <rect x={-10} y={238} width={300} height={28} rx={14} fill={`url(#${id}t)`} />
        <rect x={-10} y={266} width={300} height={10} rx={5} fill={TEAL_DEEP} opacity={0.25} />
        <circle cx={34} cy={222} r={20} fill={SAGE} />
      </g>
      <Badge x={330} y={80} r={52} p={prog(t, 1.4, 1.9)} kind="warn" />
    </Svg>
  );
};

/* consiglio 7: piatto bilanciato che si compone a spicchi */
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
  if (a1 - a0 < 0.001) return '';
  return `M ${cx} ${cy} L ${p(a0)} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)} Z`;
};
export const IcoBalanced: I = ({t}) => {
  const id = 'p7';
  const segs: [number, number, string, number][] = [
    [Math.PI / 2, Math.PI * 1.5, `url(#${id}m)`, 0.3],
    [-Math.PI / 2, 0, SAGE, 0.65],
    [0, Math.PI / 2, `url(#${id}t)`, 0.95],
  ];
  return (
    <Svg id={id}>
      <ellipse cx={200} cy={214} rx={160} ry={160} fill={TEAL_DEEP} opacity={0.08} />
      <circle cx={200} cy={200} r={160} fill={`url(#${id}w)`} stroke={SAGE} strokeWidth={6} />
      {segs.map(([a0, a1, f, at], i) => {
        const p = eO3(prog(t, at, at + 0.5));
        return <path key={i} d={arc(200, 200, 118, a0, lerp(a0, a1, p))} fill={f} stroke={WHITE} strokeWidth={6} strokeLinejoin="round" />;
      })}
      <circle cx={200} cy={200} r={118} fill="none" stroke={WHITE} strokeWidth={4} />
      <Badge x={330} y={80} p={prog(t, 1.5, 2.0)} kind="ok" />
    </Svg>
  );
};

