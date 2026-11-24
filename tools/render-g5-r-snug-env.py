import bpy, math, numpy as np
from mathutils import Vector
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1];art=root/'assets'/'g5r'
bpy.ops.wm.open_mainfile(filepath=str(root/'art-assets/g5-r/atelier-final-g5r.blend'))
scene=bpy.context.scene;cam=scene.camera
V=lambda x,y,z:Vector((x,-z,y))
cam.location=V(1.63,1.49,1.67);look=V(.64,1.22,-.17)
cam.rotation_euler=(look-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.lens=67;cam.data.dof.use_dof=True;cam.data.dof.focus_distance=(look-cam.location).length
cam.data.dof.aperture_fstop=5.8
scene.render.engine='CYCLES';scene.cycles.samples=112;scene.cycles.use_denoising=True
try:
  pref=bpy.context.preferences.addons['cycles'].preferences
  pref.compute_device_type='OPTIX';pref.get_devices()
  for d in pref.devices:d.use=d.type=='OPTIX'
  scene.cycles.device='GPU'
except Exception:pass
scene.render.resolution_x=1300;scene.render.resolution_y=950;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=91
scene.render.filepath=str(art/'snug.jpg')
bpy.ops.render.render(write_still=True)
print('SNUG_PHOTO',(art/'snug.jpg').stat().st_size,flush=True)
# Same HDRI that lights the art master: browser-grade equirect preview used in PMREM
hdr=bpy.data.images.load(str(root/'art-assets/g5-r/poly_haven_studio_4k.hdr'),check_existing=True)
hdr.scale(1024,512)
p=np.array(hdr.pixels[:],dtype=np.float32).reshape(512,1024,4)[:,:,:3]
# RGBE HDR linear -> bounded display referred color. Keep glints and sky variation.
luma=(p*.2126+(p[...,1:2]*0)).sum(-1) if False else .2126*p[...,0]+.7152*p[...,1]+.0722*p[...,2]
print('HDR_STATS',float(np.quantile(luma,.5)),float(np.quantile(luma,.98)),flush=True)
p=(p*0.45)/(1+p*0.45)
p=np.power(np.clip(p,0,1),1/2.2)
result=(p*255+.5).astype('uint8')
Image.fromarray(result,'RGB').save(art/'studio-env.jpg',quality=85)
print('ENV_PHOTO',(art/'studio-env.jpg').stat().st_size,flush=True)
