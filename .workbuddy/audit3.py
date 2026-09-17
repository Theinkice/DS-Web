# -*- coding: utf-8 -*-
"""检查 script 标签之后是否还有 main.js 需要的 DOM 元素"""
import os, re

ROOT = r'D:\大叔云页'
NEEDED = ['qrModal', 'qrMask', 'qrClose', 'termOut', 'mailForm', 'formOut', 'boot', 'pageWipe',
          'bgParticles', 'cursorDot', 'cursorRing', 'navBurger', 'mMenu', 'mClose', 'toTop',
          'hudClock', 'enterTitle', 'enterTyped', 'idImg', 'idUrl', 'idTag', 'idText', 'idStat',
          'identityPreview']

pages = sorted(f for f in os.listdir(ROOT) if f.endswith('.html'))
for pg in pages:
    with open(os.path.join(ROOT, pg), encoding='utf-8') as fh:
        t = fh.read()
    last_script = max(m.start() for m in re.finditer(r'<script\b', t))
    tail = t[last_script:]
    missing = [i for i in NEEDED if f'id="{i}"' in tail]
    # data-wechat / data-copy-id 是否也在 script 之后
    missing += [f'{k}({tail.count(k)})' for k in ('data-wechat', 'data-copy-id') if k in tail]
    print(f'{pg:<15} script 之后仍有: {missing if missing else "无"}')
