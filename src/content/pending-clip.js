// A shared clip link waiting for the show to load (per frame; only the top frame ever sets it)
let pendingClip = null;

/** Remembers the clip that should play once the content is ready. */
export const setPendingClip = clip => {
  pendingClip = clip;
};

/** Returns the pending clip without clearing it. */
export const getPendingClip = () => pendingClip;

/** Returns the pending clip and clears it. */
export function takePendingClip() {
  const clip = pendingClip;
  pendingClip = null;
  return clip;
}
