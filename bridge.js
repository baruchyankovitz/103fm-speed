// עולם מבודד: הגדרות, כפתור בנגן וקיצורי מקלדת
const SPEEDS = [1, 1.25, 1.5, 1.75, 2, 2.5];
let rate = 1.5;
const root = document.documentElement;

const setRate = r => { rate = r; chrome.storage.sync.set({ rate: r }); };
const sync = r => { rate = r; root.setAttribute('data-fm-speed', r); updateBtn(); };

chrome.storage.sync.get({ rate: 1.5 }, d => sync(d.rate));
chrome.storage.onChanged.addListener(c => { if (c.rate) sync(c.rate.newValue); });

// ---- כפתור מהירות בתוך הנגן ----
let btn;
function updateBtn() { if (btn) btn.textContent = rate + 'x'; }
function step(dir) {
  const i = SPEEDS.indexOf(rate);
  const n = i === -1 ? SPEEDS.indexOf(1.5) : Math.min(SPEEDS.length - 1, Math.max(0, i + dir));
  setRate(SPEEDS[n]);
  toast(SPEEDS[n] + 'x');
}
function mountBtn() {
  if (btn && document.contains(btn)) return;
  const mute = document.querySelector('.mouthjs-mutebutton');
  const player = document.querySelector('.player');
  if (!mute && !player) return;
  btn = document.createElement('button');
  btn.className = 'fm-speed-btn' + (mute ? '' : ' fm-floating');
  btn.title = 'מהירות השמעה (Shift+> / Shift+<)';
  btn.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    const i = SPEEDS.indexOf(rate);
    setRate(SPEEDS[(i + 1) % SPEEDS.length]);
  });
  if (mute) mute.parentElement.insertBefore(btn, mute);
  else player.appendChild(btn);
  updateBtn();
}
new MutationObserver(mountBtn).observe(document, { childList: true, subtree: true });

// ---- הודעה קטנה על המסך ----
let toastEl, toastT;
function toast(text) {
  if (!document.body) return;
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'fm-toast'; document.body.appendChild(toastEl); }
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('show'), 1200);
}
document.addEventListener('fm-toast', e => toast(e.detail));

// ---- קיצורי מקלדת ----
document.addEventListener('keydown', e => {
  const t = e.target;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  let handled = true;
  if (e.shiftKey && (e.key === '>' || e.code === 'Period')) step(+1);
  else if (e.shiftKey && (e.key === '<' || e.code === 'Comma')) step(-1);
  else if (!e.shiftKey && e.key === 'ArrowRight') { send('fm-seek', 15); toast('+15 שנ׳'); }
  else if (!e.shiftKey && e.key === 'ArrowLeft') { send('fm-seek', -15); toast('−15 שנ׳'); }
  else handled = false;
  if (handled) { e.preventDefault(); e.stopPropagation(); }
}, true);

function send(name, detail) { document.dispatchEvent(new CustomEvent(name, { detail })); }
