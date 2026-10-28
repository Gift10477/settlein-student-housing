function marketRequest(env, county) {
  const url = new URL(env.SHAMBA_API_URL);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('Invalid partner URL');
  }
  const prefix = url.pathname.replace(/\/+$/, '');
  url.pathname = `${prefix}${prefix.endsWith('/api') ? '' : '/api'}/market-prices`;
  if (county) url.searchParams.set('county', county.trim());
  const headers = {};
  if (env.SHAMBA_API_KEY) {
    const name = env.SHAMBA_API_KEY_HEADER || 'X-API-Key';
    const prefix = env.SHAMBA_API_KEY_PREFIX || '';
    if (!/^[!#$%&'*+.^_`|~0-9a-z-]+$/i.test(name) || /[\r\n]/.test(prefix) || /[\r\n]/.test(env.SHAMBA_API_KEY)) throw new Error('Invalid auth configuration');
    headers[name] = `${prefix ? `${prefix.trim()} ` : ''}${env.SHAMBA_API_KEY}`;
  }
  return { url, options: { headers, redirect: 'error' } };
}
module.exports = { marketRequest };
