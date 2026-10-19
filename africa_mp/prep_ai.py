"""Clip AI (Runway) → durata esatta dei rispettivi inserti, 1080x1920 30fps (interpolazione di movimento).
Se una clip non c'è ancora, crea un segnaposto dal suo fotogramma (o tinta brand) per poter fare le prove.
uso: python3 africa_mp/prep_ai.py"""
import json, os, subprocess

D = os.path.dirname(os.path.abspath(__file__))
INS = json.load(open(f'{D}/inserts.json'))
for name, dur in INS.items():
    src, still, dst = f'{D}/public/ai/raw_{name}.mp4', f'{D}/public/ai/{name}.png', f'{D}/public/ai/{name}.mp4'
    if os.path.exists(src):
        sd = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
        k = dur / sd
        vf = f'setpts={k:.4f}*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1080:1920:flags=lanczos,unsharp=5:5:0.4,trim=duration={dur:.3f},format=yuv420p'
        args = ['-i', src]
        print(name, f'{sd:.2f}s -> {dur:.2f}s (x{k:.2f})')
    else:
        inp = still if os.path.exists(still) else None
        args = ['-loop', '1', '-i', inp] if inp else ['-f', 'lavfi', '-i', 'color=c=0xD5EEE6:s=1080x1920:r=30']
        vf = f"scale=1080:1920,zoompan=z='1+0.0008*on':d={int(dur * 30) + 1}:s=1080x1920:fps=30,trim=duration={dur:.3f},format=yuv420p"
        print(name, 'SEGNAPOSTO', 'da foto' if inp else 'tinta')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args, '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '15', '-preset', 'medium', '-t', f'{dur:.3f}', dst], check=True)
