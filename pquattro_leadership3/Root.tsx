import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/700-italic.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/playfair-display/900-italic.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import {Movie} from './Movie';
import {END, FPS, H, W} from './util';

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all(
      ["700 100px 'Playfair Display'", "italic 700 100px 'Playfair Display'", "900 100px 'Playfair Display'", "italic 900 100px 'Playfair Display'", "600 100px 'Montserrat'", "700 100px 'Montserrat'", "800 100px 'Montserrat'"].map((f) =>
        document.fonts.load(f),
      ),
    ).then(() => {
      setOk(true);
      continueRender(h);
    });
  }, [h]);
  return ok ? <>{children}</> : null;
};

const Wrapped: React.FC<{debug?: boolean}> = ({debug}) => (
  <FontGate>
    <Movie debug={debug} />
  </FontGate>
);

export const Root: React.FC = () => (
  <Composition id="Leadership3" component={Wrapped} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} defaultProps={{debug: false}} />
);
