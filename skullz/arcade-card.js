/* Mr. Toasty's Skullz: arcade card + overlay player for therapytoaster.com/arcade.
   Load with one tag: <script src="https://therapytoaster.github.io/tt-live/skullz/arcade-card.js"></script>
   Inserts the featured card after No Signal's .tt-ns card (fallback: before .ta-grid) once,
   re-checks under Squarespace soft navigation, and opens the game in the .tt-ns-ov overlay. */
(function(){
if(window.__ttSkCard)return;window.__ttSkCard=1;
var U='https://therapytoaster.github.io/tt-live/skullz/';
var CARD='<button type="button" class="tt-ns-shot" data-sk-play aria-label="Play Mr. Toasty\'s Skullz" style="background-image:url('+U+'thumb.jpg)"><span class="tt-ns-new">NEW</span></button>'+
 '<div><p class="tt-ns-k">// new machine</p><h2 class="tt-ns-t">Mr. Toasty\'s Skullz</h2>'+
 '<p class="tt-ns-d">A 404 roguelike: play as Mr. Toasty, free the Cotys, break the Glitch.</p>'+
 '<button type="button" class="tt-ns-play" data-sk-play>&#9654; PLAY</button>'+
 '<a class="tt-ns-new-tab" href="'+U+'" target="_blank" rel="noopener">open in new tab &#8599;</a>'+
 '<p class="tt-ns-keys">WASD + MOUSE &middot; CLICK FIRE &middot; 1-4 WEAPONS &middot; E USE &middot; TAB MAP &middot; PHONES: TOUCH CONTROLS</p></div>';
function insert(){
 var root=document.getElementById('tt-arc');if(!root||root.querySelector('[data-sk-card]'))return;
 var d=document.createElement('div');d.className='tt-ns';d.setAttribute('data-sk-card','');d.setAttribute('aria-label',"Featured game: Mr. Toasty's Skullz");d.innerHTML=CARD;
 var ns=root.querySelector('.tt-ns:not([data-sk-card])'),grid=root.querySelector('.ta-grid');
 if(ns&&ns.parentNode)ns.parentNode.insertBefore(d,ns.nextSibling);else if(grid&&grid.parentNode)grid.parentNode.insertBefore(d,grid);else return;
}
function close(){var o=document.getElementById('tt-sk-ov');if(o)o.remove();if(!document.getElementById('tt-ns-ov'))document.documentElement.classList.remove('tt-ns-lock')}
function open(){close();var o=document.createElement('div');o.id='tt-sk-ov';o.className='tt-ns-ov';o.setAttribute('role','dialog');o.setAttribute('aria-label',"Mr. Toasty's Skullz");
 o.innerHTML='<div class="tt-ns-ov-bar"><span>MR. TOASTY\'S SKULLZ</span><a href="'+U+'" target="_blank" rel="noopener">open in new tab &#8599;</a><button type="button" class="tt-ns-ov-x" aria-label="Close game">&times;</button></div>';
 var f=document.createElement('iframe');f.src=U;f.title="Mr. Toasty's Skullz";f.setAttribute('allow','fullscreen; pointer-lock; autoplay');f.setAttribute('allowfullscreen','');o.appendChild(f);
 document.body.appendChild(o);document.documentElement.classList.add('tt-ns-lock');o.querySelector('.tt-ns-ov-x').onclick=close;setTimeout(function(){try{f.focus()}catch(e){}},50)}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-sk-play]');if(b){e.preventDefault();open()}});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
function check(){close();insert()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',insert);else insert();
window.addEventListener('mercury:load',check);window.addEventListener('load',insert);
/* soft-nav safety net: re-insert if Squarespace swaps the page content */
try{new MutationObserver(function(){if(document.getElementById('tt-arc')&&!document.querySelector('[data-sk-card]'))insert()}).observe(document.body||document.documentElement,{childList:true,subtree:true})}catch(e){}
})();
