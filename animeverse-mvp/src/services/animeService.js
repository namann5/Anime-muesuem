/**
 * Anime Service
 * High-level service wrapping AniList API with caching and data transformation
 */

import * as anilistApi from "../api/anilistApi";

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_PREFIX = "animeverse_cache_";

/**
 * Cache utilities
 */
const cache = {
  set(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Failed to cache data:", error);
    }
  },

  get(key) {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > CACHE_DURATION) {
        this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn("Failed to read cache:", error);
      return null;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.warn("Failed to remove cache:", error);
    }
  },

  clear() {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  },
};

/**
 * Transform AniList anime data to app format
 */
function transformAnimeData(anime) {
  if (!anime) return null;

  // Map dates
  const year = anime.startDate?.year || anime.seasonYear;
  const season = anime.season ? anime.season.toLowerCase() : "unknown";

  return {
    malId: anime.id, // Using AniList ID as primary ID now
    idMal: anime.idMal, // Keep ref to MAL ID if needed
    title: anime.title.english || anime.title.romaji,
    titleEnglish: anime.title.english,
    titleJapanese: anime.title.native,
    titleRomaji: anime.title.romaji, // Useful for robust search
    type: anime.format, // TV, MOVIE, etc.
    episodes: anime.episodes,
    status: anime.status,
    airing: anime.status === "RELEASING",
    aired: year ? `${season} ${year}` : "Unknown",
    duration: anime.duration ? `${anime.duration} min` : null,
    rating: anime.isAdult ? "R+ (Adult)" : "PG-13", // Approximation
    score: anime.averageScore ? (anime.averageScore / 10).toFixed(2) : null, // Convert 100 scale to 10
    scoredBy: anime.popularity, // Using popularity as proxy for user count/scored
    rank: null, // AniList doesn't give a simple rank # like MAL in basic queries
    popularity: anime.popularity,
    members: anime.favourites, // Approx
    favorites: anime.favourites,
    synopsis: anime.description
      ? anime.description
          .replace(/<br>/g, "\n")
          .replace(/<i>/g, "")
          .replace(/<\/i>/g, "")
      : "",
    background: null,
    season: season,
    year: year,
    genres: anime.genres?.map((name, i) => ({ id: i, name })) || [],
    studios:
      anime.studios?.nodes?.map((s) => ({ id: s.id, name: s.name })) || [],

    // Image structure matching app (flat to nested)
    images: {
      jpg: {
        image_url: anime.coverImage?.large,
        large_image_url: anime.coverImage?.extraLarge,
        small_image_url: anime.coverImage?.medium,
      },
    },
    trailer: anime.trailer
      ? {
          embed_url: `https://www.youtube.com/embed/${anime.trailer.id}`,
        }
      : null,
    url: `https://anilist.co/anime/${anime.id}`,
  };
}

/**
 * Get top anime (cached)
 */
export async function getTop100Anime() {
  const cacheKey = "top_100_anime_anilist";
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log("Returning cached top anime");
    return cached;
  }

  try {
    console.log("Fetching top anime from AniList API...");
    // Fetch 50 items (AniList is fast, can get more)
    const animeList = await anilistApi.getTopAnime(1, 50);

    const transformed = animeList.map(transformAnimeData);
    cache.set(cacheKey, transformed);

    console.log(`Fetched and cached ${transformed.length} anime`);
    return transformed;
  } catch (error) {
    console.error("Failed to fetch top anime:", error);
    // Fallback to empty array to prevent app crash
    return [];
  }
}

/**
 * Get anime details by ID (cached)
 */
export async function getAnimeDetails(id) {
  const cacheKey = `anime_${id}_anilist`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const anime = await anilistApi.getAnimeById(id);
    const transformed = transformAnimeData(anime);
    cache.set(cacheKey, transformed);
    return transformed;
  } catch (error) {
    console.error(`Failed to fetch anime ${id}:`, error);
    throw error;
  }
}

/**
 * Get anime characters (cached)
 */
export async function getAnimeCharacters(id) {
  const cacheKey = `anime_${id}_characters_anilist`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const edges = await anilistApi.getAnimeCharacters(id);
    const transformed = edges.map((edge) => ({
      character: {
        malId: edge.node.id,
        name: edge.node.name.full,
        url: `https://anilist.co/character/${edge.node.id}`,
        images: {
          jpg: {
            image_url: edge.node.image?.large,
          },
        },
      },
      role: edge.role,
      voiceActors:
        edge.voiceActors?.map((va) => ({
          malId: va.id,
          name: va.name.full,
          language: "Japanese",
          images: {
            jpg: {
              image_url: va.image?.large,
            },
          },
        })) || [],
    }));

    cache.set(cacheKey, transformed);
    return transformed;
  } catch (error) {
    console.error(`Failed to fetch characters for anime ${id}:`, error);
    throw error;
  }
}

/**
 * Search anime with debouncing
 */
let searchTimeout;
export async function searchAnime(query) {
  return new Promise((resolve, reject) => {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      try {
        const results = await anilistApi.searchAnime(query);
        const transformed = results.map(transformAnimeData);
        resolve(transformed);
      } catch (error) {
        reject(error);
      }
    }, 500); // 500ms debounce
  });
}

/**
 * Get anime recommendations
 */
export async function getAnimeRecommendations(id) {
  const cacheKey = `anime_${id}_recommendations_anilist`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const recommendations = await anilistApi.getAnimeRecommendations(id);
    const transformed = recommendations.map(transformAnimeData);

    cache.set(cacheKey, transformed);
    return transformed;
  } catch (error) {
    console.error(`Failed to fetch recommendations for anime ${id}:`, error);
    return [];
  }
}

/**
 * Clear all cached anime data
 */
export function clearCache() {
  cache.clear();
}

export default {
  getTop100Anime,
  getAnimeDetails,
  getAnimeCharacters,
  searchAnime,
  getAnimeRecommendations,
  clearCache,
};
