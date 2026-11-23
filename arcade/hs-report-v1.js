/* TT ARTcade high score reporter v1
   Loaded by a game page (one tag in <head>):
     <script src="https://therapytoaster.github.io/tt-live/arcade/hs-report-v1.js" data-slug="SLUG"></script>
   Optional: data-ls-key="localStorage key" (+ data-ls-field="best" when the value is JSON) makes it
   watch the game's own saved best score; otherwise the game calls window.__ttHS(score) at game over.
   Shared record: Abacus counter therapytoaster/hiscore-<slug>. A score is written only when it beats
   the stored record (read, compare, set). The page also tells its parent frame:
     postMessage({tt:"hiscore", slug, score: <record>, mine: <this score>}, "*")
   Caveat: the write token has to live in this public file, so anyone determined could post a fake
   number. Scores above CAP or non-integers are ignored. Never throws, never logs. */
(function(){
  if (window.__ttHSReporter) return;
  window.__ttHSReporter = 1;
  var me = document.currentScript;
  function attr(n){ try { return (me && me.getAttribute(n)) || ""; } catch(e) { return ""; } }
  var slug = attr("data-slug");
  var lsKey = attr("data-ls-key"), lsField = attr("data-ls-field");
  var T = window.__ttHSTest || null;
  var prefix = (T && T.prefix) || "";
  var TOK = {"hiscore-skullz":"7bed766f-5cd0-4c81-9811-2be5ae6f0b67","hiscore-crypt":"48ea78d4-658a-41e1-ae0a-246f308187e9","hiscore-toaster-pit":"dcd4ffaa-78f9-4ac8-8aa8-de801286867b","hiscore-burnt-offerings":"1d4eb20a-2ece-44fe-b08e-873a8321b2c5","hiscore-crumb-dungeon":"496809da-06d5-4723-9672-33aa23c808f3","hiscore-prize-floor":"e7db62f7-e813-4a18-904f-c559b4e7d3f3","hiscore-mars":"148bbd6e-c7d2-417e-9f61-bbd0d33fa39c","hiscore-feed":"6e13914b-17ce-4e1c-ae9b-8ffd8db1ccdd","hiscore-bite":"337c603b-ca98-4cbc-abc0-9c74d13735cc","hiscore-tb":"152b34e3-ab67-4111-bbe2-d7c8a6d1c6c0"};
  var tokens = (T && T.tokens) || TOK;
  var BASE = "https://abacus.jasoncameron.dev", NS = "therapytoaster", CAP = 99999999;
  var key = (prefix + "hiscore-" + slug).slice(0, 64);
  var best = 0, busy = false, want = 0, record = -1;

  function tell(rec, mine){
    try { if (window.parent && window.parent !== window) window.parent.postMessage({ tt: "hiscore", slug: slug, score: rec, mine: mine }, "*"); } catch(e) {}
    try { window.dispatchEvent(new CustomEvent("tt-hiscore", { detail: { slug: slug, score: rec, mine: mine } })); } catch(e) {}
  }
  function call(op, extra){
    var url = BASE + "/" + op + "/" + NS + "/" + key + (extra || "");
    var ctl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function(){ try { if (ctl) ctl.abort(); } catch(e) {} }, 12000);
    return fetch(url, { method: op === "get" ? "GET" : "POST", mode: "cors", cache: "no-store", credentials: "omit", signal: ctl ? ctl.signal : undefined })
      .then(function(r){ clearTimeout(t); if (op === "get" && r.status === 404) return { value: 0 }; if (!r.ok) throw 0; return r.json(); })
      .then(function(j){ var v = j && typeof j.value === "number" ? Math.floor(j.value) : NaN; if (!isFinite(v)) throw 0; return v; },
            function(e){ clearTimeout(t); throw e; });
  }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function retry(fn){ return fn()["catch"](function(){ return wait(1000).then(fn); })["catch"](function(){ return wait(3000).then(fn); }); }
  function pump(){
    if (busy || !want) return;
    var score = want; want = 0; busy = true;
    retry(function(){ return call("get"); }).then(function(cur){
      record = Math.max(record, cur);
      if (score <= cur) return cur;
      var tok = tokens[key];
      if (!tok) return cur;
      return retry(function(){ return call("set", "?value=" + score + "&token=" + encodeURIComponent(tok)); })
        .then(function(v){ record = Math.max(record, v); return v; });
    }).then(function(v){ tell(v, score); }, function(){ best = Math.min(best, score - 1); })
      .then(function(){ busy = false; if (want) pump(); });
  }
  function submit(score){
    try {
      score = Number(score);
      if (!slug || !isFinite(score) || score <= 0 || score > CAP) return;
      score = Math.floor(score);
      if (score <= best || score <= record) return;
      best = score; want = Math.max(want, score); pump();
    } catch(e) {}
  }
  window.__ttHS = submit;

  if (lsKey) {
    var last = -1;
    var poll = function(){
      try {
        var raw = localStorage.getItem(lsKey); if (raw == null) return;
        var v = lsField ? (JSON.parse(raw) || {})[lsField] : raw;
        v = Number(v);
        if (isFinite(v) && v > last) { last = v; submit(v); }
      } catch(e) {}
    };
    setInterval(poll, 1500);
    setTimeout(poll, 300);
  }
})();
