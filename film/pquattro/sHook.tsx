import React from 'react';
import {Dust, E, Ext, FONT, Letters3D, Obj, Plane, Ring, Thread, tw, useT} from '../engine/core';
import {SetBg} from '../engine/fx';
import {B} from './brand';
import {OX, SETS} from './timeline';

const UNDERLINE = 'M -820 400 C -300 430 300 370 900 410';

export const SHook: React.FC = () => {
  const t = useT();
  const ox = OX(SETS.hook.k);
  const T0 = SETS.hook.a - 0.05;
  const ruler = (t * 260) % 120;
  return (
    <Obj x={ox}>
      <SetBg color={B.accent} ox={0} />
      <Dust n={90} w={4200} h={2200} z0={-1400} z1={1200} color="#ffffff" size={8} opacity={0.5} />

      {/* eco in profondità: parole outline giganti */}
      <Obj x={-300} y={-120} z={-1500}>
        <Ext text="MARKETING" size={900} face={B.accent} stroke={B.ivory} opacity={0.22} />
      </Obj>

      {/* metro da sarto: pavimento 3D */}
      <Obj y={600} z={-1000} rx={90}>
        <Plane w={9000} h={1900} style={{background: B.dark, opacity: tw(t, T0 + 0.6, 0.8, E.out3)}}>
          <div style={{position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(90deg, ${B.accent} 0 4px, transparent 4px 60px)`, backgroundPosition: `${-ruler * 1}px 0`, maskImage: 'linear-gradient(180deg, black 0 22%, transparent 22%)', WebkitMaskImage: 'linear-gradient(180deg, black 0 22%, transparent 22%)'}} />
          <div style={{position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(90deg, ${B.ivory} 0 6px, transparent 6px 300px)`, backgroundPosition: `${-ruler * 2.5}px 0`, maskImage: 'linear-gradient(180deg, black 0 40%, transparent 40%)', WebkitMaskImage: 'linear-gradient(180deg, black 0 40%, transparent 40%)'}} />
        </Plane>
      </Obj>

      {/* MARKETING */}
      <Obj y={-210} z={0}>
        <Letters3D
          text="MARKETING"
          size={450}
          face={B.ivory}
          side={B.dark}
          depth={100}
          layers={14}
          ls={0.01}
          anim={(i) => {
            const a = T0 + i * 0.05;
            const k = tw(t, a, 0.95, (x) => E.back(x, 2.2));
            return {rx: (1 - k) * -110, y: (1 - k) * -520, z: (1 - k) * 700, o: tw(t, a, 0.12, (x) => x)};
          }}
        />
      </Obj>

      {/* sartoriale */}
      <Obj x={120} y={170} z={-200} rz={-3}>
        <Ext text="sartoriale" size={520} font={FONT.serif} weight={600} italic face={B.dark} side={B.navy} depth={60} layers={10} opacity={tw(t, T0 + 1.0, 0.3, (x) => x)} />
      </Obj>
      <Obj z={-200}>
        <Thread d={UNDERLINE} p={tw(t, T0 + 1.6, 1.2, E.inOut3)} color={B.ivory} w={9} head={B.ivory} headSize={20} />
      </Obj>

      {/* per la tua farmacia: più in profondità, da raggiungere con la camera */}
      <Obj x={1000} y={20} z={-1100} ry={-26}>
        <Letters3D
          text="PER LA TUA FARMACIA."
          size={250}
          face={B.ivory}
          side={B.dark}
          depth={50}
          layers={10}
          ls={0.02}
          anim={(i, n) => {
            const a = T0 + 3.4 + i * 0.035;
            const k = tw(t, a, 0.7, E.expoOut);
            return {y: (1 - k) * 260, z: (1 - k) * -300, o: tw(t, a, 0.15, (x) => x)};
          }}
        />
      </Obj>
      <Obj x={1000} y={-380} z={-1100} ry={-26}>
        <Ext text="— PQUATTRO · MARTINA FRANCA —" size={34} font={FONT.sans} weight={800} ls={0.4} face={B.dark} opacity={tw(t, T0 + 4.2, 0.5, (x) => x)} />
      </Obj>

      <Obj z={-900}>
        <Ring r={760} color={B.ivory} bw={3} opacity={0.35} dashed />
      </Obj>
    </Obj>
  );
};
