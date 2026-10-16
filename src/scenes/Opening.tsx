import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Body, Glass, Hairline, Kicker, Logo, Words, ease, fadeIn, useSpring} from '../components';
import {C, SANS, SERIF} from '../theme';

/* 00 — Intro: anelli mitocondriali + logo */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const rings = [420, 320, 220];
  const glow = interpolate(frame, [0, 60, 150], [0, 1, 0.7], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <svg width={1000} height={1000} style={{position: 'absolute', transform: `rotate(${frame * 0.3}deg)`}}>
        {rings.map((r, i) => {
          const len = 2 * Math.PI * r;
          const p = interpolate(frame - i * 8, [0, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
          return (
            <circle
              key={r}
              cx={500}
              cy={500}
              r={r}
              fill="none"
              stroke={i === 1 ? C.gold : C.mint}
              strokeOpacity={0.35 - i * 0.06}
              strokeWidth={1.4}
              strokeDasharray={i === 2 ? '4 14' : `${len}`}
              strokeDashoffset={i === 2 ? 0 : len * (1 - p)}
              style={{opacity: i === 2 ? p : 1}}
            />
          );
        })}
        {new Array(11).fill(0).map((_, i) => {
          const a = (i / 11) * Math.PI * 2;
          const o = fadeIn(frame, 30 + i * 3, 15);
          return <circle key={i} cx={500 + Math.cos(a) * 320} cy={500 + Math.sin(a) * 320} r={5} fill={C.gold} opacity={o} />;
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(95,227,192,0.22), transparent 65%)`,
          opacity: glow,
        }}
      />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
        <Logo size={168} delay={22} />
        <Hairline delay={60} width={700} />
        <div
          style={{
            fontFamily: SANS,
            fontSize: 26,
            letterSpacing: 14,
            color: C.mint,
            textTransform: 'uppercase',
            opacity: fadeIn(frame, 72),
          }}
        >
          Medicina di precisione
        </div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: C.mute, opacity: fadeIn(frame, 88)}}>
          Rivoli · Torino
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 01 — Hero: claim del sito */
export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const triad = ['Salute.', 'Energia.', 'Performance.'];
  return (
    <AbsoluteFill style={{padding: '0 180px', justifyContent: 'center'}}>
      <Kicker n="00" label="Longevity clinic" />
      <div style={{height: 40}} />
      <Words
        text="Medicina della longevità a Torino."
        delay={8}
        style={{fontFamily: SERIF, fontSize: 132, lineHeight: 1.02, color: C.ivory, fontWeight: 500, maxWidth: 1400}}
        accent={['longevità']}
      />
      <div style={{display: 'flex', gap: 60, marginTop: 50}}>
        {triad.map((t, i) => {
          const p = useSpring(50 + i * 14, 20);
          return (
            <div
              key={t}
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontSize: 78,
                color: i === 1 ? C.gold : C.mint,
                opacity: p,
                transform: `translateY(${(1 - p) * 50}px)`,
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
      <Body delay={100} style={{marginTop: 50, fontSize: 32, letterSpacing: 1}}>
        Check-up avanzati&nbsp;&nbsp;·&nbsp;&nbsp;Percorsi personalizzati&nbsp;&nbsp;·&nbsp;&nbsp;Trattamenti mirati
      </Body>
      <div
        style={{
          position: 'absolute',
          right: 180,
          bottom: 120,
          fontFamily: SANS,
          fontSize: 20,
          color: C.mute,
          letterSpacing: 4,
          textTransform: 'uppercase',
          opacity: fadeIn(frame, 120),
        }}
      >
        Competenze multidisciplinari · Ascolto clinico · Tecnologie avanzate
      </div>
    </AbsoluteFill>
  );
};

/* 02 — Chi siamo */
export const About: React.FC = () => {
  const people = [
    {name: 'Gianluca Barone', role: 'CEO & Co-Founder', desc: 'Farmacista e biologo nutrizionista. Longevità attiva e prevenzione personalizzata.'},
    {name: 'Fabrizio Alemanno', role: 'Co-Founder', desc: 'Ha fondato con Barone il progetto e la clinica di Rivoli.'},
  ];
  return (
    <AbsoluteFill style={{padding: '0 160px', flexDirection: 'row', alignItems: 'center', gap: 100}}>
      <div style={{flex: 1.15}}>
        <Kicker n="01" label="Chi siamo" />
        <div style={{height: 40}} />
        <Words
          text="La prima clinica di medicina preventiva e potenziativa in Piemonte."
          delay={6}
          stagger={2}
          style={{fontFamily: SERIF, fontSize: 92, lineHeight: 1.05, color: C.ivory, fontWeight: 500}}
          accent={['preventiva', 'potenziativa']}
        />
        <Body delay={50} style={{marginTop: 40, maxWidth: 860}}>
          Una clinica medico-scientifica dedicata a <span style={{color: C.ivory}}>salute, benessere e performance</span>. Un
          board medico di specialisti della longevità che unisce competenze mediche, nutrizionali e di medicina funzionale.
        </Body>
      </div>
      <div style={{flex: 0.85, display: 'flex', flexDirection: 'column', gap: 34}}>
        {people.map((p, i) => (
          <Glass key={p.name} delay={40 + i * 16} from="right" style={{padding: '40px 46px', display: 'flex', gap: 34, alignItems: 'center'}}>
            <div
              style={{
                width: 110,
                height: 110,
                flexShrink: 0,
                borderRadius: '50%',
                border: `1.5px solid ${C.gold}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SERIF,
                fontSize: 48,
                color: C.gold,
                background: C.goldSoft,
              }}
            >
              {p.name.split(' ').map((s) => s[0]).join('')}
            </div>
            <div>
              <div style={{fontFamily: SERIF, fontSize: 48, color: C.ivory, fontWeight: 600}}>{p.name}</div>
              <div style={{fontFamily: SANS, fontSize: 20, letterSpacing: 4, color: C.mint, textTransform: 'uppercase', marginTop: 6}}>{p.role}</div>
              <div style={{fontFamily: SANS, fontSize: 23, color: C.mute, marginTop: 12, lineHeight: 1.45}}>{p.desc}</div>
            </div>
          </Glass>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 03 — Metodo MitoGen11 */
export const Method: React.FC = () => {
  const frame = useCurrentFrame();
  const pillars = ['Nutrizione', 'Idratazione', 'Nutraceutica', 'Tecniche del freddo', 'Respirazione'];
  const R = 300;
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', padding: '0 140px'}}>
      <div style={{width: 820, height: 820, position: 'relative', flexShrink: 0}}>
        <svg width={820} height={820} style={{position: 'absolute'}}>
          <circle cx={410} cy={410} r={R} fill="none" stroke={C.faint} strokeWidth={1.5} />
          {new Array(11).fill(0).map((_, i) => {
            const a = (i / 11) * Math.PI * 2 - Math.PI / 2 + frame * 0.004;
            const p = interpolate(frame - 20 - i * 4, [0, 25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
            const x = 410 + Math.cos(a) * R * p;
            const y = 410 + Math.sin(a) * R * p;
            const pulse = 1 + 0.25 * Math.sin(frame / 10 + i);
            return (
              <g key={i} opacity={p}>
                <line x1={410} y1={410} x2={x} y2={y} stroke={C.mint} strokeOpacity={0.25} strokeWidth={1} />
                <circle cx={x} cy={y} r={30 * pulse} fill={C.mint} opacity={0.08} />
                <circle cx={x} cy={y} r={22} fill={C.deep} stroke={i % 2 ? C.gold : C.mint} strokeWidth={1.5} />
                <text x={x} y={y + 7} textAnchor="middle" fill={C.ivory} fontFamily="Manrope" fontSize={19} fontWeight={600}>
                  {String(i + 1).padStart(2, '0')}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: SANS, fontSize: 22, letterSpacing: 8, color: C.mint, opacity: fadeIn(frame, 10)}}>MITOGEN</div>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 300,
              fontSize: 210,
              lineHeight: 1,
              letterSpacing: -6,
              color: C.gold,
              textShadow: `0 0 60px ${C.goldSoft}`,
              opacity: fadeIn(frame, 14),
              transform: `scale(${0.8 + 0.2 * fadeIn(frame, 14, 30)})`,
            }}
          >
            11
          </div>
          <div style={{fontFamily: SANS, fontSize: 20, letterSpacing: 4, color: C.mute, opacity: fadeIn(frame, 40)}}>AREE DELLA SALUTE</div>
        </div>
      </div>
      <div style={{flex: 1, paddingLeft: 60}}>
        <Kicker n="02" label="Il metodo" />
        <div style={{height: 34}} />
        <Words
          text="Il cuore scientifico di Longevitas."
          delay={10}
          style={{fontFamily: SERIF, fontSize: 84, lineHeight: 1.04, color: C.ivory, fontWeight: 500}}
          accent={['cuore', 'scientifico']}
        />
        <Body delay={40} style={{marginTop: 28}}>
          11 aree fondamentali della salute integrate in un unico sistema personalizzato. Ogni intervento è guidato da{' '}
          <span style={{color: C.ivory}}>biomarcatori misurabili</span>: metabolici, infiammatori, ossidativi, nutrizionali.
        </Body>
        <div style={{fontFamily: SANS, fontSize: 19, letterSpacing: 5, color: C.gold, marginTop: 44, opacity: fadeIn(frame, 90), textTransform: 'uppercase'}}>
          I primi 5 pilastri della longevità cellulare
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 20}}>
          {pillars.map((p, i) => {
            const s = useSpring(100 + i * 9, 18);
            return (
              <div
                key={p}
                style={{
                  padding: '14px 24px',
                  borderRadius: 14,
                  border: `1px solid ${C.faint}`,
                  background: 'rgba(255,255,255,0.04)',
                  fontFamily: SANS,
                  fontSize: 25,
                  color: C.ivory,
                  opacity: s,
                  transform: `translateY(${(1 - s) * 30}px)`,
                }}
              >
                <span style={{color: C.mint, marginRight: 10, fontWeight: 600}}>{i + 1}</span>
                {p}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
