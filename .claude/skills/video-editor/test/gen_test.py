import json, subprocess, sys, os, wave
d = sys.argv[1]
sents = ["Ciao, sono Meme.", "Questo è un test del", "no, rifacciamo.", "Questo è un test del mio editor video.", "Seguimi per altri consigli!"]
words, pcm, t, rate = [], b"", 0.4, 22050
pcm += b"\0\0" * int(rate * 0.4)
for si, s in enumerate(sents):
    for w in s.split():
        f = f"{d}/w.wav"
        subprocess.run(["espeak-ng", "-v", "it", "-s", "170", "-w", f, w], check=True)
        r = wave.open(f); fr = r.readframes(r.getnframes()); rate = r.getframerate()
        # togli silenzio iniziale/finale di espeak
        smp = memoryview(fr).cast("h"); idx = [i for i, v in enumerate(smp) if abs(v) > 300]
        fr = fr[idx[0]*2:(idx[-1]+1)*2]
        dur = len(fr) / 2 / rate
        words.append({"w": w, "s": round(t, 3), "e": round(t + dur, 3)})
        pcm += fr; t += dur
        gap = 0.06
        pcm += b"\0\0" * int(rate * gap); t += gap
    gap = 0.9
    pcm += b"\0\0" * int(rate * gap); t += gap
o = wave.open(f"{d}/voice.wav", "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(rate); o.writeframes(pcm); o.close()
json.dump({"language": "it", "words": words}, open(f"{d}/words.json", "w"), ensure_ascii=False, indent=1)
print(f"{t:.2f}s")
