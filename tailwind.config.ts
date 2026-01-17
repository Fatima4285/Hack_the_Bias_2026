import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FFF9F9",
        primary: "#E29595",
        secondary: "#FFF0F0",
        ink: "#2D2D2D",
        accent: "#B2AC88",
        // The core "Pink" identity
        brand: {
          light: "#FFF0F0", // Very pale for card backgrounds/hovers
          DEFAULT: "#E29595", // Your main Dusty Rose action color
          dark: "#B87373", // For active states or borders
        },
        // Neuro-inclusive neutrals
        surface: {
          canvas: "#FFF9F9", // The main page background (off-white pink)
          card: "#FFFFFF", // Pure white for content containers
        },
        // Text colors (avoiding pure #000 for sensory ease)
        neutral: {
          heading: "#2D2D2D", // Deep charcoal for readability
          body: "#4A4A4A", // Softer gray for long-form text
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
