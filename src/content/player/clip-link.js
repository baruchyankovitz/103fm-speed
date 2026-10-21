import { formatTimeRange, parseTime } from '../../shared/time.js';

// Pure helpers for clip links (#fm=start-end) and sharing

/** Parses "#fm=12:30-15:00" into { start, end } (end is null when absent/invalid), or null. */
export function parseClipHash(hash) {
  const match = hash.match(/fm=([\d:.]+)(?:-([\d:.]+))?/);
  if (!match) return null;
  const start = parseTime(match[1]);
  const end = parseTime(match[2]);
  return isFinite(start) ? { start, end: isFinite(end) && end > start ? end : null } : null;
}

/** Turns the text of the two clip fields into { start, end }; end is null when missing or not after start. */
export function readClipRange(startText, endText) {
  const start = parseTime(startText.trim()) || 0;
  const end = parseTime(endText.trim());
  return { start, end: isFinite(end) && end > start ? end : null };
}

/** The page address (without any hash) plus a clip hash. */
export function buildShareUrl(href, start, end) {
  const base = href.replace(/#.*$/, '');
  return `${base}#fm=${Math.floor(start)}${end ? '-' + Math.floor(end) : ''}`;
}

/** The message that goes with a shared clip. */
export const buildShareText = (title, start, end) => `🎧 "${title}" — האזינו לקטע ${formatTimeRange(start, end)}`;

/** Share links per network (wa, fb, x) for a message and a clip URL. */
export function buildShareLinks(text, url) {
  const enc = encodeURIComponent;
  return {
    wa: `https://wa.me/?text=${enc(text + '\n' + url)}`,
    fb: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    x: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`
  };
}
