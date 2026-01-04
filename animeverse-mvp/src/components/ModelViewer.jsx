import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";
import { useAnimations } from "@react-three/drei";
import * as THREE from "three";

export default function ModelViewer({
  src,
  onReady,
  playing = true,
  wireframe = false,
}) {
  const group = useRef();
  const { gl } = useThree();
  const [gltf, setGltf] = useState(null);
  const [mixer, setMixer] = useState(null);

  useEffect(() => {
    if (gltf && gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material.wireframe = wireframe;
        }
      });
    }
  }, [gltf, wireframe]);

  useEffect(() => {
    let mounted = true;
    const loader = new GLTFLoader();

    try {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
      loader.setDRACOLoader(dracoLoader);
    } catch (e) {}

    try {
      const ktx2Loader = new KTX2Loader();
      ktx2Loader.setTranscoderPath(
        "https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/"
      );
      ktx2Loader.detectSupport(gl);
      loader.setKTX2Loader(ktx2Loader);
    } catch (e) {}

    // allow src to be a File (from input) or a string URL
    let srcUrl = src;
    let objectUrl = null;
    if (src instanceof File) {
      objectUrl = URL.createObjectURL(src);
      srcUrl = objectUrl;
    }

    let currentMixer = null;
    let actionsMap = {};
    let currentAction = null;

    loader.load(
      srcUrl,
      (loaded) => {
        if (!mounted) return;
        setGltf(loaded);

        if (loaded.animations && loaded.animations.length > 0) {
          const _mixer = new THREE.AnimationMixer(loaded.scene);
          setMixer(_mixer);
          // create actions map
          loaded.animations.forEach((clip, idx) => {
            actionsMap[idx] = _mixer.clipAction(clip);
          });
          currentMixer = _mixer;
          // play first
          currentAction = actionsMap[0];
          currentAction && currentAction.play();
        }

        // expose ready callbacks
        if (typeof onReady === "function") {
          const clips = (loaded.animations || []).map((a, i) => ({
            name: a.name || `clip ${i}`,
            index: i,
          }));
          const play = () => {
            if (currentMixer) currentMixer.timeScale = 1;
          };
          const pause = () => {
            if (currentMixer) currentMixer.timeScale = 0;
          };
          const setClip = (idx) => {
            if (!actionsMap[idx]) return;
            if (currentAction) currentAction.fadeOut(0.2);
            currentAction = actionsMap[idx];
            currentAction.reset().fadeIn(0.2).play();
          };
          const rotate = (dx = 0, dy = 0) => {
            if (!gltf || !gltf.scene) return;
            gltf.scene.rotation.y += dx;
            gltf.scene.rotation.x += dy;
          };
          onReady({ clips, play, pause, setClip, rotate });
        }
      },
      undefined,
      (err) => {
        console.warn("GLTF load error", err);
      }
    );

    return () => {
      mounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, gl, onReady]);

  useEffect(() => {
    if (!gltf) return;
    // center model
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    gltf.scene.position.x += -center.x;
    gltf.scene.position.y += -center.y;
    gltf.scene.position.z += -center.z;
  }, [gltf]);

  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
  });

  // Fallback: procedural stylized character while loading or if load fails
  if (!gltf || !gltf.scene) {
    return (
      <group ref={group}>
        <group position={[0, 0.6, 0]}>
          {/* body */}
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.35, 0.45, 0.9, 24]} />
            <meshStandardMaterial
              color="#1f2937"
              metalness={0.1}
              roughness={0.6}
            />
          </mesh>

          {/* head */}
          <mesh position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.32, 32, 32]} />
            <meshStandardMaterial
              color="#ffd7d1"
              metalness={0.05}
              roughness={0.6}
            />
          </mesh>

          {/* eyes */}
          <mesh position={[0.11, 0.48, 0.28]}>
            <planeGeometry args={[0.08, 0.05]} />
            <meshStandardMaterial color="#0b1220" />
          </mesh>
          <mesh position={[-0.11, 0.48, 0.28]}>
            <planeGeometry args={[0.08, 0.05]} />
            <meshStandardMaterial color="#0b1220" />
          </mesh>

          {/* hair */}
          <mesh position={[0, 0.62, -0.02]}>
            <sphereGeometry
              args={[0.33, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]}
            />
            <meshStandardMaterial
              color="#0b1333"
              metalness={0.1}
              roughness={0.4}
            />
          </mesh>
        </group>
      </group>
    );
  }

  return <primitive ref={group} object={gltf.scene} />;
}
