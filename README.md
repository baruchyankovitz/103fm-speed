# Radio Speed — מאיץ רדיו: מהירות השמעה ל־103FM, גלצ וכאן

Chrome extension that adds playback speed control and a modern player to recorded shows on Israeli radio sites: 103FM (maariv.co.il), Galei Tzahal (glz.co.il) and Kan (kan.org.il).

תוסף כרום שמאפשר להאזין לתוכניות המוקלטות של 103FM, גלי צה״ל וכאן במהירות מותאמת, עם נגן מודרני, טיימר שינה, נגן צף ושיתוף קטעים.

## Supported sites

| Site         | How the player appears                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 103FM        | Replaces the site's player inside the page                                                                                    |
| Galei Tzahal | Built into the site's sticky top bar                                                                                          |
| Kan          | Replaces the site's bottom bar with a resizable bar (full / slim) that reserves its own space so page content is never hidden |

Live broadcasts keep the site's own player. Sites are configured in the `SITES` table in `src/content/sites.js`.

## Features

- **Playback speed** from 0.5x to 3x: presets plus fine 0.05 steps, remembered across sessions
- **Remaining time** recalculated for the current speed, plus the clock time the show will end
- **Waveform seek bar** with drag and hover preview; skip 10s / 30s, jump to start or end
- **Resume where you stopped**: the position of the last 50 episodes is saved locally
- **Listening history**: the popup shows the five most recent shows, progress percentage, and a link to reopen a show and resume
- **Time saved**: a conservative estimate of time saved at speeds above 1x, calculated on-device and shown in the popup
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

- **`src/content/main.js` (page world, `"world": "MAIN"`)**: bundled by esbuild into `dist/page.js` and injected into every frame. It calls `initMedia()` (`src/content/media/`), which patches `HTMLMediaElement.prototype.play` to catch every audio element, keeps re-applying the chosen speed when the site resets it, and remembers playback positions. In the top frame only it then calls `initPlayer()` (`src/content/player/`), which renders the custom player and imports the media queries (current audio, ads, rate) directly. Iframes talk to the player through DOM events (`fm-toast`, `fm-content-ready`).
- **`src/content/bridge.js` (isolated world, bundled into `dist/bridge.js`)**: the only content script with access to `chrome.storage`. It passes the saved speed to the page through a `data-fm-speed` attribute on `<html>` and stores changes coming back from the player via a `CustomEvent`.
- **`src/background/background.js`** (ES module service worker): shows the current speed as a badge on the extension icon.

Names shared by all parts (storage key, speed limits, event names) live in `src/shared/constants.js`. Pure helpers (time formatting and parsing, clip links, position pruning, sleep fade) have no DOM access and are covered by `test/`. The player modules never import each other in a cycle: low-level code asks for a re-render or runs a UI action through the tiny `render-scheduler.js` and `action-registry.js` modules, which `initPlayer()` fills in.

Listening history and saved-time totals stay in `chrome.storage.local`; playback positions remain in the site's `localStorage`. The playback-speed preference uses `chrome.storage.sync`, which Chrome may sync through the user's Google account. Audio is not uploaded by the extension.

## Project layout

```
manifest.json
src/shared/       constants and pure helpers used everywhere (speed limits, time formatting)
src/background/   service worker (icon badge)
src/popup/        popup UI
src/content/
  bridge.js       isolated world: chrome.storage <-> page (-> dist/bridge.js)
  main.js         page world entry: initMedia(), then initPlayer() in the top frame (-> dist/page.js)
  sites.js        per-site configuration and the current site
  pending-clip.js shared-clip handshake state between player and media
  events.js       toast / content-ready / set-speed DOM events
  media/          catches audio, enforces speed, remembers position
  player/         the custom player UI (one module per concern, player.css)
test/             node:test unit tests for the pure helpers
dist/             build output (git-ignored), loaded by manifest.json
icons/            extension icons
docs/             store listing and screenshots
```

Development: `npm install`, `npm run build` (or `npm run watch`), then `npm run lint`, `npm run format:check`, `npm test`, `npm run check:cycles` (madge, fails on circular imports), `npm run zip` (builds and packs `../103fm-speed-v<version>.zip`).

## Install (developer mode)

1. Download or clone this repository, then run `npm install && npm run build`.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the repository folder (the one containing `manifest.json`).
4. Open any recorded show on 103FM, Galei Tzahal or Kan.

## Version history

Each version is a commit with a matching tag (`git checkout v1.2` to try an older one).

| Version | What changed                                                                                                      |
| ------- | ----------------------------------------------------------------------------------------------------------------- |
| v1.0    | Speed presets in the popup, default 1.5x                                                                          |
| v1.1    | Keyboard shortcuts, resume position, speed button in the player, icon badge                                       |
| v1.2    | Control bar under the player with skip buttons and speed-adjusted remaining time                                  |
| v1.3    | Skip step changed from 15s to 10s                                                                                 |
| v2.0    | Full replacement player: waveform, sleep timer, clip sharing, floating player, media keys                         |
| v3.0    | Multi-site: Galei Tzahal (built into the top bar) and Kan (own resizable bottom bar replacing the site's)         |
| v3.1    | The play button pauses and resumes ads on 103FM                                                                   |
| v3.2    | Detect IMA video ads (`#ima-container`) so ads can actually be paused and are never sped up                       |
| v3.3    | Renamed to "מאיץ רדיו – מהירות השמעה ל־103FM, גלצ וכאן"; store listing texts in `STORE_LISTING.md`                |
| v3.4    | Homepage and the popup credit link point to the portfolio site                                                    |
| v3.5    | Project conventions: src/ icons/ docs/ layout, ESLint + Prettier, English code comments, MIT license              |
| v3.6    | Split the page scripts into ES modules (media/, player/) bundled with esbuild into dist/                          |
| v3.7    | Clean-code refactor: descriptive names, small modules without cycles, shared constants, unit tests, stricter lint |

## Author

Baruch Yankovitz — [Portfolio](https://portfolio-upgrade-xi.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/baruch-yankovitz) · [GitHub](https://github.com/baruchyankovitz)

## License

[MIT](LICENSE) © 2026 Baruch Yankovitz
