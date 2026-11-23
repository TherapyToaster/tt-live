from PIL import Image, ImageFilter
import numpy as np, os
SH='/workspace/ttw/tt-live/site-header/'
for o in 'abc':
    k='v3'+o
    base=Image.open(f'renders/{o}-base.png').convert('RGB')
    assert base.size==(2400,800)
    for w in (2400,1200):
        im=base if w==2400 else base.resize((1200,400),Image.LANCZOS)
        im.save(f'{SH}home-wall-{k}-{w}.jpg',quality=86,optimize=True,progressive=True)
        im.save(f'{SH}home-wall-{k}-{w}.webp',quality=82,method=6)
    fill=base.resize((480,160),Image.LANCZOS).filter(ImageFilter.GaussianBlur(10))
    fill=Image.eval(fill,lambda v:int(v*.45))
    fill.save(f'{SH}home-wall-{k}-fill.jpg',quality=70);fill.save(f'{SH}home-wall-{k}-fill.webp',quality=60)
    os.makedirs(f'{SH}neon/{k}',exist_ok=True)
    def rgba(path,size):
        a=np.array(Image.open(path).convert('RGB').resize(size,Image.LANCZOS)).astype(np.float32)
        al=a.max(axis=2); safe=np.maximum(al,1)[...,None]
        rgb=np.clip(a*255/safe,0,255); out=np.dstack([rgb,al]).astype(np.uint8)
        return Image.fromarray(out,'RGBA'),al
    t,al=rgba(f'renders/{o}-tubes.png',(1600,533)); t.save(f'{SH}neon/{k}/neon-tubes-1600.webp',quality=85,method=6)
    g,_=rgba(f'renders/{o}-glow.png',(800,272)); g.save(f'{SH}neon/{k}/neon-glow-800.webp',quality=80,method=6)
    m=Image.open(f'renders/{o}-tubes.png').convert('L').resize((800,267),Image.LANCZOS).point(lambda v:255 if v>40 else int(v*255/40)).filter(ImageFilter.MaxFilter(3))
    mk=Image.merge('RGBA',[Image.new('L',m.size,255)]*3+[m]); mk.save(f'{SH}neon/{k}/neon-mask-800.webp',quality=80,method=6)
    print(k,'ok')
