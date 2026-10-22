import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/raleway/300.css';
import '@fontsource/raleway/400.css';
import '@fontsource/raleway/500.css';
import '@fontsource/raleway/600.css';
import '@fontsource/raleway/700.css';
import '@fontsource/raleway/400-italic.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import {Movie} from './Movie';
import {DURATION, FPS, H, W} from './util';

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all([
      ...[300, 400, 500, 600, 700].map((w) => document.fonts.load(`${w} 100px 'Raleway'`)),
      document.fonts.load("italic 400 100px 'Raleway'"),
      document.fonts.load("400 100px 'JetBrains Mono'"),
      document.fonts.load("500 100px 'JetBrains Mono'"),
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
  <Composition id="Agevolia" component={Wrapped} durationInFrames={DURATION * FPS} fps={FPS} width={W} height={H} />
);
