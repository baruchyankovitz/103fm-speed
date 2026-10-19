import { isAd, isContent } from './ads.js';

// ---- Remember playback position ----
const KEY = 'fm-speed-positions';
const idOf = el => (el.currentSrc || el.src || '').split('?')[0];
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};
const save = db => {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {}
};
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const toast = t => document.dispatchEvent(new CustomEvent('fm-toast', { detail: t }));

export function hook(el) {
  if (isAd(el)) return;
  let last = 0;
  el.addEventListener('loadedmetadata', () => {
    if (!isContent(el)) return;
    // A shared clip link takes precedence over "resume where you stopped"
    if (window.__fmPendingClip) {
      document.dispatchEvent(new CustomEvent('fm-content-ready'));
      return;
    }
    const p = load()[idOf(el)];
    if (p && p.t > 15 && p.t < el.duration - 30) {
      el.currentTime = p.t;
      toast('ממשיך מ־' + fmt(p.t));
    }
  });
  el.addEventListener('timeupdate', () => {
    if (!isContent(el) || Date.now() - last < 5000) return;
    last = Date.now();
    const db = load();
    db[idOf(el)] = { t: el.currentTime, at: Date.now() };
    Object.keys(db)
      .sort((a, b) => db[b].at - db[a].at)
      .slice(50)
      .forEach(k => delete db[k]);
    save(db);
  });
  el.addEventListener('ended', () => {
    const db = load();
    delete db[idOf(el)];
    save(db);
  });
}
