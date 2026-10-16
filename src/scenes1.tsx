import React from 'react';
import {AbsoluteFill, Easing, Sequence, random, useCurrentFrame} from 'remotion';
import {Letters, Line, Marquee, Stage, Tag, prog, sp} from './kit';
import {C, SANS, SERIF} from './theme';

/* ============ LOGO (usato come apertura e chiusura del loop) ============ */
export const LogoLockup: React.FC<{exitAt?: number}> = ({exitAt}) => {
  const f = useCurrentFrame();
  const R = 290;
  const len = 2 * Math.PI * R;
  const draw = prog(f, 0, 42);
  const burst = prog(f, 24, 26);
  const ex = exitAt === undefined ? 0 : prog(f, exitAt, 22, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{opacity: 1 - ex, transform: `scale(${1 + ex * 0.1})`}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <circle
          cx={960}
          cy={540}
          r={R}
          fill="none"
          stroke={C.champ}
          strokeWidth={3}
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
          transform="rotate(-90 960 540)"
        />
        <circle
          cx={960}
          cy={540}
          r={R + 56}
          fill="none"
          stroke={C.champ}
          strokeWidth={2}
          strokeDasharray="3 16"
          opacity={draw * 0.7}
          transform={`rotate(${f * 0.8} 960 540)`}
        />
        {new Array(40).fill(0).map((_, i) => {
          const a = (i / 40) * Math.PI * 2;
          const r1 = R + 30 + burst * 160;
          const l = 80 * Math.sin(Math.PI * burst) * (0.4 + 0.6 * random('b' + i));
          return (
            <line
              key={i}
              x1={960 + Math.cos(a) * r1}
              y1={540 + Math.sin(a) * r1}
              x2={960 + Math.cos(a) * (r1 + l)}
              y2={540 + Math.sin(a) * (r1 + l)}
              stroke={C.champ}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={Math.sin(Math.PI * burst)}
            />
          );
        })}
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <Letters text="LONGEVITAS" delay={34} stagger={3} size={150} color={C.ivory} font={SERIF} weight={500} gap={26} />
        <div style={{width: prog(f, 66, 30) * 560, height: 3, background: C.champ, marginTop: 6}} />
        <div
          style={{
            marginTop: 26,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: '0.5em',
            color: C.champ,
            opacity: prog(f, 74, 20),
            transform: `translateY(${(1 - prog(f, 74, 20)) * 16}px)`,
          }}
        >
          MEDICINA DI PRECISIONE
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Logo: React.FC = () => (
  <Stage bg={C.navy} fg={C.ivory} corner={false}>
    <LogoLockup />
  </Stage>
);

export const Outro: React.FC = () => (
  <Stage bg={C.navy} fg={C.ivory} corner={false}>
    <LogoLockup exitAt={92} />
  </Stage>
);

/* ============ HEADLINE ============ */
export const Headline: React.FC = () => {
  const f = useCurrentFrame();
  const c = sp(f, 2, 18, 70, 1);
  return (
    <Stage bg={C.ivory} fg={C.navy}>
      <div style={{position: 'absolute', left: 1040, top: 70, width: 940, height: 940, borderRadius: '50%', background: C.champ, transform: `scale(${c})`}} />
      <div
        style={{
          position: 'absolute',
          left: 980,
          top: 10,
          width: 1060,
          height: 1060,
          borderRadius: '50%',
          border: `3px dashed ${C.navy}`,
          opacity: 0.55,
          transform: `scale(${prog(f, 8, 34)}) rotate(${f * 0.5}deg)`,
        }}
      />
      <div style={{position: 'absolute', left: 130, top: 210}}>
        <Tag text="TORINO · RIVOLI" color={C.navy} delay={4} />
        <div style={{height: 22}} />
        <Line text="MEDICINA DELLA" size={164} color={C.navy} delay={8} />
        <Line text="longevità" size={350} color={C.navy} font={SERIF} weight={500} italic spacing="-0.02em" delay={16} style={{marginTop: -20}} />
      </div>
      <Marquee text="LONGEVITAS ✦ MEDICINA DI PRECISIONE ✦ " y={940} size={88} color={C.navy} speed={6} opacity={0.5} />
    </Stage>
  );
};

/* ============ TRIADE: Salute / Energia / Performance ============ */
const Pulse: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {[0, 1, 2, 3].map((k) => {
        const age = ((f + k * 12) % 48) / 48;
        const r = 120 + age * 760;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 960 - r,
              top: 540 - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: `4px solid ${C.champ}`,
              opacity: (1 - age) * 0.8,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Rays: React.FC = () => {
  const f = useCurrentFrame();
  const g = prog(f, 0, 14);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <g transform={`translate(960 540) rotate(${f * 2.2})`}>
        {new Array(28).fill(0).map((_, i) => {
          const a = (i / 28) * 360;
          const L = (i % 2 ? 380 : 620) * g;
          return <rect key={i} x={-7} y={-L - 180} width={14} height={L} rx={7} fill={C.navy} opacity={0.9} transform={`rotate(${a})`} />;
        })}
      </g>
    </svg>
  );
};

const Steps: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(9).fill(0).map((_, i) => {
        const h = (120 + i * 90) * prog(f, 3 + i * 2, 20);
        return <div key={i} style={{position: 'absolute', left: 150 + i * 190, bottom: 0, width: 130, height: h, background: i === 8 ? C.champ : 'rgba(201,185,154,0.3)', borderRadius: '14px 14px 0 0'}} />;
      })}
    </AbsoluteFill>
  );
};

export const Triad: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={50}>
        <AbsoluteFill style={{background: C.navy}}>
          <Pulse />
          <Center>
            <Zoom>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 330, color: C.ivory, letterSpacing: '-0.05em'}}>SALUTE.</div>
            </Zoom>
          </Center>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={50} durationInFrames={50}>
        <AbsoluteFill style={{background: C.champ}}>
          <Rays />
          <Center>
            <Zoom>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 330, color: C.ivory, letterSpacing: '-0.05em', background: C.navy, padding: '0 50px', borderRadius: 24}}>ENERGIA.</div>
            </Zoom>
          </Center>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={100} durationInFrames={50}>
        <AbsoluteFill style={{background: C.night}}>
          <Steps />
          <Center>
            <Zoom>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 218, color: C.ivory, letterSpacing: '-0.05em'}}>PERFORMANCE.</div>
            </Zoom>
          </Center>
        </AbsoluteFill>
      </Sequence>
      {/* barra di avanzamento della triade */}
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 10, width: `${(f / 150) * 100}%`, background: C.champ}} />
    </AbsoluteFill>
  );
};

const Center: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>{children}</AbsoluteFill>
);

const Zoom: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const s = sp(f, 0, 12, 170, 0.6);
  return <div style={{transform: `scale(${1.7 - 0.7 * s}) rotate(${(1 - s) * -3}deg)`, opacity: Math.min(1, s * 3)}}>{children}</div>;
};

/* ============ CHI SIAMO ============ */
export const About: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage bg={C.night} fg={C.ivory}>
      {/* radar */}
      {[0, 1, 2].map((k) => {
        const age = ((f + k * 30) % 90) / 90;
        const r = 80 + age * 700;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 1560 - r,
              top: 800 - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: `3px solid ${C.champ}`,
              opacity: (1 - age) * 0.5,
            }}
          />
        );
      })}
      <div style={{position: 'absolute', left: 1560 - 18, top: 800 - 18, width: 36, height: 36, borderRadius: '50%', background: C.champ, transform: `scale(${sp(f, 20, 10, 200, 0.5)})`}} />
      <div style={{position: 'absolute', left: 130, top: 150}}>
        <Tag text="CHI SIAMO" color={C.champ} delay={2} />
        <div style={{height: 26}} />
        <Line text="LA PRIMA CLINICA DI" size={70} color={C.ivory} delay={6} from="left" weight={700} />
        <Line text="MEDICINA" size={150} color={C.ivory} delay={12} from="right" />
        <Line text="PREVENTIVA" size={150} color={C.champ} delay={18} from="left" />
        <Line text="E POTENZIATIVA" size={150} color={C.ivory} delay={24} from="right" />
        <Line text="in Piemonte." size={120} color={C.champ} font={SERIF} weight={500} italic spacing="0" delay={34} />
      </div>
    </Stage>
  );
};

/* ============ TITOLO TRATTAMENTI ============ */
export const TreatTitle: React.FC = () => {
  const f = useCurrentFrame();
  const labels = ['IHHT', 'H₂', 'IV', 'PBM'];
  return (
    <Stage bg={C.champ} fg={C.navy}>
      <Marquee text="››››››››››››››››››››" y={150} size={110} color={C.navy} speed={14} outline={false} opacity={0.2} />
      <div style={{position: 'absolute', left: 130, top: 270}}>
        <Line text="I NOSTRI" size={120} color={C.navy} delay={2} weight={700} />
        <Letters text="TRATTAMENTI" delay={6} stagger={2} size={206} color={C.navy} gap={0} />
      </div>
      <div style={{position: 'absolute', left: 130, top: 790, display: 'flex', gap: 28}}>
        {labels.map((l, i) => {
          const p = sp(f, 36 + i * 8, 12, 160, 0.6);
          return (
            <div
              key={l}
              style={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: i === 3 ? C.navy : 'transparent',
                border: `4px solid ${C.navy}`,
                color: i === 3 ? C.champ : C.navy,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 40,
                transform: `scale(${p})`,
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
