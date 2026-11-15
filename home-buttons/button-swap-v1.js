/* TT HOME BUTTON SWAP v1 (Home only).
   Swaps what two Home buttons do, without touching their original code:
   - Top-left site logo (a#site-title)  -> now plays the "Don't click this" effect (glitch + TOASTER OVERLOAD box).
   - "Don't click this" button beside Mr. Toasty's Daily Glitch -> now plays the logo's "site crash" (404 / BSOD) easter egg.
   Works by catching the click on window (capture, runs before both original handlers), cancelling it,
   then replaying a click on the other button with a pass-through flag. */
(function(){
  if(window.__ttBtnSwap)return;window.__ttBtnSwap=1;
  var pass=false;
  function home(){var b=document.body;return !!(b&&b.classList.contains('homepage'));}
  function logoEl(){
    var all=document.querySelectorAll('.header-title-text a, a#site-title');
    for(var i=0;i<all.length;i++){if(all[i].offsetParent!==null)return all[i];}
    return all[0]||null;
  }
  function replay(el){pass=true;try{el.click();}finally{pass=false;}}
  window.addEventListener('click',function(e){
    if(pass||!home())return;
    if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var t=e.target;if(!t||!t.closest)return;
    var dont=t.closest('.tt-dont');
    if(dont){
      var lg=logoEl();if(!lg)return;
      e.preventDefault();e.stopImmediatePropagation();
      replay(lg);            /* runs the logo's crash easter egg */
      return;
    }
    var logo=t.closest('.header-title-text a, a#site-title');
    if(logo&&logo.closest('header')){
      if(document.body.classList.contains('header--menu-open'))return;
      var d=document.querySelector('.tt-dont');if(!d)return; /* not ready yet: leave the logo alone */
      e.preventDefault();e.stopImmediatePropagation();
      replay(d);             /* runs the Don't-click overload effect */
    }
  },true);
})();
