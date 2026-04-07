/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand colors from logo
        primaryClr: "#031f54",       // deep black for text/nav B45309
        primaryClrLight: "#2d4b83ff",  // softer black/charcoal for hover states c88653
        primaryClrDark: '#59331D',//#59331D 4c2000
        primaryClrText: '#031f54',
        place: "605853",

        // Background neutral
        backgroundClr: "#b4d4dfff",    // light ivory/neutral background
        bgDark: "#eeeef3ff",
        bgDarkAll: "#b4d4dfff",
        // Secondary accent (gold from logo)
        secondaryClr: "#2d4b83ff",     // muted gold accent
        secondaryClrDark: "#2d4b83ff", // darker gold for hover/active

        // Success/confirmation accent
        accentClr: "#22e950ff",        // keep green for status badges
        accentClrDark: "#28A745",
        dangerClr: "#f72121ff",
        dangerClrDark: "#df5858ff",
        // Extra palette for consistency
        logoGold: "#C9AE9B",         // matches "by Ana" cursive
        logoBorder: "#FFD966",       // lighter gold for borders/highlights

        // Status colors
        status: {
          pending: "#F59E0B",
          progress: "#3B82F6",
          ready: "#10B981",
          paid: "#22C55E",
          danger: "#EF4444"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"]
      },
      boxShadow: {
        card: "0 2px 12px rgba(116, 40, 204, 0.08)"
      },
      borderRadius: {
        xl: "1rem"
      }
    }
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        'h1, h2, h3, h4, h5': {
          'letter-spacing': '0.25em',
          'textTransform': 'capitalize',
        },
      })
    })
  ]
}

