# LIPOVERSE — Explore the Science of Liposomes

An interactive learning platform about liposomes, in charcoal and violet with glass cards and real phospholipid vesicles you can rotate.

*Beyond the Cell. Beyond the Science.*

## What you can do

- Learning dashboard with saved progress, bookmarks, and a "continue where you left off" strip
- Introduction, history, and liposomes versus conventional delivery
- 3D explorer: drag, zoom, click each part, cutaway, drug locations, and layer toggles
- 3D model gallery — twelve separate orbitable vesicles (SUV, LUV, GUV, MLV, OLV, MVV, PEGylated, cationic, anionic, targeted, pH-sensitive, thermosensitive)
- Types: SUV, LUV, GUV, MLV, and MVV, with a comparison table
- Preparation lab (six methods), drug-loading simulator with encapsulation-efficiency calculator, and the five-stage delivery journey
- Clinical examples, a 20-question quiz with explanations and review, flashcards, and a searchable glossary
- Published research papers, downloadable study notes, and a printable sheet of QR cards
- Global search, light/dark theme, and optional sound effects

## Tech

Static site. No build step. Three.js r180 and its examples are stored in `vendor/` (MIT; see `vendor/THREE-LICENSE.txt`), so the 3D works without a CDN. Display fonts load from Google Fonts.

`api/contact.js` is a Vercel serverless function for the inquiry form. It needs `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` environment variables.

## Run locally

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open the site root. Educational simulation — not medical advice.

## Deploy

Push to `main` and create a Vercel deployment for the `elkomy-liposome` project, or connect the repository and turn on automatic deployments. The project builds nothing — the build command is a placeholder and the output directory is the repository root.
