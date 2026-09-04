import React from "react";

export default function ExhibitPedestal({ position = [0, 0, 0], character }) {
  const pedestalHeight = 1;
  const pedestalRadius = 0.6;

  return (
    <group position={position}>
      {/* Pedestal Base — warm ivory stone */}
      <mesh position={[0, pedestalHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[pedestalRadius, pedestalRadius + 0.1, pedestalHeight, 32]}
        />
        <meshStandardMaterial color="#D8D2C4" roughness={0.35} metalness={0.05} />
      </mesh>

      {/* Pedestal Top Platform — warm terracotta inlay */}
      <mesh position={[0, pedestalHeight, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[pedestalRadius + 0.05, pedestalRadius + 0.05, 0.1, 32]}
        />
        <meshStandardMaterial
          color="#C26244"
          roughness={0.3}
          metalness={0.35}
          emissive="#D97A5C"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Warm spotlight above exhibit */}
      <spotLight
        position={[0, 3, 0]}
        angle={0.3}
        penumbra={0.6}
        intensity={1.6}
        castShadow
        target-position={[0, pedestalHeight, 0]}
        color="#F3EDE0"
      />

      {/* Info Plaque */}
      {character && (
        <group position={[0, 0.1, pedestalRadius + 0.15]}>
          <mesh>
            <planeGeometry args={[1, 0.4]} />
            <meshStandardMaterial color="#2B251F" roughness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}