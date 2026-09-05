import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import FirstPersonControls from "../components/FirstPersonControls";
import MuseumFloor from "../components/MuseumFloor";
import MuseumWalls from "../components/MuseumWalls";
import ExhibitPedestal from "../components/ExhibitPedestal";
import { characters as staticCharacters } from "../data/characters";
import { getAllCharacters } from "../services/characterService";
import { getAnimeDetails } from "../services/animeService";

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
          allChars = allChars.filter((char) => char.malId === animeFilter);
          try {
            const anime = await getAnimeDetails(animeFilter);
            setAnimeTitle(anime.title);
          } catch (err) {
            console.error("Failed to fetch anime title:", err);
          }
        }

        setCharacters(allChars);
      } catch (error) {
        console.error("Error loading characters:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCharacters();
  }, [animeFilter]);

  const toggleMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/ambient-music.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }

    if (musicEnabled) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .catch((e) => console.log("Audio play failed:", e));
    }
    setMusicEnabled(!musicEnabled);
  };

  const charactersByAnime = characters.reduce((acc, char) => {
    const anime = char.anime || "Other";
    if (!acc[anime]) acc[anime] = [];
    acc[anime].push(char);
    return acc;
  }, {});

  const rooms = Object.keys(charactersByAnime);

  return (
    <div className="flex h-screen flex-col bg-anime-dark selection:bg-anime-terracotta/30">
      {/* Modern HUD Header */}
      <header className="relative md:fixed md:top-20 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
        <div className="container mx-auto flex items-center justify-between pointer-events-auto">
          <div className="glass-modern px-6 py-3.5 rounded-full flex items-center gap-6">
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none">
                {animeTitle ? (
                  <>
                    {animeTitle.toUpperCase()}{" "}
                    <span className="font-serif-accent font-normal text-anime-terracotta-soft">
                      gallery
                    </span>
                  </>
                ) : (
                  <>
                    THE{" "}
                    <span className="font-serif-accent font-normal text-anime-terracotta-soft">
                      museum
                    </span>
                  </>
                )}
              </h2>
              <p className="text-[9px] font-bold tracking-[0.18em] text-anime-terracotta uppercase mt-1">
                {characters.length} Exhibits Active
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleMusic}
              className={`btn-modern py-2 px-4 rounded-full glass-modern ${
                musicEnabled ? "text-anime-terracotta" : "text-anime-cream/40"
              }`}
            >
              {musicEnabled ? "AUDIO ON" : "AUDIO OFF"}
            </button>
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className={`btn-modern py-2 px-4 rounded-full glass-modern ${
                showMinimap ? "text-blue-400" : "text-anime-cream/40"
              }`}
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
          dpr={[1, 1.25]}
          camera={{ position: [0, 1.7, 5], fov: 75 }}
          shadows
        >
          <Suspense
            fallback={
              <Html center>
                <div className="glass-modern px-12 py-6 rounded-3xl flex flex-col items-center">
                  <div className="w-12 h-12 border border-anime-terracotta/20 border-t-anime-terracotta rounded-full animate-spin mb-4"></div>
                  <div className="font-serif-accent text-lg text-anime-cream/60">
                    Cueing the gallery…
                  </div>
                </div>
              </Html>
            }
          >
            <ambientLight intensity={0.22} />
            <directionalLight
              position={[10, 15, 5]}
              intensity={0.45}
              castShadow
            />

            {/* Warm atmospheric point lights */}
            <pointLight
              position={[-10, 5, -10]}
              intensity={0.9}
              color="#D97A5C"
            />
            <pointLight position={[10, 5, -10]} intensity={0.7} color="#8F8577" />
            <pointLight position={[0, 5, -20]} intensity={0.7} color="#82949F" />

            <MuseumFloor />
            <MuseumWalls />

            {Object.entries(charactersByAnime).map(
              ([anime, chars], roomIndex) => {
                const roomZ = -8 - roomIndex * 15;
                return (
                  <group key={anime}>
                    <Html
                      position={[0, 4, roomZ + 2]}
                      center
                      distanceFactor={15}
                    >
                      <div className="glass-modern px-8 py-4 rounded-[1.5rem] text-center">
                        <div className="text-anime-cream font-black text-xl tracking-tight">
                          {anime.toUpperCase()}
                        </div>
                        <div className="text-anime-terracotta text-[9px] font-bold tracking-[0.3em] uppercase mt-1">
                          Gallery {roomIndex + 1}
                        </div>
                      </div>
                    </Html>

                    {chars.map((character, index) => {
                      const columns = 4;
                      const spacing = 6;
                      const row = Math.floor(index / columns);
                      const col = index % columns;
                      const x = (col - (columns - 1) / 2) * spacing;
                      const z = roomZ - row * spacing;

                      return (
                        <group key={character.id || index} position={[x, 0, z]}>
                          <ExhibitPedestal
                            position={[0, 0, 0]}
                            character={character}
                          />
                          <spotLight
                            position={[x, 6, z]}
                            angle={0.4}
                            penumbra={1}
                            intensity={0.7}
                            color="#F3EDE0"
                            target-position={[x, 0, z]}
                          />
                          <Html position={[0, 3, 0]} center distanceFactor={8}>
                            <div className="glass-card-modern px-5 py-2 rounded-xl group cursor-pointer hover:border-anime-terracotta/50 transition-all">
                              <div className="text-anime-cream font-black text-xs tracking-tight whitespace-nowrap uppercase">
                                {character.name}
                              </div>
                              <div className="text-[8px] font-bold tracking-[0.18em] text-anime-cream/25 uppercase mt-0.5">
                                Exhibit #{index + 1}
                              </div>
                            </div>
                          </Html>
                        </group>
                      );
                    })}
                  </group>
                );
              }
            )}

            <FirstPersonControls
              speed={6}
              onPositionChange={(pos) =>
                setPlayerPosition({ x: pos.x, z: pos.z })
              }
            />
          </Suspense>
        </Canvas>

        {/* Modern Radar UI */}
        {showMinimap && (
          <div className="hidden md:block absolute bottom-6 right-6 w-72 h-72 glass-modern rounded-[2rem] p-6 animate-fade-in overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold tracking-[0.15em] text-blue-400">
                POSITIONAL RADAR
              </span>
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
                className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(130,148,159,0.5)] z-20"
                style={{
                  left: `${50 + (playerPosition.x / 40) * 100}%`,
                  top: `${50 + (playerPosition.z / 40) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />

              {/* Room indicators */}
              {rooms.map((room, index) => {
                const roomZ = -8 - index * 15;
                return (
                  <div
                    key={room}
                    className="absolute w-1.5 h-1.5 bg-anime-cream/30 rounded-full"
                    style={{
                      left: "50%",
                      top: `${50 + (roomZ / 40) * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* HUD Controls Info */}
        <div className="absolute bottom-6 left-4 p-1 pointer-events-none">
          <div className="glass-modern p-4 md:p-6 rounded-[1.5rem]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-anime-terracotta/15 flex items-center justify-center">
                <span className="text-anime-terracotta text-xs font-bold">?</span>
              </div>
              <span className="text-[10px] font-bold tracking-[0.15em] text-anime-cream/40 uppercase">
                Guidance
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-medium text-anime-cream/30">
                  MOVEMENT
                </span>
                <span className="text-[10px] font-bold text-anime-cream">WASD</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-medium text-anime-cream/30">
                  LOOK
                </span>
                <span className="text-[10px] font-bold text-anime-cream">MOUSE</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-medium text-anime-cream/30">
                  SPRINT
                </span>
                <span className="text-[10px] font-bold text-anime-cream">SHIFT</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-medium text-anime-cream/30">
                  LOCK
                </span>
                <span className="text-[10px] font-bold text-anime-cream">CLICK</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
