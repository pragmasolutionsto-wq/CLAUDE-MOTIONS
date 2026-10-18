"""Clip AI (Runway) → durata esatta dei rispettivi inserti, 1080x1920 30fps. Il rallentamento usa
interpolazione di movimento così resta fluido. Le durate arrivano da Remotion (inserts.json).
uso: python3 africa/prep_ai.py"""
import json, os, subprocess

D = os.path.dirname(os.path.abspath(__file__))
INS = json.load(open(f'{D}/inserts.json'))
for name, dur in INS.items():
    src = f'{D}/public/ai/raw_{name}.mp4'
    if not os.path.exists(src):
        print('manca', src); continue
    sd = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
    k = dur / sd
    vf = f'setpts={k:.4f}*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1080:1920:flags=lanczos,unsharp=5:5:0.4,trim=duration={dur:.3f},format=yuv420p'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '15', '-preset', 'medium', f'{D}/public/ai/{name}.mp4'], check=True)
    print(name, f'{sd:.2f}s -> {dur:.2f}s (x{k:.2f})')
