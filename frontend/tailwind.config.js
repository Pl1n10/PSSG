/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#fad7a5',
          300: '#f6b96d',
          400: '#f19333',
          500: '#ee7812',
          600: '#df5e08',
          700: '#b94509',
          800: '#93370f',
          900: '#772f10',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e3eae3',
          200: '#c8d5c8',
          300: '#a0b8a0',
          400: '#759575',
          500: '#567856',
          600: '#435f43',
          700: '#374c37',
          800: '#2e3e2e',
          900: '#263326',
        },
        cream: '#fdfaf5',
        warmgray: {
          50: '#faf9f7',
          100: '#f0eeea',
          200: '#e2ded7',
          300: '#cfc9be',
          400: '#b5ab9c',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
