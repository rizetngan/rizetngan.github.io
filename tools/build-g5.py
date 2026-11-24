"""G5 original shared cinematic atelier. Run: python tools/build-g5.py
Blender Python 5.1+, source asset files in repository root; outputs assets/g5.
The live model and editorial photographs use the exact same geometry.
"""
import bpy, math, os, sys
from pathlib import Path
from mathutils import Vector
from PIL import Image, ImageOps, ImageEnhance
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'g5'; OUT.mkdir(parents=True,exist_ok=True)
# Grade source wood and letterbox true UI at native aspect ratio.
src=Image.open(ROOT/'assets/e2/walnut.jpg').convert('RGB')
gray=ImageOps.grayscale(src)
wood_image=ImageOps.colorize(gray,black=(50,33,22),white=(144,109,77))
wood_image.save(OUT/'walnut-g5.jpg',quality=88)
def padded(src,name,w,h):
    img=Image.open(src).convert('RGB');img.thumbnail((w,h),Image.Resampling.LANCZOS)
    cv=Image.new('RGB',(w,h),(25,30,27));cv.paste(img,((w-img.width)//2,(h-img.height)//2));cv.save(OUT/name,quality=94)
padded(ROOT/'assets/actape-windows-preview.png','actape-screen.jpg',1200,648)
padded(ROOT/'assets/snug-phone-running.png','snug-screen.jpg',600,1172)
bpy.ops.wm.read_factory_settings(use_empty=True)
def V(x,y,z): return (x,-z,y)
def rgb(h):
    a=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in a)+(1,)
def mat(name,h,rough=.7,metal=0,texture=None,emission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=rgb(h)
    n=m.node_tree.nodes.get('Principled BSDF');n.inputs['Base Color'].default_value=rgb(h)
    n.inputs['Roughness'].default_value=rough;n.inputs['Metallic'].default_value=metal
    if texture:
        t=m.node_tree.nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(texture),check_existing=True)
        m.node_tree.links.new(t.outputs['Color'],n.inputs['Base Color'])
        if emission:
            m.node_tree.links.remove(n.inputs['Base Color'].links[0]);n.inputs['Base Color'].default_value=(.015,.015,.015,1);n.inputs['Specular IOR Level'].default_value=.04;m.node_tree.links.new(t.outputs['Color'],n.inputs['Emission Color']);n.inputs['Emission Strength'].default_value=emission
    elif emission:
        n.inputs['Emission Color'].default_value=rgb(h);n.inputs['Emission Strength'].default_value=emission
    return m
wall=mat('Deep mineral green','3D493F',.91)
stone=mat('Warm limestone','C8BBA3',.91)
floor=mat('Warm polished concrete','82796A',.83)
wood=mat('Smoked walnut','786047',.52,texture=OUT/'walnut-g5.jpg')
endwood=mat('Walnut end grain','634831',.72)
ink=mat('Graphite powder coat','242825',.55,.12)
alu=mat('Satin aluminium','A4AAA6',.32,.73)
cream=mat('Warm porcelain','E6DFD1',.55)
orange=mat('Signal orange','B85B30',.56)
fabric=mat('Olive woven upholstery','5D6655',.95)
paper=mat('Paper stock','E4D8C1',.96)
rubber=mat('Black rubber','161B18',.85)
glass=mat('Display border','0E1412',.30,.15)
act=mat('Actape real interface','FFFFFF',.45,texture=OUT/'actape-screen.jpg',emission=.65)
snug=mat('Snug real interface','FFFFFF',.45,texture=OUT/'snug-screen.jpg',emission=.65)
warm=mat('Warm luminous diffuser','F4C58E',.4,emission=3)
def finish(o,name,m,bevel=0):
    o.name=name;o.data.materials.append(m)
    if bevel:
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        b=o.modifiers.new('Machined edge','BEVEL');b.width=bevel;b.segments=3
        bpy.ops.object.modifier_apply(modifier=b.name)
        try:
            n=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=n.name)
        except RuntimeError:pass
    return o
def box(name,p,size,m,b=.015,ry=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=V(*p));o=bpy.context.object
    o.dimensions=(size[0],size[2],size[1]);o.rotation_euler.z=-ry
    return finish(o,name,m,b)
def cyl(name,p,r1,r2,h,m,verts=32):
    bpy.ops.mesh.primitive_cone_add(vertices=verts,radius1=r1,radius2=r2,depth=h,location=V(*p));o=bpy.context.object
    o=finish(o,name,m,.006 if min(r1,r2)>.015 else 0)
    for f in o.data.polygons:
        if len(f.vertices)==4:f.use_smooth=True
    return o
def rod(name,a,b,r,m):
    a,b=Vector(V(*a)),Vector(V(*b));d=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=r,depth=d.length,location=(a+b)/2)
    o=bpy.context.object;o.rotation_mode='QUATERNION';o.rotation_quaternion=d.to_track_quat('Z','Y')
    return finish(o,name,m)
def screen(name,x,y,z,w,h,m):
    # Plane normal faces +Z in Three coordinates, exact full image UV.
    mesh=bpy.data.meshes.new(name);mesh.from_pydata([V(x-w/2,y-h/2,z),V(x+w/2,y-h/2,z),V(x+w/2,y+h/2,z),V(x-w/2,y+h/2,z)],[],[(0,1,2,3)]);mesh.update()
    uv=mesh.uv_layers.new()
    for i,p in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=p
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);mesh.materials.append(m);return o
def monitor(prefix,x,y,z,w,h,m,base_y,body=alu):
    box(prefix+'_body',(x,y,z),(w+.10,h+.10,.12),body,.035)
    box(prefix+'_bezel',(x,y,z+.064),(w+.025,h+.025,.020),glass,.014)
    screen(prefix+'_screen',x,y,z+.075,w,h,m)
    bottom=y-h/2-.05
    box(prefix+'_stem',(x,(bottom+base_y)/2,z-.045),(.12,bottom-base_y,.10),body,.018)
    box(prefix+'_base',(x,base_y+.022,z+.02),(w*.40,.044,.30),body,.02)
    # Small power indicator, separated from actual application content.
    box(prefix+'_indicator',(x+w*.37,y-h*.5-.036,z+.075),(.024,.006,.003),warm,.001)
def phone(prefix,x,y,z,w,h,base_y):
    box(prefix+'_body',(x,y,z),(w+.045,h+.05,.058),ink,.023)
    box(prefix+'_metalrim',(x,y,z+.026),(w+.032,h+.034,.017),alu,.015)
    box(prefix+'_bezel',(x,y,z+.036),(w+.010,h+.010,.008),glass,.005)
    screen(prefix+'_screen',x,y,z+.041,w,h,snug)
    box(prefix+'_stem',(x,(y-h/2+base_y)/2,z-.02),(.06,y-h/2-base_y,.065),alu,.012)
    box(prefix+'_base',(x,base_y+.018,z+.025),(w*.95,.035,.25),ink,.012)
# Shared structure. World anchors match E2 movement / desk / exhibit interactions.
box('COL_floor',(0,-.10,2.35),(13.2,.20,16.9),floor,.035)
box('COL_rear',(0,2.55,-5.55),(13.35,5.1,.28),wall,.03)
box('COL_east',(6.6,2.55,2.35),(.28,5.1,16.0),wall,.03)
box('COL_front',(0,2.55,10.85),(13.35,5.1,.24),wall,.03)
# West wall with large industrial window from z=-.1 to 5.5.
for z,d in [(-2.95,5.2),(8.2,5.4)]:
    box('COL_west_solid',(-6.6,2.55,z),(.28,5.1,d),wall,.02)
box('COL_window_sill',(-6.6,.47,2.65),(.28,.94,5.75),wall,.02)
box('COL_window_header',(-6.6,4.75,2.65),(.28,.70,5.75),wall,.02)
for z in [-.2,.9,2.0,3.1,4.2,5.3]:
    box('Window mullion',(-6.52,2.67,z),(.13,3.45,.07),ink,.012)
for y in [.96,2.65,4.39]:
    box('Window rail',(-6.52,y,2.55),(.13,.07,5.65),ink,.01)
box('Limestone sill',(-6.33,.98,2.65),(.75,.09,5.85),stone,.03)
# Quiet structural ceiling; excluded from live scene to permit camera at high elevation.
box('CEILING',(0,5.17,2.35),(13.55,.18,16.9),wall,.02)
# Perimeter skirting and quiet architectural joints.
for z,d in [(-2.95,5.2),(8.2,5.4)]:
    box('Skirting',(-6.43,.08,z),(.06,.16,d),ink,.006)
box('Skirting rear',(0,.08,-5.36),(13,.16,.06),ink,.006)
box('Skirting east',(6.42,.08,2.35),(.06,.16,16),ink,.006)
# The desk: CNC rounded walnut, steel trestle, apron and recessed joinery.
box('COL_DeskTop',(0,.975,0),(4.6,.09,2.2),wood,.06)
box('Desk apron',(0,.855,-.05),(4.28,.15,1.82),endwood,.025)
for x in [-2.02,2.02]:
    for z in [-.81,.81]:
        rod('Tapered steel leg',(x,.85,z),(x*1.055,.05,z*1.08),.052,ink)
        cyl('Adjustable foot',(x*1.055,.026,z*1.08),.076,.076,.052,rubber)
    box('Trestle crossmember',(x,.22,0),(.08,.06,1.70),ink,.012)
box('Desk stretcher',(0,.26,-.74),(4.1,.065,.07),ink,.012)
# An authored compact digital workstation.
monitor('LAB_Actape',-.15,1.66,-.42,1.74,.94,act,1.02)
phone('LAB_Snug',1.18,1.37,-.23,.245,.50,1.02)
box('Desk mat',(-.04,1.026,.37),(1.57,.012,.65),fabric,.025)
box('Keyboard case',(-.24,1.055,.35),(.86,.042,.30),alu,.025)
for row in range(5):
    for col in range(14):
        box('Keycap',(-.24-.375+col*.0575,1.083,.237+row*.054),(.049,.017,.046),
            orange if row==0 and col==0 else cream if row<4 else ink,.007)
box('Spacebar',(-.24,1.086,.481),(.37,.020,.045),ink,.007)
box('Mouse',(.44,1.057,.34),(.127,.050,.20),ink,.04)
box('Notebook',(-1.42,1.042,.08),(.62,.038,.45),fabric,.018)
box('Paper block',(-1.42,1.065,.08),(.59,.014,.424),paper,.006)
for i in range(4):
    box('Drawing line',(-1.42,1.074,-.04+i*.061),(.42-i*.045,.002,.002),endwood,.0005)
rod('Orange pencil',(-1.01,1.076,-.11),(-1.01,1.076,.25),.009,orange)
# Sculptural lamp and warm ceramic cup.
cyl('Lamp foot',(1.82,1.05,-.70),.185,.185,.055,ink)
rod('Lamp upright',(1.82,1.08,-.70),(1.82,2.03,-.70),.031,alu)
rod('Lamp arm',(1.82,2.03,-.70),(1.44,2.03,-.57),.028,alu)
cyl('Enamel lamp shade',(1.44,1.96,-.57),.22,.07,.22,ink)
cyl('Lamp diffuser',(1.44,1.846,-.57),.204,.204,.013,warm)
cyl('Ceramic cup',(1.82,1.15,.10),.105,.12,.26,cream)
cyl('Coffee',(1.82,1.283,.10),.098,.098,.004,endwood)
# Chair behind left side, with comfortable clear floor path.
box('Chair seat',(-1.95,.48,-1.67),(.56,.11,.54),fabric,.065)
box('Chair back',(-1.95,.80,-1.92),(.54,.46,.10),fabric,.06)
for x in [-2.17,-1.73]:
    for z in [-1.87,-1.47]:
        rod('Chair leg',(x,.44,z),(x+(.04 if x>-1.95 else -.04),.025,z+(.035 if z>-1.67 else -.035)),.022,ink)
# Built-in low sideboard and books.
box('Sideboard',(-6.0,.46,2.66),(.69,.88,4.46),wood,.032)
box('Sideboard cap',(-6.0,.94,2.66),(.78,.07,4.52),stone,.025)
for i in range(5):
    z=.88+i*.89
    box('Drawer front',(-5.64,.46,z),(.035,.77,.84),fabric,.015)
    box('Drawer pull',(-5.60,.68,z),(.045,.035,.22),alu,.007)
# Notes library at same interaction anchor.
box('NOTES_back',(-6.38,1.6,-.60),(.10,3.2,3.1),endwood,.02)
for z in [-2.14,-.59,.96]:
    box('NOTES_upright',(-6.08,1.60,z),(.60,3.2,.08),wood,.015)
for row in range(5):
    y=.15+row*.72
    box('NOTES_shelf',(-6.08,y,-.60),(.63,.07,3.15),wood,.015)
    if row==4:break
    for i in range(14):
        h=.26+(i*7+row*3)%9*.035
        box('NOTES_book',(-6.00,y+.04+h/2,-2.03+i*.212),(.31,h,.13),[cream,fabric,orange,stone,ink][(i+row)%5],.006)
box('NOTES_lectern',(-4.65,.46,-.60),(.45,.92,.45),stone,.025)
box('NOTES_book open',(-4.65,.95,-.60),(.53,.055,.40),paper,.01)
# Product collection: two different hardware display carriers, matching E2 anchors.
for x,prefix in [(-2.12,'ACTAPE'),(2.12,'SNUG')]:
    box(prefix+'_wallPanel',(x,2.40,-5.35),(3.40,3.35,.12),ink,.035)
    box(prefix+'_displayShelf',(x,1.16,-4.98),(3.15,.15,.83),stone,.045)
    box(prefix+'_baseCabinet',(x,.53,-5.02),(3.03,1.05,.74),wood,.03)
    box(prefix+'_light',(x,3.85,-5.17),(2.7,.045,.09),warm,.01)
monitor('ACTAPE',-2.12,2.38,-5.01,2.45,1.36,act,1.245)
phone('SNUG',2.12,2.38,-4.99,.88,1.72,1.245)
# About corner uses a purposeful monogram object and soft stone pedestal.
cyl('ABOUT_plinth',(5.15,.52,-1.20),.47,.44,1.04,stone)
box('ABOUT_monogram',(5.15,1.28,-1.20),(.44,.44,.44),ink,.045,ry=.40)
cyl('ABOUT_accent',(5.45,1.14,-.98),.09,.09,.18,orange)
# A fabric rug grounds the workstation, subtle joints on the concrete.
box('Rug',(0,.008,-.18),(5.7,.016,3.85),fabric,.06)
for i in range(8):
    z=-3.8+i*1.8
    box('Floor seam',(0,.002,z),(13.0,.003,.009),endwood,.001)
# Real offline lights. Their glTF export is omitted; web adds compatible realtime lights.
def area(name,p,target,energy,color,size,shape='DISK',size_y=None):
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.color=color;d.shape=shape;d.size=size
    if size_y is not None:d.size_y=size_y
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=V(*p)
    o.rotation_euler=(Vector(V(*target))-o.location).to_track_quat('-Z','Y').to_euler();return o
area('Window key',(-7.15,3.4,2.7),(0,1.1,0),1000,(1,.79,.56),5.2,'RECTANGLE',3.4)
area('Soft ceiling bounce',(1.2,4.5,2.8),(0,1.2,-.3),185,(.74,.82,1),4)
area('Warm desk practical',(1.44,1.83,-.57),(1.3,1.04,-.48),22,(1,.65,.34),.35)
area('Archive key',(-.4,4.5,-2.6),(0,2.1,-5),230,(1,.82,.62),3.8)
area('Camera fill',(3.3,3.6,5.3),(0,1.4,0),100,(.9,.94,1),4)
sun_data=bpy.data.lights.new('Afternoon sun','SUN');sun_data.energy=2.0;sun_data.angle=.055;sun_data.color=(1,.75,.5)
sun=bpy.data.objects.new('Afternoon sun',sun_data);bpy.context.collection.objects.link(sun);sun.rotation_euler=Vector((1,.42,-.38)).to_track_quat('-Z','Y').to_euler()
sc=bpy.context.scene;sc.world=bpy.data.worlds.new('Muted studio world');sc.world.use_nodes=True
sc.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.22,.25,.23,1);sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.45
camdata=bpy.data.cameras.new('Editorial camera');cam=bpy.data.objects.new('Editorial camera',camdata);bpy.context.collection.objects.link(cam);sc.camera=cam
def pose(p,look,lens):
    cam.location=V(*p);cam.rotation_euler=(Vector(V(*look))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens;cam.data.dof.use_dof=True;cam.data.dof.focus_distance=(Vector(V(*look))-cam.location).length;cam.data.dof.aperture_fstop=3.5
pose((2.8,2.28,4.35),(.10,1.45,-.18),48)
sc.render.engine='CYCLES';sc.cycles.samples=48;sc.cycles.use_denoising=True
sc.view_settings.view_transform='AgX';sc.view_settings.exposure=.0
# Try NVIDIA OptiX then CUDA; fall back to CPU cleanly.
try:
    pref=bpy.context.preferences.addons['cycles'].preferences
    for backend in ['OPTIX','CUDA']:
        try:
            pref.compute_device_type=backend;pref.get_devices()
            devices=[d for d in pref.devices if d.type==backend]
            if devices:
                for d in pref.devices:d.use=d.type==backend
                sc.cycles.device='GPU';print('DEVICE',backend,[d.name for d in devices],flush=True);break
        except Exception:pass
except Exception:pass
sc.render.image_settings.file_format='JPEG';sc.render.image_settings.quality=88
sc.render.resolution_percentage=100
bpy.context.preferences.filepaths.save_version=0
for im in bpy.data.images:
    if im.source=='FILE':
        try:im.pack()
        except Exception:pass
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'atelier-g5.blend'))
# Merge static renderables by semantic category and material. Keep collision
# meshes separate, so existing picking, floor bounds and interaction remain.
# Editable .blend is saved before merge; the runtime asset needs far fewer draws.
buckets={}
for obj in list(bpy.data.objects):
    if obj.type!='MESH' or obj.name=='CEILING' or obj.name.startswith('COL_'):continue
    tag=next((k for k in ('LAB_Actape','LAB_Snug','ACTAPE','SNUG','NOTES','ABOUT') if obj.name.startswith(k)),'STATIC')
    material=obj.data.materials[0].name if obj.data.materials else 'none'
    buckets.setdefault((tag,material),[]).append(obj)
for (tag,material),objects in buckets.items():
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    bpy.context.object.name=tag+'_'+material
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.data.objects:
    if obj.type=='MESH' and obj.name!='CEILING':obj.select_set(True)
print('RUNTIME_MESHES',len(bpy.context.selected_objects),flush=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'studio.glb'),export_format='GLB',use_selection=True,export_animations=False)
print('GLB', (OUT/'studio.glb').stat().st_size,flush=True)
def render(name,p,look,lens,w,h):
    pose(p,look,lens);sc.render.resolution_x=w;sc.render.resolution_y=h
    sc.render.filepath=str(OUT/(name+'.jpg'))
    try:bpy.ops.render.render(write_still=True)
    except RuntimeError:
        sc.cycles.device='CPU';bpy.ops.render.render(write_still=True)
    print('RENDERED',name,(OUT/(name+'.jpg')).stat().st_size,flush=True)
render('hero',(3.7,2.38,3.85),(.10,1.45,-.15),43,1500,1040)
render('studio',(4.8,3.1,6.7),(-1.0,1.5,-.9),30,1280,900)
render('actape',(-.82,2.64,-.40),(-2.12,2.10,-5.0),43,1120,840)
render('snug',(3.16,2.76,-.65),(2.12,2.19,-5.0),43,1120,840)
