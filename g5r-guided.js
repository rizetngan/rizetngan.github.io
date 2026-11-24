/* G5-R Hybrid: Cycles renders for editorial Guided; native WebGL for Mini.
   This is a true mode switch, not simulated free camera movement on photos. */
(()=>{
'use strict';
const viewport=document.getElementById('viewport');
const canvas=document.getElementById('atelierCanvas');
if(!viewport||!canvas)return;
const layers=document.createElement('div');
layers.className='guided-cinema';layers.setAttribute('aria-hidden','true');
canvas.after(layers);
const photos={
 entrance:'assets/g5r/atelier.jpg',
 corridor:'assets/g5r/atelier.jpg',
 lab:'assets/g5r/hero.jpg',
 work:'assets/g5r/snug.jpg',
 notes:'assets/g5r/objects.jpg',
 about:'assets/g5r/atelier.jpg'
};
const positions={entrance:'52% 48%',corridor:'36% 38%',lab:'50% 58%',work:'58% 52%',notes:'56% 50%',about:'90% 56%'};
const imgs=new Map();
for(const url of new Set(Object.values(photos))){
 const im=document.createElement('img');
 im.src=url;im.alt='';im.decoding='async';im.loading='eager';
 im.className='guided-cinema-frame';imgs.set(url,im);layers.append(im);
}
function show(chapter){
 const url=photos[chapter]||photos.lab;
 for(const [src,img] of imgs){
  img.classList.toggle('shown',src===url);
  if(src===url)img.style.objectPosition=positions[chapter]||'center';
 }
}
show('lab');
let previousChapter='';
let previousLive=null;
function tick(){
 const st=window.__atelierQA?.getState?.();
 if(st){
  const chapter=st.chapter||'lab';
  if(chapter!==previousChapter){previousChapter=chapter;show(chapter);}
  const live=!['GUIDED','READING'].includes(st.mode);
  if(live!==previousLive){
   previousLive=live;
   document.getElementById('app')?.classList.toggle('g5r-live',live);
  }
 }
 setTimeout(tick,160);
}
tick();
})();
