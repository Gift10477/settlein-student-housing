import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesAmenities, searchAmenities } from '../src/lib/amenityFilters.js';

test('selected amenities narrow results using all selected requirements', () => {
  const properties = [{ amenities: ['Wi-Fi', 'CCTV'] }, { amenities: ['Wi-Fi'] }, { amenities: null }];
  assert.equal(properties.filter(p => matchesAmenities(p, ['Wi-Fi', 'CCTV'])).length, 1);
  assert.equal(properties.filter(p => matchesAmenities(p, ['Gym'])).length, 0);
  assert.equal(properties.filter(p => matchesAmenities(p, [])).length, 3);
});
test('handles arrays, comma strings, JSON and wifi formatting', () => {
  for (const amenities of [[' WIFI ', 'CCTV'], 'Wi-Fi, CCTV', '["Wi Fi", "cctv"]']) {
    assert.equal(matchesAmenities({ amenities }, ['Wi-Fi', 'CCTV']), true);
  }
  assert.equal(matchesAmenities({ wifi_included: '1' }, ['Wi-Fi']), true);
  assert.equal(matchesAmenities({ wifi_included: '0' }, ['Wi-Fi']), false);
  assert.equal(matchesAmenities({ amenities: ['No Wi-Fi', 'Gymnasium'] }, ['Wi-Fi']), false);
});
test('search finds amenities without crashing on missing or malformed data', () => {
  assert.equal(searchAmenities({ amenities: ['Wi-Fi'] }, 'wifi'), true);
  assert.equal(searchAmenities({ amenities: 'Parking, Gym' }, 'gym'), true);
  for (const amenities of [undefined, null, '{}', '[1,null]', 5]) {
    assert.equal(searchAmenities({ amenities }, 'wifi'), false);
  }
});
