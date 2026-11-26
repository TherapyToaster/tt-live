#!/usr/bin/env python3
"""Insert the neon-lock snippet into a Home MAIN file (idempotent). usage: apply.py in.txt out.txt"""
import sys,os
src=open(sys.argv[1],encoding='utf-8').read()
snip=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'neon-lock-snippet.html'),encoding='utf-8').read()
if 'tt-neon-lock START' in src: print('already present'); open(sys.argv[2],'w',encoding='utf-8').write(src); sys.exit(0)
a='<!-- tt-home-extras END -->'
assert src.count(a)==1, src.count(a)
open(sys.argv[2],'w',encoding='utf-8').write(src.replace(a,snip+a))
print('inserted')
