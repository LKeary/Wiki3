# Using PowerShell to Update Wiki Pages

This guide explains how to use PowerShell scripts with the Wiki.js API to **point at specific pages** and **add or update content** (e.g. from data you pull with other PowerShell scripts).

---

## Prerequisites

- **API enabled** in the wiki (Administration → API Keys).
- An **API key** with a group that has **write:pages** (e.g. Administrators).

---

## 1. Create an API key

1. Go to **Administration** → **API Keys**.
2. Turn **API** on if it isn’t already.
3. Click **Create API Key**:
   - **Name**: e.g. `PowerShell scripts`
   - **Expiration**: e.g. `90d` or `1y`
   - **Permission groups**: choose a group with **write:pages**.
4. Copy the key and store it securely. You’ll use it as a **Bearer** token in the `Authorization` header.

---

## 2. How the API works

- **Endpoint**: `https://your-wiki/_graphql` (or `http://localhost:3000/_graphql` locally).
- **Method**: `POST`.
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer YOUR_API_KEY`.
- **Body**: JSON with `query` and, when needed, `variables`.

You **get a page by path** (e.g. `reports/daily`), then **update** it with new or appended content.

---

## 3. Using the Update-WikiPage.ps1 script

The wiki includes a helper script: **`scripts/powershell/Update-WikiPage.ps1`**.

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| **BaseUrl** | Yes | Wiki base URL (e.g. `http://localhost:3000`) |
| **ApiKey** | Yes | Your API key (Bearer token) |
| **SiteHostname** | Yes | Site hostname (e.g. `localhost`) |
| **PagePath** | Yes | Page path, no leading slash (e.g. `home`, `team/dashboard`) |
| **GetOnly** | No | If set, only fetches and outputs page content |
| **Content** | No | New content (replaces entire page) |
| **AppendContent** | No | Content to append after existing content |
| **ReasonForChange** | No | Reason for the update (optional) |

You must use either **GetOnly**, **Content**, or **AppendContent**.

### Examples

**Get a page’s content (read-only):**

```powershell
.\Update-WikiPage.ps1 -BaseUrl "http://localhost:3000" -ApiKey "YOUR_KEY" -SiteHostname "localhost" -PagePath "home" -GetOnly
```

**Append data to a page (e.g. from your own script):**

```powershell
$block = @"

## Update $(Get-Date -Format 'yyyy-MM-dd HH:mm')

| Item  | Value   |
|-------|---------|
| Data1 | $value1 |
| Data2 | $value2 |
"@

.\Update-WikiPage.ps1 -BaseUrl "http://localhost:3000" -ApiKey "YOUR_KEY" -SiteHostname "localhost" -PagePath "reports/daily" -AppendContent $block
```

**Replace a page’s content entirely:**

```powershell
.\Update-WikiPage.ps1 -BaseUrl "http://localhost:3000" -ApiKey "YOUR_KEY" -SiteHostname "localhost" -PagePath "my-page" -Content "# New title`n`nNew content here."
```

**Store the API key in an environment variable (recommended):**

```powershell
$env:WIKI_API_KEY = "your-api-key-here"
.\Update-WikiPage.ps1 -BaseUrl "http://localhost:3000" -ApiKey $env:WIKI_API_KEY -SiteHostname "localhost" -PagePath "reports/weekly" -AppendContent $data
```

---

## 4. Quick inline example (no script file)

If you prefer to call the API directly from your own script:

```powershell
$wikiUrl = "http://localhost:3000/_graphql"
$apiKey  = "YOUR_API_KEY"
$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $apiKey"
}

# Get site ID
$body = '{"query":"query { siteByHostname(hostname: \"localhost\", exact: true) { id } }"}'
$site = (Invoke-RestMethod -Uri $wikiUrl -Method Post -Body $body -Headers $headers).data.siteByHostname
$siteId = $site.id

# Get page
$body = "{ `"query`": `"query GetPage(`$siteId: UUID!, `$path: String!) { pageByPath(siteId: `$siteId, path: `$path) { id content } }`", `"variables`": { `"siteId`": `"$siteId`", `"path`": `"home`" } }"
$page = (Invoke-RestMethod -Uri $wikiUrl -Method Post -Body $body -Headers $headers).data.pageByPath

# Append and update
$newContent = $page.content + "`n`n*Updated at $(Get-Date)*"
$patch = @{ content = $newContent; reasonForChange = "PowerShell" } | ConvertTo-Json
$body = "{ `"query`": `"mutation UpdatePage(`$id: UUID!, `$patch: PageUpdateInput!) { updatePage(id: `$id, patch: `$patch) { operation { succeeded } } }`", `"variables`": { `"id`": `"$($page.id)`", `"patch`": $patch } }"
Invoke-RestMethod -Uri $wikiUrl -Method Post -Body $body -Headers $headers
```

---

## 5. Page paths

- Use the **path without a leading slash**: `home`, `team/dashboard`, `reports/weekly`.
- Folders are separated by `/`. The path is the same as in the wiki URL (without the leading `/`).

---

## 6. Creating a new page via API

If the page doesn’t exist yet, use the **createPage** mutation (e.g. from the same script or from the repo’s full API docs). You need: `siteId`, `path`, `title`, `content`, `editor` (e.g. `markdown`), `locale` (e.g. `en`), and `publishState` (e.g. `published`). Full details and GraphQL examples are in **`scripts/API-POWERSHELL.md`** in the wiki project.

---

## Summary

| Goal | Use |
|------|-----|
| Read a page | `Update-WikiPage.ps1` with **-GetOnly** |
| Append data to a page | `Update-WikiPage.ps1` with **-AppendContent** |
| Replace page content | `Update-WikiPage.ps1` with **-Content** |
| Create a new page | GraphQL **createPage** (see `scripts/API-POWERSHELL.md`) |

Store your API key securely (e.g. environment variable or secret store) and never commit it to source control.
