import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BF, clamp, DURATION_F, eIO, eO3, eO5, END_B, GOLD, GOLD_HI, H, INK, lerp, prog, rnd, Shot, SHOTS, W, WHITE} from './util';

const ANTON = "'Anton', 'Impact', sans-serif";
const MAN = "'Manrope', 'Helvetica Neue', sans-serif";

/* ------------------------------------------------------------------ video */

const shake = (f: number, amp: number, seed: number) => {
  const r = rnd(seed + f * 7);
  return [(r() - 0.5) * 2 * amp, (r() - 0.5) * 2 * amp];
};

const ShotView: React.FC<{s: Shot; i: number}> = ({s, i}) => {
  const f = useCurrentFrame();
  const len = s.n * BF;
  // punch-in sul taglio, poi deriva lenta
  const punch = s.fx === 'dark' ? 0 : 1 - eO5(prog(f, 0, 7));
  const drift = s.fx === 'dark' ? lerp(1.02, 1.16, eIO(f / len)) : lerp(0, 0.05, f / len);
  const sc = 1.04 + drift + punch * (s.fx === 'drop' ? 0.35 : s.fx === 'stutter' ? 0.22 : 0.16);
  const amp = s.fx === 'drop' ? 26 * (1 - prog(f, 0, 10)) : s.fx === 'stutter' ? 14 * (1 - prog(f, 0, 6)) : 8 * (1 - prog(f, 0, 5));
  const [dx, dy] = shake(f, amp, i * 31);
  const rot = s.fx === 'stutter' ? (i % 2 ? -1.2 : 1.2) * punch : 0;
  const bright = s.fx === 'dark' ? 0.55 + 0.25 * prog(f, 0, len) : 0.92;
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <OffthreadVideo
        src={staticFile(`${s.clip}.mp4`)}
        startFrom={Math.round(s.at * 30)}
        muted
        style={{
          width: W, height: H, objectFit: 'cover',
          transform: `translate(${dx}px, ${dy}px) scale(${sc}) rotate(${rot}deg)`,
          filter: `contrast(1.2) saturate(1.18) brightness(${bright})`,
        }}
      />
    </AbsoluteFill>
  );
};

const Flash: React.FC<{strong?: boolean; color?: string}> = ({strong, color = '#fff'}) => {
  const f = useCurrentFrame();
  const o = (strong ? 1 : 0.75) * (1 - prog(f, 0, strong ? 5 : 3));
  return <AbsoluteFill style={{background: color, opacity: o, mixBlendMode: 'screen'}} />;
};

const Grade: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 45%, transparent 35%, rgba(0,0,0,0.78) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 18%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,40,120,0.12), rgba(0,0,0,0))', mixBlendMode: 'multiply'}} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ testo */

// scritta che sbatte in scena: parte grande e sfocata, si pianta, trema un attimo
const Slam: React.FC<{
  text: string; at: number; size: number; color?: string; rgb?: boolean; track?: number; font?: string; out?: number;
}> = ({text, at, size, color = WHITE, rgb = false, track = 0.01, font = ANTON, out}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = prog(f, at, at + 5);
  const sc = lerp(1.7, 1, eO5(p));
  const blur = (1 - p) * 14;
  const [dx, dy] = shake(f, 5 * (1 - prog(f, at + 4, at + 10)) * (p >= 1 ? 1 : 0), at);
  const o = Math.min(prog(f, at, at + 2), out === undefined ? 1 : 1 - prog(f, out, out + 3));
  const base: React.CSSProperties = {
    position: 'absolute', inset: 0, fontFamily: font, fontSize: size, lineHeight: 0.92, letterSpacing: `${track}em`,
    textTransform: text.startsWith('A 220') ? 'none' : 'uppercase', whiteSpace: 'pre', textAlign: 'center',
  };
  const split = rgb ? 10 * (1 - prog(f, at, at + 9)) + 3 : 0;
  return (
    <div style={{position: 'relative', height: size * 0.98, width: '100%', opacity: o, transform: `translate(${dx}px, ${dy}px) scale(${sc})`, filter: `blur(${blur}px)`}}>
      {rgb && <div style={{...base, color: '#ff2a3c', transform: `translate(${-split}px, 0)`, mixBlendMode: 'screen', opacity: 0.85}}>{text}</div>}
      {rgb && <div style={{...base, color: '#20d8ff', transform: `translate(${split}px, 0)`, mixBlendMode: 'screen', opacity: 0.85}}>{text}</div>}
      <div style={{...base, color, textShadow: '0 10px 40px rgba(0,0,0,0.55)'}}>{text}</div>
    </div>
  );
};

const Stack: React.FC<{y?: number; children: React.ReactNode}> = ({y = 0, children}) => (
  <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `translateY(${y}px)`, gap: 6}}>
    {children}
  </AbsoluteFill>
);

const Typed: React.FC<{text: string; at: number; size: number; every?: number}> = ({text, at, size, every = 2}) => {
  const f = useCurrentFrame();
  const n = clamp(Math.floor((f - at) / every) + 1, 0, text.length);
  const cursor = Math.floor(f / 4) % 2 === 0;
  return (
    <div style={{fontFamily: MAN, fontWeight: 800, fontSize: size, letterSpacing: '0.32em', color: WHITE, textTransform: 'uppercase', textShadow: '0 0 30px rgba(90,120,255,0.8)'}}>
      {text.slice(0, n)}
      <span style={{color: GOLD, opacity: cursor ? 1 : 0}}>_</span>
    </div>
  );
};

const GoldBar: React.FC<{at: number; w: number}> = ({at, w}) => {
  const f = useCurrentFrame();
  const p = eO3(prog(f, at, at + 8));
  return <div style={{width: w * p, height: 8, background: `linear-gradient(90deg, ${GOLD}, ${GOLD_HI}, ${GOLD})`, boxShadow: `0 0 24px ${GOLD}`}} />;
};

const Small: React.FC<{text: string; at: number; color?: string; size?: number}> = ({text, at, color = WHITE, size = 44}) => {
  const f = useCurrentFrame();
  const p = eO5(prog(f, at, at + 8));
  return (
    <div style={{fontFamily: MAN, fontWeight: 700, fontSize: size, letterSpacing: '0.34em', color, textTransform: 'uppercase', opacity: p, transform: `translateY(${(1 - p) * 30}px)`, textShadow: '0 4px 20px rgba(0,0,0,0.7)'}}>
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ finale */

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const len = (38 - END_B) * BF;
  const p = eO5(prog(f, 0, 8));
  const sweep = prog(f, 10, 26);
  const glow = 0.4 + 0.25 * Math.sin(f / 5);
  const fade = 1 - prog(f, len - 8, len);
  const LW = 900, LH = (304 / 1136) * 900;
  return (
    <AbsoluteFill style={{background: INK}}>
      <AbsoluteFill style={{opacity: 0.35}}>
        <OffthreadVideo src={staticFile('c9238.mp4')} startFrom={30} muted style={{width: W, height: H, objectFit: 'cover', filter: 'blur(28px) brightness(0.5) saturate(1.3)', transform: `scale(${1.2 + f * 0.002})`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, rgba(226,177,60,${0.22 * glow}) 0%, transparent 55%)`}} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, opacity: fade, transform: 'translateY(-80px)'}}>
        <div style={{position: 'relative', width: LW, height: LH, transform: `scale(${lerp(1.5, 1, p)})`, opacity: prog(f, 0, 2), filter: `blur(${(1 - p) * 12}px) drop-shadow(0 0 ${30 * glow}px rgba(226,177,60,0.6))`}}>
          <Img src={staticFile('logo.png')} style={{width: LW, height: LH}} />
          {sweep > 0 && sweep < 1 && (
            <div style={{
              position: 'absolute', inset: 0,
              WebkitMaskImage: `url(${staticFile('logo.png')})`, WebkitMaskSize: '100% 100%',
              background: `linear-gradient(105deg, transparent ${sweep * 140 - 30}%, rgba(255,255,255,0.95) ${sweep * 140 - 15}%, transparent ${sweep * 140}%)`,
            }} />
          )}
        </div>
        <GoldBar at={8} w={520} />
        <Small text="Caselle Torinese" at={12} size={46} />
        <div style={{height: 40}} />
        <Small text="Scrivici in DM" at={20} color={GOLD_HI} size={52} />
      </AbsoluteFill>
      <Flash strong color={GOLD_HI} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ montaggio */

const at = (b: number) => b * BF;

export const Movie: React.FC = () => (
  <AbsoluteFill style={{background: INK}}>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={at(s.b)} durationInFrames={s.n * BF}>
        <ShotView s={s} i={i} />
        <Grade />
        <Flash strong={s.fx === 'drop' || s.fx === 'hero' || i === 0} color={s.fx === 'stutter' && i % 2 ? '#9fb4ff' : '#fff'} />
      </Sequence>
    ))}

    {/* hook */}
    <Sequence from={at(0)} durationInFrames={at(3)}>
      <Stack y={-120}>
        <Slam text="Non passa" at={2} size={190} />
        <Slam text="inosservata." at={18} size={150} color={GOLD} />
      </Stack>
    </Sequence>
    <Sequence from={at(5)} durationInFrames={at(3)}>
      <Stack y={-160}>
        <Slam text="AMG" at={1} size={330} rgb />
        <Slam text="Line" at={12} size={170} color={GOLD} track={0.12} />
      </Stack>
    </Sequence>
    <Sequence from={at(8)} durationInFrames={at(2)}>
      <Stack y={-160}>
        <Slam text="Premium" at={1} size={200} />
        <Slam text="Plus" at={10} size={200} color={GOLD} />
      </Stack>
    </Sequence>
    {/* break + drop */}
    <Sequence from={at(14)} durationInFrames={at(2)}>
      <Stack y={-80}>
        <Typed text="Di notte" at={2} size={78} every={2} />
      </Stack>
    </Sequence>
    <Sequence from={at(16)} durationInFrames={at(2)}>
      <Stack y={-200}>
        <Slam text="Cambia" at={0} size={260} rgb />
        <Slam text="faccia." at={8} size={260} color={GOLD} rgb />
      </Stack>
    </Sequence>
    <Sequence from={at(18)} durationInFrames={at(3)}>
      <Stack y={-560}>
        <Slam text="A 220d" at={1} size={240} />
        <div style={{height: 18}} />
        <Small text="Automatica · Diesel" at={10} color={GOLD_HI} />
      </Stack>
    </Sequence>
    {['Blu.', 'Sportiva.', 'Premium.', 'Tua.'].map((w, k) => (
      <Sequence key={w} from={at(21 + k)} durationInFrames={BF}>
        <Stack y={-120}>
          <Slam text={w} at={0} size={k === 3 ? 330 : 230} color={k === 3 ? GOLD : WHITE} rgb={k === 3} />
        </Stack>
      </Sequence>
    ))}
    {/* hero */}
    <Sequence from={at(25)} durationInFrames={at(6)}>
      <Stack y={-520}>
        <Small text="Mercedes-Benz" at={4} size={48} />
        <div style={{height: 10}} />
        <Slam text="A 220d" at={8} size={250} />
        <div style={{height: 22}} />
        <GoldBar at={18} w={600} />
        <div style={{height: 22}} />
        <Small text="AMG Line · Premium Plus" at={22} color={GOLD_HI} size={42} />
      </Stack>
    </Sequence>
    <Sequence from={at(END_B)} durationInFrames={DURATION_F - at(END_B)}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
