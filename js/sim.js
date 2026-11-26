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
      <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="none" stroke="#C4B5FD" stroke-width="3.5"/>
      <circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="none" stroke="#EDE4FF" stroke-width="3.5"/>
      <circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="rgba(109,40,217,0.2)"/>`;
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
    },
    {
      id: 'extrusion', name: 'Membrane Extrusion',
      principle: 'A coarse suspension is forced through track-etched polycarbonate membranes of a chosen pore size. Repeated passes narrow the size distribution. Extrusion is usually the sizing step after thin-film hydration.',
      materials: ['Hydrated MLV suspension', 'Polycarbonate membranes', 'Extruder', 'Support filters'],
      steps: [
        ['Hydrate first', 'Prepare a polydisperse MLV suspension, often from a thin lipid film.'],
        ['Choose the pore', 'Fit a membrane of the target pore size, commonly 100 nm or 200 nm.'],
        ['Pass repeatedly', 'Force the suspension through the membrane, usually 10 or more times, above the lipid transition temperature.'],
        ['Check the size', 'Collect the suspension and measure diameter and PDI by dynamic light scattering.']
      ],
      pros: ['Tight, reproducible size control', 'Scales from syringes to larger extruders', 'Standard route to SUVs and small LUVs'],
      cons: ['Membranes clog if the sample is concentrated', 'Some lipid is lost on the membrane', 'Does not by itself create a remote-loading gradient']
    }
  ];

  (function initLab() {
    const tabs = document.getElementById('lab-tabs');
    const panel = document.getElementById('lab-panel');
    if (!tabs) return;

    tabs.innerHTML = METHODS.map((m, i) =>
      `<button class="ctrl-btn ${i === 0 ? 'active' : ''}" data-method="${m.id}">${m.name}</button>`).join('');

    function show(id) {
      const m = METHODS.find(x => x.id === id);
      tabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.method === id));
      panel.innerHTML = `
        <h3>${m.name}</h3>
        <p class="lab-principle"><strong>Principle:</strong> ${m.principle}</p>
        <div class="lab-materials">${m.materials.map(x => `<span class="chip">${x}</span>`).join('')}</div>
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
    show('thinfilm');
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
      ctx.fillStyle = 'rgba(109,40,217,0.2)';
      ctx.fill();

      // Bilayer ring
      ctx.beginPath();
      ctx.arc(C.x, C.y, R_OUT, 0, Math.PI * 2);
      ctx.arc(C.x, C.y, R_IN, 0, Math.PI * 2, true);
      ctx.fillStyle = 'rgba(196,181,253,0.28)';
      ctx.fill();

      // Heads (outer + inner)
      ctx.fillStyle = '#C4B5FD';
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(C.x + Math.cos(a) * R_OUT, C.y + Math.sin(a) * R_OUT, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(C.x + Math.cos(a) * R_IN, C.y + Math.sin(a) * R_IN, 5, 0, Math.PI * 2); ctx.fill();
      }

      // Drug particles
      ctx.fillStyle = '#E9D5FF';
      particles.forEach(p => {
        const age = frame - p.delay;
        if (age < 0) return;
        const s = Math.min(1, age / 12);
        ctx.globalAlpha = s;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * s, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Label
      ctx.fillStyle = 'rgba(247,244,252,0.9)';
      ctx.font = '600 15px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(mode === 'hydrophilic' ? '💧 Drug in the aqueous core' : '🫧 Drug in the lipid bilayer', C.x, H - 14);
      if (frame > 8 && frame < 170 && frame % 26 === 0) window.LipoverseSound?.bubble();

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
    const warn = document.getElementById('ee-warn');
    function calcEE() {
      const t = parseFloat(total.value);
      const e = parseFloat(enc.value);
      if (!Number.isFinite(t) || t <= 0 || !Number.isFinite(e) || e < 0) {
        out.textContent = '—';
        if (warn) warn.textContent = 'Enter a total above zero and an encapsulated amount that is not negative.';
        return;
      }
      if (e > t) {
        out.textContent = '—';
        if (warn) warn.textContent = 'Encapsulated drug cannot be higher than the total drug added.';
        return;
      }
      if (warn) warn.textContent = '';
      out.textContent = ((e / t) * 100).toFixed(0) + '%';
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
      ctx.fillStyle = 'rgba(247,244,252,0.88)';
      ctx.font = '600 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tumor Cell', CELL.x, CELL.y + CELL.r + 22);
    }

    function drawLiposome(pos) {
      if (stage === 4 && t > 0.25) return; // dissolved
      const r = 26 * pos.s;
      const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 2.2);
      glow.addColorStop(0, 'rgba(196,181,253,0.4)');
      glow.addColorStop(1, 'rgba(196,181,253,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 2.2, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(109,40,217,0.28)'; ctx.fill();
      ctx.strokeStyle = '#C4B5FD'; ctx.lineWidth = 5; ctx.stroke();
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r - 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#EDE4FF'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#A78BFA'; ctx.fill();
    }

    function drawDrugs() {
      if (stage !== 4) return;
      if (drugDots.length === 0) {
        for (let i = 0; i < 42; i++) {
          const a = Math.random() * Math.PI * 2, sp = 0.6 + Math.random() * 1.8;
          drugDots.push({ x: CELL.x, y: CELL.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 2.5 + Math.random() * 3 });
        }
      }
      ctx.fillStyle = '#E9D5FF';
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
      const simOn = document.getElementById('section-simulation')?.classList.contains('active');
      window.LipoverseSound?.syncBody?.({ on: playing && !!simOn, stage, t });
      requestAnimationFrame(loop);
    }

    const playBtn = document.getElementById('sim-play');
    function updatePlayBtn() { playBtn.textContent = playing ? '⏸ Pause' : '▶ Play'; }
    playBtn.addEventListener('click', () => {
      if (stage === STAGES.length - 1 && t >= 1) { stage = 0; t = 0; drugDots = []; renderInfo(); }
      playing = !playing; updatePlayBtn();
      if (playing) window.LipoverseSound?.startBody?.(stage);
      else window.LipoverseSound?.stopBody?.();
    });
    document.getElementById('sim-next').addEventListener('click', () => {
      if (stage < STAGES.length - 1) {
        stage++; t = 0; drugDots = []; renderInfo();
        if (playing) window.LipoverseSound?.syncBody?.({ on: true, stage, t: 0 });
        else window.LipoverseSound?.stageCue?.(stage);
      }
    });
    document.getElementById('sim-reset').addEventListener('click', () => {
      stage = 0; t = 0; playing = false; drugDots = []; updatePlayBtn(); renderInfo();
      window.LipoverseSound?.stopBody?.();
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
      { brand: 'Doxil®', generic: 'Liposomal doxorubicin', use: 'Ovarian cancer, AIDS-related Kaposi sarcoma, and multiple myeloma, in the labeled settings',
        why: 'PEGylated ("stealth") liposomes prolong circulation and reduce doxorubicin cardiotoxicity.',
        note: 'First FDA-approved liposomal drug (1995). Breast cancer is not a current US Doxil indication. No dose is given here.' },
      { brand: 'AmBisome®', generic: 'Liposomal amphotericin B', use: 'Systemic fungal infections',
        why: 'The liposomal form delivers amphotericin B to fungi while greatly reducing kidney toxicity (nephrotoxicity).',
        note: 'A life-saving option when conventional amphotericin B is too toxic.' },
      { brand: 'Onivyde®', generic: 'Liposomal irinotecan', use: 'Pancreatic cancer',
        why: 'Encapsulation prolongs irinotecan exposure at the tumor and improves the therapeutic index.',
        note: 'Used in combination regimens for pancreatic cancer.' },
      { brand: 'Exparel®', generic: 'Liposomal bupivacaine', use: 'Post-surgical pain',
        why: 'The liposome holds bupivacaine for slower release than the free injection.',
        note: 'Duration depends on the product label and the procedure. This card is not a dosing guide.' },
      { brand: 'Vyxeos®', generic: 'Liposomal daunorubicin and cytarabine', use: 'Some adults with newly diagnosed high-risk AML',
        why: 'Both drugs are co-encapsulated in one liposome. That is not the same as mixing the two free drugs in a bag.',
        note: 'The labeled population is limited. No dose or survival figure is given here.' },
      { brand: 'Myocet®', generic: 'Non-PEGylated liposomal doxorubicin', use: 'Breast cancer in some countries, with other treatment',
        why: 'It is liposomal doxorubicin without the PEG coat used on Doxil, so the two products are not interchangeable.',
        note: 'Approval and availability depend on the country.' },
      { brand: 'Arikayce®', generic: 'Amikacin liposome inhalation suspension', use: 'Refractory MAC lung disease in selected adults',
        why: 'This liposome is inhaled, so the drug is aimed at the lung rather than given as a typical intravenous cancer product.',
        note: 'Used only when the product criteria are met, as part of a combination regimen.' }
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
      ex: 'True — GUVs are cell-sized (>1 µm), so they are visible under a light microscope.' },
    { q: 'Extrusion through a membrane is mainly used to?', opts: ['Remove every cholesterol molecule', 'Narrow the vesicle size distribution', 'Heat lipids above 200 °C', 'Turn liposomes into proteins'], a: 1,
      ex: 'Passing the suspension through pores reduces vesicles that have not yet fitted through. Repeated passes narrow the range; they do not guarantee one exact diameter.' },
    { q: 'In reverse-phase evaporation, the aqueous drug starts?', opts: ['Dissolved only in the organic solvent', 'In water droplets inside a water-in-oil emulsion', 'Bound only to PEG chains', 'In a solid lipid core'], a: 1,
      ex: 'The emulsion traps aqueous droplets. Removing the solvent can leave those droplets as the internal water volume.' },
    { q: 'Ethanol injection forms vesicles mainly because?', opts: ['Lipids are heated above 200 °C', 'A lipid solution is diluted into excess water', 'Detergent is added above its CMC only', 'The dry film is frozen'], a: 1,
      ex: 'Lipids dissolved in a water-miscible solvent self-assemble as that solvent mixes into the aqueous phase.' },
    { q: 'Closed vesicles appear after detergent removal when?', opts: ['All phospholipid is removed', 'Detergent falls below the level that keeps mixed micelles', 'Only cholesterol remains', 'The core is freeze-dried'], a: 1,
      ex: 'Detergent holds lipids in micelles. Dialysis, dilution, or beads can drop it below that threshold so bilayers close.' },
    { q: 'A multivesicular vesicle (MVV) is best described as?', opts: ['One bilayer and no water core', 'Many small non-concentric vesicles inside a larger vesicle', 'A solid lipid nanoparticle', 'A micelle'], a: 1,
      ex: 'An MVV holds vesicles inside a vesicle. An MLV is different: its bilayers are concentric, like an onion.' },
    { q: 'Compared with an SUV, an LUV usually has?', opts: ['No bilayer', 'A larger aqueous core for water-soluble drug', 'Only a solid lipid matrix', 'No phospholipids'], a: 1,
      ex: 'Both can have one bilayer. The larger LUV core can hold more hydrophilic drug than a small SUV core.' },
    { q: 'True or False: Every liposome follows the tumor pathway in the simulation.', opts: ['True', 'False'], a: 1,
      ex: 'False. That animation is one teaching pathway. Some liposomes release drug outside the cell, fuse, are cleared by liver and spleen macrophages, or are meant to act locally.' },
    { q: 'True or False: PEGylation means the liposome is actively targeted to one receptor.', opts: ['True', 'False'], a: 1,
      ex: 'False. PEG mainly slows protein binding and clearance. Active targeting needs a ligand. A stealth liposome is not automatically a targeted one.' }
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
      answers.push({ q: q.q, chosen: q.opts[i], correctText: q.opts[q.a], ok: correct, ex: q.ex });
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
      try {
        localStorage.setItem('lipoverse-wrong', JSON.stringify(wrong.map(a => ({
          q: a.q, correct: a.correctText, explanation: a.ex || '',
        }))));
      } catch (e) { /* ignore */ }
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
