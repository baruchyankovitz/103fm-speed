import { $, FM, site } from './env.js';
import { parseT } from './util.js';

// Reads the current audio element and the site player state

export const rate = () => FM()?.rate() || 1.5;
export const audio = () => FM()?.audio();
export const siteBtn = () => site.btn && $(site.btn);
export const title = () => ((site.title && $(site.title)?.textContent) || document.title).trim();
const siteDuration = () => (site.duration ? parseT($(site.duration)?.textContent.trim()) : NaN);
export const dur = () => {
  const a = audio();
  return a && isFinite(a.duration) ? a.duration : siteDuration();
};
export const cur = () => audio()?.currentTime || 0;
export const playing = () => {
  const a = audio();
  return FM()?.ad() ? true : a ? !a.paused : siteBtn()?.classList.contains('playing');
};
