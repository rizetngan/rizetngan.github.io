// Geometry-conserving Blender compatibility conversion for CC0 art study.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import sharp from 'sharp';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const mk=async(c)=>sharp({create:{width:4,height:4,channels:4,background:c}}).png().toBuffer();
const neutral=await mk({r:195,g:198,b:192,alpha:1});
const normal=await mk({r:128,g:128,b:255,alpha:1});
const rough=await mk({r:255,g:210,b:0,alpha:1});
for(const name of ['desktop-monitor','mechanical-keyboard','office-chair']){
  const doc=await io.read(name+'-uncompressed.glb');
  const root=doc.getRoot();
  const normals=new Set(),roughs=new Set();
  for(const mat of root.listMaterials()){
    if(mat.getNormalTexture())normals.add(mat.getNormalTexture());
    if(mat.getMetallicRoughnessTexture())roughs.add(mat.getMetallicRoughnessTexture());
  }
  let count=0;
  for(const tex of root.listTextures()){
    if(tex.getMimeType()==='image/ktx2'){
      tex.setImage(normals.has(tex)?normal:roughs.has(tex)?rough:neutral);
      tex.setMimeType('image/png');
      count++;
    }
  }
  for(const ext of root.listExtensionsUsed()){
    if(ext.extensionName==='KHR_texture_basisu')ext.dispose();
  }
  await io.write(name+'-blender.glb',doc);
  console.log(name,'replaced_textures',count,'materials',root.listMaterials().map(m=>m.getName()),'textures',root.listTextures().length);
}
