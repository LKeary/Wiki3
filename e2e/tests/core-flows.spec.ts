import { test, expect } from '@playwright/test'

test.describe('Core flows', () => {
  test('home page loads without auth', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('body')).toBeVisible()
    const hasLogin = await page.getByText(/Login to continue|auth\./).first().isVisible().catch(() => false)
    const hasContent = await page.locator('main, .q-drawer, .q-page, [class*="layout"], .auth').first().isVisible().catch(() => false)
    expect(hasLogin || hasContent).toBeTruthy()
  })

  test('graphql endpoint responds', async ({ request }) => {
    const res = await request.get('/_graphql')
    expect([200, 400]).toContain(res.status())
  })

  test('assets or static route responds', async ({ request }) => {
    const res = await request.get('/')
    expect(res.status()).toBe(200)
  })
})
