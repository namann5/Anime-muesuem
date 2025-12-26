import React, { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ScenePortal from '../components/ScenePortal'

export default function Home({ onEnter }) {
  const sceneRef = useRef()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: '🎬',
      title: 'Watch Anime',
      description: 'Stream thousands of anime episodes with high quality',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: '🖼️',
      title: '3D Gallery',
      description: 'Explore iconic characters in stunning 3D models',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      icon: '🏛️',
      title: 'Virtual Museum',
      description: 'Walk through anime history in first-person view',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '📅',
      title: 'Timeline',
      description: 'Journey through decades of animation evolution',
      gradient: 'from-emerald-500 to-teal-500'
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div
          className="absolute -top-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
        ></div>
        <div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
          style={{ transform: `translate(${-mousePosition.x}px, ${mousePosition.y}px)` }}
        ></div>
        <div
          className="absolute -bottom-40 left-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
          style={{ transform: `translate(${mousePosition.x}px, ${-mousePosition.y}px)` }}
        ></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <header className="container mx-auto px-6 pt-32 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            <span className="text-sm text-white/90 font-medium">Now Live - Stream Your Favorite Anime</span>
          </div>

          {/* Main Title */}
          <h1 className="text-7xl md:text-8xl font-black tracking-tight mb-6 animate-fade-in-up">
            <span className="inline-block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient-x">
              ANIMEVERSE
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/70 mb-4 max-w-3xl mx-auto font-light animate-fade-in-up animation-delay-200">
            Explore the Evolution of Anime & Manga in Immersive 3D
          </p>

          <p className="text-base text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
            Journey through decades of animation history, view iconic characters in stunning 3D,
            stream your favorite shows, and discover the art that shaped global pop culture.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
            <button
              onClick={() => {
                if (onEnter) onEnter()
                const evt = new CustomEvent('enterMuseum')
                window.dispatchEvent(evt)
              }}
              className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-bold text-white shadow-2xl shadow-pink-500/50 hover:shadow-pink-500/80 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Enter the Museum
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button
              onClick={() => onEnter && onEnter()}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full font-semibold text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Explore Features
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in-up animation-delay-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10,000+</div>
              <div className="text-sm text-white/60">Anime Episodes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-white/60">3D Characters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">50+</div>
              <div className="text-sm text-white/60">Years of History</div>
            </div>
          </div>
        </header>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Explore Our Features
          </h2>
          <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
            Immerse yourself in the world of anime with our cutting-edge platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

                {/* Icon */}
                <div className="relative text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="relative text-white/60 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Arrow */}
                <div className="relative mt-4 flex items-center text-white/40 group-hover:text-white/80 transition-colors">
                  <span className="text-sm font-medium mr-2">Explore</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3D Scene Preview */}
        <section className="container mx-auto px-6 py-20">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-2xl h-96">
            <Canvas shadows camera={{ position: [0, 1.5, 5], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} />
              <Suspense fallback={null}>
                <ScenePortal ref={sceneRef} />
              </Suspense>
              <OrbitControls enablePan={false} />
            </Canvas>

            {/* Overlay Label */}
            <div className="absolute bottom-6 left-6 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/20">
              <p className="text-white text-sm font-medium">Interactive 3D Preview - Drag to rotate</p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-md border border-white/10">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/70 mb-8">
              Join thousands of anime fans exploring our immersive platform
            </p>
            <button
              onClick={() => onEnter && onEnter()}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-bold text-white shadow-2xl shadow-pink-500/50 hover:shadow-pink-500/80 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Get Started Now
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
