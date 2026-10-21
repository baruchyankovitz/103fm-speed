// Per-site settings:
// inline = replace the player inside the page; dock = build into the site's fixed bar;
// bar = our own bottom bar that hides the site's player (hide); with none of them a floating player is shown
export const SITES = [
  {
    host: /(^|\.)maariv\.co\.il$/,
    name: '103FM',
    inline: '.content_centerblock.player',
    btn: '.mouthjs-playbutton',
    title: '.content_centerblock.player h1',
    duration: '.mouthjs-duration'
  },
  { host: /(^|\.)glz\.co\.il$/, name: 'גלי צה״ל', dock: '.playerNew', title: '.playerNew .title' },
  {
    host: /(^|\.)kan\.org\.il$/,
    name: 'כאן',
    bar: true,
    hide: '.desktop-audio-player',
    title: '.desktop-audio-player .player-title',
    share: false
  }
];

/** Finds the configured site for a hostname, if any. */
export const findSite = hostname => SITES.find(candidate => candidate.host.test(hostname));

/** True for sites without inline/dock/bar mode: the player floats in a corner. */
export const isFloatingSite = candidate => !candidate.inline && !candidate.dock && !candidate.bar;

export const site = findSite(location.hostname) || { name: document.title, bottom: 20 };
