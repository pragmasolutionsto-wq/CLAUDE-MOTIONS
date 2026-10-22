import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Check, Chip, Cursor, DISC_BG, Disc3D, Eyebrow, Fade, glass, Glow, Ring, Title} from './kit';
import {
  bez, CORAL, CYAN, CYAN_HI, eBack, eExpo, eIO, eO3, eO4, eO5, INK, lerp, MONO, MUTED, NAVY, NUM, PAPER, prog, RAL, SKY, W,
  WHITE,
} from './util';

/* ------------------------------------------------------------------ S4 — dal PDF alla scheda */

const FIELDS = [
  {k: 'Ente erogatore', v: 'Regione Piemonte', q: '"Il presente avviso è emanato da Regione Piemonte"', p: 1},
  {k: 'Dotazione', v: '€ 12.000.000', q: '"La dotazione complessiva è pari a € 12.000.000"', p: 3},
  {k: 'Contributo', v: 'da € 10.000 a € 60.000', q: '"Il contributo è concesso da 10.000 € a 60.000 €"', p: 4},
  {k: 'Intensità', v: '50% delle spese', q: '"L\'agevolazione è pari al 50% delle spese ammissibili"', p: 4},
  {k: 'Beneficiari', v: 'Micro, piccole e medie imprese', q: '"Sono ammesse le PMI come definite dall\'Allegato I"', p: 2},
  {k: 'Scadenza', v: '24 ottobre 2026, ore 12:00', q: '"Le domande possono essere presentate fino al 24 ottobre"', p: 7},
];
const PG = {x: 150, y: 290, w: 540, h: 680};
const LINE_Y = [196, 280, 364, 448, 532, 616];
const TH = 14 * (Math.PI / 180);
const CARD = {x: 820, y: 290, w: 950};
const ROW_Y = (k: number) => CARD.y + 196 + k * 84;
const tScan = (k: number) => 1.0 + ((LINE_Y[k] - 150) / 500) * 3.2;

const pagePt = (px: number, py: number, ry: number) => {
  const cxp = PG.x + PG.w / 2, cyp = PG.y + PG.h / 2;
  const x = px - PG.w / 2, y = py - PG.h / 2, P = 1600;
  const x1 = x * Math.cos(ry), z1 = -x * Math.sin(ry);
  const s = P / (P - z1);
  return [cxp + x1 * s, cyp + y * s] as [number, number];
};

export const S4: React.FC<{lt: number}> = ({lt}) => {
  const ent = eO4(prog(lt, 0, 0.9));
  const ry = lerp(-70, 14, ent) + Math.sin(lt * 0.8) * 2;
  const scanY = lerp(150, 650, prog(lt, 1.0, 4.2));
  const scanOn = lt > 0.95 && lt < 4.35;
  const cardIn = eO4(prog(lt, 0.35, 1.2));
  const badge = eBack(prog(lt, 5.5, 6.0));
  const lines = [];
  for (let i = 0; i < 16; i++) {
    const y = 160 + i * 31;
    if (LINE_Y.some((ly) => Math.abs(ly - y - 8) < 30)) continue;
    lines.push(<div key={i} style={{position: 'absolute', left: 44, top: y, height: 10, width: `${60 + ((i * 37) % 30)}%`, background: '#D6D2C9', borderRadius: 3}} />);
  }
  const chips = FIELDS.map((f, k) => {
    const t0 = tScan(k);
    const p = prog(lt, t0, t0 + 0.6);
    if (p <= 0 || p >= 1) return null;
    const a = pagePt(PG.w - 60, LINE_Y[k] + 10, (ry * Math.PI) / 180);
    const b: [number, number] = [CARD.x + 300, ROW_Y(k) + 36];
    const q = bez(a, [a[0] + 160, a[1] - 120], [b[0] - 220, b[1] - 80], b, eIO(p));
    return (
      <div key={k} style={{position: 'absolute', left: q[0], top: q[1], transform: `translate(-50%, -50%) scale(${0.8 + Math.sin(p * Math.PI) * 0.35})`, opacity: 1 - prog(p, 0.85, 1)}}>
        <Chip style={{background: 'rgba(10,16,54,0.9)', boxShadow: `0 0 26px ${CYAN}`}}>{f.v}</Chip>
      </div>
    );
  });
  return (
    <AbsoluteFill>
      <Title eyebrow="ESTRAZIONE · CAMPO PER CAMPO" l1="Dal PDF alla scheda." l2="Ogni dato con la sua fonte." lt={lt} delay={0.1} size={56} style={{left: 150, top: 56}} />
      {/* pila di fogli in 3D */}
      <div style={{position: 'absolute', left: PG.x, top: PG.y, width: PG.w, height: PG.h, perspective: 1600, opacity: ent}}>
        <div style={{position: 'relative', width: PG.w, height: PG.h, transformStyle: 'preserve-3d', transform: `rotateY(${ry}deg)`}}>
          {[3, 2, 1].map((k) => (
            <div key={k} style={{position: 'absolute', inset: 0, background: k === 1 ? '#E6E2D8' : '#D9D4C8', borderRadius: 10, transform: `translateZ(${-k * 26 * ent}px) translate(${k * 14 * ent}px, ${-k * 10 * ent}px)`, boxShadow: '0 20px 60px rgba(0,0,20,0.5)'}} />
          ))}
          <div style={{position: 'absolute', inset: 0, background: PAPER, borderRadius: 10, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,20,0.6)'}}>
            <div style={{position: 'absolute', right: -6, top: 60, width: 22, height: 70, background: CORAL, borderRadius: 6}} />
            <div style={{position: 'absolute', left: 44, top: 40, fontFamily: MONO, fontSize: 15, letterSpacing: '0.2em', color: '#5A6390'}}>REGIONE PIEMONTE · AVVISO PUBBLICO</div>
            <div style={{position: 'absolute', left: 44, top: 70, width: 440, fontFamily: RAL, fontWeight: 700, fontSize: 27, lineHeight: 1.2, color: '#1D2550'}}>Digitalizzazione PMI — voucher investimenti 4.0</div>
            {lines}
            {FIELDS.map((f, k) => {
              const h = prog(lt, tScan(k) - 0.05, tScan(k) + 0.15);
              return (
                <div key={k} style={{position: 'absolute', left: 36, top: LINE_Y[k] - 6, width: 468, padding: '6px 8px', borderRadius: 6, background: `rgba(44,203,234,${0.22 * h})`, outline: h > 0 ? `2px solid rgba(44,203,234,${0.9 * h})` : 'none', fontFamily: RAL, fontSize: 16, fontWeight: 500, color: '#2A3160', whiteSpace: 'nowrap', overflow: 'hidden'}}>
                  {f.q.replace(/"/g, '')}
                </div>
              );
            })}
            <div style={{position: 'absolute', right: 30, bottom: 22, fontFamily: MONO, fontSize: 14, color: '#8088AE'}}>pag. 1–7</div>
            {scanOn && (
              <>
                <div style={{position: 'absolute', left: 0, right: 0, top: scanY - 70, height: 70, background: 'linear-gradient(180deg, transparent, rgba(44,203,234,0.28))'}} />
                <div style={{position: 'absolute', left: 0, right: 0, top: scanY, height: 4, background: CYAN, boxShadow: `0 0 26px 6px ${CYAN}`}} />
              </>
            )}
          </div>
        </div>
      </div>
      {/* scheda */}
      <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, perspective: 1800, opacity: cardIn}}>
        <div style={{transform: `translateX(${(1 - cardIn) * 260}px) rotateY(${lerp(-40, -5, cardIn) + Math.sin(lt * 0.7) * 1.5}deg)`, transformOrigin: '0% 50%', ...glass(26), padding: '30px 40px 26px', boxShadow: badge > 0.5 ? `0 30px 80px rgba(0,0,20,0.5), 0 0 0 2px ${CYAN}88, 0 0 60px rgba(44,203,234,0.35)` : glass().boxShadow}}>
          <div style={{display: 'flex', gap: 10}}>
            <Chip>Regionale</Chip>
            <Chip>Fondo perduto</Chip>
            <Chip c={'#5BE3A8'}>Aperto</Chip>
          </div>
          <div style={{fontFamily: RAL, fontWeight: 600, fontSize: 34, color: WHITE, marginTop: 18}}>Digitalizzazione PMI — voucher investimenti 4.0</div>
          <div style={{fontFamily: RAL, fontSize: 22, color: MUTED, marginTop: 6, marginBottom: 14}}>Regione Piemonte · scheda bando</div>
          {FIELDS.map((f, k) => {
            const p = eO4(prog(lt, tScan(k) + 0.5, tScan(k) + 0.9));
            return (
              <div key={k} style={{height: 84, borderTop: '1px solid rgba(140,200,255,0.14)', display: 'flex', alignItems: 'center', gap: 24}}>
                <div style={{width: 210, fontFamily: MONO, fontSize: 16, letterSpacing: '0.12em', color: MUTED, textTransform: 'uppercase'}}>{f.k}</div>
                <div style={{flex: 1, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
                  <div style={{fontFamily: RAL, fontWeight: 600, fontSize: 30, color: WHITE, ...NUM}}>{f.v}</div>
                  <div style={{fontFamily: RAL, fontStyle: 'italic', fontSize: 15, color: MUTED, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 520}}>{f.q}</div>
                </div>
                <div style={{opacity: p, transform: `scale(${0.6 + 0.4 * eBack(prog(lt, tScan(k) + 0.6, tScan(k) + 1.0))})`}}>
                  <Chip>p. {f.p}</Chip>
                </div>
              </div>
            );
          })}
        </div>
        {badge > 0 && (
          <div style={{position: 'absolute', right: -30, top: -34, transform: `scale(${badge}) rotate(${(1 - badge) * -12}deg)`, ...glass(40), background: `linear-gradient(135deg, ${CYAN} 0%, ${SKY} 100%)`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12}}>
            <svg width={26} height={26} viewBox="0 0 20 20"><path d="M3 10.5 L8 15 L17 5" fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 20, color: INK, letterSpacing: '0.08em', ...NUM}}>FIDUCIA 98/100 · VERIFICATO</div>
          </div>
        )}
      </div>
      {chips}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S5 — matching sui clienti */

const CLIENTS = [
  {n: 'Cascina Bellavista S.r.l.', d: 'Agroalimentare · Cuneo', m: 'PMI · 18 dipendenti', s: 94, ok: true},
  {n: 'Hotel Regina Margherita', d: 'Turismo · Torino', m: 'PMI · 32 dipendenti', s: 63, ok: true},
  {n: 'Coop. Arcobaleno', d: 'Servizi sociali · Asti', m: 'Cooperativa · 54 soci', s: 41, ok: false},
  {n: 'Studio Engineering S.p.A.', d: 'Ingegneria · Milano', m: 'Grande impresa', s: 12, ok: false},
];
const CRIT = [
  {k: 'Territorio', w: 'bloccante'},
  {k: 'Dimensione PMI', w: 'bloccante'},
  {k: 'ATECO ammesso', w: 'bloccante'},
  {k: 'Investimenti coerenti', w: 'peso 3'},
  {k: 'Importo nel range', w: 'peso 2'},
  {k: 'Tempi compatibili', w: 'peso 1'},
];

export const S5: React.FC<{lt: number}> = ({lt}) => {
  const spin = eO4(prog(lt, 0.2, 2.7));
  const rot = 720 * spin;
  const settled = prog(lt, 2.5, 2.9);
  const R = 360, cx = 840, cy = 650;
  const panel = eO4(prog(lt, 2.6, 3.3));
  const score = 94 * eO3(prog(lt, 2.9, 5.0));
  const verdict = eBack(prog(lt, 5.0, 5.4));
  const btn = eO4(prog(lt, 5.3, 5.7));
  const curT = eIO(prog(lt, 5.5, 6.3));
  const press = prog(lt, 6.35, 6.8);
  const toast = eBack(prog(lt, 6.55, 7.0));
  const beam = eO4(prog(lt, 2.7, 3.2));
  return (
    <AbsoluteFill>
      <Title eyebrow="MATCHING AUTOMATICO" l1="Il bando giusto." l2="Al cliente giusto." lt={lt} delay={0.1} size={64} style={{left: 150, top: 70}} />
      {/* bando che cerca il cliente */}
      <div style={{position: 'absolute', left: cx - 230, top: 300, width: 460, ...glass(18), padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, opacity: eO4(prog(lt, 0.3, 0.9)), transform: `translateY(${Math.sin(lt * 2) * 5}px)`}}>
        <div style={{width: 46, height: 46, borderRadius: 10, background: PAPER, position: 'relative', flexShrink: 0}}>
          <div style={{position: 'absolute', right: -3, top: 8, width: 7, height: 16, background: CORAL, borderRadius: 2}} />
        </div>
        <div>
          <div style={{fontFamily: RAL, fontWeight: 600, fontSize: 22, color: WHITE}}>Voucher digitalizzazione PMI</div>
          <div style={{fontFamily: MONO, fontSize: 14, color: CYAN, marginTop: 3}}>Piemonte · fino a € 60.000 · 50%</div>
        </div>
      </div>
      <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={cx} y1={372} x2={cx} y2={372 + 155 * beam} stroke={CYAN} strokeWidth={3} strokeDasharray="8 8" strokeDashoffset={-lt * 60} opacity={beam} />
      </svg>
      {/* carosello 3D dei clienti */}
      <div style={{position: 'absolute', left: cx - 200, top: cy - 115, width: 400, height: 230, perspective: 1400}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${-R}px) rotateX(-6deg) rotateY(${-rot}deg)`}}>
          {CLIENTS.map((c, i) => {
            const front = i === 0;
            const hl = front ? settled : 0;
            return (
              <div key={i} style={{position: 'absolute', inset: 0, transform: `rotateY(${i * 90}deg) translateZ(${R}px)`, backfaceVisibility: 'hidden', ...glass(20), background: front && hl > 0 ? `linear-gradient(160deg, rgba(44,203,234,${0.28 * hl}) 0%, rgba(20,30,90,0.75) 100%)` : 'linear-gradient(160deg, rgba(150,190,255,0.16) 0%, rgba(20,30,90,0.8) 100%)', border: `2px solid ${front && hl > 0 ? CYAN : 'rgba(140,200,255,0.25)'}`, boxShadow: front && hl > 0 ? `0 0 ${60 * hl}px rgba(44,203,234,0.55)` : '0 30px 60px rgba(0,0,20,0.5)', padding: '24px 26px', boxSizing: 'border-box'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <div style={{width: 40, height: 40, borderRadius: 10, background: DISC_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: RAL, fontWeight: 700, fontSize: 18, color: WHITE}}>{c.n[0]}</div>
                  <div style={{fontFamily: RAL, fontWeight: 600, fontSize: 21, color: WHITE, lineHeight: 1.15}}>{c.n}</div>
                </div>
                <div style={{fontFamily: RAL, fontSize: 18, color: MUTED, marginTop: 16}}>{c.d}</div>
                <div style={{fontFamily: MONO, fontSize: 14, color: MUTED, marginTop: 6}}>{c.m}</div>
                <div style={{position: 'absolute', right: 20, bottom: 18, opacity: settled}}>
                  <Chip c={c.ok ? CYAN : CORAL}>{front ? Math.round(score) : c.s}</Chip>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* pannello compatibilità */}
      <div style={{position: 'absolute', left: 1330, top: 220, width: 440, opacity: panel, transform: `translateX(${(1 - panel) * 120}px) perspective(1400px) rotateY(${(1 - panel) * -30 - 6}deg)`, ...glass(26), padding: '28px 32px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <Ring v={score} s={170} label="MATCH" />
          <div>
            <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: '0.16em', color: MUTED}}>VERIFICA PER</div>
            <div style={{fontFamily: RAL, fontWeight: 600, fontSize: 25, color: WHITE, marginTop: 6, lineHeight: 1.2}}>Cascina Bellavista S.r.l.</div>
          </div>
        </div>
        <div style={{marginTop: 18}}>
          {CRIT.map((c, k) => {
            const p = prog(lt, 3.0 + k * 0.3, 3.35 + k * 0.3);
            return (
              <div key={k} style={{display: 'flex', alignItems: 'center', gap: 14, height: 50, borderTop: '1px solid rgba(140,200,255,0.12)'}}>
                <Check p={p} s={30} />
                <div style={{flex: 1, fontFamily: RAL, fontWeight: 500, fontSize: 21, color: p > 0 ? WHITE : MUTED}}>{c.k}</div>
                <div style={{fontFamily: MONO, fontSize: 14, color: c.w === 'bloccante' ? CORAL : MUTED}}>{c.w}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${verdict})`, transformOrigin: '0 50%', opacity: verdict > 0 ? 1 : 0}}>
          <div style={{fontFamily: RAL, fontSize: 22, color: MUTED}}>Esito:</div>
          <Chip c={'#5BE3A8'} style={{fontSize: 18}}>COMPATIBILE</Chip>
        </div>
        <div style={{marginTop: 18, opacity: btn, transform: `translateY(${(1 - btn) * 20}px) scale(${1 - 0.05 * Math.sin(press * Math.PI)})`, background: press > 0.2 ? CYAN_HI : `linear-gradient(135deg, ${CYAN}, ${SKY})`, borderRadius: 14, padding: '16px 0', textAlign: 'center', fontFamily: RAL, fontWeight: 700, fontSize: 21, color: INK, boxShadow: `0 10px 40px rgba(44,203,234,${0.35 + 0.4 * press})`}}>
          Approva e abbina al cliente
        </div>
      </div>
      {lt > 5.4 && <Cursor x={lerp(1900, 1560, curT)} y={lerp(1100, 900, curT)} press={press} />}
      {toast > 0 && (
        <div style={{position: 'absolute', left: cx - 260, top: 860, width: 520, transform: `scale(${toast})`, ...glass(18), background: 'linear-gradient(135deg, rgba(91,227,168,0.22), rgba(10,16,54,0.9))', border: '1.5px solid rgba(91,227,168,0.6)', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14}}>
          <Check p={1} s={30} />
          <div style={{fontFamily: RAL, fontWeight: 600, fontSize: 21, color: WHITE}}>Abbinato a Cascina Bellavista S.r.l.</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S6 — scadenze e clienti informati */

const Icon: React.FC<{k: string; c: string}> = ({k, c}) => {
  const p = {fill: 'none', stroke: c, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={30} height={30} viewBox="0 0 24 24">
      {k === 'bell' && <path {...p} d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9M10 20a2 2 0 0 0 4 0" />}
      {k === 'mail' && <path {...p} d="M3 6h18v12H3zM3 7l9 6 9-6" />}
      {k === 'chat' && <path {...p} d="M4 5h16v11H9l-5 4z" />}
      {k === 'folder' && <path {...p} d="M3 6h7l2 2h9v11H3z" />}
    </svg>
  );
};

const NOTES = [
  {i: 'bell', c: CORAL, h: 'Scadenza tra 2 giorni', s: 'Voucher digitalizzazione PMI · 24 ott, ore 12:00'},
  {i: 'mail', c: CYAN, h: 'Email inviata al cliente', s: 'Cascina Bellavista · nuova opportunità, match 94'},
  {i: 'chat', c: '#5BE3A8', h: 'WhatsApp · Cascina Bellavista', s: '"Perfetto, procediamo con la domanda!"'},
  {i: 'folder', c: CYAN, h: 'Pratica aperta', s: 'Preventivi · DSAN de minimis · visura · DURC'},
];

export const S6: React.FC<{lt: number}> = ({lt}) => {
  const flip = eIO(prog(lt, 0.35, 1.15));
  const ent = eO4(prog(lt, 0, 0.8));
  const days = [];
  for (let i = 0; i < 35; i++) {
    const d = i - 2;
    const valid = d >= 1 && d <= 31;
    const hot = d === 24, open = d === 15;
    const pulse = hot ? (lt * 1.6) % 1 : 0;
    days.push(
      <div key={i} style={{position: 'relative', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: RAL, fontWeight: hot ? 700 : 500, fontSize: 24, color: valid ? (hot ? INK : WHITE) : 'transparent', ...NUM}}>
        {hot && <div style={{position: 'absolute', width: 52, height: 52, borderRadius: 52, background: CORAL, boxShadow: `0 0 30px ${CORAL}`, transform: `scale(${eBack(prog(lt, 1.2, 1.6))})`}} />}
        {hot && lt > 1.6 && <div style={{position: 'absolute', width: 52, height: 52, borderRadius: 52, border: `3px solid ${CORAL}`, transform: `scale(${1 + pulse * 0.9})`, opacity: 1 - pulse}} />}
        {open && <div style={{position: 'absolute', width: 52, height: 52, borderRadius: 52, border: `2px solid ${CYAN}`, opacity: prog(lt, 1.0, 1.3)}} />}
        <span style={{position: 'relative'}}>{valid ? d : '·'}</span>
      </div>
    );
  }
  return (
    <AbsoluteFill>
      <Title eyebrow="SCADENZE · PRATICHE · CLIENTI" l1="Il tempo, organizzato." l2="Il cliente, informato." lt={lt} delay={0.1} size={64} style={{left: 150, top: 70}} />
      <div style={{position: 'absolute', left: 150, top: 340, width: 640, perspective: 1600, opacity: ent}}>
        <div style={{position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${12 + Math.sin(lt) * 2}deg) rotateY(${lerp(40, 16, ent)}deg)`}}>
          <div style={{...glass(24), padding: '26px 30px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
              <div style={{fontFamily: RAL, fontWeight: 600, fontSize: 34, color: WHITE}}>Ottobre 2026</div>
              <div style={{fontFamily: MONO, fontSize: 16, color: CYAN}}>CALENDARIO STUDIO</div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginTop: 16, fontFamily: MONO, fontSize: 15, color: MUTED, textAlign: 'center'}}>
              {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginTop: 8}}>{days}</div>
            <div style={{display: 'flex', gap: 22, marginTop: 10, fontFamily: MONO, fontSize: 15, color: MUTED}}>
              <span><span style={{color: CYAN}}>○</span> apertura 15/10</span>
              <span><span style={{color: CORAL}}>●</span> scadenza 24/10</span>
            </div>
          </div>
          {/* foglio di settembre che si stacca */}
          {flip < 1 && (
            <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 0%', transform: `rotateX(${flip * 175}deg) translateZ(2px)`, background: `linear-gradient(180deg, #1A2768 0%, ${NAVY} 100%)`, border: '1.5px solid rgba(140,200,255,0.3)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: RAL, fontWeight: 300, fontSize: 64, color: WHITE, opacity: 1 - prog(flip, 0.7, 1)}}>
              Settembre
            </div>
          )}
        </div>
        <div style={{position: 'absolute', right: -40, top: -36, transform: `scale(${eBack(prog(lt, 1.5, 1.9))})`, background: CORAL, color: INK, fontFamily: MONO, fontWeight: 500, fontSize: 22, padding: '10px 18px', borderRadius: 40, boxShadow: `0 0 30px ${CORAL}`, ...NUM}}>
          − 2 giorni
        </div>
      </div>
      <div style={{position: 'absolute', left: 960, top: 300, width: 800, perspective: 1600}}>
        {NOTES.map((n, i) => {
          const p = eO5(prog(lt, 1.3 + i * 0.6, 1.95 + i * 0.6));
          return (
            <div key={i} style={{opacity: p, transform: `translateY(${(1 - p) * 80}px) rotateX(${(1 - p) * -75}deg) rotateY(-8deg)`, transformOrigin: '50% 0%', ...glass(20), padding: '20px 26px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 22}}>
              <div style={{width: 60, height: 60, borderRadius: 16, background: `${n.c}22`, border: `1.5px solid ${n.c}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                <Icon k={n.i} c={n.c} />
              </div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: RAL, fontWeight: 600, fontSize: 27, color: WHITE}}>{n.h}</div>
                <div style={{fontFamily: RAL, fontSize: 21, color: MUTED, marginTop: 4, ...NUM}}>{n.s}</div>
              </div>
              <div style={{fontFamily: MONO, fontSize: 15, color: MUTED}}>ora</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S7 — due accessi */

const SIDES = [
  {e: 'PER STUDI E CONSULENTI', h: 'Più visione sui tuoi clienti.', b: ['Portafoglio clienti e matching automatico', 'Pratiche, calendario e documenti', 'Area riservata e schede col tuo marchio', 'Email e WhatsApp ai clienti']},
  {e: 'PER IMPRESE', h: 'Più spazio ai tuoi progetti.', b: ['Il profilo della tua azienda al centro', 'Requisiti e opportunità, a colpo d\'occhio', 'Scadenze sempre sotto controllo', 'Dati riservati, accessi dedicati']},
];

export const S7: React.FC<{lt: number}> = ({lt}) => (
  <AbsoluteFill>
    <Title eyebrow="DUE ACCESSI" l1="Due prospettive." l2="Un solo spazio." lt={lt} delay={0.05} size={70} align="center" style={{left: 0, width: W, top: 70}} />
    {SIDES.map((s, i) => {
      const p = eO4(prog(lt, 0.35 + i * 0.2, 1.25 + i * 0.2));
      const sign = i ? 1 : -1;
      return (
        <div key={i} style={{position: 'absolute', left: i ? 1000 : 180, top: 400, width: 740, perspective: 1800, opacity: p}}>
          <div style={{transform: `rotateY(${sign * lerp(75, 7, p) + Math.sin(lt * 0.9 + i) * 2}deg) translateZ(${(1 - p) * -300}px)`, transformOrigin: i ? '0% 50%' : '100% 50%', ...glass(28), padding: '36px 42px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{width: 54, height: 54, borderRadius: 14, background: i ? `linear-gradient(135deg, ${CORAL}, #F4A08F)` : DISC_BG, boxShadow: '0 10px 30px rgba(0,0,20,0.4)'}} />
              <Eyebrow text={s.e} lt={lt} delay={0.6 + i * 0.2} />
            </div>
            <div style={{fontFamily: RAL, fontWeight: 500, fontSize: 44, color: WHITE, marginTop: 22}}>{s.h}</div>
            <div style={{marginTop: 18}}>
              {s.b.map((b, k) => {
                const q = prog(lt, 1.0 + i * 0.2 + k * 0.18, 1.3 + i * 0.2 + k * 0.18);
                return (
                  <div key={k} style={{display: 'flex', alignItems: 'center', gap: 16, height: 56, opacity: 0.25 + 0.75 * q}}>
                    <Check p={q} s={30} />
                    <div style={{fontFamily: RAL, fontSize: 25, color: WHITE}}>{b}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    })}
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ S8 — chiusura */

export const S8: React.FC<{lt: number; dur: number}> = ({lt, dur}) => {
  const land = eExpo(prog(lt, 0, 1.3));
  const spin = eO4(prog(lt, 0, 1.6));
  const shock = prog(lt, 1.0, 2.0);
  const end = 1 - prog(lt, dur - 0.7, dur);
  const word = 'Agevolia';
  return (
    <AbsoluteFill style={{opacity: end}}>
      <Glow x={960} y={330} r={800} c={SKY} o={0.4 * land} />
      {shock > 0 && shock < 1 && (
        <div style={{position: 'absolute', left: 960 - 700 * eO3(shock), top: 330 - 700 * eO3(shock), width: 1400 * eO3(shock), height: 1400 * eO3(shock), borderRadius: '50%', border: `${5 * (1 - shock) + 1}px solid ${CYAN_HI}`, opacity: 1 - shock}} />
      )}
      <div style={{position: 'absolute', left: 960 - 140, top: 330 - 140, transform: `scale(${lerp(0.05, 1, land)})`}}>
        <Disc3D size={280} rx={lerp(40, 4, spin)} ry={lerp(-540, 0, spin) + Math.sin(lt * 1.2) * 8 * prog(lt, 1.6, 2.4)} shine={lerp(-40, 150, prog(lt, 1.4, 2.3))} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 520, display: 'flex', justifyContent: 'center', perspective: 1200, fontFamily: RAL, fontWeight: 500, fontSize: 150, color: WHITE, letterSpacing: '-0.02em', lineHeight: 1}}>
        {word.split('').map((ch, i) => {
          const p = prog(lt, 1.1 + i * 0.05, 1.7 + i * 0.05);
          return (
            <span key={i} style={{display: 'inline-block', transform: `rotateX(${(1 - eO4(p)) * -100}deg) translateY(${(1 - eO4(p)) * 40}px)`, transformOrigin: '50% 100%', opacity: p > 0 ? 1 : 0}}>{ch}</span>
          );
        })}
      </div>
      <Fade lt={lt} a={1.9} style={{position: 'absolute', left: 0, width: W, top: 710, textAlign: 'center', fontFamily: RAL, fontSize: 46, color: WHITE}}>
        Ogni bando giusto, <span style={{color: CYAN}}>al cliente giusto</span>, prima di tutti.
      </Fade>
      <div style={{position: 'absolute', left: 0, width: W, top: 820, display: 'flex', justifyContent: 'center', gap: 22}}>
        {['Accesso studi', 'Accesso aziende'].map((l, i) => {
          const p = eBack(prog(lt, 2.6 + i * 0.15, 3.0 + i * 0.15));
          return (
            <div key={i} style={{transform: `scale(${p})`, padding: '18px 38px', borderRadius: 60, fontFamily: RAL, fontWeight: 700, fontSize: 26, color: i ? WHITE : INK, background: i ? 'transparent' : `linear-gradient(135deg, ${CYAN}, ${SKY})`, border: i ? `2px solid ${CYAN}` : 'none', boxShadow: i ? 'none' : `0 10px 40px rgba(44,203,234,0.45)`}}>
              {l} →
            </div>
          );
        })}
      </div>
      <Fade lt={lt} a={3.3} style={{position: 'absolute', left: 0, width: W, top: 980, textAlign: 'center', fontFamily: MONO, fontSize: 18, letterSpacing: '0.3em', color: MUTED}}>
        STUDIO GUSLANDI &amp; ASSOCIATI
      </Fade>
    </AbsoluteFill>
  );
};
