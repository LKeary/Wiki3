# Seed demo data (dummy docs + test users)

This adds dummy wiki pages and test accounts so you can try the app and see how permissions work.

## Prerequisites

- Wiki.js server running (e.g. `http://localhost:3000`)
- Admin has **already completed** the first-login “change password” step (otherwise login returns no token).  
  If you just installed: log in once in the UI as `admin@example.com`, set your new password, then run the script.

## Run

```bash
# From repo root (wikijs3)
ADMIN_PASSWORD=YourAdminPassword node scripts/seed-demo-data.mjs
```

Optional env:

- `BASE_URL` – default `http://localhost:3000`
- `ADMIN_EMAIL` – default `admin@example.com`
- `ADMIN_PASSWORD` – admin password (required after first-login change)
- `ADMIN_PASSWORD_FIRST_RUN` – fallback password (default `12345678`) tried if main password fails

## What it creates

- **Groups**
  - **Editors** – read + write pages (and comments)
  - **Viewers** – read-only (default permissions)
- **Users** (password for all: `TestPass123!`)
  - `user1@example.com` – **Users** (read + comments)
  - `user2@example.com` – **Users** + **Editors** (can edit pages)
  - `user3@example.com` – **Viewers** (read-only)
  - `admin1@example.com` – **Administrators**
  - `admin2@example.com` – **Administrators**
  - `admin3@example.com` – **Administrators**
- **Pages**
  - `/welcome` – Welcome
  - `/getting-started` – Getting Started
  - `/api-overview` – API Overview
  - `/team/roles` – Team Roles

Safe to run multiple times; existing users and pages are skipped.

## Features to try

### Visual (WYSIWYG) editor

Wiki.js 3 includes a **Visual Editor** (like Wiki.js 2). To see it in the "New Page" / "Create" menu:

1. Go to **Administration → Editors** (for the current site).
2. Turn **on** the **Visual Editor** toggle (and optionally configure it).
3. Use **Create New Page** in the header; you should see both **New Page** (Visual) and **New Markdown Page**.

New sites have the Visual Editor enabled by default. If you only see Markdown, enable it in Admin → Editors.

### PDFs and other documents

- **Upload PDFs as assets**: Use **Create New Page → Upload Media Asset** (or the File Manager) to upload PDFs and other documents. They are stored as assets and can be linked from any wiki page (e.g. `[Handbook](/path/to/handbook.pdf)` in Markdown).
- A dedicated "PDF page" type (embed or display a PDF as a page) is not implemented yet; link to uploaded PDF assets from normal pages for now.
