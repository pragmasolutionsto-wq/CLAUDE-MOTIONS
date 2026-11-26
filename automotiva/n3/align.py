# tempi parola per segmento: ASR sul segmento tagliato, poi mappa sul testo corretto (caps.py) -> work/n3/segwords.json
import sherpa_onnx, soundfile as sf, sys, os, json, numpy as np
R = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R)
from segs import SEGS
from caps import CAPS
P = sys.argv[1] + '/'
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=P + 'encoder.int8.onnx', decoder=P + 'decoder.int8.onnx', joiner=P + 'joiner.int8.onnx', tokens=P + 'tokens.txt', model_type='nemo_transducer', num_threads=4)
out = []
for sg, cap in zip(SEGS, CAPS):
    c, a, b = sg[:3]
    if not cap:
        out.append([]); continue
    x, sr = sf.read(f'{R}/../work/n3/{c}.wav', dtype='float32')
    seg = x[int(a * sr):int(b * sr)]
    g = 0.25 / (np.abs(seg).max() + 1e-6); pad = 0.3
    z = np.zeros(int(pad * sr), 'float32')
    st = rec.create_stream(); st.accept_waveform(sr, np.concatenate([z, seg * g, z])); rec.decode_stream(st)
    ws = []
    for tk, ts in zip(st.result.tokens, st.result.timestamps):
        if tk.startswith(' ') or not ws: ws.append([ts - pad, tk.strip()])
        else: ws[-1][1] += tk
    # inizio reale della voce (energia) per ancorare la prima parola
    h = sr // 100
    db = 20 * np.log10(np.array([np.sqrt(np.mean(seg[i:i + h] ** 2)) for i in range(0, len(seg) - h, h)]) + 1e-9)
    v0 = next(i for i, v in enumerate(db) if v > db.max() - 32) / 100
    n = sum(x[1] for x in cap)
    flag = '' if n == len(ws) else f'  !! ASR {len(ws)} parole, testo {n}: ' + ' '.join(w for _, w in ws)
    res, j = [], 0
    for x in cap:
        txt, k, gold = x[:3]
        t = x[3] if len(x) > 3 else ws[min(j, len(ws) - 1)][0] + 0.16   # i timestamp Parakeet anticipano di ~0.15-0.2 s
        res.append([round(max(t, v0 if not res else res[-1][0] + 0.08), 3), txt, gold]); j += k
    res[0][0] = round(v0, 3)
    out.append(res)
    print(c, f'{a:.2f}', ' '.join(f'{t:.2f}:{w}' for t, w, _ in res), flag)
json.dump(out, open(f'{R}/../work/n3/segwords.json', 'w'), ensure_ascii=False)
