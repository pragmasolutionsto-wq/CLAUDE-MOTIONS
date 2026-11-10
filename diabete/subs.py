"""Sottotitoli parola per parola (ASS, impressi con ffmpeg/libass): blocchi brevi, parola detta in lime.
uso: python3 diabete/subs.py out/diabete_subs.ass"""
import json, os, re, sys

D = os.path.dirname(os.path.abspath(__file__))
WS = json.load(open(f'{D}/words.json')); SE = json.load(open(f'{D}/sents.json'))
Y = 1600  # sotto la zona grafiche, sopra l'interfaccia di Instagram
ts = lambda t: f'{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}'
chunks = []
for k, s in enumerate(SE):
    ws = [(t, w) for t, w, kk in WS if kk == k]
    cur = []
    for t, w in ws:
        if cur and sum(len(x[1]) + 1 for x in cur) + len(w) > 18:
            chunks.append(cur); cur = []
        cur.append((t, w))
        if re.search(r'[,.:?!]$', w): chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    chunks.append(('END', s['end'] + 0.1))
ev, i = [], 0
seq = [c for c in chunks]
for j, c in enumerate(seq):
    if c[0] == 'END': continue
    nxt = next((x for x in seq[j + 1:]), None)
    end = nxt[1] if nxt and nxt[0] == 'END' else (nxt[0][0] if nxt else c[-1][0] + 0.6)
    for m, (t, w) in enumerate(c):
        t1 = c[m + 1][0] if m + 1 < len(c) else end
        txt = ' '.join(('{\\c&H6AE8D4&\\fscx108\\fscy108}' + re.sub(r'[,.:]$', '', x).upper() + '{\\c&HFFFFFF&\\fscx100\\fscy100}') if n == m else re.sub(r'[,.:]$', '', x).upper() for n, (_, x) in enumerate(c))
        ev.append(f'Dialogue: 0,{ts(t - 0.03)},{ts(t1 - 0.03)},Sub,,0,0,0,,{{\\an2\\pos(540,{Y})}}{txt}')
head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Montserrat Black,66,&H00FFFFFF,&H00FFFFFF,&H00201203,&H96000000,0,0,0,0,100,100,0,0,1,7,3,2,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(sys.argv[1], 'w').write(head + '\n'.join(ev) + '\n')
print(len(ev), 'eventi')
