"""H5.3 authored Blender art master, entrance / workbench study.
The V8 controller is not edited. These are offline visual design candidates,
not a web deployment or final validated collision scene.
"""
import bpy, math, json
from pathlib import Path
from mathutils import Vector, Matrix
from PIL import Image,ImageEnhance,ImageDraw
H=Path.home()/'Downloads';root=H/'rizet-h5';out=H/'rizet-h5-art';out.mkdir(exist_ok=True)
src=H/'rizet-g5-r/art-assets/g5-r'
bpy.ops.wm.open_mainfile(filepath=str(src/'atelier-final-g5r.blend'))
scene=bpy.context.scene
def V(x,y,z):return Vector((x,-z,y))
# Keep only authored commercial-quality source assets. Every old G5 room,
# background, primitive prop, stage and light is discarded.
keep_roots=['ASSET__desk_lamp_arm_01','ASSET__ceramic_vase_01','ASSET__modern_wooden_cabinet','ASSET__mid_century_lounge_chair','PRODUCT__desktop-monitor','PRODUCT__mechanical-keyboard','PRODUCT__office-chair']
roots=[bpy.data.objects.get(n) for n in keep_roots]
assert all(roots)
keep=set(roots)
for o in roots:keep.update(o.children_recursive)
for o in list(bpy.data.objects):
 if o not in keep:bpy.data.objects.remove(o,do_unlink=True)
for o in keep:
 if o.type=='MESH':o.hide_render=o.hide_viewport=False
# Remove duplicates, cables that cross the circulation route, and black
# original monitor glass (our actual project screen is a separate mesh).
for o in list(keep):
 if o.type=='MESH' and (o.name.startswith('screen') and not o.name.startswith('SCREEN__') or o.name.lower() in ('cable','cables')):
  if o.name in bpy.data.objects:bpy.data.objects.remove(o,do_unlink=True)
def rgb(h):
 c=[int(h[i:i+2],16)/255 for i in [0,2,4]]
 return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c)+(1,)
def material(name,h,rough=.7,metal=0):
 m=bpy.data.materials.new('H5 / '+name);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=rgb(h);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 m.diffuse_color=rgb(h);return m
def mineral(name,a,b,scale,rough=.9,bump=.008):
 m=material(name,a,rough);n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF')
 tc=n.new('ShaderNodeTexCoord');noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=scale
 noise.inputs['Detail'].default_value=3;noise.inputs['Roughness'].default_value=.67
 l.new(tc.outputs['Object'],noise.inputs['Vector']);r=n.new('ShaderNodeValToRGB')
 r.color_ramp.elements[0].position=.22;r.color_ramp.elements[0].color=rgb(a)
 r.color_ramp.elements[1].position=.78;r.color_ramp.elements[1].color=rgb(b)
 l.new(noise.outputs['Fac'],r.inputs['Fac']);l.new(r.outputs['Color'],p.inputs['Base Color'])
 micro=n.new('ShaderNodeTexNoise');micro.inputs['Scale'].default_value=150;micro.inputs['Detail'].default_value=2
 l.new(tc.outputs['Object'],micro.inputs['Vector'])
 bn=n.new('ShaderNodeBump');bn.inputs['Strength'].default_value=.22;bn.inputs['Distance'].default_value=bump
 l.new(micro.outputs['Fac'],bn.inputs['Height']);l.new(bn.outputs['Normal'],p.inputs['Normal'])
 return m
plaster=mineral('Warm ivory mineral plaster','B7A58D','D8CAB4',3.6,.93,.006)
stone=mineral('Honed warm travertine','A9957B','C9B9A2',4.5,.73,.009)
floor=mineral('Quiet limestone floor','9F8C74','B9A68C',7.5,.68,.004)
terra=mineral('Kiln-fired terracotta','713D29','9C5637',6,.8,.008)
brass=material('Patinated bronze','897456',.39,.72)
metal=material('Graphite metal','383A32',.45,.66)
black=material('Darkened steel','292D28',.5,.58)
paper=material('Uncoated paper','E9DEC9',.88)
warmwhite=material('Bone enamel','E3D9C6',.55,.08)
olive=mineral('Olive woven textile','4B503C','62654E',80,.97,.003)
glass=material('Screen glass','292C28',.25,.35)
wood=material('Smoke-brown walnut','6B4B35',.66)
n=wood.node_tree.nodes;l=wood.node_tree.links;p=n.get('Principled BSDF')
# Full source 2K PBR with a moderate, physically plausible brown grade.
for channel,file in [('Base Color','Diffuse'),('Roughness','Rough'),('Normal','nor_gl')]:
 path=src/'materials'/('smoked_walnut_veneer_'+file+'_2k.jpg')
 if channel=='Base Color':
  im=Image.open(path).convert('RGB');im=ImageEnhance.Brightness(im).enhance(.43);im=ImageEnhance.Color(im).enhance(.92)
  path=out/'h5-walnut-source.jpg';im.save(path,quality=94)
 t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(path),check_existing=True)
 if channel!='Base Color':t.image.colorspace_settings.name='Non-Color'
 if channel=='Normal':
  nn=n.new('ShaderNodeNormalMap');nn.inputs['Strength'].default_value=.34;l.new(t.outputs['Color'],nn.inputs['Color']);l.new(nn.outputs['Normal'],p.inputs['Normal'])
 else:l.new(t.outputs['Color'],p.inputs[channel])
def finish(o,m,bevel=0):
 o.data.materials.clear();o.data.materials.append(m)
 if bevel:
  b=o.modifiers.new('Machined radiused edges','BEVEL');b.width=bevel;b.segments=4
  o.modifiers.new('Surface normals','WEIGHTED_NORMAL')
 return o
def block(name,loc,dim,m,b=.01,grain='x'):
 bpy.ops.mesh.primitive_cube_add(size=1,location=V(*loc))
 o=bpy.context.object;o.name=name;o.dimensions=(dim[0],dim[2],dim[1])
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 # Dimensioned UVs, not a stretched one-texture-per-face box.
 if m==wood:
  uv=o.data.uv_layers.active
  for poly in o.data.polygons:
   normal=poly.normal
   for i in poly.loop_indices:
    v=o.data.vertices[o.data.loops[i].vertex_index].co
    if grain=='vertical':u,vv=(v.x+v.y)/1.4,v.z/1.9
    elif abs(normal.z)>.5:u,vv=v.x/2.1,v.y/1.05
    elif abs(normal.x)>.5:u,vv=v.y/1.5,v.z/.85
    else:u,vv=v.x/2.1,v.z/.85
    uv.data[i].uv=(u,vv)
 return finish(o,m,b)
def rod(name,a,b,r,m,r2=None):
 a,b=V(*a),V(*b);d=b-a
 bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=r,radius2=r2 if r2 is not None else r,depth=d.length,location=(a+b)/2)
 o=bpy.context.object;o.name=name;o.rotation_euler=d.to_track_quat('Z','Y').to_euler()
 return finish(o,m,.005)
def arch(name,cx,z,spring,r,thickness,depth,m):
 # Continuous closed manifold, extruded radial arch. Not an array of boxes.
 seg=64;verts=[];faces=[]
 for i in range(seg+1):
  a=math.pi*i/seg
  for zz,rr in [(z-depth/2,r),(z-depth/2,r+thickness),(z+depth/2,r+thickness),(z+depth/2,r)]:
   verts.append(V(cx+rr*math.cos(a),spring+rr*math.sin(a),zz))
 for i in range(seg):
  for j in range(4):faces.append((4*i+j,4*i+(j+1)%4,4*(i+1)+(j+1)%4,4*(i+1)+j))
 faces+=[(3,2,1,0),(4*seg,4*seg+1,4*seg+2,4*seg+3)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
 o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);finish(o,m,.018)
 # matching monolithic piers, preserve centered walking aperture.
 for sign in [-1,1]:block(name+' pier',(cx+sign*(r+thickness/2),spring/2,z),(thickness,spring,depth),m,.018)
 return o
def fit(root,loc,extent,yaw=0):
 # Normalize full model hierarchy using evaluated world bounds. Actual
 # manufacturer's geometry and source PBR preserved.
 root.rotation_mode='QUATERNION'
 root.rotation_quaternion=(Matrix.Rotation(math.radians(yaw),4,'Z')@root.rotation_quaternion.to_matrix().to_4x4()).to_quaternion()
 bpy.context.view_layer.update()
 def bounds():
  pts=[o.matrix_world@Vector(v) for o in [root]+list(root.children_recursive) if o.type=='MESH' and not o.hide_render for v in o.bound_box]
  return Vector(tuple(min(p[i] for p in pts) for i in range(3))),Vector(tuple(max(p[i] for p in pts) for i in range(3)))
 mn,mx=bounds();d=mx-mn
 k=min(extent[0]/d.x,extent[1]/d.z,extent[2]/d.y)
 root.scale*=k;bpy.context.view_layer.update();mn,mx=bounds()
 root.location+=V(*loc)-Vector(((mn.x+mx.x)/2,(mn.y+mx.y)/2,mn.z))
 bpy.context.view_layer.update()
 return root
def imported(file,name,loc,extent,yaw=0):
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(file))
 made=set(bpy.data.objects)-before;roots=[x for x in made if x.parent not in made]
 p=bpy.data.objects.new(name,None);scene.collection.objects.link(p)
 for x in roots:mw=x.matrix_world.copy();x.parent=p;x.matrix_world=mw
 return fit(p,loc,extent,yaw)
# Architecture in the same x/z coordinate system as V8. Main walk floor,
# worktop and rear exhibition anchors kept at their original heights.
block('ARCH / walnut gallery base',(0,-.29,2.6),(14.45,.36,16.35),wood,.06)
block('ARCH / stone foundation',(0,-.08,2.6),(14.18,.16,16.12),stone,.035)
# Large carefully jointed honed floor slabs, minimal tonal seams.
for ix in range(6):
 for iz in range(8):
  block('ARCH / honed slab',(-5.9+ix*2.36,-.014,-4.48+iz*2.04),(2.348,.028,2.028),floor,.003)
# Warm stone rear gallery and a thick modernist cutaway upper volume.
block('ARCH / rear gallery',(0,2.39,-5.53),(14.1,4.78,.42),plaster,.035)
block('ARCH / left back pier',(-6.81,2.4,-4.74),(.43,4.8,1.63),plaster,.032)
block('ARCH / left front pier',(-6.81,2.4,5.84),(.43,4.8,1.24),plaster,.032)
block('ARCH / deep stone sill',(-6.8,.44,.55),(.52,.88,9.0),stone,.025)
block('ARCH / left window head',(-6.81,4.46,.55),(.46,.67,9.0),plaster,.025)
# Architectural bronze windows: tall panes with deep stone reveals.
for z in [-3.89,-1.7,.5,2.7,4.96]:
 block('ARCH / bronzed window mullion',(-6.55,2.5,z),(.11,3.35,.10),metal,.008)
for y in [.92,2.57,4.13]:
 block('ARCH / bronze continuous rail',(-6.55,y,.55),(.10,.075,8.95),metal,.005)
block('ARCH / deep timber window bench',(-6.30,.87,.53),(.58,.085,9.0),wood,.022)
# Partial upper exhibition gallery, visually layered but no new gameplay floor.
block('ARCH / gallery mezzanine slab',(0,3.77,-3.81),(13.75,.27,2.95),plaster,.035)
block('ARCH / mezzanine walnut fascia',(0,3.68,-2.31),(13.8,.12,.12),wood,.012)
block('ARCH / suspended upper canopy',(0,6.10,-3.38),(14.05,.40,4.28),plaster,.04)
block('ARCH / upper rear wall',(0,4.98,-5.53),(14.1,2.5,.38),plaster,.025)
for x in [-6.8,-3.0,3.05,6.8]:
 block('ARCH / upper slender pier',(x,4.96,-2.2),(.28,2.18,.35),plaster,.022)
for x in [-6.8,-4.9,-3,-1.5,0,1.5,3,4.9,6.8]:
 rod('ARCH / gallery bronze upright',(x,3.88,-2.22),(x,4.71,-2.22),.027,brass)
block('ARCH / bronze gallery handrail',(0,4.71,-2.22),(13.8,.05,.055),brass,.012)
# Cutaway roof frames draw a clear long horizontal silhouette. Side wall
# is intentionally open in the exterior view, unlike the old closed box.
block('ARCH / left roof edge',(-6.8,5.98,1.52),(.52,.45,7.08),plaster,.032)
block('ARCH / right roof edge',(6.8,5.98,1.52),(.52,.45,7.08),plaster,.032)
block('ARCH / front canopy lintel',(0,5.98,4.93),(14.05,.45,.48),plaster,.032)
# Thick roof slab over the workroom, leaving the model cutaway open to
# the front. Actual side-lit ceiling, not a decorative cage.
block('ARCH / left studio roof',(-4.12,5.98,1.36),(5.80,.43,7.50),plaster,.035)
block('ARCH / right gallery roof',(4.91,5.98,1.36),(4.19,.43,7.50),plaster,.035)
block('ARCH / recessed walnut soffit',(-4.12,5.73,1.35),(5.58,.08,7.18),wood,.012)
block('ARCH / right architectural end wall',(6.81,2.93,-1.35),(.40,5.86,8.65),plaster,.028)
block('ARCH / upper right end wall',(5.78,4.97,-2.50),(1.85,2.05,.30),plaster,.03)
# Precise rear window-side jamb trim and gallery shadow line.
block('ARCH / walnut upper fascia',(0,5.84,-1.19),(13.45,.14,.11),wood,.014)
block('ARCH / stone gallery bottom reveal',(0,3.56,-2.31),(13.6,.09,.15),stone,.01)
for x in [-6.78,6.78]:
 block('ARCH / sculptural front column',(x,2.93,4.93),(.35,5.87,.38),plaster,.025)
# Single terracotta arch at the entrance, aperture fits original route.
# Integrate the portal into the building's right facade; preserve the
# central entry's open circulation lane. The new facade is an art candidate,
# not a collision-approved runtime replacement.
cx,z,sp,r,t=4.48,4.93,1.78,1.66,.47
arch('ARCH / sculpted terracotta portal',cx,z,sp,r,t,.58,terra)
# A curved extruded stone spandrel fills the space above the arch.
# Continuous topology: no boolean artefacts, no dangling ring.
vertices=[];faces=[];N=64
for i in range(N+1):
 a=math.pi*i/N;x=cx+(r+t)*math.cos(a);y=sp+(r+t)*math.sin(a)
 vertices.extend([V(x,y,z-.26),V(x,5.73,z-.26),V(x,5.73,z+.26),V(x,y,z+.26)])
for i in range(N):
 for j in range(4):faces.append((4*i+j,4*i+(j+1)%4,4*(i+1)+(j+1)%4,4*(i+1)+j))
faces.extend([(3,2,1,0),(4*N,4*N+1,4*N+2,4*N+3)])
mesh=bpy.data.meshes.new('Continuous portal spandrel');mesh.from_pydata(vertices,[],faces);mesh.update()
obj=bpy.data.objects.new('ARCH / carved portal spandrel',mesh);scene.collection.objects.link(obj);finish(obj,plaster,.015)
block('ARCH / portal side reveal',(6.72,1.83,z),(.17,3.66,.52),plaster,.015)
block('ARCH / shallow entry landing',(cx,.006,z+.22),(4.5,.012,1.2),stone,.004)
# Two shallow stone steps remain outside the protected main walk area.
block('ARCH / low gallery threshold',(0,-.015,7.75),(5.45,.03,.82),stone,.012)
# Worktable: existing 4.6 x 2.2 and y=1.02, art-directed walnut worktop
# with continuous grain and a contrasting precise dark metal trestle.
block('LAB / continuous walnut worktop',(0,.972,0),(4.60,.096,2.20),wood,.035)
block('LAB / recessed walnut underside',(0,.902,0),(4.38,.045,1.98),black,.009)
for x in [-1.88,1.88]:
 for z in [-.82,.82]:
  rod('LAB / tapered graphite legs',(x,.91,z),(x*1.025,.055,z*1.055),.057,metal,.038)
  rod('LAB / foot pad',(x*1.025,.018,z*1.055),(x*1.025,.048,z*1.055),.060,black)
 rod('LAB / low cross tie',(x,.30,-.78),(x,.30,.78),.026,metal)
block('LAB / olive wool rug',(0,.012,0),(5.65,.024,3.44),olive,.055)
block('LAB / saddle desk mat',(-.24,1.029,.39),(1.83,.018,.64),olive,.035)
# Real source model assets, deliberately coordinated in scale.
fit(bpy.data.objects['PRODUCT__desktop-monitor'],(-.35,1.02,-.45),(1.68,1.08,.70))
fit(bpy.data.objects['PRODUCT__mechanical-keyboard'],(-.36,1.045,.34),(1.08,.09,.45),180)
fit(bpy.data.objects['PRODUCT__office-chair'],(-.30,0,1.78),(1.18,1.48,1.16),180)
lamp=fit(bpy.data.objects['ASSET__desk_lamp_arm_01'],(1.82,1.02,-.32),(.70,1.30,.88),-20)
for ob in lamp.children_recursive:
 if ob.type=='MESH':
  for i,mat in enumerate(ob.data.materials):
   if mat and 'light' not in mat.name.lower():ob.data.materials[i]=metal
fit(bpy.data.objects['ASSET__ceramic_vase_01'],(-1.97,1.02,-.70),(.31,.46,.31))
fit(bpy.data.objects['ASSET__modern_wooden_cabinet'],(-4.7,0,-4.54),(3.5,1.26,.92))
fit(bpy.data.objects['ASSET__mid_century_lounge_chair'],(4.56,0,-1.12),(1.42,1.55,1.52),-22)
# Screen: actual project imagery on precise graphite portrait device.
def image_plane(name,path,loc,w,h):
 m=material(name,'FFFFFF',.42)
 n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF')
 t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(path),check_existing=True)
 l.new(t.outputs['Color'],p.inputs['Base Color']);l.new(t.outputs['Color'],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=.14
 # front is -Y (positive web z)
 bpy.ops.mesh.primitive_plane_add(size=1,location=V(*loc),rotation=(math.pi/2,0,0))
 o=bpy.context.object;o.name=name;o.scale=(w,h,1);o.data.materials.append(m);return o
block('LAB / portrait product shell',(1.1,1.46,-.39),(.39,.78,.055),metal,.025)
block('LAB / portrait foot',(1.1,1.044,-.39),(.39,.048,.30),metal,.018)
rod('LAB / portrait stem',(1.1,1.07,-.39),(1.1,1.22,-.39),.032,metal)
image_plane('LAB / Snug real interface',root/'assets/snug-phone-running.png',(1.1,1.46,-.358),.345,.71)
# Real paper and product development details, not repeated filler cubes.
book=imported(root/'assets/v8/notebook.glb','LAB / source notebook',(-1.53,1.02,.50),(.76,.11,.55),-8)
block('LAB / design drawing pad',(-1.55,1.026,-.10),(.78,.014,.57),paper,.007)
img=Image.new('RGB',(1024,740),'#e9dec9');d=ImageDraw.Draw(img)
d.line((90,80,920,80),fill='#6a665a',width=2);d.text((90,37),'RIZET NGAN / PRODUCT STUDIES',fill='#343c31')
for x,y in [(210,320),(600,340)]:
 d.rounded_rectangle((x-105,y-115,x+105,y+115),radius=18,outline='#827e70',width=3)
 d.line((x-130,y,x+130,y),fill='#a59a84',width=2);d.line((x,y-140,x,y+140),fill='#a59a84',width=2)
 d.ellipse((x-35,y-35,x+35,y+35),outline='#a56a46',width=3)
d.text((90,650),'01  /  form, rhythm and interface',fill='#6a665a')
draw=out/'h5-paper.jpg';img.save(draw,quality=94)
m=material('Printed product development study','FFFFFF',.95);n=m.node_tree.nodes;l=m.node_tree.links;t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(draw));l.new(t.outputs['Color'],n.get('Principled BSDF').inputs['Base Color'])
bpy.ops.mesh.primitive_plane_add(size=1,location=V(-1.55,1.035,-.10));o=bpy.context.object;o.name='LAB / original study sheet';o.scale=(.76,.55,1);o.data.materials.append(m)
rod('LAB / graphite pencil',(-1.15,1.05,.02),(-1.15,1.05,-.32),.009,black)
block('LAB / dark walnut swatch',(-1.97,1.04,.05),(.26,.035,.25),wood,.009)
block('LAB / mineral sample',(-1.93,1.069,.03),(.23,.025,.22),stone,.006)
block('LAB / bronze sample',(-1.88,1.088,.00),(.19,.015,.18),brass,.004)
block('LAB / low graphite accessory tray',(1.42,1.041,.60),(.50,.042,.29),black,.022)
# Rear gallery: coherent framed actual interface plates, walnut cabinet
# joinery and controlled local displays. These are art candidates only.
for x,id,imgname in [(-2.12,'Actape','actape-windows-preview.png'),(2.12,'Snug','snug-phone-running.png')]:
 block('WORK / recessed warm stone panel '+id,(x,2.13,-5.255),(3.48,3.49,.10),stone,.022)
 block('WORK / walnut exhibition cabinet '+id,(x,.71,-4.93),(3.17,1.19,.73),wood,.032)
 for k in [-1,0,1]:
  block('WORK / cabinet door',(x+k*1.02,.70,-4.552),(.99,.99,.045),wood,.012,'vertical')
  block('WORK / bronze recessed pull',(x+k*1.02,.98,-4.516),(.18,.035,.029),brass,.008)
 w,h=(2.38,1.50) if id=='Actape' else (.91,1.50)
 block('WORK / graphite product display '+id,(x,2.32,-5.16),(w+.12,h+.12,.10),metal,.021)
 image_plane('WORK / '+id+' real screenshot',root/'assets'/imgname,(x,2.32,-5.102),w,h)
 # Subtle label, not a fake giant poster.
 block('WORK / thin bronze museum label',(x,1.43,-5.10),(.77,.095,.025),brass,.008)
# Library shelving: consistent proportions, actual source book sets and
# broad negative space rather than the former rainbow grid.
for y in [.56,1.36,2.16,2.96]:
 block('NOTES / thin walnut shelf',(-6.10,y,-1.98),(.57,.065,3.42),wood,.018)
for z in [-3.69,-.27]:
 block('NOTES / walnut end gable',(-6.10,1.76,z),(.57,3.45,.09),wood,.015,'vertical')
for y,z in [(.6,-2.85),(1.40,-1.30),(2.20,-2.78)]:
 imported(root/'assets/v8/books.glb','NOTES / archival book set',(-6.10,y,z),(.48,.68,1.15),90)
# A few living organic forms with actual PBR leaf geometry. Avoid
# vegetation everywhere, and let the window-side plant cast real shadows.
plant=imported(root/'assets/v8/plant.glb','ARCH / window foliage',(-5.75,0,3.03),(.78,.78,.78))
plant2=imported(root/'assets/v8/plant.glb','ABOUT / tall plant',(5.65,0,-3.68),(.70,.70,.70),70)
# Upper gallery book and artifact glimpses reinforce a layered model.
for x in [-4.6,0,4.5]:
 block('ARCH / upper display shelf',(x,4.42,-4.78),(2.65,.10,1.0),wood,.018)
 imported(root/'assets/v8/books.glb','ARCH / upper archive collection',(x,4.48,-4.75),(1.45,.66,.58))
# Exterior tree, licensed source geometry, not a composited fake shadow.
# Keep roots outside the building and all playable paths.
treefile=out/'jacaranda/jacaranda_tree_1k.gltf'
if treefile.is_file():
 tree=imported(treefile,'STAGE / courtyard jacaranda',(-9.6,0,2.4),(6.4,8.0,6.4),27)
 print('COURTYARD_TREE_IMPORTED',len(tree.children_recursive),flush=True)
else:
 print('COURTYARD_TREE_MISSING',flush=True)
block('STAGE / low courtyard stone wall',(-12.8,.60,1.4),(.32,1.20,18),stone,.035)
# Exterior photography stage, outside playable floor. Not part of export.
block('STAGE / neutral mineral cyclorama',(0,-.60,0),(400,.18,400),plaster,.03)
# Lighting. One dominant warm directional source, subdued sky and
# physically bounced light. No dark green wall or uniform front flood.
world=bpy.data.worlds.new('H5 / soft sky');scene.world=world;world.use_nodes=True
bg=world.node_tree.nodes.get('Background');bg.inputs['Color'].default_value=(.75,.79,.86,1);bg.inputs['Strength'].default_value=.15
def area(name,loc,target,power,size,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='RECTANGLE';d.size=size;d.size_y=size*.8;d.color=color
 o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=V(*loc)
 o.rotation_euler=(V(*target)-o.location).to_track_quat('-Z','Y').to_euler();return o
area('LIGHT / window soft sky',(-9,5.0,2.0),(0,1.0,-.5),950,5,(1,.91,.80))
area('LIGHT / subtle front bounce',(3,5,9),(0,1,-1),155,6,(.94,.96,1))
area('LIGHT / upper gallery bounce',(0,5.5,-1),(0,4.2,-4),130,3,(1,.84,.66))
d=bpy.data.lights.new('LIGHT / afternoon sun','SUN');d.energy=2.8;d.angle=math.radians(1.8);d.color=(1,.85,.68)
o=bpy.data.objects.new('LIGHT / afternoon sun',d);scene.collection.objects.link(o)
o.rotation_euler=V(1,-.52,-.35).to_track_quat('-Z','Y').to_euler()
area('LIGHT / desk local warm pool',(1.8,2.0,-.1),(1.5,1.02,.38),38,.32,(1,.73,.48))
cd=bpy.data.cameras.new('H5 photographic lens');cam=bpy.data.objects.new('H5 photographic lens',cd);scene.collection.objects.link(cam);scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=72;scene.cycles.use_denoising=True;scene.cycles.max_bounces=7
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for dev in prefs.devices:dev.use=dev.type=='OPTIX'
if any(dev.type=='OPTIX' for dev in prefs.devices):scene.cycles.device='GPU'
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.13
def camera(loc,target,lens,stop):
 cam.location=V(*loc);cam.rotation_euler=(V(*target)-cam.location).to_track_quat('-Z','Y').to_euler()
 cd.lens=lens;cd.clip_end=1000;cd.dof.use_dof=True;cd.dof.focus_distance=(V(*target)-cam.location).length;cd.dof.aperture_fstop=stop
def photo(name,loc,target,lens,w,h,stop):
 camera(loc,target,lens,stop);scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.resolution_percentage=100
 scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=92;scene.render.filepath=str(out/(name+'.jpg'))
 bpy.ops.render.render(write_still=True);print('PHOTO',name,(out/(name+'.jpg')).stat().st_size,flush=True)
camera((-7.8,7.0,26.5),(0,2.70,2.0),42,10)
bpy.ops.file.pack_all();bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(out/'H5-pavilion-art-v03.blend'))
print('MASTER',len([o for o in scene.objects if o.type=='MESH']),(out/'H5-pavilion-art-v01.blend').stat().st_size,flush=True)
photo('h5-entrance-v03',(-7.8,7.0,26.5),(0,2.70,2.0),42,1440,960,10)
photo('h5-lab-v03',(4.45,2.53,3.6),(-.55,1.49,-.05),38,1440,960,7)
photo('h5-lab-detail-v03',(3.65,2.15,2.45),(-.4,1.52,-.30),43,1440,960,5.6)
print('H5_ART_V03_COMPLETE',flush=True)
