/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-raised": "var(--paper-raised)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        rule: "var(--rule)",
        brass: "var(--brass)",
        "brass-soft": "var(--brass-soft)",
        canvas: "var(--canvas)",
        danger: "var(--danger)",
        success: "var(--success)",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Source Sans 3'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        ledger: "0 1px 0 rgba(28,37,65,0.06), 0 8px 24px -12px rgba(28,37,65,0.25)",
        stamp: "0 2px 6px rgba(169,118,31,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "stamp-in": {
          "0%": { opacity: 0, transform: "scale(1.6) rotate(-8deg)" },
          "60%": { opacity: 1, transform: "scale(0.95) rotate(-8deg)" },
          "100%": { opacity: 1, transform: "scale(1) rotate(-8deg)" },
        },
        blink: {
          "0%, 80%, 100%": { opacity: 0.25 },
          "40%": { opacity: 1 },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "stamp-in": "stamp-in 0.4s cubic-bezier(.36,1.4,.6,1) both",
        blink: "blink 1.4s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
