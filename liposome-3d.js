import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const viewport = document.getElementById('diagram-viewport');
if (viewport) {
  const canvas = document.createElement('canvas');
  canvas.id = 'liposome-3d-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.localClippingEnabled = true;
  } catch (error) {
    console.info('LIPOVERSE: WebGL is unavailable; using the schematic model.', error);
    renderer = null;
  }

  if (renderer) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    const home = new THREE.Vector3(0, 0.35, 6.35);
    camera.position.copy(home);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(5, 6, 8);
    scene.add(key);
    const rim = new THREE.PointLight(0x20bdb0, 30, 30);
    rim.position.set(-6, -3, -5);
    scene.add(rim);

    const liposome = new THREE.Group();
    scene.add(liposome);

    function makeMat(color, opts) {
      return new THREE.MeshStandardMaterial(Object.assign({
        color, roughness: 0.32, metalness: 0.08, emissive: color, emissiveIntensity: 0.12
      }, opts || {}));
    }

    const headMat = makeMat(0x20bdb0);
    const tailMat = makeMat(0x8be7e0, { roughness: 0.45 });
    const cholMat = makeMat(0xffc857, { roughness: 0.25 });
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x4da3ff, transparent: true, opacity: 0.16, roughness: 0.1, metalness: 0,
      emissive: 0x4da3ff, emissiveIntensity: 0.25, side: THREE.DoubleSide, depthWrite: false
    });
    const waterMat = makeMat(0x6db9ff, { roughness: 0.15 });
    const drugMat = makeMat(0xb7a4ff, { roughness: 0.22, emissiveIntensity: 0.35 });

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
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      geo.applyMatrix4(new THREE.Matrix4().compose(mid, quat, new THREE.Vector3(1, 1, 1)));
      return geo;
    }

    function sphereAt(pos, radius, seg) {
      const geo = new THREE.SphereGeometry(radius, seg || 10, seg || 10);
      geo.translate(pos.x, pos.y, pos.z);
      return geo;
    }

    const R_OUT = 2.05;
    const R_IN = 1.78;
    const R_MID = 1.92;
    const dirs = fibonacciSphere(620);
    const headGeos = [];
    const tailGeos = [];
    const up = new THREE.Vector3(0, 1, 0);

    dirs.forEach((d) => {
      headGeos.push(sphereAt(d.clone().multiplyScalar(R_OUT), 0.078));
      headGeos.push(sphereAt(d.clone().multiplyScalar(R_IN), 0.078));
      const perp = new THREE.Vector3().crossVectors(d, up).normalize();
      if (perp.lengthSq() < 0.01) perp.set(1, 0, 0);
      [-0.035, 0.035].forEach((off) => {
        const o = perp.clone().multiplyScalar(off);
        tailGeos.push(orientedCylinder(
          d.clone().multiplyScalar(R_OUT - 0.03).add(o),
          d.clone().multiplyScalar(R_IN + 0.02).add(o),
          0.026
        ));
        tailGeos.push(orientedCylinder(
          d.clone().multiplyScalar(R_IN + 0.03).add(o),
          d.clone().multiplyScalar(R_OUT - 0.02).add(o),
          0.026
        ));
      });
    });

    const headsMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(headGeos), headMat);
    const tailsMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(tailGeos), tailMat);
    headsMesh.userData.part = 'head';
    tailsMesh.userData.part = 'tail';
    liposome.add(headsMesh, tailsMesh);

    const cholGeos = fibonacciSphere(130).map((d) => sphereAt(d.clone().multiplyScalar(R_MID + (Math.random() - 0.5) * 0.05), 0.055, 8));
    const cholMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(cholGeos), cholMat);
    cholMesh.userData.part = 'cholesterol';
    liposome.add(cholMesh);

    const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(R_IN - 0.06, 40, 40), coreMat);
    coreMesh.userData.part = 'core';
    liposome.add(coreMesh);

    const waterGeos = [];
    for (let i = 0; i < 170; i++) {
      waterGeos.push(sphereAt(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * (R_IN - 0.25)), 0.045, 8));
    }
    const waterMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(waterGeos), waterMat);
    waterMesh.userData.part = 'core';
    liposome.add(waterMesh);

    const drugGeos = [];
    for (let i = 0; i < 42; i++) {
      drugGeos.push(sphereAt(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * (R_IN - 0.4)), 0.055, 8));
    }
    const drugMesh = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(drugGeos), drugMat);
    drugMesh.userData.part = 'core';
    liposome.add(drugMesh);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 256;
    const gctx = glowCanvas.getContext('2d');
    const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(32,189,176,0.35)');
    grad.addColorStop(1, 'rgba(32,189,176,0)');
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 256, 256);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(glowCanvas), transparent: true, depthWrite: false
    }));
    glow.scale.set(9, 9, 1);
    scene.add(glow);

    const layers = {
      bilayer: [headsMesh, tailsMesh],
      cholesterol: [cholMesh],
      core: [coreMesh, waterMesh],
      payload: [drugMesh]
    };
    const materials = [headMat, tailMat, cholMat, coreMat, waterMat, drugMat];
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

    function layerOn(key) {
      return document.querySelector(`[data-layer-toggle="${key}"]`)?.getAttribute('aria-pressed') !== 'false';
    }
    function syncLayers() {
      Object.entries(layers).forEach(([key, meshes]) => {
        const visible = layerOn(key);
        meshes.forEach((mesh) => { mesh.visible = visible; });
      });
    }
    function syncCutaway() {
      const active = document.getElementById('cutaway-toggle')?.getAttribute('aria-pressed') === 'true';
      materials.forEach((material) => {
        material.clippingPlanes = active ? [clipPlane] : [];
        material.needsUpdate = true;
      });
    }
    function highlight(part) {
      headMat.emissiveIntensity = 0.12;
      tailMat.emissiveIntensity = 0.12;
      cholMat.emissiveIntensity = 0.12;
      coreMat.emissiveIntensity = 0.25;
      waterMat.emissiveIntensity = 0.12;
      drugMat.emissiveIntensity = 0.35;
      const boost = {
        head: [headMat],
        tail: [tailMat],
        bilayer: [headMat, tailMat],
        cholesterol: [cholMat],
        core: [coreMat, waterMat, drugMat]
      }[part] || [];
      boost.forEach((material) => { material.emissiveIntensity = 0.85; });
    }

    document.querySelectorAll('[data-layer-toggle]').forEach((button) => button.addEventListener('click', syncLayers));
    document.getElementById('cutaway-toggle')?.addEventListener('click', syncCutaway);
    document.querySelectorAll('[data-part-select]').forEach((button) => {
      button.addEventListener('click', () => highlight(button.dataset.partSelect));
    });
    syncLayers();
    syncCutaway();
    highlight('head');

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart = null;
    let dragging = false;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;

    function setZoom(next) {
      camera.position.z = Math.max(4.2, Math.min(9.2, next));
    }
    document.getElementById('zoom-in')?.addEventListener('click', () => setZoom(camera.position.z - 0.45));
    document.getElementById('zoom-out')?.addEventListener('click', () => setZoom(camera.position.z + 0.45));
    document.getElementById('zoom-reset')?.addEventListener('click', () => {
      camera.position.copy(home);
      liposome.rotation.set(0, 0, 0);
      highlight('head');
    });

    function selectAtPoint(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([headsMesh, tailsMesh, cholMesh, coreMesh, waterMesh, drugMesh], false);
      if (!hits.length) return;
      const part = hits[0].object.userData.part;
      document.querySelector(`[data-part-select="${part}"]`)?.click();
    }

    viewport.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('button')) return;
      pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
      dragging = false;
    });
    viewport.addEventListener('pointermove', (event) => {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragging = true;
      if (!dragging) return;
      liposome.rotation.y += dx * 0.008;
      liposome.rotation.x = Math.max(-1.1, Math.min(1.1, liposome.rotation.x + dy * 0.006));
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

    const clock = new THREE.Clock();
    function render() {
      requestAnimationFrame(render);
      if (document.hidden) return;
      const t = clock.getElapsedTime();
      if (!reducedMotion && !dragging) liposome.rotation.y += 0.0021;
      liposome.position.y = Math.sin(t * 0.8) * 0.08;
      glow.position.y = liposome.position.y;
      renderer.render(scene, camera);
    }
    render();
  }
}
