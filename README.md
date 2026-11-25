# LIPOVERSE — Explore the Science of Liposomes

The original dark scientific learning platform: navy and teal, glass cards, and a real phospholipid vesicle you can rotate.

*Beyond the Cell. Beyond the Science.*

## What you can do

- Learning dashboard with saved progress
- Introduction, history, and liposomes versus conventional delivery
- 3D explorer: drag, zoom, click each part, cutaway, drug locations, and layer toggles
- Types: SUV, LUV, GUV, MLV, and MVV
- Preparation lab, drug-loading simulator, and delivery journey
- Clinic examples, quiz, flashcards, and glossary

## Tech

Static site. No build step. Three.js r180 and its examples are stored in `vendor/` (MIT; see `vendor/THREE-LICENSE.txt`). Display fonts load from Google Fonts, as in the original design.

## Run locally

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open the site root. Educational simulation — not medical advice.
