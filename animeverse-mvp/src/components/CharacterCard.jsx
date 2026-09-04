import React, { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";

function LoadedModel({ modelUrl, wireframe }) {
  const model = useGLTF(modelUrl);

  useMemo(() => {
    if (model?.scene) {
      model.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.wireframe = wireframe;
        }
      });
    }
  }, [model, wireframe]);

  return <primitive object={model.scene.clone()} scale={0.8} />;
}

function ProceduralModel({ variant = "guardian", hovered = false, wireframe = false }) {
  const bodyColor =
    variant === "striker"
      ? "#8FA3B0"
      : variant === "sage"
      ? "#C2B8A3"
      : variant === "rogue"
      ? "#A3B5A0"
      : "#E09A7F";

  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.24, 0.75, 8, 16]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.55}
          roughness={0.28}
          emissive={hovered ? bodyColor : "#000000"}
          emissiveIntensity={0.2}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[0, 1.28, 0]}>
        <icosahedronGeometry args={[0.24, 1]} />
        <meshStandardMaterial
          color="#EDE9DE"
          metalness={0.35}
          roughness={0.2}
          wireframe={wireframe}
        />
      </mesh>

      <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.035, 12, 28]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={0.35}
          metalness={0.7}
          roughness={0.2}
          wireframe={wireframe}
        />
      </mesh>
    </group>
  );
}

export default function CharacterCard({
  character,
  position,
  index,
  wireframe = false,
}) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const proceduralVariant = character.modelUrl?.startsWith("procedural:")
    ? character.modelUrl.split(":")[1]
    : "guardian";

  const shouldUseProcedural =
    !character.modelUrl || character.modelUrl.startsWith("procedural:");

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={clicked ? 1.2 : hovered ? 1.1 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(!clicked)}
    >
      {shouldUseProcedural ? (
        <ProceduralModel
          variant={proceduralVariant}
          hovered={hovered}
          wireframe={wireframe}
        />
      ) : (
        <LoadedModel modelUrl={character.modelUrl} wireframe={wireframe} />
      )}

      {hovered && (
        <Html distanceFactor={10} position={[0, 2, 0]} center>
          <div
            className="character-info-card"
            style={{
              background:
                "linear-gradient(135deg, rgba(10,10,11,0.96) 0%, rgba(20,20,22,0.96) 100%)",
              border: "1px solid rgba(217, 122, 92, 0.45)",
              borderRadius: "12px",
              padding: "16px",
              minWidth: "200px",
              maxWidth: "300px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              backdropFilter: "blur(10px)",
              animation: "fadeInUp 0.3s ease-out",
              pointerEvents: "none",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                background: "linear-gradient(90deg, #D97A5C, #E09A7F)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {character.name}
            </h3>

            {character.series && (
              <p
                style={{
                  margin: "4px 0",
                  color: "#A1A094",
                  fontSize: "13px",
                }}
              >
                <strong>Series:</strong> {character.series}
              </p>
            )}

            {character.role && (
              <p
                style={{
                  margin: "4px 0",
                  color: "#A1A094",
                  fontSize: "13px",
                }}
              >
                <strong>Role:</strong> {character.role}
              </p>
            )}

            {character.description && (
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#E1E0CC",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                {character.description}
              </p>
            )}
          </div>
        </Html>
      )}

      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.1, 32]} />
        <meshStandardMaterial
          color={hovered ? "#D97A5C" : "#3A3733"}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
