import { getClipStop } from './clip-playback.js';
import { allByRole, queryAll } from './dom.js';
import { ICONS } from './icons.js';
import { currentTitle } from './now-playing.js';
import { getSharedClip } from './shared-clip.js';
import { sleepBadgeText } from './sleep-model.js';
import { getSleep } from './sleep-timer.js';
import { formatTime } from '../../shared/time.js';

// Renders the playback snapshot into one UI instance (main, mini or floating window)

const setText = (root, role, text) => allByRole(root, role).forEach(el => (el.textContent = text));

function setIcon(element, name) {
  if (element.dataset.state === name) return;
  element.innerHTML = ICONS[name];
  element.dataset.state = name;
}

function renderProgress(root, { progress, buffered, time, total }) {
  allByRole(root, 'played').forEach(el => (el.style.clipPath = `inset(0 ${100 - progress * 100}% 0 0)`));
  allByRole(root, 'buf').forEach(el => (el.style.clipPath = `inset(0 ${100 - buffered * 100}% 0 0)`));
  allByRole(root, 'head').forEach(el => (el.style.left = progress * 100 + '%'));
  setText(root, 'cur', formatTime(time));
  setText(root, 'dur', formatTime(total));
}

function renderLabels(root, { rate }) {
  setText(root, 'rate', rate + 'x');
  setText(root, 'title', currentTitle());
}

function renderRateControls(root, { rate }) {
  allByRole(root, 'rate-range').forEach(el => {
    if (root.ownerDocument.activeElement !== el) el.value = rate;
  });
  queryAll('[data-act="rate"]', root).forEach(button => button.classList.toggle('on', +button.dataset.v === rate));
}

function renderIcons(root, { audio, playing }) {
  allByRole(root, 'play-icon').forEach(el => setIcon(el, playing ? 'pause' : 'play'));
  allByRole(root, 'vol').forEach(el => {
    if (audio && root.ownerDocument.activeElement !== el) el.value = audio.muted ? 0 : audio.volume;
  });
  allByRole(root, 'vol-icon').forEach(el => setIcon(el, audio && (audio.muted || audio.volume === 0) ? 'mute' : 'vol'));
}

function renderSleepBadge(root) {
  const sleep = getSleep();
  allByRole(root, 'sleep-badge').forEach(el => {
    el.hidden = !sleep;
    el.textContent = sleepBadgeText(sleep, Date.now());
  });
}

function renderClipMarker(root, { total }) {
  const stopAt = getClipStop() && total ? getClipStop() : null;
  const start = getSharedClip()?.start || 0;
  allByRole(root, 'clip').forEach(el => {
    el.hidden = !stopAt;
    if (!stopAt) return;
    el.style.left = (start / total) * 100 + '%';
    el.style.width = ((stopAt - start) / total) * 100 + '%';
  });
}

function statusHTML({ audio, ad, pausedAd, secondsLeft, rate, endClock }) {
  if (ad) return '<span class="fm-ad-pill">פרסומת</span> התוכנית תתחיל מיד אחריה';
  if (pausedAd) return '<span class="fm-ad-pill">פרסומת</span> מושהית · לחצו על השמעה כדי להמשיך';
  if (!isFinite(secondsLeft) || !audio) return 'לחצו על השמעה כדי להתחיל';
  const left = `נותרו <b>${formatTime(secondsLeft)}</b> במהירות ${rate}x <span class="fm-dot">•</span> מסתיים ב־${endClock}`;
  return left + (getSleep() ? ` <span class="fm-dot">•</span> טיימר שינה פעיל` : '');
}

/** Renders the snapshot into one UI instance. */
export function renderRoot(root, snapshot) {
  renderProgress(root, snapshot);
  renderLabels(root, snapshot);
  renderIcons(root, snapshot);
  renderRateControls(root, snapshot);
  renderSleepBadge(root);
  renderClipMarker(root, snapshot);
  root.classList.toggle('fm-ad', !!snapshot.ad);
  root.classList.toggle('fm-is-playing', !!snapshot.playing);
  const status = statusHTML(snapshot);
  allByRole(root, 'status').forEach(el => (el.innerHTML = status));
}
