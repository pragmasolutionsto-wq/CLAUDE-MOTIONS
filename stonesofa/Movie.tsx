import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import A from './assets.json';
import {Burst, FONT, Flash, Reveal, Ring, Scene, Shadow, Spr, Txt, decay, shake, useLT, useT} from './fx';
import {CORAL, CREAM, H, INK, LILAC, SAF, TEAL, W, clamp, eBack, eBounce, eI2, eI3, eIO, eO3, eO5, lerp, prog, smooth} from './util';

const M = A as Record<string, any>;
const TAU = Math.PI * 2;

// ───────────────────────── timeline (120 BPM → 1 battuta = 0.5s)
const T_HOOK = 0;
const T_ASM = 3.5;
const T_IMPACT = 7.0;
const T_F1 = 9.5;
const T_F2 = 11.5;
const T_F3 = 13.5;
const T_F4 = 15.5;
const T_COL = 17.5;
const T_LIFE = 23.5;
const T_END = 27.0;
const WD = 0.5; // durata iris

/** foto sasso, ritagliata */
const Stone: React.FC<{k: string; x: number; y: number; s: number; rot?: number; sx?: number; sy?: number; z?: number}> = ({k, x, y, s, rot, sx, sy, z}) => (
  <Spr src={`stk/${k}.png`} x={x} y={y} w={M[k].w * s} h={M[k].h * s} rot={rot} sx={sx} sy={sy} z={z} />
);
/** divano ritagliato, larghezza w */
const Sofa: React.FC<{n: number; x: number; y: number; w: number; rot?: number; sx?: number; sy?: number; op?: number; tf?: string; z?: number}> = ({n, x, y, w, ...r}) => (
  <Spr src={`sofa/s${n}.png`} x={x} y={y} w={w} h={(w * M[`s${n}`].h) / M[`s${n}`].w} {...r} />
);

// ───────────────────────── 1. HOOK
const HOOK_STONES = [
  {k: 'tripL', x: 250, s: 0.95, d: 0.35},
  {k: 'whiteB', x: 610, s: 0.78, d: 0.5},
  {k: 'tripM', x: 960, s: 1.0, d: 0.65},
  {k: 'blackC', x: 1310, s: 0.8, d: 0.8},
  {k: 'tripR', x: 1670, s: 1.15, d: 0.95},
];
const Hook: React.FC = () => {
  const lt = useLT();
  const floor = 1030;
  const slam = (t0: number, t1: number) => {
    const p = prog(lt, t0, t0 + 0.26);
    const q = prog(lt, t1, t1 + 0.16);
    const sc = lerp(1.5, 1, eO5(p)) * (1 - 0.9 * eI3(q));
    return {opacity: p > 0 && q < 1 ? 1 : 0, transform: `scale(${sc}) rotate(${(1 - eO5(p)) * -4 + q * 14}deg) translateY(${-q * 120}px)`, transformOrigin: '0 50%'};
  };
  const whirl = prog(lt, 2.55, 3.45);
  return (
    <>
      <Txt x={110} y={60} size={270} color={INK} style={slam(0.0, 1.45)}>NON È UN</Txt>
      <Txt x={110} y={330} size={270} color={INK} style={slam(0.22, 1.5)}>DIVANO.</Txt>
      <Txt x={110} y={60} size={270} color={INK} style={slam(1.5, 3.2)}>È UNA</Txt>
      <Txt x={110} y={330} size={270} color={CORAL} style={slam(1.72, 3.2)}>PIETRA.</Txt>
      {HOOK_STONES.map((s, i) => {
        const base = M[s.k];
        const h = base.h * s.s;
        const p = prog(lt, s.d, s.d + 0.7);
        const fall = eBounce(p);
        const yTop = lerp(-h - 80, floor - h / 2, fall);
        // squash all'impatto + salto sul cambio parola
        const hop = Math.max(0, Math.sin(prog(lt, 1.5 + i * 0.04, 1.85 + i * 0.04) * Math.PI)) * 70;
        const land = p >= 1 ? 1 : 0;
        const sq = 1 + (land ? 0 : 0) + (p > 0.34 && p < 0.5 ? -0.12 : 0);
        // vortice verso il centro
        const wx = lerp(s.x, 960, eI3(whirl)) + Math.cos(whirl * TAU * 1.4 + i * 1.3) * (1 - whirl) * 0 + Math.sin(whirl * TAU * 1.2 + i) * 160 * Math.sin(whirl * Math.PI);
        const wy = lerp(yTop, 560, eI3(whirl)) - hop + Math.cos(whirl * TAU * 1.2 + i) * 120 * Math.sin(whirl * Math.PI);
        return (
          <React.Fragment key={i}>
            <Shadow x={s.x} y={floor + 12} w={base.w * s.s * 1.1} op={0.35 * (1 - whirl) * clamp(p * 2)} />
            <Stone k={s.k} x={wx} y={wy} s={s.s * lerp(1, 0.55, eI2(whirl))} sx={1 / sq} sy={sq} rot={whirl * 540 + Math.sin(lt * 9 + i) * (p < 1 ? 5 : 0)} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// ───────────────────────── 2. ASSEMBLAGGIO
const KS = 0.8;
const KF = 0.88;
const OC = {x: 960, y: 600};
const PIECES = [
  {k: 'base', s: M.hs_base, f: M.sf_base, ss: 'p/hs_base.png', fs: 'p/sf_base.png', th0: 0.0, rx: 80, ry: 36, spin: 2, flip: 0},
  {k: 'white', s: M.hs_white, f: M.sf_back, ss: 'p/hs_white.png', fs: 'p/sf_back.png', th0: 0.5, rx: 520, ry: 200, spin: 3, flip: 3},
  {k: 'spk', s: M.hs_spk, f: M.sf_cush, ss: 'p/hs_spk.png', fs: 'p/sf_cush.png', th0: 0.5 + Math.PI, rx: 520, ry: 200, spin: 4, flip: 2},
];
const stackC = (p: (typeof PIECES)[0]) => ({x: 960 + (p.s.x + p.s.w / 2 - 340) * KS, y: 570 + (p.s.y + p.s.h / 2 - 361) * KS});
const sofaC = (p: (typeof PIECES)[0]) => ({x: 960 + (p.f.x + p.f.w / 2 - 622) * KF, y: 672 + (p.f.y + p.f.h / 2 - 304.5) * KF});

const Assembly: React.FC = () => {
  const lt = useLT();
  const ti = lt - (T_IMPACT - T_ASM);
  const sh = ti > 0 ? shake(ti, 20) : {x: 0, y: 0};
  const pulse = ti > 0 ? 1 + 0.04 * decay(ti, 9) * Math.cos(ti * 26) : 1;
  const float = ti > 0.3 ? Math.sin((ti - 0.3) * 2.4) * 9 * smooth(prog(ti, 0.3, 0.9)) : 0;
  const gs = lerp(0.3, 1, eBack(prog(lt, 0, 0.5)));
  const u = prog(lt, 1.0, 3.5);
  const e = smooth(u);
  const sunP = ti > -0.05 ? eBack(prog(ti, -0.05, 0.55)) : 0;

  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 64%, #44301f 0%, #261b13 38%, #17120F 72%)'}} />
      {/* raggi + portale */}
      <div
        style={{
          position: 'absolute',
          left: -700,
          top: -700,
          width: 3320,
          height: 3320,
          background: `repeating-conic-gradient(from ${lt * 16}deg at 50% 50%, rgba(255,184,28,0.16) 0deg 7deg, rgba(255,184,28,0) 7deg 14deg)`,
          opacity: smooth(prog(lt, 0.8, 2.4)) * (ti > 0 ? 0.55 : 1),
          transform: `translate(0px, 120px)`,
          borderRadius: '50%',
        }}
      />
      <div style={{position: 'absolute', left: OC.x - 650, top: OC.y - 650, width: 1300, height: 1300, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,184,28,${0.45 * smooth(prog(lt, 1, 3.4))}) 0%, rgba(255,90,54,${0.18 * smooth(prog(lt, 1, 3.4))}) 40%, rgba(0,0,0,0) 70%)`}} />

      <div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) scale(${pulse})`, transformOrigin: '960px 640px'}}>
        {/* sole */}
        <div style={{position: 'absolute', left: 960 - 330, top: 705 - 330 + float * 0.4, width: 660, height: 660, borderRadius: '50%', background: SAF, transform: `scale(${sunP})`}} />
        <Shadow x={960} y={930} w={1020} op={0.55 * smooth(prog(lt, 3.1, 3.6))} />

        <div style={{position: 'absolute', inset: 0, transform: `translateY(${float}px)`}}>
          {PIECES.map((p) => {
            const sc0 = stackC(p);
            const so0 = sofaC(p);
            const th = p.th0 + TAU * 3 * e;
            const depth = Math.sin(th);
            const ds = 1 + 0.3 * depth * (p.k === 'base' ? 0.2 : 1);
            const orb = {x: OC.x + p.rx * Math.cos(th), y: OC.y + p.ry * Math.sin(th)};
            const a = prog(lt, 0.55, 1.0);
            const ex = eIO(a);
            const hop = -150 * Math.sin(Math.PI * a);
            const ww0 = p.s.w * KS * gs, hh0 = p.s.h * KS * gs;
            const cx = lerp(960 + (sc0.x - 960) * gs, orb.x, ex);
            const cy = lerp(570 + (sc0.y - 570) * gs, orb.y, ex) + hop;
            const w1 = lerp(ww0, p.s.w * KS * ds, ex);
            const h1 = lerp(hh0, p.s.h * KS * ds, ex);
            const c = prog(lt, 2.85, 3.5);
            const ec = Math.pow(c, 2.4);
            const X = lerp(cx, so0.x, ec);
            const Y = lerp(cy, so0.y, ec);
            const Wd = lerp(w1, p.f.w * KF, ec);
            const Ht = lerp(h1, p.f.h * KF, ec);
            const fl = p.flip ? Math.cos(TAU * p.flip * e) : 1;
            const sx = Math.sign(fl || 1) * Math.max(Math.abs(fl), 0.16);
            const rot = 360 * p.spin * e + (p.k !== 'base' ? Math.sin(lt * 7 + p.th0) * 6 * (1 - ec) : 0);
            const sOp = smooth(prog(c, 0.5, 0.9));
            const z = c > 0.4 ? (p.k === 'base' ? 2 : p.k === 'white' ? 3 : 4) : p.k === 'base' ? 2 : depth > 0 ? (p.k === 'white' ? 5 : 6) : 0;
            return (
              <React.Fragment key={p.k}>
                {sOp < 1 && <Spr src={p.ss} x={X} y={Y} w={Wd} h={Ht} rot={rot} sx={sx} op={1 - sOp} z={z} />}
                {sOp > 0 && <Spr src={p.fs} x={X} y={Y} w={Wd} h={Ht} rot={rot} sx={sx} op={sOp} z={z} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <Ring t={ti} x={960} y={700} maxR={1300} dur={0.9} color={CREAM} w={26} />
      <Ring t={ti - 0.08} x={960} y={700} maxR={1100} dur={0.9} color={CORAL} w={18} />
      <Ring t={ti - 0.16} x={960} y={700} maxR={900} dur={0.9} color={SAF} w={12} />
      <Burst t={ti} x={960} y={760} n={44} seed={11} power={1.05} life={1.6} />
      <Flash t={ti} dur={0.32} />

      <Reveal x={960} y={64} size={214} color={CREAM} align="center" t0={ti > 0 ? 0.28 : 99} lt={ti} stag={0.045}>STONE SOFA</Reveal>
      <Reveal x={960} y={318} size={62} color={SAF} font="cg" italic weight={600} align="center" t0={0.95} lt={ti} stag={0.018}>Divani nati dalle pietre.</Reveal>
    </>
  );
};

// ───────────────────────── 3. FEATURES
const F1: React.FC = () => {
  const lt = useLT();
  const p = prog(lt, 0.1, 0.8);
  const x = lerp(2500, 1190, eO5(p));
  const rot = lerp(18, -2, eBack(p)) + Math.sin(lt * 3) * 0.6 * p;
  const lens = eBack(prog(lt, 0.45, 0.95));
  const cap = eO5(prog(lt, 0.75, 1.2));
  return (
    <>
      <Reveal x={100} y={40} size={330} color={CREAM} t0={0.05} stag={0.05}>BOUCLÉ</Reveal>
      <div style={{position: 'absolute', left: 560 - 700, top: 740 - 500, width: 1400, height: 1000, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,184,28,0.45) 0%, rgba(255,184,28,0) 60%)`, opacity: p}} />
      <Shadow x={1190} y={938} w={1000} op={0.45 * p} />
      <Sofa n={4} x={x} y={730} w={1020} rot={rot} />
      {/* lente macro */}
      <div style={{position: 'absolute', left: 340 - 215, top: 830 - 215, width: 430, height: 430, borderRadius: '50%', overflow: 'hidden', border: `12px solid ${CREAM}`, boxSizing: 'border-box', transform: `scale(${lens})`, background: INK}}>
        <Img src={staticFile('sofa/s4.png')} style={{position: 'absolute', width: 1244 * 3.6, height: 609 * 3.6, left: -(560 * 3.6) + 215 - lt * 50, top: -(430 * 3.6) + 215}} />
      </div>
      <Txt x={110} y={450} size={52} font="mn" weight={800} color={CREAM} style={{opacity: cap, transform: `translateY(${(1 - cap) * 30}px)`, lineHeight: 1.18}}>
        {'Morbido come un\nsasso levigato.'}
      </Txt>
      <Txt x={110} y={580} size={28} font="mn" weight={700} color={INK} ls={3} style={{opacity: cap, background: SAF, padding: '10px 18px', borderRadius: 40, transform: `translateY(${(1 - cap) * 30}px)`}}>
        BOUCLÉ DI LANA RICICLATA
      </Txt>
    </>
  );
};

const F2: React.FC = () => {
  const lt = useLT();
  const zero = eBack(prog(lt, 0.0, 0.55), 2.2);
  const p = prog(lt, 0.15, 0.7);
  const draw = eIO(prog(lt, 0.4, 1.3));
  const L = 2900;
  return (
    <>
      <Txt x={40} y={-10} size={900} color={SAF} style={{transform: `scale(${zero}) rotate(${(1 - zero) * -12}deg)`, transformOrigin: '300px 500px'}}>0</Txt>
      <Reveal x={110} y={790} size={150} color={CREAM} t0={0.3} stag={0.05}>SPIGOLI.</Reveal>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <ellipse cx={1250} cy={520} rx={560} ry={300} fill="none" stroke={CREAM} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${L * draw} ${L}`} transform="rotate(-4 1250 520)" />
      </svg>
      <Shadow x={1250} y={742} w={880} op={0.5 * p} />
      <Sofa n={6} x={lerp(2300, 1250, eO5(p))} y={520 + Math.sin(lt * 3) * 6} w={900} rot={lerp(-14, 0, eBack(p)) + Math.sin(lt * 2.4) * 1.2} />
      <Txt x={1250} y={880} size={62} font="cg" italic weight={600} color={CREAM} align="center" style={{opacity: eO5(prog(lt, 0.9, 1.3))}}>
        Forme organiche, scolpite a mano.
      </Txt>
    </>
  );
};

const F3: React.FC = () => {
  const lt = useLT();
  const C = {x: 1010, y: 770};
  const K = 0.78;
  const rise = eO5(prog(lt, 0, 0.45));
  const sun = eBack(prog(lt, 0.0, 0.6));
  const seg = (a: number, b: number, ease = eIO) => ease(prog(lt, a, b));
  const arc = (a: number, b: number, h: number) => -Math.sin(Math.PI * prog(lt, a, b)) * h;
  // schienale
  const bx = 150 * seg(0.7, 1.3);
  const by = -40 * seg(0.7, 1.3) + arc(0.7, 1.3, 190);
  const br = 8 * seg(0.7, 1.3) + 360 * 0 + Math.sin(lt * 14) * 0;
  // cuscino
  const cx2 = -560 * seg(0.5, 1.05);
  const cy2 = 60 * seg(0.5, 1.05) + arc(0.5, 1.05, 300);
  const cr = -540 * seg(0.5, 1.05);
  // ritorno finale leggero
  const fin = seg(1.55, 1.95, eO3);
  const squash = 1 - 0.06 * Math.max(0, Math.sin(prog(lt, 1.05, 1.2) * Math.PI));
  const pos = (n: 'base' | 'back' | 'cush') => {
    const m = M[`sf_${n}`];
    return {x: C.x + (m.x + m.w / 2 - 622) * K, y: C.y + (m.y + m.h / 2 - 304.5) * K, w: m.w * K, h: m.h * K};
  };
  const b0 = pos('base'), k0 = pos('back'), c0 = pos('cush');
  const drop = (1 - rise) * 600;
  return (
    <>
      <div style={{position: 'absolute', left: C.x - 400, top: C.y - 330, width: 800, height: 800, borderRadius: '50%', background: SAF, transform: `scale(${sun})`}} />
      <Reveal x={100} y={50} size={230} color={INK} t0={0.05} stag={0.05}>2 PEZZI.</Reveal>
      <Reveal x={100} y={300} size={150} color={CORAL} t0={0.3} stag={0.04}>INFINITI MODI.</Reveal>
      <Shadow x={C.x} y={C.y + 235 + drop} w={1000} op={0.4 * rise} />
      <Spr src="p/sf_base.png" x={b0.x} y={b0.y + drop} w={b0.w} h={b0.h} sy={squash} z={1} />
      <Spr src="p/sf_back.png" x={k0.x + bx * (1 - fin)} y={k0.y + by * (1 - fin) + drop} w={k0.w} h={k0.h} rot={br * (1 - fin)} z={2} />
      <Spr src="p/sf_cush.png" x={c0.x + cx2 * (1 - fin)} y={c0.y + cy2 * (1 - fin) + drop} w={c0.w} h={c0.h} rot={cr * (1 - fin)} z={3} />
      <Txt x={1820} y={150} size={44} font="mn" weight={800} color={INK} align="right" ls={2} style={{opacity: eO5(prog(lt, 1.0, 1.4))}}>
        {'COMPONI\nCOME VUOI.'}
      </Txt>
    </>
  );
};

const F4: React.FC = () => {
  const lt = useLT();
  const rows = [
    {v: 10, big: '10', label: 'ANNI DI\nGARANZIA', d: 0.05},
    {v: 100, big: '100%', label: 'SFODERABILE', d: 0.5},
    {v: 30, big: '30°', label: 'LAVABILE IN\nLAVATRICE', d: 1.0},
  ];
  const sun = eBack(prog(lt, 0, 0.6));
  const p = prog(lt, 0.2, 0.8);
  return (
    <>
      <div style={{position: 'absolute', left: 1450 - 380, top: 560 - 380, width: 760, height: 760, borderRadius: '50%', background: SAF, transform: `scale(${sun})`}} />
      <Shadow x={1450} y={790} w={820} op={0.5 * p} />
      <Sofa n={2} x={lerp(2500, 1450, eO5(p))} y={580 + Math.sin(lt * 3) * 6} w={820} rot={lerp(16, 0, eBack(p))} />
      {rows.map((r, i) => {
        const e = eO5(prog(lt, r.d, r.d + 0.5));
        const n = Math.round(r.v * eO3(prog(lt, r.d, r.d + 0.55)));
        const txt = r.big.includes('%') ? `${n}%` : r.big.includes('°') ? `${n}°` : `${n}`;
        return (
          <div key={i} style={{position: 'absolute', left: 100, top: 40 + i * 345, opacity: e, transform: `translateX(${(1 - e) * -500}px)`}}>
            <div style={{fontFamily: FONT.ab, fontSize: 235, color: SAF, lineHeight: 1}}>{txt}</div>
            <div style={{fontFamily: FONT.mn, fontWeight: 800, fontSize: 44, color: CREAM, whiteSpace: 'pre', lineHeight: 1, letterSpacing: 3, marginTop: 6}}>{r.label.replace('\n', ' ')}</div>
          </div>
        );
      })}
    </>
  );
};

// ───────────────────────── 4. COLORI
const SLOTS = [
  {n: 4, name: 'ARGILLA', bg: TEAL, ghost: '#17887E', dot: '#9c7358', ink: CREAM},
  {n: 2, name: 'BASALTO', bg: SAF, ghost: '#FFCB52', dot: '#3a2f2a', ink: INK},
  {n: 3, name: 'NEBBIA', bg: CORAL, ghost: '#FF7C5F', dot: '#b7b3ad', ink: INK},
  {n: 5, name: 'DUNA', bg: INK, ghost: '#2C241E', dot: '#b99c7c', ink: CREAM},
  {n: 6, name: 'ARDESIA', bg: CREAM, ghost: '#E8DCC6', dot: '#6b6b6e', ink: INK},
  {n: 1, name: 'CIOTTOLO', bg: LILAC, ghost: '#B6A9FF', dot: '#8d8a86', ink: INK},
];
const Colori: React.FC = () => {
  const lt = useLT();
  return (
    <>
      {SLOTS.map((s, k) => {
        const st = lt - k;
        if (st < -0.02) return null;
        const sweep = k === 0 ? 1 : eIO(prog(st, 0, 0.3));
        let clip: string | undefined;
        if (sweep < 1) {
          const X = lerp(W + 260, -260, sweep);
          clip = `polygon(${X + 170}px 0, ${W + 400}px 0, ${W + 400}px ${H}px, ${X - 170}px ${H}px)`;
        }
        const pIn = prog(st, k === 0 ? 0.05 : 0.12, 0.62);
        const e = eBack(pIn, 1.4);
        const nameP = eO5(prog(st, 0.12, 0.6));
        const sofaW = 1040;
        return (
          <div key={k} style={{position: 'absolute', inset: 0, background: s.bg, clipPath: clip, overflow: 'hidden'}}>
            <Txt x={960} y={500} size={310} color={s.ghost} align="center" style={{transform: `translateX(-50%) translateY(${(1 - nameP) * 340}px)`, opacity: nameP}}>
              {s.name}
            </Txt>
            <Shadow x={960} y={760} w={880} op={0.45 * pIn} />
            <Sofa n={s.n} x={960} y={520} w={sofaW} op={clamp(pIn * 3)} tf={`perspective(1500px) rotateY(${(1 - e) * -80}deg) translateY(${(1 - e) * 200}px)`} sx={lerp(0.5, 1, e)} sy={lerp(0.5, 1, e)} />
            <Txt x={100} y={86} size={40} font="mn" weight={800} color={s.ink} ls={3}>{`COLORE 0${k + 1}/06`}</Txt>
            <Txt x={100} y={140} size={96} color={s.ink} style={{transform: `translateX(${(1 - nameP) * -80}px)`, opacity: nameP}}>
              {s.name}
            </Txt>
            {/* campioni */}
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 74, display: 'flex', justifyContent: 'center', gap: 26}}>
              {SLOTS.map((d, j) => (
                <div key={j} style={{width: 54, height: 54, borderRadius: '50%', background: d.dot, border: `5px solid ${j === k ? s.ink : 'rgba(0,0,0,0.0)'}`, boxSizing: 'border-box', transform: `scale(${j === k ? 1.35 : 0.85})`, outline: j === k ? 'none' : `2px solid ${s.ink}33`}} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};

// ───────────────────────── 5. LIFESTYLE
const WINS = [
  {src: 'sofa/room1.jpg', fx: 0.64, label: 'COSTA', x: 340, y: 150, d: 0.0, blob: '46% 54% 50% 50% / 58% 44% 56% 42%'},
  {src: 'sofa/room5.jpg', fx: 0.5, label: 'CITTÀ', x: 960, y: 250, d: 0.5, blob: '54% 46% 48% 52% / 44% 56% 46% 54%'},
  {src: 'sofa/room2.jpg', fx: 0.6, label: 'NOTTE', x: 1580, y: 150, d: 1.0, blob: '48% 52% 54% 46% / 56% 42% 58% 44%'},
];
const Life: React.FC = () => {
  const lt = useLT();
  const wW = 600, wH = 740, iH = 800, iW = iH * 1.5;
  const head = prog(lt, 2.0, 2.4);
  return (
    <>
      {WINS.map((w, i) => {
        const p = eO5(prog(lt, w.d, w.d + 0.65));
        const kb = lerp(1.14, 1.0, prog(lt, w.d, w.d + 2.5));
        const lab = eBack(prog(lt, w.d + 0.45, w.d + 0.8));
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left: w.x - wW / 2,
                top: w.y,
                width: wW,
                height: wH,
                borderRadius: w.blob,
                overflow: 'hidden',
                transform: `translateY(${(1 - p) * 1000}px) rotate(${Math.sin(lt * 2 + i) * 1.4}deg) scale(${lerp(1, 0.94, head)})`,
                background: '#222',
              }}
            >
              <Img src={staticFile(w.src)} style={{position: 'absolute', width: iW, height: iH, left: -(w.fx * iW - wW / 2), top: -(iH - wH) / 2, transform: `scale(${kb})`, transformOrigin: `${w.fx * 100}% 70%`}} />
              <div style={{position: 'absolute', inset: 0, background: INK, opacity: 0.4 * head}} />
            </div>
            <div style={{position: 'absolute', left: w.x, top: w.y + wH - 40, transform: `translateX(-50%) scale(${lab})`, opacity: p, background: SAF, color: INK, fontFamily: FONT.ab, fontSize: 54, padding: '14px 34px 10px', borderRadius: 60}}>
              {w.label}
            </div>
          </React.Fragment>
        );
      })}
      <Txt x={960} y={330} size={300} color={SAF} align="center" style={{opacity: head > 0 ? 1 : 0, transform: `translateX(-50%) scale(${lerp(1.7, 1, eO5(head))}) rotate(${lerp(-5, -3, head)}deg)`, textShadow: `0 14px 0 ${INK}, 0 0 60px rgba(0,0,0,.35)`}}>
        OVUNQUE.
      </Txt>
    </>
  );
};

// ───────────────────────── 6. CHIUSURA
const End: React.FC = () => {
  const lt = useLT();
  const p = prog(lt, 0.1, 0.9);
  const y = lerp(-460, 700, eBounce(p));
  const hit = lt - (0.1 + 0.9 * 0.364);
  const sq = hit > 0 && hit < 0.16 ? 1 - 0.07 * Math.sin((hit / 0.16) * Math.PI) : 1;
  const cta = eBack(prog(lt, 1.7, 2.1));
  const tag = eO5(prog(lt, 1.15, 1.6));
  return (
    <>
      <div style={{position: 'absolute', left: 960 - 520, top: 640 - 520, width: 1040, height: 1040, borderRadius: '50%', background: CORAL, opacity: 0.0}} />
      <Reveal x={960} y={56} size={226} color={INK} align="center" t0={0.55} stag={0.045}>STONE SOFA</Reveal>
      <Txt x={960} y={318} size={78} font="cg" italic weight={600} color={INK} align="center" style={{opacity: tag, transform: `translateX(-50%) translateY(${(1 - tag) * 30}px)`}}>
        Siediti su qualcosa di vero.
      </Txt>
      <Shadow x={960} y={930} w={940} op={0.4 * clamp(p * 1.5)} />
      <Sofa n={4} x={960} y={y} w={940} sy={sq} sx={2 - sq} />
      <div style={{position: 'absolute', left: 960 - 270, top: 966, width: 540, height: 80, borderRadius: 60, background: INK, color: CREAM, fontFamily: FONT.mn, fontWeight: 800, fontSize: 40, letterSpacing: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${cta})`}}>
        stonesofa.it
      </div>
      <Burst t={hit} x={960} y={900} n={30} seed={29} power={0.9} life={1.4} />
    </>
  );
};

// ───────────────────────── MOVIE
export const Movie: React.FC = () => {
  const t = useT();
  const beat = t >= T_IMPACT + 0.5 && t < T_END ? 1 + 0.008 * decay((t - T_IMPACT) % 0.5, 9) : 1;
  const w = (x: number, y: number, ring: string) => ({x, y, dur: WD, ring});
  const E = (n: number) => n + WD + 0.08;
  return (
    <AbsoluteFill style={{background: SAF, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${beat})`}}>
        <Scene from={T_HOOK} end={E(T_ASM)} bg={SAF}>
          <Hook />
        </Scene>
        <Scene from={T_ASM} end={E(T_F1)} bg={INK} wipe={w(960, 560, CORAL)}>
          <Assembly />
        </Scene>
        <Scene from={T_F1} end={E(T_F2)} bg={CORAL} wipe={w(W, H, INK)}>
          <F1 />
        </Scene>
        <Scene from={T_F2} end={E(T_F3)} bg={TEAL} wipe={w(0, 0, SAF)}>
          <F2 />
        </Scene>
        <Scene from={T_F3} end={E(T_F4)} bg={CREAM} wipe={w(960, H, CORAL)}>
          <F3 />
        </Scene>
        <Scene from={T_F4} end={E(T_COL)} bg={INK} wipe={w(W, 0, SAF)}>
          <F4 />
        </Scene>
        <Scene from={T_COL} end={E(T_LIFE)} bg={TEAL} wipe={w(960, 540, CREAM)}>
          <Colori />
        </Scene>
        <Scene from={T_LIFE} end={E(T_END)} bg={INK} wipe={w(0, 540, SAF)}>
          <Life />
        </Scene>
        <Scene from={T_END} end={31} bg={SAF} wipe={w(960, 540, INK)}>
          <End />
        </Scene>
      </div>
    </AbsoluteFill>
  );
};
