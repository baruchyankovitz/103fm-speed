// Lets low-level modules ask for a re-render without importing the renderer (avoids import cycles)
let renderer = () => {};

/** Sets the function that renders the whole UI. */
export const setRenderer = fn => {
  renderer = fn;
};

/** Re-renders the whole UI now. */
export const requestRender = () => renderer();
