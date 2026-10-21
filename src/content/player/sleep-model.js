import { SLEEP_FADE_MS } from './config.js';

// Pure helpers of the sleep timer. A sleep is { until: timestamp } or { end: true } (end of show).

/** Volume during the fade-out, from the volume before it and the milliseconds left. */
export const fadeVolume = (savedVolume, msLeft) => (savedVolume * msLeft) / SLEEP_FADE_MS;

/** Text of the badge on the sleep button. */
export function sleepBadgeText(sleep, now) {
  if (!sleep) return '';
  return sleep.end ? 'סוף' : Math.ceil((sleep.until - now) / 60000) + '′';
}
