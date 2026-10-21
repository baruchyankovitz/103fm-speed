import CSS from './player.css';

/** Applies the player stylesheet to a document (a constructed sheet, else a <style> tag). */
export function adoptStyles(doc, win) {
  try {
    const sheet = new win.CSSStyleSheet();
    sheet.replaceSync(CSS);
    doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, sheet];
  } catch {
    const style = doc.createElement('style');
    style.textContent = CSS;
    doc.head.appendChild(style);
  }
}
