# LIPOVERSE — Explore the Science of Liposomes

The learning platform in deep emerald and champagne, with glass cards and a real phospholipid vesicle you can rotate.

*Beyond the Cell. Beyond the Science.*

## What you can do

- Learning dashboard with saved progress
- Introduction, history, and liposomes versus conventional delivery
- 3D Liposome Explorer: drag, zoom, click each part, cutaway view, drug-location overlay, and layer toggles
- Types: SUV, LUV, GUV, MLV, and MVV with diagrams and a comparison table
- Preparation lab with **animated walkthroughs** for each of the 5 methods (thin film hydration, reverse phase evaporation, ethanol injection, detergent removal, microfluidics), principle, steps, pros and cons
- Drug Loading Simulator as a real-time **3D** model: hydrophilic (gold, aqueous core) vs lipophilic (orange, lipid bilayer), cutaway view, passive vs active (remote) loading, and an encapsulation-efficiency calculator
- **Build Your Own Liposome** — interactive formulation lab: pick SUV/LUV/GUV/MLV/MVV, set the number of bilayers (1–5), cholesterol (0–50 mol%) and a PEG (“stealth”) coating, choose a drug — the 3D model, composition chips and an educational “predicted behavior” profile update live
- Delivery journey simulation (injection → bloodstream → EPR → uptake → release)
- Clinic examples (Doxil®, AmBisome®, Onivyde®, Exparel®)
- Quiz Center — **28 explained questions across 6 categories** (Structure, Preparation, Loading & EE, In Vivo & Stealth, Applications, History) with category filters and shuffled options, plus matching / ordering / labeling practice
- Flashcards, searchable glossary with Arabic explanations, and downloadable study notes
- 3D Molecular Gallery, membrane extrusion method and lab checks, encapsulation vs loading capacity, global search, bookmarks, light mode, research links
- **References** at the end of every module, with notes where claims (e.g. toxicity reduction, EE) are drug- and formulation-specific

## Tech

Static site — no build step. HTML, CSS, vanilla JavaScript. Three.js r180 and its examples are stored in `vendor/` (MIT; see `vendor/THREE-LICENSE.txt`). Display fonts load from Google Fonts, as in the original design.

## Run locally

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open the site root. Educational simulation — not medical advice.
