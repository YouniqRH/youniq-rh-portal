import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        brand: {
          purple: "#5f2e81",
          "purple-700": "#4a2566",
          "purple-300": "#8b5fb0",
          cream: "#efe7d8",
          "cream-2": "#f6f0e3",
          gold: "#b9985a",
          "gold-2": "#d4b97a",
          sidebar: "#1d1530",
          "sidebar-2": "#261a3d",
        },
        ink: { DEFAULT: "#1f1a2b", muted: "#6c6577" },
        surface: { DEFAULT: "#ffffff", 2: "#faf6ec" },
        success: "#2f9e6d",
        danger: "#d04848",
        warn: "#c48a36",
        info: "#3c6dbf",
      },
      fontFamily: {
        sans:  ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(31,26,43,.06), 0 1px 3px rgba(31,26,43,.04)",
        card: "0 6px 18px rgba(31,26,43,.07), 0 2px 6px rgba(31,26,43,.05)",
        lg: "0 24px 60px rgba(31,26,43,.12)",
      },
      // Cantos mais discretos: visual mais editorial / corporativo
      borderRadius: {
        sm: "3px",
        DEFAULT: "5px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "14px",
        "3xl": "18px",
      },
    },
  },
  plugins: [],
} satisfies Config;
