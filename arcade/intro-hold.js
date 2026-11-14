/* TT ARCADE INTRO HOLD v1
   Play the Toasty's ARTcade intro once, then stay on the animated
   "INSERT COIN" title screen. Overrides the inline v4 loop=true.
   The 4s intro fades to black after 3.33s; this cuts at 3.033s
   (after frame 91, end of an INSERT COIN off beat) and swaps to
   arcade/intro-attract.mp4, a 1.2s seamless loop of the title
   screen (frames 1.833s–3.000s of the intro: two 0.6s blink
   cycles, scrolling grid, twinkling stars). Reduced-motion shows
   the title still. Mute + playsinline. Safe under Squarespace
   soft nav: returning to /arcade may play the intro once again.
   Usage (append to the ARTcade block):
     <script src="https://therapytoaster.github.io/tt-live/arcade/intro-hold.js?c=SHA"></script>
*/
(function(){
  var BASE=window.TT_INTRO_HOLD_BASE||'https://therapytoaster.github.io/tt-live/arcade/';
  var CUT=91/30;
  var root=document.getElementById('tt-arc');
  if(!root)return;
  var box=root.querySelector('#tt-intro');
  if(!box||box.getAttribute('data-tt-intro-hold'))return;
  box.setAttribute('data-tt-intro-hold','1');

  var me=document.currentScript;
  var qs=(me&&me.src&&me.src.indexOf('?')>=0)?me.src.slice(me.src.indexOf('?')):'';
  var ATTRACT=BASE+'intro-attract.mp4'+qs;
  var STILL=BASE+'intro-title.jpg'+qs;

  var v=box.querySelector('video');
  if(!v)return;

  v.loop=false;
  v.removeAttribute('loop');
  v.muted=true;
  v.defaultMuted=true;
  v.autoplay=true;
  v.playsInline=true;
  v.controls=false;
  v.removeAttribute('controls');
  v.setAttribute('playsinline','');
  v.setAttribute('webkit-playsinline','');
  v.setAttribute('muted','');
  v.classList.add('tt-intro-main');

  if(!document.getElementById('tt-intro-hold-css')){
    var st=document.createElement('style');
    st.id='tt-intro-hold-css';
    st.textContent=
      '#tt-arc #tt-intro video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;display:block;background:#000;pointer-events:none}'+
      '#tt-arc #tt-intro video.tt-intro-hold{opacity:0;z-index:1}'+
      '#tt-arc #tt-intro.is-hold video.tt-intro-main{opacity:0}'+
      '#tt-arc #tt-intro.is-hold video.tt-intro-hold{opacity:1}'+
      '#tt-arc #tt-intro.is-still video{opacity:0}'+
      '#tt-arc #tt-intro.is-still img.tt-intro-still{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;background:#000;pointer-events:none}';
    document.documentElement.appendChild(st);
  }

  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)');
  if(RM&&RM.matches){
    v.removeAttribute('autoplay');
    try{v.pause()}catch(e){}
    var img=document.createElement('img');
    img.className='tt-intro-still';
    img.alt="Toasty's ARTcade";
    img.src=STILL;
    box.appendChild(img);
    box.classList.add('is-still');
    return;
  }

  var hold=document.createElement('video');
  hold.className='tt-intro-hold';
  hold.muted=true;
  hold.defaultMuted=true;
  hold.loop=true;
  hold.autoplay=false;
  hold.playsInline=true;
  hold.preload='auto';
  hold.setAttribute('muted','');
  hold.setAttribute('loop','');
  hold.setAttribute('playsinline','');
  hold.setAttribute('webkit-playsinline','');
  hold.setAttribute('disablepictureinpicture','');
  hold.setAttribute('controlslist','nodownload nofullscreen noremoteplayback');
  hold.src=ATTRACT;
  box.appendChild(hold);
  try{hold.load()}catch(e){}

  var swapped=0;
  function swap(){
    if(swapped)return;
    swapped=1;
    try{v.pause()}catch(e){}
    try{if(hold.currentTime)hold.currentTime=0}catch(e){}
    var p=hold.play&&hold.play();
    if(p&&p.catch)p.catch(function(){});
    box.classList.add('is-hold');
  }

  function watch(){
    if(swapped)return;
    if((v.currentTime||0)>=CUT-0.001){swap();return;}
    if(v.requestVideoFrameCallback){
      v.requestVideoFrameCallback(function(now,meta){
        if(swapped)return;
        var mt=(meta&&meta.mediaTime!=null)?meta.mediaTime:v.currentTime;
        if(mt>=CUT-0.001)swap();
        else watch();
      });
    }else{
      requestAnimationFrame(watch);
    }
  }

  v.addEventListener('timeupdate',function(){
    if(!swapped&&v.currentTime>=CUT)swap();
  });
  v.addEventListener('ended',swap);
  v.addEventListener('playing',function(){watch();});
  if(v.readyState>=2){
    if((v.currentTime||0)>=CUT-0.001)swap();
    else if(!v.paused)watch();
  }
  var p=v.play&&v.play();
  if(p&&p.catch)p.catch(function(){});
})();
