import React from 'react';
import {Dust, E, Ext, FONT, Letters3D, Obj, Ring, clamp, lerp, mixHex, tw, useT, type CamKey} from '../engine/core';
import {Ball3D, Box3D, Burst, SetBg} from '../engine/fx';
import {B} from './brand';
import {OX, SETS} from './timeline';

const ox = OX(SETS.training.k);
export const TR_T0 = 44.25;

const STEPS = 5;
const SW = 330;
const X0 = -820;
const FLOOR = 440;
const H = (i: number) => 120 + i * 120;
const HOP = 0.52;
const HOP0 = TR_T0 + 1.5;
export const TOP = HOP0 + (STEPS - 1) * HOP + 0.2;

export const trainingCam = (): CamKey[] => [
  {t: 44.0, p: [ox - 360, 160, 2050], r: [0, 8, -2], hold: true},
  {t: TR_T0 + 1.8, p: [ox - 220, 100, 1800], r: [0, 4, -1]},
  {t: TOP, p: [ox + 250, -120, 1620], r: [-2, -6, 1.5]},
  {t: 48.7, p: [ox + 330, -150, 1520], r: [-1, -8, 1.8]},
];

export const STraining: React.FC = () => {
  const t = useT();
  // posizione della palla: salti da gradino a gradino
  const a = t - HOP0;
  const idx = clamp(Math.floor(a / HOP), 0, STEPS - 1);
  const f = a < 0 ? 0 : a >= (STEPS - 1) * HOP ? 1 : (a - idx * HOP) / HOP;
  const topY = (i: number) => FLOOR - H(i);
  const bx = X0 + (idx + f) * SW + SW / 2 - 40;
  const y0 = topY(idx) - 70;
  const y1 = topY(Math.min(STEPS - 1, idx + 1)) - 70;
  const by = a < 0 ? topY(0) - 70 : a >= (STEPS - 1) * HOP ? topY(STEPS - 1) - 70 : lerp(y0, y1, f) - Math.sin(f * Math.PI) * 180;
  const squash = a >= 0 && a < (STEPS - 1) * HOP ? 1 - 0.25 * Math.pow(Math.abs(Math.cos(f * Math.PI)), 6) : 1;
  const atTop = t > TOP;
  return (
    <Obj x={ox}>
      <SetBg color={B.navy} ox={0} />
      <Dust n={110} w={5200} h={2800} z0={-1500} z1={1200} color={B.accent2} size={7} />

      <Obj x={-120} y={-420} z={-500}>
        <Letters3D
          text="FORMAZIONE"
          size={330}
          face={B.ivory}
          side={B.accent}
          depth={90}
          layers={12}
          ls={0.015}
          anim={(i) => {
            const aa = TR_T0 + 0.1 + i * 0.05;
            const k = tw(t, aa, 0.9, (x) => E.back(x, 2.1));
            return {rx: (1 - k) * 100, y: (1 - k) * -420, z: (1 - k) * 800, o: tw(t, aa, 0.1, (x) => x)};
          }}
        />
      </Obj>
      <Obj x={-120} y={-215} z={-500}>
        <Ext text="Formazione personalizzata sulla relazione con il cliente e sulla vendita." size={48} font={FONT.serif} weight={500} italic face={B.ivory} opacity={tw(t, TR_T0 + 1.2, 0.6, (v) => v)} />
      </Obj>

      {new Array(STEPS).fill(0).map((_, i) => {
        const g = tw(t, TR_T0 + 0.5 + i * 0.12, 0.8, (x) => E.back(x, 1.5));
        const h = Math.max(1, H(i) * g);
        const hit = t > HOP0 + i * HOP && t < HOP0 + i * HOP + 0.25 ? 1 : 0;
        const col = i === STEPS - 1 && atTop ? B.accent : mixHex(B.ivory, B.accent2, i / (STEPS - 1));
        return (
          <Box3D key={i} x={X0 + i * SW + SW / 2} y={FLOOR - h / 2} z={0} w={SW - 14} h={h} d={460} front={col} side={mixHex(col, '#000000', 0.3)} />
        );
      })}

      <Ball3D x={bx} y={by} z={120} r={70} color={B.accent} sx={1 / squash} sy={squash} />

      {atTop ? (
        <Obj x={X0 + (STEPS - 1) * SW + SW / 2 - 40} y={topY(STEPS - 1) - 240} z={140}>
          <Obj rz={(t - TOP) * 120} s={tw(t, TOP, 0.6, (x) => E.back(x, 3))}>
            <Ext text="✦" size={190} font={FONT.display} face={B.accent2} />
          </Obj>
          <Ring r={80 + tw(t, TOP, 1.2, E.expoOut) * 700} color={B.accent2} bw={6} opacity={1 - tw(t, TOP, 1.2, E.out3)} />
          <Burst t0={TOP} z={60} n={60} color={B.accent2} power={1000} size={10} seed={31} />
          <Burst t0={TOP} z={60} n={30} color={B.ivory} power={800} size={7} seed={32} />
        </Obj>
      ) : null}
    </Obj>
  );
};
