"""Traccia il viso (Haar) sulla base montata; per ogni ripresa scarta i falsi positivi lontani dalla mediana,
poi interpola e liscia. uso: python3 psa_live/facetrack.py   ->  psa_live/face_out.json"""
import cv2, json, os
import numpy as np

D = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(f'{D}/sents.json'))
CLIP = [[0], [1, 2], [3, 4, 5, 6], [7], [8, 9], [10]]  # frasi per ripresa
PRIOR = {3: [0.40, 0.23, 0.66, 0.46]}  # ripresa 4: le mani giunte ingannano il rilevatore, viso controllato a occhio
cap = cv2.VideoCapture(f'{D}/public/base.mp4')
fps = cap.get(cv2.CAP_PROP_FPS); W, H = cap.get(cv2.CAP_PROP_FRAME_WIDTH), cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
det = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
step = round(fps / 10); ts, boxes, i = [], [], 0
while True:
    ok, fr = cap.read()
    if not ok: break
    if i % step == 0:
        g = cv2.equalizeHist(cv2.cvtColor(cv2.resize(fr, (540, 960)), cv2.COLOR_BGR2GRAY))
        f = det.detectMultiScale(g, 1.08, 6, minSize=(110, 110))
        ts.append(i / fps)
        boxes.append([max(f, key=lambda b: b[2] * b[3])] if len(f) else [])
    i += 1
B = np.full((len(ts), 4), np.nan)
for j, f in enumerate(boxes):
    if f:
        x, y, w, h = f[0]; B[j] = [x / 540, y / 960, (x + w) / 540, (y + h) / 960]
ts = np.array(ts)
for ci, c in enumerate(CLIP):
    a, b = S[c[0]]['t'], S[c[-1]]['end'] + (5 if c[-1] == 10 else 0)
    m = (ts >= a) & (ts < b) & ~np.isnan(B[:, 0])
    med = np.array(PRIOR[ci]) if ci in PRIOR else np.nanmedian(B[m], 0)
    cy = (B[:, 1] + B[:, 3]) / 2; mcy = (med[1] + med[3]) / 2
    bad = m & ((np.abs(cy - mcy) > 0.08) | (np.abs((B[:, 2] - B[:, 0]) - (med[2] - med[0])) > 0.1))
    B[bad] = np.nan
    if ci in PRIOR and not (m & ~bad).any():  # nessun rilevamento buono: viso fisso dalla verifica a occhio
        B[(ts >= a) & (ts < b)] = med
    print('ripresa', c, 'mediana', med.round(2), 'scartati', int(bad.sum()), 'di', int(m.sum()))
for k in range(4):
    col = B[:, k]; ok = ~np.isnan(col)
    B[:, k] = np.interp(np.arange(len(col)), np.flatnonzero(ok), col[ok])
n = 9; ker = np.ones(n) / n
B = np.stack([np.convolve(np.pad(B[:, k], n // 2, mode='edge'), ker, 'valid') for k in range(4)], 1)
json.dump({'dt': step / fps, 'box': B.round(4).tolist()}, open(f'{D}/face_out.json', 'w'))
for j in range(0, len(B), 20): print(round(ts[j], 1), B[j].round(2))
