import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';

export default function CharacterCard({ character, position, index }) {
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);

    // Try to load 3D model if modelUrl exists
    let model = null;
    let hasModel = false;

    if (character.modelUrl) {
        try {
            model = useGLTF(character.modelUrl);
            hasModel = true;
        } catch (error) {
            console.warn(`Failed to load model for ${character.name}:`, error);
        }
    }

    // Gentle floating animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
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
            {/* 3D Model or Placeholder */}
            {hasModel && model ? (
                <primitive object={model.scene.clone()} scale={0.8} />
            ) : (
                // Placeholder cube for characters without models
                <mesh>
                    <boxGeometry args={[0.8, 1.2, 0.8]} />
                    <meshStandardMaterial
                        color={hovered ? "#ff6ea6" : "#ff9acb"}
                        metalness={0.5}
                        roughness={0.3}
                        emissive={hovered ? "#ff6ea6" : "#000000"}
                        emissiveIntensity={0.2}
                    />
                </mesh>
            )}

            {/* Hover Info Card */}
            {hovered && (
                <Html distanceFactor={10} position={[0, 2, 0]} center>
                    <div
                        className="character-info-card"
                        style={{
                            background: 'linear-gradient(135deg, rgba(5,5,10,0.95) 0%, rgba(20,20,30,0.95) 100%)',
                            border: '2px solid rgba(255, 110, 166, 0.5)',
                            borderRadius: '12px',
                            padding: '16px',
                            minWidth: '200px',
                            maxWidth: '300px',
                            boxShadow: '0 8px 32px rgba(255, 110, 166, 0.3)',
                            backdropFilter: 'blur(10px)',
                            animation: 'fadeInUp 0.3s ease-out',
                            pointerEvents: 'none'
                        }}
                    >
                        <h3 style={{
                            margin: '0 0 8px 0',
                            background: 'linear-gradient(90deg, #ff6ea6, #ff9acb)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}>
                            {character.name}
                        </h3>

                        {character.series && (
                            <p style={{
                                margin: '4px 0',
                                color: '#9aa0a6',
                                fontSize: '13px'
                            }}>
                                <strong>Series:</strong> {character.series}
                            </p>
                        )}

                        {character.role && (
                            <p style={{
                                margin: '4px 0',
                                color: '#9aa0a6',
                                fontSize: '13px'
                            }}>
                                <strong>Role:</strong> {character.role}
                            </p>
                        )}

                        {character.description && (
                            <p style={{
                                margin: '8px 0 0 0',
                                color: '#ccc',
                                fontSize: '12px',
                                lineHeight: '1.4'
                            }}>
                                {character.description}
                            </p>
                        )}
                    </div>
                </Html>
            )}

            {/* Base platform */}
            <mesh position={[0, -0.5, 0]} receiveShadow>
                <cylinderGeometry args={[0.6, 0.7, 0.1, 32]} />
                <meshStandardMaterial
                    color={hovered ? "#ff6ea6" : "#333"}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>
        </group>
    );
}
