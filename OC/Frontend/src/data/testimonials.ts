export type FeaturedTestimonial = {
  name: string
  discipline: string
  quote: string
}

/**
 * TODO: Conectar con backend/Supabase cuando exista endpoint real de opiniones.
 * Temporalmente se usan testimonios estaticos para landing y pagina de experiencias.
 */
export const featuredTestimonials: FeaturedTestimonial[] = [
  {
    name: 'Usuario OC',
    discipline: 'Calistenia',
    quote: 'Entrenar aqui me ayudo a ser constante y mejorar mi tecnica.',
  },
  {
    name: 'Usuario OC',
    discipline: 'Powerlifting',
    quote: 'El ambiente te exige, pero tambien te acompana.',
  },
  {
    name: 'Usuario OC',
    discipline: 'Entrenamiento funcional',
    quote: 'Me gusta que el entrenamiento se siente estructurado y con comunidad.',
  },
]
