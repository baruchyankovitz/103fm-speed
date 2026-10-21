import { byRole } from './dom.js';

/** Shows (or, with null, hides) the banner of a main player element. */
export function setBanner(main, text) {
  const banner = main && byRole(main, 'banner');
  if (!banner) return;
  banner.hidden = !text;
  banner.textContent = text || '';
}
