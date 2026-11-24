import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const ktx=path.resolve(process.cwd(),'../ktx/bin/ktx.exe');
const nameSet=['desktop-monitor','mechanical-keyboard','office-chair'];
for(const name of nameSet){
 const doc=await io.read(name+'-uncompressed.glb'),root=doc.getRoot();
 const seen=new Set();let n=0;
 for(const tex of root.listTextures()){
  if(tex.getMimeType()!=='image/ktx2')continue;
  const input=path.resolve(process.cwd(),name+'-'+n+'.ktx2');
  const output=path.resolve(process.cwd(),name+'-'+n+'.png');
  fs.writeFileSync(input,tex.getImage());
  try{
   execFileSync(ktx,['extract','--transcode','rgba8',input,output],{timeout:60000,stdio:'pipe'});
   const png=fs.readFileSync(output);tex.setImage(png);tex.setMimeType('image/png');
   console.log('DECODED',name,tex.getName(),n,'PNG',png.length);
  }catch(e){console.error('FAILED',name,tex.getName(),String(e.stderr||e).slice(0,400));throw e;}
  n++;
 }
 for(const ext of root.listExtensionsUsed())if(ext.extensionName==='KHR_texture_basisu')ext.dispose();
 await io.write(name+'-pbr.glb',doc);
 const size=fs.statSync(name+'-pbr.glb').size;
 console.log('PBR_MODEL',name,'MB',(size/1e6).toFixed(2),'textures',n);
}
