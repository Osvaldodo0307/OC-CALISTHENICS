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
        'oc-dark': '#0a0a0a',
        'oc-metal': '#141414',
        'oc-panel': '#1a1a1a',
        'oc-red': '#D21F2D',
        'oc-red-deep': '#A91822',
        'oc-red-glow': 'rgba(210, 31, 45, 0.45)',
        'oc-light': '#ffffff',
        'oc-muted': '#a3a3a3',
        'oc-border': '#2a2a2a',
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Impact', 'Arial Narrow', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
