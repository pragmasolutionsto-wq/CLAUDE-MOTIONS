# traccia voce: ogni segmento dal MOV originale, ripulito e portato allo stesso livello, montato sulla timeline
import json, os, subprocess, numpy as np, soundfile as sf
R = os.path.dirname(os.path.abspath(__file__))
W = os.path.join(R, '../work/n1'); RAW = os.path.join(R, '../raw/n1')
tl = json.load(open(os.path.join(R, 'timeline.json')))
SR = 48000
out = np.zeros(int(tl['dur'] * SR) + SR, 'float32')
CH = 'highpass=f=95,afftdn=nr=12:nf=-42,equalizer=f=220:t=q:w=1:g=-2,equalizer=f=3400:t=q:w=1.2:g=3,acompressor=threshold=-22dB:ratio=3:attack=8:release=140:makeup=4'
for k, s in enumerate(tl['segs']):
    pre = 0.4   # margine prima/dopo per far assestare i filtri, poi tagliato
    a0 = max(0, s['i'] - pre)
    tmp = f'{W}/seg{k:02d}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a0}', '-t', f"{s['o'] - a0 + pre}", '-i', f"{RAW}/IMG_{s['clip']}.MOV", '-vn', '-ac', '1', '-ar', str(SR), '-af', CH, tmp], check=True)
    x, _ = sf.read(tmp, dtype='float32')
    x = x[int(round((s['i'] - a0) * SR)):][:int(round((s['o'] - s['i']) * SR))]
    # stesso livello per tutti: RMS dei momenti parlati -> -20 dBFS
    h = SR // 50
    fr = np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, len(x) - h, h)])
    act = fr[fr > fr.max() * 0.12]
    x = x * (10 ** (-20 / 20) / (np.sqrt(np.mean(act ** 2)) + 1e-9))
    f = int(0.012 * SR)
    x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    p = int(round(s['at'] * SR))
    out[p:p + len(x)] += x
    os.remove(tmp)
out = np.tanh(out * 1.1) / 1.1
sf.write(f'{W}/voice.wav', out[:int(tl['dur'] * SR)], SR)
print('voice ok', f"{tl['dur']:.2f}s", 'picco', float(np.abs(out).max()))
