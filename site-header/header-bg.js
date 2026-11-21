/* TT site header: OOK glitch background v6.1
   Same canvas as the Ashley Savvie / My One of a Kind glitch background
   (dark #05070d field, scanlines, grain, bursts, SYS_ERR ticks)
   behind the nav tabs on every page that does not already have its own
   header background.

   Palette (sampled from the live site, not default RGB cyan/magenta):
   #FFD400 core yellow, #DEBC13 neon gold (banner sign / halo),
   #F6392E graffiti-wall red, #0C87CC NFT-banner neon blue.

   v6 (after v4/v5 were rolled back): same as v3, plus
   - Every page v3 left alone (/arcade neon sign, /mr-toastys-merch, any page
     whose header wrap already has its own background image / canvas / video)
     now gets ONLY the calm transparent glitch overlay on top of its own header.
     Its own background is not replaced, hidden or recolored. No banner photo.
   - Home: the #tt-topwall wallpaper picture is swapped (from this footer file,
     so hourly Home code-block rebuilds do not undo it) to the neon
     "Hello my name is Mr. Toasty" shutter wall (home-wall-v2-*), shown WHOLE
     (fit to width, no cover crop) over a dark blurred fill of the same image.
     The calm glitch canvas now covers the whole wallpaper area (inside
     #tt-topwall, under all content and tabs), not just the header strip.
   - v6.1: the whole wall picture sits BELOW the nav tabs (measured at runtime),
     full width, uncropped; Daily Glitch is nudged down only if needed to fit it.
   - /skullz and /mr-toastys-nft-wall unchanged from v3. Default dark-field
     pages (Ashley, Shop, About, ...) unchanged from v3.

   v3: Home overlay is much calmer (lower opacity, rare soft ticks, no
   tears or strobe) so the graffiti wallpaper reads clearly. NFT banner
   intensity stays about the same; only the palette changes there.

   v2 added two modes, both keep the overlay glitch under the tabs:
   - NFT banner (/mr-toastys-nft-wall and /skullz, the "Mr. Toasty's NFTs" tab):
     the neon MR. TOASTY shutter photo is the banner picture; the glitch paints
     on top of it. Banner files live in this folder (nft-banner-2400/1200).
   - Home overlay (/ and /home): the glitch paints over the #tt-topwall graffiti
     wallpaper and under the nav tabs. Transparent canvas, no opaque fill, so
     the mural stays visible. Does not touch the Tag Wall, embed, or #ttpw-root.

   Excluded (keep their existing header art):
   - /arcade (collection 6ad5b63914df0c0376bddf45): neon sign CSS
   - /mr-toastys-merch: graffiti header, if that page returns (404 as of 2026-11-14)
   - Any other page whose .header-announcement-bar-wrapper already has a non-none
     background-image from page CSS, or a foreign canvas/video in the header wrap.
     Home's #tt-topwall is no longer treated as a reason to skip (overlay mode).

   Ashley Savvie (/ashleysavvie, collection 6aefb320e7defe1c4dfda59f) keeps the
   same look, including the white-bar gap fix under the nav.

   Does not change header height, tab borders, the soft yellow glow, or the
   caution bar. Adds no underlines. Safe under Squarespace soft nav (no
   duplicate canvas; removed on excluded pages). Respects prefers-reduced-motion
   (static glitch frame). Neutralizes the older Ashley-only script if both load.

   Replaces ashley-header/header-bg.js. Load once from sitewide Footer Code Injection:
   <script src="https://therapytoaster.github.io/tt-live/site-header/header-bg.js?c=SHORTSHA" defer></script>
   Home does not need a tag in the Home code block; this file already runs sitewide
   and survives hourly Home rebuilds. v3 only changes this file for the header layer;
   the full-page Home scroll glitch lives in the Home code block.
*/
(function(){
  if(window.self!==window.top)return;
  var STYLE_ID='tt-site-ook-header-css';
  var CV_ID='tt-site-ook-cv';
  var OV_ID='tt-site-ook-ov';
  var CLS='tt-site-ook-header';
  var CLS_NFT='tt-site-ook-nft';
  var CLS_OVER='tt-site-ook-over';
  var SECTION='6aefb3e0dd29691c2e41cf91';
  var W=window, D=document, KEY='__ttSiteOokHeader';
  if(W[KEY]&&W[KEY].destroy)W[KEY].destroy();

  var EXCLUDE_CID={
    'collection-6ad5b63914df0c0376bddf45':1  /* ARTcade */
  };
  var EXCLUDE_PATH=/^\/(arcade|mr-toastys-merch)\/?$/i; /* v6: overlay-only, keep own header art */
  var HOME_CID={
    'collection-6a9884b8f61a583fee13721f':1
  };
  var NFT_CID={
    'collection-6af6cf6c71c4ca6f54577e52':1, /* /mr-toastys-nft-wall */
    'collection-6ad2fee94e898d331b4002bf':1  /* /skullz  (nav tab "Mr. Toasty's NFTs") */
  };
  var HOME_PATH=/^\/(home)?\/?$/i;
  var NFT_PATH=/^\/(mr-toastys-nft-wall|skullz)\/?$/i;
  var ASSET='https://therapytoaster.github.io/tt-live/site-header/';
  var BANNER_2400_WEBP=ASSET+'nft-banner-2400.webp';
  var BANNER_2400_JPG=ASSET+'nft-banner-2400.jpg';
  var BANNER_1200_WEBP=ASSET+'nft-banner-1200.webp';
  var BANNER_1200_JPG=ASSET+'nft-banner-1200.jpg';
  var CLS_OVL='tt-site-ook-ovl'; /* v6: overlay-only on a page's own header */
  var CLS_WALL='tt-site-ook-wall'; /* v6: Home wallpaper swap */
  var WALL_2400_WEBP=ASSET+'home-wall-v2-2400.webp', WALL_2400_JPG=ASSET+'home-wall-v2-2400.jpg';
  var WALL_1200_WEBP=ASSET+'home-wall-v2-1200.webp', WALL_1200_JPG=ASSET+'home-wall-v2-1200.jpg';
  var WALL_FILL_WEBP=ASSET+'home-wall-v2-fill.webp', WALL_FILL_JPG=ASSET+'home-wall-v2-fill.jpg';
  var TOPWALL_ID='tt-topwall';

  var mode='off'; /* off | default | nft-banner | home-overlay | overlay */
  var bannerImg=null, bannerTried=false, bannerWait=0;

  function bodyIdClass(){
    var b=D.body;if(!b)return '';
    return (b.id||'')+' '+(b.className||'');
  }
  function hasCid(map){
    var s=bodyIdClass();
    for(var c in map){if(map[c]&&(s.indexOf(c)!==-1))return true;}
    return false;
  }
  function pageMode(){
    var b=D.body;
    if(!b)return 'off';
    if(b.classList.contains('sqs-edit-mode-active'))return 'off';
    var path=location.pathname||'';
    if(EXCLUDE_PATH.test(path)||hasCid(EXCLUDE_CID))return 'overlay';
    if(path==='/'||HOME_PATH.test(path)||hasCid(HOME_CID))return 'home-overlay';
    if(NFT_PATH.test(path)||hasCid(NFT_CID))return 'nft-banner';
    return 'default';
  }

  function hasOwnHeaderBg(wrapEl){
    var wrap=wrapEl||D.querySelector('#header .header-announcement-bar-wrapper')||D.querySelector('.header-announcement-bar-wrapper');
    if(!wrap)return false;
    var nodes=wrap.querySelectorAll('canvas,video');
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      if(n.id===CV_ID||n.id===OV_ID)continue;
      if(n.id==='tt-ashley-ook-cv'||n.id==='tt-ashley-ook-ov')continue;
      return true;
    }
    var bg=(W.getComputedStyle?getComputedStyle(wrap).backgroundImage:'')||'';
    if(bg&&bg!=='none'){
      var root=D.documentElement;
      if(root&&(root.classList.contains(CLS)||root.classList.contains(CLS_NFT)||root.classList.contains(CLS_OVER)||root.classList.contains(CLS_OVL)))return false;
      return true;
    }
    return false;
  }

  function onPage(){
    return pageMode()!=='off';
  }
  /* v6: a 'default' page whose header already has its own art gets overlay-only.
     Check with our classes off so a previous page's class cannot hide its art. */
  function resolveMode(m,wrapEl){
    if(m!=='default')return m;
    var root=D.documentElement,had=root?root.className:'';
    if(root)root.classList.remove(CLS,CLS_NFT,CLS_OVER,CLS_OVL);
    var own=hasOwnHeaderBg(wrapEl);
    if(root)root.className=had;
    return own?'overlay':'default';
  }
  function calm(){return mode==='home-overlay'||mode==='overlay';}

  function setActive(m){
    var root=D.documentElement;
    if(!root)return;
    root.classList.remove(CLS,CLS_NFT,CLS_OVER,CLS_OVL,CLS_WALL);
    if(!m||m==='off')return;
    if(m==='nft-banner'){root.classList.add(CLS,CLS_NFT);}
    else if(m==='home-overlay'){root.classList.add(CLS_OVER,CLS_WALL);}
    else if(m==='overlay'){root.classList.add(CLS_OVL);}
    else root.classList.add(CLS);
  }

  function removeLegacy(){
    ['tt-ashley-ook-cv','tt-ashley-ook-ov','tt-ashley-ook-header-css'].forEach(function(id){
      var el=D.getElementById(id);if(el&&el.parentNode)el.parentNode.removeChild(el);
    });
  }
  function neuterAshley(){
    var old=W.__ttAshleyOokHeader;
    if(old){
      try{if(old._mo)old._mo.disconnect();}catch(e){}
      try{if(old.destroy)old.destroy();}catch(e){}
    }
    removeLegacy();
  }

  function ensureStyle(){
    var st=D.getElementById(STYLE_ID);
    if(!st){
      var host=D.head||D.documentElement;
      if(!host)return;
      st=D.createElement('style');st.id=STYLE_ID;
      host.appendChild(st);
    }
    st.textContent=
      '/* Site header: OOK glitch behind the nav tabs */'+
      'html.'+CLS+':not(.'+CLS_NFT+'):not(.'+CLS_OVER+') .header-announcement-bar-wrapper{'+
        'position:relative;'+
        'background-color:#05070d!important;'+
        'background-image:'+
          'repeating-linear-gradient(0deg,rgba(255,255,255,.022) 0 1px,transparent 1px 4px),'+
          'radial-gradient(ellipse at 50% 0%,rgba(92,66,18,.30),transparent 60%),'+
          'radial-gradient(ellipse at 50% 100%,rgba(60,40,12,.22),transparent 60%)!important;'+
      '}'+
      'html.'+CLS+' .header-announcement-bar-wrapper .header-background{'+
        'background:transparent!important;background-color:transparent!important;background-image:none!important;'+
      '}'+
      /* NFT tab: photo banner, glitch canvas + veil on top, tabs above that */+
      'html.'+CLS+'.'+CLS_NFT+' .header-announcement-bar-wrapper{'+
        'position:relative;'+
        'background-color:#000!important;'+
        'background-image:url("'+BANNER_2400_JPG+'")!important;'+
        'background-image:-webkit-image-set(url("'+BANNER_2400_WEBP+'") 1x)!important;'+
        'background-image:image-set(url("'+BANNER_2400_WEBP+'") type("image/webp"),url("'+BANNER_2400_JPG+'") type("image/jpeg"))!important;'+
        'background-size:cover!important;'+
        'background-position:50% 45%!important;'+
        'background-repeat:no-repeat!important;'+
      '}'+
      '@media (max-width:800px){html.'+CLS+'.'+CLS_NFT+' .header-announcement-bar-wrapper{'+
        'background-image:url("'+BANNER_1200_JPG+'")!important;'+
        'background-image:image-set(url("'+BANNER_1200_WEBP+'") type("image/webp"),url("'+BANNER_1200_JPG+'") type("image/jpeg"))!important;'+
      '}}'+
      'html.'+CLS+'.'+CLS_NFT+' .header-announcement-bar-wrapper .header-background{'+
        'background:transparent!important;background-color:transparent!important;background-image:none!important;'+
      '}'+
      /* Home: glitch over the graffiti wallpaper, under the tabs. Do not paint an opaque header fill. */+
      'html.'+CLS_OVER+' .header-announcement-bar-wrapper{position:relative;}'+
      'html.'+CLS_OVER+' .header-announcement-bar-wrapper .header-background{'+
        'background:transparent!important;background-color:transparent!important;background-image:none!important;'+
      '}'+
      '#'+CV_ID+'{'+
        'position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0;padding:0;border:0;'+
        'pointer-events:none;z-index:0;image-rendering:pixelated;contain:strict;'+
      '}'+
      '#'+OV_ID+'{'+
        'position:absolute;inset:0;pointer-events:none;z-index:1;'+
        'background:rgba(0,0,0,.32);'+
      '}'+
      'html.'+CLS_NFT+' #'+OV_ID+'{background:rgba(0,0,0,.26);}'+
      'html.'+CLS_OVER+' #'+OV_ID+'{background:rgba(0,0,0,.04);}'+
      'html.'+CLS+' .header-announcement-bar-wrapper > .header-inner,'+
      'html.'+CLS_NFT+' .header-announcement-bar-wrapper > .header-inner,'+
      'html.'+CLS_OVER+' .header-announcement-bar-wrapper > .header-inner{'+
        'position:relative;z-index:2;'+
      '}'+
      'html.'+CLS+' .header-title-logo img,html.'+CLS_NFT+' .header-title-logo img,html.'+CLS_OVER+' .header-title-logo img{'+
        'filter:drop-shadow(0 0 6px #000) drop-shadow(0 1px 2px #000);'+
      '}'+
      /* v6 overlay-only: never touch the page's own header background. */
      'html.'+CLS_OVL+' .header-announcement-bar-wrapper{position:relative;}'+
      'html.'+CLS_OVL+' #'+OV_ID+'{background:rgba(0,0,0,.03);}'+
      'html.'+CLS_OVL+' .header-announcement-bar-wrapper > .header-inner{position:relative;z-index:2;}'+
      /* v6 Home wallpaper: whole image, fit to width, dark blurred fill of the same picture. */
      'html.'+CLS_WALL+' #'+TOPWALL_ID+' .tw-img{'+
        'background-color:#05070d!important;background-repeat:no-repeat,no-repeat!important;'+
        'background-image:url("'+WALL_2400_JPG+'"),url("'+WALL_FILL_JPG+'")!important;'+
        'background-image:image-set(url("'+WALL_2400_WEBP+'") type("image/webp"),url("'+WALL_2400_JPG+'") type("image/jpeg")),image-set(url("'+WALL_FILL_WEBP+'") type("image/webp"),url("'+WALL_FILL_JPG+'") type("image/jpeg"))!important;'+
        'background-size:var(--tt-wall-w,100%) auto,cover!important;'+
        'background-position:50% var(--tt-wall-top,50%),50% 50%!important;'+
      '}'+
      '@media (max-width:767px){html.'+CLS_WALL+' #'+TOPWALL_ID+' .tw-img{'+
        'background-image:url("'+WALL_1200_JPG+'"),url("'+WALL_FILL_JPG+'")!important;'+
        'background-image:image-set(url("'+WALL_1200_WEBP+'") type("image/webp"),url("'+WALL_1200_JPG+'") type("image/jpeg")),image-set(url("'+WALL_FILL_WEBP+'") type("image/webp"),url("'+WALL_FILL_JPG+'") type("image/jpeg"))!important;'+
        'background-position:50% var(--tt-wall-top,72%),50% 50%!important;'+
      '}}'+
      /* beats Home's html.tt-topwall body.homepage #tt-topwall{height:max(46.875vw,850px)!important} only once measured */
      'html.'+CLS_WALL+'.tt-topwall body.homepage #siteWrapper #'+TOPWALL_ID+'.tt-wall-sized{height:var(--tt-wall-h)!important;}'+
      /* v6.1: extra room above Daily Glitch (set at runtime) so the whole wall fits under the tabs */
      'html.'+CLS_WALL+' #tt-notice{border-top:var(--tt-wall-push,0px) solid transparent!important;}'+
      'html.'+CLS_WALL+' #'+TOPWALL_ID+' #'+CV_ID+'{z-index:2;}'+
      'html.'+CLS_WALL+' #'+TOPWALL_ID+' #'+OV_ID+'{z-index:3;background:rgba(0,0,0,.03);}'+
      /* Ashley white-bar gap under the nav (same rules as the Ashley-only script). */+
      '[data-section-id="'+SECTION+'"] .content-wrapper{padding-top:0!important}'+
      '[data-section-id="'+SECTION+'"] .section-background{background:#000!important}';
  }

  var cv=null,ov=null,ctx=null,wrap=null,raf=0,ro=null,rq=0,startedHooks=false;
  var rmq=W.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  var base=null,bc=null,pats=[],width=0,height=0,S=.5,lastW=0,lastH=0,mob=false,FPS=24;
  var R=Math.random,last=0,vis=!D.hidden,onScreen=true,nextB=0,burst=null,texts=[],nextT=0,fi=0,tracks=[];
  /* #FFD400, #F6392E (graffiti wall), #0C87CC (NFT banner blue), #DEBC13 (neon gold sign) */
  var YEL='255,212,0', RED='246,57,46', BLU='12,135,204', GLD='222,188,19';
  var COL=[YEL,RED,BLU,GLD];
  var io=null,unvis=null,unrm=null,unrs=null;

  function hx(n){var s='';while(s.length<n)s+='0123456789ABCDEF'[R()*16|0];return s;}
  function word(){var r=R();return r<.3?'SYS_ERR':r<.5?'SYS_ERR 0x'+hx(4):r<.7?'0x'+hx(6):r<.85?hx(2)+' '+hx(2)+' '+hx(2)+' '+hx(2):'ERR_'+hx(3)+' // SIGNAL';}

  function drawCover(g,img,w,h){
    if(!img||!img.naturalWidth){g.fillStyle='#000';g.fillRect(0,0,w,h);return;}
    var iw=img.naturalWidth,ih=img.naturalHeight,s=Math.max(w/iw,h/ih);
    var dw=iw*s,dh=ih*s;
    g.drawImage(img,(w-dw)/2,(h-dh)/2-h*0.02,dw,dh);
  }

  function paintBase(){
    if(!bc||!base)return;
    var overlay=calm();
    var nft=mode==='nft-banner';
    if(overlay){
      bc.clearRect(0,0,width,height);
      bc.fillStyle='rgba(0,0,0,.02)';bc.fillRect(0,0,width,height);
      bc.fillStyle='rgba(0,0,0,.06)';for(var y=0;y<height;y+=5)bc.fillRect(0,y,width,1);
      return;
    }
    if(nft){
      bc.fillStyle='#000';bc.fillRect(0,0,width,height);
      drawCover(bc,bannerImg,width,height);
      var g=bc.createRadialGradient(width*.5,height*.45,height*.2,width*.5,height*.45,Math.max(width,height)*.75);
      g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.35)');bc.fillStyle=g;bc.fillRect(0,0,width,height);
      bc.fillStyle='rgba(0,0,0,.14)';for(y=0;y<height;y+=3)bc.fillRect(0,y,width,1);
      return;
    }
    bc.fillStyle='#05070d';bc.fillRect(0,0,width,height);
    g=bc.createRadialGradient(width*.5,-height*.1,0,width*.5,-height*.1,height*1.2);
    g.addColorStop(0,'rgba(96,70,20,.30)');g.addColorStop(1,'rgba(96,70,20,0)');bc.fillStyle=g;bc.fillRect(0,0,width,height);
    g=bc.createRadialGradient(width*.5,height*.5,height*.3,width*.5,height*.5,Math.max(width,height)*.8);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');bc.fillStyle=g;bc.fillRect(0,0,width,height);
    bc.fillStyle='rgba(0,0,0,.28)';for(y=0;y<height;y+=3)bc.fillRect(0,y,width,1);
  }

  function wantAlpha(){return mode==='nft-banner'||calm();}

  /* v6.1 Home: put the whole wall picture BELOW the nav tabs, full width, uncropped.
     Measures the header bottom and the Daily Glitch box at runtime. If the gap is
     shorter than the picture, Daily Glitch is pushed down just enough (transparent
     top border on #tt-notice). Falls back to the CSS defaults if anything is missing. */
  var WALL_RATIO=3552/1184,WALL_GAP=14,pushPx=0,placeT=[];
  function placeWall(){
    var root=D.documentElement,tw=D.getElementById(TOPWALL_ID);
    if(!root||!tw||mode!=='home-overlay'){return;}
    var img=tw.querySelector('.tw-img');if(!img)return;
    var hd=D.querySelector('#header .header-announcement-bar-wrapper')||D.getElementById('header');
    var box=D.querySelector('#tt-notice .ttdg-box')||D.getElementById('tt-notice');
    if(!hd||!box)return;
    var ir=img.getBoundingClientRect(),w=ir.width||tw.clientWidth;if(!w)return;
    var navB=hd.getBoundingClientRect().bottom-ir.top;
    var boxT=box.getBoundingClientRect().top-ir.top-pushPx; /* position without our push */
    if(!(navB>0)||!(boxT>0))return;
    var ih=w/WALL_RATIO,avail=boxT-navB-2*WALL_GAP,push=0,top;
    if(avail>=ih){top=navB+WALL_GAP+(avail-ih)/2;}
    else{push=Math.ceil(ih-avail);top=navB+WALL_GAP;}
    if(Math.abs(push-pushPx)>1){pushPx=push;root.style.setProperty('--tt-wall-push',push+'px');}
    img.style.setProperty('--tt-wall-top',Math.round(top)+'px');
    img.style.setProperty('--tt-wall-w',Math.round(w)+'px');
    /* Wall area (glitch canvas + bottom fade) runs from the top to just under the top of Daily Glitch. */
    tw.style.setProperty('--tt-wall-h',Math.ceil(Math.max(top+ih+70,boxT+push+30))+'px');
    tw.classList.add('tt-wall-sized');
  }
  function unplaceWall(){
    var root=D.documentElement;if(root)root.style.removeProperty('--tt-wall-push');pushPx=0;
    var tw=D.getElementById(TOPWALL_ID);if(tw){tw.classList.remove('tt-wall-sized');tw.style.removeProperty('--tt-wall-h');}
    placeT.forEach(clearTimeout);placeT=[];
  }
  function size(force){
    if(cv&&wrap&&wrap.id===TOPWALL_ID)placeWall();
    if(!cv||!wrap||!ctx)return;
    var cw=wrap.clientWidth||innerWidth,ch=wrap.clientHeight||0;
    if(ch<8)ch=Math.max(8,(wrap.getBoundingClientRect().height||0));
    if(!force&&cw===lastW&&Math.abs(ch-lastH)<2&&width)return;
    lastW=cw;lastH=ch;mob=cw<700;FPS=calm()?(mob?8:10):(mob?20:24);
    var d=Math.min(W.devicePixelRatio||1,2),k=(mob?.5:.6)*d,cap=mob?180000:400000;
    if(cw*k*ch*k>cap)k=Math.sqrt(cap/(cw*ch||1));S=k;
    width=Math.max(48,Math.round(cw*k));height=Math.max(24,Math.round(ch*k));
    cv.width=width;cv.height=height;cv.style.width='100%';cv.style.height='100%';
    ctx.imageSmoothingEnabled=false;
    if(!base){base=D.createElement('canvas');bc=base.getContext('2d',{alpha:true});}
    base.width=width;base.height=height;
    paintBase();
    if(!pats.length)for(var f=0;f<4;f++){
      var nc=D.createElement('canvas');nc.width=nc.height=96;var nx=nc.getContext('2d'),id=nx.createImageData(96,96),p=id.data;
      for(var i=0;i<p.length;i+=4){var v=R()*255|0;p[i]=v;p[i+1]=v*.94|0;p[i+2]=v*.82|0;p[i+3]=R()<.5?0:(R()*34|0);}
      nx.putImageData(id,0,0);pats.push(ctx.createPattern(nc,'repeat'));
    }
    if(calm()) tracks=[{y:R()*height,v:height*.012,h:Math.max(2,height*.01)}];
    else tracks=[{y:R()*height,v:height*.05,h:Math.max(3,height*.018)},{y:R()*height,v:height*.085,h:Math.max(2,height*.008)}];
    if(calm())ctx.clearRect(0,0,width,height);
    ctx.drawImage(base,0,0);if(rmq.matches)still();
  }

  function newBurst(t){
    var home=calm();
    var n=home?1+(R()*2|0):(mob?3:4)+(R()*(mob?3:5)|0),sl=[];
    for(var i=0;i<n;i++){
      var r=R();
      var kind=home?(r<.7?'band':'rgb'):(r<.45?'band':r<.75?'rgb':'mosh');
      sl.push({y:R()*height,h:Math.max(1,(R()<.6?R()*.012:R()*.05)*height*(home?.6:1)),x:R()<.5?0:R()*width*.6,w:width*(.25+R()*.75),c:COL[R()*COL.length|0],a:(home?.04:0.07)+R()*(home?.06:.15),
        sw:home?0:(R()<.4?(R()<.5?-1:1)*width*(.3+R()*.5):0),t0:R()*.45,k:kind,sh:home?0:(R()<.5?-1:1)*(3+R()*width*.04)});
    }
    burst={t:t,d:home?280+R()*240:170+R()*330,sl:sl};nextB=t+(home?9000+R()*12000:2000+R()*3000);
  }
  function blocks(n,a){
    for(var i=0;i<n;i++){
      var w=4+R()*width*.035,h=2+R()*height*.02,x=R()*width,y=R()*height,o=1+R()*3;
      ctx.fillStyle='rgba('+RED+','+a+')';ctx.fillRect(x-o,y,w,h);
      ctx.fillStyle='rgba('+BLU+','+a+')';ctx.fillRect(x+o,y,w,h);
      if(R()<.4){ctx.fillStyle='rgba('+YEL+','+a*.8+')';ctx.fillRect(x,y+h*.3,w*.6,Math.max(1,h*.4));}
    }
  }
  function slice(s,p){
    var x=s.x+s.sw*p;
    if(s.k==='mosh'){
      var yy=Math.max(0,Math.min(height-1,s.y|0)),hh=Math.max(1,Math.min(height-yy,s.h*2|0));
      ctx.globalAlpha=.85;ctx.drawImage(cv,0,yy,width,hh,s.sh,yy,width,hh);ctx.globalAlpha=1;
      ctx.fillStyle='rgba('+s.c+','+s.a*.5+')';ctx.fillRect(x,yy,s.w,1);return;
    }
    if(s.k==='rgb'){
      var o=2+S*6;ctx.globalCompositeOperation='lighter';
      ctx.fillStyle='rgba('+RED+','+s.a+')';ctx.fillRect(x-o,s.y,s.w,s.h);
      ctx.fillStyle='rgba('+BLU+','+s.a+')';ctx.fillRect(x+o,s.y,s.w,s.h);
      ctx.globalCompositeOperation='source-over';return;
    }
    ctx.fillStyle='rgba('+s.c+','+s.a+')';ctx.fillRect(x,s.y,s.w,s.h);
    ctx.fillStyle='rgba('+s.c+','+s.a*1.6+')';ctx.fillRect(x,s.y,s.w,Math.max(1,S));
  }
  function txt(o,on){
    if(!on)return;
    ctx.font=Math.max(6,Math.round(12*S))+'px ui-monospace,Menlo,Consolas,"Liberation Mono",monospace';
    ctx.fillStyle='rgba('+RED+','+o.a*.5+')';ctx.fillText(o.s,o.x-1,o.y);
    ctx.fillStyle='rgba('+BLU+','+o.a*.5+')';ctx.fillText(o.s,o.x+1,o.y);
    ctx.fillStyle='rgba('+o.c+','+o.a+')';ctx.fillText(o.s,o.x,o.y);
  }
  function noise(a){
    ctx.save();ctx.globalAlpha=a;ctx.translate(-(R()*96|0),-(R()*96|0));
    ctx.fillStyle=pats[fi%pats.length];ctx.fillRect(0,0,width+96,height+96);ctx.restore();
  }
  function draw(t,dt){
    var b=burst&&t-burst.t<burst.d?burst:null;if(burst&&!b)burst=null;
    var overlay=calm();
    if(overlay){
      ctx.clearRect(0,0,width,height);
      ctx.globalAlpha=.7;ctx.drawImage(base,0,0);ctx.globalAlpha=1;
    }else{
      ctx.globalAlpha=b?.4:.8;ctx.drawImage(base,0,0);ctx.globalAlpha=1;
    }
    fi++;noise(overlay?.10:.55);
    for(var i=0;i<tracks.length;i++){
      var k=tracks[i];k.y+=k.v*dt/1000;if(k.y>height+k.h)k.y=-k.h*2;
      var yy=k.y|0,hh=Math.max(1,k.h|0);
      if(!overlay&&yy>=0&&yy+hh<=height){ctx.globalAlpha=.6;ctx.drawImage(cv,0,yy,width,hh,2+S*4,yy,width,hh);ctx.globalAlpha=1;}
      ctx.fillStyle='rgba(255,212,0,'+(overlay?.02:.035)+')';ctx.fillRect(0,yy,width,hh);
      if(!overlay){for(var j=0;j<3;j++){ctx.fillStyle='rgba('+YEL+','+(.05+R()*.06)+')';ctx.fillRect(R()*width,yy+R()*hh,4+R()*width*.06,1);}}
    }
    if(!burst&&t>=nextB)newBurst(t);
    if(b){var p=(t-b.t)/b.d;for(var s=0;s<b.sl.length;s++)if(p>=b.sl[s].t0)slice(b.sl[s],p);if(!overlay)blocks(mob?5:10,.10+R()*.08);else if(R()<.35)blocks(1,.04);}
    if(!overlay&&t>=nextT&&texts.length<(mob?2:4)){
      texts.push({s:word(),x:R()*width*.85,y:8+R()*Math.max(8,height-12),c:R()<.6?YEL:R()<.5?GLD:BLU,a:.14+R()*.14,t:t,d:350+R()*800});
      nextT=t+(mob?1800:1100)+R()*2600;
    }
    for(var q=texts.length-1;q>=0;q--){var o=texts[q],age=t-o.t;if(age>o.d){texts.splice(q,1);continue;}txt(o,((age/70)|0)%4!==1);}
  }
  function still(){
    if(!ctx||!base)return;
    var overlay=calm();
    if(overlay)ctx.clearRect(0,0,width,height);
    ctx.globalAlpha=1;ctx.drawImage(base,0,0);noise(overlay?.12:.6);
    if(overlay)return;
    var sv=burst;newBurst(0);var b=burst;
    for(var s=0;s<b.sl.length;s++)if(b.sl[s].k!=='mosh')slice(b.sl[s],.5);blocks(mob?4:8,.12);burst=sv;nextB=0;
    for(var i=0;i<(mob?2:3);i++)txt({s:word(),x:R()*width*.8,y:10+R()*Math.max(8,height-14),c:YEL,a:.2},true);
  }
  function loop(t){
    raf=requestAnimationFrame(loop);
    var iv=1000/FPS;if(last&&t-last<iv)return;
    var dt=last?Math.min(120,t-last):16;last=last&&t-last<iv*2?t-((t-last)%iv):t;
    if(!cv||!cv.isConnected){stopLoop();return;}
    if(!vis||!onScreen||rmq.matches)return;
    draw(t,dt);
  }
  function stopLoop(){if(raf)cancelAnimationFrame(raf);raf=0;}
  function startLoop(){
    if(!raf&&vis&&onScreen&&!rmq.matches&&cv&&cv.isConnected){
      last=0;if(!nextB)nextB=performance.now()+(calm()?2500:400);raf=requestAnimationFrame(loop);
    }
  }

  function loadBanner(done){
    if(bannerImg&&bannerImg.complete&&bannerImg.naturalWidth){done();return;}
    if(bannerWait){return;}
    bannerTried=true;
    var urls=mob?[BANNER_1200_JPG,BANNER_2400_JPG]:[BANNER_2400_JPG,BANNER_1200_JPG];
    var i=0;
    function tryNext(){
      if(i>=urls.length){done();return;}
      var im=new Image();
      im.onload=function(){bannerImg=im;bannerWait=0;done();};
      im.onerror=function(){i++;tryNext();};
      bannerWait=im;
      im.src=urls[i];
    }
    tryNext();
  }

  var cvMode='',wallTry=0,wallT=0;
  function mount(){
    removeLegacy();
    var m=pageMode();
    mode=m;
    if(!onPage()||!D.body){unmount();return;}
    ensureStyle();
    wrap=D.querySelector('#header .header-announcement-bar-wrapper')||D.querySelector('.header-announcement-bar-wrapper');
    if(!wrap)return;
    /* v6: default pages with their own header art get overlay-only (nothing replaced). */
    m=resolveMode(m,wrap);
    mode=m;
    setActive(m);
    /* v6 Home: glitch canvas covers the whole #tt-topwall wallpaper, not just the header. */
    var host=wrap,inWall=false;
    clearTimeout(wallT);
    if(m==='home-overlay'){
      var tw=D.getElementById(TOPWALL_ID);
      if(tw){host=tw;inWall=true;wallTry=0;}
      else if(wallTry<40){wallTry++;wallT=setTimeout(function(){if(pageMode()==='home-overlay')mount();},400);}
    }else wallTry=0;
    if(cv&&cv.isConnected&&cv.parentNode===host&&cvMode===m){
      wrap=host;
      if(m==='nft-banner'&&!(bannerImg&&bannerImg.naturalWidth)){
        loadBanner(function(){paintBase();size(true);startLoop();});
      }else{size(false);startLoop();}
      return;
    }
    unmountCanvasOnly();
    wrap=host;
    mode=m;cvMode=m;
    setActive(m);
    cv=D.createElement('canvas');cv.id=CV_ID;cv.setAttribute('aria-hidden','true');cv.setAttribute('role','presentation');
    ov=D.createElement('div');ov.id=OV_ID;ov.setAttribute('aria-hidden','true');
    if(inWall){wrap.appendChild(cv);wrap.appendChild(ov);
      placeT.forEach(clearTimeout);placeT=[300,1000,2500,5000].map(function(ms){return setTimeout(placeWall,ms);});}
    else{wrap.insertBefore(ov,wrap.firstChild);wrap.insertBefore(cv,wrap.firstChild);}
    ctx=cv.getContext('2d',{alpha:wantAlpha()});if(!ctx)return;
    pats=[];base=null;bc=null;burst=null;texts=[];nextB=0;nextT=0;lastW=0;lastH=0;fi=0;
    vis=!D.hidden;onScreen=true;
    function after(){
      size(true);
      if(rmq.matches)still();else startLoop();
    }
    if(m==='nft-banner'){
      size(true);
      loadBanner(function(){paintBase();after();});
    }else after();
    if(!unvis){
      unvis=function(){vis=!D.hidden;if(vis)startLoop();else stopLoop();};
      D.addEventListener('visibilitychange',unvis);
    }
    if(rmq.addEventListener&&!unrm){
      unrm=function(){if(rmq.matches){stopLoop();still();}else startLoop();};
      rmq.addEventListener('change',unrm);
    }
    if('IntersectionObserver' in W){
      if(io){try{io.disconnect();}catch(e){}}
      io=new IntersectionObserver(function(e){onScreen=e[e.length-1].isIntersecting;if(onScreen)startLoop();else stopLoop();});
      io.observe(wrap);
    }
    if(W.ResizeObserver){
      if(ro){try{ro.disconnect();}catch(e){}}
      ro=new ResizeObserver(function(){clearTimeout(rq);rq=setTimeout(function(){size(false);},120);});
      ro.observe(wrap);
    }
    if(!unrs){unrs=function(){clearTimeout(rq);rq=setTimeout(function(){size(false);},150);};W.addEventListener('resize',unrs);}
  }

  function unmountCanvasOnly(){
    stopLoop();
    if(io){try{io.disconnect();}catch(e){}io=null;}
    if(ro){try{ro.disconnect();}catch(e){}ro=null;}
    if(cv&&cv.parentNode)cv.parentNode.removeChild(cv);
    if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);
    if(wrap&&wrap.id===TOPWALL_ID)unplaceWall();
    cv=null;ov=null;ctx=null;wrap=null;cvMode='';
  }
  function unmount(){
    unmountCanvasOnly();
    setActive('off');
    mode='off';
    removeLegacy();
  }

  function destroy(){
    clearTimeout(wallT);
    unmount();
    if(unvis){D.removeEventListener('visibilitychange',unvis);unvis=null;}
    if(unrm&&rmq.removeEventListener){rmq.removeEventListener('change',unrm);unrm=null;}
    if(unrs){W.removeEventListener('resize',unrs);unrs=null;}
    clearTimeout(rq);
    var st=D.getElementById(STYLE_ID);if(st&&st.parentNode)st.parentNode.removeChild(st);
    setActive('off');
    if(W[KEY]===api)delete W[KEY];
  }

  function onNav(){setTimeout(function(){removeLegacy();if(onPage())mount();else unmount();},0);}

  function hook(){
    if(startedHooks)return;startedHooks=true;
    ['mercury:load','mercury:navigate','turbo:load'].forEach(function(ev){
      W.addEventListener(ev,onNav);D.addEventListener(ev,onNav);
    });
    W.addEventListener('popstate',onNav);
    try{
      var mo=new MutationObserver(onNav);
      function watchBody(){if(D.body)mo.observe(D.body,{attributes:true,attributeFilter:['id','class']});}
      if(D.body)watchBody();else D.addEventListener('DOMContentLoaded',watchBody);
      api._mo=mo;
    }catch(e){}
  }

  var api={mount:mount,unmount:unmount,destroy:destroy,onPage:onPage,pageMode:pageMode};
  W[KEY]=api;
  function boot(){
    neuterAshley();
    mode=pageMode();
    ensureStyle();
    hook();
    onNav();
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
