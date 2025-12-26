const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

let animepahe;

// Dynamic import for ESM-only Consumet library
async function initProvider() {
    try {
        const consumet = await import('@consumet/extensions');
        // Handle different export structures
        const providers = consumet.ANIME || consumet.default.ANIME;
        animepahe = new providers.AnimePahe();
        console.log('✅ Consumet provider (AnimePahe) initialized successfully');
    } catch (err) {
        console.error('❌ Failed to init provider:', err);
    }
}

initProvider().catch(err => console.error('Failed to init provider:', err));

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', provider: 'AnimePahe' });
});

// Search Anime
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });
    if (!animepahe) return res.status(503).json({ error: 'Provider not ready' });

    try {
        const results = await animepahe.search(query);
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search anime' });
    }
});

// Get Anime Info (including episodes)
app.get('/api/info/:id', async (req, res) => {
    const id = req.params.id;
    if (!animepahe) return res.status(503).json({ error: 'Provider not ready' });
    try {
        const info = await animepahe.fetchAnimeInfo(id);
        res.json(info);
    } catch (error) {
        console.error('Info error:', error);
        res.status(500).json({ error: 'Failed to fetch anime info' });
    }
});

// Get Episode Streaming Links
app.get('/api/watch/:episodeId', async (req, res) => {
    // Decode the episode ID to handle special characters (AnimePahe uses slashes in episode IDs)
    const episodeId = decodeURIComponent(req.params.episodeId);
    if (!animepahe) return res.status(503).json({ error: 'Provider not ready' });
    try {
        const sources = await animepahe.fetchEpisodeSources(episodeId);
        res.json(sources);
    } catch (error) {
        console.error('Watch error:', error);
        res.status(500).json({ error: 'Failed to fetch streaming links' });
    }
});

// Proxy endpoint to bypass CORS for HLS streams
app.get('/api/proxy', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        console.log('Proxying request to:', url);

        const response = await axios.get(url, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://animepahe.com/',
                'Origin': 'https://animepahe.com'
            }
        });

        // Set appropriate headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Copy content type from original response
        if (response.headers['content-type']) {
            res.setHeader('Content-Type', response.headers['content-type']);
        }

        // Stream the response
        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ error: 'Failed to proxy request' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
