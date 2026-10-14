// עולם מבודד: קורא את ההגדרה ומעביר לדף דרך attribute
const setAttr = r => document.documentElement.setAttribute('data-fm-speed', r);
chrome.storage.sync.get({ rate: 1.5 }, d => setAttr(d.rate));
chrome.storage.onChanged.addListener(c => { if (c.rate) setAttr(c.rate.newValue); });
