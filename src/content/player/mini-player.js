import { createRtlBox } from './dom.js';
import { miniHTML } from './templates.js';
import { wireRoot } from './wire.js';

let miniElement;
let mainVisible = true;
let dismissed = false;

/** True once the mini player has been built. */
export const hasMini = () => !!miniElement;

/** Builds the mini player (shown when the main player is scrolled out of view). */
export function mountMini() {
  miniElement = createRtlBox('fm-miniplayer', miniHTML);
  document.body.appendChild(miniElement);
  wireRoot(miniElement);
}

/** Records whether the main player is on screen. */
export const setMainVisible = visible => {
  mainVisible = visible;
};

/** Hides the mini player until the main player is seen again. */
export const dismissMini = () => {
  dismissed = true;
};

/** Shows the mini player only while playing off screen, outside the floating window. */
export function renderMini(playing, pipOpen) {
  if (miniElement) miniElement.classList.toggle('show', !mainVisible && !!playing && !pipOpen && !dismissed);
  if (mainVisible) dismissed = false;
}
