#!/usr/bin/env python3
"""Idempotently add (or refresh) the Home hero-fx loader block in a Home MAIN code block file.
usage: apply.py IN OUT   (IN may equal OUT)
Adds <!-- tt-hero-fx START/END --> (inline critical CSS for the neon flicker-on + a tiny loader for
https://therapytoaster.github.io/tt-live/hero-fx/hero-fx.js?v=<hash>) right before the tt-neon-lock block.
Keeps tt-neon-lock untouched (it becomes a no-op once hero-fx.js shadows the wall's translate/scale).
Exit 2 and writes nothing if the anchor is missing or markers are not exactly 0/1 pair."""
import sys, re, hashlib, os
here = os.path.dirname(os.path.abspath(__file__))
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
v = hashlib.sha1(open(os.path.join(here, 'hero-fx.js'), 'rb').read()).hexdigest()[:8]
BLOCK = ('<!-- tt-hero-fx START -->\n'
 '<style id="tt-hero-fx-css">html:not(.tthf-done) #tt-neon{animation:tthfOn 2.4s linear .6s 1 backwards}'
 '@keyframes tthfOn{0%,18%,34%,52%{opacity:0}8%,43%,70%,78%{opacity:.9}10%,39%{opacity:.1}16%,60%{opacity:.6}36%,90%,100%{opacity:1}46%,63%{opacity:.25}74%{opacity:.5}86%{opacity:.8}}'
 'html:not(.tthf-done) #tt-topwall:has(#tt-neon) .tw-img{animation:tthfW 2.4s linear .6s 1 backwards}@keyframes tthfW{0%,18%,34%,52%{filter:brightness(.3) saturate(.5)}8%,43%,70%,78%{filter:brightness(.92) saturate(.95)}10%,39%{filter:brightness(.42) saturate(.6)}16%,60%{filter:brightness(.8) saturate(.85)}36%,90%,100%{filter:brightness(1) saturate(1)}46%,63%{filter:brightness(.5) saturate(.65)}74%{filter:brightness(.75) saturate(.8)}86%{filter:brightness(.95) saturate(.97)}}@media (prefers-reduced-motion:reduce){html #tt-neon,html #tt-topwall .tw-img{animation:none!important}}</style>\n'
 '<script id="tt-hero-fx">(function(){var p=location.pathname.replace(/\\/+$/,"");if(p!==""&&p!=="/home")return;'
 'document.addEventListener("animationend",function(e){if(e.animationName==="tthfOn")document.documentElement.classList.add("tthf-done")},true);'
 'var s=document.createElement("script");s.async=true;s.src="https://therapytoaster.github.io/tt-live/hero-fx/hero-fx.js?v=' + v + '";'
 '(document.head||document.documentElement).appendChild(s)})();</script>\n'
 '<!-- tt-hero-fx END -->\n')
# Size-neutral: shorten three long explanatory comments (no code touched) so MAIN does not grow past the ~263 KB save cap.
TRIMS=[(r'<!-- TT HOME v408 START:.*?-->','<!-- TT HOME v408 START: merch-to-art gap close. -->'),
       (r'<!-- TT HOME v398 START:.*?-->','<!-- TT HOME v398 START: desktop gap close + animated store card. -->'),
       (r'/\* Desktop mouse parallax \(home-extras\).*?\*/','/* hero-fx.js shadows the wall translate/scale, so this is a no-op; kept as fallback if that file fails to load. */')]
for pat,rep in TRIMS:
    s=re.sub(pat,lambda m:rep,s,count=1,flags=re.S)
a, b = s.count('<!-- tt-hero-fx START -->'), s.count('<!-- tt-hero-fx END -->')
if (a, b) not in ((0, 0), (1, 1)):
    sys.exit('bad markers %d/%d' % (a, b))
if a == 1:
    i = s.index('<!-- tt-hero-fx START -->'); j = s.index('<!-- tt-hero-fx END -->\n') + len('<!-- tt-hero-fx END -->\n')
    out = s[:i] + BLOCK + s[j:]
else:
    anchor = '<!-- tt-neon-lock START -->'
    if s.count(anchor) != 1:
        anchor = '<!-- tt-home-extras END -->'
        if s.count(anchor) != 1: sys.exit('anchor missing')
    out = s.replace(anchor, BLOCK + anchor, 1)
open(dst, 'w', encoding='utf-8').write(out)
print('ok', len(out.encode()), 'bytes (was %d) v=%s' % (len(s.encode()), v))
