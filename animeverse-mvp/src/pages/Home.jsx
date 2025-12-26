import React, { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ScenePortal from '../components/ScenePortal'

export default function Home({ onEnter }) {
  const sceneRef = useRef()

  return (
    <div className="page-root">
      <header className="hero">
        <h1 className="text-5xl font-bold tracking-wide animate-float inline-block bg-gradient-to-r from-anime-pink via-anime-pink-light to-anime-pink-lighter bg-clip-text text-transparent">
          ANIMEVERSE
        </h1>
        <p className="mt-2 mb-3 text-anime-muted text-base">
          Explore the Evolution of Anime & Manga in 3D
        </p>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-anime-muted/80 mb-6">
          Journey through decades of animation history, view iconic characters in 3D,
          and discover the art that shaped global pop culture.
        </p>
        <button
          className="enter-btn bg-gradient-anime border-0 px-5 py-3 rounded-full text-anime-dark font-bold cursor-pointer shadow-lg shadow-anime-pink/20 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-anime-pink/30"
          onClick={() => {
            if (onEnter) onEnter()
            // dispatch enter event for 3D camera animation
            const evt = new CustomEvent('enterMuseum')
            window.dispatchEvent(evt)
            // after transition, focus the main content if present (keyboard users)
            setTimeout(() => {
              const main = document.querySelector('[aria-label^="3D view of"]') || document.getElementById('main')
              if (main && typeof main.focus === 'function') main.focus()
            }, 700)
          }}
        >
          Enter the Museum
        </button>
      </header>

      <main className="scene-area">
        <Canvas shadows camera={{ position: [0, 1.5, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <Suspense fallback={null}>
            <ScenePortal ref={sceneRef} />
          </Suspense>
          <OrbitControls enablePan={false} />
        </Canvas>
      </main>
    </div>
  )
}
