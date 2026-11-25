/* ============================================================
   LIPOVERSE — builder.js (Three.js parametric liposome builder)
   Pick a type · set bilayers · cholesterol · PEG · drug —
   and watch the 3D model, composition chips and the
   educational "predicted behavior" scores update live.
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const wrap = document.getElementById('builder-canvas-wrap');
if (wrap) {

  /* ================= DATA ================= */
  const DRUGS = {
    doxorubicin: { name: 'Doxorubicin HCl', type: 'hydrophilic', gradient: true,
      note: 'ammonium-sulfate gradient remote loading (as in Doxil®)' },
    cisplatin: { name: 'Cisplatin', type: 'hydrophilic', gradient: false,
      note: 'passive encapsulation — modest efficiency' },
    methotrexate: { name: 'Methotrexate', type: 'hydrophilic', gradient: false,
      note: 'passive encapsulation — modest efficiency' },
    paclitaxel: { name: 'Paclitaxel', type: 'lipophilic', gradient: false,
      note: 'partitions into the bilayer fatty-acid core' },
    curcumin: { name: 'Curcumin', type: 'lipophilic', gradient: false,
      note: 'partitions into the bilayer fatty-acid core' },
    amphotericin: { name: 'Amphotericin B', type: 'lipophilic', gradient: false,
      note: 'partitions into the bilayer (as in AmBisome®)' }
  };

  const TYPE_PRESETS = {
    SUV: { r: 1.3, layers: 1, size: '20–100 nm', name: 'Small Unilamellar Vesicle',
      note: 'SUV — Small Unilamellar Vesicle · 20–100 nm · one bilayer. Small, uniform, small drug capacity.',
      behavior: 'Small and uniform — easy to characterize, but low drug-carrying capacity per particle.' },
    LUV: { r: 1.85, layers: 1, size: '100–1000 nm', name: 'Large Unilamellar Vesicle',
      note: 'LUV — Large Unilamellar Vesicle · 100–1000 nm · one bilayer. Bigger cargo space, widely used.',
      behavior: 'Large single-bilayer vesicle — high aqueous-core cargo capacity.' },
    GUV: { r: 2.3, layers: 1, size: '>1 µm', name: 'Giant Unilamellar Vesicle',
      note: 'GUV — Giant Unilamellar Vesicle · >1 µm · one bilayer. Cell-sized, visible under a light microscope.',
      behavior: 'Cell-sized model membrane — a biophysics tool, far too large for IV drug delivery.' },
    MLV: { r: 2.05, layers: 4, size: '0.5–10 µm', name: 'Multilamellar Vesicle',
      note: 'MLV — Multilamellar Vesicle · 0.5–10 µm · many concentric bilayers (onion-like).',
      behavior: 'Onion-like concentric bilayers — simple thin-film prep, sustained release, lower EE.' },
    MVV: { r: 2.2, layers: 1, size: '100–1000 nm', name: 'Multivesicular Vesicle',
      note: 'MVV — Multivesicular Vesicle · 100–1000 nm · nested vesicles inside one vesicle.',
      behavior: 'Nested vesicles — very high total internal volume for high-dose payloads.' }
  };

  const LAYER_GAP = 0.46;      // radial distance between consecutive bilayers
  const BILAYER_W = 0.28;      // thickness of one bilayer leaflet pair band
  const state = { type: 'SUV', bilayers: 1, cholesterol: 30, peg: true, drug: 'doxorubicin' };

  /* ================= SCENE ================= */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.localClippingEnabled = true;
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const CAM_HOME = new THREE.Vector3(0, 1.4, 8.4);
  camera.position.copy(CAM_HOME);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 4;
  controls.maxDistance = 15;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.4;

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(5, 6, 8);
  scene.add(keyLight);
  const rim = new THREE.PointLight(0x20BDB0, 25, 30);
  rim.position.set(-6, -3, -5);
  scene.add(rim);

  /* ================= MATERIALS ================= */
  const headMat = new THREE.MeshStandardMaterial({ color: 0x20BDB0, roughness: 0.32, metalness: 0.08, emissive: 0x20BDB0, emissiveIntensity: 0.16 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x8BE7E0, roughness: 0.45, metalness: 0.05, emissive: 0x8BE7E0, emissiveIntensity: 0.12 });
  const cholMat = new THREE.MeshStandardMaterial({ color: 0xffc857, roughness: 0.22, emissive: 0xffc857, emissiveIntensity: 0.3 });
  const pegMat = new THREE.MeshStandardMaterial({ color: 0x8affd9, roughness: 0.35, emissive: 0x2dffc3, emissiveIntensity: 0.35 });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x4da3ff, transparent: true, opacity: 0.17, roughness: 0.1, emissive: 0x4da3ff, emissiveIntensity: 0.3, side: THREE.DoubleSide, depthWrite: false });
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x6db9ff, roughness: 0.15, transparent: true, opacity: 0.7 });
  const shellOuter = new THREE.MeshStandardMaterial({ color: 0x20BDB0, transparent: true, opacity: 0.34, roughness: 0.3, emissive: 0x20BDB0, emissiveIntensity: 0.25, side: THREE.DoubleSide, depthWrite: false });
  const shellInner = new THREE.MeshStandardMaterial({ color: 0x8BE7E0, transparent: true, opacity: 0.22, roughness: 0.3, emissive: 0x8BE7E0, emissiveIntensity: 0.2, side: THREE.DoubleSide, depthWrite: false });
  const vesicleMat = new THREE.MeshStandardMaterial({ color: 0x20BDB0, transparent: true, opacity: 0.55, roughness: 0.3, emissive: 0x20BDB0, emissiveIntensity: 0.4, side: THREE.DoubleSide });
  const vesicleCoreMat = new THREE.MeshStandardMaterial({ color: 0x4da3ff, transparent: true, opacity: 0.2, emissive: 0x4da3ff, emissiveIntensity: 0.35, depthWrite: false });
  const drugHydroMat = new THREE.MeshStandardMaterial({ color: 0xffc857, roughness: 0.2, emissive: 0xffb62e, emissiveIntensity: 0.8 });
  const drugLipoMat = new THREE.MeshStandardMaterial({ color: 0xff8a5c, roughness: 0.2, emissive: 0xff6a3d, emissiveIntensity: 0.8 });
  const ALL_MATS = [headMat, tailMat, cholMat, pegMat, coreMat, waterMat, shellOuter, shellInner, vesicleMat, vesicleCoreMat, drugHydroMat, drugLipoMat];

  const CLIP = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  let cutaway = false;

  /* ================= GEOMETRY HELPERS ================= */
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
    const geo = new THREE.SphereGeometry(radius, seg || 8, seg || 8);
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
  function orientedCone(dir, dist, height, radius) {
    const geo = new THREE.ConeGeometry(radius, height, 6);
    const mid = dir.clone().multiplyScalar(dist + height / 2);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    geo.applyMatrix4(new THREE.Matrix4().compose(mid, quat, new THREE.Vector3(1, 1, 1)));
    return geo;
  }
  // Deterministic pseudo-random for stable MVV vesicle placement
  function seeded(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  /* ================= BUILD / REBUILD ================= */
  const liposome = new THREE.Group();
  scene.add(liposome);

  function outerRadius() {
    const preset = TYPE_PRESETS[state.type];
    const L = state.bilayers;
    return Math.max(preset.r, 0.62 + L * LAYER_GAP + 0.35);
  }
  function layerOuter(i, R) { return R - i * LAYER_GAP; }

  function disposeChildren() {
    while (liposome.children.length) {
      const child = liposome.children.pop();
      child.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); });
    }
  }

  function rebuild() {
    disposeChildren();
    const L = state.bilayers;
    const R = outerRadius();
    const preset = TYPE_PRESETS[state.type];
    const dirs = fibonacciSphere(240);
    const up = new THREE.Vector3(0, 1, 0);

    /* --- Outer bilayer: full detail (heads + tails) --- */
    const headGeos = [], tailGeos = [];
    dirs.forEach(d => {
      headGeos.push(sphereAt(d.clone().multiplyScalar(R), 0.08));
      headGeos.push(sphereAt(d.clone().multiplyScalar(R - BILAYER_W), 0.08));
      const perp = new THREE.Vector3().crossVectors(d, up).normalize();
      if (perp.lengthSq() < 0.01) perp.set(1, 0, 0);
      [-0.034, 0.034].forEach(off => {
        const o = perp.clone().multiplyScalar(off);
        tailGeos.push(orientedCylinder(d.clone().multiplyScalar(R - 0.03).add(o), d.clone().multiplyScalar(R - BILAYER_W + 0.03).add(o), 0.024));
        tailGeos.push(orientedCylinder(d.clone().multiplyScalar(R - BILAYER_W + 0.03).add(o), d.clone().multiplyScalar(R - 0.03).add(o), 0.024));
      });
    });
    liposome.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(headGeos), headMat));
    liposome.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(tailGeos), tailMat));

    /* --- Inner bilayers: translucent shells --- */
    for (let i = 1; i < L; i++) {
      const rOut = layerOuter(i, R);
      liposome.add(new THREE.Mesh(new THREE.SphereGeometry(rOut, 40, 40), shellOuter));
      liposome.add(new THREE.Mesh(new THREE.SphereGeometry(rOut - BILAYER_W, 40, 40), shellInner));
    }

    /* --- Aqueous core --- */
    const innerOuter = layerOuter(L - 1, R);
    const coreR = Math.max(0.32, innerOuter - BILAYER_W - 0.08);
    liposome.add(new THREE.Mesh(new THREE.SphereGeometry(coreR, 36, 36), coreMat));

    const waterGeos = [];
    const rnd = seeded(42);
    for (let i = 0; i < 80; i++) {
      const v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1)
        .normalize().multiplyScalar(Math.cbrt(rnd()) * Math.max(0.2, coreR - 0.14));
      waterGeos.push(sphereAt(v, 0.045, 6));
    }
    liposome.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(waterGeos), waterMat));

    /* --- Cholesterol (outer bilayer + a little in inner layers) --- */
    const cholGeos = [];
    const nChol = Math.round((state.cholesterol / 50) * 150);
    if (nChol > 0) {
      fibonacciSphere(nChol).forEach(d => {
        cholGeos.push(sphereAt(d.clone().multiplyScalar(R - BILAYER_W / 2), 0.055, 6));
      });
      for (let i = 1; i < L; i++) {
        const rMid = layerOuter(i, R) - BILAYER_W / 2;
        const nInner = Math.round(nChol * 0.4);
        if (nInner > 4) fibonacciSphere(nInner).forEach(d => cholGeos.push(sphereAt(d.clone().multiplyScalar(rMid), 0.05, 6)));
      }
    }
    if (cholGeos.length) liposome.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(cholGeos), cholMat));

    /* --- PEG "stealth" coating --- */
    if (state.peg) {
      const pegGeos = [];
      fibonacciSphere(110).forEach(d => pegGeos.push(orientedCone(d, R + 0.02, 0.3, 0.028)));
      liposome.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(pegGeos), pegMat));
    }

    /* --- MVV: nested unilamellar vesicles inside the core --- */
    const vesicleCenters = [];
    if (state.type === 'MVV') {
      const vrnd = seeded(7);
      for (let i = 0; i < 5; i++) {
        const dir = new THREE.Vector3(vrnd() * 2 - 1, vrnd() * 2 - 1, vrnd() * 2 - 1).normalize();
        const dist = coreR * (0.28 + vrnd() * 0.36);
        const vR = 0.3 + vrnd() * 0.16;
        const center = dir.multiplyScalar(dist);
        vesicleCenters.push({ center, vR });
        const shell = new THREE.Mesh(new THREE.SphereGeometry(vR, 22, 22), vesicleMat);
        shell.position.copy(center);
        const vCore = new THREE.Mesh(new THREE.SphereGeometry(vR * 0.68, 18, 18), vesicleCoreMat);
        vCore.position.copy(center);
        liposome.add(shell, vCore);
      }
    }

    /* --- Drug molecules --- */
    const drug = DRUGS[state.drug];
    const hydroGeos = [], lipoGeos = [];
    const drnd = seeded(99);
    const randDir = () => new THREE.Vector3(drnd() * 2 - 1, drnd() * 2 - 1, drnd() * 2 - 1).normalize();

    if (drug.type === 'hydrophilic') {
      // Core + aqueous gaps between bilayers (MLV) + inside MVV vesicles
      for (let i = 0; i < 40; i++) {
        const v = randDir().multiplyScalar(Math.cbrt(drnd()) * Math.max(0.2, coreR - 0.16));
        hydroGeos.push(sphereAt(v, 0.072, 8));
      }
      for (let i = 1; i < L; i++) {
        const gapR = layerOuter(i, R) + (LAYER_GAP - BILAYER_W) / 2; // aqueous gap midpoint
        for (let j = 0; j < 16; j++) {
          hydroGeos.push(sphereAt(randDir().multiplyScalar(gapR), 0.055, 6));
        }
      }
      vesicleCenters.forEach(({ center, vR }) => {
        for (let j = 0; j < 8; j++) {
          const v = randDir().multiplyScalar(drnd() * vR * 0.55).add(center);
          hydroGeos.push(sphereAt(v, 0.05, 6));
        }
      });
    } else {
      // Lipophilic: inside every bilayer band, between the tails
      for (let i = 0; i < L; i++) {
        const midR = layerOuter(i, R) - BILAYER_W / 2;
        const n = i === 0 ? 60 : 36;
        for (let j = 0; j < n; j++) {
          lipoGeos.push(sphereAt(randDir().multiplyScalar(midR + (drnd() - 0.5) * 0.1), 0.06, 8));
        }
      }
    }
    if (hydroGeos.length) liposome.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(hydroGeos), drugHydroMat));
    if (lipoGeos.length) liposome.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(lipoGeos), drugLipoMat));

    applyClipping();
  }

  function applyClipping() {
    ALL_MATS.forEach(m => { m.clippingPlanes = cutaway ? [CLIP] : null; m.needsUpdate = true; });
  }

  /* Glow sprite */
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 256;
  const gctx = glowCanvas.getContext('2d');
  const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(32,189,176,0.32)');
  grad.addColorStop(1, 'rgba(32,189,176,0)');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 256, 256);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), transparent: true, depthWrite: false }));
  glow.scale.set(10.5, 10.5, 1);
  scene.add(glow);

  /* ================= PREDICTED BEHAVIOR (educational heuristics) ================= */
  const clampScore = v => Math.max(3, Math.min(97, Math.round(v)));

  function predict() {
    const chol = state.cholesterol, L = state.bilayers;
    const drug = DRUGS[state.drug];
    const stability = clampScore(
      36 + chol * 0.85 + (L - 1) * 7 + (state.peg ? 5 : 0) +
      (state.type === 'MLV' ? 8 : 0) + (state.type === 'MVV' ? 5 : 0));
    const circulation = clampScore(
      24 + (state.peg ? 36 : 0) + chol * 0.22 +
      (state.type === 'SUV' ? 9 : 0) + (state.type === 'LUV' ? 4 : 0) -
      (state.type === 'GUV' ? 10 : 0) + (state.type === 'MLV' ? 4 : 0));
    const leakage = clampScore(
      84 - chol * 1.15 - (L - 1) * 9 - (drug.gradient ? 12 : 0) - (state.type === 'MLV' ? 8 : 0));
    const ee = clampScore(
      drug.type === 'lipophilic'
        ? 64 + chol * 0.32 + (L - 1) * 2.5
        : drug.gradient
          ? 80 + chol * 0.25
          : 34 + chol * 0.38 + (L - 1) * 4 + (state.type === 'MLV' ? 14 : 0) + (state.type === 'MVV' ? 10 : 0));
    return { stability, circulation, ee, leakage };
  }

  const propEls = {
    stability: [document.getElementById('prop-stability'), document.getElementById('prop-stability-val')],
    circulation: [document.getElementById('prop-circulation'), document.getElementById('prop-circulation-val')],
    ee: [document.getElementById('prop-ee'), document.getElementById('prop-ee-val')],
    leakage: [document.getElementById('prop-leakage'), document.getElementById('prop-leakage-val')]
  };
  const levelWord = (v, invert) => {
    const hi = v >= 70, mid = v >= 45;
    if (invert) return hi ? 'High risk' : mid ? 'Moderate' : 'Low risk';
    return hi ? 'High' : mid ? 'Moderate' : 'Low';
  };

  const summaryEl = document.getElementById('builder-summary');
  const chipsEl = document.getElementById('builder-chips');
  const typeNoteEl = document.getElementById('builder-type-note');
  const bilayersVal = document.getElementById('bilayers-val');
  const cholVal = document.getElementById('chol-val');
  const overrideNote = document.getElementById('builder-override-note');

  function renderReadouts() {
    const p = predict();
    propEls.stability[0].style.width = p.stability + '%';
    propEls.circulation[0].style.width = p.circulation + '%';
    propEls.ee[0].style.width = p.ee + '%';
    propEls.leakage[0].style.width = p.leakage + '%';
    propEls.stability[1].textContent = p.stability + '% · ' + levelWord(p.stability, false);
    propEls.circulation[1].textContent = p.circulation + '% · ' + levelWord(p.circulation, false);
    propEls.ee[1].textContent = p.ee + '% · ' + levelWord(p.ee, false);
    propEls.leakage[1].textContent = p.leakage + '% · ' + levelWord(p.leakage, true);

    const drug = DRUGS[state.drug];
    const L = state.bilayers;
    chipsEl.innerHTML = [
      state.type,
      L + (L === 1 ? ' bilayer' : ' bilayers'),
      'Cholesterol ' + state.cholesterol + ' mol%',
      state.peg ? 'PEG ✓' : 'No PEG',
      drug.name
    ].map(c => `<span class="chip">${c}</span>`).join('');

    const lines = [];
    lines.push(`<strong>Your formulation:</strong> ${TYPE_PRESETS[state.type].name} (${state.type}) · ${L === 1 ? 'unilamellar' : L + ' bilayers'} · cholesterol ${state.cholesterol} mol% · ${state.peg ? 'PEGylated “stealth” surface' : 'no stealth coating'} · ${drug.name} (${drug.type}${drug.gradient ? ', gradient-loadable' : ''}).`);
    if (p.stability >= 70) lines.push('A robust, cholesterol-rich membrane — good resistance to premature leakage and handling stress.');
    else if (p.stability >= 45) lines.push('Moderate membrane stability — acceptable for many uses, but watch drug leakage during storage.');
    else lines.push('A fluid, cholesterol-poor membrane — expect substantial drug leakage before reaching the target.');
    lines.push(state.peg
      ? 'PEGylation shields the surface from opsonization — expect longer circulation and reduced uptake by the liver and spleen.'
      : 'Without PEG, the immune system will rapidly mark and clear the liposomes (mononuclear phagocyte system).');
    if (drug.type === 'lipophilic') lines.push(`${drug.name} partitions into the bilayer — typically high encapsulation efficiency (${drug.note}).`);
    else if (drug.gradient) lines.push(`${drug.name} can be remotely loaded after formation (${drug.note}) — encapsulation can exceed 90% when optimized.`);
    else lines.push(`${drug.name} relies on passive loading (${drug.note}) — expect modest efficiency; consider gradient-based loading if the drug allows it.`);
    lines.push(TYPE_PRESETS[state.type].behavior);
    lines.push('Always characterize the final product: size &amp; PDI (DLS), zeta potential, encapsulation efficiency and serum-stability — don’t trust any bar chart (this one included) without data.');
    summaryEl.innerHTML = lines.map(l => `<p style="margin-bottom:8px">${l}</p>`).join('');

    typeNoteEl.textContent = TYPE_PRESETS[state.type].note;
    bilayersVal.textContent = String(L);
    cholVal.textContent = state.cholesterol + ' mol%';
    // Educational override note: SUV/LUV/GUV/MVV are unilamellar by definition
    overrideNote.hidden = !(state.bilayers > 1 && state.type !== 'MLV');
  }

  /* ================= WIRE CONTROLS ================= */
  let rebuildQueued = false;
  function queueRebuild() {
    if (rebuildQueued) return;
    rebuildQueued = true;
    requestAnimationFrame(() => { rebuildQueued = false; rebuild(); renderReadouts(); });
  }

  const typeButtons = document.querySelectorAll('#builder-type .ctrl-btn');
  const bilayersSlider = document.getElementById('builder-bilayers');
  const cholSlider = document.getElementById('builder-chol');
  const pegToggle = document.getElementById('builder-peg');
  const drugSelect = document.getElementById('builder-drug');

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.type = btn.dataset.type;
      typeButtons.forEach(b => b.classList.toggle('active', b === btn));
      // Apply the type's natural layer count (student can override with the slider)
      state.bilayers = TYPE_PRESETS[state.type].layers;
      bilayersSlider.value = String(state.bilayers);
      rebuild();
      renderReadouts();
    });
  });
  bilayersSlider.addEventListener('input', () => {
    state.bilayers = parseInt(bilayersSlider.value, 10);
    queueRebuild();
  });
  cholSlider.addEventListener('input', () => {
    state.cholesterol = parseInt(cholSlider.value, 10);
    queueRebuild();
  });
  pegToggle.addEventListener('change', () => {
    state.peg = pegToggle.checked;
    rebuild();
    renderReadouts();
  });
  drugSelect.addEventListener('change', () => {
    state.drug = drugSelect.value;
    rebuild();
    renderReadouts();
  });

  const btnCutaway = document.getElementById('builder-cutaway');
  const btnRotate = document.getElementById('builder-rotate');
  const btnReset = document.getElementById('builder-reset');
  btnCutaway.addEventListener('click', () => {
    cutaway = !cutaway;
    btnCutaway.classList.toggle('active', cutaway);
    applyClipping();
  });
  btnRotate.addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
    btnRotate.classList.toggle('active', controls.autoRotate);
  });
  btnReset.addEventListener('click', () => {
    camera.position.copy(CAM_HOME);
    controls.target.set(0, 0, 0);
    controls.update();
  });

  /* ================= RESIZE & LOOP ================= */
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
    const section = document.getElementById('section-builder');
    if (!section || !section.classList.contains('active')) return;
    const t = clock.getElapsedTime();
    liposome.position.y = Math.sin(t * 0.85) * 0.08;
    controls.update();
    renderer.render(scene, camera);
  }

  /* ================= INIT ================= */
  rebuild();
  renderReadouts();
  animate();
}
