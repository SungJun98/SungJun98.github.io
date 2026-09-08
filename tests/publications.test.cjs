const assert = require('node:assert/strict');
const { after, afterEach, before, beforeEach, test } = require('node:test');
const { chromium } = require('playwright');

const baseURL = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:8765/';
const sections = ['peerReviewed', 'underReview', 'workshop'];
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

test('Reasoning keeps its explanation without a representative-paper link', async () => {
  await page.locator('#axis-reasoning').click();
  const panel = page.locator('#axis-panel-reasoning');
  assert.equal(await panel.isVisible(), true);
  assert(await panel.locator('p').innerText(), 'The axis explanation is retained');
  assert.equal(await panel.locator('.axis-paper, a').count(), 0, 'The ongoing work has no placeholder paper link');
  await page.locator('#publications-toggle').click();
  assert.equal(await page.locator('#publication-ddrl').isVisible(), true, 'DDRL remains in the publication archive');
});

for (const [axis, href, acronym, venue] of [
  ['robustness', 'https://arxiv.org/abs/2406.15664', 'FP-BMA', 'UAI 2025'],
  ['efficiency', 'https://arxiv.org/abs/2511.00040', 'SSPO', 'ICLR 2026 · Oral']
]) {
  test(axis + ' opens the requested representative paper', async () => {
    await page.locator('#axis-' + axis).click();
    const link = page.locator('#axis-panel-' + axis + ' .axis-paper');
    assert.equal(await link.isVisible(), true);
    assert.equal(await link.getAttribute('href'), href);
    assert((await link.locator('.axis-paper-title').innerText()).includes(acronym), 'The link identifies the requested paper');
    assert.equal(await link.locator('.axis-paper-meta').innerText(), venue);
    assert.equal(await link.getAttribute('target'), '_blank');
    assert.match(await link.getAttribute('rel'), /noopener/);
  });
}

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
  await page.locator('.peer-theme-toggle [data-theme="efficiency"]').click();
  await page.locator('#filterJournal').uncheck();
  await assertExpanded('peerReviewed', true);
  const filteredTitles = await page.locator('.peer-reviewed-item:visible h5').allTextContents();
  assert.equal(filteredTitles.length, 2, 'SSPO and Eigen-Value match the combined filters');
  const heading = sectionCard('peerReviewed').getByRole('heading', { level: 4 });
  await heading.click();
  await assertExpanded('peerReviewed', false);
  await heading.click();
  await assertExpanded('peerReviewed', true);
  assert.deepEqual(await page.locator('.peer-reviewed-item:visible h5').allTextContents(), filteredTitles);
});

test('FP-BMA is discoverable under Robustness in selected papers and the full archive', async () => {
  const paper = page.locator('#selected-publications article').filter({ hasText: 'Flat Posterior Does Matter' });
  assert.equal(await paper.locator('.pub-tag-robustness').count(), 1);
  await page.locator('#publications-toggle').click();
  await page.locator('.peer-theme-toggle [data-theme="robustness"]').click();
  assert.equal(await page.locator('#peerReviewed [data-selected-order="4"]').isVisible(), true);
  const workshopPaper = page.locator('#workshop .card-body > ol > li').filter({ hasText: 'Flat Posterior For Bayesian Model Averaging' });
  assert.equal(await workshopPaper.locator('.pub-tag-robustness').count(), 1);
});

test('Heading controls and representative links fit mobile and desktop layouts', async () => {
  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const axis of ['uncertainty', 'robustness', 'reasoning', 'interpretability', 'efficiency']) {
      await page.locator('#axis-' + axis).click();
      assert.equal(await page.locator('#axis-panel-' + axis).evaluate(node => node.scrollWidth > node.clientWidth + 1), false);
    }
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
    assert.equal(await page.locator('#selected-publications article:visible').count(), 4, 'Selected view remains intact');
  }
});
