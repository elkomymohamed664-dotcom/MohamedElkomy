/* ============================================================
   LIPOVERSE — sim.js
   Types · Preparation Lab · Drug Loading · Delivery
   Simulation · Applications · Quiz Center
   ============================================================ */
(function () {
  'use strict';

  /* ================= TYPES ================= */
  const TYPES = [
    {
      id: 'suv', short: 'SUV', name: 'Small Unilamellar Vesicle',
      size: '20–100 nm', bilayers: '1 (single)', feature: 'High curvature, small single bilayer',
      desc: 'SUVs are the smallest unilamellar vesicles. Their high curvature makes them useful in research and as building blocks, but they have a small internal volume for drug loading.',
      prep: 'Sonication or extrusion of MLVs', use: 'Research, gene delivery studies',
      svg: () => bilayerRing(150, 150, 55)
    },
    {
      id: 'luv', short: 'LUV', name: 'Large Unilamellar Vesicle',
      size: '100–1000 nm', bilayers: '1 (single)', feature: 'Larger single bilayer, higher encapsulation',
      desc: 'LUVs have a single bilayer but a much larger aqueous core than SUVs, so they can encapsulate more drug. They are widely used in drug delivery research and products.',
      prep: 'Extrusion, reverse phase evaporation', use: 'Drug delivery, vaccines',
      svg: () => bilayerRing(150, 150, 95)
    },
    {
      id: 'guv', short: 'GUV', name: 'Giant Unilamellar Vesicle',
      size: '>1 µm (up to ~100 µm)', bilayers: '1 (single)', feature: 'Visible under a light microscope',
      desc: 'GUVs are cell-sized vesicles. Because they are large enough to see under a microscope, they are used as model cell membranes in biophysics studies.',
      prep: 'Electroformation, gentle hydration', use: 'Model membranes, biophysics',
      svg: () => bilayerRing(150, 150, 128)
    },
    {
      id: 'mlv', short: 'MLV', name: 'Multilamellar Vesicle',
      size: '0.5–10 µm', bilayers: 'Multiple (concentric)', feature: 'Easy to prepare, lower encapsulation efficiency',
      desc: 'MLVs consist of many concentric bilayers separated by thin aqueous layers — like an onion. They are the easiest to prepare (thin film hydration) but have a relatively low encapsulation efficiency.',
      prep: 'Thin film hydration (Bangham method)', use: 'Depot formulations, research',
      svg: () => [45, 68, 91, 114].map(r => bilayerRing(150, 150, r)).join('')
    },
    {
      id: 'mvv', short: 'MVV', name: 'Multivesicular Vesicle',
      size: '100–1000 nm', bilayers: 'Vesicles within a vesicle', feature: 'High encapsulation capacity',
      desc: 'MVVs contain many small non-concentric vesicles inside one large vesicle, like bubbles inside a bubble. This gives a large total internal volume and high encapsulation capacity.',
      prep: 'Double emulsion, microfluidics', use: 'High-dose drug delivery',
      svg: () => bilayerRing(150, 150, 118) +
        [[110, 110], [195, 105], [105, 195], [198, 192], [150, 150]].map(([x, y]) => bilayerRing(x, y, 26)).join('')
    }
  ];

  function bilayerRing(cx, cy, r) {
    return `
      <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="none" stroke="#20BDB0" stroke-width="3.5"/>
      <circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="none" stroke="#8BE7E0" stroke-width="3.5"/>
      <circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="rgba(77,163,255,0.10)"/>`;
  }

  (function initTypes() {
    const sel = document.getElementById('type-selector');
    const svgWrap = document.getElementById('type-svg-wrap');
    const caption = document.getElementById('type-caption');
    const details = document.getElementById('type-details');
    const tbody = document.querySelector('#types-table tbody');
    if (!sel) return;

    sel.innerHTML = TYPES.map((t, i) =>
      `<button class="ctrl-btn ${i === 0 ? 'active' : ''}" data-type="${t.id}">${t.short}</button>`).join('');
    tbody.innerHTML = TYPES.map(t =>
      `<tr><td>${t.short}</td><td>${t.name}</td><td>${t.size}</td><td>${t.bilayers}</td><td>${t.feature}</td></tr>`).join('');

    function show(id) {
      const t = TYPES.find(x => x.id === id);
      sel.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.type === id));
      svgWrap.innerHTML = `<svg viewBox="0 0 300 300" width="300" height="300" role="img" aria-label="${t.name}">${t.svg()}</svg>`;
      caption.textContent = t.short + ' — ' + t.size;
      details.innerHTML = `
        <h3>${t.short}</h3>
        <div class="type-full">${t.name}</div>
        <p>${t.desc}</p>
        <div class="type-facts">
          <div class="type-fact"><span>Size Range</span><strong>${t.size}</strong></div>
          <div class="type-fact"><span>Bilayers</span><strong>${t.bilayers}</strong></div>
          <div class="type-fact"><span>Preparation</span><strong>${t.prep}</strong></div>
          <div class="type-fact"><span>Main Uses</span><strong>${t.use}</strong></div>
        </div>`;
    }
    sel.querySelectorAll('button').forEach(b => b.addEventListener('click', () => show(b.dataset.type)));
    show('suv');
  })();

  /* ================= PREPARATION LAB ================= */
  const METHODS = [
    {
      id: 'thinfilm', name: 'Thin Film Hydration',
      principle: 'Lipids are dissolved in an organic solvent, dried into a thin film, then hydrated with an aqueous buffer. The film swells and buds off into multilamellar vesicles.',
      materials: ['Phospholipids', 'Cholesterol', 'Organic solvent (chloroform/methanol)', 'Aqueous buffer', 'Rotary evaporator'],
      steps: [
        ['Dissolve lipids', 'Dissolve phospholipids and cholesterol in an organic solvent in a round-bottom flask.'],
        ['Form the thin film', 'Attach to a rotary evaporator and remove the solvent under vacuum, leaving a thin lipid film on the flask wall.'],
        ['Hydrate the film', 'Add aqueous buffer and rotate gently — the film swells and forms MLVs.'],
        ['Size reduction (optional)', 'Sonicate or extrude to obtain SUVs or LUVs with a narrower size distribution.']
      ],
      pros: ['Simple and widely used', 'No toxic solvents in the final product', 'Easy to scale up'],
      cons: ['Broad size distribution', 'Low encapsulation of hydrophilic drugs', 'Large vesicles initially (MLVs)']
    },
    {
      id: 'reverse', name: 'Reverse Phase Evaporation',
      principle: 'An emulsion of lipids in an organic solvent and an aqueous drug solution is formed; solvent evaporation inverts the emulsion into large unilamellar vesicles with high encapsulation efficiency.',
      materials: ['Phospholipids', 'Ether/ethanol', 'Aqueous drug solution', 'Nitrogen stream'],
      steps: [
        ['Prepare the emulsion', 'Mix lipids in ether/ethanol with the aqueous drug phase and sonicate to form a water-in-oil emulsion.'],
        ['Evaporate the solvent', 'Remove the organic solvent under reduced pressure with a nitrogen stream.'],
        ['Vesicles form', 'The emulsion inverts into large unilamellar vesicles with the drug trapped inside.'],
        ['Collect & wash', 'Centrifuge and wash to remove unencapsulated drug and residual solvent.']
      ],
      pros: ['High encapsulation efficiency', 'Large unilamellar vesicles', 'Good for hydrophilic drugs'],
      cons: ['Residual organic solvent risk', 'Requires careful control', 'Not ideal for sensitive proteins']
    },
    {
      id: 'ethanol', name: 'Ethanol Injection',
      principle: 'A concentrated lipid solution in ethanol is rapidly injected into an aqueous phase; the sudden dilution causes phospholipids to self-assemble spontaneously into vesicles.',
      materials: ['Phospholipids', 'Ethanol', 'Aqueous buffer', 'Syringe / pump'],
      steps: [
        ['Dissolve lipids in ethanol', 'Prepare a concentrated lipid solution in ethanol.'],
        ['Inject into aqueous phase', 'Inject the solution rapidly into stirred aqueous buffer.'],
        ['Spontaneous assembly', 'Vesicles form instantly as ethanol dilutes and phospholipids self-assemble.'],
        ['Remove ethanol', 'Dialyze or evaporate to remove residual ethanol.']
      ],
      pros: ['Fast and simple', 'Continuous production possible', 'Scalable'],
      cons: ['Residual ethanol must be removed', 'Size control needs optimization', 'Lower encapsulation efficiency']
    },
    {
      id: 'detergent', name: 'Detergent Removal',
      principle: 'Lipids are solubilized with a detergent into mixed micelles; gradual removal of the detergent (e.g. by dialysis) allows the lipids to reassemble into vesicles.',
      materials: ['Phospholipids', 'Detergent (e.g. Triton X-100)', 'Dialysis membrane', 'Aqueous buffer'],
      steps: [
        ['Form mixed micelles', 'Dissolve lipids with detergent to form mixed micelles.'],
        ['Add the drug/protein', 'Include the cargo in the micellar solution.'],
        ['Remove detergent', 'Dialyze against buffer — as detergent leaves, vesicles assemble around the cargo.'],
        ['Collect vesicles', 'Recover the formed liposomes and characterize them.']
      ],
      pros: ['Mild conditions — good for proteins', 'Good size control', 'High encapsulation possible'],
      cons: ['Slow process (dialysis)', 'Residual detergent risk', 'Requires careful optimization']
    },
    {
      id: 'microfluidic', name: 'Microfluidic Preparation',
      principle: 'Lipids in ethanol and an aqueous phase meet in microchannels with controlled flow rates; precise mixing produces uniform vesicles with narrow size distribution.',
      materials: ['Phospholipids in ethanol', 'Aqueous buffer', 'Microfluidic chip', 'Syringe pumps'],
      steps: [
        ['Set up the chip', 'Connect lipid-ethanol and aqueous streams to the microfluidic chip.'],
        ['Control flow rates', 'Adjust flow rate ratio and total flow to set the target size.'],
        ['Controlled mixing', 'Streams mix under laminar flow — vesicles form uniformly.'],
        ['Collect product', 'Collect the liposome suspension with reproducible size and PDI.']
      ],
      pros: ['Excellent size control & reproducibility', 'Continuous production', 'Low PDI'],
      cons: ['Specialized equipment needed', 'Higher initial cost', 'Chip fouling possible']
    }
  ];

  /* ---------- Animated preparation scenes (one per method) ----------
     Each scene receives p ∈ [0,1] (whole process) and draws the
     process on a 640×300 canvas. Schematic, not to scale. */
  const PREP_W = 640, PREP_H = 300;
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const TEAL = '#20BDB0', CYAN = '#8BE7E0', AMBER = '#ffc857', WATER = 'rgba(77,163,255,0.22)';

  function vesicle(ctx, x, y, r, layers, alpha) {
    if (r < 1) return;
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = 'rgba(77,163,255,0.14)';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < layers; i++) {
      const rr = r - (i * r) / (layers + 0.6);
      if (rr < 2) break;
      ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.strokeStyle = i % 2 ? CYAN : TEAL;
      ctx.lineWidth = Math.max(1.2, Math.min(3, r / 14));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function beaker(ctx, x, y, w, h) {
    ctx.strokeStyle = 'rgba(242,247,252,0.45)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y);
    ctx.stroke();
  }

  function flaskPath(ctx, cx, top, bot) {
    ctx.beginPath();
    ctx.moveTo(cx - 22, top); ctx.lineTo(cx - 22, top + 50);
    ctx.lineTo(cx - 80, bot - 30); ctx.quadraticCurveTo(cx - 84, bot, cx - 60, bot);
    ctx.lineTo(cx + 60, bot); ctx.quadraticCurveTo(cx + 84, bot, cx + 80, bot - 30);
    ctx.lineTo(cx + 22, top + 50); ctx.lineTo(cx + 22, top);
  }

  const PREP_SCENES = {
    /* Thin film: lipid film on flask wall → hydration → MLVs */
    thinfilm(ctx, p) {
      const cx = 150, top = 40, bot = 270;
      const level = bot - 150 * seg(p, 0.3, 0.5);
      ctx.save(); flaskPath(ctx, cx, top, bot); ctx.clip();
      ctx.fillStyle = WATER; ctx.fillRect(cx - 100, level, 200, bot - level + 10);
      ctx.restore();
      flaskPath(ctx, cx, top, bot); ctx.strokeStyle = 'rgba(242,247,252,0.5)'; ctx.lineWidth = 2; ctx.stroke();
      // lipid film (yellowish) fades as it is hydrated
      const film = 1 - seg(p, 0.5, 0.75);
      if (film > 0) {
        ctx.strokeStyle = `rgba(255,200,87,${0.85 * film})`; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(cx - 74, bot - 40); ctx.lineTo(cx + 74, bot - 40); ctx.stroke();
      }
      // film flakes falling into the water
      const fl = seg(p, 0.5, 0.8);
      for (let i = 0; i < 9; i++) {
        const y = bot - 40 - fl * (110 - i * 4) * (i % 2 ? 0.7 : 1);
        ctx.fillStyle = AMBER; ctx.globalAlpha = 1 - fl * 0.5;
        ctx.beginPath(); ctx.arc(cx - 60 + i * 15, y, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // MLVs grow on the right
      const g = seg(p, 0.75, 1);
      if (g > 0) vesicle(ctx, 500, 150, 26 + 90 * g, 5, g);
    },

    /* Reverse phase evaporation: water droplets in oil → gel → large LUV */
    rpe(ctx, p) {
      const x = 90, y = 50, w = 230, h = 220;
      beaker(ctx, x, y, w, h);
      // oil phase shrinks as solvent evaporates
      const oilH = 170 * (1 - seg(p, 0.45, 0.8));
      ctx.fillStyle = 'rgba(255,200,87,0.22)';
      ctx.fillRect(x + 2, y + h - oilH - 2, w - 4, oilH);
      // aqueous droplets dispersed in oil
      const n = 16;
      for (let i = 0; i < n; i++) {
        const dx = x + 20 + ((i * 53) % (w - 40));
        const dy = y + h - 20 - ((i * 37) % 150) * (1 - seg(p, 0.1, 0.4) * 0.5);
        ctx.fillStyle = WATER;
        ctx.beginPath(); ctx.arc(dx, dy, 6 + (i % 3) * 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(242,247,252,0.8)'; ctx.font = '600 13px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Oil + aqueous droplets', x + w / 2, y + 22);
      const g = seg(p, 0.7, 1);
      if (g > 0) vesicle(ctx, 500, 150, 30 + 60 * g, 1, g);
    },

    /* Ethanol injection: lipid–ethanol jet into buffer → small SUVs */
    ethanol(ctx, p) {
      const x = 120, y = 40;
      beaker(ctx, x - 80, 90, 240, 200);
      ctx.fillStyle = WATER; ctx.fillRect(x - 78, 150, 236, 138);
      // syringe needle
      ctx.strokeStyle = 'rgba(242,247,252,0.6)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, 110); ctx.stroke();
      // jet
      const jet = seg(p, 0.05, 0.55);
      if (jet > 0) {
        ctx.strokeStyle = 'rgba(255,200,87,0.6)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x, 110); ctx.lineTo(x, 110 + 110 * jet); ctx.stroke();
      }
      // SUVs appear in the water and spread out
      const k = Math.floor(seg(p, 0.5, 0.95) * 20);
      for (let i = 0; i < k; i++) {
        const vx = 470 + ((i * 47) % 130) - 65, vy = 60 + ((i * 71) % 180);
        vesicle(ctx, vx, vy, 8, 1, 1);
      }
      const mix = seg(p, 0.2, 0.6);
      for (let i = 0; i < 12 * mix; i++) {
        ctx.fillStyle = AMBER; ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.arc(x - 60 + ((i * 29) % 120), 160 + ((i * 41) % 110), 2.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    },

    /* Detergent removal: mixed micelles → dialysis removes detergent → vesicles */
    detergent(ctx, p) {
      const x = 90, y = 50, w = 230, h = 220;
      beaker(ctx, x, y, w, h);
      ctx.fillStyle = 'rgba(77,163,255,0.08)'; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      const remove = seg(p, 0.25, 0.8);
      // micelles (lipid + detergent) fade as detergent leaves
      for (let i = 0; i < 26; i++) {
        const mx = x + 20 + ((i * 61) % (w - 40)), my = y + 40 + ((i * 43) % (h - 70));
        ctx.globalAlpha = 1 - remove * 0.9 * ((i % 4) / 3);
        ctx.fillStyle = TEAL;
        ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(139,231,224,0.6)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 6, my + 9); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(242,247,252,0.8)'; ctx.font = '600 13px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Mixed micelles + detergent', x + w / 2, y + 22);
      // arrows showing detergent leaving through the dialysis membrane
      if (remove > 0.05) {
        ctx.fillStyle = 'rgba(255,138,92,' + (0.8 * remove) + ')';
        ctx.fillText('detergent ⇢ out', x + w / 2, y + h + 18);
      }
      const g = seg(p, 0.6, 1);
      if (g > 0) vesicle(ctx, 500, 150, 34 + 40 * g, 1, g);
    },

    /* Microfluidics: two streams merge in a channel → uniform vesicles */
    microfluidics(ctx, p) {
      const y0 = 150, jx = 220;
      ctx.strokeStyle = 'rgba(242,247,252,0.35)'; ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(40, 80); ctx.lineTo(jx, y0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, 220); ctx.lineTo(jx, y0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(jx, y0); ctx.lineTo(600, y0); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = 'rgba(255,200,87,0.85)';
      ctx.font = '600 12px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('lipid–ethanol', 30, 66); ctx.fillText('buffer', 30, 244);
      // streams flowing toward the junction
      const flow = (p * 6) % 1;
      for (let i = 0; i < 8; i++) {
        const t1 = (i / 8 + flow) % 1;
        const a = 40 + (jx - 40) * t1;
        ctx.fillStyle = AMBER;
        ctx.beginPath(); ctx.arc(a, 80 + (y0 - 80) * t1, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(a, 220 + (y0 - 220) * t1, 3, 0, Math.PI * 2); ctx.fill();
      }
      // uniform vesicles appear downstream
      const g = seg(p, 0.35, 1);
      const count = Math.floor(g * 7);
      for (let i = 0; i < count; i++) {
        const vx = 270 + i * 50;
        vesicle(ctx, vx, y0, 16, 1, 1);
      }
    }
  };

  function drawPrepScene(ctx, id, p, stepIdx, stepTitle) {
    ctx.clearRect(0, 0, PREP_W, PREP_H);
    const scene = PREP_SCENES[id];
    if (scene) scene(ctx, p);
    ctx.fillStyle = 'rgba(242,247,252,0.85)'; ctx.font = '600 13px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`Step ${stepIdx + 1}: ${stepTitle}`, PREP_W / 2, PREP_H - 10);
    ctx.textAlign = 'left';
  }

  (function initLab() {
    const tabs = document.getElementById('lab-tabs');
    const panel = document.getElementById('lab-panel');
    if (!tabs) return;

    tabs.innerHTML = METHODS.map((m, i) =>
      `<button class="ctrl-btn ${i === 0 ? 'active' : ''}" data-method="${m.id}">${m.name}</button>`).join('');

    let show = function (id) {
      const m = METHODS.find(x => x.id === id);
      tabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.method === id));
      panel.innerHTML = `
        <h3>${m.name}</h3>
        <p class="lab-principle"><strong>Principle:</strong> ${m.principle}</p>
        <div class="lab-materials">${m.materials.map(x => `<span class="chip">${x}</span>`).join('')}</div>
        <div class="prep-viz">
          <canvas id="prep-canvas" width="640" height="300" aria-label="Animated preparation scene"></canvas>
          <div class="prep-controls">
            <button class="ctrl-btn" id="prep-play">⏸ Pause</button>
            <button class="ctrl-btn" id="prep-restart">⟲ Restart</button>
            <span class="loading-note">Schematic animation — not to scale.</span>
          </div>
        </div>
        <div class="lab-cols">
          <div>
            <h4 style="font-family:var(--font-display);margin-bottom:10px">Preparation Stages</h4>
            <ol class="lab-steps">${m.steps.map(s => `<li><strong>${s[0]}.</strong> ${s[1]}</li>`).join('')}</ol>
          </div>
          <div class="lab-side">
            <h4>✅ Advantages</h4>
            <ul class="lab-pros">${m.pros.map(x => `<li>${x}</li>`).join('')}</ul>
            <h4>⚠️ Limitations</h4>
            <ul class="lab-cons">${m.cons.map(x => `<li>${x}</li>`).join('')}</ul>
          </div>
        </div>`;
    }
    tabs.querySelectorAll('button').forEach(b => b.addEventListener('click', () => show(b.dataset.method)));

    /* Animation loop: plays the scene of the selected method and highlights the current step */
    let current = 'thinfilm', prepP = 0, playing = true, last = 0;
    const SECONDS = 12;
    function bindControls() {
      const playBtn = document.getElementById('prep-play');
      const restartBtn = document.getElementById('prep-restart');
      if (playBtn) playBtn.addEventListener('click', () => {
        playing = !playing; playBtn.textContent = playing ? '⏸ Pause' : '▶ Play';
      });
      if (restartBtn) restartBtn.addEventListener('click', () => { prepP = 0; playing = true; if (playBtn) playBtn.textContent = '⏸ Pause'; });
    }
    function frame(ts) {
      requestAnimationFrame(frame);
      const sec = document.getElementById('section-lab');
      if (!sec || !sec.classList.contains('active')) { last = ts; return; }
      const canvas = document.getElementById('prep-canvas');
      if (!canvas) return;
      const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0;
      last = ts;
      if (playing) prepP += dt / SECONDS;
      if (prepP >= 1) prepP = 0;
      const m = METHODS.find(x => x.id === current);
      const n = m.steps.length;
      const idx = Math.min(n - 1, Math.floor(prepP * n));
      drawPrepScene(canvas.getContext('2d'), current, prepP, idx, m.steps[idx][0]);
      panel.querySelectorAll('.lab-steps li').forEach((li, i) => li.classList.toggle('current', i === idx));
    }
    const origShow = show;
    show = function (id) { current = id; prepP = 0; origShow(id); bindControls(); };
    show('thinfilm');
    requestAnimationFrame(frame);
  })();

  /* ================= DRUG LOADING ================= */
  (function initLoading() {
    const canvas = document.getElementById('loading-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height, C = { x: W / 2, y: H / 2 };
    const R_OUT = 190, R_IN = 148;
    let mode = 'hydrophilic';
    let particles = [];
    let running = false;

    function spawn() {
      particles = [];
      for (let i = 0; i < 70; i++) {
        let x, y;
        if (mode === 'hydrophilic') {
          const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (R_IN - 18);
          x = C.x + Math.cos(a) * r; y = C.y + Math.sin(a) * r;
        } else {
          const a = Math.random() * Math.PI * 2, r = R_IN + 8 + Math.random() * (R_OUT - R_IN - 16);
          x = C.x + Math.cos(a) * r; y = C.y + Math.sin(a) * r;
        }
        particles.push({ x, y, delay: i * 2.2, r: 4 + Math.random() * 3 });
      }
    }

    let frame = 0;
    function draw() {
      if (!running) return;
      const sec = document.getElementById('section-loading');
      if (!sec || !sec.classList.contains('active')) { requestAnimationFrame(draw); return; }
      frame++;
      ctx.clearRect(0, 0, W, H);

      // Core
      ctx.beginPath();
      ctx.arc(C.x, C.y, R_IN, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(77,163,255,0.12)';
      ctx.fill();

      // Bilayer ring
      ctx.beginPath();
      ctx.arc(C.x, C.y, R_OUT, 0, Math.PI * 2);
      ctx.arc(C.x, C.y, R_IN, 0, Math.PI * 2, true);
      ctx.fillStyle = 'rgba(32,189,176,0.20)';
      ctx.fill();

      // Heads (outer + inner)
      ctx.fillStyle = '#20BDB0';
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(C.x + Math.cos(a) * R_OUT, C.y + Math.sin(a) * R_OUT, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(C.x + Math.cos(a) * R_IN, C.y + Math.sin(a) * R_IN, 5, 0, Math.PI * 2); ctx.fill();
      }

      // Drug particles
      ctx.fillStyle = '#ffc857';
      particles.forEach(p => {
        const age = frame - p.delay;
        if (age < 0) return;
        const s = Math.min(1, age / 12);
        ctx.globalAlpha = s;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * s, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Label
      ctx.fillStyle = 'rgba(242,247,252,0.85)';
      ctx.font = '600 15px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(mode === 'hydrophilic' ? '💧 Drug in the aqueous core' : '🫧 Drug in the lipid bilayer', C.x, H - 14);

      requestAnimationFrame(draw);
    }

    const btnH = document.getElementById('load-hydrophilic');
    const btnL = document.getElementById('load-lipophilic');
    const note = document.getElementById('loading-note');
    function setMode(m) {
      mode = m;
      btnH.classList.toggle('active', m === 'hydrophilic');
      btnL.classList.toggle('active', m === 'lipophilic');
      note.textContent = m === 'hydrophilic'
        ? 'Water-soluble drugs dissolve in the aqueous core.'
        : 'Fat-soluble drugs dissolve among the lipid tails.';
      frame = 0; spawn();
    }
    btnH.addEventListener('click', () => setMode('hydrophilic'));
    btnL.addEventListener('click', () => setMode('lipophilic'));

    // Encapsulation efficiency calculator
    const total = document.getElementById('ee-total');
    const enc = document.getElementById('ee-enc');
    const out = document.getElementById('ee-value');
    function calcEE() {
      const t = parseFloat(total.value) || 0;
      const e = parseFloat(enc.value) || 0;
      out.textContent = t > 0 ? Math.min(100, Math.max(0, (e / t) * 100)).toFixed(0) + '%' : '—';
    }
    total.addEventListener('input', calcEE);
    enc.addEventListener('input', calcEE);
    calcEE();

    spawn();
    window.LipoverseLoading = {
      start() { if (!running) { running = true; frame = 0; spawn(); requestAnimationFrame(draw); } },
      stop() { running = false; }
    };
  })();

  /* ================= DELIVERY SIMULATION ================= */
  (function initSimulation() {
    const canvas = document.getElementById('sim-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const CELL = { x: 730, y: H / 2, r: 88 };

    const STAGES = [
      { title: 'Administration', desc: 'The liposomal drug is injected intravenously and enters the bloodstream. The liposome shields the drug from immediate breakdown.', ar: 'يُحقن الدواء الليبوسومي وريديًا ويدخل مجرى الدم.' },
      { title: 'Bloodstream', desc: 'The liposome circulates with the blood. PEGylation ("stealth" coating) helps it avoid the immune system and stay in circulation longer.', ar: 'يدور الليبوسوم مع الدم، والتغليف بـ PEG يساعده على تجنب المناعة.' },
      { title: 'Biodistribution', desc: 'Near the tumor, blood vessels are leaky. Small liposomes can slip out of the vessel and accumulate in the tumor — the EPR effect.', ar: 'الأوعية الدموية حول الورم مسامية، فيتراكم الليبوسوم في الورم.' },
      { title: 'Cellular Interaction', desc: 'The liposome reaches a tumor cell and is taken up by the cell (endocytosis), carrying its drug cargo inside.', ar: 'يصل الليبوسوم إلى الخلية السرطانية وتأخذه إلى داخلها.' },
      { title: 'Drug Release', desc: 'Inside the cell, the drug is released from the liposome and acts on its target, killing the cancer cell.', ar: 'داخل الخلية يُطلق الدواء ويؤثر على هدفه.' }
    ];

    let stage = 0, t = 0, playing = false, running = false, time = 0;
    const STAGE_TIME = 3.6; // seconds per stage

    // RBCs
    const rbcs = [];
    for (let i = 0; i < 26; i++) rbcs.push({ x: Math.random() * W, y: 150 + Math.random() * 160, s: 0.7 + Math.random() * 0.6 });

    // Released drug particles
    let drugDots = [];

    function liposomePos() {
      const p = t;
      if (stage === 0) return { x: 60 + p * 180, y: H / 2 + Math.sin(p * 6) * 6, s: 1 };
      if (stage === 1) { const x = 240 + p * 320; return { x, y: H / 2 + Math.sin(x * 0.02) * 42, s: 1 }; }
      if (stage === 2) { const x = 560 + p * 110; return { x, y: H / 2 + Math.sin(x * 0.02) * 42 * (1 - p), s: 1 }; }
      if (stage === 3) { const x = 670 + p * (CELL.x - 670); return { x, y: CELL.y, s: 1 - p * 0.55 }; }
      return { x: CELL.x, y: CELL.y, s: 0.45 };
    }

    function drawVessel() {
      ctx.fillStyle = 'rgba(255,110,110,0.10)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let x = 0; x <= W; x += 16) ctx.lineTo(x, 128 + Math.sin(x * 0.012) * 10);
      ctx.lineTo(W, 0); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) ctx.lineTo(x, H - 128 + Math.sin(x * 0.012 + 2) * 10);
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,140,140,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) { const y = 128 + Math.sin(x * 0.012) * 10; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) { const y = H - 128 + Math.sin(x * 0.012 + 2) * 10; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    }

    function drawRBCs() {
      rbcs.forEach(r => {
        r.x += 1.6 * r.s;
        if (r.x > W + 30) { r.x = -30; r.y = 150 + Math.random() * 160; }
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.fillStyle = 'rgba(255,95,95,0.45)';
        ctx.beginPath(); ctx.ellipse(0, 0, 17 * r.s, 10 * r.s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,160,160,0.35)';
        ctx.beginPath(); ctx.ellipse(0, 0, 9 * r.s, 5 * r.s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
    }

    function drawCell() {
      const pulse = 1 + Math.sin(time * 2) * 0.02;
      ctx.beginPath();
      ctx.arc(CELL.x, CELL.y, CELL.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,150,180,0.10)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,150,180,0.55)';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Nucleus
      const nucR = stage === 4 ? 30 * (1 - t * 0.5) : 30;
      ctx.beginPath();
      ctx.arc(CELL.x, CELL.y, nucR, 0, Math.PI * 2);
      ctx.fillStyle = stage === 4 ? 'rgba(200,80,120,0.5)' : 'rgba(200,80,120,0.35)';
      ctx.fill();
      ctx.fillStyle = 'rgba(242,247,252,0.8)';
      ctx.font = '600 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tumor Cell', CELL.x, CELL.y + CELL.r + 22);
    }

    function drawLiposome(pos) {
      if (stage === 4 && t > 0.25) return; // dissolved
      const r = 26 * pos.s;
      const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 2.2);
      glow.addColorStop(0, 'rgba(32,189,176,0.35)');
      glow.addColorStop(1, 'rgba(32,189,176,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 2.2, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(77,163,255,0.18)'; ctx.fill();
      ctx.strokeStyle = '#20BDB0'; ctx.lineWidth = 5; ctx.stroke();
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r - 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#8BE7E0'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffc857'; ctx.fill();
    }

    function drawDrugs() {
      if (stage !== 4) return;
      if (drugDots.length === 0) {
        for (let i = 0; i < 42; i++) {
          const a = Math.random() * Math.PI * 2, sp = 0.6 + Math.random() * 1.8;
          drugDots.push({ x: CELL.x, y: CELL.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 2.5 + Math.random() * 3 });
        }
      }
      ctx.fillStyle = '#ffc857';
      drugDots.forEach(d => {
        d.x += d.vx; d.y += d.vy; d.vx *= 0.985; d.vy *= 0.985;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      });
    }

    function renderInfo() {
      const info = document.getElementById('sim-info');
      const s = STAGES[stage];
      info.innerHTML = `
        <h3>Stage ${stage + 1} — ${s.title}</h3>
        <p>${s.desc}</p>
        <p class="ar">${s.ar}</p>
        <div class="sim-stages-list">
          ${STAGES.map((st, i) => `<div class="sim-stage-item ${i === stage ? 'current' : i < stage ? 'done' : ''}">${i < stage ? '✓' : i + 1}. ${st.title}</div>`).join('')}
        </div>`;
      document.getElementById('sim-stage-label').textContent = `Stage ${stage + 1} / 5 — ${s.title}`;
    }

    function loop() {
      if (!running) return;
      time += 0.016;
      if (playing) {
        t += 0.016 / STAGE_TIME;
        if (t >= 1) {
          if (stage < STAGES.length - 1) { stage++; t = 0; drugDots = []; renderInfo(); }
          else { playing = false; t = 1; updatePlayBtn(); }
        }
      }
      ctx.clearRect(0, 0, W, H);
      drawVessel();
      drawRBCs();
      drawCell();
      drawLiposome(liposomePos());
      drawDrugs();
      requestAnimationFrame(loop);
    }

    const playBtn = document.getElementById('sim-play');
    function updatePlayBtn() { playBtn.textContent = playing ? '⏸ Pause' : '▶ Play'; }
    playBtn.addEventListener('click', () => {
      if (stage === STAGES.length - 1 && t >= 1) { stage = 0; t = 0; drugDots = []; renderInfo(); }
      playing = !playing; updatePlayBtn();
    });
    document.getElementById('sim-next').addEventListener('click', () => {
      if (stage < STAGES.length - 1) { stage++; t = 0; drugDots = []; renderInfo(); }
    });
    document.getElementById('sim-reset').addEventListener('click', () => {
      stage = 0; t = 0; playing = false; drugDots = []; updatePlayBtn(); renderInfo();
    });

    renderInfo();
    window.LipoverseSim = {
      start() { if (!running) { running = true; requestAnimationFrame(loop); } },
      stop() { running = false; }
    };
  })();

  /* ================= APPLICATIONS ================= */
  (function initApps() {
    const grid = document.getElementById('apps-grid');
    if (!grid) return;
    const APPS = [
      { brand: 'Doxil®', generic: 'Liposomal doxorubicin', use: 'Cancer — ovarian, breast, Kaposi sarcoma',
        why: 'PEGylated ("stealth") liposomes prolong circulation and reduce doxorubicin cardiotoxicity.',
        note: 'First FDA-approved liposomal drug (1995).' },
      { brand: 'AmBisome®', generic: 'Liposomal amphotericin B', use: 'Systemic fungal infections',
        why: 'The liposomal form delivers amphotericin B to fungi while greatly reducing kidney toxicity (nephrotoxicity).',
        note: 'A life-saving option when conventional amphotericin B is too toxic.' },
      { brand: 'Onivyde®', generic: 'Liposomal irinotecan', use: 'Pancreatic cancer',
        why: 'Encapsulation prolongs irinotecan exposure at the tumor and improves the therapeutic index.',
        note: 'Used in combination regimens for pancreatic cancer.' },
      { brand: 'Exparel®', generic: 'Liposomal bupivacaine', use: 'Post-surgical pain',
        why: 'Slow, sustained release of bupivacaine provides pain relief for up to ~72 hours after surgery.',
        note: 'Reduces the need for opioid painkillers.' }
    ];
    grid.innerHTML = APPS.map(a => `
      <article class="glass-card app-card">
        <div class="app-brand">${a.brand}</div>
        <div class="app-generic">${a.generic}</div>
        <p><strong>Use:</strong> ${a.use}</p>
        <div class="app-why"><strong>Why liposomes?</strong> ${a.why}</div>
        <p style="margin-top:10px;font-size:0.82rem;color:var(--faint)">${a.note}</p>
      </article>`).join('');
  })();

  /* ================= QUIZ ================= */
  const QUIZ = [
    { q: 'Liposomes are mainly composed of?', opts: ['Proteins', 'Phospholipids', 'Carbohydrates', 'Nucleic acids'], a: 1,
      ex: 'Liposomes are vesicles made of phospholipid bilayers — the same molecules that form cell membranes.' },
    { q: 'Hydrophilic (water-soluble) drugs are loaded in the?', opts: ['Lipid bilayer', 'Aqueous core', 'Outside the vesicle', 'Cholesterol layer'], a: 1,
      ex: 'Hydrophilic drugs dissolve in the water-filled aqueous core of the liposome.' },
    { q: 'The hydrophobic tails of phospholipids face?', opts: ['The water outside', 'Each other, inside the bilayer', 'The aqueous core water', 'The air'], a: 1,
      ex: 'Tails repel water, so they point toward each other in the middle of the bilayer, away from water.' },
    { q: 'Cholesterol in the bilayer mainly?', opts: ['Increases vesicle size', 'Modulates fluidity and stability', 'Dissolves the drug', 'Forms the aqueous core'], a: 1,
      ex: 'Cholesterol inserts between the tails, buffering fluidity and reducing leakage.' },
    { q: 'What is the typical size range of SUVs?', opts: ['20–100 nm', '1–10 µm', '100–1000 µm', '5–20 nm'], a: 0,
      ex: 'Small Unilamellar Vesicles are 20–100 nm with a single bilayer.' },
    { q: 'Multilamellar vesicles (MLVs) are characterized by?', opts: ['A single bilayer', 'Multiple concentric bilayers', 'No aqueous core', 'A solid lipid matrix'], a: 1,
      ex: 'MLVs have many concentric bilayers separated by thin aqueous layers — like an onion.' },
    { q: 'Thin film hydration initially produces?', opts: ['SUVs', 'MLVs', 'Only GUVs', 'Micelles'], a: 1,
      ex: 'Hydrating a dried lipid film gives MLVs first; sonication/extrusion can reduce them to SUVs/LUVs.' },
    { q: 'Active (remote) loading depends on?', opts: ['Heat', 'A pH or ion gradient', 'Sonication', 'Freezing'], a: 1,
      ex: 'A gradient (e.g. ammonium sulfate) drives drug into pre-formed vesicles with high efficiency.' },
    { q: 'Doxil® contains?', opts: ['Liposomal amphotericin B', 'Liposomal doxorubicin', 'Liposomal irinotecan', 'Liposomal bupivacaine'], a: 1,
      ex: 'Doxil is PEGylated liposomal doxorubicin, the first FDA-approved liposomal drug (1995).' },
    { q: 'True or False: Lipophilic drugs are loaded in the aqueous core.', opts: ['True', 'False'], a: 1,
      ex: 'False — lipophilic drugs dissolve in the lipid bilayer; hydrophilic drugs go to the aqueous core.' },
    { q: 'True or False: PEGylation prolongs liposome circulation time.', opts: ['True', 'False'], a: 0,
      ex: 'True — the PEG "stealth" coating reduces immune clearance, so liposomes circulate longer.' },
    { q: 'True or False: GUVs can be observed under a light microscope.', opts: ['True', 'False'], a: 0,
      ex: 'True — GUVs are cell-sized (>1 µm), so they are visible under a light microscope.' }
  ];

  (function initQuiz() {
    const card = document.getElementById('quiz-card');
    if (!card) return;
    let idx = 0, score = 0, answers = [], locked = false;

    function startScreen() {
      card.innerHTML = `
        <div class="quiz-start">
          <h3>🧪 Liposome Knowledge Test</h3>
          <p>${QUIZ.length} questions · MCQ &amp; True/False · Instant explanations</p>
          <button class="btn btn-primary" id="quiz-start-btn">Start Quiz →</button>
        </div>`;
      document.getElementById('quiz-start-btn').addEventListener('click', () => {
        idx = 0; score = 0; answers = []; renderQuestion();
      });
    }

    function renderQuestion() {
      locked = false;
      const q = QUIZ[idx];
      const letters = ['A', 'B', 'C', 'D'];
      card.innerHTML = `
        <div class="quiz-progress"><span>Question ${idx + 1} / ${QUIZ.length}</span><span>Score: ${score}</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${(idx / QUIZ.length) * 100}%"></div></div>
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options">
          ${q.opts.map((o, i) => `<button class="quiz-opt" data-i="${i}"><span class="opt-letter">${letters[i]}</span>${o}</button>`).join('')}
        </div>
        <div id="quiz-feedback"></div>`;
      card.querySelectorAll('.quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => choose(parseInt(btn.dataset.i, 10)));
      });
    }

    function choose(i) {
      if (locked) return;
      locked = true;
      const q = QUIZ[idx];
      const correct = i === q.a;
      if (correct) score++;
      answers.push({ q: q.q, chosen: q.opts[i], correctText: q.opts[q.a], ok: correct });
      card.querySelectorAll('.quiz-opt').forEach(btn => {
        btn.disabled = true;
        const bi = parseInt(btn.dataset.i, 10);
        if (bi === q.a) btn.classList.add('correct');
        else if (bi === i) btn.classList.add('wrong');
      });
      const last = idx === QUIZ.length - 1;
      document.getElementById('quiz-feedback').innerHTML = `
        <div class="quiz-explain"><strong>${correct ? '✅ Correct!' : '❌ Not quite.'}</strong> ${q.ex}</div>
        <div class="quiz-next-row"><button class="btn btn-primary" id="quiz-next">${last ? 'See Results 🏁' : 'Next Question →'}</button></div>`;
      document.getElementById('quiz-next').addEventListener('click', () => {
        if (last) renderResults(); else { idx++; renderQuestion(); }
      });
    }

    function renderResults() {
      const pct = Math.round((score / QUIZ.length) * 100);
      const msg = pct >= 80 ? 'Outstanding! You master liposomes 🎓'
        : pct >= 60 ? 'Great job — a little review and you will ace it!'
        : pct >= 40 ? 'Good start — revisit the modules and try again.'
        : 'Keep learning — explore the 3D Explorer and try again!';
      if (window.LipoverseProgress) window.LipoverseProgress.setQuizBest(pct);
      const wrong = answers.filter(a => !a.ok);
      card.innerHTML = `
        <div class="quiz-result">
          <div class="quiz-score-big">${pct}%</div>
          <p>${score} / ${QUIZ.length} correct — ${msg}</p>
          <button class="btn btn-primary" id="quiz-retry">↻ Try Again</button>
          <button class="btn btn-ghost" id="quiz-review-btn">Review Answers</button>
          <div class="quiz-review" id="quiz-review" style="display:none">
            <h4>Review</h4>
            ${answers.map(a => `
              <div class="quiz-review-item">
                <div class="q">${a.q}</div>
                <div class="a">Your answer: <span class="${a.ok ? 'ok' : 'bad'}">${a.chosen}</span>
                ${a.ok ? '' : ` · Correct: <span class="ok">${a.correctText}</span>`}</div>
              </div>`).join('')}
          </div>
        </div>`;
      document.getElementById('quiz-retry').addEventListener('click', startScreen);
      document.getElementById('quiz-review-btn').addEventListener('click', () => {
        const r = document.getElementById('quiz-review');
        r.style.display = r.style.display === 'none' ? 'block' : 'none';
      });
    }

    startScreen();
  })();
})();
