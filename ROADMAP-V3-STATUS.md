# Wiki.js 3 – Where They're Up To

**Source:** [v3 Feature Parity Checklist · Issue #6844](https://github.com/requarks/wiki/issues/6844) (pinned, last updated 2025-02-22)  
**Formal roadmap:** [docs.requarks.io/releases/roadmap](https://docs.requarks.io/releases/roadmap)

---

## Plan

- Stay in **beta** until **all v2 features** are implemented in v3.
- No public beta yet — transition to beta was planned “once remaining permission issues are fixed” (maintainer, Jan 2024).
- **No ETA** — maintainer (NGPixel) has stated no release date.
- **Single maintainer** — one person on v3; v2 still updated in parallel.

---

## Status Legend

| Symbol | Meaning |
|--------|--------|
| 🟩 | Implemented |
| 🟨 | Partial |
| 🟥 | Not implemented |
| 🚫 | Deprecated (replaced or removed in v3) |

---

## Administration

| Feature | Status |
|---------|--------|
| Dashboard, General, Locale, Theme (per site) | 🟩 |
| Groups (view/create/edit/delete) | 🟩 |
| Users (view/create/edit/delete/search) | 🟩 |
| Navigation admin | 🚫 Replaced by in-page navigation editor |
| Pages admin | 🚫 Will be replaced by new area for all users |
| Tags admin | 🚫 Will be replaced by new area for all users |
| **Modules:** Analytics | 🟥 |
| **Modules:** Authentication (3rd party) | 🟨 Not functional yet |
| **Modules:** Comments | 🟥 |
| **Modules:** Rendering | 🟨 Partial (editors handle some; rendering = final HTML) |
| **Modules:** Search Engine | 🚫 Replaced by native PostgreSQL search |
| **Modules:** Storage (external) | 🟨 External storage modules not functional yet |
| API Access, Extensions, Mail, Security, System Info, Updates | 🟩 |
| SSL | 🚫 To be replaced (Let's Encrypt too buggy) |
| Utilities | 🟨 Most not functional |
| Dev Tools (Flags, GraphQL) | 🟩 |

---

## Assets

Browse, create folder, upload, rename, delete — **all 🟩**.

---

## Authentication

| Feature | Status |
|---------|--------|
| Login (local), Logout, Register | 🟩 |
| Login (3rd party / SSO) | 🟥 |
| 2FA (login + first-time setup) | 🟩 |
| Change Password (step) | 🟩 |
| Reset Password | 🟥 |

---

## Editors

| Feature | Status |
|---------|--------|
| Markdown Editor | 🟨 Mostly functional (Monaco) |
| WYSIWYG Editor | 🟨 Output rendering not working yet |
| AsciiDoc Editor | 🟥 |
| Formatting toolbar, Insert Images, Preview, Scroll sync | 🟩 |
| Insert Link, Code Block, Table | 🟥 (can still write in markdown) |
| New Page From Template, Tabsets, Draw.io | 🟥 |
| Spellcheck | 🚫 Deprecated |

---

## Navigation

| Feature | Status |
|---------|--------|
| Breadcrumbs, Custom mode (per-path menus) | 🟩 |
| Browse Mode | 🟥 |

---

## Pages

| Feature | Status |
|---------|--------|
| Create, Duplicate, Rename/Move, Delete, View, View Source | 🟩 |
| Page title/description (Page Properties) | 🟩 |
| Last edit, Tags display | 🟩 |
| View Page History | 🟥 |
| Convert Page | 🟥 |
| Page TOC | 🟥 |
| Switch locale, Print view | 🟥 |
| SSR for SEO | 🟥 |
| Page Author | 🚫 Deprecated (maybe optional block later) |

---

## Search

| Feature | Status |
|---------|--------|
| Search, Search by tags | 🟩 |
| Search autocomplete | 🟨 Disabled (avoid leaking private page words) |

---

## Users (front-facing)

| Feature | Status |
|---------|--------|
| Edit Profile, Change Password, View User's Groups | 🟩 |
| View User's Pages | 🟥 |

---

## v3-Only (not in parity list)

- **Multi-sites**
- **Native PostgreSQL search** (replaces external search engines)
- **File Manager** (manage assets/pages without full admin)
- **Blocks** (Web Components)
- Per-path navigation menus

---

## Takeaways

- **Done:** Admin (site, groups, users, modules config), assets, local auth + 2FA, API, extensions, mail, security, core page CRUD, search, profile.
- **Blockers / missing for “full” parity:** 3rd party auth, reset password, Analytics module, Comments module, page history, WYSIWYG output, several editor shortcuts (link/code/table/template), browse mode, TOC, locale switch, print, SSR.
- **Relaxed:** Many editor features “can still write in markdown directly”; some admin areas deprecated in favour of new UX.

Use this as the checklist for “where v3 is” and what’s left if you’re contributing or planning your own fork.
