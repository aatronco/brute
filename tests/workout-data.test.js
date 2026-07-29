// tests/workout-data.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SESSIONS, PROGRAM_WEEKS } from '../js/workout-data.js';

test('SESSIONS has exactly the 6 new day keys', () => {
  assert.deepEqual(
    Object.keys(SESSIONS).sort(),
    ['lowerA', 'lowerB', 'lowerC', 'upperA', 'upperB', 'upperC']
  );
});

test('upperA has two T1 lifts: Press Banca and Pendlay Row', () => {
  const names = SESSIONS.upperA.T1.map(t => t.exercise);
  assert.deepEqual(names, ['Press Banca', 'Pendlay Row']);
});

test('upperB has two T1 lifts: Press Inclinado and Dominadas', () => {
  const names = SESSIONS.upperB.T1.map(t => t.exercise);
  assert.deepEqual(names, ['Press Inclinado', 'Dominadas (ola 2RM)']);
});

test('upperB Dominadas T1 has prBase 122 (e1RM from 2RM total 115 @ PC 105)', () => {
  assert.equal(SESSIONS.upperB.T1[1].prBase, 122);
});

test('lowerA has one T1 lift: Sentadilla', () => {
  assert.equal(SESSIONS.lowerA.T1.length, 1);
  assert.equal(SESSIONS.lowerA.T1[0].exercise, 'Sentadilla');
});

test('lowerB has one T1 lift: Peso Muerto', () => {
  assert.equal(SESSIONS.lowerB.T1.length, 1);
  assert.equal(SESSIONS.lowerB.T1[0].exercise, 'Peso Muerto Convencional');
});

test('Sentadilla T1 week 1 work set is 80% of 117.5 = 94 kg', () => {
  const work = SESSIONS.lowerA.T1[0].byWeek[1].work[0];
  assert.equal(work.kg, 94);
});

test('Press Inclinado T1 week 1 work set is 80% of 75 = 60 kg', () => {
  const work = SESSIONS.upperB.T1[0].byWeek[1].work[0];
  assert.equal(work.kg, 60);
});

test('Pendlay Row T1 week 1 work set is 80% of 70 = 56 kg', () => {
  const work = SESSIONS.upperA.T1[1].byWeek[1].work[0];
  assert.equal(work.kg, 56);
});

test('upperA keeps Press Militar as a T2 accessory (5RM wave, no PR)', () => {
  const militar = SESSIONS.upperA.T2.find(e => e.name === 'Press militar barra');
  assert.ok(militar);
  assert.equal(militar.byWeek[1].kg, Math.round(42.5 * 0.68));
});

test('upperC accessories have progression fields', () => {
  for (const a of SESSIONS.upperC.accessories) {
    assert.equal(typeof a.startKg, 'number');
    assert.equal(a.repRange.length, 2);
    assert.equal(typeof a.incrementKg, 'number');
  }
});

test('lowerC accessories have progression fields and no EVA cap', () => {
  assert.equal(SESSIONS.lowerC.evaMax, undefined);
  for (const a of SESSIONS.lowerC.accessories) {
    assert.equal(typeof a.startKg, 'number');
  }
});

test('accessories are not removed during peaking weeks 11-12', () => {
  assert.equal(SESSIONS.upperC.accessories.some(a => a.removeWeeks?.includes(11)), false);
  assert.equal(SESSIONS.lowerC.accessories.some(a => a.removeWeeks?.includes(12)), false);
});

test('every T1 lift has a byWeek entry for all 12 weeks', () => {
  const allT1 = Object.values(SESSIONS).flatMap(s => s.T1 || []);
  for (const t1 of allT1) {
    for (let w = 1; w <= PROGRAM_WEEKS; w++) {
      assert.ok(t1.byWeek[w], `${t1.exercise} missing week ${w}`);
    }
  }
});
