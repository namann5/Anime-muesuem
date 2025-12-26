import React from 'react';

export default function ExhibitPedestal({ position = [0, 0, 0], character }) {
    const pedestalHeight = 1;
    const pedestalRadius = 0.6;

    return (
        <group position={position}>
            {/* Pedestal Base */}
            <mesh position={[0, pedestalHeight / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[pedestalRadius, pedestalRadius + 0.1, pedestalHeight, 32]} />
                <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.1}
                    metalness={0.3}
                />
            </mesh>

            {/* Pedestal Top Platform */}
            <mesh position={[0, pedestalHeight, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[pedestalRadius + 0.05, pedestalRadius + 0.05, 0.1, 32]} />
                <meshStandardMaterial
                    color="#ff6ea6"
                    roughness={0.2}
                    metalness={0.5}
                    emissive="#ff6ea6"
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Spotlight above exhibit */}
            <spotLight
                position={[0, 3, 0]}
                angle={0.3}
                penumbra={0.5}
                intensity={1.5}
                castShadow
                target-position={[0, pedestalHeight, 0]}
                color="#ffffff"
            />

            {/* Info Plaque */}
            {character && (
                <group position={[0, 0.1, pedestalRadius + 0.15]}>
                    <mesh>
                        <planeGeometry args={[1, 0.4]} />
                        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
                    </mesh>
                    {/* Text would be added via HTML overlay or Text component */}
                </group>
            )}
        </group>
    );
}
