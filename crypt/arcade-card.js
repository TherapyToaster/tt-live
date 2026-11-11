/* Mr. Toasty's Crypt: arcade card + overlay player for therapytoaster.com/arcade.
   Load with one tag: <script src="https://therapytoaster.github.io/tt-live/crypt/arcade-card.js"></script>
   Inserts the featured card AFTER the Skullz card (fallback: after any .tt-ns, then before .ta-grid) once,
   re-checks under Squarespace soft navigation, and opens the game in a .tt-ns-ov overlay.
   Does not modify skullz/arcade-card.js. If that script has not run yet, the card is placed in a
   fallback spot and moved to sit directly under the Skullz card once it appears.
   A small injected style keeps this card visible if the Skullz script hides other .tt-ns cards. */
(function(){
if(window.__ttCryptCard)return;window.__ttCryptCard=1;
var NAME="Mr. Toasty's Crypt",NAME_UP="MR. TOASTY'S CRYPT";
var LIVE='https://therapytoaster.github.io/tt-live/crypt/';
var ART_V='041';
var U=(function(){
  var s=document.currentScript&&document.currentScript.src;
  if(s){var u=s.replace(/arcade-card\.js(?:\?.*)?$/i,'');if(u)return u}
  return LIVE;
})();
/* Skullz injects `#tt-arc .tt-ns:not([data-sk-card]){display:none}`. Re-assert ours with higher
   specificity and re-append the tag so it wins the cascade after that script runs. */
function showStyle(){
  var st=document.getElementById('tt-crypt-show');
  if(!st){st=document.createElement('style');st.id='tt-crypt-show'}
  st.textContent='#tt-arc div.tt-ns[data-crypt-card]{display:grid!important}';
  (document.head||document.documentElement).appendChild(st);
}
showStyle();
(function(){
  if(document.getElementById('tt-crypt-ovcss'))return;
  var st=document.createElement('style');st.id='tt-crypt-ovcss';
  st.textContent='@media (max-height:500px){#tt-crypt-ov .tt-ns-ov-bar{padding:2px 8px;font-size:10px;gap:8px;border-bottom-width:1px}#tt-crypt-ov .tt-ns-ov-bar a{font-size:10px}#tt-crypt-ov .tt-ns-ov-x{width:26px;height:26px;font-size:15px}}';
  (document.head||document.documentElement).appendChild(st);
})();
var THUMB=U+'arcade-thumb.jpg?v='+ART_V;
var CARD='<button type="button" class="tt-ns-shot" data-crypt-play aria-label="Play '+NAME.replace("'","&#39;")+'" style="background-image:url('+THUMB+')"><span class="tt-ns-new">NEW</span></button>'+
 '<div><p class="tt-ns-k">// new machine</p><h2 class="tt-ns-t">'+NAME.replace("'","&#39;")+'</h2>'+
 '<p class="tt-ns-d">A Binding of Isaac-style roguelike crypt crawl with Skullz heroes, guns and glitch bosses.</p>'+
 '<button type="button" class="tt-ns-play" data-crypt-play>&#9654; PLAY</button>'+
 '<a class="tt-ns-new-tab" href="'+LIVE+'" target="_blank" rel="noopener">open in new tab &#8599;</a>'+
 '<p class="tt-ns-keys">WASD MOVE &middot; MOUSE AIM &middot; CLICK FIRE &middot; SPACE ROLL &middot; R SPECIAL &middot; Q BLANK &middot; PHONES: TOUCH CONTROLS</p></div>';

function anchor(root){
  var sk=root.querySelector('[data-sk-card]');
  if(sk)return{parent:sk.parentNode,ref:sk.nextSibling};
  var ns=root.querySelector('.tt-ns:not([data-sk-card]):not([data-crypt-card])');
  if(ns)return{parent:ns.parentNode,ref:ns.nextSibling};
  var grid=root.querySelector('.ta-grid');
  if(grid)return{parent:grid.parentNode,ref:grid};
  return null;
}
function place(node,root){
  var a=anchor(root);if(!a)return false;
  /* a.ref === node means we are already sitting in the right spot (directly after the anchor).
     insertBefore(node, node) would retrigger the observer and hang the page. */
  if(a.ref===node||(node.parentNode===a.parent&&node.nextSibling===a.ref))return true;
  a.parent.insertBefore(node,a.ref);
  return true;
}
function insert(){
  showStyle();
  var root=document.getElementById('tt-arc');if(!root)return;
  var existing=root.querySelector('[data-crypt-card]');
  if(existing){place(existing,root);return}
  var a=anchor(root);if(!a)return;
  var d=document.createElement('div');
  d.className='tt-ns';
  d.setAttribute('data-crypt-card','');
  d.setAttribute('aria-label','Featured game: '+NAME);
  d.innerHTML=CARD;
  a.parent.insertBefore(d,a.ref);
}

function close(){
  var o=document.getElementById('tt-crypt-ov');if(o)o.remove();
  if(!document.getElementById('tt-sk-ov')&&!document.getElementById('tt-ns-ov'))
    document.documentElement.classList.remove('tt-ns-lock');
}
function open(){
  close();
  var o=document.createElement('div');o.id='tt-crypt-ov';o.className='tt-ns-ov';
  o.setAttribute('role','dialog');o.setAttribute('aria-label',NAME);
  o.innerHTML='<div class="tt-ns-ov-bar"><span>'+NAME_UP.replace("'","&#39;")+'</span><a href="'+LIVE+'" target="_blank" rel="noopener">open in new tab &#8599;</a><button type="button" class="tt-ns-ov-x" aria-label="Close game">&times;</button></div>';
  var f=document.createElement('iframe');f.src=LIVE;f.title=NAME;
  f.setAttribute('allow','fullscreen; pointer-lock; autoplay');f.setAttribute('allowfullscreen','');
  o.appendChild(f);document.body.appendChild(o);
  document.documentElement.classList.add('tt-ns-lock');
  o.querySelector('.tt-ns-ov-x').onclick=close;
  setTimeout(function(){try{f.focus()}catch(e){}},50);
}

document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-crypt-play]');
  if(b){e.preventDefault();open()}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});

function check(){close();showStyle();insert()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',insert);else insert();
window.addEventListener('mercury:load',check);
window.addEventListener('load',insert);
/* soft-nav safety net + wait for the Skullz card so order stays Skullz, then Crypt */
try{
  new MutationObserver(function(){
    var root=document.getElementById('tt-arc');if(!root)return;
    if(!root.querySelector('[data-crypt-card]'))insert();
    else insert(); /* reposition under Skullz if that card arrived later */
  }).observe(document.body||document.documentElement,{childList:true,subtree:true});
}catch(e){}
var waits=0,waitTimer=setInterval(function(){
  waits++;insert();
  var root=document.getElementById('tt-arc');
  if((root&&root.querySelector('[data-sk-card]')&&root.querySelector('[data-crypt-card]'))||waits>20){
    clearInterval(waitTimer);
  }
},50);
})();
