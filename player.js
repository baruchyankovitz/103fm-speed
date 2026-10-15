// נגן מודרני ל־103FM — רץ בעולם הדף ומחליף את הממשק של הנגן המקורי
(() => {
  if (window.top !== window) return; // רק בחלון הראשי, לא ב-iframes
  const $ = (s, r = document) => r.querySelector(s);
  const FM = () => window.__fm;
  const PRESETS = [1, 1.25, 1.5, 1.75, 2, 2.5, 3];

  // ---------- עזרים ----------
  const fmt = s => {
    if (!isFinite(s)) return '--:--';
    s = Math.max(0, Math.floor(s));
    const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = String(s % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${String(m).padStart(2, '0')}:${ss}`;
  };
  const parseT = t => { // "12:30" / "1:02:03" / "750"
    if (!t) return NaN;
    if (/^\d+(\.\d+)?$/.test(t)) return +t;
    return t.split(':').reduce((a, v) => a * 60 + +v, 0);
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rate = () => FM()?.rate() || 1.5;
  const audio = () => FM()?.audio();
  const siteBtn = () => $('.mouthjs-playbutton');
  const title = () => ($('.content_centerblock.player h1')?.textContent || document.title).trim();
  const siteDuration = () => parseT($('.mouthjs-duration')?.textContent.trim());
  const dur = () => { const a = audio(); return a && isFinite(a.duration) ? a.duration : siteDuration(); };
  const cur = () => audio()?.currentTime || 0;
  const playing = () => { const a = audio(); return FM()?.ad() ? true : a ? !a.paused : siteBtn()?.classList.contains('playing'); };
  const toast = t => document.dispatchEvent(new CustomEvent('fm-toast', { detail: t }));
  const rng = (a, b) => '\u2066' + fmt(a) + (b ? '–' + fmt(b) : '') + '\u2069'; // טווח זמנים שלא מתהפך בעברית

  function setRate(r) {
    r = Math.round(clamp(r, 0.5, 3) * 100) / 100;
    document.documentElement.setAttribute('data-fm-speed', r);
    document.dispatchEvent(new CustomEvent('fm-set-speed', { detail: String(r) }));
    toast(r + 'x');
    update();
  }
  function togglePlay() {
    const b = siteBtn();
    if (b) b.click();
    else { const a = audio(); if (a) a.paused ? a.play() : a.pause(); }
  }
  function pause() { if (playing() && !FM()?.ad()) togglePlay(); }
  function seekTo(t, quiet) {
    const a = audio();
    if (!a || FM()?.ad()) { if (!quiet) toast('לחצו קודם על השמעה'); return; }
    a.currentTime = clamp(t, 0, Math.max(0, a.duration - 0.25));
    update();
  }
  const skip = s => { seekTo(cur() + s, true); toast((s > 0 ? '+' : '−') + Math.abs(s) + ' שנ׳'); };

  // ---------- אייקונים ----------
  const I = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
    start: '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="2.4" height="14" rx="1"/><path d="M19 6.2v11.6a.8.8 0 0 1-1.25.66L9.4 12.66a.8.8 0 0 1 0-1.32l8.35-5.8A.8.8 0 0 1 19 6.2z"/></svg>',
    end: '<svg viewBox="0 0 24 24"><rect x="16.6" y="5" width="2.4" height="14" rx="1"/><path d="M5 6.2v11.6a.8.8 0 0 0 1.25.66l8.35-5.8a.8.8 0 0 0 0-1.32L6.25 5.54A.8.8 0 0 0 5 6.2z"/></svg>',
    back: n => `<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/><text x="12" y="16.3" text-anchor="middle">${n}</text></svg>`,
    fwd: n => `<svg viewBox="0 0 24 24"><path d="M12 5V2l5 4-5 4V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z"/><text x="12" y="16.3" text-anchor="middle">${n}</text></svg>`,
    vol: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5a1 1 0 0 0 1 1h3l4.3 3.6a.8.8 0 0 0 1.3-.6V5.5a.8.8 0 0 0-1.3-.6L8 8.5H5a1 1 0 0 0-1 1z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M18.8 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    mute: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5a1 1 0 0 0 1 1h3l4.3 3.6a.8.8 0 0 0 1.3-.6V5.5a.8.8 0 0 0-1.3-.6L8 8.5H5a1 1 0 0 0-1 1z"/><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" stroke="currentColor" stroke-width="1.8"/></svg>',
    pip: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="11.5" y="11" width="7.5" height="6" rx="1.2"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    keys: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6 10h1.5M9.5 10H11M13 10h1.5M16.5 10H18M8 14h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };

  // גל קול דקורטיבי (קבוע לכל תוכנית)
  function wave(n = 140) {
    let seed = [...location.search].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    let out = '';
    for (let i = 0; i < n; i++) {
      const h = 18 + Math.round((Math.sin(i / 5) * 0.25 + 0.75) * rnd() * 72);
      out += `<rect x="${i * 4 + 0.6}" y="${50 - h / 2}" width="2.2" height="${h}" rx="1.1"/>`;
    }
    return `<svg viewBox="0 0 ${n * 4} 100" preserveAspectRatio="none">${out}</svg>`;
  }
  const WAVE = wave();

  // ---------- תבניות ----------
  const seekHTML = `
    <div class="fm-seek" data-role="seek" dir="ltr">
      <div class="fm-wave fm-wave-base">${WAVE}</div>
      <div class="fm-wave fm-wave-buf" data-role="buf">${WAVE}</div>
      <div class="fm-wave fm-wave-played" data-role="played">${WAVE}</div>
      <div class="fm-clip" data-role="clip"></div>
      <div class="fm-head" data-role="head"></div>
      <div class="fm-tip" data-role="tip">00:00</div>
    </div>`;

  const mainHTML = `
    <div class="fm-banner" data-role="banner" hidden></div>
    ${seekHTML}
    <div class="fm-times" dir="ltr"><span data-role="cur">00:00</span><span data-role="dur">--:--</span></div>
    <div class="fm-controls">
      <div class="fm-side fm-side-r">
        <div class="fm-pop-wrap">
          <button class="fm-chip fm-speed-chip" data-act="speed-pop" title="מהירות (Shift+&gt; / Shift+&lt;)"><span data-role="rate">1.5x</span></button>
          <div class="fm-pop" data-pop="speed" hidden>
            <div class="fm-pop-title">מהירות השמעה</div>
            <div class="fm-presets">${PRESETS.map(p => `<button data-act="rate" data-v="${p}">${p}x</button>`).join('')}</div>
            <div class="fm-fine" dir="ltr">
              <button class="fm-mini-btn" data-act="rate-step" data-v="-0.05">−</button>
              <input type="range" min="0.5" max="3" step="0.05" data-role="rate-range">
              <button class="fm-mini-btn" data-act="rate-step" data-v="0.05">+</button>
            </div>
          </div>
        </div>
        <div class="fm-pop-wrap">
          <button class="fm-icon-btn" data-act="sleep-pop" title="טיימר שינה">${I.moon}<span class="fm-badge" data-role="sleep-badge" hidden></span></button>
          <div class="fm-pop" data-pop="sleep" hidden>
            <div class="fm-pop-title">טיימר שינה</div>
            <div class="fm-list">
              ${[10, 15, 30, 45, 60].map(m => `<button data-act="sleep" data-v="${m}">${m} דקות</button>`).join('')}
              <button data-act="sleep" data-v="end">בסוף התוכנית</button>
              <button data-act="sleep" data-v="0" class="fm-muted">ביטול</button>
            </div>
          </div>
        </div>
        <div class="fm-pop-wrap">
          <button class="fm-icon-btn" data-act="share-pop" title="שיתוף קטע">${I.share}</button>
          <div class="fm-pop fm-pop-wide" data-pop="share" hidden>
            <div class="fm-pop-title">שיתוף קטע מהתוכנית</div>
            <div class="fm-clip-row">
              <label>מ־<input data-role="clip-a" dir="ltr" placeholder="00:00"></label>
              <button class="fm-mini-btn fm-now" data-act="clip-a" title="הזמן הנוכחי">עכשיו</button>
              <label>עד <input data-role="clip-b" dir="ltr" placeholder="סוף"></label>
              <button class="fm-mini-btn fm-now" data-act="clip-b" title="הזמן הנוכחי">עכשיו</button>
            </div>
            <div class="fm-share-btns">
              <button data-act="share" data-v="wa" class="wa">וואטסאפ</button>
              <button data-act="share" data-v="fb" class="fb">פייסבוק</button>
              <button data-act="share" data-v="x" class="x">X</button>
              <button data-act="share" data-v="copy" class="copy">העתקת קישור</button>
            </div>
            <div class="fm-note">הקישור מתחיל ונעצר בדיוק בקטע אצל מי שמותקן אצלו התוסף. אצל אחרים הוא פותח את התוכנית.</div>
          </div>
        </div>
      </div>

      <div class="fm-transport" dir="ltr">
        <button class="fm-icon-btn sm" data-act="start" title="להתחלה (Home)">${I.start}</button>
        <button class="fm-icon-btn" data-act="skip" data-v="-30" title="30 שניות אחורה (Shift+←)">${I.back(30)}</button>
        <button class="fm-icon-btn" data-act="skip" data-v="-10" title="10 שניות אחורה (←)">${I.back(10)}</button>
        <button class="fm-play" data-act="play" title="השמעה / עצירה (רווח)"><span data-role="play-icon">${I.play}</span></button>
        <button class="fm-icon-btn" data-act="skip" data-v="10" title="10 שניות קדימה (→)">${I.fwd(10)}</button>
        <button class="fm-icon-btn" data-act="skip" data-v="30" title="30 שניות קדימה (Shift+→)">${I.fwd(30)}</button>
        <button class="fm-icon-btn sm" data-act="end" title="לסוף הקטע (End)">${I.end}</button>
      </div>

      <div class="fm-side fm-side-l">
        <div class="fm-vol" dir="ltr">
          <button class="fm-icon-btn" data-act="mute" title="השתקה (M)"><span data-role="vol-icon">${I.vol}</span></button>
          <input type="range" min="0" max="1" step="0.02" value="1" data-role="vol" aria-label="עוצמה">
        </div>
        <button class="fm-icon-btn" data-act="pip" title="נגן צף מעל כל החלונות (P)">${I.pip}</button>
        <button class="fm-icon-btn" data-act="help" title="קיצורי מקלדת (?)">${I.keys}</button>
      </div>
    </div>
    <div class="fm-status" data-role="status"></div>`;

  const miniHTML = `
    <button class="fm-play sm" data-act="play"><span data-role="play-icon">${I.play}</span></button>
    <div class="fm-mini-body">
      <div class="fm-mini-title" data-role="title"></div>
      ${seekHTML}
      <div class="fm-mini-meta" dir="ltr"><span data-role="cur"></span><span data-role="rate"></span><span data-role="dur"></span></div>
    </div>
    <div class="fm-mini-actions" dir="ltr">
      <button class="fm-icon-btn sm" data-act="skip" data-v="-10">${I.back(10)}</button>
      <button class="fm-icon-btn sm" data-act="skip" data-v="10">${I.fwd(10)}</button>
      <button class="fm-icon-btn sm fm-hide-pip" data-act="pip" title="נגן צף">${I.pip}</button>
      <button class="fm-icon-btn sm fm-hide-pip" data-act="mini-close" title="סגירה">${I.close}</button>
    </div>`;

  const helpHTML = `
    <div class="fm-help-card" role="dialog" aria-label="קיצורי מקלדת">
      <div class="fm-pop-title">קיצורי מקלדת</div>
      <dl>
        <dt>רווח</dt><dd>השמעה / עצירה</dd>
        <dt>← / →</dt><dd>10 שניות אחורה / קדימה</dd>
        <dt>Shift + ← / →</dt><dd>30 שניות</dd>
        <dt>Home / End</dt><dd>להתחלה / לסוף</dd>
        <dt>Shift + &gt; / &lt;</dt><dd>מהירות +/− 0.25</dd>
        <dt>M</dt><dd>השתקה</dd>
        <dt>P</dt><dd>נגן צף</dd>
        <dt>?</dt><dd>החלון הזה</dd>
      </dl>
      <button class="fm-chip" data-act="help">סגירה</button>
    </div>`;

  // ---------- מצב ----------
  const roots = new Set();       // כל המופעים של הממשק (ראשי, מיני, חלון צף)
  let main, mini, help, pipWin = null, miniDismissed = false, mainVisible = true;
  let sleep = null;              // {until} או {end:true}
  let clipStop = null;           // עצירה אוטומטית בסוף קטע משותף
  let dragging = null;           // {root, ratio}
  let savedVol = null;

  // ---------- קישור לקטע (#fm=start-end) ----------
  const hashClip = (() => {
    const m = location.hash.match(/fm=([\d:.]+)(?:-([\d:.]+))?/);
    if (!m) return null;
    const a = parseT(m[1]), b = parseT(m[2]);
    return isFinite(a) ? { a, b: isFinite(b) && b > a ? b : null } : null;
  })();
  if (hashClip) window.__fmPendingClip = hashClip;
  document.addEventListener('fm-content-ready', () => {
    const c = window.__fmPendingClip;
    if (!c) return;
    window.__fmPendingClip = null;
    seekTo(c.a, true);
    clipStop = c.b;
    toast('מנגן קטע ' + rng(c.a, c.b));
    setBanner(null);
  });

  function shareUrl(a, b) {
    const base = location.href.replace(/#.*$/, '');
    return `${base}#fm=${Math.floor(a)}${b ? '-' + Math.floor(b) : ''}`;
  }

  // ---------- בנייה ----------
  function mountMain() {
    if (main && document.contains(main)) return;
    const player = $('.content_centerblock.player');
    if (!player || !siteBtn()) return;
    player.classList.add('fm-enhanced');
    $('.fm-bar', player)?.remove(); // הסרגל מגרסה קודמת
    main = document.createElement('div');
    main.className = 'fm-player';
    main.dir = 'rtl';
    main.innerHTML = mainHTML;
    player.appendChild(main);
    wire(main);

    mini = document.createElement('div');
    mini.className = 'fm-miniplayer';
    mini.dir = 'rtl';
    mini.innerHTML = miniHTML;
    document.body.appendChild(mini);
    wire(mini);

    help = document.createElement('div');
    help.className = 'fm-help';
    help.dir = 'rtl';
    help.hidden = true;
    help.innerHTML = helpHTML;
    help.addEventListener('click', e => { if (e.target === help || e.target.closest('[data-act="help"]')) toggleHelp(false); });
    document.body.appendChild(help);

    new IntersectionObserver(([e]) => { mainVisible = e.isIntersecting; update(); }, { threshold: 0 }).observe(main);
    if (hashClip) setBanner(`קטע משותף: ${rng(hashClip.a, hashClip.b)} · לחצו על השמעה`);
    setupMediaSession();
    update();
  }

  function setBanner(text) {
    const b = main && $('[data-role="banner"]', main);
    if (!b) return;
    b.hidden = !text;
    b.textContent = text || '';
  }

  function wire(root) {
    roots.add(root);
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (!b || !root.contains(b)) return;
      e.preventDefault(); e.stopPropagation();
      act(b.dataset.act, b.dataset.v, root);
    });
    const vol = $('[data-role="vol"]', root);
    vol?.addEventListener('input', () => { const a = audio(); if (a) { a.volume = +vol.value; a.muted = false; } update(); });
    const rr = $('[data-role="rate-range"]', root);
    rr?.addEventListener('input', () => setRate(+rr.value));
    root.querySelectorAll('[data-role="clip-a"],[data-role="clip-b"]').forEach(i => i.addEventListener('keydown', e => e.stopPropagation()));

    // גרירה על פס ההתקדמות
    const seek = $('[data-role="seek"]', root);
    const ratioAt = ev => { const r = seek.getBoundingClientRect(); return clamp((ev.clientX - r.left) / r.width, 0, 1); };
    seek.addEventListener('pointermove', ev => {
      const tip = $('[data-role="tip"]', root), r = ratioAt(ev);
      tip.textContent = fmt(r * dur());
      tip.style.left = r * 100 + '%';
      if (dragging?.root === root) { dragging.ratio = r; update(); }
    });
    seek.addEventListener('pointerdown', ev => {
      if (!audio()) { toast('לחצו קודם על השמעה'); return; }
      seek.setPointerCapture(ev.pointerId);
      dragging = { root, ratio: ratioAt(ev) };
      root.classList.add('fm-dragging');
      update();
    });
    const end = () => {
      if (dragging?.root !== root) return;
      seekTo(dragging.ratio * dur(), true);
      dragging = null;
      root.classList.remove('fm-dragging');
    };
    seek.addEventListener('pointerup', end);
    seek.addEventListener('pointercancel', end);
  }

  function closePops(root, except) {
    (root.ownerDocument || document).querySelectorAll('.fm-pop').forEach(p => { if (p !== except) p.hidden = true; });
  }
  function togglePop(root, name) {
    const p = $(`[data-pop="${name}"]`, root);
    closePops(root, p);
    p.hidden = !p.hidden;
    if (name === 'share' && !p.hidden) {
      const ia = $('[data-role="clip-a"]', root), ib = $('[data-role="clip-b"]', root);
      if (!ia.value) ia.value = fmt(cur());
      if (!ib.value) ib.value = '';
    }
  }

  function act(a, v, root) {
    switch (a) {
      case 'play': togglePlay(); break;
      case 'skip': skip(+v); break;
      case 'start': seekTo(0); toast('להתחלה'); break;
      case 'end': seekTo(dur() - 1); toast('לסוף'); break;
      case 'speed-pop': togglePop(root, 'speed'); break;
      case 'rate': setRate(+v); break;
      case 'rate-step': setRate(rate() + +v); break;
      case 'mute': {
        const au = audio();
        if (au) { au.muted = !au.muted; toast(au.muted ? 'מושתק' : 'קול פעיל'); }
        break;
      }
      case 'sleep-pop': togglePop(root, 'sleep'); break;
      case 'sleep':
        if (v === '0') { sleep = null; toast('טיימר שינה בוטל'); }
        else if (v === 'end') { sleep = { end: true }; toast('ייעצר בסוף התוכנית'); }
        else { sleep = { until: Date.now() + v * 60000 }; toast(`ייעצר בעוד ${v} דקות`); }
        closePops(root);
        break;
      case 'share-pop': togglePop(root, 'share'); break;
      case 'clip-a': $('[data-role="clip-a"]', root).value = fmt(cur()); break;
      case 'clip-b': $('[data-role="clip-b"]', root).value = fmt(cur()); break;
      case 'share': share(v, root); break;
      case 'pip': openPip(); break;
      case 'mini-close': miniDismissed = true; break;
      case 'help': toggleHelp(); break;
    }
    update();
  }

  async function share(kind, root) {
    const ta = parseT($('[data-role="clip-a"]', root).value.trim()) || 0;
    const tb = parseT($('[data-role="clip-b"]', root).value.trim());
    const b = isFinite(tb) && tb > ta ? tb : null;
    const url = shareUrl(ta, b);
    const range = rng(ta, b);
    const text = `🎧 "${title()}" — האזינו לקטע ${range}`;
    const enc = encodeURIComponent;
    const links = {
      wa: `https://wa.me/?text=${enc(text + '\n' + url)}`,
      fb: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      x: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`
    };
    if (kind === 'copy') {
      try { await navigator.clipboard.writeText(url); toast('הקישור הועתק'); }
      catch { prompt('העתיקו את הקישור:', url); }
    } else {
      window.open(links[kind], '_blank', 'noopener,width=620,height=560');
    }
  }

  function toggleHelp(force) {
    if (!help) return;
    help.hidden = force === undefined ? !help.hidden : !force;
  }

  // ---------- נגן צף (Document Picture-in-Picture) ----------
  async function openPip() {
    if (pipWin) { pipWin.focus(); return; }
    if (!('documentPictureInPicture' in window)) { toast('הדפדפן לא תומך בנגן צף'); return; }
    try {
      pipWin = await documentPictureInPicture.requestWindow({ width: 420, height: 132 });
    } catch { toast('לא ניתן לפתוח נגן צף'); return; }
    const d = pipWin.document;
    d.documentElement.dir = 'rtl';
    d.title = title();
    const link = d.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;800&display=swap';
    d.head.appendChild(link);
    adopt(d, pipWin);
    d.body.className = 'fm-pip-body';
    const box = d.createElement('div');
    box.className = 'fm-miniplayer fm-in-pip';
    box.dir = 'rtl';
    box.innerHTML = miniHTML;
    d.body.appendChild(box);
    wire(box);
    d.addEventListener('keydown', onKey, true);
    pipWin.addEventListener('pagehide', () => { roots.delete(box); pipWin = null; update(); });
    update();
  }

  // ---------- עדכון הממשק ----------
  function update() {
    const a = audio(), ad = FM()?.ad();
    const d = dur(), c = dragging ? dragging.ratio * d : cur();
    const p = d ? clamp(c / d, 0, 1) : 0;
    const r = rate();
    const isPlay = playing();
    let buf = 0;
    if (a && a.buffered.length && d) buf = a.buffered.end(a.buffered.length - 1) / d;
    const left = d ? (d - c) / r : NaN;
    const endAt = isFinite(left) ? new Date(Date.now() + left * 1000).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '';

    for (const root of roots) {
      const q = s => root.querySelectorAll(`[data-role="${s}"]`);
      q('played').forEach(e => e.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`);
      q('buf').forEach(e => e.style.clipPath = `inset(0 ${100 - buf * 100}% 0 0)`);
      q('head').forEach(e => e.style.left = p * 100 + '%');
      q('cur').forEach(e => e.textContent = fmt(c));
      q('dur').forEach(e => e.textContent = fmt(d));
      q('rate').forEach(e => e.textContent = r + 'x');
      q('title').forEach(e => e.textContent = title());
      q('play-icon').forEach(e => { const want = isPlay ? 'pause' : 'play'; if (e.dataset.state !== want) { e.innerHTML = I[want]; e.dataset.state = want; } });
      q('rate-range').forEach(e => { if (root.ownerDocument.activeElement !== e) e.value = r; });
      q('vol').forEach(e => { if (a && root.ownerDocument.activeElement !== e) e.value = a.muted ? 0 : a.volume; });
      q('vol-icon').forEach(e => { const want = a && (a.muted || a.volume === 0) ? 'mute' : 'vol'; if (e.dataset.state !== want) { e.innerHTML = I[want]; e.dataset.state = want; } });
      q('sleep-badge').forEach(e => {
        e.hidden = !sleep;
        e.textContent = sleep?.end ? 'סוף' : sleep ? Math.ceil((sleep.until - Date.now()) / 60000) + '′' : '';
      });
      q('clip').forEach(e => {
        const c2 = clipStop && d ? clipStop : null;
        e.hidden = !c2;
        if (c2) { const s = (c2 - (hashClip?.a || 0)); e.style.left = ((hashClip?.a || 0) / d * 100) + '%'; e.style.width = (s / d * 100) + '%'; }
      });
      root.querySelectorAll('[data-act="rate"]').forEach(b => b.classList.toggle('on', +b.dataset.v === r));
      root.classList.toggle('fm-ad', !!ad);
      root.classList.toggle('fm-is-playing', !!isPlay);
      q('status').forEach(e => {
        e.innerHTML = ad ? '<span class="fm-ad-pill">פרסומת</span> התוכנית תתחיל מיד אחריה'
          : isFinite(left) && a ? `נותרו <b>${fmt(left)}</b> במהירות ${r}x <span class="fm-dot">•</span> מסתיים ב־${endAt}` + (sleep ? ` <span class="fm-dot">•</span> טיימר שינה פעיל` : '')
          : 'לחצו על השמעה כדי להתחיל';
      });
    }
    if (mini) mini.classList.toggle('show', !mainVisible && !!isPlay && !pipWin && !miniDismissed);
    if (mainVisible) miniDismissed = false;
    updateMediaSession(c, d, r, isPlay);
  }

  // ---------- טיימר שינה ועצירה בסוף קטע ----------
  function tick() {
    const a = audio();
    if (a && !a.paused) {
      if (clipStop && a.currentTime >= clipStop) { clipStop = null; pause(); toast('סוף הקטע'); }
      if (sleep?.until) {
        const ms = sleep.until - Date.now();
        if (ms <= 10000 && ms > 0) { if (savedVol == null) savedVol = a.volume; a.volume = savedVol * ms / 10000; }
        if (ms <= 0) { pause(); a.volume = savedVol ?? a.volume; savedVol = null; sleep = null; toast('טיימר שינה: נעצר'); }
      }
    }
    if (sleep?.end && a && a.ended) sleep = null;
    update();
  }

  // ---------- מקשי מדיה + הפקדים של כרום ----------
  function setupMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    const art = document.querySelector('meta[property="og:image"]')?.content;
    try {
      ms.metadata = new MediaMetadata({ title: title(), artist: '103FM', album: document.title, artwork: art ? [{ src: art, sizes: '512x512' }] : [] });
    } catch {}
    const h = (n, f) => { try { ms.setActionHandler(n, f); } catch {} };
    h('play', () => { if (!playing()) togglePlay(); });
    h('pause', () => pause());
    h('seekbackward', e => skip(-(e.seekOffset || 10)));
    h('seekforward', e => skip(e.seekOffset || 10));
    h('seekto', e => seekTo(e.seekTime, true));
    h('previoustrack', () => seekTo(0, true));
    h('nexttrack', () => seekTo(dur() - 1, true));
  }
  let msLast = 0;
  function updateMediaSession(c, d, r, isPlay) {
    if (!('mediaSession' in navigator) || !audio() || Date.now() - msLast < 1000) return;
    msLast = Date.now();
    try {
      navigator.mediaSession.playbackState = isPlay ? 'playing' : 'paused';
      if (isFinite(d) && d > 0) navigator.mediaSession.setPositionState({ duration: d, position: clamp(c, 0, d), playbackRate: r });
    } catch {}
  }

  // ---------- מקלדת ----------
  function onKey(e) {
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && t.type !== 'range')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!main) return;
    let ok = true;
    if (e.key === 'Escape') { toggleHelp(false); roots.forEach(r => closePops(r)); }
    else if (e.code === 'Space') togglePlay();
    else if (e.key === 'ArrowRight') skip(e.shiftKey ? 30 : 10);
    else if (e.key === 'ArrowLeft') skip(e.shiftKey ? -30 : -10);
    else if (e.key === 'Home') { seekTo(0); toast('להתחלה'); }
    else if (e.key === 'End') { seekTo(dur() - 1); toast('לסוף'); }
    else if (e.shiftKey && (e.key === '>' || e.code === 'Period')) setRate(rate() + 0.25);
    else if (e.shiftKey && (e.key === '<' || e.code === 'Comma')) setRate(rate() - 0.25);
    else if (e.code === 'KeyM') act('mute');
    else if (e.code === 'KeyP') openPip();
    else if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) toggleHelp();
    else ok = false;
    if (ok) { e.preventDefault(); e.stopPropagation(); update(); }
  }
  document.addEventListener('keydown', onKey, true);
  document.addEventListener('click', e => { if (!e.target.closest?.('.fm-pop-wrap')) roots.forEach(r => closePops(r)); });

  // ---------- הודעה קופצת ----------
  let toastEl, toastT;
  document.addEventListener('fm-toast', e => {
    if (!document.body) return;
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'fm-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = e.detail;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 1300);
  });

  // ---------- עיצוב ----------
  function adopt(doc, win) {
    try {
      const sheet = new win.CSSStyleSheet();
      sheet.replaceSync(CSS);
      doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, sheet];
    } catch {
      const s = doc.createElement('style'); s.textContent = CSS; doc.head.appendChild(s);
    }
  }

  const CSS = `
  :root{--fm-red:#e8344e;--fm-red2:#c7192f;--fm-ink:#1d1d24;--fm-sub:#6b6b78;--fm-line:rgba(20,20,40,.09);--fm-chip:#f2f2f6;--fm-chip2:#e7e7ee}
  .fm-enhanced>.mouthjs-playbutton,.fm-enhanced>.mouthjs-progress,.fm-enhanced>.mouthjs-duration,.fm-enhanced>.mouthjs-mutebutton,.fm-enhanced>.mouthjs-volumebar{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;margin:0!important}
  .fm-player,.fm-miniplayer,.fm-help,.fm-toast{font-family:Heebo,Arial,sans-serif;color:var(--fm-ink);-webkit-font-smoothing:antialiased}
  .fm-player *,.fm-miniplayer *,.fm-help *{box-sizing:border-box}
  .fm-player [hidden],.fm-miniplayer [hidden]{display:none!important}
  .fm-player button,.fm-miniplayer button,.fm-help button{font:inherit;border:0;margin:0;cursor:pointer;background:none;color:inherit;line-height:1}
  .fm-player{position:relative;margin:8px 0 18px;padding:22px 24px 16px;background:#fff;border-radius:22px;border:1px solid var(--fm-line);box-shadow:0 10px 40px rgba(20,20,60,.08),0 2px 6px rgba(20,20,60,.04)}
  .fm-banner{margin:-6px 0 14px;padding:9px 14px;border-radius:12px;background:#fff3f5;color:var(--fm-red2);font-weight:600;font-size:14px;text-align:center}
  .fm-seek{position:relative;height:56px;cursor:pointer;touch-action:none;user-select:none}
  .fm-wave{position:absolute;inset:0;pointer-events:none}
  .fm-wave svg{width:100%;height:100%;display:block}
  .fm-wave-base svg{fill:#e3e3ea}.fm-wave-buf svg{fill:#cfcfd9}.fm-wave-played svg{fill:var(--fm-red)}
  .fm-clip{position:absolute;top:-4px;bottom:-4px;border-radius:8px;background:rgba(232,52,78,.12);outline:2px dashed rgba(232,52,78,.5);pointer-events:none}
  .fm-head{position:absolute;top:-6px;bottom:-6px;width:3px;margin-left:-1.5px;border-radius:3px;background:var(--fm-ink);box-shadow:0 0 0 3px #fff;opacity:0;transition:opacity .15s}
  .fm-seek:hover .fm-head,.fm-dragging .fm-head{opacity:1}
  .fm-tip{position:absolute;top:-34px;transform:translateX(-50%);padding:5px 9px;border-radius:8px;background:var(--fm-ink);color:#fff;font-size:12px;font-weight:600;white-space:nowrap;opacity:0;transition:opacity .12s;pointer-events:none}
  .fm-seek:hover .fm-tip{opacity:1}
  .fm-times{display:flex;justify-content:space-between;margin-top:6px;font-size:13px;font-weight:600;color:var(--fm-sub);font-variant-numeric:tabular-nums}
  .fm-controls{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;margin-top:10px}
  .fm-side{display:flex;align-items:center;gap:6px}.fm-side-l{justify-content:flex-end}
  .fm-transport{display:flex;align-items:center;gap:6px}
  .fm-play{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,var(--fm-red),var(--fm-red2))!important;color:#fff!important;box-shadow:0 8px 22px rgba(232,52,78,.38);transition:transform .15s,box-shadow .15s;margin:0 6px!important}
  .fm-play:hover{transform:scale(1.06);box-shadow:0 10px 28px rgba(232,52,78,.48)}.fm-play:active{transform:scale(.96)}
  .fm-play svg{width:28px;height:28px;fill:currentColor}
  .fm-play.sm{width:46px;height:46px;margin:0!important}.fm-play.sm svg{width:21px;height:21px}
  .fm-icon-btn{position:relative;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;color:#3a3a46;transition:background .15s,color .15s,transform .1s}
  .fm-icon-btn:hover{background:var(--fm-chip);color:var(--fm-red2)}.fm-icon-btn:active{transform:scale(.92)}
  .fm-icon-btn svg{width:26px;height:26px;fill:currentColor}.fm-icon-btn.sm{width:36px;height:36px}.fm-icon-btn.sm svg{width:22px;height:22px}
  .fm-icon-btn svg text{font:800 6.4px Heebo,Arial,sans-serif;fill:currentColor}
  .fm-chip{height:36px;padding:0 14px;border-radius:999px;background:var(--fm-chip)!important;font-weight:800!important;font-size:14px;color:var(--fm-red2)!important;transition:background .15s}
  .fm-chip:hover{background:var(--fm-chip2)!important}
  .fm-badge{position:absolute;top:-2px;left:-4px;min-width:20px;height:18px;padding:0 5px;border-radius:9px;background:var(--fm-red);color:#fff;font-size:10px;font-weight:800;display:grid;place-items:center}
  .fm-vol{display:flex;align-items:center;gap:2px}
  .fm-player input[type=range],.fm-help input[type=range]{-webkit-appearance:none;appearance:none;width:96px;height:4px;border-radius:4px;background:#e3e3ea;outline:none;cursor:pointer;margin:0 4px}
  .fm-player input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--fm-red);box-shadow:0 1px 4px rgba(0,0,0,.25)}
  .fm-status{margin-top:12px;padding-top:12px;border-top:1px solid var(--fm-line);text-align:center;font-size:13px;color:var(--fm-sub)}
  .fm-status b{color:var(--fm-ink);font-variant-numeric:tabular-nums}.fm-dot{margin:0 6px;color:#c4c4cc}
  .fm-ad-pill{display:inline-block;padding:2px 8px;margin-left:6px;border-radius:6px;background:#ffb020;color:#fff;font-weight:800;font-size:11px}
  .fm-ad .fm-seek{opacity:.35;pointer-events:none}
  .fm-pop-wrap{position:relative}
  .fm-pop{position:absolute;top:calc(100% + 10px);right:0;z-index:50;min-width:220px;padding:14px;border-radius:16px;background:#fff;border:1px solid var(--fm-line);box-shadow:0 18px 50px rgba(20,20,60,.18);animation:fm-in .14s ease-out}
  .fm-pop[hidden]{display:none}.fm-pop-wide{width:340px}
  @keyframes fm-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
  .fm-pop-title{font-weight:800;font-size:14px;margin-bottom:10px}
  .fm-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
  .fm-presets button{height:34px;border-radius:10px;background:var(--fm-chip)!important;font-weight:700!important;font-size:13px}
  .fm-presets button:hover{background:var(--fm-chip2)!important}.fm-presets button.on{background:var(--fm-red)!important;color:#fff!important}
  .fm-fine{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:12px}
  .fm-mini-btn{min-width:30px;height:30px;padding:0 8px;border-radius:9px;background:var(--fm-chip)!important;font-weight:800!important}
  .fm-mini-btn:hover{background:var(--fm-chip2)!important}
  .fm-list{display:flex;flex-direction:column;gap:2px}
  .fm-list button{text-align:right;padding:9px 10px;border-radius:9px;font-size:14px}.fm-list button:hover{background:var(--fm-chip)}
  .fm-muted{color:var(--fm-sub)!important}
  .fm-clip-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px;font-weight:600}
  .fm-clip-row input{width:70px;height:32px;padding:0 8px;border:1px solid var(--fm-line);border-radius:9px;font:600 13px Heebo,Arial,sans-serif;text-align:center;margin-inline-start:4px}
  .fm-now{font-size:12px!important}
  .fm-share-btns{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:12px}
  .fm-share-btns button{height:36px;border-radius:10px;color:#fff!important;font-weight:700!important;font-size:13px}
  .fm-share-btns .wa{background:#25d366!important}.fm-share-btns .fb{background:#1877f2!important}.fm-share-btns .x{background:#111!important}.fm-share-btns .copy{background:var(--fm-chip)!important;color:var(--fm-ink)!important}
  .fm-note{margin-top:10px;font-size:11px;line-height:1.5;color:var(--fm-sub)}
  .fm-miniplayer{position:fixed;left:50%;bottom:18px;z-index:2147483600;width:min(560px,calc(100vw - 24px));display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:18px;background:rgba(255,255,255,.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--fm-line);box-shadow:0 14px 40px rgba(20,20,60,.22);transform:translate(-50%,140%);opacity:0;transition:transform .3s cubic-bezier(.2,.8,.2,1),opacity .3s;pointer-events:none}
  .fm-miniplayer.show{transform:translate(-50%,0);opacity:1;pointer-events:auto}
  .fm-mini-body{flex:1;min-width:0}
  .fm-mini-title{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
  .fm-miniplayer .fm-seek{height:22px}.fm-miniplayer .fm-tip{top:-26px}
  .fm-mini-meta{display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:var(--fm-sub);font-variant-numeric:tabular-nums}
  .fm-mini-meta [data-role=rate]{color:var(--fm-red2)}
  .fm-mini-actions{display:flex;align-items:center}
  .fm-pip-body{margin:0;background:#fff;height:100vh;display:flex;align-items:center}
  .fm-miniplayer.fm-in-pip{position:static;transform:none;opacity:1;pointer-events:auto;width:100%;height:100%;border-radius:0;border:0;box-shadow:none;background:#fff}
  .fm-in-pip .fm-hide-pip{display:none}
  .fm-help{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;background:rgba(15,15,25,.45);backdrop-filter:blur(3px)}
  .fm-help[hidden]{display:none}
  .fm-help-card{width:min(380px,calc(100vw - 32px));padding:20px;border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.3)}
  .fm-help dl{display:grid;grid-template-columns:auto 1fr;gap:9px 16px;margin:0 0 16px;font-size:14px}
  .fm-help dt{font-weight:800;direction:ltr;text-align:left;font-family:ui-monospace,Menlo,monospace;font-size:12px;padding:3px 7px;border-radius:7px;background:var(--fm-chip);justify-self:start}
  .fm-help dd{margin:0;align-self:center}
  .fm-toast{position:fixed;left:50%;top:18%;transform:translate(-50%,-6px);padding:10px 20px;border-radius:14px;background:rgba(20,20,30,.86);color:#fff;font-weight:800;font-size:18px;z-index:2147483647;opacity:0;transition:opacity .18s,transform .18s;pointer-events:none;direction:rtl;backdrop-filter:blur(6px)}
  .fm-toast.show{opacity:1;transform:translate(-50%,0)}
  @media (max-width:760px){
    .fm-player{padding:16px 14px 12px;border-radius:18px}
    .fm-controls{grid-template-columns:1fr 1fr;grid-template-areas:"t t" "r l"}
    .fm-transport{grid-area:t;justify-content:center}.fm-side-r{grid-area:r}.fm-side-l{grid-area:l}
    .fm-vol input{display:none}.fm-play{width:56px;height:56px}
    .fm-transport .sm{display:none}
    .fm-pop-wide{width:calc(100vw - 40px)}
  }`;

  adopt(document, window);
  new MutationObserver(mountMain).observe(document, { childList: true, subtree: true });
  mountMain();
  setInterval(tick, 250);
})();
