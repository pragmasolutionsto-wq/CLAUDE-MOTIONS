# tempi parola: ASR sul segmento; il testo corretto prende i tempi ASR (1:1 se stesso numero di parole, altrimenti in proporzione)
import sherpa_onnx, soundfile as sf, sys, os, json, numpy as np
R = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R)
from segs import SEGS
P = sys.argv[1] + '/'
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=P + 'encoder.int8.onnx', decoder=P + 'decoder.int8.onnx', joiner=P + 'joiner.int8.onnx', tokens=P + 'tokens.txt', model_type='nemo_transducer', num_threads=4)
out = []
for c, a, b, txt in SEGS:
    x, sr = sf.read(f'{R}/../work/dono/{c}.wav', dtype='float32')
    seg = x[int(a * sr):int(b * sr)]; pad = 0.3; z = np.zeros(int(pad * sr), 'float32')
    st = rec.create_stream(); st.accept_waveform(sr, np.concatenate([z, seg * (0.25 / (np.abs(seg).max() + 1e-6)), z])); rec.decode_stream(st)
    ws = []
    for tk, ts in zip(st.result.tokens, st.result.timestamps):
        if tk.startswith(' ') or not ws: ws.append([ts - pad, tk.strip()])
        else: ws[-1][1] += tk
    m = txt.split(); n, k = len(m), len(ws)
    res = []
    for i, w in enumerate(m):
        j = i if n == k else (round(i * (k - 1) / max(1, n - 1)) if k else 0)
        t = (ws[j][0] if k else 0) + 0.16
        res.append([round(max(0.02, t, res[-1][0] + 0.07 if res else 0), 3), w])
    out.append(res)
    print(c, f'{a:.2f}-{b:.2f}', '' if n == k else f'[{n} vs ASR {k}]', '|', st.result.text)
json.dump(out, open(f'{R}/../work/dono/segwords.json', 'w'), ensure_ascii=False)
