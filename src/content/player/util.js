// Formatting and small helpers

export const fmt = s => {
  if (!isFinite(s)) return '--:--';
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${String(m).padStart(2, '0')}:${ss}`;
};
export const parseT = t => {
  // "12:30" / "1:02:03" / "750"
  if (!t) return NaN;
  if (/^\d+(\.\d+)?$/.test(t)) return +t;
  return t.split(':').reduce((a, v) => a * 60 + +v, 0);
};
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const store = (k, v) => {
  try {
    return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v);
  } catch {}
};

export const toast = t => document.dispatchEvent(new CustomEvent('fm-toast', { detail: t }));
export const rng = (a, b) => '\u2066' + fmt(a) + (b ? '–' + fmt(b) : '') + '\u2069'; // Time range that does not flip in RTL text
