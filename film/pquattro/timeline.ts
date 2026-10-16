/** Ogni set vive in un punto diverso dello spazio (asse X); la camera si sposta tra i set. */
export const OX = (k: number) => k * 16000;

export const SETS = {
  open: {k: 0, a: 0, b: 5.6},
  hook: {k: 1, a: 5.55, b: 12.8},
  about: {k: 2, a: 12.8, b: 18.8},
  method: {k: 3, a: 18.8, b: 25.4},
  target: {k: 4, a: 25.4, b: 30.6},
  shelves: {k: 5, a: 30.6, b: 35.2},
  digital: {k: 6, a: 35.2, b: 39.8},
  events: {k: 7, a: 39.8, b: 43.8},
  training: {k: 8, a: 43.8, b: 47.8},
  gauge: {k: 9, a: 47.8, b: 52.8},
  cta: {k: 10, a: 52.8, b: 59.0},
} as const;

export const DURATION = 60.5;
