# ritrascrive ogni segmento tagliato (con 0.3 s di silenzio attorno) per verificare che non manchino parole
import sherpa_onnx, soundfile as sf, sys, os, numpy as np
R = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R)
from segs import SEGS
P = sys.argv[1] + '/'
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=P + 'encoder.int8.onnx', decoder=P + 'decoder.int8.onnx', joiner=P + 'joiner.int8.onnx', tokens=P + 'tokens.txt', model_type='nemo_transducer', num_threads=4)
for c, a, b in [x[:3] for x in SEGS if len(x) == 3]:
    x, sr = sf.read(f'{R}/../work/n2/{c}.wav', dtype='float32')
    seg = x[int(a * sr):int(b * sr)]
    g = 0.25 / (np.abs(seg).max() + 1e-6)
    z = np.zeros(int(0.3 * sr), 'float32')
    st = rec.create_stream(); st.accept_waveform(sr, np.concatenate([z, seg * g, z])); rec.decode_stream(st)
    print(f'{c} [{a:.2f}-{b:.2f}] {st.result.text}')
