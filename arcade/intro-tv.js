/* TT ARCADE INTRO TV
   Wraps #tt-arc #tt-intro in an original yellow CRT shell and loads
   arcade/intro-tv.css (same ?c= pin as this script). Does not change
   intro-hold play-once-then-hold behavior.
   Optional: window.TT_INTRO_TV_STYLE = 'classic' | 'chunky'
   Usage (append to the ARTcade block, after intro-hold.js):
     <script src="https://therapytoaster.github.io/tt-live/arcade/intro-tv.js?c=SHA"></script>
*/
(function(){
  var root=document.getElementById('tt-arc');
  if(!root)return;
  var box=root.querySelector('#tt-intro');
  if(!box||box.closest('.tt-tv'))return;

  var me=document.currentScript;
  var src=(me&&me.src)||'';
  var qs=src.indexOf('?')>=0?src.slice(src.indexOf('?')):'';
  var cssHref=src?src.replace(/intro-tv\.js(\?[^#]*)?(#.*)?$/i,'intro-tv.css$1'):'';
  if(cssHref&&!document.getElementById('tt-intro-tv-css')){
    var link=document.createElement('link');
    link.id='tt-intro-tv-css';
    link.rel='stylesheet';
    link.href=cssHref;
    if(me&&me.parentNode)me.parentNode.insertBefore(link,me);
    else document.head.appendChild(link);
  }

  var style=(window.TT_INTRO_TV_STYLE||'classic');
  if(style!=='chunky')style='classic';

  function el(tag,cls,attrs){
    var n=document.createElement(tag);
    if(cls)n.className=cls;
    if(attrs){
      for(var k in attrs){
        if(k==='html')n.innerHTML=attrs[k];
        else n.setAttribute(k,attrs[k]);
      }
    }
    return n;
  }

  var wrap=el('div','tt-tv',{'data-tt-tv':style});

  var ant=el('div','tt-tv-ant',{'aria-hidden':'true'});
  ant.appendChild(el('span','tt-tv-rod tt-tv-rod-l'));
  ant.appendChild(el('span','tt-tv-rod tt-tv-rod-r'));
  ant.appendChild(el('span','tt-tv-hinge'));
  wrap.appendChild(ant);

  var body=el('div','tt-tv-body');
  var well=el('div','tt-tv-well');
  var glass=el('span','tt-tv-glass',{'aria-hidden':'true'});

  var parent=box.parentNode;
  parent.insertBefore(wrap,box);
  well.appendChild(box);
  well.appendChild(glass);
  body.appendChild(well);

  function knobs(into,withDial,withGrille){
    into.appendChild(el('span','tt-tv-led',{'aria-hidden':'true',title:'on'}));
    into.appendChild(el('span','tt-tv-knob',{'aria-hidden':'true'}));
    into.appendChild(el('span','tt-tv-knob tt-tv-knob-2',{'aria-hidden':'true'}));
    into.appendChild(el('span','tt-tv-badge',{html:'ARTcade'}));
    if(withGrille){
      var g=el('span','tt-tv-grille',{'aria-hidden':'true'});
      for(var i=0;i<7;i++)g.appendChild(el('b'));
      into.appendChild(g);
    }
    if(withDial)into.appendChild(el('span','tt-tv-dial',{'aria-hidden':'true'}));
  }

  var side=el('div','tt-tv-side',{'aria-hidden':'true'});
  var vents=el('span','tt-tv-vents');
  for(var i=0;i<6;i++)vents.appendChild(el('i'));
  side.appendChild(vents);
  knobs(side,false,false);
  body.appendChild(side);

  var chin=el('div','tt-tv-chin',{'aria-hidden':'true'});
  knobs(chin,style==='chunky',style==='chunky');
  body.appendChild(chin);

  wrap.appendChild(body);

  var feet=el('div','tt-tv-feet',{'aria-hidden':'true'});
  feet.appendChild(el('span'));
  feet.appendChild(el('span'));
  wrap.appendChild(feet);
})();
