/* rizet ngan. — The Product Atelier
 * Centralized Interaction State Machine, Camera Director,
 * Guided Explore & Third-Person Mini Explore (Auto Mount, Wall Lift, Object Focus)
 */
(function () {
  'use strict';

  const appEl = document.getElementById('app');
  const viewportEl = document.getElementById('viewport');
  const canvasEl = document.getElementById('atelierCanvas');
  const modeSwitchBtn = document.getElementById('modeSwitch');
  const modeLabelEl = document.getElementById('modeLabel');
  const zoneNameEl = document.getElementById('zoneName');
  const stateBadgeEl = document.getElementById('stateBadge');
  const controlHintEl = document.getElementById('controlHint');
  const cardOverlineEl = document.getElementById('cardOverline');
  const cardRevealEl = document.getElementById('cardRevealState');
  const cardTitleEl = document.getElementById('cardTitle');
  const cardDescEl = document.getElementById('cardDesc');
  const cardOpenBtn = document.getElementById('cardOpenBtn');
  const cardNextBtn = document.getElementById('cardNextBtn');
  const exhibitPreviewEl = document.getElementById('exhibitPreview');
  const exhibitEyebrowEl = document.getElementById('exhibitEyebrow');
  const exhibitTitleEl = document.getElementById('exhibitTitle');
  const exhibitLeadEl = document.getElementById('exhibitLead');
  const exhibitOpenBtn = document.getElementById('exhibitOpenBtn');
  const exhibitBackBtn = document.getElementById('exhibitBackBtn');
  const contextPromptEl = document.getElementById('contextPrompt');
  const contextPromptTextEl = document.getElementById('contextPromptText');
  const toastEl = document.getElementById('toast');
  const readingOverlayEl = document.getElementById('readingOverlay');
  const readingPanelEl = document.getElementById('readingPanel');
  const readingIndexEl = document.getElementById('readingIndex');
  const readingBodyEl = document.getElementById('readingBody');
  const readingScrollEl = document.getElementById('readingScroll');
  const helpOverlayEl = document.getElementById('helpOverlay');
  const helpModalEl = document.getElementById('helpModal');
  const fallbackEl = document.getElementById('webglFallback');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // ==================== CONTENT DATA (GROUNDED, ZERO FABRICATED METRICS) ====================
  const CONTENT_DATA = {
    actape: {
      index: 'WORK ARCHIVE / 01',
      kicker: 'INDEPENDENT SOFTWARE · CROSS-PLATFORM',
      title: 'Actape',
      lead: '把重复的鼠标与键盘操作，变成可录制、可编辑、可复用的工作流程。',
      image: 'assets/actape-windows-preview.png',
      imageAlt: 'Actape Windows 原生界面示意（来自项目 README）',
      plateTitle: 'ACTAPE',
      plateSub: 'RECORD · EDIT · REPLAY — MACOS & WINDOWS',
      plateClass: 'dark',
      paragraphs: [
        'Actape 源于日常高频重复操作中的一个朴素念头：不需要沉重的企业级 RPA，也能用轻量、直观的方式把一套鼠标和键盘动作记录下来，并按自己的节奏编辑与回放。',
        '这是一个从问题定义、跨端交互设计到独立开发与版本发布的完整产品实践。所有实际功能、支持平台与发布版本均以 GitHub 仓库为准。'
      ],
      highlights: [
        '面向 macOS 与 Windows 的本地桌面应用，聚焦轻量自动化工作流',
        '支持操作录制、步骤编辑、触发方式配置与稳定回放',
        '完整走通需求拆解、界面审美、工程实现与发布验收闭环'
      ],
      links: [
        { label: 'GitHub 仓库 ↗', url: 'https://github.com/rizetngan/Actape', primary: true },
        { label: 'Releases 下载 ↗', url: 'https://github.com/rizetngan/Actape/releases', primary: false }
      ]
    },
    snug: {
      index: 'WORK ARCHIVE / 02',
      kicker: 'COMMUNITY PORT · CROSS-DEVICE EXPERIENCE',
      title: 'Snug for Windows',
      lead: '探索让 Windows 电脑在手机竖屏上拥有更自然远程操作体验的社区移植项目。',
      image: 'assets/snug-phone-running.png',
      imageAlt: 'Snug for Windows 实际虚拟屏 App 资源库（来自项目 README）',
      plateTitle: 'SNUG / WIN',
      plateSub: 'PORTRAIT REMOTE WORKSPACE · COMMUNITY PORT',
      plateClass: '',
      paragraphs: [
        '在移动设备上远程操作桌面电脑时，最大的摩擦往往来自横屏比例与精细点击的错位。Snug for Windows 基于上游 Snug 思路进行 Windows 社区移植，围绕 UU Remote 场景探索竖屏工作空间与窗口适配。',
        '项目记录了真实设备上的验证过程、交互取舍与迭代日志，并保留对上游项目理念的致谢。'
      ],
      highlights: [
        '面向手机竖屏阅读与单手触控习惯的 Windows 远程工作区适配',
        '围绕真实远程办公与移动处理场景反复打磨窗口与缩放逻辑',
        '开源协作与真实设备验证记录，代码公开可查'
      ],
      links: [
        { label: 'GitHub 仓库 ↗', url: 'https://github.com/rizetngan/snug-for-windows', primary: true }
      ]
    },
    lab: {
      index: 'PROTOTYPE BENCH / 03',
      kicker: 'IDEAS TO THINGS · ACTIVE EXPERIMENTS',
      title: 'Prototype Bench',
      lead: '工作台是这间工坊的中心 — 这里存放从问题出发、亲手做出来的原型与工具。',
      plateTitle: 'ideas to things.',
      plateSub: 'AI WORKFLOWS · PROTOTYPES · INTERACTION LAB',
      plateClass: 'walnut',
      paragraphs: [
        '不是每一个产品思考都需要等待漫长的立项流程。很多时候，先动手做出一个能跑起来的原型、一条 AI 工作流或一款解决具体痛点的小软件，才能真正验证判断是否成立。',
        '桌面上的屏幕、竖屏设备与建筑草图本，对应着我日常工作的三种状态：定义问题、设计交互、写代码把想法落到现实。'
      ],
      highlights: [
        'AI 产品工作流探索：让工具贴近真实业务节奏，而非炫技演示',
        '独立软件原型：从 Actape 到 Snug for Windows 的持续动手实践',
        '在 Mini Explore 模式下，角色可直接跃上这张胡桃木工作台近距离浏览设备'
      ],
      links: [
        { label: '查看 Actape ↗', url: 'https://github.com/rizetngan/Actape', primary: true },
        { label: '查看 Snug for Windows ↗', url: 'https://github.com/rizetngan/snug-for-windows', primary: false }
      ]
    },
    notes: {
      index: 'NOTES LIBRARY / 04',
      kicker: 'FIELD NOTES · PRODUCT & AI THINKING',
      title: 'Notes Library',
      lead: '关于 AI 产品工作流、交互克制与独立创造的持续观察与拆解。',
      plateTitle: 'THINKING IN PROGRESS',
      plateSub: 'PRODUCT JUDGMENT · INTERACTION CRAFT · FIELD NOTES',
      plateClass: '',
      paragraphs: [
        '这面书架收录的不是标准答案，而是做产品过程中的一线笔记：为什么有些 AI 功能看起来很聪明却很难融入日常工作流？一个好的交互如何在不打扰用户的前提下完成复杂动作？',
        '每一篇笔记都从真实做过的事出发，强调问题判断、结构清晰与长期复利。'
      ],
      highlights: [
        '为什么好的 AI 产品往往赢在工作流编排，而不只是单次生成效果',
        '从“能用”到“克制且顺手”：独立软件里的细节取舍笔记',
        '让系统承担复杂动作，把探索方向还给用户：空间交互设计复盘'
      ],
      links: [
        { label: '访问 GitHub 主页 ↗', url: 'https://github.com/rizetngan', primary: false }
      ]
    },
    about: {
      index: 'ABOUT / 05',
      kicker: 'THE MAKER · RIZET NGAN',
      title: 'rizet ngan.',
      lead: 'AI 产品经理、产品思考者与独立创造者。善于发现问题、判断方向，也喜欢亲手把想法做出来。',
      plateTitle: 'r.n',
      plateSub: 'AI PRODUCT · BUSINESS PRACTICE · INDEPENDENT MAKING',
      plateClass: 'dark',
      paragraphs: [
        '这并不是一份求职简历，而是一座长期经营的个人产品工坊。我希望通过真实做出的软件、原型与思考，让访客直观感受到我的产品判断与审美取向。',
        '在长期的商业与产品实践中，我曾先后在省广集团、广东新华集团、希扬集团等机构积累真实业务经验，同时也坚持独立动手开发，把商业理解与工程实现连接在一起。'
      ],
      highlights: [
        '身份定位：AI 产品经理 / 产品思考者 / 独立创造者',
        '商业实践背景：省广集团、广东新华集团、希扬集团（坚持真实克制，不虚构项目数据）',
        '代表作品：Actape、Snug for Windows 以及持续迭代的 The Product Atelier'
      ],
      links: [
        { label: 'GitHub · rizetngan ↗', url: 'https://github.com/rizetngan', primary: true },
        { label: 'Actape ↗', url: 'https://github.com/rizetngan/Actape', primary: false },
        { label: 'Snug for Windows ↗', url: 'https://github.com/rizetngan/snug-for-windows', primary: false }
      ]
    }
  };

  // ==================== CURATED GUIDED CHAPTERS ====================
  const CHAPTERS = [
    {
      id: 'entrance',
      overline: '01 / ENTRANCE',
      title: '入口前厅',
      zoneLabel: 'ENTRANCE',
      desc: '柔和自然光落入暖石前厅。向下滚动或点击空间，沿建筑走廊走入工坊。',
      camPos: new THREE.Vector3(5.2, 3.1, 8.0),
      camLook: new THREE.Vector3(-.2, 1.45, -.2),
      spawnPos: new THREE.Vector3(0, 0, 4.8),
      contentId: 'about',
      revealZone: 'entrance'
    },
    {
      id: 'corridor',
      overline: '02 / THE CORRIDOR',
      title: '建筑探索走廊',
      zoneLabel: 'THE CORRIDOR',
      desc: '建筑线稿随距离逐步显影为石材与胡桃木，连接中央工作台与四周展区。',
      camPos: new THREE.Vector3(0.24, 1.75, 9.65),
      camLook: new THREE.Vector3(0.1, 1.24, -0.8),
      spawnPos: new THREE.Vector3(0, 0, 4.8),
      contentId: 'lab',
      revealZone: 'corridor'
    },
    {
      id: 'lab',
      overline: '03 / PROTOTYPE BENCH',
      title: '原型工作台',
      zoneLabel: 'PROTOTYPE BENCH',
      desc: '空间的视觉核心：胡桃木工作台、显示器、竖屏设备与建筑草图。按 F 可让 Mini 角色跃上桌面。',
      camPos: new THREE.Vector3(2.8, 2.28, 4.35),
      camLook: new THREE.Vector3(.10, 1.45, -.18),
      spawnPos: new THREE.Vector3(0, 0, 2.35),
      contentId: 'lab',
      revealZone: 'lab'
    },
    {
      id: 'work',
      overline: '04 / WORK ARCHIVE',
      title: '作品档案厅',
      zoneLabel: 'WORK ARCHIVE',
      desc: '收录独立作品 Actape 与 Snug for Windows。点击展框打开详情，或在 Mini 模式下靠近展品后按 E 查看。',
      camPos: new THREE.Vector3(0, 3.02, 0.75),
      camLook: new THREE.Vector3(0, 2.14, -5.2),
      spawnPos: new THREE.Vector3(0, 0, -2.5),
      contentId: 'actape',
      revealZone: 'actape'
    },
    {
      id: 'notes',
      overline: '05 / NOTES LIBRARY',
      title: '笔记书架',
      zoneLabel: 'NOTES LIBRARY',
      desc: '关于 AI 产品工作流、交互克制与独立创造的阶段性思考与拆解。',
      camPos: new THREE.Vector3(-2.1, 2.05, 1.45),
      camLook: new THREE.Vector3(-5.8, 1.55, -0.6),
      spawnPos: new THREE.Vector3(-3.3, 0, -0.4),
      contentId: 'notes',
      revealZone: 'notes'
    },
    {
      id: 'about',
      overline: '06 / ABOUT',
      title: '关于 rizet ngan.',
      zoneLabel: 'ABOUT',
      desc: '商业实践与独立创造并行的长期个人品牌，所有内容源于真实经历与作品。',
      camPos: new THREE.Vector3(2.2, 1.95, 1.35),
      camLook: new THREE.Vector3(5.4, 1.45, -1.2),
      spawnPos: new THREE.Vector3(3.4, 0, -0.8),
      contentId: 'about',
      revealZone: 'about'
    }
  ];

  // ==================== INTERACTION ZONES & COLLISION ====================
  const DESK_BOUNDS = { minX: -2.35, maxX: 2.35, minZ: -1.15, maxZ: 1.15, topY: 1.02 };
  const FLOOR_BOUNDS = { minX: -5.7, maxX: 5.7, minZ: -4.55, maxZ: 10.6 };

  const WALL_EXHIBITS = [
    {
      id: 'actape',
      title: 'Actape',
      eyebrow: 'WORK ARCHIVE / 01',
      lead: CONTENT_DATA.actape.lead,
      triggerCenter: new THREE.Vector3(-2.12, 0, -3.72),
      triggerRadius: 1.05,
      wallDir: new THREE.Vector3(0, 0, -1),
      hoverPos: new THREE.Vector3(-3.35, 1.68, -3.85),
      safeFloorPos: new THREE.Vector3(-2.12, 0, -3.25),
      camPos: new THREE.Vector3(-1.95, 2.38, -2.05),
      camLook: new THREE.Vector3(-2.12, 2.35, -5.2)
    },
    {
      id: 'snug',
      title: 'Snug for Windows',
      eyebrow: 'WORK ARCHIVE / 02',
      lead: CONTENT_DATA.snug.lead,
      triggerCenter: new THREE.Vector3(2.12, 0, -3.72),
      triggerRadius: 1.05,
      wallDir: new THREE.Vector3(0, 0, -1),
      hoverPos: new THREE.Vector3(3.35, 1.68, -3.85),
      safeFloorPos: new THREE.Vector3(2.12, 0, -3.25),
      camPos: new THREE.Vector3(1.95, 2.38, -2.05),
      camLook: new THREE.Vector3(2.12, 2.35, -5.2)
    }
  ];

  const FOCUS_OBJECTS = [
    { id: 'lab', label: 'Studio Monitor · Prototype Bench', surface: 'desk', pos: new THREE.Vector3(-0.15, 1.02, -0.35), radius: 1.05, camOffset: new THREE.Vector3(0.45, 0.95, 1.65) },
    { id: 'snug', label: 'Mobile Prototype · Snug for Windows', surface: 'desk', pos: new THREE.Vector3(1.05, 1.02, -0.18), radius: 0.72, camOffset: new THREE.Vector3(0.65, 0.85, 1.45) },
    { id: 'notes', label: 'Drafting Sketchpad · Notes', surface: 'desk', pos: new THREE.Vector3(-1.42, 1.02, 0.08), radius: 0.78, camOffset: new THREE.Vector3(-0.55, 0.95, 1.45) },
    { id: 'notes', label: 'Notes Library · 笔记书架', surface: 'floor', pos: new THREE.Vector3(-4.55, 0, -0.6), radius: 1.45, camOffset: new THREE.Vector3(1.7, 1.6, 1.6) },
    { id: 'about', label: 'About Corner · 关于 rizet ngan.', surface: 'floor', pos: new THREE.Vector3(4.55, 0, -1.2), radius: 1.45, camOffset: new THREE.Vector3(-1.7, 1.6, 1.6) }
  ];

  // ==================== CHECK WEBGL SUPPORT ====================
  let world = null;
  try {
    if (typeof THREE === 'undefined') throw new Error('Three.js failed to load');
    world = window.createAtelierWorld(canvasEl);
  } catch (err) {
    console.warn('WebGL fallback activated:', err);
    fallbackEl.classList.add('active');
    fallbackEl.setAttribute('aria-hidden', 'false');
    wireFallbackOnly();
    return;
  }

  function wireFallbackOnly() {
    document.querySelectorAll('[data-open-direct]').forEach(btn => {
      btn.addEventListener('click', () => openReading(btn.dataset.openDirect));
    });
    document.getElementById('readingClose').addEventListener('click', closeReading);
    document.getElementById('readingBackdrop').addEventListener('click', closeReading);
  }

  // ==================== STATE MACHINE ====================
  const STATE = {
    // 'GUIDED' | 'MINI_WALKING' | 'AUTO_TRAVERSAL' | 'OBJECT_PREVIEW' | 'READING' | 'TRANSITIONING'
    mode: 'GUIDED',
    preReadingMode: 'GUIDED',
    entered: false,
    miniResume: null,
    nearbyExhibit: null,
    chapterIdx: 0,
    helpOpen: false,
    prevFocusEl: null,

    // Character state
    surface: 'floor', // 'floor' | 'desk'
    charPos: new THREE.Vector3(0, 0, 4.8),
    charVel: new THREE.Vector3(),
    charYaw: Math.PI, // facing -Z (into atelier)
    targetYaw: Math.PI,
    walkTarget: null, // THREE.Vector3 or null
    pendingActionAfterWalk: null, // { type: 'mount' | 'lift' | 'open', targetId, exhibit }

    // Contextual action intent timers & cooldowns
    mountIntentTimer: 0,
    dismountIntentTimer: 0,
    liftIntentTimer: 0,
    liftIntentExhibit: null,
    actionCooldown: 0,

    // Active traversal animation
    traversal: null, // { type, t, duration, startPos, endPos, arcHeight, targetYaw, onComplete, cancelable, safeReturnPos }

    // Active preview / object focus
    activeExhibit: null, // WALL_EXHIBITS item
    focusedObject: null, // FOCUS_OBJECTS item

    // Camera Director state
    camPos: CHAPTERS[0].camPos.clone(),
    camLook: CHAPTERS[0].camLook.clone(),
    desiredCamPos: CHAPTERS[0].camPos.clone(),
    desiredCamLook: CHAPTERS[0].camLook.clone(),
    orbitYaw: 0,
    orbitPitch: 0.40, // ~23° relaxed eye-level exploration; adjustable from 4° to 75°
    orbitDist: 2.85, // user-requested camera arm length; does not change on collision
    collisionDist: 2.85, // actual arm length after architectural obstruction
    focusReturn: null, // saved user-selected view before cinematic exhibit framing
    pointerId: null,
    mouseCaptured: false,
    lockUnavailable: isTouchDevice || typeof canvasEl.requestPointerLock !== 'function',
    unlockedAt: -Infinity,
    dragButton: 0,
    pointerParallax: { x: 0, y: 0 },

    // Input state
    keys: new Set(),
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragMoved: false,
    wheelAccum: 0,
    lastWheelTime: 0,
    touchStartY: null
  };

  let toastTimer = 0;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 2600);
  }

  // Capture only in response to an explicit entry or canvas click. Never auto-recapture
  // after Escape, a reading panel, or loss of browser focus.
  function stopMiniInput() {
    STATE.keys.clear();
    STATE.charVel.set(0, 0, 0);
    STATE.walkTarget = null;
    STATE.pendingActionAfterWalk = null;
    STATE.mountIntentTimer = 0;
    STATE.dismountIntentTimer = 0;
    STATE.liftIntentTimer = 0;
    STATE.isDragging = false;
    if (STATE.pointerId !== null && canvasEl.hasPointerCapture?.(STATE.pointerId)) {
      canvasEl.releasePointerCapture(STATE.pointerId);
    }
    STATE.pointerId = null;
    viewportEl.classList.remove('is-dragging');
  }

  function releaseMiniMouse() {
    stopMiniInput();
    if (document.pointerLockElement === canvasEl) document.exitPointerLock();
  }

  function captureMiniMouse() {
    if (STATE.mode !== 'MINI_WALKING' || STATE.helpOpen || STATE.lockUnavailable ||
        document.pointerLockElement === canvasEl) return false;
    try {
      const request = canvasEl.requestPointerLock();
      if (request && typeof request.catch === 'function') {
        request.catch(() => { STATE.lockUnavailable = true; updateUI(); });
      }
      return true;
    } catch (_) {
      STATE.lockUnavailable = true;
      updateUI();
      return false;
    }
  }

  function rotateMiniMouse(dx, dy) {
    STATE.orbitYaw -= dx * 0.0035;
    STATE.orbitYaw = Math.atan2(Math.sin(STATE.orbitYaw), Math.cos(STATE.orbitYaw));
    STATE.orbitPitch = THREE.MathUtils.clamp(STATE.orbitPitch + dy * 0.0030, 0.07, 1.31);
  }

  function setEntered() {
    if (!STATE.entered) {
      STATE.entered = true;
      appEl.classList.add('is-entered');
    }
  }

  function updateUI() {
    const ch = CHAPTERS[STATE.chapterIdx];
    const inMini = STATE.mode !== 'GUIDED' && !(STATE.mode === 'READING' && STATE.preReadingMode === 'GUIDED');

    appEl.classList.toggle('is-mini', inMini);
    viewportEl.classList.toggle('is-mini', inMini);
    viewportEl.classList.toggle('is-mouse-captured', STATE.mouseCaptured);
    appEl.classList.toggle('is-reading', STATE.mode === 'READING');

    modeSwitchBtn.classList.toggle('active', inMini);
    modeSwitchBtn.setAttribute('aria-pressed', String(inMini));
    modeLabelEl.textContent = inMini ? 'Mini Explore' : 'Guided';

    // Top nav active state
    document.querySelectorAll('.main-nav a[data-goto]').forEach(a => {
      a.classList.toggle('active', a.dataset.goto === ch.id);
    });

    // Chapter dots
    document.querySelectorAll('#chapterDots button').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === STATE.chapterIdx);
    });

    // Guided spatial card
    cardOverlineEl.textContent = ch.overline;
    cardTitleEl.textContent = ch.title;
    cardDescEl.textContent = ch.desc;
    cardOpenBtn.dataset.content = ch.contentId;

    // Bottom bar zone & state badge
    if (!inMini) {
      zoneNameEl.textContent = ch.zoneLabel;
      stateBadgeEl.textContent = 'GUIDED EXPLORE';
      controlHintEl.textContent = '滚轮推进镜头 · 点击物件进入';
    } else {
      zoneNameEl.textContent = inferZoneLabelFromPos(STATE.charPos);
      if (STATE.mode === 'AUTO_TRAVERSAL') {
        stateBadgeEl.textContent = STATE.traversal?.type === 'mount' ? 'AUTO MOUNT' :
          STATE.traversal?.type === 'dismount' ? 'RETURN FLOOR' : 'WALL LIFT';
      } else if (STATE.mode === 'OBJECT_PREVIEW') {
        stateBadgeEl.textContent = 'EXHIBIT PREVIEW';
      } else if (STATE.surface === 'desk') {
        stateBadgeEl.textContent = 'ON PROTOTYPE BENCH';
      } else {
        stateBadgeEl.textContent = 'MINI EXPLORE';
      }
      controlHintEl.textContent = STATE.mode === 'OBJECT_PREVIEW' ? 'E 查看 · Esc 返回'
        : STATE.mode === 'AUTO_TRAVERSAL' ? 'Esc 返回'
        : STATE.mouseCaptured ? 'WASD 移动 · 鼠标视角 · E 交互 · Esc 释放'
        : STATE.lockUnavailable ? 'WASD / 单击移动 · 拖拽视角 · Esc 退出'
        : '点击画面继续探索 · F 退出';
    }

    // Wall Lift Exhibit Preview card
    const showExhibit = STATE.mode === 'OBJECT_PREVIEW' && STATE.activeExhibit;
    exhibitPreviewEl.classList.toggle('open', Boolean(showExhibit));
    exhibitPreviewEl.setAttribute('aria-hidden', String(!showExhibit));
    if (showExhibit) {
      exhibitEyebrowEl.textContent = STATE.activeExhibit.eyebrow;
      exhibitTitleEl.textContent = STATE.activeExhibit.title;
      exhibitLeadEl.textContent = STATE.activeExhibit.lead;
    }

    // Quiet Object Focus / Mount contextual prompt
    let promptText = '';
    if (STATE.mode === 'MINI_WALKING') {
      if (STATE.nearbyExhibit) {
        promptText = STATE.nearbyExhibit.title + ' · E 查看';
      } else if (STATE.focusedObject) {
        promptText = `${STATE.focusedObject.label} · 按 E 打开详情`;
      } else if (STATE.surface === 'floor' && isNearDeskMount(STATE.charPos)) {
        promptText = '继续向工作台前行即可自动登桌';
      }
    }
    contextPromptEl.classList.toggle('visible', Boolean(promptText));
    if (promptText) contextPromptTextEl.textContent = promptText;
  }

  function inferZoneLabelFromPos(pos) {
    if (STATE.surface === 'desk') return 'PROTOTYPE BENCH';
    if (pos.z > 7.2) return 'ENTRANCE';
    if (pos.z > 2.6) return 'THE CORRIDOR';
    if (pos.z < -2.6) return 'WORK ARCHIVE';
    if (pos.x < -3.0) return 'NOTES LIBRARY';
    if (pos.x > 3.0) return 'ABOUT';
    return 'PROTOTYPE BENCH';
  }

  // ==================== GUIDED EXPLORE NAVIGATION ====================
  function gotoChapter(idOrIdx, { quiet = false, openHero = false } = {}) {
    let idx = typeof idOrIdx === 'number' ? idOrIdx : CHAPTERS.findIndex(c => c.id === idOrIdx);
    if (idx < 0) idx = 0;

    if (STATE.mode === 'READING') closeReading();
    if (STATE.helpOpen) closeHelp();
    if (STATE.mode !== 'GUIDED') exitMiniExplore({ jumpToNearest: false });

    if (idx !== STATE.chapterIdx) STATE.miniResume = null;
    STATE.chapterIdx = idx;
    if (!openHero) setEntered();

    const ch = CHAPTERS[idx];
    STATE.desiredCamPos.copy(ch.camPos);
    STATE.desiredCamLook.copy(ch.camLook);
    updateUI();

    if (!quiet) {
      try { history.replaceState(null, '', `#${ch.id}`); } catch (_) {}
    }
  }

  function stepChapter(dir) {
    const next = Math.max(0, Math.min(CHAPTERS.length - 1, STATE.chapterIdx + dir));
    if (next !== STATE.chapterIdx) {
      gotoChapter(next);
    } else if (!STATE.entered && dir > 0) {
      gotoChapter(1);
    }
  }

  // ==================== MODE SWITCH: GUIDED <-> MINI EXPLORE ====================
  function enterMiniExplore() {
    if (STATE.mode === 'READING') closeReading();
    if (STATE.helpOpen) closeHelp();
    setEntered();

    // Position inheritance from current Guided chapter
    const ch = CHAPTERS[STATE.chapterIdx];
    STATE.surface = 'floor';
    STATE.charPos.copy(ch.spawnPos);
    STATE.charVel.set(0, 0, 0);
    STATE.walkTarget = null;
    STATE.pendingActionAfterWalk = null;
    STATE.traversal = null;
    STATE.activeExhibit = null;
    STATE.focusedObject = null;
    STATE.nearbyExhibit = null;
    STATE.actionCooldown = 0.35;

    // Face toward center / exhibit naturally
    const lookDir = new THREE.Vector3().subVectors(ch.camLook, ch.spawnPos);
    STATE.charYaw = Math.atan2(lookDir.x, lookDir.z);
    STATE.targetYaw = STATE.charYaw;
    STATE.orbitYaw = STATE.charYaw - Math.PI;
    STATE.orbitPitch = 0.40; // ~23° natural follow, never forced back after interacting
    STATE.orbitDist = 2.85;
    const resume=STATE.miniResume;
    if(resume && resume.chapter===STATE.chapterIdx){
      STATE.surface=resume.surface;
      STATE.charPos.copy(resume.pos);
      STATE.charYaw=resume.charYaw;STATE.targetYaw=resume.charYaw;
      STATE.orbitYaw=resume.yaw;STATE.orbitPitch=resume.pitch;STATE.orbitDist=resume.dist;
    }
    STATE.collisionDist = STATE.orbitDist;

    world.miniCharacter.group.position.copy(STATE.charPos);
    world.miniCharacter.group.rotation.y = STATE.charYaw;
    world.miniCharacter.group.visible = true;
    world.miniCharacter.setAnim('idle');

    STATE.mode = 'MINI_WALKING';
    STATE.lockUnavailable = isTouchDevice || typeof canvasEl.requestPointerLock !== 'function';
    updateUI();
    captureMiniMouse();
  }

  function exitMiniExplore({ jumpToNearest = true } = {}) {
    if (STATE.mode === 'GUIDED') return;
    releaseMiniMouse();
    if(STATE.traversal){
      STATE.charPos.copy(STATE.traversal.safeReturnPos);
      STATE.surface='floor';
    }else if(STATE.activeExhibit){
      STATE.charPos.copy(STATE.activeExhibit.safeFloorPos);
      STATE.surface='floor';
    }
    if(STATE.focusReturn){
      STATE.orbitYaw=STATE.focusReturn.yaw;STATE.orbitPitch=STATE.focusReturn.pitch;STATE.orbitDist=STATE.focusReturn.distance;
    }
    STATE.focusReturn = null;
    STATE.nearbyExhibit=null;
    STATE.mode = 'GUIDED';
    STATE.keys.clear();
    STATE.walkTarget = null;
    STATE.pendingActionAfterWalk = null;
    STATE.traversal = null;
    STATE.activeExhibit = null;
    STATE.focusedObject = null;
    world.miniCharacter.group.visible = false;
    world.miniCharacter.contactShadow.visible = false;
    world.targetRing.material.opacity = 0;

    if (jumpToNearest) {
      // Inherit approximate spatial zone back to Guided Explore
      let bestIdx = 2;
      let bestDist = Infinity;
      CHAPTERS.forEach((ch, idx) => {
        const d = ch.spawnPos.distanceTo(STATE.charPos);
        if (d < bestDist) { bestDist = d; bestIdx = idx; }
      });
      STATE.chapterIdx = bestIdx;
      STATE.desiredCamPos.copy(CHAPTERS[bestIdx].camPos);
      STATE.desiredCamLook.copy(CHAPTERS[bestIdx].camLook);
    }

    STATE.miniResume=jumpToNearest?{chapter:STATE.chapterIdx,pos:STATE.charPos.clone(),surface:STATE.surface,charYaw:STATE.charYaw,
      yaw:STATE.orbitYaw,pitch:STATE.orbitPitch,dist:STATE.orbitDist}:null;
    updateUI();
  }

  function toggleExploreMode() {
    if (STATE.mode === 'GUIDED') {
      enterMiniExplore();
    } else {
      exitMiniExplore({ jumpToNearest: true });
    }
  }

  // ==================== CONTEXTUAL ACTIONS: AUTO MOUNT & WALL LIFT ====================
  function isNearDeskMount(pos) {
    return Math.abs(pos.x) <= 1.55 && pos.z >= 1.15 && pos.z <= 2.15;
  }

  function startAutoMount() {
    STATE.mode = 'AUTO_TRAVERSAL';
    STATE.walkTarget = null;
    STATE.mountIntentTimer = 0;
    const landX = THREE.MathUtils.clamp(STATE.charPos.x, -1.35, 1.35);
    const startPos = STATE.charPos.clone();
    const endPos = new THREE.Vector3(landX, DESK_BOUNDS.topY, 0.62);

    world.miniCharacter.setAnim('mount');
    STATE.traversal = {
      type: 'mount',
      t: 0,
      duration: prefersReducedMotion ? 0.25 : 0.72,
      startPos,
      endPos,
      arcHeight: 0.72,
      targetYaw: Math.PI,
      safeReturnPos: new THREE.Vector3(landX, 0, 1.65),
      onComplete: () => {
        STATE.surface = 'desk';
        STATE.charPos.copy(endPos);
        STATE.mode = 'MINI_WALKING';
        STATE.actionCooldown = 0.65;
        world.miniCharacter.setAnim('land');
        updateUI();
      }
    };
    updateUI();
  }

  function startAutoDismount(exitDir) {
    STATE.mode = 'AUTO_TRAVERSAL';
    STATE.walkTarget = null;
    STATE.dismountIntentTimer = 0;
    const startPos = STATE.charPos.clone();
    const landPos = startPos.clone();
    landPos.y = 0;
    if (Math.abs(exitDir.z) >= Math.abs(exitDir.x)) {
      landPos.z = exitDir.z > 0 ? DESK_BOUNDS.maxZ + 0.58 : DESK_BOUNDS.minZ - 0.58;
      landPos.x = THREE.MathUtils.clamp(landPos.x, -2.1, 2.1);
    } else {
      landPos.x = exitDir.x > 0 ? DESK_BOUNDS.maxX + 0.58 : DESK_BOUNDS.minX - 0.58;
      landPos.z = THREE.MathUtils.clamp(landPos.z, -1.0, 1.0);
    }

    world.miniCharacter.setAnim('mount');
    STATE.traversal = {
      type: 'dismount',
      t: 0,
      duration: prefersReducedMotion ? 0.22 : 0.64,
      startPos,
      endPos: landPos,
      arcHeight: 0.42,
      targetYaw: Math.atan2(landPos.x - startPos.x, landPos.z - startPos.z),
      safeReturnPos: landPos.clone(),
      onComplete: () => {
        STATE.surface = 'floor';
        STATE.charPos.copy(landPos);
        STATE.mode = 'MINI_WALKING';
        STATE.actionCooldown = 0.85;
        world.miniCharacter.setAnim('land');
        updateUI();
      }
    };
    updateUI();
  }

  function startWallLift(exhibit) {
    releaseMiniMouse();
    STATE.mode = 'AUTO_TRAVERSAL';
    STATE.walkTarget = null;
    STATE.liftIntentTimer = 0;
    STATE.focusReturn = { yaw: STATE.orbitYaw, pitch: STATE.orbitPitch, distance: STATE.orbitDist };
    STATE.activeExhibit = exhibit;
    STATE.nearbyExhibit=null;
    const startPos = STATE.charPos.clone();
    const endPos = exhibit.hoverPos.clone();

    world.miniCharacter.setAnim('float');
    STATE.traversal = {
      type: 'lift_up',
      t: 0,
      duration: prefersReducedMotion ? 0.25 : 0.85,
      startPos,
      endPos,
      arcHeight: 0.22,
      targetYaw: Math.atan2(exhibit.camLook.x - endPos.x, exhibit.camLook.z - endPos.z),
      safeReturnPos: exhibit.safeFloorPos.clone(),
      onComplete: () => {
        STATE.charPos.copy(endPos);
        STATE.mode = 'OBJECT_PREVIEW';
        world.miniCharacter.setAnim('float');
        updateUI();
      }
    };
    updateUI();
  }

  function cancelWallLift() {
    if (!STATE.activeExhibit) return;
    const exhibit = STATE.activeExhibit;
    STATE.mode = 'AUTO_TRAVERSAL';
    const startPos = STATE.charPos.clone();
    const endPos = exhibit.safeFloorPos.clone();

    STATE.traversal = {
      type: 'lift_down',
      t: 0,
      duration: prefersReducedMotion ? 0.2 : 0.62,
      startPos,
      endPos,
      arcHeight: 0.14,
      targetYaw: 0,
      safeReturnPos: endPos.clone(),
      onComplete: () => {
        STATE.charPos.copy(endPos);
        STATE.activeExhibit = null;
        if (STATE.focusReturn) {
          STATE.orbitYaw = STATE.focusReturn.yaw;
          STATE.orbitPitch = STATE.focusReturn.pitch;
          STATE.orbitDist = STATE.focusReturn.distance;
          STATE.focusReturn = null;
        }
        STATE.mode = 'MINI_WALKING';
        STATE.actionCooldown = 1.1; // Prevent bounce-back re-trigger
        world.miniCharacter.setAnim('land');
        updateUI();
      }
    };
    updateUI();
  }

  // ==================== READING PANEL & HELP MODAL ====================
  function openReading(contentId) {
    const data = CONTENT_DATA[contentId];
    if (!data) return;

    if (STATE.helpOpen) closeHelp();
    STATE.prevFocusEl = document.activeElement;
    if (STATE.mode !== 'READING') {
      STATE.preReadingMode = STATE.mode;
    }
    STATE.mode = 'READING';
    releaseMiniMouse();

    readingIndexEl.textContent = `RIZET NGAN / ${data.index}`;
    readingBodyEl.innerHTML = `
      <div class="reading-kicker">${data.kicker}</div>
      <h2 id="readingTitle">${data.title}</h2>
      <p class="reading-lead">${data.lead}</p>
      ${data.image ? `<figure class="product-image"><img src="${data.image}" alt="${data.imageAlt}"><figcaption>${data.imageAlt}</figcaption></figure>` : `
      <div class="reading-plate ${data.plateClass}">
        <strong>${data.plateTitle}</strong>
        <small>${data.plateSub}</small>
      </div>`}
      <h3>CONTEXT & CRAFT</h3>
      ${data.paragraphs.map(p => `<p>${p}</p>`).join('')}
      <h3>HIGHLIGHTS</h3>
      <ul class="reading-list">
        ${data.highlights.map((h, i) => `<li><em>0${i + 1}</em><span>${h}</span></li>`).join('')}
      </ul>
      ${data.links.length ? `
        <div class="reading-links">
          ${data.links.map(l => `<a class="${l.primary ? '' : 'secondary-link'}" href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`).join('')}
        </div>
      ` : ''}
    `;

    readingScrollEl.scrollTop = 0;
    readingOverlayEl.classList.add('open');
    readingOverlayEl.setAttribute('aria-hidden', 'false');
    updateUI();
    setTimeout(() => readingPanelEl.focus({ preventScroll: true }), 40);
  }

  function closeReading() {
    if (STATE.mode !== 'READING') return;
    readingOverlayEl.classList.remove('open');
    readingOverlayEl.setAttribute('aria-hidden', 'true');
    STATE.mode = STATE.preReadingMode || 'GUIDED';
    updateUI();
    if (STATE.prevFocusEl && STATE.prevFocusEl.focus) {
      STATE.prevFocusEl.focus({ preventScroll: true });
    }
  }

  function openHelp() {
    if (STATE.mode === 'READING') closeReading();
    STATE.helpOpen = true;
    releaseMiniMouse();
    helpOverlayEl.classList.add('open');
    helpOverlayEl.setAttribute('aria-hidden', 'false');
    setTimeout(() => helpModalEl.focus({ preventScroll: true }), 30);
  }

  function closeHelp() {
    if (!STATE.helpOpen) return;
    STATE.helpOpen = false;
    updateUI();
    helpOverlayEl.classList.remove('open');
    helpOverlayEl.setAttribute('aria-hidden', 'true');
  }

  // ==================== COLLISION & SAFE POSITIONING ====================
  function resolveFloorCollision(nextPos) {
    const p = nextPos.clone();
    p.x = THREE.MathUtils.clamp(p.x, FLOOR_BOUNDS.minX, FLOOR_BOUNDS.maxX);
    p.z = THREE.MathUtils.clamp(p.z, FLOOR_BOUNDS.minZ, FLOOR_BOUNDS.maxZ);

    // Desk AABB obstacle on floor (with slight margin)
    const pad = 0.28;
    const minX = DESK_BOUNDS.minX - pad;
    const maxX = DESK_BOUNDS.maxX + pad;
    const minZ = DESK_BOUNDS.minZ - pad;
    const maxZ = DESK_BOUNDS.maxZ + pad;

    if (p.x > minX && p.x < maxX && p.z > minZ && p.z < maxZ) {
      const dxL = Math.abs(p.x - minX);
      const dxR = Math.abs(maxX - p.x);
      const dzB = Math.abs(p.z - minZ);
      const dzF = Math.abs(maxZ - p.z);
      const m = Math.min(dxL, dxR, dzB, dzF);
      if (m === dzF) p.z = maxZ;
      else if (m === dzB) p.z = minZ;
      else if (m === dxL) p.x = minX;
      else p.x = maxX;
    }

    // Architectural arch feet, timber screen and low wing. The visual model and
    // floor traversal use the same footprint, with a small body radius.
    const archObstacles = [
      [-6.5,-5.45,.20,5.08]
    ];
    archObstacles.forEach(([l,r,b,f])=>{
      if(p.x<=l||p.x>=r||p.z<=b||p.z>=f)return;
      const gaps=[p.x-l,r-p.x,p.z-b,f-p.z], k=gaps.indexOf(Math.min(...gaps));
      if(k===0)p.x=l;else if(k===1)p.x=r;else if(k===2)p.z=b;else p.z=f;
    });

    // Lectern & Plinth small obstacles
    const pillars = [
      { x: -4.65, z: -0.6, r: 0.56 },
      { x: -1.95, z: -1.67, r: 0.42 },
      { x: 5.15, z: -1.2, r: 0.72 }
    ];
    pillars.forEach(ob => {
      const dx = p.x - ob.x;
      const dz = p.z - ob.z;
      const dist = Math.hypot(dx, dz);
      if (dist < ob.r && dist > 0.001) {
        p.x = ob.x + (dx / dist) * ob.r;
        p.z = ob.z + (dz / dist) * ob.r;
      }
    });

    p.y = 0;
    return p;
  }

  function resolveDeskCollision(nextPos) {
    const p = nextPos.clone();
    // Monitor & lamp soft bounds on desk
    const monitorBox = { minX: -1.18, maxX: .88, minZ: -0.78, maxZ: -0.18 };
    if (p.x > monitorBox.minX && p.x < monitorBox.maxX && p.z > monitorBox.minZ && p.z < monitorBox.maxZ) {
      p.z = monitorBox.maxZ;
    }
    // Keep feet outside the original study model on the back-left of the desk.
    if(p.x>.93&&p.x<1.44&&p.z>-.48&&p.z<.02)p.z=.02;
    if(p.x>1.57&&p.x<2.07&&p.z>-.95&&p.z<-.44)p.z=-.44;
    p.x = THREE.MathUtils.clamp(p.x, DESK_BOUNDS.minX + 0.16, DESK_BOUNDS.maxX - 0.16);
    p.z = THREE.MathUtils.clamp(p.z, DESK_BOUNDS.minZ + 0.16, DESK_BOUNDS.maxZ - 0.16);
    p.y = DESK_BOUNDS.topY;
    return p;
  }

  // ==================== RAYCASTING & POINTER INTERACTION ====================
  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();

  function updatePointerNDC(e) {
    const rect = canvasEl.getBoundingClientRect();
    pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function handleCanvasClick(e) {
    if (STATE.mode === 'READING' || STATE.helpOpen) return;
    updatePointerNDC(e);
    raycaster.setFromCamera(pointerNDC, world.camera);

    // 1. Check interactive 3D objects first
    const objHits = raycaster.intersectObjects(world.interactables, false);
    if (objHits.length > 0) {
      const hit = objHits[0].object;
      const interactId = hit.userData.interactId;

      if (STATE.mode === 'GUIDED') {
        setEntered();
        const zoneMap = { actape: 'work', snug: 'work', lab: 'lab', notes: 'notes', about: 'about' };
        const targetChapter = zoneMap[interactId] || 'lab';
        if (CHAPTERS[STATE.chapterIdx].id === targetChapter) {
          openReading(interactId);
        } else {
          gotoChapter(targetChapter);
          cardOpenBtn.dataset.content = interactId;
        }
        return;
      }

      if (STATE.mode === 'MINI_WALKING' || STATE.mode === 'OBJECT_PREVIEW') {
        if (STATE.mode === 'OBJECT_PREVIEW') {
          if (STATE.activeExhibit && STATE.activeExhibit.id === interactId) {
            openReading(interactId);
            return;
          }
          cancelWallLift();
          return;
        }

        // Route mini character intelligently to the clicked object
        if (interactId === 'actape' || interactId === 'snug') {
          if (STATE.surface === 'desk' && interactId === 'snug') {
            STATE.walkTarget = new THREE.Vector3(0.88, DESK_BOUNDS.topY, 0.12);
            STATE.pendingActionAfterWalk = { type: 'open', targetId: 'snug' };
            return;
          }
          const ex = WALL_EXHIBITS.find(x => x.id === interactId);
          if (ex && STATE.surface === 'floor') {
            STATE.walkTarget = ex.triggerCenter.clone();
            STATE.pendingActionAfterWalk = { type: 'lift', exhibit: ex };
            placeTargetRing(ex.triggerCenter);
            return;
          }
        }

        if (interactId === 'lab') {
          if (STATE.surface === 'floor') {
            STATE.walkTarget = new THREE.Vector3(0, 0, 1.52);
            STATE.pendingActionAfterWalk = { type: 'mount' };
            placeTargetRing(STATE.walkTarget);
          } else {
            STATE.walkTarget = new THREE.Vector3(-0.15, DESK_BOUNDS.topY, 0.35);
            STATE.pendingActionAfterWalk = { type: 'open', targetId: 'lab' };
          }
          return;
        }

        if (interactId === 'notes' && STATE.surface === 'floor') {
          STATE.walkTarget = new THREE.Vector3(-3.8, 0, -0.6);
          STATE.pendingActionAfterWalk = { type: 'focus', targetId: 'notes' };
          placeTargetRing(STATE.walkTarget);
          return;
        }

        if (interactId === 'about' && STATE.surface === 'floor') {
          STATE.walkTarget = new THREE.Vector3(3.9, 0, -1.2);
          STATE.pendingActionAfterWalk = { type: 'focus', targetId: 'about' };
          placeTargetRing(STATE.walkTarget);
          return;
        }
      }
    }

    // 2. Click-to-walk on floor or desk surface in Mini Explore
    if (STATE.mode === 'MINI_WALKING') {
      const targetPlane = STATE.surface === 'desk' ? [world.deskTopMesh, world.floorMesh] : [world.floorMesh];
      const groundHits = raycaster.intersectObjects(targetPlane, false);
      if (groundHits.length > 0) {
        const hit = groundHits[0];
        if (STATE.surface === 'desk' && hit.object === world.floorMesh) {
          // Clicked floor while on desk -> gracefully dismount toward click
          const dir = new THREE.Vector3().subVectors(hit.point, STATE.charPos).normalize();
          startAutoDismount(dir);
          return;
        }
        const rawTarget = hit.point.clone();
        const clamped = STATE.surface === 'desk' ? resolveDeskCollision(rawTarget) : resolveFloorCollision(rawTarget);
        STATE.walkTarget = clamped;
        STATE.pendingActionAfterWalk = null;
        placeTargetRing(clamped);
      }
    } else if (STATE.mode === 'OBJECT_PREVIEW') {
      cancelWallLift();
    }
  }

  function placeTargetRing(pos) {
    world.targetRing.position.set(pos.x, pos.y + 0.018, pos.z);
    world.targetRing.material.opacity = 0.72;
  }

  // ==================== EVENT LISTENERS ====================
  document.getElementById('enterGuided').addEventListener('click', () => gotoChapter('corridor'));
  document.getElementById('enterMiniDirect').addEventListener('click', () => enterMiniExplore());
  document.getElementById('browseWorksDirect').addEventListener('click', (e) => {
    e.preventDefault();
    gotoChapter('work');
    openReading('actape');
  });

  document.getElementById('brandHome').addEventListener('click', (e) => {
    // G5 portfolio and 3D studio are separate, shareable routes.
    // Follow the native homepage link rather than trapping visitors in the scene.
  });

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      gotoChapter(el.dataset.goto);
    });
  });

  cardOpenBtn.addEventListener('click', () => openReading(cardOpenBtn.dataset.content || 'lab'));
  cardNextBtn.addEventListener('click', () => {
    const nextIdx = (STATE.chapterIdx + 1) % CHAPTERS.length;
    gotoChapter(nextIdx);
  });

  modeSwitchBtn.addEventListener('click', toggleExploreMode);
  exhibitOpenBtn.addEventListener('click', () => {
    if (STATE.activeExhibit) openReading(STATE.activeExhibit.id);
  });
  exhibitBackBtn.addEventListener('click', cancelWallLift);

  document.getElementById('readingClose').addEventListener('click', closeReading);
  document.getElementById('readingBackdrop').addEventListener('click', closeReading);
  document.getElementById('helpBtn').addEventListener('click', openHelp);
  document.getElementById('helpClose').addEventListener('click', closeHelp);
  document.getElementById('helpDone').addEventListener('click', closeHelp);
  document.getElementById('helpBackdrop').addEventListener('click', closeHelp);

  // Pointer Lock provides unbounded mouse look; the original drag rig is the fallback.
  document.addEventListener('pointerlockchange', () => {
    const wasCaptured = STATE.mouseCaptured;
    STATE.mouseCaptured = document.pointerLockElement === canvasEl;
    if (STATE.mouseCaptured && (STATE.mode !== 'MINI_WALKING' || STATE.helpOpen)) {
      releaseMiniMouse();
    } else if (wasCaptured && !STATE.mouseCaptured) {
      STATE.unlockedAt = performance.now();
      stopMiniInput();
    }
    updateUI();
  });
  document.addEventListener('pointerlockerror', () => {
    STATE.lockUnavailable = true;
    updateUI();
  });
  document.addEventListener('mousemove', e => {
    if (document.pointerLockElement !== canvasEl || STATE.helpOpen) return;
    if (STATE.mode === 'MINI_WALKING' || STATE.mode === 'AUTO_TRAVERSAL') {
      rotateMiniMouse(e.movementX || 0, e.movementY || 0);
    }
  });
  // The fallback distinguishes a click-to-walk intent from a drag.
  canvasEl.addEventListener('contextmenu', e => e.preventDefault());
  canvasEl.addEventListener('pointerdown', (e) => {
    if (STATE.mode === 'READING' || STATE.helpOpen || e.button > 2 || document.pointerLockElement === canvasEl) return;
    if (e.button === 0 && STATE.mode === 'MINI_WALKING' && captureMiniMouse()) return;
    STATE.isDragging = true;
    STATE.pointerId = e.pointerId;
    STATE.dragButton = e.button;
    STATE.dragMoved = false;
    STATE.dragOrigin = { x: e.clientX, y: e.clientY };
    STATE.dragStart = { x: e.clientX, y: e.clientY };
    if (STATE.mode !== 'GUIDED') {
      canvasEl.setPointerCapture?.(e.pointerId);
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (document.pointerLockElement === canvasEl) return;
    if (STATE.mode === 'GUIDED' && !STATE.helpOpen) {
      STATE.pointerParallax.x = THREE.MathUtils.clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      STATE.pointerParallax.y = THREE.MathUtils.clamp((e.clientY / window.innerHeight - 0.5) * 2, -1, 1);
    }
    if (STATE.isDragging && (STATE.pointerId === null || STATE.pointerId === e.pointerId)) {
      const dx = e.clientX - STATE.dragStart.x;
      const dy = e.clientY - STATE.dragStart.y;
      if (Math.hypot(e.clientX - STATE.dragOrigin.x, e.clientY - STATE.dragOrigin.y) > 5) STATE.dragMoved = true;
      const orbitAllowed = STATE.mode === 'MINI_WALKING' || STATE.mode === 'OBJECT_PREVIEW';
      if (STATE.dragMoved && orbitAllowed) {
        rotateMiniMouse(dx * 1.5, dy * 1.5);
        STATE.dragStart = { x: e.clientX, y: e.clientY };
        viewportEl.classList.add('is-dragging');
      }
      return;
    }
    if (STATE.mode !== 'READING' && !STATE.helpOpen) {
      updatePointerNDC(e);
      raycaster.setFromCamera(pointerNDC, world.camera);
      const hits = raycaster.intersectObjects(world.interactables, false);
      viewportEl.classList.toggle('is-hover-interactive', hits.length > 0);
    }
  });

  function endOrbitPointer(e, allowClick) {
    if (!STATE.isDragging || (STATE.pointerId !== null && STATE.pointerId !== e.pointerId)) return;
    const wasDrag = STATE.dragMoved;
    const wasButton = STATE.dragButton;
    STATE.isDragging = false;
    STATE.pointerId = null;
    STATE.dragMoved = false;
    viewportEl.classList.remove('is-dragging');
    if (canvasEl.hasPointerCapture?.(e.pointerId)) canvasEl.releasePointerCapture(e.pointerId);
    if (allowClick && !wasDrag && wasButton === 0 && e.target === canvasEl) handleCanvasClick(e);
  }
  window.addEventListener('pointerup', e => endOrbitPointer(e, true));
  window.addEventListener('pointercancel', e => endOrbitPointer(e, false));

  // Keyboard Controls
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    const key = e.key.toLowerCase();

    if (key === 'escape') {
      e.preventDefault();
      if (document.pointerLockElement === canvasEl) { releaseMiniMouse(); return; }
      if (performance.now() - STATE.unlockedAt < 250 && !STATE.helpOpen && STATE.mode !== 'READING') return;
      if (STATE.helpOpen) { closeHelp(); return; }
      if (STATE.mode === 'READING') { closeReading(); return; }
      if (STATE.mode === 'OBJECT_PREVIEW') { cancelWallLift(); return; }
      if (STATE.mode === 'AUTO_TRAVERSAL' && STATE.traversal) {
        // Safe cancel to nearest safe floor anchor
        STATE.charPos.copy(STATE.traversal.safeReturnPos);
        STATE.surface = 'floor';
        STATE.traversal = null;
        STATE.activeExhibit = null;
        if (STATE.focusReturn) {
          STATE.orbitYaw = STATE.focusReturn.yaw;
          STATE.orbitPitch = STATE.focusReturn.pitch;
          STATE.orbitDist = STATE.focusReturn.distance;
          STATE.focusReturn = null;
        }
        STATE.mode = 'MINI_WALKING';
        world.miniCharacter.setAnim('idle');
        updateUI();
        return;
      }
      if (STATE.mode !== 'GUIDED') { exitMiniExplore({ jumpToNearest: true }); return; }
      return;
    }

    if (STATE.helpOpen || STATE.mode === 'READING') return;

    if (key === 'f' && !e.repeat) {
      e.preventDefault();
      toggleExploreMode();
      return;
    }

    if (key === 'r' && !e.repeat && (STATE.mode === 'MINI_WALKING' || STATE.mode === 'OBJECT_PREVIEW')) {
      e.preventDefault();
      STATE.orbitYaw = STATE.charYaw - Math.PI;
      STATE.orbitPitch = 0.40;
      STATE.orbitDist = 2.85;
      return;
    }

    if (key === 'e' && !e.repeat) {
      if (STATE.mode === 'OBJECT_PREVIEW' && STATE.activeExhibit) {
        e.preventDefault();
        openReading(STATE.activeExhibit.id);
        return;
      }
      if(STATE.mode==='MINI_WALKING' && STATE.nearbyExhibit){
        e.preventDefault();startWallLift(STATE.nearbyExhibit);return;
      }
      if (STATE.mode === 'MINI_WALKING' && STATE.focusedObject) {
        e.preventDefault();
        openReading(STATE.focusedObject.id);
        return;
      }
    }

    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      if (STATE.mode === 'OBJECT_PREVIEW' && (key === 's' || key === 'arrowdown')) {
        e.preventDefault();
        cancelWallLift();
        return;
      }
      if (STATE.mode === 'MINI_WALKING') {
        STATE.keys.add(key);
        STATE.walkTarget = null;
        STATE.pendingActionAfterWalk = null;
        e.preventDefault();
      }
    }
  });

  window.addEventListener('keyup', (e) => STATE.keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', releaseMiniMouse);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseMiniMouse(); });

  // In Mini Explore the wheel is a smooth zoom; in Guided it navigates chapters.
  window.addEventListener('wheel', (e) => {
    if (STATE.helpOpen || STATE.mode === 'READING') return;
    if (STATE.mode === 'MINI_WALKING' || STATE.mode === 'OBJECT_PREVIEW' || STATE.mode === 'AUTO_TRAVERSAL') {
      if (e.target.closest?.('.reading-overlay, .help-overlay')) return;
      e.preventDefault();
      STATE.orbitDist = THREE.MathUtils.clamp(STATE.orbitDist * Math.exp(e.deltaY * 0.0012), 1.9, 5.8);
      return;
    }
    if (STATE.mode !== 'GUIDED') return;
    e.preventDefault();
    const now = performance.now();
    if (now - STATE.lastWheelTime > 650) STATE.wheelAccum = 0;
    STATE.wheelAccum += e.deltaY;
    if (Math.abs(STATE.wheelAccum) > 75 && now - STATE.lastWheelTime > 620) {
      const dir = Math.sign(STATE.wheelAccum);
      STATE.wheelAccum = 0;
      STATE.lastWheelTime = now;
      stepChapter(dir);
    }
  }, { passive: false });

  // Mobile Touch Swipe for Guided Explore
  canvasEl.addEventListener('touchstart', (e) => {
    if (isTouchDevice && STATE.mode === 'GUIDED' && e.touches.length === 1) {
      STATE.touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  canvasEl.addEventListener('touchend', (e) => {
    if (!isTouchDevice || STATE.mode !== 'GUIDED' || STATE.touchStartY === null) return;
    const dy = STATE.touchStartY - e.changedTouches[0].clientY;
    STATE.touchStartY = null;
    if (Math.abs(dy) > 55) stepChapter(Math.sign(dy));
  }, { passive: true });

  // Resize handler
  window.addEventListener('resize', () => {
    world.camera.aspect = window.innerWidth / window.innerHeight;
    world.camera.updateProjectionMatrix();
    world.renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Hash routing support (direct shareable links)
  function applyHashRoute() {
    const hash = location.hash.replace('#', '').toLowerCase();
    if (!hash || hash === 'entrance') return;
    if (CONTENT_DATA[hash]) {
      const chapterMap = { actape: 'work', snug: 'work', lab: 'lab', notes: 'notes', about: 'about' };
      gotoChapter(chapterMap[hash] || 'work', { quiet: true });
      openReading(hash);
    } else if (CHAPTERS.some(c => c.id === hash)) {
      gotoChapter(hash, { quiet: true });
    }
  }
  applyHashRoute();
  if(!location.hash)gotoChapter('lab',{quiet:true,openHero:true});

  // ==================== MAIN ANIMATION & ORCHESTRATION LOOP ====================
  function angleDelta(from, to) {
    let diff = (to - from + Math.PI) % (Math.PI * 2) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
  }

  let lastTime = performance.now();

  function updateMiniMovement(dt) {
    if (STATE.actionCooldown > 0) STATE.actionCooldown = Math.max(0, STATE.actionCooldown - dt);

    // 1. Compute desired movement direction (keyboard OR click-to-walk)
    const moveDir = new THREE.Vector3();
    const fwdKey = (STATE.keys.has('w') || STATE.keys.has('arrowup') ? 1 : 0) -
                   (STATE.keys.has('s') || STATE.keys.has('arrowdown') ? 1 : 0);
    const sideKey = (STATE.keys.has('d') || STATE.keys.has('arrowright') ? 1 : 0) -
                    (STATE.keys.has('a') || STATE.keys.has('arrowleft') ? 1 : 0);

    if (fwdKey !== 0 || sideKey !== 0) {
      // Relative to third-person camera horizontal forward
      const camFwd = new THREE.Vector3(-Math.sin(STATE.orbitYaw), 0, -Math.cos(STATE.orbitYaw));
      const camRight = new THREE.Vector3(Math.cos(STATE.orbitYaw), 0, -Math.sin(STATE.orbitYaw));
      moveDir.addScaledVector(camFwd, fwdKey).addScaledVector(camRight, sideKey);
      if (moveDir.lengthSq() > 0.001) moveDir.normalize();
    } else if (STATE.walkTarget) {
      const toTarget = new THREE.Vector3().subVectors(STATE.walkTarget, STATE.charPos);
      toTarget.y = 0;
      const dist = toTarget.length();
      if (dist > 0.14) {
        moveDir.copy(toTarget).normalize();
      } else {
        STATE.walkTarget = null;
        if (STATE.pendingActionAfterWalk) {
          const pending = STATE.pendingActionAfterWalk;
          STATE.pendingActionAfterWalk = null;
          if (pending.type === 'mount' && STATE.surface === 'floor') { startAutoMount(); return; }
          if (pending.type === 'lift' && pending.exhibit) { startWallLift(pending.exhibit); return; }
          if (pending.type === 'open' && pending.targetId) { openReading(pending.targetId); return; }
        }
      }
    }

    // 2. Smooth velocity damping (never abrupt stop or instant snap)
    const maxSpeed = STATE.surface === 'desk' ? 1.55 : 2.45;
    const targetVel = moveDir.clone().multiplyScalar(maxSpeed);
    const accel = moveDir.lengthSq() > 0.01 ? 9.5 : 11.0;
    STATE.charVel.lerp(targetVel, 1 - Math.exp(-dt * accel));

    const speed = STATE.charVel.length();
    let turnRate = 0;

    if (speed > 0.04) {
      const rawNext = STATE.charPos.clone().addScaledVector(STATE.charVel, dt);

      // Check Auto Dismount when walking off Prototype Bench edge with sustained outward intent
      if (STATE.surface === 'desk') {
        const nearOutX = rawNext.x < DESK_BOUNDS.minX + 0.19 || rawNext.x > DESK_BOUNDS.maxX - 0.19;
        const nearOutZ = rawNext.z < DESK_BOUNDS.minZ + 0.19 || rawNext.z > DESK_BOUNDS.maxZ - 0.19;
        if ((nearOutX || nearOutZ) && STATE.actionCooldown <= 0 && moveDir.lengthSq() > 0.1) {
          STATE.dismountIntentTimer += dt;
          if (STATE.dismountIntentTimer >= 0.22) {
            startAutoDismount(moveDir);
            return;
          }
        } else {
          STATE.dismountIntentTimer = Math.max(0, STATE.dismountIntentTimer - dt * 2);
        }
        STATE.charPos.copy(resolveDeskCollision(rawNext));
      } else {
        STATE.charPos.copy(resolveFloorCollision(rawNext));
      }

      STATE.targetYaw = Math.atan2(STATE.charVel.x, STATE.charVel.z);
      const diff = angleDelta(STATE.charYaw, STATE.targetYaw);
      turnRate = diff;
      STATE.charYaw += diff * Math.min(1, dt * 10);
      world.miniCharacter.setAnim('walk');
    } else {
      world.miniCharacter.setAnim('idle');
    }

    // 3. Evaluate Auto Mount intent (front of Prototype Bench + sustained forward intent toward -Z)
    if (STATE.surface === 'floor' && STATE.actionCooldown <= 0) {
      const towardDesk = moveDir.z < -0.55 && isNearDeskMount(STATE.charPos);
      if (towardDesk) {
        STATE.mountIntentTimer += dt;
        STATE.charVel.multiplyScalar(0.86); // Graceful deceleration before leap
        if (STATE.mountIntentTimer >= 0.28) {
          startAutoMount();
          return;
        }
      } else {
        STATE.mountIntentTimer = Math.max(0, STATE.mountIntentTimer - dt * 2.5);
      }

    }
    // Explicit E interaction: walking past a product never takes over the camera.
    const near=STATE.surface==='floor'?WALL_EXHIBITS.find(ex=>
      Math.hypot(STATE.charPos.x-ex.triggerCenter.x,STATE.charPos.z-ex.triggerCenter.z)<=ex.triggerRadius):null;
    if(STATE.nearbyExhibit!==near){STATE.nearbyExhibit=near;updateUI();}

    // 5. Evaluate Object Focus (closest relevant object on current surface)
    let bestObj = null;
    let bestDist = Infinity;
    for (const obj of FOCUS_OBJECTS) {
      if (obj.surface !== STATE.surface) continue;
      const d = Math.hypot(STATE.charPos.x - obj.pos.x, STATE.charPos.z - obj.pos.z);
      if (d <= obj.radius && d < bestDist) {
        bestDist = d;
        bestObj = obj;
      }
    }
    if (bestObj !== STATE.focusedObject) {
      STATE.focusedObject = bestObj;
      updateUI();
    } else if (STATE.surface === 'floor' && isNearDeskMount(STATE.charPos)) {
      updateUI();
    }

    // Gentle body angle toward focused object when idle
    if (STATE.focusedObject && speed <= 0.05) {
      const lookAngle = Math.atan2(
        STATE.focusedObject.pos.x - STATE.charPos.x,
        STATE.focusedObject.pos.z - STATE.charPos.z
      );
      STATE.charYaw += angleDelta(STATE.charYaw, lookAngle) * Math.min(1, dt * 4.5);
    }

    // Fade floor target ring
    if (world.targetRing.material.opacity > 0.01) {
      world.targetRing.material.opacity *= Math.pow(0.25, dt);
    }

    // Update 3D character mesh
    world.miniCharacter.group.position.copy(STATE.charPos);
    world.miniCharacter.group.rotation.y = STATE.charYaw;
    const groundY = STATE.surface === 'desk' ? DESK_BOUNDS.topY : 0;
    world.miniCharacter.update(dt, speed / maxSpeed, turnRate, groundY, prefersReducedMotion);
  }

  function updateTraversal(dt) {
    const tr = STATE.traversal;
    if (!tr) return;
    tr.t = Math.min(1, tr.t + dt / tr.duration);
    // Smooth easeInOutCubic
    const ease = tr.t < 0.5 ? 4 * tr.t * tr.t * tr.t : 1 - Math.pow(-2 * tr.t + 2, 3) / 2;

    STATE.charPos.lerpVectors(tr.startPos, tr.endPos, ease);
    STATE.charPos.y += Math.sin(tr.t * Math.PI) * tr.arcHeight;

    STATE.charYaw += angleDelta(STATE.charYaw, tr.targetYaw) * Math.min(1, dt * 8);
    world.miniCharacter.group.position.copy(STATE.charPos);
    world.miniCharacter.group.rotation.y = STATE.charYaw;
    const refGroundY = tr.type === 'mount' && tr.t > 0.65 ? DESK_BOUNDS.topY : 0;
    world.miniCharacter.update(dt, 0, 0, refGroundY, prefersReducedMotion);

    if (tr.t >= 1) {
      const cb = tr.onComplete;
      STATE.traversal = null;
      if (cb) cb();
    }
  }

  // One camera, three authored owners: guided anchor, free orbit, exhibit close-up.
  // Keeping the orbit target, preferred arm length and collision arm length separate
  // is what allows genuine level views and soft wall-safe recovery.
  const cameraBoomRay = new THREE.Raycaster();
  const boomDirection = new THREE.Vector3();
  const boomPivot = new THREE.Vector3();
  const boomSolved = new THREE.Vector3();
  const CAM_MIN_CLEARANCE = 0.32;

  function updateCameraDirector(dt) {
    const mode = STATE.mode;
    if (mode === 'READING' || STATE.helpOpen) return; // Preserve the precise last frame.
    const damp = prefersReducedMotion ? 1 : 1 - Math.exp(-dt * (mode === 'MINI_WALKING' ? 14 : 5.2));

    if (mode === 'GUIDED' || (mode === 'READING' && STATE.preReadingMode === 'GUIDED')) {
      const ch = CHAPTERS[STATE.chapterIdx];
      const px = prefersReducedMotion || mode === 'READING' ? 0 : STATE.pointerParallax.x * 0.20;
      const py = prefersReducedMotion || mode === 'READING' ? 0 : -STATE.pointerParallax.y * 0.12;
      const portrait = world.camera.aspect < .85;
      if (ch.id === 'entrance' && portrait) {
        STATE.desiredCamPos.set(3.6, 3.0, 8.8);
        STATE.desiredCamLook.set(0, 1.4, -.15);
      } else {
        STATE.desiredCamPos.set(ch.camPos.x + px, ch.camPos.y + py, ch.camPos.z);
        STATE.desiredCamLook.copy(ch.camLook);
      }
      const desiredFov=portrait && ch.id==='entrance'?54:42;
      if(world.camera.fov!==desiredFov){world.camera.fov=desiredFov;world.camera.updateProjectionMatrix();}
    } else if ((mode === 'OBJECT_PREVIEW' || mode === 'AUTO_TRAVERSAL' && STATE.traversal?.type === 'lift_up') && STATE.activeExhibit) {
      STATE.desiredCamPos.copy(STATE.activeExhibit.camPos);
      STATE.desiredCamLook.copy(STATE.activeExhibit.camLook);
    } else {
      if(world.camera.fov!==42){world.camera.fov=42;world.camera.updateProjectionMatrix();}
      // User controls the orbit even after climbing. No fixed 35–50 degree overhead view.
      // Auto Focus never overrides yaw/pitch; it influences the look-at target only.
      const desk = STATE.surface === 'desk' || STATE.traversal?.type === 'mount';
      const targetHeight = desk ? 0.34 : 0.31;
      boomPivot.set(STATE.charPos.x, STATE.charPos.y + targetHeight, STATE.charPos.z);
      const pitch = STATE.orbitPitch;
      const h = Math.cos(pitch);
      boomDirection.set(Math.sin(STATE.orbitYaw) * h, Math.sin(pitch), Math.cos(STATE.orbitYaw) * h);

      // Cast from character toward desired camera point, avoiding actual architecture
      // instead of clamping camera world X/Y/Z into a narrow rectangular box.
      const blockers = world.cameraColliders || [];
      let allowedDist = STATE.orbitDist;
      if (blockers.length) {
        cameraBoomRay.set(boomPivot, boomDirection);
        cameraBoomRay.near = 0.12;
        cameraBoomRay.far = STATE.orbitDist;
        const hits = cameraBoomRay.intersectObjects(blockers, false);
        if (hits.length) allowedDist = Math.max(0.42, hits[0].distance - CAM_MIN_CLEARANCE);
      }
      // Occlusion shrinks rapidly, extends slowly, preventing jarring wall contact.
      const boomRate = allowedDist < STATE.collisionDist ? 17 : 3.5;
      STATE.collisionDist += (allowedDist - STATE.collisionDist) * (prefersReducedMotion ? 1 : 1 - Math.exp(-dt * boomRate));
      boomSolved.copy(boomPivot).addScaledVector(boomDirection, Math.min(STATE.collisionDist, allowedDist + 0.1));
      // Never let a tiny character or its contact shadow clip the floor.
      boomSolved.y = Math.max(STATE.charPos.y + 0.19, boomSolved.y);

      STATE.desiredCamPos.copy(boomSolved);
      STATE.desiredCamLook.copy(boomPivot);
      // Subtle target shift, not forced camera placement or reset to hardcoded angle.
      if (STATE.focusedObject && mode === 'MINI_WALKING' && !STATE.mouseCaptured) {
        STATE.desiredCamLook.lerp(STATE.focusedObject.pos, 0.12);
      }
    }

    const reducingBoom = (mode === 'MINI_WALKING' || mode === 'AUTO_TRAVERSAL') &&
      STATE.desiredCamPos.distanceTo(STATE.camPos) > 0.05 && STATE.collisionDist < STATE.orbitDist - 0.2;
    const positionDamp = reducingBoom ? Math.max(damp, 1 - Math.exp(-dt * 13)) : damp;
    STATE.camPos.lerp(STATE.desiredCamPos, positionDamp);
    STATE.camLook.lerp(STATE.desiredCamLook, damp);
    // Recheck the interpolated camera segment: a damped orbit must not cut through
    // a wall even when both its start and destination were valid.
    if (mode === 'MINI_WALKING') {
      const offset = new THREE.Vector3().subVectors(STATE.camPos, boomPivot);
      const length = offset.length();
      if (length > 0.12) {
        cameraBoomRay.set(boomPivot, offset.normalize());
        cameraBoomRay.near = 0.08;
        cameraBoomRay.far = length;
        const hits = cameraBoomRay.intersectObjects(world.cameraColliders || [], false);
        if (hits.length) STATE.camPos.copy(boomPivot).addScaledVector(offset, Math.max(0.12, hits[0].distance - CAM_MIN_CLEARANCE));
      }
    }
    world.camera.position.copy(STATE.camPos);
    world.camera.lookAt(STATE.camLook);
  }

  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (!STATE.helpOpen && STATE.mode === 'MINI_WALKING') {
      updateMiniMovement(dt);
    } else if (!STATE.helpOpen && STATE.mode === 'AUTO_TRAVERSAL') {
      updateTraversal(dt);
    } else if (STATE.mode === 'OBJECT_PREVIEW') {
      world.miniCharacter.update(dt, 0, 0, 0, prefersReducedMotion);
    }

    // Subtle breathing pulse on mount marker & sculptural terracotta sphere
    if (!prefersReducedMotion) {
      const pulse = 0.42 + Math.sin(now * 0.003) * 0.14;
      world.mountMarker.material.opacity = STATE.mode === 'GUIDED' ? 0.24 : pulse;
      world.terraSphere.position.y = 1.15 + Math.sin(now * 0.0018) * 0.025;
    }

    updateCameraDirector(dt);

    // Update Precision Sketch -> Material Reality reveal based on visitor / mini character focus
    const revealFocal = STATE.mode === 'GUIDED' ? STATE.camLook : STATE.charPos;
    const activeRevealKey = STATE.activeExhibit
      ? STATE.activeExhibit.id
      : (STATE.mode === 'GUIDED' ? CHAPTERS[STATE.chapterIdx].revealZone : null);
    world.updateSketchReveal(revealFocal, activeRevealKey, dt);

    world.renderer.render(world.scene, world.camera);
  }

  // Expose lightweight QA inspection handle
  window.__atelierQA = {
    getState: () => ({
      mode: STATE.mode,
      surface: STATE.surface,
      chapter: CHAPTERS[STATE.chapterIdx].id,
      charPos: STATE.charPos.toArray(),
      cameraPos: STATE.camPos.toArray(),
      orbitYaw: STATE.orbitYaw, orbitPitch: STATE.orbitPitch, orbitDist: STATE.orbitDist,
      mouseCaptured: STATE.mouseCaptured, lockUnavailable: STATE.lockUnavailable,
      assetStatus: world.getAssetStatus(),
      nearbyExhibit: STATE.nearbyExhibit ? STATE.nearbyExhibit.id : null,
      activeExhibit: STATE.activeExhibit ? STATE.activeExhibit.id : null,
      focusedObject: STATE.focusedObject ? STATE.focusedObject.id : null
    }),
    gotoChapter,
    enterMiniExplore,
    exitMiniExplore,
    startAutoMount,
    startWallLift: (id) => {
      const ex = WALL_EXHIBITS.find(x => x.id === id);
      if (ex) startWallLift(ex);
    },
    openReading,
    closeReading
  };

  updateUI();
  requestAnimationFrame(animate);
})();
