import { setBanner } from './banner.js';
import { setClipStop } from './clip-playback.js';
import { seekTo } from './controls.js';
import { getMain } from './mount.js';
import { emitToast } from '../events.js';
import { takePendingClip } from '../pending-clip.js';
import { EVENTS } from '../../shared/constants.js';
import { formatTimeRange } from '../../shared/time.js';

/** Starts the shared clip once the media code reports that the show has loaded. */
export function initClipHandshake() {
  document.addEventListener(EVENTS.contentReady, () => {
    const clip = takePendingClip();
    if (!clip) return;
    seekTo(clip.start, true);
    setClipStop(clip.end);
    emitToast('מנגן קטע ' + formatTimeRange(clip.start, clip.end));
    setBanner(getMain(), null);
  });
}
