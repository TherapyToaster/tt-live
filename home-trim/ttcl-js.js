
(function(){
  var root=document.getElementById('ttcl');
  if(!root||root.getAttribute('data-ready'))return;
  root.setAttribute('data-ready','1');
  /* move to <body> so position:fixed is never trapped by a transformed Squarespace wrapper (the glitch shake uses transforms) */
  if(document.body&&root.parentNode!==document.body)document.body.appendChild(root);

  var GMAPS_NEAR='https://www.google.com/maps/search/Chipotle+near+me';
  var WD='Q465751'; /* Wikidata id for Chipotle Mexican Grill */
  var MILES=[1,4,12,35,100,250]; /* Nominatim search box half-widths, widened until something is found */
  var pill=root.querySelector('.ttcl-pill'),card=root.querySelector('.ttcl-card'),xb=root.querySelector('.ttcl-x'),
      go=root.querySelector('.ttcl-go'),out=root.querySelector('.ttcl-out'),busy=false;

  /* ---- open / minimize (desktop >=1200px starts open, smaller screens start as a pill) ---- */
  var KEY='ttcl-min',pref=null;try{pref=localStorage.getItem(KEY);}catch(e){}
  function setOpen(o,save){root.classList.toggle('ttcl-closed',!o);pill.setAttribute('aria-expanded',o?'true':'false');
    if(save){try{localStorage.setItem(KEY,o?'0':'1');}catch(e){}}}
  setOpen(pref===null?window.innerWidth>=1200:pref==='0',false);
  pill.addEventListener('click',function(){setOpen(true,true);go.focus();});
  xb.addEventListener('click',function(){setOpen(false,true);pill.focus();});
  document.addEventListener('keydown',function(e){if((e.key==='Escape'||e.key==='Esc')&&!root.classList.contains('ttcl-closed')&&window.innerWidth<800)setOpen(false,true);});

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function status(h){out.innerHTML='<p class="ttcl-st">'+h+'</p>';}
  function miles(a,b,c,d){var R=3958.8,r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,
      h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));}
  function wait(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function getJSON(url,opt,ms){
    var ctl=window.AbortController?new AbortController():null,t=setTimeout(function(){if(ctl)ctl.abort();},ms||9000);
    opt=opt||{};opt.credentials='omit';opt.mode='cors';if(ctl)opt.signal=ctl.signal;
    return fetch(url,opt).then(function(r){clearTimeout(t);if(!r.ok)throw new Error('HTTP '+r.status);return r.json();},function(e){clearTimeout(t);throw e;});
  }
  function isChip(name,brandWd,cat){return brandWd===WD||(/chipotle/i.test(name||'')&&(!cat||cat==='amenity'));}
  function nearest(list,lat,lon){var best=null;for(var i=0;i<list.length;i++){var p=list[i];if(!isFinite(p.lat)||!isFinite(p.lon))continue;
      p.mi=miles(lat,lon,p.lat,p.lon);if(!best||p.mi<best.mi)best=p;}return best;}

  /* ---- source 1: Nominatim (OSM), bounded box around the visitor, widened step by step (<=1 req/sec per OSM policy) ---- */
  function nominatim(lat,lon){
    var i=0;
    function step(){
      if(i>=MILES.length)return null;
      var m=MILES[i],dLat=m/69,dLon=m/(69*Math.max(0.2,Math.cos(lat*Math.PI/180)));
      var url='https://nominatim.openstreetmap.org/search?format=jsonv2&q=chipotle&limit=40&addressdetails=1&extratags=1&bounded=1&accept-language=en'+
        '&viewbox='+(lon-dLon).toFixed(5)+','+(lat+dLat).toFixed(5)+','+(lon+dLon).toFixed(5)+','+(lat-dLat).toFixed(5);
      return getJSON(url,{},9000).then(function(a){
        var list=[];(a||[]).forEach(function(r){var x=r.extratags||{},ad=r.address||{};
          if(!isChip(r.name,x['brand:wikidata'],r.category))return;
          var st=(ad['ISO3166-2-lvl4']||'').split('-')[1]||ad.state||'';
          list.push({lat:+r.lat,lon:+r.lon,name:r.name||'Chipotle',
            street:[ad.house_number,ad.road].filter(Boolean).join(' '),
            city:ad.city||ad.town||ad.village||ad.hamlet||ad.suburb||ad.county||'',state:st,zip:ad.postcode||''});});
        var b=nearest(list,lat,lon);
        if(b&&(b.mi<=m*1.05||i===MILES.length-1))return b;      /* inside the searched radius: done */
        i++;return wait(1100).then(step);
      });
    }
    return step();
  }
  /* ---- source 2: Photon (komoot, OSM data), location-biased search ---- */
  function photon(lat,lon){
    return getJSON('https://photon.komoot.io/api/?q=chipotle&limit=20&lat='+lat.toFixed(5)+'&lon='+lon.toFixed(5),{},9000).then(function(j){
      var list=[];((j&&j.features)||[]).forEach(function(f){var p=f.properties||{},c=(f.geometry||{}).coordinates||[];
        if(!isChip(p.name,null,p.osm_key))return;
        list.push({lat:+c[1],lon:+c[0],name:p.name||'Chipotle',street:[p.housenumber,p.street].filter(Boolean).join(' '),city:p.city||p.district||'',state:p.state||'',zip:p.postcode||''});});
      return nearest(list,lat,lon);
    });
  }
  /* ---- source 3: Overpass API (brand:wikidata=Q465751 or name Chipotle, 40 km radius). Last resort: the public server is often busy
          (busy replies carry no CORS header, so they just fail fast) and a successful query can take 20-60 s ---- */
  function overpass(lat,lon){
    var a='(around:40000,'+lat.toFixed(5)+','+lon.toFixed(5)+')';
    var q='[out:json][timeout:20];(nwr["brand:wikidata"="'+WD+'"]'+a+';nwr["name"="Chipotle"]'+a+';nwr["name"="Chipotle Mexican Grill"]'+a+';);out center tags 60;';
    return getJSON('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'data='+encodeURIComponent(q)},20000).then(function(j){
      var list=[];((j&&j.elements)||[]).forEach(function(e){var t=e.tags||{},c=e.center||e;
        list.push({lat:+c.lat,lon:+c.lon,name:t.name||'Chipotle',street:[t['addr:housenumber'],t['addr:street']].filter(Boolean).join(' '),city:t['addr:city']||'',state:t['addr:state']||'',zip:t['addr:postcode']||''});});
      return nearest(list,lat,lon);
    });
  }
  function find(lat,lon){
    var srcs=[nominatim,photon,overpass],k=0,errs=0;
    function next(){if(k>=srcs.length)return errs===srcs.length?Promise.reject(new Error('all sources failed')):Promise.resolve(null);
      var f=srcs[k++];if(k>1)status('🌯 Still sniffing… trying backup burrito map '+(k-1)+'…');
      return f(lat,lon).then(function(r){return r||next();},function(){errs++;return next();});}
    return next();
  }
  function fallback(msg){
    status(msg+'<br><a class="ttcl-gm" href="'+GMAPS_NEAR+'" target="_blank" rel="noopener">Search “Chipotle near me” on Google Maps ↗</a>');
  }
  function show(p){
    var city=[p.city,[p.state,p.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    var addr=[p.street,city].filter(Boolean).join(', ');
    var q=addr?('Chipotle Mexican Grill, '+addr):(p.lat.toFixed(6)+','+p.lon.toFixed(6));
    var maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);
    var dir='https://www.google.com/maps/dir/?api=1&destination='+p.lat.toFixed(6)+','+p.lon.toFixed(6);
    var d=p.mi<0.1?'&lt;0.1':(p.mi<10?p.mi.toFixed(1):Math.round(p.mi));
    out.innerHTML='<div class="ttcl-res"><p class="ttcl-nm">'+esc(p.name)+'</p>'+
      '<p class="ttcl-ad">'+(addr?esc(addr):'Address not listed (pin is accurate)')+'</p>'+
      '<p class="ttcl-di"><b>'+d+'</b> mi away'+(p.mi>60?' (road trip!)':'')+'</p>'+
      '<div class="ttcl-ln"><a class="ttcl-btn" href="'+maps+'" target="_blank" rel="noopener">Open in Maps ↗</a><a href="'+dir+'" target="_blank" rel="noopener">Directions</a></div></div>';
  }

  go.addEventListener('click',function(){
    if(busy)return;
    if(!navigator.geolocation||!window.fetch||!window.Promise){fallback('This browser can’t share location.');return;}
    busy=true;go.disabled=true;status('📡 Locating you… <b>(allow location)</b>');
    function done(){busy=false;go.disabled=false;go.textContent='Find again 🌯';}
    navigator.geolocation.getCurrentPosition(function(pos){
      var lat=pos.coords.latitude,lon=pos.coords.longitude,ck='ttcl:'+lat.toFixed(2)+','+lon.toFixed(2),c=null;
      try{c=JSON.parse(sessionStorage.getItem(ck)||'null');}catch(e){}
      if(c&&c.t>Date.now()-18e5&&c.p){c.p.mi=miles(lat,lon,c.p.lat,c.p.lon);show(c.p);done();return;}
      status('🌯 Sniffing out burritos near you…');
      find(lat,lon).then(function(p){
        if(p){show(p);try{sessionStorage.setItem(ck,JSON.stringify({t:Date.now(),p:p}));}catch(e){}}
        else fallback('No Chipotle found nearby in OpenStreetMap. Burrito desert? 🏜️');
        done();
      },function(){fallback('The burrito map is napping right now.');done();});
    },function(err){
      fallback(err&&err.code===1?'No location, no burrito radar 😢 (permission denied).':'Couldn’t get a GPS fix.');
      done();
    },{enableHighAccuracy:false,timeout:15000,maximumAge:300000});
  });
})();
