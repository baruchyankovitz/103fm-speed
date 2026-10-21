import { initSpeed } from './speed.js';

export { currentRate } from './speed.js';
export { currentContentAudio, pausedAd, playingAd } from './registry.js';

/** Starts catching audio elements and enforcing the chosen speed (page world, every frame). */
export function initMedia() {
  initSpeed();
}
