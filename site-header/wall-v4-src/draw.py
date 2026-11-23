from PIL import Image,ImageFilter,ImageDraw
import numpy as np,random,html,sys
MODE=sys.argv[1] if len(sys.argv)>1 else 'base'
random.seed(4)
ROOT='/workspace/ttw/tt-live/site-header/'
im=Image.open(ROOT+'home-wall-v2-2400.jpg').convert('RGB'); im.save('original.png')
# Make the old illegible letter tubes into a quieter painted underlayer,
# retaining the shutter texture/tags, sticker, halo and logo from the original.
a=np.array(im).astype(float)
mask=Image.new('L',im.size,255); d=ImageDraw.Draw(mask)
d.rounded_rectangle((875,-50,1405,214),40,fill=0)
d.rounded_rectangle((1822,583,2400,800),40,fill=0)
mask=mask.filter(ImageFilter.GaussianBlur(16)); m=np.array(mask)[...,None]/255
# Dark saturated paint keeps original art as texture, rather than a new wall.
base=a*(1-m*.66)
Image.fromarray(base.astype('uint8')).save('underpaint.png')
# Hand-shaped outline paths in 200x300 design grid. No font / AI letters.
G={
'T': 'M18 12 Q95 -2 182 10 Q204 14 197 44 L190 72 Q187 85 172 86 L136 84 L133 274 Q133 298 106 298 L78 294 Q60 293 62 270 L68 85 L26 90 Q4 92 4 70 L4 36 Q4 17 18 12 Z',
'H': 'M16 17 Q21 1 44 7 L66 12 Q82 16 78 38 L74 108 L132 101 L136 22 Q137 2 160 5 L185 9 Q201 12 198 36 L184 279 Q183 299 160 299 L140 295 Q122 292 124 270 L129 177 L70 182 L65 278 Q64 300 41 297 L17 290 Q0 287 2 265 Z',
'E': 'M24 10 Q95 -4 178 7 Q202 10 196 33 L189 61 Q186 76 168 76 L86 78 L84 113 L155 107 Q178 105 175 125 L171 151 Q169 168 151 170 L81 175 L79 217 L176 207 Q198 205 193 227 L184 268 Q181 286 161 289 L23 300 Q0 300 3 275 L8 35 Q8 13 24 10 Z',
'R': 'M17 12 Q76 -4 137 6 Q197 13 198 78 Q198 124 161 149 L196 256 Q208 291 179 297 L155 300 Q138 301 131 281 L98 184 L76 185 L72 274 Q71 299 46 296 L21 290 Q1 288 3 263 L7 36 Q7 16 17 12 Z M80 72 L78 125 Q130 130 132 99 Q135 68 80 72 Z',
'A': 'M72 16 Q79 -2 108 3 L135 8 Q150 10 156 30 L199 267 Q204 294 179 297 L154 299 Q135 300 131 281 L126 246 L70 247 L62 281 Q58 299 34 296 L16 291 Q-2 286 5 263 Z M96 106 L79 185 L116 184 L108 106 Q104 86 96 106 Z',
'P': 'M20 10 Q73 -3 133 3 Q200 7 200 87 Q200 171 79 183 L72 276 Q69 300 44 296 L18 288 Q0 286 2 263 L7 36 Q7 15 20 10 Z M84 69 L79 125 Q134 130 136 94 Q137 65 84 69 Z',
'Y': 'M14 7 Q30 0 51 9 L64 14 Q75 19 82 43 L104 102 L136 24 Q144 3 163 4 L184 8 Q208 11 198 38 L138 176 L128 274 Q126 300 100 298 L78 294 Q57 291 60 267 L66 172 L3 36 Q-6 15 14 7 Z',
'O': 'M102 1 Q194 -6 199 125 Q210 289 108 300 Q7 311 1 170 Q-6 15 102 1 Z M103 72 Q66 77 68 161 Q69 235 106 228 Q143 225 135 144 Q130 68 103 72 Z',
'S': 'M172 13 Q194 20 184 45 L174 73 Q169 87 152 79 Q109 59 87 82 Q73 104 113 119 Q200 141 196 216 Q192 295 99 300 Q47 304 13 280 Q-4 267 6 246 L18 220 Q26 205 43 215 Q86 240 117 220 Q138 200 91 183 Q2 157 5 89 Q10 10 91 2 Q140 -3 172 13 Z'
}
S=['<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="800" viewBox="0 0 2400 800"><defs><filter id="g" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="11"/></filter><filter id="b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter></defs>'+('<image href="underpaint.png" width="2400" height="800"/>' if MODE=='base' else '<rect width="2400" height="800" fill="#000"/>')]
# palette: cyan-blue and hot coral/pink alternate; warm-white R.
def row(word,x0,x1,y,h,gap,rots,cols):
    n=len(word); w=(x1-x0-gap*(n-1))/n; out=[]
    for i,c in enumerate(word):
        ww=w*(0.84 if c in 'IJ' else 1.0)
        out.append((c,x0+i*(w+gap),y+(10 if i%2 else 0)-(6 if i%3==0 else 0),ww,h,rots[i],cols[i]))
    return out
L=row('THERAPY',70,2330,244,222,62,[-4,2,-3,3,-2,4,-3],['blue','red','yellow','blue','blue','red','blue'])+\
  row('TOASTER',55,1785,512,240,50,[3,-3,2,-2,3,-2,2],['blue','blue','red','blue','blue','yellow','red'])
C={'blue':'#3aa6ff','red':'#ff4b4b','yellow':'#ffd23a'}
CORE={'blue':'#e8f7ff','red':'#ffe2dc','yellow':'#fff8d8'}
PUFF=24
for c,x,y,w,h,r,col in L:
  sx,sy=w/200,h/300; k=(sx+sy)/2; path=G[c]; tube=C[col]; core=CORE[col]
  px=lambda v: v/k
  S.append(f'<g transform="translate({x:.1f} {y:.1f}) rotate({r} {w/2:.1f} {h/2:.1f}) scale({sx:.4f} {sy:.4f})">')
  def p(attrs,kind='paint'):
    if MODE=='tubes':
      if kind=='glow': return
      if kind=='paint': attrs=attrs.replace('fill="#','fill="#000" x="').replace('stroke="#','stroke="#000" y="') if False else __import__('re').sub(r'(fill|stroke)="#[0-9a-fA-F]+"',r'\1="#000"',attrs)
    if MODE=='glow':
      if kind=='tube': return
      if kind=='paint': attrs=__import__('re').sub(r'(fill|stroke)="#[0-9a-fA-F]+"',r'\1="#000"',attrs)+' fill-opacity=".6" stroke-opacity=".6"'
    S.append(f'<path d="{path}" fill-rule="evenodd" stroke-linejoin="round" stroke-linecap="round" {attrs}/>')
  p(f'fill="#000" stroke="#000" stroke-width="{px(2*PUFF+34):.1f}" opacity=".9" transform="translate({px(10):.1f} {px(14):.1f})"')
  p(f'fill="#05060a" stroke="#05060a" stroke-width="{px(2*PUFF+22):.1f}"')
  p(f'fill="#1d5fb4" stroke="#1d5fb4" stroke-width="{px(2*PUFF):.1f}" opacity=".84"')
  p(f'fill="none" stroke="#0d2f66" stroke-width="{px(2*PUFF-14):.1f}" opacity=".55"')
  p(f'fill="#2a73cc" opacity=".55"')
  p(f'fill="none" stroke="{tube}" stroke-width="{px(30):.1f}" filter="url(#g)" opacity=".9"','glow')
  p(f'fill="none" stroke="{tube}" stroke-width="{px(12):.1f}" filter="url(#b)"','tube')
  p(f'fill="none" stroke="{tube}" stroke-width="{px(9):.1f}"','tube')
  p(f'fill="none" stroke="{core}" stroke-width="{px(3.5):.1f}"','tube')
  S.append('</g>')
# Put the original sticker and halo back on top (no changes, no new artwork).
# Same for logo, whose position must never move. Feather these patches later in PIL.
S.append('</svg>')
open(f'letters-{MODE}.svg','w').write('\n'.join(S))
# browser render HTML
open('render.html','w').write('<html><body style="margin:0;background:black"><img src="letters.svg" width="2400" height="800"></body></html>')
