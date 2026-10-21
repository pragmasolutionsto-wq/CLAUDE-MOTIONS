import React from 'react';
import {MAG, NAVY, SANS, SERIF, TEAL, TEAL_D, WHITE, clamp, eBack, eO3, eO5, lerp, prog} from './util';

/** posizionamento assoluto in px del canvas 1080x1920 */
export const Abs: React.FC<{x?: number; y?: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x = 0, y = 0, w, h, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>{children}</div>
);

// ───────── icone (stile copertina: glifo bianco su cerchio magenta)
const ICONS: Record<string, React.ReactNode> = {
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" strokeWidth={2.6} />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.9-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.1-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  cap: (
    <>
      <path d="M2 9.5 12 5l10 4.5-10 4.5z" />
      <path d="M6 11.5v4.3c3.2 2.6 8.8 2.6 12 0v-4.3M22 9.5v5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="7.5" r="3.2" />
      <path d="M3 20c0-3.6 2.7-6.2 6-6.2s6 2.6 6 6.2" />
      <circle cx="17.2" cy="9" r="2.4" />
      <path d="M16.4 14.1c2.8.3 4.6 2.5 4.6 5.4" />
    </>
  ),
  lighthouse: (
    <>
      <path d="M10 8h4l1.6 13H8.4z" />
      <path d="M9 8h6M12 4v4M10.2 4h3.6" />
      <path d="M9.4 13.5h5.2" />
    </>
  ),
  star: <path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />,
  hand: (
    <path d="M8 12.5V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V5.5a1.5 1.5 0 0 1 3 0V12M17 11.5V9a1.5 1.5 0 0 1 3 0v5.5c0 4-3 7-7 7-3 0-4.6-1.4-6-4l-2.2-4a1.5 1.5 0 0 1 2.6-1.5L8 15" />
  ),
};
export const Icon: React.FC<{name: keyof typeof ICONS; size: number; color?: string; sw?: number}> = ({name, size, color = WHITE, sw = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {ICONS[name]}
  </svg>
);

/** etichetta piccola spaziata, con trattini ai lati che si allungano */
export const Kicker: React.FC<{text: string; y: number; k: number; color?: string; size?: number}> = ({text, y, k, color = TEAL_D, size = 30}) => {
  const line = lerp(0, 56, eO5(clamp(k * 1.4 - 0.2)));
  return (
    <Abs x={0} y={y} w={1080} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: clamp(k * 2.5)}}>
      <div style={{width: line, height: 3, background: color, borderRadius: 2}} />
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: '0.3em', marginRight: '-0.3em', color, transform: `translateY(${(1 - eO3(k)) * 14}px)`, whiteSpace: 'nowrap'}}>{text}</div>
      <div style={{width: line, height: 3, background: color, borderRadius: 2}} />
    </Abs>
  );
};

/** pillola come nella copertina: bordo turchese, icona su cerchio magenta */
export const Pill: React.FC<{icon: keyof typeof ICONS; text: string; k: number; out?: number; filled?: boolean}> = ({icon, text, k, out = 0, filled}) => {
  const s = lerp(0.55, 1, eBack(clamp(k), 2.1));
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 18,
        height: 90,
        padding: '0 36px 0 12px',
        borderRadius: 60,
        background: filled ? MAG : 'rgba(255,255,255,0.96)',
        border: `3px solid ${filled ? MAG : TEAL}`,
        boxShadow: '0 14px 34px rgba(15,43,72,0.16)',
        opacity: clamp(k * 3) * (1 - out),
        transform: `translateX(${(1 - eO5(clamp(k))) * -50 + out * 40}px) scale(${s * (1 - out * 0.1)})`,
      }}
    >
      <div style={{width: 66, height: 66, borderRadius: 40, background: filled ? WHITE : MAG, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={icon} size={40} color={filled ? MAG : WHITE} sw={2.1} />
      </div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 35, letterSpacing: '0.05em', color: filled ? WHITE : NAVY, whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
};

/** riga di testo con parole che salgono da una maschera, ognuna al suo tempo */
export type Tok = {w: string; t: number; color?: string; italic?: boolean};
export const Line: React.FC<{
  toks: Tok[];
  t: number;
  y: number;
  size: number;
  weight?: number;
  font?: string;
  color?: string;
  italic?: boolean;
  out?: number;
  ls?: string;
  gap?: number;
}> = ({toks, t, y, size, weight = 900, font = SERIF, color = NAVY, italic, out = 0, ls, gap}) => (
  <Abs x={0} y={y} w={1080} style={{display: 'flex', justifyContent: 'center', gap: gap ?? size * 0.26, opacity: 1 - out, transform: `translateY(${-out * 26}px)`}}>
    {toks.map((k, i) => {
      const p = eO5(prog(t, k.t - 0.05, k.t + 0.38));
      return (
        <div key={i} style={{overflow: 'hidden', padding: `${size * 0.08}px 0.04em ${size * 0.2}px`, marginBottom: -size * 0.2}}>
          <div
            style={{
              fontFamily: font,
              fontWeight: weight,
              fontSize: size,
              lineHeight: 1.1,
              letterSpacing: ls,
              fontStyle: k.italic ?? italic ? 'italic' : 'normal',
              color: k.color ?? color,
              whiteSpace: 'nowrap',
              transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 4}deg)`,
              opacity: clamp(p * 1.6),
            }}
          >
            {k.w}
          </div>
        </div>
      );
    })}
  </Abs>
);

/** sottolineatura che si disegna dal centro */
export const Rule: React.FC<{y: number; w: number; k: number; color?: string; h?: number; x?: number}> = ({y, w, k, color = MAG, h = 5, x = 540}) => {
  const ww = w * eO5(clamp(k));
  return <Abs x={x - ww / 2} y={y} w={ww} h={h} style={{background: color, borderRadius: h}} />;
};

/** lente della Q del logo (anello + manico), disegnata in SVG: r = raggio esterno */
export const Lens: React.FC<{cx: number; cy: number; r: number; rot?: number; opacity?: number; color?: string}> = ({cx, cy, r, rot = 0, opacity = 1, color = MAG}) => {
  const sw = r * 0.27;
  const rr = r - sw / 2;
  return (
    <svg width={r * 4} height={r * 4} viewBox={`${-r * 2} ${-r * 2} ${r * 4} ${r * 4}`} style={{position: 'absolute', left: cx - r * 2, top: cy - r * 2, opacity, transform: `rotate(${rot}deg)`, overflow: 'visible'}}>
      <circle r={rr} fill="none" stroke={color} strokeWidth={sw} />
      <path d={`M ${rr * 0.72} ${rr * 0.72} L ${r * 1.62} ${r * 1.62}`} stroke={color} strokeWidth={sw * 1.05} strokeLinecap="butt" />
    </svg>
  );
};
