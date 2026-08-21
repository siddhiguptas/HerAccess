/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf6f7',
          100: '#faeaec',
          200: '#f5d6da',
          300: '#ebb3bc',
          400: '#dd8595',
          500: '#c85a6a',
          600: '#a3364b',
          700: '#7e2437',
          800: '#641b2b',
          900: '#4f1421',
          950: '#2d0912',
        },
        warm: {
          50: '#fdfbf7',
          100: '#faf7f2',
          200: '#f4efe6',
          300: '#e9e2d5',
          400: '#d8cebd',
          500: '#b8aa94',
          600: '#92836d',
          700: '#6e6250',
          800: '#4d4436',
          900: '#2e2820',
        },
        rosewood: {
          500: '#8b2e46',
          600: '#6e1d32',
          700: '#541525',
          800: '#3c0d19',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}

