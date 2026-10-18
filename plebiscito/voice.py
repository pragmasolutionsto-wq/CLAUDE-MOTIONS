"""Voce narrante: frasi TTS → trim + tempo → traccia unica; tempi frase e parola (sillabe sul parlato).
Scrive out/pleb_voice.wav, plebiscito/timeline.json, plebiscito/words.json   uso: python3 plebiscito/voice.py"""
import json, os, re, subprocess
import numpy as np

D = os.path.dirname(os.path.abspath(__file__))
SR, TEMPO, GAP, HEAD, TAIL = 48000, 1.06, 0.32, 0.25, 4.2
# testo a video (sottotitoli); 'parola|n' = n sillabe parlate (PSA = pi-es-se-a)
TXT = [
    "Parlare di prostata, per noi uomini, non è sempre facile. Ma alcune cose è importante saperle.",
    "Hai mai sentito parlare di PSA|4? È una proteina prodotta dalla prostata: un indicatore del suo stato di salute. Si misura con un semplice prelievo di sangue.",
    "Un valore alto può dipendere da cause diverse: una prostata ingrossata, un'infiammazione, un'infezione. A volte, anche da un tumore. Ma attenzione: PSA|4 alto non vuol dire necessariamente tumore.",
    "Quando fare il test? In genere, dai 50|3 anni in su. Già dai 40-45|8 anni, se in famiglia ci sono stati casi, o fattori di rischio.",
    "Perché controllare? Perché un PSA|4 alto, spesso, non dà sintomi. Per questo è importante il controllo.",
    "Nella nostra farmacia puoi fare il test con un prelievo capillare, rapido e discreto. Ti diciamo cosa fare prima del test, ti aiutiamo a leggere i valori, e ti seguiamo passo dopo passo.",
    "Ti aspettiamo nella nostra farmacia.",
]
syl = lambda w: max(1, len(re.findall(r'[aeiouàèéìòóù]+', w.lower())))
norm = lambda w: re.sub(r"[^\wàèéìòóù'€-]", '', w.lower())

def load(p):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', p, '-af', f'atempo={TEMPO}', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def voiced(x, thr=-38, minsil=0.12):
    hop = int(SR * 0.01); n = len(x) // hop
    db = 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
    on = db > thr
    # chiude i buchi brevi
    segs, i = [], 0
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]: j += 1
            segs.append([i * 0.01, j * 0.01]); i = j
        else: i += 1
    out = []
    for s in segs:
        if out and s[0] - out[-1][1] < minsil: out[-1][1] = s[1]
        else: out.append(s)
    return [s for s in out if s[1] - s[0] > 0.05]

track, sents, words, t = [np.zeros(int(HEAD * SR), np.float32)], [], [], HEAD
for k, txt in enumerate(TXT):
    x = load(f'{D}/public/vo/s{k + 1}.mp3')
    v = voiced(x)
    a, z = max(0, v[0][0] - 0.03), min(len(x) / SR, v[-1][1] + 0.06)
    x = x[int(a * SR):int(z * SR)]
    v = [[p - a, q - a] for p, q in v]
    fade = int(0.01 * SR); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    toks = txt.split(); n = []
    for i, w in enumerate(toks):
        m = re.match(r'^(.*)\|(\d+)(.*)$', w)
        if m: toks[i] = m.group(1) + m.group(3); n.append(int(m.group(2)))
        else: n.append(syl(w))
    tot, lens = sum(n), [q - p for p, q in v]; V = sum(lens)
    def at(f):  # frazione di parlato → tempo nella frase
        r = f * V
        for (p, q), L in zip(v, lens):
            if r <= L: return p + r
            r -= L
        return v[-1][1]
    c, prev = 0, ''
    for w, q in zip(toks, n):
        tt = at(c / tot)
        if re.search(r'[,.:?!]$', prev):  # dopo punteggiatura: aggancia all'inizio del segmento parlato più vicino
            st = min((p for p, _ in v), key=lambda p: abs(p - tt))
            if abs(st - tt) < 0.45: tt = st
        if words and words[-1][2] == k: tt = max(tt, words[-1][0] - t + 0.11)
        words.append([round(t + tt, 3), w, k]); c += q; prev = w
    sents.append({'t': round(t, 3), 'end': round(t + len(x) / SR, 3), 'txt': re.sub(r'\|\d+', '', txt)})
    track.append(x); t += len(x) / SR
    if k < len(TXT) - 1:
        track.append(np.zeros(int(GAP * SR), np.float32)); t += GAP
track.append(np.zeros(int(TAIL * SR), np.float32)); t += TAIL
y = np.concatenate(track)
os.makedirs('out', exist_ok=True)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-',
                '-af', 'highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,equalizer=f=3500:t=q:w=1.2:g=2', 'out/pleb_voice.wav'],
               input=y.tobytes(), check=True)
json.dump({'fps': 30, 'duration': round(t, 3), 'sents': sents}, open(f'{D}/timeline.json', 'w'), ensure_ascii=False, indent=1)
json.dump(words, open(f'{D}/words.json', 'w'), ensure_ascii=False)
print('durata', round(t, 2))
for s in sents: print(s['t'], s['end'])
for k in range(len(TXT)): print(k, ' '.join(f'{a:.2f}:{w}' for a, w, kk in words if kk == k))
