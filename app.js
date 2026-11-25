(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const setText = (element, text) => { if (element) element.textContent = text; };
  const copy = (english, arabic) => lang === 'ar' ? arabic : english;
  const storage = {
    get(key) { try { return window.localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch (_) { /* private browsing */ } }
  };
  let lang = storage.get('lipoverse-language') === 'ar' ? 'ar' : 'en';

  const svgNS = 'http://www.w3.org/2000/svg';
  function svgNode(tag, attributes = {}) {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function drawMembrane({ tailsId, headsId, cx, cy, outerRx, outerRy, innerRx, innerRy, count, radius }) {
    const tails = document.getElementById(tailsId);
    const heads = document.getElementById(headsId);
    if (!tails || !heads) return;
    tails.replaceChildren();
    heads.replaceChildren();

    for (let i = 0; i < count; i += 1) {
      const theta = (Math.PI * 2 * i) / count;
      const outerX = cx + outerRx * Math.cos(theta);
      const outerY = cy + outerRy * Math.sin(theta);
      const innerX = cx + innerRx * Math.cos(theta);
      const innerY = cy + innerRy * Math.sin(theta);
      const dx = innerX - outerX;
      const dy = innerY - outerY;
      const tangentX = -Math.sin(theta);
      const tangentY = Math.cos(theta);

      [-1, 1].forEach((direction) => {
        const offset = direction * (radius * .33);
        tails.appendChild(svgNode('line', {
          x1: outerX + dx * .23 + tangentX * offset,
          y1: outerY + dy * .23 + tangentY * offset,
          x2: outerX + dx * .77 + tangentX * offset,
          y2: outerY + dy * .77 + tangentY * offset,
          class: 'lipid-tail'
        }));
      });

      heads.appendChild(svgNode('circle', { cx: outerX, cy: outerY, r: radius, class: 'lipid-head outer-head' }));
      heads.appendChild(svgNode('circle', { cx: innerX, cy: innerY, r: radius * .82, class: 'lipid-head inner-head' }));
    }
  }

  function drawCholesterol() {
    const group = document.getElementById('cholesterol-nodes');
    if (!group) return;
    group.replaceChildren();
    const cx = 320;
    const cy = 250;
    const rx = 169;
    const ry = 125;
    for (let i = 0; i < 12; i += 1) {
      const theta = (Math.PI * 2 * (i + .27)) / 12;
      const x = cx + rx * Math.cos(theta);
      const y = cy + ry * Math.sin(theta);
      const size = i % 3 === 0 ? 4.1 : 3.4;
      const points = `${x},${y - size} ${x + size * .72},${y} ${x},${y + size} ${x - size * .72},${y}`;
      group.appendChild(svgNode('polygon', { points, class: 'cholesterol-molecule' }));
    }
  }

  drawMembrane({ tailsId: 'hero-lipid-tails', headsId: 'hero-lipid-heads', cx: 300, cy: 245, outerRx: 188, outerRy: 150, innerRx: 145, innerRy: 108, count: 32, radius: 5.5 });
  drawMembrane({ tailsId: 'lipid-tails', headsId: 'lipid-heads', cx: 320, cy: 250, outerRx: 190, outerRy: 145, innerRx: 147, innerRy: 105, count: 34, radius: 6.2 });
  drawCholesterol();

  const partInfo = {
    head: {
      en: { eyebrow: 'STRUCTURE / 01', title: 'Hydrophilic head', description: 'The polar head group interacts with water. Phospholipid heads face aqueous environments on both sides of the membrane.', factLabel: 'CHEMISTRY', fact: 'Water-facing surface' },
      ar: { eyebrow: 'التركيب / ٠١', title: 'الرأس المحب للماء', description: 'تتفاعل مجموعة الرأس القطبية مع الماء. وتتجه رؤوس الفوسفوليبيدات نحو البيئتين المائيتين على جانبي الغشاء.', factLabel: 'الخاصية', fact: 'سطح يتفاعل مع الماء' }
    },
    tail: {
      en: { eyebrow: 'STRUCTURE / 02', title: 'Hydrophobic tail', description: 'The non-polar fatty-acid region avoids water and packs toward the interior of the bilayer, creating a hydrophobic zone.', factLabel: 'CHEMISTRY', fact: 'Water-avoiding region' },
      ar: { eyebrow: 'التركيب / ٠٢', title: 'الذيل الكاره للماء', description: 'تبتعد منطقة الأحماض الدهنية غير القطبية عن الماء وتتراص نحو داخل الغشاء، فتكوّن منطقة كارهة للماء.', factLabel: 'الخاصية', fact: 'منطقة تبتعد عن الماء' }
    },
    bilayer: {
      en: { eyebrow: 'STRUCTURE / 03', title: 'Phospholipid bilayer', description: 'Two opposing leaflets self-assemble in water: the heads face outward and inward, while the hydrophobic tails meet in the middle.', factLabel: 'KEY IDEA', fact: 'A membrane with two faces' },
      ar: { eyebrow: 'التركيب / ٠٣', title: 'الغشاء الفوسفوليبيدي المزدوج', description: 'تتجمع طبقتان متقابلتان في الماء؛ تتجه الرؤوس إلى الخارج والداخل، بينما تلتقي الذيول الكارهة للماء في المنتصف.', factLabel: 'الفكرة الأساسية', fact: 'غشاء له وجهان مائيان' }
    },
    cholesterol: {
      en: { eyebrow: 'STRUCTURE / 04', title: 'Cholesterol', description: 'When included, cholesterol inserts among phospholipids and can influence membrane packing, fluidity and permeability.', factLabel: 'FORMULATION ROLE', fact: 'Can modulate membrane properties' },
      ar: { eyebrow: 'التركيب / ٠٤', title: 'الكوليسترول', description: 'عند إضافته، يتموضع الكوليسترول بين الفوسفوليبيدات ويمكن أن يؤثر في تراص الغشاء وسيولته ونفاذيته.', factLabel: 'دوره في التركيبة', fact: 'قد يعدّل خصائص الغشاء' }
    },
    core: {
      en: { eyebrow: 'STRUCTURE / 05', title: 'Aqueous core', description: 'The water-rich interior can entrap suitable hydrophilic cargo. The exact loading behaviour depends on the molecule and formulation.', factLabel: 'POTENTIAL CARGO', fact: 'Water-compatible molecules' },
      ar: { eyebrow: 'التركيب / ٠٥', title: 'النواة المائية', description: 'قد تحتوي المنطقة الداخلية الغنية بالماء على حمولة مناسبة محبة للماء. ويعتمد سلوك التحميل الفعلي على الجزيء والتركيبة.', factLabel: 'حمولة محتملة', fact: 'جزيئات متوافقة مع الماء' }
    }
  };
  const visualMap = {
    head: ['#lipid-heads'],
    tail: ['#lipid-tails'],
    bilayer: ['#layer-bilayer-back', '#layer-bilayer-front'],
    cholesterol: ['#layer-cholesterol'],
    core: ['#layer-core']
  };
  const layerMap = {
    bilayer: ['layer-bilayer-back', 'layer-bilayer-front'],
    cholesterol: ['layer-cholesterol'],
    core: ['layer-core'],
    payload: ['layer-payload']
  };
  let selectedPart = 'head';

  function renderPart() {
    const part = partInfo[selectedPart][lang];
    setText($('#part-eyebrow'), part.eyebrow);
    setText($('#part-title'), part.title);
    setText($('#part-description'), part.description);
    setText($('#part-fact-label'), part.factLabel);
    setText($('#part-fact'), part.fact);
    $$('[data-part-select]').forEach((button) => {
      const active = button.dataset.partSelect === selectedPart;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $$('.component-hotspot').forEach((hotspot) => {
      hotspot.classList.toggle('is-hotspot-active', hotspot.dataset.partTarget === selectedPart);
    });
    $$('[data-component-visual]').forEach((node) => node.classList.remove('component-highlight'));
    (visualMap[selectedPart] || []).forEach((selector) => $(selector)?.classList.add('component-highlight'));
  }

  $$('[data-part-select]').forEach((button) => button.addEventListener('click', () => {
    selectedPart = button.dataset.partSelect;
    renderPart();
  }));
  $$('.component-hotspot').forEach((hotspot) => {
    hotspot.addEventListener('click', () => { selectedPart = hotspot.dataset.partTarget; renderPart(); });
    hotspot.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectedPart = hotspot.dataset.partTarget;
        renderPart();
      }
    });
  });

  const explorerStage = $('#explorer-stage');
  const cutawayButton = $('#cutaway-toggle');
  let cutaway = false;
  function renderCutaway() {
    explorerStage?.classList.toggle('is-cutaway', cutaway);
    cutawayButton?.setAttribute('aria-pressed', String(cutaway));
    setText($('#cutaway-label'), cutaway ? copy('Hide cutaway', 'أخفِ المقطع') : copy('Show cutaway', 'أظهر المقطع'));
  }
  cutawayButton?.addEventListener('click', () => { cutaway = !cutaway; renderCutaway(); });

  $$('[data-layer-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.layerToggle;
      const showing = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(showing));
      (layerMap[key] || []).forEach((id) => document.getElementById(id)?.classList.toggle('layer-hidden', !showing));
    });
  });

  const diagramViewport = $('#diagram-viewport');
  const explorerSvg = $('#explorer-svg');
  let zoom = 1;
  let rotateX = 0;
  let rotateY = 0;
  function updateModelTransform() {
    if (!explorerSvg) return;
    explorerSvg.style.setProperty('--zoom', zoom.toFixed(2));
    explorerSvg.style.setProperty('--rx', `${rotateX.toFixed(1)}deg`);
    explorerSvg.style.setProperty('--ry', `${rotateY.toFixed(1)}deg`);
  }
  $('#zoom-in')?.addEventListener('click', () => { zoom = Math.min(1.26, zoom + .08); updateModelTransform(); });
  $('#zoom-out')?.addEventListener('click', () => { zoom = Math.max(.78, zoom - .08); updateModelTransform(); });
  $('#zoom-reset')?.addEventListener('click', () => { zoom = 1; rotateX = 0; rotateY = 0; updateModelTransform(); });
  let dragState = null;
  diagramViewport?.addEventListener('pointerdown', (event) => {
    if (event.target.closest('[data-part-target]') || event.button !== 0) return;
    dragState = { x: event.clientX, y: event.clientY, rx: rotateX, ry: rotateY, pointerId: event.pointerId };
    diagramViewport.classList.add('is-dragging');
    try { diagramViewport.setPointerCapture(event.pointerId); } catch (_) { /* unsupported */ }
  });
  diagramViewport?.addEventListener('pointermove', (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    rotateY = Math.max(-40, Math.min(40, dragState.ry + (event.clientX - dragState.x) * .22));
    rotateX = Math.max(-22, Math.min(22, dragState.rx - (event.clientY - dragState.y) * .16));
    updateModelTransform();
  });
  const stopDrag = () => { dragState = null; diagramViewport?.classList.remove('is-dragging'); };
  diagramViewport?.addEventListener('pointerup', stopDrag);
  diagramViewport?.addEventListener('pointercancel', stopDrag);

  const typeInfo = {
    suv: {
      en: { overline: 'SINGLE-BILAYER VESICLE', name: 'Small unilamellar vesicle', description: 'A single phospholipid bilayer surrounds one aqueous compartment. “Small” is a relative category; exact size ranges vary by classification and preparation method.', layers: 'One bilayer', architecture: 'One enclosed core', caption: '01 BILAYER · 01 AQUEOUS CORE' },
      ar: { overline: 'حويصلة ذات غشاء واحد', name: 'حويصلة أحادية صغيرة', description: 'يحيط غشاء فوسفوليبيدي واحد بحيّز مائي. ووصف «صغيرة» فئة نسبية؛ إذ تختلف حدود الحجم حسب التصنيف وطريقة التحضير.', layers: 'غشاء مزدوج واحد', architecture: 'نواة واحدة محاطة بالغشاء', caption: 'غشاء واحد · نواة مائية واحدة' }
    },
    luv: {
      en: { overline: 'SINGLE-BILAYER VESICLE', name: 'Large unilamellar vesicle', description: 'A single bilayer encloses one larger aqueous compartment relative to small unilamellar classes. The precise size boundary depends on the reference and method.', layers: 'One bilayer', architecture: 'One larger core', caption: '01 BILAYER · 01 AQUEOUS CORE' },
      ar: { overline: 'حويصلة ذات غشاء واحد', name: 'حويصلة أحادية كبيرة', description: 'يحيط غشاء واحد بحيّز مائي أكبر مقارنةً بفئات الحويصلات الأحادية الصغيرة. ويعتمد الحد الدقيق للحجم على المرجع والطريقة.', layers: 'غشاء مزدوج واحد', architecture: 'نواة واحدة أكبر', caption: 'غشاء واحد · نواة مائية واحدة' }
    },
    guv: {
      en: { overline: 'GIANT SINGLE-BILAYER VESICLE', name: 'Giant unilamellar vesicle', description: 'A giant vesicle with one bilayer. GUVs are often used as simplified membrane models in biophysical research and teaching.', layers: 'One bilayer', architecture: 'One large enclosed core', caption: '01 BILAYER · 01 AQUEOUS CORE' },
      ar: { overline: 'حويصلة عملاقة ذات غشاء واحد', name: 'حويصلة أحادية عملاقة', description: 'حويصلة عملاقة ذات غشاء واحد. تُستخدم الحويصلات العملاقة كثيرًا كنماذج مبسطة للأغشية في أبحاث الفيزياء الحيوية والتعليم.', layers: 'غشاء مزدوج واحد', architecture: 'نواة واحدة كبيرة', caption: 'غشاء واحد · نواة مائية واحدة' }
    },
    mlv: {
      en: { overline: 'CONCENTRIC LAYERS', name: 'Multilamellar vesicle', description: 'Several concentric bilayers form nested aqueous compartments—often described as an “onion-like” arrangement.', layers: 'Multiple bilayers', architecture: 'Nested compartments', caption: 'MULTIPLE BILAYERS · NESTED SPACES' },
      ar: { overline: 'طبقات متراكزة', name: 'حويصلة متعددة الأغشية', description: 'تكوّن عدة أغشية متراكزة حجرات مائية متداخلة، ويُشبَّه ترتيبها أحيانًا بطبقات البصل.', layers: 'أغشية متعددة', architecture: 'حجرات متداخلة', caption: 'أغشية متعددة · حجرات متداخلة' }
    },
    mvv: {
      en: { overline: 'MULTIPLE INTERNAL VESICLES', name: 'Multivesicular vesicle', description: 'A larger outer vesicle contains multiple smaller vesicles within its interior. It is a distinct architecture from concentric multilamellar layers.', layers: 'Multiple inner vesicles', architecture: 'Several internal spaces', caption: 'OUTER VESICLE · MULTIPLE INNER VESICLES' },
      ar: { overline: 'حويصلات داخلية متعددة', name: 'حويصلة متعددة الحويصلات', description: 'تحتوي حويصلة خارجية أكبر على حويصلات أصغر متعددة في داخلها. وهي بنية مختلفة عن الطبقات المتراكزة للحويصلات متعددة الأغشية.', layers: 'حويصلات داخلية متعددة', architecture: 'عدة حجرات داخلية', caption: 'حويصلة خارجية · حويصلات داخلية' }
    }
  };
  let selectedType = 'suv';
  function renderType() {
    const item = typeInfo[selectedType][lang];
    setText($('#type-overline'), item.overline);
    setText($('#type-name'), item.name);
    setText($('#type-description'), item.description);
    setText($('#type-layers'), item.layers);
    setText($('#type-architecture'), item.architecture);
    setText($('#type-visual-caption'), item.caption);
    $('#type-illustration')?.setAttribute('data-type', selectedType);
    $$('[data-vesicle-type]').forEach((button) => {
      const active = button.dataset.vesicleType === selectedType;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }
  $$('[data-vesicle-type]').forEach((button) => button.addEventListener('click', () => { selectedType = button.dataset.vesicleType; renderType(); }));

  let cargo = 'hydrophilic';
  let loadingMethod = 'passive';
  let cargoSize = 3;
  function renderLoading() {
    const hydrophilic = cargo === 'hydrophilic';
    const cargoName = hydrophilic ? copy('Hydrophilic', 'محبة للماء') : copy('Lipophilic', 'محبة للدهون');
    const destination = hydrophilic ? copy('Aqueous core', 'النواة المائية') : copy('Lipid bilayer', 'الغشاء الدهني المزدوج');
    const methodName = loadingMethod === 'passive' ? copy('Passive loading', 'تحميل سلبي') : copy('Remote / active', 'تحميل بعيد / نشط');
    const sizeName = cargoSize <= 2 ? copy('Small', 'صغير') : (cargoSize >= 5 ? copy('Large', 'كبير') : copy('Medium', 'متوسط'));
    const visual = $('#loading-visual');
    visual?.setAttribute('data-cargo', cargo);
    visual?.setAttribute('data-method', loadingMethod);
    setText($('#loading-status'), hydrophilic ? copy('CARGO: HYDROPHILIC', 'الحمولة: محبة للماء') : copy('CARGO: LIPOPHILIC', 'الحمولة: محبة للدهون'));
    setText($('#loading-location'), destination);
    setText($('#cargo-readout'), cargoName);
    setText($('#method-readout'), methodName);
    setText($('#size-readout'), sizeName);
    setText($('#payload-size-output'), sizeName);

    $$('[data-cargo-choice]').forEach((button) => {
      const active = button.dataset.cargoChoice === cargo;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $$('[data-loading-method]').forEach((button) => {
      const active = button.dataset.loadingMethod === loadingMethod;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const group = $('#loading-cargo-particles');
    if (group) {
      group.replaceChildren();
      const points = hydrophilic
        ? [[207, 147], [230, 132], [256, 153], [218, 177], [246, 192], [229, 211]]
        : [18, 74, 139, 201, 263, 324].map((deg) => {
          const radians = (deg * Math.PI) / 180;
          return [230 + 101 * Math.cos(radians), 168 + 101 * Math.sin(radians)];
        });
      const particleRadius = 1.8 + cargoSize * .62;
      points.forEach(([x, y], index) => {
        group.appendChild(svgNode('circle', { cx: x, cy: y, r: index === 0 ? particleRadius * 1.2 : particleRadius * .82, style: `animation-delay:${index * -.17}s` }));
      });
    }

    let title;
    let explanation;
    if (hydrophilic && loadingMethod === 'passive') {
      title = copy('Hydrophilic cargo → aqueous core', 'حمولة محبة للماء ← النواة المائية');
      explanation = copy('Water-compatible molecules may be entrapped in the inner aqueous space as vesicles form. Actual loading depends on the molecule and formulation.', 'قد تُحتجز الجزيئات المتوافقة مع الماء في الحيّز المائي الداخلي أثناء تكوّن الحويصلات. ويعتمد التحميل الفعلي على الجزيء والتركيبة.');
    } else if (hydrophilic && loadingMethod === 'remote') {
      title = copy('Remote loading → selected compounds', 'التحميل البعيد ← مركبات مختارة');
      explanation = copy('A transmembrane gradient can drive selected ionizable compounds into preformed vesicles. This is formulation-specific, not a universal method.', 'قد يوجّه تدرّج عبر الغشاء دخول مركبات قابلة للتأين مختارة إلى حويصلات مُشكّلة مسبقًا. وتعتمد الطريقة على التركيبة وليست عامة لكل دواء.');
    } else if (!hydrophilic && loadingMethod === 'passive') {
      title = copy('Lipophilic cargo → lipid bilayer', 'حمولة محبة للدهون ← الغشاء الدهني');
      explanation = copy('Lipophilic molecules may partition into the lipid membrane. Compatibility and retention depend on drug properties and lipid composition.', 'قد تتموضع الجزيئات المحبة للدهون داخل الغشاء. ويعتمد التوافق والاحتفاظ بها على خصائص الدواء وتركيب الدهون.');
    } else {
      title = copy('Compare the loading routes', 'قارن بين طرق التحميل');
      explanation = copy('Remote loading is commonly discussed for selected ionizable compounds. This pairing is shown for comparison—not as a general recommendation for lipophilic cargo.', 'يُناقش التحميل البعيد عادةً لمركبات قابلة للتأين ومختارة. يظهر هذا الاختيار للمقارنة، وليس كتوصية عامة للحمولة المحبة للدهون.');
    }
    setText($('#loading-explanation-title'), title);
    setText($('#loading-explanation-copy'), explanation);
  }
  $$('[data-cargo-choice]').forEach((button) => button.addEventListener('click', () => { cargo = button.dataset.cargoChoice; renderLoading(); }));
  $$('[data-loading-method]').forEach((button) => button.addEventListener('click', () => { loadingMethod = button.dataset.loadingMethod; renderLoading(); }));
  $('#payload-size')?.addEventListener('input', (event) => { cargoSize = Number(event.currentTarget.value); renderLoading(); });

  const preparationInfo = {
    film: {
      en: { overline: 'METHOD 01 / FILM FORMATION', title: 'Thin-film hydration', description: 'Lipids are arranged as a thin film. Contact with an aqueous phase allows them to self-assemble into vesicles; further processing may be used to adjust size or lamellarity.', steps: ['Arrange lipids as a thin film', 'Introduce an aqueous phase', 'Characterize and refine the vesicle population'], advantage: 'A foundational approach that makes the self-assembly concept easy to visualize.', limitation: 'The initial population may be heterogeneous and can require additional size-control steps.', caption: 'LIPID FILM → HYDRATION → VESICLES' },
      ar: { overline: 'الطريقة ٠١ / تكوين غشاء', title: 'ترطيب الغشاء الرقيق', description: 'تُرتّب الدهون في صورة غشاء رقيق. ويسمح ملامستها لطور مائي بالتجمع الذاتي وتكوين حويصلات؛ وقد تُستخدم خطوات إضافية لتعديل الحجم أو عدد الطبقات.', steps: ['ترتيب الدهون في غشاء رقيق', 'إضافة طور مائي', 'توصيف مجموعة الحويصلات وضبطها'], advantage: 'طريقة تأسيسية تساعد على تصور مفهوم التجمع الذاتي.', limitation: 'قد تكون المجموعة الأولية غير متجانسة، وقد تحتاج إلى خطوات إضافية لضبط الحجم.', caption: 'غشاء دهني ← ترطيب ← حويصلات' }
    },
    ethanol: {
      en: { overline: 'METHOD 02 / SOLVENT MIXING', title: 'Ethanol injection', description: 'A lipid-containing ethanol stream is mixed with an aqueous phase. As the solvent environment changes, lipids can self-assemble into vesicles; process conditions affect the result.', steps: ['Prepare lipid and aqueous streams', 'Bring the streams together under controlled conditions', 'Remove or reduce solvent and characterize'], advantage: 'A direct mixing concept that can be adapted to continuous processing.', limitation: 'Residual solvent, mixing conditions and formulation composition need careful control.', caption: 'LIPID STREAM + WATER → SELF-ASSEMBLY' },
      ar: { overline: 'الطريقة ٠٢ / مزج المذيب', title: 'الحقن بالإيثانول', description: 'يُمزج تيار إيثانولي يحتوي على الدهون مع طور مائي. ومع تغيّر بيئة المذيب قد تتجمع الدهون ذاتيًا لتكوين الحويصلات؛ وتؤثر ظروف العملية في النتيجة.', steps: ['تحضير تيار دهني وآخر مائي', 'مزج التيارين ضمن ظروف مضبوطة', 'تقليل المذيب وتوصيف الحويصلات'], advantage: 'مفهوم مزج مباشر يمكن تكييفه مع المعالجة المستمرة.', limitation: 'تتطلب بقايا المذيب وظروف المزج وتركيب المستحضر ضبطًا دقيقًا.', caption: 'تيار دهني + ماء ← تجمع ذاتي' }
    },
    microfluidic: {
      en: { overline: 'METHOD 03 / CONTROLLED MIXING', title: 'Microfluidic mixing', description: 'Lipid-rich and aqueous streams meet in a small controlled mixer. Flow and composition settings can be tuned, then the resulting vesicles are characterized.', steps: ['Set up lipid-rich and aqueous streams', 'Mix the streams in a controlled device', 'Collect and characterize the formulation'], advantage: 'Offers a controllable mixing environment for formulation development.', limitation: 'Requires specialized equipment; scale-up and operating conditions need evaluation.', caption: 'CONTROLLED STREAMS → VESICLE FORMATION' },
      ar: { overline: 'الطريقة ٠٣ / مزج مضبوط', title: 'الخلط الميكروفلويدي', description: 'يلتقي تيار غني بالدهون مع تيار مائي داخل جهاز خلط صغير ومضبوط. ويمكن تعديل ظروف التدفق والتركيب، ثم توصيف الحويصلات الناتجة.', steps: ['إعداد تيار دهني وآخر مائي', 'مزج التيارات في جهاز مضبوط', 'جمع التركيبة وتوصيفها'], advantage: 'يوفّر بيئة مزج قابلة للتحكم أثناء تطوير التركيبة.', limitation: 'يتطلب معدات متخصصة، كما يجب تقييم ظروف التشغيل والتوسع الإنتاجي.', caption: 'تيارات مضبوطة ← تكوين الحويصلات' }
    },
    reverse: {
      en: { overline: 'METHOD 04 / EMULSION INVERSION', title: 'Reverse-phase evaporation', description: 'Lipids in an organic solvent are mixed with an aqueous phase to form a water-in-oil emulsion. Removing the solvent can invert that emulsion into large vesicles with the aqueous cargo inside. This is a concept map, not a procedure.', steps: ['Disperse an aqueous phase in a lipid-solvent phase', 'Remove the organic solvent under controlled conditions', 'Allow vesicles to form and then characterize them'], advantage: 'Often discussed when a larger aqueous core and higher entrapment of water-soluble cargo are desired.', limitation: 'Residual solvent and shear can be problematic, especially for sensitive proteins.', caption: 'EMULSION → SOLVENT REMOVAL → VESICLES' },
      ar: { overline: 'الطريقة ٠٤ / قلب المستحلب', title: 'تبخير الطور المعكوس', description: 'تُمزج الدهون في مذيب عضوي مع طور مائي لتكوين مستحلب ماء في زيت. وإزالة المذيب قد تقلب المستحلب إلى حويصلات كبيرة تحتجز الحمولة المائية. هذه خريطة مفاهيم وليست إجراءً.', steps: ['تشتيت طور مائي داخل طور دهني مذيبي', 'إزالة المذيب العضوي في ظروف مضبوطة', 'السماح بتكوّن الحويصلات ثم توصيفها'], advantage: 'تُناقش غالبًا عند الحاجة إلى نواة مائية أكبر واحتجاز أعلى للحمولة الذوّابة في الماء.', limitation: 'قد تُشكّل بقايا المذيب وقوى القص مشكلة، خصوصًا مع البروتينات الحسّاسة.', caption: 'مستحلب ← إزالة المذيب ← حويصلات' }
    },
    detergent: {
      en: { overline: 'METHOD 05 / MICELLE TRANSITION', title: 'Detergent removal', description: 'Lipids are first solubilized with a detergent as mixed micelles. As the detergent is gradually removed, lipids can reassemble into vesicles. The idea is gentle assembly, still not a recipe.', steps: ['Solubilize lipids with a detergent', 'Include the cargo in that micellar mixture', 'Remove the detergent so vesicles can assemble'], advantage: 'Milder conditions are often preferred when the cargo is a protein or another fragile molecule.', limitation: 'Removal can be slow, and leftover detergent must be checked because it can destabilize membranes.', caption: 'MIXED MICELLES → DETERGENT LEAVES → VESICLES' },
      ar: { overline: 'الطريقة ٠٥ / تحوّل الميسيل', title: 'إزالة المنظف', description: 'تُذوّب الدهون أولًا بمنظف على هيئة ميسيلات مختلطة. ومع إزالة المنظف تدريجيًا قد تعيد الدهون تجميع نفسها في حويصلات. الفكرة تجميع لطيف وليست وصفة.', steps: ['إذابة الدهون باستخدام منظف', 'إدخال الحمولة في مزيج الميسيلات', 'إزالة المنظف حتى تتجمع الحويصلات'], advantage: 'تُفضَّل الظروف الألطف غالبًا عندما تكون الحمولة بروتينًا أو جزيئًا هشًا.', limitation: 'قد تكون الإزالة بطيئة، ويجب التأكد من عدم بقاء منظف لأنه قد يزعزع الأغشية.', caption: 'ميسيلات مختلطة ← خروج المنظف ← حويصلات' }
    }
  };
  let selectedMethod = 'film';
  function renderPreparation() {
    const item = preparationInfo[selectedMethod][lang];
    setText($('#prep-overline'), item.overline);
    setText($('#prep-title'), item.title);
    setText($('#prep-description'), item.description);
    setText($('#prep-advantage'), item.advantage);
    setText($('#prep-limitation'), item.limitation);
    setText($('#lab-visual-caption'), item.caption);
    const stepList = $('#prep-steps');
    if (stepList) {
      stepList.replaceChildren(...item.steps.map((step) => {
        const li = document.createElement('li');
        li.textContent = step;
        return li;
      }));
    }
    $('.lab-visual')?.setAttribute('data-method', selectedMethod);
    $$('[data-prep-method]').forEach((button) => {
      const active = button.dataset.prepMethod === selectedMethod;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }
  $$('[data-prep-method]').forEach((button) => button.addEventListener('click', () => { selectedMethod = button.dataset.prepMethod; renderPreparation(); }));

  const journeyStages = [
    {
      en: { title: 'Administration', description: 'The formulation enters the body by its intended route. Products differ in composition, dosage form and route of administration.' },
      ar: { title: 'الإعطاء', description: 'يدخل المستحضر إلى الجسم عبر الطريق المخصّص له. وتختلف المنتجات في تركيبها وشكلها الصيدلاني وطريق إعطائها.' }
    },
    {
      en: { title: 'Circulation', description: 'After administration, particles encounter biological fluids and proteins. Their behaviour depends on the design and the biological environment.' },
      ar: { title: 'الدوران', description: 'بعد الإعطاء، تواجه الجسيمات سوائل الجسم وبروتيناته. ويعتمد سلوكها على تصميمها والبيئة الحيوية المحيطة.' }
    },
    {
      en: { title: 'Biodistribution', description: 'The formulation distributes through the body. Size, surface properties, composition and route can influence where it goes.' },
      ar: { title: 'التوزيع الحيوي', description: 'يتوزع المستحضر في الجسم. ويمكن للحجم وخصائص السطح والتركيب وطريق الإعطاء أن تؤثر في مساره.' }
    },
    {
      en: { title: 'Cellular interaction', description: 'A liposome may interact with cells or be taken up, but the outcome is not identical for every formulation or tissue.' },
      ar: { title: 'التفاعل الخلوي', description: 'قد يتفاعل الليبوسوم مع الخلايا أو يدخلها، لكن النتيجة لا تكون واحدة لكل التركيبات أو الأنسجة.' }
    },
    {
      en: { title: 'Drug release', description: 'Cargo can become available through formulation-dependent processes. Release rate and location are properties to measure—not assume.' },
      ar: { title: 'إطلاق الدواء', description: 'قد تصبح الحمولة متاحة عبر آليات تعتمد على التركيبة. ومعدل الإطلاق وموضعه خصائص تُقاس ولا تُفترض.' }
    }
  ];
  let currentStage = 0;
  let journeyTimer = null;
  let journeyPlaying = false;
  function stopJourney() {
    if (journeyTimer) window.clearInterval(journeyTimer);
    journeyTimer = null;
    journeyPlaying = false;
  }
  function updatePlayLabel() {
    setText($('#journey-play-label'), journeyPlaying ? copy('Pause journey', 'أوقف الرحلة') : copy('Play journey', 'ابدأ الرحلة'));
    const icon = $('#journey-play > span:first-child');
    if (icon) icon.textContent = journeyPlaying ? 'Ⅱ' : '▶';
  }
  function renderJourney() {
    const stage = journeyStages[currentStage][lang];
    const progress = (currentStage / (journeyStages.length - 1)) * 100;
    const directionProgress = lang === 'ar' ? 100 - progress : progress;
    setText($('#journey-stage-count'), copy(`STAGE ${String(currentStage + 1).padStart(2, '0')} / 05`, `المرحلة ${['٠١','٠٢','٠٣','٠٤','٠٥'][currentStage]} / ٠٥`));
    setText($('#journey-overline'), copy(`STAGE ${String(currentStage + 1).padStart(2, '0')} / ${stage.title.toUpperCase()}`, `المرحلة ${['٠١','٠٢','٠٣','٠٤','٠٥'][currentStage]} / ${stage.title}`));
    setText($('#journey-stage-title'), stage.title);
    setText($('#journey-stage-description'), stage.description);
    $('#route-active')?.style.setProperty('width', `${progress}%`);
    $('#sim-carrier')?.style.setProperty('left', `${directionProgress}%`);
    $('.scene-glow')?.style.setProperty('left', `${lang === 'ar' ? 90 - progress * .66 : 10 + progress * .66}%`);
    $('#journey-scene')?.setAttribute('data-stage', String(currentStage));
    $$('[data-stage-index]').forEach((button) => {
      const active = Number(button.dataset.stageIndex) === currentStage;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    const prev = $('#journey-prev');
    const next = $('#journey-next');
    if (prev) prev.disabled = currentStage === 0;
    if (next) next.disabled = currentStage === journeyStages.length - 1;
    updatePlayLabel();
  }
  function goToStage(index) {
    currentStage = Math.max(0, Math.min(journeyStages.length - 1, index));
    renderJourney();
  }
  $$('[data-stage-index]').forEach((button) => button.addEventListener('click', () => {
    stopJourney();
    goToStage(Number(button.dataset.stageIndex));
  }));
  $('#journey-prev')?.addEventListener('click', () => { stopJourney(); goToStage(currentStage - 1); });
  $('#journey-next')?.addEventListener('click', () => { stopJourney(); goToStage(currentStage + 1); });
  $('#journey-play')?.addEventListener('click', () => {
    if (journeyPlaying) {
      stopJourney();
      renderJourney();
      return;
    }
    if (currentStage === journeyStages.length - 1) goToStage(0);
    journeyPlaying = true;
    updatePlayLabel();
    journeyTimer = window.setInterval(() => {
      if (currentStage >= journeyStages.length - 1) {
        stopJourney();
        renderJourney();
      } else {
        currentStage += 1;
        renderJourney();
      }
    }, 2350);
  });

  const quizQuestions = [
    {
      en: { question: 'In a simple liposome model, where is hydrophilic cargo most likely to be found?', options: ['In the aqueous core', 'Between the hydrophobic tails only', 'Inside cholesterol molecules', 'Outside the vesicle in every case'], explanation: 'The water-rich interior can entrap suitable water-compatible molecules.' },
      ar: { question: 'في نموذج مبسّط لليبوسوم، أين يُرجّح وجود الحمولة المحبة للماء؟', options: ['في النواة المائية', 'بين الذيول الكارهة للماء فقط', 'داخل جزيئات الكوليسترول', 'خارج الحويصلة في كل الحالات'], explanation: 'يمكن للحيّز الداخلي الغني بالماء احتواء جزيئات مناسبة ومتوافقة معه.' },
      correct: 0
    },
    {
      en: { question: 'Where do phospholipid head groups face in a bilayer?', options: ['Toward aqueous environments on both sides', 'Toward each other in the centre', 'Only toward the outside of a liposome', 'Away from all water'], explanation: 'The polar heads face the water on both the outer and inner surfaces.' },
      ar: { question: 'إلى أين تتجه رؤوس الفوسفوليبيدات في الغشاء المزدوج؟', options: ['نحو البيئتين المائيتين على الجانبين', 'نحو بعضها في المنتصف', 'نحو خارج الليبوسوم فقط', 'بعيدًا عن الماء تمامًا'], explanation: 'تتجه الرؤوس القطبية نحو الماء على السطحين الخارجي والداخلي.' },
      correct: 0
    },
    {
      en: { question: 'What defines a unilamellar liposome?', options: ['One phospholipid bilayer', 'Several concentric bilayers', 'No lipid membrane', 'A solid polymer shell'], explanation: '“Unilamellar” describes a vesicle with a single bilayer surrounding its aqueous space.' },
      ar: { question: 'ما الذي يميّز الليبوسوم أحادي الغشاء؟', options: ['غشاء فوسفوليبيدي مزدوج واحد', 'عدة أغشية متراكزة', 'غياب الغشاء الدهني', 'غلاف بوليمري صلب'], explanation: 'يشير مصطلح «أحادي الغشاء» إلى حويصلة يحيط بحيّزها المائي غشاء مزدوج واحد.' },
      correct: 0
    },
    {
      en: { question: 'When included in a liposome membrane, cholesterol can…', options: ['Influence membrane packing and properties', 'Turn the aqueous core into a drug', 'Replace every phospholipid', 'Guarantee targeting to one organ'], explanation: 'Cholesterol can modulate bilayer packing, fluidity and permeability; its effects depend on composition.' },
      ar: { question: 'عند إدخاله في غشاء الليبوسوم، يمكن للكوليسترول أن…', options: ['يؤثر في تراص الغشاء وخصائصه', 'يحوّل النواة المائية إلى دواء', 'يستبدل كل الفوسفوليبيدات', 'يضمن استهداف عضو واحد'], explanation: 'قد يعدّل الكوليسترول تراص الغشاء وسيولته ونفاذيته، ويعتمد تأثيره على التركيب.' },
      correct: 0
    },
    {
      en: { question: 'Encapsulation efficiency is most closely related to…', options: ['The fraction of starting drug incorporated into vesicles', 'The number of labels on a vial', 'The colour of the lipid membrane', 'The total number of phospholipid heads'], explanation: 'It describes how much of the initially added drug becomes associated with or entrapped in the vesicle formulation, using a defined measurement method.' },
      ar: { question: 'يرتبط مفهوم كفاءة الاحتواء أساسًا بـ…', options: ['نسبة الدواء المضاف التي أُدمجت في الحويصلات', 'عدد الملصقات على العبوة', 'لون الغشاء الدهني', 'العدد الكلي لرؤوس الفوسفوليبيد'], explanation: 'يصف مقدار الدواء المضاف أولًا الذي ارتبط بالتركيبة أو احتُوي فيها، وفق طريقة قياس محددة.' },
      correct: 0
    },
    {
      en: { question: 'Multilamellar vesicles (MLVs) are best described as…', options: ['A solid lipid particle with no water', 'Many concentric bilayers, like an onion', 'A vesicle with no membrane', 'Always smaller than 20 nm'], explanation: 'MLVs have several bilayers stacked around one another, separated by thin aqueous layers.' },
      ar: { question: 'أفضل وصف للحويصلات متعددة الأغشية (MLV) هو…', options: ['جسيم دهني صلب بلا ماء', 'عدة أغشية متراكزة تشبه البصلة', 'حويصلة بلا غشاء', 'دائمًا أصغر من ٢٠ نانومتر'], explanation: 'للحويصلة متعددة الأغشية عدة طبقات متراصة يفصل بينها حيّز مائي رقيق.' },
      correct: 1
    },
    {
      en: { question: 'Thin-film hydration most often produces, as a first population…', options: ['Only giant unilamellar vesicles', 'Multilamellar vesicles', 'A sterile injectable medicine', 'Micelles with no bilayer'], explanation: 'Hydrating a dried lipid film commonly yields MLVs first. Extra steps such as extrusion can change size and lamellarity.' },
      ar: { question: 'غالبًا ما ينتج ترطيب الغشاء الرقيق، كمجموعة أولى…', options: ['حويصلات أحادية عملاقة فقط', 'حويصلات متعددة الأغشية', 'دواء حقني معقّم', 'ميسيلات بلا غشاء مزدوج'], explanation: 'ترطيب الغشاء الدهني الجاف ينتج عادة حويصلات متعددة الأغشية أولًا. وخطوات إضافية مثل البثق قد تغيّر الحجم وعدد الطبقات.' },
      correct: 1
    },
    {
      en: { question: 'Remote (active) loading of selected drugs is driven mainly by…', options: ['The colour of the vial', 'A transmembrane pH or ion gradient', 'Shaking the vial at room temperature only', 'Adding extra cholesterol after injection'], explanation: 'A gradient across the membrane can pull suitable ionizable molecules into preformed vesicles. It is not a universal method.' },
      ar: { question: 'يعتمد التحميل البعيد (النشط) لأدوية مختارة أساسًا على…', options: ['لون العبوة', 'تدرّج حموضة أو أيونات عبر الغشاء', 'رجّ العبوة في درجة حرارة الغرفة فقط', 'إضافة كوليسترول بعد الحقن'], explanation: 'قد يسحب تدرّج عبر الغشاء جزيئات قابلة للتأين ومناسبة إلى حويصلات مُشكّلة مسبقًا. وليست الطريقة عامة لكل دواء.' },
      correct: 1
    },
    {
      en: { question: 'Doxil is best known as…', options: ['Liposomal amphotericin B', 'Pegylated liposomal doxorubicin', 'Liposomal bupivacaine', 'A free doxorubicin tablet'], explanation: 'Doxil is a pegylated liposomal doxorubicin product, widely cited as the first FDA-approved liposomal medicine (1995).' },
      ar: { question: 'يُعرف دوكسيل بأنه…', options: ['أمفوتيريسين ب ليبوسومي', 'دوكسوروبيسين ليبوسومي مغلّف بـ PEG', 'بوبيفاكايين ليبوسومي', 'قرص دوكسوروبيسين حر'], explanation: 'دوكسيل مستحضر دوكسوروبيسين ليبوسومي مغلّف بـ PEG، ويُذكر على نطاق واسع كأول دواء ليبوسومي توافق عليه إدارة الغذاء والدواء عام ١٩٩٥.' },
      correct: 1
    },
    {
      en: { question: 'True or false: lipophilic drugs are loaded in the aqueous core.', options: ['True', 'False'], explanation: 'False in the simple model. Lipophilic molecules tend to sit in the bilayer; hydrophilic molecules are the ones associated with the aqueous core.' },
      ar: { question: 'صواب أم خطأ: تُحمَّل الأدوية المحبة للدهون في النواة المائية.', options: ['صواب', 'خطأ'], explanation: 'خطأ في النموذج المبسّط. تميل الجزيئات المحبة للدهون إلى الغشاء، بينما ترتبط الجزيئات المحبة للماء بالنواة المائية.' },
      correct: 1
    },
    {
      en: { question: 'True or false: PEGylation can prolong liposome circulation.', options: ['True', 'False'], explanation: 'True as a design principle. A PEG coat can reduce rapid immune clearance, which is why “stealth” liposomes circulate longer — still formulation-specific.' },
      ar: { question: 'صواب أم خطأ: يمكن لتغليف PEG أن يطيل بقاء الليبوسوم في الدم.', options: ['صواب', 'خطأ'], explanation: 'صواب كمبدأ تصميمي. قد يقلل غطاء PEG الإزالة المناعية السريعة، لذلك تدور ليبوسومات «الشبح» مدة أطول — ويبقى ذلك مرتبطًا بالتركيبة.' },
      correct: 0
    },
    {
      en: { question: 'True or false: giant unilamellar vesicles can be seen with a light microscope.', options: ['True', 'False'], explanation: 'True. GUVs are cell-sized, so unlike typical nano-sized SUVs they can be observed by light microscopy.' },
      ar: { question: 'صواب أم خطأ: يمكن رؤية الحويصلات الأحادية العملاقة بالمجهر الضوئي.', options: ['صواب', 'خطأ'], explanation: 'صواب. حجمها قريب من حجم الخلية، لذلك يمكن رؤيتها بالمجهر الضوئي بخلاف الحويصلات النانوية الصغيرة عادة.' },
      correct: 0
    }
  ];
  const quizLetters = ['A', 'B', 'C', 'D'];
  const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  const toArabicDigits = (value) => String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[digit]);
  const quizState = { index: 0, score: 0, selected: null, answered: false, complete: false, review: [] };
  let bestScore = Math.max(0, Number(storage.get('lipoverse-best-score')) || 0);
  function renderBestScore() {
    const total = quizQuestions.length;
    setText($('#best-score'), bestScore > 0 ? `${bestScore} / ${total}` : `— / ${total}`);
    if (typeof renderDashboard === 'function') renderDashboard();
  }
  function renderQuiz() {
    const card = $('#quiz-card');
    const questionNode = $('#quiz-question');
    const optionsNode = $('#quiz-options');
    const feedbackNode = $('#quiz-feedback');
    const nextButton = $('#quiz-next');
    const nextLabel = $('#quiz-next-label');
    const question = quizQuestions[quizState.index];
    const localeQuestion = question[lang];
    if (!card || !optionsNode) return;
    card.classList.toggle('is-complete', quizState.complete);
    renderBestScore();

    if (quizState.complete) {
      if (questionNode) questionNode.hidden = true;
      if (feedbackNode) feedbackNode.hidden = true;
      const result = document.createElement('div');
      result.className = 'quiz-result';
      const icon = document.createElement('span');
      icon.className = 'quiz-result-icon';
      icon.textContent = '✳';
      const heading = document.createElement('h3');
      heading.textContent = copy('Challenge complete', 'اكتمل التحدي');
      const paragraph = document.createElement('p');
      const total = quizQuestions.length;
      paragraph.textContent = copy(`You scored ${quizState.score} out of ${total}. Review the list, then try again whenever you are ready.`, `نتيجتك ${toArabicDigits(quizState.score)} من ${toArabicDigits(total)}. راجع القائمة ثم أعد المحاولة متى شئت.`);
      const review = document.createElement('ol');
      review.className = 'quiz-review';
      quizQuestions.forEach((item, reviewIndex) => {
        const chosen = quizState.review[reviewIndex];
        const ok = chosen === item.correct;
        const row = document.createElement('li');
        row.className = ok ? 'is-correct' : 'is-wrong';
        const prompt = document.createElement('strong');
        prompt.textContent = item[lang].question;
        const answer = document.createElement('span');
        const chosenText = item[lang].options[chosen] || '—';
        const correctText = item[lang].options[item.correct];
        answer.textContent = ok
          ? copy(`Your answer: ${chosenText}`, `إجابتك: ${chosenText}`)
          : copy(`Your answer: ${chosenText}. Correct: ${correctText}`, `إجابتك: ${chosenText}. الصحيحة: ${correctText}`);
        row.append(prompt, answer);
        review.append(row);
      });
      result.append(icon, heading, paragraph, review);
      optionsNode.replaceChildren(result);
      setText($('#quiz-count'), copy('CHALLENGE COMPLETE', 'اكتمل التحدي'));
      $('#quiz-progress-fill')?.style.setProperty('width', '100%');
      setText($('#quiz-score-label'), copy(`FINAL SCORE ${quizState.score} / ${quizQuestions.length}`, `النتيجة النهائية ${toArabicDigits(quizState.score)} / ${toArabicDigits(quizQuestions.length)}`));
      setText(nextLabel, copy('Try again', 'أعد الاختبار'));
      if (nextButton) nextButton.disabled = false;
      return;
    }

    if (questionNode) {
      questionNode.hidden = false;
      questionNode.textContent = localeQuestion.question;
    }
    if (feedbackNode) {
      feedbackNode.hidden = false;
      feedbackNode.textContent = '';
      feedbackNode.className = 'quiz-feedback';
    }
    setText($('#quiz-count'), copy(`QUESTION ${String(quizState.index + 1).padStart(2, '0')} / ${String(quizQuestions.length).padStart(2, '0')}`, `السؤال ${toArabicDigits(String(quizState.index + 1).padStart(2, '0'))} / ${toArabicDigits(String(quizQuestions.length).padStart(2, '0'))}`));
    $('#quiz-progress-fill')?.style.setProperty('width', `${((quizState.index + 1) / quizQuestions.length) * 100}%`);
    setText($('#quiz-score-label'), copy(`SCORE ${quizState.score}`, `النتيجة ${quizState.score}`));
    setText(nextLabel, quizState.answered ? (quizState.index === quizQuestions.length - 1 ? copy('See results', 'اعرض النتيجة') : copy('Next question', 'السؤال التالي')) : copy('Choose an answer', 'اختر إجابة'));
    if (nextButton) nextButton.disabled = !quizState.answered;

    const buttons = localeQuestion.options.map((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      button.disabled = quizState.answered;
      if (quizState.answered && index === question.correct) button.classList.add('is-correct');
      if (quizState.answered && index === quizState.selected && index !== question.correct) button.classList.add('is-wrong');
      const letter = document.createElement('span');
      letter.className = 'option-letter';
      letter.textContent = quizLetters[index];
      const label = document.createElement('span');
      label.textContent = option;
      button.append(letter, label);
      button.addEventListener('click', () => {
        if (quizState.answered) return;
        quizState.selected = index;
        quizState.answered = true;
        if (index === question.correct) quizState.score += 1;
        quizState.review[quizState.index] = index;
        renderQuiz();
      });
      return button;
    });
    optionsNode.replaceChildren(...buttons);

    if (quizState.answered && feedbackNode) {
      const isCorrect = quizState.selected === question.correct;
      feedbackNode.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
      feedbackNode.textContent = `${isCorrect ? copy('Correct.', 'إجابة صحيحة.') : copy('Not quite.', 'ليست الإجابة الصحيحة.') } ${localeQuestion.explanation}`;
    }
  }
  $('#quiz-next')?.addEventListener('click', () => {
    if (quizState.complete) {
      quizState.index = 0;
      quizState.score = 0;
      quizState.selected = null;
      quizState.answered = false;
      quizState.complete = false;
      quizState.review = [];
      renderQuiz();
      return;
    }
    if (!quizState.answered) return;
    if (quizState.index === quizQuestions.length - 1) {
      quizState.complete = true;
      bestScore = Math.max(bestScore, quizState.score);
      storage.set('lipoverse-best-score', String(bestScore));
    } else {
      quizState.index += 1;
      quizState.selected = null;
      quizState.answered = false;
    }
    renderQuiz();
  });

  const glossaryTerms = [
    { term: 'Amphiphilic', en: 'Having both a water-attracting region and a water-avoiding region.', arTerm: 'مزدوج المحبة', ar: 'يحتوي على جزء محب للماء وآخر يبتعد عن الماء.' },
    { term: 'Bilayer', en: 'A membrane made of two opposing phospholipid leaflets.', arTerm: 'غشاء مزدوج', ar: 'غشاء يتكوّن من طبقتين متقابلتين من الفوسفوليبيدات.' },
    { term: 'Encapsulation efficiency', en: 'The fraction of initially added drug incorporated into a carrier, measured by a defined method.', arTerm: 'كفاءة الاحتواء', ar: 'نسبة الدواء المضاف التي أُدمجت في الناقل وفق طريقة قياس محددة.' },
    { term: 'PEGylation', en: 'Attachment or inclusion of polyethylene glycol chains to modify a surface or formulation.', arTerm: 'الإضافة بـ PEG', ar: 'إضافة أو إدخال سلاسل البولي إيثيلين غليكول لتعديل السطح أو التركيبة.' },
    { term: 'PDI', en: 'Polydispersity index: a measure used to describe particle-size distribution breadth.', arTerm: 'مؤشر تعدد التشتت', ar: 'مقياس يُستخدم لوصف مدى اتساع توزيع أحجام الجسيمات.' },
    { term: 'Zeta potential', en: 'An electrokinetic measure related to the electrical potential near a particle surface.', arTerm: 'جهد زيتا', ar: 'مقياس كهروحركي يرتبط بالجهد الكهربائي قرب سطح الجسيم.' },
    { term: 'Remote loading', en: 'A post-formation loading approach that uses a transmembrane gradient for selected compounds.', arTerm: 'التحميل البعيد', ar: 'طريقة تحميل بعد تكوّن الحويصلة تستخدم تدرجًا عبر الغشاء لمركبات مختارة.' },
    { term: 'SUV', en: 'Small unilamellar vesicle: one bilayer and a relatively small aqueous core.', arTerm: 'حويصلة أحادية صغيرة', ar: 'حويصلة بغشاء واحد ونواة مائية صغيرة نسبيًا.' },
    { term: 'MLV', en: 'Multilamellar vesicle: several concentric bilayers, often compared to an onion.', arTerm: 'حويصلة متعددة الأغشية', ar: 'حويصلة بعدة أغشية متراكزة، وتُشبَّه غالبًا بالبصلة.' },
    { term: 'EPR effect', en: 'Enhanced permeability and retention: a concept used to explain nanoparticle accumulation in some leaky tumor vessels. It is not a guarantee of targeting.', arTerm: 'تأثير النفاذية والاحتفاظ', ar: 'مفهوم يُستخدم لتفسير تراكم الجسيمات النانوية في بعض أوعية الأورام المتسربة. وليس ضمانًا للاستهداف.' },
    { term: 'Stealth liposome', en: 'A liposome with a hydrophilic surface coat, often PEG, intended to slow rapid immune clearance.', arTerm: 'ليبوسوم شبح', ar: 'ليبوسوم بغطاء سطح محب للماء، غالبًا PEG، بهدف إبطاء الإزالة المناعية السريعة.' },
    { term: 'Lamellarity', en: 'The number of bilayers in a vesicle: uni-, oligo- or multilamellar.', arTerm: 'عدد الطبقات', ar: 'عدد الأغشية المزدوجة في الحويصلة: أحادية أو قليلة أو متعددة.' }
  ];
  function renderGlossary() {
    const list = $('#glossary-list');
    const empty = $('#glossary-empty');
    const query = ($('#glossary-search')?.value || '').trim().toLocaleLowerCase();
    if (!list) return;
    const matches = glossaryTerms.filter((item) => `${item.term} ${item.en} ${item.arTerm} ${item.ar}`.toLocaleLowerCase().includes(query));
    list.replaceChildren(...matches.map((item) => {
      const definition = document.createElement('dl');
      definition.className = 'glossary-item';
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = lang === 'ar' ? `${item.arTerm} · ${item.term}` : item.term;
      description.textContent = lang === 'ar' ? item.ar : item.en;
      definition.append(term, description);
      return definition;
    }));
    if (empty) empty.hidden = matches.length > 0;
    const count = $('#glossary-count');
    if (count) count.textContent = copy(`${glossaryTerms.length} TERMS`, `${toArabicDigits(glossaryTerms.length)} مصطلحات`);
  }
  $('#glossary-search')?.addEventListener('input', renderGlossary);

  const flashcards = [
    { topic: { en: 'STRUCTURE / BASICS', ar: 'التركيب / الأساسيات' }, front: { en: 'What makes a phospholipid amphiphilic?', ar: 'ما الذي يجعل الفوسفوليبيد مزدوج المحبة؟' }, back: { en: 'It has a hydrophilic head and hydrophobic tails.', ar: 'له رأس محب للماء وذيول كارهة للماء.' } },
    { topic: { en: 'STRUCTURE / CARGO', ar: 'التركيب / الحمولة' }, front: { en: 'Where may hydrophilic cargo be entrapped?', ar: 'أين قد تُحتوى الحمولة المحبة للماء؟' }, back: { en: 'In the aqueous core, if the molecule and formulation are suitable.', ar: 'في النواة المائية، إذا ناسبت خصائص الجزيء والتركيبة ذلك.' } },
    { topic: { en: 'STRUCTURE / CARGO', ar: 'التركيب / الحمولة' }, front: { en: 'Where may lipophilic cargo partition?', ar: 'أين قد تتموضع الحمولة المحبة للدهون؟' }, back: { en: 'Within the lipid bilayer, depending on its properties and formulation.', ar: 'داخل الغشاء الدهني، بحسب خصائصها والتركيبة.' } },
    { topic: { en: 'FORMULATION / TYPES', ar: 'التركيبة / الأنواع' }, front: { en: 'What does “unilamellar” describe?', ar: 'إلى ماذا يشير مصطلح «أحادي الغشاء»؟' }, back: { en: 'A vesicle surrounded by one phospholipid bilayer.', ar: 'حويصلة يحيط بها غشاء فوسفوليبيدي مزدوج واحد.' } },
    { topic: { en: 'FORMULATION / DESIGN', ar: 'التركيبة / التصميم' }, front: { en: 'Name one property measured during characterization.', ar: 'اذكر خاصية واحدة تُقاس أثناء التوصيف.' }, back: { en: 'Examples include particle size, PDI, zeta potential, loading or release.', ar: 'من أمثلتها حجم الجسيمات، ومؤشر التشتت، وجهد زيتا، والتحميل أو الإطلاق.' } },
    { topic: { en: 'FORMULATION / TYPES', ar: 'التركيبة / الأنواع' }, front: { en: 'What does MLV stand for?', ar: 'ماذا يعني اختصار MLV؟' }, back: { en: 'Multilamellar vesicle — several concentric bilayers.', ar: 'حويصلة متعددة الأغشية — عدة طبقات متراكزة.' } },
    { topic: { en: 'FORMULATION / LOADING', ar: 'التركيبة / التحميل' }, front: { en: 'Write the encapsulation-efficiency idea in words.', ar: 'اكتب فكرة كفاءة الاحتواء بكلماتك.' }, back: { en: 'Encapsulated drug divided by total drug, multiplied by 100.', ar: 'الدواء المحصور مقسومًا على إجمالي الدواء، ثم الضرب في ١٠٠.' } },
    { topic: { en: 'CLINIC / PRODUCTS', ar: 'العيادة / المستحضرات' }, front: { en: 'Which famous product is pegylated liposomal doxorubicin?', ar: 'أي مستحضر مشهور هو دوكسوروبيسين ليبوسومي مغلّف بـ PEG؟' }, back: { en: 'Doxil. Always check the current label before clinical use.', ar: 'دوكسيل. وراجع النشرة الحالية قبل أي استخدام سريري.' } },
    { topic: { en: 'FORMULATION / LAB', ar: 'التركيبة / المعمل' }, front: { en: 'What does thin-film hydration usually make first?', ar: 'ماذا ينتج ترطيب الغشاء الرقيق عادة في البداية؟' }, back: { en: 'Multilamellar vesicles. Size can be reduced afterwards.', ar: 'حويصلات متعددة الأغشية. ويمكن تصغير الحجم بعد ذلك.' } },
    { topic: { en: 'DELIVERY / DESIGN', ar: 'التوصيل / التصميم' }, front: { en: 'Why is a PEG coat called stealth?', ar: 'لماذا يُسمّى غطاء PEG شبحًا؟' }, back: { en: 'It can slow recognition and clearance by the immune system.', ar: 'لأنه قد يبطئ تعرّف الجهاز المناعي عليه وإزالته.' } }
  ];
  let flashIndex = 0;
  let flashFlipped = false;
  function renderFlashcard() {
    const card = flashcards[flashIndex];
    const front = $('#flashcard-prompt');
    const answer = $('#flashcard-answer');
    setText(front, card.front[lang]);
    setText(answer, card.back[lang]);
    setText($('#flashcard-topic'), card.topic[lang]);
    setText($('#flashcard-count'), `${String(flashIndex + 1).padStart(2, '0')} / ${String(flashcards.length).padStart(2, '0')}`);
    setText($('#flashcard-side-label'), flashFlipped ? copy('BACK', 'الإجابة') : copy('FRONT', 'السؤال'));
    setText($('#flashcard-hint'), flashFlipped ? copy('Tap to see the question', 'اضغط لعرض السؤال') : copy('Tap to reveal the answer', 'اضغط لإظهار الإجابة'));
    const hintArrow = $('#flashcard-hint b');
    if (hintArrow) hintArrow.textContent = '↗';
    if (front) front.hidden = flashFlipped;
    if (answer) answer.hidden = !flashFlipped;
    $('#flashcard')?.setAttribute('aria-pressed', String(flashFlipped));
  }
  $('#flashcard')?.addEventListener('click', () => { flashFlipped = !flashFlipped; renderFlashcard(); });
  $('#flashcard-prev')?.addEventListener('click', () => { flashIndex = (flashIndex - 1 + flashcards.length) % flashcards.length; flashFlipped = false; renderFlashcard(); });
  $('#flashcard-next')?.addEventListener('click', () => { flashIndex = (flashIndex + 1) % flashcards.length; flashFlipped = false; renderFlashcard(); });
  $('#flashcard-shuffle')?.addEventListener('click', () => {
    for (let i = flashcards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
    }
    flashIndex = 0;
    flashFlipped = false;
    renderFlashcard();
  });

  const menuToggle = $('#menu-toggle');
  const siteNav = $('#site-nav');
  function closeMenu() {
    menuToggle?.setAttribute('aria-expanded', 'false');
    siteNav?.classList.remove('is-open');
  }
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    siteNav?.classList.toggle('is-open', open);
  });
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = (link.getAttribute('href') || '').slice(1);
    if (!id || !document.querySelector(`[data-view="${id}"]`)) return;
    event.preventDefault();
    showView(id);
  });

  let toastTimer = null;
  function announce(message) {
    const toast = $('#toast');
    if (!toast) return;
    setText(toast, message);
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  const learningModules = [
    { id: 'overview', en: 'Introduction', ar: 'المقدمة' },
    { id: 'explorer', en: '3D Explorer', ar: 'المستكشف ثلاثي الأبعاد' },
    { id: 'types', en: 'Types', ar: 'الأنواع' },
    { id: 'loading', en: 'Drug loading', ar: 'تحميل الدواء' },
    { id: 'lab', en: 'Preparation lab', ar: 'معمل التحضير' },
    { id: 'journey', en: 'Simulation', ar: 'المحاكاة' },
    { id: 'applications', en: 'Applications', ar: 'التطبيقات' },
    { id: 'quiz', en: 'Quiz', ar: 'الاختبار' }
  ];
  const visited = new Set();
  try {
    JSON.parse(storage.get('lipoverse-visited') || '[]').forEach((id) => visited.add(id));
  } catch (_) { /* ignore a damaged save */ }

  const moduleCards = [
    { id: 'overview', en: 'Introduction', ar: 'المقدمة', enNote: 'Definition, history, and free drug versus carrier', arNote: 'التعريف والتاريخ ومقارنة الدواء الحر' },
    { id: 'explorer', en: '3D Explorer', ar: 'المستكشف', enNote: 'Rotate the live vesicle and name each part', arNote: 'أدر الحويصلة الحية وتعرّف على أجزائها' },
    { id: 'types', en: 'Types', ar: 'الأنواع', enNote: 'SUV, LUV, GUV, MLV and MVV as cards', arNote: 'بطاقات للأنواع الخمسة' },
    { id: 'loading', en: 'Drug loading', ar: 'التحميل', enNote: 'Watch cargo move, then calculate EE%', arNote: 'شاهد مكان الحمولة واحسب الكفاءة' },
    { id: 'lab', en: 'Preparation lab', ar: 'المعمل', enNote: 'Five preparation ideas, not a bench protocol', arNote: 'خمس أفكار للتحضير، وليست بروتوكولًا' },
    { id: 'journey', en: 'Simulation', ar: 'المحاكاة', enNote: 'A five-stage educational journey', arNote: 'رحلة تعليمية من خمس مراحل' },
    { id: 'applications', en: 'Clinic', ar: 'التطبيقات', enNote: 'Doxil, AmBisome, Onivyde and Exparel', arNote: 'دوكسيل وأمبيزوم وأونيفيد وإكسباريل' },
    { id: 'quiz', en: 'Quiz', ar: 'الاختبار', enNote: 'Twelve questions and an end review', arNote: 'اثنا عشر سؤالًا ومراجعة في النهاية' },
    { id: 'revision', en: 'Review', ar: 'مراجعة', enNote: 'Glossary and shuffleable flashcards', arNote: 'القاموس وبطاقات قابلة للخلط' }
  ];

  function renderModuleCards() {
    const grid = $('#modules-grid');
    if (!grid) return;
    grid.replaceChildren();
    moduleCards.forEach((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'module-card';
      button.dataset.module = card.id;
      if (visited.has(card.id)) button.classList.add('is-visited');
      const number = String(index + 1).padStart(2, '0');
      button.innerHTML = `<span class="module-index">${number}</span><strong></strong><small></small><b aria-hidden="true">↗</b>`;
      setText(button.querySelector('strong'), card[lang]);
      setText(button.querySelector('small'), lang === 'ar' ? card.arNote : card.enNote);
      button.addEventListener('click', () => showView(card.id));
      grid.appendChild(button);
    });
  }

  function renderDashboard() {
    const done = learningModules.filter((module) => visited.has(module.id)).length;
    const total = learningModules.length;
    const pct = Math.round((done / total) * 100);
    const next = learningModules.find((module) => !visited.has(module.id));
    setText($('#dash-pct'), `${pct}%`);
    setText($('#dash-count'), `${done} / ${total}`);
    setText($('#dash-quiz'), bestScore > 0 ? `${bestScore} / ${quizQuestions.length}` : '—');
    setText($('#dash-next'), next ? next[lang] : copy('All modules visited', 'زرت كل الوحدات'));
    setText($('#continue-label'), next ? copy(`Continue: ${next.en}`, `واصل: ${next.ar}`) : copy('Review the explorer', 'راجع المستكشف'));
    setText($('#nav-progress-pct'), `${pct}%`);
    ['#dash-fill', '#nav-progress-fill'].forEach((selector) => {
      const fill = $(selector);
      if (fill) fill.style.width = `${pct}%`;
    });
    renderModuleCards();
  }

  function placeStage(view) {
    const stage = document.getElementById('explorer-stage');
    const heroSlot = document.getElementById('hero-stage-slot');
    const explorerSlot = document.getElementById('explorer-stage-slot');
    if (!stage || !heroSlot || !explorerSlot) return;
    const target = view === 'explorer' ? explorerSlot : heroSlot;
    if (stage.parentElement !== target) target.appendChild(stage);
    document.querySelector('.hero-art')?.classList.toggle('has-live-model', view !== 'explorer');
    window.requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }

  function showView(id) {
    const known = new Set(['home', 'revision', ...learningModules.map((module) => module.id)]);
    const view = known.has(id) ? id : 'home';
    document.body.dataset.view = view;
    $$('[data-view]').forEach((element) => {
      element.classList.toggle('is-view-active', element.getAttribute('data-view') === view);
    });
    placeStage(view);
    if (learningModules.some((module) => module.id === view) && !visited.has(view)) {
      visited.add(view);
      storage.set('lipoverse-visited', JSON.stringify([...visited]));
    }
    renderDashboard();
    markCurrentNav();
    closeMenu();
    if (location.hash !== `#${view}`) history.replaceState(null, '', `#${view}`);
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function markCurrentNav() {
    const current = document.body.dataset.view || 'home';
    $$('.main-nav a').forEach((link) => {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function renderEfficiency() {
    const total = Number($('#ee-total')?.value);
    const encapsulated = Number($('#ee-enc')?.value);
    const output = $('#ee-result');
    if (!output) return;
    if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(encapsulated) || encapsulated < 0) {
      output.textContent = copy('Enter a total above zero.', 'أدخل إجماليًا أكبر من صفر.');
      return;
    }
    if (encapsulated > total) {
      output.textContent = copy('Encapsulated drug cannot exceed the total.', 'لا يمكن أن يتجاوز الدواء المحصور الإجمالي.');
      return;
    }
    const ee = Math.round((encapsulated / total) * 1000) / 10;
    const shown = Number.isInteger(ee) ? String(ee) : ee.toFixed(1);
    output.textContent = copy(`EE = ${shown}%`, `كفاءة الاحتواء = ${toArabicDigits(shown)}٪`);
  }
  ['ee-total', 'ee-enc'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', renderEfficiency);
  });

  $('#continue-learning')?.addEventListener('click', () => {
    const next = learningModules.find((module) => !visited.has(module.id)) || learningModules[1];
    showView(next.id);
  });
  $$('.timeline-cards li').forEach((item) => {
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    const toggle = () => item.classList.toggle('is-open');
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  });

  if ('IntersectionObserver' in window) {
    const progressObserver = new IntersectionObserver((entries) => {
      let changed = false;
      entries.forEach((entry) => {
        if (!entry.isIntersecting || visited.has(entry.target.id)) return;
        visited.add(entry.target.id);
        changed = true;
      });
      if (!changed) return;
      storage.set('lipoverse-visited', JSON.stringify([...visited]));
      renderDashboard();
    }, { threshold: 0.08 });
    learningModules.forEach((module) => {
      const section = document.getElementById(module.id);
      if (section) progressObserver.observe(section);
    });
  }


  function applyLanguage(nextLang) {
    lang = nextLang === 'ar' ? 'ar' : 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = copy('LIPOVERSE — Explore the science of liposomes', 'ليبوفيرس — استكشف علم الليبوسومات');
    storage.set('lipoverse-language', lang);
    $$('[data-en][data-ar]').forEach((element) => {
      element.textContent = element.getAttribute(`data-${lang}`) || '';
    });
    $$('[data-placeholder-en][data-placeholder-ar]').forEach((element) => {
      element.setAttribute('placeholder', element.getAttribute(`data-placeholder-${lang}`) || '');
    });
    menuToggle?.setAttribute('aria-label', copy('Open navigation', 'افتح القائمة'));
    $('#diagram-viewport')?.setAttribute('aria-label', copy('Interactive liposome model. Drag to rotate and use the zoom controls.', 'نموذج تفاعلي لليبوسوم. اسحب للتدوير واستخدم أدوات التكبير.'));
    $('#zoom-out')?.setAttribute('aria-label', copy('Zoom out', 'تصغير'));
    $('#zoom-in')?.setAttribute('aria-label', copy('Zoom in', 'تكبير'));
    $('#zoom-reset')?.setAttribute('aria-label', copy('Reset model view', 'إعادة ضبط النموذج'));
    $('#journey-prev')?.setAttribute('aria-label', copy('Previous stage', 'المرحلة السابقة'));
    $('#journey-next')?.setAttribute('aria-label', copy('Next stage', 'المرحلة التالية'));
    $('#flashcard-prev')?.setAttribute('aria-label', copy('Previous flashcard', 'البطاقة السابقة'));
    $('#flashcard-next')?.setAttribute('aria-label', copy('Next flashcard', 'البطاقة التالية'));
    renderPart();
    renderCutaway();
    renderType();
    renderLoading();
    renderPreparation();
    renderJourney();
    renderQuiz();
    renderGlossary();
    renderFlashcard();
    renderEfficiency();
    renderDashboard();
    markCurrentNav();
  }
  $('#language-toggle')?.addEventListener('click', () => {
    const nextLang = lang === 'en' ? 'ar' : 'en';
    applyLanguage(nextLang);
    announce(copy('Language set to English', 'تم تغيير اللغة إلى العربية'));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      showView('revision');
      $('#glossary-search')?.focus();
    }
  });
  setText($('#current-year'), String(new Date().getFullYear()));
  applyLanguage(lang);
  showView((location.hash || '#home').replace('#', '') || 'home');
})();
