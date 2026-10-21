import { byRole } from './dom.js';
import { buildShareLinks, buildShareText, buildShareUrl, readClipRange } from './clip-link.js';
import { currentTitle } from './now-playing.js';
import { emitToast } from '../events.js';

async function copyLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    emitToast('הקישור הועתק');
  } catch {
    prompt('העתיקו את הקישור:', url);
  }
}

/** Shares the clip typed in the share popover: kind is wa, fb, x or copy. */
export async function shareClip(kind, root) {
  const { start, end } = readClipRange(byRole(root, 'clip-a').value, byRole(root, 'clip-b').value);
  const url = buildShareUrl(location.href, start, end);
  if (kind === 'copy') {
    await copyLink(url);
    return;
  }
  const links = buildShareLinks(buildShareText(currentTitle(), start, end), url);
  window.open(links[kind], '_blank', 'noopener,width=620,height=560');
}
