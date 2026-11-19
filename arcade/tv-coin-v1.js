/* TT ARCADE TV COIN v1
   Click, tap, or keyboard-activate the intro TV to play the Home
   coin-slot clink (same WebAudio recipe as coinslot/ttus clink) and
   smooth-scroll to the top of the game cards. Does not change intro
   playback, intro-hold, the TV frame, or the player Open/Stop controls.
   Usage (append to the ARTcade block, after intro-tv.js):
     <script src="https://therapytoaster.github.io/tt-live/arcade/tv-coin-v1.js?c=SHA"></script>
*/
(function(){
  var root=document.getElementById('tt-arc');
  if(!root||root.getAttribute('data-tt-tv-coin')||root.querySelector('.tt-tv-coin'))return;

  function headerOffset(){
    var pad=8;
    var header=document.getElementById('header')||document.querySelector('.header');
    if(!header)return pad;
    var st=window.getComputedStyle(header);
    var r=header.getBoundingClientRect();
    if(st.position==='fixed'||st.position==='sticky'){
      return Math.max(pad, Math.round(r.bottom>0?r.bottom:r.height)+pad);
    }
    return pad;
  }

  function gamesTarget(){
    return root.querySelector('.tt-ns')||root.querySelector('.ta-grid');
  }

  function scrollToGames(){
    var target=gamesTarget();
    if(!target)return;
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top=target.getBoundingClientRect().top+window.pageYOffset-headerOffset();
    if(top<0)top=0;
    try{
      window.scrollTo({top:top,behavior:reduce?'auto':'smooth'});
    }catch(e){
      window.scrollTo(0,top);
    }
  }

  /* Same two-tone clink as the Home coin slot (apply_coinslot.py).
     Always plays on this explicit gesture (not gated by ttCoinSfx). */
  function clink(){
    try{
      var AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return;
      var C=new AC();
      if(C.resume)C.resume();
      [1800,2600].forEach(function(f,i){
        var o=C.createOscillator(),g=C.createGain();
        o.frequency.value=f;
        g.gain.setValueAtTime(.18,C.currentTime+i*.06);
        g.gain.exponentialRampToValueAtTime(.001,C.currentTime+i*.06+.25);
        o.connect(g);g.connect(C.destination);
        o.start(C.currentTime+i*.06);
        o.stop(C.currentTime+i*.06+.3);
      });
    }catch(e){}
  }

  function onInsert(){
    clink();
    scrollToGames();
  }

  function injectStyle(){
    if(document.getElementById('tt-tv-coin-css'))return;
    var st=document.createElement('style');
    st.id='tt-tv-coin-css';
    st.textContent=
      '#tt-arc .tt-tv-well{position:relative}'+
      '#tt-arc .tt-tv-coin{position:absolute;inset:0;z-index:5;display:block;width:100%;height:100%;margin:0;padding:0;border:0;border-radius:inherit;background:transparent;cursor:pointer;color:inherit;font:inherit;appearance:none;-webkit-appearance:none}'+
      '#tt-arc .tt-tv-coin:focus{outline:none}'+
      '#tt-arc .tt-tv-coin:focus-visible{outline:2px solid #FFD400;outline-offset:-6px}'+
      '#tt-arc .tt-tv-coin-hint{position:absolute;left:50%;bottom:9%;transform:translateX(-50%);padding:6px 10px;border:2px solid #FFD400;background:#000;color:#FFD400;font:800 11px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap;opacity:0;pointer-events:none;box-shadow:0 0 12px rgba(255,212,0,.28);transition:opacity .15s ease}'+
      '#tt-arc .tt-tv-coin:hover .tt-tv-coin-hint,'+
      '#tt-arc .tt-tv-coin:focus-visible .tt-tv-coin-hint{opacity:1}'+
      '@media (hover:none){#tt-arc .tt-tv-coin-hint{opacity:.92}}'+
      '@media (prefers-reduced-motion:reduce){#tt-arc .tt-tv-coin-hint{transition:none}}';
    document.documentElement.appendChild(st);
  }

  function start(){
    if(root.getAttribute('data-tt-tv-coin')||root.querySelector('.tt-tv-coin'))return true;
    var tv=root.querySelector('.tt-tv');
    if(!tv)return false;
    var well=tv.querySelector('.tt-tv-well')||tv;
    root.setAttribute('data-tt-tv-coin','1');
    injectStyle();
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='tt-tv-coin';
    btn.setAttribute('aria-label','Insert coin and jump to the games');
    var hint=document.createElement('span');
    hint.className='tt-tv-coin-hint';
    hint.setAttribute('aria-hidden','true');
    hint.textContent='INSERT COIN \u25BC';
    btn.appendChild(hint);
    well.appendChild(btn);
    btn.addEventListener('click',onInsert);
    return true;
  }

  if(start())return;
  var n=0,t=setInterval(function(){
    if(start()||++n>40)clearInterval(t);
  },50);
})();
