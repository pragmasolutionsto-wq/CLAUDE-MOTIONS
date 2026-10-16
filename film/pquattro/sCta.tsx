import React from 'react';
import {Dust, E, Ext, FONT, Letters3D, Obj, Ring, Thread, clamp, tw, useT, type CamKey} from '../engine/core';
import {Burst, SetBg} from '../engine/fx';
import {B} from './brand';
import {OX, SETS} from './timeline';

const ox = OX(SETS.cta.k);
export const CT_T0 = 55.05;
const BOOM = 58.0;

export const ctaCam = (): CamKey[] => [
  {t: 55.0, p: [ox - 160, -30, 2300], r: [0, 5, -1.5], hold: true},
  {t: CT_T0 + 2.0, p: [ox - 40, -20, 1900], r: [0, 1, -0.5]},
  {t: BOOM - 0.1, p: [ox + 20, -10, 1650], r: [0, -1, 0.5]},
  {t: BOOM + 0.5, p: [ox, 0, 600], r: [0, 0, 0]},
  {t: 60.5, p: [ox, 0, 1700], r: [0, 0, 0]},
];

const LINES = [
  {t: 'VIA TARANTO 89A · MARTINA FRANCA (TA)', dx: -1, at: 1.5},
  {t: '+39 328 716 4074', dx: 1, at: 1.7},
  {t: 'INFO@PQUATTRO.IT', dx: -1, at: 1.9},
  {t: 'LUN–VEN · 9:00–18:00', dx: 1, at: 2.1},
];

export const SCta: React.FC = () => {
  const t = useT();
  const boom = tw(t, BOOM, 0.7, E.in3);
  const logoIn = (i: number) => tw(t, BOOM + 0.45 + i * 0.05, 1.0, E.expoOut);
  return (
    <Obj x={ox}>
      <SetBg color={B.dark} ox={0} />
      <Dust n={130} w={5200} h={2800} z0={-1500} z1={1300} color={B.accent2} size={7} />

      <Obj y={-290} z={0}>
        <Letters3D
          text="PARLIAMONE."
          size={400}
          face={B.ivory}
          side={B.accent}
          depth={120}
          layers={14}
          ls={0.02}
          anim={(i, n) => {
            const a = CT_T0 + 0.1 + i * 0.06;
            const k = tw(t, a, 0.95, (x) => E.back(x, 2.2));
            return {rx: (1 - k) * 100 + boom * -60, y: (1 - k) * -520 - boom * 200, z: (1 - k) * 800 + boom * 2600, rz: boom * (i % 2 ? 30 : -30), x: boom * (i - n / 2) * 60, o: tw(t, a, 0.1, (x) => x) * (1 - clamp(boom * 1.2 - 0.1))};
          }}
        />
      </Obj>

      <Obj y={-60} z={0}>
        <Thread d="M -820 0 C -300 30 300 -30 820 10" p={tw(t, CT_T0 + 1.0, 1.1, E.inOut3)} color={B.accent} w={9} head={B.accent2} headSize={20} />
      </Obj>

      {LINES.map((l, i) => {
        const k = tw(t, CT_T0 + l.at, 0.7, E.expoOut);
        return (
          <Obj key={i} x={l.dx * (1 - k) * 700 + (boom * l.dx * 900)} y={60 + i * 96} z={(1 - k) * 300 + boom * 2000}>
            <Ext text={l.t} size={56} font={FONT.sans} weight={800} ls={0.08} face={i === 1 ? B.accent2 : B.ivory} opacity={k * (1 - clamp(boom * 1.4 - 0.1))} />
          </Obj>
        );
      })}

      <Obj y={470} z={0} s={tw(t, CT_T0 + 2.5, 0.7, (x) => E.back(x, 2.4)) * (1 + 0.03 * Math.sin(t * 9)) * (1 - boom) * 1.25}>
        <div style={{position: 'absolute', left: -330, top: -56, width: 660, height: 112, borderRadius: 60, background: B.accent, color: B.ivory, fontFamily: 'Manrope', fontWeight: 800, fontSize: 46, letterSpacing: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>WWW.PQUATTRO.IT</div>
      </Obj>

      {/* chiusura: il logo si ricompone */}
      <Letters3D
        text="PQUATTRO"
        size={340}
        face={B.ivory}
        side={B.accent}
        depth={64}
        layers={12}
        ls={0.02}
        anim={(i) => {
          const k = logoIn(i);
          return {z: (1 - k) * -2200, y: (1 - k) * (i % 2 ? 300 : -300), ry: (1 - k) * (i % 2 ? -70 : 70), o: tw(t, BOOM + 0.45 + i * 0.05, 0.15, (x) => x)};
        }}
      />
      <Obj y={235}>
        <Ext text={B.tagline} size={32} font={FONT.sans} weight={800} ls={0.52} face={B.ivory} opacity={tw(t, BOOM + 1.3, 0.6, (x) => x)} />
      </Obj>
      <Obj z={-40}>
        <Ring r={520 + tw(t, BOOM + 0.7, 1.8, E.expoOut) * 700} color={B.accent} bw={6} opacity={t > BOOM + 0.7 ? 1 - tw(t, BOOM + 0.7, 1.8, E.out3) : 0} />
      </Obj>
      <Burst t0={BOOM + 0.1} z={200} n={60} color={B.accent2} power={1400} size={9} seed={51} />
    </Obj>
  );
};
