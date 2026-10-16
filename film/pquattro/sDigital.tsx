import React from 'react';
import {Dust, E, Ext, FONT, Letters3D, Obj, Plane, Ring, clamp, lerp, rnd, tw, useT, type CamKey} from '../engine/core';
import {Burst, SetBg} from '../engine/fx';
import {B} from './brand';
import {OX, SETS} from './timeline';

const ox = OX(SETS.digital.k);
export const DG_T0 = 35.4;
const CLICK = DG_T0 + 2.5;

export const digitalCam = (): CamKey[] => [
  {t: 35.5, p: [ox - 40, 0, 2150], r: [0, 8, -1], hold: true},
  {t: DG_T0 + 1.6, p: [ox + 180, -10, 2000], r: [0, 3, 0]},
  {t: DG_T0 + 3.2, p: [ox + 330, -20, 1800], r: [0, -5, 1.2]},
  {t: 39.6, p: [ox + 420, -50, 1650], r: [0, -8, 1.6]},
];

const Heart: React.FC<{i: number}> = ({i}) => {
  const t = useT();
  const a = t - CLICK - i * 0.07;
  if (a < 0 || a > 2.2) return null;
  const k = a / 2.2;
  const x = 120 + (rnd(i, 1) - 0.5) * 700 + Math.sin(a * 3 + i) * 40;
  const y = 120 - a * (260 + rnd(i, 2) * 220);
  const z = 80 + rnd(i, 3) * 260;
  const s = 0.7 + rnd(i, 4) * 1.1;
  return (
    <Obj x={x} y={y} z={z} s={s * (k < 0.1 ? k * 10 : 1)}>
      <div style={{position: 'absolute', left: -40, top: -50, width: 80, height: 100, fontSize: 90, textAlign: 'center', lineHeight: '100px', color: i % 2 ? B.accent : B.accent2, opacity: 1 - clamp((k - 0.6) / 0.4), fontFamily: 'sans-serif'}}>♥</div>
    </Obj>
  );
};

const Chip: React.FC<{x: number; y: number; z: number; t0: number; text: string; color: string; ink: string}> = ({x, y, z, t0, text, color, ink}) => {
  const t = useT();
  const k = tw(t, t0, 0.8, (v) => E.back(v, 2.4));
  const bob = Math.sin(t * 1.8 + x) * 12;
  return (
    <Obj x={x} y={y + bob} z={z} s={k}>
      <div style={{position: 'absolute', left: -140, top: -34, width: 280, height: 68, borderRadius: 40, background: color, color: ink, fontFamily: 'Manrope', fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 1}}>{text}</div>
    </Obj>
  );
};

export const SDigital: React.FC = () => {
  const t = useT();
  const w = t - DG_T0;
  const tilt = Math.sin(w * 0.9) * 8 - 6;
  const cta = t > CLICK ? B.dark : B.accent;
  // cursore
  const cp = tw(t, DG_T0 + 1.3, 1.2, E.inOut3);
  const cx = lerp(-520, 20, cp) + Math.sin(cp * Math.PI) * -90;
  const cy = lerp(560, 70, cp) + Math.sin(cp * Math.PI) * 60;
  const press = t > CLICK && t < CLICK + 0.15 ? 0.82 : 1;
  const feed = (t * 90) % 480;
  return (
    <Obj x={ox}>
      <SetBg color={B.dark} ox={0} />
      <Dust n={110} w={5200} h={2600} z0={-1500} z1={1200} color={B.accent2} size={7} />

      <Obj x={-480} y={-440} z={-700}>
        <Letters3D
          text="DIGITAL"
          size={400}
          face={B.ivory}
          side={B.accent}
          depth={110}
          layers={13}
          ls={0.02}
          anim={(i) => {
            const a = DG_T0 + 0.05 + i * 0.07;
            const k = tw(t, a, 0.9, (x) => E.back(x, 2.1));
            return {rx: (1 - k) * -100, y: (1 - k) * 420, z: (1 - k) * 800, o: tw(t, a, 0.1, (x) => x)};
          }}
        />
      </Obj>

      {/* finestra browser */}
      <Obj x={60} y={120} z={0} ry={tilt} rx={-3}>
        <Plane w={1000} h={640} style={{background: B.ivory, borderRadius: 30, boxShadow: '0 60px 120px rgba(0,0,0,0.5)', overflow: 'hidden', transform: `scale(${tw(t, DG_T0 + 0.3, 0.8, (v) => E.back(v, 1.8))})`}}>
          <div style={{height: 66, background: B.dark, display: 'flex', alignItems: 'center', padding: '0 26px', gap: 12}}>
            {[B.accent, B.accent2, B.ivory].map((c, i) => (
              <div key={i} style={{width: 14, height: 14, borderRadius: 14, background: c}} />
            ))}
            <div style={{marginLeft: 24, flex: 1, height: 34, borderRadius: 20, background: 'rgba(255,255,255,0.12)', color: B.ivory, fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', paddingLeft: 18}}>tuafarmacia.it</div>
          </div>
          <div style={{position: 'absolute', left: 40, top: 100, width: 920 * tw(t, DG_T0 + 0.9, 0.8, E.out5), height: 230, borderRadius: 22, background: B.accent, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 36, top: 36, width: 380, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.9)'}} />
            <div style={{position: 'absolute', left: 36, top: 82, width: 300, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.55)'}} />
            <div style={{position: 'absolute', left: 36, top: 112, width: 240, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.55)'}} />
            <div style={{position: 'absolute', left: 36, top: 156, width: 210, height: 52, borderRadius: 30, background: cta, color: B.ivory, fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 2, transform: `scale(${press})`}}>PRENOTA</div>
          </div>
          {[0, 1, 2].map((i) => {
            const k = tw(t, DG_T0 + 1.2 + i * 0.15, 0.7, E.out5);
            return (
              <div key={i} style={{position: 'absolute', left: 40 + i * 316, top: 360 + (1 - k) * 80, width: 288, height: 220, borderRadius: 22, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', opacity: k, overflow: 'hidden'}}>
                <div style={{height: 100, background: [B.accent2, B.navy, B.dark][i]}} />
                <div style={{margin: '22px 22px 0', height: 18, width: 180, borderRadius: 9, background: B.dark, opacity: 0.85}} />
                <div style={{margin: '14px 22px 0', height: 12, width: 130, borderRadius: 6, background: B.dark, opacity: 0.35}} />
              </div>
            );
          })}
        </Plane>
      </Obj>

      {/* smartphone con feed */}
      <Obj x={930} y={130} z={240} ry={-20 + Math.sin(w * 0.8) * 6}>
        <Plane w={340} h={700} style={{background: B.dark, borderRadius: 54, border: `8px solid ${B.ivory}`, overflow: 'hidden', transform: `scale(${tw(t, DG_T0 + 0.7, 0.8, (v) => E.back(v, 2))})`, boxSizing: 'border-box'}}>
          <div style={{position: 'absolute', left: 110, top: 14, width: 100, height: 22, borderRadius: 12, background: '#000'}} />
          <div style={{position: 'absolute', left: 0, top: 70 - feed, width: 340}}>
            {new Array(5).fill(0).map((_, i) => (
              <div key={i} style={{margin: '0 20px 22px', height: 260, borderRadius: 24, background: [B.accent, B.navy, B.ivory, B.accent2, B.navy][i % 5], position: 'relative'}}>
                <div style={{position: 'absolute', left: 18, bottom: 54, width: 160, height: 16, borderRadius: 8, background: i === 2 ? B.dark : 'rgba(255,255,255,0.85)'}} />
                <div style={{position: 'absolute', left: 18, bottom: 26, width: 100, height: 12, borderRadius: 6, background: i === 2 ? B.dark : 'rgba(255,255,255,0.5)', opacity: 0.7}} />
                <div style={{position: 'absolute', right: 18, top: 16, fontSize: 38, color: i === 2 ? B.accent : B.ivory, fontFamily: 'sans-serif'}}>♥</div>
              </div>
            ))}
          </div>
        </Plane>
      </Obj>

      <Chip x={-420} y={-60} z={330} t0={DG_T0 + 1.8} text="Nuovo follower" color={B.ivory} ink={B.dark} />
      <Chip x={430} y={-330} z={380} t0={DG_T0 + 2.0} text="Mi piace · Condividi" color={B.accent2} ink={B.dark} />
      <Chip x={520} y={440} z={300} t0={DG_T0 + 2.2} text="Nuova prenotazione" color={B.accent} ink={B.ivory} />

      {/* cursore */}
      <Obj x={cx - 60} y={cy} z={120} s={press}>
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
          <path d="M0,0 L0,46 L12,35 L20,54 L28,50 L20,32 L36,32 Z" fill={B.ivory} stroke={B.dark} strokeWidth={4} strokeLinejoin="round" />
        </svg>
      </Obj>
      <Obj x={-40} y={95} z={60}>
        <Ring r={30 + tw(t, CLICK, 0.9, E.expoOut) * 260} color={B.accent2} bw={6} opacity={t > CLICK ? 1 - tw(t, CLICK, 0.9, E.out3) : 0} />
      </Obj>
      <Burst t0={CLICK} x={-40} y={95} z={200} n={30} color={B.accent2} power={800} seed={11} />
      {new Array(14).fill(0).map((_, i) => (
        <Heart key={i} i={i} />
      ))}

      <Obj x={-560} y={-250} z={-300}>
        <Ext text="Pagine social e sito internet, creati e gestiti per te." size={50} font={FONT.serif} weight={500} italic face={B.ivory} opacity={tw(t, DG_T0 + 1.6, 0.6, (v) => v)} />
      </Obj>
    </Obj>
  );
};
