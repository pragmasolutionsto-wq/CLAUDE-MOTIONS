import React from 'react';
import {Img, staticFile} from 'remotion';
import {Blur, C, Svg, clamp, ip, lerp, out, outBack, wave} from './kit';
import type {SceneProps} from './scenesA';

/* ───────────────────────── Holter pressorio ───────────────────────── */

// letture della giornata (0..1, più alto = pressione più alta): mattino, giorno, sera, notte
const READS = [0.5, 0.68, 0.62, 0.72, 0.58, 0.52, 0.36, 0.3, 0.42];
const CH_X1 = 170;
const CH_X2 = 910;
const CH_Y1 = 1210;
const CH_Y2 = 1500;
const pt = (i: number) => [lerp(CH_X1, CH_X2, i / (READS.length - 1)), lerp(CH_Y2, CH_Y1, READS[i])] as const;
const smooth = () => {
  const p = READS.map((_, i) => pt(i));
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
};
const CURVE = smooth();

export const PressureScene: React.FC<SceneProps> = ({lt, s}) => {
  const s1 = s.sentences[0][0] - s.start;
  const s2 = s.sentences[1][0] - s.start;
  const step = (s2 + 2.5 - (s1 + 1)) / (READS.length - 1);
  const tRead = READS.map((_, i) => s1 + 1 + i * step);
  // gonfiaggio del bracciale prima di ogni lettura
  let infl = 0;
  for (const tr of tRead) {
    const a = lt - (tr - 1.0);
    if (a > 0 && a < 1.5) infl = Math.max(infl, Math.sin((Math.PI * a) / 1.5) ** 2);
  }
  const appear = ip(lt, 0, 1.4);
  const chart = ip(lt, 0.6, 1.8);
  const line = ip(lt, s2 - 0.2, s2 + 4.5);
  const needle = -120 + 200 * infl;
  return (
    <Svg>
      <defs>
        <linearGradient id="pcuff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#57BDBA" />
          <stop offset="0.55" stopColor={C.teal} />
          <stop offset="1" stopColor="#21716F" />
        </linearGradient>
        <linearGradient id="pmon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E3DED6" />
        </linearGradient>
        <linearGradient id="parc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.teal} />
          <stop offset="1" stopColor={C.blue} />
        </linearGradient>
        <linearGradient id="parea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.teal} stopOpacity={0.28} />
          <stop offset="1" stopColor={C.teal} stopOpacity={0} />
        </linearGradient>
        <Blur id="pb6" s={6} />
        <Blur id="pb14" s={14} />
        <Blur id="pb30" s={30} />
      </defs>
      <g opacity={appear} transform={`translate(0 ${lerp(30, 0, appear) + 8 * Math.sin(lt * 0.7)})`}>
        <ellipse cx={540} cy={930} rx={380} ry={36} fill={C.blueDeep} opacity={0.14} filter="url(#pb30)" />
        {/* tubo */}
        <path d="M 430 830 C 450 930 600 930 640 860" stroke="#7FAFAD" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d="M 430 830 C 450 930 600 930 640 860" stroke="#E3F3F2" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} transform="translate(-2 -3)" />
        {/* bracciale */}
        <g transform={`translate(380 720) rotate(-8) scale(1 ${1 + 0.07 * infl})`}>
          <rect x={-190} y={-105} width={380} height={210} rx={70} fill="url(#pcuff)" />
          <rect x={-170} y={-88} width={340} height={176} rx={56} fill="none" stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={3} strokeDasharray="10 9" />
          <rect x={60} y={-105} width={130} height={210} rx={60} fill={C.blue} opacity={0.55} />
          <path d="M -160 -70 C -120 -98 40 -100 120 -88" stroke="#FFFFFF" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.5} filter="url(#pb6)" />
        </g>
        {/* monitor con manometro */}
        <g transform="translate(730 720)">
          <rect x={-120} y={-160} width={240} height={320} rx={52} fill="url(#pmon)" />
          <rect x={-120} y={-160} width={240} height={320} rx={52} fill="none" stroke="#CFC8BD" strokeWidth={2} />
          <circle cx={0} cy={-25} r={88} fill="#F7F4EF" stroke="#E2DCD2" strokeWidth={3} />
          <path d="M -62 37 A 88 88 0 1 1 62 37" transform="translate(0 -25) scale(0.82) translate(0 25)" fill="none" stroke="#E4DED4" strokeWidth={14} strokeLinecap="round" />
          <g transform={`translate(0 -25) rotate(${needle})`}>
            <line x1={0} y1={0} x2={0} y2={-64} stroke={C.blueDeep} strokeWidth={7} strokeLinecap="round" />
          </g>
          <circle cx={0} cy={-25} r={12} fill="url(#parc)" />
          <circle cx={0} cy={-25} r={34 + 30 * infl} fill={C.cyan} opacity={0.12 * infl} filter="url(#pb14)" />
          <rect x={-55} y={95} width={110} height={30} rx={15} fill="url(#parc)" />
          <path d="M -98 -120 C -98 -140 -85 -148 -60 -148" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} filter="url(#pb6)" />
        </g>
      </g>
      {/* il racconto della giornata */}
      <g opacity={chart}>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={CH_X1} x2={CH_X2} y1={lerp(CH_Y1, CH_Y2, i / 2)} y2={lerp(CH_Y1, CH_Y2, i / 2)} stroke={C.blueDeep} strokeOpacity={0.1} strokeWidth={2} strokeDasharray="2 12" strokeLinecap="round" />
        ))}
        <path d={`${CURVE} L ${CH_X2} ${CH_Y2 + 40} L ${CH_X1} ${CH_Y2 + 40} Z`} fill="url(#parea)" opacity={line} />
        <path d={CURVE} pathLength={1} stroke={C.cyan} strokeWidth={16} fill="none" opacity={0.35} filter="url(#pb14)" strokeDasharray={`${line} 1`} />
        <path d={CURVE} pathLength={1} stroke="url(#parc)" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={`${line} 1`} />
        {READS.map((_, i) => {
          const a = clamp((lt - tRead[i]) / 0.7);
          if (a <= 0) return null;
          const [x, y] = pt(i);
          const ring = clamp((lt - tRead[i]) / 1.4);
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r={14 + 40 * out(ring)} fill="none" stroke={C.teal} strokeWidth={3} opacity={0.5 * (1 - ring)} />
              <g transform={`scale(${outBack(a)})`}>
                <circle r={16} fill="#FFFFFF" />
                <circle r={9} fill={i % 2 ? C.blue : C.teal} />
              </g>
            </g>
          );
        })}
      </g>
    </Svg>
  );
};

/* ───────────────────────── Convenzione ASL, vicino a casa ───────────────────────── */

const Cross: React.FC<{size: number; fill: string}> = ({size, fill}) => {
  const a = size / 2;
  const b = size / 6;
  return (
    <g fill={fill}>
      <rect x={-b} y={-a} width={2 * b} height={size} rx={b * 0.6} />
      <rect x={-a} y={-b} width={size} height={2 * b} rx={b * 0.6} />
    </g>
  );
};

export const AslScene: React.FC<SceneProps> = ({lt, s}) => {
  const grow = clamp((lt - 0.3) / 1.3);
  const sc = grow <= 0 ? 0 : outBack(grow);
  const pinU = clamp((lt - 1.4) / 1.1);
  const pinY = lerp(-170, 0, outBack(pinU)) + 8 * Math.sin(lt * 1.1) * pinU;
  const s2 = s.sentences[1][0] - s.start;
  const route = clamp((lt - (s2 - 0.3)) / 3.2);
  const house = ip(lt, s2 - 0.8, s2 + 0.2);
  const waves: React.ReactNode[] = [];
  for (let k = 0; k < 14; k++) {
    const a = lt - (1.8 + k * 1.9);
    if (a < 0 || a > 3.8) continue;
    const u = a / 3.8;
    const rx = 230 + 330 * out(u);
    waves.push(<ellipse key={k} cx={540} cy={1225} rx={rx} ry={rx * 0.24} fill="none" stroke={C.teal} strokeWidth={4} opacity={0.55 * Math.pow(1 - u, 1.3)} />);
  }
  // percorso casa → farmacia (bezier) fatto di puntini
  const P0 = [250, 1560];
  const P1 = [300, 1370];
  const P2 = [420, 1330];
  const P3 = [470, 1252];
  const bz = (t: number, i: 0 | 1) => (1 - t) ** 3 * P0[i] + 3 * (1 - t) ** 2 * t * P1[i] + 3 * (1 - t) * t * t * P2[i] + t ** 3 * P3[i];
  const dots: React.ReactNode[] = [];
  const N = 13;
  for (let i = 1; i < N; i++) {
    const tt = i / N;
    const a = clamp((route - tt + 0.08) / 0.08);
    if (a <= 0) continue;
    dots.push(<circle key={i} cx={bz(tt, 0)} cy={bz(tt, 1)} r={7 * a} fill={C.blue} opacity={0.65} />);
  }
  return (
    <Svg>
      <defs>
        <linearGradient id="abody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFDF9" />
          <stop offset="1" stopColor="#EDE3D5" />
        </linearGradient>
        <linearGradient id="aroof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2797C7" />
          <stop offset="1" stopColor={C.blueDeep} />
        </linearGradient>
        <linearGradient id="aglass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D9EFEE" />
          <stop offset="1" stopColor="#93CBCA" />
        </linearGradient>
        <linearGradient id="adoor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3FA0CF" />
          <stop offset="1" stopColor={C.blue} />
        </linearGradient>
        <linearGradient id="apin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5CC3C0" />
          <stop offset="1" stopColor={C.tealDeep} />
        </linearGradient>
        <linearGradient id="ahouse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6E3C6" />
          <stop offset="1" stopColor="#E8C99A" />
        </linearGradient>
        <Blur id="ab6" s={6} />
        <Blur id="ab18" s={18} />
        <Blur id="ab30" s={30} />
      </defs>
      {waves}
      <g opacity={house}>
        <g transform={`translate(${P0[0]} ${P0[1]})`}>
          <ellipse cx={0} cy={62} rx={80} ry={14} fill={C.blueDeep} opacity={0.14} filter="url(#ab6)" />
          <path d="M -62 -10 L 0 -66 L 62 -10 V 58 H -62 Z" fill="url(#ahouse)" />
          <path d="M -78 -4 L 0 -76 L 78 -4" stroke={C.ocra} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x={-16} y={14} width={32} height={44} rx={8} fill="#D4A66A" />
        </g>
      </g>
      {dots}
      {sc > 0 && (
        <g transform={`translate(540 1040) translate(0 180) scale(${sc}) translate(0 -180)`}>
          <ellipse cx={0} cy={192} rx={280} ry={30} fill={C.blueDeep} opacity={0.18} filter="url(#ab30)" />
          <rect x={-210} y={-120} width={420} height={302} rx={28} fill="url(#abody)" />
          <rect x={-210} y={-120} width={420} height={302} rx={28} fill="none" stroke="#D9CFC1" strokeWidth={2} />
          <rect x={-235} y={-168} width={470} height={60} rx={24} fill="url(#aroof)" />
          <rect x={-215} y={-160} width={430} height={10} rx={5} fill="#FFFFFF" opacity={0.3} />
          {/* croce */}
          <g transform="translate(0 -30)">
            <circle r={78} fill={C.teal} opacity={0.25 + 0.15 * wave(lt, 2.4)} filter="url(#ab18)" />
            <rect x={-62} y={-62} width={124} height={124} rx={30} fill="#FFFFFF" />
            <Cross size={84} fill={C.teal} />
            <rect x={-8} y={-42} width={16} height={34} rx={6} fill="#FFFFFF" opacity={0.35} />
          </g>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${sd * 145} 20)`}>
              <rect x={-48} y={-40} width={96} height={84} rx={14} fill="url(#aglass)" />
              <path d="M -30 30 L 20 -30" stroke="#FFFFFF" strokeWidth={10} opacity={0.55} strokeLinecap="round" />
            </g>
          ))}
          <rect x={-56} y={42} width={112} height={140} rx={16} fill="url(#adoor)" />
          <path d="M -36 150 L 18 64" stroke="#FFFFFF" strokeWidth={10} opacity={0.3} strokeLinecap="round" />
          <circle cx={36} cy={116} r={6} fill="#FFFFFF" opacity={0.8} />
          <rect x={-100} y={178} width={200} height={12} rx={6} fill="#DCD2C4" />
          <path d="M -190 -100 C -190 -112 -184 -116 -170 -116" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.9} />
        </g>
      )}
      {pinU > 0 && (
        <g transform={`translate(540 ${640 + pinY})`} opacity={clamp(pinU * 3)}>
          <ellipse cx={0} cy={150} rx={44 - pinY * 0.05} ry={10} fill={C.blueDeep} opacity={0.18} filter="url(#ab6)" />
          <path d="M 0 120 C -20 80 -86 30 -86 -30 C -86 -80 -48 -118 0 -118 C 48 -118 86 -80 86 -30 C 86 30 20 80 0 120 Z" fill="url(#apin)" />
          <circle cx={0} cy={-32} r={34} fill="#FFFFFF" />
          <circle cx={0} cy={-32} r={14} fill={C.blue} />
          <path d="M -60 -60 C -54 -88 -30 -104 -6 -106" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.55} filter="url(#ab6)" />
        </g>
      )}
    </Svg>
  );
};

/* ───────────────────────── Ricetta, tessera, ticket ───────────────────────── */

const Ricetta: React.FC = () => (
  <svg width={340} height={450} viewBox="0 0 340 450" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id="rpaper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#F1ECE4" />
      </linearGradient>
      <linearGradient id="rhead" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={C.teal} />
        <stop offset="1" stopColor={C.blue} />
      </linearGradient>
      <Blur id="rb" s={2.6} />
    </defs>
    <path d="M 18 0 H 322 Q 340 0 340 18 V 390 L 280 450 H 18 Q 0 450 0 432 V 18 Q 0 0 18 0 Z" fill="url(#rpaper)" />
    <path d="M 0 18 Q 0 0 18 0 H 322 Q 340 0 340 18 V 58 H 0 Z" fill="url(#rhead)" />
    <rect x={22} y={16} width={26} height={26} rx={8} fill="#FFFFFF" opacity={0.6} />
    <g filter="url(#rb)" fill={C.blueDeep} opacity={0.22}>
      {[100, 140, 180, 232, 272, 312].map((y, i) => (
        <rect key={y} x={30} y={y} width={[250, 200, 230, 270, 180, 140][i]} height={12} rx={6} />
      ))}
    </g>
    <circle cx={250} cy={380} r={34} fill="none" stroke={C.blue} strokeWidth={5} opacity={0.22} filter="url(#rb)" />
    <path d="M 340 390 L 280 450 L 290 400 Z" fill="#E2DACE" />
  </svg>
);

const Tessera: React.FC<{lt: number}> = ({lt}) => {
  const shine = ((lt * 0.18) % 1) * 900 - 300;
  return (
    <svg width={460} height={290} viewBox="0 0 460 290">
      <defs>
        <linearGradient id="tcard" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1C93C6" />
          <stop offset="1" stopColor={C.blueDeep} />
        </linearGradient>
        <linearGradient id="tchip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6E1AE" />
          <stop offset="1" stopColor="#C99A4E" />
        </linearGradient>
        <linearGradient id="tshine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.22} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <clipPath id="tclip">
          <rect width={460} height={290} rx={26} />
        </clipPath>
        <Blur id="tbl" s={2.4} />
      </defs>
      <g clipPath="url(#tclip)">
        <rect width={460} height={290} fill="url(#tcard)" />
        <path d="M 0 210 C 120 160 260 260 460 170 V 290 H 0 Z" fill={C.teal} opacity={0.75} />
        <path d="M 0 236 C 140 196 270 280 460 206" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={3} fill="none" />
        <rect x={shine} y={-40} width={160} height={380} fill="url(#tshine)" transform={`skewX(-20)`} />
      </g>
      <rect x={40} y={86} width={72} height={58} rx={11} fill="url(#tchip)" />
      <path d="M 40 115 H 112 M 64 86 V 144 M 88 86 V 144" stroke="#A97C3A" strokeWidth={2} opacity={0.6} />
      <g filter="url(#tbl)" fill="#FFFFFF" opacity={0.45}>
        <rect x={150} y={90} width={220} height={14} rx={7} />
        <rect x={150} y={120} width={160} height={14} rx={7} />
        <rect x={40} y={32} width={120} height={14} rx={7} />
      </g>
      <rect x={1} y={1} width={458} height={288} rx={26} fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={2} />
    </svg>
  );
};

const Ticket: React.FC<{check: number}> = ({check}) => (
  <svg width={360} height={180} viewBox="0 0 360 180" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id="kpaper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F8E6C2" />
        <stop offset="1" stopColor={C.ocra} />
      </linearGradient>
    </defs>
    <path d="M 20 0 H 340 Q 360 0 360 20 V 66 A 24 24 0 0 0 360 114 V 160 Q 360 180 340 180 H 20 Q 0 180 0 160 V 114 A 24 24 0 0 0 0 66 V 20 Q 0 0 20 0 Z" fill="url(#kpaper)" />
    <line x1={118} x2={118} y1={16} y2={164} stroke="#B98D4E" strokeOpacity={0.5} strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" />
    <circle cx={60} cy={90} r={16} fill="none" stroke="#B98D4E" strokeOpacity={0.55} strokeWidth={5} />
    <path d="M 60 74 C 50 40 40 20 20 6" stroke="#B98D4E" strokeOpacity={0.55} strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M 24 16 C 60 8 140 6 300 8" stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={6} fill="none" strokeLinecap="round" />
    <g transform="translate(238 90)">
      <circle r={56} fill="#FFFFFF" opacity={0.92} />
      <circle r={56} fill="none" stroke={C.teal} strokeOpacity={0.25 + 0.5 * check} strokeWidth={4} />
      <path d="M -26 2 L -7 22 L 28 -20" pathLength={1} strokeDasharray={`${check} 1`} stroke={C.teal} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

const Floater: React.FC<{
  lt: number;
  tin: number;
  x: number;
  y: number;
  rot: number;
  depth: number;
  phase: number;
  conv: number;
  children: React.ReactNode;
}> = ({lt, tin, x, y, rot, depth, phase, conv, children}) => {
  const a = ip(lt, tin, tin + 1.3, out);
  if (a <= 0) return null;
  const drift = 22 * Math.sin(lt * 0.25) * depth;
  const fx = lerp(x + drift, 540, conv);
  const fy = lerp(y + lerp(150, 0, a) + 14 * Math.sin(lt * 0.6 + phase) * depth, 960, conv);
  const rz = rot + 1.6 * Math.sin(lt * 0.3 + phase);
  const ry = 9 * Math.sin(lt * 0.22 + phase);
  const rx = lerp(28, 0, a) + 4 * Math.sin(lt * 0.27 + phase * 2);
  const sc = lerp(1, 0.55, conv) * (0.94 + 0.06 * depth);
  return (
    <div
      style={{
        position: 'absolute',
        left: fx,
        top: fy,
        transform: `translate(-50%, -50%) perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
        opacity: a * (1 - conv * 0.9),
        filter: `drop-shadow(0 ${26 * depth}px ${34 * depth}px rgba(15,76,110,0.22))`,
      }}
    >
      {children}
    </div>
  );
};

export const DocsScene: React.FC<SceneProps> = ({lt, s}) => {
  const st = s.sentences.map((x) => x[0] - s.start);
  const last = s.sentences[2][1] - s.start;
  const check = ip(lt, last - 1.7, last - 0.7);
  const dur = s.end - s.start;
  const conv = ip(lt, dur - 1.0, dur + 0.25);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Floater lt={lt} tin={st[0] - 0.3} x={390} y={770} rot={-7} depth={0.8} phase={0} conv={conv}>
        <Ricetta />
      </Floater>
      <Floater lt={lt} tin={st[1] - 0.3} x={660} y={1050} rot={5} depth={1.1} phase={2} conv={conv}>
        <Tessera lt={lt} />
      </Floater>
      <Floater lt={lt} tin={st[2] - 0.3} x={440} y={1335} rot={-3} depth={1.4} phase={4} conv={conv}>
        <Ticket check={check} />
      </Floater>
    </div>
  );
};

/* ───────────────────────── Chiusura ───────────────────────── */

const Rise: React.FC<{k: number; children: React.ReactNode; style?: React.CSSProperties}> = ({k, children, style}) => (
  <div style={{opacity: k, transform: `translateY(${lerp(20, 0, k)}px)`, ...style}}>{children}</div>
);

export const EndScene: React.FC<SceneProps> = ({lt}) => {
  const card = ip(lt, 0, 0.8);
  const e = (i: number) => ip(lt, 0.7 + i * 0.5, 1.3 + i * 0.5);
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          width: 840,
          boxSizing: 'border-box',
          padding: '84px 80px 92px',
          borderRadius: 52,
          background: 'linear-gradient(160deg, rgba(255,255,255,0.97), rgba(255,253,249,0.92))',
          boxShadow: '0 50px 120px rgba(15,76,110,0.20), 0 10px 30px rgba(15,76,110,0.08), inset 0 1px 0 #fff',
          opacity: card,
          transform: `translateY(${lerp(30, 0, card)}px) scale(${lerp(0.95, 1, card)})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Rise k={e(0)}>
          {/* logo Farmacia Monaco (sostituibile: monaco/public/logo.png) */}
          <Img src={staticFile('logo.png')} style={{width: 470, display: 'block'}} />
        </Rise>
        <Rise k={e(1)} style={{marginTop: 64}}>
          <div style={{fontFamily: 'Playfair Display', fontWeight: 600, fontSize: 80, lineHeight: 1.12, color: C.blueDeep, letterSpacing: '-0.005em'}}>
            Telecardiologia
            <br />
            in convenzione
            <br />
            con ASL
          </div>
        </Rise>
        <Rise k={e(2)} style={{marginTop: 44, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{width: 84, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${C.teal}, ${C.blue})`, marginBottom: 34}} />
          <div style={{fontFamily: 'Inter', fontWeight: 300, fontSize: 46, color: C.tealDeep, letterSpacing: '0.04em'}}>Su appuntamento</div>
        </Rise>
      </div>
    </div>
  );
};

