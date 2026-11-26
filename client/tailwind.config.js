/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0779B3', blueDark: '#05618F', cream: '#F3F0E7', ivory: '#FBFAF6',
          green: '#183F34', charcoal: '#1E2C27', slate: '#68766E', stone: '#D9DED4'
        }
      },
      fontFamily: {
        serif: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
};
