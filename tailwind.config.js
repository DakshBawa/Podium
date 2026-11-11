export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { stage: "#0f0d0b", panel: "#1a1714", edge: "#2f2a24", cream: "#f5efe6", amber: { DEFAULT: "#ffb020" }, coral: "#ff6b4a", good: "#5ad19a" },
      fontFamily: { sans: ['"Space Grotesk"', "system-ui", "sans-serif"], mono: ['"JetBrains Mono"', "ui-monospace", "monospace"] },
    },
  },
  plugins: [],
};
