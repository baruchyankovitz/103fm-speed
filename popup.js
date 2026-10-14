const speeds = [1, 1.25, 1.5, 1.75, 2, 2.5];
const g = document.getElementById('g');
chrome.storage.sync.get({ rate: 1.5 }, ({ rate }) => {
  speeds.forEach(s => {
    const b = document.createElement('button');
    b.textContent = s + 'x';
    if (s === rate) b.className = 'on';
    b.onclick = () => {
      chrome.storage.sync.set({ rate: s });
      g.querySelectorAll('button').forEach(x => x.className = '');
      b.className = 'on';
    };
    g.appendChild(b);
  });
});
