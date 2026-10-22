import { DEFAULT_SPEED, LOCAL_STATS_KEY, POPUP_SPEEDS, STORAGE_KEY } from '../shared/constants.js';

const speedGrid = document.getElementById('g');
const historyList = document.getElementById('history');

const allowedHosts = ['maariv.co.il', 'glz.co.il', 'kan.org.il'];
function safeEpisodeUrl(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && allowedHosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host))
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function formatSavedTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  if (!minutes) return `${Math.floor(seconds)} שניות`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours ? `${hours} שעות ו־${remainingMinutes} דקות` : `${minutes} דקות`;
}

function renderHistory(stats = {}) {
  const sites = Object.values(stats.sites || {});
  const savedSeconds = sites.reduce((total, site) => total + (site.savedSeconds || 0), 0);
  document.getElementById('saved-time').textContent = `זמן שנחסך בהאצה: ${formatSavedTime(savedSeconds)}`;
  historyList.replaceChildren();
  const history = sites
    .flatMap(site => site.history || [])
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((item, index, all) => all.findIndex(other => other.url === item.url) === index)
    .slice(0, 5);
  if (!history.length) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'התוכניות ששמעת יופיעו כאן';
    historyList.appendChild(empty);
    return;
  }

  for (const item of history) {
    const row = document.createElement('li');
    row.className = 'history-item';
    const details = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = item.title || 'תוכנית רדיו';
    const progress = document.createElement('small');
    const percent = item.complete ? 100 : Math.min(100, Math.floor((item.position / item.duration) * 100) || 0);
    progress.textContent = item.complete ? 'הושלמה · 100%' : `${percent}% הושלמו`;
    details.append(title, progress);
    row.appendChild(details);

    const href = safeEpisodeUrl(item.url);
    if (href) {
      const resume = document.createElement('a');
      resume.href = href;
      resume.target = '_blank';
      resume.rel = 'noopener noreferrer';
      resume.textContent = item.complete ? 'האזנה שוב' : 'המשך';
      row.appendChild(resume);
    }
    historyList.appendChild(row);
  }
}

function createSpeedButton(speed, selectedSpeed) {
  const button = document.createElement('button');
  button.textContent = speed + 'x';
  if (speed === selectedSpeed) button.className = 'on';
  button.onclick = () => {
    chrome.storage.sync.set({ [STORAGE_KEY]: speed });
    speedGrid.querySelectorAll('button').forEach(other => (other.className = ''));
    button.className = 'on';
  };
  return button;
}

chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_SPEED }, saved => {
  POPUP_SPEEDS.forEach(speed => speedGrid.appendChild(createSpeedButton(speed, saved[STORAGE_KEY])));
});

chrome.storage.local.get({ [LOCAL_STATS_KEY]: { sites: {} } }, saved =>
  renderHistory(saved[LOCAL_STATS_KEY])
);
