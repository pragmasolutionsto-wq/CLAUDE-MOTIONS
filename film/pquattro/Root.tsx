import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/anton/400.css';
import '@fontsource/archivo-black/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import {FPS} from '../engine/core';
import {Movie, DURATION} from './Movie';

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all([
      document.fonts.load("400 100px 'Anton'"),
      document.fonts.load("400 100px 'Archivo Black'"),
      document.fonts.load("italic 500 100px 'Cormorant Garamond'"),
      document.fonts.load("italic 600 100px 'Cormorant Garamond'"),
      document.fonts.load("500 100px 'Manrope'"),
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

export const Root: React.FC = () => <Composition id="Pquattro" component={Wrapped} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1920} height={1080} />;
