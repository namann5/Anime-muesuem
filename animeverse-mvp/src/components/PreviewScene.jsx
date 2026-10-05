import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import ScenePortal from "./ScenePortal";

// Extracted from Home.jsx so the whole three.js graph (Canvas + drei +
// ScenePortal, ~800 kB) lives in a separate chunk. Home lazy-imports this and
// only mounts it once the preview section scrolls into view, which means the
// WebGL download is deferred until it's actually needed instead of blocking
// the landing page. The markup and lighting are unchanged.
export default function PreviewScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.5, 5], fov: 50 }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 8, 5]} intensity={0.5} />
        <spotLight
          position={[0, 5, 3]}
          angle={0.3}
          penumbra={1}
          intensity={0.9}
          color="#E1E0CC"
        />
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.4} floatIntensity={0.4}>
            <ScenePortal />
          </Float>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}