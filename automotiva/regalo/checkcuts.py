# ritrascrive ogni segmento tagliato e lo confronta con le parole attese
import sherpa_onnx, soundfile as sf, json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from segs import SEGS
P = '/tmp/claude-0/-home-user-CLAUDE-MOTIONS/b29b5e0d-f5dd-5695-a8c6-4040126122e5/scratchpad/asr/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8/'
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=P + 'encoder.int8.onnx', decoder=P + 'decoder.int8.onnx', joiner=P + 'joiner.int8.onnx', tokens=P + 'tokens.txt', model_type='nemo_transducer', num_threads=4)
W = json.load(open('/home/user/CLAUDE-MOTIONS/automotiva/work/v3/words.json'))
import numpy as np
for c, a, b in SEGS:
    x, sr = sf.read(f'/home/user/CLAUDE-MOTIONS/automotiva/work/v3/wav/IMG_{c}.wav', dtype='float32')
    seg = np.concatenate([np.zeros(int(0.3 * sr), 'float32'), x[int(a * sr):int(b * sr)], np.zeros(int(0.3 * sr), 'float32')])
    st = rec.create_stream(); st.accept_waveform(sr, seg); rec.decode_stream(st)
    exp = [w for t, w in W['IMG_' + c] if a - 0.05 <= t < b - 0.05]
    prev = [w for t, w in W['IMG_' + c] if t < a - 0.05][-1:]
    nxt = [w for t, w in W['IMG_' + c] if t >= b - 0.05][:1]
    print(f'{c} [{a:.2f}-{b:.2f}]  prima:{prev} dopo:{nxt}\n   atteso: {" ".join(exp)}\n   sentito: {st.result.text}\n')
