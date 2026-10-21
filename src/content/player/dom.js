/** First element matching the selector inside root. */
export const query = (selector, root = document) => root.querySelector(selector);

/** All elements matching the selector inside root. */
export const queryAll = (selector, root = document) => root.querySelectorAll(selector);

/** First element with data-role="name" inside root. */
export const byRole = (root, name) => root.querySelector(`[data-role="${name}"]`);

/** All elements with data-role="name" inside root. */
export const allByRole = (root, name) => root.querySelectorAll(`[data-role="${name}"]`);

/** Creates a right-to-left container with the given class and markup. */
export function createRtlBox(className, html) {
  const box = document.createElement('div');
  box.className = className;
  box.dir = 'rtl';
  box.innerHTML = html;
  return box;
}
