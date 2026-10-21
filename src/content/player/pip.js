import { PIP_FONT_URL, PIP_WINDOW_SIZE } from './config.js';
import { createRtlBox } from './dom.js';
import { onKey } from './keyboard.js';
import { currentTitle } from './now-playing.js';
import { requestRender } from './render-scheduler.js';
import { unregisterRoot } from './roots.js';
import { adoptStyles } from './styles.js';
import { miniHTML } from './templates.js';
import { wireRoot } from './wire.js';
import { emitToast } from '../events.js';

// Floating player (Document Picture-in-Picture)
let pipWindow = null;

/** True while the floating window is open. */
export const isPipOpen = () => !!pipWindow;

function buildPipDocument(doc, win) {
  doc.documentElement.dir = 'rtl';
  doc.title = currentTitle();
  const fonts = doc.createElement('link');
  fonts.rel = 'stylesheet';
  fonts.href = PIP_FONT_URL;
  doc.head.appendChild(fonts);
  adoptStyles(doc, win);
  doc.body.className = 'fm-pip-body';
  const box = createRtlBox('fm-miniplayer fm-in-pip', miniHTML);
  doc.body.appendChild(box);
  wireRoot(box);
  return box;
}

/** Opens the floating player window (or focuses it when already open). */
export async function openPip() {
  if (pipWindow) {
    pipWindow.focus();
    return;
  }
  if (!('documentPictureInPicture' in window)) {
    emitToast('הדפדפן לא תומך בנגן צף');
    return;
  }
  try {
    pipWindow = await documentPictureInPicture.requestWindow(PIP_WINDOW_SIZE);
  } catch {
    emitToast('לא ניתן לפתוח נגן צף');
    return;
  }
  const box = buildPipDocument(pipWindow.document, pipWindow);
  pipWindow.document.addEventListener('keydown', onKey, true);
  pipWindow.addEventListener('pagehide', () => {
    unregisterRoot(box);
    pipWindow = null;
    requestRender();
  });
  requestRender();
}
