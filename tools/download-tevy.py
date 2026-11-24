import urllib.request,hashlib,json
from pathlib import Path
root=Path.home()/'Downloads'/'rizet-g5-r'/'art-assets'/'g5-r'/'tevy';root.mkdir(parents=True,exist_ok=True)
items=['desktop-monitor','mechanical-keyboard','office-chair']
for name in items:
 u=f'https://tevy.dev/models/{name}/v1/lod0.glb'
 try:
  req=urllib.request.Request(u,headers={'User-Agent':'rizet-g5-r-art-study/1.0'})
  with urllib.request.urlopen(req,timeout=35) as r:b=r.read()
  assert b[:4]==b'glTF' and len(b)>1000
  (root/(name+'.glb')).write_bytes(b)
  print('OK',name,len(b),hashlib.sha256(b).hexdigest(),flush=True)
 except Exception as e:print('FAIL',name,str(e),flush=True)
