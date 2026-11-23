/* Toaster Summer: arcade card + overlay player for therapytoaster.com/arcade.
   Load with one tag: <script src="https://therapytoaster.github.io/tt-live/summer/arcade-card.js"></script>
   Inserts the featured card AFTER the Toasty's Prize Floor card (fallbacks: after Crumb Dungeon,
   after Burnt Offerings, after CyberToaster Kart, after Toaster Pit, after Crypt, after Skullz,
   after any .tt-ns, then before .ta-grid) once, re-checks under Squarespace soft navigation,
   and opens the game in a .tt-ns-ov overlay.
   Does not modify prize-floor/, crumb-dungeon/, burnt-offerings/, kart/, toaster-pit/, crypt/,
   or skullz/ arcade-card.js. If those scripts have not run yet, the card is placed in a
   fallback spot and moved to sit directly under the Prize Floor card once it appears.
   Sitting immediately under CyberToaster Kart would fight Burnt Offerings' existing "after
   Kart" observer and can hang the page, so this card takes the next stable featured slot
   (after Prize Floor, above the cabinet grid) until that anchor is updated.
   A small injected style keeps this card visible if the Skullz script hides other .tt-ns cards. */
(function(){
if(window.__ttSummerCard)return;window.__ttSummerCard=1;
var NAME="Toaster Summer",NAME_UP="TOASTER SUMMER";
var LIVE="https://therapytoaster.github.io/tt-live/summer/";
var ART_V="001";
var U=(function(){
  var s=document.currentScript&&document.currentScript.src;
  if(s){var u=s.replace(/arcade-card\.js(?:\?.*)?$/i,"");if(u)return u}
  return LIVE;
})();
/* Skullz injects `#tt-arc .tt-ns:not([data-sk-card]){display:none}`. Re-assert ours with higher
   specificity and re-append the tag so it wins the cascade after that script runs. */
function showStyle(){
  var st=document.getElementById("tt-summer-show");
  if(!st){st=document.createElement("style");st.id="tt-summer-show"}
  st.textContent="#tt-arc div.tt-ns[data-summer-card]{display:grid!important}";
  (document.head||document.documentElement).appendChild(st);
}
showStyle();
(function(){
  if(document.getElementById("tt-summer-ovcss"))return;
  var st=document.createElement("style");st.id="tt-summer-ovcss";
  st.textContent="@media (max-height:500px){#tt-summer-ov .tt-ns-ov-bar{padding:2px 8px;font-size:10px;gap:8px;border-bottom-width:1px}#tt-summer-ov .tt-ns-ov-bar a{font-size:10px}#tt-summer-ov .tt-ns-ov-x{width:26px;height:26px;font-size:15px}}";
  (document.head||document.documentElement).appendChild(st);
})();
var THUMB=U+"arcade-thumb.jpg?v="+ART_V;
var CARD='<button type="button" class="tt-ns-shot" data-summer-play aria-label="Play '+NAME+'" style="background-image:url('+THUMB+')"><span class="tt-ns-new">NEW</span></button>'+
 '<div><p class="tt-ns-k">// new machine</p><h2 class="tt-ns-t">'+NAME+'</h2>'+
 '<p class="tt-ns-d">Bolt a stainless truck together in the garage, then cruise summer Surf City. Gigs, shops, hunger &mdash; don&#39;t pass out toasted.</p>'+
 '<button type="button" class="tt-ns-play" data-summer-play>&#9654; PLAY</button>'+
 '<a class="tt-ns-new-tab" href="'+LIVE+'" target="_blank" rel="noopener">open in new tab &#8599;</a>'+
 '<p class="tt-ns-keys">WASD / ARROWS MOVE &middot; E INTERACT &middot; SPACE JUMP / HANDBRAKE &middot; H HELP &middot; ESC MENU</p></div>';

function anchor(root){
  var pf=root.querySelector("[data-pf-card]");
  if(pf)return{parent:pf.parentNode,ref:pf.nextSibling};
  var crumb=root.querySelector("[data-crumb-card]");
  if(crumb)return{parent:crumb.parentNode,ref:crumb.nextSibling};
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
  var ns=root.querySelector(".tt-ns:not([data-sk-card]):not([data-crypt-card]):not([data-pit-card]):not([data-kart-card]):not([data-bo-card]):not([data-crumb-card]):not([data-pf-card]):not([data-tb-card]):not([data-summer-card])");
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
  var existing=root.querySelector("[data-summer-card]");
  if(existing){place(existing,root);return}
  var a=anchor(root);if(!a)return;
  var d=document.createElement("div");
  d.className="tt-ns";
  d.setAttribute("data-summer-card","");
  d.setAttribute("aria-label","Featured game: "+NAME);
  d.innerHTML=CARD;
  a.parent.insertBefore(d,a.ref);
}

function close(){
  var o=document.getElementById("tt-summer-ov");if(o)o.remove();
  if(!document.getElementById("tt-sk-ov")&&!document.getElementById("tt-crypt-ov")&&!document.getElementById("tt-pit-ov")&&!document.getElementById("tt-kart-ov")&&!document.getElementById("tt-bo-ov")&&!document.getElementById("tt-crumb-ov")&&!document.getElementById("tt-pf-ov")&&!document.getElementById("tt-tb-ov")&&!document.getElementById("tt-ns-ov"))
    document.documentElement.classList.remove("tt-ns-lock");
}
function focusFrame(f){
  try{if(f&&f.contentWindow)f.contentWindow.focus();else if(f)f.focus()}catch(e){try{f.focus()}catch(e2){}}
}
function open(){
  close();
  var o=document.createElement("div");o.id="tt-summer-ov";o.className="tt-ns-ov";
  o.setAttribute("role","dialog");o.setAttribute("aria-label",NAME);
  o.innerHTML='<div class="tt-ns-ov-bar"><span>'+NAME_UP+'</span><a href="'+LIVE+'" target="_blank" rel="noopener">open in new tab &#8599;</a><button type="button" class="tt-ns-ov-x" aria-label="Close game">&times;</button></div>';
  var f=document.createElement("iframe");f.src=LIVE;f.title=NAME;
  f.setAttribute("allow","fullscreen; pointer-lock; autoplay; gamepad");
  f.setAttribute("allowfullscreen","");
  f.setAttribute("tabindex","0");
  o.appendChild(f);document.body.appendChild(o);
  document.documentElement.classList.add("tt-ns-lock");
  o.querySelector(".tt-ns-ov-x").onclick=close;
  /* Focus the iframe so arrows and keys go to the game, not the page scroll. */
  setTimeout(function(){focusFrame(f)},50);
  f.addEventListener("load",function(){setTimeout(function(){focusFrame(f)},30)});
}

document.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest("[data-summer-play]");
  if(b){e.preventDefault();open()}
});
document.addEventListener("keydown",function(e){if(e.key==="Escape")close()});

function check(){close();showStyle();insert()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",insert);else insert();
window.addEventListener("mercury:load",check);
window.addEventListener("load",insert);
/* soft-nav safety net + wait for Prize Floor (or Crumb / Burnt Offerings / Kart /
   Toaster Pit / Crypt / Skullz) so order stays Skullz, Crypt, Toaster Pit,
   CyberToaster Kart, Burnt Offerings, Skullz: Crumb Dungeon, Toasty's Prize Floor,
   Toaster Summer, Mr. Toasty: Toasty Bros */
try{
  new MutationObserver(function(){
    var root=document.getElementById("tt-arc");if(!root)return;
    insert();
  }).observe(document.body||document.documentElement,{childList:true,subtree:true});
}catch(e){}
var waits=0,waitTimer=setInterval(function(){
  waits++;insert();
  var root=document.getElementById("tt-arc");
  if((root&&root.querySelector("[data-summer-card]")&&(root.querySelector("[data-pf-card]")||root.querySelector("[data-crumb-card]")||root.querySelector("[data-bo-card]")||root.querySelector("[data-kart-card]")||root.querySelector("[data-pit-card]")||root.querySelector("[data-crypt-card]")||root.querySelector("[data-sk-card]")))||waits>20){
    clearInterval(waitTimer);
  }
},50);
})();
