// Values shared by the background worker, the popup, the bridge and the page scripts

export const MIN_SPEED = 0.5;
export const MAX_SPEED = 3;
export const DEFAULT_SPEED = 1.5;

/** chrome.storage.sync key holding the chosen speed. */
export const STORAGE_KEY = 'rate';
/** Local-only playback history and saved-time total shared with the popup. */
export const LOCAL_STATS_KEY = 'radioSpeedLocalStats';
/** Attribute on <html> that carries the speed from the bridge to the page world. */
export const SPEED_ATTRIBUTE = 'data-fm-speed';

/** DOM events used between the page world, the isolated world and iframes. */
export const EVENTS = {
  setSpeed: 'fm-set-speed',
  historyUpdate: 'fm-history-update',
  toast: 'fm-toast',
  contentReady: 'fm-content-ready'
};

export const BADGE_COLOR = '#d32f2f';

export const POPUP_SPEEDS = [1, 1.25, 1.5, 1.75, 2, 2.5];
export const PLAYER_PRESETS = [1, 1.25, 1.5, 1.75, 2, 2.5, 3];
