import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateLivingCosts, foodLineCost, marketAreas, matchMarketArea, filterMarketPrices } from '../src/lib/livingCosts.js';
const rows = [{ id: '0', price_per_kg: 80 }, { id: '1', price_per_kg: 120 }];
const areaPrices = [
  { crop_name: 'Rice', price_per_kg: 80, county: 'Nairobi' },
  { crop_name: 'Rice', price_per_kg: 60, county: 'Kiambu' },
  { crop_name: 'Potatoes', price_per_kg: 50, county: ' nairobi County ' },
  { crop_name: 'Maize', price_per_kg: 40, county: null },
];
test('area filter groups equivalent county names and excludes other/unknown locations', () => {
  assert.deepEqual(marketAreas(areaPrices), ['Kiambu', 'Nairobi']);
  assert.deepEqual(filterMarketPrices(areaPrices, 'Nairobi').map((row) => row.id), ['0', '2']);
  assert.deepEqual(filterMarketPrices(areaPrices, ''), []);
});
test('defaults only to an explicit county or an exact address component', () => {
  const areas = marketAreas(areaPrices, 'Mombasa');
  assert.equal(matchMarketArea(areas, 'Mombasa', 'Madaraka, Nairobi'), 'Mombasa');
  assert.equal(matchMarketArea(areas, undefined, 'Madaraka, Nairobi'), 'Nairobi');
  assert.equal(matchMarketArea(areas, undefined, 'Nairobi West'), '');
  assert.equal(matchMarketArea(areas, undefined, 'Madaraka'), '');
  assert.deepEqual(filterMarketPrices(areaPrices, 'Mombasa'), []);
});
test('the same monthly basket uses only the selected location prices', () => {
  assert.equal(calculateLivingCosts(filterMarketPrices(areaPrices, 'Nairobi'), { 0: 2, 1: 2 }, 10000, 0).total, 10160);
  assert.equal(calculateLivingCosts(filterMarketPrices(areaPrices, 'Kiambu'), { 0: 2, 1: 2 }, 10000, 0).total, 10120);
});
test('combines chosen monthly quantities, rent and entered expenses', () => {
  assert.deepEqual(calculateLivingCosts(rows, { 0: '2.5', 1: '3' }, 10000, '1500'),
    { food: 560, hasBasket: true, rentKnown: true, other: 1500, total: 12060 });
});
test('an empty basket is not represented as a complete zero-cost diet', () => {
  assert.equal(calculateLivingCosts(rows, {}, 10000, '').total, null);
});
test('county-filtered rows exclude quantities for other markets', () => {
  assert.equal(calculateLivingCosts([rows[1]], { 0: 100, 1: 2 }, 10000, 0).food, 240);
});
test('unknown rent prevents an apparently complete monthly total', () => {
  for (const rent of [undefined, null, '', 'unknown']) {
    assert.equal(calculateLivingCosts(rows, { 0: 2 }, rent, 0).total, null);
  }
});
test('rounds displayed line costs before summing and allows zero-price crops', () => {
  assert.equal(foodLineCost(3.33, 0.3), 1);
  assert.equal(calculateLivingCosts([{ id: '0', price_per_kg: 0 }], { 0: 2 }, 0, 0).total, 0);
});
test('negative or nonfinite quantities cannot lower or corrupt an estimate', () => {
  for (const quantity of [-5, Infinity, NaN, 'invalid']) assert.equal(foodLineCost(80, quantity), 0);
});
