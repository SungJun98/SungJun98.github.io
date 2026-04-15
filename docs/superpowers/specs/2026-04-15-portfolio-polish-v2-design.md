# Portfolio Polish v2 — Design Spec

**Date:** 2026-04-15
**Owner:** Sungjun Lim
**Scope:** Items 1–4 of the portfolio refresh. Item 5 (standalone project page for *Uncertainty-driven Embedding Convolution*) is deferred to a follow-up spec.

## 1. Goals

1. Replace generic Ionicons pictograms in the **MLAI Projects** section with a bespoke, on-brand icon set inspired by the existing `favicon.svg`.
2. Add tasteful scroll-triggered animations across Career, Publications, and MLAI Projects.
3. Introduce a site-wide dark mode with a navbar toggle, respecting the user's system preference on first visit.
4. Unify the color language of the **Publications** section so that each subsection's toggle button and card header share a cohesive accent.

Non-goals:
- Migrating off jQuery / Bootstrap 4 (tracked separately).
- Building the standalone paper project page (item 5, follow-up spec).

## 2. Architecture

**Hybrid approach.** Existing jQuery/Bootstrap 4 code is kept untouched. All new code is vanilla JS + CSS Custom Properties so the site can evolve off the legacy stack incrementally in a later effort.

**Theme tokenization.** Today's `css/style.css` hardcodes hex values (`#003876`, `#C4A661`, `#ffffff`, etc.) in many places. These are abstracted into a CSS variable layer so that dark mode, publication accents, and future palette tweaks all happen in one place.

Variable naming (role-based, not color-based):

```css
:root {
  --color-bg:           #ffffff;
  --color-surface:      #f8f9fa;
  --color-text:         #1a1a1a;
  --color-text-muted:   #555e68;
  --color-heading:      #003876;
  --color-accent:       #003876;   /* navy */
  --color-accent-gold:  #C4A661;   /* gold */
  --color-accent-teal:  #2d6a5f;
  --color-border:       #e0e0e0;
  --color-overlay:      rgba(0, 0, 0, 0.45);
}

html[data-theme="dark"] {
  --color-bg:           #0a1628;
  --color-surface:      #142847;
  --color-text:         #e8eaed;
  --color-text-muted:   #a8b0ba;
  --color-heading:      #C4A661;
  --color-accent:       #d4b97a;
  --color-accent-gold:  #d4b97a;
  --color-accent-teal:  #5fae9e;
  --color-border:       #2a3f5f;
  --color-overlay:      rgba(0, 0, 0, 0.65);
}
```

## 3. Components

### 3.1 MLAI Pictograms (Item 1)

Six hand-authored SVG icons are added under `img/icons/`. All are single-color line art, 64×64 viewBox, `stroke="currentColor"`, `stroke-width="1.5"`, `fill="none"`, with rounded joins/caps. This means icon color follows the surrounding CSS color — no change needed for dark mode.

| File | Motif | Project |
|---|---|---|
| `bp-xai.svg` | Heartbeat pulse + translucent probability band | Explainable AI for Blood Pressure Estimation |
| `covid-causal.svg` | Three nodes joined by directional arrows | Causality Covid-19 |
| `gnn.svg` | Directed graph (≥4 nodes, arrowed edges) | Directional GNN |
| `gaussian-process.svg` | Thin center line flanked by a confidence band | Gaussian Process |
| `edu-rag.svg` | Document/book with retrieval link lines | Educational Content Relationship Analysis |
| `signal-processing.svg` | Waveform with discrete sampling markers | Signal Processing |

HTML change: each `<span class="ico-circle"><i class="ion-..."></i></span>` is replaced by the icon SVG **inlined** directly inside `.ico-circle`, with `class="service-ico-svg"` on the `<svg>` root. Inlining (rather than `<img src>`) is required so `stroke="currentColor"` inherits from CSS and follows theme changes. The existing gold-bordered `ico-circle` container is preserved — it becomes the outer ring, and its CSS sets `color: var(--color-accent-gold)` so the inner SVG draws in gold.

Source-of-truth SVGs still live at `img/icons/*.svg` as standalone files (useful for reuse and documentation); `index.html` contains an inlined copy of each.

### 3.2 Scroll-Triggered Animations (Item 2)

New file: `js/reveal.js` (vanilla, no jQuery).

Behavior:
- On DOMContentLoaded, walk all `.reveal` elements. If a parent contains multiple `.reveal` siblings, assign each an ordinal `--i` (0, 1, 2, …) used for stagger delay.
- An `IntersectionObserver` (threshold 0.15, rootMargin `0px 0px -80px 0px`) adds `.is-visible` when an element scrolls into view. Observer is disconnected per element after its first reveal (one-shot).
- If `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, skip the observer entirely and add `.is-visible` to every `.reveal` up front.

CSS:

```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  transition-delay: calc(var(--i, 0) * 100ms);
}
.reveal.is-visible {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .reveal { transition: none; transform: none; opacity: 1; }
}
```

Application: existing `.reveal` classes already exist on title boxes, `.career-entry`, `.service-box`. Additionally apply `.reveal` to each `<li>` inside the three Publications cards so publication entries fade in as the user scrolls.

### 3.3 Dark Mode (Item 3)

**Toggle placement.** Inside `<ul class="navbar-nav">`, appended after the last `<li class="nav-item">`, a button:

```html
<li class="nav-item">
  <button id="theme-toggle" class="nav-link theme-toggle" type="button" aria-label="Toggle theme">
    <i class="theme-icon-light">☀</i><i class="theme-icon-dark">☾</i>
  </button>
</li>
```

CSS hides whichever icon doesn't match the current `data-theme`.

**FOUC-free initialization.** An inline script in `<head>` (before any stylesheet that uses the tokens) runs:

```html
<script>
  (function() {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

**Toggle script** (`js/theme.js`, loaded normally): binds click on `#theme-toggle`, flips `data-theme` between `light`/`dark`, persists to `localStorage`.

**Image backgrounds.** `overlay-bg.jpg` and `counters-bg.jpg` use a CSS linear-gradient overlay driven by `--color-overlay`, which darkens further in dark mode.

### 3.4 Publications Accent Unification (Item 4)

Three `btn-pub` modifier classes replace `btn-primary / btn-secondary / btn-info`:

| Subsection | Button | Accent variable |
|---|---|---|
| Peer Reviewed | `.btn-pub.btn-pub--navy` | `--color-accent` |
| Under-Review  | `.btn-pub.btn-pub--gold` | `--color-accent-gold` |
| Workshop      | `.btn-pub.btn-pub--teal` | `--color-accent-teal` |

Buttons: solid background = accent, text = white (light) / dark navy (dark) — chosen for contrast ratio ≥ 4.5:1 in both modes.

Card headers: existing `.card-header` gets a `--navy / --gold / --teal` modifier that adds a 4 px `border-left` in the matching accent color and recolors the `<h4>` text to match. Header background stays neutral (`--color-surface`) to keep the editorial feel.

## 4. Data Flow

```
[ <head> inline script ]
        │  reads localStorage.theme OR prefers-color-scheme
        ▼
html[data-theme="light"|"dark"]   ──►  CSS variables resolve per theme
        │
        ▼
[ navbar toggle click ] ──► js/theme.js
        │  flips data-theme, writes localStorage
        ▼
[ scroll ] ──► js/reveal.js IntersectionObserver
        │  adds .is-visible (once per element)
        ▼
CSS transitions run; icons inherit currentColor automatically.
```

## 5. File Changes

**New files**
- `img/icons/bp-xai.svg`
- `img/icons/covid-causal.svg`
- `img/icons/gnn.svg`
- `img/icons/gaussian-process.svg`
- `img/icons/edu-rag.svg`
- `img/icons/signal-processing.svg`
- `js/reveal.js`
- `js/theme.js`

**Modified**
- `index.html`
  - `<head>`: inline theme-init script before stylesheets.
  - Navbar: add `#theme-toggle` list item.
  - Publications buttons: swap Bootstrap variants for `btn-pub` + modifier.
  - Publications card headers: add `card-header--navy/gold/teal` modifier.
  - Publications `<li>` entries: add `class="reveal"`.
  - MLAI Projects: replace `<i class="ion-...">` with inline `<svg class="service-ico-svg">…</svg>` markup (copied from the source file in `img/icons/`).
  - Bottom of `<body>`: `<script src="js/theme.js"></script>` and `<script src="js/reveal.js"></script>`.
- `css/style.css`
  - Prepend `:root` and `[data-theme="dark"]` variable blocks.
  - Replace hardcoded hex values in rules that should theme (backgrounds, text, borders, accents). Rules that are intentionally fixed (e.g., the Yonsei overlay color on the hero) may stay.
  - Add `.reveal` / `.reveal.is-visible` rules + reduced-motion guard.
  - Add `.btn-pub--*` and `.card-header--*` rules.
  - Add `.theme-toggle` styles (icon swap based on `html[data-theme]`).
  - Add `.service-ico-svg` sizing (e.g. `width: 28px; height: 28px; color: var(--color-accent-gold);`).

**Unchanged**
- `js/main.js`, `contactform/`, `lib/*`.

## 6. Testing / Verification

Manual checklist run against the local preview (`python3 -m http.server` or equivalent):

1. **Theme load, no FOUC**: hard-reload in both system-light and system-dark environments; background never flashes the wrong color.
2. **Toggle**: click toggle → theme flips instantly, persists after reload; toggle again → flips back.
3. **Reveal**: scroll from top; Career entries fade up with 100 ms stagger; Publications `<li>` entries fade up; MLAI cards fade up. Scrolling back up does not reset them (one-shot).
4. **Reduced motion**: enable OS "reduce motion" setting; reload; all `.reveal` elements are instantly visible with no transitions.
5. **Publications accents**: three buttons and three card-header border-left strips match in color, in both themes.
6. **Pictograms**: all six MLAI project icons render as gold line art in light mode; in dark mode they render as the dark-mode gold (brighter) — because they inherit `currentColor` via the parent, verify the parent sets `color: var(--color-accent-gold)`.
7. **Mobile (≤768px)**: theme toggle is visible/operable in the collapsed navbar; animations still fire.
8. **Contrast**: spot-check button and header text contrast against backgrounds at ≥ 4.5:1 using a contrast checker.

## 7. Risks & Open Questions

- **Icon color inheritance.** `<img src>` cannot inherit `currentColor`. Decision (reflected in 3.1 and 5): inline the six SVGs directly in `index.html`. They are small enough to add no meaningful page weight and gain `currentColor` support for free.
- **Hero overlay images** may look muddy in dark mode. Plan: darken the overlay (`--color-overlay`) and accept a slight desaturation rather than swapping images.
- **Bootstrap 4 button classes** still exist elsewhere (e.g. `btn-primary` on the contact form if re-enabled). Leaving those alone is fine — they'll pick up accent color via variable replacement in relevant rules.
