import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/cormorant-garamond/700-italic.css';
import {Movie} from './Movie';
import {Bed3D, Oximeter3D} from './three';
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

// letto 3D renderizzato una volta come immagine trasparente (nella scena del respiro il canvas 3D blocca il render)
const BedStill: React.FC = () => <Bed3D lt={3} w={W} h={760} />;
const OxiStill: React.FC = () => <Oximeter3D lt={2} w={W} h={640} />;

export const Root: React.FC = () => (
  <>
    <Composition id="Satur" component={Wrapped} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="BedStill" component={BedStill} durationInFrames={1} fps={FPS} width={W} height={760} />
    <Composition id="OxiStill" component={OxiStill} durationInFrames={1} fps={FPS} width={W} height={640} />
  </>
);
