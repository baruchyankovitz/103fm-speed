// Isolated world: connects the saved settings (chrome.storage) to the player running in the page world
const root = document.documentElement;
const apply = r => root.setAttribute('data-fm-speed', r);

chrome.storage.sync.get({ rate: 1.5 }, d => apply(d.rate));
chrome.storage.onChanged.addListener(c => {
  if (c.rate) apply(c.rate.newValue);
});

// The player asks to save a new speed
document.addEventListener('fm-set-speed', e => {
  const r = parseFloat(e.detail);
  if (r >= 0.5 && r <= 3) chrome.storage.sync.set({ rate: r });
});
