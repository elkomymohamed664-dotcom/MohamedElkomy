# LIPOVERSE — Explore the Science of Liposomes

An interactive 3D learning platform about **liposomes** and liposomal drug delivery,
built for pharmacy students. *Beyond the Cell. Beyond the Science.*

## Features

- **Home & Learning Dashboard** — module map with progress tracking (saved locally)
- **Introduction** — definition, history timeline, and liposomes vs conventional delivery
- **3D Liposome Explorer** — a real-time Three.js model: rotate, zoom, click each part
  (phospholipid bilayer, hydrophilic head, hydrophobic tail, aqueous core, cholesterol),
  cutaway view, drug-location overlay, and layer toggles
- **Types of Liposomes** — SUV, LUV, GUV, MLV, MVV with visual diagrams and comparison table
- **Virtual Preparation Lab** — 5 methods (thin film hydration, reverse phase evaporation,
  ethanol injection, detergent removal, microfluidics), each with its own **animated
  walkthrough**, principle, steps, pros and cons
- **Drug Loading Simulator** — real-time **3D** model showing where hydrophilic (aqueous
  core) and lipophilic (bilayer) drugs load, cutaway view, passive vs active loading,
  and an encapsulation-efficiency calculator
- **Build Your Own Liposome** — interactive formulation lab: pick SUV/LUV/GUV/MLV/MVV,
  set the number of bilayers (1–5), cholesterol (0–50 mol%) and PEG (“stealth”) coating,
  choose a drug — and watch the 3D model, composition chips and an educational
  "predicted behavior" profile update live
- **Drug Delivery Simulation** — animated 5-stage journey through the body
- **Applications** — Doxil®, AmBisome®, Onivyde®, Exparel®
- **Quiz Center** — 28 explained questions across 6 categories (Structure, Preparation,
  Loading & EE, In Vivo & Stealth, Applications, History) with shuffled options,
  score tracking and answer review
- **Flashcards & Glossary** — flip cards and a searchable glossary with Arabic explanations
- **References** — curated scientific references at the end of every module, with notes
  where claims (e.g. toxicity reduction, EE) are drug- and formulation-specific

## Tech

Static site — no build step. HTML, CSS, vanilla JavaScript, and Three.js (CDN) for the 3D views
(explorer, drug loading, and the liposome builder).
Deploy anywhere static is served (e.g. Vercel, Netlify, GitHub Pages).

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```
