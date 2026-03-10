import { test as base } from '@playwright/test'

const ADMIN_EMAIL = process.env.WIKI_ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.WIKI_ADMIN_PASSWORD || '12345678'
const ADMIN_PASSWORD_NEW = process.env.WIKI_ADMIN_PASSWORD_NEW || 'NewPass123!'

/**
 * Performs full login: credentials + optional change-password step.
 * Use this in beforeAll so all tests in the run share the same logged-in context.
 */
export async function fullLogin(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByRole('textbox', { name: /email|e-mail/i }).fill(ADMIN_EMAIL)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /login/i }).click()

  const changePwdProceed = page.getByRole('button', { name: 'auth.changePwd.proceed' })
  const changePwdVisible = await changePwdProceed.waitFor({ state: 'visible', timeout: 12_000 }).then(() => true).catch(() => false)
  if (changePwdVisible) {
    await page.getByRole('textbox', { name: 'auth.changePwd.newPassword' }).fill(ADMIN_PASSWORD_NEW)
    await page.getByRole('textbox', { name: 'auth.changePwd.newPasswordVerify' }).fill(ADMIN_PASSWORD_NEW)
    await changePwdProceed.click()
    await page.waitForURL(url => !url.pathname.includes('login'), { timeout: 15_000 })
  }

  await page.waitForLoadState('networkidle').catch(() => {})
}

export const test = base.extend<{ loggedInPage: import('@playwright/test').Page }>({
  loggedInPage: async ({ page }, use) => {
    await fullLogin(page)
    await use(page)
  },
})

export { expect } from '@playwright/test'
