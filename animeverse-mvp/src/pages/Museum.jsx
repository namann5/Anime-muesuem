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

    const toggleMusic = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/ambient-music.mp3');
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

    const charactersByAnime = characters.reduce((acc, char) => {
        const anime = char.anime || 'Other';
        if (!acc[anime]) acc[anime] = [];
        acc[anime].push(char);
        return acc;
    }, {});

    const rooms = Object.keys(charactersByAnime);

    return (
        <div className="flex h-screen flex-col bg-[#050505] selection:bg-pink-500/30">
            {/* Modern HUD Header */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6 pointer-events-none">
                <div className="container mx-auto flex items-center justify-between pointer-events-auto">
                    <div className="glass-modern px-8 py-4 rounded-2xl flex items-center gap-6">
                        <button 
                            onClick={() => window.location.hash = ''}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            ← Exit
                        </button>
                        <div className="h-6 w-[1px] bg-white/10"></div>
                        <div>
                            <h2 className="text-xl font-black tracking-tighter italic leading-none">
                                {animeTitle ? animeTitle.toUpperCase() : 'CORE MUSEUM'}
                            </h2>
                            <p className="text-[10px] font-bold tracking-widest text-pink-500 uppercase mt-1">
                                {characters.length} Exhibits Active
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={toggleMusic}
                            className={`btn-modern py-3 px-6 glass-modern ${musicEnabled ? 'text-pink-500' : 'text-white/40'}`}
                        >
                            {musicEnabled ? 'AUDIO ON' : 'AUDIO OFF'}
                        </button>
                        <button
                            onClick={() => setShowMinimap(!showMinimap)}
                            className={`btn-modern py-3 px-6 glass-modern ${showMinimap ? 'text-blue-400' : 'text-white/40'}`}
                        >
                            RADAR
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
                >
                    <Suspense fallback={
                        <Html center>
                            <div className="glass-modern px-12 py-6 rounded-3xl flex flex-col items-center">
                                <div className="w-12 h-12 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                                <div className="text-[10px] font-black tracking-widest uppercase text-pink-500">Syncing Reality</div>
                            </div>
                        </Html>
                    }>
                        <ambientLight intensity={0.1} />
                        <directionalLight
                            position={[10, 15, 5]}
                            intensity={0.3}
                            castShadow
                        />

                        {/* Point Lights for Atmosphere */}
                        <pointLight position={[-10, 5, -10]} intensity={1} color="#ff0055" />
                        <pointLight position={[10, 5, -10]} intensity={1} color="#7000ff" />
                        <pointLight position={[0, 5, -20]} intensity={1} color="#00d4ff" />

                        <MuseumFloor />
                        <MuseumWalls />

                        {Object.entries(charactersByAnime).map(([anime, chars], roomIndex) => {
                            const roomZ = -8 - (roomIndex * 15);
                            return (
                                <group key={anime}>
                                    <Html position={[0, 4, roomZ + 2]} center distanceFactor={15}>
                                        <div className="glass-modern px-10 py-5 rounded-[2rem] text-center border-pink-500/20">
                                            <div className="text-white font-black text-2xl italic tracking-tighter">{anime.toUpperCase()}</div>
                                            <div className="text-pink-500 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">Sector {roomIndex + 1}</div>
                                        </div>
                                    </Html>

                                    {chars.map((character, index) => {
                                        const columns = 4;
                                        const spacing = 6;
                                        const row = Math.floor(index / columns);
                                        const col = index % columns;
                                        const x = (col - (columns - 1) / 2) * spacing;
                                        const z = roomZ - (row * spacing);

                                        return (
                                            <group key={character.id || index} position={[x, 0, z]}>
                                                <ExhibitPedestal position={[0, 0, 0]} character={character} />
                                                <spotLight
                                                    position={[x, 6, z]}
                                                    angle={0.4}
                                                    penumbra={1}
                                                    intensity={0.8}
                                                    color="#ffffff"
                                                    target-position={[x, 0, z]}
                                                />
                                                <Html position={[0, 3, 0]} center distanceFactor={8}>
                                                    <div className="glass-card-modern px-5 py-2 rounded-xl border-white/10 group cursor-pointer hover:border-pink-500/50 transition-all">
                                                        <div className="text-white font-black text-xs tracking-tight whitespace-nowrap uppercase">
                                                            {character.name}
                                                        </div>
                                                        <div className="text-[8px] font-bold tracking-widest text-white/30 uppercase mt-0.5">
                                                            Exhibit #{index + 1}
                                                        </div>
                                                    </div>
                                                </Html>
                                            </group>
                                        );
                                    })}
                                </group>
                            );
                        })}

                        <FirstPersonControls
                            speed={6}
                            onPositionChange={(pos) => setPlayerPosition({ x: pos.x, z: pos.z })}
                        />
                    </Suspense>
                </Canvas>

                {/* Modern Radar UI */}
                {showMinimap && (
                    <div className="absolute bottom-6 right-6 w-72 h-72 glass-modern rounded-[2.5rem] p-6 animate-fade-in overflow-hidden border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black tracking-widest text-blue-400">POSITIONAL RADAR</span>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                                <div className="w-1 h-1 bg-blue-400/30 rounded-full animate-pulse delay-100"></div>
                                <div className="w-1 h-1 bg-blue-400/10 rounded-full animate-pulse delay-200"></div>
                            </div>
                        </div>
                        <div className="relative w-full h-full rounded-full border border-blue-500/10 bg-blue-500/[0.02] flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border border-blue-500/5 scale-75"></div>
                            <div className="absolute inset-0 rounded-full border border-blue-500/5 scale-50"></div>
                            
                            {/* Scanning line */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-500/0 via-blue-500/[0.05] to-blue-500/0 origin-center animate-[spin_4s_linear_infinite]"></div>

                            {/* Player indicator */}
                            <div
                                className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(0,212,255,0.5)] z-20"
                                style={{
                                    left: `${50 + (playerPosition.x / 40) * 100}%`,
                                    top: `${50 + (playerPosition.z / 40) * 100}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />

                            {/* Room indicators */}
                            {rooms.map((room, index) => {
                                const roomZ = -8 - (index * 15);
                                return (
                                    <div
                                        key={room}
                                        className="absolute w-1.5 h-1.5 bg-white/20 rounded-full"
                                        style={{
                                            left: '50%',
                                            top: `${50 + (roomZ / 40) * 100}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* HUD Controls Info */}
                <div className="absolute bottom-6 left-6 p-2 pointer-events-none">
                    <div className="glass-modern p-6 rounded-[2rem] border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                <span className="text-pink-500 text-xs font-black">?</span>
                            </div>
                            <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">System Guidance</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-medium text-white/30">MOVEMENT</span>
                                <span className="text-[10px] font-black text-white">WASD</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-medium text-white/30">LOOK</span>
                                <span className="text-[10px] font-black text-white">MOUSE</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-medium text-white/30">SPRINT</span>
                                <span className="text-[10px] font-black text-white">SHIFT</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-medium text-white/30">LOCK</span>
                                <span className="text-[10px] font-black text-white">CLICK</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
