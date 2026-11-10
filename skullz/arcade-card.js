/* Mr. Toasty's No Signal Skullz: arcade card + overlay player for therapytoaster.com/arcade.
   Load with one tag: <script src="https://therapytoaster.github.io/tt-live/skullz/arcade-card.js"></script>
   Inserts the featured card BEFORE No Signal's .tt-ns card (fallback: before .ta-grid) once,
   optionally hides the original No Signal card (HIDE_ORIGINAL, via an injected <style>; its markup is untouched),
   re-checks under Squarespace soft navigation, and opens the game in the .tt-ns-ov overlay. */
(function(){
if(window.__ttSkCard)return;window.__ttSkCard=1;
/* HIDE_ORIGINAL: true hides the original No Signal card (.tt-ns, not ours) on the arcade page with an injected style.
   Set to false to show it again (the game itself stays hosted at /tt-live/game/; nothing is deleted). */
var HIDE_ORIGINAL=true;
/* SHOW_ORIGINAL_LABEL: small 'THE ORIGINAL' heading above No Signal. Only used when HIDE_ORIGINAL is false. */
var SHOW_ORIGINAL_LABEL=true;
var NAME="Mr. Toasty's No Signal Skullz",NAME_UP="MR. TOASTY'S NO SIGNAL SKULLZ";
function hideStyle(){if(!HIDE_ORIGINAL||document.getElementById('tt-sk-hide'))return;var st=document.createElement('style');st.id='tt-sk-hide';
 st.textContent='#tt-arc .tt-ns:not([data-sk-card]){display:none!important}';(document.head||document.documentElement).appendChild(st)}
hideStyle();
/* v0.6.1: compact player bar on short (landscape phone) screens so the game gets the height */
(function(){if(document.getElementById('tt-sk-ovcss'))return;var st=document.createElement('style');st.id='tt-sk-ovcss';
 st.textContent='@media (max-height:500px){#tt-sk-ov .tt-ns-ov-bar{padding:2px 8px;font-size:10px;gap:8px;border-bottom-width:1px}#tt-sk-ov .tt-ns-ov-bar a{font-size:10px}#tt-sk-ov .tt-ns-ov-x{width:26px;height:26px;font-size:15px}}';
 (document.head||document.documentElement).appendChild(st)})();
var U='https://therapytoaster.github.io/tt-live/skullz/';
/* v0.6: animated card art. A ~0.8MB muted looping preview of the attract loop, lazy-loaded only when the card
   scrolls into view; skipped for prefers-reduced-motion and Save-Data; the thumbnail stays as poster/fallback. */
var ART_V='71',PREVIEW=U+'card-preview.mp4?v='+ART_V;
var CARD='<button type="button" class="tt-ns-shot" data-sk-play aria-label="Play '+NAME.replace("'","&#39;")+'" style="background-image:url('+U+'thumb.jpg?v='+ART_V+');position:relative;overflow:hidden"><span class="tt-ns-new">NEW</span></button>'+
 '<div><p class="tt-ns-k">// new machine</p><h2 class="tt-ns-t">'+NAME.replace("'","&#39;")+'</h2>'+
 '<p class="tt-ns-d">A 404 roguelike: play as Mr. Toasty, free the Cotys, break the Glitch.</p>'+
 '<button type="button" class="tt-ns-play" data-sk-play>&#9654; PLAY</button>'+
 '<a class="tt-ns-new-tab" href="'+U+'" target="_blank" rel="noopener">open in new tab &#8599;</a>'+
 '<p class="tt-ns-keys">WASD + MOUSE &middot; CLICK FIRE &middot; 1-8 WEAPONS &middot; E USE &middot; TAB MAP &middot; PHONES: TOUCH CONTROLS</p></div>';
function insert(){
 var root=document.getElementById('tt-arc');if(!root||root.querySelector('[data-sk-card]'))return;
 var d=document.createElement('div');d.className='tt-ns';d.setAttribute('data-sk-card','');d.setAttribute('aria-label','Featured game: '+NAME);d.innerHTML=CARD;
 var ns=root.querySelector('.tt-ns:not([data-sk-card])'),grid=root.querySelector('.ta-grid');
 if(ns&&ns.parentNode){ns.parentNode.insertBefore(d,ns);
  if(!HIDE_ORIGINAL&&SHOW_ORIGINAL_LABEL&&!root.querySelector('[data-sk-orig]')){var l=document.createElement('p');l.setAttribute('data-sk-orig','');l.className='tt-sk-orig';l.textContent='\u25BC The original';
   l.style.cssText='margin:0 0 8px;font:12px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.28em;text-transform:uppercase;color:#FFD400;opacity:.85';ns.parentNode.insertBefore(l,ns)}}
 else if(grid&&grid.parentNode)grid.parentNode.insertBefore(d,grid);else return;
 lazyVideo(d);
}
function lazyVideo(root){var b=root&&root.querySelector('.tt-ns-shot[data-sk-play]');if(!b||b.querySelector('video'))return;
 try{if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(navigator.connection&&navigator.connection.saveData)return}catch(e){}
 var v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');v.setAttribute('tabindex','-1');
 v.preload='none';v.poster=U+'thumb.jpg?v='+ART_V;v.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;pointer-events:none;opacity:0;transition:opacity .4s;z-index:0';
 v.addEventListener('playing',function(){v.style.opacity='1'});v.addEventListener('error',function(){if(v.parentNode)v.parentNode.removeChild(v)});
 b.insertBefore(v,b.firstChild);var badge=b.querySelector('.tt-ns-new');if(badge){if(getComputedStyle(badge).position==='static')badge.style.position='relative';badge.style.zIndex='1'}
 var go=function(){if(!v.getAttribute('src'))v.setAttribute('src',PREVIEW);var p=v.play();if(p&&p.catch)p.catch(function(){})};
 if('IntersectionObserver' in window){new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){if(es[i].isIntersecting)go();else if(v.getAttribute('src'))v.pause()}},{rootMargin:'200px'}).observe(b)}else go()}
function close(){var o=document.getElementById('tt-sk-ov');if(o)o.remove();if(!document.getElementById('tt-ns-ov'))document.documentElement.classList.remove('tt-ns-lock')}
function open(){close();var o=document.createElement('div');o.id='tt-sk-ov';o.className='tt-ns-ov';o.setAttribute('role','dialog');o.setAttribute('aria-label',NAME);
 o.innerHTML='<div class="tt-ns-ov-bar"><span>'+NAME_UP.replace("'","&#39;")+'</span><a href="'+U+'" target="_blank" rel="noopener">open in new tab &#8599;</a><button type="button" class="tt-ns-ov-x" aria-label="Close game">&times;</button></div>';
 var f=document.createElement('iframe');f.src=U;f.title=NAME;f.setAttribute('allow','fullscreen; pointer-lock; autoplay');f.setAttribute('allowfullscreen','');o.appendChild(f);
 document.body.appendChild(o);document.documentElement.classList.add('tt-ns-lock');o.querySelector('.tt-ns-ov-x').onclick=close;setTimeout(function(){try{f.focus()}catch(e){}},50)}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-sk-play]');if(b){e.preventDefault();open()}});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
function check(){close();hideStyle();insert()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',insert);else insert();
window.addEventListener('mercury:load',check);window.addEventListener('load',insert);
/* soft-nav safety net: re-insert if Squarespace swaps the page content */
try{new MutationObserver(function(){if(document.getElementById('tt-arc')&&!document.querySelector('[data-sk-card]'))insert()}).observe(document.body||document.documentElement,{childList:true,subtree:true})}catch(e){}
})();
