import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildShareLinks,
  buildShareText,
  buildShareUrl,
  parseClipHash,
  readClipRange
} from '../src/content/player/clip-link.js';

test('parseClipHash reads start and end', () => {
  assert.deepEqual(parseClipHash('#fm=60-120'), { start: 60, end: 120 });
  assert.deepEqual(parseClipHash('#fm=1:00-2:00'), { start: 60, end: 120 });
});

test('parseClipHash allows a missing or invalid end', () => {
  assert.deepEqual(parseClipHash('#fm=60'), { start: 60, end: null });
  assert.deepEqual(parseClipHash('#fm=60-30'), { start: 60, end: null });
});

test('parseClipHash returns null without a clip', () => {
  assert.equal(parseClipHash(''), null);
  assert.equal(parseClipHash('#other=1'), null);
});

test('readClipRange defaults the start to zero and drops a bad end', () => {
  assert.deepEqual(readClipRange(' 1:00 ', '2:00'), { start: 60, end: 120 });
  assert.deepEqual(readClipRange('', ''), { start: 0, end: null });
  assert.deepEqual(readClipRange('2:00', '1:00'), { start: 120, end: null });
});

test('buildShareUrl replaces any existing hash', () => {
  assert.equal(buildShareUrl('https://x.test/a?b=1#old', 60.7, 120.2), 'https://x.test/a?b=1#fm=60-120');
  assert.equal(buildShareUrl('https://x.test/a', 0, null), 'https://x.test/a#fm=0');
});

test('buildShareText and buildShareLinks encode the message', () => {
  const text = buildShareText('Show', 60, 120);
  assert.ok(text.includes('"Show"') && text.includes('01:00–02:00'));
  const links = buildShareLinks('hi there', 'https://x.test/#fm=1');
  assert.equal(links.wa, 'https://wa.me/?text=hi%20there%0Ahttps%3A%2F%2Fx.test%2F%23fm%3D1');
  assert.equal(links.fb, 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fx.test%2F%23fm%3D1');
  assert.equal(links.x, 'https://twitter.com/intent/tweet?text=hi%20there&url=https%3A%2F%2Fx.test%2F%23fm%3D1');
});
