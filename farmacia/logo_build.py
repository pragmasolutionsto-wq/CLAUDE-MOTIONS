"""Ridisegno vettoriale del logo Farmacia Africa Orientale, calibrato sul logo reale del sito (header).
Testo convertito in tracciati (nessun font necessario). uso: python3 farmacia/logo_build.py"""
import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(ROOT, '..', 'node_modules/@fontsource/roboto/files/roboto-latin-%s-normal.woff')

def text_path(txt, weight, x0, x1, base, cap, track=None, sx0=1.0):
    f = TTFont(FONT % weight); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    capH = f['OS/2'].sCapHeight; s = cap / capH
    adv = [gs[cmap[ord(c)]].width for c in txt]
    nat = sum(adv) * s
    if track is None:
        sx = (x1 - x0) / nat; tr = 0
    else:
        sx = sx0; tr = ((x1 - x0) - nat * sx) / (len(txt) - 1)
    out = []; x = x0
    for c, a in zip(txt, adv):
        pen = SVGPathPen(gs)
        gs[cmap[ord(c)]].draw(TransformPen(pen, (s * sx, 0, 0, -s, x, base)))
        out.append(pen.getCommands())
        x += a * s * sx + tr
    return out

def logo(text, bowl, liquid, snake, word, sub, eye, bg=None):
    A = text_path('AFRICA', '500', 285, 825, 215, 115)
    O = text_path('ORIENTALE', '500', 232, 1048, 358, 111)
    F = text_path('FARMACIA', '500', 660, 1048, 428, 38, track=True, sx0=1.18)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1104 480" width="1104" height="480">
{f'<rect width="1104" height="480" fill="{bg}"/>' if bg else ''}
<path d="M86 132 Q120 120 152 128 T222 130 C222 172 192 198 154 199 C116 198 86 172 86 132Z" fill="{liquid}"/>
<path d="M59 130 A94 94 0 0 0 247 130" fill="none" stroke="{bowl}" stroke-width="19" stroke-linecap="round"/>
<path d="M160 256 C100 262 110 294 152 298 C196 302 192 342 140 348 C108 352 118 374 170 374" fill="none" stroke="{snake}" stroke-width="21" stroke-linecap="round"/>
<rect x="144" y="226" width="16" height="176" fill="{bowl}"/>
<rect x="122" y="236" width="60" height="13" rx="3" fill="{bowl}"/>
<path d="M110 418 C126 394 180 394 196 418Z" fill="{bowl}"/>
<path d="M250 136 C266 98 252 70 220 66 C192 63 170 72 176 90" fill="none" stroke="{snake}" stroke-width="21" stroke-linecap="round"/>
<ellipse cx="204" cy="68" rx="38" ry="22" transform="rotate(-12 204 68)" fill="{snake}"/>
<circle cx="214" cy="62" r="4.5" fill="{eye}"/>
<path d="{" ".join(A)}" fill="{word}"/><path d="{" ".join(O)}" fill="{word}"/><path d="{" ".join(F)}" fill="{sub}"/>
</svg>'''

dark = logo('', bowl='#176A52', liquid='#B8D2CB', snake='#5CC2A9', word='#005850', sub='#C5DFD8', eye='#005850')
white = logo('', bowl='#FFFFFF', liquid='#8FEAF0', snake='#5CC2A9', word='#FFFFFF', sub='#BFE4E6', eye='#0A474D')
os.makedirs(os.path.join(ROOT, 'public'), exist_ok=True)
open(os.path.join(ROOT, 'public/logo.svg'), 'w').write(dark)
open(os.path.join(ROOT, 'public/logo_white.svg'), 'w').write(white)
import json
A = text_path('AFRICA', '500', 285, 825, 215, 115); O = text_path('ORIENTALE', '500', 232, 1048, 358, 111)
F = text_path('FARMACIA', '500', 660, 1048, 428, 38, track=True, sx0=1.18)
open(os.path.join(ROOT, 'logoData.ts'), 'w').write('// generato da logo_build.py: tracciati del logo (viewBox 1104x480)\nexport const LOGO_TEXT = ' + json.dumps({'A': A, 'O': O, 'F': F}) + ';\n')
print('ok')
