/* TT site header: OOK glitch background v6.8
   v6.8: TT NAV gains option D (A's rounded neon-tube shell + B's glitch/VHS
   interior), OFF unless ?nav=D on this script's URL or ?ttnav=D on the page.
   A, B and C are unchanged.
   v6.7: adds the TT NAV block at the end (optional desktop tab looks A neon
   tubes / B glitch-VHS / C arcade buttons, OFF unless ?nav= on this script's
   URL or ?ttnav= on the page). Nothing else changed.
   v6.6: adds the TT SPARKS block at the end (optional neon rims + sparks down
   the rest of Home, OFF unless ?sparks=1 on this script's URL or ?ttsparks=1
   on the page). Nothing else changed.
   v6.5: adds the TT NEON block (optional neon overlay on the Home
   wall picture, variants A/B/C, OFF unless picked via ?neon= on this script's
   URL or ?ttneon= on the page). Nothing else changed.
   v6.4: TT IMG FIX now also sets the Home "Dress like Mr. Toasty" card pictures
   to ME Halo Tee + Acid Cap Smoke Tee (site-header/dress-card-*-v1.webp/.jpg).
   v6.3: adds the TT GOTTEM block at the end (Home: click any big R in
   Coty's name to play a "HA GOTTEM" clip). Nothing else changed.
   v6.2: adds the TT IMG FIX block at the end of this file (dead Shopify
   tee mockup URLs on Home "Dress like Mr. Toasty" card, Latest drop strip
   and /shop are swapped to the current product images). Nothing else changed.
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

/* ===== TT IMG FIX v1 (header-bg.js v6.2) =====
   Shopify replaced some tee mockup files with new product photos and the old
   file URLs now 404. Home ("Dress like Mr. Toasty" card + Latest drop strip)
   and /shop still pointed at the old files, so the pictures showed as broken.
   This swaps every old URL to the product's current image (keeps any
   &width= size), on load, on DOM changes and on image error.
   Also: the Latest drop strip listed "Please Be Nice Tee" (unpublished
   2026-11-21); it now shows "Hooded Hello Toasty Tee" instead. */
(function(){
  var W=window,D=document;
  if(W.__ttImgFix)return;W.__ttImgFix=1;
  var B='https://cdn.shopify.com/s/files/1/0787/6860/3190/files/';
  var MAP={"hive-mind-skull-tee-mockup.png": "unisex-staple-t-shirt-black-front-6af99e778f48f.jpg?v=1794743934","golden-fracture-tee-mockup-v2.png": "unisex-staple-t-shirt-black-front-6af9fe193f146.jpg?v=1794768416","cherry-bomb-skull-tee-mockup.png": "unisex-staple-t-shirt-black-front-6af9996c53714.jpg?v=1794742643","chrome-flame-skull-tee-mockup.png": "unisex-staple-t-shirt-black-front-6af999fa5354b.jpg?v=1794742785","cosmic-halo-skull-tee-mockup.png": "unisex-staple-t-shirt-black-front-6af99a9b3dfb2.jpg?v=1794742945","hers-tee-mockup.png": "unisex-staple-t-shirt-black-front-6af99c55ecd4d.jpg?v=1794743389","his-tee-mockup.png": "unisex-staple-t-shirt-black-front-6af99de01b7f3.jpg?v=1794743783","nice-and-toasty-tee-mockup.png": "unisex-staple-t-shirt-black-front-6af99ef5a07e3.jpg?v=1794744061","vhs-static-skull-tee-mockup.png": "unisex-staple-t-shirt-black-front-6afa0164540d2.jpg?v=1794769259","xx-static-smile-tee-mockup.png": "unisex-staple-t-shirt-black-front-6afa028349bba.jpg?v=1794769546","unisex-staple-t-shirt-black-heather-front-and-back-6adadbe7d1015_800x800.jpg": "mr-toasty-tee-blend-mockup.png?v=1793421323"};
  var KEYS=Object.keys(MAP);
  var PBN='please-be-nice-tee-mockup';
  var HHT=B+'hooded-hello-toasty-tee-mockup.png?v=1795139551';
  function swapUrl(u){
    if(!u||u.indexOf('cdn.shopify.com')<0)return null;
    for(var i=0;i<KEYS.length;i++){
      if(u.indexOf(KEYS[i])>-1){
        var w=/[?&]width=(\d+)/.exec(u);
        return B+MAP[KEYS[i]]+(w?'&width='+w[1]:'');
      }
    }
    return null;
  }
  function fixImg(im){
    if(!im||im.tagName!=='IMG')return;
    var n=swapUrl(im.getAttribute('src'));
    if(n&&im.getAttribute('src')!==n)im.setAttribute('src',n);
    var ss=im.getAttribute('srcset');
    if(ss&&/mockup|6adadbe7d1015/.test(ss)){
      var out=ss.split(',').map(function(p){p=p.trim();var sp=p.split(/\s+/);var r=swapUrl(sp[0]);if(r)sp[0]=r;return sp.join(' ');}).join(', ');
      if(out!==ss)im.setAttribute('srcset',out);
    }
    ['data-src','data-image'].forEach(function(a){var v=im.getAttribute(a),r=swapUrl(v);if(r)im.setAttribute(a,r);});
  }
  function fixDrop(){
    var d=D.getElementById('tt-drop');if(!d)return;
    var ims=d.querySelectorAll('img');
    for(var i=0;i<ims.length;i++){
      var s=ims[i].getAttribute('src')||'';
      if(s.indexOf(PBN)>-1){
        ims[i].setAttribute('src',HHT+'&width=200');
        var b=ims[i].parentNode&&ims[i].parentNode.querySelector('b');
        if(b)b.textContent='Hooded Hello Toasty Tee';
      }
    }
  }
  function fixBg(el){
    var st=el.getAttribute&&el.getAttribute('style');
    if(!st||st.indexOf('cdn.shopify.com')<0)return;
    var out=st.replace(/url\((['"]?)([^'")]+)\1\)/g,function(m,q,u){var r=swapUrl(u);return r?'url('+q+r+q+')':m;});
    if(out!==st)el.setAttribute('style',out);
  }
  function scan(root){
    root=root||D;
    if(!root.querySelectorAll)return;
    var ims=root.querySelectorAll('img');
    for(var i=0;i<ims.length;i++)fixImg(ims[i]);
    var bg=root.querySelectorAll('[style*="cdn.shopify.com"]');
    for(var j=0;j<bg.length;j++)fixBg(bg[j]);
    fixDrop();
    fixCard();
  }
  /* v6.4: Home "Dress like Mr. Toasty" card shows ME Halo Tee + Acid Cap Smoke Tee
     (dark-background copies hosted in tt-live/site-header). The card is one link
     to /shop, so the pictures do not link individually. */
  var CARD=[
    {src:'https://therapytoaster.github.io/tt-live/site-header/dress-card-me-halo-v1.webp',jpg:'https://therapytoaster.github.io/tt-live/site-header/dress-card-me-halo-v1.jpg',alt:'ME Halo Tee'},
    {src:'https://therapytoaster.github.io/tt-live/site-header/dress-card-acid-cap-smoke-v1.webp',jpg:'https://therapytoaster.github.io/tt-live/site-header/dress-card-acid-cap-smoke-v1.jpg',alt:'Acid Cap Smoke Tee'}
  ];
  function fixCard(){
    var ims=D.querySelectorAll('#ttmerch .ttm-thumbs img');
    for(var i=0;i<ims.length&&i<CARD.length;i++){
      var im=ims[i],c=CARD[i],cur=im.getAttribute('src')||'';
      if(cur===c.src||cur===c.jpg)continue;
      im.removeAttribute('srcset');
      im.setAttribute('alt',c.alt);
      im.setAttribute('data-tt-card','v64');
      im.setAttribute('src',c.src);
    }
  }
  D.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.getAttribute('data-tt-card')){for(var i=0;i<CARD.length;i++){if(t.getAttribute('src')===CARD[i].src){t.setAttribute('src',CARD[i].jpg);}}}},true);
  var q=0;
  function soon(){if(q)return;q=setTimeout(function(){q=0;scan(D);},300);}
  D.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'){fixImg(t);}},true);
  function boot(){
    scan(D);
    try{new MutationObserver(soon).observe(D.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcset']});}catch(e){}
    [250,1000,2500,5000].forEach(function(ms){setTimeout(function(){scan(D);},ms);});
    ['mercury:load','mercury:navigate'].forEach(function(ev){W.addEventListener(ev,soon);D.addEventListener(ev,soon);});
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
})();

/* TT GOTTEM v1 (header-bg.js v6.3-gottem) =====
   Home only. Clicking any big (R) in Coty's name plays a short "HA GOTTEM"
   clip (site-header/sfx/gottem.mp3 / .ogg), with a small wiggle.
   Wired R's:
     1. hero heading "〽️®️ Ƭᴏᴀsᴛʏ🎭 Therapy Space" (the .tt-blackr span made by
        TT BLACK R; if that span isn't there, this block wraps the ® itself)
     2. the "Dress like 〽️®️Ƭᴏᴀ𝙎ᴛʏ🎭" shop card heading (#ttmerch .ttm-logo);
        clicking the R plays the clip instead of opening the shop link
     3. the announcement bar "better known as 〽️®️Ƭᴏᴀ𝙎ᴛʏ🎭"
     4. the purple circled R in the neon "M(R)TOASTY" sign on the Home wall
        picture (a click hotspot computed from the wall's runtime placement)
   Every click restarts the clip. Only text-node ® glyphs inside those
   elements are wrapped (span.tt-gotr); nothing is wrapped inside the
   Squarespace editor iframe, so no span can be saved into a block.
   Re-applies on DOM changes, so it survives the hourly Home rebuild. */
(function(){
  var W=window,D=document;
  if(W.__ttGottem)return;W.__ttGottem=1;
  try{if(W.self!==W.top)return;}catch(e){return;}
  var BASE='https://therapytoaster.github.io/tt-live/site-header/sfx/gottem';
  var V='?v=1';
  var CLS='tt-gotr';
  /* circled R on the wall picture, as fractions of the picture (2400x800) */
  var WR={cx:2009/2400,cy:670/800,r:46/2400};
  var audio=null;
  function isHome(){
    var p=(location.pathname||'/').replace(/\/+$/,'')||'/';
    return p==='/'||p==='/home'||(D.body&&D.body.classList.contains('homepage'));
  }
  function getAudio(){
    if(audio)return audio;
    audio=new Audio();
    var mp3=audio.canPlayType&&audio.canPlayType('audio/mpeg');
    audio.src=BASE+(mp3?'.mp3':'.ogg')+V;
    audio.preload='auto';
    audio.setAttribute('data-tt-gottem','1');
    return audio;
  }
  function play(){
    var a=getAudio();
    try{a.pause();a.currentTime=0;}catch(e){}
    var p=a.play();if(p&&p.catch)p.catch(function(){});
  }
  function wiggle(el){
    if(!el)return;
    el.classList.remove('tt-gotr-wig');void el.offsetWidth;el.classList.add('tt-gotr-wig');
    setTimeout(function(){el.classList.remove('tt-gotr-wig');},600);
  }
  function css(){
    if(D.getElementById('tt-gottem-css'))return;
    var s=D.createElement('style');s.id='tt-gottem-css';
    s.textContent=
      '.'+CLS+',.tt-blackr.'+CLS+'{cursor:pointer!important;display:inline-block;transform-origin:50% 60%;-webkit-tap-highlight-color:transparent;pointer-events:auto}'+
      '@keyframes ttGotWig{0%{transform:rotate(0) scale(1)}20%{transform:rotate(-14deg) scale(1.15)}40%{transform:rotate(11deg) scale(1.15)}60%{transform:rotate(-7deg) scale(1.08)}80%{transform:rotate(4deg) scale(1.03)}100%{transform:rotate(0) scale(1)}}'+
      '.tt-gotr-wig{animation:ttGotWig .55s ease-out!important}'+
      'html.tt-gotr-hot,html.tt-gotr-hot *{cursor:pointer!important}'+
      '#tt-gotr-ring{position:absolute;left:0;top:0;width:0;height:0;border-radius:50%;pointer-events:none;z-index:2147483000;opacity:0;box-shadow:0 0 0 3px #FFD400,0 0 18px 4px rgba(255,212,0,.75)}'+
      '@keyframes ttGotRing{0%{opacity:.95;transform:scale(.8) rotate(0)}30%{transform:scale(1.15) rotate(-10deg)}60%{transform:scale(1.05) rotate(8deg)}100%{opacity:0;transform:scale(1.35) rotate(0)}}'+
      '#tt-gotr-ring.go{animation:ttGotRing .6s ease-out}'+
      '@media (prefers-reduced-motion:reduce){.tt-gotr-wig,#tt-gotr-ring.go{animation:none!important}}';
    (D.head||D.documentElement).appendChild(s);
  }
  /* wrap every ® text glyph under el in span.tt-gotr (keeps a following U+FE0F with it) */
  function wrapR(el){
    if(!el||el.closest('script,style,noscript,textarea'))return;
    var w=D.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),n,list=[];
    while((n=w.nextNode())){
      if(n.nodeValue.indexOf('\u00AE')<0)continue;
      var p=n.parentNode;
      if(p&&p.classList&&(p.classList.contains(CLS)||p.classList.contains('tt-blackr')))continue;
      list.push(n);
    }
    list.forEach(function(t){
      var i;
      while(t&&(i=t.nodeValue.indexOf('\u00AE'))>-1){
        var len=(t.nodeValue.charAt(i+1)==='\uFE0F')?2:1;
        var r=t.splitText(i),rest=r.splitText(len);
        var s=D.createElement('span');s.className=CLS;s.setAttribute('aria-hidden','false');s.title='Ha, gottem';
        r.parentNode.replaceChild(s,r);s.appendChild(r);
        t=rest;
      }
    });
  }
  function apply(){
    if(!isHome())return;
    css();
    /* 1. hero heading */
    [].forEach.call(D.querySelectorAll('.sqs-html-content h1'),function(h){
      if(!/therapy\s*space/i.test(h.textContent))return;
      var b=h.querySelectorAll('.tt-blackr');
      if(b.length){[].forEach.call(b,function(x){x.classList.add(CLS);});}
      else {wrapR(h);[].forEach.call(h.querySelectorAll('.'+CLS),function(x){x.classList.add('tt-blackr');});}
    });
    /* 2. Dress like card heading */
    [].forEach.call(D.querySelectorAll('#ttmerch .ttm-logo'),wrapR);
    /* 3. announcement bar */
    [].forEach.call(D.querySelectorAll('.sqs-announcement-bar-text-inner, .sqs-announcement-bar-text'),wrapR);
    [].forEach.call(D.querySelectorAll('.'+CLS),function(x){
      x.setAttribute('role','button');x.setAttribute('tabindex','0');x.setAttribute('aria-label','Play Ha, gottem');x.title='Ha, gottem';
    });
    placeRing();
  }
  /* 4. wall picture hotspot */
  function wallR(){
    var tw=D.getElementById('tt-topwall');if(!tw)return null;
    var img=tw.querySelector('.tw-img');if(!img)return null;
    var rc=img.getBoundingClientRect();if(!rc.width||!rc.height)return null;
    var cs=getComputedStyle(img);
    if(!/home-wall-v2/.test(cs.backgroundImage||''))return null;
    var sz=(cs.backgroundSize||'').split(',')[0].trim().split(/\s+/)[0]||'100%';
    var bw=/%$/.test(sz)?rc.width*parseFloat(sz)/100:(parseFloat(sz)||rc.width);
    var bh=bw/3;
    var px=(cs.backgroundPositionX||'50%').split(',')[0].trim();
    var py=(cs.backgroundPositionY||'50%').split(',')[0].trim();
    var bx=/%$/.test(px)?(rc.width-bw)*parseFloat(px)/100:parseFloat(px)||0;
    var by=/%$/.test(py)?(rc.height-bh)*parseFloat(py)/100:parseFloat(py)||0;
    var cx=rc.left+bx+bw*WR.cx, cy=rc.top+by+bh*WR.cy, r=Math.max(bw*WR.r,18);
    /* the R must be inside the visible wallpaper box */
    if(cy<rc.top||cy>rc.bottom||cx<rc.left||cx>rc.right)return null;
    return {x:cx,y:cy,r:r,vr:bw*WR.r};
  }
  var ring=null;
  function placeRing(){
    var h=wallR();
    if(!h){if(ring)ring.style.display='none';return null;}
    if(!ring){ring=D.createElement('div');ring.id='tt-gotr-ring';D.body.appendChild(ring);}
    var vr=Math.max(h.vr,10);
    ring.style.display='block';
    ring.style.left=(h.x-vr+W.scrollX)+'px';ring.style.top=(h.y-vr+W.scrollY)+'px';
    ring.style.width=ring.style.height=(2*vr)+'px';
    return h;
  }
  /* only when the tap lands on the wall itself or on an empty page/section
     background over it, never on a card, widget or floating panel */
  var BGC=/(^|\s)(page-section|content-wrapper|content|section-background|section-border|fluid-engine|sqs-layout|row|col)(\s|$)/;
  function bgTarget(t){
    if(!t||!t.tagName)return true;
    if(t.closest&&t.closest('#tt-topwall'))return true;
    if(!(/^(HTML|BODY|MAIN|SECTION|ARTICLE|DIV)$/.test(t.tagName)))return false;
    if(t.tagName==='DIV'&&!BGC.test(typeof t.className==='string'?t.className:''))return false;
    for(var e=t;e&&e.nodeType===1&&e!==D.body;e=e.parentElement){
      var p=getComputedStyle(e).position;if(p==='fixed'||p==='sticky')return false;
    }
    return true;
  }
  function inWallR(x,y,t){
    if(!isHome())return false;
    if(t&&t.closest&&t.closest('a,button,input,textarea,select,label,[role="button"],iframe,.'+CLS+',.tt-blackr'))return false;
    if(!bgTarget(t))return false;
    var h=wallR();if(!h)return false;
    var dx=x-h.x,dy=y-h.y;return dx*dx+dy*dy<=h.r*h.r;
  }
  D.addEventListener('click',function(e){
    var t=e.target;
    if(!isHome())return;
    var r=t&&t.closest&&t.closest('.'+CLS);
    if(r){e.preventDefault();e.stopPropagation();play();wiggle(r);return;}
    if(inWallR(e.clientX,e.clientY,t)){
      e.preventDefault();e.stopPropagation();play();
      var h=placeRing();if(h&&ring){ring.classList.remove('go');void ring.offsetWidth;ring.classList.add('go');}
    }
  },true);
  D.addEventListener('keydown',function(e){
    if(!isHome()||(e.key!=='Enter'&&e.key!==' '))return;
    var r=e.target&&e.target.closest&&e.target.closest('.'+CLS);
    if(r){e.preventDefault();e.stopPropagation();play();wiggle(r);}
  },true);
  var hotRaf=0,lx=0,ly=0,lt=null;
  D.addEventListener('mousemove',function(e){
    lx=e.clientX;ly=e.clientY;lt=e.target;
    if(hotRaf)return;
    hotRaf=requestAnimationFrame(function(){
      hotRaf=0;
      var on=inWallR(lx,ly,lt);
      D.documentElement.classList.toggle('tt-gotr-hot',on);
    });
  },{passive:true});
  var q=0;
  function soon(){if(q)return;q=setTimeout(function(){q=0;apply();},250);}
  function boot(){
    apply();
    if(isHome())getAudio();
    try{new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){var t=ms[i].target;if(t&&t.id==='tt-gotr-ring')continue;soon();return;}
    }).observe(D.body||D.documentElement,{childList:true,subtree:true});}catch(e){}
    [300,1000,2500,5000,9000].forEach(function(ms){setTimeout(apply,ms);});
    W.addEventListener('resize',soon);W.addEventListener('load',apply);
    ['mercury:load','mercury:navigate'].forEach(function(ev){W.addEventListener(ev,soon);D.addEventListener(ev,soon);});
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
})();
/* /TT GOTTEM */
/* TT NEON v1 (header-bg.js v6.5-neon) =====
   Home only. Optional neon overlay on the #tt-topwall wall picture, tied to the
   real neon tubes in the picture (masks derived offline from home-wall-v2-2400:
   site-header/neon/neon-glow-800.webp, neon-tubes-1600.webp, neon-mask-800.webp).
   OFF by default. Pick a variant with:
     - the footer script URL:  header-bg.js?c=<sha>&neon=A   (A, B or C)
     - a preview URL on Home:  /?ttneon=A   (also B, C, off; kept for the tab session)
   A = Neon buzz: tubes glow, the halo and the M(R)TOASTY sign flicker now and then
   B = Neon bloom: soft bloom + slow pink/cyan/yellow color sweep along the tubes + faint scanlines
   C = Neon sparks: soft bloom + little sparks dripping off the tubes + rare electric arcs
   Sits above the wall picture and under the glitch canvas; pointer-events:none, so
   links and the wall-sign GOTTEM hotspot still work. prefers-reduced-motion: static
   bloom only. Animations pause when the tab is hidden or the wall is off screen. */
(function(){
  var W=window,D=document;
  if(W.__ttNeon)return;W.__ttNeon=1;
  try{if(W.self!==W.top)return;}catch(e){return;}
  var DEFAULT='';
  var me=D.currentScript,srcV='';
  try{if(me&&me.src){var m=/[?&]neon=([abc]|off)\b/i.exec(me.src);if(m)srcV=m[1].toUpperCase();}}catch(e){}
  var B='https://therapytoaster.github.io/tt-live/site-header/neon/',Q='?v=1';
  var GLOW=B+'neon-glow-800.webp'+Q,TUBES=B+'neon-tubes-1600.webp'+Q,MASK=B+'neon-mask-800.webp'+Q;
  var PTS='55ng14wlo05d1c1ca7s0hvao0ai6o07lc01gd5818yb42hvp029eak2a39802ay00323s05ntg01f0c02ofk0dhhk1fx341bfn817w3k1fyf00ja8s0fb0g2gpjs18n4w22yeg05phw27q701790s16whc1bp80150ko0chrk13lyg03neg09zoc029t401ytw08jfk2gvno18yh417q3428xj40exhc217mo04j9c08s542fsas0duso0db3w1gn3s09uow0jf500d7sk15lck0id2o2cdqw1ibk00d90c14pgg0c41g04tb00c3y81c2sw03efk0detk1d90g1dusk0743g1ibu826v8s1epxk08em41jctc0fn7o1am0o1dhps0h0u028w2029bvc25d1g1a76o021ag0fqtc08h741j6n40e1i40inwg09dcs1cpc01j7vk0a0i421l5o08cbs2f6y4088i81fuu009t3s284tw2gegs0dm7w0f9ws09d3c25rhg03ehc0fw2s0dcjw1agvc04lww025xs07v3k19an42euzg28zpc167sc1482g01f040a7880cbk01dtvg1g8h82jnw82etjk06j4o1gui80be481c6og2fye41ixsc07bik0bgl01hui40c9040c98c14aeo0ea1821yus0etl80c31w1558o03i640a9og09kis27dy41326o0hln404jg80j96g2haa407cqo03g0409fko2f9s02c2q01c8zc0fuwo27osk2caaw2bby419avo1dkzk0drcw01tuc0g61w2202009au01a49s29anc279101e9vs0fs0003sc001cl80h6u804bn009qvs1ccio11g8g03x9g0er2o021ac066sc28oik18ddk17mc02jgdo07npk14j800c6jg0h3481gobk12tgw08bb80dtow022lc0diy80925k1c7vs17ynw2enjo2j43k0b70g24quk08r4c13yi007sk424gok0e09o0bmqk17jsg126400ce7o1536s17oyg1690w1dsbw0dmf8190so13lv009ue42cp3c177lo1eisc08dk026u8c15hy41dxew0dqdk02m2g0bz5g21clc0ck9415gg40akgg09udk2fdlo0a3142gn3411yu00ehfc22dig0gm3k2544s0cahs1fn7k1auew0d3zw144h00fqss0chos14fhw0df8k090x41echk26yy81hmmw0h9b00iy282h1wo01rdg0alw00focs0j7vo0fia81fjr40f4zc0jcmo0a3cg03pjk0dvbk07tms156r806nu41d8ug1dw6g0a4es0dgbs19z9c282og0g5to06rjg17hi81gc842a3ew0gycw29x6w03uso05phs2a7yg2fepc1hn282ezwg19up0087ao2bbp4022io0epuw0hkd414fg80fzsk0ca2c1j1o02iiyk0a23c0dso4132fk0ighs0b36g0fb0c17q8o159b40e7eo05j6c1dkzc09ecc2i7uo0hln809pgk2a77009pxg046xs03d8w07p0c14vro0jbnc2i3zg0hj6c07xbw19rvg2592809ks01geds1a77404i1807f7c0c1tk1jlf029lrc227jw0beew190pc2a0vo088fo1cae429y1427md42dtoo0etl40f4zg0e7og09fl82azgw0ht9s0hlts2d6ho1gpk01hltg28n782dbbc17sek1b95w09n6g1c97417qcg0jk702b6pc0gxz8024xk0fsaw0aib018h1023lv40euz825bis02dbs05e7g05ld80g11g38yrk09n941gwz001noc0fcdg08x2o2be600ahzo0fr4s07l8c1ials28ksw1cfao1dkzo04gsw0d1o01276s0bbmo03m600g5t0139lg0j8ww0fr4c0eb783ecfo3esjk2j92s24bn4094hg2c5c828esg2ikhc29mzk2ekpg0a9ow0doq80cdqs15p1g029p408fyk19e9w2';
  var PAL=['90,200,255','255,90,120','255,212,0','255,255,255'];
  var rmq=W.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  function variant(){
    var v='';
    try{var m=/[?&]ttneon=([abc]|off)\b/i.exec(location.search);
      if(m){v=m[1].toUpperCase();sessionStorage.setItem('ttneon',v);}
      else v=sessionStorage.getItem('ttneon')||'';}catch(e){}
    v=v||srcV||DEFAULT;
    return (v==='A'||v==='B'||v==='C'||v==='D')?v:'';
  }
  function isHome(){
    var p=(location.pathname||'/').replace(/\/+$/,'')||'/';
    return p==='/'||p==='/home'||(D.body&&D.body.classList.contains('homepage'));
  }
  function css(){
    if(D.getElementById('tt-neon-css'))return;
    var s=D.createElement('style');s.id='tt-neon-css';
    var mk='-webkit-mask-image:url("'+MASK+'");mask-image:url("'+MASK+'");-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;';
    s.textContent=
      '#tt-neon{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:1;overflow:visible;contain:layout style;}'+
      '#tt-neon *{pointer-events:none;position:absolute;}'+
      '#tt-neon .tn-glow{inset:-3% -2%;background:url("'+GLOW+'") center/100% 100% no-repeat;mix-blend-mode:screen;will-change:opacity;}'+
      '#tt-neon .tn-tube{inset:0;background:url("'+TUBES+'") center/100% 100% no-repeat;mix-blend-mode:screen;will-change:opacity;}'+
      '#tt-neon .tn-dim{inset:0;background:#000;'+mk+'opacity:0;will-change:opacity;}'+
      /* clip regions (fractions of the 2400x800 picture) */
      '#tt-neon .r-halo{clip-path:inset(0 41% 84% 37%);}'+
      '#tt-neon .r-sign{clip-path:inset(74% 2% 4% 76%);}'+
      '#tt-neon .r-big{clip-path:polygon(0 0,37% 0,37% 16%,59% 16%,59% 0,100% 0,100% 74%,76% 74%,76% 100%,0 100%);}'+
      /* A: buzz + flicker */
      '#tt-neon.v-A .tn-glow{opacity:.62;}#tt-neon.v-A .tn-tube{opacity:.42;}'+
      '#tt-neon.v-A .r-big.tn-glow{animation:ttnBreath 5.5s ease-in-out infinite;}'+
      '#tt-neon.v-A .r-halo.tn-glow,#tt-neon.v-A .r-halo.tn-tube{animation:ttnFlkA 7.3s steps(1,end) infinite;}'+
      '#tt-neon.v-A .r-halo.tn-dim{animation:ttnDimA 7.3s steps(1,end) infinite;}'+
      '#tt-neon.v-A .r-sign.tn-glow,#tt-neon.v-A .r-sign.tn-tube{animation:ttnFlkB 11.7s steps(1,end) infinite;}'+
      '#tt-neon.v-A .r-sign.tn-dim{animation:ttnDimB 11.7s steps(1,end) infinite;}'+
      '@keyframes ttnBreath{0%,100%{opacity:.55}50%{opacity:.75}}'+
      '@keyframes ttnFlkA{0%{opacity:.7}61%{opacity:.7}62%{opacity:.05}63%{opacity:.8}64.5%{opacity:0}66%{opacity:.85}67%{opacity:.25}68%{opacity:.75}88%{opacity:.7}88.6%{opacity:.1}89.2%{opacity:.7}100%{opacity:.7}}'+
      '@keyframes ttnDimA{0%{opacity:0}62%{opacity:.7}63%{opacity:0}64.5%{opacity:.8}66%{opacity:0}67%{opacity:.45}68%{opacity:0}88.6%{opacity:.6}89.2%{opacity:0}100%{opacity:0}}'+
      '@keyframes ttnFlkB{0%{opacity:.75}40%{opacity:.75}40.6%{opacity:.08}41.2%{opacity:.8}42%{opacity:.15}43.4%{opacity:.8}79%{opacity:.75}79.4%{opacity:0}82%{opacity:0}82.4%{opacity:.4}82.8%{opacity:0}83.6%{opacity:.85}100%{opacity:.75}}'+
      '@keyframes ttnDimB{0%{opacity:0}40.6%{opacity:.65}41.2%{opacity:0}42%{opacity:.55}43.4%{opacity:0}79.4%{opacity:.82}82.4%{opacity:.3}82.8%{opacity:.82}83.6%{opacity:0}100%{opacity:0}}'+
      /* B: bloom + color sweep + scanlines */
      '#tt-neon.v-B .tn-glow{opacity:.55;animation:ttnBreath 6s ease-in-out infinite;}'+
      '#tt-neon .tn-sweep{inset:0;overflow:hidden;'+mk+'mix-blend-mode:screen;opacity:.8;}'+
      '#tt-neon .tn-sweep i{top:0;bottom:0;left:0;width:300%;display:block;will-change:transform;'+
        'background:linear-gradient(100deg,rgba(255,60,170,0) 0%,rgba(255,60,170,.95) 6%,rgba(0,240,255,.95) 14%,rgba(255,212,0,.95) 22%,rgba(255,60,170,0) 30%,rgba(255,60,170,0) 33.333%,'+
          'rgba(255,60,170,.95) 39.333%,rgba(0,240,255,.95) 47.333%,rgba(255,212,0,.95) 55.333%,rgba(255,60,170,0) 63.333%,rgba(0,0,0,0) 100%);'+
        'animation:ttnSweep 9s linear infinite;}'+
      '@keyframes ttnSweep{from{transform:translate3d(0,0,0)}to{transform:translate3d(-33.333%,0,0)}}'+
      '#tt-neon .tn-scan{inset:0;overflow:hidden;opacity:.5;}'+
      '#tt-neon .tn-scan i{left:0;right:0;top:-8px;bottom:0;display:block;will-change:transform;'+
        'background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,rgba(0,0,0,0) 1px 4px);animation:ttnScan 1.6s linear infinite;}'+
      '@keyframes ttnScan{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,4px,0)}}'+
      /* C: sparks canvas + bloom */
      '#tt-neon.v-C .tn-glow{opacity:.5;}'+
      '#tt-neon canvas{left:-2%;top:-2%;width:104%;height:110%;display:block;}'+
      '@media (prefers-reduced-motion:reduce){#tt-neon *{animation:none!important}#tt-neon .tn-dim{opacity:0!important}}';
    (D.head||D.documentElement).appendChild(s);
  }
  var el=null,cur='',box=null;
  function rect(){
    var tw=D.getElementById('tt-topwall');if(!tw)return null;
    var img=tw.querySelector('.tw-img');if(!img)return null;
    var rc=img.getBoundingClientRect(),tr=tw.getBoundingClientRect();if(!rc.width||!rc.height)return null;
    var cs=getComputedStyle(img);
    if(!/home-wall-v2/.test(cs.backgroundImage||''))return null;
    var sz=(cs.backgroundSize||'').split(',')[0].trim().split(/\s+/)[0]||'100%';
    var bw=/%$/.test(sz)?rc.width*parseFloat(sz)/100:(parseFloat(sz)||rc.width),bh=bw/3;
    var px=(cs.backgroundPositionX||'50%').split(',')[0].trim(),py=(cs.backgroundPositionY||'50%').split(',')[0].trim();
    var bx=/%$/.test(px)?(rc.width-bw)*parseFloat(px)/100:parseFloat(px)||0;
    var by=/%$/.test(py)?(rc.height-bh)*parseFloat(py)/100:parseFloat(py)||0;
    return {tw:tw,x:rc.left-tr.left+bx,y:rc.top-tr.top+by,w:bw,h:bh};
  }
  function place(){
    if(!el)return;
    var r=rect();if(!r){el.style.display='none';return;}
    if(el.parentNode!==r.tw){var c=r.tw.querySelector('canvas#tt-site-ook-cv');r.tw.insertBefore(el,c||null);}
    el.style.display='block';
    el.style.left=Math.round(r.x)+'px';el.style.top=Math.round(r.y)+'px';
    el.style.width=Math.round(r.w)+'px';el.style.height=Math.round(r.h)+'px';
    if(!box||box.w!==Math.round(r.w)||box.h!==Math.round(r.h)){box={w:Math.round(r.w),h:Math.round(r.h)};if(cur==='C')sizeC();}
  }
  function layer(cls,par){var d=D.createElement('div');d.className=cls;(par||el).appendChild(d);return d;}
  function build(v){
    destroy();
    css();
    el=D.createElement('div');el.id='tt-neon';el.className='v-'+v;el.setAttribute('aria-hidden','true');
    if(v==='A'){
      ['r-big','r-halo','r-sign'].forEach(function(r){if(r!=='r-big')layer('tn-dim '+r);layer('tn-glow '+r);layer('tn-tube '+r);});
    }else if(v==='B'){
      layer('tn-glow');layer('tn-tube').style.opacity='.18';
      layer('tn-sweep').appendChild(D.createElement('i'));
      layer('tn-scan').appendChild(D.createElement('i'));
    }else{
      layer('tn-glow');
      cv=D.createElement('canvas');el.appendChild(cv);cx=cv.getContext('2d');
    }
    cur=v;box=null;place();
    if(v==='C')startC();
    watch();
  }
  /* ---- C: sparks ---- */
  var cv=null,cx=null,raf=0,P=[],pts=null,sp=[],arc=null,nextArc=0,last=0,cw=0,ch=0,k=1,vis=!D.hidden,onS=true,io=null;
  function decode(){
    if(pts)return pts;pts=[];
    for(var i=0;i+5<=PTS.length;i+=5){var v=parseInt(PTS.substr(i,4),36);pts.push({x:(Math.floor(v/800)*2)/2400,y:(v%800)/800,c:+PTS.charAt(i+4)});}
    return pts;
  }
  function sizeC(){
    if(!cv||!box)return;
    var d=Math.min(W.devicePixelRatio||1,2),mob=box.w<700;k=(mob?.6:.5)*d;
    var w=box.w*1.04,h=box.h*1.10;if(w*k*h*k>(mob?120000:260000))k=Math.sqrt((mob?120000:260000)/(w*h));
    cw=Math.max(40,Math.round(w*k));ch=Math.max(20,Math.round(h*k));cv.width=cw;cv.height=ch;
  }
  function px(p){return {x:(p.x*1/1.04+.02/1.04)*cw,y:(p.y/1.10+.02/1.10)*ch};}
  function spawn(){
    var a=decode(),p=a[Math.random()*a.length|0],q=px(p);
    sp.push({x:q.x,y:q.y,vx:(Math.random()-.5)*70*k,vy:(-20-Math.random()*60)*k,l:0,L:.45+Math.random()*.8,c:PAL[p.c],s:(2.2+Math.random()*2.4)*k});
  }
  function mkArc(){
    var a=decode(),p=a[Math.random()*a.length|0],q=px(p),best=null,bd=1e9;
    for(var i=0;i<40;i++){var o=a[Math.random()*a.length|0],r=px(o),dx=r.x-q.x,dy=r.y-q.y,dd=dx*dx+dy*dy;var want=(90*k)*(90*k);
      if(dd>(12*k)*(12*k)&&Math.abs(dd-want)<bd){bd=Math.abs(dd-want);best=r;}}
    if(!best)return null;
    var segs=[],n=9;for(var j=0;j<=n;j++){var t=j/n,j1=(j===0||j===n)?0:1;segs.push([q.x+(best.x-q.x)*t+(Math.random()-.5)*22*k*j1,q.y+(best.y-q.y)*t+(Math.random()-.5)*22*k*j1]);}
    return {s:segs,l:0,L:.32,c:PAL[p.c]};
  }
  function frame(t){
    raf=0;if(!cv||cur!=='C'||!vis||!onS)return;
    raf=requestAnimationFrame(frame);
    if(t-last<33)return;var dt=Math.min(.1,(t-last)/1000||.033);last=t;
    var mob=box&&box.w<700,rate=mob?16:40;
    var n=rate*dt;while(n>0){if(Math.random()<n)spawn();n-=1;}
    if(sp.length>(mob?60:120))sp.splice(0,sp.length-(mob?60:120));
    cx.clearRect(0,0,cw,ch);cx.globalCompositeOperation='lighter';cx.lineCap='round';
    for(var i=sp.length-1;i>=0;i--){var s=sp[i];s.l+=dt;if(s.l>s.L){sp.splice(i,1);continue;}
      s.vy+=160*k*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;var a=1-s.l/s.L;
      cx.strokeStyle='rgba('+s.c+','+(a*.28).toFixed(3)+')';cx.lineWidth=s.s*3.2;
      cx.beginPath();cx.moveTo(s.x,s.y);cx.lineTo(s.x-s.vx*.11,s.y-s.vy*.11);cx.stroke();
      cx.strokeStyle='rgba('+s.c+','+a.toFixed(3)+')';cx.lineWidth=s.s;cx.stroke();
      cx.fillStyle='rgba(255,255,255,'+(a*.8).toFixed(3)+')';cx.fillRect(s.x-s.s*.5,s.y-s.s*.5,s.s,s.s);}
    if(!arc&&t>nextArc){arc=mkArc();nextArc=t+1300+Math.random()*2600;}
    if(arc){arc.l+=dt;if(arc.l>arc.L)arc=null;else{
      var g=arc.s,fl=Math.random()<.5?1:.55;
      [[10*k,'rgba('+arc.c+','+(.3*fl)+')'],[3.4*k,'rgba('+arc.c+','+(.85*fl)+')'],[1.4*k,'rgba(255,255,255,'+(.95*fl)+')']].forEach(function(st){
        cx.lineWidth=st[0];cx.strokeStyle=st[1];cx.beginPath();cx.moveTo(g[0][0],g[0][1]);
        for(var j=1;j<g.length;j++)cx.lineTo(g[j][0]+(Math.random()-.5)*3*k,g[j][1]+(Math.random()-.5)*3*k);cx.stroke();});
    }}
    cx.globalCompositeOperation='source-over';
  }
  function startC(){
    if(cur!=='C'||rmq.matches||raf||!vis||!onS)return;
    sizeC();last=0;raf=requestAnimationFrame(frame);
  }
  function stopC(){if(raf)cancelAnimationFrame(raf);raf=0;if(cx&&cw)cx.clearRect(0,0,cw,ch);sp=[];arc=null;}
  /* pause CSS animations too when hidden / off screen */
  function pause(p){if(el)[].forEach.call(el.querySelectorAll('*'),function(n){n.style.animationPlayState=p?'paused':'';});}
  var ro=null,mo=null;
  function watch(){
    var tw=D.getElementById('tt-topwall');if(!tw)return;
    if(W.ResizeObserver){if(ro)ro.disconnect();ro=new ResizeObserver(function(){place();});ro.observe(tw);}
    var img=tw.querySelector('.tw-img');
    if(img){if(mo)mo.disconnect();mo=new MutationObserver(function(){place();});mo.observe(img,{attributes:true,attributeFilter:['style','class']});}
    if('IntersectionObserver' in W){if(io)io.disconnect();io=new IntersectionObserver(function(e){onS=e[e.length-1].isIntersecting;pause(!onS);if(onS)startC();else stopC();});io.observe(el);}
  }
  function destroy(){
    stopC();if(ro){ro.disconnect();ro=null;}if(mo){mo.disconnect();mo=null;}if(io){io.disconnect();io=null;}
    if(el&&el.parentNode)el.parentNode.removeChild(el);el=null;cv=null;cx=null;cur='';box=null;
  }
  function apply(){
    var v=isHome()?variant():'';
    if(!v){if(el)destroy();return;}
    if(!D.getElementById('tt-topwall'))return;
    if(el&&el.isConnected&&cur===v){place();return;}
    build(v);
  }
  var q=0;function soon(){if(q)return;q=setTimeout(function(){q=0;apply();},250);}
  function boot(){
    apply();
    [300,1000,2500,5000,9000].forEach(function(ms){setTimeout(apply,ms);});
    W.addEventListener('resize',soon);W.addEventListener('load',apply);
    D.addEventListener('visibilitychange',function(){vis=!D.hidden;pause(!vis);if(vis)startC();else stopC();});
    if(rmq.addEventListener)rmq.addEventListener('change',function(){if(rmq.matches)stopC();else startC();});
    try{new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){var t=ms[i].target;if(t&&(t.id==='tt-neon'||(t.closest&&t.closest('#tt-neon'))))continue;
        if(!el||!el.isConnected||ms[i].type==='childList'){soon();return;}}
    }).observe(D.body||D.documentElement,{childList:true,subtree:true});}catch(e){}
    ['mercury:load','mercury:navigate'].forEach(function(ev){W.addEventListener(ev,soon);D.addEventListener(ev,soon);});
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
})();
/* /TT NEON */
/* TT SPARKS v1 (header-bg.js v6.6-sparks) =====
   Home only. Extends the wall neon down the rest of the page: a soft neon
   rim on the main cards, embers drifting off the wall and section edges,
   little pops and an occasional flicker. OFF unless:
     - the footer script URL:  header-bg.js?c=<sha>&neon=A&sparks=1
     - a preview URL on Home:  /?ttsparks=1   (also off; kept for the tab session)
   One fixed canvas, pointer-events:none, so GOTTEM Rs, the Dress like card,
   tickers, ARTcade and embeds stay clickable and uncovered. prefers-reduced-motion:
   static rims only. Animations pause when the tab is hidden. Particle count
   is capped, and lower on mobile. */
(function(){
  var W=window,D=document;
  if(W.__ttSparks)return;W.__ttSparks=1;
  try{if(W.self!==W.top)return;}catch(e){return;}
  var me=D.currentScript,srcOn=false;
  try{if(me&&me.src){var m=/[?&]sparks=(1|on|true|off)\b/i.exec(me.src);if(m)srcOn=m[1].toLowerCase()!=='off';}}catch(e){}
  var rmq=W.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  var PAL=['90,200,255','255,212,0','255,90,120','255,255,255'];
  var SEL=['#ttps','.ttm-link','#ttarcb','#ttmb-book','#ttbk-book','#tt-art','#ttwall','.crew a.card','#ttcmg','#tttsla','#ttspcx','#ttsol','#tteth','#tt-drop'];
  function wanted(){
    var v='';
    try{var m=/[?&]ttsparks=(1|on|true|off)\b/i.exec(location.search);
      if(m){v=m[1].toLowerCase();sessionStorage.setItem('ttsparks',v);}
      else v=sessionStorage.getItem('ttsparks')||'';}catch(e){}
    if(v)return v!=='off';
    return srcOn;
  }
  function isHome(){
    var p=(location.pathname||'/').replace(/\/+$/,'')||'/';
    return p==='/'||p==='/home'||(D.body&&D.body.classList.contains('homepage'));
  }
  var cv=null,cx=null,raf=0,sp=[],arcs=[],tg=[],last=0,cw=0,ch=0,k=1,vis=!D.hidden,nextBurst=0,nextFlick=0,nextArc=0,flick=null,wallY=-1,wallX=0,wallW=0;
  function css(){
    if(D.getElementById('tt-sparks-css'))return;
    var s=D.createElement('style');s.id='tt-sparks-css';
    s.textContent='#tt-sparks{position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:6;mix-blend-mode:screen;contain:strict;}';
    (D.head||D.documentElement).appendChild(s);
  }
  function size(){
    if(!cv)return;
    var vw=W.innerWidth||D.documentElement.clientWidth||320,vh=W.innerHeight||D.documentElement.clientHeight||480;
    var mob=vw<700,d=Math.min(W.devicePixelRatio||1,mob?1:1.25),cap=mob?360000:1100000;
    k=d;if(vw*vh*k*k>cap)k=Math.sqrt(cap/(vw*vh));
    var w=Math.max(320,Math.round(vw*k)),h=Math.max(240,Math.round(vh*k));
    if(cw===w&&ch===h)return;cw=w;ch=h;cv.width=w;cv.height=h;
  }
  function rad(el){
    var s=getComputedStyle(el),r=parseFloat(s.borderTopLeftRadius)||0;
    if(/%$/.test(s.borderTopLeftRadius||''))r=Math.min(el.offsetWidth,el.offsetHeight)*r/100;
    return r;
  }
  function collect(){
    tg=[];
    for(var i=0;i<SEL.length;i++){
      var nodes=D.querySelectorAll(SEL[i]);
      for(var j=0;j<nodes.length;j++){
        var el=nodes[j],rc=el.getBoundingClientRect();
        if(rc.width<48||rc.height<28)continue;
        tg.push({el:el,c:PAL[tg.length%PAL.length],r:rad(el),pad:rc.width>900?14:10});
      }
    }
  }
  function visTg(){
    var out=[],pad=80;
    for(var i=0;i<tg.length;i++){
      var el=tg[i].el;if(!el||!el.isConnected)continue;
      var rc=el.getBoundingClientRect();
      if(!rc.width||rc.bottom<-pad||rc.top>ch/k+pad||rc.right<-pad||rc.left>cw/k+pad)continue;
      out.push({x:rc.left*k,y:rc.top*k,w:rc.width*k,h:rc.height*k,r:tg[i].r*k,c:tg[i].c,pad:tg[i].pad*k,area:rc.width*rc.height});
    }
    return out;
  }
  function wall(){
    wallY=-1;
    var tw=D.getElementById('tt-topwall');if(!tw)return;
    var img=tw.querySelector('.tw-img')||tw,rc=img.getBoundingClientRect();
    if(!rc.width)return;
    wallY=rc.bottom*k;wallX=rc.left*k;wallW=rc.width*k;
  }
  function rrect(c,x,y,w,h,r){
    r=Math.max(0,Math.min(r,w/2,h/2));
    c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
  }
  function onEdge(t,u){
    var p=u*((t.w+t.h)*2),x=t.x,y=t.y;
    if(p<t.w){x+=p;y=t.y;}
    else if(p<t.w+t.h){x=t.x+t.w;y+=p-t.w;}
    else if(p<t.w*2+t.h){x+=t.w-(p-(t.w+t.h));y=t.y+t.h;}
    else{x=t.x;y+=t.h-(p-(t.w*2+t.h));}
    return {x:x,y:y};
  }
  function emit(x,y,c,burst){
    var n=burst?(4+Math.random()*6|0):1;
    for(var i=0;i<n;i++){
      var ang=burst?Math.random()*Math.PI*2:(Math.random()-.5)*1.2+Math.PI/2;
      var spd=(burst?70:36)+Math.random()*(burst?110:70);
      sp.push({x:x,y:y,vx:Math.cos(ang)*spd*k,vy:Math.sin(ang)*spd*k,l:0,L:(burst?.4:.7)+Math.random()*(burst?.45:.7),c:c,s:(1.6+Math.random()*1.8)*k});
    }
  }
  function mkArc(t){
    var a=Math.random(),b=a+.08+Math.random()*.16;if(b>1){a-=b-1;b=1;}
    var n=7,segs=[];
    for(var i=0;i<=n;i++){
      var p=onEdge(t,a+(b-a)*i/n),j=i&&i<n?1:0;
      segs.push([p.x+(Math.random()-.5)*10*k*j,p.y+(Math.random()-.5)*10*k*j]);
    }
    return {s:segs,l:0,L:.22+.18*Math.random(),c:t.c};
  }
  function cap(){
    var mob=(cw/k)<700,m=mob?40:90;
    if(sp.length>m)sp.splice(0,sp.length-m);
    if(arcs.length>3)arcs.length=3;
  }
  function drawRims(list,t){
    var breath=.72+.18*Math.sin(t/1400);
    for(var i=0;i<list.length;i++){
      var g=list[i],a=breath;
      if(flick&&flick.i===i)a*=flick.v;
      var x=g.x-g.pad,y=g.y-g.pad,w=g.w+g.pad*2,h=g.h+g.pad*2,r=g.r+g.pad;
      rrect(cx,x,y,w,h,r);
      cx.strokeStyle='rgba('+g.c+','+(a*.16).toFixed(3)+')';cx.lineWidth=22*k;cx.stroke();
      rrect(cx,x,y,w,h,r);
      cx.strokeStyle='rgba('+g.c+','+(a*.42).toFixed(3)+')';cx.lineWidth=7*k;cx.stroke();
      rrect(cx,x,y,w,h,r);
      cx.strokeStyle='rgba('+g.c+','+(a*.7).toFixed(3)+')';cx.lineWidth=2.2*k;cx.stroke();
      rrect(cx,x,y,w,h,r);
      cx.strokeStyle='rgba(255,255,255,'+(a*.28).toFixed(3)+')';cx.lineWidth=.9*k;cx.stroke();
    }
  }
  function frame(t){
    raf=0;if(!cv||!vis)return;
    raf=requestAnimationFrame(frame);
    if(t-last<33)return;var dt=Math.min(.1,(t-last)/1000||.033);last=t;
    size();wall();
    var list=visTg(),mob=(cw/k)<700,vw=cw,vh=ch;
    cx.clearRect(0,0,cw,ch);
    cx.globalCompositeOperation='lighter';cx.lineCap='round';cx.lineJoin='round';
    if(list.length)drawRims(list,t);
    if(!rmq.matches){
      var rate=(mob?12:24)*dt;
      if(wallY>-1&&wallY>-40*k&&wallY<vh+20*k){
        var wr=rate*.95;while(wr>0){if(Math.random()<wr){var wx=wallX+wallW*(.08+.84*Math.random());emit(wx,wallY,PAL[Math.random()*PAL.length|0],false);var last=sp[sp.length-1];last.vy=Math.abs(last.vy)*.8+40*k;last.vx+=(Math.random()-.5)*16*k;}wr-=1;}
      }
      var er=rate*.85;while(er>0){if(Math.random()<er&&list.length){var g=list[Math.random()*list.length|0],p=onEdge(g,Math.random());emit(p.x,p.y,g.c,false);}er-=1;}
      if(t>nextBurst&&list.length){var b=list[Math.random()*list.length|0],bp=onEdge(b,Math.random());emit(bp.x,bp.y,b.c,true);nextBurst=t+1600+Math.random()*2800;}
      if(t>nextArc&&list.length&&!mob){arcs.push(mkArc(list[Math.random()*list.length|0]));nextArc=t+1800+Math.random()*3200;}
      if(t>nextFlick&&list.length){flick={i:Math.random()*list.length|0,v:.12+Math.random()*.15,until:t+70+Math.random()*90};nextFlick=t+2200+Math.random()*3800;}
      if(flick&&t>flick.until)flick=null;
      cap();
      for(var i=sp.length-1;i>=0;i--){
        var s=sp[i];s.l+=dt;if(s.l>s.L){sp.splice(i,1);continue;}
        s.vy+=80*k*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vx*=(1-dt*.4);
        var a=1-s.l/s.L,tl=.28;
        cx.strokeStyle='rgba('+s.c+','+(a*.32).toFixed(3)+')';cx.lineWidth=s.s*2;
        cx.beginPath();cx.moveTo(s.x,s.y);cx.lineTo(s.x-s.vx*tl,s.y-s.vy*tl);cx.stroke();
        cx.strokeStyle='rgba('+s.c+','+a.toFixed(3)+')';cx.lineWidth=Math.max(1,s.s*.75);cx.stroke();
        cx.fillStyle='rgba(255,255,255,'+(a*.9).toFixed(3)+')';cx.fillRect(s.x-k,s.y-k,2*k,2*k);
      }
      for(var j=arcs.length-1;j>=0;j--){
        var ar=arcs[j];ar.l+=dt;if(ar.l>ar.L){arcs.splice(j,1);continue;}
        var g=ar.s,fl=Math.random()<.45?.55:1,aa=1-ar.l/ar.L;
        [[9*k,'rgba('+ar.c+','+(.28*fl*aa)+')'],[3*k,'rgba('+ar.c+','+(.8*fl*aa)+')'],[1.2*k,'rgba(255,255,255,'+(.9*fl*aa)+')']].forEach(function(st){
          cx.lineWidth=st[0];cx.strokeStyle=st[1];cx.beginPath();cx.moveTo(g[0][0],g[0][1]);
          for(var n=1;n<g.length;n++)cx.lineTo(g[n][0]+(Math.random()-.5)*2*k,g[n][1]+(Math.random()-.5)*2*k);cx.stroke();
        });
      }
    }
    cx.globalCompositeOperation='source-over';
  }
  function start(){
    if(rmq.matches){if(cv&&vis){size();wall();cx.clearRect(0,0,cw,ch);cx.globalCompositeOperation='lighter';drawRims(visTg(),0);cx.globalCompositeOperation='source-over';}return;}
    if(raf||!vis||!cv)return;last=0;raf=requestAnimationFrame(frame);
  }
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;sp=[];arcs=[];flick=null;if(cx&&cw)cx.clearRect(0,0,cw,ch);}
  function build(){
    css();
    if(!cv){cv=D.createElement('canvas');cv.id='tt-sparks';cv.setAttribute('aria-hidden','true');(D.body||D.documentElement).appendChild(cv);cx=cv.getContext('2d');}
    size();collect();start();
  }
  function destroy(){
    stop();
    if(cv&&cv.parentNode)cv.parentNode.removeChild(cv);cv=null;cx=null;tg=[];
  }
  function apply(){
    if(!(isHome()&&wanted())){if(cv)destroy();return;}
    if(cv&&cv.isConnected){collect();if(!raf)start();return;}
    build();
  }
  var q=0;function soon(){if(q)return;q=setTimeout(function(){q=0;apply();},250);}
  function boot(){
    apply();
    [400,1200,2800,6000].forEach(function(ms){setTimeout(apply,ms);});
    W.addEventListener('resize',function(){if(!cv)return;size();collect();if(rmq.matches)start();});
    W.addEventListener('scroll',function(){if(cv&&rmq.matches)start();},{passive:true});
    W.addEventListener('load',apply);
    D.addEventListener('visibilitychange',function(){vis=!D.hidden;if(vis)start();else stop();});
    if(rmq.addEventListener)rmq.addEventListener('change',function(){stop();if(cv)start();});
    try{new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){var t=ms[i].target;if(t&&(t.id==='tt-sparks'||(t.closest&&t.closest('#tt-sparks'))))continue;
        if(!cv||!cv.isConnected||ms[i].type==='childList'){soon();return;}}
    }).observe(D.body||D.documentElement,{childList:true,subtree:true});}catch(e){}
    ['mercury:load','mercury:navigate'].forEach(function(ev){W.addEventListener(ev,soon);D.addEventListener(ev,soon);});
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
})();
/* /TT SPARKS */
/* TT NAV v1 (header-bg.js v6.8-nav) =====
   Desktop only (min-width 1024px). Optional looks for the top header
   nav tabs, including folder titles and dropdowns. The mobile / hamburger
   menu is left alone. OFF unless:
     - the footer script URL:  header-bg.js?c=<sha>&neon=A&sparks=1&nav=A
       (A, B, C or D)
     - a preview URL:  /?ttnav=A   (also B, C, D, off; kept for the tab session)
   A = Neon tubes: glass-tube tabs that hum, glow, and buzz brighter on hover
   B = Glitch / VHS: RGB-split labels, a scanline hover, and VHS jitter
   C = Arcade buttons: chunky pixel buttons that press in, with a lit active marker
   D = A+B: A's rounded neon-tube shell, glow, hum/flicker and white-hot hover
       glow on the outside; B's RGB-split labels, scanlines, rare idle tear,
       and VHS jitter + scanline wipe on the inside. Active tab keeps A's
       cyan electrode and under-glow, with a light RGB fringe.
   Does not change tab order, labels, or hrefs. Does not disable folder
   dropdowns or the header video / glow. prefers-reduced-motion: static
   look, no buzz, jitter, or press animation. */
(function(){
  var W=window,D=document;
  if(W.__ttNav)return;W.__ttNav=1;
  try{if(W.self!==W.top)return;}catch(e){return;}
  var DEFAULT='';
  var me=D.currentScript,srcV='';
  try{if(me&&me.src){var m=/[?&]nav=([abcd]|off)\b/i.exec(me.src);if(m)srcV=m[1].toUpperCase();}}catch(e){}
  var CLS=['tt-nav-A','tt-nav-B','tt-nav-C','tt-nav-D'];
  var MQ=W.matchMedia?matchMedia('(min-width:1024px)'):{matches:true,addEventListener:function(){}};
  function variant(){
    var v='';
    try{var m=/[?&]ttnav=([abcd]|off)\b/i.exec(location.search);
      if(m){v=m[1].toUpperCase();sessionStorage.setItem('ttnav',v);}
      else v=sessionStorage.getItem('ttnav')||'';}catch(e){}
    v=v||srcV||DEFAULT;
    return (v==='A'||v==='B'||v==='C')?v:'';
  }
  function css(){
    if(D.getElementById('tt-nav-css'))return;
    var s=D.createElement('style');s.id='tt-nav-css';
    s.textContent=""
    +"@media screen and (min-width:1024px){"
    /* shared resets so the existing boxed / ▶ / underline chrome can be replaced */
    +"body.tt-nav-A .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item .header-nav-folder-title,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item .header-nav-folder-title,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title{"
    +"appearance:none!important;-webkit-appearance:none!important;"
    +"background-image:none!important;overflow:visible!important;"
    +"text-decoration:none!important;text-transform:uppercase!important;"
    +"font-family:Anton,Impact,sans-serif!important;font-weight:400!important;"
    +"font-size:clamp(26px,1.15vw + 14px,36px)!important;line-height:.95!important;"
    +"letter-spacing:.02em!important;text-align:center!important;cursor:pointer!important;"
    +"paint-order:stroke fill;}"
    +"body.tt-nav-A .header-display-desktop .header-nav-item>a::before,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item>a::after,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item .header-nav-folder-title::before,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item .header-nav-folder-title::after,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a::before,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a::after,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title::before,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title::after,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item>a::before,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item>a::after,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item .header-nav-folder-title::before,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item .header-nav-folder-title::after,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a::before,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a::after,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title::before,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title::after{"
    +"content:none!important;background-image:none!important;transform:none!important;}"
    +"body.tt-nav-A .header-display-desktop .header-nav-item--folder .header-nav-folder-title-text,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item--folder .header-nav-folder-title *,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item--folder .header-nav-folder-title-text,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item--folder .header-nav-folder-title *,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--folder .header-nav-folder-title-text,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--folder .header-nav-folder-title *,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item--folder .header-nav-folder-title-text,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item--folder .header-nav-folder-title *{"
    +"background:transparent!important;background-image:none!important;color:inherit!important;"
    +"-webkit-text-fill-color:inherit!important;text-shadow:inherit!important;"
    +"-webkit-text-stroke:inherit!important;opacity:1!important;text-decoration:none!important;"
    +"text-transform:uppercase!important;}"
    +"body.tt-nav-A .header-display-desktop .header-nav-item--folder,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item--folder,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--folder,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item--folder{position:relative!important;}"
    +"body.tt-nav-A .header-display-desktop .header-nav-item>a:focus-visible,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item .header-nav-folder-title:focus-visible,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a:focus-visible,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title:focus-visible,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item>a:focus-visible,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item .header-nav-folder-title:focus-visible,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a:focus-visible,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title:focus-visible{"
    +"outline:2px solid #fff!important;outline-offset:3px!important;}"

    /* ===== A: neon tubes ===== */
    +"body.tt-nav-A .header-display-desktop .header-nav{padding:12px 16px 22px!important;}"
    +"body.tt-nav-A .header-display-desktop .header-nav-list{gap:16px 14px!important;}"
    +"body.tt-nav-A .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item .header-nav-folder-title{"
    +"background:#07080f!important;"
    +"background-image:radial-gradient(120% 90% at 50% 0%,rgba(255,212,0,.16),transparent 58%),linear-gradient(180deg,rgba(255,255,255,.07),transparent 42%,rgba(0,0,0,.35))!important;"
    +"color:#FFE566!important;-webkit-text-fill-color:#FFE566!important;"
    +"-webkit-text-stroke:0!important;"
    +"border:2px solid #FFD400!important;border-radius:20px!important;"
    +"padding:.5em .7em .52em!important;"
    +"text-shadow:0 0 4px rgba(255,212,0,.95),0 0 10px rgba(255,212,0,.75),0 0 22px rgba(255,212,0,.5),0 0 36px rgba(255,180,0,.32)!important;"
    +"box-shadow:0 0 6px rgba(255,212,0,.55),0 0 18px rgba(255,212,0,.32),0 0 36px rgba(255,212,0,.16),inset 0 0 12px rgba(255,212,0,.16),inset 0 0 0 1px rgba(255,255,255,.18)!important;"
    +"animation:ttNavA-hum 2.8s ease-in-out infinite,ttNavA-buzz 8s steps(1,end) infinite!important;"
    +"transition:box-shadow .2s ease,color .2s ease,border-color .2s ease,text-shadow .2s ease,background-color .2s ease!important;}"
    +"@keyframes ttNavA-hum{"
    +"0%,100%{box-shadow:0 0 6px rgba(255,212,0,.5),0 0 16px rgba(255,212,0,.28),0 0 32px rgba(255,212,0,.14),inset 0 0 10px rgba(255,212,0,.14),inset 0 0 0 1px rgba(255,255,255,.16);}"
    +"50%{box-shadow:0 0 10px rgba(255,212,0,.75),0 0 26px rgba(255,212,0,.45),0 0 48px rgba(255,212,0,.22),inset 0 0 16px rgba(255,212,0,.22),inset 0 0 0 1px rgba(255,255,255,.28);}}"
    +"@keyframes ttNavA-buzz{"
    +"0%,18%,21%,72%,75%,100%{filter:brightness(1);}"
    +"19%,20%{filter:brightness(1.55);}"
    +"73%,74%{filter:brightness(.72);}}"
    +"body.tt-nav-A .header-display-desktop .header-nav-item>a:hover,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item>a:focus-visible,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item .header-nav-folder-title:hover,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item .header-nav-folder-title:focus-visible,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item.preview-hover>a,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item.preview-hover .header-nav-folder-title{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;"
    +"border-color:#FFF3A0!important;"
    +"text-shadow:0 0 4px #fff,0 0 10px #FFD400,0 0 24px #FFD400,0 0 48px rgba(255,212,0,.85),0 0 64px rgba(12,135,204,.35)!important;"
    +"box-shadow:0 0 10px rgba(255,255,220,.9),0 0 28px rgba(255,212,0,.7),0 0 56px rgba(255,212,0,.4),0 0 24px rgba(12,135,204,.28),inset 0 0 18px rgba(255,212,0,.32),inset 0 0 0 1px rgba(255,255,255,.4)!important;"
    +"animation:ttNavA-hoverbuzz .16s steps(2,end) 5,ttNavA-hum 2s ease-in-out infinite .8s!important;}"
    +"@keyframes ttNavA-hoverbuzz{"
    +"0%,100%{filter:brightness(1.15);}"
    +"40%{filter:brightness(1.7);}"
    +"70%{filter:brightness(.85);}}"
    +"body.tt-nav-A .header-display-desktop .header-nav-item--active>a,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item--active .header-nav-folder-title,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item--active.preview-hover>a{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;"
    +"padding-left:.7em!important;"
    +"border-color:#FFE566!important;"
    +"box-shadow:0 0 10px rgba(255,212,0,.8),0 0 28px rgba(255,212,0,.5),0 0 20px rgba(12,135,204,.35),inset 0 -3px 0 #0C87CC,inset 0 0 16px rgba(255,212,0,.28),inset 0 0 0 1px rgba(255,255,255,.3)!important;}"
    +"body.tt-nav-A .header-display-desktop .header-nav-item--active>a::before,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item--active .header-nav-folder-title::before{"
    +"content:\"\"!important;position:absolute!important;left:12px!important;top:50%!important;"
    +"width:8px!important;height:8px!important;border-radius:50%!important;"
    +"background:#0C87CC!important;transform:translateY(-50%)!important;"
    +"box-shadow:0 0 6px #0C87CC,0 0 14px #0C87CC,0 0 4px #fff!important;"
    +"pointer-events:none!important;}"
    +"body.tt-nav-A .header-display-desktop .header-nav-folder-content{"
    +"background:rgba(5,6,14,.96)!important;border:2px solid #FFD400!important;border-radius:16px!important;"
    +"box-shadow:0 0 18px rgba(255,212,0,.45),0 0 36px rgba(255,212,0,.2),inset 0 0 18px rgba(255,212,0,.1)!important;"
    +"padding:.45em .2em!important;min-width:280px!important;top:calc(100% + 12px)!important;z-index:140!important;}"
    +"body.tt-nav-A .header-display-desktop .header-nav-folder-item a,"
    +"body.tt-nav-A .header-display-desktop .header-nav-folder-item a .header-nav-folder-item-content{"
    +"color:#FFE566!important;-webkit-text-fill-color:#FFE566!important;"
    +"font-family:Anton,Impact,sans-serif!important;font-size:22px!important;letter-spacing:.03em!important;"
    +"text-transform:uppercase!important;text-decoration:none!important;background:transparent!important;"
    +"text-shadow:0 0 6px rgba(255,212,0,.7),0 0 14px rgba(255,212,0,.4)!important;"
    +"padding:.5em 1em!important;border-radius:10px!important;animation:none!important;}"
    +"body.tt-nav-A .header-display-desktop .header-nav-folder-item a:hover,"
    +"body.tt-nav-A .header-display-desktop .header-nav-folder-item a:focus-visible{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;background:rgba(255,212,0,.08)!important;"
    +"box-shadow:inset 4px 0 0 #FFD400,0 0 12px rgba(255,212,0,.25)!important;"
    +"text-shadow:0 0 8px #FFD400,0 0 18px rgba(255,212,0,.7)!important;animation:none!important;}"

    /* ===== B: glitch / VHS ===== */
    +"body.tt-nav-B .header-display-desktop .header-nav{padding:12px 16px 20px!important;}"
    +"body.tt-nav-B .header-display-desktop .header-nav-list{gap:12px 12px!important;}"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title{"
    +"position:relative!important;"
    +"background:#05070d!important;"
    +"background-image:repeating-linear-gradient(180deg,rgba(255,255,255,.045) 0 1px,transparent 1px 3px)!important;"
    +"color:#FFD400!important;-webkit-text-fill-color:#FFD400!important;"
    +"-webkit-text-stroke:.05em #000!important;"
    +"border:2px solid #FFD400!important;border-radius:0!important;"
    +"padding:.48em .6em .5em!important;"
    +"text-shadow:-3px 0 rgba(246,57,46,.9),3px 0 rgba(12,135,204,.85),0 0 8px rgba(0,0,0,.8)!important;"
    +"box-shadow:4px 0 0 rgba(12,135,204,.7),-4px 0 0 rgba(246,57,46,.7),0 0 0 1px #000!important;"
    +"animation:ttNavB-idle 7.5s steps(1,end) infinite!important;"
    +"transition:none!important;overflow:hidden!important;}"
    +"@keyframes ttNavB-idle{"
    +"0%,91%,96%,100%{transform:none;filter:none;}"
    +"92%{transform:translate(2px,0);}"
    +"93%{transform:translate(-3px,1px);}"
    +"94%{transform:translate(1px,-1px);}"
    +"95%{transform:none;}}"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a::after,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title::after{"
    +"content:\"\"!important;position:absolute!important;inset:0!important;pointer-events:none!important;"
    +"background:repeating-linear-gradient(180deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px),linear-gradient(180deg,transparent 0 42%,rgba(255,255,255,.2) 50%,transparent 58%)!important;"
    +"background-size:100% 3px,100% 200%!important;background-position:0 0,0 -120%!important;"
    +"opacity:0!important;mix-blend-mode:screen!important;}"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a:hover,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a:focus-visible,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title:hover,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title:focus-visible,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item.preview-hover>a,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item.preview-hover .header-nav-folder-title{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;background-color:#000!important;"
    +"border-color:#fff!important;"
    +"text-shadow:-5px 0 rgba(246,57,46,.95),5px 0 rgba(12,135,204,.95),0 0 10px rgba(255,212,0,.4)!important;"
    +"box-shadow:5px 0 0 rgba(12,135,204,.9),-5px 0 0 rgba(246,57,46,.9),0 0 18px rgba(255,212,0,.25)!important;"
    +"animation:ttNavB-vhs .32s steps(2,end) 2,ttNavB-hold 1.1s steps(2,end) infinite .64s!important;}"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a:hover::after,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a:focus-visible::after,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title:hover::after,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title:focus-visible::after,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item.preview-hover>a::after,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item.preview-hover .header-nav-folder-title::after{"
    +"opacity:.6!important;animation:ttNavB-scan .55s linear 1!important;}"
    +"@keyframes ttNavB-vhs{"
    +"0%{transform:translate(0,0);}"
    +"16%{transform:translate(-4px,1px) skewX(-2deg);}"
    +"32%{transform:translate(5px,-1px);}"
    +"48%{transform:translate(-3px,2px) skewX(1deg);}"
    +"64%{transform:translate(3px,0);}"
    +"80%{transform:translate(-2px,-1px);}"
    +"100%{transform:translate(0,0);}}"
    +"@keyframes ttNavB-hold{"
    +"0%,100%{transform:translate(0,0);}"
    +"30%{transform:translate(-1px,0);}"
    +"60%{transform:translate(1px,1px);}}"
    +"@keyframes ttNavB-scan{"
    +"from{background-position:0 0,0 -80%;}"
    +"to{background-position:0 0,0 180%;}}"
    +"body.tt-nav-B .header-display-desktop .header-nav-item--active>a,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item--active .header-nav-folder-title{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;padding-left:.85em!important;}"
    +"body.tt-nav-B .header-display-desktop .header-nav-item--active>a::before,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item--active .header-nav-folder-title::before{"
    +"content:\"\"!important;position:absolute!important;left:0!important;top:0!important;bottom:0!important;"
    +"width:6px!important;background:#FFD400!important;"
    +"box-shadow:-3px 0 0 #F6392E,3px 0 0 #0C87CC,0 0 10px rgba(255,212,0,.7)!important;"
    +"pointer-events:none!important;}"
    +"body.tt-nav-B .header-display-desktop .header-nav-folder-content{"
    +"background:#05070d!important;border:2px solid #FFD400!important;border-radius:0!important;"
    +"box-shadow:5px 0 0 rgba(12,135,204,.65),-5px 0 0 rgba(246,57,46,.65),0 10px 0 #000!important;"
    +"padding:.3em 0!important;min-width:280px!important;top:calc(100% + 10px)!important;z-index:140!important;"
    +"background-image:repeating-linear-gradient(180deg,rgba(255,255,255,.04) 0 1px,transparent 1px 3px)!important;}"
    +"body.tt-nav-B .header-display-desktop .header-nav-folder-item a,"
    +"body.tt-nav-B .header-display-desktop .header-nav-folder-item a .header-nav-folder-item-content{"
    +"color:#FFD400!important;-webkit-text-fill-color:#FFD400!important;"
    +"font-family:Anton,Impact,sans-serif!important;font-size:22px!important;"
    +"text-transform:uppercase!important;text-decoration:none!important;background:transparent!important;"
    +"text-shadow:-2px 0 rgba(246,57,46,.85),2px 0 rgba(12,135,204,.8)!important;"
    +"padding:.5em 1em!important;animation:none!important;}"
    +"body.tt-nav-B .header-display-desktop .header-nav-folder-item a:hover,"
    +"body.tt-nav-B .header-display-desktop .header-nav-folder-item a:focus-visible{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;background:#120800!important;"
    +"animation:ttNavB-vhs .32s steps(2,end) 2!important;}"

    /* ===== C: arcade / pixel buttons ===== */
    +"body.tt-nav-C .header-display-desktop .header-nav{padding:12px 16px 26px!important;}"
    +"body.tt-nav-C .header-display-desktop .header-nav-list{gap:18px 12px!important;}"
    +"body.tt-nav-C .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item .header-nav-folder-title{"
    +"background:#141208!important;"
    +"background-image:linear-gradient(180deg,rgba(255,255,255,.14) 0 10%,rgba(255,255,255,0) 36%,rgba(0,0,0,.4) 100%)!important;"
    +"color:#FFD400!important;-webkit-text-fill-color:#FFD400!important;"
    +"-webkit-text-stroke:.05em #000!important;"
    +"border:4px solid #FFD400!important;border-top-color:#FFF1A0!important;border-left-color:#FFE566!important;"
    +"border-bottom-color:#B8860B!important;border-right-color:#C4A000!important;"
    +"border-radius:0!important;padding:.46em .6em .62em!important;"
    +"text-shadow:0 2px 0 #000,0 0 10px rgba(255,212,0,.3)!important;"
    +"box-shadow:0 6px 0 #000,0 6px 0 3px #FFD400,0 9px 0 #7A1200,inset 0 2px 0 rgba(255,255,255,.22),inset 0 -3px 0 rgba(0,0,0,.4)!important;"
    +"transform:translateY(-2px);transition:transform .08s steps(2),box-shadow .08s steps(2),background-color .08s steps(2)!important;"
    +"animation:none!important;image-rendering:pixelated;}"
    +"body.tt-nav-C .header-display-desktop .header-nav-item>a:hover,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item>a:focus-visible,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item>a:active,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item .header-nav-folder-title:hover,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item .header-nav-folder-title:focus-visible,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item .header-nav-folder-title:active,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item.preview-hover>a,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item.preview-hover .header-nav-folder-title{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;"
    +"background-color:#1c1600!important;border-color:#FFE566!important;"
    +"transform:translateY(4px)!important;"
    +"box-shadow:0 1px 0 #000,0 1px 0 3px #FFD400,0 2px 0 #7A1200,inset 0 3px 0 rgba(0,0,0,.45),inset 0 -1px 0 rgba(255,255,255,.08)!important;"
    +"animation:none!important;}"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--active>a,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--active .header-nav-folder-title,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--active.preview-hover>a{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;"
    +"background-color:#221a00!important;padding-left:.9em!important;"
    +"transform:translateY(4px)!important;"
    +"box-shadow:0 1px 0 #000,0 1px 0 3px #FFD400,0 2px 0 #7A1200,0 0 16px rgba(255,212,0,.4),inset 0 3px 0 rgba(0,0,0,.45)!important;}"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--active>a::before,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--active .header-nav-folder-title::before{"
    +"content:\"\"!important;position:absolute!important;left:10px!important;top:10px!important;"
    +"width:10px!important;height:10px!important;border-radius:0!important;"
    +"background:#FFD400!important;box-shadow:0 0 6px #FFD400,0 0 14px #FFD400,0 0 2px #fff!important;"
    +"pointer-events:none!important;animation:ttNavC-led 1.6s steps(2,end) infinite!important;}"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--active>a::after,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--active .header-nav-folder-title::after{"
    +"content:\"\"!important;position:absolute!important;left:50%!important;bottom:7px!important;"
    +"width:2.2em!important;height:6px!important;background:#FFD400!important;"
    +"transform:translateX(-50%)!important;pointer-events:none!important;"
    +"box-shadow:0 0 8px rgba(255,212,0,.8)!important;}"
    +"@keyframes ttNavC-led{0%,100%{opacity:1;}50%{opacity:.35;}}"
    +"body.tt-nav-C .header-display-desktop .header-nav-folder-content{"
    +"background:#141208!important;border:4px solid #FFD400!important;border-radius:0!important;"
    +"border-top-color:#FFF1A0!important;border-left-color:#FFE566!important;"
    +"border-bottom-color:#B8860B!important;border-right-color:#C4A000!important;"
    +"box-shadow:0 8px 0 #000,0 8px 0 3px #FFD400,0 11px 0 #7A1200!important;"
    +"padding:.4em 0 .55em!important;min-width:280px!important;top:calc(100% + 14px)!important;z-index:140!important;}"
    +"body.tt-nav-C .header-display-desktop .header-nav-folder-item a,"
    +"body.tt-nav-C .header-display-desktop .header-nav-folder-item a .header-nav-folder-item-content{"
    +"color:#FFD400!important;-webkit-text-fill-color:#FFD400!important;"
    +"font-family:Anton,Impact,sans-serif!important;font-size:22px!important;"
    +"text-transform:uppercase!important;text-decoration:none!important;background:transparent!important;"
    +"text-shadow:0 2px 0 #000!important;padding:.5em 1em!important;animation:none!important;}"
    +"body.tt-nav-C .header-display-desktop .header-nav-folder-item a:hover,"
    +"body.tt-nav-C .header-display-desktop .header-nav-folder-item a:focus-visible{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;background:#1c1600!important;"
    +"box-shadow:inset 6px 0 0 #FFD400!important;animation:none!important;}"


    /* ===== D: A tube shell + B glitch interior ===== */
    +"body.tt-nav-D .header-display-desktop .header-nav{padding:12px 16px 22px!important;}"
    +"body.tt-nav-D .header-display-desktop .header-nav-list{gap:16px 14px!important;}"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title{"
    +"position:relative!important;"
    +"background:#05070d!important;"
    +"background-image:repeating-linear-gradient(180deg,rgba(255,255,255,.045) 0 1px,transparent 1px 3px)!important;"
    +"color:#FFD400!important;-webkit-text-fill-color:#FFD400!important;"
    +"-webkit-text-stroke:.05em #000!important;"
    +"border:2px solid #FFD400!important;border-radius:20px!important;"
    +"padding:.5em .7em .52em!important;overflow:visible!important;"
    +"text-shadow:-2px 0 rgba(246,57,46,.85),2px 0 rgba(12,135,204,.8),0 0 6px rgba(0,0,0,.85)!important;"
    +"box-shadow:0 0 6px rgba(255,212,0,.55),0 0 18px rgba(255,212,0,.32),0 0 36px rgba(255,212,0,.16),inset 0 0 12px rgba(255,212,0,.12),inset 0 0 0 1px rgba(255,255,255,.18)!important;"
    +"animation:ttNavA-hum 2.8s ease-in-out infinite,ttNavA-buzz 8s steps(1,end) infinite,ttNavB-idle 7.5s steps(1,end) infinite!important;"
    +"transition:box-shadow .2s ease,border-color .2s ease,background-color .2s ease!important;}"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a::after,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title::after{"
    +"content:\"\"!important;position:absolute!important;inset:0!important;pointer-events:none!important;"
    +"border-radius:inherit!important;"
    +"background:repeating-linear-gradient(180deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px),linear-gradient(180deg,transparent 0 42%,rgba(255,255,255,.2) 50%,transparent 58%)!important;"
    +"background-size:100% 3px,100% 200%!important;background-position:0 0,0 -120%!important;"
    +"opacity:0!important;mix-blend-mode:screen!important;}"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a:hover,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a:focus-visible,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title:hover,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title:focus-visible,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item.preview-hover>a,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item.preview-hover .header-nav-folder-title{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;"
    +"border-color:#FFF3A0!important;"
    +"text-shadow:-4px 0 rgba(246,57,46,.95),4px 0 rgba(12,135,204,.95),0 0 8px rgba(0,0,0,.7)!important;"
    +"box-shadow:0 0 10px rgba(255,255,220,.9),0 0 28px rgba(255,212,0,.7),0 0 56px rgba(255,212,0,.4),0 0 24px rgba(12,135,204,.28),inset 0 0 18px rgba(255,212,0,.28),inset 0 0 0 1px rgba(255,255,255,.4)!important;"
    +"animation:ttNavA-hoverbuzz .16s steps(2,end) 5,ttNavA-hum 2s ease-in-out infinite .8s,ttNavB-vhs .32s steps(2,end) 2,ttNavB-hold 1.1s steps(2,end) infinite .64s!important;}"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a:hover::after,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a:focus-visible::after,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title:hover::after,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title:focus-visible::after,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item.preview-hover>a::after,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item.preview-hover .header-nav-folder-title::after{"
    +"opacity:.6!important;animation:ttNavB-scan .55s linear 1!important;}"
    +"body.tt-nav-D .header-display-desktop .header-nav-item--active>a,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item--active .header-nav-folder-title,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item--active.preview-hover>a{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;"
    +"padding-left:.85em!important;"
    +"border-color:#FFE566!important;"
    +"box-shadow:0 0 10px rgba(255,212,0,.8),0 0 28px rgba(255,212,0,.5),0 0 20px rgba(12,135,204,.35),-3px 0 0 rgba(246,57,46,.7),3px 0 0 rgba(12,135,204,.65),inset 0 -3px 0 #0C87CC,inset 0 0 16px rgba(255,212,0,.24),inset 0 0 0 1px rgba(255,255,255,.3)!important;}"
    +"body.tt-nav-D .header-display-desktop .header-nav-item--active>a::before,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item--active .header-nav-folder-title::before{"
    +"content:\"\"!important;position:absolute!important;left:12px!important;top:50%!important;"
    +"width:8px!important;height:8px!important;border-radius:50%!important;"
    +"background:#0C87CC!important;transform:translateY(-50%)!important;"
    +"box-shadow:0 0 6px #0C87CC,0 0 14px #0C87CC,0 0 4px #fff,-2px 0 0 rgba(246,57,46,.8),2px 0 0 rgba(12,135,204,.7)!important;"
    +"pointer-events:none!important;z-index:2!important;}"
    +"body.tt-nav-D .header-display-desktop .header-nav-folder-content{"
    +"background:#05070d!important;"
    +"background-image:repeating-linear-gradient(180deg,rgba(255,255,255,.04) 0 1px,transparent 1px 3px)!important;"
    +"border:2px solid #FFD400!important;border-radius:16px!important;"
    +"box-shadow:0 0 18px rgba(255,212,0,.45),0 0 36px rgba(255,212,0,.2),inset 0 0 18px rgba(255,212,0,.1),-3px 0 0 rgba(246,57,46,.55),3px 0 0 rgba(12,135,204,.5)!important;"
    +"padding:.45em .2em!important;min-width:280px!important;top:calc(100% + 12px)!important;z-index:140!important;}"
    +"body.tt-nav-D .header-display-desktop .header-nav-folder-item a,"
    +"body.tt-nav-D .header-display-desktop .header-nav-folder-item a .header-nav-folder-item-content{"
    +"color:#FFD400!important;-webkit-text-fill-color:#FFD400!important;"
    +"font-family:Anton,Impact,sans-serif!important;font-size:22px!important;letter-spacing:.03em!important;"
    +"text-transform:uppercase!important;text-decoration:none!important;background:transparent!important;"
    +"text-shadow:-2px 0 rgba(246,57,46,.85),2px 0 rgba(12,135,204,.8)!important;"
    +"padding:.5em 1em!important;border-radius:10px!important;animation:none!important;}"
    +"body.tt-nav-D .header-display-desktop .header-nav-folder-item a:hover,"
    +"body.tt-nav-D .header-display-desktop .header-nav-folder-item a:focus-visible{"
    +"color:#fff!important;-webkit-text-fill-color:#fff!important;background:rgba(255,212,0,.08)!important;"
    +"box-shadow:inset 4px 0 0 #FFD400,0 0 12px rgba(255,212,0,.25)!important;"
    +"text-shadow:-3px 0 rgba(246,57,46,.95),3px 0 rgba(12,135,204,.9)!important;"
    +"animation:ttNavB-vhs .32s steps(2,end) 2!important;}"

    /* reduced motion: keep the look, drop the motion */
    +"@media (prefers-reduced-motion:reduce){"
    +"body.tt-nav-A .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-A .header-display-desktop .header-nav-item .header-nav-folder-title,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item .header-nav-folder-title,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title,"
    +"body.tt-nav-B .header-display-desktop .header-nav-folder-item a,"
    +"body.tt-nav-D .header-display-desktop .header-nav-folder-item a,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--active>a::before,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--active .header-nav-folder-title::before{"
    +"animation:none!important;transition:none!important;filter:none!important;}"
    +"body.tt-nav-B .header-display-desktop .header-nav-item>a:hover::after,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item .header-nav-folder-title:hover::after,"
    +"body.tt-nav-B .header-display-desktop .header-nav-item.preview-hover>a::after,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a:hover::after,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title:hover::after,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item.preview-hover>a::after{"
    +"animation:none!important;opacity:.45!important;background-position:0 0,0 40%!important;}"
    +"body.tt-nav-C .header-display-desktop .header-nav-item>a:hover,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item .header-nav-folder-title:hover,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item.preview-hover>a,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--active>a,"
    +"body.tt-nav-C .header-display-desktop .header-nav-item--active .header-nav-folder-title,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item>a,"
    +"body.tt-nav-D .header-display-desktop .header-nav-item .header-nav-folder-title,"
    +"body.tt-nav-D .header-display-desktop .header-nav-folder-item a{"
    +"transform:none!important;}"
    +"}" /* reduce */
    +"}"; /* min-width 1024 */
    (D.head||D.documentElement).appendChild(s);
  }
  function clear(){
    var b=D.body;if(!b)return;
    for(var i=0;i<CLS.length;i++)b.classList.remove(CLS[i]);
  }
  function apply(){
    css();
    var v=variant(),b=D.body;if(!b)return;
    clear();
    if(v)b.classList.add('tt-nav-'+v);
  }
  var q=0;function soon(){if(q)return;q=setTimeout(function(){q=0;apply();},200);}
  function boot(){
    apply();
    [400,1200,2800].forEach(function(ms){setTimeout(apply,ms);});
    W.addEventListener('load',apply);
    if(MQ.addEventListener)MQ.addEventListener('change',apply);
    ['mercury:load','mercury:navigate'].forEach(function(ev){W.addEventListener(ev,soon);D.addEventListener(ev,soon);});
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
})();
/* /TT NAV */
