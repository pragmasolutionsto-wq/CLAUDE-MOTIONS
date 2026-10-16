import React, {useLayoutEffect, useRef} from 'react';
import {PERSP, project, store, type V3} from './store';

const rnd = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** curva Catmull-Rom (stessa di fx.splineAt) */
const splineAt = (pts: V3[], u: number): V3 => {
  const n = pts.length - 1;
  const f = clamp(u) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const k = f - i;
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[Math.min(n, i + 2)];
  const c = (a: number, b: number, c2: number, d: number) => 0.5 * (2 * b + (-a + c2) * k + (2 * a - 5 * b + 4 * c2 - d) * k * k + (-a + 3 * b - 3 * c2 + d) * k * k * k);
  return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1]), c(p0[2], p1[2], p2[2], p3[2])];
};

const glow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a: number) => {
  ctx.globalAlpha = a * 0.28;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = a;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

/* ============ particelle su canvas (dietro / davanti al mondo 3D) ============ */
export const ParticleCanvas: React.FC<{layer: 'back' | 'front'}> = ({layer}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, 1920, 1080);
    const t = store.t;
    const side = (z: number) => (z < 0 ? 'back' : 'front');

    const dot = (P: V3, r: number, color: string, a: number, forceLayer?: 'back' | 'front') => {
      if ((forceLayer ?? side(P[2])) !== layer) return;
      const q = project(P);
      if (!q) return;
      const rr = r * q.s;
      if (q.x < -rr * 3 || q.x > 1920 + rr * 3 || q.y < -rr * 3 || q.y > 1080 + rr * 3) return;
      glow(ctx, q.x, q.y, Math.max(0.6, rr), color, a);
    };

    for (const d of store.parts) {
      if (d.kind === 'dust') {
        const n = d.n;
        for (let i = 0; i < n; i++) {
          const x = d.ox + (rnd(i, d.seed) - 0.5) * d.w + Math.sin(t * 0.5 * d.speed + i) * 20;
          const y0 = (rnd(i, d.seed + 1) - 0.5) * d.h + Math.cos(t * 0.4 * d.speed + i * 1.3) * 24 - t * 14 * d.speed * (0.3 + rnd(i, d.seed + 4));
          const yy = ((((y0 + d.h / 2) % d.h) + d.h) % d.h) - d.h / 2 + d.oy;
          const z = lerp(d.z0, d.z1, rnd(i, d.seed + 2)) + d.oz;
          const s = d.size * (0.4 + rnd(i, d.seed + 3) * 1.6);
          const tw2 = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.6 + i));
          dot([x, yy, z], s, d.color, d.opacity * tw2);
        }
      } else if (d.kind === 'burst') {
        const a = t - d.t0;
        if (a < 0 || a > d.life) continue;
        for (let i = 0; i < d.n; i++) {
          const ang = rnd(i, d.seed) * Math.PI * 2;
          const el = (rnd(i, d.seed + 1) - 0.5) * Math.PI;
          const v = d.power * (0.35 + rnd(i, d.seed + 2) * 0.8);
          const px = Math.cos(ang) * Math.cos(el) * v * a * (1 - 0.35 * a);
          const py = Math.sin(ang) * Math.cos(el) * v * a * (1 - 0.35 * a) + 0.5 * d.gravity * a * a;
          const pz = Math.sin(el) * v * a;
          const k = 1 - a / d.life;
          const s = d.size * (0.5 + rnd(i, d.seed + 3)) * k;
          dot([d.x + px, d.y + py, d.z + pz], Math.max(0.6, s), d.color, Math.min(1, k * 1.6));
        }
      } else if (d.kind === 'confetti') {
        const a = t - d.t0;
        if (a < 0 || a > d.life) continue;
        for (let i = 0; i < d.n; i++) {
          const ang = -Math.PI / 2 + (rnd(i, d.seed) - 0.5) * 2.2;
          const v = d.power * (0.4 + rnd(i, d.seed + 1) * 0.8);
          const px = Math.cos(ang) * v * a * Math.exp(-a * 0.9);
          const py = Math.sin(ang) * v * a * Math.exp(-a * 0.9) + 380 * a * a;
          const pz = (rnd(i, d.seed + 2) - 0.5) * 600 * a;
          const P: V3 = [d.x + px, d.y + py, d.z + pz];
          if (side(P[2]) !== layer) continue;
          const q = project(P);
          if (!q) continue;
          const k = clamp((d.life - a) / 0.6);
          ctx.save();
          ctx.translate(q.x, q.y);
          ctx.rotate(((rnd(i, d.seed + 5) * 360 + a * 120) * Math.PI) / 180);
          ctx.scale(q.s, q.s * Math.abs(Math.cos(a * (3 + rnd(i, d.seed + 3) * 8))));
          ctx.globalAlpha = k;
          ctx.fillStyle = d.colors[i % d.colors.length];
          ctx.fillRect(-9, -5, 18, 10);
          ctx.restore();
        }
      } else if (d.kind === 'beads') {
        const n = d.n;
        for (let i = 0; i <= n; i++) {
          const u = i / n;
          if (u > d.p) break;
          const f = d.tail < 1 ? 1 - (d.p - u) / d.tail : 1;
          if (d.tail < 1 && f < 0) continue;
          const pt = splineAt(d.pts, u);
          dot([pt[0] + d.ox, pt[1] + d.oy, pt[2] + d.oz], d.size * (0.6 + 0.6 * f), d.color, 0.25 + 0.75 * f, layer);
        }
        if (d.p > 0.002 && d.p < 0.998) {
          const h = splineAt(d.pts, d.p);
          const P: V3 = [h[0] + d.ox, h[1] + d.oy, h[2] + d.oz];
          const q = project(P);
          if (q) {
            const r = d.size * q.s;
            ctx.globalAlpha = 0.16;
            ctx.fillStyle = d.head;
            ctx.beginPath();
            ctx.arc(q.x, q.y, r * 7, 0, 7);
            ctx.fill();
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.arc(q.x, q.y, r * 3.6, 0, 7);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(q.x, q.y, r * 1.3, 0, 7);
            ctx.fill();
          }
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, pointerEvents: 'none'}} />;
};

/* ============ box e sfere: mini renderer 3D su canvas ============ */
const shade = (hex: string, k: number) => {
  const p = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f((p >> 16) & 255)},${f((p >> 8) & 255)},${f(p & 255)})`;
};

type Face = {n: V3; idx: number[]; kind: 'front' | 'side' | 'top' | 'bottom' | 'back'};
const FACES: Face[] = [
  {n: [0, 0, 1], idx: [4, 5, 7, 6], kind: 'front'},
  {n: [0, 0, -1], idx: [0, 2, 3, 1], kind: 'back'},
  {n: [1, 0, 0], idx: [1, 3, 7, 5], kind: 'side'},
  {n: [-1, 0, 0], idx: [0, 4, 6, 2], kind: 'side'},
  {n: [0, 1, 0], idx: [2, 6, 7, 3], kind: 'bottom'},
  {n: [0, -1, 0], idx: [0, 1, 5, 4], kind: 'top'},
];

export const BoxCanvas: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, 1920, 1080);
    const cam = store.cam;
    const items = store.boxes
      .map((b) => {
        const q = project(b.c);
        return {b, d: q ? q.zc : -1};
      })
      .filter((o) => o.d > 0)
      .sort((a, b) => b.d - a.d);

    for (const {b} of items) {
      if (b.kind === 'ball') {
        const q = project(b.c);
        if (!q) continue;
        const r = b.r * q.s * (b.sx ?? 1);
        const ry = b.r * q.s * (b.sy ?? 1);
        const g = ctx.createRadialGradient(q.x - r * 0.35, q.y - ry * 0.4, r * 0.1, q.x, q.y, Math.max(r, ry));
        g.addColorStop(0, shade(b.color, 1.35));
        g.addColorStop(0.45, shade(b.color, 1));
        g.addColorStop(1, shade(b.color, 0.5));
        ctx.globalAlpha = b.opacity ?? 1;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(q.x, q.y, r, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      // box
      const a = ((b.rz ?? 0) * Math.PI) / 180;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const verts: V3[] = [];
      for (let i = 0; i < 8; i++) {
        const lx = (i & 1 ? 0.5 : -0.5) * b.w;
        const ly = (i & 2 ? 0.5 : -0.5) * b.h;
        const lz = (i & 4 ? 0.5 : -0.5) * b.d;
        verts.push([b.c[0] + lx * ca - ly * sa, b.c[1] + lx * sa + ly * ca, b.c[2] + lz]);
      }
      const proj = verts.map((v) => project(v));
      if (proj.some((p) => !p)) continue;
      const faces = FACES.map((f) => {
        const nw: V3 = [f.n[0] * ca - f.n[1] * sa, f.n[0] * sa + f.n[1] * ca, f.n[2]];
        const fc: V3 = [0, 0, 0];
        f.idx.forEach((i) => {
          fc[0] += verts[i][0] / 4;
          fc[1] += verts[i][1] / 4;
          fc[2] += verts[i][2] / 4;
        });
        const toCam: V3 = [cam.x - fc[0], cam.y - fc[1], cam.z - fc[2]];
        const vis = nw[0] * toCam[0] + nw[1] * toCam[1] + nw[2] * toCam[2] > 0;
        const dist = Math.hypot(toCam[0], toCam[1], toCam[2]);
        return {f, vis, dist, nw};
      })
        .filter((o) => o.vis)
        .sort((x, y) => y.dist - x.dist);
      ctx.globalAlpha = b.opacity ?? 1;
      for (const {f, nw} of faces) {
        const col = f.kind === 'front' ? b.front : f.kind === 'top' ? b.top ?? b.front : b.side;
        let k = 1;
        if (f.kind === 'side') k = nw[0] > 0 ? 0.78 : 0.62;
        if (f.kind === 'bottom') k = 0.45;
        if (f.kind === 'back') k = 0.5;
        if (f.kind === 'top') k = b.top ? 1 : 1.12;
        const css = shade(col, k);
        ctx.fillStyle = css;
        ctx.strokeStyle = css;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        f.idx.forEach((i, j) => {
          const p = proj[i]!;
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (b.label && f.kind === 'front') {
          // etichetta sulla faccia frontale: interpolazione bilineare sul quadrilatero proiettato
          const q = f.idx.map((i) => proj[i]!); // [bl?] ordine: 4,5,7,6 -> (-x,-y)(+x,-y)(+x,+y)(-x,+y)
          const at = (u: number, v: number) => ({
            x: q[0].x * (1 - u) * (1 - v) + q[1].x * u * (1 - v) + q[2].x * u * v + q[3].x * (1 - u) * v,
            y: q[0].y * (1 - u) * (1 - v) + q[1].y * u * (1 - v) + q[2].y * u * v + q[3].y * (1 - u) * v,
          });
          const bar = (u0: number, u1: number, v0: number, v1: number, color: string, al: number) => {
            const a0 = at(u0, v0);
            const a1 = at(u1, v0);
            const a2 = at(u1, v1);
            const a3 = at(u0, v1);
            ctx.globalAlpha = (b.opacity ?? 1) * al;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(a0.x, a0.y);
            ctx.lineTo(a1.x, a1.y);
            ctx.lineTo(a2.x, a2.y);
            ctx.lineTo(a3.x, a3.y);
            ctx.closePath();
            ctx.fill();
          };
          const dark = ['#FFFFFF', '#CFE8EA', '#5FAFB4'].includes(String(b.front).toUpperCase());
          bar(0.18, 0.82, 0.2, 0.26, dark ? '#1B0A17' : '#FFFFFF', 0.85);
          bar(0.18, 0.56, 0.32, 0.36, dark ? '#1B0A17' : '#FFFFFF', 0.5);
          ctx.globalAlpha = b.opacity ?? 1;
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, pointerEvents: 'none'}} />;
};
