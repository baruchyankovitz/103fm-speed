import { requestRender } from './render-scheduler.js';

// Maps data-act names to handlers; filled by initPlayer so UI modules need not import the handlers
let handlers = {};

/** Registers the action handlers: { name: (value, root) => void }. */
export const registerActions = map => {
  handlers = map;
};

/** Runs a UI action by name, then re-renders. */
export function runAction(name, value, root) {
  handlers[name]?.(value, root);
  requestRender();
}
