# LIPOVERSE — Explore the Science of Liposomes

An interactive 3D learning platform about **liposomes** and liposomal drug delivery,
built for pharmacy students. *Beyond the Cell. Beyond the Science.*

## Features

- **Home & Learning Dashboard** — module map with progress tracking (saved locally)
- **Introduction** — definition, history timeline, and liposomes vs conventional delivery
- **3D Liposome Explorer** — a real-time Three.js model: rotate, zoom (wheel or buttons), click each part
  (phospholipid bilayer, hydrophilic head, hydrophobic tail, aqueous core, cholesterol),
  cutaway view, drug-location overlay (hydrophilic → core / lipophilic → bilayer), and layer toggles
- **Types of Liposomes** — SUV, LUV, GUV, MLV, MVV with visual diagrams and comparison table
- **Virtual Preparation Lab** — 5 methods (thin film hydration, reverse phase evaporation,
  ethanol injection, detergent removal, microfluidics) with an animated scene per method, steps, pros and cons
- **Drug Loading Simulator** — animated view of hydrophilic vs lipophilic loading,
  passive vs active loading, and an encapsulation-efficiency calculator
- **Drug Delivery Simulation** — animated 5-stage journey through the body
- **Applications** — Doxil®, AmBisome®, Onivyde®, Exparel®
- **Build Your Own Liposome** — choose type, bilayers, cholesterol, drug (hydrophilic/lipophilic) and PEG coating; see the cross-section and predicted properties update
- **Quiz Center** — 12 explained questions (MCQ + True/False) with score and review
- **References** — key primary and review sources at the end of each module
- **Flashcards & Glossary** — flip cards and a searchable glossary with Arabic explanations

## Tech

Static site — no build step. HTML, CSS, vanilla JavaScript, and Three.js (CDN) for the 3D explorer.
Deploy anywhere static is served (e.g. Vercel, Netlify, GitHub Pages).

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```
