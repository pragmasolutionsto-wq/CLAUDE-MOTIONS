import React from 'react';
import {DBG, Disc, E, Obj, Plane, clamp, lerp, mixHex, rnd, store, tw, useT, useWorld} from './core';

/** (lo sfondo dei set è ora disegnato in 2D da FilmStage tramite film.bgSets) */
export const SetBg: React.FC<{color: string; ox: number}> = () => null;

/** scintille / esplosione radiale di particelle (canvas) */
export const Burst: React.FC<{x?: number; y?: number; z?: number; t0: number; n?: number; color: string; power?: number; size?: number; life?: number; gravity?: number; seed?: number}> = ({x = 0, y = 0, z = 0, t0, n = 36, color, power = 700, size = 9, life = 1.3, gravity = 900, seed = 0}) => {
  const base = useWorld();
  const t = useT();
  if (t < t0 || t > t0 + life) return null;
  store.parts.push({kind: 'burst', t0, x: base[0] + x, y: base[1] + y, z: base[2] + z, n, color, power, size, life, gravity, seed});
  return null;
};

/** coriandoli (canvas) */
export const Confetti: React.FC<{x?: number; y?: number; z?: number; t0: number; n?: number; colors: string[]; power?: number; life?: number; seed?: number}> = ({x = 0, y = 0, z = 0, t0, n = 70, colors, power = 1100, life = 3, seed = 0}) => {
  const base = useWorld();
  const t = useT();
  if (t < t0 || t > t0 + life) return null;
  store.parts.push({kind: 'confetti', t0, x: base[0] + x, y: base[1] + y, z: base[2] + z, n, colors, power, life, seed});
  return null;
};

/** curva 3D a perline luminose (il "filo" nello spazio) */
export type P3 = [number, number, number];
export const splineAt = (pts: P3[], u: number): P3 => {
  const n = pts.length - 1;
  const f = clamp(u) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const k = f - i;
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[Math.min(n, i + 2)];
  const c = (a: number, b: number, c2: number, d: number) =>
    0.5 * (2 * b + (-a + c2) * k + (2 * a - 5 * b + 4 * c2 - d) * k * k + (-a + 3 * b - 3 * c2 + d) * k * k * k);
  return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1]), c(p0[2], p1[2], p2[2], p3[2])];
};

export const Beads: React.FC<{pts: P3[]; p: number; n?: number; color: string; head: string; size?: number; tail?: number}> = ({pts, p, n = 140, color, head, size = 6, tail = 1}) => {
  const base = useWorld();
  store.parts.push({kind: 'beads', pts, p, n, color, head, size, tail, ox: base[0], oy: base[1], oz: base[2]});
  return null;
};

/** seguiamo una spline con la camera: genera keyframe con orientamento */
export const followKeys = (pts: P3[], t0: number, t1: number, ease: (x: number) => number, off: P3 = [0, 0, 0], lead = 0.05, step = 0.2) => {
  const keys = [];
  const n = Math.max(2, Math.round((t1 - t0) / step));
  for (let i = 0; i <= n; i++) {
    const t = lerp(t0, t1, i / n);
    const u = ease(i / n);
    const a = splineAt(pts, u);
    const b = splineAt(pts, Math.min(1, u + lead));
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dz = b[2] - a[2];
    const ry = (Math.atan2(dx, -dz) * 180) / Math.PI;
    const rx = (Math.atan2(dy, Math.hypot(dx, dz)) * 180) / Math.PI;
    keys.push({t, p: [a[0] + off[0], a[1] + off[1], a[2] + off[2]] as P3, r: [rx * 0.6, -ry * 0.8, ry * 0.12] as P3});
  }
  return keys;
};

export const tweenSpring = (t: number, a: number, d: number) => tw(t, a, d, E.settle);

/** sfera con ombreggiatura (disco con gradiente radiale) */
export const Sphere: React.FC<{r: number; color: string; opacity?: number}> = ({r, color, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: -r,
      top: -r,
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      background: `radial-gradient(circle at 32% 26%, ${mixHex(color, '#ffffff', 0.4)} 0%, ${color} 40%, ${mixHex(color, '#000000', 0.5)} 100%)`,
      opacity,
    }}
  />
);

/** camera "chase": sta dietro/sopra al punto della spline e guarda un punto più avanti */
export const chaseKeys = (pts: P3[], t0: number, t1: number, ease: (x: number) => number, uMax: number, off: P3, ahead = 0.12, step = 0.2, bank = 0.1) => {
  const keys = [];
  const n = Math.max(2, Math.round((t1 - t0) / step));
  for (let i = 0; i <= n; i++) {
    const t = lerp(t0, t1, i / n);
    const u = ease(i / n) * uMax;
    const a = splineAt(pts, u);
    const pos: P3 = [a[0] + off[0], a[1] + off[1], a[2] + off[2]];
    const b = splineAt(pts, Math.min(1, u + ahead));
    const vx = b[0] - pos[0];
    const vy = b[1] - pos[1];
    const vz = b[2] - pos[2];
    const yawRight = (Math.atan2(vx, -vz) * 180) / Math.PI;
    const pitchUp = (Math.atan2(-vy, Math.hypot(vx, vz)) * 180) / Math.PI;
    keys.push({t, p: pos, r: [-pitchUp, -yawRight, yawRight * bank] as P3});
  }
  return keys;
};

/** parallelepipedo disegnato dal mini renderer 3D (un solo layer per tutti i box) */
export const Box3D: React.FC<{x?: number; y?: number; z?: number; w: number; h: number; d: number; rz?: number; front: string; side: string; top?: string; opacity?: number; label?: boolean}> = ({x = 0, y = 0, z = 0, w, h, d, rz = 0, front, side, top, opacity = 1, label}) => {
  const base = useWorld();
  store.boxes.push({kind: 'box', c: [base[0] + x, base[1] + y, base[2] + z], w, h, d, rz, front, side, top, opacity, label});
  return null;
};

/** sfera/pallina disegnata dal mini renderer 3D */
export const Ball3D: React.FC<{x?: number; y?: number; z?: number; r: number; color: string; sx?: number; sy?: number; opacity?: number}> = ({x = 0, y = 0, z = 0, r, color, sx = 1, sy = 1, opacity = 1}) => {
  const base = useWorld();
  store.boxes.push({kind: 'ball', c: [base[0] + x, base[1] + y, base[2] + z], r, color, sx, sy, opacity});
  return null;
};
