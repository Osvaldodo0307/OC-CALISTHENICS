/** Public gym pages share these values at build time and during SPA navigation. */
export const SITE_URL = 'https://oc-club.netlify.app'
export const SITE_IMAGE = `${SITE_URL}/Actualizacion/CLUB/Gimnasio.jpeg`

export type PageSeo = {
  title: string
  description: string
  index: boolean
}

export const publicPages: Record<string, PageSeo> = {
  '/': {
    title: 'OC-CLUB | Gimnasio en Tlalpan, San Pedro Mártir, CDMX',
    description: 'Gimnasio OC-CLUB en Ejidos de San Pedro Mártir, Tlalpan. Calistenia, HYROX, powerlifting y Recovery Lab. Conoce las clases, horarios y membresías.',
    index: true,
  },
  '/club': {
    title: 'Gimnasio en San Pedro Mártir, Tlalpan | OC-CLUB',
    description: 'Conoce las instalaciones de OC-CLUB en Tlalpan, CDMX: gimnasio, zona de calistenia y Power Zone. Agenda una visita en Ejidos de San Pedro Mártir.',
    index: true,
  },
  '/clases': {
    title: 'Clases de calistenia, HYROX y fuerza en Tlalpan | OC-CLUB',
    description: 'Consulta las clases y horarios de OC-CLUB en Tlalpan: calistenia, HYROX, powerlifting y Open Gym. Entrenamiento grupal para todos los niveles.',
    index: true,
  },
  '/membresias': {
    title: 'Membresías de gimnasio en Tlalpan | OC-CLUB',
    description: 'Consulta los planes OC GYM, Acceso Total, clases y Recovery Lab de OC-CLUB en San Pedro Mártir, Tlalpan. Revisa precios, beneficios y horarios.',
    index: true,
  },
  '/equipo-comunidad': {
    title: 'Coaches y comunidad de entrenamiento en Tlalpan | OC-CLUB',
    description: 'Conoce al equipo de entrenamiento y a la comunidad OC-CLUB en Tlalpan, Ciudad de México. Acompañamiento para tus objetivos de fuerza y condición física.',
    index: true,
  },
  '/convenios': {
    title: 'Convenios y beneficios para socios | OC-CLUB Tlalpan',
    description: 'Consulta los convenios y aliados de OC-CLUB y sus beneficios para socios en servicios de salud, nutrición, recuperación y formación.',
    index: true,
  },
  '/experiencias': {
    title: 'Experiencias de la comunidad OC-CLUB en Tlalpan',
    description: 'Conoce las experiencias de socios de OC-CLUB en calistenia, powerlifting y entrenamiento funcional en Tlalpan, Ciudad de México.',
    index: true,
  },
  '/aviso-privacidad': {
    title: 'Aviso de privacidad | OC-CLUB',
    description: 'Consulta el aviso de privacidad y el tratamiento de datos personales en OC-CLUB.',
    index: false,
  },
  '/terminos': {
    title: 'Términos y condiciones | OC-CLUB',
    description: 'Consulta los términos y condiciones de los servicios de OC-CLUB.',
    index: false,
  },
}

export function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/'
}

export function pageSeo(pathname: string): PageSeo {
  const path = normalizePath(pathname)
  if (publicPages[path]) return publicPages[path]
  // Keep the separate storefront's public routes distinct from gym pages.
  if (path === '/tienda' || path === '/tienda/catalogo' || path === '/tienda/certificaciones' || path.startsWith('/tienda/producto/')) {
    return {
      title: 'OC-STORE | Equipamiento, suplementos y certificaciones',
      description: 'Consulta el catálogo OC-STORE de equipamiento de entrenamiento, suplementos y certificaciones. Confirma disponibilidad con el equipo.',
      index: true,
    }
  }
  return {
    title: 'OC-CLUB | Portal de socios',
    description: 'Acceso al portal de socios de OC-CLUB.',
    index: false,
  }
}

export const gymSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ExerciseGym',
      '@id': `${SITE_URL}/#gym`,
      name: 'OC-CLUB',
      alternateName: ['OC Club', 'OC Calisthenics'],
      url: `${SITE_URL}/`,
      image: SITE_IMAGE,
      logo: `${SITE_URL}/oc-club-logo.svg`,
      description: publicPages['/'].description,
      telephone: '+525567869589',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Lázaro Cárdenas 8, Ejidos de San Pedro Mártir',
        addressLocality: 'Tlalpan',
        addressRegion: 'Ciudad de México',
        postalCode: '14400',
        addressCountry: 'MX',
      },
      areaServed: 'Tlalpan, Ciudad de México',
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '06:00', closes: '23:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '08:00', closes: '16:00' },
      ],
      sameAs: ['https://instagram.com/oc_calisthenics', 'https://www.facebook.com/Oc_Calisthenics'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'OC-CLUB',
      alternateName: 'OC Club',
      inLanguage: 'es-MX',
      publisher: { '@id': `${SITE_URL}/#gym` },
    },
  ],
}
