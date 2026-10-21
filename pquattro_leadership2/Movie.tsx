import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import LOGO from './public/logo/meta.json';
import {Abs, Icon, Kicker, Line, Lens, Rule, type Tok} from './kit';
import {
  CAP_Y, FACE, FPS, MAG, MAG_D, NAVY, PANEL_Y, SANS, SEGS, SERIF, T_LOGO, TEAL, TEAL_D, WHITE, WORDS, at, clamp, eBack, eIO, eO3, eO5, lerp, prog, type Word,
} from './util';

const useT = () => useCurrentFrame() / FPS;

// ───────────────────────── tempi chiave (dalle parole)
const T_COVER = at('da', 31) - 0.1; // "Da titolare di farmacia al leader che ispira"
const T_CARD = T_COVER + 0.35;
// stacchi Runway: [inizio, fine, sorgente, da secondo, velocità]
const BR1 = {a: at('ma', 7) - 0.05, b: at('la', 12) - 0.08, src: 'br/br1.mp4', from: 0, rate: 0.9, z0: 1.14, z1: 1.2, ox: 540, oy: 1250};
const BR2 = {a: at('devi', 28) - 0.05, b: T_COVER + 0.5, src: 'br/br2.mp4', from: 1.0, rate: 1, z0: 1.04, z1: 1.1, ox: 540, oy: 700};
const inBR = (t: number) => (t >= BR1.a && t < BR1.b) || (t >= BR2.a && t < BR2.b);

// ───────────────────────── girato: jump cut con punch-in alternati centrati sul viso
const ZOOM = [1.0, 1.08, 1.0, 1.1, 1.0, 1.08, 1.0];
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
  const k = Math.max(inout(t, BR1.a, BR1.b - 0.2, 0.3, 0.2), inout(t, BR2.a, BR2.b - 0.6, 0.3, 0.2));
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

const Hook: React.FC<{t: number}> = ({t}) => {
  const B = at('sai', 5) - 0.25;
  const l1: Tok[] = ['Sai', 'cosa', 'fare.'].map((w, i) => ({w, t: 0.3 + i * 0.12}));
  const l2: Tok[] = ['Perché', 'non', 'lo', 'fai?'].map((w, i) => ({w, t: 0.95 + i * 0.12, color: MAG, italic: true}));
  return (
    <Panel t={t} a={0.05} b={B} h={330}>
      <Kicker text="LEADERSHIP IN FARMACIA" y={36} k={prog(t, 0.15, 0.7)} />
      <Line toks={l1} t={t} y={84} size={78} />
      <Line toks={l2} t={t} y={182} size={84} />
    </Panel>
  );
};

const Know: React.FC<{t: number}> = ({t}) => {
  const a = at('sai', 5);
  const k = prog(t, a - 0.05, a + 0.45);
  const tick = eO3(prog(t, at('fare?', 6) - 0.1, at('fare?', 6) + 0.3));
  return (
    <Panel t={t} a={a - 0.15} b={BR1.a + 0.05} h={170}>
      <Abs x={0} y={42} w={1080} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: clamp(k * 3)}}>
        <div style={{width: 84, height: 84, borderRadius: 50, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(0.5, 1, eBack(clamp(k), 2.4))})`}}>
          <svg width={50} height={50} viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - tick)} />
          </svg>
        </div>
        <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: NAVY}}>
          Sai cosa <span style={{color: MAG, fontStyle: 'italic'}}>fare.</span>
        </div>
      </Abs>
    </Panel>
  );
};

/** testo cinematografico sopra gli stacchi */
const Overlay: React.FC<{t: number; lines: Tok[][]; y: number; size: number; out: number}> = ({t, lines, y, size, out}) => (
  <div style={{opacity: 1 - eIO(prog(t, out - 0.25, out)), filter: 'drop-shadow(0 6px 22px rgba(0,0,0,0.55))'}}>
    {lines.map((l, i) => (
      <Line key={i} toks={l} t={t} y={y + i * size * 1.12} size={size} color={WHITE} italic />
    ))}
  </div>
);

const Truth: React.FC<{t: number}> = ({t}) => {
  const a = at('la', 12);
  const b = at('se', 21) - 0.05;
  const kR = prog(t, at('risultati') - 0.05, at('risultati') + 0.45);
  const kF = prog(t, at('fare', 15) - 0.05, at('fare', 15) + 0.45);
  const kE = prog(t, at('essere', 18) - 0.05, at('essere', 18) + 0.45);
  return (
    <Panel t={t} a={a - 0.1} b={b} h={290}>
      <Kicker text="LA VERITÀ" y={36} k={prog(t, a, a + 0.5)} color={MAG} />
      <Abs x={0} y={96} w={1080} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14}}>
        <Chip text="ESSERE" k={kE} filled />
        <Arrow k={prog(t, at('essere', 18) + 0.1, at('essere', 18) + 0.5)} />
        <Chip text="FARE" k={kF} />
        <Arrow k={prog(t, at('fare', 15) + 0.1, at('fare', 15) + 0.5)} />
        <Chip text="RISULTATI" k={kR} />
      </Abs>
      <Line toks={toks('qualcosa di diverso rispetto al passato.', at('essere', 18), {italic: true}, {'diverso': {color: MAG}})} t={t} y={212} size={44} weight={700} />
    </Panel>
  );
};

const Ladder: React.FC<{t: number}> = ({t}) => {
  const a = at('se', 21);
  const rows = [
    {lab: 'OTTENERE', txt: 'ciò che non hai mai ottenuto', t: at('ottenere'), hl: 0},
    {lab: 'FARE', txt: 'ciò che non hai mai fatto', t: at('fare', 24), hl: at('fare', 26.5)},
    {lab: 'ESSERE', txt: 'chi non sei mai stato', t: at('devi', 28) - 0.2, hl: 0},
  ];
  return (
    <Panel t={t} a={a - 0.1} b={BR2.a + 0.05} h={330}>
      {rows.map((r, i) => {
        const k = prog(t, r.t - 0.05, r.t + 0.45);
        const pulse = r.hl ? 1 + 0.06 * Math.sin(clamp((t - r.hl) / 0.5) * Math.PI) : 1;
        return (
          <Abs key={i} x={110} y={40 + i * 92} w={860} h={80} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: clamp(k * 3), transform: `translateX(${(1 - eO5(clamp(k))) * -40}px) scale(${pulse})`, transformOrigin: '0 50%'}}>
            <div style={{width: 230, textAlign: 'right', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.14em', color: i === 2 ? MAG : TEAL_D}}>{r.lab}</div>
            <div style={{width: 3, height: 52, background: i === 2 ? MAG : TEAL, borderRadius: 3}} />
            <div style={{fontFamily: SERIF, fontWeight: 700, fontStyle: 'italic', fontSize: 44, color: NAVY, whiteSpace: 'nowrap'}}>
              {r.txt.split(' mai ').map((p, j) => (
                <React.Fragment key={j}>
                  {j > 0 && <span style={{color: MAG, fontWeight: 900}}> mai </span>}
                  {p}
                </React.Fragment>
              ))}
            </div>
          </Abs>
        );
      })}
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
const KEY = new Set(['difficoltà', 'giusto', 'fermo', 'muoverti', 'verità', 'risultati', 'soli', 'essere', 'diverso', 'passato', 'mai', 'stato', 'titolare', 'leader', 'ispira', 'percorso', 'link', 'scopri']);
const clean = (w: string) => w.replace(/[.,]/g, '');
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
const QUIET: [number, number][] = [
  [at('qualcosa') - 0.08, at('fermo,') + 0.45],
  [at('essere', 29) - 0.08, T_COVER + 0.12],
];
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

const Debug: React.FC<{t: number}> = ({t}) => (inBR(t) || t > T_COVER ? null : <Abs x={193} y={180} w={675} h={780} style={{border: '4px dashed lime'}} />);

// ───────────────────────── composizione
export const Movie: React.FC<{debug?: boolean}> = ({debug}) => {
  const t = useT();
  const fermo = at('fermo,');
  const essere = at('essere', 29);
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
          <Hook t={t} />
          <Know t={t} />
          {t >= BR1.a && t < BR1.b && (
            <Overlay t={t} y={1230} size={76} out={BR1.b} lines={[toks('qualcosa dentro', at('qualcosa') - 0.01), toks('ti tiene fermo.', fermo - 1.2, {}, {'fermo.': {color: '#F27BC2'}})]} />
          )}
          <Truth t={t} />
          <Ladder t={t} />
          {t >= BR2.a && t < T_COVER + 0.3 && (
            <Overlay t={t} y={1230} size={80} out={T_COVER + 0.2} lines={[toks('Essere chi', essere - 0.01), toks('non sei mai stato.', essere, {}, {'mai': {color: '#F27BC2'}, 'stato.': {color: '#F27BC2'}})]} />
          )}
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
