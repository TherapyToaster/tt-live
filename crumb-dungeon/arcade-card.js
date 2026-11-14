/* Skullz: Crumb Dungeon — arcade card + overlay player for therapytoaster.com/arcade.
   Load with one tag: <script src="https://therapytoaster.github.io/tt-live/crumb-dungeon/arcade-card.js"></script>
   Inserts the featured card AFTER the Burnt Offerings card (fallbacks: after CyberToaster Kart,
   after Toaster Pit, after Crypt, after Skullz, after any .tt-ns, then before .ta-grid) once,
   re-checks under Squarespace soft navigation, and opens the game in a .tt-ns-ov overlay.
   Does not modify burnt-offerings/, kart/, toaster-pit/, crypt/, or skullz/ arcade-card.js.
   If those scripts have not run yet, the card is placed in a fallback spot and moved to sit
   directly under the Burnt Offerings card once it appears.
   A small injected style keeps this card visible if the Skullz script hides other .tt-ns cards. */
(function(){
if(window.__ttCrumbCard)return;window.__ttCrumbCard=1;
var NAME="Skullz: Crumb Dungeon",NAME_UP="SKULLZ: CRUMB DUNGEON";
var LIVE="https://therapytoaster.github.io/tt-live/crumb-dungeon/";
var ART_V="010";
var U=(function(){
  var s=document.currentScript&&document.currentScript.src;
  if(s){var u=s.replace(/arcade-card\.js(?:\?.*)?$/i,"");if(u)return u}
  return LIVE;
})();
/* Skullz injects `#tt-arc .tt-ns:not([data-sk-card]){display:none}`. Re-assert ours with higher
   specificity and re-append the tag so it wins the cascade after that script runs. */
function showStyle(){
  var st=document.getElementById("tt-crumb-show");
  if(!st){st=document.createElement("style");st.id="tt-crumb-show"}
  st.textContent="#tt-arc div.tt-ns[data-crumb-card]{display:grid!important}";
  (document.head||document.documentElement).appendChild(st);
}
showStyle();
(function(){
  if(document.getElementById("tt-crumb-ovcss"))return;
  var st=document.createElement("style");st.id="tt-crumb-ovcss";
  st.textContent="@media (max-height:500px){#tt-crumb-ov .tt-ns-ov-bar{padding:2px 8px;font-size:10px;gap:8px;border-bottom-width:1px}#tt-crumb-ov .tt-ns-ov-bar a{font-size:10px}#tt-crumb-ov .tt-ns-ov-x{width:26px;height:26px;font-size:15px}}";
  (document.head||document.documentElement).appendChild(st);
})();
var THUMB=U+"arcade-thumb.svg?v="+ART_V;
var CARD='<button type="button" class="tt-ns-shot" data-crumb-play aria-label="Play '+NAME+'" style="background-image:url('+THUMB+')"><span class="tt-ns-new">NEW</span></button>'+
 '<div><p class="tt-ns-k">// new machine</p><h2 class="tt-ns-t">'+NAME+'</h2>'+
 '<p class="tt-ns-d">A turn-based tile-matching roguelike. Slide the board, match bones and jam, and lead your SkulRz heroes through a cardboard-cutout dungeon.</p>'+
 '<button type="button" class="tt-ns-play" data-crumb-play>&#9654; PLAY</button>'+
 '<a class="tt-ns-new-tab" href="'+LIVE+'" target="_blank" rel="noopener">open in new tab &#8599;</a>'+
 '<p class="tt-ns-keys">MOUSE SLIDE ROWS / COLS &middot; SPACE END TURN &middot; ESC CANCEL &middot; F FX &middot; M MUTE</p></div>';

function anchor(root){
  var bo=root.querySelector("[data-bo-card]");
  if(bo)return{parent:bo.parentNode,ref:bo.nextSibling};
  var kart=root.querySelector("[data-kart-card]");
  if(kart)return{parent:kart.parentNode,ref:kart.nextSibling};
  var pit=root.querySelector("[data-pit-card]");
  if(pit)return{parent:pit.parentNode,ref:pit.nextSibling};
  var crypt=root.querySelector("[data-crypt-card]");
  if(crypt)return{parent:crypt.parentNode,ref:crypt.nextSibling};
  var sk=root.querySelector("[data-sk-card]");
  if(sk)return{parent:sk.parentNode,ref:sk.nextSibling};
  var ns=root.querySelector(".tt-ns:not([data-sk-card]):not([data-crypt-card]):not([data-pit-card]):not([data-kart-card]):not([data-bo-card]):not([data-crumb-card])");
  if(ns)return{parent:ns.parentNode,ref:ns.nextSibling};
  var grid=root.querySelector(".ta-grid");
  if(grid)return{parent:grid.parentNode,ref:grid};
  return null;
}
function place(node,root){
  var a=anchor(root);if(!a)return false;
  /* a.ref === node means we are already sitting in the right spot.
     insertBefore(node, node) would retrigger the observer and hang the page. */
  if(a.ref===node||(node.parentNode===a.parent&&node.nextSibling===a.ref))return true;
  a.parent.insertBefore(node,a.ref);
  return true;
}
function insert(){
  showStyle();
  var root=document.getElementById("tt-arc");if(!root)return;
  var existing=root.querySelector("[data-crumb-card]");
  if(existing){place(existing,root);return}
  var a=anchor(root);if(!a)return;
  var d=document.createElement("div");
  d.className="tt-ns";
  d.setAttribute("data-crumb-card","");
  d.setAttribute("aria-label","Featured game: "+NAME);
  d.innerHTML=CARD;
  a.parent.insertBefore(d,a.ref);
}

function close(){
  var o=document.getElementById("tt-crumb-ov");if(o)o.remove();
  if(!document.getElementById("tt-sk-ov")&&!document.getElementById("tt-crypt-ov")&&!document.getElementById("tt-pit-ov")&&!document.getElementById("tt-kart-ov")&&!document.getElementById("tt-bo-ov")&&!document.getElementById("tt-ns-ov"))
    document.documentElement.classList.remove("tt-ns-lock");
}
function focusFrame(f){
  try{if(f&&f.contentWindow)f.contentWindow.focus();else if(f)f.focus()}catch(e){try{f.focus()}catch(e2){}}
}
function open(){
  close();
  var o=document.createElement("div");o.id="tt-crumb-ov";o.className="tt-ns-ov";
  o.setAttribute("role","dialog");o.setAttribute("aria-label",NAME);
  o.innerHTML='<div class="tt-ns-ov-bar"><span>'+NAME_UP+'</span><a href="'+LIVE+'" target="_blank" rel="noopener">open in new tab &#8599;</a><button type="button" class="tt-ns-ov-x" aria-label="Close game">&times;</button></div>';
  var f=document.createElement("iframe");f.src=LIVE;f.title=NAME;
  f.setAttribute("allow","fullscreen; pointer-lock; autoplay; gamepad");
  f.setAttribute("allowfullscreen","");
  f.setAttribute("tabindex","0");
  o.appendChild(f);document.body.appendChild(o);
  document.documentElement.classList.add("tt-ns-lock");
  o.querySelector(".tt-ns-ov-x").onclick=close;
  /* Focus the iframe so clicks and keys go to the game, not the page. */
  setTimeout(function(){focusFrame(f)},50);
  f.addEventListener("load",function(){setTimeout(function(){focusFrame(f)},30)});
}

document.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest("[data-crumb-play]");
  if(b){e.preventDefault();open()}
});
document.addEventListener("keydown",function(e){if(e.key==="Escape")close()});

function check(){close();showStyle();insert()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",insert);else insert();
window.addEventListener("mercury:load",check);
window.addEventListener("load",insert);
/* soft-nav safety net + wait for the Burnt Offerings (or Kart / Toaster Pit / Crypt / Skullz)
   card so order stays Skullz, Crypt, Toaster Pit, CyberToaster Kart, Burnt Offerings,
   Skullz: Crumb Dungeon */
try{
  new MutationObserver(function(){
    var root=document.getElementById("tt-arc");if(!root)return;
    insert();
  }).observe(document.body||document.documentElement,{childList:true,subtree:true});
}catch(e){}
var waits=0,waitTimer=setInterval(function(){
  waits++;insert();
  var root=document.getElementById("tt-arc");
  if((root&&root.querySelector("[data-crumb-card]")&&(root.querySelector("[data-bo-card]")||root.querySelector("[data-kart-card]")||root.querySelector("[data-pit-card]")||root.querySelector("[data-crypt-card]")||root.querySelector("[data-sk-card]")))||waits>20){
    clearInterval(waitTimer);
  }
},50);
})();
