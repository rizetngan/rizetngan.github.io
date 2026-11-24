"""Integrate professionally art-directed G5-R into standalone portfolio.
Do not mutate /preview/g5/ or root production. All modifications on art branch.
"""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
app=root/'app.js';s=app.read_text(encoding='utf-8')
def patch(a,b):
 global s
 assert a in s,'NOT FOUND: '+a[:100]
 s=s.replace(a,b)
def chapter(k,cam,look,spawn):
 global s
 beg=s.index("      id: '"+k+"'")
 end=s.index("    }",beg)
 segment=s[beg:end]
 for field,new in [('camPos',cam),('camLook',look),('spawnPos',spawn)]:
  segment,c=re.subn(r'('+field+r': new THREE\.Vector3\()[^)]*(\))',lambda m:m.group(1)+new+m.group(2),segment,count=1)
  assert c==1,(k,field)
 s=s[:beg]+segment+s[end:]
chapter('entrance','4.25, 2.75, 6.55','-.1, 1.22, -.34','0, 0, 4.25')
chapter('corridor','1.85, 2.06, 4.45','0, 1.16, -.36','0, 0, 3.45')
chapter('lab','2.33, 1.57, 2.85','-.12, 1.16, -.25','0, 0, 1.75')
chapter('work','3.25, 2.15, 2.65','1.32, 1.65, -3.38','1.98, 0, -2.55')
chapter('notes','-2.25, 2.1, 1.25','-2.45, .95, -2.6','-2.4, 0, -.9')
chapter('about','2.70, 2.02, 1.05','2.12, 2.43, -3.35','2.6, 0, -.90')
patch("const DESK_BOUNDS = { minX: -2.35, maxX: 2.35, minZ: -1.15, maxZ: 1.15, topY: 1.02 };","const DESK_BOUNDS = { minX: -1.225, maxX: 1.225, minZ: -.615, maxZ: .615, topY: .79 };")
patch("const FLOOR_BOUNDS = { minX: -5.7, maxX: 5.7, minZ: -4.55, maxZ: 10.6 };","const FLOOR_BOUNDS = { minX: -4.06, maxX: 4.06, minZ: -3.48, maxZ: 5.12 };")
def exhibit(k,fields):
 global s
 start=s.index("      id: '"+k+"',",s.index('const WALL_EXHIBITS = ['))
 end=s.index("    }",start)
 seg=s[start:end]
 for field,value in fields.items():
  if field=='triggerRadius':
   seg,n=re.subn(r'(?<=triggerRadius: )[\d.]+',value,seg,count=1)
  else:
   seg,n=re.subn(r'('+field+r': new THREE\.Vector3\()[^)]*(\))',lambda m:m.group(1)+value+m.group(2),seg,count=1)
  assert n==1,(k,field)
 s=s[:start]+seg+s[end:]
exhibit('actape',dict(triggerCenter='-2.48, 0, -2.24',triggerRadius='.95',hoverPos='-2.51, 1.18, -2.52',safeFloorPos='-2.45, 0, -1.78',camPos='-1.55, 1.95, -1.0',camLook='-2.45, 1.05, -2.64'))
exhibit('snug',dict(triggerCenter='2.05, 0, -2.72',triggerRadius='.90',hoverPos='2.13, 1.84, -3.28',safeFloorPos='2.10, 0, -2.25',camPos='2.55, 2.46, -1.42',camLook='2.15, 2.32, -3.38'))
start=s.index('  const FOCUS_OBJECTS = [')
end=s.index('  ];',start)+5
s=s[:start]+"""  const FOCUS_OBJECTS = [
    { id: 'lab', label: 'Actape · 工作台', surface: 'desk', pos: new THREE.Vector3(-.16,.79,-.27), radius: .63, camOffset: new THREE.Vector3(.38,.83,1.30) },
    { id: 'snug', label: 'Snug · 竖屏设备', surface: 'desk', pos: new THREE.Vector3(.65,.79,-.17), radius: .52, camOffset: new THREE.Vector3(.50,.74,1.16) },
    { id: 'notes', label: '设计手稿', surface: 'desk', pos: new THREE.Vector3(-.84,.79,.27), radius: .38, camOffset: new THREE.Vector3(-.38,.75,1.05) },
    { id: 'notes', label: '低柜与创作档案', surface: 'floor', pos: new THREE.Vector3(-2.48,0,-2.24), radius: 1.02, camOffset: new THREE.Vector3(1.25,1.35,1.25) },
    { id: 'about', label: '工作室墙面', surface: 'floor', pos: new THREE.Vector3(2.15,0,-2.70), radius: 1.04, camOffset: new THREE.Vector3(-1.20,1.48,1.22) }
  ];""" +s[end:]
patch("return Math.abs(pos.x) <= 1.55 && pos.z >= 1.15 && pos.z <= 2.15;","return Math.abs(pos.x) <= .75 && pos.z >= .72 && pos.z <= 1.72;")
patch("const landX = THREE.MathUtils.clamp(STATE.charPos.x, -1.35, 1.35);","const landX = THREE.MathUtils.clamp(STATE.charPos.x, -.62, .62);")
patch("new THREE.Vector3(landX, DESK_BOUNDS.topY, 0.62)","new THREE.Vector3(landX, DESK_BOUNDS.topY, .43)")
patch("THREE.MathUtils.clamp(landPos.x, -2.1, 2.1)","THREE.MathUtils.clamp(landPos.x, -1.0, 1.0)")
patch("THREE.MathUtils.clamp(landPos.z, -1.0, 1.0)","THREE.MathUtils.clamp(landPos.z, -.46, .46)")
# old desk blockers and fake architectural obstacles
start=s.index('    const archObstacles = [')
end=s.index('    archObstacles.forEach',start)
s=s[:start]+"""    const archObstacles = [
      [-3.50,-1.55,-3.03,-2.20],
      [3.65,4.09,-3.82,-1.30]
    ];
""" +s[end:]
start=s.index('    const pillars = [')
end=s.index('    pillars.forEach',start)
s=s[:start]+"""    const pillars = [
      {x: -.50,z:-1.18,r:.43},
      {x: 2.40,z:-2.57,r:.46}
    ];
""" +s[end:]
start=s.index("    const monitorBox = {")
end=s.index("    p.x = THREE.MathUtils.clamp(p.x, DESK_BOUNDS.minX",start)
s=s[:start]+"""    const monitorBox = {minX: -.59,maxX:.33,minZ:-.49,maxZ:-.05};
    if (p.x>monitorBox.minX && p.x<monitorBox.maxX &&
        p.z>monitorBox.minZ && p.z<monitorBox.maxZ) p.z=monitorBox.maxZ;
    // Sculptural lamp sits on the far-right edge.
    if(p.x>.80 && p.x<1.19 && p.z>-.52 && p.z<-.10)p.z=-.10;
""" +s[end:]
patch("STATE.desiredCamPos.set(3.6, 3.0, 8.8);","STATE.desiredCamPos.set(3.32, 2.65, 6.1);")
patch("STATE.desiredCamLook.set(0, 1.4, -.15);","STATE.desiredCamLook.set(0, 1.15, -.25);")
patch("if (pos.z > 7.2) return 'ENTRANCE';","if (pos.z > 4.0) return 'ENTRANCE';")
patch("if (pos.z > 2.6) return 'THE CORRIDOR';","if (pos.z > 2.1) return 'THE CORRIDOR';")
patch("if (pos.x < -3.0) return 'NOTES LIBRARY';","if (pos.x < -2.2) return 'NOTES LIBRARY';")
# ensure new app is a semantic archive surface: actual page users need not
# use the 3D world to read project information, existing DOM overlay retained.
app.write_text(s,encoding='utf-8')

p=root/'atelier-scene.js';s=p.read_text(encoding='utf-8')
def scene_patch(a,b):
 global s
 assert a in s,'MISSING SCENE '+a[:120]
 s=s.replace(a,b)
scene_patch("new THREE.GLTFLoader().load('assets/g5/studio.glb'","new THREE.GLTFLoader().load('assets/g5r/studio.glb'")
scene_patch("      renderer.toneMappingExposure=0.96;","      renderer.toneMappingExposure=.93;")
scene_patch("      hemi.intensity=.64;hemi.color.set(0xF6EBD8);hemi.groundColor.set(0x928777);","      hemi.intensity=.71;hemi.color.set(0xE5E0D2);hemi.groundColor.set(0x6C675D);")
scene_patch("      sun.intensity=1.45;sun.position.set(-11,4.8,4.6);sun.color.set(0xFFE2B7);","      sun.intensity=1.26;sun.position.set(-9.5,8.6,2.5);sun.color.set(0xFFE5C0);")
scene_patch("      fillLight.intensity=.45;fillLight.position.set(3.7,5,6.5);fillLight.color.set(0xDEE8E4);","      fillLight.intensity=.36;fillLight.position.set(3.2,5.3,4.4);fillLight.color.set(0xD7E2E0);")
scene_patch("      deskLampLight.position.set(1.44,1.82,-.57);deskLampLight.intensity=.65;","      deskLampLight.position.set(.93,1.5,-.30);deskLampLight.intensity=.75;")
scene_patch("      scene.background.set(0x242825).convertSRGBToLinear();scene.fog.color.copy(scene.background);scene.fog.density=.003;","      scene.background.set(0x202820).convertSRGBToLinear();scene.fog.color.copy(scene.background);scene.fog.density=.002;")
scene_patch("        o.castShadow=!name.startsWith('COL_floor');o.receiveShadow=true;","""        if(name.startsWith('COL_')){
          o.visible=false;o.castShadow=false;o.receiveShadow=false;
          cameraColliders.push(o);return;
        }
        o.castShadow=!name.startsWith('Stone_floor');o.receiveShadow=true;""")
scene_patch("        if(name.startsWith('COL_')&&!name.startsWith('COL_floor'))cameraColliders.push(o);","        // Colliders are separate invisible meshes, with no visual materials.")
scene_patch("        if(name.startsWith('LAB_Actape'))id='lab';","        if(name.startsWith('LAB_Actape'))id='lab';")
# Replace 2019 hard-coded window wall guard that belongs to old E2 scale.
scene_patch("""      const windowGuard=new THREE.Mesh(new THREE.BoxGeometry(.06,3.45,5.75),new THREE.MeshBasicMaterial({visible:false}));
      windowGuard.position.set(-6.6,2.67,2.65);model.add(windowGuard);cameraColliders.push(windowGuard);
      scene.add(model);model.updateMatrixWorld(true);""","""      // Click-to-walk proxies share the exact physical top of the G5-R desk.
      deskTopMesh.geometry.dispose();
      deskTopMesh.geometry=new THREE.BoxGeometry(2.45,.082,1.23);
      deskTopMesh.position.set(0,.745,0);
      // Real photograph HDRI is converted to a small equirectangular map.
      const loader=new THREE.TextureLoader();
      loader.load('assets/g5r/studio-env.jpg',t=>{
        t.mapping=THREE.EquirectangularReflectionMapping;
        t.encoding=THREE.sRGBEncoding;
        const envGen=new THREE.PMREMGenerator(renderer);
        const built=envGen.fromEquirectangular(t);
        scene.environment=built.texture;
        envGen.dispose();t.dispose();
      },undefined,()=>{});
      scene.add(model);model.updateMatrixWorld(true);""")
p.write_text(s,encoding='utf-8')
# Replace primary portfolio photos but keep existing real UI screenshots on detail pages.
for f in ['index.html','actape.html','snug.html']:
 p=root/f;s=p.read_text(encoding='utf-8')
 for a,b in [('assets/g5/hero.jpg','assets/g5r/hero.jpg'),
             ('assets/g5/studio.jpg','assets/g5r/atelier.jpg'),
             ('assets/g5/actape.jpg','assets/g5r/actape.jpg'),
             ('assets/g5/snug.jpg','assets/g5r/snug.jpg')]:
  s=s.replace(a,b)
 s=s.replace('g5.css"></head>','g5.css"><link rel="stylesheet" href="g5r.css"></head>')
 p.write_text(s,encoding='utf-8')
p=root/'studio.html';s=p.read_text(encoding='utf-8')
s=s.replace('href="studio-g5.css"','href="studio-g5.css" /><link rel="stylesheet" href="studio-g5r.css"')
p.write_text(s,encoding='utf-8')
(root/'g5r.css').write_text("""/* G5-R · Cinematic Product Atelier — intentional editorial refinements */
:root{--dark:#202820;--olive:#2b382e;--cream:#e9e4d8;--orange:#b85b30}
body{background:#e9e4d8}
.site-nav{background:#202820;border-bottom-color:rgba(244,239,227,.13)}
.brand{letter-spacing:-.05em}
.hero{background:#202820;grid-template-columns:minmax(260px,.82fr) minmax(0,1.18fr);min-height:min(920px,calc(100svh - 85px))}
.hero h1{font-size:clamp(76px,8vw,132px);letter-spacing:-.058em}
.hero h1 i{color:#c7a782}
.hero-copy p{color:#c5c7bd}
.hero-image{background:#30382f}
.hero-image img{object-position:50% 54%;filter:contrast(1.045) saturate(.94)}
.hero-image figcaption{display:none}
.work-image{background:#242c26}
.work-image img{filter:saturate(.95)}
.studio-section{background:#29362e}
.studio-grid img{filter:contrast(1.035)}
.section-heading{border-color:rgba(40,42,37,.24)}
.studio-copy p{color:#d2d0c5}
@media(max-width:900px){.hero{min-height:auto}.hero-image img{height:auto}}
@media(max-width:560px){.hero{padding-top:28px}.hero h1{font-size:clamp(65px,16vw,86px)}.hero-image img{aspect-ratio:1/1;object-position:49% 55%}}
""",encoding='utf-8')
(root/'studio-g5r.css').write_text("""/* Mode separation: content-first pages vs. premium sculptural studio */
body,.atelier-shell{background:#202820}
.studio-loader{background:#202820}
.site-header{background:linear-gradient(to bottom,rgba(24,29,24,.77),transparent)!important}
.canvas-grain{opacity:.012!important}
.canvas-vignette{background:radial-gradient(ellipse,transparent 42%,rgba(8,13,10,.4) 100%)!important}
.entrance-hero::before{background:linear-gradient(to right,rgba(25,31,25,.82),transparent 80%)!important}
.entrance-hero h1 em{color:#c7a782}
@media(max-width:720px){.entrance-hero::before{background:linear-gradient(to top,rgba(25,31,25,.89),transparent 90%)!important}}
""",encoding='utf-8')
print('INTEGRATION_PATCHED')
