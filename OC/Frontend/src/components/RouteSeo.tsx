import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { gymSchema, normalizePath, pageSeo, publicPages, SITE_IMAGE, SITE_URL } from '../seo/site'

export default function RouteSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const path = normalizePath(pathname)
    const seo = pageSeo(path)
    const url = `${SITE_URL}${path}`
    const meta = (attribute: 'name' | 'property', key: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, key)
        document.head.append(element)
      }
      element.content = value
    }

    document.title = seo.title
    meta('name', 'description', seo.description)
    meta('name', 'robots', seo.index ? 'index, follow, max-image-preview:large' : 'noindex, follow')
    meta('property', 'og:title', seo.title)
    meta('property', 'og:description', seo.description)
    meta('property', 'og:url', url)
    meta('property', 'og:image', SITE_IMAGE)
    meta('name', 'twitter:title', seo.title)
    meta('name', 'twitter:description', seo.description)
    meta('name', 'twitter:image', SITE_IMAGE)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = url

    let schema = document.getElementById('oc-local-business')
    if (publicPages[path]?.index) {
      if (!schema) {
        schema = document.createElement('script')
        schema.id = 'oc-local-business'
        schema.setAttribute('type', 'application/ld+json')
        document.head.append(schema)
      }
      schema.textContent = JSON.stringify(gymSchema)
    } else {
      schema?.remove()
    }
  }, [pathname])

  return null
}
