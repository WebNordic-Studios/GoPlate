/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gp: {
          primary: '#F97316', // Vibrant Saffron
          secondary: '#064E3B', // Deep Forest Green
          bg: '#FDFCF7', // Warm Oat
          charcoal: '#1F2937', // Soft charcoal
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

