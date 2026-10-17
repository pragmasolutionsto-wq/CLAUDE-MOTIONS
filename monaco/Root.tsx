import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/playfair-display/600.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import {Movie, DURATION, FPS} from './Movie';

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all([
      document.fonts.load("600 100px 'Playfair Display'"),
      document.fonts.load("300 100px 'Inter'"),
      document.fonts.load("500 100px 'Inter'"),
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
  <Composition id="Monaco" component={Wrapped} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} />
);
