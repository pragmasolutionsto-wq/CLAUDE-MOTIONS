export const C = {
  ink: '#050E0C',
  deep: '#0A1D19',
  forest: '#103029',
  mint: '#5FE3C0',
  mintSoft: 'rgba(95,227,192,0.16)',
  gold: '#D8B878',
  goldSoft: 'rgba(216,184,120,0.18)',
  ivory: '#F4EFE4',
  mute: 'rgba(244,239,228,0.62)',
  faint: 'rgba(244,239,228,0.12)',
};

export const SERIF = "'Cormorant Garamond', serif";
export const SANS = "'Manrope', sans-serif";

export const FPS = 30;

// Durata di ogni scena in frame (30fps)
export const SCENES = {
  intro: 150,
  hero: 180,
  about: 240,
  method: 285,
  app: 270,
  tech: 330,
  ihht: 240,
  labs: 360,
  home: 225,
  path: 300,
  academy: 225,
  outro: 300,
};

export const OVERLAP = 12;

export const TOTAL =
  Object.values(SCENES).reduce((a, b) => a + b, 0) -
  OVERLAP * (Object.keys(SCENES).length - 1);
