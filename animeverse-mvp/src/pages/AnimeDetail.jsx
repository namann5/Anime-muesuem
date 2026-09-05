import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  getAnimeDetails,
  getAnimeCharacters,
  getAnimeRecommendations,
} from "../services/animeService";
import { findAnimeByTitle, getAnimeInfo } from "../api/anilistApi";
import { getPublicStreamInfo } from "../api/streamingApi";
import AnimePlayer from "../components/AnimePlayer";
import EpisodeList from "../components/EpisodeList";

export default function AnimeDetail({ malId, onBack }) {
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("watch");
  const containerRef = useRef();

  // Streaming state
  const [streamingData, setStreamingData] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState(1);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [embedPartner, setEmbedPartner] = useState(null);

  useEffect(() => {
    loadAnimeData();
  }, [malId]);

  useEffect(() => {
    if (!loading && anime) {
      gsap.from(".detail-fade-in", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }
  }, [loading, anime]);

  async function loadAnimeData() {
    try {
      setLoading(true);
      setError(null);

      const [animeData, charactersData, recommendationsData] =
        await Promise.all([
          getAnimeDetails(malId),
          getAnimeCharacters(malId).catch(() => []),
          getAnimeRecommendations(malId).catch(() => []),
        ]);

      setAnime(animeData);
      setCharacters(charactersData.slice(0, 12));
      setRecommendations(recommendationsData);

      loadEpisodes(animeData.titleEnglish, animeData.titleRomaji);
    } catch (err) {
      setError("Failed to load anime details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadEpisodes(titleEnglish, titleRomaji) {
    try {
      setLoadingEpisodes(true);
      setStreamError(null);

      // 1. Hunt public mirrors first (works for ANY visitor, no server needed)
      const publicRes = await getPublicStreamInfo(anime?.malId);
      if (publicRes && publicRes.info.episodes?.length > 0) {
        const eps = publicRes.info.episodes.map((ep) => ({
          ...ep,
          _base: publicRes.base,
        }));
        setStreamingData(publicRes.info);
        setEpisodes(eps);
        if (eps.length > 0) {
          setCurrentEpisode(eps[0]);
          setCurrentEpisodeNumber(1);
          return;
        }
      }

      // 2. Fall back to the local AnimePahe backend
      const animepahe = await findAnimeByTitle(titleEnglish, titleRomaji);

      if (animepahe) {
        const info = await getAnimeInfo(animepahe.id);
        setStreamingData(info);
        setEpisodes(info.episodes || []);

        if (info.episodes && info.episodes.length > 0) {
          setCurrentEpisode(info.episodes[0]);
          setCurrentEpisodeNumber(1);
        }
      }
    } catch (err) {
      console.error("Failed to load episodes:", err);
      setStreamError(
        "No streaming source is reachable right now — anime hosts are experiencing an outage. You can still watch this title on a partner site below, or try the in-app player again later."
      );
    } finally {
      setLoadingEpisodes(false);
    }
  }

  const handleEpisodeSelect = (episode, episodeNumber) => {
    setCurrentEpisode(episode);
    setCurrentEpisodeNumber(episodeNumber);
    setActiveTab("watch");
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleNextEpisode = () => {
    if (currentEpisodeNumber < episodes.length) {
      const nextEp = episodes[currentEpisodeNumber];
      handleEpisodeSelect(nextEp, currentEpisodeNumber + 1);
    }
  };

  const handlePreviousEpisode = () => {
    if (currentEpisodeNumber > 1) {
      const prevEp = episodes[currentEpisodeNumber - 2];
      handleEpisodeSelect(prevEp, currentEpisodeNumber - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-anime-dark flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border border-anime-terracotta/20 border-t-anime-terracotta rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-serif-accent text-lg text-anime-cream/60">
            Cueing…
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-anime-dark flex items-center justify-center p-6">
        <div className="glass-modern p-12 rounded-[2rem] text-center max-w-lg">
          <div className="text-6xl mb-6">⚠️</div>
          <p className="text-anime-cream/55 mb-8 font-medium">
            {error || "Anime details could not be retrieved at this time."}
          </p>
          <button
            onClick={onBack}
            className="btn-modern btn-primary-modern w-full"
          >
            Return to Discovery
          </button>
        </div>
      </div>
    );
  }

  const bannerImage =
    anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

  const watchQuery = encodeURIComponent(
    anime.titleEnglish || anime.titleRomaji || anime.title
  );
  const watchLinks = [
    { name: "AnimePahe", url: `https://animepahe.com/anime?search=${watchQuery}` },
    { name: "HiAnime", url: `https://hianime.to/search?keyword=${watchQuery}` },
    { name: "Gogoanime", url: `https://gogoanimehd.io/search.html?keyword=${watchQuery}` },
    { name: "KissKh", url: `https://kisskh.co/Search?keyword=${watchQuery}` },
    { name: "Zoro", url: `https://zoro.to/search?keyword=${watchQuery}` },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-anime-dark text-anime-cream selection:bg-anime-terracotta/30"
    >
      {/* Immersive Header */}
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImage}
            className="w-full h-full object-cover scale-105 blur-2xl opacity-35"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-anime-dark via-anime-dark/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-anime-dark via-transparent to-anime-dark/50"></div>
        </div>

        <div className="absolute inset-0 z-10 container mx-auto px-4 md:px-6 flex flex-col justify-end pb-12 md:pb-24">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-end">
            <div className="block md:hidden w-36 aspect-[2/3] rounded-2xl overflow-hidden mb-4 detail-fade-in">
              <img
                src={bannerImage}
                className="w-full h-full object-cover"
                alt={anime.title}
              />
            </div>

            <div className="hidden md:block w-72 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-anime-line detail-fade-in">
              <img
                src={bannerImage}
                className="w-full h-full object-cover"
                alt={anime.title}
              />
            </div>

            <div className="flex-1 detail-fade-in">
              <div className="flex items-center gap-4 mb-4">
                {anime.genres?.slice(0, 3).map((g) => (
                  <span
                    key={g.name}
                    className="px-3 py-1 glass-card-modern rounded-full text-[10px] font-bold tracking-[0.15em] uppercase text-anime-terracotta-soft border-anime-terracotta/20"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter">
                {anime.title}
              </h1>
              <div className="flex flex-wrap items-center gap-8 text-sm font-bold tracking-tight text-anime-cream/50">
                <div className="flex items-center gap-2">
                  <span className="text-anime-terracotta text-xl">★</span>
                  <span className="text-anime-cream text-lg">
                    {anime.score || "N/A"}
                  </span>
                </div>
                <div>{anime.year || "TBA"}</div>
                <div>{anime.type}</div>
                <div>{anime.episodes || "??"} EPS</div>
                <div className="px-3 py-1 bg-white/10 rounded-md text-anime-cream border border-anime-line">
                  {anime.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-50 glass-modern border-y border-anime-line">
        <div className="container mx-auto px-4 md:px-6 flex items-center gap-6 md:gap-12">
          {["watch", "overview", "characters"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-6 text-sm font-bold tracking-[0.15em] uppercase transition-all relative ${
                activeTab === tab
                  ? "text-anime-cream"
                  : "text-anime-cream/30 hover:text-anime-cream/60"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 bg-anime-terracotta rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {activeTab === "watch" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 detail-fade-in">
            <div className="lg:col-span-3">
              {loadingEpisodes ? (
                <div className="aspect-video glass-modern rounded-3xl flex items-center justify-center">
                  <div className="text-anime-terracotta animate-pulse font-bold tracking-[0.15em] uppercase">
                    Initializing stream…
                  </div>
                </div>
              ) : currentEpisode ? (
                <div className="glass-modern p-2 rounded-[2rem] overflow-hidden">
                  <AnimePlayer
                    episodeId={currentEpisode.id}
                    sourceBase={currentEpisode._base || null}
                    episodeNumber={currentEpisodeNumber}
                    animeTitle={anime.title}
                    onNext={handleNextEpisode}
                    onPrevious={handlePreviousEpisode}
                    hasNext={currentEpisodeNumber < episodes.length}
                    hasPrevious={currentEpisodeNumber > 1}
                  />
                </div>
              ) : (
                <div className="aspect-video glass-modern rounded-3xl flex flex-col items-center justify-center p-8 md:p-12 text-center">
                  <div className="text-4xl mb-6">🚫</div>
                  <h3 className="text-xl font-bold mb-2">
                    Streaming Unavailable
                  </h3>
                  <p className="text-white/40 max-w-md mb-8">
                    {streamError ||
                      "We couldn't find a compatible video source for this title. Please try again later, or check again in a moment — streaming hosts rotate frequently."}
                  </p>

                  <div className="w-full max-w-md">
                    <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-anime-cream/30 mb-3">
                      Watch here — plays inside this site
                    </div>
                    <div className="flex flex-wrap justify-center gap-2.5">
                      {watchLinks.map((link) => (
                        <button
                          key={link.name}
                          onClick={() => setEmbedPartner(link)}
                          className="px-4 py-2 glass-card-modern rounded-xl text-xs font-bold text-anime-cream/80 border border-anime-line hover:border-anime-terracotta/50 hover:text-anime-cream transition-all hover:-translate-y-0.5 cursor-pointer"
                        >
                          {link.name} ▶
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 text-[11px] text-anime-cream/25 font-medium">
                      Opens the episode player here. If a site refuses embedding, use
                      "Open in new tab" inside it.
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="glass-card-modern rounded-3xl overflow-hidden h-auto md:h-[600px] flex flex-col">
                <div className="p-6 border-b border-anime-line">
                  <h3 className="font-black tracking-tight">
                    EPISODES{" "}
                    <span className="font-serif-accent text-anime-terracotta-soft">
                      ({episodes.length})
                    </span>
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <EpisodeList
                    episodes={episodes}
                    currentEpisode={currentEpisode}
                    onSelectEpisode={handleEpisodeSelect}
                    animeTitle={anime.title}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 detail-fade-in">
            <div className="md:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-black mb-6 tracking-tight">
                  SYNOPSIS{" "}
                  <span className="font-serif-accent font-normal text-anime-terracotta-soft">
                    — the story
                  </span>
                </h2>
                <p className="text-lg text-anime-cream/55 leading-relaxed font-medium">
                  {anime.synopsis || "No description available for this anime."}
                </p>
              </section>

              {anime.trailer?.embed_url && (
                <section>
                  <h2 className="text-3xl font-black mb-6 tracking-tight">
                    TRAILER{" "}
                    <span className="font-serif-accent font-normal text-anime-terracotta-soft">
                      — first look
                    </span>
                  </h2>
                  <div className="aspect-video glass-modern p-2 rounded-3xl overflow-hidden">
                    <iframe
                      src={anime.trailer.embed_url}
                      className="w-full h-full rounded-2xl"
                      allowFullScreen
                    />
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-8">
              <div className="glass-card-modern p-8 rounded-3xl">
                <h3 className="font-black mb-6 tracking-tight">DETAILS</h3>
                <div className="space-y-4">
                  {[
                    { label: "English", value: anime.titleEnglish },
                    { label: "Japanese", value: anime.titleJapanese },
                    {
                      label: "Studio",
                      value: anime.studios?.map((s) => s.name).join(", "),
                    },
                    { label: "Popularity", value: `#${anime.popularity}` },
                    { label: "Ranked", value: `#${anime.rank}` },
                    { label: "Source", value: anime.source },
                  ].map(
                    (item) =>
                      item.value && (
                        <div
                          key={item.label}
                          className="flex justify-between items-start gap-4 py-2 border-b border-anime-line"
                        >
                          <span className="text-xs font-bold text-anime-cream/25 uppercase tracking-[0.15em]">
                            {item.label}
                          </span>
                          <span className="text-sm font-semibold text-right">
                            {item.value}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "characters" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 detail-fade-in">
            {characters.map((char, index) => (
              <CharacterCard key={index} character={char} animeId={malId} />
            ))}
          </div>
        )}
      </main>

      {/* In-site partner player modal */}
      {embedPartner && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 detail-fade-in">
          <div className="w-full max-w-5xl glass-modern rounded-3xl overflow-hidden p-3">
            <div className="flex items-center justify-between gap-3 px-2 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-anime-terracotta">
                  Playing on {embedPartner.name}
                </span>
                <a
                  href={embedPartner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold tracking-[0.15em] uppercase text-anime-cream/50 hover:text-anime-cream transition-colors"
                >
                  Open in new tab ↗
                </a>
              </div>
              <button
                onClick={() => setEmbedPartner(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-anime-line text-anime-cream/60 hover:text-anime-cream transition-all text-sm font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <iframe
              src={embedPartner.url}
              className="w-full aspect-video bg-black rounded-2xl border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="no-referrer"
              title={`Watch ${anime.title} on ${embedPartner.name}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CharacterCard({ character, animeId }) {
  const char = character.character;
  const voiceActor = character.voiceActors?.find(
    (va) => va.language === "Japanese"
  );

  return (
    <div
      className="group cursor-pointer"
      onClick={() => (window.location.hash = `museum/${animeId}`)}
    >
      <div className="aspect-[2/3] glass-card-modern rounded-2xl overflow-hidden mb-3 relative">
        <img
          src={char?.images?.jpg?.image_url}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          alt={char?.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <button className="btn-modern btn-primary-modern text-[10px] py-2 px-2">
            VIEW IN 3D
          </button>
        </div>
      </div>
      <h4 className="font-bold text-sm tracking-tight mb-1 truncate">
        {char?.name}
      </h4>
      <p className="text-[10px] font-bold tracking-[0.15em] text-anime-cream/25 uppercase">
        {character.role}
      </p>
    </div>
  );
}
