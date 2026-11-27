#!/usr/bin/env python3
"""Home MAIN trim: move big static inline CSS/JS into tt-live/home-trim/ (GitHub Pages).
usage: trim.py IN OUT ASSET_DIR   (IN = a v550-style fat base). Idempotent: exits 3 if already trimmed."""
import sys,re,hashlib,os
inp,out,adir=sys.argv[1:4]
BASE='https://therapytoaster.github.io/tt-live/home-trim/'
s=open(inp,encoding='utf-8',newline='').read()
if 'home-trim/' in s: sys.exit(3)
os.makedirs(adir,exist_ok=True)
assets={}   # name -> content
def sha8(t): return hashlib.sha256(t.encode('utf-8')).hexdigest()[:8]
def url(name,content): return BASE+name+'?v='+sha8(content)
pre=[]
def find_block(tag,open_re):
    ms=[m for m in re.finditer(r'<%s\b[^>]*>(.*?)</%s>'%(tag,tag),s,re.S) if re.match(open_re,m.group(0))]
    return ms
reps=[]  # (start,end,replacement)
def css_move(m,name,keep_head_until=None,head_id=None):
    full=m.group(0); inner=m.group(1)
    head=''
    if keep_head_until:
        i=inner.index(keep_head_until)
        head_css,inner=inner[:i],inner[i:]
        head=full[:full.index('>')+1].replace('<style','<style',1)+head_css+'</style>\n'
        if head_id: head=re.sub(r'<style\b[^>]*>','<style id="%s">'%head_id,head,1)
    assets[name+'.css']=inner
    u=url(name+'.css',inner)
    pre.append('<link rel="preload" as="style" href="%s">'%u)
    reps.append((m.start(),m.end(),head+'<link id="%s" rel="stylesheet" href="%s">'%(name,u)))
def js_move(m,name):
    inner=m.group(1)
    assets[name+'.js']=inner
    u=url(name+'.js',inner)
    pre.append('<link rel="preload" as="script" href="%s">'%u)
    reps.append((m.start(),m.end(),'<script id="%s" src="%s"></script>'%(name,u)))
def one(tag,open_re,must=None):
    ms=find_block(tag,open_re)
    if must: ms=[m for m in ms if must in m.group(0)]
    assert len(ms)==1,(open_re,must,len(ms))
    return ms[0]
css_move(one('style',r'<style id="tt-hp-css">'),'tt-hp-css')
css_move(one('style',r'<style id="tt-ht-css">'),'tt-ht-css-rest',keep_head_until='/* CRT TV + VCR trailer integration',head_id='tt-ht-css')
css_move(one('style',r'<style id="tt-home-v398-css">'),'tt-v398-css-rest',keep_head_until='/* Animated store card (v8)',head_id='tt-home-v398-css')
css_move(one('style',r'<style>\n#ttcl\{position:fixed'),'ttcl-css')
css_move(one('style',r'<style>\n#ttps\{max-width:640px'),'ttps-css')
js_move(one('script',r'<script id="tt-ht-js">'),'tt-ht-js')
js_move(one('script',r'<script>\n\(function\(\)\{\n  var root=document.getElementById\(\'ttcl\'\)'),'ttcl-js')
# preload hints after the first <style id="ttlive-css">…</style>
e1=s.index('</style>')+len('</style>')
reps.append((e1,e1,'\n'+'\n'.join(pre)))
reps.sort()
o=[];pos=0
for a,b,r in reps:
    o.append(s[pos:a]);o.append(r);pos=b
o.append(s[pos:]); res=''.join(o)
for n,c in assets.items():
    open(os.path.join(adir,n),'w',encoding='utf-8',newline='').write(c)
open(out,'w',encoding='utf-8',newline='').write(res)
print(len(s.encode()),'->',len(res.encode()),{n:len(c.encode()) for n,c in assets.items()})
