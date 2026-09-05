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