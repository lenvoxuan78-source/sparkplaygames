/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./about/**/*.html",
    "./best/**/*.html",
    "./contact/**/*.html",
    "./cookie/**/*.html",
    "./games/**/*.html",
    "./genre/**/*.html",
    "./privacy/**/*.html",
    "./terms/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: '#0ea5e9'
      }
    },
  },
  plugins: [],
}
