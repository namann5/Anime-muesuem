async function investigateAnimePahe() {
    try {
        const consumet = await import('@consumet/extensions');
        const providers = consumet.ANIME || consumet.default.ANIME;
        const animepahe = new providers.AnimePahe();

        console.log('=== AnimePahe Investigation ===\n');

        // Step 1: Search
        console.log('Step 1: Searching for "Spy x Family"...');
        const searchResults = await animepahe.search('spy family');
        const firstResult = searchResults.results[0];
/* ARCHIVED: investigation script
    This file was archived during a repo cleanup. It is intentionally left empty.
    Remove this file manually if you want it deleted from version control.
*/

module.exports = {};
        console.log('\nStep 2: Getting anime info...');
        const info = await animepahe.fetchAnimeInfo(firstResult.id);
        console.log('Anime Title:', info.title);
        console.log('Total Episodes:', info.episodes.length);
        console.log('\nFirst Episode Structure:', JSON.stringify(info.episodes[0], null, 2));
        console.log('\nLast Episode Structure:', JSON.stringify(info.episodes[info.episodes.length - 1], null, 2));

        // Step 3: Try to get streaming sources with different ID formats
        console.log('\n\nStep 3: Testing different episode ID formats...\n');

        const episode = info.episodes[0];

        // Test 1: Direct ID
        console.log('Test 1: Using episode.id directly');
        try {
            const sources1 = await animepahe.fetchEpisodeSources(episode.id);
            console.log('✅ SUCCESS with episode.id!');
            console.log('Sources:', JSON.stringify(sources1, null, 2));
        } catch (err) {
            console.log('❌ FAILED:', err.message);
        }

        // Test 2: Episode number
        console.log('\nTest 2: Using episode.number');
        try {
            const sources2 = await animepahe.fetchEpisodeSources(episode.number);
            console.log('✅ SUCCESS with episode.number!');
            console.log('Sources:', JSON.stringify(sources2, null, 2));
        } catch (err) {
            console.log('❌ FAILED:', err.message);
        }

        // Test 3: Check if there's a session field
        if (episode.session) {
            console.log('\nTest 3: Using episode.session');
            try {
                const sources3 = await animepahe.fetchEpisodeSources(episode.session);
                console.log('✅ SUCCESS with episode.session!');
                console.log('Sources:', JSON.stringify(sources3, null, 2));
            } catch (err) {
                console.log('❌ FAILED:', err.message);
            }
        }

        // Test 4: Check all episode fields
        console.log('\n\nAll Episode Fields:');
        Object.keys(episode).forEach(key => {
            console.log(`  ${key}:`, episode[key]);
        });

    } catch (error) {
        console.error('Investigation failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

investigateAnimePahe();
