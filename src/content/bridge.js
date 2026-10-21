import { DEFAULT_SPEED, EVENTS, SPEED_ATTRIBUTE, STORAGE_KEY } from '../shared/constants.js';
import { isValidSpeed } from '../shared/speed.js';

// Isolated world: connects the saved settings (chrome.storage) to the player running in the page world
const root = document.documentElement;
const publishSpeed = rate => root.setAttribute(SPEED_ATTRIBUTE, rate);

chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_SPEED }, saved => publishSpeed(saved[STORAGE_KEY]));
chrome.storage.onChanged.addListener(changes => {
  if (changes[STORAGE_KEY]) publishSpeed(changes[STORAGE_KEY].newValue);
});

// The player asks to save a new speed
document.addEventListener(EVENTS.setSpeed, event => {
  const rate = parseFloat(event.detail);
  if (isValidSpeed(rate)) chrome.storage.sync.set({ [STORAGE_KEY]: rate });
});
