/** Adds page spacing the height of the bar so it does not cover the content at the bottom. */
export function reserveSpace(main) {
  if (!document.body || !main) return;
  const height = main.hidden ? 0 : main.offsetHeight;
  document.body.style.setProperty('padding-bottom', height ? height + 'px' : '', height ? 'important' : '');
  if (!height) document.body.style.removeProperty('padding-bottom');
}
