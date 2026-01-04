import {
  searchStreamingAnime,
  getStreamingInfo,
  getStreamingLinks,
} from "./streamingApi";

/**
 * AniList API Client (GraphQL)
 * Replaces Jikan API for better performance and reliability.
 */

const ANILIST_API = "https://graphql.anilist.co";

/**
 * Generic GraphQL Fetcher
 */
async function fetchGraphQL(query, variables = {}) {
  try {
    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList network error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      console.error("AniList GraphQL Errors:", data.errors);
      throw new Error(data.errors[0].message);
    }

    return data.data;
  } catch (error) {
    console.error("AniList fetch error:", error);
    throw error;
  }
}

// --- Queries ---

const MEDIA_FRAGMENT = `
  id
  idMal
  title {
    romaji
    english
    native
  }
  type
  format
  status
  description
  startDate { year month day }
  season
  seasonYear
  episodes
  duration
  chapters
  volumes
  genres
  synonyms
  averageScore
  meanScore
  popularity
  favourites
  isAdult
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  trailer {
    id
    site
    thumbnail
  }
  studios(isMain: true) {
    nodes {
      id
      name
    }
  }
`;

/**
 * Get Top Anime
 */
export async function getTopAnime(page = 1, perPage = 20) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page (page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media (type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { page, perPage });
  return data.Page.media;
}

/**
 * Get Anime Details by ID
 */
export async function getAnimeById(id) {
  const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        ${MEDIA_FRAGMENT}
        relations {
          edges {
            relationType
            node {
              id
              title {
                romaji
              }
              coverImage {
                medium
              }
            }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { id });
  return data.Media;
}

/**
 * Get Anime Characters
 */
export async function getAnimeCharacters(id) {
  const query = `
    query ($id: Int) {
      Media (id: $id) {
        characters (sort: ROLE, perPage: 12) {
          edges {
            role
            node {
              id
              name {
                full
                native
              }
              image {
                large
              }
            }
            voiceActors (language: JAPANESE, sort: ROLE) {
              id
              name {
                full
              }
              image {
                large
              }
            }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { id });
  return data.Media.characters.edges;
}

/**
 * Get Recommendations
 */
export async function getAnimeRecommendations(id) {
  const query = `
    query ($id: Int) {
      Media (id: $id) {
        recommendations (sort: RATING_DESC, perPage: 10) {
          nodes {
            mediaRecommendation {
              ${MEDIA_FRAGMENT}
            }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { id });
  return data.Media.recommendations.nodes
    .map((node) => node.mediaRecommendation)
    .filter(Boolean);
}

/**
 * Search Anime
 */
export async function searchAnime(searchText) {
  const query = `
    query ($search: String) {
      Page (page: 1, perPage: 10) {
        media (search: $search, type: ANIME, sort: SEARCH_MATCH) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { search: searchText });
  return data.Page.media;
}

// --- Streaming Logic (Consumet Bridge via Local Proxy) ---

/**
 * Find anime on AnimePahe with improved fallback
 */
export async function findAnimeByTitle(titleEnglish, titleRomaji) {
  // Try streaming search with English title first, then Romaji
  let match = await searchAnimePahe(titleEnglish);

  if (!match && titleRomaji && titleRomaji !== titleEnglish) {
    console.log(
      `No stream found for "${titleEnglish}", trying "${titleRomaji}"...`
    );
    match = await searchAnimePahe(titleRomaji);
  }

  // Last resort: Remove special characters and try again
  if (!match && titleEnglish) {
    const cleanTitle = titleEnglish.replace(/[^a-zA-Z0-9 ]/g, " ");
    if (cleanTitle !== titleEnglish) {
      match = await searchAnimePahe(cleanTitle);
    }
  }

  return match;
}

async function searchAnimePahe(query) {
  if (!query) return null;
  try {
    const data = await searchStreamingAnime(query);
    if (data.results && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  } catch (error) {
    console.warn("AnimePahe search error:", error);
    return null;
  }
}

/**
 * Get Episodes
 */
export async function getAnimeInfo(id) {
  return await getStreamingInfo(id);
}

/**
 * Get Stream Links
 */
export async function getEpisodeStream(episodeId) {
  return await getStreamingLinks(episodeId);
}
