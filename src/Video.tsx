import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, OV, SCENES, STARTS, TOTAL} from './theme';
import {ease, prog} from './kit';
import {About, Headline, Logo, Outro, Triad, TreatTitle} from './scenes1';
import {Cta, H2, Ihht, Iv, Montage, Pbm} from './scenes2';

const COMP: Record<string, React.FC> = {
  logo: Logo,
  headline: Headline,
  triad: Triad,
  about: About,
  treatTitle: TreatTitle,
  ihht: Ihht,
  h2: H2,
  iv: Iv,
  pbm: Pbm,
  montage: Montage,
  cta: Cta,
  outro: Outro,
};

/* La scena entrante si rivela sopra la precedente durante OV frame */
const Reveal: React.FC<{type: string; cx?: number; cy?: number; children: React.ReactNode}> = ({type, cx = 960, cy = 540, children}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, OV], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const style: React.CSSProperties = {};
  if (type === 'circle') style.clipPath = p >= 1 ? 'none' : `circle(${p * 1700}px at ${cx}px ${cy}px)`;
  if (type === 'slide') style.transform = p >= 1 ? 'none' : `translateX(${(1 - p) * 100}%)`;
  if (type === 'diag') {
    const X = p * (1920 + 420);
    style.clipPath = p >= 1 ? 'none' : `polygon(0 0, ${X}px 0, ${X - 420}px 1080px, 0 1080px)`;
  }
  if (type === 'bars') style.opacity = f < 7 ? 0 : 1;
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

/* Elementi grafici di transizione disegnati sopra le scene */
const TransitionFx: React.FC<{type: string; cx?: number; cy?: number}> = ({type, cx = 960, cy = 540}) => {
  const f = useCurrentFrame();
  if (type === 'circle') {
    const p = prog(f, 0, OV);
    const r = p * 1700;
    return (
      <div style={{position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `10px solid ${C.champ}`, opacity: 1 - p}} />
    );
  }
  if (type === 'bars') {
    return (
      <AbsoluteFill>
        {new Array(6).fill(0).map((_, i) => {
          const cover = prog(f - i, 0, 8, Easing.out(Easing.cubic));
          const uncover = prog(f - i, 8, 7, Easing.in(Easing.cubic));
          const down = f - i < 8;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: i * 320,
                top: 0,
                width: 321,
                height: 1080,
                background: i % 2 ? C.champ : C.ivory,
                transformOrigin: down ? 'top' : 'bottom',
                transform: `scaleY(${down ? cover : 1 - uncover})`,
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  }
  if (type === 'diag') {
    const p = prog(f, 0, OV);
    const X = p * (1920 + 420);
    return <div style={{position: 'absolute', left: X - 420 - 36, top: -200, width: 40, height: 1500, background: C.champ, transform: 'skewX(-21deg)', transformOrigin: 'top left', opacity: p >= 1 ? 0 : 1}} />;
  }
  if (type === 'slide') {
    const p = prog(f, 0, OV);
    return <div style={{position: 'absolute', left: (1 - p) * 1920 - 30, top: 0, width: 30, height: 1080, background: C.champ, opacity: p >= 1 ? 0 : 1}} />;
  }
  return null;
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: C.navy}}>
    {SCENES.map((s, i) => {
      const Comp = COMP[s.key];
      return (
        <Sequence key={s.key} from={STARTS[i]} durationInFrames={s.dur} name={s.key}>
          <Reveal type={s.trans} cx={s.cx} cy={s.cy}>
            <Comp />
          </Reveal>
        </Sequence>
      );
    })}
    {SCENES.map((s, i) =>
      i > 0 && s.trans !== 'none' ? (
        <Sequence key={'fx' + s.key} from={STARTS[i]} durationInFrames={OV} name={'fx-' + s.key}>
          <TransitionFx type={s.trans} cx={s.cx} cy={s.cy} />
        </Sequence>
      ) : null,
    )}
    <Audio src={staticFile('music.wav')} volume={(f) => interpolate(f, [0, 10, TOTAL - 45, TOTAL], [0, 0.95, 0.95, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
  </AbsoluteFill>
);
