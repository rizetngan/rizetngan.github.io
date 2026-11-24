"""G5-R live GLB export (curated art master, separate collision proxies)."""
import bpy,math,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
src=ROOT/'art-assets'/'g5-r'/'atelier-final-g5r.blend'
out=ROOT/'assets'/'g5r'/'studio.glb'
bpy.ops.wm.open_mainfile(filepath=str(src))
for name,new in [
    ('SCREEN__actape','LAB_Actape_screen'),
    ('Low smoked sideboard','NOTES_Sideboard'),
    ('Wall art deep mat','ABOUT_WallArt')]:
    o=bpy.data.objects.get(name)
    if o:o.name=new
def col(name,pos,dim):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(pos[0],-pos[2],pos[1]))
    o=bpy.context.object;o.name='COL_'+name
    o.dimensions=(dim[0],dim[2],dim[1])
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    m=bpy.data.materials.new('Invisible collider material');m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(.01,.01,.01,1)
    p.inputs['Alpha'].default_value=.006
    m.blend_method='BLEND'
    o.data.materials.append(m)
    return o
col('RearWall',(0,1.9,-3.87),(9.2,3.8,.12))
col('EastWall',(4.43,1.9,0),(.12,3.8,11))
col('WestWall',(-4.43,1.9,0),(.12,3.8,11))
col('FrontRoom',(0,1.9,5.45),(9.2,3.8,.12))
col('Worktop',(0,.746,0),(2.45,.09,1.23))
bpy.ops.object.select_all(action='DESELECT')
chosen=[]
for o in bpy.data.objects:
    if o.type=='MESH' and (not o.hide_render or o.name.startswith('COL_')):
        o.select_set(True);chosen.append(o)
print('EXPORT_MESHES',len(chosen),'hidden',len([o for o in bpy.data.objects if o.type=='MESH' and o.hide_render]),flush=True)
assert 85<len(chosen)<170
bpy.context.view_layer.objects.active=chosen[0]
bpy.ops.export_scene.gltf(
    filepath=str(out),export_format='GLB',use_selection=True,
    export_animations=False,export_cameras=False,export_lights=False,
    export_yup=True,export_texcoords=True,export_normals=True,
    export_materials='EXPORT')
print('GLB',out,out.stat().st_size,flush=True)
