import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        display: ["Rubik", "Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        accent: "#c8cdd3",
        surface: {
          DEFAULT: "#141417",
          raised: "#1a1a1f",
          hover: "#222228",
          border: "#2a2a32",
          light: "#32323c",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "floatSlow 10s ease-in-out infinite",
        "float-reverse": "floatReverse 8s ease-in-out infinite",
        "float-drift": "floatDrift 12s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },
        floatReverse: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(15px) rotate(-5deg)" },
        },
        floatDrift: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%": { transform: "translate(10px, -15px) rotate(3deg)" },
          "50%": { transform: "translate(-5px, -25px) rotate(-2deg)" },
          "75%": { transform: "translate(-10px, -10px) rotate(4deg)" },
        },
      },
    },
  },
  plugins: [],
};
