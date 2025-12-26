import React, { useState, useEffect, useRef } from 'react';
import { searchAnime } from '../services/animeService';

export default function RealTimeSearch({ onSelect }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.trim().length > 1) { // Now requires 2+ characters
                setIsLoading(true);
                try {
                    const results = await searchAnime(query);
                    setSuggestions(results.slice(0, 10)); // Show top 10
                    setIsOpen(true);
                } catch (err) {
                    console.error('Search error:', err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto">
            <div className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, season, or episode..."
                    className="w-full bg-anime-dark/40 border border-white/10 rounded-full px-6 py-3 pl-12 text-white placeholder-white/40 focus:outline-none focus:border-anime-pink/50 focus:ring-2 focus:ring-anime-pink/20 transition-all backdrop-blur-md group-hover:border-white/20"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-anime-pink transition-colors">
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-anime-pink/30 border-t-anime-pink rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-anime-dark/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-2">
                        {suggestions.map((anime) => (
                            <button
                                key={anime.malId}
                                onClick={() => {
                                    onSelect(anime);
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                                className="w-full flex items-center gap-4 p-2 hover:bg-white/5 rounded-xl transition-colors text-left group/item"
                            >
                                <img
                                    src={anime.images?.jpg?.image_url}
                                    alt={anime.title}
                                    className="w-12 h-16 object-cover rounded-md shadow-md"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium truncate group-hover/item:text-anime-pink transition-colors">
                                        {anime.title}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-white/40">
                                        <span>{anime.type}</span>
                                        <span>•</span>
                                        <span>{anime.year || 'N/A'}</span>
                                        <span>•</span>
                                        <span className="text-anime-pink">⭐ {anime.score || '?'}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="bg-white/5 p-2 text-center">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Suggestions</span>
                    </div>
                </div>
            )}
        </div>
    );
}
