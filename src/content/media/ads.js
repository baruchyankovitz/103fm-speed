import { AD_CONTAINER_SELECTOR, AD_PLAYER_ID, MIN_CONTENT_DURATION_S } from './config.js';

/** True for the ad player or any media inside an ad container. */
export const isAd = element => element.id === AD_PLAYER_ID || !!element.closest?.(AD_CONTAINER_SELECTOR);

/** True for a long, finite, non-ad media element (a show). */
export const isContent = element =>
  !isAd(element) && element.duration > MIN_CONTENT_DURATION_S && isFinite(element.duration);
