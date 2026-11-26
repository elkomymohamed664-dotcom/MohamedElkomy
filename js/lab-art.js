/* Teaching diagrams for the preparation lab. Not photographs. */
(function () {
const font = "Sora, Inter, sans-serif";

function plate() {
  return `<rect width="360" height="240" rx="18" fill="#171320" stroke="rgba(196,181,253,0.4)" stroke-width="1.5"/>`;
}

function label(x, y, text, size = 13, anchor = "start", fill = "#EDE4FF", weight = "700") {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-family="${font}" font-weight="${weight}">${text}</text>`;
}

function flask(ox, oy, s = 1) {
  return `<g transform="translate(${ox} ${oy}) scale(${s})" fill="rgba(196,181,253,0.07)" stroke="#C4B5FD" stroke-width="${2.2 / s}" stroke-linejoin="round">
    <path d="M38 0 h24 v34 c0 8 26 14 34 34 c12 28 2 62 -46 68 c-48 -6 -58 -40 -46 -68 c8 -20 34 -26 34 -34 v-34 z"/>
  </g>`;
}

const thinfilm = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240">
  ${plate()}
  <line x1="180" y1="28" x2="180" y2="214" stroke="rgba(196,181,253,0.22)"/>
  ${label(90, 26, "1  Dry film", 14, "middle")}
  ${label(270, 26, "2  Hydrate", 14, "middle")}
  ${flask(28, 40, 1)}
  ${flask(208, 40, 1)}
  <!-- film on left wall -->
  <path d="M58 92 C50 120, 54 150, 78 168" fill="none" stroke="#EDE4FF" stroke-width="4" stroke-linecap="round"/>
  <path d="M66 96 C60 120, 64 146, 84 162" fill="none" stroke="#C4B5FD" stroke-width="1.6" stroke-linecap="round"/>
  ${label(78, 214, "lipid film on the wall", 11, "middle", "#C4B5FD", "500")}
  <!-- buffer + MLVs on the right -->
  <ellipse cx="270" cy="168" rx="42" ry="22" fill="rgba(109,40,217,0.45)"/>
  <g fill="none" stroke="#EDE4FF" stroke-width="1.5">
    <circle cx="252" cy="158" r="12"/><circle cx="252" cy="158" r="7"/><circle cx="252" cy="158" r="3" fill="#A78BFA" stroke="none"/>
    <circle cx="278" cy="166" r="11"/><circle cx="278" cy="166" r="6"/>
    <circle cx="262" cy="174" r="8"/><circle cx="262" cy="174" r="4"/>
  </g>
  <path d="M270 36 C276 46, 278 50, 270 56 C262 50, 264 46, 270 36 Z" fill="#C4B5FD"/>
  ${label(270, 214, "buffer swells MLVs", 11, "middle", "#C4B5FD", "500")}
</svg>`;

const reverse = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240">
  ${plate()}
  ${label(78, 28, "Water-in-oil", 13, "middle")}
  ${label(268, 28, "After evaporation", 13, "middle")}
  <circle cx="78" cy="120" r="62" fill="rgba(167,139,250,0.12)" stroke="#C4B5FD" stroke-width="2" stroke-dasharray="5 4"/>
  ${label(78, 198, "organic solvent", 11, "middle", "#C4B5FD", "500")}
  <g>
    <circle cx="58" cy="100" r="16" fill="rgba(109,40,217,0.55)" stroke="#EDE4FF" stroke-width="1.4"/>
    <circle cx="62" cy="98" r="2.2" fill="#F0ABFC"/>
    <circle cx="96" cy="108" r="14" fill="rgba(109,40,217,0.55)" stroke="#EDE4FF" stroke-width="1.4"/>
    <circle cx="98" cy="106" r="2.2" fill="#F0ABFC"/>
    <circle cx="72" cy="136" r="15" fill="rgba(109,40,217,0.55)" stroke="#EDE4FF" stroke-width="1.4"/>
    <circle cx="74" cy="134" r="2.2" fill="#F0ABFC"/>
    <circle cx="100" cy="142" r="11" fill="rgba(109,40,217,0.55)" stroke="#EDE4FF" stroke-width="1.4"/>
    <circle cx="102" cy="140" r="2" fill="#F0ABFC"/>
  </g>
  <path d="M158 112 h36" stroke="#C4B5FD" stroke-width="2.4" marker-end="url(#arr)"/>
  <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#C4B5FD"/></marker></defs>
  ${label(176, 104, "solvent", 11, "middle", "#C4B5FD", "500")}
  ${label(176, 132, "leaves", 11, "middle", "#C4B5FD", "500")}
  <g fill="none" stroke="#EDE4FF" stroke-width="2">
    <circle cx="250" cy="96" r="22" fill="rgba(109,40,217,0.28)"/>
    <circle cx="250" cy="96" r="16"/>
    <circle cx="292" cy="128" r="20" fill="rgba(109,40,217,0.28)"/>
    <circle cx="292" cy="128" r="14"/>
    <circle cx="248" cy="150" r="18" fill="rgba(109,40,217,0.28)"/>
    <circle cx="248" cy="150" r="12"/>
  </g>
  <g fill="#F0ABFC">
    <circle cx="250" cy="96" r="3"/><circle cx="292" cy="128" r="3"/><circle cx="248" cy="150" r="2.6"/>
  </g>
  ${label(270, 208, "LUVs, drug in the core", 11, "middle", "#C4B5FD", "500")}
</svg>`;

const ethanol = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240">
  ${plate()}
  ${label(24, 28, "Ethanol injection", 14)}
  <g transform="translate(22 40) rotate(32)">
    <rect x="0" y="9" width="12" height="12" rx="2" fill="#EDE4FF"/>
    <rect x="12" y="5" width="72" height="20" rx="4" fill="#2C2640" stroke="#EDE4FF" stroke-width="2"/>
    <rect x="20" y="9" width="46" height="12" rx="2" fill="rgba(237,228,255,0.72)"/>
    <rect x="82" y="11" width="34" height="6" rx="1" fill="#C4B5FD"/>
  </g>
  <path d="M132 96 C156 118, 168 136, 186 154" fill="none" stroke="#EDE4FF" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 7"/>
  <path d="M168 112 L156 198 Q214 216 290 198 L278 112 Z" fill="rgba(109,40,217,0.3)" stroke="#C4B5FD" stroke-width="2.2"/>
  <path d="M158 112 h130" stroke="#C4B5FD" stroke-width="3.2" stroke-linecap="round"/>
  <g fill="rgba(109,40,217,0.25)" stroke="#EDE4FF" stroke-width="1.5">
    <circle cx="198" cy="164" r="10"/><circle cx="198" cy="164" r="6" fill="none"/>
    <circle cx="224" cy="176" r="9"/><circle cx="224" cy="176" r="5" fill="none"/>
    <circle cx="248" cy="162" r="10"/><circle cx="248" cy="162" r="6" fill="none"/>
    <circle cx="214" cy="150" r="7"/><circle cx="238" cy="182" r="7"/><circle cx="266" cy="174" r="6"/>
  </g>
  <path d="M208 140 C222 130, 240 130, 252 142" fill="none" stroke="#C4B5FD" stroke-width="1.7" marker-end="url(#arr2)"/>
  <defs><marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#C4B5FD"/></marker></defs>
  ${label(214, 226, "vesicles form as ethanol dilutes", 12, "middle", "#C4B5FD", "500")}
</svg>`;

function micelle(cx, cy, r) {
  return [0, 45, 90, 135, 180, 225, 270, 315].map(a => {
    const x = cx + Math.cos(a * Math.PI / 180) * r;
    const y = cy + Math.sin(a * Math.PI / 180) * r;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3"/>`;
  }).join("");
}
const detergent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240">
  ${plate()}
  ${label(24, 28, "Detergent removal", 14)}
  <rect x="28" y="48" width="150" height="148" rx="34" fill="rgba(109,40,217,0.16)" stroke="#EDE4FF" stroke-width="2.2" stroke-dasharray="5 4"/>
  <g fill="#EDE4FF">
    ${micelle(78, 104, 16)}
    ${micelle(118, 150, 15)}
  </g>
  <g fill="#F0ABFC">
    <circle cx="168" cy="78" r="3"/><circle cx="184" cy="96" r="2.6"/><circle cx="176" cy="118" r="3"/>
    <circle cx="190" cy="140" r="2.6"/><circle cx="172" cy="162" r="3"/><circle cx="198" cy="124" r="2.4"/>
  </g>
  <path d="M206 118 h28" stroke="#C4B5FD" stroke-width="2.2" marker-end="url(#arrd)"/>
  <defs><marker id="arrd" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#C4B5FD"/></marker></defs>
  <g fill="rgba(109,40,217,0.28)" stroke="#EDE4FF" stroke-width="1.8">
    <circle cx="268" cy="86" r="18"/><circle cx="268" cy="86" r="12" fill="none"/>
    <circle cx="304" cy="124" r="16"/><circle cx="304" cy="124" r="10" fill="none"/>
    <circle cx="262" cy="154" r="15"/><circle cx="262" cy="154" r="9" fill="none"/>
  </g>
  ${label(103, 214, "micelles in a dialysis bag", 11, "middle", "#C4B5FD", "500")}
  ${label(286, 214, "closed vesicles", 11, "middle", "#C4B5FD", "500")}
  ${label(188, 44, "detergent out", 11, "middle", "#F0ABFC", "500")}
</svg>`;

const micro = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240">
  ${plate()}
  ${label(24, 28, "Microfluidic focusing", 14)}
  <rect x="20" y="44" width="320" height="150" rx="16" fill="#221C30" stroke="rgba(196,181,253,0.45)"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M36 78 H128 L176 116" stroke="#7C3AED" stroke-width="16"/>
    <path d="M36 162 H128 L176 124" stroke="#7C3AED" stroke-width="16"/>
    <path d="M36 120 H186" stroke="#EDE4FF" stroke-width="7"/>
    <path d="M176 120 H318" stroke="#C4B5FD" stroke-width="16"/>
  </g>
  <g fill="none" stroke="#171320" stroke-width="1.4">
    <circle cx="230" cy="120" r="6"/><circle cx="252" cy="120" r="6"/><circle cx="274" cy="120" r="6"/><circle cx="296" cy="120" r="6"/>
  </g>
  ${label(36, 214, "aqueous", 12, "start", "#C4B5FD", "500")}
  ${label(150, 214, "lipid in ethanol", 12, "middle", "#EDE4FF", "500")}
  ${label(300, 214, "uniform vesicles", 12, "end", "#C4B5FD", "500")}
</svg>`;

const extrusion = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240">
  ${plate()}
  ${label(24, 28, "Membrane extrusion", 14)}
  <!-- left barrel -->
  <rect x="28" y="78" width="118" height="78" rx="8" fill="rgba(109,40,217,0.18)" stroke="#C4B5FD" stroke-width="2"/>
  <rect x="8" y="100" width="24" height="34" rx="3" fill="#EDE4FF"/>
  <g fill="none" stroke="#EDE4FF" stroke-width="1.5">
    <circle cx="58" cy="104" r="13"/><circle cx="58" cy="104" r="8"/>
    <circle cx="92" cy="112" r="15"/><circle cx="92" cy="112" r="9"/>
    <circle cx="70" cy="132" r="12"/><circle cx="70" cy="132" r="7"/>
    <circle cx="108" cy="136" r="11"/><circle cx="108" cy="136" r="6"/>
  </g>
  <!-- membrane -->
  <rect x="156" y="62" width="22" height="112" rx="4" fill="#C4B5FD"/>
  <g fill="#171320">
    <circle cx="167" cy="86" r="4"/><circle cx="167" cy="108" r="4"/><circle cx="167" cy="130" r="4"/><circle cx="167" cy="152" r="4"/>
  </g>
  <!-- right barrel -->
  <rect x="188" y="78" width="140" height="78" rx="8" fill="rgba(109,40,217,0.18)" stroke="#C4B5FD" stroke-width="2"/>
  <g fill="none" stroke="#EDE4FF" stroke-width="1.3">
    ${[[210,100],[228,100],[246,100],[264,100],[282,100],[300,100],[210,118],[228,118],[246,118],[264,118],[282,118],[300,118],[210,136],[228,136],[246,136],[264,136],[282,136],[300,136]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join("")}
  </g>
  <path d="M70 58 h150" stroke="#C4B5FD" stroke-width="2" marker-end="url(#arr3)"/>
  <defs><marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#C4B5FD"/></marker></defs>
  ${label(78, 214, "large MLVs", 12, "middle", "#C4B5FD", "500")}
  ${label(167, 196, "pores", 11, "middle", "#EDE4FF")}
  ${label(258, 214, "smaller, more uniform", 12, "middle", "#C4B5FD", "500")}
</svg>`;


  const captions = {
    thinfilm: 'فيلم دهني على جدار الدورق، وبعد إضافة المحلول تتكون حويصلات متعددة الطبقات.',
    reverse: 'قطرات مائية جوه مذيب عضوي. لما المذيب يتبخر، الدواء يفضل جوه الحويصلة.',
    ethanol: 'حقن الدهون المذابة في الإيثانول في الطور المائي، فتتجمع الحويصلات لوحدها.',
    detergent: 'الميسيلات جوه كيس الديلزة. المنظف يخرج، والدهون تقفل حويصلات.',
    microfluidic: 'تيار الدهون يتضيق بين تيارين مائيين، فيطلع حجم متجانس.',
    extrusion: 'المعلق يتضغط عبر مسام الغشاء، فالحويصلات الكبيرة تصغر وتتظبط.',
  };

  function iconWrap(body) {
    return '<svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true"><rect width="40" height="40" rx="8" fill="#171320"/>' + body + '</svg>';
  }

  const icons = {
    thinfilm: iconWrap('<path d="M15 4 h10 v9 c0 2 7 4 9 9 c3 8 0 16 -14 18 c-14 -2 -17 -10 -14 -18 c2 -5 9 -7 9 -9 v-9 z" fill="rgba(196,181,253,0.08)" stroke="#C4B5FD" stroke-width="1.5"/><path d="M14 18 c-1 5 0 8 4 11" fill="none" stroke="#EDE4FF" stroke-width="1.8" stroke-linecap="round"/>'),
    reverse: iconWrap('<circle cx="20" cy="20" r="13" fill="rgba(167,139,250,0.12)" stroke="#C4B5FD" stroke-dasharray="3 2"/><circle cx="15" cy="17" r="4.2" fill="#6D28D9" stroke="#EDE4FF" stroke-width="1"/><circle cx="24" cy="23" r="3.4" fill="#6D28D9" stroke="#EDE4FF" stroke-width="1"/><circle cx="16" cy="16" r="1.1" fill="#F0ABFC"/>'),
    ethanol: iconWrap('<rect x="5" y="16" width="5" height="8" rx="1" fill="#EDE4FF"/><rect x="10" y="14" width="16" height="12" rx="2" fill="#2C2640" stroke="#EDE4FF" stroke-width="1.3"/><rect x="13" y="17" width="8" height="6" fill="rgba(237,228,255,0.75)"/><rect x="25" y="18" width="9" height="4" rx="1" fill="#C4B5FD"/>'),
    detergent: iconWrap('<rect x="6" y="8" width="18" height="24" rx="6" fill="rgba(109,40,217,0.2)" stroke="#EDE4FF" stroke-dasharray="2 2"/><circle cx="12" cy="16" r="1.7" fill="#EDE4FF"/><circle cx="16" cy="20" r="1.7" fill="#EDE4FF"/><circle cx="13" cy="24" r="1.7" fill="#EDE4FF"/><circle cx="28" cy="14" r="1.5" fill="#F0ABFC"/><circle cx="31" cy="20" r="1.5" fill="#F0ABFC"/><circle cx="29" cy="26" r="1.5" fill="#F0ABFC"/>'),
    microfluidic: iconWrap('<path d="M5 11 H16 L22 20" stroke="#7C3AED" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 29 H16 L22 20" stroke="#7C3AED" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 20 H34" stroke="#EDE4FF" stroke-width="3" fill="none" stroke-linecap="round"/>'),
    extrusion: iconWrap('<rect x="3" y="14" width="12" height="14" rx="2" fill="rgba(109,40,217,0.25)" stroke="#C4B5FD" stroke-width="1.3"/><rect x="17" y="9" width="5" height="24" rx="1" fill="#C4B5FD"/><circle cx="19.5" cy="15" r="1.1" fill="#171320"/><circle cx="19.5" cy="21" r="1.1" fill="#171320"/><circle cx="19.5" cy="27" r="1.1" fill="#171320"/><rect x="24" y="14" width="13" height="14" rx="2" fill="rgba(109,40,217,0.25)" stroke="#C4B5FD" stroke-width="1.3"/>'),
  };

  const figures = { thinfilm, reverse, ethanol, detergent, microfluidic: micro, extrusion };
  const labels = {
    thinfilm: 'Thin film hydration: a dry lipid film, then hydration into multilamellar vesicles',
    reverse: 'Reverse phase evaporation: water droplets in organic solvent become drug-filled vesicles',
    ethanol: 'Ethanol injection: lipids in ethanol enter aqueous buffer and assemble into vesicles',
    detergent: 'Detergent removal: mixed micelles in a dialysis bag become closed vesicles',
    microfluidic: 'Microfluidic focusing: aqueous streams focus a lipid-ethanol stream into uniform vesicles',
    extrusion: 'Membrane extrusion: large vesicles are forced through pores and become smaller and more uniform',
  };

  window.LipoverseLabArt = {
    figure(id) {
      const svg = figures[id];
      if (!svg) return '';
      return svg.replace('<svg ', '<svg role="img" aria-label="' + labels[id] + '" ');
    },
    icon(id) { return icons[id] || ''; },
    caption(id) { return captions[id] || ''; },
  };
})();
