/**
 * Streaming API Client (Internal Backend Bridge)
 * Communicates with the local Express server on port 3001
 */

const BACKEND_URL = 'http://localhost:3001/api';

/**
 * Search anime on the streaming provider (AnimePahe)
 */
export async function searchStreamingAnime(query) {
    try {
        const response = await fetch(`${BACKEND_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        return await response.json();
    } catch (error) {
        console.error('Streaming search error:', error);
        return { results: [] };
    }
}

/**
 * Get detailed info and episode list from the streaming provider
 */
export async function getStreamingInfo(id) {
    try {
        const response = await fetch(`${BACKEND_URL}/info/${id}`);
        if (!response.ok) throw new Error('Info fetch failed');
        return await response.json();
    } catch (error) {
        console.error('Streaming info error:', error);
        return { episodes: [] };
    }
}

/**
 * Get direct streaming / HLS links for an episode
 */
export async function getStreamingLinks(episodeId) {
    try {
        // URL encode the episode ID to handle special characters like slashes
        const encodedEpisodeId = encodeURIComponent(episodeId);
        const response = await fetch(`${BACKEND_URL}/watch/${encodedEpisodeId}`);
        if (!response.ok) throw new Error('Watch fetch failed');
        return await response.json();
    } catch (error) {
        console.error('Streaming watch error:', error);
        throw error;
    }
}
