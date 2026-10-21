import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clamp } from '../src/shared/math.js';
import { isValidSpeed, normalizeSpeed } from '../src/shared/speed.js';

test('clamp limits a value to the range', () => {
  assert.equal(clamp(5, 0, 3), 3);
  assert.equal(clamp(-1, 0, 3), 0);
  assert.equal(clamp(2, 0, 3), 2);
});

test('isValidSpeed accepts the supported range only', () => {
  assert.equal(isValidSpeed(0.5), true);
  assert.equal(isValidSpeed(3), true);
  assert.equal(isValidSpeed(0.49), false);
  assert.equal(isValidSpeed(3.01), false);
  assert.equal(isValidSpeed(NaN), false);
});

test('normalizeSpeed clamps and rounds to two decimals', () => {
  assert.equal(normalizeSpeed(1.5 + 0.05), 1.55);
  assert.equal(normalizeSpeed(10), 3);
  assert.equal(normalizeSpeed(0), 0.5);
  assert.equal(normalizeSpeed(1.234), 1.23);
});
