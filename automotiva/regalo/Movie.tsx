import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import T from './timeline.json';
import {BIANCO, BODY, DISPLAY, MONO, NERO, ORO, ORO_ACCESO, eI3, eIO, eO3, lerp, prog} from '../a1/lib';

// Stile empatico: tagli morbidi, dettagli in dissolvenza, push-in lenti, sottotitoli calmi.
const FPS = T.fps;
const fr = (s: number) => Math.round(s * FPS);
type Any = Record<string, any>;
const FADE = 0.35;

const useLT = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return {lt: f / FPS, d: durationInFrames / FPS};
};

const Clip: React.FC<{src: string; from: number; rate?: number; z0: number; z1: number}> = ({src, from, rate = 1, z0, z1}) => {
  const {lt, d} = useLT();
  return (
    <AbsoluteFill style={{transform: `scale(${lerp(z0, z1, lt / d)})`}}>
      <OffthreadVideo src={staticFile(`rg/${src}.mp4`)} startFrom={fr(from)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

// dettaglio che entra ed esce in dissolvenza
const Soft: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {lt, d} = useLT();
  const o = Math.min(eIO(prog(lt, 0, FADE)), 1 - eIO(prog(lt, d - FADE, d)));
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const Subs: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const c = (T.subs as Any[]).find((x) => t >= x.t && t < x.e);
  if (!c || t >= T.total || t < T.title.e - 0.1) return null;
  const active = c.words.reduce((k: number, w: Any, i: number) => (t >= w.t - 0.02 ? i : k), -1);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1220, textAlign: 'center', fontFamily: DISPLAY, fontStretch: '108%', fontWeight: 750, fontSize: 64, lineHeight: 1.25, textTransform: 'uppercase'}}>
      {c.words.map((w: Any, i: number) => {
        const p = eO3(prog(t, w.t - 0.04, w.t + 0.18));
        const hot = i === active;
        return (
          <span key={i} style={{display: 'inline-block', margin: '4px 6px', padding: '2px 12px 4px', borderRadius: 10, background: hot ? ORO : 'transparent', color: hot ? NERO : w.g ? ORO_ACCESO : BIANCO, opacity: p, transform: `translateY(${(1 - p) * 8}px)`, textShadow: hot ? 'none' : '0 3px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 -2px 0 #000, 0 0 18px rgba(0,0,0,.7)', transition: 'none'}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// apertura: "GRATIS." grande, si stringe e lascia il posto ai sottotitoli
const Title: React.FC = () => {
  const {lt, d} = useLT();
  const a = eO3(prog(lt, 0.05, 0.6));
  const out = eI3(prog(lt, d - 0.35, d));
  return (
    <AbsoluteFill style={{background: `rgba(10,10,10,${0.35 * (1 - out)})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', opacity: a * (1 - out), transform: `scale(${lerp(1.12, 1, a) * (1 - out * 0.08)})`, letterSpacing: lerp(30, 10, a)}}>
        <div style={{fontFamily: DISPLAY, fontStretch: '125%', fontWeight: 900, fontSize: 170, color: BIANCO, textShadow: '0 8px 40px rgba(0,0,0,.6)'}}>GRATIS<span style={{color: ORO}}>.</span></div>
      </div>
    </AbsoluteFill>
  );
};

// card "raccontaci la tua storia"
const Story: React.FC = () => {
  const {lt, d} = useLT();
  const a = eO3(prog(lt, 0, 0.6));
  const o = 1 - eI3(prog(lt, d - 0.4, d));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 270, opacity: a * o, transform: `translateY(${(1 - a) * 24}px)`}}>
      <div style={{background: 'rgba(10,10,10,.8)', borderLeft: `6px solid ${ORO}`, padding: '24px 30px'}}>
        <div style={{fontFamily: MONO, fontSize: 25, letterSpacing: 5, color: ORO}}>REGALIAMO UN'AUTO</div>
        <div style={{fontFamily: DISPLAY, fontStretch: '112%', fontWeight: 800, fontSize: 58, color: BIANCO, lineHeight: 1.08, marginTop: 8}}>Raccontaci la tua storia</div>
        <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 34, color: '#e6e1d6', marginTop: 14, lineHeight: 1.35}}>
          DM Instagram · @automotiva_by_lunicamotors_srl
          <br />
          Mail · info@auto-motiva.it
        </div>
        <div style={{fontFamily: BODY, fontStyle: 'italic', fontSize: 28, color: '#b9b3a7', marginTop: 10}}>Ogni storia resta riservata.</div>
      </div>
    </div>
  );
};

const End: React.FC = () => {
  const {lt} = useLT();
  const a = eO3(prog(lt, 0, 0.8)), b = eO3(prog(lt, 0.6, 1.4)), c = eO3(prog(lt, 1.1, 1.9));
  return (
    <AbsoluteFill style={{background: NERO}}>
      <AbsoluteFill style={{opacity: 0.35 * a}}>
        <Clip src="9523" from={0.2} rate={0.6} z0={1.08} z1={1.14} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(10,10,10,.4) 0%, rgba(10,10,10,.92) 75%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center', opacity: a}}>
        <Img src={staticFile('logo_neg_4x.png')} style={{width: 720}} />
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 860, textAlign: 'center', opacity: b, fontFamily: DISPLAY, fontStretch: '110%', fontWeight: 800, fontSize: 54, color: BIANCO, lineHeight: 1.2}}>
        Cambiamo la vita <span style={{color: ORO_ACCESO}}>di una famiglia.</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1060, textAlign: 'center', opacity: c, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'}}>
        <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 36, color: '#e6e1d6'}}>Condividi questo video con chi ne ha bisogno.</div>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: '#bdb8ad', marginTop: 8}}>STRADA TORINO 100 · CASELLE TORINESE</div>
      </div>
    </AbsoluteFill>
  );
};

export const Movie: React.FC = () => (
  <AbsoluteFill style={{background: NERO}}>
    <AbsoluteFill style={{filter: 'contrast(1.04) saturate(0.92) sepia(0.06)'}}>
      {(T.segs as Any[]).map((s, i) => (
        <Sequence key={`s${i}`} from={fr(s.at)} durationInFrames={fr(s.o - s.i)}>
          <Clip src={s.clip} from={s.i} z0={1.0} z1={1.05} />
        </Sequence>
      ))}
      {(T.broll as Any[]).map((b, i) => (
        <Sequence key={`b${i}`} from={fr(b.s)} durationInFrames={Math.max(1, fr(b.e) - fr(b.s))}>
          <Soft>
            <Clip src={b.src} from={b.frm} rate={b.rate} z0={1.04} z1={1.1} />
          </Soft>
        </Sequence>
      ))}
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)'}} />
    <Sequence from={fr(T.title.s)} durationInFrames={fr(T.title.e - T.title.s)}>
      <Title />
    </Sequence>
    <Sequence from={fr(T.story.s)} durationInFrames={fr(T.story.e - T.story.s)}>
      <Story />
    </Sequence>
    <Subs />
    <Sequence from={fr(T.total)} durationInFrames={fr(T.dur - T.total)}>
      <Soft>
        <End />
      </Soft>
    </Sequence>
  </AbsoluteFill>
);
