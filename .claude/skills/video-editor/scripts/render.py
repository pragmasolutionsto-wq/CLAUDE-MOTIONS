#!/usr/bin/env python3
"""Monta il video finale: tagli + formato + sottotitoli brand + loudness + export alta qualità.

uso: render.py INPUT OUTPUT --format vertical|wide|source [--cuts CUTS.json] [--words WORDS.json]
               [--captions] [--brand BRAND.json] [--fix-light] [--no-loudnorm]
--cuts    usa i segmenti "keep" (e le parole tenute per i sottotitoli)
--words   trascrizione da usare per i sottotitoli quando non c'è --cuts
"""
import argparse, json, os, subprocess, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)

ap = argparse.ArgumentParser()
ap.add_argument("input")
ap.add_argument("output")
ap.add_argument("--format", choices=["vertical", "wide", "source"], default="source")
ap.add_argument("--cuts")
ap.add_argument("--words")
ap.add_argument("--captions", action="store_true")
ap.add_argument("--brand", default=os.path.join(SKILL, "brand.json"))
ap.add_argument("--fix-light", action="store_true", help="schiarisce + denoise (video scuro/sgranato)")
ap.add_argument("--no-loudnorm", action="store_true")
a = ap.parse_args()


def probe(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                   "stream=width,height", "-of", "csv=p=0", path], text=True)
    w, h = out.strip().split(",")[:2]
    return int(w), int(h)


def ass_color(hexc, alpha="00"):
    h = hexc.lstrip("#")
    return f"&H{alpha}{h[4:6]}{h[2:4]}{h[0:2]}".upper()


src_w, src_h = probe(a.input)
if a.format == "vertical":
    W, H = 1080, 1920
    geo = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"
elif a.format == "wide":
    W, H = (3840, 2160) if src_h >= 2160 else (1920, 1080)
    geo = f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:black"
else:
    W, H = src_w - src_w % 2, src_h - src_h % 2
    geo = f"scale={W}:{H}"

# segmenti + parole rimappate sulla nuova timeline
segs, words = None, []
if a.cuts:
    c = json.load(open(a.cuts))
    segs, src_words = c["keep"], c["words"]
    off = 0.0
    for s, e in segs:
        for w in src_words:
            if s <= w["s"] < e:
                words.append({"w": w["w"], "s": off + w["s"] - s, "e": off + min(w["e"], e) - s})
        off += e - s
elif a.words:
    words = json.load(open(a.words))["words"]

tmp = tempfile.mkdtemp()
fc = []
if segs:
    parts = []
    for i, (s, e) in enumerate(segs):
        d = e - s
        fc.append(f"[0:v]trim={s}:{e},setpts=PTS-STARTPTS[v{i}]")
        fc.append(f"[0:a]atrim={s}:{e},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,"
                  f"afade=t=out:st={max(0, d - 0.012):.3f}:d=0.012[a{i}]")
        parts.append(f"[v{i}][a{i}]")
    fc.append("".join(parts) + f"concat=n={len(segs)}:v=1:a=1[vc][ac]")
    vin, ain = "[vc]", "[ac]"
else:
    vin, ain = "[0:v]", "[0:a]"

vchain = [geo, "setsar=1"]
if a.fix_light:
    # luce + contrasto leggeri, denoise temporale: migliora, non fa miracoli
    vchain += ["eq=brightness=0.06:contrast=1.08:saturation=1.06:gamma=1.12", "hqdn3d=3:2:4:3"]

if a.captions and words:
    b = json.load(open(a.brand))
    vertical = H > W
    size = int(H * (0.075 if vertical else 0.07))
    margin = int(H * (0.26 if vertical else 0.08))
    style = (f"Style: Cap,{b['font_captions']},{size},{ass_color(b['text'])},{ass_color(b['accent'])},"
             f"{ass_color(b['primary'])},{ass_color(b['primary'], '40')},-1,0,0,0,100,100,1,0,1,"
             f"{max(4, size // 14)},{max(2, size // 30)},2,60,60,{margin},1")
    # blocchi di max 3 parole, spezzati su pause e punteggiatura
    chunks, cur = [], []
    for w in words:
        if cur and (len(cur) == 3 or w["s"] - cur[-1]["e"] > 0.3 or cur[-1]["w"][-1:] in ".!?,"):
            chunks.append(cur)
            cur = []
        cur.append(w)
    if cur:
        chunks.append(cur)
    ts = lambda t: f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
    ev = []
    hi, lo = r"{\c&H" + ass_color(b["accent"])[4:] + "&}", r"{\c&H" + ass_color(b["text"])[4:] + "&}"
    for ci, ch in enumerate(chunks):
        end = ch[-1]["e"] + 0.15
        if ci + 1 < len(chunks):
            end = min(end, chunks[ci + 1][0]["s"])
        for k, w in enumerate(ch):
            st = w["s"]
            en = ch[k + 1]["s"] if k + 1 < len(ch) else end
            pop = r"{\fscx112\fscy112\t(0,90,\fscx100\fscy100)}" if k == 0 else ""
            txt = " ".join(hi + x["w"].upper() + lo if j == k else x["w"].upper() for j, x in enumerate(ch))
            ev.append(f"Dialogue: 0,{ts(st)},{ts(en)},Cap,,0,0,0,,{pop}{txt}")
    ass = os.path.join(tmp, "caps.ass")
    with open(ass, "w") as f:
        f.write(f"[Script Info]\nScriptType: v4.00+\nPlayResX: {W}\nPlayResY: {H}\nWrapStyle: 0\n\n"
                "[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, "
                "BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, "
                f"Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n{style}\n\n"
                "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
                + "\n".join(ev) + "\n")
    vchain.append(f"subtitles={ass}:fontsdir={os.path.join(SKILL, 'fonts')}")

vchain.append("format=yuv420p")
fc.append(f"{vin}{','.join(vchain)}[vout]")
achain = "loudnorm=I=-14:TP=-1:LRA=11" if not a.no_loudnorm else "anull"
fc.append(f"{ain}{achain},aresample=48000[aout]")

cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", a.input, "-filter_complex", ";".join(fc),
       "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "slow", "-crf", "16",
       "-profile:v", "high", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", a.output]
subprocess.run(cmd, check=True)

# 2° passaggio: loudnorm a passata singola sbaglia sulle clip corte, correggo il gain misurato
if not a.no_loudnorm:
    def measure(path):
        log = subprocess.run(["ffmpeg", "-i", path, "-af", "ebur128", "-f", "null", "-"],
                             capture_output=True, text=True).stderr
        return float(log.rsplit("I:", 1)[1].split("LUFS")[0])

    lufs = measure(a.output)
    if abs(lufs + 14) > 0.5:
        fixed = os.path.join(tmp, "fixed" + os.path.splitext(a.output)[1])
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", a.output, "-c:v", "copy",
                        "-af", f"volume={-14 - lufs:.2f}dB,alimiter=limit=0.89:level=false",
                        "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", fixed], check=True)
        os.replace(fixed, a.output)
        lufs = measure(a.output)
    print(f"loudness {lufs:.1f} LUFS (target -14)")
print(f"ok -> {a.output} ({W}x{H})")
