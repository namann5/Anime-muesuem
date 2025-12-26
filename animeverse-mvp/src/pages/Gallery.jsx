import React, { Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Environment, SpotLight, ContactShadows } from '@react-three/drei'
import ModelViewer from '../components/ModelViewer'
import GalleryUI from '../components/GalleryUI'
import EnvironmentLoader from '../components/EnvironmentLoader'
import CharacterUploadModal from '../components/CharacterUploadModal'
import AdminLoginModal from '../components/AdminLoginModal'
import CharacterGalleryGrid from '../components/CharacterGalleryGrid'
import CharacterCardGrid from '../components/CharacterCardGrid'
import { characters as staticCharacters } from '../data/characters'
import { getAllCharacters, deleteCharacter } from '../services/characterService'

export default function Gallery({ showControls = false }) {
  const [modelSrc, setModelSrc] = useState('/models/hero.glb')
  const [clips, setClips] = useState([])
  const [playing, setPlaying] = useState(false)
  const [setClipFn, setSetClipFn] = useState(() => () => { })
  const [envPreset, setEnvPreset] = useState('studio')
  const [envBackground, setEnvBackground] = useState(false)
  const [playFn, setPlayFn] = useState(null)
  const [pauseFn, setPauseFn] = useState(null)
  const [modelName, setModelName] = useState('hero.glb')
  const [clipIndex, setClipIndex] = useState(-1)
  const [rotateFn, setRotateFn] = useState(null)

  // Upload modal and Firebase characters
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [characters, setCharacters] = useState(staticCharacters)
  const [loadingCharacters, setLoadingCharacters] = useState(true)

  // Admin mode
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  // New features
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [viewMode, setViewMode] = useState('3d') // '3d' or 'grid'
  const [sortBy, setSortBy] = useState('name') // 'name', 'anime', 'recent'

  // Check admin status on mount
  useEffect(() => {
    const adminStatus = sessionStorage.getItem('isAdmin') === 'true'
    setIsAdmin(adminStatus)
  }, [])

  // Load characters from Firebase on mount
  useEffect(() => {
    async function loadCharacters() {
      try {
        const firebaseChars = await getAllCharacters()
        setCharacters([...staticCharacters, ...firebaseChars])
      } catch (error) {
        console.error('Error loading characters:', error)
        setCharacters(staticCharacters)
      } finally {
        setLoadingCharacters(false)
      }
    }
    loadCharacters()
  }, [])

  const handleAdminAccess = () => {
    if (isAdmin) {
      setShowUploadModal(true)
    } else {
      setShowAdminLogin(true)
    }
  }

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin')
    setIsAdmin(false)
  }

  const handleDeleteCharacter = async (characterId) => {
    try {
      await deleteCharacter(characterId)
      const firebaseChars = await getAllCharacters()
      setCharacters([...staticCharacters, ...firebaseChars])
    } catch (error) {
      console.error('Error deleting character:', error)
      alert('Failed to delete character: ' + error.message)
    }
  }

  const handleFileLoad = useCallback(file => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setModelSrc(url)
    setModelName(file.name)
  }, [])

  const handleSelectCharacter = useCallback(char => {
    if (!char) return
    setModelSrc(char.modelUrl)
    setModelName(char.name)
    setSelectedCharacter(char)
    setClips([])
    setClipIndex(-1)
  }, [])

  const handleModelReady = useCallback(({ clips: modelClips = [], play, pause, setClip }) => {
    setClips(modelClips)
    setSetClipFn(() => setClip)
    setPlayFn(() => play)
    setPauseFn(() => pause)
    setPlaying(true)
    setClipIndex(modelClips && modelClips.length ? 0 : -1)
    if (typeof play === 'function') play()
  }, [])

  const handleModelReadyWrapper = useCallback(payload => {
    if (payload && typeof payload.rotate === 'function') setRotateFn(() => payload.rotate)
    handleModelReady(payload)
  }, [handleModelReady])

  const handlePlayPause = useCallback(() => {
    setPlaying(p => {
      const next = !p
      if (next && typeof playFn === 'function') playFn()
      if (!next && typeof pauseFn === 'function') pauseFn()
      return next
    })
  }, [playFn, pauseFn])

  // Filter and sort characters
  const filteredCharacters = characters
    .filter(char =>
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (char.anime && char.anime.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'anime') return (a.anime || '').localeCompare(b.anime || '')
      return 0
    })

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Enhanced Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-md px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                3D Character Gallery
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Explore {filteredCharacters.length} stunning 3D character models
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('3d')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === '3d'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
              >
                🎨 3D View
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'grid'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
              >
                📱 Grid View
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search characters or anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500/50 cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="anime">Sort by Anime</option>
              <option value="recent">Recently Added</option>
            </select>

            {/* Results Count */}
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm">
              {filteredCharacters.length} characters
            </div>
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
            onSelectClip={index => { setClipFn(index); setClipIndex(index); }}
            onPresetChange={p => setEnvPreset(p)}
            onBackgroundToggle={v => setEnvBackground(v)}
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
              const firebaseChars = await getAllCharacters()
              setCharacters([...staticCharacters, ...firebaseChars])
            }}
          />
        </>
      )}

      <main className="flex-1 relative overflow-hidden">
        {viewMode === '3d' ? (
          <div className="relative h-full">
            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 2, 8], fov: 50 }} shadows>
              <Suspense fallback={<Html center><div className="text-white text-lg">Loading gallery...</div></Html>}>
                {/* Enhanced Lighting */}
                <ambientLight intensity={0.3} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
                <SpotLight
                  position={[0, 10, 0]}
                  angle={0.5}
                  penumbra={1}
                  intensity={1}
                  castShadow
                  color="#ff6ea6"
                />
                <SpotLight
                  position={[-5, 5, 5]}
                  angle={0.3}
                  penumbra={1}
                  intensity={0.5}
                  color="#a78bfa"
                />
                <pointLight position={[5, 5, -5]} intensity={0.5} color="#60a5fa" />

                {/* Environment */}
                {envPreset !== 'none' && (
                  <Environment preset={envPreset} background={envBackground} />
                )}

                {/* Contact Shadows for realism */}
                <ContactShadows
                  position={[0, -0.5, 0]}
                  opacity={0.4}
                  scale={20}
                  blur={2}
                  far={4}
                />

                {/* Character Gallery Grid */}
                <CharacterGalleryGrid characters={filteredCharacters} />

                {/* Camera Controls */}
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

            {/* Character Info Panel */}
            {selectedCharacter && (
              <div className="absolute top-6 right-6 w-80 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 animate-fade-in-up">
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h3 className="text-2xl font-bold text-white mb-2">{selectedCharacter.name}</h3>
                {selectedCharacter.anime && (
                  <p className="text-pink-400 text-sm font-medium mb-4">From: {selectedCharacter.anime}</p>
                )}

                {selectedCharacter.description && (
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {selectedCharacter.description}
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg transition-all">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Controls Info */}
            <div className="absolute bottom-6 left-6 px-4 py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
              <div className="text-white text-sm font-medium mb-2">🎮 Controls</div>
              <div className="text-white/60 text-xs space-y-1">
                <div>🖱️ Drag to rotate</div>
                <div>🔍 Scroll to zoom</div>
                <div>👆 Click character for info</div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="h-full overflow-y-auto p-6 bg-gradient-to-b from-transparent to-black/20">
            <CharacterCardGrid
              characters={filteredCharacters}
              onSelectCharacter={(char) => {
                handleSelectCharacter(char)
                setViewMode('3d')
              }}
              isAdmin={isAdmin}
              onDeleteCharacter={handleDeleteCharacter}
            />
          </div>
        )}
      </main>
    </div>
  )
}
