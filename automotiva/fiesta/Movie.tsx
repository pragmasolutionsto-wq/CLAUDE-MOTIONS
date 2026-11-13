import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import T from './timeline.json';
import {BIANCO, BODY, DISPLAY, MONO, NERO, ORO, ORO_ACCESO, eBack, eI3, eO3, eO5, lerp, prog} from '../a1/lib';

// Reel da annuncio: foto 4:3 nitida al centro su fondo sfocato della stessa foto, etichette sopra, sottotitoli sotto.
const FPS = T.fps;
const fr = (s: number) => Math.round(s * FPS);
type Any = Record<string, any>;
const CARD_TOP = 520;
const CARD_H = 810;

const useLT = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return {lt: f / FPS, d: durationInFrames / FPS};
};

const Media: React.FC<{src: string; k: string; style?: React.CSSProperties}> = ({src, k, style}) =>
  k === 'v' ? (
    <OffthreadVideo src={staticFile(`fiesta/${src}.mp4`)} muted style={{width: '100%', height: '100%', objectFit: 'cover', ...style}} />
  ) : (
    <Img src={staticFile(`fiesta/${src}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', ...style}} />
  );

const Shot: React.FC<{s: Any}> = ({s}) => {
  const {lt, d} = useLT();
  const p = eO5(prog(lt, 0, s.tr === 'zoom' ? 0.24 : 0.2));
  let tf = 'none', blur = 0;
  if (s.tr === 'whip' || s.tr === 'whipL') { tf = `translateX(${(1 - p) * (s.tr === 'whip' ? 1080 : -1080)}px)`; blur = (1 - p) * 30; }
  if (s.tr === 'zoom') { tf = `scale(${lerp(1.4, 1, p)})`; blur = (1 - p) * 20; }
  if (s.tr === 'slide') { tf = `translateY(${(1 - p) * 1920}px)`; blur = (1 - p) * 24; }
  const kb = lerp(1.0, s.k === 'p' ? 1.08 : 1.02, lt / d);
  const drift = s.k === 'p' ? lerp(-12, 12, lt / d) : 0;
  return (
    <AbsoluteFill style={{transform: tf, filter: blur > 0.3 ? `blur(${blur}px)` : 'none', overflow: 'hidden'}}>
      {/* fondo: stessa immagine, ingrandita e sfocata */}
      <AbsoluteFill style={{transform: `scale(${2.5 * kb})`, filter: 'blur(28px) brightness(0.45) saturate(1.1)'}}>
        <Media src={s.src} k={s.k} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,10,10,.55) 0%, rgba(10,10,10,0) 30%, rgba(10,10,10,0) 70%, rgba(10,10,10,.7) 100%)'}} />
      {/* foto nitida al centro, 4:3 a tutta larghezza */}
      <div style={{position: 'absolute', left: 0, right: 0, top: CARD_TOP, height: CARD_H, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.6)', borderTop: `3px solid ${ORO}`, borderBottom: `3px solid ${ORO}`}}>
        <div style={{width: '100%', height: '100%', transform: `scale(${kb}) translateX(${drift}px)`}}>
          <Media src={s.src} k={s.k} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Label: React.FC<{text: string}> = ({text}) => {
  const {lt, d} = useLT();
  const p = eBack(prog(lt, 0.1, 0.4));
  const o = 1 - eI3(prog(lt, d - 0.15, d));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 300, textAlign: 'center', opacity: Math.min(1, prog(lt, 0.1, 0.25)) * o}}>
      <span style={{display: 'inline-block', transform: `scale(${lerp(0.7, 1, p)})`, fontFamily: DISPLAY, fontStretch: '118%', fontWeight: 900, fontSize: text.length > 18 ? 58 : 76, color: BIANCO, lineHeight: 1.05, textShadow: '0 6px 24px rgba(0,0,0,.7)'}}>
        {text}
      </span>
      <div style={{height: 5, width: lerp(0, 220, eO3(prog(lt, 0.2, 0.5))), background: ORO, margin: '16px auto 0'}} />
    </div>
  );
};

const Data: React.FC = () => {
  const {lt, d} = useLT();
  const o = 1 - eI3(prog(lt, d - 0.15, d));
  const cells = [['MODELLO', 'ST-LINE X'], ['POTENZA', `${Math.round(lerp(0, 140, eO3(prog(lt, 1.6, 2.5))))} CV`], ['ANNO', '2020']];
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 250, display: 'flex', gap: 3, background: ORO, border: `3px solid ${ORO}`, opacity: o}}>
      {cells.map(([k, v], i) => {
        const p = eO5(prog(lt, 0.15 + i * 0.25, 0.55 + i * 0.25));
        return (
          <div key={k} style={{flex: 1, background: 'rgba(10,10,10,.92)', padding: '16px 10px', textAlign: 'center', transform: `rotateX(${(1 - p) * 90}deg)`, transformOrigin: '50% 0', opacity: Math.min(1, p * 1.5)}}>
            <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: ORO}}>{k}</div>
            <div style={{fontFamily: DISPLAY, fontStretch: '118%', fontWeight: 900, fontSize: 44, color: BIANCO, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>{v}</div>
          </div>
        );
      })}
    </div>
  );
};

const Check: React.FC = () => {
  const {lt, d} = useLT();
  const o = 1 - eI3(prog(lt, d - 0.15, d));
  const items = [['1 solo proprietario', 0.1], ['Tagliandi certificati', 1.45], ['Mai fumato a bordo', 3.0]] as const;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 200, display: 'flex', flexDirection: 'column', gap: 14, opacity: o}}>
      {items.map(([t, at]) => {
        const p = eBack(prog(lt, at, at + 0.3));
        return (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: Math.min(1, prog(lt, at, at + 0.15)), transform: `translateX(${(1 - Math.min(1, p)) * -60}px)`}}>
            <div style={{width: 54, height: 54, borderRadius: 10, background: ORO, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`, fontFamily: DISPLAY, fontWeight: 900, fontSize: 38, color: NERO}}>✓</div>
            <div style={{fontFamily: DISPLAY, fontStretch: '112%', fontWeight: 850, fontSize: 52, color: BIANCO, textShadow: '0 4px 18px rgba(0,0,0,.7)'}}>{t}</div>
          </div>
        );
      })}
    </div>
  );
};

const Km: React.FC = () => {
  const {lt, d} = useLT();
  const o = 1 - eI3(prog(lt, d - 0.15, d));
  const v = Math.round(lerp(0, 71243, eO3(prog(lt, 0.1, 1.0))));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', opacity: Math.min(1, prog(lt, 0, 0.2)) * o}}>
      <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 6, color: ORO}}>CHILOMETRI</div>
      <div style={{fontFamily: DISPLAY, fontStretch: '120%', fontWeight: 900, fontSize: 120, color: BIANCO, lineHeight: 1, fontVariantNumeric: 'tabular-nums', textShadow: '0 8px 30px rgba(0,0,0,.7)'}}>{v.toLocaleString('it-IT')}</div>
    </div>
  );
};

const Place: React.FC = () => {
  const {lt, d} = useLT();
  const o = Math.min(1, prog(lt, 0.1, 0.35)) * (1 - eI3(prog(lt, d - 0.15, d)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 6, color: ORO}}>LA TROVI QUI</div>
      <div style={{fontFamily: DISPLAY, fontStretch: '118%', fontWeight: 900, fontSize: 64, color: BIANCO, lineHeight: 1.1}}>CASELLE TORINESE</div>
      <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 32, color: '#e6e1d6'}}>Strada Torino 100</div>
    </div>
  );
};

const Subs: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const c = (T.subs as Any[]).find((x) => t >= x.t && t < x.e);
  if (!c) return null;
  const active = c.words.reduce((k: number, w: Any, i: number) => (t >= w.t - 0.02 ? i : k), -1);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: CARD_TOP + CARD_H + 40, textAlign: 'center', fontFamily: DISPLAY, fontStretch: '112%', fontWeight: 800, fontSize: 64, lineHeight: 1.25, textTransform: 'uppercase'}}>
      {c.words.map((w: Any, i: number) => {
        const p = prog(t, w.t - 0.02, w.t + 0.14);
        const hot = i === active;
        return (
          <span key={i} style={{display: 'inline-block', margin: '4px 6px', padding: '2px 12px 4px', borderRadius: 10, background: hot ? ORO : 'transparent', color: hot ? NERO : w.g ? ORO_ACCESO : BIANCO, opacity: p > 0 ? 1 : 0, transform: `scale(${p > 0 ? lerp(1.3, 1, eBack(p, 2.4)) : 0.8})`, textShadow: hot ? 'none' : '0 4px 0 #000, 3px 0 0 #000, -3px 0 0 #000, 0 -3px 0 #000'}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

const Hook: React.FC = () => {
  const {lt, d} = useLT();
  const p = eBack(prog(lt, 0, 0.3), 2.4);
  const o = 1 - eI3(prog(lt, d - 0.2, d));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', opacity: o, transform: `scale(${lerp(1.6, 1, Math.min(1, p))})`}}>
      <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 96, color: BIANCO, lineHeight: 1, textShadow: '0 8px 30px rgba(0,0,0,.8)'}}>FERMATI</div>
      <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 96, color: ORO_ACCESO, lineHeight: 1}}>UN ATTIMO.</div>
    </div>
  );
};

const End: React.FC = () => {
  const {lt} = useLT();
  const a = eO3(prog(lt, 0, 0.5)), b = eO3(prog(lt, 0.3, 0.8)), c = eO3(prog(lt, 0.6, 1.1));
  return (
    <AbsoluteFill style={{background: `rgba(10,10,10,${0.85 * a})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: a}}>
        <Img src={staticFile('logo_neg_4x.png')} style={{width: 760}} />
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 880, textAlign: 'center', opacity: b, fontFamily: DISPLAY, fontStretch: '115%', fontWeight: 800, fontSize: 56, color: BIANCO}}>
        Questa non la trovi <span style={{color: ORO_ACCESO}}>due volte.</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1040, textAlign: 'center', opacity: c, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'}}>
        <div style={{fontFamily: DISPLAY, fontStretch: '115%', fontWeight: 800, fontSize: 48, color: BIANCO, border: `2px solid ${ORO}`, padding: '10px 24px'}}>WhatsApp 388 355 7181</div>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: '#bdb8ad'}}>STRADA TORINO 100 · CASELLE TORINESE</div>
      </div>
    </AbsoluteFill>
  );
};

const OVER: Record<string, React.FC<any>> = {data: Data, check: Check, km: Km, place: Place};

export const Movie: React.FC = () => (
  <AbsoluteFill style={{background: NERO}}>
    {(T.shots as Any[]).map((s, i) => {
      const dur = fr(s.e) - fr(s.s) + (i + 1 < T.shots.length ? fr(0.3) : fr(T.dur - T.total));
      const O = s.lab ? OVER[s.lab] : null;
      return (
        <Sequence key={i} from={fr(s.s)} durationInFrames={dur}>
          <Shot s={s} />
          <Sequence durationInFrames={fr(s.e) - fr(s.s)}>{s.lab ? O ? <O /> : <Label text={s.lab} /> : null}</Sequence>
        </Sequence>
      );
    })}
    <Sequence durationInFrames={fr(T.shots[1].s)}>
      <Hook />
    </Sequence>
    <Subs />
    <Sequence from={fr(T.total - 0.4)} durationInFrames={fr(T.dur - T.total + 0.4)}>
      <End />
    </Sequence>
  </AbsoluteFill>
);
