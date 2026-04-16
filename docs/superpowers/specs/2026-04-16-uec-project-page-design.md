# Design Spec: UEC Project Page

**Date:** 2026-04-16
**Status:** Approved
**Paper:** Uncertainty-driven Embedding Convolution (ICLR 2026)
**Reference design:** https://xzf-thu.github.io/Pask/

## Overview

Standalone project page for the UEC paper, linked from the Publications entry in `index.html`. Vanilla HTML/CSS (no Bootstrap/jQuery), reusing the main site's CSS variable palette, dark mode, and scroll reveal.

## File Structure

```
projects/uncertainty-driven-embedding-convolution/
├── index.html            # Page markup
├── style.css             # Project-page-only CSS (includes CSS variable defs + dark overrides)
├── img/
│   ├── figure2.png       # Paper Figure 2 — UEC 3-step pipeline (user supplies)
│   ├── miracl.png        # MIRACL retrieval results (user supplies from poster)
│   ├── mmteb.png         # MMTEB benchmark results (user supplies from poster)
│   ├── ablation.png      # Ablation study (user supplies from poster)
│   └── robustness.png    # Robustness results (user supplies from poster)
└── video/
    └── presentation.mp4  # 5-min Zoom recording (user supplies)
```

Image and video files are **user-supplied**. The HTML will reference these paths with placeholder alt text. The user will export figures from `references/UEC_paper.pdf` (Figure 2) and `references/ICLR2026_UEC_poster.pptx` (results).

## Page Sections (top → bottom)

### 1. Minimal Header

- Left: "← Back to Portfolio" link → `../../index.html`
- Right: Dark/light mode toggle button
- Sticky or static (non-sticky preferred to maximize content area, matching Pask)

### 2. Hero

- **ICLR 2026** venue badge (gold pill)
- Paper title in `--font-display` (DM Serif Display)
- Author list: **Sungjun Lim**, Kangjun Noh, Youngjun Choi, Heeyoung Lee, Kyungwoo Song — first author bolded
- Affiliation: Yonsei University
- Button row:
  - **arXiv** → https://arxiv.org/abs/2507.20718
  - **Code** → https://github.com/MLAI-Yonsei/UEC
  - **X** → share link (pre-filled tweet about the paper)
  - **LinkedIn** → share link
- Background: gradient using `--blue-deep` → `--teal`, adapts to dark mode via CSS variables

### 3. Abstract

- Paper abstract text (from PDF page 1)
- Key phrases bolded for scannability (e.g., "Uncertainty-driven Embedding Convolution", "probabilistic", "adaptive ensemble coefficients", "uncertainty-aware similarity")
- Left border accent in `--gold`

### 4. Presentation Video

- Primary: `<video>` element with `controls`, `preload="metadata"`, poster frame
- Fallback: if YouTube URL available, switch to responsive `<iframe>` embed
- Implementation: HTML includes both; one is commented out. User uncomments the preferred option or we detect based on a data attribute.
- Responsive: 16:9 aspect ratio container via `aspect-ratio: 16/9` CSS

### 5. Method — UEC Framework

- Section heading: "Method"
- Single centered image: `img/figure2.png`
- `<figure>` + `<figcaption>`: "Overview of the UEC framework: UEC first transforms deterministic embeddings into probabilistic representations using Laplace approximation, then adaptively combines them via uncertainty-driven coefficients, and measures similarity using an uncertainty-aware metric."
- Max-width capped (~900px) for readability

### 6. Key Results

- Section heading: "Experimental Results"
- 2×2 CSS Grid layout (desktop), 1-column on mobile (`< 768px`)
- Each cell: `<figure>` with image + `<figcaption>`
  1. **MIRACL (Retrieval)** — "UEC achieves performance comparable to the oracle, with strong gains in AUC@10."
  2. **MMTEB Benchmark** — "UEC achieves the highest average performance across retrieval, classification, and uncertainty metrics."
  3. **Ablation Study** — "Both uncertainty convolution and uncertainty-aware similarity are essential."
  4. **Robustness** — "UEC corrects individual model failures by leveraging cross-model uncertainty."
- Cards with subtle shadow (`--shadow-sm`), rounded corners (`--radius-md`)

### 7. BibTeX

- Official ICLR 2026 citation in a `<pre><code>` block
- Copy-to-clipboard button (vanilla JS, `navigator.clipboard.writeText`)
- Styled with `--font-mono`, `--bg-white` background, `--border-light` border

```bibtex
@inproceedings{lim2026uncertainty,
  title={Uncertainty-driven Embedding Convolution},
  author={Lim, Sungjun and Noh, Kangjun and Choi, Youngjun and Lee, Heeyoung and Song, Kyungwoo},
  booktitle={International Conference on Learning Representations},
  year={2026},
  url={https://arxiv.org/abs/2507.20718}
}
```

### 8. Footer

- "© 2026 Sungjun Lim · Yonsei University"
- "← Back to Portfolio" link
- Background: `--navy-dark` / dark variant

## Shared Assets Reused

| Asset | How |
|---|---|
| CSS variables (`:root` + dark overrides) | Copied into `style.css` — single source of truth for this page |
| `js/theme.js` | Loaded via `<script src="../../js/theme.js">`. Binds toggle button, persists to localStorage |
| `js/reveal.js` | Loaded via `<script src="../../js/reveal.js">`. `class="reveal"` on each `<section>` |
| `<head>` inline dark-mode script | Copied from `index.html` — sets `data-theme` before paint |
| Google Fonts (DM Serif Display, Outfit, JetBrains Mono) | Loaded via `<link>` in `<head>` |

## Dark / Light Mode

- `<head>` inline script reads `localStorage.getItem('theme')` and sets `html[data-theme]` before CSS loads (FOUC-free)
- All colors reference CSS variables — dark mode switches automatically
- Hero gradient: uses `--blue-deep` and `--teal` which are already redefined in dark mode
- Toggle button in minimal header, bound by `js/theme.js`

## Responsive Breakpoints

- **≥ 1024px**: max-width container (~900px centered), 2×2 results grid
- **768–1023px**: same layout, slightly narrower padding
- **< 768px**: single column, results grid → 1 column, hero buttons stack vertically

## Accessibility

- Semantic HTML: `<header>`, `<main>`, `<section>`, `<figure>`, `<figcaption>`, `<footer>`
- `prefers-reduced-motion`: handled by `js/reveal.js` (disables animations)
- Color contrast ≥ 4.5:1 in both themes (navy/gold palette already meets this)
- All images have descriptive `alt` text
- Video has `controls` attribute for keyboard accessibility

## index.html Modification

Add a project-page link icon next to the existing PDF icon in the Publications entry (~line 491):

```html
<a href="projects/uncertainty-driven-embedding-convolution/" class="pub-link-icon" title="Project page">
  <i class="fa fa-globe"></i>
</a>
```

## Out of Scope

- No build tools, no npm, no bundler
- No jQuery or Bootstrap on the project page
- No additional pages beyond this single project page
- Image/video file creation — user will supply these assets
