# scontorna i marchi caricati -> PNG con trasparenza, ritagliati al contenuto, lato max 600 px
import os
from PIL import Image, ImageChops, ImageDraw
R = os.path.dirname(os.path.abspath(__file__)); RAW = f'{R}/../raw/s1'; OUT = f'{R}/../public/s1/logo'
def save(im, name):
    im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox())
    im.thumbnail((600, 600), Image.LANCZOS)
    im.save(f'{OUT}/{name}.png'); print(name, im.size)
def ink(path, name, light=False):
    """logo a tinta unita su fondo pieno: l'alfa viene dalla luminanza (nero su bianco, o bianco su nero)"""
    g = Image.open(path).convert('L')
    a = g if light else ImageChops.invert(g)
    a = a.point(lambda v: 0 if v < 24 else min(255, int((v - 24) * 1.25)))
    c = Image.new('RGBA', g.size, (255, 255, 255, 0) if light else (0, 0, 0, 0)); c.putalpha(a)
    save(c, name)
save(Image.open(f'{RAW}/IMG_9943.PNG').convert('RGBA'), 'smart')
save(Image.open(f'{RAW}/IMG_9944.WEBP').convert('RGBA'), 'mercedes')
ink(f'{RAW}/IMG_9945.JPG', 'audi')
im = Image.open(f'{RAW}/IMG_9946.JPG').convert('RGBA')   # Alfa Romeo: tondo a colori su bianco -> maschera circolare
m = Image.new('L', (im.width * 4, im.height * 4), 0); ImageDraw.Draw(m).ellipse((6, 6, im.width * 4 - 7, im.height * 4 - 7), fill=255)
im.putalpha(m.resize(im.size, Image.LANCZOS)); save(im, 'alfa')
ink(f'{RAW}/IMG_9947.JPG', 'maserati')
save(Image.open(f'{RAW}/IMG_9948.WEBP').convert('RGBA'), 'bmw')
ink(f'{RAW}/IMG_9949.WEBP', 'peugeot', light=True)
