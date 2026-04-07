/**
 * Uso: dos instancias de vite preview (antes / después), p.ej. 4177 y 4178
 * node docs/brand-qa/capture-struct.mjs http://127.0.0.1:4178 after
 * node docs/brand-qa/capture-struct.mjs http://127.0.0.1:4177 before
 */
import { chromium } from 'playwright'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const baseUrl = process.argv[2] || 'http://127.0.0.1:4178'
const prefix = process.argv[3] || 'after'

const out = (name) => join(__dirname, `${prefix}-struct-${name}.png`)

const browser = await chromium.launch()
const page = await browser.newPage()

await page.setViewportSize({ width: 1440, height: 900 })
await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(400)
await page.screenshot({ path: out('desktop-hero-nav.png'), type: 'png' })

await page.evaluate(() => window.scrollTo(0, 1550))
await page.waitForTimeout(300)
await page.screenshot({ path: out('desktop-mid-sections.png'), type: 'png' })

await page.setViewportSize({ width: 390, height: 844 })
await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(400)
await page.screenshot({ path: out('mobile-hero.png'), type: 'png' })

await page.evaluate(() => window.scrollTo(0, 2000))
await page.waitForTimeout(300)
await page.screenshot({ path: out('mobile-body.png'), type: 'png' })

await browser.close()
console.log('OK', prefix, baseUrl)
