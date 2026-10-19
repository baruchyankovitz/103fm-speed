import { FM } from './env.js';
import { clamp, toast } from './util.js';
import { audio, siteBtn, cur, playing } from './audio.js';
import { update } from './update.js';

// Playback commands

export function setRate(r) {
  r = Math.round(clamp(r, 0.5, 3) * 100) / 100;
  document.documentElement.setAttribute('data-fm-speed', r);
  document.dispatchEvent(new CustomEvent('fm-set-speed', { detail: String(r) }));
  toast(r + 'x');
  update();
}
export function togglePlay() {
  // The site's button does not control the ad, so pause and resume it directly
  const ad = FM()?.ad(),
    pausedAd = FM()?.pausedAd?.();
  if (ad) {
    ad.pause();
    return;
  }
  if (pausedAd) {
    pausedAd.play().catch(() => {});
    return;
  }
  const b = siteBtn();
  if (b) b.click();
  else {
    const a = audio();
    if (a) a.paused ? a.play() : a.pause();
  }
}
export function pause() {
  const ad = FM()?.ad();
  if (ad) ad.pause();
  else if (playing()) togglePlay();
}
export function seekTo(t, quiet) {
  const a = audio();
  if (!a || FM()?.ad()) {
    if (!quiet) toast('לחצו קודם על השמעה');
    return;
  }
  a.currentTime = clamp(t, 0, Math.max(0, a.duration - 0.25));
  update();
}
export const skip = s => {
  seekTo(cur() + s, true);
  toast((s > 0 ? '+' : '−') + Math.abs(s) + ' שנ׳');
};
