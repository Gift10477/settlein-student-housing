// Only this adapter knows the upstream response shape.
function parseRows(rows) {
  if (!Array.isArray(rows) || rows.some(row => !row || typeof row.crop_name !== 'string' ||
      !row.crop_name.trim() || typeof row.price_per_kg !== 'number' ||
      !Number.isFinite(row.price_per_kg) || row.price_per_kg < 0 ||
      (row.county !== undefined && row.county !== null && typeof row.county !== 'string'))) {
    throw new Error('Invalid market price response');
  }
  return rows.map(row => ({ crop_name: row.crop_name.trim(), price_per_kg: row.price_per_kg,
    county: row.county?.trim() || null }));
}
const versions = {
  v1: { path: '/market-prices', parse: parseRows },
  // Provisional envelope: enable only after Team 14 confirms both path and shape.
  v2: { path: '/v2/market-prices', parse: body => {
    if (!body || !Array.isArray(body.data) || !Number.isInteger(body.count) || body.count !== body.data.length) {
      throw new Error('unexpected v2 shape');
    }
    return parseRows(body.data);
  } },
};
function partnerVersion(env = process.env) {
  const version = versions[env.PARTNER_VERSION || 'v1'];
  if (!version) throw new Error('Unsupported partner version');
  return version;
}
module.exports = { versions, partnerVersion };
