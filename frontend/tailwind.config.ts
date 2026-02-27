import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        // Background system
        surface: {
          base:    "#09090f",
          raised:  "#111118",
          overlay: "#18181f",
          border:  "#27272e",
          hover:   "#1e1e26",
        },
        // Text
        content: {
          primary:   "#f4f4f6",
          secondary: "#a1a1aa",
          muted:     "#52525b",
          inverse:   "#09090f",
        },
        // Accent
        accent: {
          purple: "#7c3aed",
          pink:   "#ec4899",
          cyan:   "#06b6d4",
          green:  "#10b981",
          amber:  "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter var", "Inter", "system-ui", "sans-serif"],
        display: ["Cal Sans", "Inter var", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial":   "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-brand":    "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
        "gradient-hero":     "linear-gradient(180deg, rgba(124,58,237,0.15) 0%, rgba(9,9,15,0) 60%)",
        "glass":             "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        "glow-brand":  "0 0 40px rgba(124,58,237,0.3), 0 0 80px rgba(124,58,237,0.1)",
        "glow-pink":   "0 0 40px rgba(236,72,153,0.3)",
        "card":        "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)",
        "player":      "0 -4px 40px rgba(0,0,0,0.6)",
        "inner-glow":  "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      animation: {
        "fade-in":       "fadeIn 0.3s ease-in-out",
        "slide-up":      "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-right":   "slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in":      "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "spin-slow":     "spin 8s linear infinite",
        "pulse-glow":    "pulseGlow 2s ease-in-out infinite",
        "marquee":       "marquee 20s linear infinite",
        "equalizer":     "equalizer 1.2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:   { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideRight:{ from: { opacity: "0", transform: "translateX(-16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        scaleIn:   { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        pulseGlow: { "0%, 100%": { boxShadow: "0 0 20px rgba(124,58,237,0.3)" }, "50%": { boxShadow: "0 0 40px rgba(124,58,237,0.6)" } },
        marquee:   { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        equalizer: {
          "0%, 100%": { height: "4px" },
          "25%": { height: "16px" },
          "50%": { height: "8px" },
          "75%": { height: "20px" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
