# LIPOVERSE — Explore the Science of Liposomes

An interactive pharmacy learning site about liposomes and liposomal drug delivery.
English and Arabic, with right-to-left layout. *Beyond the Cell. Beyond the Science.*

## What you can do

- **Learning dashboard** — module progress and best quiz score, saved in this browser
- **Introduction** — definition, history timeline, and liposomes versus conventional delivery
- **3D Liposome Explorer** — local Three.js model: drag, zoom, click each part, cutaway, drug-location overlay, and layer toggles. An SVG model stays available if WebGL is unavailable
- **Types** — SUV, LUV, GUV, MLV and MVV, with diagrams and a comparison table
- **Virtual Preparation Lab** — five methods (thin-film hydration, ethanol injection, microfluidics, reverse-phase evaporation, detergent removal) with steps, advantages and limits. Conceptual only — not a bench protocol
- **Drug Loading Simulator** — hydrophilic versus lipophilic cargo, passive versus remote loading, and an encapsulation-efficiency calculator
- **Delivery simulation** — a five-stage animated journey
- **Applications** — Doxil, AmBisome, Onivyde and Exparel, for learning only
- **Quiz** — 12 explained questions, score, and a full review
- **Flashcards and glossary** — shuffleable cards and a searchable bilingual glossary

## Tech

Static site. No build step and no external network requests at runtime.
Three.js is bundled in `vendor/` (MIT; see `vendor/THREE-LICENSE.txt`).

## Run locally

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open the site root. Educational simulation — not medical advice. Diagrams are not to scale; check current official labels before any clinical use.
