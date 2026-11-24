"""G5-R proportion and hero-object test, independent of deployed website.
Requires Blender 5.2+ for Meshopt. Loads the previous PBR art master,
resizes the studio to physically plausible desk/furniture dimensions, adds
a CC0 engineered monitor, keyboard and office chair; captures art proofs.
"""
from pathlib import Path
import bpy,math
from mathutils import Vector,Matrix
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'art-assets'/'g5-r'
OUT=ROOT/'docs'/'art'/'g5-r'
bpy.ops.wm.open_mainfile(filepath=str(CACHE/'workbench-production.blend'))
sc=bpy.context.scene
def V(x,y,z):return Vector((x,-z,y))
# Previous G5 desk is 4.6m wide; reduce its authored greybox physical
# dimensions independently of high quality 1:1 Poly Haven furniture.
S=Matrix.Diagonal((.55,.55,.80,1.))
def is_asset(o):
 while o:
  if o.name.startswith('ASSET__') or o.name.startswith('PRODUCT__'):return True
  o=o.parent
 return False
moved=[]
for o in bpy.data.objects:
 if o.parent is None and (o.type=='MESH' or o.type=='LIGHT') and not is_asset(o):
  o.matrix_world=S@o.matrix_world;moved.append(o.name)
  if o.type=='LIGHT' and o.data.type=='AREA':
   o.data.size*=.70
   if o.data.shape=='RECTANGLE':o.data.size_y*=.70
print('RESCALED',len(moved),flush=True)
# Re-stage each professional model at the new 2.53m-wide desk dimensions.
placements={
'modern_arm_chair_01':((-2.28,0,.86),(-2.6,0,.70)),
'desk_lamp_arm_01':((1.75,1.025,-.62),(.93,.79,-.30)),
'modern_wooden_cabinet':((-4.2,0,-3.8),(-2.28,0,-2.10)),
'mid_century_lounge_chair':((4.8,0,3.5),(2.6,0,1.85)),
'ceramic_vase_01':((-5.95,.98,2.3),(-.98,.79,-.26))}
for k,(old,new) in placements.items():
 o=bpy.data.objects.get('ASSET__'+k);assert o,k
 o.matrix_world.translation += V(*new)-V(*old)
 # Only one seat is used as a workstation chair in this proof.
 if k in ('modern_arm_chair_01','mid_century_lounge_chair'):
  for child in [o]+list(o.children_recursive):child.hide_render=True
# The old primitive monitor/keyboard now have professionally authored geometry.
for o in bpy.data.objects:
 if any(o.name.startswith(x) for x in ('LAB_Actape','Keyboard case','Keycap','Spacebar')):
  o.hide_render=True
def bbox(objects):
 points=[o.matrix_world@Vector(c) for o in objects if o.type=='MESH' for c in o.bound_box]
 return Vector((min(v[i] for v in points) for i in range(3))),Vector((max(v[i] for v in points) for i in range(3)))
def import_product(id,loc,target_height,yaw=0):
 filepath=CACHE/'tevy'/(id+'-blender.glb')
 before=set(bpy.data.objects)
 bpy.ops.import_scene.gltf(filepath=str(filepath))
 objects=set(bpy.data.objects)-before
 roots=[o for o in objects if o.parent not in objects]
 meshes=[o for o in objects if o.type=='MESH']
 mn,mx=bbox(meshes);dims=mx-mn
 assert dims.z>0 and meshes
 p=bpy.data.objects.new('PRODUCT__'+id,None);bpy.context.collection.objects.link(p)
 for o in roots:
  mat=o.matrix_world.copy();o.parent=p;o.matrix_world=mat
 factor=target_height/dims.z
 pivot=Vector(((mn.x+mx.x)*.5,(mn.y+mx.y)*.5,mn.z))
 p.matrix_world=(Matrix.Translation(V(*loc)) @ Matrix.Rotation(math.radians(-yaw),4,'Z') @
    Matrix.Scale(factor,4) @ Matrix.Translation(-pivot))
 for o in meshes:
  o.hide_render=False
 print('PRODUCT',id,'meshes',[(o.name, [m.name for m in o.data.materials]) for o in meshes],
       'dimensions',tuple(round(v,3) for v in dims),'scale',round(factor,2),flush=True)
 return p,meshes
monitor,monitor_parts=import_product('desktop-monitor',(-.12,.79,-.24),.66,0)
keyboard,keyboard_parts=import_product('mechanical-keyboard',(-.16,.82,.21),.055,180)
# The screen is a separate two-triangle authored mesh, so we can use a real
# product screenshot rather than inventing a new UI or approximating pixels.
from PIL import Image
img=Image.open(ROOT/'assets'/'actape-windows-preview.png').convert('RGB')
img.thumbnail((1424,794),Image.Resampling.LANCZOS)
canvas=Image.new('RGB',(1440,810),(24,27,25))
canvas.paste(img,((1440-img.width)//2,(810-img.height)//2))
padded=CACHE/'actape-true-ui.png';canvas.save(padded)
screenmat=next(m for o in monitor_parts for m in o.data.materials if 'screen' in m.name.lower())
screenmat.use_nodes=True
nodes=screenmat.node_tree.nodes;links=screenmat.node_tree.links
pbr=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
imgnode=nodes.new('ShaderNodeTexImage');imgnode.image=bpy.data.images.load(str(padded),check_existing=True)
imgnode.image.colorspace_settings.name='sRGB'
for inp in ('Base Color','Emission Color'):
 for link in list(pbr.inputs[inp].links):links.remove(link)
 links.new(imgnode.outputs['Color'],pbr.inputs[inp])
pbr.inputs['Emission Strength'].default_value=.75
pbr.inputs['Metallic'].default_value=0
pbr.inputs['Roughness'].default_value=.34
print('REAL_UI_ATTACHED',screenmat.name,len(monitor_parts),flush=True)

officechair,chair_parts=import_product('office-chair',(-.6,0,-.91),1.05,0)
# Mobile OS actual images remain on the original portrait display.
# The new main monitor is a clean blank industrial design object here, not a
# fabricated product interface. Product screenshots are provided separately.
for name,energy in [('Window key',680),('Soft ceiling bounce',82),
                    ('Camera fill',38),('Warm desk practical',40)]:
 o=bpy.data.objects.get(name)
 if o:o.data.energy=energy
sc.view_settings.exposure=.12
# Enable the local RTX device explicitly for each isolated bpy process.
try:
  prefs=bpy.context.preferences.addons['cycles'].preferences
  prefs.compute_device_type='OPTIX';prefs.get_devices()
  chosen=[d for d in prefs.devices if d.type=='OPTIX']
  for d in prefs.devices:d.use=d.type=='OPTIX'
  if chosen:
    sc.cycles.device='GPU'
    print('GPU_OPTIX',[d.name for d in chosen],flush=True)
except Exception as e:print('CPU_FALLBACK',e,flush=True)
sc.cycles.samples=80
camera=sc.camera
def render(name,loc,look,lens,w,h):
 camera.location=V(*loc)
 camera.rotation_euler=(V(*look)-camera.location).to_track_quat('-Z','Y').to_euler()
 camera.data.lens=lens;camera.data.dof.use_dof=True
 camera.data.dof.focus_distance=(V(*look)-camera.location).length
 camera.data.dof.aperture_fstop=4.5
 sc.render.resolution_x=w;sc.render.resolution_y=h;sc.render.resolution_percentage=100
 sc.render.image_settings.file_format='JPEG';sc.render.image_settings.quality=93
 sc.render.filepath=str(OUT/(name+'.jpg'))
 bpy.ops.render.render(write_still=True)
 print('PHOTO',name,(OUT/(name+'.jpg')).stat().st_size,flush=True)
bpy.ops.file.pack_all()
bpy.context.preferences.filepaths.save_version=0
file=CACHE/'workbench-scaled.blend';bpy.ops.wm.save_as_mainfile(filepath=str(file))
print('SCALED_ART_MASTER',file.stat().st_size,flush=True)
render('workbench-v3-cinema',(2.25,1.64,2.9),(-.06,1.13,-.26),52,1600,1050)
render('workbench-v3-architecture',(3.4,2.4,4.0),(-.25,1.2,-.60),36,1500,1020)
