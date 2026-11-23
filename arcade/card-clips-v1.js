/* ARTcade card clips v1 — therapytoaster.com/arcade
   One add-on tag, loaded after every <slug>/arcade-card.js:
     <script src=".../tt-live/arcade/card-clips-v1.js?c=<commit>"></script>
   Swaps each featured .tt-ns card's still thumbnail for a short, muted, looping gameplay clip
   (<slug>/arcade-clip.webm + .mp4, poster <slug>/arcade-clip-poster.jpg).
   - Does not edit any arcade-card.js. The thumbnail stays as the background, so a clip that
     can't play (Low Power Mode, data saver, error) just shows the old still.
   - prefers-reduced-motion or Save-Data: no clips at all.
   - Clip files load only when the card is near the screen; clips pause offscreen and when the
     tab is hidden (IntersectionObserver + visibilitychange).
   - Skullz already ships its own preview <video>; we point that element at the new short clip
     instead of adding a second one.
   - Mutation handling: one debounced scan per animation frame; every card gets data-tt-clip once,
     so our own insertions never cause another change. No node is ever moved. */
(function(){
if(window.__ttCardClips)return;window.__ttCardClips=1;
var CARDS=[["sk","skullz"],["crypt","crypt"],["pit","toaster-pit"],["kart","kart"],["bo","burnt-offerings"],
 ["crumb","crumb-dungeon"],["pf","prize-floor"],["summer","summer"],["tb","toasty-bros"]];
var LIVE="https://therapytoaster.github.io/tt-live/";
var me=document.currentScript&&document.currentScript.src||"";
var ROOT=(me.match(/^(.*\/)arcade\/card-clips-v1\.js/)||[0,LIVE])[1];
var Q=(me.match(/[?&]c=([\w.-]+)/)||[0,"v1"])[1];
function url(slug,f){return ROOT+slug+"/"+f+"?c="+Q}
try{
 if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 if(navigator.connection&&navigator.connection.saveData)return;
}catch(e){}
(function(){
 if(document.getElementById("tt-clip-css"))return;
 var st=document.createElement("style");st.id="tt-clip-css";
 st.textContent="#tt-arc .tt-ns-shot video.tt-clip{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;pointer-events:none;opacity:0;transition:opacity .45s;z-index:0;background:transparent;border:0}"+
  "#tt-arc .tt-ns-shot video.tt-clip.on{opacity:1}#tt-arc .tt-ns-shot .tt-ns-new{position:relative;z-index:1}";
 (document.head||document.documentElement).appendChild(st);
})();
var io=("IntersectionObserver" in window)?new IntersectionObserver(function(es){
 for(var i=0;i<es.length;i++){var v=es[i].target.__ttClip;if(!v)continue;
  if(es[i].isIntersecting){v.__vis=1;go(v)}else{v.__vis=0;try{v.pause()}catch(e){}}}
},{rootMargin:"150px 0px"}):null;
function load(v){
 if(v.__loaded)return;v.__loaded=1;
 if(v.__own){
  var w=document.createElement("source");w.src=url(v.__slug,"arcade-clip.webm");w.type="video/webm";
  var m=document.createElement("source");m.src=url(v.__slug,"arcade-clip.mp4");m.type="video/mp4";
  v.appendChild(w);v.appendChild(m);
 }else v.setAttribute("src",url(v.__slug,"arcade-clip.mp4"));
 try{v.load()}catch(e){}
}
function go(v){
 if(document.hidden)return;load(v);
 try{var p=v.play();if(p&&p.catch)p.catch(function(){})}catch(e){}
}
function arm(b,slug){
 b.setAttribute("data-tt-clip",slug);
 var v=b.querySelector("video"),own=!v;
 if(own){v=document.createElement("video");b.insertBefore(v,b.firstChild)}
 v.className=(v.className?v.className+" ":"")+"tt-clip";
 v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.autoplay=true;
 v.setAttribute("muted","");v.setAttribute("playsinline","");v.setAttribute("loop","");v.setAttribute("autoplay","");
 v.setAttribute("aria-hidden","true");v.setAttribute("tabindex","-1");v.setAttribute("disablepictureinpicture","");
 v.preload="metadata";v.poster=url(slug,"arcade-clip-poster.jpg");
 v.__own=own;v.__slug=slug;b.__ttClip=v;
 if(!own){v.__loaded=1;v.setAttribute("src",url(slug,"arcade-clip.mp4"));} /* Skullz: point its preview element at the short clip before its own lazy loader runs */
 v.addEventListener("playing",function(){v.classList.add("on")});
 v.addEventListener("error",function(){v.classList.remove("on")},true);
 if(io)io.observe(b);else go(v);
}
function scan(){
 var root=document.getElementById("tt-arc");if(!root)return;
 for(var i=0;i<CARDS.length;i++){
  var b=root.querySelector(".tt-ns-shot[data-"+CARDS[i][0]+"-play]:not([data-tt-clip])");
  if(b)arm(b,CARDS[i][1]);
 }
}
var queued=0;
function later(){if(queued)return;queued=1;(window.requestAnimationFrame||setTimeout)(function(){queued=0;scan()})}
document.addEventListener("visibilitychange",function(){
 var vs=document.querySelectorAll("#tt-arc video.tt-clip");
 for(var i=0;i<vs.length;i++){if(document.hidden){try{vs[i].pause()}catch(e){}}else if(vs[i].__vis)go(vs[i])}
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",scan);else scan();
window.addEventListener("load",later);window.addEventListener("mercury:load",later);
try{new MutationObserver(function(ms){
 for(var i=0;i<ms.length;i++){for(var j=0;j<ms[i].addedNodes.length;j++){var n=ms[i].addedNodes[j];
  if(n.nodeType===1&&n.tagName!=="VIDEO"&&n.tagName!=="SOURCE"){later();return}}}
}).observe(document.body||document.documentElement,{childList:true,subtree:true})}catch(e){}
})();
