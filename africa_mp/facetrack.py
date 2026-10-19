"""Traccia il viso (Haar) sulla clip sorgente: box normalizzato ogni 0.1s, interpolato e lisciato.
uso: python3 africa/facetrack.py africa/public/raw/capelli.mp4 africa/face.json"""
import cv2, json, sys
import numpy as np

cap = cv2.VideoCapture(sys.argv[1])
fps = cap.get(cv2.CAP_PROP_FPS)
W, H = cap.get(cv2.CAP_PROP_FRAME_WIDTH), cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
det = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
step = max(1, round(fps / 10))
ts, boxes = [], []
i = 0
while True:
    ok, fr = cap.read()
    if not ok: break
    if i % step == 0:
        g = cv2.equalizeHist(cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY))
        f = det.detectMultiScale(g, 1.1, 5, minSize=(int(W * 0.18), int(W * 0.18)))
        ts.append(i / fps)
        if len(f):
            x, y, w, h = max(f, key=lambda b: b[2] * b[3])
            boxes.append([x / W, y / H, (x + w) / W, (y + h) / H])
        else:
            boxes.append(None)
    i += 1
B = np.array([b if b else [np.nan] * 4 for b in boxes], float)
for c in range(4):
    col = B[:, c]; ok = ~np.isnan(col)
    B[:, c] = np.interp(np.arange(len(col)), np.flatnonzero(ok), col[ok])
k = 7; ker = np.ones(k) / k
B = np.stack([np.convolve(np.pad(B[:, c], k // 2, mode='edge'), ker, 'valid') for c in range(4)], 1)
print(f'frames {len(ts)}, detected {sum(b is not None for b in boxes)}')
print('y0 range', B[:, 1].min().round(3), B[:, 1].max().round(3), 'y1 range', B[:, 3].min().round(3), B[:, 3].max().round(3))
json.dump({'dt': step / fps, 'box': B.round(4).tolist()}, open(sys.argv[2], 'w'))
