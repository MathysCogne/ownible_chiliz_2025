'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { DotLoader } from '@/components/ui/dot-loader';

const TEXTUREMAP = { src: 'https://i.postimg.cc/XYwvXN8D/img-4.png' };
const DEPTHMAP = { src: 'https://i.postimg.cc/2SHKQh2q/raw-4.webp' };

const loaderFrames = [
  [24], [24, 31], [24, 31, 38], [24, 31, 38, 45], [24, 31, 38, 45, 39], [24, 31, 38, 45, 39, 32],
  [24, 31, 38, 45, 39, 32, 25], [31, 38, 45, 39, 32, 25, 18], [38, 45, 39, 32, 25, 18, 11],
  [45, 39, 32, 25, 18, 11, 4], [39, 32, 25, 18, 11, 4, 3], [32, 25, 18, 11, 4, 3, 2],
  [25, 18, 11, 4, 3, 2, 1], [18, 11, 4, 3, 2, 1, 8], [11, 4, 3, 2, 1, 8, 15],
  [4, 3, 2, 1, 8, 15, 22], [3, 2, 1, 8, 15, 22, 29], [2, 1, 8, 15, 22, 29, 36],
  [1, 8, 15, 22, 29, 36, 43], [8, 15, 22, 29, 36, 43, 42], [15, 22, 29, 36, 43, 42, 41],
  [22, 29, 36, 43, 42, 41, 40], [29, 36, 43, 42, 41, 40, 33], [36, 43, 42, 41, 40, 33, 26],
  [43, 42, 41, 40, 33, 26, 19], [42, 41, 40, 33, 26, 19, 12], [41, 40, 33, 26, 19, 12, 5],
  [40, 33, 26, 19, 12, 5, 6], [33, 26, 19, 12, 5, 6, 13], [26, 19, 12, 5, 6, 13, 20],
  [19, 12, 5, 6, 13, 20, 27], [12, 5, 6, 13, 20, 27, 34], [5, 6, 13, 20, 27, 34, 41],
  [6, 13, 20, 27, 34, 41, 48], [13, 20, 27, 34, 41, 48], [20, 20, 27, 34, 41, 48],
  [27, 34, 41, 48], [34, 41, 48], [41, 48], [48], [],
];

const Loader = () => (
    <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
      <DotLoader frames={loaderFrames} duration={50} />
    </div>
);

const WIDTH = 300;
const HEIGHT = 300;

// Custom shader material for the displacement effect
const DisplaceMaterial = new THREE.ShaderMaterial({
  uniforms: {
    u_texture: { value: null },
    u_depth_map: { value: null },
    u_pointer: { value: new THREE.Vector2(0.5, 0.5) },
    u_progress: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D u_texture;
    uniform sampler2D u_depth_map;
    uniform vec2 u_pointer;
    uniform float u_progress;
    varying vec2 vUv;

    void main() {
      float depth = texture2D(u_depth_map, vUv).r;
      vec2 displacedUv = vUv + (depth * (u_pointer - 0.5) * 0.1);
      vec3 color = texture2D(u_texture, displacedUv).rgb;
      
      // Scanning line effect
      float scanWidth = 0.05;
      float scanLine = smoothstep(0.0, scanWidth, abs(vUv.y - u_progress));
      vec3 redOverlay = vec3(1.0, 0.0, 0.0) * (1.0 - scanLine) * 0.4;
      
      // Dithering dots effect
      vec2 tiling = vec2(100.0, 100.0);
      vec2 tiledUv = mod(vUv * tiling, 2.0) - 1.0;
      float brightness = fract(sin(dot(vUv * tiling, vec2(12.9898, 78.233))) * 43758.5453);
      float dist = length(tiledUv);
      float dotEffect = smoothstep(0.5, 0.49, dist) * brightness;

      float flow = 1.0 - smoothstep(0.0, 0.02, abs(depth - u_progress));
      vec3 mask = vec3(dotEffect) * flow * vec3(10.0, 0.0, 0.0);
      
      gl_FragColor = vec4(color + redOverlay + mask, 1.0);
    }
  `,
});

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);

  const material = useMemo(() => {
    const mat = DisplaceMaterial.clone();
    mat.uniforms.u_texture.value = rawMap;
    mat.uniforms.u_depth_map.value = depthMap;
    return mat;
  }, [rawMap, depthMap]);

  useFrame(({ clock, pointer }) => {
    if (material) {
      material.uniforms.u_progress.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
      material.uniforms.u_pointer.value.lerp(pointer, 0.05);
    }
  });

  const [w, h] = useAspect(WIDTH, HEIGHT);
  const scaleFactor = 0.3;

  return (
    <mesh scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry args={[1, 1, 1, 1]} />
    </mesh>
  );
};

export default function CanvasScene() {
  return (
    <Suspense fallback={<Loader />}>
      <Canvas dpr={[1, 1.5]} gl={{ alpha: false, antialias: true }}>
        <Scene />
        <EffectComposer>
          <Bloom luminanceThreshold={0.9} intensity={0.5} levels={8} />
        </EffectComposer>
      </Canvas>
    </Suspense>
  );
}; 