import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/anton/400.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import {Movie} from './Movie';
import {DURATION_F, FPS, H, W} from './util';

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all([
      document.fonts.load("400 100px 'Anton'"),
      document.fonts.load("600 100px 'Manrope'"),
      document.fonts.load("700 100px 'Manrope'"),
      document.fonts.load("800 100px 'Manrope'"),
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
  <Composition id="Automotiva" component={Wrapped} durationInFrames={DURATION_F} fps={FPS} width={W} height={H} />
);
