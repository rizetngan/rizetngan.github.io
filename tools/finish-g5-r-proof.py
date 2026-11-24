"""Second-step art direction on the Blender G5-R true-scale stage.
Makes the authored main display show a real Actape screenshot; keeps its
professional monitor mesh and treats it as a luminous LCD.
"""
from pathlib import Path
import bpy,math
from mathutils import Vector,Matrix
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'art-assets'/'g5-r'
OUT=ROOT/'docs'/'art'/'g5-r'
bpy.ops.wm.open_mainfile(filepath=str(CACHE/'workbench-scaled.blend'))
sc=bpy.context.scene
def V(x,y,z):return Vector((x,-z,y))
def set_pbr(name,rgb,metal,rough):
 m=bpy.data.materials.get(name);assert m,name
 bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 for link in list(bs.inputs['Base Color'].links):m.node_tree.links.remove(link)
 bs.inputs['Base Color'].default_value=(*rgb,1)
 bs.inputs['Metallic'].default_value=metal
 bs.inputs['Roughness'].default_value=rough
 print('MATERIAL',name,flush=True)
set_pbr('monitor',(.17,.19,.18),.68,.30)
set_pbr('office_chair',(.055,.085,.067),.08,.78)
screen=bpy.data.objects.get('screen');assert screen
print('SCREEN',screen.location[:],screen.data.polygons[0].normal[:],flush=True)
screen_orig=screen
overlay=screen_orig.copy();overlay.data=screen_orig.data.copy();overlay.name='Actape_LCD_emission';bpy.context.collection.objects.link(overlay)
# Screen front is local -Y, shift toward camera and clear the glass cover.
overlay.location.y-=.035
# The imported compressed source's screen plane contains no TEXCOORD_0.
# Explicitly build UVs from its physical x/z extent before sampling real UI.
bpy.context.view_layer.update()
mesh=overlay.data
layer=mesh.uv_layers.active or mesh.uv_layers.new(name='ActualScreenUV')
positions=[overlay.matrix_world @ v.co for v in mesh.vertices]
minx,maxx=min(p.x for p in positions),max(p.x for p in positions)
minz,maxz=min(p.z for p in positions),max(p.z for p in positions)
assert maxx-minx>.1 and maxz-minz>.1,(minx,maxx,minz,maxz)
for poly in mesh.polygons:
 for li in poly.loop_indices:
  vertex=positions[mesh.loops[li].vertex_index]
  layer.data[li].uv=((vertex.x-minx)/(maxx-minx),(vertex.z-minz)/(maxz-minz))
print('REAL_SCREEN_UV',[(tuple(round(v,3) for v in x.uv)) for x in layer.data],flush=True)

im=bpy.data.images.get('actape-true-ui.png')
assert im,[(x.name,x.filepath) for x in bpy.data.images]
m=bpy.data.materials.new('Real Actape UI / emissive LCD');m.use_nodes=True
nd=m.node_tree.nodes;nd.clear()
t=nd.new('ShaderNodeTexImage');t.image=im
emit=nd.new('ShaderNodeEmission');emit.inputs['Strength'].default_value=.86
out=nd.new('ShaderNodeOutputMaterial')
m.node_tree.links.new(t.outputs['Color'],emit.inputs['Color'])
m.node_tree.links.new(emit.outputs['Emission'],out.inputs['Surface'])
overlay.data.materials.clear();overlay.data.materials.append(m)
screen_orig.hide_render=True
# Blackish graphite keys, no dangling high-visibility keyboard cable.
for o in bpy.data.objects:
 if o.name=='cable':o.hide_render=True
kb=bpy.data.objects.get('PRODUCT__mechanical-keyboard')
assert kb
kb.matrix_world.translation+=V(0,0,.22)
sc.cycles.samples=84
prefs=bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type='OPTIX';prefs.get_devices()
for d in prefs.devices:d.use=d.type=='OPTIX'
sc.cycles.device='GPU'
camera=sc.camera
def render(name,loc,look,lens,w,h):
 camera.location=V(*loc)
 camera.rotation_euler=(V(*look)-camera.location).to_track_quat('-Z','Y').to_euler()
 camera.data.lens=lens;camera.data.dof.use_dof=True
 camera.data.dof.focus_distance=(V(*look)-camera.location).length
 camera.data.dof.aperture_fstop=5.2
 sc.render.resolution_x=w;sc.render.resolution_y=h;sc.render.resolution_percentage=100
 sc.render.image_settings.file_format='JPEG';sc.render.image_settings.quality=92
 sc.render.filepath=str(OUT/(name+'.jpg'))
 bpy.ops.render.render(write_still=True)
 print('PHOTO',name,(OUT/(name+'.jpg')).stat().st_size,flush=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(CACHE/'workbench-v4.blend'))
render('workbench-v4-editorial',(2.32,1.62,2.86),(-.05,1.14,-.23),52,1600,1060)
render('workbench-v4-closeup',(1.14,1.46,1.88),(-.12,1.21,-.27),67,1440,960)
