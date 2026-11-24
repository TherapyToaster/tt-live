/* TT ARTcade discovery v1 — "START HERE" daily cabinet + HIGH SCORE BOARD for therapytoaster.com/arcade.
   One tag, appended after score-fx-v1.js on the ARTcade Code block:
     <script src="https://therapytoaster.github.io/tt-live/arcade/discovery-v1.js?c=SHA"></script>
   - START HERE: one game per day, same for everyone (date in America/New_York → fixed rotation).
     Clip + poster from <slug>/arcade-clip.*, title, hook, big PLAY that presses the real card's
     PLAY button (so the existing overlay, play counter and stats run unchanged), PLAYS + HIGH SCORE.
   - HIGH SCORE BOARD: top score per machine. Makes ZERO counter requests: it mirrors the values
     the card badges (play-counter.js / high-score-v1.js) already fetched, so numbers always match.
     Mirrored badges keep the .tt-hs/.tt-pc reel markup, so score-fx-v1 rolls them and bursts
     "NEW HIGH SCORE!" when a card badge goes up. Row click scrolls to that machine.
   - prefers-reduced-motion / Save-Data: poster only; reduced-motion also disables animation. Writes no counters.
   - One debounced MutationObserver; mutations inside our own panel are ignored; the panel is only
     ever moved to sit before the first featured card (capped), so no ping-pong with card scripts.
   Preview override: window.__ttDiscoveryDate = "YYYY-MM-DD". */
(function () {
  'use strict';
  if (window.__ttDiscovery) return;
  window.__ttDiscovery = 1;

  var LIVE = 'https://therapytoaster.github.io/tt-live/';
  var me = document.currentScript && document.currentScript.src || '';
  var ROOT = (me.match(/^(.*\/)arcade\/discovery-v1\.js/) || [0, LIVE])[1];
  var Q = (me.match(/[?&]c=([\w.-]+)/) || [0, 'v1'])[1];
  var TZ = 'America/New_York';

  /* Rotation order (fixed). f = featured card attr (data-<f>-card), k = cabinet data-k.
     norot = listed on the HIGH SCORE BOARD but never the daily START HERE pick (Toaster Tanks: two-player). */
  var GAMES = [
    { id: 'skullz', f: 'sk', name: "Mr. Toasty's No Signal Skullz", short: 'No Signal Skullz', hook: 'A 404 roguelike: play as Mr. Toasty, free the Cotys, break the Glitch.', clip: 'skullz' },
    { id: 'crypt', f: 'crypt', name: "Mr. Toasty's Crypt", short: 'Crypt', hook: 'Roguelike crypt crawl with Skullz heroes, guns and glitch bosses.', clip: 'crypt' },
    { id: 'toaster-pit', f: 'pit', name: 'Toaster Pit', short: 'Toaster Pit', hook: "Pull the cursed Toaster Slot. Pay the Breadlord. Don't get burnt.", clip: 'toaster-pit' },
    { id: 'kart', f: 'kart', name: 'CyberToaster Kart', short: 'CyberToaster Kart', hook: "Cartoon kart racing: Mr. Toasty's Cybertruck vs. the Chevys.", clip: 'kart', none: 1 },
    { id: 'burnt-offerings', f: 'bo', name: 'Burnt Offerings', short: 'Burnt Offerings', hook: 'A creepy diner card duel. Burn your slices, outlast The Repairman.', clip: 'burnt-offerings' },
    { id: 'crumb-dungeon', f: 'crumb', name: 'Skullz: Crumb Dungeon', short: 'Crumb Dungeon', hook: 'Slide the board, match bones and jam, lead your SkulRz heroes down.', clip: 'crumb-dungeon' },
    { id: 'prize-floor', f: 'pf', name: "Toasty's Prize Floor", short: 'Prize Floor', hook: 'A first-person arcade of coin pushers and prize machines. Tokens only.', clip: 'prize-floor' },
    { id: 'summer', f: 'summer', name: 'Toaster Summer', short: 'Toaster Summer', hook: 'Bolt a stainless truck together, then cruise summer Surf City.', clip: 'summer', none: 1 },
    { id: 'toasty-bros', f: 'tb', name: 'Mr. Toasty: Toasty Bros', short: 'Toasty Bros', hook: 'Run, stomp and blow up the Toasty universe. Free the caged bros.', clip: 'toasty-bros' },
    { id: 'mars', k: 'mars', name: 'Cybertruck then Mars', short: 'Cybertruck then Mars', hook: 'Moonbase first, then the Starship run to Mars.' },
    { id: 'feed', k: 'feed', name: 'Feed Fat Coty', short: 'Feed Fat Coty', hook: 'Feed the craving. Chain the combos.' },
    { id: 'bite', k: 'bite', name: 'Fat Coty: Final Bite', short: 'Final Bite', hook: '16-bit street brawl. Eat the Toaster.' },
    { id: 'tanks', k: 'tanks', norot: 1, name: 'Toaster Tanks', short: 'Toaster Tanks', hook: 'Two-player artillery. Toasty vs. Crusty. Bring a friend.' }
  ];

  var reduce = false, saveData = false;
  try { reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}
  try { saveData = !!(navigator.connection && navigator.connection.saveData); } catch (e) {}

  /* ---------- date / rotation ---------- */
  function nyParts(d) {
    var o = {};
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
        .formatToParts(d || new Date()).forEach(function (p) { o[p.type] = p.value; });
    } catch (e) {
      var x = d || new Date(); o = { year: x.getFullYear(), month: x.getMonth() + 1, day: x.getDate(), hour: x.getHours(), minute: x.getMinutes(), second: x.getSeconds() };
    }
    return { y: +o.year, m: +o.month, d: +o.day, h: (+o.hour) % 24, mi: +o.minute, s: +o.second };
  }
  function dayKey() {
    var o = window.__ttDiscoveryDate;
    if (typeof o === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o)) return o;
    var p = nyParts();
    return p.y + '-' + (p.m < 10 ? '0' : '') + p.m + '-' + (p.d < 10 ? '0' : '') + p.d;
  }
  function pickFor(key, list) {
    var a = key.split('-');
    /* days since launch day 2026-11-24 (= first game in the list); same answer for every visitor */
    var n = Math.floor((Date.UTC(+a[0], +a[1] - 1, +a[2]) - Date.UTC(2026, 10, 24)) / 864e5);
    return list[((n % list.length) + list.length) % list.length];
  }
  function midnightAfter(now) {
    var p = nyParts(now);
    var target = Date.UTC(p.y, p.m - 1, p.d + 1), guess = target + 5 * 3600e3;
    for (var i = 0; i < 3; i++) {
      var q = nyParts(new Date(guess));
      guess += target - Date.UTC(q.y, q.m - 1, q.d, q.h, q.mi, q.s);
    }
    return guess;
  }
  function leftText() {
    var now = new Date();
    var mins = Math.max(1, Math.ceil((midnightAfter(now) - now.getTime()) / 60000));
    var h = Math.floor(mins / 60), m = mins % 60;
    return 'new pick in ' + (h ? h + 'h' : '') + (m ? (h ? ' ' : '') + m + 'm' : '');
  }

  /* ---------- page lookups ---------- */
  function arc() { return document.getElementById('tt-arc'); }
  function cardOf(g) {
    var r = arc(); if (!r) return null;
    return g.f ? r.querySelector('.tt-ns[data-' + g.f + '-card]') : r.querySelector('.ta-cab[data-k="' + g.k + '"]');
  }
  function badgeOf(g, cls) { var c = cardOf(g); return c ? c.querySelector('.' + cls) : null; }
  function playHook(g) {
    var c = cardOf(g); if (!c) return null;
    return g.f ? c.querySelector('.tt-ns-play') : c;
  }
  function available() {
    var out = [];
    for (var i = 0; i < GAMES.length; i++) if (cardOf(GAMES[i])) out.push(GAMES[i]);
    return out;
  }
  function firstFeatured() {
    var r = arc(); if (!r) return null;
    var all = r.querySelectorAll(':scope > .tt-ns');
    for (var i = 0; i < all.length; i++) { for (var j = 0; j < all[i].attributes.length; j++) if (/^data-[a-z]+-card$/.test(all[i].attributes[j].name)) return all[i]; }
    return null;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shotURL(g) {
    if (g.clip) return ROOT + g.clip + '/arcade-clip-poster.jpg?c=' + Q;
    var c = cardOf(g), s = c && c.querySelector('.ta-scr');
    var m = s && /url\(["']?([^"')]+)/.exec(s.getAttribute('style') || '');
    return m ? m[1] : '';
  }

  /* ---------- reel badges (same markup as play-counter / high-score so score-fx animates them) ---------- */
  function odo(cls, n) {
    var s = String(Math.max(0, Math.floor(n))); while (s.length < 4) s = '0' + s;
    var h = '<span class="' + cls + '-odo" aria-hidden="true">';
    for (var i = 0; i < s.length; i++) {
      h += '<span class="' + cls + '-d"><span class="' + cls + '-strip" data-d="' + s.charAt(i) + '" style="transform:translateY(-' + (+s.charAt(i) * 10) + '%)">';
      for (var k = 0; k <= 9; k++) h += '<span>' + k + '</span>';
      h += '</span></span>';
    }
    return h + '</span>';
  }
  function setReel(box, cls, n) {
    var s = String(Math.max(0, Math.floor(n))); while (s.length < 4) s = '0' + s;
    var strips = box.querySelectorAll('.' + cls + '-strip');
    if (strips.length !== s.length) {
      var o = box.querySelector('.' + cls + '-odo');
      if (o) o.outerHTML = odo(cls, n); else box.querySelector('.ttd-val').innerHTML = odo(cls, n);
    } else {
      for (var i = 0; i < strips.length; i++) {
        strips[i].setAttribute('data-d', s.charAt(i));
        strips[i].style.transform = 'translateY(-' + (+s.charAt(i) * 10) + '%)';
      }
    }
    box.setAttribute('data-count', String(n)); /* last: score-fx reacts to this */
  }
  /* read a card badge: {state:'num',v} | {state:'none'} (dash) | {state:'wait'} */
  function readBadge(g, cls) {
    if (cls === 'tt-hs' && g.none) return { state: 'none' };
    var b = badgeOf(g, cls);
    if (!b) return { state: 'wait' };
    if (b.querySelector('.tt-hs-dash')) return { state: 'none' };
    var on = b.classList.contains(cls + '-on'), v = parseInt(b.getAttribute('data-count'), 10);
    return on && v >= 0 ? { state: 'num', v: v } : { state: 'wait' };
  }

  /* ---------- CSS ---------- */
  function injectStyle() {
    if (document.getElementById('ttd-css')) return;
    var Y = '#FFD400', R = '#ff2b4a', C = '#00e5ff';
    var st = document.createElement('style');
    st.id = 'ttd-css';
    st.textContent = [
      '#tt-arc .ttd{box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:22px;margin:0 0 34px;align-items:stretch}',
      '#tt-arc .ttd *{box-sizing:border-box}',
      '#tt-arc .ttd-cab,#tt-arc .ttd-board{position:relative;border:2px solid ' + Y + ';border-radius:14px;background:linear-gradient(#14161f,#05070d 70%);',
        'box-shadow:5px 5px 0 ' + R + ',-5px -5px 0 rgba(0,229,255,.55);color:#fff;min-width:0}',
      '#tt-arc .ttd-cab{padding:14px;display:flex;flex-direction:column;gap:12px}',
      '#tt-arc .ttd-tag{position:absolute;z-index:3;top:-15px;left:18px;display:inline-flex;align-items:center;gap:8px;padding:5px 12px;background:' + Y + ';color:#000;',
        'font:900 18px/1 Impact,"Arial Black",sans-serif;letter-spacing:.06em;border-radius:6px;box-shadow:3px 3px 0 ' + R + ',-3px -3px 0 ' + C + '}',
      '#tt-arc .ttd-tag i{display:inline-block;width:9px;height:9px;border-radius:50%;background:' + R + ';box-shadow:0 0 8px ' + R + ';animation:ttd-blink 1.1s steps(2,end) infinite}',
      '#tt-arc .ttd-scr{position:relative;display:block;width:100%;aspect-ratio:16/9;border:0;padding:0;margin:0;cursor:pointer;border-radius:10px;overflow:hidden;',
        'background:#000 center/cover no-repeat;outline:1px solid rgba(255,212,0,.35)}',
      '#tt-arc .ttd-tank-art{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:repeating-linear-gradient(0deg,#0b1512 0 30px,#12231a 30px 31px);color:#FFD400;font:900 44px/.95 Impact,Arial,sans-serif;text-shadow:3px 3px #a62b31,-2px -2px #008a94}',
      '#tt-arc .ttd-tank-art small{font:12px/2 monospace;letter-spacing:.25em;color:#00e5ff}',
      '#tt-arc .ttd-scr video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .4s}',
      '#tt-arc .ttd-scr video.on{opacity:1}',
      '#tt-arc .ttd-scr::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px);mix-blend-mode:multiply}',
      '#tt-arc .ttd-today{position:absolute;z-index:2;right:10px;bottom:10px;padding:4px 8px;font:700 11px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.14em;',
        'color:' + Y + ';background:rgba(0,0,0,.78);border:1px solid rgba(255,212,0,.6);border-radius:4px;text-transform:uppercase}',
      '#tt-arc .ttd-k{margin:0;font:12px/1.3 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.28em;color:' + C + ';text-transform:uppercase}',
      '#tt-arc .ttd-k b{color:' + Y + ';font-weight:700}',
      '#tt-arc .ttd-t{margin:0;font:900 clamp(30px,4vw,46px)/.98 Impact,"Arial Black",sans-serif;text-transform:uppercase;color:' + Y + ';text-shadow:3px 0 ' + R + ',-3px 0 ' + C + '}',
      '#tt-arc .ttd-d{margin:0;font-size:16px;line-height:1.4;color:#e9e6dc}',
      '#tt-arc .ttd-row{display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px}',
      '#tt-arc .ttd-play{appearance:none;border:0;cursor:pointer;padding:14px 34px;border-radius:10px;background:' + Y + ';color:#000;',
        'font:900 28px/1 Impact,"Arial Black",sans-serif;letter-spacing:.04em;box-shadow:5px 5px 0 ' + R + ',-5px -5px 0 rgba(0,229,255,.65);transition:transform .12s}',
      '#tt-arc .ttd-play:hover{transform:translate(-1px,-1px) scale(1.03)}',
      '#tt-arc .ttd-play:active{transform:translate(2px,2px)}',
      '#tt-arc .ttd-play:focus-visible,#tt-arc .ttd-r:focus-visible,#tt-arc .ttd-scr:focus-visible{outline:3px solid ' + C + ';outline-offset:3px}',
      '#tt-arc .ttd-stats{display:flex;flex-wrap:wrap;gap:10px}',
      '#tt-arc .ttd-stats .tt-pc,#tt-arc .ttd-stats .tt-hs{width:auto;margin:0;display:inline-block}',
      /* board */
      '#tt-arc .ttd-board{padding:16px 14px 12px;display:flex;flex-direction:column}',
      '#tt-arc .ttd-bh{margin:4px 0 2px;font:900 clamp(24px,2.6vw,32px)/1 Impact,"Arial Black",sans-serif;text-transform:uppercase;color:' + Y + ';text-shadow:2px 0 ' + R + ',-2px 0 ' + C + ';letter-spacing:.02em}',
      '#tt-arc .ttd-bs{margin:0 0 10px;font:11px/1.3 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.18em;color:' + C + ';text-transform:uppercase}',
      '#tt-arc .ttd-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;flex:1}',
      '#tt-arc .ttd-list li{margin:0;padding:0}',
      '#tt-arc .ttd-r{appearance:none;width:100%;display:grid;grid-template-columns:18px minmax(0,1fr) auto;align-items:center;gap:8px;padding:5px 8px;cursor:pointer;',
        'background:rgba(255,255,255,.025);border:1px solid rgba(255,212,0,.16);border-radius:6px;color:#f2efe4;text-align:left;font:700 13px/1.15 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.04em}',
      '#tt-arc .ttd-r:hover{border-color:' + Y + ';background:rgba(255,212,0,.08)}',
      '#tt-arc .ttd-r .ttd-n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-transform:uppercase}',
      '#tt-arc .ttd-r .ttd-ic{width:16px;height:12px;justify-self:center;opacity:.35;background:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 18\'%3E%3Cpath d=\'M2 16h20l1-11-6 5-5-8-5 8-6-5z\' fill=\'%23FFD400\'/%3E%3C/svg%3E") center/contain no-repeat}',
      '#tt-arc .ttd-r.ttd-has .ttd-ic{opacity:1;filter:drop-shadow(0 0 4px rgba(255,212,0,.8))}',
      '#tt-arc .ttd-r.ttd-pick{border-color:' + Y + ';box-shadow:inset 3px 0 0 ' + Y + '}',
      '#tt-arc .ttd-r.ttd-pick .ttd-n::after{content:" \\2190 TODAY";color:' + C + ';font-size:10px;letter-spacing:.12em}',
      '#tt-arc .ttd-r .tt-hs{margin:0;width:auto;display:inline-block}',
      '#tt-arc .ttd-r .tt-hs-in{padding:2px 4px;gap:4px}',
      '#tt-arc .ttd-r .tt-hs-d{width:11px;height:15px}',
      '#tt-arc .ttd-r .tt-hs-strip span{height:13px;line-height:13px;font-size:11px}',
      '#tt-arc .ttd-st{font:700 10px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.14em;color:rgba(255,212,0,.75);padding:4px 6px;border:1px dashed rgba(255,212,0,.4);border-radius:4px;white-space:nowrap}',
      '#tt-arc .ttd-st.ttd-dash{border-style:solid;border-color:#3a3215;color:#a59a6a}',
      '#tt-arc .ttd .ttd-empty{display:none}',
      '#tt-arc .ttd .ttd-zero .tt-hs-odo{display:none}',
      '#tt-arc .ttd .ttd-zero .ttd-empty{display:inline-block}',
      '#tt-arc .ttd-r.ttd-zero .tt-hs-in{border:0;background:none;box-shadow:none;animation:none;padding:0}',
      '#tt-arc .ttd-r.ttd-zero .tt-hs-in::before{display:none}',
      /* score-fx pop label: keep it inside the board on the right-hand column */
      '#tt-arc .ttd-r .tt-sfx-fl{left:auto;right:0}',
      '#tt-arc .ttd-foot{margin:10px 0 0;font:11px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#bdb8a6;letter-spacing:.04em}',
      '#tt-arc .ttd-flash{animation:ttd-flash 1.6s ease-out 1}',
      '@keyframes ttd-flash{0%,100%{outline:0 solid transparent}15%,55%{outline:4px solid ' + Y + ';outline-offset:6px}35%,75%{outline:4px solid ' + C + ';outline-offset:3px}}',
      '@keyframes ttd-blink{0%{opacity:1}100%{opacity:.25}}',
      '@keyframes ttd-glitch{0%,92%,100%{transform:none;text-shadow:3px 0 ' + R + ',-3px 0 ' + C + '}94%{transform:translate(-3px,1px) skewX(-6deg);text-shadow:-4px 0 ' + R + ',4px 0 ' + C + '}97%{transform:translate(3px,-1px);text-shadow:5px 0 ' + R + ',-5px 0 ' + C + '}}',
      '#tt-arc .ttd-t{animation:ttd-glitch 6s steps(1,end) infinite}',
      '@media (max-width:900px){#tt-arc .ttd{grid-template-columns:1fr;gap:30px}}',
      '@media (max-width:640px){',
        '#tt-arc .ttd-cab{padding:12px;text-align:center}',
        '#tt-arc .ttd-row,#tt-arc .ttd-stats{justify-content:center}',
        '#tt-arc .ttd-play{width:100%;font-size:26px;padding:14px 10px}',
        '#tt-arc .ttd-d{font-size:15px}',
        '#tt-arc .ttd-tag{font-size:16px;left:50%;transform:translateX(-50%);white-space:nowrap}',
        '#tt-arc .ttd-r{font-size:12px;padding:6px}',
      '}',
      '@media (prefers-reduced-motion:reduce){#tt-arc .ttd *,#tt-arc .ttd-flash{animation:none!important;transition:none!important}}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- build ---------- */
  var wrap = null, pick = null, pickKey = '', moves = 0, vidIO = null, currentVideo = null, resumeVideo = null;

  function statBadge(cls, label) {
    return '<span class="' + cls + ' ' + cls + '-on ttd-mirror" role="status" aria-label="' + label + '">' +
      '<span class="' + cls + '-in"><span class="' + cls + '-sk" aria-hidden="true"><span class="' + cls + '-sk-j">' +
      '<img alt="" width="122" height="128" src="https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@ca8f8599458c7f338dea3c1a234d2e593feb8888/paste/0810/tt-vc-skull-v5.png"></span></span>' +
      '<span class="' + cls + '-grp"><span class="' + cls + '-lbl">' + label + '</span><span class="ttd-val"><span class="ttd-st">&hellip;</span></span>' +
      (cls === 'tt-hs' ? '<span class="ttd-st ttd-empty">BE THE FIRST</span>' : '') + '</span></span></span>';
  }

  function buildCab(g) {
    var poster = shotURL(g);
    return '<div class="ttd-cab" data-ttd-game="' + g.id + '">' +
      '<span class="ttd-tag"><i aria-hidden="true"></i>START HERE</span>' +
      '<button type="button" class="ttd-scr ttd-go" aria-label="Play ' + esc(g.name) + '" style="background-image:url(\'' + esc(poster) + '\')">' +
        (g.id === 'tanks' ? '<span class="ttd-tank-art" aria-hidden="true">&#9733;<br>TOASTER<br>TANKS<small>2 PLAYER ARTILLERY</small></span>' : '') +
        '<span class="ttd-today">Today\'s pick</span></button>' +
      '<p class="ttd-k">// today\'s pick &middot; <b class="ttd-left">' + leftText() + '</b></p>' +
      '<h2 class="ttd-t">' + esc(g.name) + '</h2>' +
      '<p class="ttd-d">' + esc(g.hook) + '</p>' +
      '<div class="ttd-row"><button type="button" class="ttd-play ttd-go">&#9654; PLAY</button>' +
      '<span class="ttd-stats">' + statBadge('tt-pc', 'Plays') + statBadge('tt-hs', 'High score') + '</span></div>' +
    '</div>';
  }
  function buildBoard(list) {
    var h = '<div class="ttd-board" role="region" aria-label="High score board">' +
      '<span class="ttd-tag" style="background:#000;color:#FFD400;border:1px solid #FFD400">&#9819; HIGH SCORES</span>' +
      '<h2 class="ttd-bh">High Score Board</h2><p class="ttd-bs">Top score on every machine</p><ul class="ttd-list">';
    for (var i = 0; i < list.length; i++) {
      var g = list[i];
      h += '<li><button type="button" class="ttd-r" data-ttd-row="' + g.id + '" aria-label="' + esc(g.name) + ': go to machine">' +
        '<span class="ttd-ic" aria-hidden="true"></span><span class="ttd-n">' + esc(g.short) + '</span>' +
        (g.none
          ? '<span class="ttd-st ttd-dash" title="This machine has no score">&mdash; NO SCORE</span>'
          : '<span class="tt-hs tt-hs-on ttd-mirror ttd-hsrow"><span class="tt-hs-in"><span class="ttd-val"><span class="ttd-st">&hellip;</span></span><span class="ttd-st ttd-empty">BE THE FIRST</span></span></span>') +
        '</button></li>';
    }
    return h + '</ul><p class="ttd-foot">Beat any machine and your score takes the top spot here. Scores don\'t compare across games, so each machine keeps its own crown.</p></div>';
  }

  function mountVideo(g) {
    if (!wrap || !g.clip || reduce || saveData) return;
    var scr = wrap.querySelector('.ttd-scr');
    if (!scr || scr.querySelector('video')) return;
    var v = document.createElement('video');
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    ['muted', 'playsinline', 'loop'].forEach(function (a) { v.setAttribute(a, ''); });
    v.setAttribute('aria-hidden', 'true'); v.setAttribute('tabindex', '-1'); v.setAttribute('disablepictureinpicture', '');
    v.preload = 'none'; v.poster = shotURL(g);
    v.addEventListener('playing', function () { v.classList.add('on'); });
    v.addEventListener('error', function () { v.classList.remove('on'); }, true);
    scr.insertBefore(v, scr.firstChild);
    var go = function () {
      if (!v.__src) { v.__src = 1; v.innerHTML = '<source src="' + ROOT + g.clip + '/arcade-clip.webm?c=' + Q + '" type="video/webm"><source src="' + ROOT + g.clip + '/arcade-clip.mp4?c=' + Q + '" type="video/mp4">'; try { v.load(); } catch (e) {} }
      var p; try { p = v.play(); } catch (e) {} if (p && p['catch']) p['catch'](function () {});
    };
    currentVideo = v; resumeVideo = go;
    if ('IntersectionObserver' in window) {
      vidIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { v.__vis = e.isIntersecting; if (e.isIntersecting && !document.hidden) go(); else { try { v.pause(); } catch (x) {} } });
      }, { rootMargin: '200px 0px' });
      vidIO.observe(scr);
    } else go();

  }

  function render() {
    var r = arc(), first = firstFeatured();
    if (!r || !first) return false;
    var list = available();
    if (list.length < 3) return false;
    pickKey = dayKey();
    var rot = list.filter(function (g) { return !g.norot; }); /* norot: on the board, never the daily pick */
    pick = pickFor(pickKey, rot.length ? rot : list);
    if (vidIO) { try { vidIO.disconnect(); } catch (e) {} vidIO = null; }
    if (currentVideo) { try { currentVideo.pause(); currentVideo.removeAttribute('src'); currentVideo.innerHTML = ''; currentVideo.load(); } catch (e) {} }
    currentVideo = null; resumeVideo = null;
    if (!wrap) {
      wrap = document.createElement('section');
      wrap.className = 'ttd';
      wrap.setAttribute('aria-label', 'Start here and high score board');
      wrap.addEventListener('click', onClick);
    }
    wrap.setAttribute('data-ttd-day', pickKey);
    wrap.setAttribute('data-ttd-pick', pick.id);
    wrap.innerHTML = buildCab(pick) + buildBoard(list);
    if (wrap.nextElementSibling !== first) r.insertBefore(wrap, first);
    mountVideo(pick);
    sync();
    return true;
  }

  /* ---------- values ---------- */
  function mirror(box, cls, st) {
    if (!box) return;
    var val = box.querySelector('.ttd-val');
    if (st.state === 'num') {
      if (!box.querySelector('.' + cls + '-odo')) { if (val) val.innerHTML = odo(cls, st.v); }
      if (box.getAttribute('data-count') !== String(st.v)) setReel(box, cls, st.v);
      if (cls === 'tt-hs') { /* a 0 record reads "BE THE FIRST", not 0000 */
        var row = box.closest('.ttd-r') || box;
        row.classList.toggle('ttd-zero', st.v === 0); row.classList.toggle('ttd-has', st.v > 0);
      }
      box.setAttribute('aria-label', (cls === 'tt-pc' ? 'Plays: ' : 'High score: ') + st.v);
    } else if (st.state === 'none') {
      if (val && !val.querySelector('.ttd-dash')) val.innerHTML = '<span class="tt-hs-dash" aria-hidden="true">&mdash;</span>';
      box.removeAttribute('data-count');
    }
  }
  function sync() {
    if (!wrap || !pick) return;
    var stats = wrap.querySelector('.ttd-stats');
    if (stats) {
      mirror(stats.querySelector('.tt-pc'), 'tt-pc', readBadge(pick, 'tt-pc'));
      mirror(stats.querySelector('.tt-hs'), 'tt-hs', readBadge(pick, 'tt-hs'));
    }
    var rows = wrap.querySelectorAll('.ttd-r');
    for (var i = 0; i < rows.length; i++) {
      var id = rows[i].getAttribute('data-ttd-row'), g = null;
      for (var j = 0; j < GAMES.length; j++) if (GAMES[j].id === id) g = GAMES[j];
      if (!g) continue;
      rows[i].classList.toggle('ttd-pick', g === pick);
      if (!g.none) mirror(rows[i].querySelector('.ttd-hsrow'), 'tt-hs', readBadge(g, 'tt-hs'));
    }
  }

  /* ---------- actions ---------- */
  function flash(el) {
    if (!el) return;
    el.classList.remove('ttd-flash'); void el.offsetWidth; el.classList.add('ttd-flash');
    setTimeout(function () { el.classList.remove('ttd-flash'); }, 1700);
  }
  function onClick(e) {
    var t = e.target; if (!t || !t.closest) return;
    var go = t.closest('.ttd-go');
    if (go && pick) {
      var hook = playHook(pick);
      if (!hook) return;
      e.preventDefault();
      hook.click(); /* the card's own handler opens its player; play-counter counts it as usual */
      if (pick.k) { var c = cardOf(pick); try { c.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); } catch (x) {} }
      return;
    }
    var row = t.closest('.ttd-r');
    if (row) {
      var id = row.getAttribute('data-ttd-row');
      for (var i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) {
        var card = cardOf(GAMES[i]); if (!card) return;
        try { card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); } catch (x) { card.scrollIntoView(); }
        flash(card);
      }
    }
  }

  /* ---------- scheduling ---------- */
  var queued = false;
  function tick() {
    queued = false;
    try {
      if (!wrap || !wrap.isConnected) { render(); return; }
      var first = firstFeatured();
      if (first && wrap.nextElementSibling !== first && moves < 6) { moves++; arc().insertBefore(wrap, first); }
      if (dayKey() !== pickKey || available().length !== wrap.querySelectorAll('.ttd-r').length) { render(); return; }
      sync();
    } catch (e) {}
  }
  function later() {
    if (queued) return;
    queued = true;
    setTimeout(function () { (window.requestAnimationFrame || setTimeout)(tick); }, 120);
  }
  function relevant(n) {
    return n && n.nodeType === 1 && !(wrap && wrap.contains(n)) && n.tagName !== 'VIDEO' && n.tagName !== 'SOURCE' &&
      ((n.matches && n.matches('.tt-ns, .ta-cab, .tt-pc, .tt-hs, #tt-arc')) || (n.querySelector && n.querySelector('.tt-ns, .ta-cab, .tt-pc, .tt-hs')));
  }

  function start() {
    injectStyle();
    tick();
    try {
      new MutationObserver(function (ms) {
        for (var i = 0; i < ms.length; i++) {
          var m = ms[i], t = m.target;
          if (wrap && wrap.contains(t)) continue;
          if (m.type === 'attributes') { if (t.closest && t.closest('#tt-arc .tt-ns, #tt-arc .ta-cab')) { later(); return; } continue; }
          var j;
          for (j = 0; j < m.addedNodes.length; j++) if (relevant(m.addedNodes[j])) { later(); return; }
          for (j = 0; j < m.removedNodes.length; j++) { var n = m.removedNodes[j]; if (n === wrap || relevant(n)) { later(); return; } }
        }
      }).observe(document.body || document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-count'] });
    } catch (e) {}
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && currentVideo) { try { currentVideo.pause(); } catch (e) {} }
      else { if (currentVideo && currentVideo.__vis && resumeVideo) resumeVideo(); later(); }
    });
    setInterval(function () {
      if (document.hidden || !wrap) return;
      if (dayKey() !== pickKey) { render(); return; }
      var l = wrap.querySelector('.ttd-left'); if (l) l.textContent = leftText();
    }, 30000);
    try { window.addEventListener('mercury:load', later); } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
