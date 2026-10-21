import { MAX_STORED_POSITIONS, RESUME_END_MARGIN_S, RESUME_MIN_POSITION_S } from './config.js';

// Pure helpers for the saved playback positions: { [mediaId]: { t: seconds, at: timestamp } }

/** Identifies a media source by its URL without the query string. */
export const mediaIdFromSrc = src => (src || '').split('?')[0];

/** True when a saved position is far enough from both ends to be worth resuming. */
export const isResumable = (position, duration) =>
  !!position && position.t > RESUME_MIN_POSITION_S && position.t < duration - RESUME_END_MARGIN_S;

/** Deletes all but the most recently saved entries (in place) and returns the store. */
export function pruneOldest(store, keep = MAX_STORED_POSITIONS) {
  Object.keys(store)
    .sort((a, b) => store[b].at - store[a].at)
    .slice(keep)
    .forEach(key => delete store[key]);
  return store;
}
