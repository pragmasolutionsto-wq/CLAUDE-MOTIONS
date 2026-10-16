import React, {createContext, useContext, useMemo} from 'react';
import {AbsoluteFill, getInputProps, useCurrentFrame} from 'remotion';
import {PERSP, project, resetStore, store, type V3} from './store';
import {BoxCanvas, ParticleCanvas} from './overlay';

export {PERSP, project, store};
export type {V3};

export const DBG: Record<string, any> = (() => {
  try {
    return getInputProps() as Record<string, any>;
  } catch {
    return {};
  }
})();

/* ============ tempo ============ */
export const FPS = 120; // render a 120fps, ffmpeg ricampiona a 30 con motion blur vero

const TCtx = createContext(0);
export const TProvider = TCtx.Provider;
export const useT = () => useContext(TCtx);
export const useFrameT = () => useCurrentFrame() / FPS;

/* ============ utilità numeriche ============ */
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const E = {
  lin: (t: number) => t,
  in3: (t: number) => t * t * t,
  out3: (t: number) => 1 - Math.pow(1 - t, 3),
  out5: (t: number) => 1 - Math.pow(1 - t, 5),
  inOut3: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOut5: (t: number) => (t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2),
  expoOut: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  expoIn: (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  back: (t: number, s = 1.9) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  /** oscillazione smorzata che termina a 1 (elastico controllato) */
  settle: (t: number) => (t >= 1 ? 1 : 1 - Math.exp(-7 * t) * Math.cos(t * 17)),
};

/** tween: da 0 a 1 in `d` secondi a partire da `a` */
export const tw = (t: number, a: number, d: number, f: (x: number) => number = E.out5) => f(clamp((t - a) / d));

/** rumore fluido pseudo-casuale in [-1,1] */
export const noise = (t: number, seed = 0) =>
  (Math.sin(t * 1.7 + seed * 12.9) + Math.sin(t * 2.9 + seed * 7.3) * 0.6 + Math.sin(t * 5.3 + seed * 3.1) * 0.35) / 1.95;

/** random deterministico */
export const rnd = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, t));
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
};

/* ============ misura testo (canvas) ============ */
let _ctx: CanvasRenderingContext2D | null = null;
export const measure = (text: string, family: string, weight: number, size: number, italic = false) => {
  if (!_ctx) _ctx = document.createElement('canvas').getContext('2d');
  _ctx!.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`;
  return _ctx!.measureText(text).width;
};

/* ============ camera ============ */
export type CamKey = {t: number; p: V3; r?: V3; hold?: boolean; cut?: boolean};

const hermite = (u: number, dt: number, p0: number, p1: number, m0: number, m1: number) => {
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * dt * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * dt * m1;
};

export const camAt = (keys: CamKey[], t: number): {p: V3; r: V3} => {
  const n = keys.length;
  if (t <= keys[0].t) return {p: keys[0].p, r: keys[0].r ?? [0, 0, 0]};
  if (t >= keys[n - 1].t) return {p: keys[n - 1].p, r: keys[n - 1].r ?? [0, 0, 0]};
  let i = 0;
  while (i < n - 2 && t >= keys[i + 1].t) i++;
  const k0 = keys[i];
  const k1 = keys[i + 1];
  if (k1.cut) return {p: k0.p, r: k0.r ?? [0, 0, 0]};
  const km = keys[i - 1];
  const kp = keys[i + 2];
  const dt = k1.t - k0.t;
  const u = (t - k0.t) / dt;
  const get = (k: CamKey, c: number, isR: boolean) => (isR ? (k.r ?? [0, 0, 0])[c] : k.p[c]);
  const comp = (c: number, isR: boolean) => {
    const p0 = get(k0, c, isR);
    const p1 = get(k1, c, isR);
    const m0 = km && !k0.hold && !k0.cut ? (p1 - get(km, c, isR)) / (k1.t - km.t) : 0;
    const m1 = kp && !k1.hold && !kp.cut ? (get(kp, c, isR) - p0) / (kp.t - k0.t) : 0;
    return hermite(u, dt, p0, p1, m0, m1);
  };
  return {p: [comp(0, false), comp(1, false), comp(2, false)], r: [comp(0, true), comp(1, true), comp(2, true)]};
};

type BgKey = {t: number; c: string};
const bgAt = (keys: BgKey[], t: number) => {
  let c = keys[0].c;
  for (const k of keys) if (t >= k.t) c = k.c;
  return c;
};

export type Flood = {t: number; d: number; cx: number; cy: number; color: string};
export type Film = {
  cam: CamKey[];
  bg: BgKey[];
  floods?: Flood[];
  impacts?: number[]; // secondi: colpi di camera shake
  fade?: {t: number; d: number; color: string}; // dissolvenza finale
  glow?: string; // colore dei bagliori di sfondo
  bgSets?: {ox: number; color: string}[]; // colore di fondo di ogni set (strisce 2D con parallasse)
};

/* ============ il film: camera + sfondo + flood ============ */
export const FilmStage: React.FC<{film: Film; children: React.ReactNode}> = ({film, children}) => {
  const t = useFrameT();
  const cam = camAt(film.cam, t);
  const prev = camAt(film.cam, t - 1 / FPS);
  const next = camAt(film.cam, t + 1 / FPS);

  // camera shake: respiro continuo + impatti
  let sh = 0.6;
  for (const im of film.impacts ?? []) {
    const a = t - im;
    if (a > 0 && a < 1.2) sh += 26 * Math.exp(-a * 6.5);
  }
  const sx = noise(t * 3.1, 1) * sh;
  const sy = noise(t * 2.7, 2) * sh;
  const sr = noise(t * 2.2, 3) * sh * 0.05;

  const [x, y, z] = cam.p;
  const [rx, ry, rz] = cam.r;

  // blur direzionale in base alla velocità della camera (si somma al subframe blending di ffmpeg)
  const vx = Math.abs(next.p[0] - prev.p[0]) * FPS * 0.5;
  const vy = Math.abs(next.p[1] - prev.p[1]) * FPS * 0.5;
  const bx = clamp(vx * 0.006 - 1.5, 0, 70);
  const by = clamp(vy * 0.006 - 1.5, 0, 70);
  const useBlur = bx > 0.6 || by > 0.6;

  const bg = bgAt(film.bg, t);
  const par = 0.06;
  resetStore({x: x + sx, y: y + sy, z, rx, ry, rz: rz + sr}, t);

  return (
    <TProvider value={t}>
      <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id="mb" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} />
          </filter>
        </svg>
        <BgStrips film={film} camX={x + sx} />
        {/* bagliori di sfondo con parallasse */}
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <div style={{position: 'absolute', left: 300 - x * par, top: 120 - y * par, width: 1300, height: 1300, borderRadius: '50%', background: `radial-gradient(circle, ${film.glow ?? '#ffffff'}22 0%, transparent 62%)`}} />
          <div style={{position: 'absolute', left: 1100 - x * par * 1.6, top: 520 - y * par * 1.6, width: 1100, height: 1100, borderRadius: '50%', background: `radial-gradient(circle, ${film.glow ?? '#ffffff'}18 0%, transparent 65%)`}} />
        </AbsoluteFill>
        <div style={{position: 'absolute', inset: 0, filter: useBlur ? 'url(#mb)' : undefined}}>
          <ParticleCanvas layer="back" />
          <div style={{position: 'absolute', inset: 0, perspective: PERSP, perspectiveOrigin: '50% 50%'}}>
            <div
              style={{
                position: 'absolute',
                left: 960,
                top: 540,
                width: 0,
                height: 0,
                transformStyle: 'preserve-3d',
                transform: `rotateZ(${-(rz + sr)}deg) rotateX(${-rx}deg) rotateY(${-ry}deg) translate3d(${-(x + sx)}px, ${-(y + sy)}px, ${PERSP - z}px)`,
              }}
            >
              <WorldCtx.Provider value={[0, 0, 0]}>{children}</WorldCtx.Provider>
            </div>
          </div>
          <BoxCanvas />
          <ParticleCanvas layer="front" />
        </div>
        {(film.impacts ?? []).map((im, i) => {
          const a = t - im;
          if (a < 0 || a > 0.3) return null;
          return <div key={'fl' + i} style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${(0.42 * Math.exp(-a * 16)).toFixed(3)}) 0%, rgba(255,255,255,0) 70%)`}} />;
        })}
        {(film.floods ?? []).map((f, i) => {
          const a = (t - f.t) / f.d;
          if (a < 0 || t > f.t + f.d + 0.04) return null;
          const r = E.inOut3(clamp(a)) * 2600;
          return <div key={i} style={{position: 'absolute', left: f.cx - r, top: f.cy - r, width: r * 2, height: r * 2, borderRadius: '50%', background: f.color}} />;
        })}
        {film.fade && t > film.fade.t ? <div style={{position: 'absolute', inset: 0, background: film.fade.color, opacity: clamp((t - film.fade.t) / film.fade.d)}} /> : null}
      </AbsoluteFill>
    </TProvider>
  );
};

/* ============ oggetti 3D ============ */
export const WorldCtx = createContext<[number, number, number]>([0, 0, 0]);
export const useWorld = () => useContext(WorldCtx);

export type ObjProps = {x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number; s?: number; children?: React.ReactNode; style?: React.CSSProperties};
export const Obj: React.FC<ObjProps> = ({x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, children, style}) => {
  const w = useContext(WorldCtx);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transformStyle: 'preserve-3d',
        transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`,
        ...style,
      }}
    >
      <WorldCtx.Provider value={[w[0] + x, w[1] + y, w[2] + z]}>{children}</WorldCtx.Provider>
    </div>
  );
};

/** true se un oggetto (centro mondo + raggio) può comparire in inquadratura */
export const inView = (P: [number, number, number], radius: number) => {
  const q = project(P);
  if (!q) return false;
  const r = radius * q.s;
  return q.x > -r - 80 && q.x < 1920 + r + 80 && q.y > -r - 80 && q.y < 1080 + r + 80;
};

/** mostra i figli solo in una finestra temporale (culling) */
export const Show: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => {
  const t = useT();
  return t >= a && t <= b ? <>{children}</> : null;
};

/* ============ testo estruso ============ */
export const FONT = {display: 'Anton', sans: 'Manrope', serif: 'Cormorant Garamond', black: 'Archivo Black'};

export type ExtProps = {
  text: string;
  size: number;
  face: string;
  side?: string;
  depth?: number;
  layers?: number;
  font?: string;
  weight?: number;
  italic?: boolean;
  ls?: number; // letter spacing in em
  opacity?: number;
  stroke?: string; // contorno invece di riempimento
};

export const Ext: React.FC<ExtProps> = ({text, size, face, side, depth = 0, layers = 1, font = FONT.display, weight = 400, italic = false, ls = 0, opacity = 1, stroke}) => {
  const base = useContext(WorldCtx);
  if (opacity <= 0.004) return null;
  if (!inView(base as any, size * (0.5 + text.length * 0.3))) return null;
  const L = depth > 0 ? Math.min(layers, DBG.maxLayers ?? 9) : 1;
  const sideC = side ?? face;
  const nodes = [];
  for (let i = L - 1; i >= 0; i--) {
    const front = i === 0;
    nodes.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translate(-50%, -50%) translateZ(${L > 1 ? -(i * depth) / (L - 1) : 0}px)`,
          fontFamily: `'${font}', sans-serif`,
          fontWeight: weight,
          fontStyle: italic ? 'italic' : 'normal',
          fontSize: size,
          lineHeight: 1,
          letterSpacing: `${ls}em`,
          whiteSpace: 'nowrap',
          color: stroke ? 'transparent' : front ? face : mixHex(sideC, '#000000', 0.15 + 0.5 * (i / Math.max(1, L - 1))),
          WebkitTextStroke: stroke ? `${Math.max(2, size * 0.012)}px ${front ? stroke : sideC}` : undefined,
          opacity,
        }}
      >
        {text}
      </div>,
    );
  }
  return <div style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d'}}>{nodes}</div>;
};

export type LetterState = {x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number; s?: number; o?: number};
/** parola estrusa lettera per lettera, ogni lettera animabile in 3D */
export const Letters3D: React.FC<
  Omit<ExtProps, 'text' | 'opacity'> & {text: string; anim: (i: number, n: number) => LetterState}
> = ({text, anim, size, font = FONT.display, weight = 400, italic = false, ls = 0, ...rest}) => {
  const chars = text.split('');
  const widths = useMemo(() => chars.map((c) => (c === ' ' ? size * 0.28 : measure(c, `'${font}'`, weight, size, italic) + ls * size)), [text, size, font, weight, italic, ls]);
  const total = widths.reduce((a, b) => a + b, 0);
  const base = useContext(WorldCtx);
  let cx = -total / 2;
  return (
    <>
      {chars.map((c, i) => {
        const w = widths[i];
        const px = cx + w / 2;
        cx += w;
        if (c === ' ') return null;
        const st = anim(i, chars.length);
        if ((st.o ?? 1) <= 0.004) return null;
        if (!inView([base[0] + px + (st.x ?? 0), base[1] + (st.y ?? 0), base[2] + (st.z ?? 0)], size * 0.8)) return null;
        return (
          <Obj key={i} x={px + (st.x ?? 0)} y={st.y ?? 0} z={st.z ?? 0} rx={st.rx ?? 0} ry={st.ry ?? 0} rz={st.rz ?? 0} s={st.s ?? 1}>
            <Ext text={c} size={size} font={font} weight={weight} italic={italic} opacity={st.o ?? 1} {...rest} />
          </Obj>
        );
      })}
    </>
  );
};

/* ============ filo (path che si disegna) ============ */
export const pathPoint = (d: string, frac: number) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('d', d);
  const len = el.getTotalLength();
  const p = el.getPointAtLength(len * clamp(frac));
  return {x: p.x, y: p.y, len};
};

export const Thread: React.FC<{d: string; p: number; w?: number; color: string; head?: string; headSize?: number; fadeTail?: number}> = ({d, p, w = 6, color, head, headSize = 26, fadeTail}) => {
  const {x, y, len} = pathPoint(d, p);
  const tail = fadeTail ?? 0;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={tail > 0 ? `${len * tail} ${len * 2}` : len} strokeDashoffset={tail > 0 ? -(len * (p - tail)) : len * (1 - p)} />
      {head && p > 0.001 && p < 0.999 ? (
        <>
          <circle cx={x} cy={y} r={headSize * 2.6} fill={head} opacity={0.14} />
          <circle cx={x} cy={y} r={headSize * 1.5} fill={head} opacity={0.3} />
          <circle cx={x} cy={y} r={headSize * 0.5} fill="#ffffff" />
        </>
      ) : null}
    </svg>
  );
};

/* ============ polvere / particelle (canvas) ============ */
export const Dust: React.FC<{n: number; seed?: number; w: number; h: number; z0: number; z1: number; color: string; size?: number; speed?: number; opacity?: number}> = ({n, seed = 0, w, h, z0, z1, color, size = 6, speed = 1, opacity = 0.7}) => {
  const base = useContext(WorldCtx);
  if (DBG.noDust) return null;
  store.parts.push({kind: 'dust', n: Math.round(n * (DBG.dustScale ?? 0.6)), seed, w, h, z0, z1, color, size: size * 1.1, speed, opacity, ox: base[0], oy: base[1], oz: base[2]});
  return null;
};

/* ============ piano e primitive ============ */
export const Plane: React.FC<{w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, style, children}) => (
  <div style={{position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, ...style}}>{children}</div>
);

export const Disc: React.FC<{r: number; color: string; border?: string; bw?: number; opacity?: number}> = ({r, color, border, bw = 4, opacity = 1}) => (
  <div style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', background: color, border: border ? `${bw}px solid ${border}` : undefined, boxSizing: 'border-box', opacity}} />
);

export const Ring: React.FC<{r: number; color: string; bw?: number; opacity?: number; dashed?: boolean}> = ({r, color, bw = 4, opacity = 1, dashed}) => (
  <div style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', border: `${bw}px ${dashed ? 'dashed' : 'solid'} ${color}`, boxSizing: 'border-box', opacity}} />
);

/** parallelepipedo con 6 facce (camera 3D reale) */
export const Cuboid: React.FC<{w: number; h: number; d: number; front: string; side: string; top?: string; opacity?: number}> = ({w, h, d, front, side, top, opacity = 1}) => {
  const face = (tr: string, ww: number, hh: number, bg: string) => (
    <div style={{position: 'absolute', left: -ww / 2, top: -hh / 2, width: ww, height: hh, background: bg, transform: tr, opacity, backfaceVisibility: 'hidden'}} />
  );
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d'}}>
      {face(`translateZ(${d / 2}px)`, w, h, front)}
      {face(`rotateY(180deg) translateZ(${d / 2}px)`, w, h, side)}
      {face(`rotateY(90deg) translateZ(${w / 2}px)`, d, h, side)}
      {face(`rotateY(-90deg) translateZ(${w / 2}px)`, d, h, mixHex(side, '#000000', 0.2))}
      {face(`rotateX(90deg) translateZ(${h / 2}px)`, w, d, top ?? mixHex(front, '#ffffff', 0.25))}
      {face(`rotateX(-90deg) translateZ(${h / 2}px)`, w, d, mixHex(side, '#000000', 0.35))}
    </div>
  );
};

/** SVG centrato sull'origine dell'oggetto, a dimensione reale (evita il clipping dei layer 3D) */
export const Svg3D: React.FC<{size: number; children: React.ReactNode}> = ({size, children}) => (
  <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{position: 'absolute', left: -size / 2, top: -size / 2, overflow: 'visible'}}>
    {children}
  </svg>
);

/* ============ sfondi 2D dei set (strisce con parallasse) ============ */
export const BgStrips: React.FC<{film: Film; camX: number}> = ({film, camX}) => {
  const sets = film.bgSets ?? [];
  const sc = PERSP / (2600 + store.cam.z);
  return (
    <>
      {sets.map((b, i) => {
        const left = 960 + (b.ox - 8000 - camX) * sc;
        const w = 16000 * sc;
        if (left > 1920 || left + w < 0) return null;
        return <div key={i} style={{position: 'absolute', top: 0, bottom: 0, left: left - 2, width: w + 4, background: b.color}} />;
      })}
    </>
  );
};
