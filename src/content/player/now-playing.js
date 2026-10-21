import { query } from './dom.js';
import { currentContentAudio, currentRate, pausedAd, playingAd } from '../media/index.js';
import { parseTime } from '../../shared/time.js';
import { site } from '../sites.js';

// Reads the current audio element and the site player state

export { currentRate, pausedAd, playingAd };
export const currentAudio = currentContentAudio;

/** The site's own play button, if the site has one. */
export const siteButton = () => site.btn && query(site.btn);

/** Title of the show, from the site or the page title. */
export const currentTitle = () => ((site.title && query(site.title)?.textContent) || document.title).trim();

const siteDuration = () => (site.duration ? parseTime(query(site.duration)?.textContent.trim()) : NaN);

/** Show length in seconds (from the audio element, else from the site), NaN when unknown. */
export function duration() {
  const audio = currentAudio();
  return audio && isFinite(audio.duration) ? audio.duration : siteDuration();
}

/** Playback position in seconds. */
export const currentTime = () => currentAudio()?.currentTime || 0;

/** True while the show or an ad is playing. */
export function isPlaying() {
  const audio = currentAudio();
  if (playingAd()) return true;
  return audio ? !audio.paused : siteButton()?.classList.contains('playing');
}
