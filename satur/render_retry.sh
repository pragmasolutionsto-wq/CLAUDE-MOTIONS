#!/bin/bash
# rilancia il render a blocchi finché tutti i blocchi sono fatti (un blocco bloccato scade e si riprova)
for i in 1 2 3 4 5 6; do bash satur/render_chunks.sh && exit 0; pkill -f headless_shell; echo "retry $i"; done
exit 1
