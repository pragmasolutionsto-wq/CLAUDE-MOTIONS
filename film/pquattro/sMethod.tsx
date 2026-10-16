import React from 'react';
import {Dust, E, Ext, FONT, Letters3D, Obj, Ring, clamp, tw, useT} from '../engine/core';
import {Beads, Box3D, Burst, SetBg, chaseKeys, splineAt, type P3} from '../engine/fx';
import {B} from './brand';
import {OX, SETS} from './timeline';

const ox = OX(SETS.method.k);

/** il percorso del filo nello spazio locale del set */
export const METHOD_PTS: P3[] = [
  [-1900, 560, 300],
  [-950, 250, -100],
  [-150, 110, -350],
  [650, -90, -600],
  [1450, -340, -850],
  [2250, -640, -1100],
  [3300, -940, -1400],
];
export const METHOD_T0 = 18.5;
export const METHOD_T1 = 24.7;

export const methodCam = () =>
  chaseKeys(METHOD_PTS, METHOD_T0 + 0.1, METHOD_T1, E.inOut3, 0.84, [80, -60, 1750], 0.1, 0.25).map((k) => ({...k, p: [k.p[0] + ox, k.p[1], k.p[2]] as P3}));

const STEPS = [
  {n: '01', t: 'ANALISI', s: 'del potenziale della farmacia', idx: 1},
  {n: '02', t: 'OBIETTIVI', s: 'S.M.A.R.T., costruiti sul potenziale', idx: 3},
  {n: '03', t: 'CRESCITA', s: 'ti accompagniamo fino al risultato', idx: 5},
];

export const SMethod: React.FC = () => {
  const t = useT();
  const headU = clamp(E.inOut3(clamp((t - (METHOD_T0 + 0.1)) / (METHOD_T1 - METHOD_T0 - 0.1))) + 0.1);
  return (
    <Obj x={ox}>
      <SetBg color={B.ivory} ox={0} />
      <Dust n={110} w={4800} h={2200} z0={-2600} z1={900} color={B.accent} size={8} opacity={0.5} />

      {/* titolo all'inizio del volo */}
      <Obj x={-1700} y={-330} z={-150}>
        <Letters3D
          text="DAL POTENZIALE"
          size={210}
          face={B.dark}
          side={B.accent}
          depth={50}
          layers={9}
          ls={0.01}
          anim={(i) => {
            const a = METHOD_T0 + 0.05 + i * 0.035;
            const k = tw(t, a, 0.8, E.expoOut);
            return {y: (1 - k) * -300, z: (1 - k) * 500, o: tw(t, a, 0.12, (x) => x)};
          }}
        />
      </Obj>
      <Obj x={-1620} y={-90} z={-150}>
        <Letters3D
          text="ALLA CRESCITA."
          size={210}
          face={B.accent}
          side={B.dark}
          depth={50}
          layers={9}
          ls={0.01}
          anim={(i) => {
            const a = METHOD_T0 + 0.5 + i * 0.035;
            const k = tw(t, a, 0.8, E.expoOut);
            return {y: (1 - k) * 300, z: (1 - k) * 500, o: tw(t, a, 0.12, (x) => x)};
          }}
        />
      </Obj>

      <Beads pts={METHOD_PTS} p={headU} color={B.accent} head={B.accent2} size={7} n={170} />

      {STEPS.map((s, i) => {
        const c = splineAt(METHOD_PTS, s.idx / (METHOD_PTS.length - 1));
        const uIn = (s.idx / (METHOD_PTS.length - 1)) - 0.16;
        const reveal = tw(t, METHOD_T0 + 0.1 + (uIn < 0 ? 0 : 5.8 * Math.pow(Math.max(0, uIn), 1.0)) * 0.9, 0.7, (x) => E.back(x, 2.2));
        const passed = headU > s.idx / (METHOD_PTS.length - 1);
        const pulse = passed ? tw(t, METHOD_T0 + 0.1 + 5.8 * 0.9 * (s.idx / 6 - 0.1) + 0.3, 1.2, E.expoOut) : 0;
        return (
          <Obj key={s.n} x={c[0]} y={c[1]} z={c[2]}>
            <Obj s={reveal} z={0}>
              <Ring r={310} color={B.dark} bw={16} />
              <Ring r={330 + pulse * 220} color={B.accent} bw={5} opacity={passed ? 1 - pulse : 0.8} />
            </Obj>
            <Obj x={0} y={-10} z={-120} s={reveal}>
              <Ext text={s.n} size={520} face={B.accent} side={B.dark} depth={60} layers={10} />
            </Obj>
            <Obj x={0} y={430} z={40} s={reveal}>
              <Ext text={s.t} size={190} face={B.dark} side={B.accent} depth={40} layers={8} ls={0.01} />
            </Obj>
            <Obj x={0} y={575} z={40} s={reveal}>
              <Ext text={s.s} size={62} font={FONT.serif} weight={500} italic face={B.dark} />
            </Obj>
            {i === 2 ? (
              <>
                {[0, 1, 2, 3, 4].map((b) => {
                  const g = tw(t, METHOD_T0 + 4.5 + b * 0.12, 0.9, (x) => E.back(x, 1.6));
                  const h = 120 + b * 90;
                  const hh = Math.max(1, h * g);
                  return <Box3D key={b} x={-300 + b * 150} y={-hh / 2 - 360} z={-200} w={90} h={hh} d={90} front={b === 4 ? B.accent : B.dark} side={B.navy} />;
                })}
                <Burst t0={METHOD_T0 + 5.0} x={0} y={0} z={120} n={50} color={B.accent} power={900} seed={9} />
              </>
            ) : null}
          </Obj>
        );
      })}
    </Obj>
  );
};
