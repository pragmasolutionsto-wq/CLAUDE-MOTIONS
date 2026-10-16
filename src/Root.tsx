import React from 'react';
import {Composition} from 'remotion';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/manrope/300.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import {Video} from './Video';
import {FPS, TOTAL} from './theme';

export const Root: React.FC = () => (
  <Composition id="Longevitas" component={Video} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
