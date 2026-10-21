import { query, queryAll } from './dom.js';

/** Hides every popover of the document except one. */
export function closePopovers(root, except) {
  queryAll('.fm-pop', root.ownerDocument || document).forEach(pop => {
    if (pop !== except) pop.hidden = true;
  });
}

/** Toggles the popover with the given name (one open at a time); returns true when it is now open. */
export function togglePopover(root, name) {
  const pop = query(`[data-pop="${name}"]`, root);
  closePopovers(root, pop);
  pop.hidden = !pop.hidden;
  return !pop.hidden;
}
