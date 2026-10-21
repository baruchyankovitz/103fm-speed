import { byRole } from './dom.js';
import { seekTo } from './controls.js';
import { currentAudio, duration } from './now-playing.js';
import { requestRender } from './render-scheduler.js';
import { emitToast } from '../events.js';
import { clamp } from '../../shared/math.js';
import { formatTime } from '../../shared/time.js';

// Drag on the progress bar: { root, ratio } while a drag is in progress
let drag = null;

/** The dragged position as a 0-1 ratio, or null when not dragging. */
export const getDragRatio = () => (drag ? drag.ratio : null);

function showTip(root, ratio) {
  const tip = byRole(root, 'tip');
  tip.textContent = formatTime(ratio * duration());
  tip.style.left = ratio * 100 + '%';
}

function finishDrag(root) {
  if (drag?.root !== root) return;
  seekTo(drag.ratio * duration(), true);
  drag = null;
  root.classList.remove('fm-dragging');
}

/** Wires hover preview, click and drag seeking on a root's progress bar. */
export function wireSeekBar(root) {
  const seek = byRole(root, 'seek');
  const ratioAt = event => {
    const box = seek.getBoundingClientRect();
    return clamp((event.clientX - box.left) / box.width, 0, 1);
  };
  seek.addEventListener('pointermove', event => {
    const ratio = ratioAt(event);
    showTip(root, ratio);
    if (drag?.root === root) {
      drag.ratio = ratio;
      requestRender();
    }
  });
  seek.addEventListener('pointerdown', event => {
    if (!currentAudio()) {
      emitToast('לחצו קודם על השמעה');
      return;
    }
    seek.setPointerCapture(event.pointerId);
    drag = { root, ratio: ratioAt(event) };
    root.classList.add('fm-dragging');
    requestRender();
  });
  seek.addEventListener('pointerup', () => finishDrag(root));
  seek.addEventListener('pointercancel', () => finishDrag(root));
}
