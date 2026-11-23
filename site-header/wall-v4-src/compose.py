from PIL import Image,ImageFilter,ImageDraw
import numpy as np, os
SH='/workspace/ttw/tt-live/site-header/'; K='v4'
O=np.array(Image.open('original.png')).astype(float)
bar=np.array(Image.open('bar-mask.png')).astype(float)[...,None]/255*0.5
# keep regions (sticker+logo) = 1 - letter mask, same as draw.py
mask=Image.new('L',(2400,800),255); d=ImageDraw.Draw(mask)
d.rounded_rectangle((875,-50,1405,214),40,fill=0); d.rounded_rectangle((1822,583,2400,800),40,fill=0)
mask=mask.filter(ImageFilter.GaussianBlur(16))
def rgb(p): return np.array(Image.open(p).convert('RGB')).astype(float)
B=rgb('r-base.png'); base=B*(1-bar)+bar*(O*0.6)
bim=Image.fromarray(base.clip(0,255).astype('uint8')); bim.save('/workspace/neon-wall-v2/readable/home-wall-v4-2400.png')
for w in (2400,1200):
    im=bim if w==2400 else bim.resize((1200,400),Image.LANCZOS)
    im.save(f'{SH}home-wall-{K}-{w}.jpg',quality=86,optimize=True,progressive=True); im.save(f'{SH}home-wall-{K}-{w}.webp',quality=82,method=6)
fill=Image.eval(bim.resize((480,160),Image.LANCZOS).filter(ImageFilter.GaussianBlur(10)),lambda v:int(v*.45))
fill.save(f'{SH}home-wall-{K}-fill.jpg',quality=70); fill.save(f'{SH}home-wall-{K}-fill.webp',quality=60)
os.makedirs(f'{SH}neon/{K}',exist_ok=True)
def pre(p,size):  # premultiplied rgb on black
    a=np.array(Image.open(p).convert('RGBA').resize(size,Image.LANCZOS)).astype(float); return a[...,:3]*a[...,3:]/255
def torgba(x):
    al=x.max(2); s=np.maximum(al,1)[...,None]; return Image.fromarray(np.dstack([np.clip(x*255/s,0,255),al]).astype('uint8'),'RGBA')
# tubes 1600x533
T=rgb('r-tubes.png')*(1-bar)
newT=np.array(Image.fromarray(T.clip(0,255).astype('uint8')).resize((1600,533),Image.LANCZOS)).astype(float)
keep=np.clip((1-np.array(mask.resize((1600,533)))[...,None]/255-0.85)/0.15,0,1)
oldT=pre(SH+'neon/neon-tubes-1600.webp',(1600,533))*keep
torgba(np.maximum(newT,oldT)).save(f'{SH}neon/{K}/neon-tubes-1600.webp',quality=85,method=6)
# glow: canvas covers x -2%..102%, y -3%..103%
Gc=np.zeros((848,2496,3)); Gc[24:824,48:2448]=rgb('r-glow.png')
newG=np.array(Image.fromarray(Gc.clip(0,255).astype('uint8')).resize((800,267),Image.LANCZOS)).astype(float)
mk=Image.new('L',(2496,848),0); mk.paste(mask,(48,24)); kg=1-np.array(mk.resize((800,267)))[...,None]/255
# outside picture (pad) treat as keep only near sticker/logo: use letter mask padded by edge
oldG=pre(SH+'neon/neon-glow-800.webp',(800,267))
padm=np.array(Image.fromarray(np.pad(np.array(mask),((24,24),(48,48)),mode='edge')).resize((800,267)))[...,None]/255
oldG=oldG*np.clip(((1-padm)-0.85)/0.15,0,1)
torgba(np.maximum(newG,oldG)).save(f'{SH}neon/{K}/neon-glow-800.webp',quality=80,method=6)
# mask 800x267 from tubes
tl=Image.fromarray(np.maximum(newT,oldT).max(2).clip(0,255).astype('uint8')).resize((800,267),Image.LANCZOS)
m=tl.point(lambda v:255 if v>40 else int(v*255/40)).filter(ImageFilter.MaxFilter(3))
Image.merge('RGBA',[Image.new('L',m.size,255)]*3+[m]).save(f'{SH}neon/{K}/neon-mask-800.webp',quality=80,method=6)
print('ok')
