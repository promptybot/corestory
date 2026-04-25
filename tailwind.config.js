/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#edfaf5',
          100: '#d0f4e6',
          200: '#a3e8ce',
          300: '#6dd4b0',
          400: '#3ab88e',
          500: '#1D9E75',
          600: '#16805f',
          700: '#12664c',
          800: '#0e503c',
          900: '#093d2d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
