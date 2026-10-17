"""Voce narrante italiana (Kokoro TTS offline, voce femminile if_sara, velocità 0.8) + letto sonoro morbido.
Genera anche la timeline: ogni scena dura quanto il suo paragrafo (+0,5 s di attacco, +coda).

uso: python3 monaco/scripts/voice.py <dir_modelli_kokoro>
Modelli: github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 (kokoro-v1.0.onnx, voices-v1.0.bin).
Output: monaco/public/voice.wav, monaco/timeline.json, monaco/voiceover.txt"""
import sys, re, json, math, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

MODELS = sys.argv[1]
SR, FPS = 24000, 30
LEAD, TAIL, SENT_GAP, FINAL_HOLD = 0.5, 1.1, 0.55, 3.0

# Scena -> paragrafo. "l'òlter" e "a esse elle" sono grafie fonetiche: forzano la pronuncia italiana corretta.
SCENES = [
    ("heart", "Il cuore parla. Ogni battito lascia una traccia, e a volte, per ascoltarla davvero, serve uno sguardo più attento."),
    ("ecg", "Un elettrocardiogramma trasforma quel ritmo in un tracciato. Lo rende visibile, leggibile, utile al tuo medico per capire come stai."),
    ("holter", "Ma un cuore non batte sempre allo stesso modo. Cambia con i passi, con il sonno, con le emozioni. Per questo esiste l'òlter cardiaco: un piccolo dispositivo che registra il ritmo per un periodo prolungato, mentre vivi la tua giornata come sempre."),
    ("pressure", "E c'è l'òlter pressorio, che misura la pressione più volte nell'arco della giornata. Non una fotografia di un solo momento, ma il racconto completo di come lavora il tuo organismo."),
    ("asl", "Tutto questo è possibile in convenzione con l'a esse elle, vicino a casa tua. Senza lunghi spostamenti, con il supporto di persone che conosci e di cui ti fidi."),
    ("docs", "Sappiamo che organizzare un controllo, per te o per un tuo caro, richiede tempo e pensieri. Per questo non ti lasciamo solo nel percorso. Ti aiutiamo a chiarire ogni passaggio: cosa serve per la ricetta, come funziona il ticket, se hai diritto a un'esenzione."),
    ("end", "Quando sei pronto, concordiamo insieme l'appuntamento. Con calma, e con le informazioni giuste."),
]
# testo come va scritto (per sottotitoli / file di consegna)
def display(t): return t.replace("l'òlter", "l'Holter").replace("l'a esse elle", "l'ASL")

k = Kokoro(f"{MODELS}/kokoro-v1.0.onnx", f"{MODELS}/voices-v1.0.bin")

def say(text):
    s, sr = k.create(text, voice="if_sara", speed=0.8, lang="it")
    assert sr == SR
    nz = np.flatnonzero(np.abs(s) > 0.01)
    return s[max(nz[0] - 240, 0):nz[-1] + 2400]

chunks, timeline, cues, t = [], [], [], 0.0
for name, para in SCENES:
    start = t
    v = start + LEAD
    sents = []
    for sent in re.split(r'(?<=[.!?])\s+', para):
        s = say(sent)
        chunks.append((v, s))
        sents.append([round(v, 3), round(v + len(s) / SR, 3)])
        cues.append({"scene": name, "start": round(v, 2), "end": round(v + len(s) / SR, 2), "text": display(sent)})
        v += len(s) / SR + SENT_GAP
    v -= SENT_GAP
    end = v + (FINAL_HOLD + 2.5 if name == "end" else TAIL)
    end = math.ceil(end * FPS) / FPS
    timeline.append({"id": name, "start": round(start, 4), "end": round(end, 4), "voiceStart": round(start + LEAD, 3), "voiceEnd": round(v, 3), "sentences": sents})
    t = end

DUR = t
vo = np.zeros(int(round(DUR * SR)), np.float32)
for at, s in chunks:
    i = int(at * SR)
    vo[i:i + len(s)] += s
vo *= 0.89 / np.abs(vo).max()

# Letto: accordo Re maggiore 9 lentissimo + battito morbido sotto la scena del cuore, ducking sotto la voce.
tt = np.arange(len(vo)) / SR
pad = np.zeros_like(tt)
for f, a in [(73.42, .5), (146.83, .35), (220.0, .22), (293.66, .16), (369.99, .12), (329.63, .08)]:
    pad += a * np.sin(2 * np.pi * f * tt + f) * (0.75 + 0.25 * np.sin(2 * np.pi * tt / 9 + f))
beat = np.zeros_like(tt)
for bt in np.arange(0.0, timeline[1]["end"], 1.6):
    for off, g in [(0, 1), (0.22, .6)]:
        m = (tt >= bt + off) & (tt < bt + off + 0.25)
        x = tt[m] - bt - off
        beat[m] += g * np.sin(2 * np.pi * 52 * x) * np.exp(-x * 22)
env = np.clip(tt / 3, 0, 1) * np.clip((DUR - tt) / 3, 0, 1)
bed = (pad / np.abs(pad).max() * 0.07 + beat * 0.14) * env
lvl = np.convolve(np.abs(vo), np.ones(SR // 5) / (SR // 5), 'same')
mix = vo + bed * (1 - 0.45 * np.clip(lvl / 0.05, 0, 1))
mix *= 0.95 / np.abs(mix).max()
sf.write("monaco/public/voice.wav", np.stack([mix, mix], 1), SR, subtype='PCM_16')

json.dump({"duration": DUR, "scenes": timeline}, open("monaco/timeline.json", "w"), indent=1)
with open("monaco/voiceover.txt", "w") as f:
    f.write("Voce narrante - Farmacia Monaco, Telecardiologia in convenzione con ASL\n")
    f.write("Voce: Kokoro if_sara (italiano, femminile), velocità 0.8\n\n")
    for c in cues:
        f.write(f"{c['start']:7.2f}s - {c['end']:7.2f}s  {c['text']}\n")
for s in timeline: print(s)
print("durata", DUR)
