import { $ } from './env.js';
import { parseT, toast, rng } from './util.js';
import { title } from './audio.js';
import { seekTo } from './controls.js';
import { setBanner } from './mount.js';
import { state } from './state.js';

// Clip link (#fm=start-end) and sharing

export const hashClip = (() => {
  const m = location.hash.match(/fm=([\d:.]+)(?:-([\d:.]+))?/);
  if (!m) return null;
  const a = parseT(m[1]),
    b = parseT(m[2]);
  return isFinite(a) ? { a, b: isFinite(b) && b > a ? b : null } : null;
})();

function shareUrl(a, b) {
  const base = location.href.replace(/#.*$/, '');
  return `${base}#fm=${Math.floor(a)}${b ? '-' + Math.floor(b) : ''}`;
}

export async function share(kind, root) {
  const ta = parseT($('[data-role="clip-a"]', root).value.trim()) || 0;
  const tb = parseT($('[data-role="clip-b"]', root).value.trim());
  const b = isFinite(tb) && tb > ta ? tb : null;
  const url = shareUrl(ta, b);
  const range = rng(ta, b);
  const text = `🎧 "${title()}" — האזינו לקטע ${range}`;
  const enc = encodeURIComponent;
  const links = {
    wa: `https://wa.me/?text=${enc(text + '\n' + url)}`,
    fb: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    x: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`
  };
  if (kind === 'copy') {
    try {
      await navigator.clipboard.writeText(url);
      toast('הקישור הועתק');
    } catch {
      prompt('העתיקו את הקישור:', url);
    }
  } else {
    window.open(links[kind], '_blank', 'noopener,width=620,height=560');
  }
}

export function initClip() {
  if (hashClip) window.__fmPendingClip = hashClip;
  document.addEventListener('fm-content-ready', () => {
    const c = window.__fmPendingClip;
    if (!c) return;
    window.__fmPendingClip = null;
    seekTo(c.a, true);
    state.clipStop = c.b;
    toast('מנגן קטע ' + rng(c.a, c.b));
    setBanner(null);
  });
}
