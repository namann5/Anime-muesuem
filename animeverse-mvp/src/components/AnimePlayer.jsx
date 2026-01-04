import React, { useState, useEffect } from "react";
import { getStreamingLinks } from "../api/streamingApi";
import HLSPlayer from "./HLSPlayer";

export default function AnimePlayer({
  episodeId,
  episodeNumber,
  animeTitle,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}) {
  const [loading, setLoading] = useState(true);
  const [playerType, setPlayerType] = useState("hls"); // 'hls' or 'iframe'
  const [streamUrl, setStreamUrl] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!episodeId) return;
    loadEpisode();
  }, [episodeId]);

  async function loadEpisode() {
    setLoading(true);
    setError(null);

    try {
      // 1. Set fallback iframe URL
      const embedUrl = `https://animepahe.com/play/${episodeId}`;
      setIframeUrl(embedUrl);

      // 2. Try to get HLS streaming links from backend
      const data = await getStreamingLinks(episodeId);

      if (data.sources && data.sources.length > 0) {
        // Use the highest quality source (usually the last or specifically marked)
        // For AnimePahe, 720p/1080p is preferred.
        const bestSource =
          data.sources.find((s) => s.quality.includes("1080")) ||
          data.sources.find((s) => s.quality.includes("720")) ||
          data.sources[0];

        // Use proxy to bypass potential CORS/Referer issues
        // BACKEND_URL in streamingApi.js is http://localhost:3001/api
        const backendBase = "http://localhost:3001/api";
        const proxiedUrl = `${backendBase}/proxy?url=${encodeURIComponent(
          bestSource.url
        )}`;

        setStreamUrl(proxiedUrl);
        setPlayerType("hls");
      } else {
        setPlayerType("iframe");
      }
    } catch (err) {
      console.error("Failed to load stream:", err);
      setPlayerType("iframe");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Player Container */}
      <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-anime-dark z-20">
            <div className="flex flex-col items-center gap-4 max-w-md px-6">
              <div className="w-12 h-12 border-4 border-anime-pink/20 border-t-anime-pink rounded-full animate-spin"></div>
              <span className="text-white/40 text-xs font-bold tracking-widest uppercase animate-pulse">
                Initializing {playerType.toUpperCase()} Player
              </span>
            </div>
          </div>
        )}

        {playerType === "hls" && streamUrl ? (
          <HLSPlayer src={streamUrl} autoPlay={true} />
        ) : (
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            title={`${animeTitle} - Episode ${episodeNumber}`}
            onLoad={() => setLoading(false)}
          />
        )}
      </div>

      {/* Episode Info & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
            Now Watching
          </span>
          <div className="text-white font-black text-xl flex items-center gap-2">
            Episode <span className="text-anime-pink">{episodeNumber}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 ml-2 font-normal">
              {playerType === "hls" ? "AD-FREE HLS" : "EXTERNAL IFRAME"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setPlayerType(playerType === "hls" ? "iframe" : "hls")
            }
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all text-[10px] font-bold"
            title="Switch Player Type"
          >
            {playerType === "hls" ? "USE IFRAME" : "USE HLS"}
          </button>

          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg border border-white/10 text-white font-bold transition-all active:scale-95"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Prev
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="group flex items-center gap-2 bg-anime-pink text-white disabled:opacity-20 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg font-black hover:bg-opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-anime-pink/20"
          >
            Next
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-br from-anime-pink/5 to-purple-500/5 border border-anime-pink/20 p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-anime-pink/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-anime-pink"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm mb-1">
              🎬{" "}
              {playerType === "hls"
                ? "Streaming ad-free with HLS"
                : "Streaming via AnimePahe Embed"}
            </h4>
            <p className="text-white/60 text-xs leading-relaxed">
              {playerType === "hls"
                ? "Enjoy a clean viewing experience without ads. If the player doesn't load, try switching to 'USE IFRAME'."
                : "If you encounter ads, we recommend using an ad-blocker. Switch to 'USE HLS' for an ad-free experience."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
