#!/usr/bin/env python3
"""Idempotent Home patch: keep the live $SPCX and $TSLA tickers, add $SOL and
$ETH price tickers under them, remove the pump.fun Toasty card, and remove
the Facebook video embed.

Usage: python3 apply.py IN OUT   (IN may equal OUT). Safe to re-run.

Anchors after <!-- TT NOTICE END --> (falls back to immediately before the
Area54.fm card). Future hourly rebuilds should keep running this script so
Pump.fun and the Facebook video are not re-introduced and the TSLA, SPCX,
SOL, and ETH tickers stay.
"""
import sys, re

NOTICE = '<!-- TT NOTICE END -->'
AREA54 = '<div style="text-align:center;max-width:520px;margin:0 auto 50px;background:#111;border:2px solid #FFD400;border-radius:14px;padding:22px"><h2 style="color:#FFD400;margin:0 0 6px">🎧 Area54.fm Live</h2>'

BLOCK = r"""<!-- TT TICKERS START --><style>
#tt-tickers{margin:18px auto 28px;padding:0 12px;text-align:center}
#tttsla{display:block;width:100%;max-width:500px;margin:0 auto 16px;border:3px solid #FFD400;border-radius:14px;background:#000;box-shadow:4px 4px 0 #ff2a2a,-4px -4px 0 #00e5ff;overflow:hidden;text-decoration:none}
#tttsla .tth{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;font:700 16px/1.2 system-ui,sans-serif;letter-spacing:.04em;white-space:nowrap;gap:10px;color:#000;background:#FFD400}
#tttsla .tts{font-weight:700;font-size:13px}
#tttsla .tts i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;background:#ff2a2a;vertical-align:middle}
#tttsla.open .tts i{background:#00c853}
#tttsla .ttw{height:108px;pointer-events:none}
#tttsla .ttw iframe{height:108px!important}
#ttspcx{display:block;width:100%;max-width:500px;margin:0 auto 16px;border:3px solid #FFD400;border-radius:14px;background:#000;box-shadow:4px 4px 0 #ff2a2a,-4px -4px 0 #00e5ff;overflow:hidden;text-decoration:none}
#ttspcx .tth{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;font:700 16px/1.2 system-ui,sans-serif;letter-spacing:.04em;white-space:nowrap;gap:10px;color:#000;background:#FFD400}
#ttspcx .tts{font-weight:700;font-size:13px}
#ttspcx .tts i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;background:#ff2a2a;vertical-align:middle}
#ttspcx.open .tts i{background:#00c853}
#ttspcx .ttw{height:108px;pointer-events:none}
#ttspcx .ttw iframe{height:108px!important}
#ttsol,#tteth{display:block;width:100%;max-width:500px;margin:0 auto 16px;border:3px solid #FFD400;border-radius:14px;background:#000;box-shadow:4px 4px 0 #ff2a2a,-4px -4px 0 #00e5ff;overflow:hidden;text-decoration:none;color:#fff}
#tteth{margin-bottom:0}
#ttsol .tth,#tteth .tth{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;font:700 16px/1.2 system-ui,sans-serif;letter-spacing:.04em;white-space:nowrap;gap:10px;color:#000;background:#FFD400}
#ttsol .tts,#tteth .tts{font-weight:700;font-size:13px}
#ttsol .tts i,#tteth .tts i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;background:#ff2a2a;vertical-align:middle}
#ttsol.open .tts i,#tteth.open .tts i{background:#00c853}
#ttsol .ttw,#tteth .ttw{height:108px;display:grid;grid-template-columns:40px minmax(0,.9fr) minmax(64px,1.3fr) auto;align-items:center;gap:10px;padding:12px 14px;box-sizing:border-box}
#ttsol .ttic,#tteth .ttic{width:36px;height:36px;border-radius:50%;background:#111;border:2px solid #FFD400;display:flex;align-items:center;justify-content:center;flex:none}
#ttsol .ttic svg,#tteth .ttic svg{width:22px;height:22px;display:block}
#ttsol .ttmeta,#tteth .ttmeta{min-width:0}
#ttsol .ttsym,#tteth .ttsym{display:block;font:700 15px/1.15 system-ui,sans-serif;color:#fff;letter-spacing:.04em}
#ttsol .ttname,#tteth .ttname{display:block;font:400 11px/1.2 system-ui,sans-serif;color:#9aa0a6;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ttsol .ttspark,#tteth .ttspark{width:100%;height:52px;display:block}
#ttsol .ttq,#tteth .ttq{text-align:right;white-space:nowrap}
#ttsol .ttprice,#tteth .ttprice{font:700 28px/1 system-ui,sans-serif;color:#fff;letter-spacing:.01em}
#ttsol .ttusd,#tteth .ttusd{font:600 11px/1 system-ui,sans-serif;color:#9aa0a6;margin-left:4px;vertical-align:super}
#ttsol .ttchg,#tteth .ttchg{display:block;font:700 13px/1.2 system-ui,sans-serif;color:#9aa0a6;margin-top:6px}
#ttsol .ttchg.up,#tteth .ttchg.up{color:#00c853}
#ttsol .ttchg.down,#tteth .ttchg.down{color:#ff2a2a}
@media (max-width:520px){
#ttsol .ttw,#tteth .ttw{grid-template-columns:32px minmax(0,1fr) auto;gap:8px;padding:10px 12px}
#ttsol .ttic,#tteth .ttic{width:32px;height:32px}
#ttsol .ttspark,#tteth .ttspark{display:none}
#ttsol .ttprice,#tteth .ttprice{font-size:22px}
}
</style>
<div id="tt-tickers">
<!-- TT TSLA START --><a id="tttsla" href="https://www.tradingview.com/symbols/NASDAQ-TSLA/" target="_blank" rel="noopener" title="Tesla (NASDAQ: TSLA) live price"><span class="tth"><span>$TSLA · Tesla</span><span class="tts"><i></i><b class="ttl">NASDAQ</b></span></span><span class="ttw tradingview-widget-container" style="display:block"><span class="tradingview-widget-container__widget" style="display:block"></span></span></a><script>(function(){var a=document.getElementById('tttsla');if(!a)return;function st(){var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=x.value});var m=(+o.hour)*60+(+o.minute),wd=!/Sat|Sun/.test(o.weekday),open=wd&&m>=570&&m<960;a.classList.toggle('open',open);a.querySelector('.ttl').textContent=open?'LIVE · NASDAQ':'CLOSED · LAST CLOSE'}st();if(!a.dataset.ttTimer){a.dataset.ttTimer=1;setInterval(st,60000)}var w=a.querySelector('.ttw');if(w.querySelector('iframe,script'))return;var s=document.createElement('script');s.src='https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';s.async=true;s.textContent=JSON.stringify({symbol:'NASDAQ:TSLA',width:'100%',isTransparent:true,colorTheme:'dark',locale:'en'});w.appendChild(s)})();</script><!-- TT TSLA END -->
<!-- TT SPCX START --><a id="ttspcx" href="https://www.tradingview.com/symbols/NASDAQ-SPCX/" target="_blank" rel="noopener" title="SpaceX (NASDAQ: SPCX) live price"><span class="tth"><span>$SPCX · SpaceX</span><span class="tts"><i></i><b class="ttl">NASDAQ</b></span></span><span class="ttw tradingview-widget-container" style="display:block"><span class="tradingview-widget-container__widget" style="display:block"></span></span></a><script>(function(){var a=document.getElementById('ttspcx');if(!a)return;function st(){var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=x.value});var m=(+o.hour)*60+(+o.minute),wd=!/Sat|Sun/.test(o.weekday),open=wd&&m>=570&&m<960;a.classList.toggle('open',open);a.querySelector('.ttl').textContent=open?'LIVE · NASDAQ':'CLOSED · LAST CLOSE'}st();if(!a.dataset.ttTimer){a.dataset.ttTimer=1;setInterval(st,60000)}var w=a.querySelector('.ttw');if(w.querySelector('iframe,script'))return;var s=document.createElement('script');s.src='https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';s.async=true;s.textContent=JSON.stringify({symbol:'NASDAQ:SPCX',width:'100%',isTransparent:true,colorTheme:'dark',locale:'en'});w.appendChild(s)})();</script><!-- TT SPCX END -->
<!-- TT SOL START --><a id="ttsol" href="https://www.tradingview.com/symbols/SOLUSD/" target="_blank" rel="noopener" title="Solana (SOL) live price"><span class="tth"><span>$SOL · Solana</span><span class="tts"><i></i><b class="ttl">LIVE · CRYPTO</b></span></span><span class="ttw"><span class="ttic" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="#FFD400" d="M5 16.7h12.8l-3.2 3.2H1.8L5 16.7zm.2-6.3h14.2l-3.2 3.2H2L5.2 10.4zM8.6 4.1H22l-3.2 3.2H5.4L8.6 4.1z"/></svg></span><span class="ttmeta"><span class="ttsym">SOL</span><span class="ttname">Solana</span></span><canvas class="ttspark" width="160" height="52" aria-hidden="true"></canvas><span class="ttq"><span class="ttprice">—</span><span class="ttusd">USD</span><span class="ttchg">—</span></span></span></a><!-- TT SOL END -->
<!-- TT ETH START --><a id="tteth" href="https://www.tradingview.com/symbols/ETHUSD/" target="_blank" rel="noopener" title="Ethereum (ETH) live price"><span class="tth"><span>$ETH · Ethereum</span><span class="tts"><i></i><b class="ttl">LIVE · CRYPTO</b></span></span><span class="ttw"><span class="ttic" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="#FFD400" d="M12 1.8 5.2 12.2 12 16.3l6.8-4.1L12 1.8zm0 20.4 6.8-9.7L12 16.6 5.2 12.5 12 22.2z"/></svg></span><span class="ttmeta"><span class="ttsym">ETH</span><span class="ttname">Ethereum</span></span><canvas class="ttspark" width="160" height="52" aria-hidden="true"></canvas><span class="ttq"><span class="ttprice">—</span><span class="ttusd">USD</span><span class="ttchg">—</span></span></span></a><!-- TT ETH END -->
<!-- TT CRYPTO JS START --><script>(function(){if(window.__ttCryptoTickers)return;window.__ttCryptoTickers=1;var coins=[{id:'ttsol',cg:'solana',cb:'SOL-USD'},{id:'tteth',cg:'ethereum',cb:'ETH-USD'}];function el(id){return document.getElementById(id)}function money(n){return n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}function get(url){return fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(String(r.status));return r.json()})}function paint(c,price,chgPct){var a=el(c.id);if(!a)return;a.classList.add('open');var ttl=a.querySelector('.ttl');if(ttl)ttl.textContent='LIVE · CRYPTO';var pr=a.querySelector('.ttprice');if(pr)pr.textContent=money(price);var ch=a.querySelector('.ttchg');if(ch){if(chgPct==null||isNaN(chgPct)){ch.textContent='—';ch.className='ttchg';return}var abs=price*chgPct/100,absTxt=money(Math.abs(abs));if(abs<0)absTxt='-'+absTxt;ch.textContent=absTxt+' '+(chgPct>0?'+':'')+chgPct.toFixed(2)+'%';ch.className='ttchg'+(chgPct>0?' up':chgPct<0?' down':'')}}function markFail(){coins.forEach(function(c){var a=el(c.id);if(!a||a.dataset.ttOk)return;var ttl=a.querySelector('.ttl');if(ttl)ttl.textContent='UNAVAILABLE'})}function loadPrices(){get('https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum&vs_currencies=usd&include_24hr_change=true').then(function(d){coins.forEach(function(c){var x=d[c.cg];if(!x||x.usd==null)throw new Error('missing');paint(c,+x.usd,+x.usd_24h_change||0);el(c.id).dataset.ttOk='1'})}).catch(function(){return Promise.all(coins.map(function(c){return get('https://api.exchange.coinbase.com/products/'+c.cb+'/stats').then(function(s){var last=+s.last,open=+s.open;if(!isFinite(last))throw new Error('stats');var pct=(isFinite(open)&&open)?((last-open)/open)*100:NaN;paint(c,last,isFinite(pct)?pct:null);el(c.id).dataset.ttOk='1'}).catch(function(){return get('https://api.coinbase.com/v2/prices/'+c.cb+'/spot').then(function(s){var last=+s.data.amount;if(!isFinite(last))throw new Error('spot');paint(c,last,null);el(c.id).dataset.ttOk='1'})})})).catch(markFail)})}function drawSpark(canvas,pts,up){if(!canvas||!pts||pts.length<2)return;var dpr=Math.min(window.devicePixelRatio||1,2),w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);var ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);var min=Math.min.apply(null,pts),max=Math.max.apply(null,pts),span=max-min||1;ctx.beginPath();for(var i=0;i<pts.length;i++){var x=i/(pts.length-1)*w,y=h-4-((pts[i]-min)/span)*(h-8);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=up?'#00c853':'#ff2a2a';ctx.lineWidth=1.75;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke()}function loadCharts(){coins.forEach(function(c){var a=el(c.id);if(!a)return;var canvas=a.querySelector('canvas.ttspark');get('https://api.coingecko.com/api/v3/coins/'+c.cg+'/market_chart?vs_currency=usd&days=1').then(function(d){var pts=(d.prices||[]).map(function(p){return p[1]});drawSpark(canvas,pts,pts[pts.length-1]>=pts[0])}).catch(function(){var end=new Date(),start=new Date(end.getTime()-86400000);return get('https://api.exchange.coinbase.com/products/'+c.cb+'/candles?granularity=3600&start='+start.toISOString()+'&end='+end.toISOString()).then(function(rows){rows=rows.slice().sort(function(a,b){return a[0]-b[0]});var pts=rows.map(function(r){return r[4]});drawSpark(canvas,pts,pts[pts.length-1]>=pts[0])}).catch(function(){})})})}coins.forEach(function(c){var a=el(c.id);if(a)a.classList.add('open')});loadPrices();setTimeout(loadCharts,400);setInterval(function(){loadPrices();loadCharts()},60000)})();</script><!-- TT CRYPTO JS END -->
</div><!-- TT TICKERS END -->"""

def strip_existing_tickers(t):
    t = re.sub(r'<!-- TT TICKERS START -->.*?<!-- TT TICKERS END -->', '', t, flags=re.S)
    t = re.sub(r'<!-- TT TSLA START -->.*?<!-- TT TSLA END -->', '', t, flags=re.S)
    t = re.sub(r'<!-- TT SPCX START -->.*?<!-- TT SPCX END -->', '', t, flags=re.S)
    t = re.sub(r'<!-- TT SOL START -->.*?<!-- TT SOL END -->', '', t, flags=re.S)
    t = re.sub(r'<!-- TT ETH START -->.*?<!-- TT ETH END -->', '', t, flags=re.S)
    t = re.sub(r'<!-- TT CRYPTO JS START -->.*?<!-- TT CRYPTO JS END -->', '', t, flags=re.S)
    return t


def strip_pump_card(t):
    # Style + wrapper that held the pump.fun Toasty card (and formerly the SPCX pill).
    t = re.sub(
        r'<style>\.tt-toasty\{.*?</style>\s*',
        '',
        t,
        count=1,
        flags=re.S,
    )
    t = re.sub(
        r'<div class="tt-toasty">.*?</div>\s*',
        '',
        t,
        count=1,
        flags=re.S,
    )
    return t


def strip_facebook_video(t):
    t = re.sub(
        r'<div style="text-align:center;margin-bottom:24px"><iframe src="https://www\.facebook\.com/plugins/video\.php\?[^"]*3026442134383250[^"]*"[^>]*></iframe></div>',
        '',
        t,
        count=1,
    )
    t = re.sub(
        r'<div style="text-align:center;margin-bottom:24px"><iframe src="https://www\.facebook\.com/plugins/video\.php\?[^"]+"[^>]*></iframe></div>',
        '',
        t,
        count=1,
    )
    return t


def apply(t):
    t = strip_existing_tickers(t)
    t = strip_pump_card(t)
    t = strip_facebook_video(t)
    # Collapse leftover blank runs at the insertion point without touching other spacing.
    t = t.replace(NOTICE + '\n', NOTICE)
    if NOTICE in t:
        return t.replace(NOTICE, NOTICE + BLOCK, 1)
    if AREA54 in t:
        return t.replace(AREA54, BLOCK + AREA54, 1)
    raise SystemExit('anchor not found; not patched')


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    t = open(src, encoding='utf-8').read()
    out = apply(t)
    open(dst, 'w', encoding='utf-8').write(out)
    print('patched', dst)
