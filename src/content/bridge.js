import { DEFAULT_SPEED, EVENTS, LOCAL_STATS_KEY, SPEED_ATTRIBUTE, STORAGE_KEY } from '../shared/constants.js';
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

// Playback history and time-saved estimates stay in extension-local storage; they are not synced.
document.addEventListener(EVENTS.historyUpdate, event => {
  const stats = event.detail;
  if (!stats || !Array.isArray(stats.history) || !Number.isFinite(stats.savedSeconds)) return;
  const host = location.hostname;
  if (!['maariv.co.il', 'glz.co.il', 'kan.org.il'].some(domain => host === domain || host.endsWith('.' + domain))) return;
  const history = stats.history.slice(0, 50).map(item => ({
    title: String(item.title || '').slice(0, 200),
    url: String(item.url || '').slice(0, 2000),
    position: Math.max(0, Number(item.position) || 0),
    duration: Math.max(0, Number(item.duration) || 0),
    updatedAt: Math.max(0, Number(item.updatedAt) || 0),
    complete: !!item.complete
  }));
  chrome.storage.local.get({ [LOCAL_STATS_KEY]: { sites: {} } }, saved => {
    const sites = saved[LOCAL_STATS_KEY]?.sites || {};
    sites[location.origin] = { history, savedSeconds: Math.max(0, stats.savedSeconds) };
    chrome.storage.local.set({ [LOCAL_STATS_KEY]: { sites } });
  });
});
