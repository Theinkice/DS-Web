# -*- coding: utf-8 -*-
import os, re, subprocess, sys

ROOT = r'D:\大叔云页'
NODE = r'C:\Users\zhang\.workbuddy\binaries\node\versions\22.22.2-3\node.exe'

print('【JS 语法检查 (node --check)】')
for f in ['main.js', 'animation.js', 'language.js', 'sound.js']:
    r = subprocess.run([NODE, '--check', os.path.join(ROOT, 'js', f)], capture_output=True, text=True)
    print(f'  {f}:', 'OK' if r.returncode == 0 else r.stderr.strip()[:200])

no_alt = []
pages = sorted(f for f in os.listdir(ROOT) if f.endswith('.html'))
for pg in pages:
    with open(os.path.join(ROOT, pg), encoding='utf-8') as fh:
        t = fh.read()
    for m in re.finditer(r'<img\b[^>]*>', t):
        tag = m.group(0)
        if 'alt=' not in tag:
            no_alt.append((pg, tag[:80]))
print()
print('【缺 alt 的图片】', '无' if not no_alt else '')
for pg, tag in no_alt:
    print(f'  {pg}: {tag}')

print()
print('【脚本加载方式】')
for pg in pages:
    with open(os.path.join(ROOT, pg), encoding='utf-8') as fh:
        t = fh.read()
    scripts = re.findall(r'<script[^>]*src="([^"]+)"[^>]*>', t)
    defer = len(re.findall(r'<script[^>]*src[^>]*\bdefer\b', t))
    print(f'  {pg}: {len(scripts)} 个外链脚本, defer={defer}')

print()
print('【各页 <title>】')
for pg in pages:
    with open(os.path.join(ROOT, pg), encoding='utf-8') as fh:
        t = fh.read()
    m = re.search(r'<title>([^<]*)</title>', t)
    print(f'  {pg}: {m.group(1) if m else "(缺!)"}')
