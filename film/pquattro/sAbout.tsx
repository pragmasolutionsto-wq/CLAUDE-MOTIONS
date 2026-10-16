import React from 'react';
import {Dust, E, Ext, FONT, Letters3D, Obj, Ring, Thread, clamp, lerp, tw, useT} from '../engine/core';
import {Burst, SetBg, Sphere} from '../engine/fx';
import {B} from './brand';
import {OX, SETS} from './timeline';

const AREAS = [
  {label: 'ANALISI\nDATI', color: B.accent},
  {label: 'VISUAL\nMERCH.', color: B.ivory, ink: B.dark},
  {label: 'MARKETING', color: B.navy},
];

export const SAbout: React.FC = () => {
  const t = useT();
  const ox = OX(SETS.about.k);
  const T0 = SETS.about.a + 0.35; // arrivo della whip
  const lock = tw(t, T0 + 1.1, 1.5, E.inOut5);
  const R = lerp(1000, 200, lock);
  const spin = (1 - lock) * 7 + t * 0.15;
  const strike = tw(t, T0 + 1.7, 0.55, E.inOut3);
  const dead = tw(t, T0 + 2.25, 0.9, E.in3);
  return (
    <Obj x={ox}>
      <SetBg color={B.dark} ox={0} />
      <Dust n={100} w={4600} h={2400} z0={-1200} z1={1300} color={B.accent2} size={7} />

      {/* EX COLLEGHI. -> barrato e disintegrato */}
      <Obj x={-440} y={-215} z={0}>
        <Letters3D
          text="EX COLLEGHI."
          size={270}
          face={B.ivory}
          side={B.accent}
          depth={60}
          layers={10}
          ls={0.015}
          anim={(i, n) => {
            const a = T0 + i * 0.04;
            const k = tw(t, a, 0.8, (x) => E.back(x, 2));
            const g = dead * (0.6 + 0.8 * Math.abs(Math.sin(i * 12.3)));
            return {rx: (1 - k) * 90, z: (1 - k) * 500 + g * 700, y: g * g * 1500 * (i % 2 ? 1 : 0.7), rz: g * (i % 2 ? 70 : -60), x: g * (i - n / 2) * 30, o: tw(t, a, 0.15, (x) => x) * (1 - clamp(g * 1.4 - 0.2))};
          }}
        />
      </Obj>
      <Obj x={-440} y={-215} z={20}>
        <Thread d="M -700 8 L 760 -4" p={strike} color={B.accent} w={14} head={B.accent2} headSize={22} />
      </Obj>

      {/* ORA SOCI. */}
      <Obj x={-470} y={140} z={0}>
        <Letters3D
          text="ORA SOCI."
          size={330}
          face={B.accent}
          side={B.dark}
          depth={90}
          layers={12}
          ls={0.015}
          anim={(i) => {
            const a = T0 + 2.35 + i * 0.05;
            const k = tw(t, a, 0.9, (x) => E.back(x, 2.4));
            return {z: (1 - k) * 1200, y: (1 - k) * -300, ry: (1 - k) * (i % 2 ? 60 : -60), o: tw(t, a, 0.1, (x) => x)};
          }}
        />
      </Obj>
      <Obj x={-470} y={410} z={0}>
        <Ext text="Nati dall’ufficio marketing di un distributore farmaceutico." size={58} font={FONT.serif} weight={500} italic face={B.ivory} opacity={tw(t, T0 + 3.6, 0.6, (x) => x)} />
      </Obj>

      {/* i tre soci: sfere in orbita che si agganciano */}
      <Obj x={760} y={-10} z={0}>
        {AREAS.map((a, i) => {
          const ang = (i / 3) * Math.PI * 2 + spin;
          const pop = tw(t, T0 + 0.1 + i * 0.12, 0.8, (x) => E.back(x, 2));
          const x = Math.cos(ang) * R * (1 + 0.35 * (1 - lock));
          const y = Math.sin(ang) * R * 0.78;
          const z = Math.sin(ang * 1.5) * 300 * (1 - lock) + 80;
          const bob = Math.sin(t * 1.6 + i * 2) * 10 * lock;
          return (
            <Obj key={i} x={x} y={y + bob} z={z} s={pop}>
              <Sphere r={240} color={a.color} />
              <Obj z={4}>
                <Ext text={a.label.replace('\n', ' ')} size={a.label.length > 10 ? 40 : 46} font={FONT.sans} weight={800} ls={0.06} face={a.ink ?? B.ivory} />
              </Obj>
            </Obj>
          );
        })}
        <Obj z={-30}>
          <Ring r={200 + tw(t, T0 + 2.5, 1.4, E.expoOut) * 700} color={B.accent2} bw={5} opacity={0.9 * (1 - tw(t, T0 + 2.5, 1.4, E.out3)) * (t > T0 + 2.5 ? 1 : 0)} />
        </Obj>
        <Burst t0={T0 + 2.55} n={46} color={B.accent2} power={900} size={9} z={120} seed={3} />
      </Obj>
    </Obj>
  );
};
