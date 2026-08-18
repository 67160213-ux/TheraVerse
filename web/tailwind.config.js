/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Active Clinical — Medical Teal (#00A896 / #028090)
        medical: {
          50: '#E6F6F5',
          100: '#B2E7E2',
          300: '#4DBEA3',
          500: '#00A896',
          700: '#028090',
          900: '#054A52',
        },
        // Mapped pine to Medical Teal for smooth compatibility
        pine: {
          50: '#E6F6F5',
          100: '#B2E7E2',
          300: '#00A896',
          500: '#00A896',
          700: '#028090',
          900: '#054A52',
        },
        // Active Clinical & Action Accents — Neon Lime (#CCFF00) & Bright Orange (#FF6B35)
        action: {
          lime: '#CCFF00',
          orange: '#FF6B35',
          400: '#FF6B35',
          600: '#E5531D',
          200: '#FFEBE3',
        },
        // Mapped gold to Bright Orange / Neon Lime for actions & discipline badges
        gold: {
          200: '#FFEBE3',
          400: '#FF6B35',
          500: '#CCFF00',
          600: '#E5531D',
        },
        // Gamified Energy — Dark Navy Smartwatch background (#0B132B / #1C2541)
        navy: {
          950: '#050B18',
          900: '#0B132B',
          800: '#1C2541',
          700: '#3A506B',
        },
        // Gamified Energy — Electric Cyan (#00E5FF)
        cyan: {
          400: '#00E5FF',
          500: '#00C2DA',
          900: '#00363D',
        },
        // Gamified Energy — Hot Pink / Magenta Cardio Pulse (#FF007F)
        magenta: {
          400: '#FF3399',
          500: '#FF007F',
          600: '#D6006B',
        },
        // Vital-sign semantics
        vital: {
          safe: '#00A896',
          caution: '#FF6B35',
          danger: '#FF007F',
        },
        paper: '#F8F9FA',
        ink: '#0F172A',
      },
      fontFamily: {
        display: ['"Kanit"', 'sans-serif'],
        body: ['"Noto Sans Thai"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 16px -2px rgba(2,128,144,0.08), 0 1px 3px rgba(15,23,42,0.05)',
        'card-dark': '0 8px 24px -4px rgba(0,0,0,0.5), 0 0 15px rgba(0,229,255,0.15)',
        'neon-cyan': '0 0 15px rgba(0, 229, 255, 0.4)',
        'neon-pink': '0 0 15px rgba(255, 0, 127, 0.4)',
        'neon-orange': '0 0 15px rgba(255, 107, 53, 0.4)',
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
        glowPulse: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 6px rgba(0,229,255,0.8))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 2px rgba(0,229,255,0.3))' },
        },
      },
      animation: {
        pulseLine: 'pulseLine 1.6s linear infinite',
        popIn: 'popIn 0.25s ease-out',
        glowPulse: 'glowPulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

