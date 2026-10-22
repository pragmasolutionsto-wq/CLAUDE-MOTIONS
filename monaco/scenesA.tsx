import React from 'react';
import {Blur, C, H, Scene, Svg, W, clamp, inOut, ip, lerp, out, rand, wave} from './kit';

export type SceneProps = {lt: number; s: Scene};

/* ───────────────────────── Cuore anatomico stilizzato ───────────────────────── */

const BODY =
  'M 0 300 C -120 240 -250 120 -250 -20 C -250 -140 -170 -200 -90 -190 C -40 -195 -5 -185 10 -168 C 40 -195 90 -205 150 -190 C 240 -175 270 -80 250 20 C 225 140 120 240 0 300 Z';

const Tube: React.FC<{d: string; w: number; base: string; dark: string; hi: string; p: string}> = ({d, w, base, dark, hi, p}) => (
  <g>
    <path d={d} stroke={dark} strokeWidth={w + 6} fill="none" strokeLinecap="round" opacity={0.5} filter={`url(#${p}b6)`} />
    <path d={d} stroke={base} strokeWidth={w} fill="none" strokeLinecap="round" />
    <path d={d} stroke={hi} strokeWidth={w * 0.28} fill="none" strokeLinecap="round" opacity={0.55} transform="translate(-9 -6)" filter={`url(#${p}b6)`} />
  </g>
);

export const Heart: React.FC<{p: string; beat: number; glow: number}> = ({p, beat, glow}) => (
  <g>
    <defs>
      <radialGradient id={`${p}body`} cx={-90} cy={-70} r={430} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFA595" />
        <stop offset="0.35" stopColor="#EE6A5C" />
        <stop offset="0.7" stopColor={C.coral} />
        <stop offset="1" stopColor="#9E2B2C" />
      </radialGradient>
      <radialGradient id={`${p}glow`}>
        <stop offset="0" stopColor={C.coral} stopOpacity={0.45} />
        <stop offset="1" stopColor={C.coral} stopOpacity={0} />
      </radialGradient>
      <Blur id={`${p}b6`} s={6} />
      <Blur id={`${p}b14`} s={14} />
      <Blur id={`${p}b30`} s={30} />
      <clipPath id={`${p}clip`}>
        <path d={BODY} />
      </clipPath>
    </defs>
    {/* bagliore che respira col battito */}
    <circle r={520} fill={`url(#${p}glow)`} opacity={0.35 + 0.65 * glow} />
    {/* ombra morbida a terra */}
    <ellipse cx={0} cy={430} rx={240} ry={40} fill="#5B2A22" opacity={0.16} filter={`url(#${p}b30)`} />
    <g transform={`scale(${beat}) rotate(-20)`}>
      {/* vasi posteriori */}
      <Tube p={p} d="M -150 -150 C -155 -230 -160 -290 -168 -350" w={56} base="#C7584F" dark="#93302F" hi="#FFD0C4" />
      <Tube p={p} d="M -10 -140 C -20 -290 60 -350 140 -318 C 205 -292 214 -232 204 -168" w={84} base="#E46457" dark="#A8393A" hi="#FFE0D6" />
      <Tube p={p} d="M 40 -322 L 26 -410" w={30} base="#E46457" dark="#A8393A" hi="#FFE0D6" />
      <Tube p={p} d="M 92 -334 L 92 -425" w={30} base="#E46457" dark="#A8393A" hi="#FFE0D6" />
      <Tube p={p} d="M 140 -318 L 158 -402" w={28} base="#E46457" dark="#A8393A" hi="#FFE0D6" />
      {/* tronco polmonare, davanti all'aorta */}
      <Tube p={p} d="M -70 -120 C -95 -235 -175 -262 -238 -228" w={72} base="#F07E6E" dark="#B9473F" hi="#FFE6DE" />
      {/* corpo */}
      <path d={BODY} fill={`url(#${p}body)`} />
      <g clipPath={`url(#${p}clip)`}>
        {/* ombra interna sul bordo destro e in basso: volume */}
        <path d={BODY} fill="none" stroke="#6E1C20" strokeWidth={70} opacity={0.35} filter={`url(#${p}b30)`} transform="translate(26 24)" />
        {/* solco interventricolare + coronarie */}
        <path d="M -10 -160 C 30 -10 40 130 10 290" stroke="#7E2226" strokeWidth={18} fill="none" opacity={0.35} filter={`url(#${p}b6)`} />
        <path d="M -10 -160 C 30 -10 40 130 10 290" stroke="#FFC2B4" strokeWidth={5} fill="none" opacity={0.6} />
        <path d="M 22 -20 C 80 10 130 30 190 20 M 34 80 C 90 110 120 150 140 190 M 0 -40 C -60 -10 -120 20 -190 30 M 10 60 C -40 100 -80 150 -100 200" stroke="#FFC2B4" strokeWidth={4} fill="none" opacity={0.45} strokeLinecap="round" />
      </g>
      {/* riflesso lucido principale + rim light */}
      <ellipse cx={-140} cy={-80} rx={70} ry={38} fill="#FFFFFF" opacity={0.55} transform="rotate(-35 -140 -80)" filter={`url(#${p}b14)`} />
      <ellipse cx={-150} cy={-95} rx={26} ry={12} fill="#FFFFFF" opacity={0.8} transform="rotate(-35 -150 -95)" filter={`url(#${p}b6)`} />
      <path d="M 235 -60 C 255 0 240 80 200 140" stroke="#FFD6CC" strokeWidth={8} fill="none" opacity={0.5} strokeLinecap="round" filter={`url(#${p}b6)`} />
    </g>
  </g>
);

const PERIOD = 1.6;
export const beatAt = (t: number) => 1 + 0.06 * wave(t, PERIOD);

/** aloni corallo emessi al picco di ogni battito */
const Halos: React.FC<{t: number; p: string; max: number}> = ({t, p, max}) => {
  const out_: React.ReactNode[] = [];
  for (let k = 0; k < max; k++) {
    const age = t - (PERIOD / 2 + k * PERIOD);
    if (age < 0 || age > 1.5) continue;
    const u = age / 1.5;
    out_.push(
      <circle key={k} r={300 + 280 * out(u)} fill="none" stroke={C.coral} strokeWidth={10 * (1 - u) + 2} opacity={0.42 * Math.pow(1 - u, 1.6)} filter={`url(#${p}b6)`} />,
    );
  }
  return <>{out_}</>;
};

export const HeartScene: React.FC<SceneProps> = ({lt, s}) => {
  const dur = s.end - s.start;
  const zoom = lerp(1, 1.15, ip(lt, 0, dur));
  const appear = ip(lt, 0, 1.4);
  return (
    <Svg>
      <g transform={`translate(${W / 2 + 25} ${H / 2 - 20}) scale(${0.86 * zoom * lerp(0.9, 1, appear)})`} opacity={appear}>
        <Halos t={lt} p="h1" max={40} />
        <Heart p="h1" beat={beatAt(lt)} glow={wave(lt, PERIOD)} />
      </g>
    </Svg>
  );
};

/* ───────────────────────── ECG ───────────────────────── */

const g = (x: number, m: number, sd: number) => Math.exp(-((x - m) ** 2) / (2 * sd * sd));
const ECG_P = 280;
export const ecgY = (x: number, x0 = 0) => {
  const q = (((x - x0) % ECG_P) + ECG_P) % ECG_P;
  return -24 * g(q, 60, 13) + 16 * g(q, 104, 4.5) - 200 * g(q, 117, 5.5) + 52 * g(q, 130, 5.5) - 44 * g(q, 195, 20);
};
const ecgPath = (x1: number, x2: number, y0: number, x0 = 0, amp = 1) => {
  let d = '';
  for (let x = x1; x <= x2; x += 2) d += `${x === x1 ? 'M' : 'L'}${x.toFixed(1)} ${(y0 + amp * ecgY(x, x0)).toFixed(1)}`;
  return d;
};

const X1 = 120;
const X2 = 960;
const Y0 = 980;
const ECG_D = ecgPath(X1, X2, Y0, X1 + 30);
const SWEEP = 4.2;
const SWEEP_GAP = 0.8;

export const EcgScene: React.FC<SceneProps> = ({lt}) => {
  // il cuore arriva dalla scena 1 (zoom 1.15) e si ritira sullo sfondo
  const k = ip(lt, 0, 2.6);
  const hs = lerp(0.86 * 1.15, 0.55, k);
  const ho = lerp(1, 0.2, k);
  // sweep da monitor, sinistra → destra, ripetuto
  const t0 = lt - 1.2;
  const n = Math.max(0, Math.floor(t0 / (SWEEP + SWEEP_GAP)));
  const u = t0 < 0 ? 0 : clamp((t0 - n * (SWEEP + SWEEP_GAP)) / SWEEP);
  const head = lerp(X1, X2, u);
  const done = u >= 1;
  const prev = n > 0;
  const ecgOpacity = ip(lt, 0.8, 1.6);
  return (
    <Svg>
      <defs>
        <Blur id="e8" s={8} />
        <Blur id="e18" s={18} />
        <linearGradient id="etrail" gradientUnits="userSpaceOnUse" x1={head - 620} x2={head}>
          <stop offset="0" stopColor="#fff" stopOpacity={done ? 1 : 0.18} />
          <stop offset="1" stopColor="#fff" stopOpacity={1} />
        </linearGradient>
        <linearGradient id="eedge" gradientUnits="userSpaceOnUse" x1={X1} x2={X2}>
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.06" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.94" stopColor="#fff" stopOpacity={1} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id="emask" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <g>
            <rect x={X1 - 20} y={600} width={Math.max(0, head - X1 + 20)} height={760} fill="url(#etrail)" />
            {prev && !done && <rect x={head + 70} y={600} width={Math.max(0, X2 + 20 - head - 70)} height={760} fill="#fff" opacity={0.22 * (1 - u)} />}
          </g>
        </mask>
        <mask id="eedgem" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect x={0} y={0} width={W} height={H} fill="url(#eedge)" />
        </mask>
      </defs>
      <g transform={`translate(${W / 2 + 25} ${H / 2 - 20 - 160 * k}) scale(${hs})`} opacity={ho}>
        <Heart p="h2" beat={beatAt(lt + 10.7)} glow={wave(lt + 10.7, PERIOD) * (1 - k)} />
      </g>
      <g opacity={ecgOpacity} mask="url(#eedgem)">
        {/* linea di base appena accennata */}
        <line x1={X1} x2={X2} y1={Y0} y2={Y0} stroke={C.cyanCore} strokeOpacity={0.12} strokeWidth={2} />
        <g mask="url(#emask)">
          <path d={ECG_D} stroke={C.cyan} strokeWidth={22} fill="none" opacity={0.35} filter="url(#e18)" strokeLinejoin="round" />
          <path d={ECG_D} stroke={C.cyan} strokeWidth={9} fill="none" opacity={0.6} filter="url(#e8)" strokeLinejoin="round" />
          <path d={ECG_D} stroke={C.cyanCore} strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <path d={ECG_D} stroke="#FFFFFF" strokeWidth={1.6} fill="none" opacity={0.85} strokeLinejoin="round" />
        </g>
        {t0 > 0 && !done && (
          <g transform={`translate(${head} ${Y0 + ecgY(head, X1 + 30)})`}>
            <circle r={34} fill={C.cyan} opacity={0.45} filter="url(#e18)" />
            <circle r={9} fill="#fff" />
          </g>
        )}
      </g>
    </Svg>
  );
};

/* ───────────────────────── Tunnel arterioso + Holter ───────────────────────── */

const RINGS = 16;
const K = 430;
const CX = W / 2;
const CY = H / 2;

export const Holter: React.FC<{lt: number; p: string}> = ({lt, p}) => {
  const blink = wave(lt, 2.4);
  let mini = '';
  for (let x = -130; x <= 130; x += 2) mini += `${x === -130 ? 'M' : 'L'}${x} ${(-72 + 0.25 * ecgY(x * 2 + lt * 140, 0)).toFixed(1)}`;
  return (
    <g>
      <defs>
        <linearGradient id={`${p}body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E3DED6" />
        </linearGradient>
        <linearGradient id={`${p}scr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#13597F" />
          <stop offset="1" stopColor="#0A3249" />
        </linearGradient>
        <linearGradient id={`${p}btn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5CC3C0" />
          <stop offset="1" stopColor={C.tealDeep} />
        </linearGradient>
        <clipPath id={`${p}clip`}>
          <rect x={-105} y={-140} width={210} height={130} rx={22} />
        </clipPath>
        <Blur id={`${p}b6`} s={6} />
        <Blur id={`${p}b16`} s={16} />
        <Blur id={`${p}b30`} s={30} />
      </defs>
      <ellipse cx={0} cy={300} rx={210} ry={34} fill="#0F4C6E" opacity={0.16} filter={`url(#${p}b30)`} />
      {/* cavo con elettrodo */}
      <path d="M 70 -198 C 80 -330 250 -300 250 -420 C 250 -500 175 -530 140 -488" stroke="#7FAFAD" strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d="M 70 -198 C 80 -330 250 -300 250 -420 C 250 -500 175 -530 140 -488" stroke="#DDF1F0" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} transform="translate(-3 -3)" />
      <circle cx={128} cy={-478} r={44} fill="#FFFFFF" />
      <circle cx={128} cy={-478} r={44} fill="none" stroke="#D9D2C8" strokeWidth={3} />
      <circle cx={128} cy={-478} r={16} fill={C.teal} />
      {/* corpo */}
      <rect x={-150} y={-200} width={300} height={400} rx={64} fill={`url(#${p}body)`} />
      <rect x={-150} y={-200} width={300} height={400} rx={64} fill="none" stroke="#CFC8BD" strokeWidth={2} />
      <rect x={-140} y={-190} width={280} height={380} rx={56} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.9} />
      <rect x={-95} y={-205} width={190} height={14} rx={7} fill="#D3CCC1" />
      {/* schermo */}
      <rect x={-105} y={-140} width={210} height={130} rx={22} fill={`url(#${p}scr)`} />
      <g clipPath={`url(#${p}clip)`}>
        <path d={mini} stroke={C.cyan} strokeWidth={8} fill="none" opacity={0.4} filter={`url(#${p}b6)`} />
        <path d={mini} stroke={C.cyan} strokeWidth={3} fill="none" strokeLinejoin="round" />
        <rect x={-105} y={-140} width={210} height={50} fill="#FFFFFF" opacity={0.07} />
      </g>
      {/* LED */}
      <circle cx={100} cy={-165} r={30} fill={C.cyan} opacity={0.15 + 0.5 * blink} filter={`url(#${p}b16)`} />
      <circle cx={100} cy={-165} r={10} fill={C.cyan} opacity={0.55 + 0.45 * blink} />
      <circle cx={97} cy={-168} r={3.5} fill="#FFFFFF" opacity={0.9} />
      {/* tasti */}
      <circle cx={-48} cy={90} r={30} fill={`url(#${p}btn)`} />
      <circle cx={48} cy={90} r={30} fill="#1383B5" />
      <circle cx={-56} cy={80} r={9} fill="#FFFFFF" opacity={0.45} filter={`url(#${p}b6)`} />
      <circle cx={40} cy={80} r={9} fill="#FFFFFF" opacity={0.4} filter={`url(#${p}b6)`} />
      {/* riflesso */}
      <path d="M -128 -120 C -128 -170 -100 -185 -60 -185" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} filter={`url(#${p}b6)`} />
    </g>
  );
};

export const HolterScene: React.FC<SceneProps> = ({lt, s}) => {
  const dur = s.end - s.start;
  const tPB = s.sentences[2][0] - s.start - 0.4; // pull-back su "Per questo esiste l'Holter cardiaco"
  const L = 3.2;
  const speed = 0.75;
  const uPB = clamp((lt - tPB) / L);
  const pos = speed * (lt < tPB ? lt : tPB + (L / 2) * (1 - (1 - uPB) * (1 - uPB)));
  const pb = inOut(uPB);
  const tunnelOn = pb < 1;
  const rings: React.ReactNode[] = [];
  const items: {z: number; i: number}[] = [];
  for (let i = 0; i < RINGS; i++) items.push({z: (((i - pos) % RINGS) + RINGS) % RINGS + 0.3, i});
  items.sort((a, b) => b.z - a.z);
  for (const {z, i} of items) {
    const pulse = wave(lt - z * 0.12, 1.6);
    const r = (K / z) * (1 + 0.05 * pulse);
    if (r > 1500) continue;
    const o = clamp((RINGS - z) / 5) * clamp((z - 0.3) / 0.7);
    const sw = Math.min(150, 80 / z);
    const near = clamp(1 - z / RINGS);
    rings.push(
      <g key={i} opacity={o}>
        <circle cx={CX} cy={CY} r={r} fill="none" stroke={near > 0.6 ? '#E49A89' : near > 0.3 ? '#EDB2A3' : '#F4CBBE'} strokeWidth={sw} />
        <circle cx={CX} cy={CY - sw * 0.18} r={r} fill="none" stroke="#FFE9E0" strokeWidth={sw * 0.18} opacity={0.75} />
        <circle cx={CX} cy={CY + sw * 0.22} r={r} fill="none" stroke="#B9665A" strokeWidth={sw * 0.16} opacity={0.35} />
      </g>,
    );
  }
  const parts: React.ReactNode[] = [];
  for (let j = 0; j < 46; j++) {
    const z = (((rand(j) * 12 - pos * 1.3) % 12) + 12) % 12 + 0.35;
    const a = rand(j + 50) * Math.PI * 2;
    const rr = 0.25 + rand(j + 90) * 0.6;
    const x = CX + Math.cos(a) * rr * (K / z);
    const y = CY + Math.sin(a) * rr * (K / z);
    const size = Math.min(16, 5.5 / z + 1.2);
    const o = clamp((12 - z) / 4) * clamp((z - 0.35) / 0.6);
    parts.push(<circle key={j} cx={x} cy={y} r={size} fill={j % 4 === 0 ? C.cyan : '#FFF8F2'} opacity={o * 0.9} />);
  }
  const dev = ip(lt, tPB + 1.3, tPB + 3.0);
  const dial = ip(lt, tPB + 2.6, tPB + 3.8);
  const dayU = clamp((lt - (tPB + 3.0)) / Math.max(1, dur - tPB - 3));
  const ang = -90 + 360 * inOut(dayU);
  const R = 360;
  const ax = CX + R * Math.cos((ang * Math.PI) / 180);
  const ay = CY + 20 + R * Math.sin((ang * Math.PI) / 180);
  const arcLarge = ang + 90 > 180 ? 1 : 0;
  return (
    <Svg>
      <defs>
        <radialGradient id="tbg" cx={CX} cy={CY} r={1100} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF6F0" />
          <stop offset="0.25" stopColor="#F6D2C5" />
          <stop offset="1" stopColor="#C97A6C" />
        </radialGradient>
        <radialGradient id="tcore">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
          <stop offset="1" stopColor="#FFF2EA" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="tmask">
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id="tm" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <circle cx={CX} cy={CY} r={lerp(1600, 380, pb)} fill={pb > 0 ? 'url(#tmask)' : '#fff'} />
        </mask>
        <Blur id="tb2" s={2} />
      </defs>
      {tunnelOn && (
        <g opacity={ip(lt, -0.25, 2.2) * (1 - ip(lt, tPB + 0.3, tPB + L))} mask="url(#tm)">
          <g transform={`translate(${CX} ${CY}) scale(${lerp(1, 0.32, pb)}) translate(${-CX} ${-CY})`}>
            <rect x={-600} y={-600} width={W + 1200} height={H + 1200} fill="url(#tbg)" />
            <circle cx={CX} cy={CY} r={260} fill="url(#tcore)" />
            {rings}
            <g filter="url(#tb2)">{parts}</g>
          </g>
        </g>
      )}
      {dial > 0 && (
        <g opacity={dial}>
          <circle cx={CX} cy={CY + 20} r={R} fill="none" stroke={C.teal} strokeOpacity={0.22} strokeWidth={3} />
          {dayU > 0 && <path d={`M ${CX} ${CY + 20 - R} A ${R} ${R} 0 ${arcLarge} 1 ${ax} ${ay}`} fill="none" stroke={C.teal} strokeWidth={6} strokeLinecap="round" opacity={0.75} />}
          <circle cx={ax} cy={ay} r={26} fill={C.cyan} opacity={0.3} />
          <circle cx={ax} cy={ay} r={11} fill={C.teal} />
        </g>
      )}
      {dev > 0 && (
        <g transform={`translate(${CX} ${CY + 40 + 12 * Math.sin(lt * 0.8)}) scale(${lerp(0.72, 1, dev) * 0.9})`} opacity={dev}>
          <Holter lt={lt} p="ho" />
        </g>
      )}
    </Svg>
  );
};
