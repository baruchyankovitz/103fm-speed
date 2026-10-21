import { PLAYER_PRESETS, MIN_SPEED, MAX_SPEED } from '../../shared/constants.js';
import { RATE_FINE_STEP, SLEEP_OPTIONS_MIN } from './config.js';
import { ICONS, WAVEFORM } from './icons.js';

// Player markup

const seekHTML = `
  <div class="fm-seek" data-role="seek" dir="ltr">
    <div class="fm-wave fm-wave-base">${WAVEFORM}</div>
    <div class="fm-wave fm-wave-buf" data-role="buf">${WAVEFORM}</div>
    <div class="fm-wave fm-wave-played" data-role="played">${WAVEFORM}</div>
    <div class="fm-clip" data-role="clip"></div>
    <div class="fm-head" data-role="head"></div>
    <div class="fm-tip" data-role="tip">00:00</div>
  </div>`;

export const mainHTML = `
  <div class="fm-float-head">
    <button class="fm-play sm fm-head-play" data-act="play" title="השמעה / עצירה (רווח)"><span data-role="play-icon">${ICONS.play}</span></button>
    <div class="fm-float-title" data-role="title"></div>
    <span class="fm-head-rate" data-role="rate">1.5x</span>
    <button class="fm-icon-btn sm fm-x" data-act="collapse" title="מזעור">${ICONS.close}</button>
    <button class="fm-icon-btn sm fm-chev" data-act="collapse" title="הקטנה / הגדלה">${ICONS.chev}</button>
  </div>
  <button class="fm-pill" data-act="collapse" title="הצגת הנגן" dir="ltr"><span data-role="play-icon">${ICONS.play}</span><span data-role="rate">1.5x</span></button>
  <div class="fm-banner" data-role="banner" hidden></div>
  ${seekHTML}
  <div class="fm-times" dir="ltr"><span data-role="cur">00:00</span><span data-role="dur">--:--</span></div>
  <div class="fm-controls">
    <div class="fm-side fm-side-r">
      <div class="fm-pop-wrap">
        <button class="fm-chip fm-speed-chip" data-act="speed-pop" title="מהירות (Shift+&gt; / Shift+&lt;)"><span data-role="rate">1.5x</span></button>
        <div class="fm-pop" data-pop="speed" hidden>
          <div class="fm-pop-title">מהירות השמעה</div>
          <div class="fm-presets">${PLAYER_PRESETS.map(preset => `<button data-act="rate" data-v="${preset}">${preset}x</button>`).join('')}</div>
          <div class="fm-fine" dir="ltr">
            <button class="fm-mini-btn" data-act="rate-step" data-v="-${RATE_FINE_STEP}">−</button>
            <input type="range" min="${MIN_SPEED}" max="${MAX_SPEED}" step="${RATE_FINE_STEP}" data-role="rate-range">
            <button class="fm-mini-btn" data-act="rate-step" data-v="${RATE_FINE_STEP}">+</button>
          </div>
        </div>
      </div>
      <div class="fm-pop-wrap">
        <button class="fm-icon-btn" data-act="sleep-pop" title="טיימר שינה">${ICONS.moon}<span class="fm-badge" data-role="sleep-badge" hidden></span></button>
        <div class="fm-pop" data-pop="sleep" hidden>
          <div class="fm-pop-title">טיימר שינה</div>
          <div class="fm-list">
            ${SLEEP_OPTIONS_MIN.map(minutes => `<button data-act="sleep" data-v="${minutes}">${minutes} דקות</button>`).join('')}
            <button data-act="sleep" data-v="end">בסוף התוכנית</button>
            <button data-act="sleep" data-v="0" class="fm-muted">ביטול</button>
          </div>
        </div>
      </div>
      <div class="fm-pop-wrap">
        <button class="fm-icon-btn" data-act="share-pop" title="שיתוף קטע">${ICONS.share}</button>
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
      <button class="fm-icon-btn sm" data-act="start" title="להתחלה (Home)">${ICONS.start}</button>
      <button class="fm-icon-btn" data-act="skip" data-v="-30" title="30 שניות אחורה (Shift+←)">${ICONS.back(30)}</button>
      <button class="fm-icon-btn" data-act="skip" data-v="-10" title="10 שניות אחורה (←)">${ICONS.back(10)}</button>
      <button class="fm-play" data-act="play" title="השמעה / עצירה (רווח)"><span data-role="play-icon">${ICONS.play}</span></button>
      <button class="fm-icon-btn" data-act="skip" data-v="10" title="10 שניות קדימה (→)">${ICONS.fwd(10)}</button>
      <button class="fm-icon-btn" data-act="skip" data-v="30" title="30 שניות קדימה (Shift+→)">${ICONS.fwd(30)}</button>
      <button class="fm-icon-btn sm" data-act="end" title="לסוף הקטע (End)">${ICONS.end}</button>
    </div>

    <div class="fm-side fm-side-l">
      <div class="fm-vol" dir="ltr">
        <button class="fm-icon-btn" data-act="mute" title="השתקה (M)"><span data-role="vol-icon">${ICONS.vol}</span></button>
        <input type="range" min="0" max="1" step="0.02" value="1" data-role="vol" aria-label="עוצמה">
      </div>
      <button class="fm-icon-btn" data-act="pip" title="נגן צף מעל כל החלונות (P)">${ICONS.pip}</button>
      <button class="fm-icon-btn" data-act="help" title="קיצורי מקלדת (?)">${ICONS.keys}</button>
    </div>
  </div>
  <div class="fm-status" data-role="status"></div>`;

export const miniHTML = `
  <button class="fm-play sm" data-act="play"><span data-role="play-icon">${ICONS.play}</span></button>
  <div class="fm-mini-body">
    <div class="fm-mini-title" data-role="title"></div>
    ${seekHTML}
    <div class="fm-mini-meta" dir="ltr"><span data-role="cur"></span><span data-role="rate"></span><span data-role="dur"></span></div>
  </div>
  <div class="fm-mini-actions" dir="ltr">
    <button class="fm-icon-btn sm" data-act="skip" data-v="-10">${ICONS.back(10)}</button>
    <button class="fm-icon-btn sm" data-act="skip" data-v="10">${ICONS.fwd(10)}</button>
    <button class="fm-icon-btn sm fm-hide-pip" data-act="pip" title="נגן צף">${ICONS.pip}</button>
    <button class="fm-icon-btn sm fm-hide-pip" data-act="mini-close" title="סגירה">${ICONS.close}</button>
  </div>`;

export const helpHTML = `
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
