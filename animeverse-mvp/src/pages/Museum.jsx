import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import FirstPersonControls from '../components/FirstPersonControls';
import MuseumFloor from '../components/MuseumFloor';
import MuseumWalls from '../components/MuseumWalls';
import ExhibitPedestal from '../components/ExhibitPedestal';
import { characters as staticCharacters } from '../data/characters';
import { getAllCharacters } from '../services/characterService';
import { getAnimeDetails } from '../services/animeService';

export default function Museum({ animeFilter }) {
    const [characters, setCharacters] = useState(staticCharacters);
    const [loading, setLoading] = useState(true);
    const [animeTitle, setAnimeTitle] = useState(null);

    // Load characters from Firebase
    useEffect(() => {
        async function loadCharacters() {
            try {
                const firebaseChars = await getAllCharacters();
                let allChars = [...staticCharacters, ...firebaseChars];

                // Filter by anime if animeFilter is provided
                if (animeFilter) {
                    allChars = allChars.filter(char => char.malId === animeFilter);
                    // Fetch anime title
                    try {
                        const anime = await getAnimeDetails(animeFilter);
                        setAnimeTitle(anime.title);
                    } catch (err) {
                        console.error('Failed to fetch anime title:', err);
                    }
                }

                setCharacters(allChars);
            } catch (error) {
                console.error('Error loading characters:', error);
            } finally {
                setLoading(false);
            }
        }
        loadCharacters();
    }, [animeFilter]);

    return (
        <div className="flex h-screen flex-col bg-gradient-dark">
            {/* Header */}
            <header className="border-b border-anime-pink/10 bg-white/[0.02] px-6 py-4 text-center">
                <h2 className="m-0 bg-gradient-anime bg-clip-text text-3xl font-bold tracking-wide text-transparent">
                    {animeTitle ? `${animeTitle} Museum` : 'Virtual Anime Museum'}
                </h2>
                <p className="mt-2 text-sm text-anime-muted">
                    Use WASD to move • Mouse to look around • Click to lock cursor
                    {animeFilter && ' • Filtered by anime'}
                </p>
            </header>

            {/* Museum View */}
            <main className="flex-1">
                <Canvas
                    id="museum-canvas"
                    camera={{ position: [0, 1.7, 5], fov: 75 }}
                    shadows
                    style={{ background: '#1a1a1a' }}
                >
                    <Suspense fallback={
                        <Html center>
                            <div style={{ color: 'white', fontSize: '18px' }}>
                                Loading museum...
                            </div>
                        </Html>
                    }>
                        {/* Museum Lighting */}
                        <ambientLight intensity={0.3} />
                        <directionalLight
                            position={[10, 10, 5]}
                            intensity={0.5}
                            castShadow
                            shadow-mapSize-width={2048}
                            shadow-mapSize-height={2048}
                        />

                        {/* Museum Environment */}
                        <MuseumFloor />
                        <MuseumWalls />

                        {/* Character Exhibits on Pedestals */}
                        {characters.map((character, index) => {
                            const columns = 4;
                            const spacing = 5;
                            const row = Math.floor(index / columns);
                            const col = index % columns;
                            const x = (col - (columns - 1) / 2) * spacing;
                            const z = -8 - (row * spacing); // Start further back

                            return (
                                <group key={character.id || index} position={[x, 0, z]}>
                                    <ExhibitPedestal position={[0, 0, 0]} character={character} />

                                    {/* Character name label floating above pedestal */}
                                    <Html position={[0, 2.5, 0]} center distanceFactor={10}>
                                        <div style={{
                                            background: 'rgba(0, 0, 0, 0.8)',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 110, 166, 0.5)',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            whiteSpace: 'nowrap',
                                            pointerEvents: 'none'
                                        }}>
                                            {character.name}
                                        </div>
                                    </Html>
                                </group>
                            );
                        })}

                        {/* First Person Controls */}
                        <FirstPersonControls speed={5} />
                    </Suspense>
                </Canvas>
            </main>

            {/* Instructions Overlay */}
            <div className="pointer-events-none absolute bottom-6 left-6 rounded-lg border border-anime-pink/20 bg-black/60 p-4 backdrop-blur-sm">
                <div className="text-sm text-white">
                    <div className="mb-2 font-bold text-anime-pink">Controls:</div>
                    <div className="space-y-1 text-xs text-anime-muted">
                        <div><kbd className="rounded bg-white/10 px-2 py-1">W A S D</kbd> Move</div>
                        <div><kbd className="rounded bg-white/10 px-2 py-1">Mouse</kbd> Look</div>
                        <div><kbd className="rounded bg-white/10 px-2 py-1">Shift</kbd> Run</div>
                        <div><kbd className="rounded bg-white/10 px-2 py-1">Click</kbd> Lock Cursor</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
