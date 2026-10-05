import React, { useState, useEffect, useRef, Suspense } from "react";
import { gsap } from "gsap";

// Lazy load pages to improve initial load time
const Home = React.lazy(() => import("./pages/Home"));
const Gallery = React.lazy(() => import("./pages/Gallery"));
const AnimeTimeline = React.lazy(() => import("./pages/AnimeTimeline"));
const Museum = React.lazy(() => import("./pages/Museum"));
const WatchAnime = React.lazy(() => import("./pages/WatchAnime"));
const AnimeDetail = React.lazy(() => import("./pages/AnimeDetail"));
const Support = React.lazy(() => import("./pages/Support"));

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "gallery", label: "Models" },
  { id: "watch-anime", label: "Cinema" },
  { id: "museum", label: "Museum" },
  { id: "timeline", label: "Timeline" },
  { id: "support", label: "Support" },
];

// Routes that can be deep-linked directly as `#gallery`, `#museum`, etc.
const SIMPLE_ROUTES = new Set(NAV_ITEMS.map((item) => item.id));

// "Cinema" owns both the cinema list and any open detail page.
const isNavActive = (route, routeId) =>
  routeId === "watch-anime"
    ? route === "watch-anime" || route === "anime-detail"
    : route === routeId;

// Catches render/lazy-import failures for a single route and offers recovery,
// so one broken page cannot blank the whole app.
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Route failed to render:", error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-anime-dark px-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-anime-terracotta">
          Exhibit temporarily closed
        </p>
        <h2 className="max-w-lg font-serif-accent text-3xl text-anime-cream sm:text-4xl">
          This room failed to load.
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-anime-cream/50">
          The rest of the museum is still open. Retry this room, or head back
          to the entrance.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => this.setState({ error: null })}
            className="btn-modern btn-secondary-modern px-6 py-3"
          >
            Try again
          </button>
          <button
            onClick={() => {
              this.setState({ error: null });
              if (this.props.onNavigate) this.props.onNavigate("home");
            }}
            className="btn-modern btn-primary-modern px-6 py-3"
          >
            Back to the entrance
          </button>
        </div>
      </div>
    );
  }
}

// Catch-all for unknown hashes, invalid anime ids, and empty detail routes.
function NotFound({ onNavigate }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-anime-dark px-6 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-anime-terracotta">
        Gallery not found
      </p>
      <h2 className="font-serif-accent text-6xl font-black text-anime-cream">
        404
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-anime-cream/50">
        That room isn&apos;t in the collection. It may have been moved, or the
        address was mistyped.
      </p>
      <button
        onClick={() => onNavigate && onNavigate("home")}
        className="btn-modern btn-primary-modern px-6 py-3"
      >
        Back to the entrance
      </button>
    </div>
  );
}

// Loading Spinner for Suspense
function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-anime-dark">
      <div className="text-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border border-anime-terracotta/20 border-t-anime-terracotta"></div>
        <p className="mt-6 font-serif-accent text-xl tracking-wide text-anime-cream/70 animate-pulse">
          Entering the collection…
        </p>
      </div>
    </div>
  );
}

// Transition Wrapper
function PageTransition({ children, className }) {
  const el = useRef(null);

  useEffect(() => {
    if (el.current) {
      gsap.fromTo(
        el.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div ref={el} className={className}>
      {children}
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState("home");
  const [animeId, setAnimeId] = useState(null);
  const [galleryClickCount, setGalleryClickCount] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle hash-based routing for anime detail pages
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove #
      // An empty hash means in-app navigation cleared it — keep the current
      // route instead of bouncing the user back to the entrance.
      if (!hash) return;

      if (hash.startsWith("anime/")) {
        const id = Number.parseInt(hash.split("/")[1], 10);
        if (!Number.isFinite(id)) {
          setRoute("not-found");
          return;
        }
        setAnimeId(id);
        setRoute("anime-detail");
        return;
      }

      if (hash.startsWith("museum/")) {
        const id = Number.parseInt(hash.split("/")[1], 10);
        setAnimeId(Number.isFinite(id) ? id : null);
        setRoute("museum");
        return;
      }

      if (SIMPLE_ROUTES.has(hash)) {
        setAnimeId(null);
        setRoute(hash);
        return;
      }

      setRoute("not-found");
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Check initial hash

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleGalleryClick = () => {
    const newCount = galleryClickCount + 1;
    setGalleryClickCount(newCount);
    setRoute("gallery");

    // Secret trigger: 4 clicks reveals controls
    if (newCount >= 4 && !showControls) {
      setShowControls(true);
      console.log("Admin controls unlocked!");
    }
  };

  const navigateTo = (newRoute) => {
    setRoute(newRoute);
    setAnimeId(null);
    setMobileMenuOpen(false);
    window.location.hash = ""; // Clear hash
  };

  return (
    <div>
      <div className="noise-overlay" aria-hidden="true" />
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-4xl">
        <div className="glass-modern px-6 sm:px-8 py-3.5 rounded-full flex items-center justify-between shadow-2xl">
          <button
            onClick={() => navigateTo("home")}
            aria-current={route === "home" ? "page" : undefined}
            className="text-lg sm:text-xl font-black tracking-tight group"
          >
            ANIME
            <span className="font-serif-accent font-normal text-anime-terracotta-soft group-hover:text-anime-cream transition-colors">
              verse
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(route, item.id);
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    item.id === "gallery"
                      ? handleGalleryClick()
                      : navigateTo(item.id)
                  }
                  aria-current={active ? "page" : undefined}
                  className={`text-[10px] font-bold tracking-[0.18em] uppercase transition-all relative py-2 ${
                    active
                      ? "text-anime-cream"
                      : "text-anime-cream/40 hover:text-anime-cream"
                  }`}
                >
                  {item.label}
                  {active && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-5 bg-anime-terracotta rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <button
              className="md:hidden glass-card-modern p-2 rounded-lg text-anime-cream"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
            <div className="hidden md:block h-6 w-[1px] bg-anime-line mx-2"></div>
            <button className="hidden md:block text-[10px] font-bold tracking-[0.18em] uppercase text-anime-cream/40 hover:text-anime-terracotta-soft transition-colors">
              Sign in
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-nav"
            className="md:hidden mt-3 glass-modern rounded-2xl px-4 py-3"
          >
            <div className="grid gap-2">
              {NAV_ITEMS.map((item) => {
                const active = isNavActive(route, item.id);
                return (
                  <button
                    key={`mobile-${item.id}`}
                    onClick={() =>
                      item.id === "gallery"
                        ? handleGalleryClick()
                        : navigateTo(item.id)
                    }
                    aria-current={active ? "page" : undefined}
                    className={`text-left rounded-lg px-3 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-colors ${
                      active
                        ? "text-anime-terracotta bg-white/5"
                        : "text-anime-cream/60 hover:text-anime-cream hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Page rendering with transitions and suspense */}
      <main className="w-full min-h-screen bg-anime-dark">
        {/* Keyed on route so a crash in one page cannot persist across navigation */}
        <RouteErrorBoundary key={route} onNavigate={navigateTo}>
          <Suspense fallback={<PageLoader />}>
            {route === "home" && (
              <PageTransition key="home">
                <Home
                  onEnter={() => navigateTo("museum")}
                  onExplore={() => navigateTo("gallery")}
                  onNavigate={navigateTo}
                />
              </PageTransition>
            )}
            {route === "gallery" && (
              <PageTransition key="gallery">
                <Gallery showControls={showControls} />
              </PageTransition>
            )}
            {route === "watch-anime" && (
              <PageTransition key="watch-anime">
                <WatchAnime />
              </PageTransition>
            )}
            {route === "anime-detail" &&
              (animeId ? (
                <PageTransition key={`anime-${animeId}`}>
                  <AnimeDetail
                    malId={animeId}
                    onBack={() => navigateTo("watch-anime")}
                  />
                </PageTransition>
              ) : (
                <NotFound onNavigate={navigateTo} />
              ))}
            {route === "museum" && (
              <PageTransition key={`museum-${animeId || "main"}`}>
                <Museum animeFilter={animeId} />
              </PageTransition>
            )}
            {route === "timeline" && (
              <PageTransition key="timeline">
                <AnimeTimeline />
              </PageTransition>
            )}
            {route === "support" && (
              <PageTransition key="support">
                <Support />
              </PageTransition>
            )}
            {route === "not-found" && <NotFound onNavigate={navigateTo} />}
          </Suspense>
        </RouteErrorBoundary>
      </main>
    </div>
  );
}
