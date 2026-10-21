/** Limits a value to the range [min, max]. */
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
