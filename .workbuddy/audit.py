# -*- coding: utf-8 -*-
"""大叔云页 全站体检脚本：HTML 结构 / 引用完整性 / 资源体积 / 死属性"""
import os, re, json, html
from html.parser import HTMLParser

ROOT = r"D:\大叔云页"
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}

class Checker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []   # (line, msg)
        self.ids = {}      # id -> [lines]
        self.attrs = []    # data-page-node-id / data-i18n occurrences
        self.imgs = []
        self.links = []
        self.audios = []
        self.scripts = []
        self.metas = {}
        self.h1 = 0
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if "id" in d and d["id"]:
            self.ids.setdefault(d["id"], []).append(self.getpos()[0])
        if "data-page-node-id" in d or "data-i18n" in d:
            self.attrs.append((self.getpos()[0], tag, [k for k in d if k in ("data-page-node-id","data-i18n")]))
        if tag == "img":
            self.imgs.append((self.getpos()[0], d.get("src",""), d.get("alt")))
        if tag == "link" and d.get("rel") in ("stylesheet","icon","preload"):
            self.links.append((self.getpos()[0], d.get("href",""), d.get("rel")))
        if tag in ("audio","source") and d.get("src"):
            self.audios.append((self.getpos()[0], d.get("src")))
        if tag == "script" and d.get("src"):
            self.scripts.append((self.getpos()[0], d.get("src")))
        if tag == "meta":
            self.metas[d.get("name") or d.get("property") or d.get("charset","?")] = d.get("content","")
        if tag == "h1":
            self.h1 += 1
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))
    def handle_endtag(self, tag):
        if tag in VOID: return
        if not self.stack:
            self.errors.append((self.getpos()[0], f"多余的闭合标签 </{tag}>"))
            return
        if self.stack[-1][0] == tag:
            self.stack.pop()
        else:
            # 找栈里有没有
            names = [t for t,_ in self.stack]
            if tag in names:
                while self.stack and self.stack[-1][0] != tag:
                    t, ln = self.stack.pop()
                    self.errors.append((self.getpos()[0], f"标签 <{t}> (line {ln}) 未闭合，被 </{tag}> 隐式关闭"))
                if self.stack: self.stack.pop()
            else:
                self.errors.append((self.getpos()[0], f"闭合标签 </{tag}> 无对应开始标签"))

def human(n):
    return f"{n/1024:.0f}KB" if n < 1024*1024 else f"{n/1048576:.2f}MB"

pages = [f for f in os.listdir(ROOT) if f.endswith(".html")]
report = {"pages": {}, "refs": {}, "sizes": {}}

# 1) 资源体积
total = 0
for dirpath, dirs, files in os.walk(os.path.join(ROOT, "assets")):
    for f in files:
        p = os.path.join(dirpath, f)
        s = os.path.getsize(p)
        total += s
        if s > 500*1024:
            report["sizes"][os.path.relpath(p, ROOT)] = human(s)
report["sizes"]["assets 总计"] = human(total)

all_ids_dup = {}
for pg in sorted(pages):
    path = os.path.join(ROOT, pg)
    with open(path, encoding="utf-8", errors="replace") as fh:
        text = fh.read()
    c = Checker()
    c.feed(text); c.close()
    left = [(t, ln) for t, ln in c.stack if t != "html"]
    issues = []
    for ln, msg in c.errors:
        issues.append(f"  L{ln}: {msg}")
    for t, ln in left:
        issues.append(f"  L{ln}: <{t}> 到文件结束仍未闭合")
    for i, lines in c.ids.items():
        if len(lines) > 1:
            issues.append(f"  重复 id: {i} 出现于行 {lines}")
            all_ids_dup.setdefault(pg, []).append(i)
    for ln, tag, ks in c.attrs[:20]:
        issues.append(f"  L{ln}: <{tag}> 残留死属性 {ks}")
    if c.h1 > 1:
        issues.append(f"  h1 数量 = {c.h1}")
    if "title" not in [k.lower() for k in c.metas]:
        pass
    report["pages"][pg] = {"issues": issues, "metas": c.metas, "imgs": len(c.imgs)}

    # 收集引用
    for m in re.finditer(r'(?:src|href)\s*=\s*["\']([^"\']+)["\']', text):
        u = m.group(1)
        if u.startswith(("http", "//", "mailto:", "tel:", "#", "javascript:", "data:")):
            if u.startswith("http") or u.startswith("//"):
                report["refs"].setdefault("external", []).append((pg, u))
            continue
        report["refs"].setdefault("local", []).append((pg, u))

# 2) 引用存在性
missing = []
for pg, u in report["refs"].get("local", []):
    target = os.path.normpath(os.path.join(ROOT, u.split("?")[0].split("#")[0].replace("/", os.sep)))
    if not os.path.exists(target):
        missing.append((pg, u))

# 3) 输出
print("=" * 60)
print("【资源体积 >500KB】")
for k, v in report["sizes"].items():
    print(f"  {k}: {v}")
print()
print("【HTML 结构问题】")
for pg, info in report["pages"].items():
    n = len(info["issues"])
    print(f"{pg}: {'OK' if n == 0 else str(n) + ' 个问题'}")
    for i in info["issues"]:
        print(i)
print()
print("【缺失的本地引用】")
if not missing:
    print("  无")
for pg, u in missing:
    print(f"  {pg} -> {u}")
print()
print("【外部资源 URL】")
ext = report["refs"].get("external", [])
if not ext:
    print("  无")
seen = set()
for pg, u in ext:
    if u not in seen:
        seen.add(u)
        print(f"  {pg}: {u}")
print()
print("【meta title/description 缺失检查】")
for pg, info in report["pages"].items():
    miss = [k for k in ("description",) if k not in info["metas"]]
    if miss:
        print(f"  {pg}: 缺 {miss}")
