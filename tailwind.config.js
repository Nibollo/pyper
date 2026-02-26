/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#e53844",
        "background-light": "#f8f6f6",
        "background-dark": "#211112",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
    },
    container: {
      center: true,
      padding: '2.5rem',
    },
  },
  plugins: [],
}
