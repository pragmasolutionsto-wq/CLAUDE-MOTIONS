import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import LOGO from './public/logo/meta.json';
import {Abs, Icon, Kicker, Line, Lens, Pill, Rule, type Tok} from './kit';
import {
  CAP_Y, FACE, FPS, MAG, MAG_D, NAVY, SANS, SEGS, SERIF, T_LOGO, TEAL, TEAL_D, WHITE, WORDS, at, clamp, eBack, eIO, eO3, eO5, inout, lerp, prog, type Word,
} from './util';

const useT = () => useCurrentFrame() / FPS;

// ───────────────────────── tempi chiave (dalle parole)
const T_COVER = at('da', 70) - 0.1; // "da titolare di farmacia a leader che ispira"
const T_CARD = T_COVER + 0.35;

// ───────────────────────── girato: jump cut con punch-in alternati centrati sul viso
const ZOOM = [1.0, 1.0, 1.1, 1.0, 1.07, 1.15, 1.0, 1.08, 1.0, 1.09, 1.12, 1.0, 1.08, 1.0];
const SHOTS = SEGS.map((g, i) => {
  const from = Math.round(g.out * FPS);
  const to = i < SEGS.length - 1 ? Math.round(SEGS[i + 1].out * FPS) : Math.round((T_LOGO + 0.5) * FPS);
  return {...g, from, dur: to - from, z: ZOOM[i] ?? 1};
});

const Shot: React.FC<{s: (typeof SHOTS)[number]; idx: number}> = ({s, idx}) => {
  const f = useCurrentFrame();
  const u = f / s.dur;
  let z = s.z + 0.022 * u; // spinta lenta dentro l'inquadratura
  if (idx === 0) z += 0.1 * (1 - eO5(clamp(f / (0.7 * FPS)))); // apertura: assestamento
  if (idx === 4) z += 0.06 * eIO(prog(f / FPS, 1.6, s.dur / FPS)); // tensione nella pausa dopo la domanda
  const [fx, fy] = FACE[s.clip];
  // ricentra il viso in orizzontale senza mai scoprire i bordi
  const want = (540 - fx) * clamp((z - 1) / 0.08) * 0.7;
  const dx = Math.max(-(1080 - fx) * (z - 1), Math.min(fx * (z - 1), want));
  return (
    <AbsoluteFill style={{transform: `translateX(${dx}px) scale(${z})`, transformOrigin: `${fx}px ${fy}px`}}>
      <OffthreadVideo
        src={staticFile(`v/c${s.clip}.mp4`)}
        startFrom={Math.round(s.s * FPS)}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', filter: `contrast(1.05) saturate(1.06) brightness(${s.clip === 7 ? 1.035 : 1.01})`}}
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

/** velo bianco in alto (pulisce il fondo dietro i titoli) e scuro in basso (leggibilità sottotitoli sulla camicetta) */
const Washes: React.FC = () => (
  <>
    <Abs x={0} y={0} w={1080} h={640} style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0) 100%)'}} />
    <Abs x={0} y={1250} w={1080} h={670} style={{background: 'linear-gradient(0deg, rgba(14,8,16,0.62) 0%, rgba(14,8,16,0.42) 45%, rgba(14,8,16,0) 100%)'}} />
  </>
);

// ───────────────────────── grafiche (fascia alta, y 230-585)
const toks = (words: string, after: number, style: Partial<Tok> = {}, map: Record<string, Partial<Tok>> = {}): Tok[] =>
  words.split(' ').map((w) => {
    const key = w.replace(/[“”]/g, '');
    const t = at(key, after);
    after = t;
    return {w, t, ...style, ...(map[w] ?? {})};
  });

const Hook: React.FC<{t: number}> = ({t}) => {
  const out = eIO(prog(t, 4.75, 5.15));
  const l1: Tok[] = ['Perché', 'nessuno', 'vuole', 'più'].map((w, i) => ({w, t: 0.25 + i * 0.11}));
  const l2: Tok[] = ['lavorare', 'in', 'farmacia?'].map((w, i) => ({w, t: 0.72 + i * 0.12, color: MAG, italic: true}));
  return (
    <>
      <Kicker text="LEADERSHIP IN FARMACIA" y={252} k={prog(t, 0.05, 0.6) * (1 - out)} />
      <Line toks={l1} t={t} y={300} size={72} out={out} />
      <Line toks={l2} t={t} y={390} size={84} out={out} />
      <Rule y={515} w={360} k={prog(t, 1.25, 1.9) * (1 - out)} color={TEAL} />
    </>
  );
};

const Lesson: React.FC<{t: number}> = ({t}) => {
  const A = [at('10'), at('all’università'), at('laureandi')];
  const items: {icon: 'calendar' | 'pin' | 'cap'; text: string}[] = [
    {icon: 'calendar', text: '10 SETTEMBRE'},
    {icon: 'pin', text: 'UNIVERSITÀ DI BARI'},
    {icon: 'cap', text: 'LAUREANDI CTF E FARMACIA'},
  ];
  const T_OUT = at('chi', 16) - 0.45;
  return (
    <Abs x={0} y={250} w={1080} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
      {items.map((it, i) => (
        <Pill key={i} icon={it.icon} text={it.text} k={prog(t, A[i] - 0.1, A[i] + 0.45)} out={eIO(prog(t, T_OUT + i * 0.07, T_OUT + 0.35 + i * 0.07))} />
      ))}
    </Abs>
  );
};

const Question: React.FC<{t: number}> = ({t}) => {
  const a = at('chi', 16);
  const out = eIO(prog(t, at('nessuno') - 0.22, at('nessuno') + 0.05));
  return (
    <>
      <Kicker text="LA DOMANDA IN AULA" y={252} k={prog(t, a - 0.15, a + 0.4) * (1 - out)} />
      <Line toks={toks('“Chi di voi vuole', a - 0.01)} t={t} y={304} size={74} weight={700} italic out={out} />
      <Line toks={toks('lavorare in farmacia?”', a, {}, {'farmacia?”': {color: MAG}})} t={t} y={398} size={74} weight={700} italic out={out} />
    </>
  );
};

const Nobody: React.FC<{t: number}> = ({t}) => {
  const a = at('nessuno');
  const k = prog(t, a - 0.04, a + 0.5);
  const out = eIO(prog(t, at('non', 22) - 0.3, at('non', 22) + 0.05));
  const ring = prog(t, a, a + 0.8);
  const shake = Math.sin(t * 70) * 8 * (1 - clamp((t - a) / 0.35)) * (t > a ? 1 : 0);
  const hands = Array.from({length: 7});
  return (
    <Abs x={0} y={0} w={1080} h={600} style={{opacity: 1 - out, transform: `translateY(${-out * 30}px)`}}>
      <Abs x={540 - 230} y={250} w={460} h={250} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, transform: `translateX(${shake}px)`}}>
        <div style={{position: 'relative', width: 170, height: 250}}>
          <div style={{position: 'absolute', left: 85 - 120 * ring, top: 128 - 120 * ring, width: 240 * ring, height: 240 * ring, borderRadius: 999, border: `${6 * (1 - ring)}px solid ${TEAL}`, opacity: 1 - ring}} />
          <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 250, lineHeight: '250px', color: MAG, textAlign: 'center', transform: `scale(${lerp(2.2, 1, eO5(k))})`, opacity: clamp(k * 4)}}>0</div>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 54, lineHeight: 1.05, color: NAVY, letterSpacing: '0.04em', opacity: clamp((t - a - 0.45) * 4), transform: `translateX(${(1 - eO5(prog(t, a + 0.45, a + 0.9))) * -30}px)`}}>
          MANI
          <br />
          ALZATE
        </div>
      </Abs>
      <Abs x={0} y={512} w={1080} style={{display: 'flex', justifyContent: 'center', gap: 14}}>
        {hands.map((_, i) => {
          const p = prog(t, at('alzato') + i * 0.05, at('alzato') + 0.3 + i * 0.05);
          return (
            <div key={i} style={{opacity: 0.55 * eO3(p), transform: `translateY(${(1 - eO3(p)) * 16}px)`}}>
              <Icon name="hand" size={44} color={TEAL_D} sw={1.7} />
            </div>
          );
        })}
      </Abs>
    </Abs>
  );
};

const Decline: React.FC<{t: number}> = ({t}) => {
  const a = at('anni', 22);
  const out = eIO(prog(t, at('dipende', 29) - 0.35, at('dipende', 29) - 0.02));
  const H0 = [205, 176, 146, 114, 82, 50];
  const BW = 84, GAP = 42, X0 = 540 - (H0.length * BW + (H0.length - 1) * GAP) / 2, BASE = 548;
  const trend = prog(t, at('sempre', 28) - 0.1, at('meno', 28) + 0.35);
  const p0: [number, number] = [X0 + BW / 2, BASE - H0[0] - 62];
  const p1: [number, number] = [X0 + (H0.length - 1) * (BW + GAP) + BW / 2, BASE - H0[H0.length - 1] - 62];
  return (
    <Abs x={0} y={0} w={1080} h={600} style={{opacity: 1 - out}}>
      <Kicker text="MANI ALZATE, ANNO DOPO ANNO" y={250} k={prog(t, at('volta,', 22) - 0.2, at('volta,', 22) + 0.4)} />
      {H0.map((h, i) => {
        const g = eBack(prog(t, a + i * 0.16, a + 0.55 + i * 0.16), 1.2);
        const c = i / (H0.length - 1);
        const hh = h * g;
        return (
          <React.Fragment key={i}>
            <Abs x={X0 + i * (BW + GAP)} y={BASE - hh} w={BW} h={hh} style={{borderRadius: '16px 16px 4px 4px', background: `linear-gradient(180deg, ${c > 0.6 ? MAG : TEAL} 0%, ${c > 0.6 ? MAG_D : TEAL_D} 100%)`, opacity: 0.92}} />
            <Abs x={X0 + i * (BW + GAP) + BW / 2 - 22} y={BASE - hh - 52} style={{opacity: clamp(g * 2)}}>
              <Icon name="hand" size={44} color={c > 0.6 ? MAG : TEAL_D} sw={1.8} />
            </Abs>
          </React.Fragment>
        );
      })}
      <Abs x={X0 - 20} y={BASE} w={H0.length * (BW + GAP) - GAP + 40} h={3} style={{background: 'rgba(15,43,72,0.35)', opacity: eO3(prog(t, a - 0.2, a + 0.3))}} />
      <svg width={1080} height={600} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          <marker id="ah" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 z" fill={MAG} />
          </marker>
        </defs>
        <line x1={p0[0]} y1={p0[1]} x2={lerp(p0[0], p1[0], eO3(trend))} y2={lerp(p0[1], p1[1], eO3(trend))} stroke={MAG} strokeWidth={7} strokeLinecap="round" strokeDasharray="2 16" markerEnd={trend > 0.05 ? 'url(#ah)' : undefined} opacity={clamp(trend * 5)} />
      </svg>
    </Abs>
  );
};

const Blame: React.FC<{t: number}> = ({t}) => {
  const a = at('dipende', 29);
  const strike = prog(t, at('o', 31), at('o', 31) + 0.45);
  const out = eIO(prog(t, at('i', 36) - 0.35, at('i', 36) - 0.02));
  return (
    <Abs x={0} y={0} w={1080} h={600} style={{opacity: 1 - out, transform: `translateY(${-out * 24}px)`}}>
      <div style={{opacity: lerp(1, 0.4, eO3(strike))}}>
        <Line toks={toks('Dipende solo dai ragazzi?', a - 0.02)} t={t} y={258} size={58} weight={700} />
      </div>
      <Abs x={540 - 370} y={300} w={740 * eO5(strike)} h={6} style={{background: TEAL, borderRadius: 6}} />
      <Line
        toks={[{w: 'O', t: at('o', 31), color: MAG, italic: true}, ...toks('da chi guida', at('anche', 33), {color: MAG, italic: true})]}
        t={t}
        y={352}
        size={78}
      />
      <Line toks={toks('le farmacie oggi?', at('guida', 34))} t={t} y={444} size={78} />
    </Abs>
  );
};

const Needs: React.FC<{t: number}> = ({t}) => {
  const a = at('giovani', 37);
  const out = eIO(prog(t, at('ma', 47) - 0.3, at('ma', 47) + 0.02));
  const cols: {icon: 'people' | 'lighthouse' | 'star'; label: string; t: number}[] = [
    {icon: 'people', label: 'MENTORE', t: at('mentore,')},
    {icon: 'lighthouse', label: 'FARO', t: at('faro')},
    {icon: 'star', label: 'MODELLO', t: at('modello')},
  ];
  const X = [250, 540, 830];
  const CY = 398;
  return (
    <Abs x={0} y={0} w={1080} h={600} style={{opacity: 1 - out, transform: `scale(${1 - out * 0.04})`, transformOrigin: '540px 400px'}}>
      <Kicker text="I GIOVANI HANNO BISOGNO DI UN" y={250} k={prog(t, a - 0.1, a + 0.5)} />
      {[0, 1].map((i) => {
        const p = eO3(prog(t, cols[i + 1].t - 0.35, cols[i + 1].t + 0.05));
        return <Abs key={i} x={X[i] + 80} y={CY - 2} w={(X[i + 1] - X[i] - 160) * p} h={4} style={{background: TEAL, borderRadius: 4}} />;
      })}
      {cols.map((c, i) => {
        const k = prog(t, c.t - 0.08, c.t + 0.5);
        const s = eBack(clamp(k), 2.2);
        const beam = c.icon === 'lighthouse' ? clamp((t - c.t) / 0.4) : 0;
        return (
          <React.Fragment key={i}>
            {beam > 0 && (
              <Abs x={X[i] - 260} y={CY - 120} w={520} h={120} style={{opacity: 0.32 * beam, transformOrigin: '260px 120px', transform: `rotate(${Math.sin((t - c.t) * 1.6) * 16}deg)`}}>
                <svg width={520} height={120}>
                  <defs>
                    <radialGradient id="bm" cx="50%" cy="100%" r="80%">
                      <stop offset="0" stopColor={TEAL} stopOpacity="0.9" />
                      <stop offset="1" stopColor={TEAL} stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <path d="M260 120 L0 0 L520 0 Z" fill="url(#bm)" />
                </svg>
              </Abs>
            )}
            <Abs x={X[i] - 74} y={CY - 74} w={148} h={148} style={{borderRadius: 99, background: MAG, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, opacity: clamp(k * 4), boxShadow: '0 14px 30px rgba(180,37,131,0.28)'}}>
              <Icon name={c.icon} size={80} sw={1.8} />
            </Abs>
            <Abs x={X[i] - 150} y={CY + 90} w={300} style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: '0.14em', color: NAVY, opacity: clamp((k - 0.25) * 3), transform: `translateY(${(1 - eO3(clamp(k * 1.3 - 0.2))) * 16}px)`}}>
              {c.label}
            </Abs>
          </React.Fragment>
        );
      })}
    </Abs>
  );
};

const Search: React.FC<{t: number}> = ({t}) => {
  const a = at('ma', 47);
  const out = eIO(prog(t, at('perché', 51) - 0.3, at('perché', 51) + 0.02));
  const text = (
    <>
      <Line toks={toks('Dove sono oggi', at('dove', 47) - 0.01, {italic: true})} t={t} y={282} size={62} weight={700} />
      <Line toks={toks('i modelli a cui ispirarsi?', at('oggi', 47) + 0.05, {}, {'modelli': {color: MAG, italic: true}, 'ispirarsi?': {color: MAG, italic: true}})} t={t} y={370} size={60} />
    </>
  );
  // la lente percorre la fascia cercando
  const u = eIO(prog(t, a + 0.1, at('ispirarsi?', 50) + 0.5));
  const cx = lerp(150, 930, u) + Math.sin(u * Math.PI * 3) * 20;
  const cy = 395 + Math.sin(u * Math.PI * 2) * -55;
  const R = 92;
  const lk = eO3(prog(t, a, a + 0.4));
  return (
    <Abs x={0} y={0} w={1080} h={600} style={{opacity: 1 - out}}>
      {text}
      <Abs x={0} y={0} w={1080} h={600} style={{clipPath: `circle(${(R - 14) * lk}px at ${cx}px ${cy}px)`}}>
        <Abs x={0} y={0} w={1080} h={600} style={{background: 'rgba(255,255,255,0.92)'}} />
        <Abs x={0} y={0} w={1080} h={600} style={{transform: 'scale(1.32)', transformOrigin: `${cx}px ${cy}px`}}>
          {text}
        </Abs>
      </Abs>
      <Lens cx={cx} cy={cy} r={R * lk} rot={-8 + u * 16} />
    </Abs>
  );
};

const Stay: React.FC<{t: number}> = ({t}) => {
  const a = at('perché', 51);
  const out = eIO(prog(t, at('il', 59) - 0.3, at('il', 59) + 0.02));
  const ka = prog(t, at('sceglie') - 0.08, at('sceglie') + 0.45);
  const kb = prog(t, at('rimanere') - 0.08, at('rimanere') + 0.45);
  const arrow = eO3(prog(t, at('decide') - 0.1, at('rimanere') - 0.05));
  return (
    <Abs x={0} y={0} w={1080} h={600} style={{opacity: 1 - out}}>
      <Kicker text="UN GIOVANE FARMACISTA" y={250} k={prog(t, a, a + 0.5)} />
      <Abs x={0} y={302} w={1080} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26}}>
        <div style={{opacity: clamp(ka * 3), transform: `scale(${lerp(0.6, 1, eBack(clamp(ka), 2))})`, padding: '12px 34px', borderRadius: 60, border: `3px solid ${TEAL}`, background: 'rgba(255,255,255,0.96)', fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: '0.1em', color: NAVY}}>SCEGLIE</div>
        <svg width={110} height={30} style={{overflow: 'visible'}}>
          <line x1={0} y1={15} x2={92 * arrow} y2={15} stroke={TEAL_D} strokeWidth={5} strokeLinecap="round" />
          {arrow > 0.9 && <path d="M80 3 L98 15 L80 27" fill="none" stroke={TEAL_D} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        <div style={{opacity: clamp(kb * 3), transform: `scale(${lerp(0.6, 1, eBack(clamp(kb), 2))})`, padding: '12px 34px', borderRadius: 60, background: MAG, border: `3px solid ${MAG}`, fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: '0.1em', color: WHITE}}>RIMANE</div>
      </Abs>
      <Line toks={toks('dipende da chi lo guida.', at('rimanere') + 0.1, {italic: true}, {'chi': {color: MAG}, 'lo': {color: MAG}, 'guida.': {color: MAG}})} t={t} y={410} size={68} />
      <Rule y={512} w={420} k={prog(t, at('guida.', 58) + 0.1, at('guida.', 58) + 0.6)} color={MAG} />
    </Abs>
  );
};

const Yourself: React.FC<{t: number}> = ({t}) => {
  const a = at('team');
  const out = eIO(prog(t, at('per', 68) - 0.3, at('per', 68) + 0.05));
  const te = at('te', 66);
  const pulse = 1 + 0.05 * Math.sin(clamp((t - te - 0.5) / 0.5) * Math.PI);
  return (
    <Abs x={0} y={0} w={1080} h={600} style={{opacity: 1 - out, transform: `translateY(${-out * 24}px)`}}>
      <Kicker text="IL TEAM È SOLO UNA PARTE" y={250} k={prog(t, a - 0.1, a + 0.5)} />
      <Line toks={toks('guidare la tua farmacia,', at('guidare') - 0.01, {}, {'farmacia,': {color: TEAL_D}})} t={t} y={300} size={54} weight={700} />
      <Line toks={toks('ma soprattutto', at('ma', 66) - 0.01, {italic: true})} t={t} y={374} size={44} weight={700} />
      <div style={{transform: `scale(${pulse})`, transformOrigin: '540px 490px'}}>
        <Line toks={toks('te stesso.', te - 0.01, {color: MAG, italic: true})} t={t} y={420} size={104} />
      </div>
    </Abs>
  );
};

// ───────────────────────── copertina evento + logo
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
      <path d={`M0 ${1560 + w(0, 18)} C 260 ${1500 + w(1, 30)}, 420 ${1760 + w(2, 26)}, 700 ${1820 + w(3, 20)} S 1000 ${1900}, 1080 1920 L 0 1920 Z`} fill="url(#wt)" opacity={0.95} />
      <path d={`M1080 ${1500 + w(2, 20)} C 900 ${1640 + w(3, 26)}, 760 ${1790 + w(1, 24)}, 420 ${1860 + w(0, 16)} S 120 1920, 60 1920 L 1080 1920 Z`} fill="url(#wm)" opacity={0.95} />
      <path d={`M0 ${1470 + w(4, 14)} C 300 ${1420 + w(2, 22)}, 560 ${1600 + w(1, 20)}, 1080 ${1450 + w(3, 18)}`} fill="none" stroke={TEAL} strokeWidth={3} opacity={0.35} />
    </svg>
  );
};

const Cover: React.FC<{t: number}> = ({t}) => {
  // ingresso: onda brand che sale e copre il girato, poi la card
  const wipe = eIO(prog(t, T_COVER - 0.15, T_COVER + 0.55));
  const card = prog(t, T_CARD, T_CARD + 0.9);
  const leave = eIO(prog(t, T_LOGO - 0.75, T_LOGO - 0.1));
  const hold = prog(t, T_CARD, T_LOGO);
  const ck = eO5(card);
  const W0 = 720, H0 = (W0 * 1402) / 1122, X0 = 540 - W0 / 2, Y0 = 318;
  return (
    <>
      {/* velo bianco che sale come un'onda */}
      <Abs x={0} y={0} w={1080} h={1920} style={{clipPath: `polygon(0 ${lerp(100, -12, wipe)}%, 100% ${lerp(112, 0, wipe)}%, 100% 100%, 0 100%)`, background: 'linear-gradient(180deg, #FFFFFF 0%, #F6FAFB 60%, #EEF6F7 100%)'}} />
      <Abs x={0} y={0} w={1080} h={1920} style={{clipPath: `polygon(0 ${lerp(100, -12, wipe) - 1.4}%, 100% ${lerp(112, 0, wipe) - 1.4}%, 100% ${lerp(112, 0, wipe)}%, 0 ${lerp(100, -12, wipe)}%)`, background: MAG, opacity: wipe < 1 ? 1 : 0}} />
      <Waves t={t} k={eO3(prog(t, T_COVER + 0.3, T_COVER + 1.0))} />
      <div style={{opacity: 1 - leave, transform: `translateY(${-leave * 60}px) scale(${1 - leave * 0.08})`, transformOrigin: '540px 760px'}}>
        <Kicker text="IL PERCORSO DI FORMAZIONE" y={240} k={prog(t, T_CARD + 0.3, T_CARD + 0.9)} color={MAG} />
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
          {/* riflesso che attraversa la card all'atterraggio */}
          <Abs x={-400 + 1600 * eIO(prog(t, T_CARD + 0.5, T_CARD + 1.5))} y={-200} w={220} h={1400} style={{background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)', transform: 'rotate(18deg)'}} />
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
            {/* riflesso sulla lente */}
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
const FUNC = new Set(['a', 'e', 'di', 'da', 'la', 'le', 'il', 'i', 'un', 'una', 'che', 'in', 'per', 'ma', 'o', 'lo', 'li', 'ho', 'è', 'hai', 'tu', 'si', 'cui', 'dai']);
const KEY = new Set(['collaboratore', 'settembre', 'bari', 'ctf', 'nessuno', 'mano', 'meno', 'ragazzi', 'guida', 'oggi', 'mentore', 'faro', 'modello', 'modelli', 'ispirarsi', 'rimanere', 'team', 'stesso', 'leader', 'ispira', 'titolari', 'titolare', 'farmacista', 'difficoltà', '10']);
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
      // niente preposizioni appese a fine riga
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

const Captions: React.FC<{t: number}> = ({t}) => {
  if (t > T_LOGO - 0.25) return null;
  const c = CHUNKS.find((x) => t >= x.t0 && t < x.t1);
  if (!c) return null;
  const dark = t > T_COVER + 0.12; // sul fondo bianco della copertina (l'onda passa sui sottotitoli presto)
  const fade = clamp((c.t1 - t) / 0.08);
  return (
    <Abs x={70} y={CAP_Y} w={940} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: 16, rowGap: 6, opacity: fade}}>
      {c.words.map((w, i) => {
        const p = prog(t, w.t - 0.06, w.t + 0.16);
        const key = KEY.has(bare(w.w));
        const hl = key && t >= w.t - 0.02;
        const hk = eO5(prog(t, w.t - 0.02, w.t + 0.2));
        return (
          <div key={i} style={{position: 'relative', opacity: clamp(p * 3), transform: `translateY(${(1 - eO3(p)) * 22}px) scale(${lerp(0.86, 1, eBack(clamp(p), 2.4))})`}}>
            {key && <div style={{position: 'absolute', left: -10, right: -10, top: 2, bottom: 0, borderRadius: 12, background: MAG, transform: `scaleX(${hl ? hk : 0})`, transformOrigin: '0 50%'}} />}
            <div
              style={{
                position: 'relative',
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 62,
                lineHeight: '78px',
                color: dark && !key ? NAVY : WHITE,
                textShadow: dark || key ? 'none' : '0 3px 14px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              {clean(w.w)}
            </div>
          </div>
        );
      })}
    </Abs>
  );
};

// ───────────────────────── debug: ingombro massimo del viso rilevato (con capelli)
const FACEBOX: Record<number, [number, number, number, number]> = {
  1: [329, 772, 840, 1285], 2: [338, 713, 948, 1316], 3: [332, 729, 854, 1259], 4: [304, 751, 948, 1303], 5: [294, 746, 853, 1287],
  6: [316, 690, 944, 1288], 7: [251, 745, 825, 1342], 8: [303, 700, 911, 1317], 9: [230, 704, 840, 1327], 10: [193, 653, 839, 1293],
};
const Debug: React.FC<{t: number}> = ({t}) => {
  const s = SHOTS.find((x) => t * FPS >= x.from && t * FPS < x.from + x.dur);
  if (!s) return null;
  const [x0, y0, x1, y1] = FACEBOX[s.clip];
  return <Abs x={x0} y={y0} w={x1 - x0} h={y1 - y0} style={{border: '4px dashed lime'}} />;
};

// ───────────────────────── composizione
const SECTIONS: [number, number, React.FC<{t: number}>][] = [
  [0, 5.3, Hook],
  [5.1, at('chi', 16) + 0.1, Lesson],
  [at('chi', 16) - 0.3, at('nessuno') + 0.2, Question],
  [at('nessuno') - 0.2, at('non', 22) + 0.2, Nobody],
  [at('non', 22) - 0.1, at('dipende', 29) + 0.1, Decline],
  [at('dipende', 29) - 0.1, at('i', 36) + 0.1, Blame],
  [at('i', 36) - 0.1, at('ma', 47) + 0.1, Needs],
  [at('ma', 47) - 0.1, at('perché', 51) + 0.1, Search],
  [at('perché', 51) - 0.1, at('il', 59) + 0.1, Stay],
  [at('il', 59) - 0.1, at('per', 68) + 0.2, Yourself],
];

export const Movie: React.FC<{debug?: boolean}> = ({debug}) => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: WHITE}}>
      {t < T_COVER + 0.8 && (
        <>
          <Footage />
          <Washes />
          {SECTIONS.map(([a, b, C], i) => (t >= a && t < b ? <C key={i} t={t} /> : null))}
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
