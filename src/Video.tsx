import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Background, Scene} from './components';
import {About, Hero, Intro, Method} from './scenes/Opening';
import {AppScene, Ihht, Tech} from './scenes/Science';
import {Academy, Home, Labs, Outro, Path} from './scenes/Closing';
import {C, OVERLAP, SANS, SCENES, TOTAL} from './theme';

const LIST: [keyof typeof SCENES, React.FC][] = [
  ['intro', Intro],
  ['hero', Hero],
  ['about', About],
  ['method', Method],
  ['app', AppScene],
  ['tech', Tech],
  ['ihht', Ihht],
  ['labs', Labs],
  ['home', Home],
  ['path', Path],
  ['academy', Academy],
  ['outro', Outro],
];

const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [120, 160, TOTAL - 300, TOTAL - 260], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: 54, left: 150, fontFamily: SANS, fontSize: 18, letterSpacing: 8, color: C.ivory, opacity: 0.7}}>
        LONGE<span style={{color: C.gold}}>V</span>ITAS
      </div>
      <div style={{position: 'absolute', top: 54, right: 150, fontFamily: SANS, fontSize: 16, letterSpacing: 5, color: C.mute}}>
        MEDICINA DI PRECISIONE · RIVOLI
      </div>
      <div style={{position: 'absolute', bottom: 50, left: 150, right: 150, height: 2, background: C.faint}}>
        <div style={{width: `${(frame / TOTAL) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.mint}, ${C.gold})`}} />
      </div>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Background />
      {LIST.map(([key, Comp]) => {
        const dur = SCENES[key];
        const start = from;
        from += dur - OVERLAP;
        return (
          <Sequence key={key} from={start} durationInFrames={dur} name={key}>
            <Scene dur={dur}>
              <Comp />
            </Scene>
          </Sequence>
        );
      })}
      <Chrome />
      <Audio
        src={staticFile('music.wav')}
        volume={(f) => interpolate(f, [0, 30, TOTAL - 90, TOTAL], [0, 0.9, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
    </AbsoluteFill>
  );
};
