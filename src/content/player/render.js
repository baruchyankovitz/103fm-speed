import { getDockHost, getMain } from './mount.js';
import { isPipOpen } from './pip.js';
import { renderMini } from './mini-player.js';
import { updateMediaSession } from './media-session.js';
import { renderRoot } from './render-root.js';
import { reserveSpace } from './reserve-space.js';
import { uiRoots } from './roots.js';
import { takeSnapshot } from './snapshot.js';
import { queryAll } from './dom.js';
import { site } from '../sites.js';

// Renders the current state into every UI instance and the page around it

// Where the site has no inline player, the main player shows only while there is something to control
function renderMainVisibility({ audio, ad }) {
  const main = getMain();
  if (site.inline || !main) return;
  const wasHidden = main.hidden;
  main.hidden = !audio && !ad; // On a live broadcast the site's player stays
  if (site.bar && wasHidden !== main.hidden) reserveSpace(main);
}

function renderDocking() {
  const main = getMain();
  getDockHost()?.classList.toggle('fm-docked', !!main && !main.hidden);
  if (!site.hide) return;
  queryAll(site.hide).forEach(el => {
    if (main && !main.hidden) el.style.setProperty('display', 'none', 'important');
    else el.style.removeProperty('display');
  });
}

/** Renders the whole UI from the current playback state. */
export function render() {
  const snapshot = takeSnapshot();
  uiRoots.forEach(root => renderRoot(root, snapshot));
  renderMainVisibility(snapshot);
  renderDocking();
  renderMini(snapshot.playing, isPipOpen());
  updateMediaSession(snapshot);
}
