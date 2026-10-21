/** Reads a saved preference (undefined when storage is unavailable). */
export function readPref(key) {
  try {
    return localStorage.getItem(key);
  } catch {}
}

/** Saves a preference, ignoring storage errors. */
export function writePref(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
