import React from 'react';
import {ANTON, Check, MAN, MP, popIn} from './common';
import {
  bez, clamp, eBack, eIO, eO3, eO4, eO5, lerp, NAVY, Pt, prog, rnd, TEAL, TEAL_D, TEAL_HI, WHITE,
} from './util';

/* stage = 1080 x 580 */

/* ---------------------------------------------------------------- 06 AI: chat + rete neurale */
export const M6: React.FC<MP> = ({lt, pal}) => {
  const r = rnd(8);
  const nodes: Pt[] = Array.from({length: 18}, () => [60 + r() * 960, 10 + r() * 560] as Pt);
  const links: React.ReactNode[] = [];
  nodes.forEach((a, i) => nodes.forEach((b, j) => {
    if (j <= i) return;
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (d > 230) return;
    const pulse = (Math.sin(lt * 4 + i * 1.3 + j) + 1) / 2;
    links.push(<line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={pal.ac} strokeWidth={2} opacity={0.12 + pulse * 0.28} />);
  }));
  const userP = eO5(prog(lt, 0.3, 0.7));
  const uText = 'Quanto costa un sito con prenotazioni?';
  const typedU = uText.slice(0, Math.floor(prog(lt, 0.4, 0.95) * uText.length));
  const dotsP = prog(lt, 1.0, 1.1) * (1 - prog(lt, 1.5, 1.6));
  const aP = eO5(prog(lt, 1.5, 1.9));
  const aText = 'Ti preparo una stima su misura. Vuoi una call gratuita?'.split(' ');
  const shown = aText.slice(0, Math.floor(prog(lt, 1.6, 2.6) * (aText.length + 1)));
  const qr = (i: number) => clamp(popIn(lt, 2.6 + i * 0.12, 0.4), 0, 1.2);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={1080} height={580} style={{position: 'absolute', left: 0, top: 0}}>
        {links}
        {nodes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6 + ((Math.sin(lt * 3 + i) + 1) * 2)} fill={pal.ac} opacity={0.5} />)}
      </svg>
      <div style={{position: 'absolute', left: 90, top: 0, width: 900, height: 580, borderRadius: 40, background: pal.dark ? 'rgba(5,11,28,0.72)' : 'rgba(255,255,255,0.88)', border: `3px solid ${pal.edge}`, backdropFilter: 'blur(10px)', transform: `scale(${lerp(0.92, 1, eO5(prog(lt, 0, 0.5)))})`, opacity: eO4(prog(lt, 0, 0.4)), overflow: 'hidden', fontFamily: MAN}}>
        <div style={{height: 88, display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px', borderBottom: `2px solid ${pal.edge}`}}>
          <div style={{width: 52, height: 52, borderRadius: 26, background: pal.ac, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={30} height={30} viewBox="0 0 72 72"><path d="M36 4 C38 24 48 34 68 36 C48 38 38 48 36 68 C34 48 24 38 4 36 C24 34 34 24 36 4Z" fill={pal.onAc} /></svg>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontWeight: 800, fontSize: 28, color: pal.fg}}>Assistente Pragma</div>
            <div style={{fontWeight: 700, fontSize: 18, color: pal.ac, display: 'flex', alignItems: 'center', gap: 8}}><span style={{width: 10, height: 10, borderRadius: 5, background: '#5CE08A', display: 'inline-block'}} />online 24/7</div>
          </div>
        </div>
        <div style={{position: 'absolute', right: 30, top: 118, maxWidth: 600, padding: '20px 28px', borderRadius: '28px 28px 8px 28px', background: pal.ac, color: pal.onAc, fontWeight: 700, fontSize: 30, lineHeight: 1.25, opacity: userP, transform: `translateY(${(1 - userP) * 30}px)`}}>
          {typedU}
        </div>
        <div style={{position: 'absolute', left: 30, top: 270, padding: '22px 30px', borderRadius: '28px 28px 28px 8px', background: pal.card, border: `2px solid ${pal.edge}`, opacity: dotsP, display: 'flex', gap: 10}}>
          {[0, 1, 2].map((i) => <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: pal.ac, transform: `translateY(${Math.sin(lt * 10 + i * 0.9) * -7}px)`}} />)}
        </div>
        <div style={{position: 'absolute', left: 30, top: 260, maxWidth: 640, padding: '22px 30px', borderRadius: '28px 28px 28px 8px', background: pal.card, border: `2px solid ${pal.edge}`, color: pal.fg, fontWeight: 700, fontSize: 30, lineHeight: 1.3, opacity: aP, transform: `translateY(${(1 - aP) * 24}px)`}}>
          {shown.join(' ')}
        </div>
        <div style={{position: 'absolute', left: 30, top: 470, display: 'flex', gap: 16}}>
          {['Sì, prenota', 'Dettagli'].map((t, i) => (
            <div key={t} style={{padding: '14px 28px', borderRadius: 30, border: `3px solid ${pal.ac}`, color: i === 0 ? pal.onAc : pal.fg, background: i === 0 ? pal.ac : 'transparent', fontWeight: 800, fontSize: 24, transform: `scale(${qr(i)})`, opacity: clamp(qr(i))}}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- 07 AUTOMAZIONI: flow */
type Nd = {x: number; y: number; label: string; icon: 'bolt' | 'flow' | 'ai' | 'crm' | 'mail'};
const NODES: Nd[] = [
  {x: 150, y: 440, label: 'TRIGGER', icon: 'bolt'},
  {x: 390, y: 190, label: 'MAKE', icon: 'flow'},
  {x: 620, y: 420, label: 'AI', icon: 'ai'},
  {x: 900, y: 190, label: 'CRM', icon: 'crm'},
  {x: 900, y: 470, label: 'EMAIL', icon: 'mail'},
];
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [2, 4]];
const edgePts = (a: number, b: number): [Pt, Pt, Pt, Pt] => {
  const p0: Pt = [NODES[a].x, NODES[a].y], p1: Pt = [NODES[b].x, NODES[b].y];
  const dx = (p1[0] - p0[0]) * 0.5;
  return [p0, [p0[0] + dx, p0[1]], [p1[0] - dx, p1[1]], p1];
};
const Icon: React.FC<{k: Nd['icon']; c: string}> = ({k, c}) => {
  const s = {fill: 'none', stroke: c, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (k) {
    case 'bolt': return <svg width={64} height={64} viewBox="0 0 72 72"><polygon points="40,6 16,40 34,40 30,66 56,30 38,30" {...s} /></svg>;
    case 'flow': return <svg width={64} height={64} viewBox="0 0 72 72"><circle cx={16} cy={36} r={9} {...s} /><circle cx={56} cy={16} r={9} {...s} /><circle cx={56} cy={56} r={9} {...s} /><path d="M25 36 C40 36 40 16 47 16 M25 36 C40 36 40 56 47 56" {...s} /></svg>;
    case 'ai': return <svg width={64} height={64} viewBox="0 0 72 72"><path d="M36 6 C38 24 48 34 66 36 C48 38 38 48 36 66 C34 48 24 38 6 36 C24 34 34 24 36 6Z" {...s} /></svg>;
    case 'crm': return <svg width={64} height={64} viewBox="0 0 72 72"><ellipse cx={36} cy={18} rx={22} ry={9} {...s} /><path d="M14 18 V54 C14 59 24 63 36 63 C48 63 58 59 58 54 V18 M14 36 C14 41 24 45 36 45 C48 45 58 41 58 36" {...s} /></svg>;
    default: return <svg width={64} height={64} viewBox="0 0 72 72"><rect x={8} y={16} width={56} height={40} rx={6} {...s} /><path d="M8 20 L36 40 L64 20" {...s} /></svg>;
  }
};

export const M7: React.FC<MP> = ({lt, pal}) => {
  const PK = 0.32;
  const starts = [0.7, 1.0, 1.35, 1.35];
  const waves = [0, 1.2];
  const arrivals: number[][] = NODES.map(() => []);
  EDGES.forEach(([, b], i) => waves.forEach((w) => arrivals[b].push(starts[i] + w + PK)));
  const edgeEls: React.ReactNode[] = [];
  const packets: React.ReactNode[] = [];
  EDGES.forEach(([a, b], i) => {
    const [p0, c1, c2, p1] = edgePts(a, b);
    const d = `M${p0[0]} ${p0[1]} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p1[0]} ${p1[1]}`;
    const dp = eIO(prog(lt, 0.25 + i * 0.1, 0.75 + i * 0.1));
    edgeEls.push(
      <g key={i}>
        <path d={d} fill="none" stroke={pal.ac} strokeOpacity={0.25} strokeWidth={12} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp} />
        <path d={d} fill="none" stroke={pal.ac} strokeWidth={3} pathLength={1} strokeDasharray="0.012 0.012" strokeDashoffset={1 - dp} opacity={dp > 0 ? 1 : 0} />
      </g>
    );
    waves.forEach((w, wi) => {
      const u = prog(lt, starts[i] + w, starts[i] + w + PK);
      if (u <= 0 || u >= 1) return;
      for (let tr = 0; tr < 7; tr++) {
        const uu = clamp(eIO(u) - tr * 0.025);
        const [x, y] = bez(p0, c1, c2, p1, uu);
        packets.push(<circle key={`${i}-${wi}-${tr}`} cx={x} cy={y} r={14 - tr * 1.6} fill={tr === 0 ? (pal.dark ? WHITE : NAVY) : pal.ac} opacity={(1 - tr / 7) * 0.95} />);
      }
    });
  });
  const nodeEls = NODES.map((n, i) => {
    const p = eBack(prog(lt, 0.05 + i * 0.1, 0.05 + i * 0.1 + 0.45), 2.2);
    let pulse = 0;
    arrivals[i].forEach((a) => {
      const dt = lt - a;
      if (dt >= 0 && dt < 0.5) pulse = Math.max(pulse, Math.exp(-dt * 7));
    });
    const sc = clamp(p, 0, 1.4) * (1 + pulse * 0.14);
    return (
      <div key={i} style={{position: 'absolute', left: n.x - 65, top: n.y - 65, width: 130, height: 130, transform: `scale(${sc})`, opacity: clamp(p * 2)}}>
        <div style={{position: 'absolute', inset: -12 * pulse, borderRadius: 38, border: `3px solid ${pal.ac}`, opacity: pulse * 0.9}} />
        <div style={{width: 130, height: 130, borderRadius: 34, border: `3px solid ${pal.ac}`, background: pal.card, boxShadow: `0 0 ${24 + pulse * 60}px ${pal.ac}${pulse > 0.2 ? 'aa' : '44'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon k={n.icon} c={pal.ac} />
        </div>
        <div style={{position: 'absolute', top: 146, left: -30, width: 190, textAlign: 'center', fontFamily: MAN, fontWeight: 800, fontSize: 22, letterSpacing: '0.28em', color: pal.fg, paddingLeft: '0.28em'}}>{n.label}</div>
      </div>
    );
  });
  const h24 = eBack(prog(lt, 1.5, 2.0), 2);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={1080} height={580} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{edgeEls}{packets}</svg>
      {nodeEls}
      <div style={{position: 'absolute', left: 46, top: 24, transform: `scale(${clamp(h24, 0, 1.2)})`, transformOrigin: '0 0', opacity: clamp(h24)}}>
        <div style={{fontFamily: ANTON, fontSize: 120, color: pal.fg, lineHeight: 1}}>H24</div>
        <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 20, letterSpacing: '0.25em', color: pal.ac}}>SEMPRE ATTIVO</div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- 08 SOFTWARE: UI che si assembla */
export const M8: React.FC<MP> = ({lt, pal}) => {
  const fly = (a: number, fx: number, fy: number, rot = 0) => {
    const p = eO5(prog(lt, a, a + 0.55));
    return {transform: `translate(${(1 - p) * fx}px, ${(1 - p) * fy}px) rotate(${(1 - p) * rot}deg)`, opacity: clamp(p * 2)} as React.CSSProperties;
  };
  const snap = prog(lt, 1.7, 1.85) * (1 - prog(lt, 1.85, 2.4));
  const panel: React.CSSProperties = {position: 'absolute', background: pal.card, border: `2.5px solid ${pal.edge}`, borderRadius: 22, boxSizing: 'border-box'};
  const kpis = [['CONTATTI', 128], ['COMMESSE', 34], ['SCADENZE', 9]];
  return (
    <div style={{position: 'absolute', left: 90, top: 0, width: 900, height: 580, fontFamily: MAN, transform: `scale(${1 + snap * 0.015})`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 34, border: `3px solid ${pal.ac}`, boxShadow: `0 0 ${50 * snap}px ${pal.ac}`, opacity: 0.35 + snap * 0.65}} />
      <div style={{...panel, left: 14, top: 14, width: 130, height: 552, ...fly(0.0, -300, 0, -8)}}>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{width: 54, height: 54, borderRadius: 16, background: i === 0 ? pal.ac : pal.bar, margin: '22px auto 0', opacity: i === 0 ? 1 : 0.8}} />)}
      </div>
      <div style={{...panel, left: 158, top: 14, width: 728, height: 64, ...fly(0.1, 0, -200), display: 'flex', alignItems: 'center', padding: '0 24px', gap: 18}}>
        <div style={{width: 200, height: 18, borderRadius: 9, background: pal.bar}} />
        <div style={{flex: 1}} />
        <div style={{padding: '8px 22px', borderRadius: 20, background: pal.ac, color: pal.onAc, fontWeight: 800, fontSize: 18, letterSpacing: '0.1em'}}>SU MISURA</div>
      </div>
      {kpis.map(([l, v], i) => (
        <div key={l as string} style={{...panel, left: 158 + i * 246, top: 92, width: 234, height: 118, padding: '16px 22px', ...fly(0.2 + i * 0.12, 0, 260, i === 1 ? 6 : -6)}}>
          <div style={{fontWeight: 800, fontSize: 16, letterSpacing: '0.2em', color: pal.ac}}>{l}</div>
          <div style={{fontFamily: ANTON, fontSize: 60, color: pal.fg, lineHeight: 1.15}}>{Math.round((v as number) * eO4(prog(lt, 0.7 + i * 0.1, 1.5 + i * 0.1)))}</div>
        </div>
      ))}
      <div style={{...panel, left: 158, top: 224, width: 340, height: 342, ...fly(0.5, -260, 160, -5)}}>
        <svg width={340} height={342} viewBox="0 0 340 342">
          {[0.4, 0.65, 0.5, 0.85, 0.7, 1].map((v, i) => {
            const h = 240 * v * eO5(prog(lt, 0.9 + i * 0.08, 1.5 + i * 0.08));
            return <rect key={i} x={28 + i * 50} y={310 - h} width={32} height={h} rx={8} fill={i === 5 ? pal.ac : pal.bar} />;
          })}
        </svg>
      </div>
      <div style={{...panel, left: 512, top: 224, width: 374, height: 342, padding: 18, ...fly(0.6, 280, 160, 5)}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = eO5(prog(lt, 0.9 + i * 0.1, 1.4 + i * 0.1));
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, height: 56, borderBottom: `2px solid ${pal.bar}`, transform: `translateX(${(1 - a) * 80}px)`, opacity: a}}>
              <div style={{width: 30, height: 30, borderRadius: 15, background: i === 2 ? pal.ac : pal.bar}} />
              <div style={{flex: 1, height: 14, borderRadius: 7, background: pal.bar, maxWidth: [200, 150, 220, 130, 180][i]}} />
              <Check size={26} p={prog(lt, 1.3 + i * 0.1, 1.6 + i * 0.1)} color={pal.ac} sw={3.5} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- 09 CRM: kanban */
export const M9: React.FC<MP> = ({lt, pal}) => {
  const colX = (c: number) => 36 + c * 252;
  const rowY = (rw: number) => 118 + rw * 112;
  const cols = ['NUOVO', 'QUALIFICATO', 'TRATTATIVA', 'VINTO'];
  type Wp = [number, number, number];
  const cards: {wp: Wp[]; val: string; app: number}[] = [
    {wp: [[0, 0, 0], [1, 0, 0.95], [2, 0, 1.6], [3, 0, 2.3]], val: '€ 18k', app: 0.3},
    {wp: [[0, 1, 0], [1, 1, 1.25], [2, 1, 2.0]], val: '€ 9k', app: 0.4},
    {wp: [[1, 1, 0], [2, 2, 1.0]], val: '€ 12k', app: 0.5},
    {wp: [[0, 2, 0], [0, 2, 0]], val: '€ 6k', app: 0.6},
    {wp: [[2, 0, 0], [3, 1, 1.75]], val: '€ 14k', app: 0.7},
  ];
  // posizione per colonna 2: card 2 va in riga 1 se card0 è ancora riga 0 (evita sovrapposizioni): gestito sopra con righe fisse
  let won = 0;
  const els = cards.map((c, i) => {
    let x = colX(c.wp[0][0]), y = rowY(c.wp[0][1]);
    for (let j = 1; j < c.wp.length; j++) {
      const m = eIO(prog(lt, c.wp[j][2] - 0.38, c.wp[j][2]));
      x = lerp(x, colX(c.wp[j][0]), m);
      y = lerp(y, rowY(c.wp[j][1]), m);
    }
    const last = c.wp[c.wp.length - 1];
    const inWon = last[0] === 3 && lt >= last[2];
    if (inWon) won += parseInt(c.val.replace(/\D/g, ''), 10);
    const a = popIn(lt, c.app, 0.45);
    const moving = c.wp.some((w, j) => j > 0 && lt > w[2] - 0.38 && lt < w[2]);
    const lift = moving ? 1 : 0;
    const arrive = inWon ? Math.exp(-(lt - last[2]) * 6) : 0;
    return (
      <div key={i} style={{position: 'absolute', left: x, top: y, width: 224, height: 96, borderRadius: 20, background: pal.card, border: `3px solid ${inWon ? pal.ac : pal.edge}`, boxShadow: `0 ${10 + lift * 14}px ${24 + lift * 20}px rgba(5,11,28,${0.18 + lift * 0.14}), 0 0 ${arrive * 50}px ${pal.ac}`, transform: `scale(${clamp(a, 0, 1.15) * (1 + lift * 0.05) * (1 + arrive * 0.08)}) rotate(${lift * (i % 2 ? 2.5 : -2.5)}deg)`, padding: '14px 16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: lift ? 5 : 1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 34, height: 34, borderRadius: 17, background: pal.ac}} />
          <div style={{flex: 1, height: 12, borderRadius: 6, background: pal.bar}} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{width: 70, height: 10, borderRadius: 5, background: pal.bar}} />
          <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 22, color: pal.fg}}>{c.val}</div>
        </div>
      </div>
    );
  });
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {cols.map((t, i) => {
        const a = eO5(prog(lt, i * 0.07, i * 0.07 + 0.4));
        const isWon = i === 3;
        return (
          <div key={t} style={{position: 'absolute', left: colX(i) - 8, top: 0, width: 240, height: 570, borderRadius: 26, background: isWon ? `${pal.ac}33` : pal.panel, border: `2.5px solid ${isWon ? pal.ac : pal.edge}`, opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
            <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 19, letterSpacing: '0.18em', color: isWon ? pal.ac : pal.fg, textAlign: 'center', marginTop: 22}}>{t}{isWon ? ' ✓' : ''}</div>
            <div style={{margin: '14px auto 0', width: 60, height: 4, borderRadius: 2, background: isWon ? pal.ac : pal.bar}} />
          </div>
        );
      })}
      {els}
      <div style={{position: 'absolute', left: colX(3) - 8, top: 462, width: 240, textAlign: 'center', opacity: eO4(prog(lt, 1.8, 2.2))}}>
        <div style={{fontFamily: ANTON, fontSize: 50, color: pal.fg}}>€ {Math.round(won * 1000).toLocaleString('it-IT')}</div>
        <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 15, letterSpacing: '0.2em', color: pal.ac}}>CHIUSO</div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- 10 DATI + SICUREZZA */
export const M10: React.FC<MP> = ({lt, pal}) => {
  const pts = [0.2, 0.32, 0.28, 0.5, 0.44, 0.7, 0.62, 0.9];
  const cw = 520, ch = 270;
  const px = (i: number) => 20 + (i / (pts.length - 1)) * (cw - 40);
  const py = (v: number) => ch - 24 - v * (ch - 60);
  const line = pts.map((v, i) => `${i ? 'L' : 'M'}${px(i)} ${py(v)}`).join(' ');
  const area = `${line} L${px(pts.length - 1)} ${ch - 24} L${px(0)} ${ch - 24} Z`;
  const dp = eIO(prog(lt, 0.3, 1.7));
  const dotI = dp * (pts.length - 1);
  const i0 = Math.min(Math.floor(dotI), pts.length - 2);
  const dx = lerp(px(i0), px(i0 + 1), dotI - i0), dy = lerp(py(pts[i0]), py(pts[i0 + 1]), dotI - i0);
  const sp = eO4(prog(lt, 0.4, 1.3));
  const chk = prog(lt, 1.2, 1.6);
  const pulse = prog(lt, 1.5, 1.9) * (1 - prog(lt, 1.9, 2.6));
  const rows = ['GA4 + TAG MANAGER', 'GDPR BY DESIGN', 'BACKUP E MANUTENZIONE'];
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={cw} height={ch} style={{position: 'absolute', left: 50, top: 6, overflow: 'visible', opacity: eO4(prog(lt, 0, 0.4))}}>
        <rect x={0} y={0} width={cw} height={ch} rx={26} fill={pal.card} stroke={pal.edge} strokeWidth={2.5} />
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={20} x2={cw - 20} y1={py(g)} y2={py(g)} stroke={pal.bar} strokeWidth={2} strokeDasharray="6 8" />)}
        <defs>
          <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.ac} stopOpacity={0.45} /><stop offset="1" stopColor={pal.ac} stopOpacity={0} /></linearGradient>
          <clipPath id="clipA"><rect x={0} y={0} width={20 + dp * (cw - 40)} height={ch} /></clipPath>
        </defs>
        <path d={area} fill="url(#ar)" clipPath="url(#clipA)" />
        <path d={line} fill="none" stroke={pal.ac} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp} />
        {dp > 0 && <circle cx={dx} cy={dy} r={13} fill={pal.fg} style={{filter: `drop-shadow(0 0 12px ${pal.ac})`}} />}
      </svg>
      <svg width={360} height={290} viewBox="0 0 360 290" style={{position: 'absolute', left: 640, top: 0, overflow: 'visible'}}>
        <circle cx={180} cy={150} r={120 + pulse * 40} fill="none" stroke={pal.ac} strokeWidth={4} opacity={pulse * 0.7} />
        <g transform={`translate(180 150) scale(${lerp(0.8, 1, sp)}) translate(-180 -150)`}>
          <path d="M180 28 L292 66 V148 C292 208 244 250 180 274 C116 250 68 208 68 148 V66 Z" fill={pal.ac} fillOpacity={0.18 * sp} stroke={pal.ac} strokeWidth={8} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - sp} />
          <path d="M126 150 L166 190 L238 112" fill="none" stroke={pal.fg} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - chk} />
        </g>
      </svg>
      {rows.map((t, i) => {
        const a = eO5(prog(lt, 0.7 + i * 0.15, 1.15 + i * 0.15));
        const on = eIO(prog(lt, 1.3 + i * 0.35, 1.55 + i * 0.35));
        return (
          <div key={t} style={{position: 'absolute', left: 50, top: 318 + i * 88, width: 980, height: 74, borderRadius: 37, background: pal.card, border: `2.5px solid ${on > 0.5 ? pal.ac : pal.edge}`, transform: `translateX(${(1 - a) * 400}px)`, opacity: a, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 22, boxSizing: 'border-box'}}>
            <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 28, letterSpacing: '0.12em', color: pal.fg, flex: 1}}>{t}</div>
            <div style={{width: 96, height: 44, borderRadius: 22, background: on > 0.5 ? pal.ac : pal.bar, position: 'relative'}}>
              <div style={{position: 'absolute', top: 5, left: 5 + on * 52, width: 34, height: 34, borderRadius: 17, background: on > 0.5 ? pal.onAc : '#fff'}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
