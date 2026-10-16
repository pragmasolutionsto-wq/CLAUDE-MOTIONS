import React from 'react';
import {Dust, E, Ext, FONT, Letters3D, Obj, Thread, lerp, mixHex, rnd, tw, useT, type CamKey} from '../engine/core';
import {Box3D, SetBg} from '../engine/fx';
import {B} from './brand';
import {OX, SETS} from './timeline';

const ox = OX(SETS.shelves.k);
export const SH_T0 = 30.7;

export const shelvesCam = (): CamKey[] => [
  {t: SH_T0, p: [ox - 520, -30, 1950], r: [0, 12, -1.5]},
  {t: SH_T0 + 2.0, p: [ox - 80, -20, 1750], r: [0, 2, 0]},
  {t: SH_T0 + 3.9, p: [ox + 420, -10, 1600], r: [0, -9, 1]},
];

const ROWS = [60, 410];
const N = 9;
const PAL = [B.accent, B.dark, B.navy, '#D6D0C4', B.accent2];

export const SShelves: React.FC = () => {
  const t = useT();
  const sweep = tw(t, SH_T0 + 1.9, 1.1, E.inOut3);
  return (
    <Obj x={ox}>
      <SetBg color={B.ivory} ox={0} />
      <Dust n={90} w={5200} h={2400} z0={-1400} z1={1300} color={B.accent} size={7} opacity={0.5} />

      <Obj y={-470} z={-200}>
        <Letters3D
          text="ESPOSIZIONE"
          size={260}
          face={B.dark}
          side={B.accent}
          depth={70}
          layers={11}
          ls={0.015}
          anim={(i) => {
            const a = SH_T0 + 0.1 + i * 0.045;
            const k = tw(t, a, 0.85, (x) => E.back(x, 2));
            return {rx: (1 - k) * 100, y: (1 - k) * -420, z: (1 - k) * 600, o: tw(t, a, 0.1, (x) => x)};
          }}
        />
      </Obj>
      <Obj y={-300} z={-200}>
        <Ext text="Gestiamo tecnicamente l’esposizione della tua farmacia." size={50} font={FONT.serif} weight={500} italic face={B.dark} opacity={tw(t, SH_T0 + 2.9, 0.6, (x) => x)} />
      </Obj>

      {ROWS.map((ry, r) => {
        // geometria casuale ma deterministica
        const items = new Array(N).fill(0).map((_, i) => ({
          w: 120 + Math.floor(rnd(i + r * 20, 1) * 90),
          h: 150 + Math.floor(rnd(i + r * 20, 2) * 170),
          c: PAL[Math.floor(rnd(i + r * 20, 3) * PAL.length)],
        }));
        // ordine finale: dal più basso al più alto, colore accent sulla fila "eroe"
        const order = items.map((it, i) => ({it, i})).sort((a, b) => a.it.h - b.it.h);
        const gap = 26;
        const total = items.reduce((s, it) => s + it.w, 0) + gap * (N - 1);
        const finalX: number[] = [];
        let cx = -total / 2;
        order.forEach(({it, i}) => {
          finalX[i] = cx + it.w / 2;
          cx += it.w + gap;
        });
        return (
          <Obj key={r} y={ry}>
            <Box3D y={16} w={2400} h={30} d={380} front={B.dark} side={B.navy} />
            {items.map((it, i) => {
              const rankIdx = order.findIndex((o) => o.i === i);
              const fall0 = SH_T0 + 0.5 + r * 0.3 + i * 0.09;
              const fall = tw(t, fall0, 0.7, (x) => E.back(x, 1.5));
              const chaosX = (rnd(i + r * 20, 4) - 0.5) * 1500;
              const chaosRot = (rnd(i + r * 20, 5) - 0.5) * 34;
              const chaosZ = (rnd(i + r * 20, 6) - 0.5) * 160;
              const settle = tw(t, SH_T0 + 1.9 + rankIdx * 0.07 + r * 0.15, 0.9, E.settle);
              const x = lerp(chaosX, finalX[i], settle);
              const rot = lerp(chaosRot, 0, settle);
              const zz = lerp(chaosZ, 0, settle);
              const y = -it.h / 2 - 2 + (1 - fall) * -1300;
              const hero = rankIdx >= N - 3;
              const col = settle > 0.6 && hero ? B.accent : it.c;
              return (
                <Box3D key={i} x={x} y={y} z={zz} rz={rot} w={it.w} h={it.h} d={240} front={col} side={mixHex(col, '#000000', 0.25)} label />
              );
            })}
          </Obj>
        );
      })}
      <Obj y={235} z={190}>
        <Thread d="M -1300 0 L 1300 0" p={sweep} color={B.accent} w={10} head={B.accent2} headSize={22} fadeTail={0.12} />
      </Obj>
    </Obj>
  );
};
