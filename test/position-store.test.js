import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isResumable, mediaIdFromSrc, pruneOldest } from '../src/content/media/position-store.js';

test('mediaIdFromSrc drops the query string', () => {
  assert.equal(mediaIdFromSrc('https://a.test/x.mp3?token=1'), 'https://a.test/x.mp3');
  assert.equal(mediaIdFromSrc(''), '');
  assert.equal(mediaIdFromSrc(undefined), '');
});

test('isResumable needs a position away from both ends', () => {
  assert.equal(isResumable({ t: 100 }, 1000), true);
  assert.equal(isResumable({ t: 15 }, 1000), false);
  assert.equal(isResumable({ t: 970 }, 1000), false);
  assert.equal(isResumable(undefined, 1000), false);
});

test('pruneOldest keeps the most recent entries', () => {
  const store = { a: { t: 1, at: 1 }, b: { t: 1, at: 3 }, c: { t: 1, at: 2 } };
  pruneOldest(store, 2);
  assert.deepEqual(Object.keys(store).sort(), ['b', 'c']);
});

test('pruneOldest keeps up to 50 entries by default', () => {
  const store = {};
  for (let i = 0; i < 60; i++) store['k' + i] = { t: 1, at: i };
  assert.equal(Object.keys(pruneOldest(store)).length, 50);
  assert.ok('k59' in store && !('k0' in store));
});
