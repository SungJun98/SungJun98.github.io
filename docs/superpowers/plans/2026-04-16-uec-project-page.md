# UEC Project Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a standalone project page for the "Uncertainty-driven Embedding Convolution" (ICLR 2026) paper and link to it from the main portfolio site.

**Architecture:** Vanilla HTML/CSS page at `projects/uncertainty-driven-embedding-convolution/index.html` with its own `style.css`. Reuses the main site's `js/theme.js` (dark mode) and `js/reveal.js` (scroll animations) via relative paths. No Bootstrap, no jQuery.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, flexbox), vanilla JavaScript

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `projects/uncertainty-driven-embedding-convolution/index.html` | Page markup — all 8 sections |
| Create | `projects/uncertainty-driven-embedding-convolution/style.css` | CSS variables (light + dark), layout, responsive, component styles |
| Create | `projects/uncertainty-driven-embedding-convolution/img/` | Directory for user-supplied images (figure2, miracl, mmteb, ablation, robustness) |
| Create | `projects/uncertainty-driven-embedding-convolution/video/` | Directory for user-supplied presentation.mp4 |
| Modify | `index.html:491` | Add globe icon link to project page in Publications entry |

---

### Task 1: Create directory structure and style.css

**Files:**
- Create: `projects/uncertainty-driven-embedding-convolution/style.css`
- Create: `projects/uncertainty-driven-embedding-convolution/img/` (empty dir)
- Create: `projects/uncertainty-driven-embedding-convolution/video/` (empty dir)

- [ ] **Step 1: Create directories**

```bash
mkdir -p projects/uncertainty-driven-embedding-convolution/img
mkdir -p projects/uncertainty-driven-embedding-convolution/video
```

- [ ] **Step 2: Write style.css with CSS variables, layout, and component styles**

Write to `projects/uncertainty-driven-embedding-convolution/style.css`:

```css
/* UEC Project Page Styles */

/* ======================================
   CSS VARIABLES (copied from main site)
   ====================================== */

:root {
  --blue-deep: #003876;
  --blue-mid: #2D6A9F;
  --navy-dark: #0A1628;
  --teal: #1a5276;
  --gold: #C4A661;
  --gold-light: #E8DCC8;
  --bg-primary: #f8f9fa;
  --bg-warm: #faf8f5;
  --bg-white: #ffffff;
  --text-primary: #1a1a2e;
  --text-body: #3d3d4e;
  --text-muted: #6c757d;
  --border-light: rgba(0, 56, 118, 0.08);
  --shadow-sm: 0 2px 12px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 24px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.1);
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --font-display: 'DM Serif Display', Georgia, serif;
  --font-body: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --transition: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

html[data-theme="dark"] {
  --bg-primary:   #0f1b2e;
  --bg-warm:      #0a1628;
  --bg-white:     #142847;
  --text-primary: #e8eaed;
  --text-body:    #c4cbd4;
  --text-muted:   #8b94a3;
  --blue-deep:    #5a9fdb;
  --blue-mid:     #4a7fb8;
  --teal:         #5fae9e;
  --gold:         #d4b97a;
  --gold-light:   #2a2417;
  --navy-dark:    #050d1a;
  --border-light: rgba(196, 166, 97, 0.12);
  --shadow-sm: 0 2px 12px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 24px rgba(0, 0, 0, 0.45);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.55);
}

/* ======================================
   GLOBAL
   ====================================== */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: var(--bg-warm);
  color: var(--text-body);
  font-family: var(--font-body);
  font-size: 1.05rem;
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}

img { max-width: 100%; height: auto; display: block; }

a { color: var(--blue-deep); text-decoration: none; transition: color var(--transition); }
a:hover { color: var(--gold); }

/* ======================================
   CONTAINER
   ====================================== */

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ======================================
   SCROLL REVEAL (matches main site)
   ====================================== */

.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  transition-delay: calc(var(--i, 0) * 0.08s);
  will-change: opacity, transform;
}

.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}

/* ======================================
   HEADER
   ====================================== */

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  max-width: 900px;
  margin: 0 auto;
}

.back-link {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
}

.back-link:hover { color: var(--blue-deep); }

.theme-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 6px;
  display: flex;
  align-items: center;
  transition: color var(--transition);
}

.theme-toggle:hover { color: var(--gold); }

.theme-toggle .theme-icon { width: 20px; height: 20px; }

html[data-theme="light"] .theme-icon-light { display: inline-block; }
html[data-theme="light"] .theme-icon-dark  { display: none; }
html[data-theme="dark"]  .theme-icon-light { display: none; }
html[data-theme="dark"]  .theme-icon-dark  { display: inline-block; }

/* ======================================
   HERO
   ====================================== */

.hero {
  background: linear-gradient(135deg, var(--blue-deep), var(--teal));
  color: #fff;
  text-align: center;
  padding: 64px 24px 56px;
  border-radius: var(--radius-lg);
  margin: 0 24px 48px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 948px) {
  .hero { margin-left: auto; margin-right: auto; }
}

.venue-badge {
  display: inline-block;
  background: var(--gold);
  color: var(--navy-dark);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 16px;
  border-radius: 20px;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
}

.hero h1 {
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 400;
  line-height: 1.25;
  margin-bottom: 20px;
}

.authors {
  font-size: 1.05rem;
  margin-bottom: 6px;
  opacity: 0.95;
}

.affiliation {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 28px;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  transition: background var(--transition), transform var(--transition);
  text-decoration: none;
}

.hero-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  transform: translateY(-1px);
}

.hero-btn svg { width: 16px; height: 16px; }

/* ======================================
   SECTIONS
   ====================================== */

.page-section {
  margin-bottom: 56px;
}

.page-section h2 {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--text-primary);
  margin-bottom: 24px;
}

/* ======================================
   ABSTRACT
   ====================================== */

.abstract-text {
  border-left: 3px solid var(--gold);
  padding-left: 24px;
  font-size: 1rem;
  line-height: 1.85;
  color: var(--text-body);
}

/* ======================================
   VIDEO
   ====================================== */

.video-container {
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #000;
  box-shadow: var(--shadow-md);
}

.video-container video,
.video-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* ======================================
   METHOD FIGURE
   ====================================== */

.method-figure {
  text-align: center;
}

.method-figure img {
  margin: 0 auto;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  background: var(--bg-white);
  padding: 16px;
}

.method-figure figcaption {
  margin-top: 16px;
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 780px;
  margin-left: auto;
  margin-right: auto;
}

/* ======================================
   KEY RESULTS
   ====================================== */

.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.result-card {
  background: var(--bg-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  border: 1px solid var(--border-light);
  transition: box-shadow var(--transition), transform var(--transition);
}

.result-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.result-card img { width: 100%; }

.result-card figcaption {
  padding: 14px 16px;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.result-card figcaption strong {
  display: block;
  color: var(--text-primary);
  font-size: 0.95rem;
  margin-bottom: 4px;
}

/* ======================================
   BIBTEX
   ====================================== */

.bibtex-wrapper {
  position: relative;
  background: var(--bg-white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.bibtex-wrapper pre {
  margin: 0;
  padding: 24px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--text-body);
}

.copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--gold);
  color: var(--navy-dark);
  border: none;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition);
}

.copy-btn:hover { opacity: 0.85; }

/* ======================================
   FOOTER
   ====================================== */

.site-footer {
  background: var(--navy-dark);
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 32px 24px;
  font-size: 0.85rem;
  margin-top: 64px;
}

.site-footer a {
  color: var(--gold);
}

.site-footer a:hover {
  color: #fff;
}

/* ======================================
   RESPONSIVE
   ====================================== */

@media (max-width: 768px) {
  .hero { padding: 48px 20px 40px; margin: 0 16px 36px; }
  .hero h1 { font-size: 1.7rem; }
  .hero-buttons { flex-direction: column; align-items: center; }
  .results-grid { grid-template-columns: 1fr; }
  .container { padding: 0 16px; }
}
```

- [ ] **Step 3: Commit**

```bash
git add projects/uncertainty-driven-embedding-convolution/style.css
git commit -m "Add UEC project page CSS with variables, layout, and responsive styles"
```

---

### Task 2: Create index.html with all 8 sections

**Files:**
- Create: `projects/uncertainty-driven-embedding-convolution/index.html`

- [ ] **Step 1: Write the full page HTML**

Write to `projects/uncertainty-driven-embedding-convolution/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>UEC — Uncertainty-driven Embedding Convolution</title>
  <script>
    (function () {
      var stored = null;
      try { stored = localStorage.getItem('theme'); } catch (e) {}
      var prefersDark = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute(
        'data-theme',
        stored || (prefersDark ? 'dark' : 'light')
      );
    })();
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Uncertainty-driven Embedding Convolution (UEC) — ICLR 2026. A principled framework for combining multiple embedding models by modeling predictive uncertainty.">

  <link rel="icon" type="image/svg+xml" href="../../img/favicon.svg">
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link href="style.css" rel="stylesheet">
</head>
<body>

  <!-- Header -->
  <header class="site-header">
    <a href="../../index.html" class="back-link">← Back to Portfolio</a>
    <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle theme" aria-pressed="false">
      <svg class="theme-icon theme-icon-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2.5" x2="12" y2="5"/>
        <line x1="12" y1="19" x2="12" y2="21.5"/>
        <line x1="2.5" y1="12" x2="5" y2="12"/>
        <line x1="19" y1="12" x2="21.5" y2="12"/>
        <line x1="5" y1="5" x2="6.8" y2="6.8"/>
        <line x1="17.2" y1="17.2" x2="19" y2="19"/>
        <line x1="5" y1="19" x2="6.8" y2="17.2"/>
        <line x1="17.2" y1="6.8" x2="19" y2="5"/>
      </svg>
      <svg class="theme-icon theme-icon-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
      </svg>
    </button>
  </header>

  <main>
    <!-- Hero -->
    <section class="hero reveal">
      <span class="venue-badge">ICLR 2026</span>
      <h1>Uncertainty-driven Embedding Convolution</h1>
      <p class="authors">
        <strong>Sungjun Lim</strong>, Kangjun Noh, Youngjun Choi, Heeyoung Lee, Kyungwoo Song
      </p>
      <p class="affiliation">Yonsei University</p>
      <div class="hero-buttons">
        <a href="https://arxiv.org/abs/2507.20718" class="hero-btn" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          arXiv
        </a>
        <a href="https://github.com/MLAI-Yonsei/UEC" class="hero-btn" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          Code
        </a>
        <a href="https://twitter.com/intent/tweet?text=Uncertainty-driven%20Embedding%20Convolution%20(ICLR%202026)&url=https://arxiv.org/abs/2507.20718" class="hero-btn" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          X
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://arxiv.org/abs/2507.20718" class="hero-btn" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          LinkedIn
        </a>
      </div>
    </section>

    <!-- Abstract -->
    <section class="page-section reveal">
      <div class="container">
        <h2>Abstract</h2>
        <p class="abstract-text">
          Text embeddings are essential components in modern NLP pipelines. Although numerous embedding models have been proposed, no single model consistently dominates across domains and tasks. This variability motivates the use of ensemble techniques to combine complementary strengths. However, most existing ensemble methods operate on deterministic embeddings and fail to account for model-specific uncertainty, limiting their robustness and reliability in downstream applications. To address these limitations, we propose <strong>Uncertainty-driven Embedding Convolution (UEC)</strong>. UEC first transforms deterministic embeddings into <strong>probabilistic</strong> ones in a post-hoc manner. It then computes <strong>adaptive ensemble coefficients</strong> based on embedding uncertainty, derived from a principled surrogate-loss formulation. Additionally, UEC employs an <strong>uncertainty-aware similarity</strong> function that directly incorporates uncertainty into the similarity scoring, providing a theoretically grounded and efficient surrogate to distributional distances. Extensive experiments on diverse benchmarks demonstrate that UEC consistently improves both performance and robustness by leveraging principled uncertainty modeling.
        </p>
      </div>
    </section>

    <!-- Video -->
    <section class="page-section reveal">
      <div class="container">
        <h2>Presentation</h2>
        <div class="video-container">
          <!-- Option A: Local mp4 (default) -->
          <video controls preload="metadata">
            <source src="video/presentation.mp4" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          <!-- Option B: YouTube embed (uncomment and replace VIDEO_ID)
          <iframe src="https://www.youtube.com/embed/VIDEO_ID" title="UEC Presentation" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          -->
        </div>
      </div>
    </section>

    <!-- Method -->
    <section class="page-section reveal">
      <div class="container">
        <h2>Method</h2>
        <figure class="method-figure">
          <img src="img/figure2.png" alt="Overview of the UEC framework showing three steps: probabilistic embedding generation via Laplace approximation, uncertainty-driven ensemble coefficient computation, and uncertainty-aware similarity measurement.">
          <figcaption>
            Overview of the UEC framework: UEC first transforms deterministic embeddings from multiple encoder models into probabilistic representations using Laplace approximation. These probabilistic embeddings are then adaptively combined by computing uncertainty-driven ensemble coefficients based on per-dimension variances. Finally, similarity is measured using an uncertainty-aware metric that accounts for both the mean and uncertainty of the ensembled embedding.
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Key Results -->
    <section class="page-section reveal">
      <div class="container">
        <h2>Experimental Results</h2>
        <div class="results-grid">
          <figure class="result-card">
            <img src="img/miracl.png" alt="MIRACL retrieval benchmark results showing UEC performance compared to baselines.">
            <figcaption>
              <strong>MIRACL (Retrieval)</strong>
              UEC achieves performance comparable to the oracle and even surpasses in some cases, with particularly strong gains in AUC@10.
            </figcaption>
          </figure>
          <figure class="result-card">
            <img src="img/mmteb.png" alt="MMTEB benchmark results across retrieval, classification, and uncertainty metrics.">
            <figcaption>
              <strong>MMTEB Benchmark</strong>
              UEC achieves the highest average performance across all retrieval, classification, and uncertainty metrics.
            </figcaption>
          </figure>
          <figure class="result-card">
            <img src="img/ablation.png" alt="Ablation study results showing contribution of each UEC component.">
            <figcaption>
              <strong>Ablation Study</strong>
              Both uncertainty convolution and uncertainty-aware similarity are essential components of the framework.
            </figcaption>
          </figure>
          <figure class="result-card">
            <img src="img/robustness.png" alt="Robustness analysis showing UEC correcting individual model failures.">
            <figcaption>
              <strong>Robustness</strong>
              UEC corrects individual model failures by leveraging cross-model uncertainty.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- BibTeX -->
    <section class="page-section reveal">
      <div class="container">
        <h2>Citation</h2>
        <div class="bibtex-wrapper">
          <button class="copy-btn" onclick="copyBibtex()">Copy</button>
          <pre><code id="bibtex">@inproceedings{lim2026uncertainty,
  title={Uncertainty-driven Embedding Convolution},
  author={Lim, Sungjun and Noh, Kangjun and Choi, Youngjun and Lee, Heeyoung and Song, Kyungwoo},
  booktitle={International Conference on Learning Representations},
  year={2026},
  url={https://arxiv.org/abs/2507.20718}
}</code></pre>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <p>© 2026 Sungjun Lim · Yonsei University</p>
    <p><a href="../../index.html">← Back to Portfolio</a></p>
  </footer>

  <script src="../../js/theme.js"></script>
  <script src="../../js/reveal.js"></script>
  <script>
    function copyBibtex() {
      var text = document.getElementById('bibtex').textContent;
      navigator.clipboard.writeText(text).then(function () {
        var btn = document.querySelector('.copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
      });
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify page loads in browser**

```bash
# Open in browser or use a local server
cd projects/uncertainty-driven-embedding-convolution
python3 -m http.server 8080
# Visit http://localhost:8080 — verify:
# - Header shows with back link and theme toggle
# - Hero gradient renders with title, authors, badge, buttons
# - Dark mode toggle works (click toggle, verify colors switch)
# - All sections visible (images will be broken — that's expected)
# - Scroll reveal animations trigger on scroll
# - BibTeX copy button works
# - Responsive: resize to mobile width, verify 1-column layout
```

- [ ] **Step 3: Commit**

```bash
git add projects/uncertainty-driven-embedding-convolution/index.html
git commit -m "Add UEC project page HTML with all 8 sections"
```

---

### Task 3: Link from Publications entry in index.html

**Files:**
- Modify: `index.html:491`

- [ ] **Step 1: Add globe icon link to the Publications entry**

In `index.html`, find this block (~line 490-493):

```html
                  <strong>Uncertainty-driven Embedding Convolution</strong>
                  <a href="https://arxiv.org/abs/2507.20718" class="pub-link-icon" target="_blank" title="View paper (link to be added)">
                    <i class="fa fa-file-pdf-o"></i>
                  </a>
```

Replace with:

```html
                  <strong>Uncertainty-driven Embedding Convolution</strong>
                  <a href="https://arxiv.org/abs/2507.20718" class="pub-link-icon" target="_blank" title="View paper on arXiv">
                    <i class="fa fa-file-pdf-o"></i>
                  </a>
                  <a href="projects/uncertainty-driven-embedding-convolution/" class="pub-link-icon" title="Project page">
                    <i class="fa fa-globe"></i>
                  </a>
```

- [ ] **Step 2: Verify the link works**

Open `index.html` in browser, scroll to Publications, verify:
- Globe icon appears next to the PDF icon
- Clicking globe icon navigates to the project page
- "Back to Portfolio" link on project page returns to index.html

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add project page link to UEC Publications entry"
```

---

### Task 4: Final review and cleanup

**Files:**
- Review: `projects/uncertainty-driven-embedding-convolution/index.html`
- Review: `projects/uncertainty-driven-embedding-convolution/style.css`
- Review: `index.html`

- [ ] **Step 1: Cross-browser and dark mode verification**

Open the project page and verify in browser:
1. Light mode: cream background, navy hero gradient, gold accents
2. Dark mode: dark navy background, adjusted hero gradient, gold accents
3. Toggle between modes — all sections transition smoothly
4. Responsive: test at 1024px, 768px, and 375px widths
5. Video section: verify `<video>` element is present (no content expected yet)
6. BibTeX: click copy, paste somewhere to verify content

- [ ] **Step 2: Accessibility check**

Verify:
1. Tab through page — all interactive elements (links, buttons, video controls) are focusable
2. Theme toggle has `aria-label`
3. All images have `alt` text
4. Semantic structure: `<header>`, `<main>`, `<section>`, `<figure>`, `<footer>`

- [ ] **Step 3: Commit all remaining changes (if any fixes needed)**

```bash
git add -A projects/uncertainty-driven-embedding-convolution/
git commit -m "Polish UEC project page — fixes from review"
```

- [ ] **Step 4: Remind user to supply assets**

The following files need to be provided by the user:
- `projects/uncertainty-driven-embedding-convolution/img/figure2.png` — export from paper PDF Figure 2
- `projects/uncertainty-driven-embedding-convolution/img/miracl.png` — export from poster
- `projects/uncertainty-driven-embedding-convolution/img/mmteb.png` — export from poster
- `projects/uncertainty-driven-embedding-convolution/img/ablation.png` — export from poster
- `projects/uncertainty-driven-embedding-convolution/img/robustness.png` — export from poster
- `projects/uncertainty-driven-embedding-convolution/video/presentation.mp4` — record via Zoom
