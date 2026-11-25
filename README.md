# LIPOVERSE — Explore the Science of Liposomes

The original learning platform in deep emerald and champagne, with glass cards and a real phospholipid vesicle you can rotate.

*Beyond the Cell. Beyond the Science.*

## What you can do

- Learning dashboard with saved progress
- Introduction, history, and liposomes versus conventional delivery
- 3D explorer: drag, zoom, click each part, cutaway, drug locations, and layer toggles
- Types: SUV, LUV, GUV, MLV, and MVV
- Preparation lab, drug-loading simulator, and delivery journey
- Clinic examples, quiz, flashcards, and glossary
- Added without replacing the above: 12-model 3D gallery, membrane extrusion and lab checks, encapsulation versus loading capacity, search, bookmarks, light mode, downloadable notes, research links, and matching / ordering / labeling practice

## Tech

Static site. No build step. Three.js r180 and its examples are stored in `vendor/` (MIT; see `vendor/THREE-LICENSE.txt`). Display fonts load from Google Fonts, as in the original design.

## Run locally

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open the site root. Educational simulation — not medical advice.
