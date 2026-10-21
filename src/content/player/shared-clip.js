import { parseClipHash } from './clip-link.js';
import { setPendingClip } from '../pending-clip.js';

// The clip requested by the page address (#fm=start-end), if any
let sharedClip = null;

/** Reads the clip link from the address and marks it pending for the media code. */
export function loadSharedClip() {
  sharedClip = parseClipHash(location.hash);
  if (sharedClip) setPendingClip(sharedClip);
}

/** The clip from the address: { start, end } or null. */
export const getSharedClip = () => sharedClip;
