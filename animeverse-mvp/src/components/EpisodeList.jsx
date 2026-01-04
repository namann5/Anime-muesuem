import React from "react";

export default function EpisodeList({
  episodes,
  currentEpisode,
  onSelectEpisode,
  animeTitle,
}) {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-anime-pink/20">
        <h3 className="text-xl font-bold text-white mb-4">Episodes</h3>
        <p className="text-anime-muted text-sm">No episodes available</p>
      </div>
    );
  }

  // Group episodes if there are many (e.g., > 50)
  const shouldGroup = episodes.length > 50;
  const groupSize = 50;

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-anime-pink/20">
      <h3 className="text-xl font-bold text-white mb-4">
        Episodes ({episodes.length})
      </h3>

      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
        {episodes.map((episode, index) => {
          const episodeNum = episode.number || index + 1;
          const isActive = currentEpisode?.id === episode.id;

          return (
            <button
              key={episode.id || index}
              onClick={() => onSelectEpisode(episode, episodeNum)}
              className={`
                                w-full text-left px-4 py-3 rounded-lg transition-all duration-200
                                ${
                                  isActive
                                    ? "bg-gradient-anime text-anime-dark font-bold shadow-lg shadow-anime-pink/30"
                                    : "bg-white/5 hover:bg-anime-pink/20 text-white border border-anime-pink/10 hover:border-anime-pink/50"
                                }
                            `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="font-medium">Episode {episodeNum}</span>
                  {episode.title &&
                    episode.title !== `Episode ${episodeNum}` && (
                      <p className="text-xs opacity-75 mt-1 line-clamp-1">
                        {episode.title}
                      </p>
                    )}
                </div>
                {isActive && <span className="ml-2 text-xl">▶️</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Range selector for long series */}
      {shouldGroup && (
        <div className="mt-4 pt-4 border-t border-anime-pink/20">
          <p className="text-xs text-anime-muted text-center">
            💡 Tip: Scroll to find your episode
          </p>
        </div>
      )}
    </div>
  );
}
