import React, { useState, useEffect } from "react";
import animeTimeline from "../data/animeTimeline";

function AnimeTimeline() {
  const [selectedEra, setSelectedEra] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const themeLabels = {
    retro: "Hand-drawn",
    ghibli: "Nature",
    action: "Dynamic",
    modern: "Digital HD",
    neon: "Experimental",
    classic: "Refined",
  };

  const eraStats = {
    "1960s": { shows: "50+", milestone: "Astro Boy" },
    "1980s-90s": { shows: "300+", milestone: "Spirited Away" },
    "2000s": { shows: "1000+", milestone: "Naruto" },
    "2010s-Present": { shows: "5000+", milestone: "Attack on Titan" },
  };

  return (
    <div className="min-h-screen bg-anime-dark">
      {/* Scroll Progress Bar */}
      <div className="fixed top-20 left-0 right-0 h-[2px] bg-anime-line z-[100]">
        <div
          className="h-full bg-gradient-to-r from-anime-dark via-anime-terracotta to-anime-terracotta-soft transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative container mx-auto px-6 pt-32 pb-14 text-center">
        <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-anime-terracotta mb-5">
          A Chronicle of Motion
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
          Anime{" "}
          <span className="font-serif-accent font-normal italic text-anime-terracotta-soft">
            History
          </span>
          <br className="hidden md:block" />
          Timeline
        </h1>
        <p className="text-anime-cream-muted max-w-2xl mx-auto mt-6 text-base leading-relaxed">
          From hand-drawn frames to digital masterpieces — fifty years of
          animation evolution.
        </p>
      </header>

      {/* Timeline Navigation */}
      <div className="relative container mx-auto px-6 mb-16">
        <div className="flex flex-wrap justify-center gap-3">
          {animeTimeline.map((era, index) => {
            const stats = eraStats[era.era] || {
              shows: "???",
              milestone: "Unknown",
            };
            const isActive = selectedEra === index;

            return (
              <button
                key={era.era}
                onClick={() => setSelectedEra(isActive ? null : index)}
                className={`group px-6 py-3 rounded-full border text-left transition-all duration-300 ${
                  isActive
                    ? "border-anime-terracotta bg-anime-terracotta/10"
                    : "border-anime-line bg-dark-card hover:border-anime-terracotta/40"
                }`}
              >
                <div
                  className={`text-xs font-bold tracking-tight ${
                    isActive ? "text-anime-terracotta" : "text-anime-cream/80"
                  }`}
                >
                  {era.era}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-anime-cream-dim mt-0.5">
                  {stats.shows} shows
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="relative container mx-auto px-6 pb-20 max-w-4xl">
        <div className="space-y-14 border-l border-anime-line pl-8 md:pl-12 relative">
          {animeTimeline.map((era, index) => {
            const isExpanded = selectedEra === null || selectedEra === index;
            const stats = eraStats[era.era] || {
              shows: "???",
              milestone: "Unknown",
            };

            return (
              <div
                key={era.era}
                className={`relative transition-all duration-500 ${
                  isExpanded ? "opacity-100" : "opacity-25 blur-[2px]"
                }`}
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[41px] md:-left-[57px] top-8 w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                    isExpanded
                      ? "border-anime-terracotta bg-anime-dark shadow-[0_0_12px_rgba(217,122,92,0.6)]"
                      : "border-anime-line bg-anime-dark"
                  }`}
                ></div>

                <article className="bg-dark-card border border-anime-line rounded-2xl overflow-hidden transition-colors hover:border-anime-terracotta/40">
                  {/* Era Badge Row */}
                  <div className="flex items-center justify-between px-6 pt-6">
                    <span className="inline-flex px-3 py-1 rounded-full border border-anime-terracotta/40 text-anime-terracotta text-[10px] font-bold tracking-[0.2em] uppercase">
                      {era.era}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-anime-cream-dim">
                      {themeLabels[era.theme] || "Era"}
                    </span>
                  </div>

                  <div className="p-6">
                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">
                      {era.title}
                    </h2>

                    {/* Description */}
                    <p className="text-anime-cream-muted text-base leading-relaxed mt-3">
                      {era.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="rounded-xl border border-anime-line bg-anime-dark/60 p-4">
                        <div className="text-2xl font-bold text-anime-cream">
                          {stats.shows}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-anime-cream-dim mt-1">
                          Anime Shows
                        </div>
                      </div>
                      <div className="rounded-xl border border-anime-line bg-anime-dark/60 p-4">
                        <div className="text-base font-semibold text-anime-cream">
                          {stats.milestone}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-anime-cream-dim mt-1">
                          Milestone
                        </div>
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="rounded-xl border border-anime-line p-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-anime-terracotta mb-1">
                          Art Style
                        </div>
                        <div className="text-sm text-anime-cream/80">
                          {themeLabels[era.theme] || "Refined"}
                        </div>
                      </div>
                      <div className="rounded-xl border border-anime-line p-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-anime-terracotta mb-1">
                          Distribution
                        </div>
                        <div className="text-sm text-anime-cream/80">
                          {era.theme === "ghibli" || era.theme === "retro"
                            ? "TV Broadcast"
                            : era.theme === "neon"
                            ? "VHS/OVA"
                            : era.theme === "classic"
                            ? "Cable TV"
                            : era.theme === "action"
                            ? "DVD / Streaming"
                            : "Global Stream"}
                        </div>
                      </div>
                    </div>

                    {/* Decorative Line */}
                    <div className="h-px bg-gradient-to-r from-anime-terracotta to-transparent mt-6"></div>
                  </div>

                  {/* Media */}
                  <div className="px-6 pb-6">
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-anime-line bg-black">
                      {era.videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${era.videoId}?autoplay=0&mute=1&controls=0&loop=1&playlist=${era.videoId}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
                          title={`${era.title} - ${era.era}`}
                          className="w-full h-full pointer-events-none"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <img
                          src={era.image}
                          alt={era.title}
                          className="w-full h-full object-cover"
                        />
                      )}

                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-anime-dark/80 border border-anime-line backdrop-blur">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              era.videoId ? "bg-anime-terracotta" : "bg-anime-cream/60"
                            }`}
                          ></div>
                          <span className="text-anime-cream text-[9px] font-bold uppercase tracking-[0.15em]">
                            {era.videoId ? "Watch Scene" : "Featured"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative container mx-auto px-6 pb-28">
        <div className="bg-dark-card border border-anime-line rounded-2xl p-10 md:p-14 text-center">
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-anime-terracotta mb-4">
            Continue the Journey
          </p>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
            Explore the{" "}
            <span className="font-serif-accent font-normal italic text-anime-terracotta-soft">
              Virtual Museum
            </span>
          </h3>
          <p className="text-anime-cream-muted text-base mt-4 max-w-xl mx-auto mb-8">
            See iconic characters from each era rendered as gallery exhibits in
            a walkable 3D space.
          </p>
          <button
            onClick={() => (window.location.hash = "museum")}
            className="group inline-flex items-center gap-3 text-sm font-bold text-anime-terracotta uppercase tracking-[0.2em] transition-colors hover:text-anime-terracotta-soft"
          >
            <span className="h-px w-8 bg-anime-terracotta/60 group-hover:w-12 transition-all"></span>
            Visit the Museum
            <span className="h-px w-8 bg-anime-terracotta/60 group-hover:w-12 transition-all"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnimeTimeline;