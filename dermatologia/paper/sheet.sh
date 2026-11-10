#!/bin/bash
# uso: bash dermatologia/sheet.sh DermaH -> out/sheet_DermaH.png (contact sheet di 20 fotogrammi)
C=${1:-DermaPaperH}
T=${T:-"1.2 3.0 4.3 5.5 6.6 7.6 8.6 9.6 11.3 12.6 13.6 14.6 15.6 16.6 18.3 19.6 20.6 21.6 22.6 23.6 25.3 26.6 27.6 28.6 29.6 30.6 32.3 33.6 34.6 35.6 36.6 37.6 39.6 40.6 42 43.6 44.6 46"}
F=$(for t in $T; do python3 -c "print(int($t*60))"; done | paste -sd,)
node dermatologia/paper/stills.mjs $C $F > /dev/null
python3 -I - $C $F <<'PY'
import sys
from PIL import Image
c=sys.argv[1]; fs=sys.argv[2].split(',')
v=c.endswith('V'); w,h=(216,384) if v else (480,270); n=12 if v else 6
ims=[Image.open(f'out/still_{c}_{f}.png').resize((w,h)) for f in fs]
s=Image.new('RGB',(w*n,h*(-(-len(ims)//n))),'black')
for i,im in enumerate(ims): s.paste(im,((i%n)*w,(i//n)*h))
s.save(f'out/sheet_{c}.png')
PY
