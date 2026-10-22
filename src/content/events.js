import { EVENTS } from '../shared/constants.js';

/** Shows a short message; an event so the media code may run in an iframe. */
export const emitToast = message => document.dispatchEvent(new CustomEvent(EVENTS.toast, { detail: message }));

/** Tells the top frame's player that the show has loaded. */
export const emitContentReady = () => document.dispatchEvent(new CustomEvent(EVENTS.contentReady));

/** Sends local playback stats to the isolated-world bridge for the popup. */
export const emitHistoryUpdate = stats =>
  document.dispatchEvent(new CustomEvent(EVENTS.historyUpdate, { detail: stats }));

/** Asks the bridge to save a new speed. */
export const emitSetSpeed = rate => document.dispatchEvent(new CustomEvent(EVENTS.setSpeed, { detail: String(rate) }));
