# -*- coding: utf-8 -*-
import re
with open(r'D:\大叔云页\js\language.js', encoding='utf-8') as fh:
    lang = fh.read()
slugs = re.findall(r"slug:\s*'([^']+)'", lang)
print('language.js slugs:', slugs)
match = all(('data-case="case-%02d"' % i) in open(r'D:\大叔云页\case-%02d.html' % i, encoding='utf-8').read() for i in range(1, 7))
print('6 个详情页 data-case 与 slug 一一匹配:', match)
