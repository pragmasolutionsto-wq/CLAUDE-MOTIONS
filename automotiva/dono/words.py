# trascrizione word-level (Parakeet TDT v3 via sherpa-onnx) di tutte le clip -> work/dono/words.json
import glob, json, os, sys
import numpy as np, soundfile as sf, sherpa_onnx
M = sys.argv[1]
W = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../work/dono')
r = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f'{M}/encoder.int8.onnx', decoder=f'{M}/decoder.int8.onnx', joiner=f'{M}/joiner.int8.onnx', tokens=f'{M}/tokens.txt', model_type='nemo_transducer', num_threads=4)
out = {}
for f in sorted(glob.glob(f'{W}/[0-9]*.wav')):
    a, sr = sf.read(f, dtype='float32')
    s = r.create_stream(); s.accept_waveform(sr, a); r.decode_stream(s)
    toks, ts = s.result.tokens, s.result.timestamps
    words = []
    for t, x in zip(toks, ts):
        if t.startswith(' ') or not words:
            words.append([round(x, 2), t.strip()])
        else:
            words[-1][1] += t
    k = os.path.basename(f)[:-4]
    out[k] = words
    print(k, f'{len(a)/sr:.1f}s', ' '.join(w for _, w in words))
json.dump(out, open(f'{W}/words.json', 'w'), ensure_ascii=False)
