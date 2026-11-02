import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import T from './timeline.json';
import {BIANCO, BODY, DISPLAY, MONO, NERO, ORO, ORO_ACCESO, eI3, eO3, eO5, lerp, prog} from '../a1/lib';

// Stile sobrio: tagli netti, leggero push-in, sottotitoli puliti, una card dati, chiusura.
const FPS = T.fps;
const fr = (s: number) => Math.round(s * FPS);
type Any = Record<string, any>;

const useLT = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return {lt: f / FPS, d: durationInFrames / FPS};
};

const Clip: React.FC<{src: string; from: number; rate?: number; z0: number; z1: number}> = ({src, from, rate = 1, z0, z1}) => {
  const {lt, d} = useLT();
  return (
    <AbsoluteFill style={{transform: `scale(${lerp(z0, z1, lt / d)})`}}>
      <OffthreadVideo src={staticFile(`a3/${src}.mp4`)} startFrom={fr(from)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

const Subs: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const c = (T.subs as Any[]).find((x) => t >= x.t && t < x.e);
  if (!c || t >= T.total) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1230, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 68, lineHeight: 1.15}}>
      {c.words.map((w: Any, i: number) => {
        const on = eO5(prog(t, w.t - 0.02, w.t + 0.08));
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 10px', color: w.g ? ORO_ACCESO : BIANCO, opacity: on > 0 ? 1 : 0, transform: `translateY(${(1 - on) * 10}px)`, textShadow: '0 3px 0 rgba(0,0,0,.8), 0 0 18px rgba(0,0,0,.7), 2px 0 0 #000, -2px 0 0 #000, 0 -2px 0 #000'}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

const Card: React.FC = () => {
  const {lt, d} = useLT();
  const p = eO3(prog(lt, 0, 0.3));
  const o = 1 - eI3(prog(lt, d - 0.25, d));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 300, opacity: p * o, transform: `translateY(${(1 - p) * 30}px)`}}>
      <div style={{background: 'rgba(10,10,10,.82)', borderLeft: `6px solid ${ORO}`, padding: '22px 28px'}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 5, color: ORO}}>AUDI A3 SPORTBACK · S LINE</div>
        <div style={{fontFamily: DISPLAY, fontStretch: '115%', fontWeight: 800, fontSize: 60, color: BIANCO, marginTop: 6, lineHeight: 1.05}}>2024 · 150 CV · 26.000 KM</div>
        <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 32, color: '#cfc9bd', marginTop: 6}}>1.5 TFSI mild hybrid · Identity Black</div>
      </div>
    </div>
  );
};

const End: React.FC = () => {
  const {lt} = useLT();
  const a = eO3(prog(lt, 0, 0.5)), b = eO3(prog(lt, 0.35, 0.85)), c = eO3(prog(lt, 0.6, 1.1));
  return (
    <AbsoluteFill>
      <Clip src="9310" from={0.1} z0={1.05} z1={1.12} />
      <AbsoluteFill style={{background: `rgba(10,10,10,${0.78 * a})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
        <Img src={staticFile('logo_neg_4x.png')} style={{width: 760}} />
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 900, textAlign: 'center', opacity: b, fontFamily: DISPLAY, fontStretch: '115%', fontWeight: 800, fontSize: 56, color: BIANCO, lineHeight: 1.15}}>
        Questa non la trovi <span style={{color: ORO_ACCESO}}>due volte.</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1080, textAlign: 'center', opacity: c, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'}}>
        <div style={{fontFamily: DISPLAY, fontStretch: '115%', fontWeight: 800, fontSize: 48, color: BIANCO, border: `2px solid ${ORO}`, padding: '10px 24px'}}>WhatsApp 388 355 7181</div>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: '#bdb8ad'}}>STRADA TORINO 100 · CASELLE TORINESE</div>
      </div>
    </AbsoluteFill>
  );
};

export const Movie: React.FC = () => (
  <AbsoluteFill style={{background: NERO}}>
    <AbsoluteFill style={{filter: 'contrast(1.06) saturate(0.95)'}}>
      {(T.segs as Any[]).map((s, i) => (
        <Sequence key={`s${i}`} from={fr(s.at)} durationInFrames={fr(s.o - s.i)}>
          <Clip src={s.clip} from={s.i} z0={i % 2 ? 1.08 : 1.0} z1={i % 2 ? 1.1 : 1.03} />
        </Sequence>
      ))}
      {(T.broll as Any[]).map((b, i) => (
        <Sequence key={`b${i}`} from={fr(b.s)} durationInFrames={Math.max(1, fr(b.e) - fr(b.s))}>
          <Clip src={b.src} from={b.frm} rate={b.rate} z0={1.0} z1={1.06} />
        </Sequence>
      ))}
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,.4) 100%)'}} />
    <Sequence from={fr(T.card.s)} durationInFrames={fr(T.card.e - T.card.s)}>
      <Card />
    </Sequence>
    <Subs />
    <Sequence from={fr(T.total)} durationInFrames={fr(T.dur - T.total)}>
      <End />
    </Sequence>
  </AbsoluteFill>
);
