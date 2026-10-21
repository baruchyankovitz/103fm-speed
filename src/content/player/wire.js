import { runAction } from './action-registry.js';
import { byRole, queryAll } from './dom.js';
import { setRate } from './controls.js';
import { currentAudio } from './now-playing.js';
import { requestRender } from './render-scheduler.js';
import { registerRoot } from './roots.js';
import { wireSeekBar } from './seek-bar.js';

function wireActionClicks(root) {
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-act]');
    if (!button || !root.contains(button)) return;
    event.preventDefault();
    event.stopPropagation();
    runAction(button.dataset.act, button.dataset.v, root);
  });
}

function wireVolume(root) {
  const slider = byRole(root, 'vol');
  slider?.addEventListener('input', () => {
    const audio = currentAudio();
    if (audio) {
      audio.volume = +slider.value;
      audio.muted = false;
    }
    requestRender();
  });
}

function wireRateSlider(root) {
  const slider = byRole(root, 'rate-range');
  slider?.addEventListener('input', () => setRate(+slider.value));
}

/** Connects a UI instance (main, mini or floating window) to the player. */
export function wireRoot(root) {
  registerRoot(root);
  wireActionClicks(root);
  wireVolume(root);
  wireRateSlider(root);
  // Typing in the clip fields must not trigger the player's keyboard shortcuts
  queryAll('[data-role="clip-a"],[data-role="clip-b"]', root).forEach(input =>
    input.addEventListener('keydown', event => event.stopPropagation())
  );
  wireSeekBar(root);
}
