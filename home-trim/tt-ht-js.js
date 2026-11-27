(function(){
  if(window.ttHtOk)return;window.ttHtOk=1;
  var P=(location.pathname||'/').replace(/\/+$/,'');
  if(P!==''&&P!=='/home'&&!/^(localhost|127\.0\.0\.1)$/.test(location.hostname))return;
  var SHA='8cfe651';
  var BASE='https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@'+SHA+'/site-trailer/';
  var GH='https://therapytoaster.github.io/tt-live/site-trailer/';
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVG_SPK='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="2,6 5.5,6 9.5,2.8 9.5,13.2 5.5,10 2,10" fill="currentColor" stroke="none"/><path d="M11.6 5.3a3.7 3.7 0 0 1 0 5.4"/><path d="M13.5 3.6a6 6 0 0 1 0 8.8"/></svg>';
  var SVG_MUTE='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="2,6 5.5,6 9.5,2.8 9.5,13.2 5.5,10 2,10" fill="currentColor" stroke="none"/><line x1="11.5" y1="5.5" x2="14.8" y2="10.5"/><line x1="14.8" y1="5.5" x2="11.5" y2="10.5"/></svg>';

  /* Muted trailer autoplay (or leftover glitchswap) must not kill #ttbgm Vibes.
     Unmuted / user-initiated audible play still reaches the existing capture listener. */
  window.addEventListener('play',function(e){
    var t=e.target;if(!t||!t.tagName)return;
    var tag=t.tagName;
    if(tag!=='VIDEO'&&tag!=='AUDIO')return;
    var src=((t.currentSrc||'')+' '+(t.getAttribute('src')||'')+' '+(t.getAttribute('poster')||'')).toLowerCase();
    var isTrailer=t.id==='tt-ht-vid';
    var isGlitch=src.indexOf('crt-glitchswap')!==-1;
    if(isGlitch||(isTrailer&&t.muted)){
      if(e.stopPropagation)e.stopPropagation();
      if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    }
  },true);

  function isGlitchNode(el){
    if(!el||el.nodeType!==1)return false;
    if(el.id==='tt-ht-vid'||(el.classList&&el.classList.contains('tt-crt-poster')))return false;
    if(el.closest&&el.closest('.tt-crt-glass'))return false;
    var blob=((el.getAttribute('src')||'')+' '+(el.getAttribute('poster')||'')+' '+(el.currentSrc||'')).toLowerCase();
    if(blob.indexOf('crt-glitchswap')!==-1)return true;
    if(el.tagName==='SOURCE'){
      var kids=el.parentNode&&el.parentNode.querySelectorAll?el.parentNode.querySelectorAll('source'):[];
      var i,s;
      for(i=0;i<kids.length;i++){s=(kids[i].getAttribute('src')||'').toLowerCase();if(s.indexOf('crt-glitchswap')!==-1)return true;}
    }
    var crt=document.getElementById('tt-crt');
    if(crt&&(el.tagName==='VIDEO'||el.tagName==='IMG')&&(el.parentNode===crt))return true;
    return false;
  }
  function neutralize(el){
    try{
      if(el.tagName==='VIDEO'||el.tagName==='AUDIO'){
        try{el.pause();}catch(e){}
        try{el.muted=true;el.defaultMuted=true;}catch(e){}
        try{el.removeAttribute('src');el.removeAttribute('poster');}catch(e){}
        var srcs=el.querySelectorAll?el.querySelectorAll('source'):[];
        for(var i=srcs.length-1;i>=0;i--){try{srcs[i].parentNode.removeChild(srcs[i]);}catch(e){}}
        try{el.play=function(){return Promise.resolve();};}catch(e){}
        try{el.load();}catch(e){}
      }
      if(el.tagName==='IMG'){try{el.removeAttribute('src');el.src='';}catch(e){}}
      if(el.parentNode)el.parentNode.removeChild(el);
    }catch(e){}
  }
  function scrubCrt(){
    var crt=document.getElementById('tt-crt');
    if(!crt)return;
    try{crt.style.setProperty('background-image',crt.classList.contains('tt-crt-tv')?'none':'url("'+BASE+'poster.jpg")','important');}catch(e){}
    var nodes=crt.querySelectorAll('video,img,source');
    var i,el;
    for(i=0;i<nodes.length;i++){
      el=nodes[i];
      if(isGlitchNode(el))neutralize(el);
    }
    var kids=crt.children;
    for(i=kids.length-1;i>=0;i--){
      el=kids[i];
      if((el.tagName==='VIDEO'||el.tagName==='IMG')&&el.id!=='tt-ht-vid'&&!(el.classList&&el.classList.contains('tt-crt-poster')))neutralize(el);
    }
  }
  var earlyMo=null;
  function startScrub(){
    scrubCrt();
    if(earlyMo||!window.MutationObserver)return;
    earlyMo=new MutationObserver(function(){scrubCrt();});
    var root=document.documentElement||document.body;
    if(root)earlyMo.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['src','poster']});
  }
  startScrub();

  function fmt(sec){
    sec=Math.max(0,Math.floor(sec||0));
    var m=Math.floor(sec/60),s=sec%60;
    return (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  }

  function upgrade(){
    var col=document.getElementById('tt-crt-col');
    var crt=document.getElementById('tt-crt');
    if(!col||!crt)return false;
    if(crt.getAttribute('data-tt-crt-tv')==='1'){scrubCrt();return true;}
    crt.setAttribute('data-tt-crt-tv','1');
    crt.classList.add('tt-crt-tv');
    crt.setAttribute('aria-label','Old CRT TV and VCR player for the Therapy Toaster site trailer');
    scrubCrt();

    var bezel=document.createElement('div');
    bezel.className='tt-crt-bezel';
    var glass=document.createElement('div');
    glass.className='tt-crt-glass';
    glass.setAttribute('role','button');
    glass.setAttribute('tabindex','0');
    glass.setAttribute('aria-label','Therapy Toaster site trailer on CRT TV. Click to unmute or mute.');

    var posterImg=document.createElement('img');
    posterImg.className='tt-crt-poster';
    posterImg.src=BASE+'poster.jpg';
    posterImg.alt='Mr. Toasty\'s Therapy Toaster trailer poster';
    posterImg.decoding='async';
    glass.appendChild(posterImg);

    var vid=document.createElement('video');
    vid.id='tt-ht-vid';
    vid.width=1280;
    vid.height=720;
    vid.poster=BASE+'poster.jpg';
    vid.muted=true;
    vid.defaultMuted=true;
    vid.setAttribute('muted','');
    vid.loop=true;
    vid.setAttribute('loop','');
    vid.autoplay=!RM;
    if(!RM)vid.setAttribute('autoplay','');
    vid.playsInline=true;
    vid.setAttribute('playsinline','');
    vid.setAttribute('webkit-playsinline','');
    vid.preload='auto';
    vid.setAttribute('controlslist','nodownload');
    vid.setAttribute('aria-label','Mr. Toasty\'s Therapy Toaster trailer');
    var s1=document.createElement('source');s1.src=BASE+'trailer-720p.mp4';s1.type='video/mp4';
    var s2=document.createElement('source');s2.src=GH+'trailer-720p.mp4';s2.type='video/mp4';
    vid.appendChild(s1);vid.appendChild(s2);
    glass.appendChild(vid);

    var scan=document.createElement('div');scan.className='tt-crt-scan';scan.setAttribute('aria-hidden','true');
    var curve=document.createElement('div');curve.className='tt-crt-curve';curve.setAttribute('aria-hidden','true');
    var ch=document.createElement('div');ch.className='tt-crt-ch';ch.textContent='AV1 · PLAY';
    var cta=document.createElement('div');cta.className='tt-crt-cta';cta.textContent='🔇 TAP FOR SOUND';
    glass.appendChild(scan);glass.appendChild(curve);glass.appendChild(ch);glass.appendChild(cta);
    bezel.appendChild(glass);

    var chin=document.createElement('div');
    chin.className='tt-crt-chin';
    chin.innerHTML=
      '<span class="tt-crt-brand"><i class="tt-crt-led" aria-hidden="true"></i>TOASTY-TV</span>'+
      '<span class="tt-crt-dials" aria-hidden="true"><i class="tt-crt-vents"></i><i class="tt-crt-knob"></i><i class="tt-crt-knob"></i></span>';

    /* Wipe any leftover header-bg media, then mount our CRT face */
    crt.innerHTML='';
    crt.appendChild(bezel);
    crt.appendChild(chin);
    try{crt.style.setProperty('background-image','none','important');}catch(e){}

    var vcr=document.getElementById('tt-vcr');
    if(!vcr){
      vcr=document.createElement('section');
      vcr.id='tt-vcr';
      vcr.setAttribute('aria-label','VCR controls for Therapy Toaster trailer');
      vcr.innerHTML=
        '<div class="vcr-top">'+
          '<div class="vcr-slot">'+
            '<div class="vcr-tape"><span class="vcr-reel" aria-hidden="true"></span><span class="vcr-label">VHS // TRAILER</span></div>'+
          '</div>'+
          '<div class="vcr-led" aria-live="polite">'+
            '<div class="vcr-led-top"><span class="vcr-led-st">PLAY</span><span class="vcr-led-mute">MUTE</span></div>'+
            '<div class="vcr-led-time">00:00</div>'+
          '</div>'+
        '</div>'+
        '<div class="vcr-keys">'+
          '<button type="button" class="vcr-btn" data-vcr="rew" title="Rewind 5 seconds" aria-label="Rewind 5 seconds"><span class="vcr-ic">&#9668;&#9668;</span><span class="vcr-tx">REW</span></button>'+
          '<button type="button" class="vcr-btn" data-vcr="play" title="Play or pause trailer" aria-label="Play or pause trailer"><span class="vcr-ic">&#9654;</span><span class="vcr-tx">PLAY</span></button>'+
          '<button type="button" class="vcr-btn" data-vcr="stop" title="Stop and show trailer poster" aria-label="Stop trailer"><span class="vcr-ic">&#9632;</span><span class="vcr-tx">STOP</span></button>'+
          '<button type="button" class="vcr-btn" data-vcr="ff" title="Fast forward 5 seconds" aria-label="Fast forward 5 seconds"><span class="vcr-ic">&#9658;&#9658;</span><span class="vcr-tx">FF</span></button>'+
          '<button type="button" class="vcr-btn" data-vcr="eject" title="Eject tape" aria-label="Eject tape"><span class="vcr-ic">&#9167;</span><span class="vcr-tx">EJECT</span></button>'+
          '<button type="button" class="vcr-btn" data-vcr="mute" title="Mute or unmute" aria-label="Toggle mute"><span class="vcr-ic">'+SVG_MUTE+'</span><span class="vcr-tx">MUTE</span></button>'+
          '<button type="button" class="vcr-btn" data-vcr="full" title="Fullscreen" aria-label="Fullscreen trailer"><span class="vcr-ic">&#9974;</span><span class="vcr-tx">FULL</span></button>'+
        '</div>'+
        '<div class="vcr-foot"><span><b>PROUDLY VETERAN-OWNED</b></span><span>THERAPYTOASTER.COM</span></div>';
    }
    if(crt.nextSibling)col.insertBefore(vcr,crt.nextSibling);
    else col.appendChild(vcr);

    var state=RM?'stopped':'playing'; /* 'playing' | 'paused' | 'stopped' */
    var wantSound=false;
    var ledSt=vcr.querySelector('.vcr-led-st');
    var ledTime=vcr.querySelector('.vcr-led-time');
    var labelEl=vcr.querySelector('.vcr-label');
    var btnPlay=vcr.querySelector('[data-vcr="play"]');
    var btnStop=vcr.querySelector('[data-vcr="stop"]');
    var btnMute=vcr.querySelector('[data-vcr="mute"]');
    var flashTimer=0,ejectTimer=0,inView=true;

    function flash(){
      if(RM)return;
      crt.classList.remove('tt-tv-flash');
      void crt.offsetWidth;
      crt.classList.add('tt-tv-flash');
      clearTimeout(flashTimer);
      flashTimer=setTimeout(function(){crt.classList.remove('tt-tv-flash');},300);
    }

    function syncUI(overrideStatus){
      var playing=(state==='playing');
      var inTrailer=(state==='playing'||state==='paused');
      var muted=!!vid.muted;
      crt.classList.toggle('tt-tv-trailer',inTrailer);
      crt.classList.toggle('tt-tv-paused',state==='paused');
      crt.classList.toggle('tt-tv-stopped',state==='stopped');
      crt.classList.toggle('tt-tv-muted',muted);
      var showBadge=false;
      if(state==='stopped'){
        cta.textContent='TAP TO PLAY';
        showBadge=true;
      }else if(playing&&muted){
        cta.textContent='🔇 TAP FOR SOUND';
        showBadge=true;
      }else{
        cta.textContent='🔇 TAP FOR SOUND';
        showBadge=false;
      }
      crt.classList.toggle('tt-tv-show-badge',showBadge);

      vcr.classList.toggle('vcr-playing',playing);
      vcr.classList.toggle('vcr-ejected',state==='stopped'&&overrideStatus==='EJECT');
      vcr.classList.toggle('vcr-muted',muted);

      btnPlay.classList.toggle('is-on',playing);
      btnPlay.querySelector('.vcr-ic').innerHTML=playing?'&#10074;&#10074;':'&#9654;';
      btnPlay.querySelector('.vcr-tx').textContent=playing?'PAUSE':'PLAY';
      btnStop.classList.toggle('is-on',state==='stopped');
      btnMute.classList.toggle('is-on',muted);
      btnMute.querySelector('.vcr-ic').innerHTML=muted?SVG_MUTE:SVG_SPK;

      labelEl.textContent=(overrideStatus==='EJECT'||overrideStatus==='NO TAPE')?'NO TAPE':'VHS // TRAILER';
      ch.textContent=state==='stopped'?(overrideStatus==='EJECT'||overrideStatus==='NO TAPE'?'AV1 · EJECT':'AV1 · STOP'):(playing?'AV1 · PLAY':'AV1 · PAUSE');
      ledSt.textContent=overrideStatus||(state==='stopped'?'STOP':state==='paused'?'PAUSE':'PLAY');
      ledTime.textContent=fmt(vid.currentTime);
    }

    function tellVibesAudible(){
      try{vid.dispatchEvent(new Event('play',{bubbles:true}));}catch(e){}
    }

    function setMuted(m){
      var was=!!vid.muted;
      vid.muted=!!m;
      if(!m)wantSound=true;
      else wantSound=false;
      syncUI();
      if(was&&!vid.muted&&state==='playing')tellVibesAudible();
    }

    function startPlay(){
      clearTimeout(ejectTimer);
      vid.muted=!wantSound;
      state='playing';
      syncUI('PLAY');
      var p=vid.play();
      if(p&&p.catch)p.catch(function(){
        vid.muted=true;wantSound=false;
        var p2=vid.play();
        if(p2&&p2.catch)p2.catch(function(){state='paused';syncUI('PAUSE');});
        else syncUI('PLAY');
      });
    }

    function pauseTrailer(){
      try{vid.pause();}catch(e){}
      state='paused';
      syncUI('PAUSE');
    }

    function stopTrailer(asEject){
      clearTimeout(ejectTimer);
      if(!asEject)flash();
      try{vid.pause();vid.currentTime=0;}catch(e){}
      state='stopped';
      syncUI(asEject?'EJECT':'STOP');
    }

    function ejectTape(){
      flash();
      stopTrailer(true);
      if(RM){
        syncUI('NO TAPE');
        return;
      }
      ejectTimer=setTimeout(function(){
        startPlay();
      },800);
    }

    function seekDelta(d){
      if(state==='stopped'){
        state='paused';
      }
      var dur=isFinite(vid.duration)&&vid.duration>0?vid.duration:34;
      try{vid.currentTime=Math.max(0,Math.min(dur,vid.currentTime+d));}catch(e){}
      syncUI(d<0?'REW':'FF');
      setTimeout(function(){if(state==='playing'||state==='paused')syncUI();},600);
    }

    function togglePlay(){
      if(state==='playing')pauseTrailer();
      else startPlay();
    }

    function onScreenClick(){
      if(state==='stopped'||state==='paused'){
        if(RM||state==='stopped')wantSound=true;
        startPlay();
        return;
      }
      /* Playing: first click (and later clicks) toggle mute. Pause lives on VCR PLAY/PAUSE. */
      setMuted(!vid.muted);
    }

    glass.addEventListener('click',function(){onScreenClick();});
    glass.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();onScreenClick();}
    });

    vcr.addEventListener('click',function(e){
      var b=e.target&&e.target.closest&&e.target.closest('[data-vcr]');
      if(!b)return;
      var act=b.getAttribute('data-vcr');
      if(act==='play')togglePlay();
      else if(act==='stop')stopTrailer(false);
      else if(act==='rew')seekDelta(-5);
      else if(act==='ff')seekDelta(5);
      else if(act==='eject')ejectTape();
      else if(act==='mute')setMuted(!vid.muted);
      else if(act==='full'){
        if(state==='stopped'||state==='paused')startPlay();
        var req=vid.requestFullscreen||vid.webkitRequestFullscreen||vid.webkitEnterFullscreen;
        if(req){try{req.call(vid);}catch(err){}}
      }
    });

    vid.addEventListener('timeupdate',function(){
      if(state==='playing'||state==='paused')ledTime.textContent=fmt(vid.currentTime);
    });
    vid.addEventListener('ended',function(){
      if(vid.loop)return;
      try{vid.currentTime=0;if(state==='playing')vid.play();}catch(e){}
    });

    if(window.IntersectionObserver){
      var io=new IntersectionObserver(function(entries){
        var hit=false,i;
        for(i=0;i<entries.length;i++)if(entries[i].isIntersecting)hit=true;
        inView=hit;
        if(!inView){
          if(state==='playing'&&!vid.paused){try{vid.pause();}catch(e){}}
        }else if(state==='playing'&&vid.paused&&!RM){
          var p=vid.play();if(p&&p.catch)p.catch(function(){});
        }
      },{root:null,rootMargin:'80px 0px',threshold:0.15});
      io.observe(crt);
    }

    if(RM){
      try{vid.pause();vid.currentTime=0;}catch(e){}
      state='stopped';
      syncUI('STOP');
    }else{
      startPlay();
    }
    return true;
  }

  function boot(){
    startScrub();
    if(upgrade())return;
    var tries=0;
    var tid=setInterval(function(){
      startScrub();
      if(upgrade()||++tries>80)clearInterval(tid);
    },80);
    if(window.MutationObserver&&(document.body||document.documentElement)){
      var mo=new MutationObserver(function(){if(upgrade()){/* keep earlyMo to block glitchswap re-adds */}});
      mo.observe(document.documentElement||document.body,{childList:true,subtree:true});
      setTimeout(function(){try{mo.disconnect();}catch(e){}},15000);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();