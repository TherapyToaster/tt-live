/* TT GOTTEM BOX v1
   Home name plaque (#block-ce8c64bf8e02f0133163 / 〽️®️ Ƭᴏᴀsᴛʏ🎭):
   clicking anywhere on the visible box (desktop h1 frame, mobile
   caution-stripe block) pops a HA GOTTEM meme and plays the existing
   "HA GOTTEM" clip. Extends TT GOTTEM v1 in header-bg.js rather than
   replacing it: merch-card / announcement-bar / wall-R clicks stay as
   they are (clip + wiggle only). One click = one clip + one meme.
   The v1 hero matcher required "Therapy Space" in the h1, which is
   gone; this file also re-arms the ® in this block so the old clip
   still fires when the R itself is hit.
   Load AFTER header-bg.js from Footer Code Injection:
     <script src="https://therapytoaster.github.io/tt-live/site-header/gottem-box-v1.js?v=1" defer></script>
   Does nothing inside the Squarespace editor iframe. */
(function(){
  var W=window,D=document;
  if(W.__ttGottemBox)return;W.__ttGottemBox=1;
  try{if(W.self!==W.top)return;}catch(e){return;}

  var BASE='https://therapytoaster.github.io/tt-live/site-header/sfx/gottem';
  var V='?v=1';
  var FE='.fe-block-ce8c64bf8e02f0133163';
  var ID='block-ce8c64bf8e02f0133163';
  var CLS='tt-gotr';
  var HOLD=2000;
  var HOLD_REDUCED=1600;
  var audio=null,pop=null,timer=0;

  function isHome(){
    var p=(location.pathname||'/').replace(/\/+$/,'')||'/';
    return p==='/'||p==='/home'||(D.body&&D.body.classList.contains('homepage'));
  }
  function reduced(){
    return !!(W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function desk(){return (W.innerWidth||D.documentElement.clientWidth||320)>=768;}

  function getAudio(){
    if(audio)return audio;
    audio=new Audio();
    var mp3=audio.canPlayType&&audio.canPlayType('audio/mpeg');
    audio.src=BASE+(mp3?'.mp3':'.ogg')+V;
    audio.preload='auto';
    audio.setAttribute('data-tt-gottem-box','1');
    return audio;
  }
  function playClip(){
    var a=getAudio();
    try{a.pause();a.currentTime=0;}catch(e){}
    var p=a.play();if(p&&p.catch)p.catch(function(){});
  }
  /* v1 GOTTEM already played if the tap landed on a wired ® */
  function alreadyPlayed(t){
    return !!(t&&t.closest&&t.closest('.'+CLS));
  }

  function css(){
    if(D.getElementById('tt-gottem-box-css'))return;
    var s=D.createElement('style');s.id='tt-gottem-box-css';
    s.textContent=
      FE+' h1[data-tt-gottem-box],#'+ID+' h1[data-tt-gottem-box]{'+
        'cursor:pointer!important;-webkit-tap-highlight-color:transparent}'+
      '@media screen and (max-width:767px){'+FE+'[data-tt-gottem-box]{cursor:pointer!important;-webkit-tap-highlight-color:transparent}}'+
      '#'+ID+' h1[data-tt-gottem-box] .'+CLS+','+
      '#'+ID+' h1[data-tt-gottem-box] .tt-blackr{cursor:pointer!important}'+
      '#tt-gottem-pop{position:fixed;inset:0;z-index:2147483500;display:flex;align-items:center;justify-content:center;'+
        'opacity:0;visibility:hidden;pointer-events:none;transition:opacity .18s ease,visibility 0s linear .18s}'+
      '#tt-gottem-pop.on{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .12s ease}'+
      '#tt-gottem-pop .tt-gp-bg{position:absolute;inset:0;background:'+
        'repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 3px),rgba(0,0,0,.86)}'+
      '#tt-gottem-pop .tt-gp-card{position:relative;text-align:center;padding:4vh 6vw;max-width:96vw;'+
        'transform-origin:50% 50%;color:#FFD400;font-family:Anton,Impact,"Arial Black",sans-serif;'+
        'text-transform:uppercase;letter-spacing:.02em;filter:drop-shadow(0 0 18px rgba(255,212,0,.45))}'+
      '#tt-gottem-pop.on .tt-gp-card{animation:ttGpSlam .45s cubic-bezier(.15,1.4,.3,1) both}'+
      '#tt-gottem-pop .tt-gp-hand{display:block;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;'+
        'font-size:clamp(64px,18vw,180px);line-height:1;margin:0 0 2vh;transform-origin:50% 60%;'+
        'filter:drop-shadow(0 0 12px rgba(255,212,0,.55))}'+
      '#tt-gottem-pop.on .tt-gp-hand{animation:ttGpHand .5s cubic-bezier(.15,1.6,.3,1) both}'+
      '#tt-gottem-pop .tt-gp-ha,#tt-gottem-pop .tt-gp-got{position:relative;margin:0;line-height:.88;'+
        'font-weight:400;text-shadow:3px 0 0 rgba(255,40,60,.85),-3px 0 0 rgba(0,240,255,.75),0 0 18px rgba(255,212,0,.55)}'+
      '#tt-gottem-pop .tt-gp-ha{font-size:clamp(42px,12vw,120px)}'+
      '#tt-gottem-pop .tt-gp-got{font-size:clamp(64px,18vw,200px)}'+
      '#tt-gottem-pop .tt-gp-ha::before,#tt-gottem-pop .tt-gp-ha::after,'+
      '#tt-gottem-pop .tt-gp-got::before,#tt-gottem-pop .tt-gp-got::after{'+
        'content:attr(data-text);position:absolute;inset:0;pointer-events:none}'+
      '#tt-gottem-pop .tt-gp-ha::before,#tt-gottem-pop .tt-gp-got::before{color:#FF2840;text-shadow:none;transform:translate(-4px,1px);opacity:.7;z-index:-1}'+
      '#tt-gottem-pop .tt-gp-ha::after,#tt-gottem-pop .tt-gp-got::after{color:#00F0FF;text-shadow:none;transform:translate(4px,-1px);opacity:.7;z-index:-1}'+
      '#tt-gottem-pop.on .tt-gp-ha,#tt-gottem-pop.on .tt-gp-got{animation:ttGpGlitch 2s steps(2,end) 1}'+
      '#tt-gottem-pop .tt-gp-sub{margin:2.2vh 0 0;font:600 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;'+
        'letter-spacing:.42em;color:rgba(255,212,0,.75)}'+
      '@keyframes ttGpSlam{0%{transform:scale(.35) rotate(-6deg);opacity:0}'+
        '60%{transform:scale(1.08) rotate(2deg);opacity:1}'+
        '80%{transform:scale(.97) rotate(-1deg)}'+
        '100%{transform:scale(1) rotate(0)}}'+
      '@keyframes ttGpHand{0%{transform:scale(.2) rotate(-25deg);opacity:0}'+
        '55%{transform:scale(1.2) rotate(8deg);opacity:1}'+
        '100%{transform:scale(1) rotate(0)}}'+
      '@keyframes ttGpGlitch{0%,20%,100%{transform:none}'+
        '22%{transform:translate(-6px,1px) skewX(-8deg)}'+
        '24%{transform:translate(5px,-2px)}'+
        '26%{transform:none}'+
        '62%{transform:translate(4px,0) skewX(6deg)}'+
        '64%{transform:translate(-3px,1px)}'+
        '66%{transform:none}}'+
      'html.tt-gottem-pop-on,html.tt-gottem-pop-on body{overflow:hidden}'+
      '@media (prefers-reduced-motion:reduce){'+
        '#tt-gottem-pop.on .tt-gp-card,#tt-gottem-pop.on .tt-gp-hand,#tt-gottem-pop.on .tt-gp-ha,#tt-gottem-pop.on .tt-gp-got{animation:none!important}'+
        '#tt-gottem-pop{transition:none}}';
    (D.head||D.documentElement).appendChild(s);
  }

  function ensurePop(){
    if(pop&&pop.parentNode)return pop;
    pop=D.createElement('div');
    pop.id='tt-gottem-pop';
    pop.setAttribute('aria-hidden','true');
    pop.innerHTML=
      '<div class="tt-gp-bg"></div>'+
      '<div class="tt-gp-card" role="dialog" aria-label="HA GOTTEM">'+
        '<span class="tt-gp-hand" aria-hidden="true">👌</span>'+
        '<p class="tt-gp-ha" data-text="HA">HA</p>'+
        '<p class="tt-gp-got" data-text="GOTTEM">GOTTEM</p>'+
        '<p class="tt-gp-sub">GOTCHA</p>'+
      '</div>';
    pop.addEventListener('click',hide);
    (D.body||D.documentElement).appendChild(pop);
    return pop;
  }
  function show(){
    css();
    ensurePop();
    pop.classList.remove('on');
    void pop.offsetWidth;
    pop.classList.add('on');
    pop.setAttribute('aria-hidden','false');
    D.documentElement.classList.add('tt-gottem-pop-on');
    clearTimeout(timer);
    timer=setTimeout(hide,reduced()?HOLD_REDUCED:HOLD);
  }
  function hide(){
    if(!pop)return;
    pop.classList.remove('on');
    pop.setAttribute('aria-hidden','true');
    D.documentElement.classList.remove('tt-gottem-pop-on');
    clearTimeout(timer);timer=0;
  }

  function nameRoot(){
    return D.querySelector(FE)||D.getElementById(ID);
  }
  function nameH1(root){
    var r=root||nameRoot();
    return r?r.querySelector('h1'):null;
  }
  /* Desktop: only the visible h1 plaque (the fe-block grid cell is wide and
     must not steal Daily Glitch / Tag Wall clicks). Mobile: the caution box. */
  function hitFrom(t){
    if(!t||!t.closest)return null;
    if(t.closest('#ttpw-root,.ttpw-root,#tt-notice,#ttbgm,#tt-crt,#tt-crt-col,#tt-gottem-pop'))return null;
    var root=t.closest(FE)||t.closest('#'+ID);
    if(!root)return null;
    var h1=nameH1(root);
    if(!h1)return null;
    if(desk())return (t===h1||h1.contains(t))?h1:null;
    return root;
  }

  /* Re-arm the ® so header-bg.js v1 still plays the clip (its hero matcher
     looked for "Therapy Space", which is no longer in this heading). */
  function armR(h1){
    if(!h1)return;
    var blacks=h1.querySelectorAll('.tt-blackr');
    var i,x;
    if(blacks.length){
      for(i=0;i<blacks.length;i++){
        x=blacks[i];
        x.classList.add(CLS);
        x.setAttribute('tabindex','-1');
        x.removeAttribute('role');
        x.title='HA GOTTEM';
      }
      return;
    }
    if(h1.querySelector('.'+CLS)){
      [].forEach.call(h1.querySelectorAll('.'+CLS),function(el){
        el.setAttribute('tabindex','-1');
        el.removeAttribute('role');
      });
      return;
    }
    var w=D.createTreeWalker(h1,NodeFilter.SHOW_TEXT,null),n,list=[];
    while((n=w.nextNode())){
      if(n.nodeValue.indexOf('\u00AE')<0)continue;
      var p=n.parentNode;
      if(p&&p.classList&&(p.classList.contains(CLS)||p.classList.contains('tt-blackr')))continue;
      list.push(n);
    }
    list.forEach(function(node){
      var at;
      while(node&&(at=node.nodeValue.indexOf('\u00AE'))>-1){
        var len=(node.nodeValue.charAt(at+1)==='\uFE0F')?2:1;
        var r=node.splitText(at),rest=r.splitText(len);
        var s=D.createElement('span');s.className=CLS+' tt-blackr';
        s.setAttribute('tabindex','-1');s.title='HA GOTTEM';
        r.parentNode.replaceChild(s,r);s.appendChild(r);
        node=rest;
      }
    });
  }

  function onBox(e){
    if(!isHome())return;
    var hit=hitFrom(e.target);
    if(!hit)return;
    /* Do not stopPropagation: v1 GOTTEM (document capture, registered
       first) must still play+wiggle when the ® is the target. It uses
       stopPropagation, not stopImmediatePropagation, so this later
       document-capture listener still runs and only adds the meme. */
    if(!alreadyPlayed(e.target))playClip();
    show();
  }
  function onKey(e){
    if(!isHome())return;
    if(e.key!=='Enter'&&e.key!==' ')return;
    var hit=hitFrom(e.target);
    if(!hit)return;
    if(!alreadyPlayed(e.target))playClip();
    e.preventDefault();
    show();
  }

  function wire(){
    if(!isHome())return;
    css();
    var root=nameRoot();
    var h1=nameH1(root);
    if(!root||!h1)return;
    armR(h1);
    h1.setAttribute('data-tt-gottem-box','1');
    h1.setAttribute('role','button');
    h1.setAttribute('tabindex','0');
    h1.setAttribute('aria-label','HA GOTTEM');
    h1.title='HA GOTTEM';
    root.setAttribute('data-tt-gottem-box','1');
  }

  /* Document capture, registered after header-bg.js, so v1's ® handler
     runs first on the same target and this one still runs afterward. */
  D.addEventListener('click',onBox,true);
  D.addEventListener('keydown',function(e){
    if(e.key==='Escape'||e.key==='Esc'){hide();return;}
    onKey(e);
  },true);

  var q=0;
  function soon(){if(q)return;q=setTimeout(function(){q=0;wire();},250);}
  function boot(){
    wire();
    if(isHome())getAudio();
    try{new MutationObserver(function(){soon();}).observe(D.body||D.documentElement,{childList:true,subtree:true});}catch(e){}
    [300,1000,2500,5000].forEach(function(ms){setTimeout(wire,ms);});
    W.addEventListener('resize',soon);W.addEventListener('load',wire);
    ['mercury:load','mercury:navigate'].forEach(function(ev){
      W.addEventListener(ev,soon);D.addEventListener(ev,soon);
    });
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
})();
