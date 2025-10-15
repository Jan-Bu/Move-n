/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0faf9',
          100: '#d4efee',
          200: '#a9dfdc',
          300: '#7dcfca',
          400: '#56a4a0',
          500: '#4a8f8b',
          600: '#3d7673',
          700: '#2f5a58',
          800: '#234542',
          900: '#1a3432',
        },
      },
    },
  },
  plugins: [],
};
