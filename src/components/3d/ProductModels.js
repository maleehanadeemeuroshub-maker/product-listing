import * as THREE from 'three';

/**
 * Creates dynamic canvas textures for realistic screens, glowing HUDs, and meshes
 */
function createWatchScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Background radial gradient
  const gradient = ctx.createRadialGradient(256, 256, 40, 256, 256, 240);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(0.8, '#030712');
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Outer high-tech telemetry ring
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(256, 256, 220, 0, Math.PI * 2);
  ctx.stroke();

  // Sub-gauge arc (Activity / Battery)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(256, 256, 195, -Math.PI * 0.75, Math.PI * 0.35);
  ctx.stroke();

  ctx.strokeStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(256, 256, 175, Math.PI * 0.2, Math.PI * 0.9);
  ctx.stroke();

  // Futuristic Time Display
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 84px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('10:42', 256, 230);

  // Sub-metrics
  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 24px "JetBrains Mono", monospace';
  ctx.fillText('7,840 STEPS • 138 BPM', 256, 310);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText('94% BATTERY • GPS LOCK', 256, 350);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createPhoneScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Cyber wallpaper
  const grad = ctx.createLinearGradient(0, 0, 512, 1024);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#083344');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1024);

  // Futuristic geometric glow art
  ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
  ctx.beginPath();
  ctx.arc(256, 400, 180, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Holographic clock
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 76px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('09:41', 256, 260);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 24px sans-serif';
  ctx.fillText('MON, AUG 24 • 72°F CLEAR', 256, 320);

  // App grid simulation
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const x = 70 + col * 100;
      const y = 620 + row * 90;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(x, y, 65, 65, 14);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural 3D Headphone Model
 */
export function createHeadphonesModel(primaryColor = '#06b6d4', accentColor = '#0891b2') {
  const root = new THREE.Group();
  root.name = 'headphones';

  const mainMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    roughness: 0.25,
    metalness: 0.85,
    envMapIntensity: 1.2,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    roughness: 0.4,
    metalness: 0.6,
  });

  const cushionMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#18181b'),
    roughness: 0.85,
    metalness: 0.1,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(primaryColor),
    transparent: true,
    opacity: 0.85,
  });

  // Layer 0: Headband Arch
  const headbandGroup = new THREE.Group();
  headbandGroup.userData = { explodedAxis: 'y', explodedDistance: 0.8, originalPos: new THREE.Vector3(0, 0, 0) };
  
  const curve = new THREE.EllipseCurve(0, 0, 1.2, 1.3, 0.15 * Math.PI, 0.85 * Math.PI, false, 0);
  const points = curve.getPoints(50).map(p => new THREE.Vector3(p.x, p.y + 0.1, 0));
  const tubeGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 40, 0.08, 12, false);
  const headbandMesh = new THREE.Mesh(tubeGeo, mainMat);
  headbandGroup.add(headbandMesh);

  // Soft Headband Cushion
  const cushionCurve = new THREE.EllipseCurve(0, 0, 1.15, 1.25, 0.3 * Math.PI, 0.7 * Math.PI, false, 0);
  const cushionPoints = cushionCurve.getPoints(30).map(p => new THREE.Vector3(p.x, p.y + 0.12, 0));
  const cushionGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cushionPoints), 25, 0.11, 12, false);
  const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
  headbandGroup.add(cushionMesh);
  root.add(headbandGroup);

  // Layer 1: Left Ear Assembly
  const leftEarGroup = new THREE.Group();
  leftEarGroup.userData = { explodedAxis: 'x', explodedDistance: 1.2, originalPos: new THREE.Vector3(-1.15, -0.05, 0) };
  leftEarGroup.position.set(-1.15, -0.05, 0);

  // Outer Shell
  const cupGeo = new THREE.CylinderGeometry(0.55, 0.52, 0.35, 32);
  cupGeo.rotateZ(Math.PI / 2);
  const cupMesh = new THREE.Mesh(cupGeo, mainMat);
  leftEarGroup.add(cupMesh);

  // Cushion
  const earCushionGeo = new THREE.TorusGeometry(0.48, 0.16, 16, 32);
  earCushionGeo.rotateY(Math.PI / 2);
  const earCushionMesh = new THREE.Mesh(earCushionGeo, cushionMat);
  earCushionMesh.position.x = 0.22;
  leftEarGroup.add(earCushionMesh);

  // Glowing LED Ring
  const glowRingGeo = new THREE.RingGeometry(0.38, 0.42, 32);
  glowRingGeo.rotateY(-Math.PI / 2);
  const glowRingMesh = new THREE.Mesh(glowRingGeo, glowMat);
  glowRingMesh.position.x = -0.18;
  leftEarGroup.add(glowRingMesh);

  // Metal grill center
  const grillGeo = new THREE.CircleGeometry(0.36, 24);
  grillGeo.rotateY(-Math.PI / 2);
  const grillMesh = new THREE.Mesh(grillGeo, accentMat);
  grillMesh.position.x = -0.178;
  leftEarGroup.add(grillMesh);

  root.add(leftEarGroup);

  // Layer 2: Right Ear Assembly
  const rightEarGroup = new THREE.Group();
  rightEarGroup.userData = { explodedAxis: 'x', explodedDistance: -1.2, originalPos: new THREE.Vector3(1.15, -0.05, 0) };
  rightEarGroup.position.set(1.15, -0.05, 0);

  const rightCupMesh = new THREE.Mesh(cupGeo, mainMat);
  rightEarGroup.add(rightCupMesh);

  const rightEarCushionMesh = new THREE.Mesh(earCushionGeo, cushionMat);
  rightEarCushionMesh.position.x = -0.22;
  rightEarGroup.add(rightEarCushionMesh);

  const rightGlowRing = new THREE.Mesh(glowRingGeo, glowMat);
  rightGlowRing.position.x = 0.18;
  rightEarGroup.add(rightGlowRing);

  const rightGrill = new THREE.Mesh(grillGeo, accentMat);
  rightGrill.position.x = 0.178;
  rightEarGroup.add(rightGrill);

  root.add(rightEarGroup);

  return root;
}

/**
 * Procedural 3D Smartwatch Model
 */
export function createSmartwatchModel(primaryColor = '#94a3b8', accentColor = '#64748b') {
  const root = new THREE.Group();
  root.name = 'smartwatch';

  const caseMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    roughness: 0.28,
    metalness: 0.9,
  });

  const strapMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#18181b'),
    roughness: 0.75,
    metalness: 0.1,
  });

  const screenTex = createWatchScreenTexture();
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTex,
  });

  const crownMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    roughness: 0.2,
    metalness: 0.95,
  });

  // Layer 0: Main Watch Case
  const caseGroup = new THREE.Group();
  caseGroup.userData = { explodedAxis: 'z', explodedDistance: 0.2, originalPos: new THREE.Vector3(0, 0, 0) };

  const bodyGeo = new THREE.CylinderGeometry(0.85, 0.82, 0.24, 40);
  const bodyMesh = new THREE.Mesh(bodyGeo, caseMat);
  bodyMesh.rotation.x = Math.PI / 2;
  caseGroup.add(bodyMesh);

  // Digital Crown on right
  const crownGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 20);
  const crownMesh = new THREE.Mesh(crownGeo, crownMat);
  crownMesh.rotation.z = Math.PI / 2;
  crownMesh.position.set(0.9, 0.15, 0);
  caseGroup.add(crownMesh);

  // Action Button
  const btnGeo = new THREE.BoxGeometry(0.08, 0.28, 0.12);
  const btnMesh = new THREE.Mesh(btnGeo, crownMat);
  btnMesh.position.set(0.87, -0.22, 0);
  caseGroup.add(btnMesh);

  root.add(caseGroup);

  // Layer 1: Front Sapphire Glass & Display Screen
  const screenGroup = new THREE.Group();
  screenGroup.userData = { explodedAxis: 'z', explodedDistance: 0.9, originalPos: new THREE.Vector3(0, 0, 0.13) };
  screenGroup.position.set(0, 0, 0.13);

  const screenGeo = new THREE.CircleGeometry(0.76, 40);
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenGroup.add(screenMesh);

  // Glass Bezel Ring
  const bezelGeo = new THREE.RingGeometry(0.76, 0.84, 40);
  const bezelMesh = new THREE.Mesh(bezelGeo, caseMat);
  bezelMesh.position.z = 0.005;
  screenGroup.add(bezelMesh);
  root.add(screenGroup);

  // Layer 2: Back Sensor Base
  const sensorGroup = new THREE.Group();
  sensorGroup.userData = { explodedAxis: 'z', explodedDistance: -0.9, originalPos: new THREE.Vector3(0, 0, -0.13) };
  sensorGroup.position.set(0, 0, -0.13);

  const sensorBaseGeo = new THREE.CircleGeometry(0.65, 32);
  const sensorMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2, metalness: 0.5 });
  const sensorMesh = new THREE.Mesh(sensorBaseGeo, sensorMat);
  sensorMesh.rotation.y = Math.PI;
  sensorGroup.add(sensorMesh);

  // Optical LED dots
  const ledGeo = new THREE.CircleGeometry(0.08, 16);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  for (let i = 0; i < 4; i++) {
    const dot = new THREE.Mesh(ledGeo, ledMat);
    const angle = (i / 4) * Math.PI * 2;
    dot.position.set(Math.cos(angle) * 0.35, Math.sin(angle) * 0.35, -0.002);
    dot.rotation.y = Math.PI;
    sensorGroup.add(dot);
  }
  root.add(sensorGroup);

  // Straps
  const topStrapGeo = new THREE.BoxGeometry(0.7, 1.4, 0.12);
  const topStrap = new THREE.Mesh(topStrapGeo, strapMat);
  topStrap.position.set(0, 1.4, -0.02);
  root.add(topStrap);

  const btmStrapGeo = new THREE.BoxGeometry(0.7, 1.4, 0.12);
  const btmStrap = new THREE.Mesh(btmStrapGeo, strapMat);
  btmStrap.position.set(0, -1.4, -0.02);
  root.add(btmStrap);

  return root;
}

/**
 * Procedural 3D Smartphone Model
 */
export function createSmartphoneModel(primaryColor = '#8b5cf6', accentColor = '#7c3aed') {
  const root = new THREE.Group();
  root.name = 'smartphone';

  const frameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    roughness: 0.2,
    metalness: 0.9,
  });

  const backMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    roughness: 0.35,
    metalness: 0.7,
  });

  const screenTex = createPhoneScreenTexture();
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTex,
  });

  const cameraGlassMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.05,
    metalness: 0.95,
  });

  const lensGlassMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85,
  });

  // Layer 0: Titanium Midframe
  const frameGroup = new THREE.Group();
  frameGroup.userData = { explodedAxis: 'z', explodedDistance: 0, originalPos: new THREE.Vector3(0, 0, 0) };

  const bodyGeo = new THREE.BoxGeometry(1.2, 2.4, 0.12);
  const bodyMesh = new THREE.Mesh(bodyGeo, frameMat);
  frameGroup.add(bodyMesh);
  root.add(frameGroup);

  // Layer 1: Front OLED Display
  const screenGroup = new THREE.Group();
  screenGroup.userData = { explodedAxis: 'z', explodedDistance: 0.9, originalPos: new THREE.Vector3(0, 0, 0.065) };
  screenGroup.position.set(0, 0, 0.065);

  const screenPlaneGeo = new THREE.PlaneGeometry(1.14, 2.34);
  const screenMesh = new THREE.Mesh(screenPlaneGeo, screenMat);
  screenGroup.add(screenMesh);
  root.add(screenGroup);

  // Layer 2: Back Glass & Triple Camera Bump
  const backGroup = new THREE.Group();
  backGroup.userData = { explodedAxis: 'z', explodedDistance: -0.9, originalPos: new THREE.Vector3(0, 0, -0.065) };
  backGroup.position.set(0, 0, -0.065);

  const backPlaneGeo = new THREE.PlaneGeometry(1.18, 2.38);
  const backMesh = new THREE.Mesh(backPlaneGeo, backMat);
  backMesh.rotation.y = Math.PI;
  backGroup.add(backMesh);

  // Camera Island Plateau
  const islandGeo = new THREE.BoxGeometry(0.48, 0.8, 0.08);
  const islandMesh = new THREE.Mesh(islandGeo, frameMat);
  islandMesh.position.set(0.3, 0.7, -0.04);
  backGroup.add(islandMesh);

  // 3 Camera Lenses
  for (let i = 0; i < 3; i++) {
    const lensRingGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 24);
    lensRingGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(lensRingGeo, cameraGlassMat);
    ringMesh.position.set(0.3, 0.9 - i * 0.25, -0.09);
    backGroup.add(ringMesh);

    const innerLensGeo = new THREE.CircleGeometry(0.07, 20);
    const innerLens = new THREE.Mesh(innerLensGeo, lensGlassMat);
    innerLens.rotation.y = Math.PI;
    innerLens.position.set(0.3, 0.9 - i * 0.25, -0.122);
    backGroup.add(innerLens);
  }
  root.add(backGroup);

  return root;
}

/**
 * Procedural 3D Mechanical Keyboard Model
 */
export function createKeyboardModel(primaryColor = '#a855f7', accentColor = '#9333ea') {
  const root = new THREE.Group();
  root.name = 'keyboard';

  const caseMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    roughness: 0.25,
    metalness: 0.85,
  });

  const capMatDark = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    metalness: 0.2,
  });

  const capMatAccent = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    roughness: 0.4,
    metalness: 0.5,
  });

  const rgbMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(primaryColor),
    transparent: true,
    opacity: 0.7,
  });

  // Layer 0: Aluminum Base Case
  const baseGroup = new THREE.Group();
  baseGroup.userData = { explodedAxis: 'y', explodedDistance: -0.6, originalPos: new THREE.Vector3(0, 0, 0) };

  const baseGeo = new THREE.BoxGeometry(2.8, 0.25, 1.4);
  const baseMesh = new THREE.Mesh(baseGeo, caseMat);
  baseGroup.add(baseMesh);
  root.add(baseGroup);

  // Layer 1: RGB Switch Underplate
  const plateGroup = new THREE.Group();
  plateGroup.userData = { explodedAxis: 'y', explodedDistance: 0.4, originalPos: new THREE.Vector3(0, 0.14, 0) };
  plateGroup.position.set(0, 0.14, 0);

  const plateGeo = new THREE.BoxGeometry(2.68, 0.04, 1.28);
  const plateMesh = new THREE.Mesh(plateGeo, rgbMat);
  plateGroup.add(plateMesh);
  root.add(plateGroup);

  // Layer 2: Floating Keycaps Grid
  const capsGroup = new THREE.Group();
  capsGroup.userData = { explodedAxis: 'y', explodedDistance: 1.1, originalPos: new THREE.Vector3(0, 0.22, 0) };
  capsGroup.position.set(0, 0.22, 0);

  const rows = 5;
  const cols = 12;
  const keyGeo = new THREE.BoxGeometry(0.18, 0.14, 0.18);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isAccent = (r === 0 && c === 0) || (r === 4 && (c === 0 || c === cols - 1)) || (r === 2 && c === 11);
      const kMesh = new THREE.Mesh(keyGeo, isAccent ? capMatAccent : capMatDark);
      kMesh.position.set(-1.18 + c * 0.215, 0, -0.48 + r * 0.24);
      capsGroup.add(kMesh);
    }
  }

  // Rotary Knob top right
  const knobGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.18, 20);
  const knobMesh = new THREE.Mesh(knobGeo, caseMat);
  knobMesh.position.set(1.22, 0.05, -0.48);
  capsGroup.add(knobMesh);

  root.add(capsGroup);

  return root;
}

/**
 * Procedural 3D Drone Model
 */
export function createDroneModel(primaryColor = '#334155', accentColor = '#06b6d4') {
  const root = new THREE.Group();
  root.name = 'drone';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    roughness: 0.35,
    metalness: 0.6,
  });

  const rotorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0f172a'),
    roughness: 0.2,
    metalness: 0.9,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accentColor),
  });

  // Layer 0: Fuselage Body
  const bodyGroup = new THREE.Group();
  bodyGroup.userData = { explodedAxis: 'y', explodedDistance: 0, originalPos: new THREE.Vector3(0, 0, 0) };

  const bodyGeo = new THREE.BoxGeometry(0.8, 0.25, 1.2);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyGroup.add(bodyMesh);

  // 4 Carbon Arms
  const armOffsets = [
    { x: 0.9, z: 0.9 },
    { x: -0.9, z: 0.9 },
    { x: 0.9, z: -0.9 },
    { x: -0.9, z: -0.9 },
  ];

  armOffsets.forEach(pos => {
    const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 12);
    armGeo.rotateZ(pos.x > 0 ? -Math.PI / 4 : Math.PI / 4);
    const armMesh = new THREE.Mesh(armGeo, bodyMat);
    armMesh.position.set(pos.x * 0.5, 0, pos.z * 0.5);
    bodyGroup.add(armMesh);

    // Motor Pod
    const motorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16);
    const motorMesh = new THREE.Mesh(motorGeo, bodyMat);
    motorMesh.position.set(pos.x, 0.08, pos.z);
    bodyGroup.add(motorMesh);
  });

  // 4K Gimbal Camera Front
  const cameraGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const cameraMesh = new THREE.Mesh(cameraGeo, new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.1 }));
  cameraMesh.position.set(0, -0.15, 0.65);
  bodyGroup.add(cameraMesh);

  root.add(bodyGroup);

  // Layer 1: Spinning Rotors Array
  const rotorsGroup = new THREE.Group();
  rotorsGroup.name = 'rotors';
  rotorsGroup.userData = { explodedAxis: 'y', explodedDistance: 1.1, originalPos: new THREE.Vector3(0, 0.22, 0) };
  rotorsGroup.position.set(0, 0.22, 0);

  armOffsets.forEach(pos => {
    const bladeGroup = new THREE.Group();
    bladeGroup.name = 'blade';
    bladeGroup.position.set(pos.x, 0, pos.z);

    const bladeGeo = new THREE.BoxGeometry(0.8, 0.015, 0.08);
    const bladeMesh = new THREE.Mesh(bladeGeo, rotorMat);
    bladeGroup.add(bladeMesh);

    const centerCap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), glowMat);
    bladeGroup.add(centerCap);

    rotorsGroup.add(bladeGroup);
  });
  root.add(rotorsGroup);

  return root;
}

/**
 * Procedural 3D Gaming Mouse Model
 */
export function createMouseModel(primaryColor = '#18181b', accentColor = '#06b6d4') {
  const root = new THREE.Group();
  root.name = 'mouse';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    roughness: 0.5,
    metalness: 0.25,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accentColor),
  });

  const scrollMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    roughness: 0.3,
    metalness: 0.8,
  });

  // Layer 0: Contoured Base
  const baseGroup = new THREE.Group();
  baseGroup.userData = { explodedAxis: 'y', explodedDistance: -0.6, originalPos: new THREE.Vector3(0, 0, 0) };

  const baseGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.1, 32);
  baseGeo.scale(1, 1, 1.8);
  const baseMesh = new THREE.Mesh(baseGeo, bodyMat);
  baseGroup.add(baseMesh);
  root.add(baseGroup);

  // Layer 1: Ergonomic Top Palm Shell
  const shellGroup = new THREE.Group();
  shellGroup.userData = { explodedAxis: 'y', explodedDistance: 1.0, originalPos: new THREE.Vector3(0, 0.25, 0) };
  shellGroup.position.set(0, 0.25, 0);

  const shellGeo = new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
  shellGeo.scale(0.9, 0.8, 1.6);
  const shellMesh = new THREE.Mesh(shellGeo, bodyMat);
  shellGroup.add(shellMesh);

  // Scroll wheel
  const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.08, 20);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMesh = new THREE.Mesh(wheelGeo, scrollMat);
  wheelMesh.position.set(0, 0.2, -0.6);
  shellGroup.add(wheelMesh);

  // Glowing RGB Scroll Ring
  const ringGeo = new THREE.TorusGeometry(0.142, 0.015, 8, 24);
  ringGeo.rotateY(Math.PI / 2);
  const ringMesh = new THREE.Mesh(ringGeo, glowMat);
  ringMesh.position.set(0, 0.2, -0.6);
  shellGroup.add(ringMesh);

  root.add(shellGroup);

  return root;
}

/**
 * Procedural 3D Spatial Speaker Model
 */
export function createSpeakerModel(primaryColor = '#0f172a', accentColor = '#06b6d4') {
  const root = new THREE.Group();
  root.name = 'speaker';

  const fabricMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    roughness: 0.8,
    metalness: 0.1,
  });

  const capMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    roughness: 0.15,
    metalness: 0.9,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accentColor),
    transparent: true,
    opacity: 0.9,
  });

  // Layer 0: Cylindrical Fabric Body
  const bodyGroup = new THREE.Group();
  bodyGroup.userData = { explodedAxis: 'y', explodedDistance: 0, originalPos: new THREE.Vector3(0, 0, 0) };

  const cylGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.6, 36);
  const cylMesh = new THREE.Mesh(cylGeo, fabricMat);
  bodyGroup.add(cylMesh);
  root.add(bodyGroup);

  // Layer 1: Top Touch Cap & LED Halo
  const topGroup = new THREE.Group();
  topGroup.userData = { explodedAxis: 'y', explodedDistance: 1.2, originalPos: new THREE.Vector3(0, 0.82, 0) };
  topGroup.position.set(0, 0.82, 0);

  const topCapGeo = new THREE.CylinderGeometry(0.63, 0.63, 0.08, 36);
  const topCapMesh = new THREE.Mesh(topCapGeo, capMat);
  topGroup.add(topCapMesh);

  // Glowing Visualizer Ring
  const ringGeo = new THREE.RingGeometry(0.48, 0.58, 36);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMesh = new THREE.Mesh(ringGeo, glowMat);
  ringMesh.position.y = 0.045;
  topGroup.add(ringMesh);

  root.add(topGroup);

  // Layer 2: Sub-Bass Damped Base
  const baseGroup = new THREE.Group();
  baseGroup.userData = { explodedAxis: 'y', explodedDistance: -0.9, originalPos: new THREE.Vector3(0, -0.82, 0) };
  baseGroup.position.set(0, -0.82, 0);

  const baseGeo = new THREE.CylinderGeometry(0.64, 0.68, 0.1, 36);
  const baseMesh = new THREE.Mesh(baseGeo, capMat);
  baseGroup.add(baseMesh);

  root.add(baseGroup);

  return root;
}

/**
 * Procedural 3D AR Holographic Glasses Model
 */
export function createGlassesModel(primaryColor = '#1e293b', accentColor = '#06b6d4') {
  const root = new THREE.Group();
  root.name = 'glasses';

  const frameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    roughness: 0.25,
    metalness: 0.85,
  });

  const lensMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    roughness: 0.05,
    metalness: 0.2,
    transparent: true,
    opacity: 0.6,
  });

  const hudMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accentColor),
    transparent: true,
    opacity: 0.85,
  });

  // Layer 0: Titanium Frame Front
  const frameGroup = new THREE.Group();
  frameGroup.userData = { explodedAxis: 'z', explodedDistance: 0.2, originalPos: new THREE.Vector3(0, 0, 0) };

  // Bridge
  const bridgeGeo = new THREE.BoxGeometry(0.4, 0.06, 0.06);
  const bridgeMesh = new THREE.Mesh(bridgeGeo, frameMat);
  bridgeMesh.position.set(0, 0.25, 0);
  frameGroup.add(bridgeMesh);

  // Left & Right Rim Frames
  [-0.65, 0.65].forEach(x => {
    const rimGeo = new THREE.TorusGeometry(0.4, 0.04, 12, 28);
    const rimMesh = new THREE.Mesh(rimGeo, frameMat);
    rimMesh.position.set(x, 0.2, 0);
    frameGroup.add(rimMesh);
  });

  // Temples (Left & Right Arms)
  [-1.02, 1.02].forEach(x => {
    const armGeo = new THREE.BoxGeometry(0.05, 0.08, 1.6);
    const armMesh = new THREE.Mesh(armGeo, frameMat);
    armMesh.position.set(x, 0.2, -0.8);
    frameGroup.add(armMesh);
  });

  root.add(frameGroup);

  // Layer 1: Translucent AR Waveguide Lenses
  const lensGroup = new THREE.Group();
  lensGroup.userData = { explodedAxis: 'z', explodedDistance: 1.1, originalPos: new THREE.Vector3(0, 0.2, 0.02) };
  lensGroup.position.set(0, 0.2, 0.02);

  [-0.65, 0.65].forEach(x => {
    const lensGeo = new THREE.CircleGeometry(0.38, 28);
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(x, 0, 0);
    lensGroup.add(lensMesh);

    // Glowing HUD Reticle
    const reticleGeo = new THREE.RingGeometry(0.1, 0.12, 16);
    const reticleMesh = new THREE.Mesh(reticleGeo, hudMat);
    reticleMesh.position.set(x, 0, 0.01);
    lensGroup.add(reticleMesh);
  });

  root.add(lensGroup);

  return root;
}

/**
 * Universal Factory to generate any product 3D model
 */
export function buildProduct3DModel(modelType, primaryColor = '#06b6d4', accentColor = '#0891b2') {
  switch (modelType) {
    case 'headphones':
      return createHeadphonesModel(primaryColor, accentColor);
    case 'smartwatch':
      return createSmartwatchModel(primaryColor, accentColor);
    case 'smartphone':
      return createSmartphoneModel(primaryColor, accentColor);
    case 'keyboard':
      return createKeyboardModel(primaryColor, accentColor);
    case 'drone':
      return createDroneModel(primaryColor, accentColor);
    case 'mouse':
      return createMouseModel(primaryColor, accentColor);
    case 'speaker':
      return createSpeakerModel(primaryColor, accentColor);
    case 'glasses':
      return createGlassesModel(primaryColor, accentColor);
    default:
      return createHeadphonesModel(primaryColor, accentColor);
  }
}

/**
 * Apply exploded view offset smoothly to all tagged child groups
 */
export function applyExplodedViewOffset(rootGroup, ratio = 0) {
  if (!rootGroup) return;

  rootGroup.traverse(child => {
    if (child.userData && child.userData.explodedAxis) {
      const { explodedAxis, explodedDistance, originalPos } = child.userData;
      if (!originalPos) return;

      const offset = explodedDistance * ratio;
      child.position.copy(originalPos);

      if (explodedAxis === 'x') child.position.x += offset;
      if (explodedAxis === 'y') child.position.y += offset;
      if (explodedAxis === 'z') child.position.z += offset;
    }
  });
}

/**
 * Update material colors dynamically in real time
 */
export function updateModelColors(rootGroup, primaryHex, accentHex, roughness = 0.25, metalness = 0.85, wireframe = false) {
  if (!rootGroup) return;

  const primaryCol = new THREE.Color(primaryHex);
  const accentCol = new THREE.Color(accentHex || primaryHex);

  rootGroup.traverse(child => {
    if (child.isMesh && child.material) {
      child.material.wireframe = wireframe;

      // Skip textures (like watch or phone screens)
      if (child.material.map) return;

      // If it's a basic glow material
      if (child.material.type === 'MeshBasicMaterial' && child.material.transparent) {
        child.material.color.copy(primaryCol);
      } else if (child.material.isMeshStandardMaterial) {
        // Check if it's the dark cushion/strap material vs metallic body
        if (child.material.color.getHex() !== 0x18181b && child.material.color.getHex() !== 0x111827) {
          child.material.color.copy(primaryCol);
          child.material.roughness = roughness;
          child.material.metalness = metalness;
        }
      }
    }
  });
}
