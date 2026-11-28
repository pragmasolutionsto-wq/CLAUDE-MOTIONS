# ASR su finestre arbitrarie con i tempi delle parole: python3 probe.py <modello> clip:in:out ...
import sherpa_onnx, soundfile as sf, sys, os, numpy as np
R = os.path.dirname(os.path.abspath(__file__)); P = sys.argv[1] + '/'
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=P + 'encoder.int8.onnx', decoder=P + 'decoder.int8.onnx', joiner=P + 'joiner.int8.onnx', tokens=P + 'tokens.txt', model_type='nemo_transducer', num_threads=4)
for a in sys.argv[2:]:
    c, i, o = a.split(':'); i, o = float(i), float(o)
    x, sr = sf.read(f'{R}/../work/s1/{c}.wav', dtype='float32'); seg = x[int(i * sr):int(o * sr)]
    z = np.zeros(int(0.3 * sr), 'float32')
    st = rec.create_stream(); st.accept_waveform(sr, np.concatenate([z, seg * (0.25 / (np.abs(seg).max() + 1e-6)), z])); rec.decode_stream(st)
    ws = []
    for tk, ts in zip(st.result.tokens, st.result.timestamps):
        if tk.startswith(' ') or not ws: ws.append([ts - 0.3 + i, tk.strip()])
        else: ws[-1][1] += tk
    print(a, '|', ' '.join(f'{t:.2f}:{w}' for t, w in ws))
