#!/usr/bin/env python3
"""Trascrive un video/audio con Whisper, parola per parola con timestamp.

uso: transcribe.py INPUT OUT.json [--model small] [--lang it]
Output: {"language": "it", "words": [{"w": "ciao", "s": 0.42, "e": 0.71}, ...]}
Usa faster-whisper; se manca, ripiega su openai-whisper.
"""
import argparse, json, sys

ap = argparse.ArgumentParser()
ap.add_argument("input")
ap.add_argument("out")
ap.add_argument("--model", default="small")
ap.add_argument("--lang", default=None)
a = ap.parse_args()

words, lang = [], a.lang
try:
    from faster_whisper import WhisperModel
    m = WhisperModel(a.model, device="auto", compute_type="int8")
    segs, info = m.transcribe(a.input, language=a.lang, word_timestamps=True,
                              vad_filter=False, condition_on_previous_text=False)
    lang = info.language
    for s in segs:
        for w in s.words:
            words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)})
except ImportError:
    import whisper
    m = whisper.load_model(a.model)
    r = m.transcribe(a.input, language=a.lang, word_timestamps=True)
    lang = r["language"]
    for s in r["segments"]:
        for w in s["words"]:
            words.append({"w": w["word"].strip(), "s": round(w["start"], 3), "e": round(w["end"], 3)})

json.dump({"language": lang, "words": words}, open(a.out, "w"), ensure_ascii=False, indent=1)
print(f"{len(words)} parole, lingua {lang} -> {a.out}", file=sys.stderr)
