import { toast } from './util.js';
import { rate, dur } from './audio.js';
import { setRate, togglePlay, seekTo, skip } from './controls.js';
import { closePops, act, toggleHelp } from './actions.js';
import { openPip } from './pip.js';
import { update } from './update.js';
import { state, roots } from './state.js';

export function onKey(e) {
  const t = e.target;
  if (t && (t.isContentEditable || (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && t.type !== 'range'))) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (!state.main || state.main.hidden) return; // In the floating player: keys are active only while a show is playing
  let ok = true;
  if (e.key === 'Escape') {
    toggleHelp(false);
    roots.forEach(r => closePops(r));
  } else if (e.code === 'Space') togglePlay();
  else if (e.key === 'ArrowRight') skip(e.shiftKey ? 30 : 10);
  else if (e.key === 'ArrowLeft') skip(e.shiftKey ? -30 : -10);
  else if (e.key === 'Home') {
    seekTo(0);
    toast('להתחלה');
  } else if (e.key === 'End') {
    seekTo(dur() - 1);
    toast('לסוף');
  } else if (e.shiftKey && (e.key === '>' || e.code === 'Period')) setRate(rate() + 0.25);
  else if (e.shiftKey && (e.key === '<' || e.code === 'Comma')) setRate(rate() - 0.25);
  else if (e.code === 'KeyM') act('mute');
  else if (e.code === 'KeyP') openPip();
  else if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) toggleHelp();
  else ok = false;
  if (ok) {
    e.preventDefault();
    e.stopPropagation();
    update();
  }
}

export function initKeyboard() {
  document.addEventListener('keydown', onKey, true);
  document.addEventListener('click', e => {
    if (!e.target.closest?.('.fm-pop-wrap')) roots.forEach(r => closePops(r));
  });
}
