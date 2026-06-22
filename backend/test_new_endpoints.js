const API_URL = 'http://localhost:5000/api';

async function testNewEndpoints() {
  try {
    // 1. Fetch Page 2 of Trending Movies
    console.log('1. Fetching page 2 of trending movies...');
    const trendingRes = await fetch(`${API_URL}/movies/trending?page=2`);
    console.log('Trending Page 2 Status:', trendingRes.status);
    const trendingData = await trendingRes.json();
    console.log('Trending Page 2 Results Length:', trendingData.results ? trendingData.results.length : 0);
    console.log('First Movie on Page 2:', trendingData.results ? trendingData.results[0]?.title : 'None');
    console.log('Current Page:', trendingData.page);

    if (trendingRes.status !== 200) {
      throw new Error(`Trending page 2 failed: ${JSON.stringify(trendingData)}`);
    }

    // 2. Fetch Actor Filmography (Leonardo DiCaprio ID is 6193)
    console.log('\n2. Fetching Leonardo DiCaprio\'s movies (ID: 6193)...');
    const actorRes = await fetch(`${API_URL}/movies/actor/6193?page=1`);
    console.log('Actor Movies Status:', actorRes.status);
    const actorData = await actorRes.json();
    console.log('Actor Movies Results Length:', actorData.results ? actorData.results.length : 0);
    console.log('First Movie starring Leo:', actorData.results ? actorData.results[0]?.title : 'None');
    console.log('Current Page:', actorData.page);
    console.log('Total Pages:', actorData.total_pages);

    if (actorRes.status !== 200) {
      throw new Error(`Actor movies failed: ${JSON.stringify(actorData)}`);
    }

    console.log('\n✅ All new paginated and actor endpoints verified successfully!');
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  }
}

testNewEndpoints();
