import { JUMP_END_OFFSET_S, MEDIA_SESSION_THROTTLE_MS } from './config.js';
import { pause, seekTo, skip, togglePlay } from './controls.js';
import { currentAudio, currentTitle, duration, isPlaying } from './now-playing.js';
import { clamp } from '../../shared/math.js';
import { site } from '../sites.js';

// Media keys + Chrome controls

const DEFAULT_SEEK_OFFSET_S = 10;
const ARTWORK_SIZES = '512x512';

let lastTitle = '';
let lastPositionUpdateAt = 0;

function setMetadata() {
  const title = currentTitle();
  if (title === lastTitle) return;
  lastTitle = title;
  const artwork = document.querySelector('meta[property="og:image"]')?.content;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: site.name || '',
      album: document.title,
      artwork: artwork ? [{ src: artwork, sizes: ARTWORK_SIZES }] : []
    });
  } catch {}
}

/** Connects hardware media keys and Chrome's media controls to the player. */
export function setupMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const session = navigator.mediaSession;
  setMetadata();
  const setHandler = (name, handler) => {
    try {
      session.setActionHandler(name, handler);
    } catch {}
  };
  setHandler('play', () => {
    if (!isPlaying()) togglePlay();
  });
  setHandler('pause', () => pause());
  setHandler('seekbackward', e => skip(-(e.seekOffset || DEFAULT_SEEK_OFFSET_S)));
  setHandler('seekforward', e => skip(e.seekOffset || DEFAULT_SEEK_OFFSET_S));
  setHandler('seekto', e => seekTo(e.seekTime, true));
  setHandler('previoustrack', () => seekTo(0, true));
  setHandler('nexttrack', () => seekTo(duration() - JUMP_END_OFFSET_S, true));
}

/** Publishes title, play state and position to the browser, at most once per second. */
export function updateMediaSession({ time, total, rate, playing }) {
  if (
    !('mediaSession' in navigator) ||
    !currentAudio() ||
    Date.now() - lastPositionUpdateAt < MEDIA_SESSION_THROTTLE_MS
  )
    return;
  lastPositionUpdateAt = Date.now();
  setMetadata(); // On sites that switch shows without reloading the page
  try {
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    if (isFinite(total) && total > 0)
      navigator.mediaSession.setPositionState({ duration: total, position: clamp(time, 0, total), playbackRate: rate });
  } catch {}
}
