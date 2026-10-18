import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import optimer from 'three/examples/fonts/optimer_bold.typeface.json';
import {BLUE, GOLD, NAVY, SAGE, TEAL, TEAL_HI, clamp, eBack, eIO, eO3, eO5, lerp, prog, rnd, spring} from './util';

const MONT = "'Montserrat', 'Helvetica Neue', sans-serif";

const useTex = (file: string) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('tex ' + file));
  useEffect(() => {
    new THREE.TextureLoader().load(staticFile(file), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(t);
      continueRender(h);
    });
  }, [file, h]);
  return tex;
};

const glowTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.25, 'rgba(255,255,255,0.45)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();

const Lights: React.FC<{rim?: string}> = ({rim = TEAL_HI}) => (
  <>
    <ambientLight intensity={0.55} />
    <directionalLight position={[3, 5, 6]} intensity={2.4} />
    <directionalLight position={[-4, -2, 3]} intensity={0.6} color="#cfe9ff" />
    <pointLight position={[-3, 2, -3]} intensity={40} color={rim} />
  </>
);

/* ------------------------------------------------------------------ collagene: tripla elica che si sfalda */

class Helix extends THREE.Curve<THREE.Vector3> {
  constructor(private ph: number, private r = 0.62, private h = 9, private turns = 3.2) {
    super();
  }
  getPoint(u: number, target = new THREE.Vector3()) {
    const a = this.ph + u * Math.PI * 2 * this.turns;
    return target.set(Math.cos(a) * this.r, (u - 0.5) * this.h, Math.sin(a) * this.r);
  }
}

class SubCurve extends THREE.Curve<THREE.Vector3> {
  constructor(private c: THREE.Curve<THREE.Vector3>, private u0: number, private u1: number) {
    super();
  }
  getPoint(u: number, target = new THREE.Vector3()) {
    return this.c.getPoint(lerp(this.u0, this.u1, u), target);
  }
}

export const Collagen: React.FC<{lt: number; brk: number; w: number; h: number}> = ({lt, brk, w, h}) => {
  const pieces = useMemo(() => {
    const r = rnd(5);
    const out: {geo: THREE.TubeGeometry; col: string; dir: THREE.Vector3; del: number; mid: THREE.Vector3}[] = [];
    const cols = [TEAL, BLUE, TEAL_HI];
    for (let s = 0; s < 3; s++) {
      const hx = new Helix((s * Math.PI * 2) / 3);
      const N = 22;
      for (let i = 0; i < N; i++) {
        const u0 = i / N + 0.004, u1 = (i + 1) / N - 0.004;
        const mid = hx.getPoint((u0 + u1) / 2);
        out.push({
          geo: new THREE.TubeGeometry(new SubCurve(hx, u0, u1), 16, 0.15, 14, false),
          col: cols[s],
          dir: new THREE.Vector3(mid.x * 2 + (r() - 0.5) * 2.4, (r() - 0.5) * 1.6, mid.z * 2 + (r() - 0.5) * 2.4),
          del: r() * 0.55,
          mid,
        });
      }
    }
    return out;
  }, []);
  const motes = useMemo(() => {
    const r = rnd(9);
    return Array.from({length: 46}, () => ({p: [(r() - 0.5) * 7, (r() - 0.5) * 12, -2 - r() * 5], s: 0.04 + r() * 0.09, sp: 0.2 + r() * 0.5}));
  }, []);
  const grey = new THREE.Color('#9fb3bd');
  return (
    <ThreeCanvas width={w} height={h} camera={{fov: 34, position: [0, 0, 9.5]}} gl={{antialias: true, alpha: true}}>
      <Lights />
      <group rotation={[0.18, lt * 0.9 + 0.4, -0.38]} scale={lerp(1.25, 1.0, eO3(prog(lt, 0, 1.2)))} position={[0, lerp(-0.6, 0.15, eIO(prog(lt, 0, 3.2))), 0]}>
        {pieces.map((p, i) => {
          const b = eO3(prog(lt, brk + p.del, brk + p.del + 0.75));
          const c = new THREE.Color(p.col).lerp(grey, b * 0.85);
          return (
            <mesh key={i} geometry={p.geo} position={[p.dir.x * b * 0.55, p.dir.y * b * 0.55 - b * 0.4, p.dir.z * b * 0.55]} scale={1 - b * 0.45}>
              <meshPhysicalMaterial color={c} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} transparent opacity={1 - b * 0.7} />
            </mesh>
          );
        })}
      </group>
      {motes.map((m, i) => (
        <mesh key={'m' + i} position={[m.p[0], m.p[1] + lt * m.sp, m.p[2]]}>
          <sphereGeometry args={[m.s, 12, 12]} />
          <meshStandardMaterial color={TEAL_HI} transparent opacity={0.55} />
        </mesh>
      ))}
    </ThreeCanvas>
  );
};

/* ------------------------------------------------------------------ 192 LED */

export const LED_COLS = 12;
export const LED_ROWS = 16;
export const ledOn = (lt: number, i: number) => {
  const cx = (LED_COLS - 1) / 2, cy = (LED_ROWS - 1) / 2;
  const x = i % LED_COLS, y = Math.floor(i / LED_COLS);
  const d = Math.hypot(x - cx, (y - cy) * 0.8);
  return prog(lt, 0.25 + d * 0.11, 0.42 + d * 0.11);
};

export const LedPanel: React.FC<{lt: number; w: number; h: number}> = ({lt, w, h}) => {
  const g = glowTex();
  const sp = 0.3;
  const leds = useMemo(() => Array.from({length: LED_COLS * LED_ROWS}, (_, i) => i), []);
  const cam = eIO(prog(lt, 0, 2.9));
  return (
    <ThreeCanvas width={w} height={h} camera={{fov: 36, position: [0, 0, 14.5]}} gl={{antialias: true, alpha: true}}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 4, 6]} intensity={1.6} />
      <pointLight position={[0, 0, 3]} intensity={9} color={TEAL_HI} />
      <group rotation={[lerp(-0.75, -0.22, cam), lerp(0.55, -0.18, cam), lerp(0.12, 0, cam)]} position={[0, lerp(-0.6, -0.1, cam), lerp(1.2, -1.2, cam)]}>
        <mesh position={[0, 0, -0.12]}>
          <boxGeometry args={[LED_COLS * sp + 0.5, LED_ROWS * sp + 0.5, 0.18]} />
          <meshStandardMaterial color={'#0d2236'} roughness={0.35} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[LED_COLS * sp + 0.62, LED_ROWS * sp + 0.62, 0.05]} />
          <meshStandardMaterial color={TEAL} roughness={0.3} metalness={0.6} />
        </mesh>
        {leds.map((i) => {
          const x = ((i % LED_COLS) - (LED_COLS - 1) / 2) * sp;
          const y = (Math.floor(i / LED_COLS) - (LED_ROWS - 1) / 2) * sp;
          const on = ledOn(lt, i);
          const fl = 0.85 + 0.15 * Math.sin(lt * 9 + i * 1.7);
          const col = new THREE.Color('#1b3346').lerp(new THREE.Color(i % 5 === 0 ? '#ff6b5e' : '#7ff3ee'), on);
          return (
            <group key={i} position={[x, y, 0.05]}>
              <mesh scale={[1, 1, 0.55]}>
                <sphereGeometry args={[0.12, 14, 10]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={on * 1.1 * fl} roughness={0.2} />
              </mesh>
              {on > 0.01 && (
                <mesh position={[0, 0, 0.1]}>
                  <planeGeometry args={[0.72, 0.72]} />
                  <meshBasicMaterial map={g} color={col} transparent opacity={on * 0.42 * fl} blending={THREE.AdditiveBlending} depthWrite={false} />
                </mesh>
              )}
            </group>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};

/* ------------------------------------------------------------------ UNIKA in 3D */

const font = new FontLoader().parse(optimer as never);

export const UnikaTitle: React.FC<{lt: number; w: number; h: number}> = ({lt, w, h}) => {
  const letters = useMemo(() => {
    const out: {geo: THREE.BufferGeometry; x: number}[] = [];
    let x = 0;
    for (const ch of 'UNIKA') {
      const geo = new TextGeometry(ch, {font, size: 1, depth: 0.34, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 4});
      geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      const cw = bb.max.x - bb.min.x;
      geo.translate(-bb.min.x - cw / 2, -0.5, -0.17);
      out.push({geo, x: x + cw / 2});
      x += cw + 0.1;
    }
    out.forEach((l) => (l.x -= (x - 0.1) / 2));
    return out;
  }, []);
  const sweep = lerp(-7, 7, eIO(prog(lt, 0.7, 2.0)));
  return (
    <ThreeCanvas width={w} height={h} camera={{fov: 30, position: [0, 0, 7.6]}} gl={{antialias: true, alpha: true}}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 6]} intensity={2.0} />
      <pointLight position={[sweep, 0.6, 2.2]} intensity={45} color="#ffffff" />
      <pointLight position={[-4, -2, -2]} intensity={30} color={TEAL_HI} />
      <group rotation={[0.08 + Math.sin(lt * 1.3) * 0.04, Math.sin(lt * 0.9) * 0.16, 0]}>
        {letters.map((l, i) => {
          const p = prog(lt, i * 0.07, i * 0.07 + 0.9);
          const s = spring(p * 1.4, 8, 5);
          return (
            <mesh key={i} geometry={l.geo} position={[l.x, lerp(-1.2, 0, eO5(p)), lerp(-9, 0, s)]} rotation={[lerp(1.2, 0, s), lerp(-1.6, 0, s), 0]}>
              <meshPhysicalMaterial attach="material-0" color={WHITE_ish} roughness={0.18} clearcoat={1} />
              <meshPhysicalMaterial attach="material-1" color={BLUE} roughness={0.3} metalness={0.3} clearcoat={0.6} />
            </mesh>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};
const WHITE_ish = '#f4fbfc';

/* ------------------------------------------------------------------ offerta: 5 gettoni, uno diventa omaggio */

const coinFace = (label: string, sub: string, bg: string, fg: string) => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = fg;
  g.globalAlpha = 0.35;
  g.lineWidth = 10;
  g.beginPath();
  g.arc(256, 256, 214, 0, Math.PI * 2);
  g.stroke();
  g.globalAlpha = 1;
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${sub ? 190 : 250}px ${MONT}`;
  g.fillText(label, 256, sub ? 225 : 268);
  if (sub) {
    g.font = `800 58px ${MONT}`;
    g.fillText(sub, 256, 370);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.center.set(0.5, 0.5);
  t.rotation = Math.PI / 2;
  return t;
};

export const OfferCoins: React.FC<{lt: number; flipAt: number; w: number; h: number}> = ({lt, flipAt, w, h}) => {
  const faces = useMemo(() => [1, 2, 3, 4, 5].map((n) => coinFace(String(n), '', '#ffffff', BLUE)), []);
  const gift = useMemo(() => coinFace('1', 'OMAGGIO', GOLD, '#5a3d0c'), []);
  const fp = prog(lt, flipAt - 0.15, flipAt + 0.6);
  return (
    <ThreeCanvas width={w} height={h} camera={{fov: 32, position: [0, 0, 10]}} gl={{antialias: true, alpha: true}}>
      <Lights rim="#ffffff" />
      <group rotation={[0, 0, lt * 0.25]}>
        {faces.map((tex, i) => {
          const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
          const p = spring(prog(lt, 0.25 + i * 0.16, 0.25 + i * 0.16 + 1.1) * 1.3, 8, 4.5);
          const R = 1.08;
          const hero = i === 4;
          const hp = hero ? eIO(fp) : 0;
          const x = lerp(Math.cos(a) * R, 0, hp), y = lerp(Math.sin(a) * R, 0, hp);
          const sc = p * lerp(0.8, 1.75, hp) * (hero ? 1 : 0.8 - eO3(fp) * 0.15);
          return (
            <group key={i} position={[x, y, lerp(-6, 0, p) + hp * 2]} rotation={[0, 0, -lt * 0.25 * (1 - hp) - lt * 0.25 * hp]} scale={sc}>
              <group rotation={[Math.PI / 2 + Math.sin(lt * 2 + i) * 0.12, 0, (1 - p) * 2 + hp * Math.PI * 2]}>
                <mesh>
                  <cylinderGeometry args={[0.62, 0.62, 0.16, 64]} />
                  <meshPhysicalMaterial attach="material-0" color={hero && fp > 0.5 ? GOLD : TEAL} metalness={0.5} roughness={0.25} clearcoat={1} />
                  <meshPhysicalMaterial attach="material-1" map={hero && fp > 0.5 ? gift : tex} roughness={0.3} clearcoat={0.8} />
                  <meshPhysicalMaterial attach="material-2" color={TEAL} />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};

/* ------------------------------------------------------------------ logo "estruso": strati del marchio impilati */

export const Logo3D: React.FC<{lt: number; w: number; h: number}> = ({lt, w, h}) => {
  const tex = useTex('logo/mark.png');
  const layers = 22;
  const p = prog(lt, 0, 1.3);
  const s = spring(p * 1.3, 7, 4.2);
  const ry = lerp(-2.6, 0, s) + Math.sin(Math.max(0, lt - 0.9) * 1.6) * 0.32 * clamp(lt - 0.9);
  if (!tex) return null;
  return (
    <ThreeCanvas width={w} height={h} camera={{fov: 30, position: [0, 0, 8]}} gl={{antialias: true, alpha: true}}>
      <group rotation={[0.1 * (1 - s) + Math.sin(lt * 1.1) * 0.05, ry, 0]} scale={lerp(0.3, 1, eBack(clamp(p * 1.25)))}>
        {Array.from({length: layers}, (_, i) => {
          const front = i === layers - 1;
          const k = i / (layers - 1);
          const col = front ? '#ffffff' : new THREE.Color(SAGE).lerp(new THREE.Color(NAVY), 0.55 - k * 0.35);
          return (
            <mesh key={i} position={[0, 0, (i - layers) * 0.013]}>
              <planeGeometry args={[2.6, 2.6 * (351 / 334)]} />
              <meshBasicMaterial map={tex} color={col} transparent alphaTest={0.5} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};

