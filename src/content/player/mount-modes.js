import { PREF_COLLAPSED, PREF_SLIM } from './config.js';
import { query } from './dom.js';
import { siteButton } from './now-playing.js';
import { readPref } from './prefs.js';
import { site } from '../sites.js';

// How the main player is attached to the page, per site mode. Each returns false when it cannot attach yet.

/** Built into the site's fixed bar; returns the host element, or null when the site has not built it yet. */
export function attachToDock(main) {
  const host = query(site.dock);
  if (!host) return null;
  main.classList.add('fm-dock');
  main.classList.toggle('fm-pop-up', !!site.popUp);
  main.hidden = true;
  host.appendChild(main);
  return host;
}

/** Fixed bar at the bottom of the screen that takes up page space instead of covering it. */
export function attachAsBar(main, onResize) {
  if (!document.body) return false;
  main.classList.add('fm-dock', 'fm-fixed', 'fm-pop-up');
  main.classList.toggle(PREF_SLIM, readPref(PREF_SLIM) === '1');
  main.hidden = true;
  document.body.appendChild(main);
  new ResizeObserver(onResize).observe(main);
  return true;
}

/** Floating player in the corner, shown only while a recorded show plays. */
export function attachFloating(main) {
  if (!document.body) return false;
  main.classList.add('fm-float');
  main.classList.toggle(PREF_COLLAPSED, readPref(PREF_COLLAPSED) === '1');
  main.style.setProperty('--fm-bottom', (site.bottom ?? 20) + 'px');
  main.hidden = true;
  document.body.appendChild(main);
  return true;
}

/** Replaces the site's own player inside the page. */
export function attachInline(main) {
  const player = query(site.inline);
  if (!player || !siteButton()) return false;
  player.classList.add('fm-enhanced');
  query('.fm-bar', player)?.remove(); // Bar from a previous version
  player.appendChild(main);
  return true;
}
