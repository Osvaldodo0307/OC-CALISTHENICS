export type ServiceItem = {
  id: string
  title: string
  subtitle?: string
  description: string
  price?: string
  summaryChips?: string[]
  details?: string[]
  sections?: { title: string; lines: string[] }[]
  note?: string
  image?: string
  ctaLabel?: string
}

export type ServicePanel = {
  id: 'oc-gym' | 'acceso-total' | 'clases' | 'recovery-lab'
  title: string
  description: string
  panelImage?: string
  panelImageAlt?: string
  panelImageFit?: 'cover' | 'contain'
  imagePosition?: string
  imageOpacity?: number
  statusLabel?: string
  featured?: boolean
  categoryChips?: string[]
  panelCtaLabel?: string
  showItemImages?: boolean
  items: ServiceItem[]
}

export const membershipFees = 'Inscripción única: $500 · Reinscripción: $250'

export const clubServicePanels: ServicePanel[] = [
  {
    id: 'oc-gym',
    title: 'Planes OC GYM',
    description: 'Entrenamiento en gimnasio con opciones flexibles.',
    panelImage: '/Actualizacion/PlanesOC/OC-GYM.png',
    panelImageAlt: 'Área de entrenamiento OC GYM',
    panelImageFit: 'cover',
    imagePosition: 'center 38%',
    imageOpacity: 0.26,
    statusLabel: 'Panel activo',
    featured: true,
    categoryChips: ['Básico', 'Premium', 'Anualidad'],
    panelCtaLabel: 'Ver planes',
    showItemImages: true,
    items: [
      {
        id: 'oc-basico',
        title: 'OC GYM BÁSICO',
        price: '$600 / mes',
        image: '/Actualizacion/PlanesOC/OCGYM/Basico.png',
        description:
          'Ideal para entrenar por tu cuenta con acceso al área de gimnasio y apoyo general de coach de piso.',
        summaryChips: [
          'Instalaciones',
          'Agua',
          'Coach de piso',
          'Regaderas',
          'Cancelación inmediata',
        ],
        note: 'No incluye: Clases, Sauna.',
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'oc-premium',
        title: 'OC GYM PREMIUM',
        price: '$950 / mes',
        image: '/Actualizacion/PlanesOC/OCGYM/Premium.png',
        description: 'Para quienes buscan entrenamiento de gimnasio con beneficios de recuperación incluidos.',
        summaryChips: ['Todo lo del básico', 'Sauna', 'Presoterapia'],
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'oc-anualidad',
        title: 'ANUALIDAD OC GYM',
        image: '/Actualizacion/PlanesOC/OCGYM/Anualidad.png',
        description: 'Plan anual para quienes buscan continuidad y mejor precio por permanencia.',
        summaryChips: ['$3,999 TDD/efectivo', '$5,760 TDC hasta 3 MSI'],
        ctaLabel: 'Solicitar información',
      },
    ],
  },
  {
    id: 'acceso-total',
    title: 'Acceso Total',
    description: 'Todo el club en una sola membresía.',
    panelImage: '/Actualizacion/PlanesOC/Acceso Total.png',
    panelImageAlt: 'Experiencia premium Acceso Total OC Club',
    panelImageFit: 'cover',
    imagePosition: 'center 32%',
    imageOpacity: 0.24,
    statusLabel: 'Ver detalles',
    categoryChips: ['Mensual', '6 meses', '18 meses'],
    panelCtaLabel: 'Ver acceso',
    showItemImages: true,
    items: [
      {
        id: 'acceso-total-mensual',
        title: 'Acceso Total Mensual',
        price: '$2,100 / mes',
        image: '/Actualizacion/PlanesOC/Acceso total/Mensual.png',
        description: 'Plan mensual con acceso premium completo al club.',
        ctaLabel: 'Solicitar información',
        summaryChips: ['Todo el club', 'Clases', 'Sauna', 'Toalla', 'Café', 'Regaderas', 'Agua', 'INBODY 1/mes', '3 visitas'],
      },
      {
        id: 'acceso-total-6m',
        title: 'Acceso Total 6 meses',
        price: '$12,600',
        image: '/Actualizacion/PlanesOC/Acceso total/6 meses.png',
        description: 'Plan semestral para continuidad y ahorro frente al pago mensual.',
        ctaLabel: 'Solicitar información',
        summaryChips: ['Todo el club', 'Clases', 'Sauna', 'Toalla', 'Café', 'Regaderas', 'Agua', 'INBODY 1/mes', '3 visitas'],
      },
      {
        id: 'acceso-total-18m',
        title: 'Acceso Total 18 meses',
        price: '$25,200',
        image: '/Actualizacion/PlanesOC/Acceso total/18 meses.png',
        description: 'Plan de largo plazo para máximo rendimiento y permanencia.',
        ctaLabel: 'Solicitar información',
        summaryChips: ['Todo el club', 'Clases', 'Sauna', 'Toalla', 'Café', 'Regaderas', 'Agua', 'INBODY 1/mes', '3 visitas'],
      },
    ],
  },
  {
    id: 'clases',
    title: 'Clases',
    description: 'Entrena por disciplina o por paquete.',
    panelImage: '/Actualizacion/PlanesOC/Clases.png',
    panelImageAlt: 'Clases y academia deportiva OC Club',
    panelImageFit: 'cover',
    imagePosition: 'center 35%',
    imageOpacity: 0.28,
    statusLabel: 'Ver detalles',
    categoryChips: ['Hyrox', 'Powerlifting', 'Paquetes'],
    panelCtaLabel: 'Ver clases',
    showItemImages: true,
    items: [
      {
        id: 'clase-hyrox',
        title: 'HYROX',
        image: '/Actualizacion/PlanesOC/Clases/Hyrox.png',
        description: 'Modalidad enfocada en entrenamiento híbrido de fuerza, resistencia y rendimiento funcional.',
        summaryChips: ['VIP', 'BASIC', 'Visita $350', 'Mensual desde $999', 'Semestral hasta $6,900'],
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'clase-powerlifting',
        title: 'POWERLIFTING',
        image: '/Actualizacion/PlanesOC/Clases/Powerlifting.png',
        description: 'Entrenamiento de fuerza máxima orientado a sentadilla, press banca y peso muerto.',
        summaryChips: ['VIP', 'BASIC', 'Visita $350', 'Mensual desde $899', 'Semestral hasta $6,000'],
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'clase-paquetes',
        title: 'PAQUETES POR CLASE',
        image: '/Actualizacion/PlanesOC/Clases/Paquetes por clase.png',
        description: 'Entrena a tu ritmo, sin ataduras.',
        summaryChips: ['1 clase $250', '4 clases $800', '8 clases $1,280', '16 clases $2,400', '20 clases $2,800'],
        note: 'Válido para: Kickboxing, Box, Calistenia, Funcional, Explosive, Karate, Gym y Militarizado.',
        ctaLabel: 'Solicitar información',
      },
    ],
  },
  {
    id: 'recovery-lab',
    title: 'Recovery Lab',
    description: 'Recuperación, evaluación y bienestar.',
    panelImage: '/Actualizacion/PlanesOC/Recovery Lab.png',
    panelImageAlt: 'Servicios de recuperación Recovery Lab OC Club',
    panelImageFit: 'cover',
    imagePosition: 'center center',
    imageOpacity: 0.22,
    statusLabel: 'Ver detalles',
    categoryChips: ['Sauna', 'Hielo', 'Fisioterapia', 'Normatec'],
    panelCtaLabel: 'Ver recovery',
    showItemImages: true,
    items: [
      {
        id: 'recovery-paquete',
        title: 'PAQUETE RECOVERY',
        image: '/Actualizacion/PlanesOC/Recovery LAB/Paquete Recovery.png',
        description: 'Sauna, presoterapia y tina de hielo en una experiencia integral de recuperación.',
        summaryChips: [
          '15 min: $150 / $1,200',
          '30 min: $260 / $2,100',
          '45 min: $340 / $2,800',
          '60 min: $420 / $3,400',
          'Basic $2,200',
          'Pro $3,300',
          'Elite $4,400',
        ],
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'recovery-sauna',
        title: 'SAUNA',
        image: '/Actualizacion/PlanesOC/Recovery LAB/Sauna.png',
        description: 'Sesiones de recuperación y relajación muscular.',
        summaryChips: ['15 min: $80 / $700', '30 min: $150 / $1,300', '45 min: $180 / $1,700', '60 min: $200 / $1,900'],
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'recovery-hielo',
        title: 'TINA DE HIELO',
        image: '/Actualizacion/PlanesOC/Recovery LAB/Tina de hielo.png',
        description: 'Exposición al frío como apoyo a procesos de recuperación.',
        note: 'Pendiente: confirmar precios específicos si serán distintos al Paquete Recovery.',
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'recovery-fisio',
        title: 'FISIOTERAPIA',
        image: '/Actualizacion/PlanesOC/Recovery LAB/Fisioterapia.png',
        description: 'Atención orientada a movilidad, rehabilitación y readaptación deportiva.',
        summaryChips: [
          'Valoración 60 min',
          'Sesión fisio 50 min',
          'Rehabilitación 60 min',
          'Ondas de choque 20 min',
          'Radiofrecuencia 30 min',
          'Plan 8 sesiones',
          'Plan 12 sesiones',
        ],
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'recovery-nutri',
        title: 'NUTRIÓLOGO',
        image: '/Actualizacion/PlanesOC/Recovery LAB/Nutriologo.png',
        description: 'Orientación nutricional para acompañar objetivos de rendimiento y composición corporal.',
        note: 'Pendiente: confirmar precios y paquetes específicos.',
        summaryChips: ['Rendimiento', 'Composición corporal', 'Nutrición estratégica', 'Plan personalizado'],
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'recovery-inbody',
        title: 'INBODY',
        image: '/Actualizacion/PlanesOC/Recovery LAB/INBODY.png',
        description: 'Evaluación de composición corporal para medir progreso real.',
        summaryChips: ['1 aplicación: $300', '2: $560', '4: $1,040', '6: $1,380', '8: $1,680', '10: $2,000'],
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'recovery-presoterapia',
        title: 'PRESOTERAPIA NORMATEC',
        image: '/Actualizacion/PlanesOC/Recovery LAB/Presoterapia.png',
        description: 'Sistema de compresión dinámica profesional para recuperación muscular.',
        summaryChips: ['Menos fatiga', 'Mayor rendimiento', 'Mejor circulación', 'Recuperación real', 'Primera sesión: $499', '10 sesiones: $4,990'],
        ctaLabel: 'Solicitar información',
      },
    ],
  },
]

export const conveniosData = {
  certificaciones: [
    {
      name: 'CCDF',
      description: 'Certificaciones y alianzas formativas con CCDF.',
      logo: '/Actualizacion/Convenios/CCDF.jpeg',
    },
  ],
  patrocinadores: [
    {
      name: 'TEAM YOURI YESHUA',
      subtitle: 'WORLD STRONG MAN',
      logo: '/Actualizacion/Convenios/TEAM_YOURI_YESHUA.jpeg',
    },
    {
      name: 'SPACE SIG',
      logo: '/Actualizacion/Convenios/SPACE_SIG.jpeg',
    },
  ],
}
