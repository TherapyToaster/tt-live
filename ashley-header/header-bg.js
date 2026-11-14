/* TT Ashley header: OOK glitch background v1
   Only on /ashleysavvie (collection 6aefb320e7defe1c4dfda59f).
   Recreates the My One of a Kind "TT OOK glitch background v3" canvas
   (dark #05070d field, scanlines, grain, RGB/mosh bursts, SYS_ERR ticks)
   behind the nav tabs. Does not change header height, tab borders, the
   soft yellow glow, or the caution bar. Safe under Squarespace soft nav.
   Load once from sitewide Code Injection:
   <script src="https://therapytoaster.github.io/tt-live/ashley-header/header-bg.js" defer></script>
*/
(function(){
  if(window.self!==window.top)return;
  var CID='collection-6aefb320e7defe1c4dfda59f';
  var STYLE_ID='tt-ashley-ook-header-css';
  var CV_ID='tt-ashley-ook-cv';
  var OV_ID='tt-ashley-ook-ov';
  var SECTION='6aefb3e0dd29691c2e41cf91';
  var W=window, D=document, KEY='__ttAshleyOokHeader';
  if(W[KEY]&&W[KEY].destroy)W[KEY].destroy();

  function onPage(){
    var b=D.body;
    if(!b)return false;
    if(b.classList.contains('sqs-edit-mode-active'))return false;
    return b.id===CID||b.classList.contains(CID)||/^\/ashleysavvie\/?$/.test(location.pathname);
  }

  function ensureStyle(){
    if(D.getElementById(STYLE_ID))return;
    var st=D.createElement('style');st.id=STYLE_ID;
    st.textContent=
      '/* Ashley Savvie only: OOK glitch behind the nav tabs */'+
      'body#'+CID+' .header-announcement-bar-wrapper,'+
      'body.'+CID+' .header-announcement-bar-wrapper{'+
        'position:relative;'+
        'background-color:#05070d!important;'+
        'background-image:'+
          'repeating-linear-gradient(0deg,rgba(255,255,255,.022) 0 1px,transparent 1px 4px),'+
          'radial-gradient(ellipse at 50% 0%,rgba(92,66,18,.30),transparent 60%),'+
          'radial-gradient(ellipse at 50% 100%,rgba(60,40,12,.22),transparent 60%)!important;'+
      '}'+
      'body#'+CID+' .header-announcement-bar-wrapper .header-background,'+
      'body.'+CID+' .header-announcement-bar-wrapper .header-background{'+
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
      'body#'+CID+' .header-announcement-bar-wrapper > .header-inner,'+
      'body.'+CID+' .header-announcement-bar-wrapper > .header-inner{'+
        'position:relative;z-index:2;'+
      '}'+
      'body#'+CID+' .header-title-logo img,'+
      'body.'+CID+' .header-title-logo img{'+
        'filter:drop-shadow(0 0 6px #000) drop-shadow(0 1px 2px #000);'+
      '}'+
      /* White-bar gap under the nav (same rules as the sitewide Custom CSS line). */+
      '[data-section-id="'+SECTION+'"] .content-wrapper{padding-top:0!important}'+
      '[data-section-id="'+SECTION+'"] .section-background{background:#000!important}';
    (D.head||D.documentElement).appendChild(st);
  }

  var cv=null,ov=null,ctx=null,wrap=null,raf=0,ro=null,rq=0,startedHooks=false;
  var rmq=W.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  var base=null,bc=null,pats=[],width=0,height=0,S=.5,lastW=0,lastH=0,mob=false,FPS=24;
  var R=Math.random,last=0,vis=!D.hidden,onScreen=true,nextB=0,burst=null,texts=[],nextT=0,fi=0,tracks=[];
  var COL=['255,212,0','255,59,74','0,229,255','236,233,223'];
  var io=null,unvis=null,unrm=null,unrs=null;

  function hx(n){var s='';while(s.length<n)s+='0123456789ABCDEF'[R()*16|0];return s;}
  function word(){var r=R();return r<.3?'SYS_ERR':r<.5?'SYS_ERR 0x'+hx(4):r<.7?'0x'+hx(6):r<.85?hx(2)+' '+hx(2)+' '+hx(2)+' '+hx(2):'ERR_'+hx(3)+' // SIGNAL';}

  function size(force){
    if(!cv||!wrap||!ctx)return;
    var cw=wrap.clientWidth||innerWidth,ch=wrap.clientHeight||0;
    if(ch<8)ch=Math.max(8,(wrap.getBoundingClientRect().height||0));
    if(!force&&cw===lastW&&Math.abs(ch-lastH)<2&&width)return;
    lastW=cw;lastH=ch;mob=cw<700;FPS=mob?20:24;
    var d=Math.min(W.devicePixelRatio||1,2),k=(mob?.5:.6)*d,cap=mob?180000:400000;
    if(cw*k*ch*k>cap)k=Math.sqrt(cap/(cw*ch||1));S=k;
    width=Math.max(48,Math.round(cw*k));height=Math.max(24,Math.round(ch*k));
    cv.width=width;cv.height=height;cv.style.width='100%';cv.style.height='100%';
    ctx.imageSmoothingEnabled=false;
    if(!base){base=D.createElement('canvas');bc=base.getContext('2d');}
    base.width=width;base.height=height;
    bc.fillStyle='#05070d';bc.fillRect(0,0,width,height);
    var g=bc.createRadialGradient(width*.5,-height*.1,0,width*.5,-height*.1,height*1.2);
    g.addColorStop(0,'rgba(96,70,20,.30)');g.addColorStop(1,'rgba(96,70,20,0)');bc.fillStyle=g;bc.fillRect(0,0,width,height);
    g=bc.createRadialGradient(width*.5,height*.5,height*.3,width*.5,height*.5,Math.max(width,height)*.8);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');bc.fillStyle=g;bc.fillRect(0,0,width,height);
    bc.fillStyle='rgba(0,0,0,.28)';for(var y=0;y<height;y+=3)bc.fillRect(0,y,width,1);
    if(!pats.length)for(var f=0;f<4;f++){
      var nc=D.createElement('canvas');nc.width=nc.height=96;var nx=nc.getContext('2d'),id=nx.createImageData(96,96),p=id.data;
      for(var i=0;i<p.length;i+=4){var v=R()*255|0;p[i]=v;p[i+1]=v*.94|0;p[i+2]=v*.82|0;p[i+3]=R()<.5?0:(R()*34|0);}
      nx.putImageData(id,0,0);pats.push(ctx.createPattern(nc,'repeat'));
    }
    tracks=[{y:R()*height,v:height*.05,h:Math.max(3,height*.018)},{y:R()*height,v:height*.085,h:Math.max(2,height*.008)}];
    ctx.drawImage(base,0,0);if(rmq.matches)still();
  }

  function newBurst(t){
    var n=(mob?3:4)+(R()*(mob?3:5)|0),sl=[];
    for(var i=0;i<n;i++){
      var r=R();
      sl.push({y:R()*height,h:Math.max(1,(R()<.6?R()*.012:R()*.05)*height),x:R()<.5?0:R()*width*.6,w:width*(.25+R()*.75),c:COL[R()*3|0],a:.07+R()*.15,
        sw:R()<.4?(R()<.5?-1:1)*width*(.3+R()*.5):0,t0:R()*.45,k:r<.45?'band':r<.75?'rgb':'mosh',sh:(R()<.5?-1:1)*(3+R()*width*.04)});
    }
    burst={t:t,d:170+R()*330,sl:sl};nextB=t+2000+R()*3000;
  }
  function blocks(n,a){
    for(var i=0;i<n;i++){
      var w=4+R()*width*.035,h=2+R()*height*.02,x=R()*width,y=R()*height,o=1+R()*3;
      ctx.fillStyle='rgba(255,59,74,'+a+')';ctx.fillRect(x-o,y,w,h);
      ctx.fillStyle='rgba(0,229,255,'+a+')';ctx.fillRect(x+o,y,w,h);
      if(R()<.4){ctx.fillStyle='rgba(255,212,0,'+a*.8+')';ctx.fillRect(x,y+h*.3,w*.6,Math.max(1,h*.4));}
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
      ctx.fillStyle='rgba(255,59,74,'+s.a+')';ctx.fillRect(x-o,s.y,s.w,s.h);
      ctx.fillStyle='rgba(0,229,255,'+s.a+')';ctx.fillRect(x+o,s.y,s.w,s.h);
      ctx.globalCompositeOperation='source-over';return;
    }
    ctx.fillStyle='rgba('+s.c+','+s.a+')';ctx.fillRect(x,s.y,s.w,s.h);
    ctx.fillStyle='rgba('+s.c+','+s.a*1.6+')';ctx.fillRect(x,s.y,s.w,Math.max(1,S));
  }
  function txt(o,on){
    if(!on)return;
    ctx.font=Math.max(6,Math.round(12*S))+'px ui-monospace,Menlo,Consolas,"Liberation Mono",monospace';
    ctx.fillStyle='rgba(255,59,74,'+o.a*.5+')';ctx.fillText(o.s,o.x-1,o.y);
    ctx.fillStyle='rgba(0,229,255,'+o.a*.5+')';ctx.fillText(o.s,o.x+1,o.y);
    ctx.fillStyle='rgba('+o.c+','+o.a+')';ctx.fillText(o.s,o.x,o.y);
  }
  function noise(a){
    ctx.save();ctx.globalAlpha=a;ctx.translate(-(R()*96|0),-(R()*96|0));
    ctx.fillStyle=pats[fi%pats.length];ctx.fillRect(0,0,width+96,height+96);ctx.restore();
  }
  function draw(t,dt){
    var b=burst&&t-burst.t<burst.d?burst:null;if(burst&&!b)burst=null;
    ctx.globalAlpha=b?.4:.8;ctx.drawImage(base,0,0);ctx.globalAlpha=1;
    fi++;noise(.55);
    for(var i=0;i<tracks.length;i++){
      var k=tracks[i];k.y+=k.v*dt/1000;if(k.y>height+k.h)k.y=-k.h*2;
      var yy=k.y|0,hh=Math.max(1,k.h|0);
      if(yy>=0&&yy+hh<=height){ctx.globalAlpha=.6;ctx.drawImage(cv,0,yy,width,hh,2+S*4,yy,width,hh);ctx.globalAlpha=1;}
      ctx.fillStyle='rgba(236,233,223,.035)';ctx.fillRect(0,yy,width,hh);
      for(var j=0;j<3;j++){ctx.fillStyle='rgba(255,212,0,'+(.05+R()*.06)+')';ctx.fillRect(R()*width,yy+R()*hh,4+R()*width*.06,1);}
    }
    if(!burst&&t>=nextB)newBurst(t);
    if(b){var p=(t-b.t)/b.d;for(var s=0;s<b.sl.length;s++)if(p>=b.sl[s].t0)slice(b.sl[s],p);blocks(mob?5:10,.10+R()*.08);}
    if(t>=nextT&&texts.length<(mob?2:4)){
      texts.push({s:word(),x:R()*width*.85,y:8+R()*Math.max(8,height-12),c:R()<.6?'255,212,0':R()<.5?'236,233,223':'0,229,255',a:.14+R()*.14,t:t,d:350+R()*800});
      nextT=t+(mob?1800:1100)+R()*2600;
    }
    for(var q=texts.length-1;q>=0;q--){var o=texts[q],age=t-o.t;if(age>o.d){texts.splice(q,1);continue;}txt(o,((age/70)|0)%4!==1);}
  }
  function still(){
    if(!ctx||!base)return;
    ctx.globalAlpha=1;ctx.drawImage(base,0,0);noise(.6);var sv=burst;newBurst(0);var b=burst;
    for(var s=0;s<b.sl.length;s++)if(b.sl[s].k!=='mosh')slice(b.sl[s],.5);blocks(mob?4:8,.12);burst=sv;nextB=0;
    for(var i=0;i<(mob?2:3);i++)txt({s:word(),x:R()*width*.8,y:10+R()*Math.max(8,height-14),c:'255,212,0',a:.2},true);
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
      last=0;if(!nextB)nextB=performance.now()+400;raf=requestAnimationFrame(loop);
    }
  }

  function mount(){
    if(!onPage()||!D.body){unmount();return;}
    ensureStyle();
    wrap=D.querySelector('#header .header-announcement-bar-wrapper')||D.querySelector('.header-announcement-bar-wrapper');
    if(!wrap)return;
    if(cv&&cv.isConnected&&cv.parentNode===wrap){size(false);startLoop();return;}
    var host=wrap;
    unmountCanvasOnly();
    wrap=host;
    cv=D.createElement('canvas');cv.id=CV_ID;cv.setAttribute('aria-hidden','true');cv.setAttribute('role','presentation');
    ov=D.createElement('div');ov.id=OV_ID;ov.setAttribute('aria-hidden','true');
    wrap.insertBefore(ov,wrap.firstChild);
    wrap.insertBefore(cv,wrap.firstChild);
    ctx=cv.getContext('2d',{alpha:false});if(!ctx)return;
    pats=[];base=null;bc=null;burst=null;texts=[];nextB=0;nextT=0;lastW=0;lastH=0;fi=0;
    vis=!D.hidden;onScreen=true;
    size(true);
    if(rmq.matches)still();else startLoop();
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
    cv=null;ov=null;ctx=null;wrap=null;
  }
  function unmount(){unmountCanvasOnly();}

  function destroy(){
    unmount();
    if(unvis){D.removeEventListener('visibilitychange',unvis);unvis=null;}
    if(unrm&&rmq.removeEventListener){rmq.removeEventListener('change',unrm);unrm=null;}
    if(unrs){W.removeEventListener('resize',unrs);unrs=null;}
    clearTimeout(rq);
    var st=D.getElementById(STYLE_ID);if(st&&st.parentNode)st.parentNode.removeChild(st);
    if(W[KEY]===api)delete W[KEY];
  }

  function onNav(){setTimeout(function(){if(onPage())mount();else unmount();},0);}

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

  var api={mount:mount,unmount:unmount,destroy:destroy,onPage:onPage};
  W[KEY]=api;
  ensureStyle();
  hook();
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',onNav);
  else onNav();
})();
