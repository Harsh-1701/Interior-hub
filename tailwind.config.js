/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FAF8F5',
          100: '#F4F0EA',
          200: '#E7DFC6',
          300: '#D8CCB5',
          400: '#C5B59A',
          500: '#AC9A7D',
          600: '#8E7C62',
          700: '#6E5F4A',
          800: '#4D4334',
          900: '#2F2920',
        },
        clay: {
          50: '#FBF6F3',
          100: '#F6EAE3',
          200: '#EBD2C4',
          300: '#DEB5A0',
          400: '#CE9378',
          500: '#B87352',
          600: '#9C5839',
          700: '#7E432A',
          800: '#5C311F',
          900: '#3D2014',
        },
        sage: {
          50: '#F4F6F4',
          100: '#E6EAE5',
          200: '#CDD7CC',
          300: '#AEC0AC',
          400: '#8DA48A',
          500: '#6F876C',
          600: '#566B54',
          700: '#41523F',
          800: '#2E3A2D',
          900: '#1C241B',
        },
        charcoal: {
          850: '#1F1E1D',
          900: '#181716',
          950: '#11100F',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
