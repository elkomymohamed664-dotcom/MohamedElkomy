# LIPOVERSE — Explore the Science of Liposomes

The pharmacy learning site: bilingual English and Arabic, a scrolling lab layout, and a detailed phospholipid vesicle in the explorer.

*Tiny vesicles. Big possibilities.*

## What you can do

- Switch between English and Arabic
- Follow the introduction, history, and liposomes versus conventional delivery
- Rotate the detailed 3D vesicle, open a cutaway, and show or hide each layer
- Compare SUV, LUV, GUV, MLV and MVV
- Walk through five preparation methods, drug loading, and the delivery journey
- Review clinic examples, a 12-question quiz, flashcards, and a glossary

## Tech

Static site. No build step. Three.js r180 is stored in `vendor/` (MIT; see `vendor/THREE-LICENSE.txt`). If WebGL is unavailable, the explorer keeps the schematic drawing.

## Run locally

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open the site root. Educational simulation — not medical advice.
