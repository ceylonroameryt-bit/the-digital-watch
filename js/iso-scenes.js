/**
 * js/iso-scenes.js — Cyber Insight Isometric 3D Diorama System
 * Complete 10 Episodes + Hero 3D Dioramas in Three.js (r128)
 * Spec:
 * - White platform slab with slate-blue rim (#2D4F7C)
 * - Charcoal and navy props (#1E293B)
 * - Cyan data dots (#38BDF8)
 * - One orange alert accent (#EA580C)
 * - Soft shadows, perspective camera fov ~28, slow orbit
 * - IntersectionObserver lazy activation (max 4 running concurrently)
 * - Graceful disposal on scroll-out
 * - Strict prefers-reduced-motion and Save-Data respect
 */

(function () {
  'use strict';

  // Environment checks
  if (typeof window === 'undefined' || !window.document || typeof THREE === 'undefined') {
    return;
  }

  // Safety check for WebGL support
  function hasWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (_) {
      return false;
    }
  }

  if (!hasWebGL()) return;

  // Respect prefers-reduced-motion & Save-Data
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (prefersReduced || saveData) return;

  // Exact Design Tokens from Spec
  const C_WHITE = 0xF8FAFC;
  const C_SLATE_RIM = 0x2D4F7C;      // Slate-blue rim (#2D4F7C)
  const C_NAVY = 0x1E293B;           // Charcoal & navy props (#1E293B)
  const C_NAVY_LIGHT = 0x334155;
  const C_ORANGE = 0xEA580C;         // Alert orange accent (#EA580C)
  const C_CYAN = 0x38BDF8;           // Cyan data dots (#38BDF8)
  const C_MINT = 0x1FC48D;
  const C_SCREEN = 0x2A52EE;

  // Shared platform creator: white platform slab with slate-blue rim
  function createPlatform() {
    const group = new THREE.Group();

    // Top white platform slab
    const topGeo = new THREE.CylinderGeometry(7.0, 7.0, 0.6, 32);
    const topMat = new THREE.MeshLambertMaterial({ color: C_WHITE });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 0;
    topMesh.receiveShadow = true;
    group.add(topMesh);

    // Slate-blue rim (#2D4F7C)
    const rimGeo = new THREE.CylinderGeometry(7.18, 7.18, 0.38, 32);
    const rimMat = new THREE.MeshLambertMaterial({ color: C_SLATE_RIM });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = -0.28;
    group.add(rimMesh);

    // Soft drop shadow base
    const baseGeo = new THREE.CylinderGeometry(7.35, 7.35, 0.1, 32);
    const baseMat = new THREE.MeshBasicMaterial({ color: 0xCBD5E1, transparent: true, opacity: 0.35 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.52;
    group.add(baseMesh);

    return group;
  }

  // Setup basic isometric diorama with perspective camera fov ~28 & slow orbit
  function setupDiorama(container) {
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 180;
    const aspect = width / height;

    const scene = new THREE.Scene();

    // Perspective camera about fov 28 for authentic isometric depth
    const camera = new THREE.PerspectiveCamera(28, aspect, 1, 150);
    camera.position.set(22, 19, 22);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Orbit group for subtle slow rotation
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    // Lighting
    const ambLight = new THREE.AmbientLight(0xFFFFFF, 0.78);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.9);
    dirLight.position.set(16, 26, 14);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512;
    scene.add(dirLight);

    const cyanPoint = new THREE.PointLight(C_CYAN, 0.5, 20);
    cyanPoint.position.set(0, 5, 0);
    scene.add(cyanPoint);

    // Base Platform
    orbitGroup.add(createPlatform());

    return { scene, camera, renderer, orbitGroup };
  }

  // ── BUILD SCENES ──────────────────────────────────────────

  // HERO SCENE: Security Operations Console & Radar Beacon
  function buildHeroScene(orbitGroup) {
    const navyMat = new THREE.MeshLambertMaterial({ color: C_NAVY });
    const slateMat = new THREE.MeshLambertMaterial({ color: C_SLATE_RIM });
    const orangeMat = new THREE.MeshLambertMaterial({ color: C_ORANGE });
    const cyanMat = new THREE.MeshBasicMaterial({ color: C_CYAN });
    const mintMat = new THREE.MeshBasicMaterial({ color: C_MINT });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xBAE6FD, transparent: true, opacity: 0.45 });

    // Central Radar Console
    const consoleGroup = new THREE.Group();
    const cBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.8, 24), navyMat);
    cBase.position.y = 0.4;
    cBase.castShadow = true;
    consoleGroup.add(cBase);

    // Holographic radar dish
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.08, 32), glassMat);
    dish.position.y = 0.85;
    consoleGroup.add(dish);

    // Rotating Radar Beam Line
    const radarBeam = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.1), cyanMat);
    radarBeam.position.set(0.9, 0.88, 0);
    const radarPivot = new THREE.Group();
    radarPivot.add(radarBeam);
    radarPivot.position.y = 0;
    consoleGroup.add(radarPivot);

    // Central Security Core (Shield Projector)
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), orangeMat);
    core.position.y = 2.0;
    core.castShadow = true;
    consoleGroup.add(core);

    // Protective floating ring around core
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.08, 8, 32), cyanMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.0;
    consoleGroup.add(ring);

    orbitGroup.add(consoleGroup);

    // Surrounding Satellite Monoliths
    const monoliths = [];
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3;
      const mono = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8 + i * 0.4, 0.6), slateMat);
      mono.position.set(Math.cos(ang) * 4.2, 1.0, Math.sin(ang) * 4.2);
      mono.castShadow = true;
      orbitGroup.add(mono);
      monoliths.push(mono);
    }

    // Orbiting Cyan Cyber Data Dots
    const dots = [];
    for (let i = 0; i < 8; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), (i === 0) ? orangeMat : cyanMat);
      orbitGroup.add(dot);
      dots.push(dot);
    }

    return function update(t) {
      orbitGroup.rotation.y = Math.sin(t * 0.3) * 0.18;
      radarPivot.rotation.y = t * 2.2;
      core.rotation.y += 0.02;
      core.rotation.x = Math.sin(t * 1.5) * 0.2;
      core.position.y = 2.0 + Math.sin(t * 2.5) * 0.15;
      ring.rotation.z += 0.015;

      dots.forEach((dot, i) => {
        const ang = t * 0.8 + (i * Math.PI * 2) / 8;
        const radius = 3.6 + Math.sin(t * 1.2 + i) * 0.4;
        dot.position.set(Math.cos(ang) * radius, 1.8 + Math.sin(t * 2 + i) * 0.6, Math.sin(ang) * radius);
      });
    };
  }

  // Episode 1: Biometric booth and voice waveform
  function buildScene1(orbitGroup) {
    const navyMat = new THREE.MeshLambertMaterial({ color: C_NAVY });
    const slateMat = new THREE.MeshLambertMaterial({ color: C_SLATE_RIM });
    const orangeMat = new THREE.MeshLambertMaterial({ color: C_ORANGE });
    const cyanMat = new THREE.MeshBasicMaterial({ color: C_CYAN });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x93C5FD, transparent: true, opacity: 0.35 });

    // Biometric scanner booth frame
    const booth = new THREE.Group();
    const columnGeo = new THREE.CylinderGeometry(0.15, 0.15, 4.4, 12);
    [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].forEach(([cx, cz]) => {
      const col = new THREE.Mesh(columnGeo, navyMat);
      col.position.set(cx, 2.2, cz);
      col.castShadow = true;
      booth.add(col);
    });

    // Roof & floor cap
    const capGeo = new THREE.BoxGeometry(4.0, 0.3, 4.0);
    const topCap = new THREE.Mesh(capGeo, slateMat);
    topCap.position.y = 4.3;
    const botCap = new THREE.Mesh(capGeo, slateMat);
    botCap.position.y = 0.2;
    booth.add(topCap, botCap);

    // Glass panel
    const glassPanel = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.8), glassMat);
    glassPanel.position.set(0, 2.2, -1.75);
    booth.add(glassPanel);
    orbitGroup.add(booth);

    // Central microphone / pedestal
    const micStand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 1.8, 12), slateMat);
    micStand.position.set(0, 1.1, 0);
    const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), navyMat);
    micHead.position.set(0, 2.1, 0);
    orbitGroup.add(micStand, micHead);

    // Voice Waveform Bars in arc
    const waveBars = [];
    const barCount = 11;
    for (let i = 0; i < barCount; i++) {
      const isOrange = (i === 7); // Highlight synthetic voice anomaly spike
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.0, 0.18), isOrange ? orangeMat : cyanMat);
      const ang = ((i - (barCount - 1) / 2) / barCount) * (Math.PI * 0.7);
      bar.position.set(Math.sin(ang) * 2.2, 2.2, Math.cos(ang) * 2.2);
      orbitGroup.add(bar);
      waveBars.push({ mesh: bar, phase: i * 0.55 });
    }

    // Laser scan ring
    const laserRing = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.55, 32), cyanMat);
    laserRing.rotation.x = -Math.PI / 2;
    laserRing.position.y = 2.0;
    orbitGroup.add(laserRing);

    return function update(t) {
      orbitGroup.rotation.y = Math.sin(t * 0.25) * 0.12;

      // Oscillate waveform bars
      waveBars.forEach((wb, i) => {
        const scaleY = 0.3 + Math.abs(Math.sin(t * 5 + wb.phase)) * 2.0;
        wb.mesh.scale.y = scaleY;
        wb.mesh.position.y = 1.4 + scaleY * 0.5;
      });

      // Scan beam vertical sweep
      laserRing.position.y = 1.0 + (Math.sin(t * 3) + 1) * 1.5;
    };
  }

  // Episode 2: Email inbox with crawler bugs and radar
  function buildScene2(orbitGroup) {
    const navyMat = new THREE.MeshLambertMaterial({ color: C_NAVY });
    const slateMat = new THREE.MeshLambertMaterial({ color: C_SLATE_RIM });
    const orangeMat = new THREE.MeshLambertMaterial({ color: C_ORANGE });
    const cyanMat = new THREE.MeshBasicMaterial({ color: C_CYAN });
    const whiteMat = new THREE.MeshLambertMaterial({ color: C_WHITE });

    // 3D Email Envelope / Mailbox Tray
    const mailGroup = new THREE.Group();
    const envBody = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.8, 0.4), whiteMat);
    envBody.position.y = 1.8;
    envBody.castShadow = true;
    const flap = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.2, 4), slateMat);
    flap.rotation.z = Math.PI;
    flap.position.set(0, 2.6, 0.22);
    mailGroup.add(envBody, flap);
    mailGroup.rotation.x = -Math.PI / 8;
    orbitGroup.add(mailGroup);

    // Radar scanner dish on side pedestal
    const radarBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 1.2), navyMat);
    radarBase.position.set(3.4, 0.6, 0);
    const radarDish = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.1, 8, 24), cyanMat);
    radarDish.position.set(3.4, 1.8, 0);
    radarDish.rotation.y = -Math.PI / 4;
    orbitGroup.add(radarBase, radarDish);

    // Crawler Bugs
    const bugs = [];
    for (let i = 0; i < 3; i++) {
      const isThreat = (i === 0);
      const bug = new THREE.Group();
      const bBody = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), isThreat ? orangeMat : navyMat);
      bBody.scale.set(1.2, 0.7, 1);
      const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), isThreat ? orangeMat : slateMat);
      bHead.position.x = 0.35;
      bug.add(bBody, bHead);
      orbitGroup.add(bug);
      bugs.push({ group: bug, offset: i * (Math.PI * 2 / 3) });
    }

    return function update(t) {
      orbitGroup.rotation.y = Math.sin(t * 0.3) * 0.15;
      radarDish.rotation.z += 0.04;

      // Crawler bugs scurry in ellipse around envelope
      bugs.forEach((b, i) => {
        const ang = t * 1.5 + b.offset;
        const bx = Math.cos(ang) * 3.0;
        const bz = Math.sin(ang) * 1.8;
        b.group.position.set(bx, 0.25 + Math.sin(t * 8 + i) * 0.05, bz);
        b.group.rotation.y = -ang + Math.PI / 2;
      });
    };
  }

  // Episode 3: Vault door and checklist
  function buildScene3(orbitGroup) {
    const navyMat = new THREE.MeshLambertMaterial({ color: C_NAVY });
    const slateMat = new THREE.MeshLambertMaterial({ color: C_SLATE_RIM });
    const orangeMat = new THREE.MeshLambertMaterial({ color: C_ORANGE });
    const mintMat = new THREE.MeshBasicMaterial({ color: C_MINT });
    const whiteMat = new THREE.MeshLambertMaterial({ color: C_WHITE });

    // Bank Vault Door
    const vault = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.4, 0.6), navyMat);
    frame.position.y = 2.3;
    frame.castShadow = true;
    const door = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.5, 32), slateMat);
    door.rotation.x = Math.PI / 2;
    door.position.set(0, 2.3, 0.15);
    // Vault spoke wheel
    const wheelHub = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), orangeMat);
    wheelHub.rotation.x = Math.PI / 2;
    wheelHub.position.set(0, 2.3, 0.45);
    vault.add(frame, door, wheelHub);
    vault.position.set(-1.6, 0, -0.6);
    vault.rotation.y = Math.PI / 6;
    orbitGroup.add(vault);

    // 3D Checklist Clipboard
    const clip = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 0.2), whiteMat);
    board.position.y = 1.7;
    board.castShadow = true;
    // Checkmarks
    for (let r = 0; r < 3; r++) {
      const isAlert = (r === 1);
      const chk = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.05), isAlert ? orangeMat : mintMat);
      chk.position.set(-0.6, 2.4 - r * 0.7, 0.12);
      const line = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.05), isAlert ? orangeMat : slateMat);
      line.position.set(0.2, 2.4 - r * 0.7, 0.12);
      clip.add(chk, line);
    }
    clip.position.set(2.4, 0, 0.8);
    clip.rotation.y = -Math.PI / 5;
    orbitGroup.add(clip);

    return function update(t) {
      orbitGroup.rotation.y = Math.sin(t * 0.25) * 0.12;
      wheelHub.rotation.y = Math.sin(t * 1.8) * 0.8;
      clip.position.y = Math.sin(t * 2) * 0.1;
    };
  }

  // Episode 4: Cookie copied between two monitors
  function buildScene4(orbitGroup) {
    const navyMat = new THREE.MeshLambertMaterial({ color: C_NAVY });
    const screenMat = new THREE.MeshBasicMaterial({ color: C_SCREEN });
    const orangeMat = new THREE.MeshLambertMaterial({ color: C_ORANGE });
    const cyanMat = new THREE.MeshBasicMaterial({ color: C_CYAN });
    const tanMat = new THREE.MeshLambertMaterial({ color: 0xD4A373 });

    // Monitor 1 (Left)
    const m1 = new THREE.Group();
    const scr1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.3), navyMat);
    scr1.position.y = 2.4;
    scr1.castShadow = true;
    const face1 = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.8), screenMat);
    face1.position.set(0, 2.4, 0.16);
    const stand1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 1.3), navyMat);
    stand1.position.y = 0.9;
    m1.add(scr1, face1, stand1);
    m1.position.set(-3.2, 0, -0.8);
    m1.rotation.y = Math.PI / 6;
    orbitGroup.add(m1);

    // Monitor 2 (Right)
    const m2 = new THREE.Group();
    const scr2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.3), navyMat);
    scr2.position.y = 2.4;
    scr2.castShadow = true;
    const face2 = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.8), new THREE.MeshBasicMaterial({ color: C_NAVY_LIGHT }));
    face2.position.set(0, 2.4, 0.16);
    const stand2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 1.3), navyMat);
    stand2.position.y = 0.9;
    m2.add(scr2, face2, stand2);
    m2.position.set(3.2, 0, 0.8);
    m2.rotation.y = -Math.PI / 5;
    orbitGroup.add(m2);

    // The Cookie
    const cookie = new THREE.Group();
    const cDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.25, 20), tanMat);
    cDisc.castShadow = true;
    cookie.add(cDisc);

    // Chocolate chips + 1 orange chip accent
    for (let i = 0; i < 5; i++) {
      const isAcc = (i === 0);
      const chip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), isAcc ? orangeMat : navyMat);
      const ang = (i * Math.PI * 2) / 5 + 0.3;
      chip.position.set(Math.cos(ang) * 0.45, 0.14, Math.sin(ang) * 0.45);
      cookie.add(chip);
    }
    cookie.rotation.x = Math.PI / 4;
    orbitGroup.add(cookie);

    // Cyan data dots trailing
    const trailDots = [];
    for (let i = 0; i < 5; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), cyanMat);
      orbitGroup.add(dot);
      trailDots.push(dot);
    }

    return function update(t) {
      orbitGroup.rotation.y = Math.sin(t * 0.25) * 0.12;

      const progress = (t * 0.6) % 1;
      const x = THREE.MathUtils.lerp(-3.0, 3.0, progress);
      const z = THREE.MathUtils.lerp(-0.7, 0.7, progress);
      const arc = Math.sin(progress * Math.PI) * 2.2;
      cookie.position.set(x, 2.4 + arc, z);
      cookie.rotation.y += 0.03;

      trailDots.forEach((dot, i) => {
        const lag = Math.max(0, progress - (i + 1) * 0.05);
        const lx = THREE.MathUtils.lerp(-3.0, 3.0, lag);
        const lz = THREE.MathUtils.lerp(-0.7, 0.7, lag);
        const larc = Math.sin(lag * Math.PI) * 2.2;
        dot.position.set(lx, 2.4 + larc, lz);
        dot.scale.setScalar(Math.max(0.1, 1 - (i * 0.18)));
      });

      face2.material.color.setHex(progress > 0.85 ? C_ORANGE : C_NAVY_LIGHT);
    };
  }

  // Episode 5: Van with padlock circling fake webpage
  function buildScene5(orbitGroup) {
    const navyMat = new THREE.MeshLambertMaterial({ color: C_NAVY });
    const whiteMat = new THREE.MeshLambertMaterial({ color: C_WHITE });
    const orangeMat = new THREE.MeshLambertMaterial({ color: C_ORANGE });
    const cyanMat = new THREE.MeshBasicMaterial({ color: C_CYAN });

    // Webpage plane in center
    const pageGroup = new THREE.Group();
    const pageFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.4, 0.25), navyMat);
    pageFrame.castShadow = true;
    const pageFace = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.6), whiteMat);
    pageFace.position.z = 0.14;
    const urlBar = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.4), new THREE.MeshBasicMaterial({ color: 0xFEE2E2 }));
    urlBar.position.set(0, 0.9, 0.15);
    pageGroup.add(pageFrame, pageFace, urlBar);
    pageGroup.position.set(0, 2.0, 0);
    orbitGroup.add(pageGroup);

    // Security Van
    const van = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 1.1), whiteMat);
    body.position.y = 0.7;
    body.castShadow = true;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 1.08), navyMat);
    cabin.position.set(0.55, 1.05, 0);
    // Orange Padlock
    const padlock = new THREE.Group();
    const pBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.28), orangeMat);
    const pShackle = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 8, 16, Math.PI), orangeMat);
    pShackle.rotation.z = Math.PI;
    pShackle.position.y = 0.3;
    padlock.add(pBody, pShackle);
    padlock.position.set(-0.2, 1.6, 0);

    const wGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.22, 12);
    const wMat = new THREE.MeshLambertMaterial({ color: C_SLATE_RIM });
    [-0.6, 0.6].forEach(wx => {
      [-0.55, 0.55].forEach(wz => {
        const wheel = new THREE.Mesh(wGeo, wMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, 0.24, wz);
        van.add(wheel);
      });
    });

    van.add(body, cabin, padlock);
    van.scale.setScalar(0.85);
    orbitGroup.add(van);

    return function update(t) {
      orbitGroup.rotation.y = Math.sin(t * 0.2) * 0.1;
      const ang = t * 1.1;
      const rx = 3.8;
      const rz = 3.2;
      van.position.set(Math.cos(ang) * rx, 0.2, Math.sin(ang) * rz);
      van.rotation.y = -ang + Math.PI / 2;
    };
  }

  // Episode 6: Gold key above fingerprint pad
  function buildScene6(orbitGroup) {
    const navyMat = new THREE.MeshLambertMaterial({ color: C_NAVY });
    const slateMat = new THREE.MeshLambertMaterial({ color: C_SLATE_RIM });
    const orangeMat = new THREE.MeshLambertMaterial({ color: C_ORANGE });
    const cyanMat = new THREE.MeshBasicMaterial({ color: C_CYAN });
    const mintMat = new THREE.MeshBasicMaterial({ color: C_MINT });

    // Fingerprint Scanner Pad
    const pad = new THREE.Group();
    const padBase = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.2, 0.4, 32), slateMat);
    padBase.position.y = 0.2;
    pad.add(padBase);

    for (let r = 0.8; r <= 2.0; r += 0.42) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.08, r, 32), cyanMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.42;
      pad.add(ring);
    }
    orbitGroup.add(pad);

    // Floating Passkey Hardware
    const key = new THREE.Group();
    const keyBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.0, 0.3), navyMat);
    keyBody.castShadow = true;
    const usb = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.2), slateMat);
    usb.position.y = -1.9;
    const goldPin = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.22), orangeMat);
    goldPin.position.y = -2.2;
    const led = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.32, 16), mintMat);
    led.rotation.x = Math.PI / 2;
    led.position.y = 0.4;

    key.add(keyBody, usb, goldPin, led);
    key.rotation.z = Math.PI / 12;
    orbitGroup.add(key);

    return function update(t) {
      orbitGroup.rotation.y = Math.sin(t * 0.25) * 0.12;
      const bob = Math.sin(t * 2.2) * 0.4;
      key.position.set(0, 3.4 + bob, 0);
      key.rotation.y = Math.sin(t * 1.5) * 0.3;
    };
  }

  // Episode 7: Chat window, briefcase and zip file hiding a bug
  function buildScene7(orbitGroup) {
    const navyMat = new THREE.MeshLambertMaterial({ color: C_NAVY });
    const whiteMat = new THREE.MeshLambertMaterial({ color: C_WHITE });
    const orangeMat = new THREE.MeshLambertMaterial({ color: C_ORANGE });
    const slateMat = new THREE.MeshLambertMaterial({ color: C_SLATE_RIM });

    // Briefcase
    const briefcase = new THREE.Group();
    const caseBody = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, 1.1), navyMat);
    caseBody.position.y = 1.2;
    caseBody.castShadow = true;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.09, 8, 16, Math.PI), slateMat);
    handle.position.set(0, 2.5, 0);
    briefcase.add(caseBody, handle);
    briefcase.position.set(-1.6, 0, 0.7);
    briefcase.rotation.y = Math.PI / 6;
    orbitGroup.add(briefcase);

    // Zip File
    const zipBox = new THREE.Group();
    const zipMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.0, 0.9), whiteMat);
    zipMesh.position.y = 1.0;
    zipMesh.castShadow = true;
    zipBox.add(zipMesh);
    zipBox.position.set(2.2, 0, -0.9);
    orbitGroup.add(zipBox);

    // Trojan Bug (Orange Accent)
    const bug = new THREE.Group();
    const bugBody = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), orangeMat);
    bugBody.scale.set(1.2, 0.8, 1);
    const bugHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), navyMat);
    bugHead.position.x = 0.4;
    bug.add(bugBody, bugHead);
    bug.position.set(2.2, 2.1, -0.9);
    orbitGroup.add(bug);

    return function update(t) {
      orbitGroup.rotation.y = Math.sin(t * 0.25) * 0.12;
      bug.position.x = 2.2 + Math.sin(t * 3) * 0.2;
      bug.rotation.y = Math.sin(t * 4) * 0.4;
    };
  }

  // Episode 8: Magnifier revealing map pins (Featured Episode)
  function buildScene8(orbitGroup) {
    const navyMat = new THREE.MeshLambertMaterial({ color: C_NAVY });
    const whiteMat = new THREE.MeshLambertMaterial({ color: C_WHITE });
    const orangeMat = new THREE.MeshLambertMaterial({ color: C_ORANGE });
    const cyanMat = new THREE.MeshBasicMaterial({ color: C_CYAN });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x93C5FD, transparent: true, opacity: 0.45 });

    // Grid blocks
    const mapGrid = new THREE.Group();
    for (let gx = -2.2; gx <= 2.2; gx += 1.4) {
      for (let gz = -2.2; gz <= 2.2; gz += 1.4) {
        const blk = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35 + Math.random() * 0.4, 1.1), whiteMat);
        blk.position.set(gx, 0.35, gz);
        blk.castShadow = true;
        mapGrid.add(blk);
      }
    }
    orbitGroup.add(mapGrid);

    // Map Pins
    const pinCoords = [
      { x: -1.6, z: -1.0, isTarget: false },
      { x: 1.4, z: -1.4, isTarget: false },
      { x: 0.2, z: 1.2, isTarget: true }
    ];
    pinCoords.forEach(pc => {
      const pin = new THREE.Group();
      const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), pc.isTarget ? orangeMat : navyMat);
      pHead.position.y = 1.5;
      const pNeedle = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.1, 12), pc.isTarget ? orangeMat : navyMat);
      pNeedle.rotation.x = Math.PI;
      pNeedle.position.y = 0.85;
      pin.add(pHead, pNeedle);
      pin.position.set(pc.x, 0, pc.z);
      orbitGroup.add(pin);
    });

    // Magnifying glass
    const magnifier = new THREE.Group();
    const lensRing = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.14, 12, 32), navyMat);
    lensRing.rotation.x = Math.PI / 2;
    const lensGlass = new THREE.Mesh(new THREE.CircleGeometry(1.3, 32), glassMat);
    lensGlass.rotation.x = -Math.PI / 2;
    lensGlass.position.y = 0.02;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.0, 12), navyMat);
    handle.rotation.z = Math.PI / 4;
    handle.position.set(1.6, 0, 1.6);
    magnifier.add(lensRing, lensGlass, handle);
    orbitGroup.add(magnifier);

    return function update(t) {
      orbitGroup.rotation.y = Math.sin(t * 0.25) * 0.14;
      const mx = Math.cos(t * 1.4) * 2.0;
      const mz = Math.sin(t * 1.4) * 1.8;
      magnifier.position.set(mx, 3.2 + Math.sin(t * 2) * 0.25, mz);
    };
  }

  // Episode 9: Ringing phone with spoofed caller ID tag
  function buildScene9(orbitGroup) {
    const navyMat = new THREE.MeshLambertMaterial({ color: C_NAVY });
    const whiteMat = new THREE.MeshLambertMaterial({ color: C_WHITE });
    const orangeMat = new THREE.MeshLambertMaterial({ color: C_ORANGE });
    const cyanMat = new THREE.MeshBasicMaterial({ color: C_CYAN });

    // Smartphone
    const phone = new THREE.Group();
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4.2, 0.26), navyMat);
    chassis.castShadow = true;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 3.8), whiteMat);
    screen.position.z = 0.14;
    const alertBanner = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), orangeMat);
    alertBanner.position.set(0, 0.9, 0.15);

    phone.add(chassis, screen, alertBanner);
    phone.position.set(0, 2.4, 0);
    phone.rotation.x = -Math.PI / 8;
    orbitGroup.add(phone);

    // Soundwave rings
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.5 + i * 0.7, 1.65 + i * 0.7, 32), cyanMat);
      ring.position.set(0, 2.4, 0);
      ring.rotation.x = -Math.PI / 8;
      orbitGroup.add(ring);
      rings.push(ring);
    }

    return function update(t) {
      orbitGroup.rotation.y = Math.sin(t * 0.25) * 0.12;
      const cycle = t % 2.0;
      if (cycle < 1.3) {
        phone.rotation.z = Math.sin(t * 36) * 0.08;
      } else {
        phone.rotation.z = 0;
      }

      rings.forEach((r, i) => {
        const ringProg = ((t * 1.5 + i * 0.35) % 1.2);
        r.scale.setScalar(0.7 + ringProg * 0.8);
        r.material.opacity = Math.max(0, 1 - (ringProg / 1.2));
      });
    };
  }

  // Episode 10: Cracked database leaking pages to price tag
  function buildScene10(orbitGroup) {
    const navyMat = new THREE.MeshLambertMaterial({ color: C_NAVY });
    const slateMat = new THREE.MeshLambertMaterial({ color: C_SLATE_RIM });
    const orangeMat = new THREE.MeshLambertMaterial({ color: C_ORANGE });
    const cyanMat = new THREE.MeshBasicMaterial({ color: C_CYAN });

    // Database Stack
    const dbStack = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const tier = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.8, 28), navyMat);
      tier.position.y = 0.5 + i * 0.95;
      tier.castShadow = true;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(2.08, 2.08, 0.12, 28), slateMat);
      rim.position.y = 0.5 + i * 0.95 + 0.4;
      dbStack.add(tier, rim);
    }
    const crack = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.35), orangeMat);
    crack.position.set(1.7, 1.45, 0.7);
    dbStack.add(crack);
    dbStack.position.set(-2.0, 0, -0.8);
    orbitGroup.add(dbStack);

    // Offshore Node / Buyer
    const receptor = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), navyMat);
    receptor.position.set(2.6, 1.0, 1.0);
    receptor.castShadow = true;
    orbitGroup.add(receptor);

    // Leaking data packets
    const drops = [];
    for (let i = 0; i < 6; i++) {
      const isOrange = (i % 2 === 0);
      const drop = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), isOrange ? orangeMat : cyanMat);
      orbitGroup.add(drop);
      drops.push(drop);
    }

    return function update(t) {
      orbitGroup.rotation.y = Math.sin(t * 0.25) * 0.12;

      drops.forEach((d, i) => {
        const prog = (t * 0.75 + i * 0.16) % 1;
        const x = THREE.MathUtils.lerp(-0.5, 2.2, prog);
        const z = THREE.MathUtils.lerp(-0.2, 1.0, prog);
        const y = 1.5 - Math.sin(prog * Math.PI) * 0.4 - prog * 0.8;
        d.position.set(x, Math.max(0.3, y), z);
        d.rotation.x += 0.05;
      });
    };
  }

  // ── DIORAMA MANAGER ───────────────────────────────────────
  const activeScenes = new Set();
  const MAX_ACTIVE_SCENES = 4;

  const sceneBuilders = {
    'hero': buildHeroScene,
    1: buildScene1,
    2: buildScene2,
    3: buildScene3,
    4: buildScene4,
    5: buildScene5,
    6: buildScene6,
    7: buildScene7,
    8: buildScene8,
    9: buildScene9,
    10: buildScene10
  };

  function initDioramas() {
    const containers = document.querySelectorAll('.iso-diorama-mount[data-episode]');
    if (!containers.length) return;

    containers.forEach(container => {
      const epKey = container.getAttribute('data-episode');
      const builder = sceneBuilders[epKey] || sceneBuilders[parseInt(epKey, 10)];
      if (!builder) return;

      let runtime = null;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!runtime && activeScenes.size < MAX_ACTIVE_SCENES) {
              const diorama = setupDiorama(container);
              const updateFn = builder(diorama.orbitGroup);

              let animId = null;
              let startTime = performance.now();

              function loop(now) {
                const t = (now - startTime) * 0.001;
                updateFn(t);
                diorama.renderer.render(diorama.scene, diorama.camera);
                animId = requestAnimationFrame(loop);
              }

              animId = requestAnimationFrame(loop);
              activeScenes.add(container);

              runtime = {
                stop: () => {
                  if (animId) cancelAnimationFrame(animId);
                  diorama.renderer.dispose();
                  if (diorama.renderer.domElement && diorama.renderer.domElement.parentNode) {
                    diorama.renderer.domElement.parentNode.removeChild(diorama.renderer.domElement);
                  }
                  activeScenes.delete(container);
                  runtime = null;
                }
              };
            }
          } else {
            if (runtime) {
              runtime.stop();
            }
          }
        });
      }, { rootMargin: '120px' });

      observer.observe(container);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDioramas);
  } else {
    initDioramas();
  }

  window.CI_ISO = { activeScenes, MAX_ACTIVE_SCENES };
})();
