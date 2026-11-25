import * as THREE from './vendor/three.module.min.js';

(() => {
  const viewport = document.getElementById('diagram-viewport');
  if (!viewport) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'liposome-3d-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('tabindex', '-1');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.localClippingEnabled = true;
  } catch (error) {
    // Keep the interactive SVG model as a fallback on browsers without WebGL.
    console.info('LIPOVERSE: WebGL is unavailable; using the schematic model.', error);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.set(0, 0, 5.65);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0x9beee5, 0x0a1725, 1.2));
  const keyLight = new THREE.PointLight(0x6df1dc, 48, 14, 1.8);
  keyLight.position.set(-3.7, 3.8, 4.8);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x9383ff, 38, 12, 1.9);
  rimLight.position.set(3.4, -.6, -3.2);
  scene.add(rimLight);
  const fillLight = new THREE.PointLight(0x7cc8ed, 18, 10, 2);
  fillLight.position.set(1.5, -3.4, 4.1);
  scene.add(fillLight);

  const orientation = new THREE.Group();
  orientation.rotation.set(-.09, .12, -.035);
  scene.add(orientation);
  const rotor = new THREE.Group();
  orientation.add(rotor);

  const materials = {
    shell: new THREE.MeshPhysicalMaterial({ color: 0x68ead8, transparent: true, opacity: .13, roughness: .22, metalness: .03, clearcoat: .75, clearcoatRoughness: .18, side: THREE.DoubleSide, depthWrite: false, emissive: 0x103d3a, emissiveIntensity: .16 }),
    membrane: new THREE.MeshPhysicalMaterial({ color: 0x39cabc, transparent: true, opacity: .09, roughness: .31, metalness: .02, side: THREE.DoubleSide, depthWrite: false, emissive: 0x0c3637, emissiveIntensity: .12 }),
    head: new THREE.MeshStandardMaterial({ color: 0x70eedb, roughness: .27, metalness: .04, emissive: 0x0e4844, emissiveIntensity: .1 }),
    tail: new THREE.MeshStandardMaterial({ color: 0xaaa0f4, roughness: .36, metalness: .05, emissive: 0x272258, emissiveIntensity: .12 }),
    cholesterol: new THREE.MeshStandardMaterial({ color: 0xe9d58f, roughness: .28, metalness: .12, emissive: 0x645323, emissiveIntensity: .16 }),
    core: new THREE.MeshPhysicalMaterial({ color: 0x123d4b, transparent: true, opacity: .58, depthWrite: false, roughness: .31, metalness: .04, clearcoat: .52, clearcoatRoughness: .23, emissive: 0x071c2a, emissiveIntensity: .12 }),
    payload: new THREE.MeshStandardMaterial({ color: 0xb5a1ff, roughness: .25, metalness: .03, emissive: 0x5d49b7, emissiveIntensity: .6 })
  };

  const layerObjects = { bilayer: [], cholesterol: [], core: [], payload: [] };
  const componentObjects = { head: [], tail: [], bilayer: [], cholesterol: [], core: [] };
  const interactiveMeshes = [];

  function setPart(mesh, part) {
    mesh.userData.part = part;
    interactiveMeshes.push(mesh);
    return mesh;
  }
  function addSphere(geometry, material, position, parent, scale = 1, part) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    if (typeof scale === 'number') mesh.scale.setScalar(scale);
    else mesh.scale.copy(scale);
    if (part) setPart(mesh, part);
    parent.add(mesh);
    return mesh;
  }

  // The inner aqueous compartment sits behind the lipids, so the transparent
  // membrane reveals a real volumetric interior rather than a flat drawing.
  const coreMesh = addSphere(new THREE.SphereGeometry(1.31, 48, 40), materials.core, new THREE.Vector3(), rotor, 1, 'core');
  coreMesh.renderOrder = 0;
  layerObjects.core.push(coreMesh);
  componentObjects.core.push(coreMesh);

  const membraneMesh = addSphere(new THREE.SphereGeometry(1.73, 56, 48), materials.membrane, new THREE.Vector3(), rotor, 1, 'bilayer');
  membraneMesh.renderOrder = 1;
  layerObjects.bilayer.push(membraneMesh);
  componentObjects.bilayer.push(membraneMesh);
  const shellMesh = addSphere(new THREE.SphereGeometry(1.82, 56, 48), materials.shell, new THREE.Vector3(), rotor, 1, 'bilayer');
  shellMesh.renderOrder = 5;
  layerObjects.bilayer.push(shellMesh);
  componentObjects.bilayer.push(shellMesh);

  const headGeometry = new THREE.SphereGeometry(1, 12, 10);
  const tailGeometry = new THREE.CylinderGeometry(.021, .027, .19, 6, 1, false);
  const cholesterolGeometry = new THREE.SphereGeometry(1, 9, 8);
  const headCount = 190;
  const outerHeads = new THREE.InstancedMesh(headGeometry, materials.head, headCount);
  const innerHeads = new THREE.InstancedMesh(headGeometry, materials.head, headCount);
  const outerTails = new THREE.InstancedMesh(tailGeometry, materials.tail, headCount);
  const innerTails = new THREE.InstancedMesh(tailGeometry, materials.tail, headCount);
  const dummy = new THREE.Object3D();
  const axis = new THREE.Vector3(0, 1, 0);

  function fibonacciDirection(index, count) {
    const y = 1 - (2 * (index + .5)) / count;
    const horizontal = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    return new THREE.Vector3(Math.cos(angle) * horizontal, y, Math.sin(angle) * horizontal).normalize();
  }

  for (let i = 0; i < headCount; i += 1) {
    const direction = fibonacciDirection(i, headCount);
    const tangent = new THREE.Vector3().crossVectors(direction, axis);
    if (tangent.lengthSq() < .01) tangent.set(1, 0, 0);
    tangent.normalize();

    dummy.position.copy(direction).multiplyScalar(1.77);
    dummy.quaternion.identity();
    dummy.scale.setScalar(i % 9 === 0 ? .078 : .064);
    dummy.updateMatrix();
    outerHeads.setMatrixAt(i, dummy.matrix);

    dummy.position.copy(direction).multiplyScalar(1.35);
    dummy.scale.setScalar(i % 7 === 0 ? .069 : .057);
    dummy.updateMatrix();
    innerHeads.setMatrixAt(i, dummy.matrix);

    const outerTailDirection = direction.clone().negate();
    dummy.position.copy(direction).multiplyScalar(1.59).addScaledVector(tangent, .018);
    dummy.quaternion.setFromUnitVectors(axis, outerTailDirection);
    dummy.scale.set(.78, 1, .78);
    dummy.updateMatrix();
    outerTails.setMatrixAt(i, dummy.matrix);

    dummy.position.copy(direction).multiplyScalar(1.48).addScaledVector(tangent, -.018);
    dummy.quaternion.setFromUnitVectors(axis, direction);
    dummy.scale.set(.72, 1, .72);
    dummy.updateMatrix();
    innerTails.setMatrixAt(i, dummy.matrix);
  }
  [outerHeads, innerHeads].forEach((mesh) => mesh.instanceMatrix.needsUpdate = true);
  [outerTails, innerTails].forEach((mesh) => mesh.instanceMatrix.needsUpdate = true);
  setPart(outerHeads, 'head');
  setPart(innerHeads, 'head');
  setPart(outerTails, 'tail');
  setPart(innerTails, 'tail');
  [outerHeads, innerHeads, outerTails, innerTails].forEach((mesh) => {
    mesh.renderOrder = mesh.userData.part === 'tail' ? 2 : 4;
    rotor.add(mesh);
    layerObjects.bilayer.push(mesh);
    componentObjects[mesh.userData.part].push(mesh);
    if (mesh.userData.part === 'head') componentObjects.bilayer.push(mesh);
  });

  const cholesterolCount = 28;
  const cholesterolMesh = new THREE.InstancedMesh(cholesterolGeometry, materials.cholesterol, cholesterolCount);
  for (let i = 0; i < cholesterolCount; i += 1) {
    const direction = fibonacciDirection((i * 13 + 17) % headCount, headCount);
    const tangent = new THREE.Vector3().crossVectors(direction, axis);
    if (tangent.lengthSq() < .01) tangent.set(1, 0, 0);
    tangent.normalize();
    dummy.position.copy(direction).multiplyScalar(1.54).addScaledVector(tangent, (i % 2 ? 1 : -1) * .045);
    dummy.quaternion.setFromUnitVectors(axis, direction);
    dummy.scale.set(.032, .075, .032);
    dummy.updateMatrix();
    cholesterolMesh.setMatrixAt(i, dummy.matrix);
  }
  cholesterolMesh.instanceMatrix.needsUpdate = true;
  cholesterolMesh.renderOrder = 3;
  setPart(cholesterolMesh, 'cholesterol');
  rotor.add(cholesterolMesh);
  layerObjects.cholesterol.push(cholesterolMesh);
  componentObjects.cholesterol.push(cholesterolMesh);

  const cargoCount = 20;
  const cargoGeometry = new THREE.SphereGeometry(1, 12, 10);
  const cargoMesh = new THREE.InstancedMesh(cargoGeometry, materials.payload, cargoCount);
  for (let i = 0; i < cargoCount; i += 1) {
    const direction = fibonacciDirection(i * 3 + 8, cargoCount * 3);
    const radius = .3 + (i % 4) * .18;
    dummy.position.copy(direction).multiplyScalar(radius);
    dummy.quaternion.identity();
    dummy.scale.setScalar(i % 5 === 0 ? .064 : .046);
    dummy.updateMatrix();
    cargoMesh.setMatrixAt(i, dummy.matrix);
  }
  cargoMesh.instanceMatrix.needsUpdate = true;
  cargoMesh.renderOrder = 6;
  setPart(cargoMesh, 'core');
  rotor.add(cargoMesh);
  layerObjects.payload.push(cargoMesh);
  componentObjects.core.push(cargoMesh);

  // A faint orbit gives the vesicle depth cues without competing with the model.
  const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x81e8dc, transparent: true, opacity: .16, side: THREE.DoubleSide });
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.1, .003, 4, 160), orbitMaterial);
  orbit.rotation.set(.84, .26, -.28);
  rotor.add(orbit);

  const cutPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
  function syncCutaway() {
    const active = document.getElementById('cutaway-toggle')?.getAttribute('aria-pressed') === 'true';
    Object.values(materials).forEach((material) => {
      material.clippingPlanes = active ? [cutPlane] : [];
      material.clipIntersection = false;
      material.needsUpdate = true;
    });
  }
  function syncLayers() {
    Object.entries(layerObjects).forEach(([key, objects]) => {
      const visible = document.querySelector(`[data-layer-toggle="${key}"]`)?.getAttribute('aria-pressed') !== 'false';
      objects.forEach((object) => { object.visible = visible; });
    });
  }
  function highlightPart(part) {
    Object.entries(componentObjects).forEach(([key, objects]) => {
      objects.forEach((object) => {
        const material = object.material;
        if (!material || !('emissive' in material)) return;
        const active = key === part || (part === 'bilayer' && key === 'head');
        material.emissiveIntensity = active ? .42 : (material === materials.payload ? .6 : .1);
      });
    });
  }
  document.querySelectorAll('[data-layer-toggle]').forEach((button) => button.addEventListener('click', syncLayers));
  document.getElementById('cutaway-toggle')?.addEventListener('click', syncCutaway);
  document.querySelectorAll('[data-part-select]').forEach((button) => button.addEventListener('click', () => highlightPart(button.dataset.partSelect)));
  syncLayers();
  syncCutaway();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerStart = null;
  let dragging = false;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  const zoomButtons = { in: document.getElementById('zoom-in'), out: document.getElementById('zoom-out'), reset: document.getElementById('zoom-reset') };
  let cameraZ = 5.65;
  function setCameraZoom(nextZ) {
    cameraZ = Math.max(4.35, Math.min(7, nextZ));
    camera.position.z = cameraZ;
    camera.updateProjectionMatrix();
  }
  zoomButtons.in?.addEventListener('click', () => setCameraZoom(cameraZ - .35));
  zoomButtons.out?.addEventListener('click', () => setCameraZoom(cameraZ + .35));
  zoomButtons.reset?.addEventListener('click', () => {
    setCameraZoom(5.65);
    orientation.rotation.set(-.09, .12, -.035);
    rotor.rotation.set(0, 0, 0);
    highlightPart('head');
  });

  function selectAtPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    if (!hits.length) return;
    let part = hits[0].object.userData.part;
    if (Math.abs(pointer.x) < .2 && Math.abs(pointer.y) < .2) part = 'core';
    document.querySelector(`[data-part-select="${part}"]`)?.click();
  }
  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('button')) return;
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    dragging = false;
    try { viewport.setPointerCapture(event.pointerId); } catch (_) { /* not supported */ }
  });
  viewport.addEventListener('pointermove', (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragging = true;
    if (!dragging) return;
    rotor.rotation.y += dx * .008;
    rotor.rotation.x = Math.max(-.72, Math.min(.72, rotor.rotation.x + dy * .006));
    pointerStart.x = event.clientX;
    pointerStart.y = event.clientY;
  });
  viewport.addEventListener('pointerup', (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    if (!dragging) selectAtPoint(event.clientX, event.clientY);
    pointerStart = null;
    dragging = false;
  });
  viewport.addEventListener('pointercancel', () => { pointerStart = null; dragging = false; });

  const resizeObserver = new ResizeObserver(() => {
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(viewport);
  viewport.insertBefore(canvas, viewport.firstChild);
  viewport.classList.add('has-3d');

  let previousTime = 0;
  let frameHandle = 0;
  function render(time) {
    frameHandle = window.requestAnimationFrame(render);
    const delta = Math.min((time - previousTime) / 1000 || 0, .05);
    previousTime = time;
    if (!reducedMotion && !dragging) rotor.rotation.y += delta * .075;
    renderer.render(scene, camera);
  }
  frameHandle = window.requestAnimationFrame(render);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frameHandle);
    } else if (!frameHandle) {
      previousTime = 0;
      frameHandle = window.requestAnimationFrame(render);
    }
  });
  window.addEventListener('beforeunload', () => {
    window.cancelAnimationFrame(frameHandle);
    resizeObserver.disconnect();
    renderer.dispose();
  }, { once: true });
})();
