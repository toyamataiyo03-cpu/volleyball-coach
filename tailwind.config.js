/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        court: {
          green: '#15803d',
          line: '#86efac',
          dark: '#14532d',
        }
      }
    },
  },
  plugins: [],
}
