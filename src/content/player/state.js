// Shared mutable state of the player
export const roots = new Set(); // All UI instances (main, mini, floating window)
export const state = {
  main: undefined,
  mini: undefined,
  help: undefined,
  dockHost: null,
  pipWin: null,
  miniDismissed: false,
  mainVisible: true,
  sleep: null, // {until} or {end:true}
  clipStop: null, // Auto-stop at the end of a shared clip
  dragging: null // {root, ratio}
};
