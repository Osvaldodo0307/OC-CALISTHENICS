const STORAGE_KEY = 'oc-utm-attribution'

export type UtmFields = {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  page_path: string
}

function emptyUtm(): UtmFields {
  return {
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    page_path: '',
  }
}

function readStored(): UtmFields {
  if (typeof window === 'undefined') return emptyUtm()
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyUtm()
    return { ...emptyUtm(), ...JSON.parse(raw) }
  } catch {
    return emptyUtm()
  }
}

/**
 * Lee UTMs de la URL (si existen), los persiste en la sesión y devuelve
 * el path actual para atribución en el formulario de leads.
 */
export function syncUtmAttribution(): UtmFields {
  if (typeof window === 'undefined') return emptyUtm()

  const params = new URLSearchParams(window.location.search)
  const stored = readStored()
  const hasNewUtm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].some((key) =>
    params.has(key),
  )

  const merged: UtmFields = {
    utm_source: params.get('utm_source') ?? stored.utm_source ?? '',
    utm_medium: params.get('utm_medium') ?? stored.utm_medium ?? '',
    utm_campaign: params.get('utm_campaign') ?? stored.utm_campaign ?? '',
    utm_content: params.get('utm_content') ?? stored.utm_content ?? '',
    page_path: `${window.location.pathname}${window.location.search}`,
  }

  if (hasNewUtm || !sessionStorage.getItem(STORAGE_KEY)) {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        utm_source: merged.utm_source,
        utm_medium: merged.utm_medium,
        utm_campaign: merged.utm_campaign,
        utm_content: merged.utm_content,
        page_path: merged.page_path,
      }),
    )
  }

  return {
    ...merged,
    page_path: `${window.location.pathname}${window.location.search}`,
  }
}
