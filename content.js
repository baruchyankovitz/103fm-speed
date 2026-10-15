// רץ בעולם של הדף — הנגן של 103FM יוצר <audio> שלא נכנס ל-DOM, אז תופסים אותו כאן
(() => {
  const rate = () => parseFloat(document.documentElement.getAttribute('data-fm-speed')) || 1.5;
  const known = new Set();
  let busy = false;

  const isAd = el => el.id === 'ima-player';
  const isContent = el => !isAd(el) && el.duration > 60 && isFinite(el.duration);

  function apply(el) {
    if (!(el instanceof HTMLAudioElement)) return;
    if (!known.has(el)) { known.add(el); hook(el); }
    if (isAd(el)) return; // לא מאיצים פרסומות
    const r = rate();
    if (Math.abs(el.playbackRate - r) > 0.01) {
      busy = true;
      el.defaultPlaybackRate = r;
      el.playbackRate = r;
      el.preservesPitch = true;
      busy = false;
    }
  }
  const applyAll = () => { document.querySelectorAll('audio').forEach(apply); known.forEach(apply); };

  // אוכפים מהירות בכל פעם שהנגן מאפס אותה
  ['play', 'playing', 'loadedmetadata', 'ratechange'].forEach(ev =>
    document.addEventListener(ev, e => { if (!busy) apply(e.target); }, true));

  const origPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...a) { apply(this); return origPlay.apply(this, a); };

  new MutationObserver(applyAll).observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-fm-speed'] });
  setInterval(applyAll, 1500);

  // ---- זכירת מיקום השמעה ----
  const KEY = 'fm-speed-positions';
  const idOf = el => (el.currentSrc || el.src || '').split('?')[0];
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = db => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const toast = t => document.dispatchEvent(new CustomEvent('fm-toast', { detail: t }));

  function hook(el) {
    if (isAd(el)) return;
    let last = 0;
    el.addEventListener('loadedmetadata', () => {
      if (!isContent(el)) return;
      // קישור לקטע משותף גובר על "המשך מאיפה שעצרת"
      if (window.__fmPendingClip) { document.dispatchEvent(new CustomEvent('fm-content-ready')); return; }
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
      Object.keys(db).sort((a, b) => db[b].at - db[a].at).slice(50).forEach(k => delete db[k]);
      save(db);
    });
    el.addEventListener('ended', () => { const db = load(); delete db[idOf(el)]; save(db); });
  }

  // ---- ממשק לנגן (player.js) ----
  window.__fm = {
    audio: () => [...known].find(a => !a.paused && isContent(a)) || [...known].find(isContent) || null,
    ad: () => [...known].find(a => isAd(a) && !a.paused) || null,
    rate
  };
})();
