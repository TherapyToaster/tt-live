/* TT ARCADE DISCORD v1
   Yellow-on-black "JOIN THE DISCORD" button just below the intro TV
   and above the game cards. Opens Mr. Toasty's Server in a new tab.
   Usage (append to the ARTcade block):
     <script src="https://therapytoaster.github.io/tt-live/arcade/discord-v1.js?c=SHA"></script>
*/
(function(){
  var DISCORD_URL='https://discord.gg/PUzj2XJMz';
  var LOGO='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>';

  var root=document.getElementById('tt-arc');
  if(!root||root.getAttribute('data-tt-arc-discord')||document.getElementById('tt-arc-discord'))return;

  function injectStyle(){
    if(document.getElementById('tt-arc-discord-css'))return;
    var st=document.createElement('style');
    st.id='tt-arc-discord-css';
    st.textContent=
      '#tt-arc .tt-arc-discord{margin:0 0 18px;text-align:center}'+
      '#tt-arc .tt-arc-discord-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:10px 18px;border:2px solid #FFD400;border-radius:8px;background:#000;color:#FFD400!important;font:800 13px/1.2 inherit;letter-spacing:.12em;text-transform:uppercase;text-decoration:none!important;box-shadow:3px 3px 0 #ff2b4a,-3px -3px 0 rgba(0,229,255,.55)}'+
      '#tt-arc .tt-arc-discord-btn svg{width:22px;height:22px;flex:none;display:block;fill:currentColor}'+
      '#tt-arc .tt-arc-discord-btn:hover,#tt-arc .tt-arc-discord-btn:focus-visible{background:#FFD400;color:#000!important;outline:none}'+
      '@media (max-width:640px){#tt-arc .tt-arc-discord{margin:0 0 16px}#tt-arc .tt-arc-discord-btn{display:flex;width:100%;padding:12px 14px}}';
    document.documentElement.appendChild(st);
  }

  function place(el){
    var games=root.querySelector('.tt-ns, .ta-grid');
    if(games&&games.parentNode){
      games.parentNode.insertBefore(el,games);
      return;
    }
    var tv=root.querySelector('.tt-tv')||root.querySelector('#tt-intro');
    if(tv&&tv.parentNode){
      if(tv.nextSibling)tv.parentNode.insertBefore(el,tv.nextSibling);
      else tv.parentNode.appendChild(el);
    }
  }

  function start(){
    if(root.getAttribute('data-tt-arc-discord')||document.getElementById('tt-arc-discord'))return true;
    var anchor=root.querySelector('.tt-tv')||root.querySelector('#tt-intro')||root.querySelector('.tt-ns, .ta-grid');
    if(!anchor)return false;
    root.setAttribute('data-tt-arc-discord','1');
    injectStyle();
    var wrap=document.createElement('p');
    wrap.className='tt-arc-discord';
    wrap.id='tt-arc-discord';
    var a=document.createElement('a');
    a.className='tt-arc-discord-btn';
    a.href=DISCORD_URL;
    a.target='_blank';
    a.rel='noopener';
    a.innerHTML=LOGO+'<span>Join the Discord</span>';
    wrap.appendChild(a);
    place(wrap);
    return true;
  }

  if(start())return;
  var n=0,t=setInterval(function(){
    if(start()||++n>40)clearInterval(t);
  },50);
})();
