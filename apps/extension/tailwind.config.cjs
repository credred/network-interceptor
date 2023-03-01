/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "color-content": "rgb(188 188 188)",
        "color-subtitle": "rgb(179 179 179)",
      },
    },
  },
  plugins: [],
};
