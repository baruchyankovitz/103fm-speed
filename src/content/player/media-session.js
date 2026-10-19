import { site } from './env.js';
import { clamp } from './util.js';
import { audio, title, dur, playing } from './audio.js';
import { togglePlay, pause, seekTo, skip } from './controls.js';

// Media keys + Chrome controls

let msTitle = '';
function setMetadata() {
  const t = title();
  if (t === msTitle) return;
  msTitle = t;
  const art = document.querySelector('meta[property="og:image"]')?.content;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t,
      artist: site.name || '',
      album: document.title,
      artwork: art ? [{ src: art, sizes: '512x512' }] : []
    });
  } catch {}
}
export function setupMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const ms = navigator.mediaSession;
  setMetadata();
  const h = (n, f) => {
    try {
      ms.setActionHandler(n, f);
    } catch {}
  };
  h('play', () => {
    if (!playing()) togglePlay();
  });
  h('pause', () => pause());
  h('seekbackward', e => skip(-(e.seekOffset || 10)));
  h('seekforward', e => skip(e.seekOffset || 10));
  h('seekto', e => seekTo(e.seekTime, true));
  h('previoustrack', () => seekTo(0, true));
  h('nexttrack', () => seekTo(dur() - 1, true));
}
let msLast = 0;
export function updateMediaSession(c, d, r, isPlay) {
  if (!('mediaSession' in navigator) || !audio() || Date.now() - msLast < 1000) return;
  msLast = Date.now();
  setMetadata(); // On sites that switch shows without reloading the page
  try {
    navigator.mediaSession.playbackState = isPlay ? 'playing' : 'paused';
    if (isFinite(d) && d > 0)
      navigator.mediaSession.setPositionState({ duration: d, position: clamp(c, 0, d), playbackRate: r });
  } catch {}
}
