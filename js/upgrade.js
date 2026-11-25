/* LIPOVERSE additive modules: gallery, lab extras, loading extras, quiz extras,
   bookmarks, search, continue, notes, research, theme. Does not replace existing modules. */
import * as THREE from 'three';

const THEME_KEY = 'lipoverse-theme';
const BOOK_KEY = 'lipoverse-bookmarks';
const LAST_KEY = 'lipoverse-last-section';
const NOTES_KEY = 'lipoverse-notes';
const QUIZ_EX_KEY = 'lipoverse-quiz-extra';

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

/* ================= THEME ================= */
function applyTheme(next) {
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  const btn = document.getElementById('theme-toggle');
  const light = next === 'light';
  if (btn) {
    btn.textContent = light ? '🌙 Dark' : '☀️ Light';
    btn.setAttribute('aria-pressed', String(light));
  }
}
function initTheme() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  const toggle = () => applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  document.getElementById('theme-toggle')?.addEventListener('click', toggle);
  document.getElementById('home-theme')?.addEventListener('click', toggle);
}

/* ================= BOOKMARKS + CONTINUE ================= */
function bookmarks() { return loadJSON(BOOK_KEY, []); }
function isBookmarked(id) { return bookmarks().includes(id); }
function toggleBookmark(id) {
  const list = bookmarks();
  const i = list.indexOf(id);
  if (i >= 0) list.splice(i, 1); else list.push(id);
  saveJSON(BOOK_KEY, list);
  renderBookmarkStrip();
  return list.includes(id);
}
function renderBookmarkStrip() {
  const strip = document.getElementById('bookmark-strip');
  if (!strip) return;
  const list = bookmarks();
  if (!list.length) { strip.innerHTML = ''; return; }
  strip.innerHTML = `<span class="bm-label">Saved</span>` + list.map(id => {
    const btn = document.querySelector(`[data-section="${id}"]`);
    const label = btn ? btn.textContent.trim() : id;
    return `<button type="button" data-go="${id}">${label}</button>`;
  }).join('');
  strip.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
    location.hash = b.dataset.go;
  }));
}
function initContinue() {
  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (id) localStorage.setItem(LAST_KEY, id);
  });
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    const id = btn.dataset.bookmark;
    const paint = () => { btn.classList.toggle('on', isBookmarked(id)); btn.textContent = isBookmarked(id) ? '★ Saved' : '☆ Save'; };
    paint();
    btn.addEventListener('click', () => { toggleBookmark(id); paint(); });
  });
  renderBookmarkStrip();
}

/* ================= SEARCH ================= */
function initSearch() {
  const input = document.getElementById('global-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;
  const items = [];
  document.querySelectorAll('section.section').forEach(sec => {
    const id = sec.id.replace('section-', '');
    const title = sec.querySelector('h2')?.textContent.trim() || id;
    const text = sec.innerText.replace(/\s+/g, ' ').slice(0, 400);
    items.push({ id, title, text });
  });
  document.querySelectorAll('#glossary-grid .glossary-item, #glossary-grid article, #glossary-grid .glass-card').forEach(el => {
    items.push({ id: 'flashcards', title: el.querySelector('h3, strong, .g-term')?.textContent || 'Glossary', text: el.innerText });
  });
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.hidden = true; results.innerHTML = ''; return; }
    const hits = items.filter(it => (it.title + ' ' + it.text).toLowerCase().includes(q)).slice(0, 8);
    results.hidden = !hits.length;
    results.innerHTML = hits.map(h => `<button type="button" data-go="${h.id}"><strong>${h.title}</strong><span>${h.text.slice(0, 90)}…</span></button>`).join('')
      || '';
    if (!hits.length) { results.hidden = false; results.innerHTML = `<p class="search-empty">No matches for “${input.value.trim()}”.</p>`; }
    results.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      location.hash = b.dataset.go;
      results.hidden = true;
      input.value = '';
    }));
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) results.hidden = true;
  });
}

/* ================= NOTES ================= */
function initNotes() {
  const area = document.getElementById('study-notes');
  const dl = document.getElementById('download-notes');
  if (!area) return;
  area.value = localStorage.getItem(NOTES_KEY) || '';
  area.addEventListener('input', () => localStorage.setItem(NOTES_KEY, area.value));
  dl?.addEventListener('click', () => {
    const body = area.value.trim() || 'No notes yet.';
    const blob = new Blob(
      [`LIPOVERSE study notes\n${new Date().toISOString().slice(0, 10)}\n\n${body}\n`],
      { type: 'text/plain' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lipoverse-notes.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

/* ================= LAB: extrusion + checks ================= */
function initLabExtras() {
  const tabs = document.getElementById('lab-tabs');
  const panel = document.getElementById('lab-panel');
  if (!tabs || !panel || tabs.querySelector('[data-method="extrusion"]')) return;
  const btn = document.createElement('button');
  btn.className = 'ctrl-btn';
  btn.dataset.method = 'extrusion';
  btn.textContent = 'Membrane Extrusion';
  const micro = tabs.querySelector('[data-method="microfluidic"]');
  if (micro) tabs.insertBefore(btn, micro.nextSibling); else tabs.appendChild(btn);

  const method = {
    name: 'Membrane Extrusion',
    principle: 'A coarse suspension is forced through track-etched polycarbonate membranes of defined pore size. Repeated passes reduce and narrow the size distribution. Extrusion is often the sizing step after thin-film hydration, not a separate lipid-film method.',
    materials: ['Hydrated MLV suspension', 'Polycarbonate membranes (e.g. 100 nm or 200 nm)', 'Extruder + gas pressure or syringes', 'Support filters'],
    steps: [
      ['1', 'Hydrate a lipid film to form a polydisperse MLV suspension.'],
      ['2', 'Assemble the extruder with a membrane of the target pore size, often stacked with a drain disc.'],
      ['3', 'Pass the suspension through the membrane, typically 10 or more times, above the lipid transition temperature.'],
      ['4', 'Collect the sized suspension and confirm diameter and PDI by dynamic light scattering.'],
    ],
    pros: ['Tight, reproducible size control', 'Scales from syringes to larger extruders', 'Standard route to SUVs and small LUVs'],
    cons: ['Clogs with concentrated or unfiltered samples', 'Lipid loss on the membrane', 'Does not by itself load a remote gradient'],
    check: {
      q: 'Why is the suspension usually passed through the membrane many times, not once?',
      options: [
        'Each pass further reduces large vesicles that did not pass as smaller ones',
        'One pass always yields a monodisperse 50 nm population',
        'Repeated passes remove all cholesterol',
      ],
      answer: 0,
      why: 'Early passes still contain vesicles larger than the pore. Repeated passes narrow the distribution; they do not guarantee one exact diameter.',
    },
  };

  function renderCheck(host, check) {
    host.insertAdjacentHTML('beforeend', `
      <div class="lab-check">
        <h4>Knowledge check</h4>
        <p>${check.q}</p>
        <div class="lab-check-opts">
          ${check.options.map((o, i) => `<button type="button" data-i="${i}">${o}</button>`).join('')}
        </div>
        <p class="lab-check-why" hidden></p>
      </div>`);
    const why = host.querySelector('.lab-check-why');
    host.querySelectorAll('.lab-check-opts button').forEach(b => b.addEventListener('click', () => {
      const ok = Number(b.dataset.i) === check.answer;
      host.querySelectorAll('.lab-check-opts button').forEach(x => x.disabled = true);
      b.classList.add(ok ? 'ok' : 'bad');
      why.hidden = false;
      why.textContent = (ok ? 'Correct. ' : 'Not quite. ') + check.why;
    }));
  }

  const checks = {
    thinfilm: { q: 'What does hydrating the dry lipid film mainly produce before sizing?', options: ['Mostly giant unilamellar vesicles of one size', 'A polydisperse suspension often rich in MLVs', 'Only PEGylated SUVs'], answer: 1, why: 'Thin-film hydration classically yields multilamellar, polydisperse vesicles. Extrusion or sonication is used afterward to size them.' },
    reverse: { q: 'Where does the aqueous drug sit during reverse-phase evaporation?', options: ['Only in the organic solvent', 'In water droplets inside a water-in-oil emulsion, later the vesicle core', 'Bound exclusively to PEG chains'], answer: 1, why: 'The emulsion traps aqueous droplets. Removing solvent leaves those droplets as the internal aqueous volume.' },
    ethanol: { q: 'What drives vesicle formation in ethanol injection?', options: ['Lipids crashing out of water as the solvent is diluted', 'Heating lipids above 200 °C', 'Adding detergent above its CMC only'], answer: 0, why: 'Lipids dissolved in ethanol (or another water-miscible solvent) self-assemble as the solvent mixes into excess aqueous phase.' },
    detergent: { q: 'What must be removed to leave closed vesicles?', options: ['All phospholipid', 'Detergent, until its concentration falls below the level that keeps mixed micelles', 'Cholesterol only'], answer: 1, why: 'Detergent holds lipids in micelles. Dialysis, dilution, or beads drop detergent below that threshold and bilayers close.' },
    microfluidic: { q: 'What mainly sets vesicle size in a hydrodynamic-focusing chip?', options: ['Only the color of the lipids', 'Flow-rate ratio and mixing of solvent and aqueous streams', 'The brand of the glass vial downstream'], answer: 1, why: 'The flow-rate ratio controls how fast solvent is diluted. Faster, controlled mixing tends to give smaller, more uniform vesicles.' },
  };

  btn.addEventListener('click', () => {
    tabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
    panel.innerHTML = `
      <h3>${method.name}</h3>
      <p class="lab-principle"><strong>Principle:</strong> ${method.principle}</p>
      <div class="lab-materials">${method.materials.map(x => `<span class="chip">${x}</span>`).join('')}</div>
      <div class="lab-cols">
        <div>
          <h4 style="font-family:var(--font-display);margin-bottom:10px">Preparation Stages</h4>
          <ol class="lab-steps">${method.steps.map(s => `<li><strong>${s[0]}.</strong> ${s[1]}</li>`).join('')}</ol>
        </div>
        <div class="lab-side">
          <h4>✅ Advantages</h4>
          <ul class="lab-pros">${method.pros.map(x => `<li>${x}</li>`).join('')}</ul>
          <h4>⚠️ Limitations</h4>
          <ul class="lab-cons">${method.cons.map(x => `<li>${x}</li>`).join('')}</ul>
        </div>
      </div>`;
    renderCheck(panel, method.check);
  });

  const orig = new MutationObserver(() => {
    if (panel.querySelector('.lab-check')) return;
    const active = tabs.querySelector('button.active');
    const id = active?.dataset.method;
    if (id && checks[id] && panel.querySelector('h3')) renderCheck(panel, checks[id]);
  });
  orig.observe(panel, { childList: true });
  if (panel.querySelector('h3')) {
    const id = tabs.querySelector('button.active')?.dataset.method;
    if (id && checks[id]) renderCheck(panel, checks[id]);
  }
}

/* ================= LOADING: capacity + numbers ================= */
function initLoadingExtras() {
  const section = document.getElementById('section-loading');
  if (!section || document.getElementById('capacity-panel')) return;
  const host = document.createElement('div');
  host.className = 'capacity-panel card';
  host.id = 'capacity-panel';
  host.innerHTML = `
    <h3>Encapsulation efficiency vs drug-loading capacity</h3>
    <p class="ee-note">These are different ratios. Encapsulation efficiency asks what fraction of the drug you added ended up inside. Loading capacity asks how much drug mass the vesicle mass can carry. A process can trap most of a tiny dose (high EE, low capacity) or carry a heavy cargo inefficiently.</p>
    <div class="cap-grid">
      <label>Drug added (mg)<input id="cap-added" type="number" min="0" step="0.1" value="10"></label>
      <label>Drug trapped inside (mg)<input id="cap-trapped" type="number" min="0" step="0.1" value="8"></label>
      <label>Total formulation mass (mg)<input id="cap-total" type="number" min="0" step="0.1" value="100"></label>
    </div>
    <div class="cap-out">
      <div><span>Encapsulation efficiency</span><strong id="cap-ee">—</strong></div>
      <div><span>Drug-loading capacity</span><strong id="cap-dlc">—</strong></div>
    </div>
    <p id="cap-warn" class="ee-note"></p>`;
  section.querySelector('.section-inner')?.appendChild(host);
  const added = host.querySelector('#cap-added');
  const trapped = host.querySelector('#cap-trapped');
  const total = host.querySelector('#cap-total');
  const calc = () => {
    const a = Number(added.value), t = Number(trapped.value), m = Number(total.value);
    const warn = host.querySelector('#cap-warn');
    if (![a, t, m].every(n => Number.isFinite(n)) || a < 0 || t < 0 || m <= 0) {
      warn.textContent = 'Enter non-negative amounts and a formulation mass above zero.';
      return;
    }
    if (t > a) { warn.textContent = 'Trapped drug cannot exceed drug added — check the assay.'; return; }
    warn.textContent = 'EE = trapped / added. Capacity = trapped / total formulation mass. Both are shown as percentages.';
    host.querySelector('#cap-ee').textContent = `${((t / a) * 100).toFixed(1)}%`;
    host.querySelector('#cap-dlc').textContent = `${((t / m) * 100).toFixed(1)}%`;
  };
  [added, trapped, total].forEach(el => el.addEventListener('input', calc));
  calc();
}

/* ================= SIM PAUSE + CAVEAT ================= */
function initSimExtras() {
  const section = document.getElementById('section-simulation');
  if (section && !document.getElementById('sim-caveat')) {
    const note = document.createElement('p');
    note.id = 'sim-caveat';
    note.className = 'sim-caveat';
    note.textContent = 'This is one teaching pathway: circulation, leaky-tumor accumulation, cell contact, uptake, and release. Real liposomes do not all follow it. Some release drug outside the cell, some fuse, some are cleared by liver and spleen macrophages, and some products are meant to act locally rather than in a tumor. The animation is a model, not a claim that every vesicle uses these stages.';
    section.querySelector('.section-inner')?.appendChild(note);
  }
}

/* ================= RESEARCH ================= */
const PAPERS = [
  { year: '2024', title: 'Liposomes: the next generation', authors: 'Large, Kros et al.', source: 'Nature Reviews Bioengineering', url: 'https://www.nature.com/articles/s44222-024-00253-7', note: 'Overview of where liposome design is heading after the first clinical generation.' },
  { year: '2023', title: 'Liposomes for drug delivery: vesicular composition, release, and loading', authors: 'Pande S.', source: 'Artificial Cells, Nanomedicine, and Biotechnology', url: 'https://pubmed.ncbi.nlm.nih.gov/37594208/', note: 'Review of composition and of what actually changes release and loading.' },
  { year: '2022', title: 'A Review of Liposomes as a Drug Delivery System: Current Status of Approved Products, Regulatory Environments, and Future Perspectives', authors: 'Liu, Chen, Zhang', source: 'Molecules', url: 'https://www.mdpi.com/1420-3049/27/4/1372', note: 'Approved products and the regulatory frame around them.' },
  { year: '2021', title: 'Liposomes: Advancements and innovation in the manufacturing process', authors: 'Shah et al.', source: 'Advanced Drug Delivery Reviews', url: 'https://pubmed.ncbi.nlm.nih.gov/34273421/', note: 'Why microfluidic and continuous methods matter for scale, not only for the bench.' },
];

function initResearch() {
  const list = document.getElementById('research-list');
  if (!list) return;
  list.innerHTML = PAPERS.map(p => `
    <article class="research-card">
      <span class="research-year">${p.year}</span>
      <h3><a href="${p.url}" target="_blank" rel="noopener noreferrer">${p.title}</a></h3>
      <p class="research-meta">${p.authors} · ${p.source}</p>
      <p>${p.note}</p>
    </article>`).join('');
}

/* ================= QUIZ EXTRAS ================= */
const MATCH = [
  ['SUV', 'One bilayer, typically tens of nanometres'],
  ['MLV', 'Many concentric bilayers, like an onion'],
  ['PEG', 'Hydrophilic corona that slows protein binding'],
  ['Gradient loading', 'Drug crosses the bilayer, then is trapped inside'],
];
const ORDER = ['Circulation', 'Extravasation', 'Cell contact', 'Uptake', 'Release'];
const LABEL = [
  { id: 'head', name: 'Head-group' },
  { id: 'tail', name: 'Fatty tails' },
  { id: 'chol', name: 'Cholesterol' },
  { id: 'core', name: 'Aqueous core' },
];

function initQuizExtras() {
  const root = document.getElementById('quiz-extra');
  if (!root) return;
  const state = loadJSON(QUIZ_EX_KEY, { match: null, order: null, label: null });

  root.querySelector('#match-board').innerHTML = `
    <div class="match-col">${MATCH.map((m, i) => `<button type="button" class="match-term" data-i="${i}">${m[0]}</button>`).join('')}</div>
    <div class="match-col">${MATCH.map((m, i) => `<button type="button" class="match-def" data-i="${i}">${m[1]}</button>`).join('')}</div>
    <p id="match-status" class="ee-note">Select a term, then its description.</p>`;
  let picked = null;
  const terms = [...root.querySelectorAll('.match-term')];
  const defs = [...root.querySelectorAll('.match-def')];
  const status = root.querySelector('#match-status');
  const solved = new Set(state.match || []);
  function paintMatch() {
    terms.forEach(t => t.classList.toggle('solved', solved.has(Number(t.dataset.i))));
    defs.forEach(d => d.classList.toggle('solved', solved.has(Number(d.dataset.i))));
    if (solved.size === MATCH.length) {
      status.textContent = 'All four pairs matched.';
      state.match = [...solved];
      saveJSON(QUIZ_EX_KEY, state);
    }
  }
  paintMatch();
  terms.forEach(t => t.addEventListener('click', () => {
    if (solved.has(Number(t.dataset.i))) return;
    picked = Number(t.dataset.i);
    terms.forEach(x => x.classList.toggle('picked', x === t));
  }));
  defs.forEach(d => d.addEventListener('click', () => {
    if (picked == null) return;
    if (Number(d.dataset.i) === picked) {
      solved.add(picked);
      picked = null;
      terms.forEach(x => x.classList.remove('picked'));
      paintMatch();
    } else status.textContent = 'Those do not pair. Try the other description.';
  }));

  const orderList = root.querySelector('#order-list');
  let order = state.order || [...ORDER].reverse();
  function paintOrder() {
    orderList.innerHTML = order.map((name, i) => `<li><button type="button" data-i="${i}" aria-label="Move ${name} up">↑</button><span>${name}</span></li>`).join('');
    orderList.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      if (i === 0) return;
      [order[i - 1], order[i]] = [order[i], order[i - 1]];
      paintOrder();
    }));
  }
  paintOrder();
  root.querySelector('#order-check').addEventListener('click', () => {
    const ok = order.every((n, i) => n === ORDER[i]);
    root.querySelector('#order-status').textContent = ok
      ? 'That matches this teaching sequence. Remember it is not the only biological route.'
      : 'Not yet. This model’s order is circulation, extravasation, contact, uptake, release.';
    if (ok) { state.order = order; saveJSON(QUIZ_EX_KEY, state); }
  });

  const board = root.querySelector('#label-board');
  const bank = root.querySelector('#label-bank');
  board.innerHTML = LABEL.map(p => `<div class="label-slot" data-part="${p.id}"><span>${p.id}</span><em>drop</em></div>`).join('');
  const names = state.label ? LABEL.map(p => state.label[p.id]).filter(Boolean) : [...LABEL.map(p => p.name)].sort(() => Math.random() - 0.5);
  bank.innerHTML = (state.label ? [] : names).map(n => `<button type="button" draggable="true" data-name="${n}">${n}</button>`).join('');
  if (state.label) {
    LABEL.forEach(p => {
      const slot = board.querySelector(`[data-part="${p.id}"] em`);
      if (slot && state.label[p.id]) slot.textContent = state.label[p.id];
    });
  }
  let dragName = null;
  bank.querySelectorAll('button').forEach(b => {
    b.addEventListener('dragstart', () => { dragName = b.dataset.name; });
    b.addEventListener('click', () => { dragName = b.dataset.name; bank.querySelectorAll('button').forEach(x => x.classList.toggle('picked', x === b)); });
  });
  board.querySelectorAll('.label-slot').forEach(slot => {
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', e => { e.preventDefault(); place(slot); });
    slot.addEventListener('click', () => place(slot));
  });
  function place(slot) {
    if (!dragName) return;
    slot.querySelector('em').textContent = dragName;
    const btn = [...bank.querySelectorAll('button')].find(b => b.dataset.name === dragName);
    btn?.remove();
    dragName = null;
    const placed = {};
    board.querySelectorAll('.label-slot').forEach(s => { placed[s.dataset.part] = s.querySelector('em').textContent; });
    if (Object.values(placed).every(v => v && v !== 'drop')) {
      const ok = LABEL.every(p => placed[p.id] === p.name);
      root.querySelector('#label-status').textContent = ok ? 'Labels match the explorer’s four parts.' : 'One or more labels are on the wrong part.';
      if (ok) { state.label = placed; saveJSON(QUIZ_EX_KEY, state); }
    }
  }

  root.querySelector('#review-btn').addEventListener('click', () => {
    const box = root.querySelector('#review-box');
    const wrong = loadJSON('lipoverse-wrong', []);
    box.hidden = false;
    box.innerHTML = wrong.length
      ? wrong.map(w => `<p><strong>${w.q}</strong><br>Correct: ${w.correct}. ${w.explanation || ''}</p>`).join('')
      : '<p>No missed questions saved yet. Finish the multiple-choice quiz first — misses are stored in this browser.</p>';
  });
}

/* ================= 3D GALLERY ================= */
const GALLERY = [
  { id: 'suv', name: 'SUV', blurb: 'One thin bilayer, small diameter. High curvature packs the heads tightly.', size: 0.62, layers: 1, peg: 0, charge: 0, ligand: 0, pores: 0, thermo: 0 },
  { id: 'luv', name: 'LUV', blurb: 'One bilayer, larger than an SUV, with a roomy aqueous core.', size: 1.05, layers: 1, peg: 0, charge: 0, ligand: 0, pores: 0, thermo: 0 },
  { id: 'guv', name: 'GUV', blurb: 'Giant and still unilamellar — cell-scale, not a drug-vial SUV.', size: 1.55, layers: 1, peg: 0, charge: 0, ligand: 0, pores: 0, thermo: 0 },
  { id: 'mlv', name: 'MLV', blurb: 'Onion of concentric bilayers. Cargo can sit between lamellae as well as in the core.', size: 1.15, layers: 4, peg: 0, charge: 0, ligand: 0, pores: 0, thermo: 0 },
  { id: 'olv', name: 'OLV', blurb: 'Oligolamellar: a few bilayers, not a full onion and not a single shell.', size: 1.1, layers: 2, peg: 0, charge: 0, ligand: 0, pores: 0, thermo: 0 },
  { id: 'mvv', name: 'MVV', blurb: 'A large vesicle holding smaller vesicles — multivesicular, not multilamellar.', size: 1.25, layers: 1, peg: 0, charge: 0, ligand: 0, pores: 0, thermo: 0, inner: 5 },
  { id: 'peg', name: 'PEGylated', blurb: 'Polymer chains on the outer heads. The corona is the stealth feature, not a second bilayer.', size: 0.9, layers: 1, peg: 1, charge: 0, ligand: 0, pores: 0, thermo: 0 },
  { id: 'cat', name: 'Cationic', blurb: 'Positive head-groups, drawn as a blue outer charge haze. Used carefully — charge also raises toxicity.', size: 0.9, layers: 1, peg: 0, charge: 1, ligand: 0, pores: 0, thermo: 0 },
  { id: 'an', name: 'Anionic', blurb: 'Negative head-groups, drawn as an amber outer haze. Charge changes protein binding and uptake.', size: 0.9, layers: 1, peg: 0, charge: -1, ligand: 0, pores: 0, thermo: 0 },
  { id: 'tgt', name: 'Targeted', blurb: 'Ligands (small gold markers) on the surface for a receptor. Targeting is not the same as PEG.', size: 0.9, layers: 1, peg: 0.4, charge: 0, ligand: 1, pores: 0, thermo: 0 },
  { id: 'ph', name: 'pH-sensitive', blurb: 'Open pores in the shell — a picture of acid-triggered leak, not a measurement of a pKa.', size: 0.9, layers: 1, peg: 0, charge: 0, ligand: 0, pores: 1, thermo: 0 },
  { id: 'th', name: 'Thermosensitive', blurb: 'Warm rim and a softened shell. Mild heat can loosen packing near the transition.', size: 0.9, layers: 1, peg: 0, charge: 0, ligand: 0, pores: 0, thermo: 1 },
];

let galleryState = { built: false, renderer: null, scene: null, camera: null, clock: null, mesh: null, frame: 0, index: 0 };

function makeVesicle(spec) {
  const group = new THREE.Group();
  const s = spec.size;
  const shellColor = spec.thermo ? 0xE07A4A : spec.charge > 0 ? 0x7EB6FF : spec.charge < 0 ? 0xE4C99A : 0xF6E7C1;
  const innerColor = 0x1F8A68;
  for (let i = 0; i < spec.layers; i++) {
    const r = (0.72 - i * 0.14) * s;
    if (r < 0.18) break;
    const geo = new THREE.SphereGeometry(r, 40, 28);
    const mat = new THREE.MeshPhysicalMaterial({
      color: i === 0 ? shellColor : 0xC4A46A,
      roughness: 0.28,
      metalness: 0.04,
      transmission: spec.pores ? 0.45 : 0.72,
      thickness: 0.25,
      transparent: true,
      opacity: spec.pores ? 0.55 : 0.82,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    if (spec.pores && i === 0) {
      for (let p = 0; p < 7; p++) {
        const hole = new THREE.Mesh(
          new THREE.SphereGeometry(0.07 * s, 12, 10),
          new THREE.MeshBasicMaterial({ color: 0x04140F })
        );
        const dir = new THREE.Vector3().randomDirection();
        hole.position.copy(dir.multiplyScalar(r * 0.98));
        group.add(hole);
      }
    }
  }
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.28 * s, 24, 18),
    new THREE.MeshStandardMaterial({ color: innerColor, roughness: 0.4, emissive: 0x0c3d2e, emissiveIntensity: 0.4 })
  );
  group.add(core);
  if (spec.inner) {
    const pts = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < spec.inner; i++) {
      const baby = new THREE.Mesh(
        new THREE.SphereGeometry(0.16 * s, 18, 14),
        new THREE.MeshPhysicalMaterial({ color: 0xF6E7C1, transmission: 0.6, roughness: 0.3, transparent: true, opacity: 0.9 })
      );
      const a = (i / spec.inner) * Math.PI * 2;
      baby.position.set(Math.cos(a) * 0.42 * s, Math.sin(a * 2) * 0.18 * s, Math.sin(a) * 0.42 * s);
      group.add(baby);
      pts.add(baby.position);
    }
  }
  if (spec.peg) {
    const hairs = new THREE.Group();
    for (let i = 0; i < 36; i++) {
      const dir = new THREE.Vector3().randomDirection();
      const len = (0.22 + Math.random() * 0.18) * spec.peg;
      const hair = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, len, 5),
        new THREE.MeshStandardMaterial({ color: 0x8FD4C0, emissive: 0x1F8A68, emissiveIntensity: 0.25 })
      );
      hair.position.copy(dir.clone().multiplyScalar(0.72 * s + len / 2));
      hair.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      hairs.add(hair);
    }
    group.add(hairs);
  }
  if (spec.ligand) {
    for (let i = 0; i < 10; i++) {
      const dir = new THREE.Vector3().randomDirection();
      const lig = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xC9A15A, emissive: 0xC9A15A, emissiveIntensity: 0.35 })
      );
      lig.position.copy(dir.multiplyScalar(0.78 * s));
      group.add(lig);
    }
  }
  if (spec.charge) {
    const haze = new THREE.Mesh(
      new THREE.SphereGeometry(0.92 * s, 28, 20),
      new THREE.MeshBasicMaterial({
        color: spec.charge > 0 ? 0x7EB6FF : 0xC9845A,
        transparent: true,
        opacity: 0.14,
        side: THREE.BackSide,
      })
    );
    group.add(haze);
  }
  if (spec.thermo) {
    const rim = new THREE.Mesh(
      new THREE.SphereGeometry(0.8 * s, 28, 20),
      new THREE.MeshBasicMaterial({ color: 0xE07A4A, transparent: true, opacity: 0.12, side: THREE.BackSide })
    );
    group.add(rim);
  }
  return group;
}

function showGalleryModel(i) {
  const spec = GALLERY[i];
  galleryState.index = i;
  const stage = galleryState.scene.getObjectByName('vesicle');
  if (stage) galleryState.scene.remove(stage);
  const mesh = makeVesicle(spec);
  mesh.name = 'vesicle';
  galleryState.scene.add(mesh);
  galleryState.mesh = mesh;
  const name = document.getElementById('gallery-name');
  const blurb = document.getElementById('gallery-blurb');
  if (name) name.textContent = spec.name;
  if (blurb) blurb.textContent = spec.blurb;
  document.querySelectorAll('#gallery-picks button').forEach(b => b.classList.toggle('active', b.dataset.id === spec.id));
}

function initGallery() {
  const canvas = document.getElementById('gallery-canvas');
  const picks = document.getElementById('gallery-picks');
  if (!canvas || !picks || galleryState.built) return;
  picks.innerHTML = GALLERY.map(g => `<button type="button" class="ctrl-btn" data-id="${g.id}">${g.name}</button>`).join('');
  picks.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    showGalleryModel(GALLERY.findIndex(g => g.id === b.dataset.id));
  }));

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
  camera.position.set(0, 0.4, 3.4);
  scene.add(new THREE.AmbientLight(0xF8F1E3, 0.55));
  const key = new THREE.DirectionalLight(0xF6E7C1, 1.4);
  key.position.set(3, 4, 5);
  scene.add(key);
  const fill = new THREE.PointLight(0x1F8A68, 8, 12);
  fill.position.set(-3, -1, 2);
  scene.add(fill);
  galleryState = { built: true, renderer, scene, camera, mesh: null, index: 0, running: false };

  const resize = () => {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 640;
    const h = canvas.clientHeight || 420;
    if (canvas.width !== Math.floor(w * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  };
  const loop = () => {
    if (!galleryState.running) return;
    galleryState.frame = requestAnimationFrame(loop);
    resize();
    if (galleryState.mesh) galleryState.mesh.rotation.y += 0.006;
    renderer.render(scene, camera);
  };
  showGalleryModel(0);
  const section = document.getElementById('section-gallery');
  const watch = new MutationObserver(() => {
    const on = section?.classList.contains('active');
    if (on && !galleryState.running) {
      galleryState.running = true;
      loop();
    } else if (!on && galleryState.running) {
      galleryState.running = false;
      cancelAnimationFrame(galleryState.frame);
    }
  });
  if (section?.classList.contains('active')) {
    galleryState.running = true;
    loop();
  }
  if (section) watch.observe(section, { attributes: true, attributeFilter: ['class'] });
}

export function initUpgrade() {
  initTheme();
  initContinue();
  initSearch();
  initNotes();
  initLabExtras();
  initLoadingExtras();
  initSimExtras();
  initResearch();
  initQuizExtras();
  initGallery();
}
