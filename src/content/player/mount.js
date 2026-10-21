import { setBanner } from './banner.js';
import { createRtlBox } from './dom.js';
import { mountHelp } from './help.js';
import { hasMini, mountMini, setMainVisible } from './mini-player.js';
import { attachAsBar, attachFloating, attachInline, attachToDock } from './mount-modes.js';
import { setupMediaSession } from './media-session.js';
import { requestRender } from './render-scheduler.js';
import { reserveSpace } from './reserve-space.js';
import { unregisterRoot } from './roots.js';
import { getSharedClip } from './shared-clip.js';
import { mainHTML } from './templates.js';
import { wireRoot } from './wire.js';
import { formatTimeRange } from '../../shared/time.js';
import { isFloatingSite, site } from '../sites.js';

// Builds the player into the page
let mainElement = null;
let dockHost = null;

/** The main player element, or null before it is mounted. */
export const getMain = () => mainElement;

/** The site element the player is docked into (dock mode), or null. */
export const getDockHost = () => dockHost;

function attachMain(main) {
  if (site.dock) {
    dockHost = attachToDock(main);
    return !!dockHost;
  }
  if (site.bar) return attachAsBar(main, () => reserveSpace(mainElement));
  if (isFloatingSite(site)) return attachFloating(main);
  return attachInline(main);
}

// Only the inline player scrolls: a docked, fixed or floating player is always on screen and needs no mini player
function trackVisibility(main) {
  if (!site.inline) return;
  new IntersectionObserver(
    ([entry]) => {
      setMainVisible(entry.isIntersecting);
      requestRender();
    },
    { threshold: 0 }
  ).observe(main);
}

/** Mounts the player if it is missing, e.g. after the site rebuilt its page. */
export function mountMain() {
  if (mainElement && document.contains(mainElement)) return;
  if (mainElement) unregisterRoot(mainElement); // The site rebuilt its player, so mount again
  const main = createRtlBox('fm-player', mainHTML);
  main.classList.toggle('fm-noshare', site.share === false);
  if (!attachMain(main)) {
    mainElement = null;
    return;
  }
  mainElement = main;
  wireRoot(main);
  trackVisibility(main);
  const clip = getSharedClip();
  if (clip) setBanner(main, `קטע משותף: ${formatTimeRange(clip.start, clip.end)} · לחצו על השמעה`);
  if (!hasMini()) {
    // First mount: the mini player and help are built once and survive remounts
    mountMini();
    mountHelp();
    setupMediaSession();
  }
  requestRender();
}
