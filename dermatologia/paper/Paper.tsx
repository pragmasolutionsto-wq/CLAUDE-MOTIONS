import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {COL, SANS, SERIF} from '../config';
import {B, clamp, eBack, eIO, eO3, eO4, eO5, FPS, lerp, prog, rnd, SC} from './util';

/* Longevitas Dermatologia — spot papercut 47s.
   Ogni servizio è un capitolo da 7s: un "diorama" di carta (mondo 1000×1000) che si trasforma,
   più un pannello di testo con numero, titolo ed etichetta che cambia a tempo. */

type Dim = {W: number; H: number; v: boolean};
const Ctx = createContext<Dim>({W: 1920, H: 1080, v: false});
const useD = () => useContext(Ctx);

const SK = {l: '#F3D5C0', m: '#E7BB9F', d: '#D49E80', deep: '#B97E62', mole: '#5B3624', moleM: '#8A5739', moleD: '#2A150C', red: '#D9766A', redL: '#E9A193', derm: '#EDB2A0', fat: '#F4E3B4', fatL: '#F9EECB'};

/* ═════════════ helper ═════════════ */
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), Bb = hex(b);
  return `rgb(${A.map((x, i) => Math.round(lerp(x, Bb[i], clamp(t)))).join(',')})`;
};
const pop = (u: number, t0: number, d = 0.4, s = 1.8) => Math.max(0, eBack(prog(u, t0, t0 + d), s));
const sc = (x: number, y: number, s: number, s2 = s) => `translate(${x} ${y}) scale(${s} ${s2}) translate(${-x} ${-y})`;
// forma "tagliata a mano": ellisse con raggio rumoroso
const wob = (cx: number, cy: number, rx: number, ry: number, seed: number, amp = 0.03, f?: (th: number) => number, n = 96) => {
  const r = rnd(seed);
  const ph = [0, 1, 2, 3, 4].map(() => r() * 6.28);
  let d = '';
  for (let i = 0; i <= n; i++) {
    const th = (i / n) * Math.PI * 2;
    let k = 1 + amp * (Math.sin(2 * th + ph[0]) * 0.5 + Math.sin(3 * th + ph[1]) * 0.35 + Math.sin(5 * th + ph[2]) * 0.25 + Math.sin(11 * th + ph[3]) * 0.12);
    if (f) k *= f(th);
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(th) * rx * k).toFixed(1)} ${(cy + Math.sin(th) * ry * k).toFixed(1)}`;
  }
  return d + 'Z';
};
// banda orizzontale con bordo superiore ondulato (strati di pelle in sezione)
const band = (x0: number, x1: number, top: number, bot: number, amp: number, seed: number) => {
  const r = rnd(seed);
  const p1 = r() * 6.28, p2 = r() * 6.28;
  let d = `M${x0} ${bot}`;
  for (let i = 0; i <= 60; i++) {
    const x = lerp(x0, x1, i / 60);
    const y = top + Math.sin(i * 0.31 + p1) * amp + Math.sin(i * 0.83 + p2) * amp * 0.4;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + ` L${x1} ${bot}Z`;
};
const surfY = (x: number) => 388 + Math.sin(((x - 80) / 840) * 60 * 0.31 + 1.2) * 6;

const Defs: React.FC = () => (
  <defs>
    <filter id="s1" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0B1A33" floodOpacity="0.3" /></filter>
    <filter id="s2" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0B1A33" floodOpacity="0.3" /></filter>
    <filter id="s3" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#0B1A33" floodOpacity="0.34" /></filter>
  </defs>
);
const SH = (n: 1 | 2 | 3) => `url(#s${n})`;

/* ═════════════ testo ═════════════ */
const Words: React.FC<{text: string; lt: number; d?: number; stag?: number; italic?: boolean; color?: string}> = ({text, lt, d = 0, stag = 0.07, italic, color}) => (
  <span style={{fontStyle: italic ? 'italic' : 'normal', color}}>
    {text.split(' ').map((w, i) => {
      const p = eO5(prog(lt, d + i * stag, d + i * stag + 0.55));
      return (
        <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.12em', marginBottom: '-0.12em', marginRight: '0.24em'}}>
          <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 6}deg)`, transformOrigin: 'left bottom'}}>{w}</span>
        </span>
      );
    })}
  </span>
);

const Kicker: React.FC<{text: string; lt: number; d?: number; color?: string; size?: number; center?: boolean}> = ({text, lt, d = 0, color = COL.goldDeep, size = 22, center}) => {
  const p = eO4(prog(lt, d, d + 0.5));
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, justifyContent: center ? 'center' : 'flex-start', fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: size * 0.22, color, textTransform: 'uppercase'}}>
      <div style={{width: 56 * p, height: 2, background: color}} />
      <div style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>{text}</div>
    </div>
  );
};

/* ═════════════ sfondo di carta ═════════════ */
const BgPaper: React.FC<{t: number; base: string; tones: string[]; seed?: number}> = ({t, base, tones, seed = 1}) => {
  const {W, H} = useD();
  const spots = [[-0.08, -0.12, 0.42], [1.05, 0.95, 0.5], [1.02, -0.05, 0.28], [-0.05, 1.05, 0.3]];
  return (
    <AbsoluteFill style={{background: base, overflow: 'hidden'}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <Defs />
        {spots.map(([x, y, r], i) => {
          const R = Math.max(W, H) * r;
          return (
            <g key={i} transform={`translate(${Math.sin(t * 0.5 + i) * 30} ${Math.cos(t * 0.4 + i) * 24})`}>
              {tones.map((c, j) => (
                <path key={j} d={wob(W * x, H * y, R * (1 - j * 0.16), R * (1 - j * 0.16), seed * 10 + i * 3 + j, 0.06)} fill={c} filter={SH(2)} />
              ))}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ═════════════ palcoscenico (mondo 1000×1000) ═════════════ */
const Stage: React.FC<{lt: number; children: React.ReactNode}> = ({lt, children}) => {
  const {W, H, v} = useD();
  const s = v ? 1000 : 940;
  const x = v ? (W - s) / 2 : 70, y = v ? 140 : (H - s) / 2;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: s, height: s, transform: `translateY(${Math.sin(lt * 1.1) * 8}px) rotate(${Math.sin(lt * 0.7) * 0.6}deg)`}}>
      <svg viewBox="0 0 1000 1000" width={s} height={s} style={{overflow: 'visible'}}>
        <Defs />
        {children}
      </svg>
    </div>
  );
};

/* ═════════════ pannello di testo del capitolo ═════════════ */
const ChapterText: React.FC<{lt: number; n: number; title: string; labels: [number, string][]; dark?: boolean}> = ({lt, n, title, labels, dark}) => {
  const {W, H, v} = useD();
  const bp = pop(lt, 0.0, 0.5, 1.6);
  const ink = dark ? COL.white : COL.ink;
  const acc = dark ? COL.gold : COL.blue;
  const cur = labels.filter(([t]) => lt >= t).length - 1;
  return (
    <div style={{position: 'absolute', left: v ? 80 : W * 0.555, top: v ? H * 0.665 : H * 0.2, width: v ? W - 160 : W * 0.4, display: 'flex', flexDirection: 'column', alignItems: v ? 'center' : 'flex-start', textAlign: v ? 'center' : 'left'}}>
      <div style={{width: 112, height: 112, background: COL.gold, boxShadow: '0 10px 24px rgba(11,26,51,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 56, color: COL.navyDeep, transform: `translateY(${(1 - clamp(bp)) * -160}px) rotate(${(1 - bp) * -30 + Math.sin(lt * 2) * 1.5}deg) scale(${bp})`}}>0{n}</div>
      <div style={{height: v ? 36 : 40}} />
      <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: v ? 92 : 80, lineHeight: 1.04, color: ink}}>
        <Words text={title} lt={lt} d={0.12} stag={0.08} />
      </div>
      <div style={{height: v ? 40 : 46}} />
      <div style={{position: 'relative', height: 92, width: v ? W - 160 : W * 0.4, overflow: 'hidden'}}>
        {labels.map(([t, l], i) => {
          const p = eO5(prog(lt, t, t + 0.45));
          const nt = labels[i + 1]?.[0] ?? 99;
          const q = eIO(prog(lt, nt - 0.05, nt + 0.3));
          if (p <= 0 || q >= 1) return null;
          return (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: v ? 'center' : 'flex-start', transform: `translateY(${(1 - p) * 100 - q * 100}%)`}}>
              <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: v ? 64 : 58, lineHeight: '92px', color: acc, whiteSpace: 'nowrap'}}>{l}</div>
            </div>
          );
        })}
      </div>
      <div style={{width: 320 * eO4(prog(lt, 0.3, 0.9)), height: 3, background: COL.gold, marginTop: 10}} />
      <div style={{display: 'flex', gap: 10, marginTop: 34}}>
        {[1, 2, 3, 4, 5].map((k) => {
          const on = k === n;
          const p = eO4(prog(lt, 0.2 + k * 0.05, 0.6 + k * 0.05));
          return <div key={k} style={{width: on ? 70 : 34, height: 10, background: on ? COL.gold : dark ? 'rgba(255,255,255,.25)' : 'rgba(30,53,87,.18)', transform: `scaleX(${p})`, transformOrigin: 'left', boxShadow: on ? '0 3px 6px rgba(11,26,51,.25)' : undefined}} />;
        })}
        <div style={{width: 10}} />
        {labels.slice(1).map((_, k) => <div key={'d' + k} style={{width: 10, height: 10, borderRadius: 10, background: k + 1 <= cur ? acc : dark ? 'rgba(255,255,255,.25)' : 'rgba(30,53,87,.18)'}} />)}
      </div>
    </div>
  );
};

/* ═════════════ pezzi di carta riusabili ═════════════ */
const SkinPanel: React.FC<{u: number; seed: number; cx?: number; cy?: number; rx?: number; ry?: number}> = ({u, seed, cx = 480, cy = 540, rx = 400, ry = 360}) => (
  <>
    {[[SK.deep, 26], [SK.d, 13], [SK.m, 0]].map(([c, e], i) => {
      const p = pop(u, -0.25 + i * 0.08, 0.55, 1.4);
      return <path key={i} d={wob(cx, cy, rx + (e as number), ry + (e as number), seed + i, 0.025)} fill={c as string} filter={SH(i === 0 ? 3 : 2)} transform={`translate(0 ${(1 - clamp(p)) * 700}) ${sc(cx, cy, 1, p)}`} />;
    })}
    <path d={wob(cx - 20, cy - 25, rx - 50, ry - 55, seed + 7, 0.03)} fill={SK.l} opacity={0.7 * clamp(pop(u, 0.0, 0.5))} />
  </>
);

const Sparkle: React.FC<{x: number; y: number; u: number; t0: number; s?: number; c?: string}> = ({x, y, u, t0, s = 1, c = COL.gold}) => {
  const p = prog(u, t0, t0 + 0.7);
  if (p <= 0 || p >= 1) return null;
  const k = Math.sin(Math.PI * p) * s * 26;
  return <path d={`M${x} ${y - k} Q${x} ${y} ${x + k} ${y} Q${x} ${y} ${x} ${y + k} Q${x} ${y} ${x - k} ${y} Q${x} ${y} ${x} ${y - k}Z`} fill={c} filter={SH(1)} transform={`rotate(${p * 90} ${x} ${y})`} />;
};

/* ═════════════ 00 — INTRO ═════════════ */
const Intro: React.FC<{lt: number}> = ({lt}) => {
  const {W, H, v} = useD();
  const layers = [COL.navy, COL.blue, COL.blueSoft, COL.sky, COL.white];
  const lens = pop(lt, 2.9, 0.5, 2);
  return (
    <AbsoluteFill style={{background: COL.ice, overflow: 'hidden'}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <Defs />
        {layers.map((c, i) => {
          const p = pop(lt, 0.05 + i * 0.1, 0.7, 1.3);
          const top = H * (v ? 0.66 : 0.6) + i * H * 0.07;
          return <path key={i} d={band(-40, W + 40, top, H + 60, 26 - i * 3, 40 + i)} fill={c} filter={SH(i < 2 ? 3 : 2)} transform={`translate(${Math.sin(lt * 0.8 + i) * 20} ${(1 - clamp(p)) * H * 0.6})`} />;
        })}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const r = rnd(70 + i);
          const x = r() * W, y = H * (0.12 + r() * 0.42), s = 10 + r() * 18;
          const p = pop(lt, 0.4 + i * 0.07, 0.5, 2);
          return <path key={'c' + i} d={wob(x, y + Math.sin(lt * 2 + i) * 14, s, s, 90 + i, 0.1)} fill={i % 2 ? COL.gold : SK.d} filter={SH(1)} transform={sc(x, y, p)} opacity={0.9} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: v ? 80 : 160, top: H * (v ? 0.2 : 0.16), width: v ? W - 160 : W * 0.7}}>
        <Kicker text="Longevitas · Dermatologia" lt={lt} d={0.1} size={v ? 26 : 22} />
        <div style={{height: 34}} />
        <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: v ? 112 : 124, lineHeight: 1.06, color: COL.ink}}>
          <Words text="La tua pelle" lt={lt} d={0.25} stag={0.1} />
          <br />
          <Words text="non è standard." lt={lt} d={0.55} stag={0.1} />
          <br />
          <Words text="Il controllo nemmeno." lt={lt} d={1.4} stag={0.1} italic color={COL.blue} />
        </div>
      </div>
      <div style={{position: 'absolute', left: v ? W / 2 - 90 : W * 0.82 - 90, top: v ? H * 0.58 - 90 : H * 0.28 - 90, width: 180, height: 180, borderRadius: 200, background: COL.gold, boxShadow: '0 16px 30px rgba(11,26,51,.35)', transform: `scale(${lens}) rotate(${lt * 40}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 120, height: 120, borderRadius: 120, background: COL.navy, boxShadow: 'inset 0 6px 14px rgba(0,0,0,.4)'}} />
      </div>
    </AbsoluteFill>
  );
};

/* ═════════════ 01 — NEI (ABCDE) ═════════════ */
const Nei: React.FC<{lt: number}> = ({lt: u}) => {
  const asym = eIO(prog(u, 1, 1.45)), jag = eIO(prog(u, 2, 2.45)), col = eIO(prog(u, 3, 3.45)), dim = eIO(prog(u, 4, 4.45)), evo = prog(u, 5, 7);
  const R0 = 100 * (1 + dim * 0.35 + eO3(evo) * 0.2) * pop(u, 0.45, 0.4, 2.2);
  const f = (th: number) => 1 + asym * (0.2 * Math.cos(th) + 0.09 * Math.cos(2 * th + 0.8)) + jag * (0.05 * Math.sin(9 * th) + 0.035 * Math.sin(17 * th + 1.3) + 0.02 * Math.sin(29 * th + 2)) + evo * 0.08 * Math.sin(3 * th + u * 4);
  const neo = (k: number, dx: number, dy: number) => wob(500 + dx, 500 + dy, R0 * k, R0 * k, 5, 0.0, f, 160);
  const r = rnd(11);
  const pores = Array.from({length: 70}).map((_, i) => {
    const a = r() * Math.PI * 2, rr = 60 + Math.sqrt(r()) * 280;
    return <circle key={i} cx={500 + Math.cos(a) * rr} cy={500 + Math.sin(a) * rr} r={1.5 + r() * 2.5} fill={SK.deep} opacity={0.3} />;
  });
  const axis = eO4(prog(u, 1.0, 1.35)) * (1 - prog(u, 1.9, 2.2));
  const ruler = eO4(prog(u, 4.0, 4.4)) * (1 - prog(u, 5.0, 5.3));
  const L = R0 * 1.2;
  return (
    <AbsoluteFill>
      <BgPaper t={u} base={COL.navyDeep} tones={[COL.navy, '#24426B']} seed={3} />
      <Stage lt={u}>
        <g transform={`rotate(${u * 10} 500 500)`}>
          {Array.from({length: 48}).map((_, i) => {
            const p = pop(u, -0.1 + i * 0.008, 0.3);
            return <rect key={i} x={496} y={22} width={8} height={i % 4 === 0 ? 46 : 26} rx={2} fill={COL.gold} filter={SH(1)} transform={`rotate(${(i / 48) * 360} 500 500) ${sc(500, 40, 1, p)}`} />;
          })}
        </g>
        {[[440, SK.deep], [418, SK.d], [394, SK.m], [366, SK.l]].map(([R, c], i) => (
          <path key={i} d={wob(500, 500, R as number, R as number, 20 + i, 0.012)} fill={c as string} filter={SH(i ? 2 : 3)} transform={sc(500, 500, pop(u, -0.25 + i * 0.08, 0.5, 1.6))} />
        ))}
        {pores}
        {/* E: anelli di crescita */}
        {[1.18, 1.36, 1.54].map((k, i) => {
          const p = eO4(prog(u, 5.2 + i * 0.35, 5.8 + i * 0.35));
          return p > 0 && <path key={k} d={neo(lerp(1, k, p), 0, 0)} fill="none" stroke={COL.navy} strokeWidth={4} strokeDasharray="12 10" opacity={0.6 * (1 - prog(u, 6.6, 7))} />;
        })}
        {/* A: com'è un neo simmetrico */}
        <circle cx={500} cy={500} r={100 * pop(u, 0.45, 0.4, 2.2)} fill="none" stroke={COL.white} strokeWidth={4} strokeDasharray="10 9" opacity={axis} />
        <path d={neo(1, 0, 0)} fill={mix(SK.mole, '#A86E4E', col)} filter={SH(2)} />
        <path d={neo(0.78, 10 * col, -8 * col)} fill={mix(SK.mole, SK.moleM, col)} filter={SH(1)} />
        <path d={neo(0.5, -14 * col, 10 * col)} fill={mix(SK.mole, SK.moleD, col)} filter={SH(1)} />
        <rect x={494} y={500 - R0 * 1.7 * axis} width={12} height={R0 * 3.4 * axis} rx={3} fill={COL.gold} filter={SH(1)} />
        {/* B: contorno */}
        <path d={neo(1, 0, 0)} fill="none" stroke={COL.gold} strokeWidth={6} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - eO4(prog(u, 2.0, 2.6))} opacity={1 - prog(u, 2.8, 3.2)} />
        {/* C: tonalità */}
        {['#A86E4E', SK.moleM, SK.moleD].map((c, i) => {
          const p = pop(u, 3.1 + i * 0.1, 0.4, 2.4) * (1 - prog(u, 3.9, 4.2));
          const a = -0.5 + i * 0.5;
          return <circle key={c} cx={500 + Math.cos(a) * 300} cy={500 + Math.sin(a) * 300} r={34 * p} fill={c} stroke={COL.white} strokeWidth={6} filter={SH(2)} />;
        })}
        {/* D: righello di carta */}
        <g opacity={clamp(ruler * 3)} transform={`translate(${(1 - ruler) * -400} ${R0 * 1.42})`}>
          <rect x={500 - L} y={480} width={L * 2} height={64} rx={6} fill={COL.white} filter={SH(2)} />
          {Array.from({length: 13}).map((_, i) => <rect key={i} x={500 - L + 14 + i * ((L * 2 - 28) / 12)} y={480} width={3} height={i % 6 === 0 ? 30 : 16} fill={COL.navy} />)}
          <text x={500} y={532} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={26} fill={COL.navy} letterSpacing={2}>{'> 6 mm'}</text>
        </g>
        <Sparkle x={720} y={300} u={u} t0={5.4} />
        <Sparkle x={290} y={680} u={u} t0={5.9} />
      </Stage>
      <ChapterText lt={u} n={1} title="Mappatura dei nei" dark labels={[[0.3, 'Regola ABCDE'], [1, 'A · Asimmetria'], [2, 'B · Bordi'], [3, 'C · Colore'], [4, 'D · Dimensione'], [5, 'E · Evoluzione']]} />
    </AbsoluteFill>
  );
};

/* ═════════════ 02 — MACCHIE ═════════════ */
const LENT: [number, number, number][] = [[560, 380, 24], [615, 432, 18], [520, 455, 16], [650, 370, 14], [598, 505, 20], [495, 388, 13]];
const Macchie: React.FC<{lt: number}> = ({lt: u}) => {
  const fade = (k: number) => 1 - eIO(prog(u, 5.0 + k * 0.14, 5.5 + k * 0.14));
  const lx = lerp(200, 760, eIO(prog(u, 4.0, 4.9))), ly = 560 + Math.sin(prog(u, 4.0, 4.9) * Math.PI * 2) * 90;
  const lens = pop(u, 3.85, 0.4, 2) * (1 - eIO(prog(u, 4.95, 5.3)));
  const sun = pop(u, 0.25, 0.5, 2);
  const tag = (x: number, y: number, t: string, t0: number) => {
    const p = pop(u, t0, 0.35, 2.4) * (1 - prog(u, 5.0, 5.25));
    return p > 0 && (
      <g transform={`${sc(x, y, p)} rotate(${-6} ${x} ${y})`} filter={SH(2)}>
        <rect x={x - 6} y={y - 24} width={t.length * 16 + 34} height={48} rx={4} fill={COL.gold} />
        <circle cx={x + 8} cy={y} r={6} fill={COL.navy} />
        <text x={x + 22} y={y + 8} fontFamily={SANS} fontWeight={600} fontSize={22} fill={COL.navyDeep}>{t}</text>
      </g>
    );
  };
  return (
    <AbsoluteFill>
      <BgPaper t={u} base={COL.ice} tones={[COL.sky, COL.white]} seed={5} />
      <Stage lt={u}>
        <SkinPanel u={u} seed={31} />
        {/* sole di carta + raggi */}
        <g transform={`${sc(820, 170, sun)} translate(${(1 - clamp(sun)) * 200} ${(1 - clamp(sun)) * -200})`} opacity={1 - prog(u, 3.4, 3.8)}>
          <g transform={`rotate(${u * 25} 820 170)`}>
            {Array.from({length: 12}).map((_, i) => <path key={i} d="M808 70 L820 30 L832 70Z" fill={COL.goldDeep} filter={SH(1)} transform={`rotate(${i * 30} 820 170)`} />)}
          </g>
          <circle cx={820} cy={170} r={84} fill={COL.gold} filter={SH(2)} />
          <circle cx={820} cy={170} r={56} fill="#F2DE96" />
        </g>
        {[0, 1, 2, 3].map((i) => {
          const p = eO4(prog(u, 0.6 + i * 0.08, 1.05 + i * 0.08));
          const o = 1 - prog(u, 1.2 + i * 0.08, 1.5 + i * 0.08);
          const [tx, ty] = LENT[i];
          return <line key={i} x1={820} y1={170} x2={lerp(820, tx, p)} y2={lerp(170, ty, p)} stroke={COL.gold} strokeWidth={9} strokeLinecap="round" opacity={o} filter={SH(1)} />;
        })}
        {/* lentigo solari */}
        {LENT.map(([x, y, r], i) => (
          <path key={i} d={wob(x, y, r, r * 0.9, 50 + i, 0.12)} fill="#A8714F" filter={SH(1)} opacity={fade(i % 3)} transform={sc(x, y, pop(u, 1.0 + i * 0.07, 0.35, 2.4) * lerp(0.6, 1, fade(i % 3)))} />
        ))}
        {/* melasma: chiazze ampie */}
        {[[320, 560, 130, 92, 0], [560, 650, 112, 70, 1]].map(([x, y, rx, ry, k]) => (
          <path key={k} d={wob(x, y, rx, ry, 60 + k, 0.16)} fill="#C79270" opacity={0.92 * fade(k + 1)} filter={SH(1)} transform={sc(x, y, lerp(0.7, 1, fade(k + 1)), pop(u, 2.0 + k * 0.15, 0.45, 1.6))} />
        ))}
        {/* post-infiammatoria: rossa → bruna */}
        {(() => {
          const p = pop(u, 3.0, 0.35, 2.4);
          const ring = prog(u, 3.0, 3.6);
          return (
            <g opacity={fade(2)}>
              {ring > 0 && ring < 1 && <circle cx={350} cy={780} r={30 + ring * 70} fill="none" stroke={SK.red} strokeWidth={5} opacity={1 - ring} />}
              <path d={wob(350, 780, 30, 28, 70, 0.1)} fill={mix(SK.red, '#8E5B45', prog(u, 3.3, 3.9))} filter={SH(1)} transform={sc(350, 780, p)} />
            </g>
          );
        })()}
        {tag(150, 440, 'Melasma', 4.25)}
        {tag(690, 300, 'Lentigo', 4.62)}
        {tag(410, 840, 'PIH', 4.45)}
        {/* trattamento: fascia di luce */}
        {(() => {
          const p = eIO(prog(u, 5.0, 6.1));
          return p > 0 && p < 1 && <rect x={lerp(-300, 1000, p)} y={80} width={160} height={900} fill={COL.gold} opacity={0.32} transform={`rotate(14 500 500)`} />;
        })()}
        {[[560, 400], [330, 560], [560, 650], [350, 780], [620, 470]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} u={u} t0={5.2 + i * 0.15} />)}
        {/* lente di carta */}
        {lens > 0 && (
          <g transform={sc(lx, ly, lens)} filter={SH(3)}>
            <rect x={lx + 92} y={ly + 80} width={130} height={34} rx={14} fill={COL.navy} transform={`rotate(45 ${lx + 92} ${ly + 80})`} />
            <circle cx={lx} cy={ly} r={118} fill={COL.navy} />
            <circle cx={lx} cy={ly} r={96} fill={COL.white} opacity={0.35} />
            <path d={`M${lx - 60} ${ly - 40} A70 70 0 0 1 ${lx - 10} ${ly - 70}`} stroke={COL.white} strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.8} />
          </g>
        )}
      </Stage>
      <ChapterText lt={u} n={2} title="Macchie della pelle" labels={[[0.3, 'Ogni macchia è diversa'], [1, 'Lentigo solari'], [2, 'Melasma'], [3, 'Post-infiammatorie'], [4, 'Prima si capisce'], [5, 'Poi si interviene']]} />
    </AbsoluteFill>
  );
};

/* ═════════════ 03 — MALATTIE (sezione della pelle) ═════════════ */
const Malattie: React.FC<{lt: number}> = ({lt: u}) => {
  const cure = (d: number) => 1 - eIO(prog(u, 5.0 + d, 5.45 + d));
  const lay: [number, number, string, number][] = [[700, 930, SK.fat, 0], [480, 720, SK.derm, 0.1], [398, 500, SK.l, 0.2], [380, 412, '#F8E5D7', 0.3]];
  const rosa = eO4(prog(u, 2.0, 2.5)), rosaOut = eIO(prog(u, 5.1, 5.6));
  return (
    <AbsoluteFill>
      <BgPaper t={u} base={COL.sky} tones={['#E2EEFF', COL.white]} seed={7} />
      <Stage lt={u}>
        <clipPath id="card"><rect x={80} y={250} width={840} height={700} rx={30} /></clipPath>
        <rect x={80} y={250} width={840} height={700} rx={30} fill={COL.navy} filter={SH(3)} transform={sc(500, 950, 1, pop(u, -0.3, 0.5, 1.3))} />
        <g clipPath="url(#card)">
          {lay.map(([top, bot, c, d], i) => (
            <path key={i} d={band(60, 940, top, bot + 40, i === 3 ? 6 : 10, 80 + i)} fill={c} filter={SH(2)} transform={`translate(0 ${(1 - clamp(pop(u, -0.2 + d, 0.55, 1.4))) * 700})`} />
          ))}
          {/* cellule adipose */}
          {Array.from({length: 18}).map((_, i) => {
            const x = 130 + (i % 9) * 93 + (Math.floor(i / 9) % 2) * 45, y = 775 + Math.floor(i / 9) * 85;
            return <path key={i} d={wob(x, y, 38, 34, 100 + i, 0.06)} fill={SK.fatL} filter={SH(1)} transform={sc(x, y, pop(u, 0.2 + i * 0.02, 0.4, 2))} />;
          })}
          {/* follicoli */}
          {[250, 770].map((x, i) => {
            const p = eO4(prog(u, 0.4 + i * 0.1, 0.9 + i * 0.1));
            return (
              <g key={x}>
                <path d={`M${x} 640 C${x - 14} 560 ${x + 18} 480 ${x + 8} 380 L${x + 22} 300`} stroke={SK.mole} strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
                <ellipse cx={x} cy={648} rx={20 * p} ry={26 * p} fill={SK.moleM} filter={SH(1)} />
              </g>
            );
          })}
          {/* rosacea / dermatite: velo rosso + capillari */}
          <path d={band(60, 940, 392, 500, 10, 82)} fill={SK.red} opacity={0.5} transform={`translate(${(1 - rosa) * -900 + rosaOut * 900} 0)`} />
          {[0, 1, 2, 3].map((i) => {
            const p = eO4(prog(u, 2.2 + i * 0.08, 2.7 + i * 0.08)) * (1 - rosaOut);
            const x = 320 + i * 120;
            return <path key={i} d={`M${x} 610 C${x + 30} 580 ${x - 20} 540 ${x + 15} 505`} stroke="#C9544A" strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />;
          })}
          {/* acne: rilievi infiammati */}
          {[380, 455, 545].map((x, i) => {
            const p = pop(u, 1.0 + i * 0.1, 0.4, 2) * cure(0);
            const y = surfY(x);
            return (
              <g key={x}>
                <circle cx={x} cy={y + 75} r={52 * p} fill="#E58C80" opacity={0.45} />
                <path d={`M${x - 36} ${y + 6} Q${x - 30} ${y - 46} ${x} ${y - 48} Q${x + 30} ${y - 46} ${x + 36} ${y + 6}Z`} fill={SK.red} filter={SH(1)} transform={sc(x, y + 6, 1, p)} />
                <circle cx={x} cy={y - 36 * p} r={9 * p} fill="#FFF4E8" />
              </g>
            );
          })}
          {/* psoriasi: placca a scaglie */}
          <ellipse cx={730} cy={surfY(730) + 4} rx={110 * clamp(pop(u, 3.0, 0.3)) * cure(0.2)} ry={16} fill={SK.red} />
          {Array.from({length: 9}).map((_, i) => {
            const p = eO4(prog(u, 3.05 + i * 0.06, 3.4 + i * 0.06));
            const off = eIO(prog(u, 5.2 + i * 0.03, 5.7 + i * 0.03));
            const x = 650 + (i % 5) * 40 + (i > 4 ? 18 : 0), y = surfY(x) - 10 - (i > 4 ? 20 : 0);
            return p > 0 && <path key={i} d={wob(x, y, 30, 12, 120 + i, 0.15)} fill={['#FFFFFF', '#EEF2F8', '#DDE4EE'][i % 3]} filter={SH(1)} opacity={1 - off} transform={`translate(${off * 40} ${(1 - p) * -300 - off * 260}) rotate(${(1 - p) * 90 + (i % 2 ? 8 : -8) + off * 60} ${x} ${y})`} />;
          })}
          {/* verruche */}
          {Array.from({length: 6}).map((_, i) => {
            const a = (i / 6) * Math.PI - Math.PI;
            const x = 190 + Math.cos(a) * 24, y = surfY(190) - 8 + Math.sin(a) * 22;
            return <path key={i} d={wob(x, y, 19, 19, 140 + i, 0.12)} fill="#D7AF93" filter={SH(1)} transform={sc(x, y, pop(u, 4.0 + i * 0.06, 0.35, 2.2) * cure(0.3))} />;
          })}
          {/* cura: linea d'oro che leviga la superficie */}
          <path d={`M60 ${surfY(60) - 6} ${Array.from({length: 40}).map((_, i) => `L${60 + i * 23} ${surfY(60 + i * 23) - 6}`).join(' ')}`} stroke={COL.gold} strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - eIO(prog(u, 5.3, 6.2))} filter={SH(1)} />
        </g>
        {[[300, 330], [520, 320], [740, 330], [420, 600]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} u={u} t0={5.6 + i * 0.15} />)}
      </Stage>
      <ChapterText lt={u} n={3} title="Malattie della pelle" labels={[[0.3, 'Sotto la superficie'], [1, 'Acne'], [2, 'Rosacea, dermatiti'], [3, 'Psoriasi'], [4, 'Verruche'], [5, 'Diagnosi e cura']]} />
    </AbsoluteFill>
  );
};

/* ═════════════ 04 — CHIRURGIA ═════════════ */
const qb = (a: number, c: number, b: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
const almondPt = (s: number): [number, number, number] => {
  const top = s < 0.5, t = top ? s * 2 : (s - 0.5) * 2;
  const [x0, x1, cy] = top ? [300, 700, 330] : [700, 300, 710];
  const x = qb(x0, 500, x1, t), y = qb(520, cy, 520, t);
  const dx = 2 * (1 - t) * (500 - x0) + 2 * t * (x1 - 500), dy = 2 * (1 - t) * (cy - 520) + 2 * t * (520 - cy);
  return [x, y, (Math.atan2(dy, dx) * 180) / Math.PI];
};
const ALMOND = 'M300 520 Q500 330 700 520 Q500 710 300 520Z';
const Chirurgia: React.FC<{lt: number}> = ({lt: u}) => {
  const cut = eIO(prog(u, 2.0, 2.9));
  const [kx, ky, ka] = almondPt(cut);
  const blade = pop(u, 1.9, 0.3, 2) * (1 - prog(u, 2.9, 3.1));
  const lift = eIO(prog(u, 3.0, 3.85));
  const vial = pop(u, 2.6, 0.45, 1.8);
  const close = eIO(prog(u, 4.2, 4.65));
  const lesion = (
    <>
      <path d={wob(500, 520, 58, 54, 160, 0.12)} fill={SK.mole} filter={SH(1)} />
      <path d={wob(508, 514, 34, 30, 161, 0.15)} fill={SK.moleD} />
    </>
  );
  return (
    <AbsoluteFill>
      <BgPaper t={u} base={COL.white} tones={[COL.ice, COL.sky]} seed={9} />
      <Stage lt={u}>
        <SkinPanel u={u} seed={41} cx={470} cy={540} />
        {/* fondo della ferita */}
        {lift > 0 && (
          <g transform={sc(500, 520, 1, lerp(1, 0.04, close))}>
            <path d={ALMOND} fill="#C76F62" />
            <path d={ALMOND} fill={SK.derm} transform={sc(500, 520, 0.86)} />
          </g>
        )}
        {lift <= 0 && <g transform={sc(500, 520, pop(u, 0.3, 0.45, 2.2))}>{lesion}</g>}
        {/* tratteggio di delimitazione */}
        <path d={ALMOND} fill="none" stroke={COL.gold} strokeWidth={6} strokeDasharray="14 12" opacity={eO4(prog(u, 1.0, 1.3)) * (1 - prog(u, 3.0, 3.2))} />
        <path d={ALMOND} fill="none" stroke={COL.navy} strokeWidth={7} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - eO4(prog(u, 1.0, 1.7))} opacity={0} />
        {/* taglio */}
        <path d={ALMOND} fill="none" stroke={COL.navyDeep} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - cut} opacity={1 - prog(u, 3.0, 3.2)} />
        {/* provetta istologico */}
        <g transform={`translate(0 ${(1 - clamp(vial)) * -500}) ${sc(850, 270, clamp(vial, 0, 1.2))}`} opacity={1 - prog(u, 4.3, 4.6)}>
          <rect x={800} y={150} width={100} height={250} rx={46} fill={COL.white} filter={SH(2)} />
          <rect x={808} y={280} width={84} height={112} rx={40} fill={COL.sky} />
          <rect x={790} y={128} width={120} height={46} rx={8} fill={COL.navy} filter={SH(1)} />
          <rect x={806} y={196} width={88} height={40} fill={COL.gold} />
        </g>
        {/* il tassello che si solleva e vola nella provetta */}
        {lift > 0 && lift < 1 && (
          <g transform={`translate(${lerp(0, 350, lift)} ${lerp(0, -230, lift) - Math.sin(lift * Math.PI) * 140}) ${sc(500, 520, lerp(1, 0.22, eIO(lift)))} rotate(${lift * 40} 500 520)`} filter={SH(3)}>
            <path d={ALMOND} fill={SK.m} />
            {lesion}
          </g>
        )}
        {/* bisturi di carta */}
        {blade > 0 && (
          <g transform={`translate(${kx} ${ky}) rotate(${ka}) scale(${blade}) translate(-46 0)`} filter={SH(2)}>
            <rect x={-200} y={-12} width={170} height={24} rx={8} fill={COL.navy} />
            <rect x={-42} y={-8} width={18} height={16} fill={COL.gold} />
            <path d="M-26 -14 L46 0 L-26 14Z" fill="#DCE3EC" />
          </g>
        )}
        {/* sutura */}
        {Array.from({length: 7}).map((_, i) => {
          const x = 345 + i * 52;
          const p = pop(u, 4.6 + i * 0.09, 0.3, 2.6);
          return (
            <g key={i} transform={sc(x, 520, p)}>
              <line x1={x - 14} y1={498} x2={x + 14} y2={542} stroke={COL.navy} strokeWidth={7} strokeLinecap="round" filter={SH(1)} />
              <line x1={x + 14} y1={498} x2={x - 14} y2={542} stroke={COL.navy} strokeWidth={7} strokeLinecap="round" filter={SH(1)} />
            </g>
          );
        })}
        {close > 0.9 && <path d="M300 520 L700 520" stroke={SK.deep} strokeWidth={5} strokeLinecap="round" />}
        {[[330, 470], [670, 580], [500, 430]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} u={u} t0={5.5 + i * 0.18} />)}
      </Stage>
      <ChapterText lt={u} n={4} title="Dermatologia chirurgica" labels={[[0.3, 'Lesioni cutanee'], [1, 'Delimitazione'], [2, 'Asportazione'], [3, 'Esame istologico'], [4.2, 'Sutura'], [5.4, 'Stessa specialista']]} />
    </AbsoluteFill>
  );
};

/* ═════════════ 05 — ESTETICA E HEALTHY AGING ═════════════ */
const PROFILE = 'M330 110 C470 80 590 140 600 280 C604 320 612 350 640 410 C652 432 642 446 616 452 C620 470 630 486 618 500 C630 512 624 528 608 534 C616 560 612 590 590 610 C560 640 500 650 480 660 L490 760 C500 820 520 860 560 900 L220 900 C250 820 250 760 230 700 C160 620 140 520 160 400 C180 240 230 140 330 110Z';
const LEAF = 'M0 0 C30 -40 90 -40 120 0 C90 40 30 40 0 0Z';
const Estetica: React.FC<{lt: number}> = ({lt: u}) => {
  const weave = eO4(prog(u, 3.0, 3.6));
  return (
    <AbsoluteFill>
      <BgPaper t={u} base={COL.navy} tones={[COL.navyDeep, '#2A4A78']} seed={11} />
      <Stage lt={u}>
        <clipPath id="prof"><path d={PROFILE} /></clipPath>
        {/* healthy aging: anelli che si espandono */}
        {[0, 1, 2, 3].map((i) => {
          const p = eO4(prog(u, 4.0 + i * 0.2, 5.2 + i * 0.2));
          return p > 0 && <circle key={i} cx={470} cy={420} r={180 + i * 90 + p * 60} fill="none" stroke={i % 2 ? COL.sky : COL.gold} strokeWidth={14 - i * 2} opacity={0.9 * (1 - prog(u, 6.3, 7)) * clamp(p * 2)} filter={SH(2)} />;
        })}
        {/* foglie (naturalezza) */}
        {[[210, 190, -140], [150, 340, 170], [270, 90, -110], [140, 500, 150], [340, 60, -80], [190, 640, 140]].map(([x, y, a], i) => (
          <path key={i} d={LEAF} fill={[COL.gold, COL.blueSoft, COL.goldDeep][i % 3]} filter={SH(1)} transform={`translate(${x} ${y}) rotate(${a + Math.sin(u * 2 + i) * 6}) scale(${pop(u, 1.0 + i * 0.08, 0.45, 2) * 1.1})`} />
        ))}
        {/* profilo a strati */}
        {[[COL.sky, -34, 12], [COL.blueSoft, -17, 6], [COL.ice, 0, 0]].map(([c, dx, dy], i) => {
          const p = eO5(prog(u, -0.2 + i * 0.12, 0.5 + i * 0.12));
          return <path key={i} d={PROFILE} fill={c as string} filter={SH(i ? 2 : 3)} transform={`translate(${(dx as number) + (1 - p) * -700} ${dy})`} />;
        })}
        {/* collagene intrecciato (prevenzione) */}
        <g clipPath="url(#prof)">
          {Array.from({length: 12}).map((_, i) => {
            const p = eO4(prog(u, 3.0 + i * 0.04, 3.5 + i * 0.04));
            return <rect key={i} x={-200 + i * 80} y={100} width={30} height={900} fill={i % 2 ? COL.gold : COL.sky} opacity={0.55 * weave} filter={SH(1)} transform={`rotate(${i % 2 ? 30 : -30} 400 500) translate(0 ${(1 - p) * 900})`} />;
          })}
        </g>
        {/* armonia: proporzioni */}
        {[280, 440, 600].map((y, i) => {
          const p = eO4(prog(u, 2.0 + i * 0.12, 2.5 + i * 0.12));
          return <rect key={y} x={390} y={y - 4} width={360 * p} height={8} rx={4} fill={COL.gold} filter={SH(1)} opacity={1 - prog(u, 2.9, 3.2) * 0.6} />;
        })}
        {[[420, 280], [560, 440], [520, 600]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={13 * pop(u, 2.3 + i * 0.12, 0.3, 2.5)} fill={COL.navy} stroke={COL.gold} strokeWidth={5} />)}
        {[[700, 200], [760, 520], [330, 300], [640, 760]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} u={u} t0={4.3 + i * 0.25} />)}
      </Stage>
      <ChapterText lt={u} n={5} title="Estetica e healthy aging" dark labels={[[0.3, 'Un approccio medico'], [1, 'Naturalezza'], [2, 'Armonia'], [3, 'Prevenzione'], [4, 'Healthy aging'], [5.2, 'Specchio del benessere']]} />
    </AbsoluteFill>
  );
};

/* ═════════════ 06 — LA VISITA ═════════════ */
const StepIcon: React.FC<{k: number; p: number}> = ({k, p}) => {
  const s = {transform: `scale(${p})`, transformOrigin: 'center', transformBox: 'fill-box' as const};
  return (
    <svg width={150} height={150} viewBox="0 0 150 150" style={{overflow: 'visible'}}>
      <Defs />
      {k === 0 && <g style={s}><path d="M20 30 H130 V100 H70 L45 125 V100 H20Z" fill={COL.sky} filter={SH(2)} /><rect x={40} y={52} width={70} height={9} rx={4} fill={COL.navy} /><rect x={40} y={72} width={46} height={9} rx={4} fill={COL.gold} /></g>}
      {k === 1 && <g style={s}><rect x={88} y={92} width={56} height={18} rx={8} fill={COL.navy} transform="rotate(45 88 92)" filter={SH(1)} /><circle cx={65} cy={65} r={48} fill={COL.navy} filter={SH(2)} /><circle cx={65} cy={65} r={34} fill={SK.m} /><circle cx={70} cy={62} r={12} fill={SK.mole} /></g>}
      {k === 2 && <g style={s}><rect x={28} y={18} width={94} height={118} rx={8} fill={COL.white} filter={SH(2)} /><rect x={55} y={10} width={40} height={20} rx={5} fill={COL.gold} />{[50, 78, 106].map((y) => <g key={y}><rect x={44} y={y - 6} width={12} height={12} rx={2} fill={COL.gold} /><rect x={64} y={y - 4} width={42} height={8} rx={4} fill={COL.navy} /></g>)}</g>}
    </svg>
  );
};
const Visita: React.FC<{lt: number}> = ({lt}) => {
  const {W, H, v} = useD();
  const steps = ['Anamnesi', 'Esame della pelle', 'Piano su misura'];
  const cw = v ? 820 : 520, ch = v ? 330 : 520;
  return (
    <AbsoluteFill>
      <BgPaper t={lt} base={COL.ice} tones={[COL.sky, COL.white]} seed={13} />
      <div style={{position: 'absolute', top: v ? 170 : 110, width: W, textAlign: 'center'}}>
        <Kicker text="La visita" lt={lt} center size={v ? 26 : 22} />
        <div style={{height: 22}} />
        <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: v ? 84 : 72, color: COL.ink}}><Words text="Dall'ascolto al piano" lt={lt} d={0.1} /></div>
      </div>
      {steps.map((s, i) => {
        const d = 0.3 + i * 0.3;
        const p = eO5(prog(lt, d, d + 0.6));
        const x = v ? (W - cw) / 2 : W / 2 - (cw * 3 + 60) / 2 + i * (cw + 30), y = v ? 470 + i * (ch + 40) : H * 0.36;
        return (
          <div key={s} style={{position: 'absolute', left: x, top: y, width: cw, height: ch, perspective: 1400}}>
            <div style={{width: '100%', height: '100%', background: COL.white, boxShadow: `0 ${lerp(4, 22, p)}px ${lerp(6, 40, p)}px rgba(11,26,51,.22)`, transform: `rotateX(${(1 - p) * 95}deg)`, transformOrigin: 'bottom', display: 'flex', flexDirection: v ? 'row' : 'column', alignItems: 'center', justifyContent: v ? 'flex-start' : 'center', gap: v ? 40 : 18, padding: v ? '0 60px' : 0}}>
              <StepIcon k={i} p={pop(lt, d + 0.3, 0.4, 2.2)} />
              <div style={{textAlign: v ? 'left' : 'center'}}>
                <div style={{fontFamily: SERIF, fontSize: v ? 72 : 76, color: COL.gold, lineHeight: 1}}>0{i + 1}</div>
                <div style={{fontFamily: SERIF, fontSize: v ? 52 : 44, color: COL.ink, marginTop: 10}}>{s}</div>
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ═════════════ 07 — CHIUSURA ═════════════ */
const Outro: React.FC<{lt: number}> = ({lt}) => {
  const {W, H, v} = useD();
  const pw = v ? 560 : 440, ph = pw * 1.25;
  const px = v ? (W - pw) / 2 : W * 0.16, py = v ? 190 : (H - ph) / 2;
  const btn = pop(lt, 1.4, 0.4, 2);
  return (
    <AbsoluteFill>
      <BgPaper t={lt} base={COL.navyDeep} tones={[COL.navy, '#24426B']} seed={17} />
      {[[COL.gold, 40, 40, 0.0, -5], [COL.blueSoft, 20, 20, 0.08, 3], [COL.white, 0, 0, 0.16, 0]].map(([c, dx, dy, d, r], i) => {
        const p = pop(lt, d as number, 0.5, 1.5);
        return <div key={i} style={{position: 'absolute', left: px + (dx as number) - 16, top: py + (dy as number) - 16, width: pw + 32, height: ph + 32, background: c as string, boxShadow: '0 14px 30px rgba(0,0,0,.35)', transform: `translateY(${(1 - clamp(p)) * H}px) rotate(${(r as number) * (1 + (1 - clamp(p)) * 3)}deg)`}} />;
      })}
      <div style={{position: 'absolute', left: px, top: py, width: pw, height: ph, overflow: 'hidden', clipPath: `inset(${(1 - eO5(prog(lt, 0.25, 0.8))) * 100}% 0 0 0)`}}>
        <Img src={staticFile('doc.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${lerp(1.3, 1.05, eO4(prog(lt, 0.25, 2)))})`}} />
      </div>
      <div style={{position: 'absolute', left: v ? 80 : W * 0.5, top: v ? py + ph + 110 : H * 0.24, width: v ? W - 160 : W * 0.42, textAlign: v ? 'center' : 'left', display: 'flex', flexDirection: 'column', alignItems: v ? 'center' : 'flex-start'}}>
        <Kicker text="Un'unica specialista" lt={lt} d={0.3} color={COL.gold} center={v} size={v ? 26 : 22} />
        <div style={{height: 26}} />
        <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: v ? 92 : 84, lineHeight: 1.05, color: COL.white}}>
          <Words text="Dott.ssa" lt={lt} d={0.4} />
          <br />
          <Words text="Ana Júlia Campos" lt={lt} d={0.5} stag={0.08} italic color={COL.gold} />
        </div>
        <div style={{height: 30}} />
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: v ? 26 : 22, letterSpacing: 4, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', opacity: eO4(prog(lt, 0.9, 1.3))}}>Longevitas · Rivoli (TO)</div>
        <div style={{height: 44}} />
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: v ? 28 : 24, letterSpacing: 5, color: COL.navyDeep, background: COL.gold, padding: v ? '30px 60px' : '26px 52px', boxShadow: '0 12px 26px rgba(0,0,0,.35)', transform: `scale(${btn}) rotate(${(1 - clamp(btn)) * -8}deg)`}}>PRENOTA LA VISITA</div>
      </div>
    </AbsoluteFill>
  );
};

/* ═════════════ transizioni: fogli di carta che entrano ═════════════ */
type Tr = 'none' | 'iris' | 'right' | 'left' | 'up';
const Enter: React.FC<{lt: number; pre: number; type: Tr; cx?: number; cy?: number; children: React.ReactNode}> = ({lt, pre, type, cx, cy, children}) => {
  const {W, H} = useD();
  const p = pre > 0 ? eIO(prog(lt, -pre, 0)) : 1;
  const settle = eO4(prog(lt, -pre * 0.3, 0.8));
  if (type === 'iris') {
    const X = cx ?? W / 2, Y = cy ?? H / 2;
    const R = Math.hypot(Math.max(X, W - X), Math.max(Y, H - Y)) * p;
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{clipPath: p < 1 ? `circle(${R}px at ${X}px ${Y}px)` : undefined}}>
          <AbsoluteFill style={{transform: `scale(${lerp(1.12, 1, settle)})`}}>{children}</AbsoluteFill>
        </AbsoluteFill>
        {p < 1 && <div style={{position: 'absolute', left: X - R - 14, top: Y - R - 14, width: R * 2 + 28, height: R * 2 + 28, borderRadius: R * 3, border: `14px solid ${COL.gold}`, boxShadow: '0 10px 30px rgba(0,0,0,.35)'}} />}
      </AbsoluteFill>
    );
  }
  const off = 1 - p;
  const tx = type === 'right' ? off * W * 1.1 : type === 'left' ? -off * W * 1.1 : 0;
  const ty = type === 'up' ? off * H * 1.1 : 0;
  const rot = (type === 'left' ? -1 : 1) * off * 7;
  return (
    <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`, boxShadow: p < 1 ? '0 0 80px rgba(11,26,51,.45)' : undefined, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${lerp(1.06, 1, settle)})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const SCENES: {C: React.FC<{lt: number}>; pre: number; tr: Tr; at?: (d: Dim) => [number, number]}[] = [
  {C: Intro, pre: 0, tr: 'none'},
  {C: Nei, pre: 0.5, tr: 'iris', at: ({W, H, v}) => (v ? [W / 2, H * 0.58] : [W * 0.82, H * 0.28])},
  {C: Macchie, pre: 0.45, tr: 'right'},
  {C: Malattie, pre: 0.45, tr: 'up'},
  {C: Chirurgia, pre: 0.45, tr: 'left'},
  {C: Estetica, pre: 0.45, tr: 'up'},
  {C: Visita, pre: 0.45, tr: 'right'},
  {C: Outro, pre: 0.5, tr: 'iris'},
];

export const Movie: React.FC<{width: number; height: number}> = ({width, height}) => {
  const t = useCurrentFrame() / FPS;
  const dim = {W: width, H: height, v: height > width};
  return (
    <Ctx.Provider value={dim}>
      <AbsoluteFill style={{background: COL.navy, overflow: 'hidden'}}>
        {SCENES.map((s, i) => {
          const a = SC[i], b = SC[i + 1];
          if (t < a - s.pre || t >= b) return null;
          const [cx, cy] = s.at ? s.at(dim) : [width / 2, height / 2];
          return (
            <Enter key={i} lt={t - a} pre={s.pre} type={s.tr} cx={cx} cy={cy}>
              <s.C lt={t - a} />
            </Enter>
          );
        })}
        <AbsoluteFill style={{backgroundImage: `url(${staticFile('paper.png')})`, backgroundSize: '768px 768px', mixBlendMode: 'multiply', opacity: 0.55, pointerEvents: 'none'}} />
        <AbsoluteFill style={{background: COL.navyDeep, opacity: prog(t, SC[SC.length - 1] - 0.5, SC[SC.length - 1])}} />
      </AbsoluteFill>
    </Ctx.Provider>
  );
};
