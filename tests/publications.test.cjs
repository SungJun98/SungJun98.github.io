const assert = require('node:assert/strict');
const { after, afterEach, before, beforeEach, test } = require('node:test');
const { chromium } = require('playwright');

const baseURL = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:8765/';
const sections = ['peerReviewed', 'underReview', 'workshop'];
const axes = ['learning', 'reasoning', 'behavior'];
let browser;
let page;
let runtimeErrors;

before(async () => {
  browser = await chromium.launch({ headless: true });
});

beforeEach(async () => {
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
});

afterEach(async () => {
  await page.close();
  assert.deepEqual(runtimeErrors, [], 'No browser runtime errors');
});

after(async () => {
  await browser.close();
});

function sectionCard(id) {
  return page.locator('#' + id).locator('..');
}

function originalButton(id) {
  return page.locator('#publication-archive > .text-center [data-target="#' + id + '"]');
}

async function assertExpanded(id, expanded) {
  await page.waitForFunction(id => !document.getElementById(id).classList.contains('collapsing'), id);
  assert.equal(await page.locator('#' + id).isVisible(), expanded, id + ' content visibility');
  const states = await page.locator('[data-toggle="collapse"][data-target="#' + id + '"]').evaluateAll(
    controls => controls.map(control => control.getAttribute('aria-expanded'))
  );
  assert.deepEqual(states, [String(expanded), String(expanded)], 'Heading and original button stay synchronized');
}

test('News expands in batches of three and folds back to the latest three', async () => {
  const visibleNews = page.locator('#news .news-item:visible');
  const titles = await page.locator('#news .news-item h5').allTextContents();
  const more = page.getByRole('button', { name: 'Show more', exact: true });
  const less = page.getByRole('button', { name: 'Show less', exact: true });
  assert.deepEqual(await visibleNews.locator('h5').allTextContents(), titles.slice(0, 3));
  assert.equal(await page.locator('#news-count').innerText(), 'Showing 3 of 7');
  assert.equal(await page.locator('.news-year-group[data-year="2025"]').isVisible(), false);
  assert.equal(await page.locator('#news [data-filter-type="year"][data-filter-value="all"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await less.isVisible(), false);

  await more.focus();
  await page.keyboard.press('Enter');
  assert.deepEqual(await visibleNews.locator('h5').allTextContents(), titles.slice(0, 6));
  assert.equal(await page.locator('#news-count').innerText(), 'Showing 6 of 7');
  assert.equal(await page.locator('.news-year-group[data-year="2025"]').isVisible(), true);
  await page.keyboard.press('Space');
  assert.equal(await visibleNews.count(), 7);
  assert.equal(await page.locator('#news-count').innerText(), 'Showing 7 of 7');
  assert.equal(await more.isVisible(), false);
  assert.equal(await less.evaluate(node => node === document.activeElement), true);

  await page.keyboard.press('Enter');
  assert.equal(await visibleNews.count(), 3);
  assert.equal(await less.isVisible(), false);
  assert.equal(await page.locator('#news [data-filter-type="category"][data-filter-value="all"]').evaluate(node => node === document.activeElement), true);
  const heading = await page.locator('#news .title-a').boundingBox();
  assert(heading.y >= 0 && heading.y < 1000, 'Folding returns the visitor to News');
});

test('News filters reset the batch and handle short or empty results on mobile', async () => {
  await page.setViewportSize({ width: 320, height: 900 });
  const filter = (type, value) => page.locator('#news [data-filter-type="' + type + '"][data-filter-value="' + value + '"]');
  const more = page.getByRole('button', { name: 'Show more', exact: true });
  const less = page.getByRole('button', { name: 'Show less', exact: true });
  assert.equal(await page.locator('#news .news-item:visible').count(), 3);
  await more.click();
  await filter('category', 'publications').click();
  assert.equal(await page.locator('#news .news-item:visible').count(), 3);
  assert.equal(await page.locator('#news-count').innerText(), 'Showing 3 of 4');
  assert.equal(await less.isVisible(), false);
  await more.click();
  assert.equal(await page.locator('#news .news-item:visible').count(), 4);
  await filter('year', '2025').click();
  assert.equal(await page.locator('#news-count').innerText(), 'Showing 1 of 1');
  assert.equal(await more.isVisible(), false);
  assert.equal(await less.isVisible(), false);
  assert.equal(await page.locator('.news-year-group[data-year="2026"]').isVisible(), false);

  await filter('category', 'all').click();
  await filter('category', 'projects').click();
  assert.equal(await page.locator('#news .news-item:visible').count(), 0);
  assert.equal(await page.locator('.news-empty').isVisible(), true);
  assert.equal(await page.locator('.news-pagination').isVisible(), false);
  await filter('year', 'all').click();
  await filter('category', 'all').click();
  assert.equal(await page.locator('#news-count').innerText(), 'Showing 3 of 7');
  assert.equal(await page.locator('.news-empty').isVisible(), false);
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No mobile overflow in ' + theme);
    const size = await more.boundingBox();
    assert(size.height >= 44 && size.width >= 44, 'The news button is a comfortable touch target');
  }
});

test('The three research axes each open the matching panel and connection', async () => {
  assert.deepEqual(await page.locator('.axis-node strong').allTextContents(), [
    'Learning', 'Reasoning', 'Behavior'
  ]);
  assert.equal(await page.locator('#research [role="tabpanel"]').count(), 3);
  assert.equal(await page.locator('.philosophy-connection').count(), 3);
  for (const [index, axis] of axes.entries()) {
    const tab = page.locator('#axis-' + axis);
    await tab.click();
    const panel = page.locator('#axis-panel-' + axis);
    assert.equal(await panel.isVisible(), true);
    assert.equal(await panel.getAttribute('aria-labelledby'), 'axis-' + axis);
    assert.equal(await tab.getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('#research [role="tabpanel"]:visible').count(), 1);
    assert.equal(await page.locator('.axis-node[tabindex="0"]').count(), 1);
    assert.equal(await page.locator('.philosophy-connection.active').getAttribute('data-axis'), axis);
    assert.equal(await panel.locator('.philosophy-detail-index').innerText(), `Axis 0${index + 1} / 03`);
    assert.equal(await panel.locator('.axis-paper').count(), 2);
  }
});

test('Keyboard and previous/next navigation wrap across three axes', async () => {
  assert.equal(await page.locator('.axis-node').count(), 3);
  await page.locator('#axis-learning').focus();
  await page.keyboard.press('End');
  assert.equal(await page.locator('#axis-behavior').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#axis-learning').evaluate(node => node === document.activeElement), true);
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#axis-behavior').evaluate(node => node === document.activeElement), true);
  await page.keyboard.press('Home');
  await page.locator('.philosophy-prev').click();
  assert.equal(await page.locator('#axis-behavior').getAttribute('aria-selected'), 'true');
  await page.locator('.philosophy-next').click();
  assert.equal(await page.locator('#axis-learning').getAttribute('aria-selected'), 'true');
});

for (const [axis, href, acronym, venue] of [
  ['learning', 'https://arxiv.org/abs/2507.20718', 'Uncertainty-driven Embedding Convolution', 'ICLR 2026'],
  ['learning', 'https://arxiv.org/abs/2406.15664', 'FP-BMA', 'UAI 2025'],
  ['reasoning', 'https://arxiv.org/abs/2610.17735', 'FBI', 'arXiv 2026 · Under review'],
  ['behavior', 'https://arxiv.org/abs/2605.21849', 'GAE', 'NeurIPS 2026'],
  ['behavior', 'https://arxiv.org/abs/2511.00040', 'SSPO', 'ICLR 2026 · Oral']
]) {
  test(axis + ' links to ' + acronym, async () => {
    assert.equal(await page.locator('#axis-' + axis).count(), 1);
    await page.locator('#axis-' + axis).click();
    const link = page.locator('#axis-panel-' + axis + ' .axis-paper[href="' + href + '"]');
    assert.equal(await link.isVisible(), true);
    assert.equal(await link.getAttribute('href'), href);
    assert((await link.locator('.axis-paper-title').innerText()).includes(acronym), 'The link identifies the requested paper');
    assert.equal(await link.locator('.axis-paper-meta').innerText(), venue);
    assert.equal(await link.getAttribute('target'), '_blank');
    assert.match(await link.getAttribute('rel'), /noopener/);
  });
}

for (const [id, title] of [
  ['publication-trajectory-mbr', 'When to Stop and Which to Return']
]) {
  test('Reasoning paper link reveals and focuses ' + id, async () => {
    await page.locator('#publications-toggle').click();
    await originalButton('underReview').click();
    await assertExpanded('underReview', false);
    await page.locator('#publications-toggle').click();
    await page.locator('#axis-reasoning').click();
    await page.locator('#axis-panel-reasoning [data-publication-target="' + id + '"]').click();
    await assertExpanded('underReview', true);
    const paper = page.locator('#' + id);
    await page.waitForFunction(id => document.activeElement.id === id, id);
    assert.equal(await paper.isVisible(), true);
    assert((await paper.locator('h5').innerText()).includes(title));
    assert.equal(new URL(page.url()).hash, '#' + id);

    await page.close();
    page = await browser.newPage({ viewport: { width: 320, height: 900 }, reducedMotion: 'no-preference' });
    page.on('pageerror', error => runtimeErrors.push(error.message));
    await page.goto(baseURL + '#' + id, { waitUntil: 'networkidle' });
    await assertExpanded('underReview', true);
    const destination = page.locator('#' + id);
    assert.equal(await destination.isVisible(), true, 'Direct links also reveal the publication');
    await page.waitForTimeout(1500); // Let the animated scroll and reveal transition finish.
    const top = await destination.evaluate(node => node.getBoundingClientRect().top);
    const navBottom = await page.locator('#mainNav').evaluate(node => node.getBoundingClientRect().bottom);
    assert(top >= navBottom && top < 900, `The linked heading lands in the mobile viewport (top ${top}, navigation ${navBottom})`);
  });
}

test('FBI shows its overview figure and paper resources in selected papers and the archive', async () => {
  const selected = page.locator('#selected-publications article').filter({ hasText: 'Train for Many, Update with One' });
  assert.equal(await selected.count(), 1, 'FBI is included in the default selected view');
  await selected.scrollIntoViewIfNeeded();
  const figure = selected.locator('.publication-figure img');
  await figure.evaluate(image => image.decode());
  assert.equal(await figure.evaluate(image => image.naturalWidth > 0), true, 'Figure 1 loads');
  const original = selected.locator('.publication-figure');
  assert.equal(await original.getAttribute('href'), await figure.getAttribute('src'), 'The figure opens at full size');
  for (const paper of [selected, page.locator('#publication-fbi')]) {
    assert.equal(await paper.locator('.publication-links a[href="https://arxiv.org/abs/2610.17735"]').count(), 1);
    assert.equal(await paper.locator('.publication-links a[href="https://github.com/team-approx-bayes/Fenchel-Bregman"]').count(), 1);
  }
  await page.goto(baseURL + '#publication-fbi', { waitUntil: 'networkidle' });
  await assertExpanded('underReview', true);
  assert.equal(await page.locator('#publication-fbi').isVisible(), true, 'Existing direct links reveal the archive entry');
  await page.waitForFunction(() => document.activeElement.id === 'publication-fbi');
});

for (const id of sections) {
  test(id + ' heading and original button both toggle only their section', async () => {
    await page.locator('#publications-toggle').click();
    const heading = sectionCard(id).getByRole('heading', { level: 4 });
    await heading.click();
    await assertExpanded(id, false);
    assert.equal(await heading.isVisible(), true, 'The collapsed section keeps a visible heading');
    for (const other of sections.filter(section => section !== id)) await assertExpanded(other, true);
    await originalButton(id).click();
    await assertExpanded(id, true);
    await originalButton(id).click();
    await assertExpanded(id, false);
    await heading.click();
    await assertExpanded(id, true);

    const headingButton = heading.getByRole('button');
    await headingButton.focus();
    await page.keyboard.press('Space');
    await assertExpanded(id, false);
    await page.keyboard.press('Enter');
    await assertExpanded(id, true);
  });
}

test('Peer Reviewed filters do not collapse the section and keep their selection on reopen', async () => {
  await page.locator('#publications-toggle').click();
  await page.locator('#peerReviewed-year-toggle [data-year="2026"]').click();
  const alignment = page.locator('.peer-theme-toggle [data-theme="alignment-safety"]');
  assert.equal(await alignment.count(), 1);
  await alignment.click();
  await page.locator('#filterJournal').uncheck();
  await assertExpanded('peerReviewed', true);
  const filteredTitles = await page.locator('.peer-reviewed-item:visible h5').allTextContents();
  assert.equal(filteredTitles.length, 1, 'SSPO matches the combined filters');
  assert.match(filteredTitles[0], /Semi-Supervised Preference Optimization/);
  const heading = sectionCard('peerReviewed').getByRole('heading', { level: 4 });
  await heading.click();
  await assertExpanded('peerReviewed', false);
  await heading.click();
  await assertExpanded('peerReviewed', true);
  assert.deepEqual(await page.locator('.peer-reviewed-item:visible h5').allTextContents(), filteredTitles);
});

test('Publication categories retain the five existing categories', async () => {
  const categories = ['Uncertainty', 'Robustness', 'Interpretability', 'Alignment & Safety', 'Applications'];
  assert.deepEqual(await page.locator('.peer-theme-toggle [data-theme]:not([data-theme="all"])').allTextContents(), categories);
  assert((await page.locator('.pub-tag').allTextContents()).every(tag => categories.includes(tag)));
  const sspo = page.locator('#selected-publications article').filter({ hasText: 'Semi-Supervised Preference Optimization' });
  assert.equal(await sspo.getByRole('group', { name: 'Research categories', exact: true }).count(), 1);
  assert.equal(await sspo.locator('.pub-tag-alignment-safety').count(), 1);
  const guardrail = page.locator('#workshop .card-body > ol > li').filter({ hasText: 'A Double-Edged Sword' });
  assert.equal(await guardrail.locator('.pub-tag-alignment-safety').count(), 1);
  assert.equal(await guardrail.locator('.pub-tag-applications').count(), 1);
});

test('Reasoning, efficiency, and evaluation remain as secondary topics', async () => {
  const sspo = page.locator('#selected-publications article').filter({ hasText: 'Semi-Supervised Preference Optimization' });
  assert.equal(await sspo.getByRole('group', { name: 'Additional research topics', exact: true }).count(), 1);
  assert.deepEqual(await sspo.locator('.pub-topic').allTextContents(), ['Data efficiency']);
  await page.locator('#publications-toggle').click();
  const ddrl = page.locator('#publication-ddrl');
  assert.equal(await ddrl.isVisible(), true);
  assert.deepEqual(await ddrl.locator('.pub-topic').allTextContents(), ['Reasoning']);
  assert.deepEqual(await ddrl.locator('.pub-tag').allTextContents(), ['Applications']);
  for (const title of ['RAILL', 'Eigen-Value', 'RRD:']) {
    const paper = page.locator('#publication-archive .card-body > ol > li').filter({ hasText: title });
    assert.deepEqual(await paper.locator('.pub-topic').allTextContents(), ['Efficiency']);
  }
  const guardrail = page.locator('#workshop .card-body > ol > li').filter({ hasText: 'A Double-Edged Sword' });
  assert.deepEqual(await guardrail.locator('.pub-topic').allTextContents(), ['Evaluation']);
  const mbr = page.locator('#publication-trajectory-mbr');
  assert.deepEqual(await mbr.locator('.pub-tag').allTextContents(), []);
  assert.deepEqual(await mbr.locator('.pub-topic').allTextContents(), ['Efficiency']);
  const fbi = page.locator('#publication-fbi');
  assert.deepEqual(await fbi.locator('.pub-tag').allTextContents(), ['Uncertainty']);
  assert.deepEqual(await fbi.locator('.pub-topic').allTextContents(), ['Reasoning', 'Efficiency']);
});

test('FP-BMA is discoverable under Robustness in selected papers and the full archive', async () => {
  const paper = page.locator('#selected-publications article').filter({ hasText: 'Flat Posterior Does Matter' });
  assert.equal(await paper.locator('.pub-tag-robustness').count(), 1);
  await page.locator('#publications-toggle').click();
  await page.locator('.peer-theme-toggle [data-theme="robustness"]').click();
  assert.equal(await page.locator('#peerReviewed [data-selected-order="4"]').isVisible(), true);
});

test('Workshop keeps only the two requested papers without removing peer-reviewed versions', async () => {
  await page.locator('#publications-toggle').click();
  const workshopTitles = await page.locator('#workshop .card-body > ol > li h5 strong').allTextContents();
  assert.deepEqual(workshopTitles, [
    'A Double-Edged Sword: Benchmarking the Trade-off Between Bias Mitigation and Helpfulness of LLM Guardrails in Finance',
    'Geometry-Adaptive Explainer for Faithful Dictionary-Based Interpretability under Distribution Shift'
  ]);
  for (const title of [
    'Sufficient Invariant Learning for Distribution Shift',
    'Causal Effect Variational Transformer for Public Health Measures and COVID-19 Infection Cluster Analysis',
    'Flat Posterior Does Matter For Bayesian Model Averaging'
  ]) {
    const paper = page.locator('#peerReviewed .peer-reviewed-item').filter({ hasText: title });
    assert.equal(await paper.count(), 1, 'The peer-reviewed version is preserved: ' + title);
    assert.equal(await paper.isVisible(), true);
  }
  assert.equal(await page.locator('#peerReviewed .peer-reviewed-item').count(), 15);
  assert.equal(await page.locator('#underReview .card-body > ol > li').count(), 5);
});

test('Heading controls and representative links fit mobile and desktop layouts', async () => {
  assert.equal(await page.locator('.axis-node').count(), 3);
  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const axis of axes) {
      await page.locator('#axis-' + axis).click();
      assert.equal(await page.locator('#axis-panel-' + axis).evaluate(node => node.scrollWidth > node.clientWidth + 1), false);
    }
    const diagramFits = await page.locator('.philosophy-orbit').evaluate(orbit => {
      const bounds = orbit.getBoundingClientRect();
      const nodes = Array.from(orbit.querySelectorAll('.axis-node'));
      const core = orbit.querySelector('.philosophy-core').getBoundingClientRect();
      const rects = [...nodes.map(node => node.getBoundingClientRect()), core];
      const overlap = rects.some((a, i) => rects.some((b, j) => j > i && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top));
      return !overlap && nodes.every(node => {
        const rect = node.getBoundingClientRect();
        return node.scrollWidth <= node.clientWidth + 1 && rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 && rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1;
      });
    });
    assert(diagramFits, 'Three labels fit around the central goal without overlap at ' + width + 'px');
    await page.locator('#publications-toggle').click();
    for (const id of sections) {
      const heading = sectionCard(id).getByRole('heading', { level: 4 });
      const button = heading.getByRole('button');
      assert.equal(await button.count(), 1);
      const size = await button.boundingBox();
      assert(size.height >= 44 && size.width >= 44, 'Comfortable touch target');
      assert.equal(await button.evaluate(node => node.scrollWidth > node.clientWidth + 1), false);
      await heading.click();
      await assertExpanded(id, false);
      await heading.click();
      await assertExpanded(id, true);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal page overflow');
    await page.locator('#publications-toggle').click();
    assert.equal(await page.locator('#selected-publications article:visible').count(), 5, 'Selected view remains intact');
  }
});
