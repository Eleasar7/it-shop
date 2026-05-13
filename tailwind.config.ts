import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // NO darkMode class toggle for shop — admin handles its own dark via Tailwind utilities
  theme: {
    extend: {
      colors: {
        blue:    { DEFAULT: "#1a56db", dark: "#1043b2", light: "#eff4ff", mid: "#c7d9fb" },
        shop:    {
          border:   "#dadce0",
          surface1: "#f8f9fa",
          surface2: "#f1f3f4",
          text1:    "#3c4043",
          text2:    "#5f6368",
          text3:    "#80868b",
        },
        // Keep brand for admin
        brand: {
          50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc",
          400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca",
          800: "#3730a3", 900: "#312e81", 950: "#1e1b4b",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Segoe UI", "-apple-system", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      maxWidth: {
        "screen-xl": "1280px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,.06)",
        sm: "0 1px 4px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05)",
        DEFAULT: "0 2px 8px rgba(0,0,0,.10), 0 1px 3px rgba(0,0,0,.06)",
        lg: "0 4px 20px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.08)",
      },
      animation: {
        "fade-in":       "fadeIn .25s ease forwards",
        "slide-up":      "slideUp .3s cubic-bezier(.16,1,.3,1) forwards",
        "slide-in-right":"slideInRight .3s cubic-bezier(.16,1,.3,1) forwards",
        "shimmer":       "shimmer 1.6s linear infinite",
        "spin-slow":     "spin 8s linear infinite",
      },
      keyframes: {
        fadeIn:       { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:      { from: { transform: "translateY(12px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        slideInRight: { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        shimmer:      { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};

export default config;
