"""Genera keyboard/timeline.json: tasti premuti + testo a schermo, un'unica fonte per video e audio.
uso: python3 keyboard/timeline.py"""
import json, random
random.seed(7)
BPM = 96; B = 60 / BPM          # 24 battiti = 15s
DUR = 15.0
keys = []        # {t, k, d}
lines = []       # {segs:[[txt, cls]], times:[...]} tempi di comparsa per carattere

KEYMAP = {' ': 'space', '/': 'slash', '.': 'period', ',': 'comma', '-': 'minus'}
def key_of(ch):
    if ch.isalpha(): return ch.lower()
    return KEYMAP.get(ch, ch)

def typed(txt, t0, cps=10.0, prefix=(('> ', 'pr'),), cls='in'):
    """la tastiera scrive txt partendo da t0; ritorna il tempo finale"""
    t = t0; times = []
    for i, ch in enumerate(txt):
        if ch.isupper():
            keys.append({'t': round(t - 0.05, 3), 'k': 'lshift', 'd': 0.16})
        keys.append({'t': round(t, 3), 'k': key_of(ch), 'd': round(random.uniform(0.07, 0.11), 3)})
        times.append(round(t + 0.012, 3))
        gap = 1 / cps * random.uniform(0.65, 1.35)
        if ch == ' ': gap *= 1.15
        t += gap
    pre = ''.join(p[0] for p in prefix)
    lines.append({'segs': [list(p) for p in prefix] + [[txt, cls]], 'times': [t0 - 0.3] * len(pre) + times, 'cursor': [t0 - 0.3, t + 0.5]})
    return t

def streamed(segs, t0, cps=70.0):
    n = sum(len(s[0]) for s in segs)
    lines.append({'segs': [list(s) for s in segs], 'times': [round(t0 + i / cps, 3) for i in range(n)]})
    return t0 + n / cps

def enter(t):
    keys.append({'t': round(t, 3), 'k': 'enter', 'd': 0.16})

# header (già a schermo)
lines.append({'segs': [['header', 'hdr']], 'times': [-1]})
lines.append({'segs': [['', 'sp']], 'times': []})
# 1) prompt digitato dalla tastiera
t = typed('crea una landing con hero animata e CTA', 0.55, cps=9.6)
ENTER1 = 8 * B                      # 5.0s, cade sul drop
assert t < ENTER1 - 0.15, t
enter(ENTER1)
lines.append({'segs': [['', 'sp']], 'times': []})
# 2) Claude scrive il codice
s = ENTER1 + 0.35
s = streamed([['● ', 'dot'], ['Write', 'tool'], ['(src/Hero.tsx)', 'dim']], s, 60) + 0.15
code = [
    [['+ ', 'add'], ['export const ', 'kw'], ['Hero', 'fn'], [' = () => (', 'tx']],
    [['+ ', 'add'], ['  <', 'tx'], ['section', 'tag'], [' className=', 'at'], ['"hero"', 'str'], ['>', 'tx']],
    [['+ ', 'add'], ['    <', 'tx'], ['h1', 'tag'], ['>', 'tx'], ['Più clienti, meno sbatti.', 'wh'], ['</', 'tx'], ['h1', 'tag'], ['>', 'tx']],
    [['+ ', 'add'], ['    <', 'tx'], ['Reveal', 'fn'], [' rain glow ', 'at'], ['/>', 'tx']],
    [['+ ', 'add'], ['    <', 'tx'], ['Button', 'fn'], [' cta', 'at'], ['>', 'tx'], ['Prenota ora', 'wh'], ['</', 'tx'], ['Button', 'fn'], ['>', 'tx']],
    [['+ ', 'add'], ['  </', 'tx'], ['section', 'tag'], ['>', 'tx']],
    [['+ ', 'add'], [');', 'tx']],
]
for c in code:
    s = streamed([['  ', 'tx']] + c, s, 95) + 0.06
s += 0.15
s = streamed([['● ', 'dot'], ['Update', 'tool'], ['(src/App.tsx) ', 'dim'], ['+12', 'add'], [' −3', 'del']], s, 70) + 0.25
s = streamed([['✓ ', 'ok'], ['Build ok · 0 errori', 'okt']], s, 60)
lines.append({'segs': [['', 'sp']], 'times': []})
# 3) la tastiera lancia il deploy
t2 = typed('/deploy', s + 0.45, cps=8.5)
ENTER2 = 18 * B                     # 11.25s
assert t2 < ENTER2 - 0.1, (t2, ENTER2)
enter(ENTER2)
streamed([['✓ ', 'ok'], ['Online', 'okt'], [' · landing pronta in 15s', 'dim']], ENTER2 + 0.45, 45)

json.dump({'bpm': BPM, 'dur': DUR, 'enter1': ENTER1, 'enter2': ENTER2, 'keys': keys, 'lines': lines},
          open('keyboard/timeline.json', 'w'), ensure_ascii=False, indent=0)
print('keys', len(keys), 'stream end', round(s, 2), 'deploy typed', round(t2, 2))
