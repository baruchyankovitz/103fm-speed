import { initActions } from './actions.js';
import { initClipHandshake } from './clip-handshake.js';
import { initKeyboard } from './keyboard.js';
import { mountMain } from './mount.js';
import { render } from './render.js';
import { setRenderer } from './render-scheduler.js';
import { loadSharedClip } from './shared-clip.js';
import { adoptStyles } from './styles.js';
import { startTicker } from './ticker.js';
import { initToast } from './toast.js';

/**
 * Starts the custom player (top frame only).
 * On 103FM it replaces the original player; on other sites it is shown as a floating player.
 */
export function initPlayer() {
  setRenderer(render);
  initActions();
  loadSharedClip();
  initClipHandshake();
  initKeyboard();
  initToast();
  adoptStyles(document, window);
  new MutationObserver(mountMain).observe(document, { childList: true, subtree: true });
  mountMain();
  startTicker();
}
