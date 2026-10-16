import tl from './timeline.json';

export const C = {
  navy: '#112250',
  ivory: '#EDE8DF',
  white: '#FFFFFF',
  night: '#0D1B2A',
  champ: '#C9B99A',
};

export const SANS = "'Manrope', sans-serif";
export const SERIF = "'Cormorant Garamond', serif";

export const FPS = tl.fps;
export const OV = tl.overlap;

export type SceneDef = {key: string; dur: number; trans: string; cx?: number; cy?: number};
export const SCENES = tl.scenes as SceneDef[];

export const STARTS = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].dur - OV);
  return acc;
}, []);

export const TOTAL = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].dur;
