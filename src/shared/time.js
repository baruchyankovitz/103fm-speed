const pad2 = n => String(n).padStart(2, '0');

/** Formats seconds as mm:ss or h:mm:ss; "--:--" when not finite. */
export function formatTime(seconds) {
  if (!isFinite(seconds)) return '--:--';
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = pad2(total % 60);
  return hours ? `${hours}:${pad2(minutes)}:${secs}` : `${pad2(minutes)}:${secs}`;
}

/** Formats seconds as m:ss (minutes are not padded and not split into hours). */
export const formatMinutesSeconds = seconds => `${Math.floor(seconds / 60)}:${pad2(Math.floor(seconds % 60))}`;

/** Parses "12:30", "1:02:03" or "750" into seconds; NaN when empty. */
export function parseTime(text) {
  if (!text) return NaN;
  if (/^\d+(\.\d+)?$/.test(text)) return +text;
  return text.split(':').reduce((total, part) => total * 60 + +part, 0);
}

/** Formats a time range that does not flip inside right-to-left text. */
export const formatTimeRange = (start, end) => '⁦' + formatTime(start) + (end ? '–' + formatTime(end) : '') + '⁩';
