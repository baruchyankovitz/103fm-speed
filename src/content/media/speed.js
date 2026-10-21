import { isAd } from './ads.js';
import { AD_CONTAINER_SELECTOR, ENFORCE_INTERVAL_MS, RATE_TOLERANCE } from './config.js';
import { rememberPosition } from './positions.js';
import { track, trackedElements } from './registry.js';
import { DEFAULT_SPEED, SPEED_ATTRIBUTE } from '../../shared/constants.js';

let applying = false;

/** The speed chosen by the user (published by the bridge on <html>). */
export const currentRate = () => parseFloat(document.documentElement.getAttribute(SPEED_ATTRIBUTE)) || DEFAULT_SPEED;

function enforceSpeed(element) {
  // Track every audio element, and video only when it is an ad (so the player can pause it)
  if (!(element instanceof HTMLAudioElement) && !(element instanceof HTMLMediaElement && isAd(element))) return;
  if (track(element)) rememberPosition(element);
  if (isAd(element)) return; // Do not speed up ads
  const rate = currentRate();
  if (Math.abs(element.playbackRate - rate) > RATE_TOLERANCE) {
    applying = true;
    element.defaultPlaybackRate = rate;
    element.playbackRate = rate;
    element.preservesPitch = true;
    applying = false;
  }
}

const enforceAll = () => {
  document.querySelectorAll(`audio,:is(${AD_CONTAINER_SELECTOR}) video`).forEach(enforceSpeed);
  trackedElements().forEach(enforceSpeed);
};

/** Keeps the chosen speed applied whenever the site resets it. */
export function initSpeed() {
  ['play', 'playing', 'loadedmetadata', 'ratechange'].forEach(eventName =>
    document.addEventListener(
      eventName,
      event => {
        if (!applying) enforceSpeed(event.target);
      },
      true
    )
  );

  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    enforceSpeed(this);
    return originalPlay.apply(this, args);
  };

  new MutationObserver(enforceAll).observe(document.documentElement, {
    attributes: true,
    attributeFilter: [SPEED_ATTRIBUTE]
  });
  setInterval(enforceAll, ENFORCE_INTERVAL_MS);
}
