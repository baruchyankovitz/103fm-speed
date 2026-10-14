// רץ בעולם של הדף — כדי לתפוס גם new Audio() שלא נמצא ב-DOM
(() => {
  const rate = () => parseFloat(document.documentElement.getAttribute('data-fm-speed')) || 1.5;
  const known = new Set();
  let busy = false;

  function apply(el) {
    if (!(el instanceof HTMLAudioElement)) return; // רק אודיו, לא פרסומות וידאו
    known.add(el);
    const r = rate();
    if (Math.abs(el.playbackRate - r) > 0.01) {
      busy = true;
      el.defaultPlaybackRate = r;
      el.playbackRate = r;
      el.preservesPitch = true;
      busy = false;
    }
  }
  const applyAll = () => {
    document.querySelectorAll('audio').forEach(apply);
    known.forEach(apply);
  };

  // הנגן מאפס מהירות בהחלפת קובץ — אוכפים מחדש
  ['play', 'playing', 'loadedmetadata', 'ratechange'].forEach(ev =>
    document.addEventListener(ev, e => { if (!busy) apply(e.target); }, true));

  const origPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...a) { apply(this); return origPlay.apply(this, a); };

  new MutationObserver(applyAll).observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-fm-speed'] });
  setInterval(applyAll, 1500);
})();
