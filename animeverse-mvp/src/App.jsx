import React, { useState, useEffect, useRef, Suspense } from 'react'
import { gsap } from 'gsap'

// Lazy load pages to improve initial load time
const Home = React.lazy(() => import('./pages/Home'))
const Gallery = React.lazy(() => import('./pages/Gallery'))
const AnimeTimeline = React.lazy(() => import('./pages/AnimeTimeline'))
const Museum = React.lazy(() => import('./pages/Museum'))
const WatchAnime = React.lazy(() => import('./pages/WatchAnime'))
const AnimeDetail = React.lazy(() => import('./pages/AnimeDetail'))

// Loading Spinner for Suspense
function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-anime-dark">
      <div className="text-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-anime-pink/30 border-t-anime-pink"></div>
        <p className="mt-4 animate-pulse text-anime-pink font-medium">Loading...</p>
      </div>
    </div>
  )
}

// Transition Wrapper
function PageTransition({ children, className }) {
  const el = useRef(null)

  useEffect(() => {
    if (el.current) {
      gsap.fromTo(el.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
    }
  }, [])

  return <div ref={el} className={className}>{children}</div>
}

export default function App() {
  const [route, setRoute] = useState('home')
  const [animeId, setAnimeId] = useState(null)
  const [galleryClickCount, setGalleryClickCount] = useState(0)
  const [showControls, setShowControls] = useState(false)

  // Handle hash-based routing for anime detail pages
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove #
      if (hash.startsWith('anime/')) {
        const id = hash.split('/')[1]
        setAnimeId(parseInt(id))
        setRoute('anime-detail')
      } else if (hash.startsWith('museum/')) {
        const id = hash.split('/')[1]
        setAnimeId(parseInt(id))
        setRoute('museum')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange() // Check initial hash

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleGalleryClick = () => {
    const newCount = galleryClickCount + 1
    setGalleryClickCount(newCount)
    setRoute('gallery')

    // Secret trigger: 4 clicks reveals controls
    if (newCount >= 4 && !showControls) {
      setShowControls(true)
      console.log('Admin controls unlocked!')
    }
  }

  const navigateTo = (newRoute) => {
    setRoute(newRoute)
    setAnimeId(null)
    window.location.hash = '' // Clear hash
  }

  return (
    <div>
      <nav className="fixed right-4 top-4 z-20 flex gap-1 rounded-xl border border-white/10 bg-anime-dark/70 p-2 backdrop-blur-md">
        <button
          onClick={() => navigateTo('home')}
          className={`
            rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300
            ${route === 'home'
              ? 'bg-gradient-anime text-anime-dark shadow-lg shadow-anime-pink/30 font-bold'
              : 'border border-anime-pink/30 bg-white/5 text-white hover:bg-anime-pink/15'
            }
          `}
        >
          Home
        </button>
        <button
          onClick={handleGalleryClick}
          className={`
            rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300
            ${route === 'gallery'
              ? 'bg-gradient-anime text-anime-dark shadow-lg shadow-anime-pink/30 font-bold'
              : 'border border-anime-pink/30 bg-white/5 text-white hover:bg-anime-pink/15'
            }
          `}
        >
          Gallery
        </button>
        <button
          onClick={() => navigateTo('watch-anime')}
          className={`
            rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300
            ${route === 'watch-anime' || route === 'anime-detail'
              ? 'bg-gradient-anime text-anime-dark shadow-lg shadow-anime-pink/30 font-bold'
              : 'border border-anime-pink/30 bg-white/5 text-white hover:bg-anime-pink/15'
            }
          `}
        >
          ▶️ Watch Anime
        </button>
        <button
          onClick={() => navigateTo('museum')}
          className={`
            rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300
            ${route === 'museum'
              ? 'bg-gradient-anime text-anime-dark shadow-lg shadow-anime-pink/30 font-bold'
              : 'border border-anime-pink/30 bg-white/5 text-white hover:bg-anime-pink/15'
            }
          `}
        >
          🏛️ Museum
        </button>
        <button
          onClick={() => navigateTo('timeline')}
          className={`
            rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300
            ${route === 'timeline'
              ? 'bg-gradient-anime text-anime-dark shadow-lg shadow-anime-pink/30 font-bold'
              : 'border border-anime-pink/30 bg-white/5 text-white hover:bg-anime-pink/15'
            }
          `}
        >
          Timeline
        </button>
      </nav>

      {/* Page rendering with transitions and suspense */}
      <main className="w-full min-h-screen">
        <Suspense fallback={<PageLoader />}>
          {route === 'home' && (
            <PageTransition key="home">
              <Home onEnter={() => navigateTo('gallery')} />
            </PageTransition>
          )}
          {route === 'gallery' && (
            <PageTransition key="gallery">
              <Gallery showControls={showControls} />
            </PageTransition>
          )}
          {route === 'watch-anime' && (
            <PageTransition key="watch-anime">
              <WatchAnime />
            </PageTransition>
          )}
          {route === 'anime-detail' && animeId && (
            <PageTransition key={`anime-${animeId}`}>
              <AnimeDetail malId={animeId} onBack={() => navigateTo('watch-anime')} />
            </PageTransition>
          )}
          {route === 'museum' && (
            <PageTransition key={`museum-${animeId || 'main'}`}>
              <Museum animeFilter={animeId} />
            </PageTransition>
          )}
          {route === 'timeline' && (
            <PageTransition key="timeline">
              <AnimeTimeline />
            </PageTransition>
          )}
        </Suspense>
      </main>
    </div>
  )
}
