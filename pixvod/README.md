# PixVOD — project page

Static site for the PixVOD project. Plain HTML/CSS with two CDN deps
(Google Sans / Noto Sans fonts and KaTeX) — no build step.

## Local preview

```bash
# from repo root
python -m http.server -d website 8766
# open http://localhost:8766
```

## Drop-in assets

- `static/images/teaser.jpg` — Open Graph image and (optional) hero
- `static/videos/teaser.mp4` — looping teaser of the PPA / GBP pipeline
  (replace the teaser `placeholder` with `<video src="..." autoplay muted loop playsinline>`)
- `static/images/factor_graph.svg` — schematic of per-pixel variable + four factor types
- `static/images/pose_trajectory.png`, `depth_map.png` — visualization gallery tiles
- `static/videos/gbp_convergence.mp4` — depth/pose evolution over GBP iterations

## Math

KaTeX auto-render is enabled. Use `$…$` for inline and `$$…$$` for display.
Remember to HTML-escape `<` as `&lt;` inside formulas — the parser treats `<i`
as a tag opener and silently breaks the math block.
