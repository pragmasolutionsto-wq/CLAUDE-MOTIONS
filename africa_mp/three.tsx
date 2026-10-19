import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {AUTUMN, FOREST, MINT, MINT_HI, MONT, ANTON, PETROL, PETROL_D, SAGE, WARM, clamp, eBack, eIO, eO3, eO5, lerp, prog, rnd, soft} from './util';

/* ------------------------------------------------------------------ comuni */

// riflessi morbidi da "studio": dà il look vetro/lucido delle loro storie
const Env: React.FC<{i?: number}> = ({i = 1}) => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = i;
  }, [gl, scene, i]);
  return null;
};

const Canvas: React.FC<{w: number; h: number; fov?: number; z?: number; y?: number; children: React.ReactNode}> = ({w, h, fov = 32, z = 10, y = 0, children}) => (
  <ThreeCanvas width={w} height={h} camera={{fov, position: [0, y, z]}} gl={{antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping}}>
    <Env />
    <ambientLight intensity={0.35} />
    <directionalLight position={[3, 6, 6]} intensity={1.8} />
    <directionalLight position={[-5, -1, 3]} intensity={0.5} color={'#d9fff4'} />
    {children}
  </ThreeCanvas>
);

const glass = (c: string, o = 1) => ({color: c, roughness: 0.12, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.08, transparent: o < 1, opacity: o});

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

const label = (lines: string[], bg: string, fg: string, w = 512, h = 512, size = 120) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  lines.forEach((l, i) => {
    g.font = i === 0 ? `400 ${size}px ${ANTON}` : `700 ${size * 0.34}px ${MONT}`;
    g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 0.9);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/* ------------------------------------------------------------------ ciclo del capello */

// sezione di cute stilizzata con un follicolo: cresce → si ferma → cade, poi riparte
export const HairCycle: React.FC<{lt: number; grow: number; stop: number; fall: number; w: number; h: number}> = ({lt, grow, stop, fall, w, h}) => {
  const intro = eO5(prog(lt, 0, 1.0));
  const g = eIO(prog(lt, grow - 0.4, stop));
  const st = eO3(prog(lt, stop, stop + 0.5));
  const f = prog(lt, fall, fall + 1.4);
  const regrow = eO3(prog(lt, fall + 0.5, fall + 1.6));
  const L = lerp(0.9, 2.9, g);
  const bulbR = lerp(0.36, 0.22, st) * (1 - f * 0.2) + regrow * 0.12;
  const glow = (1 - st) * (0.6 + 0.4 * Math.sin(lt * 6)) * 0.9 + regrow * 0.6;
  const ringA = lt * 1.1;
  const ringV = eO3(prog(lt, 0.3, 1.0)) * (1 - prog(lt, grow - 0.3, grow + 0.2));
  const shaftY = -0.75 + L / 2 + eI2(f) * 3.2;
  const shaftX = eI2(f) * 1.4;
  return (
    <Canvas w={w} h={h} fov={30} z={9.6} y={0.2}>
      <group rotation={[0.32 + (1 - intro) * 0.4, -0.5 + lt * 0.08, 0]} scale={lerp(0.7, 1, intro)} position={[0, -0.9, 0]}>
        {/* strati di cute */}
        <mesh position={[0, 0.94, 0]}>
          <boxGeometry args={[3.3, 0.2, 2.0]} />
          <meshPhysicalMaterial {...glass('#e3f6f0')} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[3.3, 1.1, 2.0]} />
          <meshPhysicalMaterial {...glass(MINT, 0.5)} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.85, 0]}>
          <boxGeometry args={[3.3, 1.2, 2.0]} />
          <meshPhysicalMaterial {...glass(PETROL, 0.42)} depthWrite={false} />
        </mesh>
        {/* guaina e bulbo */}
        <mesh position={[0, 0.0, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 1.9, 32]} />
          <meshPhysicalMaterial {...glass(MINT_HI, 0.75)} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.95, 0]} scale={[bulbR / 0.36, bulbR / 0.36 * 1.15, bulbR / 0.36]}>
          <sphereGeometry args={[0.36, 40, 40]} />
          <meshPhysicalMaterial {...glass(MINT_HI)} emissive={MINT} emissiveIntensity={glow * 1.4} />
        </mesh>
        {/* fusto */}
        <group position={[shaftX, shaftY, 0]} rotation={[0, 0, -eI2(f) * 1.9]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.12, L, 24]} />
            <meshPhysicalMaterial color={'#24302e'} roughness={0.25} clearcoat={1} transparent opacity={1 - prog(f, 0.6, 1)} />
          </mesh>
        </group>
        {regrow > 0 && (
          <mesh position={[0, -0.75 + regrow * 0.45, 0]}>
            <cylinderGeometry args={[0.06, 0.08, regrow * 0.9 + 0.01, 20]} />
            <meshPhysicalMaterial color={'#3b4a47'} roughness={0.25} clearcoat={1} />
          </mesh>
        )}
        {/* anello del ciclo */}
        {ringV > 0.01 &&
          [0, 1, 2].map((i) => (
            <group key={i} position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, ringA + (i * Math.PI * 2) / 3]}>
              <mesh>
                <torusGeometry args={[1.45, 0.06, 16, 80, 1.75]} />
                <meshPhysicalMaterial {...glass([MINT, PETROL, FOREST][i], ringV)} />
              </mesh>
              <mesh position={[1.45 * Math.cos(1.75), 1.45 * Math.sin(1.75), 0]} rotation={[0, 0, 1.75]}>
                <coneGeometry args={[0.16, 0.34, 24]} />
                <meshPhysicalMaterial {...glass([MINT, PETROL, FOREST][i], ringV)} />
              </mesh>
            </group>
          ))}
      </group>
      <Motes lt={lt} n={30} seed={4} color={MINT} />
    </Canvas>
  );
};
const eI2 = (x: number) => x * x;

const Motes: React.FC<{lt: number; n: number; seed: number; color: string; spread?: number}> = ({lt, n, seed, color, spread = 9}) => {
  const ms = useMemo(() => {
    const r = rnd(seed);
    return Array.from({length: n}, () => ({p: [(r() - 0.5) * spread, (r() - 0.5) * 12, -3 - r() * 4], s: 0.03 + r() * 0.07, v: 0.15 + r() * 0.35}));
  }, [n, seed, spread]);
  return (
    <>
      {ms.map((m, i) => (
        <mesh key={i} position={[m.p[0], m.p[1] + lt * m.v, m.p[2]]}>
          <sphereGeometry args={[m.s, 12, 12]} />
          <meshStandardMaterial color={color} transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
};

/* ------------------------------------------------------------------ calendario: riposo d'estate → caduta in autunno */

export const MONTHS = [
  {m: 'LUG', c: WARM},
  {m: 'AGO', c: WARM},
  {m: 'SET', c: AUTUMN},
  {m: 'OTT', c: AUTUMN},
  {m: 'NOV', c: AUTUMN},
];

export const Calendar: React.FC<{lt: number; at: number[]; up: number; w: number; h: number}> = ({lt, at, up, w, h}) => {
  const tex = useMemo(() => MONTHS.map((x) => label([x.m], '#ffffff', PETROL, 512, 560, 230)), []);
  const lift = eIO(prog(lt, up - 0.2, up + 0.6));
  return (
    <Canvas w={w} h={h} fov={30} z={8.2}>
      <group rotation={[0.12, Math.sin(lt * 0.6) * 0.12, 0]} position={[0, 0.2, 0]}>
        {MONTHS.map((x, i) => {
          const row = i < 2 ? 0 : 1;
          const col = i < 2 ? i - 0.5 : i - 3;
          const p = soft(prog(lt, at[i], at[i] + 0.9) * 1.6);
          const hot = i >= 2 ? lift : 0;
          return (
            <group key={i} position={[col * 1.25, row === 0 ? 1.35 : -0.35 + hot * 0.25, lerp(-3, 0, p) + hot * 0.6]} rotation={[lerp(-1.6, 0, p), 0, 0]} scale={lerp(0.4, 1, p) * (1 + hot * 0.1)}>
              <mesh>
                <boxGeometry args={[1.05, 1.15, 0.2]} />
                <meshPhysicalMaterial attach="material-0" {...glass(x.c)} />
                <meshPhysicalMaterial attach="material-1" {...glass(x.c)} />
                <meshPhysicalMaterial attach="material-2" {...glass(x.c)} />
                <meshPhysicalMaterial attach="material-3" {...glass(x.c)} />
                <meshPhysicalMaterial attach="material-4" map={tex[i]} roughness={0.3} clearcoat={1} />
                <meshPhysicalMaterial attach="material-5" {...glass(x.c)} />
              </mesh>
              <mesh position={[0, 0.5, 0.11]}>
                <boxGeometry args={[1.05, 0.16, 0.02]} />
                <meshPhysicalMaterial {...glass(x.c)} />
              </mesh>
            </group>
          );
        })}
        {/* freccia curva tra estate e autunno */}
        {(() => {
          const p = eO3(prog(lt, at[1] + 0.5, at[2] + 0.3));
          return (
            <group position={[1.5, 0.55, 0.2]} rotation={[0, 0, -0.2]} scale={p}>
              <mesh rotation={[0, 0, -Math.PI / 2]}>
                <torusGeometry args={[0.55, 0.06, 14, 50, Math.PI * 0.9]} />
                <meshPhysicalMaterial {...glass(PETROL)} />
              </mesh>
              <mesh position={[-0.05, -0.56, 0]} rotation={[0, 0, Math.PI / 2 + 0.2]}>
                <coneGeometry args={[0.15, 0.32, 20]} />
                <meshPhysicalMaterial {...glass(PETROL)} />
              </mesh>
            </group>
          );
        })()}
      </group>
      <Motes lt={lt} n={24} seed={7} color={AUTUMN} />
    </Canvas>
  );
};

/* ------------------------------------------------------------------ sole e raggi (estate, UV e calore) */

export const Sun: React.FC<{lt: number; w: number; h: number; radicals?: number}> = ({lt, w, h, radicals = 0}) => {
  const rads = useMemo(() => {
    const r = rnd(3);
    return Array.from({length: 14}, () => ({a: r() * Math.PI * 2, d: 1.5 + r() * 1.6, s: 0.08 + r() * 0.08, ph: r() * 6}));
  }, []);
  const v = eO5(prog(lt, 0, 0.8));
  return (
    <Canvas w={w} h={h} fov={30} z={9}>
      <group scale={lerp(0.3, 1, soft(prog(lt, 0, 0.9) * 1.6))} rotation={[0, 0, lt * 0.4]}>
        <mesh>
          <sphereGeometry args={[0.85, 48, 48]} />
          <meshPhysicalMaterial {...glass(WARM)} emissive={WARM} emissiveIntensity={0.55 + 0.15 * Math.sin(lt * 4)} />
        </mesh>
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r = 1.3 + 0.08 * Math.sin(lt * 5 + i);
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} rotation={[0, 0, a - Math.PI / 2]} scale={v}>
              <coneGeometry args={[0.12, 0.42, 16]} />
              <meshPhysicalMaterial {...glass('#ffd27a')} emissive={WARM} emissiveIntensity={0.4} />
            </mesh>
          );
        })}
      </group>
      {radicals > 0 &&
        rads.map((q, i) => {
          const p = prog(lt, radicals + i * 0.06, radicals + i * 0.06 + 0.5);
          const a = q.a + lt * 0.3;
          return (
            <mesh key={i} position={[Math.cos(a) * q.d * 1.4 + Math.sin(lt * 9 + q.ph) * 0.04, Math.sin(a) * q.d * 0.6, 0.5]} scale={eBack(p)}>
              <icosahedronGeometry args={[q.s * 1.4, 0]} />
              <meshPhysicalMaterial color={'#e5533d'} roughness={0.3} clearcoat={1} emissive={'#e5533d'} emissiveIntensity={0.3} />
            </mesh>
          );
        })}
    </Canvas>
  );
};

/* ------------------------------------------------------------------ fusto in macro che si indebolisce e si spezza */

export const Strand: React.FC<{lt: number; frag: number; brk: number; w: number; h: number}> = ({lt, frag, brk, w, h}) => {
  const fr = eO3(prog(lt, frag - 0.2, frag + 0.5));
  const b = prog(lt, brk - 0.05, brk + 1.2);
  const be = eO3(b);
  const shards = useMemo(() => {
    const r = rnd(11);
    return Array.from({length: 22}, () => ({d: new THREE.Vector3((r() - 0.5) * 2, (r() - 0.2) * 2, (r() - 0.5) * 2), s: 0.04 + r() * 0.06, r: r() * 6}));
  }, []);
  const half = (side: 1 | -1) => (
    <group position={[side * (0.02 + be * 0.9), -be * be * 1.4, 0]} rotation={[0, 0, side * be * 0.7]}>
      {Array.from({length: 11}, (_, i) => {
        const x = side * (0.18 + i * 0.36);
        return (
          <group key={i} position={[x, Math.sin(x * 0.6 + lt) * 0.05 * (1 - fr), 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.22, 0.24, 0.36, 32]} />
              <meshPhysicalMaterial color={lerp3('#3a2b20', '#8b7a66', fr * 0.6)} roughness={lerp(0.25, 0.7, fr)} clearcoat={1 - fr * 0.8} />
            </mesh>
            {/* cuticole sollevate */}
            <mesh position={[0, 0.16, 0]} rotation={[fr * 0.35 * side, 0, 0]}>
              <cylinderGeometry args={[0.25 + fr * 0.03, 0.22, 0.06, 32, 1, true]} />
              <meshPhysicalMaterial color={'#6b5948'} roughness={0.4} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
  return (
    <Canvas w={w} h={h} fov={30} z={6.6}>
      <group rotation={[0.25, -0.35 + lt * 0.05, 0.12]} scale={lerp(1.1, 0.85, eO3(prog(lt, 0, 1.5)))}>
        {half(-1)}
        {half(1)}
        {fr > 0 &&
          [-0.9, 0.35, 1.3].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={1 - be}>
              <torusGeometry args={[0.245, 0.018 * fr, 8, 40]} />
              <meshStandardMaterial color={'#e5533d'} emissive={'#e5533d'} emissiveIntensity={0.8 * fr} />
            </mesh>
          ))}
        {b > 0 &&
          shards.map((s, i) => (
            <mesh key={i} position={[s.d.x * be * 1.2, s.d.y * be * 1.2 - b * b * 1.5, s.d.z * be]} rotation={[s.r * b, s.r, 0]} scale={1 - prog(b, 0.5, 1)}>
              <tetrahedronGeometry args={[s.s, 0]} />
              <meshPhysicalMaterial color={'#6b5948'} roughness={0.4} />
            </mesh>
          ))}
      </group>
      <Motes lt={lt} n={20} seed={13} color={MINT} />
    </Canvas>
  );
};
const lerp3 = (a: string, b: string, x: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), x).getHexString();

/* ------------------------------------------------------------------ i 4 consigli */

const dropGeo = () => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40, a = u * Math.PI;
    const r = Math.sin(a) * (0.5 + 0.5 * (1 - u)) * 0.62;
    pts.push(new THREE.Vector2(Math.max(0.0001, r * (u < 0.15 ? u / 0.15 : 1) ** 0.6), 0.9 - u * 1.5));
  }
  return new THREE.LatheGeometry(pts, 48);
};
const flameGeo = () => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    pts.push(new THREE.Vector2(Math.max(0.0001, Math.sin(u * Math.PI) ** 1.4 * 0.5 * (1 - u * 0.35)), -0.6 + u * 1.5));
  }
  return new THREE.LatheGeometry(pts.reverse(), 48);
};
const shieldGeo = () => {
  const s = new THREE.Shape();
  s.moveTo(0, 0.75);
  s.bezierCurveTo(0.35, 0.62, 0.55, 0.62, 0.62, 0.6);
  s.bezierCurveTo(0.62, 0.0, 0.45, -0.45, 0, -0.75);
  s.bezierCurveTo(-0.45, -0.45, -0.62, 0.0, -0.62, 0.6);
  s.bezierCurveTo(-0.55, 0.62, -0.35, 0.62, 0, 0.75);
  const g = new THREE.ExtrudeGeometry(s, {depth: 0.22, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 6, curveSegments: 32});
  g.center();
  return g;
};

export const Tips: React.FC<{lt: number; at: number[]; w: number; h: number}> = ({lt, at, w, h}) => {
  const geo = useMemo(() => ({drop: dropGeo(), flame: flameGeo(), shield: shieldGeo()}), []);
  const pos: [number, number][] = [[-1.45, 1.15], [1.45, 1.15], [-1.45, -1.25], [1.45, -1.25]];
  return (
    <Canvas w={w} h={h} fov={30} z={9}>
      {pos.map(([x, y], i) => {
        const p = soft(prog(lt, at[i] - 0.1, at[i] + 0.9) * 1.6);
        const spin = lt * 0.7 + i;
        return (
          <group key={i} position={[x, y + Math.sin(lt * 1.5 + i) * 0.05, lerp(-4, 0, p)]} scale={p * 1.1} rotation={[0.15, spin * 0.6 + (1 - p) * 3, 0]}>
            {i === 0 && (
              <mesh geometry={geo.drop}>
                <meshPhysicalMaterial {...glass(MINT, 0.92)} />
              </mesh>
            )}
            {i === 1 && (
              <group>
                <mesh geometry={geo.flame}>
                  <meshPhysicalMaterial {...glass('#ff9b52')} emissive={AUTUMN} emissiveIntensity={0.35} />
                </mesh>
                <mesh rotation={[0, 0, -0.8]} position={[0, 0.1, 0.35]}>
                  <boxGeometry args={[1.5, 0.14, 0.14]} />
                  <meshPhysicalMaterial {...glass(PETROL)} />
                </mesh>
              </group>
            )}
            {i === 2 && (
              <mesh geometry={geo.shield}>
                <meshPhysicalMaterial {...glass(PETROL)} />
              </mesh>
            )}
            {i === 3 && (
              <group rotation={[0, 0, 0.7]}>
                <mesh position={[0, 0.28, 0]}>
                  <capsuleGeometry args={[0.3, 0.55, 12, 32]} />
                  <meshPhysicalMaterial {...glass(MINT)} />
                </mesh>
                <mesh position={[0, -0.28, 0]}>
                  <capsuleGeometry args={[0.305, 0.55, 12, 32]} />
                  <meshPhysicalMaterial {...glass('#ffffff')} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
      <Motes lt={lt} n={26} seed={21} color={MINT} />
    </Canvas>
  );
};

/* ------------------------------------------------------------------ elementi 3D nella fascia bassa */

// foglie autunnali lucide che cadono (caduta stagionale)
export const Leaves: React.FC<{lt: number; w: number; h: number}> = ({lt, w, h}) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.5);
    s.bezierCurveTo(0.42, -0.25, 0.42, 0.25, 0, 0.55);
    s.bezierCurveTo(-0.42, 0.25, -0.42, -0.25, 0, -0.5);
    const g = new THREE.ExtrudeGeometry(s, {depth: 0.03, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 3, curveSegments: 24});
    g.center();
    return g;
  }, []);
  const ls = useMemo(() => {
    const r = rnd(5);
    return Array.from({length: 16}, () => ({x: (r() - 0.5) * 9, y0: 2.2 + r() * 2.6, s: 0.45 + r() * 0.45, c: [AUTUMN, WARM, MINT, FOREST][Math.floor(r() * 4)], sp: 0.55 + r() * 0.5, ph: r() * 6, d: r() * 0.6}));
  }, []);
  return (
    <Canvas w={w} h={h} fov={34} z={9}>
      {ls.map((l, i) => {
        const tt = Math.max(0, lt - l.d);
        const y = l.y0 - tt * l.sp * 1.6;
        return (
          <mesh key={i} geometry={geo} position={[l.x + Math.sin(tt * 1.8 + l.ph) * 0.45, y, -0.5 + (i % 3) * 0.4]} rotation={[Math.sin(tt * 2 + l.ph) * 0.9, tt * 1.2 + l.ph, Math.sin(tt * 1.3) * 0.8]} scale={l.s}>
            <meshPhysicalMaterial {...glass(l.c)} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </Canvas>
  );
};

// anello 3D che si riempie (2–3 mesi)
export const Ring: React.FC<{lt: number; p: number; w: number; h: number}> = ({lt, p, w, h}) => (
  <Canvas w={w} h={h} fov={30} z={7}>
    <group rotation={[0.35, Math.sin(lt * 0.8) * 0.25, 0]} scale={soft(prog(lt, 0, 0.9) * 1.6)}>
      <mesh>
        <torusGeometry args={[1, 0.16, 24, 96]} />
        <meshPhysicalMaterial {...glass(SAGE, 0.7)} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, -1, 1]}>
        <torusGeometry args={[1, 0.2, 24, 96, Math.max(0.001, p * Math.PI * 2)]} />
        <meshPhysicalMaterial {...glass(PETROL)} emissive={MINT} emissiveIntensity={0.1} />
      </mesh>
    </group>
  </Canvas>
);

/* ------------------------------------------------------------------ logo: marchio "estruso" con strati */

export const Logo3D: React.FC<{lt: number; w: number; h: number}> = ({lt, w, h}) => {
  const tex = useTex('logo/mark.png');
  const layers = 20;
  const p = prog(lt, 0, 1.3);
  const s = soft(p * 1.6);
  const ry = lerp(-2.4, 0, s) + Math.sin(Math.max(0, lt - 1.0) * 1.4) * 0.3 * clamp(lt - 1.0);
  if (!tex) return null;
  return (
    <ThreeCanvas width={w} height={h} camera={{fov: 30, position: [0, 0, 8]}} gl={{antialias: true, alpha: true}}>
      <group rotation={[0, ry, 0]} scale={lerp(0.35, 1, eBack(clamp(p * 1.3), 1.2))}>
        {Array.from({length: layers}, (_, i) => {
          const front = i === layers - 1;
          const col = front ? '#ffffff' : '#' + new THREE.Color(FOREST).lerp(new THREE.Color(PETROL_D), 0.5 - (i / layers) * 0.4).getHexString();
          return (
            <mesh key={i} position={[0, 0, (i - layers) * 0.014]}>
              <planeGeometry args={[1.9, 1.9 * (372 / 217)]} />
              <meshBasicMaterial map={tex} color={col} transparent alphaTest={0.5} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};
