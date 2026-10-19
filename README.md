# Radio Speed — מאיץ רדיו: מהירות השמעה ל־103FM, גלצ וכאן

Chrome extension that adds playback speed control and a modern player to recorded shows on Israeli radio sites: 103FM (maariv.co.il), Galei Tzahal (glz.co.il) and Kan (kan.org.il).

תוסף כרום שמאפשר להאזין לתוכניות המוקלטות של 103FM, גלי צה״ל וכאן במהירות מותאמת, עם נגן מודרני, טיימר שינה, נגן צף ושיתוף קטעים.

## Supported sites

| Site         | How the player appears                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 103FM        | Replaces the site's player inside the page                                                                                    |
| Galei Tzahal | Built into the site's sticky top bar                                                                                          |
| Kan          | Replaces the site's bottom bar with a resizable bar (full / slim) that reserves its own space so page content is never hidden |

Live broadcasts keep the site's own player. Sites are configured in the `SITES` table at the top of `src/content/content.js`.

## Features

- **Playback speed** from 0.5x to 3x: presets plus fine 0.05 steps, remembered across sessions
- **Remaining time** recalculated for the current speed, plus the clock time the show will end
- **Waveform seek bar** with drag and hover preview; skip 10s / 30s, jump to start or end
- **Resume where you stopped**: the position of the last 50 episodes is saved locally
- **Sleep timer**: 10–60 minutes or end of show, with a 10-second fade-out
- **Share a clip**: links of the form `#fm=start-end` start and stop at the exact clip for anyone with the extension (WhatsApp, Facebook, X, copy link)
- **Floating player** (Document Picture-in-Picture) and a mini player that appears when you scroll away
- **Media keys**: works with hardware media keys and Chrome's media controls (Media Session API)
- **Ads stay at normal speed**: the ad player is detected and left alone

### Keyboard shortcuts

| Key           | Action                    |
| ------------- | ------------------------- |
| Space         | Play / pause              |
| ← / →         | 10 seconds back / forward |
| Shift + ← / → | 30 seconds                |
| Home / End    | Start / end               |
| Shift + > / < | Speed +/− 0.25            |
| M             | Mute                      |
| P             | Floating player           |
| ?             | Shortcut help             |

## How it works

The 103FM player creates its `<audio>` element with `new Audio()` and never attaches it to the DOM, so a normal content script cannot find it. The extension runs in two worlds:

- **`src/content/content.js` + `src/content/player.js` (page world, `"world": "MAIN"`)**: patch `HTMLMediaElement.prototype.play` to catch every audio element, keep re-applying the chosen speed when the site resets it, and render the custom player.
- **`src/content/bridge.js` (isolated world)**: the only part with access to `chrome.storage`. It passes the saved speed to the page through a `data-fm-speed` attribute on `<html>` and stores changes coming back from the player via a `CustomEvent`.
- **`src/background/background.js`**: shows the current speed as a badge on the extension icon.

No data leaves the browser: settings live in `chrome.storage.sync`, playback positions in the site's `localStorage`.

## Project layout

```
manifest.json
src/background/   service worker (icon badge)
src/content/      content scripts (content, bridge, player)
src/popup/        popup UI
icons/            extension icons
docs/             store listing and screenshots
```

Development: `npm install`, then `npm run lint`, `npm run format:check`, `npm run zip` (builds `../103fm-speed-v<version>.zip`).

## Install (developer mode)

1. Download or clone this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the repository folder (the one containing `manifest.json`).
4. Open any recorded show on 103FM, Galei Tzahal or Kan.

## Version history

Each version is a commit with a matching tag (`git checkout v1.2` to try an older one).

| Version | What changed                                                                                              |
| ------- | --------------------------------------------------------------------------------------------------------- |
| v1.0    | Speed presets in the popup, default 1.5x                                                                  |
| v1.1    | Keyboard shortcuts, resume position, speed button in the player, icon badge                               |
| v1.2    | Control bar under the player with skip buttons and speed-adjusted remaining time                          |
| v1.3    | Skip step changed from 15s to 10s                                                                         |
| v2.0    | Full replacement player: waveform, sleep timer, clip sharing, floating player, media keys                 |
| v3.0    | Multi-site: Galei Tzahal (built into the top bar) and Kan (own resizable bottom bar replacing the site's) |
| v3.1    | The play button pauses and resumes ads on 103FM                                                           |
| v3.2    | Detect IMA video ads (`#ima-container`) so ads can actually be paused and are never sped up               |
| v3.3    | Renamed to "מאיץ רדיו – מהירות השמעה ל־103FM, גלצ וכאן"; store listing texts in `STORE_LISTING.md`        |
| v3.4    | Homepage and the popup credit link point to the portfolio site                                            |
| v3.5    | Project conventions: src/ icons/ docs/ layout, ESLint + Prettier, English code comments, MIT license      |

## Author

Baruch Yankovitz — [Portfolio](https://portfolio-upgrade-xi.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/baruch-yankovitz) · [GitHub](https://github.com/baruchyankovitz)

## License

[MIT](LICENSE) © 2026 Baruch Yankovitz
