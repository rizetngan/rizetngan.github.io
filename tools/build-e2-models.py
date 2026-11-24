"""Original E2 Blender production assets. Run with bpy==5.1.2 or Blender Python.
Coordinates in Three.js world units via X,Z,-Y mapping. No external assets.
Outputs two GLBs and editable .blend source files to a separate build directory.
"""
import bpy, math, sys, os
from pathlib import Path
from mathutils import Vector
OUT=Path(os.environ.get('ATELIER_BUILD_DIR', str(Path(__file__).resolve().parents[1]/'assets'/'e2')))
OUT.mkdir(parents=True,exist_ok=True)
def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)
def srgb(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
def mat(name,h,rough=.88):
    m=bpy.data.materials.new(name);m.use_nodes=True
    c=tuple(srgb(int(h[i:i+2],16)/255) for i in (0,2,4))+(1,)
    m.diffuse_color=c
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=c;p.inputs['Roughness'].default_value=rough
    return m
def V(x,y,z):return (x,-z,y)
def select(o):
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
def finish(o,name,m,bevel=0,smooth=False):
    o.name=name;o.data.materials.append(m)
    if bevel:
        select(o);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        b=o.modifiers.new('Soft crafted edge','BEVEL');b.width=bevel;b.segments=2
        bpy.ops.object.modifier_apply(modifier=b.name)
        try:
            n=o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=n.name)
        except RuntimeError:pass
    if smooth:
        for p in o.data.polygons:p.use_smooth=True
    return o
def box(name,loc,size,m,bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1,location=V(*loc))
    o=bpy.context.object;o.dimensions=(size[0],size[2],size[1])
    return finish(o,name,m,bevel)
def beam(name,a,b,w,d,m):
    a,b=Vector(V(*a)),Vector(V(*b));v=b-a
    bpy.ops.mesh.primitive_cube_add(size=1,location=(a+b)/2)
    o=bpy.context.object;o.dimensions=(w,d,v.length);o.rotation_mode='QUATERNION';o.rotation_quaternion=v.to_track_quat('Z','Y')
    return finish(o,name,m,.012)
def mesh(name,verts,faces,m,smooth=False):
    data=bpy.data.meshes.new(name);data.from_pydata([V(*v) for v in verts],[],faces);data.update()
    o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o)
    return finish(o,name,m,smooth=smooth)
def export(name):
    # Blender glTF export with no compression/extensions required by older Three.js.
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(name+'.blend')))
    bpy.ops.export_scene.gltf(filepath=str(OUT/(name+'.glb')),export_format='GLB',export_animations=False)
    print('EXPORTED',name,(OUT/(name+'.glb')).stat().st_size,flush=True)

def architecture():
    clear();oak=mat('Smoked oak','886B50');light=mat('Cut edge','B8A080');ink=mat('Charcoal metal','39483F');plaster=mat('Bone porcelain plaster','DFD6C2');clay=mat('Fired clay','AC654C')
    # An actual rear-facing cutaway roof, left open across the visitor side.
    # Existing floor, product, gallery and wall collision anchors are unchanged.
    # West side is the light source: exposed rafters and narrow clerestory slots.
    for z in [-5.3,-4.20,-3.10,-2.00,-.90,.20,1.30]:
        beam('Exposed timber rafter',(-6.55,4.70,z),(-.1,6.05,z),.14,.18,oak)
        beam('Cutaway rafter',(-.1,6.05,z),(3.0,5.40,z),.14,.18,oak)
    beam('Ridge',(-.1,6.05,-5.55),(-.1,6.05,1.55),.16,.21,ink)
    beam('West eave',(-6.62,4.70,-5.55),(-6.62,4.70,1.55),.18,.20,ink)
    beam('Cutaway roof edge',(3.0,5.40,-5.55),(3.0,5.40,1.55),.16,.14,ink)
    # Only rear roof strip is opaque so model and light remain visible.
    for i in range(11):
        x=-6.55+i*.59
        y=4.70+(x+6.55)*1.35/6.45
        beam('Standing seam clay roof',(x,y+.13,-5.52),(x,y+.13,-3.82),.57,.085,clay)
    # Two exposed glazed roof modules are represented by thin frames, no opaque glass.
    for x in [-5.1,-3.5,-1.9]:
        y=4.7+(x+6.55)*1.35/6.45
        beam('Skylight mullion',(x,y+.06,-3.75),(x,y+.06,.95),.075,.075,ink)
    # Gable infill triangle attached to north wall, with inset seam trim.
    mesh('Gable plaster',[(-6.6,4.76,-5.57),(-.1,6.05,-5.57),(6.6,4.76,-5.57),(-6.6,4.76,-5.26),(-.1,6.05,-5.26),(6.6,4.76,-5.26)],[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)],plaster)
    beam('Gable lintel',(-6.60,4.76,-5.29),(6.60,4.76,-5.29),.16,.17,oak)
    # Architecture as a connected structural bay, not floating hoops.
    for x in [-6.25,3.0]:
        beam('Roof column',(x,0,1.3),(x,4.70 if x<0 else 5.40,1.3),.16,.16,oak)
        box('Stone foot',(x,.10,1.3),(.29,.20,.29),light,.025)
    # Rear lintel and cut edge on facade; no added floor obstacles centrally.
    beam('Facade header',(-6.55,4.65,1.3),(-.12,4.65,1.3),.17,.21,oak)
    export('atelier-roof')

def character():
    clear()
    jacket=mat('Olive wool work jacket','657260');dark=mat('Jacket shadow and stitching','414A40');shirt=mat('Linen shirt','D9C7A7');pants=mat('Warm brown trousers','79604D');skin=mat('Painted resin skin','DBB48E');hair=mat('Dark warm hair','40382E');sole=mat('Shoe sole','B8AB8D');shoe=mat('Cream canvas shoes','E4D9BE');accent=mat('Terracotta pen','AD614A');button=mat('Horn buttons','594C3B')
    parts=[]
    def record(o,bone):parts.append((o,bone));return o
    def ell(name,loc,scale,m,bone,segments=18,rings=12):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,radius=1,location=V(*loc))
        o=bpy.context.object;o.scale=(scale[0],scale[2],scale[1]);return record(finish(o,name,m,smooth=True),bone)
    def loft(name,sections,m,bone,n=16):
        # sections y,cx,cz,rx,rz; authored elliptical cross-sections.
        verts=[(cx+rx*math.cos(i*2*math.pi/n),y,cz+rz*math.sin(i*2*math.pi/n)) for y,cx,cz,rx,rz in sections for i in range(n)]
        faces=[tuple(range(n-1,-1,-1))]
        for k in range(len(sections)-1):
            for i in range(n):j=(i+1)%n;faces.append((k*n+i,k*n+j,(k+1)*n+j,(k+1)*n+i))
        faces.append(tuple((len(sections)-1)*n+i for i in range(n)))
        o=mesh(name,verts,faces,m,True);return record(o,bone)
    def detail(name,loc,size,m,bone='Root',bevel=.0018):return record(box(name,loc,size,m,bevel),bone)
    for x,b in [(-.041,'LegL'),(.041,'LegR')]:
        loft('Tailored trouser',[(.029,x,0,.027,.025),(.06,x,0,.028,.027),(.15,x,-.006,.033,.028),(.23,x,0,.037,.034),(.30,x,0,.039,.035)],pants,b)
        detail('Rubber sole',(x,.009,.018),(.059,.018,.104),sole,b,.005)
        ell('Canvas upper',(x,.025,.018),(.028,.018,.05),shoe,b)
        for k in range(3):detail('Lace',(x,.039-k*.003,.014+k*.013),(.030,.0025,.004),shirt,b,.0008)
    loft('Pelvis',[(.25,0,0,.068,.035),(.29,0,0,.077,.043),(.33,0,0,.068,.037)],pants,'Root')
    loft('Jacket body',[(.285,0,0,.075,.043),(.31,0,0,.077,.043),(.39,0,0,.069,.043),(.47,0,0,.081,.039),(.505,0,0,.076,.033),(.52,0,0,.038,.024)],jacket,'Root',24)
    detail('Open linen placket',(0,.423,.043),(.042,.166,.011),shirt)
    for side in [-1,1]:
        lapel=detail('Folded lapel',(side*.032,.466,.048),(.028,.080,.011),jacket)
        lapel.rotation_euler[1]=side*.28
        detail('Patch pocket',(side*.047,.352,.042),(.039,.039,.012),jacket)
        detail('Pocket top seam',(side*.047,.371,.049),(.040,.0035,.003),dark,bevel=.0006)
    for y in [.36,.40,.44]:ell('Horn button',(.017,y,.055),(.004,.004,.002),button,'Root',12,8)
    detail('Pocket pencil',(-.046,.432,.050),(.005,.034,.005),accent)
    for x,b in [(-.083,'ArmL'),(.083,'ArmR')]:
        loft('Gathered sleeve',[(.335,x*1.10,0,.019,.021),(.36,x*1.11,0,.022,.023),(.43,x*1.06,0,.025,.024),(.488,x,0,.031,.028),(.511,x*.91,0,.023,.022)],jacket,b)
        loft('Turned cuff',[(.329,x*1.10,0,.020,.020),(.351,x*1.10,0,.022,.022)],dark,b)
        ell('Hand',(x*1.10,.317,.004),(.015,.023,.012),skin,b)
    ell('Neck',(0,.527,0),(.025,.035,.025),skin,'Root')
    loft('Head',[(.54,0,.008,.018,.018),(.558,0,.005,.031,.032),(.58,0,0,.038,.036),(.606,0,-.002,.039,.035),(.626,0,-.005,.030,.028),(.635,0,-.007,.012,.015)],skin,'Root',24)
    for x in [-.038,.038]:ell('Ear',(x,.582,0),(.009,.013,.009),skin,'Root',12,8)
    ell('Nose',(0,.577,.037),(.009,.013,.010),skin,'Root',12,8)
    for x in [-.015,.015]:
        ell('Eye',(x,.591,.033),(.004,.006,.0025),hair,'Root',12,8)
        ell('Eyebrow',(x,.603,.033),(.009,.002,.003),hair,'Root',12,8)
    ell('Mouth',(0,.557,.030),(.009,.0016,.002),pants,'Root',12,8)
    ell('Hair mass',(0,.620,-.008),(.042,.029,.038),hair,'Root')
    for i in range(7):
        x=-.034+i*.011
        o=ell('Swept curl',(x,.633+.006*math.sin(i*.8),.013),(.016,.018,.028),hair,'Root',14,10);o.rotation_euler[1]=-.42
    for x in [-.034,.034]:
        ell('Side lock',(x,.609,-.009),(.013,.024,.027),hair,'Root',14,10)
    # A real skin and armature, with named bones at original gameplay pivots.
    bpy.ops.object.armature_add(location=(0,0,0));rig=bpy.context.object;rig.name='MiniArmature'
    bpy.ops.object.mode_set(mode='EDIT')
    bones=rig.data.edit_bones;root=bones[0];root.name='Root';root.head=V(0,0,0);root.tail=V(0,.28,0)
    for name,head,tail in [('LegL',(-.041,.292,0),(-.041,.04,0)),('LegR',(.041,.292,0),(.041,.04,0)),('ArmL',(-.083,.492,0),(-.091,.33,0)),('ArmR',(.083,.492,0),(.091,.33,0))]:
        b=bones.new(name);b.head=V(*head);b.tail=V(*tail);b.parent=root
    bpy.ops.object.mode_set(mode='OBJECT')
    # Apply transforms and assign a single rigid weight per sculpted piece.
    # Body pieces overlap at joints; this is intentionally figurine articulation.
    for o,b in parts:
        select(o);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        group=o.vertex_groups.new(name=b);group.add(list(range(len(o.data.vertices))),1,'REPLACE')
    bpy.ops.object.select_all(action='DESELECT')
    for o,b in parts:o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0][0];bpy.ops.object.join()
    model=bpy.context.object;model.name='MiniSkin';model.parent=rig
    arm=model.modifiers.new('MiniSkin','ARMATURE');arm.object=rig
    export('mini-tailored')

architecture();character()
