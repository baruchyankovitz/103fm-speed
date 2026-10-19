// Shows the current speed on the extension icon
const show = r => {
  chrome.action.setBadgeText({ text: String(r) });
  chrome.action.setBadgeBackgroundColor({ color: '#d32f2f' });
  chrome.action.setTitle({ title: `Radio Speed — ${r}x` });
};
const init = () => chrome.storage.sync.get({ rate: 1.5 }, d => show(d.rate));
chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);
chrome.storage.onChanged.addListener(c => {
  if (c.rate) show(c.rate.newValue);
});
