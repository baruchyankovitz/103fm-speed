// Tuning values of the media hook

/** Google (IMA) ads usually play in a <video> inside their own container. */
export const AD_CONTAINER_SELECTOR = '#ima-container,.ima-ad-container,[id*="ima-ad"]';
export const AD_PLAYER_ID = 'ima-player';

/** Shorter media is treated as a clip/jingle, not as a show. */
export const MIN_CONTENT_DURATION_S = 60;

export const ENFORCE_INTERVAL_MS = 1500;
/** Speed differences below this are ignored when re-applying the rate. */
export const RATE_TOLERANCE = 0.01;

export const POSITIONS_STORAGE_KEY = 'fm-speed-positions';
export const HISTORY_STORAGE_KEY = 'fm-speed-history';
export const SAVED_TIME_STORAGE_KEY = 'fm-speed-saved-seconds';
export const POSITION_SAVE_INTERVAL_MS = 5000;
export const MAX_STORED_POSITIONS = 50;
/** A saved position is resumed only when it is later than this many seconds... */
export const RESUME_MIN_POSITION_S = 15;
/** ...and earlier than this many seconds before the end. */
export const RESUME_END_MARGIN_S = 30;
