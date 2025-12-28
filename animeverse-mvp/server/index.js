const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

let animepahe;
let providerReady = false;

// Dynamic import for ESM-only Consumet library
async function initProvider() {
    try {
        console.log('🔄 Initializing Consumet provider...');
        const consumet = await import('@consumet/extensions');
        // Handle different export structures
        const providers = consumet.ANIME || (consumet.default && consumet.default.ANIME);
        
        if (!providers) {
            throw new Error('Could not find ANIME providers in @consumet/extensions');
        }
        
        if (providers.AnimePahe) {
            animepahe = new providers.AnimePahe();
            providerReady = true;
            console.log('✅ Consumet provider (AnimePahe) initialized successfully');
        } else {
            throw new Error('AnimePahe provider not found in Consumet');
        }
    } catch (err) {
        console.error('❌ Failed to init provider:', err.message);
        // Retry after 5 seconds
        setTimeout(initProvider, 5000);
    }
}

initProvider();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        provider: 'AnimePahe',
        ready: providerReady 
    });
});

// Root route redirect for better UX
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #050505; color: white;">
            <h1 style="color: #ff00ff;">AnimeVerse API Server</h1>
            <p>The backend is running successfully on port ${PORT}.</p>
            <p>Please visit the frontend at: <a href="http://localhost:5173" style="color: #00ffff; text-decoration: none; font-weight: bold;">http://localhost:5173</a></p>
            <div style="margin-top: 20px; padding: 15px; background: #1a1a1a; border-radius: 8px; border: 1px solid #333;">
                <code style="color: #aaa;">Status: ${providerReady ? '✅ Ready' : '🔄 Initializing...'}</code>
            </div>
        </div>
    `);
});

// Search Anime
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });
    if (!providerReady) return res.status(503).json({ error: 'Provider not ready' });

    try {
        console.log(`🔍 Searching for: ${query}`);
        const results = await animepahe.search(query);
        res.json(results || { results: [] });
    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ error: 'Failed to search anime', message: error.message });
    }
});

// Get Anime Info (including episodes)
app.get('/api/info/:id', async (req, res) => {
    const id = req.params.id;
    if (!providerReady) return res.status(503).json({ error: 'Provider not ready' });
    
    try {
        console.log(`ℹ️ Fetching info for: ${id}`);
        const info = await animepahe.fetchAnimeInfo(id);
        res.json(info || { episodes: [] });
    } catch (error) {
        console.error('Info error:', error.message);
        res.status(500).json({ error: 'Failed to fetch anime info', message: error.message });
    }
});

// Get Episode Streaming Links
app.get('/api/watch/:episodeId', async (req, res) => {
    // Decode the episode ID to handle special characters (AnimePahe uses slashes in episode IDs)
    const episodeId = decodeURIComponent(req.params.episodeId);
    if (!providerReady) return res.status(503).json({ error: 'Provider not ready' });
    
    try {
        console.log(`📺 Fetching sources for episode: ${episodeId}`);
        const sources = await animepahe.fetchEpisodeSources(episodeId);
        res.json(sources || { sources: [] });
    } catch (error) {
        console.error('Watch error:', error.message);
        res.status(500).json({ error: 'Failed to fetch streaming links', message: error.message });
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
