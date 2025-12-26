import React, { Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import ModelViewer from '../components/ModelViewer'
import GalleryUI from '../components/GalleryUI'
import EnvironmentLoader from '../components/EnvironmentLoader'
import CharacterUploadModal from '../components/CharacterUploadModal'
import AdminLoginModal from '../components/AdminLoginModal'
import CharacterGalleryGrid from '../components/CharacterGalleryGrid'
import CharacterCardGrid from '../components/CharacterCardGrid'
import FirstPersonControls from '../components/FirstPersonControls'
import MuseumFloor from '../components/MuseumFloor'
import MuseumWalls from '../components/MuseumWalls'
import ExhibitPedestal from '../components/ExhibitPedestal'
import { characters as staticCharacters } from '../data/characters'
import { getAllCharacters, deleteCharacter } from '../services/characterService'

export default function Gallery({ showControls = false }) {
  // Default to local sample (downloaded into public/models/hero.glb)
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
        // Merge static characters with Firebase characters
        setCharacters([...staticCharacters, ...firebaseChars])
      } catch (error) {
        console.error('Error loading characters:', error)
        // Fall back to static characters
        setCharacters(staticCharacters)
      } finally {
        setLoadingCharacters(false)
      }
    }
    loadCharacters()
  }, [])

  // Handle admin login button click
  const handleAdminAccess = () => {
    if (isAdmin) {
      // Already admin, open upload modal
      setShowUploadModal(true)
    } else {
      // Show login modal
      setShowAdminLogin(true)
    }
  }

  // Handle successful admin login
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true)
  }

  // Handle admin logout
  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin')
    setIsAdmin(false)
  }

  // Handle character deletion
  const handleDeleteCharacter = async (characterId) => {
    try {
      await deleteCharacter(characterId)
      // Reload characters after deletion
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
    setModelName(file.name)
  }, [])

  const handleSelectCharacter = useCallback(char => {
    if (!char) return
    setModelSrc(char.modelUrl)
    setModelName(char.name)
    // Reset clips when switching models
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

  // wrapper to also capture rotate callback
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

  return (
    <div className="flex h-screen flex-col bg-gradient-dark">
      <header className="border-b border-anime-pink/10 bg-white/[0.02] px-6 py-6 text-center">
        <h2 className="m-0 bg-gradient-anime bg-clip-text text-4xl font-bold tracking-wide text-transparent">
          3D Character Gallery
        </h2>
        <p className="mt-2 text-sm text-anime-muted">
          Select a character from the library or upload your own GLB model
        </p>
      </header>

      {/* Only show controls if unlocked (4 clicks on Gallery) */}
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
              // Reload characters after successful upload
              const firebaseChars = await getAllCharacters()
              setCharacters([...staticCharacters, ...firebaseChars])
            }}
          />
        </>
      )}

      <main id="main" style={{ flex: 1 }}>
        <div style={{ position: 'relative', height: '100%' }}>
          <div
            tabIndex={0}
            aria-label={`3D view of ${modelName}`}
            style={{ position: 'absolute', inset: 0 }}
            onKeyDown={e => {
              if (!rotateFn) return
              const step = 0.12
              if (e.key === 'ArrowLeft') rotateFn(-step, 0)
              if (e.key === 'ArrowRight') rotateFn(step, 0)
              if (e.key === 'ArrowUp') rotateFn(0, -step)
              if (e.key === 'ArrowDown') rotateFn(0, step)
            }}
          >
            <Canvas camera={{ position: [0, 2, 8], fov: 50 }} shadows>
              <Suspense fallback={<Html center><div style={{ color: 'white' }}>Loading gallery...</div></Html>}>
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <spotLight position={[-10, 15, -5]} intensity={0.5} />

                {/* Environment */}
                {envPreset !== 'none' && (
                  <EnvironmentLoader preset={envPreset} background={envBackground} />
                )}

                {/* Character Gallery Grid */}
                <CharacterGalleryGrid characters={characters} />

                {/* Camera Controls */}
                <OrbitControls
                  makeDefault
                  enablePan={true}
                  enableZoom={true}
                  minDistance={5}
                  maxDistance={30}
                />
              </Suspense>
            </Canvas>
          </div>

          <div aria-live="polite" style={{ position: 'absolute', left: 12, bottom: 12, background: 'rgba(2,6,18,0.6)', padding: '8px 12px', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#9aa0a6' }}>Model</div>
            <div style={{ fontWeight: 700 }}>{modelName}</div>
            <div style={{ fontSize: 12, color: '#9aa0a6', marginTop: 6 }}>Clip: {clipIndex >= 0 ? (clips[clipIndex]?.name || `clip ${clipIndex}`) : '—'}</div>
          </div>
        </div>

        {/* Character Cards Section Below */}
        <div className="border-t border-anime-pink/10 bg-gradient-to-b from-anime-dark to-black">
          <div className="px-6 py-4">
            <h3 className="bg-gradient-anime bg-clip-text text-xl font-bold text-transparent">
              Character Collection ({characters.length})
            </h3>
            <p className="mt-1 text-sm text-anime-muted">
              Click any character card to view in 3D gallery above
            </p>
          </div>
          <CharacterCardGrid
            characters={characters}
            onSelectCharacter={handleSelectCharacter}
            isAdmin={isAdmin}
            onDeleteCharacter={handleDeleteCharacter}
          />
        </div>
      </main>
    </div>
  )
}
