# MLP Splatting — project page

Static site for the MLP Splatting project. The page is plain HTML/CSS with two CDN
dependencies (Inter / Source Serif fonts and KaTeX) — no build step.

## Local preview

```bash
# from repo root
python -m http.server -d website 8000
# open http://localhost:8000
```

## Drop-in assets

- `static/images/teaser.jpg` — Open Graph + (optional) hero image
- `static/videos/teaser.mp4` — looping teaser (replace the `<div class="placeholder">` in
  `index.html` with `<video src="./static/videos/teaser.mp4" autoplay muted loop playsinline></video>`)
- `static/images/decomp_*.{jpg,png}`, etc. — visualization gallery tiles

## Math

KaTeX auto-render is enabled. Use `$…$` for inline and `$$…$$` for display.

## Deploy

See [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) — pushes to `main`
publish the contents of `website/` to GitHub Pages.
