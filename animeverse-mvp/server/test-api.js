// Quick test to see if AnimePahe API is working
const fetch = require('node-fetch');

async function testAnimePahe() {
    try {
        console.log('Testing AnimePahe search for "Naruto"...');
        const response = await fetch('http://localhost:3001/api/search?q=Naruto');
        const data = await response.json();
        console.log('Search results:', JSON.stringify(data, null, 2));

        if (data.results && data.results.length > 0) {
            const firstResult = data.results[0];
            console.log('\nFirst result ID:', firstResult.id);

            console.log('\nFetching episode info...');
            const infoResponse = await fetch(`http://localhost:3001/api/info/${firstResult.id}`);
            const infoData = await infoResponse.json();
            console.log('Episode count:', infoData.episodes?.length || 0);
            if (infoData.episodes && infoData.episodes.length > 0) {
                console.log('First episode:', infoData.episodes[0]);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testAnimePahe();
