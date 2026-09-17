# -*- coding: utf-8 -*-
"""把 4 个 script 标签移到 </body> 前（qrModal 之后），全站 11 页"""
import os, re

ROOT = r'D:\大叔云页'
pages = sorted(f for f in os.listdir(ROOT) if f.endswith('.html'))

for pg in pages:
    p = os.path.join(ROOT, pg)
    with open(p, encoding='utf-8') as fh:
        t = fh.read()

    # 提取连续的 4 个 script 行
    block_re = re.compile(
        r'([ \t]*)<script src="js/language\.js"></script>\s*\n'
        r'[ \t]*<script src="js/main\.js"></script>\s*\n'
        r'[ \t]*<script src="js/animation\.js"></script>\s*\n'
        r'[ \t]*<script src="js/sound\.js"></script>[ \t]*\n?'
    )
    m = block_re.search(t)
    if not m:
        print(f'{pg}: 未找到脚本块（可能已修复）')
        continue
    indent = m.group(1) or ''
    block = (indent + '<script src="js/language.js"></script>\n'
             + indent + '<script src="js/main.js"></script>\n'
             + indent + '<script src="js/animation.js"></script>\n'
             + indent + '<script src="js/sound.js"></script>\n')
    t = t[:m.start()] + t[m.end():]

    # 插到 </body> 之前
    t = t.replace('</body>', block + '</body>', 1)
    with open(p, 'w', encoding='utf-8', newline='') as fh:
        fh.write(t)
    print(f'{pg}: 脚本块已移至 </body> 前')
