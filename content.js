// רץ בעולם של הדף — הנגן של 103FM יוצר <audio> שלא נכנס ל-DOM
(() => {
  const rate = () => parseFloat(document.documentElement.getAttribute('data-fm-speed')) || 1.5;
  const known = new Set();
  let busy = false;

  function apply(el) {
    if (!(el instanceof HTMLAudioElement)) return;
    if (!known.has(el)) { known.add(el); hook(el); }
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
  const isContent = el => el.id !== 'ima-player' && el.duration > 120 && isFinite(el.duration);
  const idOf = el => (el.currentSrc || el.src || '').split('?')[0];
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = db => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const toast = t => document.dispatchEvent(new CustomEvent('fm-toast', { detail: t }));

  function hook(el) {
    let last = 0;
    el.addEventListener('loadedmetadata', () => {
      if (!isContent(el)) return;
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
      const keys = Object.keys(db).sort((a, b) => db[b].at - db[a].at);
      keys.slice(50).forEach(k => delete db[k]); // שומרים רק 50 אחרונים
      save(db);
    });
    el.addEventListener('ended', () => { const db = load(); delete db[idOf(el)]; save(db); });
  }

  // ---- שולחים את הזמן לסרגל (לחישוב "נותרו") ----
  setInterval(() => {
    const el = [...known].find(a => !a.paused && isContent(a)) || [...known].find(isContent);
    if (el) document.dispatchEvent(new CustomEvent('fm-time',
      { detail: JSON.stringify({ cur: el.currentTime, dur: el.duration }) }));
  }, 1000);

  // ---- דילוג קדימה/אחורה ----
  document.addEventListener('fm-seek', e => {
    const el = [...known].find(a => !a.paused && isContent(a)) || [...known].find(isContent);
    if (el) el.currentTime = Math.max(0, Math.min(el.duration - 1, el.currentTime + e.detail));
  });
})();
