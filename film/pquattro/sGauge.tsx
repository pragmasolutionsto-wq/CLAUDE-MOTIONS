import React from 'react';
import {Dust, E, Ext, FONT, Letters3D, Obj, Ring, Svg3D, lerp, mixHex, tw, useT, type CamKey} from '../engine/core';
import {Box3D, Burst, SetBg} from '../engine/fx';
import {B} from './brand';
import {OX, SETS} from './timeline';

const ox = OX(SETS.gauge.k);
export const GA_T0 = 49.55;
const NEEDLE = GA_T0 + 1.3;

export const gaugeCam = (): CamKey[] => [
  {t: GA_T0 - 0.05, p: [ox + 60, 20, 2150], r: [0, 4, -1.5], cut: true},
  {t: GA_T0 + 2.2, p: [ox + 160, -20, 1900], r: [0, -3, 1]},
  {t: 54.2, p: [ox + 300, -40, 1620], r: [0, -8, 1.8], hold: true},
];

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
};
const arc = (r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(0, 0, r, a0);
  const [x1, y1] = polar(0, 0, r, a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

export const SGauge: React.FC = () => {
  const t = useT();
  const v = 0.84 * tw(t, NEEDLE, 1.6, E.settle);
  const ang = 150 + 240 * v;
  const fillLen = 2 * Math.PI * 330 * (240 / 360);
  const pop = tw(t, GA_T0 + 0.9, 0.7, (x) => E.back(x, 2.6));
  const bars = [170, 260, 350, 470, 620];
  return (
    <Obj x={ox}>
      <SetBg color={B.dark} ox={0} />
      <Dust n={110} w={5200} h={2600} z0={-1500} z1={1200} color={B.accent2} size={7} />

      <Obj x={-640} y={-390} z={-200}>
        <Letters3D
          text="ANALISI"
          size={300}
          face={B.ivory}
          side={B.accent}
          depth={80}
          layers={11}
          ls={0.02}
          anim={(i) => {
            const a = GA_T0 + i * 0.06;
            const k = tw(t, a, 0.85, (x) => E.back(x, 2.1));
            return {rx: (1 - k) * 100, y: (1 - k) * -420, z: (1 - k) * 700, o: tw(t, a, 0.1, (x) => x)};
          }}
        />
      </Obj>
      <Obj x={-560} y={-150} z={-200}>
        <Letters3D
          text="PERFORMANCE"
          size={205}
          face={B.accent}
          side={B.dark}
          depth={60}
          layers={10}
          ls={0.02}
          anim={(i) => {
            const a = GA_T0 + 0.4 + i * 0.045;
            const k = tw(t, a, 0.85, (x) => E.back(x, 2.1));
            return {z: (1 - k) * 900, y: (1 - k) * 360, o: tw(t, a, 0.1, (x) => x)};
          }}
        />
      </Obj>

      {/* barre che crescono */}
      {bars.map((h, i) => {
        const g = tw(t, GA_T0 + 0.7 + i * 0.14, 1.0, (x) => E.back(x, 1.7));
        const hh = Math.max(1, h * g * 0.34);
        return (
          <Box3D key={i} x={-1110 + i * 170} y={480 - hh / 2} z={-100} w={120} h={hh} d={140} front={i === 4 ? B.accent : mixHex(B.ivory, B.accent2, i / 4)} side={mixHex(B.navy, '#000000', 0.2)} />
        );
      })}

      {/* quadrante */}
      <Obj x={470} y={90} z={0} ry={-8} s={tw(t, GA_T0 + 0.5, 0.9, (x) => E.back(x, 1.8))}>
        <Svg3D size={820}>
          <circle cx={0} cy={0} r={390} fill={B.navy} />
          <circle cx={0} cy={0} r={390} fill="none" stroke={B.ivory} strokeWidth={10} opacity={0.9} />
          <path d={arc(330, 150, 390)} fill="none" stroke={B.ivory} strokeWidth={34} strokeLinecap="round" opacity={0.15} />
          <path d={arc(330, 150, 390)} fill="none" stroke={B.accent} strokeWidth={34} strokeLinecap="round" strokeDasharray={fillLen} strokeDashoffset={fillLen * (1 - v)} />
          {new Array(41).fill(0).map((_, i) => {
            const d = 150 + (i / 40) * 240;
            const [x0, y0] = polar(0, 0, 262, d);
            const [x1, y1] = polar(0, 0, i % 5 === 0 ? 212 : 235, d);
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={B.ivory} strokeWidth={i % 5 === 0 ? 7 : 3} opacity={0.8} />;
          })}
          <g transform={`rotate(${ang})`}>
            <path d="M -30 -9 L 300 0 L -30 9 Z" fill={B.ivory} />
            <path d="M -30 -9 L 300 0 L -30 9 Z" fill={B.accent2} opacity={0.4} />
          </g>
          <circle cx={0} cy={0} r={46} fill={B.ivory} />
          <circle cx={0} cy={0} r={18} fill={B.accent} />
        </Svg3D>
        <Obj z={30}>
          <Ring r={400 + tw(t, NEEDLE + 0.9, 1.1, E.expoOut) * 500} color={B.accent2} bw={6} opacity={t > NEEDLE + 0.9 ? 1 - tw(t, NEEDLE + 0.9, 1.1, E.out3) : 0} />
        </Obj>
        <Burst t0={NEEDLE + 0.95} z={160} n={44} color={B.accent2} power={900} seed={41} />
      </Obj>

      {/* badge PROMO */}
      <Obj x={-90} y={-470} z={300} s={pop} rz={(t - GA_T0) * 40}>
        <Svg3D size={300}>
          <polygon
            points={new Array(32)
              .fill(0)
              .map((_, i) => {
                const a = (i / 32) * Math.PI * 2;
                const r = i % 2 ? 100 : 128;
                return `${Math.cos(a) * r},${Math.sin(a) * r}`;
              })
              .join(' ')}
            fill={B.accent}
          />
        </Svg3D>
      </Obj>
      <Obj x={-90} y={-470} z={312} s={pop}>
        <Ext text="PROMO" size={86} face={B.ivory} />
      </Obj>

      {/* CTA */}
      <Obj x={-560} y={130} z={-100} s={tw(t, GA_T0 + 2.6, 0.7, (x) => E.back(x, 2.4)) * (1 + 0.025 * Math.sin(t * 9))}>
        <div style={{position: 'absolute', left: -280, top: -52, width: 560, height: 104, borderRadius: 60, background: B.accent, color: B.ivory, fontFamily: 'Manrope', fontWeight: 800, fontSize: 40, letterSpacing: 7, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>RICHIEDILA ORA</div>
      </Obj>
      <Obj x={-560} y={20} z={-100}>
        <Ext text="Parti dal potenziale reale della tua farmacia." size={46} font={FONT.serif} weight={500} italic face={B.ivory} opacity={tw(t, GA_T0 + 2.9, 0.6, (x) => x)} />
      </Obj>
    </Obj>
  );
};
