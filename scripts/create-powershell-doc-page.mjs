#!/usr/bin/env node
/**
 * Create the "Using PowerShell to Update Wiki Pages" document as a wiki page.
 *
 * Usage:
 *   WIKI_BASE_URL=http://localhost:3000 WIKI_API_KEY=your-key node scripts/create-powershell-doc-page.mjs [page-path]
 *
 * Optional: WIKI_SITE_HOSTNAME=localhost (default) if your site hostname differs.
 * Default page path: docs/powershell-api
 * If the page already exists, run with Update-WikiPage.ps1 or updatePage mutation to refresh content.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const baseUrl = process.env.WIKI_BASE_URL || 'http://localhost:3000'
const apiKey = process.env.WIKI_API_KEY
const siteHostname = process.env.WIKI_SITE_HOSTNAME || 'localhost'
const pagePath = process.argv[2] || 'docs/powershell-api'

if (!apiKey) {
  console.error('Set WIKI_API_KEY (and optionally WIKI_BASE_URL).')
  process.exit(1)
}

const contentPath = path.join(__dirname, 'wiki-page-powershell-api.md')
const content = fs.readFileSync(contentPath, 'utf8')
const title = content.split('\n')[0].replace(/^#\s*/, '').trim() || 'Using PowerShell to Update Wiki Pages'

const graphqlUrl = baseUrl.replace(/\/?$/, '') + '/_graphql'
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`
}

async function graphql(query, variables = {}) {
  const body = JSON.stringify({ query, variables })
  const res = await fetch(graphqlUrl, { method: 'POST', headers, body })
  const data = await res.json()
  if (data.errors) {
    throw new Error(data.errors.map(e => e.message).join('; '))
  }
  return data.data
}

async function main() {
  const siteData = await graphql(
    'query GetSite($hostname: String!) { siteByHostname(hostname: $hostname, exact: true) { id title } }',
    { hostname: siteHostname }
  )
  const siteId = siteData?.siteByHostname?.id
  if (!siteId) {
    throw new Error(`Site not found for hostname ${siteHostname}. Set WIKI_SITE_HOSTNAME if needed.`)
  }

  const result = await graphql(
    `mutation CreatePage($siteId: UUID!, $path: String!, $title: String!, $content: String!, $editor: String!, $locale: String!, $publishState: PagePublishState!, $description: String!) {
      createPage(
        siteId: $siteId
        path: $path
        title: $title
        description: $description
        content: $content
        editor: $editor
        locale: $locale
        publishState: $publishState
      ) {
        operation { succeeded message }
        page { id path title }
      }
    }`,
    {
      siteId,
      path: pagePath,
      title,
      content,
      description: 'How to use PowerShell with the Wiki.js API to update or create pages.',
      editor: 'markdown',
      locale: 'en',
      publishState: 'published'
    }
  )

  const op = result?.createPage?.operation
  const page = result?.createPage?.page
  if (!op?.succeeded) {
    throw new Error(op?.message || 'Create page failed')
  }
  console.log('Created wiki page:', page.path, '(id:', page.id + ')')
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
