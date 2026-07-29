// tests/progression.test.js
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Minimal localStorage stub for Node
beforeEach(() => {
  globalThis.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] ?? null; },
    setItem(k, v) { this._data[k] = String(v); },
  };
});

const { getAccessoryWeight, recordAccessorySet } = await import('../js/progression.js');

test('getAccessoryWeight returns startKg when nothing recorded yet', () => {
  assert.equal(getAccessoryWeight('upperC', 'Curl martillo', 14), 14);
});

test('recordAccessorySet keeps weight the same if reps below top of range', () => {
  recordAccessorySet('upperC', 'Curl martillo', [10, 9], [8, 12], 2, 14);
  assert.equal(getAccessoryWeight('upperC', 'Curl martillo', 14), 14);
});

test('recordAccessorySet bumps weight when every logged set reaches the top of the range', () => {
  recordAccessorySet('upperC', 'Curl martillo', [12, 12], [8, 12], 2, 14);
  assert.equal(getAccessoryWeight('upperC', 'Curl martillo', 14), 16);
});

test('recordAccessorySet does not bump twice from the same call', () => {
  recordAccessorySet('upperC', 'Curl martillo', [12, 12], [8, 12], 2, 14);
  recordAccessorySet('upperC', 'Curl martillo', [12, 12], [8, 12], 2, 14);
  assert.equal(getAccessoryWeight('upperC', 'Curl martillo', 14), 18);
});

test('progress is tracked per session+exercise independently', () => {
  recordAccessorySet('upperC', 'Curl martillo', [12, 12], [8, 12], 2, 14);
  assert.equal(getAccessoryWeight('lowerC', 'Curl martillo', 14), 14);
});

// Regression: a partially-logged set (blank inputs counted as 0, not omitted)
// must NOT bump weight — only reaching the top of the range on every set does.
test('recordAccessorySet with a mixed reps array (some below top) does not bump weight', () => {
  recordAccessorySet('lowerC', 'Pistol SQ excéntrico', [12, 9], [8, 12], 2, 20);
  assert.equal(getAccessoryWeight('lowerC', 'Pistol SQ excéntrico', 20), 20);
});

test('getAccessoryWeight before any recordAccessorySet call returns startKg', () => {
  assert.equal(getAccessoryWeight('lowerC', 'Prensa', 100), 100);
});
