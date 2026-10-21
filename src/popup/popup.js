import { DEFAULT_SPEED, POPUP_SPEEDS, STORAGE_KEY } from '../shared/constants.js';

const speedGrid = document.getElementById('g');

function createSpeedButton(speed, selectedSpeed) {
  const button = document.createElement('button');
  button.textContent = speed + 'x';
  if (speed === selectedSpeed) button.className = 'on';
  button.onclick = () => {
    chrome.storage.sync.set({ [STORAGE_KEY]: speed });
    speedGrid.querySelectorAll('button').forEach(other => (other.className = ''));
    button.className = 'on';
  };
  return button;
}

chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_SPEED }, saved => {
  POPUP_SPEEDS.forEach(speed => speedGrid.appendChild(createSpeedButton(speed, saved[STORAGE_KEY])));
});
