# taglia le pause lunghe: tiene i tratti parlati (pause interne < MINSIL), bordi -0.12/+0.16 s, al frame
import soundfile as sf, numpy as np, os, sys, sherpa_onnx
R = os.path.dirname(os.path.abspath(__file__)); P = sys.argv[1] + '/'
MINSIL = float(sys.argv[2]) if len(sys.argv) > 2 else 0.55
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=P + 'encoder.int8.onnx', decoder=P + 'decoder.int8.onnx', joiner=P + 'joiner.int8.onnx', tokens=P + 'tokens.txt', model_type='nemo_transducer', num_threads=4)
q = lambda v: round(round(v * 30) / 30, 4)
for c in ['9820', '9821', '9823', '9825', '9827', '9828', '9829']:
    x, sr = sf.read(f'{R}/../work/dono/{c}.wav', dtype='float32'); h = sr // 100
    db = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, len(x) - h, h)]) + 1e-9)
    thr = max(np.percentile(db, 97) - 30, -48)
    on = db > thr
    runs, s = [], None
    for i, v in enumerate(on):
        if v and s is None: s = i
        if not v and s is not None: runs.append([s, i]); s = None
    if s is not None: runs.append([s, len(on)])
    runs = [r for r in runs if r[1] - r[0] >= 6]
    merged = []
    for r in runs:
        if merged and (r[0] - merged[-1][1]) / 100 < MINSIL: merged[-1][1] = r[1]
        else: merged.append(r)
    for a, b in merged:
        a, b = q(max(0, a / 100 - 0.12)), q(min(len(x) / sr, b / 100 + 0.16))
        seg = x[int(a * sr):int(b * sr)]; z = np.zeros(int(0.3 * sr), 'float32')
        st = rec.create_stream(); st.accept_waveform(sr, np.concatenate([z, seg * (0.25 / (np.abs(seg).max() + 1e-6)), z])); rec.decode_stream(st)
        print(f"    ('{c}', {a}, {b}),  # {b - a:.2f}s {st.result.text}")
