// Runs in the page world: the 103FM and Galei Tzahal players create an <audio> that is never attached to the DOM, so we catch it here
import { site } from './site.js';
import { isAd, isContent } from './ads.js';
import { rate, known, initSpeed } from './speed.js';

initSpeed();

// Player interface (player/)
window.__fm = {
  audio: () => [...known].find(a => !a.paused && isContent(a)) || [...known].find(isContent) || null,
  ad: () => [...known].find(a => isAd(a) && !a.paused) || null,
  pausedAd: () => [...known].find(a => isAd(a) && a.paused && a.currentTime > 0 && !a.ended) || null,
  rate,
  site
};
