import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fadeVolume, sleepBadgeText } from '../src/content/player/sleep-model.js';

test('fadeVolume scales linearly over the fade window', () => {
  assert.equal(fadeVolume(1, 10000), 1);
  assert.equal(fadeVolume(0.8, 5000), 0.4);
  assert.equal(fadeVolume(1, 0), 0);
});

test('sleepBadgeText shows minutes left, end of show, or nothing', () => {
  assert.equal(sleepBadgeText(null, 0), '');
  assert.equal(sleepBadgeText({ end: true }, 0), 'סוף');
  assert.equal(sleepBadgeText({ until: 61000 }, 0), '2′');
});
