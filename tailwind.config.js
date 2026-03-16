/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
module.exports = {
  theme: {
    extend: {
      colors: {
        neonGreen: '#39FF14',
        neonBlue: '#00F3FF',
        darkBg: '#050505',
        cardBg: '#111111',
      },
      boxShadow: {
        neon: '0 0 10px #39FF14, 0 0 5px #39FF14',
      }
    },
  },
}