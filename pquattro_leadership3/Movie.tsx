import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import LOGO from './public/logo/meta.json';
import {Abs, Icon, Kicker, Line, Lens, Rule, type Tok} from './kit';
import {
  CAP_Y, FACE, FPS, MAG, MAG_D, NAVY, PANEL_Y, SANS, SEGS, SERIF, T_LOGO, TEAL, TEAL_D, WHITE, WORDS, at, clamp, eBack, eIO, eO3, eO5, lerp, prog, type Word,
} from './util';

const useT = () => useCurrentFrame() / FPS;

// ───────────────────────── tempi chiave (dalle parole)
const T_COVER = at('da', 17) - 0.1; // "Da titolare di farmacia al leader che ispira"
const T_CARD = T_COVER + 0.35;
// le quattro domande e i quattro ritornelli
const Q = [at('come'), at('come', 3.5), at('come', 8), at('cosa', 12)];
const R = [at('parla'), at('parla', 6), at('parla', 11), at('parla', 15)];
// stacchi Runway sulle domande 3 e 4 (tornano su di lei al ritornello)
const BR1 = {a: Q[2] - 0.05, b: R[2] - 0.08, src: 'br/br1.mp4', from: 0.4, rate: 1, z0: 1.04, z1: 1.1, ox: 540, oy: 800};
const BR2 = {a: Q[3] - 0.05, b: R[3] - 0.08, src: 'br/br2.mp4', from: 2.0, rate: 1, z0: 1.04, z1: 1.1, ox: 540, oy: 800};
const inBR = (t: number) => (t >= BR1.a && t < BR1.b) || (t >= BR2.a && t < BR2.b);
const TOPICS: {icon: 'store' | 'people' | 'bag' | 'chat'; label: string}[] = [
  {icon: 'store', label: 'LA TUA FARMACIA'},
  {icon: 'people', label: 'I TUOI COLLABORATORI'},
  {icon: 'bag', label: 'I TUOI CLIENTI'},
  {icon: 'chat', label: 'LA TUA REPUTAZIONE'},
];

// ───────────────────────── girato: jump cut con punch-in alternati centrati sul viso
// domande larghe con spinta lenta, ritornelli stretti sul viso
const ZOOM = [1.0, 1.14, 1.0, 1.14, 1.02, 1.15, 1.0, 1.17, 1.0, 1.07, 1.0];
const SHOTS = SEGS.map((g, i) => {
  const from = Math.round(g.out * FPS);
  const to = i < SEGS.length - 1 ? Math.round(SEGS[i + 1].out * FPS) : Math.round((T_LOGO + 0.5) * FPS);
  return {...g, from, dur: to - from, z: ZOOM[i] ?? 1};
});

const Shot: React.FC<{s: (typeof SHOTS)[number]; idx: number}> = ({s, idx}) => {
  const f = useCurrentFrame();
  const u = f / s.dur;
  let z = s.z + 0.025 * u;
  if (idx === 0) z += 0.1 * (1 - eO5(clamp(f / (0.7 * FPS))));
  if (s.z > 1.1) z += 0.05 * (1 - eO5(clamp(f / (0.35 * FPS)))); // colpo d'entrata sul ritornello
  const [fx, fy] = FACE[s.clip];
  const want = (540 - fx) * clamp((z - 1) / 0.08) * 0.7;
  const dx = Math.max(-(1080 - fx) * (z - 1), Math.min(fx * (z - 1), want));
  return (
    <AbsoluteFill style={{transform: `translateX(${dx}px) scale(${z})`, transformOrigin: `${fx}px ${fy}px`}}>
      <OffthreadVideo
        src={staticFile(`v/c${s.clip}.mp4`)}
        startFrom={Math.round(s.s * FPS)}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.06) saturate(1.05) brightness(1.02)'}}
      />
    </AbsoluteFill>
  );
};

const Footage: React.FC = () => (
  <>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.dur} layout="none">
        <Shot s={s} idx={i} />
      </Sequence>
    ))}
  </>
);

/** stacco Runway: si apre a iride dalla lente (cerchio) con un anello magenta sul bordo */
const BRoll: React.FC<{b: typeof BR1}> = ({b}) => {
  const f = useCurrentFrame();
  const lt = f / FPS;
  const len = b.b - b.a;
  const iris = eIO(clamp(lt / 0.42));
  const R = iris * 1300;
  const z = lerp(b.z0, b.z1, lt / len);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: `circle(${R}px at 540px 760px)`}}>
        <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `${b.ox}px ${b.oy}px`}}>
          <OffthreadVideo src={staticFile(b.src)} startFrom={Math.round(b.from * FPS)} playbackRate={b.rate} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.04) saturate(1.04)'}} />
        </AbsoluteFill>
      </AbsoluteFill>
      {iris < 1 && (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <circle cx={540} cy={760} r={R} fill="none" stroke={MAG} strokeWidth={26 * (1 - iris) + 6} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

/** velo scuro in basso: leggibilità dei sottotitoli (più forte sugli stacchi, dove ci sono camici bianchi) */
const Washes: React.FC<{t: number}> = ({t}) => {
  const k = Math.max(inout(t, BR1.a, BR1.b - 0.2, 0.3, 0.2), inout(t, BR2.a, BR2.b - 0.2, 0.3, 0.2));
  return <Abs x={0} y={880} w={1080} h={1040} style={{background: `linear-gradient(180deg, rgba(10,8,18,0) 0%, rgba(10,8,18,${0.38 + 0.3 * k}) 30%, rgba(10,8,18,${0.55 + 0.25 * k}) 100%)`}} />;
};
const inout = (t: number, a: number, b: number, d = 0.45, d2 = 0.35) => eO3(prog(t, a, a + d)) * (1 - eIO(prog(t, b, b + d2)));

// ───────────────────────── pannello grafico (bianco, sotto i sottotitoli)
const Panel: React.FC<{t: number; a: number; b: number; h: number; children: React.ReactNode}> = ({t, a, b, h, children}) => {
  const k = eO5(prog(t, a, a + 0.5));
  const o = eIO(prog(t, b - 0.3, b));
  if (t < a || t > b) return null;
  return (
    <Abs x={0} y={PANEL_Y} w={1080} h={h} style={{opacity: clamp(k * 2) * (1 - o), transform: `translateY(${(1 - k) * 60 + o * 30}px)`}}>
      <Abs x={64} y={0} w={952} h={h} style={{borderRadius: 36, background: 'rgba(255,255,255,0.95)', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', overflow: 'hidden'}}>
        <Abs x={0} y={0} w={952 * eO5(prog(t, a + 0.15, a + 0.8))} h={7} style={{background: `linear-gradient(90deg, ${TEAL}, ${MAG})`}} />
      </Abs>
      <Abs x={0} y={0} w={1080} h={h}>
        {children}
      </Abs>
    </Abs>
  );
};

const toks = (words: string, after: number, style: Partial<Tok> = {}, map: Record<string, Partial<Tok>> = {}): Tok[] =>
  words.split(' ').map((w) => {
    const t = at(w.replace(/[“”]/g, ''), after);
    after = t;
    return {w, t, ...style, ...(map[w] ?? {})};
  });

const Chip: React.FC<{text: string; k: number; filled?: boolean; size?: number}> = ({text, k, filled, size = 32}) => (
  <div
    style={{
      padding: '14px 30px',
      borderRadius: 60,
      border: `3px solid ${filled ? MAG : TEAL}`,
      background: filled ? MAG : WHITE,
      fontFamily: SANS,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '0.1em',
      color: filled ? WHITE : NAVY,
      opacity: clamp(k * 3),
      transform: `scale(${lerp(0.55, 1, eBack(clamp(k), 2.2))})`,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);
const Arrow: React.FC<{k: number; dir?: 1 | -1}> = ({k, dir = 1}) => (
  <svg width={70} height={30} style={{overflow: 'visible', transform: dir < 0 ? 'scaleX(-1)' : undefined}}>
    <line x1={0} y1={15} x2={56 * eO3(k)} y2={15} stroke={TEAL_D} strokeWidth={5} strokeLinecap="round" />
    {k > 0.9 && <path d="M46 4 L62 15 L46 26" fill="none" stroke={TEAL_D} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
  </svg>
);

// icone dei quattro temi
const TIcon: React.FC<{name: (typeof TOPICS)[number]['icon']; size: number; color?: string}> = ({name, size, color = WHITE}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {name === 'store' && (
      <>
        <path d="M4 10v10h16V10M3 10l2-6h14l2 6z" />
        <path d="M10.5 12.5h3M12 11v3" strokeWidth={2.4} />
        <path d="M9 20v-4h6v4" />
      </>
    )}
    {name === 'people' && (
      <>
        <circle cx="9" cy="7.5" r="3.2" />
        <path d="M3 20c0-3.6 2.7-6.2 6-6.2s6 2.6 6 6.2" />
        <circle cx="17.2" cy="9" r="2.4" />
        <path d="M16.4 14.1c2.8.3 4.6 2.5 4.6 5.4" />
      </>
    )}
    {name === 'bag' && (
      <>
        <path d="M5 8h14l-1.2 12H6.2z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
        <path d="M12 17.2s-2.6-1.6-2.6-3.3a1.4 1.4 0 0 1 2.6-.7 1.4 1.4 0 0 1 2.6.7c0 1.7-2.6 3.3-2.6 3.3z" />
      </>
    )}
    {name === 'chat' && (
      <>
        <path d="M4 5h16v11H9l-5 4z" />
        <path d="M8 9.5h8M8 12.5h5" />
      </>
    )}
  </svg>
);

/** tema dell'affermazione: icona + etichetta, nel pannello bianco */
const Topic: React.FC<{t: number; i: number}> = ({t, i}) => {
  const a = Q[i] - 0.15;
  const k = prog(t, a, a + 0.5);
  const tp = TOPICS[i];
  return (
    <Panel t={t} a={a} b={R[i] - 0.02} h={200}>
      <Abs x={0} y={0} w={1080} h={200} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34}}>
        <div style={{width: 128, height: 128, borderRadius: 80, background: MAG, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(0.4, 1, eBack(clamp(k), 2.2))}) rotate(${(1 - eO5(clamp(k))) * -40}deg)`, boxShadow: '0 14px 30px rgba(180,37,131,0.3)'}}>
          <TIcon name={tp.icon} size={74} />
        </div>
        <div style={{opacity: clamp(k * 3 - 0.4), transform: `translateX(${(1 - eO5(clamp(k))) * 40}px)`}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: '0.04em', color: NAVY, whiteSpace: 'nowrap'}}>{tp.label}</div>
        </div>
      </Abs>
    </Panel>
  );
};

/** ritornello: il pannello diventa magenta, "Parla di te." */
const Refrain: React.FC<{t: number; i: number}> = ({t, i}) => {
  const a = R[i] - 0.06;
  const b = i < 3 ? Q[i + 1] - 0.2 : R[3] + 0.55;
  if (t < a - 0.05 || t > b + 0.05) return null;
  const k = eO5(prog(t, a, a + 0.32));
  const o = eIO(prog(t, b - 0.22, b));
  const shake = Math.sin(t * 80) * 7 * (1 - clamp((t - a) / 0.25));
  return (
    <Abs x={0} y={PANEL_Y} w={1080} h={230} style={{opacity: 1 - o, transform: `translateY(${o * 30}px)`}}>
      <Abs x={64} y={0} w={952} h={230} style={{borderRadius: 36, background: `linear-gradient(120deg, ${MAG} 0%, ${MAG_D} 100%)`, boxShadow: '0 24px 60px rgba(120,10,80,0.45)', transform: `scale(${lerp(0.75, 1, k)}) translateX(${shake}px)`, opacity: clamp(k * 3), overflow: 'hidden'}}>
        <Abs x={-300 + 1500 * eIO(prog(t, a + 0.1, a + 0.7))} y={-100} w={180} h={500} style={{background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.28), rgba(255,255,255,0))', transform: 'rotate(18deg)'}} />
      </Abs>
      <Line toks={['Parla', 'di', 'te.'].map((w, j) => ({w, t: a + 0.06 + j * 0.12, color: WHITE, italic: true}))} t={t} y={34} size={100} />
      <Abs x={0} y={186} w={1080} style={{display: 'flex', justifyContent: 'center', gap: 16, opacity: clamp(k * 2)}}>
        {[0, 1, 2, 3].map((d) => (
          <div key={d} style={{width: d === i ? 40 : 14, height: 14, borderRadius: 10, background: d <= i ? WHITE : 'rgba(255,255,255,0.35)'}} />
        ))}
      </Abs>
    </Abs>
  );
};

/** dopo il quarto ritornello: i quattro temi convergono su di te */
const Converge: React.FC<{t: number}> = ({t}) => {
  const a = R[3] + 0.45;
  const X = [150, 330, 750, 930];
  const k = prog(t, a, a + 0.6);
  return (
    <Panel t={t} a={a} b={T_COVER + 0.15} h={260}>
      {X.map((x, i) => {
        const p = eBack(prog(t, a + i * 0.07, a + 0.45 + i * 0.07), 2);
        const l = eO3(prog(t, a + 0.35 + i * 0.07, a + 0.8 + i * 0.07));
        const x1 = x < 540 ? 455 : 625;
        return (
          <React.Fragment key={i}>
            <svg width={1080} height={260} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <line x1={x} y1={110} x2={lerp(x, x1, l)} y2={110} stroke={TEAL} strokeWidth={4} strokeLinecap="round" strokeDasharray="3 12" />
            </svg>
            <Abs x={x - 52} y={58} w={104} h={104} style={{borderRadius: 60, border: `3px solid ${TEAL}`, background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>
              <TIcon name={TOPICS[i].icon} size={56} color={TEAL_D} />
            </Abs>
          </React.Fragment>
        );
      })}
      <Abs x={540 - 82} y={28} w={164} h={164} style={{borderRadius: 90, background: MAG, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${eBack(prog(t, a + 0.55, a + 1.0), 2.4)})`, boxShadow: '0 16px 36px rgba(180,37,131,0.4)'}}>
        <div style={{fontFamily: SERIF, fontWeight: 900, fontStyle: 'italic', fontSize: 70, color: WHITE}}>te</div>
      </Abs>
      <Abs x={0} y={206} w={1080} style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: '0.3em', color: NAVY, opacity: clamp((k - 0.5) * 3)}}>
        TUTTO PARLA DI TE
      </Abs>
    </Panel>
  );
};

// ───────────────────────── copertina, CTA, logo
const Waves: React.FC<{t: number; k: number}> = ({t, k}) => {
  const w = (ph: number, amp: number) => Math.sin(t * 0.9 + ph) * amp;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: k}}>
      <defs>
        <linearGradient id="wt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7CC7CB" />
          <stop offset="1" stopColor={TEAL_D} />
        </linearGradient>
        <linearGradient id="wm" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={MAG_D} />
          <stop offset="1" stopColor="#D23C98" />
        </linearGradient>
      </defs>
      <path d={`M0 ${1620 + w(0, 18)} C 260 ${1560 + w(1, 30)}, 420 ${1780 + w(2, 26)}, 700 ${1830 + w(3, 20)} S 1000 ${1900}, 1080 1920 L 0 1920 Z`} fill="url(#wt)" opacity={0.95} />
      <path d={`M1080 ${1560 + w(2, 20)} C 900 ${1680 + w(3, 26)}, 760 ${1800 + w(1, 24)}, 420 ${1870 + w(0, 16)} S 120 1920, 60 1920 L 1080 1920 Z`} fill="url(#wm)" opacity={0.95} />
      <path d={`M0 ${1540 + w(4, 14)} C 300 ${1490 + w(2, 22)}, 560 ${1660 + w(1, 20)}, 1080 ${1520 + w(3, 18)}`} fill="none" stroke={TEAL} strokeWidth={3} opacity={0.35} />
    </svg>
  );
};

const Cover: React.FC<{t: number}> = ({t}) => {
  const wipe = eIO(prog(t, T_COVER - 0.15, T_COVER + 0.55));
  const card = prog(t, T_CARD, T_CARD + 0.9);
  const leave = eIO(prog(t, T_LOGO - 0.75, T_LOGO - 0.1));
  const hold = prog(t, T_CARD, T_LOGO);
  const ck = eO5(card);
  const W0 = 700, H0 = (W0 * 1402) / 1122, X0 = 540 - W0 / 2, Y0 = 300;
  const cta = at('scopri');
  const kc = prog(t, cta - 0.1, cta + 0.45);
  const tap = at('cliccando');
  const press = 1 - 0.07 * Math.sin(clamp((t - tap) / 0.25) * Math.PI);
  const ring = prog(t, tap, tap + 0.7);
  return (
    <>
      <Abs x={0} y={0} w={1080} h={1920} style={{clipPath: `polygon(0 ${lerp(100, -12, wipe)}%, 100% ${lerp(112, 0, wipe)}%, 100% 100%, 0 100%)`, background: 'linear-gradient(180deg, #FFFFFF 0%, #F6FAFB 60%, #EEF6F7 100%)'}} />
      <Abs x={0} y={0} w={1080} h={1920} style={{clipPath: `polygon(0 ${lerp(100, -12, wipe) - 1.4}%, 100% ${lerp(112, 0, wipe) - 1.4}%, 100% ${lerp(112, 0, wipe)}%, 0 ${lerp(100, -12, wipe)}%)`, background: MAG, opacity: wipe < 1 ? 1 : 0}} />
      <Waves t={t} k={eO3(prog(t, T_COVER + 0.3, T_COVER + 1.0))} />
      <div style={{opacity: 1 - leave, transform: `translateY(${-leave * 60}px) scale(${1 - leave * 0.08})`, transformOrigin: '540px 760px'}}>
        <Kicker text="IL PERCORSO DI FORMAZIONE" y={226} k={prog(t, T_CARD + 0.3, T_CARD + 0.9)} color={MAG} />
        <Abs
          x={X0}
          y={Y0}
          w={W0}
          h={H0}
          style={{
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 40px 90px rgba(15,43,72,0.28), 0 8px 22px rgba(15,43,72,0.14)',
            border: '6px solid #FFFFFF',
            opacity: clamp(card * 3),
            transform: `translateY(${(1 - ck) * 140}px) scale(${lerp(0.86, 1, ck)}) rotate(${(1 - ck) * -3}deg)`,
          }}
        >
          <Img src={staticFile('copertina.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.0 + 0.04 * hold})`, transformOrigin: '50% 30%'}} />
          <Abs x={-400 + 1600 * eIO(prog(t, T_CARD + 0.5, T_CARD + 1.5))} y={-200} w={220} h={1400} style={{background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)', transform: 'rotate(18deg)'}} />
        </Abs>
        {/* CTA: pulsante che viene "premuto" su "cliccando" */}
        <Abs x={0} y={1408} w={1080} style={{display: 'flex', justifyContent: 'center'}}>
          <div style={{position: 'relative', opacity: clamp(kc * 3), transform: `translateY(${(1 - eO5(clamp(kc))) * 40}px) scale(${lerp(0.7, 1, eBack(clamp(kc), 2)) * press})`}}>
            <div style={{position: 'absolute', inset: -14 - 40 * ring, borderRadius: 80, border: `${5 * (1 - ring)}px solid ${MAG}`, opacity: ring > 0 ? 1 - ring : 0}} />
            <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '22px 46px', borderRadius: 70, background: MAG, boxShadow: '0 18px 40px rgba(180,37,131,0.35)', fontFamily: SANS, fontWeight: 800, fontSize: 38, letterSpacing: '0.1em', color: WHITE}}>
              SCOPRI DI PIÙ
              <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
                <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
              </svg>
            </div>
          </div>
        </Abs>
      </div>
    </>
  );
};

const LOGO_W = 880;
const LS = LOGO_W / LOGO.W;
const LX = 540 - ((LOGO.P.x0 + LOGO.O.x1) / 2) * LS;
const LY = 860 - ((LOGO.P.y0 + LOGO.tag.y1) / 2) * LS;
const Layer: React.FC<{name: string; style?: React.CSSProperties}> = ({name, style}) => (
  <Img src={staticFile(`logo/${name}.png`)} style={{position: 'absolute', left: 0, top: 0, width: LOGO.W * LS, height: LOGO.H * LS, ...style}} />
);

const EndCard: React.FC<{t: number}> = ({t}) => {
  const L = T_LOGO;
  const iris = eO5(prog(t, L - 0.32, L + 0.35));
  const [qx, qy] = LOGO.Qc;
  const monoS = lerp(1.25, 1, eO5(prog(t, L - 0.32, L + 0.6)));
  const letters = ['U', 'A', 'T1', 'T2', 'R', 'O'] as const;
  const tag = eIO(prog(t, L + 0.55, L + 1.25));
  const url = prog(t, L + 1.1, L + 1.7);
  const drift = 1 + 0.025 * prog(t, L, L + 4.5);
  const flash = Math.max(0, 1 - Math.abs(t - L) / 0.22) * 0.5;
  const glint = prog(t, L + 1.0, L + 1.7);
  return (
    <>
      <Abs x={0} y={0} w={1080} h={1920} style={{transform: `scale(${drift})`, transformOrigin: '540px 900px'}}>
        <Abs x={LX} y={LY} w={LOGO.W * LS} h={LOGO.H * LS}>
          <div style={{position: 'absolute', inset: 0, clipPath: `circle(${iris * 900}px at ${qx * LS}px ${qy * LS}px)`, transform: `scale(${monoS})`, transformOrigin: `${qx * LS}px ${qy * LS}px`}}>
            <Layer name="P" />
            <Layer name="Q" />
            <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${staticFile('logo/Q.png')})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile('logo/Q.png')})`, maskSize: '100% 100%'}}>
              <div style={{position: 'absolute', left: lerp(40, 300, glint) * LS * 1.7, top: 0, width: 70, height: LOGO.H * LS, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.75), rgba(255,255,255,0))', transform: 'skewX(-20deg)', opacity: glint > 0 && glint < 1 ? 1 : 0}} />
            </div>
          </div>
          {letters.map((n, i) => {
            const p = prog(t, L + 0.02 + i * 0.06, L + 0.5 + i * 0.06);
            return <Layer key={n} name={n} style={{opacity: clamp(p * 2.5), transform: `translateY(${(1 - eO5(p)) * 46}px)`, filter: `blur(${(1 - eO3(p)) * 6}px)`}} />;
          })}
          <Layer name="tag" style={{clipPath: `inset(0 ${(1 - tag) * 100}% 0 0)`, transform: `translateX(${(1 - tag) * -20}px)`}} />
        </Abs>
        <Abs x={0} y={1080} w={1080} style={{display: 'flex', justifyContent: 'center', opacity: clamp(url * 2)}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.16em', color: NAVY, transform: `translateY(${(1 - eO5(url)) * 20}px)`, display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{width: 48 * eO5(url), height: 3, background: TEAL}} />
            PQUATTRO.IT
            <div style={{width: 48 * eO5(url), height: 3, background: TEAL}} />
          </div>
        </Abs>
      </Abs>
      <AbsoluteFill style={{background: WHITE, opacity: flash, pointerEvents: 'none'}} />
    </>
  );
};

// ───────────────────────── sottotitoli
const FUNC = new Set(['a', 'e', 'o', 'di', 'da', 'la', 'le', 'il', 'i', 'un', 'una', 'che', 'in', 'per', 'ma', 'lo', 'ti', 'al', 'nel', 'non', 'hai', 'ciò', 'chi', 'sei']);
const KEY = new Set(['collaboratori', 'clienti', 'dicono', 'titolare', 'leader', 'ispira', 'guida', 'aspetta', 'link', 'scopri']);
const clean = (w: string) => w.replace(/[.,?]/g, ''); // sono affermazioni, non domande: niente punti interrogativi
const bare = (w: string) => w.toLowerCase().replace(/[^a-zàèéìòù0-9]/g, '');
type Chunk = {words: Word[]; t0: number; t1: number};
const CHUNKS: Chunk[] = (() => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    const len = cur.map((x) => clean(x.w)).join(' ').length;
    const punct = /[.,?!]$/.test(w.w);
    const pause = next ? next.t - w.te > 0.32 : true;
    if (!next || punct || pause || len >= 15 || cur.length >= 4) {
      if (next && !punct && !pause && cur.length > 1 && FUNC.has(bare(w.w))) {
        cur.pop();
        out.push(cur);
        cur = [w];
      } else {
        out.push(cur);
        cur = [];
      }
    }
  });
  if (cur.length) out.push(cur);
  return out.map((ws, i, arr) => {
    const nxt = arr[i + 1];
    const last = ws[ws.length - 1];
    const t1 = nxt ? Math.min(nxt[0].t - 0.03, last.te + 0.55) : last.te + 0.6;
    return {words: ws, t0: ws[0].t - 0.06, t1};
  });
})();

// dove il testo grande sugli stacchi dice già le stesse parole, i sottotitoli tacciono
const QUIET: [number, number][] = R.map((r, i) => [r - 0.25, i < 3 ? Q[i + 1] - 0.1 : T_COVER + 0.12]);
const Captions: React.FC<{t: number}> = ({t}) => {
  if (t > T_LOGO - 0.25 || QUIET.some(([a, b]) => t >= a && t < b)) return null;
  const c = CHUNKS.find((x) => t >= x.t0 && t < x.t1);
  if (!c) return null;
  const dark = t > T_COVER + 0.12;
  const y = dark ? 1290 : CAP_Y;
  const fade = clamp((c.t1 - t) / 0.08);
  return (
    <Abs x={70} y={y} w={940} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: 16, rowGap: 6, opacity: fade}}>
      {c.words.map((w, i) => {
        const p = prog(t, w.t - 0.06, w.t + 0.16);
        const key = KEY.has(bare(w.w));
        const hl = key && t >= w.t - 0.02;
        const hk = eO5(prog(t, w.t - 0.02, w.t + 0.2));
        return (
          <div key={i} style={{position: 'relative', opacity: clamp(p * 3), transform: `translateY(${(1 - eO3(p)) * 22}px) scale(${lerp(0.86, 1, eBack(clamp(p), 2.4))})`}}>
            {key && <div style={{position: 'absolute', left: -10, right: -10, top: 2, bottom: 0, borderRadius: 12, background: MAG, transform: `scaleX(${hl ? hk : 0})`, transformOrigin: '0 50%'}} />}
            <div style={{position: 'relative', fontFamily: SANS, fontWeight: 800, fontSize: 62, lineHeight: '78px', color: dark && !key ? NAVY : WHITE, textShadow: dark || key ? 'none' : '0 3px 14px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.5)'}}>
              {clean(w.w)}
            </div>
          </div>
        );
      })}
    </Abs>
  );
};

const Debug: React.FC<{t: number}> = ({t}) => (inBR(t) || t > T_COVER ? null : <Abs x={279} y={400} w={552} h={600} style={{border: '4px dashed lime'}} />);

// ───────────────────────── composizione
export const Movie: React.FC<{debug?: boolean}> = ({debug}) => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: WHITE}}>
      {t < T_COVER + 0.8 && (
        <>
          <Footage />
          <Sequence from={Math.round(BR1.a * FPS)} durationInFrames={Math.round((BR1.b - BR1.a) * FPS)} layout="none">
            <BRoll b={BR1} />
          </Sequence>
          <Sequence from={Math.round(BR2.a * FPS)} durationInFrames={Math.round((BR2.b - BR2.a) * FPS)} layout="none">
            <BRoll b={BR2} />
          </Sequence>
          <Washes t={t} />
          {[0, 1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <Topic t={t} i={i} />
              <Refrain t={t} i={i} />
            </React.Fragment>
          ))}
          <Converge t={t} />
        </>
      )}
      {t >= T_COVER - 0.2 && t < T_LOGO + 0.2 && <Cover t={t} />}
      {t >= T_LOGO - 0.8 && (
        <>
          {t < T_LOGO + 0.2 && <AbsoluteFill style={{background: 'linear-gradient(180deg, #FFFFFF 0%, #F6FAFB 60%, #EEF6F7 100%)', opacity: eIO(prog(t, T_LOGO - 0.8, T_LOGO - 0.1))}} />}
          {t >= T_LOGO + 0.2 && <AbsoluteFill style={{background: 'linear-gradient(180deg, #FFFFFF 0%, #F6FAFB 60%, #EEF6F7 100%)'}} />}
          <Waves t={t} k={1} />
          <EndCard t={t} />
        </>
      )}
      <Captions t={t} />
      {debug && <Debug t={t} />}
    </AbsoluteFill>
  );
};
