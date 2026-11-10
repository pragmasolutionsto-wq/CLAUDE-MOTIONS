import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/playfair-display/500-italic.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import {Movie} from './Movie';
import {DURATION, FPS} from './util';

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all([
      document.fonts.load("400 100px 'Playfair Display'"),
      document.fonts.load("500 100px 'Playfair Display'"),
      document.fonts.load("italic 400 100px 'Playfair Display'"),
      document.fonts.load("italic 500 100px 'Playfair Display'"),
      document.fonts.load("400 30px 'Inter'"),
      document.fonts.load("500 30px 'Inter'"),
      document.fonts.load("600 30px 'Inter'"),
    ]).then(() => {
      setOk(true);
      continueRender(h);
    });
  }, [h]);
  return ok ? <>{children}</> : null;
};

const H: React.FC = () => (<FontGate><Movie width={1920} height={1080} /></FontGate>);
const V: React.FC = () => (<FontGate><Movie width={1080} height={1920} /></FontGate>);

export const Root: React.FC = () => (
  <>
    <Composition id="DermaH" component={H} durationInFrames={DURATION * FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="DermaV" component={V} durationInFrames={DURATION * FPS} fps={FPS} width={1080} height={1920} />
  </>
);
