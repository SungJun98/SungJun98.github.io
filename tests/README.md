# Browser checks

These tests cover news batches and filters, navigation across three research axes, external and internal representative-paper links, publication categories and secondary topics, heading and button collapse controls, keyboard access, and responsive layouts.
The FBI project checks cover portfolio navigation, original figure loading, resource chart values and proportions, responsive equation layouts, theme persistence, and successful or denied citation copying.
They use Node.js's test runner and Playwright with Chromium.

Install the browser test dependency locally:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
```

Serve the site in a separate terminal:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Run the checks:

```sh
node --test tests/*.test.cjs
```

Set `PORTFOLIO_BASE_URL` to check a different preview URL.
