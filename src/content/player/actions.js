import { $, site } from './env.js';
import { fmt, store, toast } from './util.js';
import { rate, audio, dur, cur } from './audio.js';
import { setRate, togglePlay, seekTo, skip } from './controls.js';
import { share } from './clip.js';
import { openPip } from './pip.js';
import { update } from './update.js';
import { state } from './state.js';

// Button actions and popovers

export function closePops(root, except) {
  (root.ownerDocument || document).querySelectorAll('.fm-pop').forEach(p => {
    if (p !== except) p.hidden = true;
  });
}
function togglePop(root, name) {
  const p = $(`[data-pop="${name}"]`, root);
  closePops(root, p);
  p.hidden = !p.hidden;
  if (name === 'share' && !p.hidden) {
    const ia = $('[data-role="clip-a"]', root),
      ib = $('[data-role="clip-b"]', root);
    if (!ia.value) ia.value = fmt(cur());
    if (!ib.value) ib.value = '';
  }
}

export function act(a, v, root) {
  switch (a) {
    case 'play':
      togglePlay();
      break;
    case 'skip':
      skip(+v);
      break;
    case 'start':
      seekTo(0);
      toast('להתחלה');
      break;
    case 'end':
      seekTo(dur() - 1);
      toast('לסוף');
      break;
    case 'speed-pop':
      togglePop(root, 'speed');
      break;
    case 'rate':
      setRate(+v);
      break;
    case 'rate-step':
      setRate(rate() + +v);
      break;
    case 'mute': {
      const au = audio();
      if (au) {
        au.muted = !au.muted;
        toast(au.muted ? 'מושתק' : 'קול פעיל');
      }
      break;
    }
    case 'sleep-pop':
      togglePop(root, 'sleep');
      break;
    case 'sleep':
      if (v === '0') {
        state.sleep = null;
        toast('טיימר שינה בוטל');
      } else if (v === 'end') {
        state.sleep = { end: true };
        toast('ייעצר בסוף התוכנית');
      } else {
        state.sleep = { until: Date.now() + v * 60000 };
        toast(`ייעצר בעוד ${v} דקות`);
      }
      closePops(root);
      break;
    case 'share-pop':
      togglePop(root, 'share');
      break;
    case 'clip-a':
      $('[data-role="clip-a"]', root).value = fmt(cur());
      break;
    case 'clip-b':
      $('[data-role="clip-b"]', root).value = fmt(cur());
      break;
    case 'share':
      share(v, root);
      break;
    case 'pip':
      openPip();
      break;
    case 'mini-close':
      state.miniDismissed = true;
      break;
    case 'collapse': {
      const cls = site.bar ? 'fm-slim' : 'fm-collapsed';
      const c = state.main.classList.toggle(cls);
      store(cls, c ? '1' : '0');
      closePops(root);
      break;
    }
    case 'help':
      toggleHelp();
      break;
  }
  update();
}

export function toggleHelp(force) {
  if (!state.help) return;
  state.help.hidden = force === undefined ? !state.help.hidden : !force;
}
