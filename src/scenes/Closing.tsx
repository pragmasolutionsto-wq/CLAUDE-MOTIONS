import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {Body, Chip, Glass, Hairline, Kicker, Logo, Words, ease, fadeIn, useSpring} from '../components';
import {C, SANS, SERIF} from '../theme';

/* 07 — Medical Labs */
const LABS = [
  {
    name: 'Beauty Lab',
    tag: 'Torino · Via Carlo Alberto 35',
    claim: 'Bellezza consapevole: medicina preventiva ed estetica avanzata, in percorsi strutturati.',
    items: ['Analisi della pelle', 'Peeling · PRX33', 'Biorivitalizzazione', 'Microneedling', 'Carbossiterapia', 'Criolipolisi medicale', 'Luce rossa · MedySculpt', 'Linfosculpt · IV therapy'],
    color: C.gold,
  },
  {
    name: 'Sport Lab',
    tag: 'Performance & recupero',
    claim: 'Medicina preventiva, fisiologia dello sport e biotecnologie al servizio dell’atleta.',
    items: ['Valutazioni funzionali avanzate', 'Prevenzione infortuni', 'Forza · Resistenza', 'Recupero', 'Composizione corporea', 'Gestione stress e carichi', 'Al fianco di atleti verso le Olimpiadi'],
    color: C.mint,
  },
  {
    name: 'Pelvic+',
    tag: 'Tecnologia HIFEM',
    claim: 'Benessere del pavimento pelvico con un percorso clinico, non solo un macchinario.',
    items: ['1 · Visita con ostetrica', '2 · Sedute HIFEM con PT specializzata', '3 · Check clinici periodici', 'Controllo vescicale', 'Supporto al prolasso', 'Dolore · Sessualità', 'Recupero post-parto'],
    color: '#E8A8B8',
  },
];

export const Labs: React.FC = () => {
  return (
    <AbsoluteFill style={{padding: '130px 150px 100px'}}>
      <Kicker n="06" label="Medical Labs" />
      <div style={{height: 22}} />
      <Words
        text="Tre laboratori, un’unica visione."
        delay={6}
        style={{fontFamily: SERIF, fontSize: 72, color: C.ivory, fontWeight: 500}}
        accent={['unica', 'visione']}
      />
      <div style={{display: 'flex', gap: 30, marginTop: 30}}>
        {LABS.map((l, i) => (
          <Glass key={l.name} delay={30 + i * 22} style={{flex: 1, padding: '30px 38px', borderTop: `3px solid ${l.color}`}}>
            <div style={{fontFamily: SANS, fontSize: 17, letterSpacing: 4, color: l.color, textTransform: 'uppercase'}}>{l.tag}</div>
            <div style={{fontFamily: SERIF, fontSize: 66, color: C.ivory, fontWeight: 600, marginTop: 8}}>{l.name}</div>
            <div style={{fontFamily: SANS, fontSize: 22, color: C.mute, lineHeight: 1.45, marginTop: 8, minHeight: 66}}>{l.claim}</div>
            <div style={{height: 1, background: C.faint, margin: '16px 0'}} />
            {l.items.map((it, j) => (
              <LabItem key={it} text={it} color={l.color} delay={60 + i * 22 + j * 6} />
            ))}
          </Glass>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const LabItem: React.FC<{text: string; color: string; delay: number}> = ({text, color, delay}) => {
  const frame = useCurrentFrame();
  const p = fadeIn(frame, delay, 18);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontSize: 23, color: C.ivory, padding: '5px 0', opacity: p, transform: `translateX(${(1 - p) * 20}px)`}}>
      <span style={{width: 6, height: 6, borderRadius: 6, background: color}} />
      {text}
    </div>
  );
};

/* 08 — A Casa Tua */
export const Home: React.FC = () => {
  const frame = useCurrentFrame();
  const places = ['Casa', 'Ufficio', 'In viaggio'];
  const services = [
    'Telemedicina',
    'Check-up a domicilio',
    'Check-up diagnostici di alta precisione',
    'Ricomposizione corporea & nutrizione',
    'Ritmo sonno-veglia',
    'Pavimento pelvico',
    'Medicina estetica e rigenerativa',
    'MedySculpt',
    'Trattamento del lipedema',
    'Educazione motoria',
  ];
  const pin = useSpring(10, 12);
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', padding: '0 150px', gap: 90}}>
      <div style={{width: 520, height: 520, position: 'relative', flexShrink: 0}}>
        {[0, 1, 2].map((i) => {
          const t = ((frame + i * 30) % 90) / 90;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 260 - 250 * t,
                top: 260 - 250 * t,
                width: 500 * t,
                height: 500 * t,
                borderRadius: '50%',
                border: `1.5px solid ${C.mint}`,
                opacity: (1 - t) * 0.6,
              }}
            />
          );
        })}
        <svg width={520} height={520} style={{position: 'absolute', transform: `translateY(${(1 - pin) * -120}px)`, opacity: pin}}>
          <path
            d="M260 120 c-70 0 -120 52 -120 118 c0 88 120 190 120 190 s120 -102 120 -190 c0 -66 -50 -118 -120 -118z"
            fill={C.goldSoft}
            stroke={C.gold}
            strokeWidth={3}
          />
          <path d="M215 250 l45 -38 l45 38 v52 h-90z" fill="none" stroke={C.ivory} strokeWidth={3} strokeLinejoin="round" />
          <rect x={248} y={272} width={24} height={30} fill="none" stroke={C.ivory} strokeWidth={3} />
        </svg>
      </div>
      <div style={{flex: 1}}>
        <Kicker n="07" label="A Casa Tua" />
        <div style={{height: 26}} />
        <Words text="La clinica viene da te." delay={8} style={{fontFamily: SERIF, fontSize: 104, color: C.ivory, fontWeight: 500}} accent={['te']} />
        <div style={{display: 'flex', gap: 34, marginTop: 18}}>
          {places.map((p, i) => (
            <div key={p} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 54, color: i === 1 ? C.gold : C.mint, opacity: fadeIn(frame, 36 + i * 10)}}>
              {p}
              {i < 2 ? <span style={{color: C.faint, marginLeft: 34}}>/</span> : null}
            </div>
          ))}
        </div>
        <Body delay={60} style={{marginTop: 18, fontSize: 26}}>
          Visite, consulenze, follow-up e lettura degli esami senza spostarti.
        </Body>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30}}>
          {services.map((s, i) => (
            <Chip key={s} delay={80 + i * 6} color={i % 3 === 0 ? C.gold : C.mint}>
              {s}
            </Chip>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 09 — Il percorso */
export const Path: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    ['Primo contatto', 'Telefono, email o form. Non serve aver già deciso nulla.'],
    ['Consulenza gratuita', 'Capire i tuoi bisogni e i tuoi obiettivi.'],
    ['Check-up', 'Visita di valutazione: ogni percorso parte da qui.'],
    ['Piano su misura', 'Alimentazione, attività fisica, integrazione, trattamenti strumentali.'],
    ['Tutor dedicato', 'Ti segue in ogni fase. Monitoraggio continuo con MitoGen11.'],
  ];
  const line = interpolate(frame, [30, 200], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return (
    <AbsoluteFill style={{padding: '150px 150px 110px'}}>
      <Kicker n="08" label="Il tuo percorso" />
      <div style={{height: 26}} />
      <Words text="Dal primo contatto alla tua versione migliore." delay={6} stagger={2} style={{fontFamily: SERIF, fontSize: 86, color: C.ivory, fontWeight: 500}} accent={['migliore']} />
      <div style={{position: 'relative', marginTop: 110}}>
        <div style={{position: 'absolute', top: 34, left: 34, right: 34, height: 2, background: C.faint}} />
        <div style={{position: 'absolute', top: 34, left: 34, width: `calc((100% - 68px) * ${line})`, height: 2, background: `linear-gradient(90deg, ${C.mint}, ${C.gold})`, boxShadow: `0 0 16px ${C.mint}`}} />
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          {steps.map(([t, d], i) => {
            const at = 30 + (i / (steps.length - 1)) * 170;
            const p = fadeIn(frame, at - 6, 22);
            const on = frame >= at;
            return (
              <div key={t} style={{width: 300, opacity: 0.25 + 0.75 * p}}>
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    border: `2px solid ${on ? C.gold : C.faint}`,
                    background: on ? C.ink : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: SERIF,
                    fontSize: 34,
                    color: on ? C.gold : C.mute,
                    boxShadow: on ? `0 0 30px ${C.goldSoft}` : undefined,
                    transform: `scale(${0.8 + 0.2 * p})`,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{fontFamily: SERIF, fontSize: 44, color: C.ivory, fontWeight: 600, marginTop: 30, transform: `translateY(${(1 - p) * 20}px)`}}>{t}</div>
                <div style={{fontFamily: SANS, fontSize: 22, color: C.mute, marginTop: 10, lineHeight: 1.45, transform: `translateY(${(1 - p) * 20}px)`}}>{d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 10 — Formazione & rete partner */
export const Academy: React.FC = () => {
  const frame = useCurrentFrame();
  const nodes = new Array(16).fill(0).map((_, i) => ({
    x: 60 + random(`nx${i}`) * 600,
    y: 60 + random(`ny${i}`) * 560,
  }));
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', padding: '0 150px', gap: 80}}>
      <div style={{flex: 1}}>
        <Kicker n="09" label="Formazione & network" />
        <div style={{height: 26}} />
        <Words text="Longevity Masterclass." delay={6} style={{fontFamily: SERIF, fontSize: 96, color: C.ivory, fontWeight: 500}} accent={['Masterclass']} accentColor={C.gold} />
        <Body delay={30} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 46, color: C.mint, marginTop: 6}}>
          Human Upgrade — la formula MitoGen11
        </Body>
        <Body delay={46} style={{marginTop: 22, maxWidth: 820}}>
          La prima masterclass fondata sulla medicina mitocondriale: quattro ore sulla scienza della longevità, in posti limitati.
        </Body>
        <Glass delay={80} style={{marginTop: 40, padding: '30px 36px', maxWidth: 820}}>
          <div style={{fontFamily: SANS, fontSize: 17, letterSpacing: 4, color: C.gold}}>RETE MEDICI PARTNER</div>
          <div style={{fontFamily: SANS, fontSize: 24, color: C.ivory, lineHeight: 1.45, marginTop: 10}}>
            Professionisti indipendenti formati sul Metodo Longevitas, le sue tecnologie e i protocolli MitoGen11: punti di riferimento qualificati sul territorio.
          </div>
        </Glass>
      </div>
      <svg width={720} height={680}>
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b, j) => {
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d > 230) return null;
            const o = fadeIn(frame, 40 + i * 4, 30);
            return <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.mint} strokeOpacity={0.25 * o} strokeWidth={1.2} />;
          }),
        )}
        {nodes.map((n, i) => {
          const o = fadeIn(frame, 30 + i * 4, 20);
          const center = i === 0;
          const r = center ? 20 : 8 + 3 * Math.sin(frame / 12 + i);
          return (
            <g key={i} opacity={o}>
              <circle cx={n.x} cy={n.y} r={r * 2.5} fill={center ? C.gold : C.mint} opacity={0.08} />
              <circle cx={n.x} cy={n.y} r={r} fill={center ? C.gold : C.mint} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* 11 — Outro & contatti */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const info = [
    ['Clinica', 'Corso De Gasperi 165, Rivoli (TO)'],
    ['Orari', 'Lunedì – Venerdì · 9:00 – 19:00'],
    ['Telefono', '011 1875 3564 · 320 379 1544'],
    ['Email', 'info@longevitas.it'],
  ];
  const endFade = interpolate(frame, [250, 300], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: endFade}}>
      <Words
        text="Prenota la tua visita di valutazione."
        delay={4}
        style={{fontFamily: SERIF, fontSize: 70, color: C.ivory, justifyContent: 'center'}}
        accent={['visita', 'di', 'valutazione']}
      />
      <div style={{height: 50}} />
      <Logo size={140} delay={20} />
      <div style={{height: 26}} />
      <Hairline delay={50} width={900} />
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 60, marginTop: 50}}>
        {info.map(([k, v], i) => (
          <div key={k} style={{opacity: fadeIn(frame, 70 + i * 8), transform: `translateY(${(1 - fadeIn(frame, 70 + i * 8)) * 20}px)`}}>
            <div style={{fontFamily: SANS, fontSize: 16, letterSpacing: 5, color: C.mint, textTransform: 'uppercase'}}>{k}</div>
            <div style={{fontFamily: SANS, fontSize: 26, color: C.ivory, marginTop: 10}}>{v}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 70,
          padding: '22px 60px',
          borderRadius: 100,
          border: `1.5px solid ${C.gold}`,
          fontFamily: SANS,
          fontSize: 34,
          letterSpacing: 6,
          color: C.gold,
          opacity: fadeIn(frame, 110),
          boxShadow: `0 0 ${30 + 20 * Math.sin(frame / 10)}px ${C.goldSoft}`,
        }}
      >
        WWW.LONGEVITAS.IT
      </div>
    </AbsoluteFill>
  );
};
