import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {Font, FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {CYAN, GREEN, LIME, YEL, clamp, eBack, eO3, lerp, prog, spring} from './util';

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

const Canvas: React.FC<{w: number; h: number; fov?: number; z?: number; children: React.ReactNode}> = ({w, h, fov = 30, z = 12, children}) => (
  <ThreeCanvas width={w} height={h} camera={{fov, position: [0, 0, z]}} gl={{antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping}}>
    <Env />
    <ambientLight intensity={0.3} />
    <directionalLight position={[4, 6, 7]} intensity={2.2} />
    <directionalLight position={[-6, -2, 3]} intensity={0.9} color={'#7fe8ff'} />
    <pointLight position={[0, -4, 4]} intensity={18} color={'#d4ff5a'} />
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

// gradiente del logo lungo x (giallo → lime → verde → ciano) come colori ai vertici
const STOPS = [YEL, LIME, GREEN, CYAN].map((c) => new THREE.Color(c));
const paint = (g: THREE.BufferGeometry, mode: 'grad' | 'white' | 'cyan') => {
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const u = clamp((pos.getX(i) - bb.min.x) / Math.max(1e-6, bb.max.x - bb.min.x));
    if (mode === 'grad') {
      const s = u * 3, k = Math.min(2, Math.floor(s));
      c.copy(STOPS[k]).lerp(STOPS[k + 1], s - k);
    } else if (mode === 'cyan') c.set('#bff3ff').lerp(new THREE.Color(CYAN), 0.15 + 0.5 * u);
    else c.set('#ffffff');
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
};

const textGeo = (font: Font, text: string, size: number, depth: number) => {
  const parts: THREE.BufferGeometry[] = [];
  // ≠ non c'è nel font: "=" + barra obliqua
  if (text === '≠') {
    const eq = new TextGeometry('=', {font, size, depth, curveSegments: 10, bevelEnabled: true, bevelThickness: depth * 0.18, bevelSize: size * 0.02, bevelSegments: 4});
    eq.computeBoundingBox();
    const bb = eq.boundingBox!;
    const cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2;
    const bar = new THREE.BoxGeometry(size * 0.16, size * 1.05, depth * 1.2, 1, 1, 1);
    bar.rotateZ(-0.5);
    bar.translate(cx, cy, depth / 2);
    parts.push(eq.toNonIndexed(), bar.toNonIndexed());
    const g = mergeGeometries(parts)!;
    g.computeVertexNormals();
    return g;
  }
  return new TextGeometry(text, {font, size, depth, curveSegments: 10, bevelEnabled: true, bevelThickness: depth * 0.18, bevelSize: size * 0.025, bevelSegments: 5});
};

/* ------------------------------------------------------------------ testo 3D estruso, lucido, gradiente brand */

export const Text3D: React.FC<{
  text: string; lt: number; w: number; h: number; size?: number; depth?: number; mode?: 'grad' | 'white' | 'cyan';
  spin?: number; out?: number; wobble?: number;
}> = ({text, lt, w, h, size = 2.2, depth = 0.7, mode = 'grad', spin = 1, out = 0, wobble = 1}) => {
  const font = useFont();
  const geo = useMemo(() => {
    if (!font) return null;
    const g = textGeo(font, text, size, depth);
    g.center();
    return paint(g, mode);
  }, [font, text, size, depth, mode]);
  if (!geo) return null;
  const p = prog(lt, 0, 0.9);
  const s = spring(p * 1.8);
  const o = eO3(out);
  const ry = lerp(-1.9 * spin, 0, s) + Math.sin(lt * 1.3) * 0.22 * wobble * clamp(lt - 0.6) + o * 1.4;
  const rx = lerp(0.9, 0, s) + Math.sin(lt * 0.9 + 1) * 0.08 * wobble;
  const sc = lerp(0.2, 1, eBack(clamp(p * 1.25), 1.4)) * (1 - o * 0.6);
  const z = lerp(-14, 0, eO3(clamp(p * 1.4))) + o * 6;
  return (
    <Canvas w={w} h={h}>
      <group position={[0, 0, z]} rotation={[rx, ry, 0]} scale={sc}>
        <mesh geometry={geo}>
          <meshPhysicalMaterial vertexColors metalness={0.25} roughness={0.18} clearcoat={1} clearcoatRoughness={0.08} emissive={mode === 'white' ? '#0a3a50' : '#000000'} />
        </mesh>
      </group>
    </Canvas>
  );
};

/* ------------------------------------------------------------------ logo: croce a strati (texture) che gira e si posa */

export const Logo3D: React.FC<{lt: number; w: number; h: number}> = ({lt, w, h}) => {
  const tex = useTex('logo/mark.png');
  const layers = 22;
  const p = prog(lt, 0, 1.2);
  const s = spring(p * 1.8);
  const ry = lerp(-3.1, 0, s) + Math.sin(Math.max(0, lt - 1.1) * 1.3) * 0.28 * clamp(lt - 1.1);
  if (!tex) return null;
  const img = tex.image as HTMLImageElement;
  const ar = img.height / img.width;
  return (
    <ThreeCanvas width={w} height={h} camera={{fov: 30, position: [0, 0, 8]}} gl={{antialias: true, alpha: true}}>
      <group rotation={[0, ry, 0]} scale={lerp(0.3, 1, eBack(clamp(p * 1.3), 1.3))}>
        {Array.from({length: layers}, (_, i) => {
          const front = i === layers - 1;
          const col = front ? '#ffffff' : '#' + new THREE.Color('#0a5a74').lerp(new THREE.Color('#06374a'), 0.6 - (i / layers) * 0.5).getHexString();
          return (
            <mesh key={i} position={[0, 0, (i - layers) * 0.013]}>
              <planeGeometry args={[2.4, 2.4 * ar]} />
              <meshBasicMaterial map={tex} color={col} transparent alphaTest={0.5} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};
