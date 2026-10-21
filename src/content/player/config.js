// Tuning values and keys of the player UI

export const TICK_MS = 250;
export const TOAST_MS = 1300;
export const MEDIA_SESSION_THROTTLE_MS = 1000;

export const SLEEP_OPTIONS_MIN = [10, 15, 30, 45, 60];
export const SLEEP_FADE_MS = 10000;

/** Size of the Picture-in-Picture window. */
export const PIP_WINDOW_SIZE = { width: 420, height: 132 };
export const PIP_FONT_URL = 'https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;800&display=swap';

/** Seeking never goes closer than this to the very end. */
export const SEEK_END_MARGIN_S = 0.25;
/** "Jump to end" lands this far before the end. */
export const JUMP_END_OFFSET_S = 1;
export const SKIP_SHORT_S = 10;
export const SKIP_LONG_S = 30;

/** Step of the +/- buttons and the slider in the speed popover. */
export const RATE_FINE_STEP = 0.05;
/** Step of the Shift+> / Shift+< keyboard shortcuts. */
export const RATE_KEYBOARD_STEP = 0.25;

/** localStorage keys (also used as the CSS class that is toggled). */
export const PREF_COLLAPSED = 'fm-collapsed';
export const PREF_SLIM = 'fm-slim';
