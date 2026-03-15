import type { Config } from "tailwindcss";
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest:       "#0e2d1a",
        "forest-mid": "#1a4428",
        "forest-light":"#2d6b42",
        sage:         "#5a8f6a",
        mint:         "#a8d5b5",
        cream:        "#f5f0e8",
        "warm-white": "#faf8f4",
        gold:         "#c8a84b",
        "gold-light": "#e8d08a",
        border:       "#d4cfc4",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans:    ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        xl:  "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
} satisfies Config;
