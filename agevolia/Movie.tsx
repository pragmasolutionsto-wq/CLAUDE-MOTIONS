import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Backdrop, Streaks, Vignette} from './kit';
import {S1, S2, S3} from './scenes1';
import {S4, S5, S6, S7, S8} from './scenes2';
import {eI3, eO3, FPS, prog, SC} from './util';

const OV = 0.4; // sovrapposizione tra scene: l'uscente vola verso camera, l'entrante arriva da dietro

const Shot: React.FC<{t: number; i: number; last?: boolean; children: (lt: number, dur: number) => React.ReactNode}> = ({t, i, last, children}) => {
  const a = SC[i], b = SC[i + 1], dur = b - a, lt = t - a;
  if (t < a || t > b + (last ? 0 : OV)) return null;
  const inn = i === 0 ? 1 : eO3(prog(lt, 0, OV));
  const out = last ? 0 : eI3(prog(lt, dur, dur + OV));
  return (
    <AbsoluteFill style={{opacity: inn * (1 - out), transform: `scale(${(0.94 + 0.06 * inn) * (1 + 0.18 * out)})`, filter: out > 0 ? `blur(${out * 12}px)` : undefined}}>
      {children(lt, dur)}
    </AbsoluteFill>
  );
};

const SCENES: ((lt: number, dur: number) => React.ReactNode)[] = [
  (lt) => <S1 lt={lt} />,
  (lt) => <S2 lt={lt} />,
  (lt) => <S3 lt={lt} />,
  (lt) => <S4 lt={lt} />,
  (lt) => <S5 lt={lt} />,
  (lt) => <S6 lt={lt} />,
  (lt) => <S7 lt={lt} />,
  (lt, dur) => <S8 lt={lt} dur={dur} />,
];

export const Movie: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const fadeIn = prog(t, 0, 0.5);
  const fadeOut = 1 - prog(t, SC[8] - 0.7, SC[8]);
  return (
    <AbsoluteFill style={{background: '#040719'}}>
      <AbsoluteFill style={{opacity: fadeIn * fadeOut}}>
        <Backdrop t={t} floor={t < SC[1] ? prog(t, 0.5, 2.5) : 1} />
      </AbsoluteFill>
      {SCENES.map((f, i) => (
        <Shot key={i} t={t} i={i} last={i === SCENES.length - 1}>
          {f}
        </Shot>
      ))}
      {SC.slice(1, -1).map((s, i) => (t > s - 0.15 && t < s + 0.5 ? <Streaks key={i} lt={t - s + 0.1} seed={i + 3} /> : null))}
      <Vignette />
    </AbsoluteFill>
  );
};
