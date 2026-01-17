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
        // Accent for specific neuro-traits (e.g., "Hyperfocus" or "Success")
        accent: {
          sage: "#B2AC88", // Muted green that complements the pink
        },
      },
    },
  },
  plugins: [],
};

export default config;
