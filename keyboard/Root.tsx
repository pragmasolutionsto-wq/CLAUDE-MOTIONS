import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/manrope/700.css';
import {Movie} from './Movie';
import {DURATION, FPS, H, W} from './util';

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all([
      document.fonts.load("400 40px 'JetBrains Mono'"),
      document.fonts.load("700 40px 'JetBrains Mono'"),
      document.fonts.load("700 40px 'Manrope'"),
    ]).then(() => {
      setOk(true);
      continueRender(h);
    });
  }, [h]);
  return ok ? <>{children}</> : null;
};

const Wrapped: React.FC = () => (
  <FontGate>
    <Movie />
  </FontGate>
);

export const Root: React.FC = () => (
  <Composition id="Keyboard" component={Wrapped} durationInFrames={DURATION * FPS} fps={FPS} width={W} height={H} />
);
