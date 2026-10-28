import { build } from 'vite'
import { readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = path.join(root, 'dist')
const temporary = path.join(root, '.seo-build')
const escape = (value) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

try {
  await build({
    root,
    publicDir: false,
    build: { ssr: 'src/entry-seo.tsx', outDir: temporary, emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'entry-seo.mjs' } } },
    logLevel: 'warn',
  })
  const { renderPage, publicPages, gymSchema, SITE_URL, SITE_IMAGE } = await import(pathToFileURL(path.join(temporary, 'entry-seo.mjs')).href)
  const template = await readFile(path.join(dist, 'index.html'), 'utf8')
  // The application/store fallback must not contain the gym homepage or its canonical.
  await writeFile(path.join(dist, 'spa.html'), template)

  for (const [route, seo] of Object.entries(publicPages)) {
    const canonical = `${SITE_URL}${route}`
    let html = template.replace(/<title>.*?<\/title>/s, `<title>${escape(seo.title)}</title>`)
    const updateMeta = (attribute, key, value) => {
      const tag = `<meta ${attribute}="${key}" content="${escape(value)}" />`
      const pattern = new RegExp(`<meta ${attribute}="${key}" content="[^"]*"\\s*\\/?>(?:\\r?\\n)?`)
      html = pattern.test(html) ? html.replace(pattern, `${tag}\n`) : html.replace('</head>', `${tag}\n</head>`)
    }
    updateMeta('name', 'description', seo.description)
    updateMeta('name', 'robots', seo.index ? 'index, follow, max-image-preview:large' : 'noindex, follow')
    for (const [key, value] of Object.entries({ 'og:title': seo.title, 'og:description': seo.description, 'og:url': canonical, 'og:image': SITE_IMAGE })) updateMeta('property', key, value)
    for (const [key, value] of Object.entries({ 'twitter:title': seo.title, 'twitter:description': seo.description, 'twitter:image': SITE_IMAGE })) updateMeta('name', key, value)
    const schema = seo.index ? `<script id="oc-local-business" type="application/ld+json">${JSON.stringify(gymSchema).replace(/</g, '\\u003c')}</script>` : ''
    html = html.replace('</head>', `<link rel="canonical" href="${canonical}" />\n${schema}\n</head>`)
    html = html.replace('<div id="root"></div>', () => `<div id="root">${renderPage(route)}</div>`)
    // Netlify's Pretty URLs serve /clases.html as /clases before SPA rewrites.
    const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`
    await writeFile(path.join(dist, file), html)
  }

  const urls = Object.entries(publicPages).filter(([, seo]) => seo.index).map(([route]) => `  <url><loc>${SITE_URL}${route}</loc></url>`).join('\n')
  await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
  // Crawlers can read the noindex response on login/private/cart routes.
  await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
  const notFound = template.replace(/<title>.*?<\/title>/s, '<title>Página no encontrada | OC-CLUB</title>')
    .replace('</head>', '<meta name="robots" content="noindex, follow" />\n</head>')
    .replace('<div id="root"></div>', '<div id="root"><main><h1>Página no encontrada</h1><a href="/">Volver a OC-CLUB</a></main></div>')
  await writeFile(path.join(dist, '404.html'), notFound)
  console.log(`SEO: ${Object.keys(publicPages).length} public HTML pages and ${Object.values(publicPages).filter((page) => page.index).length} sitemap URLs generated.`)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
