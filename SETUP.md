# Wiki.js 3 – Local setup (vega branch)

This is the Wiki.js 3 (vega) source, pulled down for you to inspect and modify.

## What’s already done

- **Source**: Cloned from `https://github.com/requarks/wiki` branch `vega`.
- **Config**: `config.yml` created from `config.sample.yml` (defaults: port 3000, PostgreSQL on localhost:5432, user/pass `postgres`, database `postgres`, schema `wiki`).

## What you need on your machine

1. **Node.js 18+**  
   https://nodejs.org/ or via `nvm` / `fnm`.

2. **pnpm**  
   ```bash
   corepack enable
   corepack prepare pnpm@9.12.2 --activate
   ```
   Or: `npm install -g pnpm`

3. **PostgreSQL 12+** (16+ preferred per README)  
   - Create an **empty** database (e.g. `postgres` or a new DB like `wikijs`).
   - If you use different host/port/user/pass/db, edit `config.yml` → `db:` section.

## One-time setup (install deps and build)

From the project root (`wikijs3/`):

```bash
# 1. Server
cd server && pnpm install && cd ..

# 2. UX (frontend) – build is heavy, may take a few minutes
cd ux && pnpm install && pnpm build && cd ..

# 3. Blocks
cd blocks && pnpm install && pnpm build && cd ..
```

## Run the app

From the project root:

```bash
node server
```

Then open **http://localhost:3000**.

**Default login:**

- Email: `admin@example.com`
- Password: `12345678`

## Dev workflow (optional)

- **Server with auto-reload**: From project root, `cd server && pnpm dev`
- **Frontend dev (hot reload)**: In another terminal, `cd ux && pnpm dev` → app at http://localhost:3001 (proxies API to server on 3000)

## Project layout (quick reference)

| Path        | Description                |
|------------|----------------------------|
| `server/`  | Backend (Node, GraphQL, Express) |
| `ux/`      | Frontend (Quasar/Vue 3, Vite)    |
| `blocks/`  | Web Components / blocks (Lit)    |
| `dev/`     | Dev tooling / scripts            |
| `config.yml` | App config (port, DB, etc.)   |

## Important notes

- This is the **vega** (v3) dev branch: buggy and incomplete. No upgrade path from v2; use for learning and experimentation.
- Use an **empty** database; the app will create the `wiki` schema and tables on first run.
- For Docker-based dev (PostgreSQL + pgAdmin + recommended setup), see the main [README.md](README.md) “Using VS Code Dev Environment”.

Once Node, pnpm, and PostgreSQL are installed and the one-time setup above has been run, you can start the app with `node server` and begin inspecting and changing the code.

## E2E tests (Playwright)

From the repo root, the `e2e/` folder contains Playwright tests that run against a local Wiki.js instance (Chromium). You can run and record sessions without manual testing.

```bash
cd e2e
pnpm install
pnpm exec playwright install chromium
pnpm test
```

See **`e2e/README.md`** for how to run tests, view traces/videos on failure, and add new tests.
