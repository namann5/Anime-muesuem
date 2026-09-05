import React, { Suspense, useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Environment,
  SpotLight,
  ContactShadows,
} from "@react-three/drei";
import ModelViewer from "../components/ModelViewer";
import GalleryUI from "../components/GalleryUI";
import CharacterUploadModal from "../components/CharacterUploadModal";
import AdminLoginModal from "../components/AdminLoginModal";
import CharacterGalleryGrid from "../components/CharacterGalleryGrid";
import CharacterCardGrid from "../components/CharacterCardGrid";
import { characters as staticCharacters } from "../data/characters";
import {
  getAllCharacters,
  deleteCharacter,
} from "../services/characterService";

export default function Gallery({ showControls = false }) {
  const [modelSrc, setModelSrc] = useState("/models/hero.glb");
  const [clips, setClips] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [setClipFn, setSetClipFn] = useState(() => () => {});
  const [envPreset, setEnvPreset] = useState("studio");
  const [envBackground, setEnvBackground] = useState(false);
  const [playFn, setPlayFn] = useState(null);
  const [pauseFn, setPauseFn] = useState(null);
  const [modelName, setModelName] = useState("hero.glb");
  const [clipIndex, setClipIndex] = useState(-1);
  const [rotateFn, setRotateFn] = useState(null);
  const [wireframe, setWireframe] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [characters, setCharacters] = useState(staticCharacters);
  const [loadingCharacters, setLoadingCharacters] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [viewMode, setViewMode] = useState("3d");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const adminStatus = sessionStorage.getItem("isAdmin") === "true";
    setIsAdmin(adminStatus);
  }, []);

  useEffect(() => {
    async function loadCharacters() {
      try {
        const firebaseChars = await getAllCharacters();
        setCharacters([...staticCharacters, ...firebaseChars]);
      } catch (error) {
        console.error("Error loading characters:", error);
        setCharacters(staticCharacters);
      } finally {
        setLoadingCharacters(false);
      }
    }
    loadCharacters();
  }, []);

  const handleAdminAccess = () => {
    if (isAdmin) {
      setShowUploadModal(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    setIsAdmin(false);
  };

  const handleDeleteCharacter = async (characterId) => {
    try {
      await deleteCharacter(characterId);
      const firebaseChars = await getAllCharacters();
      setCharacters([...staticCharacters, ...firebaseChars]);
    } catch (error) {
      console.error("Error deleting character:", error);
    }
  };

  const handleFileLoad = useCallback((file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setModelSrc(url);
    setModelName(file.name);
  }, []);

  const handleSelectCharacter = useCallback((char) => {
    if (!char) return;
    setModelSrc(char.modelUrl);
    setModelName(char.name);
    setSelectedCharacter(char);
    setClips([]);
    setClipIndex(-1);
  }, []);

  const handleModelReady = useCallback(
    ({ clips: modelClips = [], play, pause, setClip }) => {
      setClips(modelClips);
      setSetClipFn(() => setClip);
      setPlayFn(() => play);
      setPauseFn(() => pause);
      setPlaying(true);
      setClipIndex(modelClips && modelClips.length ? 0 : -1);
      if (typeof play === "function") play();
    },
    []
  );

  const handleModelReadyWrapper = useCallback(
    (payload) => {
      if (payload && typeof payload.rotate === "function")
        setRotateFn(() => payload.rotate);
      handleModelReady(payload);
    },
    [handleModelReady]
  );

  const handlePlayPause = useCallback(() => {
    setPlaying((p) => {
      const next = !p;
      if (next && typeof playFn === "function") playFn();
      if (!next && typeof pauseFn === "function") pauseFn();
      return next;
    });
  }, [playFn, pauseFn]);

  const filteredCharacters = characters
    .filter(
      (char) =>
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ((char.animeTitle || char.anime) &&
          (char.animeTitle || char.anime)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "anime")
        return (a.animeTitle || a.anime || "").localeCompare(
          b.animeTitle || b.anime || ""
        );
      return 0;
    });

  return (
    <div className="flex h-screen flex-col bg-anime-dark selection:bg-anime-terracotta/30">
      {/* Modern HUD Header */}
      <header className="relative md:fixed md:top-20 md:left-1/2 md:-translate-x-1/2 z-50 w-[95%] max-w-7xl pointer-events-none">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto">
          <div className="glass-modern px-6 py-3.5 rounded-full flex items-center gap-6">
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none">
                MODELS{" "}
                <span className="font-serif-accent font-normal text-anime-terracotta-soft">
                  showcase
                </span>
              </h2>
              <p className="text-[9px] font-bold tracking-[0.18em] text-anime-terracotta uppercase mt-1">
                {filteredCharacters.length} Entities Indexed
              </p>
            </div>
            <div className="h-6 w-[1px] bg-anime-line"></div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("3d")}
                className={`text-[10px] font-bold tracking-[0.15em] px-4 py-2 rounded-full transition-all ${
                  viewMode === "3d"
                    ? "bg-anime-terracotta text-anime-dark"
                    : "text-anime-cream/40 hover:text-anime-cream"
                }`}
              >
                3D VIEW
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`text-[10px] font-bold tracking-[0.15em] px-4 py-2 rounded-full transition-all ${
                  viewMode === "grid"
                    ? "bg-anime-terracotta text-anime-dark"
                    : "text-anime-cream/40 hover:text-anime-cream"
                }`}
              >
                GRID VIEW
              </button>
            </div>
            <div className="h-6 w-[1px] bg-anime-line"></div>
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`text-[10px] font-bold tracking-[0.15em] px-4 py-2 rounded-full transition-all border ${
                wireframe
                  ? "bg-orange-500/10 border-orange-500/50 text-orange-400"
                  : "border-anime-line text-anime-cream/40 hover:text-anime-cream"
              }`}
            >
              WIREFRAME
            </button>
          </div>

          <div className="flex gap-4 items-center w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="SEARCH ENTITY…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3.5 glass-modern rounded-full text-[10px] font-bold tracking-[0.15em] text-anime-cream placeholder-anime-cream/20 focus:outline-none focus:border-anime-terracotta/50 transition-all uppercase"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-6 py-3.5 glass-modern rounded-full text-[10px] font-bold tracking-[0.15em] text-anime-cream focus:outline-none focus:border-anime-terracotta/50 cursor-pointer uppercase appearance-none"
            >
              <option value="name">NAME</option>
              <option value="anime">ANIME</option>
              <option value="recent">RECENT</option>
            </select>
          </div>
        </div>
      </header>

      {/* Only show controls if unlocked */}
      {showControls && (
        <>
          <GalleryUI
            onFileLoad={handleFileLoad}
            clips={clips}
            playing={playing}
            onPlayPause={handlePlayPause}
            onSelectClip={(index) => {
              setClipFn(index);
              setClipIndex(index);
            }}
            onPresetChange={(p) => setEnvPreset(p)}
            onBackgroundToggle={(v) => setEnvBackground(v)}
            envBackground={envBackground}
            characters={characters}
            onSelectCharacter={handleSelectCharacter}
            onAddCharacter={handleAdminAccess}
            isAdmin={isAdmin}
            onLogout={handleLogout}
          />
          <AdminLoginModal
            isOpen={showAdminLogin}
            onClose={() => setShowAdminLogin(false)}
            onSuccess={handleAdminLoginSuccess}
          />
          <CharacterUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onSuccess={async () => {
              const firebaseChars = await getAllCharacters();
              setCharacters([...staticCharacters, ...firebaseChars]);
            }}
          />
        </>
      )}

      <main className="flex-1 relative overflow-hidden">
        {viewMode === "3d" ? (
          <div className="relative h-full">
            <Canvas
              dpr={[1, 1.5]}
              camera={{ position: [0, 2, 8], fov: 50 }}
              shadows
            >
              <Suspense fallback={null}>
                <ambientLight intensity={0.25} />
                <directionalLight position={[6, 8, 5]} intensity={0.6} castShadow />
                <SpotLight
                  position={[0, 6, 4]}
                  angle={0.5}
                  penumbra={1}
                  intensity={1.8}
                  color="#E1E0CC"
                />
                <pointLight
                  position={[4, 3, -3]}
                  intensity={0.6}
                  color="#8F8577"
                />
                {envPreset !== "none" && (
                  <Environment preset={envPreset} background={envBackground} />
                )}
                <ContactShadows
                  position={[0, -0.5, 0]}
                  opacity={0.55}
                  scale={20}
                  blur={2.4}
                  far={4}
                />
                <CharacterGalleryGrid
                  characters={filteredCharacters}
                  wireframe={wireframe}
                />
                <OrbitControls
                  makeDefault
                  enablePan={true}
                  enableZoom={true}
                  minDistance={5}
                  maxDistance={30}
                  autoRotate={!selectedCharacter}
                  autoRotateSpeed={0.5}
                />
              </Suspense>
            </Canvas>

            {selectedCharacter && (
              <div className="absolute top-48 md:right-12 right-4 md:w-80 w-[calc(100%-48px)] max-w-xs glass-modern p-6 md:p-8 rounded-[1.75rem] animate-fade-in">
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full glass-card-modern hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-black tracking-tight mb-2">
                  {selectedCharacter.name.toUpperCase()}
                </h3>
                {selectedCharacter.anime && (
                  <p className="text-anime-terracotta-soft text-[10px] font-bold tracking-[0.18em] uppercase mb-6">
                    {selectedCharacter.anime}
                  </p>
                )}
                <p className="text-anime-cream/50 text-xs leading-relaxed mb-8">
                  {selectedCharacter.description}
                </p>
                <button className="btn-modern btn-primary-modern w-full py-3 text-[10px] tracking-[0.15em]">
                  INITIALIZE VIEW
                </button>
              </div>
            )}

            <div className="absolute bottom-6 left-4 md:left-12 right-4 md:right-auto glass-modern p-4 md:p-6 rounded-[1.5rem] pointer-events-none">
              <div className="text-[10px] font-bold tracking-[0.15em] text-anime-cream/20 mb-3 uppercase">
                View Controls
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-anime-terracotta rounded-full"></div>
                  <span className="text-[10px] font-bold text-anime-cream/40">
                    DRAG TO ROTATE ENTITY
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-anime-terracotta rounded-full"></div>
                  <span className="text-[10px] font-bold text-anime-cream/40">
                    SCROLL TO ADJUST ZOOM
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-anime-terracotta rounded-full"></div>
                  <span className="text-[10px] font-bold text-anime-cream/40">
                    CLICK TO SYNC DATA
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-12 pt-52 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
            <div className="container mx-auto">
              <CharacterCardGrid
                characters={filteredCharacters}
                onSelectCharacter={(char) => {
                  handleSelectCharacter(char);
                  setViewMode("3d");
                }}
                isAdmin={isAdmin}
                onDeleteCharacter={handleDeleteCharacter}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
