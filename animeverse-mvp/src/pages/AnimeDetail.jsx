import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  getAnimeDetails,
  getAnimeCharacters,
  getAnimeRecommendations,
} from "../services/animeService";
import { findAnimeByTitle, getAnimeInfo } from "../api/anilistApi";
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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-tighter text-pink-500 uppercase">
            Loading
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="glass-modern p-12 rounded-[2rem] text-center max-w-lg">
          <div className="text-6xl mb-6">⚠️</div>
          <p className="text-white/60 mb-8 font-medium">
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

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#050505] text-white selection:bg-pink-500/30"
    >
      {/* Immersive Header */}
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImage}
            className="w-full h-full object-cover scale-105 blur-2xl opacity-40"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]"></div>
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

            <div className="hidden md:block w-72 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 detail-fade-in">
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
                    className="px-3 py-1 glass-card-modern rounded-full text-[10px] font-bold tracking-widest uppercase text-pink-400 border-pink-500/20"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter">
                {anime.title}
              </h1>
              <div className="flex flex-wrap items-center gap-8 text-sm font-bold tracking-tight text-white/50">
                <div className="flex items-center gap-2">
                  <span className="text-pink-500 text-xl">★</span>
                  <span className="text-white text-lg">
                    {anime.score || "N/A"}
                  </span>
                </div>
                <div>{anime.year || "TBA"}</div>
                <div>{anime.type}</div>
                <div>{anime.episodes || "??"} EPS</div>
                <div className="px-3 py-1 bg-white/10 rounded-md text-white border border-white/10">
                  {anime.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-50 glass-modern border-y border-white/5">
        <div className="container mx-auto px-4 md:px-6 flex items-center gap-6 md:gap-12">
          {["watch", "overview", "characters"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-6 text-sm font-black tracking-widest uppercase transition-all relative ${
                activeTab === tab
                  ? "text-white"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500"></div>
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
                  <div className="text-pink-500 animate-pulse font-black tracking-widest uppercase">
                    Initializing Stream...
                  </div>
                </div>
              ) : currentEpisode ? (
                <div className="glass-modern p-2 rounded-[2rem] overflow-hidden">
                  <AnimePlayer
                    episodeId={currentEpisode.id}
                    episodeNumber={currentEpisodeNumber}
                    animeTitle={anime.title}
                    onNext={handleNextEpisode}
                    onPrevious={handlePreviousEpisode}
                    hasNext={currentEpisodeNumber < episodes.length}
                    hasPrevious={currentEpisodeNumber > 1}
                  />
                </div>
              ) : (
                <div className="aspect-video glass-modern rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                  <div className="text-4xl mb-6">🚫</div>
                  <h3 className="text-xl font-bold mb-2">
                    Streaming Unavailable
                  </h3>
                  <p className="text-white/40 max-w-md">
                    We couldn't find a compatible video source for this title.
                    Please try again later.
                  </p>
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="glass-card-modern rounded-3xl overflow-hidden h-auto md:h-[600px] flex flex-col">
                <div className="p-6 border-b border-white/5">
                  <h3 className="font-black tracking-tighter">EPISODES</h3>
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
                <h2 className="text-3xl font-black mb-6 tracking-tighter italic">
                  SYNOPSIS
                </h2>
                <p className="text-lg text-white/60 leading-relaxed font-medium">
                  {anime.synopsis || "No description available for this anime."}
                </p>
              </section>

              {anime.trailer?.embed_url && (
                <section>
                  <h2 className="text-3xl font-black mb-6 tracking-tighter italic">
                    TRAILER
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
                <h3 className="font-black mb-6 tracking-tighter">DETAILS</h3>
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
                          className="flex justify-between items-start gap-4 py-2 border-b border-white/5"
                        >
                          <span className="text-xs font-bold text-white/30 uppercase tracking-widest">
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
      <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">
        {character.role}
      </p>
    </div>
  );
}
