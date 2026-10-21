import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMinutesSeconds, formatTime, formatTimeRange, parseTime } from '../src/shared/time.js';

test('formatTime pads minutes and seconds', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(75.9), '01:15');
  assert.equal(formatTime(-5), '00:00');
});

test('formatTime adds hours only when needed', () => {
  assert.equal(formatTime(3600), '1:00:00');
  assert.equal(formatTime(3723), '1:02:03');
});

test('formatTime shows a placeholder for unknown durations', () => {
  assert.equal(formatTime(NaN), '--:--');
  assert.equal(formatTime(Infinity), '--:--');
});

test('formatMinutesSeconds does not split into hours', () => {
  assert.equal(formatMinutesSeconds(5), '0:05');
  assert.equal(formatMinutesSeconds(3723), '62:03');
});

test('parseTime reads clock and plain-seconds formats', () => {
  assert.equal(parseTime('12:30'), 750);
  assert.equal(parseTime('1:02:03'), 3723);
  assert.equal(parseTime('750'), 750);
  assert.equal(parseTime('90.5'), 90.5);
});

test('parseTime returns NaN for empty input', () => {
  assert.ok(Number.isNaN(parseTime('')));
  assert.ok(Number.isNaN(parseTime(undefined)));
});

test('formatTimeRange isolates the range from right-to-left text', () => {
  assert.equal(formatTimeRange(65, 130), '⁦01:05–02:10⁩');
  assert.equal(formatTimeRange(65, null), '⁦01:05⁩');
});
