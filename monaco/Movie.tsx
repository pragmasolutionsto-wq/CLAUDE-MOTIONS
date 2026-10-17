import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, DURATION_S, FPS, SCENES, Scene, ip, lerp, settle, useT} from './kit';
import {EcgScene, HeartScene, HolterScene, SceneProps} from './scenesA';
import {AslScene, DocsScene, EndScene, PressureScene} from './scenesB';

export {FPS};
export const DURATION = Math.round(DURATION_S * FPS) / FPS;

const VIEWS: Record<string, React.FC<SceneProps>> = {
  heart: HeartScene,
  ecg: EcgScene,
  holter: HolterScene,
  pressure: PressureScene,
  asl: AslScene,
  docs: DocsScene,
  end: EndScene,
};

const X = 0.25; // dissolvenza incrociata di 0,5 s centrata sul taglio

const Layer: React.FC<{s: Scene; i: number; t: number}> = ({s, i, t}) => {
  const first = i === 0;
  const last = i === SCENES.length - 1;
  if (t < s.start - X || t > s.end + X) return null;
  const fin = first ? 1 : ip(t, s.start - X, s.start + X);
  const fout = last ? 1 : 1 - ip(t, s.end - X, s.end + X);
  const scale = lerp(1.035, 1, fin) * lerp(1.045, 1, fout); // sempre ≥ 1: nessun bordo scoperto
  const View = VIEWS[s.id];
  return (
    <AbsoluteFill style={{opacity: fin * fout, transform: `scale(${scale})`}}>
      <View lt={t - s.start} s={s} />
    </AbsoluteFill>
  );
};

// bokeh morbidi sullo sfondo, a velocità diverse (parallasse)
const BLOBS = [
  {x: 180, y: 300, r: 420, c: 'rgba(61,170,167,0.16)', ax: 60, ay: 40, sp: 0.07, ph: 0},
  {x: 900, y: 520, r: 360, c: 'rgba(232,180,150,0.28)', ax: 40, ay: 70, sp: 0.05, ph: 1},
  {x: 820, y: 1500, r: 480, c: 'rgba(19,131,181,0.12)', ax: 70, ay: 50, sp: 0.06, ph: 2},
  {x: 200, y: 1650, r: 380, c: 'rgba(240,200,170,0.30)', ax: 50, ay: 40, sp: 0.08, ph: 3},
  {x: 560, y: 980, r: 560, c: 'rgba(255,255,255,0.45)', ax: 30, ay: 30, sp: 0.04, ph: 4},
];

const Background: React.FC<{t: number}> = ({t}) => {
  const bt = settle(t);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.ivory} 0%, #F1E6DA 45%, ${C.aqua} 100%)`}}>
      {BLOBS.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x + b.ax * Math.sin(bt * b.sp * 2 * Math.PI + b.ph) - b.r,
            top: b.y + b.ay * Math.cos(bt * b.sp * 2 * Math.PI + b.ph * 1.3) - b.r,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.c} 0%, rgba(255,255,255,0) 70%)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

export const Movie: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{backgroundColor: C.ivory}}>
      <Background t={t} />
      {SCENES.map((s, i) => (
        <Layer key={s.id} s={s} i={i} t={t} />
      ))}
      {/* vignettatura leggera */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(40,45,55,0.16) 100%)'}} />
    </AbsoluteFill>
  );
};
