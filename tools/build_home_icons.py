#!/usr/bin/env python3
import base64, io, re
from pathlib import Path
from PIL import Image, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets"/"ui"/"home-v0855"
OUT.mkdir(parents=True,exist_ok=True)

SOURCES={
    "live": ROOT/"assets"/"home-ui"/"live.png",
    "settings": ROOT/"assets"/"home-ui"/"settings.png",
    "room": ROOT/"assets"/"home-ui"/"room.png",
    "gacha": ROOT/"assets"/"home-ui"/"gacha.png",
    "story": ROOT/"assets"/"ui"/"story-icon-v0833.png",
}

TARGET=1024
CONTENT=870

def read_lounge():
    text=(ROOT/"interaction-room-v0844.js").read_text(encoding="utf-8")
    m=re.search(r"const LOUNGE_ICON='data:image/(?:webp|png);base64,([^']+)'",text)
    if not m:
        raise RuntimeError("LOUNGE_ICON data URI not found")
    return Image.open(io.BytesIO(base64.b64decode(m.group(1)))).convert("RGBA")

def visible_bbox(img):
    a=img.getchannel("A")
    # Ignore extremely faint antialias/noise pixels at the extreme edge.
    a=a.point(lambda p: 255 if p>=10 else 0)
    return a.getbbox()

def normalize(img):
    img=img.convert("RGBA")
    bbox=visible_bbox(img)
    if bbox:
        img=img.crop(bbox)
    scale=min(CONTENT/img.width,CONTENT/img.height)
    size=(max(1,round(img.width*scale)),max(1,round(img.height*scale)))
    img=img.resize(size,Image.Resampling.LANCZOS)
    # Old 160px menu art benefits from restrained pre-sharpening before browser downscale.
    img=img.filter(ImageFilter.UnsharpMask(radius=1.15,percent=135,threshold=3))
    canvas=Image.new("RGBA",(TARGET,TARGET),(0,0,0,0))
    x=(TARGET-img.width)//2
    y=(TARGET-img.height)//2
    canvas.alpha_composite(img,(x,y))
    return canvas

for name,path in SOURCES.items():
    img=Image.open(path).convert("RGBA")
    normalize(img).save(OUT/f"{name}.png",optimize=True)

normalize(read_lounge()).save(OUT/"lounge.png",optimize=True)
print("generated",*[str(p.relative_to(ROOT)) for p in sorted(OUT.glob("*.png"))],sep="\n")
