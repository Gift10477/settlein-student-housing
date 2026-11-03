const API = process.env.API || 'http://localhost:5000';
const KEY = process.env.KEY;
const N = Number(process.env.N || 60);

const mix = [
  { method: 'GET', path: '/api/properties', key: true },
  { method: 'GET', path: '/api/market-prices', key: true },
  { method: 'GET', path: '/api/properties/999999', key: true },
  { method: 'GET', path: '/api/properties', key: false },
  { method: 'GET', path: '/not-a-real-route', key: true },
];

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const counts = {};

  for (let i = 0; i < N; i += 1) {
    const request = mix[Math.floor(Math.random() * mix.length)];

    try {
      const response = await fetch(API + request.path, {
        method: request.method,
        headers: request.key
          ? { 'X-API-Key': KEY }
          : {},
      });

      counts[response.status] = (counts[response.status] || 0) + 1;
    } catch {
      counts.failed = (counts.failed || 0) + 1;
    }

    await pause(50);
  }

  console.log('Status codes received:', counts);
})();