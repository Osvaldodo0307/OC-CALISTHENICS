/**
 * Catálogo de certificaciones del equipo OC.
 *
 * Las imágenes viven en `public/tienda/imagenes/certificaciones/` y se sirven
 * como assets estáticos. Para agregar una certificación nueva:
 *
 *  1. Subir la(s) imagen(es) a `public/tienda/imagenes/certificaciones/`.
 *  2. Agregar una entrada nueva al arreglo `CERTIFICACIONES` con:
 *     - `id` (kebab-case único),
 *     - `nombre` (texto visible),
 *     - `emisor` opcional (institución que emite),
 *     - `fotos` con `src` (ruta pública) y `alt` descriptivo.
 *
 * No se hace `import.meta.glob` aquí porque los archivos viven en `public/`
 * y queremos control explícito de orden + textos accesibles por foto.
 */

export interface CertificacionFoto {
  src: string
  alt: string
}

export interface Certificacion {
  id: string
  nombre: string
  emisor?: string
  resumen?: string
  fotos: CertificacionFoto[]
}

const BASE = '/tienda/imagenes/certificaciones'

export const CERTIFICACIONES: Certificacion[] = [
  {
    id: 'nutricion-entrenamiento-funcional',
    nombre: 'Nutrición y entrenamiento funcional',
    fotos: [
      {
        src: `${BASE}/Nutrición y entrenamiento funcional.jpeg`,
        alt: 'Diploma de Nutrición y entrenamiento funcional — anverso',
      },
      {
        src: `${BASE}/Nutrición y entrenamiento funcional2.jpeg`,
        alt: 'Diploma de Nutrición y entrenamiento funcional — reverso',
      },
    ],
  },
  {
    id: 'psicologia-deportiva',
    nombre: 'Psicología deportiva',
    fotos: [
      {
        src: `${BASE}/Psicoloía deportiva.jpeg`,
        alt: 'Diploma de Psicología deportiva — anverso',
      },
      {
        src: `${BASE}/Psicoloía deportiva2.jpeg`,
        alt: 'Diploma de Psicología deportiva — reverso',
      },
    ],
  },
]
