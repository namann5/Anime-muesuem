const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

let animepahe;
let providerReady = false;

// AnimePahe frequently rotates domains (blocks/CDN). Try each in order.
// .ru/.org/.com are the "official" domains but sit behind Cloudflare walls;
// the mirror domains below are reachable and serve the same API.
const ANIMEPAHE_DOMAINS = [
    'https://animepahe.tv',
    'https://animepahe.net',
    'https://animepahe.cc',
    'https://animepahe.online',
    'https://animepahe.ru',
    'https://animepahe.org',
    'https://animepahe.com',
];

async function findWorkingDomain() {
    // Probe every domain concurrently, capped at ~6s each, pick whichever succeeds first.
    // A domain only counts if it serves the REAL API JSON (clones return HTML to /api).
    const probes = ANIMEPAHE_DOMAINS.map(async (domain) => {
        const res = await axios.get(`${domain}/api?m=airing`, {
            timeout: 6000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
                'Referer': domain + '/',
            },
        });
        const ct = String(res.headers['content-type'] || '');
        if (res.status === 200 && ct.includes('application/json')) return domain;
        throw new Error(`not-real-api (${res.status} ${ct})`);
    });

    const firstSuccess = new Promise((resolve) => {
        probes.forEach((p) => p.then(resolve, () => {}));
    });
    const hardCap = new Promise((resolve) =>
        setTimeout(() => resolve(null), 12000)
    );

    const domain = await Promise.race([firstSuccess, hardCap]);
    if (domain && domain.startsWith('https://')) {
        console.log(`✅ AnimePahe domain reachable: ${domain}`);
        return domain;
    }
    console.warn('⚠️ No real AnimePahe API domain reachable, defaulting to .ru');
    return ANIMEPAHE_DOMAINS[4];
}

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
            // Consumet packages hardcode a (frequently dead) domain. Point at a live mirror.
            const workingDomain = await findWorkingDomain();
            animepahe.baseUrl = workingDomain;
            providerReady = true;
            console.log(`✅ Consumet provider (AnimePahe) initialized successfully on ${workingDomain}`);
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

// Wait for the provider to finish probing on cold start (serverless-friendly):
// the first request may arrive while initProvider is still running.
async function waitForProvider(timeoutMs = 13000) {
    if (providerReady) return true;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (providerReady) return true;
        await new Promise((r) => setTimeout(r, 250));
    }
    return providerReady;
}

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

// Express router for all streaming API routes. Mounted at BOTH /api and /
// so it works regardless of how the host strips the /api prefix.
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', provider: 'AnimePahe', ready: providerReady });
});

// Search Anime
apiRouter.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });
    if (!(await waitForProvider())) return res.status(503).json({ error: 'Provider not ready' });

    try {
        const results = await animepahe.search(query);
        res.json(results || { results: [] });
    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ error: 'Failed to search anime', message: error.message });
    }
});

// Get Anime Info (including episodes)
apiRouter.get('/info/:id', async (req, res) => {
    const id = req.params.id;
    if (!(await waitForProvider())) return res.status(503).json({ error: 'Provider not ready' });

    try {
        const info = await animepahe.fetchAnimeInfo(id);
        res.json(info || { episodes: [] });
    } catch (error) {
        console.error('Info error:', error.message);
        res.status(500).json({ error: 'Failed to fetch anime info', message: error.message });
    }
});

// Get Episode Streaming Links
apiRouter.get('/watch/:episodeId', async (req, res) => {
    // Decode the episode ID to handle special characters (AnimePahe uses slashes in episode IDs)
    const episodeId = decodeURIComponent(req.params.episodeId);
    if (!(await waitForProvider())) return res.status(503).json({ error: 'Provider not ready' });

    try {
        const sources = await animepahe.fetchEpisodeSources(episodeId);
        res.json(sources || { sources: [] });
    } catch (error) {
        console.error('Watch error:', error.message);
        res.status(500).json({ error: 'Failed to fetch streaming links', message: error.message });
    }
});

// Proxy endpoint to bypass CORS for HLS streams
apiRouter.get('/proxy', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const response = await axios.get(url, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://animepahe.com/',
                'Origin': 'https://animepahe.com'
            }
        });

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (response.headers['content-type']) {
            res.setHeader('Content-Type', response.headers['content-type']);
        }

        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ error: 'Failed to proxy request' });
    }
});

app.use('/api', apiRouter);
app.use('/', apiRouter);

// Only listen directly when run as a standalone server (not a serverless function)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    });
}

// Error handler: always respond with the underlying message so failures are debuggable
app.use((err, req, res, next) => {
    console.error('💥 Unhandled error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Internal server error', message: err && err.message });
});

// Export for serverless adapters (Vercel @vercel/node, etc.)
module.exports = app;
