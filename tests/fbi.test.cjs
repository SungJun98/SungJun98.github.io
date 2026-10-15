const assert = require('node:assert/strict');
const { after, afterEach, before, beforeEach, test } = require('node:test');
const { chromium } = require('playwright');

const baseURL = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:8765/';
const projectURL = new URL('projects/fbi/', baseURL).href;
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
  page.on('console', message => { if (message.type() === 'error') runtimeErrors.push(message.text()); });
});

afterEach(async () => {
  await page.close();
  assert.deepEqual(runtimeErrors, [], 'No browser runtime errors');
});

after(async () => {
  await browser.close();
});

test('The portfolio opens the FBI project and links back to the paper', async () => {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  const card = page.locator('#selected-publications article').filter({ hasText: 'Train for Many, Update with One' });
  const projectLink = card.getByRole('link', { name: 'Project page', exact: true });
  assert.equal(await projectLink.count(), 1);
  await projectLink.click();
  assert.equal(page.url(), projectURL);
  assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Train for Many, Update with One');
  for (const [name, href] of [
    ['Paper', 'https://arxiv.org/abs/2610.17735'],
    ['Code', 'https://github.com/team-approx-bayes/Fenchel-Bregman']
  ]) {
    const link = page.locator('.hero').getByRole('link', { name, exact: true });
    assert.equal(await link.getAttribute('href'), href);
    assert.match(await link.getAttribute('rel'), /noopener/);
  }
  await page.getByRole('link', { name: 'Citation', exact: true }).click();
  assert.equal(new URL(page.url()).hash, '#citation');
  await page.getByRole('link', { name: /Back to Portfolio/ }).first().click();
  await page.waitForFunction(() => document.activeElement.id === 'publication-fbi');
  assert.equal(await page.locator('#publication-fbi').isVisible(), true);
});

test('All original paper figures load and open at full size', async () => {
  await page.goto(projectURL, { waitUntil: 'networkidle' });
  const figures = page.locator('.paper-figure');
  assert.equal(await figures.count(), 3);
  for (const figure of await figures.all()) {
    await figure.scrollIntoViewIfNeeded();
    const image = figure.locator('img');
    await image.evaluate(image => image.decode());
    assert.equal(await image.evaluate(image => image.naturalWidth > 0 && image.naturalHeight > 0), true);
    assert(await image.getAttribute('alt'), 'Each plot has a text alternative');
    assert.equal(await figure.locator('a').getAttribute('href'), await image.getAttribute('src'));
  }
});

test('The project fits mobile and desktop and preserves the chosen theme on return', async () => {
  await page.goto(projectURL, { waitUntil: 'networkidle' });
  await page.getByText('Exact measurements and benchmark setup', { exact: true }).click();
  const themeToggle = page.locator('#theme-toggle');
  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      if (await page.locator('html').getAttribute('data-theme') !== theme) await themeToggle.click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No page overflow at ${width}px in ${theme}`);
      for (const equation of await page.locator('.math-display:visible').all()) {
        const bounds = await equation.boundingBox();
        assert(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, 'Equations stay inside the viewport');
      }
      const tables = page.getByRole('region', { name: /^(Recursive reasoning results|Mathematical reasoning results|Training resources)$/ });
      assert.equal(await tables.count(), 3);
      for (const region of await tables.all()) {
        assert.equal(await region.getAttribute('tabindex'), '0', 'Wide tables are keyboard scrollable');
        assert.equal(await region.evaluate(node => node.getBoundingClientRect().right <= innerWidth), true);
      }
    }
  }
  await page.getByRole('link', { name: /Back to Portfolio/ }).first().click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.goto(projectURL, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  assert.equal(await themeToggle.getAttribute('aria-pressed'), 'true');
});

test('LaTeX equations render with local math fonts, including expanded derivation', async () => {
  const failedAssets = [];
  page.on('response', response => {
    if (response.url().startsWith(baseURL) && response.status() >= 400) failedAssets.push(response.url());
  });
  await page.goto(projectURL, { waitUntil: 'networkidle' });
  await page.getByText('Fenchel identity and training details', { exact: true }).click();
  const equations = page.locator('.equation-card .katex-display .katex-html');
  assert.equal(await equations.count(), 4, 'All four display equations are typeset');
  assert.equal(await page.locator('.katex-error').count(), 0);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => document.fonts.check('20px KaTeX_Main')), true);
  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const equation of await equations.all()) {
      const bounds = await equation.boundingBox();
      assert(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, `The typeset equation fits at ${width}px`);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  assert.deepEqual(failedAssets, [], 'Math renderer, stylesheet, and fonts load locally');
});

test('The resource chart shows exact values and proportional bars from the measurements table', async () => {
  await page.goto(projectURL, { waitUntil: 'networkidle' });
  const rows = page.locator('#resource-chart .resource-row');
  assert.equal(await rows.count(), 4);
  assert.equal(await rows.nth(2).locator('h4 sup').count(), 1, 'The FLOP scale keeps its exponent');
  assert.equal(await rows.nth(2).locator('h4 sup').innerText(), '12');
  assert.equal(await page.locator('#efficiency img').count(), 0, 'The comparison is rendered as HTML');
  const expected = [
    ['1', '10', '10.0%'],
    ['0.0692', '0.5614', '12.3%'],
    ['0.427', '4.087', '10.4%'],
    ['0.611', '3.707', '16.5%']
  ];
  for (const [index, [fbi, direct, share]] of expected.entries()) {
    const row = rows.nth(index);
    assert.equal(await row.locator('.resource-value-fbi').innerText(), fbi);
    assert.equal(await row.locator('.resource-value-direct').innerText(), direct);
    assert.equal(await row.locator('.resource-share').innerText(), share + ' of Direct-10');
    const fbiWidth = (await row.locator('.resource-fill-fbi').boundingBox()).width;
    const directWidth = (await row.locator('.resource-fill-direct').boundingBox()).width;
    assert(Math.abs(100 * fbiWidth / directWidth - parseFloat(share)) < 0.2, 'Bar lengths agree with the displayed proportions');
  }
  await page.getByText('Exact measurements and benchmark setup', { exact: true }).click();
  assert.equal(await page.locator('#training-resources').isVisible(), true);
});

test('Copy BibTeX writes the displayed citation to the clipboard', async () => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(projectURL, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Copy BibTeX' }).click();
  await page.waitForFunction(() => document.getElementById('copy-status').textContent.includes('copied'));
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert.equal(copied, await page.locator('#bibtex').textContent());
});

test('A denied clipboard keeps the citation available for manual copying', async () => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async () => { throw new DOMException('Permission denied', 'NotAllowedError'); } }
    });
  });
  await page.goto(projectURL, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Copy BibTeX' }).click();
  await page.waitForFunction(() => document.getElementById('copy-status').textContent.includes('manually'));
  assert.equal(await page.locator('#bibtex').isVisible(), true);
  assert.equal(await page.locator('#bibtex').evaluate(node => node.parentElement === document.activeElement), true);
  assert.equal(await page.getByRole('button', { name: 'Copy BibTeX' }).isEnabled(), true);
});
