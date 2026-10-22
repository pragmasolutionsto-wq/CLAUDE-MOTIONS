import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BIANCO, BODY, DISPLAY, GRAFITE, H, MONO, NERO, ORO, ORO_ACCESO, ORO_CHIARO, W, clamp, eBack, eI3, eIO, eO3, eO5, extrude, goldFill, lerp, prog, rnd} from './lib';

/** tempo locale (s) e durata della Sequence */
export const useLT = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  return {lt: f / fps, d: durationInFrames / fps};
};

/** entrata/uscita standard: 0→1 in `a` secondi, 1→0 negli ultimi `b` */
const io = (lt: number, d: number, a = 0.28, b = 0.22) => Math.min(eO5(prog(lt, 0, a)), 1 - eI3(prog(lt, d - b, d)));

/** pulviscolo oro che sale */
export const Dust: React.FC<{n?: number; seed?: number; op?: number}> = ({n = 34, seed = 7, op = 1}) => {
  const {lt} = useLT();
  const r = rnd(seed);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const x = r() * W, y0 = r() * H, sp = 30 + r() * 90, sz = 2 + r() * 5, ph = r() * 6;
        const y = ((y0 - lt * sp) % H + H) % H;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(lt * 2 + ph));
        return <div key={i} style={{position: 'absolute', left: x + Math.sin(lt + ph) * 14, top: y, width: sz, height: sz, borderRadius: '50%', background: ORO_CHIARO, opacity: tw * op * 0.7, boxShadow: `0 0 ${sz * 3}px ${ORO}`}} />;
      })}
    </AbsoluteFill>
  );
};

/** riflesso oro diagonale che attraversa il frame */
export const Sweep: React.FC<{t0?: number; dur?: number; op?: number}> = ({t0 = 0, dur = 0.55, op = 0.85}) => {
  const {lt} = useLT();
  const p = prog(lt, t0, t0 + dur);
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <div style={{position: 'absolute', left: lerp(-900, W + 300, eIO(p)), top: -400, width: 380, height: H + 800, transform: 'rotate(18deg)', background: `linear-gradient(90deg, transparent, rgba(221,181,43,.55), rgba(255,240,200,.9), rgba(221,181,43,.55), transparent)`, filter: 'blur(18px)', opacity: op}} />
    </AbsoluteFill>
  );
};

/** cartiglio d'apertura */
export const Tag: React.FC<{text: string}> = ({text}) => {
  const {lt, d} = useLT();
  const p = eBack(prog(lt, 0.02, 0.32));
  const out = eI3(prog(lt, d - 0.25, d));
  return (
    <div style={{position: 'absolute', left: 90, top: 330, transform: `perspective(900px) rotateX(${(1 - p) * 70}deg) scale(${lerp(1.7, 1, clamp(p))}) translateY(${-out * 220}px)`, transformOrigin: '0 50%', opacity: 1 - out}}>
      <div style={{border: `3px solid ${ORO}`, padding: '14px 26px 18px', background: 'rgba(10,10,10,.82)', boxShadow: `0 0 0 8px rgba(10,10,10,.5), 0 0 60px rgba(215,182,72,.35)`}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 6, color: ORO, fontWeight: 600}}>AUTOMOTIVA · EP. 01</div>
        <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 118, lineHeight: 1, ...goldFill(prog(lt, 0.2, 1.4)), filter: 'drop-shadow(0 6px 0 #5a450f)'}}>{text}</div>
      </div>
    </div>
  );
};

/** titolo 3D estruso */
export const Title: React.FC<{a: string; b: string}> = ({a, b}) => {
  const {lt, d} = useLT();
  const p1 = eO5(prog(lt, 0, 0.45)), p2 = eO5(prog(lt, 0.12, 0.6));
  const o = 1 - eI3(prog(lt, d - 0.25, d));
  const sway = Math.sin(lt * 1.6) * 6;
  const line = (txt: string, p: number, size: number, gold: boolean) => (
    <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: size, lineHeight: 0.92, transform: `rotateX(${(1 - p) * -85}deg) translateZ(${(1 - p) * -400}px)`, opacity: p, position: 'relative'}}>
      <span style={{position: 'absolute', left: 0, top: 0, color: '#6E5512', textShadow: extrude(18, gold ? '#5E4810' : '#1c1c1c')}}>{txt}</span>
      <span style={{position: 'relative', ...(gold ? goldFill(prog(lt, 0.3, 1.6)) : {color: BIANCO})}}>{txt}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(10,10,10,.75) 0%, rgba(10,10,10,0) 38%)`, opacity: o}}>
      <div style={{position: 'absolute', left: 70, top: 260, perspective: 1100, transform: `rotateY(${sway}deg)`, transformStyle: 'preserve-3d'}}>
        {line(a, p1, 136, false)}
        {line(b, p2, 104, true)}
        <div style={{marginTop: 22, height: 6, width: lerp(0, 560, eO3(prog(lt, 0.35, 0.9))), background: `linear-gradient(90deg, ${ORO}, transparent)`}} />
        <div style={{marginTop: 14, fontFamily: MONO, fontSize: 30, letterSpacing: 5, color: ORO, opacity: prog(lt, 0.5, 0.8)}}>SPORTBACK 40 TFSI · S LINE</div>
      </div>
      <Sweep t0={0.25} dur={0.7} op={0.6} />
    </AbsoluteFill>
  );
};

/** numero grande con contatore e unità */
export const Big: React.FC<{num?: number; text?: string; unit: string}> = ({num, text, unit}) => {
  const {lt, d} = useLT();
  const o = io(lt, d);
  const n = num != null ? Math.round(lerp(0, num, eO3(prog(lt, 0, 0.55)))) : null;
  const shown = text ?? String(n);
  const pz = eBack(prog(lt, 0, 0.4));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(10,10,10,0) 30%, rgba(10,10,10,.55) 100%)', opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', perspective: 1200}}>
        <div style={{display: 'inline-block', transform: `rotateY(${(1 - clamp(pz)) * 70 + Math.sin(lt * 2) * 8}deg) rotateX(${Math.sin(lt * 1.3) * 5}deg) scale(${lerp(0.4, 1, clamp(pz))})`, transformStyle: 'preserve-3d', position: 'relative'}}>
          <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 300, lineHeight: 1, position: 'relative', fontVariantNumeric: 'tabular-nums'}}>
            <span style={{position: 'absolute', left: 0, top: 0, color: '#5E4810', textShadow: extrude(26, '#5E4810')}}>{shown}</span>
            <span style={{position: 'relative', ...goldFill(prog(lt, 0.2, 1.3))}}>{shown}</span>
          </div>
          <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 800, fontSize: 84, letterSpacing: 18, color: BIANCO, marginTop: -6, textShadow: '0 6px 20px rgba(0,0,0,.8)'}}>{unit}</div>
        </div>
      </div>
      <Dust n={26} seed={num ?? 3} />
    </AbsoluteFill>
  );
};

/** callout dettaglio */
export const Label: React.FC<{text: string}> = ({text}) => {
  const {lt, d} = useLT();
  const p = eO5(prog(lt, 0, 0.35));
  const out = eI3(prog(lt, d - 0.2, d));
  const ln = eO3(prog(lt, 0, 0.3));
  return (
    <div style={{position: 'absolute', left: 70, top: 300, perspective: 900, opacity: 1 - out}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12}}>
        <div style={{width: 18, height: 18, background: ORO, transform: `rotate(45deg) scale(${ln})`}} />
        <div style={{height: 3, width: 140 * ln, background: ORO}} />
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: ORO, opacity: ln}}>DETTAGLIO</div>
      </div>
      <div style={{transform: `rotateY(${(1 - p) * -75}deg) translateX(${(1 - p) * -60 - out * 80}px)`, transformOrigin: '0 50%', background: 'rgba(10,10,10,.86)', borderLeft: `8px solid ${ORO}`, padding: '16px 28px 18px 24px', boxShadow: '0 20px 50px rgba(0,0,0,.5)'}}>
        <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 850, fontSize: 64, color: BIANCO, lineHeight: 1, whiteSpace: 'nowrap'}}>{text}</div>
      </div>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}><Sweep t0={0.15} dur={0.5} op={0.5} /></div>
    </div>
  );
};

/** parola esplosiva al centro */
export const Pop: React.FC<{text: string}> = ({text}) => {
  const {lt, d} = useLT();
  const p = eBack(prog(lt, 0, 0.28), 2.6);
  const out = eI3(prog(lt, d - 0.18, d));
  const shake = Math.exp(-lt * 9) * Math.sin(lt * 70) * 14;
  const size = Math.min(150, Math.round(880 / (text.length * 0.74)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', transform: `translateX(${shake}px) scale(${lerp(2.2, 1, clamp(p)) * (1 + out * 0.4)}) rotate(-4deg)`, opacity: 1 - out}}>
      <span style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: size, position: 'relative', display: 'inline-block'}}>
        <span style={{position: 'absolute', left: 0, top: 0, color: '#5E4810', textShadow: extrude(16, '#5E4810')}}>{text}</span>
        <span style={{position: 'relative', ...goldFill(prog(lt, 0.1, 0.9))}}>{text}</span>
      </span>
    </div>
  );
};

/** confronto A1 vs Polo GTI */
export const VS: React.FC<{rival: number; same: number}> = ({rival, same}) => {
  const {lt, d} = useLT();
  const o = io(lt, d, 0.35, 0.3);
  const pr = eO5(prog(lt, rival, rival + 0.45));
  const ps = eO5(prog(lt, same, same + 0.6));
  const tilt = Math.sin(lt * 0.9) * 5;
  const col = (title: string, sub: string, p: number, gold: boolean) => (
    <div style={{flex: 1, textAlign: 'center', transform: `rotateY(${(1 - p) * (gold ? -90 : 90)}deg)`, opacity: p, background: gold ? 'rgba(215,182,72,.12)' : 'rgba(246,244,238,.06)', border: `2px solid ${gold ? ORO : 'rgba(246,244,238,.35)'}`, padding: '34px 10px 30px'}}>
      <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: gold ? ORO : '#bdb8ad'}}>{sub}</div>
      <div style={{fontFamily: DISPLAY, fontStretch: '115%', fontWeight: 900, fontSize: 64, color: BIANCO, lineHeight: 1.02, marginTop: 10}}>{title}</div>
      <div style={{marginTop: 26, height: 2, background: gold ? ORO : 'rgba(246,244,238,.3)', opacity: ps}} />
      <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 92, marginTop: 18, opacity: ps, transform: `scale(${lerp(1.6, 1, ps)})`, ...(gold ? goldFill(prog(lt, same, same + 1.2)) : {color: BIANCO})}}>207 CV</div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: `rgba(10,10,10,${0.72 * o})`}}>
      <div style={{position: 'absolute', left: 60, right: 60, top: 250, opacity: o, perspective: 1400}}>
        <div style={{fontFamily: MONO, fontSize: 28, letterSpacing: 8, color: ORO, textAlign: 'center', marginBottom: 26}}>LA RIVALE</div>
        <div style={{display: 'flex', gap: 30, alignItems: 'stretch', transform: `rotateX(${tilt}deg)`, transformStyle: 'preserve-3d'}}>
          {col('AUDI A1', '40 TFSI · COMPETITION', clamp(prog(lt, 0, 0.45) * 1.0), true)}
          {col('POLO GTI', 'VOLKSWAGEN', pr, false)}
        </div>
        <div style={{position: 'absolute', left: '50%', top: 210, transform: `translate(-50%,-50%) scale(${lerp(3, 1, eBack(prog(lt, rival, rival + 0.35)))})`, opacity: prog(lt, rival, rival + 0.2), fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 90, color: NERO, background: ORO, width: 150, height: 150, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(215,182,72,.6)'}}>
          {ps > 0.5 ? '=' : 'VS'}
        </div>
        <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 36, color: BIANCO, textAlign: 'center', marginTop: 34, opacity: ps}}>Stessi cavalli. Due caratteri diversi.</div>
      </div>
    </AbsoluteFill>
  );
};

/** contachilometri */
export const Km: React.FC<{num: number}> = ({num}) => {
  const {lt, d} = useLT();
  const o = io(lt, d);
  const v = Math.round(lerp(0, num, eO3(prog(lt, 0.05, 0.9))));
  const s = v.toLocaleString('it-IT').padStart(6, ' ');
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', opacity: o, transform: `perspective(900px) rotateX(${(1 - eO5(prog(lt, 0, 0.35))) * 80}deg)`}}>
      <div style={{background: 'rgba(10,10,10,.88)', border: `3px solid ${ORO}`, padding: '20px 34px', boxShadow: '0 30px 60px rgba(0,0,0,.6)'}}>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: ORO}}>CHILOMETRI REALI</div>
        <div style={{display: 'flex', gap: 8, marginTop: 10}}>
          {s.split('').map((c, i) => (
            <div key={i} style={{fontFamily: MONO, fontWeight: 600, fontSize: 104, color: c === '.' ? ORO : BIANCO, background: c === '.' || c === ' ' ? 'transparent' : GRAFITE, width: c === '.' ? 34 : 76, textAlign: 'center', lineHeight: 1.15, borderRadius: 6}}>{c}</div>
          ))}
          <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 56, color: ORO, alignSelf: 'flex-end', marginLeft: 12}}>KM</div>
        </div>
      </div>
    </div>
  );
};

/** timbro */
export const Stamp: React.FC<{text: string}> = ({text}) => {
  const {lt, d} = useLT();
  const p = eO5(prog(lt, 0, 0.14));
  const shake = Math.exp(-lt * 10) * Math.sin(lt * 80) * 10;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center', transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      <div style={{transform: `rotate(-9deg) scale(${lerp(2.6, 1, p)})`, opacity: p * (1 - prog(lt, d + 0.6, d + 0.9)), border: `8px solid ${ORO_ACCESO}`, outline: `3px solid ${ORO_ACCESO}`, outlineOffset: 10, padding: '18px 40px', background: 'rgba(10,10,10,.55)'}}>
        <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 120, color: ORO_ACCESO, letterSpacing: 4, lineHeight: 1}}>{text}</div>
      </div>
    </div>
  );
};

/** scheda tecnica 3D */
const SPEC: [string, string][] = [['ANNO', '11/2022'], ['KM', '25.325'], ['POTENZA', '207 CV'], ['CAMBIO', 'S TRONIC'], ['MOTORE', '2.0 TFSI'], ['PROPRIETARI', '1']];
export const Spec: React.FC = () => {
  const {lt, d} = useLT();
  const o = 1 - eI3(prog(lt, d - 0.3, d));
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 230, opacity: o, perspective: 1300}}>
      <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 7, color: ORO, opacity: prog(lt, 0, 0.3)}}>SCHEDA AUTOMOTIVA</div>
      <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 66, color: BIANCO, lineHeight: 1, marginTop: 8, opacity: prog(lt, 0.05, 0.35), transform: `translateY(${(1 - eO5(prog(lt, 0.05, 0.4))) * 40}px)`}}>AUDI A1 COMPETITION</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, background: ORO, border: `3px solid ${ORO}`, marginTop: 26, transform: `rotateX(${Math.sin(lt * 0.8) * 4}deg) rotateY(${Math.sin(lt * 0.6) * 5}deg)`, transformStyle: 'preserve-3d'}}>
        {SPEC.map(([k, v], i) => {
          const p = eO5(prog(lt, 0.2 + i * 0.09, 0.6 + i * 0.09));
          return (
            <div key={k} style={{background: 'rgba(10,10,10,.93)', padding: '20px 22px', transform: `rotateX(${(1 - p) * 90}deg)`, transformOrigin: '50% 0', opacity: clamp(p * 1.5)}}>
              <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: ORO}}>{k}</div>
              <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 58, color: BIANCO, marginTop: 4}}>{v}</div>
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 32, color: ORO_CHIARO, marginTop: 22, opacity: prog(lt, 1.0, 1.4)}}>Benzina · Sportback · S line · Garantita</div>
    </div>
  );
};

const Pin: React.FC = () => (
  <svg width="64" height="80" viewBox="0 0 24 30"><path d="M12 0C5.4 0 0 5.2 0 11.7 0 20 12 30 12 30s12-10 12-18.3C24 5.2 18.6 0 12 0z" fill={ORO} /><circle cx="12" cy="11.5" r="4.5" fill={NERO} /></svg>
);
export const Place: React.FC = () => {
  const {lt, d} = useLT();
  const o = io(lt, d, 0.35, 0.25);
  const drop = eBack(prog(lt, 0, 0.4));
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 300, opacity: o, display: 'flex', gap: 24, alignItems: 'center', background: 'rgba(10,10,10,.88)', border: `2px solid ${ORO}`, padding: '26px 30px', transform: `perspective(900px) rotateX(${(1 - eO5(prog(lt, 0, 0.35))) * -70}deg)`}}>
      <div style={{transform: `translateY(${(1 - clamp(drop)) * -120}px)`}}><Pin /></div>
      <div>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: ORO}}>VIENI A VEDERLA</div>
        <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 50, color: BIANCO, lineHeight: 1.05, whiteSpace: 'nowrap'}}>STRADA TORINO 100</div>
        <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 38, color: ORO_CHIARO}}>Caselle Torinese (TO)</div>
      </div>
    </div>
  );
};

export const WaIcon: React.FC<{s?: number}> = ({s = 72}) => (
  <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill={ORO} /><path d="M16 7.5a8.4 8.4 0 0 0-7.2 12.8L7.6 24.5l4.3-1.1A8.4 8.4 0 1 0 16 7.5zm4.9 11.8c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-1.6-.5-3.7-2-4.8-3.6-.6-.9-.9-1.8-.9-2.5 0-1 .5-1.6.8-1.9.3-.3.6-.3.8-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.6c-.1.2-.3.3-.1.6.6 1.1 1.6 2 2.7 2.5.3.1.5.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.1z" fill={NERO} /></svg>
);
export const Wa: React.FC = () => {
  const {lt, d} = useLT();
  const o = io(lt, d, 0.35, 0.25);
  const pulse = 1 + Math.max(0, Math.sin(lt * 5)) * 0.06;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 300, opacity: o, display: 'flex', gap: 26, alignItems: 'center', background: 'rgba(10,10,10,.9)', border: `2px solid ${ORO}`, padding: '26px 30px', transform: `perspective(900px) rotateY(${(1 - eO5(prog(lt, 0, 0.35))) * 70}deg)`}}>
      <div style={{transform: `scale(${pulse})`}}><WaIcon s={96} /></div>
      <div>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: ORO}}>SCRIVICI PRIMA DI VENIRE</div>
        <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 70, color: BIANCO, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums'}}>388 355 7181</div>
        <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 34, color: ORO_CHIARO}}>Test drive su appuntamento</div>
      </div>
    </div>
  );
};

export const End: React.FC = () => {
  const {lt} = useLT();
  const p = eO5(prog(lt, 0, 0.6));
  const t2 = eO5(prog(lt, 0.45, 0.95));
  const t3 = eO5(prog(lt, 0.8, 1.3));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #1d1a12 0%, ${NERO} 70%)`}}>
      <Dust n={50} seed={99} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', perspective: 1200}}>
        <div style={{position: 'relative', transform: `rotateX(${(1 - p) * 60}deg) scale(${lerp(0.7, 1, p)})`, opacity: p}}>
          <Img src={staticFile('logo_neg_4x.png')} style={{width: 860}} />
          <div style={{position: 'absolute', inset: 0, overflow: 'hidden', WebkitMaskImage: `url(${staticFile('logo_neg_4x.png')})`, WebkitMaskSize: '100% 100%'}}><Sweep t0={0.4} dur={0.9} op={1} /></div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 860, textAlign: 'center', opacity: t2, transform: `translateY(${(1 - t2) * 40}px)`}}>
        <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 62, color: BIANCO, lineHeight: 1.1}}>QUESTA NON LA TROVI</div>
        <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 62, lineHeight: 1.1, ...goldFill(prog(lt, 0.6, 2))}}>DUE VOLTE.</div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1110, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: t3}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, border: `2px solid ${ORO}`, padding: '14px 26px'}}>
          <WaIcon s={58} />
          <span style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 52, color: BIANCO}}>388 355 7181</span>
        </div>
        <div style={{fontFamily: MONO, fontSize: 28, letterSpacing: 3, color: '#bdb8ad'}}>STRADA TORINO 100 · CASELLE TORINESE</div>
        <div style={{fontFamily: BODY, fontStyle: 'italic', fontSize: 28, color: '#8f8a80', marginTop: 10}}>Guidare può avere effetti collaterali.</div>
      </div>
    </AbsoluteFill>
  );
};
