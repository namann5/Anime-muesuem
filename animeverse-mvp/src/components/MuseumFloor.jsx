import React from 'react';
import * as THREE from 'three';

export default function MuseumFloor() {
    // Create a marble-like texture for the floor
    const createMarbleTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base color
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(0, 0, 512, 512);

        // Add some noise/veins for marble effect
        for (let i = 0; i < 50; i++) {
            ctx.strokeStyle = `rgba(200, 200, 200, ${Math.random() * 0.3})`;
            ctx.lineWidth = Math.random() * 3;
            ctx.beginPath();
            ctx.moveTo(Math.random() * 512, Math.random() * 512);
            ctx.lineTo(Math.random() * 512, Math.random() * 512);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        return texture;
    };

    return (
        <group>
            {/* Main Floor */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, 0]}
                receiveShadow
            >
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial
                    map={createMarbleTexture()}
                    roughness={0.2}
                    metalness={0.1}
                />
            </mesh>

            {/* Grid lines for visual reference */}
            <gridHelper
                args={[50, 50, 0x444444, 0x222222]}
                position={[0, 0.01, 0]}
            />
        </group>
    );
}
