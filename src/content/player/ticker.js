import { TICK_MS } from './config.js';
import { tickClipStop } from './clip-playback.js';
import { currentAudio } from './now-playing.js';
import { requestRender } from './render-scheduler.js';
import { clearSleepIfEnded, tickSleep } from './sleep-timer.js';

function tick() {
  const audio = currentAudio();
  if (audio && !audio.paused) {
    tickClipStop(audio);
    tickSleep(audio);
  }
  clearSleepIfEnded(audio);
  requestRender();
}

/** Runs the periodic work: clip stop, sleep timer and re-render. */
export const startTicker = () => setInterval(tick, TICK_MS);
