// Modern player for radio sites. Runs in the page world. On 103FM it replaces the original player; on other sites it is shown as a floating player
import { initClip } from './clip.js';
import { initKeyboard } from './keyboard.js';
import { initToast } from './toast.js';
import { adopt } from './styles.js';
import { mountMain } from './mount.js';
import { tick } from './timer.js';

// Main window only, not iframes
if (window.top === window) {
  initClip();
  initKeyboard();
  initToast();
  adopt(document, window);
  new MutationObserver(mountMain).observe(document, { childList: true, subtree: true });
  mountMain();
  setInterval(tick, 250);
}
