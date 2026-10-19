import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/anton/400.css';
import '@fontsource/montserrat/600-italic.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import {Movie} from './Movie';
import {DURATION, FPS, H, W} from './util';

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all(["400 100px 'Anton'", "italic 600 100px 'Montserrat'", "700 100px 'Montserrat'", "800 100px 'Montserrat'"].map((f) => document.fonts.load(f))).then(() => {
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
  <Composition id="AfricaMP" component={Wrapped} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={W} height={H} />
);
