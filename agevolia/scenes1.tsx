import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Disc3D, Doc, Eyebrow, Fade, glass, Glow, Title} from './kit';
import {
  CORAL, CYAN, CYAN_HI, eBack, eExpo, eIO, eO3, eO4, eO5, H, it, lerp, MONO, MUTED, NUM, prog, proj, RAL, rnd, SKY, W, WHITE,
} from './util';

/* ------------------------------------------------------------------ S1 — il logo prende forma */

export const S1: React.FC<{lt: number}> = ({lt}) => {
  const land = eExpo(prog(lt, 0.1, 1.7));
  const spin = eO4(prog(lt, 0, 2.0));
  const move = eIO(prog(lt, 2.4, 3.2));
  const size = lerp(400, 300, move);
  const cx = lerp(960, 590, move), cy = lerp(500, 520, move);
  const sc = lerp(0.08, 1, land);
  const ry = lerp(720, 0, spin) + Math.sin(lt * 1.3) * 9 * prog(lt, 1.8, 2.6);
  const rx = lerp(35, 6, spin) + Math.cos(lt * 1.1) * 4;
  const shock = prog(lt, 1.45, 2.4);
  const word = 'Agevolia';
  return (
    <AbsoluteFill>
      <Glow x={cx} y={cy} r={700} c={SKY} o={0.35 * land} />
      {shock > 0 && shock < 1 && (
        <div style={{position: 'absolute', left: cx - 600 * eO3(shock), top: cy - 600 * eO3(shock), width: 1200 * eO3(shock), height: 1200 * eO3(shock), borderRadius: '50%', border: `${4 * (1 - shock) + 1}px solid ${CYAN_HI}`, opacity: 1 - shock, boxShadow: `0 0 40px ${CYAN}`}} />
      )}
      <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, transform: `scale(${sc})`, filter: `blur(${(1 - prog(lt, 0.2, 1.1)) * 10}px)`}}>
        <Disc3D size={size} rx={rx} ry={ry} reveal={eIO(prog(lt, 1.0, 2.1))} shine={lerp(-40, 150, prog(lt, 1.9, 2.8))} glow={land} />
      </div>
      <div style={{position: 'absolute', left: 820, top: 370, perspective: 1200}}>
        <div style={{display: 'flex', fontFamily: RAL, fontWeight: 500, fontSize: 190, color: WHITE, letterSpacing: '-0.02em', lineHeight: 1}}>
          {word.split('').map((ch, i) => {
            const p = prog(lt, 2.75 + i * 0.05, 3.35 + i * 0.05);
            return (
              <span key={i} style={{display: 'inline-block', transform: `rotateX(${(1 - eO4(p)) * -100}deg) translateY(${(1 - eO4(p)) * 50}px)`, transformOrigin: '50% 100%', opacity: p > 0 ? 1 : 0, textShadow: `0 0 40px rgba(44,203,234,${0.35 * p})`}}>
                {ch}
              </span>
            );
          })}
        </div>
        <Eyebrow text="FINANZA AGEVOLATA, UNA NUOVA PROSPETTIVA" lt={lt} delay={3.4} style={{marginTop: 26, marginLeft: 10}} />
        <Fade lt={lt} a={3.7} style={{marginTop: 18, marginLeft: 10, fontFamily: RAL, fontSize: 30, color: MUTED}}>
          per studi, consulenti e imprese
        </Fade>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S2 — il caos dei bandi */

export const S2: React.FC<{lt: number}> = ({lt}) => {
  const r = rnd(42);
  const docs = [];
  const travel = lt * 520 + lt * lt * 70;
  for (let i = 0; i < 46; i++) {
    let x = (r() - 0.5) * 2400, y = (r() - 0.5) * 1400;
    if (Math.abs(x) < 380 && Math.abs(y) < 220) x += x < 0 ? -420 : 420;
    const z0 = r() * 4200, rxs = (r() - 0.5) * 80, rys = (r() - 0.5) * 120, rz0 = (r() - 0.5) * 50, ph = r() * 6;
    const z = ((z0 + travel) % 4200) - 3600;
    const fog = prog(z, -3600, -2400) * (1 - prog(z, 350, 650));
    docs.push(
      <div key={i} style={{position: 'absolute', left: W / 2 + x - 110, top: H / 2 + y - 145, opacity: fog, transformStyle: 'preserve-3d', transform: `translateZ(${z}px) rotateX(${rxs + Math.sin(lt + ph) * 20}deg) rotateY(${rys + lt * 30}deg) rotateZ(${rz0}deg)`}}>
        <Doc seed={i} tab={i % 4 === 0 ? SKY : CORAL} />
      </div>
    );
  }
  const b = lt > 2.55;
  const out = 1 - prog(lt, 2.3, 2.6);
  const deadlines = ['Scade 24/10', 'Rettifica 08/10', 'Apertura 15/09', 'Click day 12:00', 'FAQ aggiornate'];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{perspective: 1100, perspectiveOrigin: '50% 50%'}}>
        <AbsoluteFill style={{transformStyle: 'preserve-3d', transform: `rotateZ(${Math.sin(lt * 0.7) * 3}deg)`}}>{docs}</AbsoluteFill>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 260, top: 300, width: 1400, height: 480, background: 'radial-gradient(ellipse, rgba(4,7,25,0.85) 0%, transparent 70%)'}} />
      {deadlines.map((d, i) => {
        const t0 = 0.8 + i * 0.55;
        const p = prog(lt, t0, t0 + 0.9);
        if (p <= 0 || p >= 1) return null;
        const rr = rnd(i + 5);
        return (
          <div key={i} style={{position: 'absolute', left: 200 + rr() * 1400, top: 140 + rr() * 760, opacity: Math.sin(p * Math.PI), transform: `scale(${0.8 + 0.3 * eO3(p)})`, fontFamily: MONO, fontSize: 22, color: CORAL, border: `1.5px solid ${CORAL}`, padding: '6px 14px', borderRadius: 40, background: 'rgba(240,117,99,0.12)'}}>
            {d}
          </div>
        );
      })}
      {!b && (
        <div style={{opacity: out}}>
          <Title l1="Migliaia di bandi." l2="Zero visione d'insieme." lt={lt} delay={0.2} size={96} align="center" style={{left: 0, width: W, top: 400}} />
        </div>
      )}
      {b && (
        <Title l1="Requisiti, allegati, rettifiche, scadenze." l2="Ogni giorno. Per ogni cliente." lt={lt - 2.55} delay={0} size={76} align="center" style={{left: 0, width: W, top: 410}} />
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S3 — monitoraggio delle fonti */

const SOURCES = ['Unione Europea', 'Ministeri', 'Regioni', 'Camere di commercio'];

export const S3: React.FC<{lt: number}> = ({lt}) => {
  const cx = 1310, cy = 560;
  const open = eO4(prog(lt, 0.1, 1.2));
  const rot = lt * 0.32 + 0.4;
  const tilt = (x: number, z: number, y = 0) => proj(x * 1.1, y + z * 0.5, z * 0.86, cx, cy, 1500);
  type Item = {z: number; el: React.ReactNode};
  const items: Item[] = [];
  const beams: React.ReactNode[] = [];
  // anelli di fonti minori
  const rr = rnd(77);
  const total = 120, lit = Math.floor(total * prog(lt, 0.6, 3.6));
  for (let i = 0; i < total; i++) {
    const R = [260, 400, 520][i % 3] * open, a = rr() * Math.PI * 2 + rot * (i % 3 === 1 ? -0.6 : 0.8), yo = (rr() - 0.5) * 120;
    const pz = Math.sin(a) * R;
    const p = tilt(Math.cos(a) * R, pz, yo);
    const on = i < lit;
    const s = 7 * p.s;
    items.push({z: pz, el: <div key={`d${i}`} style={{position: 'absolute', left: p.x - s / 2, top: p.y - s / 2, width: s, height: s, borderRadius: s, background: on ? CYAN : '#3A4A8A', boxShadow: on ? `0 0 ${12 * p.s}px ${CYAN}` : 'none', opacity: open}} />});
    if (on && i % 9 === 0) {
      const ph = ((lt * 0.9 + i * 0.137) % 1);
      const q = eIO(ph);
      beams.push(<circle key={`b${i}`} cx={lerp(p.x, cx, q)} cy={lerp(p.y, cy, q)} r={3.5} fill={CYAN_HI} opacity={Math.sin(ph * Math.PI)} />);
    }
  }
  // quattro fonti principali
  SOURCES.forEach((name, i) => {
    const R = 400 * open, a = rot + (i * Math.PI) / 2;
    const pz = Math.sin(a) * R;
    const p = tilt(Math.cos(a) * R, pz, -10);
    const show = eBack(prog(lt, 0.5 + i * 0.15, 1.1 + i * 0.15));
    beams.push(
      <line key={`l${i}`} x1={p.x} y1={p.y} x2={cx} y2={cy} stroke="url(#beam)" strokeWidth={2.5 * p.s} opacity={0.8 * show} />
    );
    for (let k = 0; k < 3; k++) {
      const ph = (lt * 0.7 + k / 3 + i * 0.21) % 1;
      beams.push(<rect key={`p${i}${k}`} x={lerp(p.x, cx, ph) - 9} y={lerp(p.y, cy, ph) - 12} width={18} height={24} rx={3} fill="#F4F2EC" opacity={show * Math.sin(ph * Math.PI)} transform={`rotate(${ph * 90} ${lerp(p.x, cx, ph)} ${lerp(p.y, cy, ph)})`} />);
    }
    items.push({
      z: pz,
      el: (
        <div key={`s${i}`} style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(-50%, -50%) scale(${p.s * show})`, ...glass(40), padding: '14px 26px', display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'}}>
          <div style={{width: 14, height: 14, borderRadius: 14, background: CYAN, boxShadow: `0 0 14px ${CYAN}`, opacity: 0.5 + 0.5 * Math.abs(Math.sin(lt * 3 + i))}} />
          <div style={{fontFamily: RAL, fontWeight: 600, fontSize: 28, color: WHITE}}>{name}</div>
        </div>
      ),
    });
  });
  items.push({
    z: 0,
    el: (
      <div key="hub" style={{position: 'absolute', left: cx - 120, top: cy - 120, transform: `scale(${eBack(prog(lt, 0, 0.8))})`}}>
        <Disc3D size={240} rx={10} ry={Math.sin(lt * 1.4) * 28} shine={((lt * 60) % 260) - 60} />
      </div>
    ),
  });
  items.sort((p, q) => p.z - q.z);
  const pulse = (lt * 1.4) % 1;
  return (
    <AbsoluteFill>
      <Glow x={cx} y={cy} r={520} c={SKY} o={0.35} />
      <div style={{position: 'absolute', left: cx - 160 - pulse * 260, top: cy - 160 - pulse * 260, width: 320 + pulse * 520, height: 320 + pulse * 520, borderRadius: '50%', border: `2px solid ${CYAN}`, opacity: 0.5 * (1 - pulse) * open}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="beam" x1="0" x2="1">
            <stop offset="0" stopColor={CYAN} stopOpacity={0.1} />
            <stop offset="1" stopColor={CYAN_HI} stopOpacity={0.9} />
          </linearGradient>
        </defs>
        {beams}
      </svg>
      {items.map((x) => x.el)}
      <Title eyebrow="MONITORAGGIO 24/7" l1="Agevolia legge tutto." l2="Ogni giorno, per te." lt={lt} delay={0.2} size={64} style={{left: 150, top: 230}} />
      <div style={{position: 'absolute', left: 150, top: 610, display: 'flex', gap: 56}}>
        {[
          {v: it(512 * eO3(prog(lt, 1.2, 3.2))), l: 'fonti ufficiali'},
          {v: `${Math.round(98 * eO3(prog(lt, 1.4, 3.2)))}%`, l: 'campi verificati'},
          {v: '24/7', l: 'monitoraggio'},
        ].map((s, i) => (
          <Fade key={i} lt={lt} a={1.2 + i * 0.18}>
            <div style={{fontFamily: RAL, fontWeight: 300, fontSize: 84, color: WHITE, lineHeight: 1, ...NUM}}>{s.v}</div>
            <div style={{fontFamily: MONO, fontSize: 18, letterSpacing: '0.18em', color: CYAN, marginTop: 10, textTransform: 'uppercase'}}>{s.l}</div>
          </Fade>
        ))}
      </div>
      <Fade lt={lt} a={2.4} style={{position: 'absolute', left: 150, top: 790, width: 560, fontFamily: RAL, fontSize: 28, lineHeight: 1.45, color: MUTED}}>
        Bandi, allegati, FAQ e rettifiche: raccolti alla fonte, appena pubblicati.
      </Fade>
    </AbsoluteFill>
  );
};
