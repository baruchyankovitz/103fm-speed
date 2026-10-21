import { registerActions } from './action-registry.js';
import { PREF_COLLAPSED, PREF_SLIM } from './config.js';
import { cancelSleep, sleepAfterMinutes, sleepAtEndOfShow } from './sleep-timer.js';
import { byRole } from './dom.js';
import { changeRate, jumpToEnd, jumpToStart, setRate, skip, togglePlay } from './controls.js';
import { toggleHelp } from './help.js';
import { dismissMini } from './mini-player.js';
import { getMain } from './mount.js';
import { currentAudio, currentTime } from './now-playing.js';
import { openPip } from './pip.js';
import { closePopovers, togglePopover } from './popovers.js';
import { writePref } from './prefs.js';
import { shareClip } from './share-actions.js';
import { emitToast } from '../events.js';
import { formatTime } from '../../shared/time.js';
import { site } from '../sites.js';

// Button actions (data-act): name -> handler(value, root)

function toggleMute() {
  const audio = currentAudio();
  if (!audio) return;
  audio.muted = !audio.muted;
  emitToast(audio.muted ? 'מושתק' : 'קול פעיל');
}

function chooseSleep(value, root) {
  if (value === '0') {
    cancelSleep();
    emitToast('טיימר שינה בוטל');
  } else if (value === 'end') {
    sleepAtEndOfShow();
    emitToast('ייעצר בסוף התוכנית');
  } else {
    sleepAfterMinutes(value);
    emitToast(`ייעצר בעוד ${value} דקות`);
  }
  closePopovers(root);
}

function openSharePopover(root) {
  if (!togglePopover(root, 'share')) return;
  const startField = byRole(root, 'clip-a');
  const endField = byRole(root, 'clip-b');
  if (!startField.value) startField.value = formatTime(currentTime());
  if (!endField.value) endField.value = '';
}

function toggleCollapse(root) {
  const pref = site.bar ? PREF_SLIM : PREF_COLLAPSED;
  const collapsed = getMain().classList.toggle(pref);
  writePref(pref, collapsed ? '1' : '0');
  closePopovers(root);
}

const fillWithCurrentTime = role => (value, root) => {
  byRole(root, role).value = formatTime(currentTime());
};

const ACTIONS = {
  play: () => togglePlay(),
  skip: value => skip(+value),
  start: jumpToStart,
  end: jumpToEnd,
  'speed-pop': (value, root) => togglePopover(root, 'speed'),
  rate: value => setRate(+value),
  'rate-step': value => changeRate(+value),
  mute: toggleMute,
  'sleep-pop': (value, root) => togglePopover(root, 'sleep'),
  sleep: chooseSleep,
  'share-pop': (value, root) => openSharePopover(root),
  'clip-a': fillWithCurrentTime('clip-a'),
  'clip-b': fillWithCurrentTime('clip-b'),
  share: (value, root) => shareClip(value, root),
  pip: () => openPip(),
  'mini-close': dismissMini,
  collapse: (value, root) => toggleCollapse(root),
  help: () => toggleHelp()
};

/** Makes the button actions available to the UI. */
export const initActions = () => registerActions(ACTIONS);
