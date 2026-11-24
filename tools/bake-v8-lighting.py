"""Bake actual Cycles diffuse indirect + AO on planar receivers.
Source: browser-exported static AABB proxy geometry; deliberately not a
whole-scene per-mesh lightmap bake. Exact world-space mapping at runtime.
"""
import bpy, math, json, numpy as np
from pathlib import Path
from mathutils import Vector
from PIL import Image,ImageFilter
root=Path(__file__).resolve().parents[1];out=root/'assets/v8'
data=json.loads((out/'bake-proxies.json').read_text())
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.samples=48
sc.cycles.use_denoising=True
sc.cycles.diffuse_bounces=3;sc.cycles.max_bounces=5
try:
 p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='OPTIX';p.get_devices()
 for d in p.devices:d.use=d.type=='OPTIX'
 if any(d.type=='OPTIX' for d in p.devices):sc.cycles.device='GPU'
except Exception as e:print('CPU',e)
print('DEVICE',sc.cycles.device,flush=True)
def V(x,y,z):return (x,-z,y)
materials={}
def mat(c):
 c=tuple(round(max(.04,min(.8,v)),2) for v in c)
 if c not in materials:
  m=bpy.data.materials.new('Proxy diffuse');m.use_nodes=True
  m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(*c,1)
  m.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.86
  materials[c]=m
 return materials[c]
for i,o in enumerate(data['objects']):
 a,b=o['min'],o['max'];d=[y-x for x,y in zip(a,b)]
 # An arch AABB would close the doorway; sloped rafters' bounding boxes
 # would cast inaccurate silhouettes. They are omitted in this proxy bake.
 if d[0]>4.5 and a[2]>7 and b[1]>3.5:continue
 if 'rafter' in o['name'].lower():continue
 if d[0]>3.9 and a[2]>7.8 and b[1]>3.5:continue
 if a[1]<.02 and b[1]<.08:continue
 p=[(a[k]+b[k])/2 for k in range(3)]
 bpy.ops.mesh.primitive_cube_add(size=1,location=V(*p))
 ob=bpy.context.object;ob.name='Proxy_'+str(i)+'_'+o['name'];ob.dimensions=(d[0],d[2],d[1])
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 ob.data.materials.append(mat(o['color']))
# True shadow aperture, instead of solid bounding box of arch.
for sign in [-1,1]:
 bpy.ops.mesh.primitive_cube_add(size=1,location=V(sign*2.44,.89,7.73))
 ob=bpy.context.object;ob.dimensions=(.35,1.78,.58);ob.data.materials.append(mat((.35,.18,.12)))
 for i in range(18):
  t=(i+.5)*math.pi/18
  if (sign==-1 and t<math.pi/2) or (sign==1 and t>=math.pi/2):continue
  p=(2.44*math.cos(t),1.78+2.44*math.sin(t),7.73)
  bpy.ops.mesh.primitive_cube_add(size=1,location=V(*p));ob=bpy.context.object
  ob.dimensions=(.45,.58,.35);ob.rotation_euler.y=-t;ob.data.materials.append(mat((.35,.18,.12)))
world=bpy.data.worlds.new('Soft studio bounce');sc.world=world;world.use_nodes=True
bg=world.node_tree.nodes.get('Background');bg.inputs['Color'].default_value=(.68,.72,.77,1);bg.inputs['Strength'].default_value=.28
sun=bpy.data.lights.new('Window sunlight','SUN');sun.energy=2.0;sun.angle=.07;sun.color=(1,.83,.67)
o=bpy.data.objects.new('Window sunlight',sun);bpy.context.collection.objects.link(o)
o.rotation_euler=Vector(V(12,-10,-5)).to_track_quat('-Z','Y').to_euler()
# Receiving planes: UV bottom corresponds to world +Z, matching Three's plane.
def receiver(name,x0,x1,z0,z1,y):
 mesh=bpy.data.meshes.new(name);mesh.from_pydata([V(x0,y,z1),V(x1,y,z1),V(x1,y,z0),V(x0,y,z0)],[],[(0,1,2,3)]);mesh.update()
 uv=mesh.uv_layers.new()
 for i,xy in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=xy
 ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob)
 m=bpy.data.materials.new(name);m.use_nodes=True;m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.6,.6,.6,1)
 mesh.materials.append(m)
 return ob,m
floor, fm=receiver('Floor receiver',-7,7,1.8-17.85/2,1.8+17.85/2,.031)
desk, dm=receiver('Desktop receiver',-2.3,2.3,-1.1,1.1,1.032)
# Wall-facing receiver: same physical display wall, x/y UV projection.
mesh=bpy.data.meshes.new('Gallery receiver')
mesh.from_pydata([V(-7.2,0,-5.245),V(7.2,0,-5.245),V(7.2,4.8,-5.245),V(-7.2,4.8,-5.245)],[],[(0,1,2,3)]);mesh.update()
uv=mesh.uv_layers.new()
for i,xy in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=xy
rear=bpy.data.objects.new('Gallery receiver',mesh);bpy.context.collection.objects.link(rear)
rm=bpy.data.materials.new('Gallery receiver');rm.use_nodes=True
rm.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.6,.6,.6,1)
mesh.materials.append(rm)

# Render each pass to float image; encode linear data explicitly for Three.js.
def bake(ob,m,key,kind,w,h):
 bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
 image=bpy.data.images.new(key+'-'+kind,width=w,height=h,alpha=False,float_buffer=True)
 image.colorspace_settings.name='Non-Color'
 tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image;m.node_tree.nodes.active=tex
 sc.render.bake.use_clear=True;sc.render.bake.margin=6;sc.render.bake.target='IMAGE_TEXTURES'
 if kind=='indirect':
  sc.render.bake.use_pass_direct=False;sc.render.bake.use_pass_indirect=True;sc.render.bake.use_pass_color=False
  bpy.ops.object.bake(type='DIFFUSE')
 else:bpy.ops.object.bake(type='AO')
 p=np.asarray(image.pixels[:],dtype=np.float32).reshape(h,w,4)[::-1,:,:3].copy()
 if kind=='ao':p=np.clip(p,0,1)
 else:p=np.clip(p,0,1)
 assert np.isfinite(p).all() and p.max()>.01 and p.std()>.001,(key,kind,p.max(),p.std())
 Image.fromarray(np.uint8(p*255+.5),'RGB').filter(ImageFilter.GaussianBlur(.85 if kind=='indirect' else .5)).save(out/(key+'-'+kind+'.png'),optimize=True)
 print('BAKED',key,kind,'size',w,h,'min/mean/max/std',float(p.min()),float(p.mean()),float(p.max()),float(p.std()),flush=True)
 m.node_tree.nodes.remove(tex);bpy.data.images.remove(image)
for ob,m,key,w,h in [(floor,fm,'floor',512,640),(desk,dm,'desk',512,256),(rear,rm,'rear',768,256)]:
 for kind in ['ao','indirect']:bake(ob,m,key,kind,w,h)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(root.parent/'rizet-v8-bake.blend'))
print('BAKE_COMPLETE',flush=True)
