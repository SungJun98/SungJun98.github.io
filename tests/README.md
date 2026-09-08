# Browser checks

These tests cover representative-paper links, publication filters, heading and button collapse controls, keyboard access, and responsive layouts.
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
node --test tests/publications.test.cjs
```

Set `PORTFOLIO_BASE_URL` to check a different preview URL.
