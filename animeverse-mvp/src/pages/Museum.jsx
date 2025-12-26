import React, { Suspense, useState, useEffect, useRef } from 'react';
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
    const [musicEnabled, setMusicEnabled] = useState(false);
    const [showMinimap, setShowMinimap] = useState(true);
    const [playerPosition, setPlayerPosition] = useState({ x: 0, z: 5 });
    const audioRef = useRef(null);

    // Load characters from Firebase
    useEffect(() => {
        async function loadCharacters() {
            try {
                const firebaseChars = await getAllCharacters();
                let allChars = [...staticCharacters, ...firebaseChars];

                if (animeFilter) {
                    allChars = allChars.filter(char => char.malId === animeFilter);
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

    // Handle ambient music
    const toggleMusic = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/ambient-music.mp3'); // You'll need to add this file
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3;
        }

        if (musicEnabled) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
        setMusicEnabled(!musicEnabled);
    };

    // Group characters by anime for themed rooms
    const charactersByAnime = characters.reduce((acc, char) => {
        const anime = char.anime || 'Other';
        if (!acc[anime]) acc[anime] = [];
        acc[anime].push(char);
        return acc;
    }, {});

    const rooms = Object.keys(charactersByAnime);

    return (
        <div className="flex h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            {/* Enhanced Header */}
            <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-md px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                            {animeTitle ? `${animeTitle} Museum` : 'Virtual Anime Museum'}
                        </h2>
                        <p className="mt-1 text-sm text-white/60">
                            {characters.length} exhibits across {rooms.length} themed rooms
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-3">
                        {/* Music Toggle */}
                        <button
                            onClick={toggleMusic}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${musicEnabled
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            {musicEnabled ? '🔊' : '🔇'}
                            <span className="text-sm">Ambient Music</span>
                        </button>

                        {/* Minimap Toggle */}
                        <button
                            onClick={() => setShowMinimap(!showMinimap)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${showMinimap
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🗺️
                            <span className="text-sm">Minimap</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Museum View */}
            <main className="flex-1 relative">
                <Canvas
                    id="museum-canvas"
                    camera={{ position: [0, 1.7, 5], fov: 75 }}
                    shadows
                    style={{ background: 'linear-gradient(to bottom, #1a1a2e, #0f0f1e)' }}
                >
                    <Suspense fallback={
                        <Html center>
                            <div className="text-white text-lg font-medium bg-black/60 px-6 py-3 rounded-lg backdrop-blur-md">
                                Loading museum...
                            </div>
                        </Html>
                    }>
                        {/* Enhanced Museum Lighting */}
                        <ambientLight intensity={0.2} />

                        {/* Main directional light */}
                        <directionalLight
                            position={[10, 15, 5]}
                            intensity={0.4}
                            castShadow
                            shadow-mapSize-width={2048}
                            shadow-mapSize-height={2048}
                        />

                        {/* Colored accent lights */}
                        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ff6ea6" />
                        <pointLight position={[10, 5, -10]} intensity={0.5} color="#a78bfa" />
                        <pointLight position={[0, 5, -20]} intensity={0.5} color="#60a5fa" />

                        {/* Spotlight for dramatic effect */}
                        <spotLight
                            position={[0, 10, 0]}
                            angle={0.3}
                            penumbra={1}
                            intensity={0.8}
                            castShadow
                        />

                        {/* Museum Environment */}
                        <MuseumFloor />
                        <MuseumWalls />

                        {/* Character Exhibits in Themed Rooms */}
                        {Object.entries(charactersByAnime).map(([anime, chars], roomIndex) => {
                            const roomZ = -8 - (roomIndex * 15); // Space out rooms

                            return (
                                <group key={anime}>
                                    {/* Room Label */}
                                    <Html position={[0, 3, roomZ + 2]} center distanceFactor={15}>
                                        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl">
                                            <div className="text-white font-black text-xl">{anime}</div>
                                            <div className="text-white/60 text-sm">{chars.length} Characters</div>
                                        </div>
                                    </Html>

                                    {/* Characters in this room */}
                                    {chars.map((character, index) => {
                                        const columns = 4;
                                        const spacing = 5;
                                        const row = Math.floor(index / columns);
                                        const col = index % columns;
                                        const x = (col - (columns - 1) / 2) * spacing;
                                        const z = roomZ - (row * spacing);

                                        return (
                                            <group key={character.id || index} position={[x, 0, z]}>
                                                <ExhibitPedestal position={[0, 0, 0]} character={character} />

                                                {/* Character spotlight */}
                                                <spotLight
                                                    position={[x, 5, z]}
                                                    angle={0.3}
                                                    penumbra={1}
                                                    intensity={0.5}
                                                    color="#ffffff"
                                                    target-position={[x, 0, z]}
                                                />

                                                {/* Character name label */}
                                                <Html position={[0, 2.5, 0]} center distanceFactor={10}>
                                                    <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-pink-500/50 hover:border-pink-500 transition-colors cursor-pointer">
                                                        <div className="text-white font-bold text-sm whitespace-nowrap">
                                                            {character.name}
                                                        </div>
                                                        {character.anime && (
                                                            <div className="text-pink-400 text-xs">
                                                                {character.anime}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Html>
                                            </group>
                                        );
                                    })}
                                </group>
                            );
                        })}

                        {/* First Person Controls */}
                        <FirstPersonControls
                            speed={5}
                            onPositionChange={(pos) => setPlayerPosition({ x: pos.x, z: pos.z })}
                        />
                    </Suspense>
                </Canvas>

                {/* Minimap */}
                {showMinimap && (
                    <div className="absolute top-6 right-6 w-64 h-64 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 animate-fade-in">
                        <div className="text-white font-bold text-sm mb-3 flex items-center justify-between">
                            <span>🗺️ Museum Map</span>
                            <span className="text-xs text-white/60">{rooms.length} Rooms</span>
                        </div>
                        <div className="relative w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-white/5">
                            {/* Player position indicator */}
                            <div
                                className="absolute w-3 h-3 bg-pink-500 rounded-full shadow-lg shadow-pink-500/50 animate-pulse"
                                style={{
                                    left: `${50 + (playerPosition.x / 30) * 100}%`,
                                    top: `${50 + (playerPosition.z / 30) * 100}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />

                            {/* Room markers */}
                            {rooms.map((room, index) => {
                                const roomZ = -8 - (index * 15);
                                return (
                                    <div
                                        key={room}
                                        className="absolute w-2 h-2 bg-purple-400/50 rounded-full"
                                        style={{
                                            left: '50%',
                                            top: `${50 + (roomZ / 30) * 100}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                        title={room}
                                    />
                                );
                            })}

                            {/* Grid lines */}
                            <div className="absolute inset-0 opacity-10">
                                {[...Array(5)].map((_, i) => (
                                    <div key={`h-${i}`} className="absolute w-full border-t border-white" style={{ top: `${i * 25}%` }} />
                                ))}
                                {[...Array(5)].map((_, i) => (
                                    <div key={`v-${i}`} className="absolute h-full border-l border-white" style={{ left: `${i * 25}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Controls Info */}
                <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 max-w-xs">
                    <div className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                        <span className="text-lg">🎮</span>
                        Museum Controls
                    </div>
                    <div className="space-y-2 text-xs text-white/70">
                        <div className="flex items-center gap-3">
                            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-white">W A S D</kbd>
                            <span>Move around</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-white">Mouse</kbd>
                            <span>Look around</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-white">Shift</kbd>
                            <span>Sprint</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-white">Click</kbd>
                            <span>Lock cursor</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/50">
                        💡 Tip: Explore themed rooms to discover characters from different anime
                    </div>
                </div>

                {/* Room Navigation Helper */}
                <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 max-w-xs">
                    <div className="text-white font-bold text-sm mb-2">📍 Current Location</div>
                    <div className="text-white/70 text-xs">
                        {rooms.length > 0 ? (
                            <div className="space-y-1">
                                {rooms.map((room, index) => (
                                    <div key={room} className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-pink-500' : 'bg-white/20'}`} />
                                        <span>{room}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span>Main Hall</span>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
