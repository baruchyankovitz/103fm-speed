// Page world entry point: the 103FM and Galei Tzahal players create an <audio> that is never attached to the DOM, so we catch it here
import { initMedia } from './media/index.js';
import { initPlayer } from './player/index.js';

initMedia();
// The player lives in the main window only, not in iframes
if (window.top === window) initPlayer();
