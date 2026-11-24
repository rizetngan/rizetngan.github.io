import bpy
from pathlib import Path
root=Path.home()/'Downloads'/'rizet-h5-art'
bpy.ops.wm.open_mainfile(filepath=str(root/'h5-exact-bake-pilot.blend'))
desk=next(o for o in bpy.data.objects if o.name.startswith('DeskSurface__'))
assert len(desk.data.polygons)==828
# Preserve original material UV and exact independently baked UV as TEXCOORD_1.
mesh=desk.data
for u in list(mesh.uv_layers):
 if u.name not in ('UVMap','H5_LIGHTMAP'):mesh.uv_layers.remove(u)
mesh.uv_layers.active=mesh.uv_layers['UVMap']
mesh.uv_layers['UVMap'].active_render=True
print('EXPORT_UV',[(u.name,len(u.data)) for u in mesh.uv_layers],flush=True)
bpy.ops.object.select_all(action='DESELECT')
desk.select_set(True);bpy.context.view_layer.objects.active=desk
bpy.ops.export_scene.gltf(filepath=str(root/'exact-desk.glb'),export_format='GLB',use_selection=True,export_animations=False,export_materials='NONE',export_texcoords=True,export_normals=True)
print('GLB', (root/'exact-desk.glb').stat().st_size,flush=True)
