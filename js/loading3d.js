/* ============================================================
   LIPOVERSE — loading3d.js (Three.js Drug Loading 3D view)
   Shows WHERE the drug is loaded:
   hydrophilic → aqueous core · lipophilic → lipid bilayer
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const wrap = document.getElementById('loading-canvas-wrap');

if (wrap) {
  /* ---------- Scene ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.localClippingEnabled = true;
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const CAM_HOME = new THREE.Vector3(0, 1.1, 6.9);
  camera.position.copy(CAM_HOME);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 3.6;
  controls.maxDistance = 12;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.6;

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(5, 6, 8);
  scene.add(keyLight);
  const rim = new THREE.PointLight(0xC4A46A, 25, 30);
  rim.position.set(-6, -3, -5);
  scene.add(rim);

  /* ---------- Materials ---------- */
  const headMat = new THREE.MeshStandardMaterial({ color: 0xE4C99A, roughness: 0.32, metalness: 0.08, emissive: 0xE4C99A, emissiveIntensity: 0.14 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xF6E7C1, roughness: 0.45, metalness: 0.05, emissive: 0xF6E7C1, emissiveIntensity: 0.1 });
  const cholMat = new THREE.MeshStandardMaterial({ color: 0xC9A15A, roughness: 0.25, metalness: 0.1, emissive: 0xC9A15A, emissiveIntensity: 0.25 });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x1F8A68, transparent: true, opacity: 0.18, roughness: 0.1, emissive: 0x1F8A68, emissiveIntensity: 0.3, side: THREE.DoubleSide, depthWrite: false });
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x7DCEB0, roughness: 0.15, transparent: true, opacity: 0.75 });
  const drugHydroMat = new THREE.MeshStandardMaterial({ color: 0xF0D48A, roughness: 0.2, emissive: 0xE8C87E, emissiveIntensity: 0.8 });
  const drugLipoMat = new THREE.MeshStandardMaterial({ color: 0xC9845A, roughness: 0.2, emissive: 0xA86B3E, emissiveIntensity: 0.8 });

  /* ---------- Geometry helpers ---------- */
  function fibonacciSphere(n) {
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }
    return pts;
  }
  function sphereAt(pos, radius, seg) {
    const geo = new THREE.SphereGeometry(radius, seg || 10, seg || 10);
    geo.translate(pos.x, pos.y, pos.z);
    return geo;
  }
  function orientedCylinder(from, to, radius) {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(radius, radius, len, 6);
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    geo.applyMatrix4(new THREE.Matrix4().compose(mid, quat, new THREE.Vector3(1, 1, 1)));
    return geo;
  }

  const R_OUT = 2.0, R_IN = 1.72, R_MID = 1.86;
  const DIRS = fibonacciSphere(300);
  const up = new THREE.Vector3(0, 1, 0);

  /* ---------- Liposome body ---------- */
  const liposome = new THREE.Group();
  scene.add(liposome);

  const headGeos = [], tailGeos = [];
  DIRS.forEach(d => {
    headGeos.push(sphereAt(d.clone().multiplyScalar(R_OUT), 0.082));
    headGeos.push(sphereAt(d.clone().multiplyScalar(R_IN), 0.082));
    const perp = new THREE.Vector3().crossVectors(d, up).normalize();
    if (perp.lengthSq() < 0.01) perp.set(1, 0, 0);
    [-0.036, 0.036].forEach(off => {
      const o = perp.clone().multiplyScalar(off);
      tailGeos.push(orientedCylinder(d.clone().multiplyScalar(R_OUT - 0.03).add(o), d.clone().multiplyScalar(R_IN + 0.02).add(o), 0.027));
      tailGeos.push(orientedCylinder(d.clone().multiplyScalar(R_IN + 0.03).add(o), d.clone().multiplyScalar(R_OUT - 0.02).add(o), 0.027));
    });
  });
  liposome.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(headGeos), headMat));
  liposome.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(tailGeos), tailMat));

  const cholGeos = [];
  fibonacciSphere(70).forEach(d => cholGeos.push(sphereAt(d.clone().multiplyScalar(R_MID), 0.058, 8)));
  liposome.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(cholGeos), cholMat));

  const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(R_IN - 0.08, 36, 36), coreMat);
  liposome.add(coreMesh);

  const waterGeos = [];
  for (let i = 0; i < 110; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * (R_IN - 0.28));
    waterGeos.push(sphereAt(v, 0.05, 6));
  }
  liposome.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(waterGeos), waterMat));

  /* ---------- Drug overlays: hydrophilic (core) & lipophilic (bilayer) ---------- */
  const hydroGeos = [];
  for (let i = 0; i < 80; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * (R_IN - 0.38));
    hydroGeos.push(sphereAt(v, 0.075, 8));
  }
  const hydroMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(hydroGeos), drugHydroMat);

  const lipoGeos = [];
  fibonacciSphere(120).forEach(d => {
    const r = R_MID + (Math.random() - 0.5) * 0.12;
    lipoGeos.push(sphereAt(d.clone().multiplyScalar(r), 0.07, 8));
  });
  const lipoMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(lipoGeos), drugLipoMat);

  liposome.add(hydroMesh, lipoMesh);

  /* Glow sprite */
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 256;
  const gctx = glowCanvas.getContext('2d');
  const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(228,201,154,0.35)');
  grad.addColorStop(1, 'rgba(228,201,154,0)');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 256, 256);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), transparent: true, depthWrite: false }));
  glow.scale.set(8.5, 8.5, 1);
  scene.add(glow);

  /* ---------- Mode switching ---------- */
  const CLIP = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const allMats = [headMat, tailMat, cholMat, coreMat, waterMat, drugHydroMat, drugLipoMat];
  let cutaway = false;
  let pulse = 1; // scale-in animation for the drug overlay

  function applyClipping() {
    allMats.forEach(m => { m.clippingPlanes = cutaway ? [CLIP] : null; m.needsUpdate = true; });
  }

  const note = document.getElementById('loading-note');
  const btnH = document.getElementById('load-hydrophilic');
  const btnL = document.getElementById('load-lipophilic');
  const btnCut = document.getElementById('load-cutaway');

  function setMode(mode) {
    hydroMesh.visible = mode === 'hydrophilic';
    lipoMesh.visible = mode === 'lipophilic';
    if (btnH) btnH.classList.toggle('active', mode === 'hydrophilic');
    if (btnL) btnL.classList.toggle('active', mode === 'lipophilic');
    if (note) note.textContent = mode === 'hydrophilic'
      ? 'Water-soluble drugs (gold) dissolve in the aqueous core.'
      : 'Fat-soluble drugs (orange) dissolve among the lipid tails.';
    pulse = 0.25; // animate the drug molecules "loading in"
  }
  if (btnH) btnH.addEventListener('click', () => setMode('hydrophilic'));
  if (btnL) btnL.addEventListener('click', () => setMode('lipophilic'));
  if (btnCut) btnCut.addEventListener('click', () => {
    cutaway = !cutaway;
    btnCut.classList.toggle('active', cutaway);
    applyClipping();
  });

  setMode('hydrophilic');

  /* ---------- Resize & loop ---------- */
  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(wrap);
  resize();

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const section = document.getElementById('section-loading');
    if (!section || !section.classList.contains('active')) return;
    const t = clock.getElapsedTime();
    liposome.position.y = Math.sin(t * 0.9) * 0.07;
    // Drug "loading in" pulse
    if (pulse < 1) {
      pulse = Math.min(1, pulse + 0.035);
      const s = pulse;
      hydroMesh.scale.setScalar(s);
      lipoMesh.scale.setScalar(s);
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  /* ---------- Public API (kept for main.js compatibility) ---------- */
  window.LipoverseLoading = {
    start() {},  // rendering loop is self-gated by section visibility
    stop() {},
    setMode
  };
}
