<#
.SYNOPSIS
    Create a wiki page from a Markdown file using the GraphQL API.

.DESCRIPTION
    Reads a .md file and creates a new wiki page with that content.
    Use this to publish scripts/wiki-page-powershell-api.md as a wiki page.

.PARAMETER BaseUrl
    Wiki base URL (e.g. http://localhost:3000).

.PARAMETER ApiKey
    API key (Bearer token) with write:pages.

.PARAMETER SiteHostname
    Site hostname (e.g. localhost).

.PARAMETER PagePath
    Path for the new page (e.g. docs/powershell-api or powershell-api).

.PARAMETER SourceFile
    Path to the .md file. Default: script dir + ../wiki-page-powershell-api.md

.EXAMPLE
    .\Create-WikiPageFromFile.ps1 -BaseUrl http://localhost:3000 -ApiKey $env:WIKI_API_KEY -SiteHostname localhost -PagePath docs/powershell-api
#>

param(
    [Parameter(Mandatory = $true)]
    [string] $BaseUrl,

    [Parameter(Mandatory = $true)]
    [string] $ApiKey,

    [Parameter(Mandatory = $true)]
    [string] $SiteHostname,

    [Parameter(Mandatory = $true)]
    [string] $PagePath,

    [string] $SourceFile
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $SourceFile) {
    $SourceFile = Join-Path (Split-Path -Parent $scriptDir) "wiki-page-powershell-api.md"
}
if (-not (Test-Path $SourceFile)) {
    throw "Source file not found: $SourceFile"
}

$content = Get-Content -Path $SourceFile -Raw -Encoding UTF8
$firstLine = (Get-Content -Path $SourceFile -First 1 -Encoding UTF8) -replace "^#\s*", ""
$title = $firstLine.Trim()
if (-not $title) { $title = "PowerShell API" }

$graphqlUrl = "$BaseUrl/_graphql".Replace("//_", "/_")
$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $ApiKey"
}

function Invoke-WikiGraphQL {
    param([string] $Query, [hashtable] $Variables = @{})
    $body = @{ query = $Query }
    if ($Variables.Count -gt 0) { $body.variables = $Variables }
    $json = $body | ConvertTo-Json -Depth 15 -Compress
    try {
        $resp = Invoke-RestMethod -Uri $graphqlUrl -Method Post -Body $json -Headers $headers
    } catch {
        throw "GraphQL request failed: $_"
    }
    if ($resp.errors) {
        $msg = ($resp.errors | ForEach-Object { $_.message }) -join "; "
        throw "GraphQL errors: $msg"
    }
    $resp.data
}

$siteQuery = 'query GetSite($hostname: String!) { siteByHostname(hostname: $hostname, exact: true) { id title } }'
$siteData = Invoke-WikiGraphQL -Query $siteQuery -Variables @{ hostname = $SiteHostname }
$siteId = $siteData.siteByHostname.id
if (-not $siteId) {
    throw "Site not found for hostname: $SiteHostname"
}

$createQuery = @'
mutation CreatePage($siteId: UUID!, $path: String!, $title: String!, $content: String!, $editor: String!, $locale: String!, $publishState: PagePublishState!, $description: String!) {
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
}
'@

$vars = @{
    siteId       = $siteId
    path         = $PagePath
    title        = $title
    content      = $content
    description  = "How to use PowerShell with the Wiki.js API to update or create pages."
    editor       = "markdown"
    locale       = "en"
    publishState = "published"
}
$result = Invoke-WikiGraphQL -Query $createQuery -Variables $vars

if (-not $result.createPage.operation.succeeded) {
    throw "Create page failed: $($result.createPage.operation.message)"
}

Write-Host "Created wiki page: $($result.createPage.page.path) (id: $($result.createPage.page.id))"
Write-Output $result.createPage.page
