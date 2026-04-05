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
        primaryClr: "#8C4830   ",       // deep black for text/nav B45309
        primaryClrLight: "#A65B4B ",  // softer black/charcoal for hover states c88653
        primaryClrDark: '#59331D',//#59331D 4c2000
        primaryClrText: '#f7f9fc',
        place: "605853",

        // Background neutral
        backgroundClr: "#D9D1D0",    // light ivory/neutral background
        bgDark: "#414144ff",
        bgDarkAll: "#393A3F",
        bgLight: "#FFFFFF",
        // Secondary accent (gold from logo)
        secondaryClr: "#C9AE9B",     // muted gold accent
        secondaryClrDark: "#B7937C", // darker gold for hover/active

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

