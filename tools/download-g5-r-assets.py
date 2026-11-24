"""Reproducible CC0 asset manifest and MD5-verified Poly Haven downloader.
Private build cache only; never include raw 2K source assets in site automatically.
Poly Haven API ToS: powered-by credit if distributing a live API-powered browser;
this production downloader is offline, and artist credits remain in manifest.
"""
from pathlib import Path
import urllib.request,json,hashlib,os,time,concurrent.futures
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'art-assets'/'g5-r';CACHE.mkdir(parents=True,exist_ok=True)
MODELS=['modern_arm_chair_01','desk_lamp_arm_01','modern_wooden_cabinet','mid_century_lounge_chair','ceramic_vase_01']
H={'User-Agent':'rizetngan-g5-asset-production/1.0'}
def load(u):
  for attempt in range(3):
    try:
      with urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=50) as f:return f.read()
    except Exception:
      if attempt==2:raise
      time.sleep(1+attempt*3)
def info(id):return json.loads(load('https://api.polyhaven.com/info/'+id))
def files(id):return json.loads(load('https://api.polyhaven.com/files/'+id))
jobs=[];registry=[]
for id in MODELS:
 meta=info(id);r=files(id);choice=r['gltf']['2k']['gltf']
 root=CACHE/id;root.mkdir(exist_ok=True)
 jobs.append((root/(id+'_2k.gltf'),choice))
 for filename,m in choice['include'].items():
  jobs.append((root/filename,m))
 registry.append(dict(id=id,name=meta['name'],authors=meta.get('authors'),license='CC0',page='https://polyhaven.com/a/'+id,polycount=meta.get('polycount'),dimensions_mm=meta.get('dimensions'),resolution='2k',description=meta.get('description','')))
# Poly Haven Studio HDRI for reflection + broad softboxes; can keep offline only
hdri='poly_haven_studio'
r=files(hdri);print('HDRI_MAP',[(fmt,tuple(v.keys())) for fmt,v in r['hdri']['4k'].items()],flush=True)
choice=r['hdri']['4k'].get('hdr')
if choice:
 jobs.append((CACHE/'poly_haven_studio_4k.hdr',choice))
 meta=info(hdri);registry.append(dict(id=hdri,name=meta.get('name'),authors=meta.get('authors'),license='CC0',page='https://polyhaven.com/a/'+hdri,resolution='4k',description=meta.get('description','')))
else:
 print('HDRI 4k hdr unavailable; proceed with authored area lights',flush=True)
def task(pair):
 dest,meta=pair;dest.parent.mkdir(parents=True,exist_ok=True)
 expected=meta.get('md5')
 if dest.exists() and (not expected or hashlib.md5(dest.read_bytes()).hexdigest()==expected):return(str(dest.relative_to(CACHE)),dest.stat().st_size,'cached')
 tmp=dest.with_suffix(dest.suffix+'.tmp')
 b=load(meta['url'])
 assert not expected or hashlib.md5(b).hexdigest()==expected,(dest,'bad hash')
 tmp.write_bytes(b);tmp.replace(dest)
 return(str(dest.relative_to(CACHE)),len(b),'download')
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 for result in concurrent.futures.as_completed([pool.submit(task,j) for j in jobs]):
  print('FETCHED',result.result(),flush=True)
(CACHE/'asset-manifest.json').write_text(json.dumps(registry,ensure_ascii=False,indent=2),encoding='utf-8')
print('MODEL_ASSETS',len(MODELS),'FILES',len(jobs),'TOTAL_MB',round(sum(p.stat().st_size for p in CACHE.rglob('*') if p.is_file())/1e6,2),flush=True)
