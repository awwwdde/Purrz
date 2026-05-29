/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', '"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        /**
         * Ink scale — тёплый off-white фон + чёрный текст.
         * Сохраняем имена ink-50..ink-950 — старые страницы переедут автоматически.
         */
        ink: {
          950: "#0F1419",
          900: "#1A1F26",
          800: "#2A2F36",
          700: "#3C424A",
          600: "#5A6068",
          500: "#7A8089",
          400: "#9CA3AB",
          300: "#C3C8CE",
          200: "#E5E2D7", // тёплый бордер
          100: "#EFEEE5",
          50: "#FAFAF5",  // основной фон (cream-paper)
        },
        /**
         * Accent — emerald green. Имя оставляем accent чтобы не ломать legacy-классы.
         */
        accent: {
          DEFAULT: "#15803D",  // primary spot — благородный emerald
          soft: "#DCFCE7",     // tint фон для бейджей и hover
          dark: "#0E5C2C",
        },
        signal: {
          red: "#DC2626",
          green: "#15803D",
          blue: "#2563EB",
          yellow: "#D97706",
        },
      },
      borderRadius: {
        card: "20px",
        pill: "9999px",
      },
      boxShadow: {
        // Заменяем брутальные тени на мягкие
        brutal: "0 12px 32px -8px rgba(15, 20, 25, 0.12), 0 2px 6px rgba(15, 20, 25, 0.04)",
        "brutal-sm": "0 4px 14px -4px rgba(15, 20, 25, 0.08), 0 1px 3px rgba(15, 20, 25, 0.03)",
        soft: "0 8px 30px -10px rgba(15, 20, 25, 0.08)",
        lift: "0 24px 48px -16px rgba(15, 20, 25, 0.14)",
        ring: "0 0 0 4px rgba(21, 128, 61, 0.12)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "fade-up": "fade-up 0.6s ease forwards",
      },
    },
  },
  plugins: [],
};
