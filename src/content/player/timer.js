import { toast } from './util.js';
import { audio } from './audio.js';
import { pause } from './controls.js';
import { update } from './update.js';
import { state } from './state.js';

// Sleep timer and stop at end of clip

let savedVol = null;

export function tick() {
  const a = audio();
  if (a && !a.paused) {
    if (state.clipStop && a.currentTime >= state.clipStop) {
      state.clipStop = null;
      pause();
      toast('סוף הקטע');
    }
    if (state.sleep?.until) {
      const ms = state.sleep.until - Date.now();
      if (ms <= 10000 && ms > 0) {
        if (savedVol == null) savedVol = a.volume;
        a.volume = (savedVol * ms) / 10000;
      }
      if (ms <= 0) {
        pause();
        a.volume = savedVol ?? a.volume;
        savedVol = null;
        state.sleep = null;
        toast('טיימר שינה: נעצר');
      }
    }
  }
  if (state.sleep?.end && a && a.ended) state.sleep = null;
  update();
}
