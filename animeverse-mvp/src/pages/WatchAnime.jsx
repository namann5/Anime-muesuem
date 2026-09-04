import React, { useState, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { getTop100Anime } from "../services/animeService";
import RealTimeSearch from "../components/RealTimeSearch";
import { AnimeGridSkeleton, HeroSkeleton } from "../components/SkeletonLoader";

export default function WatchAnime() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef();

  useEffect(() => {
    loadAnime();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.from(".watch-fade-in", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
      });
    }
  }, [loading]);

  async function loadAnime() {
    try {
      setLoading(true);
      const anime = await getTop100Anime();
      setAnimeList(anime);
    } catch (err) {
      console.error("WatchAnime load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const trending = useMemo(() => animeList.slice(0, 15), [animeList]);
  const popular = useMemo(
    () =>
      [...animeList]
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 15),
    [animeList]
  );
  const topRated = useMemo(
    () =>
      [...animeList]
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 15),
    [animeList]
  );

  const handleSelectAnime = (anime) => {
    window.location.hash = `anime/${anime.malId}`;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-anime-dark flex flex-col items-center justify-center">
        <div className="w-16 h-16 border border-anime-terracotta/20 border-t-anime-terracotta rounded-full animate-spin"></div>
        <div className="mt-6 font-serif-accent text-xl text-anime-cream/70 animate-pulse">
          Cueing the reel…
        </div>
      </div>
    );

  const heroAnime = trending[0];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-anime-dark pb-20 mesh-gradient-modern selection:bg-anime-terracotta/30"
    >
      {/* Immersive Hero */}
      {heroAnime && (
        <section className="relative h-[60vh] md:h-screen w-full overflow-hidden">
          <img
            src={heroAnime.images?.jpg?.large_image_url}
            alt={heroAnime.title}
            className="w-full h-full object-cover scale-110 opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-anime-dark via-anime-dark/45 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-anime-dark via-transparent to-anime-dark/60"></div>

          <div className="absolute inset-0 z-10 container mx-auto px-4 md:px-6 flex flex-col justify-center items-start pt-12 md:pt-20 watch-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 glass-card-modern rounded-full text-[10px] font-bold tracking-[0.18em] uppercase text-anime-terracotta-soft border-anime-terracotta/20">
                Now Showing
              </span>
              <span className="text-anime-cream/40 text-xs font-bold tracking-[0.15em] uppercase">
                Trending Worldwide
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-8xl font-black mb-6 leading-none tracking-tighter">
              {heroAnime.title.toUpperCase()}
            </h1>

            <p className="max-w-xl text-lg text-anime-cream/55 mb-10 font-medium leading-relaxed">
              {heroAnime.synopsis?.slice(0, 180)}...
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <button
                onClick={() => handleSelectAnime(heroAnime)}
                className="btn-modern btn-primary-modern text-base sm:text-lg px-6 sm:px-12 py-3 sm:py-4 group"
              >
                Watch Now
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
              <button
                onClick={() => handleSelectAnime(heroAnime)}
                className="btn-modern btn-secondary-modern text-base sm:text-lg px-6 sm:px-12 py-3 sm:py-4"
              >
                Full Details
              </button>
            </div>
          </div>

          {/* Search Overlay - Modern Floating HUD */}
          <div className="absolute top-6 md:top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 md:px-6 z-50">
            <RealTimeSearch onSelect={handleSelectAnime} />
          </div>
        </section>
      )}

      {/* Content Rails */}
      <div className="container mx-auto px-6 -mt-32 relative z-20 space-y-24 pb-24">
        <AnimeRow
          title="TRENDING HITS"
          animeList={trending}
          onSelect={handleSelectAnime}
        />
        <AnimeRow
          title="POPULAR SELECTIONS"
          animeList={popular}
          onSelect={handleSelectAnime}
        />
        <AnimeRow
          title="CRITICS CHOICE"
          animeList={topRated}
          onSelect={handleSelectAnime}
        />
      </div>
    </div>
  );
}

function AnimeRow({ title, animeList, onSelect }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      rowRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="space-y-8 watch-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-4">
          <span className="uppercase">{title}</span>
          <span className="font-serif-accent text-xl text-anime-terracotta-soft lowercase">
            × 15
          </span>
          <div className="h-px w-10 bg-anime-terracotta/50"></div>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="glass-card-modern w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-anime-cream/60"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="glass-card-modern w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-anime-cream/60"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar scroll-smooth pr-6 sm:pr-12 pb-4"
      >
        {animeList.map((anime) => (
          <ModernAnimeCard
            key={anime.malId}
            anime={anime}
            onClick={() => onSelect(anime)}
          />
        ))}
      </div>
    </section>
  );
}

function ModernAnimeCard({ anime, onClick }) {
  const imageUrl =
    anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

  return (
    <div
      onClick={onClick}
      className="flex-none w-[160px] sm:w-[200px] md:w-[300px] group cursor-pointer"
    >
      <div className="aspect-[16/9] relative glass-card-modern rounded-2xl overflow-hidden mb-4 border-anime-line group-hover:border-anime-terracotta/40 transition-all shadow-xl">
        <img
          src={imageUrl}
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 sm:p-6 flex flex-col justify-end">
          <div className="flex items-center gap-2 text-[8px] font-bold text-anime-terracotta-soft uppercase tracking-[0.18em] mb-1">
            <span>{Math.round((anime.score || 8.5) * 10)}% Affinity</span>
          </div>
          <h3 className="font-bold text-anime-cream text-xs sm:text-sm md:text-sm leading-tight line-clamp-2">
            {anime.title.toUpperCase()}
          </h3>
        </div>

        {/* Score badge */}
        <div className="absolute top-4 right-4 glass-modern px-2.5 py-1 rounded-full text-[10px] font-bold text-anime-cream/90 border-anime-line group-hover:border-anime-terracotta/40 transition-all">
          {anime.score || "N/A"}
        </div>
      </div>

      <div className="px-2">
        <h4 className="font-bold text-xs tracking-tight mb-1 truncate text-anime-cream/70 group-hover:text-anime-cream transition-colors">
          {anime.title}
        </h4>
        <div className="flex items-center gap-3 text-[10px] font-bold text-anime-cream/25 uppercase tracking-[0.15em]">
          <span>{anime.type}</span>
          <span>•</span>
          <span>{anime.year || "2023"}</span>
        </div>
      </div>
    </div>
  );
}
