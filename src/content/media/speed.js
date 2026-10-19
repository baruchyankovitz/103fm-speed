import { AD_BOX, isAd } from './ads.js';
import { hook } from './positions.js';

export const rate = () => parseFloat(document.documentElement.getAttribute('data-fm-speed')) || 1.5;
export const known = new Set();
let busy = false;

function apply(el) {
  // Track every audio element, and video only when it is an ad (so the player can pause it)
  if (!(el instanceof HTMLAudioElement) && !(el instanceof HTMLMediaElement && isAd(el))) return;
  if (!known.has(el)) {
    known.add(el);
    hook(el);
  }
  if (isAd(el)) return; // Do not speed up ads
  const r = rate();
  if (Math.abs(el.playbackRate - r) > 0.01) {
    busy = true;
    el.defaultPlaybackRate = r;
    el.playbackRate = r;
    el.preservesPitch = true;
    busy = false;
  }
}
const applyAll = () => {
  document.querySelectorAll(`audio,:is(${AD_BOX}) video`).forEach(apply);
  known.forEach(apply);
};

export function initSpeed() {
  // Enforce the speed every time the player resets it
  ['play', 'playing', 'loadedmetadata', 'ratechange'].forEach(ev =>
    document.addEventListener(
      ev,
      e => {
        if (!busy) apply(e.target);
      },
      true
    )
  );

  const origPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...a) {
    apply(this);
    return origPlay.apply(this, a);
  };

  new MutationObserver(applyAll).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-fm-speed']
  });
  setInterval(applyAll, 1500);
}
