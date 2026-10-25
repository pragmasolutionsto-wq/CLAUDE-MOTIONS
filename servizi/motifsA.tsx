import React from 'react';
import {
  ANTON, Check, MAN, MP, popIn,
} from './common';
import {
  bez, clamp, eBack, eIO, eO3, eO4, eO5, lerp, NAVY, Pt, prog, rnd, TEAL, TEAL_D, TEAL_HI, WHITE,
} from './util';

/* stage = 1080 x 580 */

/* ---------------------------------------------------------------- 01 STRATEGIA: roadmap */
export const M1: React.FC<MP> = ({lt, pal}) => {
  const P0: Pt = [110, 490], C1: Pt = [110, 90], C2: Pt = [640, 600], P1: Pt = [950, 130];
  const d = `M${P0[0]} ${P0[1]} C${C1[0]} ${C1[1]} ${C2[0]} ${C2[1]} ${P1[0]} ${P1[1]}`;
  const p = eIO(prog(lt, 0.3, 2.1));
  const us = [0, 0.34, 0.67, 1];
  const labels = ['AUDIT', 'ROADMAP', 'LANCIO', 'RISULTATI'];
  const pos = us.map((u) => bez(P0, C1, C2, P1, u));
  const [dx, dy] = bez(P0, C1, C2, P1, p);
  const trail = [];
  for (let i = 1; i < 9; i++) {
    const [tx, ty] = bez(P0, C1, C2, P1, clamp(p - i * 0.012));
    trail.push(<circle key={i} cx={tx} cy={ty} r={16 - i * 1.5} fill={pal.ac} opacity={(1 - i / 9) * 0.6 * (p > 0 && p < 1 ? 1 : 0)} />);
  }
  const fw = Math.sin(lt * 9);
  const flagP = eBack(prog(p, 0.96, 1), 2.2);
  const end = prog(lt, 2.1, 2.7);
  return (
    <svg width={1080} height={580} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={d} fill="none" stroke={pal.ac} strokeOpacity={0.25} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <path d={d} fill="none" stroke={pal.fg} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="0.014 0.018" strokeDashoffset={1 - p} opacity={p > 0 ? 0.9 : 0} />
      {trail}
      {p > 0 && p < 1 && <circle cx={dx} cy={dy} r={18} fill={WHITE} style={{filter: `drop-shadow(0 0 14px ${pal.ac})`}} />}
      {pos.map(([x, y], i) => {
        const s = i === 0 ? popIn(lt, 0.1, 0.45) : eBack(prog(p, us[i] - 0.04, us[i] + 0.08), 2.2);
        const up = i % 2 === 0;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${clamp(s, 0, 1.4)})`}>
            <circle r={48} fill={pal.ac} opacity={0.22} />
            <circle r={34} fill={pal.ac} />
            <text textAnchor="middle" y={13} fontFamily={ANTON} fontSize={38} fill={pal.onAc}>{i + 1}</text>
            <text textAnchor="middle" y={up ? -62 : 78} fontFamily={MAN} fontWeight={800} fontSize={26} letterSpacing="0.2em" fill={pal.fg}>{labels[i]}</text>
          </g>
        );
      })}
      <g transform={`translate(${P1[0]} ${P1[1] - 30})`} opacity={flagP > 0 ? 1 : 0}>
        <line x1={0} y1={-6} x2={0} y2={-110 * clamp(flagP)} stroke={pal.fg} strokeWidth={6} strokeLinecap="round" />
        <polygon points={`0,${-110 * clamp(flagP)} ${70 + fw * 6},${-92 * clamp(flagP) + fw * 4} 0,${-72 * clamp(flagP)}`} fill={pal.ac} />
      </g>
      {end > 0 && end < 1 && <circle cx={P1[0]} cy={P1[1]} r={34 + 180 * eO4(end)} fill="none" stroke={pal.ac} strokeWidth={6} opacity={1 - end} />}
    </svg>
  );
};

/* ---------------------------------------------------------------- 02 BRAND + UX */
export const M2: React.FC<MP> = ({lt, pal}) => {
  const cx = 290, cy = 230, r = 150;
  const draw = eO4(prog(lt, 0.15, 1.1));
  const fill = eO4(prog(lt, 0.9, 1.6));
  const rot = lt * 30;
  const anchors = [0, 90, 180, 270].map((a) => {
    const rad = (a * Math.PI) / 180;
    return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), hx: -Math.sin(rad) * 62, hy: Math.cos(rad) * 62};
  });
  const sw = [TEAL, TEAL_HI, NAVY, '#1B3A78', pal.fg];
  const aa = eO5(prog(lt, 0.35, 0.85));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={1080} height={580} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g transform={`rotate(${rot} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={r * fill} fill={pal.ac} opacity={0.92} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={pal.fg} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          {anchors.map((a, i) => {
            const s = popIn(lt, 0.5 + i * 0.1, 0.35);
            return (
              <g key={i} opacity={clamp(s)}>
                <line x1={a.x - a.hx} y1={a.y - a.hy} x2={a.x + a.hx} y2={a.y + a.hy} stroke={pal.fg} strokeWidth={3} />
                <circle cx={a.x - a.hx} cy={a.y - a.hy} r={9} fill={pal.fg} />
                <circle cx={a.x + a.hx} cy={a.y + a.hy} r={9} fill={pal.fg} />
                <rect x={a.x - 13} y={a.y - 13} width={26} height={26} fill={pal.bg.includes('ICE') ? WHITE : '#fff'} stroke={pal.fg} strokeWidth={4} transform={`scale(${s}) `} style={{transformOrigin: `${a.x}px ${a.y}px`}} />
              </g>
            );
          })}
        </g>
        {sw.map((c, i) => {
          const s = clamp(popIn(lt, 0.9 + i * 0.1, 0.5, 2.4), 0, 1.3);
          const y = 478 + Math.sin(lt * 3 + i) * 5;
          return <circle key={i} cx={180 + i * 180} cy={y} r={58 * s} fill={c} stroke={pal.fg} strokeWidth={3} strokeOpacity={0.5} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 560, top: 10, overflow: 'hidden', height: 350}}>
        <div style={{fontFamily: ANTON, fontSize: 340, lineHeight: 1.03, color: pal.fg, transform: `translateY(${(1 - aa) * 360}px)`, letterSpacing: '0.02em'}}>Aa</div>
      </div>
      <div style={{position: 'absolute', left: 566, top: 372, fontFamily: MAN, fontWeight: 800, fontSize: 23, letterSpacing: '0.22em', color: pal.ac, opacity: eO4(prog(lt, 0.7, 1.0))}}>
        TONE OF VOICE · UI SYSTEM
      </div>
      <div style={{position: 'absolute', left: 566, top: 410, height: 6, width: 330 * eO4(prog(lt, 0.8, 1.4)), background: pal.fg, borderRadius: 3, opacity: 0.8}} />
    </div>
  );
};

/* ---------------------------------------------------------------- 03 SITI WEB: browser */
export const M3: React.FC<MP> = ({lt, pal}) => {
  const rise = (a: number) => eO5(prog(lt, a, a + 0.4));
  const CLICK = 1.85;
  const ctaX = 56, ctaY = 330;
  const cp = eIO(prog(lt, 0.9, CLICK - 0.05));
  const [cx, cy] = bez([600, 520], [560, 420], [260, 420], [ctaX + 220, ctaY + 38], cp);
  const press = prog(lt, CLICK - 0.05, CLICK);
  const after = prog(lt, CLICK, CLICK + 0.4);
  const scale = 1 - 0.07 * press * (1 - prog(lt, CLICK, CLICK + 0.12));
  const ripple = prog(lt, CLICK, CLICK + 0.45);
  const conf: React.ReactNode[] = [];
  const r = rnd(5);
  for (let i = 0; i < 30; i++) {
    const ang = r() * Math.PI * 2, spd = 200 + r() * 520, tt = lt - CLICK, rot = r() * 360, col = [TEAL, TEAL_HI, NAVY, WHITE][i % 4];
    if (tt < 0 || tt > 1.0) continue;
    conf.push(<div key={i} style={{position: 'absolute', left: ctaX + 220 + Math.cos(ang) * spd * tt, top: ctaY + 38 + Math.sin(ang) * spd * tt + 900 * tt * tt, width: 14, height: 8, background: col, transform: `rotate(${rot + tt * 500}deg)`, opacity: 1 - prog(tt, 0.55, 1.0)}} />);
  }
  const tilt = lerp(-14, -5, eO4(prog(lt, 0, 1.2))) + lt * 1.4;
  const app = eO5(prog(lt, 0, 0.5));
  return (
    <div style={{position: 'absolute', inset: 0, perspective: 2400, perspectiveOrigin: '50% 40%'}}>
      <div style={{position: 'absolute', left: 90, top: 10, width: 900, height: 560, transform: `rotateY(${tilt}deg) rotateX(3deg) scale(${lerp(0.8, 1, app)})`, opacity: app, transformOrigin: '50% 50%'}}>
        <div style={{width: 900, height: 560, borderRadius: 30, background: '#F6FCFD', boxShadow: '0 50px 100px rgba(5,11,28,0.4), 0 0 0 2px rgba(13,27,70,0.12)', overflow: 'hidden', position: 'relative', fontFamily: MAN}}>
          <div style={{height: 64, background: '#DCEDF0', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10}}>
            {['#FF6B6B', '#FFC857', '#5CD6A0'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 16, background: c}} />)}
            <div style={{marginLeft: 24, height: 34, width: 440, borderRadius: 17, background: '#fff', color: NAVY, fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', paddingLeft: 18}}>pragmarealsolutions.com</div>
          </div>
          <div style={{position: 'absolute', left: 56, top: 100, opacity: rise(0.1)}}>
            <div style={{fontFamily: ANTON, fontSize: 24, color: TEAL_D, letterSpacing: '0.12em'}}>STUDIO DIGITALE</div>
          </div>
          <div style={{position: 'absolute', left: 56, top: 138, width: 460}}>
            <div style={{overflow: 'hidden', height: 84}}><div style={{fontFamily: ANTON, fontSize: 78, lineHeight: 1.08, color: NAVY, transform: `translateY(${(1 - rise(0.2)) * 90}px)`}}>PIÙ CLIENTI.</div></div>
            <div style={{overflow: 'hidden', height: 84}}><div style={{fontFamily: ANTON, fontSize: 78, lineHeight: 1.08, color: TEAL_D, transform: `translateY(${(1 - rise(0.32)) * 90}px)`}}>MENO CLICK.</div></div>
            {[420, 340].map((w, i) => <div key={i} style={{height: 14, width: w * rise(0.45 + i * 0.08), borderRadius: 7, background: '#C7DDE2', marginTop: 16}} />)}
          </div>
          <div style={{position: 'absolute', left: ctaX, top: ctaY, width: 330, height: 76, borderRadius: 38, transform: `scale(${scale * lerp(0.6, 1, eBack(prog(lt, 0.45, 0.8)))})`, opacity: prog(lt, 0.45, 0.6), background: after > 0.2 ? NAVY : TEAL, color: after > 0.2 ? TEAL_HI : NAVY, fontWeight: 800, fontSize: 22, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 40px rgba(30,143,160,0.5)'}}>
            {after > 0.2 ? '✓ RICHIESTA INVIATA' : "RICHIEDI L'ANALISI"}
          </div>
          <div style={{position: 'absolute', left: 540, top: 96, width: 310, height: 270, borderRadius: 28, background: `linear-gradient(150deg, ${TEAL}, #1B3A78 85%)`, transform: `translateX(${(1 - rise(0.3)) * 140}px)`, opacity: rise(0.3), overflow: 'hidden'}}>
            <svg width={310} height={270} viewBox="0 0 310 270">
              {[0.35, 0.55, 0.8].map((v, i) => {
                const hh = 190 * v * eO5(prog(lt, 0.55 + i * 0.1, 1.0 + i * 0.1));
                return <rect key={i} x={46 + i * 80} y={250 - hh} width={52} height={hh} rx={6} fill="rgba(246,252,253,0.9)" />;
              })}
              <ellipse cx={155} cy={252} rx={130} ry={30} fill="none" stroke={TEAL_HI} strokeWidth={7} />
            </svg>
          </div>
          <div style={{position: 'absolute', left: 56, right: 56, bottom: 36, display: 'flex', gap: 22}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{flex: 1, height: 84, borderRadius: 20, background: '#E6F3F5', transform: `translateY(${(1 - rise(0.55 + i * 0.1)) * 60}px)`, opacity: rise(0.55 + i * 0.1), padding: 18, boxSizing: 'border-box'}}>
                <div style={{width: 34, height: 34, borderRadius: 11, background: TEAL}} />
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', right: 30, top: 80, padding: '14px 24px', borderRadius: 16, background: NAVY, color: TEAL_HI, fontWeight: 800, fontSize: 21, letterSpacing: '0.12em', transform: `translateX(${(1 - eBack(prog(lt, CLICK + 0.2, CLICK + 0.5))) * 400}px)`, boxShadow: '0 20px 50px rgba(13,27,70,0.4)'}}>+1 LEAD</div>
          {ripple > 0 && ripple < 1 && <div style={{position: 'absolute', left: cx - 10 - 110 * ripple, top: cy - 10 - 110 * ripple, width: 20 + 220 * ripple, height: 20 + 220 * ripple, borderRadius: 400, border: `4px solid ${TEAL_D}`, opacity: 1 - ripple}} />}
          {conf}
          <svg width={44} height={44} viewBox="0 0 24 24" style={{position: 'absolute', left: cx, top: cy, opacity: prog(lt, 0.8, 0.95), filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))'}}>
            <path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.4 L18 13 Z" fill={NAVY} stroke={WHITE} strokeWidth={1.5} strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- 04 SEO + GEO */
export const M4: React.FC<MP> = ({lt, pal}) => {
  const q = 'studio digitale torino';
  const typed = q.slice(0, Math.floor(prog(lt, 0.25, 1.05) * q.length));
  const caret = Math.floor(lt * 3) % 2 === 0 || lt < 1.1;
  const barP = eO5(prog(lt, 0, 0.4));
  const aiP = eO5(prog(lt, 1.15, 1.6));
  const mv = eIO(prog(lt, 1.7, 2.5));
  const order = [0, 1, 2]; // 0 = Pragma
  const slotOf = (i: number) => (i === 0 ? lerp(2, 0, mv) : lerp(i - 1, i, mv));
  const names = ['Pragma Real Solutions — Studio digitale', 'Agenzia generica — pagina servizi', 'Directory — elenco aziende'];
  const urls = ['pragmarealsolutions.com', 'agenzia-esempio.it', 'elenco-esempio.it'];
  const rank = (i: number) => Math.round(slotOf(i)) + 1;
  const glow = prog(lt, 2.3, 2.7);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 70, top: 0, width: 940, height: 90, borderRadius: 45, background: pal.card, border: `3px solid ${pal.edge}`, transform: `scale(${lerp(0.9, 1, barP)})`, opacity: barP, display: 'flex', alignItems: 'center', padding: '0 34px', gap: 20, fontFamily: MAN, fontWeight: 700, fontSize: 38, color: pal.fg}}>
        <svg width={40} height={40} viewBox="0 0 24 24"><circle cx={10} cy={10} r={6.5} fill="none" stroke={pal.ac} strokeWidth={2.6} /><line x1={15} y1={15} x2={21} y2={21} stroke={pal.ac} strokeWidth={2.6} strokeLinecap="round" /></svg>
        <span>{typed}</span><span style={{opacity: caret ? 1 : 0, color: pal.ac}}>|</span>
      </div>
      <div style={{position: 'absolute', left: 70, top: 112, width: 940, height: 176, borderRadius: 30, background: pal.card, border: `3px solid ${pal.ac}`, boxShadow: `0 0 ${40 * aiP}px ${pal.ac}55`, transform: `translateY(${(1 - aiP) * 40}px) scale(${lerp(0.94, 1, aiP)})`, opacity: aiP, padding: '22px 30px', boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <svg width={36} height={36} viewBox="0 0 72 72" style={{transform: `rotate(${lt * 60}deg)`}}><path d="M36 4 C38 24 48 34 68 36 C48 38 38 48 36 68 C34 48 24 38 4 36 C24 34 34 24 36 4Z" fill={pal.ac} /></svg>
          <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 24, letterSpacing: '0.22em', color: pal.ac}}>RISPOSTA AI</div>
        </div>
        {[0.92, 0.7].map((w, i) => <div key={i} style={{height: 15, width: `${w * 100 * eO4(prog(lt, 1.4 + i * 0.15, 1.9 + i * 0.15))}%`, borderRadius: 8, background: pal.bar, marginTop: 18}} />)}
        <div style={{position: 'absolute', right: 28, bottom: 18, padding: '8px 18px', borderRadius: 20, background: pal.ac, color: pal.onAc, fontFamily: MAN, fontWeight: 800, fontSize: 20, letterSpacing: '0.06em', transform: `scale(${clamp(popIn(lt, 2.0, 0.4), 0, 1.3)})`}}>
          ↗ pragmarealsolutions.com
        </div>
      </div>
      {order.map((i) => {
        const s = slotOf(i);
        const a = eO5(prog(lt, 0.55 + i * 0.1, 1.0 + i * 0.1));
        const hero = i === 0;
        const lit = hero ? glow : 0;
        return (
          <div key={i} style={{position: 'absolute', left: 70, top: 312 + s * 96, width: 940, height: 84, borderRadius: 24, background: pal.card, border: `3px solid ${hero ? pal.ac : pal.edge}`, boxShadow: lit ? `0 0 ${50 * lit}px ${pal.ac}66` : 'none', transform: `translateX(${(1 - a) * (i % 2 ? 300 : -300)}px)`, opacity: a, display: 'flex', alignItems: 'center', gap: 22, padding: '0 22px', boxSizing: 'border-box', zIndex: hero ? 2 : 1}}>
            <div style={{width: 48, height: 48, borderRadius: 24, background: hero ? pal.ac : pal.bar, color: hero ? pal.onAc : pal.fg, fontFamily: ANTON, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{rank(i)}</div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 25, color: pal.fg}}>{names[i]}</div>
              <div style={{fontFamily: MAN, fontWeight: 600, fontSize: 19, color: pal.ac, marginTop: 4}}>{urls[i]}</div>
            </div>
            {hero && <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 19, letterSpacing: '0.12em', color: pal.onAc, background: pal.ac, borderRadius: 14, padding: '6px 14px', opacity: glow}}>#1</div>}
          </div>
        );
      })}
    </div>
  );
};

/* ---------------------------------------------------------------- 05 SOCIAL + ADV: funnel */
export const M5: React.FC<MP> = ({lt, pal}) => {
  const cxm = 540;
  const topY = 96, midY = 340, botY = 480;
  const halfW = (y: number) => (y < midY ? lerp(330, 120, eIO(prog(y, topY, midY))) : lerp(120, 56, prog(y, midY, botY)));
  const fp = eO4(prog(lt, 0.2, 0.9));
  const L = [`M${cxm - 330} ${topY}`, `L${cxm + 330} ${topY}`, `L${cxm + 120} ${midY}`, `L${cxm + 56} ${botY}`, `L${cxm - 56} ${botY}`, `L${cxm - 120} ${midY}`, 'Z'].join(' ');
  const pills = ['META ADS', 'GOOGLE ADS', 'LINKEDIN'];
  const parts: React.ReactNode[] = [];
  const r = rnd(41);
  let leads = 0;
  for (let i = 0; i < 70; i++) {
    const x0 = (r() - 0.5) * 2, per = 1.5 + r() * 0.6, off = r() * per, conv = i % 4 === 0;
    const t = lt - 0.7 - off;
    if (t < 0) continue;
    const cyc = Math.floor(t / per), u = (t % per) / per;
    const seedKeep = conv && cyc >= 0;
    const y = lerp(topY + 4, botY + (seedKeep ? 70 : 0), eIO(u) * 0.85 + u * 0.15);
    const x = cxm + x0 * halfW(Math.min(y, botY)) * 0.82;
    const gone = !seedKeep && y > midY - 10 ? 1 - prog(y, midY - 10, midY + 40) : 1;
    if (seedKeep && u > 0.92) leads++;
    parts.push(<circle key={i} cx={x} cy={y} r={seedKeep ? 11 : 8} fill={seedKeep && y > midY ? WHITE : pal.ac} opacity={gone * (0.35 + 0.65 * Math.sin(u * Math.PI) ) * fp} style={seedKeep ? {filter: `drop-shadow(0 0 8px ${pal.ac})`} : undefined} />);
  }
  const count = Math.floor(prog(lt, 1.0, 3.2) * 128);
  return (
    <svg width={1080} height={580} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {pills.map((t, i) => {
        const s = clamp(popIn(lt, 0.1 + i * 0.12, 0.45), 0, 1.2);
        const w = 250;
        return (
          <g key={i} transform={`translate(${540 + (i - 1) * 290} 34) scale(${s})`}>
            <rect x={-w / 2} y={-28} width={w} height={56} rx={28} fill={pal.card} stroke={pal.edge} strokeWidth={3} />
            <text textAnchor="middle" y={9} fontFamily={MAN} fontWeight={800} fontSize={24} letterSpacing="0.14em" fill={pal.fg}>{t}</text>
          </g>
        );
      })}
      <path d={L} fill={pal.panel} stroke={pal.ac} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fp} />
      <line x1={cxm - 300} y1={midY} x2={cxm + 300} y2={midY} stroke={pal.ac} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="8 10" opacity={fp} />
      {parts}
      {[['IMPRESSIONI', topY + 40], ['CLICK', midY - 30], ['RICHIESTE', botY - 10]].map(([t, y], i) => (
        <text key={i} x={i === 2 ? cxm + 90 : 24} y={y as number} fontFamily={MAN} fontWeight={800} fontSize={19} letterSpacing="0.16em" fill={pal.fg} opacity={0.75 * eO4(prog(lt, 0.5 + i * 0.15, 0.9 + i * 0.15))}>{t}</text>
      ))}
      <g opacity={eO4(prog(lt, 0.9, 1.3))} transform={`translate(${cxm} 548)`}>
        <text textAnchor="middle" y={0} fontFamily={ANTON} fontSize={64} fill={pal.fg}>{`+${Math.max(count, 0)}`}<tspan fontFamily={MAN} fontWeight={800} fontSize={22} letterSpacing="0.2em" fill={pal.ac} dx={16}>LEAD QUALIFICATI</tspan></text>
      </g>
    </svg>
  );
};
