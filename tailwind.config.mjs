/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,jsx}",
    "./core/**/*.{js,jsx}",
    "./features/**/*.{js,jsx}",
    "./shared/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: {
          DEFAULT: "#141414",
          elevated: "#171717",
          subtle: "#1f1f1f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
