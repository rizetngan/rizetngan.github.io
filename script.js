
(()=>{
  'use strict';
  const root=document.getElementById('app');
  const world=document.getElementById('world');
  const viewport=document.getElementById('viewport');
  const enter=document.getElementById('enterStudio');
  const browse=document.getElementById('browseDirect');
  const chip=document.getElementById('visitChip');
  const visitOverline=document.getElementById('visitOverline');
  const visitTitle=document.getElementById('visitTitle');
  const visitDescription=document.getElementById('visitDescription');
  const visitAction=document.getElementById('visitAction');
  const locationText=document.getElementById('locationText');
  const modeSwitch=document.getElementById('modeSwitch');
  const modeLabel=document.getElementById('modeLabel');
  const controlHint=document.getElementById('controlHint');
  const overlay=document.getElementById('contentOverlay');
  const panel=document.getElementById('contentPanel');
  const panelBody=document.getElementById('panelBody');
  const panelIndex=document.getElementById('panelIndex');
  const panelScroll=document.getElementById('panelScroll');
  const helpOverlay=document.getElementById('helpOverlay');
  const toast=document.getElementById('toast');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchDevice=window.matchMedia('(hover:none) and (pointer:coarse)').matches;
  const entries={
    home:{name:'入口',eyebrow:'00 / WELCOME',desc:'一间关于产品、技术与好奇心的私人空间。',camera:{x:-350,y:-80,z:820,yaw:0,pitch:2},content:'about'},
    studio:{name:'中央工作室',eyebrow:'01 / THE STUDIO',desc:'从这里开始。点击工作台、作品墙或者书架。',camera:{x:0,y:-85,z:610,yaw:0,pitch:1},content:'lab'},
    lab:{name:'创作工作台',eyebrow:'02 / THE LAB',desc:'关于产品、原型，以及那些忍不住动手实现的想法。',camera:{x:0,y:-80,z:145,yaw:0,pitch:3},content:'lab'},
    work:{name:'作品展示墙',eyebrow:'03 / SELECTED WORKS',desc:'从真实问题出发，做有用的产品。',camera:{x:0,y:-120,z:65,yaw:0,pitch:-1},content:'work'},
    notes:{name:'私人笔记书架',eyebrow:'04 / NOTES',desc:'观察、拆解与尚未写完的思考。',camera:{x:-455,y:-60,z:155,yaw:-22,pitch:1},content:'notes'},
    now:{name:'近期与灵感',eyebrow:'05 / CURRENTLY',desc:'当前在做的事，比一张完整履历更有趣。',camera:{x:485,y:-70,z:155,yaw:20,pitch:1},content:'now'},
    about:{name:'关于 rizet',eyebrow:'06 / ABOUT',desc:'从商业、产品到独立创造，一个还在发生的故事。',camera:{x:490,y:-70,z:-120,yaw:20,pitch:1},content:'about'}
  };
  const ordered=['home','studio','lab','work','notes','now','about'];
  const articleData={
    work:{index:'WORK / 01',kicker:'SELECTED WORK / INDEPENDENT PRODUCT',title:'Actape',lead:'把重复的鼠标与键盘操作，变成可录制、可编辑、可复用的工作流程。',art:'ACTAPE',artClass:'',intro:'从重复的操作中寻找一个更轻量的答案。Actape 是一款跨 macOS 和 Windows 的鼠标键盘宏工具，覆盖录制、编辑、触发和回放。',detail:'它是一个完整的独立产品实践：从理解用户操作，到跨端界面、交互细节与发布验收。项目的实际功能和版本信息以 GitHub 仓库为准。',highlights:['跨 macOS / Windows 的本地应用','记录、编辑与复用自动化动作','从交互设计到版本交付'],links:[['GitHub 源码 ↗','https://github.com/rizetngan/Actape'],['下载与版本 ↗','https://github.com/rizetngan/Actape/releases']]},
    snug:{index:'WORK / 02',kicker:'SELECTED WORK / CROSS-PLATFORM',title:'Snug for Windows',lead:'尝试让 Windows 电脑在手机上拥有更自然的远程操作体验。',art:'SNUG',artClass:'snug',intro:'项目探索了桌面应用如何适配手机竖屏的尺寸与交互习惯，并围绕真实场景进行反复打磨。',detail:'这是基于上游 Snug 的 Windows 社区移植项目，包含独立实现、测试记录和应用截图。应保留上游项目信息与致谢。',highlights:['Windows 竖屏工作空间','触控体验与桌面窗口适配','真实设备验证与迭代'],links:[['GitHub 源码 ↗','https://github.com/rizetngan/snug-for-windows']]},
    lab:{index:'LAB / 01',kicker:'WORK IN PROGRESS / EXPERIMENTS',title:'Ideas to things.',lead:'这里存放那些还不够成熟，但值得动手验证的想法。',art:'LAB / 01',artClass:'lab',intro:'不是每个想法都需要变成正式产品。有时候，一个交互原型、一个新的工作流或一段小程序，就足够回答一个重要的问题。',detail:'这个实验室将逐步收录 AI 工作流、独立开发的小工具、原型和交互实验。首版先接入已公开的作品，后续再增加可直接运行的网页 Demo。',highlights:['独立产品与原型','AI / Agent 工作流实验','持续更新的创造记录'],links:[['查看 Actape ↗','https://github.com/rizetngan/Actape'],['查看 Snug ↗','https://github.com/rizetngan/snug-for-windows']]},
    notes:{index:'NOTES / 01',kicker:'FIELD NOTES / THINKING IN PROGRESS',title:'Notes & thoughts.',lead:'记录一些关于产品、技术、商业与日常体验的观察。',art:'THINKING',artClass:'notes',intro:'不必每篇都写成结论完整的长文。一个真实的问题、一段产品拆解、一次实验后的复盘，都可以成为这里的一篇笔记。',detail:'当前是结构验证内容，不表示这些文章已经发表。正式上线会将真实写作存成 Markdown，并为每篇提供独立 URL。',highlights:['为什么 AI 产品需要好的工作流？','把想法做成工具，学到了什么？','一个产品体验为什么让人记住？'],links:[]},
    now:{index:'CURRENTLY / 01',kicker:'CURRENTLY EXPLORING / 2026',title:'What I’m making.',lead:'正在研究的问题和正在动手的作品，比静态的头衔更接近我。',art:'NOW',artClass:'now',intro:'这个角落会经常变化：今天是一个尚未解决的体验问题，明天可能是一个刚做出来的小原型。',detail:'当前关注：AI 与产品体验、独立开发、从问题到实际交付的过程。之后可通过单独配置文件更新这块内容。',highlights:['AI / Product','Independent Building','Interaction & Experience'],links:[]},
    about:{index:'ABOUT / 01',kicker:'ABOUT THE MAKER / RIZET NGAN',title:'rizet ngan.',lead:'喜欢把问题想明白，也喜欢把想法做出来。',art:'r.n',artClass:'about',intro:'从商业业务与用户需求的实践出发，逐渐走向产品设计与技术实现。这间工作室收集的是沿途做出的作品，以及还在继续思考的问题。',detail:'这里会逐步补充职业经历、真实项目、个人故事以及联系信息。独立品牌不等于与真实经历脱离，所有故事都从作品和实际经验出发。',highlights:['Product / Business / Technology','Independent Maker','Curiosity, made tangible'],links:[['GitHub ↗','https://github.com/rizetngan']]}
  };
  const state={mode:'guided',current:'home',entered:false,reading:false,help:false,focused:'home',prevFocusedElement:null,pointerLocked:false,suspendUnlock:false,lockPending:false,
    camera:{...entries.home.camera},target:{...entries.home.camera},mouse:{x:0,y:0},wheel:0,lastWheel:0,pressed:new Set(),lastFrame:performance.now(),touchY:null,transitionUntil:0};
  let toastTimeout=0;
  const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  const wrapAngle=(angle)=>((angle+180)%360+360)%360-180;
  const deltaAngle=(a,b)=>wrapAngle(b-a);
  function announce(message){toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('visible'),2800)}
  function modeVisual(){root.classList.toggle('roaming',state.mode==='roam');viewport.classList.toggle('roam',state.mode==='roam');modeLabel.textContent=state.mode==='roam'?'自由漫游':'导览模式';modeSwitch.setAttribute('aria-label',state.mode==='roam'?'返回导览模式':'切换为第一人称漫游');controlHint.textContent=state.mode==='roam'?'WASD 移动 · E 交互':'滚轮探索空间';}
  function chipUpdate(id){const data=entries[id];visitOverline.textContent=data.eyebrow;visitTitle.textContent=data.name;visitDescription.textContent=data.desc;visitAction.dataset.content=data.content;document.querySelectorAll('.main-nav [data-goto]').forEach(el=>el.classList.toggle('active',el.dataset.goto===id));locationText.textContent=id==='home'?'THE OPEN STUDIO':data.name.toUpperCase();}
  function enterStudio(){if(!state.entered){state.entered=true;root.classList.add('entered');}}
  function goto(id,{quiet=false}={}){
    if(!entries[id])return;
    if(state.reading)closeContent();
    if(state.help)hideHelp();
    enterStudio();
    if(state.mode==='roam')leaveRoam({navigate:false});
    state.current=id;state.focused=id;
    state.target={...entries[id].camera};
    state.transitionUntil=performance.now()+950;
    chipUpdate(id);
    if(!quiet)history.replaceState(null,'',`#${id}`);
  }
  function advance(dir){const i=ordered.indexOf(state.current);goto(ordered[clamp(i+dir,0,ordered.length-1)]);}
  function enterRoam(){
    if(touchDevice){announce('触控设备使用点击导览，键盘漫游请在电脑端体验');return;}
    if(state.reading){closeContent();}
    if(state.help)hideHelp();
    enterStudio();
    state.mode='roam';state.pressed.clear();state.camera.x=clamp(state.camera.x,-780,780);state.camera.z=clamp(state.camera.z,-900,800);
    // We transition from the guide camera; desk collision is active only on new movement.
    state.target={...state.camera};modeVisual();requestPointerLock();
  }
  function requestPointerLock(){if(!viewport.requestPointerLock)return announce('当前浏览器不支持鼠标锁定');try{const p=viewport.requestPointerLock({unadjustedMovement:false});if(p&&p.catch)p.catch(()=>announce('点击场景继续控制视角'));}catch{announce('点击场景继续控制视角');}}
  function leaveRoam({navigate=true}={}){
    if(state.mode!=='roam')return;
    state.mode='guided';state.pressed.clear();modeVisual();
    if(document.pointerLockElement)document.exitPointerLock();
    if(navigate){const nearest=Object.entries(entries).filter(([k])=>k!=='home').map(([k,v])=>({k,d:Math.hypot(state.camera.x-v.camera.x,state.camera.z-v.camera.z)})).sort((a,b)=>a.d-b.d)[0];goto(nearest?nearest.k:'studio');}
  }
  function toggleMode(){state.mode==='roam'?leaveRoam():enterRoam()}
  function openContent(id){
    const data=articleData[id];if(!data)return;
    state.prevFocusedElement=document.activeElement;
    state.reading=true;state.suspendUnlock=true;
    if(document.pointerLockElement)document.exitPointerLock();
    state.pressed.clear();
    panelIndex.textContent=`RIZET NGAN / ${data.index}`;
    panelBody.innerHTML=`<article class="panel-body"><div class="panel-kicker">${data.kicker}</div><h2 id="panelTitle">${data.title}</h2><p class="panel-lead">${data.lead}</p><div class="project-artwork ${data.artClass}"><strong>${data.art}</strong><small>RIZET STUDIO / ${data.index}</small></div><h3>THE IDEA</h3><p>${data.intro}</p><p>${data.detail}</p><h3>WHAT'S INSIDE</h3><ul class="panel-list">${data.highlights.map((s,i)=>`<li><em>0${i+1}</em><span>${s}</span></li>`).join('')}</ul>${data.links.length?`<div class="panel-links">${data.links.map(([label,link])=>`<a href="${link}" target="_blank" rel="noopener noreferrer">${label}</a>`).join('')}</div>`:''}</article>`;
    panelScroll.scrollTop=0;
    overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');root.classList.add('reading');
    setTimeout(()=>panel.focus({preventScroll:true}),30);
  }
  function closeContent(){
    if(!state.reading)return;state.reading=false;overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');root.classList.remove('reading');
    if(state.prevFocusedElement&&state.prevFocusedElement.focus)state.prevFocusedElement.focus({preventScroll:true});
    state.suspendUnlock=false;
    if(state.mode==='roam')announce('点击空间继续漫游，按 Esc 返回导览');
  }
  function showHelp(){if(state.reading)closeContent();state.help=true;state.suspendUnlock=true;if(document.pointerLockElement)document.exitPointerLock();helpOverlay.classList.add('open');helpOverlay.setAttribute('aria-hidden','false');document.getElementById('closeHelp').focus({preventScroll:true})}
  function hideHelp(){state.help=false;helpOverlay.classList.remove('open');helpOverlay.setAttribute('aria-hidden','true');state.suspendUnlock=false}
  function nearestInteraction(){
    const keys=['lab','work','notes','now','about'];
    let best=null;
    for(const key of keys){const t={lab:[0,-230],work:[0,-850],notes:[-690,-525],now:[680,-560],about:[640,-860]}[key];const dist=Math.hypot(state.camera.x-t[0],state.camera.z-t[1]);if(!best||dist<best.dist)best={key,dist};}
    return best;
  }
  function interact(){if(state.mode!=='roam')return;const near=nearestInteraction();if(!near||near.dist>500){announce('再靠近一些，按 E 探索物品');return;}const name=near.key;state.current=name;chipUpdate(name);openContent(entries[name].content);}
  // Prevent walking through the desk in the prototype; the full 3D build will use collision meshes.
  function movable(x,z){if(x<-815||x>815||z<-990||z>840)return false;const nearDesk=x>-355&&x<355&&z>-475&&z<-115;if(nearDesk)return false;return true;}
  document.getElementById('enterStudio').addEventListener('click',()=>goto('studio'));
  browse.addEventListener('click',()=>{goto('work');openContent('work')});
  document.getElementById('brandHome').addEventListener('click',e=>{e.preventDefault();goto('home');root.classList.remove('entered');state.entered=false;history.replaceState(null,'','#home')});
  document.querySelectorAll('[data-goto]').forEach(btn=>btn.addEventListener('click',()=>goto(btn.dataset.goto)));
  document.querySelectorAll('[data-focus]').forEach(btn=>btn.addEventListener('click',()=>{
    if(state.mode==='roam')return;
    const id=btn.dataset.focus,content=btn.dataset.open;
    if(state.current===id){openContent(content);return}
    goto(id);visitAction.dataset.content=content;
  }));
  visitAction.addEventListener('click',()=>openContent(visitAction.dataset.content||'lab'));
  modeSwitch.addEventListener('click',toggleMode);
  document.getElementById('closePanel').addEventListener('click',closeContent);
  document.getElementById('contentBackdrop').addEventListener('click',closeContent);
  document.getElementById('helpButton').addEventListener('click',showHelp);
  document.getElementById('closeHelp').addEventListener('click',hideHelp);
  document.getElementById('helpDone').addEventListener('click',hideHelp);
  helpOverlay.querySelector('.help-scrim').addEventListener('click',hideHelp);
  viewport.addEventListener('pointermove',e=>{
    if(state.mode==='guided'&&!state.reading){state.mouse.x=clamp((e.clientX/window.innerWidth-.5)*2,-1,1);state.mouse.y=clamp((e.clientY/window.innerHeight-.5)*2,-1,1);}
  });
  viewport.addEventListener('click',e=>{if(state.mode==='roam'&&!state.reading&&!state.help&&!document.pointerLockElement)requestPointerLock()});
  document.addEventListener('pointerlockchange',()=>{
    state.pointerLocked=document.pointerLockElement===viewport;
    if(!state.pointerLocked&&state.mode==='roam'&&!state.suspendUnlock&&!state.reading&&!state.help){leaveRoam();}
  });
  document.addEventListener('mousemove',e=>{
    if(state.mode==='roam'&&state.pointerLocked&&!state.reading){state.camera.yaw=wrapAngle(state.camera.yaw+e.movementX*.095);state.camera.pitch=clamp(state.camera.pitch-e.movementY*.075,-38,38);state.target.yaw=state.camera.yaw;state.target.pitch=state.camera.pitch;}
  });
  document.addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    const key=e.key.toLowerCase();
    if(key==='escape'){
      if(state.help){hideHelp();e.preventDefault();return;}
      if(state.reading){closeContent();e.preventDefault();return;}
      if(state.mode==='roam'){leaveRoam();e.preventDefault();return;}
    }
    if(state.help||state.reading)return;
    if(key==='f'&&!e.repeat){e.preventDefault();toggleMode();return;}
    if(key==='e'&&state.mode==='roam'&&!e.repeat){e.preventDefault();interact();return;}
    if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)&&state.mode==='roam'){
      state.pressed.add(key);e.preventDefault();
    }
  });
  document.addEventListener('keyup',e=>state.pressed.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>state.pressed.clear());
  window.addEventListener('wheel',e=>{
    if(state.reading||state.help||state.mode!=='guided')return;
    e.preventDefault();
    const now=performance.now();if(now-state.lastWheel>650)state.wheel=0;
    state.wheel+=e.deltaY;
    if(Math.abs(state.wheel)>90&&now-state.lastWheel>780){const dir=Math.sign(state.wheel);state.wheel=0;state.lastWheel=now;advance(dir)}
  },{passive:false});
  viewport.addEventListener('touchstart',e=>{if(touchDevice&&e.touches.length===1)state.touchY=e.touches[0].clientY},{passive:true});
  viewport.addEventListener('touchend',e=>{if(!touchDevice||state.reading||state.help||state.mode!=='guided'||state.touchY===null)return;const dy=state.touchY-e.changedTouches[0].clientY;state.touchY=null;if(Math.abs(dy)>65)advance(Math.sign(dy));},{passive:true});
  // Keep focus inside accessible modal for keyboard users.
  panel.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const items=Array.from(panel.querySelectorAll('button,a,[tabindex="0"]')).filter(el=>!el.disabled);
    if(!items.length)return;
    const first=items[0],last=items[items.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  const startHash=location.hash.replace('#','');
  if(entries[startHash]&&startHash!=='home'){goto(startHash,{quiet:true})}
  chipUpdate(state.current);modeVisual();
  function frame(now){
    const dt=clamp((now-state.lastFrame)/1000,0,.04);state.lastFrame=now;
    if(state.mode==='roam'&&!state.reading&&!state.help){
      const f=Number(state.pressed.has('w')||state.pressed.has('arrowup'))-Number(state.pressed.has('s')||state.pressed.has('arrowdown'));
      const strafe=Number(state.pressed.has('d')||state.pressed.has('arrowright'))-Number(state.pressed.has('a')||state.pressed.has('arrowleft'));
      if(f||strafe){const yaw=state.camera.yaw*Math.PI/180;const len=Math.hypot(f,strafe)||1;const speed=(state.pressed.has('shift')?405:265)*dt/len;
        const dx=(Math.sin(yaw)*f+Math.cos(yaw)*strafe)*speed;
        const dz=(-Math.cos(yaw)*f+Math.sin(yaw)*strafe)*speed;
        if(movable(state.camera.x+dx,state.camera.z))state.camera.x+=dx;
        if(movable(state.camera.x,state.camera.z+dz))state.camera.z+=dz;
      }
      state.camera.y=-85;state.target={...state.camera};
    }else if(state.mode==='guided'){
      const amt=reduce?1:1-Math.exp(-dt*3.8);
      for(const p of ['x','y','z','pitch'])state.camera[p]+=(state.target[p]-state.camera[p])*amt;
      state.camera.yaw+=deltaAngle(state.camera.yaw,state.target.yaw)*amt;
    }
    const mouseYaw=(state.mode==='guided'&&!reduce&&!state.reading?state.mouse.x*1.15:0);
    const mousePitch=(state.mode==='guided'&&!reduce&&!state.reading?state.mouse.y*.55:0);
    // CSS 3D is sufficient for the graybox. Final production scene swaps only this renderer for WebGL.
    world.style.transform=`rotateX(${-(state.camera.pitch+mousePitch).toFixed(3)}deg) rotateY(${-(state.camera.yaw+mouseYaw).toFixed(3)}deg) translate3d(${-state.camera.x.toFixed(2)}px,${-state.camera.y.toFixed(2)}px,${-state.camera.z.toFixed(2)}px)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if(!('transform' in document.documentElement.style))document.getElementById('fallback').style.display='block';
})();

