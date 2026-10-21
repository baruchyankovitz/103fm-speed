import { MIN_SPEED, MAX_SPEED } from './constants.js';
import { clamp } from './math.js';

/** True when the value is a number inside the supported speed range. */
export const isValidSpeed = rate => rate >= MIN_SPEED && rate <= MAX_SPEED;

/** Limits a speed to the supported range and rounds it to two decimals. */
export const normalizeSpeed = rate => Math.round(clamp(rate, MIN_SPEED, MAX_SPEED) * 100) / 100;
