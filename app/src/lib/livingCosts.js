const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const positive = (value) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : 0;
const normalizeArea = (value) => typeof value === 'string'
  ? value.trim().replace(/\s+county$/i, '').replace(/\s+/g, ' ').toLowerCase() : '';
export function marketAreas(prices, propertyCounty) {
  const names = new Map();
  for (const name of [propertyCounty, ...prices.map((row) => row.county)]) {
    if (normalizeArea(name) && !names.has(normalizeArea(name))) names.set(normalizeArea(name), name.trim());
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b));
}
export function matchMarketArea(areas, propertyCounty, location) {
  // Only explicit counties or exact comma-separated address components match.
  // Do not infer geography from estate names, campus names or substrings.
  const candidates = normalizeArea(propertyCounty) ? [propertyCounty]
    : (typeof location === 'string' ? location.split(',') : []);
  return areas.find((area) => candidates.some((candidate) => normalizeArea(candidate) === normalizeArea(area))) || '';
}
export function filterMarketPrices(prices, area) {
  if (!normalizeArea(area)) return [];
  return prices.map((row, index) => ({ ...row, id: String(index) }))
    .filter((row) => normalizeArea(row.county) === normalizeArea(area));
}
export function foodLineCost(price, quantity) {
  return round(positive(price) * positive(quantity));
}
export function calculateLivingCosts(rows, quantities, rent, otherCosts) {
  const rentKnown = rent !== null && rent !== undefined && rent !== '' &&
    Number.isFinite(Number(rent)) && Number(rent) >= 0;
  const food = round(rows.reduce((sum, row) => sum + foodLineCost(row.price_per_kg, quantities[row.id]), 0));
  const hasBasket = rows.some((row) => positive(quantities[row.id]) > 0);
  const other = positive(otherCosts);
  return { food, hasBasket, rentKnown, other,
    total: hasBasket && rentKnown ? round(Number(rent) + food + other) : null };
}
