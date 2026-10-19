// Per-site settings:
// inline = replace the player inside the page; dock = build into the site's fixed bar;
// bar = our own bottom bar that hides the site's player (hide); with none of them a floating player is shown
const SITES = [
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
export const site = SITES.find(s => s.host.test(location.hostname)) || { name: document.title, bottom: 20 };
