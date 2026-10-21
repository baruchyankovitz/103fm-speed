import { isAd, isContent } from './ads.js';

// The media elements we track: every <audio>, and a <video> only when it is an ad
const tracked = new Set();

/** Adds an element; returns true when it was not tracked before. */
export function track(element) {
  if (tracked.has(element)) return false;
  tracked.add(element);
  return true;
}

/** Returns a snapshot of the tracked elements. */
export const trackedElements = () => [...tracked];

/** The show being played, or else the first show found. */
export const currentContentAudio = () =>
  trackedElements().find(el => !el.paused && isContent(el)) || trackedElements().find(isContent) || null;

/** The ad that is playing right now, if any. */
export const playingAd = () => trackedElements().find(el => isAd(el) && !el.paused) || null;

/** An ad that was started and then paused, if any. */
export const pausedAd = () =>
  trackedElements().find(el => isAd(el) && el.paused && el.currentTime > 0 && !el.ended) || null;
