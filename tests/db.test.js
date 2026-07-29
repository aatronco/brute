// tests/db.test.js
// IndexedDB is not available in Node — test the pure helper that builds
// the object store config and validates session objects.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSession, DB_NAME, DB_VERSION, STORES, saveSession, getAllSessions, exportAllData, importAllData } from '../js/db.js';

// Mock IndexedDB and localStorage for Node environment
class MockObjectStore {
  constructor(globalStore) {
    this.globalStore = globalStore;
  }
  put(obj) {
    const request = { onsuccess: null, onerror: null };
    const item = { ...obj, id: obj.id || this.globalStore.nextId };
    if (!obj.id) this.globalStore.nextId++;
    const idx = this.globalStore.data.findIndex(d => d.id === item.id);
    if (idx >= 0) this.globalStore.data[idx] = item;
    else this.globalStore.data.push(item);
    setImmediate(() => request.onsuccess?.({ target: { result: item.id } }));
    return request;
  }
  get(id) {
    const request = { onsuccess: null, onerror: null };
    const item = this.globalStore.data.find(d => d.id === id);
    setImmediate(() => request.onsuccess?.({ target: { result: item } }));
    return request;
  }
  getAll() {
    const request = { onsuccess: null, onerror: null };
    setImmediate(() => request.onsuccess?.({ target: { result: [...this.globalStore.data] } }));
    return request;
  }
  index(name) {
    return {
      getAll: (value) => {
        const request = { onsuccess: null, onerror: null };
        const fieldName = name.split('_')[1];
        const filtered = this.globalStore.data.filter(d => d[fieldName] === value);
        setImmediate(() => request.onsuccess?.({ target: { result: filtered } }));
        return request;
      }
    };
  }
}

class MockTransaction {
  constructor(storeName, mode, globalStore) {
    this.storeName = storeName;
    this.mode = mode;
    this.globalStore = globalStore;
  }
  objectStore(name) {
    return new MockObjectStore(this.globalStore);
  }
}

class MockDatabase {
  constructor(globalStore) {
    this.objectStoreNames = { contains: () => true };
    this.globalStore = globalStore;
  }
  transaction(storeName, mode) {
    return new MockTransaction(storeName, mode, this.globalStore);
  }
  close() {}
}

const mockStoreGlobal = { data: [], nextId: 1 };

global.indexedDB = {
  open: (name, version) => {
    const request = { onsuccess: null, onerror: null, onupgradeneeded: null };
    setImmediate(() => {
      const db = new MockDatabase(mockStoreGlobal);
      request.onupgradeneeded?.({ target: { result: db } });
      request.onsuccess?.({ target: { result: db } });
    });
    return request;
  }
};

global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  clear() {
    this.data = {};
  }
};

test('DB_NAME and DB_VERSION are defined', () => {
  assert.equal(typeof DB_NAME, 'string');
  assert.ok(DB_VERSION >= 1);
});

test('STORES contains workout_sessions', () => {
  assert.ok(STORES.includes('workout_sessions'));
});

test('validateSession accepts valid session', () => {
  const s = {
    date: '2026-07-20', session: 'upperA', week: 1,
    phase: 'bloque1', completed: false, sets: []
  };
  assert.doesNotThrow(() => validateSession(s));
});

test('validateSession accepts new leg days lowerA and lowerB', () => {
  for (const key of ['lowerA', 'lowerB']) {
    const s = {
      date: '2026-07-20', session: key, week: 3,
      phase: 'bloque1', completed: true, sets: []
    };
    assert.doesNotThrow(() => validateSession(s));
  }
});

test('validateSession accepts week 12 in peaking phase', () => {
  const s = {
    date: '2026-10-05', session: 'lowerB', week: 12,
    phase: 'peaking', completed: true, sets: []
  };
  assert.doesNotThrow(() => validateSession(s));
});

test('validateSession rejects invalid session name', () => {
  const s = {
    date: '2026-07-20', session: 'invalid', week: 1,
    phase: 'bloque1', completed: false, sets: []
  };
  assert.throws(() => validateSession(s), /session/);
});

test('validateSession rejects retired kine session key', () => {
  const s = {
    date: '2026-07-20', session: 'kine', week: 1,
    phase: 'bloque1', completed: false, sets: []
  };
  assert.throws(() => validateSession(s), /session/);
});

test('validateSession rejects week out of range', () => {
  const s = {
    date: '2026-07-20', session: 'upperA', week: 13,
    phase: 'bloque1', completed: false, sets: []
  };
  assert.throws(() => validateSession(s), /week/);
});

test('validateSession rejects retired GZCLP phase names', () => {
  const s = {
    date: '2026-07-20', session: 'upperA', week: 1,
    phase: 'volumen', completed: false, sets: []
  };
  assert.throws(() => validateSession(s), /phase/);
});

test('exportAllData returns sessions, accessoryProgress, prs, and a timestamp', async () => {
  mockStoreGlobal.data = [];
  mockStoreGlobal.nextId = 1;
  global.localStorage.clear();
  await saveSession({ date: '2026-07-29', session: 'upperA', week: 1, phase: 'bloque1', completed: true, sets: [] });
  localStorage.setItem('brute_accessory_progress', JSON.stringify({ 'upperC:Curl bíceps mancuerna 45°': { kg: 16 } }));
  localStorage.setItem('brute_prs', JSON.stringify({ banca: 112 }));

  const data = await exportAllData();
  assert.ok(Array.isArray(data.sessions));
  assert.ok(data.sessions.some(s => s.session === 'upperA'));
  assert.deepEqual(data.accessoryProgress, { 'upperC:Curl bíceps mancuerna 45°': { kg: 16 } });
  assert.deepEqual(data.prs, { banca: 112 });
  assert.equal(typeof data.exportedAt, 'string');
  assert.equal(data.app, 'brute');
  assert.equal(data.schemaVersion, 1);
  assert.equal(typeof data.programStart, 'string');
});

test('importAllData restores sessions and localStorage state', async () => {
  mockStoreGlobal.data = [];
  mockStoreGlobal.nextId = 1;
  global.localStorage.clear();
  const payload = {
    app: 'brute',
    schemaVersion: 1,
    sessions: [{ date: '2026-01-01', session: 'lowerB', week: 3, phase: 'bloque1', completed: true, sets: [] }],
    accessoryProgress: { 'lowerC:Prensa': { kg: 190 } },
    prs: { deadlift: 180 },
    programStart: '2026-01-01',
    exportedAt: '2026-01-01T00:00:00.000Z',
  };
  await importAllData(payload);

  const all = await getAllSessions();
  assert.ok(all.some(s => s.session === 'lowerB' && s.week === 3));
  assert.deepEqual(JSON.parse(localStorage.getItem('brute_accessory_progress')), payload.accessoryProgress);
  assert.deepEqual(JSON.parse(localStorage.getItem('brute_prs')), payload.prs);
  assert.equal(localStorage.getItem('brute_program_start'), '2026-01-01');
});
