# Using the Wiki.js API from PowerShell

You can point PowerShell scripts at specific pages and add or update data using the **GraphQL API**. All requests go to `/_graphql` and use an **API key** for authentication.

---

## 1. Enable the API and create an API key

1. In Wiki.js: **Administration** → **API Keys** (or **Security** → **API Keys**).
2. Ensure **API is enabled** (toggle on).
3. **Create API Key**:
   - **Name**: e.g. `PowerShell scripts`
   - **Expiration**: e.g. `90d` or `1y`
   - **Permission groups**: pick a group that has **write:pages** (e.g. Administrators, or a custom group with page write access).
4. Copy the generated key and store it securely (e.g. secret store). You use it as a **Bearer token** in the `Authorization` header.

---

## 2. Base URL and headers

- **Endpoint**: `https://your-wiki-host/_graphql` (or `http://localhost:3000/_graphql` for local).
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_API_KEY`

Every request body is a JSON object with `query` (and `variables` when needed).

---

## 3. Get the site ID

Pages belong to a **site**. You need the site’s UUID for most operations.

**By hostname** (e.g. `localhost` or your wiki domain):

```graphql
query GetSite($hostname: String!) {
  siteByHostname(hostname: $hostname, exact: true) {
    id
    title
    hostname
  }
}
```

Variables: `{ "hostname": "localhost" }`

**List all sites**:

```graphql
query GetSites {
  sites {
    id
    title
    hostname
  }
}
```

Use the `id` from the response as `siteId` in the next steps.

---

## 4. Get a page by path

Use this to read current content or get the page `id` for updates.

```graphql
query GetPage($siteId: UUID!, $path: String!) {
  pageByPath(siteId: $siteId, path: $path) {
    id
    path
    title
    description
    content
    render
    editor
    locale
    contentType
  }
}
```

Variables: `{ "siteId": "YOUR_SITE_UUID", "path": "my-folder/my-page" }`

- **path**: wiki path without leading slash (e.g. `home`, `team/dashboard`, `reports/weekly`).
- Response includes `content` (source: Markdown/HTML) and `render` (rendered HTML). Use `content` when you want to append or replace source.

---

## 5. Update a page (replace or add data)

Updates use the page **id** (from step 4) and a **patch** object. You can send only the fields you want to change.

**Replace content entirely**:

```graphql
mutation UpdatePage($id: UUID!, $patch: PageUpdateInput!) {
  updatePage(id: $id, patch: $patch) {
    operation { succeeded message }
    page { id path title updatedAt }
  }
}
```

Variables example:

```json
{
  "id": "PAGE_UUID_FROM_STEP_4",
  "patch": {
    "content": "Your new full content here (Markdown or HTML depending on editor).",
    "title": "Optional new title",
    "reasonForChange": "Updated by PowerShell script"
  }
}
```

**Append data to existing content** (get page first, then update):

1. Call `pageByPath` and read `content`.
2. Build new content: `$newContent = $existingContent + "`n`n" + $blockToAppend`
3. Call `updatePage` with `patch: { content: $newContent }`.

For **Markdown** pages, appending might look like:

```markdown

## Data from script (2025-03-10)

| Column A | Column B |
|----------|----------|
| value1   | value2   |
```

For **HTML / Visual editor** pages, append valid HTML (e.g. `<p>...</p>` or a table).

---

## 6. Create a new page

If the page doesn’t exist yet, use `createPage` with required fields:

```graphql
mutation CreatePage($siteId: UUID!, $path: String!, $title: String!, $content: String!, $editor: String!, $locale: String!, $publishState: PagePublishState!) {
  createPage(
    siteId: $siteId
    path: $path
    title: $title
    description: ""
    content: $content
    editor: $editor
    locale: $locale
    publishState: $publishState
  ) {
    operation { succeeded message }
    page { id path title }
  }
}
```

Variables example:

```json
{
  "siteId": "YOUR_SITE_UUID",
  "path": "reports/daily",
  "title": "Daily Report",
  "content": "# Daily Report\n\nContent here.",
  "editor": "markdown",
  "locale": "en",
  "publishState": "published"
}
```

- **editor**: `markdown` or `wysiwyg` (visual). Use `markdown` for script-generated content unless you send HTML.
- **publishState**: `published` or `draft`.

---

## 7. PowerShell example: invoke GraphQL

```powershell
$wikiUrl = "http://localhost:3000/_graphql"
$apiKey  = "YOUR_API_KEY_HERE"

function Invoke-WikiGraphQL {
    param([string]$Query, [hashtable]$Variables = @{})
    $body = @{ query = $Query }
    if ($Variables.Count -gt 0) { $body.variables = $Variables }
    $json = $body | ConvertTo-Json -Depth 10 -Compress
    $headers = @{
        "Content-Type"  = "application/json"
        "Authorization" = "Bearer $apiKey"
    }
    $resp = Invoke-RestMethod -Uri $wikiUrl -Method Post -Body $json -Headers $headers
    if ($resp.errors) { throw $resp.errors }
    $resp.data
}

# Get site
$site = Invoke-WikiGraphQL -Query 'query { siteByHostname(hostname: "localhost", exact: true) { id title } }'
$siteId = $site.siteByHostname.id

# Get page
$page = Invoke-WikiGraphQL -Query 'query GetPage($siteId: UUID!, $path: String!) { pageByPath(siteId: $siteId, path: $path) { id path title content editor } }' `
    -Variables @{ siteId = $siteId; path = "home" }

# Append a line to content
$currentContent = $page.pageByPath.content
$newBlock = "`n`n---`n*Updated by script at $(Get-Date -Format 'o')*"
$newContent = $currentContent + $newBlock

# Update page
Invoke-WikiGraphQL -Query 'mutation UpdatePage($id: UUID!, $patch: PageUpdateInput!) { updatePage(id: $id, patch: $patch) { operation { succeeded message } } }' `
    -Variables @{ id = $page.pageByPath.id; patch = @{ content = $newContent; reasonForChange = "PowerShell append" } }
```

Use the same pattern to point at different pages (change `path`) and add data (e.g. tables, sections) by building `content` and calling `updatePage`.

---

## 8. Reference: useful fields

| Operation    | Purpose |
|-------------|---------|
| `pageByPath(siteId, path)` | Get page by path; returns `id`, `content`, `editor`, etc. |
| `updatePage(id, patch)`    | Update page; patch can include `content`, `title`, `description`, `reasonForChange`. |
| `createPage(...)`          | Create a new page; requires `siteId`, `path`, `title`, `content`, `editor`, `locale`, `publishState`. |

**PageUpdateInput** can include: `content`, `title`, `description`, `reasonForChange`, `publishState`, `tags`, and more. Omit fields you don’t want to change.

---

See also the example script `scripts/powershell/Update-WikiPage.ps1` for a reusable helper that gets a page by path and updates or appends content.
