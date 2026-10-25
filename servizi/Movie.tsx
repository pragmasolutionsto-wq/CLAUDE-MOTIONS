import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {
  ANTON, Bokeh, Caption, Check, Dust, DotGrid, Glow, LH, LOGO, LW, MAN, maskLogo, MP, Pal, P_ICE, P_INK, P_NAVY, P_TEAL,
  popIn, Streaks, TitleLine,
} from './common';
import {M1, M2, M3, M4, M5} from './motifsA';
import {M6, M7, M8, M9, M10} from './motifsB';
import {
  AREA0, AREA_DUR, B, clamp, eBack, eExpo, eI3, eIO, eO3, eO4, eO5, FIN_A, FIN_B, FPS, H, ICE, INK, lerp, NAVY, prog,
  SC, TEAL, TEAL_D, TEAL_HI, TOTAL, W, WHITE,
} from './util';

/* ------------------------------------------------------------------ dati aree (dal sito pragmarealsolutions.com/servizi) */

type Area = {
  name: string;
  title: [string, string];
  chips: [string, string, string];
  benefit: string;
  pal: Pal;
  Motif: React.FC<MP>;
};

const AREAS: Area[] = [
  {name: 'Strategia', title: ['STRATEGIA', '& CONSULENZA'], chips: ['Audit digitale completo', 'Roadmap di trasformazione', 'Mappatura dei processi'], benefit: 'Sai da dove partire, con priorità chiare', pal: P_INK, Motif: M1},
  {name: 'Brand & UX', title: ['BRANDING', '& UX/UI'], chips: ['Identità visiva e tone of voice', 'UI design system', 'Conversion design'], benefit: 'Una marca riconoscibile che fa agire', pal: P_ICE, Motif: M2},
  {name: 'Siti & e-commerce', title: ['SITI WEB', '& E-COMMERCE'], chips: ['Sito web aziendale', 'Landing ad alta conversione', 'E-commerce B2C e B2B'], benefit: 'Un sito che spiega, convince e vende', pal: P_NAVY, Motif: M3},
  {name: 'SEO & GEO', title: ['SEO, GEO', '& CONTENUTI'], chips: ['Audit SEO tecnico', 'Contenuti per risposte AI', 'Dati strutturati Schema.org'], benefit: 'Ti trovano su Google e nelle risposte AI', pal: P_TEAL, Motif: M4},
  {name: 'Social & ADV', title: ['SOCIAL, ADV', '& ACQUISIZIONE'], chips: ['Campagne Meta, Google e LinkedIn', 'Funnel di lead generation', 'Email marketing e automation'], benefit: 'Richieste qualificate, risultati tracciati', pal: P_INK, Motif: M5},
  {name: 'AI', title: ['INTELLIGENZA', 'ARTIFICIALE'], chips: ['Chatbot AI per siti web', 'Sistema RAG su dati aziendali', 'Agenti AI personalizzati'], benefit: 'Risposte 24/7, il tuo team libero di creare valore', pal: P_NAVY, Motif: M6},
  {name: 'Automazioni', title: ['AUTOMAZIONI', '& INTEGRAZIONI'], chips: ['Automazioni Make', 'Integrazioni API e webhook', 'Preventivi e follow-up automatici'], benefit: 'Zero lavoro manuale ripetitivo', pal: P_ICE, Motif: M7},
  {name: 'Software & SaaS', title: ['SOFTWARE', '& SAAS'], chips: ['CRM e gestionali su misura', 'Portale clienti e fornitori', 'MVP SaaS e Progressive Web App'], benefit: 'Strumenti modellati sul tuo processo', pal: P_INK, Motif: M8},
  {name: 'CRM & vendite', title: ['CRM & VENDITE', 'ORGANIZZAZIONE'], chips: ['Pipeline commerciale', 'Lead scoring', 'Ticketing e help desk'], benefit: 'Nessun contatto perso, vendite sotto controllo', pal: P_TEAL, Motif: M9},
  {name: 'Dati & sicurezza', title: ['DATI, SICUREZZA', '& CONTINUITÀ'], chips: ['GA4 e Google Tag Manager', 'Privacy e GDPR by design', 'Manutenzione continuativa'], benefit: 'Decisioni sui dati, tutto protetto e aggiornato', pal: P_NAVY, Motif: M10},
];

const fit = (t: string, max: number) => Math.min(max, 940 / (t.length * 0.52));

/* ------------------------------------------------------------------ SCENA AREA (generica) */

const AreaScene: React.FC<{lt: number; k: number}> = ({lt, k}) => {
  const a = AREAS[k];
  const pal = a.pal;
  const fs1 = fit(a.title[0], 178), fs2 = Math.min(fit(a.title[1], 128), fs1 * 0.82);
  const flash = 0.22 * (1 - prog(lt, 0, 0.1));
  const stageP = eO5(prog(lt, 0.12, 0.6));
  const ghost = String(k + 1).padStart(2, '0');
  const pillP = eO5(prog(lt, 2.05, 2.5));
  const shine = lerp(-30, 130, prog(lt, 2.35, 3.0));
  return (
    <AbsoluteFill style={{background: pal.bg}}>
      <Glow x={540} y={1000} r={900} c={pal.ac} o={pal.dark ? 0.16 : 0.22} />
      <DotGrid lt={lt} color={pal.ac} o={pal.dark ? 0.12 : 0.18} />
      <Dust t={lt} n={26} seed={20 + k} color={pal.ac} />
      <Streaks lt={lt} seed={100 + k} color={pal.ac} />
      {/* numero fantasma */}
      <div style={{position: 'absolute', right: -20 - lerp(60, -20, eO4(prog(lt, 0, 0.6))), top: 160, fontFamily: ANTON, fontSize: 640, lineHeight: 1, color: 'transparent', WebkitTextStroke: `3px ${pal.fg}`, opacity: 0.1}}>{ghost}</div>
      {/* tag area */}
      <div style={{position: 'absolute', left: 70, top: 214, display: 'flex', alignItems: 'center', gap: 18, opacity: eO4(prog(lt, 0.02, 0.3))}}>
        <div style={{width: 64 * eO4(prog(lt, 0.02, 0.4)), height: 5, background: pal.ac, borderRadius: 3}} />
        <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 26, letterSpacing: '0.34em', color: pal.ac}}>AREA {ghost} / 10 · 10 SERVIZI</div>
      </div>
      {/* titolo */}
      <div style={{position: 'absolute', left: 70, top: 262}}>
        <TitleLine text={a.title[0]} lt={lt} delay={0.04} mode={k} fs={fs1} color={pal.fg} />
        <TitleLine text={a.title[1]} lt={lt} delay={0.16} mode={k + 2} fs={fs2} color={pal.ac} />
      </div>
      {/* motivo animato */}
      <div style={{position: 'absolute', left: 0, top: 640, width: W, height: 580, opacity: stageP, transform: `scale(${lerp(0.94, 1, stageP)}) translateY(${(1 - stageP) * 40}px)`}}>
        <a.Motif lt={lt} pal={pal} />
      </div>
      {/* servizi */}
      {a.chips.map((c, i) => {
        const t0 = 1.0 + i * 0.2;
        const p = eO5(prog(lt, t0, t0 + 0.4));
        const ck = prog(lt, t0 + 0.25, t0 + 0.6);
        return (
          <div key={c} style={{position: 'absolute', left: 70, top: 1240 + i * 76, width: 940, height: 64, borderRadius: 32, background: pal.card, border: `2.5px solid ${pal.edge}`, transform: `translateX(${(1 - p) * (i % 2 ? 700 : -700)}px)`, opacity: clamp(p * 1.6), display: 'flex', alignItems: 'center', gap: 20, padding: '0 14px', boxSizing: 'border-box'}}>
            <div style={{width: 40, height: 40, borderRadius: 20, background: pal.ac, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Check size={26} p={ck} color={pal.onAc} sw={4} />
            </div>
            <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 30, color: pal.fg, letterSpacing: '0.01em'}}>{c}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 70, top: 1478, fontFamily: MAN, fontWeight: 800, fontSize: 22, letterSpacing: '0.28em', color: pal.ac, opacity: eO4(prog(lt, 1.7, 2.0))}}>+ ALTRI 7 SERVIZI IN QUEST'AREA</div>
      {/* vantaggio */}
      <div style={{position: 'absolute', left: 70, top: 1528, width: 940, height: 124, borderRadius: 34, background: pal.ac, overflow: 'hidden', transform: `translateY(${(1 - pillP) * 140}px) scale(${lerp(0.9, 1, pillP)})`, opacity: pillP, boxShadow: `0 20px 60px ${pal.ac}66`}}>
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent ${shine - 12}%, rgba(255,255,255,0.7) ${shine}%, transparent ${shine + 12}%)`}} />
        <div style={{position: 'absolute', left: 36, top: 18, fontFamily: MAN, fontWeight: 800, fontSize: 20, letterSpacing: '0.34em', color: pal.onAc, opacity: 0.75}}>IL VANTAGGIO</div>
        <div style={{position: 'absolute', left: 36, right: 30, top: 48, fontFamily: MAN, fontWeight: 800, fontSize: 36, lineHeight: 1.12, color: pal.onAc}}>{a.benefit}</div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash, mixBlendMode: 'overlay'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ INTRO */

const Intro: React.FC<{lt: number}> = ({lt}) => {
  const e = eExpo(prog(lt, 0, 1.0));
  const base = 560 / LH;
  const S = base * Math.exp(Math.log(5.2) * (1 - e));
  const fx = lerp(478, 363, e), fy = lerp(70, 340, e);
  const blur = (1 - prog(lt, 0, 0.4)) * 16;
  const shine = lerp(-30, 125, prog(lt, 0.35, 1.0));
  const out = eIO(prog(lt, 0.95, 1.3));
  const logoY = lerp(760, 330, out);
  const logoS = lerp(1, 0.46, out);
  const lines = [
    {t: '100', s: 'SERVIZI', at: 1.0, c: WHITE, sz: 300},
    {t: '10', s: 'AREE', at: 1.5, c: TEAL, sz: 300},
  ];
  const final = eBack(prog(lt, 2.0, 2.4), 2.4);
  const tag = eO4(prog(lt, 0.7, 0.95)) * (1 - out);
  const count100 = Math.round(100 * eO4(prog(lt, 1.0, 1.5)));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, #0E3A5C 0%, ${NAVY} 45%, ${INK} 100%)`}}>
      <Glow x={540} y={820} r={900} o={0.4 + 0.3 * prog(lt, 0, 1.0)} />
      <Bokeh t={lt} seed={5} />
      <Dust t={lt} n={60} seed={9} />
      <div style={{position: 'absolute', left: 0, top: 0, width: LW, height: LH, transformOrigin: '0 0', transform: `translate(540px, ${logoY}px) scale(${S * logoS}) translate(${-fx}px, ${-fy}px)`, filter: `blur(${blur}px) drop-shadow(0 0 40px rgba(92,202,212,0.45))`}}>
        <Img src={LOGO()} style={{width: LW, height: LH, display: 'block'}} />
        <div style={{position: 'absolute', inset: 0, ...maskLogo, background: `linear-gradient(105deg, transparent ${shine - 10}%, rgba(255,255,255,0.95) ${shine}%, transparent ${shine + 10}%)`}} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 1220, textAlign: 'center', opacity: tag, transform: `translateY(${(1 - tag) * 20}px)`}}>
        <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 40, letterSpacing: '0.45em', color: WHITE, paddingLeft: '0.45em'}}>PRAGMA SOLUTIONS</div>
        <div style={{fontFamily: MAN, fontWeight: 700, fontSize: 24, letterSpacing: '0.4em', color: TEAL, marginTop: 18, paddingLeft: '0.4em'}}>STUDIO DIGITALE · TORINO</div>
      </div>
      {lines.map((l, i) => {
        const lp = prog(lt, l.at, l.at + 0.28);
        if (lp <= 0) return null;
        const sh = Math.sin((lt - l.at) * 120) * Math.exp(-(lt - l.at) * 22) * 18;
        const up = i === 0 ? count100 : l.t;
        return (
          <div key={l.t} style={{position: 'absolute', left: 0, width: W, top: 520 + i * 410, textAlign: 'center', transform: `translateX(${sh}px) scale(${lerp(2.2, 1, eO5(lp))})`, opacity: clamp(lp * 4), filter: `blur(${(1 - lp) * 14}px)`}}>
            <div style={{fontFamily: ANTON, fontSize: l.sz, lineHeight: 0.95, color: l.c}}>{up}</div>
            <div style={{fontFamily: ANTON, fontSize: 100, lineHeight: 1, color: l.c === WHITE ? TEAL : WHITE, letterSpacing: '0.08em', marginTop: -6}}>{l.s}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, width: W, top: 1400, textAlign: 'center', transform: `scale(${clamp(final, 0, 1.2)})`, opacity: clamp(final)}}>
        <div style={{fontFamily: ANTON, fontSize: 118, lineHeight: 1, color: WHITE, WebkitTextStroke: '0px'}}>UN SOLO <span style={{color: TEAL}}>PARTNER</span></div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ FINALE A: recap */

const FinaleA: React.FC<{lt: number}> = ({lt}) => {
  const t1 = eO5(prog(lt, 0.0, 0.5)), t2 = eO5(prog(lt, 0.12, 0.62));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, #12417A 0%, ${NAVY} 45%, ${INK} 100%)`}}>
      <Glow x={540} y={900} r={1000} c={TEAL} o={0.22} />
      <DotGrid lt={lt} color={TEAL} o={0.16} />
      <Dust t={lt} n={40} seed={77} color={TEAL_HI} />
      <div style={{position: 'absolute', left: 70, top: 210, overflow: 'hidden', height: 150}}>
        <div style={{fontFamily: ANTON, fontSize: 134, color: WHITE, lineHeight: 1.1, transform: `translateY(${(1 - t1) * 150}px)`}}>TUTTO IN UN</div>
      </div>
      <div style={{position: 'absolute', left: 70, top: 350, overflow: 'hidden', height: 150}}>
        <div style={{fontFamily: ANTON, fontSize: 134, color: TEAL, lineHeight: 1.1, transform: `translateY(${(1 - t2) * 150}px)`}}>UNICO PROGETTO</div>
      </div>
      {AREAS.map((a, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const t0 = 0.45 + i * 0.16;
        const p = eO5(prog(lt, t0, t0 + 0.4));
        const lit = Math.exp(-Math.max(0, lt - t0) * 5) ;
        return (
          <div key={a.name} style={{position: 'absolute', left: 70 + col * 480, top: 560 + row * 176, width: 460, height: 156, borderRadius: 30, background: 'rgba(166,243,247,0.10)', border: `3px solid ${lit > 0.25 ? TEAL_HI : 'rgba(166,243,247,0.5)'}`, boxShadow: `0 0 ${lit * 60}px ${TEAL}`, transform: `translateX(${(1 - p) * (col ? 500 : -500)}px) scale(${1 + lit * 0.05})`, opacity: clamp(p * 1.5), padding: '20px 26px', boxSizing: 'border-box'}}>
            <div style={{fontFamily: ANTON, fontSize: 56, color: TEAL, lineHeight: 1}}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 31, color: WHITE, marginTop: 8, letterSpacing: '0.01em'}}>{a.name}</div>
            <div style={{position: 'absolute', right: 22, top: 22}}><Check size={44} p={prog(lt, t0 + 0.25, t0 + 0.6)} color={TEAL_HI} sw={3.5} /></div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, width: W, top: 1470, textAlign: 'center', opacity: eO4(prog(lt, 2.2, 2.6)), transform: `translateY(${(1 - eO4(prog(lt, 2.2, 2.6))) * 20}px)`}}>
        <div style={{fontFamily: ANTON, fontSize: 86, color: WHITE, lineHeight: 1}}>100 SERVIZI.</div>
        <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 28, letterSpacing: '0.3em', color: TEAL_HI, marginTop: 16, paddingLeft: '0.3em'}}>UNO SOLO O COMBINATI</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ FINALE B: logo + CTA */

const FinaleB: React.FC<{lt: number}> = ({lt}) => {
  const lh = 520;
  const k = lh / LH;
  const lx = 540 - (LW * k) / 2, ly = 250;
  const ringP = eO4(prog(lt, 0.0, 0.8));
  const ang = ringP * 360;
  const barsP = (i: number) => eO5(prog(lt, 0.25 + i * 0.1, 0.25 + i * 0.1 + 0.55));
  const shine = lerp(-30, 125, prog(lt, 0.9, 1.6));
  const boom = prog(lt, 0.8, 1.7);
  const word = 'PRAGMA';
  const word2 = 'SOLUTIONS';
  const settle = eO4(prog(lt, 0, 1.2));
  const cta = clamp(popIn(lt, 1.7, 0.5, 2.2), 0, 1.15);
  const pulse = 1 + 0.035 * Math.sin(lt * 7) * prog(lt, 2.2, 2.5);
  const rip = (lt * 1.2) % 1;
  const letters = (w: string, d0: number, fs: number, color: string) => (
    <div style={{display: 'flex', justifyContent: 'center', fontFamily: ANTON, fontSize: fs, color, letterSpacing: '0.04em', lineHeight: 1}}>
      {w.split('').map((ch, i) => {
        const p = eO5(prog(lt, d0 + i * 0.04, d0 + i * 0.04 + 0.4));
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.06em'}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 118}%)`}}>{ch}</span>
          </span>
        );
      })}
    </div>
  );
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 24%, #3E9FB4 0%, #12417A 38%, ${INK} 85%)`}}>
      <Glow x={540} y={500} r={900} c={TEAL_HI} o={0.35 * settle} />
      <Bokeh t={lt} seed={61} n={8} />
      <Dust t={lt} n={50} seed={63} color={TEAL_HI} />
      {[0, 0.12, 0.24].map((d, i) => {
        const p = prog(lt, 0.78 + d, 1.6 + d);
        return p > 0 && p < 1 ? <div key={i} style={{position: 'absolute', left: 540 - 1100 * eO4(p), top: 510 - 1100 * eO4(p), width: 2200 * eO4(p), height: 2200 * eO4(p), borderRadius: 3000, border: `${10 - i * 3}px solid ${TEAL_HI}`, opacity: (1 - p) * 0.8}} /> : null;
      })}
      <div style={{position: 'absolute', left: lx, top: ly, width: LW, height: LH, transformOrigin: '0 0', transform: `scale(${k * (1 + 0.04 * Math.sin(prog(lt, 0.8, 1.2) * Math.PI))})`, filter: `drop-shadow(0 0 ${30 + 40 * Math.sin(boom * Math.PI)}px rgba(166,243,247,0.6))`}}>
        <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `conic-gradient(from 195deg at 50% 63%, #000 ${ang}deg, transparent ${ang + 0.01}deg)`, maskImage: `conic-gradient(from 195deg at 50% 63%, #000 ${ang}deg, transparent ${ang + 0.01}deg)`, opacity: clamp(ringP * 4)}}>
          <Img src={staticFile('ring.png')} style={{width: LW, height: LH, display: 'block'}} />
        </div>
        {[0, 1, 2].map((i) => {
          const x0 = [215, 322, 430][i], x1 = [295, 402, 512][i], p = barsP(i);
          return (
            <div key={i} style={{position: 'absolute', inset: 0, clipPath: `inset(${(1 - p) * 100}% ${100 - (x1 / LW) * 100}% 0 ${(x0 / LW) * 100}%)`}}>
              <Img src={staticFile('bars.png')} style={{width: LW, height: LH, display: 'block'}} />
            </div>
          );
        })}
        <div style={{position: 'absolute', inset: 0, ...maskLogo, background: `linear-gradient(105deg, transparent ${shine - 10}%, rgba(255,255,255,0.95) ${shine}%, transparent ${shine + 10}%)`}} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 800}}>
        {letters(word, 0.85, 150, WHITE)}
        {letters(word2, 1.0, 150, TEAL_HI)}
      </div>
      <Caption text="Il digitale giusto per il tuo settore" lt={lt} delay={1.45} color={WHITE} size={27} style={{position: 'absolute', left: 0, width: W, top: 1130, letterSpacing: '0.2em'}} />
      <div style={{position: 'absolute', left: 90, top: 1240, width: 900, height: 140, transform: `scale(${cta * pulse})`, opacity: clamp(cta)}}>
        <div style={{position: 'absolute', inset: -rip * 40, borderRadius: 100, border: `4px solid ${TEAL_HI}`, opacity: (1 - rip) * 0.7 * prog(lt, 2.0, 2.2)}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: 70, background: `linear-gradient(135deg, ${TEAL_HI}, ${TEAL})`, boxShadow: `0 20px 70px rgba(92,202,212,0.55)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 42, letterSpacing: '0.06em', color: INK}}>PRENOTA UNA CALL GRATUITA</div>
          <div style={{fontFamily: MAN, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: NAVY, marginTop: 8}}>30 MINUTI · CI RACCONTI COME LAVORATE</div>
        </div>
      </div>
      <Caption text="pragmarealsolutions.com" lt={lt} delay={2.1} color={WHITE} size={36} style={{position: 'absolute', left: 0, width: W, top: 1450, letterSpacing: '0.18em', textTransform: 'none'}} />
      <Caption text="Studio digitale · Torino" lt={lt} delay={2.3} color={TEAL_HI} size={24} style={{position: 'absolute', left: 0, width: W, top: 1520}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ montaggio */

const stripPath = (p: number) => {
  const n = 10, sh = H / n;
  let d = '';
  for (let k = 0; k < n; k++) {
    const w = eIO(clamp(p * 1.55 - (k % 2 ? k : n - 1 - k) * 0.075)) * W;
    const x0 = k % 2 ? W - w : 0;
    d += `M${x0} ${k * sh}H${x0 + w}V${(k + 1) * sh}H${x0}Z`;
  }
  return `path('${d}')`;
};

const IN: ((p: number) => React.CSSProperties)[] = [
  (p) => ({transform: `translateY(${(1 - eO5(p)) * H}px)`}),
  (p) => ({clipPath: `circle(${eIO(p) * 1700}px at 50% 55%)`}),
  (p) => ({clipPath: stripPath(p)}),
  (p) => ({clipPath: `polygon(0 0, ${eIO(p) * (W + 600)}px 0, ${eIO(p) * (W + 600) - 600}px ${H}px, 0 ${H}px)`}),
  (p) => ({transform: `scale(${lerp(0.55, 1, eO4(p))}) rotate(${(1 - eO4(p)) * -5}deg)`, opacity: clamp(p * 1.6)}),
];

type Sc = {render: (lt: number) => React.ReactNode; inS?: (p: number) => React.CSSProperties; outS?: (q: number) => React.CSSProperties; pal?: Pal};

const SCENES: Sc[] = [
  {render: (lt) => <Intro lt={lt} />, outS: (q) => ({transform: `scale(${1 + eO4(q) * 0.1})`})},
  ...AREAS.map((a, k): Sc => ({
    render: (lt) => <AreaScene lt={lt} k={k} />,
    inS: IN[k % 5],
    outS: (q) => ({transform: `scale(${1 + eIO(q) * 0.08})`}),
    pal: a.pal,
  })),
  {render: (lt) => <FinaleA lt={lt} />, inS: IN[4]},
  {render: (lt) => <FinaleB lt={lt} />, inS: (p) => ({clipPath: `circle(${eIO(p) * 1700}px at 50% 50%)`})},
];

const HUD: React.FC<{t: number}> = ({t}) => {
  const idx = SC.findIndex((s, i) => t >= s && t < (SC[i + 1] ?? 999));
  const ai = idx - 1; // indice area
  const inArea = ai >= 0 && ai < 10;
  const pal = inArea ? AREAS[ai].pal : P_INK;
  const hc = pal.fg;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 70, top: 78, display: 'flex', alignItems: 'center', gap: 16, opacity: idx === 0 || idx === 12 ? 0 : 1}}>
        <Img src={LOGO()} style={{height: 46, width: 'auto'}} />
        <div style={{fontFamily: MAN, fontWeight: 800, fontSize: 22, letterSpacing: '0.3em', color: hc}}>PRAGMA SOLUTIONS</div>
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 150, display: 'flex', gap: 8, opacity: idx >= 1 && idx <= 10 ? 1 : 0}}>
        {Array.from({length: 10}, (_, i) => {
          const f = i < ai ? 1 : i === ai ? prog(t, SC[idx], SC[idx + 1]) : 0;
          return (
            <div key={i} style={{flex: 1, height: 6, borderRadius: 3, background: pal.dark ? 'rgba(255,255,255,0.22)' : 'rgba(13,27,70,0.2)', overflow: 'hidden'}}>
              <div style={{width: `${f * 100}%`, height: '100%', background: hc}} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Movie: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const els: React.ReactNode[] = [];
  SCENES.forEach((sc, i) => {
    const start = SC[i], end = SC[i + 1];
    if (t < start - 0.2 || t > end + 0.2) return;
    const p = i === 0 ? 1 : prog(t, start - 0.2, start + 0.2);
    const q = i === SCENES.length - 1 ? 0 : prog(t, end - 0.2, end + 0.2);
    const style: React.CSSProperties = {};
    if (p < 1 && sc.inS) Object.assign(style, sc.inS(p));
    if (q > 0 && sc.outS) Object.assign(style, sc.outS(q));
    els.push(
      <AbsoluteFill key={i} style={style}>
        {sc.render(t - start)}
      </AbsoluteFill>
    );
  });
  // anello di taglio sulle scene con apertura a cerchio
  const ringScenes = [2, 7, 12];
  const rings = ringScenes.map((si) => {
    const rp = prog(t, SC[si] - 0.2, SC[si] + 0.2);
    if (rp <= 0 || rp >= 1) return null;
    const rr = eIO(rp) * 1700;
    return <div key={si} style={{position: 'absolute', left: 540 - rr, top: (si === 12 ? 960 : 1056) - rr, width: rr * 2, height: rr * 2, borderRadius: rr * 2, border: `18px solid ${TEAL_HI}`, boxShadow: `0 0 80px ${TEAL}, inset 0 0 80px ${TEAL}`, opacity: 1 - rp * 0.4}} />;
  });
  const fl = Math.max(0, 1 - Math.abs(t - SC[12]) / 0.14);
  return (
    <AbsoluteFill style={{background: INK}}>
      {els}
      {rings}
      <HUD t={t} />
      <AbsoluteFill style={{background: `radial-gradient(circle, #fff, ${TEAL_HI})`, opacity: fl * fl * 0.9}} />
    </AbsoluteFill>
  );
};
