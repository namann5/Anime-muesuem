// Test search for "I Want to Eat Your Pancreas"
async function testSearch() {
    const query = `
        query ($search: String) {
            Page (page: 1, perPage: 10) {
                media (search: $search, type: ANIME, sort: SEARCH_MATCH) {
                    id
                    idMal
                    title {
                        romaji
                        english
                        native
                    }
                    type
                    format
                    episodes
                    averageScore
                    coverImage {
                        large
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { search: "I Want to Eat Your Pancreas" }
            }),
        });

        const data = await response.json();
        console.log('Search results:', JSON.stringify(data.data.Page.media, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testSearch();
