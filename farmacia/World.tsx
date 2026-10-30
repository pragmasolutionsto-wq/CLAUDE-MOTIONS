import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {COL, FONT} from './config';
import {Block, Box, Cross, Figure, Pop, useTex} from './parts';
import {V3, clamp, eBack, eIO, lerp, prog, rnd} from './util';

/* ───────────────────────── camera ───────────────────────── */
type KF = {t: number; tg: V3; off: V3; fov?: number};
const KFS: KF[] = [
  {t: 0.0, tg: [-0.5, 2.5, 0], off: [0, 15, 17]},
  {t: 3.0, tg: [-0.5, 2.4, 1], off: [0, 9.5, 15]},
  {t: 6.0, tg: [0, 2.8, 1.5], off: [-2, 7.5, 14]},
  {t: 8.5, tg: [0, 2.6, 0.5], off: [-4, 6.5, 13.5]},
  {t: 11.0, tg: [0, 2.8, 0.5], off: [2, 5.2, 12.5]},
  {t: 12.9, tg: [10, 3, 0], off: [2, 6, 14]},
  {t: 14.4, tg: [18, 2.8, -0.5], off: [2, 5, 11]},
  {t: 15.9, tg: [18, 2.5, 0], off: [-2.5, 4, 9.5]},
  {t: 17.3, tg: [31, 1.6, 0], off: [-3.84, 5.12, 10.88]},
  {t: 19.9, tg: [31, 1.6, 0], off: [3.84, 4.86, 10.24]},
  {t: 21.7, tg: [37.5, 1.6, 0], off: [-3.84, 5.12, 10.88]},
  {t: 24.3, tg: [37.5, 1.6, 0], off: [3.84, 4.86, 10.24]},
  {t: 26.1, tg: [44, 1.6, 0], off: [-3.84, 5.12, 10.88]},
  {t: 28.7, tg: [44, 1.6, 0], off: [3.84, 4.86, 10.24]},
  {t: 30.5, tg: [50.5, 1.6, 0], off: [-3.84, 5.12, 10.88]},
  {t: 33.1, tg: [50.5, 1.6, 0], off: [3.84, 4.86, 10.24]},
  {t: 34.6, tg: [67, 2.6, 0], off: [0, 5, 22]},
  {t: 36.4, tg: [67, 2.6, 0], off: [-1.5, 6.5, 20]},
  {t: 37.8, tg: [61, 2.2, 0], off: [-1.28, 4.60, 10.88]},
  {t: 39.9, tg: [62, 2.2, 0], off: [2.56, 4.60, 10.24]},
  {t: 41.1, tg: [66, 2.2, 0], off: [-1.92, 4.60, 10.88]},
  {t: 43.0, tg: [68, 2.2, 0], off: [1.92, 4.60, 10.24]},
  {t: 44.1, tg: [72, 2.2, 0], off: [-1.28, 4.60, 10.88]},
  {t: 45.7, tg: [73, 2.2, 0], off: [1.92, 4.60, 10.24]},
  {t: 47.0, tg: [38, 3, 0], off: [0, 26, 20]},
  {t: 48.8, tg: [0, 3, 3], off: [0, 6.5, 15]},
  {t: 51.4, tg: [-3, 2.4, 3], off: [2, 10, 19]},
  {t: 54.0, tg: [-8, 1.5, 4], off: [6, 21, 30]},
  {t: 56.4, tg: [0, 3.2, 1], off: [0, 3.6, 17]},
  {t: 58.0, tg: [0, 3.2, 1], off: [0, 3.4, 15.8]},
  {t: 60.0, tg: [0, 3.2, 1], off: [0, 3.4, 15.8]},
];

const hermite = (p0: number, p1: number, m0: number, m1: number, s: number) => {
  const s2 = s * s,
    s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * m1;
};
const samp = (get: (k: KF) => number, t: number) => {
  let i = 0;
  while (i < KFS.length - 2 && t > KFS[i + 1].t) i++;
  const a = KFS[i],
    b = KFS[i + 1];
  const prev = KFS[i - 1] ?? a,
    next = KFS[i + 2] ?? b;
  const h = b.t - a.t;
  const m0 = prev === a ? 0 : ((get(b) - get(prev)) / (b.t - prev.t)) * h;
  const m1 = next === b ? 0 : ((get(next) - get(a)) / (next.t - a.t)) * h;
  return hermite(get(a), get(b), m0, m1, clamp((t - a.t) / h));
};
export const camAt = (t: number, vertical: boolean) => {
  const k = vertical ? 1.75 : 1.35;
  const tg: V3 = [samp((q) => q.tg[0], t), samp((q) => q.tg[1], t), samp((q) => q.tg[2], t)];
  const off: V3 = [samp((q) => q.off[0], t) * k, samp((q) => q.off[1], t) * k, samp((q) => q.off[2], t) * k];
  return {tg, pos: [tg[0] + off[0], tg[1] + off[1], tg[2] + off[2]] as V3};
};

/* ───────────────────────── luce del giorno ───────────────────────── */
type TOD = {t: number; bg: string; sun: string; I: number; amb: number; el: number};
const TODS: TOD[] = [
  {t: 0, bg: '#0B1D22', sun: '#FF8F66', I: 0.35, amb: 0.4, el: 0.2},
  {t: 4, bg: '#F2C9A6', sun: '#FFC08A', I: 1.5, amb: 0.7, el: 0.45},
  {t: 8, bg: '#F5F7EF', sun: '#FFF1DC', I: 2.2, amb: 0.85, el: 0.85},
  {t: 44, bg: '#F5F7EF', sun: '#FFF1DC', I: 2.2, amb: 0.85, el: 0.85},
  {t: 49, bg: '#F8E3B4', sun: '#FFD08A', I: 2.1, amb: 0.75, el: 0.55},
  {t: 54, bg: '#F2B992', sun: '#FF9D5E', I: 2.0, amb: 0.65, el: 0.32},
  {t: 60, bg: '#D97B62', sun: '#FF8A4D', I: 1.7, amb: 0.55, el: 0.22},
];
const tod = (t: number) => {
  let i = 0;
  while (i < TODS.length - 2 && t > TODS[i + 1].t) i++;
  const a = TODS[i],
    b = TODS[i + 1];
  const s = eIO(clamp((t - a.t) / (b.t - a.t)));
  return {
    bg: new THREE.Color(a.bg).lerp(new THREE.Color(b.bg), s),
    sun: new THREE.Color(a.sun).lerp(new THREE.Color(b.sun), s),
    I: lerp(a.I, b.I, s),
    amb: lerp(a.amb, b.amb, s),
    el: lerp(a.el, b.el, s),
  };
};

const Rig: React.FC<{t: number; vertical: boolean}> = ({t, vertical}) => {
  const {camera} = useThree();
  const {tg, pos} = camAt(t, vertical);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...pos);
  cam.fov = vertical ? 46 : 30;
  cam.lookAt(...tg);
  const {size} = useThree();
  cam.setViewOffset(size.width, size.height, 0, size.height * lerp(vertical ? -0.07 : 0.1, vertical ? -0.2 : 0.2, eIO(prog(t, 54.5, 56.4))), size.width, size.height);
  cam.updateProjectionMatrix();
  const d = tod(t);
  const dir = new THREE.Vector3(-0.55, d.el * 1.5 + 0.25, 0.85).normalize().multiplyScalar(46);
  return (
    <>
      <color attach="background" args={[d.bg]} />
      <fog attach="fog" args={[d.bg, 70, 230]} />
      <ambientLight intensity={d.amb} color={'#FFF6EA'} />
      <hemisphereLight args={['#FFFFFF', '#E6D3AF', d.amb * 0.55]} />
      <directionalLight
        color={d.sun}
        intensity={d.I}
        position={[tg[0] + dir.x, dir.y, tg[2] + dir.z]}
        target-position={tg}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
        shadow-radius={5}
      />
    </>
  );
};

/* ───────────────────────── tavolo ───────────────────────── */
const Plinth: React.FC<{t: number; at: number; p: V3; s: V3}> = ({t, at, p, s}) => (
  <Pop p={p} t={t} at={at} dur={0.9} from={[0, -1.5, 0]}>
    <Box s={s} c={COL.cream} r={0.15} />
  </Pop>
);

/* ───────────────────────── farmacia ───────────────────────── */
const Farmacia: React.FC<{t: number}> = ({t}) => {
  const flick = t < 10.4 ? 0 : t < 10.5 ? 0.3 : t < 10.56 ? 0 : 1;
  const sign = useTex(
    1024,
    140,
    (g, w, h) => {
      g.fillStyle = COL.cream;
      g.fillRect(0, 0, w, h);
      g.fillStyle = COL.petrol;
      g.font = `${92}px ${FONT.title}`;
      g.textBaseline = 'middle';
      g.textAlign = 'center';
      g.fillText('FARMACIA AFRICA ORIENTALE', w / 2, h / 2 + 2);
      g.strokeStyle = COL.turq;
      g.lineWidth = 6;
      g.strokeRect(6, 6, w - 12, h - 12);
    },
    'sign',
  );
  const rowsT = (j: number, i: number) => 7.0 + j * 0.42 + (i + 1) * 0.1;
  const crossP = prog(t, 8.2, 9.7);
  const ce = eIO(crossP);
  const cp: V3 = [lerp(-3.2, 0, ce), lerp(2.3, 5.95, ce), lerp(3.4, 0.9, ce)];
  const cu = lerp(1.5, 0.8, ce);
  const crossLit = clamp((t - 3.2) / 0.3) * (t < 10.4 || t > 10.5 ? 1 : 0.5);
  return (
    <group>
      <Plinth t={t} at={0} p={[0, -0.2, 0]} s={[26, 0.4, 14]} />
      {/* cross */}
      <group position={cp}>
        <Cross t={t} at={0.8} lit={crossLit} u={cu} />
      </group>
      {/* bottega 1909 in cartone */}
      <Pop p={[2.4, 0, -0.4]} t={t} at={3.6} dur={0.9} from={[0, 4, 0]} out={8.0}>
        <Box p={[0, 1.2, 0]} s={[4.2, 2.4, 3]} c={COL.kraft} r={0.08} />
        <Box p={[-1.2, 2.72, 0]} s={[2.6, 0.18, 3.3]} c={'#C9AB7C'} rot={[0, 0, 0.52]} />
        <Box p={[1.2, 2.72, 0]} s={[2.6, 0.18, 3.3]} c={'#C9AB7C'} rot={[0, 0, -0.52]} />
        <Box p={[0, 1.0, 1.55]} s={[1.0, 1.7, 0.12]} c={'#B89A6A'} />
        <Box p={[-1.45, 1.4, 1.52]} s={[0.9, 0.8, 0.1]} c={COL.cream} />
        <Box p={[1.45, 1.4, 1.52]} s={[0.9, 0.8, 0.1]} c={COL.cream} />
        <Box p={[0, 2.28, 1.58]} s={[2.4, 0.5, 0.1]} c={COL.cream} />
        <Box p={[0, 2.28, 1.66]} s={[0.36, 0.1, 0.04]} c={COL.petrol} />
        <Box p={[0, 2.28, 1.66]} s={[0.1, 0.36, 0.04]} c={COL.petrol} />
      </Pop>
      {/* facciata di oggi: mattoncini che salgono */}
      {[0, 1, 2, 3].map((j) =>
        [-1, 0, 1].map((i) => (
          <Block
            key={`${j}${i}`}
            t={t}
            at={rowsT(j, i)}
            dur={0.65}
            from={[0, 5, 0]}
            p={[i * 3, 0.55 + j * 1.1, -1]}
            s={[2.94, 1.08, 5]}
            c={(i + j) % 2 === 0 ? COL.petrol : '#0C535A'}
            r={0.08}
          />
        )),
      )}
      <Block t={t} at={9.0} dur={0.7} from={[0, 5, 0]} p={[0, 4.58, -1]} s={[9.6, 0.3, 5.6]} c={COL.cream} r={0.1} />
      <Pop p={[0, 3.72, 1.7]} t={t} at={9.5} dur={0.7} from={[0, 4, 0]}>
        <Box s={[7.4, 1.0, 0.3]} c={COL.cream} r={0.06} />
        <mesh position={[0, 0, 0.152]}>
          <planeGeometry args={[7.3, 0.93]} />
          <meshStandardMaterial color={'#FFFFFF'} map={sign} emissive={'#FFFFFF'} emissiveMap={sign} emissiveIntensity={flick * 0.7} roughness={0.8} />
        </mesh>
      </Pop>
      <Block t={t} at={9.8} dur={0.6} from={[-5, 0, 0]} p={[-2.9, 1.9, 1.6]} s={[2.3, 1.9, 0.22]} c={COL.cream} />
      <Block t={t} at={9.8} dur={0.6} from={[5, 0, 0]} p={[2.9, 1.9, 1.6]} s={[2.3, 1.9, 0.22]} c={COL.cream} />
      <Block t={t} at={10.0} dur={0.5} from={[0, 0, 4]} p={[-2.9, 1.95, 1.74]} s={[1.9, 1.5, 0.1]} c={'#BFE4E6'} emissive={COL.turq} ei={0.25 + flick * 0.45} />
      <Block t={t} at={10.0} dur={0.5} from={[0, 0, 4]} p={[2.9, 1.95, 1.74]} s={[1.9, 1.5, 0.1]} c={'#BFE4E6'} emissive={COL.turq} ei={0.25 + flick * 0.45} />
      <Block t={t} at={10.1} dur={0.6} from={[0, 0, 5]} p={[0, 1.25, 1.62]} s={[1.8, 2.5, 0.22]} c={COL.cream} />
      <Block t={t} at={10.25} dur={0.5} from={[0, 0, 4]} p={[0, 1.3, 1.76]} s={[1.3, 2.0, 0.1]} c={'#BFE4E6'} emissive={COL.turq} ei={0.25 + flick * 0.45} />
      <Block t={t} at={10.3} dur={0.5} from={[0, 0, 3]} p={[0, 0.1, 2.3]} s={[2.4, 0.2, 1.1]} c={COL.cream} />
      {/* vetrina: scatoline + pillola magenta */}
      <Block t={t} at={10.6} dur={0.5} from={[0, 3, 0]} p={[-3.5, 1.2, 1.85]} s={[0.6, 0.55, 0.4]} c={COL.petrol} />
      <Block t={t} at={10.7} dur={0.5} from={[0, 3, 0]} p={[-2.9, 1.18, 1.85]} s={[0.55, 0.5, 0.4]} c={COL.white} />
      <Pop p={[-2.25, 1.14, 1.9]} t={t} at={10.8} dur={0.5} from={[0, 3, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2 - 0.4]} castShadow>
          <capsuleGeometry args={[0.15, 0.35, 6, 12]} />
          <meshStandardMaterial color={COL.magenta} roughness={0.5} />
        </mesh>
      </Pop>
    </group>
  );
};

/* ───────────────────────── interno ───────────────────────── */
const SHELF_COLORS = [COL.cream, COL.white, COL.petrol, COL.turq, COL.cream, COL.white, COL.petrol, COL.magenta];
const Interno: React.FC<{t: number}> = ({t}) => {
  const r = useMemo(() => rnd(7), []);
  const items = useMemo(() => {
    const out: {x: number; y: number; w: number; h: number; c: string; at: number}[] = [];
    let n = 0;
    for (let row = 0; row < 3; row++) {
      let x = -3.4;
      while (x < 3.3) {
        const w = 0.5 + r() * 0.35;
        const h = 0.55 + r() * 0.4;
        out.push({x: x + w / 2, y: 1.45 + row * 1.3 + h / 2 - 0.1, w, h, c: SHELF_COLORS[Math.floor(r() * SHELF_COLORS.length)], at: 13.0 + n * 0.055});
        x += w + 0.08;
        n++;
      }
    }
    return out;
  }, [r]);
  return (
    <group position={[18, 0, 0]}>
      <Plinth t={t} at={12.0} p={[0, -0.2, 0]} s={[13, 0.4, 9.5]} />
      <Block t={t} at={12.2} p={[0, 2.9, -3.3]} s={[9.4, 5.6, 0.4]} c={COL.petrol} />
      <Block t={t} at={12.4} p={[-4.7, 2.9, -1.9]} s={[0.35, 5.6, 3.0]} c={COL.petrolDark} />
      {[0, 1, 2].map((row) => (
        <Block key={row} t={t} at={12.7 + row * 0.15} from={[0, 3, 0]} p={[0, 1.4 + row * 1.3, -2.8]} s={[8, 0.15, 1.1]} c={COL.cream} />
      ))}
      {items.map((q, i) => (
        <Block key={i} t={t} at={q.at} dur={0.5} from={[0, 5, 0]} p={[q.x, q.y, -2.8]} s={[q.w, q.h, 0.7]} c={q.c} r={0.05} />
      ))}
      <Block t={t} at={13.8} from={[0, 4, 0]} p={[0, 0.65, 1.1]} s={[7, 1.3, 1.6]} c={COL.cream} r={0.1} />
      <Block t={t} at={14.0} from={[0, 4, 0]} p={[0, 1.34, 1.1]} s={[7.2, 0.14, 1.8]} c={COL.petrol} r={0.05} />
      <Block t={t} at={14.4} from={[0, 3, 0]} p={[2.4, 1.7, 1.1]} s={[0.9, 0.55, 0.6]} c={COL.petrol} />
      <Pop p={[1.2, 1.6, 1.3]} t={t} at={14.6} from={[0, 3, 0]}>
        <mesh rotation={[0, 0, 0.5]} castShadow>
          <capsuleGeometry args={[0.13, 0.3, 6, 12]} />
          <meshStandardMaterial color={COL.magenta} roughness={0.5} />
        </mesh>
      </Pop>
      <Figure p={[0, 0, -0.7]} t={t} at={14.1} pose="point" hair="#5A3A28" phase={0.5} />
      <Figure p={[-3.1, 0, 2.3]} ry={0.4} t={t} at={14.7} coat={'#9CD3D8'} hair="#2B2B2B" k={0.92} phase={2} />
    </group>
  );
};

/* ───────────────────────── servizi ───────────────────────── */
const bpTex = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = '#0A474D';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#E8FBFC';
  g.font = `${70}px ${FONT.title}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('120/80', w * 0.46, h / 2 + 3);
  g.fillStyle = COL.magenta;
  g.beginPath();
  g.arc(w * 0.9, h * 0.3, 9, 0, 7);
  g.fill();
};
const glTex = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = '#0A474D';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#E8FBFC';
  g.font = `${72}px ${FONT.title}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('98', w * 0.4, h / 2 + 3);
  g.font = `${28}px ${FONT.body}`;
  g.fillText('mg/dL', w * 0.76, h / 2 + 12);
};
const Ecg: React.FC<{t: number; s: V3; p: V3; rot?: V3}> = ({t, s, p, rot}) => {
  const tex = useTex(
    256,
    128,
    (g, w, h) => {
      g.fillStyle = '#0A474D';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#1EA7B222';
      g.lineWidth = 1;
      for (let x = 0; x < w; x += 16) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, h);
        g.stroke();
      }
      g.strokeStyle = '#7CF3FF';
      g.lineWidth = 4;
      g.lineJoin = 'round';
      g.beginPath();
      const period = 1.0;
      for (let x = 0; x <= w; x += 2) {
        const ph = (((x / w) * 1.6 + t * 0.8) % period) / period;
        let y = 0;
        if (ph > 0.1 && ph < 0.2) y = Math.sin(((ph - 0.1) / 0.1) * Math.PI) * 0.1;
        if (ph > 0.28 && ph < 0.3) y = -(ph - 0.28) / 0.02 * 0.15;
        if (ph >= 0.3 && ph < 0.34) y = lerp(-0.15, 0.95, (ph - 0.3) / 0.04);
        if (ph >= 0.34 && ph < 0.4) y = lerp(0.95, -0.25, (ph - 0.34) / 0.06);
        if (ph >= 0.4 && ph < 0.43) y = lerp(-0.25, 0, (ph - 0.4) / 0.03);
        if (ph > 0.55 && ph < 0.72) y = Math.sin(((ph - 0.55) / 0.17) * Math.PI) * 0.18;
        const py = h * 0.62 - y * h * 0.45;
        if (x === 0) g.moveTo(x, py);
        else g.lineTo(x, py);
      }
      g.stroke();
    },
    Math.round(t * 30),
  );
  return <Box p={p} s={s} rot={rot} c={'#0A474D'} map={tex} emissive={'#FFFFFF'} ei={0.9} r={0.04} />;
};

const SubPressione: React.FC<{t: number; s: number}> = ({t, s}) => {
  const bp = useTex(160, 80, bpTex, 'bp');
  return (
    <group position={[31, 0, 0]}>
      <Block t={t} at={s} p={[0, 0.5, 0.2]} s={[2.6, 1.0, 1.5]} c={COL.cream} r={0.1} />
      <Block t={t} at={s + 0.5} p={[0.5, 1.3, 0.2]} s={[1.0, 0.6, 0.7]} c={COL.petrol} />
      <Block t={t} at={s + 0.8} dur={0.4} from={[0, 2, 0]} p={[0.5, 1.4, 0.58]} s={[0.7, 0.34, 0.04]} c={'#0A474D'} map={bp} emissive={'#FFFFFF'} ei={0.9} r={0.01} />
      <Block t={t} at={s + 0.9} p={[-0.55, 1.2, 0.35]} s={[0.55, 0.42, 0.6]} c={COL.turq} r={0.12} />
      <Figure p={[-2.0, 0, 1.0]} ry={1.1} t={t} at={s + 0.3} coat={'#9CD3D8'} hair="#6B6B6B" k={0.95} phase={1} />
      <Figure p={[2.1, 0, 1.0]} ry={-1.1} t={t} at={s + 0.6} pose="point" hair="#2B2B2B" phase={0.2} />
    </group>
  );
};
const SubEcg: React.FC<{t: number; s: number}> = ({t, s}) => (
  <group position={[37.5, 0, 0]}>
    <Block t={t} at={s} p={[0, 0.4, 0]} s={[3.8, 0.8, 1.6]} c={COL.cream} r={0.12} />
    <Block t={t} at={s + 0.3} p={[-1.45, 0.92, 0]} s={[0.9, 0.26, 1.0]} c={COL.white} r={0.12} />
    <Figure p={[0.35, 1.5, 0]} t={t} at={s + 0.6} pose="lie" coat={'#9CD3D8'} hair="#5A3A28" k={0.8} />
    <Block t={t} at={s + 0.9} p={[2.5, 0.7, -0.3]} s={[1.2, 1.4, 1.0]} c={COL.petrol} />
    <Pop p={[2.5, 1.7, -0.05]} t={t} at={s + 1.2} from={[0, 3, 0]}>
      <Ecg t={t} p={[0, 0, 0]} s={[1.1, 0.7, 0.08]} rot={[-0.25, 0, 0]} />
    </Pop>
    <Figure p={[-0.2, 0, 1.8]} t={t} at={s + 1.0} hair="#2B2B2B" pose="idle" phase={0.8} />
  </group>
);
const SubGlicemia: React.FC<{t: number; s: number}> = ({t, s}) => {
  const gl = useTex(160, 80, glTex, 'gl');
  return (
    <group position={[44, 0, 0]}>
      <Pop p={[-1.5, 0.1, 0]} t={t} at={s} from={[0, 4, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.0, 1.05, 0.22, 36]} />
          <meshStandardMaterial color={COL.petrol} roughness={0.8} />
        </mesh>
      </Pop>
      <Block t={t} at={s + 0.3} p={[-1.5, 0.9, -0.95]} s={[0.5, 1.5, 0.3]} c={COL.cream} />
      <Figure p={[-1.5, 0.22, 0]} t={t} at={s + 0.6} coat={'#9CD3D8'} hair="#7A4A2A" phase={1.3} />
      <Block t={t} at={s + 0.8} p={[1.7, 0.45, 0.2]} s={[2.2, 0.9, 1.3]} c={COL.cream} r={0.1} />
      <Block t={t} at={s + 1.2} p={[1.3, 1.02, 0.25]} s={[0.8, 0.22, 1.1]} c={COL.petrol} />
      <Block t={t} at={s + 1.4} dur={0.4} from={[0, 2, 0]} p={[1.3, 1.14, 0.32]} s={[0.55, 0.02, 0.4]} c={'#0A474D'} map={gl} emissive={'#FFFFFF'} ei={0.9} r={0.01} />
      <Pop p={[2.2, 1.25, 0.3]} t={t} at={s + 1.6} from={[0, 3, 0]}>
        <mesh scale={[1, 1.4, 1]} castShadow>
          <sphereGeometry args={[0.2, 20, 14]} />
          <meshStandardMaterial color={COL.magenta} roughness={0.35} />
        </mesh>
      </Pop>
      <Figure p={[0.2, 0, 1.8]} ry={-0.3} t={t} at={s + 1.0} pose="point" hair="#2B2B2B" phase={2} />
    </group>
  );
};
const bowl = new THREE.LatheGeometry(
  [
    [0.001, 0],
    [0.5, 0],
    [0.72, 0.18],
    [0.86, 0.5],
    [0.9, 0.66],
    [0.82, 0.68],
    [0.74, 0.5],
    [0.5, 0.3],
    [0.001, 0.26],
  ].map(([x, y]) => new THREE.Vector2(x, y)),
  36,
);
const SubGalenico: React.FC<{t: number; s: number}> = ({t, s}) => (
  <group position={[50.5, 0, 0]}>
    <Block t={t} at={s} p={[0, 0.45, 0]} s={[4.4, 0.9, 1.7]} c={COL.cream} r={0.1} />
    <Pop p={[-1.1, 0.9, 0.15]} t={t} at={s + 0.4} from={[0, 4, 0]}>
      <mesh geometry={bowl} castShadow receiveShadow scale={1.2}>
        <meshStandardMaterial color={'#ECEFE4'} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </Pop>
    <Pop p={[-1.1 + Math.cos(t * 3.2) * 0.14, 1.9, 0.15 + Math.sin(t * 3.2) * 0.14]} t={t} at={s + 0.9} from={[0, 4, 0]}>
      <mesh rotation={[0.3 * Math.sin(t * 3.2), 0, -0.35 + 0.1 * Math.cos(t * 3.2)]} castShadow>
        <capsuleGeometry args={[0.13, 1.1, 6, 12]} />
        <meshStandardMaterial color={COL.petrol} roughness={0.7} />
      </mesh>
    </Pop>
    {[0, 1, 2].map((i) => (
      <Pop key={i} p={[0.55 + i * 0.7, 0.9 + (0.28 - i * 0.04), 0.1]} t={t} at={s + 1.2 + i * 0.25} from={[0, 4, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.56 - i * 0.08, 24]} />
          <meshStandardMaterial color={'#F7FAF2'} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.3 - i * 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.12, 24]} />
          <meshStandardMaterial color={i === 1 ? COL.magenta : COL.petrol} roughness={0.5} />
        </mesh>
      </Pop>
    ))}
    <Figure p={[1.0, 0, -1.4]} t={t} at={s + 0.8} pose="point" hair="#5A3A28" phase={0.9} />
    <Figure p={[-1.4, 0, 1.9]} ry={0.2} t={t} at={s + 1.5} coat={'#9CD3D8'} hair="#6B6B6B" k={0.9} phase={2.5} />
  </group>
);

/* ───────────────────────── tre rooms ───────────────────────── */
const heartGeo = (() => {
  const sh = new THREE.Shape();
  sh.moveTo(0, -0.9);
  sh.bezierCurveTo(-1.6, 0.2, -0.8, 1.1, 0, 0.45);
  sh.bezierCurveTo(0.8, 1.1, 1.6, 0.2, 0, -0.9);
  const g = new THREE.ExtrudeGeometry(sh, {depth: 0.25, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 3, curveSegments: 18});
  g.center();
  return g;
})();
const Plant: React.FC<{p: V3; s?: number; t: number; at: number}> = ({p, s = 1, t, at}) => (
  <Pop p={p} t={t} at={at} from={[0, 4, 0]}>
    <group scale={s}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.28, 0.6, 20]} />
        <meshStandardMaterial color={COL.petrol} roughness={0.8} />
      </mesh>
      {[
        [0, 1.1, 0, 0.55],
        [-0.3, 0.95, 0.1, 0.38],
        [0.3, 1.25, -0.1, 0.4],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 18, 12]} />
          <meshStandardMaterial color={COL.green} roughness={0.9} />
        </mesh>
      ))}
    </group>
  </Pop>
);
const Rooms: React.FC<{t: number}> = ({t}) => {
  const wallT = prog(t, 35.6, 36.6);
  const hinge = eBack(wallT, 0.6) * (Math.PI / 2);
  const roofP = eIO(prog(t, 35.1, 36.0));
  const heart = 1 + Math.abs(Math.sin(t * 3.2)) * 0.08;
  const mirror = useTex(
    128,
    128,
    (g, w, h) => {
      const gr = g.createRadialGradient(w * 0.35, h * 0.3, 4, w / 2, h / 2, w / 2);
      gr.addColorStop(0, '#FFFFFF');
      gr.addColorStop(1, '#D9F1F2');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
    },
    'mirror',
  );
  return (
    <group position={[67, 0, 0]}>
      <Plinth t={t} at={33.4} p={[0, -0.2, 0]} s={[25, 0.4, 11]} />
      {/* guscio */}
      <Block t={t} at={33.8} p={[0, 2.8, -3.5]} s={[19.2, 5.6, 0.35]} c={COL.cream} />
      {[-9.4, -3.1, 3.1, 9.4].map((x, i) => (
        <Block key={i} t={t} at={34.0 + i * 0.12} p={[x, 2.8, -1.2]} s={[0.35, 5.6, 5.0]} c={COL.petrol} />
      ))}
      {[-6.25, 0, 6.25].map((x, i) => (
        <Block key={i} t={t} at={34.2 + i * 0.1} p={[x, 0.07, -0.5]} s={[6.0, 0.14, 6.2]} c={['#CFEBEC', '#DCEBD9', '#F8D6E6'][i]} r={0.04} />
      ))}
      {[-6.25, 0, 6.25].map((x, i) => (
        <Block key={i} t={t} at={34.5 + i * 0.1} p={[x, 4.4, -3.25]} s={[5.4, 0.45, 0.12]} c={[COL.turq, COL.green, COL.magenta][i]} r={0.04} />
      ))}
      {/* tetto che si solleva */}
      {roofP < 1 && t > 33.9 ? (
        <group position={[0, 5.9 + roofP * 10, -0.5]} scale={1 - roofP * 0.3}>
          <Pop t={t} at={34.0} from={[0, 6, 0]}>
            <Box s={[20, 0.4, 7]} c={COL.petrolDark} r={0.12} />
          </Pop>
        </group>
      ) : null}
      {/* facciata che si apre */}
      <group position={[0, 0.15, 2.65]} rotation={[hinge, 0, 0]}>
        <Pop t={t} at={34.1} from={[0, 0, 6]}>
          <Box p={[0, 1.1, 0]} s={[19.4, 2.2, 0.3]} c={COL.petrol} r={0.1} />
          <Box p={[-6.25, 1.2, 0.18]} s={[3.2, 1.2, 0.1]} c={COL.cream} />
          <Box p={[0, 1.2, 0.18]} s={[3.2, 1.2, 0.1]} c={COL.cream} />
          <Box p={[6.25, 1.2, 0.18]} s={[3.2, 1.2, 0.1]} c={COL.cream} />
          <Box p={[0, 1.1, -0.18]} s={[18, 1.8, 0.06]} c={COL.cream} r={0.02} />
        </Pop>
      </group>
      {/* Health Room */}
      <group position={[-6.25, 0, -0.5]}>
        <Block t={t} at={36.8} p={[0.4, 0.45, -0.6]} s={[3.2, 0.7, 1.5]} c={COL.cream} r={0.12} />
        <Block t={t} at={37.0} p={[-0.9, 0.9, -0.6]} s={[0.9, 0.22, 1.0]} c={COL.white} r={0.1} />
        <Block t={t} at={37.2} p={[-2.2, 1.5, -2.6]} s={[1.6, 1.1, 0.25]} c={COL.petrolDark} />
        <Pop p={[-2.2, 1.5, -2.45]} t={t} at={37.4} from={[0, 3, 0]}>
          <Ecg t={t} p={[0, 0, 0]} s={[1.35, 0.9, 0.06]} />
        </Pop>
        <Block t={t} at={37.4} p={[2.2, 0.55, 0.9]} s={[0.9, 1.1, 0.9]} c={COL.turq} r={0.12} />
        <Plant p={[2.2, 0, -2.0]} s={0.9} t={t} at={37.6} />
        <Figure p={[1.6, 0, 1.6]} ry={-0.3} t={t} at={37.7} hair="#2B2B2B" pose="idle" phase={1} />
      </group>
      {/* Wellness Room */}
      <group position={[0, 0, -0.5]}>
        <Plant p={[-2.1, 0, -1.8]} s={1.25} t={t} at={40.4} />
        <Plant p={[2.2, 0, -2.0]} s={1.0} t={t} at={40.6} />
        <Plant p={[-1.0, 0, 1.6]} s={0.8} t={t} at={40.8} />
        <Block t={t} at={40.6} p={[0.2, 0.3, -0.4]} s={[2.4, 0.6, 1.4]} c={'#EAF3E6'} r={0.2} />
        <Block t={t} at={40.8} p={[-0.5, 0.75, -0.6]} s={[0.9, 0.5, 0.9]} c={COL.cream} r={0.2} />
        <Pop p={[1.6, 0, 0.6]} t={t} at={41.0} from={[0, 4, 0]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1.8, 10]} />
            <meshStandardMaterial color={COL.petrol} />
          </mesh>
          <mesh position={[0, 1.85, 0]}>
            <coneGeometry args={[0.5, 0.55, 24, 1, true]} />
            <meshStandardMaterial color={'#FFE9B8'} emissive={'#FFD58A'} emissiveIntensity={0.9} side={THREE.DoubleSide} />
          </mesh>
          <pointLight position={[0, 1.7, 0]} intensity={4} color={'#FFD9A0'} distance={7} />
        </Pop>
        <Pop p={[0, 3.0, -3.05]} t={t} at={41.2} from={[0, 3, 0]}>
          <mesh geometry={heartGeo} scale={[0.85 * heart, 0.85 * heart, 0.85]} castShadow>
            <meshStandardMaterial color={COL.magenta} roughness={0.45} emissive={COL.magenta} emissiveIntensity={0.18} />
          </mesh>
        </Pop>
      </group>
      {/* Beauty Room */}
      <group position={[6.25, 0, -0.5]}>
        <Block t={t} at={43.5} p={[0.2, 0.55, -1.9]} s={[3.6, 1.1, 1.0]} c={COL.cream} r={0.1} />
        <Pop p={[0.2, 2.9, -2.9]} t={t} at={43.8} from={[0, 4, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1.0, 1.0, 0.12, 40]} />
            <meshStandardMaterial color={COL.magenta} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.86, 0.86, 0.05, 40]} />
            <meshStandardMaterial map={mirror} color={'#FFFFFF'} emissive={'#FFFFFF'} emissiveMap={mirror} emissiveIntensity={0.55} roughness={0.2} />
          </mesh>
        </Pop>
        {[-0.9, -0.35, 0.3, 0.9].map((x, i) => (
          <Pop key={i} p={[x + 0.2, 1.1, -1.9]} t={t} at={44.0 + i * 0.12} from={[0, 4, 0]}>
            <mesh position={[0, 0.3 + (i % 2) * 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.17, 0.2, 0.6 + (i % 2) * 0.16, 18]} />
              <meshStandardMaterial color={i % 2 ? COL.white : COL.turq} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.66 + (i % 2) * 0.16, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.16, 14]} />
              <meshStandardMaterial color={COL.magenta} roughness={0.4} />
            </mesh>
          </Pop>
        ))}
        <Block t={t} at={44.3} p={[-2.0, 0.35, 0.4]} s={[1.0, 0.7, 1.0]} c={COL.magenta} r={0.16} />
        <Figure p={[1.6, 0, 1.2]} ry={-0.35} t={t} at={44.2} pose="present" hair="#8A4B2A" phase={0.4} />
      </group>
    </group>
  );
};

/* ───────────────────────── tre generazioni + Brindisi ───────────────────────── */
const HOUSE_COLS = ['#F5F7EF', '#E9EFE6', '#F1E6D2', '#DCE9E8', '#F3D9C4', '#FFFFFF'];
const Citta: React.FC<{t: number}> = ({t}) => {
  const houses = useMemo(() => {
    const r = rnd(21);
    const out: {p: V3; s: V3; c: string; roof: boolean}[] = [];
    const add = (x: number, z: number, big = 1) => {
      const w = (1.6 + r() * 1.6) * big,
        d = 1.6 + r() * 1.4,
        h = 1.2 + r() * 2.2;
      out.push({p: [x, h / 2, z], s: [w, h, d], c: HOUSE_COLS[Math.floor(r() * HOUSE_COLS.length)], roof: r() > 0.4});
    };
    for (let x = -36; x < -13; x += 2.3 + r() * 0.7) add(x, 1.6 - r() * 2);
    for (let x = -36; x < 6; x += 2.4 + r() * 0.8) add(x, -8.5 - r() * 2);
    for (let x = -36; x < -9; x += 2.4 + r() * 0.8) add(x, 11.6 + r() * 1.5);
    for (let x = 9; x < 26; x += 2.6 + r() * 0.8) add(x, 11.8 + r() * 1.5);
    return out.sort((a, b) => a.p[0] - b.p[0]);
  }, []);
  return (
    <group>
      <Pop p={[-5, 0.06, 7.9]} t={t} at={47.6} dur={1.0} from={[0, -1, 0]}>
        <Box s={[66, 0.14, 3.6]} c={'#DCDDD2'} r={0.05} />
      </Pop>
      <Pop p={[-60, 0.1, 0]} t={t} at={48.0} dur={1.2} from={[0, -2, 0]}>
        <Box s={[34, 0.3, 46]} c={COL.turq} r={0.1} />
      </Pop>
      {houses.map((h, i) => (
        <Pop key={i} p={[h.p[0], 0, h.p[2]]} t={t} at={48.4 + i * 0.045} dur={0.6} from={[0, -4, 0]}>
          <Box p={[0, h.p[1], 0]} s={h.s} c={h.c} r={0.07} />
          {h.roof ? <Box p={[0, h.s[1] + 0.12, 0]} s={[h.s[0] + 0.2, 0.24, h.s[2] + 0.2]} c={'#E7B79B'} r={0.06} /> : null}
        </Pop>
      ))}
      {/* colonna romana in fondo al corso */}
      <Pop p={[-39.5, 0, 7.9]} t={t} at={50.6} dur={0.9} from={[0, 6, 0]}>
        <Box p={[0, 0.25, 0]} s={[1.6, 0.5, 1.6]} c={COL.cream} />
        <mesh position={[0, 2.3, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.5, 3.6, 24]} />
          <meshStandardMaterial color={'#F1ECE0'} roughness={0.9} />
        </mesh>
        <Box p={[0, 4.25, 0]} s={[1.3, 0.4, 1.3]} c={COL.cream} />
      </Pop>
    </group>
  );
};

const Generazioni: React.FC<{t: number}> = ({t}) => (
  <group position={[0, 0, 5.1]}>
    <Figure p={[-3.2, 0, 0]} ry={0.15} t={t} at={48.9} hair="#D8D8D8" coat={COL.white} k={1.05} phase={0.3} />
    <Figure p={[-0.8, 0, 0.3]} t={t} at={49.35} hair="#6B6B6B" k={1.0} phase={1.2} />
    <Figure p={[1.5, 0, 0.1]} ry={-0.12} t={t} at={49.8} hair="#5A3A28" k={0.95} pose="wave" phase={2} />
    <Figure p={[3.1, 0, 0.35]} ry={-0.2} t={t} at={50.0} hair="#2B2B2B" k={0.92} phase={2.7} />
  </group>
);

/* ───────────────────────── mondo ───────────────────────── */
export const World: React.FC<{t: number; vertical: boolean}> = ({t, vertical}) => (
  <>
    <Rig t={t} vertical={vertical} />
    <mesh position={[19, -0.55, 0]} receiveShadow>
      <boxGeometry args={[190, 1, 90]} />
      <meshStandardMaterial color={COL.wood} roughness={0.95} />
    </mesh>
    <Farmacia t={t} />
    <Interno t={t} />
    <Plinth t={t} at={15.0} p={[40.5, -0.2, 0]} s={[29, 0.4, 9]} />
    <SubPressione t={t} s={16.9} />
    <SubEcg t={t} s={21.4} />
    <SubGlicemia t={t} s={25.9} />
    <SubGalenico t={t} s={30.3} />
    <Rooms t={t} />
    <Citta t={t} />
    <Generazioni t={t} />
  </>
);
