# FBI project page

This static page presents [Train for Many, Update with One](https://arxiv.org/abs/2610.17735), using the published v1 figures and results.
The GAE project stylesheet supplies the shared visual design, and the portfolio theme and reveal scripts are reused.

## Figures

| Local asset | Source in [arXiv v1](https://arxiv.org/src/2610.17735v1) | Paper figure |
| --- | --- | --- |
| `../../img/publications/fbi-overview.png` | Existing original overview image | Figure 1 |
| `img/maze-hard-coverage.svg` | `figures/maze_hard_pass_at_k.pdf` | Figure 2(a) |
| `img/math-coverage.svg` | `figures/qwen3_4b_pass_at_k.pdf` | Figure 2(b) |

The two coverage PDFs were rendered to SVG with PyMuPDF's `page.get_svg_image(text_as_path=True)` so the original plot geometry and lettering remain intact.
The figures are neither redrawn nor recolored, and white backgrounds preserve their original contrast in both themes.
Figures and results are attributed to Lim et al. (2026), whose arXiv v1 is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Results

The recursive reasoning table reproduces selected coverage columns from Table 1 for methods with reported values in those columns, with other unreported entries shown as dashes.
The mathematical reasoning table reproduces Table 2, and the training resource table reproduces Table 9.
The page distinguishes candidate coverage from selected accuracy, and evaluation K from the training target.
Resource measurements are per update in the matched one-GPU Maze-Hard benchmark; repeated-run endpoint coverage is measured separately.
The resource comparison is rendered in HTML/CSS, with JavaScript deriving absolute labels and relative bar lengths directly from Table 9's HTML values.
The reported mean Pass@10 values, 91.3% for FBI and 91.0% for Direct-10, come from Figure 4(c) and are displayed separately from resource usage.
Method equations are written in LaTeX and rendered by the locally hosted KaTeX 0.19.0 distribution and its bundled fonts in `../../lib/katex/`.
The renderer emits visual HTML and accessible MathML, so the visible equations do not depend on native browser MathML layout or an external math CDN.
The Fenchel identity and implementation details are available in an expandable section.

Run the browser checks from the repository root using the instructions in `tests/README.md`.
