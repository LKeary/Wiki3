#!/usr/bin/env bash
# One-time install and build for Wiki.js 3 (vega).
# Requires: Node 18+, pnpm, and (for running) PostgreSQL.
set -e
cd "$(dirname "$0")"

echo "Installing server..."
(cd server && pnpm install)
echo "Installing and building ux (this may take a few minutes)..."
(cd ux && pnpm install && pnpm build)
echo "Installing and building blocks..."
(cd blocks && pnpm install && pnpm build)
echo "Done. Start with: node server"
echo "Then open http://localhost:3000 (login: admin@example.com / 12345678)"
