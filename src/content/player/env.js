// Site settings from the media hook and constants shared by the player

export const $ = (s, r = document) => r.querySelector(s);
export const FM = () => window.__fm;
export const site = FM()?.site || {};
export const floating = !site.inline && !site.dock && !site.bar;
export const PRESETS = [1, 1.25, 1.5, 1.75, 2, 2.5, 3];
