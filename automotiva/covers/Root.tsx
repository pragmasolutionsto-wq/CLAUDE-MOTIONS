import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Composition, Img, continueRender, delayRender, staticFile} from 'remotion';
import '@fontsource-variable/archivo/standard.css';
import '@fontsource/ibm-plex-mono/600.css';
import {BIANCO, DISPLAY, MONO, NERO, ORO, ORO_ACCESO} from '../a1/lib';

// Copertine reel 1080x1920: tutto il contenuto dentro la fascia centrale 3:4 (y 240-1680) che resta visibile nella griglia
const OUT = '0 6px 0 #000, 6px 0 0 #000, -6px 0 0 #000, 0 -6px 0 #000, 5px 5px 0 #000, -5px 5px 0 #000, 5px -5px 0 #000, -5px -5px 0 #000, 0 14px 30px rgba(0,0,0,.7)';
type P = {photo: string; label: string; a: string; b: string; sa: number; sb: number; scale: number; dx: number};

const Cover: React.FC<P> = ({photo, label, a, b, sa, sb, scale, dx}) => {
  const [h] = useState(() => delayRender('fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all([document.fonts.load("900 100px 'Archivo Variable'"), document.fonts.load("600 100px 'IBM Plex Mono'")]).then(() => {
      setOk(true);
      continueRender(h);
    });
  }, [h]);
  if (!ok) return null;
  const w = 1080 * scale, ph = 810 * scale;
  return (
    <AbsoluteFill style={{background: NERO, overflow: 'hidden'}}>
      <Img src={staticFile(photo)} style={{position: 'absolute', width: w, height: ph, left: (1080 - w) / 2 + dx, top: 1650 - ph, maxWidth: 'none', filter: 'contrast(1.08) saturate(1.05)'}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${NERO} 0%, ${NERO} 38%, rgba(10,10,10,.55) 50%, rgba(10,10,10,0) 60%, rgba(10,10,10,0) 76%, ${NERO} 86.5%)`}} />
      {/* fascia oro diagonale dietro al titolo */}
      <div style={{position: 'absolute', left: -200, top: 800, width: 1500, height: 16, background: ORO_ACCESO, transform: 'rotate(-4deg)'}} />
      <div style={{position: 'absolute', left: 60, right: 30, top: 350, transform: 'rotate(-4deg) skewX(-6deg)', transformOrigin: '0 50%'}}>
        <div style={{display: 'inline-block', background: ORO, color: NERO, fontFamily: MONO, fontWeight: 600, fontSize: 38, letterSpacing: 6, padding: '8px 20px 8px 22px'}}>{label}</div>
        <div style={{fontFamily: DISPLAY, fontStretch: '112%', fontWeight: 900, fontSize: sa, lineHeight: 0.98, letterSpacing: -4, color: BIANCO, textShadow: OUT, marginTop: 18, whiteSpace: 'nowrap'}}>{a}</div>
        <div style={{fontFamily: DISPLAY, fontStretch: '112%', fontWeight: 900, fontSize: sb, lineHeight: 0.98, letterSpacing: -4, color: ORO_ACCESO, textShadow: OUT, whiteSpace: 'nowrap'}}>{b}</div>
      </div>
    </AbsoluteFill>
  );
};

const C = Cover as unknown as React.FC<Record<string, unknown>>;
export const Root: React.FC = () => (
  <>
    <Composition id="CoverA3Nera" component={C} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{photo: 'n1/p_01.jpg', label: 'AUDI A3 SPORTBACK', a: 'È DEL 2026.', b: '7.788 KM.', sa: 132, sb: 176, scale: 1.14, dx: 34}} />
    <Composition id="CoverA3Bianca" component={C} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{photo: 'n2/p_01.jpg', label: 'AUDI A3 · IDENTITY BLACK', a: 'COME QUESTA', b: 'NON LA TROVI PIÙ.', sa: 118, sb: 87, scale: 1.14, dx: 40}} />
  </>
);
