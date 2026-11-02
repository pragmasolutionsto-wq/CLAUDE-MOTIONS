# confini precisi del parlato (Silero VAD) attorno a ogni taglio
import sherpa_onnx, soundfile as sf, numpy as np, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from segs import SEGS
M = '/tmp/claude-0/-home-user-CLAUDE-MOTIONS/b29b5e0d-f5dd-5695-a8c6-4040126122e5/scratchpad/asr/silero_vad.onnx'
cfg = sherpa_onnx.VadModelConfig(); cfg.silero_vad.model = M; cfg.silero_vad.min_silence_duration = 0.08; cfg.silero_vad.min_speech_duration = 0.05; cfg.silero_vad.threshold = 0.4; cfg.sample_rate = 16000
res = {}
for c in sorted({s[0] for s in SEGS}):
    x, sr = sf.read(f'/home/user/CLAUDE-MOTIONS/automotiva/work/v2/wav/IMG_{c}.wav', dtype='float32')
    vad = sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=60)
    reg = []
    for i in range(0, len(x), 512):
        vad.accept_waveform(x[i:i + 512])
        while not vad.empty():
            s = vad.front; reg.append([round(s.start / sr, 2), round((s.start + len(s.samples)) / sr, 2)]); vad.pop()
    vad.flush()
    while not vad.empty():
        s = vad.front; reg.append([round(s.start / sr, 2), round((s.start + len(s.samples)) / sr, 2)]); vad.pop()
    res[c] = reg
json.dump(res, open('/home/user/CLAUDE-MOTIONS/automotiva/work/v2/vad.json', 'w'))
for c, a, b in SEGS:
    r = res[c]
    near_a = [x for x in r if x[1] > a - 0.6 and x[0] < a + 0.6]
    near_b = [x for x in r if x[1] > b - 0.8 and x[0] < b + 0.6]
    print(f'{c} in={a:5.2f} speech~{near_a} | out={b:5.2f} speech~{near_b}')
