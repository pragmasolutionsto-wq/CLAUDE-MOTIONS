import React from 'react';
import {FilmStage, type CamKey, type Film} from '../engine/core';
import {B} from './brand';
import {SOpen} from './sOpen';
import {SHook} from './sHook';
import {SAbout} from './sAbout';
import {SMethod, methodCam} from './sMethod';
import {STarget, targetCam} from './sTarget';
import {SShelves, shelvesCam} from './sShelves';
import {SDigital, digitalCam} from './sDigital';
import {SEvents, eventsCam} from './sEvents';
import {STraining, trainingCam, TOP} from './sTraining';
import {SGauge, gaugeCam} from './sGauge';
import {SCta, ctaCam} from './sCta';
import {OX, SETS, DURATION} from './timeline';

export {DURATION};

const o1 = OX(SETS.hook.k);
const o2 = OX(SETS.about.k);
const o3 = OX(SETS.method.k);
const o5 = OX(SETS.shelves.k);

export const cam: CamKey[] = [
  // 1. APERTURA
  {t: 0, p: [0, 0, 1600]},
  {t: 3.4, p: [0, -10, 1500]},
  {t: 4.85, p: [0, 0, 120]},
  {t: 5.4, p: [0, 0, -400]},
  // 2. HOOK (taglio sotto il flood)
  {t: 5.5, p: [o1, -40, 1900], r: [0, 0, 0], cut: true},
  {t: 8.2, p: [o1 + 60, -10, 1550], r: [0, -4, 1.5]},
  {t: 10.2, p: [o1 + 520, 40, 600], r: [3, -20, 4]},
  {t: 12.0, p: [o1 + 900, 20, -500], r: [0, -34, 7], hold: true},
  // 3. CHI SIAMO (whip pan)
  {t: 13.0, p: [o2 + 40, -30, 2050], r: [0, 8, -1], hold: true},
  {t: 15.4, p: [o2 + 120, -10, 1950], r: [1, -5, 0.5]},
  {t: 17.7, p: [o2 + 230, -60, 1650], r: [0, -10, -2]},
  {t: 18.4, p: [o2 + 300, -60, 1000], r: [0, -12, -2]},
  // 4. METODO (taglio sotto il flood, poi la camera insegue il filo)
  {t: 18.5, p: [o3 - 1820, 500, 2050], r: [0, 0, 0], cut: true},
  ...methodCam(),
  // 5. TARGET (whip)
  ...targetCam(),
  // 6. SCAFFALI (flood)
  {t: 30.5, p: [o5 - 520, -30, 1950], r: [0, 12, -1.5], cut: true},
  ...shelvesCam(),
  // 7. DIGITAL (whip)
  ...digitalCam(),
  // 8. EVENTI (flood)
  ...eventsCam(),
  // 9. FORMAZIONE (whip)
  ...trainingCam(),
  // 10. ANALISI (flood)
  ...gaugeCam(),
  // 11. CTA (whip)
  ...ctaCam(),
];

const film: Film = {
  bg: [{t: 0, c: B.dark}],
  glow: B.accent,
  bgSets: [
    {ox: OX(SETS.open.k), color: B.dark},
    {ox: OX(SETS.hook.k), color: B.accent},
    {ox: OX(SETS.about.k), color: B.dark},
    {ox: OX(SETS.method.k), color: B.ivory},
    {ox: OX(SETS.target.k), color: B.dark},
    {ox: OX(SETS.shelves.k), color: B.ivory},
    {ox: OX(SETS.digital.k), color: B.dark},
    {ox: OX(SETS.events.k), color: B.accent},
    {ox: OX(SETS.training.k), color: B.navy},
    {ox: OX(SETS.gauge.k), color: B.dark},
    {ox: OX(SETS.cta.k), color: B.dark},
  ],
  impacts: [3.0, 28.95, 41.9, TOP, 51.8, 58.0],
  floods: [
    {t: 4.85, d: 0.65, cx: 960, cy: 540, color: B.accent},
    {t: 17.8, d: 0.7, cx: 1300, cy: 640, color: B.ivory},
    {t: 29.7, d: 0.8, cx: 960, cy: 540, color: B.ivory},
    {t: 39.2, d: 0.8, cx: 700, cy: 500, color: B.accent},
    {t: 48.75, d: 0.75, cx: 1500, cy: 300, color: B.dark},
  ],
  fade: {t: 59.7, d: 0.8, color: B.dark},
  cam,
};

export const Movie: React.FC = () => (
  <FilmStage film={film}>
    <SOpen />
    <SHook />
    <SAbout />
    <SMethod />
    <STarget />
    <SShelves />
    <SDigital />
    <SEvents />
    <STraining />
    <SGauge />
    <SCta />
  </FilmStage>
);
