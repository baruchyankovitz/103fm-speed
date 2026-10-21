import { getDragRatio } from './seek-bar.js';
import { currentAudio, currentRate, currentTime, duration, isPlaying, pausedAd, playingAd } from './now-playing.js';
import { clamp } from '../../shared/math.js';

const END_CLOCK_FORMAT = { hour: '2-digit', minute: '2-digit' };

function bufferedRatio(audio, total) {
  return audio && audio.buffered.length && total ? audio.buffered.end(audio.buffered.length - 1) / total : 0;
}

function endClockText(secondsLeft) {
  if (!isFinite(secondsLeft)) return '';
  return new Date(Date.now() + secondsLeft * 1000).toLocaleTimeString('he-IL', END_CLOCK_FORMAT);
}

/** Reads everything the renderers need, once per render. */
export function takeSnapshot() {
  const audio = currentAudio();
  const total = duration();
  const dragRatio = getDragRatio();
  const time = dragRatio !== null ? dragRatio * total : currentTime();
  const rate = currentRate();
  const secondsLeft = total ? (total - time) / rate : NaN;
  return {
    audio,
    ad: playingAd(),
    pausedAd: pausedAd(),
    time,
    total,
    rate,
    secondsLeft,
    progress: total ? clamp(time / total, 0, 1) : 0,
    buffered: bufferedRatio(audio, total),
    playing: isPlaying(),
    endClock: endClockText(secondsLeft)
  };
}
