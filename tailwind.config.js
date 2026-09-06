/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#ffffff',
          100: '#fcfbf9',
          150: '#fbfaf7',
          200: '#f5f3ed',
          300: '#eeebe3',
          400: '#e5e2da',
          500: '#d6d2c7',
          600: '#cbc6b8',
        },
        ink: {
          950: '#0c0d0e',
          900: '#141517',
          850: '#1c1d20',
          800: '#27282b',
          700: '#383a3f',
          600: '#52555c',
          500: '#73767e',
          400: '#8f929a',
          300: '#b4b7bf',
          200: '#dcdfe5',
        },
        stone: {
          50: '#faf9f6',
          100: '#f5f4ef',
          200: '#e9e7df',
          300: '#dad7cc',
          400: '#b5b1a3',
          500: '#8c887b',
          600: '#68655b',
          700: '#4d4a42',
        },
        editorial: {
          accent: '#141517',
          terracotta: '#c85a32',
          olive: '#556b2f',
          navy: '#1b2a4a',
          amber: '#b45309',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        syne: ['Syne', 'Plus Jakarta Sans', 'sans-serif'],
        serifDisplay: ['Instrument Serif', 'Georgia', 'serif'],
        space: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      letterSpacing: {
        'tightest': '-0.035em',
        'widest-tech': '0.14em',
      },
      boxShadow: {
        'editorial': '0 2px 8px -2px rgba(20, 21, 23, 0.04), 0 12px 24px -6px rgba(20, 21, 23, 0.06)',
        'editorial-hover': '0 4px 16px -2px rgba(20, 21, 23, 0.08), 0 20px 32px -8px rgba(20, 21, 23, 0.1)',
      }
    },
  },
  plugins: [],
}
