import React from 'react';
import {Cuboid, Dust, E, Ext, FONT, Letters3D, Obj, Ring, Show, clamp, lerp, tw, useT, type CamKey} from '../engine/core';
import {Burst, SetBg} from '../engine/fx';
import {B} from './brand';
import {OX, SETS} from './timeline';

const ox = OX(SETS.target.k);
export const TG_T0 = 25.9;
const TC: [number, number, number] = [560, 20, -1200]; // centro bersaglio (locale)
const HIT = TG_T0 + 3.05;

export const targetCam = (): CamKey[] => [
  {t: 25.5, p: [ox - 100, -40, 2150], r: [0, 4, -1], hold: true},
  {t: TG_T0 + 0.1, p: [ox - 40, -30, 2000], r: [0, 2, -0.5]},
  {t: TG_T0 + 1.5, p: [ox + 60, -20, 1700], r: [0, -2, 0.5]},
  {t: TG_T0 + 2.9, p: [ox + 250, 0, 1150], r: [0, -9, 2]},
  {t: HIT + 0.9, p: [ox + 120, -10, 1000], r: [0, -4, 0.5]},
  {t: 30.4, p: [ox + 60, -10, 900], r: [0, -2, 0]},
];

const RAD = [520, 420, 320, 220, 110];
const COL = [B.ivory, B.accent, B.ivory, B.accent, B.dark];

export const STarget: React.FC = () => {
  const t = useT();
  const hitK = t > HIT ? Math.exp(-(t - HIT) * 6) * Math.cos((t - HIT) * 28) : 0;

  // freccia: da fuori campo verso il centro
  const flight = tw(t, HIT - 0.4, 0.4, E.in3);
  const from: [number, number, number] = [1800, -900, 900];
  const dx = TC[0] - from[0];
  const dy = TC[1] - from[1];
  const dz = TC[2] - from[2];
  const ry = -Math.atan2(dx, -dz) * (180 / Math.PI);
  const rx = Math.atan2(dy, Math.hypot(dx, dz)) * (180 / Math.PI);
  const pos: [number, number, number] = [lerp(from[0], TC[0], flight), lerp(from[1], TC[1], flight), lerp(from[2], TC[2] + 40, flight)];

  return (
    <Obj x={ox}>
      <SetBg color={B.dark} ox={0} />
      <Dust n={120} w={5200} h={2600} z0={-1800} z1={1500} color={B.accent2} size={7} />

      {/* SERVIZI */}
      <Obj y={-60} z={0}>
        <Letters3D
          text="SERVIZI"
          size={520}
          face={B.ivory}
          side={B.accent}
          depth={120}
          layers={14}
          ls={0.02}
          anim={(i, n) => {
            const a = TG_T0 + i * 0.07;
            const k = tw(t, a, 0.9, (x) => E.back(x, 2.2));
            const out = tw(t, TG_T0 + 1.55 + i * 0.03, 0.7, E.in3);
            return {rx: (1 - k) * 100 - out * 40, y: (1 - k) * -500 + out * 160 * (i % 2 ? -1 : 1), z: (1 - k) * 600 + out * 2400, rz: out * (i % 2 ? 25 : -25), o: tw(t, a, 0.1, (x) => x) * (1 - clamp(out * 1.1 - 0.1))};
          }}
        />
      </Obj>
      <Obj y={-420} z={0}>
        <Ext text="COSA FACCIAMO" size={36} font={FONT.sans} weight={800} ls={0.55} face={B.accent2} opacity={tw(t, TG_T0 + 0.6, 0.4, (x) => x) * (1 - tw(t, TG_T0 + 1.5, 0.3, (x) => x))} />
      </Obj>

      {/* bersaglio */}
      <Show a={TG_T0 + 0.9} b={31}>
        <Obj x={TC[0]} y={TC[1]} z={TC[2]}>
          {RAD.map((r, i) => {
            const k = tw(t, TG_T0 + 1.6 + i * 0.1, 0.8, (x) => E.back(x, 1.8)) * (1 + hitK * 0.08 * (i + 1) * 0.4);
            return (
              <Obj key={i} z={i * 6} s={k}>
                <Obj z={0}>
                  <div style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', background: COL[i]}} />
                </Obj>
              </Obj>
            );
          })}
          <Obj z={40}>
            <Ring r={560 + tw(t, HIT, 1.4, E.expoOut) * 600} color={B.accent} bw={8} opacity={t > HIT ? 1 - tw(t, HIT, 1.4, E.out3) : 0} />
          </Obj>
          <Obj z={50}>
            <Ring r={520 + tw(t, HIT + 0.08, 1.4, E.expoOut) * 900} color={B.accent2} bw={4} opacity={t > HIT ? 0.8 * (1 - tw(t, HIT + 0.08, 1.4, E.out3)) : 0} />
          </Obj>
          <Burst t0={HIT} z={80} n={60} color={B.accent2} power={1100} size={10} seed={5} />
          <Burst t0={HIT} z={80} n={30} color={B.ivory} power={800} size={7} seed={6} />
        </Obj>
      </Show>

      {/* freccia */}
      <Show a={HIT - 0.45} b={HIT + 12}>
        <Obj x={pos[0]} y={pos[1]} z={pos[2]} rx={rx} ry={ry}>
          <Obj z={-300}>
            <Cuboid w={26} h={26} d={900} front={B.ivory} side={B.ivory} />
          </Obj>
          <Obj z={210}>
            <Cuboid w={46} h={46} d={170} front={B.accent} side={B.accent} />
          </Obj>
        </Obj>
      </Show>

      {/* testo che esce dopo l'impatto */}
      <Obj x={-500} y={-110} z={-500}>
        <Letters3D
          text="POSIZIONAMENTO"
          size={190}
          face={B.ivory}
          side={B.accent}
          depth={60}
          layers={10}
          ls={0.02}
          anim={(i) => {
            const a = HIT + 0.05 + i * 0.03;
            const k = tw(t, a, 0.8, (x) => E.back(x, 2.2));
            return {z: (1 - k) * 1200, y: (1 - k) * -260, rx: (1 - k) * -70, o: tw(t, a, 0.08, (x) => x)};
          }}
        />
      </Obj>
      <Obj x={-500} y={110} z={-500}>
        <Ext text="Un’identità commerciale definita e riconosciuta." size={54} font={FONT.serif} weight={500} italic face={B.ivory} opacity={tw(t, HIT + 0.9, 0.5, (x) => x)} />
      </Obj>
    </Obj>
  );
};
