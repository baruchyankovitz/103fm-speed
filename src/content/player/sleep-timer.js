import { SLEEP_FADE_MS } from './config.js';
import { pause } from './controls.js';
import { fadeVolume } from './sleep-model.js';
import { emitToast } from '../events.js';

// Sleep timer state: null, { until } or { end: true }
let sleep = null;
let volumeBeforeFade = null;

/** The active sleep, or null. */
export const getSleep = () => sleep;

/** Stops playback after the given number of minutes. */
export const sleepAfterMinutes = minutes => {
  sleep = { until: Date.now() + minutes * 60000 };
};

/** Stops playback when the show ends. */
export const sleepAtEndOfShow = () => {
  sleep = { end: true };
};

/** Cancels the sleep timer. */
export const cancelSleep = () => {
  sleep = null;
};

/** Fades out and pauses when the timer runs out; call while the show is playing. */
export function tickSleep(audio) {
  if (!sleep?.until) return;
  const msLeft = sleep.until - Date.now();
  if (msLeft <= SLEEP_FADE_MS && msLeft > 0) {
    if (volumeBeforeFade == null) volumeBeforeFade = audio.volume;
    audio.volume = fadeVolume(volumeBeforeFade, msLeft);
  }
  if (msLeft <= 0) {
    pause();
    audio.volume = volumeBeforeFade ?? audio.volume;
    volumeBeforeFade = null;
    sleep = null;
    emitToast('טיימר שינה: נעצר');
  }
}

/** Clears an "end of show" sleep once the show has ended. */
export function clearSleepIfEnded(audio) {
  if (sleep?.end && audio && audio.ended) sleep = null;
}
