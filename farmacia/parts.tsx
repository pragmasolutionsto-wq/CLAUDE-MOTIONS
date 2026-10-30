import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {COL} from './config';
import {V3, clamp, eBack, eO3, lerp, prog} from './util';

const cache = new Map<string, THREE.BufferGeometry>();
const rbGeo = (w: number, h: number, d: number, r: number) => {
  const rr = Math.max(0.001, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
  const k = `${w}|${h}|${d}|${rr}`;
  let g = cache.get(k);
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, 2, rr);
    cache.set(k, g);
  }
  return g;
};

type BoxProps = {
  p?: V3;
  s: V3;
  c: string;
  r?: number;
  rot?: V3;
  emissive?: string;
  ei?: number;
  map?: THREE.Texture | null;
  rough?: number;
  cast?: boolean;
  recv?: boolean;
};
export const Box: React.FC<BoxProps> = ({p = [0, 0, 0], s, c, r = 0.07, rot = [0, 0, 0], emissive, ei = 1, map, rough = 0.88, cast = true, recv = true}) => (
  <mesh position={p} rotation={rot} geometry={rbGeo(s[0], s[1], s[2], r)} castShadow={cast} receiveShadow={recv}>
    <meshStandardMaterial
      color={c}
      roughness={rough}
      metalness={0}
      map={map ?? null}
      emissive={emissive ?? '#000000'}
      emissiveMap={emissive ? map ?? null : null}
      emissiveIntensity={emissive ? ei : 0}
    />
  </mesh>
);

type PopProps = {
  p?: V3;
  t: number;
  at: number;
  dur?: number;
  from?: V3; // offset di partenza
  out?: number; // istante in cui sparisce
  rotY?: number;
  children: React.ReactNode;
};
// costruzione a blocchi: arriva da `from`, piccolo overshoot, scala 0.6 -> 1
export const Pop: React.FC<PopProps> = ({p = [0, 0, 0], t, at, dur = 0.7, from = [0, 3, 0], out, rotY = 0, children}) => {
  const pi = prog(t, at, at + dur);
  if (pi <= 0) return null;
  let e = eBack(pi, 1.1);
  let sc = lerp(0.6, 1, clamp(e, 0, 1.08));
  let off = 1 - e;
  if (out !== undefined) {
    const po = prog(t, out, out + 0.55);
    if (po >= 1) return null;
    sc *= 1 - eO3(po);
  }
  return (
    <group position={[p[0] + from[0] * off, p[1] + from[1] * off, p[2] + from[2] * off]} rotation={[0, rotY * (1 - pi), 0]} scale={sc}>
      {children}
    </group>
  );
};

// blocco singolo che sale/cade al suo posto
export const Block: React.FC<BoxProps & {t: number; at: number; dur?: number; from?: V3; out?: number}> = ({t, at, dur, from, out, p = [0, 0, 0], ...rest}) => (
  <Pop p={p} t={t} at={at} dur={dur} from={from} out={out}>
    <Box {...rest} />
  </Pop>
);

export const useTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, dep: string | number) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.anisotropy = 8;
    return tx;
  }, [w, h]);
  useMemo(() => {
    const g = (tex.image as HTMLCanvasElement).getContext('2d')!;
    draw(g, w, h);
    tex.needsUpdate = true;
  }, [dep]); // eslint-disable-line react-hooks/exhaustive-deps
  return tex;
};

type Pose = 'idle' | 'point' | 'present' | 'wave' | 'lie';
type FigProps = {
  p: V3;
  ry?: number;
  t: number;
  at: number;
  hair?: string;
  coat?: string;
  pose?: Pose;
  k?: number;
  phase?: number;
  out?: number;
  dur?: number;
};
// omino stilizzato: camice, testa tonda, nessun tratto
export const Figure: React.FC<FigProps> = ({p, ry = 0, t, at, hair = '#3A2A22', coat = COL.white, pose = 'idle', k = 1, phase = 0, out, dur = 0.6}) => {
  const sw = Math.sin(t * 2.2 + phase);
  const bob = pose === 'lie' ? 0 : Math.abs(sw) * 0.03;
  const armL: V3 = [0, 0, 0.18 + sw * 0.05];
  let armR: V3 = [0, 0, -0.18 - sw * 0.05];
  if (pose === 'point') armR = [-1.15 + sw * 0.08, 0, -0.35];
  if (pose === 'wave') armR = [0, 0, -2.5 + sw * 0.35];
  if (pose === 'present') armR = [-1.25, 0, -0.25];
  return (
    <Pop p={p} t={t} at={at} dur={dur} from={[0, 4, 0]} out={out}>
      <group rotation={[0, ry, pose === 'lie' ? Math.PI / 2 : 0]} scale={k} position={[0, bob, 0]}>
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.36, 0.5, 1.44, 24]} />
          <meshStandardMaterial color={coat} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.44, 0]} castShadow>
          <sphereGeometry args={[0.37, 24, 14]} />
          <meshStandardMaterial color={coat} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.95, 0]} castShadow>
          <sphereGeometry args={[0.4, 28, 18]} />
          <meshStandardMaterial color={COL.skin} roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.0, -0.04]} rotation={[-0.35, 0, 0]} castShadow>
          <sphereGeometry args={[0.43, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        <mesh position={[0.2, 1.15, 0.46]}>
          <circleGeometry args={[0.07, 16]} />
          <meshStandardMaterial color={COL.turq} />
        </mesh>
        <group position={[-0.5, 1.35, 0]} rotation={armL}>
          <mesh position={[0, -0.32, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.55, 6, 12]} />
            <meshStandardMaterial color={coat} roughness={0.85} />
          </mesh>
        </group>
        <group position={[0.5, 1.35, 0]} rotation={armR}>
          <mesh position={[0, -0.32, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.55, 6, 12]} />
            <meshStandardMaterial color={coat} roughness={0.85} />
          </mesh>
          {pose === 'present' ? (
            <group position={[0, -0.78, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.13, 0.13, 0.4, 16]} />
                <meshStandardMaterial color={COL.cream} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.27, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.14, 12]} />
                <meshStandardMaterial color={COL.magenta} roughness={0.5} />
              </mesh>
            </group>
          ) : null}
        </group>
      </group>
    </Pop>
  );
};

// croce della farmacia: 5 pezzi che arrivano da lati diversi
export const Cross: React.FC<{t: number; at: number; lit: number; u?: number}> = ({t, at, lit, u = 1}) => {
  const parts: {p: V3; from: V3; d: number}[] = [
    {p: [0, 0, 0], from: [0, 0, 8], d: 0.0},
    {p: [0, 1, 0], from: [0, 7, 0], d: 0.22},
    {p: [-1, 0, 0], from: [-8, 0, 0], d: 0.4},
    {p: [1, 0, 0], from: [8, 0, 0], d: 0.58},
    {p: [0, -1, 0], from: [0, -7, 0], d: 0.76},
  ];
  return (
    <group scale={u}>
      {parts.map((q, i) => (
        <Pop key={i} p={q.p} t={t} at={at + q.d} dur={0.75} from={q.from}>
          <Box s={[0.94, 0.94, 0.5]} c={COL.petrol} r={0.12} emissive={COL.turq} ei={lit * 0.85} />
          <Box p={[0, 0, 0.26]} s={[0.5, 0.5, 0.05]} c={COL.cream} r={0.02} emissive={'#FFFFFF'} ei={lit * 1.1} />
        </Pop>
      ))}
    </group>
  );
};
