export type ServiceItem = {
  id: string
  title: string
  subtitle?: string
  description: string
  price?: string
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
  showItemImages?: boolean
  items: ServiceItem[]
}

export const membershipFees = 'Inscripción única: $500 · Reinscripción: $250'

export const clubServicePanels: ServicePanel[] = [
  {
    id: 'oc-gym',
    title: 'Planes OC GYM',
    description: 'Entrenamiento en gimnasio con opciones flexibles.',
    panelImage: '/Actualizacion/Paneles/OCGYM.jpeg',
    showItemImages: false,
    items: [
      {
        id: 'oc-basico',
        title: 'OC GYM BÁSICO',
        price: '$600 / mes',
        description:
          'Ideal para entrenar por tu cuenta con acceso al área de gimnasio y apoyo general de coach de piso.',
        details: [
          'Uso de instalaciones.',
          'Agua: trae tu botella, nosotros la llenamos.',
          'Coach de piso con rutina general.',
          'Regaderas.',
          'Cancelación inmediata.',
        ],
        sections: [{ title: 'No incluye', lines: ['Clases.', 'Sauna.'] }],
      },
      {
        id: 'oc-premium',
        title: 'OC GYM PREMIUM',
        price: '$950 / mes',
        description: 'Para quienes buscan entrenamiento de gimnasio con beneficios de recuperación incluidos.',
        details: ['Incluye todo lo del básico.', 'Sauna.', '1 sesión de presoterapia.'],
      },
      {
        id: 'oc-anualidad',
        title: 'ANUALIDAD OC GYM',
        description: 'Plan anual para quienes buscan continuidad y mejor precio por permanencia.',
        sections: [
          {
            title: 'Precios',
            lines: [
              '$3,999 pago en una sola exhibición con TDD (tarjeta de débito) o efectivo.',
              '$5,760 pago con TDC (tarjeta de crédito) hasta 3 meses sin intereses.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'acceso-total',
    title: 'Acceso Total',
    description: 'Todo el club en una sola membresía.',
    panelImage: '/Actualizacion/Paneles/OCGYM.jpeg',
    showItemImages: false,
    items: [
      {
        id: 'acceso-total-mensual',
        title: 'Acceso Total Mensual',
        price: '$2,100 / mes',
        description: 'Plan mensual con acceso premium completo al club.',
        ctaLabel: 'Solicitar información',
        details: [
          'Acceso a todo el club.',
          'Clases incluidas.',
          'Sauna.',
          'Servicio de toalla.',
          'Café.',
          'Regaderas.',
          'Servicio de agua.',
          '1 sesión de salud INBODY por mes.',
          'Visitas: hasta 3 por invitado.',
        ],
      },
      {
        id: 'acceso-total-6m',
        title: 'Acceso Total 6 meses',
        price: '$12,600',
        description: 'Plan semestral para continuidad y ahorro frente al pago mensual.',
        ctaLabel: 'Solicitar información',
        details: [
          'Acceso a todo el club.',
          'Clases incluidas.',
          'Sauna.',
          'Servicio de toalla.',
          'Café.',
          'Regaderas.',
          'Servicio de agua.',
          '1 sesión de salud INBODY por mes.',
          'Visitas: hasta 3 por invitado.',
        ],
      },
      {
        id: 'acceso-total-18m',
        title: 'Acceso Total 18 meses',
        price: '$25,200',
        description: 'Plan de largo plazo para máximo rendimiento y permanencia.',
        ctaLabel: 'Solicitar información',
        details: [
          'Acceso a todo el club.',
          'Clases incluidas.',
          'Sauna.',
          'Servicio de toalla.',
          'Café.',
          'Regaderas.',
          'Servicio de agua.',
          '1 sesión de salud INBODY por mes.',
          'Visitas: hasta 3 por invitado.',
        ],
      },
    ],
  },
  {
    id: 'clases',
    title: 'Clases',
    description: 'Entrena por disciplina o por paquete.',
    panelImage: '/Actualizacion/Paneles/OCGYM.jpeg',
    showItemImages: false,
    items: [
      {
        id: 'clase-hyrox',
        title: 'HYROX',
        description: 'Modalidad enfocada en entrenamiento híbrido de fuerza, resistencia y rendimiento funcional.',
        sections: [
          {
            title: 'OC-HYROX VIP',
            lines: [
              'Visita: $350',
              'Mensual: $1,450',
              'Bimestral: $2,700',
              'Trimestral: $3,600',
              'Semestral: $6,900',
              'Incluye: Sauna, Gym y servicios premium.',
            ],
          },
          {
            title: 'OC-HYROX BASIC',
            lines: [
              'Mensual: $999',
              'Bimestral: $1,899',
              'Trimestral: $2,699',
              'Semestral: $5,280',
              'Anualidad: $10,200',
              'Incluye: Área de HYROX, regaderas, agua (trae tu termo) y 1 visita semanal.',
            ],
          },
        ],
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'clase-powerlifting',
        title: 'POWERLIFTING',
        description: 'Entrenamiento de fuerza máxima orientado a sentadilla, press banca y peso muerto.',
        sections: [
          {
            title: 'OC-POWER VIP',
            lines: [
              'Visita: $350',
              'Mensual: $1,200',
              'Bimestral: $2,250',
              'Trimestral: $3,300',
              'Semestral: $6,000',
              'Incluye: Gym, sauna y servicios premium.',
            ],
          },
          {
            title: 'OC-POWER BASIC',
            lines: [
              'Mensual: $899',
              'Bimestral: $1,699',
              'Trimestral: $2,399',
              'Semestral: $4,200',
              'Anualidad: $7,800',
              'Incluye: Área de powerlifting, regaderas, agua (trae tu termo) y 1 visita semanal.',
            ],
          },
        ],
        ctaLabel: 'Solicitar información',
      },
      {
        id: 'clase-paquetes',
        title: 'PAQUETES POR CLASE',
        description: 'Entrena a tu ritmo, sin ataduras.',
        sections: [
          {
            title: 'Costos',
            lines: ['1 clase: $250', '4 clases: $800', '8 clases: $1,280', '16 clases: $2,400', '20 clases: $2,800'],
          },
          {
            title: 'Clases válidas',
            lines: ['Kickboxing', 'Box', 'Calistenia', 'Funcional', 'Explosive', 'Karate', 'Gym', 'Militarizado'],
          },
        ],
        ctaLabel: 'Solicitar información',
      },
    ],
  },
  {
    id: 'recovery-lab',
    title: 'Recovery Lab',
    description: 'Recuperación, evaluación y bienestar.',
    panelImage: '/Actualizacion/Paneles/OCGYM.jpeg',
    showItemImages: false,
    items: [
      {
        id: 'recovery-paquete',
        title: 'PAQUETE RECOVERY',
        description: 'Sauna, presoterapia y tina de hielo en una experiencia integral de recuperación.',
        sections: [
          {
            title: 'Sesión individual / paquete de 10',
            lines: [
              '15 min: $150 / $1,200',
              '30 min: $260 / $2,100',
              '45 min: $340 / $2,800',
              '60 min: $420 / $3,400',
            ],
          },
          {
            title: 'Membresías Recovery',
            lines: [
              'Recovery Basic: $2,200 / mes — 8 sesiones, acceso total.',
              'Recovery Pro: $3,300 / mes — 12 sesiones, sauna + hielo + Normatec.',
              'Recovery Elite: $4,400 / mes — sesión ilimitada, plan integral.',
            ],
          },
        ],
      },
      {
        id: 'recovery-sauna',
        title: 'SAUNA',
        description: 'Sesiones de recuperación y relajación muscular.',
        sections: [
          {
            title: 'Sesión individual / paquete de 10',
            lines: [
              '15 min: $80 / $700',
              '30 min: $150 / $1,300',
              '45 min: $180 / $1,700',
              '60 min: $200 / $1,900',
            ],
          },
        ],
      },
      {
        id: 'recovery-hielo',
        title: 'TINA DE HIELO',
        description: 'Exposición al frío como apoyo a procesos de recuperación.',
        note: 'Pendiente: confirmar precios específicos si serán distintos al Paquete Recovery.',
      },
      {
        id: 'recovery-fisio',
        title: 'FISIOTERAPIA',
        description: 'Atención orientada a movilidad, rehabilitación y readaptación deportiva.',
        sections: [
          {
            title: 'Servicios',
            lines: [
              'Valoración inicial + diagnóstico funcional — 60 min',
              'Sesión individual de fisioterapia — 50 min',
              'Rehabilitación post lesión — 60 min',
              'Readaptación deportiva en gimnasio — 60 min',
              'Terapia manual + liberación miofascial — 50 min',
              'Ondas de choque — 20 min',
              'Sesión de radiofrecuencia — 30 min',
              'Punción seca por grupo muscular — 20 min',
              'Electroterapia / ultrasonido — 30 min',
              'Vendaje neuromuscular — 20 min',
              'Sesión recovery post entrenamiento — 40 min',
              'Masaje deportivo premium, medio cuerpo — 50 min',
              'Plan mensual de rehabilitación — 8 sesiones',
              'Plan mensual elite — 12 sesiones',
            ],
          },
        ],
      },
      {
        id: 'recovery-nutri',
        title: 'NUTRIÓLOGO',
        description: 'Orientación nutricional para acompañar objetivos de rendimiento y composición corporal.',
        note: 'Pendiente: confirmar precios y paquetes específicos.',
      },
      {
        id: 'recovery-inbody',
        title: 'INBODY',
        description: 'Evaluación de composición corporal para medir progreso real.',
        sections: [
          {
            title: 'Costo normal',
            lines: ['1 aplicación: $300'],
          },
          {
            title: 'Promoción en paquetes',
            lines: [
              '2 aplicaciones: $560',
              '4 aplicaciones: $1,040',
              '6 aplicaciones: $1,380',
              '8 aplicaciones: $1,680',
              '10 aplicaciones: $2,000',
            ],
          },
        ],
      },
      {
        id: 'recovery-presoterapia',
        title: 'PRESOTERAPIA NORMATEC',
        description: 'Sistema de compresión dinámica profesional para recuperación muscular.',
        sections: [
          {
            title: 'Beneficios',
            lines: ['Menos fatiga', 'Mayor rendimiento', 'Mejor circulación', 'Recuperación real'],
          },
          {
            title: 'Programa Athlete',
            lines: ['Primera sesión: $499', '10 sesiones: $4,990'],
          },
        ],
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
