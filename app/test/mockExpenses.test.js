import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialExpensePlan, estimateExpenses, transportAreas, universities } from '../src/lib/mockExpenses.js';

test('all mock areas support all four campus destinations', () => {
  for (const [area] of transportAreas) for (const campus of Object.keys(universities)) {
    const p = { ...initialExpensePlan(), area, campus };
    assert.equal(estimateExpenses(p).complete, true);
    assert.ok(estimateExpenses(p).transport >= 0);
  }
});
test('fares use return journeys and chosen travel days', () => {
  const p = initialExpensePlan('Madaraka Estate, Nairobi', 'strathmore');
  assert.equal(estimateExpenses(p).transport, 30 * 2 * 22);
  assert.equal(estimateExpenses({ ...p, fare: 50, days: 10 }).transport, 1000);
  assert.equal(estimateExpenses({ ...p, fare: 0 }).transport, 0);
});
test('unknown routes and missing expenses never produce complete totals', () => {
  const p = initialExpensePlan('Unmapped area', 'ku');
  assert.equal(estimateExpenses(p).total, null);
  assert.equal(estimateExpenses({ ...p, fare: 50 }).complete, true);
  assert.equal(estimateExpenses({ ...p, fare: 50, water: '' }).total, null);
  assert.equal(estimateExpenses({ ...p, fare: 50, days: '' }).total, null);
});
test('included utilities are not charged twice and string zero is not included', () => {
  const p = { ...initialExpensePlan(), fare: 0 };
  const a = estimateExpenses(p);
  const b = estimateExpenses(p, { water_included: '1', wifi_included: true, garbage_included: 1 });
  assert.equal(a.total - b.total, 1450);
  assert.equal(estimateExpenses(p, { water_included: '0' }).costs.water, 300);
});
