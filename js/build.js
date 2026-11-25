/* ============================================================
   LIPOVERSE — build.js (Module 09: Build Your Own Liposome)
   Students choose the vesicle type, number of bilayers,
   cholesterol content, drug type and PEG coating. The cross-
   section redraws and the qualitative properties update.
   Educational model — relative scores, not clinical data.
   ============================================================ */
(function () {
  'use strict';

  const canvas = document.getElementById('build-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, C = { x: W / 2, y: H / 2 };

  const TYPE_INFO = {
    SUV: { name: 'Small Unilamellar Vesicle', size: '20–100 nm', radius: 80, radiusNm: 40, base: 45, circ: 35, layersFixed: 1 },
    LUV: { name: 'Large Unilamellar Vesicle', size: '100–1000 nm', radius: 150, radiusNm: 250, base: 60, circ: 40, layersFixed: 1 },
    GUV: { name: 'Giant Unilamellar Vesicle', size: '>1 µm', radius: 200, radiusNm: 2000, base: 55, circ: 20, layersFixed: 1 },
    MLV: { name: 'Multilamellar Vesicle', size: '500 nm – 5 µm', radius: 200, radiusNm: 500, base: 75, circ: 30, layersFixed: null }
  };

  const $ = id => document.getElementById(id);
  const ui = {
    type: $('b-type'), layers: $('b-layers'), layersOut: $('b-layers-out'),
    chol: $('b-chol'), cholOut: $('b-chol-out'), drug: $('b-drug'), peg: $('b-peg'),
    reset: $('b-reset'), results: $('build-results'), explain: $('build-explain')
  };
  if (!ui.type) return;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const round = v => Math.round(v);

  function model() {
    const type = ui.type.value;
    const info = TYPE_INFO[type];
    const layers = info.layersFixed || parseInt(ui.layers.value, 10);
    const chol = parseInt(ui.chol.value, 10);
    const drug = ui.drug.value;             // 'hydro' | 'lipo'
    const peg = ui.peg.checked;

    // Stability: multiple bilayers and cholesterol both help; PEG adds steric protection
    const stability = clamp(info.base + (type === 'MLV' ? (layers - 1) * 2 : 0) + chol * 0.6 + (peg ? 5 : 0), 0, 95);
    // Membrane fluidity: higher cholesterol = more ordered, less fluid bilayer
    const fluidity = clamp(85 - chol * 1.1, 10, 90);
    // Retention: hydrophilic drugs leak more easily through the bilayer
    const retention = clamp(stability - (drug === 'hydro' ? 5 : 0), 0, 100);
    // Circulation: PEG coating is the main factor for long circulation
    const circulation = clamp(info.circ + (peg ? 45 : 0) + chol * 0.2, 0, 100);
    // Loading: aqueous core scales with size (hydrophilic); bilayer area scales with layers (lipophilic)
    const coreScore = clamp(15 + 25 * Math.log10(info.radiusNm / 20), 10, 100) * (type === 'MLV' ? 1 - 0.06 * (layers - 1) : 1);
    const lipoScore = clamp(10 + 14 * (type === 'MLV' ? layers : 1), 0, 100);
    const loading = drug === 'hydro' ? coreScore : lipoScore;
    return { type, info, layers, chol, drug, peg, stability, fluidity, retention, circulation, loading, coreScore, lipoScore };
  }

  function bar(label, value, hint, cls) {
    return `<div class="meter">
      <div class="meter-head"><span>${label}</span><strong>${round(value)}%</strong></div>
      <div class="meter-track"><div class="meter-fill ${cls || ''}" style="width:${round(value)}%"></div></div>
      <small>${hint}</small></div>`;
  }

  function explanations(m) {
    const out = [];
    out.push(`<strong>${m.type}</strong> (${m.info.size}) — ${m.type === 'MLV' ? `${m.layers} concentric bilayers with aqueous gaps between them.` : 'a single bilayer enclosing one aqueous core.'}`);
    if (m.chol < 15) out.push('Low cholesterol: the bilayer is more fluid and leaky, so drug can escape faster.');
    else if (m.chol <= 35) out.push('Moderate cholesterol: a good balance of stability and flexibility.');
    else out.push('High cholesterol: a rigid, very stable bilayer, but it may become too stiff for some uses.');
    out.push(m.drug === 'hydro'
      ? 'Hydrophilic drug: it sits in the aqueous core. Bigger vesicles hold more water, so they load more.'
      : 'Lipophilic drug: it dissolves among the fatty tails. More bilayers means more lipid space to hold it.');
    out.push(m.peg
      ? 'PEG “stealth” coating: the vesicle is hidden from the immune system and circulates much longer.'
      : 'No PEG coating: the vesicle is quickly cleared by macrophages (RES), so circulation is short.');
    return out;
  }

  /* ---------- Drawing (schematic, not to scale) ---------- */
  function draw(m) {
    ctx.clearRect(0, 0, W, H);
    const { info } = m;
    const bilayers = [];
    if (m.type === 'MLV') {
      const gap = (info.radius - 30) / m.layers;
      for (let k = 0; k < m.layers; k++) bilayers.push(info.radius - k * gap);
    } else {
      bilayers.push(info.radius);
    }
    const outerR = bilayers[0];
    const innerR = bilayers[bilayers.length - 1] - 9;

    // Aqueous core (and gaps between MLV layers)
    ctx.fillStyle = 'rgba(77,163,255,0.14)';
    ctx.beginPath(); ctx.arc(C.x, C.y, outerR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(77,163,255,0.22)';
    ctx.beginPath(); ctx.arc(C.x, C.y, Math.max(innerR, 5), 0, Math.PI * 2); ctx.fill();

    // Bilayers: two leaflets with heads and tails
    bilayers.forEach((r, bi) => {
      ctx.strokeStyle = 'rgba(139,231,224,0.35)'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.arc(C.x, C.y, r - 4, 0, Math.PI * 2); ctx.stroke();
      const n = Math.max(24, Math.floor((2 * Math.PI * r) / 13));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        ctx.fillStyle = '#20BDB0';
        [r + 4, r - 12].forEach(rr => {
          ctx.beginPath(); ctx.arc(C.x + Math.cos(a) * rr, C.y + Math.sin(a) * rr, 2.6, 0, Math.PI * 2); ctx.fill();
        });
      }
      // Cholesterol molecules between tails
      const cholCount = Math.round((m.chol / 50) * (n / 2.5));
      ctx.fillStyle = '#ffc857';
      for (let i = 0; i < cholCount; i++) {
        const a = ((i + bi * 0.37) / Math.max(1, cholCount)) * Math.PI * 2;
        const rr = r - 4 + ((i * 7) % 3 - 1) * 1.5;
        const x = C.x + Math.cos(a) * rr, y = C.y + Math.sin(a) * rr;
        ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
      }
    });

    // PEG chains on the outside
    if (m.peg) {
      const n = Math.max(24, Math.floor((2 * Math.PI * outerR) / 13));
      ctx.strokeStyle = 'rgba(242,247,252,0.55)'; ctx.lineWidth = 1.4;
      for (let i = 0; i < n; i += 2) {
        const a = (i / n) * Math.PI * 2;
        ctx.beginPath();
        for (let s = 0; s <= 6; s++) {
          const rr = outerR + 8 + s * 3.5;
          const wob = Math.sin(s * 1.6 + i) * 2.2;
          const x = C.x + Math.cos(a + wob / rr) * rr, y = C.y + Math.sin(a + wob / rr) * rr;
          s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    // Drug molecules
    if (m.drug === 'hydro') {
      const count = Math.round(20 + (m.coreScore / 100) * 150);
      ctx.fillStyle = AMBER_DRUG;
      for (let i = 0; i < count; i++) {
        const r = Math.sqrt((i + 0.5) / count) * Math.max(innerR - 8, 6);
        const a = i * 2.39996;
        ctx.beginPath(); ctx.arc(C.x + Math.cos(a) * r, C.y + Math.sin(a) * r, 3.4, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      const count = Math.round(12 + (m.lipoScore / 100) * 90);
      ctx.fillStyle = AMBER_DRUG;
      for (let i = 0; i < count; i++) {
        const br = bilayers[i % bilayers.length];
        const a = i * 2.39996;
        ctx.beginPath(); ctx.arc(C.x + Math.cos(a) * (br - 4), C.y + Math.sin(a) * (br - 4), 3.4, 0, Math.PI * 2); ctx.fill();
      }
    }

    ctx.fillStyle = 'rgba(242,247,252,0.7)';
    ctx.font = '600 13px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${m.type} · schematic, not to scale`, C.x, H - 12);
  }
  const AMBER_DRUG = '#ff8a5c';

  /* ---------- Panel ---------- */
  function render() {
    const m = model();
    ui.layersOut.textContent = m.type === 'MLV' ? m.layers : '1 (fixed)';
    ui.layers.disabled = m.type !== 'MLV';
    ui.cholOut.textContent = ui.chol.value + ' mol%';
    draw(m);

    const verdict = m.stability >= 70 ? 'Stable, good candidate for storage and long-term use.'
      : m.stability >= 50 ? 'Moderately stable — formulation tuning may help.'
      : 'Fragile — likely to leak or aggregate; add cholesterol or choose a larger/multilayered design.';

    ui.results.innerHTML = `
      <h3>📊 Predicted properties</h3>
      ${bar('Stability', m.stability, 'Multiple bilayers, cholesterol and PEG improve it.')}
      ${bar('Membrane fluidity', m.fluidity, 'Higher = more fluid. Cholesterol makes it more ordered.', 'fluid')}
      ${bar('Drug retention', m.retention, 'Lower leakage of the encapsulated drug.', 'retain')}
      ${bar('Circulation time', m.circulation, 'PEG coating is the strongest factor.', 'circ')}
      ${bar('Loading capacity (' + (m.drug === 'hydro' ? 'aqueous core' : 'bilayer') + ')', m.loading, 'Relative capacity for the selected drug type.', 'load')}
      <p class="build-verdict"><strong>Verdict:</strong> ${verdict}</p>`;

    ui.explain.innerHTML = `
      <h3>🧠 What your design means</h3>
      <ul>${explanations(m).map(x => `<li>${x}</li>`).join('')}</ul>
      <p class="build-disclaimer">Relative educational scores based on general formulation principles — not experimental or clinical data.</p>`;
  }

  // Presets (students can start from a realistic design)
  const PRESETS = {
    reset: { type: 'LUV', layers: 1, chol: 30, drug: 'hydro', peg: false }
  };
  function applyPreset(p) {
    ui.type.value = p.type; ui.layers.value = p.layers; ui.chol.value = p.chol;
    ui.drug.value = p.drug; ui.peg.checked = p.peg;
    render();
  }

  [ui.type, ui.layers, ui.chol, ui.drug, ui.peg].forEach(el => el.addEventListener('input', render));
  [ui.type, ui.drug, ui.peg].forEach(el => el.addEventListener('change', render));
  ui.reset.addEventListener('click', () => applyPreset(PRESETS.reset));
  render();
})();
