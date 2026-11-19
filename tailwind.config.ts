import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1280px" } },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        mint: { DEFAULT: "hsl(var(--mint))", soft: "hsl(var(--mint-soft))", foreground: "hsl(var(--mint-foreground))" },
        warm: { DEFAULT: "hsl(var(--warm))", soft: "hsl(var(--warm-soft))" },
        navy: "hsl(var(--navy))",
        whatsapp: { DEFAULT: "#25D366", dark: "#075E54", bubble: "#DCF8C6", bg: "#ECE5DD" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15, 40, 80, 0.18)",
        glow: "0 0 0 6px rgba(239, 68, 68, 0.15)",
      },
      keyframes: {
        "sos-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0.55)" },
          "50%": { boxShadow: "0 0 0 18px rgba(239,68,68,0)" },
        },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        scan: { "0%": { top: "8%" }, "100%": { top: "88%" } },
      },
      animation: {
        "sos-pulse": "sos-pulse 1.4s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        scan: "scan 1.2s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [animate],
};

export default config;
