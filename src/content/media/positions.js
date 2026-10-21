import { isAd, isContent } from './ads.js';
import { POSITION_SAVE_INTERVAL_MS, POSITIONS_STORAGE_KEY } from './config.js';
import { isResumable, mediaIdFromSrc, pruneOldest } from './position-store.js';
import { formatMinutesSeconds } from '../../shared/time.js';
import { emitContentReady, emitToast } from '../events.js';
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
  const store = readStore();
  store[mediaId(element)] = { t: element.currentTime, at: Date.now() };
  writeStore(pruneOldest(store));
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
    if (!isContent(element) || Date.now() - lastSavedAt < POSITION_SAVE_INTERVAL_MS) return;
    lastSavedAt = Date.now();
    savePosition(element);
  });
  element.addEventListener('ended', () => forgetPosition(element));
}
