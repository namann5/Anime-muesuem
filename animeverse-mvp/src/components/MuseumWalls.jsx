import React from "react";

export default function MuseumWalls() {
  const wallHeight = 4;
  const wallThickness = 0.2;
  const roomSize = 50;

  return (
    <group>
      {/* North Wall */}
      <mesh
        position={[0, wallHeight / 2, -roomSize / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[roomSize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* South Wall */}
      <mesh
        position={[0, wallHeight / 2, roomSize / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[roomSize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* East Wall */}
      <mesh
        position={[roomSize / 2, wallHeight / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, roomSize]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* West Wall */}
      <mesh
        position={[-roomSize / 2, wallHeight / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, roomSize]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Ceiling (optional) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, wallHeight, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
    </group>
  );
}
