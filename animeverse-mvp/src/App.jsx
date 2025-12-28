import React, { useState, useEffect, useRef, Suspense } from 'react'
import { gsap } from 'gsap'

// Lazy load pages to improve initial load time
const Home = React.lazy(() => import('./pages/Home'))
const Gallery = React.lazy(() => import('./pages/Gallery'))
const AnimeTimeline = React.lazy(() => import('./pages/AnimeTimeline'))
const Museum = React.lazy(() => import('./pages/Museum'))
const WatchAnime = React.lazy(() => import('./pages/WatchAnime'))
const AnimeDetail = React.lazy(() => import('./pages/AnimeDetail'))
const Support = React.lazy(() => import('./pages/Support'))

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
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-4xl">
        <div className="glass-modern px-8 py-4 rounded-2xl flex items-center justify-between shadow-2xl border-white/5">
          <div 
            className="text-xl font-black italic tracking-tighter cursor-pointer group"
            onClick={() => navigateTo('home')}
          >
            ANIME<span className="text-pink-500 group-hover:text-white transition-colors">VERSE</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { id: 'home', label: 'Home' },
              { id: 'gallery', label: 'Gallery' },
              { id: 'watch-anime', label: 'Cinema' },
              { id: 'museum', label: 'Museum' },
{ id: 'timeline', label: 'Timeline' },
                { id: 'support', label: 'Support' }
              ].map((item) => (
              <button
                key={item.id}
                onClick={() => item.id === 'gallery' ? handleGalleryClick() : navigateTo(item.id)}
                className={`text-[10px] font-black tracking-[0.2em] uppercase transition-all relative py-2 ${
                  route === item.id || (item.id === 'watch-anime' && route === 'anime-detail')
                    ? 'text-pink-500' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {item.label}
                {(route === item.id || (item.id === 'watch-anime' && route === 'anime-detail')) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-pink-500 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="md:hidden glass-card-modern p-2 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <div className="hidden md:block h-6 w-[1px] bg-white/10 mx-2"></div>
            <button className="hidden md:block text-[10px] font-black tracking-widest text-white/40 hover:text-pink-500 transition-colors">
              SIGN IN
            </button>
          </div>
        </div>
      </nav>

      {/* Page rendering with transitions and suspense */}
        <main className="w-full min-h-screen bg-anime-dark">
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
            {route === 'support' && (
              <PageTransition key="support">
                <Support />
              </PageTransition>
            )}
        </Suspense>
      </main>
    </div>
  )
}
