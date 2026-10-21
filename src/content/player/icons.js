// SVG icons and the decorative waveform
export const ICONS = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause:
    '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
  start:
    '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="2.4" height="14" rx="1"/><path d="M19 6.2v11.6a.8.8 0 0 1-1.25.66L9.4 12.66a.8.8 0 0 1 0-1.32l8.35-5.8A.8.8 0 0 1 19 6.2z"/></svg>',
  end: '<svg viewBox="0 0 24 24"><rect x="16.6" y="5" width="2.4" height="14" rx="1"/><path d="M5 6.2v11.6a.8.8 0 0 0 1.25.66l8.35-5.8a.8.8 0 0 0 0-1.32L6.25 5.54A.8.8 0 0 0 5 6.2z"/></svg>',
  back: seconds =>
    `<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/><text x="12" y="16.3" text-anchor="middle">${seconds}</text></svg>`,
  fwd: seconds =>
    `<svg viewBox="0 0 24 24"><path d="M12 5V2l5 4-5 4V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z"/><text x="12" y="16.3" text-anchor="middle">${seconds}</text></svg>`,
  vol: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5a1 1 0 0 0 1 1h3l4.3 3.6a.8.8 0 0 0 1.3-.6V5.5a.8.8 0 0 0-1.3-.6L8 8.5H5a1 1 0 0 0-1 1z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M18.8 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5a1 1 0 0 0 1 1h3l4.3 3.6a.8.8 0 0 0 1.3-.6V5.5a.8.8 0 0 0-1.3-.6L8 8.5H5a1 1 0 0 0-1 1z"/><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  share:
    '<svg viewBox="0 0 24 24"><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" stroke="currentColor" stroke-width="1.8"/></svg>',
  pip: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="11.5" y="11" width="7.5" height="6" rx="1.2"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="M6 9.5l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close:
    '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  keys: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6 10h1.5M9.5 10H11M13 10h1.5M16.5 10H18M8 14h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};

// Decorative waveform (constant for every show)
const WAVE_BARS = 140;
const BAR_STEP = 4;

function createWaveform(bars = WAVE_BARS) {
  let seed = [...(location.pathname + location.search)].reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    7
  );
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  let rects = '';
  for (let i = 0; i < bars; i++) {
    const height = 18 + Math.round((Math.sin(i / 5) * 0.25 + 0.75) * random() * 72);
    rects += `<rect x="${i * BAR_STEP + 0.6}" y="${50 - height / 2}" width="2.2" height="${height}" rx="1.1"/>`;
  }
  return `<svg viewBox="0 0 ${bars * BAR_STEP} 100" preserveAspectRatio="none">${rects}</svg>`;
}
export const WAVEFORM = createWaveform();
