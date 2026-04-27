/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OC-CLUB (alineado al logo: rojo #D21F2D, negro, blanco)
        'oc-black': '#000000',
        /** Base landing: carbón profundo (sistema de superficies) */
        'oc-carbon': '#050505',
        'oc-dark': '#111111',
        /** Elevada: negro con tinte rojo muy sutil (no gris plano) */
        'oc-surface': '#0a0808',
        /** Acento vino: solo bandas puntuales */
        'oc-wine': '#10080a',
        'oc-metal': '#141414',
        'oc-panel': '#1a1a1a',
        'oc-red': '#E50914',
        'oc-red-deep': '#990000',
        'oc-red-glow': 'rgba(229, 9, 20, 0.45)',
        'oc-light': '#ffffff',
        'oc-muted': '#B8B8B8',
        'oc-border': '#2a2a2a',
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Impact', 'Arial Narrow', 'system-ui', 'sans-serif'],
        /** Titulares homepage comerciales */
        hero: ['Bebas Neue', 'Oswald', 'Impact', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
