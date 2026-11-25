/* LIPOVERSE additive modules: gallery, lab extras, loading extras, quiz extras,
   bookmarks, search, continue, notes, research, theme. Does not replace existing modules. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

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
    btn.textContent = light ? 'Dark' : 'Light';
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
    const label = document.querySelector(`#section-${id} h1`)?.textContent.trim() || id;
    return `<button type="button" data-go="${id}">${label}</button>`;
  }).join('');
  strip.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
    window.LipoverseNav?.show(b.dataset.go);
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
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
let searchItems = [];
function rebuildSearch() {
  searchItems = [];
  document.querySelectorAll('section.section').forEach(sec => {
    const id = sec.id.replace('section-', '');
    const title = sec.querySelector('h1')?.textContent.trim() || sec.querySelector('h2')?.textContent.trim() || id;
    const text = sec.innerText.replace(/\s+/g, ' ').slice(0, 1600);
    searchItems.push({ id, title, text });
  });
  document.querySelectorAll('#glossary-grid .glossary-item').forEach(el => {
    searchItems.push({ id: 'flashcards', title: el.querySelector('h4')?.textContent || 'Glossary', text: el.innerText });
  });
  if (typeof GALLERY !== 'undefined') {
    GALLERY.forEach(g => searchItems.push({ id: 'gallery', title: g.name, text: g.blurb }));
  }
  if (typeof PAPERS !== 'undefined') {
    PAPERS.forEach(p => searchItems.push({ id: 'research', title: p.title, text: `${p.authors} ${p.source} ${p.note}` }));
  }
}
function initSearch() {
  const input = document.getElementById('global-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;
  rebuildSearch();
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.hidden = true; results.innerHTML = ''; return; }
    const hits = searchItems.filter(it => (it.title + ' ' + it.text).toLowerCase().includes(q)).slice(0, 8);
    if (!hits.length) {
      results.hidden = false;
      results.innerHTML = `<p class="search-empty">No matches for “${esc(input.value.trim())}”.</p>`;
      return;
    }
    results.hidden = false;
    results.innerHTML = hits.map(h => `<button type="button" data-go="${esc(h.id)}"><strong>${esc(h.title)}</strong><span>${esc(h.text.slice(0, 90))}…</span></button>`).join('');
    results.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      window.LipoverseNav?.show(b.dataset.go);
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
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  });
}

/* ================= LAB: extrusion + checks ================= */
function initLabExtras() {
  const tabs = document.getElementById('lab-tabs');
  const panel = document.getElementById('lab-panel');
  if (!tabs || !panel) return;
  const hasExtrusion = !!tabs.querySelector('[data-method="extrusion"]');
  const btn = hasExtrusion ? null : document.createElement('button');
  if (btn) {
  btn.className = 'ctrl-btn';
  btn.dataset.method = 'extrusion';
  btn.textContent = 'Membrane Extrusion';
  const micro = tabs.querySelector('[data-method="microfluidic"]');
  if (micro) tabs.insertBefore(btn, micro.nextSibling); else tabs.appendChild(btn);
  }

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
    extrusion: { q: 'Why is the suspension usually passed through the membrane many times, not once?', options: ['Each pass further reduces large vesicles that did not yet pass as smaller ones', 'One pass always yields a monodisperse 50 nm population', 'Repeated passes remove all cholesterol'], answer: 0, why: 'Early passes still contain vesicles larger than the pore. Repeated passes narrow the distribution; they do not guarantee one exact diameter.' },
  };

  btn?.addEventListener('click', () => {
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
  let host = document.getElementById('capacity-panel');
  if (!host && section) {
    host = document.createElement('div');
    host.className = 'capacity-panel glass-card';
    host.id = 'capacity-panel';
    host.innerHTML = `
      <h3>Encapsulation efficiency vs drug-loading capacity</h3>
      <p class="ee-note">These are different ratios. Encapsulation efficiency asks what fraction of the drug you added ended up inside. Loading capacity asks how much drug mass the vesicle mass can carry.</p>
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
    section.querySelector('.next-bar')?.before(host);
  }
  if (!host) return;
  const added = host.querySelector('#cap-added');
  const trapped = host.querySelector('#cap-trapped');
  const total = host.querySelector('#cap-total');
  const calc = () => {
    const a = Number(added.value), t = Number(trapped.value), m = Number(total.value);
    const warn = host.querySelector('#cap-warn');
    if (![a, t, m].every(n => Number.isFinite(n)) || a <= 0 || t < 0 || m <= 0) {
      warn.textContent = 'Enter a drug amount above zero and a formulation mass above zero.';
      host.querySelector('#cap-ee').textContent = '—';
      host.querySelector('#cap-dlc').textContent = '—';
      return;
    }
    if (t > a) {
      warn.textContent = 'Trapped drug cannot exceed drug added — check the assay.';
      host.querySelector('#cap-ee').textContent = '—';
      host.querySelector('#cap-dlc').textContent = '—';
      return;
    }
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
    section.querySelector('.next-bar')?.before(note);
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
    <article class="research-card glass-card">
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

  const defOrder = MATCH.map((_, i) => i).sort(() => Math.random() - 0.5);
  root.querySelector('#match-board').innerHTML = `
    <div class="match-col">${MATCH.map((m, i) => `<button type="button" class="match-term" data-i="${i}">${m[0]}</button>`).join('')}</div>
    <div class="match-col">${defOrder.map(i => `<button type="button" class="match-def" data-i="${i}">${MATCH[i][1]}</button>`).join('')}</div>
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
  { id: 'suv', name: 'SUV', blurb: 'Small unilamellar vesicle: one bilayer and a limited aqueous core.', shells: [{ r: 0.92, n: 150 }] },
  { id: 'luv', name: 'LUV', blurb: 'Large unilamellar vesicle: one bilayer, with more room in the aqueous core.', shells: [{ r: 1.48, n: 210 }] },
  { id: 'guv', name: 'GUV', blurb: 'Giant unilamellar vesicle: still one bilayer, on a much larger scale.', shells: [{ r: 2.15, n: 280 }] },
  { id: 'mlv', name: 'MLV', blurb: 'Multilamellar vesicle: concentric bilayers. Cargo can sit between the lamellae as well as in the core.', shells: [{ r: 1.92, n: 170 }, { r: 1.46, n: 120 }, { r: 1.04, n: 84 }, { r: 0.66, n: 52 }] },
  { id: 'olv', name: 'OLV', blurb: 'Oligolamellar vesicle: a few bilayers, fewer than a classical MLV.', shells: [{ r: 1.62, n: 160 }, { r: 1.16, n: 100 }] },
  { id: 'mvv', name: 'MVV', blurb: 'Multivesicular vesicle: smaller vesicles enclosed in one larger vesicle.', shells: [{ r: 1.82, n: 170 }], inner: 5 },
  { id: 'peg', name: 'PEGylated', blurb: 'PEG chains extend from the outer heads and slow protein binding.', shells: [{ r: 1.32, n: 160 }], peg: 1 },
  { id: 'cat', name: 'Cationic', blurb: 'Cationic head-groups give the surface a positive charge.', shells: [{ r: 1.32, n: 160 }], head: 0x7EB6FF },
  { id: 'an', name: 'Anionic', blurb: 'Anionic head-groups give the surface a negative charge.', shells: [{ r: 1.32, n: 160 }], head: 0xF472B6 },
  { id: 'tgt', name: 'Targeted', blurb: 'Ligands on the surface are intended to bind a receptor.', shells: [{ r: 1.32, n: 160 }], ligand: 1 },
  { id: 'ph', name: 'pH-sensitive', blurb: 'The opening shows how an acid trigger can let the core leak. This is a model, not a measured pKa.', shells: [{ r: 1.32, n: 170 }], pore: 1 },
  { id: 'th', name: 'Thermosensitive', blurb: 'Looser packing near the transition temperature. Mild heat can disorder the shell.', shells: [{ r: 1.32, n: 120 }], head: 0xFB7185, loose: 1 },
];

let galleryState = { built: false, renderer: null, scene: null, camera: null, controls: null, mesh: null, frame: 0, running: false };

function fibonacciSphere(n) {
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const denom = Math.max(1, n - 1);
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / denom) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * rad, y, Math.sin(theta) * rad));
  }
  return pts;
}

function orientedCylinder(from, to, radius) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = Math.max(0.001, dir.length());
  const geo = new THREE.CylinderGeometry(radius, radius, len, 5);
  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  geo.applyMatrix4(new THREE.Matrix4().compose(mid, quat, new THREE.Vector3(1, 1, 1)));
  return geo;
}

function sphereAt(pos, radius, seg) {
  const geo = new THREE.SphereGeometry(radius, seg || 8, seg || 8);
  geo.translate(pos.x, pos.y, pos.z);
  return geo;
}

function lipidMat(color, opts) {
  return new THREE.MeshStandardMaterial(Object.assign({
    color, roughness: 0.32, metalness: 0.08,
    emissive: color, emissiveIntensity: 0.16,
  }, opts || {}));
}

function addPeg(group, radius) {
  const geos = [];
  fibonacciSphere(32).forEach(d => {
    const len = 0.26 + Math.random() * 0.2;
    const start = d.clone().multiplyScalar(radius + 0.03);
    const end = d.clone().multiplyScalar(radius + 0.03 + len);
    geos.push(orientedCylinder(start, end, 0.016));
    geos.push(sphereAt(end, 0.03, 6));
  });
  group.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(geos), lipidMat(0xE9D5FF)));
}

function addLigands(group, radius) {
  const geos = [];
  fibonacciSphere(14).forEach(d => {
    const start = d.clone().multiplyScalar(radius + 0.02);
    const end = d.clone().multiplyScalar(radius + 0.2);
    geos.push(orientedCylinder(start, end, 0.012));
    geos.push(sphereAt(end, 0.055, 8));
  });
  group.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(geos), lipidMat(0xF0ABFC, { metalness: 0.4, emissiveIntensity: 0.28 })));
}

function addBilayer(group, radius, count, spec, flags) {
  const thick = spec.loose ? 0.36 : 0.26;
  const rOut = radius;
  const rIn = Math.max(0.2, radius - thick);
  const headR = Math.min(0.09, Math.max(0.042, radius * 0.05));
  const tailR = headR * 0.32;
  const headGeos = [];
  const tailGeos = [];
  const cholGeos = [];
  const up = new THREE.Vector3(0, 1, 0);
  fibonacciSphere(count).forEach(raw => {
    const d = raw.clone();
    if (spec.loose) d.addScaledVector(new THREE.Vector3().randomDirection(), 0.07).normalize();
    if (flags.pore && d.x > 0.42 && Math.abs(d.y) < 0.4 && d.z > -0.2) return;
    const perp = new THREE.Vector3().crossVectors(d, up);
    if (perp.lengthSq() < 0.01) perp.set(1, 0, 0);
    perp.normalize();
    headGeos.push(sphereAt(d.clone().multiplyScalar(rOut), headR, 7));
    headGeos.push(sphereAt(d.clone().multiplyScalar(rIn), headR * 0.9, 7));
    [-1, 1].forEach(sign => {
      const o = perp.clone().multiplyScalar(sign * headR * 0.42);
      const mid = (rOut + rIn) / 2;
      tailGeos.push(orientedCylinder(d.clone().multiplyScalar(rOut - headR * 0.15).add(o), d.clone().multiplyScalar(mid).add(o), tailR));
      tailGeos.push(orientedCylinder(d.clone().multiplyScalar(rIn + headR * 0.15).add(o), d.clone().multiplyScalar(mid).add(o), tailR));
    });
    if ((headGeos.length / 2) % 5 === 0) cholGeos.push(sphereAt(d.clone().multiplyScalar((rOut + rIn) / 2), headR * 0.5, 6));
  });
  if (!headGeos.length) return rOut;
  group.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(headGeos), lipidMat(spec.head || 0xC4B5FD)));
  group.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(tailGeos), lipidMat(0xEDE4FF, { roughness: 0.46 })));
  if (cholGeos.length) group.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(cholGeos), lipidMat(0xA78BFA, { roughness: 0.22 })));
  if (flags.core) {
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(0.08, rIn - headR), 28, 20),
      new THREE.MeshStandardMaterial({
        color: 0x6D28D9, transparent: true, opacity: 0.28, roughness: 0.18,
        emissive: 0x6D28D9, emissiveIntensity: 0.22, depthWrite: false, side: THREE.DoubleSide,
      })
    ));
    const waters = [];
    const limit = Math.max(0.05, rIn - headR * 1.6);
    for (let i = 0; i < 28; i++) waters.push(sphereAt(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * limit), headR * 0.4, 5));
    group.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(waters), lipidMat(0xDDD6FE, { roughness: 0.12 })));
  }
  if (flags.peg) addPeg(group, rOut);
  if (flags.ligand) addLigands(group, rOut);
  return rOut;
}

function makeVesicle(spec) {
  const group = new THREE.Group();
  spec.shells.forEach((shell, i) => {
    addBilayer(group, shell.r, shell.n, spec, {
      pore: i === 0 && spec.pore,
      peg: i === 0 && spec.peg,
      ligand: i === 0 && spec.ligand,
      core: i === spec.shells.length - 1 && !spec.inner,
    });
  });
  if (spec.inner) {
    for (let i = 0; i < spec.inner; i++) {
      const baby = new THREE.Group();
      addBilayer(baby, 0.36, 48, { head: 0xC4B5FD }, { core: true });
      const a = (i / spec.inner) * Math.PI * 2;
      baby.position.set(Math.cos(a) * 0.78, i % 2 ? 0.26 : -0.22, Math.sin(a) * 0.78);
      group.add(baby);
    }
  }
  return group;
}

let pendingModel = null;

function openGalleryModel(id) {
  pendingModel = id;
  window.LipoverseNav?.show('gallery');
  if (!galleryState.built) return;
  const i = GALLERY.findIndex(g => g.id === id);
  if (i >= 0) showGalleryModel(i);
}

function showGalleryModel(i) {
  const spec = GALLERY[i];
  if (!galleryState.scene) return;
  const prev = galleryState.scene.getObjectByName('vesicle');
  if (prev) {
    galleryState.scene.remove(prev);
    prev.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  }
  const mesh = makeVesicle(spec);
  mesh.name = 'vesicle';
  galleryState.scene.add(mesh);
  galleryState.mesh = mesh;
  const radius = Math.max(...spec.shells.map(s => s.r)) + (spec.peg ? 0.4 : 0.05);
  const dist = Math.max(3.6, radius * 2.85);
  galleryState.camera.position.set(dist * 0.16, dist * 0.34, dist);
  galleryState.controls.target.set(0, 0, 0);
  galleryState.controls.minDistance = Math.max(1.1, radius * 0.85);
  galleryState.controls.maxDistance = dist * 2.2;
  galleryState.controls.update();
  const name = document.getElementById('gallery-name');
  const blurb = document.getElementById('gallery-blurb');
  if (name) name.textContent = spec.name;
  if (blurb) blurb.textContent = spec.blurb;
  document.querySelectorAll('#gallery-picks button').forEach(b => b.classList.toggle('active', b.dataset.id === spec.id));
  document.querySelectorAll('[data-shape-row] button').forEach(b => b.classList.toggle('active', b.dataset.model === spec.id));
}

function initGallery() {
  const canvas = document.getElementById('gallery-canvas');
  const picks = document.getElementById('gallery-picks');
  if (!canvas || !picks) return;
  picks.innerHTML = GALLERY.map(g => `<button type="button" class="ctrl-btn" data-id="${g.id}">${g.name}</button>`).join('');
  picks.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    pendingModel = b.dataset.id;
    if (!galleryState.built) startGallery();
    else showGalleryModel(GALLERY.findIndex(g => g.id === b.dataset.id));
  }));
  document.querySelectorAll('[data-shape-row]').forEach(row => {
    row.innerHTML = GALLERY.map(g => `<button type="button" class="ctrl-btn" data-model="${g.id}">${g.name}</button>`).join('');
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => openGalleryModel(b.dataset.model)));
  });
  document.querySelector('[data-open-method="extrusion"]')?.addEventListener('click', () => {
    window.LipoverseNav?.show('lab');
    setTimeout(() => document.querySelector('[data-method="extrusion"]')?.click(), 40);
  });

  const startGallery = () => {
    if (galleryState.built) {
      if (!galleryState.running) { galleryState.running = true; galleryState.loop?.(); }
      return;
    }
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x141218, 1);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x141218);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.08, 40);
    camera.position.set(0.6, 1.3, 4.2);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.15;
    scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    const key = new THREE.DirectionalLight(0xffffff, 1.75);
    key.position.set(4, 6, 7);
    scene.add(key);
    const rim = new THREE.PointLight(0x7C3AED, 26, 28);
    rim.position.set(-5, -2, -4);
    scene.add(rim);
    const fill = new THREE.PointLight(0xC4B5FD, 10, 18);
    fill.position.set(3, -2, 4);
    scene.add(fill);
    galleryState = { built: true, renderer, scene, camera, controls, mesh: null, frame: 0, running: true };
    const resize = () => {
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 640;
      const h = canvas.clientHeight || 480;
      if (w < 2 || h < 2) return;
      const pr = renderer.getPixelRatio();
      if (canvas.width !== Math.floor(w * pr) || canvas.height !== Math.floor(h * pr)) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    };
    const loop = () => {
      if (!galleryState.running) return;
      galleryState.frame = requestAnimationFrame(loop);
      resize();
      controls.update();
      renderer.render(scene, camera);
    };
    galleryState.loop = loop;
    const startAt = GALLERY.findIndex(g => g.id === pendingModel);
    showGalleryModel(startAt >= 0 ? startAt : 0);
    loop();
  };

  const section = document.getElementById('section-gallery');
  const watch = new MutationObserver(() => {
    const on = section?.classList.contains('active');
    if (on) startGallery();
    else if (galleryState.running) {
      galleryState.running = false;
      cancelAnimationFrame(galleryState.frame);
    }
  });
  if (section?.classList.contains('active')) startGallery();
  if (section) watch.observe(section, { attributes: true, attributeFilter: ['class'] });
}

function initHeroLiposome() {
  const canvas = document.getElementById('hero-liposome');
  const section = document.getElementById('section-home');
  if (!canvas || !section) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let main = null;
  let near = null;
  let far = null;
  let running = false;
  let frame = 0;

  const resize = () => {
    if (!renderer || !camera) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 2 || h < 2) return;
    const pr = renderer.getPixelRatio();
    if (canvas.width !== Math.floor(w * pr) || canvas.height !== Math.floor(h * pr)) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  };

  const loop = () => {
    if (!running) return;
    frame = requestAnimationFrame(loop);
    resize();
    const t = performance.now() * 0.001;
    if (main && !motion.matches) {
      main.rotation.y = t * 0.32;
      main.rotation.x = Math.sin(t * 0.35) * 0.16;
      main.position.y = Math.sin(t * 0.75) * 0.1;
    }
    if (near && !motion.matches) {
      const a = t * 0.42;
      near.position.set(Math.cos(a) * 1.9, Math.sin(a * 0.8) * 0.55 + 0.25, Math.sin(a) * 0.7);
      near.rotation.y = t * 0.7;
    }
    if (far && !motion.matches) {
      const a = t * 0.28 + 2.1;
      far.position.set(Math.cos(a) * 1.55, Math.sin(a * 0.6) * 0.4 - 0.75, Math.cos(a) * 0.55);
      far.rotation.z = t * 0.45;
    }
    controls?.update();
    renderer?.render(scene, camera);
  };

  const start = () => {
    if (!renderer) {
      const mobile = window.innerWidth < 760;
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75));
      renderer.setClearColor(0x000000, 0);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(36, 1, 0.08, 40);
      camera.position.set(0.15, 0.35, 4.55);
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.enablePan = false;
      controls.autoRotate = !motion.matches;
      controls.autoRotateSpeed = 0.7;
      controls.minDistance = 3.1;
      controls.maxDistance = 8.5;
      scene.add(new THREE.HemisphereLight(0xEDE4FF, 0x2A2140, 0.72));
      scene.add(new THREE.AmbientLight(0xffffff, 0.28));
      const key = new THREE.DirectionalLight(0xffffff, 1.55);
      key.position.set(4, 5, 6);
      scene.add(key);
      const rim = new THREE.PointLight(0x7C3AED, 28, 30);
      rim.position.set(-4.5, -1.2, -3);
      scene.add(rim);
      const fill = new THREE.PointLight(0xC4B5FD, 14, 22);
      fill.position.set(2.4, 1.6, 3.2);
      scene.add(fill);
      main = makeVesicle({ shells: [{ r: 1.38, n: mobile ? 76 : 124 }], head: 0xC4B5FD });
      near = makeVesicle({ shells: [{ r: 0.42, n: mobile ? 30 : 46 }], head: 0xDDD6FE });
      far = makeVesicle({ shells: [{ r: 0.3, n: mobile ? 22 : 34 }], head: 0xA78BFA });
      near.position.set(1.7, 0.4, 0.15);
      far.position.set(-1.35, -0.7, 0.1);
      scene.add(main, near, far);
    }
    if (running) return;
    running = true;
    resize();
    loop();
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  const watch = new MutationObserver(() => {
    if (section.classList.contains('active')) start();
    else stop();
  });
  watch.observe(section, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (section.classList.contains('active')) start();
  });
  window.addEventListener('resize', resize);
  if (section.classList.contains('active')) start();
}

function initInquiry() {
  const form = document.getElementById('inquiry-form');
  const status = document.getElementById('inquiry-status');
  if (!form || !status) return;
  const submit = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const payload = {
      name: fields.get('name'),
      email: fields.get('email'),
      message: fields.get('message'),
      website: fields.get('website'),
    };
    if (submit) submit.disabled = true;
    status.dataset.state = '';
    status.textContent = 'Sending…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        status.dataset.state = 'bad';
        status.textContent = data.code === 'EMAIL_NOT_CONFIGURED'
          ? 'The inquiry API is not finished on this project yet. Email elkomymohamed664@gmail.com directly.'
          : (data.message || 'The inquiry could not be sent. Try again later.');
        return;
      }
      form.reset();
      status.dataset.state = 'ok';
      status.textContent = data.message || 'Your inquiry was sent.';
    } catch (error) {
      status.dataset.state = 'bad';
      status.textContent = 'The inquiry could not be sent. Check your connection and try again.';
    } finally {
      if (submit) submit.disabled = false;
    }
  });
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
  initHeroLiposome();
  initInquiry();
  rebuildSearch();
}
