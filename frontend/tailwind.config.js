/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#06162a',
          800: '#0B2545',
          700: '#133966',
          600: '#1D4E89',
        },
        brand: {
          teal: '#0D9488',
          tealDark: '#0F766E',
          tealLight: '#14B8A6',
        },
        surface: {
          bg: '#F3F7FA',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
        },
        risk: {
          low: '#10B981',
          moderate: '#F59E0B',
          high: '#F97316',
          severe: '#EF4444',
        }
      }
    },
  },
  plugins: [],
}
