import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesPropertyOptions as matches } from '../src/lib/propertyFilters.js';
test('room filters match database labels and separator variants', () => {
  for (const [type, filter] of [['Bedsitter','bedsitter'],['Hostel Room','hostel'],['Shared Apartment','shared'],['Studio','studio'],['Single Room','single-room'],['2-Bedroom','2-bedroom']]) assert.equal(matches({type},{type:filter}),true);
  assert.equal(matches({type:'Bedsitter'},{type:'studio'}),false);
});
test('gender and furnishing filters combine and exclude unknown values', () => {
  const filters={gender_policy:'Female-only',furnishing_status:'Furnished'};
  assert.equal(matches({gender_policy:' female only ',furnishing_status:'Furnished'},filters),true);
  assert.equal(matches({gender_policy:'Female-only',furnishing_status:'Unfurnished'},filters),false);
  assert.equal(matches({},filters),false);
  assert.equal(matches({}, {type:'all',gender_policy:'all',furnishing_status:'all'}),true);
});
