"""G5-R production proof. Source-only: imports MD5-verified CC0 Poly Haven models,
preserves full PBR, builds a Blender Cycles art master, never edits web runtime.
Run with Blender bpy Python (see tools/download-g5-r-assets.py).
"""
from pathlib import Path
import math,json
import bpy
from mathutils import Vector,Matrix
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'art-assets'/'g5-r'
OUTPUT=ROOT/'docs'/'art'/'g5-r'
OUTPUT.mkdir(parents=True,exist_ok=True)
BLEND=CACHE/'workbench-production.blend'
# The base art composition comes from the existing G5 Blender project. It is
# staging geometry only, not a claim of photoreal art assets.
BASE=ROOT.parent/'rizet-g5'/'assets'/'g5'/'atelier-g5.blend'
if BASE.exists():
    bpy.ops.wm.open_mainfile(filepath=str(BASE))
else:
    src=(ROOT/'tools'/'build-g5.py').read_text(encoding='utf-8')
    marker=src.index("render('hero'")
    exec(compile(src[:marker],str(ROOT/'tools'/'build-g5.py'),'exec'),{})
def V(x,y,z):return Vector((x,-z,y))
scene=bpy.context.scene
def hide(prefixes):
    n=0
    for o in bpy.data.objects:
        if any(o.name.startswith(s) for s in prefixes):
            o.hide_render=True;o.hide_set(True);n+=1
    print('HIDE',prefixes,n,flush=True)
hide(['Chair seat','Chair back','Chair leg','Lamp foot','Lamp upright','Lamp arm','Enamel lamp shade','Lamp diffuser','ACTAPE_','SNUG_','NOTES_','Sideboard','Drawer front'])
def bbox(objects):
    pts=[o.matrix_world@Vector(c) for o in objects if o.type=='MESH' for c in o.bound_box]
    assert pts,'model has no geometry'
    mn=Vector((min(v[i] for v in pts) for i in range(3)))
    mx=Vector((max(v[i] for v in pts) for i in range(3)))
    return mn,mx
def bring(id,xyz,h,yaw=0):
    src=CACHE/id/(id+'_2k.gltf')
    assert src.exists(),src
    original=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(src))
    objs=set(bpy.data.objects)-original
    roots=[o for o in objs if o.parent not in objs]
    meshes=[o for o in objs if o.type=='MESH']
    mn,mx=bbox(meshes);size=mx-mn
    assert size.z>0 and len(meshes)>0,(id,tuple(size))
    parent=bpy.data.objects.new('ASSET__'+id,None)
    bpy.context.collection.objects.link(parent)
    for o in roots:
        mat=o.matrix_world.copy()
        o.parent=parent
        o.matrix_world=mat
    scale=h/size.z
    pivot=Vector(((mn.x+mx.x)*.5,(mn.y+mx.y)*.5,mn.z))
    parent.matrix_world=(Matrix.Translation(V(*xyz)) @
        Matrix.Rotation(math.radians(-yaw),4,'Z') @
        Matrix.Scale(scale,4) @
        Matrix.Translation(-pivot))
    bpy.context.view_layer.update()
    for o in meshes:
        if o.type=='MESH':
            o.hide_render=False;o.visible_shadow=True
            for p in o.data.polygons:
                if len(p.vertices)>3:p.use_smooth=True
    print('ASSET',id,'meshcount',len(meshes),'src',tuple(round(x,3) for x in size),
          'target',tuple(xyz),'height',h,'scale',round(scale,3),'yaw',yaw,flush=True)
    return parent
chair=bring('modern_arm_chair_01',(-2.28,0,.86),1.0,30)
lamp=bring('desk_lamp_arm_01',(1.75,1.025,-.62),.76,-115)
cabinet=bring('modern_wooden_cabinet',(-4.2,0,-3.8),.94,12)
lounge=bring('mid_century_lounge_chair',(4.80,0,3.50),.92,-110)
vase=bring('ceramic_vase_01',(-5.95,.98,2.30),.29,10)
# Genuine PBR tabletop rather than previously tinted diffuse-only shader.
dir=CACHE/'materials'
def pbr(name,id,normal_strength):
    material=bpy.data.materials.get(name)
    assert material, name
    nodes=material.node_tree.nodes; links=material.node_tree.links
    principled=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
    def tex(channel,colorSpace):
        p=dir/(id+'_'+channel+'_2k.jpg')
        assert p.exists(),p
        node=nodes.new('ShaderNodeTexImage');node.image=bpy.data.images.load(str(p),check_existing=True)
        node.image.colorspace_settings.name=colorSpace
        node.label=id+' '+channel
        return node
    normal=tex('nor_gl','Non-Color')
    normalmap=nodes.new('ShaderNodeNormalMap');normalmap.inputs['Strength'].default_value=normal_strength
    links.new(normal.outputs['Color'],normalmap.inputs['Color'])
    links.new(normalmap.outputs['Normal'],principled.inputs['Normal'])
    rough=tex('Rough','Non-Color')
    links.new(rough.outputs['Color'],principled.inputs['Roughness'])
    if name=='Smoked walnut':
        diffuse=tex('Diffuse','sRGB')
        # Source walnut texture supplies variation; slight neutral shadow tint.
        mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs['Fac'].default_value=.87
        mix.inputs[2].default_value=(.36,.255,.185,1)
        links.new(diffuse.outputs['Color'],mix.inputs[1])
        links.new(mix.outputs['Color'],principled.inputs['Base Color'])
    print('PBR',name,normal_strength,flush=True)
pbr('Smoked walnut','smoked_walnut_veneer',.42)
pbr('Deep mineral green','painted_plaster_wall',.12)
# World HDRI: soft, physically plausible studio reflection / indirect fill.
world=scene.world;world.use_nodes=True
nodes=world.node_tree.nodes;links=world.node_tree.links
env=nodes.new('ShaderNodeTexEnvironment')
env.image=bpy.data.images.load(str(CACHE/'poly_haven_studio_4k.hdr'),check_existing=True)
bg=next(n for n in nodes if n.type=='BACKGROUND');bg.inputs['Strength'].default_value=.12
links.new(env.outputs['Color'],bg.inputs['Color'])
# A single designed sun direction; broad studio windows and restrained fill.
for name,energy in [('Window key',820),('Soft ceiling bounce',95),
                    ('Camera fill',50),('Archive key',0),('Warm desk practical',42)]:
    o=bpy.data.objects.get(name)
    if o and o.type=='LIGHT':o.data.energy=energy
sun=bpy.data.objects.get('Afternoon sun')
if sun:
    sun.data.energy=.82;sun.data.angle=math.radians(2.1)
    sun.data.color=(1.0,.81,.64)
scene.view_settings.view_transform='AgX'
scene.view_settings.exposure=.12
scene.render.engine='CYCLES';scene.cycles.samples=112
scene.cycles.use_denoising=True
try:
    pref=bpy.context.preferences.addons['cycles'].preferences
    pref.compute_device_type='OPTIX';pref.get_devices()
    dev=[d for d in pref.devices if d.type=='OPTIX']
    if dev:
        for d in pref.devices:d.use=d.type=='OPTIX'
        scene.cycles.device='GPU'
        print('RENDER_GPU',[d.name for d in dev],flush=True)
except Exception as e:print('GPU_FALLBACK',e,flush=True)
camera=scene.camera
assert camera
def setcam(loc,look,lens,fstop):
    camera.location=V(*loc)
    camera.rotation_euler=(V(*look)-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.lens=lens;camera.data.dof.use_dof=True
    camera.data.dof.focus_distance=(V(*look)-camera.location).length
    camera.data.dof.aperture_fstop=fstop
def render(name,loc,look,lens,w,h,fstop=5.6):
    setcam(loc,look,lens,fstop)
    scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=92
    scene.render.filepath=str(OUTPUT/(name+'.jpg'))
    bpy.ops.render.render(write_still=True)
    path=OUTPUT/(name+'.jpg')
    print('PHOTO',name,path.stat().st_size,flush=True)
# Keep art master editable and make source textures self-contained in .blend.
bpy.ops.file.pack_all()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
print('BLEND',BLEND.stat().st_size,flush=True)
render('workbench-v2-wide',(3.60,2.35,4.8),(-.12,1.41,-.20),46,1600,1080)
render('workbench-v2-detail',(2.05,1.97,3.15),(-.2,1.46,-.30),60,1500,1040)
render('workbench-v2-overview',(4.7,3.1,6.2),(-.65,1.40,-.65),38,1400,960)
print('G5_R_PROOF_COMPLETE',flush=True)
