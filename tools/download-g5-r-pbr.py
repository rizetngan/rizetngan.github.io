from pathlib import Path
import json,urllib.request,hashlib,concurrent.futures,time
root=Path(__file__).resolve().parents[1]/'art-assets'/'g5-r'
root.mkdir(parents=True,exist_ok=True)
h={'User-Agent':'rizetngan-g5-art-production/1.0'}
def get(u):
 for i in range(3):
  try:return urllib.request.urlopen(urllib.request.Request(u,headers=h),timeout=45).read()
  except Exception:
   if i==2:raise
   time.sleep(2+i*2)
targets=[]
for id in ['smoked_walnut_veneer','painted_plaster_wall']:
 data=json.loads(get('https://api.polyhaven.com/files/'+id))
 for typ in ['Diffuse','nor_gl','Rough']:
  if typ not in data:continue
  meta=data[typ]['2k']['jpg']
  targets.append((root/'materials'/f'{id}_{typ}_2k.jpg',meta))
def grab(args):
 dst,m=args;dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists() and hashlib.md5(dst.read_bytes()).hexdigest()==m['md5']:return(dst.name,dst.stat().st_size)
 b=get(m['url']);assert hashlib.md5(b).hexdigest()==m['md5']
 dst.write_bytes(b)
 return(dst.name,len(b))
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 for future in concurrent.futures.as_completed([pool.submit(grab,x) for x in targets]):print('PBR',future.result(),flush=True)
