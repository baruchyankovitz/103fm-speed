import { TOAST_MS } from './config.js';
import { EVENTS } from '../../shared/constants.js';

let toastElement;
let hideTimer;

/** Shows toast messages sent through the toast event (also from iframes' media code). */
export function initToast() {
  document.addEventListener(EVENTS.toast, event => {
    if (!document.body) return;
    if (!toastElement) {
      toastElement = document.createElement('div');
      toastElement.className = 'fm-toast';
      document.body.appendChild(toastElement);
    }
    toastElement.textContent = event.detail;
    toastElement.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toastElement.classList.remove('show'), TOAST_MS);
  });
}
