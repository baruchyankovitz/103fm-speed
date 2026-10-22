import { isAd, isContent } from './ads.js';
import {
  HISTORY_STORAGE_KEY,
  POSITION_SAVE_INTERVAL_MS,
  POSITIONS_STORAGE_KEY,
  SAVED_TIME_STORAGE_KEY
} from './config.js';
import { isResumable, mediaIdFromSrc, pruneOldest } from './position-store.js';
import { formatMinutesSeconds } from '../../shared/time.js';
import { emitContentReady, emitHistoryUpdate, emitToast } from '../events.js';
import { getPendingClip } from '../pending-clip.js';

// ---- Remember playback position ----
const mediaId = element => mediaIdFromSrc(element.currentSrc || element.src);

const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(POSITIONS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};
const writeStore = store => {
  try {
    localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(store));
  } catch {}
};

const readHistory = () => {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY));
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
};

const readSavedSeconds = () => {
  try {
    return Math.max(0, Number(localStorage.getItem(SAVED_TIME_STORAGE_KEY)) || 0);
  } catch {
    return 0;
  }
};

function publishStats() {
  emitHistoryUpdate({ history: readHistory(), savedSeconds: readSavedSeconds() });
}

function saveHistory(element, complete = false) {
  const id = mediaId(element);
  const duration = element.duration;
  if (!id || !isFinite(duration) || duration <= 0) return;
  const history = readHistory().filter(item => item.id !== id);
  history.unshift({
    id,
    title: document.title || 'תוכנית רדיו',
    url: location.href.replace(/#.*$/, ''),
    position: complete ? duration : Math.min(element.currentTime, duration),
    duration,
    updatedAt: Date.now(),
    complete
  });
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
  } catch {}
  publishStats();
}

const lastPlaybackSample = new WeakMap();
const unflushedSavedSeconds = new WeakMap();

function trackSavedTime(element) {
  const now = Date.now();
  const time = element.currentTime;
  const rate = element.playbackRate;
  const previous = lastPlaybackSample.get(element);
  lastPlaybackSample.set(element, { now, time });
  if (!previous || element.paused || rate <= 1) return;

  const elapsed = (now - previous.now) / 1000;
  const advanced = time - previous.time;
  const expected = elapsed * rate;
  // Ignore seeks, stalls and delayed background-tab events so the estimate stays conservative.
  if (elapsed <= 0 || elapsed > 7 || advanced < 0 || Math.abs(advanced - expected) > Math.max(1.5, expected * 0.35)) return;
  const saved = Math.max(0, advanced - elapsed);
  if (!saved) return;
  unflushedSavedSeconds.set(element, (unflushedSavedSeconds.get(element) || 0) + saved);
}

function flushSavedTime(element) {
  const pending = unflushedSavedSeconds.get(element) || 0;
  if (!pending) return;
  unflushedSavedSeconds.set(element, 0);
  try {
    localStorage.setItem(SAVED_TIME_STORAGE_KEY, String(readSavedSeconds() + pending));
  } catch {}
}

function resumeOrAnnounceClip(element) {
  if (!isContent(element)) return;
  // A shared clip link takes precedence over "resume where you stopped"
  if (getPendingClip()) {
    emitContentReady();
    return;
  }
  const position = readStore()[mediaId(element)];
  if (isResumable(position, element.duration)) {
    element.currentTime = position.t;
    emitToast('ממשיך מ־' + formatMinutesSeconds(position.t));
  }
}

function savePosition(element) {
  flushSavedTime(element);
  const store = readStore();
  store[mediaId(element)] = { t: element.currentTime, at: Date.now() };
  writeStore(pruneOldest(store));
  saveHistory(element);
}

function forgetPosition(element) {
  const store = readStore();
  delete store[mediaId(element)];
  writeStore(store);
}

/** Resumes, saves and forgets the playback position of a (non-ad) media element. */
export function rememberPosition(element) {
  if (isAd(element)) return;
  let lastSavedAt = 0;
  element.addEventListener('loadedmetadata', () => resumeOrAnnounceClip(element));
  element.addEventListener('timeupdate', () => {
    if (!isContent(element)) return;
    trackSavedTime(element);
    if (Date.now() - lastSavedAt < POSITION_SAVE_INTERVAL_MS) return;
    lastSavedAt = Date.now();
    savePosition(element);
  });
  element.addEventListener('ended', () => {
    flushSavedTime(element);
    saveHistory(element, true);
    forgetPosition(element);
  });
}
