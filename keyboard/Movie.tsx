import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import TL from './timeline.json';
import {clamp, eO3, FPS, H, lerp, prog, rnd, W} from './util';

const MONO = "'JetBrains Mono', monospace";
const CORAL = '#E07A55';
const PURPLE = '#7B3CFF';
const F = 1400; // lunghezza focale (perspective)

/* ═════════════ camera: un'unica ripresa, spline sui keyframe ═════════════ */
type Cam = [number, number, number, number, number, number]; // t, x, y, z, pitch, yaw
const KF: Cam[] = [
  [0.0, 230, -200, 430, 40, -16],
  [2.4, 110, -215, 450, 42, -9],
  [4.7, 290, -190, 400, 44, -12],
  [5.05, 270, -220, 460, 36, -10],
  [6.0, -215, -560, 730, 2, 0],
  [9.3, -205, -575, 860, 3, 1],
  [11.2, -40, -520, 1500, 13, 2],
  [15.0, 0, -820, 2250, 5, -2],
];
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
const camAt = (t: number) => {
  let i = 0;
  while (i < KF.length - 2 && t > KF[i + 1][0]) i++;
  const a = KF[Math.max(0, i - 1)], b = KF[i], c = KF[i + 1], d = KF[Math.min(KF.length - 1, i + 2)];
  let u = clamp((t - b[0]) / (c[0] - b[0]));
  u = u * u * (3 - 2 * u) * 0.55 + u * 0.45;
  return [1, 2, 3, 4, 5].map((k) => cr(a[k], b[k], c[k], d[k], u));
};

/* ═════════════ helpers 3D ═════════════ */
const P3: React.CSSProperties = {position: 'absolute', transformStyle: 'preserve-3d'};
const Plane: React.FC<{
  x?: number; y?: number; z?: number; rx?: number; ry?: number; w: number; h: number;
  style?: React.CSSProperties; children?: React.ReactNode;
}> = ({x = 0, y = 0, z = 0, rx = 0, ry = 0, w, h, style, children}) => (
  <div
    style={{
      ...P3, left: -w / 2, top: -h / 2, width: w, height: h,
      transform: `translate3d(${x}px,${y}px,${z}px) rotateY(${ry}deg) rotateX(${rx}deg)`,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ═════════════ tastiera ═════════════ */
const U = 56, GAP = 5;
type K = {id: string; l: string; x: number; y: number; w: number; acc?: boolean};
const KEYS: K[] = (() => {
  const out: K[] = [];
  const row = (y: number, x0: number, list: [string, string, number?, number?][]) => {
    let x = x0;
    for (const [id, l, w = 1, skip = 0] of list) {
      x += skip;
      out.push({id, l, x, y, w, acc: id === 'enter' || id === 'esc'});
      x += w;
    }
  };
  const F = (n: number) => [`f${n}`, `F${n}`] as [string, string];
  row(0, 0, [['esc', 'ESC'], [...F(1), 1, 1], F(2), F(3), F(4), [...F(5), 1, 0.5], F(6), F(7), F(8), [...F(9), 1, 0.5], F(10), F(11), F(12), ['prt', 'PRT', 1, 0.25], ['scr', 'SCR'], ['pau', 'PAU']]);
  row(1.25, 0, [['grave', '`'], ...'1234567890'.split('').map((c) => [c, c] as [string, string]), ['minus', '-'], ['eq', '='], ['back', 'BACK', 2], ['ins', 'INS', 1, 0.25], ['home', 'HOM'], ['pgup', 'PGU']]);
  row(2.25, 0, [['tab', 'TAB', 1.5], ...'qwertyuiop'.split('').map((c) => [c, c.toUpperCase()] as [string, string]), ['lb', '['], ['rb', ']'], ['bs', '\\', 1.5], ['del', 'DEL', 1, 0.25], ['end', 'END'], ['pgdn', 'PGD']]);
  row(3.25, 0, [['caps', 'CAPS', 1.75], ...'asdfghjkl'.split('').map((c) => [c, c.toUpperCase()] as [string, string]), ['semi', ';'], ['quote', "'"], ['enter', 'ENTER', 2.25]]);
  row(4.25, 0, [['lshift', 'SHIFT', 2.25], ...'zxcvbnm'.split('').map((c) => [c, c.toUpperCase()] as [string, string]), ['comma', ','], ['period', '.'], ['slash', '/'], ['rshift', 'SHIFT', 2.75], ['up', '▲', 1, 1.25]]);
  row(5.25, 0, [['lctrl', 'CTRL', 1.25], ['win', '✻', 1.25], ['lalt', 'ALT', 1.25], ['space', '', 6.25], ['ralt', 'ALT', 1.25], ['fn', 'FN', 1.25], ['menu', 'MNU', 1.25], ['rctrl', 'CTRL', 1.25], ['left', '◀', 1, 0.25], ['down', '▼'], ['right', '▶']]);
  return out;
})();
const KB_W = 18.25 * U + 40, KB_H = 6.25 * U + 40;
const KB = {x: 0, z: 190, tilt: 6};
// posizione nel mondo del centro di un tasto (per lo spill di luce)
type Ev = {t: number; k: string; d: number};
const EVS = TL.keys as Ev[];
const pressOf = (id: string, t: number) => {
  let p = 0, g = 0;
  for (const e of EVS) {
    if (e.k !== id || e.t > t + 0.001) continue;
    const dn = clamp((t - e.t) / 0.022);
    const up = clamp((t - e.t - e.d) / 0.05);
    p = Math.max(p, dn * (1 - up));
    g = Math.max(g, Math.exp(-(t - e.t) / 0.55));
  }
  return {p, g};
};

const Keycap: React.FC<{k: K; t: number}> = ({k, t}) => {
  const {p, g} = pressOf(k.id, t);
  const w = k.w * U - GAP, h = U - GAP;
  const lift = 15 - p * 9;
  const base = k.acc ? ['#F08A5D', '#C4502D', '#7A2A14'] : ['#2A2C36', '#1A1B22', '#0C0C10'];
  const legendCol = k.acc ? 'rgba(40,10,0,.75)' : `rgba(${lerp(200, 255, g)},${lerp(205, 170, g)},${lerp(225, 140, g)},${0.55 + 0.45 * g})`;
  return (
    <div style={{...P3, left: 20 + k.x * U, top: 20 + k.y * U, width: w, height: h}}>
      {/* luce RGB reattiva sulla piastra */}
      <div style={{position: 'absolute', inset: -26, borderRadius: 30, background: `radial-gradient(closest-side, rgba(255,110,70,${g}), rgba(170,70,255,${0.5 * g}) 60%, transparent)`}} />
      <div style={{...P3, inset: 0, transform: `translateZ(${lift}px)`}}>
        <div style={{position: 'absolute', left: 0, top: '100%', width: '100%', height: lift, transformOrigin: 'top', transform: 'rotateX(-90deg)', background: `linear-gradient(${base[1]}, ${base[2]})`}} />
        <div style={{position: 'absolute', left: '-0.5px', top: 0, width: lift, height: '100%', transformOrigin: 'left', transform: 'rotateY(90deg)', background: base[2]}} />
        <div style={{position: 'absolute', right: '-0.5px', top: 0, width: lift, height: '100%', transformOrigin: 'right', transform: 'rotateY(-90deg)', background: base[2]}} />
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: 6,
            background: `linear-gradient(170deg, ${base[0]}, ${base[1]} 70%)`,
            boxShadow: `inset 0 2px 0 rgba(255,255,255,${k.acc ? 0.35 : 0.08}), inset 0 -4px 6px rgba(0,0,0,.45), 0 0 ${30 * g}px rgba(255,120,80,${0.8 * g})`,
            display: 'flex', alignItems: k.w > 1.4 ? 'center' : 'flex-start', justifyContent: k.w > 1.4 ? 'center' : 'flex-start',
            padding: k.w > 1.4 ? 0 : '7px 0 0 9px', boxSizing: 'border-box',
            fontFamily: MONO, fontWeight: 700, fontSize: k.l.length > 2 ? 11 : 17, color: legendCol, letterSpacing: 0.5,
            textShadow: g > 0.05 ? `0 0 ${10 * g}px rgba(255,140,90,${g})` : undefined,
            filter: `brightness(${1 + 0.6 * g + p * 0.2})`,
          }}
        >
          {k.l}
        </div>
      </div>
    </div>
  );
};

const Keyboard: React.FC<{t: number}> = ({t}) => (
  <div style={{...P3, left: 0, top: 0, transform: `translate3d(${KB.x}px, -2px, ${KB.z}px) rotateX(${90 - KB.tilt}deg)`}}>
    <div style={{...P3, left: -KB_W / 2, top: -KB_H / 2, width: KB_W, height: KB_H}}>
      {/* ombra a terra */}
      <div style={{position: 'absolute', inset: -40, borderRadius: 60, background: 'radial-gradient(closest-side, rgba(0,0,0,.75), transparent)', transform: 'translateZ(-4px)'}} />
      {/* scocca */}
      <div style={{position: 'absolute', inset: 0, borderRadius: 14, background: 'linear-gradient(180deg,#5a1026,#2a0714)', boxShadow: 'inset 0 0 0 2px rgba(255,90,110,.25), 0 0 60px rgba(150,40,255,.35)'}} />
      <div style={{position: 'absolute', left: 0, top: '100%', width: '100%', height: 34, transformOrigin: 'top', transform: 'rotateX(-90deg)', background: 'linear-gradient(#3a0a18,#12030a)', borderRadius: '0 0 10px 10px'}} />
      <div style={{position: 'absolute', inset: 14, borderRadius: 8, background: 'radial-gradient(120% 90% at 50% 60%, #2b0c3f, #12040c)', transform: 'translateZ(1px)'}} />
      <div style={{...P3, inset: 0, transform: 'translateZ(2px)'}}>
        {KEYS.map((k) => <Keycap key={k.id} k={k} t={t} />)}
      </div>
    </div>
  </div>
);

/* ═════════════ terminale ═════════════ */
const COLS: Record<string, React.CSSProperties> = {
  pr: {color: CORAL, fontWeight: 700}, in: {color: '#F4F1EC'}, dot: {color: '#5FD38D'}, tool: {color: '#FFFFFF', fontWeight: 700},
  dim: {color: '#8C909C'}, add: {color: '#6FDC8C'}, del: {color: '#FF7B72'}, kw: {color: '#C792EA'}, fn: {color: '#82AAFF'},
  tag: {color: '#F07178'}, at: {color: '#FFCB6B'}, str: {color: '#C3E88D'}, tx: {color: '#C9CDD6'}, wh: {color: '#FFFFFF'},
  ok: {color: '#5FD38D', fontWeight: 700}, okt: {color: '#E9FFF0', fontWeight: 700}, sp: {},
};
type Line = {segs: [string, string][]; times: number[]; cursor?: [number, number]};
const LINES = TL.lines as unknown as Line[];
const SW = 1200, SH = 720, LH = 35, FS = 24;

const Terminal: React.FC<{t: number}> = ({t}) => {
  // righe visibili: una riga compare al primo carattere (le vuote insieme alla successiva)
  const startOf = (i: number): number => {
    const l = LINES[i];
    if (l.times.length) return l.times[0];
    return i + 1 < LINES.length ? startOf(i + 1) : 99;
  };
  let rows = 0;
  LINES.forEach((l, i) => {
    if (l.segs[0][1] === 'hdr') return;
    rows += clamp((t - startOf(i)) / 0.08);
  });
  const contentH = 150 + rows * LH;
  const scroll = Math.max(0, contentH - (SH - 70));
  const blink = Math.floor(t * 2.2) % 2 === 0;
  const lastTyped = LINES.filter((l) => l.cursor && t >= l.cursor[0]).pop();
  return (
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(120% 100% at 30% 20%, #1c1b22, #0d0d11)', overflow: 'hidden', fontFamily: MONO, fontSize: FS}}>
      <div style={{position: 'absolute', left: 50, top: 40, right: 50, transform: `translateY(${-scroll}px)`}}>
        {LINES.map((l, i) => {
          if (l.segs[0][1] === 'hdr')
            return (
              <div key={i} style={{border: `2px solid ${CORAL}`, borderRadius: 12, padding: '14px 22px', width: 560, marginBottom: 22, lineHeight: '34px'}}>
                <div style={{color: '#fff', fontWeight: 700}}><span style={{color: CORAL}}>✻</span> Claude Code</div>
                <div style={{color: '#8C909C', fontSize: 20}}>cwd: ~/clienti/landing</div>
              </div>
            );
          const shown = l.times.filter((x) => x <= t).length;
          if (t < startOf(i)) return null;
          let left = shown;
          const live = !!l.cursor && t >= l.cursor[0] && t < l.cursor[1];
          const showCursor = lastTyped === l && (live || blink) && !LINES.some((x, xi) => xi > i && x.times.length && x.times[0] <= t);
          return (
            <div key={i} style={{height: LH, lineHeight: `${LH}px`, whiteSpace: 'pre', opacity: clamp((t - startOf(i)) / 0.06)}}>
              {l.segs.map(([txt, c], j) => {
                const n = Math.min(txt.length, left);
                left -= n;
                return n > 0 ? <span key={j} style={COLS[c]}>{txt.slice(0, n)}</span> : null;
              })}
              {showCursor ? (
                <span style={{display: 'inline-block', width: FS * 0.6, height: FS * 1.15, background: '#F4F1EC', verticalAlign: 'middle', marginLeft: 2, boxShadow: '0 0 12px rgba(255,255,255,.6)'}} />
              ) : null}
            </div>
          );
        })}
      </div>
      {/* scanline + riflesso del vetro */}
      <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.018) 0 2px, transparent 2px 4px)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,.07), transparent 35%, transparent 70%, rgba(160,120,255,.06))'}} />
    </div>
  );
};

/* ═════════════ finestra con pioggia ═════════════ */
const WIN_W = 2000, WIN_H = 1500;
const City: React.FC<{t: number}> = ({t}) => {
  const r = rnd(11);
  const lights = Array.from({length: 70}, () => {
    const pal = ['255,190,120', '255,150,90', '120,200,255', '200,140,255', '255,110,170', '255,230,180'];
    return {x: r() * WIN_W, y: WIN_H * (0.45 + r() * 0.55), s: 40 + r() * 140, c: pal[Math.floor(r() * pal.length)], a: 0.25 + r() * 0.6, ph: r() * 6};
  });
  return (
    <>
      {lights.map((L, i) => (
        <div key={i} style={{position: 'absolute', left: L.x - L.s / 2, top: L.y - L.s / 2, width: L.s, height: L.s, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(${L.c},${L.a * (0.85 + 0.15 * Math.sin(t * 2 + L.ph))}), rgba(${L.c},${L.a * 0.35}) 70%, transparent)`}} />
      ))}
    </>
  );
};
const Rain: React.FC<{t: number}> = ({t}) => {
  const r = rnd(5);
  const streaks = Array.from({length: 90}, () => ({x: r() * WIN_W, sp: 1400 + r() * 900, ph: r() * 10, len: 60 + r() * 90, a: 0.08 + r() * 0.18}));
  const drops = Array.from({length: 110}, () => ({x: r() * WIN_W, y0: r() * WIN_H, s: 5 + r() * 16, sp: r() < 0.25 ? 60 + r() * 220 : 0, ph: r()}));
  return (
    <>
      {streaks.map((s, i) => {
        const y = ((t + s.ph) * s.sp) % (WIN_H + 200) - 150;
        return <div key={'s' + i} style={{position: 'absolute', left: s.x, top: y, width: 1.6, height: s.len, background: `linear-gradient(transparent, rgba(200,210,255,${s.a}))`, transform: 'rotate(8deg)'}} />;
      })}
      {drops.map((d, i) => {
        const y = (d.y0 + t * d.sp) % WIN_H;
        return (
          <React.Fragment key={'d' + i}>
            {d.sp > 0 && <div style={{position: 'absolute', left: d.x - d.s * 0.18, top: y - 160, width: d.s * 0.36, height: 160, background: 'linear-gradient(transparent, rgba(190,200,255,.12))', borderRadius: 4}} />}
            <div style={{position: 'absolute', left: d.x - d.s / 2, top: y - d.s / 2, width: d.s, height: d.s * 1.15, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,.55), rgba(170,150,255,.18) 45%, rgba(20,10,40,.25) 70%, transparent 72%)'}} />
          </React.Fragment>
        );
      })}
    </>
  );
};

/* ═════════════ stanza ═════════════ */
const MON = {z: -260, cy: -575, w: SW + 36, h: SH + 36};
const WALL_Z = -820;

const Room: React.FC<{t: number}> = ({t}) => {
  const e1 = TL.enter1, e2 = TL.enter2;
  const flash = Math.exp(-Math.max(0, t - e1) / 0.35) * (t >= e1 ? 1 : 0) + Math.exp(-Math.max(0, t - e2) / 0.35) * (t >= e2 ? 1 : 0);
  const scr = 0.8 + 0.2 * Math.sin(t * 9) * 0.1 + flash * 0.4;
  return (
    <>
      {/* parete di fondo */}
      <Plane z={WALL_Z} y={-1300} w={7000} h={4200} style={{background: 'linear-gradient(#07071a, #0c0a22 60%, #120a26)'}}>
        <div style={{position: 'absolute', left: 3500 - 1300, top: 4200 / 2 + 1300 - 575 - 900, width: 2600, height: 1800, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(123,60,255,${0.75 + 0.2 * flash}), rgba(90,30,200,.25) 55%, transparent)`}} />
        {/* finestra */}
        <div style={{position: 'absolute', left: 3500 - WIN_W / 2, top: 2100 + 1300 - 2300, width: WIN_W, height: WIN_H, overflow: 'hidden', background: 'linear-gradient(#0a1030, #1a1440 55%, #2a1638)', boxShadow: '0 0 0 40px #05050d'}}>
          <div style={{position: 'absolute', inset: 0, filter: 'blur(5px)'}}>
            <City t={t} />
          </div>
          <Rain t={t} />
          <div style={{position: 'absolute', left: WIN_W / 2 - 18, top: 0, width: 36, height: WIN_H, background: '#05050d'}} />
          <div style={{position: 'absolute', left: 0, top: WIN_H * 0.42, width: WIN_W, height: 30, background: '#05050d'}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.35), transparent 40%)'}} />
        </div>
      </Plane>
      {/* scrivania */}
      <Plane y={0} z={(WALL_Z + 1500) / 2} rx={90} w={5200} h={1500 - WALL_Z} style={{background: 'linear-gradient(180deg, #120c22, #1b1428 40%, #0d0a14)'}}>
        <div style={{position: 'absolute', left: 2600 - 1100, top: 0, width: 2200, height: 1500, background: `radial-gradient(50% 45% at 50% 25%, rgba(140,90,255,${0.5 * scr}), transparent)`}} />
        <div style={{position: 'absolute', left: 2600 - 900, top: 700, width: 1800, height: 900, background: 'radial-gradient(closest-side, rgba(255,90,90,.18), transparent)'}} />
      </Plane>
      <Plane y={70} z={1500} w={5200} h={140} style={{background: 'linear-gradient(#1a1326,#050308)'}} />
      {/* monitor: stand */}
      <Plane x={0} y={-6} z={MON.z - 40} rx={90} w={420} h={260} style={{background: 'linear-gradient(#2a2a33,#121218)', borderRadius: 18, boxShadow: '0 0 0 2px rgba(255,255,255,.05)'}} />
      <Plane x={0} y={-200} z={MON.z - 70} w={110} h={400} style={{background: 'linear-gradient(90deg,#08080c,#1f1f27 50%,#08080c)'}} />
      {/* monitor: pannello */}
      <Plane x={0} y={MON.cy} z={MON.z - 22} w={MON.w} h={MON.h} style={{background: '#050507', borderRadius: 16}} />
      <Plane x={0} y={MON.cy} z={MON.z} w={MON.w} h={MON.h} style={{background: '#0a0a0e', borderRadius: 16, padding: 18, boxSizing: 'border-box', boxShadow: `0 0 120px rgba(150,110,255,${0.25 + 0.25 * flash}), inset 0 0 0 2px #1a1a22`}}>
        <div style={{position: 'relative', width: SW, height: SH, borderRadius: 4, overflow: 'hidden', filter: `brightness(${1 + flash * 0.25})`}}>
          <Terminal t={t} />
        </div>
      </Plane>
      <Plane x={0} y={MON.cy + MON.h / 2 + 11} z={MON.z - 11} rx={90} w={MON.w} h={22} style={{background: '#0e0e13'}} />
      {/* tazza */}
      <Plane x={760} y={-95} z={60} w={150} h={190} style={{background: 'linear-gradient(90deg,#16121e,#3b2f4c 35%,#120e18)', borderRadius: '10px 10px 30px 30px'}} />
      <Plane x={760} y={-2} z={60} rx={90} w={220} h={220} style={{borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,.7), transparent)'}} />
    </>
  );
};

/* ═════════════ movie ═════════════ */
export const Movie: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [cx, cy, cz, pitch, yaw] = camAt(t);
  // mano della camera: micro-oscillazioni
  const hx = Math.sin(t * 1.3) * 3 + Math.sin(t * 3.1) * 1.2;
  const hy = Math.cos(t * 1.1) * 2.5 + Math.sin(t * 2.7) * 1;
  const roll = Math.sin(t * 0.7) * 0.5;
  const kick = (tt: number) => (t >= tt ? Math.exp(-(t - tt) / 0.12) * Math.sin((t - tt) * 60) * 5 : 0);
  const shake = kick(TL.enter1) + kick(TL.enter2) * 0.6;
  const fadeIn = eO3(prog(t, 0, 0.6));
  const fadeOut = 1 - prog(t, 14.55, 15);
  return (
    <AbsoluteFill style={{background: '#030308', overflow: 'hidden'}}>
      <AbsoluteFill style={{perspective: F, perspectiveOrigin: `${W / 2}px ${H / 2}px`}}>
        <div
          style={{
            ...P3, left: W / 2, top: H / 2, width: 0, height: 0,
            transform: `translateZ(${F}px) rotateZ(${roll}deg) rotateX(${-pitch}deg) rotateY(${yaw}deg) translate3d(${-cx - hx}px,${-cy - hy + shake}px,${-cz}px)`,
          }}
        >
          <Room t={t} />
          <Keyboard t={t} />
        </div>
      </AbsoluteFill>
      {/* luce colorata + vignetta */}
      <AbsoluteFill style={{background: 'radial-gradient(110% 70% at 50% 45%, transparent 55%, rgba(0,0,0,.65))', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(110,50,255,.10), transparent 40%, rgba(255,80,60,.06))', mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: '#000', opacity: 1 - fadeIn * fadeOut}} />
    </AbsoluteFill>
  );
};
