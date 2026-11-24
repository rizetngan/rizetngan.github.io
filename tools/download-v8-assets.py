"""Download real CC0 Poly Haven assets, verify original MD5 and convert to GLB."""
from pathlib import Path
import urllib.request,json,hashlib,concurrent.futures,subprocess
root=Path(__file__).resolve().parents[1];cache=root.parent/'rizet-v8-art-cache';cache.mkdir(exist_ok=True)
cli=root.parent/'rizet-g5-r/art-assets/g5-r/tevy/node_modules/.bin/gltf-transform.cmd'
headers={'User-Agent':'rizet-v8-asset-pass/1.0'}
def get(u):return urllib.request.urlopen(urllib.request.Request(u,headers=headers),timeout=30).read()
def load(u):return json.loads(get(u))
items={'potted_plant_04':'plant','book_encyclopedia_set_01':'books','binder_notebook':'notebook'}
def fetch(pair):
 id,n=pair;meta=load('https://api.polyhaven.com/info/'+id);f=load('https://api.polyhaven.com/files/'+id)['gltf']['1k']['gltf']
 d=cache/id;d.mkdir(exist_ok=True)
 for rel,item in [(id+'_1k.gltf',f)]+list(f['include'].items()):
  p=d/rel;p.parent.mkdir(parents=True,exist_ok=True)
  b=p.read_bytes() if p.exists() else get(item['url']);assert hashlib.md5(b).hexdigest()==item['md5'];p.write_bytes(b)
 dest=root/'assets/v8'/(n+'.glb')
 subprocess.check_call([str(cli),'copy',str(d/(id+'_1k.gltf')),str(dest)],shell=True)
 return {'id':id,'name':meta['name'],'author':meta.get('authors'),'license':'CC0','url':'https://polyhaven.com/a/'+id,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as p:
 results=list(p.map(fetch,items.items()))
for x in results:print('ASSET',x,flush=True)
(root/'assets/v8/source-manifest.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
