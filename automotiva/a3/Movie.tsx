import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import T from './timeline.json';
import {BIANCO, BODY, DISPLAY, MONO, NERO, ORO, ORO_ACCESO, eBack, eI3, eO3, eO5, lerp, prog} from '../a1/lib';

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
  // karaoke: la parola detta ora sta nel box oro, le altre bianche; ogni parola entra con un rimbalzo
  const active = c.words.reduce((k: number, w: Any, i: number) => (t >= w.t - 0.02 ? i : k), -1);
  const blockIn = eBack(prog(t, c.t - 0.02, c.t + 0.16));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1210, textAlign: 'center', fontFamily: DISPLAY, fontStretch: '112%', fontWeight: 800, fontSize: 70, lineHeight: 1.25, textTransform: 'uppercase', transform: `scale(${lerp(0.85, 1, blockIn)})`}}>
      {c.words.map((w: Any, i: number) => {
        const p = prog(t, w.t - 0.02, w.t + 0.14);
        const on = p > 0;
        const pop = eBack(p, 2.4);
        const hot = i === active;
        return (
          <span key={i} style={{display: 'inline-block', margin: '4px 6px', padding: '2px 14px 4px', borderRadius: 10, background: hot ? ORO : 'transparent', color: hot ? NERO : w.g ? ORO_ACCESO : BIANCO, opacity: on ? 1 : 0.0, transform: `scale(${on ? lerp(1.35, 1, pop) : 0.8}) rotate(${hot ? -2 : 0}deg)`, textShadow: hot ? 'none' : '0 4px 0 #000, 3px 0 0 #000, -3px 0 0 #000, 0 -3px 0 #000, 0 0 20px rgba(0,0,0,.7)', boxShadow: hot ? '0 8px 0 #6E5512, 0 12px 30px rgba(0,0,0,.5)' : 'none'}}>
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

// entrata del dettaglio: whip orizzontale con mosso, zoom-punch, o slide verticale tra due dettagli
const In: React.FC<{tr: string; children: React.ReactNode}> = ({tr, children}) => {
  const {lt} = useLT();
  const p = eO5(prog(lt, 0, tr === 'zoom' ? 0.24 : 0.2));
  let transform = 'none', blur = 0, flash = 0;
  if (tr === 'whip' || tr === 'whipL') {
    transform = `translateX(${(1 - p) * (tr === 'whip' ? 1080 : -1080)}px) skewX(${(1 - p) * (tr === 'whip' ? -8 : 8)}deg)`;
    blur = (1 - p) * 34;
  } else if (tr === 'zoom') {
    transform = `scale(${lerp(1.45, 1, p)}) rotate(${(1 - p) * 3}deg)`;
    blur = (1 - p) * 22;
    flash = 1 - prog(lt, 0, 0.1);
  } else if (tr === 'slide') {
    transform = `translateY(${(1 - p) * 1920}px)`;
    blur = (1 - p) * 26;
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform, filter: blur > 0.3 ? `blur(${blur}px)` : 'none'}}>{children}</AbsoluteFill>
      {flash > 0 ? <AbsoluteFill style={{background: '#FFF6DE', opacity: flash * 0.55}} /> : null}
    </AbsoluteFill>
  );
};

// ritorno sul parlato: punch-out veloce (da 1.18 a 1) con un filo di mosso
const ret = (t: number) => {
  for (const r of T.rets as number[]) {
    const q = prog(t, r, r + 0.2);
    if (q > 0 && q < 1) return 1 - eO5(q);
  }
  return 0;
};

export const Movie: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const k = ret(t);
  return (
  <AbsoluteFill style={{background: NERO}}>
    <AbsoluteFill style={{filter: `contrast(1.06) saturate(0.95)${k > 0.02 ? ` blur(${k * 14}px)` : ''}`, transform: `scale(${1 + k * 0.18})`}}>
      {(T.segs as Any[]).map((s, i) => (
        <Sequence key={`s${i}`} from={fr(s.at)} durationInFrames={fr(s.o - s.i)}>
          <Clip src={s.clip} from={s.i} z0={i % 2 ? 1.08 : 1.0} z1={i % 2 ? 1.1 : 1.03} />
        </Sequence>
      ))}
      {(T.broll as Any[]).map((b, i) => (
        <Sequence key={`b${i}`} from={fr(b.s)} durationInFrames={Math.max(1, fr(b.e) - fr(b.s))}>
          <In tr={b.tr}>
            <Clip src={b.src} from={b.frm} rate={b.rate} z0={1.0} z1={1.06} />
          </In>
        </Sequence>
      ))}
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,.4) 100%)'}} />
    <Sequence from={fr(T.card.s)} durationInFrames={fr(T.card.e - T.card.s)}>
      <Card />
    </Sequence>
    <Subs />
    <Sequence from={fr(T.total)} durationInFrames={fr(T.dur - T.total)}>
      <In tr="zoom">
        <End />
      </In>
    </Sequence>
  </AbsoluteFill>
  );
};
