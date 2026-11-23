// v0.5 mobile-first touch controls.
// Left: 8-way virtual D-pad (one zone, slide your thumb around). Right: A = jump, B = run / fire, S = special, M = melee, plus a pause button.
// True multi-touch: every touch is tracked by its identifier and the whole state is rebuilt from the live touch list on every
// touch event, so nothing can get stuck; blur / pagehide / visibilitychange / touchcancel release everything.
// Quick taps are latched for one game frame so a tap shorter than a frame still registers, and releasing A cuts the jump.
'use strict';
const TouchInput = (function(){
  const KEYS = ['left', 'right', 'up', 'down', 'jump', 'run', 'start', 'special', 'melee'];
  const state = {}, latch = {}; KEYS.forEach(k => { state[k] = false; latch[k] = false; });
  const forced = /[?&]touch\b/.test(location.search);
  const isTouch = forced || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  let root = null, pad = null, knob = null, hint = null; const btns = [];
  const owners = new Map(); // touch identifier -> { kind: 'pad' | 'btn', x, y }
  const stats = { starts: 0, ends: 0, cancels: 0, releases: 0, maxTouches: 0 };
  let portrait = false;
  function mk(cls, label, keys, aria){ const d = document.createElement('div'); d.className = 'tb ' + cls; d.textContent = label; d.dataset.keys = keys; d.setAttribute('role', 'button'); d.setAttribute('aria-label', aria || keys); root.appendChild(d); btns.push(d); return d; }
  function inRect(x, y, r, slop){ return x >= r.left - slop && x <= r.right + slop && y >= r.top - slop && y <= r.bottom + slop; }
  function padDirs(x, y){
    const r = pad.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = x - cx, dy = y - cy, dead = r.width * 0.14;
    const out = { left: false, right: false, up: false, down: false, kx: 0, ky: 0 };
    const d = Math.hypot(dx, dy); if (d < dead) return out;
    const a = Math.atan2(dy, dx), oct = Math.round(a / (Math.PI / 4)); // 8-way
    const map = { 0: ['right'], 1: ['right', 'down'], 2: ['down'], 3: ['left', 'down'], 4: ['left'], '-4': ['left'], '-3': ['left', 'up'], '-2': ['up'], '-1': ['right', 'up'] };
    (map[oct] || []).forEach(k => out[k] = true);
    const m = Math.min(1, d / (r.width / 2)); out.kx = Math.cos(a) * m; out.ky = Math.sin(a) * m;
    return out;
  }
  function recompute(){
    const was = {}; KEYS.forEach(k => { was[k] = state[k]; state[k] = false; });
    for (const b of btns) b.classList.remove('on');
    pad.classList.remove('on'); let kx = 0, ky = 0;
    for (const [, o] of owners){
      if (o.kind === 'pad'){
        const d = padDirs(o.x, o.y); ['left', 'right', 'up', 'down'].forEach(k => { if (d[k]) state[k] = true; }); kx = d.kx; ky = d.ky; pad.classList.add('on');
      } else {
        // action-side touches can slide between buttons (e.g. roll from B onto A to run-jump)
        for (const b of btns){ if (inRect(o.x, o.y, b.getBoundingClientRect(), 8)){ b.classList.add('on'); b.dataset.keys.split(',').forEach(k => state[k] = true); } }
      }
    }
    pad.querySelectorAll('.arr').forEach(a => a.classList.toggle('on', state[a.dataset.k]));
    knob.style.transform = 'translate(' + Math.round(kx * 34) + 'px,' + Math.round(ky * 34) + 'px)';
    let newPress = false;
    KEYS.forEach(k => { if (state[k] && !was[k]){ latch[k] = true; newPress = true; } });
    if (newPress && navigator.vibrate && !forced) try { navigator.vibrate(6); } catch (e) {}
  }
  function sync(list){ // drop any owner whose touch is no longer alive (guards against lost touchend events)
    const live = new Set(); for (let i = 0; i < list.length; i++) live.add(list[i].identifier);
    for (const id of [...owners.keys()]) if (!live.has(id)) owners.delete(id);
  }
  function unlockAudio(){ if (typeof AudioSys !== 'undefined') AudioSys.unlock(); }
  function onStart(e){
    if (e.cancelable) e.preventDefault(); unlockAudio(); stats.starts++;
    for (const t of e.changedTouches){
      const pr = pad.getBoundingClientRect();
      const onPad = inRect(t.clientX, t.clientY, pr, 18) || (t.clientX < window.innerWidth * 0.4 && t.clientY > pr.top - 60 && !btns.some(b => inRect(t.clientX, t.clientY, b.getBoundingClientRect(), 4)));
      owners.set(t.identifier, { kind: onPad ? 'pad' : 'btn', x: t.clientX, y: t.clientY });
    }
    stats.maxTouches = Math.max(stats.maxTouches, e.touches.length);
    sync(e.touches); recompute();
  }
  function onMove(e){
    if (e.cancelable) e.preventDefault();
    for (const t of e.changedTouches){ const o = owners.get(t.identifier); if (o){ o.x = t.clientX; o.y = t.clientY; } }
    sync(e.touches); recompute();
  }
  function onEnd(e){
    if (e.cancelable) e.preventDefault(); unlockAudio(); // iOS resumes audio most reliably inside touchend (touchcancel is not cancelable)
    if (e.type === 'touchcancel') stats.cancels++; else stats.ends++;
    for (const t of e.changedTouches) owners.delete(t.identifier);
    sync(e.touches); recompute();
  }
  function release(){ owners.clear(); stats.releases++; if (pad) recompute(); KEYS.forEach(k => { state[k] = false; latch[k] = false; }); }
  // merged view for one game frame: held buttons plus taps that started and ended between two frames
  function poll(){ const out = {}; KEYS.forEach(k => { out[k] = state[k] || latch[k]; latch[k] = false; }); return out; }
  // safe-area insets (notches / home indicator), read from CSS env() through a probe element
  let probe = null;
  function safe(){
    if (!probe){ probe = document.createElement('div'); probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'; document.body.appendChild(probe); }
    const cs = getComputedStyle(probe); const v = p => parseFloat(cs[p]) || 0;
    return { t: v('paddingTop'), r: v('paddingRight'), b: v('paddingBottom'), l: v('paddingLeft') };
  }
  // size the game screen and lay out the controls; returns the chosen scale
  function fit(canvas, W, H){
    const vw = window.innerWidth, vh = window.innerHeight, s = safe();
    portrait = vh > vw;
    const aw = vw - s.l - s.r, ah = vh - s.t - s.b;
    let scale, x, y;
    const near = f => { const i = Math.floor(f); return (i >= 1 && i / f >= 0.84) ? i : Math.max(0.5, Math.floor(f * 4) / 4); }; // integer when close, else quarter steps
    if (portrait){
      const ctrlH = Math.max(210, Math.min(300, ah * 0.36));
      scale = near(Math.min(aw / W, (ah - ctrlH) / H));
      x = s.l + (aw - W * scale) / 2; y = s.t + 4;
    } else {
      scale = near(Math.min(aw / W, ah / H));
      x = s.l + (aw - W * scale) / 2; y = s.t + (ah - H * scale) / 2;
    }
    canvas.width = Math.round(W * scale); canvas.height = Math.round(H * scale);
    canvas.style.width = canvas.width + 'px'; canvas.style.height = canvas.height + 'px';
    canvas.style.position = 'fixed'; canvas.style.left = Math.round(x) + 'px'; canvas.style.top = Math.round(y) + 'px';
    layout(s, x, y, W * scale, H * scale);
    return scale;
  }
  function place(el, l, t, w, h){ el.style.left = Math.round(l) + 'px'; el.style.top = Math.round(t) + 'px'; if (w){ el.style.width = Math.round(w) + 'px'; el.style.height = Math.round(h || w) + 'px'; } }
  function layout(s, cx, cy, cw, ch){
    if (!root) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    root.classList.toggle('portrait', portrait);
    const P = Math.round(Math.max(132, Math.min(176, Math.min(vw, vh) * 0.4))); // d-pad size
    const A = Math.round(Math.max(60, Math.min(76, P * 0.46))), Sm = Math.round(Math.max(48, A * 0.74));
    const [bA, bB, bS, bM, bSt] = btns;
    if (portrait){
      const top = cy + ch + 10, bot = vh - s.b - 12, mid = (top + bot) / 2;
      place(pad, s.l + 14, Math.min(bot - P, mid - P / 2 + 10), P, P);
      const rx = vw - s.r - 14, by = Math.min(bot - A, mid + 6);
      place(bA, rx - A, by - A * 0.55, A, A); place(bB, rx - A * 2 - 14, by, A, A);
      place(bS, rx - Sm - 6, by - A * 0.55 - Sm - 12, Sm, Sm); place(bM, rx - A * 2 - 8, by - Sm - 16, Sm, Sm);
      place(bSt, vw / 2 - 36, top, 72, 44);
    } else {
      const gutL = cx - s.l, gutR = vw - s.r - (cx + cw); // side gutters next to the screen (controls overlay the screen if too narrow)
      const padX = s.l + Math.max(10, (gutL - P) / 2 > 10 ? (gutL - P) / 2 : 10);
      place(pad, padX, vh - s.b - P - 14, P, P);
      const rx = vw - s.r - Math.max(10, gutR > A * 2 + 30 ? (gutR - (A * 2 + 14)) / 2 : 10), by = vh - s.b - A - 18;
      place(bA, rx - A, by - A * 0.5, A, A); place(bB, rx - A * 2 - 14, by + 4, A, A);
      place(bS, rx - Sm - 4, by - A * 0.5 - Sm - 14, Sm, Sm); place(bM, rx - A * 2 - 6, by - Sm - 12, Sm, Sm);
      place(bSt, gutR > 90 ? rx - 72 : vw - s.r - 82, s.t + 10, 72, 44);
    }
    hint.style.display = portrait ? 'block' : 'none';
    if (portrait) place(hint, 0, cy + ch + 58);
  }
  function init(){
    if (!isTouch) return;
    document.documentElement.classList.add('touch');
    root = document.createElement('div'); root.id = 'touch'; document.body.appendChild(root);
    const css = document.createElement('style');
    css.textContent = `#touch{position:fixed;inset:0;pointer-events:none;z-index:5}
      #touch .tb,#touch .pad{position:absolute;pointer-events:auto;box-sizing:border-box;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
      #touch .tb{display:flex;align-items:center;justify-content:center;font:bold 20px monospace;color:rgba(255,212,0,.95);
        background:rgba(20,22,30,.42);border:2px solid rgba(255,212,0,.55);border-radius:50%;transition:transform .05s,background .05s}
      #touch .tb.on{background:rgba(255,212,0,.55);color:#000;transform:scale(.92);border-color:#fff}
      #touch .tb.a{border-color:rgba(255,0,200,.7);color:#ff6ae0}#touch .tb.a.on{background:rgba(255,0,200,.6);color:#fff}
      #touch .tb.b{border-color:rgba(0,240,255,.7);color:#7af6ff}#touch .tb.b.on{background:rgba(0,240,255,.55);color:#000}
      #touch .tb.st{border-radius:14px;font-size:13px}
      #touch .pad{border-radius:50%;background:rgba(20,22,30,.32);border:2px solid rgba(255,212,0,.35)}
      #touch .pad.on{background:rgba(20,22,30,.5)}
      #touch .pad .arr{position:absolute;width:30%;height:30%;display:flex;align-items:center;justify-content:center;color:rgba(255,212,0,.75);font:bold 18px monospace}
      #touch .pad .arr.on{color:#fff;text-shadow:0 0 6px #FFD400}
      #touch .pad .u{left:35%;top:2%}#touch .pad .d{left:35%;bottom:2%}#touch .pad .l{left:2%;top:35%}#touch .pad .r{right:2%;top:35%}
      #touch .knob{position:absolute;left:32%;top:32%;width:36%;height:36%;border-radius:50%;background:rgba(255,212,0,.28);border:2px solid rgba(255,212,0,.6);pointer-events:none}
      #touch .hint{position:absolute;width:100%;text-align:center;font:bold 11px monospace;color:rgba(203,188,217,.6);pointer-events:none}`;
    document.head.appendChild(css);
    pad = document.createElement('div'); pad.className = 'pad'; pad.setAttribute('aria-label', 'd-pad'); root.appendChild(pad);
    for (const [c, k, t] of [['u', 'up', '▲'], ['d', 'down', '▼'], ['l', 'left', '◀'], ['r', 'right', '▶']]){ const a = document.createElement('div'); a.className = 'arr ' + c; a.dataset.k = k; a.textContent = t; pad.appendChild(a); }
    knob = document.createElement('div'); knob.className = 'knob'; pad.appendChild(knob);
    mk('a', 'A', 'jump', 'jump'); mk('b', 'B', 'run', 'run / fire'); mk('sm sp', 'S', 'special', 'special'); mk('sm ml', 'M', 'melee', 'melee'); mk('st', 'START', 'start', 'start / pause');
    hint = document.createElement('div'); hint.className = 'hint'; hint.textContent = 'ROTATE FOR A BIGGER SCREEN'; root.appendChild(hint);
    const opt = { passive: false, capture: true };
    document.addEventListener('touchstart', onStart, opt);
    document.addEventListener('touchmove', onMove, opt);
    document.addEventListener('touchend', onEnd, opt);
    document.addEventListener('touchcancel', onEnd, opt);
    // no long-press menu, no double-tap / pinch zoom, no selection
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('dblclick', e => e.preventDefault(), opt);
    document.addEventListener('gesturestart', e => e.preventDefault(), opt);
    document.addEventListener('gesturechange', e => e.preventDefault(), opt);
    document.addEventListener('selectstart', e => e.preventDefault());
    window.addEventListener('blur', release); window.addEventListener('pagehide', release);
    document.addEventListener('visibilitychange', () => { if (document.hidden) release(); });
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
  return { state, poll, release, fit, safe, stats, get active(){ return !!root; }, get portrait(){ return portrait; }, get touches(){ return owners.size; } };
})();
