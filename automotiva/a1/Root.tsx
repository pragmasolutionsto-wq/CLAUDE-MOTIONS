import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource-variable/archivo/standard.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-sans/800.css';
import '@fontsource/dm-sans/400-italic.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import {Movie} from './Movie';
import T from './timeline.json';

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all([
      document.fonts.load("900 100px 'Archivo Variable'"),
      document.fonts.load("800 100px 'DM Sans'"),
      document.fonts.load("700 100px 'DM Sans'"),
      document.fonts.load("italic 400 100px 'DM Sans'"),
      document.fonts.load("600 100px 'IBM Plex Mono'"),
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
  <Composition id="A1" component={Wrapped} durationInFrames={Math.round(T.dur * T.fps)} fps={T.fps} width={1080} height={1920} />
);
