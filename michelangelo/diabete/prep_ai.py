"""Clip Runway (720p, 5 s) -> 1080x1920 per Remotion. uso: python3 michelangelo/diabete/prep_ai.py"""
import os, subprocess
D = os.path.dirname(os.path.abspath(__file__))
for n in ['blood', 'heel', 'eye', 'mirror', 'hands']:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/public/ai/raw/{n}.mp4', '-vf', 'scale=1080:1920:flags=lanczos,unsharp=5:5:0.4', '-c:v', 'libx264', '-crf', '15', '-pix_fmt', 'yuv420p', '-an', '-r', '30', f'{D}/public/ai/{n}.mp4'], check=True)
