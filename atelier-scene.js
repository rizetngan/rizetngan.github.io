/* rizet ngan. — The Product Atelier
 * Three.js WebGL Architectural Gallery × Working Atelier
 * Precision Sketch -> Material Reality + Sculptural Mini Character
 */
(function (global) {
  'use strict';

  const PALETTE = {
    ivory: 0xF2F0EB,
    ink: 0x202321,
    terra: 0xA04D3E,
    stone: 0xE4E0D7,
    stoneWarm: 0xDDD7CC,
    walnut: 0x8E715F,
    walnutDark: 0x6A5244,
    graphite: 0x77756F,
    metalDark: 0x313634,
    paper: 0xF7F5F0
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
      for (let y = 0; y < h; y += 2) {
        const wave = Math.sin(y * 0.045) * 8;
        ctx.strokeStyle = y % 6 === 0 ? 'rgba(62,44,34,0.22)' : 'rgba(112,86,70,0.16)';
        ctx.lineWidth = 1 + (y % 3 === 0 ? 1 : 0);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.33, y + wave, w * 0.66, y - wave, w, y);
        ctx.stroke();
      }
    }, 2, 1);

    // 4. Actape Exhibit Artwork
    const actapeArt = makeCanvasTexture(768, 512, (ctx, w, h) => {
      ctx.fillStyle = '#202321';
      ctx.fillRect(0, 0, w, h);
      // Architectural grid
      ctx.strokeStyle = 'rgba(242,240,235,0.08)';
      ctx.lineWidth = 1;
      for (let x = 48; x < w; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 48; y < h; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      // Window frame
      ctx.fillStyle = '#2A2E2B';
      ctx.strokeStyle = 'rgba(242,240,235,0.18)';
      ctx.lineWidth = 2;
      ctx.fillRect(72, 92, w - 144, 270);
      ctx.strokeRect(72, 92, w - 144, 270);
      // Timeline bars
      const bars = [
        { x: 112, y: 158, w: 190, c: '#A04D3E' },
        { x: 245, y: 204, w: 260, c: '#E4E0D7' },
        { x: 158, y: 250, w: 210, c: '#8E715F' },
        { x: 390, y: 296, w: 230, c: '#A04D3E' }
      ];
      bars.forEach(b => {
        ctx.fillStyle = b.c;
        ctx.fillRect(b.x, b.y, b.w, 22);
      });
      // Playhead
      ctx.strokeStyle = '#A04D3E';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(356, 126); ctx.lineTo(356, 342); ctx.stroke();
      ctx.fillStyle = '#A04D3E';
      ctx.beginPath(); ctx.arc(356, 126, 6, 0, Math.PI * 2); ctx.fill();
      // Editorial typography
      ctx.fillStyle = '#F2F0EB';
      ctx.font = '400 54px Georgia, serif';
      ctx.fillText('Actape', 74, 434);
      ctx.fillStyle = '#A04D3E';
      ctx.font = '500 18px sans-serif';
      ctx.fillText('01 / CROSS-PLATFORM MACRO WORKFLOW', 74, 466);
      ctx.fillStyle = 'rgba(242,240,235,0.55)';
      ctx.font = '500 15px monospace';
      ctx.fillText('MACOS · WINDOWS · RECORD / EDIT / REPLAY', 340, 434);
    });

    // 5. Snug for Windows Exhibit Artwork
    const snugArt = makeCanvasTexture(768, 512, (ctx, w, h) => {
      ctx.fillStyle = '#ECE8DF';
      ctx.fillRect(0, 0, w, h);
      // Subtle architectural crosshairs
      ctx.strokeStyle = 'rgba(119,117,111,0.18)';
      ctx.lineWidth = 1;
      for (let x = 64; x < w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      // Desktop outline left
      ctx.strokeStyle = '#77756F';
      ctx.lineWidth = 2;
      ctx.strokeRect(86, 98, 286, 196);
      ctx.fillStyle = 'rgba(142,113,95,0.14)';
      ctx.fillRect(102, 114, 146, 164);
      ctx.fillStyle = 'rgba(32,35,33,0.08)';
      ctx.fillRect(258, 114, 98, 164);
      // Connector arc
      ctx.strokeStyle = '#A04D3E';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(372, 196);
      ctx.quadraticCurveTo(430, 140, 488, 196);
      ctx.stroke();
      ctx.setLineDash([]);
      // Phone portrait viewport right
      ctx.fillStyle = '#202321';
      ctx.fillRect(488, 72, 164, 284);
      ctx.fillStyle = '#F2F0EB';
      ctx.fillRect(500, 90, 140, 248);
      ctx.fillStyle = '#A04D3E';
      ctx.fillRect(516, 112, 108, 18);
      ctx.fillStyle = '#E4E0D7';
      ctx.fillRect(516, 144, 108, 92);
      ctx.fillStyle = '#8E715F';
      ctx.fillRect(516, 250, 108, 68);
      // Typography
      ctx.fillStyle = '#202321';
      ctx.font = '400 50px Georgia, serif';
      ctx.fillText('Snug for Windows', 86, 430);
      ctx.fillStyle = '#A04D3E';
      ctx.font = '500 18px sans-serif';
      ctx.fillText('02 / PORTRAIT REMOTE WORKSPACE', 86, 462);
    });

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

    return { limestone, plaster, walnut, actapeArt, snugArt, labScreen, sketchpad, aboutPlaque };
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
      this.group.scale.setScalar(0.68); // miniature: ~40% of desk height

      const matGraphite = new THREE.MeshStandardMaterial({ color: 0x2B2F2D, roughness: 0.72, metalness: 0.08 });
      const matIvory = new THREE.MeshStandardMaterial({ color: PALETTE.ivory, roughness: 0.55, metalness: 0.04 });
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
      const torsoGeo = new THREE.CylinderGeometry(0.072, 0.098, 0.25, 16);
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
      [-0.049, 0.049].forEach((x) => {
        const shoe = new THREE.Mesh(shoeGeo, matGraphite);
        shoe.position.set(x, 0.016, 0.018);
        shoe.castShadow = true;
        this.rig.add(shoe);
      });

      // Smooth ovoid sculptural head (not big-head cartoon: ~1:6.5 architectural proportion)
      const headGeo = new THREE.SphereGeometry(0.068, 18, 16);
      this.head = new THREE.Mesh(headGeo, matIvory);
      this.head.scale.set(0.92, 1.08, 0.96);
      this.head.position.y = 0.548;
      this.head.castShadow = true;
      this.rig.add(this.head);

      // Subtle forward gaze cue (minimal dark visor/nose line so facing direction reads clearly)
      const gazeGeo = new THREE.BoxGeometry(0.044, 0.01, 0.014);
      const gaze = new THREE.Mesh(gazeGeo, matGraphite);
      gaze.position.set(0, 0.554, 0.061);
      this.rig.add(gaze);

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
    renderer.toneMappingExposure = 1.14;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE9E4DB);
    scene.fog = new THREE.FogExp2(0xE9E4DB, 0.009);

    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);
    const textures = createTextures();

    // Lighting — Soft natural architectural daylight + warm bench lamp
    const hemi = new THREE.HemisphereLight(0xFFF8ED, 0xB9AFA0, 0.78);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xFFF7EB, 1.30);
    sun.position.set(-10, 16, 12);
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
    sun.shadow.normalBias = 0.02;
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0xE4E2DC, 0.26);
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

    const sketchColor = new THREE.Color(0xECEAE3);
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
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCFC5B9, roughness: 0.94 });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(14.8, 0.34, 21.0), plinthMat);
    plinth.position.set(0, -0.23, 3.0);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    archGroup.add(plinth);
    const plinthFoot = new THREE.Mesh(new THREE.BoxGeometry(15.0, 0.045, 21.2), new THREE.MeshStandardMaterial({ color: 0x777064, roughness: 0.74 }));
    plinthFoot.position.set(0, -0.43, 3.0);
    archGroup.add(plinthFoot);
    const presentationGround = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0xE5DFD5, roughness: 1.0 }));
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
      color: 0xF0EDE6,
      roughness: 0.86,
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
    addArchMesh(archGroup, new THREE.BoxGeometry(14.4, 4.8, 0.35), { map: textures.plaster, color: 0xECE8E0 }, 'corridor', {
      pos: [0, 2.4, -5.5], castShadow: false, keepLine: 0.08, cameraBlocker: true
    });

    // West Wall with Slatted Clerestory Window Opening (x = -6.6)
    addArchMesh(archGroup, new THREE.BoxGeometry(0.35, 4.8, 12.0), { map: textures.plaster, color: 0xEBE7DF }, 'notes', {
      pos: [-6.6, 2.4, -0.5], castShadow: false, keepLine: 0.08, cameraBlocker: true
    });
    // East Wall (x = +6.6)
    addArchMesh(archGroup, new THREE.BoxGeometry(0.35, 4.8, 12.0), { map: textures.plaster, color: 0xEBE7DF }, 'about', {
      pos: [6.6, 2.4, -0.5], castShadow: false, keepLine: 0.08, cameraBlocker: true
    });

    // Purpose-built layered gallery wall: reveals, shadow joints and a tactile
    // horizontal datum make it read as architecture rather than an empty box.
    const shadowJointMat = new THREE.MeshStandardMaterial({ color: 0xB9AEA1, roughness: 0.95 });
    [-5.95, -3.05, 0, 3.05, 5.95].forEach(x => {
      const joint = new THREE.Mesh(new THREE.BoxGeometry(0.014, 3.88, 0.024), shadowJointMat);
      joint.position.set(x, 2.1, -5.304);
      archGroup.add(joint);
    });
    const galleryRail = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.035, 0.10), new THREE.MeshStandardMaterial({ color: 0xAC9783, roughness: 0.84 }));
    galleryRail.position.set(0, 3.53, -5.28);
    archGroup.add(galleryRail);

    // Architectural Corridor Portal Ribs (Half-open stone thresholds — ITOM-inspired depth)
    [10.2, 7.6, 5.0].forEach((zPos, idx) => {
      const zone = idx === 0 ? 'entrance' : 'corridor';
      // Left pier
      addArchMesh(archGroup, new THREE.BoxGeometry(0.55, 4.5, 0.42), { color: PALETTE.stone }, zone, {
        pos: [-2.65, 2.25, zPos], keepLine: 0.16, cameraBlocker: true
      });
      // Right pier
      addArchMesh(archGroup, new THREE.BoxGeometry(0.55, 4.5, 0.42), { color: PALETTE.stone }, zone, {
        pos: [2.65, 2.25, zPos], keepLine: 0.16, cameraBlocker: true
      });
      // Overhead lintel beam
      addArchMesh(archGroup, new THREE.BoxGeometry(5.85, 0.48, 0.44), { color: PALETTE.stoneWarm }, zone, {
        pos: [0, 4.26, zPos], keepLine: 0.16, cameraBlocker: true
      });
    });

    // Entrance Travertine Threshold Bench (left side of corridor entrance)
    addArchMesh(archGroup, new THREE.BoxGeometry(0.55, 0.42, 1.9), { color: PALETTE.stoneWarm }, 'entrance', {
      pos: [-1.85, 0.21, 9.0], keepLine: 0.16
    });
    // Entrance Terracotta Architectural Line Accent on right pier
    addArchMesh(archGroup, new THREE.BoxGeometry(0.06, 1.35, 0.06), { color: PALETTE.terra, roughness: 0.55 }, 'entrance', {
      pos: [2.35, 1.55, 10.2], sketchEdges: false
    });

    // Skylight Ceiling Louvers (cast soft architectural shadow rhythm)
    for (let z = -3.6; z <= 3.6; z += 1.8) {
      addArchMesh(archGroup, new THREE.BoxGeometry(12.6, 0.14, 0.22), { color: PALETTE.stone }, 'corridor', {
        pos: [0, 4.65, z], receiveShadow: false, keepLine: 0.12
      });
    }

    // ==================== 2. PROTOTYPE BENCH (LAB — VISUAL & EMOTIONAL CORE) ====================
    const benchGroup = new THREE.Group();
    scene.add(benchGroup);

    // Woven Warm Stone Studio Rug under Prototype Bench
    addArchMesh(benchGroup, new THREE.BoxGeometry(6.2, 0.022, 3.8), { color: 0xDFD9CE, roughness: 0.96 }, 'lab', {
      pos: [0, 0.011, 0], castShadow: false, keepLine: 0.10
    });

    // Smoked Walnut Desk Top (y = 0.96 to 1.02, walkable surface at y = 1.02!)
    const deskTopMesh = addArchMesh(benchGroup, new THREE.BoxGeometry(4.6, 0.09, 2.2), {
      map: textures.walnut,
      color: 0xB5957E,
      roughness: 0.62
    }, 'lab', {
      pos: [0, 0.975, 0], interactId: 'lab', interactZone: 'lab', keepLine: 0.12
    });
    deskTopMesh.name = 'DeskSurface';

    // Tapered Matte Graphite Steel Legs & Crossbeam
    [[-2.05, -0.88], [2.05, -0.88], [-2.05, 0.88], [2.05, 0.88]].forEach(([lx, lz]) => {
      addArchMesh(benchGroup, new THREE.BoxGeometry(0.085, 0.94, 0.085), { color: PALETTE.metalDark, roughness: 0.45, metalness: 0.35 }, 'lab', {
        pos: [lx, 0.47, lz], keepLine: 0.10
      });
    });
    addArchMesh(benchGroup, new THREE.BoxGeometry(4.1, 0.05, 0.05), { color: PALETTE.metalDark, roughness: 0.45, metalness: 0.35 }, 'lab', {
      pos: [0, 0.28, -0.88], keepLine: 0.08
    });

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
    const monitorBezel = addArchMesh(benchGroup, new THREE.BoxGeometry(1.48, 0.88, 0.055), { color: PALETTE.ink, roughness: 0.4, metalness: 0.25 }, 'lab', {
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
    addArchMesh(benchGroup, new THREE.BoxGeometry(0.08, 0.024, 0.13), { color: 0x3A3E3C, roughness: 0.5 }, 'lab', {
      pos: [0.24, 1.032, 0.05], keepLine: 0.08
    });

    // Mobile Prototype Device on Stand (right side of desk -> Snug preview)
    addArchMesh(benchGroup, new THREE.BoxGeometry(0.14, 0.02, 0.14), { color: PALETTE.metalDark, metalness: 0.4, roughness: 0.4 }, 'lab', {
      pos: [1.05, 1.03, -0.18], keepLine: 0.08
    });
    const phoneBody = addArchMesh(benchGroup, new THREE.BoxGeometry(0.16, 0.31, 0.022), { color: PALETTE.ink, roughness: 0.35, metalness: 0.3 }, 'lab', {
      pos: [1.05, 1.19, -0.18], rot: [-0.22, -0.28, 0], interactId: 'snug', interactZone: 'lab', keepLine: 0.10
    });
    const phoneFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.138, 0.285),
      new THREE.MeshBasicMaterial({ color: 0xECE8DF })
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

    // Architectural Desk Lamp (far right)
    addArchMesh(benchGroup, new THREE.CylinderGeometry(0.13, 0.15, 0.03, 18), { color: PALETTE.metalDark, metalness: 0.4, roughness: 0.45 }, 'lab', {
      pos: [1.72, 1.035, -0.46], keepLine: 0.08
    });
    addArchMesh(benchGroup, new THREE.CylinderGeometry(0.018, 0.018, 0.68, 10), { color: PALETTE.metalDark, metalness: 0.45, roughness: 0.4 }, 'lab', {
      pos: [1.72, 1.36, -0.46], rot: [0, 0, 0.22], keepLine: 0.06
    });
    addArchMesh(benchGroup, new THREE.ConeGeometry(0.18, 0.22, 18), { color: PALETTE.ink, roughness: 0.5 }, 'lab', {
      pos: [1.54, 1.66, -0.38], rot: [0.18, 0, 0.45], keepLine: 0.08
    });

    // Matte Terracotta Ceramic Studio Mug
    addArchMesh(benchGroup, new THREE.CylinderGeometry(0.068, 0.062, 0.13, 16), { color: PALETTE.terra, roughness: 0.62 }, 'lab', {
      pos: [1.38, 1.085, 0.36], keepLine: 0.08
    });

    // ==================== 3. WORK ARCHIVE (NORTH GALLERY WALL — WALL LIFT EXHIBITS) ====================
    const archiveGroup = new THREE.Group();
    scene.add(archiveGroup);

    function createExhibit(xPos, texture, zoneKey, interactId) {
      const g = new THREE.Group();
      g.position.set(xPos, 2.38, -5.22);
      archiveGroup.add(g);

      // Deep Walnut Museum Frame
      addArchMesh(g, new THREE.BoxGeometry(2.58, 1.76, 0.12), { map: textures.walnut, color: 0x8E715F, roughness: 0.58 }, zoneKey, {
        interactId, interactZone: zoneKey, keepLine: 0.16
      });
      // Recessed Matting
      addArchMesh(g, new THREE.BoxGeometry(2.38, 1.56, 0.03), { color: PALETTE.ivory, roughness: 0.9 }, zoneKey, {
        pos: [0, 0, 0.055], sketchEdges: false, interactId, interactZone: zoneKey
      });
      // Artwork Canvas Plane
      const artMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.18, 1.42),
        new THREE.MeshStandardMaterial({ map: texture, roughness: 0.65, metalness: 0.04 })
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

      // Architectural Floor Alignment Marker for Wall Lift
      const liftRing = new THREE.Mesh(
        new THREE.RingGeometry(0.26, 0.30, 32),
        new THREE.MeshBasicMaterial({ color: PALETTE.terra, transparent: true, opacity: 0.42, side: THREE.DoubleSide })
      );
      liftRing.rotation.x = -Math.PI / 2;
      liftRing.position.set(xPos, 0.015, -3.72);
      archiveGroup.add(liftRing);

      // Gallery Low Stone Plinth Rail below artwork
      addArchMesh(archiveGroup, new THREE.BoxGeometry(2.5, 0.14, 0.42), { color: PALETTE.stoneWarm }, zoneKey, {
        pos: [xPos, 0.07, -5.05], keepLine: 0.12
      });
    }

    createExhibit(-2.12, textures.actapeArt, 'actape', 'actape');
    createExhibit(2.12, textures.snugArt, 'snug', 'snug');

    // ==================== 4. NOTES LIBRARY (WEST WING) ====================
    const notesGroup = new THREE.Group();
    scene.add(notesGroup);

    // Tall Walnut & Stone Architectural Bookcase
    addArchMesh(notesGroup, new THREE.BoxGeometry(0.55, 3.1, 3.2), { color: PALETTE.stone }, 'notes', {
      pos: [-6.12, 1.55, -0.6], interactId: 'notes', interactZone: 'notes', keepLine: 0.14
    });
    for (let s = 0; s < 5; s++) {
      const sy = 0.42 + s * 0.62;
      addArchMesh(notesGroup, new THREE.BoxGeometry(0.58, 0.055, 3.05), { map: textures.walnut, color: 0x9B7D6A }, 'notes', {
        pos: [-6.08, sy, -0.6], interactId: 'notes', interactZone: 'notes', keepLine: 0.10
      });
      // Books on each shelf
      if (s < 4) {
        const spineColors = [0x202321, 0xE4E0D7, 0x8E715F, 0x77756F, 0xA04D3E, 0xD4CEC2];
        for (let b = 0; b < 11; b++) {
          const bh = 0.24 + ((s * 7 + b * 13) % 10) * 0.018;
          const bw = 0.05 + ((b * 5) % 4) * 0.012;
          const bz = -1.85 + b * 0.24 + (s % 2) * 0.04;
          const col = spineColors[(s * 3 + b) % spineColors.length];
          addArchMesh(notesGroup, new THREE.BoxGeometry(0.28, bh, bw), { color: col, roughness: 0.8 }, 'notes', {
            pos: [-5.96, sy + 0.03 + bh / 2, bz], sketchEdges: false, interactId: 'notes', interactZone: 'notes'
          });
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
          item.mat.color.copy(sketchColor).lerp(item.baseColor, r);
          if (item.edges) {
            item.edges.material.opacity = THREE.MathUtils.lerp(0.74, item.keepLine, r);
          }
        });
      });
    }

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
      updateSketchReveal
    };
  }

  global.createAtelierWorld = createAtelierWorld;
})(window);
