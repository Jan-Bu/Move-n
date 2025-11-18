/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fafa',      // Velmi světlá
          100: '#e0f5f5',     // Světlá
          200: '#c8ebec',     // Světlejší
          300: '#a7dbdd',     // 4. barva
          400: '#84cdcf',     // Terciární
          500: '#4FB7BB',     // Primární rgba(79, 183, 187)
          600: '#47a5a8',     // Sekundární
          700: '#3a8688',     // Tmavší
          800: '#2d6668',     // Tmavá
          900: '#204a4c',     // Velmi tmavá
        },
        primary: {
          DEFAULT: '#4FB7BB', // rgba(79, 183, 187)
        },
        secondary: {
          DEFAULT: '#47a5a8',
        },
        tertiary: {
          DEFAULT: '#84cdcf',
        },
        accent: {
          DEFAULT: '#a7dbdd',
        },
        cta: {
          DEFAULT: '#B45E9F', // rgba(180, 94, 159)
          hover: '#a0508c',   // Tmavší pro hover
        },
      },
      fontFamily: {
        'script': ['Segoe Script', 'cursive'],
        'heading': ['Tw Cen MT', 'system-ui', 'sans-serif'],
        'sans': ['Tw Cen MT', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
