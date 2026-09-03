/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./*.html"],
  // Clases que agrega/saca el JS (cotizador, menús) — Tailwind no las ve en el HTML.
  safelist: [
    "hidden",
    "border-ice",
    "bg-ice/10",
    "opacity-40",
    "opacity-100",
    "cursor-not-allowed",
    "is-active",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de marca unificada (antes había 3 versiones distintas por página).
        ink: "#0A1128", // superficie oscura principal
        surface: "#111A33", // card elevada sobre oscuro
        regal: "#06113F", // azul profundo de marca (botones en claro)
        ice: "#38BDF8", // acento celeste
        "ice-deep": "#0EA5E9",
        gold: "#FACC15", // el "360" del wordmark
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      maxWidth: { content: "1200px" },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        aura: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.7)", opacity: "0" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        aura: "aura 2s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};
