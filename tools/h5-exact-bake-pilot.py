"""H5 production pipeline pilot: exact V8 triangle geometry, not final H5 art.
Independent nonoverlapping light UV and actual Cycles AO / indirect on tabletop.
"""
import bpy, json, math, numpy as np
from pathlib import Path
from mathutils import Vector
from PIL import Image,ImageFilter
home=Path.home()/'Downloads';out=home/'rizet-h5-art'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(out/'v8-exact-reference.glb'))
sc=bpy.context.scene
meshes=[o for o in sc.objects if o.type=='MESH']
print('IMPORTED',len(meshes),'triangles',sum(len(o.data.polygons) for o in meshes),flush=True)
desk=next(o for o in meshes if o.name.startswith('DeskSurface__'))
print('DESK',desk.name,len(desk.data.vertices),len(desk.data.polygons),[u.name for u in desk.data.uv_layers],flush=True)
# Genuine physical lights. Preserve geometry/materials as a baseline sample.
world=bpy.data.worlds.new('H5 soft ambient');sc.world=world;world.use_nodes=True
n=world.node_tree.nodes;bg=n.get('Background')
bg.inputs['Color'].default_value=(.72,.77,.82,1);bg.inputs['Strength'].default_value=.27
def light(name,typ,pos,look,energy,color,size=4):
 d=bpy.data.lights.new(name,typ);d.energy=energy;d.color=color
 o=bpy.data.objects.new(name,d);sc.collection.objects.link(o);o.location=pos
 o.rotation_euler=(Vector(look)-o.location).to_track_quat('-Z','Y').to_euler()
 if typ=='AREA':d.shape='RECTANGLE';d.size=size;d.size_y=size*.76
 return o
light('Warm side window','AREA',(-7, -2.5,5.5),(0,0,1.0),1300,(1,.86,.7),4.2)
light('Reflected sky','AREA',(2,-4,5),(0,0,1),160,(.8,.9,1),5)
sun=light('Afternoon sun','SUN',(-8,-4,7),(0,0,0),1.5,(1,.86,.69));sun.data.angle=.042
sc.render.engine='CYCLES';sc.cycles.samples=48;sc.cycles.use_denoising=True
sc.cycles.max_bounces=6;sc.cycles.diffuse_bounces=4
prefs=bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type='OPTIX';prefs.get_devices()
for d in prefs.devices:d.use=d.type=='OPTIX'
if any(d.type=='OPTIX' for d in prefs.devices):sc.cycles.device='GPU'
print('DEVICE',sc.cycles.device,flush=True)
# Preserve surface UV and author a separate, nonoverlapping lightmap atlas.
bpy.ops.object.select_all(action='DESELECT');desk.select_set(True);bpy.context.view_layer.objects.active=desk
baseUV=desk.data.uv_layers[0].name
desk.data.uv_layers.new(name='H5_LIGHTMAP');desk.data.uv_layers.active_index=len(desk.data.uv_layers)-1
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.remove_doubles(threshold=.00001)
bpy.ops.uv.smart_project(angle_limit=math.radians(60),island_margin=.025)
bpy.ops.object.mode_set(mode='OBJECT')
desk.data.uv_layers.active_index=desk.data.uv_layers.find('H5_LIGHTMAP');desk.data.uv_layers['H5_LIGHTMAP'].active_render=True
print('UV_ACTIVE',desk.data.uv_layers.active.name,len(desk.data.uv_layers.active.data),flush=True)
# Keep original texture samples tied to original UV rather than active light UV.
for mat in desk.data.materials:
 if not mat or not mat.use_nodes:continue
 ns=mat.node_tree.nodes;links=mat.node_tree.links
 old_uv=ns.new('ShaderNodeUVMap');old_uv.uv_map=baseUV
 for tex in list(ns):
  if tex.type=='TEX_IMAGE' and not tex.inputs['Vector'].is_linked:links.new(old_uv.outputs['UV'],tex.inputs['Vector'])
def bake(kind):
 im=bpy.data.images.new('H5_'+kind,512,512,alpha=False,float_buffer=True)
 im.colorspace_settings.name='Non-Color'
 nodes=[]
 for mat in desk.data.materials:
  if not mat or not mat.use_nodes:continue
  t=mat.node_tree.nodes.new('ShaderNodeTexImage');t.image=im;mat.node_tree.nodes.active=t;nodes.append((mat,t))
 sc.render.bake.use_clear=True;sc.render.bake.margin=12
 sc.render.bake.use_pass_direct=False;sc.render.bake.use_pass_indirect=True;sc.render.bake.use_pass_color=False
 bpy.ops.object.bake(type='DIFFUSE' if kind=='indirect' else 'AO',uv_layer='H5_LIGHTMAP')
 px=np.asarray(im.pixels[:],np.float32).reshape(512,512,4)[::-1,:,:3].copy()
 assert np.isfinite(px).all() and px.std()>.001 and px.max()>.01,(kind,px.max(),px.std())
 png=out/('exact-desk-'+kind+'.png')
 Image.fromarray(np.uint8(np.clip(px,0,1)*255+.5)).save(png,optimize=True)
 im.filepath_raw=str(out/('exact-desk-'+kind+'.exr'));im.file_format='OPEN_EXR';im.save()
 print('EXACT_BAKE',kind, 'mean',float(px.mean()),'std',float(px.std()),'max',float(px.max()),'png',png.stat().st_size,flush=True)
 for mat,t in nodes:mat.node_tree.nodes.remove(t)
for kind in ['ao','indirect']:bake(kind)
# Save source with both UV maps. No alteration to production web files.
desk.data.uv_layers.active=desk.data.uv_layers.get(baseUV);desk.data.uv_layers.get(baseUV).active_render=True
sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
bpy.ops.file.pack_all();bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(out/'h5-exact-bake-pilot.blend'))
print('PILOT_COMPLETE',flush=True)
