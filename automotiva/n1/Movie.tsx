import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import T from './timeline.json';
import {BIANCO, DISPLAY, MONO, NERO, ORO, ORO_ACCESO, ORO_CHIARO, eBack, eI3, eO3, eO5, lerp, prog, rnd} from '../a1/lib';

// Stile "virale" AutoMotiva: gancio a tempo, tagli con colpo di zoom, parole enormi oro/bianco,
// numeri che sbattono a schermo, tag a parallelogramma. Tutto in oro e nero.
const FPS = T.fps;
const fr = (s: number) => Math.round(s * FPS);
type Any = Record<string, any>;
const OUT = '0 5px 0 #000, 5px 0 0 #000, -5px 0 0 #000, 0 -5px 0 #000, 4px 4px 0 #000, -4px 4px 0 #000, 4px -4px 0 #000, -4px -4px 0 #000, 0 10px 26px rgba(0,0,0,.75)';

const useLT = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return {lt: f / FPS, d: durationInFrames / FPS};
};

const Clip: React.FC<{src: string; from: number; rate?: number; z0: number; z1: number}> = ({src, from, rate = 1, z0, z1}) => {
  const {lt, d} = useLT();
  return (
    <AbsoluteFill style={{transform: `scale(${lerp(z0, z1, lt / d)})`}}>
      <OffthreadVideo src={staticFile(`n1/${src}.mp4`)} startFrom={fr(from)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

// foto 4:3 a tutta altezza con carrellata orizzontale (x0→x1 = punto della foto al centro dello schermo)
const Photo: React.FC<{src: string; x0: number; x1: number; z0: number; z1: number}> = ({src, x0, x1, z0, z1}) => {
  const {lt, d} = useLT();
  const p = lt / d;
  const z = lerp(z0, z1, p);
  const w = 2560 * z, h = 1920 * z;
  const x = 540 - lerp(x0, x1, p) * w;
  return (
    <AbsoluteFill style={{background: NERO, overflow: 'hidden'}}>
      <Img src={staticFile(`n1/${src}.jpg`)} style={{position: 'absolute', width: w, height: h, left: Math.min(0, Math.max(1080 - w, x)), top: (1920 - h) / 2, maxWidth: 'none'}} />
    </AbsoluteFill>
  );
};

const Shot: React.FC<{b: Any}> = ({b}) => (b.kind === 'p' ? <Photo src={b.src} x0={b.x0} x1={b.x1} z0={b.z0} z1={b.z1} /> : <Clip src={b.src} from={b.frm} rate={b.rate} z0={1.0} z1={1.07} />);

// entrata dell'inserto: frustata orizzontale, colpo di zoom o scorrimento verticale
const In: React.FC<{tr: string; children: React.ReactNode}> = ({tr, children}) => {
  const {lt} = useLT();
  const p = eO5(prog(lt, 0, tr === 'zoom' ? 0.24 : 0.2));
  let transform = 'none', blur = 0, flash = 0;
  if (tr === 'whip' || tr === 'whipL') {
    transform = `translateX(${(1 - p) * (tr === 'whip' ? 1080 : -1080)}px) skewX(${(1 - p) * (tr === 'whip' ? -8 : 8)}deg)`;
    blur = (1 - p) * 34;
  } else if (tr === 'zoom') {
    transform = `scale(${lerp(1.5, 1, p)}) rotate(${(1 - p) * 3}deg)`;
    blur = (1 - p) * 22;
    flash = 1 - prog(lt, 0, 0.1);
  } else if (tr === 'slide') {
    transform = `translateY(${(1 - p) * 1920}px)`;
    blur = (1 - p) * 26;
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform, filter: blur > 0.3 ? `blur(${blur}px)` : 'none'}}>{children}</AbsoluteFill>
      {flash > 0 ? <AbsoluteFill style={{background: '#FFF6DE', opacity: flash * 0.5}} /> : null}
    </AbsoluteFill>
  );
};

// ---------- gancio: tre inquadrature a tempo, frase su due righe ----------
const HookShot: React.FC<{h: Any; i: number}> = ({h, i}) => {
  const {lt, d} = useLT();
  const punch = 1 - eO5(prog(lt, 0, 0.28));
  const a = eBack(prog(lt, 0.02, 0.26), 2.2), b = eBack(prog(lt, 0.14, 0.4), 2.2);
  const out = i === 2 ? eI3(prog(lt, d - 0.14, d)) : 0;
  const line = (txt: string, p: number, gold: boolean, size: number) => (
    <div style={{fontFamily: DISPLAY, fontStretch: '118%', fontWeight: 900, fontSize: size, lineHeight: 0.98, letterSpacing: -2, color: gold ? ORO_ACCESO : BIANCO, textShadow: OUT, opacity: p > 0 ? 1 : 0, transform: `translateY(${(1 - Math.min(1, p)) * 70}px) scale(${lerp(1.5, 1, p)})`, whiteSpace: 'nowrap'}}>{txt}</div>
  );
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: NERO}}>
      <AbsoluteFill style={{transform: `scale(${1.04 + punch * 0.22})`, filter: `brightness(.78) contrast(1.12)${punch > 0.05 ? ` blur(${punch * 10}px)` : ''}`}}>
        <Shot b={h} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,.55) 100%)'}} />
      <AbsoluteFill style={{background: '#FFF6DE', opacity: (1 - prog(lt, 0, 0.09)) * 0.6}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `rotate(-3deg) skewX(-6deg) scale(${1 - out * 0.2})`, opacity: 1 - out}}>
        {line(h.text[0], a, false, 128)}
        {line(h.text[1], b, true, h.text[1].length > 10 ? 124 : h.text[1].length > 7 ? 134 : 170)}
      </div>
    </AbsoluteFill>
  );
};

// ---------- sottotitoli: 1-3 parole enormi, la parola detta diventa oro e cresce ----------
const Subs: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const k = (T.subs as Any[]).findIndex((x) => t >= x.t && t < x.e);
  if (k < 0 || t >= T.total) return null;
  const c = (T.subs as Any[])[k];
  const active = c.words.reduce((q: number, w: Any, i: number) => (t >= w.t - 0.03 ? i : q), 0);
  const pin = eBack(prog(t, c.t - 0.03, c.t + 0.15), 2.6);
  const len = c.words.reduce((n: number, w: Any) => n + w.w.length + 1, 0);
  const size = len > 17 ? 78 : len > 15 ? 74 : len > 14 ? 86 : len > 11 ? 96 : 112;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1215, height: 250, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontStretch: '108%', fontWeight: 900, fontSize: size, lineHeight: 1.06, letterSpacing: -1, textTransform: 'uppercase', transform: `rotate(${k % 2 ? 1.6 : -1.6}deg) skewX(-5deg) scale(${lerp(0.72, 1, pin)})`}}>
      {c.words.map((w: Any, i: number) => {
        const hot = i === active;
        const p = eBack(prog(t, w.t - 0.03, w.t + 0.13), 2.8);
        const seen = t >= w.t - 0.03;
        return (
          <span key={i} style={{display: 'inline-block', whiteSpace: 'nowrap', margin: '0 24px', color: hot ? ORO_ACCESO : seen ? BIANCO : 'rgba(246,244,238,.55)', textShadow: OUT, transform: `scale(${hot ? lerp(1.0, 1.12, p) : 1}) translateY(${hot ? -4 : 0}px)`}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ---------- numero che sbatte a schermo, con contatore ----------
const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const Num: React.FC<{f: Any}> = ({f}) => {
  const {lt, d} = useLT();
  const p = eO5(prog(lt, 0, 0.22));
  const out = eI3(prog(lt, d - 0.16, d));
  const n = lerp(f.frm, f.n, eO3(prog(lt, 0.02, f.big ? 0.75 : 0.42)));
  const size = f.big ? 250 : 330;
  const echo = (o: number, dy: number) => (
    <div style={{position: 'absolute', left: 0, top: dy, color: 'transparent', WebkitTextStroke: `3px rgba(215,182,72,${o})`}}>{fmt(n)}</div>
  );
  return (
    <div style={{position: 'absolute', left: 56, right: 40, top: 250, opacity: (p > 0 ? 1 : 0) * (1 - out), transform: `rotate(-4deg) skewX(-6deg) scale(${lerp(2.4, 1, p) * (1 - out * 0.15)})`, transformOrigin: '30% 50%', filter: p < 0.95 ? `blur(${(1 - p) * 16}px)` : 'none'}}>
      <div style={{display: 'inline-block', background: ORO, color: NERO, fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: 5, padding: '6px 16px 6px 18px'}}>{f.label}</div>
      <div style={{position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 18, marginTop: 4, fontFamily: DISPLAY, fontStretch: f.big ? '100%' : '112%', fontWeight: 900, fontSize: size, lineHeight: 0.92, letterSpacing: -6}}>
        <div style={{position: 'relative'}}>
          {echo(0.5, 16)}
          {echo(0.22, 32)}
          <div style={{position: 'relative', color: ORO_ACCESO, textShadow: '0 8px 0 #000, 6px 0 0 #000, -6px 0 0 #000, 0 -6px 0 #000, 0 18px 40px rgba(0,0,0,.8)'}}>{fmt(n)}</div>
        </div>
        <div style={{fontSize: f.unit.length > 2 ? 92 : 130, letterSpacing: -1, color: BIANCO, textShadow: OUT, paddingBottom: f.unit.length > 2 ? 26 : 30}}>{f.unit}</div>
      </div>
    </div>
  );
};

const DateFx: React.FC<{f: Any}> = ({f}) => {
  const {lt, d} = useLT();
  const p = eO5(prog(lt, 0, 0.22)), p2 = eBack(prog(lt, 0.5, 0.74), 2.2);
  const out = eI3(prog(lt, d - 0.16, d));
  return (
    <div style={{position: 'absolute', left: 56, right: 40, top: 250, opacity: (p > 0 ? 1 : 0) * (1 - out), transform: `rotate(-4deg) skewX(-6deg) scale(${lerp(2.2, 1, p)})`, transformOrigin: '30% 50%', filter: p < 0.95 ? `blur(${(1 - p) * 16}px)` : 'none'}}>
      <div style={{display: 'inline-block', background: ORO, color: NERO, fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: 5, padding: '6px 16px 6px 18px'}}>{f.label}</div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 4, fontFamily: DISPLAY, fontStretch: '108%', fontWeight: 900, fontSize: 250, lineHeight: 0.95, letterSpacing: -6}}>
        <span style={{color: BIANCO, textShadow: OUT}}>{f.a}</span>
        <span style={{color: ORO, textShadow: OUT, fontSize: 200}}>/</span>
        <span style={{color: ORO_ACCESO, textShadow: OUT, display: 'inline-block', opacity: p2 > 0 ? 1 : 0, transform: `scale(${lerp(1.5, 1, p2)})`, transformOrigin: '0 80%'}}>{f.b}</span>
      </div>
    </div>
  );
};

// ---------- tag a parallelogramma (oro pieno / nero bordato), con eventuale titolo sopra ----------
const Tag: React.FC<{txt: string; at: number; i: number; check?: boolean; size?: number}> = ({txt, at, i, check, size = 56}) => {
  const {lt, d} = useLT();
  const p = eBack(prog(lt, at, at + 0.24), 1.7);
  const out = eI3(prog(lt, d - 0.16 + i * 0.02, d));
  const gold = i % 2 === 0;
  return (
    <div style={{alignSelf: 'flex-start', opacity: lt >= at ? 1 - out : 0, transform: `translateX(${(1 - Math.min(p, 1.06)) * -700 - out * 300}px) skewX(-12deg)`, background: gold ? ORO : NERO, border: `4px solid ${ORO}`, padding: '8px 30px 10px 26px', boxShadow: '10px 10px 0 rgba(0,0,0,.55)'}}>
      <div style={{transform: 'skewX(12deg)', display: 'flex', alignItems: 'center', gap: 16, fontFamily: DISPLAY, fontStretch: '110%', fontWeight: 900, fontSize: size, letterSpacing: 0.5, color: gold ? NERO : ORO_CHIARO, whiteSpace: 'nowrap'}}>
        {check ? (
          <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24">
            <path d="M3 13 L9.5 19.5 L21 5" fill="none" stroke={gold ? NERO : ORO_ACCESO} strokeWidth={4.4} strokeLinecap="square" strokeDasharray={30} strokeDashoffset={30 * (1 - prog(lt, at + 0.1, at + 0.3))} />
          </svg>
        ) : null}
        {txt}
      </div>
    </div>
  );
};

const Head: React.FC<{a: string; b?: string; label?: string}> = ({a, b, label}) => {
  const {lt, d} = useLT();
  const p = eO5(prog(lt, 0, 0.24)), p2 = eO5(prog(lt, 0.12, 0.36));
  const out = eI3(prog(lt, d - 0.18, d));
  return (
    <div style={{opacity: 1 - out, marginBottom: 8}}>
      {label ? <div style={{display: 'inline-block', background: ORO, color: NERO, fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: 5, padding: '6px 16px 6px 18px', opacity: p}}>{label}</div> : null}
      {a ? <div style={{fontFamily: DISPLAY, fontStretch: '120%', fontWeight: 900, fontSize: 150, lineHeight: 0.95, letterSpacing: -3, color: BIANCO, textShadow: OUT, opacity: p > 0 ? 1 : 0, transform: `translateX(${(1 - p) * -500}px)`, whiteSpace: 'nowrap'}}>{a}</div> : null}
      {b ? <div style={{fontFamily: DISPLAY, fontStretch: '120%', fontWeight: 900, fontSize: 104, lineHeight: 1, letterSpacing: -2, color: ORO_ACCESO, textShadow: OUT, opacity: p2 > 0 ? 1 : 0, transform: `translateX(${(1 - p2) * 500}px)`, whiteSpace: 'nowrap'}}>{b}</div> : null}
    </div>
  );
};

const Block: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: 56, top: 250, display: 'flex', flexDirection: 'column', gap: 18, transform: 'rotate(-3deg)', transformOrigin: '0 0'}}>{children}</div>
);

// archi "sonar" dei sensori di parcheggio
const Sonar: React.FC = () => {
  const {lt, d} = useLT();
  const out = eI3(prog(lt, d - 0.18, d));
  return (
    <svg width={520} height={190} viewBox="0 0 520 190" style={{opacity: (1 - out) * prog(lt, 0, 0.15), marginBottom: -6, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.8))'}}>
      {[0, 1, 2, 3].map((i) => {
        const ph = (lt * 1.6 + i * 0.25) % 1;
        const r = 40 + ph * 210;
        return <path key={i} d={`M ${40} ${180 - r * 0.0} m 0 0 M ${30 + r * 0.5} ${185 - r * 0.86} A ${r} ${r} 0 0 1 ${30 + r} 185`} fill="none" stroke={ORO_ACCESO} strokeWidth={lerp(12, 4, ph)} strokeLinecap="round" opacity={(1 - ph) * 0.95} />;
      })}
      <circle cx={30} cy={185} r={12} fill={ORO_ACCESO} />
    </svg>
  );
};

const Fx: React.FC<{f: Any}> = ({f}) => {
  const rel = (it: Any[]) => it[1] - f.s;
  if (f.k === 'num') return <Num f={f} />;
  if (f.k === 'date') return <DateFx f={f} />;
  if (f.k === 'title')
    return (
      <Block>
        <Head a={f.a} b={f.b} />
        {f.tags.map((it: Any[], i: number) => <Tag key={i} txt={it[0]} at={rel(it)} i={i} />)}
      </Block>
    );
  if (f.k === 'sline')
    return (
      <Block>
        <Head a="S LINE" />
        {f.items.map((it: Any[], i: number) => <Tag key={i} txt={it[0]} at={rel(it)} i={i} check />)}
      </Block>
    );
  if (f.k === 'sonar')
    return (
      <Block>
        <Sonar />
        <Head a="" label="SENSORI DI PARCHEGGIO" />
        {f.items.map((it: Any[], i: number) => <Tag key={i} txt={it[0]} at={rel(it)} i={i} check />)}
      </Block>
    );
  return (
    <Block>
      {f.items.map((it: Any[], i: number) => <Tag key={i} txt={it[0]} at={rel(it)} i={i} check={f.k === 'stack'} size={it[0].length > 16 ? 46 : 56} />)}
    </Block>
  );
};

const End: React.FC = () => {
  const {lt} = useLT();
  const a = eO3(prog(lt, 0.05, 0.5)), b = eBack(prog(lt, 0.3, 0.62), 1.8), c = eO3(prog(lt, 0.75, 1.2));
  return (
    <AbsoluteFill style={{background: NERO}}>
      <AbsoluteFill style={{opacity: 0.5}}>
        <Photo src="p_01" x0={0.36} x1={0.4} z0={1.04} z1={1.12} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(10,10,10,.35) 0%, rgba(10,10,10,.93) 72%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
        <Img src={staticFile('logo_neg_4x.png')} style={{width: 740}} />
      </div>
      <div style={{position: 'absolute', left: 30, right: 30, top: 850, textAlign: 'center', opacity: b > 0 ? 1 : 0, transform: `rotate(-2deg) skewX(-5deg) scale(${lerp(1.5, 1, b)})`, fontFamily: DISPLAY, fontStretch: '112%', fontWeight: 900, fontSize: 66, color: BIANCO, lineHeight: 1.08, letterSpacing: -1, textTransform: 'uppercase', textShadow: OUT, whiteSpace: 'nowrap'}}>
        Questa non la trovi
        <br />
        <span style={{color: ORO_ACCESO, fontSize: 124}}>due volte.</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1130, textAlign: 'center', opacity: c, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center'}}>
        <div style={{transform: 'skewX(-12deg)', background: ORO, padding: '10px 30px 12px'}}>
          <div style={{transform: 'skewX(12deg)', fontFamily: DISPLAY, fontStretch: '110%', fontWeight: 900, fontSize: 52, color: NERO}}>WhatsApp 388 355 7181</div>
        </div>
        <div style={{fontFamily: MONO, fontWeight: 600, fontSize: 26, letterSpacing: 3, color: '#cfc9bd'}}>STRADA TORINO 100 · CASELLE TORINESE</div>
      </div>
    </AbsoluteFill>
  );
};

// colpo di zoom a ogni taglio del parlato e al rientro dagli inserti; scossa quando sbatte un numero
const CUTS: number[] = [...(T.segs as Any[]).map((s) => s.at), ...(T.rets as number[])];
const SLAMS: number[] = (T.fx as Any[]).filter((f) => f.k === 'num' || f.k === 'date').map((f) => f.s);
const punchAt = (t: number) => {
  let k = 0;
  for (const c of CUTS) {
    const q = prog(t, c, c + 0.22);
    if (q > 0 && q < 1) k = Math.max(k, 1 - eO5(q));
  }
  return k;
};
const shakeAt = (t: number) => {
  for (const s of SLAMS) {
    const q = prog(t, s + 0.12, s + 0.42);
    if (q > 0 && q < 1) {
      const r = rnd(Math.round(t * FPS) * 7919);
      return {x: (r() - 0.5) * 34 * (1 - q), y: (r() - 0.5) * 34 * (1 - q)};
    }
  }
  return {x: 0, y: 0};
};

export const Movie: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const k = punchAt(t);
  const sh = shakeAt(t);
  return (
    <AbsoluteFill style={{background: NERO}}>
      <AbsoluteFill style={{filter: `contrast(1.08) saturate(1.04) brightness(1.02)${k > 0.04 ? ` blur(${k * 9}px)` : ''}`, transform: `translate(${sh.x}px, ${sh.y}px) scale(${1.02 + k * 0.12})`}}>
        {(T.segs as Any[]).map((s, i) => (
          <Sequence key={`s${i}`} from={fr(s.at)} durationInFrames={fr(s.at + s.o - s.i) - fr(s.at)}>
            <Clip src={s.clip} from={s.i} z0={s.z} z1={s.z + 0.04} />
          </Sequence>
        ))}
        {(T.broll as Any[]).map((b, i) => (
          <Sequence key={`b${i}`} from={fr(b.s)} durationInFrames={Math.max(1, fr(b.e) - fr(b.s))}>
            <In tr={b.tr}>
              <Shot b={b} />
            </In>
          </Sequence>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.34) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 52%, rgba(0,0,0,.42) 100%)'}} />
      {(T.hook as Any[]).map((h, i) => (
        <Sequence key={`h${i}`} from={fr(h.s)} durationInFrames={fr(h.e) - fr(h.s)}>
          <HookShot h={h} i={i} />
        </Sequence>
      ))}
      {(T.fx as Any[]).map((f, i) => (
        <Sequence key={`f${i}`} from={fr(f.s)} durationInFrames={Math.max(1, fr(f.e) - fr(f.s))}>
          <Fx f={f} />
        </Sequence>
      ))}
      <Subs />
      <Sequence from={fr(T.total)} durationInFrames={fr(T.dur) - fr(T.total)}>
        <In tr="zoom">
          <End />
        </In>
      </Sequence>
      {/* barra di avanzamento oro */}
      <div style={{position: 'absolute', left: 0, top: 0, height: 8, width: `${(t / T.dur) * 100}%`, background: ORO_ACCESO}} />
    </AbsoluteFill>
  );
};
