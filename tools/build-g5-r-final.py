"""G5-R final art master: genuine model surfaces, designed architecture, physical light.
Source: G5-R CC0 asset cache. No website change until art photographs pass QA.
"""
from pathlib import Path
import bpy, math, json, time
from mathutils import Vector, Matrix
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'art-assets'/'g5-r'
OUT=ROOT/'assets'/'g5r';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ART/'workbench-v4.blend'))
scene=bpy.context.scene
def V(x,y,z):return Vector((x,-z,y))
# Completely discard G5.1 stage. Preserve only professional CC0 groups and
# actual project screenshot of the portrait device. None of the old floor,
# walls, procedural bookshelves, lights or primitive desk survive this rebuild.
def asset_root(o):
    p=o
    while p:
        if p.name.startswith(('ASSET__','PRODUCT__')):return True
        p=p.parent
    return False
keep_prefix=('LAB_Snug',)
removed=0
for o in list(bpy.data.objects):
    if o.type=='CAMERA':continue
    if o.type=='LIGHT' or (o.type in {'MESH','FONT','CURVE'} and
            not asset_root(o) and not o.name.startswith(keep_prefix)):
        bpy.data.objects.remove(o,do_unlink=True);removed+=1
# Reimport original full tevy PBR geometry, discard neutral-placeholder source
for o in list(bpy.data.objects):
    if o.type in {'MESH','EMPTY','CURVE'} and asset_root(o):
        p=o
        while p and not p.name.startswith('PRODUCT__'):p=p.parent
        if p:bpy.data.objects.remove(o,do_unlink=True)
for o in list(bpy.data.objects):
    if o.name.startswith('PRODUCT__'):bpy.data.objects.remove(o,do_unlink=True)
print('REBUILD_REMOVED',removed,flush=True)
def rgb(h):
    c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(x/12.92 if x<.04045 else ((x+.055)/1.055)**2.4 for x in c)+(1,)
def mat(name,hex,rough=.72,metal=0,transmission=0):
    m=bpy.data.materials.new('R / '+name);m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=rgb(hex)
    bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal
    bs.inputs['Transmission Weight'].default_value=transmission
    m.diffuse_color=rgb(hex);return m
graphite=mat('Graphite anodised','272B27',.39,.66)
dark=mat('Deep mineral lacquer','292F29',.57)
fine_black=mat('Rubber seam','131713',.82)
terracotta=mat('Burnt vermilion','B96139',.4)
bronze=mat('Bronzed satin aluminium','957C60',.35,.68)
limestone=mat('Limestone','89877F',.91)
plaster=mat('Layered green mineral plaster','28362E',.96)
ivory=mat('Enamel bone white','D9D5C9',.45)
amber=mat('Amber diffuser','F9C693',.48)
greenery=mat('Leaf green','485C45',.75)
outside=mat('Sunlit exterior','969587',.9)
wood=bpy.data.materials.get('Smoked walnut');assert wood
# Poly Haven source PBR, reduced exposure in the warm-albedo response.
# Deep walnut is art-directed rather than bright honey/pine.
from PIL import ImageEnhance
base=Image.open(ART/'materials'/'smoked_walnut_veneer_Diffuse_2k.jpg').convert('RGB')
base=ImageEnhance.Brightness(base).enhance(.45)
base=ImageEnhance.Color(base).enhance(.78)
dark_wood_file=ART/'smoked-walnut-dark.jpg';base.save(dark_wood_file,quality=91)
dark_wood=mat('Real smoked walnut PBR','3A2A20',.58)
nn=dark_wood.node_tree.nodes;ll=dark_wood.node_tree.links
principled=next(n for n in nn if n.type=='BSDF_PRINCIPLED')
source=nn.new('ShaderNodeTexImage');source.image=bpy.data.images.load(str(dark_wood_file))
ll.new(source.outputs['Color'],principled.inputs['Base Color'])
rough_tex=nn.new('ShaderNodeTexImage')
rough_tex.image=bpy.data.images.load(str(ART/'materials'/'smoked_walnut_veneer_Rough_2k.jpg'))
rough_tex.image.colorspace_settings.name='Non-Color'
ll.new(rough_tex.outputs['Color'],principled.inputs['Roughness'])
normal_tex=nn.new('ShaderNodeTexImage')
normal_tex.image=bpy.data.images.load(str(ART/'materials'/'smoked_walnut_veneer_nor_gl_2k.jpg'))
normal_tex.image.colorspace_settings.name='Non-Color'
normal_node=nn.new('ShaderNodeNormalMap');normal_node.inputs['Strength'].default_value=.42
ll.new(normal_tex.outputs['Color'],normal_node.inputs['Color'])
ll.new(normal_node.outputs['Normal'],principled.inputs['Normal'])
# Preserve the authored Poly Haven source for furniture. Only architectural
# components use darker walnut, with the same physically detailed normal.

def box(name,pos,dim,material,bev=.015,rot=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=V(*pos))
    o=bpy.context.object;o.name=name
    o.dimensions=(dim[0],dim[2],dim[1])
    o.rotation_euler.z=-math.radians(rot)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    if bev:
        mod=o.modifiers.new('Carefully radiused edge','BEVEL')
        mod.width=bev;mod.segments=4;mod.affect='EDGES'
        o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
    return o
def cylinder(name,pos,r,h,material,vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=h,location=V(*pos))
    o=bpy.context.object;o.name=name;o.data.materials.append(material)
    bevel=o.modifiers.new('Soft machined rim','BEVEL');bevel.width=.006;bevel.segments=2
    o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return o
def rod(name,p1,p2,r,material,vertices=16):
    a=V(*p1);b=V(*p2);d=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=d.length,location=(a+b)/2)
    o=bpy.context.object;o.name=name;o.rotation_mode='QUATERNION';o.rotation_quaternion=d.to_track_quat('Z','Y')
    o.data.materials.append(material);return o
# Hand-authored architecture: no monolithic windowless primitive room.
# Distinct plaster portals, double depth wall, inner limestone sill.
box('Stone floor | satin honed',(0,-.105,0),(9.4,.21,11.8),limestone,.025)
rug=mat('Coal olive rug','3F473F',.95)
box('Desk shadow field',(0,.010,0),(3.0,.012,2.28),rug,.025)
box('Deep rear wall | center',(0,2.20,-3.87),(9.6,4.4,.24),plaster,.02)
box('Back left wall | narrow',(-3.78,2.1,-3.54),(.45,4.2,.38),plaster,.014)
box('Right side architectural return',(4.5,2.25,-.35),(.24,4.5,9.4),plaster,.014)
box('Left wall top pier',(-4.45,4.05,-.35),(.24,.9,9.4),plaster,.014)
box('Left window lower rail',(-4.45,.48,-.35),(.25,.96,9.4),plaster,.014)
box('Left wall front pier',(-4.45,2.4,3.58),(.27,3.25,2.0),plaster,.014)
box('Left wall back pier',(-4.45,2.4,-3.6),(.27,3.25,2.5),plaster,.014)
# Glass-less window reveals, silhouetted ribs and wooden soffit.
for z in [-2.30,-.80,.70,2.20]:
    box('Bronzed daylight mullion',(-4.31,2.43,z),(.09,2.99,.09),bronze,.007)
for y in [1.07,2.62,3.92]:
    box('Recessed metal transom',(-4.31,y,.01),(.095,.09,6.5),graphite,.004)
box('Limestone sill',(-4.26,1.065,.02),(.44,.075,6.55),limestone,.012)
# The far exterior is a modeled sun court, not a fake image.
box('Exterior courtyard facade',(-8.60,2.60,0),(.12,5.2,12),outside,.012)
box('Exterior warm ground',(-7.0,-.05,0),(3.3,.1,11),limestone,.008)
for z in [-2,1.5]:
    box('Exterior structural fin',(-7.75,2.25,z),(.4,4.1,.22),ivory,.015)
# Ceiling lip and dark track strips: frame the hero without boxy low-poly feel.
box('Floating acoustical soffit',(0,4.48,-1.53),(9.2,.17,5.0),graphite,.02)
box('Ceiling indirect strip',(-1.4,4.325,-1.5),(4.9,.026,.08),amber,.008)
for x in [-1.12,1.12]:
    box('Recessed lighting track',(x,4.365,0),(.058,.03,4.2),fine_black,.008)
# Rear vertical walnut planes with full depth, tiny metal gaps.
box('Architectural walnut inset',(1.90,2.08,-3.69),(3.7,3.74,.095),dark_wood,.016)
for i in range(20):
    x=.13+i*.176
    box('Precisely milled vertical timber rib',(x,2.05,-3.53),(.05,3.65,.080),dark_wood,.010)
# Oblique stone architectural opening to break symmetry.
box('Right return architrave',(3.83,2.27,-2.18),(.19,4.15,1.95),ivory,.009)
box('Low black plinth',(3.0,.15,-2.20),(1.7,.30,1.20),graphite,.025)
# Cabinet and lounge are curated Poly Haven objects, not primitive substitutes.
# Design-led desk 2.44m, ~76cm high: dark walnut PBR, refined edge.
box('Signature walnut worktop',(0,.745,0),(2.45,.082,1.23),dark_wood,.030)
box('Floating shadow line under desk',(0,.683,0),(2.32,.022,1.11),fine_black,.005)
box('Desk cross apron',(0,.625,-.43),(2.18,.065,.085),graphite,.008)
for x in [-1.06,1.06]:
    for z in [-.49,.49]:
        rod('Tapering stainless desk leg',(x,.69,z),(x*1.017,.055,z*1.05),.031,graphite)
        cylinder('Soft foot glides',(x*1.017,.027,z*1.05),.053,.042,fine_black)
    rod('Sculptural desk trestle',(x,.14,-.50),(x,.14,.50),.02,bronze)
# Workstation leather desk writing pad.
box('Saddle leather work mat',(-.01,.793,.19),(1.35,.013,.47),dark,.020)
# Place selected old Snug portrait device with project interface. Rescale if
# necessary is retained from original after scaled greybox; anchor stays clear.
# The other props are controlled editorial accents, not furniture filler.
# A low book + turned bronze cylinder add functional tabletop design clues.
box('Ink bound product notebook',(-.88,.806,.27),(.33,.030,.25),graphite,.008)
box('Letterpress printed paper',(-.88,.825,.27),(.31,.009,.235),ivory,.006)
rod('Desk pencil',(-.66,.839,.17),(-.66,.839,.38),.006,terracotta)
cylinder('Textured black ceramic pen holder',(.96,.86,.31),.052,.14,dark)
# Rear left low credenza, floor separation, measured negative space.
box('Low smoked sideboard',(-2.5,.36,-2.63),(2.08,.65,.47),dark_wood,.025)
box('Sideboard top',(-2.5,.71,-2.63),(2.1,.035,.51),graphite,.011)
for x in [-3.12,-2.5,-1.88]:
    box('Delicate vertical door reveal',(x,.36,-2.365),(.008,.53,.012),fine_black,.002)
# Wall-mounted sculptural art insert and numbered archive label.
box('Wall art deep mat',(2.15,2.42,-3.42),(1.16,1.54,.038),graphite,.006)
box('Wall art border',(2.15,2.42,-3.38),(1.03,1.38,.012),ivory,.005)
box('Wall art inset',(2.15,2.42,-3.35),(.88,1.24,.008),plaster,.002)
# Arc graphic made of stepped thin bronze relief sections, not decorative UI.
for i in range(12):
    a=-math.pi*.43 + i*math.pi*.075
    x=2.15+.31*math.cos(a);y=2.41+.42*math.sin(a)
    cylinder('Brass relief dots',(x,y,-3.333),.017,.006,bronze,24)
# Lighting: layered reflection from real HDRI and broad studio area key.
for o in list(bpy.data.objects):
    if o.type=='LIGHT':bpy.data.objects.remove(o,do_unlink=True)
def area(name,pos,look,energy,size,color=(1,1,1),shape='DISK',size_y=None):
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.color=color;d.shape=shape;d.size=size
    if size_y is not None:d.size_y=size_y
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=V(*pos)
    o.rotation_euler=(V(*look)-o.location).to_track_quat('-Z','Y').to_euler()
    return o
area('01 Broad window key',(-5.3,3.45,1.60),(.1,1.18,-.3),850,2.4,(1,.83,.65),'RECTANGLE',2.9)
area('02 Sculpted screen fill',(2.20,2.7,4.15),(0,1.05,-.2),160,3.7,(.83,.90,1.0))
area('03 Warm task lamp',(.93,1.45,-.28),(.60,.76,.18),49,.28,(1,.64,.36))
area('04 Reflective top rim',(1.2,3.7,-3.5),(.10,1.10,-.20),170,3.4,(1,.8,.6))
area('05 Exterior skylight',(-8.0,5.1,.20),(-4.35,2.6,.20),950,4.2,(1,.95,.84))
area('06 Architectural warm bounce',(2.2,3.4,-2.6),(1,1.55,-1.20),105,2.6,(1,.69,.49))
sun=bpy.data.lights.new('Warm winter sun','SUN');sun.energy=.90;sun.angle=math.radians(2.0);sun.color=(1,.85,.70)
sunob=bpy.data.objects.new('Warm winter sun',sun);bpy.context.collection.objects.link(sunob)
sunob.rotation_euler=Vector((.78,-.34,-.48)).to_track_quat('-Z','Y').to_euler()
world=scene.world;world.use_nodes=True
bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs['Strength'].default_value=.105
# Color grade: AgX medium high contrast; actual values from Cycles.
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=-.16
for item in ['ASSET__modern_arm_chair_01','ASSET__mid_century_lounge_chair']:
    o=bpy.data.objects.get(item)
    if o:
        for part in [o]+list(o.children_recursive):part.hide_render=True
# Imported true models with source KTX fully decoded -> normal, roughness,
# ORM and color preserved on device via original glTF extension metadata.
def bbox(objects):
    pts=[o.matrix_world@Vector(c) for o in objects if o.type=='MESH' for c in o.bound_box]
    if not pts:raise RuntimeError('No meshes')
    return (Vector((min(v[i] for v in pts) for i in range(3))),
            Vector((max(v[i] for v in pts) for i in range(3))))
def import_product(id,loc,ht,yaw=0):
    src=ART/'tevy'/(id+'-pbr.glb')
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(src))
    made=set(bpy.data.objects)-before
    roots=[o for o in made if o.parent not in made]
    meshes=[o for o in made if o.type=='MESH']
    mn,mx=bbox(meshes);sizes=mx-mn
    p=bpy.data.objects.new('PRODUCT__'+id,None);bpy.context.collection.objects.link(p)
    for o in roots:
        mw=o.matrix_world.copy();o.parent=p;o.matrix_world=mw
    scale=ht/sizes.z
    pivot=Vector(((mn.x+mx.x)*.5,(mn.y+mx.y)*.5,mn.z))
    p.matrix_world=(Matrix.Translation(V(*loc)) @ Matrix.Rotation(math.radians(-yaw),4,'Z') @
                    Matrix.Scale(scale,4) @ Matrix.Translation(-pivot))
    bpy.context.view_layer.update()
    print('FULL_PBR',id,'meshes',len(meshes),'materials',
          [(o.name,[m.name for m in o.data.materials]) for o in meshes],flush=True)
    return p,meshes
monitor,ms=import_product('desktop-monitor',(-.16,.790,-.28),.64,0)
keyboard,kb=import_product('mechanical-keyboard',(-.15,.787,.20),.045,180)
chair,cs=import_product('office-chair',(-.48,0,-1.14),1.10,0)
# The screen plane in the source has no TEXCOORD_0; create physical UVs and
# render original project screenshot on actual metal-framed device.
screen=next(o for o in ms if o.name.startswith('screen'))
overlay=screen.copy();overlay.data=screen.data.copy();overlay.name='SCREEN__actape'
bpy.context.collection.objects.link(overlay)
overlay.location.y-=.031
bpy.context.view_layer.update()
layer=overlay.data.uv_layers.active or overlay.data.uv_layers.new(name='Project UV')
positions=[overlay.matrix_world@v.co for v in overlay.data.vertices]
minx,maxx=min(v.x for v in positions),max(v.x for v in positions)
minz,maxz=min(v.z for v in positions),max(v.z for v in positions)
for poly in overlay.data.polygons:
    for li in poly.loop_indices:
        point=positions[overlay.data.loops[li].vertex_index]
        layer.data[li].uv=((point.x-minx)/(maxx-minx),(point.z-minz)/(maxz-minz))
raw=Image.open(ROOT/'assets'/'actape-windows-preview.png').convert('RGB')
# Accurate screenshot content, slight crop to 16:9 for actual display glass.
actual=ImageOps.fit(raw,(1600,900),method=Image.Resampling.LANCZOS,centering=(.5,.47))
impath=ART/'real-actape-lcd.jpg';actual.save(impath,quality=93)
m=bpy.data.materials.new('Actual Actape UI - emissive surface');m.use_nodes=True
nds=m.node_tree.nodes;nds.clear()
tex=nds.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(impath))
bs=nds.new('ShaderNodeEmission');bs.inputs['Strength'].default_value=.83
out=nds.new('ShaderNodeOutputMaterial')
m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Color'])
m.node_tree.links.new(bs.outputs['Emission'],out.inputs['Surface'])
overlay.data.materials.clear();overlay.data.materials.append(m)
screen.hide_render=True
# Office chair uses its original full PBR. Clamp only extraordinarily shiny
# flattened high-res texels, leave manufacturer supplied normal intact.
for o in cs:
    for m in o.data.materials:
        if not m or not m.use_nodes:continue
        bs=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
        if bs and not bs.inputs['Roughness'].is_linked:bs.inputs['Roughness'].default_value=.58
# The glass is intentionally omitted: it obscures product interface in close-up.
# Backend authored art masters remain separate from runtime glTF.
camera=scene.camera
if not camera:
    cd=bpy.data.cameras.new('Editorial lens');camera=bpy.data.objects.new('Editorial lens',cd)
    bpy.context.collection.objects.link(camera);scene.camera=camera
scene.render.engine='CYCLES'
scene.cycles.samples=110;scene.cycles.use_denoising=True
try:
    pref=bpy.context.preferences.addons['cycles'].preferences
    pref.compute_device_type='OPTIX';pref.get_devices()
    for d in pref.devices:d.use=d.type=='OPTIX'
    if any(d.type=='OPTIX' for d in pref.devices):
        scene.cycles.device='GPU'
        print('GPU OptiX used',flush=True)
except Exception as e:print('GPU fallback',e,flush=True)
def pose(loc,target,lens,fstop):
    camera.location=V(*loc)
    camera.rotation_euler=(V(*target)-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.type='PERSP';camera.data.lens=lens
    camera.data.dof.use_dof=True
    camera.data.dof.focus_distance=(V(*target)-camera.location).length
    camera.data.dof.aperture_fstop=fstop
def photo(name,loc,look,lens,w,h,stop=6):
    pose(loc,look,lens,stop)
    scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=92
    scene.render.filepath=str(OUT/(name+'.jpg'))
    bpy.ops.render.render(write_still=True)
    print('PHOTO',name,(OUT/(name+'.jpg')).stat().st_size,flush=True)
# Save before render, studio's master is fully editable and packs external PBR.
bpy.ops.file.pack_all()
bpy.context.preferences.filepaths.save_version=0
saved=ART/'atelier-final-g5r.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(saved))
print('MASTER',saved.stat().st_size,'objects',len(bpy.data.objects),flush=True)
# Master shots: hero is lower camera, atmospheric, asymmetrically framed.
photo('hero',(2.33,1.57,2.85),(-.12,1.16,-.25),54,1680,1120,6)
photo('atelier',(3.85,2.46,4.82),(-.60,1.43,-.85),39,1536,1024,7)
photo('actape',(.73,1.50,1.83),(-.22,1.17,-.28),65,1300,950,7)
photo('objects',(2.5,1.62,2.05),(.58,1.16,-.05),64,1300,950,4.5)
# Export only visible meshes; exclude exterior facade, glassless lighting,
# ceiling and original mesh collision (will add invisible controls in browser).
# texture conversion, lightmap and LOD will be handled separately after art QA.
print('G5R_ART_COMPLETE',flush=True)
