// tests/load-calculator.test.js
// The Rippler: T1 waves off 2RM — Banca 110, DL 177.5, Dominadas 115 total.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getT1Sets, getCurrentWeek } from '../js/load-calculator.js';
import { PROGRAM_WEEKS } from '../js/workout-data.js';

test('getT1Sets upperA week 1 is 3×5 @ 80% of 110 = 88 kg', () => {
  const work = getT1Sets('upperA', 1).filter(s => s.type === 'work' && s.kg === 88);
  assert.ok(work.length > 0);
  assert.equal(work[0].reps, 5);
  assert.equal(work[0].label, '3×5');
});

test('getT1Sets upperA week 8 is 8×1 @ 92.5% = 102 kg plus AMRAP', () => {
  const work = getT1Sets('upperA', 8).filter(s => s.type === 'work' && s.kg === 102);
  assert.ok(work.length > 0);
  assert.equal(work[0].label, '8×1');
});

test('getT1Sets upperA week 12 has 95% single plus OPT-IN PR attempts', () => {
  const sets = getT1Sets('upperA', 12);
  const work = sets.filter(s => s.type === 'work' && s.kg === 105);
  const prs  = sets.filter(s => s.type === 'pr');
  assert.ok(work.length > 0); // 95% de 110
  assert.ok(prs.length >= 2);
  assert.ok(prs.some(s => s.kg === 112));
  assert.ok(prs.some(s => s.kg === 117));
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

test('getT1Sets upperB pullups week 1 is assisted, week 10 is weighted', () => {
  const w1  = getT1Sets('upperB', 1).find(s => s.type === 'work' && typeof s.kg === 'string');
  const w10 = getT1Sets('upperB', 10).find(s => s.type === 'work' && typeof s.kg === 'string');
  assert.match(w1.kg, /Asistida/);
  assert.match(w10.kg, /Lastre/);
});

test('getT1Sets upperB pullups week 6 at 90% lands on bodyweight', () => {
  const work = getT1Sets('upperB', 6).find(s => s.type === 'work' && typeof s.kg === 'string');
  assert.equal(work.kg, 'Peso corporal');
});

test('getT1Sets leg days upperC/lowerC have no T1 tables', () => {
  assert.deepEqual(getT1Sets('upperC', 1), []);
  assert.deepEqual(getT1Sets('lowerC', 1), []);
});

test('getT1Sets covers all 12 weeks for every T1 session', () => {
  for (const key of ['upperA', 'upperB', 'lowerB']) {
    for (let w = 1; w <= PROGRAM_WEEKS; w++) {
      assert.ok(getT1Sets(key, w).some(s => s.type === 'work'), `${key} week ${w}`);
    }
  }
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
