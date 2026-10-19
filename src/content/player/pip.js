import { toast } from './util.js';
import { title } from './audio.js';
import { miniHTML } from './templates.js';
import { wire } from './mount.js';
import { update } from './update.js';
import { onKey } from './keyboard.js';
import { adopt } from './styles.js';
import { state, roots } from './state.js';

// Floating player (Document Picture-in-Picture)

export async function openPip() {
  if (state.pipWin) {
    state.pipWin.focus();
    return;
  }
  if (!('documentPictureInPicture' in window)) {
    toast('הדפדפן לא תומך בנגן צף');
    return;
  }
  try {
    state.pipWin = await documentPictureInPicture.requestWindow({ width: 420, height: 132 });
  } catch {
    toast('לא ניתן לפתוח נגן צף');
    return;
  }
  const d = state.pipWin.document;
  d.documentElement.dir = 'rtl';
  d.title = title();
  const link = d.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;800&display=swap';
  d.head.appendChild(link);
  adopt(d, state.pipWin);
  d.body.className = 'fm-pip-body';
  const box = d.createElement('div');
  box.className = 'fm-miniplayer fm-in-pip';
  box.dir = 'rtl';
  box.innerHTML = miniHTML;
  d.body.appendChild(box);
  wire(box);
  d.addEventListener('keydown', onKey, true);
  state.pipWin.addEventListener('pagehide', () => {
    roots.delete(box);
    state.pipWin = null;
    update();
  });
  update();
}
