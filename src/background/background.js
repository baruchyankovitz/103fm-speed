import { BADGE_COLOR, DEFAULT_SPEED, STORAGE_KEY } from '../shared/constants.js';

// Shows the current speed on the extension icon
const showSpeed = rate => {
  chrome.action.setBadgeText({ text: String(rate) });
  chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR });
  chrome.action.setTitle({ title: `Radio Speed — ${rate}x` });
};
const showSavedSpeed = () =>
  chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_SPEED }, saved => showSpeed(saved[STORAGE_KEY]));

chrome.runtime.onInstalled.addListener(showSavedSpeed);
chrome.runtime.onStartup.addListener(showSavedSpeed);
chrome.storage.onChanged.addListener(changes => {
  if (changes[STORAGE_KEY]) showSpeed(changes[STORAGE_KEY].newValue);
});
