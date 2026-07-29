// js/progression.js
// Double progression for un-programmed accessories (Upper C brazo, Lower C cuádriceps):
// suggest a weight, bump it only once every logged set reaches the top of the rep range.
const STORAGE_KEY = 'brute_accessory_progress';

function readAll() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function key(sessionKey, exerciseName) {
  return `${sessionKey}:${exerciseName}`;
}

export function getAccessoryWeight(sessionKey, exerciseName, startKg) {
  const all = readAll();
  return all[key(sessionKey, exerciseName)]?.kg ?? startKg;
}

export function recordAccessorySet(sessionKey, exerciseName, repsLogged, repRange, incrementKg, startKg) {
  const all = readAll();
  const k = key(sessionKey, exerciseName);
  const currentKg = all[k]?.kg ?? startKg;
  const [, top] = repRange;
  const allAtTop = repsLogged.length > 0 && repsLogged.every(r => r >= top);
  all[k] = { kg: allAtTop ? currentKg + incrementKg : currentKg };
  writeAll(all);
}
