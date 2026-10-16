#!/bin/bash
# uso: film/scripts/sheet.sh <nome> t1 t2 t3 ...   (tempi in secondi) -> out/<nome>/sheet.jpg
B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
name=$1; shift
mkdir -p out/$name
i=0; files=()
for t in "$@"; do
  f=$(python3 -c "print(round($t*120))")
  out=out/$name/f$(printf %02d $i).jpg
  npx remotion still film/index.ts Pquattro $out --frame=$f --browser-executable=$B --log=error >/dev/null 2>&1 || echo "fail $t"
  files+=($out); i=$((i+1))
done
n=${#files[@]}
cols=3; rows=$(( (n+cols-1)/cols ))
inputs=""; for f in "${files[@]}"; do inputs="$inputs -i $f"; done
ffmpeg -loglevel error -y $inputs -filter_complex "$(for ((k=0;k<n;k++)); do printf "[$k]scale=640:-1[s$k];"; done)$(for ((k=0;k<n;k++)); do printf "[s$k]"; done)xstack=inputs=$n:layout=$(for ((k=0;k<n;k++)); do c=$((k%cols)); r=$((k/cols)); x=0; for ((q=0;q<c;q++)); do x="$x+w0"; done; y=0; for ((q=0;q<r;q++)); do y="$y+h0"; done; printf "${x}_${y}|"; done | sed 's/|$//')" out/$name/sheet.jpg
echo done out/$name/sheet.jpg
