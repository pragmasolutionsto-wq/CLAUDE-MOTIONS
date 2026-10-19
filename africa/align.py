"""Stima il tempo di ogni parola: dentro ogni segmento distribuisce le sillabe sul parlato reale
(inizio/fine voce misurati sull'energia). Scrive africa/words.json: [[t_out, parola, seg], ...]
uso: python3 africa/align.py"""
import json, os, re, subprocess
import numpy as np

D = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(f'{D}/timeline.json'))
SR = 16000
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/public/raw/capelli.mp4', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, np.int16).astype(float) / 32768
e = np.array([np.sqrt(np.mean(x[k:k + 400] ** 2) + 1e-12) for k in range(0, len(x) - 400, 160)])
db = np.convolve(20 * np.log10(e), np.ones(5) / 5, 'same')
thr = np.percentile(db, 80) - 18

def syl(w):
    w = w.lower()
    n = len(re.findall(r'[aeiouàèéìòóù]+', w))
    n += len(re.findall(r'(?<=[iu])[aeoàèéòó]', w)) * 0  # dittonghi: contati come una sillaba
    return max(1, n) + (1 if w.isdigit() else 0)

out, acc = [], 0.0
for k, s in enumerate(T['segs']):
    a, b = int(s['in'] * 100), int(s['out'] * 100)
    v = np.flatnonzero(db[a:b] > thr)
    v0, v1 = (a + v[0]) / 100, (a + v[-1]) / 100
    words = s['txt'].split()
    sy = [syl(w) for w in words]
    # pause brevi interne: il tempo "parlato" esclude i tratti sotto soglia
    speak = db[a:b] > thr
    cum = np.cumsum(speak) / max(1, speak.sum())
    tot = sum(sy); c = 0
    for w, n in zip(words, sy):
        frac = c / tot
        idx = int(np.searchsorted(cum, frac))
        t_src = s['in'] + idx / 100
        out.append([round(acc + t_src - s['in'], 2), re.sub(r'[^\wàèéìòóù\']', '', w.lower()), k])
        c += n
    acc += s['out'] - s['in']
json.dump(out, open(f'{D}/words.json', 'w'), ensure_ascii=False)
print('durata parlato', round(acc, 2))
print(' '.join(f'{t}:{w}' for t, w, k in out))
