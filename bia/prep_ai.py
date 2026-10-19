"""Clip 3D (Runway, bioimpedenziometria) → durata dell'inquadratura + margini di transizione, 1080x1920 30fps.
Più corta del necessario → rallentata con interpolazione di movimento; più lunga → tagliata.
uso: python3 plebiscito/prep_ai.py"""
import json, os, subprocess

D = os.path.dirname(os.path.abspath(__file__))
PAD = 0.5
FIT = {'signal'}  # la clip parte mezzo secondo prima del taglio e finisce mezzo dopo
for sh in json.load(open(f'{D}/shots.json'))['shots']:
    if sh['kind'] != 'clip': continue
    name, dur = sh['name'], sh['b'] - sh['a'] + 2 * PAD
    src, dst = f'{D}/public/ai/raw_{name}.mp4', f'{D}/public/ai/{name}.mp4'
    sd = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
    if name in FIT and dur < sd:  # accelera per mostrare tutto il movimento
        vf = f'setpts={dur / sd:.4f}*PTS,fps=30,scale=1080:1920:flags=lanczos,unsharp=5:5:0.35'
        print(name, f'{sd:.2f}s -> accelerata {dur:.2f}s')
    elif dur <= sd - 0.05:
        vf = 'fps=30,scale=1080:1920:flags=lanczos,unsharp=5:5:0.35'
        print(name, f'{sd:.2f}s -> taglio {dur:.2f}s')
    else:
        k = dur / sd
        vf = f'setpts={k:.4f}*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1080:1920:flags=lanczos,unsharp=5:5:0.35'
        print(name, f'{sd:.2f}s -> {dur:.2f}s (x{k:.2f})')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', vf + f',trim=duration={dur:.3f},format=yuv420p', '-an', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-t', f'{dur:.3f}', dst], check=True)
