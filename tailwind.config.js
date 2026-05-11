/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gp: {
          primary: '#F97316', // Vibrant Saffron
          secondary: 'rgb(var(--gp-secondary) / <alpha-value>)',
          bg: 'rgb(var(--gp-bg) / <alpha-value>)',
          surface: 'rgb(var(--gp-surface) / <alpha-value>)',
          charcoal: 'rgb(var(--gp-charcoal) / <alpha-value>)',
        },
      },
      borderRadius: {
        '2xl': '1.5rem',
      },
      boxShadow: {
        natural:
          '0 10px 30px -18px rgba(17, 24, 39, 0.35), 0 10px 18px -22px rgba(17, 24, 39, 0.25)',
        lift: '0 20px 40px -26px rgba(17, 24, 39, 0.45)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backdropBlur: {
        glass: '14px',
      },
    },
  },
  plugins: [],
}
