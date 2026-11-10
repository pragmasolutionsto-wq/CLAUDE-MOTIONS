// Reel farmacista "Complicanze del diabete": stessa pipeline dei reel precedenti (base tagliata, sottotitoli Whisper, schede sotto il viso).
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BODY, HEAD, LOGO, MARK, MINT, PAYOFF, SAGE, TEAL, TEAL_DEEP, W, WHITE} from '../brand';
import {Backdrop, Line, TitleLine} from '../kit';
import {clamp, eBack, eElastic, eIO, eO3, eO5, lerp, prog} from '../util';
import E from './edit.json';

export const FPS = E.fps;
export const DURATION = E.total;
const SEG = E.segments;
const A = E.a;
const fr = (x: number) => Math.round(x * FPS); // confronti sempre a fotogrammi interi
const END_AT = A.endIn;

/* ------------------------------------------------------------------ girato */

// video base unico già tagliato a fotogramma (build_edit.py): qui solo l'inquadratura per segmento,
// che cambia di netto sul taglio per mascherare il jump cut
const FRAMING: [number, number, number][] = Array.from({length: 40}, (_, i) =>
  (i % 3 === 0 ? [1.12, 1.15, -110] : i % 3 === 1 ? [1.18, 1.21, -140] : [1.15, 1.18, -125]) as [number, number, number]);

const Footage: React.FC<{T: number}> = ({T}) => {
  const f = Math.round(T * FPS);
  let i = SEG.findIndex((s) => f >= fr(s.start) && f < fr(s.end));
  if (i < 0) i = SEG.length - 1;
  const s = SEG[i];
  const [z0, z1, dy] = FRAMING[i];
  const z = lerp(z0, z1, eIO(prog(T, s.start, s.end)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile('complicanze/base.mp4')} muted
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translateY(${dy}px) scale(${z})`, transformOrigin: '50% 38%'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ sottotitoli */

const Captions: React.FC<{T: number; hide: boolean}> = ({T, hide}) => {
  const ph = E.phrases.find((p) => T >= p.s && T < p.e);
  if (!ph || hide) return null;
  const pin = eO5(prog(T, ph.s, ph.s + 0.18));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1530, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 14px',
      transform: `translateY(${(1 - pin) * 24}px) scale(${lerp(0.94, 1, pin)})`, opacity: pin}}>
      {ph.words.map((k) => {
        const w = E.words[k];
        const next = E.words[k + 1];
        const end = next && next.seg === w.seg ? next.s : w.e + 0.3;
        const now = T >= w.s - 0.03 && T < end - 0.03;
        const pop = eBack(prog(T, w.s - 0.04, w.s + 0.1), 2.4);
        const o = '#013F41';
        return (
          <span key={k} style={{
            fontFamily: HEAD, fontSize: 86, lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: 1, display: 'inline-block',
            color: now ? TEAL_DEEP : WHITE, background: now ? MINT : 'transparent', borderRadius: 16, padding: '0 14px',
            transform: `scale(${now ? lerp(0.92, 1.06, clamp(pop)) : 1})`,
            textShadow: now ? 'none' : `0 0 2px ${o}, 3px 3px 0 ${o}, -3px 3px 0 ${o}, 3px -3px 0 ${o}, -3px -3px 0 ${o}, 0 4px 0 ${o}, 0 10px 24px rgba(0,0,0,0.45)`,
            boxShadow: now ? '0 10px 24px rgba(1,40,40,0.35)' : 'none',
          }}>{w.w}</span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ pezzi grafici */

const Title: React.FC<{T: number; at: number; until: number; lines: Line[]; top?: number; stagger?: number}> = ({T, at, until, lines, top = 1150, stagger = 0.14}) => {
  if (T < at || T > until + 0.3) return null;
  const out = eO3(prog(T, until, until + 0.3));
  return (
    <div style={{position: 'absolute', left: 0, top, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: 1 - out, transform: `translateY(${-30 * out}px)`}}>
      {lines.map((l, i) => <TitleLine key={i} line={l} p={prog(T, at + i * stagger, at + i * stagger + 0.55)} />)}
    </div>
  );
};

const Chip: React.FC<{T: number; at: number; until: number; text: string; x?: number; y: number; wobble?: boolean}> = ({T, at, until, text, x, y, wobble}) => {
  if (T < at || T > until + 0.3) return null;
  const t = T - at;
  const out = prog(T, until, until + 0.3);
  const rot = wobble ? Math.sin(t * 7) * 5 * Math.exp(-t * 0.6) : 0;
  return (
    <div style={{position: 'absolute', left: x ?? 0, width: x === undefined ? W : undefined, top: y, display: 'flex', justifyContent: 'center',
      opacity: 1 - out}}>
      <div style={{transform: `scale(${eBack(prog(t, 0, 0.45), 2.4) * (1 - out * 0.2)}) rotate(${rot}deg)`, fontFamily: HEAD, fontSize: 64,
        color: TEAL, background: WHITE, border: `4px solid ${MINT}`, borderRadius: 26, padding: '6px 30px 2px', boxShadow: '0 12px 30px rgba(1,40,40,0.28)',
        opacity: clamp(prog(t, 0, 0.12) * 1.5)}}>
        {text}
      </div>
    </div>
  );
};

// cartello a schermo pieno sopra il girato (entra e esce a tendina dal basso)
const Panel: React.FC<{T: number; at: number; until: number; children: (t: number) => React.ReactNode}> = ({T, at, until, children}) => {
  const f = Math.round(T * FPS);
  if (f < fr(at) || f >= fr(until)) return null;
  const pin = eO5(prog(T, at, at + 0.4));
  const pout = 0; // uscita netta sul taglio
  const y = (1 - pin) * 1920 - pout * 1920;
  return (
    <AbsoluteFill style={{transform: `translateY(${y}px)`, borderRadius: pin < 1 || pout > 0 ? 60 : 0, overflow: 'hidden'}}>
      <Backdrop t={T} />
      {children(T - at)}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ schede sopra il girato (lei resta sempre visibile) */

// scheda bianca nella metà bassa: entra dal basso, esce sfumando; il viso sopra resta libero
const CARD_BOTTOM = 1490;
const Card: React.FC<{T: number; at: number; until: number; h: number; children: (t: number) => React.ReactNode}> = ({T, at, until, h, children}) => {
  const f = Math.round(T * FPS);
  if (f < fr(at) || f >= fr(until)) return null;
  const t = T - at;
  const pin = eO5(prog(T, at, at + 0.45));
  const pout = eO3(prog(T, until - 0.3, until));
  return (
    <div style={{position: 'absolute', left: 50, width: W - 100, top: CARD_BOTTOM - h, height: h, borderRadius: 40, overflow: 'hidden',
      background: 'rgba(255,255,255,0.95)', boxShadow: '0 24px 60px rgba(1,40,40,0.35)', border: `4px solid ${MINT}`,
      opacity: 1 - pout, transform: `translateY(${(1 - pin) * 520 + pout * 30}px) scale(${lerp(0.94, 1, pin)})`}}>
      {children(t)}
    </div>
  );
};

const CardTitle: React.FC<{text: string; p: number}> = ({text, p}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 18, display: 'flex', justifyContent: 'center'}}>
    <div style={{fontFamily: HEAD, fontSize: 52, color: WHITE, background: TEAL, borderRadius: 20, padding: '3px 26px 0',
      transform: `scale(${lerp(0.7, 1, eBack(clamp(p), 2))})`, opacity: clamp(p * 3)}}>{text}</div>
  </div>
);

/* righe numerate dentro le schede */
const Rows: React.FC<{t: number; title: string; items: string[]; at: number[]; accent?: number; size?: number}> = ({t, title, items, at, accent = -1, size = 44}) => (
  <>
    <CardTitle text={title} p={prog(t, 0.15, 0.6)} />
    {items.map((l, i) => {
      const p = prog(t, at[i], at[i] + 0.45);
      const hi = i === accent;
      return (
        <div key={l} style={{position: 'absolute', left: 36, right: 36, top: 92 + i * 80, height: 70, borderRadius: 22,
          background: hi ? TEAL : 'rgba(92,192,168,0.16)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 24px',
          opacity: clamp(p * 3), transform: `translateX(${(1 - eO5(p)) * -120}px)`}}>
          <div style={{flex: '0 0 50px', height: 50, borderRadius: 25, background: hi ? MINT : TEAL, color: WHITE, fontFamily: HEAD, fontSize: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
          <div style={{fontFamily: HEAD, fontSize: size, color: hi ? WHITE : TEAL, whiteSpace: 'nowrap'}}>{l}</div>
        </div>
      );
    })}
  </>
);

/* parole chiave a pillole dentro le schede */
const Pills: React.FC<{t: number; title: string; items: string[]; at: number[]; size?: number}> = ({t, title, items, at, size = 46}) => (
  <>
    <CardTitle text={title} p={prog(t, 0.15, 0.6)} />
    <div style={{position: 'absolute', left: 24, right: 24, top: 96, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14}}>
      {items.map((l, i) => {
        const p = eBack(prog(t, at[i], at[i] + 0.45), 2.4);
        return (
          <div key={l} style={{transform: `scale(${clamp(p, 0, 1.2)})`, opacity: clamp(p * 2), fontFamily: HEAD, fontSize: size,
            color: i % 2 ? WHITE : TEAL, background: i % 2 ? TEAL : WHITE, border: `3px solid ${MINT}`, borderRadius: 22, padding: '4px 24px 0'}}>{l}</div>
        );
      })}
    </div>
  </>
);

/* ------------------------------------------------------------------ cartello finale */

const EndCard: React.FC<{T: number}> = ({T}) => {
  const t = T - END_AT;
  if (t < 0) return null;
  const r = eIO(prog(t, 0, 0.55)) * 1300;
  const pm = eElastic(prog(t, 0.15, 1.2));
  const pl = eO3(prog(t, 0.45, 0.95));
  const pp = eO3(prog(t, 0.8, 1.25));
  const pa = eO3(prog(t, 1.1, 1.55));
  const mh = 290, mw = (mh * MARK.w) / MARK.h, lw = 620;
  return (
    <AbsoluteFill style={{clipPath: `circle(${r}px at 50% 50%)`}}>
      <Backdrop t={T} />
      <div style={{position: 'absolute', left: W / 2 - 230, top: 300, width: 460, height: 460, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(92,192,168,0.32) 0%, rgba(92,192,168,0) 70%)', opacity: clamp(pm)}} />
      <Img src={staticFile(MARK.file)} style={{position: 'absolute', left: (W - mw) / 2, top: 380, width: mw, height: mh, transform: `scale(${pm})`}} />
      <Img src={staticFile(LOGO.file)} style={{position: 'absolute', left: (W - lw) / 2, top: 730, width: lw, height: (lw * LOGO.h) / LOGO.w,
        opacity: pl, transform: `translateY(${(1 - pl) * 30}px)`}} />
      <div style={{position: 'absolute', left: 0, top: 1020, width: W, display: 'flex', justifyContent: 'center', opacity: pp,
        transform: `scale(${lerp(0.85, 1, eBack(pp))})`}}>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 42, color: WHITE, background: TEAL, borderRadius: 44, padding: '18px 44px',
          boxShadow: '0 14px 30px rgba(1,63,65,0.25)'}}>{PAYOFF}</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 1150, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        opacity: pa, transform: `translateY(${(1 - pa) * 20}px)`, fontFamily: BODY, color: TEAL_DEEP}}>
        <div style={{fontWeight: 700, fontSize: 38}}>Corso Garibaldi 49 · Brindisi</div>
        <div style={{fontWeight: 800, fontSize: 38, color: TEAL, background: WHITE, border: `3px solid ${MINT}`, borderRadius: 34, padding: '10px 32px'}}>
          WhatsApp 328 837 3357
        </div>
        <div style={{fontWeight: 600, fontSize: 24, marginTop: 30, opacity: 0.8}}>Le informazioni non sostituiscono il parere del medico.</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ montaggio */

export const Movie: React.FC = () => {
  const f = useCurrentFrame();
  const T = f / FPS;
  const logoO = 1 - prog(T, END_AT, END_AT + 0.3);
  const t112 = (x: string, size = 112) => ({text: x, box: 'mint' as const, size});
  const T112 = (x: string, size = 112) => ({text: x, box: 'teal' as const, size});
  const rel = (at: number, xs: number[]) => xs.map((x) => x - at);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Footage T={T} />

      {/* schede nella metà bassa: lei resta sempre visibile sopra */}
      <Card T={T} at={A.pelle - 0.15} until={A.puglia - 0.1} h={200}>
        {(t) => <Pills t={t} title="SEGNALI DA ASCOLTARE" items={['PELLE SECCA', 'OCCHI SECCHI', 'FASTIDI INTIMI']} at={rel(A.pelle - 0.15, [A.pelle, A.occhi, A.fastidi])} size={44} />}
      </Card>
      <Card T={T} at={A.whyIn} until={A.whyOut} h={340}>
        {(t) => <Rows t={t} title="PERCHÉ SUCCEDE" items={['GLICEMIA ALTA: PIÙ LIQUIDI PERSI', 'PELLE DISIDRATATA', 'NERVI: MENO SUDORAZIONE']}
          at={rel(A.whyIn, [A.glicemia, A.disidrata, A.nervi])} size={40} />}
      </Card>
      <Card T={T} at={A.footIn} until={A.footOut} h={290}>
        {(t) => <Pills t={t} title="PIEDI: CONTROLLALI OGNI GIORNO" items={['TALLONI', 'PIANTA', 'DITA', 'SPAZI TRA LE DITA']}
          at={rel(A.footIn, [A.talloni, A.pianta, A.dita, A.spazi])} size={54} />}
      </Card>
      <Card T={T} at={A.asciuga - 0.1} until={A.eyeIn - 0.1} h={340}>
        {(t) => <Rows t={t} title="CURA DEI PIEDI" items={['ASCIUGALI BENE', 'CREMA EMOLLIENTE SENZA PROFUMO', 'MAI TRA LE DITA']}
          at={rel(A.asciuga - 0.1, [A.asciuga, A.crema, A.nonmettere])} accent={2} size={40} />}
      </Card>
      <Card T={T} at={A.eyeIn} until={A.eyeOut} h={290}>
        {(t) => <Pills t={t} title="OCCHI" items={['BRUCIORE', 'SECCHEZZA', 'SENSAZIONE DI SABBIA', 'VISTA CHE CAMBIA']}
          at={rel(A.eyeIn, [A.bruciano, A.bruciano + 0.5, A.sabbia, A.vista])} size={50} />}
      </Card>
      <Card T={T} at={A.intimo - 0.1} until={A.dayIn - 0.1} h={340}>
        {(t) => <Rows t={t} title="INTIMITÀ" items={['SECCHEZZA, BRUCIORE, PRURITO', 'NERVI, CIRCOLAZIONE, INFEZIONI', 'DETERGENTI INTIMI SPECIFICI']}
          at={rel(A.intimo - 0.1, [A.intimo, A.infezioni - 0.6, A.detergenti])} accent={2} size={40} />}
      </Card>
      <Card T={T} at={A.doccia - 0.1} until={A.bevi - 0.1} h={340}>
        {(t) => <Rows t={t} title="OGNI GIORNO" items={['DOCCIA TIEPIDA', 'DETERGENTE DELICATO', 'PIEGHE BEN ASCIUGATE']}
          at={rel(A.doccia - 0.1, [A.doccia, A.delicato, A.pieghe])} size={44} />}
      </Card>
      <Card T={T} at={A.bevi - 0.1} until={A.helpIn - 0.1} h={260}>
        {(t) => <Rows t={t} title="E POI" items={["1,5–2 L D'ACQUA A PICCOLI SORSI", 'GLICEMIA STABILE']}
          at={rel(A.bevi - 0.1, [A.bevi, A.stabile])} accent={1} size={40} />}
      </Card>
      <Card T={T} at={A.helpIn} until={A.helpOut} h={290}>
        {(t) => <Pills t={t} title="TI AIUTIAMO A SCEGLIERE" items={['DETERGENTI', 'EMOLLIENTI', 'OCCHI E INTIMITÀ', 'PROMEMORIA CONTROLLI']}
          at={rel(A.helpIn, [A.det2, A.emollienti, A.intimita, A.ricordarti])} size={50} />}
      </Card>
      <Card T={T} at={A.warnIn} until={A.warnOut} h={290}>
        {(t) => <Pills t={t} title="SE NOTI" items={['UNA FERITA', 'UN ARROSSAMENTO', 'UN GONFIORE', 'UNA CREPA CHE NON GUARISCE']}
          at={rel(A.warnIn, [A.w1, A.w2, A.w3, A.w4])} size={48} />}
      </Card>

      {/* titoli e chip: sotto il viso, mai insieme alle schede */}
      <Title T={T} at={0.1} until={A.pelle - 0.3} lines={[t112('DIABETE?', 120), T112('PELLE, OCCHI, INTIMITÀ', 84)]} />
      <Chip T={T} at={A.puglia - 0.05} until={A.whyIn - 0.3} text="IN PUGLIA SONO TANTI" y={1250} />
      <Chip T={T} at={A.secca} until={A.crepa - 0.3} text="SECCA · PRURIGINOSA · SCREPOLATA" y={1250} />
      <Chip T={T} at={A.crepa} until={A.footIn - 0.3} text="UNA CREPA PUÒ DIVENTARE FERITA" y={1250} wobble />
      <Title T={T} at={A.cura - 0.05} until={A.asciuga - 0.35} lines={[t112('CURA'), T112('DETTAGLIATA')]} />
      <Chip T={T} at={A.oculista} until={A.controlli - 0.3} text="OCULISTA O MEDICO" y={1250} />
      <Chip T={T} at={A.controlli} until={A.intimo - 0.4} text="CONTROLLI REGOLARI" y={1250} />
      <Title T={T} at={A.dayIn} until={A.doccia - 0.35} lines={[t112('COSA FARE'), T112('OGNI GIORNO')]} />
      <Title T={T} at={A.parlane - 0.05} until={END_AT - 0.1} lines={[t112('PARLANE'), T112('CON NOI')]} />

      <Captions T={T} hide={T >= END_AT} />

      <div style={{position: 'absolute', left: 40, top: 70, width: 270, height: 120, borderRadius: 26, background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 10px 30px rgba(1,40,40,0.18)', opacity: logoO, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile(LOGO.file)} style={{width: 230, height: (230 * LOGO.h) / LOGO.w}} />
      </div>

      <EndCard T={T} />
    </AbsoluteFill>
  );
};
