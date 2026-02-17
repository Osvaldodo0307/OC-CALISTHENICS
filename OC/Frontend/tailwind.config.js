/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Branding OC-CALISTHENICS
        'oc-dark': '#070101',
        'oc-red': '#A43525',
        'oc-red-deep': '#6A100B',
        'oc-metal': '#2A0C0C',
        'oc-light': '#EBE0D7',
        'oc-muted': '#B5A497',
        'oc-border': '#2A0C0C',
      },
    },
  },
  plugins: [],
}
