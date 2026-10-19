let toastEl, toastT;

export function initToast() {
  document.addEventListener('fm-toast', e => {
    if (!document.body) return;
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'fm-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = e.detail;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 1300);
  });
}
