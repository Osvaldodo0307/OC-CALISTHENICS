/**
 * Capturas homepage replantada (hero, medio, cierre) — desktop y mobile.
 * Uso: vite preview --port 4180 && node docs/brand-qa/capture-home-v2.mjs http://127.0.0.1:4180
 */
import { chromium } from 'playwright'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const base = process.argv[2] || 'http://127.0.0.1:4180'
const out = (name) => join(__dirname, `home-v2-${name}.png`)

const browser = await chromium.launch()
const page = await browser.newPage()

await page.setViewportSize({ width: 1440, height: 900 })
await page.goto(base, { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(1200)
await page.screenshot({ path: out('desktop-hero'), type: 'png' })

await page.evaluate(() => window.scrollTo(0, 2200))
await page.waitForTimeout(500)
await page.screenshot({ path: out('desktop-mid'), type: 'png' })

await page.evaluate(() => window.scrollTo(0, 99999))
await page.waitForTimeout(400)
await page.screenshot({ path: out('desktop-cta-footer'), type: 'png' })

await page.setViewportSize({ width: 390, height: 844 })
await page.goto(base, { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(1000)
await page.screenshot({ path: out('mobile-hero'), type: 'png' })

await page.evaluate(() => window.scrollTo(0, 2400))
await page.waitForTimeout(400)
await page.screenshot({ path: out('mobile-mid'), type: 'png' })

await page.evaluate(() => window.scrollTo(0, 99999))
await page.waitForTimeout(400)
await page.screenshot({ path: out('mobile-cta'), type: 'png' })

await browser.close()
console.log('OK', base)
