import { runAction } from './action-registry.js';
import { RATE_KEYBOARD_STEP, SKIP_LONG_S, SKIP_SHORT_S } from './config.js';
import { changeRate, jumpToEnd, jumpToStart, skip, togglePlay } from './controls.js';
import { toggleHelp } from './help.js';
import { getMain } from './mount.js';
import { closePopovers } from './popovers.js';
import { requestRender } from './render-scheduler.js';
import { uiRoots } from './roots.js';

const closeAllPopovers = () => uiRoots.forEach(root => closePopovers(root));
// Shift makes the arrow keys skip the long step
const skipByArrow = (event, direction) => skip(direction * (event.shiftKey ? SKIP_LONG_S : SKIP_SHORT_S));

// Shortcuts in priority order: the first matching entry runs
const SHORTCUTS = [
  {
    matches: e => e.key === 'Escape',
    run: () => {
      toggleHelp(false);
      closeAllPopovers();
    }
  },
  { matches: e => e.code === 'Space', run: togglePlay },
  { matches: e => e.key === 'ArrowRight', run: e => skipByArrow(e, 1) },
  { matches: e => e.key === 'ArrowLeft', run: e => skipByArrow(e, -1) },
  { matches: e => e.key === 'Home', run: jumpToStart },
  { matches: e => e.key === 'End', run: jumpToEnd },
  {
    matches: e => e.shiftKey && (e.key === '>' || e.code === 'Period'),
    run: () => changeRate(RATE_KEYBOARD_STEP)
  },
  {
    matches: e => e.shiftKey && (e.key === '<' || e.code === 'Comma'),
    run: () => changeRate(-RATE_KEYBOARD_STEP)
  },
  { matches: e => e.code === 'KeyM', run: () => runAction('mute') },
  { matches: e => e.code === 'KeyP', run: () => runAction('pip') },
  { matches: e => e.key === '?' || (e.shiftKey && e.code === 'Slash'), run: () => toggleHelp() }
];

// Typing in a field (sliders excepted) must not trigger shortcuts
const isTypingTarget = target =>
  !!target &&
  (target.isContentEditable || (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) && target.type !== 'range'));

/** Keydown handler for the page and the floating window. */
export function onKey(event) {
  if (isTypingTarget(event.target)) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const main = getMain();
  if (!main || main.hidden) return; // In the floating player: keys are active only while a show is playing
  const shortcut = SHORTCUTS.find(candidate => candidate.matches(event));
  if (!shortcut) return;
  shortcut.run(event);
  event.preventDefault();
  event.stopPropagation();
  requestRender();
}

/** Starts listening for shortcuts and for clicks outside popovers. */
export function initKeyboard() {
  document.addEventListener('keydown', onKey, true);
  document.addEventListener('click', event => {
    if (!event.target.closest?.('.fm-pop-wrap')) closeAllPopovers();
  });
}
