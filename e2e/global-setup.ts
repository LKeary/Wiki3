import { chromium, type FullConfig } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const ADMIN_EMAIL = process.env.WIKI_ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.WIKI_ADMIN_PASSWORD || '12345678'
const ADMIN_PASSWORD_NEW = process.env.WIKI_ADMIN_PASSWORD_NEW || 'NewPass123!'
const BASE_URL = process.env.WIKI_BASE_URL || 'http://localhost:3000'

async function globalSetup(_config: FullConfig) {
  fs.mkdirSync(path.join(process.cwd(), '.auth'), { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ baseURL: BASE_URL })
  try {
    await page.goto('/login')
    await page.getByRole('textbox', { name: /email|e-mail/i }).fill(ADMIN_EMAIL)
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: /login/i }).click()

    const changePwdProceed = page.getByRole('button', { name: 'auth.changePwd.proceed' })
    const changePwdVisible = await changePwdProceed.waitFor({ state: 'visible', timeout: 12_000 }).then(() => true).catch(() => false)
    if (changePwdVisible) {
      await page.getByRole('textbox', { name: 'auth.changePwd.newPassword', exact: true }).fill(ADMIN_PASSWORD_NEW)
      await page.getByRole('textbox', { name: 'auth.changePwd.newPasswordVerify' }).fill(ADMIN_PASSWORD_NEW)
      await changePwdProceed.click()
      await page.waitForURL(url => !url.pathname.includes('login'), { timeout: 15_000 })
    }

    await page.waitForLoadState('networkidle').catch(() => {})
    await page.context().storageState({ path: path.join(process.cwd(), '.auth/user.json') })
  } finally {
    await browser.close()
  }
}

export default globalSetup
