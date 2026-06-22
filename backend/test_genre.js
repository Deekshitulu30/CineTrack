const API_URL = 'http://localhost:5000/api';

async function testGenreEndpoint() {
  try {
    console.log('1. Querying Action movies (Genre ID: 28)...');
    const res = await fetch(`${API_URL}/movies/genre/28?page=1`);
    console.log('Response Status:', res.status);
    const data = await res.json();
    console.log('Movies Received Length:', data.results ? data.results.length : 0);
    console.log('First Movie:', data.results ? data.results[0]?.title : 'None');
    console.log('Current Page:', data.page);
    console.log('Total Pages:', data.total_pages);

    if (res.status !== 200) {
      throw new Error(`Genre endpoint failed: ${JSON.stringify(data)}`);
    }

    console.log('\n✅ Genre endpoint verified successfully!');
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  }
}

testGenreEndpoint();
