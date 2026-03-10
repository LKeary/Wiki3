import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.WIKI_ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.WIKI_ADMIN_PASSWORD || '12345678'
// After globalSetup runs once, admin password is NewPass123!; use that for login test so it passes.
const ADMIN_PASSWORD_FOR_LOGIN = process.env.WIKI_ADMIN_PASSWORD || 'NewPass123!'

test.describe('Auth', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Login to continue')).toBeVisible()
  })

  test('login form accepts credentials and submit triggers navigation or next step', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('textbox', { name: /email|e-mail/i }).fill(ADMIN_EMAIL)
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD_FOR_LOGIN)
    await page.getByRole('button', { name: /login/i }).click()

    // Within 15s we should either leave /login or see the change-password view (first-time admin)
    await Promise.race([
      page.waitForURL(url => !url.pathname.includes('login'), { timeout: 15_000 }),
      page.getByRole('button', { name: 'auth.changePwd.proceed' }).waitFor({ state: 'visible', timeout: 15_000 }),
    ])
  })

  test('home page loads (login or app)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    // Either redirects to login or shows app; either way we get meaningful content
    await expect(page.locator('body')).toBeVisible()
    const url = page.url()
    const hasLogin = url.includes('/login') || (await page.getByText(/Login to continue|auth\./).first().isVisible().catch(() => false))
    const hasContent = await page.locator('main, .q-drawer, .q-page, [class*="layout"], .auth').first().isVisible().catch(() => false)
    expect(hasLogin || hasContent).toBeTruthy()
  })
})
