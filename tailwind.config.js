/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: "#343a40",
        header: "#2c3e50",
        primary: "#3498db",
        bgmain: "#f3f4f6",
        danger: "#e74c3c",
        warning: "#f39c12",
        info: "#17a2b8",
      },
    },
  },
  plugins: [],
};
