/* ============================================================
   LIPOVERSE — explorer.js (Three.js 3D Liposome Explorer)
   Interactive liposome: rotate · zoom · click parts ·
   cutaway view · drug-location overlay · layer toggles
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const wrap = document.getElementById('explorer-canvas-wrap');
if (!wrap) throw new Error('Explorer container not found');

/* ---------- Part data ---------- */
const PARTS = {
  bilayer: {
    label: 'Phospholipid Bilayer', color: '#E4C99A',
    ar: 'الطبقة الدهنية الفوسفورية',
    desc: 'The vesicle wall, formed by two layers of phospholipid molecules arranged tail-to-tail. It separates the internal aqueous core from the outside world and controls what can enter or leave.',
    points: ['Two leaflets: outer and inner', 'Self-assembles in water — like a cell membrane', 'Lipophilic drugs dissolve inside it']
  },
  head: {
    label: 'Hydrophilic Head', color: '#E4C99A',
    ar: 'الرأس المحب للماء',
    desc: 'The polar phosphate head of each phospholipid. It loves water (hydrophilic) and always faces an aqueous environment — either outside the liposome or inside the core.',
    points: ['Made of phosphate + glycerol', 'Faces water on both sides of the bilayer', 'Gives the liposome its water compatibility']
  },
  tail: {
    label: 'Hydrophobic Tail', color: '#F6E7C1',
    ar: 'الذيل الكاره للماء',
    desc: 'The fatty-acid chains of each phospholipid. They repel water (hydrophobic) and point toward each other inside the bilayer, away from water.',
    points: ['Fatty-acid chains (non-polar)', 'Meet in the middle of the bilayer', 'Lipophilic drugs are loaded here']
  },
  core: {
    label: 'Aqueous Core', color: '#1F8A68',
    ar: 'القلب المائي',
    desc: 'The water-filled interior of the liposome. Hydrophilic (water-soluble) drugs are encapsulated here, protected from the outside environment.',
    points: ['Filled with aqueous buffer', 'Holds hydrophilic drugs', 'Protected from enzymes and degradation']
  },
  cholesterol: {
    label: 'Cholesterol', color: '#C9A15A',
    ar: 'الكوليسترول',
    desc: 'A sterol molecule inserted between the phospholipid tails. It modulates membrane fluidity, improves stability and reduces drug leakage from the vesicle.',
    points: ['Sits between the fatty tails', 'Buffers fluidity at different temperatures', 'Reduces permeability and leakage']
  }
};

/* ---------- Renderer / Scene ---------- */
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.localClippingEnabled = true;
wrap.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const CAM_HOME = new THREE.Vector3(0, 1.2, 7.2);
camera.position.copy(CAM_HOME);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3.5;
controls.maxDistance = 14;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(5, 6, 8);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0xC4A46A, 30, 30);
rimLight.position.set(-6, -3, -5);
scene.add(rimLight);

/* ---------- Materials ---------- */
function makeMat(color, opts) {
  return new THREE.MeshStandardMaterial(Object.assign({
    color, roughness: 0.32, metalness: 0.08,
    emissive: color, emissiveIntensity: 0.12
  }, opts || {}));
}
const headMat = makeMat(0xE4C99A);
const tailMat = makeMat(0xF6E7C1, { roughness: 0.45 });
const cholMat = makeMat(0xC9A15A, { roughness: 0.25 });
const coreMat = new THREE.MeshStandardMaterial({
  color: 0x1F8A68, transparent: true, opacity: 0.18,
  roughness: 0.1, metalness: 0, emissive: 0x1F8A68, emissiveIntensity: 0.25,
  side: THREE.DoubleSide, depthWrite: false
});
const waterMat = makeMat(0x7DCEB0, { roughness: 0.15 });
const drugCoreMat = makeMat(0xF0D48A, { roughness: 0.2 });
const drugBilayerMat = makeMat(0xC9845A, { roughness: 0.2 });

const liposome = new THREE.Group();
scene.add(liposome);

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

function orientedCylinder(from, to, radius) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, len, 6);
  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const m = new THREE.Matrix4().compose(mid, quat, new THREE.Vector3(1, 1, 1));
  geo.applyMatrix4(m);
  return geo;
}

function sphereAt(pos, radius, seg) {
  const geo = new THREE.SphereGeometry(radius, seg || 10, seg || 10);
  geo.translate(pos.x, pos.y, pos.z);
  return geo;
}

/* ---------- Build the liposome ---------- */
const R_OUT = 2.05, R_IN = 1.78, R_MID = 1.92;
const N_LIPIDS = 620;
const dirs = fibonacciSphere(N_LIPIDS);

const headGeos = [], tailGeos = [];
const up = new THREE.Vector3(0, 1, 0);

dirs.forEach(d => {
  // Outer leaflet: head out, tails in
  const headOut = d.clone().multiplyScalar(R_OUT);
  headGeos.push(sphereAt(headOut, 0.078));
  // Inner leaflet: head in, tails out
  const headIn = d.clone().multiplyScalar(R_IN);
  headGeos.push(sphereAt(headIn, 0.078));

  // Two tails per lipid, slightly offset perpendicular to the radius
  const perp = new THREE.Vector3().crossVectors(d, up).normalize();
  if (perp.lengthSq() < 0.01) perp.set(1, 0, 0);
  [-0.035, 0.035].forEach(off => {
    const o = perp.clone().multiplyScalar(off);
    tailGeos.push(orientedCylinder(
      d.clone().multiplyScalar(R_OUT - 0.03).add(o),
      d.clone().multiplyScalar(R_IN + 0.02).add(o), 0.026));
    tailGeos.push(orientedCylinder(
      d.clone().multiplyScalar(R_IN + 0.03).add(o),
      d.clone().multiplyScalar(R_OUT - 0.02).add(o), 0.026));
  });
});

const headsMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(headGeos), headMat);
const tailsMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(tailGeos), tailMat);
headsMesh.userData.part = 'head';
tailsMesh.userData.part = 'tail';
liposome.add(headsMesh, tailsMesh);

/* Cholesterol — embedded between the tails */
const cholGeos = [];
fibonacciSphere(130).forEach(d => {
  cholGeos.push(sphereAt(d.clone().multiplyScalar(R_MID + (Math.random() - 0.5) * 0.05), 0.055, 8));
});
const cholMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(cholGeos), cholMat);
cholMesh.userData.part = 'cholesterol';
liposome.add(cholMesh);

/* Aqueous core + water molecules */
const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(R_IN - 0.06, 40, 40), coreMat);
coreMesh.userData.part = 'core';
liposome.add(coreMesh);

const waterGeos = [];
for (let i = 0; i < 170; i++) {
  const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * (R_IN - 0.25));
  waterGeos.push(sphereAt(v, 0.045, 8));
}
const waterMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(waterGeos), waterMat);
waterMesh.userData.part = 'core';
liposome.add(waterMesh);

/* Drug-location overlay (hidden by default) */
const drugCoreGeos = [];
for (let i = 0; i < 60; i++) {
  const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * (R_IN - 0.35));
  drugCoreGeos.push(sphereAt(v, 0.07, 8));
}
const drugCoreMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(drugCoreGeos), drugCoreMat);

const drugBilayerGeos = [];
fibonacciSphere(90).forEach(d => {
  drugBilayerGeos.push(sphereAt(d.clone().multiplyScalar(R_MID), 0.065, 8));
});
const drugBilayerMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(drugBilayerGeos), drugBilayerMat);
drugCoreMesh.visible = drugBilayerMesh.visible = false;
liposome.add(drugCoreMesh, drugBilayerMesh);

/* Soft glow sprite behind the liposome */
const glowCanvas = document.createElement('canvas');
glowCanvas.width = glowCanvas.height = 256;
const gctx = glowCanvas.getContext('2d');
const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
grad.addColorStop(0, 'rgba(228,201,154,0.34)');
grad.addColorStop(1, 'rgba(228,201,154,0)');
gctx.fillStyle = grad;
gctx.fillRect(0, 0, 256, 256);
const glow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: new THREE.CanvasTexture(glowCanvas), transparent: true, depthWrite: false
}));
glow.scale.set(9, 9, 1);
scene.add(glow);

/* ---------- Selection / highlighting ---------- */
const partMeshes = {
  head: [headsMesh],
  tail: [tailsMesh],
  bilayer: [headsMesh, tailsMesh],
  cholesterol: [cholMesh],
  core: [coreMesh, waterMesh]
};
const allMats = [headMat, tailMat, cholMat, coreMat, waterMat];
let selected = null;

function clearHighlight() {
  allMats.forEach(m => { m.emissiveIntensity = m === coreMat ? 0.25 : 0.12; });
}
function highlight(key) {
  clearHighlight();
  if (!key || !partMeshes[key]) return;
  const mats = new Set(partMeshes[key].map(m => m.material));
  mats.forEach(m => { m.emissiveIntensity = 0.85; });
}

const infoEl = document.getElementById('part-info');
function selectPart(key) {
  selected = key;
  highlight(key);
  document.querySelectorAll('.part-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.part === key));
  if (!key) {
    infoEl.innerHTML = '<h3>Select a part</h3><p>Click any part of the 3D model — or use the list — to see what it does.</p>';
    return;
  }
  const p = PARTS[key];
  infoEl.innerHTML = `
    <h3><span class="part-dot" style="display:inline-block;background:${p.color}"></span> ${p.label}</h3>
    <p>${p.desc}</p>
    <ul>${p.points.map(pt => `<li>${pt}</li>`).join('')}</ul>
    <p class="ar">${p.ar}</p>`;
}

/* Sidebar part buttons */
const partButtonsEl = document.getElementById('part-buttons');
partButtonsEl.innerHTML = Object.entries(PARTS).map(([key, p]) => `
  <button class="part-btn" data-part="${key}">
    <span class="part-dot" style="background:${p.color}"></span>${p.label}
  </button>`).join('');
partButtonsEl.querySelectorAll('.part-btn').forEach(btn => {
  btn.addEventListener('click', () => selectPart(btn.dataset.part === selected ? null : btn.dataset.part));
});

/* ---------- Raycasting (click, not drag) ---------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downPos = null;

renderer.domElement.addEventListener('pointerdown', e => { downPos = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downPos) return;
  const moved = Math.hypot(e.clientX - downPos[0], e.clientY - downPos[1]);
  downPos = null;
  if (moved > 6) return; // it was a drag
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([headsMesh, tailsMesh, cholMesh, coreMesh, waterMesh], false);
  selectPart(hits.length ? hits[0].object.userData.part : null);
});

/* ---------- Controls: cutaway / drugs / layers / rotate / reset ---------- */
const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
let cutaway = false;
function applyClipping() {
  allMats.concat([drugCoreMat, drugBilayerMat]).forEach(m => {
    m.clippingPlanes = cutaway ? [clipPlane] : null;
    m.needsUpdate = true;
  });
}
const btnCutaway = document.getElementById('btn-cutaway');
btnCutaway.addEventListener('click', () => {
  cutaway = !cutaway;
  btnCutaway.classList.toggle('active', cutaway);
  applyClipping();
});

const btnDrugs = document.getElementById('btn-drugs');
btnDrugs.addEventListener('click', () => {
  const on = !drugCoreMesh.visible;
  drugCoreMesh.visible = drugBilayerMesh.visible = on;
  btnDrugs.classList.toggle('active', on);
});

const btnRotate = document.getElementById('btn-rotate');
btnRotate.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  btnRotate.classList.toggle('active', controls.autoRotate);
});

document.getElementById('btn-reset-view').addEventListener('click', () => {
  camera.position.copy(CAM_HOME);
  controls.target.set(0, 0, 0);
  controls.update();
});

const layerMap = {
  'layer-heads': headsMesh,
  'layer-tails': tailsMesh,
  'layer-chol': cholMesh,
  'layer-core': null // handled specially (core + water)
};
Object.entries(layerMap).forEach(([id, mesh]) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('change', () => {
    if (mesh) mesh.visible = el.checked;
    else { coreMesh.visible = waterMesh.visible = el.checked; }
  });
});

/* ---------- Resize & render loop ---------- */
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
  const section = document.getElementById('section-explorer');
  if (!section || !section.classList.contains('active')) return; // pause off-screen
  const t = clock.getElapsedTime();
  liposome.position.y = Math.sin(t * 0.8) * 0.08; // gentle float
  controls.update();
  renderer.render(scene, camera);
}
animate();
