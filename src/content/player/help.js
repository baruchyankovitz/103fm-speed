import { createRtlBox } from './dom.js';
import { helpHTML } from './templates.js';

let helpElement;

/** Builds the keyboard help dialog into the page. */
export function mountHelp() {
  helpElement = createRtlBox('fm-help', helpHTML);
  helpElement.hidden = true;
  helpElement.addEventListener('click', event => {
    if (event.target === helpElement || event.target.closest('[data-act="help"]')) toggleHelp(false);
  });
  document.body.appendChild(helpElement);
}

/** Shows or hides the help dialog (no argument toggles it). */
export function toggleHelp(show) {
  if (!helpElement) return;
  helpElement.hidden = show === undefined ? !helpElement.hidden : !show;
}
