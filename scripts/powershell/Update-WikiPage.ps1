<#
.SYNOPSIS
    Get or update a Wiki.js page by path via the GraphQL API.

.DESCRIPTION
    Use this script to point at a page by path and either get its content,
    replace its content, or append data (e.g. from another PowerShell script).
    Requires an API key with write:pages (for update/append).

.PARAMETER BaseUrl
    Wiki.js base URL (e.g. http://localhost:3000 or https://wiki.example.com).

.PARAMETER ApiKey
    API key (Bearer token). Create under Administration -> API Keys.

.PARAMETER SiteHostname
    Hostname of the site (e.g. localhost or wiki.example.com). Used to resolve siteId.

.PARAMETER PagePath
    Page path without leading slash (e.g. home, team/dashboard, reports/weekly).

.PARAMETER GetOnly
    If set, only fetch the page and output content; do not update.

.PARAMETER Content
    New content (replace entire page content). Ignored if AppendContent is set.

.PARAMETER AppendContent
    Content to append to the existing page (after a newline).

.PARAMETER ReasonForChange
    Optional reason stored with the update.

.EXAMPLE
    # Get page content only
    .\Update-WikiPage.ps1 -BaseUrl http://localhost:3000 -ApiKey $env:WIKI_API_KEY -SiteHostname localhost -PagePath home -GetOnly

.EXAMPLE
    # Append data from a script
    $data = Get-SomeDataFromYourScript
    $block = "`n`n## Update $(Get-Date -Format 'yyyy-MM-dd')`n$data"
    .\Update-WikiPage.ps1 -BaseUrl http://localhost:3000 -ApiKey $env:WIKI_API_KEY -SiteHostname localhost -PagePath reports/daily -AppendContent $block

.EXAMPLE
    # Replace entire content
    .\Update-WikiPage.ps1 -BaseUrl http://localhost:3000 -ApiKey $env:WIKI_API_KEY -SiteHostname localhost -PagePath my-page -Content "# New content"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $BaseUrl,

    [Parameter(Mandatory = $true)]
    [string] $ApiKey,

    [Parameter(Mandatory = $true)]
    [string] $SiteHostname,

    [Parameter(Mandatory = $true)]
    [string] $PagePath,

    [switch] $GetOnly,

    [string] $Content,

    [string] $AppendContent,

    [string] $ReasonForChange = "Updated by PowerShell script"
)

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

# Resolve site ID
$siteQuery = 'query GetSite($hostname: String!) { siteByHostname(hostname: $hostname, exact: true) { id title } }'
$siteData = Invoke-WikiGraphQL -Query $siteQuery -Variables @{ hostname = $SiteHostname }
$siteId = $siteData.siteByHostname.id
if (-not $siteId) {
    throw "Site not found for hostname: $SiteHostname"
}

# Get page by path
$pageQuery = @'
query GetPage($siteId: UUID!, $path: String!) {
  pageByPath(siteId: $siteId, path: $path) {
    id path title content editor locale
  }
}
'@
$pageData = Invoke-WikiGraphQL -Query $pageQuery -Variables @{ siteId = $siteId; path = $PagePath }
$page = $pageData.pageByPath

if (-not $page) {
    throw "Page not found: $PagePath (siteId: $siteId)"
}

if ($GetOnly) {
    Write-Output $page.content
    exit 0
}

$newContent = $null
if ($AppendContent) {
    $newContent = $page.content + "`n`n" + $AppendContent
} elseif ($null -ne $Content) {
    $newContent = $Content
} else {
    throw "Specify -Content (replace) or -AppendContent (append), or use -GetOnly to only read."
}

$updateQuery = @'
mutation UpdatePage($id: UUID!, $patch: PageUpdateInput!) {
  updatePage(id: $id, patch: $patch) {
    operation { succeeded message }
    page { id path title updatedAt }
  }
}
'@
$patch = @{
    content         = $newContent
    reasonForChange = $ReasonForChange
}
$updateData = Invoke-WikiGraphQL -Query $updateQuery -Variables @{ id = $page.id; patch = $patch }

if (-not $updateData.updatePage.operation.succeeded) {
    throw "Update failed: $($updateData.updatePage.operation.message)"
}

Write-Host "Page updated: $($updateData.updatePage.page.path) (id: $($updateData.updatePage.page.id))"
Write-Output $updateData.updatePage.page
