import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Body, Chip, Counter, Glass, Kicker, Words, ease, fadeIn, useSpring} from '../components';
import {C, SANS, SERIF} from '../theme';

/* 04 — 50 biomarcatori + App MitoGen11 */
const Ring: React.FC<{label: string; value: number; color: string; delay: number}> = ({label, value, color, delay}) => {
  const frame = useCurrentFrame();
  const r = 46;
  const len = 2 * Math.PI * r;
  const p = interpolate(frame - delay, [0, 50], [0, value], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <svg width={112} height={112}>
        <circle cx={56} cy={56} r={r} fill="none" stroke={C.faint} strokeWidth={9} />
        <circle
          cx={56}
          cy={56}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - p)}
          transform="rotate(-90 56 56)"
        />
        <text x={56} y={64} textAnchor="middle" fill={C.ivory} fontFamily="Manrope" fontWeight={700} fontSize={24}>
          {Math.round(p * 100)}
        </text>
      </svg>
      <div style={{fontFamily: SANS, fontSize: 17, color: C.mute, letterSpacing: 2, textTransform: 'uppercase'}}>{label}</div>
    </div>
  );
};

export const AppScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phone = useSpring(20, 24);
  const bars = [0.55, 0.72, 0.6, 0.84, 0.7, 0.9, 0.78];
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', padding: '0 150px', gap: 90}}>
      <div style={{flex: 1}}>
        <Kicker n="03" label="La ricerca · App MitoGen11" />
        <div style={{display: 'flex', alignItems: 'baseline', gap: 26, marginTop: 30}}>
          <Counter to={50} delay={6} dur={55} style={{fontFamily: SERIF, fontSize: 260, color: C.gold, lineHeight: 0.9, textShadow: `0 0 70px ${C.goldSoft}`}} />
          <div style={{fontFamily: SERIF, fontSize: 64, color: C.ivory, lineHeight: 1}}>
            biomarcatori
            <br />
            <span style={{fontStyle: 'italic', color: C.mint}}>chiave</span>
          </div>
        </div>
        <Words
          text="Una mappa dinamica della tua salute, sempre aggiornata."
          delay={40}
          style={{fontFamily: SERIF, fontSize: 56, lineHeight: 1.1, color: C.ivory, marginTop: 30, maxWidth: 900}}
          accent={['dinamica']}
        />
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 36, maxWidth: 940}}>
          <Chip delay={80}>Esami di laboratorio</Chip>
          <Chip delay={88}>Test biologici</Chip>
          <Chip delay={96}>Dispositivi wearable</Chip>
          <Chip delay={104} color={C.gold}>Sonno · Attività · Stress</Chip>
          <Chip delay={112} color={C.gold}>AI · insight predittivi</Chip>
          <Chip delay={120}>Chat diretta con il team medico</Chip>
        </div>
      </div>
      {/* Mockup app */}
      <div style={{opacity: phone, transform: `translateY(${(1 - phone) * 120}px) rotate(${(1 - phone) * -8 + Math.sin(frame / 50) * 1.2}deg)`}}>
        <div
          style={{
            width: 430,
            height: 880,
            borderRadius: 64,
            padding: 18,
            background: 'linear-gradient(160deg, #1b2b27, #070f0d)',
            boxShadow: `0 60px 140px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(244,239,228,0.18), 0 0 120px ${C.mintSoft}`,
          }}
        >
          <div style={{width: '100%', height: '100%', borderRadius: 48, background: `linear-gradient(180deg, ${C.forest}, ${C.ink})`, padding: '56px 32px', overflow: 'hidden'}}>
            <div style={{fontFamily: SANS, fontSize: 16, letterSpacing: 4, color: C.mint}}>MITOGEN11</div>
            <div style={{fontFamily: SERIF, fontSize: 44, color: C.ivory, marginTop: 6}}>Il tuo profilo</div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 34}}>
              <Ring label="Sonno" value={0.82} color={C.mint} delay={50} />
              <Ring label="Attività" value={0.68} color={C.gold} delay={58} />
              <Ring label="Stress" value={0.41} color="#8FB8FF" delay={66} />
            </div>
            <div style={{marginTop: 36, padding: 22, borderRadius: 22, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.faint}`}}>
              <div style={{fontFamily: SANS, fontSize: 15, color: C.mute, letterSpacing: 2}}>EFFICIENZA MITOCONDRIALE</div>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, height: 130, marginTop: 16}}>
                {bars.map((b, i) => {
                  const h = interpolate(frame - 70 - i * 4, [0, 30], [0, b], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
                  return <div key={i} style={{flex: 1, height: `${h * 100}%`, borderRadius: 8, background: `linear-gradient(180deg, ${C.mint}, rgba(95,227,192,0.15))`}} />;
                })}
              </div>
            </div>
            <div
              style={{
                marginTop: 24,
                padding: '18px 22px',
                borderRadius: 20,
                background: C.goldSoft,
                border: `1px solid ${C.gold}55`,
                fontFamily: SANS,
                fontSize: 19,
                color: C.ivory,
                lineHeight: 1.4,
                opacity: fadeIn(frame, 130),
                transform: `translateY(${(1 - fadeIn(frame, 130)) * 20}px)`,
              }}
            >
              <b style={{color: C.gold}}>AI insight</b> · Suggerimento personalizzato per ottimizzare il tuo protocollo.
            </div>
            <div
              style={{
                marginTop: 14,
                alignSelf: 'flex-end',
                padding: '16px 20px',
                borderRadius: '20px 20px 4px 20px',
                background: C.mintSoft,
                fontFamily: SANS,
                fontSize: 18,
                color: C.ivory,
                opacity: fadeIn(frame, 160),
              }}
            >
              ● Il tuo team medico ti ha scritto
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 05 — Tecnologie & trattamenti */
const TECH = [
  ['IHHT', 'Ipossia-iperossia intermittente'],
  ['Fotobiomodulazione', 'Luce a bassa intensità rigenerativa'],
  ['Idrogeno molecolare', 'Inalazione H₂ e acqua arricchita'],
  ['IV Therapy', 'Infusioni personalizzate'],
  ['Crioterapia', 'Esposizione controllata al freddo'],
  ['Allurion', 'Perdita di peso senza chirurgia'],
  ['EMSCULPT', 'Tonificazione muscolare avanzata'],
  ['EMS personalizzata', 'Elettrostimolazione su misura'],
  ['Idrocolonterapia', 'Metodo Dephura'],
  ['HIIT metabolico', 'Allenamento ad alta intensità'],
  ['Mobilità posturale', 'Movimento e postura'],
  ['Sonno & Mindfulness', 'Respiro, meditazione, recupero'],
];

export const Tech: React.FC = () => {
  return (
    <AbsoluteFill style={{padding: '140px 150px 110px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
        <div>
          <Kicker n="04" label="Medicina mitocondriale & potenziativa" />
          <div style={{height: 26}} />
          <Words
            text="Agire sulle cause, non solo sui sintomi."
            delay={6}
            style={{fontFamily: SERIF, fontSize: 76, color: C.ivory, fontWeight: 500, lineHeight: 1.05}}
            accent={['cause']}
          />
        </div>
        <Body delay={30} style={{maxWidth: 520, fontSize: 25, textAlign: 'right'}}>
          Più energia, focus mentale, recupero e resilienza allo stress. Prevenire prima che compaiano i sintomi.
        </Body>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginTop: 40}}>
        {TECH.map(([t, d], i) => (
          <Glass key={t} delay={36 + i * 5} style={{padding: '22px 28px', borderRadius: 22}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div style={{fontFamily: SANS, fontSize: 15, color: C.gold, letterSpacing: 3}}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{width: 10, height: 10, borderRadius: 10, background: i % 3 === 0 ? C.gold : C.mint, boxShadow: `0 0 14px ${C.mint}`}} />
            </div>
            <div style={{fontFamily: SERIF, fontSize: 40, color: C.ivory, fontWeight: 600, marginTop: 14, lineHeight: 1.05}}>{t}</div>
            <div style={{fontFamily: SANS, fontSize: 20, color: C.mute, marginTop: 8}}>{d}</div>
          </Glass>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 06 — Focus IHHT */
export const Ihht: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 1620;
  const H = 300;
  const draw = interpolate(frame, [10, 130], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pts: string[] = [];
  const N = 240;
  for (let i = 0; i <= N * draw; i++) {
    const x = (i / N) * W;
    const phase = Math.floor((i / N) * 6) % 2; // alterna ipossia / iperossia
    const base = phase === 0 ? 0.72 : 0.22;
    const y = H * (base + Math.sin(i * 0.9) * 0.03);
    pts.push(`${x},${y}`);
  }
  const facts = [
    ['Non invasiva', 'Fasi alternate di aria povera e ricca di ossigeno'],
    ['2–3 sedute', 'a settimana, in un piano individuale'],
    ['SpO₂', 'monitorata durante ogni sessione'],
    ['Pre / Post', 'infiammazione, ossigenazione, metabolismo'],
  ];
  return (
    <AbsoluteFill style={{padding: '140px 150px 110px'}}>
      <Kicker n="05" label="Focus · IHHT" />
      <div style={{height: 26}} />
      <Words
        text="Allenare i mitocondri con l'ossigeno."
        delay={6}
        style={{fontFamily: SERIF, fontSize: 92, color: C.ivory, fontWeight: 500}}
        accent={['mitocondri']}
      />
      <div style={{position: 'relative', marginTop: 40, height: H}}>
        {new Array(6).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (i / 6) * W,
              width: W / 6,
              top: 0,
              bottom: 0,
              background: i % 2 === 0 ? 'rgba(143,184,255,0.06)' : 'rgba(95,227,192,0.07)',
              borderLeft: `1px dashed ${C.faint}`,
              opacity: fadeIn(frame, 10 + i * 18),
            }}
          >
            <div style={{fontFamily: SANS, fontSize: 18, letterSpacing: 4, padding: 16, color: i % 2 === 0 ? '#8FB8FF' : C.mint}}>
              {i % 2 === 0 ? 'IPOSSIA' : 'IPEROSSIA'}
            </div>
          </div>
        ))}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <polyline points={pts.join(' ')} fill="none" stroke={C.gold} strokeWidth={4} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 10px ${C.gold})`}} />
        </svg>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, marginTop: 44}}>
        {facts.map(([a, b], i) => (
          <Glass key={a} delay={90 + i * 10} style={{padding: '26px 30px', borderRadius: 22}}>
            <div style={{fontFamily: SERIF, fontSize: 46, color: C.gold, fontWeight: 600}}>{a}</div>
            <div style={{fontFamily: SANS, fontSize: 21, color: C.mute, marginTop: 6, lineHeight: 1.4}}>{b}</div>
          </Glass>
        ))}
      </div>
    </AbsoluteFill>
  );
};
