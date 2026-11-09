/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        success: '#16a34a',
        pending: '#f97316',
      }
    },
  },
  plugins: [],
}