#!/bin/bash
# uso: stonesofa/stills.sh out/st 1.0 2.5 ...   (secondi) -> jpg a mezza risoluzione
B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
D=$1; shift; mkdir -p $D
for s in "$@"; do f=$(python3 -c "print(round($s*60))"); npx remotion still stonesofa/index.ts StoneSofa $D/s_$s.jpg --frame=$f --public-dir=stonesofa/public --browser-executable=$B --scale=0.5 --log=error >/dev/null 2>&1 & 
 while [ $(jobs -r | wc -l) -ge 3 ]; do sleep 0.5; done; done; wait
