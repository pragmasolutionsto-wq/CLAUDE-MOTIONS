/** Stato condiviso per frame: camera + elenchi di particelle/box registrati durante il render. */
export const PERSP = 1600;
export type V3 = [number, number, number];

export type CamState = {x: number; y: number; z: number; rx: number; ry: number; rz: number};
export const store = {
  cam: {x: 0, y: 0, z: PERSP, rx: 0, ry: 0, rz: 0} as CamState,
  t: 0,
  parts: [] as any[],
  boxes: [] as any[],
};

export const resetStore = (cam: CamState, t: number) => {
  store.cam = cam;
  store.t = t;
  store.parts = [];
  store.boxes = [];
};

const D = Math.PI / 180;

/** proietta un punto del mondo sullo schermo (stessa matrice del CSS 3D) */
export const project = (P: V3, cam: CamState = store.cam) => {
  let x = P[0] - cam.x;
  let y = P[1] - cam.y;
  let z = P[2] - cam.z + PERSP;
  // rotateY(-ry)
  const cy = Math.cos(-cam.ry * D);
  const sy = Math.sin(-cam.ry * D);
  let x1 = x * cy + z * sy;
  let z1 = -x * sy + z * cy;
  // rotateX(-rx)
  const cx = Math.cos(-cam.rx * D);
  const sx = Math.sin(-cam.rx * D);
  let y1 = y * cx - z1 * sx;
  let z2 = y * sx + z1 * cx;
  // rotateZ(-rz)
  const cz = Math.cos(-cam.rz * D);
  const sz = Math.sin(-cam.rz * D);
  const x2 = x1 * cz - y1 * sz;
  const y2 = x1 * sz + y1 * cz;
  const den = PERSP - z2;
  if (den < 40) return null; // dietro la camera
  const s = PERSP / den;
  return {x: 960 + x2 * s, y: 540 + y2 * s, s, zc: den};
};
