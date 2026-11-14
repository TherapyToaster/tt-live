/* TT ARCADE BG v2
   Pixel background for therapytoaster.com/arcade only
   (body#collection-6ad5b63914df0c0376bddf45 / #tt-arc).
   Motifs from Coty's own machines — toasters and toast, Skullz, crumbs and
   bones, Prize Floor coins and tickets, a CyberToaster Kart, Toaster Pit
   clovers and 7s, No Signal CRT — not Pac-Man or Space Invaders.
   Variant A (default): night circuit. Drifting toasts and skulls, crumb-stars,
     prize coins rising, neon kart road along the bottom.
   Variant B: cabinet alley. Crumb and coin rain, rising crypt skulls, slot
     reels in the margins, toasters popping toast, stronger CRT.
   Usage:
     <script src="https://therapytoaster.github.io/tt-live/arcade-bg/arcade-bg.js"></script>
     Variant B: ?v=b  OR  data-variant="B"  OR  window.TT_ARCADE_BG='B'
   Safe to add after the old TT BG ART v1 script: this removes #ttbg-arcade.
   Still delete the old style+script so its rAF loop does not keep running.
   Caps ~30fps, pauses when the tab is hidden, reduced-motion = one still frame.
*/
(function(){
if(window.__ttArcadeBgV2)return;
var me=document.currentScript;
var src=me&&me.src||'';
var variant=(window.TT_ARCADE_BG||(me&&me.getAttribute('data-variant'))||'A').toString().toUpperCase();
if(/[?&#]v=b\b/i.test(src)||variant==='B')variant='B';else variant='A';

function onArcade(){
  if(document.getElementById('tt-arc'))return true;
  if(document.body&&document.body.id==='collection-6ad5b63914df0c0376bddf45')return true;
  try{
    var p=(location.pathname||'').replace(/\/$/,'');
    if(p==='/arcade')return true;
  }catch(e){}
  return false;
}
function boot(){
  if(window.__ttArcadeBgV2)return;
  if(!onArcade())return;
  window.__ttArcadeBgV2=1;
  start();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();

function start(){
  var old=document.getElementById('ttbg-arcade');
  if(old)old.remove();

  if(!document.getElementById('ttbg-arcade-css')){
    var st=document.createElement('style');
    st.id='ttbg-arcade-css';
    st.textContent='body{background:#000}#page .section-background,#page .section-border{opacity:0!important}#tt-arc{background:rgba(0,0,0,.62);border-radius:14px;box-shadow:0 0 0 1px rgba(255,212,0,.25)}';
    document.documentElement.appendChild(st);
  }

  var ID='ttbg-arcade';
  var cv=document.createElement('canvas');
  cv.id=ID;cv.setAttribute('aria-hidden','true');cv.setAttribute('data-v','2');cv.setAttribute('data-variant',variant);
  cv.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:0;pointer-events:none;display:block;background:#000';
  document.body.insertBefore(cv,document.body.firstChild);
  var pg=document.getElementById('page');
  if(pg){
    var pc=getComputedStyle(pg);
    if(pc.position==='static')pg.style.position='relative';
    if(pc.zIndex==='auto'||+pc.zIndex<1)pg.style.zIndex='1';
  }
  for(var el=pg&&pg.parentElement;el&&el!==document.documentElement;el=el.parentElement){
    el.style.setProperty('background-color','transparent','important');
    el.style.setProperty('background-image','none','important');
  }

  var x=cv.getContext('2d',{alpha:false});
  var W=0,H=0,D=1,t0=performance.now(),raf=0,last=0;
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)');
  var px=3,VB=variant==='B';

  /* ---- compact pixel sprites (hex digits = color index, . = empty) ---- */
  function P(rows){
    var o=[],r,c,row,a,ch;
    for(r=0;r<rows.length;r++){
      row=rows[r];a=[];
      for(c=0;c<row.length;c++){ch=row[c];a.push(ch==='.'?0:parseInt(ch,16));}
      o.push(a);
    }
    return o;
  }
  var TOASTER=P([
    '....222222....',
    '...21111112...',
    '...21533512...',
    '...21533512...',
    '..2111111112..',
    '..2116..6112..',
    '..211.77.112..',
    '..2111111112..',
    '..22......22..',
    '...2......2...'
  ]);
  var TOAST=P([
    '.444444.',
    '44333344',
    '43333334',
    '43388334',
    '43333334',
    '44333344',
    '.444444.'
  ]);
  var BURNT=P([
    '.444444.',
    '44333344',
    '43933934',
    '43399334',
    '43933934',
    '44333344',
    '.444444.'
  ]);
  var SKULL=P([
    '..11111..',
    '.1111111.',
    '11.11.111',
    '1AA11BB11',
    '1AA11BB11',
    '111111111',
    '11.1.1.11',
    '.1.1.1.1.',
    '..11111..'
  ]);
  var SKULL2=P([
    '..11111..',
    '.1111111.',
    '11.11.111',
    '1BB11AA11',
    '1BB11AA11',
    '111111111',
    '11.1.1.11',
    '.1.1.1.1.',
    '..11111..'
  ]);
  var KART=P([
    '.................31.',
    '..........1111111331',
    '....1111111111111111',
    '..111155511111111111',
    '.11111555111111111A1',
    '11111111111111111111',
    '22222222222222222222',
    '.77..........77.....',
    '7777........7777....'
  ]);
  var COIN=P([
    '..3333..',
    '.334433.',
    '33433433',
    '343...43',
    '343...43',
    '33433433',
    '.334433.',
    '..3333..'
  ]);
  var TICKET=P([
    '333333333333',
    '3....AA....3',
    '3.33.AA.33.3',
    '3....AA....3',
    '333333333333'
  ]);
  var CLOVER=P([
    '.AA.AA.',
    'AAAAAAA',
    'AA.A.AA',
    'AAAAAAA',
    'AA.A.AA',
    '.AA3AA.',
    '...3...'
  ]);
  var SEVEN=P([
    '333333',
    '3...13',
    '....13',
    '...13.',
    '..13..',
    '..3...'
  ]);
  var BONE=P([
    '11....11',
    '11111111',
    '11....11'
  ]);
  var CRUMB=P([
    '.4.',
    '434',
    '.4.'
  ]);
  var CRUMB2=P([
    '33',
    '43'
  ]);

  var COL={
    1:'#e8e8e8',
    2:'#7a7a7a',
    3:'#FFD400',
    4:'#c4922a',
    5:'#1c1c1c',
    6:'#111111',
    7:'#2a2a2a',
    8:'#8a5a12',
    9:'#3a2a10',
    10:'#00e5ff', /* A */
    11:'#ff2b4a'  /* B */
  };
  var COL_SKULL={
    1:'#f2f0e4',
    2:'#7a7a7a',
    3:'#FFD400',
    10:'#00e5ff',
    11:'#ff2b4a'
  };
  var COL_KART={
    1:'#c5ccd3',
    2:'#8a9198',
    3:'#FFD400',
    5:'#0a0c10',
    7:'#1a1a1a',
    10:'#00e5ff'
  };

  function spr(m,px0,py0,s,cols,al,flip){
    var r,c,v,h,w;
    if(al!=null)x.globalAlpha=al;
    h=m.length;w=m[0].length;
    for(r=0;r<h;r++){
      for(c=0;c<w;c++){
        v=m[r][flip?w-1-c:c];
        if(v){x.fillStyle=cols[v]||COL[v]||'#fff';x.fillRect((px0+c*s)|0,(py0+r*s)|0,s,s);}
      }
    }
    if(al!=null)x.globalAlpha=1;
  }

  var stars=[],toasts=[],skulls=[],coins=[],tickets=[],crumbs=[],bones=[],symbols=[],poppers=[],kart;

  function nrange(lo,hi){return lo+Math.random()*(hi-lo);}
  function pick(a){return a[Math.random()*a.length|0];}

  function init(){
    var i,n;
    stars=[];toasts=[];skulls=[];coins=[];tickets=[];crumbs=[];bones=[];symbols=[];poppers=[];
    px=W<420?2:W<900?3:4;
    /* crumb-stars / ambient specks */
    n=VB?50:110;
    for(i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H,z:nrange(.4,1.6),sp:nrange(6,22),a:nrange(.15,.45)});
    /* drifting toast slices */
    n=VB?3:7;
    for(i=0;i<n;i++)toasts.push({
      x:Math.random()*W,y:Math.random()*H,s:px+(Math.random()<.35?1:0),
      vx:nrange(.12,.4)*pick([-1,1]),vy:nrange(-.12,.12),
      bob:nrange(0,6.28),bobsp:nrange(.6,1.4),al:nrange(.28,.5),
      kind:Math.random()<.3?'burnt':'toast'
    });
    /* skulls */
    n=VB?6:5;
    for(i=0;i<n;i++)skulls.push({
      x:Math.random()*W,y:VB?H*nrange(.55,1.05):Math.random()*H,
      s:px,vx:VB?nrange(-.08,.08):nrange(.1,.32)*pick([-1,1]),
      vy:VB?nrange(-.22,-.08):nrange(-.08,.08),
      bob:nrange(0,6.28),al:nrange(.28,.48),alt:i&1
    });
    /* coins */
    n=VB?12:9;
    for(i=0;i<n;i++)coins.push({
      x:Math.random()*W,y:Math.random()*H,s:Math.max(2,px-1),
      vy:VB?nrange(18,42):nrange(-28,-12),spin:Math.random()*6,
      al:nrange(.3,.55)
    });
    /* tickets */
    n=VB?6:5;
    for(i=0;i<n;i++)tickets.push({
      x:Math.random()*W,y:Math.random()*H,s:Math.max(2,px-1),
      vy:VB?nrange(14,30):nrange(-18,-8),rot:nrange(-.15,.15),
      al:nrange(.22,.4)
    });
    if(VB){
      for(i=0;i<10;i++)crumbs.push({
        x:Math.random()*W,y:Math.random()*H,s:px,sp:nrange(24,55),
        drift:nrange(-12,12),al:nrange(.2,.45),k:Math.random()<.5?0:1
      });
      for(i=0;i<6;i++)bones.push({
        x:Math.random()*W,y:Math.random()*H,s:Math.max(2,px-1),
        sp:nrange(16,32),al:nrange(.2,.38),rot:nrange(-.2,.2)
      });
      /* slot-reel symbols in the side margins */
      for(i=0;i<10;i++)symbols.push({
        side:i<5?0:1,y:((i%5)+.3)*H/5,bob:nrange(0,6.28),
        kind:pick(['clover','seven','coin','toast']),al:nrange(.16,.3),s:px
      });
      /* toasters that pop toast */
      n=W<500?2:3;
      for(i=0;i<n;i++)poppers.push({
        x:W*((i+1)/(n+1))+nrange(-30,30),y:H*nrange(.72,.88),
        s:px,phase:nrange(0,8),al:.42
      });
    }else{
      for(i=0;i<5;i++)symbols.push({
        x:Math.random()*W,y:Math.random()*H*.55,bob:nrange(0,6.28),
        kind:pick(['clover','seven']),al:nrange(.16,.28),s:Math.max(2,px-1),
        vx:nrange(-.08,.08)
      });
    }
    /* Bias a few motifs into the visible gap under the header so the
       first screen isn't an empty black band. */
    var gt=gutters(), band=Math.max(40, gt.bot-gt.top);
    if(gt.bot>gt.top+16){
      for(i=0;i<(VB?2:4);i++)toasts.push({
        x:nrange(20,W-40),y:gt.top+nrange(4,Math.max(8,band-8)),
        s:px,vx:nrange(.14,.34)*pick([-1,1]),vy:nrange(-.06,.06),
        bob:nrange(0,6.28),bobsp:nrange(.6,1.4),al:nrange(.4,.58),
        kind:Math.random()<.3?'burnt':'toast'
      });
      for(i=0;i<(VB?2:3);i++)skulls.push({
        x:nrange(20,W-40),y:gt.top+nrange(4,Math.max(8,band-8)),
        s:px,vx:nrange(.12,.3)*pick([-1,1]),vy:nrange(-.05,.05),
        bob:nrange(0,6.28),al:nrange(.4,.55),alt:i&1
      });
      for(i=0;i<4;i++)coins.push({
        x:nrange(16,W-16),y:gt.top+nrange(0,band),
        s:Math.max(2,px-1),vy:VB?nrange(18,32):nrange(-22,-10),
        spin:Math.random()*6,al:nrange(.4,.6)
      });
    }
    if(VB){
      /* sit the popping toasters in the gap when there is room */
      for(i=0;i<poppers.length;i++){
        if(gt.bot>gt.top+40)poppers[i].y=gt.bot-10*px;
      }
    }
    kart={x:-80,y:0,dir:1,s:Math.max(2,px-1),wait:0.15,speed:0};
  }

  function wrap(v,m){if(v<-40)return m+40;if(v>m+40)return -40;return v;}

  /* Gap between the site header and #tt-arc — the only clear stage
     that is not under the neon nav or the card panel. Recalculated
     every frame so a sticky header / scroll hides the road instead
     of drawing it through the title. */
  function gutters(){
    var header=document.querySelector('header')||document.querySelector('#header');
    var arc=document.getElementById('tt-arc');
    var top=0,bot=H;
    if(header){var hr=header.getBoundingClientRect();top=hr.bottom;}
    if(arc){var r=arc.getBoundingClientRect();bot=r.top;}
    return {top:top,bot:bot,mid:(top+bot)/2};
  }
  function lane(){
    var g=gutters(),gap=g.bot-g.top;
    if(gap>=28 && g.bot>8 && g.top<H-8){
      return {y:g.mid,h:Math.max(18,Math.min(32,gap-14)),on:true,gap:gap};
    }
    return {y:0,h:0,on:false,gap:0};
  }

  function drawKartRoad(t, ln){
    var my=ln.y,mh=ln.h;
    x.save();
    x.shadowColor='#00e5ff';x.shadowBlur=8;
    x.strokeStyle='rgba(0,229,255,.55)';x.lineWidth=2;
    x.beginPath();x.moveTo(-4,my-mh/2);x.lineTo(W+4,my-mh/2);x.stroke();
    x.strokeStyle='rgba(255,212,0,.45)';x.shadowColor='#FFD400';
    x.beginPath();x.moveTo(-4,my+mh/2);x.lineTo(W+4,my+mh/2);x.stroke();
    x.restore();
    var dash=18,gap=14,off=((t*70)%(dash+gap)),d;
    x.fillStyle='rgba(255,212,0,.55)';
    for(d=-off;d<W;d+=dash+gap)x.fillRect(d,my-1,dash,2);
    return my;
  }

  function drawGrid(){
    var g=24,xx,yy;
    x.strokeStyle='rgba(0,229,255,.05)';x.lineWidth=1;
    x.beginPath();
    for(xx=0;xx<W;xx+=g){x.moveTo(xx+.5,H*.45);x.lineTo(xx+.5,H);}
    for(yy=(H*.45)|0;yy<H;yy+=g){x.moveTo(0,yy+.5);x.lineTo(W,yy+.5);}
    x.stroke();
  }

  function drawGlitch(t){
    /* rare No Signal ticks — a couple of horizontal noise bars */
    var g=(Math.sin(t*1.7)+Math.sin(t*3.1))*0.5;
    if(g>0.82){
      var y=((Math.sin(t*9)*0.5+0.5)*H)|0,h=3+(Math.sin(t*13)*2|0);
      x.fillStyle='rgba(0,229,255,.10)';x.fillRect(0,y,W,h);
      x.fillStyle='rgba(255,43,74,.08)';x.fillRect(0,y+h+2,W,1);
    }
  }

  function stepKart(t,dt,ln,still){
    var kw=20*kart.s,kh=9*kart.s;
    var roadY=ln.y+2;
    /* Keep the truck inside the gap; skip the toast-on-top if the
       lane is too tight (typical on a phone). */
    var ride=ln.gap>=70;
    if(still){
      kart.x=W/2-kw/2;kart.dir=1;kart.y=roadY-kh/2;
    }else{
      if(kart.wait>0){
        kart.wait-=dt;
        if(kart.wait<=0){
          kart.dir=kart.dir<0?1:-1;
          kart.x=kart.dir>0?-kw-20:W+20;
          kart.speed=nrange(160,230);
        }
      }else{
        kart.x+=kart.dir*kart.speed*dt;
        if((kart.dir>0&&kart.x>W+20)||(kart.dir<0&&kart.x<-kw-20)){
          kart.wait=nrange(1.2,3.2);
        }
      }
      kart.y=roadY-kh/2+Math.sin(t*10)*0.5;
    }
    if(kart.wait<=0||still){
      spr(KART,kart.x,kart.y,kart.s,COL_KART,.82,kart.dir<0);
      if(ride){
        spr(TOAST,kart.x+(kart.dir<0?2:kw-TOAST[0].length*kart.s-2),kart.y-5*kart.s,Math.max(2,kart.s-1),COL,.65,false);
      }else{
        /* toast stays in the bed */
        spr(TOAST,kart.x+kw*0.45-4*kart.s,kart.y-2,Math.max(2,kart.s-1),COL,.55,false);
      }
    }
  }

  function draw(t){
    var i,o,yy,dt=0.033;
    x.fillStyle='#000';x.fillRect(0,0,W,H);
    /* warm floor glow + a cooler top wash for B */
    var g=x.createRadialGradient(W*.5,H*1.08,0,W*.5,H*1.08,H*1.15);
    g.addColorStop(0,VB?'rgba(255,212,0,.07)':'rgba(255,212,0,.11)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g;x.fillRect(0,0,W,H);
    if(VB){
      var g2=x.createRadialGradient(W*.5,-H*.1,0,W*.5,-H*.1,H*.7);
      g2.addColorStop(0,'rgba(0,229,255,.05)');g2.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=g2;x.fillRect(0,0,W,H);
      drawGrid();
    }

    /* crumb-stars */
    for(i=0;i<stars.length;i++){
      o=stars[i];
      yy=(o.y+t*o.sp)%H;
      x.fillStyle='rgba(255,220,140,'+o.a+')';
      x.fillRect(o.x,yy,o.z,o.z);
    }

    if(VB){
      for(i=0;i<crumbs.length;i++){
        o=crumbs[i];
        yy=(o.y+t*o.sp)%(H+20)-10;
        spr(o.k?CRUMB2:CRUMB,o.x+Math.sin(t*0.8+i)*o.drift,yy,o.s,COL,o.al,false);
      }
      for(i=0;i<bones.length;i++){
        o=bones[i];
        yy=(o.y+t*o.sp)%(H+24)-12;
        spr(BONE,o.x+Math.sin(t*0.5+i)*8,yy,o.s,COL_SKULL,o.al,false);
      }
    }

    /* coins */
    for(i=0;i<coins.length;i++){
      o=coins[i];
      yy=(o.y+t*o.vy);
      yy=((yy% (H+30))+H+30)%(H+30)-15;
      /* squash on "spin" so the coin twinkles as it turns */
      var squash=0.55+0.45*Math.abs(Math.sin(t*3+o.spin));
      x.save();
      x.translate(o.x,yy);
      x.scale(squash,1);
      spr(COIN,-4*o.s,0,o.s,COL,o.al,false);
      x.restore();
    }
    /* tickets */
    for(i=0;i<tickets.length;i++){
      o=tickets[i];
      yy=(o.y+t*o.vy);
      yy=((yy%(H+30))+H+30)%(H+30)-15;
      spr(TICKET,o.x+Math.sin(t+i)*6,yy,o.s,COL,o.al,false);
    }

    /* toasts */
    for(i=0;i<toasts.length;i++){
      o=toasts[i];
      var tx=wrap(o.x+t*o.vx*40,W);
      var ty=wrap(o.y+t*o.vy*40+Math.sin(t*o.bobsp+o.bob)*10,H);
      spr(o.kind==='burnt'?BURNT:TOAST,tx,ty,o.s,COL,o.al,o.vx<0);
    }
    /* skulls */
    for(i=0;i<skulls.length;i++){
      o=skulls[i];
      var sx,sy;
      if(VB){
        sy=((o.y+t*o.vy*40)%(H+40)+H+40)%(H+40)-20;
        sx=o.x+Math.sin(t*0.7+o.bob)*16;
      }else{
        sx=wrap(o.x+t*o.vx*40,W);
        sy=wrap(o.y+t*o.vy*40+Math.sin(t+o.bob)*8,H);
      }
      spr(o.alt?SKULL2:SKULL,sx,sy,o.s,COL_SKULL,o.al,false);
    }

    /* slot symbols */
    for(i=0;i<symbols.length;i++){
      o=symbols[i];
      var zx,zy,sprm=CLOVER,al=o.al*(0.75+0.25*Math.sin(t*2+o.bob));
      if(VB){
        zx=o.side?W-28-o.s*8:16;
        zy=o.y+Math.sin(t*0.9+o.bob)*10;
      }else{
        zx=wrap((o.x||0)+t*(o.vx||0)*30,W);
        zy=(o.y||0)+Math.sin(t*0.8+o.bob)*8;
      }
      if(o.kind==='seven')sprm=SEVEN;
      else if(o.kind==='coin')sprm=COIN;
      else if(o.kind==='toast')sprm=TOAST;
      spr(sprm,zx,zy,o.s,COL,al,false);
    }

    /* popping toasters (B) */
    if(VB){
      for(i=0;i<poppers.length;i++){
        o=poppers[i];
        /* cycle: idle, pop, toast flies, reset — 5.5s */
        var ph=(t+o.phase)%5.5;
        var pop=0;
        if(ph>1.2&&ph<2.1)pop=Math.min(1,(ph-1.2)/0.25);
        else if(ph>=2.1&&ph<2.6)pop=1;
        else if(ph>=2.6&&ph<3.2)pop=1-(ph-2.6)/0.6;
        spr(TOASTER,o.x,o.y,o.s,COL,o.al,false);
        if(pop>0){
          var fly=ph>2.6?(ph-2.6)*50:0;
          spr(TOAST,o.x+4*o.s,o.y-2*o.s-pop*10*o.s-fly,o.s,COL,o.al*0.9,false);
        }
      }
    }

    var ln=lane();
    if(!VB){
      if(ln.on){
        drawKartRoad(t, ln);
        stepKart(t,dt,ln,RM&&RM.matches);
      }
    }else if(ln.on){
      /* same gap, no permanent road — a kart streak every few seconds */
      var cycle=9,ct=t%cycle,ks=Math.max(2,px-1),kw=20*ks,kh=9*ks;
      if((RM&&RM.matches)||(ct>1.2&&ct<5.2)){
        var kx;
        if(RM&&RM.matches)kx=W/2-kw/2;
        else kx=-kw+((ct-1.2)/4)*(W+kw*2);
        var ky=ln.y-kh/2+Math.sin(t*8)*0.6;
        spr(KART,kx,ky,ks,COL_KART,.7,false);
        spr(TOAST,kx+kw-TOAST[0].length*ks-2,ky+2,Math.max(2,ks-1),COL,.5,false);
      }
    }

    drawGlitch(t);

    /* CRT scanlines + vignette (a bit stronger on B / No Signal) */
    x.fillStyle=VB?'rgba(0,0,0,.28)':'rgba(0,0,0,.20)';
    for(var y=0;y<H;y+=3)x.fillRect(0,y,W,1);
    var v=x.createRadialGradient(W/2,H/2,H*.28,W/2,H/2,H*.92);
    v.addColorStop(0,'rgba(0,0,0,0)');
    v.addColorStop(1,VB?'rgba(0,0,0,.68)':'rgba(0,0,0,.58)');
    x.fillStyle=v;x.fillRect(0,0,W,H);
  }

  var STILL=2.8;
  function rs(){
    D=Math.min(window.devicePixelRatio||1,innerWidth<500?1.25:1.5);
    W=innerWidth;H=innerHeight;
    cv.width=W*D|0;cv.height=H*D|0;
    x.setTransform(D,0,0,D,0,0);
    init();
    draw(RM&&RM.matches?STILL:(performance.now()-t0)/1000);
  }
  function loop(n){
    raf=requestAnimationFrame(loop);
    if(n-last<33)return;
    last=n;
    draw((n-t0)/1000);
  }
  function go(){
    cancelAnimationFrame(raf);raf=0;
    if(document.hidden||(RM&&RM.matches)){draw(STILL);return;}
    raf=requestAnimationFrame(loop);
  }
  addEventListener('resize',rs);
  document.addEventListener('visibilitychange',go);
  if(RM&&RM.addEventListener)RM.addEventListener('change',go);
  rs();go();
}
})();
