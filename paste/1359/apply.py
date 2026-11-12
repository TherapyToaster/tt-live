#!/usr/bin/env python3
"""Idempotent Home patch: custom $TSLA, $SPCX, $SOL, and $ETH tickers
(logo, sparkline, price, 24h change), remove the pump.fun Toasty card,
and remove the Facebook video embed.

Stock quotes and intraday charts come from CNBC's keyless, CORS-friendly
quote and bars APIs. Crypto stays on CoinGecko, then Coinbase.

Usage: python3 apply.py IN OUT   (IN may equal OUT). Safe to re-run.

Anchors after <!-- TT NOTICE END --> (falls back to immediately before the
Area54.fm card). Future hourly rebuilds should keep running this script so
Pump.fun and the Facebook video are not re-introduced and the four tickers
stay. At paste time, run this on whatever Home code is then current.
"""
import sys, re

NOTICE = '<!-- TT NOTICE END -->'
AREA54 = '<div style="text-align:center;max-width:520px;margin:0 auto 50px;background:#111;border:2px solid #FFD400;border-radius:14px;padding:22px"><h2 style="color:#FFD400;margin:0 0 6px">🎧 Area54.fm Live</h2>'

BLOCK = r"""<!-- TT TICKERS START --><style>
#tt-tickers{margin:18px auto 28px;padding:0 12px;text-align:center}
#tt-tickers>a{display:block;width:100%;max-width:500px;margin:0 auto 16px;border:3px solid #FFD400;border-radius:14px;background:#000;box-shadow:4px 4px 0 #ff2a2a,-4px -4px 0 #00e5ff;overflow:hidden;text-decoration:none;color:#fff}
#tt-tickers>a:last-of-type{margin-bottom:0}
#tt-tickers .tth{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;font:700 16px/1.2 system-ui,sans-serif;letter-spacing:.04em;white-space:nowrap;gap:10px;color:#000;background:#FFD400}
#tt-tickers .tts{font-weight:700;font-size:13px}
#tt-tickers .tts i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;background:#ff2a2a;vertical-align:middle}
#tt-tickers a.open .tts i{background:#00c853}
#tt-tickers .ttw{height:108px;display:grid;grid-template-columns:40px minmax(0,.9fr) minmax(64px,1.3fr) auto;align-items:center;gap:10px;padding:12px 14px;box-sizing:border-box}
#tt-tickers .ttic{width:36px;height:36px;border-radius:50%;background:#111;border:2px solid #FFD400;display:flex;align-items:center;justify-content:center;flex:none}
#tt-tickers .ttic svg{width:22px;height:22px;display:block}
#tt-tickers .ttmeta{min-width:0}
#tt-tickers .ttsym{display:block;font:700 15px/1.15 system-ui,sans-serif;color:#fff;letter-spacing:.04em}
#tt-tickers .ttname{display:block;font:400 11px/1.2 system-ui,sans-serif;color:#9aa0a6;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tt-tickers .ttspark{width:100%;height:52px;display:block}
#tt-tickers .ttq{text-align:right;white-space:nowrap}
#tt-tickers .ttprice{font:700 28px/1 system-ui,sans-serif;color:#fff;letter-spacing:.01em}
#tt-tickers .ttusd{font:600 11px/1 system-ui,sans-serif;color:#9aa0a6;margin-left:4px;vertical-align:super}
#tt-tickers .ttchg{display:block;font:700 13px/1.2 system-ui,sans-serif;color:#9aa0a6;margin-top:6px}
#tt-tickers .ttchg.up{color:#00c853}
#tt-tickers .ttchg.down{color:#ff2a2a}
@media (max-width:520px){
#tt-tickers .ttw{grid-template-columns:32px minmax(0,1fr) auto;gap:8px;padding:10px 12px}
#tt-tickers .ttic{width:32px;height:32px}
#tt-tickers .ttspark{display:none}
#tt-tickers .ttprice{font-size:22px}
}
</style>
<div id="tt-tickers">
<!-- TT TSLA START --><a id="tttsla" href="https://www.tradingview.com/symbols/NASDAQ-TSLA/" target="_blank" rel="noopener" title="Tesla (NASDAQ: TSLA) live price"><span class="tth"><span>$TSLA · Tesla</span><span class="tts"><i></i><b class="ttl">NASDAQ</b></span></span><span class="ttw"><span class="ttic" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="#FFD400" d="M3 4.2h18v3.3h-7.3v12.3H10.3V7.5H3z"/></svg></span><span class="ttmeta"><span class="ttsym">TSLA</span><span class="ttname">Tesla</span></span><canvas class="ttspark" width="160" height="52" aria-hidden="true"></canvas><span class="ttq"><span class="ttprice">—</span><span class="ttusd">USD</span><span class="ttchg">—</span></span></span></a><!-- TT TSLA END -->
<!-- TT SPCX START --><a id="ttspcx" href="https://www.tradingview.com/symbols/NASDAQ-SPCX/" target="_blank" rel="noopener" title="SpaceX (NASDAQ: SPCX) live price"><span class="tth"><span>$SPCX · SpaceX</span><span class="tts"><i></i><b class="ttl">NASDAQ</b></span></span><span class="ttw"><span class="ttic" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="#FFD400" d="M12 2.3 14.4 9h7.1l-5.7 4.2 2.2 6.8L12 15.9 6 20l2.2-6.8L2.5 9h7.1L12 2.3z"/></svg></span><span class="ttmeta"><span class="ttsym">SPCX</span><span class="ttname">SpaceX</span></span><canvas class="ttspark" width="160" height="52" aria-hidden="true"></canvas><span class="ttq"><span class="ttprice">—</span><span class="ttusd">USD</span><span class="ttchg">—</span></span></span></a><!-- TT SPCX END -->
<!-- TT SOL START --><a id="ttsol" href="https://www.tradingview.com/symbols/SOLUSD/" target="_blank" rel="noopener" title="Solana (SOL) live price"><span class="tth"><span>$SOL · Solana</span><span class="tts"><i></i><b class="ttl">LIVE · CRYPTO</b></span></span><span class="ttw"><span class="ttic" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="#FFD400" d="M5 16.7h12.8l-3.2 3.2H1.8L5 16.7zm.2-6.3h14.2l-3.2 3.2H2L5.2 10.4zM8.6 4.1H22l-3.2 3.2H5.4L8.6 4.1z"/></svg></span><span class="ttmeta"><span class="ttsym">SOL</span><span class="ttname">Solana</span></span><canvas class="ttspark" width="160" height="52" aria-hidden="true"></canvas><span class="ttq"><span class="ttprice">—</span><span class="ttusd">USD</span><span class="ttchg">—</span></span></span></a><!-- TT SOL END -->
<!-- TT ETH START --><a id="tteth" href="https://www.tradingview.com/symbols/ETHUSD/" target="_blank" rel="noopener" title="Ethereum (ETH) live price"><span class="tth"><span>$ETH · Ethereum</span><span class="tts"><i></i><b class="ttl">LIVE · CRYPTO</b></span></span><span class="ttw"><span class="ttic" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="#FFD400" d="M12 1.8 5.2 12.2 12 16.3l6.8-4.1L12 1.8zm0 20.4 6.8-9.7L12 16.6 5.2 12.5 12 22.2z"/></svg></span><span class="ttmeta"><span class="ttsym">ETH</span><span class="ttname">Ethereum</span></span><canvas class="ttspark" width="160" height="52" aria-hidden="true"></canvas><span class="ttq"><span class="ttprice">—</span><span class="ttusd">USD</span><span class="ttchg">—</span></span></span></a><!-- TT ETH END -->
<!-- TT CRYPTO JS START --><script>(function(){if(window.__ttTickers)return;window.__ttTickers=1;
var stocks=[{id:'tttsla',symbol:'TSLA'},{id:'ttspcx',symbol:'SPCX'}];
var cryptos=[{id:'ttsol',cg:'solana',cb:'SOL-USD'},{id:'tteth',cg:'ethereum',cb:'ETH-USD'}];
function el(id){return document.getElementById(id)}
function money(n){return n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function num(v){if(v==null||v==='')return NaN;return parseFloat(String(v).replace(/[,$+%]/g,''))}
function get(url){return fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(String(r.status));return r.json()})}
function nyParts(d){var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'numeric',minute:'numeric',second:'numeric',hourCycle:'h23'}).formatToParts(d||new Date()),o={};p.forEach(function(x){o[x.type]=x.value});return o}
function isOpenClock(d){var o=nyParts(d),m=(+o.hour)*60+(+o.minute);return !/Sat|Sun/.test(o.weekday)&&m>=570&&m<960}
function nyStamp(d,h,mi,s){var o=nyParts(d);function z(n){n=String(n);return n.length<2?'0'+n:n}return o.year+o.month+o.day+z(h)+z(mi)+z(s)}
function prevWeekday(d){var x=new Date(d.getTime());do{x=new Date(x.getTime()-86400000)}while(/Sat|Sun/.test(nyParts(x).weekday));return x}
function paint(a,price,chgPct,chgAbs){if(!a)return;var pr=a.querySelector('.ttprice');if(pr)pr.textContent=money(price);var ch=a.querySelector('.ttchg');if(ch){if(chgPct==null||isNaN(chgPct)){ch.textContent='—';ch.className='ttchg';return}var abs=(chgAbs!=null&&!isNaN(chgAbs))?chgAbs:(price*chgPct/100),absTxt=money(Math.abs(abs));if(abs<0)absTxt='-'+absTxt;ch.textContent=absTxt+' '+(chgPct>0?'+':'')+chgPct.toFixed(2)+'%';ch.className='ttchg'+(chgPct>0?' up':chgPct<0?' down':'')}}
function markFail(ids,label){ids.forEach(function(id){var a=el(id);if(!a||a.dataset.ttOk)return;var ttl=a.querySelector('.ttl');if(ttl)ttl.textContent=label||'UNAVAILABLE'})}
function setStockOpen(a,open){if(!a)return;a.classList.toggle('open',!!open);var ttl=a.querySelector('.ttl');if(ttl)ttl.textContent=open?'LIVE · NASDAQ':'MARKET CLOSED'}
function drawSpark(canvas,pts,up){if(!canvas||!pts||pts.length<2)return;if(getComputedStyle(canvas).display==='none')return;var dpr=Math.min(window.devicePixelRatio||1,2),w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);var ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);var min=Math.min.apply(null,pts),max=Math.max.apply(null,pts),span=max-min||1;ctx.beginPath();for(var i=0;i<pts.length;i++){var x=i/(pts.length-1)*w,y=h-4-((pts[i]-min)/span)*(h-8);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=up?'#00c853':'#ff2a2a';ctx.lineWidth=1.75;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke()}
function loadStocks(){var clockOpen=isOpenClock(new Date());stocks.forEach(function(s){setStockOpen(el(s.id),clockOpen)});get('https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=TSLA%7CSPCX&requestMethod=itv&noform=1&partnerId=2&fields=symbol,last,change,change_pct,previous_day_closing,curmktstatus').then(function(d){var raw=d&&d.FormattedQuoteResult&&d.FormattedQuoteResult.FormattedQuote;var list=Array.isArray(raw)?raw:(raw?[raw]:[]);var by={};list.forEach(function(q){if(q&&q.symbol)by[q.symbol]=q});stocks.forEach(function(s){var q=by[s.symbol],a=el(s.id);if(!a)return;if(!q)throw new Error('missing '+s.symbol);var last=num(q.last);if(!isFinite(last))throw new Error('last');var chg=num(q.change),pct=num(q.change_pct);if(!isFinite(pct)&&isFinite(num(q.previous_day_closing))){var prev=num(q.previous_day_closing);chg=last-prev;pct=prev?((last-prev)/prev)*100:NaN}var open=q.curmktstatus?q.curmktstatus==='REG_MKT':clockOpen;setStockOpen(a,open);paint(a,last,pct,chg);a.dataset.ttOk='1'})}).catch(function(){markFail(['tttsla','ttspcx'],isOpenClock(new Date())?'LIVE · NASDAQ':'MARKET CLOSED')})}
function barsUrl(sym,start,end){return 'https://ts-api.cnbc.com/harmony/app/bars/'+sym+'/5M/'+start+'/'+end+'/adjusted/EST5EDT.json'}
function loadStockCharts(){var now=new Date(),startDay=now,start=nyStamp(startDay,4,0,0),end=nyStamp(now,20,0,0);stocks.forEach(function(s){var a=el(s.id);if(!a)return;var canvas=a.querySelector('canvas.ttspark');get(barsUrl(s.symbol,start,end)).then(function(d){var bars=((d.barData||{}).priceBars)||[];if(bars.length<8){var prev=prevWeekday(now);return get(barsUrl(s.symbol,nyStamp(prev,4,0,0),nyStamp(prev,20,0,0))).then(function(d2){return ((d2.barData||{}).priceBars)||bars})}return bars}).then(function(bars){var pts=bars.map(function(b){return num(b.close)}).filter(isFinite);if(pts.length<2)return;drawSpark(canvas,pts,pts[pts.length-1]>=pts[0])}).catch(function(){})})}
function loadCryptos(){cryptos.forEach(function(c){var a=el(c.id);if(a)a.classList.add('open')});get('https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum&vs_currencies=usd&include_24hr_change=true').then(function(d){cryptos.forEach(function(c){var x=d[c.cg],a=el(c.id);if(!a)return;if(!x||x.usd==null)throw new Error('missing');paint(a,+x.usd,+x.usd_24h_change||0);var ttl=a.querySelector('.ttl');if(ttl)ttl.textContent='LIVE · CRYPTO';a.dataset.ttOk='1'})}).catch(function(){return Promise.all(cryptos.map(function(c){return get('https://api.exchange.coinbase.com/products/'+c.cb+'/stats').then(function(s){var last=+s.last,open=+s.open;if(!isFinite(last))throw new Error('stats');var pct=(isFinite(open)&&open)?((last-open)/open)*100:NaN;var a=el(c.id);paint(a,last,isFinite(pct)?pct:null);var ttl=a.querySelector('.ttl');if(ttl)ttl.textContent='LIVE · CRYPTO';if(a)a.dataset.ttOk='1'}).catch(function(){return get('https://api.coinbase.com/v2/prices/'+c.cb+'/spot').then(function(s){var last=+s.data.amount;if(!isFinite(last))throw new Error('spot');var a=el(c.id);paint(a,last,null);var ttl=a.querySelector('.ttl');if(ttl)ttl.textContent='LIVE · CRYPTO';if(a)a.dataset.ttOk='1'})})})).catch(function(){markFail(['ttsol','tteth'],'UNAVAILABLE')})})}
function loadCryptoCharts(){cryptos.forEach(function(c){var a=el(c.id);if(!a)return;var canvas=a.querySelector('canvas.ttspark');get('https://api.coingecko.com/api/v3/coins/'+c.cg+'/market_chart?vs_currency=usd&days=1').then(function(d){var pts=(d.prices||[]).map(function(p){return p[1]});drawSpark(canvas,pts,pts[pts.length-1]>=pts[0])}).catch(function(){var end=new Date(),start=new Date(end.getTime()-86400000);return get('https://api.exchange.coinbase.com/products/'+c.cb+'/candles?granularity=3600&start='+start.toISOString()+'&end='+end.toISOString()).then(function(rows){rows=rows.slice().sort(function(a,b){return a[0]-b[0]});var pts=rows.map(function(r){return r[4]});drawSpark(canvas,pts,pts[pts.length-1]>=pts[0])}).catch(function(){})})})}
function tick(){loadStocks();loadCryptos();loadStockCharts();loadCryptoCharts()}
tick();setInterval(tick,60000);
})();</script><!-- TT CRYPTO JS END -->
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
