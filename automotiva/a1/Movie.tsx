import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import T from './timeline.json';
import {Big, End, Km, Label, Place, Pop, Spec, Stamp, Sweep, Tag, Title, VS, Wa, useLT} from './gfx';
import {BIANCO, BODY, NERO, ORO_ACCESO, clamp, eI3, eO3, eO5, lerp, prog} from './lib';

const FPS = T.fps;
const fr = (s: number) => Math.round(s * FPS);
type Any = Record<string, any>;

// ─────────── base: il venditore che parla (jump cut alternati con punch-in)
const Seg: React.FC<{s: Any; i: number}> = ({s, i}) => {
  const {lt, d} = useLT();
  const z = i % 3 === 1 ? 1.1 : i % 3 === 2 ? 1.04 : 1.0;
  const drift = lerp(0, 0.025, lt / Math.max(d, 1));
  return (
    <AbsoluteFill style={{transform: `scale(${z + drift})`}}>
      <OffthreadVideo src={staticFile(`a1/${s.clip}.mp4`)} startFrom={fr(s.in)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

// ─────────── B-roll a tutto schermo
const Broll: React.FC<{b: Any}> = ({b}) => {
  const {lt, d} = useLT();
  const p = lt / d;
  const sc = lerp(b.zoom[0], b.zoom[1], p);
  const ox = b.origin ? `${b.origin[0] * 100}% ${b.origin[1] * 100}%` : '50% 50%';
  let tx = 0, blur = 0, flash = 0, bars = 0;
  if (b.fx === 'whip') {
    const q = eO5(prog(lt, 0, 0.22));
    tx = (1 - q) * 1080;
    blur = (1 - q) * 30;
  }
  if (b.fx === 'flash') flash = 1 - prog(lt, 0, 0.16);
  if (b.fx === 'cine') bars = Math.min(eO3(prog(lt, 0, 0.3)), 1 - eI3(prog(lt, d - 0.25, d)));
  const outBlur = prog(lt, d - 0.08, d) * 14;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translateX(${tx}px) scale(${sc})`, transformOrigin: ox, filter: `blur(${blur + outBlur}px)`}}>
        <OffthreadVideo src={staticFile(`a1/${b.src}.mp4`)} startFrom={fr(b.frm)} playbackRate={b.rate ?? 1} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      {b.dim ? <AbsoluteFill style={{background: `rgba(10,10,10,${b.dim})`}} /> : null}
      {b.fx === 'sweep' ? <Sweep t0={0} dur={0.6} /> : null}
      {flash > 0 ? <AbsoluteFill style={{background: '#fff8e6', opacity: flash * 0.9}} /> : null}
      {bars > 0 ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 230 * bars, background: NERO}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 230 * bars, background: NERO}} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────── sottotitoli parola per parola
const Subs: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const c = (T.subs as Any[]).find((x) => t >= x.t && t < x.e);
  if (!c || t >= T.total) return null;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1150, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 76, lineHeight: 1.12, textTransform: 'uppercase'}}>
      {c.words.map((w: Any, i: number) => {
        const on = prog(t, w.t - 0.03, w.t + 0.1);
        const s = lerp(0.8, 1, eO5(on));
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 12px', color: w.g ? ORO_ACCESO : BIANCO, opacity: on > 0 ? 1 : 0.0, transform: `scale(${s}) translateY(${(1 - eO5(on)) * 16}px)`, textShadow: '0 4px 0 rgba(0,0,0,.85), 0 0 22px rgba(0,0,0,.75), 3px 0 0 #000, -3px 0 0 #000, 0 -3px 0 #000'}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ─────────── scossa sui colpi di basso
const HITS = (T.sfx as Any[]).filter((s) => s.n === 'bass_hit' || s.n === 'stamp' || s.n === 'engine').map((s) => s.t);
const shakeAt = (t: number) => {
  let x = 0, y = 0;
  for (const h of HITS) {
    const dt = t - h - 0.02;
    if (dt < 0 || dt > 0.35) continue;
    const a = Math.exp(-dt * 14) * 16;
    x += Math.sin(dt * 95) * a;
    y += Math.cos(dt * 80) * a * 0.6;
  }
  return {x, y};
};

const G: Record<string, React.FC<any>> = {tag: Tag, title: Title, big: Big, label: Label, pop: Pop, vs: VS, km: Km, stamp: Stamp, spec: Spec, place: Place, wa: Wa, end: End};

export const Movie: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const sh = shakeAt(t);
  return (
    <AbsoluteFill style={{background: NERO}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(1.03)`, filter: 'contrast(1.1) saturate(0.88) brightness(0.96)'}}>
        {(T.segs as Any[]).map((s, i) => (
          <Sequence key={`s${i}`} from={fr(s.at)} durationInFrames={fr(s.out - s.in)}>
            <Seg s={s} i={i} />
          </Sequence>
        ))}
        {(T.broll as Any[]).map((b, i) => (
          <Sequence key={`b${i}`} from={fr(b.s)} durationInFrames={Math.max(1, fr(b.e) - fr(b.s))}>
            <Broll b={b} />
          </Sequence>
        ))}
      </AbsoluteFill>
      {/* grade: luci calde, vignetta */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(215,182,72,.10) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,.35) 100%)', mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
      {(T.g as Any[]).map((g, i) => {
        const C = G[g.k];
        const dur = Math.max(1, fr(g.e) - fr(g.s));
        const extra = g.k === 'stamp' ? fr(1.0) : 0;
        return (
          <Sequence key={`g${i}`} from={fr(g.s)} durationInFrames={dur + extra}>
            <C {...g} {...(g.k === 'vs' ? {rival: g.rival - g.s, same: g.same - g.s} : {})} />
          </Sequence>
        );
      })}
      <Subs />
      {/* micro-flash sui tagli dei B-roll */}
      {(T.broll as Any[]).map((b, i) => {
        const d = t - b.s;
        if (d < 0 || d > 0.1) return null;
        return <AbsoluteFill key={`f${i}`} style={{background: '#000', opacity: (1 - d / 0.1) * 0.25}} />;
      })}
    </AbsoluteFill>
  );
};
