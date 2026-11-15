/* TT matrix nav transition v4
   v4: same as v3, but the rain is half as long (390ms, then navigate; v3 was
   780ms) and the 0s and 1s fall and change noticeably slower. Fall speed is
   independent of the duration so shortening the clip does not speed the rain
   up. Glyphs stay put until a drop advances a row (v3 re-rolled 0/1 every
   frame). Safety timer still waits DURATION+7000ms.
   v3: fixes the back/forward bug — browsers (iPhone Safari, Chrome) restore the
   previous page from the back-forward cache with the rain overlay still on top,
   frozen, swallowing every click. The overlay is now cleared on pageshow, the
   rain keeps moving until the next page takes over (no frozen frame on slow
   loads), and a safety timer clears it if navigation never happens.
   Short yellow-on-black rain of 0s and 1s when a visitor clicks a site tab
   other than Home (desktop header nav + mobile menu links), then the new
   page loads. Links to Home — the Home tab, Home tiles, the site title/logo,
   and any href of "/" or "/home" — navigate immediately, with no rain.
   Nothing plays on page load or on a first visit.
   Skips new-tab / modified / external clicks, same-page links, and the
   Squarespace mobile-menu folder and Back controls so the menu keeps working.
   Respects prefers-reduced-motion (navigate immediately, no overlay).
   Works with the existing persist-audio soft-nav: if Toaster Radio is playing,
   the rain runs over the current page, the soft swap happens, then the overlay
   fades off the new page. Overlay is mounted on <html> so the soft-nav body
   cleanup cannot delete it mid-rain.

   Load once from sitewide Footer Code Injection:
   <script src="https://therapytoaster.github.io/tt-live/site-transition/matrix-nav.js?c=SHORTSHA" defer></script>

   Optional: window.ttMatrixNavGo(url) — if it returns true, skip the real
   navigation (used by the local preview and proof shots).
   ?ttmatrix=hold or window.__ttMatrixHold — play the rain, stay on this page.
*/
(function(){
  'use strict';
  if(window.__ttMatrixNav)return;window.__ttMatrixNav=1;
  try{if(window.self!==window.top)return;}catch(e){return;}
  if(/\bsqs-edit-mode|squarespace-editor/.test(document.documentElement.className))return;

  var DURATION=390; /* rain length, then navigate (v3 was 780) */
  var FALL_MS=780;  /* v3 used DURATION*0.5=390; twice as slow now */
  var Z=2147483600;
  var STYLE_ID='tt-mxnav-css';
  var OV_ID='tt-mxnav';

  function holdOn(){
    try{if(window.__ttMatrixHold)return true;}catch(e){}
    try{return /[?&]ttmatrix=hold(?:&|$)/.test(location.search);}catch(e){return false;}
  }
  function reduced(){
    return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function norm(p){
    p=(p||'/').toLowerCase().replace(/\/+$/,'');
    return (p===''||p==='/home')?'/':p;
  }
  function isHomeUrl(href){
    try{
      var u=new URL(href,location.href);
      if(u.origin!==location.origin)return false;
      return norm(u.pathname)==='/';
    }catch(e){return false;}
  }

  /* Folder tab titles are <button>s (desktop) or <a data-folder-id> (mobile).
     TT FLAT NAV already turns those clicks into a navigation (/shop, /glitch-art).
     We intercept them too so they get the same rain, then go to the same URLs. */
  var FOLDER_GO={
    'mr-toastys-store':'/shop',
    '/mr-toastys-store':'/shop',
    'mr-toastys-art':'/glitch-art',
    '/mr-toastys-art':'/glitch-art'
  };
  function folderUrl(el){
    if(!el||!el.closest)return null;
    if(!el.closest('#header, header[data-test="header"]'))return null;
    var tab=el.closest('button.header-nav-folder-title, .header-nav-folder-title, a[data-folder-id]');
    if(!tab)return null;
    var id=tab.getAttribute('data-folder-id')||tab.getAttribute('data-href')||tab.getAttribute('aria-controls')||'';
    if(!id)return null;
    var path=FOLDER_GO[id]||FOLDER_GO[id.replace(/\/+$/,'')];
    if(!path)return null;
    if(norm(path)===norm(location.pathname))return null;
    try{return new URL(path,location.origin).href;}catch(e){return null;}
  }

  function isNavLink(a){
    if(!a||!a.getAttribute)return false;
    if(a.hasAttribute('download'))return false;
    if(a.target&&a.target!=='_self')return false;
    if(a.getAttribute('rel')==='external')return false;
    /* Squarespace mobile menu: folder titles toggle a submenu; Back returns to the root list */
    if(a.hasAttribute('data-folder-id'))return false;
    if(a.getAttribute('data-action')==='back')return false;
    if(a.classList&&a.classList.contains('header-menu-controls-control'))return false;
    if(a.closest&&a.closest('.header-nav-folder-title'))return false;
    var header=a.closest&&a.closest('#header, header[data-test="header"]');
    if(!header)return false;
    if(a.id==='site-title')return true;
    if(a.closest('.header-title-text, .header-title-logo'))return true;
    if(a.closest('.header-nav-list, .header-nav-folder-content, .header-menu-nav-list, .header-menu-nav-folder'))return true;
    return false;
  }

  function targetUrl(a,e){
    if(!a||!isNavLink(a))return null;
    if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return null;
    var raw=a.getAttribute('href')||'';
    if(/^\s*(#|mailto:|tel:|sms:|javascript:)/i.test(raw))return null;
    var u;try{u=new URL(a.href,location.href);}catch(x){return null;}
    if(!/^https?:$/.test(u.protocol))return null;
    if(u.origin!==location.origin)return null;
    if(norm(u.pathname)===norm(location.pathname)&&u.search===location.search)return null;
    return u.href;
  }

  function injectCSS(){
    if(document.getElementById(STYLE_ID))return;
    var s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=
      '#'+OV_ID+'{position:fixed;inset:0;z-index:'+Z+';pointer-events:auto;background:transparent;opacity:1}'+
      '#'+OV_ID+' canvas{position:absolute;inset:0;width:100%;height:100%;display:block}'+
      '@media (prefers-reduced-motion:reduce){#'+OV_ID+'{display:none!important}}';
    (document.head||document.documentElement).appendChild(s);
  }

  function playRain(onDone){
    injectCSS();
    var old=document.getElementById(OV_ID);
    if(old)old.remove();
    var ov=document.createElement('div');
    ov.id=OV_ID;
    ov.setAttribute('aria-hidden','true');
    var c=document.createElement('canvas');
    ov.appendChild(c);
    /* mount on <html>, not <body>, so persist-audio's soft-nav cleanup cannot remove it */
    document.documentElement.appendChild(ov);
    var ctx=c.getContext('2d');
    if(!ctx){onDone();return {cancel:function(){},fadeOut:function(){onDone();}};}
    var dpr=Math.min(window.devicePixelRatio||1,2),W,H,fs,cols,rows,y,sp,ch,prev,lastR,hold,hx,t0,last,raf=0,done=false,fired=false;

    function size(){
      W=ov.clientWidth||innerWidth;H=ov.clientHeight||innerHeight;
      c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      hold=document.createElement('canvas');hold.width=c.width;hold.height=c.height;
      hx=hold.getContext('2d');hx.setTransform(dpr,0,0,dpr,0,0);
      fs=W<768?14:18;cols=Math.ceil(W/fs);rows=Math.ceil(H/fs)+1;
      y=[];sp=[];ch=[];prev=[];lastR=[];
      for(var i=0;i<cols;i++){
        y[i]=-Math.random()*rows*0.35;
        sp[i]=(rows*1.4)/FALL_MS*(0.7+Math.random()*0.65);
        ch[i]=Math.random()<0.5?'0':'1';
        prev[i]=ch[i];
        lastR[i]=-999;
      }
      ctx.font=hx.font='700 '+fs+'px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
      ctx.textBaseline=hx.textBaseline='top';
    }
    size();
    t0=performance.now();last=t0;

    function frame(now){
      if(done)return;
      var t=(now-t0)/DURATION,dt=Math.max(8,now-last);last=now;
      hx.globalCompositeOperation='destination-out';
      hx.fillStyle='rgba(0,0,0,'+Math.min(1,0.10*dt/16)+')';
      hx.fillRect(0,0,W,H);
      hx.globalCompositeOperation='source-over';
      for(var k=0;k<cols;k++){
        y[k]+=sp[k]*dt;
        var r=Math.floor(y[k]),x=k*fs;
        if(r!==lastR[k]){
          prev[k]=ch[k];
          ch[k]=Math.random()<0.5?'0':'1';
          lastR[k]=r;
        }
        if(r>=-1){
          hx.fillStyle='rgba(255,212,0,.55)';
          hx.fillText(prev[k],x,(r-1)*fs);
          hx.fillStyle='#FFF6B0';
          hx.shadowColor='#FFD400';
          hx.shadowBlur=8;
          hx.fillText(ch[k],x,r*fs);
          hx.shadowBlur=0;
        }
        if(r>rows){y[k]=-Math.random()*5;lastR[k]=-999;}
      }
      ctx.clearRect(0,0,W,H);
      /* current page stays visible under the first droplets, then black fills in */
      ctx.globalAlpha=Math.min(1,t/0.16);
      ctx.fillStyle='#000';
      ctx.fillRect(0,0,W,H);
      ctx.globalAlpha=1;
      ctx.drawImage(hold,0,0,W,H);
      if(t>=1&&!fired){fired=true;try{onDone();}catch(e){}}
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);

    function cancel(){
      if(done)return;done=true;cancelAnimationFrame(raf);
      if(ov&&ov.parentNode)ov.remove();
    }
    function fadeOut(){
      if(!ov||!ov.parentNode){if(!done){done=true;cancelAnimationFrame(raf);}return;}
      if(!done){done=true;cancelAnimationFrame(raf);}
      ov.style.transition='opacity .16s ease';
      ov.style.opacity='0';
      setTimeout(function(){if(ov&&ov.parentNode)ov.remove();},180);
    }
    return {cancel:cancel,fadeOut:fadeOut,el:ov};
  }

  function playingPersistedAudio(){
    /* Only Toaster Radio / Area54 (the persist-audio players). Do NOT treat
       the muted autoplay header clip, or any other page video, as "music is
       playing" — that would start persist-audio's soft-nav, and if it falls
       back it would hard-navigate in the middle of the rain. */
    if(typeof window.__ttpaSoft!=='function')return false;
    var nodes=document.querySelectorAll('#ttpa audio, #ttpa video, #ttmp audio, #ttmp video, audio[src*="suno.ai"], audio[src*="radio.co"], video[src*="suno.ai"], source[src*="suno.ai"], source[src*="radio.co"]');
    for(var i=0;i<nodes.length;i++){
      var m=nodes[i].tagName==='SOURCE'?nodes[i].parentElement:nodes[i];
      if(m&&!m.paused&&!m.ended&&document.contains(m))return true;
    }
    return false;
  }

  function canSoft(){
    return playingPersistedAudio();
  }

  function navigate(url){
    try{
      if(typeof window.ttMatrixNavGo==='function'&&window.ttMatrixNavGo(url)===true){
        var ctl=window.__ttMatrixCtl;
        if(ctl&&ctl.fadeOut)ctl.fadeOut();
        window.__ttMatrixBusy=0;
        return;
      }
    }catch(e){}
    if(holdOn()){
      var c2=window.__ttMatrixCtl;
      if(c2&&c2.fadeOut)c2.fadeOut();
      window.__ttMatrixBusy=0;
      return;
    }
    location.href=url;
  }

  var safety=0;
  function clearAll(){
    clearTimeout(safety);safety=0;
    var ctl=window.__ttMatrixCtl;window.__ttMatrixCtl=null;
    if(ctl&&ctl.cancel)ctl.cancel();
    var ov=document.getElementById(OV_ID);if(ov)ov.remove();
    window.__ttMatrixBusy=0;
  }
  /* back/forward cache restore (iOS Safari swipe-back, Back button): the page
     comes back exactly as we left it, overlay included — wipe it */
  function closeMobileMenu(){
    try{
      if(!/\bheader--menu-open\b/.test(document.body.className))return;
      var bs=document.querySelectorAll('.header-burger-btn');
      for(var i=0;i<bs.length;i++){if(bs[i].offsetParent!==null){bs[i].click();return;}}
    }catch(e){}
  }
  window.addEventListener('pageshow',function(e){
    var ours=!!(document.getElementById(OV_ID)||window.__ttMatrixBusy);
    if(e.persisted||ours)clearAll();
    if(e.persisted&&ours)closeMobileMenu();
  });

  function start(url){
    if(isHomeUrl(url)){navigate(url);return;}
    if(window.__ttMatrixBusy)return;
    window.__ttMatrixBusy=1;
    if(reduced()){window.__ttMatrixBusy=0;navigate(url);return;}

    var ctl;
    function finishSoft(){
      if(ctl&&ctl.fadeOut)ctl.fadeOut();else{var ov=document.getElementById(OV_ID);if(ov)ov.remove();}
      window.__ttMatrixBusy=0;
    }
    ctl=playRain(function(){
      /* start persist-audio soft-nav only after the rain, and only if radio is actually playing */
      if(canSoft()){
        var settled=false;
        function onNav(){
          if(settled)return;settled=true;
          document.removeEventListener('ttpa:navigated',onNav);
          finishSoft();
        }
        document.addEventListener('ttpa:navigated',onNav);
        try{window.__ttpaSoft(url,true);}catch(e){document.removeEventListener('ttpa:navigated',onNav);navigate(url);return;}
        setTimeout(function(){if(!settled){document.removeEventListener('ttpa:navigated',onNav);navigate(url);}},1200);
        return;
      }
      navigate(url);
    });
    window.__ttMatrixCtl=ctl;
    /* if the new page never takes over (blocked nav, offline, download), give the page back */
    clearTimeout(safety);
    safety=setTimeout(function(){
      var c3=window.__ttMatrixCtl;window.__ttMatrixCtl=null;
      if(c3&&c3.fadeOut)c3.fadeOut();
      window.__ttMatrixBusy=0;
    },DURATION+7000);
  }

  document.addEventListener('click',function(e){
    if(e.defaultPrevented)return;
    if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target&&e.target.closest&&e.target.closest('a[href]');
    var url=targetUrl(a,e);
    if(!url)url=folderUrl(e.target);
    if(!url)return;
    /* Home tab, logo, tiles, or any "/" / "/home" link: no rain, normal nav */
    if(isHomeUrl(url))return;
    /* take over the click completely so Squarespace / other footer
       handlers cannot start a navigation underneath the rain */
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    start(url);
  },true);

  window.ttMatrixNav={start:start,playRain:playRain,duration:DURATION};
})();
