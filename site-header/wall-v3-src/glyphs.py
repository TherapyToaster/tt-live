import json, glob
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
G='/usr/share/fonts/truetype/sand-box/google/'
FONTS={'titan':'Titan One','sigmar':'Sigmar One','knewave':'Knewave','bungee':'Bungee','chango':'Chango','marker':'Permanent Marker','sedgwick':'Sedgwick Ave'}
out={}
for k,n in FONTS.items():
    f=TTFont(glob.glob(G+n+'/*.ttf')[0]); gs=f.getGlyphSet(); cmap=f.getBestCmap()
    d={'upm':f['head'].unitsPerEm,'g':{}}
    for ch in set('THERAPYOSMRYXAWKULZCTDN.!'+'hellomynameisTOASTYXAWskullzcoty'):
        gn=cmap.get(ord(ch));
        if not gn: continue
        p=SVGPathPen(gs); gs[gn].draw(p); b=BoundsPen(gs); gs[gn].draw(b)
        d['g'][ch]={'d':p.getCommands(),'adv':gs[gn].width,'bb':b.bounds}
    hb=d['g']['H']['bb']; d['cap']=hb[3]
    out[k]=d
json.dump(out,open('glyphs.json','w'))
print({k:(v['upm'],v['cap']) for k,v in out.items()})
