export function normalize(value) { return String(value ?? '').trim().toLowerCase(); }
export function amenityList(value) {
  if (Array.isArray(value)) return value;
  try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed; } catch { /* Legacy comma-separated amenities. */ }
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}
export function matchesListing(property, filters) {
  for (const key of ['campus', 'type', 'gender_policy', 'furnishing_status']) {
    if (filters[key] && filters[key] !== 'all' && normalize(property[key]) !== normalize(filters[key])) return false;
  }
  if (filters.maxPrice && Number(property.price) > Number(filters.maxPrice)) return false;
  if (filters.verified && !property.verified) return false;
  const available = amenityList(property.amenities).map(normalize);
  if (!(filters.amenities || []).every(amenity => available.includes(normalize(amenity)))) return false;
  const query = normalize(filters.search);
  return !query || ['title', 'location', 'type'].some(key => normalize(property[key]).includes(query));
}
