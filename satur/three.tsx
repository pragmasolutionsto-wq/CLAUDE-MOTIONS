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

// libera subito il contesto WebGL quando la scena esce (altrimenti dopo molte transizioni il browser non ne crea più)
const Release: React.FC = () => {
  const {gl} = useThree();
  useEffect(() => () => {
    gl.dispose();
    gl.forceContextLoss();
  }, [gl]);
  return null;
};

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
    <Release />
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
      <Release />
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

/* ------------------------------------------------------------------ notte: letto con persona che dorme */

const NightLights: React.FC<{dim?: number}> = ({dim = 1}) => (
  <>
    <ambientLight intensity={0.35 * dim} color={'#b9c8ff'} />
    <directionalLight position={[-5, 6, 4]} intensity={1.6 * dim} color={'#c9d6ff'} />
    <directionalLight position={[5, 2, 6]} intensity={0.8 * dim} color={'#ffd9c9'} />
    <pointLight position={[2, 3, 3]} intensity={10 * dim} color={'#ffe7b8'} />
  </>
);

const NightCanvas: React.FC<{w: number; h: number; z?: number; fov?: number; children: React.ReactNode}> = ({w, h, z = 12, fov = 32, children}) => (
  <ThreeCanvas width={w} height={h} camera={{fov, position: [0, 2.2, z]}} gl={{antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping}}>
    <Env i={0.35} />
    <Release />
    <NightLights />
    {children}
  </ThreeCanvas>
);

const RBox: React.FC<{args: [number, number, number]; r?: number; color: string; position?: [number, number, number]; rotation?: [number, number, number]; rough?: number}> = ({args, r = 0.2, color, position, rotation, rough = 0.6}) => {
  const geo = useMemo(() => {
    const [w, h, d] = args;
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2, rr = Math.min(r, w / 2, h / 2);
    s.moveTo(x + rr, y); s.lineTo(x + w - rr, y); s.quadraticCurveTo(x + w, y, x + w, y + rr); s.lineTo(x + w, y + h - rr); s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    s.lineTo(x + rr, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rr); s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y);
    const g = new THREE.ExtrudeGeometry(s, {depth: d - 2 * rr * 0.6, bevelEnabled: true, bevelThickness: rr * 0.6, bevelSize: rr * 0.6, bevelSegments: 5, curveSegments: 10});
    g.center();
    return g;
  }, [args[0], args[1], args[2], r]);
  return (
    <mesh geometry={geo} position={position} rotation={rotation}>
      <meshStandardMaterial color={color} roughness={rough} />
    </mesh>
  );
};

// letto visto di tre quarti, persona che dorme (testa + coperta che respira)
export const Bed3D: React.FC<{lt: number; w: number; h: number; breath?: (lt: number) => number; mood?: number}> = ({lt, w, h, breath, mood = 0}) => {
  const b = breath ? breath(lt) : Math.sin(lt * 2.2) * 0.5 + 0.5;
  const intro = eO3(prog(lt, 0, 0.8));
  const ry = lerp(-1.45, -1.12, intro) + Math.sin(lt * 0.4) * 0.04;
  const toss = mood * Math.sin(lt * 7) * 0.06;
  return (
    <NightCanvas w={w} h={h} z={13}>
      <group rotation={[0.42, ry, 0]} position={[-0.4, -1.3, 0]} scale={lerp(0.85, 1, intro) * 0.95}>
        <RBox args={[4.4, 0.7, 6.6]} r={0.25} color={'#e9dccd'} position={[0, 0, 0]} />
        <RBox args={[4.6, 2.2, 0.5]} r={0.25} color={'#2a6131'} position={[0, 0.9, -3.3]} />
        <RBox args={[4.2, 0.35, 6.2]} r={0.15} color={'#fbf4ec'} position={[0, 0.5, 0]} />
        <RBox args={[1.7, 0.45, 1.0]} r={0.22} color={'#f6cfc6'} position={[-0.9, 0.85, -2.3]} rotation={[0.15, 0, 0]} />
        <RBox args={[1.7, 0.45, 1.0]} r={0.22} color={'#ffffff'} position={[0.95, 0.85, -2.3]} rotation={[0.15, 0, 0]} />
        {/* testa che dorme */}
        <group position={[-0.85, 1.35 + toss, -2.05]} rotation={[0.35, 0.2 + toss, 0.15]}>
          <mesh scale={[0.62, 0.7, 0.62]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color={'#f0c4a8'} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.25, -0.12]} scale={[0.66, 0.55, 0.62]}>
            <sphereGeometry args={[1, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color={'#6b4a36'} roughness={0.7} />
          </mesh>
          {[-0.22, 0.22].map((x) => (
            <mesh key={x} position={[x, 0.02, 0.58]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.09, 0.022, 8, 16, Math.PI]} />
              <meshStandardMaterial color={'#4a3226'} />
            </mesh>
          ))}
        </group>
        {/* coperta che si alza e abbassa col respiro */}
        <group position={[0, 0.95, 0.75]} scale={[1, 1 + b * 0.18, 1]}>
          <RBox args={[4.3, 0.55, 4.6]} r={0.27} color={'#316c39'} rough={0.8} />
        </group>
        <RBox args={[4.32, 0.12, 0.9]} r={0.06} color={'#e6b7af'} position={[0, 1.28 + b * 0.05, -1.45]} />
        {/* comodino con abat-jour */}
        <RBox args={[1.3, 1.3, 1.3]} r={0.15} color={'#c49994'} position={[3.2, 0.1, -2.6]} />
        <mesh position={[3.2, 1.45, -2.6]}>
          <cylinderGeometry args={[0.35, 0.5, 0.6, 24]} />
          <meshStandardMaterial color={'#fff1dc'} emissive={'#ffd9a0'} emissiveIntensity={0.6} />
        </mesh>
      </group>
    </NightCanvas>
  );
};

/* ------------------------------------------------------------------ sveglia che trema */

export const Clock3D: React.FC<{lt: number; w: number; h: number; ring?: number}> = ({lt, w, h, ring = 1}) => {
  const p = spring(prog(lt, 0, 0.8) * 1.8);
  const sh = ring * Math.sin(lt * 55) * 0.08;
  const hand = lt * 0.3;
  return (
    <Canvas w={w} h={h} z={11}>
      <group scale={p} rotation={[0.1, -0.35 + Math.sin(lt * 0.8) * 0.1, sh]} position={[0, -0.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2, 2, 0.9, 64]} />
          <meshPhysicalMaterial color={PINK} roughness={0.3} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0, 0.46]}>
          <circleGeometry args={[1.75, 64]} />
          <meshStandardMaterial color={'#fffaf3'} roughness={0.5} />
        </mesh>
        {Array.from({length: 12}, (_, i) => (
          <mesh key={i} position={[Math.sin((i / 12) * Math.PI * 2) * 1.45, Math.cos((i / 12) * Math.PI * 2) * 1.45, 0.48]}>
            <circleGeometry args={[i % 3 === 0 ? 0.11 : 0.06, 16]} />
            <meshBasicMaterial color={GREEN_D} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.5]} rotation={[0, 0, -hand]}>
          <boxGeometry args={[0.12, 1.2, 0.04]} />
          <meshStandardMaterial color={GREEN_D} />
        </mesh>
        <mesh position={[0, 0, 0.52]} rotation={[0, 0, -hand * 12 - 1]}>
          <boxGeometry args={[0.08, 1.6, 0.04]} />
          <meshStandardMaterial color={GREEN} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 1.25, 1.95, -0.1]} rotation={[0, 0, -s * 0.5]}>
            <mesh>
              <sphereGeometry args={[0.62, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshPhysicalMaterial color={GREEN} roughness={0.25} clearcoat={1} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={'f' + s} position={[s * 1.3, -2.05, 0]} rotation={[0, 0, s * 0.4]}>
            <cylinderGeometry args={[0.12, 0.12, 0.6, 12]} />
            <meshStandardMaterial color={GREEN_D} />
          </mesh>
        ))}
      </group>
    </Canvas>
  );
};

/* ------------------------------------------------------------------ flusso sanguigno: globuli + bolle di O2 che calano, CO2 che sale */

export const Blood3D: React.FC<{lt: number; w: number; h: number; o2: number}> = ({lt, w, h, o2}) => {
  const r = rnd(5);
  const cells = useMemo(() => Array.from({length: 26}, () => ({x: (r() - 0.5) * 9, y: (r() - 0.5) * 14, z: (r() - 0.5) * 4, s: 0.45 + r() * 0.35, v: 0.8 + r() * 0.8, rot: r() * 6, kind: r()})), []);
  return (
    <Canvas w={w} h={h} z={12}>
      <group>
        {cells.map((c, i) => {
          const y = ((c.y + lt * c.v + 7) % 14) - 7;
          const isO2 = c.kind > 0.55;
          const isCO2 = c.kind < 0.25;
          if (isO2 || isCO2) {
            const show = isO2 ? clamp(o2 * 1.6 - (c.kind - 0.55) * 2) : clamp((1 - o2) * 1.8 - c.kind * 2);
            if (show <= 0.02) return null;
            return (
              <mesh key={i} position={[c.x, y, c.z]} scale={c.s * 0.55 * show}>
                <sphereGeometry args={[1, 24, 16]} />
                <meshPhysicalMaterial color={isO2 ? '#8fd3f2' : '#8a8f99'} roughness={0.1} transmission={0} clearcoat={1} emissive={isO2 ? '#3fa7d6' : '#2a2d33'} emissiveIntensity={0.5} />
              </mesh>
            );
          }
          return (
            <mesh key={i} position={[c.x, y, c.z]} rotation={[c.rot + lt * 0.6, c.rot, 0]} scale={[c.s, c.s, c.s * 0.45]}>
              <torusGeometry args={[0.7, 0.42, 16, 32]} />
              <meshPhysicalMaterial color={'#d9534f'} roughness={0.35} clearcoat={0.8} />
            </mesh>
          );
        })}
      </group>
    </Canvas>
  );
};

/* ------------------------------------------------------------------ saturimetro al dito (schermo senza numeri) */

export const Oximeter3D: React.FC<{lt: number; w: number; h: number; night?: boolean}> = ({lt, w, h, night}) => {
  const p = spring(prog(lt, 0, 0.9) * 1.8);
  const pulse = 0.5 + 0.5 * Math.pow(Math.max(0, Math.sin(lt * 7)), 6);
  const body = (
    <group scale={p * 0.95} rotation={[0.45, -0.18 + Math.sin(lt * 0.5) * 0.12, 0.06]} position={[-0.3, -0.4, 0]}>
      {/* dito */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.6, 0, 0]}>
        <capsuleGeometry args={[0.62, 4.2, 12, 32]} />
        <meshStandardMaterial color={'#f0c4a8'} roughness={0.5} />
      </mesh>
      <mesh position={[1.95, 0.3, 0]} rotation={[0, 0, -0.25]} scale={[0.5, 0.18, 0.5]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={'#f7d9cb'} roughness={0.3} />
      </mesh>
      {/* pinza */}
      <group position={[1.0, 0, 0]}>
        <RBox args={[2.2, 0.9, 1.7]} r={0.4} color={GREEN} position={[0, 0.72, 0]} rough={0.3} />
        <RBox args={[2.2, 0.75, 1.6]} r={0.35} color={'#fbf4ec'} position={[0, -0.7, 0]} rough={0.4} />
        <mesh position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.4, 0.95]} />
          <meshBasicMaterial color={night ? '#0f2614' : '#163a1c'} />
        </mesh>
        {/* cuore che pulsa sul display, nessuna cifra */}
        <mesh position={[0, 1.205, 0.05]} rotation={[-Math.PI / 2, 0, 0]} scale={0.22 + pulse * 0.06}>
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial color={PINK_HI} transparent opacity={0.6 + pulse * 0.4} />
        </mesh>
        <mesh position={[-1.25, -0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.4, 12]} />
          <meshStandardMaterial color={'#d9d2c8'} />
        </mesh>
      </group>
      <pointLight position={[1, 1.6, 0.5]} intensity={6 * pulse} color={'#ff8f8f'} distance={4} />
    </group>
  );
  return night ? <NightCanvas w={w} h={h} z={10}>{body}</NightCanvas> : <Canvas w={w} h={h} z={10}>{body}</Canvas>;
};

/* ------------------------------------------------------------------ cuore estruso che batte */

export const Heart3D: React.FC<{lt: number; w: number; h: number; warn?: number}> = ({lt, w, h, warn = 0}) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -1.4); s.bezierCurveTo(-0.4, -1.0, -2.0, -0.2, -2.0, 0.7); s.bezierCurveTo(-2.0, 1.6, -1.0, 2.0, -0.4, 1.7); s.bezierCurveTo(-0.15, 1.6, 0, 1.4, 0, 1.2);
    s.bezierCurveTo(0, 1.4, 0.15, 1.6, 0.4, 1.7); s.bezierCurveTo(1.0, 2.0, 2.0, 1.6, 2.0, 0.7); s.bezierCurveTo(2.0, -0.2, 0.4, -1.0, 0, -1.4);
    const g = new THREE.ExtrudeGeometry(s, {depth: 0.8, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.3, bevelSegments: 8, curveSegments: 24});
    g.center();
    return g;
  }, []);
  const p = spring(prog(lt, 0, 0.8) * 1.8);
  const beat = 1 + 0.07 * Math.pow(Math.max(0, Math.sin(lt * 6)), 8);
  const col = new THREE.Color('#e08b80').lerp(new THREE.Color('#d9534f'), warn);
  return (
    <Canvas w={w} h={h} z={11}>
      <group scale={p * beat} rotation={[0.1, Math.sin(lt * 0.9) * 0.4, 0]}>
        <mesh geometry={geo}>
          <meshPhysicalMaterial color={col} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} emissive={'#5a1010'} emissiveIntensity={0.15 + warn * 0.25} />
        </mesh>
      </group>
    </Canvas>
  );
};
