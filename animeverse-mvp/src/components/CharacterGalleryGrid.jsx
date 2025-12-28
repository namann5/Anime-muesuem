import React, { Suspense } from 'react';
import CharacterCard from './CharacterCard';
import { Html } from '@react-three/drei';

export default function CharacterGalleryGrid({ characters = [], wireframe = false }) {
    // Calculate grid positions
    const columns = 4;
    const spacing = 3;

    const getPosition = (index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const x = (col - (columns - 1) / 2) * spacing;
        const z = row * spacing;
        return [x, 0, -z];
    };

    if (characters.length === 0) {
        return (
            <Html center>
                <div style={{
                    color: 'white',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '20px',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <p>No characters uploaded yet.</p>
                    <p style={{ fontSize: '12px', color: '#9aa0a6', marginTop: '8px' }}>
                        Click Gallery 4 times → Admin Login → Add Character
                    </p>
                </div>
            </Html>
        );
    }

    return (
        <group position={[0, 0, 3]}>
            {characters.map((character, index) => (
                <Suspense
                    key={character.id || index}
                    fallback={
                        <Html position={getPosition(index)} center>
                            <div style={{ color: 'white' }}>Loading...</div>
                        </Html>
                    }
                >
                    <CharacterCard
                        character={character}
                        position={getPosition(index)}
                        index={index}
                        wireframe={wireframe}
                    />
                </Suspense>
            ))}
        </group>
    );
}
