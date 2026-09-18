import type { Config } from "tailwindcss";

/**
 * Al-Aniqa Lux design system.
 * Palette is derived directly from the official logo:
 *   - Deep wine / burgundy background ......... #6E1529  (primary)
 *   - Ivory / cream glyph ..................... #F4E3C1  (accent surface)
 *   - Warm gold hairline ...................... #C4A05A  (accent)
 * No colour outside this family is used anywhere in the product.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1360px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        /** Brand ramp — the logo's wine red */
        wine: {
          50: "#FBF1F3",
          100: "#F5DEE3",
          200: "#E4B3BE",
          300: "#CE8493",
          400: "#AC4A60",
          500: "#8E2A42",
          600: "#7A1B2E",
          700: "#6E1529",
          800: "#5A0F20",
          900: "#400A17",
          950: "#2A0610",
        },
        /** The logo's ivory glyph tone */
        cream: {
          50: "#FFFCF6",
          100: "#FBF4E6",
          200: "#F4E3C1",
          300: "#EBD5A8",
          400: "#DFC28A",
        },
        /** Warm gold, used for hairlines and accents only */
        gold: {
          300: "#E0C68F",
          400: "#D2B173",
          500: "#C4A05A",
          600: "#A9843F",
          700: "#87672F",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Jost", "Inter", "system-ui", "sans-serif"],
        arabic: ['"Noto Kufi Arabic"', '"Cairo"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(64,10,23,.04), 0 8px 24px -12px rgba(64,10,23,.10)",
        card: "0 1px 3px rgba(64,10,23,.05), 0 18px 40px -24px rgba(64,10,23,.22)",
        luxe: "0 24px 60px -28px rgba(64,10,23,.38)",
        inset: "inset 0 1px 0 rgba(255,255,255,.55)",
      },
      letterSpacing: {
        luxe: "0.18em",
        wide2: "0.32em",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up .6s cubic-bezier(.22,1,.36,1) both",
        "fade-in": "fade-in .5s ease both",
        "scale-in": "scale-in .35s cubic-bezier(.22,1,.36,1) both",
        shimmer: "shimmer 1.8s infinite",
        marquee: "marquee 32s linear infinite",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(.22,1,.36,1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
