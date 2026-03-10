# Wiki.js 3 – E2E tests (Playwright)

End-to-end tests using **Playwright** and **Chromium**. Sessions can be recorded (trace + video) on first retry and on failure so you can "watch back" and debug without manual testing.

## Prerequisites

- **Wiki.js server** running at `http://localhost:3000` (from repo root: `node server`).
- **Node 18+** and **pnpm** (or npm).

If you run the server with **pre-built assets** (no Vite dev server), rebuild the frontend after UX changes or the app may show old behaviour (e.g. "Not implemented" for Browse):

```bash
cd ux && pnpm run build && cd ..
```

Then restart the server. Alternatively, run the **Vite dev server** (`cd ux && pnpm dev`) and point `WIKI_BASE_URL` at the dev port (e.g. `http://localhost:3001`) so the server proxies to it and you get live UX without rebuilding.

## Install

```bash
cd e2e
pnpm install
pnpm exec playwright install chromium
```

## Run tests

```bash
# All tests (headless Chromium)
pnpm test

# With browser visible
pnpm run test:headed

# Interactive UI mode
pnpm run test:ui

# Debug (step through)
pnpm run test:debug
```

## Recordings and "watch back"

- **Trace:** Recorded on first retry and on failure. View with:
  ```bash
  pnpm run report
  ```
  Then open a failed test and click "Trace" to replay the run.
- **Video:** Recorded on first retry and on failure. Saved under `test-results/`.
- **Screenshots:** Captured on failure only.

Override base URL or credentials:

```bash
WIKI_BASE_URL=http://localhost:3000 WIKI_ADMIN_EMAIL=admin@example.com WIKI_ADMIN_PASSWORD=12345678 pnpm test
```

## Adding tests

Add `*.spec.ts` files under `tests/`. Use `page.goto('/path')`, `getByRole`, `getByLabel`, etc. Reuse the login helper from `core-flows.spec.ts` or create a fixture in `tests/fixtures.ts` if needed.

The **full-app** suite (`full-app.spec.ts`) runs as a logged-in user and should cover main UI actions so that regressions (e.g. Browse showing "Not implemented") are caught. Add tests for any critical buttons or flows that must not be unimplemented.

### Optional: API key for E2E / automation

You can use an **API key** instead of the login form for headless or scripted access:

1. In the app: **Administration → API** and enable the API, then create a key (name, expiration, groups).
2. Use the returned key as a **Bearer token** on requests (e.g. `Authorization: Bearer <key>` on `/_graphql` or other authenticated endpoints).

This is useful for E2E (e.g. custom `globalSetup` that uses GraphQL with the key), CI, or external tools that need to call the API without going through the browser login.
