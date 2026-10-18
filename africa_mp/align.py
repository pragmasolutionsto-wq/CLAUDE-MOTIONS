"""Tempi parola dall'SRT: dentro ogni blocco SRT distribuisce le sillabe, poi rimappa sui segmenti tenuti.
Scrive africa_mp/words.json: [[t_out, parola, seg], ...]   uso: python3 africa_mp/align.py"""
import json, os, re

D = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(f'{D}/timeline.json'))
ts = lambda s: sum(float(x) * m for x, m in zip(s.replace(',', '.').split(':'), (3600, 60, 1)))
blocks = []
for b in open(f'{D}/trascrizione.srt', encoding='utf-8').read().strip().split('\n\n'):
    l = b.strip().split('\n')
    a, z = [ts(x.strip()) for x in l[1].split('-->')]
    txt = re.sub(r'\(Trascritto da TurboScribe[^)]*\)', '', ' '.join(l[2:])).strip()
    blocks.append((a, z, txt))
norm = lambda w: re.sub(r"[^\wàèéìòóù'%]", '', w.lower())
syl = lambda w: max(1, len(re.findall(r'[aeiouàèéìòóù]+', w.lower())) + (2 if re.search(r'\d', w) else 0))
src = []  # (t_src, parola)
for a, z, txt in blocks:
    ws = txt.split(); n = [syl(w) for w in ws]; tot = sum(n); c = 0
    for w, k in zip(ws, n):
        src.append((a + (z - a) * c / tot, norm(w))); c += k
out, acc = [], 0.0
for k, s in enumerate(T['segs']):
    if s.get('alone'):  # presa doppia che l'SRT ha fuso: sillabe distribuite sul segmento
        ws = s['txt'].split(); n = [syl(w) for w in ws]; tot = sum(n); c = 0; a0, a1 = s['in'] + 0.1, s['out'] - 0.15
        for w, q in zip(ws, n):
            out.append([round(acc + a0 - s['in'] + (a1 - a0) * c / tot, 2), norm(w), k]); c += q
        acc += s['out'] - s['in']; continue
    for t, w in src:
        if s['in'] - 0.25 <= t < s['out'] - 0.05:
            out.append([round(acc + max(0, t - s['in']), 2), w, k])
    acc += s['out'] - s['in']
json.dump(out, open(f'{D}/words.json', 'w'), ensure_ascii=False)
print('durata parlato', round(acc, 2))
for k in range(len(T['segs'])):
    print(k, ' '.join(f'{t}:{w}' for t, w, kk in out if kk == k))
