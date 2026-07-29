// tests/load-calculator.test.js
// The Rippler: T1 waves off 2RM — Banca 110, DL 177.5, Dominadas 115 total.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getT1Sets, getCurrentWeek, getProgramStart } from '../js/load-calculator.js';
import { PROGRAM_WEEKS } from '../js/workout-data.js';

// Minimal localStorage stub for Node (this file doesn't otherwise need one)
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] ?? null; },
    setItem(k, v) { this._data[k] = String(v); },
  };
}

test('getT1Sets upperA t1Index 0 week 1 is 3×5 @ 80% of 110 = 88 kg', () => {
  const work = getT1Sets('upperA', 1, 0).filter(s => s.type === 'work');
  assert.equal(work[0].kg, 88);
  assert.equal(work[0].reps, 5);
  assert.equal(work[0].label, '3×5');
});

test('getT1Sets upperA t1Index 1 (Pendlay) week 1 is 80% of 70 = 56 kg', () => {
  const work = getT1Sets('upperA', 1, 1).filter(s => s.type === 'work');
  assert.equal(work[0].kg, 56);
});

test('getT1Sets upperA t1Index 0 week 8 is 8×1 @ 92.5% = 102 kg plus AMRAP', () => {
  const work = getT1Sets('upperA', 8, 0).filter(s => s.type === 'work');
  assert.equal(work[0].kg, 102);
  assert.equal(work[0].label, '8×1');
  assert.equal(work[1].label, 'AMRAP');
});

test('getT1Sets defaults t1Index to 0 when omitted', () => {
  assert.deepEqual(getT1Sets('upperA', 1), getT1Sets('upperA', 1, 0));
});

test('getT1Sets upperB t1Index 1 (Dominadas) week 1 is assisted', () => {
  const work = getT1Sets('upperB', 1, 1).find(s => s.type === 'work');
  assert.match(work.kg, /Asistida/);
});

test('getT1Sets upperB t1Index 1 (Dominadas) week 10 is weighted', () => {
  const work = getT1Sets('upperB', 10, 1).find(s => s.type === 'work');
  assert.match(work.kg, /Lastre/);
});

test('getT1Sets upperB t1Index 1 (Dominadas) week 6 at 90% lands on bodyweight', () => {
  const work = getT1Sets('upperB', 6, 1).find(s => s.type === 'work');
  assert.equal(work.kg, 'Peso corporal');
});

test('getT1Sets lowerA (single T1, Sentadilla) week 1 is 80% of 117.5 = 94 kg', () => {
  const work = getT1Sets('lowerA', 1).find(s => s.type === 'work');
  assert.equal(work.kg, 94);
});

test('getT1Sets lowerB week 1 is 80% of 177.5 = 142 kg', () => {
  const work = getT1Sets('lowerB', 1).find(s => s.type === 'work');
  assert.equal(work.kg, 142);
});

test('getT1Sets lowerB week 6 is 4×2 @ 90% = 160 kg', () => {
  const work = getT1Sets('lowerB', 6).find(s => s.type === 'work');
  assert.equal(work.kg, 160);
  assert.equal(work.label, '4×2');
});

test('getT1Sets lowerB week 12 PR attempts are 182 and 190', () => {
  const sets = getT1Sets('lowerB', 12);
  assert.ok(sets.some(s => s.kg === 182 && s.type === 'pr'));
  assert.ok(sets.some(s => s.kg === 190 && s.type === 'pr'));
});

test('getT1Sets sessions with no T1 (upperC, lowerC) return empty array', () => {
  assert.deepEqual(getT1Sets('upperC', 1), []);
  assert.deepEqual(getT1Sets('lowerC', 1), []);
});

test('getT1Sets out-of-range t1Index returns empty array', () => {
  assert.deepEqual(getT1Sets('lowerA', 1, 5), []);
});

test('getCurrentWeek returns 1 for day 0', () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.equal(getCurrentWeek(today), 1);
});

test('getCurrentWeek returns 2 for day 8', () => {
  const d = new Date();
  d.setDate(d.getDate() - 8);
  assert.equal(getCurrentWeek(d.toISOString().slice(0, 10)), 2);
});

test('getCurrentWeek clamps to 12 maximum', () => {
  const d = new Date();
  d.setDate(d.getDate() - 120);
  assert.equal(getCurrentWeek(d.toISOString().slice(0, 10)), 12);
});

test('getCurrentWeek returns override when provided', () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.equal(getCurrentWeek(today, 9), 9);
});

test('getCurrentWeek clamps override above 12', () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.equal(getCurrentWeek(today, 15), 12);
});

test('getCurrentWeek clamps override below 1', () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.equal(getCurrentWeek(today, 0), 1);
});

test('getCurrentWeek falls back to date calculation when override is null', () => {
  const d = new Date();
  d.setDate(d.getDate() - 8);
  assert.equal(getCurrentWeek(d.toISOString().slice(0, 10), null), 2);
});

test('getProgramStart returns today and persists it when nothing stored', () => {
  globalThis.localStorage._data = {};
  const today = new Date().toISOString().slice(0, 10);
  const result = getProgramStart();
  assert.equal(result, today);
  assert.equal(localStorage.getItem('brute_program_start'), today);
});

test('getProgramStart is idempotent across repeated calls', () => {
  globalThis.localStorage._data = {};
  const first  = getProgramStart();
  const second = getProgramStart();
  assert.equal(first, second);
  assert.equal(localStorage.getItem('brute_program_start'), first);
});
