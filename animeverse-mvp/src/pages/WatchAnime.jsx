import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getTop100Anime } from '../services/animeService';
import RealTimeSearch from '../components/RealTimeSearch';
import { AnimeGridSkeleton, HeroSkeleton } from '../components/SkeletonLoader';

export default function WatchAnime() {
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAnime();
    }, []);

    async function loadAnime() {
        try {
            setLoading(true);
            const anime = await getTop100Anime();
            setAnimeList(anime);
        } catch (err) {
            console.error('WatchAnime load error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Categorize anime
    const trending = useMemo(() => animeList.slice(0, 15), [animeList]);
    const popular = useMemo(() => [...animeList].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 15), [animeList]);
    const topRated = useMemo(() => [...animeList].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 15), [animeList]);
    const actionAnime = useMemo(() => animeList.filter(a => a.genres?.includes('Action')).slice(0, 15), [animeList]);

    const handleSelectAnime = (anime) => {
        window.location.hash = `anime/${anime.malId}`;
    };

    if (loading) return (
        <div className="min-h-screen bg-anime-dark">
            <HeroSkeleton />
            <div className="p-10 space-y-12">
                <AnimeRowSkeleton />
                <AnimeRowSkeleton />
                <AnimeRowSkeleton />
            </div>
        </div>
    );

    const heroAnime = trending[0];

    return (
        <div className="min-h-screen bg-anime-dark pb-20 overflow-x-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            {/* Hero Section */}
            {heroAnime && (
                <section className="relative h-[90vh] w-full overflow-hidden">
                    <img
                        src={heroAnime.bannerImage || heroAnime.images?.jpg?.large_image_url}
                        alt={heroAnime.title}
                        className="w-full h-full object-cover animate-image-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-anime-dark via-anime-dark/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-anime-dark/90 via-anime-dark/20 to-transparent"></div>

                    <div className="absolute bottom-32 left-6 md:left-12 max-w-3xl space-y-6 z-10">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-anime-pink text-white text-[10px] font-black rounded-sm uppercase tracking-[0.2em] shadow-lg">
                                Netflix Original
                            </span>
                            <span className="text-white/60 text-sm font-bold tracking-widest uppercase">
                                Trending #{heroAnime.rank || 1}
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] drop-shadow-2xl">
                            {heroAnime.title}
                        </h1>

                        <div className="flex items-center gap-4 text-white/80 font-bold text-sm">
                            <span className="text-green-400">{Math.round((heroAnime.score || 8.5) * 10)}% Match</span>
                            <span>{heroAnime.year || 2023}</span>
                            <span className="border border-white/40 px-1.5 py-0.5 rounded-sm text-[10px]">HD</span>
                            <span>{heroAnime.episodes || '?'} Episodes</span>
                        </div>

                        <p className="text-lg text-white/80 line-clamp-3 max-w-2xl font-medium leading-relaxed drop-shadow-md">
                            {heroAnime.synopsis}
                        </p>

                        <div className="flex flex-wrap gap-4 pt-6">
                            <button
                                onClick={() => handleSelectAnime(heroAnime)}
                                className="bg-white text-dark px-10 py-4 rounded-md font-black flex items-center gap-3 hover:bg-white/90 transition-all transform hover:scale-105 active:scale-95 shadow-2xl text-xl"
                            >
                                <svg className="w-8 h-8 fill-dark" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                Play
                            </button>
                            <button
                                onClick={() => handleSelectAnime(heroAnime)}
                                className="bg-white/20 backdrop-blur-xl text-white px-10 py-4 rounded-md font-black flex items-center gap-3 hover:bg-white/30 transition-all shadow-2xl text-xl border border-white/10"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                More Info
                            </button>
                        </div>
                    </div>

                    {/* Navigation/Search Overlay */}
                    <div className="absolute top-28 left-0 right-0 px-6 md:px-12 z-50">
                        <div className="max-w-4xl mx-auto">
                            <RealTimeSearch onSelect={handleSelectAnime} />
                        </div>
                    </div>
                </section>
            )}

            {/* Content Rows */}
            <div className="md:-mt-24 relative z-20 pb-20 pl-6 md:pl-12 space-y-12">
                <AnimeRow title="Trending Hits" animeList={trending} onSelect={handleSelectAnime} />
                <AnimeRow title="Most Popular" animeList={popular} onSelect={handleSelectAnime} />
                <AnimeRow title="Top Rated for You" animeList={topRated} onSelect={handleSelectAnime} />
                <AnimeRow title="Action Packed" animeList={actionAnime} onSelect={handleSelectAnime} />
            </div>
        </div>
    );
}

function AnimeRow({ title, animeList, onSelect }) {
    const rowRef = useRef(null);

    const scroll = (direction) => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
            rowRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="space-y-4 group">
            <h2 className="text-xl md:text-2xl font-black text-white/90 tracking-tight flex items-center gap-2 group-hover:text-white transition-colors">
                {title}
                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </h2>

            <div className="relative">
                {/* Scroll Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 w-12 z-30 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 flex items-center justify-center -ml-12 md:-ml-12"
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                </button>

                <div
                    ref={rowRef}
                    className="flex gap-2 md:gap-3 overflow-x-auto hide-scrollbar scroll-smooth pr-10"
                >
                    {animeList.map((anime) => (
                        <NetflixCard key={anime.malId} anime={anime} onClick={() => onSelect(anime)} />
                    ))}
                </div>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 w-12 z-30 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 flex items-center justify-center"
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </section>
    );
}

function NetflixCard({ anime, onClick }) {
    const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

    return (
        <div
            onClick={onClick}
            className="flex-none w-[160px] md:w-[240px] aspect-[16/9] md:aspect-[16/9] relative bg-white/5 rounded-sm overflow-hidden transition-all duration-300 cursor-pointer hover:z-50 hover:scale-125 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
        >
            <img
                src={imageUrl}
                alt={anime.title}
                className="w-full h-full object-cover rounded-sm"
            />

            {/* Hover Reveal Details */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <div className="space-y-1">
                    <h3 className="font-bold text-white text-[10px] md:text-sm leading-tight drop-shadow-lg">
                        {anime.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[8px] font-black text-green-400">
                        <span>{Math.round((anime.score || 8.5) * 10)}% Match</span>
                        <span className="text-white border border-white/40 px-1 py-0 rounded-[2px]">{anime.year || 2023}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnimeRowSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-8 w-48 bg-white/5 rounded-md animate-pulse"></div>
            <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex-none w-[240px] aspect-[16/9] bg-white/5 rounded-sm animate-pulse"></div>
                ))}
            </div>
        </div>
    );
}

