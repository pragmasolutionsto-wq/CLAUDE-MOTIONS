import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/cormorant-garamond/700-italic.css';
import {Movie} from './Movie';
import {DURATION, FPS, H, W} from './util';

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all(["700 100px 'Montserrat'", "800 100px 'Montserrat'", "900 100px 'Montserrat'", "italic 700 100px 'Cormorant Garamond'"].map((f) => document.fonts.load(f))).then(() => {
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
  <Composition id="Buoni" component={Wrapped} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={W} height={H} />
);
