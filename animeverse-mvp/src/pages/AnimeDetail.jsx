import React, { useState, useEffect } from 'react';
import { getAnimeDetails, getAnimeCharacters, getAnimeRecommendations } from '../services/animeService';
import { findAnimeByTitle, getAnimeInfo } from '../api/anilistApi';
import AnimePlayer from '../components/AnimePlayer';
import EpisodeList from '../components/EpisodeList';

export default function AnimeDetail({ malId, onBack }) {
    const [anime, setAnime] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('watch');

    // Streaming state
    const [gogoanimeData, setGogoanimeData] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState(1);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);

    useEffect(() => {
        loadAnimeData();
    }, [malId]);

    async function loadAnimeData() {
        try {
            setLoading(true);
            setError(null);

            const [animeData, charactersData, recommendationsData] = await Promise.all([
                getAnimeDetails(malId),
                getAnimeCharacters(malId).catch(() => []),
                getAnimeRecommendations(malId).catch(() => [])
            ]);

            setAnime(animeData);
            setCharacters(charactersData.slice(0, 12)); // Limit to top 12 characters
            setRecommendations(recommendationsData);

            // Load episodes from Gogoanime using robust search
            loadEpisodes(animeData.titleEnglish, animeData.titleRomaji);
        } catch (err) {
            setError('Failed to load anime details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function loadEpisodes(titleEnglish, titleRomaji) {
        try {
            setLoadingEpisodes(true);

            // Search for anime on AnimePahe with both titles
            const animepahe = await findAnimeByTitle(titleEnglish, titleRomaji);

            if (animepahe) {
                console.log('Found anime on AnimePahe:', animepahe);

                // Get full episode list
                const info = await getAnimeInfo(animepahe.id);
                console.log('Episode info:', info);

                setGogoanimeData(info);
                setEpisodes(info.episodes || []);

                // Auto-select first episode
                if (info.episodes && info.episodes.length > 0) {
                    setCurrentEpisode(info.episodes[0]);
                    setCurrentEpisodeNumber(1);
                }
            } else {
                console.log("Anime not found on AnimePahe");
            }
        } catch (err) {
            console.error('Failed to load episodes:', err);
        } finally {
            setLoadingEpisodes(false);
        }
    }

    const handleEpisodeSelect = (episode, episodeNumber) => {
        setCurrentEpisode(episode);
        setCurrentEpisodeNumber(episodeNumber);
        setActiveTab('watch'); // Switch to watch tab
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
            <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-16 h-16 border-4 border-anime-pink/30 border-t-anime-pink rounded-full animate-spin mb-4"></div>
                    <p className="text-anime-muted">Loading anime details...</p>
                </div>
            </div>
        );
    }

    if (error || !anime) {
        return (
            <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || 'Anime not found'}</p>
                    <button
                        onClick={onBack}
                        className="bg-gradient-anime text-anime-dark px-6 py-3 rounded-lg font-medium hover:scale-105 transition-transform"
                    >
                        ← Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    const bannerImage = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Back Button */}
            <div className="sticky top-0 z-20 bg-anime-dark/80 backdrop-blur-md border-b border-anime-pink/10">
                <div className="container mx-auto px-6 py-4">
                    <button
                        onClick={onBack}
                        className="text-anime-pink hover:text-white transition-colors flex items-center gap-2"
                    >
                        ← Back to Shop
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative">
                {/* Background Banner */}
                {bannerImage && (
                    <div className="absolute inset-0 h-96 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-anime-dark/50 to-anime-dark z-10"></div>
                        <img
                            src={bannerImage}
                            alt={anime.title}
                            className="w-full h-full object-cover object-top blur-sm opacity-30"
                        />
                    </div>
                )}

                <div className="relative z-10 container mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Poster */}
                        <div className="flex-shrink-0">
                            <img
                                src={bannerImage}
                                alt={anime.title}
                                className="w-64 rounded-xl shadow-2xl border-2 border-anime-pink/30"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-white">
                            <div className="flex items-start gap-4 mb-4">
                                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-anime bg-clip-text text-transparent">
                                    {anime.title}
                                </h1>
                                {anime.rank && (
                                    <span className="bg-gradient-anime text-anime-dark px-4 py-2 rounded-full text-lg font-bold shadow-lg flex-shrink-0">
                                        #{anime.rank}
                                    </span>
                                )}
                            </div>

                            {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                                <p className="text-xl text-anime-muted mb-2">{anime.titleEnglish}</p>
                            )}

                            {anime.titleJapanese && (
                                <p className="text-anime-muted mb-4">{anime.titleJapanese}</p>
                            )}

                            {/* Stats */}
                            <div className="flex flex-wrap gap-4 mb-6">
                                {anime.score && (
                                    <div className="bg-white/10 backdrop-blur-md border border-anime-pink/30 rounded-lg px-4 py-2">
                                        <div className="text-2xl font-bold text-anime-pink">⭐ {anime.score}</div>
                                        <div className="text-xs text-anime-muted">{anime.scoredBy?.toLocaleString()} users</div>
                                    </div>
                                )}
                                {anime.popularity && (
                                    <div className="bg-white/10 backdrop-blur-md border border-anime-pink/30 rounded-lg px-4 py-2">
                                        <div className="text-2xl font-bold text-anime-pink">#{anime.popularity}</div>
                                        <div className="text-xs text-anime-muted">Popularity</div>
                                    </div>
                                )}
                                {anime.members && (
                                    <div className="bg-white/10 backdrop-blur-md border border-anime-pink/30 rounded-lg px-4 py-2">
                                        <div className="text-2xl font-bold text-anime-pink">{(anime.members / 1000).toFixed(0)}K</div>
                                        <div className="text-xs text-anime-muted">Members</div>
                                    </div>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {anime.type && (
                                    <div>
                                        <div className="text-anime-muted text-sm">Type</div>
                                        <div className="font-medium">{anime.type}</div>
                                    </div>
                                )}
                                {anime.episodes && (
                                    <div>
                                        <div className="text-anime-muted text-sm">Episodes</div>
                                        <div className="font-medium">{anime.episodes}</div>
                                    </div>
                                )}
                                {anime.status && (
                                    <div>
                                        <div className="text-anime-muted text-sm">Status</div>
                                        <div className="font-medium">{anime.status}</div>
                                    </div>
                                )}
                                {anime.season && anime.year && (
                                    <div>
                                        <div className="text-anime-muted text-sm">Aired</div>
                                        <div className="font-medium capitalize">{anime.season} {anime.year}</div>
                                    </div>
                                )}
                            </div>

                            {/* Genres */}
                            {anime.genres && anime.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {anime.genres.map(genre => (
                                        <span
                                            key={genre.id}
                                            className="bg-anime-pink/20 text-anime-pink px-3 py-1 rounded-full text-sm border border-anime-pink/30"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Studios */}
                            {anime.studios && anime.studios.length > 0 && (
                                <div className="mb-4">
                                    <span className="text-anime-muted">Studio: </span>
                                    <span className="font-medium">{anime.studios.map(s => s.name).join(', ')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-6">
                <div className="flex gap-4 border-b border-anime-pink/20 mb-8">
                    <button
                        onClick={() => setActiveTab('watch')}
                        className={`px-6 py-3 font-medium transition-all ${activeTab === 'watch'
                            ? 'text-anime-pink border-b-2 border-anime-pink'
                            : 'text-anime-muted hover:text-white'
                            }`}
                    >
                        ▶️ Watch
                    </button>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-medium transition-all ${activeTab === 'overview'
                            ? 'text-anime-pink border-b-2 border-anime-pink'
                            : 'text-anime-muted hover:text-white'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('characters')}
                        className={`px-6 py-3 font-medium transition-all ${activeTab === 'characters'
                            ? 'text-anime-pink border-b-2 border-anime-pink'
                            : 'text-anime-muted hover:text-white'
                            }`}
                    >
                        Characters ({characters.length})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'watch' && (
                    <div className="pb-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Video Player - Takes 2 columns */}
                            <div className="lg:col-span-2">
                                {loadingEpisodes ? (
                                    <div className="aspect-video bg-anime-dark rounded-xl flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="inline-block w-16 h-16 border-4 border-anime-pink/30 border-t-anime-pink rounded-full animate-spin mb-4"></div>
                                            <p className="text-anime-muted">Loading episodes...</p>
                                        </div>
                                    </div>
                                ) : currentEpisode ? (
                                    <AnimePlayer
                                        episodeId={currentEpisode.id}
                                        episodeNumber={currentEpisodeNumber}
                                        animeTitle={anime.title}
                                        onNext={handleNextEpisode}
                                        onPrevious={handlePreviousEpisode}
                                        hasNext={currentEpisodeNumber < episodes.length}
                                        hasPrevious={currentEpisodeNumber > 1}
                                    />
                                ) : (
                                    <div className="aspect-video bg-anime-dark/50 rounded-xl border border-anime-pink/20 flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <div className="text-6xl mb-4">📺</div>
                                            <p className="text-anime-muted mb-2">
                                                No episodes found for streaming
                                            </p>
                                            <p className="text-sm text-anime-muted/70">
                                                This anime might not be available on AnimePahe
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Episode List Sidebar - Takes 1 column */}
                            <div className="lg:col-span-1">
                                <EpisodeList
                                    episodes={episodes}
                                    currentEpisode={currentEpisode}
                                    onSelectEpisode={handleEpisodeSelect}
                                    animeTitle={anime.title}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="pb-12">
                        {/* Synopsis */}
                        {anime.synopsis && (
                            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-anime-pink/10 mb-8">
                                <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
                                <p className="text-anime-muted leading-relaxed">{anime.synopsis}</p>
                            </div>
                        )}

                        {/* Trailer */}
                        {anime.trailer?.embed_url && (
                            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-anime-pink/10 mb-8">
                                <h2 className="text-2xl font-bold text-white mb-4">Trailer</h2>
                                <div className="aspect-video rounded-lg overflow-hidden">
                                    <iframe
                                        src={anime.trailer.embed_url}
                                        title="Anime Trailer"
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-anime-pink/10">
                                <h2 className="text-2xl font-bold text-white mb-4">Recommended Anime</h2>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {recommendations.map(rec => (
                                        <div
                                            key={rec.malId}
                                            onClick={() => window.location.hash = `anime/${rec.malId}`}
                                            className="cursor-pointer group"
                                        >
                                            <img
                                                src={rec.images?.jpg?.image_url}
                                                alt={rec.title}
                                                className="w-full aspect-[2/3] object-cover rounded-lg border border-anime-pink/20 group-hover:border-anime-pink transition-all"
                                            />
                                            <p className="text-white text-sm mt-2 line-clamp-2 group-hover:text-anime-pink transition-colors">
                                                {rec.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'characters' && (
                    <div className="pb-12">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {characters.map((char, index) => (
                                <CharacterCard key={index} character={char} animeId={malId} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function CharacterCard({ character, animeId }) {
    const char = character.character;
    const voiceActor = character.voiceActors?.find(va => va.language === 'Japanese');

    const viewInMuseum = () => {
        // Navigate to museum filtered by this anime
        window.location.hash = `museum/${animeId}`;
    };

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-anime-pink/10 hover:border-anime-pink/50 transition-all group">
            {/* Character Image */}
            <div className="relative aspect-[2/3] overflow-hidden bg-anime-dark/50">
                {char?.images?.jpg?.image_url ? (
                    <img
                        src={char.images.jpg.image_url}
                        alt={char.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-anime-muted">
                        <div className="text-6xl">👤</div>
                    </div>
                )}

                {/* Role Badge */}
                {character.role && (
                    <div className="absolute top-2 left-2 bg-anime-dark/90 text-anime-pink px-2 py-1 rounded text-xs font-bold border border-anime-pink/30">
                        {character.role}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">
                    {char?.name}
                </h3>

                {voiceActor && (
                    <p className="text-xs text-anime-muted mb-3">
                        CV: {voiceActor.name}
                    </p>
                )}

                <button
                    onClick={viewInMuseum}
                    className="w-full bg-gradient-anime text-anime-dark py-2 rounded-lg text-xs font-medium hover:scale-105 transition-transform"
                >
                    🏛️ View in Museum
                </button>
            </div>
        </div>
    );
}
