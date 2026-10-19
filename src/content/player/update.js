import { FM, site } from './env.js';
import { fmt, clamp } from './util.js';
import { rate, audio, title, dur, cur, playing } from './audio.js';
import { I } from './icons.js';
import { hashClip } from './clip.js';
import { reserveSpace } from './mount.js';
import { updateMediaSession } from './media-session.js';
import { state, roots } from './state.js';

// Renders the current state into every UI instance

export function update() {
  const a = audio(),
    ad = FM()?.ad();
  const d = dur(),
    c = state.dragging ? state.dragging.ratio * d : cur();
  const p = d ? clamp(c / d, 0, 1) : 0;
  const r = rate();
  const isPlay = playing();
  let buf = 0;
  if (a && a.buffered.length && d) buf = a.buffered.end(a.buffered.length - 1) / d;
  const left = d ? (d - c) / r : NaN;
  const endAt = isFinite(left)
    ? new Date(Date.now() + left * 1000).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    : '';

  for (const root of roots) {
    const q = s => root.querySelectorAll(`[data-role="${s}"]`);
    q('played').forEach(e => (e.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`));
    q('buf').forEach(e => (e.style.clipPath = `inset(0 ${100 - buf * 100}% 0 0)`));
    q('head').forEach(e => (e.style.left = p * 100 + '%'));
    q('cur').forEach(e => (e.textContent = fmt(c)));
    q('dur').forEach(e => (e.textContent = fmt(d)));
    q('rate').forEach(e => (e.textContent = r + 'x'));
    q('title').forEach(e => (e.textContent = title()));
    q('play-icon').forEach(e => {
      const want = isPlay ? 'pause' : 'play';
      if (e.dataset.state !== want) {
        e.innerHTML = I[want];
        e.dataset.state = want;
      }
    });
    q('rate-range').forEach(e => {
      if (root.ownerDocument.activeElement !== e) e.value = r;
    });
    q('vol').forEach(e => {
      if (a && root.ownerDocument.activeElement !== e) e.value = a.muted ? 0 : a.volume;
    });
    q('vol-icon').forEach(e => {
      const want = a && (a.muted || a.volume === 0) ? 'mute' : 'vol';
      if (e.dataset.state !== want) {
        e.innerHTML = I[want];
        e.dataset.state = want;
      }
    });
    q('sleep-badge').forEach(e => {
      e.hidden = !state.sleep;
      e.textContent = state.sleep?.end
        ? 'סוף'
        : state.sleep
          ? Math.ceil((state.sleep.until - Date.now()) / 60000) + '′'
          : '';
    });
    q('clip').forEach(e => {
      const c2 = state.clipStop && d ? state.clipStop : null;
      e.hidden = !c2;
      if (c2) {
        const s = c2 - (hashClip?.a || 0);
        e.style.left = ((hashClip?.a || 0) / d) * 100 + '%';
        e.style.width = (s / d) * 100 + '%';
      }
    });
    root.querySelectorAll('[data-act="rate"]').forEach(b => b.classList.toggle('on', +b.dataset.v === r));
    root.classList.toggle('fm-ad', !!ad);
    root.classList.toggle('fm-is-playing', !!isPlay);
    q('status').forEach(e => {
      e.innerHTML = ad
        ? '<span class="fm-ad-pill">פרסומת</span> התוכנית תתחיל מיד אחריה'
        : FM()?.pausedAd?.()
          ? '<span class="fm-ad-pill">פרסומת</span> מושהית · לחצו על השמעה כדי להמשיך'
          : isFinite(left) && a
            ? `נותרו <b>${fmt(left)}</b> במהירות ${r}x <span class="fm-dot">•</span> מסתיים ב־${endAt}` +
              (state.sleep ? ` <span class="fm-dot">•</span> טיימר שינה פעיל` : '')
            : 'לחצו על השמעה כדי להתחיל';
    });
  }
  if (!site.inline && state.main) {
    const was = state.main.hidden;
    state.main.hidden = !a && !ad; // On a live broadcast the site's player stays
    if (site.bar && was !== state.main.hidden) reserveSpace();
  }
  if (state.dockHost) state.dockHost.classList.toggle('fm-docked', !!state.main && !state.main.hidden);
  if (site.hide)
    document.querySelectorAll(site.hide).forEach(el => {
      if (state.main && !state.main.hidden) el.style.setProperty('display', 'none', 'important');
      else el.style.removeProperty('display');
    });
  if (state.mini)
    state.mini.classList.toggle('show', !state.mainVisible && !!isPlay && !state.pipWin && !state.miniDismissed);
  if (state.mainVisible) state.miniDismissed = false;
  updateMediaSession(c, d, r, isPlay);
}
