/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep clinical pine — trust, calm, the "doctor" voice
        pine: {
          50: '#EEF5F3',
          100: '#D6E7E2',
          300: '#7FAFA5',
          500: '#2E7A6E',
          700: '#0F5C56',
          900: '#0A3B37',
        },
        // Warm supportive moss, secondary clinical accent
        moss: {
          400: '#8FAE87',
          600: '#5C7D55',
        },
        // Reward gold — coins, badges, "Token of Discipline" — kept distinct from terracotta
        gold: {
          200: '#F3E1AE',
          400: '#E2B24B',
          600: '#B8811F',
        },
        // Vital-sign semantics
        vital: {
          safe: '#2F9E5B',
          caution: '#D6A526',
          danger: '#C23B2E',
        },
        paper: '#F1F4F0',
        ink: '#182523',
      },
      fontFamily: {
        display: ['"Kanit"', 'sans-serif'],
        body: ['"Noto Sans Thai"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(24,37,35,0.06), 0 8px 24px -12px rgba(24,37,35,0.18)',
      },
      keyframes: {
        pulseLine: {
          '0%, 100%': { strokeDashoffset: '0' },
          '50%': { strokeDashoffset: '-40' },
        },
        popIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        pulseLine: 'pulseLine 1.6s linear infinite',
        popIn: 'popIn 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
