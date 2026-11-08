/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // One neutral scale for the whole app: any stray `gray-*` renders as `slate-*`.
        gray: colors.slate,
      },
    },
  },
  plugins: [],
}
