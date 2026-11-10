#!/bin/bash
# uso: bash dermatologia/sheet.sh DermaH -> out/sheet_DermaH.png (contact sheet di 20 fotogrammi)
C=${1:-DermaH}
T="0.8 1.6 2.3 3.0 3.8 4.4 5.2 6.2 7.0 8.3 9.3 10.6 11.6 12.4 13.4 14.4 15.3 16.4 17.8 19.4"
F=$(for t in $T; do python3 -c "print(int($t*60))"; done | paste -sd,)
node dermatologia/stills.mjs $C $F > /dev/null
python3 -I - $C $F <<'PY'
import sys
from PIL import Image
c=sys.argv[1]; fs=sys.argv[2].split(',')
v=c.endswith('V'); w,h=(216,384) if v else (480,270); n=10 if v else 5
ims=[Image.open(f'out/still_{c}_{f}.png').resize((w,h)) for f in fs]
s=Image.new('RGB',(w*n,h*(len(ims)//n)),'black')
for i,im in enumerate(ims): s.paste(im,((i%n)*w,(i//n)*h))
s.save(f'out/sheet_{c}.png')
PY
