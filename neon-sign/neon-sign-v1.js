/* TT NEON SIGN v1
   Sitewide strip immediately above the Squarespace footer (#footer-sections):
   Coty's neon "Mr. Toasty / Therapy Toaster" sign, autoplay muted loop.
   Load from Footer Code Injection AFTER gottem-box-v1.js:
     <script src="https://therapytoaster.github.io/tt-live/neon-sign/neon-sign-v1.js?v=1" defer></script>
   Idempotent. Skips the Squarespace editor iframe and /config. Targets
   #footer-sections only (never a generic <footer>) so /AshleySavvie's
   in-page <footer class="ash-foot"> is left alone. The copyright line
   inside #footer-sections stays below this strip. */
(function(){
  var W=window,D=document;
  if(W.__ttNeonSign)return;W.__ttNeonSign=1;
  try{if(W.self!==W.top)return;}catch(e){return;}
  var path=location.pathname||'';
  if(/\/config(\/|$)/.test(path))return;

  var BASE='https://therapytoaster.github.io/tt-live/neon-sign/';
  var V='?v=1';
  var MP4=BASE+'mr-toasty-neon.mp4'+V;
  var POSTER=BASE+'mr-toasty-neon-poster.jpg'+V;
  var ID='tt-neon-sign';

  function reduced(){
    return !!(W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function footerEl(){
    return D.getElementById('footer-sections')||
           D.querySelector('footer.sections[data-footer-sections]');
  }

  function injectCss(){
    if(D.getElementById('tt-neon-sign-css'))return;
    var s=D.createElement('style');
    s.id='tt-neon-sign-css';
    s.textContent=
      '#'+ID+'{box-sizing:border-box;width:100%;margin:0;padding:28px 20px 32px;'+
        'background:#000;text-align:center;position:relative;z-index:2;clear:both}'+
      '#'+ID+' *,#'+ID+' *::before,#'+ID+' *::after{box-sizing:border-box}'+
      '#'+ID+' .tt-ns-in{display:block;width:100%;max-width:900px;margin:0 auto;'+
        'border-radius:10px;overflow:hidden;background:#05070d;'+
        'border:1px solid rgba(255,212,0,.7);'+
        'box-shadow:0 0 0 1px #000,0 0 18px rgba(255,212,0,.28),0 0 6px rgba(255,212,0,.4),inset 0 0 12px rgba(255,212,0,.08)}'+
      '#'+ID+' video,#'+ID+' img.tt-ns-poster{display:block;width:100%;height:auto;'+
        'aspect-ratio:16/9;object-fit:cover;background:#05070d;border:0;'+
        'pointer-events:none;-webkit-user-select:none;user-select:none}'+
      '@media (max-width:600px){#'+ID+'{padding:20px 14px 24px}#'+ID+' .tt-ns-in{border-radius:8px}}'+
      '@media (prefers-reduced-motion:reduce){#'+ID+' video{display:none!important}}';
    (D.head||D.documentElement).appendChild(s);
  }

  function makeVideo(){
    var vid=D.createElement('video');
    vid.setAttribute('muted','');
    vid.muted=true;
    vid.defaultMuted=true;
    vid.loop=true;
    vid.playsInline=true;
    vid.setAttribute('playsinline','');
    vid.setAttribute('webkit-playsinline','');
    vid.preload='metadata';
    vid.poster=POSTER;
    vid.controls=false;
    vid.setAttribute('aria-hidden','true');
    vid.setAttribute('disablepictureinpicture','');
    vid.setAttribute('controlslist','nodownload nofullscreen noremoteplayback');
    try{vid.disablePictureInPicture=true;}catch(e){}
    try{vid.disableRemotePlayback=true;}catch(e){}
    return vid;
  }

  function arm(wrap,vid){
    var armed=false;
    function start(){
      if(!vid.getAttribute('src')){
        vid.src=MP4;
        vid.setAttribute('src',MP4);
      }
      try{vid.muted=true;}catch(e){}
      var p=vid.play();if(p&&p.catch)p.catch(function(){});
      armed=true;
    }
    function stop(){
      try{vid.pause();}catch(e){}
    }
    if(!W.IntersectionObserver){start();return;}
    var io=new IntersectionObserver(function(entries){
      var e=entries&&entries[0];
      if(e&&e.isIntersecting)start();
      else if(armed)stop();
    },{root:null,rootMargin:'240px 0px',threshold:0.01});
    io.observe(wrap);
  }

  function mount(){
    if(D.getElementById(ID))return true;
    var foot=footerEl();
    if(!foot||!foot.parentNode)return false;
    injectCss();
    var wrap=D.createElement('div');
    wrap.id=ID;
    wrap.setAttribute('role','region');
    wrap.setAttribute('aria-label','Mr. Toasty neon sign');
    var frame=D.createElement('div');
    frame.className='tt-ns-in';
    if(reduced()){
      var img=D.createElement('img');
      img.className='tt-ns-poster';
      img.src=POSTER;
      img.alt='Neon sign reading Mr. Toasty Therapy Toaster';
      img.decoding='async';
      frame.appendChild(img);
    }else{
      var vid=makeVideo();
      frame.appendChild(vid);
      arm(wrap,vid);
    }
    wrap.appendChild(frame);
    foot.parentNode.insertBefore(wrap,foot);
    return true;
  }

  function boot(){
    if(mount())return;
    var tries=0;
    var t=setInterval(function(){
      tries++;
      if(mount()||tries>25)clearInterval(t);
    },200);
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
