import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#C96727", // warm clay accent
        },
        warm: {
          beige: "#F6F2EB",
          lavender: "#DAD7F1",
          mustard: "#E2B04A",
        },
        earth: {
          olive: "#2F3E2E",
          clay: "#C96727",
        },
        ink: "#111111",
        charcoal: "#333333",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
