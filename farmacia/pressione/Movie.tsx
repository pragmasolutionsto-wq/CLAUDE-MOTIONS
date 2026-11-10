// Reel farmacista "Pressione e primi freddi": stessa pipeline dei reel precedenti (base tagliata, sottotitoli Whisper, schede sotto il viso).
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
  (i % 3 === 0 ? [1.0, 1.03, 0] : i % 3 === 1 ? [1.08, 1.11, 30] : [1.04, 1.07, 15]) as [number, number, number]);

const Footage: React.FC<{T: number}> = ({T}) => {
  const f = Math.round(T * FPS);
  let i = SEG.findIndex((s) => f >= fr(s.start) && f < fr(s.end));
  if (i < 0) i = SEG.length - 1;
  const s = SEG[i];
  const [z0, z1, dy] = FRAMING[i];
  const z = lerp(z0, z1, eIO(prog(T, s.start, s.end)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile('pressione/base.mp4')} muted
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
      <div style={{transform: `scale(${eBack(prog(t, 0, 0.45), 2.4) * (1 - out * 0.2)}) rotate(${rot}deg)`, fontFamily: HEAD, fontSize: 56,
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
    <div style={{position: 'absolute', left: 36, width: 650, top: CARD_BOTTOM - h, height: h, borderRadius: 40, overflow: 'hidden',
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

// clip Runway della signora a tutto schermo, tagli netti a fotogramma; sottotitoli e schede restano sopra
const Clip: React.FC<{src: string; a: number; b: number; len?: number; skip?: number}> = ({src, a, b, len = 5.0, skip = 0}) => (
  <Sequence from={fr(a)} durationInFrames={fr(b) - fr(a)}>
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(src)} muted startFrom={Math.round(skip * FPS)} playbackRate={Math.min(1, (len - skip) / (b - a))} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,40,40,0) 50%, rgba(1,40,40,0.5) 100%)'}} />
    </AbsoluteFill>
  </Sequence>
);

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

      {/* clip Runway della signora */}
      <Clip src="pressione/c_freddo.mp4" a={A.tempIn} b={A.mai - 0.4} />
      <Clip src="pressione/c_misura.mp4" a={A.due - 0.3} b={A.settimana + 0.6} />
      <Clip src="pressione/c_farmacia.mp4" a={A.vieni1} b={A.seNe} />

      {/* schede a sinistra: lei tiene in mano misuratore e diario a destra */}
      <Card T={T} at={A.mai - 0.4} until={A.measIn} h={290}>
        {(t) => <Pills t={t} title="VALE PER TUTTI" items={['MAI CONTROLLATA', 'GIÀ IN TERAPIA', 'QUALCHE CONTROLLO IN PIÙ']}
          at={rel(A.mai - 0.4, [A.mai, A.terapia, A.controllo])} size={44} />}
      </Card>
      <Card T={T} at={A.toolIn} until={A.oldIn} h={340}>
        {(t) => <Rows t={t} title="LO STRUMENTO GIUSTO" items={['AUTOMATICO E CERTIFICATO', 'CON MEMORIA DEI VALORI', 'BRACCIALE DELLA TUA MISURA']}
          at={rel(A.toolIn, [A.certificato, A.memoria, A.bracciale1])} size={36} />}
      </Card>
      <Card T={T} at={A.oldIn} until={A.meriti - 0.1} h={340}>
        {(t) => <Rows t={t} title="NUMERI POCO AFFIDABILI SE" items={['APPARECCHIO DATATO', 'DIFFICILE DA USARE', 'BRACCIALE NON ADATTO']}
          at={rel(A.oldIn, [A.datato, A.difficile, A.bracciale2])} size={40} />}
      </Card>

      {/* titoli e chip */}
      <Title T={T} at={0.1} until={A.tempIn - 0.3} lines={[t112('PRESSIONE', 124), T112('E PRIMI FREDDI', 108)]} />
      <Chip T={T} at={A.salire - 0.3} until={A.mai - 0.6} text="COL FREDDO LA PRESSIONE SALE" y={260} />
      <Chip T={T} at={A.measIn + 0.4} until={A.due - 0.5} text="MISURALA PIÙ SPESSO" x={36} y={1250} />
      <Chip T={T} at={A.due} until={A.diario - 0.2} text="2 VOLTE AL MATTINO · 2 LA SERA" y={260} />
      <Chip T={T} at={A.diario} until={A.settimana - 0.2} text="ANNOTALI SU UN DIARIO" y={260} />
      <Chip T={T} at={A.settimana} until={A.settimana + 0.5} text="PER UNA SETTIMANA" y={260} />
      <Chip T={T} at={A.guarderemo} until={A.toolIn - 0.3} text="LI GUARDIAMO INSIEME" x={36} y={1250} />
      <Chip T={T} at={A.meriti} until={A.vieni1 - 0.3} text="MERITI NUMERI AFFIDABILI" x={36} y={1250} />
      <Chip T={T} at={A.vieni1 + 0.3} until={A.capire - 0.2} text="TI AIUTIAMO A SCEGLIERE" y={260} />
      <Chip T={T} at={A.capire} until={A.seNe - 0.3} text="E A MISURARTI BENE" y={260} />
      <Chip T={T} at={A.seNe + 0.1} until={A.ricorda - 0.3} text="HAI GIÀ UN MISURATORE? PORTALO" x={36} y={1250} />
      <Title T={T} at={A.modificare - 0.1} until={A.vieni2 - 0.3} lines={[t112('NON MODIFICARE MAI', 96), T112('LA TERAPIA DA SOLO', 96)]} />
      <Title T={T} at={A.vieni2 - 0.05} until={END_AT - 0.1} lines={[t112('PARLIAMONE'), T112('INSIEME')]} />

      <Captions T={T} hide={T >= END_AT} />

      <div style={{position: 'absolute', left: 40, top: 70, width: 270, height: 120, borderRadius: 26, background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 10px 30px rgba(1,40,40,0.18)', opacity: logoO, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile(LOGO.file)} style={{width: 230, height: (230 * LOGO.h) / LOGO.w}} />
      </div>

      <EndCard T={T} />
    </AbsoluteFill>
  );
};
