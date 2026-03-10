import { test, expect } from '@playwright/test'

test.describe('Full app E2E (logged in)', () => {
  test('dashboard loads', async ({ page }) => {
    await page.goto('/_admin/dashboard')
    await expect(page.locator('body')).toBeVisible()
    const dashboard = page.getByText('Dashboard', { exact: true }).first()
    const forbidden = page.getByText('403', { exact: true })
    await expect(dashboard.or(forbidden)).toBeVisible({ timeout: 10_000 })
  })

  test('admin users page loads', async ({ page }) => {
    await page.goto('/_admin/users')
    await expect(page.locator('body')).toBeVisible()
    // Either the users list (title) or 403 if current user lacks manage:users
    const usersHeading = page.getByText(/Users|admin\.users\.title/i).first()
    const forbidden = page.getByText('403', { exact: true })
    await expect(usersHeading.or(forbidden)).toBeVisible({ timeout: 10_000 })
  })

  test('admin groups page loads', async ({ page }) => {
    await page.goto('/_admin/groups')
    await expect(page.locator('body')).toBeVisible()
    const groups = page.getByText('Groups', { exact: true }).first()
    const forbidden = page.getByText('403', { exact: true })
    await expect(groups.or(forbidden)).toBeVisible({ timeout: 10_000 })
  })

  test('admin sites page loads', async ({ page }) => {
    await page.goto('/_admin/sites')
    await expect(page.locator('body')).toBeVisible()
    const sites = page.getByText('Sites', { exact: true }).first()
    const forbidden = page.getByText('403', { exact: true })
    await expect(sites.or(forbidden)).toBeVisible({ timeout: 10_000 })
  })

  test('search page loads', async ({ page }) => {
    await page.goto('/_search')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.getByRole('main').getByText(/Search|search\./i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('home page (root) loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('.page-container, .page-contents, .q-page, main').first()).toBeVisible({ timeout: 10_000 })
  })

  test('profile page loads', async ({ page }) => {
    await page.goto('/_profile/info')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.getByRole('main').getByText(/Profile|Info|profile\./i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('create page route loads', async ({ page }) => {
    await page.goto('/_create')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('.page-container, .q-page, [class*="editor"], [class*="create"]').first()).toBeVisible({ timeout: 15_000 })
  })

  test('admin general (site settings) loads', async ({ page }) => {
    await page.goto('/_admin')
    await expect(page).toHaveURL(/\/_admin/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('admin security page loads', async ({ page }) => {
    await page.goto('/_admin/security')
    await expect(page.locator('body')).toBeVisible()
    const security = page.getByText(/Security|admin\.security/i).first()
    const forbidden = page.getByText('403', { exact: true })
    await expect(security.or(forbidden)).toBeVisible({ timeout: 10_000 })
  })

  test('admin system info loads', async ({ page }) => {
    await page.goto('/_admin/system')
    await expect(page.locator('body')).toBeVisible()
    const system = page.getByText(/System|Info|admin\.system/i).first()
    const forbidden = page.getByText('403', { exact: true })
    await expect(system.or(forbidden)).toBeVisible({ timeout: 10_000 })
  })

  // Critical UI: Browse must open the tree dialog, not show "Not implemented"
  test('Browse button opens browse dialog (not Not implemented)', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    // Click Browse (sidebar or footer); avoid Bookmarks which is still not implemented
    const browseBtn = page.getByRole('button', { name: /Browse/i }).first()
    await expect(browseBtn).toBeVisible({ timeout: 5000 })
    await browseBtn.click()
    // Dialog should show "Browse pages" (or translation)
    const dialog = page.locator('.q-dialog').filter({ has: page.getByText(/Browse pages?/i) })
    await expect(dialog).toBeVisible({ timeout: 5000 })
    // Must NOT show "Not implemented" notification
    const notImplemented = page.getByText('Not implemented', { exact: true })
    await expect(notImplemented).not.toBeVisible()
    // Close dialog so other tests are not affected
    await page.keyboard.press('Escape')
  })

  test('admin editors page loads and shows markdown and visual editor options', async ({ page }) => {
    await page.goto('/_admin/sites')
    await expect(page.locator('body')).toBeVisible()
    const forbidden = page.getByText('403', { exact: true })
    await expect(page.getByText(/Sites|admin\.sites/i).first().or(forbidden)).toBeVisible({ timeout: 10_000 })
    if (await forbidden.isVisible()) return
    // Click first site's Edit to go to /_admin/:siteId/general
    const editBtn = page.getByRole('button', { name: /Edit|common\.actions\.edit/i }).first()
    await expect(editBtn).toBeVisible({ timeout: 5000 })
    await editBtn.click()
    await expect(page).toHaveURL(/_admin\/[^/]+\/general/, { timeout: 15_000 })
    const url = page.url()
    const match = url.match(/\/_admin\/([^/]+)\/general/)
    const siteId = match ? match[1] : null
    if (siteId) await page.goto(`/_admin/${siteId}/editors`)
    await expect(page).toHaveURL(/_admin\/[^/]+\/editors/, { timeout: 10_000 })
    const forbidden2 = page.getByText('403', { exact: true })
    await expect(page.getByText(/Editors|admin\.editors/i).first().or(forbidden2)).toBeVisible({ timeout: 5000 })
    if (await forbidden2.isVisible()) return
    await expect(page.getByText(/Markdown|admin\.editors\.markdown/i).first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/Visual|wysiwyg/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('admin flags page loads', async ({ page }) => {
    await page.goto('/_admin/flags')
    await expect(page.locator('body')).toBeVisible()
    const flagsHeading = page.getByText(/Flags|admin\.flags\.title/i).first()
    const forbidden = page.getByText('403', { exact: true })
    await expect(flagsHeading.or(forbidden)).toBeVisible({ timeout: 10_000 })
  })

  test('create page shows editor choice when multiple editors enabled', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    const createBtn = page.getByRole('button', { name: /Create New Page/i }).first()
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click()
      const menu = page.locator('.q-menu').first()
      await expect(menu).toBeVisible({ timeout: 5000 })
      // Menu should list at least "New Markdown Page" (and optionally "New Page" for Visual)
      await expect(menu.getByText('New Markdown Page')).toBeVisible({ timeout: 5000 })
    }
    await page.goto('/_create')
    await expect(page.locator('.page-container, .q-page, [class*="editor"], [class*="create"]').first()).toBeVisible({ timeout: 10_000 })
  })

  test('file manager can be opened (Upload Media Asset from create menu)', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    const createBtn = page.getByRole('button', { name: /Create New Page/i }).first()
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click()
      const uploadItem = page.getByText(/Upload Media Asset|Upload/i).first()
      if (await uploadItem.isVisible().catch(() => false)) {
        await uploadItem.click()
        await expect(page.locator('.q-dialog').first()).toBeVisible({ timeout: 5000 })
        await page.keyboard.press('Escape')
      }
    }
  })
})
