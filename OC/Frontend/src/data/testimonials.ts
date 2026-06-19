export type FeaturedTestimonial = {
  name: string
  discipline: string
  quote: string
}

/** Testimonios curados de socios del club (contenido estático hasta conectar backend). */
export const featuredTestimonials: FeaturedTestimonial[] = [
  {
    name: 'Osvaldo González',
    discipline: 'Calistenia',
    quote:
      'Llevo tiempo entrenando aquí y lo que más valoro es la constancia: hay horario, hay coach en el piso y te corrigen.',
  },
  {
    name: 'Jorge Ayala',
    discipline: 'Powerlifting',
    quote:
      'El ambiente es exigente pero sano. No es un gym donde entras y nadie te ve; aquí sí te conocen.',
  },
  {
    name: 'Héctor Nieto',
    discipline: 'Entrenamiento funcional',
    quote:
      'Me gusta que las clases tienen estructura. Sabes qué vas a hacer y con quién entrenas cada semana.',
  },
]
