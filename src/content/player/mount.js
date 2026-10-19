import { $, site, floating } from './env.js';
import { fmt, clamp, store, toast, rng } from './util.js';
import { audio, siteBtn, dur } from './audio.js';
import { setRate, seekTo } from './controls.js';
import { mainHTML, miniHTML, helpHTML } from './templates.js';
import { hashClip } from './clip.js';
import { act, toggleHelp } from './actions.js';
import { update } from './update.js';
import { setupMediaSession } from './media-session.js';
import { state, roots } from './state.js';

// Builds the player into the page

export function mountMain() {
  if (state.main && document.contains(state.main)) return;
  if (state.main) roots.delete(state.main); // The site rebuilt its player, so mount again
  state.main = document.createElement('div');
  state.main.className = 'fm-player';
  state.main.dir = 'rtl';
  state.main.innerHTML = mainHTML;
  state.main.classList.toggle('fm-noshare', site.share === false);
  if (site.dock) {
    // Built into the site's fixed bar and replaces its UI while a recorded show plays
    state.dockHost = $(site.dock);
    if (!state.dockHost) {
      state.main = null;
      return;
    }
    state.main.classList.add('fm-dock');
    state.main.classList.toggle('fm-pop-up', !!site.popUp);
    state.main.hidden = true;
    state.dockHost.appendChild(state.main);
  } else if (site.bar) {
    // Fixed bar at the bottom of the screen that takes up page space instead of covering it
    if (!document.body) {
      state.main = null;
      return;
    }
    state.main.classList.add('fm-dock', 'fm-fixed', 'fm-pop-up');
    state.main.classList.toggle('fm-slim', store('fm-slim') === '1');
    state.main.hidden = true;
    document.body.appendChild(state.main);
    new ResizeObserver(reserveSpace).observe(state.main);
  } else if (floating) {
    // Floating player in the corner, shown only while a recorded show plays
    if (!document.body) {
      state.main = null;
      return;
    }
    state.main.classList.add('fm-float');
    state.main.classList.toggle('fm-collapsed', store('fm-collapsed') === '1');
    state.main.style.setProperty('--fm-bottom', (site.bottom ?? 20) + 'px');
    state.main.hidden = true;
    document.body.appendChild(state.main);
  } else {
    const player = $(site.inline);
    if (!player || !siteBtn()) {
      state.main = null;
      return;
    }
    player.classList.add('fm-enhanced');
    $('.fm-bar', player)?.remove(); // Bar from a previous version
    player.appendChild(state.main);
  }
  wire(state.main);
  // A player built into a fixed bar or floating needs no mini player: it is always on screen
  if (site.inline)
    new IntersectionObserver(
      ([e]) => {
        state.mainVisible = e.isIntersecting;
        update();
      },
      { threshold: 0 }
    ).observe(state.main);
  if (hashClip) setBanner(`קטע משותף: ${rng(hashClip.a, hashClip.b)} · לחצו על השמעה`);
  if (state.mini) {
    update();
    return;
  } // Remount: the mini player and help already exist

  state.mini = document.createElement('div');
  state.mini.className = 'fm-miniplayer';
  state.mini.dir = 'rtl';
  state.mini.innerHTML = miniHTML;
  document.body.appendChild(state.mini);
  wire(state.mini);

  state.help = document.createElement('div');
  state.help.className = 'fm-help';
  state.help.dir = 'rtl';
  state.help.hidden = true;
  state.help.innerHTML = helpHTML;
  state.help.addEventListener('click', e => {
    if (e.target === state.help || e.target.closest('[data-act="help"]')) toggleHelp(false);
  });
  document.body.appendChild(state.help);
  setupMediaSession();
  update();
}

// Adds page spacing the height of the bar so it does not cover the content at the bottom
export function reserveSpace() {
  if (!document.body || !state.main) return;
  const h = state.main.hidden ? 0 : state.main.offsetHeight;
  document.body.style.setProperty('padding-bottom', h ? h + 'px' : '', h ? 'important' : '');
  if (!h) document.body.style.removeProperty('padding-bottom');
}

export function setBanner(text) {
  const b = state.main && $('[data-role="banner"]', state.main);
  if (!b) return;
  b.hidden = !text;
  b.textContent = text || '';
}

export function wire(root) {
  roots.add(root);
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || !root.contains(b)) return;
    e.preventDefault();
    e.stopPropagation();
    act(b.dataset.act, b.dataset.v, root);
  });
  const vol = $('[data-role="vol"]', root);
  vol?.addEventListener('input', () => {
    const a = audio();
    if (a) {
      a.volume = +vol.value;
      a.muted = false;
    }
    update();
  });
  const rr = $('[data-role="rate-range"]', root);
  rr?.addEventListener('input', () => setRate(+rr.value));
  root
    .querySelectorAll('[data-role="clip-a"],[data-role="clip-b"]')
    .forEach(i => i.addEventListener('keydown', e => e.stopPropagation()));

  // Drag on the progress bar
  const seek = $('[data-role="seek"]', root);
  const ratioAt = ev => {
    const r = seek.getBoundingClientRect();
    return clamp((ev.clientX - r.left) / r.width, 0, 1);
  };
  seek.addEventListener('pointermove', ev => {
    const tip = $('[data-role="tip"]', root),
      r = ratioAt(ev);
    tip.textContent = fmt(r * dur());
    tip.style.left = r * 100 + '%';
    if (state.dragging?.root === root) {
      state.dragging.ratio = r;
      update();
    }
  });
  seek.addEventListener('pointerdown', ev => {
    if (!audio()) {
      toast('לחצו קודם על השמעה');
      return;
    }
    seek.setPointerCapture(ev.pointerId);
    state.dragging = { root, ratio: ratioAt(ev) };
    root.classList.add('fm-dragging');
    update();
  });
  const end = () => {
    if (state.dragging?.root !== root) return;
    seekTo(state.dragging.ratio * dur(), true);
    state.dragging = null;
    root.classList.remove('fm-dragging');
  };
  seek.addEventListener('pointerup', end);
  seek.addEventListener('pointercancel', end);
}
