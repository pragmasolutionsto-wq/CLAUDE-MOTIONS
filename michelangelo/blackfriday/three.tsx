import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {clamp, eBack, lerp, prog, soft} from './util';

const Env: React.FC = () => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 1;
  }, [gl, scene]);
  return null;
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

// caduceo di Michelangelo estruso a strati: ruota dentro, rimbalza morbido, poi dondola
export const Logo3D: React.FC<{lt: number; w: number; h: number}> = ({lt, w, h}) => {
  const tex = useTex('logo/mark.png');
  const layers = 22;
  const p = prog(lt, 0, 1.3);
  const s = soft(p * 1.6);
  const ry = lerp(-2.4, 0, s) + Math.sin(Math.max(0, lt - 1.0) * 1.4) * 0.3 * clamp(lt - 1.0);
  if (!tex) return null;
  const AR = 324 / 352;
  return (
    <ThreeCanvas width={w} height={h} camera={{fov: 30, position: [0, 0, 8]}} gl={{antialias: true, alpha: true}}>
      <Env />
      <group rotation={[0, ry, 0]} scale={lerp(0.35, 1, eBack(clamp(p * 1.3), 1.2))}>
        {Array.from({length: layers}, (_, i) => {
          const front = i === layers - 1;
          const col = front ? '#ffffff' : '#' + new THREE.Color('#2D9B76').lerp(new THREE.Color('#14382E'), 0.7 - (i / layers) * 0.55).getHexString();
          return (
            <mesh key={i} position={[0, 0, (i - layers) * 0.014]}>
              <planeGeometry args={[3.3, 3.3 * AR]} />
              <meshBasicMaterial map={tex} color={col} transparent alphaTest={0.5} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};
