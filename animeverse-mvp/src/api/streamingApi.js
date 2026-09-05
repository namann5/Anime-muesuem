/**
 * Streaming API Client (Internal Backend Bridge)
 * Communicates with the backend server (localhost in dev, production URL in deployment)
 */

// Use environment variable for backend URL, fallback to localhost for development
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export { BACKEND_URL };

const JS_ANIMEPAHE_ERROR = Symbol("JS_ANIMEPAHE_ERROR");

async function fetchWithTimeout(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (response.status >= 500) {
      const err = new Error(`Stream server error (${response.status})`);
      err.code = JS_ANIMEPAHE_ERROR;
      throw err;
    }
    return response;
  } catch (error) {
    if (error.name === "AbortError") {
      const err = new Error("Stream server timed out");
      err.code = JS_ANIMEPAHE_ERROR;
      throw err;
    }
    if (error instanceof TypeError) {
      const err = new Error("Stream server unreachable");
      err.code = JS_ANIMEPAHE_ERROR;
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function isBackendError(error) {
  return !!error && error.code === JS_ANIMEPAHE_ERROR;
}

export { isBackendError };

// Public Consumet mirrors (CORS-enabled). These are fragile and rotate, so we try
// them in order and use the first one that actually answers with episodes.
const PUBLIC_MIRRORS = [
  "https://consumet-api-tau.vercel.app",
  "https://consumet-vert.vercel.app",
  "https://consumet-theta.vercel.app",
  "https://consumet-api-sigma.vercel.app",
];

const PUBLIC_PROVIDERS = ["gogoanime", "zoro"];

/**
 * Hunt for a working episode list for an AniList id on public Consumet mirrors.
 * Returns { base, provider, info } or null when everything is down.
 */
export async function getPublicStreamInfo(anilistId) {
  if (!anilistId) return null;
  for (const base of PUBLIC_MIRRORS) {
    for (const provider of PUBLIC_PROVIDERS) {
      try {
        const response = await fetchWithTimeout(
          `${base}/meta/anilist/info/${anilistId}?provider=${provider}`,
          20000
        );
        if (!response.ok) continue;
        const info = await response.json();
        if (info && info.episodes && info.episodes.length > 0) {
          console.log(
            `✅ Public stream found via ${base} (${provider}), ${info.episodes.length} episodes`
          );
          return { base, provider, info };
        }
      } catch (error) {
        // try the next mirror/provider
      }
    }
  }
  console.warn("⚠️ No public stream source answered with episodes");
  return null;
}

/**
 * Get playable sources for an episode from a public Consumet mirror.
 */
export async function getPublicStreamWatch(sourceBase, episodeId) {
  const response = await fetchWithTimeout(
    `${sourceBase}/meta/anilist/watch/${encodeURIComponent(episodeId)}?server=vidstreaming`,
    25000
  );
  if (!response.ok) throw new Error("Public watch fetch failed");
  return await response.json();
}

/**
 * Search anime on the streaming provider (AnimePahe)
 */
export async function searchStreamingAnime(query) {
  const response = await fetchWithTimeout(
    `${BACKEND_URL}/search?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error("Search failed");
  return await response.json();
}

/**
 * Get detailed info and episode list from the streaming provider
 */
export async function getStreamingInfo(id) {
  const response = await fetchWithTimeout(`${BACKEND_URL}/info/${id}`);
  if (!response.ok) throw new Error("Info fetch failed");
  return await response.json();
}

/**
 * Get direct streaming / HLS links for an episode
 */
export async function getStreamingLinks(episodeId) {
  // URL encode the episode ID to handle special characters like slashes
  const encodedEpisodeId = encodeURIComponent(episodeId);
  const response = await fetchWithTimeout(`${BACKEND_URL}/watch/${encodedEpisodeId}`);
  if (!response.ok) throw new Error("Watch fetch failed");
  return await response.json();
}