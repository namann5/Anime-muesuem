import React, { useState, useEffect } from 'react';

export default function AnimePlayer({
    episodeId,
    episodeNumber,
    animeTitle,
    onNext,
    onPrevious,
    hasNext,
    hasPrevious
}) {
    const [loading, setLoading] = useState(true);
    const [playerUrl, setPlayerUrl] = useState('');

    useEffect(() => {
        if (!episodeId) return;
        loadEpisode();
    }, [episodeId]);

    async function loadEpisode() {
        setLoading(true);

        // AnimePahe uses iframe embeds
        // The episode ID from AnimePahe is in format like: "naruto/episode-1"
        // We'll use AnimePahe's embed URL
        const embedUrl = `https://animepahe.com/play/${episodeId}`;

        console.log('Loading AnimePahe player:', embedUrl);
        setPlayerUrl(embedUrl);

        // Quick load - no delays
        setTimeout(() => setLoading(false), 500);
    }

    return (
        <div className="space-y-4">
            {/* Player Container */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-anime-dark z-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-anime-pink/20 border-t-anime-pink rounded-full animate-spin"></div>
                            <span className="text-white/40 text-xs font-bold tracking-widest uppercase animate-pulse">Loading Player</span>
                        </div>
                    </div>
                )}

                <iframe
                    src={playerUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                    title={`${animeTitle} - Episode ${episodeNumber}`}
                    onLoad={() => setLoading(false)}
                />
            </div>

            {/* Episode Info & Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Now Watching</span>
                    <div className="text-white font-black text-xl flex items-center gap-2">
                        Episode <span className="text-anime-pink">{episodeNumber}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onPrevious}
                        disabled={!hasPrevious}
                        className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg border border-white/10 text-white font-bold transition-all active:scale-95"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        Prev
                    </button>

                    <button
                        onClick={onNext}
                        disabled={!hasNext}
                        className="group flex items-center gap-2 bg-anime-pink text-white disabled:opacity-20 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg font-black hover:bg-opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-anime-pink/20"
                    >
                        Next
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    <button
                        onClick={loadEpisode}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all"
                        title="Reload Player"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-br from-anime-pink/5 to-purple-500/5 border border-anime-pink/20 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-anime-pink/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-anime-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white font-bold text-sm mb-1">🎬 Streaming via AnimePahe</h4>
                        <p className="text-white/60 text-xs leading-relaxed">
                            High-quality anime streaming. Use fullscreen for the best experience!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
