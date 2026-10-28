// Kit grafico condiviso per i video della Farmacia Africa Orientale (stile delle card PED)
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BODY, H, HEAD, LOGO, MINT, MIST, SAGE, TEAL, TEAL_DEEP, W, WHITE} from './brand';
import {clamp, eBack, eO3, eO5, lerp, prog, rnd} from './util';

/* ------------------------------------------------------------------ fondo */

// fondo chiaro "farmacia" con bolle menta che respirano e onde in basso
export const Backdrop: React.FC<{t: number}> = ({t}) => {
  const r = rnd(7);
  const blobs = Array.from({length: 6}, (_, i) => {
    const x = r() * W, y = r() * H, s = 520 + r() * 520, ph = r() * 6.28, sp = 0.15 + r() * 0.2;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x + Math.sin(t * sp + ph) * 60 - s / 2,
          top: y + Math.cos(t * sp * 0.8 + ph) * 50 - s / 2,
          width: s,
          height: s,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${i % 2 ? 'rgba(92,192,168,0.20)' : 'rgba(184,208,200,0.32)'} 0%, rgba(255,255,255,0) 68%)`,
        }}
      />
    );
  });
  return (
    <AbsoluteFill style={{background: `linear-gradient(170deg, #FBFCFB 0%, #F1F5F3 55%, ${MIST} 100%)`}}>
      {blobs}
      <Waves t={t} />
    </AbsoluteFill>
  );
};

const wavePath = (t: number, y0: number, amp: number, k: number, sp: number, ph: number) => {
  let d = `M 0 ${H} L 0 ${y0}`;
  for (let x = 0; x <= W; x += 30) d += ` L ${x} ${y0 + Math.sin(x * k + t * sp + ph) * amp + Math.sin(x * k * 2.3 - t * sp * 0.7) * amp * 0.35}`;
  return d + ` L ${W} ${H} Z`;
};

export const Waves: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      <linearGradient id="wv1" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={MINT} stopOpacity="0.55" />
        <stop offset="1" stopColor={SAGE} stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id="wv2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={TEAL} />
        <stop offset="1" stopColor={TEAL_DEEP} />
      </linearGradient>
    </defs>
    <path d={wavePath(t, 1700, 26, 0.004, 0.9, 0)} fill="url(#wv1)" />
    <path d={wavePath(t, 1790, 20, 0.005, 1.2, 2)} fill="url(#wv2)" />
  </svg>
);

/* ------------------------------------------------------------------ logo e progresso */

export const TopLogo: React.FC<{o?: number; w?: number}> = ({o = 1, w = 300}) => (
  <Img
    src={staticFile(LOGO.file)}
    style={{position: 'absolute', left: (W - w) / 2, top: 120, width: w, height: (w * LOGO.h) / LOGO.w, opacity: o}}
  />
);

// barra a 7 segmenti: i consigli già visti pieni, quello attuale si riempie
export const Steps: React.FC<{n: number; cur: number; fill: number; o: number}> = ({n, cur, fill, o}) => {
  const sw = 92, gap = 14, tot = n * sw + (n - 1) * gap;
  return (
    <div style={{position: 'absolute', left: (W - tot) / 2, top: 290, display: 'flex', gap, opacity: o}}>
      {Array.from({length: n}, (_, i) => {
        const f = i < cur ? 1 : i === cur ? fill : 0;
        return (
          <div key={i} style={{width: sw, height: 12, borderRadius: 6, background: 'rgba(1,94,86,0.13)', overflow: 'hidden'}}>
            <div style={{width: `${f * 100}%`, height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${MINT}, ${TEAL})`}} />
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ testi */

export type Line = {text: string; box?: 'teal' | 'mint' | 'none'; size?: number};

// riga di titolo in Anton dentro box arrotondato: il box si apre, il testo sale da sotto
export const TitleLine: React.FC<{line: Line; p: number}> = ({line, p}) => {
  const box = line.box ?? 'teal';
  const size = line.size ?? Math.min(150, 940 / (line.text.length * 0.5));
  const pb = eO5(prog(p, 0, 0.55));
  const pt = eO3(prog(p, 0.25, 1));
  const bg = box === 'teal' ? TEAL : box === 'mint' ? MINT : 'transparent';
  const fg = box === 'teal' ? WHITE : TEAL;
  return (
    <div style={{position: 'relative', display: 'inline-block', padding: box === 'none' ? '0 10px' : '6px 34px 0', margin: '6px 0'}}>
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: 26, background: bg,
          transform: `scaleX(${pb})`, transformOrigin: 'center',
          boxShadow: box === 'none' ? 'none' : '0 14px 30px rgba(1,63,65,0.18)',
        }}
      />
      <div style={{position: 'relative', overflow: 'hidden', fontFamily: HEAD, fontSize: size, lineHeight: 1.12, color: fg, whiteSpace: 'nowrap'}}>
        <div style={{transform: `translateY(${(1 - pt) * 105}%)`}}>{line.text}</div>
      </div>
    </div>
  );
};

export const Title: React.FC<{lines: Line[]; t: number; at: number; stagger?: number}> = ({lines, t, at, stagger = 0.14}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {lines.map((l, i) => (
      <TitleLine key={i} line={l} p={prog(t, at + i * stagger, at + i * stagger + 0.6)} />
    ))}
  </div>
);

// testo corrente in Montserrat; le parole tra **asterischi** diventano teal e più pesanti
export const Body: React.FC<{text: string; t: number; at: number; size?: number}> = ({text, t, at, size = 46}) => {
  const p = eO3(prog(t, at, at + 0.55));
  const parts = text.split('**');
  return (
    <div
      style={{
        fontFamily: BODY, fontWeight: 600, fontSize: size, lineHeight: 1.32, color: TEAL_DEEP, textAlign: 'center',
        maxWidth: 900, marginTop: 34, opacity: p, transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      {parts.map((s, i) => (i % 2 ? <span key={i} style={{color: TEAL, fontWeight: 800}}>{s}</span> : <span key={i}>{s}</span>))}
    </div>
  );
};

export const Label: React.FC<{text: string; t: number; at: number; solid?: boolean}> = ({text, t, at, solid}) => {
  const p = eBack(prog(t, at, at + 0.45));
  return (
    <div
      style={{
        fontFamily: BODY, fontWeight: 800, fontSize: 34, letterSpacing: 5, color: TEAL,
        background: solid ? WHITE : 'rgba(92,192,168,0.22)', border: `2px solid ${solid ? MINT : 'rgba(92,192,168,0.6)'}`, borderRadius: 40,
        boxShadow: solid ? '0 8px 20px rgba(1,40,40,0.2)' : 'none',
        padding: '10px 30px', marginBottom: 14, opacity: clamp(p), transform: `scale(${lerp(0.6, 1, p)})`,
      }}
    >
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ icone */

// palco dell'icona: entra con rimbalzo, galleggia, ombra a terra
export const Stage: React.FC<{t: number; at?: number; size?: number; children: React.ReactNode}> = ({t, at = 0, size = 600, children}) => {
  const p = prog(t, at, at + 0.7);
  const s = lerp(0.55, 1, eBack(p, 2.2));
  const fl = Math.sin((t - at) * 2.1) * 9;
  return (
    <div style={{position: 'absolute', left: (W - size) / 2, top: 380, width: size, height: size}}>
      <div
        style={{
          position: 'absolute', left: size * 0.22, top: size * 0.9, width: size * 0.56, height: 36, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(1,63,65,0.22) 0%, rgba(1,63,65,0) 70%)',
          opacity: clamp(p * 2), transform: `scaleX(${1 - fl / 120})`,
        }}
      />
      <div style={{position: 'absolute', inset: 0, opacity: clamp(p * 3), transform: `translateY(${fl}px) scale(${s})`}}>{children}</div>
    </div>
  );
};

// gradienti comuni alle icone (ogni svg li dichiara con il proprio prefisso)
export const Grads: React.FC<{id: string}> = ({id}) => (
  <defs>
    <linearGradient id={`${id}m`} x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stopColor="#8EE0CB" />
      <stop offset="1" stopColor={MINT} />
    </linearGradient>
    <linearGradient id={`${id}t`} x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stopColor="#1A8378" />
      <stop offset="1" stopColor={TEAL} />
    </linearGradient>
    <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFFFFF" />
      <stop offset="1" stopColor="#E3EDE9" />
    </linearGradient>
  </defs>
);

// bollino spunta / croce che fa pop
export const Badge: React.FC<{x: number; y: number; r?: number; p: number; kind: 'ok' | 'no' | 'warn'}> = ({x, y, r = 46, p, kind}) => {
  const s = eBack(clamp(p), 2.6);
  const d = prog(p, 0.35, 1);
  const fill = kind === 'ok' ? TEAL : kind === 'no' ? TEAL_DEEP : MINT;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp(p * 4)}>
      <circle r={r} fill={fill} stroke={WHITE} strokeWidth={8} />
      {kind === 'ok' && (
        <path d={`M ${-r * 0.42} 0 L ${-r * 0.1} ${r * 0.32} L ${r * 0.45} ${-r * 0.34}`} fill="none" stroke={WHITE} strokeWidth={r * 0.2}
          strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
      )}
      {kind === 'no' && (
        <g stroke={WHITE} strokeWidth={r * 0.2} strokeLinecap="round">
          <line x1={-r * 0.33} y1={-r * 0.33} x2={r * 0.33} y2={r * 0.33} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
          <line x1={r * 0.33} y1={-r * 0.33} x2={-r * 0.33} y2={r * 0.33} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(p, 0.6, 1)} />
        </g>
      )}
      {kind === 'warn' && (
        <text x={0} y={r * 0.38} textAnchor="middle" fontFamily={HEAD} fontSize={r * 1.25} fill={WHITE}>!</text>
      )}
    </g>
  );
};
