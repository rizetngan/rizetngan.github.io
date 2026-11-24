/* rizet ngan. — The Product Atelier
 * Three.js WebGL Architectural Gallery × Working Atelier
 * Precision Sketch -> Material Reality + Sculptural Mini Character
 */
(function (global) {
  'use strict';

  const PALETTE = {
    ivory: 0xF3EFE5,
    ink: 0x28332F,
    terra: 0xA7553D,
    stone: 0xDCD6C7,
    stoneWarm: 0xC6BBA7,
    walnut: 0x866951,
    walnutDark: 0x594537,
    graphite: 0x4F5148,
    metalDark: 0x35433D,
    paper: 0xF7F3E8,
    sage: 0x819489,
    blue: 0x526E7C,
    ochre: 0xBDA064
  };

  function makeCanvasTexture(w, h, drawFn, repeatX = 1, repeatY = 1) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    drawFn(ctx, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 4;
    if (repeatX > 1 || repeatY > 1) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatX, repeatY);
    }
    return tex;
  }

  // Original atelier model components. All dimensions are world-space metres.
  function roundedProfile(w, h, radius) {
    const x = -w/2, y = -h/2, r = Math.min(radius,w/2,h/2);
    const p = new THREE.Shape();
    p.moveTo(x+r,y); p.lineTo(x+w-r,y);
    p.quadraticCurveTo(x+w,y,x+w,y+r); p.lineTo(x+w,y+h-r);
    p.quadraticCurveTo(x+w,y+h,x+w-r,y+h); p.lineTo(x+r,y+h);
    p.quadraticCurveTo(x,y+h,x,y+h-r); p.lineTo(x,y+r);
    p.quadraticCurveTo(x,y,x+r,y); return p;
  }
  function roundedSlab(w,d,t,r) {
    const bevel = Math.min(t*.18,.035);
    const g = new THREE.ExtrudeGeometry(roundedProfile(w-2*bevel,d-2*bevel,r),
      {depth:t-2*bevel,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:12,steps:1});
    g.rotateX(-Math.PI/2); g.center();
    const p=g.attributes.position, uv=g.attributes.uv;
    for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i)/w+.5,p.getZ(i)/d+.5);
    uv.needsUpdate=true; return g;
  }
  // A continuous springing arch, rather than a lintel made of three boxes.
  function archGeometry(span,spring,thickness,depth) {
    const r=span/2,R=r+thickness,p=new THREE.Shape();
    p.moveTo(-R,0);p.lineTo(-R,spring);
    p.absarc(0,spring,R,Math.PI,0,true);
    p.lineTo(R,0);p.lineTo(r,0);p.lineTo(r,spring);
    p.absarc(0,spring,r,0,Math.PI,false);
    p.lineTo(-r,0);p.closePath();
    return new THREE.ExtrudeGeometry(p,{depth,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,curveSegments:32});
  }
  function createTextures() {
    // 1. Honed Limestone Floor with subtle architectural slab joints
    const limestone = makeCanvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#E6E2D9';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 4800; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const a = 0.015 + Math.random() * 0.035;
        ctx.fillStyle = Math.random() > 0.5 ? `rgba(119,117,111,${a})` : `rgba(255,253,248,${a})`;
        ctx.fillRect(x, y, 2 + Math.random() * 4, 1 + Math.random() * 2);
      }
      ctx.strokeStyle = 'rgba(119,117,111,0.16)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(1, 1, w - 2, h - 2);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
    }, 6, 8);

    // 2. Warm Mineral Plaster Wall
    const plaster = makeCanvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#EFECE5';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6500; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const a = 0.012 + Math.random() * 0.025;
        ctx.fillStyle = Math.random() > 0.48 ? `rgba(142,113,95,${a})` : `rgba(255,255,255,${a})`;
        ctx.fillRect(x, y, 3, 2);
      }
    }, 3, 2);

    // 3. Smoked Walnut Wood Grain
    const walnut = makeCanvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#8B6E5C';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 3) {
        const wave = Math.sin(y * 0.027) * 12 + Math.sin(y * 0.081) * 3;
        ctx.strokeStyle = y % 9 === 0 ? 'rgba(62,44,34,0.16)' : 'rgba(112,86,70,0.08)';
        ctx.lineWidth = 1 + (y % 3 === 0 ? 1 : 0);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.33, y + wave, w * 0.66, y - wave, w, y);
        ctx.stroke();
      }
    }, 2, 1);

    // Original product imagery from the public project repositories.
    function drawContained(ctx, img, x, y, width, height) {
      const scale = Math.min(width / img.width, height / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, x + (width - w) / 2, y + (height - h) / 2, w, h);
    }
    function createProductPlate(url, draw, width = 1024, height = 680) {
      const texture = makeCanvasTexture(width, height, (ctx,w,h) => draw(ctx,w,h,null));
      const img = new Image();
      img.onload = () => {
        const canvas = texture.image;
        draw(canvas.getContext('2d'), canvas.width, canvas.height, img);
        texture.needsUpdate = true;
        texture.sourceLoaded = true;
      };
      img.src = url;
      return texture;
    }
    const actapeArt = createProductPlate('assets/actape-windows-preview.png', (ctx,w,h,img) => {
      ctx.fillStyle = '#29362F'; ctx.fillRect(0,0,w,h);
      ctx.fillStyle = '#E8E3D7'; ctx.fillRect(58,34,w-116,492);
      if(img) drawContained(ctx,img,70,46,w-140,468);
      ctx.fillStyle = '#F4F0E6'; ctx.font = '400 65px Georgia, serif'; ctx.fillText('Actape',58,600);
      ctx.fillStyle = '#C9AC8D'; ctx.font = '500 18px sans-serif'; ctx.fillText('01 / CROSS-PLATFORM MACRO TOOL',60,639);
    });
    const snugArt = createProductPlate('assets/snug-phone-running.png', (ctx,w,h,img) => {
      ctx.fillStyle = '#DCDDD1'; ctx.fillRect(0,0,w,h);
      ctx.fillStyle = '#546C70'; ctx.fillRect(482,0,542,h);
      if(img) drawContained(ctx,img,510,27,486,626);
      ctx.fillStyle = '#29362F'; ctx.font = '400 62px Georgia, serif'; ctx.fillText('Snug',50,270);
      ctx.font = '400 42px Georgia, serif'; ctx.fillText('for Windows',50,328);
      ctx.fillStyle = '#A7553D'; ctx.font = '500 18px sans-serif'; ctx.fillText('02 / PORTRAIT WORKSPACE',52,383);
    });
    const phoneScreen = createProductPlate('assets/snug-phone-running.png', (ctx,w,h,img) => {
      ctx.fillStyle = '#E9E8E1'; ctx.fillRect(0,0,w,h);
      if(img) drawContained(ctx,img,0,0,w,h);
    },320,660);

    // 6. Lab Monitor Screen
    const labScreen = makeCanvasTexture(768, 480, (ctx, w, h) => {
      ctx.fillStyle = '#1D201E';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#272B28';
      ctx.fillRect(0, 0, w, 40);
      ['#A04D3E', '#8E715F', '#77756F'].forEach((c, idx) => {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(28 + idx * 20, 20, 5.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = 'rgba(242,240,235,0.55)';
      ctx.font = '500 14px monospace';
      ctx.fillText('rizet / prototype-bench — atelier.lab', 110, 25);
      // Draft blueprint lines
      ctx.strokeStyle = 'rgba(242,240,235,0.08)';
      ctx.lineWidth = 1;
      for (let x = 40; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, h); ctx.stroke(); }
      ctx.fillStyle = '#F2F0EB';
      ctx.font = '400 68px Georgia, serif';
      ctx.fillText('ideas to', 62, 194);
      ctx.fillText('things', 62, 268);
      ctx.fillStyle = '#A04D3E';
      ctx.fillText('.', 242, 268);
      ctx.fillStyle = 'rgba(242,240,235,0.68)';
      ctx.font = '400 20px sans-serif';
      ctx.fillText('AI Workflows · Prototypes · Independent Software', 64, 330);
      ctx.strokeStyle = '#A04D3E';
      ctx.lineWidth = 2;
      ctx.strokeRect(64, 366, 224, 46);
      ctx.fillStyle = '#F2F0EB';
      ctx.font = '500 16px sans-serif';
      ctx.fillText('EXPLORE THE LAB  ↗', 94, 395);
    });

    // 7. Architectural Sketchpad on Desk
    const sketchpad = makeCanvasTexture(512, 384, (ctx, w, h) => {
      ctx.fillStyle = '#F7F5F0';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(119,117,111,0.3)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(24, 24, w - 48, h - 48);
      // Perspective floorplan sketch
      ctx.strokeStyle = '#5D5B56';
      ctx.lineWidth = 2;
      ctx.strokeRect(64, 72, 220, 140);
      ctx.beginPath();
      ctx.moveTo(64, 142); ctx.lineTo(284, 142);
      ctx.moveTo(174, 72); ctx.lineTo(174, 212);
      ctx.stroke();
      ctx.strokeStyle = '#A04D3E';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(174, 142, 34, 0, Math.PI * 2);
      ctx.stroke();
      // Notes lines
      ctx.strokeStyle = 'rgba(119,117,111,0.45)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(318, 86 + i * 24);
        ctx.lineTo(448 - (i % 2) * 32, 86 + i * 24);
        ctx.stroke();
      }
      ctx.fillStyle = '#77756F';
      ctx.font = '500 15px monospace';
      ctx.fillText('ATELIER / SKETCH 04', 64, 324);
    });

    // 8. About Manifesto Wall Plaque
    const aboutPlaque = makeCanvasTexture(512, 640, (ctx, w, h) => {
      ctx.fillStyle = '#F2F0EB';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(119,117,111,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, w - 48, h - 48);
      ctx.fillStyle = '#A04D3E';
      ctx.font = '500 16px monospace';
      ctx.fillText('ABOUT / THE MAKER', 52, 84);
      ctx.fillStyle = '#202321';
      ctx.font = '400 54px Georgia, serif';
      ctx.fillText('rizet ngan.', 50, 162);
      ctx.fillStyle = '#5D5B56';
      ctx.font = '400 22px sans-serif';
      ctx.fillText('AI Product Manager', 52, 232);
      ctx.fillText('Product Thinker', 52, 268);
      ctx.fillText('Independent Maker', 52, 304);
      ctx.strokeStyle = 'rgba(160,77,62,0.5)';
      ctx.beginPath(); ctx.moveTo(52, 344); ctx.lineTo(148, 344); ctx.stroke();
      ctx.fillStyle = '#77756F';
      ctx.font = '400 19px sans-serif';
      ctx.fillText('Practice across:', 52, 396);
      ctx.fillStyle = '#202321';
      ctx.fillText('省广集团 · 广东新华集团 · 希扬集团', 52, 436);
      ctx.fillStyle = '#77756F';
      ctx.font = '400 17px monospace';
      ctx.fillText('github.com/rizetngan', 52, 560);
    });

    // Printed clay and linen, with deliberate fine irregularities rather than CGI stripes.
    const clay = makeCanvasTexture(512,512,(ctx,w,h)=>{
      let seed=1821;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
      ctx.fillStyle='#b16c51';ctx.fillRect(0,0,w,h);
      for(let i=0;i<10000;i++){ctx.fillStyle=rand()>.5?'rgba(54,32,23,.055)':'rgba(255,234,199,.075)';ctx.fillRect(rand()*w,rand()*h,1+rand()*3,1+rand()*2);}
      ctx.lineWidth=1;ctx.strokeStyle='rgba(71,37,25,.14)';
      for(let y=0;y<=h;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();for(let x=(y/64%2)*64;x<w;x+=128){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+64);ctx.stroke();}}
    },2,2);
    const linen = makeCanvasTexture(256,256,(ctx,w,h)=>{
      ctx.fillStyle='#a0a896';ctx.fillRect(0,0,w,h);
      for(let i=0;i<w;i+=3){ctx.strokeStyle='rgba(33,43,35,.13)';ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke();}
      for(let i=0;i<h;i+=4){ctx.strokeStyle='rgba(255,249,226,.13)';ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(w,i);ctx.stroke();}
    },8,5);
    return { limestone, plaster, walnut, clay, linen, actapeArt, snugArt, labScreen, sketchpad, aboutPlaque, phoneScreen };
  }

  /**
   * Sculptural Architectural Maquette Character
   * Small-scale human figurine: graphite coat, ivory head & collar, minimal terracotta lapel accent.
   */
  class MiniCharacter {
    constructor() {
      this.group = new THREE.Group();
      this.group.name = 'MiniCharacter';
      this.group.visible = false;
      this.group.scale.setScalar(0.76); // miniature: ~40% of desk height

      const matGraphite = new THREE.MeshStandardMaterial({ color: 0x34473E, roughness: 0.89, metalness: 0.0 });
      const matIvory = new THREE.MeshStandardMaterial({ color: 0xD4B899, roughness: 0.92, metalness: 0.0 });
      const matTerra = new THREE.MeshStandardMaterial({ color: PALETTE.terra, roughness: 0.48, metalness: 0.05 });

      // Rig root for bounce/hover/squash
      this.rig = new THREE.Group();
      this.group.add(this.rig);

      // Legs
      const legGeo = new THREE.CylinderGeometry(0.036, 0.028, 0.21, 12);
      this.leftLeg = new THREE.Group();
      this.leftLeg.position.set(-0.048, 0.21, 0);
      const leftLegMesh = new THREE.Mesh(legGeo, matGraphite);
      leftLegMesh.position.y = -0.105;
      leftLegMesh.castShadow = true;
      this.leftLeg.add(leftLegMesh);
      this.rig.add(this.leftLeg);

      this.rightLeg = new THREE.Group();
      this.rightLeg.position.set(0.048, 0.21, 0);
      const rightLegMesh = new THREE.Mesh(legGeo, matGraphite);
      rightLegMesh.position.y = -0.105;
      rightLegMesh.castShadow = true;
      this.rightLeg.add(rightLegMesh);
      this.rig.add(this.rightLeg);

      // Sculpted tapered architectural torso
      const torsoGeo = new THREE.LatheGeometry([[.076,0],[.095,.025],[.090,.13],[.083,.22],[.065,.27]].map(([x,y])=>new THREE.Vector2(x,y-.135)),24);
      this.torso = new THREE.Mesh(torsoGeo, matGraphite);
      this.torso.position.y = 0.325;
      this.torso.castShadow = true;
      this.torso.receiveShadow = true;
      this.rig.add(this.torso);

      // Crisp ivory collar ring
      const collarGeo = new THREE.CylinderGeometry(0.058, 0.075, 0.036, 16);
      const collar = new THREE.Mesh(collarGeo, matIvory);
      collar.position.y = 0.456;
      collar.castShadow = true;
      this.rig.add(collar);

      // Minimal terracotta lapel / scarf accent (signature brand identity)
      const lapelGeo = new THREE.BoxGeometry(0.028, 0.082, 0.016);
      const lapel = new THREE.Mesh(lapelGeo, matTerra);
      lapel.position.set(-0.032, 0.395, 0.076);
      lapel.rotation.z = 0.14;
      this.rig.add(lapel);

      // Arms
      const armGeo = new THREE.CylinderGeometry(0.024, 0.02, 0.19, 10);
      this.leftArm = new THREE.Group();
      this.leftArm.position.set(-0.095, 0.425, 0);
      const leftArmMesh = new THREE.Mesh(armGeo, matGraphite);
      leftArmMesh.position.y = -0.092;
      leftArmMesh.castShadow = true;
      this.leftArm.add(leftArmMesh);
      this.rig.add(this.leftArm);

      this.rightArm = new THREE.Group();
      this.rightArm.position.set(0.095, 0.425, 0);
      const rightArmMesh = new THREE.Mesh(armGeo, matGraphite);
      rightArmMesh.position.y = -0.092;
      rightArmMesh.castShadow = true;
      this.rightArm.add(rightArmMesh);
      this.rig.add(this.rightArm);

      // Two tiny sculpted shoes anchor the figurine to the model world.
      const shoeGeo = new THREE.BoxGeometry(0.07, 0.028, 0.12);
      [this.leftLeg, this.rightLeg].forEach((leg) => {
        const shoe = new THREE.Mesh(shoeGeo, matGraphite);
        shoe.position.set(0, -0.194, 0.018);
        shoe.castShadow = true;
        leg.add(shoe);
      });

      // Smooth ovoid sculptural head (not big-head cartoon: ~1:6.5 architectural proportion)
      const headGeo = new THREE.SphereGeometry(0.068, 18, 16);
      this.head = new THREE.Mesh(headGeo, matIvory);
      this.head.scale.set(0.92, 1.08, 0.96);
      this.head.position.y = 0.548;
      this.head.castShadow = true;
      this.rig.add(this.head);

      // Matte sculptural hair cap; no visor, eyes or cartoon facial markings.
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.069, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), matGraphite);
      hair.scale.set(0.94, 1.02, 0.98);
      hair.position.set(0, 0.559, -0.004);
      hair.castShadow = true;
      this.rig.add(hair);
      const coatSeam = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.18, 0.006), matGraphite);
      coatSeam.position.set(0, 0.315, 0.094);
      this.rig.add(coatSeam);

      // Projected soft contact shadow disc
      const shadowTex = makeCanvasTexture(128, 128, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
        g.addColorStop(0, 'rgba(32,35,33,0.34)');
        g.addColorStop(0.6, 'rgba(32,35,33,0.12)');
        g.addColorStop(1, 'rgba(32,35,33,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
      this.contactShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.34, 0.34),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.85 })
      );
      this.contactShadow.rotation.x = -Math.PI / 2;
      this.contactShadow.position.y = 0.012;

      this.animTime = 0;
      this.landTimer = 0;
      this.animState = 'idle'; // idle | walk | turn | mount | float | land
    }

    setAnim(state) {
      if (state === 'land' && this.animState !== 'land') {
        this.landTimer = 0.28;
      }
      this.animState = state;
    }

    update(dt, speedNorm, turnRate, groundY, reducedMotion) {
      this.animTime += dt;
      const t = this.animTime;

      // Update contact shadow position & fade with height above ground
      const heightAbove = Math.max(0, this.group.position.y - groundY);
      this.contactShadow.position.set(this.group.position.x, groundY + 0.012, this.group.position.z);
      const shadowScale = 1 + heightAbove * 0.55;
      this.contactShadow.scale.set(shadowScale, shadowScale, 1);
      this.contactShadow.material.opacity = Math.max(0.16, 0.82 - heightAbove * 0.38);
      this.contactShadow.visible = this.group.visible;

      if (reducedMotion) {
        this.rig.position.set(0, 0, 0);
        this.rig.rotation.set(0, 0, 0);
        this.rig.scale.set(1, 1, 1);
        this.leftLeg.rotation.x = 0;
        this.rightLeg.rotation.x = 0;
        this.leftArm.rotation.x = 0;
        this.rightArm.rotation.x = 0;
        return;
      }

      if (this.landTimer > 0) {
        this.landTimer = Math.max(0, this.landTimer - dt);
        const p = Math.sin((this.landTimer / 0.28) * Math.PI);
        this.rig.scale.set(1 + p * 0.08, 1 - p * 0.11, 1 + p * 0.08);
      } else {
        this.rig.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(1, dt * 10));
      }

      if (this.animState === 'walk') {
        const freq = 9.5;
        const swing = Math.sin(t * freq) * 0.56 * Math.min(1, speedNorm + 0.2);
        this.leftLeg.rotation.x = swing;
        this.rightLeg.rotation.x = -swing;
        this.leftArm.rotation.x = -swing * 0.72;
        this.rightArm.rotation.x = swing * 0.72;
        this.rig.position.y = Math.abs(Math.cos(t * freq)) * 0.022 * speedNorm;
        this.rig.rotation.x = 0.06 * speedNorm;
        this.rig.rotation.z = THREE.MathUtils.clamp(-turnRate * 0.18, -0.14, 0.14);
      } else if (this.animState === 'mount') {
        this.leftLeg.rotation.x = -0.35;
        this.rightLeg.rotation.x = 0.28;
        this.leftArm.rotation.x = -0.55;
        this.rightArm.rotation.x = -0.45;
        this.rig.rotation.x = 0.14;
        this.rig.rotation.z = 0;
        this.rig.position.y = 0;
      } else if (this.animState === 'float') {
        const hover = Math.sin(t * 2.4) * 0.028;
        this.rig.position.y = hover;
        this.leftLeg.rotation.x = 0.12 + Math.sin(t * 2.0) * 0.06;
        this.rightLeg.rotation.x = -0.06 - Math.sin(t * 2.0) * 0.05;
        this.leftArm.rotation.x = -0.14;
        this.rightArm.rotation.x = -0.14;
        this.leftArm.rotation.z = 0.12;
        this.rightArm.rotation.z = -0.12;
        this.rig.rotation.x = -0.04;
        this.rig.rotation.z = 0;
      } else {
        // Idle / Turn
        const breathe = Math.sin(t * 2.1) * 0.008;
        this.rig.position.y = breathe;
        this.leftLeg.rotation.x *= 0.85;
        this.rightLeg.rotation.x *= 0.85;
        this.leftArm.rotation.x *= 0.85;
        this.rightArm.rotation.x *= 0.85;
        this.leftArm.rotation.z *= 0.85;
        this.rightArm.rotation.z *= 0.85;
        this.rig.rotation.x *= 0.85;
        this.rig.rotation.z = THREE.MathUtils.lerp(this.rig.rotation.z, THREE.MathUtils.clamp(-turnRate * 0.1, -0.08, 0.08), Math.min(1, dt * 8));
      }
    }
  }

  /**
   * Builds the complete 3D Atelier World
   */
  function createAtelierWorld(canvas) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE8E5DA);
    scene.fog = new THREE.FogExp2(0xE8E5DA, 0.006);

    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);
    const textures = createTextures();

    // Lighting — Soft natural architectural daylight + warm bench lamp
    const hemi = new THREE.HemisphereLight(0xF4F5EF, 0x77796D, 0.68);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xFFF0D7, 1.42);
    sun.position.set(-12, 15, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 36;
    const d = 14;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.014;
    sun.shadow.radius = 3;
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0xD7E7EE, 0.45);
    fillLight.position.set(8, 6, -7);
    scene.add(fillLight);

    const deskLampLight = new THREE.PointLight(0xFFDDBA, 0.72, 6.2, 1.8);
    deskLampLight.position.set(1.38, 1.62, -0.25);
    scene.add(deskLampLight);

    // Precision Sketch -> Material Reality registry
    const zoneRevealState = {
      entrance: { pos: new THREE.Vector3(0, 1.0, 10.5), radius: 5.5, value: 0.65, minValue: 0.55, items: [] },
      corridor: { pos: new THREE.Vector3(0, 1.2, 5.2), radius: 5.2, value: 0.35, minValue: 0.28, items: [] },
      lab:      { pos: new THREE.Vector3(0, 1.1, 0.0), radius: 4.8, value: 0.42, minValue: 0.30, items: [] },
      actape:   { pos: new THREE.Vector3(-1.75, 2.0, -4.6), radius: 4.2, value: 0.32, minValue: 0.22, items: [] },
      snug:     { pos: new THREE.Vector3(1.75, 2.0, -4.6), radius: 4.2, value: 0.32, minValue: 0.22, items: [] },
      notes:    { pos: new THREE.Vector3(-5.0, 1.4, -0.6), radius: 4.4, value: 0.30, minValue: 0.22, items: [] },
      about:    { pos: new THREE.Vector3(5.0, 1.3, -1.2), radius: 4.4, value: 0.30, minValue: 0.22, items: [] }
    };

    const sketchColor = new THREE.Color(0xE7E4D9).convertSRGBToLinear();
    const interactables = [];
    const cameraColliders = [];

    function addArchMesh(parent, geo, matOptions, zoneKey, options = {}) {
      const mat = new THREE.MeshStandardMaterial({
        roughness: 0.85,
        metalness: 0.04,
        ...matOptions
      });
      const mesh = new THREE.Mesh(geo, mat);
      if (options.pos) mesh.position.set(...options.pos);
      if (options.rot) mesh.rotation.set(...options.rot);
      mesh.castShadow = options.castShadow !== false;
      mesh.receiveShadow = options.receiveShadow !== false;
      parent.add(mesh);

      // Architectural graphite drafting edges
      let edges = null;
      if (options.sketchEdges !== false && (options.keepLine || 0) >= 0.135) {
        const edgeGeo = new THREE.EdgesGeometry(geo, options.edgeThreshold || 24);
        const edgeMat = new THREE.LineBasicMaterial({
          color: PALETTE.graphite,
          transparent: true,
          opacity: 0.62
        });
        edges = new THREE.LineSegments(edgeGeo, edgeMat);
        mesh.add(edges);
      }

      if (zoneKey && zoneRevealState[zoneKey]) {
        zoneRevealState[zoneKey].items.push({
          mesh,
          mat,
          baseColor: mat.color.clone(),
          baseEmissive: mat.emissive ? mat.emissive.clone() : new THREE.Color(0x000000),
          edges,
          keepLine: options.keepLine || 0.08
        });
      }

      if (options.cameraBlocker) cameraColliders.push(mesh);

      if (options.interactId) {
        mesh.userData.interactId = options.interactId;
        mesh.userData.interactZone = options.interactZone || zoneKey;
        interactables.push(mesh);
      }

      return mesh;
    }

    // ==================== 1. ARCHITECTURAL SHELL (FLOOR, WALLS, CORRIDOR RIBS) ====================
    const archGroup = new THREE.Group();
    scene.add(archGroup);

    // Main honed limestone floor (walkable floor)
    // A real *object* instead of an infinite CGI floor: the studio sits on a
    // carefully finished architectural model plinth with a visible cut edge.
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0xB9A88D, roughness: 0.92 });
    const plinth = new THREE.Mesh(roundedSlab(14.8,21.0,.34,.18), plinthMat);
    plinth.position.set(0, -0.23, 3.0);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    archGroup.add(plinth);
    const plinthFoot = new THREE.Mesh(roundedSlab(15.0,21.2,.045,.19), new THREE.MeshStandardMaterial({ color: 0x777064, roughness: 0.74 }));
    plinthFoot.position.set(0, -0.43, 3.0);
    archGroup.add(plinthFoot);
    const presentationGround = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0xD8D5C9, roughness: 1.0 }));
    presentationGround.rotation.x = -Math.PI / 2;
    presentationGround.position.y = -0.58;
    presentationGround.receiveShadow = true;
    archGroup.add(presentationGround);
    // Fine brass shadow gap gives a jewelry-like edge without game decoration.
    const inlay = new THREE.Mesh(new THREE.BoxGeometry(14.65, 0.018, 20.85), new THREE.MeshStandardMaterial({ color: 0xA58D73, metalness: 0.33, roughness: 0.7 }));
    inlay.position.set(0, -0.043, 3.0);
    archGroup.add(inlay);

    const floorGeo = new THREE.PlaneGeometry(14.6, 20.8);
    const floorMat = new THREE.MeshStandardMaterial({
      map: textures.limestone,
      color: 0xF4EDE0,
      roughness: 0.89,
      metalness: 0.02
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, 3.0);
    floorMesh.receiveShadow = true;
    floorMesh.name = 'StudioFloor';
    archGroup.add(floorMesh);

    // Subtle inlaid architectural floor drafting lines (corridor spine -> bench -> gallery)
    const gridMat = new THREE.LineBasicMaterial({ color: PALETTE.graphite, transparent: true, opacity: 0.22 });
    const spinePoints = [
      new THREE.Vector3(-1.85, 0.006, 12.2), new THREE.Vector3(-1.85, 0.006, 2.3),
      new THREE.Vector3(1.85, 0.006, 12.2), new THREE.Vector3(1.85, 0.006, 2.3),
      new THREE.Vector3(-5.8, 0.006, -3.1), new THREE.Vector3(5.8, 0.006, -3.1)
    ];
    const spineGeo = new THREE.BufferGeometry().setFromPoints(spinePoints);
    archGroup.add(new THREE.LineSegments(spineGeo, gridMat));

    // North Work Archive Wall (z = -5.5)
    addArchMesh(archGroup, new THREE.BoxGeometry(14.4, 4.8, 0.35), { map: textures.plaster, color: 0xA2AA98 }, 'corridor', {
      pos: [0, 2.4, -5.5], castShadow: false, keepLine: 0.08, cameraBlocker: true
    });

    // West Wall with Slatted Clerestory Window Opening (x = -6.6)
    addArchMesh(archGroup, new THREE.BoxGeometry(0.35, 4.8, 12.0), { map: textures.plaster, color: 0xD6DCCE }, 'notes', {
      pos: [-6.6, 2.4, -0.5], castShadow: false, keepLine: 0.08, cameraBlocker: true
    });
    // East Wall (x = +6.6)
    addArchMesh(archGroup, new THREE.BoxGeometry(0.35, 4.8, 12.0), { map: textures.plaster, color: 0xDED6C3 }, 'about', {
      pos: [6.6, 2.4, -0.5], castShadow: false, keepLine: 0.08, cameraBlocker: true
    });

    // Rear exhibit wall is articulated as two painted clay bays in a quiet sage shell.
    // Front face stays behind the product plates and preserves their existing lift anchors.
    [-2.12,2.12].forEach((x,i)=>{
      addArchMesh(archGroup,new THREE.BoxGeometry(3.65,3.82,.045),
        {color:i===0?0x5D7064:0xB48A6A,roughness:.96,map:textures.plaster},null,
        {pos:[x,2.16,-5.29],sketchEdges:false});
      addArchMesh(archGroup,new THREE.BoxGeometry(3.66,.055,.10),
        {color:PALETTE.walnutDark,roughness:.82},null,{pos:[x,.25,-5.235],sketchEdges:false});
    });
    // A tactile continuous arch and a smaller curved reveal create a memorable silhouette.
    const heroArch=addArchMesh(archGroup,archGeometry(4.5,1.78,.38,.58),
      {color:0xBE765A,map:textures.clay,roughness:.93},null,
      {pos:[0,0,7.45],cameraBlocker:true,sketchEdges:false});
    addArchMesh(archGroup,archGeometry(4.5,1.78,.065,.022),
      {color:0xE3CBA9,roughness:.84},null,{pos:[0,0,8.035],sketchEdges:false});
    // A precise ink contour across the curved front face reinforces the illustrated
    // architectural character without turning every mesh into a wireframe.
    const archStroke=new THREE.LineBasicMaterial({color:0x654A3C,transparent:true,opacity:.32});
    [2.27,2.61].forEach(radius=>{
      const points=[new THREE.Vector3(-radius,.04,8.075),new THREE.Vector3(-radius,1.78,8.075)];
      for(let i=0;i<=48;i++){const angle=Math.PI*(1-i/48);points.push(new THREE.Vector3(Math.cos(angle)*radius,1.78+Math.sin(angle)*radius,8.075));}
      points.push(new THREE.Vector3(radius,.04,8.075));
      archGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),archStroke));
    });
    // Offset low wing walls read as a cutaway maquette; no repetitive full-height ribs.
    addArchMesh(archGroup,roundedSlab(.43,2.30,1.12,.12),
      {color:0x87978A,map:textures.plaster,roughness:.95},null,
      {pos:[-3.62,.56,9.0],cameraBlocker:true,sketchEdges:false});
    addArchMesh(archGroup,roundedSlab(.48,2.32,.08,.12),
      {color:0xCFC5AE,roughness:.84},null,{pos:[-3.62,1.15,9.0],sketchEdges:false});
    // Slender timber screen on the opposite flank, outside the central route.
    const screenGroup=new THREE.Group();archGroup.add(screenGroup);
    for(let n=0;n<7;n++){
      addArchMesh(screenGroup,new THREE.BoxGeometry(.11,2.65,.095),{color:0x7A604A,roughness:.84},null,
        {pos:[3.45,1.325,6.22+n*.33],cameraBlocker:true,sketchEdges:false});
    }
    [0.12,2.61].forEach(y=>addArchMesh(screenGroup,new THREE.BoxGeometry(.13,.11,2.13),
      {color:0x69513E,roughness:.86},null,{pos:[3.45,y,7.21],sketchEdges:false}));
    // Entrance composition: raised travertine seat tucked outside the circulation path.
    addArchMesh(archGroup,roundedSlab(1.05,.46,.12,.16),{color:0xD4C4A9,roughness:.91},null,
      {pos:[-1.9,.48,9.25],sketchEdges:false});
    [-.34,.34].forEach(dx=>addArchMesh(archGroup,roundedSlab(.20,.35,.42,.055),
      {color:0xA99377,roughness:.93},null,{pos:[-1.9+dx,.21,9.25],sketchEdges:false}));
    // Woven runner, visually connecting the threshold to the bench; no floor height change.
    addArchMesh(archGroup,roundedSlab(2.08,4.3,.009,.12),{map:textures.linen,color:0xD9D5BE,roughness:1},null,
      {pos:[0,.006,5.2],castShadow:false,sketchEdges:false});
    // One open canopy with thin rafters, allowing the model to be read from above.
    [-2.9,-1.85,-.8,.25,1.3].forEach(z=>addArchMesh(archGroup,new THREE.BoxGeometry(10.5,.11,.13),
      {color:0xB8AA90,roughness:.9},null,{pos:[0,4.65,z],castShadow:false,sketchEdges:false}));

    // ==================== 2. PROTOTYPE BENCH (LAB — VISUAL & EMOTIONAL CORE) ====================
    const benchGroup = new THREE.Group();
    scene.add(benchGroup);

    // Woven Warm Stone Studio Rug under Prototype Bench
    addArchMesh(benchGroup, roundedSlab(6.2,3.8,.018,.22), { map:textures.linen, color: 0xAAB49E, roughness: 0.98 }, 'lab', {
      pos: [0, 0.011, 0], castShadow: false, keepLine: 0.10
    });

    // Smoked Walnut Desk Top (y = 0.96 to 1.02, walkable surface at y = 1.02!)
    const deskTopMesh = addArchMesh(benchGroup, roundedSlab(4.6,2.2,.09,.15), {
      map: textures.walnut,
      color: 0xAE8A6C,
      roughness: 0.79
    }, 'lab', {
      pos: [0, 0.975, 0], interactId: 'lab', interactZone: 'lab', keepLine: 0.12, cameraBlocker: true
    });
    deskTopMesh.name = 'DeskSurface';

    // Thin shadow reveal and timber apron give the desk a crafted furniture profile.
    addArchMesh(benchGroup, roundedSlab(4.38,1.98,.065,.13),
      { color: PALETTE.walnutDark, roughness: 0.84 }, 'lab', {
        pos: [0, 0.899, 0], sketchEdges: false
      });
    // Designed trestle furniture: angled solid timber supports, rounded apron and
    // a slender dark stretcher, with a consistent joinery language.
    [[-1.75,-.72],[1.75,-.72],[-1.75,.72],[1.75,.72]].forEach(([lx,lz])=>{
      const leg=addArchMesh(benchGroup,new THREE.CylinderGeometry(.078,.047,.94,20),
        {color:0x7D6248,roughness:.83},null,{pos:[lx,.46,lz],sketchEdges:false});
      leg.rotation.z=lx>0?-.105:.105;
      leg.rotation.x=lz>0?.075:-.075;
    });
    addArchMesh(benchGroup,roundedSlab(3.65,.075,.09,.03),
      {color:0x46534A,roughness:.86},null,{pos:[0,.35,-.72],sketchEdges:false});
    // A desk pad bounds the computer group, leaving a clean miniature walking surface.
    addArchMesh(benchGroup,roundedSlab(1.34,.50,.012,.045),
      {color:0x65796D,roughness:.94},null,{pos:[-.09,1.023,.12],castShadow:false,sketchEdges:false});

    // Auto Mount Subtle Architectural Floor Bracket at Front of Bench (x=0, z=1.42)
    const mountRingGeo = new THREE.RingGeometry(0.24, 0.28, 32);
    const mountRingMat = new THREE.MeshBasicMaterial({ color: PALETTE.terra, transparent: true, opacity: 0.52, side: THREE.DoubleSide });
    const mountMarker = new THREE.Mesh(mountRingGeo, mountRingMat);
    mountMarker.rotation.x = -Math.PI / 2;
    mountMarker.position.set(0, 0.016, 1.48);
    benchGroup.add(mountMarker);

    // Studio Monitor on Bench (center-back)
    addArchMesh(benchGroup, new THREE.BoxGeometry(0.38, 0.025, 0.26), { color: PALETTE.metalDark, metalness: 0.4, roughness: 0.4 }, 'lab', {
      pos: [-0.15, 1.032, -0.45], keepLine: 0.08
    });
    addArchMesh(benchGroup, new THREE.BoxGeometry(0.07, 0.34, 0.05), { color: PALETTE.metalDark, metalness: 0.4, roughness: 0.4 }, 'lab', {
      pos: [-0.15, 1.2, -0.48], keepLine: 0.08
    });
    const monitorBezel = addArchMesh(benchGroup, (() => {const g=roundedSlab(1.48,.88,.055,.035);g.rotateX(Math.PI/2);return g;})(), { color: PALETTE.ink, roughness: 0.4, metalness: 0.25 }, 'lab', {
      pos: [-0.15, 1.54, -0.42], rot: [-0.05, 0.03, 0], interactId: 'lab', interactZone: 'lab', keepLine: 0.12
    });
    const screenPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.8),
      new THREE.MeshStandardMaterial({
        map: textures.labScreen,
        emissive: new THREE.Color(0x2A2622),
        emissiveMap: textures.labScreen,
        emissiveIntensity: 0.35,
        roughness: 0.25
      })
    );
    screenPlane.position.set(0, 0, 0.029);
    screenPlane.userData.interactId = 'lab';
    screenPlane.userData.interactZone = 'lab';
    interactables.push(screenPlane);
    monitorBezel.add(screenPlane);

    // Keyboard & Minimal Mouse
    addArchMesh(benchGroup, new THREE.BoxGeometry(0.56, 0.022, 0.2), { color: 0x3A3E3C, roughness: 0.6 }, 'lab', {
      pos: [-0.18, 1.032, 0.04], keepLine: 0.08
    });
    addArchMesh(benchGroup, roundedSlab(.08,.13,.024,.037), { color: 0x3A3E3C, roughness: 0.5 }, 'lab', {
      pos: [0.24, 1.032, 0.05], keepLine: 0.08
    });

    // Keycaps and a paper desk mat articulate scale without adding random clutter.
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 12; col++) {
        addArchMesh(benchGroup, new THREE.BoxGeometry(0.032, 0.008, 0.032),
          { color: row === 3 && col === 0 ? PALETTE.terra : PALETTE.graphite, roughness: 0.86 }, null, {
            pos: [-0.414 + col * 0.042, 1.047, -0.027 + row * 0.043], sketchEdges: false, castShadow: false
          });
      }
    }
    // Mobile Prototype Device on Stand (right side of desk -> Snug preview)
    addArchMesh(benchGroup, new THREE.BoxGeometry(0.14, 0.02, 0.14), { color: PALETTE.metalDark, metalness: 0.4, roughness: 0.4 }, 'lab', {
      pos: [1.05, 1.03, -0.18], keepLine: 0.08
    });
    const phoneBody = addArchMesh(benchGroup, (() => {const g=roundedSlab(.16,.31,.022,.022);g.rotateX(Math.PI/2);return g;})(), { color: PALETTE.ink, roughness: 0.35, metalness: 0.3 }, 'lab', {
      pos: [1.05, 1.19, -0.18], rot: [-0.22, -0.28, 0], interactId: 'snug', interactZone: 'lab', keepLine: 0.10
    });
    const phoneFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.138, 0.285),
      new THREE.MeshBasicMaterial({ map: textures.phoneScreen, color: 0xFFFFFF })
    );
    phoneFace.position.z = 0.012;
    phoneBody.add(phoneFace);

    // Architectural Drafting Sketchpad (left side of desk)
    addArchMesh(benchGroup, new THREE.BoxGeometry(0.86, 0.014, 0.64), { map: textures.sketchpad, color: 0xFFFFFF, roughness: 0.92 }, 'lab', {
      pos: [-1.42, 1.028, 0.08], rot: [0, 0.12, 0], interactId: 'notes', interactZone: 'lab', keepLine: 0.10
    });
    // Terracotta Stylus Pencil on Sketchpad
    addArchMesh(benchGroup, new THREE.CylinderGeometry(0.008, 0.008, 0.24, 8), { color: PALETTE.terra, roughness: 0.5 }, 'lab', {
      pos: [-1.15, 1.042, 0.22], rot: [Math.PI / 2, 0, 0.52], sketchEdges: false
    });

    // Authored articulated task lamp: enamel hemispherical shade, brass hinge,
    // curved arm and warm inner reflector (not a primitive cone).
    addArchMesh(benchGroup,roundedSlab(.29,.27,.034,.13),
      {color:0x526D70,roughness:.73},null,{pos:[1.72,1.037,-.46],sketchEdges:false});
    const lampPath=new THREE.CatmullRomCurve3([new THREE.Vector3(1.72,1.06,-.46),new THREE.Vector3(1.76,1.30,-.46),new THREE.Vector3(1.69,1.56,-.46),new THREE.Vector3(1.52,1.62,-.36)]);
    addArchMesh(benchGroup,new THREE.TubeGeometry(lampPath,28,.018,10,false),
      {color:0x526D70,roughness:.62},null,{sketchEdges:false});
    const lampShade=addArchMesh(benchGroup,new THREE.SphereGeometry(.177,32,20,0,Math.PI*2,0,Math.PI/2),
      {color:0x526D70,roughness:.72,side:THREE.DoubleSide},null,{pos:[1.49,1.59,-.32],rot:[.20,0,.34],sketchEdges:false});
    const lampRim=new THREE.Mesh(new THREE.TorusGeometry(.174,.008,8,32),new THREE.MeshStandardMaterial({color:0xC7AA76,roughness:.7}));
    lampRim.rotation.x=Math.PI/2;lampShade.add(lampRim);

    // Open ceramic vessel, with a visible wall thickness and an original handle.
    const mugProfile = [[0,0],[0.055,0],[0.064,0.012],[0.068,0.13],[0.058,0.13],[0.054,0.018],[0,0.018]]
      .map(([x,y]) => new THREE.Vector2(x,y));
    addArchMesh(benchGroup, new THREE.LatheGeometry(mugProfile, 32), { color: PALETTE.terra, roughness: 0.72 }, 'lab', {
      pos: [1.38, 1.02, 0.36], sketchEdges: false
    });
    addArchMesh(benchGroup, new THREE.TorusGeometry(0.043, 0.009, 10, 22), { color: PALETTE.terra, roughness: 0.72 }, 'lab', {
      pos: [1.45, 1.086, 0.36], sketchEdges: false
    });

    // ==================== 3. WORK ARCHIVE (NORTH GALLERY WALL — WALL LIFT EXHIBITS) ====================
    const archiveGroup = new THREE.Group();
    scene.add(archiveGroup);

    function createExhibit(xPos, texture, zoneKey, interactId) {
      const g = new THREE.Group();
      g.position.set(xPos, 2.38, -5.22);
      archiveGroup.add(g);

      // Deep walnut museum frame, with a dark thin reveal and ivory matting.
      addArchMesh(g, (() => {const g=roundedSlab(2.58,1.76,.12,.038);g.rotateX(Math.PI/2);return g;})(), { color: 0x65513E, roughness: 0.82 }, zoneKey, {
        interactId, interactZone: zoneKey, keepLine: 0.16
      });
      // Recessed Matting
      addArchMesh(g, new THREE.BoxGeometry(2.38, 1.56, 0.03), { color: PALETTE.ivory, roughness: 0.9 }, zoneKey, {
        pos: [0, 0, 0.055], sketchEdges: false, interactId, interactZone: zoneKey
      });
      // Artwork Canvas Plane
      const artMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.18, 1.42),
        new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, metalness: 0, emissiveMap: texture, emissive: 0xffffff, emissiveIntensity: 0.10 })
      );
      artMesh.position.set(0, 0, 0.074);
      artMesh.userData.interactId = interactId;
      artMesh.userData.interactZone = zoneKey;
      interactables.push(artMesh);
      g.add(artMesh);

      // Register artwork for reveal desaturation -> vivid reveal
      zoneRevealState[zoneKey].items.push({
        mesh: artMesh,
        mat: artMesh.material,
        baseColor: new THREE.Color(0xFFFFFF),
        baseEmissive: new THREE.Color(0x000000),
        edges: null,
        keepLine: 0
      });

      // Brass-toned, small-scale gallery plaque; title texture is existing work art,
      // not an invented product screenshot.
      addArchMesh(g, new THREE.BoxGeometry(0.58, 0.082, 0.025),
        { color: PALETTE.ochre, roughness: 0.67, metalness: 0.25 }, null, {
          pos: [-0.81, -1.02, -0.005], sketchEdges: false
        });
      // Architectural Floor Alignment Marker for Wall Lift
      const liftRing = new THREE.Mesh(
        new THREE.RingGeometry(0.26, 0.30, 32),
        new THREE.MeshBasicMaterial({ color: PALETTE.terra, transparent: true, opacity: 0.42, side: THREE.DoubleSide })
      );
      liftRing.rotation.x = -Math.PI / 2;
      liftRing.position.set(xPos, 0.015, -3.72);
      archiveGroup.add(liftRing);

      // Gallery Low Stone Plinth Rail below artwork
      addArchMesh(archiveGroup, roundedSlab(2.5,.42,.14,.035), { color: 0xD6C8AC }, zoneKey, {
        pos: [xPos, 0.07, -5.05], keepLine: 0.12
      });
    }

    createExhibit(-2.12, textures.actapeArt, 'actape', 'actape');
    createExhibit(2.12, textures.snugArt, 'snug', 'snug');

    // ==================== 4. NOTES LIBRARY (WEST WING) ====================
    const notesGroup = new THREE.Group();
    scene.add(notesGroup);

    // Open joinery bookcase: dark recessed back, solid uprights, varied book groupings.
    addArchMesh(notesGroup,new THREE.BoxGeometry(.08,3.1,3.2),
      {color:0x655748,roughness:.92},null,{pos:[-6.39,1.55,-.6],sketchEdges:false});
    [-2.16,-.60,.96].forEach(z=>addArchMesh(notesGroup,new THREE.BoxGeometry(.58,3.10,.068),
      {color:0x80674E,roughness:.84},'notes',{pos:[-6.08,1.55,z],interactId:'notes',interactZone:'notes',sketchEdges:false}));
    for(let row=0;row<5;row++){
      const y=.16+row*.71;
      addArchMesh(notesGroup,new THREE.BoxGeometry(.58,.06,3.18),
        {color:0x94795D,roughness:.85},'notes',{pos:[-6.08,y,-.6],interactId:'notes',interactZone:'notes',sketchEdges:false});
      if(row===4)break;
      const colors=[0x485B51,0xB86B50,0xD6C5A2,0x566F7A,0xAE9465,0xE6DCCC];
      for(let group=0;group<3;group++){
        let z=-2.02+group*1.03+(row%2)*.06;
        for(let k=0;k<5+(row+group)%3;k++){
          const w=.065+((k*11+row*3)%5)*.011,h=.31+((k*7+row)%8)*.025;
          z+=w/2;
          const book=addArchMesh(notesGroup,new THREE.BoxGeometry(.31,h,w),
            {color:colors[(k+row+group)%colors.length],roughness:.94},null,{pos:[-5.98,y+.03+h/2,z],interactId:'notes',interactZone:'notes',sketchEdges:false});
          if(k===0&&group===1)book.rotation.x=.12;
          z+=w/2+.012;
        }
      }
    }

    // Reading Lectern Stand in front of Library
    addArchMesh(notesGroup, new THREE.BoxGeometry(0.42, 0.92, 0.42), { color: PALETTE.stoneWarm }, 'notes', {
      pos: [-4.65, 0.46, -0.6], interactId: 'notes', interactZone: 'notes', keepLine: 0.14
    });
    addArchMesh(notesGroup, new THREE.BoxGeometry(0.52, 0.03, 0.36), { color: PALETTE.paper }, 'notes', {
      pos: [-4.62, 0.96, -0.6], rot: [0, 0, -0.18], interactId: 'notes', interactZone: 'notes', keepLine: 0.10
    });

    // ==================== 5. ABOUT CORNER (EAST WING) ====================
    const aboutGroup = new THREE.Group();
    scene.add(aboutGroup);

    // Fluted Travertine Plinth
    addArchMesh(aboutGroup, new THREE.CylinderGeometry(0.44, 0.48, 1.04, 16), { color: PALETTE.stoneWarm, roughness: 0.85 }, 'about', {
      pos: [5.15, 0.52, -1.2], interactId: 'about', interactZone: 'about', keepLine: 0.16
    });
    // Sculptural r.n Monogram Block on Plinth
    addArchMesh(aboutGroup, new THREE.BoxGeometry(0.42, 0.42, 0.42), { color: PALETTE.ink, roughness: 0.55 }, 'about', {
      pos: [5.15, 1.26, -1.2], rot: [0, 0.42, 0], interactId: 'about', interactZone: 'about', keepLine: 0.14
    });
    const terraSphere = addArchMesh(aboutGroup, new THREE.SphereGeometry(0.11, 20, 16), { color: PALETTE.terra, roughness: 0.42 }, 'about', {
      pos: [5.44, 1.15, -0.96], sketchEdges: false, interactId: 'about', interactZone: 'about'
    });

    // Manifesto Wall Frame on East Wall
    const plaqueFrame = addArchMesh(aboutGroup, new THREE.BoxGeometry(0.08, 1.68, 1.32), { map: textures.walnut, color: 0x8E715F }, 'about', {
      pos: [6.36, 2.02, -1.2], interactId: 'about', interactZone: 'about', keepLine: 0.12
    });
    const plaqueFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.18, 1.52),
      new THREE.MeshStandardMaterial({ map: textures.aboutPlaque, roughness: 0.78 })
    );
    plaqueFace.rotation.y = -Math.PI / 2;
    plaqueFace.position.set(-0.045, 0, 0);
    plaqueFace.userData.interactId = 'about';
    plaqueFace.userData.interactZone = 'about';
    interactables.push(plaqueFace);
    plaqueFrame.add(plaqueFace);

    // Sculpted Architectural Indoor Olive/Ficus Plant (living studio warmth)
    addArchMesh(aboutGroup, new THREE.CylinderGeometry(0.32, 0.25, 0.52, 16), { color: PALETTE.stone, roughness: 0.9 }, 'about', {
      pos: [5.45, 0.26, 1.35], keepLine: 0.10
    });
    addArchMesh(aboutGroup, new THREE.CylinderGeometry(0.032, 0.048, 1.25, 8), { color: PALETTE.walnutDark, roughness: 0.9 }, 'about', {
      pos: [5.45, 0.95, 1.35], rot: [0.06, 0, -0.05], sketchEdges: false
    });
    [[5.45, 1.65, 1.35, 0.42], [5.18, 1.48, 1.52, 0.30], [5.68, 1.52, 1.18, 0.32]].forEach(([px, py, pz, r]) => {
      addArchMesh(aboutGroup, new THREE.DodecahedronGeometry(r, 1), { color: 0x6D7869, roughness: 0.88 }, 'about', {
        pos: [px, py, pz], sketchEdges: false
      });
    });

    // ==================== 6. CLICK-TO-WALK TARGET RING & MINI CHARACTER ====================
    const targetRing = new THREE.Mesh(
      new THREE.RingGeometry(0.14, 0.19, 28),
      new THREE.MeshBasicMaterial({ color: PALETTE.terra, transparent: true, opacity: 0.0, side: THREE.DoubleSide })
    );
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.y = 0.018;
    scene.add(targetRing);

    const miniCharacter = new MiniCharacter();
    scene.add(miniCharacter.group);
    scene.add(miniCharacter.contactShadow);

    // ==================== PRECISION SKETCH -> MATERIAL REALITY UPDATER ====================
    function updateSketchReveal(focusWorldPos, activeZoneKey, dt) {
      const rate = Math.min(1, dt * 3.4);
      Object.entries(zoneRevealState).forEach(([key, zone]) => {
        const dist = focusWorldPos.distanceTo(zone.pos);
        const proximity = THREE.MathUtils.clamp(1 - (dist - 1.6) / zone.radius, 0, 1);
        const target = key === activeZoneKey ? 1.0 : Math.max(zone.minValue, proximity);
        zone.value += (target - zone.value) * rate;
        // Preserve explored state subtly once revealed
        if (zone.value > 0.72 && zone.minValue < 0.56) {
          zone.minValue = Math.min(0.56, zone.minValue + dt * 0.22);
        }
        const r = THREE.MathUtils.clamp(zone.value, 0, 1);
        zone.items.forEach((item) => {
          // Preserve intentional material/color hierarchy even in unexplored zones.
          item.mat.color.copy(sketchColor).lerp(item.baseColor, 0.91 + 0.09 * r);
          if (item.edges) {
            item.edges.material.opacity = THREE.MathUtils.lerp(0.40, item.keepLine * 0.75, r);
          }
        });
      });
    }

    // r128 treats hex colors as linear values. Our editorial palette is authored
    // in sRGB; convert exactly once (including shared materials) before ACES.
    // Texture encoding is already sRGB, so this does not double-convert images.
    const normalizedMaterials = new Set();
    scene.traverse(obj => {
      const materials = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
      for (const m of materials) {
        if (normalizedMaterials.has(m)) continue;
        normalizedMaterials.add(m);
        if(m.color)m.color.convertSRGBToLinear();
      }
    });
    for(const zone of Object.values(zoneRevealState)) for(const item of zone.items) item.baseColor.copy(item.mat.color);
    scene.background.convertSRGBToLinear();
    scene.fog.color.convertSRGBToLinear();
    scene.updateMatrixWorld(true);
    return {
      renderer,
      scene,
      camera,
      floorMesh,
      deskTopMesh,
      interactables,
      cameraColliders,
      miniCharacter,
      targetRing,
      mountMarker,
      terraSphere,
      zoneRevealState,
      getAssetStatus: () => ({ actape: !!textures.actapeArt.sourceLoaded, snug: !!textures.snugArt.sourceLoaded, phone: !!textures.phoneScreen.sourceLoaded }),
      updateSketchReveal
    };
  }

  global.createAtelierWorld = createAtelierWorld;
})(window);
