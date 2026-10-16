import React from 'react';
import {Dust, E, Ext, FONT, Letters3D, Obj, Ring, Show, Thread, tw, useT} from '../engine/core';
import {SetBg} from '../engine/fx';
import {B} from './brand';
import {OX, SETS} from './timeline';

const THREAD = 'M -1800 220 C -1300 220 -1100 -260 -640 -200 C -300 -150 -420 280 0 290 C 420 300 580 -140 320 -270 C 60 -380 -150 -60 0 0';

export const SOpen: React.FC = () => {
  const t = useT();
  const ox = OX(SETS.open.k);
  const p = tw(t, 0.25, 2.3, E.inOut3);
  return (
    <Obj x={ox}>
      <SetBg color={B.dark} ox={0} />
      <Dust n={110} w={3400} h={2000} z0={-800} z1={1200} color={B.accent2} size={7} />
      <Obj z={0}>
        <Thread d={THREAD} p={p} color={B.accent} w={7} head={B.accent2} />
      </Obj>
      <Letters3D
        text="PQUATTRO"
        size={340}
        face={B.ivory}
        side={B.accent}
        depth={64}
        layers={12}
        ls={0.02}
        anim={(i) => {
          const a = 2.45 + i * 0.07;
          const k = tw(t, a, 1.1, E.expoOut);
          const r = tw(t, a, 1.5, E.settle);
          return {z: (1 - k) * 1100, ry: (1 - r) * (i % 2 ? 80 : -80), rz: (1 - r) * (i % 2 ? 20 : -20), y: (1 - k) * (i % 2 ? 200 : -200), o: tw(t, a, 0.25, (x) => x)};
        }}
      />
      <Obj y={235}>
        <Ext text={B.tagline} size={32} font={FONT.sans} weight={800} ls={0.52} face={B.ivory} opacity={tw(t, 3.9, 0.7, (x) => x)} />
      </Obj>
      <Show a={2.2} b={6}>
        <Obj z={-40}>
          <Ring r={520 + tw(t, 3.0, 2.0, E.expoOut) * 600} color={B.accent} bw={6} opacity={1 - tw(t, 3.0, 2.0, E.out3)} />
        </Obj>
        <Obj z={-80}>
          <Ring r={380 + tw(t, 3.15, 2.0, E.expoOut) * 900} color={B.accent2} bw={3} opacity={0.7 * (1 - tw(t, 3.15, 2.0, E.out3))} />
        </Obj>
      </Show>
    </Obj>
  );
};
