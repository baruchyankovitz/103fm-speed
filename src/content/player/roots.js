// All UI instances (main, mini, floating window) that render the playback state
export const uiRoots = new Set();

/** Adds a UI instance to be rendered. */
export const registerRoot = root => uiRoots.add(root);

/** Stops rendering a UI instance. */
export const unregisterRoot = root => uiRoots.delete(root);
