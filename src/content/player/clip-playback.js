import { pause } from './controls.js';
import { emitToast } from '../events.js';

// Auto-stop at the end of a shared clip
let stopAt = null;

/** Sets where to stop (seconds), or null for no stop. */
export const setClipStop = seconds => {
  stopAt = seconds;
};

/** Where playback will stop, or null. */
export const getClipStop = () => stopAt;

/** Pauses at the end of the clip; call while the show is playing. */
export function tickClipStop(audio) {
  if (stopAt && audio.currentTime >= stopAt) {
    stopAt = null;
    pause();
    emitToast('סוף הקטע');
  }
}
