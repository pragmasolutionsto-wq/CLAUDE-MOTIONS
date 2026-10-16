import React from 'react';
import {Dust, E, Ext, FONT, Letters3D, Obj, Plane, Ring, clamp, rnd, tw, useT, type CamKey} from '../engine/core';
import {Burst, Confetti, SetBg} from '../engine/fx';
import {B} from './brand';
import {OX, SETS} from './timeline';

const ox = OX(SETS.events.k);
export const EV_T0 = 40.05;
const FLIP = EV_T0 + 1.0;

export const eventsCam = (): CamKey[] => [
  {t: EV_T0 - 0.05, p: [ox + 80, -30, 2000], r: [0, 4, -1.5], cut: true},
  {t: EV_T0 + 1.8, p: [ox + 220, -20, 1800], r: [0, -2, 1]},
  {t: 43.5, p: [ox + 380, 30, 1500], r: [0, -9, 2], hold: true},
];

const Avatar: React.FC<{i: number; n: number}> = ({i, n}) => {
  const t = useT();
  const a0 = EV_T0 + 1.5 + i * 0.07;
  const k = tw(t, a0, 0.7, (v) => E.back(v, 2.6));
  const ang = (i / n) * Math.PI * 2 + t * 0.35;
  const R = 470;
  const x = Math.cos(ang) * R;
  const y = Math.sin(ang) * R * 0.78;
  const z = Math.sin(ang) * 120;
  const c = [B.ivory, B.dark, B.navy, B.accent2][i % 4];
  const body = [B.dark, B.ivory, B.accent2, B.navy][i % 4];
  return (
    <Obj x={x} y={y} z={z} s={k}>
      <div style={{position: 'absolute', left: -34, top: -62, width: 68, height: 68, borderRadius: '50%', background: c}} />
      <div style={{position: 'absolute', left: -52, top: 10, width: 104, height: 52, borderRadius: '52px 52px 0 0', background: body}} />
    </Obj>
  );
};

export const SEvents: React.FC = () => {
  const t = useT();
  const flip = tw(t, FLIP, 0.9, E.inOut5);
  return (
    <Obj x={ox}>
      <SetBg color={B.accent} ox={0} />
      <Dust n={90} w={5200} h={2600} z0={-1500} z1={1200} color="#ffffff" size={8} opacity={0.5} />

      <Obj x={-380} y={-250} z={-300}>
        <Letters3D
          text="EVENTI"
          size={620}
          face={B.ivory}
          side={B.dark}
          depth={130}
          layers={14}
          ls={0.02}
          anim={(i) => {
            const a = EV_T0 + i * 0.06;
            const k = tw(t, a, 0.9, (x) => E.back(x, 2.2));
            return {rx: (1 - k) * 100, y: (1 - k) * -520, z: (1 - k) * 800, o: tw(t, a, 0.1, (x) => x)};
          }}
        />
      </Obj>
      <Obj x={-380} y={170} z={-300}>
        <Ext text="Eventi in farmacia per fidelizzare e rendere unica la tua offerta." size={52} font={FONT.serif} weight={600} italic face={B.dark} opacity={tw(t, EV_T0 + 2.0, 0.6, (v) => v)} />
      </Obj>

      {/* calendario con pagina che si gira */}
      <Obj x={660} y={70} z={80} rz={-4} ry={-10}>
        <Plane w={520} h={580} style={{background: B.ivory, borderRadius: 34, boxShadow: '0 50px 110px rgba(0,0,0,0.35)', overflow: 'hidden'}}>
          <div style={{height: 120, background: B.dark}} />
          {new Array(20).fill(0).map((_, i) => {
            const k = tw(t, FLIP + 0.5 + i * 0.015, 0.5, E.out5);
            return <div key={i} style={{position: 'absolute', left: 52 + (i % 5) * 88, top: 170 + Math.floor(i / 5) * 92, width: i === 13 ? 70 : 24, height: i === 13 ? 70 : 24, marginLeft: i === 13 ? -22 : 0, marginTop: i === 13 ? -22 : 0, borderRadius: '50%', background: i === 13 ? B.accent : B.dark, opacity: (i === 13 ? 1 : 0.45) * k, transform: `scale(${k})`}} />;
          })}
        </Plane>
        {/* pagina che si gira (hinge in alto) */}
        <div style={{position: 'absolute', left: -260, top: -290, width: 520, height: 580, transformOrigin: '50% 0%', transformStyle: 'preserve-3d', transform: `rotateX(${-flip * 175}deg)`}}>
          <div style={{position: 'absolute', inset: 0, background: B.ivory, borderRadius: 34, backfaceVisibility: 'hidden', overflow: 'hidden'}}>
            <div style={{height: 120, background: B.accent}} />
            <div style={{textAlign: 'center', fontFamily: 'Anton', fontSize: 300, lineHeight: '360px', color: B.dark}}>✦</div>
          </div>
          <div style={{position: 'absolute', inset: 0, background: B.accent2, borderRadius: 34, backfaceVisibility: 'hidden', transform: 'rotateX(180deg)'}} />
        </div>
        <Obj z={40}>
          <Ring r={80 + tw(t, FLIP + 0.9, 1.0, E.expoOut) * 600} color={B.dark} bw={6} opacity={t > FLIP + 0.9 ? 1 - tw(t, FLIP + 0.9, 1.0, E.out3) : 0} />
        </Obj>
        <Confetti t0={FLIP + 0.85} x={0} y={-260} z={120} colors={[B.ivory, B.dark, B.accent2, B.navy]} n={90} />
        <Burst t0={FLIP + 0.85} y={-100} z={150} n={34} color={B.ivory} power={900} seed={21} />
        {new Array(12).fill(0).map((_, i) => (
          <Avatar key={i} i={i} n={12} />
        ))}
      </Obj>
    </Obj>
  );
};
