// עולם מבודד: הגדרות, סרגל שליטה בנגן וקיצורי מקלדת
const SPEEDS = [1, 1.25, 1.5, 1.75, 2, 2.5];
let rate = 1.5;
const root = document.documentElement;

const setRate = r => { rate = r; chrome.storage.sync.set({ rate: r }); };
const sync = r => { rate = r; root.setAttribute('data-fm-speed', r); render(); };


function step(dir) {
  const i = SPEEDS.indexOf(rate);
  const n = i === -1 ? SPEEDS.indexOf(1.5) : Math.min(SPEEDS.length - 1, Math.max(0, i + dir));
  setRate(SPEEDS[n]);
  toast(SPEEDS[n] + 'x');
}
const send = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
const seek = s => { send('fm-seek', s); toast((s > 0 ? '+' : '−') + Math.abs(s) + ' שנ׳'); };
const togglePlay = () => document.querySelector('.mouthjs-playbutton')?.click();

// ---- סרגל שליטה מודרני מתחת לנגן ----
const ICON = {
  back: '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/><text x="12" y="16.5" text-anchor="middle">10</text></svg>',
  fwd:  '<svg viewBox="0 0 24 24"><path d="M12 5V2l5 4-5 4V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z"/><text x="12" y="16.5" text-anchor="middle">10</text></svg>'
};
let bar, speedBtns = [], timeEl;

function build() {
  bar = document.createElement('div');
  bar.className = 'fm-bar';
  bar.dir = 'rtl';
  bar.innerHTML = `
    <div class="fm-group fm-skip">
      <button class="fm-icon" data-act="back" title="10 שניות אחורה (←)">${ICON.back}</button>
      <button class="fm-icon" data-act="fwd" title="10 שניות קדימה (→)">${ICON.fwd}</button>
    </div>
    <div class="fm-group fm-speeds" role="radiogroup" aria-label="מהירות השמעה">
      <span class="fm-label">מהירות</span>
      ${SPEEDS.map(s => `<button class="fm-speed" data-speed="${s}" role="radio">${s}x</button>`).join('')}
    </div>
    <div class="fm-group fm-time" title="הזמן שנותר לפי המהירות הנוכחית"></div>`;
  bar.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.dataset.speed) setRate(parseFloat(b.dataset.speed));
    else if (b.dataset.act === 'back') seek(-10);
    else if (b.dataset.act === 'fwd') seek(10);
  });
  speedBtns = [...bar.querySelectorAll('.fm-speed')];
  timeEl = bar.querySelector('.fm-time');
}

function mount() {
  if (bar && document.contains(bar)) return;
  const player = document.querySelector('.content_centerblock.player') || document.querySelector('.player');
  if (!player || !document.querySelector('.mouthjs-playbutton')) return;
  if (!bar) build();
  player.classList.add('fm-enhanced');
  player.appendChild(bar);
  render();
}

function render() {
  speedBtns.forEach(b => {
    const on = parseFloat(b.dataset.speed) === rate;
    b.classList.toggle('on', on);
    b.setAttribute('aria-checked', on);
  });
  renderTime();
}

// ---- זמן שנותר, מחושב לפי המהירות ----
let lastTime = null;
const fmt = s => {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};
function renderTime() {
  if (!timeEl || !lastTime) return;
  const left = (lastTime.dur - lastTime.cur) / rate;
  const end = new Date(Date.now() + left * 1000).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  timeEl.innerHTML = `נותרו <b>${fmt(left)}</b><span class="fm-dot">·</span>מסתיים ב־${end}`;
}
document.addEventListener('fm-time', e => {
  try { lastTime = JSON.parse(e.detail); renderTime(); } catch {}
});

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
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName))) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  let handled = true;
  if (e.shiftKey && (e.key === '>' || e.code === 'Period')) step(+1);
  else if (e.shiftKey && (e.key === '<' || e.code === 'Comma')) step(-1);
  else if (!e.shiftKey && e.key === 'ArrowRight') seek(10);
  else if (!e.shiftKey && e.key === 'ArrowLeft') seek(-10);
  else if (e.code === 'Space' && document.querySelector('.mouthjs-playbutton')) togglePlay();
  else handled = false;
  if (handled) { e.preventDefault(); e.stopPropagation(); }
}, true);

// ---- טעינת ההגדרות (בסוף, אחרי שהכול מוגדר) ----
chrome.storage.sync.get({ rate: 1.5 }, d => sync(d.rate));
chrome.storage.onChanged.addListener(c => { if (c.rate) sync(c.rate.newValue); });

new MutationObserver(mount).observe(document, { childList: true, subtree: true });
mount();
