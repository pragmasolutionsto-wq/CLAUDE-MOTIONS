import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import {Movie} from './Movie';
import {DURATION, FPS} from './util';

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all([
      document.fonts.load("400 100px 'Bebas Neue'"),
      document.fonts.load("500 30px 'Montserrat'"),
      document.fonts.load("600 30px 'Montserrat'"),
      document.fonts.load("700 30px 'Montserrat'"),
      document.fonts.load("800 30px 'Montserrat'"),
    ]).then(() => {
      setOk(true);
      continueRender(h);
    });
  }, [h]);
  return ok ? <>{children}</> : null;
};

const H: React.FC = () => (
  <FontGate>
    <Movie vertical={false} width={1920} height={1080} audio />
  </FontGate>
);
const V: React.FC = () => (
  <FontGate>
    <Movie vertical width={1080} height={1920} audio />
  </FontGate>
);

export const Root: React.FC = () => (
  <>
    <Composition id="FarmaciaH" component={H} durationInFrames={DURATION * FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="FarmaciaV" component={V} durationInFrames={DURATION * FPS} fps={FPS} width={1080} height={1920} />
  </>
);
