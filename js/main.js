/* ============================================================
   LIPOVERSE — main.js
   Navigation · Progress tracking · Background particles
   Dashboard · Flashcards · Glossary
   ============================================================ */
const ARABIC_RUN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;
let boldingArabic = false;

function boldArabic(root) {
  if (boldingArabic || !root || root.nodeType !== 1) return;
  if (root.closest('script, style, textarea, .ar, .ar-inline')) return;
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || !node.nodeValue || parent.closest('script, style, textarea, .ar, .ar-inline')) return NodeFilter.FILTER_REJECT;
      ARABIC_RUN.lastIndex = 0;
      return ARABIC_RUN.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  if (!nodes.length) return;
  boldingArabic = true;
  nodes.forEach(node => {
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let last = 0;
    ARABIC_RUN.lastIndex = 0;
    text.replace(ARABIC_RUN, (match, offset) => {
      if (offset > last) frag.append(text.slice(last, offset));
      const span = document.createElement('span');
      span.className = 'ar-inline';
      span.textContent = match;
      frag.append(span);
      last = offset + match.length;
      return match;
    });
    if (last < text.length) frag.append(text.slice(last));
    node.parentNode.replaceChild(frag, node);
  });
  boldingArabic = false;
}

(function () {
  'use strict';

  /* ---------- Data ---------- */
  const MODULES = [
    { id: 'intro',        num: '01', icon: '🧬', title: 'Introduction',       desc: 'Definition, history and why liposomes matter in pharmacy.' },
    { id: 'explorer',     num: '02', icon: '🔭', title: '3D Explorer',        desc: 'Rotate and click through the liposome structure in 3D.' },
    { id: 'types',        num: '03', icon: '⭕', title: 'Types of Liposomes', desc: 'SUV, LUV, GUV, MLV and MVV — sizes, layers and features.' },
    { id: 'lab',          num: '04', icon: '🧪', title: 'Preparation Lab',    desc: 'Thin film, reverse phase, ethanol, detergent, microfluidics, and extrusion.' },
    { id: 'loading',      num: '05', icon: '💊', title: 'Drug Loading',       desc: 'Where the drug sits, encapsulation efficiency, and loading capacity.' },
    { id: 'simulation',   num: '06', icon: '🩸', title: 'Delivery Simulation',desc: 'Follow the drug journey through the body.' },
    { id: 'applications', num: '07', icon: '🏥', title: 'Applications',       desc: 'Doxil, AmBisome, Onivyde, Exparel, and other real liposomal medicines.' },
    { id: 'quiz',         num: '08', icon: '🏆', title: 'Quiz Center',        desc: 'Questions, matching, ordering, labeling, and review.' },
    { id: 'gallery',      num: '09', icon: '🔮', title: '3D Gallery',         desc: 'A separate vesicle for each type: size, layers, PEG, charge, and ligands.' },
    { id: 'research',     num: '10', icon: '📚', title: 'Research',           desc: 'Published reviews, plus notes you can download.' },
  ];

  const FLASHCARDS = [
    { term: 'Liposome', def: 'A spherical vesicle made of phospholipid bilayers enclosing an aqueous core — used as a drug carrier.', ar: 'حويصلة كروية من طبقات الفوسفوليبيدات تستخدم كناقل للدواء.' },
    { term: 'Phospholipid', def: 'An amphiphilic molecule with a hydrophilic head and hydrophobic tails that forms cell membranes.', ar: 'جزيء مزدوج المحبة يتكون منه غشاء الخلية.' },
    { term: 'Bilayer', def: 'Two layers of phospholipids arranged tail-to-tail, forming the wall of the liposome.', ar: 'طبقتان من الفوسفوليبيدات متعاكستان الذيلين.' },
    { term: 'Cholesterol', def: 'A sterol inserted between phospholipid tails that modulates membrane fluidity and stability.', ar: 'ستيرول يُدخل بين ذيول الفوسفوليبيدات لتنظيم سيولة الغشاء وثباته.' },
    { term: 'SUV', def: 'Small Unilamellar Vesicle — a single-bilayer vesicle of 20–100 nm.', ar: 'حويصلة صغيرة أحادية الطبقة حجمها ٢٠–١٠٠ نانومتر.' },
    { term: 'MLV', def: 'Multilamellar Vesicle — a vesicle with multiple concentric bilayers.', ar: 'حويصلة متعددة الطبقات المتراكزة.' },
    { term: 'Encapsulation Efficiency', def: 'The percentage of total drug successfully entrapped inside the liposomes.', ar: 'النسبة المئوية من الدواء المحبوس بنجاح داخل الليبوسومات.' },
    { term: 'PEGylation', def: 'Coating liposomes with polyethylene glycol to prolong circulation ("stealth" liposomes).', ar: 'تغليف الليبوسومات بالبولي إيثيلين جلايكول لإطالة بقائها في الدم.' },
    { term: 'EPR Effect', def: 'Enhanced Permeability and Retention — leaky tumor vessels let nanoparticles accumulate in tumors.', ar: 'تأثير النفاذية والاحتفاظ المعزز في الأورام.' },
    { term: 'Remote Loading', def: 'Active loading of a drug after vesicle formation, driven by a pH or ion gradient.', ar: 'تحميل الدواء بعد تكوين الحويصلة بواسطة تدرج حموضة أو أيوني.' },
  ];

  const GLOSSARY = [
    { term: 'Amphiphilic', def: 'A molecule having both water-loving and water-repelling parts.', ar: 'جزيء له جزء محب للماء وجزء كاره للماء.' },
    { term: 'Aqueous Core', def: 'The water-filled interior of a liposome where hydrophilic drugs are stored.', ar: 'القلب المائي داخل الليبوسوم.' },
    { term: 'Bilayer', def: 'Two phospholipid layers arranged tail-to-tail.', ar: 'طبقة مزدوجة من الفوسفوليبيدات.' },
    { term: 'Cholesterol', def: 'Sterol that stabilizes the bilayer and controls fluidity.', ar: 'ستيرول يثبّت الطبقة ويتحكم في سيولتها.' },
    { term: 'Encapsulation Efficiency', def: '(Encapsulated drug ÷ total drug) × 100.', ar: 'كفاءة التغليف: نسبة الدواء المحبوس من الإجمالي.' },
    { term: 'Hydrophilic', def: 'Water-loving — dissolves easily in water.', ar: 'محب للماء — يذوب بسهولة في الماء.' },
    { term: 'Hydrophobic', def: 'Water-repelling — avoids water, prefers fats.', ar: 'كاره للماء — يتجنب الماء ويفضل الدهون.' },
    { term: 'Liposome', def: 'Spherical phospholipid vesicle used as a drug delivery system.', ar: 'حويصلة فوسفوليبيدية كروية لنقل الدواء.' },
    { term: 'PEGylation', def: 'Attaching PEG chains to prolong circulation time.', ar: 'إضافة سلاسل PEG لإطالة الدوران الدموي.' },
    { term: 'Phospholipid', def: 'The main building block of cell membranes and liposomes.', ar: 'المكوّن الأساسي لأغشية الخلايا والليبوسومات.' },
    { term: 'Polydispersity Index (PDI)', def: 'A measure of the size uniformity of nanoparticles (0 = uniform).', ar: 'مؤشر تشتت الحجم — كلما اقترب من صفر كان الحجم أكثر تجانسًا.' },
    { term: 'Zeta Potential', def: 'The surface charge of particles; predicts colloidal stability.', ar: 'الشحنة السطحية للجسيمات — تتنبأ بثبات المستحضر.' },
  ];

  /* ---------- Progress (localStorage) ---------- */
  const LS_KEY = 'lipoverse_progress_v1';
  let progress = { visited: [], quizBest: null };
  try { progress = JSON.parse(localStorage.getItem(LS_KEY)) || progress; } catch (e) { /* ignore */ }

  function saveProgress() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(progress)); } catch (e) { /* ignore */ }
    renderDashboard();
  }

  function markVisited(id) {
    if (!MODULES.some(m => m.id === id)) return;
    if (!progress.visited.includes(id)) {
      progress.visited.push(id);
      saveProgress();
    }
  }

  /* ---------- Navigation ---------- */
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-links a');
  let explorerLoaded = false;

  const PAGE = { research: 'applications', capacity: 'loading', notes: 'flashcards', practice: 'quiz' };
  const FOCUS = { research: 'research-block', capacity: 'capacity-panel', notes: 'notes-block', practice: 'quiz-extra' };

  function showSection(id) {
    const page = PAGE[id] || id;
    sections.forEach(s => s.classList.toggle('active', s.id === 'section-' + page));
    navLinks.forEach(a => a.classList.toggle('active', a.dataset.nav === id || (id === page && a.dataset.nav === page)));
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    markVisited(id);
    renderModuleCards();

    if (id === 'explorer' && !explorerLoaded) {
      import('./explorer.js')
        .then(() => { explorerLoaded = true; })
        .catch(err => {
          explorerLoaded = false; // allow retry on the next visit
          console.error('3D explorer failed to load:', err);
          const wrap = document.getElementById('explorer-canvas-wrap');
          if (wrap) wrap.innerHTML = '<p style="padding:30px;color:var(--muted)">⚠️ Could not load the 3D engine. Please check your internet connection and reload.</p>';
        });
    }
    if (page === 'loading' && window.LipoverseLoading) window.LipoverseLoading.start();
    if (page === 'simulation' && window.LipoverseSim) window.LipoverseSim.start();
    const activeLink = document.querySelector('.nav-links a.active');
    const linkBar = document.getElementById('nav-links');
    if (activeLink && linkBar && linkBar.scrollWidth > linkBar.clientWidth) {
      const left = activeLink.offsetLeft - (linkBar.clientWidth - activeLink.offsetWidth) / 2;
      linkBar.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    }
    const focus = FOCUS[id];
    if (focus) {
      setTimeout(() => document.getElementById(focus)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); showSection(nav.dataset.nav); return; }
    const go = e.target.closest('[data-goto]');
    if (go) showSection(go.dataset.goto);
  });
  window.LipoverseNav = { show: showSection };

  function fitNav() {
    const bar = document.querySelector('.navbar');
    if (bar) document.documentElement.style.setProperty('--nav-h', Math.ceil(bar.getBoundingClientRect().height) + 'px');
  }
  fitNav();
  window.addEventListener('resize', fitNav);
  window.addEventListener('load', fitNav);
  document.querySelectorAll('.seal-bar img').forEach(img => {
    if (!img.complete) img.addEventListener('load', fitNav);
  });

  /* ---------- Module cards ---------- */
  function renderModuleCards() {
    const grid = document.getElementById('modules-grid');
    if (!grid) return;
    grid.innerHTML = MODULES.map(m => `
      <article class="glass-card module-card ${progress.visited.includes(m.id) ? 'visited' : ''}" data-goto="${m.id}" role="button" tabindex="0">
        <span class="module-done">✓ Visited</span>
        <div class="module-icon">${m.icon}</div>
        <span class="module-num">MODULE ${m.num}</span>
        <h3>${m.title}</h3>
        <p>${m.desc}</p>
      </article>`).join('');
    grid.querySelectorAll('.module-card').forEach(card => {
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showSection(card.dataset.goto); } });
    });
  }

  /* ---------- Dashboard ---------- */
  function renderDashboard() {
    const total = MODULES.length;
    const done = progress.visited.length;
    const pct = Math.round((done / total) * 100);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('nav-progress-pct', pct + '%');
    set('dash-pct', pct + '%');
    set('dash-count', done + ' / ' + total + ' modules visited');
    const fill = document.getElementById('nav-progress-fill'); if (fill) fill.style.width = pct + '%';
    const dfill = document.getElementById('dash-fill'); if (dfill) dfill.style.width = pct + '%';
    set('dash-quiz', progress.quizBest !== null ? progress.quizBest + '% — keep it up!' : 'Not taken yet');

    const next = MODULES.find(m => !progress.visited.includes(m.id));
    set('dash-next', next ? next.title : 'All modules completed 🎉');
    const btn = document.getElementById('continue-btn');
    if (btn) btn.textContent = next ? 'Continue: ' + next.title + ' →' : 'Review the 3D Explorer →';
    if (btn) btn.onclick = () => showSection(next ? next.id : 'explorer');
  }

  /* ---------- Background particles ---------- */
  (function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const COUNT = window.innerWidth < 700 ? 35 : 70;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 1 + Math.random() * 2.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: 0.15 + Math.random() * 0.5,
        ring: Math.random() < 0.3
      });
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
        ctx.beginPath();
        if (p.ring) {
          ctx.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(196,181,253,' + (p.a * 0.75) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(167,139,250,' + p.a + ')';
          ctx.fill();
        }
      }
      requestAnimationFrame(tick);
    }
    tick();
  })();

  /* ---------- Flashcards ---------- */
  (function initFlashcards() {
    const card = document.getElementById('flash-card');
    if (!card) return;
    let order = FLASHCARDS.map((_, i) => i);
    let pos = 0;

    function render() {
      const f = FLASHCARDS[order[pos]];
      document.getElementById('flash-term').textContent = f.term;
      document.getElementById('flash-def').textContent = f.def;
      document.getElementById('flash-ar').textContent = f.ar;
      document.getElementById('flash-counter').textContent = (pos + 1) + ' / ' + order.length;
      card.classList.remove('flipped');
    }
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    document.getElementById('flash-next').addEventListener('click', () => { pos = (pos + 1) % order.length; render(); });
    document.getElementById('flash-prev').addEventListener('click', () => { pos = (pos - 1 + order.length) % order.length; render(); });
    document.getElementById('flash-shuffle').addEventListener('click', () => {
      order = FLASHCARDS.map((_, i) => i).sort(() => Math.random() - 0.5);
      pos = 0; render();
    });
    render();
  })();

  /* ---------- Glossary ---------- */
  (function initGlossary() {
    const grid = document.getElementById('glossary-grid');
    const search = document.getElementById('glossary-search');
    if (!grid) return;
    function render(filter) {
      const f = filter ? filter.toLowerCase() : '';
      const items = GLOSSARY.filter(g => !f || g.term.toLowerCase().includes(f) || g.def.toLowerCase().includes(f));
      grid.innerHTML = items.length
        ? items.map(g => `<div class="glass-card glossary-item"><h4>${g.term}</h4><p>${g.def}</p><p class="ar">${g.ar}</p></div>`).join('')
        : '<p style="color:var(--muted)">No terms match your search.</p>';
    }
    search.addEventListener('input', () => render(search.value));
    render('');
  })();

  /* ---------- Public hook (used by the quiz) ---------- */
  window.LipoverseProgress = {
    setQuizBest(score) {
      if (progress.quizBest === null || score > progress.quizBest) {
        progress.quizBest = score;
        saveProgress();
      }
    }
  };

  /* ---------- Init ---------- */
  renderModuleCards();
  renderDashboard();

  const initial = (location.hash || '#home').replace('#', '');
  const initialPage = PAGE[initial] || initial;
  showSection(document.getElementById('section-' + initialPage) ? initial : 'home');
  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (id) showSection(id);
  });

  boldArabic(document.body);
  const arabicObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) boldArabic(node);
        else if (node.nodeType === 3 && node.parentElement) boldArabic(node.parentElement);
      });
    });
  });
  arabicObserver.observe(document.body, { childList: true, subtree: true });
})();
