const normalize = value => typeof value === 'string'
  ? value.toLowerCase().replace(/[\s\p{P}]+/gu, '') : '';

export function amenityNames(property) {
  let items = property.amenities;
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch { items = items.split(','); }
  }
  const names = Array.isArray(items) ? items.filter(x => typeof x === 'string') : [];
  return [true, 1, '1'].includes(property.wifi_included) ? [...names, 'Wi-Fi'] : names;
}

export function matchesAmenities(property, selected = []) {
  const available = new Set(amenityNames(property).map(normalize));
  return selected.every(name => available.has(normalize(name)));
}

export function searchAmenities(property, query) {
  const term = normalize(query);
  return Boolean(term) && amenityNames(property).some(name => normalize(name).includes(term));
}
