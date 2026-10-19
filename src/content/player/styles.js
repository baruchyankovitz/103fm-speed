import CSS from './player.css';

export function adopt(doc, win) {
  try {
    const sheet = new win.CSSStyleSheet();
    sheet.replaceSync(CSS);
    doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, sheet];
  } catch {
    const s = doc.createElement('style');
    s.textContent = CSS;
    doc.head.appendChild(s);
  }
}
