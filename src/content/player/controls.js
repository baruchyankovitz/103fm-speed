import { SEEK_END_MARGIN_S, JUMP_END_OFFSET_S } from './config.js';
import {
  currentAudio,
  currentTime,
  currentRate,
  duration,
  isPlaying,
  pausedAd,
  playingAd,
  siteButton
} from './now-playing.js';
import { requestRender } from './render-scheduler.js';
import { emitSetSpeed, emitToast } from '../events.js';
import { SPEED_ATTRIBUTE } from '../../shared/constants.js';
import { clamp } from '../../shared/math.js';
import { normalizeSpeed } from '../../shared/speed.js';

// Playback commands

/** Sets and saves the playback speed. */
export function setRate(rate) {
  const speed = normalizeSpeed(rate);
  document.documentElement.setAttribute(SPEED_ATTRIBUTE, speed);
  emitSetSpeed(speed);
  emitToast(speed + 'x');
  requestRender();
}

/** Changes the speed by a (possibly negative) step. */
export const changeRate = step => setRate(currentRate() + step);

/** Plays or pauses the ad if there is one, else the show. */
export function togglePlay() {
  // The site's button does not control the ad, so pause and resume it directly
  const ad = playingAd();
  const paused = pausedAd();
  if (ad) {
    ad.pause();
    return;
  }
  if (paused) {
    paused.play().catch(() => {});
    return;
  }
  const button = siteButton();
  if (button) {
    button.click();
    return;
  }
  const audio = currentAudio();
  if (audio) audio.paused ? audio.play() : audio.pause();
}

/** Pauses whatever is playing. */
export function pause() {
  const ad = playingAd();
  if (ad) ad.pause();
  else if (isPlaying()) togglePlay();
}

/** Seeks to a time in seconds; `quiet` suppresses the "press play first" toast. */
export function seekTo(seconds, quiet) {
  const audio = currentAudio();
  if (!audio || playingAd()) {
    if (!quiet) emitToast('לחצו קודם על השמעה');
    return;
  }
  audio.currentTime = clamp(seconds, 0, Math.max(0, audio.duration - SEEK_END_MARGIN_S));
  requestRender();
}

/** Seeks relative to the current position. */
export const skip = seconds => {
  seekTo(currentTime() + seconds, true);
  emitToast((seconds > 0 ? '+' : '−') + Math.abs(seconds) + ' שנ׳');
};

/** Jumps to the start of the show. */
export function jumpToStart() {
  seekTo(0);
  emitToast('להתחלה');
}

/** Jumps to just before the end of the show. */
export function jumpToEnd() {
  seekTo(duration() - JUMP_END_OFFSET_S);
  emitToast('לסוף');
}
