import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import T from './timeline.json';
import {BIANCO, BODY, DISPLAY, MONO, NERO, ORO, ORO_ACCESO, eI3, eIO, eO3, lerp, prog} from '../a1/lib';

// Stile empatico (come "Regaliamo un'auto"): dissolvenze tra le riprese, push-in lenti, sottotitoli calmi, niente effetti aggressivi.
const FPS = T.fps;
const fr = (s: number) => Math.round(s * FPS);
type Any = Record<string, any>;
const FADE = 0.3;

const useLT = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return {lt: f / FPS, d: durationInFrames / FPS};
};

const Clip: React.FC<{s: Any}> = ({s}) => {
  const {lt} = useLT();
  const o = s.fade ? eIO(prog(lt, 0, FADE)) : 1;
  return (
    <AbsoluteFill style={{opacity: o, transform: `scale(${s.z + 0.035 * Math.min(1, lt / Math.max(1, s.d))})`}}>
      <OffthreadVideo src={staticFile(`dono/${s.clip}.mp4`)} startFrom={fr(s.i)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

const Subs: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const c = (T.subs as Any[]).find((x) => t >= x.t && t < x.e);
  if (!c || t >= T.total) return null;
  const active = c.words.reduce((k: number, w: Any, i: number) => (t >= w.t - 0.02 ? i : k), -1);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1230, textAlign: 'center', fontFamily: DISPLAY, fontStretch: '108%', fontWeight: 750, fontSize: 62, lineHeight: 1.25, textTransform: 'uppercase'}}>
      {c.words.map((w: Any, i: number) => {
        const p = eO3(prog(t, w.t - 0.04, w.t + 0.18));
        const hot = i === active;
        return (
          <span key={i} style={{display: 'inline-block', margin: '4px 6px', padding: '2px 12px 4px', borderRadius: 10, background: hot ? ORO : 'transparent', color: hot ? NERO : w.g ? ORO_ACCESO : BIANCO, opacity: p, transform: `translateY(${(1 - p) * 8}px)`, textShadow: hot ? 'none' : '0 3px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 -2px 0 #000, 0 0 18px rgba(0,0,0,.7)'}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// apertura: etichetta della campagna + titolo
const Title: React.FC = () => {
  const {lt, d} = useLT();
  const a = eO3(prog(lt, 0, 0.7)), b = eO3(prog(lt, 0.35, 1.1));
  const out = eI3(prog(lt, d - 0.5, d));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 270, opacity: 1 - out}}>
      <div style={{display: 'inline-block', background: ORO, color: NERO, fontFamily: MONO, fontWeight: 600, fontSize: 28, letterSpacing: 5, padding: '7px 16px', opacity: a, transform: `translateY(${(1 - a) * 16}px)`}}>REGALIAMO UN'AUTO</div>
      <div style={{fontFamily: DISPLAY, fontStretch: '112%', fontWeight: 850, fontSize: 96, lineHeight: 1.02, color: BIANCO, marginTop: 14, opacity: b, transform: `translateY(${(1 - b) * 22}px)`, textShadow: '0 6px 30px rgba(0,0,0,.75), 0 2px 0 rgba(0,0,0,.6)'}}>
        Il giorno
        <br />
        della <span style={{color: ORO_ACCESO}}>consegna.</span>
      </div>
    </div>
  );
};

// consegna chiavi: tre conferme che si accendono quando vengono dette
const Checks: React.FC = () => {
  const {lt, d} = useLT();
  const out = eI3(prog(lt, d - 0.5, d));
  return (
    <div style={{position: 'absolute', left: 60, top: 280, display: 'flex', flexDirection: 'column', gap: 14, opacity: 1 - out}}>
      {(T.checks.items as Any[]).map((it, i) => {
        const at = it[1] - T.checks.s;
        const p = eO3(prog(lt, at, at + 0.5));
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, alignSelf: 'flex-start', background: 'rgba(10,10,10,.78)', borderLeft: `6px solid ${ORO}`, padding: '12px 24px 12px 18px', opacity: p, transform: `translateX(${(1 - p) * -30}px)`}}>
            <svg width={38} height={38} viewBox="0 0 24 24">
              <path d="M3 13 L9.5 19.5 L21 5" fill="none" stroke={ORO_ACCESO} strokeWidth={3.6} strokeLinecap="round" strokeDasharray={30} strokeDashoffset={30 * (1 - prog(lt, at + 0.15, at + 0.6))} />
            </svg>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 42, color: BIANCO}}>{it[0]}</div>
          </div>
        );
      })}
    </div>
  );
};

const End: React.FC = () => {
  const {lt} = useLT();
  const bg = eO3(prog(lt, 0, 0.9)), a = eO3(prog(lt, 0.3, 1.1)), b = eO3(prog(lt, 0.9, 1.7)), c = eO3(prog(lt, 1.5, 2.3));
  return (
    <AbsoluteFill style={{background: `rgba(10,10,10,${0.9 * bg})`}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(10,10,10,0) 0%, rgba(10,10,10,.55) 80%)', opacity: bg}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
        <Img src={staticFile('logo_neg_4x.png')} style={{width: 720}} />
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 900, textAlign: 'center', opacity: b, fontFamily: DISPLAY, fontStretch: '110%', fontWeight: 800, fontSize: 56, color: BIANCO, lineHeight: 1.2}}>
        Cambiamo la vita <span style={{color: ORO_ACCESO}}>di una famiglia.</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1080, textAlign: 'center', opacity: c, fontFamily: MONO, fontWeight: 600, fontSize: 26, letterSpacing: 3, color: '#bdb8ad'}}>STRADA TORINO 100 · CASELLE TORINESE</div>
    </AbsoluteFill>
  );
};

export const Movie: React.FC = () => {
  const segs = T.segs as Any[];
  return (
    <AbsoluteFill style={{background: NERO}}>
      <AbsoluteFill style={{filter: 'contrast(1.04) saturate(0.94) sepia(0.05)'}}>
        {segs.map((s, i) => {
          // la ripresa precedente resta sotto finché la nuova è in dissolvenza; l'ultima resta sotto la chiusura
          const hold = i + 1 < segs.length ? (segs[i + 1].fade ? FADE : 0) : T.dur - T.total;
          return (
            <Sequence key={i} from={fr(s.at)} durationInFrames={fr(s.at + s.d + hold) - fr(s.at)}>
              <Clip s={s} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.42) 100%)'}} />
      <Sequence from={fr(T.title.s)} durationInFrames={fr(T.title.e - T.title.s)}>
        <Title />
      </Sequence>
      <Sequence from={fr(T.checks.s)} durationInFrames={fr(T.checks.e - T.checks.s)}>
        <Checks />
      </Sequence>
      <Subs />
      <Sequence from={fr(T.total)} durationInFrames={fr(T.dur) - fr(T.total)}>
        <End />
      </Sequence>
    </AbsoluteFill>
  );
};
