import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {Font, FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import {CREAM, GREEN, GREEN_D, MAUVE, PINK, PINK_HI, SAGE, clamp, eBack, eIO, eO3, lerp, prog, rnd, spring} from './util';

/* ------------------------------------------------------------------ comuni */

const Env: React.FC<{i?: number}> = ({i = 1}) => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = i;
  }, [gl, scene, i]);
  return null;
};

// luce calda morbida, controluce rosa e rimbalzo verde dal basso
const Canvas: React.FC<{w: number; h: number; fov?: number; z?: number; env?: number; children: React.ReactNode}> = ({w, h, fov = 30, z = 12, env = 1, children}) => (
  <ThreeCanvas width={w} height={h} camera={{fov, position: [0, 0, z]}} gl={{antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping}}>
    <Env i={env} />
    <ambientLight intensity={0.35} />
    <directionalLight position={[4, 6, 7]} intensity={2.3} color={'#fff1e2'} />
    <directionalLight position={[-6, -1, 3]} intensity={1.0} color={'#ffc9bd'} />
    <pointLight position={[0, -4, 4]} intensity={14} color={'#b9e3b5'} />
    {children}
  </ThreeCanvas>
);

let FONT: Font | null = null;
const useFont = () => {
  const [f, setF] = useState<Font | null>(FONT);
  const [h] = useState(() => (FONT ? null : delayRender('font3d')));
  useEffect(() => {
    if (FONT) return;
    new FontLoader().load(staticFile('font/mont900.json'), (ff) => {
      FONT = ff;
      setF(ff);
      if (h !== null) continueRender(h);
    });
  }, [h]);
  return f;
};

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

export type Mode = 'pink' | 'green' | 'cream';
const STOPS: Record<Mode, THREE.Color[]> = {
  pink: ['#f0aea2', '#d98579', '#b5655e'].map((c) => new THREE.Color(c)),
  green: ['#4f8f55', '#2a6131', '#174019'].map((c) => new THREE.Color(c)),
  cream: ['#ffffff', CREAM, '#f6dcd3'].map((c) => new THREE.Color(c)),
};
// gradiente lungo x come colori ai vertici
const paint = (g: THREE.BufferGeometry, mode: Mode, axis: 'x' | 'y' = 'x') => {
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const S = STOPS[mode];
  for (let i = 0; i < pos.count; i++) {
    const v = axis === 'x' ? (pos.getX(i) - bb.min.x) / Math.max(1e-6, bb.max.x - bb.min.x) : (pos.getY(i) - bb.min.y) / Math.max(1e-6, bb.max.y - bb.min.y);
    const s = clamp(v) * 2, k = Math.min(1, Math.floor(s));
    c.copy(S[k]).lerp(S[k + 1], s - k);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
};

/* ------------------------------------------------------------------ testo 3D estruso, lucido, gradiente brand */

export const Text3D: React.FC<{
  text: string; lt: number; w: number; h: number; size?: number; depth?: number; mode?: Mode;
  spin?: number; out?: number; wobble?: number;
}> = ({text, lt, w, h, size = 2.2, depth = 0.7, mode = 'pink', spin = 1, out = 0, wobble = 1}) => {
  const font = useFont();
  const geo = useMemo(() => {
    if (!font) return null;
    const g = new TextGeometry(text, {font, size, depth, curveSegments: 6, bevelEnabled: true, bevelThickness: depth * 0.2, bevelSize: size * 0.03, bevelSegments: 4});
    g.center();
    return paint(g, mode);
  }, [font, text, size, depth, mode]);
  if (!geo) return null;
  const p = prog(lt, 0, 0.9);
  const s = spring(p * 1.8);
  const o = eO3(out);
  const ry = lerp(-1.9 * spin, 0, s) + Math.sin(lt * 1.3) * 0.2 * wobble * clamp(lt - 0.6) + o * 1.4;
  const rx = lerp(0.9, 0, s) + Math.sin(lt * 0.9 + 1) * 0.07 * wobble;
  const sc = lerp(0.2, 1, eBack(clamp(p * 1.25), 1.4)) * (1 - o * 0.6);
  const z = lerp(-14, 0, eO3(clamp(p * 1.4))) + o * 6;
  return (
    <Canvas w={w} h={h} env={0.55}>
      <group position={[0, 0, z]} rotation={[rx, ry, 0]} scale={sc}>
        <mesh geometry={geo}>
          <meshPhysicalMaterial vertexColors metalness={0.05} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} emissive={mode === 'green' ? '#0b2a10' : '#2a1410'} emissiveIntensity={0.25} />
        </mesh>
      </group>
    </Canvas>
  );
};

/* ------------------------------------------------------------------ logo: marchio a strati (texture) che gira e si posa */

export const Logo3D: React.FC<{lt: number; w: number; h: number; scale?: number}> = ({lt, w, h, scale = 1}) => {
  const tex = useTex('logo/mark.png');
  const layers = 24;
  const p = prog(lt, 0, 1.2);
  const s = spring(p * 1.8);
  const ry = lerp(-3.1, 0, s) + Math.sin(Math.max(0, lt - 1.1) * 1.2) * 0.3 * clamp(lt - 1.1);
  if (!tex) return null;
  const img = tex.image as HTMLImageElement;
  const ar = img.height / img.width;
  return (
    <ThreeCanvas width={w} height={h} camera={{fov: 30, position: [0, 0, 8]}} gl={{antialias: true, alpha: true}}>
      <group rotation={[0, ry, 0]} scale={lerp(0.3, 1, eBack(clamp(p * 1.3), 1.3)) * scale} position={[0, Math.sin(lt * 1.6) * 0.05, 0]}>
        {Array.from({length: layers}, (_, i) => {
          const front = i === layers - 1;
          const col = front ? '#ffffff' : '#' + new THREE.Color('#2f6a37').lerp(new THREE.Color('#14341a'), 0.7 - (i / layers) * 0.6).getHexString();
          return (
            <mesh key={i} position={[0, 0, (i - layers) * 0.012]}>
              <planeGeometry args={[2.2, 2.2 * ar]} />
              <meshBasicMaterial map={tex} color={col} transparent alphaTest={0.5} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};

/* ------------------------------------------------------------------ ciclo del capello: pelle in sezione con 3 follicoli */

// fusto del capello come tubo lungo una curva leggermente ondulata
const strand = (len: number, bend: number, r = 0.16) => {
  const pts = Array.from({length: 8}, (_, i) => {
    const u = i / 7;
    return new THREE.Vector3(Math.sin(u * 2.2) * bend * u, u * Math.max(0.05, len), 0);
  });
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 10, false);
  return g;
};

export const Follicles3D: React.FC<{t: number; a: number; cues: [number, number, number]; w: number; h: number}> = ({t, a, cues, w, h}) => {
  const lt = t - a;
  const [g, r, f] = cues;
  const grow = eIO(prog(t, g - 0.2, g + 1.4));
  const fall = eIO(prog(t, f - 0.15, f + 1.2));
  const hi = (c: number) => Math.exp(-Math.pow((t - c - 0.2) / 0.35, 2));
  const geos = useMemo(() => [strand(lerp(1.1, 4.1, grow), 0.5), strand(2.3, -0.35), strand(2.6, 0.4)], [grow]);
  const intro = spring(prog(lt, 0, 0.8) * 1.8);
  const roty = lerp(-0.9, -0.28, eO3(prog(lt, 0, 1.2))) + Math.sin(lt * 0.6) * 0.06;
  const xs = [-2.3, 0, 2.3];
  const bulbs = [0.42 + 0.06 * Math.sin(lt * 5), 0.3, 0.26 * (1 - fall * 0.4)];
  const hl = [hi(g), hi(r), hi(f)];
  return (
    <Canvas w={w} h={h} z={17} fov={32} env={0.45}>
      <group rotation={[0.32, roty, 0]} scale={intro * 1.05} position={[0, -0.6, 0]}>
        {/* pelle: strati rosa */}
        <mesh position={[0, -1.1, 0]}>
          <boxGeometry args={[7.6, 2.2, 2.4]} />
          <meshStandardMaterial color={'#d98f84'} roughness={0.55} transparent opacity={0.88} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[7.7, 0.14, 2.45]} />
          <meshStandardMaterial color={'#e9a99f'} roughness={0.4} />
        </mesh>
        {xs.map((x, i) => {
          const dy = i === 2 ? fall * 3.6 : 0;
          const dx = i === 2 ? fall * 1.4 : 0;
          const rz = i === 2 ? -fall * 0.9 : 0;
          const op = i === 2 ? 1 - prog(fall, 0.75, 1) : 1;
          const e = hl[i];
          return (
            <group key={i}>
              {/* bulbo */}
              <mesh position={[x, -1.25, 0]} scale={[bulbs[i] * 1.6 * (1 + e * 0.25), bulbs[i] * 2.1 * (1 + e * 0.25), bulbs[i] * 1.6]}>
                <sphereGeometry args={[1, 28, 20]} />
                <meshPhysicalMaterial color={i === 0 ? '#e58b7e' : i === 1 ? MAUVE : '#b98e89'} roughness={0.25} clearcoat={1} emissive={'#ff9a7a'} emissiveIntensity={e * 0.7} />
              </mesh>
              {/* canale */}
              <mesh position={[x, -0.55, 0]}>
                <cylinderGeometry args={[0.14, 0.2, 1.3, 16]} />
                <meshStandardMaterial color={'#c98b84'} roughness={0.6} transparent opacity={0.6} />
              </mesh>
              {/* capello */}
              <group position={[x + dx, -1.15 + dy, 0]} rotation={[0, 0, rz]}>
                <mesh geometry={geos[i]}>
                  <meshStandardMaterial color={'#4e2a16'} roughness={0.35} transparent opacity={op} emissive={'#7a3a1a'} emissiveIntensity={e * 0.9} />
                </mesh>
              </group>
              {/* anello di evidenza */}
              <mesh position={[x, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1 + e * 0.4}>
                <torusGeometry args={[0.55, 0.05 * e + 0.001, 10, 48]} />
                <meshBasicMaterial color={i === 0 ? SAGE : i === 1 ? '#ffffff' : PINK_HI} transparent opacity={e} />
              </mesh>
            </group>
          );
        })}
      </group>
    </Canvas>
  );
};

/* ------------------------------------------------------------------ capsule e compresse che orbitano */

const capsuleGeo = (() => {
  const g = new THREE.CapsuleGeometry(0.32, 0.8, 8, 20);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const a = new THREE.Color(GREEN), b = new THREE.Color(PINK_HI);
  for (let i = 0; i < pos.count; i++) {
    const c = pos.getY(i) > 0 ? a : b;
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
})();

export const Capsules3D: React.FC<{lt: number; w: number; h: number; n?: number}> = ({lt, w, h, n = 9}) => {
  const r = rnd(11);
  const items = useMemo(() => Array.from({length: n}, (_, i) => ({ph: (i / n) * Math.PI * 2, rad: 2.2 + r() * 1.6, y: (r() - 0.5) * 3.4, sp: 0.5 + r() * 0.5, rot: r() * 6, pill: i % 3 === 2})), [n]);
  const intro = eBack(prog(lt, 0, 0.9), 1.3);
  return (
    <Canvas w={w} h={h} z={13}>
      <group rotation={[0.25, 0, 0.08]} scale={intro}>
        {items.map((it, i) => {
          const a = it.ph + lt * it.sp;
          return (
            <mesh key={i} geometry={it.pill ? undefined : capsuleGeo} position={[Math.cos(a) * it.rad, it.y + Math.sin(lt * 1.2 + i) * 0.15, Math.sin(a) * it.rad]} rotation={[it.rot + lt * 0.8, it.rot * 0.5 + lt * 0.6, it.rot]}>
              {it.pill && <cylinderGeometry args={[0.42, 0.42, 0.22, 32]} />}
              {it.pill ? <meshPhysicalMaterial color={CREAM} roughness={0.25} clearcoat={1} /> : <meshPhysicalMaterial vertexColors roughness={0.15} clearcoat={1} clearcoatRoughness={0.1} />}
            </mesh>
          );
        })}
      </group>
    </Canvas>
  );
};
