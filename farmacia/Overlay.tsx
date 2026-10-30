import React from 'react';
import {COL, FONT, INFO, CAPS} from './config';
import {clamp, eO3, prog} from './util';

const Cap: React.FC<{t: number; vertical: boolean; a: number; b: number; k?: string; title: string; s?: string}> = ({t, vertical, a, b, k, title, s}) => {
  const i = eO3(prog(t, a, a + 0.55));
  const o = prog(t, b - 0.4, b);
  if (t < a || t > b) return null;
  const op = i * (1 - o);
  const big = vertical ? 132 : 128;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: vertical ? 300 : undefined,
        bottom: vertical ? undefined : 118,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        opacity: op,
        transform: `translateY(${(1 - i) * 36}px)`,
      }}
    >
      {k ? (
        <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: vertical ? 38 : 30, letterSpacing: 5, textTransform: 'uppercase', color: COL.white, background: COL.magenta, padding: '8px 22px', borderRadius: 40, marginBottom: 16}}>
          {k}
        </div>
      ) : null}
      <div style={{fontFamily: FONT.title, fontSize: big, lineHeight: 0.95, color: COL.white, letterSpacing: 2, textShadow: '0 5px 0 rgba(10,71,77,.95), 0 12px 36px rgba(10,71,77,.5)', paintOrder: 'stroke fill', WebkitTextStroke: `10px ${COL.petrolDark}`, padding: '0 40px'}}>{title}</div>
      {s ? (
        <div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: vertical ? 44 : 36, color: COL.white, marginTop: 14, padding: '10px 28px', background: 'rgba(10,71,77,.78)', borderRadius: 14, maxWidth: vertical ? 900 : 1500}}>{s}</div>
      ) : null}
    </div>
  );
};

const Logo: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x="35" y="5" width="30" height="90" rx="8" fill={COL.petrol} />
    <rect x="5" y="35" width="90" height="30" rx="8" fill={COL.petrol} />
    <rect x="42" y="14" width="16" height="72" rx="4" fill={COL.cream} />
    <rect x="14" y="42" width="72" height="16" rx="4" fill={COL.cream} />
  </svg>
);

const Final: React.FC<{t: number; vertical: boolean}> = ({t, vertical}) => {
  const a = 55.6;
  const i = eO3(prog(t, a, a + 0.8));
  if (t < a) return null;
  const j = (d: number) => eO3(prog(t, a + d, a + d + 0.6));
  const pad = vertical ? 60 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: vertical ? 'flex-start' : 'flex-end', justifyContent: 'center'}}>
      <div
        style={{
          marginTop: vertical ? 200 : 0,
          marginBottom: vertical ? 0 : 56,
          width: vertical ? 940 : 1500,
          padding: vertical ? '34px 36px' : '30px 54px',
          background: 'rgba(10,71,77,.88)',
          borderRadius: 34,
          border: `3px solid ${COL.turq}`,
          boxShadow: '0 30px 90px rgba(0,0,0,.35)',
          opacity: i,
          transform: `translateY(${(1 - i) * 50}px)`,
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
          gap: vertical ? 14 : 44,
          textAlign: vertical ? 'center' : 'left',
          marginLeft: pad ? 0 : 0,
        }}
      >
        <Logo size={vertical ? 110 : 130} />
        <div style={{flex: 1}}>
          <div style={{fontFamily: FONT.title, fontSize: vertical ? 104 : 96, lineHeight: 0.95, color: COL.white, letterSpacing: 2, opacity: j(0.2)}}>{INFO.name}</div>
          <div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: vertical ? 40 : 34, color: COL.cream, marginTop: 12, opacity: j(0.4)}}>{INFO.address}</div>
          <div style={{fontFamily: FONT.body, fontWeight: 500, fontSize: vertical ? 32 : 28, color: '#BFE4E6', marginTop: 6, opacity: j(0.5)}}>{INFO.hours}</div>
        </div>
        <div style={{opacity: j(0.7), textAlign: 'center'}}>
          <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: vertical ? 44 : 36, color: COL.white, background: COL.magenta, padding: '18px 34px', borderRadius: 60, whiteSpace: 'nowrap'}}>{INFO.cta}</div>
          <div style={{fontFamily: FONT.title, fontSize: vertical ? 64 : 52, color: COL.white, marginTop: 12, letterSpacing: 2}}>{INFO.phone}</div>
        </div>
      </div>
    </div>
  );
};

// tilt-shift finto: sfocatura sfumata in alto e in basso + vignetta leggera
const Tilt: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '16%', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', WebkitMaskImage: 'linear-gradient(#000, transparent)', maskImage: 'linear-gradient(#000, transparent)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: '16%', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', WebkitMaskImage: 'linear-gradient(transparent, #000)', maskImage: 'linear-gradient(transparent, #000)'}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 62%, rgba(10,40,45,.28) 100%)'}} />
  </>
);

export const Overlay: React.FC<{t: number; vertical: boolean}> = ({t, vertical}) => {
  const fadeIn = 1 - clamp(t / 1.2);
  const fadeOut = clamp((t - 59.4) / 0.6) * 0; // fermo sul logo: nessuna dissolvenza finale
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Tilt />
      {CAPS.map((c, i) => (
        <Cap key={i} t={t} vertical={vertical} a={c.a} b={c.b} k={c.k} title={c.t} s={c.s} />
      ))}
      <Final t={t} vertical={vertical} />
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: fadeIn * 0.9 + fadeOut, pointerEvents: 'none'}} />
    </div>
  );
};
