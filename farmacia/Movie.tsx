import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {Overlay} from './Overlay';
import {World} from './World';
import {FPS} from './util';

export const Movie: React.FC<{vertical: boolean; width: number; height: number; audio?: boolean}> = ({vertical, width, height, audio = false}) => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: '#0B1D22'}}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{type: THREE.PCFSoftShadowMap}}
        gl={{antialias: false, toneMapping: THREE.NoToneMapping}}
        camera={{fov: 30, near: 0.5, far: 400, position: [0, 10, 20]}}
      >
        <World t={t} vertical={vertical} />
      </ThreeCanvas>
      <Overlay t={t} vertical={vertical} />
      {audio ? <Audio src={staticFile('music.wav')} /> : null}
    </AbsoluteFill>
  );
};
