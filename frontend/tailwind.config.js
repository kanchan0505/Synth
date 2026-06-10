/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:      "#0a0a0b",
        bg2:     "#111113",
        bg3:     "#18181b",
        bg4:     "#222226",
        border:  "rgba(255,255,255,0.06)",
        border2: "rgba(255,255,255,0.094)",
        border3: "rgba(255,255,255,0.157)",
        text1:   "#f4f4f5",
        text2:   "#a1a1aa",
        text3:   "#71717a",
        blue:    "#3b82f6",
        blue2:   "#1d4ed8",
        purple:  "#8b5cf6",
        teal:    "#14b8a6",
        green:   "#22c55e",
        amber:   "#f59e0b",
        red:     "#ef4444",
      },
      fontFamily: {
        sans: ["-apple-system", "Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "10px",
        lg:      "16px",
      },
    },
  },
  plugins: [],
};
