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


  /* ================= LAB ANIMATIONS (inline animated SVG) ================= */
  const LAB_ANIMS = {
    thinfilm: `
<div class="lab-anim">
  <span class="lab-anim-tag">▶ How it works</span>
  <svg viewBox="0 0 540 224" role="img" aria-label="Thin film hydration animation">
    <path d="M118 24 h26 v36 a66 66 0 1 1 -26 0 z" fill="rgba(32,189,176,0.07)" stroke="#20BDB0" stroke-width="2.5"/>
    <path d="M76 118 a48 48 0 0 0 90 0 z" fill="rgba(255,200,87,0.25)">
      <animate attributeName="opacity" values="1;1;0.15;0.15;1" keyTimes="0;0.35;0.5;0.85;1" dur="6s" repeatCount="indefinite"/>
    </path>
    <path d="M80 108 a46 46 0 0 0 82 0" fill="none" stroke="#ffc857" stroke-width="5" stroke-linecap="round" opacity="0">
      <animate attributeName="opacity" values="0;0;0.95;0.95;0" keyTimes="0;0.4;0.55;0.9;1" dur="6s" repeatCount="indefinite"/>
    </path>
    <circle cx="112" cy="116" r="4" fill="#ffc857">
      <animate attributeName="cy" values="116;40" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.9;0" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="128" cy="116" r="3" fill="#ffc857">
      <animate attributeName="cy" values="116;38" dur="2.5s" begin="0.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0" dur="2.5s" begin="0.6s" repeatCount="indefinite"/>
    </circle>
    <circle cx="100" cy="116" r="2.5" fill="#ffc857">
      <animate attributeName="cy" values="116;44" dur="1.7s" begin="1.1s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0" dur="1.7s" begin="1.1s" repeatCount="indefinite"/>
    </circle>
    <text x="121" y="212" fill="#9fb4c8" font-size="11.5" text-anchor="middle">1 · Solvent evaporates → lipid film</text>
    <g stroke="#8BE7E0" stroke-width="2.5" fill="#8BE7E0">
      <line x1="222" y1="96" x2="268" y2="96"/>
      <polygon points="268,96 257,90 257,102"/>
    </g>
    <text x="245" y="83" fill="#8BE7E0" font-size="11" text-anchor="middle">+ buffer</text>
    <path d="M398 30 h24 v36 a64 64 0 1 1 -24 0 z" fill="rgba(77,163,255,0.10)" stroke="#4da3ff" stroke-width="2.5"/>
    <path d="M356 118 a48 48 0 0 0 88 0 z" fill="rgba(77,163,255,0.22)"/>
    <g opacity="0">
      <circle cx="384" cy="116" r="8" fill="none" stroke="#20BDB0" stroke-width="2.3"/>
      <circle cx="384" cy="116" r="4.2" fill="none" stroke="#8BE7E0" stroke-width="1.8"/>
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.45;0.58;0.92;1" dur="6s" repeatCount="indefinite"/>
    </g>
    <g opacity="0">
      <circle cx="422" cy="112" r="6.5" fill="none" stroke="#20BDB0" stroke-width="2.3"/>
      <circle cx="422" cy="112" r="3.4" fill="none" stroke="#8BE7E0" stroke-width="1.8"/>
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.52;0.65;0.92;1" dur="6s" repeatCount="indefinite"/>
    </g>
    <g opacity="0">
      <circle cx="400" cy="128" r="5" fill="none" stroke="#20BDB0" stroke-width="2"/>
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.6;0.72;0.92;1" dur="6s" repeatCount="indefinite"/>
    </g>
    <text x="410" y="212" fill="#9fb4c8" font-size="11.5" text-anchor="middle">2 · Film swells → MLVs bud off</text>
  </svg>
  <p class="lab-anim-caption">Dissolve lipids → rotate under vacuum to dry a thin film → add buffer → MLVs form (then size-reduce by sonication or extrusion)</p>
</div>`,
    reverse: `
<div class="lab-anim">
  <span class="lab-anim-tag">▶ How it works</span>
  <svg viewBox="0 0 540 224" role="img" aria-label="Reverse phase evaporation animation">
    <rect x="66" y="30" width="120" height="150" rx="16" fill="rgba(255,200,87,0.10)" stroke="#ffc857" stroke-width="2.5"/>
    <circle cx="110" cy="95" r="13" fill="rgba(77,163,255,0.45)" stroke="#4da3ff" stroke-width="2">
      <animate attributeName="cy" values="95;88;95" dur="2.6s" repeatCount="indefinite"/>
    </circle>
    <circle cx="140" cy="140" r="10" fill="rgba(77,163,255,0.45)" stroke="#4da3ff" stroke-width="2">
      <animate attributeName="cy" values="140;132;140" dur="2.1s" begin="0.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="98" cy="150" r="8" fill="rgba(77,163,255,0.45)" stroke="#4da3ff" stroke-width="2">
      <animate attributeName="cy" values="150;144;150" dur="2.9s" begin="1s" repeatCount="indefinite"/>
    </circle>
    <circle cx="148" cy="78" r="7" fill="rgba(77,163,255,0.45)" stroke="#4da3ff" stroke-width="2">
      <animate attributeName="cy" values="78;72;78" dur="2.3s" begin="0.3s" repeatCount="indefinite"/>
    </circle>
    <text x="126" y="208" fill="#9fb4c8" font-size="11.5" text-anchor="middle">1 · Water-in-oil emulsion</text>
    <g stroke="#8BE7E0" stroke-width="2.5" fill="#8BE7E0">
      <line x1="215" y1="105" x2="262" y2="105"/>
      <polygon points="262,105 251,99 251,111"/>
    </g>
    <text x="238" y="88" fill="#8BE7E0" font-size="10.5" text-anchor="middle">↓ solvent</text>
    <path d="M392 30 h24 v36 a66 66 0 1 1 -24 0 z" fill="rgba(77,163,255,0.08)" stroke="#4da3ff" stroke-width="2.5"/>
    <circle cx="388" cy="118" r="17" fill="rgba(77,163,255,0.16)" stroke="#20BDB0" stroke-width="3"/>
    <circle cx="388" cy="118" r="9" fill="rgba(77,163,255,0.28)" stroke="#4da3ff" stroke-width="2"/>
    <circle cx="430" cy="132" r="12" fill="rgba(77,163,255,0.16)" stroke="#20BDB0" stroke-width="3"/>
    <circle cx="430" cy="132" r="6" fill="rgba(77,163,255,0.28)" stroke="#4da3ff" stroke-width="2"/>
    <g fill="#ffc857">
      <circle cx="382" cy="114" r="2.2"/><circle cx="394" cy="123" r="2.2"/><circle cx="427" cy="129" r="2"/><circle cx="436" cy="136" r="2"/>
    </g>
    <text x="404" y="208" fill="#9fb4c8" font-size="11.5" text-anchor="middle">2 · LUVs trap the drug inside</text>
  </svg>
  <p class="lab-anim-caption">Lipids in ether/ethanol + aqueous drug phase → sonicate into emulsion → evaporate solvent under pressure → emulsion inverts into LUVs with high drug capture</p>
</div>`,
    ethanol: `
<div class="lab-anim">
  <span class="lab-anim-tag">▶ How it works</span>
  <svg viewBox="0 0 540 224" role="img" aria-label="Ethanol injection animation">
    <g transform="translate(150,18) rotate(18)">
      <rect x="-58" y="0" width="96" height="26" rx="5" fill="rgba(255,200,87,0.25)" stroke="#ffc857" stroke-width="2.5"/>
      <rect x="-84" y="6" width="28" height="14" rx="3" fill="#ffc857" opacity="0.85"/>
      <path d="M38 6 L66 14 L38 22 z" fill="rgba(255,200,87,0.4)" stroke="#ffc857" stroke-width="2"/>
    </g>
    <circle cx="245" cy="112" r="4.5" fill="#ffc857">
      <animate attributeName="cy" values="62;128" dur="1.3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.85;1" dur="1.3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="252" cy="112" r="3.4" fill="#ffc857">
      <animate attributeName="cy" values="62;128" dur="1.3s" begin="0.45s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.85;1" dur="1.3s" begin="0.45s" repeatCount="indefinite"/>
    </circle>
    <circle cx="238" cy="112" r="3" fill="#ffc857">
      <animate attributeName="cy" values="62;128" dur="1.3s" begin="0.85s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.85;1" dur="1.3s" begin="0.85s" repeatCount="indefinite"/>
    </circle>
    <path d="M150 140 h210 l-18 62 H168 z" fill="rgba(77,163,255,0.12)" stroke="#4da3ff" stroke-width="2.5"/>
    <rect x="168" y="158" width="174" height="30" fill="rgba(77,163,255,0.18)"/>
    <rect x="225" y="182" width="60" height="9" rx="4.5" fill="#8BE7E0" opacity="0.85">
      <animateTransform attributeName="transform" type="rotate" values="0 255 186.5;360 255 186.5" dur="1.6s" repeatCount="indefinite"/>
    </rect>
    <g fill="none" stroke="#20BDB0" stroke-width="2.2">
      <circle cx="215" cy="168" r="5.5" opacity="0.9"><animate attributeName="opacity" values="0.15;1;0.15" dur="2.2s" repeatCount="indefinite"/></circle>
      <circle cx="262" cy="166" r="4.5" opacity="0.9"><animate attributeName="opacity" values="0.15;1;0.15" dur="2.2s" begin="0.7s" repeatCount="indefinite"/></circle>
      <circle cx="298" cy="170" r="5" opacity="0.9"><animate attributeName="opacity" values="0.15;1;0.15" dur="2.2s" begin="1.3s" repeatCount="indefinite"/></circle>
    </g>
    <text x="255" y="222" fill="#9fb4c8" font-size="11.5" text-anchor="middle">Lipids meet buffer → self-assemble instantly</text>
  </svg>
  <p class="lab-anim-caption">Lipid solution is injected into stirred buffer → ethanol dilutes in an instant → phospholipids self-assemble into vesicles spontaneously</p>
</div>`,
    detergent: `
<div class="lab-anim">
  <span class="lab-anim-tag">▶ How it works</span>
  <svg viewBox="0 0 540 224" role="img" aria-label="Detergent dialysis animation">
    <rect x="30" y="24" width="480" height="160" rx="18" fill="rgba(77,163,255,0.06)" stroke="#4da3ff" stroke-width="2.5"/>
    <path d="M30 96 q30 -10 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="rgba(109,185,255,0.5)" stroke-width="2"/>
    <rect x="185" y="52" width="170" height="112" rx="22" fill="rgba(32,189,176,0.08)" stroke="#20BDB0" stroke-width="2.5" stroke-dasharray="7 5"/>
    <text x="270" y="46" fill="#8BE7E0" font-size="10.5" text-anchor="middle">dialysis membrane</text>
    <circle cx="240" cy="95" r="6" fill="#20BDB0" opacity="0.9"/>
    <circle cx="275" cy="125" r="6" fill="#20BDB0" opacity="0.9"/>
    <circle cx="300" cy="88" r="6" fill="#20BDB0" opacity="0.9"/>
    <circle cx="255" cy="135" r="4" fill="#ffc857"/>
    <circle cx="288" cy="108" r="4" fill="#ffc857"/>
    <circle cx="222" cy="112" r="4" fill="#ffc857"/>
    <circle r="3.6" fill="#ff7ad9">
      <animateMotion dur="3.2s" repeatCount="indefinite" path="M270,105 L150,105 L110,105"/>
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.8;1" dur="3.2s" repeatCount="indefinite"/>
    </circle>
    <circle r="3.6" fill="#ff7ad9">
      <animateMotion dur="3.2s" begin="1.1s" repeatCount="indefinite" path="M280,110 L390,110 L430,110"/>
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.8;1" dur="3.2s" begin="1.1s" repeatCount="indefinite"/>
    </circle>
    <circle r="3.6" fill="#ff7ad9">
      <animateMotion dur="3.2s" begin="2.1s" repeatCount="indefinite" path="M260,120 L160,140 L95,150"/>
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.8;1" dur="3.2s" begin="2.1s" repeatCount="indefinite"/>
    </circle>
    <circle cx="270" cy="108" r="15" fill="none" stroke="#8BE7E0" stroke-width="2" opacity="0">
      <animate attributeName="opacity" values="0;0;0.9;0.9;0" keyTimes="0;0.5;0.7;0.95;1" dur="6.4s" repeatCount="indefinite"/>
    </circle>
    <text x="270" y="212" fill="#9fb4c8" font-size="11.5" text-anchor="middle">Detergent leaves → lipids keep the cargo and close into a vesicle</text>
  </svg>
  <p class="lab-anim-caption">Mixed micelles (lipid + detergent) inside a dialysis bag → detergent slowly dialyzes out → lipids reorganize into liposomes around the drug or protein</p>
</div>`,
    microfluidic: `
<div class="lab-anim">
  <span class="lab-anim-tag">▶ How it works</span>
  <svg viewBox="0 0 540 224" role="img" aria-label="Microfluidic chip animation">
    <rect x="36" y="28" width="468" height="164" rx="20" fill="rgba(139,231,224,0.05)" stroke="#8BE7E0" stroke-width="2.5"/>
    <path d="M36 74 L170 74 L218 106" fill="none" stroke="#ffc857" stroke-width="10" stroke-linejoin="round" opacity="0.85"/>
    <path d="M36 158 L170 158 L218 126" fill="none" stroke="#4da3ff" stroke-width="10" stroke-linejoin="round" opacity="0.85"/>
    <path d="M218 116 C 252 116 252 66 296 66 C 340 66 340 166 384 166 C 428 166 420 116 504 112" fill="none" stroke="rgba(139,231,224,0.35)" stroke-width="10"/>
    <text x="106" y="64" fill="#ffc857" font-size="10.5" text-anchor="middle">lipids in ethanol</text>
    <text x="106" y="150" fill="#6db9ff" font-size="10.5" text-anchor="middle">aqueous phase</text>
    <circle r="5" fill="#20BDB0" stroke="#8BE7E0" stroke-width="1.5">
      <animateMotion dur="2.6s" repeatCount="indefinite" path="M218 116 C 252 116 252 66 296 66 C 340 66 340 166 384 166 C 428 166 420 116 504 112"/>
    </circle>
    <circle r="5" fill="#20BDB0" stroke="#8BE7E0" stroke-width="1.5">
      <animateMotion dur="2.6s" begin="0.55s" repeatCount="indefinite" path="M218 116 C 252 116 252 66 296 66 C 340 66 340 166 384 166 C 428 166 420 116 504 112"/>
    </circle>
    <circle r="5" fill="#20BDB0" stroke="#8BE7E0" stroke-width="1.5">
      <animateMotion dur="2.6s" begin="1.1s" repeatCount="indefinite" path="M218 116 C 252 116 252 66 296 66 C 340 66 340 166 384 166 C 428 166 420 116 504 112"/>
    </circle>
    <circle r="5" fill="#20BDB0" stroke="#8BE7E0" stroke-width="1.5">
      <animateMotion dur="2.6s" begin="1.65s" repeatCount="indefinite" path="M218 116 C 252 116 252 66 296 66 C 340 66 340 166 384 166 C 428 166 420 116 504 112"/>
    </circle>
    <circle r="5" fill="#20BDB0" stroke="#8BE7E0" stroke-width="1.5">
      <animateMotion dur="2.6s" begin="2.2s" repeatCount="indefinite" path="M218 116 C 252 116 252 66 296 66 C 340 66 340 166 384 166 C 428 166 420 116 504 112"/>
    </circle>
    <text x="270" y="212" fill="#9fb4c8" font-size="11.5" text-anchor="middle">Controlled laminar mixing → one size, every time</text>
  </svg>
  <p class="lab-anim-caption">Two streams meet inside microchannels → the flow-rate ratio sets the size → uniform, low-PDI vesicles in a continuous process</p>
</div>`
  };

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
        ${LAB_ANIMS[m.id] || ''}
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

  /* ================= DRUG LOADING (EE calculator) ================= */
  // The visual simulation is a real-time 3D model in js/loading3d.js (lazy-loaded).
  // This section keeps the encapsulation-efficiency calculator.
  (function initEE() {
    const total = document.getElementById('ee-total');
    const enc = document.getElementById('ee-enc');
    const out = document.getElementById('ee-value');
    if (!total || !enc || !out) return;
    function calcEE() {
      const t = parseFloat(total.value) || 0;
      const e = parseFloat(enc.value) || 0;
      out.textContent = t > 0 ? Math.min(100, Math.max(0, (e / t) * 100)).toFixed(0) + '%' : '—';
    }
    total.addEventListener('input', calcEE);
    enc.addEventListener('input', calcEE);
    calcEE();
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
    if (document.getElementById('section-simulation').classList.contains('active')) {
      window.LipoverseSim.start();
    }
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
    // Structure & Composition
    { q: 'Liposomes are mainly composed of?', opts: ['Proteins', 'Phospholipids', 'Carbohydrates', 'Nucleic acids'], a: 1, cat: 'Structure',
      ex: 'Liposomes are vesicles built from phospholipid bilayers — the same molecules that form cell membranes.' },
    { q: 'In a bilayer, the hydrophobic tails face?', opts: ['The water outside', 'Each other, inside the bilayer', 'The aqueous core water', 'The air'], a: 1, cat: 'Structure',
      ex: 'Tails repel water, so they point toward each other in the middle of the bilayer (tail-to-tail), away from water.' },
    { q: 'Cholesterol in the bilayer mainly?', opts: ['Increases vesicle size', 'Modulates fluidity and stability', 'Dissolves the drug', 'Forms the aqueous core'], a: 1, cat: 'Structure',
      ex: 'Cholesterol inserts between the fatty tails, buffering fluidity and reducing permeability and leakage.' },
    { q: 'Multilamellar vesicles (MLVs) are characterized by?', opts: ['A single bilayer', 'Multiple concentric bilayers', 'No aqueous core', 'A solid lipid matrix'], a: 1, cat: 'Structure',
      ex: 'MLVs have many concentric bilayers separated by thin aqueous layers — like an onion.' },
    { q: 'In the OUTER leaflet of the bilayer, the phospholipid heads face?', opts: ['The external aqueous medium', 'The inner aqueous core', 'Each other across the core', 'The cholesterol molecules'], a: 0, cat: 'Structure',
      ex: 'Heads are hydrophilic, so in the outer leaflet they face the outside water — and inner-leaflet heads face the aqueous core.' },
    { q: 'True or False: GUVs can be observed under a light microscope.', opts: ['True', 'False'], a: 0, cat: 'Structure',
      ex: 'True — GUVs are cell-sized (>1 µm), so they are visible under a light microscope.' },
    // Preparation
    { q: 'Thin film hydration initially produces?', opts: ['SUVs', 'MLVs', 'Only GUVs', 'Micelles'], a: 1, cat: 'Preparation',
      ex: 'Hydrating a dried lipid film gives MLVs first; sonication/extrusion can reduce them to SUVs/LUVs.' },
    { q: 'Reverse phase evaporation mainly yields?', opts: ['Small unilamellar vesicles', 'Large unilamellar vesicles with high drug capture', 'Micelles only', 'Solid lipid particles'], a: 1, cat: 'Preparation',
      ex: 'Szoka & Papahadjopoulos (1978) showed the water-in-oil emulsion inverts into LUVs with a large internal aqueous space.' },
    { q: 'Ethanol injection forms liposomes by?', opts: ['Slow cooling of a lipid gel', 'Rapid dilution causing spontaneous self-assembly', 'High-pressure homogenization', 'Sonication to cavitation'], a: 1, cat: 'Preparation',
      ex: 'A concentrated lipid-ethanol solution injected into buffer dilutes instantly, and phospholipids self-assemble into vesicles.' },
    { q: 'Extrusion (polycarbonate membranes) is used to?', opts: ['Sterilize the liposome suspension', 'Reduce size and narrow the size distribution', 'Remove residual solvent', 'Load the drug remotely'], a: 1, cat: 'Preparation',
      ex: 'Extrusion forces vesicles through defined pore sizes, producing uniform SUVs/LUVs with a narrow distribution.' },
    { q: 'The main advantage of microfluidic preparation is?', opts: ['Lowest possible cost', 'Excellent size control and low PDI', 'No need for lipids', 'Avoiding aqueous buffers'], a: 1, cat: 'Preparation',
      ex: 'Precise laminar-flow mixing gives uniform vesicles with reproducible size and low polydispersity — ideal for scale-up.' },
    // Loading & EE
    { q: 'Hydrophilic (water-soluble) drugs are loaded in the?', opts: ['Lipid bilayer', 'Aqueous core', 'Outside the vesicle', 'Cholesterol layer'], a: 1, cat: 'Loading & EE',
      ex: 'Hydrophilic drugs dissolve in the water-filled aqueous core of the liposome.' },
    { q: 'Lipophilic drugs such as paclitaxel are loaded in the?', opts: ['Aqueous core', 'Head-group region', 'Lipid bilayer, among the tails', 'PEG layer only'], a: 2, cat: 'Loading & EE',
      ex: 'Lipophilic drugs partition into the hydrophobic region of the bilayer, between the fatty-acid tails.' },
    { q: 'Active (remote) loading depends on?', opts: ['Heat', 'A pH or ion gradient', 'Sonication', 'Freezing'], a: 1, cat: 'Loading & EE',
      ex: 'A gradient (e.g. ammonium sulfate) drives drug into pre-formed vesicles with high efficiency.' },
    { q: 'Encapsulation efficiency is calculated as?', opts: ['Total drug ÷ encapsulated drug × 100', 'Encapsulated drug ÷ total drug × 100', 'Released drug ÷ total drug × 100', 'Free drug ÷ encapsulated drug × 100'], a: 1, cat: 'Loading & EE',
      ex: 'EE% = (encapsulated drug ÷ total drug) × 100. Report the method used — values vary by assay and formulation.' },
    { q: 'The ammonium sulfate gradient remote-loads doxorubicin because?', opts: ['Doxorubicin is lipophilic', 'Ionized doxorubicin precipitates inside the core, trapping it', 'It dissolves the bilayer', 'It destroys the drug'], a: 1, cat: 'Loading & EE',
      ex: 'Uncharged doxorubicin crosses the bilayer, then ionizes and precipitates inside with sulfate — trapping it remotely (Doxil® principle).' },
    { q: 'Increasing cholesterol from 0 to ~50 mol% typically?', opts: ['Increases membrane permeability', 'Decreases leakage and improves stability', 'Dissolves the bilayer', 'Removes surface charge'], a: 1, cat: 'Loading & EE',
      ex: 'Cholesterol packs between phospholipids, reducing permeability and drug leakage — at very high levels other properties change too.' },
    // In Vivo & Stealth
    { q: 'True or False: PEGylation prolongs liposome circulation time.', opts: ['True', 'False'], a: 0, cat: 'In Vivo & Stealth',
      ex: 'True — the PEG "stealth" coating reduces opsonization and immune clearance, so liposomes circulate longer.' },
    { q: 'EPR stands for?', opts: ['Enhanced permeability and retention', 'Exact pharmacokinetic rate', 'Extended plasma release', 'Enhanced protein retention'], a: 0, cat: 'In Vivo & Stealth',
      ex: 'The EPR effect: leaky tumor vasculature + poor lymphatic drainage → nanoparticles preferentially accumulate in tumors.' },
    { q: 'Conventional (non-stealth) liposomes are cleared mainly by?', opts: ['Kidneys', 'Lungs', 'Mononuclear phagocyte system (liver & spleen)', 'The skin'], a: 2, cat: 'In Vivo & Stealth',
      ex: 'Reticuloendothelial macrophages in the liver and spleen recognize and remove uncoated liposomes.' },
    { q: 'Stealth liposomes preferentially accumulate in?', opts: ['The brain', 'Tumor tissue (EPR effect)', 'Bone marrow', 'Skeletal muscle'], a: 1, cat: 'In Vivo & Stealth',
      ex: 'Long-circulating liposomes extravasate through leaky tumor vessels and are retained there — the EPR effect (Maeda et al., 2000).' },
    // Applications & Products
    { q: 'Doxil® contains?', opts: ['Liposomal amphotericin B', 'Liposomal doxorubicin', 'Liposomal irinotecan', 'Liposomal bupivacaine'], a: 1, cat: 'Applications',
      ex: 'Doxil is PEGylated liposomal doxorubicin, the first FDA-approved liposomal drug (1995).' },
    { q: 'AmBisome® is?', opts: ['Liposomal doxorubicin', 'Liposomal amphotericin B with markedly reduced nephrotoxicity', 'Liposomal ciprofloxacin', 'Liposomal vitamin D'], a: 1, cat: 'Applications',
      ex: 'Liposomal amphotericin B delivers the antifungal to fungi while substantially reducing kidney toxicity.' },
    { q: 'Exparel® provides?', opts: ['Rapid 10-minute analgesia', 'Sustained bupivacaine release for up to ~72 h post-surgery', 'Systemic anticoagulation', 'Long-acting local anesthesia for epidurals only'], a: 1, cat: 'Applications',
      ex: 'Liposomal bupivacaine releases the anesthetic slowly, extending post-surgical pain relief and reducing opioid needs.' },
    { q: 'Onivyde® (liposomal irinotecan) is used in?', opts: ['Pancreatic cancer', 'Asthma', 'Diabetes', 'Rheumatoid arthritis'], a: 0, cat: 'Applications',
      ex: 'Onivyde is approved (with fluoropyrimidine regimens) for metastatic pancreatic adenocarcinoma after gemcitabine-based therapy.' },
    // History
    { q: 'Liposomes were first described by?', opts: ['Alexander Fleming', 'Alec D. Bangham, 1965', 'Marie Curie', 'Robert Langer'], a: 1, cat: 'History',
      ex: 'Bangham observed swollen phospholipid lamellae and their "bubbles" under the electron microscope in 1964–1965.' },
    { q: 'The first FDA-approved liposomal drug was?', opts: ['AmBisome®', 'Exparel®', 'Doxil® (1995)', 'Onivyde®'], a: 2, cat: 'History',
      ex: 'Doxil (PEGylated liposomal doxorubicin) was approved by the FDA in 1995 — the first nanoliposomal product.' },
    { q: 'Bangham discovered liposomes while studying?', opts: ['Antibiotics', 'How phospholipids interact with water', 'Blood coagulation', 'Vitamin absorption'], a: 1, cat: 'History',
      ex: 'While studying how phospholipids interact with water, he saw hydrated lipids close into vesicles — liposomes.' }
  ];

  (function initQuiz() {
    const card = document.getElementById('quiz-card');
    if (!card) return;
    let idx = 0, score = 0, answers = [], locked = false;

    const CATEGORIES = ['All'].concat([...new Set(QUIZ.map(q => q.cat))]);
    let activeCat = 'All';
    let pool = QUIZ.slice();

    function startScreen() {
      const count = activeCat === 'All' ? QUIZ.length : QUIZ.filter(q => q.cat === activeCat).length;
      card.innerHTML = `
        <div class="quiz-start">
          <h3>🧪 Liposome Knowledge Test</h3>
          <p>${QUIZ.length} questions · MCQ &amp; True/False · Instant explanations</p>
          <div class="quiz-cats">
            ${CATEGORIES.map(c => `<button class="quiz-cat ${c === activeCat ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('')}
          </div>
          <button class="btn btn-primary" id="quiz-start-btn">Start Quiz (${count} questions) →</button>
        </div>`;
      card.querySelectorAll('.quiz-cat').forEach(btn => {
        btn.addEventListener('click', () => { activeCat = btn.dataset.cat; startScreen(); });
      });
      document.getElementById('quiz-start-btn').addEventListener('click', () => {
        pool = activeCat === 'All' ? QUIZ.slice() : QUIZ.filter(q => q.cat === activeCat);
        idx = 0; score = 0; answers = []; renderQuestion();
      });
    }

    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function renderQuestion() {
      locked = false;
      const q = pool[idx];
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      // Shuffle display order each attempt — no letter-position bias
      const order = shuffle(q.opts.map((_, i) => i));
      card.innerHTML = `
        <div class="quiz-progress"><span>Question ${idx + 1} / ${pool.length}</span><span>Score: ${score}</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${(idx / pool.length) * 100}%"></div></div>
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options">
          ${order.map((oi, displayPos) => `<button class="quiz-opt" data-i="${oi}"><span class="opt-letter">${letters[displayPos]}</span>${q.opts[oi]}</button>`).join('')}
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
      const last = idx === pool.length - 1;
      document.getElementById('quiz-feedback').innerHTML = `
        <div class="quiz-explain"><strong>${correct ? '✅ Correct!' : '❌ Not quite.'}</strong> ${q.ex}</div>
        <div class="quiz-next-row"><button class="btn btn-primary" id="quiz-next">${last ? 'See Results 🏁' : 'Next Question →'}</button></div>`;
      document.getElementById('quiz-next').addEventListener('click', () => {
        if (last) renderResults(); else { idx++; renderQuestion(); }
      });
    }

    function renderResults() {
      const pct = Math.round((score / pool.length) * 100);
      const msg = pct >= 80 ? 'Outstanding! You master liposomes 🎓'
        : pct >= 60 ? 'Great job — a little review and you will ace it!'
        : pct >= 40 ? 'Good start — revisit the modules and try again.'
        : 'Keep learning — explore the 3D Explorer and try again!';
      if (window.LipoverseProgress) window.LipoverseProgress.setQuizBest(pct);
      const wrong = answers.filter(a => !a.ok);
      card.innerHTML = `
        <div class="quiz-result">
          <div class="quiz-score-big">${pct}%</div>
          <p>${score} / ${pool.length} correct — ${msg}</p>
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
