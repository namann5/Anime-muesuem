import React, { useState, useEffect } from "react";
import animeTimeline from "../data/animeTimeline";

function AnimeTimeline() {
    const [selectedEra, setSelectedEra] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [particles, setParticles] = useState([]);

    // Track scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;
            setScrollProgress((currentScroll / totalScroll) * 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Generate particles
    useEffect(() => {
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 20,
            duration: 15 + Math.random() * 10
        }));
        setParticles(newParticles);
    }, []);

    const themeColors = {
        retro: {
            primary: '#ec4899',
            secondary: '#f472b6',
            glow: 'glow-pink',
            gradient: 'from-pink-500 to-rose-500'
        },
        ghibli: {
            primary: '#10b981', // Nature Green for Ghibli
            secondary: '#34d399',
            glow: 'glow-blue',
            gradient: 'from-emerald-500 to-teal-500'
        },
        action: {
            primary: '#f59e0b',
            secondary: '#fbbf24',
            glow: 'glow-pink',
            gradient: 'from-orange-500 to-yellow-500'
        },
        modern: {
            primary: '#ef4444', // Red for Attack on Titan
            secondary: '#f87171',
            glow: 'glow-purple',
            gradient: 'from-red-600 to-rose-900'
        },
        neon: {
            primary: '#00f2ff',
            secondary: '#7000ff',
            glow: 'glow-blue',
            gradient: 'from-cyan-400 to-purple-600'
        },
        classic: {
            primary: '#ffd700',
            secondary: '#ffa500',
            glow: 'glow-pink',
            gradient: 'from-yellow-400 to-orange-500'
        }
    };

    const eraStats = {
        '1960s': { shows: '50+', milestone: 'Astro Boy' },
        '1980s-90s': { shows: '300+', milestone: 'Spirited Away' },
        '2000s': { shows: '1000+', milestone: 'Naruto' },
        '2010s-Present': { shows: '5000+', milestone: 'Attack on Titan' }
    };

    return (
        <div className="min-h-screen aurora-bg cyber-grid relative overflow-hidden">
            {/* Animated Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className="particle absolute w-1 h-1 bg-white rounded-full opacity-50"
                        style={{
                            left: `${particle.left}%`,
                            animation: `float ${particle.duration}s infinite`,
                            animationDelay: `${particle.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* Mesh Gradient Overlay */}
            <div className="absolute inset-0 mesh-gradient opacity-20 pointer-events-none"></div>

            {/* Scroll Progress Bar */}
            <div className="fixed top-[104px] left-0 right-0 h-1 bg-white/5 z-[100]">
                <div
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                    style={{ width: `${scrollProgress}%` }}
                ></div>
            </div>

            {/* Header */}
            <header className="relative z-10 container mx-auto px-6 pt-24 pb-16 text-center">
                <div className="glass-card-3d holographic glow-purple inline-block px-10 py-6 rounded-3xl mb-8 float-slow neon-border">
                    <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient-x">
                        ⏰ Anime History Timeline
                    </h1>
                </div>
                <p className="text-2xl text-white/80 max-w-4xl mx-auto mb-4 animate-fade-in-up animation-delay-200">
                    Journey through <span className="text-pink-400 font-bold">50+ years</span> of animation evolution
                </p>
                <p className="text-white/60 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
                    From hand-drawn frames to digital masterpieces
                </p>
            </header>

            {/* Timeline Navigation */}
            <div className="relative z-10 container mx-auto px-6 mb-16">
                <div className="glass-card-3d holographic p-6 rounded-2xl">
                    <div className="flex flex-wrap justify-center gap-4">
                        {animeTimeline.map((era, index) => {
                            const colors = themeColors[era.theme] || themeColors.modern;
                            const isActive = selectedEra === index;
                            const stats = eraStats[era.era] || { shows: '???', milestone: 'Unknown' };

                            return (
                                <button
                                    key={era.era}
                                    onClick={() => setSelectedEra(isActive ? null : index)}
                                    className={`
                                        relative group px-8 py-4 rounded-xl font-bold
                                        transition-all duration-500 magnetic-button overflow-hidden
                                        ${isActive ? `neon-border ${colors.glow} scale-110` : 'glass-card-3d'}
                                        ${index % 2 === 0 ? 'float-slow' : 'float-medium'}
                                    `}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {/* Ripple effect */}
                                    <div className="absolute inset-0 ripple"></div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        <div className="text-white font-black text-lg mb-1">{era.era}</div>
                                        <div className={`text-xs bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                                            {stats.shows} Shows
                                        </div>
                                    </div>

                                    {/* Hover glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Timeline Content */}
            <div className="relative z-10 container mx-auto px-6 pb-20">
                {/* Vertical Timeline Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 via-purple-500 to-blue-500 opacity-30 hidden md:block"></div>

                <div className="space-y-24">
                    {animeTimeline.map((era, index) => {
                        const colors = themeColors[era.theme] || themeColors.modern; // Fallback to modern if undefined
                        const isExpanded = selectedEra === null || selectedEra === index;
                        const stats = eraStats[era.era] || { shows: '???', milestone: 'Unknown' }; // Fallback stats

                        return (
                            <div
                                key={era.era}
                                className={`
                                    relative transition-all duration-700
                                    ${isExpanded ? 'opacity-100 scale-100' : 'opacity-30 scale-90 blur-sm'}
                                `}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                                    <div className={`w-8 h-8 rounded-full ${colors.glow} neon-border animate-pulse`}></div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    {/* Content Side */}
                                    <div className={`${index % 2 === 0 ? 'md:order-1' : 'md:order-2'} space-y-6`}>
                                        {/* Main Card */}
                                        <div className={`card-3d perspective-2000 preserve-3d glass-card-3d holographic p-8 rounded-3xl ${colors.glow} liquid`}>
                                            <div className="card-3d-inner space-y-6">
                                                {/* Era Badge */}
                                                <div className="flex items-center gap-4">
                                                    <div className={`neon-border px-6 py-3 rounded-full ${colors.glow} float-slow`}>
                                                        <span className="text-white font-black text-lg depth-layer-3">
                                                            {era.era}
                                                        </span>
                                                    </div>
                                                    <div className="text-4xl animate-pulse">
                                                        {era.theme === 'retro' && '📺'}
                                                        {era.theme === 'neon' && '🎬'}
                                                        {era.theme === 'classic' && '🌟'}
                                                        {era.theme === 'action' && '⚡'}
                                                        {era.theme === 'modern' && '🚀'}
                                                    </div>
                                                </div>

                                                {/* Title */}
                                                <h2 className={`text-5xl font-black bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent depth-layer-2`}>
                                                    {era.title}
                                                </h2>

                                                {/* Description */}
                                                <p className="text-white/90 text-xl leading-relaxed depth-layer-1">
                                                    {era.description}
                                                </p>

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 gap-4 pt-4">
                                                    <div className={`glass-card-3d p-4 rounded-xl ${colors.glow} text-center`}>
                                                        <div className="text-3xl font-black text-white mb-1">{stats.shows}</div>
                                                        <div className="text-white/60 text-sm">Anime Shows</div>
                                                    </div>
                                                    <div className={`glass-card-3d p-4 rounded-xl ${colors.glow} text-center`}>
                                                        <div className="text-lg font-bold text-white mb-1">{stats.milestone}</div>
                                                        <div className="text-white/60 text-sm">Milestone</div>
                                                    </div>
                                                </div>

                                                {/* Decorative Line */}
                                                <div
                                                    className="h-1 rounded-full animate-pulse"
                                                    style={{
                                                        background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                                                        boxShadow: `0 0 20px ${colors.primary}`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Key Features */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className={`glass-card-3d holographic p-4 rounded-xl ${colors.glow} float-slow`}>
                                                <div className="text-2xl mb-2">🎨</div>
                                                <div className="text-white font-bold text-sm">Art Style</div>
                                                <div className="text-white/60 text-xs mt-1">
                                                    {era.theme === 'retro' && 'Hand-drawn'}
                                                    {era.theme === 'neon' && 'Experimental'}
                                                    {era.theme === 'classic' && 'Refined'}
                                                    {era.theme === 'action' && 'Dynamic'}
                                                    {era.theme === 'modern' && 'Digital HD'}
                                                </div>
                                            </div>
                                            <div className={`glass-card-3d holographic p-4 rounded-xl ${colors.glow} float-medium`}>
                                                <div className="text-2xl mb-2">📡</div>
                                                <div className="text-white font-bold text-sm">Distribution</div>
                                                <div className="text-white/60 text-xs mt-1">
                                                    {era.theme === 'retro' && 'TV Broadcast'}
                                                    {era.theme === 'neon' && 'VHS/OVA'}
                                                    {era.theme === 'classic' && 'Cable TV'}
                                                    {era.theme === 'action' && 'DVD/Streaming'}
                                                    {era.theme === 'modern' && 'Global Stream'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Side */}
                                    <div className={`${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                                        <div className={`card-3d perspective-2000 preserve-3d glass-card-3d holographic p-6 rounded-3xl ${colors.glow} ${index % 2 === 0 ? 'float-slow' : 'float-medium'}`}>
                                            <div className="card-3d-inner relative aspect-video rounded-2xl overflow-hidden">
                                                {/* YouTube Video (GIF Style) */}
                                                <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800">
                                                    {era.videoId ? (
                                                        <iframe
                                                            src={`https://www.youtube.com/embed/${era.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${era.videoId}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
                                                            title={`${era.title} - ${era.era}`}
                                                            className="w-full h-full rounded-2xl pointer-events-none"
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        ></iframe>
                                                    ) : (
                                                        <img
                                                            src={era.image}
                                                            alt={era.title}
                                                            className="w-full h-full object-cover rounded-2xl"
                                                        />
                                                    )}

                                                    {/* Badge */}
                                                    <div className="absolute top-4 left-4 glass-card-3d px-4 py-2 rounded-full glow-ring">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 ${era.videoId ? 'bg-red-500' : 'bg-blue-500'} rounded-full animate-pulse`}></div>
                                                            <span className="text-white text-xs font-bold">
                                                                {era.videoId ? 'LIVE SCENE' : 'FEATURED'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Holographic overlay */}
                                                <div className="absolute inset-0 holographic opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>

                                                {/* Frame decoration */}
                                                <div className={`absolute inset-0 border-4 border-transparent bg-gradient-to-r ${colors.gradient} opacity-0 hover:opacity-50 transition-opacity rounded-2xl`} style={{ padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="relative z-10 container mx-auto px-6 pb-24">
                <div className="card-3d perspective-2000 preserve-3d glass-card-3d holographic glow-pink p-16 rounded-3xl text-center neon-border liquid">
                    <div className="card-3d-inner space-y-6">
                        <div className="text-6xl mb-4 animate-pulse">🏛️</div>
                        <h3 className="text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                            Explore More Anime History
                        </h3>
                        <p className="text-white/80 text-xl mb-8 max-w-3xl mx-auto">
                            Visit our <span className="text-pink-400 font-bold">Virtual Museum</span> to see iconic characters from each era in stunning 3D
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="neon-border glow-purple px-10 py-5 rounded-full font-black text-white text-lg magnetic-button ripple holographic">
                                🏛️ Visit Museum
                            </button>
                            <button className="glass-card-3d holographic px-10 py-5 rounded-full font-bold text-white text-lg magnetic-button ripple">
                                🎨 View Gallery
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnimeTimeline;
